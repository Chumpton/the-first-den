// Farm fencing: a run of posts and rails along a local x/z polygon, with swung-open gates.
// params: points [[x,z]…], closed, style ("split" rustic split rail | "pen" sawn plank livestock fence), post (spacing m), gates [{ seg, t, w, open (deg) }].
import { beam, obox, TAU } from '../lib/yard-kit.js';
import { solid, ngon } from '../lib/road-solid.js';
function runs(p) {
  const pts = p.points || [], closed = p.closed !== false, n = closed ? pts.length : pts.length - 1, step = p.post ?? 2.4;
  const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cz = pts.reduce((a, q) => a + q[1], 0) / pts.length;
  const out = { spans: [], posts: [], gates: [] };
  for (let i = 0; i < n; i++) {
    const A = pts[i], B = pts[(i + 1) % pts.length], L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L < 0.3) continue;
    const u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L], at = (s) => [A[0] + u[0] * s, A[1] + u[1] * s];
    const gaps = (p.gates || []).filter((g) => g.seg === i).map((g) => { const m = g.t * L; return [m - g.w / 2, m + g.w / 2, g]; }).sort((a, b) => a[0] - b[0]);
    let s = 0; const ivs = [];
    for (const [g0, g1, g] of gaps) {
      ivs.push([s, g0]); s = g1;
      let nx = -u[1], nz = u[0]; const mid = at((g0 + g1) / 2); if (nx * (cx - mid[0]) + nz * (cz - mid[1]) < 0) { nx = -nx; nz = -nz; }
      const o = (g.open ?? 70) * Math.PI / 180, d = [u[0] * Math.cos(o) + nx * Math.sin(o), u[1] * Math.cos(o) + nz * Math.sin(o)];
      out.gates.push({ h: at(g0 + 0.08), d, w: g.w - 0.2, g0: at(g0), g1: at(g1) });
    }
    ivs.push([s, L]);
    for (const [s0, s1] of ivs) {
      if (s1 - s0 < 0.2) continue;
      const m = Math.max(1, Math.ceil((s1 - s0) / step));
      for (let k = 0; k <= m; k++) {
        const ss = s0 + (s1 - s0) * k / m;
        if (!(k === 0 && s0 === 0 && (i > 0 || closed))) out.posts.push({ at: at(ss), tall: (k === 0 && s0 > 0) || (k === m && s1 < L) });
        if (k > 0) out.spans.push([at(s0 + (s1 - s0) * (k - 1) / m), at(ss), u]);
      }
    }
  }
  return out;
}
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, pen = p.style === 'pen', R = () => ctx.random(), F = runs(p);
  ctx.flat();
  ctx.albedo(pen ? 'cdn/texture-honey-oak-barn-planks.png' : 'cdn/texture-hand-joined-walnut-wood.png');
  ctx.color(pen ? 'oklch(0.97 0.02 80)' : 'oklch(0.93 0.02 70)'); ctx.roughness(0.9); ctx.metalness(0); ctx.emissive(null);
  for (const q of F.posts) {
    const [x, z] = q.at, h = (q.tall ? 1.5 : pen ? 1.32 : 1.18) + (pen ? 0 : (R() - 0.5) * 0.12);
    if (pen) obox(ctx, x, -0.3, z, 0.14, h + 0.3, 0.14, R() * 0.08);
    else if (lod <= 3) { const a = R() * TAU; solid(ctx, ngon(5, 0.085, x, z, a).map(([u, v]) => [u, -0.3, v]), ngon(5, 0.068, x, z, a).map(([u, v]) => [u, h, v])); }
    else obox(ctx, x, -0.3, z, 0.14, h + 0.3, 0.14);
  }
  const H = pen ? (lod <= 2 ? [0.35, 0.7, 1.05, 1.28] : [0.5, 1.1]) : (lod <= 2 ? [0.3, 0.64, 1.0] : [0.5, 1.0]);
  for (const [a, b, u] of F.spans) {
    const ex = pen ? 0.05 : 0.18;
    for (const y of H) {
      const j = pen ? 0 : (R() - 0.5) * 0.05, k = pen ? 0 : (R() - 0.5) * 0.05;
      beam(ctx, [a[0] - u[0] * ex, y + j, a[1] - u[1] * ex], [b[0] + u[0] * ex, y + k, b[1] + u[1] * ex], pen ? 0.05 : 0.11, pen ? 0.15 : 0.09);
    }
  }
  if (lod <= 3) {
    ctx.albedo('cdn/texture-hand-joined-walnut-wood.png'); ctx.color('oklch(0.86 0.02 60)');
    for (const g of F.gates) {
      const [hx, hz] = g.h, [dx, dz] = g.d, P = (s, y) => [hx + dx * s, y, hz + dz * s];
      for (const y of [0.25, 0.7, 1.15]) beam(ctx, P(0, y), P(g.w, y), 0.06, 0.13);
      beam(ctx, P(0.05, 0.12), P(0.05, 1.25), 0.1, 0.1); beam(ctx, P(g.w, 0.12), P(g.w, 1.25), 0.1, 0.1);
      beam(ctx, P(0.08, 0.25), P(g.w - 0.05, 1.15), 0.06, 0.11);
    }
  }
}
export function collider(ctx) {
  const F = runs(ctx.params || {});
  for (const [a, b] of F.spans) beam(ctx, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.16, 1.3);
}
