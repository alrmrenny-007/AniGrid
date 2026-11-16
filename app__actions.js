'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { createSession, getUser } from '@/lib/auth';
import { award, isAdmin } from '@/lib/game';

export async function signup(fd) {
  const u = String(fd.get('username') || '').trim(), p = String(fd.get('password') || '');
  if (u.length < 3 || p.length < 6) redirect('/login?e=Username 3+ chars, password 6+ chars');
  const hash = await bcrypt.hash(p, 10);
  const { rows } = await sql`insert into users(username, password_hash) values (${u}, ${hash}) on conflict do nothing returning id`;
  if (!rows[0]) redirect('/login?e=Username taken');
  await award(rows[0].id, 10, 'Newcomer');
  await createSession(rows[0].id);
  redirect('/profile');
}
export async function login(fd) {
  const u = String(fd.get('username') || '').trim(), p = String(fd.get('password') || '');
  const { rows } = await sql`select id, password_hash from users where username = ${u}`;
  if (!rows[0] || !(await bcrypt.compare(p, rows[0].password_hash))) redirect('/login?e=Invalid credentials');
  await createSession(rows[0].id);
  redirect('/profile');
}
export async function logout() { (await cookies()).delete('session'); redirect('/'); }

export async function startQuiz(quizId) {
  const me = await getUser(); if (!me) return { error: 'Log in to play' };
  const { rows } = await sql`select seconds from quizzes where id = ${quizId}`;
  if ((await sql`select 1 from quiz_attempts where user_id = ${me.id} and quiz_id = ${quizId}`).rows[0]) return { error: 'Already played' };
  await sql`insert into quiz_starts(user_id, quiz_id) values (${me.id}, ${quizId}) on conflict do nothing`;
  const st = await sql`select extract(epoch from (now() - started_at)) as el from quiz_starts where user_id = ${me.id} and quiz_id = ${quizId}`;
  return { remaining: Math.max(0, Math.ceil(rows[0].seconds - Number(st.rows[0].el))) };
}

export async function submitQuiz(quizId, choice) {
  const me = await getUser(); if (!me) return { error: 'Log in to play' };
  const { rows } = await sql`select * from quizzes where id = ${quizId}`; const q = rows[0];
  const ins = await sql`insert into quiz_attempts(user_id, quiz_id) values (${me.id}, ${quizId}) on conflict do nothing returning user_id`;
  if (!ins.rows[0]) return { error: 'Already played' };
  const st = await sql`select extract(epoch from (now() - started_at)) as el from quiz_starts where user_id = ${me.id} and quiz_id = ${quizId}`;
  const late = !st.rows[0] || Number(st.rows[0].el) > q.seconds + 3;
  const correct = !late && choice === q.answer;
  if (correct) await award(me.id, q.ap, q.badge);
  revalidatePath('/quiz'); revalidatePath('/profile');
  return { correct, late, ap: correct ? q.ap : 0, answer: q.answer };
}

export async function claimDaily() {
  const me = await getUser(); if (!me) redirect('/login');
  const { rows } = await sql`select streak, last_login, (current_date - last_login) as gap from users where id = ${me.id}`;
  const u = rows[0];
  if (u.last_login && Number(u.gap) === 0) return;
  const streak = u.last_login && Number(u.gap) === 1 ? u.streak + 1 : 1;
  await sql`update users set streak = ${streak}, last_login = current_date where id = ${me.id}`;
  await award(me.id, 10 + 5 * Math.min(streak - 1, 6), streak >= 30 ? 'Devoted' : streak >= 7 ? '7-Day Streak' : null);
  revalidatePath('/profile'); revalidatePath('/leaderboard');
}

