// The worn fringe of a garden path: clover patches and little limestone pebble clusters on the verge, 0.3–1.6 m off the
// path's edge. The positions are chosen at spawn (where the ground is grass, never paving) and ride in params.items as
// [x, y, z, kind, size, yaw] local to the row's feet: kind 0 = clover patch, 1 = pebble cluster. One merged mesh per path.
import { gem } from '../lib/road-solid.js';
const LEAF = ['oklch(0.58 0.12 140)', 'oklch(0.52 0.11 145)', 'oklch(0.64 0.12 135)'];
const STONE = ['oklch(0.88 0.02 85)', 'oklch(0.78 0.02 75)', 'oklch(0.68 0.02 65)', 'oklch(0.92 0.015 90)'];
function clover(ctx, x, y, z, s, lod, rnd) {
  const n = lod <= 1 ? 9 : lod <= 2 ? 6 : 3;
  for (let i = 0; i < n; i++) {
    const r = Math.sqrt(rnd()) * 0.2 * s, a = rnd() * 6.283, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r, h = y + 0.03 + rnd() * 0.04, L = (0.035 + rnd() * 0.02) * s, rot = rnd() * 6.283;
    ctx.albedo(null); ctx.roughness(0.9); ctx.metalness(0); ctx.color(LEAF[i % 3]);
    for (let k = 0; k < 3; k++) { // one trefoil: three leaflets, each a kite tipped a little up
      const b = rot + k * 2.094, dx = Math.cos(b), dz = Math.sin(b), px = -dz * L * 0.45, pz = dx * L * 0.45;
      ctx.quad(cx, h, cz, cx + dx * L * 0.6 - px, h + 0.008, cz + dz * L * 0.6 - pz, cx + dx * L, h + 0.014, cz + dz * L, cx + dx * L * 0.6 + px, h + 0.008, cz + dz * L * 0.6 + pz);
    }
  }
  if (lod <= 2 && rnd() < 0.55) { // a white clover head or two
    ctx.color('oklch(0.95 0.03 350)'); const m = 1 + Math.floor(rnd() * 2);
    for (let i = 0; i < m; i++) { const a = rnd() * 6.283, r = rnd() * 0.12 * s; gem(ctx, x + Math.cos(a) * r, y + 0.09, z + Math.sin(a) * r, 0.018, 0.016, 0.012, 5); }
  }
}
function pebbles(ctx, x, y, z, s, lod, rnd) {
  const n = lod <= 1 ? 5 : lod <= 2 ? 3 : 2;
  ctx.albedo('scripts/tex-garden-limestone.js'); ctx.roughness(0.95); ctx.metalness(0);
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, r = rnd() * 0.18 * s, w = (0.03 + rnd() * 0.06) * s;
    ctx.color(STONE[Math.floor(rnd() * 4)]);
    gem(ctx, x + Math.cos(a) * r, y + w * 0.1, z + Math.sin(a) * r, w, w * (0.35 + rnd() * 0.3), w * 0.25, lod <= 2 ? 6 : 4);
  }
}
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod ?? 1, items = ctx.params.items ?? [], rnd = () => ctx.random();
  if (lod >= 4) return;
  items.forEach(([x, y, z, k, s], i) => { if (lod === 3 && i % 2) return; (k ? pebbles : clover)(ctx, x, y, z, s, lod, rnd); });
}
export function collider() { return null; }
