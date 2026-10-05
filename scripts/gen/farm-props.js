// Farmland props, one family: params.item barn | mill | sails | scarecrow | wain | apple | barrels | cart | ladder.
// Origin at the feet, front toward −Z. Honey oak and walnut, red barn boards, pale limestone, straw, linen.
import { beam, obox, lathe, blob, TAU } from '../lib/yard-kit.js';
import { solid, box, ngon, gem } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const TX = {
  barn: 'cdn/texture-red-painted-barn-boards.png', oak: 'cdn/texture-honey-oak-barn-planks.png', walnut: 'cdn/texture-hand-joined-walnut-wood.png',
  stone: 'cdn/texture-pale-limestone-flagstone.png', shingle: 'cdn/texture-weathered-cedar-shingles.png', thatch: 'cdn/texture-thatched-straw-roof.png',
  hay: 'cdn/texture-golden-hay-straw.png', burlap: 'cdn/texture-burlap-sack-cloth.png', linen: 'cdn/texture-cream-linen-sailcloth.png',
  leaf: 'cdn/texture-lush-green-ivy-leaves.png', bark: 'cdn/texture-apple-tree-bark.png', plaster: 'cdn/texture-limewash-plaster.png',
};
function paint(ctx, t, col, r = 0.88, m = 0) { ctx.albedo(t ? TX[t] : null); ctx.color(col); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); }
const W = 'oklch(0.95 0.02 80)';
// a cross-section (x,y pairs) swept straight along z
const extZ = (ctx, poly, z0, z1) => solid(ctx, poly.map(([x, y]) => [x, y, z0]), poly.map(([x, y]) => [x, y, z1]));
// a wheel whose axle runs along x
function wheel(ctx, x0, x1, cy, cz, r, lod) {
  const n = lod <= 2 ? 14 : 8, ring = (rr, x) => ngon(n, rr).map(([u, v]) => [x, cy + v, cz + u]);
  paint(ctx, 'walnut', 'oklch(0.8 0.03 60)');
  solid(ctx, ring(r, x0), ring(r, x1));
  if (lod <= 2) { paint(ctx, null, 'oklch(0.35 0.01 60)', 0.6, 0.6); solid(ctx, ring(r + 0.03, x0 - 0.01).map((p, i) => p), ring(r + 0.03, x1 + 0.01)); }
  paint(ctx, 'oak', W); solid(ctx, ring(0.1, x0 - 0.05), ring(0.1, x1 + 0.05));
}
function rimWheel(ctx, x, cy, cz, r, lod) {
  // spoked wheel: rim ring + hub + spokes
  const n = lod <= 2 ? 16 : 8, xm = x;
  paint(ctx, 'walnut', 'oklch(0.82 0.03 60)');
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, b = (i + 1) / n * TAU;
    beam(ctx, [xm, cy + Math.sin(a) * r, cz + Math.cos(a) * r], [xm, cy + Math.sin(b) * r, cz + Math.cos(b) * r], 0.09, 0.1);
  }
  if (lod <= 3) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; beam(ctx, [xm, cy, cz], [xm, cy + Math.sin(a) * r * 0.95, cz + Math.cos(a) * r * 0.95], 0.05, 0.05); }
  paint(ctx, 'oak', W); const h = ngon(8, 0.1).map(([u, v]) => [0, cy + v, cz + u]);
  solid(ctx, h.map((p) => [xm - 0.12, p[1], p[2]]), h.map((p) => [xm + 0.12, p[1], p[2]]));
}

