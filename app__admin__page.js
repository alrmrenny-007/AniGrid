import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { createQuiz, deleteQuiz, createNews, deleteNews, createDebate, createTournament } from '../actions';
export const dynamic = 'force-dynamic';
const Del = ({ action, id }) => (
  <form action={action}><input type="hidden" name="id" value={id} /><button className={s.btn}>Delete</button></form>
);
const Row = ({ children }) => (
  <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', justifyContent: 'space-between', margin: '.5rem 0' }}>{children}</div>
);
export default async function Admin({ searchParams }) {
  const { e } = await searchParams;
  const me = await getUser();
  if (!isAdmin(me)) redirect('/');
  const { rows: quizzes } = await sql`select id, kind, question from quizzes order by id desc`;
  const { rows: news } = await sql`select id, tag, title from news order by id desc limit 20`;
  return (<>
    <h1>Admin Panel</h1>
    {e && <p className={s.err}>{e}</p>}

    <div className={s.card}>
      <h2>Post news</h2>
      <form action={createNews}>
        <input className={s.field} name="tag" placeholder="Tag (Breaking, Movie, Manga...)" maxLength={20} />
        <input className={s.field} name="title" placeholder="Headline" maxLength={120} required />
        <textarea className={s.field} name="body" placeholder="Short description" maxLength={300} />
        <button className={s.btn}>Publish</button>
      </form>
      {news.map((n) => <Row key={n.id}><span><b>{n.tag}</b> {n.title}</span><Del action={deleteNews} id={n.id} /></Row>)}
    </div>

    <div className={s.card}>
      <h2>Add quiz / contest</h2>
      <form action={createQuiz}>
        <select className={s.field} name="kind"><option value="pop">Pop quiz</option><option value="weekly">Weekly contest</option></select>
        <input className={s.field} name="question" placeholder="Question" maxLength={200} required />
        {[1, 2, 3, 4].map((i) => <input key={i} className={s.field} name={'o' + i} placeholder={`Option ${i}${i > 2 ? ' (optional)' : ''}`} maxLength={80} required={i < 3} />)}
        <select className={s.field} name="answer"><option value="0">Correct: option 1</option><option value="1">Correct: option 2</option><option value="2">Correct: option 3</option><option value="3">Correct: option 4</option></select>
        <input className={s.field} name="seconds" type="number" placeholder="Seconds (5-120)" defaultValue={20} />
        <input className={s.field} name="ap" type="number" placeholder="AP reward" defaultValue={15} />
        <input className={s.field} name="badge" placeholder="Badge name (optional)" maxLength={40} />
        <button className={s.btn}>Add quiz</button>
      </form>
      {quizzes.map((q) => <Row key={q.id}><span className={s.mute}>[{q.kind}] {q.question}</span><Del action={deleteQuiz} id={q.id} /></Row>)}
    </div>

    <div className={s.card}>
      <h2>New bracket</h2>
      <p className={s.mute}>Enter exactly 4, 8 or 16 names, one per line. Neighbors face each other in round 1. This becomes the active bracket.</p>
      <form action={createTournament}>
        <input className={s.field} name="title" placeholder="Bracket title (e.g. Greatest Villain)" maxLength={80} required />
        <textarea className={s.field} name="entries" rows={8} placeholder={"Naruto\nOne Piece\nBleach\nDeath Note"} required />
        <button className={s.btn}>Create bracket</button>
      </form>
    </div>

    <div className={s.card}>
      <h2>New debate</h2>
      <form action={createDebate}>
        <input className={s.field} name="topic" placeholder="Topic (e.g. Greatest villain?)" maxLength={120} required />
        <input className={s.field} name="a" placeholder="Side A" maxLength={60} required />
        <input className={s.field} name="b" placeholder="Side B" maxLength={60} required />
        <button className={s.btn}>Create debate</button>
      </form>
    </div>
  </>);
}
