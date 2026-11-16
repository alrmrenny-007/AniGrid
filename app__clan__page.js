import Link from 'next/link';
import s from '../ui.module.css';
import { sql } from '@/lib/db';
import { charById, perkText, TASKS, tierOf } from '@/lib/chars';
import { charImages } from '@/lib/charimg';
export const dynamic = 'force-dynamic';
export default async function Clan({ searchParams }) {
  const { id } = await searchParams;
  const c = charById(String(id || ''));
  if (!c) return <p className={s.mute}>Clan not found. <Link href="/characters">See all clans</Link></p>;
  const imgs = await charImages();
  const members = (await sql`select username, ap from users where character = ${c.id} order by ap desc limit 50`).rows;
  const total = members.reduce((a, m) => a + m.ap, 0);
  return (<>
    <div className={s.card}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {imgs[c.id] ? <img src={imgs[c.id]} alt={c.name} className={s.fbig} /> : <span style={{ fontSize: '2.6rem' }}>{c.emoji}</span>}
        <div><h1 style={{ margin: 0 }}>{c.clan}</h1><span className={s.badge}>{tierOf(c)}</span> <b>{c.name}</b></div>
      </div>
      <p className={s.mute}>{c.blurb}</p>
      <p>{perkText(c.perk)}</p>
      <p className={s.mute}>Task to leave: {TASKS[c.main][0]} · {members.length} member(s) · {total} AP total</p>
      <Link href="/characters">← All clans</Link>
    </div>
    <h2>Members</h2>
    {members.length === 0 && <p className={s.mute}>No members yet. Be the first!</p>}
    {members.map((m, i) => (
      <div key={m.username} className={s.lb}>
        <span className={s.pos}>{i + 1}</span>
        <Link href={`/u?name=${encodeURIComponent(m.username)}`} style={{ color: 'inherit' }}><b>{m.username}</b></Link>
        <span className={s.pts}>{m.ap} AP</span>
      </div>))}
  </>);
}
