// Creek dressing: one row at the world origin draws every rock, reed, fern and tuft along the den creek.
// params.items: [[kind, x, y, z, size, yaw], ...] in world metres (the row's feet at 0,0,0). Heights are the ground's,
// sampled when the row was laid. kind: 0 bed stone (half-sunk, wet-dark), 1 bank boulder (mossy crown),
// 2 reed / cattail clump, 3 fern, 4 grass tuft, 5 wildflower (forget-me-not / marsh marigold), 6 pebble cluster.
import { solid, ngon } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const STONE = 'cdn/texture-pale-limestone-flagstone.png', MOSS = 'cdn/texture-soft-green-moss-carpet.png';
function rock(ctx, x, y, z, s, yaw, wet, moss, lod) {
  const n = lod <= 2 ? 7 : 5, R = () => 0.78 + ctx.random() * 0.4;
  const base = ngon(n, s, 0, 0, yaw).map(([a, b]) => { const k = R(); return [x + a * k, z + b * k * 0.8]; });
  const mid = base.map(([a, b]) => [x + (a - x) * 0.92, z + (b - z) * 0.92]);
  const ox = (ctx.random() - 0.5) * s * 0.35, oz = (ctx.random() - 0.5) * s * 0.35;
  const top = base.map(([a, b]) => { const k = 0.35 + ctx.random() * 0.3; return [x + ox + (a - x) * k, z + oz + (b - z) * k]; });
  const h = s * (0.55 + ctx.random() * 0.35);
  const l = wet ? 0.42 + ctx.random() * 0.1 : 0.52 + ctx.random() * 0.14;
  ctx.albedo(STONE); ctx.color(`oklch(${l.toFixed(3)} ${wet ? 0.02 : 0.012} ${Math.round(wet ? 200 + ctx.random() * 40 : 90 + ctx.random() * 60)})`); ctx.roughness(wet ? 0.35 : 0.9);
  const sink = wet ? s * 0.3 : h * 0.4, ty = top.map(() => h * (0.82 + ctx.random() * 0.25));
  solid(ctx, base.map(([a, b]) => [a, y - sink, b]), mid.map(([a, b], i) => [a, y - sink + h * (0.45 + (i % 2) * 0.12), b]), false);
  solid(ctx, mid.map(([a, b], i) => [a, y - sink + h * (0.45 + (i % 2) * 0.12), b]), top.map(([a, b], i) => [a, y - sink + ty[i], b]));
  if (moss && lod <= 3) {
    ctx.albedo(MOSS); ctx.color(`oklch(${(0.6 + ctx.random() * 0.1).toFixed(3)} 0.12 ${Math.round(125 + ctx.random() * 15)})`); ctx.roughness(1);
    const cx = x + ox, cz = z + oz, half = top.slice(0, Math.ceil(n / 2) + 1), cap = half.map(([a, b]) => [cx + (a - cx) * 1.05, cz + (b - cz) * 1.05]);
    const my = y - sink + h * 0.8; solid(ctx, cap.map(([a, b]) => [a, my, b]), cap.map(([a, b]) => [cx + (a - cx) * 0.7, my + h * 0.3, cz + (b - cz) * 0.7]));
  }
}
// a blade: a thin tapered double-sided card from the ground up, leaning
function blade(ctx, x, y, z, h, w, yaw, lean) {
  const c = Math.cos(yaw), s = Math.sin(yaw), lx = Math.sin(yaw + 1.57) * lean, lz = Math.cos(yaw + 1.57) * lean;
  const a = [x - c * w, y, z + s * w], b = [x + c * w, y, z - s * w], m = [x + lx * 0.5, y + h * 0.6, z + lz * 0.5], t = [x + lx, y + h, z + lz];
  const mw = w * 0.6, ma = [m[0] - c * mw, m[1], m[2] + s * mw], mb = [m[0] + c * mw, m[1], m[2] - s * mw];
  ctx.quad(...a, ...b, ...mb, ...ma); ctx.quad(...a, ...ma, ...mb, ...b);
  ctx.tri(...ma, ...mb, ...t); ctx.tri(...ma, ...t, ...mb);
}
function reeds(ctx, x, y, z, s, yaw, lod) {
  const n = lod <= 2 ? 9 : 4;
  ctx.albedo(null); ctx.roughness(0.8);
  for (let i = 0; i < n; i++) {
    const a = yaw + i * 2.4, r = ctx.random() * 0.25 * s, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, h = (0.9 + ctx.random() * 0.8) * s;
    ctx.color(`oklch(${(0.55 + ctx.random() * 0.15).toFixed(3)} 0.11 ${Math.round(118 + ctx.random() * 20)})`);
    blade(ctx, px, y - 0.05, pz, h, 0.025, a, (ctx.random() - 0.5) * 0.35);
    if (i % 3 === 0 && lod <= 3) { // cattail head
      ctx.color('oklch(0.36 0.05 50)'); const hy = y + h * 0.85;
      solid(ctx, ngon(5, 0.035, px, pz).map(([u, v]) => [u, hy, v]), ngon(5, 0.035, px, pz).map(([u, v]) => [u, hy + 0.18, v]));
    }
  }
}
function fern(ctx, x, y, z, s, yaw, lod) {
  const n = lod <= 2 ? 8 : 5; ctx.albedo(null); ctx.roughness(0.85);
  for (let i = 0; i < n; i++) {
    const a = yaw + i / n * Math.PI * 2 + ctx.random() * 0.3, L = (0.5 + ctx.random() * 0.3) * s;
    ctx.color(`oklch(${(0.5 + ctx.random() * 0.12).toFixed(3)} 0.13 ${Math.round(132 + ctx.random() * 14)})`);
    const dx = Math.cos(a), dz = Math.sin(a), px = -dz * 0.09 * s, pz = dx * 0.09 * s;
    const b = [x, y + 0.05, z], m = [x + dx * L * 0.55, y + L * 0.55, z + dz * L * 0.55], t = [x + dx * L, y + L * 0.3, z + dz * L];
    const m1 = [m[0] + px, m[1], m[2] + pz], m2 = [m[0] - px, m[1], m[2] - pz];
    ctx.quad(...b, ...m1, ...t, ...m2); ctx.quad(...b, ...m2, ...t, ...m1);
  }
}
function tuft(ctx, x, y, z, s, yaw) {
  ctx.albedo(null); ctx.roughness(0.9);
  for (let i = 0; i < 5; i++) { const a = yaw + i * 1.26; ctx.color(`oklch(${(0.6 + ctx.random() * 0.12).toFixed(3)} 0.12 ${Math.round(115 + ctx.random() * 20)})`); blade(ctx, x + Math.cos(a) * 0.05, y - 0.02, z + Math.sin(a) * 0.05, (0.25 + ctx.random() * 0.25) * s, 0.02, a, Math.cos(a) * 0.12); }
}
function flower(ctx, x, y, z, s, yaw) {
  tuft(ctx, x, y, z, s * 0.8, yaw);
  const blue = ctx.random() < 0.55;
  for (let i = 0; i < 4; i++) {
    const a = yaw + i * 1.6, px = x + Math.cos(a) * 0.08, pz = z + Math.sin(a) * 0.08, py = y + (0.22 + ctx.random() * 0.12) * s;
    ctx.albedo(null); ctx.color(blue ? 'oklch(0.72 0.13 255)' : 'oklch(0.86 0.17 92)'); ctx.emissive?.(null);
    const p = ngon(5, 0.045 * s, px, pz, a); solid(ctx, p.map(([u, v]) => [u, py, v]), p.map(([u, v]) => [u, py + 0.02, v]));
  }
}
function pebbles(ctx, x, y, z, s, yaw) {
  for (let i = 0; i < 5; i++) { const a = yaw + i * 1.3, r = ctx.random() * 0.3 * s; rock(ctx, x + Math.cos(a) * r, y, z + Math.sin(a) * r, 0.05 + ctx.random() * 0.06, a, true, false, 3); }
}
export const geometry = softened(function geometry(ctx) {
  const lod = ctx.lod ?? 1; ctx.flat();
  for (const [k, x, y, z, s, yaw] of (ctx.params?.items || [])) {
    if (k === 0) rock(ctx, x, y, z, s, yaw, true, false, lod);
    else if (k === 1) rock(ctx, x, y, z, s, yaw, false, true, lod);
    else if (lod >= 5) continue;
    else if (k === 2) reeds(ctx, x, y, z, s, yaw, lod);
    else if (k === 3) fern(ctx, x, y, z, s, yaw, lod);
    else if (lod >= 4) continue;
    else if (k === 4) tuft(ctx, x, y, z, s, yaw);
    else if (k === 5) flower(ctx, x, y, z, s, yaw);
    else if (k === 6) pebbles(ctx, x, y, z, s, yaw);
  }
  ctx.albedo(null);
});
export function collider() {}
