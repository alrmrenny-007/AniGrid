import Link from 'next/link';
import s from '../ui.module.css';
export const dynamic = 'force-dynamic';
const GEN = [['Action', 1], ['Adventure', 2], ['Comedy', 4], ['Drama', 8], ['Fantasy', 10], ['Horror', 14], ['Mystery', 7], ['Romance', 22], ['Sci-Fi', 24], ['Slice of Life', 36], ['Sports', 30], ['Supernatural', 37]];
export default async function Browse({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || '').slice(0, 60);
  const genre = /^\d+$/.test(String(sp.genre || '')) ? String(sp.genre) : '';
  const qs = new URLSearchParams({ order_by: 'score', sort: 'desc', sfw: 'true', limit: '24' });
  if (q) qs.set('q', q); else qs.set('min_score', '6');
  if (genre) qs.set('genres', genre);
  let list = [];
  try { list = (await (await fetch('https://api.jikan.moe/v4/anime?' + qs, { next: { revalidate: 600 } })).json()).data || []; } catch {}
  const seen = new Set();
  list = list.filter((a) => !seen.has(a.mal_id) && seen.add(a.mal_id));
  return (<>
    <h1>Catalog</h1>
    <form action="/browse">
      <input className={s.field} name="q" defaultValue={q} placeholder="Search titles..." />
      {genre && <input type="hidden" name="genre" value={genre} />}
      <button className={s.btn}>Search</button>
    </form>
    <div className={s.chips}>
      <Link href="/browse" className={`${s.gchip} ${!genre ? s.gchipOn : ''}`}>All</Link>
      {GEN.map(([n, id]) => <Link key={id} href={`/browse?genre=${id}`} className={`${s.gchip} ${genre === String(id) ? s.gchipOn : ''}`}>{n}</Link>)}
    </div>
    {list.length === 0 && <p className={s.mute}>No results right now. Try another search.</p>}
    <div className={s.grid}>{list.map((a) => (
      <div key={a.mal_id} className={s.card}>
        <Link href={`/anime?id=${a.mal_id}`} style={{ color: 'inherit', display: 'block' }}><img src={a.images?.jpg?.image_url} alt={a.title} loading="lazy" decoding="async" /><b>{a.title}</b></Link>
        <div className={s.mute}>★ {a.score ?? 'N/A'}</div>
      </div>))}
    </div>
  </>);
}
