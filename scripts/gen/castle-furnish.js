// Castle furnishings, one script, params.item picks the piece. Frame: back against +Z (the wall), front −Z, feet on the floor.
const box = (ctx, cx, y0, cz, w, h, d) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, y1 = y0 + h, z0 = cz - d / 2, z1 = cz + d / 2;
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0); // top
  ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1); // bottom
  ctx.quad(x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0); // front (−z)
  ctx.quad(x1, y0, z1, x1, y1, z1, x0, y1, z1, x0, y0, z1); // back
  ctx.quad(x0, y0, z1, x0, y1, z1, x0, y1, z0, x0, y0, z0); // left
  ctx.quad(x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1); // right
};
const cyl = (ctx, cx, y0, cz, r, h, n = 10) => {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * 6.2832, a1 = ((i + 1) / n) * 6.2832, c0 = Math.cos(a0) * r, s0 = Math.sin(a0) * r, c1 = Math.cos(a1) * r, s1 = Math.sin(a1) * r;
    ctx.quad(cx + c0, y0, cz + s0, cx + c0, y0 + h, cz + s0, cx + c1, y0 + h, cz + s1, cx + c1, y0, cz + s1);
    ctx.tri(cx, y0 + h, cz, cx + c1, y0 + h, cz + s1, cx + c0, y0 + h, cz + s0);
  }
};
const WOOD = "oklch(0.93 0.035 65)", DARK = "oklch(0.55 0.05 50)", IRON = "oklch(0.3 0.01 60)", CLOTH = "oklch(0.62 0.14 25)", TEAL = "oklch(0.62 0.08 195)", LINEN = "oklch(0.95 0.02 85)", BRASS = "oklch(0.78 0.12 80)";
const woodTex = "cdn/texture-dark-walnut-wood-grain.png";
const BOOKS = ["oklch(0.5 0.12 25)", "oklch(0.5 0.08 150)", "oklch(0.45 0.08 250)", "oklch(0.7 0.1 80)", "oklch(0.4 0.05 40)", "oklch(0.6 0.08 195)"];

