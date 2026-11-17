'use server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { vapid } from '@/lib/push';
import { broadcast } from '@/lib/notify';
import { charById, TASKS, CHARS } from '@/lib/chars';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { createSession, getUser } from '@/lib/auth';
import { award, isAdmin } from '@/lib/game';

export async function signup(fd) {
  const u = String(fd.get('username') || '').trim(), p = String(fd.get('password') || '');
  if (u.length < 3 || u.length > 24 || !/^[A-Za-z0-9_.-]+$/.test(u)) redirect('/signup?e=Username: 3-24 letters, numbers, _ . - only');
  if (p.length < 6) redirect('/signup?e=Password must be 6+ characters');
  if (p !== String(fd.get('confirm') || '')) redirect('/signup?e=Passwords do not match');
  const hash = await bcrypt.hash(p, 10);
  const { rows } = await sql`insert into users(username, password_hash) values (${u}, ${hash}) on conflict do nothing returning id`;
  if (!rows[0]) redirect('/signup?e=Username taken');
  await award(rows[0].id, 10, 'Newcomer');
  await createSession(rows[0].id);
  (await cookies()).set('pickchar', '1', { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
  redirect('/profile?new=1');
}
export async function login(fd) {
  const u = String(fd.get('username') || '').trim(), p = String(fd.get('password') || '');
  const { rows } = await sql`select id, password_hash, banned from users where username = ${u}`;
  if (!rows[0] || !(await bcrypt.compare(p, rows[0].password_hash))) redirect('/login?e=Invalid credentials');
  if (rows[0].banned) redirect('/login?e=This account is suspended');
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
  if (correct) await award(me.id, q.ap, q.badge, 'quiz');
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
  await award(me.id, 10 + 5 * Math.min(streak - 1, 6), streak >= 30 ? 'Devoted' : streak >= 7 ? '7-Day Streak' : null, 'daily');
  revalidatePath('/profile'); revalidatePath('/leaderboard');
}

export async function voteMatchup(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), side = fd.get('side');
  const r = await sql`insert into matchup_votes(user_id, matchup_id) values (${me.id}, ${id}) on conflict do nothing returning user_id`;
  if (r.rows[0]) {
    if (side === 'a') await sql`update matchups set votes_a = votes_a + 1 where id = ${id}`;
    else await sql`update matchups set votes_b = votes_b + 1 where id = ${id}`;
    await award(me.id, 5, 'Arena Voter', 'vote');
  }
  revalidatePath('/arena');
}
export async function advanceRound(fd) {
  if (!isAdmin(await getUser())) return;
  const tid = +fd.get('tid');
  const { rows: m } = await sql`select * from matchups where tournament_id = ${tid} order by round desc, slot`;
  if (!m.length) return;
  const cur = m.filter((x) => x.round === m[0].round);
  if (cur.length < 2) return;
  const w = cur.map((x) => (x.votes_b > x.votes_a ? x.b : x.a));
  for (let i = 0; i < w.length; i += 2)
    await sql`insert into matchups(round, slot, a, b, tournament_id) values (${cur[0].round + 1}, ${i / 2}, ${w[i]}, ${w[i + 1]}, ${tid})`;
  revalidatePath('/arena');
}
export async function finishTournament(fd) {
  if (!isAdmin(await getUser())) return;
  const tid = +fd.get('tid');
  const { rows: m } = await sql`select * from matchups where tournament_id = ${tid} order by round desc, slot`;
  if (!m.length) return;
  const cur = m.filter((x) => x.round === m[0].round);
  if (cur.length !== 1) return;
  const f = cur[0];
  await sql`update tournaments set champion = ${f.votes_b > f.votes_a ? f.b : f.a} where id = ${tid}`;
  revalidatePath('/arena');
}
export async function voteDebate(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), side = fd.get('side');
  const r = await sql`insert into debate_votes(user_id, debate_id) values (${me.id}, ${id}) on conflict do nothing returning user_id`;
  if (r.rows[0]) {
    if (side === 'a') await sql`update debates set votes_a = votes_a + 1 where id = ${id}`;
    else await sql`update debates set votes_b = votes_b + 1 where id = ${id}`;
    await award(me.id, 5, 'Debater', 'vote');
  }
  revalidatePath('/arena');
}
export async function postDebate(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const body = String(fd.get('body') || '').trim().slice(0, 500);
  const recent = (await sql`select count(*)::int as n from debate_posts where user_id = ${me.id} and created_at > now() - interval '1 minute'`).rows[0].n;
  if (body && recent < 5) await sql`insert into debate_posts(debate_id, user_id, side, body) values (${+fd.get('id')}, ${me.id}, ${fd.get('side')}, ${body})`;
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
  if (kind === 'weekly') { try { await broadcast({ title: '🏆 New weekly contest!', body: q, url: '/quiz' }); } catch {} }
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

export async function setWatch(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), status = String(fd.get('status') || '');
  if (!id) return;
  if (status === 'remove') {
    await sql`delete from watchlist where user_id = ${me.id} and anime_id = ${id}`;
  } else if (['watching', 'completed', 'plan', 'dropped'].includes(status)) {
    const title = String(fd.get('title') || '').slice(0, 200);
    const img0 = String(fd.get('img') || '');
    const img = img0.startsWith('https://cdn.myanimelist.net/') ? img0.slice(0, 500) : '';
    const rating = Math.min(10, Math.max(0, +fd.get('rating') || 0)) || null;
    await sql`insert into watchlist(user_id, anime_id, title, img, status, rating) values (${me.id}, ${id}, ${title}, ${img}, ${status}, ${rating})
      on conflict (user_id, anime_id) do update set status = excluded.status, rating = coalesce(excluded.rating, watchlist.rating)`;
    if (status === 'completed') {
      const first = await sql`insert into watch_rewards(user_id, anime_id) values (${me.id}, ${id}) on conflict do nothing returning user_id`;
      if (first.rows[0]) {
        await award(me.id, 10, null, 'watch');
        const c = (await sql`select count(*)::int as n from watchlist where user_id = ${me.id} and status = 'completed'`).rows[0].n;
        if (c >= 5) await award(me.id, 0, 'Binge Watcher');
      }
    }
  }
  revalidatePath('/watchlist'); revalidatePath('/anime'); revalidatePath('/profile');
}

