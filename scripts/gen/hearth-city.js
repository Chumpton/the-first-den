// Hearthmere, the walled harvest city: one generator, many kinds. Every row is a merged mesh with ctx.lod trimming.
// kinds: wall (arc a0..a1°, with square towers), gatehouse, keep (great hall + bell tower), brazier (bronze fountain),
// district (a block of townhouses from DISTRICTS[i]), avenue (lamps + banner poles), canal (mill race + wheel).
// All coordinates are city-local (hearthmere row = city centre); a row's own origin is subtracted.
import { TAU, face, box, frustum, ngon, annulus, strut } from "./hearth-mesh.js";
import { TG, AVENUE, CANAL, DISTRICTS } from "../lib/data/hearth-city.js";
const D = Math.PI / 180;
const SANDTEX = "cdn/texture-honey-sandstone-ashlar.png", TILE = "cdn/texture-red-clay-roof-tiles.png",
  PLASTER = "cdn/texture-cream-lime-plaster.png", TIMBER = "cdn/texture-honey-oak-timber.png";
const PAL = {
  sand0: [SANDTEX, "oklch(0.97 0.03 80)", 0.92], sand1: [SANDTEX, "oklch(0.93 0.05 70)", 0.92], sand2: [SANDTEX, "oklch(0.98 0.02 90)", 0.92],
  sandDark: [SANDTEX, "oklch(0.88 0.05 65)", 0.95], plaster: [PLASTER, "oklch(0.97 0.03 85)", 0.92],
  roof0: [TILE, "oklch(0.93 0.04 38)", 0.8], roof1: [TILE, "oklch(0.86 0.07 32)", 0.8], roof2: [TILE, "oklch(0.96 0.05 60)", 0.8],
  timber: [TIMBER, "oklch(0.72 0.05 50)", 0.85], door: [TIMBER, "oklch(0.62 0.07 40)", 0.85],
  glass: [null, "oklch(0.34 0.03 240)", 0.15], lit: [null, "oklch(0.86 0.12 72)", 0.3, [1.5, 0.8, 0.28]],
  stained: [null, "oklch(0.55 0.12 45)", 0.3, [0.9, 0.42, 0.12]],
  red: [null, "oklch(0.5 0.17 27)", 0.9], ochre: [null, "oklch(0.74 0.14 75)", 0.9], gold: [null, "oklch(0.85 0.14 85)", 0.35, null, 0.8],
  shRed: [null, "oklch(0.5 0.14 28)", 0.8], shGreen: [null, "oklch(0.5 0.08 150)", 0.8], shTeal: [null, "oklch(0.55 0.07 210)", 0.8], shOchre: [null, "oklch(0.68 0.12 70)", 0.8],
  iron: [null, "oklch(0.3 0.01 60)", 0.5, null, 0.6], bronze: [null, "oklch(0.66 0.12 65)", 0.35, null, 0.85],
  dark: [null, "oklch(0.18 0.01 50)", 1], ember: [null, "oklch(0.72 0.18 45)", 0.8, [3, 1.1, 0.25]],
  lamp: [null, "oklch(0.9 0.13 90)", 0.5, [2.2, 1.5, 0.5]], water: [null, "oklch(0.6 0.08 200)", 0.08, null, 0, 0.85],
};
function P(ctx, k) {
  const p = PAL[k]; ctx.albedo(p[0]); if (p[5] !== undefined) ctx.color(p[1], p[5]); else ctx.color(p[1]);
  ctx.roughness(p[2]); ctx.metalness(p[4] || 0); if (p[3]) ctx.emissive(...p[3]); else ctx.emissive(null);
}
// a rotated/translated emitter: local −z maps to world heading yaw (radians, three.js R_y)
function xf(t, ox, oy, oz, y) {
  const c = Math.cos(y), s = Math.sin(y), m = (a, i) => [ox + a[i] * c + a[i + 2] * s, oy + a[i + 1], oz - a[i] * s + a[i + 2] * c];
  return { tri: (...a) => t.tri(...m(a, 0), ...m(a, 3), ...m(a, 6)), quad: (...a) => t.quad(...m(a, 0), ...m(a, 3), ...m(a, 6), ...m(a, 9)) };
}
const faceYaw = (fdeg) => -(90 + fdeg) * D; // front (−z) toward heading fdeg = atan2(z, x)
const hash = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
function pyramid(T, hx, hz, y0, y1, cx = 0, cz = 0) {
  const c = [[cx - hx, y0, cz - hz], [cx + hx, y0, cz - hz], [cx + hx, y0, cz + hz], [cx - hx, y0, cz + hz]], a = [cx, y1, cz];
  for (let i = 0; i < 4; i++) { const p = c[i], q = c[(i + 1) % 4]; face(T, [p, q, a], [(p[0] + q[0]) / 2 - cx, hx * 0.6, (p[2] + q[2]) / 2 - cz]); }
}
function merlons(T, hx, hz, y, h = 1.2, sp = 2.4, w = 1.1, t = 0.5) {
  for (const [ax, L, zz] of [["x", hx, -hz], ["x", hx, hz], ["z", hz, -hx], ["z", hz, hx]]) {
    const n = Math.max(2, Math.floor(2 * L / sp));
    for (let i = 0; i < n; i++) {
      const u = -L + (i + 0.5) * (2 * L / n);
      if (ax === "x") box(T, u - w / 2, y, zz - t / 2, u + w / 2, y + h, zz + t / 2, "b");
      else box(T, zz - t / 2, y, u - w / 2, zz + t / 2, y + h, u + w / 2, "b");
    }
  }
}
function banner(T, x, y1, len, w, z, nz = -1) { // hanging cloth with a swallow tail, on the plane z facing nz
  const y0 = y1 - len;
  face(T, [[x - w / 2, y0 + w * 0.5, z], [x + w / 2, y0 + w * 0.5, z], [x + w / 2, y1, z], [x - w / 2, y1, z]], [0, 0, nz]);
  face(T, [[x - w / 2, y0 + w * 0.5, z], [x, y0 + w * 0.15, z], [x - w / 2, y0, z]], [0, 0, nz]);
  face(T, [[x, y0 + w * 0.15, z], [x + w / 2, y0 + w * 0.5, z], [x + w / 2, y0, z]], [0, 0, nz]);
}

