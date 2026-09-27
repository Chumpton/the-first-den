// A clump of wildflowers for the understory: thin stems, a few leaves, star-petalled heads in one colour family.
// params: hue (oklch hue of the petals), chroma, light, height (m), heads (count), petals (count per head). Feet on the ground.
const TAU = Math.PI * 2;
export function geometry(ctx) {
  ctx.flat();
  const p = ctx.params, hue = p.hue ?? 320, ch = p.chroma ?? 0.16, L = p.light ?? 0.72, H = p.height ?? 0.4, heads = p.heads ?? 7, np = p.petals ?? 5;
  const lod = ctx.lod ?? 1, n = lod >= 4 ? Math.ceil(heads / 2) : heads;
  for (let i = 0; i < n; i++) {
    const a = ctx.random() * TAU, r = 0.04 + ctx.random() * 0.2, x = Math.cos(a) * r, z = Math.sin(a) * r, h = H * (0.65 + ctx.random() * 0.5);
    const lean = (ctx.random() - 0.5) * 0.12, tx = x + lean, tz = z + lean * 0.5, w = 0.008;
    ctx.color("oklch(0.5 0.1 135)"); ctx.roughness(0.9);
    ctx.quad(x - w, 0, z, x + w, 0, z, tx + w, h, tz, tx - w, h, tz);
    ctx.quad(x + w, 0, z, x - w, 0, z, tx - w, h, tz, tx + w, h, tz);
    if (lod <= 2) { const ly = h * 0.35, la = ctx.random() * TAU, lx = Math.cos(la) * 0.09, lz = Math.sin(la) * 0.09;
      ctx.color("oklch(0.55 0.12 140)");
      ctx.tri(x, ly, z, x + lx, ly + 0.05, z + lz, x + lz * 0.3, ly + 0.08, z - lx * 0.3);
      ctx.tri(x, ly, z, x + lz * 0.3, ly + 0.08, z - lx * 0.3, x + lx, ly + 0.05, z + lz); }
    const pr = 0.035 + ctx.random() * 0.025, rot = ctx.random() * TAU;
    ctx.color(`oklch(${(L + (ctx.random() - 0.5) * 0.08).toFixed(3)} ${ch} ${hue + (ctx.random() - 0.5) * 20})`); ctx.roughness(0.7);
    for (let k = 0; k < np; k++) { const t0 = rot + (k / np) * TAU, t1 = t0 + TAU / np * 0.5, t2 = t0 - TAU / np * 0.5;
      const ox = Math.cos(t0) * pr, oz = Math.sin(t0) * pr, sx = Math.cos(t1) * pr * 0.35, sz = Math.sin(t1) * pr * 0.35, qx = Math.cos(t2) * pr * 0.35, qz = Math.sin(t2) * pr * 0.35;
      ctx.tri(tx, h, tz, tx + qx, h + 0.004, tz + qz, tx + ox, h + 0.012, tz + oz);
      ctx.tri(tx, h, tz, tx + ox, h + 0.012, tz + oz, tx + sx, h + 0.004, tz + sz);
      ctx.tri(tx, h - 0.003, tz, tx + ox, h + 0.009, tz + oz, tx + qx, h + 0.001, tz + qz);
      ctx.tri(tx, h - 0.003, tz, tx + sx, h + 0.001, tz + sz, tx + ox, h + 0.009, tz + oz); }
    ctx.color("oklch(0.82 0.15 85)"); const c = pr * 0.3;
    ctx.tri(tx - c, h + 0.016, tz, tx + c, h + 0.016, tz - c, tx + c, h + 0.016, tz + c);
    ctx.tri(tx - c, h + 0.013, tz, tx + c, h + 0.013, tz + c, tx + c, h + 0.013, tz - c);
  }
}
