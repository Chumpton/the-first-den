// Garden kit: shared solids + paint for the garden family (flagstones, gazebo, tunnel, shed).
// Built on road-solid.js: every face wound away from an interior point.
import { Q, T, solid, prism, box, ngon, gem } from './road-solid.js';
export { Q, T, solid, prism, box, ngon, gem };
export const TAU = Math.PI * 2;
export const TEX = {
  stone: 'cdn/texture-pale-limestone-flagstone.png',
  oak: 'cdn/texture-honey-oak-timber-planks.png',
  copper: 'cdn/texture-verdigris-copper-patina.png',
  sage: 'cdn/texture-sage-painted-weathered-boards.png',
  shingle: 'cdn/texture-cedar-roof-shingles.png',
};
export function paint(ctx, tex, col, rough = 0.85, metal = 0, alpha) {
  ctx.albedo(tex ? TEX[tex] : null);
  if (alpha != null) ctx.color(col, alpha); else ctx.color(col);
  ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null);
}
const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// a square-section member from a to b; w = horizontal width (z for vertical members), h = the other side
export function beam(ctx, a, b, w, h = w) {
  const d = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
  const s = nrm(crs(d, up)), u = crs(s, d);
  const L = (p) => [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => [
    p[0] + s[0] * i * w / 2 + u[0] * j * h / 2, p[1] + s[1] * i * w / 2 + u[1] * j * h / 2, p[2] + s[2] * i * w / 2 + u[2] * j * h / 2]);
  solid(ctx, L(a), L(b));
}
// profile [[r, y], …] turned n times about the vertical axis through c
export function lathe(ctx, prof, n, c = [0, 0, 0], rot = 0) {
  const P = (r, y, a) => [c[0] + Math.cos(a) * r, c[1] + y, c[2] + Math.sin(a) * r];
  for (let k = 0; k < prof.length - 1; k++) {
    const [r0, y0] = prof[k], [r1, y1] = prof[k + 1];
    const o = [c[0], c[1] + (y0 + y1) / 2 - 0.002, c[2]];
    for (let i = 0; i < n; i++) {
      const a0 = rot + i / n * TAU, a1 = rot + (i + 1) / n * TAU;
      if (r0 < 1e-4) T(ctx, [c[0], c[1] + y0, c[2]], P(r1, y1, a0), P(r1, y1, a1), o);
      else if (r1 < 1e-4) T(ctx, P(r0, y0, a0), P(r0, y0, a1), [c[0], c[1] + y1, c[2]], o);
      else Q(ctx, P(r0, y0, a0), P(r0, y0, a1), P(r1, y1, a1), P(r1, y1, a0), o);
    }
  }
}
// a hanging hexagonal iron lantern, bottom at c; glass glows warm
export function lantern(ctx, c, lod = 1, s = 1) {
  const n = lod <= 2 ? 6 : 4, at = (y) => [c[0], c[1] + y * s, c[2]];
  paint(ctx, null, 'oklch(0.3 0.01 250)', 0.6, 0.6);
  lathe(ctx, [[0, 0], [0.12 * s, 0], [0.12 * s, 0.03 * s], [0, 0.03 * s]], n, c);
  lathe(ctx, [[0.15 * s, 0.26 * s], [0.03 * s, 0.38 * s], [0.03 * s, 0.42 * s], [0, 0.42 * s]], n, c);
  lathe(ctx, [[0, 0.24 * s], [0.15 * s, 0.24 * s], [0.15 * s, 0.26 * s]], n, c);
  if (lod <= 2) for (let i = 0; i < n; i++) { const a = i / n * TAU; beam(ctx, [c[0] + Math.cos(a) * 0.1 * s, c[1] + 0.03 * s, c[2] + Math.sin(a) * 0.1 * s], [c[0] + Math.cos(a) * 0.11 * s, c[1] + 0.24 * s, c[2] + Math.sin(a) * 0.11 * s], 0.015 * s); }
  ctx.albedo(null); ctx.color('oklch(0.97 0.05 85)'); ctx.emissive(2.6, 1.6, 0.6);
  lathe(ctx, [[0, 0.03 * s], [0.095 * s, 0.03 * s], [0.105 * s, 0.24 * s], [0, 0.24 * s]], n, c);
  ctx.emissive(null);
}
