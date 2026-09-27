// Brown bear: a shoulder hump, heavy paws, round ears and a pale snout. A cub is the same bear at scale 0.55.
import { build, skeleton as rig } from './lib-quadruped.js';
export const P = {
  L: 0.52, legX: 0.19, zf: -0.42, zb: 0.45, rFront: 0.12, rBack: 0.14, rFoot: 0.095, sock: 3,
  body: [[-0.76, 0.78, 0.15, 0.17], [-0.64, 0.8, 0.28, 0.29], [-0.4, 0.83, 0.33, 0.3], [-0.1, 0.8, 0.34, 0.28], [0.25, 0.8, 0.34, 0.28], [0.5, 0.8, 0.3, 0.26], [0.66, 0.8, 0.19, 0.18], [0.73, 0.8, 0.08, 0.08]],
  neck: [[0.88, -0.55, 0.2], [0.87, -0.77, 0.17]],
  head: [[-0.74, 0.9, 0.16, 0.155], [-0.86, 0.9, 0.175, 0.15], [-0.98, 0.84, 0.1, 0.09], [-1.08, 0.82, 0.07, 0.065]], nose: [-1.115, 0.83], snoutFrom: 2, eyeRing: 1, eye: 0.02,
  ears: { x: 0.11, y: 1.02, z: -0.8, tx: 0.15, ty: 1.11, tz: -0.8, w: 0.05 },
  tail: [[0.92, 0.7, 0.05], [0.88, 0.78, 0.04]], tailEnd: [0.85, 0.8], tailTipFrom: 9,
  col: { top: 'oklch(0.4 0.06 50)', coat: 'oklch(0.48 0.07 55)', belly: 'oklch(0.42 0.06 52)', dark: 'oklch(0.28 0.03 45)', snout: 'oklch(0.68 0.07 70)',
    earIn: 'oklch(0.34 0.05 50)', earOut: 'oklch(0.4 0.06 50)', leg: 'oklch(0.42 0.06 52)' },
};
export function skeleton() { return rig(P); }
export function geometry(ctx) { build(ctx, P); }
