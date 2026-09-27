// The Catio's screen door: swings outward as a body walks up, or on E (held open a few seconds); eases shut behind you.
// One row, physics kinematic, origin at its hinge; state { baseYaw, center } written at spawn.
import CFG from './lib/data/catio.yml';
const ANGLE = new Map();
export const ears = {
  press: (ctx) => { const s = ctx.self.state; s.latchUntil = ctx.now() < (s.latchUntil || 0) ? 0 : ctx.now() + CFG.door.latchSeconds * 1000; },
};
export function onSpawn(ctx) { if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable']; }
export function update(ctx, dt) {
  const s = ctx.self.state, D = CFG.door, c = s.center;
  if (!c) return;
  let near = false;
  for (const p of ctx.place.players) { const q = p.worldFeetPosition || p.feetPosition; if (q && Math.hypot(q.x - c.x, q.z - c.z) < D.near && Math.abs(q.y - c.y) < 2.5) { near = true; break; } }
  const open = near || ctx.now() < (s.latchUntil || 0);
  if (open !== !!s.open) {
    s.open = open;
    ctx.emit('playSound', { clip: open ? D.openSound : D.closeSound, position: c, volume: 0.45, maxDistance: 16 });
  }
  const target = open ? D.swing : 0, a = ANGLE.get(ctx.self.id) ?? (s.open ? D.swing : 0);
  if (a !== target) {
    const na = a + Math.sign(target - a) * Math.min(Math.abs(target - a), D.speed * dt);
    ANGLE.set(ctx.self.id, na);
    ctx.self.rotation = { yaw: s.baseYaw + na };
  } else ANGLE.set(ctx.self.id, a);
}
