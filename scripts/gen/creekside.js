// The creekside inside the grand gate: one family, params.kind picks the piece. Authored in WORLD metres, shifted by params.o
// (the row's world feet), so every piece lines up with the den-creek river mark (16,-1)->(9,0.3)->(3,0.2)->(0,0).
//  "main":    oak parquet deck on the north bank with two low wicker chairs, a side table, grass planters, an iron lantern,
//             smooth river rocks breaking the hard edges along both banks, and the stone pier + walnut post that carry the wheel's axle.
//  "wheel":   the old undershot water wheel, centred on its hub, axle along Z (material-wheel-turn spins it).
//  "willow":  stout leaning trunk, arching limbs and a leafy crown.   "curtain": the willow's hanging strands (material-willow-sway).
//  "rushes":  bulrush clusters, merged (material-shore-sway).
import { paint, TEX, beam, nrm, crs, Q, T, solid, prism, box, ngon } from '../lib/yard-kit.js';
const WICKER = 'cdn/texture-woven-honey-rattan-wicker.png', LINEN = 'cdn/texture-woven-linen-canvas.png';
const ROCK = 'cdn/texture-weathered-pale-grey-limestone-rock.png', BARK = 'cdn/texture-willow-bark-deep-furrowed.png';
const DECK = 'cdn/texture-weathered-honey-oak-deck-planks.png', ASHLAR = 'cdn/texture-weathered-pale-limestone-ashlar-blocks.png';
const DY = 0.74; // deck top, world

function shift(ctx, o) {
  const t = (a) => a.map((v, i) => v - o[i % 3]);
  return { quad: (...a) => ctx.quad(...t(a)), tri: (...a) => ctx.tri(...t(a)) };
}
function frame(W, ox, oy, oz, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const t = (a) => { const r = []; for (let i = 0; i < a.length; i += 3) { const x = a[i], y = a[i + 1], z = a[i + 2]; r.push(ox + x * c + z * s, oy + y, oz - x * s + z * c); } return r; };
  return { quad: (...a) => W.quad(...t(a)), tri: (...a) => W.tri(...t(a)) };
}
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// a smooth lumpy ellipsoid; phi0 < 0 sinks its belly (buried, open), -1.57 closes it
function pebble(W, x, y, z, sx, sy, sz, yaw, nu, nv, r, phi0 = -0.55) {
  const c = Math.cos(yaw), s = Math.sin(yaw), o = [x, y, z], G = [];
  for (let v = 0; v < nv; v++) {
    const phi = phi0 + (v / nv) * (Math.PI / 2 - phi0), row = [];
    for (let u = 0; u < nu; u++) {
      const th = (u / nu) * Math.PI * 2, k = 1 + (r() - 0.5) * 0.14;
      const lx = Math.cos(phi) * Math.cos(th) * sx * k, lz = Math.cos(phi) * Math.sin(th) * sz * k, ly = Math.sin(phi) * sy * k;
      row.push([x + lx * c + lz * s, y + ly, z - lx * s + lz * c]);
    }
    G.push(row);
  }
  const top = [x, y + sy, z];
  for (let v = 0; v < nv - 1; v++) for (let u = 0; u < nu; u++) { const j = (u + 1) % nu; Q(W, G[v][u], G[v][j], G[v + 1][j], G[v + 1][u], o); }
  for (let u = 0; u < nu; u++) T(W, G[nv - 1][u], G[nv - 1][(u + 1) % nu], top, o);
  if (phi0 < -1.5) { const bot = [x, y - sy, z]; for (let u = 0; u < nu; u++) T(W, G[0][(u + 1) % nu], G[0][u], bot, o); }
}
function tube(W, pts, rad, n) {
  const R = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), up = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const s = nrm(crs(d, up)), u = crs(s, d), ring = [];
    for (let j = 0; j < n; j++) { const t = (j / n) * Math.PI * 2, cs = Math.cos(t) * rad[i], sn = Math.sin(t) * rad[i]; ring.push([p[0] + s[0] * cs + u[0] * sn, p[1] + s[1] * cs + u[1] * sn, p[2] + s[2] * cs + u[2] * sn]); }
    return ring;
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const o = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, (pts[i][2] + pts[i + 1][2]) / 2];
    for (let j = 0; j < n; j++) { const k = (j + 1) % n; Q(W, R[i][j], R[i][k], R[i + 1][k], R[i + 1][j], o); }
  }
  const e = pts[pts.length - 1], L = R[R.length - 1], ins = pts[pts.length - 2];
  for (let j = 0; j < n; j++) T(W, L[j], L[(j + 1) % n], e, ins);
}
const bez = (a, b, c, t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * a[i] + 2 * (1 - t) * t * b[i] + t * t * c[i]);