const items = {
  torch(ctx) {
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.5);
    box(ctx, 0, 0, 0.02, 0.12, 0.3, 0.04); box(ctx, 0, 0.12, -0.12, 0.04, 0.04, 0.26);
    cyl(ctx, 0, 0.1, -0.25, 0.05, 0.28, 8);
    ctx.metalness(0); ctx.color(DARK); cyl(ctx, 0, 0.38, -0.25, 0.06, 0.06, 8);
    ctx.color("oklch(0.85 0.17 60)"); ctx.emissive(3, 1.6, 0.4);
    for (let i = 0; i < 3; i++) { const a = i * 2.1; ctx.tri(0, 0.44, -0.25, Math.cos(a) * 0.06, 0.44, -0.25 + Math.sin(a) * 0.06, 0, 0.72, -0.25); ctx.tri(0, 0.44, -0.25, 0, 0.72, -0.25, Math.cos(a) * 0.06, 0.44, -0.25 + Math.sin(a) * 0.06); }
    ctx.emissive(null);
  },
  bookcase(ctx) {
    const { w = 1.6, h = 2.4, d = 0.42 } = ctx.params;
    ctx.albedo(woodTex); ctx.color(WOOD);
    box(ctx, -w / 2 + 0.04, 0, 0, 0.08, h, d); box(ctx, w / 2 - 0.04, 0, 0, 0.08, h, d);
    box(ctx, 0, h - 0.06, 0, w, 0.08, d + 0.04); box(ctx, 0, 0.17, d / 2 - 0.02, w - 0.1, h - 0.3, 0.04);
    const rows = 5;
    for (let r = 0; r < rows; r++) box(ctx, 0, 0.08 + r * ((h - 0.2) / rows), 0, w - 0.1, 0.05, d);
    ctx.albedo(null);
    for (let r = 0; r < rows - (ctx.lod > 2 ? 5 : 0); r++) {
      let x = -w / 2 + 0.1; const y = 0.13 + r * ((h - 0.2) / rows);
      while (x < w / 2 - 0.12) {
        const bw = 0.03 + ctx.random() * 0.04, bh = 0.24 + ctx.random() * 0.12;
        if (ctx.random() < 0.08) { x += 0.08; continue; }
        ctx.color(BOOKS[Math.floor(ctx.random() * BOOKS.length)]);
        box(ctx, x + bw / 2, y, 0.02, bw, bh, 0.26); x += bw + 0.004;
      }
    }
  },
  bed(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD);
    const W = 1.6, L = 2.1;
    for (const sx of [-1, 1]) for (const sz of [0, 1]) box(ctx, sx * (W / 2 - 0.05), 0, sz ? 0.05 : -L + 0.05, 0.1, sz ? 2.2 : 1.9, 0.1);
    box(ctx, 0, 0.25, -L / 2, W, 0.2, L); box(ctx, 0, 0.45, 0.02, W - 0.1, 0.9, 0.06);
    for (const sx of [-1, 1]) box(ctx, sx * (W / 2 - 0.05), 1.85, -L / 2, 0.08, 0.08, L);
    box(ctx, 0, 1.85, -L + 0.05, W, 0.08, 0.08); box(ctx, 0, 2.15, 0.05, W, 0.08, 0.08);
    ctx.albedo(null); ctx.color(LINEN); box(ctx, 0, 0.45, -L / 2, W - 0.14, 0.18, L - 0.1);
    ctx.color(CLOTH); box(ctx, 0, 0.5, -L / 2 - 0.3, W - 0.1, 0.16, L - 0.7);
    ctx.color(LINEN); box(ctx, -0.35, 0.63, -0.25, 0.55, 0.14, 0.34); box(ctx, 0.35, 0.63, -0.25, 0.55, 0.14, 0.34);
    ctx.color(CLOTH); box(ctx, 0, 1.2, 0.0, W, 0.9, 0.03); for (const sx of [-1, 1]) box(ctx, sx * (W / 2 + 0.02), 1.2, -L / 2, 0.03, 0.7, L - 0.2);
  },
  chest(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD); box(ctx, 0, 0, 0, 1.0, 0.5, 0.55); ctx.albedo(null);
    ctx.color(DARK); box(ctx, 0, 0.5, 0, 1.02, 0.14, 0.57);
    ctx.color(IRON); ctx.metalness(0.6);
    for (const x of [-0.35, 0.35]) box(ctx, x, 0, 0, 0.06, 0.66, 0.58);
    ctx.color(BRASS); box(ctx, 0, 0.36, -0.29, 0.1, 0.14, 0.02);
  },
  table(ctx) {
    const { w = 1.8, d = 0.9, h = 0.78 } = ctx.params;
    ctx.albedo(woodTex); ctx.color(WOOD);
    box(ctx, 0, h - 0.07, 0, w, 0.07, d);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.1), 0, sz * (d / 2 - 0.1), 0.09, h - 0.07, 0.09);
    box(ctx, 0, 0.15, 0, w - 0.25, 0.06, 0.06); ctx.albedo(null);
    if (ctx.params.map) { ctx.color("oklch(0.9 0.05 85)"); box(ctx, 0, h, 0, w * 0.8, 0.005, d * 0.75); ctx.color(TEAL); box(ctx, -0.2, h + 0.005, 0.05, w * 0.35, 0.002, d * 0.35); ctx.color(IRON); cyl(ctx, 0.4, h, -0.1, 0.03, 0.08, 6); cyl(ctx, -0.5, h, 0.2, 0.03, 0.08, 6); }
    if (ctx.params.books) { for (let i = 0; i < 3; i++) { ctx.color(BOOKS[i]); box(ctx, -0.5 + i * 0.05, h, 0.1, 0.3, 0.05, 0.22); } ctx.color(LINEN); box(ctx, 0.3, h, -0.05, 0.4, 0.02, 0.28); }
    if (ctx.params.candle) { ctx.color(BRASS); cyl(ctx, 0.6, h, 0.2, 0.06, 0.02, 8); ctx.color(LINEN); cyl(ctx, 0.6, h + 0.02, 0.2, 0.025, 0.18, 6); ctx.color("oklch(0.85 0.17 60)"); ctx.emissive(3, 1.6, 0.4); cyl(ctx, 0.6, h + 0.2, 0.2, 0.01, 0.04, 4); ctx.emissive(null); }
  },
  bench(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD); const w = ctx.params.w ?? 1.6;
    box(ctx, 0, 0.42, 0, w, 0.06, 0.36); for (const sx of [-1, 1]) box(ctx, sx * (w / 2 - 0.12), 0, 0, 0.06, 0.42, 0.32);
  },
  workbench(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD);
    box(ctx, 0, 0.86, 0, 2.0, 0.1, 0.8);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * 0.9, 0, sz * 0.32, 0.12, 0.86, 0.12);
    box(ctx, 0, 0.2, 0, 1.9, 0.05, 0.7);
    box(ctx, 0, 0.96, 0.36, 2.0, 1.2, 0.05);
    ctx.albedo(null); ctx.color(IRON); ctx.metalness(0.6);
    for (let i = 0; i < 6; i++) { box(ctx, -0.8 + i * 0.3, 1.5, 0.32, 0.03, 0.3, 0.03); box(ctx, -0.8 + i * 0.3, 1.78, 0.3, 0.1, 0.05, 0.03); }
    box(ctx, 0.75, 0.96, -0.2, 0.25, 0.15, 0.12); // vice
    ctx.metalness(0); ctx.color(DARK); box(ctx, -0.4, 0.96, -0.1, 0.5, 0.04, 0.2); box(ctx, 0.1, 0.96, 0.05, 0.12, 0.25, 0.12);
  },
  anvil(ctx) {
    ctx.color(DARK); ctx.albedo(woodTex); cyl(ctx, 0, 0, 0, 0.3, 0.5, 10); ctx.albedo(null);
    ctx.color(IRON); ctx.metalness(0.7); box(ctx, 0, 0.5, 0, 0.2, 0.2, 0.3); box(ctx, 0, 0.7, 0, 0.3, 0.12, 0.6);
    ctx.tri(0.15, 0.82, -0.3, -0.15, 0.82, -0.3, 0, 0.8, -0.55); ctx.tri(-0.15, 0.7, -0.3, 0.15, 0.7, -0.3, 0, 0.8, -0.55);
  },
  barrel(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD);
    const n = 12, rs = [0.3, 0.36, 0.38, 0.36, 0.3], hs = [0, 0.25, 0.45, 0.65, 0.9];
    for (let k = 0; k < 4; k++) for (let i = 0; i < n; i++) {
      const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832;
      ctx.quad(Math.cos(a0) * rs[k], hs[k], Math.sin(a0) * rs[k], Math.cos(a0) * rs[k + 1], hs[k + 1], Math.sin(a0) * rs[k + 1], Math.cos(a1) * rs[k + 1], hs[k + 1], Math.sin(a1) * rs[k + 1], Math.cos(a1) * rs[k], hs[k], Math.sin(a1) * rs[k]);
    }
    for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832; ctx.tri(0, 0.9, 0, Math.cos(a1) * 0.3, 0.9, Math.sin(a1) * 0.3, Math.cos(a0) * 0.3, 0.9, Math.sin(a0) * 0.3); }
    ctx.albedo(null); ctx.color(IRON); for (const y of [0.12, 0.72]) cyl(ctx, 0, y, 0, 0.365, 0.05, 12);
  },
  rack(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD);
    box(ctx, 0, 0, 0.05, 1.4, 0.1, 0.3); box(ctx, 0, 1.2, 0.12, 1.4, 0.08, 0.1); for (const sx of [-1, 1]) box(ctx, sx * 0.65, 0, 0.12, 0.08, 1.4, 0.08);
    ctx.albedo(null);
    for (let i = 0; i < 4; i++) {
      const x = -0.45 + i * 0.3;
      ctx.color(IRON); ctx.metalness(0.7); box(ctx, x, 0.1, 0.05, 0.05, 1.5, 0.015);
      ctx.metalness(0); ctx.color(DARK); box(ctx, x, 0.95, 0.05, 0.2, 0.04, 0.04);
    }
    ctx.color(CLOTH); box(ctx, 0, 0.1, -0.02, 0.5, 0.7, 0.06);
  },
  telescope(ctx) {
    ctx.albedo(woodTex); ctx.color(WOOD);
    for (let i = 0; i < 3; i++) { const a = i * 2.094; const fx = Math.cos(a) * 0.4, fz = Math.sin(a) * 0.4; ctx.quad(fx - 0.03, 0, fz, fx + 0.03, 0, fz, 0.02, 1.1, 0, -0.02, 1.1, 0); ctx.quad(-0.02, 1.1, 0, 0.02, 1.1, 0, fx + 0.03, 0, fz, fx - 0.03, 0, fz); }
    ctx.albedo(null); ctx.color(BRASS); ctx.metalness(0.8); ctx.roughness(0.3);
    const seg = (r, z0, z1, y0, y1) => { for (let i = 0; i < 10; i++) { const a0 = i / 10 * 6.2832, a1 = (i + 1) / 10 * 6.2832; ctx.quad(Math.cos(a0) * r, y0 + Math.sin(a0) * r, z0, Math.cos(a1) * r, y0 + Math.sin(a1) * r, z0, Math.cos(a1) * r, y1 + Math.sin(a1) * r, z1, Math.cos(a0) * r, y1 + Math.sin(a0) * r, z1); } };
    seg(0.07, 0.5, -0.2, 1.05, 1.25); seg(0.055, -0.2, -0.7, 1.25, 1.39); seg(0.04, 0.5, 0.7, 1.05, 1.0);
  },
  banner(ctx) {
    const { w = 1.1, h = 2.4, color = CLOTH } = ctx.params;
    ctx.color(IRON); box(ctx, 0, h, 0.05, w + 0.2, 0.05, 0.05);
    ctx.color(color);
    const n = 6; for (let i = 0; i < n; i++) { const x0 = -w / 2 + i * w / n, x1 = x0 + w / n, z0 = Math.sin(i) * 0.03, z1 = Math.sin(i + 1) * 0.03; ctx.quad(x0, 0.35, z0, x1, 0.35, z1, x1, h, z1, x0, h, z0); ctx.quad(x1, 0.35, z1, x0, 0.35, z0, x0, h, z0, x1, h, z1); }
    ctx.tri(-w / 2, 0.35, 0, 0, 0.05, 0, w / 2, 0.35, Math.sin(n) * 0.03); ctx.tri(w / 2, 0.35, Math.sin(n) * 0.03, 0, 0.05, 0, -w / 2, 0.35, 0);
    ctx.color(BRASS); ctx.emissive(0.3, 0.25, 0.05); box(ctx, 0, h * 0.5, -0.04, w * 0.4, w * 0.4, 0.01); ctx.emissive(null);
  },
  flag(ctx) {
    ctx.color(IRON); ctx.metalness(0.5); cyl(ctx, 0, 0, 0, 0.05, 6, 8); ctx.metalness(0);
    ctx.color(TEAL); for (let i = 0; i < 6; i++) { const x0 = 0.05 + i * 0.3, x1 = x0 + 0.3, z0 = Math.sin(i * 1.3) * 0.12, z1 = Math.sin((i + 1) * 1.3) * 0.12; ctx.quad(x0, 4.8, z0, x1, 4.8, z1, x1, 5.9, z1, x0, 5.9, z0); ctx.quad(x1, 4.8, z1, x0, 4.8, z0, x0, 5.9, z0, x1, 5.9, z1); }
  },
  rug(ctx) {
    const { rx = 1.6, rz = 1.1, color = CLOTH } = ctx.params, n = 24;
    ctx.color(color);
    for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832; ctx.tri(0, 0.012, 0, Math.cos(a1) * rx, 0.012, Math.sin(a1) * rz, Math.cos(a0) * rx, 0.012, Math.sin(a0) * rz); }
    ctx.color(LINEN);
    for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, a1 = (i + 1) / n * 6.2832, k = 0.8; ctx.quad(Math.cos(a0) * rx * k, 0.016, Math.sin(a0) * rz * k, Math.cos(a0) * rx * k * 0.93, 0.016, Math.sin(a0) * rz * k * 0.93, Math.cos(a1) * rx * k * 0.93, 0.016, Math.sin(a1) * rz * k * 0.93, Math.cos(a1) * rx * k, 0.016, Math.sin(a1) * rz * k); }
  },
  plaque(ctx) { ctx.albedo(woodTex); ctx.color(WOOD); box(ctx, 0, 0, 0.02, 1.0, 0.3, 0.04); }
};

