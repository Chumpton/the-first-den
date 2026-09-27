// Lumenvale's shared builder: a yawed frame, quads wound from an outward direction, boxes, prisms, lathes and crystals.
export const C = {
  stone: "oklch(0.97 0.012 250)", plinth: "oklch(0.91 0.02 255)", quoin: "oklch(0.95 0.03 85)", trim: "oklch(0.87 0.09 88)",
  roof: "oklch(0.95 0.06 90)", glass: "oklch(0.5 0.06 225)", wood: "oklch(0.62 0.09 62)", dark: "oklch(0.46 0.07 52)",
  teal: "oklch(0.84 0.11 190)", lilac: "oklch(0.8 0.11 305)", hedge: "oklch(0.56 0.12 145)", lawn: "oklch(0.74 0.13 132)",
  gravel: "oklch(0.9 0.03 85)", floor: "oklch(0.72 0.08 65)", skin: "oklch(0.82 0.06 60)",
};
export const TEX = { stone: "cdn/texture-moonstone-white-ashlar.png", roof: "cdn/texture-pale-gold-roof-tiles.png", paving: "cdn/texture-pale-moonstone-paving.png" };
export const GLOW = { teal: [0.3, 1.2, 1.15], lilac: [0.95, 0.55, 1.35], warm: [1.7, 0.95, 0.4], rose: [1.3, 0.5, 0.75], gold: [1.3, 1.0, 0.4], green: [0.5, 1.4, 0.5] };
export const HUE = { teal: C.teal, lilac: C.lilac, warm: "oklch(0.9 0.1 70)", rose: "oklch(0.85 0.09 350)", gold: C.trim, green: "oklch(0.85 0.14 145)" };
export const yawToward = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const TAU = Math.PI * 2;
export function kit(ctx, solid = false) {
  let ox = 0, oy = 0, oz = 0, c = 1, s = 0;
  const P = (p) => [ox + p[0] * c + p[2] * s, oy + p[1], oz - p[0] * s + p[2] * c];
  const cr = (a, b, d) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2]; return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; };
  const ring = (cx, y, cz, r, n, ph) => { const o = []; for (let i = 0; i < n; i++) { const a = ph + i * TAU / n; o.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); } return o; };
  const K = {
    solid,
    paint(col, glow = null, rough = null, metal = null) { if (solid) return K; ctx.color(col); if (glow) ctx.emissive(glow[0], glow[1], glow[2]); else ctx.emissive(null); ctx.roughness(rough ?? 0.85); ctx.metalness(metal ?? 0); return K; },
    tex(ref) { if (!solid) ctx.albedo(ref); return K; },
    at(x = 0, y = 0, z = 0, yaw = 0) { ox = x; oy = y; oz = z; const a = yaw * Math.PI / 180; c = Math.cos(a); s = Math.sin(a); return K; },
    q(a, b, d, e, n) { const m = cr(a, b, d); if (!n || m[0] * n[0] + m[1] * n[1] + m[2] * n[2] >= 0) ctx.quad(...P(a), ...P(b), ...P(d), ...P(e)); else ctx.quad(...P(e), ...P(d), ...P(b), ...P(a)); },
    t(a, b, d, n) { const m = cr(a, b, d); if (!n || m[0] * n[0] + m[1] * n[1] + m[2] * n[2] >= 0) ctx.tri(...P(a), ...P(b), ...P(d)); else ctx.tri(...P(d), ...P(b), ...P(a)); },
    // skip letters: b bottom, t top, l -x, r +x, f -z, k +z
    box(x0, y0, z0, x1, y1, z1, skip = "") {
      if (!skip.includes("r")) K.q([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]);
      if (!skip.includes("l")) K.q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
      if (!skip.includes("k")) K.q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
      if (!skip.includes("f")) K.q([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]);
      if (!skip.includes("t")) K.q([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0]);
      if (!skip.includes("b")) K.q([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
    },
    prism(cx, cz, r0, r1, y0, y1, n, ph = 0, caps = "t") {
      const A = ring(cx, y0, cz, r0, n, ph), B = ring(cx, y1, cz, r1, n, ph);
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, m = ph + (i + 0.5) * TAU / n; K.q(A[i], A[j], B[j], B[i], [Math.cos(m), 0, Math.sin(m)]); }
      if (caps.includes("t")) for (let i = 0; i < n; i++) K.t([cx, y1, cz], B[i], B[(i + 1) % n], [0, 1, 0]);
      if (caps.includes("b")) for (let i = 0; i < n; i++) K.t([cx, y0, cz], A[i], A[(i + 1) % n], [0, -1, 0]);
    },
    cone(cx, cz, r, y0, y1, n, ph = 0) { const A = ring(cx, y0, cz, r, n, ph); for (let i = 0; i < n; i++) { const m = ph + (i + 0.5) * TAU / n; K.t(A[i], A[(i + 1) % n], [cx, y1, cz], [Math.cos(m), 0.2, Math.sin(m)]); } },
    // a ring band (annulus) with walls: r0 inner, r1 outer
    annulus(cx, cz, r0, r1, y0, y1, n, ph = 0) {
      const I0 = ring(cx, y0, cz, r0, n, ph), I1 = ring(cx, y1, cz, r0, n, ph), O0 = ring(cx, y0, cz, r1, n, ph), O1 = ring(cx, y1, cz, r1, n, ph);
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, m = ph + (i + 0.5) * TAU / n, rn = [Math.cos(m), 0, Math.sin(m)];
        K.q(O0[i], O0[j], O1[j], O1[i], rn); K.q(I0[i], I0[j], I1[j], I1[i], [-rn[0], 0, -rn[2]]); K.q(I1[i], I1[j], O1[j], O1[i], [0, 1, 0]); }
    },
    lathe(cx, cz, prof, n, ph = 0) {
      for (let k = 0; k + 1 < prof.length; k++) { const A = ring(cx, prof[k][1], cz, prof[k][0], n, ph), B = ring(cx, prof[k + 1][1], cz, prof[k + 1][0], n, ph);
        for (let i = 0; i < n; i++) { const j = (i + 1) % n, m = ph + (i + 0.5) * TAU / n, rn = [Math.cos(m), 0.01, Math.sin(m)];
          if (prof[k + 1][0] < 1e-4) K.t(A[i], A[j], B[i], rn); else K.q(A[i], A[j], B[j], B[i], rn); } }
    },
    bipyr(cx, cy, cz, r, up, dn, n = 6, ph = 0) {
      const A = ring(cx, cy, cz, r, n, ph), T = [cx, cy + up, cz], D = [cx, cy - dn, cz];
      for (let i = 0; i < n; i++) { const j = (i + 1) % n, m = ph + (i + 0.5) * TAU / n, ex = Math.cos(m), ez = Math.sin(m);
        K.t(A[i], A[j], T, [ex, 0.3, ez]); K.t(A[j], A[i], D, [ex, -0.3, ez]); }
    },
    // a crystal along any axis: prism of radius r and length len, then a point of length tip
    shard(base, dir, r, len, tip, n = 6) {
      const L = Math.hypot(...dir), d = dir.map((v) => v / L), ref = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [0, 0, 1];
      let u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]]; const ul = Math.hypot(...u); u = u.map((v) => v / ul);
      const v = [u[1] * d[2] - u[2] * d[1], u[2] * d[0] - u[0] * d[2], u[0] * d[1] - u[1] * d[0]];
      const at = (t, a, rr) => [0, 1, 2].map((k) => base[k] + d[k] * t + (u[k] * Math.cos(a) + v[k] * Math.sin(a)) * rr);
      const tipP = [0, 1, 2].map((k) => base[k] + d[k] * (len + tip));
      for (let i = 0; i < n; i++) { const a0 = i * TAU / n, a1 = (i + 1) * TAU / n, am = (i + 0.5) * TAU / n, out = [0, 1, 2].map((k) => u[k] * Math.cos(am) + v[k] * Math.sin(am));
        K.q(at(0, a0, r), at(0, a1, r), at(len, a1, r * 0.92), at(len, a0, r * 0.92), out);
        K.t(at(len, a0, r * 0.92), at(len, a1, r * 0.92), tipP, out); }
    },
  };
  return K;
}
