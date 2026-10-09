# Supabase Auth and Edge with Neon

Neon remains the source of truth for application data. The Drizzle schema in `lib/db/src/schema` is shared by the existing Node APIs and the Neon HTTP adapter in `lib/db/src/edge.ts`; Supabase Postgres is not a second application database and should not receive a separately maintained copy of these tables.

## Authentication

The admin login endpoint validates Supabase Auth credentials, then checks the normalized email against the active admin record in Neon. The role and account-active flag always come from Neon. On the default `SUPABASE_AUTH_MODE=hybrid`, an existing Neon admin who signs in with their current password is provisioned into Supabase Auth through the server-only service-role key. Existing Supabase users must authenticate successfully with Supabase; their password is not silently checked against the legacy hash after a Supabase login failure.

After active admins have signed in and been provisioned, set `SUPABASE_AUTH_MODE=required` to disable legacy-password fallback. Use `legacy` only as a temporary rollback switch.

## Environment

Set these standard variable names in Vercel and local development. The Node API accepts the standard names plus `v0_` and legacy `nexhsevo_`-prefixed aliases.

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never use a `VITE_` prefix)
- `SUPABASE_AUTH_MODE` (`hybrid`, `required`, or `legacy`)
- `DATABASE_URL` (Neon pooled connection URL)
- `SITE_ALLOWED_ORIGINS` when adding custom web origins

Admin login also uses `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` for the owner account/session signing. `ADMIN_API_KEY` is an alternative owner credential. These values and the Neon connection string may use the same `v0_` or `nexhsevo_` prefix.

The Supabase Edge Function receives `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, and optionally `SITE_ALLOWED_ORIGINS` from Supabase project secrets/runtime configuration. It does not need the service-role key: requests require a verified Supabase user token, and data is read from Neon through the restricted order-history query.

## Schema and deployment

Apply table changes through the canonical Neon schema, never by manually recreating the tables in Supabase:

```sh
pnpm --filter @workspace/db run push
```

For production, apply the reviewed additive SQL migration rather than using the development-only push command:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/migrations/0001_payment_provider_columns.sql
```

Apply the CRM quotation and invoice tables before deploying the sales workspace:

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f lib/db/migrations/0002_crm_quotes_invoices.sql
```

Then link the Supabase CLI to the intended project, set its runtime secrets, and deploy the function:

```sh
supabase link --project-ref <project-ref>
supabase secrets set DATABASE_URL=<neon-pooled-url> SUPABASE_URL=<project-url> SUPABASE_ANON_KEY=<anon-key>
supabase functions deploy order-history
```

Configure Supabase Auth email/password sign-in and allowed redirect URLs for the deployed NexHSE hosts. The function is configured with JWT verification enabled and also validates the token with Supabase Auth before querying Neon. Its browser client helper is `artifacts/nexhse-africa/src/lib/supabase.ts`.

The Vercel Edge equivalent is available at `/api/edge/order-history`; it uses the same DB adapter and validates the bearer token with Supabase Auth.