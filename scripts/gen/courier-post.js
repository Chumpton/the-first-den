// The courier's stand beside the west road: a packed-dirt patch, a hitching rail, a plank water trough and two hay bales.
// Local: origin at the patch centre, the road toward -z. Collider: rail, trough, bales (the patch is the ground).
import { box, rod } from './traveller-kit.js';
const DIRT = 'oklch(0.56 0.05 70)', DIRT2 = 'oklch(0.47 0.05 60)', OAK = 'oklch(0.5 0.07 60)', OAKD = 'oklch(0.37 0.05 55)', IRON = 'oklch(0.3 0.01 250)';
const STRAW = 'oklch(0.8 0.11 88)', STRAW2 = 'oklch(0.7 0.1 80)', WATER = 'oklch(0.52 0.07 205)', TWINE = 'oklch(0.45 0.05 60)';
const RAIL = { x0: -2.55, x1: -1.35, z: -1.45, h: 1.0 }, TR = { x: -2.05, z0: -0.25, z1: 1.35, w: 0.3, h: 0.6 }, BALE = { x: 2.15, z: 1.0 };
function patch(ctx, lod) {
  const n = lod <= 2 ? 24 : 12, R = (t) => 1 + 0.07 * Math.sin(3 * t + 1) + 0.05 * Math.sin(5 * t), rx = 2.65, rz = 2.15;
  const p = (i, k) => { const t = (i / n) * Math.PI * 2, r = R(t) * k; return [Math.cos(t) * rx * r, Math.sin(t) * rz * r]; };
  for (let i = 0; i < n; i++) {
    const [ax, az] = p(i, 0.82), [bx, bz] = p(i + 1, 0.82), [cx, cz] = p(i, 1), [dx, dz] = p(i + 1, 1);
    ctx.color(DIRT); ctx.tri(0, 0.035, 0, bx, 0.03, bz, ax, 0.03, az);
    ctx.color(DIRT2); ctx.quad(ax, 0.03, az, bx, 0.03, bz, dx, -0.02, dz, cx, -0.02, cz);
  }
  if (lod <= 2) { ctx.color(DIRT2); for (const [x, z, s] of [[-0.5, -1.2, 0.12], [0.3, -0.9, 0.1], [-0.9, 0.4, 0.11], [0.9, 0.6, 0.12], [0.1, 1.3, 0.1], [-1.3, -0.5, 0.09]]) ctx.quad(x - s, 0.04, z - s * 0.7, x - s * 0.7, 0.04, z + s, x + s, 0.04, z + s * 0.6, x + s * 0.8, 0.04, z - s); }
}
function rail(ctx, lod, solid) {
  if (!solid) ctx.color(OAKD);
  for (const x of [RAIL.x0, RAIL.x1]) { box(ctx, x - 0.07, 0, RAIL.z - 0.07, x + 0.07, RAIL.h + 0.12, RAIL.z + 0.07); if (!solid) { ctx.color(OAK); box(ctx, x - 0.09, RAIL.h + 0.12, RAIL.z - 0.09, x + 0.09, RAIL.h + 0.16, RAIL.z + 0.09); ctx.color(OAKD); } }
  if (!solid) ctx.color(OAK);
  box(ctx, RAIL.x0 - 0.12, RAIL.h - 0.05, RAIL.z - 0.05, RAIL.x1 + 0.12, RAIL.h + 0.05, RAIL.z + 0.05);
  if (!solid && lod <= 3) { ctx.color(IRON); const cx = (RAIL.x0 + RAIL.x1) / 2, r = 0.07, m = 8; for (let i = 0; i < m; i++) { const a = (i / m) * 6.283, b = ((i + 1) / m) * 6.283; rod(ctx, [cx + Math.cos(a) * r, RAIL.h - 0.12 + Math.sin(a) * r, RAIL.z - 0.06], [cx + Math.cos(b) * r, RAIL.h - 0.12 + Math.sin(b) * r, RAIL.z - 0.06], 0.012, 4, false); } }
}
function trough(ctx, lod, solid) {
  const { x, z0, z1, w, h } = TR, t = 0.05;
  if (solid) { box(ctx, x - w, 0, z0, x + w, h, z1); return; }
  ctx.color(OAKD); for (const zz of [z0 + 0.15, z1 - 0.15]) box(ctx, x - w - 0.03, 0, zz - 0.06, x + w + 0.03, 0.14, zz + 0.06);
  ctx.color(OAK);
  box(ctx, x - w, 0.12, z0, x + w, 0.18, z1);
  box(ctx, x - w, 0.12, z0, x - w + t, h, z1); box(ctx, x + w - t, 0.12, z0, x + w, h, z1);
  box(ctx, x - w, 0.12, z0, x + w, h, z0 + t); box(ctx, x - w, 0.12, z1 - t, x + w, h, z1);
  if (lod <= 2) { ctx.color(IRON); for (const zz of [z0 + 0.3, z1 - 0.3]) box(ctx, x - w - 0.01, h - 0.12, zz - 0.025, x + w + 0.01, h - 0.08, zz + 0.025); }
  ctx.color(WATER); ctx.quad(x - w + t, h - 0.1, z0 + t, x - w + t, h - 0.1, z1 - t, x + w - t, h - 0.1, z1 - t, x + w - t, h - 0.1, z0 + t);
}
function bales(ctx, lod, solid) {
  const b = (x0, y0, z0, x1, y1, z1) => { if (!solid) ctx.color(STRAW); box(ctx, x0, y0, z0, x1, y1, z1); if (!solid && lod <= 3) { ctx.color(TWINE); for (const f of [0.28, 0.72]) { const xx = x0 + (x1 - x0) * f; box(ctx, xx - 0.015, y0 - 0.005, z0 - 0.01, xx + 0.015, y1 + 0.01, z1 + 0.01); } } };
  const { x, z } = BALE;
  b(x - 0.48, 0, z - 0.26, x + 0.48, 0.46, z + 0.26);
  b(x - 0.44, 0, z + 0.3, x + 0.52, 0.46, z + 0.82);
  b(x - 0.4, 0.46, z + 0.02, x + 0.5, 0.92, z + 0.54);
  if (!solid && lod <= 2) { ctx.color(STRAW2); for (let i = 0; i < 14; i++) { const a = i * 2.39, r = 0.7 + (i % 4) * 0.12, px = x + Math.cos(a) * r, pz = z + 0.3 + Math.sin(a) * r * 0.8, d = 0.09; ctx.tri(px, 0.045, pz, px + d, 0.045, pz + d * 0.3, px + d * 0.2, 0.05, pz - d); ctx.tri(px, 0.045, pz, px + d * 0.2, 0.05, pz - d, px + d, 0.045, pz + d * 0.3); } }
}
export function geometry(ctx) {
  const lod = ctx.lod ?? 1; ctx.flat(); ctx.roughness(0.95);
  patch(ctx, lod); rail(ctx, lod, false); trough(ctx, lod, false); bales(ctx, lod, false);
}
export function collider(ctx) { rail(ctx, 5, true); trough(ctx, 5, true); bales(ctx, 5, true); }
