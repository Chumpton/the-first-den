// The links between the three squares (market, magic, garden): one family by params.kind, feet on the ground, metres.
// Data: scripts/lib/data/town-links.json. Paving is the terrain path mark each lane rides (config link-*).
// "lane":   params.lamps [[x, y, z, s], …] the market's own iron lamp posts, local; s = which way the arm reaches (±x).
// "post":   an oak finger-post on a limestone footing; its fingers are child rows (kind "finger") carrying the words.
// "finger": one arrow board pointing along local +x; the words ride the row's ui on both faces.
// "plaque": the name board on the arch's attic, limestone with a carved frame; the words ride the row's ui.
import { paint, box, solid, COL } from '../lib/town-kit.js';
import { lamp } from './town-square.js';
const sq = (w, y) => [[-w, y, -w], [w, y, -w], [w, y, w], [-w, y, w]];
function lane(ctx, p, lod) {
  if (lod >= 5) return;
  for (const [x, y, z, s] of p.lamps || []) lamp(ctx, ctx, x, z, lod, s, y);
}
function post(ctx, lod) {
  paint(ctx, 'ashlar', COL.lime, 0.92); box(ctx, -0.3, -0.3, -0.3, 0.3, 0.25, 0.3);
  paint(ctx, 'oak', 'oklch(0.8 0.06 60)', 0.85);
  if (lod >= 4) { box(ctx, -0.08, 0.25, -0.08, 0.08, 3.1, 0.08); return; }
  solid(ctx, sq(0.09, 0.25), sq(0.07, 2.95));
  paint(ctx, 'walnut', 'oklch(0.72 0.04 55)', 0.85);
  solid(ctx, sq(0.11, 2.95), sq(0.11, 3.03)); solid(ctx, sq(0.11, 3.03), sq(0.012, 3.25));
  if (lod <= 2) { paint(ctx, null, COL.iron, 0.5, 0.6); solid(ctx, sq(0.095, 0.35), sq(0.095, 0.45)); }
}
function finger(ctx, lod) {
  paint(ctx, 'oak', 'oklch(0.94 0.035 82)', 0.85); box(ctx, 0.08, -0.12, -0.03, 1.25, 0.12, 0.03);
  if (lod > 3) return;
  const a = [[1.25, -0.12, -0.03], [1.25, 0.12, -0.03], [1.25, 0.12, 0.03], [1.25, -0.12, 0.03]];
  solid(ctx, a, a.map(([, , z]) => [1.45, 0, z]));
  paint(ctx, 'walnut', 'oklch(0.62 0.05 50)', 0.85); box(ctx, 0.08, -0.14, -0.036, 0.16, 0.14, 0.036);
}
function plaque(ctx, p, lod) {
  const W = (p.w ?? 10.4) / 2, H = p.h ?? 1.15;
  paint(ctx, 'ashlar', 'oklch(0.95 0.025 82)', 0.9); box(ctx, -W, 0, -0.035, W, H, 0.035);
  if (lod > 2) return;
  paint(ctx, 'ashlar', COL.lime, 0.9);
  for (const [a, b, c, d] of [[-W, 0, W, 0.08], [-W, H - 0.08, W, H], [-W, 0, -W + 0.08, H], [W - 0.08, 0, W, H]]) box(ctx, a, b, -0.05, c, d, 0.05);
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = Number(ctx.lod ?? 1);
  if (p.kind === 'post') post(ctx, lod);
  else if (p.kind === 'finger') finger(ctx, lod);
  else if (p.kind === 'plaque') plaque(ctx, p, lod);
  else lane(ctx, p, lod);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'post') { box(ctx, -0.3, -0.3, -0.3, 0.3, 3.2, 0.3); return; }
  if (p.kind === 'finger' || p.kind === 'plaque') return null;
  for (const [x, y, z] of p.lamps || []) box(ctx, x - 0.28, y - 0.3, z - 0.28, x + 0.28, y + 4.3, z + 0.28);
}
