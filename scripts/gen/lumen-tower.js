// Lumenvale tower: a slender octagonal moonstone shaft, gold bands and a balcony, slit windows, a pale-gold spire roof and a
// floating glowing crystal cap. params: height, radius, cap "teal"|"lilac".
import { kit, C, TEX, GLOW, HUE, yawToward } from "./lumen-kit.js";
export function geometry(ctx) {
  const p = ctx.params, K = kit(ctx), L = ctx.lod, h = +p.height || 24, r = +p.radius || 3, n = L >= 5 ? 4 : 8, ph = Math.PI / n;
  const hue = p.cap === "lilac" ? "lilac" : "teal", rAt = (y) => r - (r * 0.14) * (y / h), rt = rAt(h);
  K.tex(TEX.stone).paint(C.plinth); K.prism(0, 0, r + 0.6, r + 0.5, 0, 0.8, n, ph, "t");
  K.paint(C.stone); K.prism(0, 0, r, rt, 0.8, h, n, ph, "");
  if (L <= 3) { K.paint(C.trim, null, 0.5, 0.2); for (const y of [h * 0.33, h * 0.66]) K.prism(0, 0, rAt(y) + 0.12, rAt(y) + 0.12, y, y + 0.3, n, ph, "tb"); }
  if (L <= 2) {
    const yb = h - 3.2, rb = rAt(yb);
    K.paint(C.quoin, null, 0.7); K.prism(0, 0, rb + 0.9, rb + 0.9, yb, yb + 0.35, n, ph, "tb");
    K.paint(C.stone); K.prism(0, 0, rb + 0.85, rb + 0.85, yb + 0.35, yb + 1.1, n, ph, "");
    K.paint(C.trim, null, 0.5, 0.2); K.annulus(0, 0, rb + 0.7, rb + 0.95, yb + 1.1, yb + 1.2, n, ph);
    for (const [lv, y] of [[0, 4], [1, h * 0.45], [2, h * 0.72]]) for (let k = lv % 2; k < 8; k += 2) {
      const a = (k + 1) * Math.PI / 4, ap = rAt(y) * Math.cos(Math.PI / 8); K.at(0, 0, 0, yawToward(Math.cos(a), Math.sin(a)));
      K.tex(null).paint(C.glass, null, 0.15, 0.3); K.box(-0.28, y, -ap - 0.05, 0.28, y + 1.5, -ap + 0.02, "kb");
      K.tex(TEX.stone).paint(C.trim, null, 0.5, 0.2); K.box(-0.4, y + 1.5, -ap - 0.1, 0.4, y + 1.7, -ap + 0.02, "k"); K.box(-0.4, y - 0.12, -ap - 0.12, 0.4, y, -ap + 0.02, "k"); }
    K.at(0, 0, 0, yawToward(0, -1)); const ap0 = r * Math.cos(Math.PI / 8);
    K.tex(null).paint(C.wood, null, 0.7); K.box(-0.55, 0.8, -ap0 - 0.08, 0.55, 3.0, -ap0 + 0.02, "kb");
    K.tex(TEX.stone).paint(C.trim, null, 0.5, 0.2); K.box(-0.75, 3.0, -ap0 - 0.14, 0.75, 3.3, -ap0 + 0.02, "k"); K.at();
  }
  K.tex(TEX.roof).paint(C.roof, null, 0.6, 0.15); K.prism(0, 0, rt + 0.5, rt + 0.5, h, h + 0.25, n, ph, "tb"); K.cone(0, 0, rt + 0.45, h + 0.25, h + 3.4, n, ph);
  K.tex(null).paint(HUE[hue], GLOW[hue], 0.2); K.bipyr(0, h + 5.4, 0, 0.9, 2.6, 1.3, L >= 4 ? 4 : 6);
  if (L <= 2) for (let k = 0; k < 3; k++) { const a = k * 2.094; K.bipyr(Math.cos(a) * 1.9, h + 5 + k * 0.5, Math.sin(a) * 1.9, 0.18, 0.45, 0.25, 4); }
}
export function collider(ctx) {
  const p = ctx.params, K = kit(ctx, true), h = +p.height || 24, r = +p.radius || 3;
  K.prism(0, 0, r + 0.6, r + 0.5, 0, 0.8, 8, Math.PI / 8, "t"); K.prism(0, 0, r, r * 0.86, 0.8, h, 8, Math.PI / 8, "t");
}
