import { mesher, ramp, spine } from "./tree-kit.js";
// Stylized evergreens: a thick, slightly bent trunk with root flares, asymmetric tiered skirts whose ragged tips droop,
// each tier tilted its own way; normals swell out from the tree's axis so needles light as soft volumes;
// mossy shadow green underneath to sunlit olive at the tips. crown "fir" = tall and slender, "pine" = fuller and broader.
const TAU = Math.PI * 2;
const GRAD = ["#183424", "#2b5235", "#4a7a3f", "#86a957"], UNDER = "#14281c";
export function geometry(ctx) {
  const h = Number(ctx.params.height ?? 10), r = Number(ctx.params.radius ?? 2.6), full = ctx.params.crown === "pine";
  const lod = Number(ctx.lod ?? 1), m = mesher(ctx);
  const tiers = lod >= 4 ? 3 : lod >= 3 ? 5 : (full ? 5 : 6), pts = lod >= 4 ? 6 : lod >= 3 ? 8 : 12, n = lod >= 4 ? 5 : 7;
  const base = h * (full ? 0.12 : 0.17), rr = r * (full ? 1.3 : 1.15);
  ctx.albedo("scripts/tex-valley-bark.js"); ctx.color("#6b5543"); ctx.roughness(0.96);
  const tk = spine(ctx, [0, 0, 0], [0, h * 0.92, 0], h * 0.025, lod >= 4 ? 2 : 4);
  m.tube(tk, tk.map((_, i) => h * 0.03 * (1 - i / (tk.length - 1) * 0.85) + 0.02), n, ctx.random() * 6, lod >= 4 ? 0 : 1.1);
  ctx.albedo("scripts/tex-valley-canopy.js"); ctx.roughness(0.95);
  const span = h - base;
  for (let k = 0; k < tiers; k++) {
    const t0 = k / tiers, f = k / (tiers - 1 || 1);
    const at = tk[Math.min(tk.length - 1, Math.round((base + span * t0) / (h * 0.92) * (tk.length - 1)))];
    const yBot = base + span * t0, yTop = Math.min(h, base + span * (k + 1.5) / tiers);
    const w = rr * Math.pow(1 - t0, 0.9) * (0.88 + ctx.random() * 0.24);
    const tiltA = ctx.random() * TAU, tilt = 0.06 + ctx.random() * 0.08, ph = ctx.random() * TAU;
    const cx = at[0], cz = at[2], tip = [cx, yTop, cz];
    // ragged skirt: alternating long/short needle points, the long ones droop
    const edge = [], inner = [];
    for (let j = 0; j < pts; j++) {
      const a = j / pts * TAU + ph, long = j % 2 === 0, L = w * (long ? 1 : 0.68) * (0.85 + ctx.random() * 0.3);
      const tiltY = Math.cos(a - tiltA) * w * tilt;
      edge.push([cx + Math.cos(a) * L, yBot - (long ? w * 0.22 : w * 0.05) + tiltY, cz + Math.sin(a) * L]);
      inner.push([cx + Math.cos(a) * L * 0.38, yBot + w * 0.18 + tiltY * 0.4, cz + Math.sin(a) * L * 0.38]);
    }
    const pivot = [cx, yBot - w * 0.35, cz];
    const nf = (p) => { const v = [p[0] - pivot[0], (p[1] - pivot[1]) * 0.8, p[2] - pivot[2]]; const l = Math.hypot(...v) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
    for (let j = 0; j < pts; j++) {
      const a = edge[j], b = edge[(j + 1) % pts];
      ctx.color(...ramp(GRAD, 0.15 + f * 0.55 + (a[1] < yBot - w * 0.1 ? 0.25 : 0.1)));
      m.tri(b, a, tip, nf(b), nf(a), [0, 1, 0]);
      if (lod < 4) { // the dark underside, so a skirt reads as a heavy bough from below
        ctx.color(UNDER);
        const ia = inner[j], ib = inner[(j + 1) % pts], dn = [0, -1, 0];
        m.quad(a, b, ib, ia, dn, dn, dn, dn);
      }
    }
  }
  return m.done();
}
export function collider(ctx) { const h = Number(ctx.params.height ?? 10); return { kind: "box", width: h * 0.045, height: h * 0.68, depth: h * 0.045 }; }
