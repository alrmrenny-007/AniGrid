import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { voteMatchup, advanceRound, voteDebate, postDebate } from '../actions';
const Vote = ({ action, id, a, b }) => (
  <form action={action} className={s.vs}>
    <input type="hidden" name="id" value={id} />
    <button className={s.btn} name="side" value="a">{a}</button><b>VS</b>
    <button className={s.btn} name="side" value="b">{b}</button>
  </form>);
export default async function Arena() {
  const { rows: m } = await sql`select * from matchups order by round, slot`;
  const { rows: d } = await sql`select * from debates order by id`;
  const { rows: p } = await sql`select p.*, u.username from debate_posts p join users u on u.id = p.user_id order by p.id desc limit 50`;
  const rounds = [...new Set(m.map((x) => x.round))];
  const top = m.filter((x) => x.round === Math.max(...rounds, 0));
  return (<>
    <h1>🐐 GOAT Arena</h1>
    <h2>Tournament Bracket</h2>
    {rounds.map((r) => (<div key={r}><h3>Round {r}</h3>
      {m.filter((x) => x.round === r).map((x) => (<div key={x.id} className={s.card}>
        <Vote action={voteMatchup} id={x.id} a={x.a} b={x.b} />
        <p className={s.mute}>{x.votes_a} – {x.votes_b} (+5 AP per vote)</p></div>))}</div>))}
    {top.length > 1 && <form action={advanceRound}><button className={s.btn}>Close round & advance winners</button></form>}
    {top.length === 1 && rounds.length > 1 && <h2>🏆 Champion: {top[0].votes_b > top[0].votes_a ? top[0].b : top[0].a}</h2>}
    <h2>1v1 Debates</h2>
    {d.map((x) => (<div key={x.id} className={s.card}>
      <h3>{x.topic}</h3>
      <Vote action={voteDebate} id={x.id} a={x.side_a} b={x.side_b} />
      <p className={s.mute}>{x.votes_a} – {x.votes_b}</p>
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