// ---------------- townhouse (house-local: front −z, width x, depth z)
const GH = 4, FH = 3.2;
function house(T, h, i, pass, lod) {
  const [, , , w, d, F, st, shop] = h, H = GH + FH * (F - 1), rise = 0.55 * d / 2, Rg = H + rise, k = rise / (d / 2), o = 0.5;
  const fz = -d / 2, bays = Math.max(2, Math.floor(w / 2.6));
  const winX = (j) => -w / 2 + (j + 0.5) * w / bays;
  const doorX = shop ? w / 2 - 1.3 : (w > 7.4 ? -w / 2 + 1.5 : 0);
  const wallK = st === 1 ? "sand1" : st === 2 ? "sand2" : "sand0";
  if (pass === wallK || (pass === "sand0" && st === 3)) {
    box(T, -w / 2, 0, -d / 2, w / 2, st === 3 ? GH : H, d / 2, st === 3 ? "b" : "bt");
    if (st !== 3) for (const sx of [-1, 1]) face(T, [[sx * w / 2, H, -d / 2], [sx * w / 2, H, d / 2], [sx * w / 2, Rg, 0]], [sx, 0, 0]);
    if (lod <= 3) box(T, w / 2 - 1.3, H - 0.5, d / 4 - 0.45, w / 2 - 0.4, Rg + 1.2, d / 4 + 0.45, "b");
  }
  if (pass === "plaster" && st === 3) {
    box(T, -w / 2, GH, -d / 2, w / 2, H, d / 2, "bt");
    for (const sx of [-1, 1]) face(T, [[sx * w / 2, H, -d / 2], [sx * w / 2, H, d / 2], [sx * w / 2, Rg, 0]], [sx, 0, 0]);
  }
  if (pass === ["roof0", "roof1", "roof2"][i % 3]) {
    const yE = H - o * k, x0 = -w / 2 - 0.25, x1 = w / 2 + 0.25;
    face(T, [[x0, yE, -d / 2 - o], [x1, yE, -d / 2 - o], [x1, Rg, 0], [x0, Rg, 0]], [0, 1, -k]);
    face(T, [[x0, yE, d / 2 + o], [x1, yE, d / 2 + o], [x1, Rg, 0], [x0, Rg, 0]], [0, 1, k]);
    if (lod <= 2) box(T, x0, Rg - 0.1, -0.18, x1, Rg + 0.14, 0.18, "b");
  }
  if (lod <= 3 && pass === "sandDark" && lod <= 2) {
    box(T, -w / 2 - 0.1, 0, -d / 2 - 0.1, w / 2 + 0.1, 0.7, d / 2 + 0.1, "b");
    for (let f = 1; f < F; f++) { const y = GH + FH * (f - 1) - 0.12; box(T, -w / 2 - 0.05, y, fz - 0.1, w / 2 + 0.05, y + 0.22, fz, "bs"); }
    for (let f = 1; f < F; f++) for (let j = 0; j < bays; j++) { const y0 = GH + FH * (f - 1) + 0.9; box(T, winX(j) - 0.62, y0 - 0.14, fz - 0.16, winX(j) + 0.62, y0, fz, "bs"); }
  }
  if (pass === "timber" && lod <= 2 && st === 3) {
    for (const x of [-w / 2 + 0.12, 0, w / 2 - 0.12]) box(T, x - 0.12, GH, fz - 0.06, x + 0.12, H, fz, "s");
    for (let f = 1; f < F; f++) { const y = GH + FH * f - 0.15; box(T, -w / 2, y, fz - 0.06, w / 2, y + 0.2, fz, "s"); }
  }
  if (pass === "door" && lod <= 3) {
    face(T, [[doorX - 0.65, 0, fz - 0.03], [doorX + 0.65, 0, fz - 0.03], [doorX + 0.65, 2.5, fz - 0.03], [doorX - 0.65, 2.5, fz - 0.03]], [0, 0, -1]);
  }
  const lit = (f, j) => hash(i * 13 + f, j) < 0.14;
  if ((pass === "glass" || pass === "lit") && lod <= 3) {
    const want = pass === "lit";
    for (let f = 1; f < F; f++) for (let j = 0; j < bays; j++) {
      if (lit(f, j) !== want) continue;
      const y0 = GH + FH * (f - 1) + 0.9, x = winX(j);
      face(T, [[x - 0.5, y0, fz - 0.02], [x + 0.5, y0, fz - 0.02], [x + 0.5, y0 + 1.55, fz - 0.02], [x - 0.5, y0 + 1.55, fz - 0.02]], [0, 0, -1]);
      if (lod <= 2) face(T, [[x - 0.5, y0, -fz + 0.02], [x + 0.5, y0, -fz + 0.02], [x + 0.5, y0 + 1.55, -fz + 0.02], [x - 0.5, y0 + 1.55, -fz + 0.02]], [0, 0, 1]);
    }
    if (!want) {
      if (shop) { const a = -w / 2 + 0.6, b = w / 2 - 2.3; if (b > a) face(T, [[a, 0.7, fz - 0.02], [b, 0.7, fz - 0.02], [b, 2.9, fz - 0.02], [a, 2.9, fz - 0.02]], [0, 0, -1]); }
      else for (const x of [doorX + 2, doorX - 2]) if (Math.abs(x) < w / 2 - 0.7) face(T, [[x - 0.5, 1.1, fz - 0.02], [x + 0.5, 1.1, fz - 0.02], [x + 0.5, 2.6, fz - 0.02], [x - 0.5, 2.6, fz - 0.02]], [0, 0, -1]);
    }
  }
  if (pass === ["shRed", "shGreen", "shTeal", "shOchre"][Math.floor(hash(i, 5) * 4)] && lod <= 2) {
    for (let f = 1; f < F; f++) for (let j = 0; j < bays; j++) {
      const y0 = GH + FH * (f - 1) + 0.9, x = winX(j);
      for (const sx of [-1, 1]) face(T, [[x + sx * 0.55, y0, fz - 0.04], [x + sx * 1.02, y0, fz - 0.04], [x + sx * 1.02, y0 + 1.55, fz - 0.04], [x + sx * 0.55, y0 + 1.55, fz - 0.04]], [0, 0, -1]);
    }
  }
  const cloth = hash(i, 9) < 0.5 ? "red" : "ochre";
  if (pass === cloth && lod <= 3) {
    if (shop) { const a = -w / 2 + 0.4, b = w / 2 - 2.1; if (b > a) face(T, [[a, 3.35, fz], [b, 3.35, fz], [b, 2.75, fz - 1.4], [a, 2.75, fz - 1.4]], [0, 1, -0.4]); }
    if (hash(i, 7) < 0.16 && F >= 3) banner(T, w / 2 - 1.1, H - 0.5, 3.6, 1.1, fz - 0.1);
  }
}
function district(ctx, T, lod) {
  const Dd = DISTRICTS[ctx.params.i], passes = ["sand0", "sand1", "sand2", "plaster", "roof0", "roof1", "roof2", "sandDark", "timber", "door", "glass", "lit", "shRed", "shGreen", "shTeal", "shOchre", "red", "ochre"];
  for (const pass of passes) {
    P(ctx, pass);
    Dd.h.forEach((h, j) => house(xf(T, h[0], 0, h[1], faceYaw(h[2])), h, ctx.params.i * 1000 + j, pass, lod));
  }
}

