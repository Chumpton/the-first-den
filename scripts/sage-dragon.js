// Sage: one invisible manager row "sage-dragon" (this behavior). Every 150–300 s (seeded, ctx.after; the first ~40 s after
// spawn) a spring-green serpent dragon, row "sage" (scripts/gen/jade-dragon.js re-hued, scale 0.6, name tag + green sparkle
// and leaf trail as children), slides in from the east forest edge, flies 1–2 low laps (4–7 m up, ~9 m/s) of the measured
// circuit round the house and outbuildings (scripts/lib/sage-route.js), then climbs out over the treetops and is removed.
// "sage" exists only during a flight. Manager state: { nextAt, flying, flight, flyReq, flyDone, seq }.
// A player within sound.near hears one soft whoosh-chime per pass. This update() steps her only while flying; it sleeps between.
// Launch one now (editors), from run_script:
//   ctx.emit("sage:fly")                                                      — the ear
//   const m = getObject("sage-dragon"); m.state.flyReq = (m.state.flyReq ?? 0) + 1   — the state poke (wakes update)
// Greet: a grounded player near her path makes her pause, glide down and hover facing them (sage.yml greet). While she hovers an
// invisible row "sage-reach" (tags interactable, state.pressTo "sage-dragon") stands between them, so E (home-player-feel ->
// nearestInteractable) rings this manager's press ear: odd presses "pat" (she rears, swells, chirps), even presses "treat"
// (a seed from player.state.seeds, else an apple: she snaps it, sneezes a spark, puffs green smoke, "Sage loves it!"); 5 s apart.
// Tuning: scripts/lib/data/sage.yml.
import SAGE from './lib/data/sage.yml';
import { DRAGON } from './lib/data/dragon.js';
import { routeLength, pose } from './lib/sage-route.js';
import { waveClip } from './lib/dragon-wave.js';
import { animate } from 'builtin/tween';
export const updateSchedule = { every: SAGE.step ?? 2, near: { radius: 600 } };
const lerp = (a, b, t) => a + (b - a) * t;
const ID = 'sage', REACH = 'sage-reach', CHIMED = {}, GREETED = {};
const G = SAGE.greet, R = Math.PI / 180;
const sm = (x) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
const angLerp = (a, b, t) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;
const qx = (deg) => [Math.sin(deg * R / 2), 0, 0, Math.cos(deg * R / 2)];
function nodClip(name, keys) { // keys: [[t, n1Pitch, headPitch], …] a one-shot head gesture over the flight wave
  const times = keys.map((k) => k[0]);
  return { name, tracks: [{ bone: 'n1', prop: 'rotation', times, values: keys.flatMap((k) => qx(k[1])) }, { bone: 'head', prop: 'rotation', times, values: keys.flatMap((k) => qx(k[2])) }] };
}
const REAR = nodClip('sage-rear', [[0, 0, 0], [0.3, 28, 18], [0.8, 22, 26], [1.4, 0, 0]]);
const SNAP = nodClip('sage-snap', [[0, 0, 0], [0.15, 12, 20], [0.3, -18, -26], [0.55, -6, -10], [1.1, 0, 0]]);
const JOY = `fx
pop joy burst=14..18 on=sphere(.5) life=.8..1.4 v=up(1..1.8)+sdir()*(.3..0.6) size=.1..0.2 acc=drag(1.2) col=hdr(1.2,2.6,1)>hdr(.5,1.1,.4) a=(1>.7:.8>0)*flick(6,.3) sz=$size*(1>.4) r=sprite(mote,add)
pop leaf burst=5..7 on=sphere(.4) life=1.4..2.2 v=sdir()*(.6..1.2)+up(.6) size=.1..0.16 spin=-4..4 tint=oklch(.74 .16 135)..oklch(.84 .15 108) acc=grav()*.15+drag(1.3)+curl(.6)*.6 col=$tint a=1>.7:1>0 sz=$size rot=$age*$spin r=sprite(leaf,alpha)`;
const TREAT = `fx
pop puff burst=12..16 on=sphere(.2) life=1.2..2 v=sdir()*(.4..1)+up(.5) size=.25..0.4 acc=buoy(.4)+drag(1.5)+curl(.4)*.5 col=<.45,.85,.4>><.7,.9,.62> a=0>.55:.15>.6:.25>0 sz=$size*(.6>2.2) rot=spin(.2) r=sprite(smoke-puff,alpha)
pop spark burst=6..9 on=point() v=<%dir|0,0,-1>*(2..3.5)+sdir()*(.6..1.2) life=.25..0.5 size=.02..0.04 acc=drag(2)+grav()*.3 col=hdr(4,3,.8)>hdr(2,.9,.2) a=1>0 sz=$size r=sprite(ember,add,velocity,.02)
pop glint burst=1 life=.3 size=.5 col=hdr(3,3.2,1.2) a=1>0 sz=$size*(.4>1.3) r=sprite(soft-disc,add)
pop bits burst=4..5 on=sphere(.08) v=sdir()*(1..2)+up(1) life=.5..0.9 size=.05..0.08 spin=-8..8 acc=grav() col=%tint|<.85,.2,.15> a=1>.7:1>0 sz=$size rot=$age*$spin floor=die r=sprite(chip,alpha)`;
function setTag(ctx, f, text) { const t = f?.tag && ctx.getObject(f.tag); if (t) t.text = { content: text, size: SAGE.tag.size, color: SAGE.tag.color }; }
function endGreet(ctx) { if (ctx.getObject(REACH)) ctx.destroy(REACH); ctx.self.state.greet = null; }
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
    feetPosition: o.pos, rotation: o.rot, scale: SAGE.scale, lifetime: total / SAGE.speed + 15 + G.max * (G.hold + G.glide * 2 + G.stay * 4),
    interpolation: { teleportThreshold: 20 },
    primitive: { kind: 'scripted', script: 'scripts/gen/jade-dragon.js', params: SAGE.palette },
    audio: { clip: SAGE.sound.loop, loop: true, gain: SAGE.sound.loopGain, spatial: true, maxDistance: SAGE.sound.loopRange },
    state: { name: 'Sage', flight },
  });
  const row = ctx.getObject(id);
  if (row) row.anim.body = { clip: waveClip(SAGE.wave, 'sage-wave'), loop: 'loop', weight: 1, speed: 1 };
  flight.tag = ctx.spawn('tag', { parent: id, feetPosition: SAGE.tag.at, physics: 'none', text: { content: SAGE.tag.text, size: SAGE.tag.size, color: SAGE.tag.color } });
  ctx.spawn('trail', { parent: id, feetPosition: DRAGON.trailAt, physics: 'none', fx: { script: TRAIL(SAGE.spark) } });
  s.flying = true; s.flight = flight;
  return id;
}
function land(ctx) {
  const s = ctx.self.state;
  if (ctx.getObject(ID)) ctx.destroy(ID);
  endGreet(ctx);
  s.flying = false; s.flight = null;
  schedule(ctx);
}
export function onSpawn(ctx) {
  const s = ctx.self.state, now = ctx.now();
  if (!s.flying && ctx.getObject(ID)) ctx.destroy(ID);
  if (!s.flying) endGreet(ctx);
  if (!s.nextAt || s.nextAt < now) schedule(ctx, SAGE.first);
}
export function fly(ctx) { launch(ctx); }
function press(ctx, { by } = {}) {
  const s = ctx.self.state, d = ctx.getObject(ID), g = s.greet, now = ctx.now();
  if (!d || !g) return;
  s.greet = { ...g, until: Math.max(g.until, now + G.stay * 1000), outAt: null };
  if (now < (s.emoteAt ?? 0) + G.cooldown * 1000) return;
  s.emoteAt = now; s.emoteClear = now + 1600;
  const n = (s.emoteN = (s.emoteN ?? 0) + 1), yaw = g.yaw * R, fw = { x: -Math.sin(yaw), y: 0, z: -Math.cos(yaw) };
  const head = { x: g.hover.x + fw.x * 1.1, y: g.hover.y + 0.45, z: g.hover.z + fw.z * 1.1 };
  const tag = { x: g.hover.x, y: g.hover.y + 2.3, z: g.hover.z }, S = SAGE.scale;
  if (n % 2) { // pat: she rears up, swells and chirps
    d.anim.emote = { clip: REAR, loop: 'once', weight: 1, speed: 1 };
    animate(ctx, d, { scale: [S, S * 1.16, S * 0.95, S * 1.06, S] }, { duration: 0.9, easing: 'easeOutQuad' });
    ctx.emit('playSound', { clip: G.chirp, position: head, volume: 0.8, maxDistance: 25 });
    ctx.emit('fx', { position: head, script: JOY });
    ctx.emit('damageNumber', { position: tag, text: 'happy chirp ♥', color: 'oklch(0.9 0.14 135)', size: 0.8, lifetime: 1.6 });
  } else { // treat: a seed if they carry any, else an apple; she snaps it, sneezes a spark, puffs green smoke
    const p = by && ctx.getObject(by), seeds = Number(p?.state?.seeds) || 0, seed = seeds > 0;
    if (seed) p.state.seeds = seeds - 1;
    d.anim.emote = { clip: SNAP, loop: 'once', weight: 1, speed: 1 };
    animate(ctx, d, { scale: [S, S * 0.94, S * 1.05, S] }, { duration: 0.6 });
    ctx.emit('playSound', { clip: G.chomp, position: head, volume: 0.8, maxDistance: 25 });
    ctx.emit('playSound', { clip: G.sneeze, position: head, volume: 0.55, maxDistance: 20 });
    ctx.emit('fx', { position: head, script: TREAT, params: { dir: fw, tint: seed ? { x: 0.8, y: 0.62, z: 0.3 } : { x: 0.85, y: 0.2, z: 0.15 } } });
    ctx.emit('damageNumber', { position: tag, text: seed ? 'Sage loves it! (seed)' : 'Sage loves it!', color: 'oklch(0.9 0.15 135)', size: 1, lifetime: 2 });
  }
}
export const ears = { 'sage:fly': (ctx) => { launch(ctx); }, press };
// the greet: returns true while it owns her pose this step
function greet(ctx, d, f, arc, o) {
  const s = ctx.self.state, now = ctx.now();
  let g = s.greet;
  if (s.emoteClear && now > s.emoteClear) { d.anim.emote = null; s.emoteClear = null; }
  if (!g) {
    const E = SAGE.enter;
    if ((f.greets ?? 0) >= G.max || arc < E.blend || arc > f.total - E.blend) return false;
    let who = null, best = G.notice;
    for (const p of ctx.place.players) {
      const q = p.feetPosition; if (!q || p.state?.mountedOn || p.state?.seatedOn || p.parent) continue;
      if (now - (GREETED[p.id] ?? -1e12) < G.again * 1000) continue;
      const gy = ctx.place.terrain.heightAt(q.x, q.z) ?? q.y; if (Math.abs(q.y - gy) > 1.5) continue;
      const dd = Math.hypot(q.x - o.pos.x, q.z - o.pos.z); if (dd < best) { best = dd; who = p; }
    }
    if (!who) return false;
    GREETED[who.id] = now;
    const q = who.feetPosition, dx = o.pos.x - q.x, dz = o.pos.z - q.z, h = Math.hypot(dx, dz) || 1, ux = dx / h, uz = dz / h;
    const hx = q.x + ux * G.gap, hz = q.z + uz * G.gap;
    const hover = { x: hx, y: Math.max(q.y, ctx.place.terrain.heightAt(hx, hz) ?? q.y) + G.lift, z: hz };
    const rx = q.x + ux * G.reach, rz = q.z + uz * G.reach;
    ctx.spawn(REACH, { tags: ['interactable', 'sage-reach'], physics: 'none', feetPosition: { x: rx, y: q.y, z: rz }, state: { pressTo: ctx.self.id, name: 'Sage', act: 'Pat' } });
    g = s.greet = { pid: who.id, t0: now, until: now + G.hold * 1000, outAt: null, hover, yaw: Math.atan2(ux, uz) / R, from: { pos: o.pos, rot: o.rot } };
    s.flight = { ...f, greets: (f.greets ?? 0) + 1 };
    setTag(ctx, f, G.prompt);
  }
  const gl = G.glide * 1000;
  let k = sm((now - g.t0) / gl);
  if (!g.outAt) {
    const p = ctx.place.players.find((x) => x.id === g.pid), q = p?.feetPosition;
    const far = !q || Math.hypot(q.x - g.hover.x, q.z - g.hover.z) > G.leave;
    if (now > g.until || far) { g = s.greet = { ...g, outAt: now }; if (ctx.getObject(REACH)) ctx.destroy(REACH); setTag(ctx, f, SAGE.tag.text); }
  }
  if (g.outAt) {
    const u = (now - g.outAt) / gl;
    if (u >= 1) { s.flight = { ...s.flight, t0: s.flight.t0 + (now - g.t0) }; endGreet(ctx); return false; }
    k = Math.min(k, 1 - sm(u));
  }
  const bob = Math.sin(now / 1000 * 2.2) * 0.12 * k, a = g.from.pos, b = g.hover, r = g.from.rot;
  d.feetPosition = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k + bob, z: a.z + (b.z - a.z) * k };
  d.rotation = { yaw: angLerp(r.yaw, g.yaw, k), pitch: r.pitch * (1 - k), roll: r.roll * (1 - k) };
  return true;
}
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
  const arc = (((s.greet ? s.greet.t0 : now) - f.t0) / 1000) * SAGE.speed;
  if (!s.greet && arc > f.total) { land(ctx); ctx.sleep(Math.max(1, (s.nextAt - now) / 1000)); return; }
  const o = pose(ctx, arc, f.total);
  if (greet(ctx, d, s.flight, arc, o)) return;
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
