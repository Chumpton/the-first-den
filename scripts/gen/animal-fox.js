// Red fox: russet coat, white bib and tail tip, black socks and big black-backed ears.
import { build, skeleton as rig } from './lib-quadruped.js';
export const P = {
  L: 0.24, legX: 0.055, zf: -0.2, zb: 0.2, rFront: 0.026, rBack: 0.038, rFoot: 0.016, sock: 2,
  body: [[-0.31, 0.32, 0.045, 0.055], [-0.26, 0.33, 0.075, 0.09], [-0.12, 0.33, 0.085, 0.095], [0.08, 0.32, 0.075, 0.085], [0.22, 0.33, 0.075, 0.085], [0.3, 0.34, 0.05, 0.05], [0.34, 0.35, 0.022, 0.022]],
  neck: [[0.35, -0.24, 0.06], [0.41, -0.29, 0.052], [0.46, -0.31, 0.045]],
  head: [[-0.29, 0.46, 0.055, 0.055], [-0.35, 0.465, 0.066, 0.05], [-0.42, 0.44, 0.03, 0.028], [-0.475, 0.43, 0.016, 0.016]], nose: [-0.495, 0.43], snoutFrom: 2, eyeRing: 1, eye: 0.011,
  ears: { x: 0.03, y: 0.5, z: -0.32, tx: 0.06, ty: 0.61, tz: -0.31, w: 0.024 },
  tail: [[0.35, 0.32, 0.03], [0.33, 0.42, 0.05], [0.27, 0.54, 0.065], [0.21, 0.64, 0.05]], tailEnd: [0.17, 0.71], tailTipFrom: 3,
  col: { top: 'oklch(0.6 0.16 45)', coat: 'oklch(0.68 0.16 50)', belly: 'oklch(0.95 0.02 85)', dark: 'oklch(0.28 0.03 40)', snout: 'oklch(0.95 0.02 85)', snoutTop: 'oklch(0.66 0.16 50)',
    tip: 'oklch(0.96 0.015 85)', throat: 'oklch(0.95 0.02 85)', earIn: 'oklch(0.3 0.03 40)', earOut: 'oklch(0.28 0.03 40)' },
};
export function skeleton() { return rig(P); }
export function geometry(ctx) { build(ctx, P); }
