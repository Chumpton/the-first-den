// Royal district kit: white limestone, royal-blue slate, gold trim. Arched walls, towers, lancets, crenels.
// Shared by royal-district, royal-cathedral, royal-house and royal-statue. Every solid winds away from its interior point.
import { TAU, TEX, paint, XF, lathe, discZ, loft, Q, T, solid, box, ngon, prism, obox, beam, blob } from './town-kit.js';
export { TAU, TEX, paint, XF, lathe, discZ, loft, Q, T, solid, box, ngon, prism, obox, beam, blob };
export const RT = { slate: 'cdn/texture-deep-royal-blue-slate-roof-tiles.png', ashlar: 'cdn/texture-white-limestone-ashlar-blocks.png', flag: 'cdn/texture-white-marble-flagstone-paving.png', wood: 'cdn/texture-dark-oak-planks.png' };
export const RC = {
  stone: 'oklch(0.98 0.008 85)', stone2: 'oklch(0.94 0.014 80)', shade: 'oklch(0.9 0.016 75)', slate: 'oklch(0.97 0.02 260)',
  gold: 'oklch(0.8 0.14 85)', blue: 'oklch(0.42 0.14 262)', blueDk: 'oklch(0.3 0.1 262)', iron: 'oklch(0.28 0.015 60)',
  glass: 'oklch(0.3 0.04 245)', wood: 'oklch(0.95 0.03 60)', leaf: 'oklch(0.6 0.13 135)', leaf2: 'oklch(0.52 0.12 140)', water: 'oklch(0.62 0.09 215)',
};
export const stone = (ctx, c = RC.stone) => paint(ctx, RT.ashlar, c, 0.9);
export const flat = (ctx, c = RC.stone2) => paint(ctx, null, c, 0.9);
export const gold = (ctx) => paint(ctx, null, RC.gold, 0.32, 0.85);
export const slate = (ctx) => paint(ctx, RT.slate, RC.slate, 0.65);
export const glow = (ctx, col, r, g, b) => paint(ctx, null, col, 0.3, 0, null) || ctx.emissive(r, g, b);
export const L = (ctx) => ctx.lod || 1;
// a frame at (x,y,z) whose local −z points along (dx,dz)
export const faceOut = (P, x, y, z, dx, dz) => XF(P, x, y, z, Math.atan2(-dx, -dz));
// top of an opening at x: round or equilateral pointed arch springing at h.spring
export function archY(h, x) {
  const hw = h.w / 2, d = x - h.cx;
  if (h.pointed) { const c = d < 0 ? hw : -hw; return h.spring + Math.sqrt(Math.max(0, h.w * h.w - (d - c) * (d - c))); }
  return h.spring + Math.sqrt(Math.max(0, hw * hw - d * d));
}
// a wall in the XY plane from x0..x1, y0..y1, thickness z0..z1, cut by arched openings { cx, w, sill, spring, pointed }
export function archWall(P, x0, x1, y0, y1, z0, z1, holes = [], n = 8) {
  const zc = (z0 + z1) / 2, hs = [...holes].sort((a, b) => a.cx - b.cx);
  let x = x0;
  for (const h of hs) {
    const a = h.cx - h.w / 2, b = h.cx + h.w / 2;
    if (a - x > 1e-3) box(P, x, y0, z0, a, y1, z1);
    if ((h.sill ?? y0) > y0 + 1e-3) box(P, a, y0, z0, b, h.sill, z1);
    for (let i = 0; i < n; i++) {
      const xa = a + (b - a) * i / n, xb = a + (b - a) * (i + 1) / n, ya = Math.min(y1, archY(h, xa)), yb = Math.min(y1, archY(h, xb)), xm = (xa + xb) / 2;
      if (y1 - Math.max(ya, yb) < 1e-3 && y1 - Math.min(ya, yb) < 1e-3) continue;
      const o = [xm, (ya + y1) / 2, zc];
      Q(P, [xa, ya, z0], [xb, yb, z0], [xb, y1, z0], [xa, y1, z0], o);
      Q(P, [xa, ya, z1], [xb, yb, z1], [xb, y1, z1], [xa, y1, z1], o);
      Q(P, [xa, ya, z0], [xb, yb, z0], [xb, yb, z1], [xa, ya, z1], [xm, Math.max(ya, yb) + 0.5, zc]);
      Q(P, [xa, y1, z0], [xb, y1, z0], [xb, y1, z1], [xa, y1, z1], [xm, y1 - 0.5, zc]);
    }
    x = b;
  }
  if (x1 - x > 1e-3) box(P, x, y0, z0, x1, y1, z1);
}
// merlons along local x on a wall top at y, wall thickness z0..z1
export function crenels(P, x0, x1, y, z0, z1, mw = 1, gap = 0.75, mh = 1.1) {
  const n = Math.max(1, Math.floor((x1 - x0 + gap) / (mw + gap))), s = (x1 - x0 - n * mw) / Math.max(1, n - 1);
  for (let i = 0; i < n; i++) { const a = x0 + i * (mw + s); box(P, a, y, z0, a + mw, y + mh, z1); }
}
// a pointed lancet window panel facing −z in frame F, glowing glass inside a stone surround
export function lancet(ctx, F, x, y0, w, h, glass = [0.2, 0.34, 0.95], z = -0.04, tracery = true) {
  const lod = L(ctx), hw = w / 2, sp = y0 + h - 0.866 * w, n = lod <= 2 ? 6 : 3;
  const pts = [[x - hw, y0], [x + hw, y0], [x + hw, sp]];
  for (let i = 1; i < n; i++) { const xa = x + hw - w * i / (2 * n); pts.push([xa, archY({ cx: x, w, spring: sp, pointed: 1 }, xa)]); }
  pts.push([x, y0 + h]);
  for (let i = n - 1; i >= 1; i--) { const xa = x - hw + w * i / (2 * n); pts.push([xa, archY({ cx: x, w, spring: sp, pointed: 1 }, xa)]); }
  pts.push([x - hw, sp]);
  paint(ctx, null, RC.glass, 0.25, 0.1); ctx.emissive(...glass);
  const c = [x, (y0 + sp) / 2];
  for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; F.tri(c[0], c[1], z, b[0], b[1], z, a[0], a[1], z); }
  if (lod > 3) return;
  stone(ctx, RC.stone2);
  const t = Math.min(0.28, w * 0.14), zz = z * 3;
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (i === 0) continue; beam(F, [a[0], a[1], zz], [b[0], b[1], zz], t, Math.abs(zz) * 2); }
  beam(F, [x - hw, y0, zz], [x - hw, sp, zz], t, Math.abs(zz) * 2);
  box(F, x - hw - 0.15, y0 - 0.22, zz * 2, x + hw + 0.15, y0, 0);
  if (tracery && lod <= 2 && w > 0.9) { gold(ctx); beam(F, [x, y0, z * 1.5], [x, sp + 0.1, z * 1.5], 0.07, 0.04); beam(F, [x - hw, (y0 + sp) / 2, z * 1.5], [x + hw, (y0 + sp) / 2, z * 1.5], 0.06, 0.04); }
}
// round tower: base batter, shaft, corbelled parapet, blue cone roof with gold finial
export function tower(ctx, P, cx, cz, r, y0, h, o = {}) {
  const lod = L(ctx), n = lod <= 2 ? 20 : lod === 3 ? 12 : 8, cone = o.cone ?? r * 2.2;
  stone(ctx);
  lathe(P, [[r * 1.1, y0], [r * 1.1, 1.4], [r, 2.2], [r, h]], n, cx, 0, cz);
  if (lod <= 3) { stone(ctx, RC.stone2); lathe(P, [[r, h - 1.6], [r + 0.55, h - 0.5], [r + 0.55, h + 0.9], [0, h + 0.9]], n, cx, 0, cz); }
  if (lod <= 2) { stone(ctx, RC.shade); for (const y of o.courses ?? [h * 0.45]) lathe(P, [[r, y], [r + 0.18, y + 0.1], [r + 0.18, y + 0.35], [r, y + 0.45]], n, cx, 0, cz); }
  slate(ctx); lathe(P, [[0, h + 0.7], [r + 0.9, h + 0.7], [r + 0.9, h + 1.0], [(r + 0.9) * 0.55, h + 1 + cone * 0.45], [0, h + 1 + cone]], n, cx, 0, cz);
  gold(ctx); lathe(P, [[0.3, h + 0.9 + cone], [0.2, h + 1.6 + cone], [0.35, h + 1.9 + cone], [0, h + 2.9 + cone]], lod <= 2 ? 8 : 4, cx, 0, cz);
  if (lod <= 2 && o.slits !== false) for (let i = 0; i < 4; i++) {
    const a = (i + 0.5) / 4 * TAU + (o.slitRot ?? 0), dx = Math.cos(a), dz = Math.sin(a);
    const F = faceOut(P, cx + dx * r, 0, cz + dz * r, dx, dz);
    lancet(ctx, F, 0, h * 0.55, 0.9, 2.6, [0.15, 0.13, 0.1], -0.06, false);
  }
}
// a stone planter with a round lowpoly tree
export function planterTree(ctx, P, x, z, s = 1, rnd = Math.random) {
  const lod = L(ctx);
  stone(ctx, RC.stone2); box(P, x - 1.1 * s, 0, z - 1.1 * s, x + 1.1 * s, 0.75, z + 1.1 * s);
  if (lod <= 2) { gold(ctx); box(P, x - 1.15 * s, 0.75, z - 1.15 * s, x + 1.15 * s, 0.85, z + 1.15 * s); }
  paint(ctx, null, 'oklch(0.4 0.05 60)', 1); box(P, x - 0.95 * s, 0.85, z - 0.95 * s, x + 0.95 * s, 0.9, z + 0.95 * s);
  paint(ctx, null, 'oklch(0.5 0.06 55)', 0.9); lathe(P, [[0.18 * s, 0.85], [0.13 * s, 3.2 * s], [0, 3.2 * s]], lod <= 2 ? 6 : 4, x, 0, z);
  const k = lod <= 2 ? 7 : 4;
  paint(ctx, null, RC.leaf, 0.9); blob(P, x, 2.4 * s, z, 1.9 * s, 2.4 * s, 1.9 * s, k, rnd);
  if (lod <= 2) { paint(ctx, null, RC.leaf2, 0.9); blob(P, x + 0.6 * s, 3.4 * s, z - 0.3 * s, 1.1 * s, 1.5 * s, 1.1 * s, 5, rnd); }
}
// an iron lamp post with a glowing lantern (emissive, no light)
export function lampPost(ctx, P, x, z, h = 4.4) {
  const lod = L(ctx), n = lod <= 2 ? 8 : 4;
  stone(ctx, RC.stone2); box(P, x - 0.35, 0, z - 0.35, x + 0.35, 0.6, z + 0.35);
  paint(ctx, null, RC.iron, 0.5, 0.6); lathe(P, [[0.14, 0.6], [0.09, 1.2], [0.07, h - 0.4], [0.16, h - 0.3], [0, h - 0.3]], n, x, 0, z);
  glow(ctx, 'oklch(0.95 0.08 85)', 2.4, 1.7, 0.8); lathe(P, [[0.16, h - 0.3], [0.24, h + 0.4], [0, h + 0.4]], n === 8 ? 6 : 4, x, 0, z);
  if (lod <= 2) { gold(ctx); lathe(P, [[0.3, h + 0.4], [0, h + 0.85]], 6, x, 0, z); }
}
// a banner pole: stone foot, iron pole, gold crossbar and finial (drape rows hang at y h-0.35, x ± 0)
export function bannerPole(ctx, P, x, z, h = 9, yaw = 0) {
  const lod = L(ctx);
  stone(ctx, RC.stone2); box(P, x - 0.4, 0, z - 0.4, x + 0.4, 0.8, z + 0.4);
  paint(ctx, null, RC.blueDk, 0.5, 0.4); lathe(P, [[0.1, 0.8], [0.07, h], [0, h]], lod <= 2 ? 6 : 4, x, 0, z);
  gold(ctx); const c = Math.cos(yaw), s = Math.sin(yaw);
  beam(P, [x - c * 0.8, h - 0.3, z + s * 0.8], [x + c * 0.8, h - 0.3, z - s * 0.8], 0.07);
  if (lod <= 2) lathe(P, [[0.14, h], [0.2, h + 0.25], [0, h + 0.6]], 6, x, 0, z);
}
