import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { snowflakeQuery } from './snowflake';
import bcrypt from 'bcryptjs';

const SESSION_COOKIE = 'roomview_session';
const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-change-me'
);

export interface SessionPayload {
  siteId: string;
  siteSlug: string;
  siteName: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function login(slug: string, password: string): Promise<string | null> {
  const rows = await snowflakeQuery<{
    id: string; name: string; slug: string; password_hash: string;
  }>(`SELECT id, name, slug, password_hash FROM SITES WHERE slug = ?`, [slug]);

  if (!rows.length) return null;
  const site = rows[0];

  const valid = await bcrypt.compare(password, site.password_hash);
  if (!valid) return null;

  return createSession({ siteId: site.id, siteSlug: site.slug, siteName: site.name });
}

export async function getSites(): Promise<{ name: string; slug: string }[]> {
  return snowflakeQuery<{ name: string; slug: string }>(
    `SELECT name, slug FROM SITES ORDER BY name`
  );
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
