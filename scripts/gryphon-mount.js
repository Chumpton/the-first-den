// The player's flight mount: double-tap space to fly (scripts/player.js) and a gryphon sweeps in under you.
// Slow or still aloft it hovers on big beats; flying it rows the air; hold forward and after a moment it tucks its wings and
// speeds (state.flyBoost, read by player.js); sink to the ground and it lands, sets you down, folds its wings and stands a
// moment beside you before it leaves. state.riding = 'gryphon' seats the body (humanoid-locomotion holds the ride pose).
import { play, clips } from 'builtin/anim';
import { GRY } from './lib/data/gryphon.js';
let CL = null;
const clipOf = (ctx, n) => (CL ??= clips(ctx, 'anim/gryphon.yml'))[n];
const yawOf = (r) => (typeof r === 'number' ? r : !r ? 0 : typeof r.w === 'number' ? Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) * 180 / Math.PI : r.yaw ?? 0);
const FEATHERS = `fx
pop feather burst=26..34 on=sphere(1.2) life=1.2..2.2 v=sdir()*(1.5..3.5)+up(1) size=.08..0.14 spin=-5..5 acc=grav()*.25+drag(1.8)+curl(.6) col=<.95,.9,.78>..<.55,.38,.22> a=1>.7:1>0 sz=$size rot=$age*$spin r=sprite(stalk,alpha,velocity,.02)
pop gust burst=10 on=disc(1.4) life=.5..0.9 v=sdir()*(2..4) size=.6..1 acc=drag(2) col=<.9,.9,.95> a=0>.2:.3>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)
pop glint burst=1 life=.35 r=light(<1,.85,.55>,40,8)`;
const STREAKS = `fx follow=player
pop streak rate=?mobile:14|30 on=box(5,3,2) life=.25..0.4 v=<0,0,9> size=.025 col=<1,1,1> a=0>.35:.4>0 r=sprite(soft-disc,add,velocity,.5)`;
const DUST = `fx
pop dust burst=26 on=disc(1.6) life=.7..1.3 v=sdir()*(2..4)+up(.4..1) size=.4..0.7 acc=buoy(.2)+drag(1.6) col=<.62,.55,.44> a=0>.35:.3>.7:.15>0 sz=$size*(.6>2.2) r=sprite(smoke-puff,alpha)`;

function setMode(ctx, g, mode) {
  const w = ctx.session.gry;
  if (w.mode === mode) return;
  w.mode = mode;
  const c = clipOf(ctx, mode);
  if (c) play(ctx, g, c, { channel: 'body', loop: true, blendIn: mode === 'speed' ? 0.35 : 0.25 });
  g.audio = mode === 'landed' ? null : { clip: mode === 'speed' ? GRY.sounds.rush : GRY.sounds.flap, loop: true, gain: mode === 'speed' ? 0.22 : 0.18, spatial: true, maxDistance: 30 };
  g.fx = mode === 'speed' ? { script: STREAKS } : null;
}

function summon(ctx) {
  const me = ctx.self, w = ctx.session.gry;
  const id = ctx.spawn({
    tags: ['gryphon', 'mount-cosmetic'], scope: 'session', parent: me.id,
    feetPosition: { x: 0, y: GRY.y, z: 0 }, rotation: 0,
    primitive: { kind: 'scripted', script: 'scripts/gen/gryphon.js' },
  });
  w.id = id; w.mode = null; w.fwd = 0;
  me.state.riding = 'gryphon';
  const p = me.feetPosition;
  ctx.emit('fx', { position: { x: p.x, y: p.y, z: p.z }, script: FEATHERS });
  ctx.emit('playSound', { clip: GRY.sounds.summon, position: p, volume: 0.6, maxDistance: 45 });
  const g = ctx.getObject(id); if (g) setMode(ctx, g, 'hover');
}

function land(ctx) {
  const me = ctx.self, w = ctx.session.gry, g = w.id && ctx.getObject(w.id);
  me.state.riding = null; me.state.flyBoost = false;
  if (!g) { w.id = null; return; }
  const p = me.feetPosition, yaw = yawOf(me.rotation), r = yaw * Math.PI / 180;
  const x = p.x + Math.cos(r) * GRY.side, z = p.z - Math.sin(r) * GRY.side;
  const gy = (ctx.place.terrain.heightAt(x, z) ?? p.y) + GRY.paws;
  g.parent = null;
  g.feetPosition = { x, y: gy, z };
  g.rotation = { yaw };
  setMode(ctx, g, 'landed');
  ctx.emit('fx', { position: { x, y: gy - GRY.paws, z }, script: DUST });
  ctx.emit('playSound', { clip: GRY.sounds.land, position: { x, y: gy, z }, volume: 0.6, maxDistance: 35 });
  w.leaveAt = ctx.now() + GRY.linger * 1000; w.parked = w.id; w.id = null;
}

function leave(ctx) {
  const w = ctx.session.gry, g = w.parked && ctx.getObject(w.parked);
  if (g) {
    const p = g.feetPosition;
    ctx.emit('fx', { position: { x: p.x, y: p.y, z: p.z }, script: FEATHERS });
    ctx.emit('playSound', { clip: GRY.sounds.leave, position: p, volume: 0.5, maxDistance: 40 });
    ctx.destroy(w.parked);
  }
  w.parked = null; w.leaveAt = null;
}

export function update(ctx, dt) {
  const me = ctx.self, w = (ctx.session.gry ??= { id: null, mode: null, fwd: 0 });
  if (w.parked && ctx.now() >= w.leaveAt) leave(ctx);
  const flying = !!me.state.flying && !me.parent;
  if (flying && !w.id) { if (w.parked) leave(ctx); summon(ctx); }
  if (!flying) { if (w.id) land(ctx); else if (me.state.riding === 'gryphon') me.state.riding = null; if (!w.parked) ctx.sleep(0.25); return; }
  const g = ctx.getObject(w.id);
  if (!g) { w.id = null; return; }
  const v = me.velocity ?? { x: 0, y: 0, z: 0 }, sp = Math.hypot(v.x || 0, v.z || 0);
  const hands = ctx.session.wowHands?.[me.id];
  const forward = (hands?.mz ?? 0) > 0.3 || (hands?.orbit && hands?.steer);
  w.fwd = forward && sp > 6 ? w.fwd + dt : 0;
  const boost = w.fwd > GRY.boostAfter;
  if (boost !== !!me.state.flyBoost) {
    me.state.flyBoost = boost;
    if (boost) ctx.emit('playSound', { clip: GRY.sounds.leave, position: me.feetPosition, volume: 0.35, maxDistance: 30 });
  }
  setMode(ctx, g, boost ? 'speed' : sp < GRY.hoverBelow ? 'hover' : 'fly');
}
