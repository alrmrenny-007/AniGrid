import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { rankOf } from '@/lib/game';
export const dynamic = 'force-dynamic';
export default async function Leaderboard() {
  const me = await getUser();
  const { rows } = await sql`select id, username, ap from users order by ap desc, id limit 50`;
  const medal = ['🥇', '🥈', '🥉'];
  return (<>
    <h1>Leaderboard</h1>
    <p className={s.mute}>Top 50 by Anime Points.</p>
    <div>
      {rows.map((u, i) => (
        <div key={u.id} className={`${s.lb} ${me?.id === u.id ? s.meRow : ''}`}>
          <span className={s.pos}>{medal[i] || i + 1}</span>
          <span><b>{u.username}</b> <span className={s.mute}>{rankOf(u.ap)}</span></span>
          <span className={s.pts}>{u.ap} AP</span>
        </div>))}
    </div>
  </>);
}