export function geometry(ctx) {
  ctx.flat(); ctx.roughness(0.85);
  (items[ctx.params.item] || items.chest)(ctx);
}
const SOLID = { bed: [1.6, 2.2, 2.1], chest: [1.0, 0.64, 0.57], workbench: [2.0, 1.0, 0.8], anvil: [0.6, 0.82, 0.6], barrel: [0.76, 0.9, 0.76], bookcase: [1.6, 2.4, 0.42], rack: [1.4, 1.4, 0.3], telescope: [0.8, 1.2, 0.8] };
export function collider(ctx) {
  const it = ctx.params.item;
  if (it === "table") return { kind: "box", width: ctx.params.w ?? 1.8, height: ctx.params.h ?? 0.78, depth: ctx.params.d ?? 0.9 };
  if (it === "bench") return { kind: "box", width: ctx.params.w ?? 1.6, height: 0.48, depth: 0.36 };
  const s = SOLID[it];
  if (!s) return null;
  const off = it === "bed" ? -1.05 : 0;
  if (off) { const w = s[0] / 2, h = s[1], z0 = off - s[2] / 2, z1 = off + s[2] / 2;
    box(ctx, 0, 0, off, s[0], 0.63, s[2]); box(ctx, 0, 0.63, 0.02, w * 2, 1.5, 0.1); return; }
  return { kind: "box", width: s[0], height: s[1], depth: s[2] };
}
