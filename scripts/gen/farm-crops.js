// Farm crop stripe: planted rows of real low plants + a tilled furrow strip, one stripe per row.
// params: crop (wheat|cabbage|lavender), w (planted depth), strip (tilled depth), x0a/x0b (west edge at local z 0 / z W), x1a/x1b (east edge).
import { blob, leaf, TAU } from '../lib/yard-kit.js';
import { solid, prism, gem } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const SOIL = 'cdn/texture-dark-garden-soil-with-mulch.png';
const CROPS = {
  wheat: { gap: 0.5, step: 0.38, h: 0.95, body: ['oklch(0.84 0.13 86)', 'oklch(0.78 0.14 76)', 'oklch(0.89 0.11 95)'], top: 'oklch(0.9 0.14 84)' },
  cabbage: { gap: 0.72, step: 0.6, h: 0.36, body: ['oklch(0.72 0.08 172)', 'oklch(0.66 0.09 162)', 'oklch(0.78 0.07 152)'], top: 'oklch(0.6 0.09 165)' },
  lavender: { gap: 0.82, step: 0.7, h: 0.62, body: ['oklch(0.62 0.05 145)', 'oklch(0.57 0.05 150)', 'oklch(0.67 0.04 135)'], top: 'oklch(0.6 0.16 300)' },
};
function paint(ctx, tex, col, r = 0.9) { ctx.albedo(tex); ctx.color(col); ctx.roughness(r); ctx.metalness(0); ctx.emissive(null); }
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, crop = CROPS[p.crop] ? p.crop : 'wheat', C = CROPS[crop], R = () => ctx.random();
  const w = p.w ?? 2.6, strip = p.strip ?? 0.9, W = w + strip;
  const xa = (z) => p.x0a + (p.x0b - p.x0a) * z / W, xb = (z) => p.x1a + (p.x1b - p.x1a) * z / W;
  ctx.flat();
  paint(ctx, SOIL, 'oklch(0.93 0.03 60)', 0.95);
  prism(ctx, [[xa(0), 0], [xb(0), 0], [xb(W), W], [xa(W), W]], -0.4, 0.04);
  const n = Math.max(1, Math.round(w / C.gap)), rows = [];
  for (let i = 0; i < n; i++) { const z = (i + 0.5) * w / n, x0 = xa(z) + 0.3, x1 = xb(z) - 0.3; if (x1 - x0 > 1) rows.push({ z, x0, x1 }); }
  if (lod >= 4) { paint(ctx, null, C.body[0]); prism(ctx, [[xa(0.1) + 0.3, 0.1], [xb(0.1) - 0.3, 0.1], [xb(w - 0.1) - 0.3, w - 0.1], [xa(w - 0.1) + 0.3, w - 0.1]], 0.03, C.h * 0.75); return; }
  // ridges (hilled rows) and furrows in the tilled strip
  const sec = (x, z, hw, tw, y0, y1) => [[x, y0, z - hw], [x, y0, z + hw], [x, y1, z + tw], [x, y1, z - tw]];
  for (const r of rows) solid(ctx, sec(r.x0 - 0.1, r.z, 0.24, 0.13, 0.02, 0.13), sec(r.x1 + 0.1, r.z, 0.24, 0.13, 0.02, 0.13));
  if (lod <= 2) { paint(ctx, SOIL, 'oklch(0.86 0.04 55)', 0.97); for (const f of [0.3, 0.7]) { const z = w + strip * f; solid(ctx, sec(xa(z) + 0.2, z, 0.14, 0.06, 0.02, 0.1), sec(xb(z) - 0.2, z, 0.14, 0.06, 0.02, 0.1)); } }
  if (lod === 3) {
    for (const r of rows) {
      paint(ctx, null, C.body[0]);
      if (crop === 'wheat') solid(ctx, sec(r.x0, r.z, 0.12, 0.23, 0.05, C.h * 0.9), sec(r.x1, r.z, 0.12, 0.23, 0.05, C.h * 0.9));
      else solid(ctx, sec(r.x0, r.z, 0.24, 0.16, 0.05, C.h * 0.8), sec(r.x1, r.z, 0.24, 0.16, 0.05, C.h * 0.8));
      if (crop === 'lavender') { paint(ctx, null, C.top); solid(ctx, sec(r.x0, r.z, 0.2, 0.1, C.h * 0.8, C.h), sec(r.x1, r.z, 0.2, 0.1, C.h * 0.8, C.h)); }
    }
    return;
  }
  const step = C.step * (lod === 2 ? 1.7 : 1), plants = [];
  for (const r of rows) for (let x = r.x0 + step / 2; x < r.x1; x += step) plants.push({ x: x + (R() - 0.5) * step * 0.4, z: r.z + (R() - 0.5) * 0.1, v: Math.floor(R() * 3), s: 0.82 + R() * 0.36, a: R() * TAU });
  for (let v = 0; v < 3; v++) {
    paint(ctx, null, C.body[v], 0.85);
    for (const q of plants) if (q.v === v) {
      const { x, z, s, a } = q;
      if (crop === 'wheat') {
        const h = C.h * s, sq = (r, y) => [0, 1, 2, 3].map((k) => [x + Math.cos(a + k * TAU / 4) * r, y, z + Math.sin(a + k * TAU / 4) * r]);
        const top = sq(0.17 * s, h * 0.72), tip = [x + (R() - 0.5) * 0.08, h, z + (R() - 0.5) * 0.08];
        solid(ctx, sq(0.06, 0.04), top, false);
        for (let k = 0; k < 4; k++) { const A = top[k], B = top[(k + 1) % 4]; ctx.tri(...A, ...B, ...tip); }
      } else if (crop === 'cabbage') blob(ctx, x, 0.08, z, 0.2 * s, 0.22 * s, 0.2 * s, 5, R);
      else blob(ctx, x, 0.03, z, 0.3 * s, 0.34 * s, 0.3 * s, 5, R);
    }
  }
  if (crop === 'wheat') return;
  paint(ctx, null, C.top, 0.8);
  for (const q of plants) {
    const { x, z, s, a } = q;
    if (crop === 'cabbage') {
      if (lod > 1) continue;
      for (let k = 0; k < 4; k++) { const b = a + k * TAU / 4, c = Math.cos(b), sn = Math.sin(b); leaf(ctx, [x + c * 0.09 * s, 0.1, z + sn * 0.09 * s], [c * 0.94, 0.34, sn * 0.94], [-sn, 0, c], 0.36 * s, 0.15 * s); }
    } else if (lod === 1) {
      for (let k = 0; k < 7; k++) { const b = a + k * TAU / 7, rr = k === 6 ? 0 : 0.18 * s; gem(ctx, x + Math.cos(b) * rr, 0.3 * s + (k === 6 ? 0.08 : 0), z + Math.sin(b) * rr, 0.04, 0.17, 0.08, 3); }
    } else blob(ctx, x, 0.26 * s, z, 0.24 * s, 0.14, 0.24 * s, 5, R);
  }
});
export function collider() { return null; }
