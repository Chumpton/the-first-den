// A colossal armoured knight in white stone with gold trim, both hands resting on a great sword planted before him.
// Origin at his feet on the plinth top, facing −z. params.h = total height (default 11 m); one mesh, instanced per row.
import { lathe, box, beam, blob, Q, RC, stone, gold, flat, L, TAU } from '../lib/royal-kit.js';
// a tube through centre points with radii [rx, rz] per ring, rings perpendicular to Y (a standing limb/torso)
function col(P, rings, n) {
  const R = rings.map(([x, y, z, rx, rz]) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; a.push([x + Math.cos(t) * rx, y, z + Math.sin(t) * rz]); } return a; });
  for (let k = 0; k < R.length - 1; k++) { const o = [(rings[k][0] + rings[k + 1][0]) / 2, (rings[k][1] + rings[k + 1][1]) / 2, (rings[k][2] + rings[k + 1][2]) / 2];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(P, R[k][i], R[k][j], R[k + 1][j], R[k + 1][i], o); } }
  const tp = rings[rings.length - 1], bt = rings[0];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; P.tri(tp[0], tp[1], tp[2], ...R[R.length - 1][j], ...R[R.length - 1][i]); P.tri(bt[0], bt[1], bt[2], ...R[0][i], ...R[0][j]); }
}
export function geometry(ctx) {
  const { h = 11 } = ctx.params, s = h / 11, lod = L(ctx), n = lod <= 2 ? 10 : lod === 3 ? 7 : 5;
  const P = { lod, quad: (...a) => ctx.quad(...a.map((v) => v * s)), tri: (...a) => ctx.tri(...a.map((v) => v * s)) };
  ctx.flat(); stone(ctx);
  if (lod >= 5) { col(P, [[0, 0, 0, 1.1, 0.8], [0, 4.5, 0, 1.3, 0.8], [0, 8.2, 0, 1.9, 1.1], [0, 9.2, 0, 0.8, 0.7], [0, 11, 0, 0.1, 0.1]], 5); return; }
  for (const x of [-0.55, 0.55]) { // legs: greaves, knees, cuisses
    col(P, [[x, 0, -0.15, 0.42, 0.62], [x, 0.4, -0.05, 0.38, 0.45], [x, 2.2, 0, 0.36, 0.38], [x, 2.6, -0.05, 0.42, 0.42], [x, 4.3, 0, 0.5, 0.48]], n);
    if (lod <= 3) { gold(ctx); col(P, [[x, 2.3, -0.12, 0.3, 0.32], [x, 2.55, -0.25, 0.32, 0.3], [x, 2.75, -0.12, 0.26, 0.26]], n); stone(ctx); }
  }
  col(P, [[0, 4.1, 0, 1.2, 0.72], [0, 4.6, 0, 1.12, 0.7], [0, 5.6, 0, 1.05, 0.66], [0, 7.2, -0.05, 1.35, 0.8], [0, 7.9, 0, 1.2, 0.72], [0, 8.2, 0, 0.55, 0.5]], n); // hips, waist, breastplate
  // tasset skirt and cloak
  flat(ctx, RC.stone2); col(P, [[0, 3.3, 0, 1.25, 0.85], [0, 4.7, 0, 1.15, 0.75]], n);
  if (lod <= 3) { flat(ctx, 'oklch(0.9 0.02 255)'); for (let i = 0; i < 6; i++) { const x = -1.2 + i * 0.48; Q(P, [x, 7.8, 0.72], [x + 0.48, 7.8, 0.72], [x + 0.62 + i * 0.05, 0.4, 1.1 + (i % 2) * 0.12], [x - 0.08 - i * 0.05, 0.4, 1.0 + (i % 2) * 0.1], [0, 4, 0]); } }
  gold(ctx); col(P, [[0, 4.55, -0.02, 1.15, 0.73], [0, 4.75, -0.02, 1.15, 0.73]], n); // belt
  if (lod <= 2) { lathe(P, [[0.35, 6.6], [0.42, 6.8], [0.35, 7.0]], 8, 0, 0, -0.78); col(P, [[0, 7.6, -0.08, 1.33, 0.79], [0, 7.72, -0.08, 1.3, 0.78]], n); }
  stone(ctx);
  for (const x of [-1, 1]) { // pauldrons, arms reaching down-forward to the sword hilt at (0, 5.3, -1.1)
    blob(P, x * 1.35, 7.45, 0, 0.72, 0.62, 0.72, n > 7 ? 8 : 5);
    if (lod <= 3) { gold(ctx); blob(P, x * 1.4, 7.62, 0, 0.55, 0.48, 0.58, n > 7 ? 8 : 5); stone(ctx); }
    beam(P, [x * 1.45, 7.2, 0], [x * 1.25, 5.9, -0.45], 0.62, 0.62);
    beam(P, [x * 1.25, 5.9, -0.45], [x * 0.3, 5.4, -1.05], 0.52, 0.52);
    blob(P, x * 0.25, 5.3, -1.1, 0.32, 0.3, 0.32, 5); // gauntlets
  }
  // helm with crest and visor
  col(P, [[0, 8.1, 0, 0.5, 0.5], [0, 8.6, -0.05, 0.62, 0.65], [0, 9.4, -0.02, 0.6, 0.62], [0, 9.9, 0, 0.35, 0.4], [0, 10.05, 0, 0.1, 0.1]], n);
  if (lod <= 3) { gold(ctx); box(P, -0.06, 9.3, -0.55, 0.06, 10.5, 0.55); flat(ctx, RC.iron); box(P, -0.45, 9.0, -0.68, 0.45, 9.12, -0.6); }
  // the great sword planted before him: blade, crossguard, grip, pommel
  flat(ctx, 'oklch(0.9 0.01 240)'); ctx.metalness(0.4);
  Q(P, [-0.18, 0.2, -1.12], [0.18, 0.2, -1.12], [0.22, 4.55, -1.12], [-0.22, 4.55, -1.12], [0, 2, -1]); Q(P, [-0.18, 0.2, -1.2], [0.18, 0.2, -1.2], [0.22, 4.55, -1.2], [-0.22, 4.55, -1.2], [0, 2, -1.3]);
  ctx.tri(0 * s, 0, -1.16 * s, 0.18 * s, 0.2 * s, -1.12 * s, -0.18 * s, 0.2 * s, -1.12 * s);
  gold(ctx); box(P, -1.1, 4.55, -1.28, 1.1, 4.8, -1.04); box(P, -0.12, 4.8, -1.22, 0.12, 5.6, -1.1); blob(P, 0, 5.7, -1.16, 0.2, 0.2, 0.2, 5);
}
export function collider() { return { kind: 'box', width: 3.6, height: 11, depth: 2.6 }; }
