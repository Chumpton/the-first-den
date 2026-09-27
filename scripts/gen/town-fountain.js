// The great fountain of the market square: a three-step limestone dais (feet = its top, steps go down to
// params.drop), a round basin with a sitting ledge, four lion-head spouts on the pedestal, two tiers of bowls,
// a verdigris leaping fish, planter beds in the dais corners and curved benches facing out. Water and spray are child rows.
import { TAU, COL, FLOWERS, paint, XF, solid, box, obox, prism, ngon, lathe, loft, blob } from '../lib/town-kit.js';
export const DAIS = { steps: [8.5, 7.9, 7.3], rise: 0.15, planter: 6.3, planterHalf: 0.8, bench: [6.25, 6.8], benchSpan: 0.3 };
export const SPOUT = { r: 0.78, y: 1.22, n: 4, a0: 0 };
const hsh = (x, z) => { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); };
function arcSolid(P, r0, r1, a0, a1, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
    const L = [[ca * r0, y0, sa * r0], [ca * r1, y0, sa * r1], [cb * r1, y0, sb * r1], [cb * r0, y0, sb * r0]];
    solid(P, L, L.map(([x, , z]) => [x, y1, z]));
  }
}
function dais(ctx, P, lod) {
  const D = DAIS, S = D.steps, n = S.length;
  paint(ctx, 'ashlar', 'oklch(0.9 0.028 75)', 0.9); // the stepped block, each tread capped with a nosing
  S.forEach((h, i) => { const y1 = -D.rise * (n - 1 - i); box(P, -h, -0.6, -h, h, y1, h); if (lod <= 2) { const t = h + 0.03; for (const [x0, z0, x1, z1] of [[-t, -t, t, -h + 0.12], [-t, h - 0.12, t, t], [-t, -h, -h + 0.12, h], [h - 0.12, -h, t, h]]) box(P, x0, y1 - 0.05, z0, x1, y1 + 0.012, z1); } });
  if (lod > 3) return;
  const T = S[n - 1], cs = lod <= 2 ? 0.9 : 1.8, gap = lod <= 2 ? 0.025 : 0, B = new Map(); // the top paved in flags, worn dark at the rim
  for (let x = -T; x < T - 1e-6; x += cs) for (let z = -T; z < T - 1e-6; z += cs) {
    const x1 = Math.min(T, x + cs), z1 = Math.min(T, z + cs), cx = (x + x1) / 2, cz = (z + z1) / 2, r = Math.hypot(cx, cz);
    if (r < 5.25) continue;
    const g = Math.max(0, 1 - (r - 5.3) / 1.4) * (0.5 + hsh(cx, cz)), chk = (Math.floor(cx / cs) + Math.floor(cz / cs)) & 1;
    const col = g > 0.75 ? 'oklch(0.76 0.04 58)' : g > 0.4 ? 'oklch(0.83 0.035 64)' : chk ? 'oklch(0.94 0.022 82)' : 'oklch(0.9 0.03 70)';
    let a = B.get(col); if (!a) B.set(col, a = []); a.push([x + gap, 0.012, z + gap, x + gap, 0.012, z1 - gap, x1 - gap, 0.012, z1 - gap, x1 - gap, 0.012, z + gap]);
  }
  for (const [col, qs] of B) { paint(ctx, 'flag', col, 0.9); for (const q of qs) P.quad(...q); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) planter(ctx, P, sx * D.planter, sz * D.planter, lod);
  const bn = lod <= 2 ? 7 : 3; // curved stone benches on the diagonals, facing out
  for (let k = 0; k < 4; k++) {
    const m = Math.PI / 4 + k * Math.PI / 2, a0 = m - D.benchSpan, a1 = m + D.benchSpan, [r0, r1] = D.bench;
    paint(ctx, 'ashlar', 'oklch(0.92 0.025 78)', 0.9);
    arcSolid(P, r0, r1 + 0.06, a0, a1, 0.38, 0.46, bn);
    for (const f of [0.18, 0.82]) { const a = a0 + (a1 - a0) * f; arcSolid(P, r0 + 0.1, r1 - 0.1, a - 0.035, a + 0.035, 0, 0.38, 1); }
    if (lod <= 3) { arcSolid(P, r0 - 0.08, r0 + 0.06, a0, a1, 0.46, 0.84, bn); if (lod <= 2) arcSolid(P, r0 - 0.12, r0 + 0.1, a0 - 0.01, a1 + 0.01, 0.84, 0.88, bn); }
  }
}
function planter(ctx, P, cx, cz, lod) {
  const h = DAIS.planterHalf, w = 0.16, t = 0.48;
  paint(ctx, 'ashlar', 'oklch(0.9 0.025 75)', 0.9);
  box(P, cx - h, 0, cz - h, cx + h, t, cz - h + w); box(P, cx - h, 0, cz + h - w, cx + h, t, cz + h);
  box(P, cx - h, 0, cz - h + w, cx - h + w, t, cz + h - w); box(P, cx + h - w, 0, cz - h + w, cx + h, t, cz + h - w);
  if (lod <= 2) box(P, cx - h - 0.04, t, cz - h - 0.04, cx + h + 0.04, t + 0.05, cz + h + 0.04);
  paint(ctx, null, 'oklch(0.38 0.04 50)', 1); box(P, cx - h + w, 0, cz - h + w, cx + h - w, t - 0.08, cz + h - w);
  if (lod > 3) return;
  let s = Math.abs(cx * 7 + cz * 3); const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  paint(ctx, 'leaf', 'oklch(0.62 0.12 135)', 0.9);
  blob(P, cx, t - 0.1, cz, 0.42, 0.62, 0.42, lod <= 2 ? 7 : 5, rnd);
  for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) blob(P, cx + dx, t - 0.1, cz + dz, 0.28, 0.32, 0.28, 5, rnd);
  if (lod > 2) return;
  for (let i = 0; i < 22; i++) { paint(ctx, null, FLOWERS[i % FLOWERS.length], 0.8); const a = rnd() * TAU, r = 0.25 + rnd() * 0.4; blob(P, cx + Math.cos(a) * r, t + 0.12 + rnd() * 0.22 + (r < 0.4 ? 0.2 : 0), cz + Math.sin(a) * r, 0.07, 0.06, 0.07, 4, rnd); }
}
function lion(ctx, P, a, lod) { // a lion mask on the pedestal, its mouth a bronze pipe pouring outward
  const F = XF(P, Math.cos(a) * SPOUT.r, SPOUT.y, Math.sin(a) * SPOUT.r, Math.PI / 2 - a);
  let s = a * 1000 + 7; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  paint(ctx, 'lime', 'oklch(0.9 0.03 78)', 0.9);
  blob(F, 0, -0.28, 0.06, 0.3, 0.56, 0.12, lod <= 2 ? 8 : 5, rnd); // mane
  blob(F, 0, -0.2, -0.04, 0.2, 0.4, 0.14, 6, rnd); // face
  blob(F, 0, -0.16, -0.16, 0.1, 0.16, 0.1, 5, rnd); // muzzle
  if (lod <= 2) { for (const x of [-0.13, 0.13]) blob(F, x, 0.12, 0.0, 0.07, 0.1, 0.05, 4, rnd); paint(ctx, null, 'oklch(0.3 0.02 60)', 0.6); for (const x of [-0.08, 0.08]) obox(F, x, 0.03, -0.15, 0.04, 0.03, 0.02); }
  paint(ctx, 'copper', 'oklch(0.85 0.06 170)', 0.5, 0.6); beam(F, [0, -0.02, -0.18], [0, -0.04, -0.34], 0.05, 0.05);
}
function beam(P, a, b, w, h) { obox(P, (a[0] + b[0]) / 2, Math.min(a[1], b[1]) - h / 2, (a[2] + b[2]) / 2, w, h + Math.abs(a[1] - b[1]), Math.hypot(b[0] - a[0], b[2] - a[2])); }
export const MOUTH = [-0.62, 6.05, 0];
export function geometry(ctx) {
  const lod = ctx.lod || 1, P = ctx, n = lod <= 1 ? 48 : lod <= 2 ? 32 : lod <= 3 ? 20 : 12, m = Math.max(10, n / 2);
  dais(ctx, P, lod);
  paint(ctx, 'lime', COL.lime, 0.88);
  lathe(P, [[5.0, -0.2], [5.0, 0.45], [5.3, 0.5], [5.3, 0.68], [4.55, 0.68], [4.55, 0.15], [0, 0.15]], n);
  if (lod <= 2) { paint(ctx, 'ashlar', 'oklch(0.9 0.025 75)', 0.9); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; obox(P, Math.cos(a) * 5.02, 0.03, Math.sin(a) * 5.02, 0.35, 0.42, 0.12, -a + Math.PI / 2); } }
  paint(ctx, 'lime', 'oklch(0.95 0.02 85)', 0.85);
  lathe(P, [[1.0, 0.1], [0.72, 0.45], [0.55, 1.5], [0.8, 1.85], [0, 1.85]], m);
  lathe(P, [[0.6, 1.8], [2.2, 2.02], [3.0, 2.28], [3.08, 2.42], [2.88, 2.42], [2.84, 2.28], [0, 2.28]], n);
  lathe(P, [[0.45, 2.28], [0.36, 2.6], [0.3, 3.15], [0.46, 3.35], [0, 3.35]], m);
  lathe(P, [[0.36, 3.3], [1.3, 3.45], [1.78, 3.62], [1.84, 3.74], [1.64, 3.74], [1.6, 3.62], [0, 3.62]], Math.max(12, n * 0.75 | 0));
  lathe(P, [[0.32, 3.62], [0.24, 4.15], [0.4, 4.4], [0.4, 4.5], [0, 4.5]], m);
  if (lod <= 3) for (let i = 0; i < SPOUT.n; i++) lion(ctx, P, SPOUT.a0 + i / SPOUT.n * TAU + Math.PI / 4, lod); // four lion spouts, between the axes
  // the leaping fish, verdigris copper
  paint(ctx, 'copper', 'oklch(0.9 0.04 175)', 0.5, 0.6);
  const spine = [[0.14, 4.48, 0], [0.3, 4.9, 0], [0.28, 5.35, 0], [0.08, 5.75, 0], [-0.28, 5.98, 0], [-0.6, 6.05, 0]];
  loft(P, spine, [0.07, 0.22, 0.3, 0.27, 0.17, 0.05], lod <= 2 ? 10 : 6, 0.55);
  // tail fins at the base, dorsal and pectoral fins
  for (const s of [-1, 1]) { P.tri(0.14, 4.48, 0, 0.45, 4.35, s * 0.3, -0.1, 4.45, s * 0.28); P.tri(0.14, 4.48, 0, -0.1, 4.45, s * 0.28, 0.45, 4.35, s * 0.3); }
  P.tri(0.45, 5.2, 0, 0.72, 5.55, 0, 0.3, 5.7, 0); P.tri(0.45, 5.2, 0, 0.3, 5.7, 0, 0.72, 5.55, 0);
  for (const s of [-1, 1]) { P.tri(0.1, 5.5, s * 0.14, -0.1, 5.25, s * 0.42, 0.25, 5.3, s * 0.16); P.tri(0.1, 5.5, s * 0.14, 0.25, 5.3, s * 0.16, -0.1, 5.25, s * 0.42); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.22 0.02 60)', 0.4); for (const s of [-1, 1]) obox(P, -0.42, 6.0, s * 0.09, 0.06, 0.06, 0.03); }
}
export function collider(ctx) {
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, b = (i + 1) / n * TAU, r0 = 4.55, r1 = 5.3, y0 = -0.2, y1 = 0.68;
    const L = [[Math.cos(a) * r0, y0, Math.sin(a) * r0], [Math.cos(a) * r1, y0, Math.sin(a) * r1], [Math.cos(b) * r1, y0, Math.sin(b) * r1], [Math.cos(b) * r0, y0, Math.sin(b) * r0]];
    solid(ctx, L, L.map(([x, y, z]) => [x, y1, z]));
  }
  prism(ctx, ngon(10, 3.08), 1.8, 2.42); prism(ctx, ngon(8, 0.8), 0.15, 4.5);
  const D = DAIS, S = D.steps; // the dais: a solid block per step, walked up in 0.15 m risers
  S.forEach((h, i) => box(ctx, -h, -0.6, -h, h, -D.rise * (S.length - 1 - i), h));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const cx = sx * D.planter, cz = sz * D.planter, h = D.planterHalf; box(ctx, cx - h, 0, cz - h, cx + h, 0.53, cz + h); }
  for (let k = 0; k < 4; k++) { const m = Math.PI / 4 + k * Math.PI / 2; arcSolid(ctx, D.bench[0] - 0.12, D.bench[1] + 0.06, m - D.benchSpan, m + D.benchSpan, 0, 0.46, 3); arcSolid(ctx, D.bench[0] - 0.12, D.bench[0] + 0.1, m - D.benchSpan, m + D.benchSpan, 0.46, 0.88, 3); }
}
