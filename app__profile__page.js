import Link from 'next/link';
import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { rankOf, nextTier } from '@/lib/game';
import { charById, perkText, TASKS } from '@/lib/chars';
import { charImages } from '@/lib/charimg';
import { claimDaily, generateRecovery, getPushKey, savePush } from '../actions';
import CodeForm from '../CodeForm';
import CharWarm from '../CharWarm';
import PushButton from '../PushButton';
export const dynamic = 'force-dynamic';
export default async function Profile({ searchParams }) {
  const sp = await searchParams;
  const me = await getUser(); if (!me) redirect('/login');
  const { rows: b } = await sql`select badge from badges where user_id = ${me.id}`;
  const { rows: [u] } = await sql`select case when last_login >= current_date - 1 then streak else 0 end as streak, coalesce(last_login = current_date, false) as claimed from users where id = ${me.id}`;
  const c = me.character ? charById(me.character) : null;
  const nt = nextTier(me.ap);
  const acct = (await sql`select email from users where id = ${me.id}`).rows[0];
  const imgs = c ? await charImages() : {};
  return (<>
    {c && <CharWarm have={imgs} />}
    {sp.new && <p className={s.badge}>Welcome! Generate a recovery code below and save it. It is the only way to reset a forgotten password.</p>}
    {sp.reset && <p className={s.badge}>Password reset. Generate a new recovery code below.</p>}
    <div className={s.pHero}>
      <div className={s.avatar}>{c && imgs[c.id] ? <img src={imgs[c.id]} alt={c.name} className={s.avImg} /> : c ? c.emoji : '👤'}</div>
      <div>
        <h1 style={{ margin: '0 0 .4rem' }}>{me.username}</h1>
        <span className={s.rankPill}>{rankOf(me.ap)}</span>
        {c && <Link href={`/clan?id=${c.id}`}>{c.clan}</Link>}
      </div>
    </div>
    <div className={s.stats}>
      <div className={s.stat}><b>{me.ap}</b><span>AP</span></div>
      <div className={s.stat}><b>🔥 {u.streak}</b><span>Streak</span></div>
      <div className={s.stat}><b>{b.length}</b><span>Badges</span></div>
    </div>
    <div className={s.card}>
      <h2>Rank progress</h2>
      {nt ? <><div className={s.bar}><div style={{ width: `${Math.min(100, (me.ap / nt[1]) * 100)}%` }} /></div>
        <p className={s.mute}>{nt[1] - me.ap} AP to {nt[0]}</p></> : <p>Max rank reached 🎉</p>}
    </div>
    <div className={s.card}>
      <h2>Fighter</h2>
      {c ? <><p><b>{c.emoji} {c.name}</b></p><p className={s.mute}>{perkText(c.perk)}<br />Clan task: {TASKS[c.main][0]}</p><Link href="/characters">Manage fighter →</Link></>
        : <p><Link href="/characters">⚔️ Choose your fighter</Link> to boost your AP.</p>}
    </div>
    <div className={s.card}>
      <h2>Daily bonus</h2>
      {u.claimed ? <p className={s.mute}>✅ Claimed today. Come back tomorrow to keep your streak!</p>
        : <form action={claimDaily}><button className={s.btn}>Claim daily bonus</button></form>}
    </div>
    <div className={s.card}>
      <h2>Badges</h2>
      {b.length ? b.map((x) => <span key={x.badge} className={s.badge}>🏅 {x.badge}</span>) : <p className={s.mute}>None yet. Play quizzes and vote to earn some.</p>}
    </div>
    <div className={s.card}>
      <h2>Connected account</h2>
      {acct?.email ? <p>✅ Google: <b>{acct.email}</b> <span className={s.mute}>(verified)</span></p>
        : process.env.GOOGLE_CLIENT_ID ? <><p className={s.mute}>Link Google to verify your email and sign in with one tap.</p><a href="/api/auth/google?link=1" className={s.btnGhost}>Link Google account</a></>
        : <p className={s.mute}>Google sign-in is not set up yet.</p>}
    </div>
    <div className={s.card}>
      <h2>Security & alerts</h2>
      <p className={s.mute}>A recovery code lets you reset a forgotten password. A new code replaces the old one.</p>
      <CodeForm action={generateRecovery} label="Generate recovery code" />
      <p />
      <PushButton getKey={getPushKey} save={savePush} />
    </div>
  </>);
}
