import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { voteMatchup, advanceRound, finishTournament, voteDebate, postDebate } from '../actions';
export const dynamic = 'force-dynamic';
const Vote = ({ action, id, a, b, va = 0, vb = 0, locked }) => {
  const tot = va + vb;
  const pa = tot ? Math.round((va / tot) * 100) : 50;
  const side = (k, name) => locked
    ? <div className={`${s.mkSide} ${k === 'a' ? s.mkA : s.mkB}`}><span className={s.mkName}>{name}</span></div>
    : <button className={`${s.mkSide} ${k === 'a' ? s.mkA : s.mkB}`} name="side" value={k}><span className={s.mkName}>{name}</span><span className={s.mkTap}>VOTE</span></button>;
  return (
    <form action={locked ? undefined : action} className={s.mk}>
      <input type="hidden" name="id" value={id} />
      <div className={s.mkRow}>{side('a', a)}<div className={s.mkVs}>VS</div>{side('b', b)}</div>
      <div className={s.hp}><div className={s.hpA} style={{ width: pa + '%' }} /><div className={s.hpB} style={{ width: (100 - pa) + '%' }} /></div>
      <div className={s.hpNums}><b>{va}</b><span>{tot} vote{tot === 1 ? '' : 's'}</span><b>{vb}</b></div>
    </form>);
};
export default async function Arena() {
  const me = await getUser();
  const { rows: ts } = await sql`select * from tournaments order by id desc`;
  const t = ts.find((x) => !x.champion) || ts[0];
  const { rows: m } = t ? await sql`select * from matchups where tournament_id = ${t.id} order by round, slot` : { rows: [] };
  const { rows: d } = await sql`select * from debates order by id`;
  const { rows: p } = await sql`select p.*, u.username from debate_posts p join users u on u.id = p.user_id order by p.id desc limit 50`;
  const rounds = [...new Set(m.map((x) => x.round))];
  const top = m.filter((x) => x.round === Math.max(...rounds, 0));
  const halls = ts.filter((x) => x.champion);
  return (<>
    <h1>🐐 GOAT Arena</h1>
    {t && <h2>{t.title}</h2>}
    {t?.champion && <div className={s.card}><h2>🏆 Champion: {t.champion}</h2><p className={s.mute}>This bracket is finished. A new one is coming soon.</p></div>}
    {rounds.map((r) => (<div key={r}><h3>Round {r}</h3>
      {m.filter((x) => x.round === r).map((x) => (<div key={x.id} className={s.card}>
        <Vote action={voteMatchup} id={x.id} a={x.a} b={x.b} va={x.votes_a} vb={x.votes_b} locked={!!t?.champion} />
        <p className={s.mute} style={{ textAlign: 'center', margin: '.2rem 0 0' }}>{t?.champion ? 'Final result' : '+5 AP per vote'}</p></div>))}</div>))}
    {isAdmin(me) && t && !t.champion && top.length > 1 && (
      <form action={advanceRound}><input type="hidden" name="tid" value={t.id} /><button className={s.btn}>Close round & advance winners</button></form>)}
    {isAdmin(me) && t && !t.champion && top.length === 1 && rounds.length > 1 && (
      <form action={finishTournament}><input type="hidden" name="tid" value={t.id} /><button className={s.btn}>Crown the champion</button></form>)}
    {halls.length > 0 && <><h2>Hall of Fame</h2>
      {halls.map((h) => <div key={h.id} className={s.card}><b>{h.title}</b><div className={s.mute}>🏆 {h.champion}</div></div>)}</>}
    <h2>1v1 Debates</h2>
    {d.map((x) => (<div key={x.id} className={s.card}>
      <h3>{x.topic}</h3>
      <Vote action={voteDebate} id={x.id} a={x.side_a} b={x.side_b} va={x.votes_a} vb={x.votes_b} />
      <form action={postDebate}>
        <input type="hidden" name="id" value={x.id} />
        <textarea className={s.field} name="body" placeholder="Make your case…" maxLength={500} />
        <button className={s.btn} name="side" value="a">Post for A</button>{' '}
        <button className={s.btn} name="side" value="b">Post for B</button>
      </form>
      {p.filter((r) => r.debate_id === x.id).map((r) => (
        <p key={r.id}><b>{r.username}</b> <span className={s.mute}>({r.side === 'a' ? x.side_a : x.side_b})</span>: {r.body}</p>))}
    </div>))}
  </>);
}
