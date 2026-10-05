// Red squirrel: rust coat, cream bib, tufted ears, a big S of a tail. Feet at y 0, nose to -Z, ~0.4 m tall at scale 1.
import { blob, cone } from './critter-mesh.js';
export function skeleton() {
  return { root: { pivot: [0, 0.08, 0.06] }, head: { parent: 'root', pivot: [0, 0.17, -0.07] }, legF: { parent: 'root', pivot: [0, 0.1, -0.06] },
    legB: { parent: 'root', pivot: [0, 0.08, 0.07] }, tail1: { parent: 'root', pivot: [0, 0.12, 0.11] }, tail2: { parent: 'tail1', pivot: [0, 0.2, 0.19] } };
}
export function geometry(ctx) {
  const lo = ctx.lod >= 4, s = ctx.lod >= 3 ? 5 : 7;
  const RUST = 'oklch(0.6 0.15 44)', CREAM = 'oklch(0.94 0.04 85)', DARK = 'oklch(0.2 0.02 40)', TAIL = 'oklch(0.55 0.15 40)';
  ctx.smooth(); ctx.roughness(0.9);
  ctx.bone('root'); ctx.color(RUST);
  blob(ctx, [0, 0.12, 0.02], [0.07, 0.075, 0.11], { seg: s, rings: lo ? 3 : 4, pitch: 20 });
  ctx.bone('head'); blob(ctx, [0, 0.2, -0.1], [0.05, 0.05, 0.06], { seg: lo ? 4 : s, rings: 3 });
  ctx.bone('tail2'); ctx.color(TAIL);
  if (lo) { blob(ctx, [0, 0.25, 0.18], [0.06, 0.14, 0.06], { seg: 4, rings: 3 }); return; }
  blob(ctx, [0, 0.27, 0.2], [0.065, 0.1, 0.06], { seg: s, rings: 4, pitch: 10 });
  ctx.color(CREAM); blob(ctx, [0, 0.36, 0.14], [0.05, 0.05, 0.05], { seg: 5, rings: 3 });
  ctx.bone('tail1'); ctx.color(TAIL); blob(ctx, [0, 0.15, 0.16], [0.05, 0.07, 0.055], { seg: 5, rings: 3, pitch: -35 });
  ctx.bone('root'); ctx.color(CREAM); blob(ctx, [0, 0.105, -0.04], [0.05, 0.055, 0.055], { seg: 5, rings: 3, pitch: 20 });
  ctx.bone('legB'); ctx.color(RUST);
  for (const x of [-0.045, 0.045]) { blob(ctx, [x, 0.07, 0.07], [0.03, 0.05, 0.06], { seg: 5, rings: 3 }); blob(ctx, [x * 0.9, 0.012, 0.04], [0.02, 0.012, 0.05], { seg: 4, rings: 2 }); }
  ctx.bone('legF');
  for (const x of [-0.03, 0.03]) cone(ctx, [x, 0.1, -0.06], [x, 0.0, -0.085], 0.016, 4);
  ctx.bone('head'); ctx.color(CREAM); blob(ctx, [0, 0.188, -0.15], [0.03, 0.028, 0.03], { seg: 5, rings: 3 });
  ctx.color(DARK); blob(ctx, [0, 0.198, -0.178], [0.01, 0.009, 0.008], { seg: 4, rings: 2 });
  for (const x of [-1, 1]) {
    blob(ctx, [x * 0.033, 0.215, -0.132], [0.011, 0.012, 0.01], { seg: 4, rings: 2 });
    ctx.color(RUST); cone(ctx, [x * 0.027, 0.235, -0.09], [x * 0.036, 0.3, -0.08], 0.017, 3);
    ctx.color(DARK); cone(ctx, [x * 0.034, 0.285, -0.082], [x * 0.038, 0.322, -0.078], 0.007, 3);
  }
}
export function collider() { return null; }
