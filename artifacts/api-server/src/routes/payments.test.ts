import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-expect-error Node's strip-types test runner imports the TypeScript source directly.
import { getPaymentGatewayStatus, normalizeKenyanPhone } from '../../../../lib/api/payment-config.ts';
// @ts-expect-error Node's strip-types test runner imports the TypeScript source directly.
import { getPublicSupabaseConfig } from '../../../../lib/api/supabase.ts';

test('stripe is marked enabled only when the secret key is configured', () => {
  assert.equal(getPaymentGatewayStatus({}).stripeEnabled, false);
  assert.equal(getPaymentGatewayStatus({ STRIPE_SECRET_KEY: 'sk_test_123', STRIPE_WEBHOOK_SECRET: 'whsec_123' }).stripeReady, true);
});

test('mpesa is marked enabled only when its credentials are configured', () => {
  assert.equal(getPaymentGatewayStatus({}).mpesaEnabled, false);
  const status = getPaymentGatewayStatus({ MPESA_CONSUMER_KEY: 'key', MPESA_CONSUMER_SECRET: 'secret', MPESA_SHORTCODE: '174379', MPESA_PASSKEY: 'pass', MPESA_CALLBACK_URL: 'https://example.test/callback', MPESA_CALLBACK_TOKEN: 'token' });
  assert.equal(status.mpesaEnabled, true);
  assert.equal(status.mpesaReady, true);
});

test('Kenyan mobile numbers normalize for STK push', () => {
  assert.equal(normalizeKenyanPhone('0712 345 678'), '254712345678');
  assert.equal(normalizeKenyanPhone('+254 712 345 678'), '254712345678');
  assert.equal(normalizeKenyanPhone('555123'), null);
});

test('prefixed Supabase env config exposes only public credentials', () => {
  const keys = ['nexhsevo_SUPABASE_URL', 'nexhsevo_SUPABASE_ANON_KEY', 'nexhsevo_SUPABASE_SERVICE_ROLE_KEY'] as const;
  const previous = keys.map(key => process.env[key]);
  try {
    process.env[keys[0]] = 'https://project.supabase.co';
    process.env[keys[1]] = 'public-anon-key';
    process.env[keys[2]] = 'server-only-key';
    const config = getPublicSupabaseConfig();
    assert.deepEqual(config, { url: 'https://project.supabase.co', anonKey: 'public-anon-key' });
    assert.equal('serviceRoleKey' in (config ?? {}), false);
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});
