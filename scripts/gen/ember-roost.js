// Ember's Roost: a weathered limestone perch tower behind the town hall (open cross-arched base, octagonal shaft, corbelled
// crown, round scorched perch with claw-scarred merlons and a bronze brazier) and its arched aqueduct north to the royal wall.
// params.part: 'tower' (origin = ground centre, params.top = perch floor height) | 'aqueduct' (same frame) | 'water' (strip).
import { TAU, paint, XF, lathe, solid, box, ngon, prism, obox, beam } from '../lib/town-kit.js';
import { gem } from '../lib/road-solid.js';
const ST = 'oklch(0.95 0.02 82)', ST2 = 'oklch(0.91 0.028 74)', ST3 = 'oklch(0.87 0.03 70)';
const SCORCH = 'cdn/texture-soot-scorched-pale-limestone.png';
const BRONZE = 'oklch(0.84 0.11 78)', IRON = 'oklch(0.26 0.012 60)';
const Y1 = 10.5; // aqueduct spandrel top; cornice to 10.8, channel walls to 11.6, water at 11.35

// a wall in the frame's x-y plane, z0..z1 thick, with round-headed openings { c, r, s } (centre, radius, spring height)
function archWall(ctx, P, x0, x1, y0, y1, z0, z1, ops, n, vous) {
  const ext = (poly, a = z0, b = z1) => { const q = []; for (const p of poly) if (!q.length || Math.hypot(p[0] - q[q.length - 1][0], p[1] - q[q.length - 1][1]) > 1e-4) q.push(p);
    if (q.length > 3 && Math.hypot(q[0][0] - q[q.length - 1][0], q[0][1] - q[q.length - 1][1]) < 1e-4) q.pop();
    if (q.length >= 3) solid(P, q.map(([x, y]) => [x, y, a]), q.map(([x, y]) => [x, y, b])); };
  let x = x0;
  for (const o of [...ops].sort((a, b) => a.c - b.c)) {
    if (o.c - o.r - x > 1e-3) ext([[x, y0], [o.c - o.r, y0], [o.c - o.r, y1], [x, y1]]);
    x = o.c + o.r;
    const { c, r, s } = o, H = y1 - s, ca = Math.atan2(H, r), A = [];
    for (let i = 0; i <= n; i++) A.push(i / n * Math.PI);
    A.push(ca, Math.PI - ca); A.sort((a, b) => a - b);
    const pa = (a) => [c + Math.cos(a) * r, s + Math.sin(a) * r];
    const qa = (a) => { const co = Math.cos(a), sn = Math.sin(a); const t = Math.min(Math.abs(co) > 1e-6 ? r / Math.abs(co) : 1e9, sn > 1e-6 ? H / sn : 1e9); return [c + co * t, s + sn * t]; };
    for (let i = 0; i < A.length - 1; i++) { const a = A[i], b = A[i + 1]; if (b - a > 1e-5) ext([pa(a), pa(b), qa(b), qa(a)]); }
    if (vous && s + r + 0.5 < y1) { // voussoirs, proud of both faces; one in eight crumbled back
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI, b = (i + 1) / n * Math.PI, key = i === Math.floor(n / 2) && n % 2 === 1;
        const R2 = r + (key ? 0.72 : 0.5), lost = !key && ctx.random() < 0.13, out = lost ? -0.02 : 0.07;
        paint(ctx, 'ashlar', i % 2 ? ST : ST3, 0.92);
        const p = (ang, rr) => [c + Math.cos(ang) * rr, s + Math.sin(ang) * rr];
        ext([p(a, r), p(b, r), p(b, R2), p(a, R2)], z0 - out, z1 + out);
      }
      paint(ctx, 'ashlar', ST, 0.9);
    }
  }
  if (x1 - x > 1e-3) ext([[x, y0], [x1, y0], [x1, y1], [x, y1]]);
}
const OCT = (r) => ngon(8, r, 0, 0, Math.PI / 8);
const rAt = (y) => 3.5 - 0.5 * (y - 7.9) / 10.3;

