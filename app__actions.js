'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { createSession, getUser } from '@/lib/auth';
import { award } from '@/lib/game';

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

export async function submitQuiz(quizId, choice) {
  const me = await getUser(); if (!me) return { error: 'Log in to play' };
  const { rows } = await sql`select * from quizzes where id = ${quizId}`; const q = rows[0];
  const ins = await sql`insert into quiz_attempts(user_id, quiz_id) values (${me.id}, ${quizId}) on conflict do nothing returning user_id`;
  if (!ins.rows[0]) return { error: 'Already played' };
  const correct = choice === q.answer;
  if (correct) await award(me.id, q.ap, q.badge);
  revalidatePath('/quiz'); revalidatePath('/profile');
  return { correct, ap: correct ? q.ap : 0, answer: q.answer };
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
