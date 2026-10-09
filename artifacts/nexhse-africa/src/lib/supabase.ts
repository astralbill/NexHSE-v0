import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let clientPromise: Promise<SupabaseClient> | undefined;

export function getSupabaseBrowserClient() {
  if (!clientPromise) {
    clientPromise = fetch('/api/supabase/config', { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('Supabase authentication is not configured.');
        const config = await response.json() as { url: string; anonKey: string };
        return createClient(config.url, config.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        });
      })
      .catch(error => {
        clientPromise = undefined;
        throw error;
      });
  }
  return clientPromise;
}

export async function getSupabaseOrderHistory() {
  const client = await getSupabaseBrowserClient();
  const { data, error } = await client.functions.invoke('order-history', { method: 'GET' });
  if (error) throw error;
  return Array.isArray(data?.orders) ? data.orders : [];
}