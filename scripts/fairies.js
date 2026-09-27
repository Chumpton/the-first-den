// ONE manager flies the fairies (rows tagged "fairy"): curving hops across the property, hovering at flower beds,
// sometimes drifting over to say hi to a nearby player with a chime. Tuning: scripts/lib/data/fairies.yml.
import F from './lib/data/fairies.yml';
export const updateSchedule = { every: 2 };
const TAU = Math.PI * 2, S = {};
const r = (ctx, [a, b]) => a + (b - a) * ctx.random();
function goal(ctx, s) {
  const pl = ctx.place.players.filter((p) => Math.hypot(p.feetPosition.x - s.p.x, p.feetPosition.z - s.p.z) < F.greetRange);
  if (pl.length && ctx.random() < F.visitPlayer) { const q = pl[Math.floor(ctx.random() * pl.length)].feetPosition, a = ctx.random() * TAU; s.greet = true; return { x: q.x + Math.cos(a) * 1.3, y: q.y + 1.7, z: q.z + Math.sin(a) * 1.3 }; }
  s.greet = false;
  const a = ctx.random() * TAU, d = 6 + ctx.random() * (F.roam - 6), x = F.home.x + Math.cos(a) * d, z = F.home.z + Math.sin(a) * d;
  return { x, y: (ctx.place.terrain.heightAt(x, z) ?? 0.5) + r(ctx, F.height), z };
}
export function update(ctx) {
  if (!ctx.place.players.some((p) => Math.hypot(p.feetPosition.x - F.home.x, p.feetPosition.z - F.home.z) < 120)) { ctx.sleep(4); return; }
  const now = ctx.now();
  for (const o of ctx.query({ tags: ['fairy'], center: { x: F.home.x, y: 1, z: F.home.z }, radius: 200 })) {
    const s = (S[o.id] ??= { p: { ...o.feetPosition }, from: { ...o.feetPosition }, to: { ...o.feetPosition }, t0: now, dur: 500, hover: 0, seed: ctx.random() * 50, side: ctx.random() < 0.5 ? -1 : 1 });
    let u = (now - s.t0) / s.dur;
    if (u >= 1) {
      if (!s.hovering) { s.hovering = true; s.from = { ...s.to }; s.t0 = now; s.dur = (s.greet ? 2.5 : 1 + ctx.random() * 3) * 1000; if (s.greet) ctx.emit('playSound', { clip: F.twinkle, position: s.to, volume: 0.35, maxDistance: 10, pitch: o.state.pitch ?? 1 }); }
      else { s.hovering = false; s.from = { ...s.p }; s.to = goal(ctx, s); s.side = -s.side; s.t0 = now; s.dur = Math.max(1, Math.hypot(s.to.x - s.from.x, s.to.z - s.from.z) / r(ctx, F.speed)) * 1000; }
      u = 0;
    }
    const t = now / 1000 + s.seed;
    let p;
    if (s.hovering) p = { x: s.from.x + Math.sin(t * 1.7) * 0.25, y: s.from.y + Math.sin(t * 2.6) * 0.15, z: s.from.z + Math.cos(t * 1.3) * 0.25 };
    else {
      const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, dx = s.to.x - s.from.x, dz = s.to.z - s.from.z, L = Math.hypot(dx, dz) || 1, arc = Math.sin(u * Math.PI) * Math.min(6, L * 0.3) * s.side;
      p = { x: s.from.x + dx * e + (-dz / L) * arc, y: s.from.y + (s.to.y - s.from.y) * e + Math.sin(u * Math.PI) * 1.2 + Math.sin(t * 5) * 0.08, z: s.from.z + dz * e + (dx / L) * arc };
      const vx = p.x - s.p.x, vz = p.z - s.p.z; if (Math.hypot(vx, vz) > 0.01) o.rotation = { yaw: Math.atan2(-vx, -vz) * 180 / Math.PI };
    }
    s.p = p; o.feetPosition = p;
    if (!s.clip) { s.clip = 1; o.anim.body = { clip: 'anim/fairy.yml#flutter', loop: 'loop', weight: 1 }; }
  }
}