export async function voteMatchup(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), side = fd.get('side');
  const r = await sql`insert into matchup_votes(user_id, matchup_id) values (${me.id}, ${id}) on conflict do nothing returning user_id`;
  if (r.rows[0]) {
    if (side === 'a') await sql`update matchups set votes_a = votes_a + 1 where id = ${id}`;
    else await sql`update matchups set votes_b = votes_b + 1 where id = ${id}`;
    await award(me.id, 5, 'Arena Voter');
  }
  revalidatePath('/arena');
}
export async function advanceRound() {
  if (!isAdmin(await getUser())) return;
  const { rows: m } = await sql`select * from matchups order by round desc, slot`;
  const cur = m.filter((x) => x.round === m[0].round);
  if (cur.length < 2) return;
  const w = cur.map((x) => (x.votes_b > x.votes_a ? x.b : x.a));
  for (let i = 0; i < w.length; i += 2)
    await sql`insert into matchups(round, slot, a, b) values (${cur[0].round + 1}, ${i / 2}, ${w[i]}, ${w[i + 1]})`;
  revalidatePath('/arena');
}
export async function voteDebate(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), side = fd.get('side');
  const r = await sql`insert into debate_votes(user_id, debate_id) values (${me.id}, ${id}) on conflict do nothing returning user_id`;
  if (r.rows[0]) {
    if (side === 'a') await sql`update debates set votes_a = votes_a + 1 where id = ${id}`;
    else await sql`update debates set votes_b = votes_b + 1 where id = ${id}`;
    await award(me.id, 5, 'Debater');
  }
  revalidatePath('/arena');
}
export async function postDebate(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const body = String(fd.get('body') || '').trim().slice(0, 500);
  if (body) await sql`insert into debate_posts(debate_id, user_id, side, body) values (${+fd.get('id')}, ${me.id}, ${fd.get('side')}, ${body})`;
  revalidatePath('/arena');
}

async function admin() { const me = await getUser(); if (!isAdmin(me)) redirect('/'); return me; }
const txt = (fd, k, n = 200) => String(fd.get(k) || '').trim().slice(0, n);

export async function createQuiz(fd) {
  await admin();
  const raw = [1, 2, 3, 4].map((i) => txt(fd, 'o' + i, 80));
  const q = txt(fd, 'question', 200);
  const right = raw[+fd.get('answer')];
  const opts = raw.filter(Boolean);
  const idx = opts.indexOf(right);
  if (!q || opts.length < 2 || !right || idx < 0) return;
  const kind = fd.get('kind') === 'weekly' ? 'weekly' : 'pop';
  const secs = Math.min(120, Math.max(5, +fd.get('seconds') || 20));
  const ap = Math.min(500, Math.max(1, +fd.get('ap') || 15));
  const badge = txt(fd, 'badge', 40) || null;
  await sql`insert into quizzes(kind,title,question,options,answer,seconds,ap,badge) values (${kind},${kind === 'weekly' ? 'Weekly Contest' : 'Pop Quiz'},${q},${JSON.stringify(opts)}::jsonb,${idx},${secs},${ap},${badge})`;
  revalidatePath('/quiz'); revalidatePath('/admin');
}
export async function deleteQuiz(fd) {
  await admin();
  const id = +fd.get('id');
  await sql`delete from quiz_attempts where quiz_id = ${id}`;
  await sql`delete from quiz_starts where quiz_id = ${id}`;
  await sql`delete from quizzes where id = ${id}`;
  revalidatePath('/quiz'); revalidatePath('/admin');
}
export async function createNews(fd) {
  await admin();
  const title = txt(fd, 'title', 120);
  if (!title) return;
  await sql`insert into news(tag,title,body) values (${txt(fd, 'tag', 20) || 'News'},${title},${txt(fd, 'body', 300)})`;
  revalidatePath('/'); revalidatePath('/admin');
}
export async function deleteNews(fd) {
  await admin();
  await sql`delete from news where id = ${+fd.get('id')}`;
  revalidatePath('/'); revalidatePath('/admin');
}
export async function createDebate(fd) {
  await admin();
  const topic = txt(fd, 'topic', 120), a = txt(fd, 'a', 60), b = txt(fd, 'b', 60);
  if (!topic || !a || !b) return;
  await sql`insert into debates(topic,side_a,side_b) values (${topic},${a},${b})`;
  revalidatePath('/arena');
}
