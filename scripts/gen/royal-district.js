// The royal district south of the castle stair (z 148..222 on the x = 0 axis). params.part picks one piece:
// 'gate' (twin towers + arched gatehouse), 'walls' (crenellated curtain walls and towers), 'bridge' (moat quays, bridge, statue plinths),
// 'avenue' (white flagstone avenue, patterned plaza, lamps, planter trees, banner poles), 'fountain' (plaza fountain with the gold lion).
// Every part but the fountain has its origin at world (0, 0.5, 190): local = world − (0, 0.5, 190). The fountain's origin is its centre.
import { TAU, paint, XF, lathe, Q, T, box, ngon, prism, obox, beam, blob, RC, RT, stone, flat, gold, slate, glow, L, archWall, crenels, lancet, tower, planterTree, lampPost, bannerPole, faceOut } from '../lib/royal-kit.js';
const OZ = 190, z = (wz) => wz - OZ;
const rng = (seed) => { let s = seed >>> 0 || 7; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
function top(P, x0, z0, x1, z1, y) { Q(P, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [(x0 + x1) / 2, y - 1, (z0 + z1) / 2]); }

function gate(ctx, P, col) {
  const lod = L(ctx), zA = z(160.3), zB = z(164.5), H = 15;
  if (!col) {
    stone(ctx);
    archWall(P, -6.6, 6.6, 0, H, zA, zB, [{ cx: 0, w: 10, sill: 0, spring: 6 }], lod <= 2 ? 12 : lod === 3 ? 6 : 3);
    tower(ctx, P, -10.5, z(162), 4.8, -2.2, 22, { cone: 11, courses: [8, 15] });
    tower(ctx, P, 10.5, z(162), 4.8, -2.2, 22, { cone: 11, courses: [8, 15] });
    if (lod <= 3) { stone(ctx, RC.stone2); crenels(P, -6.6, 6.6, H, zA - 0.2, zA + 0.5); crenels(P, -6.6, 6.6, H, zB - 0.5, zB + 0.2); box(P, -6.8, H - 0.6, zA - 0.3, 6.8, H, zB + 0.3); }
    if (lod <= 2) {
      // arch voussoir band, keystone crest, raised portcullis, gold lion shield
      stone(ctx, RC.shade);
      for (let i = 0; i < 13; i++) { const a = Math.PI * i / 13, b = Math.PI * (i + 1) / 13, r0 = 5, r1 = 5.9; const p = (r, t) => [Math.cos(t) * r, 6 + Math.sin(t) * r];
        const A = p(r0, a), B = p(r0, b), C = p(r1, b), D = p(r1, a); Q(P, [A[0], A[1], zA - 0.15], [B[0], B[1], zA - 0.15], [C[0], C[1], zA - 0.15], [D[0], D[1], zA - 0.15], [0, 6, zA + 1]); }
      paint(ctx, null, RC.blue, 0.6); box(P, -1.4, 11.3, zA - 0.35, 1.4, 14.2, zA - 0.1);
      gold(ctx); box(P, -1.55, 11.15, zA - 0.3, 1.55, 11.35, zA - 0.12); box(P, -1.55, 14.1, zA - 0.3, 1.55, 14.3, zA - 0.12);
      lion2d(P, 0, 12.75, zA - 0.4, 1.2);
      paint(ctx, null, RC.iron, 0.5, 0.7);
      for (let x = -4.5; x <= 4.51; x += 1) beam(P, [x, 9.4, z(162.4)], [x, archY0(x), z(162.4)], 0.12);
      for (let y = 9.6; y < 11; y += 0.7) beam(P, [-Math.sqrt(Math.max(0, 25 - (y - 6) ** 2)) + 0.1, y, z(162.4)], [Math.sqrt(Math.max(0, 25 - (y - 6) ** 2)) - 0.1, y, z(162.4)], 0.1);
      // gold rings on the towers' cones
      gold(ctx); for (const x of [-10.5, 10.5]) lathe(P, [[5.72, 23.7], [5.8, 23.9], [5.72, 24.1]], 20, x, 0, z(162));
    }
  } else {
    archWall(P, -6.6, 6.6, 0, H, zA, zB, [{ cx: 0, w: 10, sill: 0, spring: 6 }], 4);
    for (const x of [-10.5, 10.5]) prism(P, ngon(8, 4.9, x, z(162)), -2.2, 22);
  }
}
const archY0 = (x) => 6 + Math.sqrt(Math.max(0, 25 - x * x)) - 0.05;
// a rampant lion in gold on a plane facing −z
function lion2d(P, cx, cy, zz, s) {
  const polys = [[[-.15, -.35], [.2, -.3], [.25, .25], [-.1, .3]], [[-.1, .3], [.25, .25], [.3, .55], [0, .6]], [[0, .6], [.3, .55], [.42, .7], [.1, .8]],
    [[.25, .25], [.5, .45], [.45, .52], [.22, .35]], [[.2, .05], [.45, .12], [.42, .2], [.2, .15]], [[-.15, -.35], [0, -.35], [-.05, -.6], [-.2, -.58]],
    [[.05, -.32], [.2, -.3], [.3, -.58], [.15, -.6]], [[-.1, .1], [-.4, .05], [-.5, .35], [-.42, .38]]];
  for (const p of polys) { const q = p.map(([u, v]) => [cx + u * s, cy + v * s, zz]); Q(P, q[0], q[1], q[2], q[3], [cx, cy, zz + 1]); }
}

function walls(ctx, P, col) {
  const lod = L(ctx), H = 11, t = 2.4;
  const runX = (x0, x1, wz) => { const a = z(wz) - t / 2, b = z(wz) + t / 2; box(P, x0, col ? 0 : -1.9, a, x1, H, b); if (!col && lod <= 3) { stone(ctx, RC.stone2); crenels(P, x0 + 0.4, x1 - 0.4, H, a - 0.1, a + 0.5); crenels(P, x0 + 0.4, x1 - 0.4, H, b - 0.5, b + 0.1); if (lod <= 2) { box(P, x0, H - 0.5, a - 0.25, x1, H - 0.1, b + 0.25); box(P, x0, -1.9, a - 0.4, x1, 1.1, b + 0.4); } stone(ctx); } };
  const runZ = (x, z0, z1) => { const a = x - t / 2, b = x + t / 2; box(P, a, 0, z(z0), b, H, z(z1)); if (!col && lod <= 3) { stone(ctx, RC.stone2); const F = XF(P, x, 0, 0, Math.PI / 2); crenels(F, -z(z1) + 0.4, -z(z0) - 0.4, H, -t / 2 - 0.1, -t / 2 + 0.5); crenels(F, -z(z1) + 0.4, -z(z0) - 0.4, H, t / 2 - 0.5, t / 2 + 0.1); if (lod <= 2) { box(P, a - 0.25, H - 0.5, z(z0), b + 0.25, H - 0.1, z(z1)); box(P, a - 0.4, 0, z(z0), b + 0.4, 1.1, z(z1)); } stone(ctx); } };
  stone(ctx);
  runX(-56, -14.8, 162); runX(14.8, 56, 162);
  runZ(-58, 164, 220); runZ(58, 164, 220);
  const towers = [[-58, 162, 3.8, 16], [58, 162, 3.8, 16], [-36, 162, 3.2, 14], [36, 162, 3.2, 14], [-58, 192, 3.2, 14], [58, 192, 3.2, 14], [-58, 221, 3.8, 16], [58, 221, 3.8, 16]];
  for (const [x, wz, r, h] of towers) {
    if (col) prism(P, ngon(8, r, x, z(wz)), 0, h);
    else if (lod >= 4) { stone(ctx); prism(P, ngon(6, r, x, z(wz)), wz === 162 ? -1.9 : 0, h); slate(ctx); lathe(P, [[r + 0.6, h], [0, h + r * 2]], 6, x, 0, z(wz)); }
    else tower(ctx, P, x, z(wz), r, wz === 162 ? -1.9 : 0, h, { cone: r * 2.3, courses: [h * 0.5], slitRot: 0.4 });
  }
  if (!col && lod <= 2) { // arrow-slit lancets on the outer face of the south walls
    for (let x = -50; x <= 50; x += 7) { if (Math.abs(x) < 18 || Math.abs(Math.abs(x) - 36) < 4) continue; lancet(ctx, XF(P, 0, 0, z(162) - 1.2), x, 5.5, 0.7, 2.2, [0.1, 0.09, 0.08], -0.05, false); }
  }
}

function bridge(ctx, P, col) {
  const lod = L(ctx), zS = z(150.2), zN = z(160.4), q0 = z(151.2), q1 = z(160.4);
  if (col) {
    box(P, -5.5, -0.4, zS, 5.5, 0.1, zN);
    box(P, -6.1, 0, zS, -5.5, 1.1, zN); box(P, 5.5, 0, zS, 6.1, 1.1, zN);
    box(P, -60, -1.9, q0 - 1, -6.1, 0.05, q0); box(P, 6.1, -1.9, q0 - 1, 60, 0.05, q0);
    for (const x of [-8.6, 8.6]) box(P, x - 2.2, 0, z(149.5) - 2.2, x + 2.2, 3.2, z(149.5) + 2.2);
    return;
  }
  // quays
  stone(ctx, RC.stone2);
  box(P, -60, -1.9, q0 - 1, -5.5, 0.05, q0); box(P, 5.5, -1.9, q0 - 1, 60, 0.05, q0);
  box(P, -60, -1.9, q1, -6.6, 0.05, q1 + 0.6); box(P, 6.6, -1.9, q1, 60, 0.05, q1 + 0.6);
  if (lod <= 2) { gold(ctx); box(P, -60, 0.05, q0 - 0.2, -6.1, 0.12, q0 + 0.05); box(P, 6.1, 0.05, q0 - 0.2, 60, 0.12, q0 + 0.05); }
  // deck and arched spandrels (in the YZ plane)
  flat(ctx, RC.stone2); box(P, -5.5, -0.35, zS, 5.5, 0.1, zN);
  paint(ctx, RT.flag, RC.stone, 0.85); top(P, -5.5, zS, 5.5, zN, 0.11);
  stone(ctx);
  const n = lod <= 2 ? 10 : lod === 3 ? 5 : 2, cz = z(156.2);
  for (const x of [-6.1, 5.5]) { const F = XF(P, x, 0, 0, Math.PI / 2); archWall(F, -zN, -zS, -2.2, 0.1, 0, 0.6, [{ cx: -cz, w: 6.6, sill: -2.2, spring: -2.0, pointed: 0 }], n); }
  // parapets with balusters, gold capping
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -6.1 : 5.5, x1 = x0 + 0.6;
    stone(ctx); box(P, x0, 0.1, zS, x1, 0.35, zN); box(P, x0 - 0.05, 0.95, zS, x1 + 0.05, 1.15, zN);
    if (lod <= 2) { flat(ctx, RC.stone); for (let zz = zS + 0.5; zz < zN - 0.3; zz += 0.45) lathe(P, [[0.1, 0.35], [0.16, 0.5], [0.08, 0.7], [0.12, 0.95]], 6, x0 + 0.3, 0, zz); gold(ctx); box(P, x0 + 0.1, 1.15, zS, x1 - 0.1, 1.2, zN); }
    else box(P, x0 + 0.1, 0.35, zS, x1 - 0.1, 0.95, zN);
    for (const zz of [zS + 0.3, zN - 0.3]) { stone(ctx, RC.stone2); box(P, x0 - 0.1, 0, zz - 0.4, x1 + 0.1, 1.4, zz + 0.4); lampPost(ctx, P, x0 + 0.3, zz, 3.6); }
  }
  // the heroes' plinths flanking the approach
  for (const x of [-8.6, 8.6]) {
    const zc = z(149.5);
    stone(ctx, RC.stone2); box(P, x - 2.2, 0, zc - 2.2, x + 2.2, 0.8, zc + 2.2);
    stone(ctx); box(P, x - 1.8, 0.8, zc - 1.8, x + 1.8, 2.9, zc + 1.8);
    stone(ctx, RC.stone2); box(P, x - 2.0, 2.9, zc - 2.0, x + 2.0, 3.2, zc + 2.0);
    if (lod <= 2) { paint(ctx, null, RC.blue, 0.6); box(P, x - 1.3, 1.2, zc - 1.85, x + 1.3, 2.5, zc - 1.8); gold(ctx); lion2d(P, x, 1.95, zc - 1.9, 0.9); }
  }
}

