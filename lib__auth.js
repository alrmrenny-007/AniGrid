import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { sql } from './db';
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret');
export async function createSession(id) {
  const t = await new SignJWT({ id }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key());
  (await cookies()).set('session', t, { httpOnly: true, path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
}
export async function getUser() {
  const t = (await cookies()).get('session')?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    const { rows } = await sql`select id, username, ap, banned from users where id = ${payload.id}`;
    const u = rows[0];
    return u && !u.banned ? u : null;
  } catch { return null; }
}
