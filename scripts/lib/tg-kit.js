// Tower Gardens geometry kit: every builder writes WORLD coordinates (y above ground); origin() sets the row's feet.
export const TAU = Math.PI * 2;
let OX = 0, OY = 0, OZ = 0;
export function origin(x, y, z) { OX = x; OY = y; OZ = z; }
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const Lp = (p) => [p[0] - OX, p[1] - OY, p[2] - OZ];
export function rnd(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// quad a,b,c,d; o = a point inside the solid: the face is wound to face away from it
export function Q(ctx, a, b, c, d, o) {
  if (o) { const n = crs(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4]; if (dot(n, sub(m, o)) < 0) { const t = b; b = d; d = t; } }
  ctx.quad(...Lp(a), ...Lp(b), ...Lp(c), ...Lp(d));
}
export function T(ctx, a, b, c, o) {
  if (o) { const n = crs(sub(b, a), sub(c, a)), m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]; if (dot(n, sub(m, o)) < 0) { const t = b; b = c; c = t; } }
  ctx.tri(...Lp(a), ...Lp(b), ...Lp(c));
}
export function box(ctx, x0, y0, z0, x1, y1, z1, noBottom = true) {
  const a = Math.min(x0, x1), b = Math.max(x0, x1), c = Math.min(y0, y1), d = Math.max(y0, y1), e = Math.min(z0, z1), f = Math.max(z0, z1);
  const o = [(a + b) / 2, (c + d) / 2, (e + f) / 2];
  Q(ctx, [a, c, e], [a, c, f], [a, d, f], [a, d, e], o); Q(ctx, [b, c, e], [b, d, e], [b, d, f], [b, c, f], o);
  Q(ctx, [a, d, e], [a, d, f], [b, d, f], [b, d, e], o); if (!noBottom) Q(ctx, [a, c, e], [b, c, e], [b, c, f], [a, c, f], o);
  Q(ctx, [a, c, e], [a, d, e], [b, d, e], [b, c, e], o); Q(ctx, [a, c, f], [b, c, f], [b, d, f], [a, d, f], o);
}
// an oriented bar from a to b: w across (horizontal), h the other way
export function beam(ctx, a, b, w, h = w, caps = true) {
  const d = nrm(sub(b, a)); let up = [0, 1, 0]; if (Math.abs(d[1]) > 0.95) up = [1, 0, 0];
  const s = nrm(crs(d, up)), u = crs(s, d);
  const P = (p, i, j) => [p[0] + s[0] * i * w / 2 + u[0] * j * h / 2, p[1] + s[1] * i * w / 2 + u[1] * j * h / 2, p[2] + s[2] * i * w / 2 + u[2] * j * h / 2];
  const o = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let k = 0; k < 4; k++) { const [i0, j0] = C[k], [i1, j1] = C[(k + 1) % 4]; Q(ctx, P(a, i0, j0), P(a, i1, j1), P(b, i1, j1), P(b, i0, j0), o); }
  if (caps) { Q(ctx, P(a, -1, -1), P(a, 1, -1), P(a, 1, 1), P(a, -1, 1), o); Q(ctx, P(b, -1, -1), P(b, 1, -1), P(b, 1, 1), P(b, -1, 1), o); }
}
// surface of revolution about the vertical through c: prof = [[r, y], …] bottom to top
export function lathe(ctx, c, prof, seg = 8, sx = 1, sz = 1) {
  for (let i = 0; i < prof.length - 1; i++) {
    const [r0, y0] = prof[i], [r1, y1] = prof[i + 1], o = [c[0], c[1] + (y0 + y1) / 2, c[2]];
    for (let j = 0; j < seg; j++) {
      const a0 = j / seg * TAU, a1 = (j + 1) / seg * TAU;
      const p = (r, y, a) => [c[0] + Math.cos(a) * r * sx, c[1] + y, c[2] + Math.sin(a) * r * sz];
      if (r0 < 1e-4) T(ctx, p(0, y0, 0), p(r1, y1, a0), p(r1, y1, a1), o);
      else if (r1 < 1e-4) T(ctx, p(r0, y0, a0), p(r0, y0, a1), p(0, y1, 0), o);
      else Q(ctx, p(r0, y0, a0), p(r0, y0, a1), p(r1, y1, a1), p(r1, y1, a0), o);
    }
  }
}
// a faceted blob: top, bottom and a ring of n
export function gem(ctx, c, rx, ry, rz, n = 4, yaw = 0) {
  const top = [c[0], c[1] + ry, c[2]], bot = [c[0], c[1] - ry, c[2]], R = [];
  for (let i = 0; i < n; i++) { const a = yaw + i / n * TAU; R.push([c[0] + Math.cos(a) * rx, c[1], c[2] + Math.sin(a) * rz]); }
  for (let i = 0; i < n; i++) { const p = R[i], q = R[(i + 1) % n]; T(ctx, p, q, top, c); T(ctx, q, p, bot, c); }
}
// a diamond leaf from b along dir, flat across side
export function leaf(ctx, b, dir, len, wid, side) {
  const d = nrm(dir), s = nrm(side), m = [b[0] + d[0] * len * 0.45, b[1] + d[1] * len * 0.45, b[2] + d[2] * len * 0.45];
  Q(ctx, b, [m[0] + s[0] * wid / 2, m[1] + s[1] * wid / 2, m[2] + s[2] * wid / 2], [b[0] + d[0] * len, b[1] + d[1] * len, b[2] + d[2] * len], [m[0] - s[0] * wid / 2, m[1] - s[1] * wid / 2, m[2] - s[2] * wid / 2]);
}
// a flat convex outline given a thickness offset: both faces and the edges
export function prism(ctx, poly, off) {
  const n = poly.length, B = poly.map((p) => [p[0] + off[0], p[1] + off[1], p[2] + off[2]]);
  const o = [0, 0, 0]; for (const p of poly) { o[0] += p[0] / n + off[0] / 2 / n * 1; o[1] += p[1] / n + off[1] / 2 / n; o[2] += p[2] / n + off[2] / 2 / n; }
  for (let i = 1; i < n - 1; i++) { T(ctx, poly[0], poly[i], poly[i + 1], o); T(ctx, B[0], B[i], B[i + 1], o); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, poly[i], poly[j], B[j], B[i], o); }
}
export function paint(ctx, p) {
  ctx.albedo(p.tex || null); ctx.color(p.col, p.a ?? 1); ctx.roughness(p.rough ?? 0.8); ctx.metalness(p.metal ?? 0);
  if (p.em) ctx.emissive(p.em[0], p.em[1], p.em[2]); else ctx.emissive(null);
}
export const PAL = {
  white: { col: 'oklch(0.95 0.012 95)', rough: 0.55 },
  glass: { col: 'oklch(0.93 0.03 170)', a: 0.33, rough: 0.1 },
  brick: { tex: 'cdn/texture-warm-red-garden-brick.png', col: 'oklch(0.95 0.02 50)', rough: 0.9 },
  gravel: { tex: 'scripts/tex-valley-gravel.js', col: 'oklch(0.97 0.03 80)', rough: 0.95 },
  oak: { tex: 'scripts/tex-home-architecture-wood.js', col: 'oklch(0.95 0.03 75)', rough: 0.75 },
  oakDark: { tex: 'scripts/tex-home-architecture-wood.js', col: 'oklch(0.8 0.04 60)', rough: 0.8 },
  stone: [{ tex: 'scripts/tex-garden-limestone.js', col: 'oklch(0.97 0.02 85)', rough: 0.9 }, { tex: 'scripts/tex-garden-limestone.js', col: 'oklch(0.92 0.03 75)', rough: 0.9 }, { tex: 'scripts/tex-garden-limestone.js', col: 'oklch(0.88 0.025 95)', rough: 0.9 }],
  terra: { col: 'oklch(0.63 0.12 45)', rough: 0.85 },
  soil: { col: 'oklch(0.33 0.04 50)', rough: 1 },
  leaf: { col: 'oklch(0.6 0.13 135)', rough: 0.8 },
  leaf2: { col: 'oklch(0.5 0.1 150)', rough: 0.8 },
  sage: { col: 'oklch(0.68 0.07 135)', rough: 0.8 },
  iron: { col: 'oklch(0.4 0.05 160)', rough: 0.5, metal: 0.3 },
  zinc: { col: 'oklch(0.76 0.01 240)', rough: 0.35, metal: 0.6 },
  tray: { col: 'oklch(0.3 0.02 60)', rough: 0.9 },
  wicker: { col: 'oklch(0.62 0.08 70)', rough: 0.9 },
  burlap: { col: 'oklch(0.74 0.06 80)', rough: 1 },
  straw: { col: 'oklch(0.84 0.12 90)', rough: 1 },
  wire: { col: 'oklch(0.3 0.01 60)', rough: 0.6 },
};