function avenue(ctx, P, col) {
  const lod = L(ctx), y = 0.08, R = 20;
  const avs = [[148, 150.2], [160.4, 177.6], [214.4, 222]];
  if (col) {
    for (const [a, b] of avs) box(P, -6, 0, z(a), 6, y, z(b));
    const pts = ngon(24, R, 0, z(196)); prism(P, pts, 0, y + 0.01);
    for (const [x, wz] of LAMPS) box(P, x - 0.35, 0, z(wz) - 0.35, x + 0.35, 4.6, z(wz) + 0.35);
    for (const [x, wz] of TREES) box(P, x - 1.1, 0, z(wz) - 1.1, x + 1.1, 0.85, z(wz) + 1.1);
    for (const [x, wz] of POLES) box(P, x - 0.4, 0, z(wz) - 0.4, x + 0.4, 9, z(wz) + 0.4);
    return;
  }
  // avenue flagstones with kerbs, gold edge inlay and a blue diamond spine
  for (const [a, b] of avs) {
    flat(ctx, RC.shade); box(P, -6.3, -0.2, z(a), 6.3, y - 0.01, z(b));
    paint(ctx, RT.flag, RC.stone, 0.85); top(P, -5.7, z(a), 5.7, z(b), y);
    if (lod <= 3) { stone(ctx, RC.stone2); box(P, -6.3, 0, z(a), -5.9, y + 0.14, z(b)); box(P, 5.9, 0, z(a), 6.3, y + 0.14, z(b)); gold(ctx); top(P, -5.9, z(a), -5.6, z(b), y + 0.005); top(P, 5.6, z(a), 5.9, z(b), y + 0.005); }
    if (lod <= 2) { paint(ctx, null, RC.blue, 0.5); for (let wz = a + 2; wz < b - 1.5; wz += 4) { const c = z(wz); Q(P, [0, y + 0.006, c - 1.2], [0.7, y + 0.006, c], [0, y + 0.006, c + 1.2], [-0.7, y + 0.006, c], [0, 0, c]); } }
  }
  // the plaza: concentric bands of alternating stone, a blue compass of eight rays, gold rings
  const cz = z(196), N = lod <= 2 ? 32 : lod === 3 ? 16 : 10, py = y + 0.012;
  const ring = (r0, r1, yy, fn) => { for (let i = 0; i < N; i++) { const a = i / N * TAU, b = (i + 1) / N * TAU; if (fn && !fn(i)) continue;
    const p = (r, t) => [Math.cos(t) * r, yy, cz + Math.sin(t) * r]; Q(P, p(r0, a), p(r0, b), p(r1, b), p(r1, a), [0, yy - 1, cz]); } };
  flat(ctx, RC.shade); prism(P, ngon(N, R + 0.3, 0, cz), -0.2, y - 0.005);
  if (lod >= 4) { paint(ctx, RT.flag, RC.stone, 0.85); ring(0, R, py); }
  else {
    const bands = [0, 3, 6.5, 8, 10, 12, 14, 16, 18, 19.4, R];
    for (let k = 0; k < bands.length - 1; k++) {
      paint(ctx, RT.flag, RC.stone, 0.85); ring(bands[k], bands[k + 1], py, (i) => (i + k) % 2 === 0);
      paint(ctx, RT.flag, 'oklch(0.9 0.02 250)', 0.85); ring(bands[k], bands[k + 1], py, (i) => (i + k) % 2 === 1);
    }
    gold(ctx); ring(6.5, 6.8, py + 0.004); ring(19.4, 19.7, py + 0.004);
    if (lod <= 2) { paint(ctx, null, RC.blue, 0.5); for (let i = 0; i < 8; i++) { const t = i / 8 * TAU + TAU / 16, c = Math.cos(t), s = Math.sin(t), px = -s, pz = c;
      const A = [c * 7.2 + px * 0.9, py + 0.006, cz + s * 7.2 + pz * 0.9], B = [c * 18.9, py + 0.006, cz + s * 18.9], C = [c * 7.2 - px * 0.9, py + 0.006, cz + s * 7.2 - pz * 0.9];
      T(P, A, B, C, [0, 0, cz]); } }
  }
  const rnd = rng(11);
  for (const [x, wz] of LAMPS) lampPost(ctx, P, x, z(wz));
  for (const [x, wz] of TREES) planterTree(ctx, P, x, z(wz), 1, rnd);
  for (const [x, wz, yaw] of POLES) bannerPole(ctx, P, x, z(wz), 9, yaw);
}
export const LAMPS = [[-6.8, 166], [6.8, 166], [-6.8, 172.5], [6.8, 172.5], [-6.8, 219], [6.8, 219],
  ...[22.5, 67.5, 112.5, 247.5, 292.5, 337.5].map((d) => [Math.cos(d * Math.PI / 180) * 20.8, 196 + Math.sin(d * Math.PI / 180) * 20.8])];
