// A short fallen log for the wall verges: bark cylinder lying along local X, pale cut ends with rings,
// sage moss cushions on top and a few honey toadstools. params: length (m), radius (m). Feet on the ground.
const TAU = Math.PI * 2;
function ringAt(x, r, n, rnd) { const p = []; for (let j = 0; j < n; j++) { const a = j / n * TAU, k = 0.9 + rnd() * 0.18; p.push([x, r + Math.sin(a) * r * k, Math.cos(a) * r * k]); } return p; }
function cap(ctx, ring, flip) { const c = [ring[0][0], ring.reduce((s, q) => s + q[1], 0) / ring.length, 0];
  for (let j = 0; j < ring.length; j++) { const a = ring[j], b = ring[(j + 1) % ring.length]; if (flip) ctx.tri(...c, ...b, ...a); else ctx.tri(...c, ...a, ...b); } }
function lump(ctx, cx, cy, cz, rx, ry, rz) { // a low 8-face cushion
  const P = [[cx + rx, cy, cz], [cx, cy, cz + rz], [cx - rx, cy, cz], [cx, cy, cz - rz]], T = [cx, cy + ry, cz], B = [cx, cy - ry * 0.4, cz];
  for (let i = 0; i < 4; i++) { const a = P[i], b = P[(i + 1) % 4]; ctx.tri(...T, ...b, ...a); ctx.tri(...B, ...a, ...b); }
}
export function geometry(ctx) {
  const lod = Number(ctx.lod ?? 1), L = Number(ctx.params.length ?? 1.8), r = Number(ctx.params.radius ?? 0.2), rnd = () => ctx.random();
  const n = lod >= 3 ? 5 : 8, seg = lod >= 3 ? 1 : 3;
  ctx.flat(); ctx.albedo('scripts/tex-valley-bark.js'); ctx.color('oklch(0.62 0.05 60)'); ctx.roughness(0.95);
  const rings = []; for (let i = 0; i <= seg; i++) rings.push(ringAt(-L / 2 + L * i / seg, r * (1 - i * 0.05), n, rnd));
  for (let i = 0; i < seg; i++) for (let j = 0; j < n; j++) { const jj = (j + 1) % n, a = rings[i][j], b = rings[i + 1][j], c = rings[i + 1][jj], d = rings[i][jj]; ctx.quad(...a, ...d, ...c, ...b); }
  ctx.albedo(null); ctx.color('oklch(0.8 0.06 70)');
  if (ctx.params.hollow) { // params.hollow: a rotted-out bore — rim annulus at each end, a dark inner tube a little way in
    const k = 0.62, inner = (rg) => rg.map((p) => [p[0], r + (p[1] - r) * k, p[2] * k]), i0 = inner(rings[0]), i1 = inner(rings[seg]);
    for (let j = 0; j < n; j++) { const jj = (j + 1) % n;
      ctx.quad(...rings[0][j], ...rings[0][jj], ...i0[jj], ...i0[j]); ctx.quad(...rings[seg][j], ...i1[j], ...i1[jj], ...rings[seg][jj]); }
    ctx.color('oklch(0.32 0.04 55)');
    for (let j = 0; j < n; j++) { const jj = (j + 1) % n; ctx.quad(...i0[j], ...i0[jj], ...i1[jj], ...i1[j]); }
  } else { cap(ctx, rings[0], true); cap(ctx, rings[seg], false); }
  if (lod >= 3) return;
  const MOSS = ['oklch(0.70 0.10 128)', 'oklch(0.76 0.11 120)', 'oklch(0.64 0.09 136)'];
  for (let i = 0; i < 4; i++) { ctx.color(MOSS[i % 3]); const x = -L / 2 + L * (0.12 + rnd() * 0.76); lump(ctx, x, r * 1.9, (rnd() - 0.5) * r * 0.5, r * (0.5 + rnd() * 0.4), r * 0.28, r * 0.7); }
  for (let i = 0; i < 3; i++) { const x = -L / 2 + L * (0.2 + rnd() * 0.6), z = (rnd() < 0.5 ? -1 : 1) * r * (1.05 + rnd() * 0.3), h = 0.07 + rnd() * 0.06;
    ctx.color('oklch(0.9 0.03 85)'); lump(ctx, x, h * 0.5, z, 0.012, h * 0.5, 0.012);
    ctx.color(i % 2 ? 'oklch(0.72 0.12 60)' : 'oklch(0.66 0.15 35)'); lump(ctx, x, h, z, 0.045, 0.03, 0.045); }
}
