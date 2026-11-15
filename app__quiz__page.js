import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import Quiz from './Quiz';
export default async function QuizPage() {
  const me = await getUser();
  const { rows } = await sql`select q.id, q.kind, q.title, q.question, q.options, q.seconds, q.ap, q.badge,
    exists(select 1 from quiz_attempts a where a.quiz_id = q.id and a.user_id = ${me?.id ?? 0}) as done
    from quizzes q order by q.kind desc, q.id`;
  return (<>
    <h1>Quizzes & Contests</h1>
    {!me && <p className={s.mute}>Log in to earn AP.</p>}
    <p className={s.mute}>The timer starts when the page loads. Each quiz can be played once.</p>
    {rows.map((q) => q.done ? <div key={q.id} className={s.card}>✅ {q.title}: completed</div> : <Quiz key={q.id} q={q} />)}
  </>);
}
