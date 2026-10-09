ALTER TABLE "nexhse_shop_orders"
  ADD COLUMN IF NOT EXISTS "stripe_session_id" text,
  ADD COLUMN IF NOT EXISTS "stripe_checkout_url" text,
  ADD COLUMN IF NOT EXISTS "mpesa_checkout_request_id" text,
  ADD COLUMN IF NOT EXISTS "payment_reference" text,
  ADD COLUMN IF NOT EXISTS "payment_status_token_hash" text;

CREATE UNIQUE INDEX IF NOT EXISTS "nexhse_shop_orders_stripe_session_idx"
  ON "nexhse_shop_orders" ("stripe_session_id");

CREATE UNIQUE INDEX IF NOT EXISTS "nexhse_shop_orders_mpesa_request_idx"
  ON "nexhse_shop_orders" ("mpesa_checkout_request_id");