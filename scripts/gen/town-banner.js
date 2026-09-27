// Heraldic cloth: burgundy field, gold border, a gold dragon rampant. Origin at the top of the hoist.
// params.kind 'flag' (hoist at x 0, flies toward +x, swallow-tailed) | 'drape' (hangs down from y 0, pointed hem).
// Worn with scripts/material-banner-wave.js (ax/ay say which way the wave runs); vertex paint, no textures.
const BUR = 'oklch(0.42 0.14 18)', BUR2 = 'oklch(0.36 0.12 16)', GOLD = 'oklch(0.8 0.13 82)';
function dragon(ctx, cx, cy, s, z, col) {
  ctx.color(col);
  const P = [
    [[0, 0.1], [0.18, 0.28], [0.1, -0.3], [-0.12, -0.25]], [[0.18, 0.28], [0.3, 0.55], [0.22, 0.6], [0.1, 0.3]], [[0.22, 0.6], [0.3, 0.55], [0.46, 0.62], [0.32, 0.72]],
    [[0.02, 0.18], [-0.2, 0.62], [-0.05, 0.3]], [[-0.2, 0.62], [-0.42, 0.4], [-0.05, 0.3]], [[-0.42, 0.4], [-0.3, 0.12], [-0.05, 0.3]],
    [[-0.12, -0.25], [0.1, -0.3], [0.02, -0.55], [-0.14, -0.5]], [[-0.14, -0.5], [0.02, -0.55], [-0.3, -0.68], [-0.34, -0.6]], [[-0.34, -0.6], [-0.3, -0.68], [-0.46, -0.52]],
    [[0.12, -0.1], [0.3, -0.02], [0.32, 0.04], [0.12, -0.02]], [[0.05, -0.3], [0.22, -0.52], [0.26, -0.48], [0.1, -0.24]], [[0.3, 0.62], [0.34, 0.8], [0.36, 0.64]],
  ];
  for (const poly of P) { const q = poly.map(([u, v]) => [cx + u * s, cy + v * s, z]); if (q.length === 3) ctx.tri(...q[0], ...q[1], ...q[2]); else ctx.quad(...q[0], ...q[1], ...q[2], ...q[3]); }
}
export function geometry(ctx) {
  const { kind = 'flag', L = 3.6, h = 2.3, w = 1.0, notch = 0.7, point = 0.4 } = ctx.params, lod = ctx.lod || 1;
  const nu = lod <= 2 ? 16 : 6, nv = lod <= 2 ? 8 : 3;
  const pos = kind === 'flag'
    ? (u, v) => [u * (L - notch * (1 - Math.abs(2 * v - 1))), -v * h]
    : (u, v) => [(u - 0.5) * w, -v * (h + point * (1 - Math.abs(2 * u - 1)))];
  const grid = (u0, u1, v0, v1, z, col, cu, cv) => {
    ctx.color(col);
    for (let i = 0; i < cu; i++) for (let j = 0; j < cv; j++) {
      const a = u0 + (u1 - u0) * i / cu, b = u0 + (u1 - u0) * (i + 1) / cu, c = v0 + (v1 - v0) * j / cv, d = v0 + (v1 - v0) * (j + 1) / cv;
      const A = pos(a, c), B = pos(b, c), C = pos(b, d), D = pos(a, d);
      ctx.quad(A[0], A[1], z, D[0], D[1], z, C[0], C[1], z, B[0], B[1], z);
    }
  };
  ctx.flat(); ctx.roughness(0.85); ctx.metalness(0);
  grid(0, 1, 0, 1, 0, BUR, nu, nv);
  if (lod > 3) return;
  for (const z of [-0.012, 0.012]) {
    if (kind === 'flag') {
      grid(0, 0.05, 0, 1, z, GOLD, 1, nv); grid(0.05, 1, 0, 0.07, z, GOLD, nu, 1); grid(0.05, 1, 0.93, 1, z, GOLD, nu, 1);
      if (lod <= 2) grid(0.05, 1, 0.47, 0.53, z * 0.5, BUR2, nu, 1);
      dragon(ctx, L * 0.36, -h * 0.5, h * 0.62, z * 1.6, GOLD);
    } else {
      grid(0, 0.1, 0, 1, z, GOLD, 1, nv); grid(0.9, 1, 0, 1, z, GOLD, 1, nv); grid(0.1, 0.9, 0, 0.05, z, GOLD, nu > 6 ? 4 : 1, 1);
      const cy = -h * 0.3, r = w * 0.34; ctx.color(GOLD);
      for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, b = (i + 1) / 14 * Math.PI * 2; ctx.tri(0, cy, z * 1.4, Math.cos(b) * r, cy + Math.sin(b) * r, z * 1.4, Math.cos(a) * r, cy + Math.sin(a) * r, z * 1.4); }
      dragon(ctx, 0, cy, r * 1.35, z * 2.2, BUR);
      dragon(ctx, 0, -h * 0.68, w * 0.5, z * 1.4, GOLD);
    }
  }
  if (kind === 'drape' && lod <= 2) { ctx.color(GOLD); const tip = pos(0.5, 1); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, b = (i + 1) / 6 * Math.PI * 2; ctx.tri(tip[0], tip[1] - 0.25, 0, tip[0] + Math.cos(b) * 0.05, tip[1], Math.sin(b) * 0.05, tip[0] + Math.cos(a) * 0.05, tip[1], Math.sin(a) * 0.05); } }
}
export function collider() { return null; }
