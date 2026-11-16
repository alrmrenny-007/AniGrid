'use client';
import { useState } from 'react';
import { CHARS, TASKS, perkText, tierOf } from '@/lib/chars';
import s from './ui.module.css';
export default function CharPicker({ ap, counts, choose, skip }) {
  const n = Object.fromEntries(counts.map((r) => [r.character, r.n]));
  const [id, setId] = useState(CHARS[0].id);
  const c = CHARS.find((x) => x.id === id);
  const locked = (x) => x.cost > ap;
  return (
    <div className={s.modal}>
      <div className={s.sheet}>
        <h1 style={{ fontSize: '1.6rem' }}>Choose your fighter</h1>
        <p className={s.mute}>Each fighter joins a clan and boosts the AP you earn. Switching later takes AP and a clan task.</p>
        <div className={s.roster}>
          {CHARS.map((x) => (
            <button key={x.id} type="button" onClick={() => setId(x.id)}
              className={`${s.fighter} ${id === x.id ? s.fighterSel : ''} ${locked(x) ? s.locked : ''}`}>
              <b>{locked(x) ? '🔒' : x.emoji}</b>{x.name}
            </button>))}
        </div>
        <div className={s.detail}>
          <h2 style={{ margin: 0 }}>{c.emoji} {c.name} <span className={s.badge}>{tierOf(c)}</span></h2>
          <p className={s.mute} style={{ margin: '.3rem 0' }}>{c.blurb}</p>
          <p style={{ margin: '.3rem 0' }}><b>Ability:</b> {perkText(c.perk)}</p>
          <p className={s.mute} style={{ margin: '.3rem 0' }}>Clan: {c.clan} · {n[c.id] || 0} member(s)<br />Task to leave: {TASKS[c.main][0]}</p>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.6rem' }}>
            {locked(c) ? <span className={s.mute}>🔒 Needs {c.cost} AP. Earn it, then switch from the Clans page.</span> : (
              <form action={choose}><input type="hidden" name="id" value={c.id} /><button className={s.btn}>Choose {c.name}</button></form>)}
            <form action={skip}><button className={s.link}>Skip for now</button></form>
          </div>
        </div>
      </div>
    </div>
  );
}
