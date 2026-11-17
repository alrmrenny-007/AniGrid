import { FX } from './chars';
let ctx;
const AC = () => {
  if (typeof window === 'undefined') return null;
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};
export const muted = () => typeof localStorage !== 'undefined' && localStorage.getItem('mute') === '1';
export const setMuted = (v) => { try { localStorage.setItem('mute', v ? '1' : '0'); } catch {} };
function tone(c, { type = 'sine', f = 440, to, dur = 0.3, g = 0.2, at = 0 }) {
  const o = c.createOscillator(), a = c.createGain(), t = c.currentTime + at;
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(g, t + 0.02); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(a); a.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
function noise(c, { dur = 0.3, type = 'bandpass', f = 1000, to, q = 1, g = 0.25, at = 0 }) {
  const n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), fl = c.createBiquadFilter(), a = c.createGain(), t = c.currentTime + at;
  s.buffer = b; fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(a); a.connect(c.destination); s.start(t);
}
const FXS = {
  slash: (c) => { noise(c, { dur: 0.25, f: 6000, to: 800, q: 2, g: 0.4 }); tone(c, { type: 'triangle', f: 2200, to: 900, dur: 0.5, g: 0.08, at: 0.05 }); tone(c, { f: 3300, dur: 0.6, g: 0.05, at: 0.08 }); },
  swirl: (c) => { noise(c, { dur: 0.7, f: 300, to: 3000, q: 4, g: 0.35 }); tone(c, { type: 'sawtooth', f: 120, to: 400, dur: 0.6, g: 0.1 }); tone(c, { f: 80, dur: 0.3, g: 0.3, at: 0.6 }); },
  chime: (c) => { [880, 1320, 1760, 2093].forEach((f, i) => tone(c, { f, dur: 0.6, g: 0.12, at: i * 0.09 })); },
  zap: (c) => { for (let i = 0; i < 6; i++) noise(c, { dur: 0.06, type: 'highpass', f: 2500, g: 0.3, at: i * 0.07 }); tone(c, { type: 'sawtooth', f: 60, dur: 0.5, g: 0.15 }); },
  alchemy: (c) => { noise(c, { dur: 0.08, f: 1500, q: 3, g: 0.4 }); tone(c, { f: 1200, to: 2400, dur: 0.5, g: 0.1, at: 0.05 }); noise(c, { dur: 0.3, type: 'highpass', f: 3000, g: 0.15, at: 0.1 }); },
  shadow: (c) => { tone(c, { f: 400, to: 80, dur: 0.9, g: 0.25 }); noise(c, { dur: 0.9, f: 200, to: 1200, g: 0.15 }); },
  geass: (c) => { tone(c, { type: 'sawtooth', f: 90, to: 60, dur: 1, g: 0.12 }); tone(c, { f: 1760, to: 2640, dur: 0.8, g: 0.06, at: 0.1 }); tone(c, { f: 880, dur: 1, g: 0.05, at: 0.1 }); },
  bubble: (c) => { [500, 650, 800, 1000, 1250].forEach((f, i) => tone(c, { f, to: f * 1.3, dur: 0.12, g: 0.15, at: i * 0.09 })); },
  boing: (c) => { tone(c, { f: 200, to: 900, dur: 0.25, g: 0.25 }); tone(c, { f: 900, to: 300, dur: 0.35, g: 0.2, at: 0.25 }); },
  flute: (c) => { [659, 784, 880].forEach((f, i) => tone(c, { f, dur: 0.45, g: 0.12, at: i * 0.25 })); tone(c, { type: 'triangle', f: 2600, dur: 0.8, g: 0.04, at: 0.7 }); },
  stab: (c) => { [262, 330, 392, 523].forEach((f) => tone(c, { type: 'square', f, dur: 0.7, g: 0.05 })); tone(c, { f: 65, dur: 0.8, g: 0.3 }); },
  idol: (c) => { [1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(c, { type: 'triangle', f, dur: 0.3, g: 0.1, at: i * 0.07 })); },
  fire: (c) => { noise(c, { dur: 0.9, type: 'lowpass', f: 600, to: 2500, q: 0.7, g: 0.45 }); noise(c, { dur: 0.5, type: 'highpass', f: 4000, g: 0.12, at: 0.2 }); tone(c, { type: 'sawtooth', f: 70, to: 45, dur: 0.9, g: 0.15 }); },
  gong: (c) => { [110, 165, 233, 311].forEach((f, i) => tone(c, { f, dur: 1.6, g: 0.18 - i * 0.03 })); noise(c, { dur: 0.2, f: 200, q: 0.5, g: 0.3 }); },
  chirp: (c) => { for (let i = 0; i < 8; i++) tone(c, { type: 'sawtooth', f: 3200 + i * 80, to: 5200, dur: 0.07, g: 0.07, at: i * 0.06 }); },
};
function speak(text) {
  try {
    const s = window.speechSynthesis; if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.95; u.pitch = 1.1; u.volume = 0.9;
    const v = s.getVoices().find((x) => x.lang && x.lang.startsWith('ja'));
    if (v) u.voice = v;
    setTimeout(() => s.speak(u), 400);
  } catch {}
}
export function playFx(id) {
  if (muted()) return;
  const f = FX[id]; if (!f) return;
  const c = AC(); if (!c) return;
  try { FXS[f.sfx](c); } catch {}
  speak(f.cry);
}
