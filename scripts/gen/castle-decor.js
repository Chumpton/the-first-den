import { softened } from "./soften.js";
// Castle decor, one script, params.item picks the piece: teleport pads, carpets, painting frames, hanging and potted plants,
// flower vases, candle chandeliers. Frame: back against +Z (the wall), front −Z (toward the keep's heart), feet on the floor.
const box = (ctx, cx, y0, cz, w, h, d) => {
  const x0 = cx - w / 2, x1 = cx + w / 2, y1 = y0 + h, z0 = cz - d / 2, z1 = cz + d / 2;
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0);
  ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1);
  ctx.quad(x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0);
  ctx.quad(x1, y0, z1, x1, y1, z1, x0, y1, z1, x0, y0, z1);
  ctx.quad(x0, y0, z1, x0, y1, z1, x0, y1, z0, x0, y0, z0);
  ctx.quad(x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1);
};
const TAU = Math.PI * 2;
// a tapered tube (open top), r0 at y0, r1 at y1
const tube = (ctx, cx, cz, y0, y1, r0, r1, n = 10, cap = true) => {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
    ctx.quad(cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0, cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1, cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1, cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0);
    if (cap) ctx.tri(cx, y1, cz, cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1, cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1);
  }
};
// a flat ring on the floor at height y
const ring = (ctx, r0, r1, y, n = 24, a0 = 0, a1 = TAU) => {
  for (let i = 0; i < n; i++) {
    const b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n;
    ctx.quad(Math.cos(b0) * r1, y, Math.sin(b0) * r1, Math.cos(b0) * r0, y, Math.sin(b0) * r0, Math.cos(b1) * r0, y, Math.sin(b1) * r0, Math.cos(b1) * r1, y, Math.sin(b1) * r1);
  }
};
// a double-sided leaf: base, tip, width, with a bend
const leaf = (ctx, b, t, w, side) => {
  const mx = (b[0] + t[0]) / 2 + side[0] * w, my = (b[1] + t[1]) / 2 + side[1] * w, mz = (b[2] + t[2]) / 2 + side[2] * w;
  const nx = (b[0] + t[0]) / 2 - side[0] * w, ny = (b[1] + t[1]) / 2 - side[1] * w, nz = (b[2] + t[2]) / 2 - side[2] * w;
  ctx.tri(...b, mx, my, mz, ...t); ctx.tri(...b, ...t, mx, my, mz);
  ctx.tri(...b, ...t, nx, ny, nz); ctx.tri(...b, nx, ny, nz, ...t);
};
const IRON = "oklch(0.3 0.01 60)", STONE = "oklch(0.82 0.015 80)", TERRA = "oklch(0.62 0.11 45)", SOIL = "oklch(0.3 0.04 50)", CREAM = "oklch(0.95 0.02 85)", GOLD = "oklch(0.72 0.11 80)", FLAME = "oklch(0.88 0.15 70)";
const GREENS = ["oklch(0.62 0.14 140)", "oklch(0.55 0.13 145)", "oklch(0.7 0.15 130)", "oklch(0.48 0.11 150)"];

