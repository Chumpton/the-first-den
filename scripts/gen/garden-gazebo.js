// Open hexagonal honey-oak gazebo: limestone plinth, six posts, lattice rails with the entrance (−Z side) open,
// a bench ring, a verdigris copper dome with a brass finial and a hanging lantern. Feet at plinth base centre.
import { beam, lathe, lantern, paint, prism, box, gem, Q, T, solid } from '../lib/garden-kit.js';
const R = 2.05, POST = 2.42, EAVE = 2.5, RE = 2.6, APEX = 3.55, ENT = 4, FL = 0.1;
const ang = (k) => k * Math.PI / 3;
const V = (r, k, y = 0) => [Math.cos(ang(k)) * r, y, Math.sin(ang(k)) * r];
const hex = (r) => [0, 1, 2, 3, 4, 5].map((k) => [Math.cos(ang(k)) * r, Math.sin(ang(k)) * r]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const OAK = 'oklch(0.95 0.03 75)', STONE = 'oklch(0.94 0.015 85)', COPPER = 'oklch(0.95 0.03 170)';
function seats() { // bench ring trapezoids on the five railed sides
  const A = R * Math.cos(Math.PI / 6), ro = (A - 0.13) / Math.cos(Math.PI / 6), ri = (A - 0.52) / Math.cos(Math.PI / 6), out = [];
  for (let k = 0; k < 6; k++) if (k !== ENT) out.push([[V(ro, k)[0], V(ro, k)[2]], [V(ro, k + 1)[0], V(ro, k + 1)[2]], [V(ri, k + 1)[0], V(ri, k + 1)[2]], [V(ri, k)[0], V(ri, k)[2]]]);
  return out;
}
function domeRings(J, scale = 1, dy = 0) {
  const rings = [];
  for (let j = 0; j <= J; j++) {
    const t = j / J, r = RE * scale * Math.cos(t * Math.PI / 2) ** 0.9, y = EAVE + dy + (APEX - EAVE) * Math.sin(t * Math.PI / 2) ** 0.8;
    rings.push([0, 1, 2, 3, 4, 5].map((k) => V(r, k, y)));
  }
  return rings;
}
function dome(ctx, rings) {
  const o = [0, EAVE - 0.6, 0];
  for (let j = 0; j < rings.length - 1; j++) for (let k = 0; k < 6; k++) {
    const a = rings[j][k], b = rings[j][(k + 1) % 6], c = rings[j + 1][(k + 1) % 6], d = rings[j + 1][k];
    if (j === rings.length - 2) T(ctx, a, b, [0, c[1], 0], o); else Q(ctx, a, b, c, d, o);
  }
}
export function geometry(ctx) {
  const lod = ctx.lod || 1; ctx.flat();
  const g = Math.min(...hex(R + 0.3).map(([x, z]) => ctx.groundY(x, z)), 0) - 0.12;
  // plinth
  paint(ctx, 'stone', STONE, 0.9);
  if (lod <= 2) { prism(ctx, hex(R + 0.3), g, FL - 0.03); solid(ctx, hex(R + 0.3).map(([x, z]) => [x, FL - 0.03, z]), hex(R + 0.26).map(([x, z]) => [x, FL, z])); }
  else prism(ctx, hex(R + 0.3), g, FL);
  if (lod <= 1) { paint(ctx, 'stone', 'oklch(0.86 0.02 80)', 0.9); prism(ctx, hex(0.55), FL, FL + 0.006); for (let k = 0; k < 6; k++) beam(ctx, V(0.55, k, FL + 0.002), V(R + 0.2, k, FL + 0.002), 0.03, 0.006); }
  // posts, bases, capitals
  for (let k = 0; k < 6; k++) {
    const [x, , z] = V(R - 0.08, k);
    paint(ctx, 'oak', OAK, 0.8); box(ctx, x - 0.07, FL, z - 0.07, x + 0.07, POST, z + 0.07);
    if (lod <= 2) { box(ctx, x - 0.1, POST - 0.1, z - 0.1, x + 0.1, POST - 0.03, z + 0.1); paint(ctx, 'stone', STONE, 0.9); box(ctx, x - 0.11, FL, z - 0.11, x + 0.11, FL + 0.16, z + 0.11); }
  }
  paint(ctx, 'oak', OAK, 0.8);
  for (let k = 0; k < 6; k++) {
    beam(ctx, lerp(V(R - 0.08, k, EAVE - 0.08), V(R - 0.08, k + 1, EAVE - 0.08), -0.04), lerp(V(R - 0.08, k, EAVE - 0.08), V(R - 0.08, k + 1, EAVE - 0.08), 1.04), 0.12, 0.16);
    if (lod <= 2) for (const nb of [k - 1, k + 1]) beam(ctx, V(R - 0.08, k, POST - 0.5), lerp(V(R - 0.08, k, EAVE - 0.15), V(R - 0.08, nb, EAVE - 0.15), 0.24), 0.06);
  }
  // rails + lattice on the five closed sides
  for (let k = 0; k < 6; k++) {
    if (k === ENT) continue;
    const P0 = V(R - 0.08, k), P1 = V(R - 0.08, k + 1), L = Math.hypot(P1[0] - P0[0], P1[2] - P0[2]), dx = (P1[0] - P0[0]) / L, dz = (P1[2] - P0[2]) / L;
    const at = (x, y) => [P0[0] + dx * x, y, P0[2] + dz * x];
    beam(ctx, at(0.07, 0.95), at(L - 0.07, 0.95), 0.09, 0.06);
    if (lod <= 3) beam(ctx, at(0.07, 0.24), at(L - 0.07, 0.24), 0.06, 0.05);
    if (lod <= 2) {
      const yb = 0.27, yt = 0.92, H = yt - yb, a0 = 0.07, a1 = L - 0.07, span = a1 - a0;
      for (const flip of [0, 1]) for (let s = -H; s < span; s += 0.26) {
        let x0 = s, y0 = yb, x1 = s + H, y1 = yt;
        if (x0 < 0) { y0 = yb - x0; x0 = 0; }
        if (x1 > span) { y1 = yt - (x1 - span); x1 = span; }
        if (y1 - y0 < 0.06) continue;
        const X = (x) => a0 + (flip ? span - x : x);
        beam(ctx, at(X(x0), y0), at(X(x1), y1), 0.03, 0.016);
      }
    } else if (lod === 3) for (let i = 1; i < 4; i++) beam(ctx, at(L * i / 4, 0.26), at(L * i / 4, 0.92), 0.04);
  }
  // bench ring
  for (const q of seats()) {
    prism(ctx, q, 0.42, 0.47);
    if (lod <= 2) { const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; for (const t of [m(q[2], q[3])]) box(ctx, t[0] - 0.05, FL, t[1] - 0.05, t[0] + 0.05, 0.42, t[1] + 0.05); }
  }
  // dome: copper outside, oak ceiling inside
  const J = lod <= 1 ? 6 : lod <= 3 ? 3 : 2, outer = domeRings(J);
  paint(ctx, 'copper', COPPER, 0.55, 0.35);
  if (lod <= 2) { const flare = [0, 1, 2, 3, 4, 5].map((k) => V(RE + 0.12, k, EAVE - 0.1)); dome(ctx, [flare, outer[0], outer[0]]); }
  dome(ctx, outer);
  if (lod <= 2) {
    paint(ctx, 'copper', 'oklch(0.82 0.04 175)', 0.5, 0.4);
    for (let j = 0; j < J - 1; j++) for (let k = 0; k < 6; k++) beam(ctx, outer[j][k], outer[j + 1][k], 0.06, 0.05);
    paint(ctx, 'oak', OAK, 0.8);
    dome(ctx, domeRings(J, 0.95, -0.08));
    for (let k = 0; k < 6; k++) beam(ctx, V(R - 0.08, k, EAVE), [0, APEX - 0.14, 0], 0.07);
  }
  // finial
  paint(ctx, null, 'oklch(0.76 0.11 85)', 0.35, 0.7);
  const fy = APEX - 0.04;
  lathe(ctx, [[0.14, 0], [0.1, 0.07], [0.045, 0.13], [0.045, 0.2], [0, 0.2]], lod <= 2 ? 8 : 4, [0, fy, 0]);
  gem(ctx, 0, fy + 0.3, 0, 0.1, 0.1, 0.1, lod <= 2 ? 8 : 4);
  if (lod <= 3) beam(ctx, [0, fy + 0.38, 0], [0, fy + 0.72, 0], 0.025);
  // lantern on a chain
  if (lod <= 3) {
    paint(ctx, null, 'oklch(0.3 0.01 250)', 0.6, 0.6);
    beam(ctx, [0, APEX - 0.16, 0], [0, 2.4, 0], 0.018);
    lantern(ctx, [0, 1.98, 0], lod);
  }
  ctx.albedo(null);
}
export function collider(ctx) {
  prism(ctx, hex(R + 0.3), -0.2, FL);
  for (let k = 0; k < 6; k++) { const [x, , z] = V(R - 0.08, k); box(ctx, x - 0.09, FL, z - 0.09, x + 0.09, POST, z + 0.09); }
  for (let k = 0; k < 6; k++) if (k !== ENT) beam(ctx, lerp(V(R - 0.08, k, 0.55), V(R - 0.08, k + 1, 0.55), 0.03), lerp(V(R - 0.08, k, 0.55), V(R - 0.08, k + 1, 0.55), 0.97), 0.1, 0.9);
  for (const q of seats()) prism(ctx, q, FL, 0.47);
}