// ---------------- curtain wall and towers
const RI = 169.5, RO = 174.5, WH = 12, TOWERS = [];
for (let k = 1; k < 16; k++) TOWERS.push(TG + k * 22.5);
function wallRow(ctx, T, lod, col) {
  const { a0, a1, mx, mz } = ctx.params;
  const Pp = (r, a, y) => [r * Math.cos(a * D) - mx, y, r * Math.sin(a * D) - mz];
  const tw = TOWERS.filter((a) => a > a0 && a < a1);
  let spans = [[a0, a1]];
  for (const t of tw) spans = spans.flatMap(([s, e]) => (t - 1.95 > s && t + 1.95 < e) ? [[s, t - 1.95], [t + 1.95, e]] : [[s, e]]);
  const segs = [];
  for (const [s, e] of spans) { const n = Math.max(1, Math.ceil((e - s) / 2)); for (let i = 0; i < n; i++) segs.push([s + (e - s) * i / n, s + (e - s) * (i + 1) / n]); }
  const out = (a) => [Math.cos(a * D), 0, Math.sin(a * D)], inn = (a) => [-Math.cos(a * D), 0, -Math.sin(a * D)];
  const Q = (r0, y0, r1, y1, s, e, n) => face(T, [Pp(r0, s, y0), Pp(r0, e, y0), Pp(r1, e, y1), Pp(r1, s, y1)], n);
  if (col) {
    for (const [s, e] of segs) { const m = (s + e) / 2; Q(RO, -0.5, RO, 13.4, s, e, out(m)); Q(RI, -0.5, RI, WH, s, e, inn(m)); Q(RI, WH, RO, WH, s, e, [0, 1, 0]); }
    for (const a of tw) box(xf(T, ...Pp(172.5, a, 0), faceYaw(a)), -5.5, -0.5, -5.5, 5.5, 17.4, 5.5);
    return;
  }
  P(ctx, "sand1");
  for (const [s, e] of segs) {
    const m = (s + e) / 2;
    Q(RO, lod <= 2 ? 2.5 : -0.5, RO, 13.4, s, e, out(m)); Q(RI, -0.5, RI, WH, s, e, inn(m));
    Q(RI, WH, RO - 0.6, WH, s, e, [0, 1, 0]); Q(RO - 0.6, WH, RO - 0.6, 13.4, s, e, inn(m)); Q(RO - 0.6, 13.4, RO, 13.4, s, e, [0, 1, 0]);
    if (lod <= 2) { Q(RI, WH, RI, 12.9, s, e, inn(m)); Q(RI, 12.9, RI + 0.4, 12.9, s, e, [0, 1, 0]); Q(RI + 0.4, 12.9, RI + 0.4, WH, s, e, out(m)); }
  }
  if (lod <= 3) for (const [s, e] of segs) {
    const len = (e - s) * D * RO, n = Math.max(1, Math.floor(len / 2.6));
    for (let i = 0; i < n; i++) { const a = s + (e - s) * (i + 0.5) / n; box(xf(T, ...Pp(RO - 0.3, a, 0), faceYaw(a)), -0.65, 13.4, -0.3, 0.65, 14.6, 0.3, "b"); }
  }
  for (const a of tw) {
    const t = xf(T, ...Pp(172.5, a, 0), faceYaw(a));
    box(t, -5.5, -0.5, -5.5, 5.5, lod <= 2 ? 15.4 : 17.4, 5.5, "b");
    if (lod <= 2) box(t, -6, 15.4, -6, 6, 17.4, 6);
    if (lod <= 3) merlons(t, lod <= 2 ? 5.75 : 5.25, lod <= 2 ? 5.75 : 5.25, 17.4);
  }
  P(ctx, "sandDark");
  if (lod <= 2) for (const [s, e] of segs) { const m = (s + e) / 2; face(T, [Pp(RO + 1.3, s, -0.5), Pp(RO + 1.3, e, -0.5), Pp(RO, e, 2.5), Pp(RO, s, 2.5)], [Math.cos(m * D), 1, Math.sin(m * D)]); Q(RO + 0.3, 10, RO + 0.3, 10.35, s, e, out(m)); Q(RO, 10.35, RO + 0.3, 10.35, s, e, [0, 1, 0]); Q(RO, 10, RO + 0.3, 10, s, e, [0, -1, 0]); }
  P(ctx, "roof1");
  for (const a of tw) pyramid(xf(T, ...Pp(172.5, a, 0), faceYaw(a)), 5.2, 5.2, 17.4, 25.5);
  if (lod <= 2) { P(ctx, "dark"); for (const a of tw) { const t = xf(T, ...Pp(172.5, a, 0), faceYaw(a)); for (const y of [5, 10.5]) face(t, [[-0.25, y, -5.52], [0.25, y, -5.52], [0.25, y + 1.8, -5.52], [-0.25, y + 1.8, -5.52]], [0, 0, -1]); } }
  if (lod <= 3) for (const k of ["red", "ochre"]) { P(ctx, k); tw.forEach((a, j) => { if ((TOWERS.indexOf(a) % 2 === 0) === (k === "red")) banner(xf(T, ...Pp(172.5, a, 0), faceYaw(a)), 0, 15.2, 7.5, 2.4, -6.08); }); }
}

