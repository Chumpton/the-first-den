// Wynx on her own: off the saddle she trails her rider, a little behind and to the right. Close she walks, farther she
// bounds, far she takes wing and flies to catch up; lost entirely (a travel jump) she flies in beside you in a burst of feathers.
import { GRY } from './lib/data/gryphon.js';
import { FEATHERS, setMode } from './lib/wynx-kit.js';
import { shortestArc } from 'builtin/math';
export const updateSchedule = { every: 2 };
export function update(ctx, dt) {
  const g = ctx.self, s = g.state;
  if (s.ridden || g.parent) { ctx.sleep(1); return; }
  const o = s.owner && ctx.getObject(s.owner);
  if (!o) { ctx.sleep(2); return; }
  const F = GRY.follow, op = o.feetPosition, gp = g.feetPosition;
  const oy = (o.rotation && typeof o.rotation === 'object' && 'w' in o.rotation)
    ? Math.atan2(2 * (o.rotation.x * o.rotation.z + o.rotation.w * o.rotation.y), 1 - 2 * (o.rotation.x ** 2 + o.rotation.y ** 2)) : ((o.rotation?.yaw ?? o.rotation ?? 0) * Math.PI / 180);
  // her spot: behind and to the right of the way you face
  const tx = op.x + Math.cos(oy) * F.right + Math.sin(oy) * F.back, tz = op.z - Math.sin(oy) * F.right + Math.cos(oy) * F.back;
  let dx = tx - gp.x, dz = tz - gp.z; const d = Math.hypot(dx, dz);
  if (d > F.blink) {
    const y = (ctx.place.terrain.heightAt(tx, tz) ?? op.y) + GRY.paws;
    g.feetPosition = { x: tx, y, z: tz };
    ctx.emit('fx', { position: { x: tx, y, z: tz }, script: FEATHERS });
    return;
  }
  const airborne = d > F.flyFrom || op.y - ((ctx.place.terrain.heightAt(op.x, op.z) ?? op.y)) > 2.5;
  const spd = d < 0.6 ? 0 : Math.min(d * 2.2, airborne ? F.run * 1.4 : d > 5 ? F.run : F.walk);
  const step = Math.min(d, spd * dt);
  const nx = d > 0 ? gp.x + (dx / d) * step : gp.x, nz = d > 0 ? gp.z + (dz / d) * step : gp.z;
  const ground = (ctx.place.terrain.heightAt(nx, nz) ?? gp.y - GRY.paws) + GRY.paws;
  const wantY = airborne ? Math.max(ground + F.lift, Math.min(op.y + 1, ground + 12)) : ground;
  const ny = gp.y + (wantY - gp.y) * Math.min(1, dt * (airborne ? 3 : 10));
  g.feetPosition = { x: nx, y: Math.max(ground, ny), z: nz };
  // face the way she moves; standing, she turns to look at you
  const fx = spd > 0 ? dx : op.x - gp.x, fz = spd > 0 ? dz : op.z - gp.z;
  if (Math.hypot(fx, fz) > 0.3) {
    const want = Math.atan2(-fx, -fz) * 180 / Math.PI, cur = s.yaw ?? want;
    const turn = shortestArc(cur, want), mx = 240 * dt;
    s.yaw = cur + Math.max(-mx, Math.min(mx, turn));
    g.rotation = { yaw: s.yaw };
  }
  const high = ny - ground > 0.8;
  setMode(ctx, g, high ? (spd > 3 ? 'fly' : 'hover') : spd > 6 ? 'run' : spd > 0.3 ? 'walk' : 'landed');
  if (spd === 0 && !high) ctx.sleep(0.3);
}
