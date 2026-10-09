import { createClient } from '@supabase/supabase-js';
import { listShopOrdersForEmailEdge } from '../../../lib/db/src/edge.ts';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'private, no-store',
  'Vary': 'Origin',
};

Deno.serve(async request => {
  const origin = request.headers.get('origin') ?? '';
  const allowedOrigins = (Deno.env.get('SITE_ALLOWED_ORIGINS') ?? 'https://nexhse.co.ke,https://www.nexhse.co.ke,https://shop.nexhse.co.ke,https://admin.nexhse.co.ke')
    .split(',').map(value => value.trim()).filter(Boolean);
  const headers = new Headers(corsHeaders);
  if (allowedOrigins.includes(origin)) headers.set('Access-Control-Allow-Origin', origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });

  const authorization = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return Response.json({ error: 'Supabase access token required' }, { status: 401, headers });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const databaseUrl = Deno.env.get('DATABASE_URL') ?? Deno.env.get('POSTGRES_URL') ?? '';
  if (!supabaseUrl || !supabaseAnonKey || !databaseUrl) {
    return Response.json({ error: 'Supabase Auth or Neon is not configured' }, { status: 503, headers });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(match[1]);
    const email = data.user?.email?.trim().toLowerCase();
    if (error || !email || !data.user?.email_confirmed_at) {
      return Response.json({ error: 'A verified Supabase user is required' }, { status: 401, headers });
    }

    const orders = await listShopOrdersForEmailEdge(email, databaseUrl);

    return Response.json({ orders }, { status: 200, headers });
  } catch {
    return Response.json({ error: 'Order history is unavailable' }, { status: 503, headers });
  }
});