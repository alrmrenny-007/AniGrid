import Link from 'next/link';
import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { markAllRead } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Inbox() {
  const me = await getUser();
  if (!me) redirect('/login');
  const { rows } = await sql`select id, title, body, url, is_read, created_at from notifications where user_id = ${me.id} order by id desc limit 50`;
  const unread = rows.filter((r) => !r.is_read).length;
  return (<>
    <h1>Inbox</h1>
    {unread > 0 && <form action={markAllRead}><button className={s.btnGhost}>Mark all {unread} as read</button></form>}
    {rows.length === 0 && <p className={s.mute}>Nothing yet. Rank-ups, badges, new contests and brackets will show up here.</p>}
    <div style={{ marginTop: '1rem' }}>{rows.map((r) => (
      <Link key={r.id} href={r.url || '/'} className={`${s.nItem} ${r.is_read ? '' : s.nNew}`}>
        <b>{r.title}</b>
        {r.body && <div className={s.mute}>{r.body}</div>}
        <div className={s.mute} style={{ fontSize: '.75rem' }}>{new Date(r.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</div>
      </Link>))}
    </div>
  </>);
}
