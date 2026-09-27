// laid limestone flag walks + hub rings, moss in the joints. params: { walks: [[[x,z],...],...], hubs: [[x,z,R],...], width } 
import { paint, T, Q, TAU } from '../lib/yard-kit.js';
// Catmull-Rom: round every bend into a gentle curve, 1 sample per ~0.8 m
function cr(l) {
  if (l.length < 3) return l;
  const o = [l[0]];
  for (let i = 0; i < l.length - 1; i++) {
    const p0 = l[Math.max(0, i - 1)], p1 = l[i], p2 = l[i + 1], p3 = l[Math.min(l.length - 1, i + 2)], n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 0.8));
    for (let k = 1; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; o.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  return o;
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, W = p.width ?? 1.6, walks = (p.walks || []).map((l) => p.smooth ? cr(l) : l), hubs = p.hubs || [];
  ctx.flat();
  const rnd = () => ctx.random(), flags = [];
  const near = (x, z, g, m) => flags.some((f) => f.g !== g && Math.hypot(f.x - x, f.z - z) < m);
  hubs.forEach(([hx, hz, R], hi) => {
    const rr = (R + 0.95) / 2, half = (R - 0.95) / 2, n = Math.max(8, Math.floor(TAU * rr / 0.62)), a0 = rnd() * TAU;
    for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; flags.push({ g: 'h' + hi, x: hx + Math.cos(a) * rr, z: hz + Math.sin(a) * rr, tx: -Math.sin(a), tz: Math.cos(a), a: TAU * rr / n * 0.43, b: half * 0.93 }); }
  });
  walks.forEach((line, wi) => {
    let carry = 0.29;
    for (let s = 0; s < line.length - 1; s++) {
      const [ax, az] = line[s], [bx, bz] = line[s + 1], L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, nx = -tz, nz = tx;
      let d = carry;
      for (; d <= L; d += 0.58) {
        const x = ax + tx * d, z = az + tz * d;
        if (hubs.some(([hx, hz, R]) => Math.hypot(hx - x, hz - z) < R + 0.12)) continue;
        const j = () => (rnd() - 0.5) * 0.05, ang = (rnd() - 0.5) * 0.12, ct = Math.cos(ang), st = Math.sin(ang);
        const ftx = tx * ct - nx * st, ftz = tz * ct - nz * st;
        if (rnd() < 0.4) { if (!near(x, z, wi, 0.55)) flags.push({ g: wi, x: x + j(), z: z + j(), tx: ftx, tz: ftz, a: 0.25 + rnd() * 0.02, b: W * (0.43 + rnd() * 0.03) }); }
        else {
          const e = (rnd() - 0.5) * 0.18 * W;
          for (const sd of [-1, 1]) {
            const hw = (W * 0.47 + sd * e) / 2, off = sd * (0.03 + hw) + e * 0.0;
            const px = x + nx * (off + (sd < 0 ? 0 : 0)) , pz = z + nz * off;
            if (!near(px, pz, wi, 0.4)) flags.push({ g: wi, x: px + j(), z: pz + j(), tx: ftx, tz: ftz, a: 0.24 + rnd() * 0.03, b: hw * 0.95 });
          }
        }
      }
      carry = d - L;
    }
  });
  // moss joints: a ribbon under every walk, a disc under every hub
  const my = 0.02, hw = W * 0.5 + 0.05;
  paint(ctx, 'moss', 'oklch(0.92 0.04 135)', 0.95);
  for (const line of walks) {
    for (let s = 0; s < line.length - 1; s++) {
      const [ax, az] = line[s], [bx, bz] = line[s + 1], L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L * hw, nz = (bx - ax) / L * hw;
      ctx.quad(ax - nx, my, az - nz, bx - nx, my, bz - nz, bx + nx, my, bz + nz, ax + nx, my, az + nz);
    }
    for (let s = 1; s < line.length - 1; s++) { const [cx, cz] = line[s]; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, b = (i + 1) / 8 * TAU; ctx.tri(cx, my, cz, cx + Math.cos(b) * hw, my, cz + Math.sin(b) * hw, cx + Math.cos(a) * hw, my, cz + Math.sin(a) * hw); } }
  }
  for (const [cx, cz, R] of hubs) { const n = 20, r = R + 0.06; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; ctx.tri(cx, my, cz, cx + Math.cos(b) * r, my, cz + Math.sin(b) * r, cx + Math.cos(a) * r, my, cz + Math.sin(a) * r); } }
  // the flags
  const n = lod <= 2 ? 7 : lod <= 4 ? 5 : 4, sp = (c) => Math.sign(c) * Math.pow(Math.abs(c), 0.55);
  for (const f of flags) {
    const skip = lod >= 5 && rnd() < 0.5;
    const nx = -f.tz, nz = f.tx, top = 0.045 + rnd() * 0.022, bot = -0.03, ph = rnd() * 0.6, tlx = (rnd() - 0.5) * 0.03, tlz = (rnd() - 0.5) * 0.03;
    const lum = 0.9 + rnd() * 0.08, chroma = 0.01 + rnd() * 0.02, hue = 70 + rnd() * 30;
    const V = [];
    for (let i = 0; i < n; i++) {
      const phi = ph + (i + 0.5) / n * TAU + (rnd() - 0.5) * 0.35, k = 0.88 + rnd() * 0.12;
      const lx = sp(Math.cos(phi)) * f.a * k, lz = sp(Math.sin(phi)) * f.b * k;
      V.push([f.x + f.tx * lx + nx * lz, top + lx * tlx + lz * tlz, f.z + f.tz * lx + nz * lz]);
    }
    if (skip) continue;
    paint(ctx, 'stone', `oklch(${lum.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(0)})`, 0.92);
    const o = [f.x, bot - 0.6, f.z], c = [f.x, top, f.z];
    if (lod === 1) {
      const I = V.map((v) => [c[0] + (v[0] - c[0]) * 0.86, v[1] + 0.008, c[2] + (v[2] - c[2]) * 0.86]), E = V.map((v) => [v[0], v[1] - 0.012, v[2]]);
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; T(ctx, c, I[i], I[j], o); Q(ctx, I[i], E[i], E[j], I[j], o); Q(ctx, E[i], [E[i][0], bot, E[i][2]], [E[j][0], bot, E[j][2]], E[j], o); }
    } else {
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; T(ctx, c, V[i], V[j], o); if (lod <= 3) Q(ctx, V[i], [V[i][0], bot, V[i][2]], [V[j][0], bot, V[j][2]], V[j], o); }
    }
  }
  ctx.albedo(null);
}
export function collider() { return null; }