// ---------------- the great gatehouse (local: front −z outward, passage 10 m wide, 13 m high)
function arch(T, z, nz) { // pointed-arch spandrels between x −5..5, spring 4.5, apex ~13.2, up to 13.3
  const pts = []; for (let i = 0; i <= 8; i++) { const x = -5 + i * 10 / 8; const y = x <= 0 ? 4.5 + Math.sqrt(Math.max(0, 100 - (x - 5) ** 2)) : 4.5 + Math.sqrt(Math.max(0, 100 - (x + 5) ** 2)); pts.push([x, Math.min(13.25, y)]); }
  for (let i = 0; i < 8; i++) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1]; if (Math.max(ya, yb) < 13.24) face(T, [[xa, ya, z], [xb, yb, z], [xb, 13.3, z], [xa, 13.3, z]], [0, 0, nz]); }
}
function gatehouse(ctx, T, lod, col) {
  if (col) { box(T, 5, -0.5, -11, 19.5, 22, 7); box(T, -19.5, -0.5, -11, -5, 22, 7); box(T, -5, 13.2, -9, 5, 20, 5); return; }
  P(ctx, "sand1");
  for (const s of [-1, 1]) {
    const x0 = s * 5, x1 = s * 19.5;
    box(T, x0, lod <= 2 ? 2 : -0.5, -11, x1, lod <= 2 ? 20 : 22, 7, "b");
    if (lod <= 2) box(T, x0 + s * -0.0, 20, -11.5, x1 + s * 0.5, 22, 7.5);
    if (lod <= 3) merlons(T, 0, 0, 0, 0); // no-op keeps signature honest
  }
  box(T, -5, 13.2, -9, 5, 20, 5, "");
  arch(T, -9.02, -1); arch(T, 5.02, 1);
  P(ctx, "sandDark");
  if (lod <= 2) for (const s of [-1, 1]) {
    const x0 = s * 4.6, x1 = s * 20.5; box(T, x0, -0.5, -12.4, x1, 2, 7.8, "b");
  }
  if (lod <= 3) {
    for (const s of [-1, 1]) { const t = xf(T, s * 12.25, 0, -2, 0); merlons(t, 7.6, 9.3, 22, 1.4, 2.6, 1.3, 0.6); }
    merlons(T, 4.6, 6.6, 20, 1.2, 2.4, 1.1, 0.5);
    box(T, -5.4, 4.2, -9.4, -4.6, 4.8, -8.9, ""); box(T, 4.6, 4.2, -9.4, 5.4, 4.8, -8.9, "");
  }
  P(ctx, "roof1");
  for (const s of [-1, 1]) pyramid(T, 7.4, 9.2, 22, 33, s * 12.25, -2);
  if (lod <= 2) { P(ctx, "dark"); for (const s of [-1, 1]) for (const y of [7, 12, 16.5]) for (const xo of [-3, 3]) face(T, [[s * 12.25 + xo - 0.3, y, -11.02], [s * 12.25 + xo + 0.3, y, -11.02], [s * 12.25 + xo + 0.3, y + 2, -11.02], [s * 12.25 + xo - 0.3, y + 2, -11.02]], [0, 0, -1]); }
  if (lod <= 2) { P(ctx, "iron"); for (let i = 0; i < 9; i++) { const x = -4.6 + i * 1.15; box(T, x - 0.07, 10.6, -8.2, x + 0.07, 13.2, -8.0); } for (const y of [11, 12, 12.9]) box(T, -4.9, y - 0.07, -8.2, 4.9, y + 0.07, -8.0); }
  if (lod <= 3) { P(ctx, "door"); for (const s of [-1, 1]) box(T, s * 4.55, 0, -7.8, s * 4.95, 7.6, -2.6); }
  if (lod <= 3) { P(ctx, "bronze"); ngon(T, [0, 16.6, -9.06], [1, 0, 0], [0, 1, 0], 1.7, 16, [0, 0, -1]); strut(T, [0, 20, 0], [0, 29, 0], 0.12, 0.08, 6); }
  if (lod <= 3) {
    P(ctx, "red"); for (const s of [-1, 1]) banner(T, s * 12.25, 20.2, 11, 3.2, -11.1);
    P(ctx, "ochre"); for (const s of [-1, 1]) banner(T, s * 12.25, 19, 9, 2.6, 7.1, 1);
    face(T, [[0.1, 28.8, 0], [4.6, 28.2, 0], [4.6, 25.6, 0], [0.1, 26.2, 0]], [0, 0, -1]);
    P(ctx, "gold"); face(T, [[0, 17.3, -9.1], [0.7, 16.6, -9.1], [0, 15.4, -9.1], [-0.7, 16.6, -9.1]], [0, 0, -1]);
  }
}

