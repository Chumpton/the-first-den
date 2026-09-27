// Sage: one invisible manager row "sage-dragon" (this behavior). Every 150–300 s (seeded, ctx.after; the first ~40 s after
// spawn) a spring-green serpent dragon, row "sage" (scripts/gen/jade-dragon.js re-hued, scale 0.6, name tag + green sparkle
// and leaf trail as children), slides in from the east forest edge, flies 1–2 low laps (4–7 m up, ~9 m/s) of the measured
// circuit round the house and outbuildings (scripts/lib/sage-route.js), then climbs out over the treetops and is removed.
// "sage" exists only during a flight. Manager state: { nextAt, flying, flight, flyReq, flyDone, seq }.
// A player within sound.near hears one soft whoosh-chime per pass. This update() steps her only while flying; it sleeps between.
// Launch one now (editors), from run_script:
//   ctx.emit("sage:fly")                                                      — the ear
//   const m = getObject("sage-dragon"); m.state.flyReq = (m.state.flyReq ?? 0) + 1   — the state poke (wakes update)
// Tuning: scripts/lib/data/sage.yml.
import SAGE from './lib/data/sage.yml';
import { DRAGON } from './lib/data/dragon.js';
import { routeLength, pose } from './lib/sage-route.js';
import { waveClip } from './lib/dragon-wave.js';
export const updateSchedule = { every: SAGE.step ?? 2, near: { radius: 600 } };
const lerp = (a, b, t) => a + (b - a) * t;
const ID = 'sage', CHIMED = {};
const TRAIL = (c) => `fx
pop sparkle rate=?mobile:10|20 on=sphere(.4) life=1..2 v=sdir()*(.2..0.7) size=.12..0.26 acc=drag(1.2)+buoy(.1) col=hdr(${c[0]},${c[1]},${c[2]})>hdr(${c[0] * .4},${c[1] * .4},${c[2] * .4}) a=(1>.6:.8>0)*flick(8,.4) sz=$size*(1>.3) r=sprite(mote,add)
pop glint rate=?mobile:1|3 on=sphere(.25) life=.4..0.8 size=.35..0.6 col=hdr(${c[0] * 1.4},${c[1] * 1.4},${c[2] * 1.4}) a=1>0 sz=$size*(1>.2) r=sprite(soft-disc,add)
pop leaf rate=flick(.6,.5)*3 on=sphere(.5) life=2.5..4 v=sdir()*(.3..0.8) size=.12..0.2 spin=-3..3 tint=oklch(.72 .16 135)..oklch(.82 .15 108) acc=grav()*.12+drag(1.4)+curl(.6)*.8 col=$tint a=0>1:.1>1:.8>0 sz=$size rot=$age*$spin r=sprite(leaf,alpha)`;
function schedule(ctx, wait) {
  const s = ctx.self.state;
  wait = wait ?? lerp(SAGE.every[0], SAGE.every[1], ctx.random());
  if (s.timer) ctx.cancel?.(s.timer);
  s.timer = ctx.after(wait, 'fly', {});
  s.nextAt = ctx.now() + wait * 1000;
}
function launch(ctx) {
  const s = ctx.self.state;
  if (s.flying && ctx.getObject(ID)) return null;
  if (ctx.getObject(ID)) ctx.destroy(ID);
  const laps = Math.max(SAGE.laps[0], Math.min(SAGE.laps[1], Math.round(lerp(SAGE.laps[0] - 0.49, SAGE.laps[1] + 0.49, ctx.random()))));
  const total = laps * routeLength(), flight = { t0: ctx.now(), laps, total, seq: (s.seq = (s.seq ?? 0) + 1) };
  const o = pose(ctx, 0, total);
  const id = ctx.spawn(ID, {
    tags: ['sage'], audience: 'all', physics: 'none', castShadow: true, receiveShadow: false,
    feetPosition: o.pos, rotation: o.rot, scale: SAGE.scale, lifetime: total / SAGE.speed + 15,
    interpolation: { teleportThreshold: 20 },
    primitive: { kind: 'scripted', script: 'scripts/gen/jade-dragon.js', params: SAGE.palette },
    audio: { clip: SAGE.sound.loop, loop: true, gain: SAGE.sound.loopGain, spatial: true, maxDistance: SAGE.sound.loopRange },
    state: { name: 'Sage', flight },
  });
  const row = ctx.getObject(id);
  if (row) row.anim.body = { clip: waveClip(SAGE.wave, 'sage-wave'), loop: 'loop', weight: 1, speed: 1 };
  ctx.spawn('tag', { parent: id, feetPosition: SAGE.tag.at, physics: 'none', text: { content: SAGE.tag.text, size: SAGE.tag.size, color: SAGE.tag.color } });
  ctx.spawn('trail', { parent: id, feetPosition: DRAGON.trailAt, physics: 'none', fx: { script: TRAIL(SAGE.spark) } });
  s.flying = true; s.flight = flight;
  return id;
}
function land(ctx) {
  const s = ctx.self.state;
  if (ctx.getObject(ID)) ctx.destroy(ID);
  s.flying = false; s.flight = null;
  schedule(ctx);
}
export function onSpawn(ctx) {
  const s = ctx.self.state, now = ctx.now();
  if (!s.flying && ctx.getObject(ID)) ctx.destroy(ID);
  if (!s.nextAt || s.nextAt < now) schedule(ctx, SAGE.first);
}
export function fly(ctx) { launch(ctx); }
export const ears = { 'sage:fly': (ctx) => { launch(ctx); } };
export function update(ctx) {
  const s = ctx.self.state, now = ctx.now();
  if ((s.flyReq ?? 0) !== (s.flyDone ?? 0)) { s.flyDone = s.flyReq ?? 0; launch(ctx); }
  const f = s.flight, d = s.flying && f ? ctx.getObject(ID) : null;
  if (!d) {
    if (s.flying) land(ctx);
    if (!s.nextAt || s.nextAt < now - 5000) schedule(ctx);
    ctx.sleep(Math.max(1, (s.nextAt - now) / 1000));
    return;
  }
  const arc = ((now - f.t0) / 1000) * SAGE.speed;
  if (arc > f.total) { land(ctx); ctx.sleep(Math.max(1, (s.nextAt - now) / 1000)); return; }
  const o = pose(ctx, arc, f.total);
  d.feetPosition = o.pos; d.rotation = o.rot;
  const S = SAGE.sound;
  for (const p of ctx.place.players) {
    const q = p.feetPosition; if (!q) continue;
    if (Math.hypot(q.x - o.pos.x, q.y - o.pos.y, q.z - o.pos.z) > S.near) continue;
    if (now - (CHIMED[p.id] ?? 0) < S.cooldown * 1000) continue;
    CHIMED[p.id] = now;
    ctx.emit('playSound', { clip: S.chime, position: o.pos, volume: S.gain, maxDistance: S.range }, { audience: { player: p.id } });
  }
}
