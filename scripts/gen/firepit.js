// The creekside fire pit family. params.kind "pit" (default): a shallow turf bowl, a ring of pale limestone blocks sunk 0.3 m,
// an ash bed and a teepee of charred logs (the flame is the row's fx). "stump": a stump stool; "bench": a split-log bench.
// Stools and bench carry params.seat, so the furniture family's sitPointsOf makes them E-sittable; their front (-Z) faces the fire.
import { TAU, paint, obox, beam, solid, prism, ngon, Q } from '../lib/yard-kit.js';
const STONE = ['oklch(0.95 0.02 85)', 'oklch(0.91 0.025 80)', 'oklch(0.97 0.015 90)'];
function rnd(seed) { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function blocks(ctx, lod, r0 = 0.9, n = 11) {
  const R = rnd(7);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (R() - 0.5) * 0.08, w = 2 * r0 * Math.sin(Math.PI / n) * 0.93, h = 0.5 + R() * 0.08;
    const cx = Math.cos(a) * r0, cz = Math.sin(a) * r0, yaw = -a + Math.PI / 2;
    if (ctx.color) paint(ctx, 'stone', STONE[i % 3], 0.92);
    obox(ctx, cx, -0.3, cz, w, h - 0.03, 0.3, yaw);
    if (lod <= 2 && ctx.color) obox(ctx, cx, -0.3 + h - 0.03, cz, w - 0.05, 0.03, 0.25, yaw); // chamfered cap
  }
}
function pit(ctx, lod) {
  const seg = lod <= 2 ? 22 : 12;
  // turf berm: rises from the lawn to a lip at the stones, then drops into the bowl
  paint(ctx, 'moss', 'oklch(0.9 0.05 125)', 0.95);
  const ring = (r, y) => ngon(seg, r).map(([x, z]) => [x, y, z]);
  const rings = [[1.75, -0.02], [1.35, 0.09], [1.08, 0.12]];
  for (let k = 0; k < rings.length - 1; k++) {
    const A = ring(...rings[k]), B = ring(...rings[k + 1]);
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; Q(ctx, A[i], A[j], B[j], B[i], [0, -3, 0]); }
  }
  // ash bed, sunk
  paint(ctx, null, 'oklch(0.32 0.01 60)', 1);
  prism(ctx, ngon(seg, 0.78), -0.1, -0.02);
  paint(ctx, null, 'oklch(0.2 0.01 40)', 1);
  prism(ctx, ngon(9, 0.42), -0.02, 0.0);
  blocks(ctx, lod);
  // charred teepee + two cross logs
  paint(ctx, 'walnut', 'oklch(0.55 0.03 50)', 0.95);
  const n = 6;
  for (let i = 0; i < n; i++) { const a = i / n * TAU + 0.3; beam(ctx, [Math.cos(a) * 0.5, 0.0, Math.sin(a) * 0.5], [Math.cos(a) * 0.06, 0.62, Math.sin(a) * 0.06], 0.1, 0.1); }
  paint(ctx, null, 'oklch(0.22 0.02 40)', 1);
  beam(ctx, [-0.55, 0.05, -0.12], [0.55, 0.05, 0.14], 0.13, 0.13);
  beam(ctx, [-0.1, 0.12, -0.55], [0.14, 0.12, 0.55], 0.12, 0.12);
  if (lod <= 2) {
    paint(ctx, null, 'oklch(0.7 0.2 45)', 0.6); ctx.emissive('oklch(0.72 0.2 45)');
    for (let i = 0; i < 7; i++) { const a = i * 0.9, r = 0.12 + (i % 3) * 0.1; obox(ctx, Math.cos(a) * r, -0.02, Math.sin(a) * r, 0.09, 0.05, 0.07, a); }
    ctx.emissive(null);
    // a little firewood pile outside the ring
    paint(ctx, 'oak', 'oklch(0.95 0.03 75)', 0.9);
    for (let i = 0; i < 3; i++) beam(ctx, [1.95, 0.08 + (i === 2 ? 0.14 : 0), -1.3 + i * 0.16 + (i === 2 ? 0.08 : 0)], [2.45, 0.08 + (i === 2 ? 0.14 : 0), -0.9 + i * 0.16 + (i === 2 ? 0.08 : 0)], 0.14, 0.14);
    // wrought-iron poker leaning on the ring
    paint(ctx, null, 'oklch(0.33 0.01 250)', 0.5, 0.8);
    beam(ctx, [1.3, 0.02, 0.5], [0.95, 0.5, 0.25], 0.025, 0.025);
  }
}
function stump(ctx, lod, p) {
  const R = rnd(p.seed || 1), seg = lod <= 2 ? 10 : 7, r = p.r || 0.23, h = p.seat || 0.45;
  const poly = ngon(seg, r).map(([x, z]) => [x * (0.92 + R() * 0.12), z * (0.92 + R() * 0.12)]);
  paint(ctx, 'walnut', 'oklch(0.8 0.03 55)', 0.95);
  prism(ctx, poly.map(([x, z]) => [x * 1.35, z * 1.35]), -0.05, 0.1, 0.74, true);
  prism(ctx, poly, 0.08, h - 0.02);
  paint(ctx, 'oak', 'oklch(0.96 0.04 80)', 0.85);
  prism(ctx, poly.map(([x, z]) => [x * 0.94, z * 0.94]), h - 0.02, h);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.72 0.06 70)', 0.9); prism(ctx, ngon(seg, r * 0.45), h, h + 0.004); }
}
function bench(ctx, lod, p) {
  const L = p.width || 1.8, h = p.seat || 0.45, r = 0.21, seg = lod <= 2 ? 7 : 4;
  const loop = (x) => { const a = [[x, h, -r], [x, h, r]]; for (let i = 1; i < seg; i++) { const t = Math.PI * i / seg; a.push([x, h - Math.sin(t) * r * 0.9, Math.cos(t) * r]); } return a; };
  paint(ctx, 'walnut', 'oklch(0.8 0.03 55)', 0.95);
  solid(ctx, loop(-L / 2), loop(L / 2));
  paint(ctx, 'oak', 'oklch(0.97 0.04 80)', 0.8);
  obox(ctx, 0, h, 0, L - 0.04, 0.012, 2 * r - 0.03);
  paint(ctx, 'walnut', 'oklch(0.72 0.03 55)', 0.95);
  for (const x of [-L * 0.33, L * 0.33]) obox(ctx, x, 0, 0, 0.3, h - 0.17, 0.36);
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  if (p.kind === 'stump') stump(ctx, lod, p); else if (p.kind === 'bench') bench(ctx, lod, p); else pit(ctx, lod);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'stump') { prism(ctx, ngon(8, 0.24), 0, p.seat || 0.45); return; }
  if (p.kind === 'bench') { obox(ctx, 0, 0, 0, p.width || 1.8, p.seat || 0.45, 0.42); return; }
  blocks(ctx, 3);
  prism(ctx, ngon(8, 0.6), 0, 0.5); // the fire itself: nobody walks into it
}
