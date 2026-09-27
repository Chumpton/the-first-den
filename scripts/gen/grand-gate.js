// The grand gate off the main road. params.kind "frame": two limestone piers with lantern caps, a wrought-iron arch with
// the house name, low limestone wing walls ending in small piers. Opening params.w wide along local X, centred; local -Z faces the road.
// params.kind "leaf": one wrought-iron door, hinge at the origin, running params.w along local X * params.dir.
import { paint, obox, beam, TAU } from '../lib/yard-kit.js';
import { box, prism, ngon, gem } from '../lib/road-solid.js';
const LIME = () => 'oklch(0.9 0.025 85)', IRON = 'oklch(0.3 0.015 60)';
function pier(ctx, x, s, h, lod, rnd) {
  paint(ctx, 'stone', 'oklch(0.86 0.025 80)', 0.9); obox(ctx, x, 0, 0, s + 0.16, 0.35, s + 0.16);           // plinth
  const rows = lod <= 2 ? Math.round(h / 0.42) : 1, rh = (h - 0.35) / rows;
  for (let i = 0; i < rows; i++) { paint(ctx, 'stone', `oklch(${(0.87 + rnd() * 0.07).toFixed(3)} 0.025 ${(75 + rnd() * 18).toFixed(0)})`, 0.9); obox(ctx, x, 0.35 + i * rh, 0, s - (i % 2) * 0.02, rh - 0.02, s - ((i + 1) % 2) * 0.02); }
  paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.85); obox(ctx, x, h, 0, s + 0.2, 0.14, s + 0.2); prism(ctx, ngon(4, (s + 0.1) * 0.7, x, 0, TAU / 8), h + 0.14, h + 0.5, 0.35);
}
function lantern(ctx, x, y, lod) {
  paint(ctx, null, IRON, 0.5, 0.6); obox(ctx, x, y, 0, 0.3, 0.05, 0.3); for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, x + a * 0.12, y, b * 0.12, 0.035, 0.45, 0.035);
  prism(ctx, ngon(4, 0.24, x, 0, TAU / 8), y + 0.45, y + 0.62, 0.15);
  ctx.albedo(null); ctx.color('oklch(0.92 0.13 80)'); ctx.emissive('oklch(0.85 0.15 70)'); ctx.roughness(0.4); obox(ctx, x, y + 0.06, 0, 0.19, 0.36, 0.19); ctx.emissive(null);
}
function frame(ctx, p, lod) {
  const w = p.w ?? 4.4, hw = w / 2, s = 0.95, H = 3.5, wing = p.wing ?? 8, rnd = () => ctx.random();
  for (const sx of [-1, 1]) {
    const px = sx * (hw + s / 2); pier(ctx, px, s, H, lod, rnd); lantern(ctx, px, H + 0.14 + 0.36 - 0.36 + 0.36, lod);
    // wing wall with a coped top, stepping down to a small end pier
    const x0 = sx * (hw + s), x1 = sx * (hw + s + wing), n = lod <= 2 ? Math.ceil(wing / 0.55) : 1, L = (x1 - x0) / n;
    for (let i = 0; i < n; i++) { const hh = 1.05 - 0.15 * (i / n); paint(ctx, 'stone', `oklch(${(0.86 + rnd() * 0.08).toFixed(3)} 0.025 ${(75 + rnd() * 18).toFixed(0)})`, 0.9); obox(ctx, x0 + L * (i + 0.5), 0, 0, Math.abs(L) - 0.02, hh, 0.5); }
    paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.85); obox(ctx, (x0 + x1) / 2, 1.0, 0, Math.abs(x1 - x0), 0.1, 0.62);
    pier(ctx, x1 + sx * 0.3, 0.6, 1.5, lod, rnd);
    if (lod <= 2) { paint(ctx, 'leaf', 'oklch(0.8 0.1 140)', 0.85); for (let i = 0; i < 5; i++) { const t = (i + 0.5) / 5, x = x0 + (x1 - x0) * t; obox(ctx, x, 0, -0.34 - rnd() * 0.05, 0.9 + rnd() * 0.5, 0.35 + rnd() * 0.25, 0.3); } }
  }
  // wrought-iron arch: a flat band springing from the pier tops, rising to a crown, with the name plate at the top
  paint(ctx, null, IRON, 0.5, 0.6);
  const seg = lod <= 2 ? 16 : 6, R = hw + s / 2, y0 = H + 0.2, rise = 1.4, P = (t) => [Math.cos(Math.PI * t) * R, y0 + Math.sin(Math.PI * t) * rise];
  for (let i = 0; i < seg; i++) { const [ax, ay] = P(i / seg), [bx, by] = P((i + 1) / seg); beam(ctx, [ax, ay, 0], [bx, by, 0], 0.09, 0.12); beam(ctx, [ax * 0.9, ay - 0.35, 0], [bx * 0.9, by - 0.35, 0], 0.06, 0.06); }
  if (lod <= 2) for (let i = 1; i < 10; i++) { const [ax, ay] = P(i / 10); beam(ctx, [ax * 0.9, ay - 0.35, 0], [ax, ay, 0], 0.035, 0.035); }
  paint(ctx, 'walnut', 'oklch(0.72 0.06 60)', 0.8); obox(ctx, 0, y0 + rise - 0.72, 0, 2.6, 0.5, 0.08);
  paint(ctx, null, IRON, 0.5, 0.6); gemTop(ctx, 0, y0 + rise + 0.05);
}
function gemTop(ctx, x, y) { prism(ctx, ngon(4, 0.12, x, 0, TAU / 8), y, y + 0.35, 0.05); }
function leaf(ctx, p, lod) { // wrought iron: stiles, three rails, spear-topped pickets rising to the meeting stile, a scroll band, gilt tips
  const w = p.w ?? 2.2, d = p.dir ?? 1, h = p.h ?? 2.7, X = (a) => a * d;
  const top = (t) => h - 0.3 + Math.sin(t * Math.PI / 2) * 0.45;
  const IR = 'oklch(0.26 0.012 250)', GILT = 'oklch(0.78 0.12 85)';
  paint(ctx, null, IR, 0.38, 0.85);
  obox(ctx, X(0.05), 0.04, 0, 0.1, top(0) + 0.1, 0.1);                       // hinge stile
  obox(ctx, X(w - 0.05), 0.04, 0, 0.1, top(1) + 0.1, 0.1);                   // meeting stile
  for (const y of [0.18, 1.05, 1.42]) obox(ctx, X(w / 2), y, 0, w - 0.1, 0.07, 0.08);
  const seg = lod <= 2 ? 10 : 4;                                              // arched top rail following the picket line
  for (let i = 0; i < seg; i++) { const t0 = i / seg, t1 = (i + 1) / seg; beam(ctx, [X(0.05 + t0 * (w - 0.1)), top(t0), 0], [X(0.05 + t1 * (w - 0.1)), top(t1), 0], 0.08, 0.07); }
  for (const hy of [0.45, top(0) - 0.35]) { obox(ctx, X(-0.02), hy - 0.08, 0, 0.14, 0.16, 0.14); }       // hinge knuckles
  const n = lod <= 2 ? Math.round((w - 0.1) / 0.13) : 6, step = (w - 0.1) / n;
  for (let i = 1; i < n; i++) {
    const x = 0.05 + i * step, t = (x - 0.05) / (w - 0.1), yt = top(t);
    paint(ctx, null, IR, 0.38, 0.85); obox(ctx, X(x), 0.18, 0, 0.032, yt + 0.12 - 0.18, 0.032);
    if (lod <= 2) { paint(ctx, null, GILT, 0.3, 0.9); gem(ctx, X(x), yt + 0.12, 0, 0.045, 0.16, 0.05, 4); }
    if (lod <= 2 && i % 2) { paint(ctx, null, IR, 0.38, 0.85); obox(ctx, X(x + step / 2), 0.04, 0, 0.022, 0.14, 0.022); } // dog bars
  }
  if (lod <= 2) { // scroll band between the middle rails: C-scrolls, back to back
    paint(ctx, null, IR, 0.38, 0.85);
    const k = Math.max(3, Math.round((w - 0.1) / 0.36)), cw = (w - 0.1) / k, r = 0.13;
    for (let j = 0; j < k; j++) { const cx = 0.05 + cw * (j + 0.5), cy = 1.235; let prev = null;
      for (let q = 0; q <= 10; q++) { const a = q / 10 * Math.PI * 2, pt = [X(cx + Math.cos(a) * r * 0.95), cy + Math.sin(a) * r * 0.95, 0.045]; if (prev) beam(ctx, prev, pt, 0.022, 0.03); prev = pt; } }
    paint(ctx, null, GILT, 0.3, 0.9); gem(ctx, X(w - 0.05), top(1) + 0.14, 0, 0.08, 0.26, 0.08, 4);                // crown finial on the meeting stile
    obox(ctx, X(w - 0.2), 1.0, -0.07, 0.06, 0.3, 0.05); obox(ctx, X(w - 0.2), 1.0, 0.07, 0.06, 0.3, 0.05);          // pull rings, both faces
  }
}
export function geometry(ctx) { const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat(); if (p.kind === 'leaf') leaf(ctx, p, lod); else frame(ctx, p, lod); ctx.albedo(null); }
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'leaf') { const w = p.w ?? 2.2, d = p.dir ?? 1; box(ctx, Math.min(0, w * d), 0, -0.07, Math.max(0, w * d), (p.h ?? 2.7) + 0.2, 0.07); return; }
  const hw = (p.w ?? 4.4) / 2, s = 0.95, wing = p.wing ?? 8;
  for (const sx of [-1, 1]) { const a = sx * hw, b = sx * (hw + s + wing + 0.6); box(ctx, Math.min(a, b), 0, -0.3, Math.max(a, b), sx ? 1.1 : 0, 0.3); const c = sx * hw, e = sx * (hw + s); box(ctx, Math.min(c, e), 0, -0.55, Math.max(c, e), 3.9, 0.55); }
}
