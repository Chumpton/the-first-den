// A warden's moss-green cloak in the wearer's frame (feet at origin, facing −Z): a cowl round the shoulders,
// a cape wrapping the back to the calves with a rippled hem, and a lowered hood behind the neck.
import { Q, blob, paint, TAU } from '../lib/yard-kit.js';
export function geometry(ctx) {
  const lod = ctx.lod ?? 1, S = ctx.params?.h ?? 1;
  ctx.smooth();
  paint(ctx, null, 'oklch(0.5 0.08 138)', 0.95);
  const rows = lod <= 2 ? 8 : 3, cols = lod <= 2 ? 14 : 6;
  const pt = (u, v) => { // u -1..1 around the back, v 0 shoulders .. 1 hem
    const phi = u * 1.75, y = (1.42 - v * 1.08) * S, rx = (0.23 + v * 0.2) * S, rz = (0.15 + v * 0.18) * S, rip = 1 + Math.sin(u * 9) * 0.06 * v;
    return [Math.sin(phi) * rx * rip, y, 0.03 * S + Math.cos(phi) * rz * rip];
  };
  const o = [0, 0.9 * S, 0.02 * S];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const u0 = -1 + c / cols * 2, u1 = -1 + (c + 1) / cols * 2, v0 = r / rows, v1 = (r + 1) / rows;
    Q(ctx, pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1), o);
  }
  // cowl
  paint(ctx, null, 'oklch(0.46 0.08 140)', 0.95);
  const n = lod <= 2 ? 12 : 6;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, ring = (a, r, y) => [Math.cos(a) * r * S, y * S, Math.sin(a) * r * 0.8 * S + 0.02 * S];
    Q(ctx, ring(a0, 0.29, 1.3), ring(a1, 0.29, 1.3), ring(a1, 0.12, 1.53), ring(a0, 0.12, 1.53), [0, 1.2 * S, 0]);
  }
  // lowered hood
  if (lod <= 3) blob(ctx, 0, 1.4 * S, 0.17 * S, 0.17 * S, 0.17 * S, 0.12 * S, 6);
}
export function collider() { return null; }
