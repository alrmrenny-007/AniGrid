import { sql } from '@/lib/db';
export async function GET(req) {
  const k = process.env.SETUP_KEY;
  if (k && new URL(req.url).searchParams.get('key') !== k) return new Response('Forbidden', { status: 403 });
  await sql`create table if not exists users(id serial primary key, username text unique not null, password_hash text not null, ap int not null default 0, created_at timestamptz default now())`;
  await sql`alter table users add column if not exists streak int not null default 0`;
  await sql`alter table users add column if not exists last_login date`;
  await sql`create table if not exists quiz_starts(user_id int, quiz_id int, started_at timestamptz default now(), primary key(user_id, quiz_id))`;
  await sql`create table if not exists news(id serial primary key, tag text, title text, body text, created_at timestamptz default now())`;
  await sql`create table if not exists watchlist(user_id int, anime_id int, title text, img text, status text, rating int, primary key(user_id, anime_id))`;
  await sql`create table if not exists watch_rewards(user_id int, anime_id int, primary key(user_id, anime_id))`;
  await sql`create table if not exists comments(id serial primary key, user_id int, anime_id int, body text, created_at timestamptz default now())`;
  await sql`alter table users add column if not exists banned boolean not null default false`;
  await sql`create table if not exists comment_reports(comment_id int, reporter_id int, created_at timestamptz default now(), primary key(comment_id, reporter_id))`;
  await sql`create table if not exists badges(user_id int references users(id), badge text, primary key(user_id, badge))`;
  await sql`create table if not exists quizzes(id serial primary key, kind text, title text, question text, options jsonb, answer int, ap int, seconds int, badge text)`;
  await sql`create table if not exists quiz_attempts(user_id int, quiz_id int, primary key(user_id, quiz_id))`;
  await sql`create table if not exists matchups(id serial primary key, round int, slot int, a text, b text, votes_a int default 0, votes_b int default 0)`;
  await sql`create table if not exists tournaments(id serial primary key, title text, champion text, created_at timestamptz default now())`;
  await sql`alter table matchups add column if not exists tournament_id int not null default 0`;
  await sql`create table if not exists matchup_votes(user_id int, matchup_id int, primary key(user_id, matchup_id))`;
  await sql`create table if not exists debates(id serial primary key, topic text, side_a text, side_b text, votes_a int default 0, votes_b int default 0)`;
  await sql`create table if not exists debate_votes(user_id int, debate_id int, primary key(user_id, debate_id))`;
  await sql`create table if not exists debate_posts(id serial primary key, debate_id int, user_id int, side text, body text, created_at timestamptz default now())`;
  if (!(await sql`select 1 from quizzes limit 1`).rows.length) {
    const Q = [
      ['pop', 'Pop Quiz', 'Who is the Straw Hat Pirates\' captain?', ['Zoro', 'Luffy', 'Usopp', 'Sanji'], 1, 15, 15, null],
      ['pop', 'Pop Quiz', 'Which studio animated Spirited Away?', ['Ghibli', 'MAPPA', 'Bones', 'Trigger'], 0, 15, 15, null],
      ['pop', 'Pop Quiz', 'What is Edward Elric\'s alchemy forbidden act?', ['Time travel', 'Human transmutation', 'Gold making', 'Soul swap'], 1, 20, 15, 'Alchemist'],
      ['weekly', 'Weekly Contest', 'Which anime features the Survey Corps?', ['Bleach', 'Attack on Titan', 'Fairy Tail', 'Black Clover'], 1, 30, 100, 'Weekly Champion'],
    ];
    for (const q of Q) await sql`insert into quizzes(kind,title,question,options,answer,seconds,ap,badge) values (${q[0]},${q[1]},${q[2]},${JSON.stringify(q[3])}::jsonb,${q[4]},${q[5]},${q[6]},${q[7]})`;
    const A = ['Naruto', 'One Piece', 'Death Note', 'Fullmetal Alchemist: Brotherhood', 'Attack on Titan', 'Cowboy Bebop', 'Dragon Ball Z', 'Hunter x Hunter'];
    for (let i = 0; i < 4; i++) await sql`insert into matchups(round,slot,a,b) values (1,${i},${A[i * 2]},${A[i * 2 + 1]})`;
    await sql`insert into debates(topic,side_a,side_b) values ('Greatest rival ever?','Naruto vs Sasuke','Light vs L'), ('Best protagonist?','Goku','Luffy')`;
  }
  await sql`insert into tournaments(title) select 'Anime GOAT Bracket' where not exists (select 1 from tournaments)`;
  await sql`update matchups set tournament_id = (select min(id) from tournaments) where tournament_id = 0`;
  return Response.json({ ok: true });
}
