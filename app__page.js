import s from './ui.module.css';
const NEWS = [
  ['New season simulcast schedule announced', 'Streaming platforms reveal their winter lineups.'],
  ['Studio announces movie sequel', 'A fan-favorite series is heading back to theaters.'],
  ['Manga volume hits record sales', 'Weekly rankings were topped by a long-running shonen title.'],
];
async function getSeason() {
  try {
    const r = await fetch('https://api.jikan.moe/v4/seasons/now?limit=12', { next: { revalidate: 3600 } });
    return (await r.json()).data.map((a) => ({ id: a.mal_id, title: a.title, img: a.images.jpg.image_url, score: a.score }));
  } catch { return []; }
}
export default async function Home() {
  const season = await getSeason();
  return (<>
    <h1>Latest News</h1>
    {NEWS.map(([t, d]) => <div key={t} className={s.card}><h3>{t}</h3><p className={s.mute}>{d}</p></div>)}
    <h2>Airing This Season</h2>
    {season.length === 0 && <p className={s.mute}>Seasonal feed unavailable right now.</p>}
    <div className={s.grid}>{season.map((a) => (
      <div key={a.id} className={s.card}><img src={a.img} alt={a.title} /><b>{a.title}</b><div className={s.mute}>★ {a.score ?? 'N/A'}</div></div>
    ))}</div>
  </>);
}
