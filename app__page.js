import Link from 'next/link';
import s from './ui.module.css';
import Carousel from './Carousel';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
const HIGHLIGHTS = [
  ['Breaking', 'New season simulcast schedule announced', 'Streaming platforms reveal their full lineups for the new season.'],
  ['Movie', 'Studio announces sequel for a fan-favorite series', 'The story returns to theaters with the original cast.'],
  ['Manga', 'Record-breaking volume sales this week', 'A long-running shonen title tops the weekly rankings again.'],
  ['Event', 'GOAT Arena bracket is live', 'Vote for the greatest anime of all time and earn AP.'],
  ['Contest', 'Weekly contest is open', 'Beat the clock, win 100 AP and the Weekly Champion badge.'],
];
async function getNews() {
  try { return (await sql`select tag, title, body from news order by id desc limit 10`).rows.map((r) => [r.tag, r.title, r.body || '']); }
  catch { return []; }
}
async function getStats() {
  try { return (await sql`select (select count(*)::int from users) as u, (select count(*)::int from quizzes) as q, (select coalesce(sum(ap), 0)::int from users) as ap`).rows[0]; }
  catch { return null; }
}
async function getSeason() {
  try {
    const r = await fetch('https://api.jikan.moe/v4/seasons/now?limit=12', { next: { revalidate: 3600 } });
    return (await r.json()).data.map((a) => ({ id: a.mal_id, title: a.title, img: a.images.jpg.large_image_url || a.images.jpg.image_url, thumb: a.images.jpg.image_url, score: a.score }));
  } catch { return []; }
}
export default async function Home() {
  const [season, news, stats, me] = await Promise.all([getSeason(), getNews(), getStats(), getUser()]);
  const slides = [...news, ...HIGHLIGHTS].slice(0, 5).map(([tag, title, desc], i) => ({ tag, title, desc, img: season[i]?.img }));
  const cards = news.length ? news : HIGHLIGHTS.slice(0, 3);
  return (<>
    <section className={s.hero}>
      <div>
        <div className={s.eyebrow}>Season online</div>
        <h1 className={s.heroTitle} style={{ background: 'none', WebkitTextFillColor: 'initial' }}>Rise through <em>the ranks</em></h1>
        <p className={s.sub}>Quizzes, brackets and clan wars. Pick a fighter, earn AP and prove you are the greatest otaku.</p>
        <div className={s.cta}>
          {me ? <><Link href="/quiz" className={s.btn}>Play a quiz</Link><Link href="/profile" className={s.btnGhost}>Daily bonus</Link></>
            : <><Link href="/signup" className={s.btn}>Join now</Link><Link href="/login" className={s.btnGhost}>Log in</Link></>}
        </div>
      </div>
      <div className={s.emblem}>★</div>
    </section>
    {stats && <div className={s.stats}>
      <div className={s.stat}><b>{stats.u}</b><span>Members</span></div>
      <div className={s.stat}><b>{stats.q}</b><span>Quizzes</span></div>
      <div className={s.stat}><b>{stats.ap}</b><span>AP earned</span></div>
    </div>}
    <Carousel slides={slides} />
    <h2>Latest news</h2>
    {cards.map(([tag, t, d], i) => <div key={i} className={s.card}><span className={s.badge}>{tag}</span><h3>{t}</h3><p className={s.mute}>{d}</p></div>)}
    <h2>Airing this season</h2>
    {season.length === 0 && <p className={s.mute}>Seasonal feed unavailable right now.</p>}
    <div className={s.grid}>{season.map((a) => (
      <div key={a.id} className={s.card}><Link href={`/anime?id=${a.id}`} style={{ color: 'inherit', display: 'block' }}><img src={a.thumb} alt={a.title} loading="lazy" decoding="async" /><b>{a.title}</b></Link><div className={s.mute}>★ {a.score ?? 'N/A'}</div></div>
    ))}</div>
  </>);
}
