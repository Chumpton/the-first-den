// A small bone-shaped dog biscuit: a flat bar with two knobs at each end. Feet at y 0.
const box = (ctx, x0, y0, z0, x1, y1, z1) => {
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0); ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1);
  ctx.quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1); ctx.quad(x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0);
  ctx.quad(x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1); ctx.quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0);
};
export function geometry(ctx) {
  ctx.flat(); ctx.roughness(0.95);
  ctx.color('oklch(0.8 0.08 70)');
  const h = 0.016, L = 0.045, w = 0.012, k = 0.014;
  box(ctx, -L, 0, -w, L, h, w);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * L - k, 0, sz * w * 1.1 - k, sx * L + k, h * 1.05, sz * w * 1.1 + k);
  ctx.color('oklch(0.7 0.09 60)');
  box(ctx, -L * 0.5, h, -0.003, L * 0.5, h + 0.002, 0.003);
}
export function collider() { return null; }
