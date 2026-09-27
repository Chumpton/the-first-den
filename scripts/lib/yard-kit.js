// shared helpers for the homestead grounds (flags, beds, arches, fences, furnishings)
import { Q, T, solid, prism, box, ngon, gem } from './road-solid.js';
export { Q, T, solid, prism, box, ngon, gem };
export const TAU = Math.PI * 2;
export const TEX = {
  stone: 'cdn/texture-pale-limestone-flagstone.png',
  moss: 'cdn/texture-soft-green-moss-carpet.png',
  walnut: 'cdn/texture-hand-joined-walnut-wood.png',
  oak: 'cdn/texture-honey-oak-timber-planks.png',
  soil: 'cdn/texture-dark-garden-soil-with-mulch.png',
  leaf: 'cdn/texture-lush-green-ivy-leaves.png',
  brass: 'cdn/texture-aged-brass-metal.png',
};
export function paint(ctx, tex, col, rough = 0.85, metal = 0) {
  ctx.albedo(tex ? TEX[tex] : null); ctx.color(col); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null);
}
export const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
export const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export function beam(ctx, a, b, w, h = w) {
  const d = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0];
  const s = nrm(crs(d, up)), u = crs(s, d);
  const L = (p) => [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([i, j]) => [p[0] + s[0] * i * w / 2 + u[0] * j * h / 2, p[1] + s[1] * i * w / 2 + u[1] * j * h / 2, p[2] + s[2] * i * w / 2 + u[2] * j * h / 2]);
  solid(ctx, L(a), L(b));
}
// box standing on y0, centred at cx,cz, sx along local x, turned yaw radians (three.js sense)
export function obox(ctx, cx, y0, cz, sx, sy, sz, yaw = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => { const x = i * sx / 2, z = j * sz / 2; return [cx + x * c + z * s, cz - x * s + z * c]; });
  solid(ctx, P.map(([x, z]) => [x, y0, z]), P.map(([x, z]) => [x, y0 + sy, z]));
}
export function lathe(ctx, prof, n, cx = 0, cz = 0) {
  const ring = (r, y) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; a.push([cx + Math.cos(t) * r, y, cz + Math.sin(t) * r]); } return a; };
  for (let k = 0; k < prof.length - 1; k++) {
    const [r0, y0] = prof[k], [r1, y1] = prof[k + 1], A = ring(r0, y0), B = ring(r1, y1), o = [cx, (y0 + y1) / 2 - 0.001, cz];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (r0 < 1e-4) T(ctx, A[i], B[j], B[i], o); else if (r1 < 1e-4) T(ctx, A[i], A[j], B[i], o); else Q(ctx, A[i], A[j], B[j], B[i], o); }
  }
  const top = prof[prof.length - 1];
  if (top[0] > 1e-4) { const A = ring(top[0], top[1]), c = [cx, top[1], cz]; for (let i = 0; i < n; i++) T(ctx, A[i], A[(i + 1) % n], c, [cx, top[1] - 1, cz]); }
}
// low-poly dome (foliage mound, leaf clump)
export function blob(ctx, cx, cy, cz, rx, ry, rz, n = 6, rnd = null) {
  const rings = n <= 4 ? [[1, 0], [0.6, 0.8]] : [[1, 0], [0.82, 0.55], [0.45, 0.9]];
  const P = rings.map(([r, h]) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU, j = rnd ? 0.85 + rnd() * 0.3 : 1; a.push([cx + Math.cos(t) * rx * r * j, cy + ry * h, cz + Math.sin(t) * rz * r * j]); } return a; });
  const top = [cx, cy + ry, cz], o = [cx, cy + ry * 0.3, cz];
  for (let k = 0; k < P.length - 1; k++) for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, P[k][i], P[k][j], P[k + 1][j], P[k + 1][i], o); }
  const last = P[P.length - 1]; for (let i = 0; i < n; i++) T(ctx, last[i], last[(i + 1) % n], top, o);
}
export function leaf(ctx, p, d, side, L, W) {
  const m = [p[0] + d[0] * L * 0.5, p[1] + d[1] * L * 0.5, p[2] + d[2] * L * 0.5];
  ctx.quad(...p, m[0] + side[0] * W, m[1] + side[1] * W, m[2] + side[2] * W, p[0] + d[0] * L, p[1] + d[1] * L, p[2] + d[2] * L, m[0] - side[0] * W, m[1] - side[1] * W, m[2] - side[2] * W);
}
// yaw (radians) that turns local +x along (dx, dz)
export const yawAlong = (dx, dz) => Math.atan2(-dz, dx);
