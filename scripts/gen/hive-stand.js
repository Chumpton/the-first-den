// params.kind "stand": the hive stand (hives are child rows at x -1.1, 0, 1.1 on its rails at y 0.44), the stone-edged
// wildflower bed, a bee bath and the honey sign's posts and jar shelf. kind "sign": the board (ui plate on its -Z face).
// Origin = ground mid-bed, front (entrances) toward -Z.
import { box, gem, Q, T } from '../lib/road-solid.js';
import { bar, cyl, paint, TX, INK } from './coop-kit.js';
const HUES = [[0.7, 0.16, 330], [0.85, 0.15, 90], [0.95, 0.02, 90], [0.62, 0.17, 20], [0.62, 0.14, 290], [0.78, 0.15, 55]];
function sign(ctx) {
  ctx.flat(); paint(ctx, TX.oak, 'oklch(0.9 0.08 75)', 0.7); box(ctx, -0.38, 0, -0.02, 0.38, 0.4, 0.02);
  if (ctx.lod <= 2) { paint(ctx, TX.timber, INK.wood); box(ctx, -0.4, 0.4, -0.035, 0.4, 0.44, 0.035); }
}
export function geometry(ctx) {
  if (ctx.params.kind === 'sign') return sign(ctx);
  const L = ctx.lod; ctx.flat();
  paint(ctx, TX.timber, INK.wood);
  for (const z of [-0.2, 0.2]) bar(ctx, [-1.72, 0.39, z], [1.72, 0.39, z], 0.08, 0.1);
  for (const x of [-1.6, 1.6]) for (const z of [-0.2, 0.2]) box(ctx, x - 0.045, 0, z - 0.045, x + 0.045, 0.34, z + 0.045);
  // sign posts
  for (const x of [-2.26, -1.54]) box(ctx, x - 0.03, 0, -1.45, x + 0.03, 1.3, -1.39);
  if (L >= 4) return;
  paint(ctx, TX.timber, INK.wood);
  for (const x of [-1.6, 1.6]) bar(ctx, [x, 0.1, -0.2], [x, 0.1, 0.2], 0.05);
  box(ctx, -2.3, 0.7, -1.62, -1.5, 0.73, -1.45); // jar shelf
  if (L <= 2) for (const x of [-2.05, -1.75]) { paint(ctx, null, 'oklch(0.72 0.15 70)', 0.2); cyl(ctx, x, 0.73, -1.54, 0.04, 0.07, 8); paint(ctx, null, INK.linen, 0.9); cyl(ctx, x, 0.8, -1.54, 0.043, 0.02, 8); }
  // bed: soil and edging stones
  paint(ctx, null, INK.soil, 0.95);
  const N = 22, E = (a, rx, rz, y) => [Math.cos(a) * rx, y, Math.sin(a) * rz];
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, b = (i + 1) / N * Math.PI * 2; T(ctx, [0, 0.03, 0], E(a, 2.3, 1.3, 0.03), E(b, 2.3, 1.3, 0.03), [0, -1, 0]); }
  paint(ctx, TX.stone, INK.white, 0.9);
  const S = L <= 2 ? 30 : 16;
  for (let i = 0; i < S; i++) { const a = i / S * Math.PI * 2 + ctx.random() * 0.05, [x, , z] = E(a, 2.4, 1.4, 0), r = 0.1 + ctx.random() * 0.05; gem(ctx, x, 0.03, z, r, 0.07 + ctx.random() * 0.04, 0.04, 5); }
  for (const [x, z] of [[0, -0.85], [0.08, -1.25]]) cyl(ctx, x, 0, z, 0.19, 0.045, 7);
  // bee bath
  cyl(ctx, 1.9, 0, -0.75, 0.22, 0.12, 9, 0.26);
  paint(ctx, null, 'oklch(0.66 0.07 200)', 0.1); cyl(ctx, 1.9, 0.12, -0.75, 0.21, 0.004, 9);
  // wildflowers: sage stems with bright heads, ringed inside the edging, clear of the pavers and stand
  const F = L <= 2 ? 44 : 20;
  for (let i = 0; i < F; i++) {
    const a = ctx.random() * Math.PI * 2, t = 0.55 + ctx.random() * 0.4, x = Math.cos(a) * 2.15 * t, z = Math.sin(a) * 1.2 * t;
    if (Math.abs(z) < 0.45 && Math.abs(x) < 1.8) continue; if (Math.abs(x) < 0.35 && z < 0) continue; if (x < -1.3 && z < -0.9) continue; if (Math.hypot(x - 1.9, z + 0.75) < 0.35) continue;
    const h = 0.22 + ctx.random() * 0.25, [l, c, hu] = HUES[Math.floor(ctx.random() * HUES.length)];
    paint(ctx, null, 'oklch(0.55 0.1 135)', 0.9); bar(ctx, [x, 0.03, z], [x + (ctx.random() - 0.5) * 0.06, h, z], 0.015);
    if (L <= 2) gem(ctx, x + 0.05, h * 0.5, z, 0.05, 0.015, 0.015, 3);
    paint(ctx, null, `oklch(${l} ${c} ${hu})`, 0.8); gem(ctx, x, h, z, 0.045 + ctx.random() * 0.02, 0.025, 0.02, 5);
    if (L <= 2 && l < 0.9) { paint(ctx, null, 'oklch(0.85 0.15 90)', 0.8); gem(ctx, x, h + 0.02, z, 0.015, 0.01, 0.005, 4); }
  }
}
export function collider(ctx) {
  if (ctx.params.kind === 'sign') return null;
  box(ctx, -1.75, 0, -0.36, 1.75, 1.6, 0.3);
  box(ctx, -2.32, 0, -1.5, -1.48, 1.3, -1.36);
}
