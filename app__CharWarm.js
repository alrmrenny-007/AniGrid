'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CHARS } from '@/lib/chars';
import { saveCharImgs } from './actions';
export async function loadCharImgs() {
  const vars = {};
  const parts = CHARS.map((c, i) => { vars['q' + i] = c.q; return `c${i}:Character(search:$q${i},sort:FAVOURITES_DESC){image{large}}`; });
  const query = `query(${CHARS.map((c, i) => `$q${i}:String`).join(',')}){${parts.join(' ')}}`;
  const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ query, variables: vars }) });
  const d = (await r.json()).data || {};
  const out = {};
  CHARS.forEach((c, i) => { const u = d['c' + i]?.image?.large; if (u) out[c.id] = u; });
  return out;
}
export default function CharWarm({ have }) {
  const router = useRouter();
  useEffect(() => {
    if (CHARS.every((c) => have?.[c.id])) return;
    if (sessionStorage.getItem('cw')) return;
    sessionStorage.setItem('cw', '1');
    loadCharImgs()
      .then(async (m) => { if (Object.keys(m).length) { await saveCharImgs(m); router.refresh(); } else sessionStorage.removeItem('cw'); })
      .catch(() => sessionStorage.removeItem('cw'));
  }, []);
  return null;
}
