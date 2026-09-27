// small solid helpers for the glasshouse props (alchemy bench, compost corner): boxes, rods, lathes, paint
export const P = (ctx, tex, col, rough = 0.85, metal = 0, a = 1) => { ctx.albedo(tex || null); ctx.color(col, a); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null); };
export const TEX = { oak: 'cdn/texture-honey-oak-timber-planks.png', walnut: 'cdn/texture-hand-joined-walnut-wood.png', stone: 'cdn/texture-pale-limestone-flagstone.png', soil: 'cdn/texture-dark-garden-soil-with-mulch.png', brass: 'cdn/texture-aged-brass-metal.png' };
export function box(ctx, x0, y0, z0, x1, y1, z1) {
  const p = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  for (const f of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [0, 1, 5, 4], [3, 7, 6, 2]]) ctx.quad(...p[f[0]], ...p[f[1]], ...p[f[2]], ...p[f[3]]);
}
const nrm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export function rod(ctx, a, b, w) {
  const d = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
  const u = nrm(Math.abs(d[1]) < 0.9 ? crs(d, [0, 1, 0]) : crs(d, [1, 0, 0])), v = crs(d, u), h = w / 2;
  const c = [[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([p, q]) => [0, 1, 2].map((i) => u[i] * p * h + v[i] * q * h));
  for (let i = 0; i < 4; i++) { const e = c[i], f = c[(i + 1) % 4]; ctx.quad(a[0] + e[0], a[1] + e[1], a[2] + e[2], b[0] + e[0], b[1] + e[1], b[2] + e[2], b[0] + f[0], b[1] + f[1], b[2] + f[2], a[0] + f[0], a[1] + f[1], a[2] + f[2]); }
}
// profile [[r, y], …] swept about the local Y axis, centred at (cx, cy, cz); xf remaps a point (for lying drums)
export function lathe(ctx, cx, cy, cz, prof, seg = 10, xf = null, sx = 1) {
  for (let i = 0; i < prof.length - 1; i++) for (let j = 0; j < seg; j++) {
    const a0 = (j / seg) * Math.PI * 2, a1 = ((j + 1) / seg) * Math.PI * 2;
    const pt = (r, y, a) => { const q = [Math.cos(a) * r * sx, y, Math.sin(a) * r]; const w = xf ? xf(q) : q; return [cx + w[0], cy + w[1], cz + w[2]]; };
    const [r0, y0] = prof[i], [r1, y1] = prof[i + 1];
    if (r0 === 0 && r1 === 0) continue;
    ctx.quad(...pt(r0, y0, a0), ...pt(r1, y1, a0), ...pt(r1, y1, a1), ...pt(r0, y0, a1));
  }
}
