// The pond family: params.kind "pier" (the rickety fishing pier, origin at its shore end, deck running along local -Z, feet at the
// water line, deck top 0.45), "tackle" (the tackle box), "pad" (a lilypad, params.r, .rot notch angle, .flower), "seed" (a glowing
// seed with a sprout), "islet" (the mossy rock the pads lead to), "pouch" (the little seed chest hidden on it).
import { paint, obox, beam, lathe, blob, TAU } from '../lib/yard-kit.js';
import { box, prism, ngon, gem, Q, T } from '../lib/road-solid.js';
const WALNUT = 'oklch(0.52 0.05 55)', IRON = 'oklch(0.3 0.015 60)', GLOW = 'oklch(0.85 0.15 70)';
const wood = (r) => `oklch(${(0.76 + r() * 0.12).toFixed(3)} ${(0.025 + r() * 0.035).toFixed(3)} ${(60 + r() * 20).toFixed(0)})`;
function tiltPlank(ctx, cx, cz, len, dep, th, yaw, y0, lift) {
  const c = Math.cos(yaw), s = Math.sin(yaw), h = len / 2;
  beam(ctx, [cx - h * c, y0 + th / 2, cz + h * s], [cx + h * c, y0 + th / 2 + lift, cz - h * s], dep, th);
}
function post(ctx, x, z, top, w, r) {
  paint(ctx, 'walnut', 'oklch(0.42 0.05 120)', 0.95); obox(ctx, x, -2.6, z, w, 2.62, w, (r() - 0.5) * 0.1);          // algae-dark below the water line
  paint(ctx, 'walnut', `oklch(${(0.6 + r() * 0.08).toFixed(3)} 0.035 60)`, 0.9); obox(ctx, x, 0.02, z, w * 0.96, top - 0.02, w * 0.96, (r() - 0.5) * 0.1);
}
function lantern(ctx, x, yTop, z) {
  paint(ctx, null, IRON, 0.5, 0.6);
  beam(ctx, [x, yTop, z], [x, yTop - 0.16, z], 0.015, 0.015);                                                    // chain
  const yb = yTop - 0.52;
  prism(ctx, ngon(4, 0.15, x, z, TAU / 8), yb + 0.3, yb + 0.38, 0.25);                                          // hood
  obox(ctx, x, yb + 0.27, z, 0.19, 0.03, 0.19); obox(ctx, x, yb, z, 0.19, 0.03, 0.19);
  for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, x + a * 0.08, yb + 0.03, z + b * 0.08, 0.022, 0.24, 0.022);
  ctx.albedo(null); ctx.color('oklch(0.93 0.12 80)'); ctx.emissive(GLOW); ctx.roughness(0.4);
  obox(ctx, x, yb + 0.03, z, 0.13, 0.24, 0.13); ctx.emissive(null);
}
function pier(ctx, p, lod) {
  const r = () => ctx.random(), L = p.length ?? 11, TW = p.headHalf ?? 2.8, TD = p.headDepth ?? 1.8, zT = -L - TD;
  // the shore step: one limestone slab the path meets
  paint(ctx, 'stone', 'oklch(0.86 0.025 80)', 0.9); obox(ctx, 0, -0.6, 0.55, 1.7, 0.85, 0.7, 0.03);
  if (lod >= 4) { paint(ctx, 'oak', 'oklch(0.8 0.04 70)', 0.9); box(ctx, -0.88, 0.3, -L, 0.88, 0.45, 0.2); box(ctx, -TW, 0.3, zT, TW, 0.45, -L);
    for (const [x, z] of [[-TW + 0.15, zT + 0.15], [TW - 0.15, zT + 0.15]]) obox(ctx, x, -1, z, 0.2, 3.3, 0.2); return; }
  // stringers
  paint(ctx, 'walnut', 'oklch(0.55 0.04 60)', 0.95);
  for (const x of [-0.62, 0.62]) obox(ctx, x, 0.28, (zT + 0.2) / 2 + 0.1, 0.12, 0.12, -zT + 0.1);
  for (const z of [-L - 0.15, zT + 0.15]) obox(ctx, 0, 0.28, z, TW * 2 - 0.1, 0.12, 0.12);
  // posts: pairs down the walk, the T head's corners (the far two carry lanterns), one mid lantern post on the right
  const lampPosts = [[-TW + 0.15, zT + 0.15], [TW - 0.15, zT + 0.15], [0.8, -6.6]];
  for (const z of [-0.3, -2.4, -4.5, -8.7]) for (const x of [-0.8, 0.8]) post(ctx, x + (r() - 0.5) * 0.04, z, 0.4, 0.16, r);
  post(ctx, -0.8, -6.6, 0.4, 0.16, r);
  for (const [x, z] of [[-TW + 0.15, -L - 0.15], [TW - 0.15, -L - 0.15], [-1, zT + 0.15], [1, zT + 0.15]]) post(ctx, x, z, 0.4, 0.16, r);
  for (const [x, z] of lampPosts) { post(ctx, x, z, 2.35, 0.17, r); paint(ctx, 'walnut', WALNUT, 0.85); obox(ctx, x, 2.35, z, 0.22, 0.05, 0.22); }
  // planks down the walk: a few gone, a few crooked, one sprung
  const N = Math.floor(L / 0.22), gone = new Set([9, 22, 23, 37]), crooked = { 6: 0.09, 17: -0.08, 31: 0.11, 44: -0.07 };
  for (let i = 0; i < N; i++) {
    if (gone.has(i)) continue;
    const z = -0.11 - i * 0.22, len = (lod <= 2 ? 1.7 + r() * 0.18 : 1.8), off = (r() - 0.5) * 0.08, yaw = crooked[i] ?? (r() - 0.5) * 0.03;
    paint(ctx, 'oak', wood(r), 0.92);
    if (i === 27 && lod <= 2) tiltPlank(ctx, off, z, len, 0.19, 0.05, yaw, 0.4, 0.06);
    else obox(ctx, off, 0.4, z, len, 0.05, 0.19, yaw);
  }
  // the T head: planks run with the walk
  for (let j = 0; j < 25; j++) {
    if (j === 23) continue;
    const x = -TW + 0.11 + j * 0.2335; paint(ctx, 'oak', wood(r), 0.92);
    obox(ctx, x, 0.4, -L - TD / 2 + (r() - 0.5) * 0.06, 0.2, 0.05, TD - 0.04 + (r() - 0.5) * 0.08, (r() - 0.5) * (j === 4 ? 0.2 : 0.03));
  }
  // lantern arms reach out over the water
  for (const [x, z] of lampPosts) { const sx = Math.sign(x); paint(ctx, null, IRON, 0.5, 0.6); beam(ctx, [x, 2.22, z], [x + sx * 0.6, 2.22, z], 0.035, 0.035);
    beam(ctx, [x, 1.9, z], [x + sx * 0.4, 2.2, z], 0.025, 0.025); lantern(ctx, x + sx * 0.56, 2.2, z); }
  if (lod <= 2) {
    // cross bracing under the walk, one snapped and hanging
    paint(ctx, 'walnut', 'oklch(0.5 0.04 70)', 0.95);
    for (const z of [-0.3, -4.5]) beam(ctx, [-0.8, -1.1, z], [0.8, 0.22, z], 0.06, 0.12);
    beam(ctx, [0.8, 0.22, -8.7], [0.2, -0.35, -8.62], 0.06, 0.12);
    // a rickety rail down the right side with a sagging rope
    const rails = [-1.2, -3.6, -8.4, -10.6];
    for (const z of rails) { paint(ctx, 'walnut', `oklch(${(0.58 + r() * 0.08).toFixed(3)} 0.035 60)`, 0.9); beam(ctx, [0.86, 0.4, z], [0.86 + (r() - 0.5) * 0.08, 1.35, z + (r() - 0.5) * 0.08], 0.08, 0.08); }
    paint(ctx, null, 'oklch(0.8 0.04 85)', 0.95);
    const pts = [-1.2, -3.6, -6.6, -8.4, -10.6];
    for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], b = pts[k + 1], n = 4;
      for (let s = 0; s < n; s++) { const t0 = s / n, t1 = (s + 1) / n, y = (t) => 1.28 - Math.sin(Math.PI * t) * 0.22;
        beam(ctx, [0.86, y(t0), a + (b - a) * t0], [0.86, y(t1), a + (b - a) * t1], 0.025, 0.025); } }
    // a broken rail on the T's far edge, one end dropped
    paint(ctx, 'walnut', 'oklch(0.6 0.035 60)', 0.9);
    beam(ctx, [-0.4, 0.4, zT + 0.05], [-0.4, 1.3, zT + 0.05], 0.08, 0.08); beam(ctx, [1.7, 0.4, zT + 0.05], [1.72, 1.25, zT + 0.02], 0.08, 0.08);
    beam(ctx, [-0.4, 1.22, zT + 0.05], [1.2, 1.22, zT + 0.05], 0.1, 0.06); beam(ctx, [1.2, 1.2, zT + 0.05], [1.75, 0.75, zT - 0.05], 0.1, 0.06);
    // a bucket with the morning's perch in it
    const bx = 1.75, bz = -L - 0.55;
    paint(ctx, 'walnut', 'oklch(0.62 0.05 60)', 0.9); lathe(ctx, [[0.14, 0.45], [0.18, 0.75], [0.16, 0.75], [0.12, 0.5]], 10, bx, bz);
    paint(ctx, null, IRON, 0.5, 0.6); lathe(ctx, [[0.155, 0.52], [0.158, 0.55], [0], [0]].slice(0, 2).map(([a, b]) => [a, b]), 10, bx, bz);
    lathe(ctx, [[0.172, 0.68], [0.176, 0.71]], 10, bx, bz);
    for (let s = 0; s < 6; s++) { const a0 = Math.PI * s / 6, a1 = Math.PI * (s + 1) / 6; beam(ctx, [bx + Math.cos(a0) * 0.18, 0.74 + Math.sin(a0) * 0.2, bz], [bx + Math.cos(a1) * 0.18, 0.74 + Math.sin(a1) * 0.2, bz], 0.012, 0.012); }
    ctx.albedo(null); ctx.color('oklch(0.62 0.07 195)'); ctx.roughness(0.1); prism(ctx, ngon(10, 0.155, bx, bz), 0.68, 0.69);
    ctx.color('oklch(0.72 0.08 120)'); ctx.roughness(0.4); T(ctx, [bx - 0.02, 0.69, bz], [bx + 0.05, 0.84, bz - 0.04], [bx + 0.07, 0.83, bz + 0.05], [bx, 0.6, bz]);
    // the rod, leaning on the left lantern post, its line trailing into the water
    const bt = [-1.95, 0.46, -L - 0.95], lp = [-TW + 0.28, 1.75, zT + 0.28], d = [lp[0] - bt[0], lp[1] - bt[1], lp[2] - bt[2]], dl = Math.hypot(...d), u = d.map((v) => v / dl);
    const at = (s) => [bt[0] + u[0] * s, bt[1] + u[1] * s, bt[2] + u[2] * s], tip = at(2.9);
    paint(ctx, null, 'oklch(0.72 0.06 65)', 0.8); beam(ctx, at(0), at(0.42), 0.045, 0.045);
    paint(ctx, null, 'oklch(0.66 0.09 70)', 0.6); beam(ctx, at(0.42), at(1.8), 0.024, 0.024); beam(ctx, at(1.8), tip, 0.013, 0.013);
    paint(ctx, null, IRON, 0.4, 0.7); const rl = at(0.36); obox(ctx, rl[0] + 0.03, rl[1] - 0.05, rl[2], 0.05, 0.09, 0.09);
    paint(ctx, null, 'oklch(0.95 0.01 90)', 0.5); beam(ctx, tip, [tip[0] - 0.5, 0.0, tip[2] - 0.35], 0.006, 0.006);
    // a coil of rope by the bucket
    paint(ctx, null, 'oklch(0.8 0.05 85)', 0.95);
    for (let s = 0; s < 10; s++) { const a0 = TAU * s / 10, a1 = TAU * (s + 1) / 10; beam(ctx, [2.3 + Math.cos(a0) * 0.2, 0.47, -L - 1.25 + Math.sin(a0) * 0.2], [2.3 + Math.cos(a1) * 0.2, 0.47, -L - 1.25 + Math.sin(a1) * 0.2], 0.045, 0.045);
      beam(ctx, [2.3 + Math.cos(a0) * 0.13, 0.51, -L - 1.25 + Math.sin(a0) * 0.13], [2.3 + Math.cos(a1) * 0.13, 0.51, -L - 1.25 + Math.sin(a1) * 0.13], 0.04, 0.04); }
  }
}
function tackle(ctx, lod) {
  paint(ctx, 'walnut', 'oklch(0.58 0.05 55)', 0.85); obox(ctx, 0, 0, 0, 0.5, 0.2, 0.28);
  paint(ctx, null, 'oklch(0.6 0.07 195)', 0.7); obox(ctx, 0, 0.2, 0, 0.52, 0.07, 0.3);
  paint(ctx, 'brass', 'oklch(0.85 0.09 85)', 0.35, 0.8); obox(ctx, 0, 0.13, -0.145, 0.06, 0.1, 0.02);
  for (const x of [-0.12, 0.12]) obox(ctx, x, 0.27, 0, 0.025, 0.06, 0.025); obox(ctx, 0, 0.32, 0, 0.3, 0.025, 0.035);
  if (lod <= 2) { for (const x of [-0.24, 0.24]) obox(ctx, x, 0, 0, 0.025, 0.2, 0.3);
    ctx.albedo(null); ctx.color('oklch(0.75 0.16 30)'); obox(ctx, 0.3, 0, 0.05, 0.05, 0.04, 0.05); ctx.color('oklch(0.9 0.02 90)'); obox(ctx, 0.31, 0.04, 0.05, 0.02, 0.03, 0.02); }
}
function pad(ctx, p, lod) {
  const r = p.r ?? 0.95, rot = p.rot ?? 0, n = lod <= 2 ? 18 : 10, top = 0.06, half = 0.2, rnd = () => ctx.random();
  const ring = []; for (let i = 0; i <= n; i++) { const a = rot + half + (TAU - 2 * half) * i / n, k = 0.96 + rnd() * 0.05; ring.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
  const oc = [0, top / 2, 0], on = [-Math.cos(rot) * r * 0.5, top / 2, -Math.sin(rot) * r * 0.5];
  ctx.albedo(null); ctx.color('oklch(0.6 0.12 138)'); ctx.roughness(0.55); ctx.metalness(0); ctx.emissive(null);
  for (let i = 0; i < n; i++) { const a = ring[i], b = ring[i + 1]; T(ctx, [0, top, 0], [a[0], top, a[1]], [b[0], top, b[1]], oc); }
  ctx.color('oklch(0.72 0.1 125)');
  for (let i = 0; i < n; i++) { const a = ring[i], b = ring[i + 1]; Q(ctx, [a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], top, b[1]], [a[0], top, a[1]], oc); T(ctx, [0, 0, 0], [a[0], 0, a[1]], [b[0], 0, b[1]], oc); }
  for (const e of [ring[0], ring[n]]) Q(ctx, [0, 0, 0], [e[0], 0, e[1]], [e[0], top, e[1]], [0, top, 0], on);
  if (lod <= 2) { ctx.color('oklch(0.5 0.1 140)'); for (let v = 0; v < 7; v++) { const a = rot + half + 0.3 + v * (TAU - 2 * half - 0.6) / 6, c = Math.cos(a), s = Math.sin(a), w = 0.018, px = -s * w, pz = c * w;
      ctx.quad(px * 2, top + 0.004, pz * 2, -px * 2, top + 0.004, -pz * 2, c * r * 0.85 - px * 0.3, top + 0.004, s * r * 0.85 - pz * 0.3, c * r * 0.85 + px * 0.3, top + 0.004, s * r * 0.85 + pz * 0.3); } }
  if (p.flower && lod <= 3) {
    const fx = Math.cos(rot + Math.PI) * r * 0.45, fz = Math.sin(rot + Math.PI) * r * 0.45, y = top;
    for (let ring2 = 0; ring2 < 2; ring2++) for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + ring2 * 0.5, c = Math.cos(a), s = Math.sin(a), L = ring2 ? 0.14 : 0.2, H = ring2 ? 0.16 : 0.1;
      ctx.color(ring2 ? 'oklch(0.9 0.07 350)' : 'oklch(0.82 0.11 355)');
      const tip = [fx + c * L, y + H, fz + s * L], l = [fx - s * 0.05, y + 0.02, fz + c * 0.05], rr = [fx + s * 0.05, y + 0.02, fz - c * 0.05];
      ctx.tri(...l, ...rr, ...tip); ctx.tri(...rr, ...l, ...tip);
    }
    ctx.color('oklch(0.9 0.15 95)'); ctx.emissive('oklch(0.5 0.1 95)'); gem(ctx, fx, y + 0.06, fz, 0.04, 0.05, 0.03, 5); ctx.emissive(null);
  }
}
function seed(ctx, lod) {
  ctx.albedo(null); ctx.color('oklch(0.92 0.16 95)'); ctx.roughness(0.3); ctx.metalness(0); ctx.emissive('oklch(0.82 0.17 95)');
  gem(ctx, 0, 0.55, 0, 0.085, 0.13, 0.11, lod <= 2 ? 7 : 5); ctx.emissive(null);
  ctx.color('oklch(0.72 0.16 135)');
  for (const s of [1, -1]) { const b = [0, 0.68, 0], t = [s * 0.12, 0.8, 0.02]; ctx.tri(...b, s * 0.05, 0.76, -0.04, ...t); ctx.tri(...b, ...t, s * 0.05, 0.76, -0.04); }
}
function islet(ctx, lod) {
  const rnd = () => ctx.random(), n = lod <= 2 ? 12 : 8;
  const prof = [[2.75, -2.6], [2.55, -0.9], [2.3, 0.08], [1.95, 0.4], [1.3, 0.56], [0.5, 0.62]];
  const jit = Array.from({ length: n }, () => 0.86 + rnd() * 0.22);
  const R = prof.map(([r, y], k) => Array.from({ length: n }, (_, i) => { const a = i / n * TAU, j = k ? jit[i] * (0.97 + rnd() * 0.06) : jit[i]; return [Math.cos(a) * r * j, y, Math.sin(a) * r * j]; }));
  for (let k = 0; k < R.length - 1; k++) {
    const moss = k >= 2; if (moss) paint(ctx, 'moss', `oklch(${(0.74 + rnd() * 0.06).toFixed(3)} 0.09 128)`, 0.95); else paint(ctx, 'stone', 'oklch(0.8 0.02 85)', 0.9);
    const o = [0, (prof[k][1] + prof[k + 1][1]) / 2 - 0.3, 0];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, R[k][i], R[k][j], R[k + 1][j], R[k + 1][i], o); }
  }
  const last = R[R.length - 1], c = [0, 0.66, 0]; for (let i = 0; i < n; i++) T(ctx, last[i], last[(i + 1) % n], c, [0, 0, 0]);
  // boulders: one screens the chest from the pads
  for (const [x, z, rx, ry] of [[-0.35, 0.1, 0.55, 0.7], [1.2, -1.2, 0.5, 0.35], [-1.6, -1.0, 0.4, 0.3]]) { paint(ctx, 'stone', `oklch(${(0.82 + rnd() * 0.06).toFixed(3)} 0.02 85)`, 0.9); blob(ctx, x, 0.45, z, rx, ry, rx * 0.85, lod <= 2 ? 7 : 5, rnd); }
  if (lod <= 2) {
    paint(ctx, 'moss', 'oklch(0.68 0.11 132)', 0.95); blob(ctx, -0.35, 1.05, 0.1, 0.35, 0.12, 0.3, 6, rnd); blob(ctx, 0.6, 0.55, 0.9, 0.5, 0.18, 0.4, 6, rnd);
    // a fern tuft and reeds at the water line
    ctx.albedo(null); ctx.color('oklch(0.66 0.13 138)'); ctx.roughness(0.8);
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, c2 = Math.cos(a), s2 = Math.sin(a); ctx.quad(0.55, 0.58, 0.85, 0.55 + c2 * 0.05, 0.58, 0.85 + s2 * 0.05, 0.55 + c2 * 0.45, 0.85, 0.85 + s2 * 0.45, 0.55 + c2 * 0.4, 0.9, 0.85 + s2 * 0.4); }
    ctx.color('oklch(0.7 0.1 115)');
    for (let i = 0; i < 16; i++) { const a = 0.5 + rnd() * 2.2, rr = 2.2 + rnd() * 0.3, x = Math.cos(a) * rr, z = Math.sin(a) * rr, h = 0.6 + rnd() * 0.6, lx = (rnd() - 0.5) * 0.2;
      ctx.quad(x - 0.02, -0.1, z, x + 0.02, -0.1, z, x + lx + 0.005, h, z + 0.05, x + lx - 0.005, h, z + 0.05); }
  }
}
function pouch(ctx, lod) {
  const w = 0.42, d = 0.28, h = 0.2, n = lod <= 2 ? 6 : 3;
  paint(ctx, 'walnut', 'oklch(0.55 0.05 55)', 0.85); obox(ctx, 0, 0, 0, w, h, d);
  const arc = (x) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI * i / n; return [x, h + 0.05 + Math.sin(a) * d * 0.45, Math.cos(a) * d / 2]; });
  paint(ctx, 'walnut', 'oklch(0.5 0.05 50)', 0.85); ctx.albedo(null); const A = arc(-w / 2), B = arc(w / 2); for (let i = 0; i < n; i++) Q(ctx, A[i], A[i + 1], B[i + 1], B[i], [0, h + 0.1, 0]);
  for (let i = 1; i < n; i++) { T(ctx, A[0], A[i], A[i + 1], [1, h + 0.1, 0]); T(ctx, B[0], B[i], B[i + 1], [-1, h + 0.1, 0]); }
  ctx.color('oklch(0.92 0.16 95)'); ctx.emissive('oklch(0.75 0.17 95)'); obox(ctx, 0, h, 0, w - 0.04, 0.05, d - 0.04); ctx.emissive(null);   // seeds glowing through the gap
  paint(ctx, 'brass', 'oklch(0.85 0.09 85)', 0.35, 0.8); for (const x of [-0.14, 0.14]) obox(ctx, x, -0.005, 0, 0.03, h + 0.01, d + 0.01); obox(ctx, 0, 0.1, -d / 2 - 0.01, 0.06, 0.08, 0.02);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.86 0.04 85)', 0.95); blob(ctx, 0.36, 0, 0.05, 0.13, 0.2, 0.12, 6); ctx.color('oklch(0.92 0.16 95)'); ctx.emissive('oklch(0.8 0.17 95)'); gem(ctx, 0.28, 0.03, -0.12, 0.03, 0.04, 0.02, 5); gem(ctx, 0.46, 0.03, -0.05, 0.03, 0.04, 0.02, 5); ctx.emissive(null); }
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod ?? 1; ctx.flat();
  if (p.kind === 'tackle') return tackle(ctx, lod);
  if (p.kind === 'pad') return pad(ctx, p, lod);
  if (p.kind === 'seed') return seed(ctx, lod);
  if (p.kind === 'islet') return islet(ctx, lod);
  if (p.kind === 'pouch') return pouch(ctx, lod);
  return pier(ctx, p, lod);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'tackle' || p.kind === 'pouch') return null;
  if (p.kind === 'seed') return { kind: 'box', width: 1, height: 1.8, depth: 1 };
  if (p.kind === 'pad') { prism(ctx, ngon(10, (p.r ?? 0.95) * 0.97), -0.3, 0.06); return; }
  if (p.kind === 'islet') { prism(ctx, ngon(10, 2.15), -2.6, 0.4); prism(ctx, ngon(8, 1.45), 0.4, 0.56); box(ctx, -0.8, 0.4, -0.35, 0.1, 1.1, 0.55); return; }
  const L = p.length ?? 11, TW = p.headHalf ?? 2.8, TD = p.headDepth ?? 1.8, zT = -L - TD;
  box(ctx, -0.9, 0.3, -L, 0.9, 0.45, 0.25); box(ctx, -TW, 0.3, zT, TW, 0.45, -L); box(ctx, -0.85, -0.6, 0.2, 0.85, 0.25, 0.9);
  for (const [x, z] of [[-TW + 0.15, zT + 0.15], [TW - 0.15, zT + 0.15], [0.8, -6.6]]) box(ctx, x - 0.1, 0.45, z - 0.1, x + 0.1, 2.4, z + 0.1);
  box(ctx, 1.57, 0.45, -L - 0.73, 1.93, 0.75, -L - 0.37);
}
