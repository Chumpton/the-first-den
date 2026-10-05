// Mallard: params.sex drake | hen. Origin at the waterline, bill to -Z; the hull sits a few cm under the surface.
import { blob, cone, plate } from './critter-mesh.js';
const LOOKS = {
  drake: { body: 'oklch(0.82 0.015 80)', chest: 'oklch(0.45 0.08 40)', head: 'oklch(0.46 0.13 158)', wing: 'oklch(0.62 0.03 70)', bill: 'oklch(0.85 0.15 100)', tail: 'oklch(0.22 0.01 80)', collar: true },
  hen: { body: 'oklch(0.6 0.07 62)', chest: 'oklch(0.55 0.07 58)', head: 'oklch(0.58 0.06 65)', wing: 'oklch(0.5 0.06 60)', bill: 'oklch(0.7 0.14 55)', tail: 'oklch(0.52 0.06 60)', collar: false },
};
export function skeleton() { return { root: { pivot: [0, 0.06, -0.02] }, head: { parent: 'root', pivot: [0, 0.12, -0.13] }, tail: { parent: 'root', pivot: [0, 0.09, 0.17] } }; }
export function geometry(ctx) {
  const L = LOOKS[ctx.params.sex] ?? LOOKS.drake, lo = ctx.lod >= 4, s = ctx.lod >= 3 ? 6 : 8;
  ctx.smooth(); ctx.roughness(0.7);
  ctx.bone('root'); ctx.color(L.body); blob(ctx, [0, 0.05, 0.02], [0.11, 0.08, 0.2], { seg: lo ? 5 : s, rings: lo ? 3 : 4 });
  ctx.bone('head'); ctx.color(L.head); blob(ctx, [0, 0.24, -0.17], [0.045, 0.05, 0.06], { seg: lo ? 4 : 6, rings: 3 });
  ctx.color(L.bill); blob(ctx, [0, 0.228, -0.24], [0.025, 0.012, 0.045], { seg: lo ? 4 : 5, rings: 2 });
  ctx.bone('tail'); ctx.color(L.tail); cone(ctx, [0, 0.08, 0.17], [0, 0.13, 0.27], 0.045, 4);
  if (lo) return;
  ctx.bone('root'); ctx.color(L.chest); blob(ctx, [0, 0.08, -0.12], [0.09, 0.08, 0.08], { seg: 6, rings: 3 });
  ctx.color(L.wing); for (const x of [-1, 1]) { blob(ctx, [x * 0.085, 0.1, 0.04], [0.04, 0.04, 0.13], { seg: 5, rings: 3 }); ctx.color('oklch(0.5 0.16 260)'); plate(ctx, [[x * 0.123, 0.1, 0.06], [x * 0.123, 0.1, 0.11], [x * 0.12, 0.08, 0.11], [x * 0.12, 0.08, 0.06]]); ctx.color(L.wing); }
  ctx.bone('head'); ctx.color(L.head); cone(ctx, [0, 0.1, -0.13], [0, 0.22, -0.16], 0.042, 5);
  if (L.collar) { ctx.color('oklch(0.97 0 0)'); blob(ctx, [0, 0.165, -0.15], [0.043, 0.012, 0.043], { seg: 6, rings: 2 }); }
  ctx.color('oklch(0.12 0.01 60)'); for (const x of [-1, 1]) blob(ctx, [x * 0.043, 0.255, -0.19], [0.007, 0.008, 0.007], { seg: 4, rings: 2 });
}
export function collider() { return null; }
