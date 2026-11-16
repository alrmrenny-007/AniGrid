import Link from 'next/link';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { CHARS, TASKS, perkText, tierOf, charById } from '@/lib/chars';
import { chooseCharacter } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Characters({ searchParams }) {
  const { e, ok } = await searchParams;
  const me = await getUser();
  const st = Object.fromEntries((await sql`select character, count(*)::int as n, coalesce(sum(ap), 0)::int as ap from users where character is not null group by character`).rows.map((r) => [r.character, r]));
  const cur = me?.character ? charById(me.character) : null;
  let done = 0;
  if (cur) done = (await sql`select count(*)::int as n from events where user_id = ${me.id} and cat = ${cur.main} and created_at >= (select char_since from users where id = ${me.id})`).rows[0].n;
  const [label, need] = cur ? TASKS[cur.main] : [];
  const ready = cur && done >= need;
  return (<>
    <h1>Fighters & Clans</h1>
    {e && <p className={s.err}>{e}</p>}
    {ok && <p className={s.badge}>{ok}</p>}
    {cur && <div className={s.card}>
      <h2>{cur.emoji} {cur.name} · {cur.clan}</h2>
      <p className={s.mute}>{perkText(cur.perk)}</p>
      <p>Clan task: {label} <b>({Math.min(done, need)}/{need})</b></p>
      <div className={s.bar}><div style={{ width: `${Math.min(100, (done / need) * 100)}%` }} /></div>
      <p className={s.mute}>{ready ? '✅ Task complete. You can switch to any fighter you have the AP for.' : 'Finish this task to unlock switching.'}</p>
    </div>}
    {!cur && me && <p className={s.mute}>You haven't chosen a fighter yet. Pick a starter below.</p>}
    <div className={s.grid}>
      {CHARS.map((c) => {
        const mine = cur?.id === c.id;
        let action;
        if (!me) action = <Link href="/login">Log in to join</Link>;
        else if (mine) action = <b>✓ Your fighter</b>;
        else if (me.ap < c.cost) action = <span className={s.mute}>🔒 Needs {c.cost} AP</span>;
        else if (cur && !ready) action = <span className={s.mute}>🔒 Finish your task first</span>;
        else action = <form action={chooseCharacter}><input type="hidden" name="id" value={c.id} /><button className={s.btn}>Join clan</button></form>;
        return (<div key={c.id} className={s.card}>
          <div style={{ fontSize: '2.2rem' }}>{c.emoji}</div>
          <b>{c.name}</b> <span className={s.badge}>{tierOf(c)}</span>
          <p className={s.mute} style={{ margin: '.3rem 0' }}>{perkText(c.perk)}</p>
          <p className={s.mute} style={{ margin: '.3rem 0' }}><Link href={`/clan?id=${c.id}`}>{c.clan}</Link> · {st[c.id]?.n || 0} members · {st[c.id]?.ap || 0} AP</p>
          {action}
        </div>);
      })}
    </div>
  </>);
}
