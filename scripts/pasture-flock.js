// The one manager of the west pasture flock (rows tagged "pasture-flock", no update of their own), worn by the fence row
// west-pasture: each animal grazes head-down, stands and looks about, or ambles to a new patch; every goal and every step
// stays inside the fence polygon (the row's own primitive.params.points, inset) and clear of its items. A soft baa now and then.
import { play } from 'builtin/anim';
import { animate } from 'builtin/tween';
import FLOCK from './lib/data/pasture-flock.yml';
const rnd = (ctx, [a, b]) => a + ctx.random() * (b - a);
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
function inPoly(pts, x, z) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, zi] = pts[i], [xj, zj] = pts[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; }
function edgeDist(pts, x, z) { let d = 1e9; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], ex = b[0] - a[0], ez = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * ex + (z - a[1]) * ez) / (ex * ex + ez * ez))); d = Math.min(d, Math.hypot(x - a[0] - ex * t, z - a[1] - ez * t)); } return d; }
function site(ctx) {
  const o = ctx.self.worldFeetPosition || ctx.self.feetPosition, p = ctx.self.primitive?.params || {};
  const pts = (p.points || []).map(([x, z]) => [o.x + x, o.z + z]);
  const keep = (p.items || []).map((it) => ({ x: o.x + it.x, z: o.z + it.z, r: it.k === 'barn' ? 3.1 : it.k === 'rick' ? 1.9 : 1.35 }));
  return { pts, keep };
}
function ok(S, x, z) {
  if (!inPoly(S.pts, x, z) || edgeDist(S.pts, x, z) < FLOCK.inset) return false;
  for (const k of S.keep) if (Math.hypot(x - k.x, z - k.z) < k.r) return false;
  return true;
}
function setClip(ctx, row, sp, name) {
  if (row.state.clip === name) return;
  play(ctx, row, { name: `flock-${sp}-${name}`, ...FLOCK.clips[sp][name] }, { channel: 'body', loop: true, speed: 0.9 + ctx.random() * 0.2, blendIn: 0.6 });
  row.state.clip = name;
}
export function update(ctx) {
  const now = ctx.now(), S = site(ctx);
  if (S.pts.length < 3) { ctx.sleep(10); return; }
  const rows = ctx.query({ tags: ['pasture-flock'], center: ctx.self.worldFeetPosition || ctx.self.feetPosition, radius: 40 });
  let next = now + 10000;
  for (const row of rows) {
    const s = row.state, sp = s.species || 'sheep', T = FLOCK.species[sp];
    if (!T) continue;
    if (s.until && now < s.until) { next = Math.min(next, s.until); continue; }
    const p = row.feetPosition, walk = s.mode !== 'walk' && ctx.random() < T.walkChance;
    let goal = null;
    if (walk) for (let i = 0; i < 10 && !goal; i++) {
      const a = ctx.random() * Math.PI * 2, d = rnd(ctx, FLOCK.step), x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
      let clear = ok(S, x, z);
      for (let k = 1; k < 4 && clear; k++) clear = ok(S, p.x + (x - p.x) * k / 4, p.z + (z - p.z) * k / 4);
      for (const o of rows) if (clear && o.id !== row.id) { const g = o.state.goal || o.feetPosition; if (Math.hypot(g.x - x, g.z - z) < FLOCK.spacing) clear = false; }
      if (clear) goal = { x, z };
    }
    if (goal) {
      const dist = Math.hypot(goal.x - p.x, goal.z - p.z), dur = dist / T.speed, cur = s.yaw ?? 0;
      const want = cur + wrapDeg(Math.atan2(-(goal.x - p.x), -(goal.z - p.z)) * 180 / Math.PI - cur);
      const gy = ctx.place.terrain.heightAt(goal.x, goal.z) ?? p.y;
      animate(ctx, row, { 'rotation.yaw': [cur, want] }, { duration: 0.7, easing: 'easeInOutSine' });
      animate(ctx, row, { 'feetPosition.x': goal.x, 'feetPosition.z': goal.z, 'feetPosition.y': gy }, { duration: dur, delay: 0.35, easing: 'easeInOutSine' });
      s.yaw = Math.round(wrapDeg(want)); s.goal = { x: +goal.x.toFixed(2), z: +goal.z.toFixed(2) }; s.mode = 'walk'; s.until = now + (dur + 0.4) * 1000;
      setClip(ctx, row, sp, 'walk');
    } else {
      const graze = ctx.random() < 0.68;
      s.mode = graze ? 'graze' : 'stand'; s.goal = null; s.until = now + rnd(ctx, graze ? T.graze : T.stand) * 1000;
      setClip(ctx, row, sp, s.mode);
      const c = T.call;
      if (c && ctx.random() < c.chance) ctx.emit('playSound', { clip: c.clip, position: { x: p.x, y: p.y + 0.8, z: p.z }, volume: c.volume, pitch: rnd(ctx, c.pitch), maxDistance: c.maxDistance });
    }
    next = Math.min(next, s.until);
  }
  ctx.sleep(Math.max(0.4, (next - now) / 1000));
}
