// Creekside picnic: a round limestone patio, an oak picnic table with attached benches, a striped umbrella,
// a checked runner with a teapot, cups, a basket and fruit, two lantern posts and two terracotta planters.
// Feet at the patio centre; table long side along x. params: { r } patio radius.
import { beam, lathe, lantern, paint, prism, box, gem, ngon, TAU } from '../lib/garden-kit.js';
const OAK = 'oklch(0.86 0.05 70)', STONE = 'oklch(0.93 0.015 85)';
const CANVAS = ['oklch(0.95 0.025 90)', 'oklch(0.62 0.15 35)'];
const TL = 1.9, TW = 0.82, TH = 0.74, BH = 0.45, BO = 0.66, POLE = 2.55;
const ring = (r, n, a0 = 0) => Array.from({ length: n }, (_, i) => [Math.cos(a0 + i / n * TAU) * r, Math.sin(a0 + i / n * TAU) * r]);
function table(ctx, lod) {
  paint(ctx, 'oak', OAK, 0.8);
  for (let i = 0; i < 5; i++) { const z = -TW / 2 + (i + 0.5) * TW / 5; box(ctx, -TL / 2, TH - 0.05, z - TW / 10 + 0.008, TL / 2, TH, z + TW / 10 - 0.008); }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) { const z = s * BO + (i - 0.5) * 0.14; box(ctx, -TL / 2 + 0.05, BH - 0.045, z - 0.065, TL / 2 - 0.05, BH, z + 0.065); }
  }
  for (const x of [-TL / 2 + 0.28, TL / 2 - 0.28]) {
    paint(ctx, 'oak', 'oklch(0.78 0.05 65)', 0.85);
    box(ctx, x - 0.04, TH - 0.12, -TW / 2 + 0.05, x + 0.04, TH - 0.05, TW / 2 - 0.05);
    box(ctx, x - 0.04, BH - 0.12, -BO - 0.16, x + 0.04, BH - 0.045, BO + 0.16);
    for (const s of [-1, 1]) beam(ctx, [x, 0.02, s * (BO + 0.1)], [x, TH - 0.06, s * 0.12], 0.08, 0.06);
    if (lod <= 2) beam(ctx, [x, 0.22, -BO], [x, 0.22, BO], 0.05, 0.05);
  }
}
function umbrella(ctx, lod) {
  paint(ctx, null, 'oklch(0.9 0.03 80)', 0.6);
  beam(ctx, [0, 0, 0], [0, POLE + 0.12, 0], 0.045);
  const n = 8, R = 1.55, rim = POLE - 0.42, apex = POLE, val = 0.16;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, p0 = [Math.cos(a0) * R, rim, Math.sin(a0) * R], p1 = [Math.cos(a1) * R, rim, Math.sin(a1) * R];
    ctx.albedo(null); ctx.color(CANVAS[i % 2]); ctx.roughness(0.95);
    ctx.tri(0, apex, 0, p1[0], p1[1], p1[2], p0[0], p0[1], p0[2]); ctx.tri(0, apex - 0.02, 0, p0[0], p0[1] - 0.01, p0[2], p1[0], p1[1] - 0.01, p1[2]);
    if (lod <= 2) { // scalloped valance
      const m = [(p0[0] + p1[0]) / 2, rim - val, (p0[2] + p1[2]) / 2];
      ctx.tri(p0[0], rim, p0[2], p1[0], rim, p1[2], m[0], m[1], m[2]); ctx.tri(p0[0], rim, p0[2], m[0], m[1], m[2], p1[0], rim, p1[2]);
      paint(ctx, null, 'oklch(0.85 0.03 80)', 0.6); beam(ctx, [0, POLE - 0.55, 0], [p0[0] * 0.55, rim + 0.19, p0[2] * 0.55], 0.018);
    }
  }
  paint(ctx, null, 'oklch(0.76 0.11 85)', 0.35, 0.7); gem(ctx, 0, apex + 0.1, 0, 0.06, 0.06, 0.06, lod <= 2 ? 6 : 4);
}
function spread(ctx, lod) {
  const y = TH + 0.004;
  for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) {
    ctx.albedo(null); ctx.color((i + j) % 2 ? 'oklch(0.96 0.015 90)' : 'oklch(0.6 0.16 28)'); ctx.roughness(1);
    const x0 = -0.75 + i * 0.125, z0 = -0.19 + j * 0.125; ctx.quad(x0, y, z0, x0, y, z0 + 0.125, x0 + 0.125, y, z0 + 0.125, x0 + 0.125, y, z0);
  }
  if (lod > 2) return;
  const Y = y + 0.002;
  paint(ctx, null, 'oklch(0.93 0.03 200)', 0.35); // teapot
  lathe(ctx, [[0, 0], [0.07, 0], [0.1, 0.05], [0.095, 0.1], [0.05, 0.14], [0.02, 0.15], [0, 0.17]], 8, [0.15, Y, 0]);
  beam(ctx, [0.23, Y + 0.05, 0], [0.3, Y + 0.12, 0], 0.025); beam(ctx, [0.05, Y + 0.12, 0], [0.04, Y + 0.04, 0], 0.02);
  for (const [cx, cz] of [[-0.25, 0.25], [0.45, -0.22], [-0.5, -0.25]]) { paint(ctx, null, 'oklch(0.95 0.02 90)', 0.4); lathe(ctx, [[0, 0], [0.035, 0], [0.045, 0.07], [0.04, 0.07], [0, 0.01]], 7, [cx, Y, cz]); ctx.color('oklch(0.45 0.08 50)'); lathe(ctx, [[0, 0.055], [0.04, 0.055]], 7, [cx, Y, cz]); }
  paint(ctx, null, 'oklch(0.7 0.09 70)', 0.95); // basket
  box(ctx, -0.72, Y, 0.05, -0.42, Y + 0.16, 0.27);
  ctx.color('oklch(0.62 0.09 65)'); beam(ctx, [-0.7, Y + 0.16, 0.16], [-0.57, Y + 0.3, 0.16], 0.02); beam(ctx, [-0.57, Y + 0.3, 0.16], [-0.44, Y + 0.16, 0.16], 0.02);
  ctx.color('oklch(0.62 0.16 30)'); ctx.quad(-0.71, Y + 0.165, 0.06, -0.43, Y + 0.165, 0.06, -0.43, Y + 0.165, 0.26, -0.71, Y + 0.165, 0.26);
  paint(ctx, null, 'oklch(0.9 0.02 90)', 0.5); lathe(ctx, [[0, 0], [0.06, 0], [0.12, 0.06], [0.11, 0.065], [0, 0.02]], 8, [0.55, Y, 0.15]); // fruit bowl
  for (const [fx, fz, c] of [[0.52, 0.13, 'oklch(0.72 0.17 60)'], [0.6, 0.18, 'oklch(0.6 0.19 28)'], [0.55, 0.2, 'oklch(0.8 0.15 110)'], [0.59, 0.1, 'oklch(0.72 0.17 60)']]) { ctx.color(c); gem(ctx, fx, Y + 0.07, fz, 0.035, 0.035, 0.035, 6); }
}
function patio(ctx, R, lod) {
  const g = Math.min(...ring(R, 12).map(([x, z]) => ctx.groundY(x, z)), 0) - 0.08;
  paint(ctx, 'stone', 'oklch(0.8 0.02 80)', 0.95); prism(ctx, ring(R, 24), g, 0.03);
  const rings = lod <= 2 ? [[0, 0.9, 1], [0.95, 1.85, 9], [1.9, R - 0.04, 16]] : [[0, R - 0.04, 1]];
  for (const [r0, r1, n] of rings) for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU + 0.035 * (n > 1), a1 = (i + 1) / n * TAU - 0.035 * (n > 1), h = 0.06 + ctx.random() * 0.012;
    const l = 0.88 + ctx.random() * 0.08; paint(ctx, 'stone', `oklch(${l.toFixed(3)} 0.018 ${Math.round(75 + ctx.random() * 20)})`, 0.9);
    if (n === 1) { prism(ctx, ring(r1, 20), 0.03, h); continue; }
    const seg = 3, pts = [];
    for (let k = 0; k <= seg; k++) { const a = a0 + (a1 - a0) * k / seg; pts.push([Math.cos(a) * (r1 - 0.03), Math.sin(a) * (r1 - 0.03)]); }
    for (let k = seg; k >= 0; k--) { const a = a0 + (a1 - a0) * k / seg; pts.push([Math.cos(a) * (r0 + 0.03), Math.sin(a) * (r0 + 0.03)]); }
    prism(ctx, pts, 0.03, h);
  }
}
function post(ctx, x, z, lod) {
  paint(ctx, 'oak', 'oklch(0.7 0.05 60)', 0.85);
  box(ctx, x - 0.06, 0.05, z - 0.06, x + 0.06, 2.1, z + 0.06);
  const ox = x - Math.sign(x) * 0.35;
  beam(ctx, [x, 2.02, z], [ox, 2.02, z], 0.05);
  paint(ctx, null, 'oklch(0.3 0.01 250)', 0.6, 0.6); beam(ctx, [ox, 2.0, z], [ox, 1.85, z], 0.015);
  lantern(ctx, [ox, 1.43, z], lod);
}
function planter(ctx, x, z, lod) {
  paint(ctx, null, 'oklch(0.62 0.12 45)', 0.9);
  lathe(ctx, [[0, 0.05], [0.2, 0.05], [0.28, 0.46], [0.31, 0.5], [0.31, 0.54], [0.26, 0.54], [0.24, 0.5], [0, 0.5]], lod <= 2 ? 10 : 6, [x, 0, z]);
  ctx.color('oklch(0.4 0.1 140)'); gem(ctx, x, 0.66, z, 0.3, 0.2, 0.3, 7);
  if (lod <= 2) for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + ctx.random(), r = 0.1 + ctx.random() * 0.17; ctx.color(['oklch(0.72 0.17 30)', 'oklch(0.86 0.15 90)', 'oklch(0.7 0.15 330)'][i % 3]); gem(ctx, x + Math.cos(a) * r, 0.74 + ctx.random() * 0.1, z + Math.sin(a) * r, 0.05, 0.04, 0.05, 5); }
}
export function geometry(ctx) {
  const p = ctx.params || {}, R = p.r ?? 2.8, lod = ctx.lod || 1;
  ctx.flat();
  patio(ctx, R, lod);
  table(ctx, lod);
  spread(ctx, lod);
  umbrella(ctx, lod);
  post(ctx, -R + 0.35, -0.4, lod); post(ctx, R - 0.35, 0.4, lod);
  if (lod <= 3) { planter(ctx, -1.6, 1.75, lod); planter(ctx, 1.7, -1.7, lod); }
  ctx.albedo(null);
}
export function collider(ctx) {
  const R = (ctx.params || {}).r ?? 2.8;
  prism(ctx, ring(R, 16), -0.2, 0.07);
  box(ctx, -TL / 2, TH - 0.06, -TW / 2, TL / 2, TH, TW / 2);
  for (const s of [-1, 1]) box(ctx, -TL / 2 + 0.05, BH - 0.06, s * BO - 0.14, TL / 2 - 0.05, BH, s * BO + 0.14);
  box(ctx, -0.04, 0, -0.04, 0.04, POLE, 0.04);
  for (const [x, z] of [[-R + 0.35, -0.4], [R - 0.35, 0.4]]) box(ctx, x - 0.07, 0, z - 0.07, x + 0.07, 2.1, z + 0.07);
  for (const [x, z] of [[-1.6, 1.75], [1.7, -1.7]]) box(ctx, x - 0.3, 0, z - 0.3, x + 0.3, 0.55, z + 0.3);
}
