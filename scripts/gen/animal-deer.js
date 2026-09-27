// Red deer: long legs, cream rump and belly, big ears; params.antlers = 1 grows a stag's rack, params.spots = 1 dapples a fawn (spawn it at scale 0.6).
import { build, skeleton as rig, spots, tube } from './lib-quadruped.js';
export const P = {
  L: 0.78, legX: 0.13, zf: -0.42, zb: 0.44, rFront: 0.065, rBack: 0.095, rFoot: 0.028, sock: 3,
  body: [[-0.68, 1.0, 0.1, 0.12], [-0.58, 0.98, 0.18, 0.22], [-0.32, 0.97, 0.21, 0.25], [0.02, 0.96, 0.2, 0.23], [0.38, 0.99, 0.2, 0.23], [0.6, 1.0, 0.16, 0.19], [0.72, 1.03, 0.07, 0.08]],
  neck: [[1.02, -0.5, 0.12], [1.32, -0.64, 0.085], [1.6, -0.74, 0.07]],
  head: [[-0.7, 1.63, 0.075, 0.085], [-0.8, 1.64, 0.085, 0.08], [-0.93, 1.58, 0.055, 0.055], [-1.0, 1.55, 0.035, 0.035]], nose: [-1.03, 1.545], snoutFrom: 2, eyeRing: 1, eye: 0.018,
  ears: { x: 0.06, y: 1.69, z: -0.74, tx: 0.2, ty: 1.78, tz: -0.71, w: 0.035 },
  tail: [[1.07, 0.7, 0.045], [1.0, 0.78, 0.04]], tailEnd: [0.93, 0.81], tailTipFrom: 9,
  col: { top: 'oklch(0.52 0.1 48)', coat: 'oklch(0.61 0.11 52)', belly: 'oklch(0.87 0.04 80)', dark: 'oklch(0.27 0.03 50)', snout: 'oklch(0.8 0.04 75)', snoutTop: 'oklch(0.58 0.09 52)',
    rump: 'oklch(0.9 0.03 85)', tailUnder: 'oklch(0.92 0.03 85)', throat: 'oklch(0.78 0.05 70)', earIn: 'oklch(0.84 0.05 60)', earOut: 'oklch(0.55 0.1 50)' },
};
export function skeleton() { return rig(P); }
const beam = (side) => [[side * 0.045, 1.7, -0.72], [side * 0.12, 1.87, -0.69], [side * 0.2, 2.03, -0.63], [side * 0.26, 2.16, -0.58]];
export function geometry(ctx) {
  const { lod, D } = build(ctx, P);
  if (ctx.params.spots && D.spots) {
    const list = [];
    for (const side of [-1, 1]) for (let i = 0; i < 7; i++) list.push([-0.45 + i * 0.14, 0.75 + (i % 2) * 0.35, side]);
    spots(ctx, P, list, 0.028, 'oklch(0.94 0.03 85)');
  }
  if (ctx.params.antlers && D.antler) {
    ctx.bone('head'); ctx.color('oklch(0.84 0.045 82)'); ctx.roughness(0.7);
    const s4 = D.tines ? 4 : 3;
    for (const side of [-1, 1]) {
      const b = beam(side);
      tube(ctx, (lod >= 4 ? [b[0], b[3]] : b).map((c, i, a) => ({ c, rx: 0.024 - 0.012 * (i / (a.length - 1)), ry: 0.024 - 0.012 * (i / (a.length - 1)) })), { sides: s4, tip: [side * 0.29, 2.22, -0.55] });
      if (D.tines) for (const [from, to] of [[b[1], [side * 0.15, 1.95, -0.85]], [b[2], [side * 0.3, 2.1, -0.72]], [b[3], [side * 0.2, 2.26, -0.52]]])
        tube(ctx, [{ c: from, rx: 0.015, ry: 0.015 }, { c: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], rx: 0.011, ry: 0.011 }], { sides: 3, tip: to });
    }
    ctx.bone(null);
  }
}
