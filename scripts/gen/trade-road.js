// The trade road outside the grand gate. params.kind picks the piece; feet at ground, front toward −Z, metres.
// "road": the roadside trade strip, a list of items in params.items [kind, x, y, z, yawDeg] (y relative to feet):
//   crates, barrels, bales, mule (a saddled pack mule tied at its hitching post), wagon (canvas supply wagon), handcart
//   (a broken cart spilling apples and grain), lamp (low lantern post), patch (gravel + clover cluster, seeded by its x).
// "gate": dressing laid in the grand gate's own frame (feet = gate feet, no turn): road-side buttresses on the wing walls,
//   gargoyle waterspouts on the coping, two sentry pedestals with iron braziers (params.ped = ground y per side),
//   the carved guardians on the end piers and the wrought-iron banner mounts on the main piers.
// "banner": one heraldic banner, feet at its hem, top at params.drop; worn with scripts/material-den-sway.js (vertex paint).
import { paint, obox, beam, lathe, blob, TAU } from '../lib/yard-kit.js';
import { Q, T, solid, ngon, prism, box, gem } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const STRAW = 'cdn/texture-golden-rolled-hay-bale-straw.png', CANVAS = 'cdn/texture-woven-linen-canvas.png';
const C = {
  oak: 'oklch(0.93 0.04 75)', walnut: 'oklch(0.85 0.03 60)', iron: 'oklch(0.3 0.015 60)', cream: 'oklch(0.95 0.03 88)',
  teal: 'oklch(0.55 0.08 195)', terra: 'oklch(0.6 0.12 42)', sage: 'oklch(0.72 0.06 128)', straw: 'oklch(0.96 0.05 88)',
  rope: 'oklch(0.62 0.05 70)', leather: 'oklch(0.45 0.06 50)', mule: 'oklch(0.5 0.05 55)', mule2: 'oklch(0.66 0.04 70)',
  dark: 'oklch(0.25 0.02 50)', nose: 'oklch(0.82 0.03 75)', glass: 'oklch(0.92 0.13 80)', glow: 'oklch(0.85 0.15 70)',
  stone: (r) => `oklch(${(0.84 + r * 0.08).toFixed(3)} 0.022 ${(74 + r * 16).toFixed(0)})`, weather: 'oklch(0.74 0.02 90)',
};
function XF(ctx, ox, oy, oz, yaw = 0, pitch = 0) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const t = (a, i) => { const x = a[i], y = a[i + 1], z = a[i + 2], y1 = y * cp - z * sp, z1 = y * sp + z * cp; return [ox + x * cy + z1 * sy, oy + y1, oz - x * sy + z1 * cy]; };
  return { lod: ctx.lod, quad: (...a) => ctx.quad(...t(a, 0), ...t(a, 3), ...t(a, 6), ...t(a, 9)), tri: (...a) => ctx.tri(...t(a, 0), ...t(a, 3), ...t(a, 6)) };
}
const col = (ctx, c, rough = 0.8, e = null, metal = 0) => { ctx.albedo(null); ctx.color(c); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(e); };
const tex = (ctx, t, c, rough = 0.9) => { ctx.albedo(t); ctx.color(c); ctx.roughness(rough); ctx.metalness(0); ctx.emissive(null); };
function rng(seed) { let s = (Math.abs(Math.floor(seed * 9973)) % 2147483646) + 1; return () => (s = s * 16807 % 2147483647) / 2147483647; }

