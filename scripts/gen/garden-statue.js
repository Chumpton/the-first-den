// Garden statuary in weathered limestone. params.kind: "maiden" (robed figure with a pitcher on a plinth), "urn" (a tall planted urn
// on a pedestal), "fountain" (a round basin, the maiden standing in it pouring). Faces -Z. Colliders are the plinth/basin only.
import { paint, obox, lathe, blob, TAU } from '../lib/yard-kit.js';
import { box, prism, ngon } from '../lib/road-solid.js';
const LIME = (ctx) => `oklch(${(0.86 + ctx.random() * 0.05).toFixed(3)} 0.018 ${(80 + ctx.random() * 15).toFixed(0)})`;
function plinth(ctx, s, h) { paint(ctx, 'stone', 'oklch(0.84 0.02 80)', 0.92); obox(ctx, 0, 0, 0, s + 0.14, 0.14, s + 0.14); paint(ctx, 'stone', LIME(ctx), 0.92); obox(ctx, 0, 0.14, 0, s, h - 0.28, s); paint(ctx, 'stone', 'oklch(0.9 0.018 85)', 0.9); obox(ctx, 0, h - 0.14, 0, s + 0.12, 0.14, s + 0.12); }
function maiden(ctx, y0, lod, sc = 1) {
  const n = lod <= 2 ? 12 : 6, S = (v) => v * sc;
  paint(ctx, null, 'oklch(0.9 0.015 85)', 0.95);
  lathe(ctx, [[S(0.26), y0], [S(0.24), y0 + S(0.2)], [S(0.19), y0 + S(0.7)], [S(0.15), y0 + S(1.0)], [S(0.13), y0 + S(1.18)], [S(0.16), y0 + S(1.3)], [S(0.07), y0 + S(1.42)], [0.001, y0 + S(1.43)]], n);
  if (lod <= 2) for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; obox(ctx, Math.cos(a) * S(0.2), y0, Math.sin(a) * S(0.2), S(0.05), S(0.75), S(0.04), -a); } // robe folds
  blob(ctx, 0, y0 + S(1.56), 0, S(0.1), S(0.13), S(0.11), lod <= 2 ? 8 : 5);
  blob(ctx, 0, y0 + S(1.6), S(0.07), S(0.1), S(0.1), S(0.08), lod <= 2 ? 6 : 4);            // hair knot behind
  // arms cradling a pitcher at the hip, tipped forward
  obox(ctx, S(0.16), y0 + S(1.02), -S(0.02), S(0.07), S(0.3), S(0.07), 0.3); obox(ctx, -S(0.12), y0 + S(1.02), -S(0.08), S(0.07), S(0.28), S(0.07), -0.5);
  lathe(ctx, [[S(0.05), y0 + S(0.95)], [S(0.1), y0 + S(1.02)], [S(0.1), y0 + S(1.12)], [S(0.05), y0 + S(1.2)], [S(0.06), y0 + S(1.24)]], n, S(0.1), -S(0.16));
}
function urn(ctx, y0, lod) {
  const n = lod <= 2 ? 14 : 7;
  paint(ctx, 'stone', 'oklch(0.9 0.018 85)', 0.92);
  lathe(ctx, [[0.14, y0], [0.12, y0 + 0.12], [0.1, y0 + 0.2], [0.22, y0 + 0.32], [0.34, y0 + 0.55], [0.36, y0 + 0.7], [0.3, y0 + 0.78], [0.38, y0 + 0.82], [0.35, y0 + 0.86]], n);
  paint(ctx, 'leaf', 'oklch(0.78 0.11 140)', 0.85); blob(ctx, 0, y0 + 0.85, 0, 0.34, 0.26, 0.34, lod <= 2 ? 8 : 5, () => ctx.random());
  if (lod <= 2) { for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + ctx.random(); paint(ctx, null, ['oklch(0.72 0.16 350)', 'oklch(0.95 0.03 90)', 'oklch(0.64 0.14 300)'][i % 3], 0.7); blob(ctx, Math.cos(a) * 0.25, y0 + 0.98 + ctx.random() * 0.12, Math.sin(a) * 0.25, 0.06, 0.05, 0.06, 5); }
    paint(ctx, 'leaf', 'oklch(0.72 0.1 140)', 0.85); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; for (let k = 0; k < 4; k++) blob(ctx, Math.cos(a) * (0.36 + k * 0.01), y0 + 0.78 - k * 0.14, Math.sin(a) * (0.36 + k * 0.01), 0.05, 0.08, 0.05, 4); } }
}
function fountain(ctx, lod) {
  const n = lod <= 2 ? 28 : 12, R = 1.6;
  paint(ctx, 'stone', 'oklch(0.86 0.02 80)', 0.92);
  lathe(ctx, [[R + 0.12, 0], [R + 0.16, 0.12], [R + 0.1, 0.5], [R + 0.2, 0.58], [R + 0.2, 0.66], [R - 0.12, 0.66], [R - 0.12, 0.1], [0.001, 0.1]], n);
  ctx.albedo(null); ctx.color('oklch(0.62 0.07 195)'); ctx.roughness(0.1); ctx.metalness(0.1); prism(ctx, ngon(n, R - 0.12), 0.1, 0.52);
  paint(ctx, 'stone', 'oklch(0.88 0.02 85)', 0.92); lathe(ctx, [[0.34, 0.5], [0.3, 0.8], [0.22, 0.9], [0.4, 1.0], [0.4, 1.08]], lod <= 2 ? 12 : 6);
  maiden(ctx, 1.08, lod, 0.85);
}
export function geometry(ctx) { const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  if (p.kind === 'fountain') fountain(ctx, lod); else if (p.kind === 'urn') { plinth(ctx, 0.5, 0.75); urn(ctx, 0.75, lod); } else { plinth(ctx, 0.62, 0.9); maiden(ctx, 0.9, lod); }
  ctx.albedo(null); }
export function collider(ctx) { const k = ctx.params?.kind; if (k === 'fountain') prism(ctx, ngon(12, 1.8), 0, 0.66); else { const s = k === 'urn' ? 0.32 : 0.38; box(ctx, -s, 0, -s, s, k === 'urn' ? 1.7 : 2.4, s); } }
