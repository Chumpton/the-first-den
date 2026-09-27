// The mandala relic: a floating cluster of teal-to-violet crystal shards, pointed at both ends. Feet = the cluster's
// underside, y 0; it hovers over the pedestal dish. params: { size }
import { Q, T, TAU } from '../lib/yard-kit.js';
function shard(ctx, b, d, len, r, n, twist) {
  const up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const s = [d[1] * up[2] - d[2] * up[1], d[2] * up[0] - d[0] * up[2], d[0] * up[1] - d[1] * up[0]], sl = Math.hypot(...s); s[0] /= sl; s[1] /= sl; s[2] /= sl;
  const u = [d[1] * s[2] - d[2] * s[1], d[2] * s[0] - d[0] * s[2], d[0] * s[1] - d[1] * s[0]];
  const at = (k) => [b[0] + d[0] * len * k, b[1] + d[1] * len * k, b[2] + d[2] * len * k];
  const ring = (k, rr) => { const c = at(k), a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU + twist; a.push([c[0] + (s[0] * Math.cos(t) + u[0] * Math.sin(t)) * rr, c[1] + (s[1] * Math.cos(t) + u[1] * Math.sin(t)) * rr, c[2] + (s[2] * Math.cos(t) + u[2] * Math.sin(t)) * rr]); } return a; };
  const A = ring(0.12, r * 0.85), B = ring(0.74, r), tip = at(1), bot = at(-0.08), o = at(0.45);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, A[i], A[j], B[j], B[i], o); T(ctx, B[i], B[j], tip, o); T(ctx, A[j], A[i], bot, o); }
}
export function geometry(ctx) {
  const k = (ctx.params || {}).size ?? 1, lod = ctx.lod || 1, n = lod <= 2 ? 6 : 4; ctx.flat();
  ctx.color('oklch(0.82 0.12 195)'); ctx.roughness(0.15); ctx.metalness(0.1); ctx.emissive(0.3, 1.15, 1.25);
  shard(ctx, [0, 0.12 * k, 0], [0, 1, 0], 0.6 * k, 0.085 * k, n, 0);
  if (lod >= 4) { ctx.emissive(null); return; }
  const S = [[0, 0.13, 0.36, 0.06, 'oklch(0.72 0.15 250)', [0.35, 0.55, 1.3]], [1.2, 0.3, 0.3, 0.055, 'oklch(0.66 0.17 300)', [0.7, 0.3, 1.3]], [2.4, 0.2, 0.4, 0.065, 'oklch(0.8 0.12 185)', [0.25, 1.1, 1.05]],
    [3.5, 0.34, 0.26, 0.05, 'oklch(0.62 0.18 310)', [0.8, 0.25, 1.2]], [4.7, 0.24, 0.33, 0.058, 'oklch(0.76 0.13 220)', [0.3, 0.8, 1.3]], [5.6, 0.4, 0.22, 0.045, 'oklch(0.7 0.16 280)', [0.55, 0.35, 1.3]]];
  for (const [a, tilt, len, r, c, e] of S) {
    const d = [Math.cos(a) * Math.sin(tilt * 2.2), Math.cos(tilt * 2.2), Math.sin(a) * Math.sin(tilt * 2.2)];
    ctx.color(c); ctx.emissive(...e);
    shard(ctx, [Math.cos(a) * 0.05 * k, 0.16 * k, Math.sin(a) * 0.05 * k], d, len * k, r * k, n, a);
  }
  if (lod <= 2) { // loose chips drifting in orbit round the cluster
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3, rr = 0.34 * k, yy = (0.25 + (i % 3) * 0.12) * k; ctx.color(i % 2 ? 'oklch(0.7 0.16 295)' : 'oklch(0.82 0.12 192)'); ctx.emissive(...(i % 2 ? [0.6, 0.3, 1.2] : [0.3, 1.0, 1.1])); shard(ctx, [Math.cos(a) * rr, yy, Math.sin(a) * rr], [0.3, 0.9, 0.3], 0.1 * k, 0.025 * k, 4, i); }
  }
  ctx.emissive(null);
}
export function collider() { return null; }
