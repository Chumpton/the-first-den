// Homestead kit (coop, hives, rain catchment): beams, pipes, turned staves and wire mesh on top of road-solid's winding.
import { solid, Q, T } from '../lib/road-solid.js';
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function frame(d) { const ref = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : [0, 1, 0]; const u = nrm(cr(d, ref)); return [u, cr(u, d)]; }
// square-section beam from a to b (centreline), w across (horizontal side), h the other way
export function bar(ctx, a, b, w, h = w) {
  const [u, v] = frame(nrm(sub(b, a)));
  const L = (p) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [p[0] + u[0] * i * w / 2 + v[0] * j * h / 2, p[1] + u[1] * i * w / 2 + v[1] * j * h / 2, p[2] + u[2] * i * w / 2 + v[2] * j * h / 2]);
  solid(ctx, L(a), L(b));
}
// round pipe a -> b
export function pipe(ctx, a, b, r, n = 8) {
  const [u, v] = frame(nrm(sub(b, a)));
  const L = (p) => { const o = []; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, c = Math.cos(t) * r, s = Math.sin(t) * r; o.push([p[0] + u[0] * c + v[0] * s, p[1] + u[1] * c + v[1] * s, p[2] + u[2] * c + v[2] * s]); } return o; };
  solid(ctx, L(a), L(b));
}
export function ring(cx, y, cz, r, n, rot = 0) { const o = []; for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2; o.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); } return o; }
export function cyl(ctx, cx, y0, cz, r, h, n = 12, r2 = r) { solid(ctx, ring(cx, y0, cz, r, n), ring(cx, y0 + h, cz, r2, n)); }
// turned body from a profile [[r, y], …] bottom to top; staveColor(i) paints column i (barrel staves)
export function lathe(ctx, cx, cz, prof, n, staveColor) {
  const R = prof.map(([r, y]) => ring(cx, y, cz, r, n));
  for (let i = 0; i < n; i++) {
    if (staveColor) staveColor(i);
    const j = (i + 1) % n;
    for (let k = 0; k < R.length - 1; k++) Q(ctx, R[k][i], R[k][j], R[k + 1][j], R[k + 1][i], [cx, (prof[k][1] + prof[k + 1][1]) / 2, cz]);
  }
  const y0 = prof[0][1], y1 = prof[prof.length - 1][1], b = R[0], t = R[R.length - 1];
  for (let i = 1; i < n - 1; i++) { T(ctx, b[0], b[i], b[i + 1], [cx, y0 + 1, cz]); T(ctx, t[0], t[i], t[i + 1], [cx, y1 - 1, cz]); }
}
// diamond wire mesh across the vertical panel a=[x,z] -> b=[x,z], y0..y1; strips w wide, `step` apart
export function wires(ctx, a, b, y0, y1, step, w) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), tx = dx / L, tz = dz / L, H = y1 - y0;
  const P = (s, y) => [a[0] + tx * s, y, a[1] + tz * s];
  const strip = (s0, ya, s1, yb) => ctx.quad(...P(s0 - w / 2, ya), ...P(s0 + w / 2, ya), ...P(s1 + w / 2, yb), ...P(s1 - w / 2, yb));
  for (let c = -H; c < L; c += step) {
    let ya = Math.max(0, -c), yb = Math.min(H, L - c); if (yb > ya) strip(c + ya, y0 + ya, c + yb, y0 + yb);
  }
  for (let c = step / 2; c < L + H; c += step) {
    let ya = Math.max(0, c - L), yb = Math.min(H, c); if (yb > ya) strip(c - ya, y0 + ya, c - yb, y0 + yb);
  }
  for (const y of [y0 + 0.01, y1 - 0.01]) ctx.quad(...P(0, y - w), ...P(L, y - w), ...P(L, y + w), ...P(0, y + w));
}
export function paint(ctx, tex, col, rough = 0.85, metal = 0) { ctx.albedo(tex || null); ctx.color(col); ctx.roughness(rough); ctx.metalness(metal); }
export const TX = {
  sage: 'cdn/texture-sage-green-painted-wood-boards.png',
  timber: 'cdn/texture-weathered-oak-timber-grain.png',
  oak: 'cdn/texture-honey-oak-floor-planks.png',
  shingle: 'cdn/texture-weathered-cedar-roof-shingles.png',
  straw: 'cdn/texture-scattered-straw-on-packed-earth.png',
  stone: 'scripts/tex-garden-limestone.js',
};
export const INK = { linen: 'oklch(0.95 0.02 85)', wood: 'oklch(0.93 0.02 70)', oak: 'oklch(0.95 0.03 80)', white: 'oklch(0.96 0.012 90)', honey: 'oklch(0.8 0.12 75)',
  galv: 'oklch(0.78 0.01 240)', iron: 'oklch(0.3 0.01 60)', copper: 'oklch(0.64 0.12 48)', brass: 'oklch(0.78 0.12 85)', dark: 'oklch(0.2 0.02 60)', soil: 'oklch(0.36 0.05 55)' };
