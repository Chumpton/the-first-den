// A wild mushroom cluster: a moss pad with leaf litter and 2-5 caps of one kind. Origin = the pad's centre on the ground.
// params { kind, count }, seed varies the layout. No collider: bodies walk through.
import { MUSHROOMS as M } from '../lib/data/mushrooms.js';
const TAU = Math.PI * 2;
function lathe(ctx, prof, n, cx, cy, cz, wob = 0, ph = 0) {
  const ring = (k) => { const [r, y] = prof[k]; const pts = []; for (let i = 0; i <= n; i++) { const a = (i / n) * TAU, rr = r * (1 + wob * Math.sin(a * 5 + ph)); pts.push([cx + Math.cos(a) * rr, cy + y, cz + Math.sin(a) * rr]); } return pts; };
  for (let k = 0; k < prof.length - 1; k++) {
    const A = ring(k), B = ring(k + 1);
    for (let i = 0; i < n; i++) {
      if (prof[k + 1][0] === 0) ctx.tri(...A[i], ...B[i], ...A[i + 1]);
      else if (prof[k][0] === 0) ctx.tri(...A[i], ...B[i], ...B[i + 1]);
      else ctx.quad(...A[i], ...B[i], ...B[i + 1], ...A[i + 1]);
    }
  }
}
function paint(ctx, c, rough = 0.8, glow = null) { ctx.color(c); ctx.roughness(rough); ctx.metalness(0); glow ? ctx.emissive(...glow) : ctx.emissive(null); }
function cap(ctx, K, x, y, z, s, lod, R) {
  const n = lod <= 1 ? 10 : lod === 2 ? 8 : lod <= 4 ? 6 : 5; // tiny objects reach far lods early: keep the silhouette round
  const h = K.h * s, r = K.r * s, sr = K.stemR * s, lean = (R() - 0.5) * 0.3 * h;
  const tx = x + lean, tz = z + lean * 0.6;
  paint(ctx, K.stem, 0.9);
  if (K.shape === 'funnel') { // chanterelle: one golden trumpet, wavy rim
    paint(ctx, K.cap, 0.75);
    lathe(ctx, [[sr, 0], [sr * 1.1, h * 0.5], [r * 0.55, h * 0.85], [r, h], [r * 0.85, h * 1.04], [r * 0.3, h * 0.92], [0, h * 0.9]], n, x, y, z, lod <= 2 ? 0.1 : 0, R() * 6);
    return;
  }
  const base = K.shape === 'bolete' ? [[sr * 1.4, 0], [sr * 1.6, h * 0.35], [sr * 1.1, h]] : [[sr * 1.3, 0], [sr, h * 0.5], [sr * 0.9, h]];
  lathe(ctx, base.concat([[0, h]]), Math.max(4, n - 2), x, y, z);
  const prof = K.shape === 'bolete' ? [[sr, -0.005], [r, r * 0.12], [r * 0.9, r * 0.5], [r * 0.5, r * 0.78], [0, r * 0.85]]
    : K.shape === 'flat' ? [[sr, 0], [r, r * 0.1], [r * 0.8, r * 0.3], [0, r * 0.38]]
    : [[sr, 0], [r, r * 0.08], [r * 0.9, r * 0.45], [r * 0.55, r * 0.75], [0, r * 0.82]];
  // underside (gills) a shade paler, then the top
  paint(ctx, K.stem, 0.9, K.glow ? K.glow.map((v) => v * 0.5) : null);
  if (lod <= 3) lathe(ctx, [[0, -0.004], [r * 0.98, r * 0.07]], n, tx, y + h, tz);
  paint(ctx, K.cap, K.shape === 'dome' ? 0.55 : 0.8, K.glow || null);
  lathe(ctx, prof, n, tx, y + h, tz);
  if (K.spots && lod <= 4) { // fly agaric's white warts
    paint(ctx, K.spots, 0.9);
    const ns = lod === 1 ? 7 : lod <= 3 ? 5 : 3;
    for (let i = 0; i < ns; i++) {
      const a = R() * TAU, t = 0.25 + R() * 0.6, rr = r * (0.2 + 0.72 * t), yy = y + h + r * (0.82 - 0.7 * t * t) + 0.004, d = r * (0.1 + R() * 0.06);
      const px = tx + Math.cos(a) * rr, pz = tz + Math.sin(a) * rr;
      ctx.tri(px - d, yy, pz, px, yy + d * 0.4, pz, px, yy, pz + d); ctx.tri(px, yy, pz + d, px, yy + d * 0.4, pz, px + d, yy, pz);
      ctx.tri(px + d, yy, pz, px, yy + d * 0.4, pz, px, yy, pz - d); ctx.tri(px, yy, pz - d, px, yy + d * 0.4, pz, px - d, yy, pz);
    }
  }
}
export function geometry(ctx) {
  const K = M.kinds[ctx.params.kind] || M.kinds.bolete, lod = ctx.lod ?? 1, R = () => ctx.random();
  const count = Math.max(2, Math.min(5, ctx.params.count ?? 3)), P = M.pad.radius;
  ctx.flat();
  // moss pad: a low jagged dome sunk at its rim
  ctx.albedo('cdn/texture-soft-green-moss-cozy.png'); paint(ctx, M.pad.tint, 1);
  const pn = lod <= 2 ? 9 : lod === 3 ? 7 : 5, jag = [];
  for (let i = 0; i <= pn; i++) jag.push(i === pn ? jag[0] : 0.8 + R() * 0.35);
  for (let i = 0; i < pn; i++) {
    const a0 = (i / pn) * TAU, a1 = ((i + 1) / pn) * TAU, e0 = P * jag[i], e1 = P * jag[i + 1];
    const o0 = [Math.cos(a0) * e0, -0.03, Math.sin(a0) * e0], o1 = [Math.cos(a1) * e1, -0.03, Math.sin(a1) * e1];
    if (lod <= 3) {
      const m0 = [o0[0] * 0.55, 0.035, o0[2] * 0.55], m1 = [o1[0] * 0.55, 0.035, o1[2] * 0.55];
      ctx.quad(...o0, ...m0, ...m1, ...o1); ctx.tri(...m0, 0, 0.045, 0, ...m1);
    } else ctx.tri(...o0, 0, 0.04, 0, ...o1);
  }
  ctx.albedo(null);
  // leaf litter: a few fallen leaves around the rim
  if (lod <= 2) {
    const nl = lod === 1 ? 6 : 4;
    for (let i = 0; i < nl; i++) {
      paint(ctx, M.pad.litter[i % M.pad.litter.length], 0.95);
      const a = R() * TAU, d = P * (0.55 + R() * 0.45), cx = Math.cos(a) * d, cz = Math.sin(a) * d, L = 0.07 + R() * 0.05, W = L * 0.45, t = R() * TAU;
      const ux = Math.cos(t), uz = Math.sin(t), y = 0.03 + R() * 0.012;
      ctx.quad(cx - ux * L, y, cz - uz * L, cx - uz * W, y + 0.01, cz + ux * W, cx + ux * L, y, cz + uz * L, cx + uz * W, y + 0.01, cz - ux * W);
    }
  }
  // the caps: the biggest near the middle, the rest round it
  const n = lod >= 5 ? Math.min(2, count) : count, S = M.sizeScale;
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, d = i === 0 ? R() * 0.06 : 0.1 + R() * 0.2, s = S * (i === 0 ? 1.1 : 0.6 + R() * 0.45);
    cap(ctx, K, Math.cos(a) * d, 0.02, Math.sin(a) * d, s, lod, R);
  }
}
export function collider() { return null; }
