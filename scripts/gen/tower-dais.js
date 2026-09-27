// Violet's dais by the wizard tower: a round limestone platform (radius 6.5, top 0.25 above its feet, chamfered edge a body walks up)
// with a slate rune band of glowing violet glyphs and a star medallion inlaid flush in its top. The same object carries the
// flagstone stepping path to the tower door, two warm lantern posts and the ring of rune discs set into the turf around both.
// params.slabs [[x,z,y,yaw,sx,sz]], params.glyphs [[x,z,y,rot,r]], params.lamps [[x,z,y]]: local to the dais centre, y = ground.
import { Q, T, solid, gem, TAU, TEX, paint, obox, blob } from '../lib/yard-kit.js';
const LIME = 'cdn/texture-weathered-pale-limestone-surface.png';
const RUNE = 'oklch(0.7 0.18 300)', WARM = 'oklch(0.85 0.12 75)', SLATE = 'oklch(0.36 0.02 245)', IRON = 'oklch(0.3 0.012 250)';
const TOP = 0.25, R = 6.5;
const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
const ring = (n, r, y, cx = 0, cz = 0, rot = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = rot + (i / n) * TAU; o.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); } return o; };
const TINTS = ['oklch(0.95 0.02 85)', 'oklch(0.91 0.025 78)', 'oklch(0.97 0.015 92)', 'oklch(0.93 0.02 70)'];
function stone(ctx, col) { paint(ctx, null, col, 0.92); ctx.albedo(LIME); }
function glow(ctx, col = RUNE) { paint(ctx, null, col, 0.4); ctx.emissive(col); }
function arcProf(ctx, a0, a1, prof) { solid(ctx, prof.map(([r, y]) => P(a0, r, y)), prof.map(([r, y]) => P(a1, r, y))); }
function strip(ctx, x0, z0, x1, z1, w, y) {
  const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, px = (-dz / l) * w / 2, pz = (dx / l) * w / 2, ex = (dx / l) * w / 2, ez = (dz / l) * w / 2;
  Q(ctx, [x0 - ex + px, y, z0 - ez + pz], [x1 + ex + px, y, z1 + ez + pz], [x1 + ex - px, y, z1 + ez - pz], [x0 - ex - px, y, z0 - ez - pz], [(x0 + x1) / 2, y - 1, (z0 + z1) / 2]);
}
function annulus(ctx, cx, cz, r0, r1, y, n) {
  for (let i = 0; i < n; i++) { const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    Q(ctx, [cx + Math.cos(a0) * r0, y, cz + Math.sin(a0) * r0], [cx + Math.cos(a0) * r1, y, cz + Math.sin(a0) * r1], [cx + Math.cos(a1) * r1, y, cz + Math.sin(a1) * r1], [cx + Math.cos(a1) * r0, y, cz + Math.sin(a0 + 0) * 0 + Math.sin(a1) * r0], [cx, y - 1, cz]); }
}
// a rune: a stave with two or three branches on a 3x3 grid, s wide, turned so its stave runs along ang
const SEGS = []; for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) { const a = [i % 3, (i / 3) | 0], b = [j % 3, (j / 3) | 0]; if (Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) === 1 && !(a[0] === 1 && b[0] === 1)) SEGS.push([a, b]); }
function glyph(ctx, cx, cz, ang, s, y, w) {
  const er = [Math.cos(ang), Math.sin(ang)], et = [-Math.sin(ang), Math.cos(ang)];
  const g = ([i, j]) => { const u = (i - 1) * s * 0.36, v = (j - 1) * s * 0.5; return [cx + et[0] * u + er[0] * v, cz + et[1] * u + er[1] * v]; };
  const st = [[[1, 0], [1, 2]]], k = 2 + (ctx.random() < 0.5 ? 1 : 0);
  while (st.length < k + 1) { const sg = SEGS[Math.floor(ctx.random() * SEGS.length)]; if (!st.includes(sg)) st.push(sg); }
  for (const [a, b] of st) { const p = g(a), q = g(b); strip(ctx, p[0], p[1], q[0], q[1], w, y); }
}
function lamp(ctx, x, z, y, hi) {
  stone(ctx, TINTS[0]);
  obox(ctx, x, y - 0.12, z, 0.44, 0.24, 0.44); obox(ctx, x, y + 0.12, z, 0.26, 0.66, 0.26); obox(ctx, x, y + 0.78, z, 0.36, 0.07, 0.36);
  glow(ctx, WARM); obox(ctx, x, y + 0.86, z, 0.17, 0.24, 0.17);
  paint(ctx, null, IRON, 0.5, 0.6);
  if (hi) for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, x + sx * 0.11, y + 0.85, z + sz * 0.11, 0.03, 0.27, 0.03);
  solid(ctx, ring(4, 0.21, y + 1.12, x, z, Math.PI / 4), ring(4, 0.03, y + 1.26, x, z, Math.PI / 4));
  if (hi) gem(ctx, x, y + 1.29, z, 0.035, 0.07, 0.03, 4);
}
export function geometry(ctx) {
  ctx.flat();
  const L = ctx.lod, hi = L <= 2, fine = L === 1, p = ctx.params || {}, Y = TOP;
  if (hi) {
    paint(ctx, null, 'oklch(0.74 0.02 80)', 0.95);
    solid(ctx, ring(32, 6.3, -0.35), ring(32, 6.3, Y - 0.025));
    const NE = 32, ge = 0.035 / R;
    for (let i = 0; i < NE; i++) { stone(ctx, TINTS[i % 4]); arcProf(ctx, (i / NE) * TAU + ge, ((i + 1) / NE) * TAU - ge, [[5.6, -0.35], [6.5, -0.35], [6.5, 0.1], [6.22, Y], [5.6, Y]]); }
    const rings = [[20, 4.31, 5.58, 0.5, null], [16, 3.42, 4.29, 0, SLATE], [12, 1.58, 3.4, 0.5, null]];
    for (const [n, r0, r1, off, col] of rings) { const g = 0.03 / r0;
      for (let i = 0; i < n; i++) { if (col) paint(ctx, null, col, 0.7); else stone(ctx, TINTS[(i + n) % 4]); arcProf(ctx, ((i + off) / n) * TAU + g, ((i + off + 1) / n) * TAU - g, [[r0, 0.05], [r1, 0.05], [r1, Y], [r0, Y]]); } }
    paint(ctx, null, SLATE, 0.7); solid(ctx, ring(16, 1.55, 0.05), ring(16, 1.55, Y));
    if (fine) { paint(ctx, 'moss', 'oklch(0.92 0.06 130)', 0.95);
      for (let i = 0; i < 32; i += 3) { const a = (i / 32) * TAU; const c = P(a, 6.2 + ctx.random() * 0.2, Y - 0.04); blob(ctx, c[0], c[1], c[2], 0.2, 0.06, 0.14, 4, () => ctx.random()); }
      for (let i = 0; i < 20; i += 4) { const a = ((i + 0.5) / 20) * TAU; const c = P(a, 5.0, Y - 0.04); blob(ctx, c[0], c[1], c[2], 0.12, 0.045, 0.1, 4, () => ctx.random()); } }
  } else {
    stone(ctx, TINTS[0]); solid(ctx, ring(24, R, -0.35), ring(24, R, 0.1)); solid(ctx, ring(24, R, 0.1), ring(24, 6.22, Y));
    paint(ctx, null, SLATE, 0.7); annulus(ctx, 0, 0, 3.42, 4.29, Y + 0.001, 24);
  }
  // the rune ring and the star, inlaid flush
  glow(ctx);
  const yr = Y + 0.002, nr = hi ? 64 : 24;
  annulus(ctx, 0, 0, 3.47, 3.53, yr, nr); annulus(ctx, 0, 0, 4.18, 4.24, yr, nr);
  if (L <= 3) for (let i = 0; i < 16; i++) { const a = ((i + 0.5) / 16) * TAU; glyph(ctx, Math.cos(a) * 3.855, Math.sin(a) * 3.855, a, 0.5, yr, 0.05); }
  const S = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i / 5) * TAU; S.push([Math.cos(a) * 1.22, Math.sin(a) * 1.22]); }
  for (let i = 0; i < 5; i++) { const a = S[i], b = S[(i + 2) % 5]; strip(ctx, a[0], a[1], b[0], b[1], 0.06, yr); }
  annulus(ctx, 0, 0, 1.3, 1.37, yr, hi ? 40 : 20);
  if (hi) annulus(ctx, 0, 0, 0, 0.14, yr, 10);
  // stepping slabs to the tower door
  for (const [x, z, y, yaw, sx, sz] of p.slabs || []) {
    const n = hi ? 7 : 4, A = [], B = [];
    for (let i = 0; i < n; i++) { const t = (i / n) * TAU, j = hi ? 0.86 + ctx.random() * 0.2 : 1, lx = Math.cos(t) * sx * 0.5 * j, lz = Math.sin(t) * sz * 0.5 * j;
      const wx = x + lx * Math.cos(yaw) + lz * Math.sin(yaw), wz = z - lx * Math.sin(yaw) + lz * Math.cos(yaw);
      A.push([wx, y - 0.14, wz]); B.push([wx, y + 0.035, wz]); }
    stone(ctx, TINTS[Math.floor(ctx.random() * 4)]); solid(ctx, A, B);
    if (fine) { paint(ctx, 'moss', 'oklch(0.92 0.06 130)', 0.95); const c = A[2]; blob(ctx, c[0], y + 0.005, c[2], 0.12, 0.04, 0.09, 4, () => ctx.random()); }
  }
  // rune discs in the turf
  if (hi) for (const [x, z, y, rot, r] of p.glyphs || []) {
    paint(ctx, null, SLATE, 0.75); solid(ctx, ring(hi ? 10 : 6, r, y - 0.06, x, z, rot), ring(hi ? 10 : 6, r * 0.97, y + 0.012, x, z, rot));
    glow(ctx); annulus(ctx, x, z, r * 0.76, r * 0.84, y + 0.02, hi ? 16 : 8); glyph(ctx, x, z, rot, r * 1.05, y + 0.02, r * 0.1);
  }
  for (const [x, z, y] of p.lamps || []) lamp(ctx, x, z, y, hi);
}
export function collider(ctx) {
  const p = ctx.params || {};
  solid(ctx, ring(24, 6.6, -0.35), ring(24, 6.2, TOP));
  for (const [x, z, y] of p.lamps || []) obox(ctx, x, y - 0.12, z, 0.44, 1.38, 0.44);
}
