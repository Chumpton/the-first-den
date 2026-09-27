// The jade dragon: one long lowpoly serpent, head toward −Z, saddle at the origin, the body lying along +Z to a tail tuft.
// Telescoping scale bands (each band's back lip flares over the next) keep the skin closed while the spine bends.
import { DRAGON } from '../lib/data/dragon.js';
const SP = DRAGON.spine.spacing, NB = DRAGON.spine.bones, TAIL = 10.9;
// Colour variants: params { hue, chroma, light } re-hue the jade palette (hue = the body's hue, jade 150; chroma a scale;
// light a lightness lift; colors { MANE: [l, c, h], … } sets single parts). No params = the original jade strings exactly.
const BASE = { JADE: [0.78, 0.13, 150], DORSAL: [0.55, 0.12, 155], FLANK: [0.84, 0.11, 148], BELLY: [0.93, 0.06, 140],
  BELLY2: [0.88, 0.07, 120], MANE: [0.47, 0.11, 158], WHISKER: [0.9, 0.07, 130] };
const ok = ([l, c, h]) => `oklch(${l} ${c} ${h})`;
let JADE, DORSAL, FLANK, BELLY, BELLY2, MANE, WHISKER;
const CREAM = 'oklch(0.94 0.04 90)';
function palette(p = {}) {
  const re = p.hue != null, dh = re ? p.hue - 150 : 0, ck = p.chroma ?? 1, dl = p.light ?? 0;
  const C = {};
  for (const k in BASE) { const [l, c, h] = BASE[k]; C[k] = re || ck !== 1 || dl ? ok([+Math.min(0.97, l + dl).toFixed(3), +(c * ck).toFixed(3), +(((h + dh) % 360 + 360) % 360).toFixed(1)]) : ok(BASE[k]); }
  if (p.colors) for (const k in p.colors) if (k in BASE) C[k] = ok(p.colors[k]); // per-part overrides [l, c, h] (Sage's gold-green mane)
  ({ JADE, DORSAL, FLANK, BELLY, BELLY2, MANE, WHISKER } = C);
}
palette();
export function radiusAt(z) {
  if (z < -0.8) return 0.42 + (z + 1.7) / 0.9 * 0.08;
  if (z < 0) return 0.5 + (z + 0.8) / 0.8 * 0.06;
  if (z < 2.4) return 0.56;
  const t = Math.min(1, (z - 2.4) / (TAIL - 2.4));
  return 0.05 + 0.51 * Math.pow(1 - t, 0.85);
}
export const centreY = (z) => 0.07 + radiusAt(z) * 0.92;
export function skeleton() {
  const s = { root: { pivot: [0, centreY(0), 0] }, n1: { parent: 'root', pivot: [0, centreY(-0.8), -0.8] }, head: { parent: 'n1', pivot: [0, centreY(-1.7), -1.7] } };
  for (let i = 1; i <= NB; i++) s['s' + i] = { parent: i === 1 ? 'root' : 's' + (i - 1), pivot: [0, centreY(i * SP), i * SP] };
  return s;
}
const JOINTS = [{ z: -1.7, a: 'head', b: 'n1' }, { z: -0.8, a: 'n1', b: 'root' }];
for (let i = 1; i <= NB; i++) JOINTS.push({ z: i * SP, a: i === 1 ? 'root' : 's' + (i - 1), b: 's' + i });
export function weightsAt(z, W = 0.3) {
  for (const j of JOINTS) {
    if (z < j.z - W) return j.a;
    if (z <= j.z + W) { const u = (z - (j.z - W)) / (2 * W), t = u * u * (3 - 2 * u); return { [j.a]: 1 - t, [j.b]: t }; }
  }
  return 's' + NB;
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const Q = (ctx, a, b, c, d) => ctx.quad(...a, ...b, ...c, ...d), T = (ctx, a, b, c) => ctx.tri(...a, ...b, ...c);
function ring(sides, cx, cy, z, rx, ry) {
  const pts = [];
  for (let k = 0; k < sides; k++) { const t = -Math.PI / 2 + Math.PI / sides + k * 2 * Math.PI / sides; pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, z]); }
  return pts;
}
function faceColour(ctx, k, sides, band) {
  const mid = -Math.PI / 2 + (k + 1) * 2 * Math.PI / sides - Math.PI / sides + Math.PI / sides, s = Math.sin(mid);
  ctx.color(s > 0.85 ? DORSAL : s > 0.3 ? JADE : s > -0.4 ? FLANK : s > -0.9 ? FLANK : (band % 2 ? BELLY : BELLY2));
}
function bridge(ctx, A, B, band) { // A front ring, B back ring, CCW from outside
  const n = A.length;
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; faceColour(ctx, k, n, band); Q(ctx, A[k], A[k1], B[k1], B[k]); }
}
function tube(ctx, pts, radii, sides, cap = true) {
  let prev = null;
  for (let i = 0; i < pts.length; i++) {
    const t = norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
    let a = cross(t, [0, 1, 0]); if (Math.hypot(...a) < 0.2) a = cross(t, [1, 0, 0]); a = norm(a); const b = cross(a, t);
    const r = [];
    for (let k = 0; k < sides; k++) { const th = k * 2 * Math.PI / sides; r.push(add(pts[i], add(mul(a, Math.cos(th) * radii[i]), mul(b, Math.sin(th) * radii[i])))); }
    if (prev) for (let k = 0; k < sides; k++) { const k1 = (k + 1) % sides; Q(ctx, prev[k], prev[k1], r[k1], r[k]); }
    prev = r;
  }
  if (cap) { const tip = pts[pts.length - 1]; for (let k = 0; k < sides; k++) T(ctx, prev[k], prev[(k + 1) % sides], tip); }
}
const mx = (p) => [-p[0], p[1], p[2]];
export function geometry(ctx) {
  const lod = ctx.lod, sides = lod >= 4 ? 6 : lod >= 3 ? 8 : 10, step = lod >= 5 ? 2.4 : lod >= 4 ? 1.2 : lod >= 3 ? 0.6 : 0.3;
  palette(ctx.params || {});
  ctx.flat(); ctx.roughness(0.72);
  // body: telescoping bands from the neck to the tail
  let band = 0;
  for (let z0 = -1.6; z0 < TAIL - 0.01; z0 += step, band++) {
    const z1 = Math.min(TAIL, z0 + step), zb = Math.min(TAIL, z1 + (lod >= 4 ? 0 : 0.06));
    ctx.bone(weightsAt((z0 + z1) / 2));
    const r0 = radiusAt(z0) * (lod >= 4 ? 1 : 0.95), r1 = radiusAt(z1) * (lod >= 4 ? 1 : 1.04);
    const A = ring(sides, 0, centreY(z0), z0, r0, r0 * 0.92), B = ring(sides, 0, centreY(z1), zb, r1, r1 * 0.92);
    bridge(ctx, A, B, band);
    if (z1 >= TAIL) { const tip = [0, centreY(TAIL), TAIL + 0.1]; ctx.color(MANE); for (let k = 0; k < sides; k++) T(ctx, B[k], B[(k + 1) % sides], tip); }
    // dorsal mane blade, swept back
    if (lod <= 3) {
      const top = centreY(z0) + r0 * 0.92 - 0.03, h = 0.12 + 0.34 * (radiusAt(z0) / 0.56) + (z0 < 0.3 ? 0.18 : 0);
      ctx.color(MANE);
      T(ctx, [0, top, z0], [0, top - 0.02, z0 + step * 0.9], [0, top + h, z0 + step * 1.6]);
      if (lod <= 2 && z0 < 3) { // side locks of the mane along the neck and shoulders
        for (const sx of [-1, 1]) T(ctx, [sx * r0 * 0.55, top - 0.1, z0], [sx * r0 * 0.5, top - 0.12, z0 + step], [sx * (r0 * 0.8 + 0.14), top + h * 0.35, z0 + step * 1.8]);
      }
    }
  }
  // tail tuft
  ctx.bone('s' + NB); ctx.color(MANE);
  const tc = [0, centreY(TAIL), TAIL];
  const fan = lod >= 4 ? 3 : 6;
  for (let i = 0; i < fan; i++) {
    const a = (i / (fan - 1) - 0.5) * 1.9;
    const tipP = [Math.sin(a) * 0.55, tc[1] + Math.cos(a) * 0.55 + 0.1, TAIL + 0.85];
    T(ctx, [tc[0] - 0.05, tc[1], TAIL - 0.35], [tc[0] + 0.05, tc[1], TAIL - 0.35], tipP);
    T(ctx, [0, tc[1] + 0.03, TAIL - 0.3], [0, tc[1] - 0.03, TAIL - 0.3], [Math.sin(a) * 0.4, tc[1] + Math.cos(a) * 0.35 - 0.1, TAIL + 1.0]);
  }
  // head
  ctx.bone('head');
  const H = [[-1.55, 0.44, 0.4, 0.5], [-1.95, 0.5, 0.45, 0.6], [-2.35, 0.43, 0.36, 0.6], [-2.85, 0.33, 0.25, 0.54], [-3.25, 0.27, 0.19, 0.52], [-3.47, 0.15, 0.1, 0.52]];
  const hs = lod >= 4 ? 6 : 8;
  const HR = H.map(([z, rx, ry, cy]) => ring(hs, 0, cy, z, rx, ry));
  for (let i = 0; i < HR.length - 1; i++) bridge(ctx, HR[i], HR[i + 1], 0);
  ctx.color(JADE); const tip = [0, 0.52, -3.55]; const L = HR[HR.length - 1];
  for (let k = 0; k < hs; k++) T(ctx, L[(k + 1) % hs], L[k], tip);
  if (lod <= 3) {
    // lower jaw, pale
    ctx.color(BELLY);
    const j = [[-1.9, 0.36, 0.36], [-2.6, 0.28, 0.3], [-3.25, 0.18, 0.36]];
    for (let i = 0; i < j.length - 1; i++) {
      const [za, wa, ya] = j[i], [zb, wb, yb] = j[i + 1];
      Q(ctx, [-wa, ya, za], [wa, ya, za], [wb, yb, zb], [-wb, yb, zb]);
      Q(ctx, [wa, ya, za], [wa, ya + 0.14, za], [wb, yb + 0.12, zb], [wb, yb, zb]);
      Q(ctx, [-wa, ya + 0.14, za], [-wa, ya, za], [-wb, yb, zb], [-wb, yb + 0.12, zb]);
    }
    // brow ridges, dark
    ctx.color(DORSAL);
    for (const s of [-1, 1]) T(ctx, [s * 0.2, 0.98, -1.85], [s * 0.42, 0.86, -2.05], [s * 0.3, 0.9, -2.45]);
    // eyes, warm gold
    ctx.emissive(2.2, 1.45, 0.35); ctx.color('oklch(0.86 0.16 80)');
    for (const s of [-1, 1]) {
      const c = [s * 0.4, 0.74, -2.18], o = [s * 0.47, 0.76, -2.2];
      const e = [[c[0], c[1] + 0.08, c[2]], [c[0], c[1], c[2] - 0.11], [c[0], c[1] - 0.06, c[2]], [c[0], c[1], c[2] + 0.1]];
      for (let k = 0; k < 4; k++) T(ctx, e[k], e[(k + 1) % 4], o);
    }
    ctx.emissive(null);
    // nostrils
    ctx.color(MANE);
    for (const s of [-1, 1]) T(ctx, [s * 0.1, 0.63, -3.42], [s * 0.2, 0.62, -3.3], [s * 0.13, 0.67, -3.3]);
    // antlers, cream, swept back, one tine each
    ctx.color(CREAM); ctx.roughness(0.6);
    const hsd = lod >= 3 ? 4 : 5;
    const horn = [[0.2, 0.92, -1.95], [0.33, 1.22, -1.62], [0.45, 1.44, -1.1], [0.5, 1.56, -0.5]], hr = [0.09, 0.07, 0.05, 0.01];
    const tine = [[0.37, 1.3, -1.45], [0.55, 1.55, -1.5], [0.64, 1.72, -1.32]], trr = [0.045, 0.028, 0.006];
    tube(ctx, horn, hr, hsd); tube(ctx, horn.map(mx), hr, hsd);
    tube(ctx, tine, trr, 4); tube(ctx, tine.map(mx), trr, 4);
    // head mane crest between the horns
    ctx.color(MANE); ctx.roughness(0.72);
    for (let i = 0; i < 4; i++) { const z = -2.2 + i * 0.22; T(ctx, [0, 0.97 - i * 0.02, z], [0, 0.95, z + 0.25], [0, 1.35 - i * 0.03, z + 0.55]); }
    if (lod <= 2) {
      // whiskers: long barbels curling back
      ctx.color(WHISKER);
      const w = [[0.2, 0.5, -3.32], [0.55, 0.47, -3.22], [0.95, 0.36, -2.85], [1.22, 0.22, -2.25], [1.3, 0.15, -1.6]], wr = [0.035, 0.03, 0.022, 0.014, 0.004];
      tube(ctx, w, wr, 3); tube(ctx, w.map(mx), wr, 3);
    }
  }
  // four small legs with cream claws
  if (lod <= 4) for (const zl of [0.95, 6.1]) {
    ctx.bone(weightsAt(zl)); const r = radiusAt(zl), cy = centreY(zl);
    for (const s of [-1, 1]) {
      ctx.color(JADE);
      const sh = [s * r * 0.75, cy - 0.05, zl], kn = [s * (r + 0.2), cy * 0.45, zl - 0.12], ft = [s * (r + 0.26), 0.05, zl - 0.28];
      tube(ctx, [sh, kn, ft], [0.17 * (r / 0.56) + 0.05, 0.12 * (r / 0.56) + 0.04, 0.1 * (r / 0.56) + 0.03], lod >= 3 ? 4 : 6, false);
      if (lod <= 2) {
        ctx.color(CREAM);
        for (const cx of [-0.07, 0, 0.07]) tube(ctx, [add(ft, [cx, 0, 0]), add(ft, [cx * 1.6, -0.02, -0.18])], [0.035, 0.004], 3, false);
      }
    }
  }
  ctx.bone(null); ctx.color(null);
}
// the shell a body touches: a closed box around the saddle and shoulders
export function collider(ctx) {
  const x0 = -0.62, x1 = 0.62, y0 = 0.05, y1 = 1.18, z0 = -1.9, z1 = 2.6;
  ctx.quad(x0, y0, z0, x0, y1, z0, x1, y1, z0, x1, y0, z0); // front (−Z)
  ctx.quad(x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1); // back
  ctx.quad(x1, y0, z0, x1, y1, z0, x1, y1, z1, x1, y0, z1); // right
  ctx.quad(x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0); // left
  ctx.quad(x0, y1, z0, x0, y1, z1, x1, y1, z1, x1, y1, z0); // top
  ctx.quad(x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1); // bottom
}