function barn(ctx, col) {
  const p = ctx.params, lod = ctx.lod || 1, w = p.w ?? 8, d = p.d ?? 10, h = p.h ?? 4, rise = p.rise ?? 3, t = 0.2, dw = p.dw ?? 3, dh = p.dh ?? 3.2, lh = p.loft ?? 3, lz = -d / 2 + d * 0.42;
  const B = [];
  B.push([-w / 2, 0, d / 2 - t, w / 2, h, d / 2], [-w / 2, 0, -d / 2, -w / 2 + t, h, d / 2], [w / 2 - t, 0, -d / 2, w / 2, h, d / 2]);
  B.push([-w / 2 + t, 0, -d / 2, -dw / 2, h, -d / 2 + t], [dw / 2, 0, -d / 2, w / 2 - t, h, -d / 2 + t], [-dw / 2, dh, -d / 2, dw / 2, h, -d / 2 + t]);
  B.push([-w / 2 + t, lh, lz, w / 2 - t, lh + 0.14, d / 2 - t]);
  if (col) { for (const b of B) box(ctx, ...b); extZ(ctx, [[-w / 2 - 0.7, h - 0.5], [0, h + rise + 0.15], [w / 2 + 0.7, h - 0.5]], -d / 2 - 0.5, d / 2 + 0.5); return; }
  // limestone footing
  paint(ctx, 'stone', W, 0.95); box(ctx, -w / 2 - 0.1, -0.3, -d / 2 - 0.1, w / 2 + 0.1, 0.35, -d / 2 + 0.25); box(ctx, -w / 2 - 0.1, -0.3, d / 2 - 0.25, w / 2 + 0.1, 0.35, d / 2 + 0.1);
  box(ctx, -w / 2 - 0.1, -0.3, -d / 2, -w / 2 + 0.25, 0.35, d / 2); box(ctx, w / 2 - 0.25, -0.3, -d / 2, w / 2 + 0.1, 0.35, d / 2);
  // red board walls and gables
  paint(ctx, 'barn', W, 0.85);
  for (const b of B.slice(0, 6)) box(ctx, ...b);
  for (const z of [-d / 2, d / 2 - t]) extZ(ctx, [[-w / 2, h], [w / 2, h], [0, h + rise]], z, z + t);
  // white trim: corner boards, door frame, eave fascia, loft hay door
  paint(ctx, 'oak', 'oklch(0.97 0.01 85)', 0.8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * w / 2 - 0.12, 0.3, sz * d / 2 - 0.12, sx * w / 2 + 0.12, h, sz * d / 2 + 0.12);
  box(ctx, -dw / 2 - 0.18, 0, -d / 2 - 0.06, -dw / 2, dh + 0.18, -d / 2 + t + 0.02); box(ctx, dw / 2, 0, -d / 2 - 0.06, dw / 2 + 0.18, dh + 0.18, -d / 2 + t + 0.02);
  box(ctx, -dw / 2 - 0.18, dh, -d / 2 - 0.06, dw / 2 + 0.18, dh + 0.18, -d / 2);
  box(ctx, -0.8, h + 0.3, -d / 2 - 0.06, 0.8, h + 0.45, -d / 2); box(ctx, -0.8, h + 1.7, -d / 2 - 0.06, 0.8, h + 1.85, -d / 2);
  box(ctx, -0.8, h + 0.3, -d / 2 - 0.06, -0.65, h + 1.85, -d / 2); box(ctx, 0.65, h + 0.3, -d / 2 - 0.06, 0.8, h + 1.85, -d / 2);
  paint(ctx, 'walnut', 'oklch(0.6 0.03 50)'); box(ctx, -0.65, h + 0.45, -d / 2 - 0.02, 0.65, h + 1.7, -d / 2 + 0.02);
  // swung-open door leaves with white X braces
  for (const s of [-1, 1]) {
    const hx = s * (dw / 2 + 0.2), x1 = hx + s * 0.18, z0 = -d / 2 - 0.12, z1 = z0 - dw / 2 * 0.98;
    paint(ctx, 'barn', W, 0.85); box(ctx, Math.min(hx, x1), 0.05, z1, Math.max(hx, x1), dh, z0);
    if (lod <= 2) { paint(ctx, 'oak', 'oklch(0.97 0.01 85)', 0.8); const xo = x1 + s * 0.03; beam(ctx, [xo, 0.2, z0 - 0.1], [xo, dh - 0.2, z1 + 0.1], 0.05, 0.14); beam(ctx, [xo, dh - 0.2, z0 - 0.1], [xo, 0.2, z1 + 0.1], 0.05, 0.14); }
  }
  // shingled roof, crossing the walls at their plane and overhanging
  paint(ctx, 'shingle', 'oklch(0.9 0.02 60)', 0.9);
  const s = rise / (w / 2), ov = 0.7;
  for (const sx of [-1, 1]) extZ(ctx, [[0, h + rise + 0.02], [sx * (w / 2 + ov), h - ov * s + 0.02], [sx * (w / 2 + ov), h - ov * s + 0.2], [0, h + rise + 0.22]], -d / 2 - 0.5, d / 2 + 0.5);
  paint(ctx, 'walnut', 'oklch(0.7 0.03 55)'); extZ(ctx, [[-0.16, h + rise + 0.15], [0.16, h + rise + 0.15], [0.16, h + rise + 0.33], [-0.16, h + rise + 0.33]], -d / 2 - 0.55, d / 2 + 0.55);
  // interior: board floor, loft with joists and posts, a ladder up
  paint(ctx, 'oak', W, 0.85); box(ctx, -w / 2 + t, 0, -d / 2 + t, w / 2 - t, 0.08, d / 2 - t);
  box(ctx, ...B[6]);
  paint(ctx, 'walnut', 'oklch(0.8 0.03 55)');
  for (let k = 0; k <= 4; k++) { const x = -w / 2 + t + 0.1 + (w - 2 * t - 0.2) * k / 4; box(ctx, x - 0.1, lh - 0.25, lz, x + 0.1, lh, d / 2 - t); }
  box(ctx, -w / 2 + t, lh - 0.3, lz - 0.1, w / 2 - t, lh, lz + 0.12);
  for (const x of [-w / 4, w / 4]) box(ctx, x - 0.12, 0.08, lz - 0.08, x + 0.12, lh - 0.3, lz + 0.16);
  if (lod <= 2) {
    const lx = w / 2 - t - 0.9; for (const o of [-0.25, 0.25]) beam(ctx, [lx + o, 0.08, lz - 1.1], [lx + o, lh + 0.9, lz + 0.05], 0.07, 0.07);
    for (let y = 0.4; y < lh + 0.7; y += 0.32) { const f = y / (lh + 0.82); beam(ctx, [lx - 0.25, y, lz - 1.1 + 1.15 * f], [lx + 0.25, y, lz - 1.1 + 1.15 * f], 0.05, 0.05); }
    paint(ctx, 'hay', 'oklch(0.95 0.05 90)', 0.95); const R = () => ctx.random();
    for (let i = 0; i < 5; i++) blob(ctx, -w / 2 + 1 + i * (w - 2) / 4, lh + 0.14, d / 2 - 1.4 - R() * 1.2, 0.9 + R() * 0.4, 0.6 + R() * 0.5, 0.9 + R() * 0.4, 7, R);
  }
}
function mill(ctx, col) {
  const lod = ctx.lod || 1, H = ctx.params.h ?? 8.5, n = lod <= 2 ? 8 : 6;
  if (col) { const r = ngon(8, 2.2); solid(ctx, r.map(([x, z]) => [x, 0, z]), ngon(8, 1.5).map(([x, z]) => [x, H, z])); return; }
  const ring = (r, y) => ngon(n, r, 0, 0, Math.PI / n).map(([x, z]) => [x, y, z]);
  paint(ctx, 'stone', W, 0.95); solid(ctx, ring(2.65, -0.3), ring(2.5, 1.1));
  paint(ctx, 'plaster', 'oklch(0.97 0.02 85)', 0.9); solid(ctx, ring(2.35, 1.1), ring(1.55, H));
  paint(ctx, 'walnut', 'oklch(0.75 0.03 55)'); solid(ctx, ring(2.4, H * 0.55), ring(2.2, H * 0.55 + 0.18)); solid(ctx, ring(1.7, H - 0.2), ring(1.7, H + 0.05));
  paint(ctx, 'thatch', W, 0.95); lathe(ctx, [[1.95, H - 0.05], [1.6, H + 1.0], [0.9, H + 1.9], [0, H + 2.5]], lod <= 2 ? 12 : 7);
  // door and windows on the −Z face
  const face = (r, y) => -Math.cos(Math.PI / n) * (2.35 + (1.55 - 2.35) * (y - 1.1) / (H - 1.1)) - 0.04;
  paint(ctx, 'walnut', 'oklch(0.62 0.04 50)'); box(ctx, -0.55, 1.1, face(0, 1.1) - 0.1, 0.55, 3.0, face(0, 1.1) + 0.1);
  paint(ctx, 'oak', 'oklch(0.97 0.01 85)'); box(ctx, -0.7, 2.95, face(0, 3) - 0.14, 0.7, 3.15, face(0, 3) + 0.05);
  paint(ctx, null, 'oklch(0.35 0.04 240)', 0.3); box(ctx, -0.35, 5.2, face(0, 5.2) - 0.08, 0.35, 6.0, face(0, 5.2) + 0.1);
  // axle housing toward −Z
  paint(ctx, 'walnut', 'oklch(0.72 0.03 55)'); box(ctx, -0.5, H - 0.4, -2.25, 0.5, H + 0.5, -1.0);
  paint(ctx, 'oak', W); const a = ngon(8, 0.2).map(([u, v]) => [u, H + 0.05 + v]); extZ(ctx, a, -2.45, -1.2);
}
function sails(ctx) {
  const lod = ctx.lod || 1, L = ctx.params.len ?? 5.4;
  paint(ctx, 'oak', W); lathe(ctx, [[0.32, 0], [0.3, 0.3], [0, 0.42]].map(([r, y]) => [r, y]), 8, 0, 0);
  for (let k = 0; k < 4; k++) {
    const a = k * TAU / 4 + 0.3, c = Math.cos(a), s = Math.sin(a), ux = -s, uy = c;
    const P = (r, o, z = 0) => [c * r + ux * o, s * r + uy * o, z];
    paint(ctx, 'walnut', 'oklch(0.8 0.03 55)'); beam(ctx, P(0, 0, -0.05), P(L, 0, -0.05), 0.18, 0.16);
    if (lod <= 3) {
      beam(ctx, P(1.1, 0.9, -0.1), P(L, 0.9, -0.1), 0.06, 0.06);
      for (let r = 1.1; r <= L + 0.01; r += lod <= 2 ? 0.55 : 1.1) beam(ctx, P(r, -0.05, -0.1), P(r, 0.95, -0.1), 0.05, 0.05);
      paint(ctx, 'linen', 'oklch(0.97 0.02 85)', 0.95);
      ctx.quad(...P(1.15, 0.05, -0.02), ...P(L - 0.05, 0.05, -0.02), ...P(L - 0.05, 0.85, -0.02), ...P(1.15, 0.85, -0.02));
    }
  }
}
function scarecrow(ctx) {
  const lod = ctx.lod || 1, R = () => ctx.random();
  paint(ctx, 'walnut', 'oklch(0.78 0.03 55)'); beam(ctx, [0, -0.3, 0], [0, 2.0, 0], 0.1, 0.1); beam(ctx, [-0.85, 1.55, 0], [0.85, 1.55, 0], 0.08, 0.08);
  paint(ctx, 'burlap', 'oklch(0.9 0.05 40)', 0.95);
  solid(ctx, [[-0.32, 0.8, -0.16], [0.32, 0.8, -0.16], [0.36, 0.8, 0.16], [-0.36, 0.8, 0.16]], [[-0.26, 1.62, -0.13], [0.26, 1.62, -0.13], [0.26, 1.62, 0.13], [-0.26, 1.62, 0.13]]);
  for (const s of [-1, 1]) beam(ctx, [s * 0.2, 1.52, 0], [s * 0.72, 1.5, 0], 0.18, 0.18);
  paint(ctx, 'burlap', 'oklch(0.96 0.03 80)', 0.95); blob(ctx, 0, 1.62, 0, 0.21, 0.42, 0.2, 7, R);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.25 0.02 40)'); for (const s of [-1, 1]) box(ctx, s * 0.08 - 0.03, 1.86, -0.21, s * 0.08 + 0.03, 1.92, -0.17); box(ctx, -0.07, 1.76, -0.21, 0.07, 1.78, -0.17); }
  paint(ctx, 'hay', 'oklch(0.97 0.05 90)', 0.95); lathe(ctx, [[0.5, 1.93], [0.48, 1.97], [0.2, 2.0], [0.17, 2.2], [0, 2.26]], 10);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) gem(ctx, s * (0.8 + R() * 0.05), 1.5 + (i - 1) * 0.05, (i - 1) * 0.05, 0.03, 0.03, 0.03, 3);
  paint(ctx, null, 'oklch(0.62 0.15 35)', 0.9); beam(ctx, [-0.3, 1.18, -0.17], [0.3, 1.18, -0.17], 0.03, 0.1);
  if (lod <= 2) for (let i = 0; i < 6; i++) { paint(ctx, 'hay', 'oklch(0.97 0.05 90)'); gem(ctx, -0.2 + i * 0.08, 0.78, (R() - 0.5) * 0.2, 0.04, 0.02, 0.14, 3); }
}
function wain(ctx, col) {
  const lod = ctx.lod || 1, R = () => ctx.random();
  if (col) { box(ctx, -0.9, 0, -1.7, 0.9, 1.9, 1.7); return; }
  paint(ctx, 'oak', W); box(ctx, -0.8, 0.72, -1.5, 0.8, 0.84, 1.5);
  for (const s of [-1, 1]) { box(ctx, s * 0.8 - 0.05, 0.84, -1.5, s * 0.8 + 0.05, 1.2, 1.5); for (let z = -1.4; z <= 1.41; z += 0.7) box(ctx, s * 0.84 - 0.04, 0.72, z - 0.04, s * 0.84 + 0.04, 1.3, z + 0.04); }
  box(ctx, -0.8, 0.84, 1.45, 0.8, 1.15, 1.55);
  paint(ctx, 'walnut', 'oklch(0.75 0.03 55)'); box(ctx, -0.07, 0.45, -1.2, 0.07, 0.72, 1.2);
  for (const z of [-1.0, 1.0]) box(ctx, -0.95, 0.5, z - 0.06, 0.95, 0.6, z + 0.06);
  for (const s of [-1, 1]) beam(ctx, [s * 0.35, 0.62, -1.4], [s * 0.3, 0.5, -3.0], 0.07, 0.07);
  for (const s of [-1, 1]) for (const z of [-1.0, 1.0]) rimWheel(ctx, s * 1.0, z < 0 ? 0.45 : 0.55, z, z < 0 ? 0.45 : 0.55, lod);
  paint(ctx, 'hay', 'oklch(0.97 0.05 90)', 0.95); blob(ctx, 0, 0.84, 0, 0.95, 1.05, 1.75, lod <= 2 ? 9 : 6, R);
  if (lod <= 2) blob(ctx, 0.2, 1.5, 0.4, 0.6, 0.45, 0.8, 7, R);
}
function apple(ctx, col) {
  const lod = ctx.lod || 1, R = () => ctx.random(), p = ctx.params, s = p.s ?? 1, cy = 2.5 * s;
  if (col) { box(ctx, -0.18, 0, -0.18, 0.18, 1.8, 0.18); return; }
  paint(ctx, 'bark', 'oklch(0.9 0.02 60)', 0.95);
  const tw = R() * TAU, lean = [(R() - 0.5) * 0.25, (R() - 0.5) * 0.25];
  solid(ctx, ngon(6, 0.2 * s, 0, 0, tw).map(([x, z]) => [x, -0.2, z]), ngon(6, 0.12 * s, lean[0], lean[1], tw).map(([x, z]) => [x, 1.5 * s, z]));
  const top = [lean[0], 1.45 * s, lean[1]], lobes = [];
  const nb = lod <= 2 ? 4 : 3;
  for (let i = 0; i < nb; i++) { const a = tw + i * TAU / nb + R() * 0.5, r = (0.9 + R() * 0.4) * s, e = [Math.cos(a) * r, cy + (R() - 0.2) * 0.5 * s, Math.sin(a) * r]; beam(ctx, top, e, 0.1 * s, 0.1 * s); lobes.push(e); }
  paint(ctx, 'leaf', 'oklch(0.93 0.05 135)', 0.85);
  const L = lod <= 2 ? 7 : 5;
  blob(ctx, 0, cy - 0.7 * s, 0, 1.75 * s, 1.75 * s, 1.75 * s, L + 2, R);
  if (lod <= 3) for (const e of lobes) blob(ctx, e[0] * 1.1, e[1] - 0.4 * s, e[2] * 1.1, 0.95 * s, 1.0 * s, 0.95 * s, L, R);
  if (lod >= 4) return;
  paint(ctx, null, 'oklch(0.58 0.2 28)', 0.45); ctx.emissive('oklch(0.18 0.06 28)');
  const nf = lod === 1 ? 26 : lod === 2 ? 14 : 8;
  for (let i = 0; i < nf; i++) {
    const a = R() * TAU, el = -0.25 + R() * 0.9, r = 1.78 * s, x = Math.cos(a) * Math.cos(el) * r, y = cy - 0.7 * s + 0.2 + Math.max(0, Math.sin(el)) * r * 0.95, z = Math.sin(a) * Math.cos(el) * r;
    gem(ctx, x, y, z, 0.085, 0.08, 0.08, lod === 1 ? 5 : 4);
  }
  if (lod <= 2) for (let i = 0; i < (p.windfall ?? 6); i++) { const a = R() * TAU, r = 0.6 + R() * 1.6; gem(ctx, Math.cos(a) * r, 0.09, Math.sin(a) * r, 0.085, 0.08, 0.08, 5); }
  ctx.emissive(null);
}
function barrel(ctx, x, z, lod, lying) {
  const prof = [[0.34, 0], [0.4, 0.2], [0.43, 0.45], [0.4, 0.7], [0.34, 0.9]];
  paint(ctx, 'oak', 'oklch(0.93 0.03 70)', 0.85); lathe(ctx, prof, lod <= 2 ? 12 : 7, x, z);
  paint(ctx, 'walnut', 'oklch(0.75 0.03 55)'); lathe(ctx, [[0.3, 0.88], [0.3, 0.9], [0, 0.91]], 10, x, z);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.33 0.01 60)', 0.5, 0.7); for (const y of [0.12, 0.72]) lathe(ctx, [[prof[1][0] + 0.02, y], [prof[1][0] + 0.02, y + 0.06], [0, y + 0.07]], 12, x, z); lathe(ctx, [[0.445, 0.4], [0.445, 0.48], [0, 0.49]], 12, x, z); }
}
function barrels(ctx, col) {
  const lod = ctx.lod || 1, n = ctx.params.n ?? 3, P = [[0, 0], [0.9, 0.1], [0.45, 0.8], [1.35, 0.9], [-0.9, 0.2]].slice(0, n);
  if (col) { box(ctx, -0.5, 0, -0.5, 0.5 + 0.9 * Math.min(1, n - 1), 0.95, 0.5 + 0.8 * (n > 2)); return; }
  for (const [x, z] of P) barrel(ctx, x, z, lod);
  paint(ctx, 'walnut', 'oklch(0.7 0.03 55)'); box(ctx, -0.04, 0.4, -0.5, 0.04, 0.46, -0.38);
}
function cart(ctx, col) {
  const lod = ctx.lod || 1, R = () => ctx.random();
  if (col) { box(ctx, -0.75, 0, -1, 0.75, 1.0, 1); return; }
  paint(ctx, 'oak', W); box(ctx, -0.6, 0.55, -0.9, 0.6, 0.62, 0.9);
  for (const s of [-1, 1]) box(ctx, s * 0.6 - 0.04, 0.62, -0.9, s * 0.6 + 0.04, 0.9, 0.9);
  box(ctx, -0.6, 0.62, 0.86, 0.6, 0.9, 0.94); box(ctx, -0.6, 0.62, -0.94, 0.6, 0.9, -0.86);
  paint(ctx, 'walnut', 'oklch(0.75 0.03 55)'); for (const s of [-1, 1]) beam(ctx, [s * 0.45, 0.6, 0.8], [s * 0.45, 0.85, 2.0], 0.06, 0.06);
  for (const s of [-1, 1]) beam(ctx, [s * 0.5, 0.55, -0.7], [s * 0.5, 0.0, -0.7], 0.06, 0.06);
  for (const s of [-1, 1]) rimWheel(ctx, s * 0.72, 0.5, 0.25, 0.5, lod);
  // two crates of apples in the bed
  for (const zc of [-0.45, 0.4]) {
    paint(ctx, 'oak', 'oklch(0.88 0.04 70)'); box(ctx, -0.5, 0.62, zc - 0.36, 0.5, 0.95, zc + 0.36);
    paint(ctx, null, 'oklch(0.58 0.2 28)', 0.45);
    const m = lod <= 2 ? 14 : 5; for (let i = 0; i < m; i++) gem(ctx, -0.4 + R() * 0.8, 0.98 + R() * 0.05, zc - 0.28 + R() * 0.56, 0.085, 0.08, 0.08, lod <= 2 ? 5 : 4);
  }
}
function ladder(ctx) {
  const L = ctx.params.len ?? 3.2;
  paint(ctx, 'oak', W);
  for (const x of [-0.22, 0.22]) box(ctx, x - 0.035, 0, -0.04, x + 0.035, L, 0.04);
  for (let y = 0.3; y < L; y += 0.3) beam(ctx, [-0.22, y, 0], [0.22, y, 0], 0.04, 0.04);
}
const K = { barn, mill, sails, scarecrow, wain, apple, barrels, cart, ladder };
export const geometry = softened(function geometry(ctx) { ctx.flat(); (K[ctx.params.item] || barrels)(ctx, false); });
export function collider(ctx) { const it = ctx.params.item; if (it === 'sails' || it === 'ladder' || it === 'scarecrow') return null; (K[it] || barrels)(ctx, true); }
