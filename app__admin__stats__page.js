import Link from 'next/link';
import { redirect } from 'next/navigation';
import s from '../../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { charById } from '@/lib/chars';
export const dynamic = 'force-dynamic';
const Tile = ({ n, l }) => <div className={s.stat}><b>{n}</b><span>{l}</span></div>;
export default async function Stats() {
  const me = await getUser();
  if (!isAdmin(me)) redirect('/');
  const t = (await sql`select
    (select count(*)::int from users) as users,
    (select count(*)::int from users where created_at > now() - interval '7 days') as new7,
    (select count(distinct user_id)::int from events where created_at > now() - interval '7 days') as active7,
    (select count(*)::int from users where banned) as banned,
    (select count(*)::int from users where google_sub is not null) as google,
    (select count(*)::int from quiz_attempts) as attempts,
    (select count(*)::int from comments) as comments,
    (select count(*)::int from watchlist) as watch,
    (select count(*)::int from matchup_votes) + (select count(*)::int from debate_votes) as votes,
    (select count(*)::int from push_subs) as subs,
    (select coalesce(sum(ap), 0)::int from users) as ap`).rows[0];
  const days = (await sql`select to_char(d, 'Mon DD') as day, coalesce(u.n, 0)::int as n from generate_series(current_date - 13, current_date, interval '1 day') d left join (select created_at::date as c, count(*) as n from users group by 1) u on u.c = d::date order by d`).rows;
  const quizzes = (await sql`select q.question, q.kind, count(a.user_id)::int as n from quizzes q left join quiz_attempts a on a.quiz_id = q.id group by q.id order by n desc limit 5`).rows;
  const clans = (await sql`select character, count(*)::int as n, coalesce(sum(ap), 0)::int as ap from users where character is not null group by character order by n desc limit 5`).rows;
  const max = Math.max(1, ...days.map((d) => d.n));
  return (<>
    <h1>Stats</h1>
    <p><Link href="/admin">← Admin panel</Link></p>
    <div className={s.stats}><Tile n={t.users} l="Members" /><Tile n={t.new7} l="New (7d)" /><Tile n={t.active7} l="Active (7d)" /></div>
    <div className={s.stats}><Tile n={t.attempts} l="Quiz plays" /><Tile n={t.votes} l="Votes" /><Tile n={t.comments} l="Comments" /></div>
    <div className={s.stats}><Tile n={t.watch} l="List adds" /><Tile n={t.google} l="Google users" /><Tile n={t.subs} l="Push devices" /></div>
    <div className={s.stats}><Tile n={t.ap} l="Total AP" /><Tile n={t.banned} l="Banned" /><Tile n={clans.length} l="Active clans" /></div>
    <div className={s.card}>
      <h2>Sign-ups, last 14 days</h2>
      {days.map((d) => <div key={d.day} className={s.brow}><span>{d.day}</span><div className={s.bar}><div style={{ width: `${(d.n / max) * 100}%` }} /></div><b>{d.n}</b></div>)}
    </div>
    <div className={s.card}>
      <h2>Most played quizzes</h2>
      {quizzes.length === 0 && <p className={s.mute}>No quizzes yet.</p>}
      {quizzes.map((q, i) => <p key={i} style={{ margin: '.4rem 0' }}><b>{q.n}</b> plays · <span className={s.mute}>[{q.kind}] {q.question}</span></p>)}
    </div>
    <div className={s.card}>
      <h2>Top clans by members</h2>
      {clans.length === 0 && <p className={s.mute}>No one has picked a fighter yet.</p>}
      {clans.map((c) => <p key={c.character} style={{ margin: '.4rem 0' }}>{charById(c.character)?.emoji} <b>{charById(c.character)?.clan}</b> · {c.n} members · {c.ap} AP</p>)}
    </div>
  </>);
}
