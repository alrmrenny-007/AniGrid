import { sql } from './db';
export async function charImages() {
  let map = {};
  try {
    await sql`create table if not exists settings(key text primary key, value text)`;
    const r = (await sql`select value from settings where key = 'charimgs'`).rows[0];
    if (r) map = JSON.parse(r.value);
  } catch {}
  try {
    await sql`create table if not exists char_pics(id text primary key, mime text, data text, updated_at timestamptz default now())`;
    const rows = (await sql`select id, extract(epoch from updated_at)::bigint as v from char_pics`).rows;
    for (const p of rows) map[p.id] = `/api/char?id=${p.id}&v=${p.v}`;
  } catch {}
  return map;
}
