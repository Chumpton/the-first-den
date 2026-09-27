// Mossback: patrols the den lawns between random legal waypoints (golem.yml keep-outs), pauses to breathe and look,
// greets a player who walks up, bows on E. One row, its own update; asleep when nobody is within wakeRange.
import { play, clips } from 'builtin/anim';
import { stepAngle, shortestArc } from 'builtin/math';
import G from './lib/data/golem.yml';
export const updateSchedule = { every: 2 };
const D = Math.PI / 180, FALL = -4;
const DUST = `fx
pop dust burst=10..14 on=disc(.35) life=.7..1.1 v=up(.4..0.9)+sdir()*.7 size=.22..0.38 acc=buoy(.2)+drag(1.6) col=<.74,.68,.57> a=0>.35:.3>.7:.15>0 sz=$size*(.6>1.9) rot=spin(.2) r=sprite(smoke-puff,alpha)
pop grit burst=5..8 on=disc(.3) life=.4..0.7 v=up(1..1.8)+sdir()*.8 size=.03..0.05 acc=grav()*.8 col=<.6,.55,.45> a=1>.7:1>0 sz=$size floor=stick r=sprite(soft-disc,alpha)`;
const MOTES = `fx
pop motes burst=36 life=2..3.2 on=sphere(.5) v=up(.3..0.8)+sdir()*.4 size=.03..0.06 acc=curl(.8)+buoy(.3)+drag(.8) col=hdr(.9,2.6,2.4)>hdr(1.6,2.2,1.2) a=0>.1:1>.8:1>0 sz=$size*flick(5,.4) r=sprite(soft-disc,add)
pop glow burst=1 life=1.6 r=light(<.5,1,.95>,14,7)`;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) / D;
const fwd = (y) => ({ x: -Math.sin(y * D), z: -Math.cos(y * D) });
let CL = null;
function clip(ctx, name, loop = true) {
  const s = ctx.self.state; if (s.clip === name) return;
  CL ??= clips(ctx, 'anim/golem.yml'); const c = CL && CL[name]; if (!c) return;
  play(ctx, ctx.self, c, { channel: 'body', loop, speed: 1, blendIn: 0.5 }); s.clip = name;
}
function segD(px, pz, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / l));
  return Math.hypot(px - a[0] - dx * t, pz - a[1] - dz * t);
}
export function legal(ctx, x, z) {
  const L = G.lawn; if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) return false;
  for (const c of G.keepOuts.circles) if (Math.hypot(x - c.x, z - c.z) < c.r) return false;
  for (const r of G.keepOuts.rects) if (x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) return false;
  for (let i = 0; i < G.creek.length - 1; i++) if (segD(x, z, G.creek[i], G.creek[i + 1]) < G.creekBuffer) return false;
  const h = ctx.place.terrain.heightAt(x, z); return h != null && h > G.minGround;
}
function clear(ctx, a, b) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / G.sampleStep);
  for (let i = 1; i <= n; i++) if (!legal(ctx, a.x + (b.x - a.x) * i / n, a.z + (b.z - a.z) * i / n)) return false;
  return true;
}
function pick(ctx, p) {
  const L = G.lawn;
  for (let i = 0; i < 40; i++) {
    const t = { x: L.x0 + ctx.random() * (L.x1 - L.x0), z: L.z0 + ctx.random() * (L.z1 - L.z0) };
    const d = Math.hypot(t.x - p.x, t.z - p.z);
    if (d < G.leg[0] || d > G.leg[1]) continue;
    if (legal(ctx, t.x, t.z) && clear(ctx, p, t)) return t;
  }
  const h = ctx.self.state.home; // fall back home when it is reachable
  return h && Math.hypot(h.x - p.x, h.z - p.z) > 2 && clear(ctx, p, h) ? { x: h.x, z: h.z } : null;
}
function mem(ctx) { return (ctx.session.golem ??= { yaw: ctx.self.state.yaw ?? 0, vx: null, vz: null, stepAt: 0, foot: 0, lastP: null, lastAt: 0 }); }
function vel(ctx, m, vx, vz) {
  if (m.vx === null || Math.abs(m.vx - vx) > 0.03 || Math.abs(m.vz - vz) > 0.03) { ctx.self.velocity = { x: vx, y: FALL, z: vz }; m.vx = vx; m.vz = vz; }
}
function face(ctx, m, want, dt) {
  const n = stepAngle(m.yaw, want, dt, { smoothing: 0.5, maxDegPerSec: G.turnRate });
  if (Math.abs(shortestArc(m.yaw, n)) > 0.2) { m.yaw = n; ctx.self.rotation = { yaw: n }; }
  return Math.abs(shortestArc(m.yaw, want));
}
function rest(ctx, m, now) {
  const s = ctx.self.state; s.mode = 'pause'; s.yaw = Math.round(m.yaw);
  s.until = now + (G.pause[0] + ctx.random() * (G.pause[1] - G.pause[0])) * 1000; vel(ctx, m, 0, 0);
  clip(ctx, ctx.random() < 0.5 ? 'look' : 'idle');
}
function setGlow(ctx, g) { const pr = ctx.self.primitive; if (pr && pr.params && pr.params.glow !== g) pr.params.glow = g; }

