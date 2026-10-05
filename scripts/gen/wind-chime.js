// A small hand-made wind chime hung from a deck edge. Feet = the hook point on the deck's underside; the chime hangs DOWN
// (negative y): an iron hook, a linen cord, a walnut crown ring, six brass tubes on threads, a walnut striker and an oak sail.
// params: tubes (count, default 6), drop (cord length m, default 0.35), tint (sail hue). No collider: it hangs out of reach.
import { paint, obox, beam, lathe, TAU } from '../lib/yard-kit.js';
import { prism, ngon, gem } from '../lib/road-solid.js';
import { softened } from "./soften.js";
export const geometry = softened(function geometry(ctx) {
  ctx.flat();
  const p = ctx.params, lod = ctx.lod ?? 1, n = p.tubes ?? 6, drop = p.drop ?? 0.35, rnd = () => ctx.random();
  const seg = lod <= 2 ? 10 : 6;
  // hook + cord
  paint(ctx, null, 'oklch(0.3 0.015 60)', 0.5, 0.6); obox(ctx, 0, -0.06, 0, 0.05, 0.06, 0.05);
  paint(ctx, null, 'oklch(0.9 0.03 85)', 0.95); beam(ctx, [0, -0.06, 0], [0, -drop, 0], 0.012);
  const top = -drop;
  // walnut crown: a turned disc with a lip
  paint(ctx, 'walnut', 'oklch(0.93 0.02 60)', 0.7);
  lathe(ctx, [[0, top - 0.035], [0.13, top - 0.035], [0.135, top - 0.015], [0.11, top], [0.02, top + 0.012], [0, top + 0.012]], seg);
  if (lod <= 2) { paint(ctx, 'brass', 'oklch(0.95 0.04 85)', 0.35, 0.8); lathe(ctx, [[0.128, top - 0.03], [0.14, top - 0.03], [0.14, top - 0.02], [0.128, top - 0.02]], seg); }
  // tubes on threads, lengths stepped like a scale
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + 0.3, x = Math.cos(a) * 0.095, z = Math.sin(a) * 0.095, L = 0.26 + (i / (n - 1)) * 0.26, t0 = top - 0.035 - 0.07;
    if (lod <= 3) { paint(ctx, null, 'oklch(0.9 0.03 85)', 0.95); beam(ctx, [x, top - 0.035, z], [x, t0, z], 0.004); }
    paint(ctx, 'brass', `oklch(${(0.86 + rnd() * 0.08).toFixed(3)} 0.06 ${(78 + rnd() * 10).toFixed(0)})`, 0.3, 0.85);
    prism(ctx, ngon(lod <= 2 ? 6 : 4, 0.013, x, z), t0 - L, t0);
    if (lod <= 2) { paint(ctx, null, 'oklch(0.3 0.015 60)', 0.6, 0.5); prism(ctx, ngon(6, 0.015, x, z), t0 - 0.012, t0); }
  }
  // centre thread, walnut striker, oak sail catching the breeze
  paint(ctx, null, 'oklch(0.9 0.03 85)', 0.95); beam(ctx, [0, top - 0.035, 0], [0, top - 0.62, 0], 0.004);
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.7); prism(ctx, ngon(seg, 0.05), top - 0.3, top - 0.27);
  paint(ctx, 'oak', `oklch(0.95 0.03 ${p.tint ?? 75})`, 0.8);
  const sy = top - 0.62; obox(ctx, 0, sy - 0.17, 0, 0.1, 0.17, 0.012);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.55 0.09 195)', 0.8); obox(ctx, 0, sy - 0.12, 0, 0.06, 0.03, 0.016); gem(ctx, 0, sy - 0.175, 0, 0.02, 0.01, 0.015, 4); }
});
export function collider() { return null; }
