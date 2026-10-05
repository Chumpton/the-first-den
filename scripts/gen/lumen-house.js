// Lumenvale house: moonstone walls on a footing, gold bands, arched-lintel windows, a pale-gold gable, hip or dome roof with a
// glowing crystal finial. params: floors 1-3, width, depth, roof "gable"|"hip"|"dome", glow "teal"|"lilac", kind (inn, library,
// shop, tea = ENTERABLE: an open doorway in the -Z face, a board floor, a ceiling and furnishings). Origin mid-floor at ground, door -Z.
import { kit, C, TEX, GLOW, HUE } from "./lumen-kit.js";
import { softened } from "./soften.js";
const H = 3.1, B = 0.2, E = 0.45;
function dims(p) { const w = +p.width || 8, d = +p.depth || 7, f = Math.max(1, Math.min(3, Math.round(+p.floors || 2))); return { w, d, f, top: B + f * H, dw: 1.4, dh: 2.5, t: 0.3, iw: w / 2 - 0.3, id: d / 2 - 0.3 }; }
function roofDims(D, roof) { const m = Math.min(D.w, D.d), rh = roof === "hip" ? m * 0.4 : D.d * 0.42, half = roof === "hip" ? m / 2 : D.d / 2; return { rh, ye: D.top - E * rh / half, yr: D.top + rh }; }
function walls(K, D, enter) {
  const { w, d, top, dw, dh, t } = D;
  if (!enter) { K.box(-w / 2, B, -d / 2, w / 2, top, d / 2, "b"); return; }
  K.box(-w / 2, B, d / 2 - t, w / 2, top, d / 2, "b");
  K.box(-w / 2, B, -d / 2 + t, -w / 2 + t, top, d / 2 - t, "bfk");
  K.box(w / 2 - t, B, -d / 2 + t, w / 2, top, d / 2 - t, "bfk");
  K.box(-w / 2, B, -d / 2, -dw / 2, top, -d / 2 + t, "b");
  K.box(dw / 2, B, -d / 2, w / 2, top, -d / 2 + t, "b");
  K.box(-dw / 2, B + dh, -d / 2, dw / 2, top, -d / 2 + t, "lr");
}
function roofShape(ctx, K, D, roof, L, glow, glowCol) {
  const { w, d, top } = D, W = w / 2 + E, Dd = d / 2 + E, peaks = [];
  if (roof === "dome") {
    K.tex(TEX.stone).paint(C.trim, null, 0.6); K.box(-w / 2 - 0.2, top, -d / 2 - 0.2, w / 2 + 0.2, top + 0.25, d / 2 + 0.2, "b");
    const R = Math.min(w, d) * 0.36, n = L >= 4 ? 8 : 14, y0 = top + 0.25, rows = L >= 4 ? 3 : 6, prof = [[R, y0], [R, y0 + 0.6]];
    for (let i = 1; i <= rows; i++) { const a = i / rows * Math.PI / 2; prof.push([i === rows ? 0 : R * Math.cos(a), y0 + 0.6 + R * 1.1 * Math.sin(a)]); }
    K.tex(TEX.roof).paint(C.roof, null, 0.6, 0.15); K.lathe(0, 0, prof, n);
    peaks.push([0, y0 + 0.6 + R * 1.1, 0]);
  } else {
    const { rh, ye, yr } = roofDims(D, roof);
    K.tex(TEX.roof).paint(C.roof, null, 0.7, 0.1);
    if (roof === "hip") {
      const rx = Math.max(0, (w - d) / 2), rz = Math.max(0, (d - w) / 2);
      K.q([-W, ye, -Dd], [W, ye, -Dd], [rx, yr, -rz], [-rx, yr, -rz], [0, 1, -1]);
      K.q([W, ye, Dd], [-W, ye, Dd], [-rx, yr, rz], [rx, yr, rz], [0, 1, 1]);
      K.q([-W, ye, Dd], [-W, ye, -Dd], [-rx, yr, -rz], [-rx, yr, rz], [-1, 1, 0]);
      K.q([W, ye, -Dd], [W, ye, Dd], [rx, yr, rz], [rx, yr, -rz], [1, 1, 0]);
      peaks.push([-rx, yr, -rz], [rx, yr, rz]);
      if (L <= 3 && (rx > 0 || rz > 0)) { K.tex(null).paint(C.trim, null, 0.45, 0.3); K.box(-rx - 0.12, yr - 0.06, -rz - 0.12, rx + 0.12, yr + 0.12, rz + 0.12, "b"); }
    } else {
      K.q([-W, ye, -Dd], [W, ye, -Dd], [W, yr, 0], [-W, yr, 0], [0, 1, -1]);
      K.q([W, ye, Dd], [-W, ye, Dd], [-W, yr, 0], [W, yr, 0], [0, 1, 1]);
      K.tex(TEX.stone).paint(C.stone);
      for (const sx of [-1, 1]) K.t([sx * w / 2, top, -d / 2], [sx * w / 2, top, d / 2], [sx * w / 2, yr - 0.08, 0], [sx, 0, 0]);
      if (L <= 2) { K.tex(null).paint(C.trim, null, 0.45, 0.3);
        for (const sz of [-1, 1]) K.q([-W, ye - 0.18, sz * Dd], [W, ye - 0.18, sz * Dd], [W, ye, sz * Dd], [-W, ye, sz * Dd], [0, 0, sz]);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.q([sx * W, ye - 0.18, sz * Dd], [sx * W, ye, sz * Dd], [sx * W, yr, 0], [sx * W, yr - 0.18, 0], [sx, 0, 0]); }
      if (L <= 3) { K.tex(null).paint(C.trim, null, 0.45, 0.3); K.box(-W, yr - 0.06, -0.13, W, yr + 0.13, 0.13, "b"); }
      peaks.push([-w / 2, yr, 0], [w / 2, yr, 0]);
    }
    if (L <= 2) { const cx = w * 0.28, cz = d * 0.14, ch = yr + 0.5;
      K.tex(TEX.stone).paint(C.stone); K.box(cx - 0.35, top, cz - 0.35, cx + 0.35, ch, cz + 0.35, "b");
      K.paint(C.trim, null, 0.5, 0.2); K.box(cx - 0.45, ch, cz - 0.45, cx + 0.45, ch + 0.15, cz + 0.45, "b"); }
  }
  if (L <= 3) { K.tex(null).paint(glowCol, glow, 0.2); for (const [x, y, z] of peaks) K.bipyr(x, y + 0.55, z, 0.2, 0.6, 0.3, L <= 2 ? 6 : 4); }
}
function windows(K, D, enter) {
  const { w, d, f } = D;
  const faces = [{ yaw: 0, hd: d / 2, span: w, front: true }, { yaw: 180, hd: d / 2, span: w }, { yaw: 90, hd: w / 2, span: d }, { yaw: -90, hd: w / 2, span: d }];
  for (const F of faces) { K.at(0, 0, 0, F.yaw); const n = Math.max(1, Math.floor((F.span - 1) / 2.6)), hd = F.hd;
    for (let k = 0; k < f; k++) for (let i = 0; i < n; i++) {
      const x = -F.span / 2 + F.span * (i + 0.5) / n, y = B + k * H + 0.9, ww = 0.9, wh = k === 0 ? 1.3 : 1.4;
      if (F.front && k === 0 && Math.abs(x) < 1.5) continue;
      K.tex(null).paint(C.glass, null, 0.15, 0.3); K.box(x - ww / 2, y, -hd - 0.05, x + ww / 2, y + wh, -hd, "kb");
      K.tex(TEX.stone).paint(C.quoin, null, 0.6); K.box(x - ww / 2 - 0.12, y - 0.12, -hd - 0.14, x + ww / 2 + 0.12, y, -hd, "k");
      K.paint(C.trim, null, 0.5, 0.2); K.box(x - ww / 2 - 0.1, y + wh, -hd - 0.09, x + ww / 2 + 0.1, y + wh + 0.2, -hd, "k");
      K.box(x - 0.04, y, -hd - 0.08, x + 0.04, y + wh, -hd - 0.05, "kb");
    } }
  K.at();
}
// furnishings; solid = the collider pass (only the big pieces)
function furnish(K, D, kind) {
  const { iw, id } = D, S = K.solid, P = (c, g, r, m) => K.paint(c, g, r, m);
  K.tex(null);
  if (!S) { P(C.floor, null, 0.8); K.q([-iw, B + 0.01, -id], [iw, B + 0.01, -id], [iw, B + 0.01, id], [-iw, B + 0.01, id], [0, 1, 0]);
    P(kind === "tea" ? "oklch(0.8 0.07 190)" : "oklch(0.72 0.09 305)"); K.q([-iw * 0.55, B + 0.02, -id * 0.55], [iw * 0.55, B + 0.02, -id * 0.55], [iw * 0.55, B + 0.02, id * 0.45], [-iw * 0.55, B + 0.02, id * 0.45], [0, 1, 0]); }
  const shelfWall = (yaw, hd, x0, x1, levels, item) => { K.at(0, 0, 0, yaw);
    P(C.dark, null, 0.8); K.box(x0, B, -hd, x1, B + levels[levels.length - 1] + 0.5, -hd + 0.08, "b");
    for (const ly of levels) { P(C.wood, null, 0.7); K.box(x0, B + ly - 0.04, -hd + 0.08, x1, B + ly, -hd + 0.42, "f"); if (!S) item(x0, x1, B + ly, hd); }
    K.at(); };
  if (kind === "inn") {
    P(C.dark); K.box(-iw + 0.3, B, id - 1.7, 0.8, B + 1.05, id - 1.1, "b"); P(C.wood, null, 0.6); K.box(-iw + 0.25, B + 1.05, id - 1.75, 0.85, B + 1.12, id - 1.05, "");
    P(C.stone); K.box(iw - 0.7, B, -0.9, iw, B + 1.5, 0.9, "b");
    if (S) { for (const [tx, tz] of [[-iw * 0.5, -id * 0.25], [iw * 0.4, -id * 0.05]]) K.box(tx - 0.6, B, tz - 0.6, tx + 0.6, B + 0.78, tz + 0.6, "b"); return; }
    P("oklch(0.3 0.03 40)", GLOW.warm, 0.9); K.box(iw - 0.72, B + 0.15, -0.5, iw - 0.62, B + 0.9, 0.5, "rb");
    P(C.trim, null, 0.5, 0.2); K.box(iw - 0.85, B + 1.5, -1.05, iw, B + 1.62, 1.05, "");
    P(C.wood); K.box(-iw + 0.2, B + 1.4, id - 0.35, 0.8, B + 1.46, id, "");
    const bc = ["oklch(0.7 0.13 70)", "oklch(0.62 0.12 150)", "oklch(0.65 0.12 305)"];
    for (let i = 0; i < 7; i++) { P(bc[i % 3], null, 0.2); K.prism(-iw + 0.5 + i * 0.4, id - 0.18, 0.07, 0.05, B + 1.46, B + 1.76, 6); }
    for (const [tx, tz] of [[-iw * 0.5, -id * 0.25], [iw * 0.4, -id * 0.05]]) {
      P(C.wood, null, 0.7); K.prism(tx, tz, 0.65, 0.65, B + 0.72, B + 0.78, 12, 0, "tb"); P(C.dark); K.prism(tx, tz, 0.08, 0.08, B, B + 0.72, 6, 0, "");
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4; P(C.wood); K.prism(tx + Math.cos(a) * 1.0, tz + Math.sin(a) * 1.0, 0.22, 0.2, B, B + 0.46, 8); }
      P("oklch(0.3 0.03 40)", GLOW.warm); K.prism(tx, tz, 0.06, 0.05, B + 0.78, B + 0.95, 6); }
    for (const [bx, bz] of [[iw - 0.6, id - 0.6], [iw - 1.45, id - 0.55]]) { P(C.wood); K.prism(bx, bz, 0.36, 0.4, B, B + 0.9, 10); P(C.trim, null, 0.5, 0.4); K.prism(bx, bz, 0.41, 0.41, B + 0.3, B + 0.38, 10, 0, ""); }
  } else if (kind === "library") {
    const books = (x0, x1, y) => { let x = x0 + 0.08; const bc = ["oklch(0.55 0.12 25)", "oklch(0.55 0.1 250)", "oklch(0.6 0.1 150)", "oklch(0.7 0.1 80)", "oklch(0.5 0.1 305)"]; let k = 0;
      while (x < x1 - 0.3) { const bw = 0.14 + ((k * 37) % 7) * 0.02, bh = 0.28 + ((k * 13) % 5) * 0.035; P(bc[k % 5], null, 0.7); K.box(x, y, 0, 0, 0, 0, ""); x += bw + 0.02; k++; } };
    const row = (x0, x1, y, hd) => { let x = x0 + 0.1, k = 0; const bc = ["oklch(0.55 0.12 25)", "oklch(0.55 0.1 250)", "oklch(0.6 0.1 150)", "oklch(0.7 0.1 80)", "oklch(0.5 0.1 305)"];
      while (x < x1 - 0.25 && k < 9) { const bw = 0.16 + ((k * 37) % 7) * 0.025, bh = 0.26 + ((k * 13) % 5) * 0.04; P(bc[(k + Math.round(y * 3)) % 5], null, 0.7); K.box(x, y, -hd + 0.12, x + bw, y + bh, -hd + 0.4, "fb"); x += bw + 0.05 + ((k * 7) % 3) * 0.06; k++; } };
    void books;
    shelfWall(90, iw, -id + 0.7, id - 0.6, [0.4, 1.0, 1.6, 2.2], row);
    shelfWall(-90, iw, -id + 0.6, id - 0.7, [0.4, 1.0, 1.6, 2.2], row);
    shelfWall(180, id, -iw + 0.6, iw - 0.6, [0.4, 1.0, 1.6, 2.2], row);
    P(C.wood, null, 0.6); K.box(-1, B + 0.72, -0.9, 1, B + 0.8, -0.1, S ? "b" : "");
    if (S) return;
    P(C.dark); for (const [lx, lz] of [[-0.9, -0.8], [0.9, -0.8], [-0.9, -0.2], [0.9, -0.2]]) K.box(lx - 0.05, B, lz - 0.05, lx + 0.05, B + 0.72, lz + 0.05, "b");
    P(C.lilac, GLOW.lilac, 0.2); K.bipyr(0.4, B + 1.05, -0.5, 0.12, 0.25, 0.12, 6); P(C.trim, null, 0.4, 0.5); K.prism(0.4, -0.5, 0.1, 0.08, B + 0.8, B + 0.9, 6);
    P("oklch(0.93 0.02 90)"); K.box(-0.6, B + 0.8, -0.65, -0.1, B + 0.83, -0.3, "b");
  } else if (kind === "shop") {
    P(C.dark); K.box(-iw * 0.6, B, 0.2, iw * 0.6, B + 1, 0.8, "b"); P(C.wood, null, 0.6); K.box(-iw * 0.6 - 0.05, B + 1, 0.15, iw * 0.6 + 0.05, B + 1.07, 0.85, "");
    P("oklch(0.3 0.02 250)", null, 0.5, 0.4); K.prism(iw - 1.1, -id + 1.4, 0.6, 0.5, B, B + 0.75, 10, 0, "b");
    const hues = ["teal", "lilac", "rose", "gold", "green"];
    const pots = (x0, x1, y, hd) => { for (let k = 0, x = x0 + 0.25; x < x1 - 0.15 && k < 9; k++, x += 0.3 + (k % 3) * 0.05) { const h = hues[(k + Math.round(y * 5)) % 5]; P(HUE[h], GLOW[h], 0.15); K.prism(x, -hd + 0.25, 0.08, 0.05, y, y + 0.2 + (k % 2) * 0.08, 6); P(C.trim, null, 0.4, 0.5); K.prism(x, -hd + 0.25, 0.03, 0.03, y + 0.2 + (k % 2) * 0.08, y + 0.28 + (k % 2) * 0.08, 4); } };
    shelfWall(180, id, -iw + 0.5, iw - 0.5, [0.9, 1.5, 2.1], pots);
    shelfWall(90, iw, -id + 0.8, id - 0.6, [1.1, 1.8], pots);
    if (S) return;
    P(HUE.green, GLOW.green, 0.2); K.prism(iw - 1.1, -id + 1.4, 0.5, 0.5, B + 0.68, B + 0.7, 10, 0, "t");
    for (let k = 0; k < 3; k++) { const h = ["lilac", "teal", "rose"][k]; P(HUE[h], GLOW[h], 0.2); K.bipyr(-1 + k, B + 2.35, -0.6 + (k % 2) * 0.6, 0.12, 0.3, 0.18, 5); }
    P("oklch(0.93 0.02 90)"); K.box(-0.3, B + 1.07, 0.35, 0.2, B + 1.1, 0.65, "b");
  } else if (kind === "tea") {
    const tables = [[-iw * 0.45, -id * 0.3], [iw * 0.45, -id * 0.3], [0, id * 0.15]];
    P(C.wood); K.box(-iw + 0.3, B, id - 0.9, iw - 0.3, B + 0.95, id - 0.3, "b");
    for (const [tx, tz] of tables) { P(C.dark); K.box(tx - 0.3, B, tz - 0.3, tx + 0.3, B + 0.32, tz + 0.3, "b"); P(C.wood, null, 0.6); K.box(tx - 0.55, B + 0.32, tz - 0.55, tx + 0.55, B + 0.4, tz + 0.55, S ? "b" : ""); }
    if (S) return;
    const cc = ["oklch(0.78 0.08 190)", "oklch(0.76 0.09 305)", "oklch(0.8 0.08 350)", "oklch(0.85 0.08 85)"];
    for (const [tx, tz] of tables) for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, cx = tx + Math.cos(a) * 0.85, cz = tz + Math.sin(a) * 0.85; P(cc[k], null, 0.95); K.box(cx - 0.25, B, cz - 0.25, cx + 0.25, B + 0.13, cz + 0.25, "b"); }
    for (const [tx, tz] of tables) { P("oklch(0.9 0.03 190)", null, 0.3); K.prism(tx, tz, 0.12, 0.1, B + 0.4, B + 0.55, 8); K.cone(tx, tz, 0.08, B + 0.55, B + 0.63, 8); }
    for (let k = 0; k < 3; k++) { P("oklch(0.9 0.03 190)", null, 0.3); K.prism(-iw + 1 + k * 0.7, id - 0.6, 0.13, 0.11, B + 0.95, B + 1.13, 8); }
    for (const [lx, lz] of [[-iw * 0.45, -id * 0.3], [iw * 0.45, -id * 0.3], [0, id * 0.15], [0, -id * 0.6]]) {
      P("oklch(0.95 0.05 80)", GLOW.warm, 0.9); K.prism(lx, lz, 0.18, 0.2, B + 2.05, B + 2.45, 8, 0, "tb"); P(C.dark); K.box(lx - 0.01, B + 2.45, lz - 0.01, lx + 0.01, B + H - 0.2, lz + 0.01, "tb"); }
    for (const px of [-iw + 0.5, iw - 0.5]) { P("oklch(0.6 0.08 40)"); K.prism(px, -id + 0.5, 0.22, 0.18, B, B + 0.4, 8); P(C.hedge); K.bipyr(px, B + 0.75, -id + 0.5, 0.35, 0.45, 0.35, 6); }
  }
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params, D = dims(p), { w, d, top, dw, dh } = D, K = kit(ctx), L = ctx.lod, enter = !!p.kind, roof = p.roof || "gable";
  const hue = p.glow === "lilac" ? "lilac" : "teal", glow = GLOW[hue], glowCol = HUE[hue];
  if (L >= 4) { K.tex(TEX.stone).paint(C.stone); K.box(-w / 2, 0, -d / 2, w / 2, top, d / 2, "b"); roofShape(ctx, K, D, roof, L, glow, glowCol); return; }
  K.tex(TEX.stone).paint(C.plinth); K.box(-w / 2 - 0.25, 0, -d / 2 - 0.25, w / 2 + 0.25, B, d / 2 + 0.25, "b");
  K.box(-1.1, 0, -d / 2 - 0.8, 1.1, 0.1, -d / 2 - 0.25, "b");
  K.paint(C.stone); walls(K, D, enter);
  if (enter) { K.tex(null).paint(C.wood, null, 0.8); K.box(-w / 2 + 0.3, B + H - 0.2, -d / 2 + 0.3, w / 2 - 0.3, B + H - 0.02, d / 2 - 0.3, "t"); }
  if (L <= 2) {
    K.tex(TEX.stone).paint(C.quoin, null, 0.7);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) K.box(sx * w / 2 - 0.22, B, sz * d / 2 - 0.22, sx * w / 2 + 0.22, top, sz * d / 2 + 0.22, "b");
    K.paint(C.trim, null, 0.5, 0.2);
    for (let k = 1; k <= D.f; k++) { const y = B + k * H; K.box(-w / 2 - 0.1, y - 0.16, -d / 2 - 0.1, w / 2 + 0.1, y, d / 2 + 0.1, ""); }
    windows(K, D, enter);
  }
  K.tex(TEX.stone).paint(C.trim, null, 0.5, 0.2);
  if (enter) {
    K.box(-dw / 2 - 0.2, B, -d / 2 - 0.1, -dw / 2, B + dh + 0.2, -d / 2, "kb"); K.box(dw / 2, B, -d / 2 - 0.1, dw / 2 + 0.2, B + dh + 0.2, -d / 2, "kb");
    K.box(-dw / 2 - 0.3, B + dh, -d / 2 - 0.14, dw / 2 + 0.3, B + dh + 0.3, -d / 2, "k");
    if (L <= 2) { K.tex(null).paint(HUE.warm, GLOW.warm, 0.3); K.bipyr(0, B + dh + 0.75, -d / 2 - 0.25, 0.12, 0.25, 0.15, 6); }
  } else {
    K.box(-0.8, B, -d / 2 - 0.1, 0.8, B + 2.55, -d / 2, "kb");
    K.tex(null).paint(C.wood, null, 0.7); K.box(-0.6, B, -d / 2 - 0.14, 0.6, B + 2.3, -d / 2 - 0.1, "kb");
  }
  roofShape(ctx, K, D, roof, L, glow, glowCol);
  if (enter && L <= 2) furnish(K, D, p.kind);
});
export function collider(ctx) {
  const p = ctx.params, D = dims(p), K = kit(ctx, true), { w, d } = D;
  K.box(-w / 2 - 0.25, 0, -d / 2 - 0.25, w / 2 + 0.25, B, d / 2 + 0.25, "b");
  walls(K, D, !!p.kind);
  if (p.kind) furnish(K, D, p.kind);
}
