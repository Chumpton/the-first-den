// Vertical lamplight for the home grounds. params.kind:
//  "posts": 2.8 m wrought-iron lantern posts on a limestone footing, params.posts = [[x, y, z], …] local feet points (one draw per path).
//  "strings": catenary cords of small paper lanterns (warm / teal / rose, emissive), params.strings = [{ a: [x,y,z], b: [x,y,z], sag, n }],
//             params.poles = [[x, y, z, h]] little iron hook poles the cords hang from. Feet anywhere; all points local.
import { solid, ngon, gem } from "../lib/road-solid.js";
import { paint, beam } from "../lib/yard-kit.js";
const IRON = "oklch(0.3 0.012 250)", GLASS = "oklch(0.95 0.07 80)", GLOW = "oklch(0.85 0.14 70)";
const LANT = [
  ["oklch(0.95 0.06 75)", "oklch(0.82 0.15 70)"],
  ["oklch(0.93 0.05 190)", "oklch(0.78 0.11 190)"],
  ["oklch(0.93 0.05 10)", "oklch(0.76 0.13 12)"],
];
// a tapered n-gon column centred at (x, z), r0 at y0 to r1 at y1
function col(ctx, n, x, z, y0, y1, r0, r1, rot = Math.PI / n) {
  solid(ctx, ngon(n, r0, x, z, rot).map(([u, v]) => [u, y0, v]), ngon(n, r1, x, z, rot).map(([u, v]) => [u, y1, v]));
}
function iron(ctx) { paint(ctx, null, IRON, 0.55, 0.6); }
function glow(ctx, c = GLASS, e = GLOW) { ctx.albedo(null); ctx.color(c); ctx.emissive(e); ctx.roughness(0.35); ctx.metalness(0); }
function post(ctx, [x, y, z], lod) {
  const hi = lod <= 2, n = hi ? 8 : 4;
  paint(ctx, "stone", "oklch(0.88 0.025 82)", 0.9);
  col(ctx, n, x, z, y - 0.2, y + 0.18, 0.22, 0.2);
  iron(ctx);
  if (hi) { col(ctx, 8, x, z, y + 0.18, y + 0.32, 0.13, 0.12); col(ctx, 8, x, z, y + 0.32, y + 0.62, 0.1, 0.05); }
  col(ctx, n, x, z, y + (hi ? 0.62 : 0.18), y + 2.14, hi ? 0.045 : 0.05, 0.04);
  if (hi) {
    col(ctx, 8, x, z, y + 1.15, y + 1.22, 0.07, 0.07); col(ctx, 8, x, z, y + 2.0, y + 2.08, 0.075, 0.075);
    for (const [a, b] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) beam(ctx, [x, y + 1.86, z], [x + a * 0.12, y + 2.14, z + b * 0.12], 0.022, 0.022); // scroll brackets
  }
  // lantern: seat plate, glass, corner stiles, hipped cap, finial
  col(ctx, 4, x, z, y + 2.12, y + 2.17, 0.2, 0.2, Math.PI / 4);
  glow(ctx); col(ctx, hi ? 6 : 4, x, z, y + 2.17, y + 2.5, 0.12, 0.14);
  iron(ctx);
  if (hi) for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2, cx = x + Math.cos(a) * 0.15, cz = z + Math.sin(a) * 0.15; col(ctx, 4, cx, cz, y + 2.17, y + 2.52, 0.018, 0.018); }
  col(ctx, 4, x, z, y + 2.5, y + 2.54, 0.21, 0.21, Math.PI / 4);
  col(ctx, 4, x, z, y + 2.54, y + 2.7, 0.2, 0.03, Math.PI / 4);
  if (hi) gem(ctx, x, y + 2.75, z, 0.035, 0.07, 0.05, 4); else col(ctx, 4, x, z, y + 2.7, y + 2.8, 0.03, 0.005);
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const cordAt = (s, t) => { const p = lerp(s.a, s.b, t); p[1] -= (s.sag ?? 1) * 4 * t * (1 - t); return p; };
function strings(ctx, p, lod) {
  const hi = lod <= 2, mid = lod <= 3;
  for (const [x, y, z, h] of p.poles ?? []) { // hook poles bolted to the rail
    iron(ctx); col(ctx, hi ? 6 : 4, x, z, y, y + h, 0.035, 0.03);
    if (hi) { beam(ctx, [x, y + h - 0.02, z], [x, y + h + 0.12, z + 0.001], 0.03, 0.03); col(ctx, 6, x, z, y + h, y + h + 0.03, 0.05, 0.05); }
  }
  let li = 0;
  for (const s of p.strings ?? []) {
    const seg = hi ? 14 : mid ? 8 : 4;
    iron(ctx); ctx.color("oklch(0.35 0.03 60)");
    for (let i = 0; i < seg; i++) beam(ctx, cordAt(s, i / seg), cordAt(s, (i + 1) / seg), 0.02, 0.02);
    const n = s.n ?? 10;
    for (let i = 1; i <= n; i++) {
      const c = cordAt(s, i / (n + 1)), [pap, em] = LANT[(li++ + (s.hue ?? 0)) % 3];
      const big = i % 2 ? 1 : 0.8, r = 0.13 * big, hgt = 0.3 * big, top = c[1] - 0.1, bot = top - hgt;
      if (hi) { iron(ctx); beam(ctx, [c[0], c[1], c[2]], [c[0], top, c[2] + 0.001], 0.012, 0.012); }
      if (mid) {
        glow(ctx, pap, em);
        const m = hi ? 8 : 5, [x, z] = [c[0], c[2]];
        col(ctx, m, x, z, bot + hgt * 0.12, bot + hgt * 0.5, r * 0.6, r);
        col(ctx, m, x, z, bot + hgt * 0.5, top - hgt * 0.12, r, r * 0.6);
        if (hi) { paint(ctx, null, "oklch(0.38 0.05 50)", 0.8); col(ctx, 6, x, z, top - hgt * 0.12, top, r * 0.45, r * 0.4); col(ctx, 6, x, z, bot, bot + hgt * 0.12, r * 0.4, r * 0.45); }
      } else if (i % 2) { glow(ctx, pap, em); gem(ctx, c[0], (top + bot) / 2, c[2], r, hgt / 2, hgt / 2, 4); }
    }
  }
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  ctx.flat();
  if (p.kind === "strings") strings(ctx, p, lod);
  else for (const q of p.posts ?? []) post(ctx, q, lod);
  ctx.albedo(null); ctx.emissive(null);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === "strings") return null;
  for (const [x, y, z] of p.posts ?? []) solid(ctx, ngon(4, 0.2, x, z, Math.PI / 4).map(([u, v]) => [u, y - 0.2, v]), ngon(4, 0.2, x, z, Math.PI / 4).map(([u, v]) => [u, y + 2.2, v]));
}
