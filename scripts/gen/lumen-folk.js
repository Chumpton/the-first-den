// A Lumenvale townsperson: a robed, hooded (or pointy-hatted) figure with sleeves, a sash and a glowing pendant. Faces -Z.
import { kit, C, GLOW, HUE } from "./lumen-kit.js";
const ROBES = ["oklch(0.72 0.1 195)", "oklch(0.7 0.12 305)", "oklch(0.93 0.03 90)", "oklch(0.7 0.1 150)", "oklch(0.66 0.12 20)", "oklch(0.6 0.1 260)"];
export function geometry(ctx) {
  const p = ctx.params, K = kit(ctx), L = ctx.lod, n = L >= 4 ? 5 : 10, robe = ROBES[(+p.robe || 0) % ROBES.length], h = p.glow === "lilac" ? "lilac" : "teal";
  K.paint(robe, null, 0.9); K.lathe(0, 0, [[0.36, 0], [0.33, 0.3], [0.24, 0.9], [0.2, 1.25], [0.1, 1.42], [0, 1.44]], n);
  K.paint(C.skin, null, 0.8); K.lathe(0, -0.01, [[0.02, 1.4], [0.1, 1.46], [0.12, 1.56], [0.1, 1.66], [0, 1.71]], n);
  if (L >= 4) return;
  K.paint(C.trim, null, 0.5, 0.3); K.prism(0, 0, 0.235, 0.23, 0.9, 0.98, n, 0, "");
  if (p.hat) { K.paint(robe, null, 0.9); K.prism(0, 0, 0.27, 0.27, 1.64, 1.67, n, 0, "tb"); K.cone(0, 0, 0.14, 1.67, 2.1, n); }
  else { K.paint(robe, null, 0.9); K.lathe(0, 0.035, [[0.2, 1.36], [0.15, 1.5], [0.155, 1.62], [0.11, 1.72], [0, 1.76]], n); }
  for (const s of [-1, 1]) { K.paint(robe, null, 0.9); K.shard([s * 0.19, 1.32, 0], [s * 0.1, -1, -0.45], 0.075, 0.42, 0.04, 5); K.paint(C.skin); K.bipyr(s * 0.235, 0.9, -0.2, 0.05, 0.05, 0.05, 4); }
  if (L <= 2) { K.paint("oklch(0.3 0.03 40)"); for (const s of [-1, 1]) K.box(s * 0.045 - 0.015, 1.56, -0.125, s * 0.045 + 0.015, 1.59, -0.11, "k"); K.paint(HUE[h], GLOW[h], 0.2); K.bipyr(0, 1.13, -0.215, 0.04, 0.07, 0.05, 4); }
}
export function collider() { return null; }
