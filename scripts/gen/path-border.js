// Path softening, one row per path: low flower drifts (tapered, broken into drifts with gaps) and short runs of
// low limestone curb along a polyline. Params, local metres to the row's feet:
//   path: [[x, y, z], …] the path's centreline (ground y per point), half: path half-width,
//   drifts: [[s0, s1, side(+1 left / -1 right of travel), palette, depth]], curbs: [[s0, s1, side]]  (s = metres along the path)
import { TAU, paint, obox, blob, gem } from '../lib/yard-kit.js';
import { softened } from "./soften.js";
const rnd = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const PAL = {
  cottage: ['oklch(0.72 0.14 330)', 'oklch(0.96 0.02 95)', 'oklch(0.66 0.13 295)', 'oklch(0.84 0.12 80)'],
  warm: ['oklch(0.8 0.15 70)', 'oklch(0.7 0.17 40)', 'oklch(0.93 0.1 100)', 'oklch(0.96 0.02 95)'],
  cool: ['oklch(0.65 0.13 285)', 'oklch(0.7 0.1 250)', 'oklch(0.96 0.02 95)', 'oklch(0.78 0.1 330)'],
};
const LEAF = ['oklch(0.55 0.1 135)', 'oklch(0.6 0.09 125)', 'oklch(0.5 0.08 145)'];
// point on the polyline at distance s: position, unit tangent, left normal
function at(path, s) {
  let acc = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz);
    if (s <= acc + L || i === path.length - 2) { const t = Math.max(0, Math.min(1, (s - acc) / L)); return { p: [a[0] + dx * t, a[1] + (b[1] - a[1]) * t, a[2] + dz * t], d: [dx / L, dz / L], n: [dz / L, -dx / L] }; }
    acc += L;
  }
}
export const geometry = softened(function geometry(ctx) {
  const pr = ctx.params || {}, lod = ctx.lod || 1, path = pr.path || [], half = pr.half ?? 0.8;
  if (path.length < 2) return;
  (pr.drifts || []).forEach(([s0, s1, side, pal = 'cottage', depth = 0.7], di) => {
    const R = rnd(di * 31 + 7), cols = PAL[pal] || PAL.cottage, step = lod <= 2 ? 0.32 : 0.7;
    for (let s = s0; s <= s1; s += step * (0.8 + R() * 0.4)) {
      const k = (s - s0) / Math.max(0.01, s1 - s0), taper = Math.sin(Math.PI * Math.min(1, Math.max(0, k))) * 0.75 + 0.25;
      const f = at(path, s), off = half + 0.3 + R() * depth * taper, n = [f.n[0] * side, f.n[1] * side];
      const x = f.p[0] + n[0] * off, z = f.p[2] + n[1] * off, y = f.p[1];
      const r = (0.18 + R() * 0.14) * (0.6 + taper * 0.4), h = (0.16 + R() * 0.16) * (0.5 + taper * 0.5);
      paint(ctx, null, LEAF[Math.floor(R() * 3)], 0.95); blob(ctx, x, y - 0.03, z, r, h, r, lod <= 2 ? 6 : 4, R);
      if (lod > 3) continue;
      const col = cols[Math.floor(R() * cols.length)], nf = lod <= 2 ? 4 : 2;
      paint(ctx, null, col, 0.8);
      for (let q = 0; q < nf; q++) { const a = R() * TAU, rr = R() * r * 0.8; gem(ctx, x + Math.cos(a) * rr, y + h * (0.75 + R() * 0.5), z + Math.sin(a) * rr, 0.045 + R() * 0.03, 0.03, 0.02, 5); }
    }
  });
  (pr.curbs || []).forEach(([s0, s1, side], ci) => {
    const R = rnd(ci * 13 + 101);
    for (let s = s0; s < s1;) {
      const len = 0.34 + R() * 0.18, m = s + len / 2, f = at(path, m), off = half + 0.1;
      const x = f.p[0] + f.n[0] * side * off, z = f.p[2] + f.n[1] * side * off, yaw = Math.atan2(-f.d[1], f.d[0]) + (R() - 0.5) * 0.08;
      paint(ctx, 'stone', ['oklch(0.95 0.02 85)', 'oklch(0.91 0.025 80)', 'oklch(0.97 0.015 90)'][Math.floor(R() * 3)], 0.9);
      obox(ctx, x, f.p[1] - 0.08, z, len - 0.03, 0.2 + R() * 0.05, 0.16 + R() * 0.04, yaw);
      s += len;
    }
  });
});
export function collider() { return null; }
