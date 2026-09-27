// The dock rowboat: E climbs in (the den's mount rider seats you on the stern thwart, facing the bow), W/S row, A/D turn.
// It keeps to open water (the lake bowl and the creek mouth), bobs and rolls with the turn, and leaves a small wake.
// E again near the shore or the dock steps you out onto dry ground; far from shore it tells you to row closer.
// Kinematic: moved by feetPosition/rotation on the rider's machine while rowed. Bow is local +z.
import { BOAT as B, FISH as F } from './lib/data/rowboat.js';
import { GLINT, SPLASH } from './lib/data/pond.js';
const D2R = Math.PI / 180, wrap = (a) => ((a % 360) + 540) % 360 - 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const WAKE = `fx
pop wake rate=%rate|0 on=disc(.25) life=1.2..2 v=sdir()*(.2..0.5) size=.18..0.32 acc=drag(1.5) col=<.92,.97,1> a=0>.45:.3>.6:.12>0 sz=$size*(.6>2.4) rot=spin(.2) r=sprite(soft-disc,alpha)`;
function mind(ctx) {
  const all = (ctx.session.rowboat ??= {});
  const r = ctx.self.rotation, yaw = typeof r === 'number' ? r : (r?.yaw ?? 0);
  return (all[ctx.self.id] ??= { yaw, speed: 0, turn: 0, t: 0, in: { x: 0, z: 0 }, lastE: 0 });
}
const riderHere = (ctx, id) => !!id && ctx.place.players.some((p) => p.id === id);
const depth = (ctx, x, z) => ctx.place.terrain.heightAt(x, z) ?? 1;
function water(ctx, x, z) {
  if (Math.hypot(x - B.home.x, z - B.home.z) > B.maxRange) return false;
  for (const [ox, oz] of [[0, 0], [B.hull, 0], [-B.hull, 0], [0, B.hull], [0, -B.hull]]) if (depth(ctx, x + ox, z + oz) > B.shallow) return false;
  return true;
}
function shoreNear(ctx, p) {
  const dk = B.dockStep, dd = Math.hypot(p.x - dk.x, p.z - dk.z);
  if (dd < B.dockReach) return { ...dk };
  let best = null;
  for (let r = 1.6; r <= B.shoreReach; r += 0.8) for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r, g = depth(ctx, x, z);
    if (g > B.dryGround) { best = { x, y: g, z }; break; }
    if (best) break;
  }
  return best;
}
function tryLeave(ctx, by) {
  const s = ctx.self.state, m = mind(ctx), p = ctx.self.feetPosition;
  if (ctx.now() - m.lastE < 400) return; m.lastE = ctx.now();
  const drop = shoreNear(ctx, p);
  if (!drop) { ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2, z: p.z }, text: 'row closer to shore', color: '#f2e6cf', lifetime: 1.6 }, { audience: { player: by } }); return; }
  if (s.fishing) endFishing(ctx);
  s.dropAt = drop; s.rider = null; ctx.self.controller = null;
  m.speed = 0; ctx.self.audio = null;
  const w = ctx.getObject(ctx.self.id + '/wake'); if (w) w.fx = null;
  ctx.emit('playSound', { clip: B.bump, position: p, volume: 0.5, maxDistance: 20 });
}