const items = {
  // a waystone circle: a carved limestone ring, an inlaid glowing rune band and eight marks; params.glow = [r,g,b] emissive, color = its tint
  pad(ctx) {
    const col = ctx.params.color ?? "oklch(0.8 0.12 190)", g = ctx.params.glow ?? [0.4, 1.8, 1.6], R = 0.78, lod = Number(ctx.lod ?? 1), n = lod > 2 ? 16 : 32;
    ctx.color(STONE); ctx.roughness(0.95);
    tube(ctx, 0, 0, 0, 0.07, R + 0.04, R, n, false); ring(ctx, 0, R, 0.07, n);
    ctx.color(col); ctx.emissive(...g);
    ring(ctx, R * 0.78, R * 0.88, 0.075, n); ring(ctx, R * 0.36, R * 0.42, 0.075, n);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, c = Math.cos(a), s = Math.sin(a); const r0 = R * 0.46, r1 = R * 0.72, w = 0.03;
      ctx.quad(c * r0 - s * w, 0.076, s * r0 + c * w, c * r1 - s * w, 0.076, s * r1 + c * w, c * r1 + s * w, 0.076, s * r1 - c * w, c * r0 + s * w, 0.076, s * r0 - c * w); }
    // the arrow at the heart: up or down
    const up = ctx.params.dir !== "down", t = up ? -0.2 : 0.2;
    ctx.tri(0, 0.077, t, -0.14, 0.077, -t * 0.4, 0.14, 0.077, -t * 0.4);
    ctx.tri(0, 0.077, t, 0.14, 0.077, -t * 0.4, -0.14, 0.077, -t * 0.4);
    ctx.emissive(null);
  },
  // a woven carpet: field, border, medallion, fringe. params w, d, field, border, accent, round
  carpet(ctx) {
    const { w = 2.4, d = 1.6, field = "oklch(0.52 0.13 25)", border = "oklch(0.38 0.07 250)", accent = "oklch(0.82 0.1 80)", round = false } = ctx.params;
    ctx.roughness(1);
    if (round) {
      const rx = w / 2, rz = d / 2, n = 32, e = (k, y, c) => { ctx.color(c); for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU; ctx.quad(Math.cos(a0) * rx * k[1], y, Math.sin(a0) * rz * k[1], Math.cos(a0) * rx * k[0], y, Math.sin(a0) * rz * k[0], Math.cos(a1) * rx * k[0], y, Math.sin(a1) * rz * k[0], Math.cos(a1) * rx * k[1], y, Math.sin(a1) * rz * k[1]); } };
      e([0, 1], 0.01, border); e([0.86, 0.9], 0.013, accent); e([0, 0.84], 0.012, field); e([0.3, 0.36], 0.015, accent); e([0, 0.18], 0.016, border);
      return;
    }
    const q = (x0, z0, x1, z1, y) => ctx.quad(x0, y, z0, x0, y, z1, x1, y, z1, x1, y, z0);
    ctx.color(border); q(-w / 2, -d / 2, w / 2, d / 2, 0.01);
    ctx.color(accent); q(-w / 2 + 0.12, -d / 2 + 0.12, w / 2 - 0.12, d / 2 - 0.12, 0.012);
    ctx.color(field); q(-w / 2 + 0.16, -d / 2 + 0.16, w / 2 - 0.16, d / 2 - 0.16, 0.014);
    // medallion diamond and corner lozenges
    const m = Math.min(w, d) * 0.28;
    ctx.color(accent); ctx.quad(0, 0.016, -m * 1.3, -m, 0.016, 0, 0, 0.016, m * 1.3, m, 0.016, 0);
    ctx.color(border); ctx.quad(0, 0.018, -m * 0.7, -m * 0.55, 0.018, 0, 0, 0.018, m * 0.7, m * 0.55, 0.018, 0);
    ctx.color(accent);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const cx = sx * (w / 2 - 0.4), cz = sz * (d / 2 - 0.4), s = 0.12; ctx.quad(cx, 0.016, cz - s, cx - s, 0.016, cz, cx, 0.016, cz + s, cx + s, 0.016, cz); }
    // fringe on the short ends
    ctx.color(CREAM);
    const lod = Number(ctx.lod ?? 1);
    if (lod <= 2) for (const sz of [-1, 1]) for (let x = -w / 2 + 0.05; x < w / 2; x += 0.07) ctx.quad(x, 0.008, sz * d / 2, x, 0.008, sz * (d / 2 + 0.09), x + 0.025, 0.008, sz * (d / 2 + 0.09), x + 0.025, 0.008, sz * d / 2);
  },
  // a carved gilt frame around a picture of w × h (the picture itself is the child plane)
  frame(ctx) {
    const { w = 1.0, h = 1.3 } = ctx.params, t = 0.09, d = 0.06;
    ctx.color(GOLD); ctx.metalness(0.45); ctx.roughness(0.45);
    box(ctx, 0, 0, 0, w + 2 * t, t, d); box(ctx, 0, h + t, 0, w + 2 * t, t, d);
    box(ctx, -(w + t) / 2, t, 0, t, h, d); box(ctx, (w + t) / 2, t, 0, t, h, d);
    ctx.color("oklch(0.55 0.09 70)");
    box(ctx, 0, t - 0.015, -0.01, w + 0.03, 0.02, d * 0.6); box(ctx, 0, h + t - 0.005, -0.01, w + 0.03, 0.02, d * 0.6);
    ctx.metalness(0); ctx.color("oklch(0.3 0.02 60)"); box(ctx, 0, t, 0.02, w, h, 0.01);
  },
  // a terracotta pot on three chains from the ceiling, a crown of leaves and trailing vines. top of the chain at y = chain
  hangingPlant(ctx) {
    const chain = ctx.params.chain ?? 1.0, lod = Number(ctx.lod ?? 1), vines = lod > 2 ? 4 : 8;
    ctx.roughness(0.9);
    ctx.color(IRON); ctx.metalness(0.5);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.3, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2; ctx.quad(x - 0.01, 0.24, z, x + 0.01, 0.24, z, 0.01, chain * 0.55, 0, -0.01, chain * 0.55, 0); ctx.quad(-0.01, chain * 0.55, 0, 0.01, chain * 0.55, 0, x + 0.01, 0.24, z, x - 0.01, 0.24, z); }
    box(ctx, 0, chain * 0.55, 0, 0.02, chain * 0.45, 0.02); box(ctx, 0, chain - 0.03, 0, 0.12, 0.03, 0.12);
    ctx.metalness(0);
    ctx.color(TERRA); tube(ctx, 0, 0, 0, 0.22, 0.13, 0.2, 10, false); tube(ctx, 0, 0, 0.19, 0.25, 0.21, 0.21, 10, false);
    ctx.color(SOIL); ring(ctx, 0, 0.19, 0.22, 10);
    // crown
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + ctx.random() * 0.4, l = 0.28 + ctx.random() * 0.12; ctx.color(GREENS[i % 4]);
      leaf(ctx, [0, 0.22, 0], [Math.cos(a) * l, 0.36 + ctx.random() * 0.12, Math.sin(a) * l], 0.07, [-Math.sin(a), 0, Math.cos(a)]); }
    // trailing vines over the rim, each a chain of leaf pairs
    for (let v = 0; v < vines; v++) {
      const a = v / vines * TAU + ctx.random() * 0.5, L = 0.6 + ctx.random() * 0.5, segs = 6;
      let p = [Math.cos(a) * 0.2, 0.24, Math.sin(a) * 0.2];
      for (let s = 1; s <= segs; s++) {
        const k = s / segs, out = 0.2 + Math.sin(k * 3) * 0.08, q2 = [Math.cos(a + k * 0.3) * out, 0.24 - k * L, Math.sin(a + k * 0.3) * out];
        ctx.color("oklch(0.45 0.08 140)"); ctx.quad(p[0] - 0.006, p[1], p[2], p[0] + 0.006, p[1], p[2], q2[0] + 0.006, q2[1], q2[2], q2[0] - 0.006, q2[1], q2[2]);
        ctx.color(GREENS[(v + s) % 4]);
        const side = [-Math.sin(a), 0, Math.cos(a)];
        leaf(ctx, q2, [q2[0] + side[0] * 0.09, q2[1] - 0.03, q2[2] + side[2] * 0.09], 0.03, [0, 0.5, 0]);
        leaf(ctx, q2, [q2[0] - side[0] * 0.09, q2[1] - 0.03, q2[2] - side[2] * 0.09], 0.03, [0, 0.5, 0]);
        p = q2;
      }
    }
  },
  // a floor plant in a big terracotta pot: kind fern (arching fronds) or tall (sword leaves) or olive (little tree)
  pottedPlant(ctx) {
    const kind = ctx.params.kind ?? "fern", lod = Number(ctx.lod ?? 1);
    ctx.roughness(0.9);
    ctx.color(TERRA); tube(ctx, 0, 0, 0, 0.42, 0.2, 0.28, 12, false); tube(ctx, 0, 0, 0.38, 0.46, 0.3, 0.3, 12, false); ctx.color(SOIL); ring(ctx, 0, 0.28, 0.42, 12);
    if (kind === "tall") {
      for (let i = 0; i < (lod > 2 ? 6 : 12); i++) { const a = i / 12 * TAU * 1.7 + ctx.random(), h = 0.9 + ctx.random() * 0.6, lean = 0.1 + ctx.random() * 0.15; ctx.color(GREENS[i % 4]);
        leaf(ctx, [Math.cos(a) * 0.05, 0.42, Math.sin(a) * 0.05], [Math.cos(a) * lean * 2, 0.42 + h, Math.sin(a) * lean * 2], 0.06, [-Math.sin(a), 0, Math.cos(a)]); }
      return;
    }
    if (kind === "olive") {
      ctx.color("oklch(0.45 0.04 60)"); tube(ctx, 0, 0, 0.42, 1.4, 0.05, 0.03, 6, false); tube(ctx, 0.05, 0, 1.0, 1.6, 0.03, 0.02, 5, false);
      for (let i = 0; i < (lod > 2 ? 30 : 90); i++) { const a = ctx.random() * TAU, e = ctx.random() * 1.2 - 0.3, r = 0.3 + ctx.random() * 0.25, c = [Math.cos(a) * Math.cos(e) * r, 1.55 + Math.sin(e) * r * 0.7, Math.sin(a) * Math.cos(e) * r];
        ctx.color(ctx.random() < 0.5 ? "oklch(0.62 0.07 135)" : "oklch(0.52 0.06 145)"); leaf(ctx, c, [c[0] + Math.cos(a + 1) * 0.1, c[1] - 0.03, c[2] + Math.sin(a + 1) * 0.1], 0.025, [0, 1, 0]); }
      return;
    }
    const fronds = lod > 2 ? 7 : 14;
    for (let f = 0; f < fronds; f++) {
      const a = f / fronds * TAU + ctx.random() * 0.3, L = 0.7 + ctx.random() * 0.35, segs = lod > 2 ? 4 : 7, side = [-Math.sin(a), 0, Math.cos(a)];
      let p = [0, 0.44, 0];
      for (let s = 1; s <= segs; s++) {
        const k = s / segs, q2 = [Math.cos(a) * L * k, 0.44 + Math.sin(k * 2.4) * 0.55 * L, Math.sin(a) * L * k];
        ctx.color("oklch(0.45 0.09 140)"); ctx.quad(p[0] - 0.008, p[1], p[2], p[0] + 0.008, p[1], p[2], q2[0] + 0.008, q2[1], q2[2], q2[0] - 0.008, q2[1], q2[2]);
        const lw = 0.16 * (1 - k * 0.7); ctx.color(GREENS[(f + s) % 3]);
        leaf(ctx, q2, [q2[0] + side[0] * lw, q2[1] - 0.04, q2[2] + side[2] * lw], 0.025, [0, 1, 0]);
        leaf(ctx, q2, [q2[0] - side[0] * lw, q2[1] - 0.04, q2[2] - side[2] * lw], 0.025, [0, 1, 0]);
        p = q2;
      }
    }
  },
  // a blue-and-cream jug of wildflowers: daisies and lupins
  vase(ctx) {
    ctx.roughness(0.4);
    ctx.color(CREAM); tube(ctx, 0, 0, 0, 0.14, 0.06, 0.09, 10, false); tube(ctx, 0, 0, 0.14, 0.26, 0.09, 0.045, 10, false); tube(ctx, 0, 0, 0.26, 0.3, 0.045, 0.06, 10, false);
    ctx.color("oklch(0.5 0.12 260)"); tube(ctx, 0, 0, 0.1, 0.15, 0.085, 0.092, 10, false);
    ctx.roughness(0.9);
    for (let i = 0; i < 11; i++) {
      const a = ctx.random() * TAU, lean = 0.08 + ctx.random() * 0.14, h = 0.3 + ctx.random() * 0.25, tip = [Math.cos(a) * lean, 0.3 + h, Math.sin(a) * lean];
      ctx.color("oklch(0.5 0.1 140)"); ctx.quad(-0.004, 0.28, 0, 0.004, 0.28, 0, tip[0] + 0.004, tip[1], tip[2], tip[0] - 0.004, tip[1], tip[2]); ctx.quad(0.004, 0.28, 0, -0.004, 0.28, 0, tip[0] - 0.004, tip[1], tip[2], tip[0] + 0.004, tip[1], tip[2]);
      if (i % 3 === 0) { ctx.color(["oklch(0.55 0.16 295)", "oklch(0.7 0.13 340)", "oklch(0.55 0.14 270)"][i % 3 === 0 ? (i / 3) % 3 : 0]); for (let k = 0; k < 5; k++) box(ctx, tip[0], tip[1] + k * 0.035, tip[2], 0.04 - k * 0.005, 0.03, 0.04 - k * 0.005); }
      else { ctx.color(CREAM); for (let k = 0; k < 8; k++) { const b = k / 8 * TAU; ctx.tri(tip[0], tip[1], tip[2], tip[0] + Math.cos(b) * 0.05, tip[1] + 0.01, tip[2] + Math.sin(b) * 0.05, tip[0] + Math.cos(b + 0.4) * 0.05, tip[1] + 0.01, tip[2] + Math.sin(b + 0.4) * 0.05); ctx.tri(tip[0], tip[1], tip[2], tip[0] + Math.cos(b + 0.4) * 0.05, tip[1] + 0.01, tip[2] + Math.sin(b + 0.4) * 0.05, tip[0] + Math.cos(b) * 0.05, tip[1] + 0.01, tip[2] + Math.sin(b) * 0.05); }
        ctx.color("oklch(0.8 0.16 85)"); box(ctx, tip[0], tip[1], tip[2], 0.025, 0.02, 0.025); }
    }
  },
  // an iron hoop of candles on four chains; the hoop at y 0, the hook at y = chain
  chandelier(ctx) {
    const chain = ctx.params.chain ?? 1.2, R = 0.6, n = 16;
    ctx.color(IRON); ctx.metalness(0.6); ctx.roughness(0.5);
    for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      ctx.quad(Math.cos(a0) * R, 0, Math.sin(a0) * R, Math.cos(a1) * R, 0, Math.sin(a1) * R, Math.cos(a1) * R, 0.06, Math.sin(a1) * R, Math.cos(a0) * R, 0.06, Math.sin(a0) * R);
      ctx.quad(Math.cos(a0) * R, 0.06, Math.sin(a0) * R, Math.cos(a1) * R, 0.06, Math.sin(a1) * R, Math.cos(a1) * R, 0, Math.sin(a1) * R, Math.cos(a0) * R, 0, Math.sin(a0) * R); }
    for (let i = 0; i < 4; i++) { const a = i / 4 * TAU, x = Math.cos(a) * R, z = Math.sin(a) * R; ctx.quad(x - 0.008, 0.06, z, x + 0.008, 0.06, z, 0.008, chain * 0.6, 0, -0.008, chain * 0.6, 0); ctx.quad(-0.008, chain * 0.6, 0, 0.008, chain * 0.6, 0, x + 0.008, 0.06, z, x - 0.008, 0.06, z); }
    box(ctx, 0, chain * 0.6, 0, 0.025, chain * 0.4, 0.025); box(ctx, 0, chain - 0.04, 0, 0.16, 0.04, 0.16);
    ctx.metalness(0);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2, x = Math.cos(a) * R, z = Math.sin(a) * R;
      ctx.color(IRON); tube(ctx, x, z, 0.06, 0.09, 0.05, 0.05, 6);
      ctx.color(CREAM); ctx.roughness(0.7); tube(ctx, x, z, 0.09, 0.28 - (i % 3) * 0.03, 0.025, 0.025, 6);
      const top = 0.28 - (i % 3) * 0.03; ctx.color(FLAME); ctx.emissive(3.2, 1.8, 0.5);
      ctx.tri(x - 0.018, top, z, x + 0.018, top, z, x, top + 0.07, z); ctx.tri(x + 0.018, top, z, x - 0.018, top, z, x, top + 0.07, z);
      ctx.tri(x, top, z - 0.018, x, top, z + 0.018, x, top + 0.07, z); ctx.tri(x, top, z + 0.018, x, top, z - 0.018, x, top + 0.07, z);
      ctx.emissive(null); ctx.roughness(0.5); }
  }
};

export const geometry = softened(function geometry(ctx) {
  ctx.flat(); ctx.roughness(0.85);
  if (Number(ctx.lod ?? 1) >= 4) { box(ctx, 0, 0, 0, 0.01, 0.01, 0.01); return; } // indoors: the far picture never sees it
  (items[ctx.params.item] || items.vase)(ctx);
});
export function collider(ctx) {
  const it = ctx.params.item;
  if (it === "pad") return { kind: "box", width: 1.3, height: 1.6, depth: 1.3 };
  if (it === "pottedPlant") return { kind: "box", width: 0.5, height: 0.9, depth: 0.5 };
  return null;
}
