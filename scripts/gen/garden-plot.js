import { softened } from "./soften.js";
// Tower Gardens builder: params.item = bed (w, d) | crop (kind, stage 0..3, w, d, golden) | crate (kind) | stall | pump | veg (kind).
// Beds face -Z; a crop lays its plants on the bed's soil (origin = soil top centre).
const COL = { wood: 'oklch(0.55 0.08 60)', woodD: 'oklch(0.42 0.06 55)', soil: 'oklch(0.36 0.05 50)', leaf: 'oklch(0.58 0.14 140)', leafD: 'oklch(0.47 0.12 145)', stem: 'oklch(0.55 0.12 130)' };
let L = 1;
function box(ctx, x0, y0, z0, x1, y1, z1) { const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  for (const [a, b, c, d] of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]]) ctx.quad(...v[a], ...v[b], ...v[c], ...v[d]); }
function cyl(ctx, x, y0, z, y1, r0, r1, seg = 6) { for (let i = 0; i < seg; i++) { const a = i / seg * 6.2832, b = (i + 1) / seg * 6.2832;
  ctx.quad(x + Math.cos(a) * r0, y0, z + Math.sin(a) * r0, x + Math.cos(a) * r1, y1, z + Math.sin(a) * r1, x + Math.cos(b) * r1, y1, z + Math.sin(b) * r1, x + Math.cos(b) * r0, y0, z + Math.sin(b) * r0); } }
function ball(ctx, x, y, z, r, sy = 1, seg = 7, rib = 0) { const rings = L >= 3 ? 3 : 5, sg = L >= 3 ? 5 : seg;
  const P = (i, j) => { const t = (i / rings) * Math.PI, a = (j / sg) * 6.2832, rr = r * Math.sin(t) * (rib ? 1 - rib * (j % 2) : 1); return [x + Math.cos(a) * rr, y + Math.cos(t) * r * sy, z + Math.sin(a) * rr]; };
  for (let i = 0; i < rings; i++) for (let j = 0; j < sg; j++) ctx.quad(...P(i, j), ...P(i, j + 1), ...P(i + 1, j + 1), ...P(i + 1, j)); }
function leaf(ctx, x, y, z, ang, len, wid, rise, col) { ctx.color(col); const dx = Math.cos(ang), dz = Math.sin(ang), px = -dz, pz = dx;
  const tip = [x + dx * len, y + rise, z + dz * len], m = [x + dx * len * 0.5, y + rise * 0.75 + len * 0.1, z + dz * len * 0.5];
  const a = [m[0] + px * wid, m[1], m[2] + pz * wid], b = [m[0] - px * wid, m[1], m[2] - pz * wid];
  ctx.tri(x, y, z, ...a, ...tip); ctx.tri(x, y, z, ...tip, ...b); ctx.tri(...tip, ...a, x, y, z); ctx.tri(...b, ...tip, x, y, z); }
function rosette(ctx, x, z, n, len, wid, rise, cols, off = 0) { for (let i = 0; i < n; i++) leaf(ctx, x, 0.01, z, off + (i / n) * 6.2832, len, wid, rise, cols[i % cols.length]); }
function bed(ctx, w, d) {
  const h = 0.45, t = 0.07; ctx.roughness(0.85);
  ctx.color(COL.wood); box(ctx, -w / 2, 0, -d / 2, w / 2, h, -d / 2 + t); box(ctx, -w / 2, 0, d / 2 - t, w / 2, h, d / 2); box(ctx, -w / 2, 0, -d / 2, -w / 2 + t, h, d / 2); box(ctx, w / 2 - t, 0, -d / 2, w / 2, h, d / 2);
  ctx.color(COL.woodD); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * w / 2 - 0.05, 0, sz * d / 2 - 0.05, sx * w / 2 + 0.05, h + 0.05, sz * d / 2 + 0.05);
  ctx.color(COL.soil); ctx.roughness(1); const y = h - 0.06; ctx.quad(-w / 2 + t, y, -d / 2 + t, -w / 2 + t, y, d / 2 - t, w / 2 - t, y, d / 2 - t, w / 2 - t, y, -d / 2 + t);
  if (L <= 2) { ctx.color('oklch(0.3 0.04 50)'); for (let i = -2; i <= 2; i++) { const zz = (i / 5) * d * 0.8; ctx.quad(-w / 2 + t, y + 0.005, zz - 0.03, -w / 2 + t, y + 0.005, zz + 0.03, w / 2 - t, y + 0.005, zz + 0.03, w / 2 - t, y + 0.005, zz - 0.03); } }
}
function spots(w, d, kind) { const per = { pumpkin: [2, 1], sunflower: [3, 1], tomato: [3, 1], cabbage: [3, 2], carrot: [5, 2], strawberry: [4, 2] }[kind] || [3, 2];
  const o = []; for (let i = 0; i < per[0]; i++) for (let j = 0; j < per[1]; j++) o.push([(-0.5 + (i + 0.5) / per[0]) * (w - 0.35), (-0.5 + (j + 0.5) / per[1]) * (d - 0.3)]); return o; }
