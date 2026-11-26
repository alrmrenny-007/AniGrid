import { W, H, GROUND } from './fight';
import { FX } from './chars';
const hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const STY = {
  ronin: ['#9dffb0', '#22b04a', 'wave'], kitsune: ['#a8ecff', '#2f8cff', 'orb'], sakura: ['#ffd0e0', '#ff6f9f', 'petal'], monk: ['#d6ff80', '#2fe05a', 'bolt'], otaku: ['#fff2a0', '#ffb020', 'bolt'],
  shinobi: ['#ff3a3a', '#6a1a8a', 'smoke'], oracle: ['#ff58e0', '#7a2ad0', 'smoke'], scholar: ['#d0ffd0', '#2fe05a', 'orb'], bard: ['#ffffff', '#a0c0ff', 'wave'], samurai: ['#ff9a8a', '#e0301f', 'wave'],
  emperor: ['#ffd860', '#3a2a5a', 'smoke'], idol: ['#ffd8ff', '#ff58d8', 'spark'], phoenix: ['#ffe070', '#ff5a10', 'fire'], oni: ['#ff9a90', '#8a1030', 'fire'], archivist: ['#e0f0ff', '#4aa0ff', 'bolt'],
};
const sty = (id) => { const s = STY[id] || STY.ronin; return { c1: hx(s[0]), c2: hx(s[1]), fx: s[2] }; };
const CW = 54, CH = 72;
const WORDS = ['POW!', 'BAM!', 'WHAM!', 'CRACK!'];
export function makeArt() {
  return { banner: '', freeze: 0, shake: 0, zoom: 0, flash: 0, lines: 0, frame: 0, fx: [], ps: [], trails: [[], []], cutin: null, hitFlash: [0, 0], koT: [0, 0], seen: new WeakSet(), proj: [] };
}
function spawn(st, o) { if (st.ps.length < 260) st.ps.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 18, max: 18, s: 2.5, c: [255, 255, 255], a: 1 }, o, { max: o.life || 18 })); }
function burst(st, x, y, c, n, sp = 2.4, s = 2.5) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, v = Math.random() * sp; spawn(st, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.4, g: 0.05, life: 14 + Math.random() * 12, s, c }); } }
export function artTick(st) {
  st.frame++;
  st.shake *= 0.86; st.zoom *= 0.88; st.flash *= 0.88; st.lines *= 0.9;
  st.hitFlash[0] = Math.max(0, st.hitFlash[0] - 1); st.hitFlash[1] = Math.max(0, st.hitFlash[1] - 1);
  if (st.cutin) { st.cutin.t++; if (st.cutin.t > st.cutin.len) st.cutin = null; }
  st.fx.forEach((e) => e.life--); st.fx = st.fx.filter((e) => e.life > 0);
  for (const p of st.ps) { p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life--; }
  st.ps = st.ps.filter((p) => p.life > 0);
}
export function artStep(m, st) {
  artTick(st);
  if (st.frame % 8 === 0) spawn(st, { x: Math.random() * W, y: -4, vx: -0.35, vy: 0.5 + Math.random() * 0.4, life: 360, s: 1.8, c: [255, 160, 190], a: 0.9, k: 'petal' });
  m.f.forEach((f, i) => {
    const S = sty(f.id);
    st.trails[i].unshift({ x: f.x, y: f.y, f: f.face, st: f.st, t: f.t, atk: f.atk }); if (st.trails[i].length > 5) st.trails[i].pop();
    st.koT[i] = f.st === 'ko' ? st.koT[i] + 1 : 0;
    if (f.meter >= 50 && st.frame % 3 === 0) spawn(st, { x: f.x + (Math.random() - 0.5) * 36, y: f.y - 8 - Math.random() * 50, vy: -0.7, life: 24, s: 2.2, c: S.c1, a: 0.85 });
    if (f.st === 'atk' && f.atk.kind === 'special') {
      if (f.t === 1 && !st.cutin) { st.cutin = { i, id: f.id, t: 0, len: 44 }; st.freeze = 44; st.lines = 1; }
      if (f.t < f.atk.start && f.t % 2 === 0) for (let q = 0; q < 3; q++) { const a = Math.random() * 6.283; spawn(st, { x: f.x + f.face * 14 + Math.cos(a) * 30, y: f.y - 34 + Math.sin(a) * 30, vx: -Math.cos(a) * 1.5, vy: -Math.sin(a) * 1.5, life: 14, s: 2.6, c: S.c1 }); }
    }
  });
  m.proj.forEach((p) => {
    const S = sty(m.f[p.o].id), d = Math.sign(p.vx) || 1;
    if (!st.seen.has(p)) { st.seen.add(p); st.shake = Math.max(st.shake, 3); burst(st, p.x, p.y, S.c1, 14, 3, 3); st.fx.push({ k: 'ring', x: p.x, y: p.y, life: 14, max: 14, c: S.c1 }); }
    const f = S.fx;
    if (f === 'fire') spawn(st, { x: p.x - d * 6, y: p.y + (Math.random() - 0.5) * 8, vy: -0.5, life: 14, s: 5, c: Math.random() < 0.5 ? S.c1 : S.c2 });
    else if (f === 'smoke') spawn(st, { x: p.x - d * 6, y: p.y, vy: -0.2, life: 20, s: 6, c: S.c2, a: 0.55 });
    else if (f === 'petal') spawn(st, { x: p.x - d * 6, y: p.y + (Math.random() - 0.5) * 14, vy: 0.2, life: 22, s: 3, c: S.c2 });
    else spawn(st, { x: p.x - d * 8, y: p.y + (Math.random() - 0.5) * 10, life: 10, s: 3.2, c: Math.random() < 0.5 ? S.c1 : S.c2 });
  });
  for (const e of m.ev) {
    if (e.t === 'hit') {
      let di = 0, best = 1e9; m.f.forEach((f, i) => { const dd = Math.abs(f.x - e.x); if (dd < best) { best = dd; di = i; } });
      const S = sty(m.f[1 - di].id);
      st.fx.push({ k: 'hit', x: e.x, y: e.y, life: 16, max: 16, w: e.dmg > 9 ? 'BOOM!' : WORDS[(st.frame >> 1) % WORDS.length], big: e.dmg > 9, c: S.c1, r: (Math.random() - 0.5) * 0.5 });
      st.fx.push({ k: 'ring', x: e.x, y: e.y, life: 12, max: 12, c: [255, 230, 160] });
      burst(st, e.x, e.y, [255, 255, 255], 8, 3.2, 2.4); burst(st, e.x, e.y, S.c1, 10, 3.6, 2.6);
      st.shake = Math.max(st.shake, e.dmg > 9 ? 7 : 4.5); st.zoom = 1; st.hitFlash[di] = 6; st.freeze = Math.max(st.freeze, e.dmg > 9 ? 5 : 3);
    } else if (e.t === 'block') { st.fx.push({ k: 'block', x: e.x, y: e.y, life: 10, max: 10 }); burst(st, e.x, e.y, [140, 255, 170], 8, 2.4, 2.2); }
    else if (e.t === 'ko') { st.banner = 'K.O.!'; st.shake = 11; st.flash = 0.8; st.lines = 1; st.zoom = 1.6; st.freeze = Math.max(st.freeze, 14); m.f.forEach((f) => { if (f.hp <= 0) { burst(st, f.x, f.y - 30, [255, 210, 120], 34, 4.5, 3.4); st.fx.push({ k: 'ring', x: f.x, y: f.y - 30, life: 18, max: 18, c: [255, 230, 160] }); } }); }
    else if (e.t === 'time') st.banner = 'TIME!';
    else if (e.t === 'round') st.banner = '';
    else if (e.t === 'over') st.banner = (m.names ? m.names[e.w] : 'P' + (e.w + 1)) + ' WINS';
  }
  st.proj = m.proj;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function cover(ctx, img, x, y, w, h, c1) {
  if (img && img.complete && img.naturalWidth) { const r = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r; ctx.drawImage(img, x + (w - dw) / 2, y, dw, dh); }
  else { ctx.fillStyle = rgba(c1, 0.35); ctx.fillRect(x, y, w, h); }
}
function pose(f, m, t, i, st) {
  let ox = 0, oy = 0, rot = 0, sx = 1, sy = 1; const fc = f.face;
  sy += Math.sin(t * 3 + i) * 0.012; rot += Math.sin(t * 2.2 + i) * 0.015;
  if (f.st === 'walk') { oy = -Math.abs(Math.sin(t * 11)) * 2.5; rot += fc * (Math.sign(f.vx * fc) || 1) * 0.07; }
  if (f.y < GROUND - 3) { sy = 1.07; sx = 0.95; rot += fc * 0.05 * (f.vy < 0 ? -1 : 1); }
  if (f.st === 'block') { rot = -fc * 0.08; sy = 0.96; sx = 1.04; }
  if (f.st === 'hit') { rot = -fc * 0.28; ox = -fc * 3 + Math.sin(f.stun * 3) * 2; sx = 1.05; sy = 0.94; }
  if (f.st === 'atk' && f.atk) {
    const a = f.atk, tt = f.t, s = a.start, ac = a.active;
    if (tt < s) { const w = tt / s; rot = -fc * 0.14 * w; ox = -fc * 5 * w; sx = 1 - 0.04 * w; sy = 1 + 0.03 * w; if (a.kind === 'special') ox += Math.sin(tt * 2.2) * 1.5; }
    else if (tt < s + ac) { rot = fc * 0.2; ox = fc * (a.kind === 'kick' ? 16 : 12); sx = 1.08; sy = 0.96; if (a.kind === 'kick') oy = -4; if (a.kind === 'special') { ox = fc * 8; rot = fc * 0.12; sx = 1.1; } }
    else { const r = (tt - s - ac) / Math.max(1, a.rec); rot = fc * 0.2 * (1 - r); ox = fc * 12 * (1 - r); }
  }
  if (f.st === 'ko') { const k = Math.min(1, st.koT[i] / 12); rot = -fc * 1.3 * k; oy = 8 * k; }
  else if ((m.phase === 'ko' || m.phase === 'over')) { oy = -Math.abs(Math.sin(t * 6)) * 8; rot = Math.sin(t * 6) * 0.08; }
  return { ox, oy, rot, sx, sy };
}
function card(ctx, img, S, p, alpha, flash, ko) {
  ctx.save(); ctx.globalAlpha = alpha;
  rr(ctx, -CW / 2, -CH, CW, CH, 7); ctx.save(); ctx.clip();
  cover(ctx, img, -CW / 2, -CH, CW, CH, S.c1);
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${0.15 + flash * 0.07})`; ctx.fillRect(-CW / 2, -CH, CW, CH); }
  if (ko) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(-CW / 2, -CH, CW, CH); }
  const g = ctx.createLinearGradient(0, -CH, 0, 0); g.addColorStop(0.6, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = g; ctx.fillRect(-CW / 2, -CH, CW, CH);
  ctx.restore();
  rr(ctx, -CW / 2, -CH, CW, CH, 7); const bg = ctx.createLinearGradient(-CW / 2, -CH, CW / 2, 0); bg.addColorStop(0, rgba(S.c1, 1)); bg.addColorStop(1, rgba(S.c2, 1));
  ctx.lineWidth = 2.6; ctx.strokeStyle = flash > 0 ? '#fff' : bg; ctx.stroke();
  ctx.restore();
}
function stage(ctx, m, st) {
  const pan = ((m.f[0].x + m.f[1].x) / 2 - 180) * 0.04;
  const g = ctx.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#12060a'); g.addColorStop(0.6, '#5a2208'); g.addColorStop(1, '#c25a00');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, GROUND + 20);
  const mg = ctx.createRadialGradient(W * 0.66 - pan, 70, 8, W * 0.66 - pan, 70, 70); mg.addColorStop(0, 'rgba(255,200,130,.85)'); mg.addColorStop(0.4, 'rgba(255,160,80,.25)'); mg.addColorStop(1, 'rgba(255,120,40,0)');
  ctx.fillStyle = mg; ctx.fillRect(0, 0, W, GROUND);
  ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(W * 0.66 - pan, 70, 26, 0, 7); ctx.fill();
  ctx.fillStyle = '#2a120a'; ctx.beginPath(); ctx.moveTo(-20, GROUND); ctx.lineTo(30 - pan * 2, GROUND - 55); ctx.lineTo(90 - pan * 2, GROUND - 22); ctx.lineTo(160 - pan * 2, GROUND - 70); ctx.lineTo(240 - pan * 2, GROUND - 28); ctx.lineTo(310 - pan * 2, GROUND - 62); ctx.lineTo(W + 20, GROUND - 20); ctx.lineTo(W + 20, GROUND); ctx.fill();
  ctx.fillStyle = '#1a0d08'; ctx.beginPath(); ctx.moveTo(-20, GROUND); ctx.lineTo(50 - pan * 3, GROUND - 28); ctx.lineTo(120 - pan * 3, GROUND - 10); ctx.lineTo(200 - pan * 3, GROUND - 36); ctx.lineTo(280 - pan * 3, GROUND - 12); ctx.lineTo(W + 20, GROUND - 30); ctx.lineTo(W + 20, GROUND); ctx.fill();
  ctx.fillStyle = '#7a1212'; ctx.fillRect(152 - pan * 4, GROUND - 62, 6, 62); ctx.fillRect(202 - pan * 4, GROUND - 62, 6, 62); ctx.fillRect(138 - pan * 4, GROUND - 66, 84, 7); ctx.fillRect(146 - pan * 4, GROUND - 54, 68, 4);
  [22, 338].forEach((x) => { ctx.fillStyle = '#2a1a10'; ctx.fillRect(x - 1.5, GROUND - 42, 3, 42); const lg = ctx.createRadialGradient(x, GROUND - 46, 2, x, GROUND - 46, 24); lg.addColorStop(0, 'rgba(255,190,90,1)'); lg.addColorStop(1, 'rgba(255,120,30,0)'); ctx.fillStyle = lg; ctx.fillRect(x - 26, GROUND - 72, 52, 52); ctx.fillStyle = '#ffcf80'; ctx.beginPath(); ctx.arc(x, GROUND - 46, 5, 0, 7); ctx.fill(); });
  const fg = ctx.createLinearGradient(0, GROUND, 0, H); fg.addColorStop(0, '#2a1d12'); fg.addColorStop(1, '#0a0806'); ctx.fillStyle = fg; ctx.fillRect(-20, GROUND, W + 40, H - GROUND + 20);
  ctx.strokeStyle = 'rgba(255,160,60,.18)'; ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 14, GROUND); ctx.lineTo(W / 2 + i * 70, H); ctx.stroke(); }
  [GROUND + 7, GROUND + 17, GROUND + 30].forEach((y) => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); });
  ctx.fillStyle = '#F28500'; ctx.fillRect(0, GROUND, W, 2);
}
function slash(ctx, f, S) {
  if (f.st !== 'atk' || !f.atk || f.atk.kind === 'special') return;
  const a = f.atk; if (f.t < a.start || f.t >= a.start + a.active) return;
  const k = (f.t - a.start) / a.active, d = f.face, cx = f.x + d * 18, cy = f.y - (a.kind === 'kick' ? 24 : 38), r = a.range * 1.0 + 10;
  ctx.save(); ctx.lineCap = 'round';
  if (a.kind === 'kick') { for (const [w, col] of [[9, rgba(S.c1, 0.45)], [3.5, 'rgba(255,255,255,.95)']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(cx - d * 6, cy + 18, r, d > 0 ? -1.0 + k * 0.5 : Math.PI - 0.2 - k * 0.5, d > 0 ? 0.2 + k * 0.5 : Math.PI + 1.0 - k * 0.5 + 0.0, d < 0); ctx.stroke(); } }
  else { for (let i = 0; i < 4; i++) { const y = cy - 12 + i * 8, l = 22 + i * 4 + k * 12; ctx.strokeStyle = i % 2 ? rgba(S.c1, 0.8) : 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(f.x + d * 26, y); ctx.lineTo(f.x + d * (26 + l), y); ctx.stroke(); } }
  ctx.restore();
}
function proj(ctx, p, S, st, fr) {
  const d = Math.sign(p.vx) || 1, x = p.x, y = p.y, f = S.fx;
  ctx.save();
  if (f === 'wave') { for (const [w, col] of [[10, rgba(S.c2, 0.5)], [5, rgba(S.c1, 0.95)], [2, '#fff']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x - d * 22, y, 28, d > 0 ? -1.0 : Math.PI - 1.0, d > 0 ? 1.0 : Math.PI + 1.0); ctx.stroke(); } }
  else if (f === 'bolt') { ctx.strokeStyle = rgba(S.c1, 0.9); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x - d * 34, y); for (let i = 1; i <= 6; i++) ctx.lineTo(x - d * 34 + d * i * 6, y + (((fr * 7 + i * 13) % 11) - 5) * 1.3); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke(); const g = ctx.createRadialGradient(x, y, 1, x, y, 13); g.addColorStop(0, '#fff'); g.addColorStop(1, rgba(S.c2, 0)); ctx.fillStyle = g; ctx.fillRect(x - 14, y - 14, 28, 28); }
  else if (f === 'fire') { for (let i = 0; i < 3; i++) { ctx.fillStyle = rgba(i === 0 ? S.c2 : S.c1, 0.8 - i * 0.15); ctx.beginPath(); ctx.arc(x - d * (4 - i * 3) + ((fr + i * 3) % 4) - 2, y + ((fr * 2 + i) % 5) - 2, 13 - i * 3, 0, 7); ctx.fill(); } }
  else if (f === 'smoke') { ctx.fillStyle = rgba(S.c2, 0.6); ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.fillStyle = rgba(S.c1, 0.9); ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); }
  else if (f === 'petal') { for (let i = 0; i < 7; i++) { const a = fr * 0.25 + i * 0.9; ctx.fillStyle = rgba(i % 2 ? S.c1 : S.c2, 0.95); ctx.save(); ctx.translate(x + Math.cos(a) * 13, y + Math.sin(a) * 13); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.6, 0, 0, 7); ctx.fill(); ctx.restore(); } }
  else if (f === 'spark') { ctx.fillStyle = rgba(S.c1, 1); for (let i = 0; i < 4; i++) { const a = fr * 0.2 + i * 1.57, r = 9 + (i % 2) * 6, cx = x + Math.cos(a) * r, cy = y + Math.sin(a) * r; ctx.beginPath(); for (let q = 0; q < 8; q++) { const rr2 = q % 2 ? 1.6 : 5, an = q * Math.PI / 4; ctx.lineTo(cx + Math.cos(an) * rr2, cy + Math.sin(an) * rr2); } ctx.closePath(); ctx.fill(); } ctx.fillStyle = rgba(S.c2, 0.6); ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); }
  else { const g = ctx.createRadialGradient(x, y, 2, x, y, 18); g.addColorStop(0, '#fff'); g.addColorStop(0.35, rgba(S.c1, 0.95)); g.addColorStop(1, rgba(S.c2, 0)); ctx.fillStyle = g; ctx.fillRect(x - 20, y - 20, 40, 40); ctx.strokeStyle = rgba(S.c1, 0.9); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, fr * 0.3, fr * 0.3 + 4.2); ctx.stroke(); }
  ctx.restore();
}
function burstShape(ctx, e) {
  const k = 1 - e.life / e.max, r = (e.big ? 26 : 19) * (0.6 + Math.min(1, k * 3) * 0.5), a = Math.min(1, e.life / 6);
  ctx.save(); ctx.translate(e.x, e.y - 10); ctx.rotate(e.r); ctx.globalAlpha = a;
  ctx.beginPath(); for (let i = 0; i < 16; i++) { const rr2 = i % 2 ? r * 0.55 : r; const an = i * Math.PI / 8; ctx.lineTo(Math.cos(an) * rr2, Math.sin(an) * rr2); } ctx.closePath();
  ctx.fillStyle = '#ffe14a'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#ff6a10'; ctx.stroke();
  ctx.fillStyle = '#1a0a05'; ctx.font = `italic 900 ${e.big ? 11 : 9}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(e.w, 0, 1);
  ctx.restore();
}
function cutin(ctx, st, im, m) {
  const c = st.cutin; if (!c) return;
  const S = sty(c.id), t = c.t, len = c.len, inn = Math.min(1, t / 8), out = Math.min(1, (len - t) / 8), a = Math.min(inn, out), left = c.i === 0;
  const slide = (1 - Math.min(1, t / 9)) * 120 * (left ? -1 : 1);
  ctx.save(); ctx.fillStyle = `rgba(0,0,0,${0.55 * a})`; ctx.fillRect(0, 0, W, H);
  ctx.beginPath(); ctx.moveTo(0, 74); ctx.lineTo(W, 52); ctx.lineTo(W, 150); ctx.lineTo(0, 172); ctx.closePath();
  const bg = ctx.createLinearGradient(0, 0, W, 0); bg.addColorStop(left ? 0 : 1, rgba(S.c1, 0.95)); bg.addColorStop(left ? 1 : 0, rgba(S.c2, 0.95)); ctx.globalAlpha = a; ctx.fillStyle = bg; ctx.fill(); ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1.4; for (let i = 0; i < 26; i++) { const y = 54 + ((i * 29 + t * 9) % 120), x = ((i * 53 + t * 40) % (W + 80)) - 40; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 46, y); ctx.stroke(); }
  const img = im[c.id], ih = 150, iw = ih * 0.8, ix = (left ? 4 : W - iw - 4) + slide, iy = 38;
  if (img && img.complete && img.naturalWidth) { ctx.globalAlpha = a; const r = Math.max(iw / img.naturalWidth, ih / img.naturalHeight); ctx.drawImage(img, ix + (iw - img.naturalWidth * r) / 2, iy, img.naturalWidth * r, img.naturalHeight * r); }
  ctx.restore();
  const f = FX[c.id] || { cry: '', say: '' }, tx = left ? W - 14 : 14;
  ctx.globalAlpha = a; ctx.textAlign = left ? 'right' : 'left'; ctx.textBaseline = 'middle';
  ctx.font = `italic 900 26px "Hiragino Sans","Noto Sans CJK JP","Yu Gothic",sans-serif`; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText(f.cry, tx + (Math.random() - 0.5) * 1.5, 108); ctx.fillStyle = '#fff'; ctx.fillText(f.cry, tx, 108);
  ctx.font = 'italic 700 10px sans-serif'; ctx.lineWidth = 3; ctx.strokeText((f.say || '').toUpperCase(), tx, 128); ctx.fillStyle = rgba(S.c1, 1); ctx.fillText((f.say || '').toUpperCase(), tx, 128);
  ctx.restore();
}
export function artDraw(ctx, m, im, st, hud) {
  const t = st.frame / 60;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  const z = 1 + st.zoom * 0.025, sx = (Math.random() - 0.5) * st.shake, sy = (Math.random() - 0.5) * st.shake;
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  stage(ctx, m, st);
  const S = m.f.map((f) => sty(f.id)), P = m.f.map((f, i) => pose(f, m, t, i, st));
  m.f.forEach((f, i) => {
    ctx.save(); ctx.beginPath(); ctx.rect(0, GROUND, W, H - GROUND); ctx.clip(); ctx.translate(0, 2 * GROUND); ctx.scale(1, -1);
    ctx.translate(f.x + P[i].ox, f.y + P[i].oy); ctx.rotate(P[i].rot); ctx.scale(P[i].sx, P[i].sy); card(ctx, im[f.id], S[i], P[i], 0.22, 0, false); ctx.restore();
  });
  const fl = ctx.createLinearGradient(0, GROUND, 0, H); fl.addColorStop(0, 'rgba(20,10,5,0)'); fl.addColorStop(1, 'rgba(10,6,4,.85)'); ctx.fillStyle = fl; ctx.fillRect(0, GROUND, W, H - GROUND);
  m.f.forEach((f, i) => { const hh = Math.max(0, GROUND - f.y); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(f.x, GROUND + 3, Math.max(8, 22 - hh * 0.15), 5, 0, 0, 7); ctx.fill(); });
  ctx.globalCompositeOperation = 'lighter';
  m.f.forEach((f, i) => {
    const big = f.meter >= 50 || (f.st === 'atk' && f.atk.kind === 'special'), r = big ? 52 + Math.sin(t * 9) * 4 : 38, al = big ? 0.5 : 0.18;
    const g = ctx.createRadialGradient(f.x, f.y - 32, 4, f.x, f.y - 32, r); g.addColorStop(0, rgba(S[i].c1, al)); g.addColorStop(1, rgba(S[i].c2, 0)); ctx.fillStyle = g; ctx.fillRect(f.x - r, f.y - 32 - r, r * 2, r * 2);
  });
  ctx.globalCompositeOperation = 'source-over';
  m.f.forEach((f, i) => {
    const moving = Math.abs(f.vx) > 1.9 || (f.st === 'atk' && f.t >= f.atk.start && f.t < f.atk.start + f.atk.active) || (f.st === 'hit' && Math.abs(f.vx) > 1.5);
    if (moving) st.trails[i].slice(1, 5).forEach((g, k) => { ctx.save(); ctx.translate(g.x + P[i].ox, g.y + P[i].oy); ctx.rotate(P[i].rot); ctx.scale(P[i].sx, P[i].sy); card(ctx, im[f.id], S[i], P[i], 0.28 - k * 0.06, 0, false); ctx.restore(); });
    ctx.save(); ctx.translate(f.x + P[i].ox, f.y + P[i].oy); ctx.rotate(P[i].rot); ctx.scale(P[i].sx, P[i].sy);
    card(ctx, im[f.id], S[i], P[i], 1, st.hitFlash[i], f.st === 'ko'); ctx.restore();
    if (f.st === 'block') { const bx = f.x + f.face * 14, by = f.y - 34, g = ctx.createRadialGradient(bx, by, 8, bx, by, 40); g.addColorStop(0, 'rgba(120,255,160,0)'); g.addColorStop(1, 'rgba(120,255,160,.4)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, 40, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(180,255,200,.9)'; ctx.lineWidth = 2; ctx.stroke(); }
    slash(ctx, f, S[i]);
  });
  m.proj.forEach((p) => proj(ctx, p, S[p.o], st, st.frame));
  ctx.globalCompositeOperation = 'lighter';
  st.ps.forEach((p) => { const k = p.life / p.max; ctx.fillStyle = rgba(p.c, Math.min(1, k * 1.5) * p.a); if (p.k === 'petal') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.life * 0.1); ctx.beginPath(); ctx.ellipse(0, 0, p.s * 1.2, p.s * 0.6, 0, 0, 7); ctx.fill(); ctx.restore(); } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (0.4 + k * 0.6), 0, 7); ctx.fill(); } });
  ctx.globalCompositeOperation = 'source-over';
  st.fx.forEach((e) => {
    if (e.k === 'ring') { const k = 1 - e.life / e.max; ctx.strokeStyle = rgba(e.c, 1 - k); ctx.lineWidth = 3 * (1 - k) + 0.5; ctx.beginPath(); ctx.arc(e.x, e.y, 6 + k * 36, 0, 7); ctx.stroke(); }
    else if (e.k === 'hit') burstShape(ctx, e);
    else if (e.k === 'block') { ctx.fillStyle = 'rgba(170,255,190,.9)'; ctx.font = 'italic 900 9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BLOCK', e.x, e.y - 14 - (1 - e.life / e.max) * 8); }
  });
  ctx.restore();
  cutin(ctx, st, im, m);
  if (hud) hud(ctx, m, st, im);
}
