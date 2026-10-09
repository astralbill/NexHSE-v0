export type PaymentGatewayStatus = {
  stripeEnabled: boolean;
  stripeReady: boolean;
  mpesaEnabled: boolean;
  mpesaReady: boolean;
  requiresConfiguration: boolean;
  mode: 'live' | 'sandbox' | 'unconfigured';
};

export function getPaymentGatewayStatus(env: Record<string, string | undefined> = process.env): PaymentGatewayStatus {
  const stripeSecret = env.STRIPE_SECRET_KEY ?? env.STRIPE_API_KEY ?? '';
  const stripeEnabled = stripeSecret.startsWith('sk_');
  const mpesaCredentialsPresent = Boolean(env.MPESA_CONSUMER_KEY && env.MPESA_CONSUMER_SECRET && env.MPESA_SHORTCODE && env.MPESA_PASSKEY);
  const mpesaEnabled = mpesaCredentialsPresent;
  const stripeReady = stripeEnabled && Boolean(env.STRIPE_WEBHOOK_SECRET);
  const mpesaReady = mpesaEnabled && Boolean(env.MPESA_CALLBACK_URL && env.MPESA_CALLBACK_TOKEN);
  const stripeMode = stripeSecret.startsWith('sk_live_') ? 'live' : stripeEnabled ? 'sandbox' : 'unconfigured';
  const mode = stripeEnabled ? stripeMode : mpesaEnabled ? (env.MPESA_ENVIRONMENT === 'production' ? 'live' : 'sandbox') : 'unconfigured';
  const anyReady = stripeReady || mpesaReady;

  return {
    stripeEnabled,
    stripeReady,
    mpesaEnabled,
    mpesaReady,
    requiresConfiguration: !anyReady,
    mode,
  };
}

export function normalizeKenyanPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}