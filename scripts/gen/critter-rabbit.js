// Cottontail rabbit: soft grey-brown, long ears, white puff tail. Feet at y 0, nose to -Z.
import { blob, cone, plate } from './critter-mesh.js';
export function skeleton() {
  return { root: { pivot: [0, 0.1, 0.08] }, head: { parent: 'root', pivot: [0, 0.19, -0.06] }, earL: { parent: 'head', pivot: [-0.025, 0.26, -0.08] },
    earR: { parent: 'head', pivot: [0.025, 0.26, -0.08] }, legF: { parent: 'root', pivot: [0, 0.09, -0.07] }, legB: { parent: 'root', pivot: [0, 0.09, 0.08] } };
}
export function geometry(ctx) {
  const lo = ctx.lod >= 4, s = ctx.lod >= 3 ? 5 : 7;
  const FUR = 'oklch(0.66 0.05 62)', BELLY = 'oklch(0.95 0.015 85)', PINK = 'oklch(0.82 0.08 10)', DARK = 'oklch(0.18 0.02 40)';
  ctx.flat(); ctx.roughness(0.95);
  ctx.bone('root'); ctx.color(FUR); blob(ctx, [0, 0.13, 0.03], [0.085, 0.09, 0.13], { seg: s, rings: lo ? 3 : 4, pitch: 10 });
  ctx.bone('head'); blob(ctx, [0, 0.22, -0.1], [0.055, 0.055, 0.07], { seg: lo ? 4 : s, rings: 3, pitch: -10 });
  for (const [b, x] of [['earL', -1], ['earR', 1]]) { ctx.bone(b); ctx.color(FUR); blob(ctx, [x * 0.032, 0.33, -0.07], [0.022, 0.08, 0.012], { seg: lo ? 4 : 5, rings: 3, yaw: x * 12 }); }
  if (lo) return;
  for (const [b, x] of [['earL', -1], ['earR', 1]]) { ctx.bone(b); ctx.color(PINK); plate(ctx, [[x * 0.032, 0.27, -0.083], [x * 0.042, 0.33, -0.083], [x * 0.032, 0.39, -0.083], [x * 0.022, 0.33, -0.083]]); }
  ctx.bone('root'); ctx.color(BELLY); blob(ctx, [0, 0.15, 0.16], [0.035, 0.035, 0.035], { seg: 5, rings: 3 });
  blob(ctx, [0, 0.1, -0.03], [0.055, 0.055, 0.06], { seg: 5, rings: 3 });
  ctx.bone('legB'); ctx.color(FUR);
  for (const x of [-0.06, 0.06]) { blob(ctx, [x, 0.09, 0.09], [0.04, 0.07, 0.08], { seg: 5, rings: 3 }); ctx.color(BELLY); blob(ctx, [x * 0.85, 0.014, 0.05], [0.025, 0.015, 0.07], { seg: 4, rings: 2 }); ctx.color(FUR); }
  ctx.bone('legF'); for (const x of [-0.03, 0.03]) cone(ctx, [x, 0.1, -0.07], [x, 0.0, -0.09], 0.018, 4);
  ctx.bone('head'); ctx.color(BELLY); blob(ctx, [0, 0.2, -0.16], [0.032, 0.03, 0.03], { seg: 5, rings: 3 });
  ctx.color(PINK); blob(ctx, [0, 0.212, -0.188], [0.01, 0.008, 0.007], { seg: 4, rings: 2 });
  ctx.color(DARK); for (const x of [-1, 1]) blob(ctx, [x * 0.04, 0.235, -0.125], [0.012, 0.014, 0.012], { seg: 4, rings: 2 });
}
export function collider() { return null; }
