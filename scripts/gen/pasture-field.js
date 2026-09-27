// The west pasture by the pond, one merged object: split-rail fence round params.points (a local xz loop) with a gate gap
// (params.gate = { edge, t, w }) and its leaf swung open inside; params.items place hay troughs, a hay rick and an
// open-front lean-to barn (front toward its own −Z, yaw in degrees). Feet at ground, metres.
import { Q, T, solid } from '../lib/road-solid.js';
import { obox, beam, lathe, blob, yawAlong } from '../lib/yard-kit.js';
const TIMBER = 'cdn/texture-weathered-silver-grey-fence-timber.png';
const OAK = 'cdn/texture-honey-oak-barn-planks.png';
const WALNUT = 'cdn/texture-hand-joined-walnut-wood.png';
const STONE = 'cdn/texture-pale-limestone-blocks.png';
const STRAW = 'cdn/texture-golden-straw-hay.png';
const SHINGLE = 'cdn/texture-weathered-cedar-shingles.png';
const RAILS = [0.42, 0.78, 1.12], POST_H = 1.3, BAY = 2.5;
function paint(c, tex, col, r = 0.88) { c.albedo(tex); c.color(col); c.roughness(r); c.metalness(0); c.emissive(null); }
// a view of ctx moved to (cx, cz) and turned yaw degrees (three.js sense): items are modelled in their own frame
function frameAt(ctx, cx, cz, yawDeg) {
  const a = yawDeg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const tf = (v) => { const o = []; for (let i = 0; i < v.length; i += 3) o.push(cx + v[i] * c + v[i + 2] * s, v[i + 1], cz - v[i] * s + v[i + 2] * c); return o; };
  return { lod: ctx.lod, quad: (...v) => ctx.quad(...tf(v)), tri: (...v) => ctx.tri(...tf(v)), albedo: (x) => ctx.albedo(x), color: (...x) => ctx.color(...x),
    roughness: (x) => ctx.roughness(x), metalness: (x) => ctx.metalness(x), emissive: (x) => ctx.emissive(x), random: () => ctx.random() };
}
// a split log: a triangular section from a to b (flat face down-out), w across
function splitRail(c, a, b, w) {
  const d = [b[0] - a[0], b[2] - a[2]], l = Math.hypot(d[0], d[1]) || 1, s = [-d[1] / l * w / 2, d[0] / l * w / 2];
  const sec = (p) => [[p[0] + s[0], p[1] - w * 0.35, p[2] + s[1]], [p[0] - s[0], p[1] - w * 0.35, p[2] - s[1]], [p[0], p[1] + w * 0.5, p[2]]];
  solid(c, sec(a), sec(b));
}
function area(pts) { let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; } return A / 2; }
// fence runs: [[a, b], …] with the gate gap cut out; also the gate's two posts and hinge frame
function runs(P) {
  const pts = P.points || [], g = P.gate || { edge: -1 }, out = [];
  let gate = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (i !== g.edge) { out.push([a, b]); continue; }
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), h = (g.w / 2) / L, t0 = g.t - h, t1 = g.t + h;
    const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    out.push([a, at(t0)]); out.push([at(t1), b]);
    gate = { p0: at(t0), p1: at(t1), dir: [(b[0] - a[0]) / L, (b[1] - a[1]) / L] };
  }
  return { out, gate, ccw: area(pts) > 0 };
}
function fence(ctx, P) {
  const lod = ctx.lod, { out, gate, ccw } = runs(P);
  paint(ctx, TIMBER, 'oklch(0.93 0.02 75)');
  const posts = [];
  for (const [a, b] of out) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = lod >= 5 ? 1 : Math.max(1, Math.ceil(L / BAY));
    for (let k = 0; k <= n; k++) { const t = k / n; posts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    const rails = lod >= 4 ? [RAILS[0], RAILS[2]] : RAILS;
    for (const y of rails) {
      if (lod >= 4) { beam(ctx, [a[0], y, a[1]], [b[0], y, b[1]], 0.1, 0.12); continue; }
      // rails ride a hair past each post, the split face turning bay to bay
      for (let k = 0; k < n; k++) {
        const t0 = k / n - 0.02, t1 = (k + 1) / n + 0.02, sag = ((k * 7 + Math.round(y * 10)) % 3 - 1) * 0.015;
        splitRail(ctx, [a[0] + (b[0] - a[0]) * t0, y + sag, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, y - sag, a[1] + (b[1] - a[1]) * t1], 0.13);
      }
    }
  }
  const seen = new Set();
  paint(ctx, TIMBER, 'oklch(0.86 0.025 70)');
  for (const p of posts) {
    const key = p.map((v) => v.toFixed(2)).join(','); if (seen.has(key)) continue; seen.add(key);
    obox(ctx, p[0], -0.35, p[1], 0.15, POST_H + 0.35, 0.15, (p[0] * 3 + p[1]) % 0.5);
    if (lod <= 2) { const y = POST_H, r = 0.075; T(ctx, [p[0] - r, y, p[1] - r], [p[0] + r, y, p[1] - r], [p[0], y + 0.08, p[1]], [p[0], y - 1, p[1]]); T(ctx, [p[0] + r, y, p[1] + r], [p[0] - r, y, p[1] + r], [p[0], y + 0.08, p[1]], [p[0], y - 1, p[1]]); T(ctx, [p[0] + r, y, p[1] - r], [p[0] + r, y, p[1] + r], [p[0], y + 0.08, p[1]], [p[0], y - 1, p[1]]); T(ctx, [p[0] - r, y, p[1] + r], [p[0] - r, y, p[1] - r], [p[0], y + 0.08, p[1]], [p[0], y - 1, p[1]]); }
  }
  if (!gate) return;
  // gate posts: taller walnut with a limestone footing; the leaf hangs open, swung into the pasture
  for (const p of [gate.p0, gate.p1]) {
    paint(ctx, WALNUT, 'oklch(0.9 0.03 70)'); obox(ctx, p[0], -0.35, p[1], 0.22, 1.95, 0.22);
    if (lod <= 3) { paint(ctx, STONE, 'oklch(0.95 0.015 85)'); obox(ctx, p[0], -0.1, p[1], 0.4, 0.3, 0.4); }
  }
  if (lod >= 4) return;
  const inward = ccw ? [-gate.dir[1], gate.dir[0]] : [gate.dir[1], -gate.dir[0]], k = 0.62;
  const ld = [gate.dir[0] * (1 - k) + inward[0] * k, gate.dir[1] * (1 - k) + inward[1] * k], ll = Math.hypot(...ld), u = [ld[0] / ll, ld[1] / ll];
  const W = Math.hypot(gate.p1[0] - gate.p0[0], gate.p1[1] - gate.p0[1]) - 0.3, h0 = gate.p0;
  const at = (s, y) => [h0[0] + u[0] * (0.14 + s * W), y, h0[1] + u[1] * (0.14 + s * W)];
  paint(ctx, OAK, 'oklch(0.92 0.04 75)');
  for (const y of [0.35, 0.72, 1.08]) beam(ctx, at(0, y), at(1, y), 0.07, 0.11);
  beam(ctx, at(0, 0.25), at(0, 1.18), 0.1, 0.1); beam(ctx, at(1, 0.25), at(1, 1.18), 0.1, 0.1);
  beam(ctx, at(0.04, 0.38), at(0.96, 1.05), 0.06, 0.09);
}
function trough(c, it) {
  const lod = c.lod, L = it.l || 1.9, W = 0.64, H = 0.56;
  paint(c, WALNUT, 'oklch(0.9 0.03 65)');
  for (const [x, z] of [[-L / 2 + 0.12, -W / 2 + 0.08], [L / 2 - 0.12, -W / 2 + 0.08], [-L / 2 + 0.12, W / 2 - 0.08], [L / 2 - 0.12, W / 2 - 0.08]]) obox(c, x, 0, z, 0.09, H - 0.2, 0.09);
  paint(c, OAK, 'oklch(0.9 0.035 72)');
  obox(c, 0, H - 0.3, 0, L, 0.06, W - 0.1);
  obox(c, 0, H - 0.3, -W / 2 + 0.03, L, 0.32, 0.06); obox(c, 0, H - 0.3, W / 2 - 0.03, L, 0.32, 0.06);
  obox(c, -L / 2 + 0.03, H - 0.3, 0, 0.06, 0.32, W - 0.12); obox(c, L / 2 - 0.03, H - 0.3, 0, 0.06, 0.32, W - 0.12);
  paint(c, STRAW, 'oklch(0.95 0.05 88)', 0.95);
  if (lod <= 3) for (let i = -1; i <= 1; i++) blob(c, i * L * 0.3, H - 0.26, 0, L * 0.2, 0.2, W * 0.33, lod <= 2 ? 6 : 4, c.random);
  else obox(c, 0, H - 0.25, 0, L - 0.14, 0.18, W - 0.16);
}
function rick(c, it) {
  const lod = c.lod, n = lod <= 2 ? 12 : lod <= 3 ? 8 : 6, R = it.r || 1.25;
  paint(c, STRAW, 'oklch(0.96 0.05 90)', 0.95);
  lathe(c, [[R * 0.92, -0.05], [R * 1.06, 0.7], [R, 1.45], [R * 0.72, 2.1], [R * 0.3, 2.6], [0, 2.78]], n);
  if (lod <= 2) { paint(c, STRAW, 'oklch(0.74 0.06 70)', 0.95); for (const y of [0.9, 1.6]) { const r = y < 1 ? R * 1.06 : R * 0.94; lathe(c, [[r + 0.02, y], [r + 0.03, y + 0.05], [r + 0.02, y + 0.1]], n); } }
  if (lod <= 3) { paint(c, WALNUT, 'oklch(0.8 0.03 60)'); beam(c, [0, 2.5, 0], [0.04, 3.15, 0.02], 0.07, 0.07); }
  // a pitchfork resting against it
  if (lod <= 2) { paint(c, OAK, 'oklch(0.9 0.04 72)'); beam(c, [R + 0.35, 0, 0.3], [R * 0.72 + 0.05, 1.7, 0.3], 0.04, 0.04);
    paint(c, null, 'oklch(0.42 0.02 250)', 0.5); for (const dz of [-0.08, 0, 0.08]) beam(c, [R * 0.72 + 0.05, 1.7, 0.3 + dz], [R * 0.62, 2.05, 0.3 + dz], 0.015, 0.015); }
}
// open-front lean-to: tall front on −Z, low back wall, cedar shingle roof falling back, hay stacked inside
function barn(c, it) {
  const lod = c.lod, W = it.w || 5, D = it.d || 3.2, hf = 2.6, hb = 1.85, zf = -D / 2 + 0.1, zb = D / 2 - 0.1;
  const fx = [-W / 2 + 0.1, -W / 6, W / 6, W / 2 - 0.1], bx = [-W / 2 + 0.1, 0, W / 2 - 0.1];
  if (lod <= 3) { paint(c, STONE, 'oklch(0.95 0.015 85)'); for (const x of fx) obox(c, x, -0.15, zf, 0.34, 0.35, 0.34); for (const x of bx) obox(c, x, -0.15, zb, 0.34, 0.35, 0.34); }
  paint(c, WALNUT, 'oklch(0.88 0.03 62)');
  for (const x of fx) obox(c, x, 0.2, zf, 0.2, hf - 0.2, 0.2);
  for (const x of bx) obox(c, x, 0.2, zb, 0.2, hb - 0.2, 0.2);
  beam(c, [-W / 2, hf + 0.08, zf], [W / 2, hf + 0.08, zf], 0.18, 0.2);
  beam(c, [-W / 2, hb + 0.08, zb], [W / 2, hb + 0.08, zb], 0.16, 0.18);
  if (lod <= 3) { for (const x of [-W / 2 + 0.1, 0, W / 2 - 0.1].concat(lod <= 2 ? [-W / 4, W / 4] : [])) beam(c, [x, hf + 0.24, zf - 0.45], [x, hb + 0.22, zb + 0.35], 0.09, 0.14);
    for (const x of [fx[0], fx[3]]) beam(c, [x, hf - 0.55, zf], [x + (x < 0 ? 0.5 : -0.5), hf + 0.02, zf], 0.1, 0.1); }
  // back and side boards (honey oak barn planks)
  paint(c, OAK, 'oklch(0.93 0.04 74)');
  obox(c, 0, 0.12, zb + 0.13, W - 0.1, hb, 0.06);
  if (lod <= 4) for (const s of [-1, 1]) { const x = s * (W / 2 + 0.02);
    const sec = (dx) => [[x + dx, 0.12, zf + 0.1], [x + dx, 0.12, zb + 0.1], [x + dx, hb + 0.05, zb + 0.1], [x + dx, hf * 0.62, zf + 0.1]];
    solid(c, sec(-0.03), sec(0.03)); }
  // roof: a shingle slab, eave over the open front, falling to the back
  paint(c, SHINGLE, 'oklch(0.9 0.03 60)', 0.9);
  const rs = (x) => [[x, hf + 0.36, zf - 0.6], [x, hb + 0.3, zb + 0.45], [x, hb + 0.2, zb + 0.45], [x, hf + 0.26, zf - 0.6]];
  solid(c, rs(-W / 2 - 0.35), rs(W / 2 + 0.35));
  if (lod <= 2) { paint(c, WALNUT, 'oklch(0.8 0.03 60)'); beam(c, [-W / 2 - 0.38, hf + 0.3, zf - 0.63], [W / 2 + 0.38, hf + 0.3, zf - 0.63], 0.06, 0.2); }
  // hay: a straw floor, bales stacked along the back, a loose heap
  paint(c, STRAW, 'oklch(0.95 0.05 88)', 0.95);
  obox(c, 0, 0, 0, W - 0.3, 0.05, D - 0.3);
  if (lod <= 4) {
    const bales = lod <= 2 ? [[-1.7, 0, 0], [-0.8, 0, 0], [0.1, 0, 0], [-1.25, 0.46, 0], [-0.35, 0.46, 0], [-0.8, 0.92, 0], [1.6, 0, -0.2]] : [[-1.25, 0, 0], [-0.35, 0, 0], [-0.8, 0.46, 0]];
    for (const [x, y, dz] of bales) { paint(c, STRAW, y > 0.5 ? 'oklch(0.97 0.05 92)' : 'oklch(0.92 0.055 86)', 0.95); obox(c, x, 0.05 + y, zb - 0.45 + dz, 0.86, 0.45, 0.5, x > 1 ? 0.5 : 0);
      if (lod <= 2) { paint(c, null, 'oklch(0.55 0.05 60)', 0.9); for (const bx2 of [-0.22, 0.22]) obox(c, x + bx2, 0.05 + y - 0.005, zb - 0.45 + dz, 0.035, 0.46, 0.515, x > 1 ? 0.5 : 0); } }
    paint(c, STRAW, 'oklch(0.94 0.055 88)', 0.95);
    blob(c, 1.35, 0.03, 0.55, 0.9, 0.62, 0.7, lod <= 2 ? 7 : 5, c.random);
  }
}
const ITEMS = { trough, rick, barn };
export function geometry(ctx) {
  const P = ctx.params; ctx.flat();
  fence(ctx, P);
  for (const it of P.items || []) ITEMS[it.k]?.(frameAt(ctx, it.x, it.z, it.yaw || 0), it);
  ctx.albedo(null);
}
export function collider(ctx) {
  const P = ctx.params, { out, gate } = runs(P);
  for (const [a, b] of out) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); obox(ctx, (a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2, L, 1.25, 0.16, yawAlong(b[0] - a[0], b[1] - a[1])); }
  if (gate) for (const p of [gate.p0, gate.p1]) obox(ctx, p[0], 0, p[1], 0.22, 1.6, 0.22);
  for (const it of P.items || []) {
    const c = frameAt(ctx, it.x, it.z, it.yaw || 0);
    if (it.k === 'trough') obox(c, 0, 0, 0, it.l || 1.9, 0.56, 0.64);
    if (it.k === 'rick') obox(c, 0, 0, 0, (it.r || 1.25) * 1.8, 2.2, (it.r || 1.25) * 1.8);
    if (it.k === 'barn') { const W = it.w || 5, D = it.d || 3.2; obox(c, 0, 0, D / 2 + 0.03, W, 1.95, 0.2);
      for (const s of [-1, 1]) obox(c, s * W / 2, 0, 0.1, 0.14, 1.9, D);
      for (const x of [-W / 6, W / 6]) obox(c, x, 0, -D / 2 + 0.1, 0.2, 2.5, 0.2); }
  }
}
