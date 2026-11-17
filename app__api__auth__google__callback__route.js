import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { sql } from '@/lib/db';
import { createSession, getUser } from '@/lib/auth';
import { award } from '@/lib/game';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const back = (p, m) => NextResponse.redirect(new URL(p + '?e=' + encodeURIComponent(m), origin));
  const jar = await cookies();
  const state = jar.get('g_state')?.value;
  const link = jar.get('g_link')?.value === '1';
  const code = url.searchParams.get('code');
  if (!state || state !== url.searchParams.get('state') || !code) return back('/login', 'Google sign-in was cancelled or expired');
  let p;
  try {
    const tr = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: origin + '/api/auth/google/callback', grant_type: 'authorization_code' }),
    });
    const t = await tr.json();
    p = (await jwtVerify(t.id_token, JWKS, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: process.env.GOOGLE_CLIENT_ID })).payload;
  } catch { return back('/login', 'Google sign-in failed. Please try again.'); }
  if (!p.email_verified) return back('/login', 'Your Google email is not verified');
  const sub = String(p.sub), email = String(p.email).toLowerCase();
  let res;
  const me = link ? await getUser() : null;
  if (me) {
    const taken = (await sql`select id from users where google_sub = ${sub} and id <> ${me.id}`).rows[0];
    if (taken) return back('/profile', 'That Google account is already linked to another user');
    await sql`update users set google_sub = ${sub}, email = ${email}, email_verified = true where id = ${me.id}`;
    res = NextResponse.redirect(new URL('/profile', origin));
  } else {
    let u = (await sql`select id, banned from users where google_sub = ${sub}`).rows[0];
    if (!u) u = (await sql`select id, banned from users where email = ${email} and email_verified`).rows[0];
    let isNew = false;
    if (!u) {
      const base = String(p.name || email.split('@')[0]).replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 18) || 'player';
      let name = base;
      for (let i = 0; i < 20; i++) {
        if (!(await sql`select 1 from users where username = ${name}`).rows[0]) break;
        name = base + Math.floor(100 + Math.random() * 900);
      }
      const hash = await bcrypt.hash(randomBytes(16).toString('hex'), 10);
      u = (await sql`insert into users(username, password_hash, google_sub, email, email_verified) values (${name}, ${hash}, ${sub}, ${email}, true) returning id, banned`).rows[0];
      await award(u.id, 10, 'Newcomer');
      isNew = true;
    } else {
      await sql`update users set google_sub = ${sub}, email = ${email}, email_verified = true where id = ${u.id}`;
    }
    if (u.banned) return back('/login', 'This account is suspended');
    await createSession(u.id);
    res = NextResponse.redirect(new URL(isNew ? '/profile?new=1' : '/profile', origin));
    if (isNew) res.cookies.set('pickchar', '1', { httpOnly: true, path: '/', maxAge: 604800 });
    res.cookies.set('welcome', isNew ? 'new' : 'back', { httpOnly: true, path: '/', maxAge: 600 });
  }
  res.cookies.delete('g_state');
  res.cookies.delete('g_link');
  return res;
}
