// The great fountain of the market square: a round limestone basin with a sitting ledge, two tiers of bowls
// and a verdigris leaping fish. Feet at ground, centred. The water surfaces and spray are child rows.
import { TAU, COL, paint, XF, solid, box, obox, prism, ngon, lathe, loft } from '../lib/town-kit.js';
export const MOUTH = [-0.62, 6.05, 0];
export function geometry(ctx) {
  const lod = ctx.lod || 1, P = ctx, n = lod <= 1 ? 48 : lod <= 2 ? 32 : lod <= 3 ? 20 : 12, m = Math.max(10, n / 2);
  paint(ctx, 'flag', 'oklch(0.93 0.02 80)', 0.9);
  lathe(P, [[8.2, -0.1], [8.2, 0.03], [5.3, 0.03], [5.3, -0.1]], n);
  paint(ctx, 'lime', COL.lime, 0.88);
  lathe(P, [[5.0, -0.2], [5.0, 0.45], [5.3, 0.5], [5.3, 0.68], [4.55, 0.68], [4.55, 0.15], [0, 0.15]], n);
  if (lod <= 2) { paint(ctx, 'ashlar', 'oklch(0.9 0.025 75)', 0.9); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; obox(P, Math.cos(a) * 5.02, 0.03, Math.sin(a) * 5.02, 0.35, 0.42, 0.12, -a + Math.PI / 2); } }
  paint(ctx, 'lime', 'oklch(0.95 0.02 85)', 0.85);
  lathe(P, [[1.0, 0.1], [0.72, 0.45], [0.55, 1.5], [0.8, 1.85], [0, 1.85]], m);
  lathe(P, [[0.6, 1.8], [2.2, 2.02], [3.0, 2.28], [3.08, 2.42], [2.88, 2.42], [2.84, 2.28], [0, 2.28]], n);
  lathe(P, [[0.45, 2.28], [0.36, 2.6], [0.3, 3.15], [0.46, 3.35], [0, 3.35]], m);
  lathe(P, [[0.36, 3.3], [1.3, 3.45], [1.78, 3.62], [1.84, 3.74], [1.64, 3.74], [1.6, 3.62], [0, 3.62]], Math.max(12, n * 0.75 | 0));
  lathe(P, [[0.32, 3.62], [0.24, 4.15], [0.4, 4.4], [0.4, 4.5], [0, 4.5]], m);
  if (lod <= 3) { // lion-head spouts on tier 1 rim
    paint(ctx, 'lime', 'oklch(0.9 0.025 75)', 0.9);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; obox(P, Math.cos(a) * 3.06, 2.1, Math.sin(a) * 3.06, 0.22, 0.24, 0.22, -a); }
  }
  // the leaping fish, verdigris copper
  paint(ctx, 'copper', 'oklch(0.9 0.04 175)', 0.5, 0.6);
  const spine = [[0.14, 4.48, 0], [0.3, 4.9, 0], [0.28, 5.35, 0], [0.08, 5.75, 0], [-0.28, 5.98, 0], [-0.6, 6.05, 0]];
  loft(P, spine, [0.07, 0.22, 0.3, 0.27, 0.17, 0.05], lod <= 2 ? 10 : 6, 0.55);
  // tail fins at the base, dorsal and pectoral fins
  for (const s of [-1, 1]) { P.tri(0.14, 4.48, 0, 0.45, 4.35, s * 0.3, -0.1, 4.45, s * 0.28); P.tri(0.14, 4.48, 0, -0.1, 4.45, s * 0.28, 0.45, 4.35, s * 0.3); }
  P.tri(0.45, 5.2, 0, 0.72, 5.55, 0, 0.3, 5.7, 0); P.tri(0.45, 5.2, 0, 0.3, 5.7, 0, 0.72, 5.55, 0);
  for (const s of [-1, 1]) { P.tri(0.1, 5.5, s * 0.14, -0.1, 5.25, s * 0.42, 0.25, 5.3, s * 0.16); P.tri(0.1, 5.5, s * 0.14, 0.25, 5.3, s * 0.16, -0.1, 5.25, s * 0.42); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.22 0.02 60)', 0.4); for (const s of [-1, 1]) obox(P, -0.42, 6.0, s * 0.09, 0.06, 0.06, 0.03); }
}
export function collider(ctx) {
  const n = 24;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU, b = (i + 1) / n * TAU, r0 = 4.55, r1 = 5.3, y0 = -0.2, y1 = 0.68;
    const L = [[Math.cos(a) * r0, y0, Math.sin(a) * r0], [Math.cos(a) * r1, y0, Math.sin(a) * r1], [Math.cos(b) * r1, y0, Math.sin(b) * r1], [Math.cos(b) * r0, y0, Math.sin(b) * r0]];
    solid(ctx, L, L.map(([x, y, z]) => [x, y1, z]));
  }
  prism(ctx, ngon(10, 3.08), 1.8, 2.42); prism(ctx, ngon(8, 0.8), 0.15, 4.5);
}
