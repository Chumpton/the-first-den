// Split-rail timber fence for the highways: weathered oak posts every ~3 m, two wedge-split rails between them.
// params.runs = [[[x,y,z], …], …]: each run is a list of post feet (local, y = ground) joined in order; a gap is a new run.
import { solid, T } from "../lib/road-solid.js";
const OAK = "cdn/texture-weathered-grey-oak-split-timber.png";
const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
function beam(ctx, a, b, r, n, rot = 0, ext = 0) {
  let d = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const A = [a[0] - d[0] * ext, a[1] - d[1] * ext, a[2] - d[2] * ext], B = [b[0] + d[0] * ext, b[1] + d[1] * ext, b[2] + d[2] * ext];
  const u = nrm([-d[2], 0, d[0]]), v = [u[1] * d[2] - u[2] * d[1], u[2] * d[0] - u[0] * d[2], u[0] * d[1] - u[1] * d[0]];
  const ring = (p) => Array.from({ length: n }, (_, i) => { const t = rot + (i / n) * Math.PI * 2, c = Math.cos(t) * r, s = Math.sin(t) * r; return [p[0] + u[0] * c + v[0] * s, p[1] + u[1] * c + v[1] * s, p[2] + u[2] * c + v[2] * s]; });
  solid(ctx, ring(A), ring(B), true);
}
function post(ctx, p, h, w, cap) {
  const [x, y, z] = p, q = [[x - w, z - w], [x + w, z - w], [x + w, z + w], [x - w, z + w]];
  solid(ctx, q.map(([a, c]) => [a, y - 0.3, c]), q.map(([a, c]) => [a, y + h, c]), !cap);
  if (cap) { const top = [x, y + h + 0.07, z], o = [x, y + h - 0.1, z], r = q.map(([a, c]) => [a, y + h, c]);
    for (let i = 0; i < 4; i++) T(ctx, r[i], r[(i + 1) % 4], top, o); }
}
export function geometry(ctx) {
  const { runs = [] } = ctx.params, lod = ctx.lod;
  ctx.flat();
  if (lod <= 2) { ctx.albedo(OAK); ctx.color("oklch(0.93 0.03 65)"); } else { ctx.albedo(null); ctx.color("oklch(0.55 0.05 60)"); }
  ctx.roughness(0.95);
  for (const run of runs) {
    for (let i = 0; i < run.length; i++) {
      const p = run[i];
      if (lod <= 4 || i % 2 === 0) post(ctx, p, lod >= 4 ? 1.15 : 1.2, lod >= 4 ? 0.06 : 0.07, lod <= 2);
      if (i === run.length - 1) continue;
      const q = run[i + 1];
      for (const [hy, k] of lod >= 4 ? [[0.95, 0]] : [[0.45, 1], [0.95, 0]]) {
        const a = [p[0], p[1] + hy + k * 0.02, p[2]], b = [q[0], q[1] + hy - k * 0.02, q[2]];
        if (lod <= 2) beam(ctx, a, b, 0.075, 3, 0.4 + (i + k) * 1.3, 0.12);
        else beam(ctx, a, b, 0.06, 3, 0.5, 0.05);
      }
    }
  }
}
export function collider(ctx) {
  for (const run of ctx.params.runs || []) for (let i = 0; i < run.length - 1; i++) {
    const a = run[i], b = run[i + 1];
    ctx.quad(a[0], a[1] - 0.2, a[2], b[0], b[1] - 0.2, b[2], b[0], b[1] + 1.15, b[2], a[0], a[1] + 1.15, a[2]);
  }
}
