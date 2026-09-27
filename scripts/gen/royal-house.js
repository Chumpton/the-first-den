// Royal-district townhouse family: pale limestone, blue slate, gold trim. params: kind (house|hall|bank|armoury|tavern),
// w (front width), d (depth), floors (3-4), turret (-1 left / 1 right / 0), seed. Origin centre of footprint at ground, front −Z.
import { TAU, paint, XF, lathe, Q, T, box, beam, blob, RC, RT, stone, flat, gold, slate, glow, L, crenels, tower } from '../lib/royal-kit.js';
const G0 = 4.2, FH = 3.6;
function win(ctx, F, x, y, w, h, top, lod, warm) {
  glow(ctx, 'oklch(0.3 0.03 250)', warm ? 0.5 : 0.07, warm ? 0.33 : 0.07, warm ? 0.12 : 0.09); box(F, x - w / 2, y, -0.03, x + w / 2, y + h, 0.02);
  if (lod >= 3) return;
  stone(ctx, RC.stone2);
  box(F, x - w / 2 - 0.18, y - 0.18, -0.16, x + w / 2 + 0.18, y, 0.02); box(F, x - w / 2 - 0.15, y, -0.08, x - w / 2, y + h, 0.02); box(F, x + w / 2, y, -0.08, x + w / 2 + 0.15, y + h, 0.02);
  if (top === 'ped') { box(F, x - w / 2 - 0.25, y + h, -0.14, x + w / 2 + 0.25, y + h + 0.15, 0.02); T(F, [x - w / 2 - 0.25, y + h + 0.15, -0.14], [x + w / 2 + 0.25, y + h + 0.15, -0.14], [x, y + h + 0.6, -0.14], [x, y + h, -1]); }
  else { box(F, x - w / 2 - 0.15, y + h, -0.1, x + w / 2 + 0.15, y + h + 0.22, 0.02); if (lod <= 1) { gold(ctx); box(F, x - 0.1, y + h, -0.13, x + 0.1, y + h + 0.26, -0.1); } }
  if (lod <= 1) { paint(ctx, null, RC.blueDk, 0.8); box(F, x - 0.03, y, -0.05, x + 0.03, y + h, -0.03); box(F, x - w / 2, y + h * 0.55, -0.05, x + w / 2, y + h * 0.55 + 0.06, -0.03); }
}
function facade(ctx, F, len, H, floors, lod, o) {
  const n = Math.max(1, Math.floor((len - 1.6) / 2.5)), step = len / n, warm = o.kind === 'tavern';
  for (let f = 0; f < floors; f++) {
    const y = f === 0 ? 1.1 : G0 + (f - 1) * FH + 0.8, h = f === 0 ? 2.5 : f === floors - 1 ? 1.9 : 2.2;
    for (let i = 0; i < n; i++) { const x = -len / 2 + step * (i + 0.5); if (o.door && f === 0 && Math.abs(x) < step * 0.6) continue; win(ctx, F, x, y, 1.15, h, f === 1 ? 'ped' : 'flat', lod, warm || (f === 0 && o.kind !== 'armoury' && i % 2 === 0)); }
  }
}
function door(ctx, P, w, d, lod, kind) {
  const F = XF(P, 0, 0, -d / 2), dw = kind === 'bank' ? 2.6 : 1.9;
  paint(ctx, RT.wood, 'oklch(0.55 0.1 255)', 0.6); box(F, -dw / 2, 0.6, -0.05, dw / 2, 3.4, 0.02);
  gold(ctx); box(F, -dw / 2 - 0.1, 3.4, -0.1, dw / 2 + 0.1, 3.6, 0.02); if (lod <= 2) { box(F, -0.05, 1.6, -0.1, 0.05, 2.2, -0.05); }
  stone(ctx, RC.stone2); box(F, -dw / 2 - 0.45, 0.6, -0.2, -dw / 2, 3.9, 0.02); box(F, dw / 2, 0.6, -0.2, dw / 2 + 0.45, 3.9, 0.02); box(F, -dw / 2 - 0.55, 3.6, -0.25, dw / 2 + 0.55, 4.0, 0.02);
  for (let i = 0; i < 3; i++) box(F, -dw / 2 - 0.6 + i * 0.1, 0, -1.2 + i * 0.4, dw / 2 + 0.6 - i * 0.1, 0.2 * (i + 1), 0.02);
}
function gable(ctx, P, w, d, H, lod, seed) {
  const rh = d * 0.5, o = 0.5, top = H + rh;
  slate(ctx);
  ctx.quad(-w / 2 - o, H - 0.25, -d / 2 - o, -w / 2 - o, top, 0, w / 2 + o, top, 0, w / 2 + o, H - 0.25, -d / 2 - o);
  ctx.quad(w / 2 + o, H - 0.25, d / 2 + o, w / 2 + o, top, 0, -w / 2 - o, top, 0, -w / 2 - o, H - 0.25, d / 2 + o);
  stone(ctx); for (const s of [-1, 1]) T(P, [s * w / 2, H, -d / 2], [s * w / 2, H, d / 2], [s * w / 2, top - 0.2, 0], [0, H, 0]);
  if (lod >= 4) return;
  gold(ctx); beam(P, [-w / 2 - o, top + 0.08, 0], [w / 2 + o, top + 0.08, 0], 0.16, 0.14);
  stone(ctx, RC.stone2); for (const s of [-1, 1]) { box(P, s * (w / 2 - 1.3) - 0.5, top - 1.4, 0.8, s * (w / 2 - 1.3) + 0.5, top + 1.3, 1.8); }
  if (lod <= 2) { const nd = Math.max(1, Math.floor(w / 4)); for (let i = 0; i < nd; i++) { const x = -w / 2 + w * (i + 0.5) / nd, z0 = -d / 2 + 0.6, y0 = H + 0.35;
    stone(ctx); box(P, x - 0.8, y0, z0, x + 0.8, y0 + 1.7, z0 + 1.6); glow(ctx, 'oklch(0.3 0.03 250)', 0.07, 0.07, 0.09); box(P, x - 0.45, y0 + 0.3, z0 - 0.02, x + 0.45, y0 + 1.4, z0);
    slate(ctx); ctx.quad(x - 1, y0 + 1.6, z0 - 0.15, x, y0 + 2.4, z0 - 0.15, x, y0 + 2.4, z0 + 1.8, x - 1, y0 + 1.6, z0 + 1.8); ctx.quad(x, y0 + 2.4, z0 - 0.15, x + 1, y0 + 1.6, z0 - 0.15, x + 1, y0 + 1.6, z0 + 1.8, x, y0 + 2.4, z0 + 1.8);
    stone(ctx); T(P, [x - 0.8, y0 + 1.7, z0 - 0.02], [x + 0.8, y0 + 1.7, z0 - 0.02], [x, y0 + 2.3, z0 - 0.02], [x, y0 + 2, z0 + 1]); } }
  return top;
}
function hip(ctx, P, w, d, H, lod) {
  const rh = Math.min(w, d) * 0.35, o = 0.5, a = w / 2 + o, b = d / 2 + o, r = Math.max(0.5, a - b);
  slate(ctx);
  ctx.quad(-a, H - 0.2, -b, -r, H + rh, 0, r, H + rh, 0, a, H - 0.2, -b); ctx.quad(a, H - 0.2, b, r, H + rh, 0, -r, H + rh, 0, -a, H - 0.2, b);
  ctx.tri(a, H - 0.2, -b, r, H + rh, 0, a, H - 0.2, b); ctx.tri(-a, H - 0.2, b, -r, H + rh, 0, -a, H - 0.2, -b);
  if (lod <= 3) { gold(ctx); beam(P, [-r, H + rh + 0.06, 0], [r, H + rh + 0.06, 0], 0.16, 0.14); }
}
function sign(ctx, P, x, d, y, lod, kind) {
  stone(ctx, RC.stone2);
  paint(ctx, null, 'oklch(0.3 0.03 60)', 0.5, 0.6); beam(P, [x, y, -d / 2], [x, y, -d / 2 - 1.5], 0.08, 0.08); beam(P, [x, y - 0.8, -d / 2], [x, y, -d / 2 - 0.9], 0.06, 0.06);
  if (lod >= 3) return;
  beam(P, [x, y, -d / 2 - 0.35], [x, y - 0.25, -d / 2 - 0.35], 0.02, 0.02); beam(P, [x, y, -d / 2 - 1.35], [x, y - 0.25, -d / 2 - 1.35], 0.02, 0.02);
  const F = XF(P, x, y - 1.35, -d / 2 - 0.85, Math.PI / 2);
  paint(ctx, null, RC.blue, 0.6); box(F, -0.55, 0, -0.04, 0.55, 1.1, 0.04); gold(ctx); box(F, -0.6, -0.05, -0.05, 0.6, 1.15, -0.02); box(F, -0.6, -0.05, 0.02, 0.6, 1.15, 0.05);
  paint(ctx, null, RC.blue, 0.6); box(F, -0.5, 0.05, -0.07, 0.5, 1.05, 0.07);
  gold(ctx); if (kind === 'tavern') { blob(F, 0, 0.62, 0, 0.26, 0.26, 0.11, 6); blob(F, 0, 0.3, 0, 0.18, 0.14, 0.1, 5); }
  else if (kind === 'armoury') { beam(F, [-0.3, 0.2, 0], [0.3, 0.9, 0], 0.05, 0.12); beam(F, [0.3, 0.2, 0], [-0.3, 0.9, 0], 0.05, 0.12); }
  else if (kind === 'bank') lathe(F, [[0.28, 0.4], [0.28, 0.55], [0, 0.55]], 8, 0, 0, 0); else blob(F, 0, 0.55, 0, 0.25, 0.3, 0.1, 6);
}
function portico(ctx, P, w, d, H, lod) {
  const z0 = -d / 2 - 3.2, ch = H * 0.7, n = 6;
  stone(ctx); box(P, -w / 2 + 0.6, 0, z0 - 0.6, w / 2 - 0.6, 0.9, -d / 2); for (let i = 0; i < 3; i++) box(P, -w / 2 + 1 + i * 0.2, 0, z0 - 1.6 + i * 0.35, w / 2 - 1 - i * 0.2, 0.3 * (i + 1), z0 - 0.6);
  flat(ctx, RC.stone2);
  for (let i = 0; i < n; i++) { const x = -w / 2 + 1.6 + (w - 3.2) * i / (n - 1); lathe(P, [[0.55, 0.9], [0.55, 1.2], [0.42, 1.35], [0.38, ch - 0.4], [0.55, ch - 0.1], [0.6, ch], [0, ch]], lod <= 2 ? 10 : 6, x, 0, z0 + 0.4); }
  stone(ctx); box(P, -w / 2 + 0.6, ch, z0 - 0.3, w / 2 - 0.6, ch + 1.1, -d / 2);
  gold(ctx); box(P, -w / 2 + 0.6, ch + 0.4, z0 - 0.33, w / 2 - 0.6, ch + 0.6, z0 - 0.3);
  stone(ctx); T(P, [-w / 2 + 0.4, ch + 1.1, z0 - 0.35], [w / 2 - 0.4, ch + 1.1, z0 - 0.35], [0, ch + 3.4, z0 - 0.35], [0, ch + 2, 0]);
  slate(ctx); ctx.quad(-w / 2 + 0.3, ch + 1.05, z0 - 0.5, 0, ch + 3.5, z0 - 0.5, 0, ch + 3.5, -d / 2, -w / 2 + 0.3, ch + 1.05, -d / 2); ctx.quad(0, ch + 3.5, z0 - 0.5, w / 2 - 0.3, ch + 1.05, z0 - 0.5, w / 2 - 0.3, ch + 1.05, -d / 2, 0, ch + 3.5, -d / 2);
  if (lod <= 2) { gold(ctx); blob(P, 0, ch + 2, z0 - 0.4, 0.5, 0.5, 0.08, 8); }
}
export function geometry(ctx) {
  ctx.flat();
  const { kind = 'house', w = 10, d = 9, floors = 3, turret = 0 } = ctx.params, lod = L(ctx), P = ctx;
  const H = G0 + FH * (floors - 1);
  stone(ctx); box(P, -w / 2, 0, -d / 2, w / 2, H, d / 2);
  if (lod >= 4) { kind === 'armoury' ? (stone(ctx), box(P, -w / 2, H, -d / 2, w / 2, H + 1.2, d / 2)) : kind === 'bank' ? hip(ctx, P, w, d, H, 5) : gable(ctx, P, w, d, H, 5); if (kind === 'hall') { stone(ctx); box(P, -2, 0, -d / 2 - 0.3, 2, H + 5, -d / 2 + 3.7); slate(ctx); lathe(P, [[3, H + 5], [0, H + 11]], 4, 0, 0, -d / 2 + 1.7); } return; }
  // plinth, rusticated ground floor, string courses, cornice
  flat(ctx, RC.stone2); box(P, -w / 2 - 0.25, 0, -d / 2 - 0.25, w / 2 + 0.25, 0.6, d / 2 + 0.25);
  if (lod <= 2) { stone(ctx, RC.stone2); box(P, -w / 2 - 0.06, 0.6, -d / 2 - 0.06, w / 2 + 0.06, G0 - 0.3, d / 2 + 0.06); }
  stone(ctx, RC.stone2);
  for (let f = 1; f < floors; f++) { const y = G0 + (f - 1) * FH; box(P, -w / 2 - 0.15, y - 0.3, -d / 2 - 0.15, w / 2 + 0.15, y, d / 2 + 0.15); }
  box(P, -w / 2 - 0.4, H - 0.4, -d / 2 - 0.4, w / 2 + 0.4, H, d / 2 + 0.4);
  if (lod <= 2 && kind !== 'tavern') { gold(ctx); box(P, -w / 2 - 0.42, H - 0.3, -d / 2 - 0.42, w / 2 + 0.42, H - 0.22, -d / 2 - 0.4); }
  if (kind === 'tavern' && lod <= 2) { // upper floors half-timbered in the town's language
    paint(ctx, null, 'oklch(0.35 0.05 50)', 0.8);
    for (let f = 1; f < floors; f++) { const y = G0 + (f - 1) * FH, z = -d / 2 - 0.03; for (let i = 0; i <= 5; i++) { const x = -w / 2 + w * i / 5; box(P, x - 0.1, y, z - 0.05, x + 0.1, y + FH - 0.3, z); }
      box(P, -w / 2, y + FH - 0.5, z - 0.05, w / 2, y + FH - 0.3, z); for (let i = 0; i < 5; i++) { const x0 = -w / 2 + w * i / 5, x1 = x0 + w / 5; if (i % 2) beam(P, [x0, y + 0.2, z - 0.03], [x1, y + 0.8, z - 0.03], 0.08, 0.06); } }
    paint(ctx, null, 'oklch(0.55 0.13 30)', 0.9); for (let i = 0; i < 4; i++) { const x = -w / 2 + w * (i + 0.5) / 4; box(P, x - 0.6, G0 + 0.55, -d / 2 - 0.35, x + 0.6, G0 + 0.8, -d / 2); }
    paint(ctx, null, 'oklch(0.68 0.16 140)', 0.9); for (let i = 0; i < 4; i++) { const x = -w / 2 + w * (i + 0.5) / 4; blob(P, x, G0 + 0.85, -d / 2 - 0.18, 0.55, 0.18, 0.15, 5); }
  }
  // façades: front with the door, sides, back plain at lod 3
  facade(ctx, XF(P, 0, 0, -d / 2 - 0.001), w, H, floors, lod, { door: true, kind });
  facade(ctx, XF(P, -w / 2 - 0.001, 0, 0, -Math.PI / 2), d, H, floors, lod, { kind });
  facade(ctx, XF(P, w / 2 + 0.001, 0, 0, Math.PI / 2), d, H, floors, lod, { kind });
  if (lod <= 2) facade(ctx, XF(P, 0, 0, d / 2 + 0.001, Math.PI), w, H, floors, lod, { kind });
  door(ctx, P, w, d, lod, kind);
  // roofs by kind
  if (kind === 'bank') { hip(ctx, P, w, d, H, lod); portico(ctx, P, w, d, H, lod); }
  else if (kind === 'armoury') { stone(ctx); box(P, -w / 2, H, -d / 2, w / 2, H + 0.6, d / 2); crenels(P, -w / 2, w / 2, H + 0.6, -d / 2, -d / 2 + 0.5, 0.9, 0.7, 1); crenels(P, -w / 2, w / 2, H + 0.6, d / 2 - 0.5, d / 2, 0.9, 0.7, 1);
    slate(ctx); lathe(P, [[Math.min(w, d) * 0.42, H + 0.6], [0, H + 5]], 4, 0, 0, 0);
    for (const s of [-1, 1]) tower(ctx, P, s * w / 2, -d / 2, 1.6, 0, H + 2, { roof: 4.5 });
    gold(ctx); blob(P, 0, G0 + 0.9, -d / 2 - 0.2, 0.9, 1.1, 0.12, 6); paint(ctx, null, RC.blue, 0.6); blob(P, 0, G0 + 0.9, -d / 2 - 0.26, 0.7, 0.9, 0.1, 6); }
  else gable(ctx, P, w, d, H, lod);
  if (kind === 'hall') { const z0 = -d / 2 - 0.3, th = H + 5; stone(ctx); box(P, -2, 0, z0, 2, th, z0 + 4); crenels(P, -2.2, 2.2, th, z0 - 0.2, z0 + 0.3, 0.7, 0.55, 0.8);
    slate(ctx); lathe(P, [[2.9, th], [2.9, th + 0.4], [0, th + 7]], 4, 0, 0, z0 + 2); gold(ctx); lathe(P, [[0.15, th + 6.8], [0, th + 8]], 4, 0, 0, z0 + 2);
    win(ctx, XF(P, 0, 0, z0 - 0.001), 0, H - 1, 1.4, 3, 'ped', lod, false); if (lod <= 2) { gold(ctx); lathe(XF(P, 0, 0, z0 - 0.05, 0), [[1, H + 2.4], [1, H + 2.5], [0, H + 2.5]], 12, 0, 0, 0); } }
  if (turret) tower(ctx, P, turret * (w / 2 + 0.4), -d / 2 - 0.4, 1.7, 2.5, H + 1.8, { roof: 5.5 });
  if (kind !== 'bank') sign(ctx, P, w / 2 - 1.4, d, 4.0, lod, kind);
}
export function collider(ctx) {
  const { kind = 'house', w = 10, d = 9, floors = 3 } = ctx.params, H = G0 + FH * (floors - 1);
  box(ctx, -w / 2 - 0.25, 0, -d / 2 - 0.25, w / 2 + 0.25, H, d / 2 + 0.25);
  if (kind === 'hall') box(ctx, -2, 0, -d / 2 - 0.3, 2, H + 5, -d / 2 + 1);
  if (kind === 'bank') box(ctx, -w / 2 + 0.6, 0, -d / 2 - 3.8, w / 2 - 0.6, 0.9, -d / 2);
}