// ---------------- main: deck, chairs, planters, rocks, pier ----------------
function deck(ctx, W, lod) {
  paint(ctx, 'walnut', 'oklch(0.62 0.04 55)', 0.9);
  box(W, 10.2, 0.22, 1.1, 14.2, DY - 0.04, 3.5); // the dark body under the tiles
  paint(ctx, 'walnut', 'oklch(0.86 0.04 60)', 0.85);
  if (lod <= 3) { // fascia boards proud of the body
    box(W, 10.16, DY - 0.2, 1.06, 14.24, DY - 0.03, 1.1); box(W, 10.16, DY - 0.2, 3.5, 14.24, DY - 0.03, 3.54);
    box(W, 10.16, DY - 0.2, 1.06, 10.2, DY - 0.03, 3.54); box(W, 14.2, DY - 0.2, 1.06, 14.24, DY - 0.03, 3.54);
  }
  const r = rng(11), T8 = 0.8;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) {
    const x0 = 10.2 + i * T8, z0 = 1.1 + j * T8;
    ctx.albedo(DECK); ctx.color(`oklch(${(0.9 + r() * 0.07).toFixed(3)} ${(0.03 + r() * 0.025).toFixed(3)} ${(70 + r() * 14).toFixed(1)})`); ctx.roughness(0.82);
    if (lod <= 2) {
      const along = (i + j) % 2 === 0, n = 4, g = 0.014, w = (T8 - g * (n + 1)) / n;
      for (let k = 0; k < n; k++) {
        const a = g + k * (w + g);
        if (along) box(W, x0 + 0.012, DY - 0.05, z0 + a, x0 + T8 - 0.012, DY, z0 + a + w);
        else box(W, x0 + a, DY - 0.05, z0 + 0.012, x0 + a + w, DY, z0 + T8 - 0.012);
      }
    } else box(W, x0 + 0.01, DY - 0.05, z0 + 0.01, x0 + T8 - 0.01, DY, z0 + T8 - 0.01);
  }
  ctx.albedo(DECK); ctx.color('oklch(0.9 0.04 72)');
  box(W, 9.78, 0.25, 1.75, 10.2, 0.47, 2.85); // the step up from the lawn
}
function chair(ctx, W, x, z, yaw, pillow, lod) {
  const f = frame(W, x, DY, z, yaw);
  ctx.albedo(WICKER); ctx.color('oklch(0.95 0.035 78)'); ctx.roughness(0.9); ctx.metalness(0);
  box(f, -0.36, 0.05, -0.34, 0.36, 0.3, 0.36);
  for (const sgn of [-1, 1]) {
    box(f, sgn * 0.28, 0.05, -0.34, sgn * 0.41, 0.5, 0.4);
    if (lod <= 3) beam(f, [sgn * 0.345, 0.53, -0.37], [sgn * 0.345, 0.53, 0.42], 0.15, 0.08);
  }
  solid(f, [[-0.38, 0.28, 0.26], [0.38, 0.28, 0.26], [0.38, 0.28, 0.4], [-0.38, 0.28, 0.4]], [[-0.37, 0.84, 0.5], [0.37, 0.84, 0.5], [0.37, 0.84, 0.62], [-0.37, 0.84, 0.62]]);
  if (lod <= 3) beam(f, [-0.38, 0.86, 0.56], [0.38, 0.86, 0.56], 0.1, 0.09);
  if (lod <= 2) { paint(ctx, 'walnut', 'oklch(0.7 0.04 55)'); for (const [a, b] of [[-0.36, -0.32], [0.3, -0.32], [-0.36, 0.3], [0.3, 0.3]]) box(f, a, 0, b, a + 0.06, 0.05, b + 0.06); }
  ctx.albedo(LINEN); ctx.color('oklch(0.96 0.02 85)'); ctx.roughness(0.95);
  box(f, -0.27, 0.3, -0.33, 0.27, 0.41, 0.26);
  solid(f, [[-0.26, 0.41, 0.16], [0.26, 0.41, 0.16], [0.26, 0.41, 0.27], [-0.26, 0.41, 0.27]], [[-0.25, 0.78, 0.36], [0.25, 0.78, 0.36], [0.25, 0.78, 0.47], [-0.25, 0.78, 0.47]]);
  if (lod <= 3) { ctx.color(pillow); solid(f, [[-0.2, 0.41, 0.06], [0.08, 0.41, 0.1], [0.08, 0.41, 0.17], [-0.2, 0.41, 0.13]], [[-0.18, 0.63, 0.2], [0.06, 0.63, 0.24], [0.06, 0.63, 0.31], [-0.18, 0.63, 0.27]]); }
}
function sideTable(ctx, W, x, z, lod) {
  const f = frame(W, x, DY, z, 0.3);
  paint(ctx, 'walnut', 'oklch(0.82 0.04 58)');
  prism(f, ngon(10, 0.24), 0.40, 0.45); prism(f, ngon(6, 0.035), 0.0, 0.4); prism(f, ngon(8, 0.15), 0.0, 0.03);
  if (lod <= 2) {
    paint(ctx, null, 'oklch(0.66 0.085 192)', 0.35);
    const j = frame(W, x + 0.06, DY + 0.45, z - 0.02, 0);
    prism(j, ngon(8, 0.065), 0, 0.12, 0.8); prism(j, ngon(8, 0.052), 0.12, 0.2, 0.75);
    paint(ctx, null, 'oklch(0.94 0.02 85)', 0.4);
    for (const [a, b] of [[-0.1, 0.08], [-0.05, -0.12]]) prism(frame(W, x + a, DY + 0.45, z + b, 0), ngon(7, 0.035), 0, 0.07, 1.1);
  }
}
function planter(ctx, W, x, y, z, s, lod, seed) {
  const f = frame(W, x, y, z, 0.2 + seed), h = 0.5 * s, hw = 0.25 * s, r = rng(seed * 31 + 7);
  paint(ctx, 'walnut', 'oklch(0.78 0.04 55)');
  prism(f, [[-hw, -hw], [hw, -hw], [hw, hw], [-hw, hw]], 0, h, 1.14);
  const tw = hw * 1.14;
  if (lod <= 3) { paint(ctx, 'oak', 'oklch(0.93 0.04 78)'); for (const [a, b] of [[[-tw - 0.03, -tw], [tw + 0.03, -tw]], [[tw, -tw - 0.03], [tw, tw + 0.03]], [[tw + 0.03, tw], [-tw - 0.03, tw]], [[-tw, tw + 0.03], [-tw, -tw - 0.03]]]) beam(f, [a[0], h + 0.02, a[1]], [b[0], h + 0.02, b[1]], 0.06, 0.04); }
  paint(ctx, 'soil', 'oklch(0.8 0.03 60)');
  f.quad(-tw, h - 0.03, tw, tw, h - 0.03, tw, tw, h - 0.03, -tw, -tw, h - 0.03, -tw);
  ctx.albedo(null); ctx.roughness(0.8);
  const N = lod <= 2 ? 34 : lod === 3 ? 14 : 5;
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2, rr = r() * hw * 0.7, L = (0.6 + r() * 0.55) * s * 1.4, out = 0.25 + r() * 0.35;
    const bx = Math.cos(a) * rr, bz = Math.sin(a) * rr, dx = Math.cos(a), dz = Math.sin(a), tx = -dz * 0.018 * s, tz = dx * 0.018 * s;
    const P = [[bx, h - 0.03, bz], [bx + dx * out * 0.25 * L, h + L * 0.5, bz + dz * out * 0.25 * L], [bx + dx * out * 0.7 * L, h + L * 0.85, bz + dz * out * 0.7 * L], [bx + dx * out * 1.2 * L, h + L * 0.72, bz + dz * out * 1.2 * L]];
    const W3 = [1, 0.8, 0.45, 0];
    for (let k = 0; k < 3; k++) {
      const t = k / 3; ctx.color(`oklch(${(0.62 + t * 0.2 + r() * 0.04).toFixed(3)} ${(0.1 - t * 0.02).toFixed(3)} ${(128 - t * 30).toFixed(0)})`);
      const A = P[k], B = P[k + 1], wa = W3[k], wb = W3[k + 1];
      f.quad(A[0] - tx * wa, A[1], A[2] - tz * wa, A[0] + tx * wa, A[1], A[2] + tz * wa, B[0] + tx * wb, B[1], B[2] + tz * wb, B[0] - tx * wb, B[1], B[2] - tz * wb);
    }
    if (lod <= 2 && i % 3 === 0) { // a feather plume on every third
      ctx.color('oklch(0.9 0.05 88)'); const p = P[2], pw = 0.04 * s;
      f.quad(p[0] - tx * 2.2, p[1] - 0.02, p[2] - tz * 2.2, p[0] + tx * 2.2, p[1] - 0.02, p[2] + tz * 2.2, p[0] + tx * 1.2, p[1] + 0.2 * s, p[2] + tz * 1.2, p[0] - tx * 1.2, p[1] + 0.2 * s, p[2] - tz * 1.2);
      void pw;
    }
  }
}
function lantern(ctx, W, x, y, z, lod) {
  paint(ctx, null, 'oklch(0.32 0.012 250)', 0.55, 0.6);
  beam(W, [x, y, z], [x, y + 1.3, z], 0.07); beam(W, [x, y + 1.26, z], [x - 0.34, y + 1.26, z], 0.045);
  if (lod <= 3) beam(W, [x, y + 1.0, z], [x - 0.22, y + 1.24, z], 0.03);
  const lx = x - 0.32, f = frame(W, lx, y + 0.9, z, 0.4);
  box(f, -0.1, 0, -0.1, 0.1, 0.03, 0.1);
  for (const [a, b] of [[-0.1, -0.1], [0.07, -0.1], [-0.1, 0.07], [0.07, 0.07]]) box(f, a, 0.03, b, a + 0.03, 0.27, b + 0.03);
  solid(f, [[-0.12, 0.27, -0.12], [0.12, 0.27, -0.12], [0.12, 0.27, 0.12], [-0.12, 0.27, 0.12]], [[-0.02, 0.36, -0.02], [0.02, 0.36, -0.02], [0.02, 0.36, 0.02], [-0.02, 0.36, 0.02]]);
  ctx.color('oklch(0.93 0.07 80)'); ctx.metalness(0); ctx.emissive(2.4, 1.45, 0.55);
  box(f, -0.075, 0.04, -0.075, 0.075, 0.25, 0.075);
  ctx.emissive(null);
}
function pier(ctx, W, lod) {
  // coursed limestone pier on the south bank carrying the wheel's axle; a walnut post with a brace on the north bank
  const r = rng(5); ctx.albedo(ASHLAR); ctx.roughness(0.9); ctx.metalness(0);
  const C = [[-0.3, 0.25], [0.25, 0.7], [0.7, 1.1]];
  for (let c = 0; c < C.length; c++) {
    const n = lod <= 2 ? 3 : 1, xs = [3.85, 4.2 + (c % 2) * 0.2, 4.6 - (c % 2) * 0.1, 4.95];
    for (let k = 0; k < n; k++) {
      const a = n === 1 ? 3.85 : xs[k], b = n === 1 ? 4.95 : xs[k + 1];
      ctx.color(`oklch(${(0.9 + r() * 0.06).toFixed(3)} 0.02 ${(78 + r() * 10).toFixed(0)})`);
      box(W, a + 0.01, C[c][0], -2.05 + r() * 0.03, b - 0.01, C[c][1] - 0.01, -1.3 - r() * 0.03);
    }
  }
  ctx.color('oklch(0.95 0.02 80)'); box(W, 3.78, 1.1, -2.1, 5.02, 1.2, -1.25);
  if (lod <= 3) { ctx.albedo(TEX.moss); ctx.color('oklch(0.85 0.08 125)'); box(W, 3.8, 1.2, -2.08, 4.4, 1.23, -1.6); }
  paint(ctx, null, 'oklch(0.3 0.012 250)', 0.5, 0.6); box(W, 4.2, 0.72, -1.3, 4.6, 1.08, -1.26); // bearing plate
  paint(ctx, 'walnut', 'oklch(0.72 0.04 55)', 0.9);
  box(W, 4.28, -0.3, 0.72, 4.52, 1.05, 0.96);
  beam(W, [4.4, 0.35, 1.55], [4.4, 0.95, 0.96], 0.12, 0.12);
  paint(ctx, null, 'oklch(0.3 0.012 250)', 0.5, 0.6); box(W, 4.26, 0.78, 0.7, 4.54, 1.02, 0.72);
  paint(ctx, 'walnut', 'oklch(0.55 0.04 50)', 0.9); // the axle, fixed; the wheel spins round it
  const ax = ngon(8, 0.07).map(([x, y]) => [4.4 + x, 0.9 + y]);
  solid(W, ax.map(([x, y]) => [x, y, -1.3]), ax.map(([x, y]) => [x, y, 0.72]));
}
function rocks(ctx, W, list, lod) {
  if (lod >= 5) return;
  ctx.smooth(); ctx.albedo(ROCK); ctx.roughness(0.7); ctx.metalness(0);
  const r = rng(3), nu = lod <= 2 ? 7 : lod === 3 ? 6 : 5, nv = lod <= 2 ? 3 : 2;
  for (const [x, y, z, s, yaw, wet] of list) {
    if (lod >= 4 && s < 0.25) continue;
    ctx.color(wet ? `oklch(${(0.66 + r() * 0.08).toFixed(3)} 0.02 ${(200 + r() * 40).toFixed(0)})` : `oklch(${(0.86 + r() * 0.1).toFixed(3)} 0.02 ${(75 + r() * 20).toFixed(0)})`);
    const sy = s * (0.42 + r() * 0.22);
    pebble(W, x, y + sy * 0.2, z, s * (1 + r() * 0.35), sy, s * (0.7 + r() * 0.3), yaw, nu, nv, r);
  }
  ctx.flat();
}

