// The north shore of the pond, one merged piece: a blossom grove (cherry + apple), a campsite (stone-ring fire, canvas
// A-frame tent, lantern pole, firewood) and a timber boardwalk lookout over the water. Origin = row feet (5, 0.5, -100);
// local y 0 = world 0.5 = the deck top. Seats are their own firepit.js rows (E-sit), the flame + light the north-fire row.
import { TAU, paint, obox, beam, solid, prism, ngon, Q, T, box, gem } from '../lib/yard-kit.js';
const rnd = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const STONE = ['oklch(0.95 0.02 85)', 'oklch(0.91 0.025 80)', 'oklch(0.97 0.015 90)'];
const BLOSSOM = { cherry: ['oklch(0.86 0.09 356)', 'oklch(0.92 0.06 350)', 'oklch(0.8 0.11 358)'], apple: ['oklch(0.97 0.02 30)', 'oklch(0.91 0.06 5)', 'oklch(0.76 0.1 132)'] };
const D = { fire: [-6.5, -4], tent: [-6.5, -8.8], lamp: [-3.5, -6.5], walk: { x: -1, w: 1.6, z0: -2.6, z1: 4 }, deck: { x0: -3.2, x1: 1.2, z0: 4, z1: 8.4 } };
// a closed low-poly blossom cloud: bottom point, two rings, top point
function puff(ctx, cx, cy, cz, rx, ry, rz, n, R) {
  const ring = (r, h, tw) => { const a = []; for (let i = 0; i < n; i++) { const t = (i + tw) / n * TAU, j = 0.86 + R() * 0.26; a.push([cx + Math.cos(t) * rx * r * j, cy + ry * h, cz + Math.sin(t) * rz * r * j]); } return a; };
  const A = ring(0.82, -0.38, 0), B = ring(1, 0.22, 0.5), bot = [cx, cy - ry * 0.72, cz], top = [cx, cy + ry, cz], o = [cx, cy, cz];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; T(ctx, A[j], A[i], bot, o); Q(ctx, A[i], A[j], B[j], B[i], o); T(ctx, B[i], B[j], top, o); }
}
function flat(ctx, x, y, z, s, a) { const c = Math.cos(a) * s, d = Math.sin(a) * s; ctx.quad(x - c, y, z - d, x - d, y, z + c, x + c, y, z + d, x + d, y, z - c); }
export function tree(ctx, lod, t, idx) {
  const [x, z, gy, kind, sc = 1] = t, R = rnd(idx * 17 + 3), cols = BLOSSOM[kind];
  const top = [x + (R() - 0.5) * 0.35, gy + 1.45 * sc, z + (R() - 0.5) * 0.35];
  paint(ctx, 'walnut', 'oklch(0.6 0.04 50)', 0.95);
  const seg = lod <= 2 ? 6 : 4;
  solid(ctx, ngon(seg, 0.2 * sc, x, z).map(([a, b]) => [a, gy - 0.3, b]), ngon(seg, 0.12 * sc, top[0], top[2]).map(([a, b]) => [a, top[1], b]));
  const nb = lod <= 2 ? 5 : lod <= 4 ? 3 : 2, P = [[0, 2.75, 0, 1.3]];
  for (let k = 0; k < nb - 1; k++) { const a = k / (nb - 1) * TAU + R() * 1.2; P.push([Math.cos(a) * 1.15, 2.2 + R() * 0.5, Math.sin(a) * 1.15, 0.9 + R() * 0.3]); }
  if (lod <= 3) for (let k = 1; k < P.length; k++) { const p = P[k]; beam(ctx, top, [x + p[0] * 0.75 * sc, gy + (p[1] - 0.25) * sc, z + p[2] * 0.75 * sc], 0.09 * sc, 0.09 * sc); }
  P.forEach((p, k) => { paint(ctx, null, cols[k % 3], 0.9); puff(ctx, x + p[0] * sc, gy + p[1] * sc, z + p[2] * sc, p[3] * sc, p[3] * 0.78 * sc, p[3] * sc, lod <= 2 ? 7 : 5, R); });
  if (lod > 2) return;
  if (kind === 'apple') {
    paint(ctx, null, 'oklch(0.58 0.19 28)', 0.5);
    for (let k = 1; k < P.length; k++) { const p = P[k]; gem(ctx, x + p[0] * sc * 1.1, gy + (p[1] - p[3] * 0.55) * sc, z + p[2] * sc * 1.1, 0.075, 0.06, 0.07, 5); }
    for (let k = 0; k < 3; k++) { const a = R() * TAU, r = 0.6 + R() * 1.4; gem(ctx, x + Math.cos(a) * r, gy + 0.06, z + Math.sin(a) * r, 0.07, 0.06, 0.03, 5); }
  }
  for (let k = 0; k < 16; k++) { const a = R() * TAU, r = 0.35 + R() * 2.1; paint(ctx, null, cols[k % 2], 0.9); flat(ctx, x + Math.cos(a) * r, gy + 0.02 + R() * 0.01, z + Math.sin(a) * r, 0.05 + R() * 0.03, R() * 3); }
}
function camp(ctx, lod) {
  const [fx, fz] = D.fire, R = rnd(5);
  paint(ctx, null, 'oklch(0.34 0.01 60)', 1); prism(ctx, ngon(12, 0.72, fx, fz), -0.08, 0.02);
  paint(ctx, null, 'oklch(0.2 0.01 40)', 1); prism(ctx, ngon(8, 0.38, fx, fz), 0.02, 0.04);
  const n = lod <= 3 ? 11 : 7, r0 = 0.88;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (R() - 0.5) * 0.1, w = 2 * r0 * Math.sin(Math.PI / n) * 0.9, h = 0.26 + R() * 0.1;
    paint(ctx, 'stone', STONE[i % 3], 0.92); obox(ctx, fx + Math.cos(a) * r0, -0.1, fz + Math.sin(a) * r0, w, h, 0.3 + R() * 0.06, -a + Math.PI / 2);
  }
  paint(ctx, 'walnut', 'oklch(0.5 0.03 50)', 0.95);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; beam(ctx, [fx + Math.cos(a) * 0.48, 0, fz + Math.sin(a) * 0.48], [fx + Math.cos(a) * 0.06, 0.6, fz + Math.sin(a) * 0.06], 0.1, 0.1); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.7 0.2 45)', 0.6); ctx.emissive('oklch(0.72 0.2 45)'); for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 0.12 + (i % 3) * 0.1; obox(ctx, fx + Math.cos(a) * r, 0.02, fz + Math.sin(a) * r, 0.09, 0.05, 0.07, a); } ctx.emissive(null); }
  // canvas A-frame tent, ridge along z, door toward +z (the fire)
  const [tx, tz] = D.tent, w = 1.25, h = 1.7, z0 = tz - 1.3, z1 = tz + 1.3, o = [tx, 0.55, tz], band = 0.22;
  paint(ctx, null, 'oklch(0.66 0.07 195)', 0.9); prism(ctx, [[tx - w + 0.1, z0 + 0.1], [tx + w - 0.1, z0 + 0.1], [tx + w - 0.1, z1 - 0.05], [tx - w + 0.1, z1 - 0.05]], -0.02, 0.02);
  for (const s of [-1, 1]) {
    const eave = (y) => tx + s * w * (1 - y / h), ext = 0.08;
    paint(ctx, null, 'oklch(0.94 0.035 85)', 0.95); Q(ctx, [eave(band), band, z0 - ext], [tx, h, z0 - ext], [tx, h, z1 + ext], [eave(band), band, z1 + ext], o);
    paint(ctx, null, 'oklch(0.64 0.08 195)', 0.95); Q(ctx, [eave(0), 0, z0 - ext], [eave(band), band, z0 - ext], [eave(band), band, z1 + ext], [eave(0), 0, z1 + ext], o);
  }
  paint(ctx, null, 'oklch(0.9 0.035 85)', 0.95);
  T(ctx, [tx - w, 0, z0], [tx + w, 0, z0], [tx, h, z0], o);
  T(ctx, [tx - w, 0, z1], [tx - 0.5, 0, z1], [tx, h, z1], o); T(ctx, [tx + 0.5, 0, z1], [tx + w, 0, z1], [tx, h, z1], o);
  paint(ctx, null, 'oklch(0.88 0.04 82)', 0.95);
  for (const s of [-1, 1]) beam(ctx, [tx + s * 0.55, 0.05, z1 + 0.05], [tx + s * 0.08, h - 0.15, z1 + 0.05], 0.12, 0.1);
  paint(ctx, 'walnut', 'oklch(0.7 0.04 55)', 0.9);
  for (const zz of [z0 - 0.12, z1 + 0.12]) beam(ctx, [tx, -0.1, zz], [tx, h + 0.18, zz], 0.06, 0.06);
  beam(ctx, [tx, h + 0.03, z0 - 0.2], [tx, h + 0.03, z1 + 0.2], 0.05, 0.05);
  if (lod <= 3) {
    paint(ctx, null, 'oklch(0.85 0.03 80)', 0.9);
    beam(ctx, [tx, h + 0.12, z0 - 0.12], [tx, 0, z0 - 1.0], 0.015, 0.015); beam(ctx, [tx, h + 0.12, z1 + 0.12], [tx, 0, z1 + 1.0], 0.015, 0.015);
    paint(ctx, 'walnut', 'oklch(0.6 0.04 50)', 0.9); obox(ctx, tx, -0.05, z0 - 1.0, 0.05, 0.14, 0.05); obox(ctx, tx, -0.05, z1 + 1.0, 0.05, 0.14, 0.05);
    // bedroll inside + firewood stack + crate
    paint(ctx, null, 'oklch(0.55 0.07 150)', 0.95); obox(ctx, tx - 0.4, 0.02, tz - 0.2, 0.6, 0.14, 1.7);
    paint(ctx, 'oak', 'oklch(0.9 0.04 75)', 0.9);
    for (let i = 0; i < 5; i++) { const yy = i < 3 ? 0.08 : 0.21, xx = -9.6 + (i < 3 ? i * 0.17 : (i - 3) * 0.17 + 0.085); beam(ctx, [xx, yy, -8.1], [xx, yy, -7.3], 0.15, 0.15); }
    paint(ctx, 'oak', 'oklch(0.93 0.04 78)', 0.85); obox(ctx, -4.4, 0, -8.4, 0.55, 0.45, 0.45, 0.4);
  }
  // lantern on a pole
  const [lx, lz] = D.lamp;
  paint(ctx, 'walnut', 'oklch(0.66 0.04 52)', 0.9); obox(ctx, lx, -0.2, lz, 0.1, 2.45, 0.1); beam(ctx, [lx, 2.12, lz], [lx + 0.55, 2.12, lz], 0.06, 0.06);
  const hx = lx + 0.45;
  paint(ctx, 'brass', 'oklch(0.78 0.08 80)', 0.4, 0.8);
  beam(ctx, [hx, 2.09, lz], [hx, 1.98, lz], 0.015, 0.015); obox(ctx, hx, 1.93, lz, 0.2, 0.05, 0.2); obox(ctx, hx, 1.62, lz, 0.2, 0.04, 0.2);
  if (lod <= 2) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, hx + a * 0.085, 1.66, lz + b * 0.085, 0.025, 0.27, 0.025);
  paint(ctx, null, 'oklch(0.95 0.1 85)', 0.3); ctx.emissive('oklch(0.86 0.15 75)'); obox(ctx, hx, 1.66, lz, 0.15, 0.27, 0.15); ctx.emissive(null);
}
function lookout(ctx, lod) {
  const W = D.walk, K = D.deck, X = W.x;
  paint(ctx, 'stone', STONE[0], 0.92); obox(ctx, X, -0.34, W.z0 - 0.3, 1.9, 0.28, 0.55);
  paint(ctx, 'oak', 'oklch(0.95 0.035 78)', 0.85);
  if (lod <= 2) {
    for (let z = W.z0; z < W.z1 - 0.01; z += 0.17) obox(ctx, X, -0.06, z + 0.075, W.w, 0.06, 0.15);
    for (let z = K.z0; z < K.z1 - 0.01; z += 0.2) obox(ctx, (K.x0 + K.x1) / 2, -0.06, z + 0.09, K.x1 - K.x0, 0.06, 0.18);
  } else { obox(ctx, X, -0.06, (W.z0 + W.z1) / 2, W.w, 0.06, W.z1 - W.z0); obox(ctx, (K.x0 + K.x1) / 2, -0.06, (K.z0 + K.z1) / 2, K.x1 - K.x0, 0.06, K.z1 - K.z0); }
  paint(ctx, 'walnut', 'oklch(0.72 0.04 55)', 0.9);
  if (lod <= 3) for (const s of [-1, 1]) beam(ctx, [X + s * 0.62, -0.13, W.z0], [X + s * 0.62, -0.13, K.z0], 0.08, 0.14);
  const post = (x, z, y1, y0 = -2.8) => obox(ctx, x, y0, z, 0.14, y1 - y0, 0.14);
  for (const z of [W.z0 + 0.3, 0.2]) for (const s of [-1, 1]) post(X + s * 0.72, z, -0.06, -0.6);
  const RH = 1.02, rail = (a, b) => { beam(ctx, [a[0], RH, a[1]], [b[0], RH, b[1]], 0.1, 0.07); if (lod <= 3) beam(ctx, [a[0], 0.5, a[1]], [b[0], 0.5, b[1]], 0.05, 0.05); };
  const L = X - 0.8, Rr = X + 0.8, x0 = K.x0 + 0.07, x1 = K.x1 - 0.07, zN = K.z0 + 0.07, zS = K.z1 - 0.07;
  for (const z of [2.1]) for (const x of [L, Rr]) post(x, z, RH + 0.06);
  for (const [x, z] of [[x0, zN], [x1, zN], [x0, zS], [x1, zS], [x0, (zN + zS) / 2], [x1, (zN + zS) / 2], [X, zS], [L, zN], [Rr, zN]]) post(x, z, RH + 0.06);
  if (lod <= 4) { rail([L, 0.4], [L, zN]); rail([Rr, 0.4], [Rr, zN]); rail([x0, zN], [L, zN]); rail([Rr, zN], [x1, zN]); rail([x0, zN], [x0, zS]); rail([x1, zN], [x1, zS]); rail([x0, zS], [x1, zS]); }
  if (lod <= 4) for (const x of [L, Rr]) post(x, 0.4, RH + 0.06, -0.6);
  // post lanterns at the platform's lake corners (emissive only)
  for (const x of [x0, x1]) {
    paint(ctx, 'brass', 'oklch(0.78 0.08 80)', 0.4, 0.8); obox(ctx, x, RH + 0.06, zS, 0.18, 0.03, 0.18); obox(ctx, x, RH + 0.33, zS, 0.2, 0.05, 0.2);
    paint(ctx, null, 'oklch(0.95 0.1 85)', 0.3); ctx.emissive('oklch(0.86 0.15 75)'); obox(ctx, x, RH + 0.09, zS, 0.13, 0.24, 0.13); ctx.emissive(null);
  }
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  (p.trees || []).forEach((t, i) => tree(ctx, lod, t, i));
  camp(ctx, lod); lookout(ctx, lod);
}
export function collider(ctx) {
  const p = ctx.params || {}, W = D.walk, K = D.deck, X = W.x;
  for (const [x, z, gy] of p.trees || []) box(ctx, x - 0.2, gy - 0.3, z - 0.2, x + 0.2, gy + 1.8, z + 0.2);
  const [fx, fz] = D.fire; prism(ctx, ngon(10, 1.05, fx, fz), -0.1, 0.35);
  const [tx, tz] = D.tent; solid(ctx, [[tx - 1.25, 0, tz - 1.4], [tx + 1.25, 0, tz - 1.4], [tx, 1.8, tz - 1.4]], [[tx - 1.25, 0, tz + 1.4], [tx + 1.25, 0, tz + 1.4], [tx, 1.8, tz + 1.4]]);
  const [lx, lz] = D.lamp; box(ctx, lx - 0.08, -0.2, lz - 0.08, lx + 0.08, 2.3, lz + 0.08);
  box(ctx, X - 0.8, -0.3, W.z0, X + 0.8, 0, K.z0); box(ctx, K.x0, -0.3, K.z0, K.x1, 0, K.z1);
  const RH = 1.08, t = 0.05;
  box(ctx, X - 0.8 - t, 0, 0.4, X - 0.8 + t, RH, K.z0); box(ctx, X + 0.8 - t, 0, 0.4, X + 0.8 + t, RH, K.z0);
  box(ctx, K.x0, 0, K.z0, X - 0.8, RH, K.z0 + 2 * t); box(ctx, X + 0.8, 0, K.z0, K.x1, RH, K.z0 + 2 * t);
  box(ctx, K.x0, 0, K.z0, K.x0 + 2 * t, RH, K.z1); box(ctx, K.x1 - 2 * t, 0, K.z0, K.x1, RH, K.z1); box(ctx, K.x0, 0, K.z1 - 2 * t, K.x1, RH, K.z1);
}