// ---------------- the great hall / keep with its bell tower (local: front −z)
function keep(ctx, T, lod, col) {
  if (col) { box(T, -12, -0.5, -21, 12, 16, 20); box(T, -25, -0.5, -25, -15, 47, -15); box(T, -15.1, -0.5, -23.1, -9.9, 24, -17.9); box(T, 9.9, -0.5, -23.1, 15.1, 24, -17.9); box(T, 10, -0.5, 16, 18, 22, 24); box(T, -18, -0.5, 16, -10, 22, 24); return; }
  P(ctx, "sand0");
  box(T, -12, -0.5, -20, 12, 16, 20, "bt");
  for (const z of [-20, 20]) face(T, [[-12, 16, z], [12, 16, z], [0, 28, z]], [0, 0, Math.sign(z)]);
  for (const s of [-1, 1]) { box(T, s * 10, -0.5, 16, s * 18, 22, 24, "b"); }
  frustum(T, -12.5, -20.5, -0.5, 24, 2.6, 2.6, lod <= 3 ? 8 : 6, "", 0); frustum(T, 12.5, -20.5, -0.5, 24, 2.6, 2.6, lod <= 3 ? 8 : 6, "", 0);
  box(T, -25, -0.5, -25, -15, lod <= 3 ? 38 : 47, -15, "b");
  if (lod <= 3) {
    for (const [x, z] of [[-25, -25], [-16.6, -25], [-25, -16.6], [-16.6, -16.6]]) box(T, x, 38, z, x + 1.6, 44.5, z + 1.6);
    box(T, -25.4, 44.5, -25.4, -14.6, 47, -14.6); merlons(xf(T, -20, 0, -20, 0), 5.2, 5.2, 47, 1.1, 2.4, 1, 0.5);
    for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { const z = -15 + i * 5; box(T, s * 12, -0.5, z - 0.6, s * 13.4, 9, z + 0.6, "b"); box(T, s * 12, 9, z - 0.5, s * 12.8, 13, z + 0.5, "b"); }
    box(T, -4.2, -0.5, -21, 4.2, 10.5, -20, "b");
  }
  P(ctx, "sandDark");
  if (lod <= 2) { box(T, -12.3, -0.5, -20.3, 12.3, 1.2, 20.3, "b"); for (const y of [13, 26]) box(T, -25.3, y, -25.3, -14.7, y + 0.5, -14.7); box(T, -25.2, 37.6, -25.2, -14.8, 38.1, -14.8); annulus(T, [0, 19.5, -20.04], [1, 0, 0], [0, 1, 0], 3.2, 3.9, 16, [0, 0, -1]); }
  P(ctx, "roof1");
  const rq = (a, b, c, d2, n) => face(T, [a, b, c, d2], n);
  rq([-12.8, 15.6, -20.4], [-12.8, 15.6, 20.4], [0, 28, 20.4], [0, 28, -20.4], [-1, 1, 0]);
  rq([12.8, 15.6, -20.4], [12.8, 15.6, 20.4], [0, 28, 20.4], [0, 28, -20.4], [1, 1, 0]);
  for (const s of [-1, 1]) pyramid(T, 4.6, 4.6, 22, 30, s * 14, 20);
  frustum(T, -12.5, -20.5, 24, 31.5, 3.1, 0, 8); frustum(T, 12.5, -20.5, 24, 31.5, 3.1, 0, 8);
  pyramid(T, 5, 5, 47, 63, -20, -20);
  P(ctx, "door"); face(T, [[-2.8, 0, -21.03], [2.8, 0, -21.03], [2.8, 6, -21.03], [-2.8, 6, -21.03]], [0, 0, -1]); face(T, [[-2.8, 6, -21.03], [2.8, 6, -21.03], [0, 8.4, -21.03]], [0, 0, -1]);
  if (lod <= 3) {
    P(ctx, "stained"); ngon(T, [0, 19.5, -20.05], [1, 0, 0], [0, 1, 0], 3.2, 16, [0, 0, -1]);
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = -12.5 + i * 5; face(T, [[s * 12.02, 5, z - 0.9], [s * 12.02, 5, z + 0.9], [s * 12.02, 11.5, z + 0.9], [s * 12.02, 11.5, z - 0.9]], [s, 0, 0]); face(T, [[s * 12.02, 11.5, z - 0.9], [s * 12.02, 11.5, z + 0.9], [s * 12.02, 13, z]], [s, 0, 0]); }
    P(ctx, "bronze"); for (const [nx, nz, c] of [[0, -1, [-20, 32, -25.05]], [-1, 0, [-25.05, 32, -20]]]) ngon(T, c, nx ? [0, 0, 1] : [1, 0, 0], [0, 1, 0], 1.9, 16, [nx, 0, nz]);
    frustum(T, -20, -20, 40.2, 43, 2.2, 1.1, 10, "t"); strut(T, [-20, 63, -20], [-20, 65, -20], 0.35, 0.05, 6);
    P(ctx, "red"); banner(T, -20, 25, 9, 2.4, -25.08); banner(xf(T, -25.08, 0, -20, -Math.PI / 2), 0, 25, 9, 2.4, 0);
    P(ctx, "ochre"); for (const s of [-1, 1]) banner(T, s * 7, 14.5, 9, 2.2, -20.08);
  }
}