// ---------------- wheel ----------------
function wheel(ctx, lod) {
  const R = 1.05, n = lod <= 2 ? 16 : lod === 3 ? 12 : 8, np = lod <= 2 ? 16 : 10, W = ctx;
  paint(ctx, 'walnut', 'oklch(0.72 0.045 55)', 0.9);
  for (const zc of [-0.15, 0.15]) {
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2, rm = R - 0.07; beam(W, [Math.cos(a) * rm, Math.sin(a) * rm, zc], [Math.cos(b) * rm, Math.sin(b) * rm, zc], 0.07, 0.13); }
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + (zc > 0 ? 0.2 : 0); beam(W, [Math.cos(a) * 0.14, Math.sin(a) * 0.14, zc], [Math.cos(a) * (R - 0.12), Math.sin(a) * (R - 0.12), zc], 0.07, 0.06); }
  }
  paint(ctx, 'oak', 'oklch(0.86 0.045 72)', 0.88);
  for (let i = 0; i < np; i++) { const a = (i / np) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), tc = -s * 0.025, ts = c * 0.025;
    const P = (rr, dz) => [c * rr, s * rr, dz];
    solid(W, [[c * 0.78 - tc, s * 0.78 - ts, -0.19], [c * 1.14 - tc, s * 1.14 - ts, -0.19], [c * 1.14 + tc, s * 1.14 + ts, -0.19], [c * 0.78 + tc, s * 0.78 + ts, -0.19]],
      [[c * 0.78 - tc, s * 0.78 - ts, 0.19], [c * 1.14 - tc, s * 1.14 - ts, 0.19], [c * 1.14 + tc, s * 1.14 + ts, 0.19], [c * 0.78 + tc, s * 0.78 + ts, 0.19]]); void P; }
  paint(ctx, 'walnut', 'oklch(0.6 0.04 50)', 0.9);
  const hub = ngon(8, 0.17); solid(W, hub.map(([x, y]) => [x, y, -0.22]), hub.map(([x, y]) => [x, y, 0.22]));
  if (lod <= 2) { paint(ctx, null, 'oklch(0.3 0.012 250)', 0.5, 0.6); const band = ngon(8, 0.185); for (const z0 of [-0.2, 0.14]) solid(W, band.map(([x, y]) => [x, y, z0]), band.map(([x, y]) => [x, y, z0 + 0.06])); }
}

