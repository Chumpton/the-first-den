// Compost corner behind the glasshouse: a limestone-gravel pad, a green compost tumbler on iron A-frames (params.part "drum" = the
// turning drum alone, centred on its axle, axis along X), a slatted worm bin, weathered pallets and terracotta pot stacks.
import { P, TEX, box, rod, lathe } from '../lib/solid-kit.js';
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod || 1, S = lod <= 2 ? 10 : 6;
  if (ctx.params.part === 'drum') return drum(ctx, lod);
  // pad
  P(ctx, TEX.stone, 'oklch(0.92 0.02 85)', 0.95);
  box(ctx, -1.9, -0.35, -0.8, 1.9, 0.05, 1.8);
  // tumbler frame + axle (drum is its own child row)
  P(ctx, null, 'oklch(0.36 0.02 250)', 0.6, 0.6);
  for (const x of [-0.95, 0.25]) { rod(ctx, [x, 0.05, -0.45], [x, 0.9, 0], 0.05); rod(ctx, [x, 0.05, 0.45], [x, 0.9, 0], 0.05); rod(ctx, [x, 0.3, -0.33], [x, 0.3, 0.33], 0.035); }
  rod(ctx, [-1.02, 0.85, 0], [0.32, 0.85, 0], 0.04);
  // worm bin: slatted oak crate with a soil top and a lid leaning on it
  P(ctx, TEX.oak, 'oklch(0.82 0.03 70)', 0.95);
  const nS = lod <= 2 ? 4 : 1;
  for (let i = 0; i < nS; i++) { const y0 = 0.05 + i * (0.55 / nS), y1 = y0 + 0.55 / nS - (nS > 1 ? 0.02 : 0); box(ctx, 0.85, y0, -0.4, 1.75, y1, -0.35); box(ctx, 0.85, y0, 0.35, 1.75, y1, 0.4); box(ctx, 0.85, y0, -0.35, 0.9, y1, 0.35); box(ctx, 1.7, y0, -0.35, 1.75, y1, 0.35); }
  P(ctx, TEX.soil, 'oklch(0.9 0.02 60)', 1); box(ctx, 0.9, 0.05, -0.35, 1.7, 0.5, 0.35);
  P(ctx, TEX.oak, 'oklch(0.8 0.03 70)', 0.95); rod(ctx, [1.3, 0.6, -0.42], [1.3, 0.25, -0.62], 0.03);
  box(ctx, 0.85, 0.58, -0.44, 1.75, 0.61, -0.1);
  // pallets: three weathered, stacked a little askew
  P(ctx, TEX.oak, 'oklch(0.72 0.02 80)', 1);
  for (let p = 0; p < 3; p++) {
    const ox = -0.45 + p * 0.04, oz = 1.15 - p * 0.03, y = 0.05 + p * 0.14;
    if (lod <= 2) { for (let i = 0; i < 5; i++) box(ctx, ox - 0.6 + i * 0.25, y + 0.1, oz - 0.4, ox - 0.6 + i * 0.25 + 0.2, y + 0.13, oz + 0.4); for (const z of [-0.36, 0, 0.36]) box(ctx, ox - 0.6, y, oz + z - 0.045, ox + 0.6, y + 0.1, oz + z + 0.045); }
    else box(ctx, ox - 0.6, y, oz - 0.4, ox + 0.6, y + 0.13, oz + 0.4);
  }
  // terracotta pot stacks
  P(ctx, null, 'oklch(0.63 0.12 45)', 0.9);
  const pot = [[0, 0], [0.1, 0], [0.14, 0.18], [0.16, 0.19], [0.16, 0.22], [0, 0.22]];
  for (const [x, z, n] of [[1.1, 1.05, 5], [1.5, 1.35, 3], [-1.45, 0.9, 4]]) for (let i = 0; i < n; i++) lathe(ctx, x, 0.05 + i * 0.07, z, pot, S);
  if (lod <= 3) lathe(ctx, -1.55, 0.05, -0.45, [[0, 0], [0.45, 0], [0.35, 0.15], [0.15, 0.25], [0, 0.27]], 7, null, 1.2);
}
function drum(ctx, lod) {
  const R = 0.42, L = 0.5, xf = ([x, y, z]) => [y, x, z];
  P(ctx, null, 'oklch(0.56 0.07 145)', 0.55, 0.3);
  lathe(ctx, 0, 0, 0, [[0, -L], [R * 0.9, -L], [R, -L + 0.06], [R, L - 0.06], [R * 0.9, L], [0, L]], 8, xf);
  if (lod <= 2) {
    P(ctx, null, 'oklch(0.36 0.02 250)', 0.6, 0.6);
    for (const x of [-0.3, 0.3]) lathe(ctx, 0, 0, 0, [[R + 0.015, x - 0.03], [R + 0.015, x + 0.03]], 8, xf);
    P(ctx, null, 'oklch(0.46 0.06 145)', 0.55, 0.3);
    box(ctx, -0.18, R - 0.01, -0.14, 0.18, R + 0.02, 0.14);
    P(ctx, null, 'oklch(0.36 0.02 250)', 0.6, 0.6); box(ctx, 0.08, R + 0.02, -0.04, 0.14, R + 0.06, 0.04);
  }
}
export function collider(ctx) {
  if (ctx.params.part === 'drum') return null;
  box(ctx, -1.9, -0.35, -0.8, 1.9, 0.05, 1.8);
  box(ctx, -1.0, 0.05, -0.45, 0.3, 1.3, 0.45);
  box(ctx, 0.85, 0.05, -0.44, 1.75, 0.61, 0.4);
  box(ctx, -1.05, 0.05, 0.72, 0.65, 0.5, 1.58);
}
