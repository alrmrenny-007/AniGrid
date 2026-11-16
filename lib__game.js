import { sql } from './db';
import { charById } from './chars';
export const TIERS = [['Genin', 0], ['Chunin', 100], ['Jonin', 300], ['Kage', 700]];
export const isAdmin = (u) => !!u && !!process.env.ADMIN_USERNAME && u.username === process.env.ADMIN_USERNAME;
export const rankOf = (ap) => [...TIERS].reverse().find((t) => ap >= t[1])[0];
export const nextTier = (ap) => TIERS.find((t) => t[1] > ap);
export async function award(uid, ap, badge, cat) {
  if (cat && ap > 0) {
    const r = (await sql`select character from users where id = ${uid}`).rows[0];
    const b = charById(r?.character)?.perk?.[cat];
    if (b) ap += Math.max(1, Math.round(ap * b));
    await sql`insert into events(user_id, cat) values (${uid}, ${cat})`;
  }
  await sql`update users set ap = ap + ${ap} where id = ${uid}`;
  if (badge) await sql`insert into badges(user_id, badge) values (${uid}, ${badge}) on conflict do nothing`;
}
