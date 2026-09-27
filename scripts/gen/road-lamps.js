// Tall highway lanterns: 4.5 m dark iron posts with a hooked scroll arm and a hanging lantern of amber glass.
// params.lamps = [[x, y, z, dx, dz], …]: post feet (local, y = ground) and the unit direction the arm reaches (toward the road).
// The glass glows by emissive only: no lights.
import { solid, T, gem } from "../lib/road-solid.js";
const H = 4.5;
function frame(p) { const [x, y, z, dx, dz] = p, sx = -dz, sz = dx; // a: along arm, s: sideways, y up
  return (a, h, s) => [x + dx * a + sx * s, y + h, z + dz * a + sz * s]; }
const ng = (n, r, rot) => Array.from({ length: n }, (_, i) => { const t = rot + (i / n) * Math.PI * 2; return [Math.cos(t) * r, Math.sin(t) * r]; });
function col(ctx, F, a, s, y0, y1, r0, r1, n) { // upright n-gon column
  const g = ng(n, 1, Math.PI / n);
  solid(ctx, g.map(([u, v]) => F(a + u * r0, y0, s + v * r0)), g.map(([u, v]) => F(a + u * r1, y1, s + v * r1)), true);
}
function bar(ctx, F, a0, h0, a1, h1, r) { // a square bar in the arm plane
  const dx = a1 - a0, dy = h1 - h0, l = Math.hypot(dx, dy) || 1, nx = -dy / l * r, ny = dx / l * r;
  const q = (a, h) => [F(a + nx, h + ny, -r), F(a + nx, h + ny, r), F(a - nx, h - ny, r), F(a - nx, h - ny, -r)];
  solid(ctx, q(a0, h0), q(a1, h1), true);
}
function iron(ctx) { ctx.emissive(null); ctx.albedo(null); ctx.color("oklch(0.24 0.012 250)"); ctx.metalness(0.55); ctx.roughness(0.55); }
function lamp(ctx, p, lod) {
  const F = frame(p), A = 1.05;
  iron(ctx);
  const n = lod <= 2 ? 8 : 4;
  if (lod <= 3) { col(ctx, F, 0, 0, -0.2, 0.3, 0.2, 0.16, n); col(ctx, F, 0, 0, 0.3, 0.42, 0.13, 0.1, n); }
  col(ctx, F, 0, 0, lod <= 3 ? 0.42 : -0.2, H, lod <= 4 ? 0.075 : 0.06, 0.055, n);
  if (lod <= 2) { gem(ctx, ...F(0, H, 0), 0.07, 0.22, 0.02, 6); col(ctx, F, 0, 0, 4.12, 4.2, 0.075, 0.075, 8); }
  if (lod <= 4) bar(ctx, F, 0, 4.2, A + 0.08, 4.2, 0.028);
  if (lod <= 2) { // scroll brace and the hook curl at the arm's tip
    const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([0.05 + t * 0.75, 3.7 + Math.sin(t * Math.PI * 0.5) * 0.47]); }
    for (let i = 0; i < pts.length - 1; i++) bar(ctx, F, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.018);
    const c = []; for (let i = 0; i <= 5; i++) { const t = (i / 5) * Math.PI * 1.3; c.push([A + 0.08 + Math.sin(t) * 0.09, 4.29 - Math.cos(t) * 0.09]); }
    for (let i = 0; i < c.length - 1; i++) bar(ctx, F, c[i][0], c[i][1], c[i + 1][0], c[i + 1][1], 0.016);
  }
  // hanger + lantern
  const y0 = 3.5, y1 = 3.86;
  if (lod <= 3) {
    bar(ctx, F, A, 4.18, A, 4.0, 0.012);
    const r = 0.17, cap = ng(4, r, Math.PI / 4), top = F(A, 4.08, 0), o = F(A, 3.95, 0);
    const cr = cap.map(([u, v]) => F(A + u, 3.92, v)), crb = cap.map(([u, v]) => F(A + u * 0.8, 3.86, v * 0.8));
    solid(ctx, crb, cr, false); for (let i = 0; i < 4; i++) T(ctx, cr[i], cr[(i + 1) % 4], top, o);
    col(ctx, F, A, 0, y0 - 0.06, y0, 0.12, 0.13, 4);
    if (lod <= 2) for (const [u, v] of ng(4, 0.125, Math.PI / 4)) col(ctx, F, A + u, v, y0, y1, 0.014, 0.014, 4);
  }
  ctx.metalness(0); ctx.roughness(0.2); ctx.color("#ffb35a"); ctx.emissive(2.6, 1.35, 0.42);
  col(ctx, F, A, 0, y0, y1, 0.115, lod <= 3 ? 0.13 : 0.12, 4);
  ctx.emissive(null);
}
export function geometry(ctx) {
  ctx.flat();
  for (const p of ctx.params.lamps || []) lamp(ctx, p, ctx.lod);
}
export function collider(ctx) {
  for (const p of ctx.params.lamps || []) { const F = frame(p); col(ctx, F, 0, 0, -0.2, 2.4, 0.16, 0.08, 4); }
}
