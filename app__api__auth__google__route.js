import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
export async function GET(req) {
  const url = new URL(req.url);
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) return NextResponse.redirect(new URL('/login?e=' + encodeURIComponent('Google sign-in is not set up yet'), url.origin));
  const state = randomBytes(16).toString('hex');
  const res = NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: id, redirect_uri: url.origin + '/api/auth/google/callback', response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account',
  }));
  const o = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 };
  res.cookies.set('g_state', state, o);
  res.cookies.set('g_link', url.searchParams.get('link') ? '1' : '0', o);
  return res;
}
