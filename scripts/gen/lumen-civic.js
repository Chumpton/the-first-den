// Lumenvale's civic pieces, one family by params.kind: plaza, spire, shards, canal, bridge, garden, fountain, wall, lamp, banner, books.
import { kit, C, TEX, GLOW, HUE, yawToward } from "./lumen-kit.js";
import { softened } from "./soften.js";
const R2 = Math.PI / 180, pol = (r, a, y = 0) => [Math.cos(a * R2) * r, y, Math.sin(a * R2) * r];
const SPIRE = "oklch(0.9 0.07 200)", SPIRE_GLOW = [0.22, 0.7, 0.78], WATER = "oklch(0.6 0.08 212)", CLOTH = { lilac: "oklch(0.7 0.13 305)", teal: "oklch(0.72 0.1 195)" };
function sector(K, r0, r1, a0, a1, y0, y1, n, sides = true) {
  for (let i = 0; i < n; i++) { const b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n, bm = (b0 + b1) / 2, rn = [Math.cos(bm * R2), 0, Math.sin(bm * R2)];
    K.q(pol(r0, b0, y1), pol(r1, b0, y1), pol(r1, b1, y1), pol(r0, b1, y1), [0, 1, 0]);
    if (sides) { K.q(pol(r1, b0, y0), pol(r1, b1, y0), pol(r1, b1, y1), pol(r1, b0, y1), rn); if (r0 > 0.01) K.q(pol(r0, b0, y0), pol(r0, b1, y0), pol(r0, b1, y1), pol(r0, b0, y1), [-rn[0], 0, -rn[2]]); } }
  if (sides && a1 - a0 < 359) for (const [a, sg] of [[a0, -1], [a1, 1]]) K.q(pol(r0, a, y0), pol(r1, a, y0), pol(r1, a, y1), pol(r0, a, y1), [-Math.sin(a * R2) * sg, 0, Math.cos(a * R2) * sg]);
}
function arch(K, cy, z0, z1, rin, rout, n) {
  for (let k = 0; k < n; k++) { const t0 = Math.PI * k / n, t1 = Math.PI * (k + 1) / n, tm = (t0 + t1) / 2;
    const I = (t, z) => [Math.cos(t) * rin, cy + Math.sin(t) * rin, z], O = (t, z) => [Math.cos(t) * rout, cy + Math.sin(t) * rout, z];
    K.q(I(t0, z0), O(t0, z0), O(t1, z0), I(t1, z0), [0, 0, -1]); K.q(I(t0, z1), O(t0, z1), O(t1, z1), I(t1, z1), [0, 0, 1]);
    K.q(I(t0, z0), I(t1, z0), I(t1, z1), I(t0, z1), [-Math.cos(tm), -Math.sin(tm), 0]); K.q(O(t0, z0), O(t1, z0), O(t1, z1), O(t0, z1), [Math.cos(tm), Math.sin(tm), 0]); }
}
const B = {
  plaza(K, L) {
    const n = L >= 4 ? 12 : 40, rings = [[8.5, 13.5, C.stone], [13.5, 14.1, C.trim], [14.1, 21.4, C.plinth], [21.4, 22, C.quoin]];
    K.tex(TEX.paving);
    for (const [a, b, c] of L >= 4 ? [[8.5, 22, C.stone]] : rings) { K.paint(c, null, c === C.trim ? 0.5 : 0.85, c === C.trim ? 0.2 : 0); sector(K, a, b, 0, 360, 0, 0.06, n, b === 22); }
    if (L <= 2) { K.tex(null).paint(C.trim, null, 0.45, 0.3); for (let k = 0; k < 8; k++) { const a = k * 45 + 22.5; K.q(pol(9, a - 1.2, 0.065), pol(21, a - 0.3, 0.065), pol(21, a + 0.3, 0.065), pol(9, a + 1.2, 0.065), [0, 1, 0]); } }
  },
  plazaCol(K) { K.prism(0, 0, 22, 22, 0, 0.06, 16, 0, "t"); },
  spire(K, L, rnd) {
    const ph = Math.PI / 8, n6 = L >= 4 ? 4 : 6;
    K.tex(TEX.stone).paint(C.plinth); K.prism(0, 0, 9, 9, 0, 0.6, 8, ph, "t"); K.paint(C.stone); K.prism(0, 0, 7, 7, 0.6, 1.2, 8, ph, "t"); K.paint(C.plinth); K.prism(0, 0, 5, 4.6, 1.2, 2.4, 8, ph, "t");
    if (L <= 2) { K.paint(C.trim, null, 0.45, 0.3); K.prism(0, 0, 9.06, 9.06, 0.45, 0.6, 8, ph, ""); K.prism(0, 0, 7.06, 7.06, 1.05, 1.2, 8, ph, ""); K.prism(0, 0, 4.66, 4.66, 2.25, 2.4, 8, ph, ""); }
    K.tex(null).paint(SPIRE, SPIRE_GLOW, 0.15, 0.1); K.lathe(0, 0, [[2.4, 2.4], [2.2, 20], [1.8, 40], [0, 55]], n6);
    if (L <= 3) {
      K.paint(C.lilac, [0.5, 0.32, 0.8], 0.2, 0.1);
      for (let k = 0; k < 6; k++) { const a = k * 60 + 30, b = pol(2.3, a, 2.4), h = 6 + (k % 3) * 4.5; K.shard(b, [Math.cos(a * R2) * 0.32, 1, Math.sin(a * R2) * 0.32], 0.85, h, 2.6, L <= 2 ? 6 : 4); }
      K.paint(C.trim, [0.35, 0.28, 0.1], 0.35, 0.5); for (const y of [15, 29]) K.annulus(0, 0, 2.7, 3.1, y, y + 0.3, L <= 2 ? 16 : 8);
    }
  },
  spireCol(K) { K.prism(0, 0, 9, 9, 0, 0.6, 8, Math.PI / 8, "t"); K.prism(0, 0, 7, 7, 0.6, 1.2, 8, Math.PI / 8, "t"); K.prism(0, 0, 5, 4.6, 1.2, 2.4, 8, Math.PI / 8, "t"); K.prism(0, 0, 2.4, 2.1, 2.4, 30, 6, 0, "t"); },
  shards(K, L, rnd) {
    for (let k = 0; k < 10; k++) { const a = k * 36 + rnd() * 14, r = 10 + rnd() * 3.5, y = 10 + ((k * 7) % 10) * 2.7, s = 0.55 + rnd() * 0.45, h = k % 2 ? "lilac" : "teal";
      K.paint(HUE[h], GLOW[h].map((v) => v * 0.6), 0.2, 0.1); const p = pol(r, a, y); K.bipyr(p[0], p[1], p[2], s, s * 3.2, s * 1.8, L >= 4 ? 3 : 5, rnd() * 6); }
  },
  canal(K, L) {
    const n = L >= 4 ? 24 : 64;
    K.tex(null).paint(WATER, null, 0.06, 0.25); sector(K, 34.5, 37.5, 0, 360, 0, 0.14, n, false);
    K.tex(TEX.stone).paint(C.plinth); K.annulus(0, 0, 33.9, 34.5, 0, 0.4, n); K.annulus(0, 0, 37.5, 38.1, 0, 0.4, n);
    if (L <= 2) { K.paint(C.trim, null, 0.45, 0.3); sector(K, 34.25, 34.5, 0, 360, 0.4, 0.43, n, false); sector(K, 37.5, 37.75, 0, 360, 0.4, 0.43, n, false); }
  },
  canalCol(K) { K.annulus(0, 0, 33.9, 34.5, 0, 0.4, 48); K.annulus(0, 0, 37.5, 38.1, 0, 0.4, 48); },
  bridge(K, L, rnd, S) {
    const n = L >= 4 ? 4 : 10, hl = 5.5, y = (z) => 0.12 + 1.1 * (1 - (z / hl) ** 2);
    if (!S) K.tex(TEX.paving).paint(C.plinth);
    for (let i = 0; i < n; i++) { const z0 = -hl + 2 * hl * i / n, z1 = -hl + 2 * hl * (i + 1) / n, a = y(z0), b = y(z1);
      K.q([-1.8, a, z0], [-1.8, b, z1], [1.8, b, z1], [1.8, a, z0], [0, 1, 0]);
      if (S) { for (const sx of [-1, 1]) K.box(sx > 0 ? 1.8 : -2.1, Math.min(a, b), z0, sx > 0 ? 2.1 : -1.8, Math.max(a, b) + 0.8, z1, "b"); continue; }
      K.tex(TEX.stone).paint(C.stone);
      K.q([-1.8, a - 0.35, z0], [1.8, a - 0.35, z0], [1.8, b - 0.35, z1], [-1.8, b - 0.35, z1], [0, -1, 0]);
      for (const sx of [-1, 1]) { const xo = sx * 2.1, xi = sx * 1.8;
        K.q([xo, a - 0.35, z0], [xo, b - 0.35, z1], [xo, b + 0.8, z1], [xo, a + 0.8, z0], [sx, 0, 0]);
        K.q([xi, a, z0], [xi, b, z1], [xi, b + 0.8, z1], [xi, a + 0.8, z0], [-sx, 0, 0]);
        K.paint(C.trim, null, 0.45, 0.3); K.q([xi - sx * 0.05, a + 0.8, z0], [xo + sx * 0.05, a + 0.8, z0], [xo + sx * 0.05, b + 0.8, z1], [xi - sx * 0.05, b + 0.8, z1], [0, 1, 0]); K.paint(C.stone); }
      K.tex(TEX.paving).paint(C.plinth); }
    if (S) return;
    K.tex(TEX.stone);
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) { const z = sz * (hl - 0.2), x = sx * 1.95; K.paint(C.quoin); K.box(x - 0.22, 0, z - 0.22, x + 0.22, 1.3, z + 0.22, "b");
      if (L <= 2) { K.tex(null).paint(HUE.teal, GLOW.teal, 0.2); K.bipyr(x, 1.6, z, 0.14, 0.3, 0.18, 4); K.tex(TEX.stone); } }
  },
  garden(K, L, rnd, S, p) {
    const a = +p.angle || 0, h = +p.half || 34, n = L >= 4 ? 4 : 10;
    if (S) { sector(K, 32.5, 33.2, a - h, a + h, 0, 0.9, 6); }
    else {
      K.tex(null).paint(C.lawn, null, 0.95); sector(K, 23.6, 32.5, a - h, a + h, 0, 0.07, n);
      K.paint(C.hedge, null, 0.95); sector(K, 32.5, 33.2, a - h, a + h, 0, 0.9, n);
      K.paint("oklch(0.8 0.1 350)", null, 0.9); sector(K, 23, 23.6, a - h + 4, a + h - 4, 0, 0.3, n);
    }
    if (L >= 4 && !S) return;
    for (const s of [-1, 1]) { const c = pol(27.75, a + s * 17); K.at(c[0], 0, c[2], yawToward(c[0], c[2]));
      if (!S) K.tex(TEX.stone).paint(C.quoin); K.box(-2.8, 0, -1.3, 2.8, 0.35, -1, "b"); K.box(-2.8, 0, 1, 2.8, 0.35, 1.3, "b"); K.box(-2.8, 0, -1, -2.5, 0.35, 1, "bfk"); K.box(2.5, 0, -1, 2.8, 0.35, 1, "bfk");
      if (!S) { K.tex(null).paint(WATER, null, 0.04, 0.3); K.q([-2.5, 0.27, 1], [2.5, 0.27, 1], [2.5, 0.27, -1], [-2.5, 0.27, -1], [0, 1, 0]); }
      K.at(); }
    for (const s of [-1, 1]) { const t = pol(29.8, a + s * 29); if (!S) K.tex(null).paint(C.dark); K.prism(t[0], t[2], 0.16, 0.12, 0, 1.6, 5, 0, "");
      if (!S && L <= 3) { K.paint("oklch(0.88 0.07 350)", null, 0.9); K.bipyr(t[0], 2.2, t[2], 1.3, 1.1, 0.7, 6, rnd()); K.paint("oklch(0.84 0.09 355)"); K.bipyr(t[0] + 0.6, 1.9, t[2] - 0.4, 0.8, 0.7, 0.5, 5, rnd()); } }
    if (S || L > 2) return;
    const fl = ["oklch(0.8 0.13 305)", "oklch(0.88 0.13 90)", "oklch(0.82 0.12 20)", "oklch(0.85 0.1 200)"];
    for (const [da, r] of [[-8, 25], [8, 25], [-7, 30.8], [7, 30.8], [-24, 24.8], [24, 24.8]]) { const c = pol(r, a + da);
      K.paint(C.hedge); K.bipyr(c[0], 0.2, c[2], 0.7, 0.35, 0.15, 6, rnd());
      for (let k = 0; k < 3; k++) { K.paint(fl[(k + Math.round(da)) & 3], null, 0.8); K.bipyr(c[0] + (rnd() - 0.5) * 0.9, 0.5, c[2] + (rnd() - 0.5) * 0.9, 0.16, 0.12, 0.08, 4, rnd()); } }
  },
  fountain(K, L, rnd, S) {
    const n = L >= 4 ? 6 : L === 3 ? 8 : 16;
    if (S) { K.prism(0, 0, 2.6, 2.6, 0, 0.6, 12, 0, "t"); K.prism(0, 0, 0.35, 0.3, 0.6, 1.6, 6, 0, "t"); return; }
    K.tex(TEX.stone).paint(C.stone); K.lathe(0, 0, [[2.6, 0], [2.65, 0.5], [2.45, 0.62], [2.3, 0.6], [2.25, 0.3]], n);
    K.tex(null).paint(WATER, null, 0.04, 0.3); sector(K, 0, 2.3, 0, 360, 0, 0.45, n, false);
    K.tex(TEX.stone).paint(C.quoin); K.lathe(0, 0, [[0.4, 0.45], [0.26, 1.1], [0.24, 1.55], [0.95, 1.75], [1.0, 1.9], [0.8, 1.92], [0, 1.93]], n);
    if (L <= 3) { K.tex(null).paint(C.trim, null, 0.4, 0.4); K.prism(0, 0, 0.29, 0.29, 1.15, 1.25, n, 0, ""); K.paint(HUE.teal, GLOW.teal, 0.2); K.bipyr(0, 2.5, 0, 0.18, 0.45, 0.3, 6); }
  },
  wall(K, L, rnd, S, p) {
    const R = +p.radius || 165, N = 64, st = 360 / N, g = +p.gate || 175, len = 2 * R * Math.sin(st / 2 * R2), T = !S;
    for (let i = 1; i < N; i++) { const a = g + i * st, c = pol(R, a); K.at(c[0], 0, c[2], yawToward(c[0], c[2]));
      if (T) K.tex(TEX.stone).paint(C.stone);
      K.box(-len / 2 - 0.05, 0, -0.6, len / 2 + 0.05, 2.6, 0.6, L >= 5 ? "btlrk" : "b");
      if (L >= 5) { K.at(); continue; }
      if (i < N - 1 || S) { if (T) K.paint(C.quoin); K.box(len / 2 - 0.4, 0, -0.75, len / 2 + 0.4, 3.1, 0.75, "b"); }
      if (T && L <= 3) { K.paint(C.trim, null, 0.45, 0.3); K.box(-len / 2, 2.6, -0.7, len / 2, 2.78, 0.7, "b"); }
      if (T && L <= 2 && i < N - 1) { K.tex(null).paint(i % 2 ? HUE.teal : HUE.lilac, i % 2 ? GLOW.teal : GLOW.lilac, 0.2); K.bipyr(len / 2, 3.45, 0, 0.16, 0.35, 0.2, 4); }
      if (T && L <= 3 && i % 8 === 4) { const h = (i / 8 | 0) % 2 ? "lilac" : "teal"; K.tex(null).paint(CLOTH[h], null, 0.9);
        K.q([-0.7, 2.55, -0.63], [0.7, 2.55, -0.63], [0.7, 1.0, -0.63], [-0.7, 1.0, -0.63], [0, 0, -1]); K.t([-0.7, 1.0, -0.63], [0.7, 1.0, -0.63], [0, 0.55, -0.63], [0, 0, -1]);
        if (L <= 2) { K.paint(C.trim, null, 0.5, 0.3); K.q([-0.12, 1.95, -0.64], [0, 2.2, -0.64], [0.12, 1.95, -0.64], [0, 1.7, -0.64], [0, 0, -1]); } }
      K.at(); }
    const c = pol(R, g); K.at(c[0], 0, c[2], yawToward(c[0], c[2]));
    for (const sx of [-1, 1]) { const x = sx * 5.8;
      if (T) K.tex(TEX.stone).paint(C.stone); K.prism(x, 0, 2.4, 2.2, 0, 8.5, 8, Math.PI / 8, S ? "t" : "");
      if (S) continue;
      K.paint(C.trim, null, 0.45, 0.3); K.prism(x, 0, 2.5, 2.5, 8.5, 8.8, 8, Math.PI / 8, "tb");
      K.tex(TEX.roof).paint(C.roof, null, 0.6, 0.15); K.cone(x, 0, 2.45, 8.8, 12.6, 8, Math.PI / 8);
      K.tex(null).paint(HUE.teal, GLOW.teal, 0.2); K.bipyr(x, 14.2, 0, 0.55, 1.5, 0.8, L >= 4 ? 4 : 6);
      if (L <= 3) { K.paint(CLOTH.lilac, null, 0.9); const z = -2.25; K.q([x - 0.8, 7.6, z], [x + 0.8, 7.6, z], [x + 0.8, 3.2, z], [x - 0.8, 3.2, z], [0, 0, -1]); K.t([x - 0.8, 3.2, z], [x + 0.8, 3.2, z], [x, 2.5, z], [0, 0, -1]);
        if (L <= 2) { K.paint(C.trim, null, 0.5, 0.3); K.q([x - 0.2, 5.6, z - 0.01], [x, 6.0, z - 0.01], [x + 0.2, 5.6, z - 0.01], [x, 5.2, z - 0.01], [0, 0, -1]); } } }
    if (T) K.tex(TEX.stone).paint(C.quoin);
    for (const sx of [-1, 1]) K.box(sx > 0 ? 3.4 : -4.3, 0, -0.85, sx > 0 ? 4.3 : -3.4, 3.2, 0.85, "b");
    if (T) { K.paint(C.stone); arch(K, 3.2, -0.85, 0.85, 3.4, 4.3, L >= 4 ? 4 : 10); K.paint(C.trim, null, 0.45, 0.3); K.box(-4.6, 7.5, -0.95, 4.6, 7.9, 0.95, "b");
      if (L <= 2) { K.tex(null).paint(HUE.lilac, GLOW.lilac, 0.2); K.bipyr(0, 8.6, 0, 0.3, 0.8, 0.4, 6); } }
    K.at();
  },
  lamp(K, L, rnd, S, p) {
    const h = p.glow === "lilac" ? "lilac" : "teal";
    if (S) { K.box(-0.2, 0, -0.2, 0.2, 3.3, 0.2, "b"); return; }
    K.tex(TEX.stone).paint(C.quoin); K.prism(0, 0, 0.3, 0.26, 0, 0.35, L >= 4 ? 4 : 8, Math.PI / 8);
    K.paint(C.stone); K.prism(0, 0, 0.1, 0.08, 0.35, 3.2, L >= 4 ? 4 : 6, 0, "");
    K.tex(null).paint(C.trim, null, 0.4, 0.5); if (L <= 3) { K.prism(0, 0, 0.18, 0.14, 3.2, 3.32, 6, 0, "tb"); K.prism(0, 0, 0.14, 0.14, 1.2, 1.3, 6, 0, ""); }
    if (L <= 2) for (let k = 0; k < 3; k++) { const a = k * 120 * R2; K.shard([Math.cos(a) * 0.12, 3.3, Math.sin(a) * 0.12], [Math.cos(a) * 0.3, 1, Math.sin(a) * 0.3], 0.025, 0.55, 0.08, 3); }
    K.paint(HUE[h], GLOW[h], 0.2); K.bipyr(0, 3.75, 0, 0.17, 0.38, 0.28, L >= 4 ? 4 : 6);
  },
  banner(K, L, rnd, S, p) {
    const h = p.glow === "lilac" ? "lilac" : "teal";
    if (S) { K.box(-0.12, 0, -0.12, 0.12, 7, 0.12, "b"); return; }
    K.tex(null).paint(C.trim, null, 0.4, 0.5); K.prism(0, 0, 0.09, 0.07, 0, 7, L >= 4 ? 4 : 6, 0, ""); K.box(-0.85, 6.3, -0.04, 0.85, 6.4, 0.04, "");
    K.paint(HUE[h], GLOW[h], 0.2); K.bipyr(0, 7.3, 0, 0.14, 0.4, 0.2, 4);
    K.paint(CLOTH[h], null, 0.9); K.q([-0.72, 6.3, 0.06], [0.72, 6.3, 0.06], [0.72, 3.1, 0.06], [-0.72, 3.1, 0.06], [0, 0, 1]); K.t([-0.72, 3.1, 0.06], [0.72, 3.1, 0.06], [0, 2.5, 0.06], [0, 0, 1]);
    if (L <= 2) { K.paint(C.trim, null, 0.5, 0.3); for (const z of [0.07, 0.05]) K.q([-0.25, 4.8, z], [0, 5.3, z], [0.25, 4.8, z], [0, 4.3, z], [0, 0, z > 0.06 ? 1 : -1]); K.box(-0.72, 5.95, 0.04, 0.72, 6.05, 0.08, "b"); }
  },
  books(K, L, rnd) {
    const cov = ["oklch(0.55 0.13 25)", "oklch(0.55 0.11 255)", "oklch(0.6 0.12 150)", "oklch(0.55 0.12 305)", "oklch(0.7 0.11 80)", "oklch(0.6 0.1 200)"];
    for (let k = 0; k < 6; k++) { const a = k * 60 + rnd() * 20, r = 0.7 + rnd() * 0.6, y = rnd() * 0.7, yaw = rnd() * 360; const c = pol(r, a); K.at(c[0], y, c[2], yaw);
      K.paint(cov[k], null, 0.7); K.q([0, 0, -0.15], [0, 0, 0.15], [-0.22, 0.08, 0.15], [-0.22, 0.08, -0.15], [0, 1, 0]); K.q([0, 0, 0.15], [0, 0, -0.15], [0.22, 0.08, -0.15], [0.22, 0.08, 0.15], [0, 1, 0]);
      K.paint("oklch(0.96 0.03 90)", [0.35, 0.3, 0.2], 0.9); K.q([0, 0.02, -0.13], [0, 0.02, 0.13], [-0.2, 0.1, 0.13], [-0.2, 0.1, -0.13], [0, 1, 0]); K.q([0, 0.02, 0.13], [0, 0.02, -0.13], [0.2, 0.1, -0.13], [0.2, 0.1, 0.13], [0, 1, 0]); }
    K.at();
  },
};
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params, K = kit(ctx), rnd = () => ctx.random();
  B[p.kind]?.(K, ctx.lod, rnd, false, p);
});
export function collider(ctx) {
  const p = ctx.params, K = kit(ctx, true), rnd = () => 0.5, k = p.kind;
  if (k === "shards" || k === "books") return null;
  if (B[k + "Col"]) { B[k + "Col"](K); return; }
  B[k]?.(K, 1, rnd, true, p);
}