// ---------------- willow ----------------
const CROWN = [-0.7, 4.3, -1.9];
function willow(ctx, W, lod) {
  const n = lod <= 2 ? 9 : lod === 3 ? 7 : 5;
  ctx.albedo(BARK); ctx.color('oklch(0.78 0.03 65)'); ctx.roughness(0.95); ctx.metalness(0);
  const F = [-0.55, 2.7, -1.0], pts = [], rad = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push(bez([0, -0.3, 0], [0.15, 1.5, 0.1], F, t)); rad.push(i === 0 ? 0.62 : 0.46 - t * 0.16 + (i === 1 ? 0.06 : 0)); }
  tube(W, pts, rad, n);
  if (lod <= 3) for (const a of [0.6, 2.4, 4.1]) beam(W, [Math.cos(a) * 0.3, 0.35, Math.sin(a) * 0.3], [Math.cos(a) * 0.85, -0.15, Math.sin(a) * 0.85], 0.2, 0.14); // root flares
  const r = rng(9), limbs = lod <= 2 ? 6 : lod === 3 ? 4 : 3;
  for (let l = 0; l < limbs; l++) {
    const a = (l / limbs) * Math.PI * 2 + 0.4, E = [CROWN[0] + Math.cos(a) * 2.0, CROWN[1] + 0.2 + r() * 0.4, CROWN[2] + Math.sin(a) * 1.9];
    const M = [(F[0] + E[0]) / 2, CROWN[1] + 0.9, (F[2] + E[2]) / 2], lp = [], lr = [];
    for (let i = 0; i <= 4; i++) { lp.push(bez(F, M, E, i / 4)); lr.push(0.2 - i * 0.037); }
    tube(W, lp, lr, lod <= 2 ? 6 : 4);
  }
  ctx.albedo(TEX.leaf); ctx.roughness(0.85);
  const pu = lod <= 2 ? 7 : 5, pv = lod <= 2 ? 4 : 3;
  ctx.color('oklch(0.8 0.1 122)'); pebble(W, CROWN[0], CROWN[1] + 0.35, CROWN[2], 2.1, 1.0, 2.0, 0.3, pu + 2, pv, r, -0.35);
  const puffs = lod <= 3 ? 7 : 3;
  for (let i = 0; i < puffs; i++) {
    const a = (i / puffs) * Math.PI * 2 + 0.2;
    ctx.color(`oklch(${(0.74 + r() * 0.1).toFixed(3)} 0.11 ${(118 + r() * 12).toFixed(0)})`);
    pebble(W, CROWN[0] + Math.cos(a) * 1.75, CROWN[1] - 0.05 + r() * 0.3, CROWN[2] + Math.sin(a) * 1.65, 1.1 + r() * 0.3, 0.65, 1.0 + r() * 0.3, a, pu, pv, r, -0.6);
  }
}
function curtain(ctx, lod, P) {
  const r = rng(17), N = [0, 300, 190, 100, 36, 14][lod], S = lod <= 1 ? 6 : lod <= 3 ? 4 : 3, [wx, , wz] = P.o;
  const creekZ = (x) => (x > 9 ? -1 + (16 - x) * (1.3 / 7) : 0.3);
  for (let i = 0; i < N; i++) {
    const a = r() * Math.PI * 2, rr = 0.5 + 0.5 * Math.sqrt(r());
    const A = [CROWN[0] + Math.cos(a) * 2.75 * rr, CROWN[1] + 0.55 * (1 - rr * rr) - 0.15, CROWN[2] + Math.sin(a) * 2.6 * rr];
    const worldX = wx + A[0], worldZ = wz + A[2], overWater = Math.abs(worldZ - creekZ(worldX)) < 1.2;
    const tip = (overWater ? -0.4 + r() * 0.55 : 0.3 + r() * 0.9) + (1 - rr) * 1.2;
    const dx = Math.cos(a), dz = Math.sin(a), tx = -dz, tz = dx, w0 = 0.075 + r() * 0.05;
    const hue = 118 + r() * 16, L0 = 0.52 + r() * 0.06;
    let prev = null;
    for (let k = 0; k <= S; k++) {
      const t = k / S, y = A[1] + 0.08 * Math.sin(t * 3) - (A[1] - tip) * t, out = 0.28 * Math.sin(Math.min(1, t * 2.2) * Math.PI / 2) + 0.06 * t;
      const w = w0 * (1 - 0.55 * t) * (k % 2 ? 1.3 : 0.8), c = [A[0] + dx * out, y, A[2] + dz * out];
      const cur = [[c[0] - tx * w, c[1], c[2] - tz * w], [c[0] + tx * w, c[1], c[2] + tz * w]];
      if (prev) { ctx.color(`oklch(${(L0 + t * 0.24).toFixed(3)} ${(0.11 + t * 0.02).toFixed(3)} ${(hue - t * 8).toFixed(0)})`); ctx.quad(...prev[0], ...prev[1], ...cur[1], ...cur[0]); }
      prev = cur;
    }
  }
}

