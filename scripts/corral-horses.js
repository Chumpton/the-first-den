// The one manager of the corral's three horses (rows tagged "corral-horse", no update of their own), worn by the `corral` row:
// Hazel walks the riding ring, Willow circuits the paddock, each pausing now and then; Tansy stands at the water trough
// swishing her tail and dipping to drink. A walker stops to face a visitor in its way; a pet (scripts/pasture-horse.js press)
// turns it to the petter. Now and then one of them lets out a soft whinny. Every tuned number is scripts/lib/data/corral.yml.
import { play } from 'builtin/anim';
import PASTURE from './lib/data/pasture.yml';
import C from './lib/data/corral.yml';
export const updateSchedule = { every: 3, near: { radius: 300 } };
const CLIPS = { ...PASTURE.clips, ...C.clips }, FALL = -4, BY = {};
for (const h of C.horses) BY[h.id] = h;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
const fwd = (yaw) => ({ x: -Math.sin(yaw * Math.PI / 180), z: -Math.cos(yaw * Math.PI / 180) });
const rnd = (ctx, a, b) => a + ctx.random() * (b - a);
function clip(ctx, row, name, speed = 1) {
  const s = row.state; if (s.clip === name) return;
  play(ctx, row, { name: `corral-${name}`, ...CLIPS[name] }, { channel: 'body', loop: true, speed, blendIn: 0.4 });
  s.clip = name;
}
function mem(ctx, row) { const all = (ctx.session.corral ??= {}); return (all[row.id] ??= { yaw: row.state.yaw ?? 0, v: null, wp: 0 }); }
function move(row, m, vx, vz) { if (!m.v || Math.abs(m.v.x - vx) > 0.04 || Math.abs(m.v.z - vz) > 0.04) { row.velocity = { x: vx, y: FALL, z: vz }; m.v = { x: vx, z: vz }; } }
function turn(row, m, want, rate, dt) {
  const d = wrapDeg(want - m.yaw);
  if (Math.abs(d) > 1) { const st = Math.max(-rate * dt, Math.min(rate * dt, d)); m.yaw = wrapDeg(m.yaw + st); row.rotation = { yaw: m.yaw }; return Math.abs(d - st) < 25; }
  return true;
}
function goal(H, m, lx, lz) {
  const L = H.loop;
  if (L.kind === 'circle') {
    const [cx, cz] = L.c, a = Math.atan2(lz - cz, lx - cx) + L.dir * C.lead / L.r;
    return { x: cx + Math.cos(a) * L.r, z: cz + Math.sin(a) * L.r };
  }
  let p = L.pts[m.wp % L.pts.length];
  if (Math.hypot(p[0] - lx, p[1] - lz) < 1.0) { m.wp = (m.wp + 1) % L.pts.length; p = L.pts[m.wp]; }
  return { x: p[0], z: p[1] };
}
function petted(ctx, row, m, p, now) {
  const s = row.state;
  if (s.petAt && s.petAt !== s.petSeen) {
    s.petSeen = s.petAt; s.mode = 'pet'; s.until = now + 2400; move(row, m, 0, 0);
    const by = s.petBy && ctx.getObject(s.petBy), q = by && (by.worldFeetPosition || by.feetPosition);
    if (q) { m.yaw = yawTo(q.x - p.x, q.z - p.z); row.rotation = { yaw: m.yaw }; }
    clip(ctx, row, 'pet'); return true;
  }
  if ((s.mode === 'pet' || s.mode === 'nicker') && now < s.until) return true;
  return false;
}
function walker(ctx, row, H, o, near, now, dt) {
  const s = row.state, m = mem(ctx, row), p = row.feetPosition;
  if (petted(ctx, row, m, p, now)) return;
  if (s.mode === 'pet' || s.mode === 'nicker' || !s.mode) { s.mode = 'walk'; s.until = now + rnd(ctx, C.rest.everyMin, C.rest.everyMax) * 1000; }
  if (s.mode === 'rest') {
    if (now < s.until) return;
    s.mode = 'walk'; s.until = now + rnd(ctx, C.rest.everyMin, C.rest.everyMax) * 1000;
  }
  if (now > s.until) { s.mode = 'rest'; s.until = now + rnd(ctx, C.rest.forMin, C.rest.forMax) * 1000; move(row, m, 0, 0); clip(ctx, row, 'stand'); return; }
  const f0 = fwd(m.yaw), ahead = { x: p.x + f0.x * 1.8, z: p.z + f0.z * 1.8 };
  if (near && Math.hypot(near.x - ahead.x, near.z - ahead.z) < C.notice) { // someone in the way: stop and look at them
    move(row, m, 0, 0); clip(ctx, row, 'stand'); turn(row, m, yawTo(near.x - p.x, near.z - p.z), 70, dt); return;
  }
  const g = goal(H, m, p.x - o.x, p.z - o.z), dx = g.x + o.x - p.x, dz = g.z + o.z - p.z;
  const sp = C.walk * (H.scale || 1), aligned = turn(row, m, yawTo(dx, dz), C.turnRate, dt), f = fwd(m.yaw), v = aligned ? sp : sp * 0.35;
  move(row, m, f.x * v, f.z * v); clip(ctx, row, 'walk', 0.8);
}
function stander(ctx, row, H, o, now, dt) {
  const s = row.state, m = mem(ctx, row), p = row.feetPosition;
  if (petted(ctx, row, m, p, now)) return;
  move(row, m, 0, 0);
  if (!s.mode || s.mode === 'pet' || s.mode === 'nicker') { s.mode = 'swish'; s.until = now + rnd(ctx, C.drink.everyMin, C.drink.everyMax) * 1000; }
  turn(row, m, H.yaw ?? 0, 60, dt);
  if (now > s.until) {
    if (s.mode === 'swish') { s.mode = 'drink'; s.until = now + C.drink.for * 1000; }
    else { s.mode = 'swish'; s.until = now + rnd(ctx, C.drink.everyMin, C.drink.everyMax) * 1000; }
  }
  clip(ctx, row, s.mode === 'drink' ? 'graze' : 'swish');
}
export function update(ctx, dt) {
  const now = ctx.now(), o = ctx.self.worldFeetPosition || ctx.self.feetPosition, players = [];
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (q) players.push(q); }
  const rows = ctx.query({ tags: ['corral-horse'], radius: 40 });
  let awake = false;
  for (const row of rows) {
    const H = BY[row.id], p = row.feetPosition; if (!H || !p) continue;
    let d = Infinity, q = null;
    for (const pp of players) { const e = Math.hypot(pp.x - p.x, pp.z - p.z); if (e < d) { d = e; q = pp; } }
    if (d > C.wake) { if (!row.state.zz) { row.state.zz = true; row.velocity = { x: 0, y: FALL, z: 0 }; mem(ctx, row).v = null; } continue; }
    if (row.state.zz) row.state.zz = false;
    awake = true;
    if (H.role === 'stand') stander(ctx, row, H, o, now, dt); else walker(ctx, row, H, o, d < 8 ? q : null, now, dt);
  }
  const s = ctx.self.state;
  if (!awake || !rows.length) return;
  if (!s.whinnyAt) { s.whinnyAt = now + rnd(ctx, C.whinny.min * 0.4, C.whinny.max * 0.6) * 1000; return; }
  if (now < s.whinnyAt) return;
  s.whinnyAt = now + rnd(ctx, C.whinny.min, C.whinny.max) * 1000;
  const row = rows[Math.floor(ctx.random() * rows.length)], H = BY[row.id], p = row.feetPosition; if (!H || !p) return;
  ctx.emit('playSound', { clip: C.whinny.clip, position: { x: p.x, y: p.y + 1.7, z: p.z }, volume: C.whinny.volume, pitch: (H.pitch || 1) * rnd(ctx, 0.96, 1.04), maxDistance: C.whinny.range });
  if (H.role === 'stand' && row.state.mode !== 'pet') { row.state.mode = 'nicker'; row.state.until = now + 1600; clip(ctx, row, 'nicker'); }
}
