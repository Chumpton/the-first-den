// Dune, the family German Shepherd: tan/red-gold coat, black saddle and muzzle, cream-tan legs and belly, big pricked ears,
// a deep chest and sloping back, a long bushy tail carried low, and a red collar with a tiny gold tag on the neck bone.
import { build, skeleton as rig, tube } from './lib-quadruped.js';
export const P = {
  L: 0.36, legX: 0.085, zf: -0.26, zb: 0.27, rFront: 0.042, rBack: 0.058, rFoot: 0.026, sock: 99,
  body: [[-0.43, 0.5, 0.07, 0.08], [-0.36, 0.49, 0.12, 0.15], [-0.18, 0.5, 0.125, 0.14], [0.04, 0.5, 0.1, 0.1], [0.24, 0.47, 0.105, 0.105], [0.36, 0.45, 0.08, 0.085], [0.42, 0.44, 0.04, 0.045]],
  neck: [[0.56, -0.34, 0.1], [0.65, -0.42, 0.085], [0.72, -0.47, 0.07]], neckW: 1,
  head: [[-0.45, 0.75, 0.075, 0.075], [-0.53, 0.76, 0.08, 0.068], [-0.62, 0.72, 0.045, 0.042], [-0.7, 0.705, 0.03, 0.028]], nose: [-0.725, 0.705], snoutFrom: 2, eyeRing: 1, eye: 0.013,
  ears: { x: 0.038, y: 0.8, z: -0.495, tx: 0.068, ty: 0.935, tz: -0.475, w: 0.032 },
  tail: [[0.46, 0.41, 0.035], [0.37, 0.5, 0.055], [0.25, 0.56, 0.06], [0.15, 0.58, 0.04]], tailEnd: [0.09, 0.575], tailTipFrom: 3,
  col: { top: 'oklch(0.22 0.01 50)', coat: 'oklch(0.62 0.1 60)', belly: 'oklch(0.72 0.09 70)', dark: 'oklch(0.18 0.01 50)', snout: 'oklch(0.24 0.012 50)', snoutTop: 'oklch(0.22 0.01 50)',
    tip: 'oklch(0.2 0.01 50)', throat: 'oklch(0.72 0.09 70)', earIn: 'oklch(0.66 0.08 60)', earOut: 'oklch(0.22 0.01 50)', leg: 'oklch(0.72 0.09 70)', rump: 'oklch(0.62 0.1 60)', tailUnder: 'oklch(0.6 0.09 60)' },
  collar: { from: 0.4, to: 0.62, r: 0.1, col: 'oklch(0.55 0.2 25)', tag: 'oklch(0.82 0.14 85)', tagSize: 0.02 },
};
export function skeleton() { return rig(P); }
export function geometry(ctx) {
  const { lod } = build(ctx, P);
  if (lod <= 3) collar(ctx, lod);
}
function collar(ctx, lod) {
  const C = P.collar, [a, b] = P.neck, at = (t) => [0, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  ctx.bone('neck');
  ctx.color(C.col); ctx.roughness(0.6);
  tube(ctx, [{ c: at(C.from), rx: C.r, ry: C.r }, { c: at(C.to), rx: C.r, ry: C.r }], { sides: lod <= 2 ? 8 : 6 });
  if (lod <= 2) {
    // the tag hangs at the throat, forward-down off the collar's middle
    const m = at((C.from + C.to) / 2), dy = b[0] - a[0], dz = b[1] - a[1], n = Math.hypot(dy, dz), s = C.tagSize;
    const ty = m[1] + (dz / n) * (C.r + 0.018), tz = m[2] - (dy / n) * (C.r + 0.018);
    ctx.color(C.tag); ctx.metalness(0.6); ctx.roughness(0.35);
    ctx.quad(0, ty + s, tz, -s * 0.8, ty, tz, 0, ty - s, tz, s * 0.8, ty, tz);
    ctx.metalness(0);
  }
  ctx.bone(null);
}
