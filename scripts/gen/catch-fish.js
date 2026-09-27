// The boat-fishing kit: params.item = fish (params.kind perch | trout | carp | koi | boot) | rod | bobber.
// A fish lies along X (head at +X) so held overhead it reads side-on; the rod's butt sits at the origin and runs up +Z.
const KINDS = {
  perch: { len: 0.34, h: 0.1, w: 0.045, back: 'oklch(0.5 0.1 130)', side: 'oklch(0.72 0.12 110)', belly: 'oklch(0.92 0.04 95)', fin: 'oklch(0.68 0.17 40)', bars: 'oklch(0.35 0.06 140)' },
  trout: { len: 0.44, h: 0.1, w: 0.05, back: 'oklch(0.48 0.06 180)', side: 'oklch(0.78 0.06 20)', belly: 'oklch(0.94 0.02 80)', fin: 'oklch(0.6 0.06 170)', spots: 'oklch(0.3 0.03 200)' },
  carp: { len: 0.5, h: 0.17, w: 0.075, back: 'oklch(0.45 0.07 70)', side: 'oklch(0.66 0.11 75)', belly: 'oklch(0.86 0.07 85)', fin: 'oklch(0.55 0.1 50)' },
  koi: { len: 0.5, h: 0.14, w: 0.065, back: 'oklch(0.8 0.16 85)', side: 'oklch(0.86 0.15 90)', belly: 'oklch(0.96 0.05 95)', fin: 'oklch(0.9 0.1 90)', glow: true, spots: 'oklch(0.6 0.2 35)' },
};
function loft(ctx, rings, seg, colAt) { // rings: [x, halfH, halfW, yOffset]
  const P = (r, i) => { const a = (i / seg) * Math.PI * 2; return [r[0], r[3] + Math.cos(a) * r[1], Math.sin(a) * r[2]]; };
  for (let k = 0; k < rings.length - 1; k++) for (let i = 0; i < seg; i++) {
    const a = P(rings[k], i), b = P(rings[k], i + 1), c = P(rings[k + 1], i + 1), d = P(rings[k + 1], i);
    ctx.color(colAt((a[1] - rings[k][3]) / Math.max(1e-4, rings[k][1]), k)); ctx.quad(...a, ...d, ...c, ...b);
  }
}
function fin(ctx, col, pts) { ctx.color(col); for (let i = 1; i < pts.length - 1; i++) { ctx.tri(...pts[0], ...pts[i], ...pts[i + 1]); ctx.tri(...pts[i + 1], ...pts[i], ...pts[0]); } }
function fish(ctx, K, lod) {
  const L = K.len, H = K.h, W = K.w, seg = lod >= 3 ? 6 : 10;
  const prof = [[0.5, 0.05, 0.05], [0.44, 0.55, 0.6], [0.3, 0.92, 0.95], [0.12, 1, 1], [-0.1, 0.85, 0.82], [-0.3, 0.45, 0.45], [-0.4, 0.22, 0.2]];
  const rings = prof.map(([f, h, w]) => [f * L, h * H * 0.5, w * W * 0.5, 0]);
  if (K.glow) ctx.emissive('oklch(0.55 0.14 85)'); ctx.roughness(0.45); ctx.metalness(K.glow ? 0.35 : 0.05);
  loft(ctx, rings, seg, (c) => (c > 0.45 ? K.back : c > -0.35 ? K.side : K.belly));
  ctx.emissive(null); ctx.metalness(0);
  fin(ctx, K.fin, [[-0.4 * L, 0, 0], [-0.62 * L, H * 0.55, 0], [-0.54 * L, 0, 0], [-0.62 * L, -H * 0.55, 0]]); // tail
  fin(ctx, K.fin, [[0.2 * L, H * 0.45, 0], [0.05 * L, H * 0.85, 0], [-0.18 * L, H * 0.62, 0], [-0.2 * L, H * 0.38, 0]]); // dorsal
  fin(ctx, K.fin, [[-0.05 * L, -H * 0.4, 0], [-0.18 * L, -H * 0.62, 0], [-0.25 * L, -H * 0.35, 0]]); // anal
  if (lod <= 2) {
    for (const s of [-1, 1]) { // eyes, a gill line, pectorals
      const ex = 0.36 * L, ey = H * 0.12, ez = s * W * 0.33, e = H * 0.1;
      ctx.color('oklch(0.97 0.01 90)'); ctx.quad(ex - e, ey, ez, ex, ey + e, ez + s * 0.002, ex + e, ey, ez, ex, ey - e, ez + s * 0.002);
      ctx.color('oklch(0.12 0.01 250)'); const p = e * 0.55, pz = ez + s * 0.004; ctx.quad(ex - p, ey, pz, ex, ey + p, pz, ex + p, ey, pz, ex, ey - p, pz);
      fin(ctx, K.fin, [[0.26 * L, -H * 0.12, s * W * 0.45], [0.12 * L, -H * 0.3, s * W * 0.9], [0.1 * L, -H * 0.05, s * W * 0.6]]);
      if (K.bars || K.spots) { ctx.color(K.bars || K.spots); const n = K.bars ? 5 : 9;
        for (let i = 0; i < n; i++) { const x = (0.22 - i * 0.075) * L, y = K.bars ? H * 0.1 : (((i * 37) % 7) / 7 - 0.3) * H * 0.5, hh = K.bars ? H * 0.3 : H * 0.07, ww = K.bars ? L * 0.02 : H * 0.07, z = s * W * 0.5 * 0.98 + s * 0.003;
          ctx.quad(x - ww, y, z, x, y + hh, z, x + ww, y, z, x, y - hh * (K.bars ? 0.2 : 1), z); } }
    }
  }
}
function boot(ctx) { // a sad old boot, toe at +X
  ctx.roughness(0.95); ctx.color('oklch(0.35 0.04 50)');
  const box = (x0, y0, z0, x1, y1, z1) => { const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    for (const [a, b, c, d] of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]]) ctx.quad(...v[a], ...v[b], ...v[c], ...v[d]); };
  box(-0.08, -0.12, -0.05, 0.16, -0.04, 0.05); box(-0.1, -0.04, -0.055, 0.02, 0.18, 0.055);
  ctx.color('oklch(0.22 0.02 50)'); box(-0.09, -0.14, -0.052, 0.17, -0.12, 0.052);
  ctx.color('oklch(0.55 0.12 140)'); box(0.0, 0.18, -0.01, 0.015, 0.26, 0.01); // a weed hanging out of it
}
function rod(ctx) {
  const L = 1.9, seg = 6; ctx.roughness(0.6);
  const tube = (z0, z1, r0, r1, col) => { ctx.color(col); for (let i = 0; i < seg; i++) { const a = (i / seg) * 6.2832, b = ((i + 1) / seg) * 6.2832;
    ctx.quad(Math.cos(a) * r0, Math.sin(a) * r0, z0, Math.cos(b) * r0, Math.sin(b) * r0, z0, Math.cos(b) * r1, Math.sin(b) * r1, z1, Math.cos(a) * r1, Math.sin(a) * r1, z1); } };
  tube(-0.15, 0.22, 0.02, 0.018, 'oklch(0.42 0.06 60)');    // cork grip
  tube(0.22, L, 0.011, 0.004, 'oklch(0.55 0.1 60)');         // bamboo blank
  for (const z of [0.6, 1.0, 1.4]) tube(z, z + 0.02, 0.014, 0.014, 'oklch(0.3 0.04 40)'); // wraps
  ctx.metalness(0.6); ctx.color('oklch(0.7 0.02 250)');      // reel
  for (let i = 0; i < 10; i++) { const a = (i / 10) * 6.2832, b = ((i + 1) / 10) * 6.2832, r = 0.045;
    ctx.tri(0, -0.05, 0.1, 0, -0.05 + Math.cos(a) * r, 0.1 + Math.sin(a) * r, 0, -0.05 + Math.cos(b) * r, 0.1 + Math.sin(b) * r);
    ctx.tri(0, -0.05, 0.1, 0, -0.05 + Math.cos(b) * r, 0.1 + Math.sin(b) * r, 0, -0.05 + Math.cos(a) * r, 0.1 + Math.sin(a) * r); }
  ctx.metalness(0);
}
function bobber(ctx) {
  const seg = 8, ring = (y, r) => [...Array(seg)].map((_, i) => { const a = (i / seg) * 6.2832; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
  const bands = [[-0.04, 0.005, 'oklch(0.95 0.01 90)'], [-0.02, 0.04, 'oklch(0.95 0.01 90)'], [0.0, 0.045, 'oklch(0.62 0.22 28)'], [0.03, 0.035, 'oklch(0.62 0.22 28)'], [0.055, 0.006, 'oklch(0.62 0.22 28)']];
  ctx.roughness(0.4);
  for (let k = 0; k < bands.length - 1; k++) { const A = ring(bands[k][0], bands[k][1]), B = ring(bands[k + 1][0], bands[k + 1][1]); ctx.color(bands[k + 1][2]);
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; ctx.quad(...A[i], ...B[i], ...B[j], ...A[j]); } }
  ctx.color('oklch(0.3 0.02 60)'); ctx.quad(-0.004, 0.055, 0, 0.004, 0.055, 0, 0.004, 0.11, 0, -0.004, 0.11, 0); ctx.quad(0.004, 0.055, 0, -0.004, 0.055, 0, -0.004, 0.11, 0, 0.004, 0.11, 0);
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod ?? 1;
  ctx.metalness(0);
  if (p.item === 'rod') return rod(ctx);
  if (p.item === 'bobber') return bobber(ctx);
  if (p.kind === 'boot') return boot(ctx);
  fish(ctx, KINDS[p.kind] || KINDS.perch, lod);
}
