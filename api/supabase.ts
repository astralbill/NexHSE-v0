import { getPublicSupabaseConfig } from '../lib/api/supabase.js';

export default function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  const action = Array.isArray(req.query?.action) ? req.query.action[0] : req.query?.action;
  if (action && action !== 'config') return res.status(404).json({ error: 'Unknown Supabase action' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const config = getPublicSupabaseConfig();
  if (!config) return res.status(503).json({ error: 'Supabase public configuration is unavailable' });
  return res.status(200).json(config);
}
