CREATE TABLE IF NOT EXISTS "nexhse_quotes" (
  "id" text PRIMARY KEY,
  "quote_number" text NOT NULL UNIQUE,
  "client_id" text,
  "client_name" text NOT NULL,
  "company" text NOT NULL DEFAULT '',
  "email" text NOT NULL,
  "phone" text NOT NULL DEFAULT '',
  "need" text NOT NULL,
  "location" text NOT NULL DEFAULT '',
  "timeline" text NOT NULL DEFAULT '',
  "amount" integer NOT NULL DEFAULT 0,
  "currency" text NOT NULL DEFAULT 'KES',
  "status" text NOT NULL DEFAULT 'requested',
  "valid_until" timestamptz,
  "created_by" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "nexhse_quotes_status_created_idx"
  ON "nexhse_quotes" ("status", "created_at");
CREATE INDEX IF NOT EXISTS "nexhse_quotes_client_idx"
  ON "nexhse_quotes" ("client_id", "created_at");

CREATE TABLE IF NOT EXISTS "nexhse_invoices" (
  "id" text PRIMARY KEY,
  "invoice_number" text NOT NULL UNIQUE,
  "quote_id" text NOT NULL,
  "quote_number" text NOT NULL,
  "client_id" text,
  "client_name" text NOT NULL,
  "company" text NOT NULL DEFAULT '',
  "email" text NOT NULL,
  "phone" text NOT NULL DEFAULT '',
  "description" text NOT NULL,
  "amount" integer NOT NULL,
  "currency" text NOT NULL DEFAULT 'KES',
  "status" text NOT NULL DEFAULT 'issued',
  "due_at" timestamptz,
  "created_by" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "nexhse_invoices_status_due_idx"
  ON "nexhse_invoices" ("status", "due_at");
CREATE INDEX IF NOT EXISTS "nexhse_invoices_client_idx"
  ON "nexhse_invoices" ("client_id", "created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "nexhse_invoices_quote_idx"
  ON "nexhse_invoices" ("quote_id");