// ---------------- bronze brazier fountain (basin r 7, bowl at 9 m)
function brazier(ctx, T, lod, col) {
  const oct = (r) => { const o = []; for (let i = 0; i < 8; i++) { const a = (i + 0.5) * TAU / 8; o.push([Math.cos(a) * r, Math.sin(a) * r]); } return o; };
  if (col) { frustum(T, 0, 0, 0, 0.85, 7, 7, 8, "t", TAU / 16); frustum(T, 0, 0, 0, 9.4, 2.6, 2.6, 8, "t", TAU / 16); return; }
  P(ctx, "sandDark");
  frustum(T, 0, 0, 0, 0.25, 7.8, 7.8, 8, "t", TAU / 16);
  frustum(T, 0, 0, 0.25, 0.85, 7, 7, 8, "", TAU / 16);
  frustum(T, 0, 0, 0.25, 0.85, 6.4, 6.4, 8, "", TAU / 16);
  const O = oct(7), I = oct(6.4); for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; face(T, [[O[i][0], 0.85, O[i][1]], [O[j][0], 0.85, O[j][1]], [I[j][0], 0.85, I[j][1]], [I[i][0], 0.85, I[i][1]]], [0, 1, 0]); }
  frustum(T, 0, 0, 0, 1.6, 2.6, 2.2, 8, "t", TAU / 16); frustum(T, 0, 0, 1.6, 3, 1.6, 1.2, 8, "t", TAU / 16);
  P(ctx, "water"); ngon(T, [0, 0.62, 0], [1, 0, 0], [0, 0, 1], 6.45, 8, [0, 1, 0], TAU / 16);
  P(ctx, "bronze");
  const n = lod <= 2 ? 16 : 8;
  frustum(T, 0, 0, 3, 7, 0.9, 0.7, n, "");
  frustum(T, 0, 0, 7, 9, 0.7, 3.6, n, ""); frustum(T, 0, 0, 9, 9.4, 3.6, 3.8, n, ""); frustum(T, 0, 0, 8.3, 9.35, 0.6, 3.45, n, "");
  if (lod <= 2) for (const y of [3.2, 5, 6.8]) frustum(T, 0, 0, y, y + 0.25, 1.0, 1.0, n, "tb");
  if (lod <= 3) for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + TAU / 8, c = Math.cos(a), s = Math.sin(a); strut(T, [c * 0.8, 4.6, s * 0.8], [c * 2.4, 3.4, s * 2.4], 0.16, 0.13, 6); strut(T, [c * 2.4, 3.4, s * 2.4], [c * 2.9, 2.7, s * 2.9], 0.13, 0.1, 6); }
  if (lod <= 2) for (const [x, z] of O) { strut(T, [x, 0.85, z], [x, 1.9, z], 0.12, 0.1, 6); frustum(T, x, z, 1.9, 2.3, 0.1, 0.3, 6, ""); }
  P(ctx, "ember"); ngon(T, [0, 9.05, 0], [1, 0, 0], [0, 0, 1], 3.1, n, [0, 1, 0]);
  if (lod <= 2) for (const [x, z] of O) ngon(T, [x, 2.2, z], [1, 0, 0], [0, 0, 1], 0.24, 6, [0, 1, 0]);
}

