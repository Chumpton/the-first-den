// The dock rowboat: E climbs in (the den's mount rider seats you on the stern thwart, facing the bow), W/S row, A/D turn.
// It keeps to open water (the lake bowl and the creek mouth), bobs and rolls with the turn, and leaves a small wake.
// E again near the shore or the dock steps you out onto dry ground; far from shore it tells you to row closer.
// Kinematic: moved by feetPosition/rotation on the rider's machine while rowed. Bow is local +z.
import { BOAT as B } from './lib/data/rowboat.js';
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
  s.dropAt = drop; s.rider = null; ctx.self.controller = null;
  m.speed = 0; ctx.self.audio = null;
  const w = ctx.getObject(ctx.self.id + '/wake'); if (w) w.fx = null;
  ctx.emit('playSound', { clip: B.bump, position: p, volume: 0.5, maxDistance: 20 });
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
export function onControlEnd(ctx, player) { const s = ctx.self.state; if (s.rider === player.id) { s.rider = null; ctx.self.audio = null; } }
export function onInput(ctx, input) {
  const a = input.axes || {}, m = mind(ctx);
  m.in = { x: a.moveX || 0, z: a.moveZ || 0 };
  if (input.pressed?.interact && ctx.self.state.rider) tryLeave(ctx, ctx.self.state.rider);
}
export function update(ctx, dt) {
  const self = ctx.self, s = self.state, m = mind(ctx), p = self.feetPosition;
  if (!p) return;
  if (s.rider && !riderHere(ctx, s.rider)) { s.rider = null; self.controller = null; self.audio = null; }
  m.t += dt;
  const rowing = !!s.rider;
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