// ---------- trade goods ----------
function crate(ctx, P, cx, cy, cz, s, yaw, lod) {
  paint(ctx, 'oak', C.oak, 0.85); obox(P, cx, cy, cz, s, s, s, yaw);
  if (lod > 2) return;
  paint(ctx, 'walnut', C.walnut, 0.85); obox(P, cx, cy + 0.03, cz, s + 0.03, 0.07, s + 0.03, yaw); obox(P, cx, cy + s - 0.1, cz, s + 0.03, 0.07, s + 0.03, yaw);
  if (lod <= 1) { const c = Math.cos(yaw), sn = Math.sin(yaw); for (const k of [-1, 1]) { const ox = k * (s / 2 + 0.012); obox(P, cx + ox * c, cy + 0.08, cz - ox * sn, 0.03, s - 0.16, 0.08, yaw); } }
}
function barrel(ctx, P, cx, cy, cz, lod) {
  const n = lod <= 2 ? 12 : 7;
  paint(ctx, 'oak', 'oklch(0.86 0.05 65)', 0.85); lathe(P, [[0.25, cy], [0.3, cy + 0.2], [0.32, cy + 0.42], [0.3, cy + 0.64], [0.25, cy + 0.84]], n, cx, cz);
  if (lod > 2) return;
  col(ctx, C.iron, 0.5, null, 0.5); for (const y of [0.12, 0.7]) lathe(P, [[0.305, cy + y], [0.308, cy + y + 0.07]], n, cx, cz);
}
function bale(ctx, P, cx, cy, cz, yaw, lod) {
  tex(ctx, STRAW, C.straw, 0.95); obox(P, cx, cy, cz, 1.0, 0.46, 0.6, yaw);
  if (lod > 2) return;
  col(ctx, C.rope, 0.9); const c = Math.cos(yaw), s = Math.sin(yaw);
  for (const d of [-0.26, 0.26]) obox(P, cx + d * c, cy - 0.01, cz - d * s, 0.04, 0.48, 0.62, yaw);
}
function crates(ctx, P, lod) { crate(ctx, P, -0.36, 0, 0, 0.64, 0.05, lod); crate(ctx, P, 0.34, 0, 0.06, 0.58, -0.12, lod); crate(ctx, P, 0.02, 0.61, 0.02, 0.5, 0.4, lod); if (lod <= 2) { col(ctx, 'oklch(0.62 0.16 30)', 0.7); for (let i = 0; i < 5; i++) blob(P, 0.28 + (i % 3) * 0.12 - 0.12, 0.58, 0.02 + Math.floor(i / 3) * 0.12 - 0.05, 0.055, 0.1, 0.055, 5); } }
function barrels(ctx, P, lod) { barrel(ctx, P, -0.36, 0, 0, lod); barrel(ctx, P, 0.34, 0, 0.08, lod); barrel(ctx, P, 0, 0, -0.52, lod); if (lod <= 2) { paint(ctx, 'walnut', C.walnut, 0.85); obox(P, 0, 0.84, -0.52, 0.5, 0.03, 0.5, 0.3); } }
function bales(ctx, P, lod) { bale(ctx, P, -0.55, 0, 0, 0.08, lod); bale(ctx, P, 0.52, 0, 0.1, -0.05, lod); bale(ctx, P, 0, 0.46, 0.05, 0.25, lod); bale(ctx, P, 0.15, 0, 0.9, 1.45, lod); }

// ---------- pack mule at its hitching post ----------
function mule(ctx, P, lod, coat) {
  const R = (z, rx, ry, cy, n = lod <= 2 ? 8 : 6) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU + TAU / 16; a.push([Math.cos(t) * rx, cy + Math.sin(t) * ry, z]); } return a; };
  // hitching post, in front of the head
  paint(ctx, 'walnut', C.walnut, 0.85); for (const x of [-0.8, 0.8]) { obox(P, x, 0, -1.62, 0.14, 1.12, 0.14); if (lod <= 2) obox(P, x, 1.12, -1.62, 0.18, 0.05, 0.18); }
  beam(P, [-0.95, 0.98, -1.62], [0.95, 0.98, -1.62], 0.1, 0.1);
  col(ctx, coat, 0.85);
  const S = [R(-0.62, 0.21, 0.25, 1.0), R(-0.36, 0.27, 0.31, 0.98), R(0.36, 0.28, 0.31, 0.98), R(0.64, 0.21, 0.25, 1.0)];
  for (let i = 0; i < 3; i++) solid(P, S[i], S[i + 1]);
  for (const x of [-0.14, 0.14]) {
    beam(P, [x, 0.86, -0.42], [x, 0.12, -0.44], 0.1, 0.11);
    beam(P, [x, 0.88, 0.44], [x, 0.46, 0.53], 0.12, 0.13); beam(P, [x, 0.48, 0.52], [x, 0.12, 0.47], 0.09, 0.1);
  }
  beam(P, [0, 1.1, -0.5], [0, 1.5, -0.84], 0.19, 0.3);
  beam(P, [0, 1.56, -0.84], [0, 1.3, -1.18], 0.19, 0.24);
  for (const x of [-1, 1]) beam(P, [x * 0.06, 1.62, -0.84], [x * 0.14, 1.92, -0.76], 0.07, 0.03);
  col(ctx, C.nose, 0.85); beam(P, [0, 1.34, -1.1], [0, 1.25, -1.26], 0.16, 0.17);
  col(ctx, C.dark, 0.8);
  for (const x of [-0.14, 0.14]) for (const z of [-0.44, 0.47]) obox(P, x, 0, z, 0.13, 0.1, 0.15);
  beam(P, [0, 1.36, -0.56], [0, 1.72, -0.86], 0.06, 0.1); beam(P, [0, 1.08, 0.64], [0, 0.72, 0.74], 0.05, 0.05); beam(P, [0, 0.76, 0.73], [0, 0.44, 0.76], 0.1, 0.08);
  for (const x of [-1, 1]) obox(P, x * 0.1, 1.45, -0.96, 0.03, 0.04, 0.05);
  // halter and lead rope
  col(ctx, C.leather, 0.8); if (lod <= 2) beam(P, [-0.105, 1.36, -1.08], [0.105, 1.36, -1.08], 0.04, 0.05);
  col(ctx, C.rope, 0.9); beam(P, [0, 1.25, -1.17], [0.2, 0.98, -1.6], 0.025, 0.025);
  // pack saddle: striped blanket, sawbuck, panniers, bedroll
  col(ctx, C.teal, 0.9); obox(P, 0, 1.24, 0, 0.66, 0.05, 0.78); for (const x of [-1, 1]) obox(P, x * 0.31, 0.92, 0, 0.04, 0.34, 0.74);
  if (lod <= 2) { col(ctx, C.cream, 0.9); for (const z of [-0.3, 0.3]) obox(P, 0, 1.245, z, 0.67, 0.05, 0.08); }
  paint(ctx, 'walnut', C.walnut, 0.85); for (const z of [-0.22, 0.22]) { beam(P, [-0.15, 1.28, z], [0.08, 1.52, z], 0.05, 0.05); beam(P, [0.15, 1.28, z], [-0.08, 1.52, z], 0.05, 0.05); }
  col(ctx, C.leather, 0.75); for (const x of [-1, 1]) { obox(P, x * 0.43, 0.72, 0.02, 0.2, 0.44, 0.56); if (lod <= 2) { col(ctx, 'oklch(0.38 0.05 45)', 0.75); obox(P, x * 0.44, 1.02, 0.02, 0.21, 0.16, 0.58); col(ctx, C.leather, 0.75); } }
  tex(ctx, CANVAS, C.cream, 0.95); const roll = (x) => { const a = []; const n = lod <= 2 ? 8 : 5; for (let i = 0; i < n; i++) { const t = i / n * TAU; a.push([x, 1.46 + Math.sin(t) * 0.11, Math.cos(t) * 0.11 + 0.05]); } return a; }; solid(P, roll(-0.36), roll(0.36));
  if (lod <= 2) { col(ctx, C.leather, 0.8); for (const x of [-0.2, 0.2]) beam(P, [x, 1.34, 0.05], [x, 1.59, 0.05], 0.04, 0.24); }
}