// ---------------- avenue lamps + banner poles
function avenue(ctx, T, lod, col) {
  const { mx, mz } = ctx.params; let acc = 0, k = 0;
  const posts = [];
  for (let i = 0; i < AVENUE.length - 1; i++) {
    const [ax, az] = AVENUE[i], [bx, bz] = AVENUE[i + 1], L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L;
    for (let s = (16 - acc % 16) % 16; s < L; s += 16) {
      const x = ax + tx * s, z = az + tz * s, r = Math.hypot(x, z);
      if (r < 150 && r > 44) for (const side of [-1, 1]) posts.push({ x: x - tz * side * 4.6 - mx, z: z + tx * side * 4.6 - mz, tx, tz, kind: (k + (side > 0 ? 1 : 0)) % 2, n: k });
      k++;
    }
    acc += L;
  }
  if (col) { for (const p of posts) box(T, p.x - 0.18, 0, p.z - 0.18, p.x + 0.18, 4, p.z + 0.18); return; }
  P(ctx, "iron");
  for (const p of posts) {
    if (p.kind === 0) { box(T, p.x - 0.1, 0, p.z - 0.1, p.x + 0.1, 4.4, p.z + 0.1); if (lod <= 3) box(T, p.x - 0.3, 4.4, p.z - 0.3, p.x + 0.3, 4.5, p.z + 0.3); if (lod <= 3) frustum(T, p.x, p.z, 5.2, 5.6, 0.36, 0, 4, "b", TAU / 8); }
    else { box(T, p.x - 0.09, 0, p.z - 0.09, p.x + 0.09, 7.6, p.z + 0.09); }
  }
  if (lod <= 3) { P(ctx, "lamp"); for (const p of posts) if (p.kind === 0) box(T, p.x - 0.24, 4.5, p.z - 0.24, p.x + 0.24, 5.2, p.z + 0.24); }
  if (lod <= 3) for (const col2 of ["red", "ochre"]) {
    P(ctx, col2);
    for (const p of posts) if (p.kind === 1 && ((p.n % 2 === 0) === (col2 === "red"))) {
      const t = xf(T, p.x, 0, p.z, Math.atan2(p.tx, p.tz)); // local z along the avenue: faces travellers
      banner(t, 0, 7.1, 4, 1.2, 0.12, -1); banner(t, 0, 7.1, 4, 1.2, 0.1, 1);
    }
  }
  if (lod <= 2) { P(ctx, "bronze"); for (const p of posts) if (p.kind === 1) { box(T, p.x - 0.7, 7.1, p.z - 0.05, p.x + 0.7, 7.2, p.z + 0.05); frustum(T, p.x, p.z, 7.6, 8, 0.16, 0, 6, "b"); } }
}

