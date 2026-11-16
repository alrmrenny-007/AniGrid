import Link from 'next/link';
import s from './ui.module.css';
import Carousel from './Carousel';
import { sql } from '@/lib/db';
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
async function getSeason() {
  try {
    const r = await fetch('https://api.jikan.moe/v4/seasons/now?limit=12', { next: { revalidate: 3600 } });
    return (await r.json()).data.map((a) => ({ id: a.mal_id, title: a.title, img: a.images.jpg.large_image_url || a.images.jpg.image_url, score: a.score }));
  } catch { return []; }
}
export default async function Home() {
  const [season, news] = await Promise.all([getSeason(), getNews()]);
  const slides = [...news, ...HIGHLIGHTS].slice(0, 5).map(([tag, title, desc], i) => ({ tag, title, desc, img: season[i]?.img }));
  const cards = news.length ? news : HIGHLIGHTS.slice(0, 3);
  return (<>
    <Carousel slides={slides} />
    <h1>Latest News</h1>
    {cards.map(([tag, t, d], i) => <div key={i} className={s.card}><span className={s.badge}>{tag}</span><h3>{t}</h3><p className={s.mute}>{d}</p></div>)}
    <h2>Airing This Season</h2>
    {season.length === 0 && <p className={s.mute}>Seasonal feed unavailable right now.</p>}
    <div className={s.grid}>{season.map((a) => (
      <div key={a.id} className={s.card}><Link href={`/anime?id=${a.id}`} style={{ color: 'inherit', display: 'block' }}><img src={a.img} alt={a.title} /><b>{a.title}</b></Link><div className={s.mute}>★ {a.score ?? 'N/A'}</div></div>
    ))}</div>
  </>);
}
