// Ember on the roost: breathes, dozes, now and then looks round, stretches her wings or yawns a warm puff; rumbles every few
// minutes. Watches the nearest player in the square when awake. Pose = self.bones (degrees); tuning in lib/data/roost-dragon.yml.
import D from './lib/data/roost-dragon.yml';
export const updateSchedule = { every: 2 };
const R2D = 180 / Math.PI, TAU = Math.PI * 2;
const PUFF = `fx
pop puff burst=11..14 life=1.4..2.4 v=<0,.25,-1>*(.7..1.3)+sdir()*.3 size=.22..0.36 acc=buoy(.6)+curl(.4)*.4+drag(1.1) sz=$size*(.6>2.6) col=<.78,.7,.62>><.52,.48,.46> a=0>.1:.5>.6:.3>0 rot=spin(.15) r=sprite(smoke-puff,alpha)
pop spark burst=3..5 life=.3..0.6 v=<0,.2,-1>*(1..2)+sdir()*.5 size=.03..0.05 acc=grav()*.2+drag(.8) col=hdr(4,2,.6)>hdr(1.5,.4,.1) a=1>0 sz=$size r=sprite(ember,add,velocity,.02)`;
const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const env = (u, a = 0.25) => Math.min(smooth(u / a), smooth((1 - u) / a));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cur = new Map(); // per-dragon smoothed pose on this machine
const rnd = (ctx, [a, b]) => a + (b - a) * ctx.random();
function pick(ctx) {
  const names = Object.keys(D.acts).filter((k) => D.acts[k].weight), tot = names.reduce((s, k) => s + D.acts[k].weight, 0);
  let r = ctx.random() * tot; for (const k of names) { r -= D.acts[k].weight; if (r <= 0) return k; } return names[0];
}
export function onSpawn(ctx) { const s = ctx.self.state, now = ctx.now(); s.nextAct = now + rnd(ctx, [8, 16]) * 1000; s.nextRoar = now + rnd(ctx, D.roarEvery) * 1000; s.act = null; }
export function update(ctx, dt) {
  const me = ctx.self, f = me.feetPosition, s = me.state, now = ctx.now(), t = now / 1000;
  const hx = f.x + D.head.x, hy = f.y + D.head.y, hz = f.z + D.head.z;
  let near = false, target = null, best = D.trackRadius, sq = D.square;
  for (const p of ctx.place.players) {
    const q = p.feetPosition, dh = Math.hypot(q.x - f.x, q.z - f.z);
    if (dh < D.wakeRadius) near = true;
    const dd = Math.hypot(q.x - hx, q.z - hz);
    if (q.x > sq.x0 && q.x < sq.x1 && q.z > sq.z0 && q.z < sq.z1 && dd < best) { best = dd; target = q; }
  }
  if (!near) { ctx.sleep(3); return; }
  if (s.nextAct == null) onSpawn(ctx);
  // the act clock
  if (!s.act && now > s.nextRoar) { s.act = 'roar'; s.actAt = now; s.fired = false; s.nextRoar = now + rnd(ctx, D.roarEvery) * 1000; }
  else if (!s.act && now > s.nextAct) { s.act = pick(ctx); s.actAt = now; s.fired = false; }
  let u = 0;
  if (s.act) { u = (now - s.actAt) / (D.acts[s.act].dur * 1000); if (u >= 1) { s.act = null; s.nextAct = now + rnd(ctx, D.actGap) * 1000; u = 0; } }
  const act = s.act, e = act ? env(u) : 0;
  // pose targets
  const br = Math.sin((t * TAU) / D.breath);
  const P = { root: { pitch: br * 0.5 }, chest: { pitch: br * 1.4, roll: br * 0.4 }, neck1: { pitch: 0, yaw: 0 }, neck2: { pitch: 0, yaw: 0 }, head: { pitch: 0, yaw: 0 },
    jaw: { pitch: 0 }, wingR: { yaw: 0, roll: br * 1.5 }, wingL: { yaw: 0, roll: -br * 1.5 },
    tail3: { yaw: Math.sin(t * 0.31) * 2 }, tail4: { roll: Math.sin(t * 0.55) * 5 }, tail5: { roll: Math.sin(t * 0.55 - 0.8) * 7 } };
  if (target && act !== 'look') {       // awake: lift off the parapet and watch
    const dx = target.x - hx, dz = target.z - hz, yw = clamp(Math.atan2(-dx, -dz) * R2D, -65, 65);
    const pt = clamp(Math.atan2(target.y + 1.5 - hy, Math.hypot(dx, dz)) * R2D, -45, 10);
    P.neck1.pitch = 9; P.neck2.yaw = yw * 0.45; P.head.yaw = yw * 0.55; P.head.pitch = pt + 18;
  }
  if (act === 'look') { P.neck1.pitch = 20 * e; P.neck2.yaw = 38 * Math.sin(u * TAU * 1.5) * e; P.head.yaw = 20 * Math.sin(u * TAU * 1.5 - 0.6) * e; P.head.pitch = 6 * e; }
  if (act === 'stretch') { const w = env(u, 0.35); P.wingR.yaw = 85 * w; P.wingL.yaw = -85 * w; P.wingR.roll = 30 * w; P.wingL.roll = -30 * w; P.chest.pitch += 5 * w; P.neck1.pitch = Math.max(P.neck1.pitch, 14 * w); P.head.pitch += 10 * w; }
  if (act === 'yawn' || act === 'roar') {
    const big = act === 'roar';
    P.neck1.pitch = Math.max(P.neck1.pitch, (big ? 24 : 14) * e); P.head.pitch = P.head.pitch * (1 - e) + (big ? 12 : 22) * e; P.jaw.pitch = -(big ? 26 : 34) * e;
    if (!s.fired && u > (big ? 0.15 : 0.4)) {
      s.fired = true;
      if (big) ctx.emit('playSound', { clip: D.sound, position: { x: hx, y: hy, z: hz }, volume: 1, maxDistance: D.soundRange });
      ctx.emit('fx', { position: { x: f.x + D.nostril.x, y: f.y + D.nostril.y + 0.55, z: f.z + D.nostril.z - 0.25 }, script: PUFF });
    }
  }
  // ease toward the targets, write only what moved
  let c = cur.get(me.id); if (!c) { c = {}; cur.set(me.id, c); }
  const k = 1 - Math.exp(-dt * 3.2);
  for (const b in P) for (const ax in P[b]) {
    const key = b + '.' + ax, v = (c[key] ?? 0) + (P[b][ax] - (c[key] ?? 0)) * k;
    if (Math.abs(v - (c[key] ?? 1e9)) > 0.05) { c[key] = v; me.bones[b][ax] = +v.toFixed(2); }
  }
}