function tower(ctx, col) {
  const P = ctx, lod = col ? 5 : (ctx.lod || 1), top = ctx.params.top ?? 21.55;
  const pt = col ? () => {} : (...a) => paint(ctx, ...a);
  const vn = lod <= 2 ? 11 : lod === 3 ? 7 : 3, vous = !col && lod <= 2;
  // floor and the open cross-arched base
  pt('flag', ST2, 0.92); box(P, -4.2, -0.3, -3.5, 4.2, 0.06, 3.5);
  pt('ashlar', ST, 0.9);
  archWall(ctx, P, -4, 4, -0.3, 7.4, -3.3, -1.9, [{ c: 0, r: 2.3, s: 3.9 }], vn, vous);
  archWall(ctx, P, -4, 4, -0.3, 7.4, 1.9, 3.3, [{ c: 0, r: 2.3, s: 3.9 }], vn, vous);
  for (const sx of [-1, 1]) archWall(ctx, XF(P, sx * 3.3, 0, 0, -Math.PI / 2), -1.9, 1.9, -0.3, 7.4, -0.7, 0.7, [{ c: 0, r: 1.4, s: 3.9 }], vn, vous);
  if (!col && lod <= 3) { // vault: dark ceiling with cross ribs, impost blocks at the springings
    pt('ashlar', 'oklch(0.72 0.03 70)', 0.95); box(P, -2.6, 6.6, -1.9, 2.6, 6.8, 1.9);
    pt('ashlar', ST2, 0.9); beam(P, [-2.5, 6.5, -1.8], [2.5, 6.5, 1.8], 0.3, 0.25); beam(P, [-2.5, 6.5, 1.8], [2.5, 6.5, -1.8], 0.3, 0.25);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { obox(P, sx * 2.45, 3.75, sz * 2.6, 0.5, 0.2, 1.6); obox(P, sx * 3.3, 3.75, sz * 1.75, 1.6, 0.2, 0.5); }
    pt('ashlar', ST3, 0.95); // fallen blocks of the crumbled arches
    obox(P, -5.25, 0, -0.9, 0.85, 0.45, 0.6, 0.4); obox(P, -5.0, 0, 1.2, 0.6, 0.35, 0.5, 1.1); obox(P, -4.9, 0, -2.7, 0.5, 0.3, 0.45, 2.2);
    obox(P, -5.3, 0.45, -0.8, 0.45, 0.3, 0.4, 1.3);
  }
  // cornice and dentils
  pt('ashlar', ST2, 0.9); box(P, -4.25, 7.4, -3.55, 4.25, 7.9, 3.55);
  if (!col && lod <= 2) for (let x = -3.9; x <= 3.9; x += 0.55) { obox(P, x, 7.15, -3.38, 0.28, 0.25, 0.16); obox(P, x, 7.15, 3.38, 0.28, 0.25, 0.16); }
  // octagonal tapering shaft with course bands
  pt('ashlar', ST, 0.9); prism(P, OCT(3.5), 7.9, 18.2, 3.0 / 3.5);
  if (!col && lod <= 3) {
    pt('ashlar', ST2, 0.9); for (const y of [12.2, 15.8]) prism(P, OCT(rAt(y) + 0.14), y, y + 0.35);
    const ap = (y) => rAt(y) * Math.cos(Math.PI / 8) + 0.02;
    const face = (phi, u0, u1, y0, y1, d = 0) => { const n = [Math.cos(phi), Math.sin(phi)], t = [-Math.sin(phi), Math.cos(phi)];
      const p = (u, y) => { const a = ap(y) + d; return [n[0] * a + t[0] * u, y, n[1] * a + t[1] * u]; };
      P.quad(...p(u0, y0), ...p(u1, y0), ...p(u1, y1), ...p(u0, y1)); };
    pt(null, 'oklch(0.2 0.02 60)', 1); // arrow slits on the diagonals
    for (let k = 0; k < 4; k++) for (const y of [9.6, 13.4]) face(Math.PI / 4 + k * Math.PI / 2, -0.15, 0.15, y, y + 1.3);
    if (lod <= 2) {
      pt('ashlar', ST3, 0.92); for (let k = 0; k < 4; k++) for (const y of [9.6, 13.4]) { face(Math.PI / 4 + k * Math.PI / 2, -0.3, 0.3, y + 1.3, y + 1.5, 0.015); face(Math.PI / 4 + k * Math.PI / 2, -0.3, 0.3, y - 0.2, y, 0.015); }
      pt(null, 'oklch(0.72 0.035 72)', 1); // rain stains under the crown, one lichen
      for (let k = 0; k < 8; k++) { const u = (ctx.random() - 0.5) * 1.4; face(k * Math.PI / 4, u - 0.12, u + 0.12, 14 + ctx.random() * 2, 18.1, 0.01); }
      pt(null, 'oklch(0.7 0.06 128)', 1); for (let k = 0; k < 5; k++) { const u = (ctx.random() - 0.5) * 1.2, y = 8.2 + ctx.random() * 5; face(k * 1.3, u - 0.3, u + 0.25, y, y + 0.5, 0.012); }
      for (let i = 0; i < 20; i++) { const phi = Math.floor(ctx.random() * 8) * Math.PI / 4, y = 8.4 + ctx.random() * 9, u = (ctx.random() - 0.5) * 1.6, a = rAt(y) * Math.cos(Math.PI / 8) + 0.03;
        pt('ashlar', i % 3 ? ST2 : ST3, 0.92); obox(P, Math.cos(phi) * a - Math.sin(phi) * u, y, Math.sin(phi) * a + Math.cos(phi) * u, 0.75, 0.36, 0.1, -phi - Math.PI / 2); }
    }
  }
  // corbelled crown
  pt('ashlar', ST2, 0.9);
  if (col) prism(P, ngon(16, 3.0), 18.2, 20.6, 6.3 / 3.0);
  else {
    lathe(P, [[2.92, 18.2], [3.25, 18.6], [5.5, 20.15], [6.05, 20.6], [0.01, 20.6]], lod <= 2 ? 32 : 16);
    if (lod <= 3) for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * TAU, n = [Math.cos(a), Math.sin(a)], t = [-Math.sin(a), Math.cos(a)];
      const L = (w) => [[3.0, 18.0], [6.35, 20.05], [6.35, 20.6], [3.0, 20.6]].map(([r, y]) => [n[0] * r + t[0] * w, y, n[1] * r + t[1] * w]);
      solid(P, L(-0.22), L(0.22)); }
  }
  // the perch: flagged floor, scorched rim ring, low scorched parapet open toward the hall ledge
  pt('ashlar', ST, 0.9); prism(P, ngon(lod <= 2 ? 40 : 20, 6.5), 20.6, top);
  const deg = Math.PI / 180;
  if (!col) {
    const N = lod <= 2 ? 40 : 20;
    pt('flag', ST2, 0.92); for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU; P.tri(0, top + 0.004, 0, Math.cos(b) * 5.35, top + 0.004, Math.sin(b) * 5.35, Math.cos(a) * 5.35, top + 0.004, Math.sin(a) * 5.35); }
    pt(SCORCH, 'oklch(0.9 0.02 70)', 0.95); for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU, y = top + 0.006;
      P.quad(Math.cos(a) * 5.35, y, Math.sin(a) * 5.35, Math.cos(b) * 5.35, y, Math.sin(b) * 5.35, Math.cos(b) * 6.52, y, Math.sin(b) * 6.52, Math.cos(a) * 6.52, y, Math.sin(a) * 6.52); }
  }
  pt(SCORCH, 'oklch(0.88 0.02 66)', 0.95);
  const a0 = -40 * deg, a1 = 220 * deg, NS = col ? 10 : 26;
  for (let i = 0; i < NS; i++) { const a = a0 + (a1 - a0) * i / NS, b = a0 + (a1 - a0) * (i + 1) / NS;
    const L = [[5.95, a], [6.5, a], [6.5, b], [5.95, b]].map(([r, t]) => [Math.cos(t) * r, 0, Math.sin(t) * r]);
    solid(P, L.map(([x, , z]) => [x, top, z]), L.map(([x, , z]) => [x, top + 0.55, z])); }
  box(P, -2, top - 0.6, -7.05, 2, top, -6.0); // step across to the hall's ledge
  // giant merlons, claw-scarred; one broken
  const MER = [22.5, 67.5, 112.5, 157.5, 202.5, 337.5];
  MER.forEach((d, i) => {
    const a = d * deg, n = [Math.cos(a), Math.sin(a)], t = [-Math.sin(a), Math.cos(a)], h = i === 3 ? 0.85 : 1.5, y0 = top + 0.55;
    pt(SCORCH, i % 2 ? 'oklch(0.86 0.02 66)' : 'oklch(0.8 0.02 60)', 0.95);
    obox(P, n[0] * 6.22, y0, n[1] * 6.22, 1.5, h, 0.56, -a - Math.PI / 2);
    if (col || lod > 2) return;
    if (i !== 3) { pt('ashlar', ST2, 0.9); obox(P, n[0] * 6.22, y0 + h, n[1] * 6.22, 1.66, 0.14, 0.68, -a - Math.PI / 2); }
    else { pt('ashlar', ST3, 0.95); obox(P, n[0] * 4.9 + t[0] * 0.6, top, n[1] * 4.9 + t[1] * 0.6, 0.6, 0.4, 0.45, -a + 0.7); }
    for (const [rr, sgn] of [[6.5 + 0.012, 1], [5.94 - 0.012, -1]]) {
      const C = [n[0] * rr, n[1] * rr], p = (u, y) => [C[0] + t[0] * u, y, C[1] + t[1] * u];
      for (const u of [-0.36, 0, 0.36]) { const ya = y0 + 0.2, yb = Math.min(y0 + h - 0.1, y0 + 1.2), du = (yb - ya) * 0.45 * sgn;
        pt(null, 'oklch(0.3 0.02 50)', 1); P.quad(...p(u - 0.035, ya), ...p(u + 0.035, ya), ...p(u + du + 0.035, yb), ...p(u + du - 0.035, yb));
        pt(null, 'oklch(0.97 0.02 85)', 1); P.quad(...p(u + 0.035, ya), ...p(u + 0.06, ya), ...p(u + du + 0.06, yb), ...p(u + du + 0.035, yb)); }
    }
  });
  // gold-bronze brazier on a round plinth, NW of the perch
  const bx = -3.4, bz = 2.9;
  pt('ashlar', ST2, 0.9); prism(P, ngon(12, 1.0, bx, bz), top, top + 0.25);
  if (col) return;
  pt('cdn/texture-hammered-bronze-metal.png', BRONZE, 0.35, 0.85);
  for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.3, c = Math.cos(a), s = Math.sin(a);
    beam(P, [bx + c * 0.72, top + 0.28, bz + s * 0.72], [bx + c * 0.62, top + 0.7, bz + s * 0.62], 0.1);
    beam(P, [bx + c * 0.62, top + 0.7, bz + s * 0.62], [bx + c * 0.5, top + 1.12, bz + s * 0.5], 0.1);
    if (lod <= 2) gem(P, bx + c * 0.74, top + 0.3, bz + s * 0.74, 0.1, 0.08, 0.04, 5); }
  lathe(P, [[0.3, 1.0], [0.55, 1.05], [0.85, 1.3], [0.95, 1.55], [1.02, 1.62], [0.9, 1.62], [0.8, 1.42], [0.01, 1.42]], lod <= 2 ? 20 : 10, bx, top, bz);
  if (lod <= 2) for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; gem(P, bx + Math.cos(a) * 0.98, top + 1.62, bz + Math.sin(a) * 0.98, 0.07, 0.12, 0.02, 4); }
  pt(null, 'oklch(0.22 0.03 40)', 1); for (let k = 0; k < 7; k++) gem(P, bx + (ctx.random() - 0.5) * 1.0, top + 1.42, bz + (ctx.random() - 0.5) * 1.0, 0.14, 0.1, 0.02, 5);
  pt(null, 'oklch(0.6 0.18 45)', 1, 0); ctx.emissive(2.2, 0.7, 0.15);
  for (let k = 0; k < 6; k++) gem(P, bx + (ctx.random() - 0.5) * 0.9, top + 1.45, bz + (ctx.random() - 0.5) * 0.9, 0.1, 0.08, 0.02, 4);
  ctx.emissive(null);
  // iron rods the dragon banners hang from (N, E, W faces)
  pt(null, IRON, 0.5, 0.6);
  for (const phi of [Math.PI / 2, 0, Math.PI]) { const n = [Math.cos(phi), Math.sin(phi)], t = [-Math.sin(phi), Math.cos(phi)], r = 2.97, w = 2.66;
    const p = (u, rr, y) => [n[0] * rr + t[0] * u, y, n[1] * rr + t[1] * u];
    beam(P, p(-1.05, r, 18.05), p(1.05, r, 18.05), 0.06); beam(P, p(-0.8, 2.7, 18.2), p(-0.8, r, 18.05), 0.05); beam(P, p(0.8, 2.7, 18.2), p(0.8, r, 18.05), 0.05); }
}