export async function postComment(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id'), body = String(fd.get('body') || '').trim().slice(0, 300);
  if (!id || !body) return;
  const recent = (await sql`select count(*)::int as n from comments where user_id = ${me.id} and created_at > now() - interval '1 minute'`).rows[0].n;
  if (recent >= 5) return;
  await sql`insert into comments(user_id, anime_id, body) values (${me.id}, ${id}, ${body})`;
  const today = (await sql`select count(*)::int as n from comments where user_id = ${me.id} and created_at >= current_date`).rows[0].n;
  if (today <= 3) await award(me.id, 2, null, 'comment');
  const total = (await sql`select count(*)::int as n from comments where user_id = ${me.id}`).rows[0].n;
  if (total >= 10) await award(me.id, 0, 'Commentator');
  revalidatePath('/anime'); revalidatePath('/profile');
}
export async function deleteComment(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id');
  if (isAdmin(me)) { await sql`delete from comment_reports where comment_id = ${id}`; await sql`delete from comments where id = ${id}`; }
  else await sql`delete from comments where id = ${id} and user_id = ${me.id}`;
  revalidatePath('/anime');
}

export async function createTournament(fd) {
  await admin();
  const title = txt(fd, 'title', 80);
  const entries = [...new Set(String(fd.get('entries') || '').split('\n').map((x) => x.trim().slice(0, 60)).filter(Boolean))];
  if (!title) redirect('/admin?e=Add a title');
  if (![4, 8, 16].includes(entries.length)) redirect(`/admin?e=Need exactly 4, 8 or 16 unique entries (you gave ${entries.length})`);
  const t = (await sql`insert into tournaments(title) values (${title}) returning id`).rows[0];
  for (let i = 0; i < entries.length; i += 2)
    await sql`insert into matchups(round, slot, a, b, tournament_id) values (1, ${i / 2}, ${entries[i]}, ${entries[i + 1]}, ${t.id})`;
  try { await broadcast({ title: '🐐 New bracket is live!', body: title, url: '/arena' }); } catch {}
  revalidatePath('/arena');
  redirect('/arena');
}

export async function reportComment(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const id = +fd.get('id');
  if (!id) return;
  await sql`insert into comment_reports(comment_id, reporter_id) values (${id}, ${me.id}) on conflict do nothing`;
  revalidatePath('/anime'); revalidatePath('/admin');
}
export async function dismissReports(fd) {
  await admin();
  await sql`delete from comment_reports where comment_id = ${+fd.get('id')}`;
  revalidatePath('/anime'); revalidatePath('/admin');
}
export async function banUser(fd) {
  await admin();
  const name = txt(fd, 'username', 40);
  if (!name || name === process.env.ADMIN_USERNAME) return;
  await sql`update users set banned = true where username = ${name}`;
  revalidatePath('/admin');
}
export async function unbanUser(fd) {
  await admin();
  await sql`update users set banned = false where username = ${txt(fd, 'username', 40)}`;
  revalidatePath('/admin');
}

