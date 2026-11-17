import { sql } from './db';
export async function fightTables() {
  await sql`create table if not exists fights(id serial primary key, user_id int, fighter text, opp text, diff text, started_at timestamptz default now(), finished boolean not null default false, won boolean, rewarded int not null default 0)`;
  await sql`create table if not exists clan_scores(clan text primary key, points int not null default 0)`;
}
