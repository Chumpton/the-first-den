// Tawny owl in flight pose: feet at y 0, beak to -Z, wings spread. Big round head with a pale facial disc,
// amber eyes, ear tufts; cream speckled belly; brown back; darker barred primaries. Rig: root, head, wingL/R, tail.
import { blob, cone } from './critter-mesh.js';
const C = { back: 'oklch(0.47 0.07 58)', back2: 'oklch(0.4 0.06 55)', belly: 'oklch(0.86 0.045 80)', speck: 'oklch(0.5 0.07 55)',
  disc: 'oklch(0.9 0.035 80)', ring: 'oklch(0.35 0.05 50)', eye: 'oklch(0.78 0.16 70)', pupil: 'oklch(0.12 0.01 60)',
  beak: 'oklch(0.72 0.05 85)', prim: 'oklch(0.36 0.05 55)', bar: 'oklch(0.62 0.06 70)', claw: 'oklch(0.25 0.02 60)', foot: 'oklch(0.82 0.05 85)' };
export function skeleton() {
  return { root: { pivot: [0, 0.35, 0] }, head: { parent: 'root', pivot: [0, 0.42, -0.2] },
    wingL: { parent: 'root', pivot: [-0.12, 0.42, 0] }, wingR: { parent: 'root', pivot: [0.12, 0.42, 0] }, tail: { parent: 'root', pivot: [0, 0.36, 0.2] } };
}
// a thin two-sided slab from an outline fan (first point is the hub)
function slab(ctx, pts, t) {
  for (let i = 1; i < pts.length - 1; i++) {
    let a = pts[0], b = pts[i], c = pts[i + 1];
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const ny = ab[2] * ac[0] - ab[0] * ac[2];
    if (ny < 0) { const s = b; b = c; c = s; }
    const up = (p) => [p[0], p[1] + t, p[2]], dn = (p) => [p[0], p[1] - t, p[2]];
    ctx.tri(...up(a), ...up(b), ...up(c)); ctx.tri(...dn(a), ...dn(c), ...dn(b));
  }
}
function wing(ctx, x, lo) {
  const P = (px, y, z) => [x * px, y, z];
  ctx.color(C.back);
  slab(ctx, [P(0.12, 0.42, 0.02), P(0.12, 0.42, -0.12), P(0.3, 0.435, -0.15), P(0.5, 0.445, -0.13), P(0.52, 0.44, 0.16), P(0.3, 0.425, 0.19), P(0.12, 0.42, 0.13)], 0.018);
  ctx.color(C.prim);
  slab(ctx, [P(0.5, 0.445, 0.01), P(0.5, 0.445, -0.13), P(0.7, 0.45, -0.09), P(0.86, 0.452, 0.0), P(0.84, 0.45, 0.07), P(0.74, 0.448, 0.11), P(0.62, 0.446, 0.15), P(0.5, 0.44, 0.16)], 0.012);
  if (lo) return;
  // pale bars across the primaries and a soft covert ridge
  ctx.color(C.bar);
  for (const k of [0.58, 0.68, 0.78]) slab(ctx, [P(k, 0.464, -0.07), P(k + 0.025, 0.464, -0.065), P(k + 0.02, 0.464, 0.1), P(k - 0.005, 0.464, 0.1)], 0.002);
  ctx.color(C.back2); blob(ctx, [x * 0.28, 0.445, -0.08], [0.17, 0.035, 0.08], { seg: 6, rings: 3 });
}
export function geometry(ctx) {
  const lo = ctx.lod >= 4, s = ctx.lod >= 3 ? 7 : 9;
  ctx.smooth(); ctx.roughness(0.9);
  ctx.bone('root');
  ctx.color(C.back); blob(ctx, [0, 0.37, 0.02], [0.17, 0.15, 0.27], { seg: s, rings: 5 });
  ctx.color(C.belly); blob(ctx, [0, 0.31, -0.03], [0.15, 0.11, 0.22], { seg: s, rings: 4 });
  if (!lo) {
    ctx.color(C.speck);
    for (const [px, pz] of [[-0.06, -0.12], [0.05, -0.08], [-0.02, 0.0], [0.07, 0.06], [-0.07, 0.08], [0.0, -0.18], [0.03, 0.13]]) blob(ctx, [px, 0.205, pz], [0.018, 0.008, 0.03], { seg: 4, rings: 2 });
    // talons tucked under
    for (const x of [-0.06, 0.06]) { ctx.color(C.foot); blob(ctx, [x, 0.22, 0.12], [0.03, 0.03, 0.045], { seg: 5, rings: 3 });
      ctx.color(C.claw); for (const dx of [-0.015, 0.015]) cone(ctx, [x + dx, 0.21, 0.15], [x + dx, 0.19, 0.2], 0.008, 3); }
  }
  ctx.bone('head');
  ctx.color(C.back); blob(ctx, [0, 0.47, -0.27], [0.15, 0.14, 0.14], { seg: s, rings: 5 });
  ctx.color(C.ring); blob(ctx, [0, 0.46, -0.365], [0.13, 0.115, 0.04], { seg: s, rings: 4 });
  ctx.color(C.disc); for (const x of [-1, 1]) blob(ctx, [x * 0.055, 0.465, -0.385], [0.06, 0.07, 0.03], { seg: 7, rings: 4 });
  ctx.color(C.eye); for (const x of [-1, 1]) blob(ctx, [x * 0.052, 0.475, -0.405], [0.028, 0.028, 0.016], { seg: 7, rings: 3 });
  ctx.color(C.pupil); for (const x of [-1, 1]) blob(ctx, [x * 0.052, 0.475, -0.418], [0.014, 0.014, 0.008], { seg: 6, rings: 3 });
  ctx.color(C.beak); cone(ctx, [0, 0.445, -0.4], [0, 0.405, -0.43], 0.016, 4);
  ctx.color(C.back2); for (const x of [-1, 1]) cone(ctx, [x * 0.085, 0.57, -0.3], [x * 0.12, 0.66, -0.27], 0.03, 4);
  if (!lo) { ctx.color('oklch(0.98 0.01 90)'); for (const x of [-1, 1]) blob(ctx, [x * 0.045, 0.485, -0.42], [0.006, 0.006, 0.003], { seg: 4, rings: 2 }); }
  ctx.flat();
  ctx.bone('wingL'); wing(ctx, -1, lo);
  ctx.bone('wingR'); wing(ctx, 1, lo);
  ctx.bone('tail'); ctx.color(C.back2);
  slab(ctx, [[0, 0.36, 0.2], [-0.07, 0.36, 0.22], [-0.13, 0.37, 0.41], [-0.05, 0.37, 0.44], [0.05, 0.37, 0.44], [0.13, 0.37, 0.41], [0.07, 0.36, 0.22]], 0.012);
  ctx.bone(null);
}
export function collider() { return null; }
