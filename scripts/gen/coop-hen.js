// A hen (or the rooster): params.variant buff | red | white | speckle | rooster. Feet at y 0, beak to -Z, ~0.45 m tall.
// Rig: root (hips) -> legL/legR, body -> head, tail, wingL/wingR. Clips in anim/coop-hen.yml; scripts/coop-flock.js drives them.
import { blob, cone, plate } from './critter-mesh.js';
const LOOKS = {
  buff: { body: 'oklch(0.8 0.1 72)', hack: 'oklch(0.85 0.1 78)', wing: 'oklch(0.72 0.1 65)', tail: 'oklch(0.66 0.1 60)' },
  red: { body: 'oklch(0.5 0.12 42)', hack: 'oklch(0.63 0.13 55)', wing: 'oklch(0.44 0.1 40)', tail: 'oklch(0.3 0.04 40)' },
  white: { body: 'oklch(0.96 0.01 90)', hack: 'oklch(0.98 0.01 90)', wing: 'oklch(0.91 0.015 85)', tail: 'oklch(0.94 0.01 90)' },
  speckle: { body: 'oklch(0.36 0.02 250)', hack: 'oklch(0.9 0.01 90)', wing: 'oklch(0.3 0.02 250)', tail: 'oklch(0.22 0.02 200)' },
  rooster: { body: 'oklch(0.48 0.14 36)', hack: 'oklch(0.75 0.14 70)', wing: 'oklch(0.4 0.12 32)', tail: 'oklch(0.28 0.07 165)' },
};
export function skeleton() {
  return { root: { pivot: [0, 0.15, 0] }, body: { parent: 'root', pivot: [0, 0.2, 0] }, head: { parent: 'body', pivot: [0, 0.3, -0.09] },
    tail: { parent: 'body', pivot: [0, 0.28, 0.12] }, wingL: { parent: 'body', pivot: [-0.1, 0.28, -0.04] }, wingR: { parent: 'body', pivot: [0.1, 0.28, -0.04] },
    legL: { parent: 'root', pivot: [-0.045, 0.15, 0] }, legR: { parent: 'root', pivot: [0.045, 0.15, 0] } };
}
export function geometry(ctx) {
  const V = ctx.params.variant || 'buff', K = LOOKS[V] || LOOKS.buff, roo = V === 'rooster', lo = ctx.lod >= 4, seg = lo ? 4 : 6, rings = lo ? 3 : 4;
  ctx.flat(); ctx.roughness(0.9);
  ctx.bone('body'); ctx.color(K.body); blob(ctx, [0, 0.24, 0.02], [0.105, 0.1, 0.15], { seg, rings, pitch: -12 });
  ctx.color(K.hack); blob(ctx, [0, 0.25, -0.08], [0.085, 0.09, 0.07], { seg, rings: 3 });
  ctx.bone('head'); blob(ctx, [0, 0.33, -0.1], [0.045, 0.07, 0.045], { seg: lo ? 4 : 5, rings: 3, pitch: 15 });
  blob(ctx, [0, 0.405, -0.12], [0.042, 0.042, 0.048], { seg: lo ? 4 : 5, rings: 3 });
  ctx.color('oklch(0.8 0.12 85)'); cone(ctx, [0, 0.4, -0.16], [0, 0.388, -0.205], 0.014, 4);
  ctx.color('oklch(0.56 0.2 27)');
  const nc = roo ? 5 : 3; for (let k = 0; k < nc; k++) { const z = -0.15 + k * 0.02, h = (roo ? 0.065 : 0.035) * (1 - Math.abs(k - (nc - 1) / 2) / nc); cone(ctx, [0, 0.438, z], [0, 0.44 + h, z + 0.008], roo ? 0.015 : 0.012, 3); }
  blob(ctx, [0, 0.365, -0.158], [0.012, roo ? 0.03 : 0.018, 0.012], { seg: 4, rings: 2 });
  ctx.bone('tail'); ctx.color(K.tail);
  if (roo) { for (const [x, h, z] of [[-0.02, 0.56, 0.3], [0.02, 0.58, 0.28], [0, 0.5, 0.36], [-0.035, 0.46, 0.36], [0.035, 0.47, 0.35]]) { cone(ctx, [x * 0.5, 0.3, 0.13], [x, h, z - 0.06], 0.035, 3); if (!lo) cone(ctx, [x, h, z - 0.06], [x * 1.2, h - 0.12, z + 0.06], 0.02, 3); } }
  else blob(ctx, [0, 0.34, 0.15], [0.045, 0.085, 0.06], { seg: lo ? 4 : 5, rings: 3, pitch: 35 });
  ctx.color(K.wing);
  ctx.bone('wingL'); blob(ctx, [-0.1, 0.24, 0.02], [0.03, 0.07, 0.115], { seg: lo ? 4 : 5, rings: 3, pitch: -12 });
  ctx.bone('wingR'); blob(ctx, [0.1, 0.24, 0.02], [0.03, 0.07, 0.115], { seg: lo ? 4 : 5, rings: 3, pitch: -12 });
  ctx.color('oklch(0.78 0.13 88)');
  for (const [b, x] of [['legL', -0.045], ['legR', 0.045]]) {
    ctx.bone(b); cone(ctx, [x, 0.165, 0], [x, 0.008, 0.004], 0.014, 3);
    if (!lo) for (const [dx, dz] of [[-0.03, -0.05], [0, -0.06], [0.03, -0.05], [0, 0.03]]) plate(ctx, [[x - 0.006, 0.006, 0], [x + 0.006, 0.006, 0], [x + dx, 0.004, dz]]);
  }
  if (lo) return;
  ctx.bone('head'); ctx.color('oklch(0.15 0.01 60)'); for (const x of [-1, 1]) blob(ctx, [x * 0.039, 0.41, -0.132], [0.007, 0.008, 0.007], { seg: 4, rings: 2 });
}
export function collider() { return null; }
