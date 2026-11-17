import { sql } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const id = new URL(req.url).searchParams.get('id') || '';
  try {
    const r = (await sql`select mime, data from char_pics where id = ${id}`).rows[0];
    if (!r) return new Response('Not found', { status: 404 });
    return new Response(Buffer.from(r.data, 'base64'), { headers: { 'Content-Type': r.mime, 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch { return new Response('Error', { status: 500 }); }
}
