// The square's edges: one family, two row kinds. Feet at world y 0: every g (ground) / y here is world height,
// x/z local to the row.
// kind "wall":   params.pts [[x, z, g]…] a coursed limestone garden wall ~1.6 m, params.gate { seg, t, w, open, side }
//                = a wooden arched garden gate between two piers on segment seg at fraction t (side ±1 = which way it opens)
// kind "alleys": params.items [{ t: hedge|shrub|pot|wood|barrel|bin|crates|ladder|lamp|path, … }] alley dressing
import { TAU, TEX, paint, beam, obox, lathe, blob, solid, yawAlong } from '../lib/yard-kit.js';
import { softened } from "./soften.js";
const STONE = 'cdn/texture-coursed-pale-limestone-garden-wall.png';
const HEDGE = 'cdn/texture-clipped-boxwood-hedge-leaves.png';
const POT = 'cdn/texture-weathered-terracotta-clay.png';
const BARK = 'cdn/texture-split-firewood-logs-bark.png';
const IRON = 'oklch(0.26 0.015 60)';
const LEAVES = ['oklch(0.62 0.11 135)', 'oklch(0.55 0.1 145)', 'oklch(0.68 0.12 125)', 'oklch(0.5 0.09 150)'];
// a slab along a→b ([x,z]) of thickness t, bottoms/tops per end
function seg(P, a, b, ya0, ya1, yb0, yb1, t, off = 0) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, sx = -dz / L * t / 2, sz = dx / L * t / 2, ox = -dz / L * off, oz = dx / L * off;
  const S = (p, y0, y1) => [[p[0] - sx + ox, y0, p[1] - sz + oz], [p[0] + sx + ox, y0, p[1] + sz + oz], [p[0] + sx + ox, y1, p[1] + sz + oz], [p[0] - sx + ox, y1, p[1] - sz + oz]];
  solid(P, S(a, ya0, ya1), S(b, yb0, yb1));
}
const lerp = (a, b, t) => a + (b - a) * t;
function wallPieces(p) { // → runs [{a,b,ga,gb}] with the gate opening cut, and the gate frame
  const pts = p.pts, runs = [], G = p.gate; let gate = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i], B = pts[i + 1];
    if (G && G.seg === i) {
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]), w = G.w || 1.3, hw = (w / 2 + 0.3) / L, t0 = G.t - hw, t1 = G.t + hw;
      const at = (t) => [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)];
      runs.push({ a: A, b: at(t0) }, { a: at(t1), b: B });
      gate = { c: at(G.t), d: [(B[0] - A[0]) / L, (B[1] - A[1]) / L], w, open: !!G.open, side: G.side || 1, pl: at(t0), pr: at(t1) };
    } else runs.push({ a: A, b: B });
  }
  return { runs, gate };
}
function stoneWall(ctx, P, p, lod) {
  const H = p.h || 1.6, T = 0.46, { runs, gate } = wallPieces(p);
  for (const r of runs) {
    const a = r.a, b = r.b, lo = Math.min(a[2], b[2]) - 0.5, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    paint(ctx, null, 'oklch(0.9 0.02 80)', 0.92); ctx.albedo(STONE);
    seg(P, [a[0], a[1]], [b[0], b[1]], lo, a[2] + H - 0.12, lo, b[2] + H - 0.12, T);
    // plinth course and the coping
    paint(ctx, null, 'oklch(0.84 0.025 75)', 0.9); ctx.albedo(STONE);
    seg(P, [a[0], a[1]], [b[0], b[1]], lo, a[2] + 0.28, lo, b[2] + 0.28, T + 0.1);
    paint(ctx, null, 'oklch(0.93 0.02 82)', 0.88); ctx.albedo(STONE);
    seg(P, [a[0], a[1]], [b[0], b[1]], a[2] + H - 0.12, a[2] + H, b[2] + H - 0.12, b[2] + H, T + 0.14);
    if (lod <= 2) { // proud stones: coursed blocks in varied tints, both faces
      const rnd = ctx.random, d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [-d[1], d[0]], y = yawAlong(d[0], d[1]);
      for (let row = 0; row < 4; row++) {
        const h = 0.34 + row * 0.3, off = row % 2 ? 0.2 : 0.55;
        for (let s = off; s < L - 0.3; s += 0.7 + rnd() * 0.5) {
          if (rnd() < 0.45) continue;
          const tt = s / L, gy = lerp(a[2], b[2], tt) + h, sd = rnd() < 0.5 ? 1 : -1, bw = 0.38 + rnd() * 0.3;
          paint(ctx, null, ['oklch(0.86 0.025 75)', 'oklch(0.8 0.03 70)', 'oklch(0.9 0.02 85)'][Math.floor(rnd() * 3)], 0.9); ctx.albedo(STONE);
          obox(P, a[0] + d[0] * s + n[0] * sd * (T / 2), gy, a[1] + d[1] * s + n[1] * sd * (T / 2), bw, 0.24, 0.06, y);
        }
      }
    }
  }
  // end piers where the wall stops free (not against a building): the corner joints get a pier too
  paint(ctx, null, 'oklch(0.88 0.025 78)', 0.9); ctx.albedo(STONE);
  for (let i = 1; i < p.pts.length - 1; i++) { const q = p.pts[i]; obox(P, q[0], q[2] - 0.5, q[1], 0.62, H + 0.72, 0.62); obox(P, q[0], q[2] + H + 0.22, q[1], 0.74, 0.12, 0.74); }
  if (gate) gateFrame(ctx, P, gate, H, lod);
}
function gateFrame(ctx, P, g, H, lod) {
  const [dx, dz] = g.d, y = yawAlong(dx, dz), n = [-dz, dx], hw = g.w / 2, gy = g.c[2];
  paint(ctx, null, 'oklch(0.88 0.025 78)', 0.9); ctx.albedo(STONE);
  for (const q of [g.pl, g.pr]) { const cx = q[0] + (q === g.pl ? 1 : -1) * dx * 0.3, cz = q[1] + (q === g.pl ? 1 : -1) * dz * 0.3; obox(P, cx, q[2] - 0.5, cz, 0.6, H + 0.9, 0.6, y); paint(ctx, null, 'oklch(0.93 0.02 82)', 0.88); ctx.albedo(STONE); obox(P, cx, q[2] + H + 0.4, cz, 0.72, 0.12, 0.72, y); lathe(P, [[0.16, q[2] + H + 0.52], [0.19, q[2] + H + 0.62], [0.12, q[2] + H + 0.76], [0, q[2] + H + 0.8]], lod <= 2 ? 8 : 5, cx, cz); paint(ctx, null, 'oklch(0.88 0.025 78)', 0.9); ctx.albedo(STONE); }
  // timber arch over the opening
  paint(ctx, null, 'oklch(0.72 0.06 60)', 0.8); ctx.albedo(TEX.oak);
  const spring = gy + 1.95, K = lod <= 2 ? 9 : 5, ap = (i) => { const a = Math.PI * i / K; return [g.c[0] - dx * Math.cos(a) * (hw + 0.05), spring + Math.sin(a) * (hw + 0.1), g.c[1] - dz * Math.cos(a) * (hw + 0.05)]; };
  for (const o of [-0.12, 0.12]) for (let i = 0; i < K; i++) { const A = ap(i), B = ap(i + 1); beam(P, [A[0] + n[0] * o, A[1], A[2] + n[1] * o], [B[0] + n[0] * o, B[1], B[2] + n[1] * o], 0.12, 0.14); }
  for (const s of [-1, 1]) { const x = g.c[0] + dx * s * (hw + 0.05), z = g.c[1] + dz * s * (hw + 0.05); for (const o of [-0.12, 0.12]) beam(P, [x + n[0] * o, gy, z + n[1] * o], [x + n[0] * o, spring, z + n[1] * o], 0.12, 0.12); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.6 0.12 135)', 0.9); ctx.albedo(TEX.leaf); for (let i = 1; i < K; i += 2) { const A = ap(i); blob(P, A[0], A[1] - 0.1, A[2], 0.26, 0.2, 0.26, 5, ctx.random); } }
  // two plank leaves, arched tops, iron straps; hinged at the posts
  for (const s of [-1, 1]) {
    const hx = g.c[0] + dx * s * hw, hz = g.c[1] + dz * s * hw, ang = g.open ? 1.25 * g.side : 0;
    const ld = [-dx * s, -dz * s], c = Math.cos(ang * s), sn = Math.sin(ang * s);
    const dir = g.open ? [ld[0] * Math.cos(ang) + n[0] * Math.sin(Math.abs(ang)) * g.side * 0 + n[0] * 0, 0] : ld;
    const od = g.open ? [n[0] * g.side * 0.94 + ld[0] * 0.34, n[1] * g.side * 0.94 + ld[1] * 0.34] : ld, yl = yawAlong(od[0], od[1]);
    const lw = hw - 0.03, k = lod <= 2 ? 5 : 3;
    paint(ctx, null, 'oklch(0.7 0.07 55)', 0.82); ctx.albedo(TEX.oak);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k * lw, fr = (hw - u) / hw, top = 1.25 + 0.3 * Math.sqrt(Math.max(0, 1 - fr * fr)); obox(P, hx + od[0] * u, gy + 0.1, hz + od[1] * u, lw / k - 0.015, top, 0.05, yl); }
    paint(ctx, null, 'oklch(0.62 0.07 50)', 0.82); ctx.albedo(TEX.oak);
    for (const ry of [0.35, 1.05]) obox(P, hx + od[0] * lw / 2 - n[0] * 0.04, gy + ry, hz + od[1] * lw / 2 - n[1] * 0.04, lw - 0.04, 0.1, 0.035, yl);
    if (lod <= 2) { paint(ctx, null, IRON, 0.5, 0.6); for (const ry of [0.38, 1.08]) obox(P, hx + od[0] * 0.2 + n[0] * 0.03, gy + ry, hz + od[1] * 0.2 + n[1] * 0.03, 0.4, 0.04, 0.012, yl); obox(P, hx + od[0] * (lw - 0.08), gy + 0.8, hz + od[1] * (lw - 0.08), 0.04, 0.1, 0.1, yl); }
  }
}
function wallCollider(ctx, p) {
  const H = p.h || 1.6, { runs, gate } = wallPieces(p);
  for (const r of runs) seg(ctx, [r.a[0], r.a[1]], [r.b[0], r.b[1]], Math.min(r.a[2], r.b[2]) - 0.5, r.a[2] + H, Math.min(r.a[2], r.b[2]) - 0.5, r.b[2] + H, 0.56);
  if (gate) {
    for (const q of [gate.pl, gate.pr]) { const s = q === gate.pl ? 1 : -1; obox(ctx, q[0] + s * gate.d[0] * 0.3, q[2] - 0.5, q[1] + s * gate.d[1] * 0.3, 0.6, H + 1, 0.6, yawAlong(...gate.d)); }
    if (!gate.open) seg(ctx, [gate.c[0] - gate.d[0] * gate.w / 2, gate.c[1] - gate.d[1] * gate.w / 2], [gate.c[0] + gate.d[0] * gate.w / 2, gate.c[1] + gate.d[1] * gate.w / 2], gate.c[2], gate.c[2] + 1.5, gate.c[2], gate.c[2] + 1.5, 0.12);
  }
}
// ---- alley dressing
function log(P, c, ax, r, len, n) { // a log lying along ax ([x,z]) centred c
  const up = [0, 1, 0], s = [-ax[1], 0, ax[0]], ring = (o) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; a.push([c[0] + ax[0] * o + s[0] * Math.cos(t) * r, c[1] + Math.sin(t) * r, c[2] + ax[1] * o + s[2] * Math.cos(t) * r]); } return a; };
  solid(P, ring(-len / 2), ring(len / 2));
}
const ITEMS = {
  hedge(ctx, P, it, lod) {
    const pts = it.pts, h = it.h || 1.7, w = it.w || 0.95;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      paint(ctx, null, 'oklch(0.72 0.1 135)', 0.95); ctx.albedo(HEDGE);
      seg(P, [a[0], a[1]], [b[0], b[1]], Math.min(a[2], b[2]) - 0.3, a[2] + h - 0.2, Math.min(a[2], b[2]) - 0.3, b[2] + h - 0.2, w);
      if (lod <= 3) { const step = lod <= 2 ? 0.8 : 1.8; for (let s = 0.3; s < L; s += step) { const t = s / L; paint(ctx, null, LEAVES[Math.floor(ctx.random() * 4)], 0.95); ctx.albedo(HEDGE); blob(P, lerp(a[0], b[0], t), lerp(a[2], b[2], t) + h - 0.45, lerp(a[1], b[1], t), w * 0.55, 0.42 + ctx.random() * 0.2, w * 0.55, lod <= 2 ? 6 : 4, ctx.random); } }
    }
  },
  shrub(ctx, P, it, lod) {
    const r = it.r || 0.8, k = lod <= 2 ? 4 : 2;
    for (let i = 0; i < k; i++) { const a = ctx.random() * TAU, d = i ? r * 0.55 : 0, rr = r * (i ? 0.62 : 0.8); paint(ctx, null, LEAVES[(i + (it.v || 0)) % 4], 0.95); ctx.albedo(TEX.leaf); blob(P, it.x + Math.cos(a) * d, it.g - 0.1, it.z + Math.sin(a) * d, rr, rr * 1.3, rr, lod <= 2 ? 7 : 5, ctx.random); }
    if (it.flowers && lod <= 2) { paint(ctx, null, it.flowers, 0.8); for (let i = 0; i < 9; i++) { const a = ctx.random() * TAU, d = ctx.random() * r * 0.8; obox(P, it.x + Math.cos(a) * d, it.g + r * 0.9 + ctx.random() * 0.2, it.z + Math.sin(a) * d, 0.09, 0.07, 0.09, a); } }
  },
  pot(ctx, P, it, lod) {
    const g = it.g, n = lod <= 2 ? 12 : 6;
    paint(ctx, null, 'oklch(0.85 0.06 45)', 0.85); ctx.albedo(POT);
    lathe(P, [[0.26, g], [0.36, g + 0.5], [0.42, g + 0.55], [0.42, g + 0.64], [0.37, g + 0.64]], n, it.x, it.z);
    paint(ctx, null, 'oklch(0.45 0.04 50)', 0.95); ctx.albedo(TEX.soil); lathe(P, [[0.37, g + 0.6], [0, g + 0.6]], n, it.x, it.z);
    paint(ctx, null, 'oklch(0.55 0.04 60)', 0.9); ctx.albedo(TEX.walnut); beam(P, [it.x, g + 0.55, it.z], [it.x + 0.05, g + 1.7, it.z - 0.03], 0.09, 0.09);
    const k = lod <= 2 ? 5 : 2;
    for (let i = 0; i < k; i++) { const a = i / k * TAU, d = i ? 0.32 : 0; paint(ctx, null, LEAVES[(i + 1) % 4], 0.95); ctx.albedo(TEX.leaf); blob(P, it.x + Math.cos(a) * d, g + 1.55 + (i ? 0.1 : 0.35), it.z + Math.sin(a) * d, 0.45, 0.5, 0.45, lod <= 2 ? 7 : 5, ctx.random); }
  },
  wood(ctx, P, it, lod) { // stacked firewood under a little plank lid, along yaw
    const L = it.len || 1.8, a = it.yaw || 0, d = [Math.cos(a), -Math.sin(a)], nz = [-d[1], d[0]], g = it.g, rows = 5, r = 0.085;
    paint(ctx, null, 'oklch(0.5 0.04 55)', 0.9); ctx.albedo(TEX.walnut);
    for (const s of [-1, 1]) for (const o of [-0.2, 0.2]) beam(P, [it.x + d[0] * s * (L / 2 + 0.05) + nz[0] * o, g, it.z + d[1] * s * (L / 2 + 0.05) + nz[1] * o], [it.x + d[0] * s * (L / 2 + 0.05) + nz[0] * o, g + 1.08, it.z + d[1] * s * (L / 2 + 0.05) + nz[1] * o], 0.07, 0.07);
    const per = Math.floor(L / (2 * r)), n = lod <= 2 ? 6 : 4;
    for (let row = 0; row < (lod <= 2 ? rows : 2); row++) for (let i = 0; i < per; i++) {
      const u = -L / 2 + r + i * 2 * r + (row % 2 ? r * 0.5 : 0); if (u > L / 2 - r * 0.5) continue;
      paint(ctx, null, ['oklch(0.82 0.05 65)', 'oklch(0.72 0.06 55)', 'oklch(0.88 0.04 75)'][(i * 7 + row * 3) % 3], 0.9); ctx.albedo(BARK);
      log(P, [it.x + d[0] * u, g + r + row * r * 1.9, it.z + d[1] * u], nz, r * (0.85 + ((i * 13 + row) % 5) * 0.05), 0.46, n);
    }
    paint(ctx, null, 'oklch(0.62 0.06 55)', 0.85); ctx.albedo(TEX.oak);
    obox(P, it.x, g + 1.08, it.z, L + 0.3, 0.05, 0.6, a);
  },
  barrel(ctx, P, it, lod) {
    const g = it.g, n = lod <= 2 ? 14 : 7, h = it.h || 0.95;
    paint(ctx, null, 'oklch(0.7 0.06 55)', 0.85); ctx.albedo(TEX.oak);
    lathe(P, [[0.27, g], [0.33, g + h * 0.25], [0.35, g + h * 0.5], [0.33, g + h * 0.75], [0.27, g + h], [0, g + h]], n, it.x, it.z);
    paint(ctx, null, IRON, 0.5, 0.6);
    for (const f of [0.1, 0.3, 0.7, 0.9]) { const r = 0.27 + 0.08 * Math.sin(f * Math.PI) + 0.012; lathe(P, [[r, g + h * f - 0.03], [r, g + h * f + 0.03]], n, it.x, it.z); }
    if (it.lid) { paint(ctx, null, 'oklch(0.6 0.06 50)', 0.85); ctx.albedo(TEX.oak); obox(P, it.x + 0.05, g + h, it.z, 0.62, 0.04, 0.62, 0.4); }
  },
  bin(ctx, P, it, lod) { // slatted waste bin with a hinged lid
    const a = it.yaw || 0, g = it.g;
    paint(ctx, null, 'oklch(0.55 0.07 150)', 0.8); ctx.albedo(TEX.oak);
    obox(P, it.x, g + 0.05, it.z, 0.66, 0.85, 0.56, a);
    paint(ctx, null, 'oklch(0.42 0.06 150)', 0.8); ctx.albedo(TEX.oak);
    obox(P, it.x, g + 0.9, it.z, 0.74, 0.07, 0.64, a);
    if (lod <= 2) { paint(ctx, null, IRON, 0.5, 0.6); for (const f of [0.15, 0.75]) obox(P, it.x, g + f, it.z, 0.68, 0.05, 0.58, a); for (const s of [-1, 1]) for (const t of [-1, 1]) obox(P, it.x + Math.cos(a) * s * 0.28 + Math.sin(a) * t * 0.23, g, it.z - Math.sin(a) * s * 0.28 + Math.cos(a) * t * 0.23, 0.06, 0.08, 0.06, a); }
  },
  crates(ctx, P, it, lod) {
    const a = it.yaw || 0, stack = it.stack || [[0, 0, 0], [0.62, 0, 0.05], [0.3, 1, 0.1]];
    for (const [u, lvl, tw] of stack) {
      const cx = it.x + Math.cos(a) * u, cz = it.z - Math.sin(a) * u, y = it.g + lvl * 0.56, yy = a + tw;
      paint(ctx, null, 'oklch(0.82 0.06 70)', 0.85); ctx.albedo(TEX.oak); obox(P, cx, y, cz, 0.56, 0.56, 0.56, yy);
      if (lod <= 2) { paint(ctx, null, 'oklch(0.62 0.07 55)', 0.85); ctx.albedo(TEX.oak); for (const [sx, sz] of [[0.6, 0.04], [0.04, 0.6]]) for (const f of [0.03, 0.5]) obox(P, cx, y + f, cz, sx === 0.6 ? 0.6 : 0.6, 0.05, 0.6, yy + (sx === 0.6 ? 0 : Math.PI / 2)); for (const s of [-1, 1]) for (const t of [-1, 1]) obox(P, cx + Math.cos(yy) * s * 0.27 + Math.sin(yy) * t * 0.27, y, cz - Math.sin(yy) * s * 0.27 + Math.cos(yy) * t * 0.27, 0.06, 0.56, 0.06, yy); }
    }
  },
  ladder(ctx, P, it, lod) { // leaning: foot at (x,z), top against a wall at height h, along the wall normal (nx,nz)
    const h = it.h || 3.4, lean = h * 0.26, n = [it.nx, it.nz], s = [-n[1], n[0]], fx = it.x + n[0] * lean, fz = it.z + n[1] * lean, g = it.g;
    paint(ctx, null, 'oklch(0.74 0.06 65)', 0.85); ctx.albedo(TEX.oak);
    for (const o of [-0.22, 0.22]) beam(P, [fx + s[0] * o, g, fz + s[1] * o], [it.x + s[0] * o, g + h, it.z + s[1] * o], 0.06, 0.08);
    const k = Math.floor(h / 0.3);
    for (let i = 1; i < k; i++) { const t = i / k; beam(P, [lerp(fx, it.x, t) - s[0] * 0.22, g + h * t, lerp(fz, it.z, t) - s[1] * 0.22], [lerp(fx, it.x, t) + s[0] * 0.22, g + h * t, lerp(fz, it.z, t) + s[1] * 0.22], 0.035, 0.035); }
  },
  lamp(ctx, P, it, lod) { // wrought-iron wall lantern at height y on a wall, facing (nx,nz) out of it
    const n = [it.nx, it.nz], y = it.y, b = [it.x + n[0] * 0.5, y, it.z + n[1] * 0.5];
    paint(ctx, null, IRON, 0.45, 0.7);
    obox(P, it.x, y - 0.35, it.z, 0.16, 0.5, 0.16, yawAlong(-n[1], n[0]));
    beam(P, [it.x, y, it.z], b, 0.04, 0.04); beam(P, [it.x, y - 0.3, it.z], [it.x + n[0] * 0.3, y - 0.02, it.z + n[1] * 0.3], 0.03, 0.03);
    if (lod <= 2) { const K = 6; for (let i = 0; i < K; i++) { const t0 = i / K * Math.PI, t1 = (i + 1) / K * Math.PI, r = 0.08; beam(P, [b[0] - n[0] * 0.14 + n[0] * Math.cos(t0) * r, y + 0.08 + Math.sin(t0) * r, b[2] - n[1] * 0.14 + n[1] * Math.cos(t0) * r], [b[0] - n[0] * 0.14 + n[0] * Math.cos(t1) * r, y + 0.08 + Math.sin(t1) * r, b[2] - n[1] * 0.14 + n[1] * Math.cos(t1) * r], 0.02, 0.02); } }
    beam(P, b, [b[0], y - 0.12, b[2]], 0.02, 0.02);
    const cy = y - 0.62, nn = lod <= 2 ? 6 : 4;
    lathe(P, [[0.02, cy + 0.5], [0.16, cy + 0.4], [0.2, cy + 0.36], [0, cy + 0.36]], nn, b[0], b[2]);
    lathe(P, [[0, cy - 0.02], [0.13, cy - 0.02], [0.13, cy + 0.04], [0, cy + 0.04]], nn, b[0], b[2]);
    if (lod <= 2) for (let i = 0; i < 4; i++) { const t = i / 4 * TAU + Math.PI / 4; beam(P, [b[0] + Math.cos(t) * 0.13, cy + 0.02, b[2] + Math.sin(t) * 0.13], [b[0] + Math.cos(t) * 0.16, cy + 0.38, b[2] + Math.sin(t) * 0.16], 0.02, 0.02); }
    paint(ctx, null, 'oklch(0.95 0.07 85)', 0.2); ctx.emissive(3.0, 1.9, 0.75);
    lathe(P, [[0.115, cy + 0.04], [0.145, cy + 0.37], [0, cy + 0.37]], nn, b[0], b[2]);
  },
  path(ctx, P, it, lod) { // stepping stones a→b
    const [a, b] = [it.a, it.b], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(2, Math.round(L / 0.7));
    for (let i = 0; i < k; i++) { const t = (i + 0.5) / k, j = (ctx.random() - 0.5) * 0.2; paint(ctx, null, ['oklch(0.86 0.02 80)', 'oklch(0.8 0.025 75)'][i % 2], 0.9); ctx.albedo(TEX.stone); obox(P, lerp(a[0], b[0], t) + j, lerp(a[2], b[2], t) - 0.05, lerp(a[1], b[1], t) - j, 0.55 + ctx.random() * 0.15, 0.1, 0.45 + ctx.random() * 0.12, ctx.random() * 3); }
  },
};
export const geometry = softened(function geometry(ctx) {
  const lod = ctx.lod || 1, p = ctx.params;
  if (p.kind === 'wall') return stoneWall(ctx, ctx, p, lod);
  for (const it of p.items || []) ITEMS[it.t]?.(ctx, ctx, it, lod);
});
export function collider(ctx) {
  const p = ctx.params;
  if (p.kind === 'wall') return wallCollider(ctx, p);
  for (const it of p.items || []) {
    if (it.t === 'hedge') for (let i = 0; i < it.pts.length - 1; i++) { const a = it.pts[i], b = it.pts[i + 1]; seg(ctx, [a[0], a[1]], [b[0], b[1]], Math.min(a[2], b[2]) - 0.3, a[2] + (it.h || 1.7), Math.min(a[2], b[2]) - 0.3, b[2] + (it.h || 1.7), it.w || 0.95); }
    else if (it.t === 'barrel' || it.t === 'pot') obox(ctx, it.x, it.g, it.z, 0.66, it.t === 'pot' ? 0.64 : 0.95, 0.66, 0);
    else if (it.t === 'bin') obox(ctx, it.x, it.g, it.z, 0.74, 0.95, 0.64, it.yaw || 0);
    else if (it.t === 'wood') obox(ctx, it.x, it.g, it.z, (it.len || 1.8) + 0.2, 1.1, 0.6, it.yaw || 0);
    else if (it.t === 'crates') obox(ctx, it.x + Math.cos(it.yaw || 0) * 0.31, it.g, it.z - Math.sin(it.yaw || 0) * 0.31, 1.25, 1.1, 0.7, it.yaw || 0);
  }
}
