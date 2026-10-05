// The blossom walk: north-camp's grove stepping down to the maze gate. Params are baked WORLD positions + ground heights
// (read at placement), shifted by params.o (row feet). part "grove": blossom trees (north-camp's tree), petal carpets,
// two smooth stone benches. part "shrine": the vermilion torii over pathMaze and a Kasuga stone toro with a glowing firebox.
import { TAU, paint, obox, solid, ngon, Q, T, box, gem } from '../lib/yard-kit.js';
import { tree } from './north-camp.js';
import { softened } from "./soften.js";
const rnd = (seed) => { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
const PINK = ['oklch(0.9 0.07 352)', 'oklch(0.84 0.1 356)', 'oklch(0.95 0.04 345)', 'oklch(0.78 0.12 358)'];
const VERM = 'oklch(0.6 0.19 33)', INK = 'oklch(0.26 0.015 250)', STONE = 'oklch(0.9 0.02 95)';
const cen = (L) => { const o = [0, 0, 0]; for (const p of L) { o[0] += p[0]; o[1] += p[1]; o[2] += p[2]; } return o.map((v) => v / L.length); };
function loft(ctx, L) {
  for (let k = 0; k < L.length - 1; k++) { const o = cen(L[k].concat(L[k + 1])), n = L[k].length; for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, L[k][i], L[k][j], L[k + 1][j], L[k + 1][i], o); } }
  for (const [a, b] of [[0, 1], [L.length - 1, L.length - 2]]) { const c = cen(L[a]), o = cen(L[b]), n = L[a].length; for (let i = 0; i < n; i++) T(ctx, L[a][i], L[a][(i + 1) % n], c, o); }
}
// frame: across a (posts), up y, along b; centre c, across n, along d
const frame = (c, gy, n, d) => (a, y, b) => [c[0] + a * n[0] + b * d[0], gy + y, c[1] + a * n[1] + b * d[1]];
const sec = (P, a, y0, y1, w) => [P(a, y0, -w / 2), P(a, y0, w / 2), P(a, y1, w / 2), P(a, y1, -w / 2)];
const bar = (ctx, P, a0, a1, y0, y1, w) => loft(ctx, [sec(P, a0, y0, y1, w), sec(P, a1, y0, y1, w)]);
// chamfered slab along a: octagon section (w across b, h up), ends chamfered
function slab(ctx, P, a0, a1, y0, h, w, bv, lod) {
  const oct = (a, s = 0) => { const hw = w / 2 - s, e = bv; return lod <= 2 ? [[-hw, y0 + e], [-hw + e, y0 + s * 0], [hw - e, y0], [hw, y0 + e], [hw, y0 + h - e], [hw - e, y0 + h], [-hw + e, y0 + h], [-hw, y0 + h - e]].map(([b, y]) => P(a, s ? y + (y > y0 + h / 2 ? -s : s) : y, b)) : [[-hw, y0], [hw, y0], [hw, y0 + h], [-hw, y0 + h]].map(([b, y]) => P(a, y, b)); };
  loft(ctx, lod <= 2 ? [oct(a0, bv * 0.6), oct(a0 + bv), oct(a1 - bv), oct(a1, bv * 0.6)] : [oct(a0, 0), oct(a1, 0)]);
}
const ring = (n, r, y, cx, cz, rot = 0) => ngon(n, r, cx, cz, rot).map(([x, z]) => [x, y, z]);
function toro(ctx, lod, [x, z, gy, yaw]) {
  const n = 6, rot = yaw + Math.PI / 6, L = (r, y) => ring(n, r, gy + y, x, z, rot), R = (r, y) => ring(lod <= 2 ? 10 : 6, r, gy + y, x, z);
  paint(ctx, 'moss', 'oklch(0.8 0.06 130)', 1); loft(ctx, [L(0.42, -0.2), L(0.42, 0.04)]);
  paint(ctx, 'stone', STONE, 0.9);
  loft(ctx, [L(0.36, 0.04), L(0.36, 0.16), L(0.24, 0.26)]);
  loft(ctx, [R(0.1, 0.26), R(0.09, 0.95)]);
  if (lod <= 2) loft(ctx, [R(0.13, 0.56), R(0.13, 0.62)]);
  loft(ctx, [L(0.2, 0.95), L(0.34, 1.07), L(0.34, 1.13)]);
  // firebox: six stone posts round a glowing paper core
  const P = ngon(n, 0.24, x, z, rot);
  if (lod <= 3) for (const [px, pz] of P) box(ctx, px - 0.045, gy + 1.13, pz - 0.045, px + 0.045, gy + 1.5, pz + 0.045);
  else loft(ctx, [L(0.24, 1.13), L(0.24, 1.5)]);
  paint(ctx, null, 'oklch(0.96 0.05 85)', 0.6); ctx.emissive('oklch(0.86 0.16 70)');
  loft(ctx, [L(0.17, 1.13), L(0.17, 1.5)]);
  paint(ctx, 'stone', STONE, 0.9);
  loft(ctx, [L(0.26, 1.48), L(0.52, 1.55), L(0.52, 1.6), L(0.1, 1.84)]);
  if (lod <= 2) for (const [px, pz] of ngon(n, 0.55, x, z, rot)) gem(ctx, px, gy + 1.6, pz, 0.05, 0.08, 0.02, 4);
  loft(ctx, [R(0.08, 1.84), R(0.06, 1.9)]);
  gem(ctx, x, gy + 1.94, z, 0.085, 0.11, 0.05, lod <= 2 ? 8 : 5);
}
function torii(ctx, lod, t) {
  const { c, gy, d, half = 2.35 } = t, n = [-d[1], d[0]], P = frame(c, gy, n, d), A = half + 1.05;
  const seg = lod <= 2 ? 10 : 6;
  const post = (s) => { const oc = (r, y, a) => ngon(seg, r, 0, 0).map(([u, v]) => P(a + u, y, v)); return [s * half, s * (half - 0.07)]; };
  for (const s of [-1, 1]) {
    const [a0, a1] = post(s), oc = (r, y, a) => ngon(seg, r, 0, 0).map(([u, v]) => P(a + u, y, v));
    paint(ctx, 'stone', STONE, 0.9); loft(ctx, [sec(P, a0 - 0.34, -0.25, 0.08, 0.68).slice(0, 2).concat(sec(P, a0 + 0.34, -0.25, 0.08, 0.68).slice(0, 2).reverse()).map((p, i) => p), sec(P, a0 - 0.34, 0.08, 0.08, 0.68).slice(0, 2).concat(sec(P, a0 + 0.34, 0.08, 0.08, 0.68).slice(0, 2).reverse())]);
    paint(ctx, null, INK, 0.7); loft(ctx, [oc(0.24, -0.05, a0), oc(0.24, 0.5, a0 - s * 0.008)]);
    paint(ctx, null, VERM, 0.6); loft(ctx, [oc(0.2, 0.5, a0 - s * 0.008), oc(0.165, 4.34, a1)]);
    if (lod <= 2) { paint(ctx, null, VERM, 0.6); bar(ctx, P, a1 - s * 0.2 - 0.06, a1 - s * 0.2 + 0.06, 3.36, 3.7, 0.28); }
  }
  paint(ctx, null, VERM, 0.6);
  bar(ctx, P, -(half + 0.6), half + 0.6, 3.4, 3.66, 0.2);   // nuki: clear 3.4 m
  bar(ctx, P, -(half + 0.72), half + 0.72, 4.1, 4.34, 0.28); // shimaki
  bar(ctx, P, -0.11, 0.11, 3.66, 4.1, 0.16);                // gakuzuka
  paint(ctx, null, 'oklch(0.33 0.02 250)', 0.5); bar(ctx, P, -0.24, 0.24, 3.6, 4.18, 0.24); // gaku plaque
  if (lod <= 2) { paint(ctx, null, 'oklch(0.8 0.13 85)', 0.35, 0.6); bar(ctx, P, -0.2, 0.2, 3.64, 4.14, 0.25); paint(ctx, null, 'oklch(0.33 0.02 250)', 0.5); bar(ctx, P, -0.17, 0.17, 3.67, 4.11, 0.26); }
  // kasagi: upswept lintel, vermilion under a black cap
  const N = lod <= 2 ? 12 : lod <= 3 ? 6 : 2, yb = (a) => 4.34 + 0.34 * Math.pow(Math.abs(a) / A, 2.6);
  const V = [], K = [];
  for (let i = 0; i <= N; i++) { const a = -A + 2 * A * i / N, y = yb(a); V.push(sec(P, a, y, y + 0.2, 0.34)); K.push(sec(P, a * 1.02, y + 0.2, y + 0.36, 0.46)); }
  paint(ctx, null, VERM, 0.6); loft(ctx, V);
  paint(ctx, null, INK, 0.7); loft(ctx, K);
}
function bench(ctx, lod, [x, z, gy, yaw]) {
  const d = [Math.cos(yaw), -Math.sin(yaw)], P = frame([x, z], gy, [-d[1], d[0]], d);
  paint(ctx, 'stone', 'oklch(0.92 0.015 90)', 0.75);
  // along-a is the bench's length: use a frame whose a runs along d
  const Pa = (a, y, b) => P(b, y, a);
  for (const s of [-0.58, 0.58]) slab(ctx, Pa, s - 0.17, s + 0.17, -0.2, 0.55, 0.44, 0.05, lod);
  slab(ctx, Pa, -0.88, 0.88, 0.35, 0.13, 0.52, 0.05, lod);
}
function patch(ctx, lod, [x, z, r, gy], k) {
  const R = rnd(k * 31 + 7), m = lod <= 2 ? 11 : 7, y = gy + 0.04;
  const blobF = (rr, yy, col) => { paint(ctx, null, col, 0.95); const pts = []; for (let i = 0; i < m; i++) { const a = i / m * TAU, j = 0.7 + R() * 0.45; pts.push([x + Math.cos(a) * rr * j, yy, z + Math.sin(a) * rr * j]); } const c = [x, yy, z], o = [x, yy - 1, z]; for (let i = 0; i < m; i++) T(ctx, pts[i], pts[(i + 1) % m], c, o); };
  blobF(r, y, PINK[k % 3]);
  if (lod <= 3) blobF(r * 0.55, y + 0.008, PINK[(k + 1) % 4]);
  if (lod > 2) return;
  for (let i = 0; i < 14; i++) { const a = R() * TAU, rr = r * (0.9 + R() * 0.8), s = 0.05 + R() * 0.035, q = R() * 3, cx = x + Math.cos(a) * rr, cz = z + Math.sin(a) * rr, c = Math.cos(q) * s, e = Math.sin(q) * s;
    paint(ctx, null, PINK[i % 4], 0.95); ctx.quad(cx - c, y, cz - e, cx - e, y, cz + c, cx + c, y, cz + e, cx + e, y, cz - c); }
}
const loc = (p, o) => { const q = p.slice(); q[0] -= o[0]; q[1] -= o[1]; return q; };
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params, o = p.o || [0, 0], oy = p.oy ?? 0.5, lod = ctx.lod;
  if (p.part === 'shrine') {
    if (p.torii) { const t = p.torii; torii(ctx, lod, { ...t, c: [t.c[0] - o[0], t.c[1] - o[1]], gy: t.gy - oy }); }
    if (p.toro) { const q = loc(p.toro, o); q[2] -= oy; toro(ctx, lod, q); }
    return;
  }
  (p.patches || []).forEach((q, k) => { const l = loc(q, o); l[3] -= oy; patch(ctx, lod, l, k); });
  (p.trees || []).forEach((q, k) => { const l = loc(q, o); l[2] -= oy; tree(ctx, lod, l, 40 + k); });
  (p.benches || []).forEach((q) => { const l = loc(q, o); l[2] -= oy; bench(ctx, lod, l); });
});
export function collider(ctx) {
  const p = ctx.params, o = p.o || [0, 0], oy = p.oy ?? 0.5;
  if (p.part === 'shrine') {
    if (p.torii) { const t = p.torii, d = t.d, n = [-d[1], d[0]], P = frame([t.c[0] - o[0], t.c[1] - o[1]], t.gy - oy, n, d), h = t.half ?? 2.35;
      for (const s of [-1, 1]) bar(ctx, P, s * h - 0.22, s * h + 0.22, -0.2, 4.34, 0.44);
      bar(ctx, P, -(h + 0.6), h + 0.6, 3.4, 3.66, 0.2); bar(ctx, P, -(h + 1.05), h + 1.05, 4.1, 4.9, 0.46); }
    if (p.toro) { const [x, z, gy] = loc(p.toro, o); box(ctx, x - 0.36, gy - oy - 0.2, z - 0.36, x + 0.36, gy - oy + 1.95, z + 0.36); }
    return;
  }
  for (const q of p.trees || []) { const [x, z, gy, , sc = 1] = loc(q, o); box(ctx, x - 0.2 * sc, gy - oy - 0.3, z - 0.2 * sc, x + 0.2 * sc, gy - oy + 1.8 * sc, z + 0.2 * sc); }
  for (const q of p.benches || []) { const [x, z, gy, yaw] = loc(q, o), d = [Math.cos(yaw), -Math.sin(yaw)], P = frame([x, z], gy - oy, [-d[1], d[0]], d); bar(ctx, (a, y, b) => P(b, y, a), -0.88, 0.88, -0.2, 0.48, 0.52); }
}