// ---- fishing (key 2 while seated): cast -> wait -> bite (2 to hook) -> the catch held overhead ----
const R2D = 180 / Math.PI, KIT = 'scripts/gen/catch-fish.js';
const kid = (ctx, n) => ctx.getObject(ctx.self.id + '/' + n);
const drop = (ctx, n) => { if (kid(ctx, n)) ctx.destroy(ctx.self.id + '/' + n); };
function worldAt(ctx, l) { // boat-local -> world, yaw only (bow is +z)
  const p = ctx.self.feetPosition, y = mind(ctx).yaw * D2R, c = Math.cos(y), s = Math.sin(y);
  return { x: p.x + l.x * c + l.z * s, y: p.y + (l.y ?? 0), z: p.z - l.x * s + l.z * c };
}
function toast(ctx, text, color, by) { const p = ctx.self.feetPosition; ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.4, z: p.z }, text, color, size: 1.1, lifetime: 1.8 }, { audience: { player: by } }); }
function riderAnim(ctx, clip) {
  const r = ctx.getObject(ctx.self.state.rider); if (!r) return;
  r.anim.fish = clip ? { clip, loop: 'once', weight: 1, blendIn: 0.15, mask: { from: 'Spine' }, blend: 'override' } : null;
}
function rodTip() {
  const yw = F.rodYaw * D2R, pt = -F.rodPitch * D2R, L = 1.9;
  return { x: F.rodHand.x + Math.sin(yw) * Math.cos(pt) * L, y: F.rodHand.y + Math.sin(pt) * L, z: F.rodHand.z + Math.cos(yw) * Math.cos(pt) * L };
}
function lineTo(ctx, bob) {
  const t = rodTip(), u = { x: t.x - bob.x, y: t.y - bob.y, z: t.z - bob.z }, len = Math.hypot(u.x, u.y, u.z), h = Math.hypot(u.x, u.z);
  const spec = { feetPosition: { x: (t.x + bob.x) / 2, y: (t.y + bob.y) / 2, z: (t.z + bob.z) / 2 }, pivot: 'center',
    rotation: { yaw: Math.atan2(-u.x, -u.z) * R2D, pitch: Math.atan2(u.y, h) * R2D },
    primitive: { kind: 'box', width: 0.006, height: 0.006, depth: len }, material: { color: 'oklch(0.95 0.01 90)', emissive: 'oklch(0.5 0 0)' }, physics: 'none', castShadow: false };
  const l = kid(ctx, 'line'); if (l) Object.assign(l, spec); else ctx.spawn('line', { parent: ctx.self.id, ...spec });
}
function endFishing(ctx) {
  const s = ctx.self.state; for (const n of ['rod', 'bobber', 'line', 'catch']) drop(ctx, n);
  riderAnim(ctx, null); const r = ctx.getObject(s.rider); if (r) r.state.fishGet = null; s.fishing = null;
}
function startCast(ctx) {
  const s = ctx.self.state, m = mind(ctx), by = s.rider;
  if (Math.abs(m.speed) > F.maxSpeed) { toast(ctx, 'stop rowing to cast', '#f2e6cf', by); return; }
  m.speed = 0;
  if (!kid(ctx, 'rod')) ctx.spawn('rod', { parent: ctx.self.id, feetPosition: F.rodHand, rotation: { yaw: F.rodYaw, pitch: F.rodPitch }, primitive: { kind: 'scripted', script: KIT, params: { item: 'rod' } }, physics: 'none', castShadow: false });
  riderAnim(ctx, F.clip.cast);
  ctx.emit('playSound', { clip: F.sfx.cast, position: ctx.self.feetPosition, volume: 0.6, maxDistance: 24 });
  s.fishing = { phase: 'cast', at: ctx.now() + F.castDelay * 1000 };
}
function press2(ctx) {
  const s = ctx.self.state, f = s.fishing, by = s.rider;
  if (!f) return startCast(ctx);
  if (f.phase === 'wait') { ctx.emit('playSound', { clip: F.sfx.miss, position: ctx.self.feetPosition, volume: 0.5, maxDistance: 16 }); toast(ctx, 'too soon… reeled in empty', '#f2e6cf', by); endFishing(ctx); return; }
  if (f.phase === 'bite') return landCatch(ctx);
}
function landCatch(ctx) {
  const s = ctx.self.state, by = s.rider, rider = ctx.getObject(by);
  const total = F.catches.reduce((a, c) => a + c.w, 0); let roll = ctx.random() * total, c = F.catches[0];
  for (const k of F.catches) { if ((roll -= k.w) < 0) { c = k; break; } }
  const bob = s.fishing.bob; ctx.emit('fx', { position: worldAt(ctx, { ...bob, y: 0 }), script: SPLASH });
  drop(ctx, 'bobber'); drop(ctx, 'line'); drop(ctx, 'rod');
  ctx.spawn('catch', { parent: ctx.self.id, feetPosition: F.overhead, rotation: { yaw: 0, roll: c.kind === 'boot' ? 0 : 8 }, scale: c.kind === 'boot' ? 1.3 : 1.25,
    primitive: { kind: 'scripted', script: KIT, params: { item: 'fish', kind: c.kind } }, physics: 'none', castShadow: false, fx: { script: GLINT } });
  riderAnim(ctx, F.clip.present);
  const top = worldAt(ctx, { ...F.overhead, y: F.overhead.y + 0.2 });
  ctx.emit('playSound', { clip: c.fish ? F.sfx.fanfare : F.sfx.boot, position: top, volume: 0.8, maxDistance: 40 });
  ctx.emit('fx', { position: top, script: GLINT });
  if (c.fish) { ctx.emit('screenFlash', { color: c.color, duration: 0.3, intensity: c.rare ? 0.35 : 0.15 }, { audience: { player: by } }); ctx.emit('haptic', { kind: 'success' }, { audience: { player: by } }); }
  if (rider) { if (c.fish) rider.state.fish = (rider.state.fish ?? 0) + 1; rider.state.fishGet = { name: c.name, color: c.color, fish: !!c.fish, rare: !!c.rare, n: rider.state.fish ?? 0, at: ctx.now() }; }
  if (c.fish) ctx.emit('stat', { name: 'fish caught' }, { audience: { player: by } });
  s.fishing = { phase: 'present', at: ctx.now() + F.present * 1000 };
}
function stepFishing(ctx, t) {
  const s = ctx.self.state, f = s.fishing, now = ctx.now(); if (!f) return;
  if (f.phase === 'cast' && now >= f.at) {
    const bob = { x: F.castAt.x + (ctx.random() - 0.5) * 1.2, y: 0.03, z: F.castAt.z + (ctx.random() - 0.5) * 1.0 };
    ctx.spawn('bobber', { parent: ctx.self.id, feetPosition: bob, primitive: { kind: 'scripted', script: KIT, params: { item: 'bobber' } }, physics: 'none', castShadow: false, scale: 1.6 });
    lineTo(ctx, bob);
    ctx.emit('fx', { position: worldAt(ctx, { ...bob, y: 0 }), script: SPLASH });
    ctx.emit('playSound', { clip: F.sfx.plop, position: worldAt(ctx, bob), volume: 0.45, maxDistance: 20 });
    const [a, b] = F.wait; s.fishing = { phase: 'wait', bob, at: now + (a + (b - a) * ctx.random()) * 1000 };
    return;
  }
  const o = kid(ctx, 'bobber');
  if (f.phase === 'wait') { if (o) o.feetPosition = { ...f.bob, y: f.bob.y + Math.sin(t * 3.1) * 0.012 };
    if (now >= f.at) { s.fishing = { ...f, phase: 'bite', at: now + F.window * 1000 };
      if (o) o.feetPosition = { ...f.bob, y: f.bob.y - 0.09 };
      const w = worldAt(ctx, f.bob);
      ctx.emit('fx', { position: { ...w, y: 0 }, script: SPLASH }); ctx.emit('playSound', { clip: F.sfx.bite, position: w, volume: 0.7, maxDistance: 20 });
      ctx.emit('damageNumber', { position: { x: w.x, y: w.y + 0.7, z: w.z }, text: '!', color: '#ffd24a', size: 2.2, lifetime: 1.2 }, { audience: { player: s.rider } });
      ctx.emit('haptic', { kind: 'heavy' }, { audience: { player: s.rider } }); }
    return; }
  if (f.phase === 'bite') { if (o) o.feetPosition = { ...f.bob, y: f.bob.y - 0.06 + Math.sin(t * 22) * 0.04 };
    if (now >= f.at) { toast(ctx, 'it got away!', '#f2e6cf', s.rider); ctx.emit('playSound', { clip: F.sfx.miss, position: ctx.self.feetPosition, volume: 0.5, maxDistance: 16 }); endFishing(ctx); }
    return; }
  if (f.phase === 'present') { const c = kid(ctx, 'catch'); if (c) c.feetPosition = { ...F.overhead, y: F.overhead.y + Math.sin(t * 2.4) * 0.03 };
    if (now >= f.at) endFishing(ctx); }
}
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state;
    if (s.rider && riderHere(ctx, s.rider)) { if (s.rider === by) tryLeave(ctx, by); return; }
    if (!ctx.getObject(by)) return;
    const m = mind(ctx); m.lastE = ctx.now();
    s.rider = by; s.dropAt = null; ctx.self.controller = by;
    ctx.self.audio = { clip: B.lapLoop, loop: true, gain: 0.18, spatial: true, maxDistance: 18 };
    const p = ctx.self.feetPosition;
    ctx.emit('playSound', { clip: B.bump, position: p, volume: 0.6, maxDistance: 20 });
  },
};
export function onSpawn(ctx) {
  const s = ctx.self.state;
  s.kind = 'boat'; s.seat = B.seat; s.seatYaw = 180; s.thirdPerson = true;
  if (!s.rider) ctx.self.controller = null;
  if (!ctx.getObject(ctx.self.id + '/wake')) ctx.spawn('wake', { parent: ctx.self.id, feetPosition: { x: 0, y: 0.02, z: -1.4 }, physics: 'none', fx: null });
}
export function onControlEnd(ctx, player) { const s = ctx.self.state; if (s.rider === player.id) { if (s.fishing) endFishing(ctx); s.rider = null; ctx.self.audio = null; } }
export function onInput(ctx, input) {
  const a = input.axes || {}, m = mind(ctx);
  const fishing = !!ctx.self.state.fishing;
  m.in = fishing ? { x: 0, z: 0 } : { x: a.moveX || 0, z: a.moveZ || 0 };
  if (input.pressed?.fish && ctx.self.state.rider) press2(ctx);
  if (input.pressed?.interact && ctx.self.state.rider) tryLeave(ctx, ctx.self.state.rider);
}
export function update(ctx, dt) {
  const self = ctx.self, s = self.state, m = mind(ctx), p = self.feetPosition;
  if (!p) return;
  if (s.rider && !riderHere(ctx, s.rider)) { if (s.fishing) endFishing(ctx); s.rider = null; self.controller = null; self.audio = null; }
  m.t += dt;
  if (s.fishing && s.rider) stepFishing(ctx, m.t);
  const rowing = !!s.rider;
  if (!rowing && Math.abs(m.speed) < 0.05) { const r = self.rotation; m.yaw = typeof r === 'number' ? r : typeof r?.w === 'number' ? Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) / D2R : (r?.yaw ?? m.yaw); }
  const inp = rowing ? m.in : { x: 0, z: 0 };
  const target = inp.z > 0.1 ? B.speed : inp.z < -0.1 ? -B.reverse : 0;
  m.speed += clamp(target - m.speed, -(target === 0 ? B.drag : B.accel) * dt, (target === 0 ? B.drag : B.accel) * dt);
  const turnWant = -inp.x * B.turnRate * (0.35 + 0.65 * Math.min(1, Math.abs(m.speed) / B.speed + 0.3));
  m.turn += (turnWant - m.turn) * (1 - Math.exp(-4 * dt));
  m.yaw = wrap(m.yaw + m.turn * dt);
  const fx = Math.sin(m.yaw * D2R), fz = Math.cos(m.yaw * D2R); // bow = local +z
  let nx = p.x + fx * m.speed * dt, nz = p.z + fz * m.speed * dt;
  if (!water(ctx, nx, nz)) {
    if (Math.abs(m.speed) > 1.5) ctx.emit('playSound', { clip: B.bump, position: p, volume: 0.35, maxDistance: 14 });
    nx = p.x; nz = p.z; m.speed = -m.speed * 0.2;
  }
  const bob = Math.sin(m.t * 1.7) * 0.035 + Math.sin(m.t * 2.9 + 1) * 0.015;
  const roll = clamp(-m.turn * 0.08, -7, 7) + Math.sin(m.t * 1.3) * 1.2, pitch = Math.sin(m.t * 1.1 + 0.5) * 1 - m.speed * 0.4;
  self.feetPosition = { x: nx, y: B.waterY + bob, z: nz };
  self.rotation = { yaw: m.yaw, pitch, roll };
  const moving = Math.abs(m.speed) > 0.6, w = ctx.getObject(self.id + '/wake');
  if (w && !!w.fx !== moving) w.fx = moving ? { script: WAKE, params: { rate: 14 } } : null;
  if (!rowing && Math.abs(m.speed) < 0.02 && Math.abs(m.turn) < 0.5) { m.speed = 0; ctx.sleep(0.25); }
}
