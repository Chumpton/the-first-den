// A plank-and-rope bridge from its feet (local z=0) to local z=params.length, sagging params.sag at the middle;
// rope handrails on posts at both ends. params.rope = true draws a hanging climbing rope instead (length = drop).
import { solid, prism, box, ngon, gem } from "../lib/road-solid.js";
const OAK = "cdn/texture-weathered-honey-oak-deck-planks.png";
const ropeMat = (c) => { c.albedo(null); c.color("oklch(0.72 0.06 75)"); c.roughness(1); c.emissive(null); };
function strand(c, pts, r) { for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1];
  solid(c, ngon(4, r, a[0], a[2]).map(([x, z]) => [x, a[1], z]), ngon(4, r, b[0], b[2]).map(([x, z]) => [x, b[1], z])); } }
let RISE = 0; // params.rise: the far end sits this much higher than the near one
const y = (t, sag) => -sag * 4 * t * (1 - t) + RISE * t;
export function geometry(c) {
  c.flat(); RISE = c.params.rise ?? 0;
  if (c.params.rope) { const L = c.params.length ?? 7; ropeMat(c);
    prism(c, ngon(6, 0.05), -L, 0.2);
    for (let k = 1; k * 0.55 < L - 0.3; k++) prism(c, ngon(6, 0.09), -k * 0.55 - 0.08, -k * 0.55 + 0.08, 0.7);
    c.albedo(OAK); c.color("oklch(0.7 0.05 60)"); box(c, -0.5, 0.15, -0.12, 0.5, 0.3, 0.12); return; }
  const L = c.params.length ?? 10, sag = c.params.sag ?? 0.6, W = 0.75, n = Math.max(6, Math.round(L / 0.42));
  c.albedo(OAK); c.roughness(0.85);
  for (let i = 0; i < n; i++) { const t0 = (i + 0.1) / n, t1 = (i + 0.9) / n, tm = (t0 + t1) / 2;
    c.color(`oklch(${0.78 + ((i * 37) % 7) * 0.02} 0.05 70)`);
    const y0 = y(t0, sag), y1 = y(t1, sag), wob = ((i * 53) % 5 - 2) * 0.02;
    solid(c, [[-W + wob, y0 - 0.07, t0 * L], [W + wob, y0 - 0.07, t0 * L], [W + wob, y1 - 0.07, t1 * L], [-W + wob, y1 - 0.07, t1 * L]],
      [[-W + wob, y0, t0 * L], [W + wob, y0, t0 * L], [W + wob, y1, t1 * L], [-W + wob, y1, t1 * L]]); }
  // posts at both ends
  c.color("oklch(0.65 0.05 60)"); for (const z of [0.15, L - 0.15]) for (const s of [-1, 1]) prism(c, ngon(4, 0.08, s * (W + 0.05), z), -0.2, 1.15);
  ropeMat(c); const seg = 12;
  for (const s of [-1, 1]) { const rail = [], low = [];
    for (let k = 0; k <= seg; k++) { const t = k / seg; rail.push([s * (W + 0.05), 1.05 + y(t, sag * 0.7), t * L]); low.push([s * (W + 0.05), y(t, sag), t * L]); }
    strand(c, rail, 0.035); strand(c, low, 0.03);
    if (c.lod <= 3) for (let k = 1; k < seg; k++) strand(c, [low[k], rail[k]], 0.02); }
}
export function collider(c) {
  if (c.params.rope) return null; RISE = c.params.rise ?? 0;
  const L = c.params.length ?? 10, sag = c.params.sag ?? 0.6, W = 0.8, n = 10;
  for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, y0 = y(t0, sag), y1 = y(t1, sag);
    solid(c, [[-W, y0 - 0.2, t0 * L], [W, y0 - 0.2, t0 * L], [W, y1 - 0.2, t1 * L], [-W, y1 - 0.2, t1 * L]], [[-W, y0, t0 * L], [W, y0, t0 * L], [W, y1, t1 * L], [-W, y1, t1 * L]]);
    for (const s of [-1, 1]) solid(c, [[s * W - 0.05, y0, t0 * L], [s * W + 0.05, y0, t0 * L], [s * W + 0.05, y1, t1 * L], [s * W - 0.05, y1, t1 * L]], [[s * W - 0.05, y0 + 1.05, t0 * L], [s * W + 0.05, y0 + 1.05, t0 * L], [s * W + 0.05, y1 + 1.05, t1 * L], [s * W - 0.05, y1 + 1.05, t1 * L]]); }
}
