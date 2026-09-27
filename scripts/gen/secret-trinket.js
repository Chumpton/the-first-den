// The den's hidden secrets, each small enough to miss. params.kind: nest (twig nest, one golden egg) · gnome (a garden gnome,
// 0.45 m) · fairydoor (a mossy stump with a tiny arched door facing -Z) · frog (a mossy stone frog) · bottle (a corked green
// bottle lying in the sand) · mushrooms (a ring of red-capped toadstools, 1.6 m across). Origin at the ground.
import { solid, box } from '../lib/road-solid.js';
const TAU = Math.PI * 2;
const ring = (cx, cy, cz, r, n, rot = 0, sy = 1) => Array.from({ length: n }, (_, i) => { const t = rot + i / n * TAU; return [cx + Math.cos(t) * r, cy, cz + Math.sin(t) * r * sy]; });
function blob(ctx, cx, cy, cz, rx, ry, rz, n = 8, m = 5) {
  const P = (i, j) => { const u = i / n * TAU, v = j / m * Math.PI - Math.PI / 2; return [cx + Math.cos(v) * Math.cos(u) * rx, cy + Math.sin(v) * ry, cz + Math.cos(v) * Math.sin(u) * rz]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) ctx.quad(...P(i, j), ...P(i + 1, j), ...P(i + 1, j + 1), ...P(i, j + 1));
}
function cone(ctx, cx, cy, cz, r, h, n) { const b = ring(cx, cy, cz, r, n); for (let i = 0; i < n; i++) ctx.tri(...b[i], ...b[(i + 1) % n], cx, cy + h, cz); }
const K = {
  nest(ctx, lod) {
    ctx.albedo('cdn/texture-woven-dry-twigs-bird-nest.png'); ctx.color('oklch(0.92 0.03 70)');
    solid(ctx, ring(0, 0, 0, 0.16, 9), ring(0, 0.1, 0, 0.24, 9), false); solid(ctx, ring(0, 0.1, 0, 0.24, 9), ring(0, 0.13, 0, 0.18, 9), false);
    ctx.albedo(null); ctx.color('oklch(0.45 0.05 70)'); solid(ctx, ring(0, 0.01, 0, 0.16, 9), ring(0, 0.05, 0, 0.17, 9));
    ctx.smooth(); ctx.color('oklch(0.86 0.15 85)'); ctx.metalness(0.8); ctx.roughness(0.25); ctx.emissive('oklch(0.45 0.12 85)');
    blob(ctx, 0, 0.12, 0, 0.065, 0.085, 0.065, lod <= 2 ? 10 : 6, lod <= 2 ? 6 : 4); ctx.emissive(null); ctx.metalness(0);
  },
  gnome(ctx, lod) {
    ctx.smooth(); const n = lod <= 2 ? 10 : 6, m = lod <= 2 ? 6 : 4;
    ctx.color('oklch(0.35 0.05 60)'); blob(ctx, -0.05, 0.03, 0, 0.045, 0.03, 0.07, n, m); blob(ctx, 0.05, 0.03, 0, 0.045, 0.03, 0.07, n, m);
    ctx.color('oklch(0.5 0.12 250)'); blob(ctx, 0, 0.14, 0, 0.1, 0.1, 0.09, n, m);
    ctx.color('oklch(0.55 0.13 140)'); blob(ctx, 0, 0.23, 0, 0.095, 0.08, 0.085, n, m);
    ctx.color('oklch(0.97 0.01 90)'); blob(ctx, 0, 0.28, -0.05, 0.075, 0.07, 0.05, n, m);
    ctx.color('oklch(0.82 0.06 50)'); blob(ctx, 0, 0.34, 0, 0.065, 0.06, 0.06, n, m); blob(ctx, 0, 0.33, -0.06, 0.022, 0.022, 0.022, 6, 4);
    ctx.flat(); ctx.color('oklch(0.55 0.2 27)'); cone(ctx, 0, 0.37, 0.01, 0.075, 0.2, n);
  },
  fairydoor(ctx, lod) {
    const n = lod <= 2 ? 11 : 6;
    ctx.albedo('cdn/texture-mossy-oak-bark.png'); ctx.color('oklch(0.92 0.03 90)');
    solid(ctx, ring(0, -0.2, 0, 0.55, n, 0.3), ring(0, 0.62, 0, 0.45, n, 0.3));
    ctx.albedo('cdn/texture-tree-stump-rings-cut-wood.png'); ctx.color('oklch(0.93 0.03 70)'); solid(ctx, ring(0, 0.62, 0, 0.45, n, 0.3), ring(0, 0.64, 0, 0.43, n, 0.3));
    ctx.albedo(null);
    // the door: a tiny painted arch in the -Z face, a brass knob, a window glowing warm
    const z = -0.5; ctx.color('oklch(0.5 0.14 25)'); box(ctx, -0.1, 0, z - 0.03, 0.1, 0.22, z + 0.02);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI, b = (i + 1) / 6 * Math.PI; ctx.tri(0, 0.22, z - 0.03, Math.cos(a) * 0.1, 0.22 + Math.sin(a) * 0.1, z - 0.03, Math.cos(b) * 0.1, 0.22 + Math.sin(b) * 0.1, z - 0.03); }
    ctx.color('oklch(0.8 0.13 85)'); ctx.metalness(0.9); box(ctx, 0.05, 0.12, z - 0.05, 0.07, 0.14, z - 0.03); ctx.metalness(0);
    ctx.emissive('oklch(0.85 0.16 75)'); ctx.color('oklch(0.9 0.12 80)'); box(ctx, 0.2, 0.26, z + 0.03, 0.29, 0.35, z + 0.07); ctx.emissive(null);
    ctx.color('oklch(0.65 0.04 70)'); for (let i = 0; i < 3; i++) box(ctx, -0.06 + i * 0.01, 0, z - 0.1 - i * 0.07, 0.06 + i * 0.01, 0.015, z - 0.05 - i * 0.07);
    if (lod <= 2) for (let i = 0; i < 5; i++) { const a = -2 + i * 0.3; ctx.color('oklch(0.68 0.16 30)'); blob(ctx, Math.cos(a) * 0.6, 0.05, Math.sin(a) * 0.6, 0.05, 0.03, 0.05, 6, 3); ctx.color('oklch(0.92 0.02 90)'); box(ctx, Math.cos(a) * 0.6 - 0.01, 0, Math.sin(a) * 0.6 - 0.01, Math.cos(a) * 0.6 + 0.01, 0.04, Math.sin(a) * 0.6 + 0.01); }
  },
  frog(ctx, lod) {
    ctx.smooth(); ctx.albedo('cdn/texture-mossy-grey-granite-stone.png'); ctx.color('oklch(0.93 0.02 140)');
    const n = lod <= 2 ? 10 : 6, m = lod <= 2 ? 6 : 4;
    blob(ctx, 0, 0.13, 0, 0.2, 0.13, 0.24, n, m); blob(ctx, 0, 0.24, -0.14, 0.14, 0.09, 0.11, n, m);
    for (const s of [-1, 1]) { blob(ctx, s * 0.16, 0.06, 0.08, 0.08, 0.06, 0.12, n, m); blob(ctx, s * 0.08, 0.31, -0.18, 0.045, 0.045, 0.045, 6, 4); }
    ctx.albedo(null); ctx.color('oklch(0.2 0.02 90)'); for (const s of [-1, 1]) blob(ctx, s * 0.09, 0.32, -0.215, 0.02, 0.02, 0.012, 6, 3);
  },
  bottle(ctx, lod) {
    ctx.smooth(); const n = lod <= 2 ? 12 : 6;
    ctx.color('oklch(0.6 0.12 160)', 0.75); ctx.roughness(0.1);
    const R = (x, r) => Array.from({ length: n }, (_, i) => { const t = i / n * TAU; return [x, 0.07 + Math.cos(t) * r, Math.sin(t) * r]; });
    solid(ctx, R(-0.14, 0.065), R(0.08, 0.065)); solid(ctx, R(0.08, 0.065), R(0.14, 0.022), false); solid(ctx, R(0.14, 0.022), R(0.2, 0.022), false);
    ctx.color('oklch(0.93 0.04 85)'); ctx.roughness(0.9); solid(ctx, R(-0.1, 0.045).map(([x, y, z]) => [x, y, z]), R(0.05, 0.045));
    ctx.color('oklch(0.6 0.08 60)'); solid(ctx, R(0.19, 0.02), R(0.24, 0.024));
  },
  mushrooms(ctx, lod) {
    const n = lod <= 2 ? 9 : 5, count = lod <= 3 ? 11 : 6;
    for (let i = 0; i < count; i++) {
      const a = i / count * TAU + ctx.random() * 0.2, r = 0.8 + ctx.random() * 0.08, x = Math.cos(a) * r, z = Math.sin(a) * r, h = 0.12 + ctx.random() * 0.14, cr = 0.06 + ctx.random() * 0.06;
      ctx.color('oklch(0.93 0.02 90)'); solid(ctx, ring(x, 0, z, 0.02 + cr * 0.2, n), ring(x, h, z, cr * 0.18, n));
      ctx.color('oklch(0.58 0.2 28)'); ctx.emissive(lod <= 2 ? 'oklch(0.25 0.1 28)' : null); solid(ctx, ring(x, h - 0.01, z, cr, n), ring(x, h + cr * 0.55, z, cr * 0.25, n)); ctx.emissive(null);
      if (lod <= 2) { ctx.color('oklch(0.97 0.01 90)'); for (let k = 0; k < 3; k++) { const q = ctx.random() * TAU; box(ctx, x + Math.cos(q) * cr * 0.55 - 0.008, h + cr * 0.3, z + Math.sin(q) * cr * 0.55 - 0.008, x + Math.cos(q) * cr * 0.55 + 0.008, h + cr * 0.34, z + Math.sin(q) * cr * 0.55 + 0.008); } }
    }
  },
};
export function geometry(ctx) { ctx.flat(); ctx.roughness(0.85); (K[ctx.params.kind] ?? K.nest)(ctx, ctx.lod ?? 1); }
export function collider() { return null; }
