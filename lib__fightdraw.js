import { W, H, GROUND } from './fight';
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fighter(ctx, f, img, m) {
  const w = 46, h = 62;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(f.x, GROUND + 3, 22, 5, 0, 0, 7); ctx.fill();
  let ox = 0, oy = 0, rot = 0;
  const hitting = f.st === 'atk' && f.t >= f.atk.start && f.t < f.atk.start + f.atk.active;
  if (hitting) ox = f.face * 10;
  if (f.st === 'hit') ox = -f.face * 3 + (Math.random() - 0.5) * 3;
  if (f.st === 'walk') oy = Math.sin(m.frame / 3) * 1.5;
  if (f.st === 'ko') rot = -f.face * 1.35;
  ctx.translate(f.x + ox, f.y + oy); ctx.rotate(rot);
  const top = -h - 4;
  ctx.save(); rr(ctx, -w / 2, top, w, h, 8); ctx.clip();
  if (img && img.complete && img.naturalWidth) {
    const r = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
    ctx.drawImage(img, -dw / 2, top, dw, dh);
  } else {
    ctx.fillStyle = f.side === 0 ? '#5a2a00' : '#0d3a13'; ctx.fillRect(-w / 2, top, w, h);
    ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.emote, 0, top + h / 2);
  }
  if (f.st === 'hit') { ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.fillRect(-w / 2, top, w, h); }
  ctx.restore();
  rr(ctx, -w / 2, top, w, h, 8);
  ctx.lineWidth = 2.5; ctx.strokeStyle = f.st === 'hit' ? '#fff' : f.side === 0 ? '#F28500' : '#34b34a'; ctx.stroke();
  if (f.st === 'block') { ctx.strokeStyle = '#7dff8f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.face * 20, -34, 30, f.face === 1 ? -1 : 2.14, f.face === 1 ? 1 : 4.14); ctx.stroke(); }
  ctx.restore();
  if (hitting) {
    const r = f.atk.range * f.reach;
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(f.x + f.face * 26, f.y - 56); ctx.quadraticCurveTo(f.x + f.face * (28 + r), f.y - 36, f.x + f.face * 26, f.y - 14); ctx.stroke(); ctx.restore();
  }
  if (f.st === 'atk' && f.atk.kind === 'special' && f.t < f.atk.start) {
    ctx.fillStyle = 'rgba(255,200,100,.6)'; ctx.beginPath(); ctx.arc(f.x + f.face * 22, f.y - 38, 6 + f.t, 0, 7); ctx.fill();
  }
}
function hud(ctx, m, st) {
  const [a, b] = m.f, bw = 150;
  ctx.fillStyle = '#000'; ctx.fillRect(8, 8, bw + 4, 14); ctx.fillRect(W - 12 - bw, 8, bw + 4, 14);
  ctx.fillStyle = '#3a0d0d'; ctx.fillRect(10, 10, bw, 10); ctx.fillRect(W - 10 - bw, 10, bw, 10);
  ctx.fillStyle = '#F28500'; ctx.fillRect(10, 10, bw * Math.max(0, a.hp) / a.maxHp, 10);
  const wb = bw * Math.max(0, b.hp) / b.maxHp;
  ctx.fillStyle = '#34b34a'; ctx.fillRect(W - 10 - wb, 10, wb, 10);
  ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.5; ctx.strokeRect(8, 8, bw + 4, 14); ctx.strokeRect(W - 12 - bw, 8, bw + 4, 14);
  ctx.fillStyle = '#000'; ctx.fillRect(10, 24, bw * 0.6, 5); ctx.fillRect(W - 10 - bw * 0.6, 24, bw * 0.6, 5);
  ctx.fillStyle = a.meter >= 50 ? '#ffd27a' : '#6a5a2a'; ctx.fillRect(10, 24, bw * 0.6 * a.meter / 100, 5);
  ctx.fillStyle = b.meter >= 50 ? '#ffd27a' : '#6a5a2a'; const mb = bw * 0.6 * b.meter / 100; ctx.fillRect(W - 10 - mb, 24, mb, 5);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(m.names ? m.names[0] : '', 10, 40);
  ctx.textAlign = 'right'; ctx.fillText(m.names ? m.names[1] : '', W - 10, 40);
  ctx.textAlign = 'center'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(String(Math.max(0, Math.ceil(m.timer / 60))), W / 2, 20);
  [a, b].forEach((f, i) => { for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(W / 2 + (i ? 1 : -1) * (12 + k * 10), 30, 3.5, 0, 7); ctx.fillStyle = k < f.rounds ? '#ffd27a' : '#333'; ctx.fill(); } });
  let text = st.banner;
  if (m.phase === 'intro') text = m.pt > 50 ? 'ROUND ' + m.round : 'FIGHT!';
  if (text) {
    ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText(text, W / 2, H / 2 - 10);
    ctx.fillStyle = '#ffd27a'; ctx.fillText(text, W / 2, H / 2 - 10);
  }
}
export function draw(ctx, m, im, st) {
  ctx.save(); ctx.clearRect(0, 0, W, H);
  if (st.shake > 0.3) ctx.translate((Math.random() - 0.5) * st.shake, (Math.random() - 0.5) * st.shake);
  const g = ctx.createLinearGradient(0, 0, 0, GROUND);
  g.addColorStop(0, '#12060a'); g.addColorStop(0.6, '#5a2208'); g.addColorStop(1, '#c25a00');
  ctx.fillStyle = g; ctx.fillRect(-10, -10, W + 20, GROUND + 10);
  ctx.fillStyle = 'rgba(255,200,120,.9)'; ctx.beginPath(); ctx.arc(W / 2, GROUND - 40, 34, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a0d08'; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(60, GROUND - 60); ctx.lineTo(120, GROUND - 20); ctx.lineTo(190, GROUND - 75); ctx.lineTo(260, GROUND - 25); ctx.lineTo(320, GROUND - 65); ctx.lineTo(W, GROUND - 15); ctx.lineTo(W, GROUND); ctx.fill();
  ctx.fillStyle = '#0d0c09'; ctx.fillRect(0, GROUND, W, H - GROUND); ctx.fillStyle = '#F28500'; ctx.fillRect(0, GROUND, W, 2);
  m.f.forEach((f) => fighter(ctx, f, im[f.id], m));
  ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  m.proj.forEach((p) => { ctx.fillStyle = 'rgba(255,170,60,.35)'; ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, 7); ctx.fill(); ctx.fillText(p.emote, p.x, p.y); });
  st.fx.forEach((e) => {
    ctx.strokeStyle = e.k === 'hit' ? '#fff' : '#7dff8f'; ctx.lineWidth = 2;
    const r0 = 4 + (12 - e.life) * 1.5;
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(an) * r0, e.y + Math.sin(an) * r0); ctx.lineTo(e.x + Math.cos(an) * (r0 + 8), e.y + Math.sin(an) * (r0 + 8)); ctx.stroke(); }
  });
  ctx.restore();
  hud(ctx, m, st);
}
