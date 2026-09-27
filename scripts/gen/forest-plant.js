import { ring, loft, cap } from "./valley-mesh.js";
// The forest's plant kit, one script: params.kind = broadleaf | sapling | shrub | fern | reed | log. Feet at the ground, +Y up.
const TAU = Math.PI * 2;
const LEAF = ["#2f5a2e", "#3c6e34", "#4f8a3c", "#6a9f45"], SUNLIT = "#8fbf55";
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
    const h = Number(ctx.params.height ?? 26), r = Number(ctx.params.radius ?? 6), n = lod >= 4 ? 5 : 8, seg = lod >= 4 ? 5 : lod >= 3 ? 6 : 8;
    const bole = h * (0.5 + ctx.random() * 0.1), tr = h * 0.022;
    bark(ctx); ctx.color("#8b7a66");
    const base = ring(0, 0, 0, tr * 1.9, tr * 1.9, n), a = ring(0, 0.8, 0, tr * 1.15, tr * 1.15, n), b = ring(0, bole, 0, tr * 0.8, tr * 0.8, n), c = ring(0, h * 0.8, 0, tr * 0.35, tr * 0.35, n);
    cap(ctx, base, false); loft(ctx, base, a); loft(ctx, a, b); loft(ctx, b, c);
    if (lod < 3) for (let i = 0; i < 4; i++) { const th = i / 4 * TAU + ctx.random(), y0 = bole * (0.95 + i * 0.08), L = r * 0.75; limb(ctx, [0, y0, 0], [Math.cos(th) * L, y0 + L * 0.7, Math.sin(th) * L], tr * 0.45, tr * 0.12, 5); }
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.flat(); ctx.roughness(0.9);
    const clumps = lod >= 4 ? 3 : lod >= 3 ? 6 : 10;
    blob(ctx, 0, h - r * 0.55, 0, r * 0.7, r * 0.55, r * 0.7, seg, [LEAF[1], LEAF[2], LEAF[3], SUNLIT]);
    for (let i = 0; i < clumps; i++) {
      const th = i / clumps * TAU * 1.6 + ctx.random() * 0.8, t = ctx.random(), d = r * (0.45 + t * 0.45), y = bole + r * 0.35 + (h - bole - r * 0.9) * ctx.random();
      const s = r * (0.42 + ctx.random() * 0.2);
      blob(ctx, Math.cos(th) * d, y, Math.sin(th) * d, s, s * 0.72, s, seg, [LEAF[0], LEAF[1], LEAF[2], LEAF[3]]);
    }
  },
  sapling(ctx, lod) {
    const h = Number(ctx.params.height ?? 6), seg = lod >= 3 ? 5 : 7;
    bark(ctx); ctx.color("#9a8a74");
    const a = ring(0, 0, 0, 0.07, 0.07, 5), b = ring(0.1, h * 0.7, 0, 0.03, 0.03, 5); cap(ctx, a, false); loft(ctx, a, b);
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.flat();
    const c = lod >= 4 ? 1 : 4;
    for (let i = 0; i < c; i++) { const th = i / c * TAU + ctx.random(), d = i ? h * 0.12 : 0, y = h * (0.6 + (i ? ctx.random() * 0.25 : 0.2)), s = h * (0.16 + ctx.random() * 0.06);
      blob(ctx, 0.1 + Math.cos(th) * d, y, Math.sin(th) * d, s, s * 0.8, s, seg, [LEAF[1], LEAF[2], LEAF[3], SUNLIT]); }
  },
  shrub(ctx, lod) {
    const h = Number(ctx.params.height ?? 1.3), seg = lod >= 3 ? 5 : 6, c = lod >= 3 ? 2 : 6;
    ctx.albedo("scripts/tex-valley-canopy.js"); ctx.flat(); ctx.roughness(0.95);
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
  (kinds[ctx.params.kind] || kinds.shrub)(ctx, lod);
}
export function collider(ctx) {
  const k = ctx.params.kind;
  if (k === "broadleaf") { const h = Number(ctx.params.height ?? 26); return { kind: "box", width: h * 0.06, height: h * 0.5, depth: h * 0.06 }; }
  if (k === "log") { const L = Number(ctx.params.length ?? 6), r = Number(ctx.params.radius ?? 0.35); return { kind: "box", width: L, height: r * 2, depth: r * 2 }; }
  return null;
}
