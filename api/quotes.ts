import { randomUUID } from 'node:crypto';
import { createQuote } from '@workspace/db';
import { isTrustedOrigin } from '../lib/api/admin-session.js';

const validText = (value: unknown, maxLength: number) => typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });

  const request = req.body ?? {};
  if (!validText(request.need, 2000) || !validText(request.organisation, 180) || !validText(request.industry, 180) || !validText(request.location, 240) || !validText(request.timeline, 120) || !validText(request.contactName, 180) || typeof request.email !== 'string' || !/^\S+@\S+\.\S+$/.test(request.email.trim()) || !validText(request.phone, 80)) {
    return res.status(400).json({ error: 'Complete all required quote request details using a valid email address.' });
  }

  try {
    const id = randomUUID();
    const year = new Date().getFullYear();
    const item = await createQuote({
      id,
      quoteNumber: `NQ-${year}-${id.slice(0, 8).toUpperCase()}`,
      clientName: request.contactName.trim(),
      company: request.organisation.trim(),
      email: request.email.trim().toLowerCase(),
      phone: request.phone.trim(),
      need: request.need.trim(),
      location: request.location.trim(),
      timeline: request.timeline.trim(),
      amount: 0,
      currency: 'KES',
      status: 'requested',
      createdBy: 'owner',
    });
    return res.status(201).json({ submitted: true, quoteNumber: item?.quoteNumber });
  } catch (error) {
    console.error('public quote request failed', error);
    return res.status(503).json({ error: 'Quote requests are temporarily unavailable. Please contact NexHSE directly.' });
  }
}
