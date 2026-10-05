import { TAU, face, box, prism, frustum, orb, strut, ngon, annulus, ringPts, paint, tint } from "./hearth-mesh.js";
import { softened } from "./soften.js";
// Hearthmere's one-of-a-kind pieces, one family by params.kind: tree | fountain | windmill | sails | temple | bell | gatehouse | wall | pond | plot.
const LEAF = ["oklch(0.5 0.12 145)", "oklch(0.6 0.14 128)", "oklch(0.72 0.15 108)", "oklch(0.82 0.14 95)"];
function leaves(ctx) { ctx.albedo(null); ctx.roughness(0.9); ctx.metalness(0); ctx.emissive(0.22, 0.2, 0.04); }
function tree(ctx, P, lod) {
  if (lod >= 5) {
    paint(ctx, "bark"); frustum(ctx, 0, 0, 0, 17, 4.4, 2.4, 6, "");
    leaves(ctx); ctx.color(LEAF[1]); orb(ctx, 0, 27, 0, 16, 8, 16, 6, 2); ctx.color(LEAF[2]); orb(ctx, 0, 32, 0, 10, 5, 10, 5, 2);
    return;
  }
  paint(ctx, "bark");
  const ys = [0, 3, 8, 13, 17], rs = [4.6, 3.7, 3.1, 2.8, 2.5], sides = lod <= 2 ? 12 : lod === 3 ? 9 : 6;
  for (let i = 0; i < 4; i++) frustum(ctx, 0, 0, ys[i], ys[i + 1], rs[i], rs[i + 1], sides, "", i * 0.22);
  if (lod <= 3) for (let i = 0; i < 7; i++) { const a = i * TAU / 7 + 0.3; strut(ctx, [Math.cos(a) * 2.6, 3, Math.sin(a) * 2.6], [Math.cos(a) * 8.6, -0.3, Math.sin(a) * 8.6], 1.35, 0.35, 5); }
  const ends = [];
  for (let i = 0; i < 7; i++) {
    const a = i * TAU / 7 + 0.7, R = 11 + ctx.random() * 4, e = [Math.cos(a) * R, 20 + ctx.random() * 4, Math.sin(a) * R];
    if (lod <= 3) strut(ctx, [Math.cos(a) * 1.6, 14.5 + (i % 3), Math.sin(a) * 1.6], e, 1.25, 0.45, lod <= 2 ? 6 : 4);
    ends.push(e);
  }
  if (lod <= 3) strut(ctx, [0, 16, 0], [0.8, 26, -0.5], 1.7, 0.6, 6);
  leaves(ctx);
  const seg = lod <= 2 ? 9 : lod === 3 ? 7 : 5, lat = lod <= 2 ? 5 : lod === 3 ? 4 : 3;
  const blobs = ends.map((e) => [e[0], e[1] + 2.5, e[2], 7 + ctx.random() * 2.5]);
  blobs.push([0, 30, 0, 11]); for (let i = 0; i < 5; i++) { const a = i * TAU / 5; blobs.push([Math.cos(a) * 7, 29 + ctx.random() * 3, Math.sin(a) * 7, 7.5]); }
  for (const b of blobs) orb(ctx, b[0], b[1], b[2], b[3], b[3] * 0.7, b[3], seg, lat, lod <= 3 ? 0.14 : 0, LEAF);
  if (lod <= 3) { // hanging light-pods under the canopy
    for (let i = 0; i < 34; i++) {
      const b = blobs[i % 7], a = ctx.random() * TAU, rr = b[3] * (0.3 + ctx.random() * 0.55), top = b[1] - b[3] * 0.45, len = 0.8 + ctx.random() * 2.2;
      const x = b[0] + Math.cos(a) * rr, z = b[2] + Math.sin(a) * rr;
      if (lod <= 2) { tint(ctx, "oklch(0.5 0.06 90)"); strut(ctx, [x, top + 0.5, z], [x, top - len, z], 0.02, 0.02, 3); }
      paint(ctx, i % 3 ? "magic" : "lanterngold"); orb(ctx, x, top - len - 0.3, z, 0.3, 0.4, 0.3, lod <= 2 ? 6 : 4, lod <= 2 ? 3 : 2);
    }
  }
  if (lod <= 2) {
    for (let i = 0; i < 14; i++) { // glowing mushrooms among the roots
      const a = ctx.random() * TAU, r = 5 + ctx.random() * 4, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 0.2 + ctx.random() * 0.35;
      tint(ctx, "oklch(0.92 0.03 90)"); frustum(ctx, x, z, 0, h, 0.06, 0.05, 5, "");
      tint(ctx, "oklch(0.86 0.1 190)", [0.5, 1.5, 1.35]); orb(ctx, x, h, z, 0.18, 0.1, 0.18, 6, 2);
    }
  }
  if (lod <= 3) for (let i = 0; i < 8; i++) { // a ring of benches under the boughs
    const a = i * TAU / 8 + TAU / 16, r = 11, t = [-Math.sin(a), 0, Math.cos(a)], c = [Math.cos(a) * r, 0, Math.sin(a) * r];
    const A = [c[0] - t[0] * 1.2, 0.45, c[2] - t[2] * 1.2], B = [c[0] + t[0] * 1.2, 0.45, c[2] + t[2] * 1.2];
    paint(ctx, "timber"); strut(ctx, A, B, 0.26, 0.26, 4);
    paint(ctx, "darkwood"); for (const q of [A, B]) strut(ctx, [q[0], 0, q[2]], [q[0], 0.4, q[2]], 0.08, 0.08, 4);
  }
}
function fountain(ctx, P, lod) {
  const r = +P.r || 3.2, ph = TAU / 16;
  paint(ctx, "stone");
  if (lod >= 4) { prism(ctx, ringPts(0, 0, r, 8, ph), 0, 0.8, "b"); frustum(ctx, 0, 0, 0.8, 3.7, 0.45, 0.3, 6, "t"); return; }
  prism(ctx, ringPts(0, 0, r, 8, ph), 0, 0.7, "tb");
  annulus(ctx, [0, 0.8, 0], [1, 0, 0], [0, 0, 1], r - 0.35, r + 0.08, 8, [0, 1, 0], ph);
  frustum(ctx, 0, 0, 0.7, 0.8, r + 0.08, r + 0.08, 8, "", ph); frustum(ctx, 0, 0, 0.5, 0.8, r - 0.35, r - 0.35, 8, "", ph);
  frustum(ctx, 0, 0, 0.5, 2.2, 0.48, 0.34, 8, "");
  frustum(ctx, 0, 0, 2.2, 2.6, 0.38, 1.35, 10, "b"); frustum(ctx, 0, 0, 2.6, 3.4, 0.24, 0.22, 8, "");
  frustum(ctx, 0, 0, 3.4, 3.7, 0.24, 0.72, 10, "b");
  paint(ctx, "water"); ngon(ctx, [0, 0.62, 0], [1, 0, 0], [0, 0, 1], r - 0.36, 8, [0, 1, 0], ph); ngon(ctx, [0, 2.55, 0], [1, 0, 0], [0, 0, 1], 1.28, 10, [0, 1, 0]); ngon(ctx, [0, 3.66, 0], [1, 0, 0], [0, 0, 1], 0.68, 10, [0, 1, 0]);
  paint(ctx, "lanterngold"); orb(ctx, 0, 3.95, 0, 0.26, 0.3, 0.26, 7, 4);
  if (lod <= 2) { paint(ctx, "leaf"); for (let i = 0; i < 6; i++) { const a = i * TAU / 6 + 0.3, q = r - 1.1; ngon(ctx, [Math.cos(a) * q, 0.64, Math.sin(a) * q], [1, 0, 0], [0, 0, 1], 0.3, 6, [0, 1, 0]); } }
}
function windmill(ctx, P, lod) {
  const ph = Math.PI / 8;
  if (lod >= 4) { paint(ctx, "plaster"); frustum(ctx, 0, 0, 0, 11, 4.2, 3, 6, ""); paint(ctx, "thatch"); frustum(ctx, 0, 0, 11, 16, 3.7, 0, 6, "b"); return; }
  paint(ctx, "stone"); frustum(ctx, 0, 0, 0, 1.2, 4.45, 4.35, 8, "t", ph);
  paint(ctx, "plaster"); frustum(ctx, 0, 0, 1.2, 11, 4.1, 3.0, 8, "", ph);
  paint(ctx, "darkwood"); for (const y of [4, 8]) { const rr = 4.1 - (y - 1.2) * (1.1 / 9.8) + 0.06; frustum(ctx, 0, 0, y, y + 0.28, rr, rr - 0.03, 8, "b", ph); }
  paint(ctx, "thatch"); frustum(ctx, 0, 0, 11, 11.6, 3.5, 3.5, 8, "b", ph); frustum(ctx, 0, 0, 11.6, 16, 3.75, 0, 8, "b", ph);
  paint(ctx, "moss"); frustum(ctx, 0, 0, 15.2, 16.4, 0.7, 0, 6, "");
  paint(ctx, "darkwood"); box(ctx, -0.6, 0, -4.02, 0.6, 2.2, -3.72); box(ctx, -0.75, 2.2, -4.06, 0.75, 2.4, -3.7);
  box(ctx, -0.75, 11.6, -4.1, 0.75, 13.3, -2.6);
  paint(ctx, "glass"); for (const y of [5.6, 8.9]) { const ap = (4.1 - (y - 1.2) * (1.1 / 9.8)) * Math.cos(ph) + 0.05; ngon(ctx, [0, y, -ap], [1, 0, 0], [0, 1, 0], 0.42, 8, [0, 0, -1], ph); }
  paint(ctx, "lanternglow"); orb(ctx, 0.95, 2.4, -4.05, 0.14, 0.19, 0.14, 6, 3);
}
function sails(ctx, P, lod) { // hub at the origin, the vanes turn in the XY plane facing -Z
  paint(ctx, "darkwood"); orb(ctx, 0, 0, -0.1, 0.5, 0.5, 0.5, 6, 3);
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4 + TAU / 8, d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
    paint(ctx, "darkwood"); strut(ctx, [0, 0, -0.25], [d[0] * 9.2, d[1] * 9.2, -0.25], 0.14, 0.09, 4);
    const q = (s, w) => [d[0] * s + n[0] * w, d[1] * s + n[1] * w, -0.32];
    paint(ctx, "linen"); face(ctx, [q(1.8, 0.15), q(8.9, 0.15), q(8.9, 1.7), q(1.8, 1.5)], [0, 0, -1]);
    if (lod <= 2) { paint(ctx, "timber"); strut(ctx, q(1.8, 1.55), q(8.9, 1.75), 0.04, 0.04, 3); for (let s = 2; s <= 9; s += 1.75) strut(ctx, q(s, 0.1), q(s, 1.62), 0.035, 0.035, 3); }
  }
}
function temple(ctx, P, lod) {
  const R2 = Math.SQRT2, ph = Math.PI / 4;
  paint(ctx, "stone"); box(ctx, -7, 0, -7, 7, 0.9, 7, "b");
  if (lod >= 4) { paint(ctx, "tile"); frustum(ctx, 0, 0, 5.2, 7, 8.8 * R2, 4.2 * R2, 4, "b", ph); frustum(ctx, 0, 0, 7, 9.8, 5.6 * R2, 0.3 * R2, 4, "", ph); return; }
  for (let k = 0; k < 5; k++) box(ctx, -2.6, 0, -7 - (5 - k) * 0.3, 2.6, 0.18 * (k + 1), -7, "b");
  const pil = [[-5.8, -5.8], [-1.95, -5.8], [1.95, -5.8], [5.8, -5.8], [-5.8, 5.8], [-1.95, 5.8], [1.95, 5.8], [5.8, 5.8], [-5.8, -1.95], [-5.8, 1.95], [5.8, -1.95], [5.8, 1.95]];
  for (const [x, z] of pil) { paint(ctx, "stone"); frustum(ctx, x, z, 0.9, 1.25, 0.46, 0.42, 8, "t"); tint(ctx, "oklch(0.56 0.15 32)"); frustum(ctx, x, z, 1.25, 5.0, 0.32, 0.29, 8, ""); }
  paint(ctx, "darkwood"); box(ctx, -6.3, 5.0, -6.3, 6.3, 5.4, -5.5); box(ctx, -6.3, 5.0, 5.5, 6.3, 5.4, 6.3); box(ctx, -6.3, 5.0, -5.5, -5.5, 5.4, 5.5); box(ctx, 5.5, 5.0, -5.5, 6.3, 5.4, 5.5);
  paint(ctx, "tile"); frustum(ctx, 0, 0, 5.2, 7, 8.8 * R2, 4.2 * R2, 4, "b", ph);
  paint(ctx, "plaster"); box(ctx, -4.2, 7, -4.2, 4.2, 7.8, 4.2, "b");
  paint(ctx, "tile"); frustum(ctx, 0, 0, 7.6, 9.8, 5.8 * R2, 0.3 * R2, 4, "b", ph);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { strut(ctx, [sx * 8.6, 5.3, sz * 8.6], [sx * 9.5, 6.2, sz * 9.5], 0.22, 0.06, 4); strut(ctx, [sx * 5.6, 7.7, sz * 5.6], [sx * 6.3, 8.4, sz * 6.3], 0.18, 0.05, 4); }
  paint(ctx, "magic"); orb(ctx, 0, 10.2, 0, 0.35, 0.5, 0.35, 6, 3);
  paint(ctx, "darkwood"); box(ctx, -1.5, 0.9, -0.16, -1.2, 4.5, 0.16); box(ctx, 1.2, 0.9, -0.16, 1.5, 4.5, 0.16); box(ctx, -1.8, 4.2, -0.2, 1.8, 4.55, 0.2);
  for (const sx of [-1, 1]) { // stone lanterns at the steps
    const x = sx * 3.9, z = -8.9; paint(ctx, "stone"); frustum(ctx, x, z, 0, 1.1, 0.3, 0.22, 6, ""); box(ctx, x - 0.35, 1.1, z - 0.35, x + 0.35, 1.2, z + 0.35);
    paint(ctx, "lanternglow"); box(ctx, x - 0.25, 1.2, z - 0.25, x + 0.25, 1.6, z + 0.25); paint(ctx, "tile"); frustum(ctx, x, z, 1.6, 2.0, 0.55, 0.05, 4, "b", ph);
  }
  if (lod <= 2) { tint(ctx, "oklch(0.62 0.12 60)"); for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + ph; frustum(ctx, Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0.9, 1.05, 0.4, 0.38, 8, "t"); } }
}
function bell(ctx, P, lod) { // feet at the rim, hung from its crown at 1.1
  paint(ctx, "bronze"); const n = lod <= 2 ? 12 : 8;
  frustum(ctx, 0, 0, 0, 0.14, 0.58, 0.5, n, "b"); frustum(ctx, 0, 0, 0.14, 0.8, 0.5, 0.4, n, ""); frustum(ctx, 0, 0, 0.8, 1.0, 0.4, 0.22, n, "t");
  paint(ctx, "darkwood"); box(ctx, -0.06, 1.0, -0.06, 0.06, 1.14, 0.06);
  if (lod <= 2) { paint(ctx, "lanterngold"); frustum(ctx, 0, 0, 0.25, 0.3, 0.495, 0.49, n, ""); tint(ctx, "oklch(0.6 0.14 25)"); strut(ctx, [0.05, 0.9, 0], [0.12, -0.5, 0], 0.03, 0.03, 3); orb(ctx, 0.12, -0.62, 0, 0.08, 0.14, 0.08, 5, 3); }
}
function gatehouse(ctx, P, lod) {
  paint(ctx, "stone"); box(ctx, -7.9, 0, -2.5, -3.3, 5, 2.5, "b"); box(ctx, 3.3, 0, -2.5, 7.9, 5, 2.5, "b");
  paint(ctx, "plaster"); box(ctx, -8.1, 5, -2.9, 8.1, 8.4, 2.9, lod >= 4 ? "" : "");
  const roof = () => {
    paint(ctx, "tile");
    for (const g of [-1, 1]) { face(ctx, [[-8.9, 8.3, g * 3.7], [8.9, 8.3, g * 3.7], [5, 11.6, 0], [-5, 11.6, 0]], [0, 3.7, g * 3.3]); face(ctx, [[g * 8.9, 8.3, -3.7], [g * 8.9, 8.3, 3.7], [g * 5, 11.6, 0]], [g * 3.3, 3.9, 0]); }
    face(ctx, [[-8.9, 8.3, -3.7], [8.9, 8.3, -3.7], [8.9, 8.3, 3.7], [-8.9, 8.3, 3.7]], [0, -1, 0]);
  };
  if (lod >= 4) { roof(); return; }
  roof(); strut(ctx, [-5.1, 11.65, 0], [5.1, 11.65, 0], 0.15, 0.15, 4);
  paint(ctx, "timber");
  for (const g of [-1, 1]) {
    const z = g * 2.96;
    box(ctx, -8.15, 5, z - 0.05, 8.15, 5.25, z + 0.05); box(ctx, -8.15, 8.2, z - 0.05, 8.15, 8.4, z + 0.05);
    for (let x = -8.05; x <= 8.1; x += 2.3) box(ctx, x - 0.08, 5, z - 0.05, x + 0.08, 8.4, z + 0.05);
    if (lod <= 2) for (let x = -8.05; x < 7; x += 4.6) strut(ctx, [x + 0.1, 5.25, z], [x + 2.2, 8.2, z], 0.07, 0.07, 4);
    box(ctx, -3.5, 4.55, z * 0.86 - 0.14, 3.5, 5.0, z * 0.86 + 0.14);
  }
  paint(ctx, "darkwood"); box(ctx, -8.25, 4.85, -3.05, 8.25, 5.05, 3.05, "t");
  for (const x of [-3.3, 3.3]) box(ctx, x - 0.15, 0, -2.2, x + 0.15, 4.4, 0.4);
  paint(ctx, "glass"); for (const g of [-1, 1]) for (const x of [-5.75, 0, 5.75]) ngon(ctx, [x, 6.7, g * 3.02], [1, 0, 0], [0, 1, 0], 0.55, 8, [0, 0, g], Math.PI / 8);
  for (const sx of [-1, 1]) {
    paint(ctx, "iron"); strut(ctx, [sx * 3.4, 3.9, -2.5], [sx * 3.4, 3.9, -3.1], 0.04, 0.04, 4);
    paint(ctx, "lanternglow"); orb(ctx, sx * 3.4, 3.5, -3.15, 0.22, 0.3, 0.22, 6, 3);
    tint(ctx, sx < 0 ? "oklch(0.62 0.16 25)" : "oklch(0.8 0.14 85)"); face(ctx, [[sx * 5.0, 1.2, -2.55], [sx * 6.2, 1.2, -2.55], [sx * 6.2, 4.6, -2.55], [sx * 5.0, 4.6, -2.55]], [0, 0, -1]);
    paint(ctx, "stone"); box(ctx, sx * 7.9 - (sx < 0 ? 0.2 : 0), 5, -2.5, sx * 7.9 + (sx > 0 ? 0.2 : 0), 5.1, 2.5);
  }
}
function wall(ctx, P, lod) {
  const L = (+P.len || 20) / 2;
  paint(ctx, "stone"); box(ctx, -L, 0, -0.45, L, 1.3, 0.45, "b");
  box(ctx, -L - 0.03, 1.3, -0.56, L + 0.03, 1.5, 0.56, lod >= 4 ? "b" : "");
  if (lod <= 2) {
    for (let x = -L + 3; x < L - 1; x += 6) box(ctx, x - 0.35, 0, -0.75, x + 0.35, 1.05, 0.75, "b");
    paint(ctx, "moss"); for (let i = 0; i < 3; i++) { const x = -L + ctx.random() * 2 * L; orb(ctx, x, 1.5, (ctx.random() - 0.5) * 0.6, 0.5, 0.18, 0.35, 5, 2); }
  }
  if (lod <= 3) { paint(ctx, "lanterngold"); orb(ctx, 0, 1.75, 0, 0.16, 0.22, 0.16, 6, 3); }
}
function pond(ctx, P, lod) {
  const r = +P.r || 9;
  paint(ctx, "water"); ngon(ctx, [0, 0.1, 0], [1, 0, 0], [0, 0, 1], r, 14, [0, 1, 0]);
  if (lod >= 4) { paint(ctx, "stone"); annulus(ctx, [0, 0.14, 0], [1, 0, 0], [0, 0, 1], r, r + 0.9, 14, [0, 1, 0]); return; }
  paint(ctx, "stone"); for (let i = 0; i < 22; i++) { const a = i * TAU / 22 + ctx.random() * 0.1, q = r + 0.2 + ctx.random() * 0.4; orb(ctx, Math.cos(a) * q, 0.05, Math.sin(a) * q, 0.6 + ctx.random() * 0.4, 0.3 + ctx.random() * 0.2, 0.5, 6, 2, 0.15); }
  for (let i = 0; i < 8; i++) { const a = ctx.random() * TAU, q = ctx.random() * r * 0.8, x = Math.cos(a) * q, z = Math.sin(a) * q; paint(ctx, "leaf"); ngon(ctx, [x, 0.13, z], [1, 0, 0], [0, 0, 1], 0.35 + ctx.random() * 0.2, 7, [0, 1, 0]); if (i % 3 === 0) { tint(ctx, "oklch(0.85 0.09 350)"); orb(ctx, x, 0.2, z, 0.12, 0.09, 0.12, 5, 2); } }
  for (let i = 0; i < 4; i++) {
    const a = i * 1.7 + 0.4, q = r * (0.3 + 0.12 * i), x = Math.cos(a) * q, z = Math.sin(a) * q, dx = -Math.sin(a) * 0.3, dz = Math.cos(a) * 0.3;
    tint(ctx, i === 3 ? "oklch(0.72 0.08 70)" : "oklch(0.96 0.02 90)"); orb(ctx, x, 0.22, z, 0.3, 0.17, 0.3, 6, 3); orb(ctx, x + dx, 0.48, z + dz, 0.12, 0.13, 0.12, 5, 3);
    tint(ctx, "oklch(0.72 0.16 60)"); strut(ctx, [x + dx * 1.3, 0.48, z + dz * 1.3], [x + dx * 1.8, 0.46, z + dz * 1.8], 0.04, 0.02, 3);
  }
  if (lod <= 2) { tint(ctx, "oklch(0.62 0.12 125)"); for (let i = 0; i < 18; i++) { const a = ctx.random() * TAU * 0.45 + 2.2, q = r - 0.4 - ctx.random() * 0.8, x = Math.cos(a) * q, z = Math.sin(a) * q; strut(ctx, [x, 0, z], [x + (ctx.random() - 0.5) * 0.3, 1 + ctx.random() * 0.9, z], 0.035, 0.012, 3); } }
}
function plot(ctx, P, lod) {
  const w = (+P.w || 6) / 2, d = (+P.d || 4) / 2, crop = P.crop || "cabbage";
  paint(ctx, "soil"); box(ctx, -w + 0.1, 0, -d + 0.1, w - 0.1, 0.24, d - 0.1, "b");
  if (lod >= 4) return;
  paint(ctx, "timber"); box(ctx, -w, 0, -d, w, 0.3, -d + 0.12, "b"); box(ctx, -w, 0, d - 0.12, w, 0.3, d, "b"); box(ctx, -w, 0, -d, -w + 0.12, 0.3, d, "b"); box(ctx, w - 0.12, 0, -d, w, 0.3, d, "b");
  for (let z = -d + 0.6; z < d - 0.3; z += 0.9) for (let x = -w + 0.55; x < w - 0.3; x += 0.8) {
    const jx = x + (ctx.random() - 0.5) * 0.15, jz = z + (ctx.random() - 0.5) * 0.15;
    if (crop === "cabbage") { tint(ctx, "oklch(0.7 0.13 135)"); orb(ctx, jx, 0.4, jz, 0.28, 0.2, 0.28, lod <= 2 ? 6 : 4, 2); }
    else if (crop === "pumpkin") { if (ctx.random() < 0.55) { tint(ctx, "oklch(0.7 0.16 55)"); orb(ctx, jx, 0.42, jz, 0.3, 0.22, 0.3, 6, 3); } else { tint(ctx, "oklch(0.58 0.12 135)"); orb(ctx, jx, 0.32, jz, 0.25, 0.08, 0.25, 5, 2); } }
    else if (crop === "lavender") { tint(ctx, "oklch(0.55 0.1 140)"); orb(ctx, jx, 0.35, jz, 0.25, 0.2, 0.25, 5, 2); tint(ctx, "oklch(0.65 0.14 300)"); orb(ctx, jx, 0.62, jz, 0.18, 0.2, 0.18, 5, 2); }
    else { tint(ctx, "oklch(0.8 0.13 88)"); frustum(ctx, jx, jz, 0.24, 1.1, 0.2, 0.26, 5, "t"); }
  }
  if (P.scarecrow && lod <= 3) {
    paint(ctx, "darkwood"); strut(ctx, [w - 0.6, 0, 0], [w - 0.6, 2.2, 0], 0.06, 0.05, 4); strut(ctx, [w - 0.6, 1.6, -0.8], [w - 0.6, 1.6, 0.8], 0.04, 0.04, 4);
    tint(ctx, "oklch(0.55 0.1 30)"); frustum(ctx, w - 0.6, 0, 0.9, 1.7, 0.35, 0.2, 6, "b"); tint(ctx, "oklch(0.85 0.1 85)"); orb(ctx, w - 0.6, 2.05, 0, 0.22, 0.24, 0.22, 6, 3);
    paint(ctx, "thatch"); frustum(ctx, w - 0.6, 0, 2.2, 2.28, 0.5, 0.5, 8, ""); frustum(ctx, w - 0.6, 0, 2.28, 2.6, 0.24, 0.05, 8, "b");
  }
}
const KINDS = { tree, fountain, windmill, sails, temple, bell, gatehouse, wall, pond, plot };
export const geometry = softened(function geometry(ctx) { (KINDS[ctx.params.kind] || wall)(ctx, ctx.params, ctx.lod); });
export function collider(ctx) {
  const P = ctx.params;
  switch (P.kind) {
    case "tree": prism(ctx, ringPts(0, 0, 4.3, 8), 0, 17); return;
    case "fountain": { const r = +P.r || 3.2; prism(ctx, ringPts(0, 0, r + 0.08, 8, TAU / 16), 0, 0.8); prism(ctx, ringPts(0, 0, 0.5, 6), 0.8, 3.7); return; }
    case "windmill": prism(ctx, ringPts(0, 0, 4.2, 8, Math.PI / 8), 0, 11); return;
    case "temple": {
      box(ctx, -7, 0, -7, 7, 0.9, 7); for (let k = 0; k < 5; k++) box(ctx, -2.6, 0, -7 - (5 - k) * 0.3, 2.6, 0.18 * (k + 1), -7 + 0.01);
      for (const x of [-5.8, -1.95, 1.95, 5.8]) for (const z of [-5.8, 5.8]) box(ctx, x - 0.35, 0.9, z - 0.35, x + 0.35, 5, z + 0.35);
      for (const x of [-5.8, 5.8]) for (const z of [-1.95, 1.95]) box(ctx, x - 0.35, 0.9, z - 0.35, x + 0.35, 5, z + 0.35);
      box(ctx, -1.5, 0.9, -0.16, -1.2, 4.5, 0.16); box(ctx, 1.2, 0.9, -0.16, 1.5, 4.5, 0.16); return;
    }
    case "bell": return { kind: "box", width: 1.1, height: 1.1, depth: 1.1 };
    case "gatehouse": box(ctx, -7.9, 0, -2.5, -3.3, 5, 2.5); box(ctx, 3.3, 0, -2.5, 7.9, 5, 2.5); box(ctx, -8.1, 4.85, -2.9, 8.1, 8.4, 2.9); return;
    case "wall": { const L = (+P.len || 20) / 2; box(ctx, -L, 0, -0.5, L, 1.5, 0.5); return; }
    default: return null;
  }
}
