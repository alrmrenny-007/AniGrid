'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CHARS } from '@/lib/chars';
import { saveCharImgs } from './actions';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function batch() {
  const vars = {};
  const parts = CHARS.map((c, i) => { vars['q' + i] = c.q; return `c${i}:Character(search:$q${i},sort:FAVOURITES_DESC){image{large}}`; });
  const query = `query(${CHARS.map((c, i) => `$q${i}:String`).join(',')}){${parts.join(' ')}}`;
  const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query, variables: vars }) });
  const j = await r.json();
  const out = {};
  CHARS.forEach((c, i) => { const u = j.data?.['c' + i]?.image?.large; if (u) out[c.id] = u; });
  if (!Object.keys(out).length) throw new Error(JSON.stringify(j.errors || j).slice(0, 90));
  return out;
}
export async function loadCharImgs() {
  let out = {}, err = '';
  try { out = await batch(); } catch (e) { err = 'AniList ' + String(e.message || e).slice(0, 90); }
  if (Object.keys(out).length >= CHARS.length - 2) return { out, err: '' };
  for (const c of CHARS) {
    if (out[c.id]) continue;
    try {
      const r = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(c.q)}&order_by=favorites&sort=desc&limit=1`);
      const u = (await r.json()).data?.[0]?.images?.jpg?.image_url;
      if (u) out[c.id] = u;
    } catch (e) { err += ' | Jikan ' + String(e.message || e).slice(0, 50); break; }
    await sleep(380);
  }
  return { out, err };
}
export default function CharWarm({ have }) {
  const router = useRouter();
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (CHARS.every((c) => have?.[c.id])) return;
    setMsg('Loading portraits…');
    loadCharImgs()
      .then(async ({ out, err }) => {
        if (Object.keys(out).length) { await saveCharImgs(out); setMsg(''); router.refresh(); }
        else setMsg('Portraits could not load: ' + err + ' (v18)');
      })
      .catch((e) => setMsg('Portraits error: ' + String(e.message || e).slice(0, 90) + ' (v18)'));
  }, []);
  return msg ? <p style={{ color: '#9b988d', fontSize: '.8rem' }}>{msg}</p> : null;
}
