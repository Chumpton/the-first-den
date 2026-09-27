// Grey-and-cream wolf: cream muzzle, throat and belly, pricked ears, a thick ruff and a bushy cream-tipped tail.
import { build, skeleton as rig } from './lib-quadruped.js';
export const P = {
  L: 0.5, legX: 0.1, zf: -0.32, zb: 0.34, rFront: 0.05, rBack: 0.07, rFoot: 0.03, sock: 99,
  body: [[-0.52, 0.66, 0.09, 0.1], [-0.44, 0.67, 0.15, 0.18], [-0.22, 0.66, 0.16, 0.19], [0.08, 0.63, 0.13, 0.15], [0.34, 0.64, 0.13, 0.15], [0.5, 0.66, 0.1, 0.11], [0.57, 0.68, 0.05, 0.06]],
  neck: [[0.7, -0.4, 0.15], [0.8, -0.5, 0.13], [0.88, -0.57, 0.1]], neckW: 1.1,
  head: [[-0.55, 0.89, 0.1, 0.1], [-0.64, 0.9, 0.11, 0.095], [-0.74, 0.85, 0.06, 0.055], [-0.84, 0.83, 0.042, 0.04]], nose: [-0.875, 0.83], snoutFrom: 2, eyeRing: 1, eye: 0.016,
  ears: { x: 0.055, y: 0.96, z: -0.6, tx: 0.085, ty: 1.1, tz: -0.58, w: 0.035 },
  tail: [[0.7, 0.55, 0.05], [0.6, 0.68, 0.075], [0.46, 0.8, 0.08], [0.36, 0.87, 0.05]], tailEnd: [0.31, 0.9], tailTipFrom: 3,
  col: { top: 'oklch(0.5 0.015 250)', coat: 'oklch(0.67 0.015 250)', belly: 'oklch(0.92 0.025 85)', dark: 'oklch(0.25 0.01 250)', snout: 'oklch(0.9 0.025 85)', snoutTop: 'oklch(0.64 0.015 250)',
    tip: 'oklch(0.93 0.02 85)', throat: 'oklch(0.92 0.025 85)', earIn: 'oklch(0.85 0.03 60)', earOut: 'oklch(0.45 0.015 250)', leg: 'oklch(0.72 0.015 250)' },
};
export function skeleton() { return rig(P); }
export function geometry(ctx) { build(ctx, P); }
