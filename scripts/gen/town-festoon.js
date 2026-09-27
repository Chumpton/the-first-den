// Festoon lights over the market square: one merged row. Feet at world y 0 (every y here is world height),
// x/z local to the row. params.lines [{ a:[x,y,z], b:[x,y,z], kind: bulbs|flags|glow, sag?, lanterns?:[t…] }]
//   bulbs = wire + warm bulbs; flags = wire + mixed pennants; glow = bulbs only, hung between the flags of an
//   existing pennant string (its wire and flags belong to town-square), matching its sag and flag spacing.
import { TAU, paint, beam, lathe, gem } from '../lib/yard-kit.js';
const BUNT = ['oklch(0.62 0.13 40)', 'oklch(0.62 0.08 195)', 'oklch(0.95 0.03 88)', 'oklch(0.7 0.08 130)', 'oklch(0.8 0.12 85)', 'oklch(0.66 0.11 10)'];
const LANT = [
  { col: 'oklch(0.6 0.19 28)', glow: [1.6, 0.28, 0.16] },
  { col: 'oklch(0.8 0.15 75)', glow: [1.7, 0.95, 0.25] },
  { col: 'oklch(0.66 0.1 190)', glow: [0.25, 1.05, 1.0] },
];
const WIRE = 'oklch(0.3 0.02 60)';
function curve(l) {
  const [a, b] = [l.a, l.b], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const sag = l.sag ?? Math.min(1.4, L * 0.042);
  return { L, at: (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t] };
}
function bulb(ctx, p, lod) {
  paint(ctx, null, 'oklch(0.28 0.02 60)', 0.6, 0.5);
  if (lod <= 2) beam(ctx, [p[0], p[1], p[2]], [p[0], p[1] - 0.07, p[2]], 0.03, 0.03);
  paint(ctx, null, 'oklch(0.97 0.06 85)', 0.3); ctx.emissive(3.4, 2.1, 0.85);
  gem(ctx, p[0], p[1] - 0.13, p[2], 0.055, 0.06, 0.07, lod <= 2 ? 6 : 4);
}
function lantern(ctx, p, k, lod) {
  const c = LANT[k % LANT.length], n = lod <= 2 ? 10 : 6, y = p[1] - 0.32, cx = p[0], cz = p[2];
  paint(ctx, null, WIRE, 0.9); beam(ctx, p, [cx, y + 0.44, cz], 0.02, 0.02);
  paint(ctx, null, 'oklch(0.25 0.02 50)', 0.7, 0.3);
  lathe(ctx, [[0.02, y + 0.4], [0.09, y + 0.4], [0.09, y + 0.46], [0, y + 0.46]], n, cx, cz);
  lathe(ctx, [[0, y - 0.04], [0.09, y - 0.04], [0.09, y + 0.01], [0.02, y + 0.01]], n, cx, cz);
  paint(ctx, null, c.col, 0.95); ctx.emissive(...c.glow);
  const prof = [[0.08, y], [0.17, y + 0.05], [0.22, y + 0.14], [0.235, y + 0.21], [0.22, y + 0.28], [0.17, y + 0.36], [0.08, y + 0.41]];
  lathe(ctx, prof, n, cx, cz);
  if (lod <= 2) { // ribs and a tassel
    paint(ctx, null, 'oklch(0.3 0.05 40)', 0.8);
    for (const [r, h] of [[0.228, 0.12], [0.237, 0.21], [0.226, 0.3]]) lathe(ctx, [[r, y + h - 0.006], [r + 0.006, y + h], [r, y + h + 0.006]], n, cx, cz);
    paint(ctx, null, c.col, 0.9); beam(ctx, [cx, y - 0.04, cz], [cx, y - 0.2, cz], 0.035, 0.035);
  }
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, lines = ctx.params.lines || [];
  let lk = 0;
  lines.forEach((l, li) => {
    const { L, at } = curve(l), kind = l.kind || 'bulbs';
    if (kind !== 'glow') {
      const n = Math.max(4, Math.round(L / (lod <= 2 ? 1.2 : 3)));
      paint(ctx, null, WIRE, 0.9);
      for (let i = 0; i < n; i++) beam(ctx, at(i / n), at((i + 1) / n), 0.028, 0.028);
    }
    if (kind === 'bulbs' && lod <= 3) {
      const m = Math.floor(L / (lod <= 2 ? 0.62 : 1.24));
      for (let i = 1; i < m; i++) bulb(ctx, at(i / m), lod);
    }
    if (kind === 'glow' && lod <= 3) { // between the square's flags: its flags sit at (i+.5)/m
      const m = Math.floor(L / 0.75), step = lod <= 2 ? 1 : 2;
      for (let i = 1; i < m; i += step) bulb(ctx, at(i / m), lod);
    }
    if (kind === 'flags' && lod <= 3) {
      const m = Math.floor(L / (lod <= 2 ? 0.72 : 1.44)), d = [(l.b[0] - l.a[0]) / L, (l.b[2] - l.a[2]) / L];
      const hz = Math.hypot(d[0], d[1]) || 1, dx = d[0] / hz, dz = d[1] / hz;
      for (let c = 0; c < BUNT.length; c++) {
        paint(ctx, null, BUNT[(c + li) % BUNT.length], 0.95);
        for (let i = c; i < m; i += BUNT.length) {
          const p = at((i + 0.5) / m), w = 0.21, q0 = at((i + 0.5) / m - 0.21 / L), q1 = at((i + 0.5) / m + 0.21 / L);
          ctx.tri(p[0] - dx * w, q0[1], p[2] - dz * w, p[0] + dx * w, q1[1], p[2] + dz * w, p[0], p[1] - 0.42, p[2]);
        }
      }
      for (let i = 1; i < m; i += lod <= 2 ? 1 : 2) bulb(ctx, at(i / m), lod); // warm bulbs hung between the pennants
    }
    for (const t of l.lanterns || []) lantern(ctx, at(t), lk++, lod);
  });
}
export function collider() { return null; }
