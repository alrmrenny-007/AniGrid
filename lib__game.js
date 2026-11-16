import { sql } from './db';
export const TIERS = [['Genin', 0], ['Chunin', 100], ['Jonin', 300], ['Kage', 700]];
export const isAdmin = (u) => !!u && !!process.env.ADMIN_USERNAME && u.username === process.env.ADMIN_USERNAME;
export const rankOf = (ap) => [...TIERS].reverse().find((t) => ap >= t[1])[0];
export const nextTier = (ap) => TIERS.find((t) => t[1] > ap);
export async function award(uid, ap, badge) {
  await sql`update users set ap = ap + ${ap} where id = ${uid}`;
  if (badge) await sql`insert into badges(user_id, badge) values (${uid}, ${badge}) on conflict do nothing`;
}
