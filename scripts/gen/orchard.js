// A small picnic orchard, one merged row: blossoming fruit trees (north-camp's tree: apple = white-pink + red fruit,
// cherry = pink), picnic tables with red-white checked cloths and a basket, a croquet lawn (hoops, pegs, balls, mallet).
// Everything is data in params (local metres to the row's feet): trees [x,z,gy,kind,scale], tables [x,z,gy,yawDeg,basket],
// hoops [x,z,gy,yawDeg], pegs [x,z,gy], balls [x,z,gy,colourIndex], mallets [x,z,gy,yawDeg].
import { TAU, paint, obox, beam, lathe, gem, box } from '../lib/yard-kit.js';
import { tree } from './north-camp.js';
const rot = (x, z, cx, cz, c, s) => [cx + x * c + z * s, cz - x * s + z * c];
const BALL = ['oklch(0.5 0.16 255)', 'oklch(0.55 0.2 28)', 'oklch(0.25 0.01 250)', 'oklch(0.85 0.16 95)'];
function table(ctx, lod, [cx, cz, gy, yawDeg = 0, basket = 1], idx) {
  const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), P = (x, z) => rot(x, z, cx, cz, c, s);
  const L = 1.8, W = 0.8, H = 0.74, bw = 0.28, bh = 0.44, bz = 0.62;
  paint(ctx, 'oak', 'oklch(0.93 0.03 70)', 0.85);
  // benches and their boards
  for (const sd of [-1, 1]) { const [x, z] = P(0, sd * bz); obox(ctx, x, gy + bh - 0.05, z, L, 0.05, bw, a); }
  // A-frame legs: from the bench ends up to the top
  for (const ex of [-0.7, 0.7]) {
    for (const sd of [-1, 1]) { const [x0, z0] = P(ex, sd * (bz + 0.1)), [x1, z1] = P(ex, sd * 0.18); beam(ctx, [x0, gy, z0], [x1, gy + H - 0.05, z1], 0.07, 0.07); }
    const [x0, z0] = P(ex, -bz - 0.05), [x1, z1] = P(ex, bz + 0.05); beam(ctx, [x0, gy + bh - 0.1, z0], [x1, gy + bh - 0.1, z1], 0.06, 0.08);
  }
  const [tx, tz] = P(0, 0); obox(ctx, tx, gy + H - 0.05, tz, L, 0.05, W, a);
  // checked cloth: top in cells, drops on the two long sides
  const nx = lod <= 2 ? 8 : 4, nz = lod <= 2 ? 4 : 2, cw = (L - 0.1) / nx, cd = (W + 0.1) / nz, y = gy + H + 0.004, drop = 0.2;
  for (const col of [0, 1]) {
    paint(ctx, 'linen', col ? 'oklch(0.97 0.01 90)' : 'oklch(0.55 0.19 27)', 0.95);
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      if ((i + j) % 2 !== col) continue;
      const x0 = -(L - 0.1) / 2 + i * cw, z0 = -(W + 0.1) / 2 + j * cd, A = P(x0, z0), B = P(x0 + cw, z0), C = P(x0 + cw, z0 + cd), D = P(x0, z0 + cd);
      ctx.quad(A[0], y, A[1], D[0], y, D[1], C[0], y, C[1], B[0], y, B[1]);
    }
    for (let i = 0; i < nx; i++) for (const sd of [-1, 1]) {
      if ((i + (sd < 0 ? 0 : nz - 1)) % 2 !== col) continue;
      const x0 = -(L - 0.1) / 2 + i * cw, zz = sd * (W + 0.1) / 2, A = P(x0, zz), B = P(x0 + cw, zz);
      if (sd < 0) ctx.quad(A[0], y, A[1], B[0], y, B[1], B[0], y - drop, B[1], A[0], y - drop, A[1]);
      else ctx.quad(B[0], y, B[1], A[0], y, A[1], A[0], y - drop, A[1], B[0], y - drop, B[1]);
    }
  }
  if (!basket || lod > 3) return;
  // wicker basket with a handle, apples and a folded napkin
  const [bx, bz2] = P(0.35, -0.05), by = y + 0.005;
  paint(ctx, 'wicker', 'oklch(0.9 0.05 75)', 0.95);
  lathe(ctx, [[0, by], [0.15, by], [0.18, by + 0.16], [0.19, by + 0.17]], lod <= 2 ? 10 : 6, bx, bz2);
  const hA = P(0.35 - 0.17, -0.05), hB = P(0.35 + 0.17, -0.05), hm = P(0.35, -0.05);
  const arc = [[hA[0], by + 0.17, hA[1]], [(hA[0] + hm[0]) / 2, by + 0.33, (hA[1] + hm[1]) / 2], [hm[0], by + 0.37, hm[1]], [(hB[0] + hm[0]) / 2, by + 0.33, (hB[1] + hm[1]) / 2], [hB[0], by + 0.17, hB[1]]];
  for (let k = 0; k < 4; k++) beam(ctx, arc[k], arc[k + 1], 0.025, 0.025);
  paint(ctx, null, 'oklch(0.56 0.19 28)', 0.45);
  for (const [ox, oz] of [[-0.06, 0.03], [0.06, -0.02], [0, 0.07]]) { const [x, z] = P(0.35 + ox, -0.05 + oz); gem(ctx, x, by + 0.2, z, 0.05, 0.045, 0.045, 6); }
  const [ax, az] = P(-0.4, 0.12); gem(ctx, ax, by + 0.04, az, 0.045, 0.04, 0.04, 6);
  paint(ctx, null, 'oklch(0.97 0.01 90)', 0.9); const [px, pz] = P(-0.3, -0.15); obox(ctx, px, by, pz, 0.24, 0.02, 0.24, a + 0.3);
}
function hoop(ctx, [x, z, gy, yawDeg = 0]) {
  const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), r = 0.13, h = 0.2;
  paint(ctx, null, 'oklch(0.97 0.005 90)', 0.4, 0.3);
  const pts = []; for (let i = 0; i <= 6; i++) { const t = Math.PI * i / 6, lx = Math.cos(t) * r; pts.push([x + lx * c, gy + h + Math.sin(t) * r * 0.9, z - lx * s]); }
  beam(ctx, [x + r * c, gy - 0.05, z - r * s], pts[0], 0.018, 0.018); beam(ctx, [x - r * c, gy - 0.05, z + r * s], pts[6], 0.018, 0.018);
  for (let i = 0; i < 6; i++) beam(ctx, pts[i], pts[i + 1], 0.018, 0.018);
}
function peg(ctx, [x, z, gy]) {
  const bands = BALL, hh = 0.1;
  for (let i = 0; i < 4; i++) { paint(ctx, null, bands[i], 0.6); lathe(ctx, [[0.028, gy + i * hh], [0.028, gy + (i + 1) * hh]], 6, x, z); }
  paint(ctx, 'oak', 'oklch(0.95 0.03 75)', 0.8); lathe(ctx, [[0.028, gy + 0.4], [0.028, gy + 0.55], [0, gy + 0.6]], 6, x, z);
}
function mallet(ctx, [x, z, gy, yawDeg = 0]) {
  const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  paint(ctx, 'oak', 'oklch(0.95 0.03 75)', 0.8);
  beam(ctx, [x, gy + 0.05, z], [x + 0.85 * c, gy + 0.03, z - 0.85 * s], 0.03, 0.03);
  obox(ctx, x, gy, z, 0.08, 0.09, 0.24, a);
  paint(ctx, null, BALL[1], 0.6); obox(ctx, x, gy + 0.03, z, 0.085, 0.02, 0.245, a);
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  (p.trees || []).forEach((t, i) => tree(ctx, lod, t, i + 40));
  (p.tables || []).forEach((t, i) => table(ctx, lod, t, i));
  if (lod > 3) return;
  (p.hoops || []).forEach((h) => hoop(ctx, h));
  (p.pegs || []).forEach((g) => peg(ctx, g));
  for (const [x, z, gy, ci] of p.balls || []) { paint(ctx, null, BALL[ci % 4], 0.35); lathe(ctx, [[0, gy], [0.035, gy + 0.008], [0.048, gy + 0.048], [0.035, gy + 0.088], [0, gy + 0.096]], 8, x, z); }
  (p.mallets || []).forEach((m) => mallet(ctx, m));
}
export function collider(ctx) {
  const p = ctx.params || {};
  for (const [x, z, gy, , sc = 1] of p.trees || []) box(ctx, x - 0.2 * sc, gy - 0.3, z - 0.2 * sc, x + 0.2 * sc, gy + 1.8, z + 0.2 * sc);
  for (const [cx, cz, gy, yawDeg = 0] of p.tables || []) {
    const a = yawDeg * Math.PI / 180, big = Math.abs(Math.sin(a)) > 0.7; // tables stand square (0/90) on this lawn
    const hx = big ? 0.4 : 0.9, hz = big ? 0.9 : 0.4, bx = big ? 0.76 : 0.9, bz = big ? 0.9 : 0.76;
    box(ctx, cx - hx, gy, cz - hz, cx + hx, gy + 0.76, cz + hz);
    box(ctx, cx - bx, gy, cz - bz, cx + bx, gy + 0.44, cz + bz);
  }
}
