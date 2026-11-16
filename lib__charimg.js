import { sql } from './db';
import { CHARS } from './chars';
async function one(q) {
  try {
    const r = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&order_by=favorites&sort=desc&limit=1`, { cache: 'no-store' });
    return (await r.json()).data?.[0]?.images?.jpg?.image_url || null;
  } catch { return null; }
}
export async function charImages() {
  let map = {};
  try { const r = (await sql`select value from settings where key = 'charimgs'`).rows[0]; if (r) map = JSON.parse(r.value); } catch { return {}; }
  const missing = CHARS.filter((c) => !map[c.id]).slice(0, 3);
  if (missing.length && Date.now() - (map._t || 0) > 45000) {
    map._t = Date.now();
    for (const c of missing) { const u = await one(c.q); if (u) map[c.id] = u; await new Promise((r) => setTimeout(r, 400)); }
    try { await sql`insert into settings(key, value) values ('charimgs', ${JSON.stringify(map)}) on conflict (key) do update set value = excluded.value`; } catch {}
  }
  return map;
}
