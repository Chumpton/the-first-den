// Songbird: params.variant robin | bluebird | finch. Feet at y 0, beak to -Z, wings spread flat at rest (the perch clip folds them).
import { blob, cone, plate } from './critter-mesh.js';
const LOOKS = {
  robin: { back: 'oklch(0.5 0.04 60)', breast: 'oklch(0.68 0.17 50)', belly: 'oklch(0.93 0.02 85)', wing: 'oklch(0.42 0.04 60)', cap: 'oklch(0.36 0.03 60)', beak: 'oklch(0.72 0.12 85)' },
  bluebird: { back: 'oklch(0.58 0.15 250)', breast: 'oklch(0.66 0.13 50)', belly: 'oklch(0.95 0.01 90)', wing: 'oklch(0.5 0.16 255)', cap: 'oklch(0.55 0.15 250)', beak: 'oklch(0.25 0.02 250)' },
  finch: { back: 'oklch(0.88 0.17 98)', breast: 'oklch(0.9 0.16 100)', belly: 'oklch(0.95 0.08 100)', wing: 'oklch(0.22 0.02 80)', cap: 'oklch(0.2 0.02 80)', beak: 'oklch(0.78 0.1 60)' },
};
export function skeleton() {
  return { root: { pivot: [0, 0.06, 0] }, head: { parent: 'root', pivot: [0, 0.08, -0.04] }, tail: { parent: 'root', pivot: [0, 0.065, 0.045] },
    wingL: { parent: 'root', pivot: [-0.025, 0.075, 0.005] }, wingR: { parent: 'root', pivot: [0.025, 0.075, 0.005] } };
}
export function geometry(ctx) {
  const L = LOOKS[ctx.params.variant] ?? LOOKS.robin, lo = ctx.lod >= 4, s = ctx.lod >= 3 ? 5 : 6;
  ctx.flat(); ctx.roughness(0.8);
  ctx.bone('root'); ctx.color(L.back); blob(ctx, [0, 0.06, 0], [0.035, 0.035, 0.06], { seg: lo ? 4 : s, rings: 3, pitch: 8 });
  ctx.bone('head'); blob(ctx, [0, 0.095, -0.045], [0.026, 0.026, 0.026], { seg: lo ? 4 : 5, rings: 3 });
  ctx.color(L.beak); cone(ctx, [0, 0.093, -0.066], [0, 0.09, -0.092], 0.008, 3);
  for (const [b, x] of [['wingL', -1], ['wingR', 1]]) { ctx.bone(b); ctx.color(L.wing); plate(ctx, [[x * 0.025, 0.076, -0.025], [x * 0.1, 0.076, -0.012], [x * 0.14, 0.073, 0.03], [x * 0.025, 0.076, 0.035]]); }
  ctx.bone('tail'); ctx.color(L.wing); plate(ctx, [[-0.012, 0.066, 0.045], [0.012, 0.066, 0.045], [0.026, 0.072, 0.11], [-0.026, 0.072, 0.11]]);
  if (lo) return;
  ctx.bone('root'); ctx.color(L.breast); blob(ctx, [0, 0.055, -0.028], [0.029, 0.029, 0.033], { seg: 5, rings: 3 });
  ctx.color(L.belly); blob(ctx, [0, 0.042, 0.012], [0.026, 0.02, 0.035], { seg: 5, rings: 3 });
  ctx.color('oklch(0.4 0.03 50)'); for (const x of [-0.01, 0.01]) cone(ctx, [x, 0.035, 0.002], [x, 0.0, 0.0], 0.004, 3);
  ctx.bone('head'); ctx.color(L.cap); blob(ctx, [0, 0.108, -0.043], [0.022, 0.014, 0.022], { seg: 5, rings: 2 });
  ctx.color('oklch(0.15 0.01 60)'); for (const x of [-1, 1]) blob(ctx, [x * 0.022, 0.1, -0.056], [0.006, 0.007, 0.006], { seg: 4, rings: 2 });
}
export function collider() { return null; }
