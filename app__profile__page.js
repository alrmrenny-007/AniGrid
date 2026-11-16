import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { rankOf, nextTier } from '@/lib/game';
import { claimDaily } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Profile() {
  const me = await getUser(); if (!me) redirect('/login');
  const { rows: b } = await sql`select badge from badges where user_id = ${me.id}`;
  const { rows: [u] } = await sql`select case when last_login >= current_date - 1 then streak else 0 end as streak, coalesce(last_login = current_date, false) as claimed from users where id = ${me.id}`;
  const nt = nextTier(me.ap);
  return (<div className={s.card}>
    <h1>{me.username}</h1>
    <h2>{me.ap} AP · {rankOf(me.ap)}</h2>
    {nt ? <><div className={s.bar}><div style={{ width: `${Math.min(100, (me.ap / nt[1]) * 100)}%` }} /></div>
      <p className={s.mute}>{nt[1] - me.ap} AP to {nt[0]}</p></> : <p>Max rank reached 🎉</p>}
    <div className={s.streak}>🔥 {u.streak}-day streak</div>
    {u.claimed ? <p className={s.mute}>✅ Daily bonus claimed. Come back tomorrow!</p>
      : <form action={claimDaily}><button className={s.btn}>Claim daily bonus</button></form>}
    <h3>Badges</h3>
    {b.length ? b.map((x) => <span key={x.badge} className={s.badge}>🏅 {x.badge}</span>) : <p className={s.mute}>None yet.</p>}
  </div>);
}
