import Link from 'next/link';
import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
const ST = [['watching', 'Watching'], ['plan', 'Plan to watch'], ['completed', 'Completed'], ['dropped', 'Dropped']];
export default async function Watchlist() {
  const me = await getUser();
  if (!me) redirect('/login');
  const { rows } = await sql`select anime_id, title, img, status, rating from watchlist where user_id = ${me.id} order by title`;
  return (<>
    <h1>My List</h1>
    {rows.length === 0 && <p className={s.mute}>Nothing here yet. Open any anime from the home page and add it. Complete 5 to earn the Binge Watcher badge.</p>}
    {ST.map(([v, l]) => {
      const items = rows.filter((r) => r.status === v);
      if (!items.length) return null;
      return (<div key={v}>
        <h2>{l} ({items.length})</h2>
        <div className={s.grid}>{items.map((r) => (
          <div key={r.anime_id} className={s.card}>
            <Link href={`/anime?id=${r.anime_id}`} style={{ color: 'inherit', display: 'block' }}>
              {r.img && <img src={r.img} alt={r.title} />}<b>{r.title}</b>
            </Link>
            {r.rating && <div className={s.mute}>★ {r.rating}/10</div>}
          </div>))}
        </div>
      </div>);
    })}
  </>);
}
