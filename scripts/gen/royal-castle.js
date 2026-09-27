// The royal castle on its rock, north end of the royal avenue (axis x = 0). One builder, params.part picks the row:
// cliff (row 0,0,263.5: absolute y) | stair (row 0,0,233: absolute y) | wall (row 0,14,268) | gatehouse (row 0,14,250)
// | keep (row 0,14,277, the throne hall, spire and courtyard fountain) | tower (a corner tower, origin at its foot).
// Castle parts stand on the plateau (terrain flatten at y 14). −Z faces south, toward the market.
import { paint, crs } from '../lib/town-kit.js';
const TAU = Math.PI * 2;
const LIME = 'oklch(0.96 0.012 85)', STONE = 'oklch(0.93 0.015 80)', GOLD = 'oklch(0.82 0.13 85)', IRON = 'oklch(0.3 0.012 260)';
const SLIT = 'oklch(0.22 0.015 260)', ROOFT = 'oklch(0.97 0.02 262)', CARPET = 'oklch(0.42 0.14 262)';
const ROOF = 'cdn/texture-deep-royal-blue-slate-roof-tiles.png', ROCK = 'cdn/texture-weathered-pale-grey-limestone-cliff-rock.png';
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function face(P, a, b, c, d, o) { if (dot(crs(sub(b, a), sub(c, a)), o) < 0) P.quad(...a, ...d, ...c, ...b); else P.quad(...a, ...b, ...c, ...d); }
function tri(P, a, b, c, o) { if (dot(crs(sub(b, a), sub(c, a)), o) < 0) P.tri(...a, ...c, ...b); else P.tri(...a, ...b, ...c); }
function box(P, x0, y0, z0, x1, y1, z1, bot = false) {
  face(P, [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]);
  if (bot) face(P, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
  face(P, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]);
  face(P, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
  face(P, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  face(P, [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [0, 0, -1]);
}
// a box in a wall's frame: a along u, b up, d along the outward n
const FR = (ox, oz, ux, uz, nx, nz) => ({ ox, oz, ux, uz, nx, nz });
const fp = (F, a, b, d) => [F.ox + F.ux * a + F.nx * d, b, F.oz + F.uz * a + F.nz * d];
function fbox(P, F, a0, b0, a1, b1, d0, d1, back = false) {
  const p = (a, b, d) => fp(F, a, b, d), N = [F.nx, 0, F.nz], U = [F.ux, 0, F.uz];
  face(P, p(a0, b0, d1), p(a1, b0, d1), p(a1, b1, d1), p(a0, b1, d1), N);
  if (back) face(P, p(a0, b0, d0), p(a0, b1, d0), p(a1, b1, d0), p(a1, b0, d0), [-N[0], 0, -N[2]]);
  face(P, p(a0, b1, d0), p(a1, b1, d0), p(a1, b1, d1), p(a0, b1, d1), [0, 1, 0]);
  face(P, p(a0, b0, d0), p(a0, b0, d1), p(a1, b0, d1), p(a1, b0, d0), [0, -1, 0]);
  face(P, p(a1, b0, d0), p(a1, b0, d1), p(a1, b1, d1), p(a1, b1, d0), U);
  face(P, p(a0, b0, d0), p(a0, b1, d0), p(a0, b1, d1), p(a0, b0, d1), [-U[0], 0, -U[2]]);
}
// a lathe band about a vertical axis; r1 = 0 closes a cone; y0 = y1 makes a flat ring (faces up if r0 > r1)
function cyl(P, cx, cz, y0, y1, r0, r1, n, cap = false, inward = false) {
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n, b = TAU * (i + 1) / n, m = (a + b) / 2;
    const o = y0 === y1 ? [0, r0 > r1 ? 1 : -1, 0] : [Math.cos(m) * (inward ? -1 : 1), 0, Math.sin(m) * (inward ? -1 : 1)];
    const A = [cx + Math.cos(a) * r0, y0, cz + Math.sin(a) * r0], B = [cx + Math.cos(b) * r0, y0, cz + Math.sin(b) * r0];
    const C = [cx + Math.cos(b) * r1, y1, cz + Math.sin(b) * r1], D = [cx + Math.cos(a) * r1, y1, cz + Math.sin(a) * r1];
    if (r1 === 0) tri(P, A, B, C, o); else if (r0 === 0) tri(P, A, C, D, o); else face(P, A, B, C, D, o);
    if (cap && r1 > 0) tri(P, [cx, y1, cz], D, C, [0, 1, 0]);
  }
}
function slopedBox(P, x0, x1, za, zb, yb, ta, tb) {
  face(P, [x0, ta, za], [x0, tb, zb], [x1, tb, zb], [x1, ta, za], [0, 1, 0]);
  face(P, [x1, yb, za], [x1, yb, zb], [x1, tb, zb], [x1, ta, za], [1, 0, 0]);
  face(P, [x0, yb, za], [x0, ta, za], [x0, tb, zb], [x0, yb, zb], [-1, 0, 0]);
  face(P, [x0, yb, za], [x1, yb, za], [x1, ta, za], [x0, ta, za], [0, 0, -1]);
  face(P, [x0, yb, zb], [x0, tb, zb], [x1, tb, zb], [x1, yb, zb], [0, 0, 1]);
}
const stone = (P, tex = 'ashlar', col = STONE) => paint(P, tex, col, 0.9);
const gold = (P) => paint(P, null, GOLD, 0.35, 0.75);
const glassB = (P) => paint(P, null, 'oklch(0.42 0.15 258)', 0.25, 0, 'oklch(0.52 0.19 258)');
const glassG = (P) => paint(P, null, 'oklch(0.72 0.15 78)', 0.25, 0, 'oklch(0.74 0.16 72)');
const dark = (P) => paint(P, null, SLIT, 0.95);
function lancet(P, L, F, c, b0, w, h) {
  const p = (a, b, d) => fp(F, a, b, d), N = [F.nx, 0, F.nz], top = b0 + h + w * 0.6;
  glassB(P); face(P, p(c - w / 2, b0, 0.06), p(c + w / 2, b0, 0.06), p(c + w / 2, b0 + h, 0.06), p(c - w / 2, b0 + h, 0.06), N);
  glassG(P); tri(P, p(c - w / 2, b0 + h, 0.06), p(c + w / 2, b0 + h, 0.06), p(c, top, 0.06), N);
  if (L <= 2) {
    stone(P, 'lime', LIME);
    fbox(P, F, c - w / 2 - 0.24, b0, c - w / 2, b0 + h + 0.2, 0, 0.24); fbox(P, F, c + w / 2, b0, c + w / 2 + 0.24, b0 + h + 0.2, 0, 0.24);
    fbox(P, F, c - w / 2 - 0.4, b0 - 0.3, c + w / 2 + 0.4, b0, 0, 0.34);
    gold(P); fbox(P, F, c - 0.2, top - 0.15, c + 0.2, top + 0.35, 0, 0.22);
  }
  if (L <= 1) { gold(P); fbox(P, F, c - 0.04, b0, c + 0.04, b0 + h, 0.06, 0.1); for (let y = b0 + 1.4; y < b0 + h; y += 1.4) fbox(P, F, c - w / 2, y - 0.04, c + w / 2, y + 0.04, 0.06, 0.1); }
}
function rose(P, L, F, bc, r) {
  const n = L <= 2 ? 16 : 8, N = [F.nx, 0, F.nz];
  for (let i = 0; i < n; i++) {
    const a = TAU * i / n, b = TAU * (i + 1) / n;
    (i % 2 ? glassB : glassG)(P);
    tri(P, fp(F, 0, bc, 0.06), fp(F, Math.cos(a) * r, bc + Math.sin(a) * r, 0.06), fp(F, Math.cos(b) * r, bc + Math.sin(b) * r, 0.06), N);
  }
  if (L <= 2) { gold(P); for (let i = 0; i < 16; i++) { const a = TAU * i / 16, ca = Math.cos(a) * (r + 0.15), cb = bc + Math.sin(a) * (r + 0.15); fbox(P, F, ca - 0.24, cb - 0.24, ca + 0.24, cb + 0.24, 0, 0.26); } fbox(P, F, -0.3, bc - 0.3, 0.3, bc + 0.3, 0.06, 0.2); }
}
function finial(P, L, x, y, z, s = 1) {
  gold(P);
  if (L >= 4) { cyl(P, x, z, y, y + 3 * s, 0.3 * s, 0, 5); return; }
  const n = L <= 2 ? 8 : 6;
  cyl(P, x, z, y - 0.3 * s, y + 0.6 * s, 0.3 * s, 0.3 * s, n);
  cyl(P, x, z, y + 0.6 * s, y + 1.0 * s, 0.3 * s, 0.55 * s, n); cyl(P, x, z, y + 1.0 * s, y + 1.4 * s, 0.55 * s, 0.25 * s, n);
  cyl(P, x, z, y + 1.4 * s, y + 3.4 * s, 0.22 * s, 0, n);
}
// a round tower with a flared blue cone
function tower(P, L, o) {
  const { cx = 0, cz = 0, y0 = -2, r, H, cone, talus = true, slits = true, win = true } = o;
  const n = L <= 1 ? 28 : L === 2 ? 20 : L === 3 ? 14 : L === 4 ? 10 : 6;
  stone(P);
  if (L >= 5) { cyl(P, cx, cz, y0, H + 1.4, r + 0.3, r + 0.3, n); paint(P, ROOF, ROOFT, 0.7); cyl(P, cx, cz, H + 1.2, H + 1.2 + cone, r + 1, 0, n); return; }
  if (talus) { cyl(P, cx, cz, y0, 3, r + 0.7, r, n); cyl(P, cx, cz, 3, H - 1.6, r, r, n); }
  else { cyl(P, cx, cz, y0 - 1.4, y0, 0.3, r, n); cyl(P, cx, cz, y0, H - 1.6, r, r, n); }
  if (L <= 3) { cyl(P, cx, cz, H - 1.6, H - 0.6, r, r + 0.5, n); cyl(P, cx, cz, H - 0.6, H + 1.4, r + 0.5, r + 0.5, n); }
  else cyl(P, cx, cz, H - 1.6, H + 1.4, r + 0.4, r + 0.4, n);
  if (L <= 2) {
    gold(P); cyl(P, cx, cz, H - 2.3, H - 1.95, r + 0.06, r + 0.06, n); if (talus) cyl(P, cx, cz, H * 0.45, H * 0.45 + 0.3, r + 0.06, r + 0.06, n);
    if (L <= 1 && r > 2.5) { stone(P); const m = Math.round(TAU * r / 1.6); for (let i = 0; i < m; i++) { const a = TAU * (i + 0.5) / m, F = FR(cx + Math.cos(a) * r, cz + Math.sin(a) * r, -Math.sin(a), Math.cos(a), Math.cos(a), Math.sin(a)); fbox(P, F, -0.22, H - 2.6, 0.22, H - 1.6, 0, 0.45); } }
  }
  if (slits && L <= 1) { dark(P); for (const [fy, off] of [[0.28, 0], [0.5, 0.5], [0.7, 0]]) for (let k = 0; k < 6; k++) { const a = TAU * (k + off) / 6 + 0.26, F = FR(cx + Math.cos(a) * r, cz + Math.sin(a) * r, -Math.sin(a), Math.cos(a), Math.cos(a), Math.sin(a)); fbox(P, F, -0.1, H * fy, 0.1, H * fy + 1.5, -0.05, 0.04); } }
  if (win && L <= 2) for (let k = 0; k < 4; k++) { const a = TAU * k / 4 + TAU / 8, F = FR(cx + Math.cos(a) * r, cz + Math.sin(a) * r, -Math.sin(a), Math.cos(a), Math.cos(a), Math.sin(a)); lancet(P, L, F, 0, H - 7.5, 0.9, 2.2); }
  paint(P, ROOF, ROOFT, 0.7);
  const e = r + (r > 2.5 ? 1.1 : 0.55), T = H + 1.2 + cone;
  cyl(P, cx, cz, H + 1.0, H + 2.4, e, r + 0.6, n); cyl(P, cx, cz, H + 2.4, T, r + 0.6, 0, n);
  if (L <= 3) cyl(P, cx, cz, H + 1.0, H + 1.0, r + 0.4, e, n);
  if (L <= 2) { gold(P); cyl(P, cx, cz, H + 1.0, H + 1.25, e + 0.02, e - 0.1, n); }
  finial(P, L, cx, T - 0.3, cz, r > 2.5 ? 1 : 0.6);
}
function towerCollider(P, o) { const { cx = 0, cz = 0, y0 = -2, r, H } = o; stone(P); cyl(P, cx, cz, y0, H + 1.4, r + 0.2, r + 0.2, 12); }
// ---------------- cliff ----------------
const hn = (x, y, z) => Math.sin(x * 0.9 + z * 0.5 + y * 0.8) * 0.45 + Math.sin(x * 0.37 - z * 0.71 + y * 0.3) * 0.35 + Math.sin((x + z) * 0.19 - y * 0.55) * 0.3;
const CW = 43, CD = 30.5, CC = 5, NOTCH = 8.6;
const RIM = [[NOTCH, -CD], [CW - CC, -CD], [CW, -CD + CC], [CW, CD - CC], [CW - CC, CD], [-CW + CC, CD], [-CW, CD - CC], [-CW, -CD + CC], [-CW + CC, -CD], [-NOTCH, -CD]];
function cliffFaces(P, L) {
  const step = [0, 2.5, 3.5, 6, 12, 1e9][L];
  const pts = [];
  for (let i = 0; i + 1 < RIM.length; i++) {
    const [ax, az] = RIM[i], [bx, bz] = RIM[i + 1], k = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / step));
    for (let j = 0; j < k; j++) pts.push([ax + (bx - ax) * j / k, az + (bz - az) * j / k]);
  }
  pts.push(RIM[RIM.length - 1]);
  const nor = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    return [dz / l, -dx / l];
  });
  const rows = L <= 2 ? [[-0.7, 14.45], [0.5, 13.4], [1.3, 10.5], [1.9, 7], [2.6, 3.5], [3.6, 0], [4.4, -2.2]] : L === 3 ? [[-0.7, 14.45], [1.3, 10.5], [2.6, 3.5], [4.4, -2.2]] : [[-0.7, 14.45], [2.0, 6], [4.4, -2.2]];
  const V = pts.map((p, i) => rows.map(([o, y], r) => {
    const edge = r === 0 || r === rows.length - 1, nz = L <= 3 ? hn(p[0] * 0.8, y, p[1] * 0.8) : 0;
    const oo = o + (edge ? nz * 0.2 : nz * 1.0), yy = edge ? y : y + hn(p[1], y * 2, p[0]) * 0.5;
    return [p[0] + nor[i][0] * oo, yy, p[1] + nor[i][1] * oo];
  }));
  paint(P, ROCK, 'oklch(0.94 0.015 80)', 0.95);
  for (let i = 0; i + 1 < pts.length; i++) for (let r = 0; r + 1 < rows.length; r++) {
    const o = [(nor[i][0] + nor[i + 1][0]) / 2, 0.2, (nor[i][1] + nor[i + 1][1]) / 2];
    face(P, V[i][r], V[i + 1][r], V[i + 1][r + 1], V[i][r + 1], o);
  }
}
function rimParapet(P, L) { // a limestone breastwork along the plateau edge, keeps walkers from the drop
  stone(P);
  for (let i = 0; i + 1 < RIM.length; i++) {
    const [ax, az] = RIM[i], [bx, bz] = RIM[i + 1], len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
    const F = FR(ax, az, ux, uz, uz, -ux);
    fbox(P, F, 0, 13.6, len, 15.0, -1.3, -0.5, true);
    if (L <= 2) { paint(P, 'lime', LIME, 0.85); fbox(P, F, -0.2, 15.0, len + 0.2, 15.22, -1.42, -0.38); stone(P); }
  }
}
// ---------------- stair ----------------
const FL = [{ z0: -11, z1: -5.6, y0: 0.5, y1: 5 }, { z0: -2.6, z1: 2.8, y0: 5, y1: 9.5 }, { z0: 5.8, z1: 11.2, y0: 9.5, y1: 14 }];
const LAND = [[-5.6, -2.6, 5], [2.8, 5.8, 9.5], [11.2, 13.5, 14]];
const SW = 7;
function brazier(P, L, x, y, z) {
  gold(P);
  const n = L <= 2 ? 10 : 6;
  cyl(P, x, z, y, y + 0.5, 0.18, 0.18, n); cyl(P, x, z, y + 0.5, y + 1.0, 0.25, 0.6, n); cyl(P, x, z, y + 1.0, y + 1.0, 0.6, 0.45, n);
  paint(P, null, 'oklch(0.35 0.08 40)', 0.9, 0, null); P.emissive(1.6, 0.45, 0.1); cyl(P, x, z, y + 0.9, y + 0.9, 0.46, 0, n);
  if (L <= 2) { P.emissive(3.2, 1.35, 0.3); P.color('oklch(0.85 0.16 70)'); for (const [dx, dz, h] of [[0, 0, 1.2], [0.2, 0.1, 0.8], [-0.18, -0.12, 0.9], [0.05, -0.22, 0.7]]) cyl(P, x + dx, z + dz, y + 0.95, y + 0.95 + h, 0.22, 0, 5); }
  P.emissive(null);
}
function lion(P, L, x, y, z, s) { // a couchant lion looking south (−z)
  const b = (x0, y0, z0, x1, y1, z1) => box(P, x + x0 * s, y + y0 * s, z + z0 * s, x + x1 * s, y + y1 * s, z + z1 * s);
  paint(P, 'lime', LIME, 0.8);
  if (L >= 4) { b(-0.7, 0, -1.6, 0.7, 2.0, 1.4); return; }
  b(-0.55, 0, -0.6, 0.55, 0.95, 1.3); b(-0.68, 0, 0.35, 0.68, 1.05, 1.45); b(-0.62, 0, -0.95, 0.62, 1.35, -0.2);
  b(-0.78, 0.8, -1.25, 0.78, 2.15, -0.35);
  b(-0.42, 1.1, -1.6, 0.42, 1.85, -1.1);
  if (L <= 2) {
    b(-0.24, 1.1, -1.85, 0.24, 1.48, -1.5); b(-0.55, 0, -1.6, -0.18, 0.36, -0.5); b(0.18, 0, -1.6, 0.55, 0.36, -0.5);
    b(-0.4, 1.8, -1.2, -0.2, 2.35, -0.95); b(0.2, 1.8, -1.2, 0.4, 2.35, -0.95); b(-0.08, 0.1, 1.4, 0.08, 0.26, 2.1); b(0.5, 0, 1.0, 0.75, 0.3, 1.5); b(-0.75, 0, 1.0, -0.5, 0.3, 1.5);
    gold(P); b(-0.64, 0.75, -0.9, 0.64, 0.88, -0.3); b(-0.3, 2.15, -0.9, 0.3, 2.4, -0.55);
  }
}
function plinth(P, L, x, y0, top, z, w, d) {
  stone(P, 'ashlar');
  box(P, x - w / 2, y0, z - d / 2, x + w / 2, top - 0.3, z + d / 2);
  if (L <= 3) { paint(P, 'lime', LIME, 0.85); box(P, x - w / 2 - 0.15, top - 0.3, z - d / 2 - 0.15, x + w / 2 + 0.15, top, z + d / 2 + 0.15); box(P, x - w / 2 - 0.15, y0, z - d / 2 - 0.15, x + w / 2 + 0.15, y0 + 0.9, z + d / 2 + 0.15); }
  if (L <= 2) { gold(P); box(P, x - w / 2 - 0.02, top - 0.75, z - d / 2 - 0.02, x + w / 2 + 0.02, top - 0.6, z + d / 2 + 0.02); }
}
function balustrade(P, L, xc, za, zb, ta, tb) { // rail rides ta..tb along z, on a cheek whose top is ta..tb
  const len = zb - za, at = (z) => ta + (tb - ta) * (z - za) / len;
  paint(P, 'lime', LIME, 0.85);
  if (L >= 3) { slopedBox(P, xc - 0.16, xc + 0.16, za, zb, ta - 0.1, ta + 0.95, tb + 0.95); return; }
  slopedBox(P, xc - 0.24, xc + 0.24, za, zb, ta + 0.85, ta + 1.05, tb + 1.05);
  const gap = L <= 1 ? 0.45 : 1.35;
  for (let z = za + gap / 2; z < zb; z += gap) { const y = at(z); box(P, xc - 0.08, y - 0.05, z - 0.08, xc + 0.08, y + 0.86, z + 0.08); }
}
function stair(P, L) {
  // treads and risers (lod ≤ 2) or one slope per flight
  for (const f of FL) {
    const n = Math.round((f.y1 - f.y0) / 0.25), tr = (f.z1 - f.z0) / n;
    if (L <= 2) for (let k = 0; k < n; k++) {
      const za = f.z0 + k * tr, zb = za + tr, y = f.y0 + (k + 1) * 0.25;
      paint(P, 'lime', LIME, 0.85); face(P, [-SW, y - 0.25, za], [SW, y - 0.25, za], [SW, y, za], [-SW, y, za], [0, 0, -1]);
      paint(P, 'flag', 'oklch(0.97 0.01 85)', 0.8); face(P, [-SW, y, za], [-SW, y, zb], [SW, y, zb], [SW, y, za], [0, 1, 0]);
    } else { paint(P, 'flag', 'oklch(0.97 0.01 85)', 0.8); face(P, [-SW, f.y0, f.z0], [-SW, f.y1, f.z1], [SW, f.y1, f.z1], [SW, f.y0, f.z0], [0, 1, 0]); }
  }
  paint(P, 'flag', 'oklch(0.97 0.01 85)', 0.8);
  for (const [a, b, y] of LAND) face(P, [-SW, y, a], [-SW, y, b], [SW, y, b], [SW, y, a], [0, 1, 0]);
  if (L <= 2) { gold(P); for (const [a, , y] of LAND.slice(0, 2)) { face(P, [-2, y + 0.005, a + 0.6], [-2, y + 0.005, a + 2.4], [2, y + 0.005, a + 2.4], [2, y + 0.005, a + 0.6], [0, 1, 0]); } }
  stone(P, 'ashlar'); face(P, [-SW, -0.6, -11], [SW, -0.6, -11], [SW, 0.5, -11], [-SW, 0.5, -11], [0, 0, -1]);
  // cheeks: sloped along flight 1, flat by landing 1, then tall retaining walls cut into the rock
  for (const s of [-1, 1]) {
    const xi = s * SW, xo = s * 8.6, x0 = Math.min(xi, xo), x1 = Math.max(xi, xo), xc = s * 7.8;
    stone(P, 'ashlar');
    slopedBox(P, x0, x1, -11, -5.6, -0.6, 0.85, 5.35); slopedBox(P, x0, x1, -5.6, -3, -0.6, 5.35, 5.35);
    slopedBox(P, x0, x1, -3, 13, -2, 14.35, 14.35);
    if (L <= 3) { paint(P, 'lime', LIME, 0.85); box(P, x0 - 0.12, 13.9, -3.12, x1 + 0.12, 14.35, 13); if (L <= 2) { gold(P); box(P, x0 - 0.03, 12.9, -3.03, x1 + 0.03, 13.1, 13); } }
    if (L <= 1) { dark(P); for (const y of [4, 9]) box(P, s > 0 ? x1 : x0 - 0.03, y, 4, s > 0 ? x1 + 0.03 : x0, y + 1.4, 4.25); }
    balustrade(P, L, xc, -11, -5.6, 0.85, 5.35); balustrade(P, L, xc, -5.6, -3, 5.35, 5.35); balustrade(P, L, xc, -3, 13, 14.35, 14.35);
    // newels with braziers
    stone(P, 'ashlar'); box(P, xc - 0.5, 0.5, -11.5, xc + 0.5, 2.3, -10.5); brazier(P, L, xc, 2.3, -11);
    stone(P, 'ashlar'); box(P, xc - 0.5, 5.3, -6.1, xc + 0.5, 6.9, -5.1); brazier(P, L, xc, 6.9, -5.6);
    stone(P, 'ashlar'); box(P, xc - 0.5, 14.3, 12.5, xc + 0.5, 15.9, 13.5); brazier(P, L, xc, 15.9, 13);
    // lions on plinths: two at the foot, two guarding the top
    plinth(P, L, s * 10.6, -0.6, 2.0, -11.2, 2.4, 4.2); lion(P, L, s * 10.6, 2.0, -11.2, 1.25);
    plinth(P, L, s * 11.4, 13.6, 15.7, 14.2, 2.4, 4.2); lion(P, L, s * 11.4, 15.7, 14.2, 1.25);
  }
}
function stairCollider(P) {
  for (const f of FL) face(P, [-SW, f.y0, f.z0 - 0.15], [-SW, f.y1, f.z1 - 0.15], [SW, f.y1, f.z1 - 0.15], [SW, f.y0, f.z0 - 0.15], [0, 1, 0]);
  face(P, [-SW, 5, -5.75], [-SW, 5, -2.75], [SW, 5, -2.75], [SW, 5, -5.75], [0, 1, 0]);
  face(P, [-SW, 9.5, 2.65], [-SW, 9.5, 5.65], [SW, 9.5, 5.65], [SW, 9.5, 2.65], [0, 1, 0]);
  face(P, [-SW, 14, 11.05], [-SW, 14, 13.5], [SW, 14, 13.5], [SW, 14, 11.05], [0, 1, 0]);
  for (const s of [-1, 1]) {
    const x0 = Math.min(s * SW, s * 8.6), x1 = Math.max(s * SW, s * 8.6);
    slopedBox(P, x0, x1, -11, -5.6, -0.6, 1.9, 6.4); slopedBox(P, x0, x1, -5.6, -3, -0.6, 6.4, 6.4); slopedBox(P, x0, x1, -3, 13, -2, 15.4, 15.4);
    box(P, s * 10.6 - 1.2, -0.6, -13.3, s * 10.6 + 1.2, 2.0, -9.1); box(P, s * 11.4 - 1.2, 13.6, 12.1, s * 11.4 + 1.2, 15.7, 16.3);
  }
}
// ---------------- curtain walls ----------------
const WH = 10, WT = 1.5;
const RUNS = [[-36, -18, -8, -18, 0, -1, 5.5, 0.5], [8, -18, 36, -18, 0, -1, 0.5, 5.5], [-36, -18, -36, 18, -1, 0, 5.5, 5.5], [36, -18, 36, 18, 1, 0, 5.5, 5.5], [-36, 18, -17, 18, 0, 1, 5.5, 1], [17, 18, 36, 18, 0, 1, 1, 5.5]];
function walls(P, L) {
  for (const [x0, z0, x1, z1, nx, nz, t0, t1] of RUNS) {
    const len = Math.hypot(x1 - x0, z1 - z0), F = FR(x0, z0, (x1 - x0) / len, (z1 - z0) / len, nx, nz), a0 = t0, a1 = len - t1;
    stone(P);
    fbox(P, F, 0, -2, len, WH, -WT, WT, true);
    if (L <= 3) { fbox(P, F, a0, -2, a1, 2.2, WT, WT + 0.8); fbox(P, F, a0, WH, a1, WH + 1.0, WT - 0.6, WT + 0.35); fbox(P, F, a0, WH, a1, WH + 0.8, -WT, -WT + 0.4); }
    if (L <= 2) {
      for (let a = a0 + 0.4; a + 1.1 <= a1; a += 1.9) fbox(P, F, a, WH + 1.0, a + 1.1, WH + 2.1, WT - 0.6, WT + 0.35);
      gold(P); fbox(P, F, a0, WH - 1.7, a1, WH - 1.45, WT, WT + 0.07);
      stone(P); for (let a = a0 + 0.55; a + 0.6 <= a1; a += 1.9) fbox(P, F, a, WH - 0.9, a + 0.5, WH, WT, WT + 0.35);
    }
    if (L <= 1) {
      dark(P); for (let a = a0 + 3; a < a1 - 1; a += 5) fbox(P, F, a - 0.1, 4, a + 0.1, 5.6, WT, WT + 0.03);
      stone(P); for (let a = a0 + 3.5; a < a1 - 1; a += 7) fbox(P, F, a - 0.6, -2, a + 0.6, WH - 1, -WT - 0.9, -WT);
    }
  }
}
function wallsCollider(P) { for (const [x0, z0, x1, z1, nx, nz] of RUNS) { const len = Math.hypot(x1 - x0, z1 - z0); fbox(P, FR(x0, z0, (x1 - x0) / len, (z1 - z0) / len, nx, nz), 0, -2, len, WH + 1.0, -WT, WT + 0.35, true); } }
// ---------------- gatehouse ----------------
const GW = 8, GD = 5, GH = 18, PW = 2.8, SPR = 4.7;
function archFill(P, L, x0, x1, y0, yTop, za, zb) { // stone above a round arch between x0..x1 springing at y0
  const ns = L <= 1 ? 12 : L === 2 ? 7 : 3, r = (x1 - x0) / 2, cx = (x0 + x1) / 2;
  for (let i = 0; i < ns; i++) { const xa = x0 + (x1 - x0) * i / ns, xb = x0 + (x1 - x0) * (i + 1) / ns, xm = (xa + xb) / 2 - cx; box(P, xa, y0 + Math.sqrt(Math.max(0, r * r - xm * xm)), za, xb, yTop, zb); }
}
function voussoirs(P, x, y0, r, z, s = -1) {
  gold(P); const k = 11;
  for (let i = 0; i <= k; i++) { const a = Math.PI * i / k, cx = x + Math.cos(a) * (r + 0.3), cy = y0 + Math.sin(a) * (r + 0.3); box(P, cx - 0.28, cy - 0.28, z + (s < 0 ? -0.25 : 0), cx + 0.28, cy + 0.28, z + (s < 0 ? 0 : 0.25)); }
}
function gatehouse(P, L) {
  if (L >= 4) { stone(P); box(P, -GW, -2, -GD, GW, GH + 1, GD); dark(P); face(P, [-PW, 0, -GD - 0.05], [PW, 0, -GD - 0.05], [PW, SPR + PW, -GD - 0.05], [-PW, SPR + PW, -GD - 0.05], [0, 0, -1]); for (const s of [-1, 1]) tower(P, L, { cx: s * GW, cz: -3, r: 3.6, H: 22, cone: 10 }); return; }
  stone(P);
  box(P, -GW, -2, -GD, -PW, GH, GD); box(P, PW, -2, -GD, GW, GH, GD); box(P, -PW, SPR + PW, -GD, PW, GH, GD); archFill(P, L, -PW, PW, SPR, SPR + PW, -GD, GD);
  const F = FR(0, -GD, 1, 0, 0, -1), B = FR(0, GD, -1, 0, 0, 1);
  fbox(P, F, -GW, GH, GW, GH + 1.1, -0.3, 0.35); fbox(P, B, -GW, GH, GW, GH + 1.1, -0.3, 0.35);
  fbox(P, FR(GW, 0, 0, 1, 1, 0), -GD, GH, GD, GH + 1.1, -0.3, 0.35); fbox(P, FR(-GW, 0, 0, -1, -1, 0), -GD, GH, GD, GH + 1.1, -0.3, 0.35);
  if (L <= 2) {
    for (const Q of [F, B]) { for (let a = -GW + 0.3; a + 1.1 <= GW; a += 1.9) fbox(P, Q, a, GH + 1.1, a + 1.1, GH + 2.2, -0.3, 0.35); for (let a = -GW + 0.5; a + 0.5 <= GW; a += 1.9) fbox(P, Q, a, GH - 0.9, a + 0.5, GH, 0, 0.35); }
    gold(P); fbox(P, F, -GW, GH - 1.7, GW, GH - 1.45, 0, 0.07);
    voussoirs(P, 0, SPR, PW, -GD);
    // raised portcullis showing its teeth under the arch
    paint(P, null, IRON, 0.6, 0.5); for (let x = -PW + 0.25; x < PW; x += 0.45) box(P, x - 0.06, SPR + 0.4, -3.6, x + 0.06, SPR + PW, -3.44);
    box(P, -PW, SPR + 0.9, -3.63, PW, SPR + 1.02, -3.41);
    for (let x = -PW + 0.25; x < PW; x += 0.45) cyl(P, x, -3.52, SPR + 0.4, SPR + 0.1, 0.06, 0, 4);
    // oak leaves swung open against the passage
    paint(P, 'walnut', 'oklch(0.85 0.03 60)', 0.8); box(P, -PW, 0, 1, -PW + 0.22, SPR + 0.3, 3.8); box(P, PW - 0.22, 0, 1, PW, SPR + 0.3, 3.8);
    // the royal crest over the gate
    paint(P, null, CARPET, 0.6); fbox(P, F, -1.5, 10, 1.5, 13.6, 0, 0.2); gold(P); fbox(P, F, -1.7, 13.6, 1.7, 13.9, 0, 0.26); fbox(P, F, -1.7, 9.8, 1.7, 10, 0, 0.26); fbox(P, F, -0.55, 11, 0.55, 12.9, 0.2, 0.3); fbox(P, F, -1.0, 11.8, 1.0, 12.2, 0.2, 0.3);
  }
  if (L <= 1) { dark(P); for (const x of [-5.5, 5.5]) for (const y of [8, 12.5]) fbox(P, F, x - 0.1, y, x + 0.1, y + 1.5, 0, 0.03); }
  for (const s of [-1, 1]) tower(P, L, { cx: s * GW, cz: -3, r: 3.6, H: 22, cone: 10 });
}
function gatehouseCollider(P) {
  box(P, -GW, -2, -GD, -PW, GH + 1, GD); box(P, PW, -2, -GD, GW, GH + 1, GD); box(P, -PW, SPR + PW - 0.4, -GD, PW, GH + 1, GD);
  for (const s of [-1, 1]) towerCollider(P, { cx: s * GW, cz: -3, r: 3.6, H: 22 });
}
// ---------------- keep ----------------
const KW = 17, KD = 9, KT = 2.4, KH = 18, RIDGE = 30, DW = 2.8, DSPR = 6.5, FZ = -17;
function keep(P, L) {
  stone(P);
  if (L >= 4) {
    box(P, -KW, -2, -KD, KW, KH, KD);
    paint(P, ROOF, ROOFT, 0.7); face(P, [-KW - 0.8, KH - 0.4, -KD - 0.8], [0, RIDGE, -KD - 0.8], [0, RIDGE, KD + 0.8], [-KW - 0.8, KH - 0.4, KD + 0.8], [-1, 1.4, 0]); face(P, [KW + 0.8, KH - 0.4, -KD - 0.8], [KW + 0.8, KH - 0.4, KD + 0.8], [0, RIDGE, KD + 0.8], [0, RIDGE, -KD - 0.8], [1, 1.4, 0]);
    stone(P); tri(P, [-KW, KH, -KD], [KW, KH, -KD], [0, RIDGE - 0.6, -KD], [0, 0, -1]); tri(P, [-KW, KH, KD], [KW, KH, KD], [0, RIDGE - 0.6, KD], [0, 0, 1]);
    box(P, -4, KH, -3, 4, 40, 5); paint(P, ROOF, ROOFT, 0.7); cyl(P, 0, 1, 40.5, 57, 4.6, 0, L >= 5 ? 4 : 8); finial(P, L, 0, 56.7, 1, 1.4);
    if (L === 4) { stone(P); cyl(P, 0, FZ, 0, 0.8, 3.4, 3.4, 8, true); for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(P, L, { cx: sx * KW, cz: sz * KD, y0: 8, r: 1.9, H: 22, cone: 7, talus: false, slits: false, win: false }); }
    return;
  }
  // shell with the throne-hall door
  box(P, -KW, -2, -KD, -DW, KH, -KD + KT); box(P, DW, -2, -KD, KW, KH, -KD + KT); box(P, -DW, DSPR + DW, -KD, DW, KH, -KD + KT); archFill(P, L, -DW, DW, DSPR, DSPR + DW, -KD, -KD + KT);
  box(P, -KW, -2, KD - KT, KW, KH, KD); box(P, -KW, -2, -KD + KT, -KW + KT, KH, KD - KT); box(P, KW - KT, -2, -KD + KT, KW, KH, KD - KT);
  box(P, -KW - 0.6, -2, -KD - 0.6, -KW, 1.2, KD + 0.6); box(P, KW, -2, -KD - 0.6, KW + 0.6, 1.2, KD + 0.6); box(P, -KW, -2, KD, KW, 1.2, KD + 0.6);
  box(P, -KW, -2, -KD - 0.6, -3.6, 1.2, -KD); box(P, 3.6, -2, -KD - 0.6, KW, 1.2, -KD);
  // buttresses between the side lancets
  for (const s of [-1, 1]) for (const z of [-6.75, -2.25, 2.25, 6.75]) {
    const xa = s > 0 ? KW : -KW - 1.6, xb = s > 0 ? KW + 1.6 : -KW; box(P, xa, -2, z - 0.7, xb, 11, z + 0.7);
    if (L <= 3) { const xc = s > 0 ? KW + 0.9 : -KW - 0.9; box(P, Math.min(s * KW, xc), 11, z - 0.55, Math.max(s * KW, xc), 15.5, z + 0.55); if (L <= 2) { gold(P); box(P, Math.min(s * KW, xc) - 0.05, 15.5, z - 0.6, Math.max(s * KW, xc) + 0.05, 15.75, z + 0.6); stone(P); } }
  }
  // cornice and gold band
  if (L <= 3) { paint(P, 'lime', LIME, 0.85); box(P, -KW - 0.35, KH - 0.6, -KD - 0.35, KW + 0.35, KH, KD + 0.35); }
  if (L <= 2) { gold(P); box(P, -KW - 0.06, KH - 2.2, -KD - 0.06, KW + 0.06, KH - 1.9, KD + 0.06); voussoirs(P, 0, DSPR, DW, -KD); }
  // stained glass
  const SF = { e: FR(KW, 0, 0, 1, 1, 0), w: FR(-KW, 0, 0, -1, -1, 0), f: FR(0, -KD, 1, 0, 0, -1), b: FR(0, KD, -1, 0, 0, 1) };
  for (const z of [-4.5, 0, 4.5]) { lancet(P, L, SF.e, z, 5, 1.8, 7); lancet(P, L, SF.w, -z, 5, 1.8, 7); }
  for (const x of [-9, 9]) { lancet(P, L, SF.f, x, 5, 2, 7); lancet(P, L, SF.b, x, 5, 2, 7); }
  lancet(P, L, SF.b, 0, 4, 2.6, 9); rose(P, L, SF.f, 13.6, 2.2);
  if (L <= 1) { // the glow seen from the hall
    const IF = { e: FR(KW - KT, 0, 0, -1, -1, 0), w: FR(-KW + KT, 0, 0, 1, 1, 0), f: FR(0, -KD + KT, -1, 0, 0, 1), b: FR(0, KD - KT, 1, 0, 0, -1) };
    for (const z of [-4.5, 0, 4.5]) { lancet(P, L, IF.e, -z, 5, 1.8, 7); lancet(P, L, IF.w, z, 5, 1.8, 7); }
    lancet(P, L, IF.b, 0, 4, 2.6, 9); rose(P, L, IF.f, 13.6, 2.2);
  }
  // the throne-hall roof
  paint(P, ROOF, ROOFT, 0.7);
  face(P, [-KW - 0.8, KH - 0.4, -KD - 0.8], [0, RIDGE, -KD - 0.8], [0, RIDGE, KD + 0.8], [-KW - 0.8, KH - 0.4, KD + 0.8], [-1, 1.4, 0]);
  face(P, [KW + 0.8, KH - 0.4, -KD - 0.8], [KW + 0.8, KH - 0.4, KD + 0.8], [0, RIDGE, KD + 0.8], [0, RIDGE, -KD - 0.8], [1, 1.4, 0]);
  stone(P); tri(P, [-KW, KH, -KD], [KW, KH, -KD], [0, RIDGE - 0.6, -KD], [0, 0, -1]); tri(P, [-KW, KH, KD], [KW, KH, KD], [0, RIDGE - 0.6, KD], [0, 0, 1]);
  if (L <= 2) {
    gold(P); box(P, -0.3, RIDGE - 0.2, -KD - 0.9, 0.3, RIDGE + 0.3, KD + 0.9);
    for (const s of [-1, 1]) face(P, [s * (KW + 0.85), KH - 0.45, -KD - 0.85], [0, RIDGE + 0.05, -KD - 0.85], [0, RIDGE + 0.05, -KD - 1.0], [s * (KW + 0.85), KH - 0.45, -KD - 1.0], [0, 0, -1]);
    if (L <= 1) for (let z = -KD; z <= KD; z += 2) cyl(P, 0, z, RIDGE + 0.3, RIDGE + 1.2, 0.18, 0, 5);
    rose(P, L, FR(0, -KD - 0.02, 1, 0, 0, -1), 22.5, 1.3);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) tower(P, L, { cx: sx * KW, cz: sz * KD, y0: 8, r: 1.9, H: 22, cone: 7, talus: false, slits: false, win: false });
  // the spire tower at the crossing
  stone(P); box(P, -4, KH, -3, 4, 40, 5);
  const T = { f: FR(0, -3, 1, 0, 0, -1), b: FR(0, 5, -1, 0, 0, 1), e: FR(4, 1, 0, 1, 1, 0), w: FR(-4, 1, 0, -1, -1, 0) };
  if (L <= 3) for (const Q of Object.values(T)) { fbox(P, Q, -4, 40, 4, 41.2, -0.3, 0.3); if (L <= 2) { for (let a = -3.9; a + 0.9 <= 4; a += 1.6) fbox(P, Q, a, 41.2, a + 0.9, 42.2, -0.3, 0.3); for (let a = -3.8; a + 0.4 <= 4; a += 1.6) fbox(P, Q, a, 39.2, a + 0.4, 40, 0, 0.3); lancet(P, L, Q, -1.4, 32.5, 1.1, 3.6); lancet(P, L, Q, 1.4, 32.5, 1.1, 3.6); } }
  if (L <= 2) { gold(P); box(P, -4.06, 30.6, -3.06, 4.06, 30.95, 5.06); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { stone(P); cyl(P, sx * 3.6, 1 + sz * 3.6, 40, 41.5, 0.5, 0.5, 6); paint(P, ROOF, ROOFT, 0.7); cyl(P, sx * 3.6, 1 + sz * 3.6, 41.5, 45, 0.65, 0, 6); gold(P); cyl(P, sx * 3.6, 1 + sz * 3.6, 44.8, 46, 0.1, 0, 4); } }
  paint(P, ROOF, ROOFT, 0.7); cyl(P, 0, 1, 40.5, 57, 4.6, 0, 8);
  if (L <= 2) { gold(P); for (const y of [45, 50]) { const r = 4.6 * (57 - y) / 16.5; cyl(P, 0, 1, y, y + 0.35, r + 0.05, r - 0.05, 8); } }
  finial(P, L, 0, 56.7, 1, 1.4);
  // courtyard fountain
  stone(P, 'lime', LIME);
  const fn = L <= 2 ? 8 : 8;
  cyl(P, 0, FZ, 0, 0.8, 3.4, 3.4, fn); cyl(P, 0, FZ, 0.8, 0.8, 3.4, 2.9, fn); cyl(P, 0, FZ, 0.8, 0.3, 2.9, 2.9, fn, false, true);
  paint(P, null, 'oklch(0.62 0.08 200)', 0.08, 0.1); P.color('oklch(0.62 0.08 200)', 0.88); cyl(P, 0, FZ, 0.6, 0.6, 2.9, 0, fn);
  if (L <= 3) {
    stone(P, 'lime', LIME); cyl(P, 0, FZ, 0.3, 2.3, 0.55, 0.45, 8); cyl(P, 0, FZ, 2.2, 2.6, 0.5, 1.6, 10); cyl(P, 0, FZ, 2.6, 2.6, 1.6, 0, 10);
    cyl(P, 0, FZ, 2.6, 3.8, 0.3, 0.25, 8); cyl(P, 0, FZ, 3.7, 4.0, 0.3, 0.8, 8); cyl(P, 0, FZ, 4.0, 4.0, 0.8, 0, 8);
    gold(P); cyl(P, 0, FZ, 4.0, 4.5, 0.2, 0.35, 8); cyl(P, 0, FZ, 4.5, 4.9, 0.35, 0.1, 8);
    if (L <= 2) { gold(P); cyl(P, 0, FZ, 0.8, 0.9, 3.42, 3.42, fn); paint(P, null, 'oklch(0.8 0.06 200)', 0.1, 0); P.color('oklch(0.85 0.05 200)', 0.7); cyl(P, 0, FZ, 2.62, 0.62, 1.55, 2.2, 10); }
  }
  // the throne hall inside
  if (L <= 2) {
    const ix = KW - KT, iz = KD - KT;
    paint(P, 'flag', 'oklch(0.96 0.01 85)', 0.7); face(P, [-ix, 0.06, -iz], [-ix, 0.06, iz], [ix, 0.06, iz], [ix, 0.06, -iz], [0, 1, 0]);
    face(P, [-DW, 0.06, -KD], [-DW, 0.06, -iz], [DW, 0.06, -iz], [DW, 0.06, -KD], [0, 1, 0]);
    paint(P, 'linen', CARPET, 0.95); box(P, -1.3, 0.06, -KD, 1.3, 0.1, 3.6);
    gold(P); box(P, -1.45, 0.06, -KD, -1.3, 0.11, 3.6); box(P, 1.3, 0.06, -KD, 1.45, 0.11, 3.6);
    stone(P, 'lime', LIME); box(P, -5, 0.06, 3.6, 5, 0.22, iz); box(P, -4, 0.22, 4.1, 4, 0.38, iz); box(P, -3, 0.38, 4.6, 3, 0.54, iz);
    paint(P, 'linen', CARPET, 0.95); box(P, -1.3, 0.22, 3.6, 1.3, 0.25, 4.1); box(P, -1.3, 0.38, 4.1, 1.3, 0.41, 4.6); box(P, -2.6, 0.54, 4.6, 2.6, 0.57, iz);
    gold(P); box(P, -0.8, 0.57, 5.3, 0.8, 1.15, 6.2); box(P, -0.8, 0.57, 6.0, 0.8, 3.4, 6.3); box(P, -1.0, 0.57, 5.3, -0.8, 1.6, 6.3); box(P, 0.8, 0.57, 5.3, 1.0, 1.6, 6.3);
    cyl(P, -0.7, 6.15, 3.4, 3.9, 0.12, 0, 5); cyl(P, 0.7, 6.15, 3.4, 3.9, 0.12, 0, 5); cyl(P, 0, 6.15, 3.4, 4.2, 0.2, 0, 6);
    paint(P, 'linen', CARPET, 0.95); box(P, -0.62, 1.15, 5.35, 0.62, 1.3, 6.0); box(P, -0.6, 1.3, 5.98, 0.6, 3.1, 6.02);
    // a tall blue hanging behind the throne
    box(P, -1.6, 4, iz - 0.12, 1.6, 13, iz - 0.02); gold(P); box(P, -1.6, 12.8, iz - 0.2, 1.6, 13.1, iz - 0.02); box(P, -0.9, 7, iz - 0.16, 0.9, 10, iz - 0.1);
    stone(P, 'lime', LIME);
    for (const x of [-6, 6]) for (const z of [-4.5, -0.5, 3.2]) { box(P, x - 0.9, 0.06, z - 0.9, x + 0.9, 0.7, z + 0.9); cyl(P, x, z, 0.7, 14.2, 0.62, 0.55, L <= 1 ? 12 : 8); box(P, x - 0.85, 14.2, z - 0.85, x + 0.85, 15, z + 0.85); gold(P); cyl(P, x, z, 13.6, 14.2, 0.58, 0.72, 8); stone(P, 'lime', LIME); }
    for (const x of [-6, 6]) box(P, x - 0.6, 15, -iz, x + 0.6, 16, iz);
    if (L <= 1) for (const z of [-4, 1]) { gold(P); cyl(P, 0, z, 10.2, 10.4, 1.4, 1.4, 12); cyl(P, 0, z, 10.4, 17.5, 0.04, 0.04, 4); P.emissive(2.4, 1.3, 0.4); for (let k = 0; k < 8; k++) { const a = TAU * k / 8; box(P, Math.cos(a) * 1.4 - 0.05, 10.4, z + Math.sin(a) * 1.4 - 0.05, Math.cos(a) * 1.4 + 0.05, 10.75, z + Math.sin(a) * 1.4 + 0.05); } P.emissive(null); }
  }
}
function keepCollider(P) {
  box(P, -KW, -2, -KD, -DW, KH, -KD + KT); box(P, DW, -2, -KD, KW, KH, -KD + KT); box(P, -DW, DSPR + DW - 0.3, -KD, DW, KH, -KD + KT);
  box(P, -KW, -2, KD - KT, KW, KH, KD); box(P, -KW, -2, -KD + KT, -KW + KT, KH, KD - KT); box(P, KW - KT, -2, -KD + KT, KW, KH, KD - KT);
  box(P, -KW - 1.6, -2, -KD - 0.6, -KW, 1.2, KD + 0.6); box(P, KW, -2, -KD - 0.6, KW + 1.6, 1.2, KD + 0.6);
  box(P, -KW, -2, -KD - 0.6, -3.6, 1.2, -KD); box(P, 3.6, -2, -KD - 0.6, KW, 1.2, -KD);
  const iz = KD - KT; box(P, -5, -0.5, 3.6, 5, 0.22, iz); box(P, -4, 0.22, 4.1, 4, 0.38, iz); box(P, -3, 0.38, 4.6, 3, 0.54, iz); box(P, -1, 0.54, 5.3, 1, 3.4, 6.3);
  for (const x of [-6, 6]) for (const z of [-4.5, -0.5, 3.2]) box(P, x - 0.7, 0, z - 0.7, x + 0.7, 15, z + 0.7);
  cyl(P, 0, FZ, -0.5, 0.8, 3.4, 3.4, 8, true);
}
export function geometry(ctx) {
  const L = ctx.lod || 1, part = ctx.params.part || 'keep';
  if (part === 'cliff') { cliffFaces(ctx, L); if (L <= 3) rimParapet(ctx, L); }
  else if (part === 'stair') stair(ctx, L);
  else if (part === 'wall') walls(ctx, L);
  else if (part === 'gatehouse') gatehouse(ctx, L);
  else if (part === 'tower') tower(ctx, L, { r: 5.5, H: 24, cone: 16 });
  else keep(ctx, L);
  return { uvProjection: 'triplanar' };
}
export function collider(ctx) {
  const part = ctx.params.part || 'keep';
  if (part === 'cliff') { cliffFaces(ctx, 4); rimParapet(ctx, 4); }
  else if (part === 'stair') stairCollider(ctx);
  else if (part === 'wall') wallsCollider(ctx);
  else if (part === 'gatehouse') gatehouseCollider(ctx);
  else if (part === 'tower') towerCollider(ctx, { r: 5.5, H: 24 });
  else keepCollider(ctx);
}