const norm = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function makeCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (const x of randomBytes(12)) s += A[x % 32];
  return s.match(/.{4}/g).join('-');
}
export async function generateRecovery() {
  const me = await getUser(); if (!me) return { error: 'Log in first' };
  const code = makeCode();
  await sql`update users set recovery_hash = ${await bcrypt.hash(norm(code), 10)} where id = ${me.id}`;
  return { code };
}
export async function adminResetCode(fd) {
  await admin();
  const r = (await sql`select id from users where username = ${txt(fd, 'username', 40)}`).rows[0];
  if (!r) return { error: 'User not found' };
  const code = makeCode();
  await sql`update users set recovery_hash = ${await bcrypt.hash(norm(code), 10)} where id = ${r.id}`;
  return { code };
}
export async function resetPassword(fd) {
  const name = txt(fd, 'username', 40), p = String(fd.get('password') || '');
  if (p.length < 6) redirect('/forgot?e=Password must be 6+ characters');
  if (p !== String(fd.get('confirm') || '')) redirect('/forgot?e=Passwords do not match');
  const r = (await sql`select id, recovery_hash, banned from users where username = ${name}`).rows[0];
  if (!r || !r.recovery_hash || !(await bcrypt.compare(norm(fd.get('code')), r.recovery_hash))) redirect('/forgot?e=Invalid username or recovery code');
  if (r.banned) redirect('/login?e=This account is suspended');
  await sql`update users set password_hash = ${await bcrypt.hash(p, 10)}, recovery_hash = null where id = ${r.id}`;
  await createSession(r.id);
  redirect('/profile?reset=1');
}
export async function getPushKey() { return await vapid(); }
export async function savePush(sub) {
  const me = await getUser();
  if (!me || !sub?.endpoint || !sub?.keys) return;
  await sql`insert into push_subs(endpoint, user_id, p256dh, auth) values (${sub.endpoint}, ${me.id}, ${sub.keys.p256dh}, ${sub.keys.auth}) on conflict (endpoint) do update set user_id = excluded.user_id`;
}
export async function sendPush(fd) {
  await admin();
  const title = txt(fd, 'title', 60), body = txt(fd, 'body', 160), url = txt(fd, 'url', 100);
  if (!title) redirect('/admin?e=Add a title');
  let n = 0, bad = '';
  try { n = await broadcast({ title, body, url: url.startsWith('/') ? url : '/' }); } catch (err) { bad = String(err.message).slice(0, 80); }
  if (bad) redirect('/admin?e=' + encodeURIComponent('Push failed: ' + bad));
  redirect('/admin?ok=' + encodeURIComponent(`Sent to ${n} device(s)`));
}

export async function chooseCharacter(fd) {
  const me = await getUser(); if (!me) redirect('/login');
  const target = charById(String(fd.get('id') || ''));
  if (!target) return;
  const row = (await sql`select character from users where id = ${me.id}`).rows[0];
  if (row.character === target.id) return;
  const stop = (m) => redirect('/characters?e=' + encodeURIComponent(m));
  if (me.ap < target.cost) stop(`${target.name} needs ${target.cost} AP`);
  if (row.character) {
    const cur = charById(row.character);
    const [label, need] = TASKS[cur.main];
    const done = (await sql`select count(*)::int as n from events where user_id = ${me.id} and cat = ${cur.main} and created_at >= (select char_since from users where id = ${me.id})`).rows[0].n;
    if (done < need) stop(`Finish your clan task first: ${label} (${done}/${need})`);
  }
  await sql`update users set character = ${target.id}, char_since = now() where id = ${me.id}`;
  (await cookies()).delete('pickchar');
  revalidatePath('/', 'layout');
  redirect('/characters?ok=' + encodeURIComponent(`You joined ${target.clan}!`));
}
export async function skipPicker() {
  (await cookies()).delete('pickchar');
  revalidatePath('/', 'layout');
}

export async function markAllRead() {
  const me = await getUser(); if (!me) return;
  await sql`update notifications set is_read = true where user_id = ${me.id}`;
  revalidatePath('/inbox'); revalidatePath('/', 'layout');
}

export async function saveCharImgs(map) {
  const me = await getUser(); if (!me) return;
  const ok = /^https:\/\/(s\d+\.anilist\.co|cdn\.myanimelist\.net)\//;
  const cur = (await sql`select value from settings where key = 'charimgs'`).rows[0];
  const base = cur ? JSON.parse(cur.value) : {};
  for (const c of CHARS) { const u = map?.[c.id]; if (!base[c.id] && typeof u === 'string' && ok.test(u)) base[c.id] = u; }
  await sql`insert into settings(key, value) values ('charimgs', ${JSON.stringify(base)}) on conflict (key) do update set value = excluded.value`;
  revalidatePath('/characters'); revalidatePath('/clan'); revalidatePath('/profile');
}

export async function saveCharPic(id, dataUrl) {
  const me = await getUser();
  if (!isAdmin(me)) return { error: 'Admins only' };
  if (!CHARS.some((c) => c.id === id)) return { error: 'Unknown fighter' };
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m || m[2].length > 700000) return { error: 'Image invalid or too large' };
  await sql`create table if not exists char_pics(id text primary key, mime text, data text, updated_at timestamptz default now())`;
  await sql`insert into char_pics(id, mime, data) values (${id}, ${m[1]}, ${m[2]}) on conflict (id) do update set mime = excluded.mime, data = excluded.data, updated_at = now()`;
  revalidatePath('/characters'); revalidatePath('/clan'); revalidatePath('/profile'); revalidatePath('/', 'layout');
  return { ok: true };
}
