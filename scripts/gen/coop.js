// Chicken coop + run: a raised sage hen-house (shingled gable roof, pop door, ramp, nest box — its lid is the child row
// scripts/gen/coop-lid.js) at the west end of a 5 x 4 m wire run; the gate leaf is its own kinematic row (coop-gate.js).
// Origin = ground at the site centre, front (gate, nest box) toward +Z. The flock walks inside RUN (homestead.yml).
import { box, solid, Q } from '../lib/road-solid.js';
import { bar, cyl, wires, paint, TX, INK } from './coop-kit.js';
export const C = { x0: -3.5, x1: -1.5, hz: 1.1, fy: 0.72, wt: 1.95, ridge: 2.65, R: { x0: -1.5, x1: 3.5, z0: -2, z1: 2, h: 2.1 } };
const SIDES = () => { const R = C.R; return [
  { pts: [-1.5, -0.5, 0.5, 1.7, 2.6, 3.5], fix: R.z1, alongX: true, gap: [0.5, 1.7] },
  { pts: [-1.5, -0.25, 1.0, 2.25, 3.5], fix: R.z0, alongX: true },
  { pts: [-2, -0.67, 0.67, 2], fix: R.x1, alongX: false },
  { pts: [-2, -1.1], fix: R.x0, alongX: false }, { pts: [1.1, 2], fix: R.x0, alongX: false },
]; };
export function geometry(ctx) {
  const L = ctx.lod, { x0, x1, hz, fy, wt, ridge, R } = C, slope = (ridge - wt) / hz, ov = 0.25, ex0 = x0 - 0.18, ex1 = x1 + 0.18;
  ctx.flat();
  // hen-house body: one pentagon prism, sage boards
  paint(ctx, TX.sage, 'oklch(0.97 0.02 140)');
  const sec = (x) => [[x, fy, -hz + 0.03], [x, fy, hz - 0.03], [x, wt, hz - 0.03], [x, ridge - 0.04, 0], [x, wt, -hz + 0.03]];
  solid(ctx, sec(x0 + 0.03), sec(x1 - 0.03));
  // roof slabs
  for (const s of [-1, 1]) {
    const ez = s * (hz + ov), ey = wt - ov * slope, pl = (o) => [[ex0, ridge + o, 0], [ex1, ridge + o, 0], [ex1, ey + o, ez], [ex0, ey + o, ez]];
    paint(ctx, L <= 3 ? TX.timber : TX.shingle, INK.wood); solid(ctx, pl(0), pl(0.05));
    if (L <= 3) { // shingle courses: each lifted at its lower edge, overlapping the one below
      paint(ctx, TX.shingle, INK.wood);
      const N = L <= 2 ? 9 : 5, at = (t, lift) => [ey + (ridge - ey) * t + 0.05 + lift, ez * (1 - t)], o = [(ex0 + ex1) / 2, ridge - 1.5, 0];
      for (let k = 0; k < N; k++) {
        const t0 = k / N, t1 = Math.min(1, (k + 1.4) / N), [ya, za] = at(t0, 0.032), [yb, zb] = at(t1, 0.004), [yc] = at(t0, 0);
        ctx.color(`oklch(${(0.9 + ctx.random() * 0.08).toFixed(3)} 0.02 ${60 + ctx.random() * 20})`);
        Q(ctx, [ex0, ya, za], [ex1, ya, za], [ex1, yb, zb], [ex0, yb, zb], o);
        Q(ctx, [ex0, yc, za], [ex1, yc, za], [ex1, ya, za], [ex0, ya, za], [o[0], o[1], 0]);
      }
    }
  }
  paint(ctx, TX.oak, INK.oak); bar(ctx, [ex0, ridge + 0.09, 0], [ex1, ridge + 0.09, 0], 0.14, 0.06);
  // nest box on the front wall (lid = child row)
  paint(ctx, TX.sage, 'oklch(0.97 0.02 140)');
  const ns = (x) => [[x, 0.9, hz - 0.02], [x, 0.9, hz + 0.5], [x, 1.25, hz + 0.5], [x, 1.45, hz - 0.02]];
  solid(ctx, ns(-3.25), ns(-2.05));
  // run top rails + corner posts (every level)
  paint(ctx, TX.timber, INK.wood);
  const post = (x, z, h = R.h) => box(ctx, x - 0.045, -0.1, z - 0.045, x + 0.045, h, z + 0.045);
  for (const [x, z] of [[R.x0, R.z0], [R.x1, R.z0], [R.x1, R.z1], [R.x0, R.z1]]) post(x, z);
  const top = R.h - 0.04;
  bar(ctx, [R.x0, top, R.z0], [R.x1, top, R.z0], 0.08); bar(ctx, [R.x0, top, R.z1], [R.x1, top, R.z1], 0.08); bar(ctx, [R.x1, top, R.z0], [R.x1, top, R.z1], 0.08);
  bar(ctx, [R.x0, top, R.z0], [R.x0, top, -hz], 0.08); bar(ctx, [R.x0, top, hz], [R.x0, top, R.z1], 0.08);
  if (L >= 4) return;
  // legs, floor, corner boards
  for (const x of [x0 + 0.1, x1 - 0.1]) for (const z of [-hz + 0.1, hz - 0.1]) box(ctx, x - 0.05, -0.15, z - 0.05, x + 0.05, fy, z + 0.05);
  paint(ctx, TX.oak, INK.oak); box(ctx, x0 - 0.02, fy - 0.08, -hz - 0.02, x1 + 0.02, fy, hz + 0.02);
  // ramp with cleats
  bar(ctx, [x1 + 0.02, fy - 0.03, 0], [x1 + 1.25, 0.0, 0], 0.36, 0.04);
  if (L <= 2) for (let k = 1; k < 6; k++) { const t = k / 6.2, x = x1 + 0.02 + 1.23 * t, y = fy - 0.03 - (fy - 0.03) * t + 0.035; bar(ctx, [x, y, -0.16], [x, y, 0.16], 0.03, 0.025); }
  // pop door (dark), its slide board and the back window
  paint(ctx, null, INK.dark, 0.9);
  Q(ctx, [x1 - 0.015, fy + 0.03, -0.18], [x1 - 0.015, fy + 0.03, 0.18], [x1 - 0.015, fy + 0.45, 0.18], [x1 - 0.015, fy + 0.45, -0.18], [x1 - 1, fy, 0]);
  paint(ctx, null, 'oklch(0.42 0.04 230)', 0.2);
  Q(ctx, [-2.85, 1.25, -hz + 0.015], [-2.15, 1.25, -hz + 0.015], [-2.15, 1.65, -hz + 0.015], [-2.85, 1.65, -hz + 0.015], [-2.5, 1.4, 0]);
  if (L <= 3) {
    paint(ctx, TX.oak, INK.linen);
    for (const x of [x0, x1]) for (const z of [-hz, hz]) box(ctx, x - 0.035, fy, z - 0.035, x + 0.035, wt, z + 0.035);
    box(ctx, x1 - 0.03, fy + 0.47, -0.22, x1 + 0.02, fy + 0.52, 0.22); box(ctx, x1 - 0.03, fy + 0.02, 0.18, x1 + 0.02, fy + 0.47, 0.22); box(ctx, x1 - 0.03, fy + 0.02, -0.22, x1 + 0.02, fy + 0.47, -0.18);
    box(ctx, -2.9, 1.2, -hz - 0.03, -2.1, 1.25, -hz + 0.03); box(ctx, -2.9, 1.65, -hz - 0.03, -2.1, 1.7, -hz + 0.03);
    box(ctx, -2.52, 1.25, -hz - 0.02, -2.48, 1.65, -hz + 0.02); box(ctx, -2.85, 1.43, -hz - 0.02, -2.15, 1.47, -hz + 0.02);
    paint(ctx, TX.oak, INK.oak);
    box(ctx, x1 - 0.01, fy + 0.52, -0.2, x1 + 0.025, fy + 0.9, 0.2); // raised slide door
    paint(ctx, TX.timber, INK.wood);
    for (const x of [-3.15, -2.15]) bar(ctx, [x, 0.6, hz], [x, 0.92, hz + 0.44], 0.05);
  }
  // run posts, kickboards, mesh
  paint(ctx, TX.timber, INK.wood);
  for (const S of SIDES()) for (const p of S.pts) S.alongX ? post(p, S.fix) : post(S.fix, p);
  for (const S of SIDES()) for (let i = 0; i < S.pts.length - 1; i++) {
    const a = S.pts[i], b = S.pts[i + 1]; if (S.gap && a === S.gap[0] && b === S.gap[1]) continue;
    const A = S.alongX ? [a + 0.045, S.fix] : [S.fix, a + 0.045], B = S.alongX ? [b - 0.045, S.fix] : [S.fix, b - 0.045];
    paint(ctx, TX.timber, INK.wood);
    if (S.alongX) box(ctx, A[0], 0, S.fix - 0.015, B[0], 0.2, S.fix + 0.015); else box(ctx, S.fix - 0.015, 0, A[1], S.fix + 0.015, 0.2, B[1]);
    if (L <= 2) { paint(ctx, null, INK.galv, 0.45, 0.6); wires(ctx, A, B, 0.2, R.h - 0.08, L === 1 ? 0.13 : 0.26, 0.008); }
    else { ctx.albedo(null); ctx.color(INK.galv, 0.22); ctx.quad(A[0], 0.2, A[1], B[0], 0.2, B[1], B[0], R.h - 0.08, B[1], A[0], R.h - 0.08, A[1]); }
  }
  // gate posts' header brace and corner braces
  paint(ctx, TX.timber, INK.wood);
  if (L <= 2) for (const [ax, az, bx, bz] of [[R.x1, R.z0, R.x1 - 0.5, R.z0], [R.x1, R.z0, R.x1, R.z0 + 0.5], [R.x1, R.z1, R.x1 - 0.5, R.z1], [R.x1, R.z1, R.x1, R.z1 - 0.5]])
    bar(ctx, [ax + (bx - ax) * 0.1, R.h - 0.55, az + (bz - az) * 0.1], [bx, R.h - 0.06, bz], 0.05);
  // straw floor
  paint(ctx, TX.straw, 'oklch(0.97 0.02 85)', 0.95);
  Q(ctx, [R.x0, 0.014, R.z0], [R.x1, 0.014, R.z0], [R.x1, 0.014, R.z1], [R.x0, 0.014, R.z1], [0, -1, 0]);
  if (L >= 3) return;
  // feeder trough, waterer, perch
  paint(ctx, TX.oak, INK.oak);
  for (const x of [2.6, 3.2]) box(ctx, x - 0.03, 0, 1.27, x + 0.03, 0.24, 1.33);
  const tr = (x) => [[x, 0.22, 1.2], [x, 0.22, 1.4], [x, 0.34, 1.46], [x, 0.34, 1.14]]; solid(ctx, tr(2.5), tr(3.3));
  paint(ctx, null, 'oklch(0.72 0.1 85)', 0.95); Q(ctx, [2.52, 0.341, 1.17], [3.28, 0.341, 1.17], [3.28, 0.341, 1.43], [2.52, 0.341, 1.43], [2.9, 0, 1.3]);
  paint(ctx, null, INK.galv, 0.4, 0.7);
  cyl(ctx, 2.9, 0, -1.35, 0.2, 0.05, 12); cyl(ctx, 2.9, 0.05, -1.35, 0.13, 0.3, 12); cyl(ctx, 2.9, 0.35, -1.35, 0.14, 0.06, 12, 0.03);
  paint(ctx, null, 'oklch(0.62 0.08 200)', 0.1); cyl(ctx, 2.9, 0.05, -1.35, 0.18, 0.003, 12);
  paint(ctx, TX.timber, INK.wood);
  for (const x of [0.75, 1.95]) box(ctx, x - 0.03, 0, -1.48, x + 0.03, 0.4, -1.42);
  bar(ctx, [0.6, 0.43, -1.45], [2.1, 0.43, -1.45], 0.06);
}
export function collider(ctx) {
  const { x0, x1, hz, ridge, R } = C, t = 0.05;
  box(ctx, x0 - 0.05, 0, -hz - 0.05, x1, ridge, hz + 0.05);
  box(ctx, -3.25, 0.85, hz, -2.05, 1.47, hz + 0.52);
  box(ctx, R.x0, 0, R.z0 - t, R.x1 + t, R.h, R.z0 + t);
  box(ctx, R.x0, 0, R.z1 - t, 0.545, R.h, R.z1 + t); box(ctx, 1.655, 0, R.z1 - t, R.x1 + t, R.h, R.z1 + t);
  box(ctx, 0.545, R.h - 0.1, R.z1 - t, 1.655, R.h, R.z1 + t);
  box(ctx, R.x1 - t, 0, R.z0, R.x1 + t, R.h, R.z1);
  box(ctx, R.x0 - t, 0, R.z0, R.x0 + t, R.h, -hz); box(ctx, R.x0 - t, 0, hz, R.x0 + t, R.h, R.z1);
}
