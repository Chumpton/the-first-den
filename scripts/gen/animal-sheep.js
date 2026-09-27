// Pasture sheep: a round linen fleece, a dark face and legs; params.coat recolours the fleece (a black sheep), params.face the face.
import { build, skeleton as rig } from './lib-quadruped.js';
import { blob } from '../lib/yard-kit.js';
const base = {
  L: 0.36, legX: 0.13, zf: -0.28, zb: 0.3, rFront: 0.05, rBack: 0.06, rFoot: 0.026, sock: 2,
  body: [[-0.47, 0.62, 0.14, 0.14], [-0.38, 0.63, 0.26, 0.26], [-0.14, 0.64, 0.31, 0.3], [0.12, 0.64, 0.32, 0.31], [0.34, 0.63, 0.27, 0.27], [0.47, 0.62, 0.13, 0.14]],
  neck: [[0.74, -0.36, 0.13], [0.82, -0.48, 0.1]], neckW: 0.9,
  head: [[-0.48, 0.88, 0.085, 0.095], [-0.57, 0.87, 0.08, 0.085], [-0.67, 0.81, 0.06, 0.065], [-0.73, 0.77, 0.042, 0.048]], nose: [-0.76, 0.75], snoutFrom: 1, eyeRing: 1, eye: 0.014,
  ears: { x: 0.07, y: 0.9, z: -0.54, tx: 0.18, ty: 0.86, tz: -0.56, w: 0.028 },
  tail: [[0.66, 0.46, 0.05], [0.58, 0.51, 0.04]], tailEnd: [0.52, 0.53], tailTipFrom: 9,
};
export const P = base;
export function skeleton() { return rig(base); }
export function geometry(ctx) {
  const wool = ctx.params.coat || 'oklch(0.94 0.025 85)', face = ctx.params.face || 'oklch(0.3 0.02 50)';
  const col = { top: wool, coat: wool, belly: 'oklch(0.84 0.03 80)', leg: face, dark: 'oklch(0.2 0.01 50)', snout: face, snoutTop: face, throat: wool,
    rump: wool, tailUnder: wool, earIn: 'oklch(0.62 0.06 30)', earOut: face };
  const { lod } = build(ctx, { ...base, col });
  if (lod <= 2) {
    ctx.bone('root'); ctx.color(wool); ctx.roughness(1);
    for (const [x, y, z, r] of [[-0.2, 0.84, -0.18, 0.15], [0.2, 0.84, -0.12, 0.15], [0, 0.88, 0.08, 0.17], [-0.21, 0.8, 0.22, 0.14], [0.21, 0.8, 0.24, 0.14], [0, 0.82, 0.36, 0.12]]) blob(ctx, x, y - r * 0.4, z, r, r * 0.8, r, 5);
    ctx.bone('head'); blob(ctx, 0, 0.93, -0.5, 0.08, 0.06, 0.07, 5);
    ctx.bone(null);
  }
}
