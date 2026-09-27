// Pasture alpaca: long upright neck, fluffy topknot and chest, banana ears; params.coat sets the fleece (fawn, cream, walnut).
import { build, skeleton as rig } from './lib-quadruped.js';
import { blob } from '../lib/yard-kit.js';
const base = {
  L: 0.6, legX: 0.14, zf: -0.32, zb: 0.32, rFront: 0.06, rBack: 0.075, rFoot: 0.032, sock: 9,
  body: [[-0.5, 0.95, 0.13, 0.14], [-0.42, 0.95, 0.24, 0.26], [-0.15, 0.94, 0.28, 0.29], [0.15, 0.95, 0.28, 0.29], [0.38, 0.97, 0.23, 0.25], [0.49, 0.97, 0.11, 0.12]],
  neck: [[1.05, -0.4, 0.14], [1.3, -0.46, 0.12], [1.55, -0.5, 0.105], [1.72, -0.5, 0.1]], neckW: 1,
  head: [[-0.47, 1.8, 0.09, 0.1], [-0.55, 1.8, 0.085, 0.09], [-0.65, 1.74, 0.06, 0.065], [-0.71, 1.71, 0.045, 0.05]], nose: [-0.74, 1.7], snoutFrom: 3, eyeRing: 1, eye: 0.018,
  ears: { x: 0.05, y: 1.88, z: -0.46, tx: 0.08, ty: 2.04, tz: -0.47, w: 0.024 },
  tail: [[0.92, 0.48, 0.055], [0.87, 0.54, 0.045]], tailEnd: [0.8, 0.57], tailTipFrom: 9,
};
export const P = base;
export function skeleton() { return rig(base); }
export function geometry(ctx) {
  const coat = ctx.params.coat || 'oklch(0.74 0.085 65)', top = ctx.params.top || coat;
  const col = { top, coat, belly: coat, leg: coat, dark: 'oklch(0.24 0.02 50)', snout: ctx.params.snout || 'oklch(0.36 0.03 50)', snoutTop: coat, throat: coat,
    rump: coat, tailUnder: coat, earIn: 'oklch(0.5 0.05 45)', earOut: coat };
  const { lod } = build(ctx, { ...base, col });
  if (lod <= 3) {
    ctx.color(top); ctx.roughness(1);
    ctx.bone('head'); blob(ctx, 0, 1.86, -0.47, 0.1, 0.1, 0.09, lod <= 2 ? 6 : 4);
    ctx.bone('neck'); blob(ctx, 0, 0.98, -0.47, 0.16, 0.22, 0.14, lod <= 2 ? 6 : 4);
    if (lod <= 2) { ctx.bone('root'); for (const z of [-0.2, 0.15]) blob(ctx, 0, 1.12, z, 0.22, 0.14, 0.2, 5); }
    ctx.bone(null);
  }
}
