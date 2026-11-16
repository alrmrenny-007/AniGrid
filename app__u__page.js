import Link from 'next/link';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { rankOf } from '@/lib/game';
export const dynamic = 'force-dynamic';
const L = { watching: 'Watching', plan: 'Plan to watch', completed: 'Completed', dropped: 'Dropped' };
export default async function PublicProfile({ searchParams }) {
  const { name } = await searchParams;
  const u = (await sql`select id, username, ap, case when last_login >= current_date - 1 then streak else 0 end as streak from users where username = ${String(name || '')}`).rows[0];
  if (!u) return <p className={s.mute}>User not found.</p>;
  const badges = (await sql`select badge from badges where user_id = ${u.id}`).rows;
  const counts = (await sql`select status, count(*)::int as n from watchlist where user_id = ${u.id} group by status`).rows;
  const recent = (await sql`select anime_id, title, img, rating from watchlist where user_id = ${u.id} and status = 'completed' order by title limit 8`).rows;
  return (<>
    <div className={s.card}>
      <h1>{u.username}</h1>
      <h2>{u.ap} AP · {rankOf(u.ap)}</h2>
      <div className={s.streak}>🔥 {u.streak}-day streak</div>
      <h3>Badges</h3>
      {badges.length ? badges.map((b) => <span key={b.badge} className={s.badge}>🏅 {b.badge}</span>) : <p className={s.mute}>None yet.</p>}
      <h3>Watchlist</h3>
      {counts.length ? counts.map((c) => <span key={c.status} className={s.badge}>{L[c.status]}: {c.n}</span>) : <p className={s.mute}>Empty.</p>}
    </div>
    {recent.length > 0 && <>
      <h2>Completed</h2>
      <div className={s.grid}>{recent.map((r) => (
        <div key={r.anime_id} className={s.card}>
          <Link href={`/anime?id=${r.anime_id}`} style={{ color: 'inherit', display: 'block' }}>
            {r.img && <img src={r.img} alt={r.title} />}<b>{r.title}</b></Link>
          {r.rating && <div className={s.mute}>★ {r.rating}/10</div>}
        </div>))}
      </div></>}
  </>);
}
