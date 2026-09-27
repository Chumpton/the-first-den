// One Langstroth hive: bottom board with landing lip (-Z), stacked boxes (params.boxes deep|medium, params.paint white|honey),
// telescoping cover with a galvanised cap and a limestone brick. Feet at the stand top.
import { box, Q } from '../lib/road-solid.js';
import { bar, paint, TX, INK } from './coop-kit.js';
const HT = { deep: 0.24, medium: 0.17 }, W = 0.42, D = 0.51;
export function geometry(ctx) {
  const L = ctx.lod, boxes = ctx.params.boxes || ['deep', 'deep', 'medium'], pc = ctx.params.paint || ['white', 'honey', 'white'];
  ctx.flat();
  paint(ctx, TX.oak, INK.oak); box(ctx, -W / 2 - 0.01, 0, -D / 2 - 0.08, W / 2 + 0.01, 0.06, D / 2);
  let y = 0.06;
  boxes.forEach((k, i) => {
    const h = HT[k] || 0.2;
    if (pc[i] === 'honey') paint(ctx, TX.oak, 'oklch(0.9 0.08 75)', 0.7); else paint(ctx, null, INK.white, 0.8);
    box(ctx, -W / 2, y, -D / 2, W / 2, y + h - 0.006, D / 2);
    if (L <= 2) {
      paint(ctx, null, 'oklch(0.3 0.03 60)', 0.9);
      const m = y + h * 0.6;
      for (const s of [-1, 1]) Q(ctx, [s * (W / 2 + 0.002), m - 0.018, -0.08], [s * (W / 2 + 0.002), m - 0.018, 0.08], [s * (W / 2 + 0.002), m + 0.018, 0.08], [s * (W / 2 + 0.002), m + 0.018, -0.08], [0, m, 0]);
    }
    y += h;
  });
  paint(ctx, null, INK.dark, 0.9); Q(ctx, [-0.13, 0.062, -D / 2 - 0.002], [0.13, 0.062, -D / 2 - 0.002], [0.13, 0.088, -D / 2 - 0.002], [-0.13, 0.088, -D / 2 - 0.002], [0, 0.07, 0]);
  paint(ctx, TX.oak, INK.oak); box(ctx, -W / 2 - 0.03, y, -D / 2 - 0.03, W / 2 + 0.03, y + 0.07, D / 2 + 0.03);
  paint(ctx, null, INK.galv, 0.4, 0.75); box(ctx, -W / 2 - 0.035, y + 0.07, -D / 2 - 0.035, W / 2 + 0.035, y + 0.082, D / 2 + 0.035);
  if (L <= 2) { paint(ctx, TX.stone, INK.white, 0.9); box(ctx, -0.1, y + 0.082, -0.05, 0.1, y + 0.14, 0.06); }
}
export function collider() { return null; }
