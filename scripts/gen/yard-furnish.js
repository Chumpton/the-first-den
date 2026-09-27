// lived-in pieces for the grounds. params: { kind: "bench"|"birdbath"|"sundial" }. front (a sitter's view) is -Z.
import { paint, obox, beam, lathe, gem, box, prism, ngon, TAU } from '../lib/yard-kit.js';
const STONE = 'oklch(0.94 0.02 85)';
function bench(ctx, lod) {
  const L = 1.6, seat = 0.45, D = 0.42;
  paint(ctx, 'walnut', 'oklch(0.92 0.03 55)', 0.85);
  for (const sx of [-1, 1]) {
    obox(ctx, sx * (L / 2 - 0.12), 0, -D / 2 + 0.05, 0.08, seat - 0.04, 0.08);
    obox(ctx, sx * (L / 2 - 0.12), 0, D / 2 - 0.05, 0.08, 0.86, 0.08);
    obox(ctx, sx * (L / 2 - 0.12), seat - 0.1, 0, 0.07, 0.06, D);
    if (lod <= 3) { obox(ctx, sx * (L / 2 - 0.12), 0.62, -0.02, 0.06, 0.05, D + 0.02); obox(ctx, sx * (L / 2 - 0.12), 0.46, -D / 2 + 0.03, 0.05, 0.16, 0.05); }
  }
  if (lod <= 3) obox(ctx, 0, 0.12, 0, L - 0.3, 0.05, 0.05);
  paint(ctx, 'oak', 'oklch(0.93 0.04 70)', 0.75);
  const slats = lod <= 2 ? 4 : lod <= 4 ? 2 : 1;
  for (let i = 0; i < slats; i++) { const w = D / slats; obox(ctx, 0, seat - 0.04, -D / 2 + w * (i + 0.5), L, 0.04, w - (slats > 1 ? 0.015 : 0)); }
  const backs = lod <= 2 ? 3 : 1;
  for (let i = 0; i < backs; i++) { const y = 0.58 + i * (0.26 / Math.max(1, backs - 1 || 1)) * (backs > 1 ? 1 : 0); beam(ctx, [-L / 2 + 0.06, y, D / 2 - 0.02 + (y - 0.5) * 0.08], [L / 2 - 0.06, y, D / 2 - 0.02 + (y - 0.5) * 0.08], 0.03, backs > 1 ? 0.08 : 0.3); }
}
function birdbath(ctx, lod) {
  const n = lod <= 2 ? 14 : lod <= 4 ? 8 : 6;
  paint(ctx, 'stone', STONE, 0.9);
  const prof = lod <= 3 ? [[0.26, 0], [0.26, 0.08], [0.18, 0.12], [0.1, 0.2], [0.08, 0.55], [0.1, 0.62], [0.14, 0.66], [0.2, 0.72], [0.34, 0.8], [0.4, 0.86], [0.4, 0.9], [0.33, 0.9]] : [[0.24, 0], [0.09, 0.2], [0.09, 0.66], [0.4, 0.86], [0.4, 0.9], [0.3, 0.9]];
  lathe(ctx, prof, n);
  ctx.albedo(null); ctx.color('oklch(0.72 0.07 195)'); ctx.roughness(0.08); ctx.metalness(0);
  lathe(ctx, [[0.34, 0.875], [0, 0.875]].reverse().map(([r, y]) => [r, y]).reverse(), n);
  if (lod <= 2) { // a small bird on the rim
    paint(ctx, null, 'oklch(0.55 0.08 50)', 0.8);
    gem(ctx, 0.36, 0.97, 0.05, 0.05, 0.06, 0.03, 6);
    paint(ctx, null, 'oklch(0.7 0.13 45)', 0.8); gem(ctx, 0.37, 1.02, 0.02, 0.028, 0.03, 0.01, 5);
    paint(ctx, null, 'oklch(0.3 0.03 60)', 0.8); gem(ctx, 0.365, 1.035, -0.035, 0.008, 0.004, 0.004, 4);
  }
  if (lod <= 3) { paint(ctx, 'moss', 'oklch(0.92 0.05 130)', 0.95); lathe(ctx, [[0.3, 0.005], [0.3, 0.03], [0.22, 0.05]], n); }
}
function sundial(ctx, lod) {
  const n = lod <= 2 ? 8 : 6;
  paint(ctx, 'stone', STONE, 0.9);
  prism(ctx, ngon(n, 0.34, 0, 0, Math.PI / n), 0, 0.1);
  if (lod <= 3) prism(ctx, ngon(n, 0.26, 0, 0, Math.PI / n), 0.1, 0.18);
  lathe(ctx, [[0.13, 0.18], [0.1, 0.3], [0.1, 0.78], [0.14, 0.84], [0.24, 0.88]], n);
  prism(ctx, ngon(n, 0.26, 0, 0, Math.PI / n), 0.88, 0.95);
  paint(ctx, 'brass', 'oklch(0.93 0.05 80)', 0.4, 0.75);
  lathe(ctx, [[0.22, 0.95], [0.22, 0.965], [0, 0.965]], lod <= 2 ? 16 : 8);
  // gnomon (triangle fin pointing north, -Z)
  const t = 0.012;
  box(ctx, -t, 0.965, -0.18, t, 0.975, 0.16);
  for (const s of [-t, t]) ctx.tri(s, 0.965, 0.16, s, 0.965, -0.16, s, 1.14, 0.14);
  ctx.quad(-t, 0.965, -0.16, t, 0.965, -0.16, t, 1.14, 0.14, -t, 1.14, 0.14);
  if (lod <= 2) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; box(ctx, Math.cos(a) * 0.19 - 0.006, 0.965, Math.sin(a) * 0.19 - 0.006, Math.cos(a) * 0.19 + 0.006, 0.972, Math.sin(a) * 0.19 + 0.006); }
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1;
  ctx.flat();
  (p.kind === 'birdbath' ? birdbath : p.kind === 'sundial' ? sundial : bench)(ctx, lod);
  ctx.albedo(null);
}
export function collider(ctx) {
  const k = (ctx.params || {}).kind;
  if (k === 'bench') return { kind: 'box', width: 1.6, height: 0.9, depth: 0.45 };
  box(ctx, -0.3, 0, -0.3, 0.3, 0.9, 0.3);
}