// ---------- wagon ----------
function wheel(ctx, P, x, y, z, r, lod, broken = 0) {
  const n = lod <= 2 ? 12 : 8, sp = lod <= 2 ? 8 : 4;
  paint(ctx, 'walnut', 'oklch(0.72 0.04 58)', 0.85);
  for (let i = 0; i < n; i++) { if (broken && i === 3) continue; const a = i / n * TAU, b = (i + 1) / n * TAU; beam(P, [x + Math.cos(a) * r, y + Math.sin(a) * r, z], [x + Math.cos(b) * r, y + Math.sin(b) * r, z], 0.07, 0.07); }
  for (let i = 0; i < sp; i++) { if (broken && i === 2) continue; const a = i / sp * TAU + 0.2; beam(P, [x, y, z], [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, z], 0.04, 0.035); }
  col(ctx, C.iron, 0.5, null, 0.5); beam(P, [x, y, z - 0.1], [x, y, z + 0.1], 0.13, 0.13);
}
function wagon(ctx, P, lod) {
  paint(ctx, 'oak', C.oak, 0.85); obox(P, 0, 0.68, 0, 2.8, 0.12, 1.4);
  for (const z of [-0.67, 0.67]) obox(P, 0, 0.8, z, 2.8, 0.38, 0.06);
  obox(P, 1.37, 0.8, 0, 0.06, 0.38, 1.28); obox(P, -1.37, 0.8, 0, 0.06, 0.3, 1.28);
  paint(ctx, 'walnut', C.walnut, 0.85); for (const x of [-0.95, 0.95]) beam(P, [x, 0.55, -0.9], [x, 0.55, 0.9], 0.1, 0.1);
  beam(P, [1.4, 0.55, 0], [2.9, 0.18, 0], 0.09, 0.09); beam(P, [2.7, 0.22, -0.4], [2.7, 0.22, 0.4], 0.06, 0.06);
  obox(P, 1.15, 1.18, 0, 0.36, 0.06, 1.2); obox(P, 1.3, 0.8, 0, 0.06, 0.4, 0.9);
  for (const [x, r] of [[-0.95, 0.5], [0.95, 0.42]]) for (const z of [-0.84, 0.84]) wheel(ctx, P, x, r, z, r, lod);
  // canvas tunnel over three bows
  const N = lod <= 2 ? 9 : 5, X = [-1.35, -0.45, 0.45, 1.0], arc = (i, sc = 1) => { const t = i / N * Math.PI; return [Math.cos(t) * 0.72 * sc, 1.18 + Math.sin(t) * 0.78 * sc]; };
  tex(ctx, CANVAS, C.cream, 0.95);
  for (let k = 0; k < X.length - 1; k++) for (let i = 0; i < N; i++) {
    const [za, ya] = arc(i), [zb, yb] = arc(i + 1), m = (k % 2) ? 0.97 : 1, o = [(X[k] + X[k + 1]) / 2, 1.2, 0];
    const [zc, yc] = arc(i, m), [zd, yd] = arc(i + 1, m);
    Q(P, [X[k], ya, za], [X[k], yb, zb], [X[k + 1], yd, zd], [X[k + 1], yc, zc], o);
  }
  for (let i = 0; i < N; i++) { const [za, ya] = arc(i), [zb, yb] = arc(i + 1); T(P, [-1.35, ya, za], [-1.35, yb, zb], [-1.22, 1.45, 0], [0, 1.4, 0]); }
  if (lod <= 2) { paint(ctx, 'walnut', C.walnut, 0.85); for (const x of X) for (let i = 0; i < N; i++) { const [za, ya] = arc(i, 1.02), [zb, yb] = arc(i + 1, 1.02); beam(P, [x, ya, za], [x, yb, zb], 0.05, 0.04); } }
  tex(ctx, CANVAS, 'oklch(0.86 0.04 80)', 0.95); blob(P, 0.7, 0.8, -0.3, 0.22, 0.42, 0.22, 6); blob(P, 0.72, 0.8, 0.22, 0.2, 0.36, 0.2, 6);
}
function handcart(ctx, P, lod, rnd) {
  const K = XF(P, 0, 0.36, 0, 0, -0.32);                                  // tipped toward its lost wheel (−z side down)
  paint(ctx, 'oak', 'oklch(0.88 0.05 70)', 0.85); obox(K, 0, 0, 0, 1.3, 0.06, 0.9);
  for (const z of [-0.43, 0.43]) obox(K, 0, 0.06, z, 1.3, 0.28, 0.04); obox(K, -0.63, 0.06, 0, 0.04, 0.28, 0.82);
  paint(ctx, 'walnut', C.walnut, 0.85); for (const z of [-0.3, 0.3]) beam(K, [0.4, -0.02, z], [1.35, 0.25, z], 0.05, 0.05);
  beam(K, [0, -0.06, -0.55], [0, -0.06, 0.55], 0.06, 0.06);
  wheel(ctx, K, 0, 0, 0.55, 0.36, lod);
  wheel(ctx, XF(P, -0.5, 0.05, -1.05, 0.3, Math.PI / 2), 0, 0, 0, 0.36, lod, 1);   // the broken wheel, flat in the grass
  paint(ctx, 'walnut', C.walnut, 0.85); beam(P, [0.6, 0.03, -1.2], [0.9, 0.03, -0.95], 0.04, 0.035);
  // grain sacks: two slumped in the bed, one burst on the ground with its grain
  tex(ctx, CANVAS, 'oklch(0.86 0.04 80)', 0.95); blob(K, -0.2, 0.06, 0.1, 0.24, 0.4, 0.2, 6); blob(K, 0.25, 0.06, 0.15, 0.22, 0.34, 0.2, 6);
  blob(P, 0.3, 0, -0.95, 0.32, 0.2, 0.22, 6);
  col(ctx, C.rope, 0.9); obox(K, -0.2, 0.44, 0.1, 0.1, 0.05, 0.1);
  col(ctx, 'oklch(0.9 0.07 85)', 0.95); for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) { const a = rnd() * TAU, r = 0.25 + rnd() * 0.45, x = 0.55 + Math.cos(a) * r * 0.8, z = -1.05 + Math.sin(a) * r * 0.5, s = 0.1 + rnd() * 0.12; T(P, [x - s, 0.015, z], [x + s, 0.015, z + s * 0.5], [x, 0.015, z - s], [x, -1, z]); }
  // apples rolling out toward the road
  const reds = ['oklch(0.58 0.18 28)', 'oklch(0.66 0.16 40)', 'oklch(0.72 0.14 125)'];
  for (let i = 0; i < (lod <= 2 ? 16 : 6); i++) { col(ctx, reds[i % 3], 0.6); const a = rnd() * TAU, r = rnd() * 1.1, x = -0.1 + Math.cos(a) * r, z = -0.95 + Math.sin(a) * r * 0.6; gem(P, x, 0.05, z, 0.05, 0.05, 0.045, 5); }
  for (let i = 0; i < 5; i++) { col(ctx, reds[i % 3], 0.6); gem(K, -0.3 + i * 0.12, 0.34, -0.2 + (i % 2) * 0.12, 0.05, 0.05, 0.045, 5); }
}
function lamp(ctx, P, lod) {
  paint(ctx, 'stone', C.stone(0.4), 0.9); obox(P, 0, 0, 0, 0.3, 0.2, 0.3);
  paint(ctx, 'walnut', C.walnut, 0.85); obox(P, 0, 0.2, 0, 0.12, 0.85, 0.12);
  col(ctx, C.iron, 0.5, null, 0.6); obox(P, 0, 1.05, 0, 0.24, 0.04, 0.24);
  if (lod <= 2) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(P, a * 0.09, 1.09, b * 0.09, 0.025, 0.26, 0.025);
  prism(P, ngon(4, 0.19, 0, 0, TAU / 8), 1.35, 1.48, 0.15);
  col(ctx, C.glass, 0.4, C.glow); obox(P, 0, 1.1, 0, 0.14, 0.24, 0.14); ctx.emissive(null);
}
function patch(ctx, P, lod, rnd) {
  const gs = lod <= 2 ? 10 : 4, cs = lod <= 2 ? 14 : 0;
  for (let i = 0; i < gs; i++) {
    col(ctx, i % 2 ? 'oklch(0.8 0.015 80)' : 'oklch(0.68 0.015 70)', 0.95);
    const a = rnd() * TAU, r = rnd() * 1.1, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.7, s = 0.05 + rnd() * 0.09, R = ngon(5, s, x, z, rnd());
    for (let k = 0; k < 5; k++) T(P, [R[k][0], 0.02, R[k][1]], [R[(k + 1) % 5][0], 0.02, R[(k + 1) % 5][1]], [x, 0.02 + s * 0.4, z], [x, -1, z]);
  }
  for (let i = 0; i < cs; i++) {
    col(ctx, i % 3 ? 'oklch(0.66 0.13 138)' : 'oklch(0.74 0.12 128)', 0.9);
    const a = rnd() * TAU, r = rnd() * 0.95, x = Math.cos(a) * r + 0.3, z = Math.sin(a) * r * 0.7, L = 0.07 + rnd() * 0.04, h = 0.035 + rnd() * 0.04;
    for (let k = 0; k < 3; k++) { const t = rnd() * 0.3 + k * TAU / 3, d = [Math.cos(t), Math.sin(t)], s = [-d[1] * L * 0.45, d[0] * L * 0.45], m = [x + d[0] * L * 0.55, z + d[1] * L * 0.55];
      Q(P, [x, h, z], [m[0] + s[0], h + 0.01, m[1] + s[1]], [x + d[0] * L, h, z + d[1] * L], [m[0] - s[0], h + 0.01, m[1] - s[1]], [x, -1, z]); }
    if (lod <= 1 && i % 5 === 0) { col(ctx, 'oklch(0.97 0.02 90)', 0.8); gem(P, x + 0.04, h + 0.08, z, 0.025, 0.02, 0.02, 5); }
  }
}
const ITEM = { crates, barrels, bales, mule, wagon, handcart, lamp, patch };
const BOX = { crates: [1.3, 1.1, 0.7], barrels: [1.3, 0.85, 1.3], bales: [2.2, 0.92, 2.0], mule: [0.8, 1.6, 1.4, -0.1], wagon: [2.8, 2.0, 1.9], handcart: [1.4, 0.75, 1.0], lamp: [0.3, 1.4, 0.3] };

