import { createClient } from '@supabase/supabase-js';

const projectPrefix = 'nexhsevo_';

function envValue(name: string) {
  const value = process.env[name] ?? process.env[`v0_${name}`] ?? process.env[`${projectPrefix}${name}`] ?? '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

export function getSupabaseConfig() {
  return {
    url: envValue('SUPABASE_URL'),
    anonKey: envValue('SUPABASE_ANON_KEY'),
    serviceRoleKey: envValue('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

export function getPublicSupabaseConfig() {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
  } catch {
    return null;
  }
  return { url, anonKey };
}

export function isSupabaseAuthConfigured() {
  const config = getPublicSupabaseConfig();
  return Boolean(config?.url && config.anonKey);
}

export function createSupabaseAuthClient() {
  const config = getPublicSupabaseConfig();
  if (!config) throw new Error('Supabase public auth configuration is missing.');
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as any;
}

function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  }) as any;
}

export async function provisionSupabaseAdminUser(user: { email: string; password: string; adminId: string; name?: string }) {
  const supabase: any = createSupabaseAdminClient();
  if (!supabase) return 'unavailable' as const;

  const { error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { neon_admin_id: user.adminId, name: user.name ?? '' },
  });
  if (!error) return 'created' as const;
  if (error.code === 'email_exists' || /already (registered|exists)/i.test(error.message)) return 'exists' as const;
  return 'unavailable' as const;
}

export function getNeonConnectionString() {
  return process.env.DATABASE_URL ?? process.env.v0_DATABASE_URL ?? process.env.nexhsevo_DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.v0_POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? '';
}