function aqueduct(ctx, col) {
  const P = ctx, lod = col ? 5 : (ctx.lod || 1), pt = col ? () => {} : (...a) => paint(ctx, ...a);
  const vn = lod <= 2 ? 9 : lod === 3 ? 6 : 3, vous = !col && lod <= 2;
  const w = 3.525, r = w / 2, A = [0, 1, 2, 3].map((k) => ({ c: 4.0 + r + k * (w + 1.4), r, s: 6.8 }));
  const B = XF(P, 24, 0, 0, -Math.PI / 2); // frame x = local +z, the run north over the ring lane and the moat
  pt('ashlar', ST, 0.9);
  archWall(ctx, P, 2.9, 22.3, -0.5, Y1, -1.2, 1.2, A, vn, vous);
  archWall(ctx, B, 1.7, 19.8, -2.5, Y1, -1.2, 1.2, [{ c: 5.45, r: 3.75, s: 4.8 }, { c: 12.65, r: 1.85, s: 6.8 }, { c: 17.95, r: 1.85, s: 6.8 }], vn, vous);
  // castellum where the channel turns north
  box(P, 22.3, -0.5, -1.7, 25.7, Y1 + 0.3, 1.7);
  pt('ashlar', ST2, 0.9);
  box(P, 2.9, Y1, -1.45, 22.3, Y1 + 0.3, 1.45); box(B, 1.7, Y1, -1.45, 19.8, Y1 + 0.3, 1.45); box(P, 22.1, Y1, -1.9, 25.9, Y1 + 0.3, 1.9);
  // channel walls
  pt('ashlar', ST, 0.9);
  for (const s of [-1, 1]) { box(P, 2.9, 10.8, s > 0 ? 0.95 : -1.35, 22.1, 11.6, s > 0 ? 1.35 : -0.95); box(B, 1.9, 10.8, s > 0 ? 0.95 : -1.35, 19.8, 11.6, s > 0 ? 1.35 : -0.95); }
  box(P, 22.1, 10.8, -1.9, 22.5, 11.9, -0.95); box(P, 22.1, 10.8, 0.95, 22.5, 11.9, 1.9); box(P, 25.5, 10.8, -1.9, 25.9, 11.9, 1.9);
  box(P, 22.5, 10.8, -1.9, 25.5, 11.9, -1.5); box(P, 22.5, 10.8, 1.5, 23.05, 11.9, 1.9); box(P, 24.95, 10.8, 1.5, 25.5, 11.9, 1.9);
  if (col) return;
  if (lod <= 3) {
    pt('ashlar', ST2, 0.9);
    for (const [x, z] of [[22.1, -1.9], [25.3, -1.9], [25.3, 1.3], [22.1, 1.3]]) box(P, x, 11.9, z, x + 0.6, 12.6, z + 0.6);
    box(P, 22.2, 5.4, -1.8, 25.8, 5.7, 1.8);
    for (const pc of [8.225, 13.15, 18.075]) { box(P, pc - 0.85, -0.3, -1.4, pc + 0.85, 0.8, 1.4); box(P, pc - 0.78, 6.6, -1.3, pc + 0.78, 6.8, 1.3); }
    box(B, 9.05, -2.5, -1.4, 10.95, 0.8, 1.4); box(B, 14.35, -2.5, -1.4, 16.25, -1.0, 1.4); box(B, 14.42, 6.6, -1.3, 16.18, 6.8, 1.3);
    for (const s of [-1, 1]) prism(B, [[14.5, s * 1.2], [16.1, s * 1.2], [15.3, s * 2.1]], -2.5, -0.6);
    pt(null, 'oklch(0.48 0.05 195)', 0.6); // channel lining under the water
    P.quad(2.9, 10.82, -0.95, 2.9, 10.82, 0.95, 22.5, 10.82, 0.95, 22.5, 10.82, -0.95);
    P.quad(22.5, 10.82, -1.5, 22.5, 10.82, 1.5, 25.5, 10.82, 1.5, 25.5, 10.82, -1.5);
    B.quad(1.5, 10.82, -0.95, 1.5, 10.82, 0.95, 19.8, 10.82, 0.95, 19.8, 10.82, -0.95);
    pt(null, IRON, 0.5, 0.6); beam(P, [23.3, 9.85, -1.78], [24.7, 9.85, -1.78], 0.06); // banner rod on the castellum
  }
}

function water(ctx) {
  const y = 11.35, B = XF(ctx, 24, 0, 0, -Math.PI / 2);
  ctx.color('oklch(0.66 0.09 195)');
  ctx.quad(2.9, y, -0.95, 2.9, y, 0.95, 22.5, y, 0.95, 22.5, y, -0.95);
  ctx.quad(22.5, y, -1.5, 22.5, y, 1.5, 25.5, y, 1.5, 25.5, y, -1.5);
  B.quad(1.5, y, -0.95, 1.5, y, 0.95, 19.8, y, 0.95, 19.8, y, -0.95);
}

export function geometry(ctx) { const p = ctx.params.part || 'tower'; if (p === 'water') return water(ctx); if (p === 'aqueduct') return aqueduct(ctx, false); tower(ctx, false); }
export function collider(ctx) { const p = ctx.params.part || 'tower'; if (p === 'water') return null; if (p === 'aqueduct') return aqueduct(ctx, true); tower(ctx, true); }
