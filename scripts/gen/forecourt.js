// The forecourt across the road from the grand gate. params.kind picks the piece; feet at ground, front toward −Z, metres.
// "market": the paved limestone slab (a height grid in params follows the ground), three striped market stalls with produce
//   and hanging signs, two lantern posts, a planter with an olive tree, a worn bench and a woven stone mosaic, one draw.
// "yard": the training yard's sand pad, a flower planter, two archery butts, straw bales and a practice-sword rack.
// "dummy": the straw training dummy on its post (its own row: it is pressed, see scripts/training-dummy.js).
import { paint, obox, beam, lathe, blob, TAU } from '../lib/yard-kit.js';
import { ngon, prism } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const STRAW = 'cdn/texture-golden-straw-bundle.png', SAND = 'cdn/texture-trodden-sandy-training-ground.png';
const C = {
  lime: (r) => `oklch(${(0.87 + r * 0.07).toFixed(3)} 0.022 ${(76 + r * 16).toFixed(0)})`, grout: 'oklch(0.66 0.02 70)',
  oak: 'oklch(0.93 0.04 75)', walnut: 'oklch(0.85 0.03 60)', iron: 'oklch(0.3 0.015 60)', cream: 'oklch(0.94 0.03 88)',
  teal: 'oklch(0.66 0.08 192)', terra: 'oklch(0.6 0.12 42)', sage: 'oklch(0.72 0.06 128)', slate: 'oklch(0.42 0.02 240)',
  glass: 'oklch(0.92 0.13 80)', glow: 'oklch(0.85 0.15 70)', straw: 'oklch(0.95 0.06 88)', rope: 'oklch(0.55 0.05 65)',
};
// a rigid frame: emits through ctx at an offset, pitched then yawed (radians, three.js sense); winding survives
function XF(ctx, ox, oy, oz, yaw = 0, pitch = 0) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const t = (a, i) => { const x = a[i], y = a[i + 1], z = a[i + 2], y1 = y * cp - z * sp, z1 = y * sp + z * cp; return [ox + x * cy + z1 * sy, oy + y1, oz - x * sy + z1 * cy]; };
  return { lod: ctx.lod,
    quad: (...a) => ctx.quad(...t(a, 0), ...t(a, 3), ...t(a, 6), ...t(a, 9)),
    tri: (...a) => ctx.tri(...t(a, 0), ...t(a, 3), ...t(a, 6)) };
}
// bilinear ground from params: h[] over nx × nz corners from (x0, z0), step s (local metres, relative to feet)
function ground(p) {
  const { x0 = 0, z0 = 0, s = 1, nx = 2, nz = 2, h = [] } = p.grid || {};
  return (x, z) => {
    const fx = Math.min(Math.max((x - x0) / s, 0), nx - 1.001), fz = Math.min(Math.max((z - z0) / s, 0), nz - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, g = (a, b) => h[b * nx + a] ?? 0;
    return (g(i, j) * (1 - u) + g(i + 1, j) * u) * (1 - v) + (g(i, j + 1) * (1 - u) + g(i + 1, j + 1) * u) * v;
  };
}
function disc(P, cx, cy, z, r, n) { for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; P.tri(cx, cy, z, cx + Math.cos(b) * r, cy + Math.sin(b) * r, z, cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); } }
function flatDisc(P, r, y, n) { for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; P.tri(0, y, 0, Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r); } }
const col = (ctx, c, rough = 0.8, e = null) => { ctx.albedo(null); ctx.color(c); ctx.roughness(rough); ctx.metalness(0); ctx.emissive(e); };

