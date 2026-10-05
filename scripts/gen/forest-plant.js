import { ring, loft, cap } from "./valley-mesh.js";
import { mesher, ramp, spine } from "./tree-kit.js";
// The forest's plant kit, one script: params.kind = broadleaf | sapling | shrub | fern | reed | log. Feet at the ground, +Y up.
const TAU = Math.PI * 2;
const LEAF = ["#2f5a2e", "#3c6e34", "#4f8a3c", "#6a9f45"], SUNLIT = "#8fbf55";
// params.leaf picks a crown palette: default deep forest green; "spring" is a lighter deciduous green (limes, beech)
const LEAVES = { spring: { leaf: ["#557f35", "#6a9640", "#82ad4c", "#9cc35d"], sun: "#b8d772", bark: "#a3927c" } };
// a lumpy low-poly ball, flat-shaded: a lat-long sphere with seeded radial noise
function blob(ctx, cx, cy, cz, rx, ry, rz, seg, colors) {
  const lat = Math.max(3, seg - 2), pts = [];
  for (let i = 0; i <= lat; i++) {
    const row = [], v = i / lat, phi = v * Math.PI;
    for (let j = 0; j < seg; j++) {
      const th = j / seg * TAU + (i % 2) * (Math.PI / seg), k = (i === 0 || i === lat) ? 1 : 0.82 + ctx.random() * 0.34;
      row.push([cx + Math.sin(phi) * Math.cos(th) * rx * k, cy + Math.cos(phi) * ry * (i === lat ? 0.7 : 1) * k, cz + Math.sin(phi) * Math.sin(th) * rz * k]);
    }
    pts.push(row);
  }
  for (let i = 0; i < lat; i++) {
    ctx.color(colors[Math.min(colors.length - 1, Math.floor((1 - i / lat) * colors.length * 0.999))]);
    for (let j = 0; j < seg; j++) { const a = pts[i][j], b = pts[i][(j + 1) % seg], c = pts[i + 1][(j + 1) % seg], d = pts[i + 1][j]; ctx.quad(...a, ...b, ...c, ...d); }
  }
}
function bark(ctx) { ctx.albedo("scripts/tex-valley-bark.js"); ctx.roughness(0.95); ctx.smooth(); }
function limb(ctx, a, b, r0, r1, n) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
  // rings perpendicular-ish to the limb: approximate with horizontal rings offset along its path
  const steps = 3; let prev = ring(a[0], a[1], a[2], r0, r0, n);
  for (let s = 1; s <= steps; s++) { const t = s / steps, r = r0 + (r1 - r0) * t; const next = ring(a[0] + dx * t, a[1] + dy * t, a[2] + dz * t, r, r, n); loft(ctx, prev, next); prev = next; }
  return L;
}
const kinds = {
  broadleaf(ctx, lod) {
    // a bent trunk with a root flare forks into heavy limbs, each carrying one of 3-5 pillowy canopy masses;
    // windows of sky between the masses; deep shade green underneath to sunlit lime on top
    const h = Number(ctx.params.height ?? 26), r = Number(ctx.params.radius ?? 6), m = mesher(ctx);
    const spring = ctx.params.leaf === "spring";
    const GRAD = spring ? ["#2f4a22", "#4d7a32", "#78a744", "#b4d36a"] : ["#1f3a24", "#34603a", "#5a8c45", "#9cc160"];
    const n = lod >= 4 ? 5 : lod >= 3 ? 6 : 9, seg = lod >= 4 ? 6 : lod >= 3 ? 8 : 11, tr = h * 0.03;
    const fork = h * (0.42 + ctx.random() * 0.08);
    bark(ctx); ctx.color(spring ? "#8d7a63" : "#6e5a48");
    const trunk = spine(ctx, [0, 0, 0], [0, fork, 0], h * 0.04, lod >= 4 ? 2 : 5);
    m.tube(trunk, trunk.map((_, i) => tr * (1.5 - i / (trunk.length - 1) * 0.65)), n, ctx.random() * 6, lod >= 4 ? 0 : 0.9);
    const top = trunk[trunk.length - 1], masses = lod >= 4 ? 3 : 3 + Math.floor(ctx.random() * 3);
    const crownLo = fork + r * 0.1, crownHi = h;
    const centers = [];
    for (let i = 0; i < masses; i++) {
      const lead = i === 0, th = i / masses * Math.PI * 2 + ctx.random() * 0.9, d = lead ? r * 0.12 : r * (0.5 + ctx.random() * 0.3);
      const s = lead ? r * 0.62 : r * (0.42 + ctx.random() * 0.14);
      const y = lead ? h - s * 0.8 : fork + (h - fork) * (0.35 + ctx.random() * 0.3);
      centers.push({ c: [top[0] + Math.cos(th) * d, y, top[2] + Math.sin(th) * d], s });
    }
    if (lod < 4) for (const { c, s } of centers) { // heavy limb from the fork into the mass's heart
      const mid = [(top[0] + c[0]) * 0.5 + (ctx.random() - 0.5) * r * 0.2, top[1] + (c[1] - top[1]) * 0.45, (top[2] + c[2]) * 0.5];
      m.tube([top, mid, [c[0], c[1] - s * 0.2, c[2]]], [tr * 0.75, tr * 0.5, tr * 0.25], lod >= 3 ? 4 : 6);
    }
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.roughness(0.9);
    const col = (p, nn) => ramp(GRAD, ((p[1] - crownLo) / (crownHi - crownLo)) * 0.8 + nn[1] * 0.25 + 0.05);
    for (const { c, s } of centers) {
      const pivot = [c[0], c[1] - s * 0.25, c[2]];
      m.puff(c, s, s * 0.74, s, seg, pivot, col);
      const bumps = lod >= 4 ? 0 : lod >= 3 ? 1 : 3;
      for (let b = 0; b < bumps; b++) { const a = ctx.random() * Math.PI * 2, e = 0.3 + ctx.random() * 0.5, bs = s * (0.45 + ctx.random() * 0.15);
        m.puff([c[0] + Math.cos(a) * Math.cos(e) * s * 0.6, c[1] + Math.sin(e) * s * 0.5, c[2] + Math.sin(a) * Math.cos(e) * s * 0.6], bs, bs * 0.78, bs, Math.max(6, seg - 3), pivot, col); }
    }
    return m.done();
  },
  sapling(ctx, lod) {
    const h = Number(ctx.params.height ?? 6), seg = lod >= 3 ? 5 : 7;
    bark(ctx); ctx.color("#9a8a74");
    const a = ring(0, 0, 0, 0.07, 0.07, 5), b = ring(0.1, h * 0.7, 0, 0.03, 0.03, 5); cap(ctx, a, false); loft(ctx, a, b);
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.smooth();
    const c = lod >= 4 ? 1 : 4;
    for (let i = 0; i < c; i++) { const th = i / c * TAU + ctx.random(), d = i ? h * 0.12 : 0, y = h * (0.6 + (i ? ctx.random() * 0.25 : 0.2)), s = h * (0.16 + ctx.random() * 0.06);
      blob(ctx, 0.1 + Math.cos(th) * d, y, Math.sin(th) * d, s, s * 0.8, s, seg, [LEAF[1], LEAF[2], LEAF[3], SUNLIT]); }
  },
  shrub(ctx, lod) {
    const h = Number(ctx.params.height ?? 1.3), seg = lod >= 3 ? 5 : 6, c = lod >= 3 ? 2 : 6;
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.smooth(); ctx.roughness(0.95);
    const pal = ctx.params.berry ? ["#2d5230", "#3b6936", "#4e7f3e", "#5e8d44"] : [LEAF[0], LEAF[1], LEAF[2], LEAF[3]];
    for (let i = 0; i < c; i++) { const th = i / c * TAU + ctx.random(), d = i ? h * 0.35 : 0, s = h * (0.38 + ctx.random() * 0.15);
      blob(ctx, Math.cos(th) * d, s * 0.7, Math.sin(th) * d, s, s * 0.8, s, seg, pal); }
    if (ctx.params.berry && lod < 3) { const bc = ctx.params.berryColor || "#c02a3e"; ctx.albedo(null); ctx.color(bc); ctx.emissive(null);
      for (let i = 0; i < 14; i++) { const th = ctx.random() * TAU, e = ctx.random() * 1.2, R = h * 0.62; const x = Math.cos(th) * Math.cos(e) * R, y = h * 0.4 + Math.sin(e) * R * 0.7, z = Math.sin(th) * Math.cos(e) * R;
        blob(ctx, x, y, z, 0.035, 0.035, 0.035, 4, [bc]); } }
  },
  fern(ctx, lod) {
    const L0 = Number(ctx.params.size ?? 0.9), fronds = lod >= 3 ? 5 : 10, segs = lod >= 3 ? 3 : 6;
    ctx.flat(); ctx.roughness(0.9); ctx.albedo(null);
    for (let f = 0; f < fronds; f++) {
      const a = f / fronds * TAU + ctx.random() * 0.4, L = L0 * (0.75 + ctx.random() * 0.4), side = [-Math.sin(a), 0, Math.cos(a)];
      let p = [0, 0.02, 0];
      for (let s = 1; s <= segs; s++) {
        const k = s / segs, q = [Math.cos(a) * L * k, 0.02 + Math.sin(k * 2.3) * 0.6 * L, Math.sin(a) * L * k], lw = 0.2 * L0 * (1 - k * 0.75);
        ctx.color(s % 2 ? "#4a8a3a" : "#5c9c43");
        ctx.quad(...p, p[0] + side[0] * lw, p[1] - 0.02, p[2] + side[2] * lw, q[0] + side[0] * lw * 0.6, q[1] - 0.03, q[2] + side[2] * lw * 0.6, ...q);
        ctx.color(s % 2 ? "#3f7a33" : "#548f3e");
        ctx.quad(...p, ...q, q[0] - side[0] * lw * 0.6, q[1] - 0.03, q[2] - side[2] * lw * 0.6, p[0] - side[0] * lw, p[1] - 0.02, p[2] - side[2] * lw);
        p = q;
      }
    }
  },
  reed(ctx, lod) {
    const h = Number(ctx.params.height ?? 1.4), c = lod >= 3 ? 6 : 14;
    ctx.flat(); ctx.roughness(0.9); ctx.albedo(null);
    for (let i = 0; i < c; i++) {
      const th = ctx.random() * TAU, d = ctx.random() * 0.25, x = Math.cos(th) * d, z = Math.sin(th) * d, hh = h * (0.6 + ctx.random() * 0.5), lx = Math.cos(th) * hh * 0.15, lz = Math.sin(th) * hh * 0.15, w = 0.02;
      ctx.color(i % 3 ? "#6f9a48" : "#8aa856");
      ctx.quad(x - w, 0, z, x + w, 0, z, x + lx + w * 0.2, hh, z + lz, x + lx - w * 0.2, hh, z + lz);
      if (i % 4 === 0) { ctx.color("#6b4a2e"); const t = [x + lx * 0.85, hh * 0.82, z + lz * 0.85]; blob(ctx, t[0], t[1], t[2], 0.03, 0.09, 0.03, 4, ["#6b4a2e"]); }
    }
  },
  log(ctx, lod) {
    const L = Number(ctx.params.length ?? 6), r = Number(ctx.params.radius ?? 0.35), n = lod >= 3 ? 6 : 9;
    bark(ctx); ctx.color("#7d6d5b");
    const rings = []; for (let i = 0; i <= 4; i++) { const x = -L / 2 + L * i / 4, rr = r * (1 - i * 0.06); const p = []; for (let j = 0; j < n; j++) { const a = j / n * TAU; p.push([x, r + Math.sin(a) * rr, Math.cos(a) * rr]); } rings.push(p); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < n; j++) { const jj = (j + 1) % n; ctx.quad(...rings[i][j], ...rings[i + 1][j], ...rings[i + 1][jj], ...rings[i][jj]); }
    ctx.albedo(null); ctx.color("#c8a77a"); ctx.flat(); cap(ctx, rings[0], false); cap(ctx, rings[4], true);
    ctx.color("#5f8a3a"); ctx.roughness(1);
    if (lod < 3) for (let i = 0; i < 5; i++) { const x = -L / 2 + L * (0.1 + ctx.random() * 0.8); blob(ctx, x, r * 1.85, (ctx.random() - 0.5) * r * 0.6, r * 0.5, r * 0.18, r * 0.4, 5, ["#4f7d33", "#6a9a42"]); }
  },
};
export function geometry(ctx) {
  const lod = Number(ctx.lod ?? 1);
  return (kinds[ctx.params.kind] || kinds.shrub)(ctx, lod);
}
export function collider(ctx) {
  const k = ctx.params.kind;
  if (k === "broadleaf") { const h = Number(ctx.params.height ?? 26); return { kind: "box", width: h * 0.06, height: h * 0.5, depth: h * 0.06 }; }
  if (k === "log") { const L = Number(ctx.params.length ?? 6), r = Number(ctx.params.radius ?? 0.35); return { kind: "box", width: L, height: r * 2, depth: r * 2 }; }
  return null;
}
