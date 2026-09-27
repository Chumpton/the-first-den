// Maze dressing. params.kind: "gate" — the timber entrance arch over the gap (origin mid-gap at ground, path runs along Z,
// posts at x ±1.7, plank sign on the beam); "giant" — the golden sunflower at the heart (4.6 m, head facing +Z);
// "bale" — a round hay bale lying on its side (axis X, 1.3 m across).
import { box, solid } from '../lib/road-solid.js';
const TAU = Math.PI * 2;
function ring(cx, cy, cz, r, n, axis = 'y', rot = 0) { const a = []; for (let i = 0; i < n; i++) { const t = rot + (i / n) * TAU, c = Math.cos(t) * r, s = Math.sin(t) * r; a.push(axis === 'y' ? [cx + c, cy, cz + s] : axis === 'x' ? [cx, cy + c, cz + s] : [cx + c, cy + s, cz]); } return a; }
function log(ctx, x, y0, z, r, h, n) { solid(ctx, ring(x, y0, z, r, n), ring(x, y0 + h, z, r * 0.92, n)); }
function gate(ctx, lod) {
  const n = lod <= 2 ? 7 : 4;
  ctx.albedo('cdn/texture-rough-sawn-weathered-oak-timber.png'); ctx.roughness(0.95);
  for (const x of [-1.7, 1.7]) { ctx.color('oklch(0.92 0.02 70)'); log(ctx, x, -0.3, 0, 0.14, 3.8, n); }
  ctx.color('oklch(0.9 0.02 65)'); box(ctx, -2.3, 3.2, -0.12, 2.3, 3.45, 0.12);
  if (lod <= 3) for (const s of [-1, 1]) { ctx.color('oklch(0.9 0.02 70)'); solid(ctx, [[s * 1.72, 2.45, -0.07], [s * 1.62, 2.45, -0.07], [s * 1.62, 2.45, 0.07], [s * 1.72, 2.45, 0.07]], [[s * 1.1, 3.2, -0.07], [s * 1.0, 3.2, -0.07], [s * 1.0, 3.2, 0.07], [s * 1.1, 3.2, 0.07]]); }
  // the sign plank hangs under the beam on two ropes
  ctx.albedo('cdn/texture-honey-oak-planks-painted-sign-board.png'); ctx.color('oklch(0.94 0.03 75)');
  box(ctx, -1.25, 2.55, -0.04, 1.25, 3.05, 0.04);
  ctx.albedo(null); ctx.color('oklch(0.7 0.05 80)');
  for (const x of [-1, 1]) box(ctx, x - 0.015, 3.05, -0.015, x + 0.015, 3.2, 0.015);
  if (lod > 3) return;
  // a garland of sunflower heads along the beam, and one on each post top
  const heads = [[-2.1, 3.5], [-1.3, 3.55], [-0.45, 3.5], [0.45, 3.55], [1.3, 3.5], [2.1, 3.55], [-1.7, 3.62], [1.7, 3.62]];
  for (const [x, y] of heads) for (const f of [1, -1]) {
    const z = f * 0.14, seg = lod <= 2 ? 9 : 5, R = 0.12;
    ctx.color('oklch(0.32 0.06 55)');
    for (let i = 0; i < seg; i++) { const a = i / seg * TAU, b = (i + 1) / seg * TAU; ctx.tri(x, y, z + f * 0.01, x + Math.cos(a) * R, y + Math.sin(a) * R, z, x + Math.cos(b) * R, y + Math.sin(b) * R, z); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, w = 0.2; ctx.color(`oklch(${(0.8 + ctx.random() * 0.06).toFixed(3)} 0.17 88)`); ctx.tri(x + Math.cos(a - w) * R, y + Math.sin(a - w) * R, z, x + Math.cos(a + w) * R, y + Math.sin(a + w) * R, z, x + Math.cos(a) * R * 2.2, y + Math.sin(a) * R * 2.2, z - f * 0.02); }
  }
  // corn sheaves tied to each post foot
  for (const x of [-2.05, 2.05]) for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU, r = 0.18; ctx.color(`oklch(${(0.74 + ctx.random() * 0.06).toFixed(3)} 0.1 88)`);
    ctx.tri(x + Math.cos(a) * r - 0.03, 0, Math.sin(a) * r, x + Math.cos(a) * r + 0.03, 0, Math.sin(a) * r, x + Math.cos(a) * r * 0.3, 1.5 + ctx.random() * 0.3, Math.sin(a) * r * 0.3);
  }
}
function giant(ctx, lod) {
  const n = lod <= 2 ? 8 : 5;
  ctx.color('oklch(0.55 0.11 128)'); solid(ctx, ring(0, 0, 0, 0.13, n), ring(0.05, 4.4, 0.1, 0.08, n));
  for (let i = 0; i < (lod <= 3 ? 6 : 2); i++) {
    const y = 0.8 + i * 0.55, a = i * 2.4, len = 1.1 - i * 0.08, dx = Math.cos(a), dz = Math.sin(a), px = -dz * 0.28, pz = dx * 0.28;
    ctx.color('oklch(0.52 0.13 132)');
    const m = [dx * len * 0.55, y + 0.25, dz * len * 0.55], e = [dx * len, y - 0.1, dz * len];
    ctx.tri(0, y, 0, m[0] + px, m[1], m[2] + pz, ...e); ctx.tri(0, y, 0, ...e, m[0] - px, m[1], m[2] - pz);
  }
  // the head faces +Z, tipped a touch down; centre seeds glow faintly gold
  const cx = 0.05, cy = 4.55, cz = 0.25, R = 0.62, seg = lod <= 2 ? 24 : 10, tip = -0.25;
  const P = (a, r, d = 0) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r + d * tip, cz + d];
  ctx.color('oklch(0.3 0.06 55)'); ctx.emissive('oklch(0.35 0.08 70)');
  for (let i = 0; i < seg; i++) ctx.tri(...P(0, 0, 0.06), ...P(i / seg * TAU, R), ...P((i + 1) / seg * TAU, R));
  ctx.emissive(null); ctx.color('oklch(0.45 0.1 128)');
  for (let i = 0; i < seg; i++) ctx.tri(...P(0, 0, -0.12), ...P((i + 1) / seg * TAU, R), ...P(i / seg * TAU, R));
  for (const [layer, count, len] of [[0, lod <= 2 ? 26 : 12, 2.0], [1, lod <= 2 ? 26 : 0, 1.7]]) for (let i = 0; i < count; i++) {
    const a = (i + layer * 0.5) / count * TAU, w = TAU / count * 0.5;
    ctx.color(`oklch(${(0.8 + ctx.random() * 0.07).toFixed(3)} 0.18 ${Math.round(82 + ctx.random() * 10)})`); ctx.emissive(layer ? null : 'oklch(0.3 0.08 85)');
    ctx.tri(...P(a - w, R * 0.96, -0.01 * layer), ...P(a + w, R * 0.96, -0.01 * layer), ...P(a, R * len, -0.08));
  }
  ctx.emissive(null);
}
function bale(ctx, lod) {
  ctx.albedo('cdn/texture-golden-rolled-hay-bale-straw.png'); ctx.color('oklch(0.95 0.03 85)'); ctx.roughness(1);
  const n = lod <= 2 ? 14 : 7; solid(ctx, ring(-0.6, 0.62, 0, 0.62, n, 'x'), ring(0.6, 0.62, 0, 0.6, n, 'x'));
}
export function geometry(ctx) {
  const k = ctx.params.kind ?? 'gate', lod = ctx.lod ?? 1; ctx.flat();
  if (k === 'giant') giant(ctx, lod); else if (k === 'bale') bale(ctx, lod); else gate(ctx, lod);
}
export function collider(ctx) {
  const k = ctx.params.kind ?? 'gate';
  if (k === 'giant') return { kind: 'box', width: 0.3, height: 4.4, depth: 0.3 };
  if (k === 'bale') return { kind: 'box', width: 1.2, height: 1.24, depth: 1.24 };
  for (const x of [-1.7, 1.7]) box(ctx, x - 0.15, -0.3, -0.15, x + 0.15, 3.5, 0.15);
}
