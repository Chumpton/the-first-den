// The market square family, one generator by params.kind; feet at ground, metres, rows placed in local space.
// "lane":   iron lamp posts (params.lamps [[x, z]]) and the carved limestone arch over the lane mouth (params.archZ)
// "square": the paved floor (flag checker in rings, cobble bands and rings, shopfront aprons, worn path and grime:
//           params.floor, params.fronts, params.wear), benches, planters, trees in stone tubs, bunting poles and pennants
// "market": linen-awning stalls (params.stalls [{ x, z, awn, goods, hang, fx, fz }], each turned to face (fx, fz), default the centre)
//           and island dressing (params.props [{ k: rugs | barrels | sacks | stack, x, z, yaw, goods }])
import { TAU, COL, FLOWERS, paint, XF, solid, box, obox, beam, blob, prism, ngon, slab, lathe, lantern } from '../lib/town-kit.js';
const BUNT = ['oklch(0.62 0.13 40)', 'oklch(0.62 0.08 195)', 'oklch(0.95 0.03 88)', 'oklch(0.7 0.08 130)', 'oklch(0.8 0.12 85)', 'oklch(0.66 0.11 10)'];
const GOODS = {
  apples: ['oklch(0.58 0.17 25)', 0.09], oranges: ['oklch(0.72 0.16 55)', 0.09], lemons: ['oklch(0.88 0.15 100)', 0.08], plums: ['oklch(0.42 0.1 330)', 0.07],
  cabbage: ['oklch(0.72 0.12 135)', 0.16], pumpkin: ['oklch(0.68 0.15 55)', 0.2], bread: ['oklch(0.72 0.11 70)', 0.12], cheese: ['oklch(0.87 0.11 90)', 0.16],
  flowers: ['oklch(0.7 0.16 350)', 0.07], fish: ['oklch(0.78 0.03 230)', 0.1], carrots: ['oklch(0.68 0.16 50)', 0.07], jars: ['oklch(0.8 0.1 70)', 0.08],
};
function crate(ctx, P, x, y, z, w, d, h, good, rnd, lod) {
  paint(ctx, 'oak', COL.oak, 0.85);
  if (lod <= 2) { obox(P, x, y, z - d / 2 + 0.03, w, h, 0.06); obox(P, x, y, z + d / 2 - 0.03, w, h, 0.06); obox(P, x - w / 2 + 0.03, y, z, 0.06, h, d - 0.12); obox(P, x + w / 2 - 0.03, y, z, 0.06, h, d - 0.12); obox(P, x, y, z, w - 0.1, 0.04, d - 0.1); }
  else obox(P, x, y, z, w, h, d);
  if (!good || lod > 3) return;
  const [col, r] = GOODS[good] || GOODS.apples, top = y + h - 0.04;
  if (lod > 2) { paint(ctx, null, col, 0.7); blob(P, x, top, z, w / 2 - 0.04, 0.12, d / 2 - 0.04, 5); return; }
  paint(ctx, null, col, good === 'jars' ? 0.2 : 0.65);
  const nx = Math.max(1, Math.floor((w - 0.08) / (r * 2))), nz = Math.max(1, Math.floor((d - 0.08) / (r * 2)));
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    if ((i + k) % 2 && nx * nz > 12) continue;
    const px = x - w / 2 + 0.04 + (i + 0.5) * (w - 0.08) / nx, pz = z - d / 2 + 0.04 + (k + 0.5) * (d - 0.08) / nz;
    if (good === 'bread' || good === 'fish' || good === 'carrots') obox(P, px, top, pz, r * 1.6, r * 0.8, r * 0.9, rnd() * 3);
    else if (good === 'cheese') lathe(P, [[r, 0], [r, r * 0.8], [0, r * 0.8]], 7, px, top, pz);
    else if (good === 'jars') lathe(P, [[r * 0.7, 0], [r * 0.8, r * 1.5], [r * 0.5, r * 2], [0, r * 2]], 6, px, top, pz);
    else blob(P, px, top - r * 0.3, pz, r, r * 1.6, r, 4, rnd);
  }
  if (good === 'flowers' || good === 'cabbage') { paint(ctx, null, COL.leafA, 0.9); blob(P, x, top - 0.02, z, w / 2 - 0.06, 0.06, d / 2 - 0.06, 5); }
}
function stall(ctx, P, s, rnd, lod) {
  const W = 2.8, fz = -0.75, bz = 0.75, fh = 2.35, bh = 2.85;
  paint(ctx, 'walnut', COL.walnut, 0.85);
  for (const x of [-W / 2, W / 2]) { obox(P, x, 0, fz, 0.12, fh, 0.12); obox(P, x, 0, bz, 0.12, bh, 0.12); }
  beam(P, [-W / 2 - 0.1, fh, fz], [W / 2 + 0.1, fh, fz], 0.1, 0.12); beam(P, [-W / 2 - 0.1, bh, bz], [W / 2 + 0.1, bh, bz], 0.1, 0.12);
  paint(ctx, 'oak', COL.oak, 0.85); box(P, -W / 2 + 0.05, 0, -0.6, W / 2 - 0.05, 0.9, 0.0); box(P, -W / 2 - 0.05, 0.9, -0.7, W / 2 + 0.05, 0.96, 0.05);
  if (lod <= 2) { paint(ctx, 'linen', s.awn, 0.95); P.quad(-W / 2 + 0.05, 0.88, -0.61, W / 2 - 0.05, 0.88, -0.61, W / 2 - 0.05, 0.35, -0.61, -W / 2 + 0.05, 0.35, -0.61); }
  const g = s.goods || ['apples', 'oranges', 'cabbage'];
  for (let i = 0; i < 3; i++) crate(ctx, P, -0.9 + i * 0.9, 0.96, -0.35, 0.8, 0.55, 0.2, g[i % g.length], rnd, lod);
  if (lod <= 3) { crate(ctx, P, W / 2 + 0.55, 0, 0.3, 0.7, 0.6, 0.45, g[0], rnd, lod); crate(ctx, P, W / 2 + 0.55, 0.45, 0.3, 0.6, 0.5, 0.38, null, rnd, lod); crate(ctx, P, -W / 2 - 0.5, 0, -0.1, 0.6, 0.55, 0.4, g[2 % g.length], rnd, lod); }
  // awning: striped linen from the back beam over the front, with a scalloped valance
  const n = lod <= 2 ? 7 : 1, ez = fz - 0.55, ey = fh - 0.2;
  for (let i = 0; i < n; i++) {
    const a = -W / 2 - 0.2 + i * (W + 0.4) / n, b = -W / 2 - 0.2 + (i + 1) * (W + 0.4) / n;
    paint(ctx, 'linen', i % 2 ? 'oklch(0.96 0.02 85)' : s.awn, 0.95);
    slab(P, [a, bh + 0.08, bz + 0.1], [b, bh + 0.08, bz + 0.1], [b, ey, ez], [a, ey, ez], 0.03);
    if (lod <= 2) P.tri(a, ey, ez, b, ey, ez, (a + b) / 2, ey - 0.28, ez);
  }
  if (lod <= 3) { paint(ctx, 'linen', s.awn, 0.95); for (const x of [-W / 2 - 0.2, W / 2 + 0.2]) P.tri(x, bh + 0.08, bz + 0.1, x, ey, ez, x, ey - 0.4, bz + 0.1); }
  if (lod <= 3) { paint(ctx, null, COL.iron, 0.5, 0.6); for (const x of [-W / 2 + 0.1, W / 2 - 0.1]) beam(P, [x, fh, fz], [x, fh - 0.3, fz], 0.02, 0.02); lantern(ctx, P, -W / 2 + 0.1, fh - 0.3, fz, 0.8); lantern(ctx, P, W / 2 - 0.1, fh - 0.3, fz, 0.8); }
  if (lod <= 2 && s.hang) { paint(ctx, null, s.hang, 0.7); for (let i = 0; i < 4; i++) { const x = -0.9 + i * 0.6; beam(P, [x, fh - 0.02, fz + 0.1], [x, fh - 0.3, fz + 0.1], 0.015, 0.015); blob(P, x, fh - 0.55, fz + 0.1, 0.1, 0.25, 0.1, 5); } }
}
export function bench(ctx, P, lod) {
  paint(ctx, 'lime', COL.lime, 0.9); for (const x of [-0.75, 0.75]) box(P, x - 0.12, 0, -0.22, x + 0.12, 0.42, 0.22);
  paint(ctx, 'oak', COL.oak, 0.8);
  if (lod <= 2) { for (let i = 0; i < 4; i++) box(P, -1.0, 0.42, -0.24 + i * 0.125, 1.0, 0.47, -0.24 + i * 0.125 + 0.1); for (let i = 0; i < 3; i++) slab(P, [-1.0, 0.62 + i * 0.13, 0.26 + i * 0.02], [1.0, 0.62 + i * 0.13, 0.26 + i * 0.02], [1.0, 0.62 + i * 0.13, 0.33 + i * 0.02], [-1.0, 0.62 + i * 0.13, 0.33 + i * 0.02], 0.1); paint(ctx, null, COL.iron, 0.5, 0.6); for (const x of [-0.75, 0.75]) beam(P, [x, 0.42, 0.24], [x, 1.0, 0.33], 0.05, 0.05); }
  else { box(P, -1.0, 0.42, -0.24, 1.0, 0.47, 0.26); box(P, -1.0, 0.47, 0.22, 1.0, 0.95, 0.3); }
}
function planter(ctx, P, L, rnd, lod) {
  paint(ctx, 'oak', 'oklch(0.72 0.07 60)', 0.85); box(P, -L / 2, 0, -0.35, L / 2, 0.55, 0.35);
  if (lod <= 2) { paint(ctx, 'oak', 'oklch(0.62 0.08 195)', 0.8); box(P, -L / 2 - 0.05, 0.55, -0.4, L / 2 + 0.05, 0.62, 0.4); }
  paint(ctx, 'soil', 'oklch(0.9 0.02 60)', 0.95); P.quad(-L / 2 + 0.05, 0.56, -0.3, -L / 2 + 0.05, 0.56, 0.3, L / 2 - 0.05, 0.56, 0.3, L / 2 - 0.05, 0.56, -0.3);
  if (lod > 3) return;
  const n = Math.round(L / 0.5);
  for (let i = 0; i < n; i++) { paint(ctx, null, i % 2 ? COL.leafA : COL.leafB, 0.9); blob(P, -L / 2 + (i + 0.5) * L / n, 0.5, (rnd() - 0.5) * 0.2, 0.3, 0.35, 0.28, 5, rnd); }
  if (lod <= 2) for (let i = 0; i < n * 2; i++) { paint(ctx, null, FLOWERS[i % FLOWERS.length], 0.6); blob(P, -L / 2 + 0.15 + rnd() * (L - 0.3), 0.72 + rnd() * 0.15, (rnd() - 0.5) * 0.45, 0.07, 0.07, 0.07, 4); }
}
function tree(ctx, P, rnd, lod) {
  paint(ctx, 'lime', COL.lime, 0.9); lathe(P, [[1.05, 0], [1.1, 0.55], [1.0, 0.6], [0, 0.6]], lod <= 2 ? 16 : 8);
  paint(ctx, 'walnut', 'oklch(0.75 0.03 60)', 0.9); beam(P, [0, 0.5, 0], [0.1, 2.6, 0.05], 0.3, 0.3); beam(P, [0.1, 2.4, 0.05], [0.8, 3.4, 0.2], 0.16, 0.16); beam(P, [0.1, 2.5, 0.05], [-0.6, 3.5, -0.3], 0.16, 0.16);
  const cl = [[0, 3.0, 0, 2.1, 1.9], [0.9, 3.3, 0.5, 1.4, 1.5], [-0.8, 3.4, -0.4, 1.4, 1.5], [0.1, 4.2, -0.1, 1.5, 1.4], [-0.3, 3.3, 0.9, 1.2, 1.2]];
  for (let i = 0; i < (lod <= 2 ? cl.length : 2); i++) { const [x, y, z, r, h] = cl[i]; paint(ctx, 'leaf', i % 2 ? 'oklch(0.9 0.07 135)' : 'oklch(0.94 0.06 125)', 0.9); blob(P, x, y, z, r, h, r, lod <= 2 ? 7 : 5, rnd); }
}
function lamp(ctx, P, x, z, lod, sa, y = 0) { // sa: which way the arm reaches (±1 along x, default toward x = 0); y: the post's ground
  const s = sa ? Math.sign(sa) : (x < 0 ? 1 : -1), H = 4.2;
  paint(ctx, 'lime', COL.lime, 0.9); box(P, x - 0.28, y - 0.3, z - 0.28, x + 0.28, y + 0.45, z + 0.28);
  paint(ctx, null, COL.iron, 0.45, 0.7);
  lathe(P, [[0.16, 0.45], [0.1, 0.8], [0.07, H], [0.11, H + 0.08], [0, H + 0.08]], lod <= 2 ? 8 : 5, x, y, z);
  if (lod <= 2) lathe(P, [[0.12, 1.2], [0.12, 1.3], [0, 1.3]], 8, x, y, z);
  beam(P, [x, y + H - 0.1, z], [x + s * 0.75, y + H - 0.1, z], 0.05, 0.05);
  if (lod <= 2) beam(P, [x, y + H - 0.6, z], [x + s * 0.5, y + H - 0.12, z], 0.035, 0.035);
  lantern(ctx, P, x + s * 0.75, y + H - 0.2, z, 1.25);
}
function arch(ctx, P, z0, lod) {
  const zf = z0 - 0.55, zb = z0 + 0.55, spring = 4.2, a = 4.35, b = 1.6;
  paint(ctx, 'ashlar', COL.lime, 0.9);
  for (const s of [-1, 1]) {
    box(P, s < 0 ? -5.75 : 4.35, 0, zf - 0.1, s < 0 ? -4.35 : 5.75, 0.55, zb + 0.1);
    box(P, s < 0 ? -5.6 : 4.4, 0.55, zf, s < 0 ? -4.4 : 5.6, spring, zb);
    box(P, s < 0 ? -5.75 : 4.3, spring - 0.25, zf - 0.08, s < 0 ? -4.3 : 5.75, spring, zb + 0.08);
    box(P, s < 0 ? -5.6 : 4.4 + 0.65, spring, zf + 0.05, s < 0 ? -4.4 - 0.65 : 5.6, 6.4, zb - 0.05);
  }
  const n = lod <= 2 ? 13 : 7, T = 0.75;
  for (let i = 0; i < n; i++) {
    const t0 = i / n * Math.PI, t1 = (i + 1) / n * Math.PI, key = i === (n - 1) / 2;
    const pin = (t) => [a * Math.cos(t), spring + b * Math.sin(t)], pout = (t) => [(a + T) * Math.cos(t), spring + (b + T) * Math.sin(t)];
    const [x0, y0] = pin(t0), [x1, y1] = pin(t1), [X0, Y0] = pout(t0), [X1, Y1] = pout(t1), ex = key ? 0.2 : 0;
    paint(ctx, 'ashlar', i % 2 ? COL.lime : 'oklch(0.9 0.025 75)', 0.9);
    const L = [[x0, y0, zf - ex * 0.5], [X0, Y0 + ex, zf - ex * 0.5], [X1, Y1 + ex, zf - ex * 0.5], [x1, y1, zf - ex * 0.5]];
    solid(P, L, L.map(([x, y]) => [x, y, zb + ex * 0.5]));
    paint(ctx, 'ashlar', COL.lime, 0.9);
    if (Y0 < 6.4 || Y1 < 6.4) { const F = [[X0, Y0, zf + 0.05], [X1, Y1, zf + 0.05], [X1, 6.4, zf + 0.05], [X0, 6.4, zf + 0.05]]; solid(P, F, F.map(([x, y]) => [x, y, zb - 0.05])); }
  }
  paint(ctx, 'ashlar', 'oklch(0.93 0.025 80)', 0.9); box(P, -5.8, 6.4, zf - 0.05, 5.8, 7.75, zb + 0.05);
  box(P, -6.05, 7.75, zf - 0.25, 6.05, 8.0, zb + 0.25); box(P, -5.9, 6.3, zf - 0.15, 5.9, 6.42, zb + 0.15);
  if (lod <= 3) { // crest and urn finials
    const A = []; for (let i = 0; i <= 8; i++) { const t = i / 8 * Math.PI; A.push([Math.cos(t) * 1.6, 8.0 + Math.sin(t) * 0.9]); }
    paint(ctx, 'ashlar', COL.lime, 0.9);
    for (let i = 0; i < 8; i++) { const L = [[0, 8.0, zf + 0.1], [A[i][0], A[i][1], zf + 0.1], [A[i + 1][0], A[i + 1][1], zf + 0.1]]; solid(P, L, L.map(([x, y]) => [x, y, zb - 0.1])); }
    for (const s of [-1, 1]) lathe(P, [[0.35, 0], [0.35, 0.12], [0.18, 0.2], [0.34, 0.55], [0.12, 0.85], [0.18, 0.95], [0, 1.05]], lod <= 2 ? 10 : 6, s * 5.1, 8.0, z0);
    paint(ctx, null, 'oklch(0.62 0.08 195)', 0.5, 0, null); gemish(P, 0, 8.45, zf + 0.02);
  }
}
function gemish(P, x, y, z) { const r = 0.32, n = 8; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; P.tri(x, y, z - 0.08, x + Math.cos(b) * r, y + Math.sin(b) * r, z, x + Math.cos(a) * r, y + Math.sin(a) * r, z); } }
function bunting(ctx, P, a, b, H, lod) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 2)), sag = Math.min(2.2, L * 0.05), d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const at = (t) => [a[0] + (b[0] - a[0]) * t, H - sag * 4 * t * (1 - t), a[1] + (b[1] - a[1]) * t];
  paint(ctx, null, 'oklch(0.4 0.03 60)', 0.9);
  for (let i = 0; i < n; i++) beam(P, at(i / n), at((i + 1) / n), 0.03, 0.03);
  if (lod > 3) return;
  const m = Math.floor(L / (lod <= 2 ? 0.75 : 1.5));
  for (let c = 0; c < BUNT.length; c++) {
    paint(ctx, 'linen', BUNT[c], 0.95);
    for (let i = c; i < m; i += BUNT.length) { const t = (i + 0.5) / m, p = at(t), w = 0.22; P.tri(p[0] - d[0] * w, p[1], p[2] - d[1] * w, p[0] + d[0] * w, p[1], p[2] + d[1] * w, p[0], p[1] - 0.45, p[2]); }
  }
}
function pole(ctx, P, x, z, H, lod) {
  paint(ctx, 'lime', COL.lime, 0.9); box(P, x - 0.3, 0, z - 0.3, x + 0.3, 0.5, z + 0.3);
  paint(ctx, 'oak', 'oklch(0.62 0.08 195)', 0.8); lathe(P, [[0.13, 0.5], [0.09, H], [0, H]], lod <= 2 ? 8 : 5, x, 0, z);
  paint(ctx, 'brass', 'oklch(0.85 0.06 75)', 0.35, 0.9); lathe(P, [[0.001, H], [0.16, H + 0.15], [0.001, H + 0.32]], 8, x, 0, z);
}
// ---- market island dressing ------------------------------------------------------------------------------------------
const faceYaw = (s) => Math.atan2(s.x - (s.fx ?? 0), s.z - (s.fz ?? 0));
const RUGS = [['oklch(0.5 0.14 25)', 'oklch(0.86 0.1 85)', 'oklch(0.36 0.08 260)'], ['oklch(0.42 0.09 262)', 'oklch(0.82 0.08 75)', 'oklch(0.6 0.13 32)'], ['oklch(0.72 0.12 72)', 'oklch(0.46 0.12 28)', 'oklch(0.92 0.03 85)']];
const BARRELS = [[0, 0, 1], [0.7, 0.12, 1], [0.34, 0.64, 0.86], [-0.52, 0.52, 0.92]];
const SACKS = [[0, 0, 1, 0], [0.52, 0.12, 0.9, 1], [0.22, 0.56, 1.06, 0], [-0.4, 0.42, 0.86, 1]];
const PROP_BOX = { ladder: [-0.3, 0, -0.9, 0.3, 1.2, 0.05], rugs: [-1.62, 0, -0.14, 1.62, 2.35, 0.14], barrels: [-0.85, 0, -0.35, 1.05, 0.85, 1.0], sacks: [-0.7, 0, -0.3, 0.8, 0.6, 0.85], stack: [-0.92, 0, -0.6, 0.92, 1.0, 0.62] };
const PROPS = {
  wallLamp(ctx, P, q, rnd, lod) { // wrought-iron bracket off a wall behind (+z), a lantern hung at its tip
    const y = q.h ?? 3.1; paint(ctx, null, COL.iron, 0.5, 0.6);
    obox(P, 0, y - 0.35, 0.02, 0.22, 0.5, 0.05); beam(P, [0, y, 0], [0, y, -0.55], 0.05, 0.05); beam(P, [0, y - 0.3, 0], [0, y - 0.02, -0.4], 0.035, 0.035);
    if (lod <= 2) beam(P, [0, y + 0.02, -0.5], [0, y + 0.14, -0.62], 0.03, 0.03);
    lantern(ctx, P, 0, y - 0.42, -0.55, 1.25);
  },
  ladder(ctx, P, q, rnd, lod) { // oak ladder leaning on the wall behind (+z)
    const h = q.h ?? 3.6, foot = -h * 0.28; paint(ctx, null, COL.oak ?? 'oklch(0.62 0.08 65)', 0.85);
    for (const x of [-0.24, 0.24]) beam(P, [x, 0, foot], [x, h, 0], 0.07, 0.05);
    if (lod <= 3) for (let y = 0.3; y < h - 0.1; y += 0.32) { const t = y / h; beam(P, [-0.24, y, foot * (1 - t)], [0.24, y, foot * (1 - t)], 0.04, 0.04); }
  },
  rugs(ctx, P, q, rnd, lod) { // a walnut rack along x, three patterned rugs folded over its beam, fringes at the hem
    paint(ctx, 'walnut', COL.walnut, 0.85);
    for (const x of [-1.5, 1.5]) { obox(P, x, 0, 0, 0.12, 2.3, 0.12); obox(P, x, 0, 0, 0.14, 0.08, 0.9); }
    beam(P, [-1.66, 2.25, 0], [1.66, 2.25, 0], 0.09, 0.09);
    for (let i = 0; i < 3; i++) {
      const x = -1.0 + i, w = 0.86, c = RUGS[i % RUGS.length], lo = 0.5 + (i % 2) * 0.18;
      paint(ctx, 'linen', c[0], 0.95); box(P, x - w / 2, lo, -0.09, x + w / 2, 2.22, -0.055); box(P, x - w / 2, 1.35, 0.055, x + w / 2, 2.22, 0.09);
      box(P, x - w / 2, 2.2, -0.09, x + w / 2, 2.31, 0.09);
      if (lod > 2) continue;
      paint(ctx, 'linen', c[1], 0.95);
      for (const y of [lo + 0.12, 2.0]) box(P, x - w / 2 + 0.05, y, -0.1, x + w / 2 - 0.05, y + 0.07, -0.089);
      box(P, x - w / 2 + 0.05, lo + 0.12, -0.1, x - w / 2 + 0.12, 2.07, -0.089); box(P, x + w / 2 - 0.12, lo + 0.12, -0.1, x + w / 2 - 0.05, 2.07, -0.089);
      paint(ctx, 'linen', c[2], 0.95); // a medallion lozenge and a chevron band
      const my = (lo + 2.2) / 2; P.quad(x, my + 0.32, -0.101, x + 0.24, my, -0.101, x, my - 0.32, -0.101, x - 0.24, my, -0.101);
      for (let k = 0; k < 4; k++) { const a = x - w / 2 + 0.1 + k * 0.17; P.tri(a, lo + 0.3, -0.1, a + 0.17, lo + 0.3, -0.1, a + 0.085, lo + 0.42, -0.1); }
      paint(ctx, 'linen', 'oklch(0.93 0.03 85)', 0.95);
      for (let k = 0; k < 9; k++) { const a = x - w / 2 + 0.03 + k * (w - 0.06) / 8; beam(P, [a, lo, -0.072], [a + (rnd() - 0.5) * 0.02, lo - 0.08, -0.075], 0.012, 0.012); }
    }
  },
  barrels(ctx, P, q, rnd, lod) { // oak staves bound with iron hoops, one lidded with apples
    const n = lod <= 2 ? 12 : 7;
    BARRELS.forEach(([x, z, s], i) => {
      paint(ctx, 'oak', 'oklch(0.86 0.05 65)', 0.85);
      lathe(P, [[0.27 * s, 0], [0.32 * s, 0.2 * s], [0.34 * s, 0.42 * s], [0.32 * s, 0.64 * s], [0.27 * s, 0.84 * s], [0, 0.84 * s]], n, x, 0, z);
      if (lod <= 3) { paint(ctx, null, COL.iron, 0.5, 0.6); for (const y of [0.1, 0.3, 0.54, 0.72]) { const r = (y < 0.2 || y > 0.7 ? 0.305 : 0.338) * s; lathe(P, [[r, y * s], [r + 0.012, y * s], [r + 0.012, y * s + 0.05], [r, y * s + 0.05]], n, x, 0, z); } }
      if (i === 1 && lod <= 2) { paint(ctx, null, GOODS.apples[0], 0.65); for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = k ? 0.15 : 0; blob(P, x + Math.cos(a) * r, 0.84 * s, z + Math.sin(a) * r, 0.08, 0.13, 0.08, 4, rnd); } }
    });
  },
  sacks(ctx, P, q, rnd, lod) { // tied linen sacks, two open on grain and potatoes
    SACKS.forEach(([x, z, s, open], i) => {
      paint(ctx, 'linen', i % 2 ? 'oklch(0.9 0.04 80)' : 'oklch(0.86 0.05 70)', 0.95);
      blob(P, x, 0, z, 0.26 * s, (open ? 0.42 : 0.52) * s, 0.24 * s, lod <= 2 ? 8 : 5, rnd);
      if (!open) lathe(P, [[0.1 * s, 0.48 * s], [0.06 * s, 0.6 * s], [0.12 * s, 0.7 * s], [0, 0.72 * s]], 6, x, 0, z);
      else if (lod <= 2) { paint(ctx, null, i === 1 ? 'oklch(0.82 0.1 85)' : 'oklch(0.66 0.08 60)', 0.9); blob(P, x, 0.34 * s, z, 0.2 * s, 0.12 * s, 0.19 * s, 6, rnd); }
    });
  },
  stack(ctx, P, q, rnd, lod) { // a stepped display: two tall crates behind, two low ones in front
    const g = q.goods || ['cabbage', 'bread', 'apples', 'apples'];
    crate(ctx, P, -0.45, 0, 0.3, 0.8, 0.55, 0.72, g[0], rnd, lod); crate(ctx, P, 0.45, 0, 0.3, 0.8, 0.55, 0.72, g[1], rnd, lod);
    crate(ctx, P, -0.45, 0, -0.3, 0.8, 0.55, 0.38, g[2], rnd, lod); crate(ctx, P, 0.45, 0, -0.3, 0.8, 0.55, 0.38, g[3 % g.length], rnd, lod);
  },
};
// ---- the paved floor -------------------------------------------------------------------------------------------------
const hsh = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
const vn = (x, z) => { const i = Math.floor(x), k = Math.floor(z), fx = x - i, fz = z - k, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz), a = hsh(i, k), b = hsh(i + 1, k), c = hsh(i, k + 1), d = hsh(i + 1, k + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
const FLAG = [[0.95, 0.02, 82], [0.905, 0.03, 70], [0.93, 0.028, 94]], COB = [[0.8, 0.06, 55], [0.74, 0.062, 44], [0.85, 0.055, 68]], APRON = [0.88, 0.032, 62];
const shade = ([L, C, H], g) => `oklch(${(L - g * 0.07).toFixed(3)} ${(C + g * 0.008).toFixed(3)} ${Math.round(H + (58 - H) * g * 0.25)})`;
const top = (x0, z0, x1, z1, y) => [x0, y, z0, x0, y, z1, x1, y, z1, x1, y, z0];
function plan(p) {
  const F = p.floor || {}, X = F.x ?? 23.5, Z0 = F.z0 ?? -23.5, Z1 = F.z1 ?? 22.5, D = F.dais ?? 8.5, R0 = F.ring ?? 12.3, BW = (F.band ?? 1.6) / 2;
  const rings = F.rings || [[12.3, 13.5], [16.6, 17.2], [20.4, 20.9]], corners = [[-X, Z0], [X, Z0], [-X, Z1], [X, Z1]].map(([x, z]) => { const l = Math.hypot(x, z); return [x / l, z / l]; });
  const dais = (x, z) => Math.abs(x) < D && Math.abs(z) < D;
  const cobble = (x, z) => {
    if (dais(x, z)) return false;
    const r = Math.hypot(x, z);
    for (const [a, b] of rings) if (r >= a && r <= b) return true;
    if (Math.abs(x) < BW) return true; // the lane mouth → fountain → hall axis
    if (r > R0) for (const [u, v] of corners) if (x * u + z * v > 0 && Math.abs(x * v - z * u) < BW) return true;
    return false;
  };
  const apron = (x, z) => (p.fronts || []).some(([ax, pos, a, b]) => ax === 'x' ? z >= a && z <= b && Math.abs(x - pos) < 1.6 : x >= a && x <= b && Math.abs(z - pos) < 1.6);
  const wear = (x, z) => {
    let g = 0;
    if (Math.abs(z) > D) { const w = 1.5 + 0.7 * vn(0.37, z * 0.3); g = Math.max(g, 1 - Math.abs(x) / w); }
    const d = Math.max(Math.abs(x), Math.abs(z)) - D; if (d >= 0 && d < 1.8) g = Math.max(g, 0.8 * (1 - d / 1.8));
    for (const [wx, wz, wr] of p.wear || []) { const e = Math.hypot(x - wx, z - wz); if (e < wr) g = Math.max(g, 0.85 * (1 - e / wr)); }
    g *= 0.5 + 0.7 * vn(x * 0.7 + 3.1, z * 0.7 - 1.7);
    return Math.max(0, Math.min(3, Math.floor(g * 4)));
  };
  return { X, Z0, Z1, D, dais, cobble, apron, wear };
}
function floor(ctx, P, p, lod) {
  if (lod > 3) return;
  const L = plan(p), B = new Map(), put = (tex, col, q) => { const k = tex + '|' + col; let a = B.get(k); if (!a) B.set(k, a = []); a.push(q); };
  const cs = lod <= 2 ? 1 : 2, gap = lod <= 2 ? 0.028 : 0;
  for (let x = -L.X; x < L.X - 1e-6; x += cs) for (let z = L.Z0; z < L.Z1 - 1e-6; z += cs) {
    const x1 = Math.min(L.X, x + cs), z1 = Math.min(L.Z1, z + cs), cx = (x + x1) / 2, cz = (z + z1) / 2;
    if (L.dais(cx, cz)) continue;
    const ap = L.apron(cx, cz), ring = Math.floor(Math.hypot(cx, cz) / 2.2) & 1, chk = (Math.floor(cx) + Math.floor(cz)) & 1;
    const tone = ap ? APRON : FLAG[chk ? (ring ? 0 : 2) : 1];
    if (lod === 1) {
      const sub = []; let any = false;
      for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) { const sx = x + (i + 0.5) / 3, sz = z + (k + 0.5) / 3, c = !ap && L.cobble(sx, sz); any = any || c; sub.push([i, k, sx, sz, c]); }
      if (any) {
        for (const [i, k, sx, sz, c] of sub) {
          const h = hsh(sx * 3.1, sz * 2.7), g = L.wear(sx, sz), a = x + i / 3, b = z + k / 3;
          if (c) put('lime', shade(COB[Math.floor(h * 3)], g), top(a + 0.035, b + 0.035, a + 1 / 3 - 0.035, b + 1 / 3 - 0.035, 0.045 + h * 0.016));
          else put('lime', shade(tone, g), top(a + 0.02, b + 0.02, a + 1 / 3 - 0.02, b + 1 / 3 - 0.02, 0.04));
        }
        continue;
      }
    } else if (!ap && L.cobble(cx, cz)) { put('lime', shade(COB[Math.floor(hsh(cx, cz) * 3)], L.wear(cx, cz)), top(x + gap, z + gap, x1 - gap, z1 - gap, 0.045)); continue; }
    put(ap ? 'ashlar' : 'lime', shade(tone, L.wear(cx, cz)), top(x + gap, z + gap, x1 - gap, z1 - gap, 0.04 + hsh(cx, cz) * 0.008));
  }
  if (lod <= 2) { // the grout bed between the stones, open under the fountain's dais
    const D = L.D; paint(ctx, null, 'oklch(0.58 0.03 62)', 1);
    for (const q of [top(-L.X, L.Z0, L.X, -D, 0.022), top(-L.X, D, L.X, L.Z1, 0.022), top(-L.X, -D, -D, D, 0.022), top(D, -D, L.X, D, 0.022)]) P.quad(...q);
  }
  for (const [k, qs] of B) { const [tex, col] = k.split('|'); paint(ctx, tex, col, 0.92); for (const q of qs) P.quad(...q); }
  if (lod > 2) return;
  paint(ctx, 'ashlar', 'oklch(0.86 0.03 65)', 0.9); // kerbed borders outlining each shopfront's apron
  for (const [ax, pos, a, b] of p.fronts || []) {
    const s = pos < 0 ? 1 : -1, o = pos + s * 1.6, lo = Math.min(pos, o), hi = Math.max(pos, o);
    if (ax === 'x') { box(P, o - 0.11, 0, a, o + 0.11, 0.075, b); box(P, lo, 0, a - 0.11, hi, 0.075, a + 0.11); box(P, lo, 0, b - 0.11, hi, 0.075, b + 0.11); }
    else { box(P, a, 0, o - 0.11, b, 0.075, o + 0.11); box(P, a - 0.11, 0, lo, a + 0.11, 0.075, hi); box(P, b - 0.11, 0, lo, b + 0.11, 0.075, hi); }
  }
  // the worn earth path from the lane mouth to the hall door, and scuffs where feet gather
  const spots = []; for (let z = L.Z0 + 0.3; z < L.Z1 - 0.3; z += 0.75) if (Math.abs(z) > L.D + 0.4 && hsh(z, 7.7) < 0.8) spots.push([(vn(z * 0.21, 5.3) - 0.5) * 1.3, z, 0.45 + hsh(z, 1.3) * 0.55]);
  for (const [wx, wz, wr] of p.wear || []) for (let i = 0; i < 2; i++) { const a = hsh(wx + i, wz) * TAU, d = wr * 0.35 * hsh(wz, wx + i); spots.push([wx + Math.cos(a) * d, wz + Math.sin(a) * d, 0.35 + 0.35 * hsh(wx, wz + i)]); }
  for (let t = 0; t < 2; t++) {
    paint(ctx, null, t ? 'oklch(0.55 0.045 55)' : 'oklch(0.62 0.05 64)', 1);
    spots.forEach(([cx, cz, r], j) => {
      if (j % 2 !== t) return;
      const n = 9, pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (0.7 + 0.5 * hsh(cx * 5 + i, cz * 3)); pts.push([cx + Math.cos(a) * rr, cz + Math.sin(a) * rr * 1.25]); }
      const y = 0.064 + t * 0.002; for (let i = 0; i < n; i++) { const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % n]; P.tri(cx, y, cz, bx, y, bz, ax, y, az); }
    });
  }
}
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, P = ctx, rnd = () => ctx.random();
  if (p.kind === 'lane') {
    for (const [x, z, s, y] of p.lamps || []) lamp(ctx, P, x, z, lod, s, y);
    arch(ctx, P, p.archZ ?? 4, lod);
  } else if (p.kind === 'market') {
    for (const s of p.stalls || []) stall(ctx, XF(P, s.x, 0, s.z, faceYaw(s)), s, rnd, lod);
    for (const q of p.props || []) PROPS[q.k]?.(ctx, XF(P, q.x, q.y || 0, q.z, (q.yaw || 0) * Math.PI / 180), q, rnd, lod);
  } else {
    floor(ctx, P, p, lod);
    for (const [x, z, yaw] of p.benches || []) bench(ctx, XF(P, x, 0, z, yaw * Math.PI / 180), lod);
    for (const [x, z, L, yaw] of p.planters || []) planter(ctx, XF(P, x, 0, z, (yaw || 0) * Math.PI / 180), L, rnd, lod);
    for (const [x, z] of p.trees || []) tree(ctx, XF(P, x, 0, z, 0), rnd, lod);
    const H = p.poleH || 8.5;
    for (const [x, z] of p.poles || []) pole(ctx, P, x, z, H, lod);
    for (const [i, j] of p.strings || []) bunting(ctx, P, p.poles[i], p.poles[j], H - 0.1, lod);
  }
}
export function collider(ctx) {
  const p = ctx.params, C = ctx;
  if (p.kind === 'lane') {
    for (const [x, z, , y = 0] of p.lamps || []) box(C, x - 0.28, y, z - 0.28, x + 0.28, y + 4.3, z + 0.28);
    const z0 = p.archZ ?? 4; for (const s of [-1, 1]) box(C, s < 0 ? -5.75 : 4.35, 0, z0 - 0.65, s < 0 ? -4.35 : 5.75, 8.0, z0 + 0.65);
    box(C, -5.8, 6.2, z0 - 0.6, 5.8, 8.0, z0 + 0.6);
  } else if (p.kind === 'market') {
    for (const s of p.stalls || []) { // the counter and posts: the vendor stands in the open back
      const F = XF(C, s.x, 0, s.z, faceYaw(s)); box(F, -1.5, 0, -0.8, 1.5, 1.0, -0.45); box(F, 1.4, 0, 0, 2.0, 0.85, 0.6); box(F, -2.0, 0, -0.4, -1.4, 0.4, 0.2);
      for (const x of [-1.4, 1.4]) box(F, x - 0.08, 0, 0.67, x + 0.08, 2.8, 0.83);
    }
    for (const q of p.props || []) { const F = XF(C, q.x, q.y || 0, q.z, (q.yaw || 0) * Math.PI / 180), H = PROP_BOX[q.k]; if (H) box(F, ...H); }
  } else {
    for (const [x, z, yaw] of p.benches || []) box(XF(C, x, 0, z, yaw * Math.PI / 180), -1.0, 0, -0.24, 1.0, 0.47, 0.3);
    for (const [x, z, L, yaw] of p.planters || []) box(XF(C, x, 0, z, (yaw || 0) * Math.PI / 180), -L / 2, 0, -0.4, L / 2, 0.62, 0.4);
    for (const [x, z] of p.trees || []) prism(C, ngon(8, 1.1, x, z), 0, 0.6), box(C, x - 0.18, 0.6, z - 0.18, x + 0.18, 2.6, z + 0.18);
    for (const [x, z] of p.poles || []) box(C, x - 0.3, 0, z - 0.3, x + 0.3, 3, z + 0.3);
  }
}