// ---------------- rushes ----------------
function rushes(ctx, W, spots, lod) {
  ctx.albedo(null); ctx.roughness(0.85); ctx.metalness(0);
  const r = rng(23);
  for (const [x, y, z, s] of spots) {
    const nb = lod <= 2 ? 30 : lod === 3 ? 14 : 6, nh = lod <= 2 ? 8 : lod === 3 ? 5 : 3;
    for (let i = 0; i < nb; i++) {
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.55 * s, bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr, L = (1.3 + r() * 0.9) * s;
      const la = r() * Math.PI * 2, lean = 0.12 + r() * 0.25, lx = Math.cos(la) * lean, lz = Math.sin(la) * lean, ta = r() * Math.PI, tx = Math.cos(ta) * 0.03, tz = Math.sin(ta) * 0.03;
      const P = [0, 0.4, 0.75, 1].map((t) => [bx + lx * t * t * L, y - 0.05 + t * L, bz + lz * t * t * L]), Wd = [1, 0.8, 0.5, 0.05];
      for (let k = 0; k < 3; k++) {
        ctx.color(`oklch(${(0.56 + k * 0.07 + r() * 0.05).toFixed(3)} ${(0.11 - k * 0.012).toFixed(3)} ${(130 - k * 12).toFixed(0)})`);
        const A = P[k], B = P[k + 1];
        ctx.quad(...[A[0] - tx * Wd[k], A[1], A[2] - tz * Wd[k], A[0] + tx * Wd[k], A[1], A[2] + tz * Wd[k], B[0] + tx * Wd[k + 1], B[1], B[2] + tz * Wd[k + 1], B[0] - tx * Wd[k + 1], B[1], B[2] - tz * Wd[k + 1]].map((v, j) => v - (j % 3 === 0 ? W.o[0] : j % 3 === 1 ? W.o[1] : W.o[2])));
      }
    }
    for (let i = 0; i < nh; i++) { // cattails: a green stem and a velvet brown head
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.4 * s, bx = x + Math.cos(a) * rr, bz = z + Math.sin(a) * rr, L = (1.7 + r() * 0.8) * s, lx = (r() - 0.5) * 0.3, lz = (r() - 0.5) * 0.3;
      const top = [bx + lx, y + L, bz + lz];
      ctx.color('oklch(0.6 0.1 128)'); beam(W.w, [bx, y - 0.05, bz], [top[0], top[1] + 0.12, top[2]], 0.022, 0.022);
      ctx.color(`oklch(${(0.42 + r() * 0.06).toFixed(3)} 0.07 ${(48 + r() * 8).toFixed(0)})`);
      const f = frame(W.w, top[0] + lx * 0.02, top[1] - 0.26, top[2] + lz * 0.02, 0); prism(f, ngon(lod <= 2 ? 6 : 4, 0.038), 0, 0.25, 0.9);
    }
  }
}

