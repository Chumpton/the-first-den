// The pond falls: a mossy limestone boulder stack where a spring culvert spills over three stepped ledges into the den-creek's
// mouth at the lake. params.part "rock" (default): boulders, ledges, headwall + spout, one draw, a stepped collider.
// params.part "water": the spout stream, three basin sheets and three falls curtains (wear scripts/material-falls-water.js), no collider.
// Origin = the plunge foot at water level (y 0 = lake surface); front (−Z) is the way the water falls.
import { TAU, TEX, paint } from '../lib/yard-kit.js';
import { Q, T, box, solid } from '../lib/road-solid.js';
const ROCK = 'oklch(0.86 0.025 80)', MOSS = 'oklch(0.78 0.09 132)', DARK = 'oklch(0.3 0.02 230)';
// tiers: centre, radii, ledge top; the water sits 0.04 above
const TIERS = [
  { cx: 0, cz: 2.0, rx: 0.95, rz: 0.85, top: 2.3 },
  { cx: 0.2, cz: 0.35, rx: 1.05, rz: 0.7, top: 1.4 },
  { cx: 0, cz: -0.85, rx: 1.12, rz: 0.65, top: 0.6 },
];
// falls: lip x, lip z, from y, to y, width, throw
const FALLS = [
  { x: 0, z: 1.15, y0: 2.34, y1: 1.44, w: 0.8, out: 0.25 },
  { x: 0.25, z: -0.35, y0: 1.44, y1: 0.64, w: 1.0, out: 0.25 },
  { x: 0, z: -1.5, y0: 0.64, y1: -0.05, w: 1.2, out: 0.32 },
];
const BOULDERS = [
  [-1.6, 1.4, 2.9, 1.2, 1.7, 1.1], [1.7, 1.1, 2.7, 1.3, 1.5, 1.2], [0.2, 1.5, 4.0, 1.5, 1.5, 0.9],
  [-1.45, 1.3, 1.5, 0.9, 1.3, 0.9], [1.4, 1.4, 1.4, 0.85, 1.2, 0.9],
  [-1.45, 0.55, 0.15, 0.9, 1.0, 0.9], [1.8, 0.6, 0.1, 0.85, 1.0, 0.8],
  [-1.45, 0.05, -1.0, 0.8, 0.72, 0.8], [1.55, 0.0, -0.95, 0.9, 0.75, 0.8],
  [-1.15, -0.2, -2.2, 0.5, 0.38, 0.45], [1.25, -0.2, -2.35, 0.45, 0.32, 0.5], [2.4, -0.1, -1.6, 0.42, 0.32, 0.4],
  [-2.5, 0.1, 0.9, 0.6, 0.5, 0.55], [-1.9, 2.95, 3.1, 0.5, 0.36, 0.42], [2.9, 0.2, 1.6, 0.6, 0.55, 0.6],
];
function rnd(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
// a lumpy boulder: a lat-long ball, jittered, faces sorted to rock or moss by how much they face the sky
function boulder(faces, b, i, lod) {
  const [cx, cy, cz, rx, ry, rz] = b, r = rnd(i * 17 + 3), n = lod <= 1 ? 11 : lod <= 2 ? 8 : 5, m = lod <= 1 ? 6 : lod <= 2 ? 5 : 3;
  const P = [];
  for (let k = 0; k <= m; k++) {
    const ph = -Math.PI / 2 + (k / m) * Math.PI, row = [];
    for (let j = 0; j < n; j++) {
      const th = (j / n) * TAU + i, j1 = k === 0 || k === m ? 1 : 0.82 + r() * 0.3;
      const flat = k === m ? 0.75 : 1; // tops sit a little flat, like water-worn stone
      row.push([cx + Math.cos(th) * Math.cos(ph) * rx * j1, cy + Math.sin(ph) * ry * j1 * (k >= m - 1 ? flat + 0.1 : 1), cz + Math.sin(th) * Math.cos(ph) * rz * j1]);
    }
    P.push(row);
  }
  const o = [cx, cy, cz];
  for (let k = 0; k < m; k++) for (let j = 0; j < n; j++) {
    const jj = (j + 1) % n, a = P[k][j], bb = P[k][jj], c = P[k + 1][jj], d = P[k + 1][j];
    const up = (a[1] + bb[1] + c[1] + d[1]) / 4 - cy > ry * 0.62;
    faces.push({ moss: up && r() > 0.35, q: [a, bb, c, d], o });
  }
}
function ledgeLoop(t, y, s, lod, seed) {
  const n = lod <= 2 ? 9 : 6, r = rnd(seed), A = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU, j = 0.9 + r() * 0.16; A.push([t.cx + Math.cos(a) * t.rx * j * s, y, t.cz + Math.sin(a) * t.rz * j * s]); }
  return A;
}
function rocks(ctx, lod) {
  const faces = [];
  BOULDERS.forEach((b, i) => { if (lod >= 4 && Math.max(b[3], b[5]) < 0.6) return; boulder(faces, b, i, lod); });
  paint(ctx, 'stone', ROCK, 0.92);
  // ledges: irregular slabs, the top a touch smaller, a moss rim cap drawn after
  TIERS.forEach((t, i) => solid(ctx, ledgeLoop(t, -1, 1.05, lod, 40 + i), ledgeLoop(t, t.top, 1, lod, 40 + i)));
  for (const f of faces) if (!f.moss) Q(ctx, ...f.q, f.o);
  // headwall: coursed limestone with the culvert
  if (lod <= 2) {
    for (let c = 0; c < 4; c++) { const y0 = 0.6 + c * 0.65, off = (c % 2) * 0.35;
      for (let x = -0.8 - off; x < 0.8; x += 0.7) { const xa = Math.max(x, -0.8) + 0.02, xb = Math.min(x + 0.7, 0.8) - 0.02; if (xb - xa > 0.1) box(ctx, xa, y0 + 0.02, 3.0 + (c % 2) * 0.02, xb, y0 + 0.63, 3.55); } }
  } else box(ctx, -0.8, 0.6, 3.0, 0.8, 3.2, 3.55);
  box(ctx, -0.92, 3.2, 2.9, 0.92, 3.36, 3.65);
  // spout: a square stone lip with a round bore, poking out of the wall
  box(ctx, -0.24, 2.6, 2.55, 0.24, 2.66, 3.02);
  const sn = lod <= 2 ? 10 : 6, ring = (z, rr) => { const a = []; for (let i = 0; i < sn; i++) { const t = (i / sn) * TAU; a.push([Math.cos(t) * rr, 2.82 + Math.sin(t) * rr, z]); } return a; };
  paint(ctx, 'brass', 'oklch(0.8 0.05 150)', 0.6, 0.4);
  solid(ctx, ring(3.02, 0.17), ring(2.62, 0.17), false);
  paint(ctx, null, DARK, 1);
  for (let i = 0; i < sn; i++) { const A = ring(2.625, 0.13); T(ctx, A[i], A[(i + 1) % sn], [0, 2.82, 2.625], [0, 2.82, 3]); }
  // moss: sky-facing boulder faces, the coping's cap
  paint(ctx, 'moss', MOSS, 0.95);
  for (const f of faces) if (f.moss) Q(ctx, ...f.q, f.o);
  box(ctx, -0.8, 3.36, 3.0, 0.55, 3.42, 3.6);
  if (lod <= 2) { box(ctx, -1.1, 2.3, 2.75, -0.85, 2.36, 3.0); box(ctx, 0.9, 1.4, 0.9, 1.15, 1.46, 1.1); }
}
function strip(ctx, pts, w0, w1) { // a curtain down a centreline, width tapering, both faces drawn by the engine
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0, z0] = pts[i], [x1, y1, z1] = pts[i + 1], a = w0 + (w1 - w0) * (i / (pts.length - 1)), b = w0 + (w1 - w0) * ((i + 1) / (pts.length - 1));
    ctx.quad(x0 - a / 2, y0, z0, x0 + a / 2, y0, z0, x1 + b / 2, y1, z1, x1 - b / 2, y1, z1);
  }
}
function water(ctx, lod) {
  ctx.albedo(null); ctx.color('oklch(0.72 0.08 195)', 0.8); ctx.roughness(0.1); ctx.metalness(0);
  const seg = lod <= 2 ? 6 : 3;
  // basins
  TIERS.forEach((t, i) => { const L = ledgeLoop(t, t.top + 0.04, 0.9, lod, 40 + i), c = [t.cx, t.top + 0.04, t.cz];
    for (let k = 0; k < L.length; k++) ctx.tri(...c, ...L[(k + 1) % L.length], ...L[k]); });
  // spout stream: out of the bore, down into the top basin
  const sp = []; for (let i = 0; i <= seg; i++) { const s = i / seg; sp.push([0, 2.8 - 0.46 * s * s, 2.62 - 0.4 * Math.sin(s * Math.PI / 2)]); }
  strip(ctx, sp, 0.2, 0.3);
  // falls curtains
  for (const f of FALLS) { const p = []; for (let i = 0; i <= seg; i++) { const s = i / seg; p.push([f.x, f.y0 - (f.y0 - f.y1) * s * s, f.z - f.out * Math.sin(s * Math.PI / 2)]); }
    strip(ctx, p, f.w, f.w * 1.12); }
}
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod || 1;
  if (ctx.params.part === 'water') water(ctx, lod); else rocks(ctx, lod);
}
export function collider(ctx) {
  if (ctx.params.part === 'water') return null;
  box(ctx, -2.7, -1, 2.3, 2.9, 3.0, 4.8);
  box(ctx, -2.3, -1, 1.1, 2.2, 2.3, 2.3);
  box(ctx, -2.3, -1, -0.4, 2.6, 1.4, 1.1);
  box(ctx, -2.2, -1, -1.6, 2.4, 0.6, -0.4);
}
