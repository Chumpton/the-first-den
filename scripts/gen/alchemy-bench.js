// The alchemy bench: a small oak deck off the lake dock's west side, a potting bench against its back rail with a mortar & pestle,
// a copper still, glowing flasks and a test-tube rack, seed jars on the shelf. Origin = deck top centre; front (-Z) meets the dock walkway.
import { P, TEX, box, rod, lathe } from '../lib/solid-kit.js';
const W = 2, D = 1.43;
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod || 1, S = lod <= 2 ? 10 : 6;
  // deck planks, joists, posts
  P(ctx, TEX.oak, 'oklch(0.93 0.03 75)');
  const n = lod <= 2 ? 10 : 1;
  for (let i = 0; i < n; i++) { const x0 = -W + (i * 2 * W) / n; box(ctx, x0 + (n > 1 ? 0.01 : 0), -0.06, -D, x0 + (2 * W) / n - (n > 1 ? 0.01 : 0), 0, D); }
  P(ctx, TEX.walnut, 'oklch(0.9 0.03 60)');
  for (const z of [-1.3, 0, 1.3]) box(ctx, -W, -0.26, z - 0.07, W, -0.06, z + 0.07);
  for (const x of [-1.9, 0, 1.9]) for (const z of [-1.33, 1.33]) box(ctx, x - 0.08, -2.3, z - 0.08, x + 0.08, -0.06, z + 0.08);
  // end + back rails
  for (const s of [-1, 1]) {
    for (const z of [-1.33, 0, 1.33]) box(ctx, s * 1.95 - 0.045, 0, z - 0.045, s * 1.95 + 0.045, 0.98, z + 0.045);
    box(ctx, s * 1.95 - 0.05, 0.92, -D, s * 1.95 + 0.05, 0.99, D);
    if (lod <= 2) box(ctx, s * 1.95 - 0.025, 0.46, -D, s * 1.95 + 0.025, 0.52, D);
  }
  box(ctx, -W, 0.92, 1.36, W, 0.99, 1.44);
  // bench: legs, top, lower shelf, back board, upper shelf
  P(ctx, TEX.oak, 'oklch(0.95 0.03 80)');
  box(ctx, -1.5, 0.86, 0.68, 1.5, 0.92, 1.33);
  for (const x of [-1.44, 1.44]) for (const z of [0.73, 1.28]) box(ctx, x - 0.035, 0, z - 0.035, x + 0.035, 0.86, z + 0.035);
  box(ctx, -1.46, 0.22, 0.72, 1.46, 0.26, 1.3);
  P(ctx, TEX.walnut, 'oklch(0.92 0.03 60)');
  box(ctx, -1.5, 0.92, 1.3, 1.5, 1.95, 1.35);
  box(ctx, -1.5, 1.36, 1.1, 1.5, 1.39, 1.3);
  if (lod <= 2) for (const x of [-1.45, 1.45]) box(ctx, x - 0.03, 1.2, 1.12, x + 0.03, 1.36, 1.3);
  if (lod >= 4) return;
  const T = 0.92;
  // mortar & pestle
  P(ctx, TEX.stone, 'oklch(0.95 0.02 85)', 0.9);
  lathe(ctx, -1.15, T, 0.92, [[0, 0], [0.07, 0], [0.09, 0.03], [0.1, 0.1], [0.08, 0.1], [0.065, 0.05], [0, 0.05]], S);
  P(ctx, TEX.walnut, 'oklch(0.9 0.03 60)');
  rod(ctx, [-1.13, T + 0.05, 0.92], [-1.03, T + 0.24, 0.85], 0.03);
  // flasks: glass shells over emissive liquid
  const flask = (x, z, glass, liquid, e) => {
    ctx.albedo(null); ctx.color('oklch(0.4 0.05 250)'); ctx.emissive(...e); ctx.roughness(0.3); ctx.metalness(0);
    lathe(ctx, x, T, z, liquid, S);
    ctx.emissive(null); ctx.color('oklch(0.96 0.02 200)', 0.32); ctx.roughness(0.08);
    lathe(ctx, x, T, z, glass, S);
  };
  flask(-0.25, 0.9, [[0, 0], [0.06, 0.005], [0.1, 0.05], [0.11, 0.1], [0.09, 0.16], [0.03, 0.2], [0.025, 0.3], [0.035, 0.31], [0, 0.31]], [[0, 0.01], [0.08, 0.02], [0.1, 0.08], [0.095, 0.11], [0, 0.11]], [0.25, 1.5, 1.35]);
  flask(0.12, 1.0, [[0, 0], [0.09, 0], [0.09, 0.02], [0.035, 0.16], [0.03, 0.25], [0, 0.25]], [[0, 0.005], [0.085, 0.005], [0.06, 0.07], [0, 0.07]], [0.9, 0.45, 1.7]);
  flask(0.38, 0.88, [[0, 0], [0.04, 0], [0.045, 0.02], [0.045, 0.27], [0.052, 0.28], [0, 0.28]], [[0, 0.01], [0.04, 0.01], [0.04, 0.17], [0, 0.17]], [1.7, 0.5, 0.8]);
  // test-tube rack
  P(ctx, TEX.oak, 'oklch(0.9 0.04 70)');
  box(ctx, 0.58, T, 1.08, 0.92, T + 0.03, 1.2); box(ctx, 0.58, T + 0.12, 1.08, 0.92, T + 0.15, 1.2);
  box(ctx, 0.58, T, 1.08, 0.6, T + 0.15, 1.2); box(ctx, 0.9, T, 1.08, 0.92, T + 0.15, 1.2);
  const tubeE = [[0.25, 1.4, 1.3], [1.5, 0.45, 0.8], [0.8, 0.4, 1.6], [0.25, 1.4, 1.3]];
  for (let i = 0; i < 4; i++) { ctx.albedo(null); ctx.color('oklch(0.5 0.05 250)'); ctx.emissive(...tubeE[i]); box(ctx, 0.63 + i * 0.075, T + 0.035, 1.125, 0.66 + i * 0.075, T + 0.1 + (i % 2) * 0.03, 1.155); ctx.emissive(null); ctx.color('oklch(0.96 0.02 200)', 0.3); box(ctx, 0.625 + i * 0.075, T + 0.03, 1.12, 0.665 + i * 0.075, T + 0.2, 1.16); }
  // copper still: burner, pot, swan neck, condenser
  P(ctx, TEX.brass, 'oklch(0.9 0.05 80)', 0.4, 0.8);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; rod(ctx, [1.05 + Math.cos(a) * 0.17, T, 1.0 + Math.sin(a) * 0.17], [1.05 + Math.cos(a) * 0.14, T + 0.12, 1.0 + Math.sin(a) * 0.14], 0.02); }
  ctx.albedo(null); ctx.color('oklch(0.35 0.03 60)'); ctx.emissive(1.8, 0.6, 0.15);
  lathe(ctx, 1.05, T, 1.0, [[0, 0], [0.05, 0], [0.05, 0.07], [0, 0.07]], S);
  P(ctx, null, 'oklch(0.66 0.13 52)', 0.35, 0.85);
  lathe(ctx, 1.05, T + 0.1, 1.0, [[0, 0], [0.13, 0], [0.18, 0.05], [0.19, 0.15], [0.16, 0.25], [0.07, 0.3], [0.045, 0.4], [0.055, 0.42], [0, 0.42]], S);
  rod(ctx, [1.05, T + 0.5, 1.0], [1.3, T + 0.44, 0.84], 0.035);
  rod(ctx, [1.3, T + 0.44, 0.84], [1.36, T + 0.26, 0.8], 0.035);
  lathe(ctx, 1.36, T, 0.8, [[0, 0], [0.075, 0], [0.075, 0.26], [0, 0.26]], S);
  if (lod <= 2) for (const y of [0.06, 0.13, 0.2]) lathe(ctx, 1.36, T + y, 0.8, [[0.08, 0], [0.085, 0.015], [0.08, 0.03]], S);
  // seed jars on the upper shelf, either side of the chalk sign
  const seeds = ['oklch(0.72 0.1 80)', 'oklch(0.45 0.06 50)', 'oklch(0.8 0.12 95)', 'oklch(0.55 0.09 140)', 'oklch(0.65 0.12 40)', 'oklch(0.35 0.03 60)', 'oklch(0.85 0.05 90)', 'oklch(0.6 0.11 20)'];
  let k = 0;
  for (const x of [-1.35, -1.12, -0.89, -0.66, 0.66, 0.89, 1.12, 1.35]) {
    const h = 0.12 + ((k * 37) % 5) * 0.012, y = 1.39;
    P(ctx, null, seeds[k++], 0.9); lathe(ctx, x, y, 1.2, [[0, 0.005], [0.05, 0.005], [0.052, h * 0.6], [0, h * 0.6]], S);
    P(ctx, null, 'oklch(0.96 0.02 200)', 0.1, 0, 0.3); lathe(ctx, x, y, 1.2, [[0, 0], [0.056, 0], [0.058, h], [0.042, h + 0.02], [0, h + 0.02]], S);
    P(ctx, null, 'oklch(0.7 0.07 70)', 0.9); lathe(ctx, x, y + h + 0.015, 1.2, [[0, 0], [0.04, 0], [0.04, 0.03], [0, 0.03]], 6);
  }
  // lower shelf: terracotta pots and a linen seed sack
  P(ctx, null, 'oklch(0.63 0.12 45)', 0.9);
  for (const [x, s] of [[-1.1, 1], [-0.8, 0.8], [-0.56, 0.65]]) lathe(ctx, x, 0.26, 1.0, [[0, 0], [0.08 * s, 0], [0.11 * s, 0.16 * s], [0.125 * s, 0.17 * s], [0.125 * s, 0.2 * s], [0, 0.2 * s]], S);
  P(ctx, null, 'oklch(0.9 0.03 85)', 0.95);
  lathe(ctx, 0.9, 0.26, 1.0, [[0, 0], [0.16, 0], [0.2, 0.1], [0.18, 0.28], [0.08, 0.36], [0.1, 0.42], [0, 0.42]], S);
}
export function collider(ctx) {
  box(ctx, -W, -0.3, -D, W, 0, D);
  box(ctx, -1.5, 0, 0.68, 1.5, 1.95, 1.44);
  for (const s of [-1, 1]) box(ctx, s * 1.95 - 0.05, 0, -D, s * 1.95 + 0.05, 1, D);
  box(ctx, -W, 0, 1.36, W, 1, 1.44);
}
