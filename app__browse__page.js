import Link from 'next/link';
import s from '../ui.module.css';
import { gql, norm, F } from '@/lib/anilist';
export const dynamic = 'force-dynamic';
const GEN = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'];
const Q = `query($q:String,$g:String,$sort:[MediaSort]){Page(perPage:30){media(type:ANIME,search:$q,genre:$g,sort:$sort,isAdult:false){${F}}}}`;
export default async function Browse({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp.q || '').slice(0, 60);
  const genre = GEN.includes(String(sp.genre || '')) ? String(sp.genre) : '';
  const d = await gql(Q, { q: q || undefined, g: genre || undefined, sort: [q ? 'SEARCH_MATCH' : 'POPULARITY_DESC'] }, 600);
  const seen = new Set();
  const list = (d?.Page?.media || []).filter((m) => m.idMal && !seen.has(m.idMal) && seen.add(m.idMal)).map(norm);
  return (<>
    <h1>Catalog</h1>
    <form action="/browse">
      <input className={s.field} name="q" defaultValue={q} placeholder="Search titles..." />
      {genre && <input type="hidden" name="genre" value={genre} />}
      <button className={s.btn}>Search</button>
    </form>
    <div className={s.chips}>
      <Link href="/browse" className={`${s.gchip} ${!genre ? s.gchipOn : ''}`}>All</Link>
      {GEN.map((n) => <Link key={n} href={`/browse?genre=${encodeURIComponent(n)}`} className={`${s.gchip} ${genre === n ? s.gchipOn : ''}`}>{n}</Link>)}
    </div>
    {list.length === 0 && <p className={s.mute}>{d ? 'No results. Try another search.' : 'The anime feed is taking a nap. Refresh in a moment.'}</p>}
    <div className={s.grid}>{list.map((a) => (
      <div key={a.id} className={s.card}>
        <Link href={`/anime?id=${a.id}`} style={{ color: 'inherit', display: 'block' }}><img src={a.thumb} alt={a.title} loading="lazy" decoding="async" /><b>{a.title}</b></Link>
        <div className={s.mute}>★ {a.score ?? 'N/A'}</div>
      </div>))}
    </div>
  </>);
}