export const TREES = [[-8.9, 169.3], [8.9, 169.3], [-8.9, 175.6], [8.9, 175.6], [-9, 216.5], [9, 216.5], [21.8, 184.5], [21.8, 207.5], [-18.5, 181.5], [-18.5, 210.5]];
export const POLES = [[-7.6, 163.5, 0], [7.6, 163.5, 0], [-7.6, 221, 0], [7.6, 221, 0],
  ...[45, 135, 225, 315].map((d) => [Math.cos(d * Math.PI / 180) * 21.2, 196 + Math.sin(d * Math.PI / 180) * 21.2, Math.atan2(-Math.cos(d * Math.PI / 180), -Math.sin(d * Math.PI / 180)) + Math.PI / 2])];

function fountain(ctx, P, col) {
  const lod = L(ctx), n = lod <= 2 ? 28 : lod === 3 ? 16 : 10;
  if (col) { prism(P, ngon(12, 6.2, 0, 0), 0, 0.85); prism(P, ngon(8, 1.1, 0, 0), 0, 4.4); return; }
  stone(ctx, RC.stone2); lathe(P, [[6.5, 0], [6.5, 0.3], [6.2, 0.35], [6.2, 0.8], [6.45, 0.85], [6.45, 1.0], [5.6, 1.0], [5.6, 0.25], [0, 0.25]], n);
  paint(ctx, null, RC.water, 0.05, 0.2); ctx.color(RC.water, 0.82); lathe(P, [[5.6, 0.72], [0, 0.72]], n);
  stone(ctx); lathe(P, [[1.4, 0.25], [1.4, 0.6], [1.0, 0.8], [0.8, 2.2], [1.2, 2.4], [2.9, 2.6], [3.0, 3.05], [2.7, 3.05], [2.6, 2.75], [0, 2.75]], n);
  paint(ctx, null, RC.water, 0.05, 0.2); ctx.color(RC.water, 0.82); lathe(P, [[2.62, 2.95], [0, 2.95]], n);
  stone(ctx, RC.stone2); lathe(P, [[0.95, 2.75], [0.95, 3.6], [0.75, 3.8], [0.75, 4.1], [1.0, 4.2], [1.0, 4.4], [0, 4.4]], lod <= 2 ? 8 : 6);
  if (lod <= 2) { gold(ctx); lathe(P, [[6.47, 1.0], [6.47, 1.06], [5.58, 1.06], [5.58, 1.0]], n); lathe(P, [[3.02, 3.05], [3.02, 3.1], [2.68, 3.1]], n); }
  // the gold lion, seated on the plinth, facing −z (south, down the avenue)
  gold(ctx);
  const y0 = 4.4, k = lod <= 2 ? 8 : lod === 3 ? 6 : 4;
  blob(P, 0, y0, 0.35, 0.62, 0.9, 0.85, k); // haunches
  blob(P, 0, y0 + 0.5, -0.05, 0.55, 1.1, 0.6, k); // chest/torso upright
  blob(P, 0, y0 + 1.25, -0.35, 0.75, 0.85, 0.7, k); // mane
  blob(P, 0, y0 + 1.5, -0.72, 0.36, 0.42, 0.42, k); // head
  if (lod <= 3) {
    blob(P, 0, y0 + 1.42, -1.05, 0.2, 0.2, 0.22, 5); // muzzle
    for (const s of [-1, 1]) {
      beam(P, [s * 0.28, y0 + 0.9, -0.45], [s * 0.3, y0 + 0.05, -0.7], 0.22); blob(P, s * 0.3, y0, -0.78, 0.16, 0.1, 0.2, 5); // forelegs + paws
      blob(P, s * 0.45, y0, 0.1, 0.25, 0.3, 0.5, 5); // hind legs
      blob(P, s * 0.3, y0 + 1.9, -0.6, 0.1, 0.14, 0.08, 4); // ears
    }
    if (lod <= 2) { beam(P, [0.3, y0 + 0.15, 0.95], [0.9, y0 + 0.2, 0.7], 0.1); beam(P, [0.9, y0 + 0.2, 0.7], [1.0, y0 + 0.7, 0.3], 0.09); blob(P, 1.0, y0 + 0.75, 0.28, 0.15, 0.18, 0.15, 5); }
  }
}

export function geometry(ctx) {
  const { part = 'avenue' } = ctx.params;
  ctx.flat();
  ({ gate, walls, bridge, avenue, fountain })[part]?.(ctx, ctx, false);
}
export function collider(ctx) {
  const { part = 'avenue' } = ctx.params;
  ({ gate, walls, bridge, avenue, fountain })[part]?.(ctx, ctx, true);
}
