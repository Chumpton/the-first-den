// The royal cathedral: twin-spired west front (here facing −z, onto the plaza), aisled nave 21 m high with a pointed arcade,
// clerestory and aisle lancets, flying buttresses, a five-sided apse, a glowing rose window, a stepped portal with open doors,
// pews, a candlelit altar before a gold reredos and faint light shafts. Origin: centre line at ground, façade face at z −14.
// Floor at y 0.9 inside; steps z −18..−14. Walkable through the portal.
import { TAU, paint, XF, lathe, Q, T, box, ngon, prism, obox, beam, blob, RC, RT, stone, flat, gold, slate, glow, L, archWall, lancet, faceOut } from '../lib/royal-kit.js';
const FL = 0.9, NW = 21, ZF = -7.5, ZB = 14.5, BAYS = [-7.5, -2, 3.5, 9, 14.5], AR = 6.5;
const ARC = BAYS.slice(0, 4).map((b) => ({ cx: -(b + 2.75), w: 4.1, sill: FL, spring: 6.4, pointed: 1 }));
const PORTAL = { cx: 0, w: 5, sill: FL, spring: 7, pointed: 1 };
const GLASS = [[0.25, 0.4, 1.2], [1.1, 0.3, 0.35], [0.3, 0.55, 1.0], [1.2, 0.85, 0.3]];
const apsePts = () => { const p = []; for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI; p.push([Math.cos(a) * AR, ZB + Math.sin(a) * AR]); } return p; };
function shell(ctx, P, col) {
  const lod = L(ctx), n = col ? 4 : lod <= 2 ? 10 : lod === 3 ? 6 : 3;
  if (!col) stone(ctx);
  // twin towers
  for (const s of [-1, 1]) box(P, s < 0 ? -12.5 : 5.5, 0, -14, s < 0 ? -5.5 : 12.5, 27, -7);
  // façade between the towers with the portal
  archWall(P, -5.5, 5.5, 0, 22, -9.5, -7.5, [PORTAL], n);
  // nave arcade walls (pierced) and the aisles' outer walls
  for (const s of [-1, 1]) {
    const F = XF(P, s * 7, 0, 0, Math.PI / 2);
    archWall(F, -ZB, -ZF, 0, NW, -0.5, 0.5, ARC, n);
    box(P, s < 0 ? -12.5 : 11.5, 0, -7, s < 0 ? -11.5 : 12.5, 11, 15.5);
    box(P, s < 0 ? -11.5 : 7.5, 0, 14.5, s < 0 ? -7.5 : 11.5, 11, 15.5);
  }
  // apse
  const ap = apsePts();
  for (let i = 0; i < 5; i++) { const [x0, z0] = ap[i], [x1, z1] = ap[i + 1], dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ox = mx / AR * 0.5, oz = (mz - ZB) / AR * 0.5;
    obox(P, mx + ox, 0, mz + oz, len + 0.6, NW, 1, Math.atan2(-dz, dx)); }
  // floor and steps
  if (!col) flat(ctx, RC.stone2);
  box(P, -12.5, 0, -7.5, 12.5, FL, 15.5);
  prism(P, ap.map(([x, z]) => [x * 1.05, z]), 0, FL);
  for (let i = 0; i < 5; i++) box(P, -10 + i * 0.3, 0, -18 + i * 0.8, 10 - i * 0.3, (i + 1) * 0.18, -14);
  if (col) { box(P, -1.8, FL, 11.6, 1.8, 2.5, 13); box(P, -5, FL, 10, 5, 1.5, 14.5); return; }
  paint(ctx, RT.flag, 'oklch(0.93 0.02 80)', 0.8); Q(P, [-11.5, FL + 0.005, -7.5], [11.5, FL + 0.005, -7.5], [11.5, FL + 0.005, 14.5], [-11.5, FL + 0.005, 14.5], [0, 0, 0]);
  if (lod <= 2) { paint(ctx, null, RC.blue, 0.5); Q(P, [-1.2, FL + 0.01, -8.5], [1.2, FL + 0.01, -8.5], [1.2, FL + 0.01, 10], [-1.2, FL + 0.01, 10], [0, 0, 0]); gold(ctx); for (const x of [-1.3, 1.2]) Q(P, [x, FL + 0.012, -8.5], [x + 0.1, FL + 0.012, -8.5], [x + 0.1, FL + 0.012, 10], [x, FL + 0.012, 10], [0, 0, 0]); }
}
function roofs(ctx, P) {
  const lod = L(ctx);
  slate(ctx);
  const q = (a, b, c, d) => { ctx.quad(...a, ...b, ...c, ...d); };
  for (const s of [-1, 1]) {
    q([0, 30, ZF], [s * 8.2, 20.4, ZF], [s * 8.2, 20.4, ZB], [0, 30, ZB]);
    q([s * 7.3, 14.6, -7], [s * 13, 10.7, -7], [s * 13, 10.7, 15.7], [s * 7.3, 14.6, 15.7]);
  }
  const ap = apsePts();
  for (let i = 0; i < 5; i++) { const [x0, z0] = ap[i], [x1, z1] = ap[i + 1], k = 8.2 / AR; ctx.tri(0, 30, ZB, x1 * k, 20.4, ZB + (z1 - ZB) * k, x0 * k, 20.4, ZB + (z0 - ZB) * k); }
  // façade gable in stone, gold ridge
  stone(ctx); T(P, [-5.5, 22, -9.5], [5.5, 22, -9.5], [0, 29, -9.5], [0, 25, 0]); T(P, [-5.5, 22, -7.5], [5.5, 22, -7.5], [0, 29, -7.5], [0, 25, -20]);
  Q(P, [-5.5, 22, -9.5], [0, 29, -9.5], [0, 29, -7.5], [-5.5, 22, -7.5], [0, 20, -8.5]); Q(P, [5.5, 22, -9.5], [0, 29, -9.5], [0, 29, -7.5], [5.5, 22, -7.5], [0, 20, -8.5]);
  if (lod <= 3) { gold(ctx); beam(P, [0, 30.1, ZF], [0, 30.1, ZB], 0.25, 0.2); lathe(P, [[0.25, 29], [0.1, 31], [0, 31]], 6, 0, 0, -8.5); beam(P, [-0.7, 30.4, -8.5], [0.7, 30.4, -8.5], 0.14); }
}
function towerTops(ctx, P) {
  const lod = L(ctx), n = lod <= 2 ? 8 : 6;
  for (const s of [-1, 1]) {
    const cx = s * 9;
    stone(ctx, RC.stone2); box(P, cx - 3.8, 26.4, -14.3, cx + 3.8, 27.6, -6.7);
    if (lod <= 3) for (const [dx, dz] of [[-3.1, -3.1], [3.1, -3.1], [-3.1, 3.1], [3.1, 3.1]]) { // corner pinnacles
      stone(ctx); box(P, cx + dx - 0.5, 27.6, -10.5 + dz - 0.5, cx + dx + 0.5, 29.2, -10.5 + dz + 0.5); slate(ctx); lathe(P, [[0.7, 29.2], [0, 32.4]], 4, cx + dx, 0, -10.5 + dz);
      if (lod <= 2) { gold(ctx); lathe(P, [[0.12, 32.3], [0, 33]], 4, cx + dx, 0, -10.5 + dz); } }
    slate(ctx); lathe(P, [[3.3, 27.6], [3.3, 28.4], [1.6, 36], [0, 44]], n, cx, 0, -10.5);
    gold(ctx); lathe(P, [[3.35, 28.2], [3.35, 28.5], [3.3, 28.5]], n, cx, 0, -10.5);
    if (lod <= 3) { lathe(P, [[1.62, 35.8], [1.66, 36.1], [1.58, 36.3]], n, cx, 0, -10.5); lathe(P, [[0.18, 43.8], [0.12, 46], [0, 46]], 4, cx, 0, -10.5); box(P, cx - 0.6, 45, -10.58, cx + 0.6, 45.2, -10.42); }
    if (lod <= 2) { // stepped corner buttresses and string courses
      stone(ctx, RC.stone2);
      for (const dx of [-3.9, 3.9]) { box(P, cx + dx - 0.45, 0, -14.9, cx + dx + 0.45, 18, -13.9); box(P, cx + dx - 0.35, 18, -14.6, cx + dx + 0.35, 24, -13.9); }
      for (const y of [9.5, 17.5]) box(P, cx - 3.6, y, -14.2, cx + 3.6, y + 0.35, -6.8);
    }
  }
}
function windows(ctx, P) {
  const lod = L(ctx);
  if (lod >= 4) return;
  let g = 0; const G = () => GLASS[(g++) % GLASS.length];
  for (const s of [-1, 1]) {
    const cx = s * 9;
    const Fr = XF(P, 0, 0, -14);
    lancet(ctx, Fr, cx, 18.5, 1.6, 6, [0.12, 0.1, 0.09], -0.06, false); lancet(ctx, Fr, cx, 9.8, 1.4, 4.6, G(), -0.06);
    const Fs = faceOut(P, s * 12.5, 0, -10.5, s, 0); lancet(ctx, Fs, 0, 18.5, 1.6, 6, [0.12, 0.1, 0.09], -0.06, false);
    for (let b = 0; b < 4; b++) {
      const zc = BAYS[b] + 2.75, c = G();
      lancet(ctx, faceOut(P, s * 7.5, 0, zc, s, 0), 0, 15.2, 2.2, 4.8, c, -0.05); lancet(ctx, faceOut(P, s * 6.5, 0, zc, -s, 0), 0, 15.2, 2.2, 4.8, c, -0.05);
      lancet(ctx, faceOut(P, s * 12.5, 0, zc, s, 0), 0, 3, 2.3, 6.2, c, -0.05); lancet(ctx, faceOut(P, s * 11.5, 0, zc, -s, 0), 0, 3, 2.3, 6.2, c, -0.05);
    }
  }
  const ap = apsePts();
  for (let i = 0; i < 5; i++) { const [x0, z0] = ap[i], [x1, z1] = ap[i + 1], mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, dx = mx / AR, dz = (mz - ZB) / AR, c = G();
    lancet(ctx, faceOut(P, mx + dx * 1.0, 0, mz + dz * 1.0, dx, dz), 0, 4.2, 2.0, 11, c, -0.05); lancet(ctx, faceOut(P, mx, 0, mz, -dx, -dz), 0, 4.2, 2.0, 11, c, -0.05); }
  // rose window on both faces of the façade
  const N = lod <= 2 ? 16 : 8, cy = 15.6, R = 3.6;
  for (const [zz, sg] of [[-9.56, -1], [-7.44, 1]]) {
    for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU, c = GLASS[i % 2 ? 0 : (i % 4 === 0 ? 1 : 3)];
      paint(ctx, null, RC.glass, 0.25); ctx.emissive(...c);
      const p = (r, t) => [Math.cos(t) * r, cy + Math.sin(t) * r, zz];
      Q(P, p(0.9, a), p(0.9, b), p(R, b), p(R, a), [0, cy, zz - sg]); }
    glow(ctx, 'oklch(0.85 0.14 85)', 1.6, 1.15, 0.4); for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU; P.tri(0, cy, zz + sg * 0.01, Math.cos(a) * 0.9, cy + Math.sin(a) * 0.9, zz + sg * 0.01, Math.cos(b) * 0.9, cy + Math.sin(b) * 0.9, zz + sg * 0.01); }
    stone(ctx, RC.stone2); const z2 = zz + sg * 0.12;
    for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU; const p = (r, t) => [Math.cos(t) * r, cy + Math.sin(t) * r, z2];
      Q(P, p(R, a), p(R, b), p(R + 0.55, b), p(R + 0.55, a), [0, cy, zz - sg]);
      if (lod <= 2) beam(P, [Math.cos(a) * 0.9, cy + Math.sin(a) * 0.9, zz + sg * 0.06], [Math.cos(a) * R, cy + Math.sin(a) * R, zz + sg * 0.06], 0.12, 0.1); }
  }
  // portal: three receding pointed orders, blue tympanum band, gold keystone
  stone(ctx, RC.stone2);
  for (let k = 1; k <= 3; k++) { const w = 5 + k * 0.9, sp = 7 - k * 0.1, zz = -9.5 - (4 - k) * 0.25, h = { cx: 0, w, spring: sp, pointed: 1 }, m = lod <= 2 ? 12 : 6;
    box(P, -w / 2 - 0.45, 0, zz, -w / 2, sp, -9.5); box(P, w / 2, 0, zz, w / 2 + 0.45, sp, -9.5);
    for (let i = 0; i < m; i++) { const xa = -w / 2 + w * i / m, xb = -w / 2 + w * (i + 1) / m; const ya = archY2(h, xa), yb = archY2(h, xb);
      Q(P, [xa * 1.09, ya + 0.1, zz], [xb * 1.09, yb + 0.1, zz], [xb * 1.09, yb + 0.55, zz], [xa * 1.09, ya + 0.55, zz], [0, 0, 0]); } }
  gold(ctx); box(P, -0.35, 11.2, -10.35, 0.35, 12.2, -9.5);
}
function archY2(h, x) { const hw = h.w / 2, d = x - h.cx, c = d < 0 ? hw : -hw; return h.spring + Math.sqrt(Math.max(0, h.w * h.w - (d - c) * (d - c))); }
function buttresses(ctx, P) {
  const lod = L(ctx);
  if (lod >= 4) return;
  for (const s of [-1, 1]) for (const zb of [-2, 3.5, 9]) {
    stone(ctx); box(P, s < 0 ? -14.4 : 12.5, 0, zb - 0.6, s < 0 ? -12.5 : 14.4, 15, zb + 0.6);
    slate(ctx); lathe(P, [[0.75, 15], [0, 18.5]], 4, s * 13.45, 0, zb);
    if (lod <= 2) { gold(ctx); lathe(P, [[0.1, 18.4], [0, 19.1]], 4, s * 13.45, 0, zb); stone(ctx, RC.stone2); box(P, s < 0 ? -14.7 : 12.5, 0, zb - 0.75, s < 0 ? -12.5 : 14.7, 4, zb + 0.75); }
    stone(ctx); const m = lod <= 2 ? 6 : 3;
    for (let i = 0; i < m; i++) { const t0 = i / m, t1 = (i + 1) / m, p = (t) => [s * (13.4 - 5.9 * t), 14.6 + 4.2 * Math.sin(t * Math.PI / 2) - 0.2 * t, zb];
      beam(P, p(t0), p(t1), 0.8, 0.9); }
  }
}
function interior(ctx, P) {
  const lod = L(ctx);
  if (lod >= 4) return;
  // clustered shafts on the arcade piers
  stone(ctx, RC.stone2);
  for (const s of [-1, 1]) for (const zb of BAYS.slice(1, 4)) lathe(P, [[0.75, FL], [0.75, FL + 0.6], [0.55, FL + 0.8], [0.5, 19.5], [0.7, 19.9], [0.7, 20.2], [0, 20.2]], lod <= 2 ? 8 : 5, s * 6.25, 0, zb);
  // pews
  paint(ctx, RT.wood, RC.wood, 0.75);
  for (const [x0, x1] of [[-5.9, -1.4], [1.4, 5.9]]) {
    if (lod === 3) { box(P, x0, FL, -4.8, x1, FL + 0.9, 8.4); continue; }
    for (let zz = -4.8; zz < 8.4; zz += 1.1) {
      box(P, x0, FL + 0.42, zz, x1, FL + 0.48, zz + 0.45); box(P, x0, FL + 0.48, zz + 0.45, x1, FL + 0.95, zz + 0.5);
      box(P, x0, FL, zz - 0.05, x0 + 0.07, FL + 1.0, zz + 0.55); box(P, x1 - 0.07, FL, zz - 0.05, x1, FL + 1.0, zz + 0.55);
    }
  }
  // chancel dais, altar, reredos, candles
  stone(ctx); box(P, -5, FL, 10, 5, FL + 0.3, 14.5); box(P, -4, FL + 0.3, 10.8, 4, FL + 0.6, 14.5);
  flat(ctx, 'oklch(0.97 0.01 90)'); box(P, -1.8, FL + 0.6, 11.6, 1.8, FL + 1.6, 12.9);
  paint(ctx, null, RC.blue, 0.7); box(P, -1.6, FL + 0.7, 11.55, 1.6, FL + 1.55, 11.6);
  gold(ctx); box(P, -1.85, FL + 1.6, 11.55, 1.85, FL + 1.68, 12.95); box(P, -3.2, FL + 0.6, 13.6, 3.2, FL + 7.5, 13.9);
  paint(ctx, null, RC.blueDk, 0.6); for (const x of [-2.2, 0, 2.2]) box(P, x - 0.8, FL + 1.4, 13.55, x + 0.8, FL + 5.6, 13.6);
  gold(ctx); box(P, -0.12, FL + 1.68, 12.2, 0.12, FL + 2.8, 12.4); box(P, -0.45, FL + 2.3, 12.2, 0.45, FL + 2.45, 12.4);
  const candle = (x, y, zz, h) => { flat(ctx, 'oklch(0.96 0.03 90)'); box(P, x - 0.04, y, zz - 0.04, x + 0.04, y + h, zz + 0.04); glow(ctx, 'oklch(0.9 0.15 75)', 3.2, 1.9, 0.6); blob(P, x, y + h, zz, 0.035, 0.08, 0.035, 4); };
  for (let i = 0; i < 6; i++) candle(-1.5 + i * 0.6, FL + 1.68, 12.45, 0.28 + (i % 2) * 0.1);
  for (const x of [-3.2, 3.2]) { gold(ctx); lathe(P, [[0.3, FL + 0.6], [0.06, FL + 0.8], [0.05, FL + 2.3], [0.35, FL + 2.4], [0, FL + 2.4]], 6, x, 0, 12.2); for (const dx of [-0.25, 0, 0.25]) candle(x + dx, FL + 2.4, 12.2, 0.35); }
  // doors thrown open inward, oak with gold studs
  for (const s of [-1, 1]) { const F = XF(P, s * 2.45, FL, -7.5, s * -1.25);
    paint(ctx, RT.wood, 'oklch(0.72 0.08 50)', 0.7); box(F, s < 0 ? 0 : -2.4, 0, 0, s < 0 ? 2.4 : 0, 6.6, 0.18);
    if (lod <= 2) { gold(ctx); for (const y of [1.2, 3.3, 5.4]) box(F, s < 0 ? 0.1 : -2.3, y, -0.03, s < 0 ? 2.3 : -0.1, y + 0.12, 0.21); } }
  // light shafts from the south clerestory onto the nave floor
  if (lod <= 2) { paint(ctx, null, 'oklch(0.98 0.04 85)', 0.9); ctx.color('oklch(0.98 0.04 85)', 0.07); ctx.emissive(0.35, 0.3, 0.2);
    for (const b of [0, 1, 2, 3]) { const zc = BAYS[b] + 2.75; for (const dz of [-0.9, 0.9]) ctx.quad(-6.4, 20, zc + dz, -6.4, 15.5, zc + dz, 3.2, FL + 0.02, zc + dz + 0.3, 5.4, FL + 0.02, zc + dz + 0.3); } }
}
function far(ctx, P) {
  stone(ctx);
  for (const s of [-1, 1]) box(P, s < 0 ? -12.5 : 5.5, 0, -14, s < 0 ? -5.5 : 12.5, 27.6, -7);
  box(P, -7.5, 0, -9.5, 7.5, 21, 14.5); box(P, -12.5, 0, -7, 12.5, 11, 15.5); prism(P, apsePts().map(([x, z]) => [x * 1.05, z]), 0, 21);
  slate(ctx);
  for (const s of [-1, 1]) { ctx.quad(0, 30, -9.5, s * 8.2, 20.4, -9.5, s * 8.2, 20.4, ZB, 0, 30, ZB); lathe(P, [[3.3, 27.6], [0, 44]], 4, s * 9, 0, -10.5); }
  glow(ctx, 'oklch(0.6 0.15 260)', 0.4, 0.5, 1.2); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, b = (i + 1) / 8 * TAU; ctx.tri(0, 15.6, -9.6, Math.cos(b) * 3.6, 15.6 + Math.sin(b) * 3.6, -9.6, Math.cos(a) * 3.6, 15.6 + Math.sin(a) * 3.6, -9.6); }
}
export function geometry(ctx) {
  ctx.flat();
  const P = ctx, lod = L(ctx);
  if (lod >= 4) { far(ctx, P); return; }
  shell(ctx, P, false); roofs(ctx, P); towerTops(ctx, P); windows(ctx, P); buttresses(ctx, P); interior(ctx, P);
}
export function collider(ctx) { shell(ctx, ctx, true); }
