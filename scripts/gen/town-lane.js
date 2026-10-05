// The winding town lane from the highway to the market (row corridor-road-bp, feet at the lane's middle, y = 0.5).
// params.ruts    [[[x, y, z], …], …]  wagon-rut polylines, local, y = the ground there (sampled at placement)
// params.benches [[x, y, z, yaw°, bin], …] an oak bench facing the lane (−Z), a flower patch beside it, a barrel bin if bin
// params.item === 'marker': one carved limestone mile-post; its words ride the row's ui on the front (−Z) face.
import { paint, box, solid, XF, lathe, blob, FLOWERS, COL } from '../lib/town-kit.js';
import { bench } from './town-square.js';
import { softened } from "./soften.js";
const D2R = Math.PI / 180;
function up(ctx, a, b, c, d) { // a quad wound to face +y
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
  if (ny >= 0) ctx.quad(...a, ...b, ...c, ...d); else ctx.quad(...a, ...d, ...c, ...b);
}
function rut(ctx, pts, lod) {
  const step = lod <= 2 ? 1 : 3, S = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
  const row = S.map((p, i) => {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)];
    let tx = b[0] - a[0], tz = b[2] - a[2]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    const w = 0.21 + 0.05 * Math.sin(i * step * 1.37) + 0.03 * Math.sin(i * step * 3.1), nx = -tz * w, nz = tx * w;
    return [[p[0] + nx, p[1] + 0.05, p[2] + nz], [p[0], p[1] + 0.035, p[2]], [p[0] - nx, p[1] + 0.05, p[2] - nz]];
  });
  for (let i = 0; i < row.length - 1; i++) {
    const A = row[i], B = row[i + 1];
    up(ctx, A[0], A[1], B[1], B[0]); up(ctx, A[1], A[2], B[2], B[1]);
  }
}
function patch(ctx, P, lod, rnd) { // a low flower patch ringed by field stones, at local origin
  if (lod > 3) return;
  const n = lod <= 2 ? 6 : 3;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rnd() * 0.5, r = 0.25 + rnd() * 0.2;
    paint(ctx, null, i % 2 ? COL.leafA : COL.leafB, 0.9); blob(P, Math.cos(a) * r, 0.04, Math.sin(a) * r * 0.8, 0.24, 0.2, 0.22, 5, rnd);
  }
  if (lod > 2) return;
  paint(ctx, null, COL.leafA, 0.9); blob(P, 0, 0.08, 0, 0.26, 0.24, 0.24, 5, rnd);
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 0.5;
    paint(ctx, null, FLOWERS[i % FLOWERS.length], 0.6); blob(P, Math.cos(a) * r, 0.2 + rnd() * 0.14, Math.sin(a) * r * 0.8, 0.055, 0.045, 0.055, 4, rnd);
  }
  paint(ctx, 'lime', 'oklch(0.9 0.02 80)', 0.95);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; blob(P, Math.cos(a) * 0.72, 0.02, Math.sin(a) * 0.6, 0.11, 0.07, 0.09, 4, rnd); }
}
function bin(ctx, P, lod) { // a small oak barrel bin with iron hoops
  paint(ctx, 'oak', 'oklch(0.78 0.06 60)', 0.85);
  const n = lod <= 2 ? 10 : 6;
  lathe(P, [[0.22, -0.05], [0.26, 0.35], [0.23, 0.72], [0.19, 0.72], [0.19, 0.12], [0, 0.12]], n);
  if (lod > 2) return;
  paint(ctx, null, COL.iron, 0.5, 0.6);
  for (const [y, r] of [[0.1, 0.24], [0.6, 0.245]]) lathe(P, [[r, y], [r + 0.012, y + 0.02], [r + 0.012, y + 0.06], [r, y + 0.08]], n);
}
function marker(ctx, lod) { // carved limestone mile-post, front (−Z) takes the plaque
  const P = ctx;
  paint(ctx, 'ashlar', COL.lime, 0.92);
  if (lod >= 4) { box(P, -0.22, -0.1, -0.15, 0.22, 1.12, 0.15); return; }
  box(P, -0.33, -0.15, -0.26, 0.33, 0.16, 0.26); // plinth, sunk into the verge
  paint(ctx, 'lime', COL.lime, 0.92);
  const q = (w, d, y) => [[-w, y, -d], [w, y, -d], [w, y, d], [-w, y, d]];
  solid(P, q(0.22, 0.15, 0.16), q(0.2, 0.135, 1.02)); // tapering shaft
  solid(P, q(0.235, 0.155, 1.02), q(0.235, 0.155, 1.08)); // cap band
  const r = q(0.235, 0.155, 1.08), apex = [[-0.06, 1.24, -0.02], [0.06, 1.24, -0.02], [0.06, 1.24, 0.02], [-0.06, 1.24, 0.02]];
  solid(P, r, apex); // hipped crown
  if (lod > 2) return;
  paint(ctx, 'lime', 'oklch(0.88 0.02 80)', 0.95); // the carved frame the plaque sits in
  const z = -0.138 - 0.014;
  for (const [x0, y0, x1, y1] of [[-0.19, 0.3, 0.19, 0.34], [-0.19, 0.9, 0.19, 0.94], [-0.19, 0.34, -0.15, 0.9], [0.15, 0.34, 0.19, 0.9]]) box(P, x0, y0, z, x1, y1, z + 0.03);
  paint(ctx, null, 'oklch(0.66 0.11 135)', 0.95); // moss at the foot
  const rnd = () => ctx.random();
  for (const [x, zz] of [[-0.28, 0.18], [0.3, -0.12], [0.1, 0.24]]) blob(P, x, 0.14, zz, 0.12, 0.06, 0.1, 5, rnd);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, rnd = () => ctx.random();
  ctx.flat();
  if (p.item === 'marker') return marker(ctx, lod);
  if (lod <= 3) { paint(ctx, 'soil', 'oklch(0.86 0.03 60)', 0.97); for (const r of p.ruts || []) rut(ctx, r, lod); }
  for (const [x, y, z, yaw, hasBin] of p.benches || []) {
    const F = XF(ctx, x, y, z, yaw * D2R);
    bench(ctx, F, lod);
    patch(ctx, XF(F, 1.75, 0, 0.05), lod, rnd);
    if (hasBin && lod <= 3) bin(ctx, XF(F, -1.45, 0, 0.1), lod);
  }
});
export function collider(ctx) {
  const p = ctx.params;
  if (p.item === 'marker') return box(ctx, -0.3, 0, -0.24, 0.3, 1.2, 0.24);
  for (const [x, y, z, yaw, hasBin] of p.benches || []) {
    const F = XF(ctx, x, y, z, yaw * D2R);
    box(F, -1.05, 0, -0.26, 1.05, 0.95, 0.34);
    if (hasBin) box(F, -1.72, 0, -0.17, -1.18, 0.72, 0.37);
  }
}
