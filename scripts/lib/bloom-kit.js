// shared garden flora helpers: vine tubes, wisteria racemes, rose blooms, fern fronds, mushrooms, moss pads.
// Used by scripts/gen/gazebo-bloom.js and scripts/gen/tree-roots.js. All emit into the current paint.
import { Q, T, gem, nrm, crs, TAU } from './yard-kit.js';
import { lathe } from './garden-kit.js';
export const MOSS = 'cdn/texture-soft-green-moss-cozy.png', BARK = 'cdn/texture-rough-oak-bark-cozy.png';
export function flat(ctx, col, rough = 0.9, emi = null) { ctx.albedo(null); ctx.color(col); ctx.roughness(rough); ctx.metalness(0); ctx.emissive(emi); }
export function rng(seed) { let s = (seed * 9301 + 49297) % 233280; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
function basis(d) { const up = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0]; const s = nrm(crs(d, up)); return [s, crs(s, d)]; }
// open tube through pts; rad = number or t => r
export function tube(ctx, pts, rad, n = 3) {
  const R = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const [s, u] = basis(nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]));
    const r = typeof rad === 'function' ? rad(i / (pts.length - 1)) : rad;
    return Array.from({ length: n }, (_, k) => { const t = k / n * TAU, c = Math.cos(t) * r, e = Math.sin(t) * r; return [p[0] + s[0] * c + u[0] * e, p[1] + s[1] * c + u[1] * e, p[2] + s[2] * c + u[2] * e]; });
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const o = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, (pts[i][2] + pts[i + 1][2]) / 2];
    for (let k = 0; k < n; k++) Q(ctx, R[i][k], R[i][(k + 1) % n], R[i + 1][(k + 1) % n], R[i + 1][k], o);
  }
}
// a leaf card: from p along d, width across s
export function leafCard(ctx, p, d, s, L, W) {
  const m = [p[0] + d[0] * L * 0.45, p[1] + d[1] * L * 0.45, p[2] + d[2] * L * 0.45];
  ctx.quad(...p, m[0] + s[0] * W, m[1] + s[1] * W, m[2] + s[2] * W, p[0] + d[0] * L, p[1] + d[1] * L, p[2] + d[2] * L, m[0] - s[0] * W, m[1] - s[1] * W, m[2] - s[2] * W);
}
// a drooping wisteria raceme hanging from top: two tapering segments, deep lilac to pale tip
export function raceme(ctx, top, len, r, sway, lod) {
  const n = lod <= 2 ? 4 : 3, rot = sway * 3;
  const ring = (c, rr) => Array.from({ length: n }, (_, k) => { const t = rot + k / n * TAU; return [c[0] + Math.cos(t) * rr, c[1], c[2] + Math.sin(t) * rr]; });
  const mid = [top[0] + sway * 0.06, top[1] - len * 0.5, top[2] + sway * 0.04], tip = [top[0] + sway * 0.1, top[1] - len, top[2] + sway * 0.07];
  const A = ring(top, r), B = ring(mid, r * 0.72);
  flat(ctx, 'oklch(0.62 0.14 303)', 0.8);
  for (let k = 0; k < n; k++) Q(ctx, A[k], A[(k + 1) % n], B[(k + 1) % n], B[k], mid);
  flat(ctx, 'oklch(0.8 0.1 300)', 0.8);
  for (let k = 0; k < n; k++) T(ctx, B[k], B[(k + 1) % n], tip, mid);
}
const ROSE = ['oklch(0.7 0.15 8)', 'oklch(0.88 0.07 45)', 'oklch(0.58 0.17 12)', 'oklch(0.8 0.11 355)'];
export function rose(ctx, c, r, i, lod) {
  flat(ctx, ROSE[i % ROSE.length], 0.7);
  gem(ctx, c[0], c[1], c[2], r, r * 0.7, r * 0.6, lod <= 1 ? 6 : 5);
  if (lod <= 1) { flat(ctx, 'oklch(0.5 0.16 12)', 0.7); gem(ctx, c[0], c[1] + r * 0.45, c[2], r * 0.45, r * 0.45, r * 0.2, 4); }
}
// an arching fern frond from base toward yaw (radians, atan2 sense), len m, rising then drooping
export function frond(ctx, base, a, len, rise, lod, col = 'oklch(0.6 0.13 138)') {
  const seg = lod <= 1 ? 5 : 3, d0 = [Math.cos(a), 0, Math.sin(a)], side = [-d0[2], 0, d0[0]];
  flat(ctx, col, 0.95);
  const P = (t) => [base[0] + d0[0] * len * t, base[1] + rise * (1.7 * t - 1.9 * t * t), base[2] + d0[2] * len * t];
  for (let i = 0; i < seg; i++) {
    const t0 = i / seg, t1 = (i + 1) / seg, p0 = P(t0), p1 = P(t1), d = nrm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
    const L = len * 0.34 * (1 - t0 * 0.75), W = L * 0.28;
    for (const sg of [1, -1]) leafCard(ctx, p0, nrm([side[0] * sg + d[0] * 0.55, d[1] * 0.5 - 0.25, side[2] * sg + d[2] * 0.55]), d, L, W);
  }
  const tip = P(1), pe = P((seg - 1) / seg); leafCard(ctx, pe, nrm([tip[0] - pe[0], tip[1] - pe[1], tip[2] - pe[2]]), side, len / seg * 1.3, len * 0.04);
}
export function fernClump(ctx, c, s, lod, R, col) {
  const N = lod <= 1 ? 8 : lod <= 2 ? 6 : 4;
  for (let i = 0; i < N; i++) frond(ctx, c, i / N * TAU + R() * 0.5, s * (0.75 + R() * 0.35), s * (0.45 + R() * 0.2), lod, col);
}
export function mushroom(ctx, x, y, z, h, r, lod, i = 0) {
  const n = lod <= 2 ? 7 : 5;
  flat(ctx, 'oklch(0.93 0.03 85)', 0.9);
  lathe(ctx, [[r * 0.3, -0.03], [r * 0.24, h * 0.6], [r * 0.2, h]], n, [x, y, z]);
  flat(ctx, ['oklch(0.66 0.13 50)', 'oklch(0.74 0.1 70)', 'oklch(0.6 0.15 35)'][i % 3], 0.75);
  lathe(ctx, [[r * 0.2, 0], [r, r * 0.05], [r * 0.85, r * 0.42], [r * 0.4, r * 0.66], [0, r * 0.7]], n, [x, y + h, z]);
}
export function mossPad(ctx, x, y, z, r, lod, tint = 'oklch(0.74 0.13 132)') {
  ctx.albedo(MOSS); ctx.color(tint); ctx.roughness(1); ctx.metalness(0); ctx.emissive(null);
  gem(ctx, x, y, z, r, r * 0.35, r * 0.25, lod <= 2 ? 7 : 5);
}