// ---------- gate dressing ----------
function sentinel(ctx, P, lod) {
  const r = () => ctx.random();
  paint(ctx, 'stone', 'oklch(0.9 0.02 85)', 0.9); obox(P, 0, 0, 0, 0.74, 0.38, 0.74); obox(P, 0, 0.38, 0, 0.66, 0.08, 0.66);
  const n = lod <= 2 ? 12 : 7, S = C.stone(0.55);
  paint(ctx, 'stone', S, 0.9); lathe(P, [[0.3, 0.46], [0.33, 0.66], [0.27, 1.22], [0.23, 1.5], [0.26, 1.58], [0.12, 1.7], [0, 1.72]], n);
  blob(P, 0, 1.62, 0.01, 0.16, 0.3, 0.17, lod <= 2 ? 8 : 5);                         // hood
  paint(ctx, 'stone', C.weather, 0.95); blob(P, 0, 1.64, -0.1, 0.09, 0.16, 0.06, 6);  // shadowed face in the hood
  paint(ctx, 'stone', S, 0.9); for (const x of [-1, 1]) blob(P, x * 0.2, 1.4, 0, 0.12, 0.14, 0.14, 6);
  beam(P, [0.24, 1.46, -0.02], [0.3, 1.14, -0.2], 0.11, 0.11); obox(P, 0.3, 1.08, -0.2, 0.1, 0.12, 0.1);
  beam(P, [-0.24, 1.46, -0.02], [-0.2, 1.06, -0.3], 0.11, 0.11);
  if (lod <= 2) { for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.42, y0 = 0.5, y1 = 1.3, r0 = 0.33, r1 = 0.26; beam(P, [Math.cos(a) * r0, y0, Math.sin(a) * r0], [Math.cos(a) * r1, y1, Math.sin(a) * r1], 0.045, 0.03 + r() * 0.01); } }
  paint(ctx, 'stone', 'oklch(0.86 0.025 80)', 0.9); beam(P, [0.3, 0.46, -0.2], [0.3, 2.35, -0.2], 0.05, 0.05);          // spear
  gem(P, 0.3, 2.42, -0.2, 0.06, 0.24, 0.07, 4); if (lod <= 2) obox(P, 0.3, 2.33, -0.2, 0.16, 0.03, 0.05);
  const sh = (z) => [[0, 0.05], [0.22, 0.2], [0.22, 0.5], [0, 0.62], [-0.22, 0.5], [-0.22, 0.2]].map(([x, y]) => [x - 0.18, 0.5 + y, z]);    // kite shield, leaning on the base
  const K = XF(P, 0, 0, 0, 0, 0.12); solid(K, sh(-0.36), sh(-0.42));
  if (lod <= 2) { paint(ctx, 'stone', 'oklch(0.94 0.02 85)', 0.85); gem(K, -0.18, 0.84, -0.43, 0.08, 0.1, 0.1, 4); paint(ctx, 'moss', 'oklch(0.75 0.1 130)', 0.95); blob(P, 0.28, 0.44, 0.24, 0.12, 0.05, 0.1, 5); }
}
function gargoyle(ctx, P, lod) {                                        // crouched on the coping, spouting toward +z (the road)
  paint(ctx, 'stone', C.weather, 0.95); obox(P, 0, 0, 0.1, 0.3, 0.1, 0.5);
  blob(P, 0, 0.1, 0.2, 0.15, 0.3, 0.2, lod <= 2 ? 7 : 5);
  beam(P, [0, 0.32, 0.3], [0, 0.34, 0.58], 0.18, 0.17);                          // head
  for (const x of [-1, 1]) { beam(P, [x * 0.06, 0.42, 0.38], [x * 0.12, 0.54, 0.3], 0.04, 0.04); beam(P, [x * 0.1, 0.1, 0.35], [x * 0.1, 0.02, 0.45], 0.06, 0.06);
    if (lod <= 2) { const w = [[x * 0.12, 0.3, 0.15], [x * 0.34, 0.5, 0.0], [x * 0.14, 0.18, 0.02]]; Q(P, w[0], w[1], w[2], w[0], [0, 0.2, 0.15]); T(P, w[0], w[1], w[2], [0, 0.25, 0.3]); } }
  paint(ctx, 'stone', 'oklch(0.55 0.02 70)', 0.9); beam(P, [0, 0.3, 0.55], [0, 0.29, 0.72], 0.08, 0.06);      // spout
  paint(ctx, 'moss', 'oklch(0.75 0.1 130)', 0.95); if (lod <= 2) blob(P, -0.05, 0.1, 0.02, 0.12, 0.04, 0.1, 5);
}
function pedestal(ctx, P, lod, rnd) {
  paint(ctx, 'stone', C.stone(0.3), 0.9); obox(P, 0, -0.12, 0, 1.0, 0.3, 1.0); obox(P, 0, 0.18, 0, 0.86, 0.18, 0.86);
  const rows = lod <= 2 ? 3 : 1; for (let i = 0; i < rows; i++) { paint(ctx, 'stone', C.stone(rnd()), 0.9); prism(P, ngon(8, 0.38 - (i % 2) * 0.01, 0, 0, TAU / 16), 0.36 + i * 0.6 / rows, 0.36 + (i + 1) * 0.6 / rows - 0.015); }
  paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.85); obox(P, 0, 0.96, 0, 0.9, 0.12, 0.9); obox(P, 0, 1.08, 0, 0.8, 0.05, 0.8);
  const n = lod <= 2 ? 12 : 7; col(ctx, C.iron, 0.55, null, 0.6);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.5; beam(P, [Math.cos(a) * 0.36, 1.13, Math.sin(a) * 0.36], [Math.cos(a) * 0.3, 1.45, Math.sin(a) * 0.3], 0.05, 0.05); }
  lathe(P, [[0.1, 1.3], [0.3, 1.36], [0.41, 1.5], [0.45, 1.63], [0.49, 1.66], [0.47, 1.7]], n);
  if (lod <= 2) { for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; beam(P, [Math.cos(a) * 0.31, 1.37, Math.sin(a) * 0.31], [Math.cos(a) * 0.46, 1.64, Math.sin(a) * 0.46], 0.04, 0.02); } for (const x of [-1, 1]) beam(P, [x * 0.46, 1.62, -0.06], [x * 0.56, 1.52, 0.06], 0.03, 0.03); }
  col(ctx, 'oklch(0.5 0.14 40)', 0.8, 'oklch(0.72 0.18 45)'); blob(P, 0, 1.64, 0, 0.38, 0.1, 0.38, 7, rnd); ctx.emissive(null);
  col(ctx, 'oklch(0.3 0.02 50)', 0.95); if (lod <= 2) for (let i = 0; i < 4; i++) { const a = i * 1.6; beam(P, [Math.cos(a) * 0.3, 1.7, Math.sin(a) * 0.3], [Math.cos(a + 2.4) * 0.2, 1.8, Math.sin(a + 2.4) * 0.2], 0.07, 0.07); }
}
function buttress(ctx, P, x, lod, rnd) {
  paint(ctx, 'stone', C.stone(rnd()), 0.9); obox(P, x, 0, 0.55, 0.66, 0.16, 0.62);
  const A = [[x - 0.28, 0.16, 0.25], [x + 0.28, 0.16, 0.25], [x + 0.28, 0.16, 0.82], [x - 0.28, 0.16, 0.82]], B = [[x - 0.24, 1.0, 0.25], [x + 0.24, 1.0, 0.25], [x + 0.24, 0.62, 0.52], [x - 0.24, 0.62, 0.52]];
  solid(P, A, B);
  if (lod <= 2) { paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.85); const a = [[x - 0.27, 0.6, 0.5], [x + 0.27, 0.6, 0.5], [x + 0.27, 0.99, 0.28], [x - 0.27, 0.99, 0.28]], b = a.map(([u, v, w]) => [u, v + 0.05, w + 0.03]); solid(P, a, b); }
}
function mount(ctx, P, x, lod) {                                        // wrought-iron banner arm on a pier's road face
  col(ctx, C.iron, 0.5, null, 0.6); obox(P, x, 2.95, 0.53, 0.2, 0.5, 0.05);
  beam(P, [x, 3.3, 0.55], [x, 3.3, 0.95], 0.05, 0.05); beam(P, [x, 3.0, 0.55], [x, 3.28, 0.9], 0.035, 0.035);
  beam(P, [x - 0.46, 3.3, 0.95], [x + 0.46, 3.3, 0.95], 0.035, 0.035);
  for (const k of [-1, 1]) gem(P, x + k * 0.49, 3.3, 0.95, 0.035, 0.05, 0.05, 4);
  if (lod <= 2) { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI; beam(P, [x + Math.cos(a) * 0.1, 3.14 + Math.sin(a) * 0.1, 0.8], [x + Math.cos(a + 0.5) * 0.1, 3.14 + Math.sin(a + 0.5) * 0.1, 0.8], 0.02, 0.02); } }
}
function gate(ctx, p, lod) {
  const rnd = () => ctx.random(), wx = p.wx ?? 11.45, px = p.px ?? 2.675, ped = p.ped ?? [0, 0];
  for (const [i, sx] of [[0, -1], [1, 1]]) {
    for (const x of p.buttress ?? [6.35, 9.55]) buttress(ctx, ctx, sx * x, lod, rnd);
    gargoyle(ctx, XF(ctx, sx * (p.garg ?? 7.95), 1.1, 0), lod);
    pedestal(ctx, XF(ctx, sx * (p.bx ?? 4.05), ped[i], p.bz ?? 1.0), lod, rnd);
    sentinel(ctx, XF(ctx, sx * wx, 1.64, 0, Math.PI), lod);
    mount(ctx, ctx, sx * px, lod);
  }
}
// ---------- banner ----------
function banner(ctx, p, lod) {
  const w = p.w ?? 0.8, H = p.drop ?? 2.4, hw = w / 2, tail = 0.35, cols = lod <= 2 ? 4 : 2, rows = lod <= 2 ? 8 : 3;
  const face = (z) => {                                                  // teal field, cream border, swallowtail hem
    ctx.color(p.field ?? 'oklch(0.48 0.08 200)'); ctx.roughness(0.95);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x0 = -hw + i * w / cols, x1 = x0 + w / cols, y0 = tail + (H - tail) * j / rows, y1 = tail + (H - tail) * (j + 1) / rows;
      z < 0 ? ctx.quad(x0, y0, z, x0, y1, z, x1, y1, z, x1, y0, z) : ctx.quad(x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z);
    }
    const tri = (a, b, c) => z < 0 ? ctx.tri(...a, ...c, ...b) : ctx.tri(...a, ...b, ...c);
    tri([-hw, tail, z], [0, tail, z], [-hw, 0, z]); tri([0, tail, z], [hw, tail, z], [hw, 0, z]); tri([-hw * 0.5, tail, z], [0, tail, z], [0, tail * 0.3, z]); tri([0, tail, z], [hw * 0.5, tail, z], [0, tail * 0.3, z]);
    const dz = z < 0 ? -0.004 : 0.004, e = z + dz; ctx.color(p.trim ?? 'oklch(0.94 0.035 88)');
    const bar = (x0, y0, x1, y1) => z < 0 ? ctx.quad(x0, y0, e, x0, y1, e, x1, y1, e, x1, y0, e) : ctx.quad(x0, y0, e, x1, y0, e, x1, y1, e, x0, y1, e);
    bar(-hw, H - 0.14, hw, H - 0.06); bar(-hw + 0.04, tail, -hw + 0.08, H - 0.14); bar(hw - 0.08, tail, hw - 0.04, H - 0.14); bar(-hw + 0.04, tail + 0.04, hw - 0.04, tail + 0.08);
    // emblem: an oak leaf on a stag's antlers, centred at the banner's upper third
    const cy = H * 0.64, L = (pts) => { for (let k = 1; k < pts.length - 1; k++) tri(pts[0], pts[k], pts[k + 1]); };
    L([[0, cy - 0.3, e], [0.1, cy - 0.12, e], [0.07, cy + 0.02, e], [0.14, cy + 0.12, e], [0, cy + 0.34, e], [-0.14, cy + 0.12, e], [-0.07, cy + 0.02, e], [-0.1, cy - 0.12, e]]);
    ctx.color(p.field ?? 'oklch(0.48 0.08 200)'); bar(-0.008, cy - 0.28, 0.008, cy + 0.26);
    ctx.color(p.trim ?? 'oklch(0.94 0.035 88)');
    for (const s of [-1, 1]) { bar(s > 0 ? 0.12 : -0.3, cy + 0.36, s > 0 ? 0.3 : -0.12, cy + 0.39); const tine = (x, y) => bar(x - 0.012, y, x + 0.012, y + 0.12); tine(s * 0.14, cy + 0.2); tine(s * 0.22, cy + 0.39); tine(s * 0.29, cy + 0.39); tine(s * 0.13, cy + 0.39); }
  };
  face(0.004); face(-0.004);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  if (p.kind === 'gate') return gate(ctx, p, lod);
  if (p.kind === 'banner') return banner(ctx, p, lod);
  for (const [k, x, y, z, yaw = 0] of p.items || []) {
    if (!ITEM[k] || (k === 'patch' && lod > 3) || (lod >= 5 && k !== 'wagon' && k !== 'crates')) continue;
    ITEM[k](ctx, XF(ctx, x, y, z, yaw * Math.PI / 180), lod, k === 'mule' ? (x > 15 ? C.mule2 : C.mule) : rng(x * 13.1 + z));
  }
});
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'banner') return null;
  if (p.kind === 'gate') {
    const ped = p.ped ?? [0, 0];
    for (const [i, sx] of [[0, -1], [1, 1]]) { const x = sx * (p.bx ?? 4.05), z = p.bz ?? 1.0; box(ctx, x - 0.5, ped[i] - 0.12, z - 0.5, x + 0.5, ped[i] + 1.72, z + 0.5);
      for (const b of p.buttress ?? [6.35, 9.55]) box(ctx, sx * b - 0.3, 0, 0.25, sx * b + 0.3, 1.0, 0.86);
      const w = sx * (p.wx ?? 11.45); box(ctx, w - 0.37, 1.64, -0.37, w + 0.37, 3.9, 0.37); }
    return;
  }
  for (const [k, x, y, z, yaw = 0] of p.items || []) { const b = BOX[k]; if (!b) continue; const P = XF(ctx, x, y, z, yaw * Math.PI / 180), dz = b[3] ?? 0; box(P, -b[0] / 2, 0, -b[2] / 2 + dz, b[0] / 2, b[1], b[2] / 2 + dz); if (k === 'mule') box(P, -0.95, 0, -1.72, 0.95, 1.1, -1.52); }
}
