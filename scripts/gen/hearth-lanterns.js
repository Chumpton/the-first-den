import { strut, orb, frustum, paint } from "./hearth-mesh.js";
// A string of paper lanterns hung between two points: local x runs -len/2 → +len/2, attachment heights h0 → h1, sagging.
// params: len, h0, h1, sag, posts "both" | "end" | "none". Seeded colours. Many rows share a few param sets, so they instance.
const GLOW = ["lanternglow", "lanternrose", "lanterngold"];
export function geometry(ctx) {
  const P = ctx.params, lod = ctx.lod, len = +P.len || 9, h0 = +P.h0 || 5, h1 = +(P.h1 ?? h0) || 5, sag = +(P.sag ?? len * 0.09), posts = P.posts || "both";
  const at = (t) => [-len / 2 + len * t, h0 + (h1 - h0) * t - sag * 4 * t * (1 - t), 0];
  const px = posts === "both" ? [-len / 2, len / 2] : posts === "end" ? [len / 2] : [];
  paint(ctx, "darkwood");
  for (const x of px) { const h = x < 0 ? h0 : h1; strut(ctx, [x, 0, 0], [x, h + 0.35, 0], 0.08, 0.07, 4); if (lod <= 3) { paint(ctx, "lanterngold"); orb(ctx, x, h + 0.5, 0, 0.13, 0.16, 0.13, 5, 2); paint(ctx, "darkwood"); } }
  if (lod <= 3) { const seg = lod <= 2 ? 8 : 4; for (let i = 0; i < seg; i++) strut(ctx, at(i / seg), at((i + 1) / seg), 0.015, 0.015, 3); }
  if (lod >= 5) return;
  const n = Math.max(3, Math.round(len / 1.45));
  for (let k = 1; k <= n; k++) {
    const p = at(k / (n + 1)), big = ctx.random() < 0.3 ? 1.25 : 1, c = [p[0], p[1] - 0.32 * big, 0];
    paint(ctx, GLOW[Math.floor(ctx.random() * 3)]);
    orb(ctx, c[0], c[1], c[2], 0.17 * big, 0.23 * big, 0.17 * big, lod <= 2 ? 6 : 4, lod <= 2 ? 3 : 2);
    if (lod <= 2) { paint(ctx, "darkwood"); frustum(ctx, c[0], c[2], c[1] + 0.2 * big, c[1] + 0.3 * big, 0.08, 0.05, 5, "t"); }
  }
}
export function collider() { return null; }
