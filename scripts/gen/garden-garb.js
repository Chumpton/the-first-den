// Garden-princess garb, worn on a humanoid's bones: params.item = crown (a ring of blooms and leaves, origin = the head
// bone, sitting params.y above it) | skirt (a layered petal skirt, origin = the hips) | sash (a trailing vine of leaves).
const V = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
function tri(ctx, a, b, c, both = true) { ctx.tri(...a, ...b, ...c); if (both) ctx.tri(...c, ...b, ...a); }
function blossom(ctx, c, up, r, col, heart) {
  ctx.color(col); ctx.roughness(0.7); ctx.emissive(null);
  for (let i = 0; i < 5; i++) { const a = i / 5 * 6.2832, b = a + 0.63, m = a + 0.315;
    const p = (ang, rr, dy) => [c[0] + Math.cos(ang) * rr, c[1] + dy, c[2] + Math.sin(ang) * rr];
    tri(ctx, c, p(a, r * 0.8, r * 0.25 * up), p(m, r, r * 0.35 * up)); tri(ctx, c, p(m, r, r * 0.35 * up), p(b, r * 0.8, r * 0.25 * up)); }
  ctx.color(heart); for (let i = 0; i < 4; i++) { const a = i / 4 * 6.2832; tri(ctx, [c[0], c[1] + r * 0.3, c[2]], [c[0] + Math.cos(a) * r * 0.25, c[1] + r * 0.15, c[2] + Math.sin(a) * r * 0.25], [c[0] + Math.cos(a + 1.57) * r * 0.25, c[1] + r * 0.15, c[2] + Math.sin(a + 1.57) * r * 0.25]); }
}
function leaf(ctx, p, d, s, col) { ctx.color(col); const side = [-d[2], 0, d[0]], L = Math.hypot(...side) || 1, sd = side.map((v) => v / L);
  const tip = [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s], m = [p[0] + d[0] * s * 0.5, p[1] + d[1] * s * 0.5 + s * 0.08, p[2] + d[2] * s * 0.5];
  tri(ctx, p, [m[0] + sd[0] * s * 0.3, m[1], m[2] + sd[2] * s * 0.3], tip); tri(ctx, p, tip, [m[0] - sd[0] * s * 0.3, m[1], m[2] - sd[2] * s * 0.3]); }
const PET = ['oklch(0.85 0.1 350)', 'oklch(0.95 0.03 90)', 'oklch(0.8 0.12 20)', 'oklch(0.78 0.1 300)', 'oklch(0.9 0.1 85)'];
const HEART = 'oklch(0.85 0.15 90)', LEAF = ['oklch(0.55 0.12 145)', 'oklch(0.65 0.13 135)'];
export function geometry(ctx) {
  const p = ctx.params || {}, item = p.item || 'crown';
  ctx.metalness(0); ctx.albedo(null);
  if (item === 'crown') {
    const R = p.r ?? 0.095, y = p.y ?? 0.16;
    ctx.color('oklch(0.45 0.08 110)'); ctx.roughness(0.9); // the woven vine band
    for (let i = 0; i < 18; i++) { const a = i / 18 * 6.2832, b = (i + 1) / 18 * 6.2832; const w = 0.008;
      ctx.quad?.(...V(a, R - w, y), ...V(b, R - w, y), ...V(b, R + w, y + 0.006), ...V(a, R + w, y + 0.006));
      tri(ctx, V(a, R - w, y), V(b, R - w, y), V(b, R + w, y + 0.008)); tri(ctx, V(a, R - w, y), V(b, R + w, y + 0.008), V(a, R + w, y + 0.008)); }
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.2832 + 0.2; leaf(ctx, V(a, R, y), [Math.cos(a + 1.2) * 0.8, 0.25, Math.sin(a + 1.2) * 0.8], 0.045, LEAF[i % 2]); }
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.2832, big = i % 3 === 0; blossom(ctx, V(a, R + 0.004, y + 0.012), 1, big ? 0.034 : 0.024, PET[i % 5], HEART); }
    // two ribbons trailing down the back (+Z is behind a model facing -Z)
    ctx.color('oklch(0.85 0.08 350)'); for (const s of [-1, 1]) { const x = s * 0.025; tri(ctx, [x, y, R], [x + s * 0.02, y, R], [x + s * 0.06, y - 0.28, R + 0.05]); tri(ctx, [x, y, R], [x + s * 0.06, y - 0.28, R + 0.05], [x + s * 0.035, y - 0.3, R + 0.05]); }
    return;
  }
  if (item === 'skirt') { // three tiers of petals flaring out from the waist, rose to blush to cream
    const tiers = [[0.14, 0.2, 0.3, 'oklch(0.72 0.12 5)'], [0.17, 0.3, 0.44, 'oklch(0.82 0.09 355)'], [0.2, 0.4, 0.62, 'oklch(0.92 0.04 60)']];
    const y0 = p.y ?? 0.08;
    tiers.slice().reverse().forEach(([rTop, rBot, drop, col], ti) => { const n = 12, k = 2 - ti; ctx.color(col); ctx.roughness(0.8);
      for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + k * 0.26, b = (i + 1.25) / n * 6.2832 + k * 0.26, m = (a + b) / 2;
        const top = y0 - k * 0.1, bot = top - drop;
        tri(ctx, V(a, rTop, top), V(b, rTop, top), V(b, rBot, bot)); tri(ctx, V(a, rTop, top), V(b, rBot, bot), V(m, rBot * 1.08, bot - 0.05)); tri(ctx, V(a, rTop, top), V(m, rBot * 1.08, bot - 0.05), V(a, rBot, bot)); } });
    ctx.color('oklch(0.5 0.12 145)'); // a leafy belt with three blooms at the front
    for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832; leaf(ctx, V(a, 0.145, y0 + 0.02), [Math.cos(a + 1.5), -0.1, Math.sin(a + 1.5)], 0.06, LEAF[i % 2]); }
    for (const [dx, col] of [[-0.05, PET[0]], [0, PET[4]], [0.05, PET[1]]]) blossom(ctx, [dx, y0 + 0.02, -0.15], 0, 0.03, col, HEART);
    return;
  }
}
