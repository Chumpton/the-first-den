// The one manager of the rescue herd (rows tagged "pasture-horse", no update of their own), worn by the pasture's fence row:
// graze with the head down, stand and swish, amble to a new patch, now and then trot, nicker softly; turn to face a visitor
// close by and to whoever pets them. Every target and every step stays inside the fence (yard rect minus `inner`, minus keepOut).
import { play } from 'builtin/anim';
import PASTURE from './lib/data/pasture.yml';
export const updateSchedule = { every: 3, near: { radius: 600 } };
const H = PASTURE.herd, CL = PASTURE.clips, SITE = PASTURE.site, FALL = -4;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
const fwd = (yaw) => ({ x: -Math.sin(yaw * Math.PI / 180), z: -Math.cos(yaw * Math.PI / 180) });
const rnd = (ctx, a, b) => a + ctx.random() * (b - a);
function inside(ctx, x, z) {
  const c = ctx.self.worldFeetPosition || ctx.self.feetPosition, lx = x - c.x, lz = z - c.z;
  if (Math.abs(lx) > SITE.w / 2 - PASTURE.inner || Math.abs(lz) > SITE.d / 2 - PASTURE.inner) return false;
  for (const k of PASTURE.keepOut) if (Math.hypot(lx - k.x, lz - k.z) < k.r) return false;
  return true;
}
function setClip(ctx, row, name, speed = 1) {
  const s = row.state;
  if (s.clip === name && Math.abs((s.cs ?? 1) - speed) < 0.15) return;
  play(ctx, row, { name: `pasture-${name}`, ...CL[name] }, { channel: 'body', loop: true, speed, blendIn: 0.35 });
  s.clip = name; s.cs = Math.round(speed * 100) / 100;
}
function scratch(ctx, row) { const all = (ctx.session.herd ??= {}); return (all[row.id] ??= { yaw: row.state.yaw ?? 0, v: null, lastP: null, lastAt: 0 }); }
function move(row, m, vx, vz) { if (!m.v || Math.abs(m.v.x - vx) > 0.04 || Math.abs(m.v.z - vz) > 0.04) { row.velocity = { x: vx, y: FALL, z: vz }; m.v = { x: vx, z: vz }; } }
function turn(row, m, want, rate, dt) {
  const d = wrapDeg(want - m.yaw);
  if (Math.abs(d) > 1) { const st = Math.max(-rate * dt, Math.min(rate * dt, d)); m.yaw = wrapDeg(m.yaw + st); row.rotation = { yaw: m.yaw }; return Math.abs(d - st) < 20; }
  return true;
}
function settle(ctx, row, m, now) {
  const s = row.state, graze = ctx.random() < 0.65;
  s.mode = graze ? 'graze' : 'stand'; s.until = now + (graze ? rnd(ctx, H.grazeMin, H.grazeMax) : rnd(ctx, H.standMin, H.standMax)) * 1000;
  s.yaw = Math.round(m.yaw); move(row, m, 0, 0); setClip(ctx, row, s.mode, rnd(ctx, 0.85, 1.15));
}
function pick(ctx) {
  const c = ctx.self.worldFeetPosition || ctx.self.feetPosition;
  for (let i = 0; i < 12; i++) { const x = c.x + rnd(ctx, -1, 1) * (SITE.w / 2 - PASTURE.inner), z = c.z + rnd(ctx, -1, 1) * (SITE.d / 2 - PASTURE.inner); if (inside(ctx, x, z)) return { x, z }; }
  return { x: c.x, z: c.z + 2 };
}
function step(ctx, row, near, now, dt) {
  const s = row.state, m = scratch(ctx, row), p = row.feetPosition, sc = s.scale ?? 1;
  if (!s.nickerAt) s.nickerAt = now + rnd(ctx, H.nickerMin, H.nickerMax) * 1000;
  if (s.petAt && s.petAt !== s.petSeen) {
    s.petSeen = s.petAt; s.mode = 'pet'; s.until = now + 2400; move(row, m, 0, 0);
    const by = s.petBy && ctx.getObject(s.petBy), q = by && (by.worldFeetPosition || by.feetPosition);
    if (q) { m.yaw = yawTo(q.x - p.x, q.z - p.z); row.rotation = { yaw: m.yaw }; }
    setClip(ctx, row, 'pet'); return;
  }
  if ((s.mode === 'pet' || s.mode === 'nicker') && now < s.until) return;
  if (s.mode === 'pet' || s.mode === 'nicker') settle(ctx, row, m, now);
  const idle = s.mode === 'graze' || s.mode === 'stand' || s.mode === 'watch';
  if (idle && now > s.nickerAt) {
    s.nickerAt = now + rnd(ctx, H.nickerMin, H.nickerMax) * 1000; s.mode = 'nicker'; s.until = now + 1600;
    ctx.emit('playSound', { clip: ctx.random() < 0.7 ? PASTURE.sounds.nicker : PASTURE.sounds.snort, position: { x: p.x, y: p.y + 1.6, z: p.z }, volume: 0.35, pitch: (s.pitch || 1) * rnd(ctx, 0.95, 1.05), maxDistance: H.hearRange });
    setClip(ctx, row, 'nicker'); return;
  }
  if (near.d < H.notice && s.mode !== 'walk' && s.mode !== 'trot') {
    if (s.mode !== 'watch') { s.mode = 'watch'; s.until = now + 4000; move(row, m, 0, 0); setClip(ctx, row, 'stand'); }
    turn(row, m, yawTo(near.p.x - p.x, near.p.z - p.z), 90, dt); return;
  }
  if (s.mode === 'watch') { if (now < s.until) return; settle(ctx, row, m, now); }
  if (idle || !s.mode) {
    if (!s.mode) settle(ctx, row, m, now);
    if (now < (s.until ?? 0)) { if (!inside(ctx, p.x, p.z)) s.until = 0; return; }
    const t = pick(ctx); s.tx = Math.round(t.x * 10) / 10; s.tz = Math.round(t.z * 10) / 10;
    s.mode = ctx.random() < H.trotChance ? 'trot' : 'walk'; m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
  }
  const dx = s.tx - p.x, dz = s.tz - p.z, dist = Math.hypot(dx, dz);
  if (dist < 0.8) { settle(ctx, row, m, now); return; }
  const trot = s.mode === 'trot' && dist > 2.5, speed = (trot ? H.trot : H.walk) * (0.6 + 0.4 * sc);
  const aligned = turn(row, m, yawTo(dx, dz), H.turnRate, dt), f = fwd(m.yaw), look = 1.6 * sc;
  if (!inside(ctx, p.x + f.x * look, p.z + f.z * look) && inside(ctx, p.x, p.z)) {
    if (!aligned) { move(row, m, 0, 0); return; }
    settle(ctx, row, m, now); return;
  }
  const v = aligned ? speed : speed * 0.2;
  move(row, m, f.x * v, f.z * v);
  setClip(ctx, row, trot ? 'trot' : 'walk', Math.max(0.5, Math.min(1.8, v / ((trot ? H.trot : H.walk) * sc))));
  if (now - m.lastAt > 5000) {
    if (m.lastP && Math.hypot(p.x - m.lastP.x, p.z - m.lastP.z) < 0.8) { settle(ctx, row, m, now); return; }
    m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
  }
}
export function update(ctx, dt) {
  const now = ctx.now(), players = [];
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (q) players.push(q); }
  for (const row of ctx.query({ tags: ['pasture-horse'], radius: 40 })) {
    const p = row.feetPosition; if (!p || !row.state?.name) continue;
    let d = Infinity, q = null;
    for (const pp of players) { const e = Math.hypot(pp.x - p.x, pp.z - p.z); if (e < d) { d = e; q = pp; } }
    if (d > H.wake) { if (!row.state.zz) { row.state.zz = true; row.velocity = { x: 0, y: FALL, z: 0 }; const m = scratch(ctx, row); m.v = null; if (row.state.mode === 'walk' || row.state.mode === 'trot') row.state.mode = 'graze'; } continue; }
    if (row.state.zz) row.state.zz = false;
    step(ctx, row, { d, p: q }, now, dt);
  }
}
