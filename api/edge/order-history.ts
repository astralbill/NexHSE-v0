import { createClient } from '@supabase/supabase-js';
import { listShopOrdersForEmailEdge } from '../../lib/db/src/edge.js';
import { getNeonConnectionString, getPublicSupabaseConfig } from '../../lib/api/supabase.js';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json' };
  if (req.method !== 'GET') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });

  const authorization = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return new Response(JSON.stringify({ error: 'Supabase access token required' }), { status: 401, headers });

  const supabaseConfig = getPublicSupabaseConfig();
  const databaseUrl = getNeonConnectionString();
  if (!supabaseConfig || !databaseUrl) return new Response(JSON.stringify({ error: 'Auth or Neon database is not configured' }), { status: 503, headers });

  try {
    const supabase: any = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(match[1]);
    const email = data.user?.email?.trim().toLowerCase();
    if (error || !email || !data.user?.email_confirmed_at) {
      return new Response(JSON.stringify({ error: 'A verified Supabase user is required' }), { status: 401, headers });
    }

    const orders = await listShopOrdersForEmailEdge(email, databaseUrl);

    return new Response(JSON.stringify({ orders }), { status: 200, headers });
  } catch {
    return new Response(JSON.stringify({ error: 'Order history is unavailable' }), { status: 503, headers });
  }
}