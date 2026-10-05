import { softened } from "./soften.js";
// A mossy stone pressure pad with a softly glowing leaf rune. Feet at its underside, 1.4 × 1.0 m.
export const geometry = softened(function geometry(ctx) {
  const w = ctx.params.width ?? 1.4, d = ctx.params.depth ?? 1.0, h = 0.06
  ctx.flat(); ctx.albedo('cdn/texture-rough-fieldstone-wall-mortared.png'); ctx.color('oklch(0.8 0.03 120)'); ctx.roughness(0.95)
  const x = w / 2, z = d / 2
  ctx.quad(-x, h, z, x, h, z, x, h, -z, -x, h, -z)
  ctx.quad(-x, 0, z, x, 0, z, x, h, z, -x, h, z)
  ctx.quad(x, 0, -z, -x, 0, -z, -x, h, -z, x, h, -z)
  ctx.quad(x, 0, z, x, 0, -z, x, h, -z, x, h, z)
  ctx.quad(-x, 0, -z, -x, 0, z, -x, h, z, -x, h, -z)
  ctx.albedo(null); ctx.color('oklch(0.85 0.12 150)'); ctx.emissive(0.6, 2.4, 1.3)
  const y = h + 0.004, r = 0.3
  ctx.quad(-0.02, y, r, 0.02, y, r, 0.02, y, -r, -0.02, y, -r)
  for (const s of [-1, 1]) for (const t of [-0.15, 0.05]) ctx.quad(0, y, t + 0.02, s * 0.16, y, t - 0.08, s * 0.16, y, t - 0.12, 0, y, t - 0.02)
  ctx.emissive(null)
});
