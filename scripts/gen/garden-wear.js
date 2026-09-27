// Garden-crowd wear: a straw sun hat, a linen apron or a wicker basket riding a townsperson (feet = the body's feet, front −Z).
// params: item hat|apron|basket, col (ribbon / apron / basket-contents colour), top (hat height, 1.72).
import { TAU, paint, lathe, blob, obox } from '../lib/town-kit.js';
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, n = lod <= 2 ? 14 : 8, P = ctx;
  if (p.item === 'hat') {
    const y = p.top ?? 1.72;
    paint(ctx, 'cdn/texture-woven-straw-hat.png', 'oklch(0.93 0.06 85)', 0.95);
    lathe(P, [[0.33, y - 0.04], [0.2, y + 0.005], [0.13, y + 0.01], [0.125, y + 0.1], [0.08, y + 0.14], [0, y + 0.145]], n, 0, 0, 0.01);
    paint(ctx, null, p.col || 'oklch(0.66 0.15 15)', 0.8); lathe(P, [[0.132, y + 0.012], [0.132, y + 0.045], [0, y + 0.045]], n, 0, 0, 0.01);
    if (lod <= 2 && p.flower) { paint(ctx, null, p.flower, 0.7); blob(P, 0.12, y + 0.02, -0.04, 0.04, 0.04, 0.04, 5); }
  } else if (p.item === 'apron') {
    paint(ctx, 'linen', p.col || 'oklch(0.85 0.06 140)', 0.95);
    ctx.quad(-0.15, 1.12, -0.17, 0.15, 1.12, -0.17, 0.2, 0.58, -0.21, -0.2, 0.58, -0.21);
    ctx.quad(-0.1, 1.36, -0.15, 0.1, 1.36, -0.15, 0.15, 1.12, -0.17, -0.15, 1.12, -0.17);
    if (lod <= 2) { paint(ctx, null, 'oklch(0.55 0.06 60)', 0.9); ctx.quad(-0.1, 0.95, -0.195, 0.1, 0.95, -0.195, 0.1, 0.8, -0.2, -0.1, 0.8, -0.2); }
  } else if (p.item === 'basket') {
    paint(ctx, 'cdn/texture-woven-wicker-basket.png', 'oklch(0.9 0.05 75)', 0.95);
    lathe(P, [[0.12, 0.66], [0.17, 0.82], [0.15, 0.82], [0.1, 0.68], [0, 0.68]], 10, -0.34, 0, 0);
    paint(ctx, null, 'oklch(0.55 0.06 60)', 0.9);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI, b = (i + 1) / 6 * Math.PI; obox(P, -0.34 + Math.cos(a) * 0.15 - 0.01, 0.82 + Math.sin(a) * 0.2, 0, 0.03, 0.03 + Math.abs(Math.sin(b) - Math.sin(a)) * 0.2, 0.03); }
    paint(ctx, null, p.col || 'oklch(0.7 0.17 50)', 0.7);
    for (let i = 0; i < 4; i++) blob(P, -0.34 + (i - 1.5) * 0.06, 0.78, (i % 2) * 0.05 - 0.02, 0.05, 0.07, 0.05, 4);
  }
}
export function collider() { return null; }
