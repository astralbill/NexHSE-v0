import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { isAdminUserActive } from '@workspace/db';

const cookieName = 'nexhse_admin_session';
const sessionDurationSeconds = 60 * 60 * 12;
const trustedOrigins = new Set(['https://nexhse.co.ke', 'https://www.nexhse.co.ke', 'https://shop.nexhse.co.ke', 'https://admin.nexhse.co.ke']);

export function getAdminEnv(name: string) {
  return process.env[name] ?? process.env[`v0_${name}`] ?? process.env[`nexhsevo_${name}`] ?? '';
}

export function isTrustedOrigin(req: any) {
  const origin = String(req.headers?.origin ?? '');
  if (!origin) return process.env.NODE_ENV !== 'production';
  const configuredOrigins = getAdminEnv('SITE_ALLOWED_ORIGINS').split(',').map(value => value.trim()).filter(Boolean);
  if (trustedOrigins.has(origin) || configuredOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const hostname = new URL(origin).hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
    } catch { return false; }
  }
  return false;
}

export type AdminSession = { userId: string; email: string; role: string; expiresAt: number };

function secret() {
  return getAdminEnv('ADMIN_SESSION_SECRET') || getAdminEnv('ADMIN_API_KEY') || getAdminEnv('ADMIN_PASSWORD');
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function readCookie(req: any) {
  const header = String(req.headers?.cookie ?? '');
  const pair = header.split(';').map((value: string) => value.trim()).find((value: string) => value.startsWith(`${cookieName}=`));
  return pair ? decodeURIComponent(pair.slice(cookieName.length + 1)) : '';
}

export async function getActiveAdminSession(req: any): Promise<AdminSession | null> {
  const session = getAdminSession(req);
  if (!session) return null;
  if (session.userId === 'owner') return session;
  return await isAdminUserActive(session.userId) ? session : null;
}

export async function verifyAdminSession(req: any) {
  return await getActiveAdminSession(req) !== null;
}

export function getAdminSession(req: any): AdminSession | null {
  if (!secret()) return null;
  const token = readCookie(req);
  const [payload, suppliedSignature] = token.split('.');
  if (!payload || !suppliedSignature) return null;
  const expected = sign(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (supplied.length !== expectedBuffer.length || !timingSafeEqual(supplied, expectedBuffer)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<AdminSession>;
    if (!parsed.userId || !parsed.email || !parsed.role || !Number.isFinite(parsed.expiresAt) || (parsed.expiresAt ?? 0) < Math.floor(Date.now() / 1000)) return null;
    return parsed as AdminSession;
  } catch {
    return null;
  }
}

export function verifyAdminKey(candidate: unknown) {
  const configured = getAdminEnv('ADMIN_API_KEY');
  if (!configured || typeof candidate !== 'string') return false;
  const expected = Buffer.from(configured);
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function verifyAdminPassword(candidate: unknown) {
  const configured = getAdminEnv('ADMIN_PASSWORD');
  if (!configured || typeof candidate !== 'string') return false;
  const expected = Buffer.from(configured);
  const supplied = Buffer.from(candidate);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = scryptSync(password, salt, 64).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

export function verifyHashedAdminPassword(password: unknown, encoded: string) {
  if (typeof password !== 'string') return false;
  const [scheme, salt, hash] = encoded.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64url');
  const supplied = scryptSync(password, salt, expected.length);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

export function setAdminSessionCookie(res: any, identity: Pick<AdminSession, 'userId' | 'email' | 'role'> = { userId: 'owner', email: 'owner', role: 'owner' }) {
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = Buffer.from(JSON.stringify({ ...identity, expiresAt })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  const isProduction = process.env.NODE_ENV === 'production';
  const cookie = `${cookieName}=${encodeURIComponent(token)}; Path=/; Max-Age=${sessionDurationSeconds}; HttpOnly; SameSite=Lax${isProduction ? '; Secure; Domain=.nexhse.co.ke' : ''}`;
  res.setHeader('Set-Cookie', cookie);
}

export function clearAdminSessionCookie(res: any) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProduction ? '; Secure; Domain=.nexhse.co.ke' : ''}`);
}
