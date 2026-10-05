// Tower Gardens grounds: params.item = paths | fence | border | dressing. Layout lives in scripts/lib/data/tower-gardens.js.
// World coordinates via origin(params.ox, 0, params.oz); feet on the ground (y 0.5).
import { origin, Q, T, box, beam, lathe, gem, leaf, prism, paint, PAL, rnd, TAU, nrm } from "../lib/tg-kit.js";
import { TG } from "../lib/data/tower-gardens.js";
import { softened } from "./soften.js";
const F = (x, y, z) => [x, y, z];
function xf(cx, cz, yaw) { const r = (yaw * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return (lx, ly, lz) => [cx + lx * c + lz * s, ly, cz - lx * s + lz * c]; }
function lboxy(ctx, P, x0, y0, z0, x1, y1, z1) { const [a, b] = [P(x0, y0, (z0 + z1) / 2), P(x1, y0, (z0 + z1) / 2)]; beam(ctx, [a[0], (y0 + y1) / 2, a[2]], [b[0], (y0 + y1) / 2, b[2]], Math.abs(z1 - z0), Math.abs(y1 - y0)); }
// ---------- paths ----------
function band(ctx, pts, w, y) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], d = nrm([bx - ax, 0, bz - az]), s = [-d[2] * w / 2, 0, d[0] * w / 2];
    Q(ctx, [ax - s[0], y, az - s[2]], [bx - s[0], y, bz - s[2]], [bx + s[0], y, bz + s[2]], [ax + s[0], y, az + s[2]], [ax, -1, az]);
  }
  for (let i = 1; i < pts.length - 1; i++) { const [x, z] = pts[i]; Q(ctx, [x - w / 2, y, z - w / 2], [x - w / 2, y, z + w / 2], [x + w / 2, y, z + w / 2], [x + w / 2, y, z - w / 2], [x, -1, z]); }
}
function paths(ctx) {
  const lod = ctx.lod, R = rnd(11), W = TG.flagWidth;
  paint(ctx, PAL.gravel);
  for (const [x0, z0, x1, z1] of TG.gravel) box(ctx, x0, 0, z0, x1, 0.035, z1);
  { const [x0, z0, x1, z1] = TG.court; box(ctx, x0, 0, z0, x1, 0.035, z1); }
  for (const L of TG.flagLines) band(ctx, L, W, 0.02);
  if (lod >= 3) return;
  paint(ctx, PAL.oakDark); // edging boards on the gravel aisles
  for (const [x0, z0, x1, z1] of TG.gravel) { box(ctx, x0, 0, z0 - 0.03, x1, 0.07, z0 + 0.03); box(ctx, x0, 0, z1 - 0.03, x1, 0.07, z1 + 0.03); }
  // flagstones along every flag line, two abreast, irregular
  const stones = [[], [], []];
  for (const L of TG.flagLines) for (let i = 0; i < L.length - 1; i++) {
    const [ax, az] = L[i], [bx, bz] = L[i + 1], len = Math.hypot(bx - ax, bz - az), d = [(bx - ax) / len, (bz - az) / len], n = Math.max(1, Math.round(len / 0.56));
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n * len; for (const off of [-0.26, 0.26]) stones[Math.floor(R() * 3)].push([ax + d[0] * t - d[1] * off + (R() - 0.5) * 0.06, az + d[1] * t + d[0] * off + (R() - 0.5) * 0.06, R()]); }
  }
  stones.forEach((list, pi) => { paint(ctx, PAL.stone[pi]);
    for (const [x, z, r0] of list) { const n = lod <= 1 ? 6 : 4, rr = rnd(Math.floor(r0 * 1e6)), top = 0.05 + rr() * 0.02, poly = [];
      for (let i = n - 1; i >= 0; i--) { const a = (i / n) * TAU + r0 * 2, r = 0.2 + rr() * 0.06; poly.push([x + Math.cos(a) * r, top, z + Math.sin(a) * r]); }
      prism(ctx, poly, [0, -top, 0]); } });
}
// ---------- fence + gate arch ----------
function fence(ctx) {
  const lod = ctx.lod, H = TG.fence.h, R = rnd(5);
  paint(ctx, PAL.white);
  for (const [[ax, az], [bx, bz]] of TG.fence.runs) {
    const len = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / len, dz = (bz - az) / len, P = (t, y, o = 0) => [ax + dx * t - dz * o, y, az + dz * t + dx * o];
    if (lod >= 4) { const a = P(0, 0), b = P(len, 0); beam(ctx, [a[0], H / 2, a[2]], [b[0], H / 2, b[2]], 0.05, H, false); continue; }
    const np = Math.max(1, Math.round(len / 2)); for (let i = 0; i <= np; i++) { const p = P((i / np) * len, 0); beam(ctx, [p[0], 0, p[2]], [p[0], H + 0.12, p[2]], 0.09, 0.09); if (lod <= 2) lathe(ctx, [p[0], H + 0.12, p[2]], [[0.05, 0], [0.06, 0.04], [0, 0.1]], 4); }
    for (const y of [0.3, 0.75]) { const a = P(0, y, 0.05), b = P(len, y, 0.05); beam(ctx, a, b, 0.03, 0.07, false); }
    if (lod === 3) { const a = P(0, 0, 0.08), b = P(len, 0, 0.08); beam(ctx, [a[0], (H - 0.1) / 2 + 0.08, a[2]], [b[0], (H - 0.1) / 2 + 0.08, b[2]], 0.02, H - 0.1, false); continue; }
    const step = 0.13, nk = Math.floor((len - 0.1) / step);
    for (let k = 0; k < nk; k++) { const t = 0.1 + k * step + step / 2, a = P(t - 0.035, 0.08, 0.08), b = P(t + 0.035, 0.08, 0.08), h = H - 0.08 - 0.07;
      const poly = [[a[0], 0.08, a[2]], [b[0], 0.08, b[2]], [b[0], 0.08 + h, b[2]], [(a[0] + b[0]) / 2, H, (a[2] + b[2]) / 2], [a[0], 0.08 + h, a[2]]];
      prism(ctx, poly, [-dz * 0.02, 0, dx * 0.02]); }
  }
  // rose arch at the west gate (x = 42, z -23 .. -21), a double hoop trellis
  const gz0 = -23, gz1 = -21, gc = -22, spring = 2.1, rad = 1.0, ns = lod <= 2 ? 10 : 5;
  for (const x of [41.8, 42.2]) {
    for (const z of [gz0, gz1]) beam(ctx, [x, 0, z], [x, spring, z], 0.1, 0.1);
    for (let i = 0; i < ns; i++) { const a0 = Math.PI - (i / ns) * Math.PI, a1 = Math.PI - ((i + 1) / ns) * Math.PI; beam(ctx, [x, spring + rad * Math.sin(a0), gc + rad * Math.cos(a0)], [x, spring + rad * Math.sin(a1), gc + rad * Math.cos(a1)], 0.08, 0.08, false); }
  }
  for (const z of [gz0, gz1]) for (let y = 0.4; y < spring; y += 0.45) beam(ctx, [41.8, y, z], [42.2, y, z], 0.04, 0.04, false);
  for (let i = 0; i <= ns; i++) { const a = Math.PI - (i / ns) * Math.PI; beam(ctx, [41.8, spring + rad * Math.sin(a), gc + rad * Math.cos(a)], [42.2, spring + rad * Math.sin(a), gc + rad * Math.cos(a)], 0.04, 0.04, false); }
  beam(ctx, [41.8, spring, gz0], [41.8, spring, gz1], 0.05, 0.05, false); // the plaque hangs from this bar
  if (lod >= 4) return;
  // climbing roses: leaves then blooms up the posts and over the arch
  const spots = []; for (const z of [gz0, gz1]) for (let y = 0.2; y < spring; y += lod <= 2 ? 0.16 : 0.35) spots.push([42 + (R() - 0.5) * 0.5, y, z + (R() - 0.5) * 0.25]);
  for (let i = 0; i <= ns * 2; i++) { const a = Math.PI - (i / (ns * 2)) * Math.PI; spots.push([42 + (R() - 0.5) * 0.5, spring + (rad + 0.05) * Math.sin(a), gc + (rad + 0.05) * Math.cos(a)]); }
  paint(ctx, PAL.leaf2); for (const [x, y, z] of spots) gem(ctx, [x, y, z], 0.17, 0.13, 0.15, 5, R() * 3);
  paint(ctx, { col: 'oklch(0.7 0.16 355)', rough: 0.6 }); for (const [x, y, z] of spots) if (R() < 0.7) gem(ctx, [x + (R() - 0.5) * 0.25, y + 0.06, z + (R() - 0.5) * 0.2], 0.06, 0.05, 0.06, 4, R());
  paint(ctx, { col: 'oklch(0.95 0.025 90)', rough: 0.6 }); for (const [x, y, z] of spots) if (R() < 0.4) gem(ctx, [x + (R() - 0.5) * 0.3, y - 0.05, z + (R() - 0.5) * 0.2], 0.055, 0.045, 0.055, 4, R());
}
// ---------- cottage-flower borders ----------
function border(ctx) {
  const lod = ctx.lod, R = rnd(23), leaves = [], heads = TG.flowers.map(() => []), spikes = [];
  const sp = lod <= 1 ? 0.38 : lod === 2 ? 0.55 : 0.9;
  for (const [x0, z0, x1, z1, back] of TG.border) {
    const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0), len = alongX ? x1 - x0 : z1 - z0, wid = alongX ? z1 - z0 : x1 - x0;
    const rows = Math.max(1, Math.round(Math.abs(wid) / 0.28)), backHi = back === '+z' || back === '+x';
    for (let r = 0; r < rows; r++) for (let t = sp / 2 + R() * 0.1; t < len; t += sp * (0.8 + R() * 0.4)) {
      const across = rows === 1 ? 0.5 : r / (rows - 1), u = (alongX ? x0 : z0) + t, v = (alongX ? z0 : x0) + wid * (0.2 + 0.6 * across);
      const x = alongX ? u : v, z = alongX ? v : u, isBack = backHi ? across > 0.5 : across < 0.5;
      const h = 0.16 + R() * 0.1; leaves.push([x, h * 0.6, z, 0.17 + R() * 0.06, h * 0.6]);
      const ci = Math.floor(R() * heads.length);
      if (isBack && R() < 0.45 && lod <= 2) spikes.push([x, z, ci, 0.55 + R() * 0.35]);
      else for (let k = 0; k < (lod <= 1 ? 3 : 2); k++) heads[ci].push([x + (R() - 0.5) * 0.24, h + 0.05 + R() * 0.18, z + (R() - 0.5) * 0.24]);
    }
  }
  paint(ctx, PAL.leaf); for (const [x, y, z, r, ry] of leaves) gem(ctx, [x, y, z], r, ry, r, lod <= 2 ? 5 : 3, x * 3);
  if (lod >= 4) return;
  heads.forEach((list, ci) => { paint(ctx, { col: TG.flowers[ci], rough: 0.7 });
    for (const [x, y, z] of list) gem(ctx, [x, y, z], 0.055, 0.035, 0.055, lod <= 2 ? 4 : 3, x + z);
    for (const [x, z, sc, h] of spikes) if (sc === ci) for (let k = 0; k < 4; k++) gem(ctx, [x, h * (0.45 + k * 0.15), z], 0.06 - k * 0.01, 0.06, 0.06 - k * 0.01, 4, k); });
  paint(ctx, PAL.leaf2); for (const [x, z, , h] of spikes) beam(ctx, [x, 0.1, z], [x, h * 0.45, z], 0.02, 0.02, false);
}
// ---------- dressing ----------
function pot(ctx, x, y, z, s, seg) { lathe(ctx, [x, y, z], [[0.07 * s, 0], [0.1 * s, 0.14 * s], [0.118 * s, 0.14 * s], [0.118 * s, 0.175 * s], [0.1 * s, 0.175 * s]], seg); }
function dressing(ctx) {
  const lod = ctx.lod, R = rnd(41), P = TG.props, seg = lod <= 2 ? 8 : 5;
  if (lod >= 4) { // far: blocks for the big pieces
    paint(ctx, PAL.oakDark); { const [x0, z0, x1, z1] = P.bins; box(ctx, x0, 0, z0, x1, 0.9, z1); }
    paint(ctx, PAL.oak); for (const [x, z, yaw] of P.benches) { const L = xf(x, z, yaw); lboxy(ctx, L, -0.8, 0.4, -0.22, 0.8, 0.46, 0.22); }
    paint(ctx, PAL.iron); lathe(ctx, [P.butt[0], 0, P.butt[1]], [[0.36, 0], [0.4, 0.95], [0, 0.95]], 5);
    return;
  }
  // compost bins: three slatted bays
  { const [x0, z0, x1, z1] = P.bins, bw = (x1 - x0) / 3, h = 0.9;
    paint(ctx, PAL.oakDark);
    for (let i = 0; i <= 3; i++) { const x = x0 + i * bw; for (const z of [z0 + 0.05, z1 - 0.05]) beam(ctx, [x, 0, z], [x, h + 0.05, z], 0.08, 0.08);
      for (let y = 0.08; y < h; y += lod <= 2 ? 0.17 : 0.34) beam(ctx, [x, y, z0 + 0.05], [x, y, z1 - 0.05], 0.03, 0.12, false); }
    for (let y = 0.08; y < h; y += lod <= 2 ? 0.17 : 0.34) beam(ctx, [x0, y, z0 + 0.05], [x1, y, z0 + 0.05], 0.03, 0.12, false);
    for (let y = 0.08; y < 0.45; y += 0.17) beam(ctx, [x0, y, z1 - 0.05], [x1, y, z1 - 0.05], 0.03, 0.12, false);
    paint(ctx, PAL.soil); for (let i = 0; i < 3; i++) gem(ctx, [x0 + (i + 0.5) * bw, 0.25 + i * 0.12, (z0 + z1) / 2], bw * 0.45, 0.3 + i * 0.1, 0.4, 6, i);
    paint(ctx, PAL.straw); gem(ctx, [x0 + 2.5 * bw, 0.62, (z0 + z1) / 2], bw * 0.3, 0.12, 0.25, 5, 1);
    paint(ctx, PAL.leaf); gem(ctx, [x0 + 1.5 * bw, 0.55, (z0 + z1) / 2 + 0.05], 0.3, 0.1, 0.2, 5, 2); }
  // water butt + tap + watering can
  { const [x, z] = P.butt; paint(ctx, PAL.oak); lathe(ctx, [x, 0, z], [[0.34, 0], [0.4, 0.45], [0.36, 0.95], [0.33, 0.95]], seg);
    paint(ctx, PAL.iron); for (const y of [0.15, 0.8]) lathe(ctx, [x, y, z], [[0.375 + (y > 0.5 ? -0.01 : 0), 0], [0.39, 0.04]], seg);
    lathe(ctx, [x, 0.95, z], [[0.36, 0], [0.36, 0.03], [0, 0.03]], seg);
    paint(ctx, PAL.stone[1]); box(ctx, x - 0.4, 0, z - 0.4, x + 0.4, 0.12, z + 0.4);
    paint(ctx, PAL.zinc); beam(ctx, [x - 0.36, 0.25, z - 0.1], [x - 0.48, 0.25, z - 0.1], 0.04, 0.04); }
  { const [x, z] = P.can; paint(ctx, PAL.zinc); lathe(ctx, [x, 0, z], [[0.12, 0], [0.12, 0.26], [0.06, 0.3]], seg);
    beam(ctx, [x - 0.08, 0.06, z], [x - 0.34, 0.3, z], 0.03, 0.03); beam(ctx, [x, 0.3, z - 0.02], [x + 0.1, 0.36, z - 0.02], 0.02, 0.02); beam(ctx, [x + 0.1, 0.36, z - 0.02], [x + 0.12, 0.2, z - 0.02], 0.02, 0.02); }
  // scarecrow facing the tower (west), arms along z
  { const [x, z] = P.scarecrow; paint(ctx, PAL.oakDark); beam(ctx, [x, 0, z], [x, 1.75, z], 0.07, 0.07); beam(ctx, [x, 1.35, z - 0.75], [x, 1.35, z + 0.75], 0.06, 0.06);
    paint(ctx, { col: 'oklch(0.62 0.09 200)', rough: 0.9 }); box(ctx, x - 0.13, 0.85, z - 0.24, x + 0.13, 1.45, z + 0.24, false); beam(ctx, [x, 1.35, z - 0.62], [x, 1.35, z + 0.62], 0.16, 0.14);
    paint(ctx, PAL.burlap); gem(ctx, [x, 1.68, z], 0.15, 0.17, 0.15, 6, 0.3); box(ctx, x - 0.12, 0.55, z - 0.2, x + 0.12, 0.85, z + 0.2, false);
    paint(ctx, PAL.straw); lathe(ctx, [x, 1.78, z], [[0.34, 0], [0.34, 0.02], [0.15, 0.03], [0.13, 0.2], [0, 0.22]], seg);
    for (const s of [-1, 1]) gem(ctx, [x, 1.33, z + s * 0.72], 0.06, 0.08, 0.08, 4, s); gem(ctx, [x, 0.5, z], 0.1, 0.08, 0.16, 4, 0);
    paint(ctx, { col: 'oklch(0.66 0.15 30)', rough: 0.9 }); gem(ctx, [x - 0.12, 1.5, z], 0.04, 0.1, 0.16, 4, 0.8);
    paint(ctx, PAL.tray); for (const s of [-1, 1]) gem(ctx, [x - 0.14, 1.71, z + s * 0.05], 0.015, 0.02, 0.02, 3, 0); }
  // wheelbarrow with a load of soil
  { const [bx, bz] = P.barrow, L = xf(bx, bz, 20); paint(ctx, { col: 'oklch(0.55 0.09 160)', rough: 0.6, metal: 0.3 });
    const tr = (lx, ly, lz) => L(lx, ly, lz), top = 0.62, bot = 0.32;
    const c = [[-0.3, top, -0.4], [0.3, top, -0.4], [0.3, top, 0.35], [-0.3, top, 0.35]], b = [[-0.2, bot, -0.25], [0.2, bot, -0.25], [0.2, bot, 0.25], [-0.2, bot, 0.25]];
    const o = tr(0, 0.45, 0); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; Q(ctx, tr(...c[i]), tr(...c[j]), tr(...b[j]), tr(...b[i]), o); } Q(ctx, tr(...b[0]), tr(...b[1]), tr(...b[2]), tr(...b[3]), o);
    paint(ctx, PAL.soil); gem(ctx, tr(0, 0.6, 0), 0.26, 0.08, 0.34, 6, 0);
    paint(ctx, PAL.oak); for (const s of [-1, 1]) { beam(ctx, tr(s * 0.22, 0.3, -0.5), tr(s * 0.27, 0.55, 0.85), 0.05, 0.05); beam(ctx, tr(s * 0.2, 0, 0.35), tr(s * 0.2, 0.35, 0.3), 0.04, 0.04); }
    paint(ctx, PAL.tray); { const n = seg, cw = tr(0, 0.18, -0.55); for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      beam(ctx, tr(0, 0.18 + Math.cos(a0) * 0.18, -0.55 + Math.sin(a0) * 0.18), tr(0, 0.18 + Math.cos(a1) * 0.18, -0.55 + Math.sin(a1) * 0.18), 0.08, 0.05, false); } } }
  // stacks of terracotta pots
  paint(ctx, PAL.terra);
  for (const [x, z] of P.pots) { for (let k = 0; k < 5; k++) pot(ctx, x, k * 0.055, z, 1.6, seg); pot(ctx, x + 0.33, 0, z + 0.12, 1.3, seg); pot(ctx, x + 0.3, 0, z - 0.25, 2.1, seg); pot(ctx, x - 0.05, 0, z + 0.4, 1.2, seg); }
  paint(ctx, PAL.leaf); for (const [x, z] of P.pots) { gem(ctx, [x + 0.3, 0.42, z - 0.25], 0.2, 0.16, 0.2, 6, 1); gem(ctx, [x - 0.05, 0.24, z + 0.4], 0.1, 0.08, 0.1, 5, 2); }
  paint(ctx, { col: 'oklch(0.8 0.14 70)', rough: 0.7 }); for (const [x, z] of P.pots) for (let k = 0; k < 4; k++) gem(ctx, [x + 0.3 + (R() - 0.5) * 0.25, 0.55, z - 0.25 + (R() - 0.5) * 0.25], 0.045, 0.03, 0.045, 4, k);
  // benches
  for (const [x, z, yaw] of P.benches) { const L = xf(x, z, yaw); paint(ctx, PAL.oak);
    for (let k = 0; k < 4; k++) lboxy(ctx, L, -0.8, 0.42, -0.22 + k * 0.11, 0.8, 0.46, -0.14 + k * 0.11);
    for (let k = 0; k < 3; k++) { const a = L(-0.8, 0.58 + k * 0.13, 0.24), b = L(0.8, 0.58 + k * 0.13, 0.24); beam(ctx, a, b, 0.03, 0.09); }
    paint(ctx, PAL.oakDark); for (const sx of [-0.7, 0.7]) { beam(ctx, L(sx, 0, -0.18), L(sx, 0.42, -0.18), 0.06, 0.06); beam(ctx, L(sx, 0, 0.22), L(sx, 0.95, 0.26), 0.06, 0.06); beam(ctx, L(sx, 0.62, -0.2), L(sx, 0.62, 0.24), 0.06, 0.05); } }
  // string-lantern poles along the main walk, warm bulbs on sagging wires
  { const poles = P.poles; paint(ctx, PAL.oakDark); for (const [x, z] of poles) { beam(ctx, [x, 0, z], [x, 2.6, z], 0.08, 0.08); }
    const wire = [], bulbs = []; for (let i = 0; i < poles.length - 1; i++) { const [ax, az] = poles[i], [bx, bz] = poles[i + 1], n = lod <= 2 ? 10 : 4;
      for (let k = 0; k < n; k++) { const t0 = k / n, t1 = (k + 1) / n, y = (t) => 2.5 - 0.4 * 4 * t * (1 - t); wire.push([[ax + (bx - ax) * t0, y(t0), az + (bz - az) * t0], [ax + (bx - ax) * t1, y(t1), az + (bz - az) * t1]]); }
      for (let k = 1; k < 9; k++) { const t = k / 9; bulbs.push([ax + (bx - ax) * t, 2.5 - 1.6 * t * (1 - t) - 0.07, az + (bz - az) * t]); } }
    paint(ctx, PAL.wire); for (const [a, b] of wire) beam(ctx, a, b, 0.015, 0.015, false);
    paint(ctx, { col: 'oklch(0.95 0.08 85)', rough: 0.4, em: [2.6, 1.7, 0.7] }); for (const p of bulbs) gem(ctx, p, 0.045, 0.06, 0.045, 4, 0.4); }
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params; origin(p.ox ?? 0, 0, p.oz ?? 0);
  ({ paths, fence, border, dressing })[p.item]?.(ctx);
});
export function collider(ctx) {
  const p = ctx.params; origin(p.ox ?? 0, 0, p.oz ?? 0);
  if (p.item === "fence") {
    for (const [[ax, az], [bx, bz]] of TG.fence.runs) box(ctx, Math.min(ax, bx) - 0.06, 0, Math.min(az, bz) - 0.06, Math.max(ax, bx) + 0.06, TG.fence.h, Math.max(az, bz) + 0.06);
    for (const z of [-23, -21]) box(ctx, 41.72, 0, z - 0.06, 42.28, 2.1, z + 0.06);
    return;
  }
  if (p.item === "dressing") {
    const P = TG.props, [x0, z0, x1, z1] = P.bins; box(ctx, x0, 0, z0, x1, 0.95, z1);
    box(ctx, P.butt[0] - 0.4, 0, P.butt[1] - 0.4, P.butt[0] + 0.4, 0.95, P.butt[1] + 0.4);
    box(ctx, P.scarecrow[0] - 0.12, 0, P.scarecrow[1] - 0.12, P.scarecrow[0] + 0.12, 1.8, P.scarecrow[1] + 0.12);
    box(ctx, P.barrow[0] - 0.45, 0, P.barrow[1] - 0.6, P.barrow[0] + 0.45, 0.6, P.barrow[1] + 0.6);
    for (const [x, z, yaw] of P.benches) { const hx = yaw ? 0.3 : 0.85, hz = yaw ? 0.85 : 0.3; box(ctx, x - hx, 0, z - hz, x + hx, 0.46, z + hz); }
    return;
  }
  return null;
}
