// Warden tower: a tapering octagonal limestone shaft gripped by walnut roots, an exterior spiral stair of stone steps
// (rise 0.25, tread 0.25 rad ≈ 0.6 m at mid-step, 44 steps) up to a timber lookout at 11 m under a living moss roof.
// Origin: ground at the shaft axis; the arched door faces −Z. params.part "crystal" draws the floating rune crystal alone.
import { Q, T, solid, prism, ngon, gem, paint, beam, lathe, blob, leaf, TAU } from '../lib/yard-kit.js';
import { softened } from "./soften.js";

export const PLAT = 11;            // platform floor top
export const RISE = 0.25, STEP_A = 0.25, STEPS = 44;
export const TH0 = -Math.PI / 2 - 3.0;  // first step's start angle (x = cos θ, z = sin θ); the door sits at −π/2
const R0 = 2.0, R1 = 1.55;          // shaft circumradius at ground / platform
const ROUT = 3.8, RIN_TOP = 2.62, PR = 2.6; // stair outer radius, detached inner radius near the top, platform radius
export const rAt = (y) => R0 + (R1 - R0) * Math.max(0, Math.min(1, y / PLAT));
const P = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
const OCT = (r) => ngon(8, r, 0, 0, Math.PI / 8);
export const LAST_A = TH0 + (STEPS - 1) * STEP_A + STEP_A / 2;
const GAP_C = LAST_A - 0.15, GAP_W = 0.5;
const angDist = (a, b) => { let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d); };

export function stairStep(k) {
  const top = (k + 1) * RISE, a0 = TH0 + k * STEP_A, a1 = a0 + STEP_A + 0.02;
  const rin = top >= 7.7 ? RIN_TOP : rAt(top) * 0.92;
  return { top, bot: k < 2 ? -0.3 : top - 0.32, a0, a1, rin, rout: ROUT };
}
const sector = (s) => [[Math.cos(s.a0) * s.rin, Math.sin(s.a0) * s.rin], [Math.cos(s.a0) * s.rout, Math.sin(s.a0) * s.rout], [Math.cos(s.a1) * s.rout, Math.sin(s.a1) * s.rout], [Math.cos(s.a1) * s.rin, Math.sin(s.a1) * s.rin]];
function wall(ctx, a, b, y0, y1, t) { // a thin wall from xz a to b
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * t / 2, nz = dx / L * t / 2;
  const loop = [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]];
  solid(ctx, loop.map(([x, z]) => [x, y0, z]), loop.map(([x, z]) => [x, y1, z]));
}
const railSegs = () => { const out = []; for (let j = 0; j < 16; j++) { const a0 = j / 16 * TAU, a1 = (j + 1) / 16 * TAU; if (angDist((a0 + a1) / 2, GAP_C) < GAP_W) continue; out.push([a0, a1]); } return out; };
export const ROOF_POSTS = (() => { const out = [], span = TAU - 2 * (GAP_W + 0.1); for (let i = 0; i < 6; i++) out.push(GAP_C + GAP_W + 0.1 + span * i / 5); return out; })();

function crystal(ctx) {
  ctx.flat(); ctx.albedo(null); ctx.color('oklch(0.88 0.12 170)'); ctx.roughness(0.15); ctx.metalness(0.1);
  ctx.emissive('oklch(0.85 0.14 170)');
  gem(ctx, 0, 0.7, 0, 0.32, 0.85, 0.6, 6);
  if (ctx.lod <= 3) {
    ctx.emissive('oklch(0.8 0.16 160)');
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.4; gem(ctx, Math.cos(a) * 0.75, 0.55 + i * 0.18, Math.sin(a) * 0.75, 0.09, 0.22, 0.16, 5); }
  }
  ctx.emissive(null);
}

