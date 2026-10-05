import { TAU, face, box, frustum, orb, strut, paint, tint } from "./hearth-mesh.js";
import { softened } from "./soften.js";
// A Hearthmere market stall: counter, four posts, a striped sloping canopy with a scalloped valance, and its goods.
// params: kind fruit | flowers | potions, stripe 0-3. Front (the customer side) is -Z.
const STRIPES = [["oklch(0.62 0.17 25)", "oklch(0.96 0.02 85)"], ["oklch(0.6 0.12 245)", "oklch(0.96 0.02 85)"], ["oklch(0.66 0.13 150)", "oklch(0.95 0.03 90)"], ["oklch(0.8 0.14 85)", "oklch(0.62 0.16 20)"]];
const W = 1.5, D = 0.75;
export const geometry = softened(function geometry(ctx) {
  const P = ctx.params, lod = ctx.lod, S = STRIPES[(+P.stripe || 0) % 4];
  const yF = 2.3, yB = 2.75, zF = -D - 0.55, zB = D + 0.15;
  paint(ctx, "timber"); box(ctx, -W, 0, -D, W, 0.95, D, "b");
  if (lod >= 4) { tint(ctx, S[0]); face(ctx, [[-W - 0.2, yF, zF], [W + 0.2, yF, zF], [W + 0.2, yB, zB], [-W - 0.2, yB, zB]], [0, 1, 0]); return; }
  paint(ctx, "darkwood"); box(ctx, -W - 0.06, 0.95, -D - 0.08, W + 0.06, 1.02, D + 0.06);
  for (const x of [-W, W]) { strut(ctx, [x, 0, -D], [x, yF, -D], 0.06, 0.06, 4); strut(ctx, [x, 0, D], [x, yB, D], 0.06, 0.06, 4); }
  const n = 8, xs = (i) => -W - 0.2 + (2 * W + 0.4) * i / n;
  for (let i = 0; i < n; i++) {
    tint(ctx, S[i % 2]); face(ctx, [[xs(i), yF, zF], [xs(i + 1), yF, zF], [xs(i + 1), yB, zB], [xs(i), yB, zB]], [0, 1, 0]);
    if (lod <= 2) face(ctx, [[xs(i), yF, zF], [xs(i + 1), yF, zF], [(xs(i) + xs(i + 1)) / 2, yF - 0.28, zF]], [0, 0, -1]);
  }
  const goods = P.kind || "fruit";
  if (goods === "fruit") {
    const F = ["oklch(0.6 0.19 28)", "oklch(0.74 0.16 60)", "oklch(0.75 0.15 120)", "oklch(0.85 0.15 95)"];
    for (let c = 0; c < 3; c++) {
      const cx = -1 + c, cz = -0.2; paint(ctx, "timber"); box(ctx, cx - 0.4, 1.02, cz - 0.3, cx + 0.4, 1.28, cz + 0.3);
      tint(ctx, F[c]); for (let k = 0; k < (lod <= 2 ? 6 : 3); k++) orb(ctx, cx - 0.25 + (k % 3) * 0.25, 1.33, cz - 0.12 + Math.floor(k / 3) * 0.24, 0.12, 0.12, 0.12, 5, 3);
    }
    tint(ctx, F[3]); for (let k = 0; k < 3; k++) orb(ctx, -1 + k, 0.35, -D - 0.35, 0.3, 0.25, 0.3, 6, 3);
  } else if (goods === "flowers") {
    const B = ["oklch(0.72 0.17 0)", "oklch(0.87 0.16 95)", "oklch(0.62 0.17 305)", "oklch(0.95 0.03 90)", "oklch(0.7 0.17 40)"];
    for (let c = 0; c < 5; c++) {
      const cx = -1.2 + c * 0.6; tint(ctx, "oklch(0.6 0.06 240)"); frustum(ctx, cx, -0.2, 1.02, 1.35, 0.17, 0.22, 7, "t");
      tint(ctx, "oklch(0.55 0.12 140)"); orb(ctx, cx, 1.42, -0.2, 0.2, 0.12, 0.2, 5, 2);
      tint(ctx, B[c]); for (let k = 0; k < (lod <= 2 ? 5 : 2); k++) { const a = k * 1.3 + c; orb(ctx, cx + Math.cos(a) * 0.12, 1.55 + (k % 2) * 0.08, -0.2 + Math.sin(a) * 0.12, 0.08, 0.07, 0.08, 5, 2); }
    }
    for (let k = 0; k < 2; k++) { tint(ctx, "oklch(0.55 0.08 60)"); frustum(ctx, -0.9 + k * 1.8, -D - 0.35, 0, 0.45, 0.25, 0.3, 7, "t"); tint(ctx, B[k * 2]); orb(ctx, -0.9 + k * 1.8, 0.62, -D - 0.35, 0.3, 0.22, 0.3, 6, 3); }
  } else {
    const G = [[1.4, 0.4, 1.9], [0.5, 1.6, 0.8], [1.6, 0.6, 0.4], [0.7, 0.9, 2.0], [1.7, 1.3, 0.35]];
    paint(ctx, "darkwood"); box(ctx, -W, 1.4, D - 0.3, W, 1.46, D); box(ctx, -W, 1.9, D - 0.3, W, 1.96, D);
    for (let k = 0; k < 11; k++) {
      const row = k < 5 ? 0 : k < 8 ? 1 : 2, x = row === 0 ? -1.2 + k * 0.6 : row === 1 ? -1.1 + (k - 5) * 1.1 : -1.1 + (k - 8) * 1.1;
      const y = row === 0 ? 1.02 : row === 1 ? 1.46 : 1.96, z = row === 0 ? -0.25 : D - 0.15, g = G[k % 5];
      tint(ctx, `oklch(0.82 0.1 ${(k * 67) % 360})`, g); frustum(ctx, x, z, y, y + 0.22, 0.11, 0.11, 6, "b"); orb(ctx, x, y + 0.22, z, 0.11, 0.06, 0.11, 6, 2);
      if (lod <= 2) { paint(ctx, "darkwood"); frustum(ctx, x, z, y + 0.26, y + 0.38, 0.04, 0.04, 5, "t"); }
    }
    paint(ctx, "magic"); orb(ctx, 1.2, 1.2, -0.3, 0.14, 0.14, 0.14, 6, 3);
  }
});
export function collider(ctx) { box(ctx, -W, 0, -D, W, 1.02, D); }