function plant(ctx, kind, st, x, z, i, gold) {
  const G = gold ? 'oklch(0.86 0.16 90)' : null, lv = [COL.leaf, COL.leafD];
  if (st === 0) { ctx.color('oklch(0.3 0.04 50)'); ball(ctx, x, 0, z, 0.08, 0.35, 5); return; }
  if (st === 1) { ctx.color(COL.stem); cyl(ctx, x, 0, z, 0.08, 0.008, 0.006, 4); leaf(ctx, x, 0.08, z, i, 0.06, 0.03, 0.02, COL.leaf); leaf(ctx, x, 0.08, z, i + 3.1, 0.06, 0.03, 0.02, COL.leaf); return; }
  const ripe = st === 3;
  switch (kind) {
    case 'carrot': for (let k = 0; k < 7; k++) { const a = k * 0.9 + i; ctx.color(COL.stem); leaf(ctx, x, 0.01, z, a, ripe ? 0.2 : 0.13, 0.025, ripe ? 0.28 : 0.18, lv[k % 2]); }
      if (ripe) { ctx.color(G || 'oklch(0.7 0.17 50)'); cyl(ctx, x, -0.05, z, 0.04, 0.03, 0.045, 6); } break;
    case 'strawberry': rosette(ctx, x, z, 6, ripe ? 0.17 : 0.12, 0.06, 0.07, lv, i);
      if (ripe) for (let k = 0; k < 3; k++) { const a = i + k * 2.1; ctx.color(G || 'oklch(0.6 0.21 22)'); ball(ctx, x + Math.cos(a) * 0.13, 0.03, z + Math.sin(a) * 0.13, 0.035, 1.2, 5); } break;
    case 'cabbage': rosette(ctx, x, z, 7, ripe ? 0.22 : 0.15, 0.09, 0.05, ['oklch(0.62 0.1 145)', 'oklch(0.55 0.1 150)'], i);
      if (ripe) { ctx.color(G || 'oklch(0.78 0.12 130)'); ball(ctx, x, 0.1, z, 0.12, 0.85, 7); } else { ctx.color('oklch(0.72 0.12 135)'); ball(ctx, x, 0.05, z, 0.06, 0.8, 6); } break;
    case 'tomato': { const h = ripe ? 0.85 : 0.5; ctx.color('oklch(0.6 0.06 70)'); cyl(ctx, x + 0.05, 0, z, h + 0.12, 0.012, 0.01, 4);
      ctx.color(COL.stem); cyl(ctx, x, 0, z, h, 0.015, 0.01, 4); for (let k = 0; k < 6; k++) leaf(ctx, x, 0.12 + k * h / 7, z, i + k * 2.4, 0.16, 0.06, 0.04, lv[k % 2]);
      if (ripe) for (let k = 0; k < 5; k++) { const a = i + k * 1.3; ctx.color(G || (k === 4 ? 'oklch(0.75 0.15 70)' : 'oklch(0.58 0.2 30)')); ball(ctx, x + Math.cos(a) * 0.1, 0.25 + k * 0.1, z + Math.sin(a) * 0.1, 0.045, 1, 6); } break; }
    case 'sunflower': { const h = ripe ? 1.6 : 0.8; ctx.color(COL.stem); cyl(ctx, x, 0, z, h, 0.025, 0.018, 5);
      for (let k = 0; k < 4; k++) leaf(ctx, x, 0.25 + k * h / 5, z, i + k * 2.2, 0.2, 0.09, 0.05, lv[k % 2]);
      if (ripe) { const fy = h, fz = z - 0.05; ctx.color(G || 'oklch(0.84 0.17 92)');
        for (let k = 0; k < 12; k++) { const a = k / 12 * 6.2832; ctx.tri(x, fy, fz, x + Math.cos(a - 0.2) * 0.1, fy + Math.sin(a - 0.2) * 0.1, fz - 0.01, x + Math.cos(a) * 0.2, fy + Math.sin(a) * 0.2, fz - 0.02); ctx.tri(x + Math.cos(a) * 0.2, fy + Math.sin(a) * 0.2, fz - 0.02, x + Math.cos(a + 0.2) * 0.1, fy + Math.sin(a + 0.2) * 0.1, fz - 0.01, x, fy, fz); }
        ctx.color('oklch(0.35 0.06 50)'); ball(ctx, x, fy, fz - 0.02, 0.09, 1, 7); }
      else { ctx.color('oklch(0.6 0.12 130)'); ball(ctx, x, h, z, 0.05, 1, 5); } break; }
    case 'pumpkin': rosette(ctx, x, z, 5, ripe ? 0.45 : 0.3, 0.18, 0.12, lv, i);
      ctx.color(COL.stem); for (let k = 0; k < 3; k++) { const a = i + k * 2; cyl(ctx, x + Math.cos(a) * 0.2, 0.02, z + Math.sin(a) * 0.2, 0.05, 0.01, 0.01, 3); }
      if (ripe) { ctx.color(G || 'oklch(0.7 0.17 55)'); ball(ctx, x, 0.17, z, 0.22, 0.72, 10, 0.08); ctx.color('oklch(0.42 0.08 90)'); cyl(ctx, x, 0.3, z, 0.38, 0.02, 0.015, 4); }
      else { ctx.color('oklch(0.62 0.12 120)'); ball(ctx, x + 0.1, 0.06, z, 0.07, 0.8, 6); } break;
  }
}
function crate(ctx, kind) { // a seed crate: slatted box brimming with packets, a big veg on the front board
  ctx.roughness(0.85); ctx.color(COL.wood); box(ctx, -0.3, 0, -0.22, 0.3, 0.32, 0.22); ctx.color(COL.woodD); box(ctx, -0.31, 0.08, -0.23, 0.31, 0.12, 0.23); box(ctx, -0.31, 0.22, -0.23, 0.31, 0.26, 0.23);
  const cols = { carrot: 'oklch(0.72 0.16 55)', strawberry: 'oklch(0.62 0.2 20)', cabbage: 'oklch(0.75 0.14 135)', tomato: 'oklch(0.6 0.2 30)', sunflower: 'oklch(0.85 0.16 90)', pumpkin: 'oklch(0.7 0.17 60)' };
  for (let k = 0; k < 6; k++) { const x = -0.2 + (k % 3) * 0.2, z = -0.08 + Math.floor(k / 3) * 0.14; ctx.color(k % 2 ? 'oklch(0.94 0.02 90)' : cols[kind]); ctx.quad(x - 0.07, 0.3, z, x + 0.07, 0.3, z, x + 0.07, 0.45, z - 0.02, x - 0.07, 0.45, z - 0.02); ctx.quad(x + 0.07, 0.3, z, x - 0.07, 0.3, z, x - 0.07, 0.45, z - 0.02, x + 0.07, 0.45, z - 0.02); }
  ctx.color(cols[kind]); ball(ctx, 0, 0.17, -0.25, 0.08, 1, 6);
}
function stall(ctx) { // an open seed stall: counter, back shelf, striped awning
  ctx.roughness(0.85); ctx.color(COL.wood); box(ctx, -1.5, 0, -0.5, 1.5, 0.85, 0.3); ctx.color(COL.woodD); box(ctx, -1.55, 0.85, -0.55, 1.55, 0.92, 0.35);
  for (const sx of [-1.45, 1.45]) { box(ctx, sx - 0.06, 0, 0.55, sx + 0.06, 2.5, 0.67); box(ctx, sx - 0.06, 0, -0.62, sx + 0.06, 2.3, -0.5); }
  box(ctx, -1.5, 1.35, 0.5, 1.5, 1.4, 0.8); box(ctx, -1.5, 1.8, 0.5, 1.5, 1.85, 0.8);
  for (let k = 0; k < 8; k++) { ctx.color(k % 2 ? 'oklch(0.95 0.02 90)' : 'oklch(0.62 0.12 150)'); const x0 = -1.6 + k * 0.4; ctx.quad(x0, 2.5, 0.75, x0 + 0.4, 2.5, 0.75, x0 + 0.4, 2.2, -0.9, x0, 2.2, -0.9); ctx.quad(x0 + 0.4, 2.5, 0.75, x0, 2.5, 0.75, x0, 2.2, -0.9, x0 + 0.4, 2.2, -0.9);
    ctx.quad(x0, 2.2, -0.9, x0 + 0.4, 2.2, -0.9, x0 + 0.2, 2.05, -0.92, x0 + 0.2, 2.05, -0.92); }
  for (let k = 0; k < 10; k++) { ctx.color(['oklch(0.72 0.16 55)', 'oklch(0.6 0.2 30)', 'oklch(0.85 0.16 90)', 'oklch(0.75 0.14 135)'][k % 4]); cyl(ctx, -1.3 + k * 0.28, 1.4, 0.65, 1.55, 0.07, 0.08, 6); }
}
function pump(ctx) { // a cast-iron hand pump on a limestone plinth, a bucket and a green watering can beside it
  ctx.roughness(0.9); ctx.color('oklch(0.8 0.02 85)'); box(ctx, -0.5, 0, -0.5, 0.5, 0.3, 0.5);
  ctx.color('oklch(0.3 0.03 160)'); ctx.metalness(0.4); cyl(ctx, 0, 0.3, 0.15, 1.35, 0.08, 0.07, 8); box(ctx, -0.04, 1.0, -0.2, 0.04, 1.06, 0.15); box(ctx, -0.04, 0.95, -0.28, 0.04, 1.08, -0.2);
  box(ctx, -0.025, 1.35, 0.1, 0.025, 1.4, 0.65); ctx.metalness(0);
  ctx.color('oklch(0.55 0.08 60)'); cyl(ctx, 0, 0.3, -0.25, 0.5, 0.14, 0.16, 8); ctx.color('oklch(0.6 0.08 210)'); ctx.quad(-0.13, 0.48, -0.37, -0.13, 0.48, -0.13, 0.13, 0.48, -0.13, 0.13, 0.48, -0.37);
  ctx.color('oklch(0.55 0.1 150)'); cyl(ctx, 0.75, 0, 0.1, 0.25, 0.12, 0.12, 8); box(ctx, 0.85, 0.12, 0.08, 1.12, 0.15, 0.12);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}; L = ctx.lod ?? 1; ctx.metalness(0);
  if (p.item === 'bed') return bed(ctx, p.w ?? 3, p.d ?? 1.4);
  if (p.item === 'crate') return crate(ctx, p.kind || 'carrot');
  if (p.item === 'stall') return stall(ctx);
  if (p.item === 'pump') return pump(ctx);
  if (p.item === 'veg') { ctx.roughness(0.6); plant(ctx, p.kind, 3, 0, 0, 0.7, p.golden); return; }
  if (p.item === 'crop') { ctx.roughness(0.75); const pts = spots(p.w ?? 3, p.d ?? 1.4, p.kind); pts.forEach(([x, z], i) => plant(ctx, p.kind, p.stage ?? 0, x, z, i * 1.7 + 0.3, p.golden)); }
});
