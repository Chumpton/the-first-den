// Garden Market wrought-iron gate: two limestone piers with lanterns, scrollwork leaves swung open outward and folded
// back beside the piers (the 6.1 m opening stays clear), an iron arch with a hanging name plaque, two lamp posts.
// Origin = opening centre at ground; front (−Z) faces out of the district; the span runs along x.
// params.part: 'gate' | 'plaque' (a 2.5 × 0.46 m board, origin at its centre; its ui carries the words).
import { TAU, paint, XF, lathe, box, ngon, prism, obox, beam } from '../lib/town-kit.js';
import { gem } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const IRON = 'oklch(0.24 0.012 60)', LIME = 'oklch(0.95 0.02 82)', LIME2 = 'oklch(0.9 0.028 74)', GILT = 'oklch(0.84 0.11 80)';
const PIER = 3.6, HINGE = 3.05, LEAF = 2.9, LAMP = [6.5, -0.4];
const OPEN = { d: [0.866, -0.5], yaw: Math.PI / 6 }; // 150° open: along the front, clear of the pier

function lantern(ctx, P, x, y, z, s, lod) { // stands on y
  paint(ctx, null, IRON, 0.5, 0.55);
  obox(P, x, y, z, 0.36 * s, 0.08 * s, 0.36 * s);
  if (lod <= 3) for (const [i, j] of [[1, 1], [-1, 1], [-1, -1], [1, -1]]) beam(P, [x + i * 0.15 * s, y + 0.08 * s, z + j * 0.15 * s], [x + i * 0.15 * s, y + 0.62 * s, z + j * 0.15 * s], 0.035 * s);
  prism(XF(P, x, 0, z), ngon(4, 0.3 * s, 0, 0, TAU / 8), y + 0.62 * s, y + 0.84 * s, 0.15);
  if (lod <= 2) gem(P, x, y + 0.84 * s, z, 0.05 * s, 0.14 * s, 0.01, 4);
  paint(ctx, null, 'oklch(0.88 0.12 78)', 0.3, 0); ctx.emissive(2.4, 1.45, 0.55);
  obox(P, x, y + 0.1 * s, z, 0.26 * s, 0.5 * s, 0.26 * s); ctx.emissive(null);
}
const ringXY = (P, cx, cy, z, r, n, w) => { for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; beam(P, [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z], [cx + Math.cos(b) * r, cy + Math.sin(b) * r, z], w); } };
const spiral = (P, map, cu, cy, R, turns, flip, w) => { const N = 22; let prev = null;
  for (let i = 0; i <= N; i++) { const t = i / N, a = flip * t * turns * TAU, r = R * (1 - t * 0.85); const q = map(cu + Math.cos(a) * r, cy + Math.sin(a) * r); if (prev) beam(P, prev, q, w); prev = q; } };

