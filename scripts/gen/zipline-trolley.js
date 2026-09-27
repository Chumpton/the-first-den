// The zip-line trolley: twin brass pulleys between iron cheeks riding the rope (at y params.hang), a hanger rod and a
// honey-oak T-bar with linen grips. Origin = the bar's middle; travel is local -Z.
import { paint, obox, beam } from '../lib/yard-kit.js';
import { solid, ngon } from '../lib/road-solid.js';
function wheel(ctx, z, y, r, n) { const R = ngon(n, r).map(([a, b]) => [a, b]); solid(ctx, R.map(([a, b]) => [-0.025, y + a, z + b]), R.map(([a, b]) => [0.025, y + a, z + b])); }
export function geometry(ctx) {
  ctx.flat(); const H = ctx.params?.hang ?? 0.95, lod = ctx.lod, n = lod <= 2 ? 10 : 6;
  paint(ctx, null, 'oklch(0.78 0.11 80)', 0.35, 0.8); for (const z of [-0.11, 0.11]) wheel(ctx, z, H + 0.065, 0.065, n);
  paint(ctx, null, 'oklch(0.3 0.015 60)', 0.5, 0.6);
  for (const x of [-0.045, 0.045]) obox(ctx, x, H - 0.1, 0, 0.018, 0.28, 0.36);
  obox(ctx, 0, H + 0.15, 0, 0.13, 0.035, 0.38);
  beam(ctx, [0, H - 0.1, 0], [0, 0.22, 0], 0.035, 0.035);
  for (const s of [-1, 1]) beam(ctx, [0, 0.26, 0], [s * 0.3, 0.02, 0], 0.025, 0.025);
  paint(ctx, 'oak', 'oklch(0.86 0.05 70)', 0.8); beam(ctx, [-0.4, 0, 0], [0.4, 0, 0], 0.05, 0.05);
  paint(ctx, null, 'oklch(0.9 0.03 85)', 1); for (const s of [-1, 1]) obox(ctx, s * 0.25, -0.035, 0, 0.2, 0.07, 0.07);
}
export function collider() { return null; }
