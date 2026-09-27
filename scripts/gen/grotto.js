// The hidden grotto. params.kind "hollow" (default): a giant fallen hollow log whose mouth (local -Z, at z 0) faces the creek,
// leading into a small mossy stone hideout (z 2.4..6.2) with an open top screened by arching ferns, glowing mushrooms and a
// fairy lantern. "chest": the egg chest's body (front -Z); "lid": its lid, origin on the back hinge, pitch opens it.
import { TAU, paint, obox, beam, solid, prism, ngon, Q, T, box } from '../lib/yard-kit.js';
const LOG = { cy: 0.9, R: 1.35, r: 1.15, z1: 2.4 };
const CH = { x: 1.8, z0: 2.4, z1: 6.2, t: 0.45, h: 1.7 };
function rnd(seed) { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
function log(ctx, lod) {
  const n = lod <= 2 ? 16 : 9, { cy, R, r, z1 } = LOG;
  const P = (rad, a, z) => [Math.cos(a) * rad, cy + Math.sin(a) * rad, z];
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2, top = Math.sin(am) > 0.45;
    if (top) paint(ctx, 'moss', 'oklch(0.9 0.06 130)', 0.95); else paint(ctx, 'walnut', 'oklch(0.72 0.035 55)', 0.95);
    const cO = [Math.cos(am) * -5, cy + Math.sin(am) * -5, z1 / 2];
    Q(ctx, P(R, a0, 0), P(R, a1, 0), P(R, a1, z1), P(R, a0, z1), [0, cy, z1 / 2]);
    paint(ctx, 'oak', 'oklch(0.72 0.05 60)', 0.95);
    Q(ctx, P(r, a0, 0), P(r, a1, 0), P(r, a1, z1), P(r, a0, z1), cO);
    paint(ctx, 'oak', 'oklch(0.9 0.05 75)', 0.9);
    for (const z of [0, z1]) Q(ctx, P(R, a0, z), P(R, a1, z), P(r, a1, z), P(r, a0, z), [Math.cos(am) * 1.25, cy + Math.sin(am) * 1.25, z === 0 ? 1 : z1 - 1]);
  }
  // moss floor through the log
  paint(ctx, 'moss', 'oklch(0.82 0.06 130)', 1);
  box(ctx, -0.8, -0.4, 0, 0.8, 0.06, z1);
  if (lod <= 2) { // a shaggy moss beard hanging over the mouth
    paint(ctx, 'leaf', 'oklch(0.85 0.08 135)', 0.95);
    for (let i = 0; i < 7; i++) { const a = 0.9 + i * 0.22, x = Math.cos(a) * R, y = cy + Math.sin(a) * R; T(ctx, [x - 0.12, y, -0.02], [x + 0.12, y, -0.02], [x, y - 0.35 - (i % 3) * 0.12, -0.05], [x, y, 1]); }
  }
}
function chamber(ctx, lod) {
  const { x, z0, z1, t, h } = CH, R = rnd(3);
  paint(ctx, 'stone', 'oklch(0.86 0.03 110)', 0.95);
  // coursed walls: back, sides, front piers either side of the log
  const course = (x0, z0_, x1, z1_) => { const rows = lod <= 2 ? 3 : 1; for (let k = 0; k < rows; k++) { const y0 = -0.3 + k * (h + 0.3) / rows, y1 = -0.3 + (k + 1) * (h + 0.3) / rows - (lod <= 2 ? 0.02 : 0); paint(ctx, 'stone', ['oklch(0.9 0.03 100)', 'oklch(0.84 0.04 115)', 'oklch(0.93 0.02 90)'][k % 3], 0.95); box(ctx, x0, y0, z0_, x1, y1, z1_); } };
  course(-x - t, z1, x + t, z1 + t);
  course(-x - t, z0, -x, z1);
  course(x, z0, x + t, z1);
  course(-x - t, z0 - t, -1.05, z0);
  course(1.05, z0 - t, x + t, z0);
  // moss cap on the wall tops
  paint(ctx, 'moss', 'oklch(0.9 0.07 130)', 1);
  box(ctx, -x - t - 0.05, h, z1 - 0.05, x + t + 0.05, h + 0.08, z1 + t + 0.05);
  box(ctx, -x - t - 0.05, h, z0 - t, -x + 0.05, h + 0.08, z1);
  box(ctx, x - 0.05, h, z0 - t, x + t + 0.05, h + 0.08, z1);
  // floor
  paint(ctx, 'moss', 'oklch(0.8 0.06 128)', 1);
  box(ctx, -x, -0.4, z0, x, 0.06, z1);
  // earth berm hiding the walls outside
  paint(ctx, 'moss', 'oklch(0.86 0.07 128)', 1);
  const o = 1.3, W = x + t, y = h + 0.08;
  const side = (a, b, c, d) => Q(ctx, a, b, c, d, [0, -2, (z0 + z1) / 2]);
  side([-W, y, z0 - t], [-W, y, z1 + t], [-W - o, -0.05, z1 + t + o], [-W - o, -0.05, z0 - t]);
  side([W, y, z0 - t], [W, y, z1 + t], [W + o, -0.05, z1 + t + o], [W + o, -0.05, z0 - t]);
  side([-W, y, z1 + t], [W, y, z1 + t], [W + o, -0.05, z1 + t + o], [-W - o, -0.05, z1 + t + o]);
  side([-W, y, z0 - t], [-1.3, y, z0 - t], [-1.3, -0.05, z0 - t - 0.9], [-W - o, -0.05, z0 - t]);
  side([W, y, z0 - t], [1.3, y, z0 - t], [1.3, -0.05, z0 - t - 0.9], [W + o, -0.05, z0 - t]);
  // ferns arching over the open top and tufting the berm
  paint(ctx, 'leaf', 'oklch(0.86 0.09 135)', 0.9);
  const frond = (bx, bz, dx, dz, len, rise) => {
    const s = lod <= 2 ? 4 : 2, px = -dz, pz = dx; let prev = null;
    for (let i = 0; i <= s; i++) { const u = i / s, w = 0.22 * Math.sin(Math.PI * (0.15 + 0.85 * u)) + 0.02, cx = bx + dx * len * u, cz = bz + dz * len * u, cyy = y + 0.05 + rise * Math.sin(Math.PI * u * 0.8) - u * u * 0.35;
      const L = [cx + px * w, cyy, cz + pz * w], Rr = [cx - px * w, cyy, cz - pz * w];
      if (prev) { ctx.quad(...prev[0], ...prev[1], ...Rr, ...L); }
      prev = [L, Rr]; }
  };
  const nf = lod <= 2 ? 22 : 10;
  for (let i = 0; i < nf; i++) {
    const side_ = i % 2 ? 1 : -1, bz = z0 - 0.2 + (i / nf) * (z1 - z0 + 0.6), len = 1.5 + R() * 0.8, ang = (R() - 0.5) * 0.6;
    frond(side_ * (x + 0.2), bz, -side_ * Math.cos(ang), Math.sin(ang), len, 0.45 + R() * 0.3);
  }
  for (let i = 0; i < (lod <= 2 ? 6 : 3); i++) frond(-x + i * 0.7, z1 + 0.2, (R() - 0.5) * 0.4, -1, 1.6 + R() * 0.5, 0.5);
  if (lod <= 2) { // fern tufts on the berm and beside the mouth: they break the log's silhouette from the path
    const tuft = (cx, cz, cyy) => { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU + R(), l = 0.7 + R() * 0.4; const e = [cx + Math.cos(a) * l, cyy + 0.45, cz + Math.sin(a) * l], pp = [-Math.sin(a) * 0.14, 0, Math.cos(a) * 0.14];
      ctx.quad(cx + pp[0], cyy, cz + pp[2], cx - pp[0], cyy, cz - pp[2], e[0] - pp[0] * 0.3, e[1], e[2] - pp[2] * 0.3, e[0] + pp[0] * 0.3, e[1], e[2] + pp[2] * 0.3); } };
    for (const [cx, cz] of [[-1.7, -0.5], [1.75, -0.4], [-2.6, 1.2], [2.7, 1.4], [-3.0, 4.5], [3.0, 5.0], [0, 7.3]]) tuft(cx, cz, 0);
    tuft(-0.6, 1.3, 2.2); tuft(0.7, 1.0, 2.2);
  }
  // glowing mushrooms: clusters along the walls (teal, violet)
  const shroom = (cx, cz, s, teal, cyy = 0.06) => {
    paint(ctx, null, 'oklch(0.93 0.03 90)', 0.8); prism(ctx, ngon(5, 0.025 * s, cx, cz), cyy, cyy + 0.12 * s);
    paint(ctx, null, teal ? 'oklch(0.85 0.12 190)' : 'oklch(0.75 0.15 305)', 0.5);
    ctx.emissive(teal ? 'oklch(0.8 0.16 190)' : 'oklch(0.7 0.2 305)');
    const cap = ngon(lod <= 2 ? 7 : 5, 0.075 * s, cx, cz), top = [cx, cyy + 0.19 * s, cz], o2 = [cx, cyy + 0.13 * s, cz];
    for (let i = 0; i < cap.length; i++) { const a = cap[i], b = cap[(i + 1) % cap.length]; T(ctx, [a[0], cyy + 0.11 * s, a[1]], [b[0], cyy + 0.11 * s, b[1]], top, o2); T(ctx, [a[0], cyy + 0.11 * s, a[1]], [b[0], cyy + 0.11 * s, b[1]], [cx, cyy + 0.1 * s, cz], [cx, cyy + 0.5 * s, cz]); }
    ctx.emissive(null);
  };
  const spots = [[-1.6, 2.7], [-1.55, 3.6], [-1.6, 4.9], [-1.2, 6.0], [1.6, 2.8], [1.55, 4.1], [1.6, 5.4], [0.9, 6.0], [-0.4, 6.05], [0.4, 0.5], [-0.55, 2.0]];
  spots.forEach(([cx, cz], i) => { const teal = i % 2 === 0, n = lod <= 2 ? 3 : 1; for (let k = 0; k < n; k++) shroom(cx + (R() - 0.5) * 0.3, cz + (R() - 0.5) * 0.3, 0.7 + R() * 0.9, (teal + k) % 2 === 0); });
  // a tiny linen rug and a stone seat block for the hideout
  paint(ctx, null, 'oklch(0.93 0.03 85)', 1); box(ctx, -0.9, 0.06, 3.2, 0.9, 0.075, 4.6);
  paint(ctx, null, 'oklch(0.62 0.08 190)', 1); box(ctx, -0.8, 0.075, 3.35, 0.8, 0.078, 3.45); box(ctx, -0.8, 0.075, 4.35, 0.8, 0.078, 4.45);
  // fairy lantern on a bent twig over the back-left corner
  paint(ctx, 'walnut', 'oklch(0.7 0.03 55)', 0.95);
  beam(ctx, [-x - 0.2, h + 0.05, z1 - 0.3], [-x + 0.5, h + 0.35, z1 - 0.9], 0.05, 0.05);
  beam(ctx, [-x + 0.5, h + 0.35, z1 - 0.9], [-x + 0.8, h + 0.3, z1 - 1.1], 0.035, 0.035);
  paint(ctx, null, 'oklch(0.35 0.01 250)', 0.5, 0.8);
  beam(ctx, [-x + 0.8, h + 0.3, z1 - 1.1], [-x + 0.8, h - 0.05, z1 - 1.1], 0.01, 0.01);
  obox(ctx, -x + 0.8, h - 0.34, z1 - 1.1, 0.13, 0.02, 0.13); obox(ctx, -x + 0.8, h - 0.08, z1 - 1.1, 0.1, 0.03, 0.1);
  paint(ctx, null, 'oklch(0.95 0.08 85)', 0.3); ctx.emissive('oklch(0.92 0.14 80)');
  obox(ctx, -x + 0.8, h - 0.32, z1 - 1.1, 0.09, 0.24, 0.09);
  ctx.emissive(null);
}
function chest(ctx, lod) {
  const w = 0.62, d = 0.42, hb = 0.3;
  paint(ctx, 'oak', 'oklch(0.95 0.04 75)', 0.8); box(ctx, -w / 2, 0, -d / 2, w / 2, hb, d / 2);
  paint(ctx, null, 'oklch(0.33 0.01 250)', 0.45, 0.8);
  for (const x of [-0.2, 0.2]) box(ctx, x - 0.025, -0.005, -d / 2 - 0.008, x + 0.025, hb, d / 2 + 0.008);
  paint(ctx, 'brass', 'oklch(0.9 0.08 85)', 0.35, 0.9); box(ctx, -0.045, hb - 0.12, -d / 2 - 0.02, 0.045, hb - 0.01, -d / 2);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.85 0.15 90)', 0.4); ctx.emissive('oklch(0.8 0.15 90)'); box(ctx, -w / 2 + 0.03, hb - 0.03, -d / 2 + 0.03, w / 2 - 0.03, hb - 0.005, d / 2 - 0.03); ctx.emissive(null); }
}
function lid(ctx, lod) {
  const w = 0.62, d = 0.42, seg = lod <= 2 ? 6 : 3, rr = d / 2;
  const loop = (x) => { const a = []; for (let i = 0; i <= seg; i++) { const t = Math.PI * i / seg; a.push([x, Math.sin(t) * 0.14, -rr - Math.cos(t) * rr]); } return a; };
  paint(ctx, 'oak', 'oklch(0.9 0.05 70)', 0.8); solid(ctx, loop(-w / 2), loop(w / 2));
  paint(ctx, null, 'oklch(0.33 0.01 250)', 0.45, 0.8);
  for (const x of [-0.2, 0.2]) { const A = loop(x - 0.025).map(p => [p[0], p[1] * 1.06 + 0.003, (p[2] + rr) * 1.03 - rr]), B = loop(x + 0.025).map(p => [p[0], p[1] * 1.06 + 0.003, (p[2] + rr) * 1.03 - rr]); solid(ctx, A, B); }
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  if (p.kind === 'chest') return chest(ctx, lod);
  if (p.kind === 'lid') return lid(ctx, lod);
  log(ctx, lod); if (lod <= 4) chamber(ctx, lod);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'chest') { box(ctx, -0.31, 0, -0.21, 0.31, 0.3, 0.21); return; }
  if (p.kind === 'lid') return null;
  const { x, z0, z1, t, h } = CH;
  box(ctx, -1.35, -0.3, 0, -0.78, 2.1, LOG.z1); box(ctx, 0.78, -0.3, 0, 1.35, 2.1, LOG.z1); box(ctx, -1.35, 2.05, 0, 1.35, 2.3, LOG.z1);
  box(ctx, -x - t, -0.3, z1, x + t, h, z1 + t); box(ctx, -x - t, -0.3, z0, -x, h, z1); box(ctx, x, -0.3, z0, x + t, h, z1);
  box(ctx, -x - t, -0.3, z0 - t, -0.9, h, z0); box(ctx, 0.9, -0.3, z0 - t, x + t, h, z0);
  box(ctx, -x, -0.4, 0, x, 0.06, z1); box(ctx, -0.8, -0.4, 0, 0.8, 0.06, z0);
}
