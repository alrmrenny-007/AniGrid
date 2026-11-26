import { W, H } from './fight';
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function portrait(ctx, img, x, y, s, col, label) {
  ctx.save(); rr(ctx, x, y, s, s, 5); ctx.clip();
  if (img && img.complete && img.naturalWidth) {
    const r = Math.max(s / img.naturalWidth, s / img.naturalHeight), dw = img.naturalWidth * r, dh = img.naturalHeight * r;
    ctx.drawImage(img, x + (s - dw) / 2, y, dw, dh);
  } else { ctx.fillStyle = col; ctx.fillRect(x, y, s, s); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + s / 2, y + s / 2); }
  ctx.restore();
  rr(ctx, x, y, s, s, 5); ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
}
export function drawHud(ctx, m, st, im) {
  const [a, b] = m.f, bw = 116, ps = 32;
  portrait(ctx, im[a.id], 6, 6, ps, '#F28500', (m.names?.[0] || '?')[0]);
  portrait(ctx, im[b.id], W - 6 - ps, 6, ps, '#34b34a', (m.names?.[1] || '?')[0]);
  const lx = 6 + ps + 4, rx = W - 6 - ps - 4 - bw;
  ctx.fillStyle = '#000'; ctx.fillRect(lx - 2, 6, bw + 4, 14); ctx.fillRect(rx - 2, 6, bw + 4, 14);
  ctx.fillStyle = '#3a0d0d'; ctx.fillRect(lx, 8, bw, 10); ctx.fillRect(rx, 8, bw, 10);
  ctx.fillStyle = '#F28500'; ctx.fillRect(lx, 8, bw * Math.max(0, a.hp) / a.maxHp, 10);
  const wb = bw * Math.max(0, b.hp) / b.maxHp;
  ctx.fillStyle = '#34b34a'; ctx.fillRect(rx + bw - wb, 8, wb, 10);
  ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.5; ctx.strokeRect(lx - 2, 6, bw + 4, 14); ctx.strokeRect(rx - 2, 6, bw + 4, 14);
  const mw = bw * 0.6;
  ctx.fillStyle = '#000'; ctx.fillRect(lx, 22, mw, 5); ctx.fillRect(rx + bw - mw, 22, mw, 5);
  ctx.fillStyle = a.meter >= 50 ? '#ffd27a' : '#6a5a2a'; ctx.fillRect(lx, 22, mw * a.meter / 100, 5);
  ctx.fillStyle = b.meter >= 50 ? '#ffd27a' : '#6a5a2a'; const mb = mw * b.meter / 100; ctx.fillRect(rx + bw - mb, 22, mb, 5);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left'; ctx.fillText(m.names ? m.names[0] : '', lx, 37);
  ctx.textAlign = 'right'; ctx.fillText(m.names ? m.names[1] : '', rx + bw, 37);
  ctx.textAlign = 'center'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(String(Math.max(0, Math.ceil(m.timer / 60))), W / 2, 20);
  [a, b].forEach((f, i) => { for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(W / 2 + (i ? 1 : -1) * (10 + k * 9), 29, 3.2, 0, 7); ctx.fillStyle = k < f.rounds ? '#ffd27a' : '#333'; ctx.fill(); } });
  if (st.flash > 0.03) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.5, st.flash * 0.5)})`; ctx.fillRect(0, 0, W, H); }
  if (st.lines > 0.05) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${Math.min(0.7, st.lines * 0.7)})`; ctx.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const an = i * Math.PI / 20 + 0.07 * (i % 3), r0 = 55 + (i % 4) * 14, r1 = 230; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(an) * r0, H / 2 + Math.sin(an) * r0); ctx.lineTo(W / 2 + Math.cos(an) * r1, H / 2 + Math.sin(an) * r1); ctx.stroke(); } ctx.restore(); }
  let text = st.banner;
  if (m.phase === 'intro') text = m.pt > 50 ? 'ROUND ' + m.round : 'FIGHT!';
  if (text) {
    ctx.font = 'bold 34px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText(text, W / 2, H / 2 - 4);
    ctx.fillStyle = '#ffd27a'; ctx.fillText(text, W / 2, H / 2 - 4);
  }
}