export function update(ctx, dt) {
  const me = ctx.self, s = me.state, p = me.feetPosition, now = ctx.now(), m = mem(ctx);
  if (!p) return;
  let d = Infinity, near = null;
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (!q) continue; const e = Math.hypot(q.x - p.x, q.z - p.z); if (e < d) { d = e; near = { id: pl.id, q }; } }
  if (d > G.wakeRange) { vel(ctx, m, 0, 0); if (s.mode === 'walk') s.mode = 'pause'; ctx.sleep(3); return; }
  if (s.greeted && d > G.greetRange + 3) s.greeted = null;

  if (s.mode === 'bow') {
    vel(ctx, m, 0, 0); if (now < s.until) return;
    setGlow(ctx, G.glow); s.clip = null; rest(ctx, m, now); s.until = now + 1500; return;
  }
  if (near && d < G.greetRange && s.greeted !== near.id && s.mode !== 'greet') {
    s.greeted = near.id; s.mode = 'greet'; s.until = now + G.greetMs; vel(ctx, m, 0, 0); s.clip = null; clip(ctx, 'look');
    ctx.emit('playSound', { clip: G.sounds.rumble, position: p, volume: 0.7, maxDistance: G.sounds.maxDistance });
  }
  if (s.mode === 'greet') {
    vel(ctx, m, 0, 0);
    if (near) face(ctx, m, yawTo(near.q.x - p.x, near.q.z - p.z), dt);
    if (now < s.until) return;
    rest(ctx, m, now); s.until = now + 1200; return;
  }
  if (s.mode !== 'walk') {
    vel(ctx, m, 0, 0); if (!s.mode) rest(ctx, m, now);
    if (now < (s.until ?? 0)) return;
    const t = pick(ctx, p);
    if (!t) { rest(ctx, m, now); return; }
    s.tx = Math.round(t.x * 10) / 10; s.tz = Math.round(t.z * 10) / 10; s.mode = 'walk';
    m.lastP = { x: p.x, z: p.z }; m.lastAt = now; m.stepAt = now + G.stepMs * 0.5;
  }
  const dx = s.tx - p.x, dz = s.tz - p.z, dist = Math.hypot(dx, dz);
  if (dist < 0.8) { rest(ctx, m, now); return; }
  const off = face(ctx, m, yawTo(dx, dz), dt), f = fwd(m.yaw);
  if (!legal(ctx, p.x + f.x * G.lookAhead, p.z + f.z * G.lookAhead) && off < 30) { rest(ctx, m, now); return; }
  const v = off > 30 ? G.speed * 0.15 : G.speed;
  vel(ctx, m, f.x * v, f.z * v); clip(ctx, 'walk');
  if (now >= m.stepAt) {
    m.stepAt = now + G.stepMs; m.foot ^= 1;
    const side = m.foot ? -0.55 : 0.55, rx = Math.cos(m.yaw * D), rz = -Math.sin(m.yaw * D);
    const at = { x: p.x + rx * side + f.x * 0.35, y: p.y + 0.05, z: p.z + rz * side + f.z * 0.35 };
    ctx.emit('playSound', { clip: G.sounds.step, position: at, volume: G.sounds.stepVolume, maxDistance: G.sounds.maxDistance, pitch: 0.9 + ctx.random() * 0.15 });
    ctx.emit('fx', { position: at, script: DUST });
  }
  if (now - m.lastAt > 5000) {
    if (m.lastP && Math.hypot(p.x - m.lastP.x, p.z - m.lastP.z) < 1) { rest(ctx, m, now); return; }
    m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
  }
}

export const ears = {
  press: (ctx, { by } = {}) => {
    const s = ctx.self.state, now = ctx.now(), p = ctx.self.feetPosition, m = mem(ctx);
    if (now - (s.pressAt || 0) < G.bowMs) return;
    s.pressAt = now; s.mode = 'bow'; s.until = now + G.bowMs; vel(ctx, m, 0, 0);
    const who = by && ctx.getObject(by.id ?? by), q = who && (who.worldFeetPosition || who.feetPosition);
    if (q) { m.yaw = yawTo(q.x - p.x, q.z - p.z); ctx.self.rotation = { yaw: m.yaw }; s.yaw = Math.round(m.yaw); }
    s.clip = null; clip(ctx, 'bow', false); setGlow(ctx, G.glowBright);
    const f = fwd(m.yaw), head = { x: p.x + f.x * 0.6, y: p.y + 3.8, z: p.z + f.z * 0.6 };
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 5.1, z: p.z }, text: G.words, color: '#bff5ee', size: 1, lifetime: 4 });
    ctx.emit('fx', { position: head, script: MOTES });
    ctx.emit('playSound', { clip: G.sounds.rumble, position: p, volume: 0.8, maxDistance: G.sounds.maxDistance, pitch: 0.85 });
  },
};
