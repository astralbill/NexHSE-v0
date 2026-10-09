import { Router } from 'express';
import { getPaymentGatewayStatus } from '../../../../lib/api/payment-config';
import { createMpesaStkPush, createStripeCheckout, processMpesaCallback, processStripeWebhook, readOrderPaymentStatus } from '../../../../lib/api/payments';
import { isTrustedOrigin } from '../../../../lib/api/admin-session';

const router = Router();

function sendPaymentError(res: any, error: unknown) {
  const issue = error as { statusCode?: number; message?: string };
  return res.status(issue.statusCode ?? 502).json({ ok: false, message: issue.message ?? 'Payment provider request failed.' });
}

router.get('/payments/config', (_req, res) => {
  res.status(200).json(getPaymentGatewayStatus());
});

router.get('/payments/order-status', async (req, res) => {
  res.setHeader('Cache-Control', 'private, no-store');
  try {
    return res.status(200).json(await readOrderPaymentStatus(String(req.query.orderId ?? ''), String(req.query.token ?? '')));
  } catch (error) {
    return sendPaymentError(res, error);
  }
});

router.post('/payments/stripe/create-checkout-session', async (req, res) => {
  if (!isTrustedOrigin(req)) return res.status(403).json({ ok: false, message: 'Untrusted origin.' });
  try {
    return res.status(200).json(await createStripeCheckout(String(req.body?.orderId ?? ''), String(req.body?.paymentStatusToken ?? ''), String(req.headers.origin ?? '')));
  } catch (error) {
    return sendPaymentError(res, error);
  }
});

router.post('/payments/mpesa/stk-push', async (req, res) => {
  if (!isTrustedOrigin(req)) return res.status(403).json({ ok: false, message: 'Untrusted origin.' });
  try {
    return res.status(200).json(await createMpesaStkPush(String(req.body?.orderId ?? ''), String(req.body?.paymentStatusToken ?? '')));
  } catch (error) {
    return sendPaymentError(res, error);
  }
});

router.post('/payments/stripe/webhook', async (req, res) => {
  try {
    const rawBody = (req as any).rawBody;
    if (!Buffer.isBuffer(rawBody)) return res.status(400).json({ error: 'Raw Stripe webhook body is unavailable.' });
    const signature = req.headers['stripe-signature'];
    return res.status(200).json(await processStripeWebhook(rawBody, Array.isArray(signature) ? signature[0] : signature));
  } catch (error) {
    return sendPaymentError(res, error);
  }
});

router.post('/payments/mpesa/callback', async (req, res) => {
  try {
    return res.status(200).json(await processMpesaCallback(req.query.token, req.body));
  } catch (error) {
    return sendPaymentError(res, error);
  }
});

export default router;
