import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { acceptAdminInvitation, createAdminInvitation, listAdminInvitations, listAdminUsers, updateAdminUser } from '@workspace/db';
import { getActiveAdminSession, hashAdminPassword, isTrustedOrigin, setAdminSessionCookie } from '../lib/api/admin-session.js';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

async function handleAcceptAdminInvitation(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });

  const { token, password } = req.body ?? {};
  if (typeof token !== 'string' || token.length < 32 || typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ error: 'A valid invite and password of at least 12 characters are required' });
  }

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = await acceptAdminInvitation(tokenHash, hashAdminPassword(password));
    if (!user) return res.status(400).json({ error: 'This invitation is invalid, expired, or already accepted' });
    setAdminSessionCookie(res, { userId: user.id, email: user.email, role: user.role });
    return res.status(201).json({ authenticated: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('admin invitation acceptance failed', error);
    return res.status(500).json({ error: 'Unable to accept this invitation' });
  }
}

export default async function handler(req: any, res: any) {
  const action = Array.isArray(req.query?.action) ? req.query.action[0] : req.query?.action;
  const urlPath = typeof req.url === 'string' ? req.url.split('?')[0] : '';
  if (action === 'accept' || urlPath.endsWith('/accept')) return handleAcceptAdminInvitation(req, res);

  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && !isTrustedOrigin(req)) return res.status(403).json({ error: 'Untrusted origin' });

  const session = await getActiveAdminSession(req);
  if (!session) return res.status(401).json({ error: 'Admin session required' });

  try {
    if (req.method === 'GET') {
      if (session.role !== 'owner') return res.status(403).json({ error: 'Super admin role required' });
      const [users, invitations] = await Promise.all([listAdminUsers(), listAdminInvitations()]);
      return res.status(200).json({ users, invitations });
    }

    if (req.method === 'POST') {
      const { email, name, role = 'staff' } = req.body ?? {};
      if (session.role !== 'owner') return res.status(403).json({ error: 'Super admin role required' });
      if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim()) || typeof name !== 'string' || !name.trim() || !['staff', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'A valid name, email, and staff/admin role are required' });
      }

      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      await createAdminInvitation({ id: randomUUID(), email: email.trim().toLowerCase(), name: name.trim(), role, tokenHash: hashToken(token), expiresAt, createdBy: session.userId });
      return res.status(201).json({ invitation: { email: email.trim().toLowerCase(), token, expiresAt } });
    }

    if (req.method === 'PATCH') {
      if (session.role !== 'owner') return res.status(403).json({ error: 'Only the account owner can manage admin roles' });
      const { id, active, role } = req.body ?? {};
      if (typeof id !== 'string' || (typeof active !== 'boolean' && !['admin', 'staff'].includes(role))) return res.status(400).json({ error: 'Invalid account update' });
      if (id === session.userId) return res.status(400).json({ error: 'You cannot change your own account here' });
      await updateAdminUser(id, { ...(typeof active === 'boolean' ? { active } : {}), ...(role ? { role } : {}) });
      return res.status(200).json({ updated: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('admin invitation API failed', error);
    return res.status(500).json({ error: 'Admin account operation failed' });
  }
}

export { hashToken };
