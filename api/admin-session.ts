import { clearAdminSessionCookie, getActiveAdminSession, getAdminEnv, isTrustedOrigin, setAdminSessionCookie, verifyAdminKey, verifyAdminPassword, verifyHashedAdminPassword } from '../lib/api/admin-session.js';
import { findAdminUserByEmail } from '@workspace/db';
import { createSupabaseAuthClient, isSupabaseAuthConfigured, provisionSupabaseAdminUser } from '../lib/api/supabase.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    const session = await getActiveAdminSession(req);
    return res.status(200).json({ authenticated: Boolean(session), user: session ? { id: session.userId, email: session.email, role: session.role } : null });
  }
  if (req.method === 'DELETE') {
    if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
    clearAdminSessionCookie(res);
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });
  try {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password ?? req.body?.credential ?? req.body?.key;

  if (email && typeof password === 'string') {
    const ownerEmail = getAdminEnv('ADMIN_EMAIL').trim().toLowerCase();
    if (ownerEmail && email === ownerEmail && verifyAdminPassword(password)) {
      const owner = { userId: 'owner', email: ownerEmail, role: 'owner' };
      setAdminSessionCookie(res, owner);
      return res.status(200).json({ authenticated: true, user: { id: owner.userId, email: owner.email, role: owner.role } });
    }

    const supabaseMode = getAdminEnv('SUPABASE_AUTH_MODE') || 'hybrid';
    if (supabaseMode !== 'legacy' && isSupabaseAuthConfigured()) {
      try {
        const authClient: any = createSupabaseAuthClient();
        const { data, error } = await authClient.auth.signInWithPassword({ email, password });
        if (!error && data.user?.email) {
          const supabaseEmail = data.user.email.trim().toLowerCase();
          const admin = await findAdminUserByEmail(supabaseEmail);
          if (!admin || !admin.active) return res.status(403).json({ error: 'This Supabase identity is not an active NexHSE admin' });
          setAdminSessionCookie(res, { userId: admin.id, email: admin.email, role: admin.role });
          return res.status(200).json({ authenticated: true, user: { id: admin.id, email: admin.email, role: admin.role }, supabaseSession: data.session ? { access_token: data.session.access_token, refresh_token: data.session.refresh_token } : null });
        }
      } catch {
        if (supabaseMode === 'required') return res.status(503).json({ error: 'Supabase authentication is unavailable' });
      }
      if (supabaseMode === 'required') return res.status(401).json({ error: 'Invalid admin credential' });
    } else if (supabaseMode === 'required') {
      return res.status(503).json({ error: 'Supabase authentication is not configured' });
    }

    const user = await findAdminUserByEmail(email);
    if (!user || !user.active || !verifyHashedAdminPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid admin credential' });
    if (supabaseMode !== 'legacy' && isSupabaseAuthConfigured()) {
      const provisioned = await provisionSupabaseAdminUser({ email: user.email, password, adminId: user.id, name: user.name });
      if (provisioned === 'exists') return res.status(401).json({ error: 'Invalid admin credential' });
      if (provisioned === 'created') {
        try {
          const authClient: any = createSupabaseAuthClient();
          const { data } = await authClient.auth.signInWithPassword({ email: user.email, password });
          if (data.session) {
            setAdminSessionCookie(res, { userId: user.id, email: user.email, role: user.role });
            return res.status(200).json({ authenticated: true, user: { id: user.id, email: user.email, role: user.role }, supabaseSession: { access_token: data.session.access_token, refresh_token: data.session.refresh_token } });
          }
        } catch {
          if (supabaseMode === 'required') return res.status(503).json({ error: 'Supabase authentication is unavailable' });
        }
      }
    }
    setAdminSessionCookie(res, { userId: user.id, email: user.email, role: user.role });
    return res.status(200).json({ authenticated: true, user: { id: user.id, email: user.email, role: user.role } });
  }

  if (!getAdminEnv('ADMIN_API_KEY') && !getAdminEnv('ADMIN_PASSWORD')) return res.status(503).json({ error: 'Admin access is not configured' });
  if (!verifyAdminKey(password) && !verifyAdminPassword(password)) return res.status(401).json({ error: 'Invalid admin credential' });
  const owner = { userId: 'owner', email: getAdminEnv('ADMIN_EMAIL') || 'owner', role: 'owner' };
  setAdminSessionCookie(res, owner);
  return res.status(200).json({ authenticated: true, user: { id: owner.userId, email: owner.email, role: owner.role } });
  } catch (error) {
    console.error('admin sign-in failed', error);
    return res.status(503).json({ error: 'Admin sign-in is temporarily unavailable. Check server database and authentication configuration.' });
  }
}
