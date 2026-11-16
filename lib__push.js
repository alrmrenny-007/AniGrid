import webpush from 'web-push';
import { sql } from './db';
export async function vapid() {
  let r = (await sql`select value from settings where key = 'vapid'`).rows[0];
  if (!r) {
    const k = webpush.generateVAPIDKeys();
    await sql`insert into settings(key, value) values ('vapid', ${JSON.stringify(k)}) on conflict do nothing`;
    r = (await sql`select value from settings where key = 'vapid'`).rows[0];
  }
  const k = JSON.parse(r.value);
  webpush.setVapidDetails('mailto:admin@senpai-hub.vercel.app', k.publicKey, k.privateKey);
  return k.publicKey;
}
export async function notifyAll(payload) {
  await vapid();
  const { rows } = await sql`select endpoint, p256dh, auth from push_subs`;
  await Promise.all(rows.map(async (r) => {
    try {
      await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(payload));
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await sql`delete from push_subs where endpoint = ${r.endpoint}`;
    }
  }));
  return rows.length;
}

export async function pushToUser(uid, payload) {
  await vapid();
  const { rows } = await sql`select endpoint, p256dh, auth from push_subs where user_id = ${uid}`;
  await Promise.all(rows.map(async (r) => {
    try {
      await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(payload));
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await sql`delete from push_subs where endpoint = ${r.endpoint}`;
    }
  }));
}