export function geometry(ctx) {
  const P = ctx.params || {}, kind = P.kind || 'main', lod = ctx.lod || 1, o = P.o || [0, 0, 0], W = shift(ctx, o);
  ctx.flat();
  if (kind === 'wheel') return wheel(ctx, lod);
  if (kind === 'willow') return willow(ctx, ctx, lod);
  if (kind === 'curtain') return curtain(ctx, lod, P);
  if (kind === 'rushes') return rushes(ctx, { w: W, o }, P.spots || [], lod);
  deck(ctx, W, lod);
  chair(ctx, W, 11.4, 2.25, -0.28, 'oklch(0.68 0.085 192)', lod);
  chair(ctx, W, 13.05, 2.25, 0.28, 'oklch(0.86 0.06 80)', lod);
  if (lod <= 3) sideTable(ctx, W, 12.22, 2.05, lod);
  planter(ctx, W, 10.55, DY, 3.15, 1, lod, 1);
  planter(ctx, W, 13.85, DY, 3.15, 1, lod, 2);
  planter(ctx, W, 14.75, P.gp ?? 0.55, 2.7, 0.85, lod, 3);
  lantern(ctx, W, 13.98, DY, 1.32, lod);
  pier(ctx, W, lod);
  rocks(ctx, W, P.rocks || [], lod);
}
export function collider(ctx) {
  const P = ctx.params || {}, kind = P.kind || 'main', o = P.o || [0, 0, 0], W = shift(ctx, o);
  if (kind === 'wheel' || kind === 'curtain' || kind === 'rushes') return null;
  if (kind === 'willow') { tube(ctx, [[0, -0.3, 0], [0.1, 1.4, 0.0], [-0.55, 2.7, -1.0]], [0.55, 0.42, 0.3], 6); return; }
  box(W, 10.2, 0.22, 1.1, 14.2, DY, 3.5);
  box(W, 9.78, 0.25, 1.75, 10.2, 0.47, 2.85);
  for (const [x, yaw] of [[11.4, -0.28], [13.05, 0.28]]) box(frame(W, x, DY, 2.25, yaw), -0.41, 0, -0.34, 0.41, 0.45, 0.5);
  box(W, 10.26, DY, 2.86, 10.84, DY + 0.5, 3.44); box(W, 13.56, DY, 2.86, 14.14, DY + 0.5, 3.44);
  box(W, 14.5, 0.3, 2.45, 15.0, (P.gp ?? 0.55) + 0.42, 2.95);
  box(W, 3.78, -0.3, -2.1, 5.02, 1.2, -1.25);
  box(W, 4.28, -0.3, 0.72, 4.52, 1.05, 0.96);
}
