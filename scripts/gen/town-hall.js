// The town hall: stone ground floor, timbered upper hall under a hipped clay roof, and a clock/bell tower
// rising to a flat crenellated roost ledge. Feet at ground, front (door, clock) toward −Z. params.roostY = the
// ledge's top in local metres (world 22.0 − feet y).
import { TAU, COL, paint, XF, solid, box, obox, beam, prism, ngon, slab, win, timber, lathe, discZ, lantern } from '../lib/town-kit.js';
const HW = 11, HD = 6, G = 4.6, U = 3.6, TW = 4, TD = 3.5, LW = 5, LD = 4, LEDGE = 0.55;
function archWin(ctx, F, x, y0, w, h, lod) {
  win(ctx, F, x, y0, w, h, { frame: 'oklch(0.94 0.02 82)' });
  paint(ctx, null, COL.glass, 0.15, 0, COL.glow);
  const n = lod <= 2 ? 6 : 3, r = w / 2, cy = y0 + h;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI, b = (i + 1) / n * Math.PI; F.tri(x, cy, -0.03, x + Math.cos(b) * r, cy + Math.sin(b) * r, -0.03, x + Math.cos(a) * r, cy + Math.sin(a) * r, -0.03); }
  paint(ctx, 'ashlar', COL.lime, 0.9);
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI, b = (i + 1) / n * Math.PI, R = r + 0.22; const A = [[x + Math.cos(a) * r, cy + Math.sin(a) * r, 0], [x + Math.cos(a) * R, cy + Math.sin(a) * R, 0], [x + Math.cos(b) * R, cy + Math.sin(b) * R, 0], [x + Math.cos(b) * r, cy + Math.sin(b) * r, 0]]; solid(F, A, A.map(([p, q]) => [p, q, -0.14])); }
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, P = ctx, top = ctx.params.roostY ?? 21.45, shaftTop = top - LEDGE - 1.1, belfry = shaftTop - 2.8;
  // plinth, steps
  paint(ctx, 'ashlar', COL.lime, 0.9);
  box(P, -HW - 0.2, -0.8, -HD - 0.2, HW + 0.2, 0.45, HD + 0.2);
  for (let i = 0; i < 3; i++) box(P, -4.6 + i * 0.2, 0, -HD - 1.3 + i * 0.4, 4.6 - i * 0.2, 0.15 * (i + 1), -HD);
  // stone ground floor, timbered upper floor
  paint(ctx, 'ashlar', COL.lime, 0.9); box(P, -HW, 0.45, -HD, HW, G, HD);
  obox(P, 0, G - 0.25, -HD - 0.12, 2 * HW + 0.3, 0.3, 0.25); obox(P, 0, G - 0.25, HD + 0.12, 2 * HW + 0.3, 0.3, 0.25);
  paint(ctx, 'plaster', 'oklch(0.96 0.04 88)', 0.92); box(P, -HW + 0.1, G, -HD + 0.1, HW - 0.1, G + U, HD - 0.1);
  const front = XF(P, 0, 0, -HD, 0), back = XF(P, 0, 0, HD, Math.PI), upF = XF(P, 0, 0, -HD + 0.1, 0);
  // door: tall arched oak double door under the tower
  paint(ctx, 'oak', 'oklch(0.7 0.07 60)', 0.8); front.quad(-1.1, 0.45, -0.04, -1.1, 3.2, -0.04, 1.1, 3.2, -0.04, 1.1, 0.45, -0.04);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI, b = (i + 1) / 8 * Math.PI; front.tri(0, 3.2, -0.04, Math.cos(b) * 1.1, 3.2 + Math.sin(b) * 1.1, -0.04, Math.cos(a) * 1.1, 3.2 + Math.sin(a) * 1.1, -0.04); }
  paint(ctx, 'ashlar', COL.lime, 0.9);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI, b = (i + 1) / 9 * Math.PI, r = 1.1, R = 1.55; const A = [[Math.cos(a) * r, 3.2 + Math.sin(a) * r, 0], [Math.cos(a) * R, 3.2 + Math.sin(a) * R, 0], [Math.cos(b) * R, 3.2 + Math.sin(b) * R, 0], [Math.cos(b) * r, 3.2 + Math.sin(b) * r, 0]]; solid(front, A, A.map(([p, q]) => [p, q, i === 4 ? -0.35 : -0.25])); }
  for (const s of [-1, 1]) { obox(front, s * 1.33, 0.45, -0.12, 0.45, 2.75, 0.25); }
  if (lod <= 2) { paint(ctx, null, COL.iron, 0.5, 0.6); for (const s of [-0.5, 0.5]) obox(front, s, 1.7, -0.08, 0.12, 0.12, 0.06); obox(front, 0, 0.45, -0.06, 0.06, 3.7, 0.04); lantern(ctx, front, -2.2, 3.6, -0.45, 1.1); lantern(ctx, front, 2.2, 3.6, -0.45, 1.1); paint(ctx, null, COL.iron, 0.5, 0.6); for (const s of [-2.2, 2.2]) beam(front, [s, 3.6, 0], [s, 3.6, -0.45], 0.05, 0.05); }
  // ground-floor arched windows, both long faces; upper floor timbered windows
  for (const F of lod <= 2 ? [front, back] : [front]) for (const x of [-9, -6.5, -4.0, 4.0, 6.5, 9]) archWin(ctx, F, x, 1.3, 1.2, 2.0, lod);
  const upCuts = [];
  for (const x of [-9, -6.5, 6.5, 9]) { win(ctx, upF, x, G + 0.9, 1.1, 1.6, { frame: 'oklch(0.62 0.08 195)', box: lod <= 2, shutter: 'oklch(0.62 0.08 195)' }); upCuts.push([x, 0.55]); }
  upCuts.push([0, 4.2]);
  timber(ctx, upF, HW - 0.1, G, U, upCuts, lod);
  if (lod <= 3) { const sideL = XF(P, -HW, 0, 0, Math.PI / 2), sideR = XF(P, HW, 0, 0, -Math.PI / 2); for (const F of [sideL, sideR]) { for (const x of [-3, 0, 3]) archWin(ctx, F, x, 1.3, 1.1, 1.9, lod); } }
  // hipped roof
  const wy = G + U, e = 0.5, tan = Math.tan(34 * Math.PI / 180), rise = (HD + e) * tan, ry = wy - e * tan + rise, yl = wy - e * tan;
  paint(ctx, 'clay', 'oklch(0.93 0.04 42)', 0.85);
  slab(P, [-HW - e, yl, -HD - e], [HW + e, yl, -HD - e], [HW + e - HD - e, ry, 0], [-HW - e + HD + e, ry, 0], 0.18);
  slab(P, [-HW - e + HD + e, ry, 0], [HW + e - HD - e, ry, 0], [HW + e, yl, HD + e], [-HW - e, yl, HD + e], 0.18);
  for (const s of [-1, 1]) { const A = [[s * (HW + e), yl, -HD - e], [s * (HW + e - HD - e), ry, 0], [s * (HW + e), yl, HD + e]]; solid(P, A, A.map(([a, b, c]) => [a, b + 0.18, c])); }
  paint(ctx, 'plaster', 'oklch(0.96 0.04 88)', 0.92); box(P, -HW + 0.1, wy - 0.01, -HD + 0.1, HW - 0.1, wy + rise * 0.45, HD - 0.1);
  // tower shaft with quoins and string courses
  paint(ctx, 'ashlar', COL.lime, 0.9); box(P, -TW, 0.45, -TD, TW, belfry, TD);
  if (lod <= 3) { for (const y of [wy + rise + 0.3, belfry - 0.3]) box(P, -TW - 0.15, y, -TD - 0.15, TW + 0.15, y + 0.3, TD + 0.15); }
  if (lod <= 2) { paint(ctx, 'ashlar', 'oklch(0.9 0.025 75)', 0.9); for (let y = wy + rise; y < belfry - 0.6; y += 1.1) for (const sx of [-1, 1]) for (const sz of [-1, 1]) obox(P, sx * (TW - 0.3), y, sz * (TD - 0.3), 0.7, 0.55, 0.7); }
  // clock on the south face
  const cy = belfry - 2.2, cf = XF(P, 0, 0, -TD, 0);
  paint(ctx, 'ashlar', 'oklch(0.9 0.025 75)', 0.9); lathe(XF(cf, 0, cy, 0, 0, -Math.PI / 2), [[1.95, 0], [1.95, 0.18], [0, 0.18]], lod <= 2 ? 32 : 12);
  paint(ctx, null, 'oklch(0.96 0.03 90)', 0.5, 0, 'oklch(0.55 0.04 85)'); discZ(cf, 0, cy, -0.2, 1.6, lod <= 2 ? 32 : 12);
  paint(ctx, null, 'oklch(0.72 0.12 80)', 0.3, 0.9); lathe(XF(cf, 0, cy, -0.2, 0, -Math.PI / 2), [[1.7, 0], [1.7, 0.06], [1.55, 0.06], [1.55, 0]], lod <= 2 ? 32 : 12);
  if (lod <= 3) {
    paint(ctx, null, 'oklch(0.3 0.02 60)', 0.5, 0.4);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, r0 = i % 3 ? 1.3 : 1.18; beam(cf, [Math.sin(a) * r0, cy + Math.cos(a) * r0, -0.23], [Math.sin(a) * 1.48, cy + Math.cos(a) * 1.48, -0.23], i % 3 ? 0.07 : 0.14, 0.03); }
    beam(cf, [0, cy, -0.27], [Math.sin(-0.5) * 0.85, cy + Math.cos(-0.5) * 0.85, -0.27], 0.12, 0.04); beam(cf, [0, cy, -0.3], [Math.sin(0.3) * 1.25, cy + Math.cos(0.3) * 1.25, -0.3], 0.08, 0.04);
  }
  // belfry: arched openings on four sides, a bronze bell inside
  paint(ctx, 'ashlar', COL.lime, 0.9);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(P, sx < 0 ? -TW : TW - 1.1, belfry, sz < 0 ? -TD : TD - 1.1, sx < 0 ? -TW + 1.1 : TW, shaftTop, sz < 0 ? -TD + 1.1 : TD);
  box(P, -TW, shaftTop - 0.7, -TD, TW, shaftTop, TD);
  paint(ctx, null, 'oklch(0.22 0.02 60)', 0.9); box(P, -TW + 1.0, belfry, -TD + 1.0, TW - 1.0, shaftTop - 0.7, TD - 1.0);
  if (lod <= 3) { paint(ctx, 'brass', 'oklch(0.85 0.06 75)', 0.35, 0.9); lathe(P, [[0.95, belfry + 0.2], [0.85, belfry + 0.45], [0.6, belfry + 1.2], [0.55, belfry + 1.55], [0.15, belfry + 1.7], [0, belfry + 1.7]], 12, 0, 0, -TD + 0.55); }
  // corbelled ledge and the roost
  paint(ctx, 'ashlar', 'oklch(0.92 0.025 78)', 0.9);
  if (lod <= 3) { const n = 7; for (let i = 0; i < n; i++) { const x = -TW + (i + 0.5) * 2 * TW / n; for (const s of [-1, 1]) { const A = [[x - 0.25, shaftTop, s * TD], [x + 0.25, shaftTop, s * TD], [x + 0.25, shaftTop + 1.1, s * LD], [x - 0.25, shaftTop + 1.1, s * LD]]; solid(P, A, A.map(([a, b, c]) => [a, b, c - s * 0.01 - s * 0.0])), obox(P, x, shaftTop + 0.1, s * (TD + 0.25), 0.5, 1.0, 0.5); } } for (let i = 0; i < 5; i++) { const z = -TD + (i + 0.5) * 2 * TD / 5; for (const s of [-1, 1]) obox(P, s * (TW + 0.35), shaftTop + 0.1, z, 0.7, 1.0, 0.5); } }
  box(P, -LW, shaftTop + 1.0, -LD, LW, top, LD);
  paint(ctx, 'flag', 'oklch(0.95 0.02 82)', 0.9); P.quad(-LW + 0.3, top + 0.005, -LD + 0.3, -LW + 0.3, top + 0.005, LD - 0.3, LW - 0.3, top + 0.005, LD - 0.3, LW - 0.3, top + 0.005, -LD + 0.3);
  // low crenellated parapet
  paint(ctx, 'ashlar', COL.lime, 0.9); const ph = 0.4, mh = 0.4, t = 0.3;
  box(P, -LW, top, -LD, LW, top + ph, -LD + t); box(P, -LW, top, LD - t, LW, top + ph, LD);
  box(P, -LW, top, -LD + t, -LW + t, top + ph, LD - t); box(P, LW - t, top, -LD + t, LW, top + ph, LD - t);
  if (lod <= 4) {
    for (let i = 0; i < 7; i++) { const x = -LW + 0.35 + i * (2 * LW - 0.7) / 6; box(P, x - 0.35, top + ph, -LD, x + 0.35, top + ph + mh, -LD + t); box(P, x - 0.35, top + ph, LD - t, x + 0.35, top + ph + mh, LD); }
    for (let i = 1; i < 5; i++) { const z = -LD + i * 2 * LD / 5; box(P, -LW, top + ph, z - 0.35, -LW + t, top + ph + mh, z + 0.35); box(P, LW - t, top + ph, z - 0.35, LW, top + ph + mh, z + 0.35); }
  }
  // a flag on the north-east merlon
  if (lod <= 3) { paint(ctx, null, COL.iron, 0.5, 0.6); beam(P, [LW - 0.35, top + ph + mh, LD - 0.15], [LW - 0.35, top + 4.2, LD - 0.15], 0.07, 0.07); paint(ctx, 'linen', 'oklch(0.62 0.08 195)', 0.9); P.quad(LW - 0.35, top + 4.1, LD - 0.15, LW - 0.35, top + 3.2, LD - 0.15, LW - 2.0, top + 3.5, LD - 0.15, LW - 2.0, top + 4.2, LD - 0.15); }
}
export function collider(ctx) {
  const top = ctx.params.roostY ?? 21.45, P = ctx;
  box(P, -HW - 0.2, -0.5, -HD - 0.2, HW + 0.2, G + U + 2, HD + 0.2);
  box(P, -4.6, -0.2, -HD - 1.3, 4.6, 0.45, -HD);
  box(P, -TW, G + U + 2, -TD, TW, top - LEDGE, TD);
  box(P, -LW, top - LEDGE - 0.6, -LD, LW, top, LD);
  const ph = 0.8, t = 0.3;
  box(P, -LW, top, -LD, LW, top + ph, -LD + t); box(P, -LW, top, LD - t, LW, top + ph, LD);
  box(P, -LW, top, -LD + t, -LW + t, top + ph, LD - t); box(P, LW - t, top, -LD + t, LW, top + ph, LD - t);
}
