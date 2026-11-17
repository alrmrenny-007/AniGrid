export const W = 360, H = 200, GROUND = 168, BODY = 34, MAXF = 3600;
const ATK = {
  punch: { start: 4, active: 4, rec: 9, dmg: 6, range: 34, stun: 14, kb: 2.4, gain: 8 },
  kick: { start: 7, active: 5, rec: 14, dmg: 10, range: 44, stun: 20, kb: 4.2, gain: 12 },
  special: { start: 12, active: 1, rec: 22, dmg: 14, range: 0, stun: 24, kb: 5, gain: 0 },
};
export const DIFFS = {
  easy: { think: 22, block: 0.12, special: 0.01, jump: 0.02, atk: 0.25, ap: 5 },
  normal: { think: 14, block: 0.35, special: 0.03, jump: 0.04, atk: 0.45, ap: 10 },
  hard: { think: 8, block: 0.6, special: 0.06, jump: 0.06, atk: 0.65, ap: 20 },
};
function rnd(m) {
  m.rng = (m.rng + 0x6d2b79f5) | 0;
  let t = Math.imul(m.rng ^ (m.rng >>> 15), 1 | m.rng);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function mk(c, side) {
  const hp = 100 + c.tier * 8 + (c.cat === 'watch' ? 15 : 0);
  return {
    id: c.id, emote: c.emote, side, x: side === 0 ? 100 : 260, y: GROUND, vx: 0, vy: 0, face: side === 0 ? 1 : -1,
    hp, maxHp: hp, st: 'idle', t: 0, atk: null, hitDone: false, stun: 0, meter: 0, spCd: 0, rounds: 0, prev: {},
    spd: 1.7 * (c.cat === 'daily' ? 1.05 : 1), haste: c.cat === 'quiz' ? 0.85 : 1, reach: c.cat === 'vote' ? 1.2 : 1,
    dmg: 1 + c.tier * 0.05, gainMul: c.cat === 'comment' ? 1.5 : 1, regen: c.cat === 'daily' ? 0.012 : 0,
  };
}
export function createMatch(a, b, o = {}) {
  return { f: [mk(a, 0), mk(b, 1)], round: 1, timer: MAXF, phase: 'intro', pt: 100, winner: -1, next: -1, proj: [], ev: [], frame: 0, rng: o.seed || 1, diff: o.diff || 'normal', ai: [{ t: 0, hold: {}, fire: {} }, { t: 0, hold: {}, fire: {} }] };
}
function startAtk(f, kind) {
  const a = ATK[kind];
  f.st = 'atk'; f.t = 0; f.hitDone = false;
  f.atk = { kind, start: Math.max(2, Math.round(a.start * f.haste)), active: a.active, rec: Math.round(a.rec * f.haste), dmg: a.dmg, range: a.range, stun: a.stun, kb: a.kb, gain: a.gain };
}
function control(m, i, inp) {
  const f = m.f[i], o = m.f[1 - i], p = f.prev;
  const e = { jump: inp.jump && !p.jump, punch: inp.punch && !p.punch, kick: inp.kick && !p.kick, special: inp.special && !p.special };
  f.prev = { jump: !!inp.jump, punch: !!inp.punch, kick: !!inp.kick, special: !!inp.special };
  f.spCd = Math.max(0, f.spCd - 1);
  f.hp = Math.min(f.maxHp, f.hp + f.regen);
  const air = f.y < GROUND;
  if (f.st === 'ko') return;
  if (f.stun > 0) { f.stun--; if (f.stun === 0) f.st = air ? 'jump' : 'idle'; return; }
  if (f.st === 'atk') {
    const a = f.atk;
    f.t++;
    if (a.kind === 'special' && f.t === a.start) m.proj.push({ x: f.x + f.face * 24, y: f.y - 38, vx: f.face * 4.6, o: i, emote: f.emote });
    if (f.t >= a.start + a.active + a.rec) { f.st = air ? 'jump' : 'idle'; f.atk = null; }
    if (!air) f.vx *= 0.7;
    return;
  }
  if (!air) f.face = o.x >= f.x ? 1 : -1;
  if (inp.block && !air) { f.st = 'block'; f.vx *= 0.6; return; }
  const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  if (!air) {
    f.vx = dir * f.spd; f.st = dir ? 'walk' : 'idle';
    if (e.jump) { f.vy = -7.4; f.st = 'jump'; }
  }
  if (e.punch) startAtk(f, 'punch');
  else if (e.kick) startAtk(f, 'kick');
  else if (e.special && f.meter >= 50 && f.spCd === 0) { f.meter -= 50; f.spCd = 40; startAtk(f, 'special'); }
}
function physics(f) {
  f.x += f.vx;
  if (f.x < 22) f.x = 22;
  if (f.x > W - 22) f.x = W - 22;
  if (f.y < GROUND || f.vy < 0) {
    f.vy += 0.42; f.y += f.vy;
    if (f.y >= GROUND) { f.y = GROUND; f.vy = 0; if (f.st === 'jump') f.st = 'idle'; }
  }
  if (f.stun > 0 || f.st === 'ko' || f.st === 'block') f.vx *= 0.82;
}
function damage(m, f, o, dmg, a) {
  const blocked = o.st === 'block' && o.face === -f.face;
  if (blocked) {
    o.hp -= Math.max(0.5, dmg * 0.15); o.vx = f.face * a.kb * 0.4; o.meter = Math.min(100, o.meter + 3);
    m.ev.push({ t: 'block', x: o.x, y: o.y - 30 });
  } else {
    o.hp -= dmg; o.st = 'hit'; o.stun = a.stun; o.atk = null; o.vx = f.face * a.kb;
    f.meter = Math.min(100, f.meter + a.gain * f.gainMul); o.meter = Math.min(100, o.meter + 4);
    m.ev.push({ t: 'hit', x: o.x, y: o.y - 30, dmg });
  }
}
function hits(m, i) {
  const f = m.f[i], o = m.f[1 - i];
  if (f.st !== 'atk' || f.hitDone || f.atk.kind === 'special') return;
  const a = f.atk;
  if (f.t < a.start || f.t >= a.start + a.active) return;
  const r = a.range * f.reach;
  const x0 = f.face === 1 ? f.x + BODY / 2 : f.x - BODY / 2 - r;
  if (o.st !== 'ko' && o.x + BODY / 2 > x0 && o.x - BODY / 2 < x0 + r && Math.abs(o.y - f.y) < 46) {
    f.hitDone = true; damage(m, f, o, a.dmg * f.dmg, a);
  }
}
function endRound(m, why) {
  const [a, b] = m.f;
  let w = -1;
  if (a.hp > b.hp) w = 0; else if (b.hp > a.hp) w = 1;
  if (w === 0) a.rounds++; else if (w === 1) b.rounds++; else { a.rounds++; b.rounds++; }
  if (a.hp <= 0) a.st = 'ko';
  if (b.hp <= 0) b.st = 'ko';
  m.ev.push({ t: why });
  m.phase = 'ko'; m.pt = 110;
  let win = -1;
  if (a.rounds >= 2 || b.rounds >= 2) { if (a.rounds > b.rounds) win = 0; else if (b.rounds > a.rounds) win = 1; }
  if (m.round >= 5 && win < 0) win = a.hp >= b.hp ? 0 : 1;
  m.next = win;
}
function nextRound(m) {
  m.round++; m.timer = MAXF; m.phase = 'intro'; m.pt = 100; m.proj = [];
  m.f.forEach((f, i) => { f.x = i === 0 ? 100 : 260; f.y = GROUND; f.vx = 0; f.vy = 0; f.hp = f.maxHp; f.st = 'idle'; f.stun = 0; f.atk = null; f.meter = 0; f.spCd = 0; f.face = i === 0 ? 1 : -1; });
  m.ev.push({ t: 'round' });
}
export function step(m, in0, in1) {
  m.ev = []; m.frame++;
  if (m.phase === 'over') return m;
  if (m.phase === 'intro') { m.f.forEach(physics); if (--m.pt <= 0) { m.phase = 'fight'; m.ev.push({ t: 'fight' }); } return m; }
  if (m.phase === 'ko') {
    m.f.forEach(physics);
    if (--m.pt <= 0) { if (m.next >= 0) { m.winner = m.next; m.phase = 'over'; m.ev.push({ t: 'over', w: m.winner }); } else nextRound(m); }
    return m;
  }
  m.timer--;
  control(m, 0, in0); control(m, 1, in1);
  m.f.forEach(physics);
  hits(m, 0); hits(m, 1);
  for (const p of m.proj) {
    p.x += p.vx;
    const f = m.f[p.o], o = m.f[1 - p.o];
    if (o.st !== 'ko' && Math.abs(p.x - o.x) < BODY / 2 + 8 && Math.abs(p.y - (o.y - 38)) < 40) { damage(m, f, o, ATK.special.dmg * f.dmg, ATK.special); p.dead = true; }
    else if (p.x < -10 || p.x > W + 10) p.dead = true;
  }
  m.proj = m.proj.filter((p) => !p.dead);
  const d = m.f[1].x - m.f[0].x;
  if (Math.abs(d) < BODY && m.f[0].y >= GROUND - 6 && m.f[1].y >= GROUND - 6) {
    const push = (BODY - Math.abs(d)) / 2, s = d >= 0 ? 1 : -1;
    m.f[0].x -= s * push; m.f[1].x += s * push;
  }
  if (m.f[0].hp <= 0 || m.f[1].hp <= 0) endRound(m, 'ko');
  else if (m.timer <= 0) endRound(m, 'time');
  return m;
}
export function aiInput(m, i) {
  const f = m.f[i], o = m.f[1 - i], d = Math.abs(o.x - f.x), P = DIFFS[m.diff] || DIFFS.normal, a = m.ai[i];
  if (a.t-- > 0) return a.hold;
  a.t = 4 + Math.floor(rnd(m) * P.think);
  const hold = { left: false, right: false, block: false }, fire = {};
  const toward = o.x > f.x ? 'right' : 'left', away = toward === 'right' ? 'left' : 'right', range = 40 * f.reach, r = rnd(m);
  if (o.st === 'atk' && d < 70 && r < P.block) hold.block = true;
  else if (f.meter >= 50 && f.spCd === 0 && d > 70 && r < P.special * 6) fire.special = true;
  else if (d > range + 6) { hold[toward] = true; if (rnd(m) < P.jump) fire.jump = true; }
  else if (r < P.atk) { if (rnd(m) < 0.5) fire.punch = true; else fire.kick = true; }
  else if (r < P.atk + 0.15) hold[away] = true;
  else hold.block = rnd(m) < 0.4;
  a.hold = hold;
  return { ...hold, ...fire };
}
