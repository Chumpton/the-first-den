// The riding corral north of the rescue pasture, one family. params.kind "yard" (default, the row `corral`, origin = its feet):
// a round split-rail riding ring (sand footing, a worn track, an arched gate open toward the yard), a rectangular paddock with a
// closed five-bar gate, feed and water troughs, hay bales, a mounting block, and grass tufts softening the field edge
// (params.tufts arrive baked as [x, y, z, s], terrain read at placement). params.kind "shed": a small open-fronted stable,
// front toward its own −Z, a rail of three saddles on their pads, a tack trunk, a rope coil. Metres, feet at ground.
import { Q, T, solid } from '../lib/road-solid.js';
import { obox, beam, blob } from '../lib/yard-kit.js';
const TIMBER = 'cdn/texture-weathered-silver-grey-fence-timber.png';
const OAK = 'cdn/texture-honey-oak-barn-planks.png';
const WALNUT = 'cdn/texture-hand-joined-walnut-wood.png';
const STONE = 'cdn/texture-pale-limestone-blocks.png';
const STRAW = 'cdn/texture-golden-straw-hay.png';
const SHINGLE = 'cdn/texture-weathered-cedar-shingles.png';
const SAND = 'cdn/texture-raked-pale-arena-sand.png';
const LEATHER = 'cdn/texture-worn-tan-saddle-leather.png';
const RAILS = [0.42, 0.78, 1.12], POST_H = 1.3, BAY = 2.5;
const DEF = {
  ring: { c: [-4, 3.5], r: 6.5, n: 16, gate: -45 },
  paddock: { x0: 4.5, x1: 11.5, z0: 0, z1: 9, gateX: 7, gateW: 2.4 },
  items: [
    { k: 'feed', x: 5.1, z: 5.4, yaw: 90 }, { k: 'feed', x: -1.5, z: -7.5, yaw: 0 }, { k: 'water', x: 3, z: -6.8, yaw: 0 },
    { k: 'block', x: 1.6, z: -3.0, yaw: 40 }, { k: 'bales', x: -2.8, z: -10.2, yaw: 10, n: 3 }, { k: 'bales', x: 9.5, z: -3.5, yaw: -25, n: 2 },
  ],
};
function paint(c, tex, col, r = 0.88, m = 0) { c.albedo(tex); c.color(col); c.roughness(r); c.metalness(m); c.emissive(null); }
// a view of ctx moved to (cx, cz) and turned yaw degrees (three.js sense)
function frameAt(ctx, cx, cz, yawDeg) {
  const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const tf = (v) => { const o = []; for (let i = 0; i < v.length; i += 3) o.push(cx + v[i] * c + v[i + 2] * s, v[i + 1], cz - v[i] * s + v[i + 2] * c); return o; };
  return { lod: ctx.lod, quad: (...v) => ctx.quad(...tf(v)), tri: (...v) => ctx.tri(...tf(v)), albedo: (x) => ctx.albedo && ctx.albedo(x), color: (...x) => ctx.color && ctx.color(...x),
    roughness: (x) => ctx.roughness && ctx.roughness(x), metalness: (x) => ctx.metalness && ctx.metalness(x), emissive: (x) => ctx.emissive && ctx.emissive(x), random: () => (ctx.random ? ctx.random() : 0.5) };
}
function splitRail(c, a, b, w) {
  const d = [b[0] - a[0], b[2] - a[2]], l = Math.hypot(d[0], d[1]) || 1, s = [-d[1] / l * w / 2, d[0] / l * w / 2];
  const sec = (p) => [[p[0] + s[0], p[1] - w * 0.35, p[2] + s[1]], [p[0] - s[0], p[1] - w * 0.35, p[2] - s[1]], [p[0], p[1] + w * 0.5, p[2]]];
  solid(c, sec(a), sec(b));
}
const bays = (L) => Math.max(1, Math.ceil(L / BAY - 0.15));
// ---- fences ------------------------------------------------------------------------------------------------------
function ringRuns(R) {
  const [cx, cz] = R.c, st = 2 * Math.PI / R.n, g = R.gate * Math.PI / 180, pts = [];
  for (let i = 0; i < R.n; i++) { const a = g + (i + 0.5) * st; pts.push([cx + Math.cos(a) * R.r, cz + Math.sin(a) * R.r]); }
  const runs = []; for (let i = 0; i < R.n - 1; i++) runs.push([pts[i], pts[i + 1]]);
  return { runs, gate: [pts[0], pts[R.n - 1]] };
}
function paddockRuns(P) {
  const { x0, x1, z0, z1, gateX, gateW } = P, g0 = gateX - gateW / 2, g1 = gateX + gateW / 2;
  return { runs: [[[x0, z0], [g0, z0]], [[g1, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]], gate: [[g0, z0], [g1, z0]] };
}
function fence(ctx, runs, lod) {
  paint(ctx, TIMBER, 'oklch(0.93 0.02 75)');
  const posts = [];
  for (const [a, b] of runs) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = bays(L);
    for (let k = 0; k <= n; k++) { const t = k / n; posts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    if (lod >= 4) { for (const y of [RAILS[0], RAILS[2]]) beam(ctx, [a[0], y, a[1]], [b[0], y, b[1]], 0.1, 0.12); continue; }
    for (const y of RAILS) for (let k = 0; k < n; k++) {
      const t0 = k / n - 0.03, t1 = (k + 1) / n + 0.03, sag = ((k * 7 + Math.round(y * 10) + Math.round(a[0] * 3)) % 3 - 1) * 0.018;
      splitRail(ctx, [a[0] + (b[0] - a[0]) * t0, y + sag, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, y - sag, a[1] + (b[1] - a[1]) * t1], 0.13);
    }
  }
  paint(ctx, TIMBER, 'oklch(0.85 0.025 70)');
  const seen = new Set();
  for (const p of posts) {
    const key = p.map((v) => v.toFixed(2)).join(','); if (seen.has(key)) continue; seen.add(key);
    obox(ctx, p[0], -0.35, p[1], 0.15, POST_H + 0.35, 0.15, (p[0] * 3 + p[1]) % 0.6);
    if (lod <= 2) obox(ctx, p[0], POST_H, p[1], 0.1, 0.05, 0.1, (p[0] * 3 + p[1]) % 0.6 + 0.78);
  }
}
function gatePosts(ctx, g, lod, h, arch) {
  for (const p of g) {
    paint(ctx, WALNUT, 'oklch(0.9 0.03 70)'); obox(ctx, p[0], -0.35, p[1], 0.22, h + 0.35, 0.22, Math.atan2(g[1][1] - g[0][1], g[1][0] - g[0][0]));
    if (lod <= 3) { paint(ctx, STONE, 'oklch(0.95 0.015 85)'); obox(ctx, p[0], -0.05, p[1], 0.42, 0.28, 0.42, Math.atan2(g[1][1] - g[0][1], g[1][0] - g[0][0])); }
  }
  if (!arch) return;
  const d = [g[1][0] - g[0][0], g[1][1] - g[0][1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L];
  paint(ctx, WALNUT, 'oklch(0.86 0.035 65)');
  beam(ctx, [g[0][0] - u[0] * 0.35, h - 0.12, g[0][1] - u[1] * 0.35], [g[1][0] + u[0] * 0.35, h - 0.12, g[1][1] + u[1] * 0.35], 0.2, 0.2);
  if (lod <= 2) for (const [p, s] of [[g[0], 1], [g[1], -1]]) beam(ctx, [p[0] + u[0] * s * 0.1, h - 0.55, p[1] + u[1] * s * 0.1], [p[0] + u[0] * s * 0.55, h - 0.2, p[1] + u[1] * s * 0.55], 0.1, 0.1);
  // a horseshoe over the arch, open end up for luck
  if (lod <= 2) {
    paint(ctx, null, 'oklch(0.42 0.01 250)', 0.5, 0.7);
    const m = [(g[0][0] + g[1][0]) / 2, (g[0][1] + g[1][1]) / 2], n = [-u[1], u[0]], sh = [];
    for (let i = 0; i <= 8; i++) { const a = Math.PI * (1.15 + i / 8 * 0.7) * 1; sh.push([m[0] + u[0] * Math.cos(a) * 0.16 + n[0] * 0.12, h - 0.1 + Math.sin(a) * 0.18 + 0.02, m[1] + u[1] * Math.cos(a) * 0.16 + n[1] * 0.12]); }
    for (let i = 0; i < 8; i++) beam(ctx, sh[i], sh[i + 1], 0.04, 0.03);
  }
}
function fiveBar(ctx, g, lod) {
  const d = [g[1][0] - g[0][0], g[1][1] - g[0][1]], L = Math.hypot(...d), u = [d[0] / L, d[1] / L];
  const at = (s, y) => [g[0][0] + u[0] * s, y, g[0][1] + u[1] * s], a = 0.16, b = L - 0.16;
  paint(ctx, OAK, 'oklch(0.9 0.04 75)');
  beam(ctx, at(a, 0.15), at(a, 1.2), 0.1, 0.1); beam(ctx, at(b, 0.15), at(b, 1.2), 0.1, 0.1);
  for (const y of lod >= 4 ? [0.3, 1.1] : [0.28, 0.5, 0.72, 0.94, 1.14]) beam(ctx, at(a, y), at(b, y), 0.07, 0.1);
  if (lod <= 3) beam(ctx, at(a, 0.3), at(b, 1.1), 0.06, 0.09);
}
// ---- ring footing ------------------------------------------------------------------------------------------------
function annulus(ctx, cx, cz, r0, r1, y0, y1, n) {
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, P = (r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    if (r0 < 1e-3) T(ctx, [cx, y0, cz], P(r1, a0, y1), P(r1, a1, y1), [cx, y0 - 5, cz]);
    else Q(ctx, P(r0, a0, y0), P(r0, a1, y0), P(r1, a1, y1), P(r1, a0, y1), [cx, y0 - 5, cz]);
  }
}
function footing(ctx, R, lod) {
  const [cx, cz] = R.c, n = lod >= 4 ? 12 : lod >= 3 ? 20 : 32, rr = R.r - 0.2;
  paint(ctx, SAND, 'oklch(0.97 0.025 85)', 0.95);
  if (lod >= 4) { annulus(ctx, cx, cz, 0, rr, 0.04, 0.05, n); return; }
  annulus(ctx, cx, cz, 0, 3.9, 0.045, 0.045, n);
  annulus(ctx, cx, cz, 5.3, rr - 0.3, 0.045, 0.06, n);
  annulus(ctx, cx, cz, rr - 0.3, rr, 0.06, 0.1, n);
  paint(ctx, SAND, 'oklch(0.86 0.04 70)', 0.97); // the track the horses wear, a shade darker
  annulus(ctx, cx, cz, 3.9, 5.3, 0.045, 0.045, n);
}
// ---- yard items --------------------------------------------------------------------------------------------------
function feed(f, lod) {
  paint(f, WALNUT, 'oklch(0.86 0.03 65)');
  for (const [x, z] of [[-0.66, -0.18], [0.66, -0.18], [-0.66, 0.18], [0.66, 0.18]]) obox(f, x, 0, z, 0.09, 0.4, 0.09);
  paint(f, OAK, 'oklch(0.92 0.04 75)');
  obox(f, 0, 0.36, 0, 1.6, 0.05, 0.5);
  for (const z of [-0.225, 0.225]) obox(f, 0, 0.36, z, 1.6, 0.3, 0.05);
  for (const x of [-0.775, 0.775]) obox(f, x, 0.36, 0, 0.05, 0.3, 0.4);
  paint(f, STRAW, 'oklch(0.95 0.05 88)', 0.95);
  if (lod <= 3) blob(f, 0, 0.5, 0, 0.68, 0.2, 0.17, 6, () => f.random()); else obox(f, 0, 0.4, 0, 1.45, 0.22, 0.38);
}
function water(f, lod) {
  paint(f, STONE, 'oklch(0.95 0.015 85)', 0.9);
  for (const z of [-0.25, 0.25]) obox(f, 0, 0, z, 1.8, 0.55, 0.12);
  for (const x of [-0.84, 0.84]) obox(f, x, 0, 0, 0.12, 0.55, 0.38);
  obox(f, 0, 0, 0, 1.56, 0.22, 0.38);
  if (lod <= 2) { paint(f, STONE, 'oklch(0.9 0.02 85)', 0.9); obox(f, 0, 0.55, -0.25, 1.86, 0.04, 0.16); obox(f, 0, 0.55, 0.25, 1.86, 0.04, 0.16); }
  paint(f, null, 'oklch(0.66 0.085 195)', 0.06, 0.15);
  Q(f, [-0.78, 0.47, -0.19], [0.78, 0.47, -0.19], [0.78, 0.47, 0.19], [-0.78, 0.47, 0.19], [0, 0, 0]);
}
function block(f, lod) {
  paint(f, OAK, 'oklch(0.9 0.04 72)');
  obox(f, 0, 0, 0.33, 0.9, 0.2, 1.0 - 0.0); obox(f, 0, 0.2, 0.5, 0.9, 0.2, 0.66); obox(f, 0, 0.4, 0.67, 0.9, 0.22, 0.32);
  if (lod <= 2) { paint(f, WALNUT, 'oklch(0.8 0.03 60)'); for (const [z, y, d] of [[-0.17, 0.2, 0.06], [0.17, 0.4, 0.06], [0.51, 0.62, 0.06]]) obox(f, 0, y - 0.01, z, 0.94, 0.03, d); }
}
function bales(f, n, lod) {
  const at = [[-0.5, 0, 0, 4], [0.5, 0, 0.06, -3], [0, 0.46, 0.02, 8]].slice(0, n);
  for (const [x, y, z, yw] of at) {
    const a = yw * Math.PI / 180;
    paint(f, STRAW, 'oklch(0.96 0.05 88)', 0.95); obox(f, x, y, z, 0.95, 0.46, 0.5, a);
    if (lod <= 2) { paint(f, null, 'oklch(0.55 0.06 60)', 0.9); for (const s of [-0.24, 0.24]) obox(f, x + Math.cos(a) * s, y - 0.005, z - Math.sin(a) * s, 0.03, 0.47, 0.51, a); }
  }
}
function tufts(ctx, list, lod) {
  if (lod >= 4 || !list) return;
  const greens = ['oklch(0.72 0.1 125)', 'oklch(0.64 0.11 132)', 'oklch(0.78 0.09 112)'];
  const use = lod >= 3 ? list.filter((_, i) => i % 2 === 0) : list;
  for (let g = 0; g < 3; g++) {
    paint(ctx, null, greens[g], 0.9);
    use.forEach(([x, y, z, s], i) => {
      if (i % 3 !== g) return;
      const k = lod >= 3 ? 4 : 6 + (i % 3);
      for (let j = 0; j < k; j++) {
        const a = j / k * 6.283 + ((i * 7 + j * 3) % 10) * 0.08, lean = 0.3 + ((i + j) % 4) * 0.1, h = (0.24 + ((i * 3 + j) % 5) * 0.05) * s, w = 0.045 * s;
        const bx = x + Math.cos(a) * 0.05 * s, bz = z + Math.sin(a) * 0.05 * s, px = -Math.sin(a) * w, pz = Math.cos(a) * w;
        ctx.tri(bx - px, y - 0.03, bz - pz, bx + px, y - 0.03, bz + pz, x + Math.cos(a) * lean * h, y + h, z + Math.sin(a) * lean * h);
      }
    });
  }
  if (lod >= 3) return;
  paint(ctx, null, 'oklch(0.96 0.03 90)', 0.8); // a few cream clover heads
  list.forEach(([x, y, z, s], i) => {
    if (i % 4) return;
    const fx = x + 0.08, fz = z - 0.05, fy = y + 0.2 * s, r = 0.035;
    ctx.quad(fx - r, fy, fz, fx, fy + r, fz, fx + r, fy, fz, fx, fy - r, fz);
    ctx.quad(fx, fy, fz - r, fx, fy + r, fz, fx, fy, fz + r, fx, fy - r, fz);
  });
}
function yard(ctx) {
  const lod = ctx.lod, P = ctx.params || {}, R = { ...DEF.ring, ...(P.ring || {}) }, PD = { ...DEF.paddock, ...(P.paddock || {}) };
  footing(ctx, R, lod);
  const ring = ringRuns(R), pad = paddockRuns(PD);
  fence(ctx, [...ring.runs, ...pad.runs], lod);
  gatePosts(ctx, ring.gate, lod, 2.7, true);
  gatePosts(ctx, pad.gate, lod, 1.6, false);
  fiveBar(ctx, pad.gate, lod);
  for (const it of P.items || DEF.items) {
    const f = frameAt(ctx, it.x, it.z, it.yaw || 0);
    if (it.k === 'feed') feed(f, lod); else if (it.k === 'water') water(f, lod); else if (it.k === 'block') block(f, lod); else if (it.k === 'bales') bales(f, it.n || 2, lod);
  }
  tufts(ctx, P.tufts, lod);
}
function yardCollider(ctx) {
  const P = ctx.params || {}, R = { ...DEF.ring, ...(P.ring || {}) }, PD = { ...DEF.paddock, ...(P.paddock || {}) };
  const ring = ringRuns(R), pad = paddockRuns(PD);
  for (const [a, b] of [...ring.runs, ...pad.runs, pad.gate]) beam(ctx, [a[0], 0.65, a[1]], [b[0], 0.65, b[1]], 0.14, 1.5);
  for (const p of ring.gate) obox(ctx, p[0], -0.2, p[1], 0.22, 2.9, 0.22);
  for (const it of P.items || DEF.items) {
    const f = frameAt(ctx, it.x, it.z, it.yaw || 0);
    if (it.k === 'feed') obox(f, 0, 0, 0, 1.6, 0.7, 0.5);
    else if (it.k === 'water') obox(f, 0, 0, 0, 1.8, 0.55, 0.62);
    else if (it.k === 'block') { obox(f, 0, 0, 0.33, 0.9, 0.2, 1.0); obox(f, 0, 0, 0.5, 0.9, 0.4, 0.66); obox(f, 0, 0, 0.67, 0.9, 0.62, 0.32); }
    else if (it.k === 'bales') { obox(f, 0, 0, 0.03, 2.0, 0.46, 0.55); if ((it.n || 2) > 2) obox(f, 0, 0, 0.02, 0.95, 0.92, 0.5); }
  }
}
// ---- the stable shed ---------------------------------------------------------------------------------------------
const W = 5, D = 3.4, HF = 2.8, HB = 2.3;
const yAt = (z) => HF + (HB - HF) * (z + D / 2) / D;
function surf(ctx, x0, y0, z0, xs, lift, prof) {
  const p = (i, j) => [x0 + xs[i], y0 + prof[j][1] + lift[i] * Math.max(0, 1 - Math.abs(prof[j][0]) / 0.2), z0 + prof[j][0]];
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < prof.length - 1; j++) ctx.quad(...p(i, j), ...p(i + 1, j), ...p(i + 1, j + 1), ...p(i, j + 1));
}
function saddle(ctx, x, y, z, padCol, lod) {
  paint(ctx, null, padCol, 0.95);
  surf(ctx, x, y - 0.035, z, [-0.36, 0, 0.36], [0, 0, 0], [[-0.36, -0.46], [-0.2, -0.1], [0, 0.06], [0.2, -0.1], [0.36, -0.46]]);
  paint(ctx, LEATHER, 'oklch(0.9 0.05 60)', 0.6);
  surf(ctx, x, y, z, [-0.3, -0.15, 0, 0.15, 0.3], [0.12, 0.01, 0, 0.02, 0.15], [[-0.3, -0.42], [-0.24, -0.12], [-0.13, 0.03], [0, 0.07], [0.13, 0.03], [0.24, -0.12], [0.3, -0.42]]);
  if (lod >= 3) return;
  for (const s of [-1, 1]) {
    const zz = z + s * 0.31;
    ctx.quad(x + 0.03, y - 0.38, zz, x - 0.03, y - 0.38, zz, x - 0.03, y - 0.72, zz, x + 0.03, y - 0.72, zz);
    paint(ctx, null, 'oklch(0.5 0.01 250)', 0.4, 0.8);
    beam(ctx, [x - 0.07, y - 0.84, zz], [x + 0.07, y - 0.84, zz], 0.05, 0.02);
    beam(ctx, [x - 0.07, y - 0.84, zz], [x, y - 0.72, zz], 0.02, 0.02); beam(ctx, [x + 0.07, y - 0.84, zz], [x, y - 0.72, zz], 0.02, 0.02);
    paint(ctx, LEATHER, 'oklch(0.9 0.05 60)', 0.6);
  }
}
function shed(ctx) {
  const lod = ctx.lod;
  // straw bedding on the floor
  paint(ctx, STRAW, 'oklch(0.95 0.05 88)', 0.95);
  Q(ctx, [-W / 2 + 0.1, 0.03, -D / 2 + 0.2], [W / 2 - 0.1, 0.03, -D / 2 + 0.2], [W / 2 - 0.1, 0.03, D / 2 - 0.1], [-W / 2 + 0.1, 0.03, D / 2 - 0.1], [0, -1, 0]);
  // posts
  paint(ctx, WALNUT, 'oklch(0.9 0.03 70)');
  for (const x of [-W / 2 + 0.1, W / 2 - 0.1]) for (const z of [-D / 2 + 0.1, D / 2 - 0.1]) obox(ctx, x, -0.2, z, 0.18, yAt(z) + 0.2, 0.18);
  if (lod <= 3) for (const x of [-W / 2 + 0.1, W / 2 - 0.1]) { paint(ctx, STONE, 'oklch(0.95 0.015 85)'); obox(ctx, x, -0.05, -D / 2 + 0.1, 0.34, 0.22, 0.34); paint(ctx, WALNUT, 'oklch(0.9 0.03 70)'); }
  beam(ctx, [-W / 2 - 0.15, HF - 0.12, -D / 2 + 0.1], [W / 2 + 0.15, HF - 0.12, -D / 2 + 0.1], 0.2, 0.22);
  if (lod <= 2) for (const s of [-1, 1]) beam(ctx, [s * (W / 2 - 0.1), HF - 0.75, -D / 2 + 0.1], [s * (W / 2 - 0.75), HF - 0.15, -D / 2 + 0.1], 0.1, 0.1);
  // plank walls: back full, sides over the back two thirds
  paint(ctx, OAK, 'oklch(0.9 0.04 72)');
  obox(ctx, 0, 0, D / 2 - 0.05, W - 0.1, HB, 0.1);
  for (const s of [-1, 1]) {
    const x0 = s * (W / 2 - 0.1) - 0.05, x1 = x0 + 0.1, za = -0.5, zb = D / 2 - 0.05;
    solid(ctx, [[x0, 0, za], [x1, 0, za], [x1, 0, zb], [x0, 0, zb]], [[x0, yAt(za), za], [x1, yAt(za), za], [x1, yAt(zb), zb], [x0, yAt(zb), zb]]);
  }
  if (lod <= 2) {
    paint(ctx, WALNUT, 'oklch(0.85 0.03 65)');
    for (let x = -W / 2 + 0.6; x < W / 2 - 0.3; x += 0.6) obox(ctx, x, 0.05, D / 2 + 0.015, 0.07, HB - 0.15, 0.04);
    for (const y of [0.35, HB - 0.35]) obox(ctx, 0, y, D / 2 + 0.03, W - 0.2, 0.12, 0.04);
  }
  // shingle roof, lean-to, eaves front and back
  paint(ctx, SHINGLE, 'oklch(0.9 0.03 50)', 0.9);
  const zf = -D / 2 - 0.5, zbk = D / 2 + 0.35, xr = W / 2 + 0.35, o = 0.1;
  const bot = [[-xr, yAt(zf) + o, zf], [xr, yAt(zf) + o, zf], [xr, yAt(zbk) + o, zbk], [-xr, yAt(zbk) + o, zbk]];
  solid(ctx, bot, bot.map(([x, y, z]) => [x, y + 0.12, z]));
  if (lod <= 2) {
    paint(ctx, SHINGLE, 'oklch(0.82 0.035 45)', 0.9);
    for (let k = 1; k < 5; k++) { const z = zf + (zbk - zf) * k / 5; beam(ctx, [-xr, yAt(z) + o + 0.14, z], [xr, yAt(z) + o + 0.14, z], 0.05, 0.04); }
    paint(ctx, WALNUT, 'oklch(0.86 0.035 65)');
    beam(ctx, [-xr - 0.02, yAt(zf) + o + 0.05, zf - 0.02], [xr + 0.02, yAt(zf) + o + 0.05, zf - 0.02], 0.06, 0.2);
  }
  if (lod >= 4) return;
  // saddle rail on brackets along the back wall, three saddles on their pads
  const zr = D / 2 - 0.42, yr = 1.2;
  paint(ctx, WALNUT, 'oklch(0.86 0.035 65)');
  beam(ctx, [-2.05, yr, zr], [2.05, yr, zr], 0.08, 0.08);
  for (const x of [-1.95, -0.65, 0.65, 1.95]) beam(ctx, [x, yr, zr], [x, yr - 0.25, D / 2 - 0.1], 0.07, 0.07);
  const pads = ['oklch(0.66 0.08 195)', 'oklch(0.93 0.03 85)', 'oklch(0.72 0.07 128)'];
  [-1.3, 0, 1.3].forEach((x, i) => saddle(ctx, x, yr + 0.04, zr, pads[i], lod));
  // bridles on pegs at the rail's ends, a tack trunk and a bale inside the front corner
  if (lod <= 2) {
    paint(ctx, LEATHER, 'oklch(0.75 0.06 55)', 0.6);
    for (const x of [-2.2, 2.2]) { const z = D / 2 - 0.12; beam(ctx, [x, 1.75, z], [x - 0.12, 1.2, z], 0.03, 0.01); beam(ctx, [x, 1.75, z], [x + 0.12, 1.2, z], 0.03, 0.01); beam(ctx, [x - 0.12, 1.2, z], [x + 0.12, 1.2, z], 0.03, 0.01); }
  }
  paint(ctx, OAK, 'oklch(0.82 0.05 55)');
  obox(ctx, 1.75, 0, -0.55, 0.85, 0.48, 0.48);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.72 0.1 80)', 0.4, 0.8); for (const x of [1.5, 2.0]) obox(ctx, x, -0.005, -0.55, 0.05, 0.49, 0.49); }
  const f = frameAt(ctx, -1.75, -0.4, 12); bales(f, 1, lod);
  if (lod <= 2) { // a rope coil on the right wall
    paint(ctx, null, 'oklch(0.8 0.05 80)', 0.9);
    const cx = W / 2 - 0.2, cy = 1.45, cz = 0.4, pts = [];
    for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2; pts.push([cx - 0.02, cy + Math.cos(a) * 0.2, cz + Math.sin(a) * 0.2]); }
    for (let i = 0; i < 10; i++) beam(ctx, pts[i], pts[i + 1], 0.04, 0.04);
  }
}
function shedCollider(ctx) {
  obox(ctx, 0, 0, D / 2 - 0.05, W, HB, 0.14);
  for (const s of [-1, 1]) obox(ctx, s * (W / 2 - 0.1), 0, 0.6, 0.14, HB, D - 1.1);
  for (const x of [-W / 2 + 0.1, W / 2 - 0.1]) obox(ctx, x, 0, -D / 2 + 0.1, 0.2, HF, 0.2);
  const zf = -D / 2 - 0.5, zbk = D / 2 + 0.35, xr = W / 2 + 0.35, o = 0.1;
  const bot = [[-xr, yAt(zf) + o, zf], [xr, yAt(zf) + o, zf], [xr, yAt(zbk) + o, zbk], [-xr, yAt(zbk) + o, zbk]];
  solid(ctx, bot, bot.map(([x, y, z]) => [x, y + 0.12, z]));
  obox(ctx, 1.75, 0, -0.55, 0.85, 0.48, 0.48);
}
export function geometry(ctx) { if ((ctx.params || {}).kind === 'shed') shed(ctx); else yard(ctx); }
export function collider(ctx) { if ((ctx.params || {}).kind === 'shed') shedCollider(ctx); else yardCollider(ctx); }
