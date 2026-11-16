import Link from 'next/link';
import s from './ui.module.css';
import Carousel from './Carousel';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
const HIGHLIGHTS = [
  ['Breaking', 'New season simulcast schedule announced', 'Streaming platforms reveal their full lineups for the new season.'],
  ['Event', 'GOAT Arena bracket is live', 'Vote for the greatest anime of all time and earn AP.'],
  ['Contest', 'Weekly contest is open', 'Beat the clock, win 100 AP and the Weekly Champion badge.'],
  ['Clans', 'Pick a fighter and join a clan', 'Every fighter boosts a different way to earn AP.'],
];
const GENRES = [['Action', 1, '⚔️', 'Epic battles and non-stop adrenaline.'], ['Fantasy', 10, '🏰', 'Magic and mythical worlds.'], ['Romance', 22, '🌸', 'Love stories that make you smile.'], ['Sci-Fi', 24, '🚀', 'Space, aliens and future tech.'], ['Comedy', 4, '😂', 'Laugh-out-loud adventures.'], ['Mystery', 7, '🔍', 'Secrets, twists and clues.']];
const FEATS = [['⚡', 'Quizzes & contests', 'Timed pop quizzes and weekly contests that award AP and badges.'], ['🐐', 'GOAT Arena', 'Vote in brackets and 1v1 debates to crown the greatest.'], ['🛡️', 'Fighters & clans', 'Pick a fighter, join a clan and boost your AP.'], ['🔥', 'Daily streaks', 'Claim a bonus every day and keep your streak alive.']];
const J = 'https://api.jikan.moe/v4';
async function jikan(path) { try { return (await (await fetch(J + path, { next: { revalidate: 3600 } })).json()).data || []; } catch { return []; } }
const norm = (a) => ({ id: a.mal_id, title: a.title, thumb: a.images?.jpg?.image_url, wide: a.trailer?.images?.maximum_image_url || a.images?.jpg?.large_image_url, score: a.score, genre: a.genres?.[0]?.name || a.type || 'Anime', year: a.year, eps: a.episodes, syn: a.synopsis, live: a.status === 'Currently Airing' });
async function getNews() { try { return (await sql`select tag, title, body from news order by id desc limit 10`).rows.map((r) => [r.tag, r.title, r.body || '']); } catch { return []; } }
async function getStats() { try { return (await sql`select (select count(*)::int from users) as u, (select count(*)::int from quizzes) as q, (select coalesce(sum(ap), 0)::int from users) as ap`).rows[0]; } catch { return null; } }
const Poster = ({ a, rank }) => (
  <Link href={`/anime?id=${a.id}`} className={s.poster}>
    <img src={a.thumb} alt={a.title} loading="lazy" decoding="async" />
    <span className={`${s.chip} ${a.live ? '' : s.chipG}`}>{a.live ? 'Airing' : 'Finished'}</span>
    <span className={s.chipR}>★ {a.score ?? '–'}</span>
    {rank && <span className={s.rankNum}>{String(rank).padStart(2, '0')}</span>}
    <div><div className={s.pTitle}>{a.title}</div><div className={s.pMeta}>{a.genre}{a.eps ? ` · ${a.eps} eps` : ''}</div></div>
  </Link>
);
export default async function Home() {
  const [seasonRaw, topRaw, epsRaw, news, stats, me] = await Promise.all([jikan('/seasons/now?limit=12'), jikan('/top/anime?limit=8'), jikan('/watch/episodes?limit=8'), getNews(), getStats(), getUser()]);
  const seen = new Set();
  const season = seasonRaw.map(norm).filter((a) => !seen.has(a.id) && seen.add(a.id)).slice(0, 10);
  const top = topRaw.map(norm).slice(0, 6);
  const eps = epsRaw.slice(0, 6).map((e) => ({ id: e.entry?.mal_id, title: e.entry?.title, img: e.entry?.images?.jpg?.image_url, ep: e.episodes?.[0]?.title }));
  const pick = [...season].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const heroImg = top[0]?.wide || season[0]?.wide;
  const slides = [...news, ...HIGHLIGHTS].slice(0, 5).map(([tag, title, desc], i) => ({ tag, title, desc, img: season[i]?.wide }));
  return (<>
    <section className={s.hero2} style={heroImg ? { backgroundImage: `linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.8)),url("${heroImg}")` } : undefined}>
      <div className={s.eyebrow}>Your next story</div>
      <h1 className={s.heroTitle}>Discover your <em>next world</em></h1>
      <p className={s.sub}>Watch trends, take quizzes, join clans and climb the ranks in the GOAT Arena.</p>
      <div className={s.cta}>
        {me ? <><Link href="/quiz" className={s.btn}>Play a quiz</Link><Link href="/profile" className={s.btnGhost}>Daily bonus</Link></>
          : <><Link href="/signup" className={s.btn}>Create account</Link><Link href="/browse" className={s.btnGhost}>Browse catalog</Link></>}
      </div>
    </section>
    {stats && <div className={s.stats}>
      <div className={s.stat}><b>{stats.u}</b><span>Members</span></div>
      <div className={s.stat}><b>{stats.q}</b><span>Quizzes</span></div>
      <div className={s.stat}><b>{stats.ap}</b><span>AP earned</span></div>
    </div>}
    <Carousel slides={slides} />
    <div className={s.sh}><div><h2>Trending now</h2><p className={s.mute}>Live data from MyAnimeList</p></div><Link href="/browse">See all →</Link></div>
    <div className={s.rail}>{season.slice(0, 8).map((a) => <Poster key={a.id} a={a} />)}</div>
    {pick && <section className={s.pick}>
      <img className={s.pickImg} src={pick.wide} alt={pick.title} loading="lazy" decoding="async" />
      <div>
        <div className={s.eyebrow}>Editor's pick</div>
        <h2>{pick.title}</h2>
        <p className={s.mute}>{pick.genre}{pick.year ? ` · ${pick.year}` : ''}{pick.eps ? ` · ${pick.eps} episodes` : ''} · ★ {pick.score}</p>
        <p className={s.mute}>{(pick.syn || '').slice(0, 220)}{pick.syn?.length > 220 ? '…' : ''}</p>
        <div className={s.cta} style={{ justifyContent: 'flex-start' }}><Link href={`/anime?id=${pick.id}`} className={s.btn}>View details</Link><Link href={`/anime?id=${pick.id}`} className={s.btnGhost}>+ Add to list</Link></div>
      </div>
    </section>}
    {news.length > 0 && <><div className={s.sh}><div><h2>Latest news</h2></div></div>
      {news.slice(0, 4).map(([tag, t, d], i) => <div key={i} className={s.card}><span className={s.badge}>{tag}</span><h3>{t}</h3><p className={s.mute}>{d}</p></div>)}</>}
    {eps.length > 0 && <><div className={s.sh}><div><h2>New episodes this week</h2><p className={s.mute}>Freshly aired, straight from the schedule</p></div></div>
      <div className={s.epGrid}>{eps.map((e, i) => <Link key={i} href={`/anime?id=${e.id}`} className={s.epRow}><img src={e.img} alt="" loading="lazy" /><div><b>{e.title}</b><span className={s.mute}>{e.ep || 'New episode'}</span></div></Link>)}</div></>}
    <div className={s.sh}><div><h2>Top rated</h2><p className={s.mute}>The highest-scored anime of all time</p></div><Link href="/browse">See all →</Link></div>
    <div className={s.rail}>{top.map((a, i) => <Poster key={a.id} a={a} rank={i + 1} />)}</div>
    <div className={s.sh} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}><div className={s.eyebrow}>Browse by genre</div><h2>Find something for your mood</h2></div>
    <div className={s.genreGrid}>{GENRES.map(([n, id, em, d]) => <Link key={id} href={`/browse?genre=${id}`} className={s.genre}><span>{em}</span><b>{n}</b><span className={s.mute} style={{ fontSize: '.82rem' }}>{d}</span></Link>)}</div>
    <div className={s.sh} style={{ flexDirection: 'column', alignItems: 'flex-start' }}><div className={s.eyebrow}>Why Senpai Hub</div><h2>Everything an anime fan actually needs</h2></div>
    <div className={s.feats}>{FEATS.map(([e, t, d]) => <div key={t} className={s.feat}><span>{e}</span><b>{t}</b><p className={s.mute} style={{ margin: 0 }}>{d}</p></div>)}</div>
    <section className={s.ctaBand}>
      <h2>{me ? 'Keep your streak alive' : 'Ready to start playing?'}</h2>
      <p className={s.sub} style={{ margin: '0 auto 1rem' }}>{me ? 'Claim your daily bonus and climb the ranks.' : 'Create an account to earn AP, pick a fighter and join a clan.'}</p>
      <div className={s.cta}>{me ? <Link href="/profile" className={s.btn}>Claim bonus</Link> : <><Link href="/signup" className={s.btn}>Create account</Link><Link href="/browse" className={s.btnGhost}>Browse catalog</Link></>}</div>
    </section>
  </>);
}
