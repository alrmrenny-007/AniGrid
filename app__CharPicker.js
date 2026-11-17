'use client';
import { useState, useEffect } from 'react';
import { CHARS, TASKS, perkText, tierOf } from '@/lib/chars';
import s from './ui.module.css';
export default function CharPicker({ ap, counts, imgs, choose, skip }) {
  const n = Object.fromEntries(counts.map((r) => [r.character, r.n]));
  const [id, setId] = useState(CHARS[0].id);
  const [im, setIm] = useState(imgs || {});
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
              {im[x.id] ? <img className={s.fthumb} src={im[x.id]} alt="" /> : <b>{x.emoji}</b>}
              {locked(x) ? '🔒 ' : ''}{x.name.split(' ')[0]}
            </button>))}
        </div>
        <div className={s.detail}>
          <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
            {im[c.id] ? <img className={s.fbig} src={im[c.id]} alt={c.name} /> : <span style={{ fontSize: '2.4rem' }}>{c.emoji}</span>}
            <div><h2 style={{ margin: 0, fontSize: '1.15rem' }}>{c.name}</h2><span className={s.badge}>{tierOf(c)}</span></div>
          </div>
          <p className={s.mute} style={{ margin: '.4rem 0' }}>{c.blurb}</p>
          <p style={{ margin: '.3rem 0' }}><b>Ability:</b> {perkText(c.perk)}</p>
          <p className={s.mute} style={{ margin: '.3rem 0' }}>Clan: {c.clan} · {n[c.id] || 0} member(s)<br />Task to leave: {TASKS[c.main][0]}</p>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.6rem' }}>
            {locked(c) ? <span className={s.mute}>🔒 Needs {c.cost} AP. Earn it, then switch from the Clans page.</span> : (
              <form action={choose}><input type="hidden" name="id" value={c.id} /><button className={s.btn}>Choose {c.name.split(' ')[0]}</button></form>)}
            <form action={skip}><button className={s.link}>Skip for now</button></form>
          </div>
        </div>
      </div>
    </div>
  );
}
