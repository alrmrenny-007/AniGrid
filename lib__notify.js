import { sql } from './db';
import { notifyAll, pushToUser } from './push';
export async function notifyUser(uid, p) {
  try {
    await sql`insert into notifications(user_id, title, body, url) values (${uid}, ${p.title}, ${p.body || ''}, ${p.url || '/inbox'})`;
    await pushToUser(uid, { title: p.title, body: p.body || '', url: p.url || '/inbox' });
  } catch {}
}
export async function broadcast(p) {
  try { await sql`insert into notifications(user_id, title, body, url) select id, ${p.title}, ${p.body || ''}, ${p.url || '/'} from users where not banned`; } catch {}
  return await notifyAll(p);
}
