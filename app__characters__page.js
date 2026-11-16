import Link from 'next/link';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { CHARS, TASKS, perkText, tierOf, charById } from '@/lib/chars';
import { charImages } from '@/lib/charimg';
import { chooseCharacter } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Characters({ searchParams }) {
  const { e, ok } = await searchParams;
  const me = await getUser();
  const imgs = await charImages();
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
      <div style={{ display: 'flex', gap: '.9rem', alignItems: 'center' }}>
        {imgs[cur.id] ? <img src={imgs[cur.id]} alt="" className={s.fbig} /> : <span style={{ fontSize: '2.4rem' }}>{cur.emoji}</span>}
        <div><h3 style={{ margin: 0 }}>{cur.name}</h3><span className={s.mute}>{cur.clan} · {perkText(cur.perk)}</span></div>
      </div>
      <p>Clan task: {label} <b>({Math.min(done, need)}/{need})</b></p>
      <div className={s.bar}><div style={{ width: `${Math.min(100, (done / need) * 100)}%` }} /></div>
      <p className={s.mute}>{ready ? '✅ Task complete. You can switch to any fighter you have the AP for.' : 'Finish this task to unlock switching.'}</p>
    </div>}
    {!cur && me && <p className={s.mute}>You haven't chosen a fighter yet. Pick a starter below.</p>}
    <div className={s.fgrid}>
      {CHARS.map((c) => {
        const mine = cur?.id === c.id;
        let action;
        if (!me) action = <Link href="/login">Log in to join</Link>;
        else if (mine) action = <b style={{ color: '#7dff8f' }}>✓ Your fighter</b>;
        else if (me.ap < c.cost) action = <span className={s.mute}>🔒 Needs {c.cost} AP</span>;
        else if (cur && !ready) action = <span className={s.mute}>🔒 Finish your task first</span>;
        else action = <form action={chooseCharacter}><input type="hidden" name="id" value={c.id} /><button className={s.btn}>Join clan</button></form>;
        return (<div key={c.id} className={`${s.fcard} ${s['t' + tierOf(c)]}`}>
          <div className={s.fimg}>
            {imgs[c.id] ? <img src={imgs[c.id]} alt={c.name} loading="lazy" decoding="async" /> : <span>{c.emoji}</span>}
            <span className={s.chip}>{tierOf(c)}</span>
            <div className={s.fname}>{c.name}</div>
          </div>
          <div className={s.fbody}>
            <p className={s.mute} style={{ margin: '0 0 .3rem' }}>{perkText(c.perk)}</p>
            <p className={s.mute} style={{ margin: '0 0 .6rem' }}><Link href={`/clan?id=${c.id}`}>{c.clan}</Link> · {st[c.id]?.n || 0} members</p>
            {action}
          </div>
        </div>);
      })}
    </div>
  </>);
}
