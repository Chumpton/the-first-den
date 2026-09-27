// The treehouse zip-line, one piece: an oak launch platform off treehouse-b's lake-side rim (a wrought-iron A-frame
// holding the rope), a sagging rope down to the lake shore, and a limestone-kerbed sand pit with an iron end post and
// guy line. All params are root-local (the spawn computes them from the terrain): C deck centre [x,y(top),z], n the
// rim's outward [x,z], a rope start, b rope end (post top), sag, P pit centre [x, sand top, z], gB/gS ground at post/stake.
import { paint, obox, beam, TAU } from '../lib/yard-kit.js';
import { prism, ngon, gem } from '../lib/road-solid.js';
import { ZIP } from '../lib/data/zipline.js';
const SAG = (p) => ZIP.sag ?? p.sag;
const IRON = 'oklch(0.3 0.015 60)', ROPE = 'oklch(0.7 0.06 75)', SAND = 'cdn/texture-soft-pale-beach-sand.png';
function frames(p) {
  const C = p.C, n = p.n, r = [-n[1], n[0]], yN = Math.atan2(-n[0], -n[1]);
  const pt = (v, u, y) => [C[0] + n[0] * v + r[0] * u, y, C[2] + n[1] * v + r[1] * u];
  const ob = (ctx, v, u, y0, su, sy, sv) => { const q = pt(v, u, 0); obox(ctx, q[0], y0, q[2], su, sy, sv, yN); };
  const dx = p.b[0] - p.a[0], dz = p.b[2] - p.a[2], L = Math.hypot(dx, dz), d = [dx / L, dz / L], rd = [-d[1], d[0]], yD = Math.atan2(-d[0], -d[1]);
  const qt = (v, u, y) => [p.P[0] + d[0] * v + rd[0] * u, y, p.P[2] + d[1] * v + rd[1] * u];
  const oq = (ctx, v, u, y0, su, sy, sv) => { const q = qt(v, u, 0); obox(ctx, q[0], y0, q[2], su, sy, sv, yD); };
  return { D: C[1], pt, ob, qt, oq, d };
}
const rope = (p, t) => [p.a[0] + (p.b[0] - p.a[0]) * t, p.a[1] + (p.b[1] - p.a[1]) * t - SAG(p) * 4 * t * (1 - t), p.a[2] + (p.b[2] - p.a[2]) * t];
function launch(ctx, p, f, lod) {
  const { D, pt, ob } = f;
  paint(ctx, 'walnut', 'oklch(0.66 0.06 55)', 0.85);            // joists, end beam, braces to the trunk
  for (const u of [-1.1, 1.1]) { ob(ctx, 6.4, u, D - 0.42, 0.14, 0.24, 3.0); beam(ctx, pt(7.6, u, D - 0.3), pt(2.0, u * 0.3, D - 3.0), 0.14, 0.14); }
  ob(ctx, 7.8, 0, D - 0.42, 2.8, 0.24, 0.16);
  if (lod <= 2) for (let i = 0; i < 7; i++) { paint(ctx, 'oak', `oklch(${(0.86 + ((i * 37) % 7) * 0.012).toFixed(3)} 0.05 70)`, 0.85); ob(ctx, 6.4, -1.2 + i * 0.4, D - 0.18, 0.37, 0.18, 3.0); }
  else { paint(ctx, 'oak', 'oklch(0.88 0.05 70)', 0.85); ob(ctx, 6.4, 0, D - 0.18, 2.8, 0.18, 3.0); }
  paint(ctx, 'oak', 'oklch(0.8 0.05 65)', 0.85);                  // side railings and the end rails either side of the drop-off
  for (const u of [-1.34, 1.34]) {
    for (const v of [5.1, 6.4, 7.8]) ob(ctx, v, u, D, 0.1, 1.05, 0.1);
    ob(ctx, 6.45, u, D + 0.95, 0.1, 0.08, 2.9); if (lod <= 2) ob(ctx, 6.45, u, D + 0.48, 0.07, 0.07, 2.9);
    ob(ctx, 7.84, u * 0.78, D + 0.95, 0.66, 0.08, 0.1); if (lod <= 2) ob(ctx, 7.84, u * 0.78, D + 0.48, 0.66, 0.07, 0.07);
    ob(ctx, 7.84, u * 0.54, D, 0.09, 1.05, 0.09);
  }
  paint(ctx, null, IRON, 0.5, 0.6);                              // the wrought-iron A-frame, stayed back to the deck
  for (const s of [-1, 1]) {
    beam(ctx, pt(6.9, s * 1.25, D), pt(6.9, s * 1.0, D + 2.78), 0.08, 0.08);
    beam(ctx, pt(6.9, s * 1.05, D + 2.6), pt(5.05, s * 1.3, D + 0.05), 0.05, 0.05);
    ob(ctx, 6.9, s * 1.25, D, 0.24, 0.03, 0.24);
    if (lod <= 2) gem(ctx, ...pt(6.9, s * 1.0, D + 2.8), 0.07, 0.16, 0.04, 4);
  }
  beam(ctx, pt(6.9, -1.12, D + 2.68), pt(6.9, 1.12, D + 2.68), 0.12, 0.1);
  if (lod <= 2) { for (let i = 1; i < 6; i++) { const u = -1 + i / 3, k = 0.18 * Math.sin(Math.PI * i / 6); beam(ctx, pt(6.9, u - 1 / 3, D + 2.62 - k), pt(6.9, u, D + 2.62 - 0.18 * Math.sin(Math.PI * (i + 1) / 6)), 0.03, 0.03); }
    gem(ctx, p.a[0], p.a[1] + 0.02, p.a[2], 0.07, 0.07, 0.07, 6); }
}
function cable(ctx, p, lod) {
  paint(ctx, null, ROPE, 0.9); const N = lod <= 2 ? 28 : lod <= 3 ? 12 : 5, w = lod <= 2 ? 0.04 : 0.06;
  for (let i = 0; i < N; i++) beam(ctx, rope(p, i / N), rope(p, (i + 1) / N), w, w);
}
// the festoon: a thin guide line ZIP.bunting.offset beside the rope, on the same catenary, pennants and warm lanterns on it
function bunting(ctx, p, f, lod, rnd) {
  if (lod >= 4) return;
  const B = ZIP.bunting, sag = SAG(p), rd = [-f.d[1], f.d[0]], o = B.side * B.offset;
  const ga = [p.a[0] + rd[0] * o, p.a[1] - B.drop, p.a[2] + rd[1] * o], gb = [p.b[0] + rd[0] * o, p.b[1] - B.drop, p.b[2] + rd[1] * o];
  const g = (t) => [ga[0] + (gb[0] - ga[0]) * t, ga[1] + (gb[1] - ga[1]) * t - sag * 4 * t * (1 - t), ga[2] + (gb[2] - ga[2]) * t];
  const L = Math.hypot(gb[0] - ga[0], gb[1] - ga[1], gb[2] - ga[2]);
  paint(ctx, null, IRON, 0.5, 0.6);                               // hanger under the A-frame beam; arm and brace on the end post
  beam(ctx, [ga[0], p.a[1] + 0.08, ga[2]], ga, 0.02, 0.02);
  const b = p.b, arm = [b[0] + rd[0] * o * 1.25, b[1] - 0.1, b[2] + rd[1] * o * 1.25];
  beam(ctx, [b[0], b[1] - 0.1, b[2]], arm, 0.05, 0.05); beam(ctx, [b[0], b[1] - 0.5, b[2]], [b[0] + rd[0] * o * 0.9, b[1] - 0.12, b[2] + rd[1] * o * 0.9], 0.03, 0.03);
  paint(ctx, null, 'oklch(0.62 0.05 70)', 0.9); const N = lod <= 2 ? 28 : 12;
  for (let i = 0; i < N; i++) beam(ctx, g(i / N), g((i + 1) / N), 0.016, 0.016);
  const slots = Math.floor((L - 2 * B.margin) / B.spacing), fw = B.flag[0] / L;
  let flag = 0;
  for (let k = 0; k <= slots; k++) {
    const t = (B.margin + k * B.spacing) / L, q = g(t);
    if (k % B.every === B.every - 1) {                            // a little hanging lantern: wire, iron cap, glowing body
      if (lod <= 2) { paint(ctx, null, IRON, 0.5, 0.6); beam(ctx, q, [q[0], q[1] - 0.08, q[2]], 0.008, 0.008); gem(ctx, q[0], q[1] - 0.1, q[2], 0.055, 0.035, 0.005, 4); gem(ctx, q[0], q[1] - 0.225, q[2], 0.035, 0.005, 0.03, 4); }
      ctx.albedo(null); ctx.color('oklch(0.95 0.08 80)'); ctx.roughness(0.3); ctx.metalness(0); ctx.emissive(...B.glow);
      obox(ctx, q[0], q[1] - 0.22, q[2], 0.075, 0.115, 0.075, 0); ctx.emissive(null);
      continue;
    }
    const c = flag++ % B.colors.length; if (lod === 3 && flag % 2) continue;
    const A = g(t - fw / 2), Z = g(t + fw / 2), j = (rnd() - 0.5) * 0.08;
    paint(ctx, null, B.colors[c], 0.95);
    ctx.tri(...A, ...Z, q[0] + rd[0] * j, q[1] - B.flag[1], q[2] + rd[1] * j);
  }
}
function landing(ctx, p, f, lod, rnd) {
  const { oq } = f, Y = p.P[1], y0 = Y - 0.45;
  ctx.albedo(SAND); ctx.color('oklch(0.95 0.035 85)'); ctx.roughness(1); ctx.metalness(0); ctx.emissive(null);
  oq(ctx, 0, 0, y0, 2.8, Y + 0.08 - y0, 4.4);
  if (lod <= 2) for (let i = 0; i < 5; i++) { const q = f.qt(-1.6 + i * 0.8, (rnd() - 0.5) * 1.8, Y + 0.08); gem(ctx, q[0], q[1], q[2], 0.35 + rnd() * 0.3, 0.06, 0.01, 6); }
  const kerb = (v, u, su, sv, along) => { // limestone kerb, split into blocks near
    const n = lod <= 2 ? Math.max(1, Math.round((along ? sv : su) / 0.62)) : 1;
    for (let i = 0; i < n; i++) { paint(ctx, 'stone', `oklch(${(0.86 + rnd() * 0.07).toFixed(3)} 0.025 ${(75 + rnd() * 18).toFixed(0)})`, 0.9);
      const k = (i + 0.5) / n - 0.5; if (along) oq(ctx, v + k * sv, u, y0, su, Y + 0.17 - y0, sv / n - 0.02); else oq(ctx, v, u + k * su, y0, su / n - 0.02, Y + 0.17 - y0, sv); } };
  kerb(0, -1.52, 0.26, 4.6, true); kerb(0, 1.52, 0.26, 4.6, true); kerb(-2.33, 0, 2.8, 0.26, false); kerb(2.33, 0, 2.8, 0.26, false);
  paint(ctx, null, 'oklch(0.9 0.03 85)', 1);                      // a linen-wrapped bumper bale at the far end, walnut-strapped
  oq(ctx, 1.85, 0, Y + 0.08, 1.7, 0.55, 0.5);
  if (lod <= 2) { paint(ctx, 'walnut', 'oklch(0.6 0.06 55)', 0.85); for (const u of [-0.5, 0.5]) oq(ctx, 1.85, u, Y + 0.075, 0.08, 0.565, 0.52); }
  // the iron end post on a limestone footing, its pulley arm, and a guy line to a stake
  const b = p.b, gB = p.gB, k = p.stake ?? 1.8, S = [b[0] + f.d[0] * k, p.gS, b[2] + f.d[1] * k];
  paint(ctx, 'stone', 'oklch(0.9 0.025 82)', 0.9); obox(ctx, b[0], gB - 0.3, b[2], 0.62, 0.62, 0.62, Math.atan2(-f.d[0], -f.d[1]));
  paint(ctx, null, IRON, 0.5, 0.6); prism(ctx, ngon(lod <= 2 ? 8 : 4, 0.08, b[0], b[2]), gB + 0.3, b[1] + 0.32);
  if (lod <= 2) { gem(ctx, b[0], b[1] + 0.32, b[2], 0.11, 0.18, 0.02, 8); prism(ctx, ngon(8, 0.11, b[0], b[2]), gB + 0.3, gB + 0.42); }
  gem(ctx, b[0], b[1], b[2], 0.09, 0.08, 0.08, 6);
  paint(ctx, null, ROPE, 0.9); beam(ctx, [b[0], b[1] + 0.2, b[2]], [S[0], S[1] + 0.25, S[2]], 0.03, 0.03);
  paint(ctx, 'walnut', 'oklch(0.6 0.06 55)', 0.85); obox(ctx, S[0], S[1] - 0.2, S[2], 0.1, 0.5, 0.1);
}
export function geometry(ctx) {
  ctx.flat(); const p = ctx.params, f = frames(p), lod = ctx.lod; let s = 11; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  launch(ctx, p, f, lod); cable(ctx, p, lod); bunting(ctx, p, f, lod, rnd); landing(ctx, p, f, lod, rnd);
}
export function collider(ctx) {
  const p = ctx.params, f = frames(p), { D, ob, oq } = f, Y = p.P[1];
  ob(ctx, 6.4, 0, D - 0.34, 2.8, 0.34, 3.0);
  for (const u of [-1.34, 1.34]) { ob(ctx, 6.45, u, D, 0.12, 1.05, 2.9); ob(ctx, 7.84, u * 0.78, D, 0.66, 1.05, 0.12); ob(ctx, 6.9, u * 0.93, D, 0.14, 2.7, 0.14); }
  oq(ctx, 0, 0, Y - 0.45, 3.1, 0.53, 4.9); oq(ctx, 1.85, 0, Y + 0.08, 1.7, 0.55, 0.5);
  obox(ctx, p.b[0], p.gB - 0.3, p.b[2], 0.62, 0.62, 0.62); obox(ctx, p.b[0], p.gB, p.b[2], 0.18, p.b[1] - p.gB + 0.3, 0.18);
}
