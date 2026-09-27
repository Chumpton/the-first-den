// Open hexagonal honey-oak gazebo: limestone plinth, six posts, lattice rails with the entrance (−Z side) open,
// a round limestone bench ring round a birdbath fountain, a stone entrance step, a verdigris copper dome with a brass finial and a hanging lantern. Feet at plinth base centre.
import { beam, lathe, lantern, paint, prism, box, gem, Q, T, solid } from '../lib/garden-kit.js';
const R = 2.05, POST = 2.42, EAVE = 2.5, RE = 2.6, APEX = 3.55, ENT = 4, FL = 0.1;
export const GZ = { R, POST, EAVE, RE, APEX, ENT, FL };
const ang = (k) => k * Math.PI / 3;
const V = (r, k, y = 0) => [Math.cos(ang(k)) * r, y, Math.sin(ang(k)) * r];
const hex = (r) => [0, 1, 2, 3, 4, 5].map((k) => [Math.cos(ang(k)) * r, Math.sin(ang(k)) * r]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const OAK = 'oklch(0.95 0.03 75)', STONE = 'oklch(0.94 0.015 85)', COPPER = 'oklch(0.95 0.03 170)';
// round stone bench ring in the middle: three arcs, gaps toward the entrance and the two back corners
const BR0 = 0.58, BR1 = 0.9, BH = 0.44, GAPS = [-Math.PI / 2, Math.PI / 6, 5 * Math.PI / 6], GW = 0.38;
export const BATH = { top: 0.9 }; // spout tip height above feet
function arcs(n, r0, r1) { // convex trapezoids along each bench arc
  const out = [];
  for (let i = 0; i < 3; i++) {
    const a0 = GAPS[i] + GW, a1 = GAPS[(i + 1) % 3] + (i === 2 ? Math.PI * 2 : 0) - GW;
    for (let j = 0; j < n; j++) {
      const b0 = a0 + (a1 - a0) * j / n, b1 = a0 + (a1 - a0) * (j + 1) / n, P = (r, b) => [Math.cos(b) * r, Math.sin(b) * r];
      out.push([P(r0, b0), P(r1, b0), P(r1, b1), P(r0, b1)]);
    }
  }
  return out;
}
const STEP = [[-1.42, -2.0], [1.42, -2.0], [1.42, -2.64], [-1.42, -2.64]];
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
  // entrance step
  paint(ctx, 'stone', STONE, 0.9); prism(ctx, STEP, g + 0.1, 0.05);
  // round stone bench ring: pedestal under an overhanging seat slab
  paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.9);
  if (lod <= 2) { for (const q of arcs(lod <= 1 ? 5 : 3, BR0 + 0.07, BR1 - 0.07)) prism(ctx, q, FL, BH - 0.07); for (const q of arcs(lod <= 1 ? 5 : 3, BR0 - 0.02, BR1 + 0.03)) prism(ctx, q, BH - 0.07, BH); }
  else for (const q of arcs(2, BR0, BR1)) prism(ctx, q, FL, BH);
  // birdbath fountain: pedestal, bowl, still teal water, a little spout
  const bn = lod <= 1 ? 12 : lod <= 3 ? 8 : 5, c0 = [0, FL, 0];
  paint(ctx, 'stone', 'oklch(0.9 0.02 85)', 0.85);
  lathe(ctx, [[0.2, 0], [0.2, 0.06], [0.12, 0.1], [0.08, 0.16], [0.07, 0.5], [0.1, 0.58], [0.28, 0.68], [0.31, 0.74], [0.27, 0.75], [0.25, 0.63]], bn, c0);
  if (lod <= 3) {
    ctx.albedo(null); ctx.color('oklch(0.64 0.09 195)'); ctx.roughness(0.06); ctx.metalness(0.15); ctx.emissive(null);
    lathe(ctx, [[0, 0.72], [0.272, 0.72]], bn, c0);
    paint(ctx, 'stone', 'oklch(0.88 0.02 85)', 0.85);
    lathe(ctx, [[0.06, 0.6], [0.035, 0.7], [0.03, 0.74], [0.055, 0.78], [0, BATH.top - FL]], bn > 6 ? 6 : 4, c0);
  }
  if (lod <= 1) { paint(ctx, null, 'oklch(0.55 0.06 60)', 0.8); gem(ctx, 0.26, FL + 0.8, 0.08, 0.04, 0.035, 0.03, 5); gem(ctx, 0.29, FL + 0.84, 0.09, 0.022, 0.02, 0.015, 4); }
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
  prism(ctx, STEP, -0.2, 0.05);
  for (const q of arcs(2, BR0, BR1)) prism(ctx, q, FL, BH);
  box(ctx, -0.3, FL, -0.3, 0.3, FL + 0.76, 0.3);
}
