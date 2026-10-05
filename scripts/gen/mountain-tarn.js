import { softened } from "./soften.js";
// Mirror Tarn: one family for every made thing at the tarn (82,78). params.part picks the piece; params.v seeds variants.
// Frames: feet at y 0, front -Z. Knoll/falls frame: the water runs toward +Z (the object is yawed so +Z faces the lake).
const TEX = {
  rock: "cdn/texture-weathered-pale-limestone.png",
  moss: "cdn/texture-soft-green-moss.png",
  pine: "cdn/texture-dark-pine-bark.png",
  birch: "cdn/texture-silver-birch-bark.png",
  oak: "cdn/texture-honey-oak-planks.png",
  walnut: "cdn/texture-walnut-wood.png",
};
const PAINT = {
  rock: [TEX.rock, "oklch(0.96 0.02 85)", 0.92],
  moss: [TEX.moss, "oklch(0.93 0.05 130)", 0.96],
  pine: [TEX.pine, "oklch(0.92 0.02 60)", 0.95],
  birch: [TEX.birch, "oklch(0.98 0.01 90)", 0.8],
  oak: [TEX.oak, "oklch(0.95 0.03 75)", 0.8],
  walnut: [TEX.walnut, "oklch(0.92 0.02 60)", 0.75],
  plain: [null, "oklch(0.5 0.1 140)", 0.9],
};
const TAU = Math.PI * 2;
function rng(seed) {
  let s = (Math.floor(seed * 7919 + 12345) >>> 0) || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function emitter(ctx, draw) {
  let cur = null;
  return {
    q: (a, b, c, d) => ctx.quad(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]),
    t: (a, b, c) => ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]),
    paint: (k, col) => {
      if (!draw) return;
      const key = k + (col || "");
      if (key === cur) return;
      cur = key;
      const p = PAINT[k];
      ctx.albedo(p[0]);
      ctx.color(col || p[1]);
      ctx.roughness(p[2]);
    },
  };
}
function ny(a, b, c) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  return n[1] / (Math.hypot(n[0], n[1], n[2]) || 1);
}
// rings: arrays of points, angle increasing from +X toward +Z; sides outward
function loft(e, rings, capTop, capBot, kindFn, bump = 0) {
  const n = rings[0].length;
  for (let r = 0; r < rings.length - 1; r++) {
    const A = rings[r], B = rings[r + 1];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      if (kindFn) e.paint(kindFn(ny(A[i], B[i], B[j])));
      e.q(A[i], B[i], B[j], A[j]);
    }
  }
  const cen = (R, dy) => { const c = [0, 0, 0]; for (const p of R) { c[0] += p[0] / R.length; c[1] += p[1] / R.length; c[2] += p[2] / R.length; } c[1] += dy; return c; };
  if (capTop) { const R = rings[rings.length - 1], c = cen(R, bump); if (kindFn) e.paint(kindFn(1)); for (let i = 0; i < n; i++) e.t(c, R[(i + 1) % n], R[i]); }
  if (capBot) { const R = rings[0], c = cen(R, 0); for (let i = 0; i < n; i++) e.t(c, R[i], R[(i + 1) % n]); }
}
function ring(x, y, z, rx, rz, n, rot = 0) {
  const R = [];
  for (let i = 0; i < n; i++) { const a = rot + (i / n) * TAU; R.push([x + Math.cos(a) * rx, y, z + Math.sin(a) * rz]); }
  return R;
}
function box(e, x0, y0, z0, x1, y1, z1) {
  e.q([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]);
  e.q([x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]);
  e.q([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]);
  e.q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);
  e.q([x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]);
  e.q([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]);
}
// a rock: noisy lofted lump. o: x,z base centre, rx,rz, h, sink, yaw, seed, n, flat, moss (ny threshold)
function rock(e, o) {
  const R = rng(o.seed), n = o.n || 9;
  const jit = [];
  for (let i = 0; i < n; i++) jit.push(o.flat ? 0.95 + R() * 0.1 : 0.82 + R() * 0.33);
  const prof = o.flat
    ? [[-o.sink, 0.86], [o.h * 0.5, 1], [o.h - 0.28, 0.96], [o.h, 0.86]]
    : [[-o.sink, 0.8], [o.h * 0.4, 1], [o.h * 0.78, 0.86], [o.h * 0.95, 0.52]];
  const c = Math.cos(o.yaw || 0), s = Math.sin(o.yaw || 0), last = prof.length - 1;
  const rings = prof.map(([y, sc], k) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const th = (i / n) * TAU + (R() - 0.5) * 0.25, j = jit[i] * (1 + (R() - 0.5) * 0.08);
      const lx = Math.cos(th) * o.rx * sc * j, lz = Math.sin(th) * o.rz * sc * j;
      const dy = k === last ? (o.flat ? 0 : (R() - 0.35) * o.h * 0.12) : k > 0 ? (R() - 0.5) * o.h * 0.08 : 0;
      out.push([o.x + lx * c + lz * s, y + dy, o.z - lx * s + lz * c]);
    }
    return out;
  });
  const thr = o.moss ?? 0.55;
  loft(e, rings, true, o.sink > 0.4, (y) => (y > thr ? "moss" : "rock"), o.flat ? 0 : o.h * 0.06);
}
// ---- the knoll: stepped flow tiers down the lake face, massed lumps behind and beside
const TIERS = [
  { z: -3, hl: 4.2, hw: 3.2, h: 8, sink: 1.5 },
  { z: 2.6, hl: 2.2, hw: 2.4, h: 5.5, sink: 1.5 },
  { z: 5.6, hl: 1.4, hw: 2.0, h: 3.0, sink: 2 },
  { z: 7.6, hl: 1.1, hw: 1.6, h: 1.0, sink: 3 },
];
const MASS = [
  [0, -6.5, 4.2, 3.5, 8.8, 0.2], [4.5, -2, 2.6, 3, 6.5, 0.5], [-4.6, -1.5, 2.6, 3.2, 6.0, -0.4], [3.8, 3.5, 2, 2.4, 3.6, 0.3],
  [-3.6, 4.2, 1.8, 2.2, 2.6, -0.2], [2.4, 7.2, 1.3, 1.3, 1.2, 0.8], [-5.5, -6, 2.5, 2.5, 4.5, 1.1], [6, -6.5, 2.4, 2.6, 5, -0.9],
  [-7.4, 1.8, 1.6, 1.8, 2.4, 0.4], [7.6, 1.2, 1.7, 1.5, 3.0, -0.6], [0.5, -10, 3, 2.4, 5.5, 0.1],
];
function knoll(e, lod) {
  const n = lod >= 4 ? 6 : 9;
  TIERS.forEach((t, i) => rock(e, { x: 0, z: t.z, rx: t.hw, rz: t.hl, h: t.h, sink: t.sink, seed: 11 + i, n, flat: true, moss: 0.8 }));
  MASS.forEach((m, i) => rock(e, { x: m[0], z: m[1], rx: m[2], rz: m[3], h: m[4], sink: 2, yaw: m[5], seed: 31 + i, n, moss: 0.5 }));
}
function fallsPath(wl) {
  const P = [[-1.6, TIERS[0].h + 0.03]];
  TIERS.forEach((t, i) => {
    const lip = t.z + t.hl * 0.86 * 1.05 + 0.05, out = t.z + t.hl * 1.05 + 0.12;
    const next = i + 1 < TIERS.length ? TIERS[i + 1].h + 0.03 : wl;
    P.push([lip, t.h + 0.03], [out, t.h - 0.3], [out + 0.02, next]);
  });
  return P;
}
function falls(ctx, e, wl) {
  const P = fallsPath(wl);
  const strip = (w, dz, col, a) => {
    ctx.color(col, a);
    for (let i = 0; i < P.length - 1; i++) {
      const [z0, y0] = P[i], [z1, y1] = P[i + 1], vertical = Math.abs(y1 - y0) > Math.abs(z1 - z0);
      const w0 = vertical ? w * 0.75 : w, w1 = w0;
      e.q([-w0 / 2, y0, z0 + dz], [w0 / 2, y0, z0 + dz], [w1 / 2, y1, z1 + dz], [-w1 / 2, y1, z1 + dz]);
    }
  };
  ctx.albedo(null);
  ctx.roughness(0.08);
  ctx.metalness(0.1);
  ctx.emissive("oklch(0.45 0.05 200)");
  strip(0.62, 0, "oklch(0.9 0.05 200)", 0.62);
  ctx.emissive("oklch(0.7 0.03 200)");
  strip(0.22, 0.03, "oklch(0.99 0.01 200)", 0.55);
  // foam pads where each drop lands
  ctx.emissive("oklch(0.6 0.02 200)");
  ctx.color("oklch(0.98 0.01 200)", 0.5);
  for (let i = 3; i < P.length; i += 3) {
    const [z, y] = P[i], R = ring(0, y + 0.02, z + 0.15, 0.45, 0.3, 8);
    for (let k = 0; k < 8; k++) e.t([0, y + 0.02, z + 0.15], R[(k + 1) % 8], R[k]);
  }
  ctx.emissive(null);
}
// ---- trees
function pine(e, p, lod) {
  const H = p.h || 12, CR = p.r || 2.6, R = rng(p.v || 1);
  e.paint("pine");
  loft(e, [ring(0, -0.3, 0, 0.34, 0.34, 7), ring(0, H * 0.5, 0, 0.2, 0.2, 7), ring(0, H * 0.97, 0, 0.04, 0.04, 7)], true, false);
  const tiers = lod >= 4 ? 4 : 7, k = lod >= 4 ? 6 : 9;
  for (let j = 0; j < tiers; j++) {
    const t = j / tiers, y0 = H * (0.2 + 0.7 * t), R0 = CR * (1 - t * 0.78) + 0.35, th = H * 0.24 * (1 - t * 0.35);
    e.paint("plain", `oklch(${(0.33 + R() * 0.07).toFixed(3)} 0.07 ${150 + Math.round(R() * 12)})`);
    const skirt = [], rot = R() * TAU;
    for (let i = 0; i < k * 2; i++) {
      const a = rot + (i / (k * 2)) * TAU, rr = (i % 2 ? R0 * 0.72 : R0) * (0.9 + R() * 0.2);
      skirt.push([Math.cos(a) * rr, y0 - (i % 2 ? 0.1 : 0.35) * (1 + t), Math.sin(a) * rr]);
    }
    const apex = [(R() - 0.5) * 0.1, y0 + th, (R() - 0.5) * 0.1], low = [0, y0 + 0.2, 0];
    for (let i = 0; i < skirt.length; i++) {
      const a = skirt[i], b = skirt[(i + 1) % skirt.length];
      e.t(a, apex, b);
      e.t(low, a, b);
    }
  }
}
function birch(e, p, lod) {
  const H = p.h || 9, lean = ((p.lean || 18) * Math.PI) / 180, R = rng(p.v || 2);
  const at = (y) => [0, y, -Math.tan(lean) * y * (0.55 + 0.45 * (y / H))];
  e.paint("birch");
  const st = [0, 0.18, 0.4, 0.62, 0.82, 1], rs = [0.2, 0.17, 0.14, 0.1, 0.07, 0.035];
  loft(e, st.map((s, i) => { const c = at(s * H); return ring(c[0], c[1] - (i ? 0 : 0.3), c[2], rs[i], rs[i], 7); }), true, false);
  if (lod >= 4) return;
  // branches + weeping leaf clumps
  for (let b = 0; b < 6; b++) {
    const s = 0.45 + b * 0.09, base = at(s * H), a = R() * TAU, L = 1.4 + R() * 1.4;
    const tip = [base[0] + Math.cos(a) * L, base[1] + 0.9 + R() * 0.6, base[2] + Math.sin(a) * L - 0.6];
    const r = 0.05;
    e.paint("birch");
    loft(e, [ring(base[0], base[1], base[2], r, r, 5), ring(tip[0], tip[1], tip[2], r * 0.4, r * 0.4, 5)], true, false);
  }
}
// leaf clumps reuse rock() drawn at feet y 0; birchClumps draws them in place instead
function birchCrown(e, p) {
  const H = p.h || 9, lean = ((p.lean || 18) * Math.PI) / 180, R = rng((p.v || 2) + 100);
  const at = (y) => [0, y, -Math.tan(lean) * y * (0.55 + 0.45 * (y / H))];
  for (let i = 0; i < 11; i++) {
    const s = 0.5 + (i / 10) * 0.5, c = at(s * H), a = R() * TAU, off = (1 - s) * 2.2 + 0.4;
    const x = c[0] + Math.cos(a) * off, z = c[2] + Math.sin(a) * off - 0.5, hang = 1.6 + R() * 1.4, top = c[1] + 0.6;
    e.paint("plain", `oklch(${(0.66 + R() * 0.1).toFixed(3)} 0.13 ${116 + Math.round(R() * 16)})`);
    const rr = 0.8 + R() * 0.5, n = 7, rot = R();
    const rings = [
      ring(x, top - hang, z, rr * 0.35, rr * 0.35, n, rot),
      ring(x, top - hang * 0.55, z, rr, rr, n, rot + 0.3),
      ring(x, top - hang * 0.15, z, rr * 0.8, rr * 0.8, n, rot + 0.1),
    ];
    for (const Rg of rings) for (const q of Rg) { q[0] += (R() - 0.5) * 0.25; q[2] += (R() - 0.5) * 0.25; }
    loft({ q: e.q, t: e.t, paint: () => {} }, rings, true, true, null, 0.35);
  }
}
// ---- shallows and banks
function reeds(e, p) {
  const R = rng(p.v || 3), n = 12;
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, r = R() * 0.3, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const H = 1.0 + R() * 0.9, la = R() * TAU, bend = 0.15 + R() * 0.35, w = 0.035 + R() * 0.02, fa = R() * TAU;
    const fx = Math.cos(fa) * w, fz = Math.sin(fa) * w, lx = Math.cos(la) * bend, lz = Math.sin(la) * bend;
    e.paint("plain", `oklch(${(0.58 + R() * 0.14).toFixed(3)} ${(0.09 + R() * 0.04).toFixed(3)} ${118 + Math.round(R() * 18)})`);
    const m = [x + lx * 0.3, H * 0.55, z + lz * 0.3], tip = [x + lx, H, z + lz];
    e.q([x - fx, -0.4, z - fz], [m[0] - fx * 0.7, m[1], m[2] - fz * 0.7], [m[0] + fx * 0.7, m[1], m[2] + fz * 0.7], [x + fx, -0.4, z + fz]);
    e.t([m[0] - fx * 0.7, m[1], m[2] - fz * 0.7], tip, [m[0] + fx * 0.7, m[1], m[2] + fz * 0.7]);
    if (i % 4 === 0) {
      e.paint("plain", "oklch(0.36 0.06 50)");
      const hx = x + lx * 0.6, hz = z + lz * 0.6, hy = H * 0.72;
      loft(e, [ring(hx, hy, hz, 0.035, 0.035, 5), ring(hx, hy + 0.22, hz, 0.035, 0.035, 5)], true, true);
    }
  }
}
function fern(e, p) {
  const R = rng(p.v || 4), fronds = 7 + Math.floor(R() * 3), seg = 10;
  for (let f = 0; f < fronds; f++) {
    const a = (f / fronds) * TAU + R() * 0.4, L = 0.6 + R() * 0.45, ca = Math.cos(a), sa = Math.sin(a), rise = 0.35 + R() * 0.2;
    e.paint("plain", `oklch(${(0.5 + R() * 0.1).toFixed(3)} 0.11 ${132 + Math.round(R() * 14)})`);
    let prev = null;
    for (let k = 0; k <= seg; k++) {
      const s = k / seg, d = L * s, y = Math.sin(Math.PI * s * 0.85) * L * rise + 0.02;
      const w = (0.2 * Math.sin(Math.PI * Math.min(1, s * 1.1)) + 0.015) * (k % 2 ? 0.55 : 1);
      const c = [ca * d, y, sa * d], l = [c[0] - sa * w, y - w * 0.3, c[2] + ca * w], r = [c[0] + sa * w, y - w * 0.3, c[2] - ca * w];
      if (prev) { e.q(prev[1], prev[0], c, l); e.q(prev[0], prev[2], r, c); }
      prev = [c, l, r];
    }
  }
}
function lilies(e, p) {
  const R = rng(7), wy = p.wy ?? -0.18;
  const clusters = [[140, 10.5], [98, 11], [226, 11.5], [62, 12], [168, 9.5]];
  for (const [deg, rad] of clusters) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = ((deg + (R() - 0.5) * 26) * Math.PI) / 180, rr = rad + (R() - 0.5) * 3.2;
      const x = -Math.sin(a) * rr, z = -Math.cos(a) * rr, pr = 0.22 + R() * 0.28, rot = R() * TAU, y = wy + R() * 0.01;
      e.paint("plain", `oklch(${(0.5 + R() * 0.12).toFixed(3)} 0.11 ${128 + Math.round(R() * 18)})`);
      const P = ring(x, y, z, pr, pr * (0.9 + R() * 0.1), 10, rot), c = [x, y + 0.005, z];
      for (let k = 0; k < 9; k++) e.t(c, P[k + 1], P[k]); // one wedge left open: the notch
      if (R() < 0.22) {
        e.paint("plain", R() < 0.5 ? "oklch(0.95 0.04 350)" : "oklch(0.97 0.02 90)");
        const fc = [x + pr * 0.2, y + 0.03, z], pet = ring(fc[0], y + 0.1, fc[2], 0.13, 0.13, 8, R());
        for (let k = 0; k < 8; k++) e.t(fc, pet[(k + 1) % 8], pet[k]);
        e.paint("plain", "oklch(0.85 0.15 90)");
        loft(e, [ring(fc[0], y + 0.03, fc[2], 0.035, 0.035, 5), ring(fc[0], y + 0.08, fc[2], 0.03, 0.03, 5)], true, false);
      }
    }
  }
}
// ---- the jetty: shore end at z 0, runs to -Z; deck top 0.3
const JL = 7.5;
function jetty(e, draw) {
  const R = rng(9);
  e.paint("oak");
  for (let z = 0; z > -JL + 0.1; z -= 0.215) {
    const j = (R() - 0.5) * 0.06;
    if (draw) e.paint("oak", `oklch(${(0.92 + R() * 0.06).toFixed(3)} 0.03 ${70 + Math.round(R() * 10)})`);
    box(e, -0.9 + j, 0.25 + (R() - 0.5) * 0.01, z - 0.19, 0.9 + j, 0.3, z);
  }
  e.paint("walnut");
  box(e, -0.66, 0.08, -JL, -0.52, 0.25, 0.1);
  box(e, 0.52, 0.08, -JL, 0.66, 0.25, 0.1);
  for (const pz of [-0.4, -3.7, -7.1]) {
    box(e, -0.95, 0.1, pz - 0.08, 0.95, 0.25, pz + 0.08);
    for (const px of [-0.98, 0.98]) loft(e, [ring(px, -2.8, pz, 0.11, 0.11, 8), ring(px, 0.52, pz, 0.1, 0.1, 8)], true, false);
  }
  // bench at the end, facing out over the water (-Z)
  const bz = -6.3;
  e.paint("walnut");
  for (const x of [-0.62, 0.62]) { box(e, x - 0.04, 0.3, bz - 0.19, x + 0.04, 0.72, bz - 0.13); box(e, x - 0.04, 0.3, bz + 0.15, x + 0.04, 1.1, bz + 0.21); }
  e.paint("oak");
  for (let i = 0; i < 3; i++) box(e, -0.72, 0.72, bz - 0.21 + i * 0.14, 0.72, 0.76, bz - 0.09 + i * 0.14);
  box(e, -0.72, 0.86, bz + 0.2, 0.72, 0.98, bz + 0.23);
  box(e, -0.72, 1.02, bz + 0.2, 0.72, 1.12, bz + 0.23);
}
function signpost(e) {
  e.paint("oak");
  box(e, -0.07, -0.4, -0.07, 0.07, 1.95, 0.07);
  loft(e, [ring(0, 1.95, 0, 0.12, 0.12, 4, Math.PI / 4), ring(0, 2.05, 0, 0.001, 0.001, 4, Math.PI / 4)], false, false);
  e.paint("walnut");
  box(e, -0.11, 1.18, -0.1, 0.11, 1.24, 0.1);
}
function plaque(e) {
  e.paint("walnut");
  box(e, -0.52, 0, -0.03, 0.52, 0.44, 0.03);
}
function rockItem(e, p) {
  const slab = p.kind === "slab", R = rng(p.v || 5);
  rock(e, slab
    ? { x: 0, z: 0, rx: 1.1 + R() * 0.6, rz: 0.6 + R() * 0.3, h: 0.3 + R() * 0.15, sink: 0.25, seed: p.v || 5, n: 8, flat: true, moss: 0.97 }
    : { x: 0, z: 0, rx: 0.7 + R() * 0.3, rz: 0.6 + R() * 0.3, h: 0.7 + R() * 0.4, sink: 0.3, seed: p.v || 5, n: 8, moss: 0.4 });
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, e = emitter(ctx, true);
  ctx.flat();
  switch (p.part) {
    case "knoll": knoll(e, lod); break;
    case "falls": falls(ctx, e, p.wl ?? -0.2); break;
    case "pine": pine(e, p, lod); break;
    case "birch": birch(e, p, lod); if (lod < 4) birchCrown(e, p); break;
    case "reeds": reeds(e, p); break;
    case "fern": fern(e, p); break;
    case "lilies": lilies(e, p); break;
    case "jetty": jetty(e, true); break;
    case "signpost": signpost(e); break;
    case "plaque": plaque(e); break;
    case "rock": rockItem(e, p); break;
  }
});
export function collider(ctx) {
  const p = ctx.params || {}, e = emitter(ctx, false);
  switch (p.part) {
    case "knoll": knoll(e, 4); return;
    case "pine": loft(e, [ring(0, -0.3, 0, 0.34, 0.34, 6), ring(0, 4, 0, 0.26, 0.26, 6)], true, true); return;
    case "birch": { const L = Math.tan(((p.lean || 18) * Math.PI) / 180); loft(e, [ring(0, -0.3, 0, 0.2, 0.2, 6), ring(0, 3, -L * 3 * 0.7, 0.15, 0.15, 6)], true, true); return; }
    case "jetty": box(e, -0.95, 0.05, -JL, 0.95, 0.3, 0.1); box(e, -0.72, 0.3, -6.5, 0.72, 0.76, -6.1); box(e, -0.72, 0.76, -6.13, 0.72, 1.12, -6.07); return;
    case "signpost": box(e, -0.1, -0.4, -0.1, 0.1, 2.0, 0.1); return;
    default: return null;
  }
}
