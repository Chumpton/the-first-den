// Hearthmere's shared mesh kit: auto-wound faces, boxes, prisms, frustums, orbs, struts, discs — and the town's paints.
export const TAU = Math.PI * 2;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const mid = (p) => { const c = [0, 0, 0]; for (const v of p) { c[0] += v[0]; c[1] += v[1]; c[2] += v[2]; } return [c[0] / p.length, c[1] / p.length, c[2] / p.length]; };
// a tri or quad wound CCW as seen from the side n points to
export function face(ctx, p, n) {
  const c = crs(sub(p[1], p[0]), sub(p[2], p[0]));
  const q = dot(c, n) < 0 ? p.slice().reverse() : p;
  if (q.length === 3) ctx.tri(...q[0], ...q[1], ...q[2]); else ctx.quad(...q[0], ...q[1], ...q[2], ...q[3]);
}
export function faceOut(ctx, p, c) { face(ctx, p, sub(mid(p), c)); }
// skip letters: t b n(-z) s(+z) e(+x) w(-x)
export function box(ctx, x0, y0, z0, x1, y1, z1, skip = "") {
  if (x0 > x1) [x0, x1] = [x1, x0]; if (y0 > y1) [y0, y1] = [y1, y0]; if (z0 > z1) [z0, z1] = [z1, z0];
  if (!skip.includes("t")) face(ctx, [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], [0, 1, 0]);
  if (!skip.includes("b")) face(ctx, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [0, -1, 0]);
  if (!skip.includes("n")) face(ctx, [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], [0, 0, -1]);
  if (!skip.includes("s")) face(ctx, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1]);
  if (!skip.includes("e")) face(ctx, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0]);
  if (!skip.includes("w")) face(ctx, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], [-1, 0, 0]);
}
export function ringPts(cx, cz, r, n, ph = 0) { const o = []; for (let i = 0; i < n; i++) { const a = ph + i * TAU / n; o.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } return o; }
// a convex xz polygon extruded from y0 to y1
export function prism(ctx, pts, y0, y1, skip = "") {
  const n = pts.length; let cx = 0, cz = 0; for (const p of pts) { cx += p[0]; cz += p[1]; } cx /= n; cz /= n;
  const c = [cx, (y0 + y1) / 2, cz];
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; faceOut(ctx, [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], c); }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    if (!skip.includes("t")) face(ctx, [[cx, y1, cz], [a[0], y1, a[1]], [b[0], y1, b[1]]], [0, 1, 0]);
    if (!skip.includes("b")) face(ctx, [[cx, y0, cz], [a[0], y0, a[1]], [b[0], y0, b[1]]], [0, -1, 0]);
  }
}
export function frustum(ctx, cx, cz, y0, y1, r0, r1, n = 8, caps = "tb", ph = 0) {
  const c = [cx, (y0 + y1) / 2, cz];
  for (let i = 0; i < n; i++) {
    const a0 = ph + i * TAU / n, a1 = ph + (i + 1) * TAU / n;
    const p = [[cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0], [cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0]];
    if (r1 <= 0) faceOut(ctx, [p[0], p[1], [cx, y1, cz]], c);
    else faceOut(ctx, [p[0], p[1], [cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1], [cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1]], c);
    if (caps.includes("t") && r1 > 0) face(ctx, [[cx, y1, cz], [cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1], [cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1]], [0, 1, 0]);
    if (caps.includes("b") && r0 > 0) face(ctx, [[cx, y0, cz], p[0], p[1]], [0, -1, 0]);
  }
}
// a lumpy low-poly ball; colors (optional) run bottom→top
export function orb(ctx, cx, cy, cz, rx, ry, rz, seg = 6, lat = 3, jit = 0, colors = null) {
  const rows = [];
  for (let i = 0; i <= lat; i++) {
    const phi = i / lat * Math.PI, row = [];
    for (let j = 0; j < seg; j++) {
      const th = j / seg * TAU + (i % 2) * Math.PI / seg, k = (i === 0 || i === lat) ? 1 : 1 - jit + ctx.random() * jit * 2;
      row.push([cx + Math.sin(phi) * Math.cos(th) * rx * k, cy + Math.cos(phi) * ry * k, cz + Math.sin(phi) * Math.sin(th) * rz * k]);
    }
    rows.push(row);
  }
  const c = [cx, cy, cz];
  for (let i = 0; i < lat; i++) {
    if (colors) ctx.color(colors[Math.min(colors.length - 1, Math.floor((1 - (i + 0.5) / lat) * colors.length))]);
    for (let j = 0; j < seg; j++) {
      const a = rows[i][j], b = rows[i][(j + 1) % seg], d = rows[i + 1][j], e = rows[i + 1][(j + 1) % seg];
      if (i === 0) faceOut(ctx, [a, e, d], c);
      else if (i === lat - 1) faceOut(ctx, [a, b, d], c);
      else faceOut(ctx, [a, b, e, d], c);
    }
  }
}
// a beam between two points, square (or n-sided) section, tapering r0→r1
export function strut(ctx, a, b, r0, r1 = r0, sides = 4) {
  const d = nrm(sub(b, a)), up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = nrm(crs(d, up)), v = crs(u, d), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const ring = (p, r) => { const o = []; for (let i = 0; i < sides; i++) { const t = (i + 0.5) / sides * TAU, cs = Math.cos(t) * r, sn = Math.sin(t) * r; o.push([p[0] + u[0] * cs + v[0] * sn, p[1] + u[1] * cs + v[1] * sn, p[2] + u[2] * cs + v[2] * sn]); } return o; };
  const A = ring(a, r0), B = ring(b, r1);
  for (let i = 0; i < sides; i++) { const j = (i + 1) % sides; faceOut(ctx, [A[i], A[j], B[j], B[i]], m); }
  for (let i = 1; i < sides - 1; i++) { face(ctx, [A[0], A[i], A[i + 1]], [-d[0], -d[1], -d[2]]); face(ctx, [B[0], B[i], B[i + 1]], d); }
}
// a flat polygon in the plane (u, v) facing n
export function ngon(ctx, c, u, v, r, n, nn, ph = 0) {
  for (let i = 0; i < n; i++) {
    const a0 = ph + i * TAU / n, a1 = ph + (i + 1) * TAU / n;
    const p = (a) => [c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r];
    face(ctx, [c, p(a0), p(a1)], nn);
  }
}
export function annulus(ctx, c, u, v, r0, r1, n, nn, ph = 0) {
  const p = (a, r) => [c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r];
  for (let i = 0; i < n; i++) { const a0 = ph + i * TAU / n, a1 = ph + (i + 1) * TAU / n; face(ctx, [p(a0, r0), p(a1, r0), p(a1, r1), p(a0, r1)], nn); }
}
export const TEX = {
  plaster: "cdn/texture-cream-lime-plaster.png",
  timber: "cdn/texture-honey-oak-timber.png",
  thatch: "cdn/texture-mossy-straw-thatch.png",
  tile: "cdn/texture-red-clay-roof-tiles.png",
  stone: "cdn/texture-mossy-fieldstone.png",
  plank: "cdn/texture-honey-oak-floorboards.png",
  bark: "cdn/texture-ancient-tree-bark.png",
};
export const PAINTS = {
  plaster: { t: "plaster", c: "oklch(0.97 0.02 85)", r: 0.92 },
  timber: { t: "timber", c: "oklch(0.96 0.03 70)" },
  darkwood: { t: "timber", c: "oklch(0.86 0.04 55)" },
  thatch: { t: "thatch", c: "oklch(0.95 0.03 110)", r: 1 },
  moss: { c: "oklch(0.58 0.11 130)", r: 1 },
  tile: { t: "tile", c: "oklch(0.95 0.03 40)", r: 0.8 },
  stone: { t: "stone", c: "oklch(0.96 0.01 90)", r: 0.95 },
  plank: { t: "plank", c: "oklch(0.97 0.02 75)" },
  bark: { t: "bark", c: "oklch(0.93 0.03 65)", r: 0.95 },
  glass: { c: "oklch(0.86 0.12 72)", e: [1.7, 0.9, 0.32], r: 0.3 },
  iron: { c: "oklch(0.36 0.01 60)", m: 0.6, r: 0.5 },
  bronze: { c: "oklch(0.72 0.12 75)", m: 0.8, r: 0.35 },
  soil: { c: "oklch(0.4 0.05 50)", r: 1 },
  soot: { c: "oklch(0.2 0.01 50)", r: 1 },
  leaf: { c: "oklch(0.62 0.13 135)" },
  water: { c: "oklch(0.64 0.08 195)", r: 0.08, a: 0.82 },
  bread: { c: "oklch(0.7 0.12 65)" },
  linen: { c: "oklch(0.93 0.02 85)" },
  rug: { c: "oklch(0.6 0.13 30)" },
  blanket: { c: "oklch(0.62 0.1 250)" },
  ember: { c: "oklch(0.72 0.18 45)", e: [2.4, 0.95, 0.25] },
  lanternglow: { c: "oklch(0.88 0.12 75)", e: [1.9, 1.1, 0.4] },
  lanternrose: { c: "oklch(0.8 0.12 20)", e: [1.8, 0.6, 0.5] },
  lanterngold: { c: "oklch(0.9 0.13 90)", e: [1.9, 1.4, 0.45] },
  paperrose: { c: "oklch(0.82 0.08 15)" },
  papergold: { c: "oklch(0.9 0.09 90)" },
  magic: { c: "oklch(0.92 0.12 88)", e: [2.2, 1.6, 0.55] },
};
export function paint(ctx, k) {
  const P = PAINTS[k] || PAINTS.plaster;
  ctx.albedo(P.t ? TEX[P.t] : null);
  if (P.a !== undefined) ctx.color(P.c, P.a); else ctx.color(P.c);
  ctx.roughness(P.r ?? 0.85); ctx.metalness(P.m ?? 0);
  if (P.e) ctx.emissive(...P.e); else ctx.emissive(null);
}
export function tint(ctx, c, e) { ctx.albedo(null); ctx.color(c); ctx.roughness(0.8); ctx.metalness(0); if (e) ctx.emissive(...e); else ctx.emissive(null); }
