import Link from 'next/link';
import { redirect } from 'next/navigation';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { isAdmin } from '@/lib/game';
import { setWatch, postComment, deleteComment } from '../actions';
export const dynamic = 'force-dynamic';
const ST = [['watching', 'Watching'], ['plan', 'Plan to watch'], ['completed', 'Completed'], ['dropped', 'Dropped']];
export default async function Anime({ searchParams }) {
  const { id } = await searchParams;
  const n = parseInt(id);
  if (!n) redirect('/');
  let a = null;
  try { a = (await (await fetch(`https://api.jikan.moe/v4/anime/${n}`, { next: { revalidate: 3600 } })).json()).data; } catch {}
  if (!a) return <p className={s.mute}>Couldn't load this anime right now. Try again in a moment.</p>;
  const me = await getUser();
  const mine = me ? (await sql`select status, rating from watchlist where user_id = ${me.id} and anime_id = ${n}`).rows[0] : null;
  const { rows: comments } = await sql`select c.id, c.body, c.created_at, c.user_id, u.username from comments c join users u on u.id = c.user_id where c.anime_id = ${n} order by c.id desc limit 50`;
  const img = a.images.jpg.large_image_url || a.images.jpg.image_url;
  return (<>
    <div className={s.card}>
      <div style={{ maxWidth: 220, margin: '0 auto' }}><img src={img} alt={a.title} /></div>
      <h1>{a.title}</h1>
      <div>
        {a.score && <span className={s.badge}>★ {a.score}</span>}
        {a.episodes && <span className={s.badge}>{a.episodes} eps</span>}
        {a.status && <span className={s.badge}>{a.status}</span>}
        {a.year && <span className={s.badge}>{a.year}</span>}
        {(a.genres || []).map((g) => <span key={g.mal_id} className={s.badge}>{g.name}</span>)}
      </div>
      <p className={s.mute}>{(a.synopsis || 'No synopsis available.').slice(0, 700)}</p>
    </div>
    <div className={s.card}>
      <h2>Your list</h2>
      {!me ? <p><Link href="/login">Log in</Link> to track this anime.</p> : (
        <form action={setWatch}>
          <input type="hidden" name="id" value={n} />
          <input type="hidden" name="title" value={a.title} />
          <input type="hidden" name="img" value={img} />
          <select className={s.field} name="rating" defaultValue={mine?.rating || 0}>
            <option value="0">No rating</option>
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>★ {r}/10</option>)}
          </select>
          {ST.map(([v, l]) => <button key={v} className={s.opt} name="status" value={v}>{mine?.status === v ? '✓ ' : ''}{l}{v === 'completed' ? ' (+10 AP first time)' : ''}</button>)}
          {mine && <button className={s.opt} name="status" value="remove">Remove from list</button>}
        </form>)}
    </div>
    <div className={s.card}>
      <h2>Comments ({comments.length})</h2>
      {me ? (
        <form action={postComment}>
          <input type="hidden" name="id" value={n} />
          <textarea className={s.field} name="body" placeholder="Share your thoughts… (+2 AP, first 3 a day)" maxLength={300} required />
          <button className={s.btn}>Post</button>
        </form>) : <p><Link href="/login">Log in</Link> to comment.</p>}
      {comments.map((c) => (
        <div key={c.id} style={{ margin: '.8rem 0', paddingTop: '.6rem', borderTop: '1px solid rgba(242,133,0,.2)' }}>
          <Link href={`/u?name=${encodeURIComponent(c.username)}`}><b>{c.username}</b></Link>{' '}
          <span className={s.mute}>{new Date(c.created_at).toLocaleDateString('en-US')}</span>
          <p style={{ margin: '.3rem 0' }}>{c.body}</p>
          {me && (me.id === c.user_id || isAdmin(me)) && (
            <form action={deleteComment}><input type="hidden" name="id" value={c.id} /><button className={s.link}>Delete</button></form>)}
        </div>))}
    </div>
  </>);
}