function gate(ctx, col) {
  const P = ctx, lod = col ? 5 : (ctx.lod || 1);
  if (col) {
    for (const s of [-1, 1]) { obox(P, s * PIER, -0.2, 0, 1.35, 3.4, 1.35); obox(P, s * LAMP[0], 0, LAMP[1], 0.3, 3.0, 0.3);
      const c = [s * HINGE + s * OPEN.d[0] * LEAF / 2, OPEN.d[1] * LEAF / 2]; obox(P, c[0], 0.1, c[1], LEAF, 2.3, 0.08, s > 0 ? OPEN.yaw : Math.PI - OPEN.yaw); }
    return;
  }
  // piers
  for (const s of [-1, 1]) {
    const x = s * PIER;
    paint(ctx, 'ashlar', LIME2, 0.9); obox(P, x, -0.2, 0, 1.35, 0.55, 1.35); obox(P, x, 2.8, 0, 1.35, 0.18, 1.35);
    prism(XF(P, x, 0, 0), ngon(4, 0.92, 0, 0, TAU / 8), 2.98, 3.2, 0.42);
    paint(ctx, 'ashlar', LIME, 0.9); obox(P, x, 0.35, 0, 1.1, 2.45, 1.1);
    if (lod <= 2) { paint(ctx, 'ashlar', LIME2, 0.9); obox(P, x, 1.9, 0, 1.18, 0.12, 1.18);
      paint(ctx, null, 'oklch(0.86 0.03 75)', 0.9); obox(P, x, 0.7, 0, 0.7, 1.0, 1.14);
      paint(ctx, null, IRON, 0.5, 0.55); gem(P, x, 1.2, -0.58, 0.1, 0.06, 0.06, 6); gem(P, x, 1.2, 0.58, 0.1, 0.06, 0.06, 6); }
    lantern(ctx, P, x, 3.2, 0, 1.2, lod);
    // hinge knuckles
    paint(ctx, null, IRON, 0.5, 0.55); if (lod <= 3) for (const y of [0.4, 1.8]) obox(P, s * (HINGE + 0.03), y, 0, 0.1, 0.18, 0.1);
  }
  // leaves
  if (lod <= 4) for (const s of [-1, 1]) {
    const d = [s * OPEN.d[0], OPEN.d[1]], m = (u, y) => [s * HINGE + d[0] * u, y, d[1] * u];
    const topY = (u) => 1.95 + 0.4 * Math.sin(u / LEAF * Math.PI / 2);
    paint(ctx, null, IRON, 0.5, 0.55);
    beam(P, m(0.04, 0.08), m(0.04, topY(0.04) + 0.04), 0.07); beam(P, m(LEAF - 0.04, 0.08), m(LEAF - 0.04, topY(LEAF) + 0.04), 0.07);
    for (const y of [0.12, 0.62, 1.55]) beam(P, m(0.04, y), m(LEAF - 0.04, y), 0.06);
    const TS = lod <= 2 ? 10 : 4; for (let i = 0; i < TS; i++) { const u0 = 0.04 + (LEAF - 0.08) * i / TS, u1 = 0.04 + (LEAF - 0.08) * (i + 1) / TS; beam(P, m(u0, topY(u0)), m(u1, topY(u1)), 0.06); }
    if (lod <= 3) { const step = lod <= 2 ? 0.16 : 0.32;
      for (let u = 0.2; u < LEAF - 0.1; u += step) { beam(P, m(u, 0.12), m(u, topY(u) + 0.14), 0.034); if (lod <= 2) gem(P, ...m(u, topY(u) + 0.16), 0.045, 0.1, 0.03, 4); } }
    if (lod <= 2) {
      for (let u = 0.24; u < LEAF - 0.1; u += 0.32) { const c = m(u, 0.37); ringXY(XF(P, c[0], 0, c[2], s > 0 ? OPEN.yaw : Math.PI - OPEN.yaw), 0, 0.37, 0, 0.19, 8, 0.028); }
      for (const [cu, fl] of [[LEAF * 0.3, 1], [LEAF * 0.7, -1]]) spiral(P, m, cu, 1.08, 0.4, 1.6, fl * s, 0.032);
      paint(ctx, 'cdn/texture-hammered-bronze-metal.png', GILT, 0.35, 0.85);
      for (const cu of [LEAF * 0.3, LEAF * 0.7]) gem(P, ...m(cu, 1.08), 0.07, 0.07, 0.07, 6);
    }
  }
  // iron arch with gilt fleur and two plaque hangers
  if (lod <= 3) {
    paint(ctx, null, IRON, 0.5, 0.55);
    const N = lod <= 2 ? 22 : 12, arc = (rx, ry, a) => [Math.cos(a) * rx, 2.8 + Math.sin(a) * ry, 0];
    for (const [rx, ry] of [[HINGE, 1.95], [HINGE - 0.3, 1.6]]) for (let i = 0; i < N; i++) beam(P, arc(rx, ry, i / N * Math.PI), arc(rx, ry, (i + 1) / N * Math.PI), 0.07);
    for (let k = 1; k < 9; k++) { const a = k / 9 * Math.PI; if (lod <= 2) { const o = arc(HINGE, 1.95, a), i2 = arc(HINGE - 0.3, 1.6, a); ringXY(P, (o[0] + i2[0]) / 2, (o[1] + i2[1]) / 2, 0, Math.hypot(o[0] - i2[0], o[1] - i2[1]) * 0.42, 8, 0.025); } }
    for (const x of [-0.9, 0.9]) beam(P, [x, 4.34, 0], [x, 4.16, 0], 0.03);
    if (lod <= 2) { spiral(P, (u, y) => [u, y, 0], -0.35, 5.0, 0.22, 1.3, 1, 0.03); spiral(P, (u, y) => [u, y, 0], 0.35, 5.0, 0.22, 1.3, -1, 0.03);
      paint(ctx, 'cdn/texture-hammered-bronze-metal.png', GILT, 0.35, 0.85); gem(P, 0, 4.8, 0, 0.12, 0.42, 0.05, 4); gem(P, -0.14, 4.85, 0, 0.06, 0.2, 0.04, 4); gem(P, 0.14, 4.85, 0, 0.06, 0.2, 0.04, 4); }
  }
  // lamp posts
  for (const s of [-1, 1]) {
    const x = s * LAMP[0], z = LAMP[1];
    paint(ctx, null, IRON, 0.5, 0.55);
    lathe(P, [[0.28, 0], [0.26, 0.12], [0.16, 0.22], [0.1, 0.5], [0.075, 0.62], [0.06, 2.88], [0.11, 2.94], [0.11, 3.0], [0.01, 3.0]], lod <= 2 ? 8 : 5, x, 0, z);
    if (lod <= 2) { spiral(P, (u, y) => [x + u, y, z], s * 0.2, 2.55, 0.18, 1.2, s, 0.025); obox(P, x, 1.4, z, 0.16, 0.06, 0.16); }
    lantern(ctx, P, x, 3.0, z, 1, lod);
  }
}

function plaque(ctx) {
  paint(ctx, null, 'oklch(0.22 0.015 60)', 0.6, 0.4);
  box(ctx, -1.25, -0.23, -0.02, 1.25, 0.23, 0.02);
}
export const geometry = softened(function geometry(ctx) { if (ctx.params.part === 'plaque') return plaque(ctx); gate(ctx, false); });
export function collider(ctx) { if (ctx.params.part === 'plaque') return null; gate(ctx, true); }
