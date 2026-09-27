import { frustum, orb, strut, tint } from "./hearth-mesh.js";
// Hearthmere townsfolk: a round robed body, a big friendly head, a hat. params: robe, skin, hat (pointed | wide | scarf), apron. Faces -Z.
export function geometry(ctx) {
  const P = ctx.params, lod = ctx.lod, robe = P.robe || "oklch(0.6 0.12 250)", skin = P.skin || "oklch(0.8 0.07 60)";
  tint(ctx, robe); frustum(ctx, 0, 0, 0, 1.15, 0.36, 0.19, lod <= 2 ? 9 : 6, lod >= 4 ? "t" : "");
  tint(ctx, skin); orb(ctx, 0, 1.4, 0, 0.19, 0.2, 0.19, lod <= 2 ? 8 : 5, lod <= 2 ? 4 : 2);
  const hat = P.hat || "pointed";
  tint(ctx, P.hatColor || "oklch(0.5 0.1 30)");
  if (hat === "pointed") { frustum(ctx, 0, 0, 1.52, 1.56, 0.34, 0.34, 8, "tb"); frustum(ctx, 0, 0, 1.56, 2.0, 0.17, 0, 7, "b"); }
  else if (hat === "wide") { frustum(ctx, 0, 0, 1.53, 1.57, 0.42, 0.42, 9, "tb"); frustum(ctx, 0, 0, 1.57, 1.75, 0.2, 0.17, 8, "b"); }
  else orb(ctx, 0, 1.5, 0.03, 0.21, 0.13, 0.21, 6, 2);
  if (lod >= 4) return;
  tint(ctx, robe); for (const s of [-1, 1]) strut(ctx, [s * 0.2, 1.08, 0], [s * 0.3, 0.68, -0.08], 0.07, 0.06, 4);
  tint(ctx, skin); for (const s of [-1, 1]) orb(ctx, s * 0.31, 0.63, -0.09, 0.07, 0.07, 0.07, 5, 2);
  if (P.apron) { tint(ctx, P.apron); frustum(ctx, 0, -0.03, 0.3, 1.0, 0.33, 0.22, 6, ""); }
  if (lod <= 2) {
    tint(ctx, "oklch(0.25 0.02 40)"); for (const s of [-1, 1]) orb(ctx, s * 0.07, 1.43, -0.175, 0.025, 0.03, 0.02, 4, 2);
    tint(ctx, "oklch(0.72 0.12 20)"); for (const s of [-1, 1]) orb(ctx, s * 0.11, 1.36, -0.15, 0.04, 0.025, 0.02, 4, 2);
    tint(ctx, "oklch(0.88 0.13 85)", [1.6, 1.1, 0.35]); orb(ctx, 0.32, 0.5, -0.12, 0.08, 0.11, 0.08, 5, 2); // a little lantern in hand
  }
}
export function collider() { return null; }
