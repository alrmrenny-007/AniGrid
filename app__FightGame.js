'use client';
import { useEffect, useRef, useState } from 'react';
import { CHARS, FX, charById, tierOf } from '@/lib/chars';
import { createMatch, step, aiInput, W, H, DIFFS } from '@/lib/fight';
import { makeArt, artStep, artTick, artDraw } from '@/lib/fightart';
import { drawHud } from '@/lib/fighthud';
import s from './ui.module.css';
const cfg = (id) => { const c = charById(id); return { id, emote: FX[id].emote, tier: c.cost === 0 ? 0 : c.cost < 300 ? 1 : 2, cat: c.main }; };
const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', j: 'punch', J: 'punch', k: 'kick', K: 'kick', l: 'block', L: 'block', Shift: 'block', u: 'special', U: 'special', i: 'special' };
function Btn({ inp, k, cls, children }) {
  const on = (e) => { e.preventDefault(); inp.current[k] = true; try { e.currentTarget.setPointerCapture(e.pointerId); } catch {} };
  const off = () => { inp.current[k] = false; };
  return <button type="button" className={`${s.fbtn} ${cls || ''}`} onPointerDown={on} onPointerUp={off} onPointerCancel={off} onContextMenu={(e) => e.preventDefault()}>{children}</button>;
}
function Tiles({ value, onPick, imgs }) {
  return (<div className={s.rail}>{CHARS.map((c) => (
    <button key={c.id} type="button" onClick={() => onPick(c.id)} style={{ flex: '0 0 78px' }} className={`${s.fighter} ${value === c.id ? s.fighterSel : ''}`}>
      {imgs[c.id] ? <img className={s.fthumb} src={imgs[c.id]} alt="" /> : <b>{c.emoji}</b>}{c.name.split(' ')[0]}
    </button>))}</div>);
}
export default function FightGame({ me, imgs, start, finish }) {
  const own = me?.character || null;
  const [view, setView] = useState('menu');
  const [mine, setMine] = useState(own || 'ronin');
  const [opp, setOpp] = useState(() => CHARS.find((c) => c.id !== (own || 'ronin')).id);
  const [diff, setDiff] = useState('normal');
  const [err, setErr] = useState('');
  const [res, setRes] = useState(null);
  const inp = useRef({});
  const cvRef = useRef(null);
  const fid = useRef(null);
  const ranked = !!me && own === mine;
  const go = async () => {
    setErr(''); fid.current = null;
    if (me) { const r = await start(mine, opp, diff); if (r?.error) { setErr(r.error); return; } fid.current = r.id; }
    setView('play');
  };
  const done = async (m) => {
    const won = m.winner === 0;
    let r = { msg: me ? '' : 'Log in to earn AP and clan points.' };
    if (me && fid.current) { try { r = await finish(fid.current, won, m.frame); } catch { r = { msg: 'Could not save the result.' }; } }
    setRes({ won, ...r }); setView('result');
  };
  useEffect(() => {
    if (view !== 'play') return;
    inp.current = {};
    const cv = cvRef.current, ctx = cv.getContext('2d');
    cv.width = W * 2; cv.height = H * 2; ctx.setTransform(2, 0, 0, 2, 0, 0);
    const m = createMatch(cfg(mine), cfg(opp), { seed: (Date.now() % 65535) + 1, diff });
    m.names = [charById(mine).name, charById(opp).name];
    const im = {};
    for (const id of new Set([mine, opp])) if (imgs[id]) { const i = new Image(); i.src = imgs[id]; im[id] = i; }
    const st = Object.assign(makeArt(), { last: performance.now(), acc: 0, raf: 0, ended: false });
    const loop = (now) => {
      st.acc += Math.min(100, now - st.last) * (m.phase === 'ko' ? 0.5 : 1); st.last = now;
      while (st.acc >= 1000 / 60) {
        st.acc -= 1000 / 60;
        if (st.freeze > 0) { st.freeze--; artTick(st); continue; }
        step(m, inp.current, aiInput(m, 1));
        artStep(m, st);
      }
      artDraw(ctx, m, im, st, drawHud);
      if (m.phase === 'over' && !st.ended) { st.ended = true; setTimeout(() => done(m), 1500); }
      st.raf = requestAnimationFrame(loop);
    };
    st.raf = requestAnimationFrame(loop);
    const kd = (e) => { const k = KEYS[e.key]; if (k) { inp.current[k] = true; e.preventDefault(); } };
    const ku = (e) => { const k = KEYS[e.key]; if (k) inp.current[k] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { cancelAnimationFrame(st.raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, [view]);

  if (view === 'play') return (
    <div>
      <canvas ref={cvRef} className={s.fcanvas} />
      <div className={s.fpad}>
        <div className={s.fgrp}><Btn inp={inp} k="left">◀</Btn><Btn inp={inp} k="right">▶</Btn><Btn inp={inp} k="jump">⤒</Btn></div>
        <div className={s.fgrp2}><Btn inp={inp} k="punch" cls={s.fbtnA}>👊</Btn><Btn inp={inp} k="kick" cls={s.fbtnA}>🦵</Btn><Btn inp={inp} k="block">🛡</Btn><Btn inp={inp} k="special" cls={s.fbtnA}>✨</Btn></div>
      </div>
      <p className={s.mute} style={{ textAlign: 'center' }}>Land hits to fill the gold bar, then tap ✨ for a special. Keys: arrows/WASD, J punch, K kick, L block, U special.</p>
    </div>);
  if (view === 'result') return (
    <div className={s.card} style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.2rem' }}>{res.won ? '🏆 VICTORY' : '💀 DEFEAT'}</h1>
      {res.ap > 0 && <p><b>+{res.ap} AP</b> and <b>+{res.ap} points</b> for {res.clan}!</p>}
      {res.msg && <p className={s.mute}>{res.msg}</p>}
      <div className={s.cta}><button className={s.btn} onClick={go}>Rematch</button><button className={s.btnGhost} onClick={() => setView('menu')}>Change fighters</button></div>
    </div>);
  return (
    <div>
      <h2>Your fighter</h2>
      <Tiles value={mine} onPick={setMine} imgs={imgs} />
      <h2>Opponent <button type="button" className={s.link} onClick={() => setOpp(CHARS[Math.floor(Math.random() * CHARS.length)].id)}>🎲 random</button></h2>
      <Tiles value={opp} onPick={setOpp} imgs={imgs} />
      <h2>Difficulty</h2>
      <div className={s.chips}>{Object.keys(DIFFS).map((d) => <button key={d} type="button" onClick={() => setDiff(d)} className={`${s.gchip} ${diff === d ? s.gchipOn : ''}`}>{d} · +{DIFFS[d].ap}</button>)}</div>
      <p className={s.mute}>{ranked ? `🏆 Ranked: a win earns ${DIFFS[diff].ap} AP and ${DIFFS[diff].ap} points for ${charById(mine).clan}.` : me ? (own ? '🥋 Practice: only your own clan fighter earns points.' : '🥋 Practice: choose a fighter on the Clans page to earn clan points.') : '🥋 Practice mode. Log in to earn points.'}</p>
      {err && <p className={s.err}>{err}</p>}
      <button className={s.btn} onClick={go}>⚔️ FIGHT!</button>
    </div>);
}