export const geometry = softened(function geometry(ctx) {
  if (ctx.params?.part === 'crystal') return crystal(ctx);
  const lod = ctx.lod ?? 1, rnd = () => ctx.random();
  ctx.flat();
  const STONE = ['oklch(0.93 0.02 85)', 'oklch(0.89 0.025 80)', 'oklch(0.95 0.015 92)', 'oklch(0.86 0.03 75)'];
  // footing
  paint(ctx, 'stone', 'oklch(0.84 0.025 80)', 0.95);
  prism(ctx, OCT(R0 + 0.28), -0.6, 0.35, 1);
  // shaft: mortar core, then proud irregular blocks
  if (lod >= 3) { paint(ctx, 'stone', STONE[0], 0.9); prism(ctx, OCT(R0), 0.3, PLAT, R1 / R0); }
  else {
    paint(ctx, 'stone', 'oklch(0.66 0.025 70)', 1);
    prism(ctx, OCT(R0 * 0.985), 0.3, PLAT, R1 / R0);
    const CH = 0.5;
    for (let c = 0; c * CH < PLAT - 0.05; c++) {
      const y0 = 0.3 + c * CH, y1 = Math.min(PLAT, y0 + CH), splits = c % 2 ? [0, 0.28, 0.66, 1] : [0, 0.5, 1];
      for (let i = 0; i < 8; i++) {
        const va = Math.PI / 8 + i * Math.PI / 4, vb = va + Math.PI / 4, mid = (va + vb) / 2;
        for (let s = 0; s < splits.length - 1; s++) {
          const t0 = splits[s] + 0.012, t1 = splits[s + 1] - 0.012, g = 0.022, j = 0.02 + rnd() * 0.05;
          const at = (t, y) => { const r = rAt(y); const A = P(r, va, y), B = P(r, vb, y); return [A[0] + (B[0] - A[0]) * t + Math.cos(mid) * j, y, A[2] + (B[2] - A[2]) * t + Math.sin(mid) * j]; };
          const back = (p) => [p[0] - Math.cos(mid) * (j + 0.02), p[1], p[2] - Math.sin(mid) * (j + 0.02)];
          const a = at(t0, y0 + g), b = at(t1, y0 + g), cc = at(t1, y1 - g), d = at(t0, y1 - g);
          const ym = (y0 + y1) / 2, rm = rAt(ym) - 0.4, tm = (t0 + t1) / 2, o = [Math.cos(mid) * rm + (Math.cos(vb) - Math.cos(va)) * (tm - 0.5) * rm, ym, Math.sin(mid) * rm + (Math.sin(vb) - Math.sin(va)) * (tm - 0.5) * rm];
          const ch = 0.035, dT = [d[0] - Math.cos(mid) * ch, d[1] + ch * 0.6, d[2] - Math.sin(mid) * ch], cT = [cc[0] - Math.cos(mid) * ch, cc[1] + ch * 0.6, cc[2] - Math.sin(mid) * ch];
          paint(ctx, 'stone', STONE[(c * 7 + i * 3 + s) % 4], 0.92);
          Q(ctx, a, b, cc, d, o); Q(ctx, d, cc, cT, dT, o);
          Q(ctx, a, d, back(d), back(a), o); Q(ctx, b, cc, back(cc), back(b), o);
        }
      }
    }
  }
  // rune bands at three heights: a carved glowing ring with glyph ticks
  if (lod <= 3) for (const yb of [2.8, 6.2, 9.6]) {
    const r = rAt(yb) + 0.075;
    ctx.albedo(null); ctx.color('oklch(0.8 0.1 172)'); ctx.emissive('oklch(0.55 0.1 172)'); ctx.roughness(0.4); ctx.metalness(0);
    for (let i = 0; i < 8; i++) {
      const va = Math.PI / 8 + i * Math.PI / 4, vb = va + Math.PI / 4, o = [0, yb, 0];
      Q(ctx, P(r, va, yb - 0.05), P(r, vb, yb - 0.05), P(r, vb, yb + 0.05), P(r, va, yb + 0.05), o);
      if (lod <= 2) for (let g = 1; g < 4; g++) {
        const t = g / 4, A = P(r, va, 0), B = P(r, vb, 0), x = A[0] + (B[0] - A[0]) * t, z = A[2] + (B[2] - A[2]) * t, tx = (B[0] - A[0]) * 0.03, tz = (B[2] - A[2]) * 0.03, up = (i + g) % 2 ? 0.2 : -0.2;
        Q(ctx, [x - tx, yb, z - tz], [x + tx, yb, z + tz], [x + tx * 1.8, yb + up, z + tz * 1.8], [x - tx * 0.2, yb + up, z - tz * 0.2], o);
      }
    }
    ctx.emissive(null);
  }
  // arched timber door on the −Z face
  {
    const ap = (y) => rAt(y) * Math.cos(Math.PI / 8) + 0.07, zR = -ap(1), hw = 0.5, spring = 1.7;
    const topAt = (x) => spring + Math.sqrt(Math.max(0, hw * hw - x * x));
    const o = [0, 1, -0.5];
    paint(ctx, null, 'oklch(0.22 0.02 50)', 1);
    Q(ctx, [-hw, 0.3, zR], [hw, 0.3, zR], [hw, spring, zR], [-hw, spring, zR], o);
    for (let i = 0; i < 8; i++) { const a0 = i / 8 * Math.PI, a1 = (i + 1) / 8 * Math.PI; T(ctx, [0, spring, zR], [Math.cos(a0) * hw, spring + Math.sin(a0) * hw, zR], [Math.cos(a1) * hw, spring + Math.sin(a1) * hw, zR], o); }
    paint(ctx, 'walnut', 'oklch(0.9 0.03 60)', 0.8);
    const n = lod <= 2 ? 5 : 2;
    for (let p = 0; p < n; p++) {
      const x0 = -hw + p * 2 * hw / n + 0.012, x1 = -hw + (p + 1) * 2 * hw / n - 0.012, z = zR - 0.03;
      Q(ctx, [x0, 0.32, z], [x1, 0.32, z], [x1, topAt(x1) - 0.02, z], [x0, topAt(x0) - 0.02, z], o);
    }
    if (lod <= 2) { paint(ctx, null, 'oklch(0.3 0.01 60)', 0.5, 0.7); for (const yy of [0.8, 1.6]) Q(ctx, [-hw, yy, zR - 0.05], [hw, yy, zR - 0.05], [hw, yy + 0.07, zR - 0.05], [-hw, yy + 0.07, zR - 0.05], o); ctx.metalness(0); }
    // jambs and voussoirs
    paint(ctx, 'stone', 'oklch(0.9 0.02 85)', 0.9);
    const z1 = zR + 0.02, z2 = zR - 0.12;
    for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) {
      const y0 = 0.35 + k * 0.45, y1 = y0 + 0.42, xa = sx * hw, xb = sx * (hw + (k % 2 ? 0.2 : 0.26));
      const L = [[xa, y0], [xb, y0], [xb, y1], [xa, y1]];
      solid(ctx, L.map(([x, y]) => [x, y, z1]), L.map(([x, y]) => [x, y, z2]));
    }
    const nv = lod <= 2 ? 9 : 5;
    for (let i = 0; i < nv; i++) {
      const a0 = i / nv * Math.PI + 0.01, a1 = (i + 1) / nv * Math.PI - 0.01, ri = hw, ro = hw + (i === (nv - 1) / 2 ? 0.3 : 0.22);
      const L = [[Math.cos(a0) * ri, spring + Math.sin(a0) * ri], [Math.cos(a0) * ro, spring + Math.sin(a0) * ro], [Math.cos(a1) * ro, spring + Math.sin(a1) * ro], [Math.cos(a1) * ri, spring + Math.sin(a1) * ri]];
      solid(ctx, L.map(([x, y]) => [x, y, z1]), L.map(([x, y]) => [x, y, z2]));
    }
    paint(ctx, 'stone', 'oklch(0.82 0.02 80)', 0.95);
    const L = [[-0.8, -0.2], [0.8, -0.2], [0.8, 0.36], [-0.8, 0.36]];
    solid(ctx, L.map(([x, y]) => [x, y, zR + 0.1]), L.map(([x, y]) => [x, y, zR - 0.45]));
  }
  // slit windows
  if (lod <= 3) for (const [a, y] of [[0, 4.2], [Math.PI / 2, 5.6], [Math.PI, 7.4], [-Math.PI / 4, 8.8], [Math.PI * 0.75, 3.4]]) {
    const r = rAt(y) * Math.cos(Math.PI / 8) + 0.075, c = [Math.cos(a) * r, y, Math.sin(a) * r], t = [-Math.sin(a), 0, Math.cos(a)], o = [0, y, 0];
    const pt = (u, v, dr = 0) => [c[0] + t[0] * u + Math.cos(a) * dr, c[1] + v, c[2] + t[2] * u + Math.sin(a) * dr];
    paint(ctx, null, 'oklch(0.2 0.02 60)', 1); ctx.emissive('oklch(0.35 0.06 70)');
    Q(ctx, pt(-0.07, -0.38), pt(0.07, -0.38), pt(0.07, 0.38), pt(-0.07, 0.38), o); ctx.emissive(null);
    paint(ctx, 'stone', 'oklch(0.88 0.02 80)', 0.9);
    solid(ctx, [pt(-0.2, 0.38), pt(0.2, 0.38), pt(0.2, 0.38, 0.1), pt(-0.2, 0.38, 0.1)], [pt(-0.2, 0.52), pt(0.2, 0.52), pt(0.2, 0.52, 0.1), pt(-0.2, 0.52, 0.1)]);
    solid(ctx, [pt(-0.18, -0.5), pt(0.18, -0.5), pt(0.18, -0.5, 0.12), pt(-0.18, -0.5, 0.12)], [pt(-0.18, -0.38), pt(0.18, -0.38), pt(0.18, -0.38, 0.12), pt(-0.18, -0.38, 0.12)]);
  }
  // spiral stair
  if (lod <= 4) for (let k = 0; k < STEPS; k++) {
    const s = stairStep(k), sec = sector(s);
    paint(ctx, 'stone', STONE[(k * 5) % 4], 0.92);
    prism(ctx, sec, s.bot, s.top, 1);
    if (lod <= 2 && k >= 2) { // a corbel or a walnut strut under each tread
      const am = (s.a0 + s.a1) / 2;
      if (s.rin > 2.2) { paint(ctx, 'walnut', 'oklch(0.85 0.03 60)', 0.8); beam(ctx, P(rAt(s.bot - 0.9) - 0.05, am, s.bot - 0.9), P(s.rin + 0.5, am, s.bot + 0.02), 0.12, 0.12); }
      else { paint(ctx, 'stone', 'oklch(0.84 0.025 80)', 0.95); solid(ctx, [P(s.rin, am - 0.07, s.bot - 0.45), P(s.rin, am + 0.07, s.bot - 0.45), P(s.rin + 0.2, am + 0.07, s.bot - 0.45), P(s.rin + 0.2, am - 0.07, s.bot - 0.45)], [P(s.rin, am - 0.09, s.bot), P(s.rin, am + 0.09, s.bot), P(s.rin + 1.0, am + 0.09, s.bot), P(s.rin + 1.0, am - 0.09, s.bot)]); }
    }
    if (lod <= 3 && k % 3 === 1 && k < STEPS - 1) { // twig handrail on the outer edge
      paint(ctx, 'walnut', 'oklch(0.8 0.035 55)', 0.85);
      const a = (s.a0 + s.a1) / 2, r = ROUT - 0.08, n = stairStep(k + 3), an = (n.a0 + n.a1) / 2;
      beam(ctx, P(r, a, s.top), P(r, a + 0.02, s.top + 0.95), 0.07, 0.07);
      if (k + 3 < STEPS) beam(ctx, P(r, a, s.top + 0.92), P(r, an, n.top + 0.92), 0.06, 0.06);
      if (lod <= 2 && k + 3 < STEPS) beam(ctx, P(r, a, s.top + 0.45), P(r, an + 0.05, n.top + 0.5), 0.035, 0.035);
    }
  }
  // gnarled walnut roots gripping the ground, clear of the door and the stair foot
  if (lod <= 4) {
    paint(ctx, 'walnut', 'oklch(0.72 0.04 55)', 0.9);
    const n = lod <= 2 ? 9 : 5;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + 0.3 + rnd() * 0.3;
      if (angDist(a, -Math.PI / 2) < 0.55 || angDist(a, TH0 + 0.6) < 0.8) continue;
      const pts = [[R0 - 0.05, 1.3 + rnd() * 0.6], [R0 + 0.25, 0.75], [R0 + 0.7, 0.35], [R0 + 1.2 + rnd() * 0.4, 0.05], [R0 + 1.6 + rnd() * 0.5, -0.25]];
      let prev = null, w = 0.42;
      pts.forEach(([r, y], j) => { const aa = a + Math.sin(j * 1.7 + i) * 0.08, p = P(r, aa, y); if (prev) { beam(ctx, prev, p, w, w * 0.8); w *= 0.75; } prev = p; });
      if (lod <= 2) { const b = P(R0 + 0.9, a + 0.25, 0.25); beam(ctx, P(R0 + 0.55, a, 0.4), b, 0.13, 0.11); beam(ctx, b, P(R0 + 1.3, a + 0.4, -0.15), 0.1, 0.08); }
    }
    if (lod <= 2) { paint(ctx, 'moss', 'oklch(0.85 0.08 130)', 1); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.5; if (angDist(a, -Math.PI / 2) < 0.6) continue; blob(ctx, Math.cos(a) * (R0 + 0.45), 0.25, Math.sin(a) * (R0 + 0.45), 0.4, 0.22, 0.35, 5, rnd); } }
  }
  // platform: stone corbel ring, walnut braces, oak deck, stone rim
  paint(ctx, 'stone', 'oklch(0.88 0.025 82)', 0.92);
  if (lod <= 4) lathe(ctx, [[rAt(10.1), 10.1], [2.1, 10.45], [PR, 10.7]], 16);
  if (lod <= 3) {
    paint(ctx, 'walnut', 'oklch(0.82 0.035 58)', 0.85);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2; beam(ctx, P(rAt(9.3) - 0.05, a, 9.3), P(PR - 0.15, a, 10.65), 0.14, 0.14); }
  }
  paint(ctx, 'oak', 'oklch(0.93 0.03 75)', 0.8);
  prism(ctx, ngon(16, PR), 10.7, PLAT - 0.02, 1);
  paint(ctx, 'stone', 'oklch(0.9 0.02 85)', 0.9);
  if (lod <= 3) { const A = ngon(16, PR + 0.06), B = ngon(16, PR - 0.12); for (let j = 0; j < 16; j++) { const k = (j + 1) % 16; solid(ctx, [[A[j][0], 10.62, A[j][1]], [A[k][0], 10.62, A[k][1]], [B[k][0], 10.62, B[k][1]], [B[j][0], 10.62, B[j][1]]], [[A[j][0], PLAT + 0.04, A[j][1]], [A[k][0], PLAT + 0.04, A[k][1]], [B[k][0], PLAT + 0.04, B[k][1]], [B[j][0], PLAT + 0.04, B[j][1]]]); } }
  // twig railing with little stone merlons at its posts
  if (lod <= 3) for (const [a0, a1] of railSegs()) {
    const r = PR - 0.1, A = P(r, a0, PLAT), B = P(r, a1, PLAT);
    paint(ctx, 'walnut', 'oklch(0.8 0.035 55)', 0.85);
    beam(ctx, A, [A[0], PLAT + 1.0, A[2]], 0.09, 0.09);
    beam(ctx, [A[0], PLAT + 0.98, A[2]], [B[0], PLAT + 0.98 + (lod <= 2 ? (rnd() - 0.5) * 0.06 : 0), B[2]], 0.07, 0.07);
    if (lod <= 2) { beam(ctx, [A[0], PLAT + 0.2, A[2]], [B[0], PLAT + 0.75, B[2]], 0.04, 0.04); beam(ctx, [A[0], PLAT + 0.75, A[2]], [B[0], PLAT + 0.2, B[2]], 0.04, 0.04); }
    paint(ctx, 'stone', STONE[1], 0.9);
    const am = (a0 + a1) / 2; if (lod <= 2) solid(ctx, [P(r - 0.08, am - 0.06, PLAT), P(r + 0.1, am - 0.06, PLAT), P(r + 0.1, am + 0.06, PLAT), P(r - 0.08, am + 0.06, PLAT)], [P(r - 0.08, am - 0.06, PLAT + 0.4), P(r + 0.1, am - 0.06, PLAT + 0.4), P(r + 0.1, am + 0.06, PLAT + 0.4), P(r - 0.08, am + 0.06, PLAT + 0.4)]);
  }
  // curved branch posts holding the living roof
  const EAVE = 13.6;
  if (lod <= 4) {
    paint(ctx, 'walnut', 'oklch(0.76 0.04 55)', 0.9);
    for (const a of ROOF_POSTS) {
      const prof = [[2.3, PLAT], [2.12, 11.7], [2.2, 12.5], [2.5, 13.1], [2.95, EAVE]];
      let prev = null; prof.forEach(([r, y], j) => { const p = P(r, a + j * 0.05, y); if (prev) beam(ctx, prev, p, 0.17 - j * 0.015, 0.17 - j * 0.015); prev = p; });
      if (lod <= 2) { const b = P(2.2, a + 0.1, 12.5); beam(ctx, b, P(2.7, a + 0.35, 13.2), 0.07, 0.07); }
    }
    if (lod <= 3) for (let i = 0; i < 12; i++) beam(ctx, P(3.0, i / 12 * TAU, EAVE), P(3.0, (i + 1) / 12 * TAU, EAVE), 0.16, 0.14);
  }
  // steep conical living roof: moss, tufts, small flowers
  paint(ctx, 'moss', 'oklch(0.9 0.07 128)', 1);
  const roof = [[3.35, EAVE - 0.15], [3.05, EAVE + 0.1], [2.3, 14.8], [1.35, 16.0], [0.55, 17.0], [0, 17.5]];
  lathe(ctx, roof, lod <= 3 ? 16 : 8);
  if (lod <= 2) {
    for (let i = 0; i < 22; i++) { const a = rnd() * TAU, t = 0.15 + rnd() * 0.7, r = 3.0 - t * 2.8, y = EAVE + 0.1 + t * 3.6; paint(ctx, 'moss', i % 3 ? 'oklch(0.82 0.1 135)' : 'oklch(0.9 0.08 115)', 1); blob(ctx, Math.cos(a) * r, y - 0.05, Math.sin(a) * r, 0.28, 0.14, 0.28, 5, rnd); }
    const FL = ['oklch(0.9 0.08 350)', 'oklch(0.97 0.03 90)', 'oklch(0.9 0.13 90)', 'oklch(0.8 0.1 300)'];
    for (let i = 0; i < 40; i++) { const a = rnd() * TAU, t = 0.05 + rnd() * 0.8, r = 3.05 - t * 2.8 + 0.06, y = EAVE + 0.12 + t * 3.6; paint(ctx, null, FL[i % 4], 0.7); gem(ctx, Math.cos(a) * r, y, Math.sin(a) * r, 0.07, 0.05, 0.02, 5); }
    // a moss fringe at the eave
    paint(ctx, 'moss', 'oklch(0.78 0.1 135)', 1);
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + rnd() * 0.1, p = P(3.3, a, EAVE - 0.15), q = P(3.36, a + 0.03, EAVE - 0.5 - rnd() * 0.35); leaf(ctx, p, [q[0] - p[0], q[1] - p[1], q[2] - p[2]].map((v) => v / 0.5), [-Math.sin(a), 0, Math.cos(a)], 0.5, 0.12); }
  }
  // ivy: two thick vines spiralling up the shaft, leaves along them
  if (lod <= 3) for (const [ph, dirn] of [[0.6, -1], [3.4, -1]]) {
    let prev = null;
    for (let y = 0.1; y < PLAT - 0.3; y += lod <= 2 ? 0.35 : 0.9) {
      const a = ph + dirn * y * 0.55, r = rAt(y) + 0.11, p = P(r, a, y);
      paint(ctx, 'walnut', 'oklch(0.55 0.05 90)', 0.9);
      if (prev) beam(ctx, prev, p, 0.07, 0.06);
      prev = p;
      if (lod <= 1) for (let l = 0; l < 3; l++) {
        const aa = a + (rnd() - 0.5) * 0.35, yy = y + (rnd() - 0.5) * 0.3, q = P(r + 0.02, aa, yy), out = [Math.cos(aa), 0.35 + rnd() * 0.5, Math.sin(aa)], L = Math.hypot(...out), d = out.map((v) => v / L), side = [-Math.sin(aa), 0, Math.cos(aa)];
        paint(ctx, null, ['oklch(0.52 0.12 140)', 'oklch(0.6 0.13 132)', 'oklch(0.45 0.1 148)'][l], 0.8);
        leaf(ctx, q, d, side, 0.24 + rnd() * 0.1, 0.1);
      }
    }
  }
  // hanging tendrils off the platform rim
  if (lod <= 2) for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + 0.35; if (angDist(a, GAP_C) < GAP_W + 0.2) continue;
    const len = 1.3 + rnd() * 1.8; let prev = P(PR + 0.02, a, 10.72);
    for (let s = 1; s <= 6; s++) {
      const y = 10.72 - len * s / 6, p = P(PR + 0.05 + Math.sin(s * 1.3 + i) * 0.06, a + Math.sin(s + i) * 0.03, y);
      paint(ctx, 'walnut', 'oklch(0.55 0.05 90)', 0.9); beam(ctx, prev, p, 0.035, 0.035);
      if (lod <= 1) { paint(ctx, null, s % 2 ? 'oklch(0.58 0.13 135)' : 'oklch(0.5 0.11 145)', 0.8); leaf(ctx, p, [Math.cos(a) * 0.7, -0.7, Math.sin(a) * 0.7], [-Math.sin(a), 0, Math.cos(a)], 0.2, 0.08); }
      prev = p;
    }
  }
  ctx.albedo(null); ctx.emissive(null);
});

