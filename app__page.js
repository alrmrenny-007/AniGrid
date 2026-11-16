import Link from 'next/link';
import s from './ui.module.css';
import Carousel from './Carousel';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { gql, norm, F } from '@/lib/anilist';
export const dynamic = 'force-dynamic';
const HIGHLIGHTS = [
  ['Breaking', 'New season simulcast schedule announced', 'Streaming platforms reveal their full lineups for the new season.'],
  ['Event', 'GOAT Arena bracket is live', 'Vote for the greatest anime of all time and earn AP.'],
  ['Contest', 'Weekly contest is open', 'Beat the clock, win 100 AP and the Weekly Champion badge.'],
  ['Clans', 'Pick a fighter and join a clan', 'Every fighter boosts a different way to earn AP.'],
];
const GENRES = [['Action', '⚔️', 'Epic battles and non-stop adrenaline.'], ['Fantasy', '🏰', 'Magic and mythical worlds.'], ['Romance', '🌸', 'Love stories that make you smile.'], ['Sci-Fi', '🚀', 'Space, aliens and future tech.'], ['Comedy', '😂', 'Laugh-out-loud adventures.'], ['Mystery', '🔍', 'Secrets, twists and clues.']];
const FEATS = [['⚡', 'Quizzes & contests', 'Timed pop quizzes and weekly contests that award AP and badges.'], ['🐐', 'GOAT Arena', 'Vote in brackets and 1v1 debates to crown the greatest.'], ['🛡️', 'Fighters & clans', 'Pick a fighter, join a clan and boost your AP.'], ['🔥', 'Daily streaks', 'Claim a bonus every day and keep your streak alive.']];
const Q = `query($a:Int,$b:Int){
 trending:Page(perPage:14){media(type:ANIME,sort:TRENDING_DESC,isAdult:false){${F}}}
 top:Page(perPage:8){media(type:ANIME,sort:SCORE_DESC,isAdult:false){${F}}}
 airing:Page(perPage:12){media(type:ANIME,status:RELEASING,sort:POPULARITY_DESC,isAdult:false){${F}}}
 eps:Page(perPage:14){airingSchedules(airingAt_greater:$a,airingAt_lesser:$b,sort:TIME_DESC){episode media{idMal title{romaji english} coverImage{large} isAdult}}}
}`;
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
const uniq = (list) => { const seen = new Set(); return list.filter((m) => m.idMal && !seen.has(m.idMal) && seen.add(m.idMal)); };
export default async function Home() {
  const now = Math.floor(Date.now() / 1000);
  const [d, news, stats, me] = await Promise.all([gql(Q, { a: now - 7 * 86400, b: now }, 900), getNews(), getStats(), getUser()]);
  const trendingRaw = uniq(d?.trending?.media || []);
  const trending = trendingRaw.map(norm);
  const top = uniq(d?.top?.media || []).map(norm).slice(0, 6);
  const airing = uniq(d?.airing?.media || []).map(norm);
  const seen = new Set();
  const eps = (d?.eps?.airingSchedules || []).filter((e) => e.media?.idMal && !e.media.isAdult && !seen.has(e.media.idMal) && seen.add(e.media.idMal)).slice(0, 6)
    .map((e) => ({ id: e.media.idMal, title: e.media.title.english || e.media.title.romaji, img: e.media.coverImage?.large, ep: `Episode ${e.episode}` }));
  const pick = [...airing].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const heroImg = trendingRaw.find((m) => m.bannerImage)?.bannerImage;
  const slides = [...news, ...HIGHLIGHTS].slice(0, 5).map(([tag, title, desc], i) => ({ tag, title, desc, img: trendingRaw.filter((m) => m.bannerImage)[i]?.bannerImage }));
  const empty = !d;
  return (<>
    <section className={s.hero2} style={heroImg ? { backgroundImage: `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.82)),url("${heroImg}")` } : undefined}>
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
    {empty && <p className={s.mute}>The anime feed is taking a nap. Refresh in a moment.</p>}
    <div className={s.sh}><div><h2>Trending now</h2><p className={s.mute}>Live data from AniList</p></div><Link href="/browse">See all →</Link></div>
    <div className={s.rail}>{trending.slice(0, 10).map((a) => <Poster key={a.id} a={a} />)}</div>
    {pick && <section className={s.pick}>
      <img className={s.pickImg} src={pick.wide} alt={pick.title} loading="lazy" decoding="async" />
      <div>
        <div className={s.eyebrow}>Editor's pick</div>
        <h2>{pick.title}</h2>
        <p className={s.mute}>{pick.genre}{pick.year ? ` · ${pick.year}` : ''}{pick.eps ? ` · ${pick.eps} episodes` : ''} · ★ {pick.score}</p>
        <p className={s.mute}>{pick.syn.slice(0, 220)}{pick.syn.length > 220 ? '…' : ''}</p>
        <div className={s.cta} style={{ justifyContent: 'flex-start' }}><Link href={`/anime?id=${pick.id}`} className={s.btn}>View details</Link><Link href={`/anime?id=${pick.id}`} className={s.btnGhost}>+ Add to list</Link></div>
      </div>
    </section>}
    {news.length > 0 && <><div className={s.sh}><div><h2>Latest news</h2></div></div>
      {news.slice(0, 4).map(([tag, t, dd], i) => <div key={i} className={s.card}><span className={s.badge}>{tag}</span><h3>{t}</h3><p className={s.mute}>{dd}</p></div>)}</>}
    {eps.length > 0 && <><div className={s.sh}><div><h2>New episodes this week</h2><p className={s.mute}>Freshly aired, straight from the schedule</p></div></div>
      <div className={s.epGrid}>{eps.map((e) => <Link key={e.id} href={`/anime?id=${e.id}`} className={s.epRow}><img src={e.img} alt="" loading="lazy" /><div><b>{e.title}</b><span className={s.mute}>{e.ep}</span></div></Link>)}</div></>}
    <div className={s.sh}><div><h2>Top rated</h2><p className={s.mute}>The highest-scored anime of all time</p></div><Link href="/browse">See all →</Link></div>
    <div className={s.rail}>{top.map((a, i) => <Poster key={a.id} a={a} rank={i + 1} />)}</div>
    <div className={s.sh} style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}><div className={s.eyebrow}>Browse by genre</div><h2>Find something for your mood</h2></div>
    <div className={s.genreGrid}>{GENRES.map(([n, em, dd]) => <Link key={n} href={`/browse?genre=${encodeURIComponent(n)}`} className={s.genre}><span>{em}</span><b>{n}</b><span className={s.mute} style={{ fontSize: '.82rem' }}>{dd}</span></Link>)}</div>
    <div className={s.sh} style={{ flexDirection: 'column', alignItems: 'flex-start' }}><div className={s.eyebrow}>Why Senpai Hub</div><h2>Everything an anime fan actually needs</h2></div>
    <div className={s.feats}>{FEATS.map(([e, t, dd]) => <div key={t} className={s.feat}><span>{e}</span><b>{t}</b><p className={s.mute} style={{ margin: 0 }}>{dd}</p></div>)}</div>
    <section className={s.ctaBand}>
      <h2>{me ? 'Keep your streak alive' : 'Ready to start playing?'}</h2>
      <p className={s.sub} style={{ margin: '0 auto 1rem' }}>{me ? 'Claim your daily bonus and climb the ranks.' : 'Create an account to earn AP, pick a fighter and join a clan.'}</p>
      <div className={s.cta}>{me ? <Link href="/profile" className={s.btn}>Claim bonus</Link> : <><Link href="/signup" className={s.btn}>Create account</Link><Link href="/browse" className={s.btnGhost}>Browse catalog</Link></>}</div>
    </section>
  </>);
}
