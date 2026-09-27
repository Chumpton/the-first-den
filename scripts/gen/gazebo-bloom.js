// The garden gazebo in bloom: a merged child row of garden-gazebo (feet at its feet, same frame).
// Wisteria trunks twist up the two back posts and run the eaves, lilac racemes hang off every eave edge
// (kept short over the entrance), climbing roses spiral the other four posts and swag three eaves,
// and two teal-glazed urns of fern flank the entrance step. No collider: the urns' footprint is on the step.
import { GZ } from './garden-gazebo.js';
import { lathe } from '../lib/garden-kit.js';
import { gem } from '../lib/yard-kit.js';
import { tube, raceme, rose, leafCard, fernClump, flat, rng } from '../lib/bloom-kit.js';
const { R, POST, EAVE, ENT } = GZ;
const ang = (k) => k * Math.PI / 3;
const V = (r, k, y = 0) => [Math.cos(ang(k)) * r, y, Math.sin(ang(k)) * r];
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const WIST = [1, 2], ROSES = [0, 3, 4, 5], SWAG = [0, 3, 5];
export const URNS = [[1.1, -2.3], [-1.1, -2.3]];
function helix(k, turns, r, y0, y1, n, ph) {
  const [px, , pz] = V(R - 0.08, k), out = [];
  for (let i = 0; i <= n; i++) { const t = i / n, a = ph + t * turns * Math.PI * 2; out.push([px + Math.cos(a) * r, y0 + (y1 - y0) * t, pz + Math.sin(a) * r]); }
  return out;
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, Rn = rng(ctx.seed || 5); ctx.flat();
  if (lod >= 5) return;
  // wisteria: gnarled trunks up the back posts, then a rope along the eaves
  if (lod <= 3) {
    flat(ctx, 'oklch(0.42 0.05 55)', 0.95);
    for (const k of WIST) tube(ctx, helix(k, 1.3, 0.13, 0.05, POST - 0.05, lod <= 1 ? 12 : 6, k * 1.7), (t) => 0.05 - t * 0.02, lod <= 2 ? 4 : 3);
    for (let k = 0; k < 6; k++) {
      const a = V(R + 0.02, k, EAVE - 0.1), b = V(R + 0.02, k + 1, EAVE - 0.1), n = lod <= 1 ? 6 : 3, pts = [];
      for (let i = 0; i <= n; i++) { const p = lerp(a, b, i / n); p[1] += Math.sin(i * 1.9 + k) * 0.03; pts.push(p); }
      tube(ctx, pts, 0.022, 3);
    }
  }
  // racemes and leaf clumps along each eave edge
  for (let k = 0; k < 6; k++) {
    const n = lod <= 1 ? 9 : lod <= 2 ? 6 : lod <= 3 ? 4 : 3, door = k === ENT;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5 + (Rn() - 0.5) * 0.4) / n, p = lerp(V(2.5, k, EAVE - 0.14), V(2.5, k + 1, EAVE - 0.14), t);
      const len = door ? 0.18 + Rn() * 0.1 : 0.32 + Rn() * 0.32;
      if (lod <= 3) raceme(ctx, p, len, 0.07 + Rn() * 0.02, Rn() - 0.5, lod);
      if (lod <= 2 || i % 2 === 0) { flat(ctx, `oklch(${0.56 + Rn() * 0.08} 0.12 ${128 + Rn() * 14})`, 0.95); gem(ctx, p[0], p[1] + 0.08, p[2], 0.16 + Rn() * 0.06, 0.08, 0.06, lod <= 2 ? 6 : 4); }
    }
  }
  if (lod >= 4) return;
  // climbing roses: stem spiral, leaves, blooms
  let bi = 0;
  for (const k of ROSES) {
    const pts = helix(k, 2.2, 0.105, 0.12, POST - 0.02, lod <= 1 ? 14 : 7, k * 2.3);
    flat(ctx, 'oklch(0.45 0.08 135)', 0.9); tube(ctx, pts, 0.016, 3);
    flat(ctx, 'oklch(0.52 0.13 140)', 0.9);
    const [px, , pz] = V(R - 0.08, k);
    for (let i = 1; i < pts.length; i += lod <= 1 ? 1 : 2) { const p = pts[i], out = [p[0] - px, 0, p[2] - pz], l = Math.hypot(out[0], out[2]) || 1, d = [out[0] / l, 0.35, out[2] / l]; leafCard(ctx, p, d, [-d[2], 0, d[0]], 0.1, 0.03); }
    for (let i = 2; i < pts.length; i += lod <= 1 ? 2 : 3) rose(ctx, pts[i], 0.045 + Rn() * 0.015, bi++, lod);
  }
  // rose swags from the eaves
  for (const k of SWAG) {
    const a = V(R + 0.06, k, EAVE - 0.14), b = V(R + 0.06, k + 1, EAVE - 0.14), n = lod <= 1 ? 8 : 4, pts = [];
    for (let i = 0; i <= n; i++) { const t = i / n, p = lerp(a, b, t); p[1] -= Math.sin(t * Math.PI) * 0.24; pts.push(p); }
    flat(ctx, 'oklch(0.45 0.08 135)', 0.9); tube(ctx, pts, 0.014, 3);
    for (let i = 1; i < n; i++) {
      flat(ctx, 'oklch(0.54 0.13 140)', 0.9); const p = pts[i];
      leafCard(ctx, p, [0, -0.8, 0.6], [1, 0, 0], 0.1, 0.035); leafCard(ctx, p, [0.6, -0.7, 0], [0, 0, 1], 0.09, 0.03);
      if (i % (lod <= 1 ? 1 : 2) === 0) rose(ctx, [p[0], p[1] - 0.04, p[2]], 0.05, bi++, lod);
    }
  }
  // two fern urns by the entrance step (local −Z), on the step top y 0.05
  for (const [ux, uz] of URNS) {
    const n = lod <= 2 ? 9 : 6, c = [ux, 0.05, uz];
    flat(ctx, 'oklch(0.66 0.08 195)', 0.35);
    lathe(ctx, [[0.15, 0], [0.19, 0.04], [0.13, 0.1], [0.2, 0.2], [0.26, 0.38], [0.25, 0.5], [0.21, 0.55]], n, c);
    flat(ctx, 'oklch(0.93 0.03 85)', 0.5);
    lathe(ctx, [[0.21, 0.55], [0.27, 0.58], [0.27, 0.62], [0.23, 0.62], [0.22, 0.57]], n, c);
    flat(ctx, 'oklch(0.34 0.04 55)', 1); lathe(ctx, [[0, 0.585], [0.225, 0.585]], n, c);
    fernClump(ctx, [ux, 0.6, uz], 0.62, lod, rng(Math.round(ux * 10 + 50)));
  }
  ctx.albedo(null);
}
export function collider() { return null; }
