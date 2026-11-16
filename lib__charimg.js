import { sql } from './db';
import { CHARS } from './chars';
async function fetchAll() {
  const vars = {};
  const parts = CHARS.map((c, i) => { vars['q' + i] = c.q; return `c${i}:Character(search:$q${i},sort:FAVOURITES_DESC){image{large}}`; });
  const query = `query(${CHARS.map((c, i) => `$q${i}:String`).join(',')}){${parts.join(' ')}}`;
  try {
    const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query, variables: vars }), cache: 'no-store' });
    const d = (await r.json()).data || {};
    const out = {};
    CHARS.forEach((c, i) => { const u = d['c' + i]?.image?.large; if (u) out[c.id] = u; });
    return out;
  } catch { return {}; }
}
export async function charImages() {
  let map = {};
  try {
    await sql`create table if not exists settings(key text primary key, value text)`;
    const r = (await sql`select value from settings where key = 'charimgs'`).rows[0];
    if (r) map = JSON.parse(r.value);
  } catch { return {}; }
  const missing = CHARS.some((c) => !map[c.id]);
  if (missing && Date.now() - (map._t || 0) > 20000) {
    const got = await fetchAll();
    map = { ...map, ...got, _t: Date.now() };
    try { await sql`insert into settings(key, value) values ('charimgs', ${JSON.stringify(map)}) on conflict (key) do update set value = excluded.value`; } catch {}
  }
  return map;
}
