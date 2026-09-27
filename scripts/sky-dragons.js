// Sky dragons: one invisible manager row "sky-dragons" (this behavior) launches 1–3 long serpent dragons every 70–150 s
// (seeded, ctx.after) that cross the sky above the forest in sinuous S-curves near the house, then removes them.
// Each dragon is one row "sky-dragon-<n>" (scripts/gen/jade-dragon.js re-hued by params) + one child sparkle trail at its tail;
// its path lives in its state and this manager's one update() steps every live dragon; it sleeps between flights.
// Launch one now (editors), from run_script:
//   ctx.emit("sky-dragons:launch", { count: 3 })                       — the ear
//   const m = getObject("sky-dragons"); m.state.launchReq = (m.state.launchReq ?? 0) + 1   — the state poke (wakes update)
// Tuning: scripts/lib/data/sky-dragons.yml.
import SKY from './lib/data/sky-dragons.yml';
import { DRAGON } from './lib/data/dragon.js';
export const updateSchedule = { every: SKY.step ?? 2, near: { radius: 900 } };
const R = Math.PI / 180, TAU = Math.PI * 2, KEYS = 16, NB = DRAGON.spine.bones;
const lerp = (a, b, t) => a + (b - a) * t;
const roll = (ctx, [a, b]) => lerp(a, b, ctx.random());
function quat(yaw, pitch) { const cy = Math.cos(yaw * R / 2), sy = Math.sin(yaw * R / 2), cx = Math.cos(pitch * R / 2), sx = Math.sin(pitch * R / 2); return [cy * sx, sy * cx, -sy * sx, cy * cx]; }
let CLIP = null;
function waveClip() { // yaw per spine bone in a travelling S-wave, looping (a mixer channel costs no tick)
  if (CLIP) return CLIP;
  const w = SKY.wave, times = [], per = {};
  for (let j = 0; j <= KEYS; j++) {
    times.push((j / KEYS) * w.period);
    const ph = (j % KEYS) / KEYS * TAU, pose = { n1: [-Math.sin(ph) * w.amp * 0.3, w.neck], head: [Math.sin(ph) * w.amp * 0.4, w.head] };
    for (let i = 1; i <= NB; i++) pose['s' + i] = [Math.sin(ph - i * w.phase) * w.amp * (w.grow + i / NB * 0.6), Math.sin(ph * 2 - i * w.phase) * w.lift];
    for (const b in pose) (per[b] ??= []).push(...quat(pose[b][0], pose[b][1]));
  }
  return (CLIP = { name: 'sky-dragon-wave', tracks: Object.keys(per).map((bone) => ({ bone, prop: 'rotation', times, values: per[bone] })) });
}
const trail = (c) => `fx
pop sparkle rate=?mobile:14|28 on=sphere(.5) life=1.2..2.4 v=sdir()*(.3..1) size=.18..0.36 acc=drag(1.2)+buoy(.1) col=hdr(${c[0]},${c[1]},${c[2]})>hdr(${c[0] * .4},${c[1] * .4},${c[2] * .4}) a=(1>.6:.8>0)*flick(8,.4) sz=$size*(1>.3) r=sprite(mote,add)
pop glint rate=?mobile:2|4 on=sphere(.3) life=.5..0.9 size=.5..0.8 col=hdr(${c[0] * 1.4},${c[1] * 1.4},${c[2] * 1.4}) a=1>0 sz=$size*(1>.2) r=sprite(soft-disc,add)`;
// the path: a crossing line through c along dir, swaying sideways and swelling up/down; t in 0..1 (outside extrapolates)
function at(ctx, p, t) {
  const u = t - 0.5, s = Math.sin(TAU * p.k * t + p.ph), sv = Math.sin(TAU * p.kv * t + p.ph * 1.7);
  const x = p.cx + p.dx * u * p.L + (-p.dz) * (p.A * s + p.side), z = p.cz + p.dz * u * p.L + p.dx * (p.A * s + p.side);
  const g = ctx.place.terrain.heightAt(x, z) ?? 0;
  return { x, y: Math.max(p.y + p.rise + p.B * sv, g + SKY.clearance), z };
}
function pose(ctx, p, t) {
  const a = at(ctx, p, t), e = 0.25 / p.dur, b = at(ctx, p, t + e), c = at(ctx, p, t - e);
  const dx = b.x - c.x, dy = b.y - c.y, dz = b.z - c.z, h = Math.hypot(dx, dz) || 1;
  // curvature sign → bank into the turn
  const ux = dx / h, uz = dz / h, lat = ((b.x + c.x - 2 * a.x) * -uz + (b.z + c.z - 2 * a.z) * ux) / (e * e * p.L * p.L / 4000);
  const rollDeg = Math.max(-SKY.maxBank, Math.min(SKY.maxBank, -lat * SKY.bank * 10));
  return { pos: a, rot: { yaw: Math.atan2(-dx, -dz) / R, pitch: Math.atan2(dy, h) / R, roll: rollDeg } };
}
function schedule(ctx) {
  const s = ctx.self.state, wait = roll(ctx, SKY.every);
  if (s.timer) ctx.cancel?.(s.timer);
  s.timer = ctx.after(wait, 'launch', {});
  s.nextAt = ctx.now() + wait * 1000;
}
function launchFlight(ctx, count) {
  const s = ctx.self.state, now = ctx.now(), H = SKY.home;
  const n = Math.max(1, Math.min(3, Math.round(count ?? roll(ctx, [SKY.count[0] - 0.49, SKY.count[1] + 0.49]))));
  const head = ctx.random() * TAU, dx = Math.sin(head), dz = Math.cos(head);
  const off = roll(ctx, SKY.pass) * (ctx.random() < 0.5 ? -1 : 1);
  const dur = roll(ctx, SKY.duration), base = {
    cx: H.x + (-dz) * off, cz: H.z + dx * off, dx, dz, dur, L: roll(ctx, SKY.speed) * dur,
    A: roll(ctx, SKY.sway), k: roll(ctx, SKY.waves), kv: roll(ctx, SKY.waves) * 1.3, B: roll(ctx, SKY.bob), y: roll(ctx, SKY.height),
  };
  const names = Object.keys(SKY.palettes), start = Math.floor(ctx.random() * names.length);
  let lag = 0; const ids = [];
  for (let i = 0; i < n; i++) {
    const pal = names[(start + i) % names.length], P = SKY.palettes[pal];
    if (i) lag += roll(ctx, SKY.followLag);
    const path = { ...base, t0: now + lag * 1000, ph: ctx.random() * TAU, side: i ? (i % 2 ? 1 : -1) * roll(ctx, SKY.followSide) * Math.ceil(i / 2) : 0, rise: i ? roll(ctx, SKY.followRise) : 0, pal };
    const s0 = pose(ctx, path, -lag / dur), seq = (s.seq = (s.seq ?? 0) + 1);
    const id = ctx.spawn('sky-dragon-' + seq, {
      tags: ['sky-dragon'], audience: 'all', physics: 'none', castShadow: false, receiveShadow: false,
      feetPosition: s0.pos, rotation: s0.rot, scale: roll(ctx, SKY.scale), lifetime: dur + lag + 8,
      interpolation: { teleportThreshold: 60 },
      primitive: { kind: 'scripted', script: 'scripts/gen/jade-dragon.js', params: { hue: P.hue, chroma: P.chroma, light: P.light } },
      audio: { clip: SKY.sound.loop, loop: true, gain: SKY.sound.gain, spatial: true, maxDistance: SKY.sound.range },
      state: { path, flying: true },
    });
    const row = ctx.getObject(id);
    if (row) row.anim.body = { clip: waveClip(), loop: 'loop', weight: 1, speed: 0.85 + ctx.random() * 0.3 };
    ctx.spawn('trail', { parent: id, feetPosition: DRAGON.trailAt, physics: 'none', fx: { script: trail(P.spark) } });
    ids.push(id);
  }
  s.live = ids; s.lastLaunch = now;
  ctx.after(dur * SKY.sound.roarAt, 'roar', { id: ids[0] });
  return ids;
}
export function onSpawn(ctx) { if (!ctx.self.state.nextAt || ctx.self.state.nextAt < ctx.now()) schedule(ctx); }
export function launch(ctx) { launchFlight(ctx); schedule(ctx); }
export function roar(ctx, { id } = {}) {
  const d = id && ctx.getObject(id); if (!d) return;
  ctx.emit('playSound', { clip: SKY.sound.roar, position: d.feetPosition, volume: SKY.sound.roarGain, maxDistance: SKY.sound.roarRange }, { audience: 'all' });
}
export const ears = { 'sky-dragons:launch': (ctx, p) => { launchFlight(ctx, p?.count); } };
export function update(ctx) {
  const s = ctx.self.state, now = ctx.now();
  if ((s.launchReq ?? 0) !== (s.launchDone ?? 0)) { s.launchDone = s.launchReq ?? 0; launchFlight(ctx); }
  const rows = ctx.query({ tags: ['sky-dragon'], radius: 5000 });
  let alive = 0;
  for (const r of rows) {
    const p = r.state?.path; if (!p) continue;
    const t = (now - p.t0) / (p.dur * 1000);
    if (t > 1.02) { ctx.destroy(r.id); continue; }
    const o = pose(ctx, p, t), d = ctx.getObject(r.id); if (!d) continue;
    d.feetPosition = o.pos; d.rotation = o.rot; alive++;
  }
  if (!alive) {
    if (!s.nextAt || s.nextAt < now - 5000) schedule(ctx);
    ctx.sleep(Math.max(1, (s.nextAt - now) / 1000));
  }
}
