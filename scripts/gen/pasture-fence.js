// Rescue-pasture fence. params.kind "loop": the whole split-rail loop round a w×d yard (origin mid-yard at ground, gate gap
// on the +Z side at gateX, with tall gateposts and a crossbeam). params.kind "gate": the swinging leaf, hinge at the origin,
// leaf running +X for params.w metres. Weathered silver timber.
import { Q, solid, box } from '../lib/road-solid.js';
const WOOD = 'cdn/texture-weathered-silver-grey-fence-timber.png';
const IRON = 'oklch(0.3 0.01 60)';
function tint(ctx, base = 0.93) { const l = base + ctx.random() * 0.06; ctx.color(`oklch(${l.toFixed(3)} 0.012 ${Math.round(60 + ctx.random() * 40)})`); }
function ringAt(cx, cz, r, y, n, rot) { const a = []; for (let i = 0; i < n; i++) { const t = rot + (i / n) * Math.PI * 2; a.push([cx + Math.cos(t) * r, y, cz + Math.sin(t) * r]); } return a; }
function post(ctx, cx, cz, r, h, n, rot) {
  tint(ctx, 0.88);
  solid(ctx, ringAt(cx, cz, r, -0.3, n, rot), ringAt(cx, cz, r * 0.96, h - 0.07, n, rot), false);
  solid(ctx, ringAt(cx, cz, r * 0.96, h - 0.07, n, rot), ringAt(cx, cz, r * 0.5, h, n, rot));
}
// a split rail: an irregular n-sided log from a to b
function rail(ctx, a, b, r, n, jit = true) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1, f = [d[0] / L, d[1] / L, d[2] / L];
  let u = [-f[2], 0, f[0]]; const ul = Math.hypot(u[0], u[2]) || 1; u = [u[0] / ul, 0, u[2] / ul];
  const v = [u[1] * f[2] - u[2] * f[1], u[2] * f[0] - u[0] * f[2], u[0] * f[1] - u[1] * f[0]];
  const ks = []; for (let i = 0; i < n; i++) ks.push(jit ? 0.75 + ctx.random() * 0.45 : 1);
  const loop = (c, s) => ks.map((k, i) => { const t = (i / n) * Math.PI * 2 + 0.4; const cu = Math.cos(t) * r * k * s, cv = Math.sin(t) * r * k * s * 0.85; return [c[0] + u[0] * cu + v[0] * cv, c[1] + u[1] * cu + v[1] * cv, c[2] + u[2] * cu + v[2] * cv]; });
  tint(ctx); solid(ctx, loop(a, 1), loop(b, jit ? 0.9 + ctx.random() * 0.15 : 1));
}
function sides(p) {
  const hw = p.w / 2, hd = p.d / 2, g0 = p.gateX - p.gateW / 2, g1 = p.gateX + p.gateW / 2;
  return [
    { a: [-hw, hd], b: [hw, hd], segs: [[-hw, g0], [g1, hw]], axis: 'x', c: hd },
    { a: [-hw, -hd], b: [hw, -hd], segs: [[-hw, hw]], axis: 'x', c: -hd },
    { a: [-hw, -hd], b: [-hw, hd], segs: [[-hd, hd]], axis: 'z', c: -hw },
    { a: [hw, -hd], b: [hw, hd], segs: [[-hd, hd]], axis: 'z', c: hw },
  ];
}
const P = (s, t) => (s.axis === 'x' ? [t, s.c] : [s.c, t]);
function loop(ctx) {
  const p = { w: 28, d: 20, h: 1.3, bay: 2.4, rails: [0.42, 0.82, 1.2], gateX: 8, gateW: 3.2, gatepostH: 3.1, beamY: 2.8, ...ctx.params };
  const lod = ctx.lod ?? 1, g0 = p.gateX - p.gateW / 2, g1 = p.gateX + p.gateW / 2, hd = p.d / 2;
  ctx.flat(); ctx.albedo(WOOD); ctx.roughness(0.95);
  if (lod >= 5) {
    for (const s of sides(p)) for (const [t0, t1] of s.segs) for (const y of [0.55, 1.15]) {
      const A = P(s, t0), B = P(s, t1); tint(ctx);
      box(ctx, Math.min(A[0], B[0]) - 0.05, y, Math.min(A[1], B[1]) - 0.05, Math.max(A[0], B[0]) + 0.05, y + 0.14, Math.max(A[1], B[1]) + 0.05);
    }
    for (const [x, z] of [[-p.w / 2, -hd], [p.w / 2, -hd], [-p.w / 2, hd], [p.w / 2, hd]]) { tint(ctx); box(ctx, x - 0.1, 0, z - 0.1, x + 0.1, p.h, z + 0.1); }
    for (const x of [g0, g1]) { tint(ctx); box(ctx, x - 0.13, 0, hd - 0.13, x + 0.13, p.gatepostH, hd + 0.13); }
    tint(ctx); box(ctx, g0 - 0.4, p.beamY, hd - 0.09, g1 + 0.4, p.beamY + 0.2, hd + 0.09);
    return;
  }
  const pn = lod <= 2 ? 6 : 4, rn = lod <= 2 ? 5 : 4, railYs = lod >= 4 ? [0.55, 1.15] : p.rails, seen = new Set();
  for (const s of sides(p)) for (const [t0, t1] of s.segs) {
    const len = t1 - t0, n = Math.max(1, Math.ceil(len / p.bay)), pts = [];
    for (let i = 0; i <= n; i++) pts.push(t0 + (len * i) / n);
    for (const t of pts) {
      const [x, z] = P(s, t), key = `${x.toFixed(2)},${z.toFixed(2)}`;
      if (seen.has(key)) continue; seen.add(key);
      const gp = s.axis === 'x' && s.c === hd && (Math.abs(t - g0) < 0.01 || Math.abs(t - g1) < 0.01);
      const corner = Math.abs(Math.abs(x) - p.w / 2) < 0.01 && Math.abs(Math.abs(z) - hd) < 0.01;
      if (gp) post(ctx, x, z, 0.14, p.gatepostH, lod <= 2 ? 8 : 4, 0.39);
      else post(ctx, x, z, corner ? 0.11 : 0.085 + ctx.random() * 0.015, p.h + (corner ? 0.08 : ctx.random() * 0.06), pn, ctx.random() * 3);
    }
    for (let i = 0; i < n; i++) for (const y of railYs) {
      const a = P(s, pts[i]), b = P(s, pts[i + 1]), dir = Math.sign(pts[i + 1] - pts[i]);
      const ext = 0.04, ya = y + (ctx.random() - 0.5) * 0.06, yb = y + (ctx.random() - 0.5) * 0.06;
      const A = s.axis === 'x' ? [a[0] - dir * ext, ya, a[1]] : [a[0], ya, a[1] - dir * ext];
      const B = s.axis === 'x' ? [b[0] + dir * ext, yb, b[1]] : [b[0], yb, b[1] + dir * ext];
      rail(ctx, A, B, 0.058, rn, lod <= 2);
    }
  }
  // gate arch: crossbeam over the gap, knee braces, post caps
  tint(ctx, 0.86); box(ctx, g0 - 0.4, p.beamY, hd - 0.09, g1 + 0.4, p.beamY + 0.2, hd + 0.09);
  if (lod <= 3) {
    rail(ctx, [g0 + 0.08, p.beamY - 0.55, hd], [g0 + 0.6, p.beamY + 0.02, hd], 0.05, 4, false);
    rail(ctx, [g1 - 0.08, p.beamY - 0.55, hd], [g1 - 0.6, p.beamY + 0.02, hd], 0.05, 4, false);
    for (const x of [g0 - 0.44, g1 + 0.44]) { tint(ctx, 0.8); box(ctx, x - 0.04, p.beamY - 0.02, hd - 0.11, x + 0.04, p.beamY + 0.22, hd + 0.11); }
  }
}
function gate(ctx) {
  const w = ctx.params.w ?? 2.9, lod = ctx.lod ?? 1;
  ctx.flat(); ctx.albedo(WOOD); ctx.roughness(0.95);
  tint(ctx, 0.9); box(ctx, 0.04, 0.1, -0.05, 0.16, 1.32, 0.05);
  tint(ctx, 0.9); box(ctx, w - 0.12, 0.1, -0.05, w, 1.32, 0.05);
  const boards = lod >= 4 ? [0.3, 1.15] : [0.25, 0.55, 0.85, 1.15];
  for (const y of boards) { tint(ctx); box(ctx, 0.16, y - 0.06, -0.025, w - 0.12, y + 0.06, 0.025); }
  if (lod <= 3) {
    tint(ctx, 0.85); rail(ctx, [0.18, 0.2, 0.045], [w - 0.14, 1.2, 0.045], 0.045, 4, false);
    ctx.albedo(null); ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.5);
    for (const y of [0.3, 1.1]) { box(ctx, 0, y - 0.03, 0.03, 0.55, y + 0.03, 0.05); box(ctx, 0, y - 0.03, -0.05, 0.55, y + 0.03, -0.03); }
    box(ctx, w - 0.06, 0.9, -0.07, w + 0.1, 0.96, 0.07);
    ctx.metalness(0);
  }
}
export function geometry(ctx) { if (ctx.params.kind === 'gate') gate(ctx); else loop(ctx); }
export function collider(ctx) {
  if (ctx.params.kind === 'gate') { const w = ctx.params.w ?? 2.9; box(ctx, 0.02, 0.1, -0.07, w, 1.35, 0.07); return; }
  const p = { w: 28, d: 20, gateX: 8, gateW: 3.2, gatepostH: 3.1, ...ctx.params }, hd = p.d / 2, g0 = p.gateX - p.gateW / 2, g1 = p.gateX + p.gateW / 2, t = 0.13, y0 = -0.5, y1 = 1.45;
  for (const s of sides(p)) for (const [a, b] of s.segs) {
    if (s.axis === 'x') box(ctx, a - t, y0, s.c - t, b + t, y1, s.c + t); else box(ctx, s.c - t, y0, a - t, s.c + t, y1, b + t);
  }
  for (const x of [g0, g1]) box(ctx, x - 0.16, y0, hd - 0.16, x + 0.16, p.gatepostH, hd + 0.16);
}