// ---------- market ----------
function paving(ctx, p, H, lod) {
  const [X0, X1, Z0, Z1] = p.slab, off = 0.03, step = lod <= 2 ? 1 : 2;
  paint(ctx, null, C.grout, 0.95);
  for (let x = X0; x < X1 - 1e-3; x += step) for (let z = Z0; z < Z1 - 1e-3; z += step) {
    const xa = x, xb = Math.min(x + step, X1), za = z, zb = Math.min(z + step, Z1);
    ctx.quad(xa, H(xa, za) + off, za, xa, H(xa, zb) + off, zb, xb, H(xb, zb) + off, zb, xb, H(xb, za) + off, za);
  }
  if (lod > 2) return;
  let row = 0;
  for (let z = Z0; z < Z1 - 0.05; z += 0.9, row++) {                        // running-bond flags, 1.2 × 0.9 m
    for (let x = X0 - (row % 2) * 0.6; x < X1 - 0.05; x += 1.2) {
      const xa = Math.max(x, X0) + 0.03, xb = Math.min(x + 1.2, X1) - 0.03, za = z + 0.03, zb = Math.min(z + 0.9, Z1) - 0.03;
      if (xb - xa < 0.1 || zb - za < 0.1) continue;
      paint(ctx, 'stone', C.lime(ctx.random()), 0.9); const o = off + 0.02;
      ctx.quad(xa, H(xa, za) + o, za, xa, H(xa, zb) + o, zb, xb, H(xb, zb) + o, zb, xb, H(xb, za) + o, za);
    }
  }
}
function mosaic(ctx, cx, cz, H, lod) {
  const R = lod <= 2 ? [0.22, 0.5, 0.78, 1.02, 1.26, 1.5] : [0.5, 1.5], y = (x, z) => H(x, z) + 0.07;
  const pal = [[C.slate, C.cream], [C.terra, C.sage], [C.cream, C.teal], [C.terra, C.cream], [C.sage, C.slate], ['oklch(0.45 0.04 55)', 'oklch(0.45 0.04 55)']];
  for (let k = 0; k < R.length; k++) {
    const r0 = k ? R[k - 1] : 0, r1 = R[k], n = lod <= 2 ? (k < 2 ? 12 : 24) : 12;
    for (let s = 0; s < n; s++) {
      const a = s / n * TAU, b = (s + 1) / n * TAU, pc = pal[Math.min(k, pal.length - 1)];
      paint(ctx, 'stone', pc[(s + k) % 2], 0.75);
      const p = (r, t) => { const x = cx + Math.cos(t) * r, z = cz + Math.sin(t) * r; return [x, y(x, z), z]; };
      if (!r0) { const c = [cx, y(cx, cz), cz]; ctx.tri(...c, ...p(r1, b), ...p(r1, a)); }
      else ctx.quad(...p(r0, a), ...p(r0, b), ...p(r1, b), ...p(r1, a));
    }
  }
}
const GOODS = {
  apples: (P, x, z, lod, ctx) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { paint(ctx, null, ['oklch(0.55 0.17 28)', 'oklch(0.6 0.16 40)', 'oklch(0.52 0.15 22)'][(i + j) % 3], 0.5); blob(P, x - 0.24 + i * 0.16, 1.1, z - 0.14 + j * 0.14, 0.075, 0.1, 0.075, lod <= 2 ? 5 : 4); } },
  greens: (P, x, z, lod, ctx) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { paint(ctx, null, ['oklch(0.72 0.14 125)', 'oklch(0.66 0.15 135)'][(i + j) % 2], 0.5); blob(P, x - 0.24 + i * 0.16, 1.1, z - 0.14 + j * 0.14, 0.075, 0.1, 0.075, 4); } },
  cabbage: (P, x, z, lod, ctx) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const bx = x - 0.21 + i * 0.21, bz = z - 0.1 + j * 0.2; paint(ctx, null, 'oklch(0.7 0.12 135)', 0.7); blob(P, bx, 1.08, bz, 0.12, 0.15, 0.12, 6, () => ctx.random()); if (lod <= 2) { paint(ctx, null, 'oklch(0.84 0.1 125)', 0.7); blob(P, bx, 1.14, bz, 0.07, 0.11, 0.07, 5); } } },
  bread: (P, x, z, lod, ctx) => { for (let j = 0; j < 4; j++) { paint(ctx, null, ['oklch(0.66 0.11 65)', 'oklch(0.72 0.1 72)'][j % 2], 0.7); blob(P, x, 1.1, z - 0.18 + j * 0.12, 0.26, 0.09, 0.055, 6); if (lod <= 2) { paint(ctx, null, 'oklch(0.85 0.07 80)', 0.8); for (const d of [-0.1, 0, 0.1]) obox(P, x + d, 1.175, z - 0.18 + j * 0.12, 0.03, 0.02, 0.07); } } },
  rounds: (P, x, z, lod, ctx) => { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { paint(ctx, null, ['oklch(0.62 0.11 60)', 'oklch(0.7 0.1 70)'][(i + j) % 2], 0.7); blob(P, x - 0.21 + i * 0.21, 1.08, z - 0.1 + j * 0.2, 0.1, 0.11, 0.1, 6); } },
};
function stall(ctx, s, H, lod) {
  const P = XF(ctx, s.x, H(s.x, s.z), s.z), W = 3, hw = 1.42, fz = -0.8, bz = 0.8, fh = 2.45, bh = 2.75;
  paint(ctx, 'oak', C.oak, 0.8);
  for (const x of [-hw, hw]) { obox(P, x, -0.25, fz, 0.12, fh + 0.25, 0.12); obox(P, x, -0.25, bz, 0.12, bh + 0.25, 0.12); }
  beam(P, [-hw - 0.1, fh - 0.08, fz], [hw + 0.1, fh - 0.08, fz], 0.1, 0.12); beam(P, [-hw - 0.1, bh - 0.08, bz], [hw + 0.1, bh - 0.08, bz], 0.1, 0.12);
  if (lod <= 2) for (const x of [-hw, hw]) beam(P, [x, fh - 0.12, fz], [x, bh - 0.12, bz], 0.08, 0.08);
  // counter: walnut body, oak top with an overhang, vertical front boards
  paint(ctx, 'walnut', C.walnut, 0.85); obox(P, 0, -0.1, -0.45, 2.7, 1.0, 0.62);
  paint(ctx, 'oak', C.oak, 0.7); obox(P, 0, 0.9, -0.48, 2.95, 0.06, 0.8);
  if (lod <= 2) { for (let i = 0; i < 7; i++) { paint(ctx, 'oak', i % 2 ? C.oak : 'oklch(0.88 0.05 70)', 0.85); obox(P, -1.14 + i * 0.38, 0.02, -0.77, 0.34, 0.82, 0.03); }
    paint(ctx, 'oak', C.oak, 0.8); obox(P, 0, 0, 0.5, 2.6, 0.72, 0.42);                    // back bench
    paint(ctx, 'oak', 'oklch(0.86 0.05 68)', 0.8); lathe(P, [[0.2, 0], [0.24, 0.2], [0.24, 0.42], [0.2, 0.6]], 8, -1.0, 0.5 - 0.02); // barrel
    paint(ctx, null, 'oklch(0.86 0.04 85)', 0.95); blob(P, 0.9, 0.72, 0.52, 0.22, 0.34, 0.16, 6, () => ctx.random()); blob(P, 0.45, 0.72, 0.55, 0.18, 0.28, 0.14, 5, () => ctx.random()); }
  // crates of goods on the counter
  for (let i = 0; i < 3; i++) {
    const cx = -0.88 + i * 0.88, cz = -0.5;
    paint(ctx, 'oak', 'oklch(0.9 0.05 72)', 0.85); obox(P, cx, 0.96, cz, 0.72, 0.16, 0.5);
    if (lod <= 2) { paint(ctx, 'oak', 'oklch(0.84 0.05 68)', 0.85); obox(P, cx, 1.02, cz - 0.255, 0.74, 0.07, 0.02); obox(P, cx, 1.02, cz + 0.255, 0.74, 0.07, 0.02); }
    if (lod <= 3) GOODS[s.goods[i]](P, cx, cz, lod, ctx);
  }
  // striped awning, back beam down to a scalloped valance
  const n = lod <= 2 ? 8 : 2, x0 = -1.62, sw = 3.24 / n, yb = bh + 0.02, zb = bz + 0.2, yf = fh - 0.02, zf = fz - 0.45;
  for (let i = 0; i < n; i++) {
    const a = x0 + i * sw, b = a + sw;
    col(ctx, lod <= 2 ? (i % 2 ? C.cream : s.awn) : s.awn, 0.95);
    ctx.albedo('cdn/texture-woven-linen-canvas.png');
    P.quad(a, yb, zb, b, yb, zb, b, yf, zf, a, yf, zf);
    P.quad(a, yf, zf, b, yf, zf, b, yf - 0.24, zf, a, yf - 0.24, zf);
    if (lod <= 2) P.tri(a, yf - 0.24, zf, b, yf - 0.24, zf, (a + b) / 2, yf - 0.38, zf);
  }
  if (lod <= 2) { col(ctx, s.awn, 0.95); ctx.albedo('cdn/texture-woven-linen-canvas.png'); for (const x of [x0, -x0]) P.tri(x, yb, zb, x, yf, zf, x, yf - 0.24, zf); }
  // hanging sign under the front beam
  if (lod <= 2) {
    paint(ctx, null, C.iron, 0.5, 0.6); for (const x of [-0.32, 0.32]) beam(P, [x, fh - 0.14, fz], [x, 2.08, fz - 0.02], 0.02, 0.02);
    paint(ctx, 'walnut', 'oklch(0.7 0.05 55)', 0.8); obox(P, 0, 1.9, fz - 0.02, 0.98, 0.26, 0.05);
    paint(ctx, null, C.cream, 0.8); obox(P, 0, 1.93, fz - 0.05, 0.86, 0.2, 0.01);
    col(ctx, s.mark, 0.6); disc(P, -0.24, 2.03, fz - 0.062, 0.07, 8); disc(P, 0.24, 2.03, fz - 0.062, 0.07, 8); disc(P, 0, 2.03, fz - 0.062, 0.085, 10);
    col(ctx, C.sage, 0.6); disc(P, 0.06, 2.12, fz - 0.063, 0.035, 5);
  }
}
function lanternPost(ctx, x, z, H, lod) {
  const P = XF(ctx, x, H(x, z), z);
  paint(ctx, 'stone', C.lime(0.4), 0.9); obox(P, 0, -0.1, 0, 0.36, 0.3, 0.36);
  paint(ctx, null, C.iron, 0.5, 0.6); obox(P, 0, 0.2, 0, 0.09, 2.2, 0.09); obox(P, 0, 2.35, 0, 0.3, 0.05, 0.3);
  if (lod <= 2) { obox(P, 0, 0.2, 0, 0.16, 0.14, 0.16); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(P, a * 0.11, 1.95, b * 0.11, 0.03, 0.4, 0.03); }
  obox(P, 0, 1.9, 0, 0.28, 0.05, 0.28); prism(P, ngon(4, 0.22, 0, 0, TAU / 8), 2.4, 2.56, 0.2);
  col(ctx, C.glass, 0.4, C.glow); obox(P, 0, 1.96, 0, 0.18, 0.38, 0.18); ctx.emissive(null);
}
function planter(ctx, P, L, lod, flowers) {                                   // along local z, length L, 0.85 wide
  paint(ctx, 'stone', C.lime(0.3), 0.9);
  if (lod <= 2) { obox(P, -0.365, -0.1, 0, 0.12, 0.6, L); obox(P, 0.365, -0.1, 0, 0.12, 0.6, L); obox(P, 0, -0.1, -L / 2 + 0.06, 0.61, 0.6, 0.12); obox(P, 0, -0.1, L / 2 - 0.06, 0.61, 0.6, 0.12);
    paint(ctx, 'stone', C.lime(0.8), 0.85); obox(P, 0, 0.5, 0, 0.95, 0.07, L + 0.1); paint(ctx, 'soil', 'oklch(0.9 0.02 60)', 1); obox(P, 0, 0.3, 0, 0.62, 0.14, L - 0.24); }
  else obox(P, 0, -0.1, 0, 0.85, 0.65, L);
  if (lod > 3) return;
  const n = lod <= 2 ? Math.round(L * 3) : Math.round(L);
  for (let i = 0; i < n; i++) {
    const z = -L / 2 + 0.3 + (i + 0.5) / n * (L - 0.6);
    if (flowers.skip && Math.abs(z - flowers.skip) < 0.45) continue;
    paint(ctx, null, ctx.random() < 0.5 ? 'oklch(0.62 0.1 138)' : 'oklch(0.56 0.09 145)', 0.9); blob(P, (ctx.random() - 0.5) * 0.3, 0.42, z, 0.2, 0.22, 0.17, 5, () => ctx.random());
    if (lod <= 2) for (let k = 0; k < 3; k++) { paint(ctx, null, flowers.cols[Math.floor(ctx.random() * flowers.cols.length)], 0.6); blob(P, (ctx.random() - 0.5) * 0.5, 0.56 + ctx.random() * 0.12, z + (ctx.random() - 0.5) * 0.28, 0.05, 0.06, 0.05, 4); }
  }
}
function olive(ctx, P, lod) {
  paint(ctx, 'walnut', 'oklch(0.72 0.03 70)', 0.95);
  const pts = [[0, 0.3, 0], [0.06, 0.8, 0.03], [-0.04, 1.25, -0.02], [0.05, 1.6, 0.04]];
  for (let i = 0; i < pts.length - 1; i++) beam(P, pts[i], pts[i + 1], 0.13 - i * 0.02, 0.13 - i * 0.02);
  if (lod <= 2) { beam(P, [-0.04, 1.25, -0.02], [-0.42, 1.7, 0.1], 0.06); beam(P, [0.05, 1.45, 0.04], [0.38, 1.85, -0.2], 0.06); }
  const cl = lod <= 2 ? [[0, 1.75, 0, 0.62, 0.55], [-0.45, 1.65, 0.15, 0.42, 0.4], [0.4, 1.8, -0.22, 0.45, 0.42], [0.1, 2.05, 0.2, 0.4, 0.4], [-0.15, 1.95, -0.3, 0.38, 0.35]] : [[0, 1.6, 0, 0.8, 0.8]];
  for (const [x, y, z, r, h] of cl) { paint(ctx, 'leaf', ctx.random() < 0.5 ? 'oklch(0.8 0.05 135)' : 'oklch(0.74 0.05 145)', 0.85); blob(P, x, y, z, r, h, r * 0.9, lod <= 2 ? 6 : 5, () => ctx.random()); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.35 0.05 300)', 0.4); for (let i = 0; i < 8; i++) { const a = ctx.random() * TAU; blob(P, Math.cos(a) * 0.55, 1.62 + ctx.random() * 0.3, Math.sin(a) * 0.5, 0.03, 0.05, 0.03, 4); } }
}
function bench(ctx, P, lod) {                                                  // well-worn: sunk middle plank, chipped stone legs
  paint(ctx, 'stone', C.lime(0.2), 0.95); for (const x of [-0.6, 0.6]) obox(P, x, -0.08, 0.02, 0.16, 0.48, 0.42);
  for (let i = 0; i < 3; i++) { paint(ctx, 'oak', i === 1 ? 'oklch(0.82 0.04 65)' : 'oklch(0.88 0.04 70)', 0.9); obox(P, (i - 1) * 0.02, i === 1 ? 0.395 : 0.4, -0.15 + i * 0.15, 1.6 - Math.abs(i - 1) * 0.04, 0.05, 0.13); }
  paint(ctx, 'oak', C.oak, 0.85); for (const x of [-0.6, 0.6]) obox(P, x, 0.4, 0.2, 0.06, 0.5, 0.06);
  obox(P, 0, 0.62, 0.21, 1.55, 0.1, 0.035); if (lod <= 2) obox(P, 0, 0.78, 0.21, 1.55, 0.1, 0.035);
}
function market(ctx, p, lod) {
  if (!p.slab || !p.stalls) { paint(ctx, 'stone', C.lime(0.5), 0.9); obox(ctx, 0, 0, 0, 2, 0.05, 2); return; }
  const H = ground(p);
  paving(ctx, p, H, lod);
  mosaic(ctx, p.mosaic[0], p.mosaic[1], H, lod);
  for (const s of p.stalls) stall(ctx, s, H, lod);
  for (const [x, z] of p.lamps) lanternPost(ctx, x, z, H, lod);
  const [px, pz, L] = p.planter, P = XF(ctx, px, H(px, pz), pz);
  planter(ctx, P, L, lod, { cols: ['oklch(0.95 0.03 90)', 'oklch(0.7 0.12 300)', 'oklch(0.72 0.14 35)', 'oklch(0.85 0.13 90)'], skip: p.tree - pz });
  olive(ctx, XF(ctx, px, H(px, pz) + 0.1, p.tree), lod);
  const [bx, bz] = p.bench; bench(ctx, XF(ctx, bx, H(bx, bz), bz, -Math.PI / 2), lod);
}
// ---------- yard ----------
function butt(ctx, P, lod) {                                                  // face toward local −Z
  paint(ctx, 'oak', C.oak, 0.85);
  for (const s of [-1, 1]) beam(P, [s * 0.5, -0.1, -0.2], [s * 0.34, 1.62, 0.12], 0.08);
  beam(P, [0, -0.1, 0.85], [0, 1.58, 0.12], 0.08); if (lod <= 2) beam(P, [-0.44, 0.45, -0.1], [0.44, 0.45, -0.1], 0.06);
  const B = XF({ quad: P.quad, tri: P.tri }, 0, 1.05, -0.02, 0, -78 * Math.PI / 180), n = lod <= 2 ? 14 : 8;
  ctx.albedo(STRAW); ctx.color(C.straw); ctx.roughness(1); ctx.emissive(null);
  lathe(B, [[0, 0], [0.5, 0], [0.56, 0.05], [0.56, 0.23], [0.5, 0.28]], n);
  const rings = [[0.5, C.cream], [0.4, C.slate], [0.3, C.teal], [0.2, C.terra], [0.1, 'oklch(0.85 0.15 88)']];
  rings.forEach(([r, c], i) => { col(ctx, c, 0.8); flatDisc(B, r, 0.284 + i * 0.004, n); });
  if (lod <= 2) { paint(ctx, null, C.rope, 0.9); for (const y of [0.08, 0.2]) lathe(B, [[0.565, y], [0.57, y + 0.015], [0.565, y + 0.03]], n); }
}
function yard(ctx, p, lod) {
  if (!p.pad) return;
  const H = ground(p), [X0, X1, Z0, Z1] = p.pad, st = lod <= 2 ? 0.93 : (X1 - X0) / 2;
  ctx.albedo(SAND); ctx.color('oklch(0.96 0.03 80)'); ctx.roughness(1); ctx.metalness(0); ctx.emissive(null);
  const nx = Math.round((X1 - X0) / st), nz = Math.round((Z1 - Z0) / st), J = {};
  const V = (i, j) => { const k = i + ',' + j; if (!J[k]) { const edge = i === 0 || j === 0 || i === nx || j === nz, x = X0 + i * (X1 - X0) / nx + (edge && lod <= 2 ? (ctx.random() - 0.5) * 0.4 : 0), z = Z0 + j * (Z1 - Z0) / nz + (edge && lod <= 2 ? (ctx.random() - 0.5) * 0.4 : 0); J[k] = [x, H(x, z) + 0.035, z]; } return J[k]; };
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) ctx.quad(...V(i, j), ...V(i, j + 1), ...V(i + 1, j + 1), ...V(i + 1, j));
  if (lod <= 2) { ctx.albedo(null); ctx.color('oklch(0.86 0.1 88)'); for (let i = 0; i < 36; i++) { const x = X0 + 0.3 + ctx.random() * (X1 - X0 - 0.6), z = Z0 + 0.3 + ctx.random() * (Z1 - Z0 - 0.6), a = ctx.random() * TAU, y = H(x, z) + 0.045, c = Math.cos(a) * 0.12, s = Math.sin(a) * 0.12; ctx.quad(x - c, y, z - s, x - c + s * 0.1, y, z - s - c * 0.1, x + c + s * 0.1, y, z + s - c * 0.1, x + c, y, z + s); } }
  const [px, pz, L] = p.planter; planter(ctx, XF(ctx, px, H(px, pz), pz), L, lod, { cols: ['oklch(0.95 0.03 90)', 'oklch(0.72 0.14 35)', 'oklch(0.85 0.13 90)', 'oklch(0.62 0.1 250)'] });
  for (const [x, z] of p.butts) butt(ctx, XF(ctx, x, H(x, z), z, Math.PI / 2), lod);
  for (const [x, z, yaw] of p.bales) { const P = XF(ctx, x, H(x, z), z, yaw); ctx.albedo(STRAW); ctx.color(C.straw); ctx.roughness(1); obox(P, 0, -0.05, 0, 0.9, 0.5, 0.5); if (lod <= 2) { paint(ctx, null, C.rope, 0.9); for (const d of [-0.22, 0.22]) obox(P, d, -0.05, 0, 0.03, 0.51, 0.51); } }
  const [rx, rz] = p.rack, R = XF(ctx, rx, H(rx, rz), rz, Math.PI);
  paint(ctx, 'oak', C.oak, 0.85); obox(R, -0.6, -0.1, 0, 0.08, 1.2, 0.08); obox(R, 0.6, -0.1, 0, 0.08, 1.2, 0.08); obox(R, 0, 0.95, 0, 1.3, 0.07, 0.1); obox(R, 0, 0.2, 0.12, 1.3, 0.05, 0.14);
  if (lod <= 2) for (let i = 0; i < 3; i++) { const x = -0.35 + i * 0.35; paint(ctx, 'oak', 'oklch(0.85 0.05 70)', 0.8); obox(R, x, 0.24, 0.08, 0.06, 0.95, 0.02); paint(ctx, 'walnut', C.walnut, 0.8); obox(R, x, 0.9, 0.08, 0.24, 0.04, 0.05); obox(R, x, 0.94, 0.08, 0.05, 0.22, 0.05); }
}
// ---------- dummy ----------
function dummy(ctx, lod) {
  const n = lod <= 2 ? 10 : 6;
  paint(ctx, 'stone', C.lime(0.3), 0.9); obox(ctx, 0, -0.1, 0, 0.5, 0.18, 0.5);
  paint(ctx, 'oak', 'oklch(0.85 0.05 68)', 0.9); obox(ctx, 0, 0, 0, 0.11, 1.95, 0.11);
  ctx.albedo(STRAW); ctx.color(C.straw); ctx.roughness(1); ctx.metalness(0); ctx.emissive(null);
  lathe(ctx, [[0, 0.74], [0.2, 0.78], [0.28, 0.95], [0.3, 1.18], [0.27, 1.4], [0.16, 1.5], [0, 1.52]], n);
  beam(ctx, [-0.64, 1.33, 0], [0.64, 1.33, 0], 0.13, 0.12);
  if (lod <= 2) for (const s of [-1, 1]) { obox(ctx, s * 0.7, 1.26, 0, 0.14, 0.14, 0.16); }
  paint(ctx, null, C.rope, 0.9);
  if (lod <= 2) { lathe(ctx, [[0.285, 0.9], [0.3, 0.93], [0.3, 0.97], [0.285, 1.0]], n); lathe(ctx, [[0.285, 1.26], [0.3, 1.29], [0.3, 1.33], [0.28, 1.36]], n); for (const s of [-1, 1]) obox(ctx, s * 0.5, 1.26, 0, 0.05, 0.145, 0.14); }
  ctx.albedo('cdn/texture-woven-linen-canvas.png'); ctx.color('oklch(0.86 0.05 75)'); ctx.roughness(1);
  lathe(ctx, [[0, 1.5], [0.12, 1.54], [0.17, 1.64], [0.16, 1.75], [0.1, 1.83], [0, 1.85]], n);
  if (lod <= 2) { paint(ctx, null, C.rope, 0.9); lathe(ctx, [[0.1, 1.5], [0.115, 1.53], [0.1, 1.56]], 8); col(ctx, C.slate, 0.7); for (const x of [-0.06, 0.06]) { beam(ctx, [x - 0.03, 1.72, -0.162], [x + 0.03, 1.66, -0.162], 0.012, 0.01); beam(ctx, [x - 0.03, 1.66, -0.162], [x + 0.03, 1.72, -0.162], 0.012, 0.01); } }
  col(ctx, C.cream, 0.7); disc(ctx, 0, 1.15, -0.303, 0.17, n); col(ctx, C.terra, 0.7); disc(ctx, 0, 1.15, -0.306, 0.11, n); col(ctx, C.cream, 0.7); disc(ctx, 0, 1.15, -0.309, 0.04, 8);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  if (p.kind === 'yard') yard(ctx, p, lod); else if (p.kind === 'dummy') dummy(ctx, lod); else market(ctx, p, lod);
});
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'dummy') { obox(ctx, 0, 0, 0, 0.55, 1.85, 0.55); return; }
  if (!p.slab && !p.pad) return null;
  const H = ground(p);
  if (p.kind === 'yard') {
    const [px, pz, L] = p.planter; obox(ctx, px, H(px, pz) - 0.1, pz, 0.95, 0.67, L + 0.1);
    for (const [x, z] of p.butts) obox(ctx, x, H(x, z) - 0.1, z + 0, 0.9, 1.7, 1.1, Math.PI / 2);
    for (const [x, z, yaw] of p.bales) obox(ctx, x, H(x, z) - 0.05, z, 0.9, 0.5, 0.5, yaw);
    const [rx, rz] = p.rack; obox(ctx, rx, H(rx, rz) - 0.1, rz, 1.3, 1.1, 0.3); return;
  }
  for (const s of p.stalls) { const y = H(s.x, s.z); obox(ctx, s.x, y - 0.1, s.z - 0.47, 2.95, 1.06, 0.8); for (const x of [-1.42, 1.42]) obox(ctx, s.x + x, y - 0.1, s.z + 0.8, 0.14, 2.8, 0.14); obox(ctx, s.x, y - 0.1, s.z + 0.5, 2.9, 0.8, 0.5); }
  for (const [x, z] of p.lamps) obox(ctx, x, H(x, z) - 0.1, z, 0.36, 2.6, 0.36);
  const [px, pz, L] = p.planter; obox(ctx, px, H(px, pz) - 0.1, pz, 0.95, 0.67, L + 0.1);
  obox(ctx, px, H(px, p.tree), p.tree, 0.22, 1.9, 0.22);
  const [bx, bz] = p.bench; obox(ctx, bx, H(bx, bz) - 0.08, bz, 0.5, 0.52, 1.6);
}
