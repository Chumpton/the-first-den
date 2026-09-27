// Cob-house furnishings, one family: params.item picks the piece. Frame: back against +Z (the wall), front −Z, feet on the
// floor, centred on the origin. Hanging pieces (hanging, herbs, lantern with drop) have their origin at the ceiling and hang down.
// ctx.lod: 1–2 full detail, 3 drops small props, 4–5 one or two hull boxes.
import { paint } from './den-furniture-mesh.js';
const TAU = Math.PI * 2;
const P = (ctx, kind, tint) => paint({ ctx }, kind, tint);
const glow = (ctx, r, g, b) => ctx.emissive(r, g, b);
function box(ctx, cx, y0, cz, w, h, d, T) {
  const x0 = cx - w / 2, x1 = cx + w / 2, y1 = y0 + h, z0 = cz - d / 2, z1 = cz + d / 2;
  const q = (a, b, c, e) => { if (T) { a = T(...a); b = T(...b); c = T(...c); e = T(...e); } ctx.quad(...a, ...b, ...c, ...e); };
  q([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]);
  q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
  q([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]);
  q([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]);
  q([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]);
  q([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]);
}
// profile [[y, r], …] turned about (cx, cz); top cap on the last ring
function lathe(ctx, prof, n, cx = 0, cz = 0, cap = true, zs = 1) {
  for (let k = 0; k < prof.length - 1; k++) {
    const [y0, r0] = prof[k], [y1, r1] = prof[k + 1];
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0) * zs, c1 = Math.cos(a1), s1 = Math.sin(a1) * zs;
      ctx.quad(cx + c0 * r0, y0, cz + s0 * r0, cx + c0 * r1, y1, cz + s0 * r1, cx + c1 * r1, y1, cz + s1 * r1, cx + c1 * r0, y0, cz + s1 * r0);
    }
  }
  if (!cap) return;
  const [y, r] = prof[prof.length - 1];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    ctx.tri(cx, y, cz, cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r * zs, cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r * zs);
  }
}
const blob = (ctx, x, y, z, r, n = 5) => lathe(ctx, [[y - r, 0.001], [y - r * 0.5, r * 0.85], [y + r * 0.4, r], [y + r, r * 0.35]], n, x, z);
// a leaf: base → tip along dir (unit), width w, a little fold
function leaf(ctx, b, dir, len, w) {
  let sx = -dir[2], sz = dir[0]; const sl = Math.hypot(sx, sz) || 1; sx /= sl; sz /= sl;
  const m = [b[0] + dir[0] * len * 0.45, b[1] + dir[1] * len * 0.45 + 0.01, b[2] + dir[2] * len * 0.45];
  const t = [b[0] + dir[0] * len, b[1] + dir[1] * len, b[2] + dir[2] * len];
  const l = [m[0] + sx * w, m[1] - 0.012, m[2] + sz * w], r = [m[0] - sx * w, m[1] - 0.012, m[2] - sz * w];
  ctx.tri(...b, ...l, ...t); ctx.tri(...b, ...t, ...r);
}
const norm = (x, y, z) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
const GREENS = ['#4f8a3c', '#6a9f45', '#5d8a47', '#79a35b', '#3c6e34'];
const FLOWERS = ['#e98aa8', '#f2c94c', '#a58bd6', '#f4efe4', '#ef8a5b', '#e76f7a'];
const PRESERVES = ['#e0a33a', '#b8413a', '#7f9a4a', '#e8904a', '#6b3a5a', '#d9c36a'];
const pick = (ctx, a) => a[Math.floor(ctx.random() * a.length)];

