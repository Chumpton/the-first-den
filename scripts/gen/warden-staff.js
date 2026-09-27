// A warden's staff: two walnut strands twisted about each other, a curled cradle at the head holding a teal rune crystal.
// Origin at the grip, the shaft along +Y (butt at −0.95, crystal at +0.9).
import { beam, gem, paint } from '../lib/yard-kit.js';
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod ?? 1, n = lod <= 2 ? 22 : 8;
  paint(ctx, 'walnut', 'oklch(0.72 0.05 55)', 0.85);
  for (const ph of [0, Math.PI]) {
    let prev = null;
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = -0.95 + t * 1.65, a = ph + t * 9, r = 0.018 + (t > 0.85 ? (t - 0.85) * 0.25 : 0);
      const p = [Math.cos(a) * r, y, Math.sin(a) * r];
      if (prev) beam(ctx, prev, p, 0.03, 0.03);
      prev = p;
    }
  }
  if (lod <= 3) for (let k = 0; k < 3; k++) { // cradle prongs
    const a = k / 3 * Math.PI * 2;
    const p0 = [Math.cos(a) * 0.03, 0.68, Math.sin(a) * 0.03], p1 = [Math.cos(a) * 0.08, 0.82, Math.sin(a) * 0.08], p2 = [Math.cos(a + 0.5) * 0.05, 0.97, Math.sin(a + 0.5) * 0.05];
    beam(ctx, p0, p1, 0.022, 0.022); beam(ctx, p1, p2, 0.016, 0.016);
  }
  ctx.albedo(null); ctx.color('oklch(0.9 0.12 170)'); ctx.roughness(0.15); ctx.emissive('oklch(0.85 0.14 170)');
  gem(ctx, 0, 0.86, 0, 0.055, 0.12, 0.08, 6);
  ctx.emissive(null);
}
export function collider() { return null; }