// ---------------- the mill race: stone kerbs, water ribbon, a timber wheel
function canal(ctx, T, lod, col) {
  const { mx, mz } = ctx.params, [a, b] = [CANAL[0], [-126, 91]];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  const t = xf(T, (a[0] + b[0]) / 2 - mx, 0, (a[1] + b[1]) / 2 - mz, yaw); // local −z runs a→b
  if (col) { for (const s of [-1, 1]) box(t, s * 2, 0, -L / 2, s * 2.6, 0.5, L / 2); return; }
  P(ctx, "sandDark"); for (const s of [-1, 1]) box(t, s * 2, -0.3, -L / 2, s * 2.6, 0.5, L / 2, "b");
  box(t, -2.6, -0.3, L / 2, 2.6, 0.9, L / 2 + 0.5, "b"); box(t, -2.6, -0.3, -L / 2 - 0.5, 2.6, 0.5, -L / 2, "b");
  P(ctx, "dark"); face(t, [[-2, -0.3, -L / 2], [2, -0.3, -L / 2], [2, -0.3, L / 2], [-2, -0.3, L / 2]], [0, 1, 0]);
  P(ctx, "water"); face(t, [[-2, 0.22, -L / 2], [2, 0.22, -L / 2], [2, 0.22, L / 2], [-2, 0.22, L / 2]], [0, 1, 0]);
  if (lod <= 3) { P(ctx, "timber"); const zc = 0, yc = 1.6; for (let i = 0; i < 8; i++) { const an = i * TAU / 8; strut(t, [0, yc, zc], [0, yc + Math.sin(an) * 2.2, zc + Math.cos(an) * 2.2], 0.08, 0.08, 4); box(t, -0.8, yc + Math.sin(an) * 2.2 - 0.25, zc + Math.cos(an) * 2.2 - 0.06, 0.8, yc + Math.sin(an) * 2.2 + 0.25, zc + Math.cos(an) * 2.2 + 0.06); } strut(t, [-2.6, yc, zc], [2.6, yc, zc], 0.14, 0.14, 6); }
}

function run(ctx, col) {
  const T = { tri: (...a) => ctx.tri(...a), quad: (...a) => ctx.quad(...a) }, lod = col ? 1 : ctx.lod, k = ctx.params.kind;
  if (k === "wall") return wallRow(ctx, T, lod, col);
  if (k === "gatehouse") return gatehouse(ctx, T, lod, col);
  if (k === "keep") return keep(ctx, T, lod, col);
  if (k === "brazier") return brazier(ctx, T, lod, col);
  if (k === "avenue") return avenue(ctx, T, lod, col);
  if (k === "canal") return canal(ctx, T, lod, col);
  if (k === "district") {
    if (col) { const Dd = DISTRICTS[ctx.params.i]; for (const h of Dd.h) { const H = GH + FH * (h[5] - 1); box(xf(T, h[0], 0, h[1], faceYaw(h[2])), -h[3] / 2, 0, -h[4] / 2, h[3] / 2, H, h[4] / 2); } return; }
    return district(ctx, T, lod);
  }
}
export function geometry(ctx) { ctx.flat(); run(ctx, false); }
export function collider(ctx) { run(ctx, true); }
