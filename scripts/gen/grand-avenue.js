// The main avenue from the road gate to the front door: wide laid limestone in running courses, a darker kerb each side,
// and a round plaza (params.plaza [z, R]) the avenue opens into. Local: runs along -Z from z0 to z1, centred on x 0. No collider.
import { paint, obox, TAU } from '../lib/yard-kit.js';
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, W = p.w ?? 4.4, z0 = p.z0 ?? 0, z1 = p.z1 ?? -20, [pz, PR] = p.plaza ?? [-9, 4.4];
  const rnd = () => ctx.random(), hw = W / 2, y = 0.02, fh = 0.06;
  ctx.flat();
  const stone = () => paint(ctx, 'stone', `oklch(${(0.88 + rnd() * 0.08).toFixed(3)} 0.022 ${(72 + rnd() * 22).toFixed(0)})`, 0.9);
  const gap = p.gap, inGap = (z) => gap && z < gap[0] && z > gap[1];
  const inPlaza = (x, z) => Math.hypot(x, z - pz) < PR - 0.25 || inGap(z);
  // courses across the avenue
  const cl = lod <= 2 ? 0.55 : lod === 3 ? 1.1 : 2.2;
  for (let z = z0 - cl / 2; z > z1 + cl / 2 - 0.01; z -= cl) {
    let x = -hw + (Math.round(z / cl) % 2 ? 0 : -0.35);
    while (x < hw - 0.05) {
      const len = (lod <= 2 ? 0.6 + rnd() * 0.5 : 1.4 + rnd()), a = Math.max(x, -hw + 0.02), b = Math.min(x + len, hw - 0.02);
      if (b - a > 0.12 && !inPlaza((a + b) / 2, z)) { stone(); obox(ctx, (a + b) / 2, y - 0.04, z, b - a - 0.035, fh + rnd() * 0.012, cl - 0.035); }
      x += len;
    }
  }
  // kerbs
  paint(ctx, 'stone', 'oklch(0.72 0.02 70)', 0.9);
  const kn = lod <= 2 ? Math.ceil((z0 - z1) / 0.7) : 4;
  for (const sx of [-1, 1]) for (let i = 0; i < kn; i++) { const za = z0 - (z0 - z1) * i / kn, zb = z0 - (z0 - z1) * (i + 1) / kn, zm = (za + zb) / 2; if (Math.abs(zm - pz) < PR - 0.2 || inGap(zm)) continue; obox(ctx, sx * (hw + 0.1), -0.04, zm, 0.2, 0.14, za - zb - 0.03); }
  // plaza: rings of flags around the centre, a kerb circle
  const rings = lod <= 2 ? 6 : 3, dr = PR / rings;
  for (let k = 1; k < rings; k++) {
    const r0 = k * dr, r1 = r0 + dr, rm = (r0 + r1) / 2, n = Math.max(6, Math.floor(TAU * rm / (lod <= 2 ? 0.7 : 1.6))), a0 = rnd() * TAU;
    for (let i = 0; i < n; i++) { const a = a0 + (i + 0.5) / n * TAU; stone(); obox(ctx, Math.cos(a) * rm, y - 0.04, pz + Math.sin(a) * rm, TAU * rm / n - 0.04, fh + rnd() * 0.012, dr - 0.04, -a + Math.PI / 2); }
  }
  paint(ctx, 'stone', 'oklch(0.72 0.02 70)', 0.9);
  const kc = lod <= 2 ? 40 : 14;
  for (let i = 0; i < kc; i++) { const a = (i + 0.5) / kc * TAU, x = Math.cos(a) * (PR + 0.1), z = pz + Math.sin(a) * (PR + 0.1); if (Math.abs(x) < hw + 0.1) continue; obox(ctx, x, -0.04, z, TAU * PR / kc - 0.03, 0.14, 0.2, -a + Math.PI / 2); }
  ctx.albedo(null);
}
export function collider() { return null; }
