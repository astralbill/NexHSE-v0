import { createHash, timingSafeEqual } from 'node:crypto';
import Stripe from 'stripe';
import { completeShopOrderMpesaRequest, findShopOrder, findShopOrderByMpesaRequestId, findShopOrderPaymentStatus, hasShopOrderPaymentToken, releaseShopOrderMpesaRequest, reserveShopOrderMpesaRequest, saveShopOrderPaymentReference, updateShopOrderPaymentStatus } from '@workspace/db';
import { getPaymentGatewayStatus, normalizeKenyanPhone } from './payment-config.js';

type PaymentError = Error & { statusCode: number };

function paymentError(message: string, statusCode = 400): PaymentError {
  return Object.assign(new Error(message), { statusCode });
}

function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_API_KEY;
  if (!secret || !getPaymentGatewayStatus().stripeReady) throw paymentError('Stripe is not fully configured.', 503);
  return new Stripe(secret, { timeout: 15_000 });
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
  } catch { return false; }
}

export async function createStripeCheckout(orderId: string, statusToken: string, origin: string) {
  if (!orderId || !isHttpsUrl(origin)) throw paymentError('A valid order and storefront origin are required.');
  if (!statusToken || !await hasShopOrderPaymentToken(orderId, statusToken)) throw paymentError('Order payment authorization failed.', 403);
  const order = await findShopOrder(orderId);
  if (!order) throw paymentError('Order not found.', 404);
  if (order.paymentMethod !== 'Card') throw paymentError('This order is not configured for card payment.', 409);
  if (order.paymentStatus === 'paid' || order.orderStatus === 'cancelled') throw paymentError('This order cannot be paid.', 409);

  const stripe = stripeClient();
  if (order.stripeSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (existingSession.status === 'open' && existingSession.url) {
      return { ok: true, provider: 'stripe', redirectUrl: existingSession.url, sessionId: existingSession.id };
    }
    if (existingSession.status === 'complete') throw paymentError('Payment is processing confirmation for this order.', 409);
  }
  const items = Array.isArray(order.items) ? order.items as { name: string; quantity: number; price: number }[] : [];
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
    quantity: item.quantity,
    price_data: {
      currency: 'kes',
      unit_amount: Math.round(item.price * 100),
      product_data: { name: item.name },
    },
  }));
  if (order.deliveryFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'kes',
        unit_amount: Math.round(order.deliveryFee * 100),
        product_data: { name: 'Delivery' },
      },
    });
  }
  const chargedTotal = lineItems.reduce((sum, item) => sum + (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 0), 0);
  if (!lineItems.length || order.total < 1 || chargedTotal !== order.total * 100 || lineItems.some(item => !item.price_data || !item.quantity || item.price_data.unit_amount == null || item.price_data.unit_amount < 0)) {
    throw paymentError('Order contents are invalid for payment.', 409);
  }

  const base = new URL(origin);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: order.email,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    payment_intent_data: { metadata: { orderId: order.id } },
    success_url: new URL(`/checkout?payment=success&order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(statusToken)}`, base).toString(),
    cancel_url: new URL(`/checkout?payment=cancelled&order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(statusToken)}`, base).toString(),
  }, { idempotencyKey: `nexhse-order-${order.id}-${order.stripeSessionId ? Date.now() : 'initial'}` });
  if (!session.url) throw paymentError('Stripe did not return a checkout URL.', 502);
  await saveShopOrderPaymentReference(order.id, { stripeSessionId: session.id, stripeCheckoutUrl: session.url });
  return { ok: true, provider: 'stripe', redirectUrl: session.url, sessionId: session.id };
}

function darajaBaseUrl() {
  return process.env.MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
}

function darajaTimestamp() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

let darajaToken: { value: string; expiresAt: number } | null = null;