function counter(ctx, p, fine) {
  const L = p.len, D = p.d, h = p.h;
  P(ctx, 'walnut'); box(ctx, 0, 0, 0.03, L - 0.06, 0.08, D - 0.1);
  P(ctx, 'plaster', '#f4e8d0'); box(ctx, 0, 0.08, 0.01, L - 0.02, h - 0.13, D - 0.04);
  const n = Math.max(1, Math.round(L / 0.6)), dw = (L - 0.06) / n;
  for (let i = 0; i < n; i++) {
    const x = -L / 2 + 0.03 + dw * (i + 0.5);
    P(ctx, '#9baf84'); box(ctx, x, 0.15, -D / 2 + 0.005, dw - 0.05, h - 0.3, 0.025);
    if (fine) { P(ctx, 'brass'); box(ctx, x + (i % 2 ? -1 : 1) * (dw / 2 - 0.1), h - 0.33, -D / 2 - 0.015, 0.03, 0.05, 0.02); }
  }
  P(ctx, 'oak'); box(ctx, 0, h - 0.05, -0.01, L + 0.04, 0.05, D + 0.02); box(ctx, 0, h, D / 2 - 0.02, L + 0.04, 0.09, 0.03);
  if (!fine) return;
  let x = -L / 2 + 0.25;
  if (p.sink) {
    P(ctx, 'limestone'); box(ctx, x + 0.1, h, 0.02, 0.55, 0.05, 0.42); P(ctx, '#7e948f'); box(ctx, x + 0.1, h + 0.051, 0.02, 0.45, 0.002, 0.32);
    P(ctx, 'brass'); box(ctx, x + 0.1, h, 0.21, 0.04, 0.22, 0.04); box(ctx, x + 0.1, h + 0.2, 0.15, 0.03, 0.03, 0.12);
    x += 0.6;
  }
  if (p.pots) {
    P(ctx, '#c98a5a'); ctx.metalness(0.6); ctx.roughness(0.35);
    lathe(ctx, [[h, 0.13], [h + 0.16, 0.14], [h + 0.17, 0.15]], 10, x + 0.12, 0.02);
    lathe(ctx, [[h + 0.17, 0.14], [h + 0.2, 0.1], [h + 0.23, 0.02]], 10, x + 0.12, 0.02);
    box(ctx, x + 0.12 + 0.2, h + 0.13, 0.02, 0.14, 0.025, 0.03);
    P(ctx, 'iron'); lathe(ctx, [[h, 0.09], [h + 0.12, 0.11], [h + 0.18, 0.08], [h + 0.2, 0.03]], 8, x + 0.48, 0.05);
    box(ctx, x + 0.6, h + 0.1, 0.05, 0.1, 0.03, 0.03);
    x += 0.7;
  }
  // bread on a board, then preserves along the back, herbs in little pots
  P(ctx, 'oak'); box(ctx, x + 0.12, h, -0.05, 0.36, 0.025, 0.24); P(ctx, '#c8924e'); blob(ctx, x + 0.12, h + 0.08, -0.05, 0.08, 6);
  x += 0.4;
  for (let i = 0; x < L / 2 - 0.12 && i < 6; i++, x += 0.14) {
    const c = pick(ctx, PRESERVES), jh = 0.12 + ctx.random() * 0.06;
    P(ctx, c); lathe(ctx, [[h, 0.05], [h + jh, 0.052]], 6, x, 0.15); P(ctx, 'flax'); lathe(ctx, [[h + jh, 0.058], [h + jh + 0.03, 0.045]], 6, x, 0.15);
  }
  for (const hx of [-L / 2 + 0.12, L / 2 - 0.14]) {
    P(ctx, '#c97a52'); lathe(ctx, [[h, 0.05], [h + 0.1, 0.065]], 7, hx, -0.12);
    P(ctx, pick(ctx, GREENS)); for (let i = 0; i < 5; i++) { const a = i * 2.4; leaf(ctx, [hx, h + 0.09, -0.12], norm(Math.cos(a) * 0.5, 1, Math.sin(a) * 0.5), 0.14, 0.03); }
  }
}
function stove(ctx, p, fine) {
  const w = p.w, d = p.d;
  P(ctx, 'limestone'); box(ctx, 0, 0, 0, w, 0.12, d);
  P(ctx, 'plaster', '#f0c9a0'); box(ctx, 0, 0.12, 0.02, w - 0.08, 0.72, d - 0.1);
  lathe(ctx, [[0.84, (w - 0.1) / 2], [0.98, (w - 0.16) / 2], [1.08, w * 0.3], [1.14, w * 0.16], [1.16, 0.12]], fine ? 12 : 8, 0, 0.02, false, (d - 0.1) / (w - 0.1));
  P(ctx, 'soot'); box(ctx, -0.12, 0.2, -d / 2 + 0.03, 0.56, 0.4, 0.03);
  P(ctx, '#ff9a4a'); glow(ctx, 2.6, 1.0, 0.22); box(ctx, -0.12, 0.23, -d / 2 + 0.01, 0.46, 0.12, 0.03);
  glow(ctx, 3.2, 1.6, 0.4);
  for (let i = 0; i < 4; i++) { const fx = -0.3 + i * 0.12, fh = 0.12 + ((i * 7) % 3) * 0.05; ctx.tri(fx - 0.05, 0.35, -d / 2 + 0.005, fx + 0.05, 0.35, -d / 2 + 0.005, fx, 0.35 + fh, -d / 2 + 0.005); }
  ctx.emissive(null);
  P(ctx, 'iron'); box(ctx, 0.36, 0.3, -d / 2 + 0.02, 0.3, 0.3, 0.03);
  if (fine) { P(ctx, 'brass'); box(ctx, 0.46, 0.44, -d / 2 - 0.005, 0.04, 0.04, 0.02); }
  P(ctx, 'limestone'); box(ctx, 0, 0.84, -d / 2 + 0.1, w - 0.04, 0.05, 0.22);
  P(ctx, 'iron'); lathe(ctx, [[1.12, 0.14], [1.2, 0.14], [1.2, 0.11], [p.pipe, 0.11]], 8, 0, 0.12, false);
  if (!fine) return;
  P(ctx, '#c98a5a'); ctx.metalness(0.6); ctx.roughness(0.35);
  lathe(ctx, [[0.89, 0.09], [0.98, 0.11], [1.06, 0.07], [1.08, 0.02]], 10, 0.35, -d / 2 + 0.1);
  box(ctx, 0.35 - 0.14, 0.97, -d / 2 + 0.1, 0.12, 0.025, 0.025);
  P(ctx, 'char'); for (let i = 0; i < 3; i++) lathe(ctx, [[0.12 + i * 0.001, 0.05]], 6, 0, 0);
  // a basket of split logs at the stove's side
  P(ctx, 'oak', '#c9a27a'); box(ctx, -w / 2 - 0.25, 0, -0.1, 0.4, 0.22, 0.4);
  P(ctx, 'char', '#a07a58'); for (let i = 0; i < 4; i++) box(ctx, -w / 2 - 0.25 + (i - 1.5) * 0.08, 0.22, -0.1, 0.07, 0.07, 0.36);
}
function jarshelf(ctx, p, fine) {
  const w = p.w, h = p.h, d = p.d, n = p.shelves;
  P(ctx, 'walnut');
  for (const s of [-1, 1]) box(ctx, s * (w / 2 - 0.03), 0, 0, 0.06, h, d);
  const step = (h - 0.15) / n;
  for (let i = 0; i <= n; i++) box(ctx, 0, 0.08 + i * step, 0, w - 0.06, 0.035, d);
  P(ctx, 'oak', '#e8d6bc'); box(ctx, 0, 0.1, d / 2 - 0.01, w - 0.06, h - 0.12, 0.02);
  for (let i = 0; i < n; i++) {
    const y = 0.08 + i * step + 0.035;
    if (!fine) { P(ctx, pick(ctx, PRESERVES)); box(ctx, 0, y, -0.02, w - 0.2, step * 0.55, d - 0.12); continue; }
    if (i === 0) { // sacks of flour and seed potatoes
      for (let k = 0; k < 3; k++) { P(ctx, 'flax', k % 2 ? '#efe2c4' : '#ffffff'); const sw = (w - 0.2) / 3; lathe(ctx, [[y, sw * 0.42], [y + step * 0.45, sw * 0.46], [y + step * 0.7, sw * 0.28], [y + step * 0.78, 0.04]], 6, -w / 2 + 0.1 + sw * (k + 0.5), 0); }
      continue;
    }
    for (let x = -w / 2 + 0.14; x < w / 2 - 0.12; x += 0.16) {
      if (ctx.random() < 0.12) continue;
      const jh = 0.13 + ctx.random() * 0.1, r = 0.05 + ctx.random() * 0.015, c = pick(ctx, PRESERVES);
      P(ctx, c); lathe(ctx, [[y, r], [y + jh, r * 1.05], [y + jh + 0.02, r * 0.8]], 6, x, -0.03, false);
      P(ctx, ctx.random() < 0.5 ? 'flax' : '#c94f4f'); lathe(ctx, [[y + jh + 0.02, r * 0.95], [y + jh + 0.045, r * 0.75]], 6, x, -0.03);
    }
  }
}
// a bench, bent so its ends come forward (params.curve), frame + cushions; params.seat makes it sittable
function sofa(ctx, p, fine) {
  const W = p.width, D = p.depth, cv = p.curve, S = Math.max(1, Math.round(W / 0.4));
  const T = (x, y, z) => [x, y, z - cv * (2 * x / W) ** 2];
  const sw = (W - 0.24) / S;
  for (let i = 0; i < S; i++) {
    const x = -W / 2 + 0.12 + sw * (i + 0.5);
    P(ctx, 'oak'); box(ctx, x, 0.08, 0, sw + 0.002, 0.22, D, T); box(ctx, x, 0.3, D / 2 - 0.08, sw + 0.002, p.back, 0.16, T);
    P(ctx, p.cloth); box(ctx, x, 0.3, -0.06, sw - (i % 2 ? 0.02 : 0), p.seat - 0.3 + 0.02, D - 0.2, T);
    P(ctx, p.cloth2); box(ctx, x, p.seat, D / 2 - 0.22, sw - 0.03, p.back - 0.2, 0.14, T);
  }
  P(ctx, 'oak');
  for (const s of [-1, 1]) {
    box(ctx, s * (W / 2 - 0.06), 0.08, 0, 0.12, p.seat + 0.18, D, T);
    for (const zz of [-D / 2 + 0.06, D / 2 - 0.06]) box(ctx, s * (W / 2 - 0.08), 0, zz, 0.07, 0.08, 0.07, T);
  }
  if (!fine) return;
  const pal = ['teal', 'flax', 'moss'];
  for (let k = 0; k < (W > 1.2 ? 2 : 1); k++) {
    const s = W > 1.2 ? (k ? 1 : -1) : 0, x = s * (W / 2 - 0.4);
    P(ctx, pal[k % 3]); box(ctx, x, p.seat + 0.02, D / 2 - 0.34, 0.38, 0.36, 0.12, (a, b, c) => T(a, b + (c - D / 2) * 0.1, c));
  }
  if (p.throw) { P(ctx, 'moss'); box(ctx, W / 2 - 0.5, p.seat + 0.001, -0.05, 0.5, 0.03, D - 0.25, T); box(ctx, W / 2 - 0.5, 0.2, -D / 2 - 0.005, 0.5, p.seat - 0.18, 0.03, T); }
}
function planter(ctx, p, fine) {
  const L = p.len, d = p.d, h = p.h;
  P(ctx, 'oak', '#e6cfae');
  box(ctx, 0, 0, -d / 2 + 0.02, L, h, 0.04); box(ctx, 0, 0, d / 2 - 0.02, L, h, 0.04);
  for (const s of [-1, 1]) box(ctx, s * (L / 2 - 0.02), 0, 0, 0.04, h, d - 0.08);
  P(ctx, 'iron'); for (const s of [-1, 1]) box(ctx, s * (L / 2 - 0.12), h - 0.1, -d / 2 + 0.005, 0.05, 0.05, 0.02);
  P(ctx, '#4d392a'); box(ctx, 0, h - 0.07, 0, L - 0.06, 0.03, d - 0.06);
  const n = fine ? Math.floor(L / 0.11) : Math.floor(L / 0.3), y = h - 0.04;
  for (let i = 0; i < n; i++) {
    const x = -L / 2 + 0.08 + (L - 0.16) * (i + 0.5) / n, z = (ctx.random() - 0.5) * (d - 0.14), sh = 0.18 + ctx.random() * 0.2;
    P(ctx, pick(ctx, GREENS));
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + i; leaf(ctx, [x, y, z], norm(Math.cos(a) * 0.8, 1, Math.sin(a) * 0.8), 0.14 + ctx.random() * 0.06, 0.035); }
    ctx.quad(x - 0.006, y, z, x + 0.006, y, z, x + 0.006, y + sh, z, x - 0.006, y + sh, z);
    const c = p.hues?.length ? p.hues[i % p.hues.length] : pick(ctx, FLOWERS), fr = 0.045 + ctx.random() * 0.02, top = y + sh;
    P(ctx, c);
    for (let k = 0; k < 5; k++) { const a0 = k * TAU / 5, a1 = a0 + TAU / 10, a2 = a0 + TAU / 5; ctx.tri(x, top, z, x + Math.cos(a1) * fr, top + 0.012, z + Math.sin(a1) * fr, x + Math.cos(a2) * fr * 0.35, top, z + Math.sin(a2) * fr * 0.35); ctx.tri(x, top, z, x + Math.cos(a0) * fr * 0.35, top, z + Math.sin(a0) * fr * 0.35, x + Math.cos(a1) * fr, top + 0.012, z + Math.sin(a1) * fr); }
    if (fine) { P(ctx, '#f2c94c'); lathe(ctx, [[top, 0.012], [top + 0.015, 0.001]], 4, x, z); }
  }
  if (fine) { P(ctx, '#5d8a47'); for (let i = 0; i < 5; i++) { const x = -L / 2 + 0.15 + i * (L - 0.3) / 4; leaf(ctx, [x, h, -d / 2], norm(0.2, -1, -0.5), 0.18, 0.04); } }
}
function pot(ctx, p, fine) {
  const H = p.plant, r = p.r;
  P(ctx, '#c97a52'); lathe(ctx, [[0, r * 0.7], [0.05, r * 0.78], [r * 1.6, r], [r * 1.6 + 0.04, r * 1.08], [r * 1.6 + 0.07, r * 1.02]], fine ? 10 : 7, 0, 0);
  const y = r * 1.6 + 0.05; P(ctx, '#4d392a'); lathe(ctx, [[y, r * 0.95]], 8, 0, 0);
  if (p.kind === 'fern') {
    const n = fine ? 12 : 6;
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996, up = 0.8 + (i % 3) * 0.3, L = H * (0.5 + (i % 4) * 0.12), c = Math.cos(a), s = Math.sin(a);
      P(ctx, GREENS[i % GREENS.length]);
      const d1 = norm(c * 0.6, up, s * 0.6), m = [c * 0.02 + d1[0] * L * 0.55, y + d1[1] * L * 0.55, s * 0.02 + d1[2] * L * 0.55];
      leaf(ctx, [c * 0.02, y, s * 0.02], d1, L * 0.6, 0.07); leaf(ctx, m, norm(c, -0.3, s), L * 0.5, 0.06);
    }
    return;
  }
  // a fiddle-leaf fig: a trunk and big leaves spiralling up it
  P(ctx, 'oak', '#8a6a4a'); lathe(ctx, [[y, 0.025], [y + H * 0.85, 0.015]], 5, 0, 0, false);
  const n = fine ? 16 : 7;
  for (let i = 0; i < n; i++) {
    const f = 0.25 + 0.75 * i / n, a = i * 2.39996, yy = y + H * 0.85 * f;
    P(ctx, GREENS[i % 3]); leaf(ctx, [0, yy, 0], norm(Math.cos(a), 0.35 + (i % 3) * 0.2, Math.sin(a)), 0.22 + 0.08 * (1 - f), 0.09);
  }
}
function hanging(ctx, p, fine) {
  const D = p.drop, pr = 0.13;
  P(ctx, 'iron'); box(ctx, 0, -0.04, 0, 0.05, 0.04, 0.05);
  P(ctx, 'flax', '#d9c7a0');
  for (let i = 0; i < 3; i++) { const a = i * TAU / 3, x = Math.cos(a) * pr, z = Math.sin(a) * pr; ctx.quad(-0.006, -0.04, 0, 0.006, -0.04, 0, x + 0.006, -D, z, x - 0.006, -D, z); }
  P(ctx, '#c97a52'); lathe(ctx, [[-D - 0.18, 0.09], [-D - 0.02, pr], [-D, pr + 0.015]], fine ? 9 : 6, 0, 0, false);
  lathe(ctx, [[-D - 0.18, 0.001], [-D - 0.18, 0.09]], 6, 0, 0, false);
  const top = -D - 0.02;
  for (let i = 0; i < (fine ? 7 : 4); i++) { const a = i * 2.39996; P(ctx, GREENS[i % 5]); leaf(ctx, [0, top, 0], norm(Math.cos(a) * 0.9, 0.6, Math.sin(a) * 0.9), 0.18, 0.05); }
  const vines = fine ? p.vines : 2, seg = fine ? 7 : 3;
  for (let v = 0; v < vines; v++) {
    const a = v * TAU / vines + 0.4; let x = Math.cos(a) * (pr + 0.01), z = Math.sin(a) * (pr + 0.01), y = top;
    const len = p.trail * (0.6 + ((v * 5) % 4) * 0.13), st = len / seg;
    for (let k = 0; k < seg; k++) {
      const nx = x + Math.cos(a + k * 0.5) * 0.03, nz = z + Math.sin(a + k * 0.5) * 0.03, ny = y - st;
      P(ctx, 'moss', '#b8d49a'); ctx.quad(x - 0.004, y, z, x + 0.004, y, z, nx + 0.004, ny, nz, nx - 0.004, ny, nz);
      P(ctx, GREENS[(v + k) % 5]); leaf(ctx, [nx, ny, nz], norm(Math.cos(a + k * 1.7), -0.3, Math.sin(a + k * 1.7)), 0.09, 0.04);
      x = nx; y = ny; z = nz;
    }
  }
}
function herbs(ctx, p, fine) {
  const L = p.len, ry = -p.drop;
  P(ctx, 'flax', '#d9c7a0'); for (const s of [-1, 1]) ctx.quad(s * L * 0.4 - 0.006, 0, 0, s * L * 0.4 + 0.006, 0, 0, s * L * 0.4 + 0.006, ry, 0, s * L * 0.4 - 0.006, ry, 0);
  P(ctx, 'oak', '#b89270'); box(ctx, 0, ry - 0.05, 0, L, 0.05, 0.05);
  if (!fine) { P(ctx, '#7d9a5a'); box(ctx, 0, ry - 0.4, 0, L - 0.2, 0.3, 0.06); return; }
  let i = 0;
  for (let x = -L / 2 + 0.12; x < L / 2 - 0.08; x += 0.16, i++) {
    const kind = i % 4, y = ry - 0.05;
    P(ctx, 'flax', '#c9b48a'); ctx.quad(x - 0.004, y, 0, x + 0.004, y, 0, x + 0.004, y - 0.08, 0, x - 0.004, y - 0.08, 0);
    if (kind === 1) { // an onion string
      for (let k = 0; k < 3; k++) { P(ctx, k % 2 ? '#efe6d4' : '#c8923e'); blob(ctx, x + (k % 2 ? 0.02 : -0.02), y - 0.14 - k * 0.1, 0, 0.045, 6); }
    } else if (kind === 3) { // chillies
      P(ctx, '#c0392b'); for (let k = 0; k < 4; k++) { const cx = x + (k - 1.5) * 0.018; ctx.tri(cx - 0.01, y - 0.08, 0, cx + 0.01, y - 0.08, 0, cx, y - 0.24 - (k % 2) * 0.04, 0); ctx.tri(cx, y - 0.08, -0.01, cx, y - 0.08, 0.01, cx, y - 0.24 - (k % 2) * 0.04, 0); }
    } else { // a bundle of drying herbs, lavender in every other
      const c = kind === 2 ? '#8f7cc0' : pick(ctx, ['#7d9a5a', '#8aa672', '#9baf84']);
      P(ctx, c); for (let k = 0; k < 6; k++) { const a = k * 1.05; leaf(ctx, [x, y - 0.08, 0], norm(Math.cos(a) * 0.25, -1, Math.sin(a) * 0.25), 0.26, 0.03); }
    }
  }
}
function lantern(ctx, p, fine) {
  const D = p.drop, L0 = D > 0 ? -D - 0.34 : 0;
  P(ctx, 'iron');
  if (D > 0) { ctx.quad(-0.008, 0, 0, 0.008, 0, 0, 0.008, L0 + 0.34, 0, -0.008, L0 + 0.34, 0); ctx.quad(0, 0, -0.008, 0, 0, 0.008, 0, L0 + 0.34, 0.008, 0, L0 + 0.34, -0.008); }
  box(ctx, 0, L0, 0, 0.22, 0.03, 0.22);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * 0.1, L0 + 0.03, sz * 0.1, 0.02, 0.24, 0.02);
  box(ctx, 0, L0 + 0.26, 0, 0.24, 0.02, 0.24);
  const ap = [0, L0 + 0.36, 0], c = [[-0.12, 0.12], [0.12, 0.12], [0.12, -0.12], [-0.12, -0.12]];
  for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; ctx.tri(a[0], L0 + 0.28, a[1], ...ap, b[0], L0 + 0.28, b[1]); }
  P(ctx, '#ffe2a8'); glow(ctx, 1.3, 0.85, 0.35);
  for (const [nx, nz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    const tx = -nz, tz = nx, o = 0.095;
    ctx.quad(nx * o - tx * 0.085, L0 + 0.04, nz * o - tz * 0.085, nx * o + tx * 0.085, L0 + 0.04, nz * o + tz * 0.085, nx * o + tx * 0.085, L0 + 0.25, nz * o + tz * 0.085, nx * o - tx * 0.085, L0 + 0.25, nz * o - tz * 0.085);
  }
  ctx.emissive(null);
  if (fine) { P(ctx, 'cream'); lathe(ctx, [[L0 + 0.03, 0.03], [L0 + 0.12, 0.03]], 6, 0, 0); P(ctx, '#ffd27a'); glow(ctx, 3.5, 1.9, 0.5); lathe(ctx, [[L0 + 0.12, 0.014], [L0 + 0.15, 0.012], [L0 + 0.18, 0.001]], 5, 0, 0, false); ctx.emissive(null); }
}
function crate(ctx, p, fine) {
  const w = p.w, d = p.d, h = p.h;
  P(ctx, 'oak', '#ecd8b8');
  box(ctx, 0, 0, 0, w, 0.03, d);
  for (let k = 0; k < 3; k++) { const y = 0.03 + k * (h - 0.03) / 3; box(ctx, 0, y, -d / 2 + 0.01, w, (h - 0.03) / 3 - 0.02, 0.02); box(ctx, 0, y, d / 2 - 0.01, w, (h - 0.03) / 3 - 0.02, 0.02); for (const s of [-1, 1]) box(ctx, s * (w / 2 - 0.01), y, 0, 0.02, (h - 0.03) / 3 - 0.02, d - 0.04); }
  P(ctx, 'walnut'); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03), 0.05, h, 0.05);
  if (p.fill === 'none') return;
  const pal = { apples: ['#c8443a', '#d9573f', '#9bb04a'], potatoes: ['#b89060', '#a67f52'], carrots: ['#e8863a'], onions: ['#c8923e', '#efe6d4'] }[p.fill] || ['#c8443a'];
  if (!fine) { P(ctx, pal[0]); box(ctx, 0, h - 0.1, 0, w - 0.08, 0.08, d - 0.08); return; }
  for (let i = 0; i < 9; i++) {
    const x = (ctx.random() - 0.5) * (w - 0.16), z = (ctx.random() - 0.5) * (d - 0.16);
    P(ctx, pick(ctx, pal));
    if (p.fill === 'carrots') { ctx.tri(x - 0.03, h - 0.02, z, x + 0.03, h - 0.02, z, x + 0.12, h - 0.06, z + 0.02); P(ctx, '#5d8a47'); leaf(ctx, [x - 0.02, h - 0.02, z], norm(-1, 1, 0), 0.08, 0.02); }
    else blob(ctx, x, h - 0.05 + ctx.random() * 0.03, z, 0.05, 5);
  }
}
function bed(ctx, p, fine) {
  const w = p.w, l = p.l, zb = l / 2;
  P(ctx, 'oak');
  for (const s of [-1, 1]) { box(ctx, s * (w / 2 - 0.04), 0.1, 0, 0.08, 0.2, l); box(ctx, s * (w / 2 - 0.045), 0, zb - 0.045, 0.09, p.head, 0.09); box(ctx, s * (w / 2 - 0.045), 0, -zb + 0.045, 0.09, 0.55, 0.09); }
  box(ctx, 0, 0.1, -zb + 0.04, w - 0.1, 0.35, 0.05);
  box(ctx, 0, 0.3, zb - 0.045, w - 0.1, p.head - 0.42, 0.04);
  box(ctx, 0, p.head - 0.12, zb - 0.045, w + 0.04, 0.07, 0.1);
  if (fine) { P(ctx, '#6a9f45'); leaf(ctx, [0, p.head - 0.45, zb - 0.07], [0, 1, 0], 0.26, 0.09); leaf(ctx, [0, p.head - 0.4, zb - 0.07], norm(-0.8, 1, 0), 0.18, 0.06); leaf(ctx, [0, p.head - 0.4, zb - 0.07], norm(0.8, 1, 0), 0.18, 0.06); }
  P(ctx, 'cream'); box(ctx, 0, 0.3, 0, w - 0.1, 0.17, l - 0.1);
  P(ctx, 'cream', '#fff7ea'); for (const s of [-1, 1]) box(ctx, s * 0.3 * (w / 1.4), 0.47, zb - 0.28, w * 0.4, 0.12, 0.3, (x, y, z) => [x, y + (z - (zb - 0.28)) * 0.25, z]);
  const q0 = -zb + 0.02, q1 = zb - 0.52;
  if (!fine) { P(ctx, 'moss'); box(ctx, 0, 0.47, (q0 + q1) / 2, w - 0.04, 0.03, q1 - q0); return; }
  const cols = 4, rows = 5, pw = (w - 0.04) / cols, pd = (q1 - q0) / rows, pal = ['#9baf84', '#e9c46a', '#d98f6b', '#5dada9', '#f2e6cf', '#b5838d'];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { P(ctx, pal[(r * 3 + c * 2 + (r % 2)) % pal.length]); box(ctx, -w / 2 + 0.02 + pw * (c + 0.5), 0.47, q0 + pd * (r + 0.5), pw - 0.004, 0.035, pd - 0.004); }
  P(ctx, 'moss'); for (const s of [-1, 1]) box(ctx, s * (w / 2 - 0.005), 0.24, (q0 + q1) / 2, 0.02, 0.265, q1 - q0); box(ctx, 0, 0.24, q0 - 0.005, w, 0.265, 0.02);
  P(ctx, 'oat'); box(ctx, 0, 0.47, q1 + 0.06, w - 0.02, 0.06, 0.16);
}
function desk(ctx, p, fine) {
  const w = p.w, d = p.d, h = p.h;
  P(ctx, 'walnut'); box(ctx, 0, h - 0.04, 0, w, 0.04, d);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.05), 0, sz * (d / 2 - 0.05), 0.05, h - 0.04, 0.05);
  P(ctx, 'oak'); box(ctx, 0, h - 0.16, -d / 2 + 0.03, w * 0.5, 0.11, 0.03);
  if (!fine) return;
  P(ctx, 'brass'); box(ctx, 0, h - 0.115, -d / 2 + 0.005, 0.05, 0.02, 0.02);
  const books = ['#5dada9', '#b8413a', '#9baf84'];
  for (let i = 0; i < 3; i++) { P(ctx, books[i]); box(ctx, -w / 2 + 0.2, h + i * 0.045, 0.08, 0.24 - i * 0.02, 0.04, 0.17); }
  P(ctx, 'cream'); box(ctx, 0.05, h, -0.05, 0.3, 0.004, 0.22);
  P(ctx, 'iron'); lathe(ctx, [[h, 0.025], [h + 0.04, 0.02]], 6, 0.28, 0.1);
  P(ctx, '#c97a52'); lathe(ctx, [[h, 0.04], [h + 0.07, 0.05]], 7, w / 2 - 0.12, 0.12);
  P(ctx, '#79a35b'); for (let i = 0; i < 5; i++) blob(ctx, w / 2 - 0.12 + Math.cos(i * 1.3) * 0.02, h + 0.09, 0.12 + Math.sin(i * 1.3) * 0.02, 0.025, 4);
}
function lamp(ctx, p, fine) {
  const h = p.h;
  P(ctx, 'iron'); lathe(ctx, [[0, 0.16], [0.03, 0.15], [0.04, 0.04]], 10, 0, 0);
  P(ctx, 'brass'); lathe(ctx, [[0.04, 0.016], [h - 0.28, 0.016]], 6, 0, 0, false);
  P(ctx, 'oat'); glow(ctx, 1.2, 0.8, 0.42); lathe(ctx, [[h - 0.34, 0.23], [h - 0.02, 0.13]], 10, 0, 0, false);
  P(ctx, '#fff0c8'); glow(ctx, 3.2, 2.1, 0.9); blob(ctx, 0, h - 0.22, 0, 0.05, 6); ctx.emissive(null);
}
function nightstand(ctx, p, fine) {
  const w = p.w, d = p.d, h = p.h;
  P(ctx, 'walnut'); box(ctx, 0, 0.05, 0, w - 0.02, h - 0.08, d - 0.02);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.03), 0, sz * (d / 2 - 0.03), 0.04, 0.06, 0.04);
  P(ctx, 'oak'); box(ctx, 0, h - 0.03, 0, w, 0.03, d); box(ctx, 0, h - 0.24, -d / 2 + 0.005, w - 0.06, 0.15, 0.02);
  if (fine) { P(ctx, 'brass'); box(ctx, 0, h - 0.175, -d / 2 - 0.01, 0.04, 0.03, 0.02); P(ctx, '#5dada9'); box(ctx, 0.08, h, 0.04, 0.16, 0.035, 0.22); }
}
function candle(ctx, p, fine) {
  const n = p.n, pts = [[0, 0], [0.07, 0.04], [-0.05, 0.06]];
  P(ctx, 'brass'); lathe(ctx, [[0, 0.09], [0.012, 0.1], [0.018, 0.05]], 8, 0, 0.02);
  for (let i = 0; i < n; i++) {
    const [x, z] = pts[i], ch = 0.16 - i * 0.04;
    P(ctx, 'cream'); lathe(ctx, [[0.018, 0.022], [0.018 + ch, 0.02]], 6, x, z);
    P(ctx, '#ffd27a'); glow(ctx, 3.6, 2.0, 0.55); lathe(ctx, [[0.02 + ch, 0.01], [0.035 + ch, 0.012], [0.06 + ch, 0.001]], 4, x, z, false); ctx.emissive(null);
  }
}
// flat area rug, w (x) × l (z), origin centre of its underside: border c2, field c1, accent lines c3
function arearug(ctx, p, fine) {
  const w = p.w, l = p.l, t = 0.012, b = Math.min(w, l) * 0.08, y = t + 0.001;
  const top = (x0, z0, x1, z1, yy) => ctx.quad(x0, yy, z0, x0, yy, z1, x1, yy, z1, x1, yy, z0);
  P(ctx, p.c2); box(ctx, 0, 0, 0, w, t, l);
  P(ctx, p.c1); top(-w / 2 + b, -l / 2 + b, w / 2 - b, l / 2 - b, y);
  if (!fine) return;
  P(ctx, p.c3); const e = b * 0.35;
  for (const k of [0.6, 1.9]) { const i = b * k; top(-w / 2 + i, -l / 2 + i, w / 2 - i, -l / 2 + i + e, y + 0.001); top(-w / 2 + i, l / 2 - i - e, w / 2 - i, l / 2 - i, y + 0.001); top(-w / 2 + i, -l / 2 + i, -w / 2 + i + e, l / 2 - i, y + 0.001); top(w / 2 - i - e, -l / 2 + i, w / 2 - i, l / 2 - i, y + 0.001); }
  const r = Math.min(w, l) * 0.22, cy = y + 0.002;
  ctx.quad(0, cy, -r, -r * 0.8, cy, 0, 0, cy, r, r * 0.8, cy, 0);
  P(ctx, p.c2); const r2 = r * 0.45; ctx.quad(0, cy + 0.001, -r2, -r2 * 0.8, cy + 0.001, 0, 0, cy + 0.001, r2, r2 * 0.8, cy + 0.001, 0);
}
// walnut picture frame, origin at the canvas centre, back on z = 0 (the wall); the canvas is the row's textured child box
function painting(ctx, p, fine) {
  const w = p.w, h = p.h, f = 0.07, d = 0.045;
  P(ctx, 'walnut');
  box(ctx, 0, h / 2, -d / 2, w + 2 * f, f, d); box(ctx, 0, -h / 2 - f, -d / 2, w + 2 * f, f, d);
  box(ctx, -w / 2 - f / 2, -h / 2, -d / 2, f, h, d); box(ctx, w / 2 + f / 2, -h / 2, -d / 2, f, h, d);
  P(ctx, '#3a2a1e'); box(ctx, 0, -h / 2, -0.006, w, h, 0.012);
  if (fine) { P(ctx, 'brass'); const g = 0.012; box(ctx, 0, h / 2 - g, -d + 0.004, w, g, 0.008); box(ctx, 0, -h / 2, -d + 0.004, w, g, 0.008); box(ctx, -w / 2 + g / 2, -h / 2, -d + 0.004, g, h, 0.008); box(ctx, w / 2 - g / 2, -h / 2, -d + 0.004, g, h, 0.008); }
}
// giant round rug: a flat ring round the tree (origin at the tree), concentric bands inside out, a tasselled fringe at the rim
function annulus(ctx, r0, r1, y, n) {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
    ctx.quad(c0 * r0, y, s0 * r0, c1 * r0, y, s1 * r0, c1 * r1, y, s1 * r1, c0 * r1, y, s0 * r1);
  }
}
function roundrug(ctx, p, fine) {
  const n = fine ? 64 : 40, t = p.t, ri = p.ri, ro = p.ro, cols = p.bands, k = cols.length;
  // bands: weights give the width share of each colour, thin accents between the wide fields
  const wts = p.weights && p.weights.length === k ? p.weights : cols.map(() => 1), sum = wts.reduce((a, b) => a + b, 0);
  let r = ri;
  for (let i = 0; i < k; i++) { const r1 = i === k - 1 ? ro : r + (ro - ri) * wts[i] / sum; P(ctx, cols[i]); annulus(ctx, r, r1, t, n); r = r1; }
  // the rim and inner edge, stood down to the floor
  P(ctx, cols[k - 1]);
  for (const rr of [ri, ro]) for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU;
    ctx.quad(Math.cos(a0) * rr, 0, Math.sin(a0) * rr, Math.cos(a0) * rr, t, Math.sin(a0) * rr, Math.cos(a1) * rr, t, Math.sin(a1) * rr, Math.cos(a1) * rr, 0, Math.sin(a1) * rr);
  }
  if (!fine) return;
  // fringe: short cream tassels splayed outward from the rim
  P(ctx, p.fringe); const m = 120, L = 0.09, w = 0.022;
  for (let i = 0; i < m; i++) {
    const a = (i / m) * TAU, c = Math.cos(a), s = Math.sin(a), tx = -s * w, tz = c * w, y = 0.002;
    ctx.quad(c * ro + tx, y, s * ro + tz, c * ro - tx, y, s * ro - tz, c * (ro + L) - tx * 0.4, y, s * (ro + L) - tz * 0.4, c * (ro + L) + tx * 0.4, y, s * (ro + L) + tz * 0.4);
  }
}
// low walnut sideboard: plinth, carcass, oak top, three sage doors with brass knobs; a clay vase of stems, books and a candle on top
function sideboard(ctx, p, fine) {
  const w = p.w, d = p.d, h = p.h;
  P(ctx, 'walnut'); box(ctx, 0, 0, 0.02, w - 0.08, 0.1, d - 0.08); box(ctx, 0, 0.1, 0, w, h - 0.14, d);
  P(ctx, 'oak'); box(ctx, 0, h - 0.04, -0.01, w + 0.06, 0.04, d + 0.04);
  const dw = (w - 0.08) / 3;
  for (let i = 0; i < 3; i++) {
    const cx = -w / 2 + 0.04 + dw * (i + 0.5);
    P(ctx, p.door); box(ctx, cx, 0.15, -d / 2 - 0.012, dw - 0.03, h - 0.24, 0.02);
    if (fine) { P(ctx, 'brass'); box(ctx, cx + (i === 2 ? -1 : 1) * (dw / 2 - 0.07), h * 0.5, -d / 2 - 0.03, 0.025, 0.06, 0.02); }
  }
  if (!fine) return;
  // clay vase with stems, a stack of books, a candle
  P(ctx, '#c97a52'); lathe(ctx, [[h, 0.05], [h + 0.08, 0.1], [h + 0.2, 0.08], [h + 0.28, 0.04], [h + 0.3, 0.05]], 8, -w * 0.3, 0);
  P(ctx, '#6a9f45'); for (let i = 0; i < 5; i++) { const a = i * 1.26; box(ctx, -w * 0.3 + Math.cos(a) * 0.05, h + 0.28, Math.sin(a) * 0.05, 0.012, 0.22 + (i % 2) * 0.08, 0.012); }
  const bk = ['#b0553a', '#5dada9', '#efe3c8', '#9baf84'];
  for (let i = 0; i < 4; i++) { P(ctx, bk[i]); box(ctx, w * 0.12 + (i % 2) * 0.01, h + i * 0.045, 0, 0.3 - i * 0.02, 0.045, 0.22); }
  P(ctx, '#efe3c8'); lathe(ctx, [[h, 0.03], [h + 0.14, 0.03]], 6, w * 0.36, 0);
  P(ctx, '#ffe2a8'); glow(ctx, 1.3, 0.75, 0.3); box(ctx, w * 0.36, h + 0.14, 0, 0.012, 0.035, 0.012); ctx.emissive(null);
}
const ITEMS = { roundrug, sideboard, counter, stove, jarshelf, sofa, planter, pot, hanging, herbs, lantern, crate, bed, desk, lamp, nightstand, candle, arearug, painting };
export const DEFAULTS = {
  counter: { len: 2.4, d: 0.62, h: 0.9, sink: false, pots: false },
  stove: { w: 1.3, d: 0.95, pipe: 3.1 },
  jarshelf: { w: 1.5, h: 1.9, d: 0.38, shelves: 4 },
  sofa: { width: 2.2, depth: 0.85, seat: 0.46, back: 0.5, curve: 0.16, cloth: 'moss', cloth2: 'oat', throw: false },
  planter: { len: 1.3, d: 0.32, h: 0.38, hues: null },
  pot: { kind: 'fig', plant: 1.3, r: 0.2 },
  hanging: { drop: 0.8, vines: 5, trail: 0.7 },
  herbs: { len: 1.6, drop: 0.25 },
  lantern: { drop: 0 },
  crate: { w: 0.6, d: 0.42, h: 0.36, fill: 'apples' },
  bed: { w: 1.4, l: 2.0, head: 1.0 },
  desk: { w: 1.0, d: 0.55, h: 0.75 },
  lamp: { h: 1.4 },
  nightstand: { w: 0.45, d: 0.4, h: 0.55 },
  candle: { n: 1 },
  arearug: { w: 2.6, l: 1.8, c1: '#b0553a', c2: '#efe3c8', c3: '#4f3828' },
  painting: { w: 1.2, h: 0.9 },
  roundrug: { ri: 0.65, ro: 3.8, t: 0.006, bands: ['#4f3828', '#efe3c8', '#b0553a', '#ba8950', '#efe3c8', '#9baf84', '#b0553a', '#5dada9', '#4f3828'], weights: null, fringe: '#efe3c8' },
  sideboard: { w: 1.4, d: 0.45, h: 0.8, door: '#9baf84' },
};
const dims = (it, p) => ({
  counter: [p.len, p.h, p.d], stove: [p.w, 1.16, p.d], jarshelf: [p.w, p.h, p.d], sofa: [p.width, p.seat + 0.3, p.depth],
  planter: [p.len, p.h, p.d], pot: [p.r * 2.1, p.r * 1.6 + 0.07, p.r * 2.1], crate: [p.w, p.h, p.d], bed: [p.w, 0.6, p.l],
  desk: [p.w, p.h, p.d], nightstand: [p.w, p.h, p.d], lamp: [0.32, p.h, 0.32],
  arearug: [p.w, 0.013, p.l], sideboard: [p.w, p.h, p.d],
})[it];
const HULL_PAINT = { arearug: '#b98a60', counter: '#9baf84', stove: '#f0c9a0', jarshelf: '#8a6444', sofa: '#7d9a5a', sideboard: '#5a4030', planter: '#8aa672', pot: '#c97a52', crate: '#c9a27a', bed: '#9baf84', desk: '#8a6444', nightstand: '#8a6444', lamp: '#e9dcc0' };
export function geometry(ctx) {
  const it = ITEMS[ctx.params.item] ? ctx.params.item : 'crate', p = { ...DEFAULTS[it], ...ctx.params };
  ctx.flat(); ctx.roughness(0.8);
  if (ctx.lod >= 4) {
    const d = dims(it, p);
    if (!d) { if (it === 'lantern' || it === 'candle') { P(ctx, '#ffe2a8'); glow(ctx, 1.3, 0.85, 0.35); box(ctx, 0, p.drop > 0 ? -p.drop - 0.34 : 0, 0, 0.2, 0.3, 0.2); ctx.emissive(null); } else { P(ctx, '#6a9f45'); box(ctx, 0, -(p.drop || 0.3) - 0.3, 0, 0.3, 0.3, 0.3); } return; }
    if (it === 'painting') { P(ctx, 'walnut'); box(ctx, 0, -p.h / 2 - 0.07, -0.02, p.w + 0.14, p.h + 0.14, 0.04); return; }
    if (it === 'arearug') { P(ctx, p.c1); box(ctx, 0, 0, 0, p.w, 0.013, p.l); return; }
    if (it === 'roundrug') { P(ctx, p.bands[2] || p.bands[0]); annulus(ctx, p.ri, p.ro, p.t, 12); return; }
    P(ctx, HULL_PAINT[it]); box(ctx, 0, 0, 0, d[0], d[1], d[2]);
    if (it === 'stove') { P(ctx, 'iron'); box(ctx, 0, 1.1, 0.12, 0.2, p.pipe - 1.1, 0.2); }
    return;
  }
  ITEMS[it](ctx, p, ctx.lod <= 2);
}
export function collider(ctx) {
  const it = ctx.params.item, p = { ...DEFAULTS[it], ...ctx.params }, d = dims(it, p);
  if (it === 'roundrug') return null;
  if (!d || it === 'lamp' || it === 'arearug' || it === 'painting') return null;
  if (it === 'bed') return { kind: 'box', width: p.w, height: 0.6, depth: p.l };
  return { kind: 'box', width: d[0], height: d[1], depth: d[2] };
}