export function collider(ctx) {
  if (ctx.params?.part === 'crystal') return null;
  prism(ctx, OCT(R0 + 0.28), -0.6, 0.35, 1);
  prism(ctx, OCT(R0), 0.3, PLAT, R1 / R0);
  prism(ctx, ngon(16, PR), 10.7, PLAT, 1);
  for (let k = 0; k < STEPS; k++) {
    const s = stairStep(k);
    prism(ctx, sector(s), s.bot, s.top, 1);
    if (k < STEPS - 1) { const a = [Math.cos(s.a0) * (ROUT - 0.06), Math.sin(s.a0) * (ROUT - 0.06)], b = [Math.cos(s.a1) * (ROUT - 0.06), Math.sin(s.a1) * (ROUT - 0.06)]; wall(ctx, a, b, s.top, s.top + 0.95, 0.1); }
  }
  for (const [a0, a1] of railSegs()) wall(ctx, [Math.cos(a0) * (PR - 0.1), Math.sin(a0) * (PR - 0.1)], [Math.cos(a1) * (PR - 0.1), Math.sin(a1) * (PR - 0.1)], PLAT, PLAT + 1.0, 0.1);
  for (const a of ROOF_POSTS) { const c = [Math.cos(a) * 2.3, Math.sin(a) * 2.3]; prism(ctx, ngon(6, 0.1, c[0], c[1]), PLAT, 13.5, 1); }
}