async function getDarajaToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw paymentError('M-Pesa is not fully configured.', 503);
  if (darajaToken && darajaToken.expiresAt > Date.now() + 30_000) return darajaToken.value;

  const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
  const response = await fetch(`${darajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json() as { access_token?: string; expires_in?: string; errorMessage?: string };
  if (!response.ok || !result.access_token) throw paymentError(result.errorMessage ?? 'M-Pesa authentication failed.', 502);
  darajaToken = { value: result.access_token, expiresAt: Date.now() + Number(result.expires_in ?? 3600) * 1000 };
  return darajaToken.value;
}

export async function createMpesaStkPush(orderId: string, statusToken: string) {
  if (!getPaymentGatewayStatus().mpesaReady) throw paymentError('M-Pesa is not fully configured.', 503);
  if (!statusToken || !await hasShopOrderPaymentToken(orderId, statusToken)) throw paymentError('Order payment authorization failed.', 403);
  const order = await findShopOrder(orderId);
  if (!order) throw paymentError('Order not found.', 404);
  if (order.paymentMethod !== 'M-Pesa') throw paymentError('This order is not configured for M-Pesa.', 409);
  if (order.paymentStatus === 'paid' || order.orderStatus === 'cancelled') throw paymentError('This order cannot be paid.', 409);
  if (!Number.isInteger(order.total) || order.total < 1) throw paymentError('Order total must be a positive whole KES amount.', 409);
  const phone = normalizeKenyanPhone(order.phone);
  if (!phone) throw paymentError('Order phone number must be a valid Kenyan mobile number.');

  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const callback = new URL(process.env.MPESA_CALLBACK_URL!);
  if (callback.protocol !== 'https:') throw paymentError('M-Pesa callback URL must use HTTPS.', 503);
  callback.searchParams.set('token', process.env.MPESA_CALLBACK_TOKEN!);
  const accessToken = await getDarajaToken();
  const reservationId = await reserveShopOrderMpesaRequest(order.id);
  if (!reservationId) throw paymentError('An M-Pesa request is already in progress or has been sent for this order.', 409);
  const response = await fetch(`${darajaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE ?? 'CustomerPayBillOnline',
      Amount: order.total,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callback.toString(),
      AccountReference: order.id.slice(0, 12),
      TransactionDesc: `NexHSE ${order.id}`.slice(0, 20),
    }),
  });
  const result = await response.json() as { ResponseCode?: string; CheckoutRequestID?: string; errorMessage?: string; ResponseDescription?: string };
  if (!response.ok || result.ResponseCode !== '0' || !result.CheckoutRequestID) {
    await releaseShopOrderMpesaRequest(order.id, reservationId);
    throw paymentError(result.errorMessage ?? result.ResponseDescription ?? 'M-Pesa could not start the STK prompt.', 502);
  }
  const savedOrder = await completeShopOrderMpesaRequest(order.id, reservationId, result.CheckoutRequestID);
  if (!savedOrder) throw paymentError('M-Pesa request started, but its reference could not be saved. Contact support before retrying.', 503);
  return { ok: true, provider: 'mpesa', checkoutRequestId: result.CheckoutRequestID, message: 'M-Pesa prompt sent. Approve the payment on your phone.' };
}

export async function processStripeWebhook(rawBody: Buffer, signature: string | undefined) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signature) throw paymentError('Stripe webhook signature is missing.', 400);
  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    throw paymentError('Stripe webhook signature is invalid.', 400);
  }

  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.expired'].includes(event.type)) {
    return { received: true, ignored: true };
  }
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;
  if (!orderId) throw paymentError('Stripe session does not identify an order.', 400);
  const order = await findShopOrder(orderId);
  if (!order || order.stripeSessionId !== session.id) throw paymentError('Stripe session does not match an active order.', 404);
  if (event.type === 'checkout.session.expired') {
    await updateShopOrderPaymentStatus(order.id, 'failed', 'Stripe checkout session expired.');
    return { received: true };
  }
  if (session.payment_status !== 'paid' || session.amount_total !== order.total * 100 || session.currency?.toLowerCase() !== 'kes') {
    throw paymentError('Stripe payment does not match the saved order.', 400);
  }
  await updateShopOrderPaymentStatus(order.id, 'paid', 'Stripe payment confirmed.', session.payment_intent?.toString() ?? session.id);
  return { received: true };
}

function safeTokenMatches(provided: unknown) {
  const expected = process.env.MPESA_CALLBACK_TOKEN ?? '';
  if (typeof provided !== 'string' || !expected) return false;
  const expectedHash = createHash('sha256').update(expected).digest();
  const providedHash = createHash('sha256').update(provided).digest();
  return timingSafeEqual(expectedHash, providedHash);
}

export async function processMpesaCallback(token: unknown, body: any) {
  if (!safeTokenMatches(token)) throw paymentError('M-Pesa callback authorization failed.', 401);
  const callback = body?.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;
  if (typeof checkoutRequestId !== 'string') throw paymentError('M-Pesa callback is missing its request reference.', 400);
  const order = await findShopOrderByMpesaRequestId(checkoutRequestId);
  if (!order) throw paymentError('M-Pesa callback does not match an active order.', 404);
  if (Number(callback.ResultCode) !== 0) {
    await updateShopOrderPaymentStatus(order.id, 'failed', String(callback.ResultDesc ?? 'M-Pesa payment failed.'));
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  const values = callback.CallbackMetadata?.Item;
  const amount = Array.isArray(values) ? Number(values.find((item: any) => item.Name === 'Amount')?.Value) : NaN;
  const receipt = Array.isArray(values) ? values.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value : null;
  const phoneValue = Array.isArray(values) ? values.find((item: any) => item.Name === 'PhoneNumber')?.Value : null;
  const callbackPhone = typeof phoneValue === 'number' || typeof phoneValue === 'string' ? normalizeKenyanPhone(String(phoneValue)) : null;
  if (amount !== order.total || !callbackPhone || callbackPhone !== normalizeKenyanPhone(order.phone)) {
    throw paymentError('M-Pesa callback details do not match the order.', 400);
  }
  await updateShopOrderPaymentStatus(order.id, 'paid', 'M-Pesa payment confirmed.', typeof receipt === 'string' ? receipt : checkoutRequestId);
  return { ResultCode: 0, ResultDesc: 'Accepted' };
}

export async function readOrderPaymentStatus(orderId: string, statusToken: string) {
  if (!orderId || !statusToken) throw paymentError('Order and status token are required.');
  const order = await findShopOrderPaymentStatus(orderId, statusToken);
  if (!order) throw paymentError('Order payment status was not found.', 404);
  return order;
}