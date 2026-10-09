import { createMpesaStkPush, createStripeCheckout, processMpesaCallback, processStripeWebhook, readOrderPaymentStatus } from '../lib/api/payments.js';
import { getPaymentGatewayStatus } from '../lib/api/payment-config.js';
import { isTrustedOrigin } from '../lib/api/admin-session.js';

export const config = { api: { bodyParser: false } };

function normalizeAction(req: any) {
  const action = Array.isArray(req.query?.action) ? req.query.action[0] : req.query?.action;
  if (action) return String(action);
  const pathname = typeof req.url === 'string' ? req.url.split('?')[0] : '';
  if (pathname.endsWith('/stripe/webhook')) return 'stripe-webhook';
  if (pathname.endsWith('/mpesa/callback')) return 'mpesa-callback';
  if (pathname.endsWith('/stripe/create-checkout-session')) return 'stripe-create-checkout';
  if (pathname.endsWith('/mpesa/stk-push')) return 'mpesa-stk-push';
  if (pathname.endsWith('/order-status')) return 'order-status';
  if (pathname.endsWith('/config')) return 'config';
  return '';
}

async function readPayload(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null && typeof req.body !== 'string') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (typeof req.readable === 'object' && req.readable !== null) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    const raw = Buffer.concat(chunks);
    try {
      return JSON.parse(raw.toString('utf8'));
    } catch {
      return raw;
    }
  }
  return {};
}

async function readRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  const action = normalizeAction(req);

  if (req.method === 'OPTIONS') return res.status(204).end();

  switch (action) {
    case 'config':
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return res.status(200).json(getPaymentGatewayStatus());

    case 'order-status': {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      res.setHeader('Cache-Control', 'private, no-store');
      try {
        const orderId = Array.isArray(req.query?.orderId) ? req.query.orderId[0] : req.query?.orderId;
        const token = Array.isArray(req.query?.token) ? req.query.token[0] : req.query?.token;
        return res.status(200).json(await readOrderPaymentStatus(String(orderId ?? ''), String(token ?? '')));
      } catch (error) {
        const issue = error as { statusCode?: number; message?: string };
        return res.status(issue.statusCode ?? 502).json({ error: issue.message ?? 'Payment status could not be read.' });
      }
    }

    case 'stripe-create-checkout': {
      if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed.' });
      if (!isTrustedOrigin(req)) return res.status(403).json({ ok: false, message: 'Untrusted origin.' });
      try {
        const payload = await readPayload(req);
        const origin = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
        return res.status(200).json(await createStripeCheckout(String(payload?.orderId ?? ''), String(payload?.paymentStatusToken ?? ''), String(origin ?? '')));
      } catch (error) {
        const issue = error as { statusCode?: number; message?: string };
        return res.status(issue.statusCode ?? 502).json({ ok: false, message: issue.message ?? 'Stripe checkout could not be started.' });
      }
    }

    case 'mpesa-stk-push': {
      if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed.' });
      if (!isTrustedOrigin(req)) return res.status(403).json({ ok: false, message: 'Untrusted origin.' });
      try {
        const payload = await readPayload(req);
        return res.status(200).json(await createMpesaStkPush(String(payload?.orderId ?? ''), String(payload?.paymentStatusToken ?? '')));
      } catch (error) {
        const issue = error as { statusCode?: number; message?: string };
        return res.status(issue.statusCode ?? 502).json({ ok: false, message: issue.message ?? 'M-Pesa STK push could not be started.' });
      }
    }

    case 'stripe-webhook': {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      try {
        const signature = Array.isArray(req.headers['stripe-signature']) ? req.headers['stripe-signature'][0] : req.headers['stripe-signature'];
        return res.status(200).json(await processStripeWebhook(await readRawBody(req), signature));
      } catch (error) {
        const issue = error as { statusCode?: number; message?: string };
        return res.status(issue.statusCode ?? 502).json({ error: issue.message ?? 'Stripe webhook could not be processed.' });
      }
    }

    case 'mpesa-callback': {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      try {
        const token = Array.isArray(req.query?.token) ? req.query.token[0] : req.query?.token;
        const payload = await readPayload(req);
        return res.status(200).json(await processMpesaCallback(token, payload));
      } catch (error) {
        const issue = error as { statusCode?: number; message?: string };
        return res.status(issue.statusCode ?? 502).json({ error: issue.message ?? 'M-Pesa callback could not be processed.' });
      }
    }

    default:
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return res.status(200).json(getPaymentGatewayStatus());
  }
}
