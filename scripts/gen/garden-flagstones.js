// Irregular pale limestone stepping flags laid along polylines, with slivers of lawn between.
// params: { origin: [x, z] world of the row's feet, paths: [[[x, z], …], …] world, hubs: [[x, z, r]], width }
import { T, Q, paint } from '../lib/garden-kit.js';
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, [ox, oz] = p.origin || [0, 0], W = p.width ?? 1;
  ctx.flat();
  const rnd = () => ctx.random(), placed = [];
  const tryFlag = (x, z, r) => { for (const f of placed) if (Math.hypot(f[0] - x, f[1] - z) < (f[2] + r) * 0.93) return; placed.push([x, z, r]); };
  for (const [hx, hz, hr] of p.hubs || []) {
    const cx = hx - ox, cz = hz - oz; tryFlag(cx, cz, 0.46);
    const n = Math.max(6, Math.round(hr * 8));
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd() * 0.2; tryFlag(cx + Math.cos(a) * 0.8, cz + Math.sin(a) * 0.8, 0.29); }
  }
  for (const line of p.paths || []) {
    const P = line.map(([x, z]) => [x - ox, z - oz]);
    let i = 0;
    for (let s = 0; s < P.length - 1; s++) {
      const [ax, az] = P[s], [bx, bz] = P[s + 1], L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, nx = -tz, nz = tx;
      for (let d = s === 0 ? 0 : 0.31; d <= L + 0.01; d += 0.62, i++) {
        const x = ax + tx * d, z = az + tz * d, j = () => (rnd() - 0.5) * 0.08;
        if (i % 2 === 0) tryFlag(x + nx * j() + tx * j(), z + nz * j() + tz * j(), W * (0.36 + rnd() * 0.04));
        else for (const side of [-1, 1]) tryFlag(x + nx * side * W * 0.245 + j(), z + nz * side * W * 0.245 + j(), W * (0.23 + rnd() * 0.03));
      }
    }
  }
  const n = lod <= 2 ? 7 : 5;
  for (const [x, z, r] of placed) {
    const gy = ctx.groundY(x, z), top = gy + 0.045, bot = gy - 0.07, ang0 = rnd() * 6.283, V = [];
    for (let i = 0; i < n; i++) { const a = ang0 + i / n * 6.283 + (rnd() - 0.5) * 0.45, rr = r * (0.84 + rnd() * 0.2); V.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
    paint(ctx, 'stone', `oklch(${(0.9 + rnd() * 0.08).toFixed(3)} ${(0.01 + rnd() * 0.02).toFixed(3)} ${(70 + rnd() * 30).toFixed(0)})`, 0.92);
    const tx = (rnd() - 0.5) * 0.04, tz = (rnd() - 0.5) * 0.04, yt = (v) => top + v[0] * tx + v[1] * tz;
    const c = [x, top, z], o = [x, gy - 0.02, z], at = (v, y) => [x + v[0], y, z + v[1]];
    if (lod <= 1) {
      const inner = V.map((v) => { const l = Math.hypot(v[0], v[1]); return [v[0] * (l - 0.03) / l, v[1] * (l - 0.03) / l]; });
      for (let i = 0; i < n; i++) {
        const k = (i + 1) % n;
        T(ctx, c, at(inner[i], yt(inner[i])), at(inner[k], yt(inner[k])), o);
        Q(ctx, at(inner[i], yt(inner[i])), at(inner[k], yt(inner[k])), at(V[k], yt(V[k]) - 0.022), at(V[i], yt(V[i]) - 0.022), o);
        Q(ctx, at(V[i], yt(V[i]) - 0.022), at(V[k], yt(V[k]) - 0.022), at(V[k], bot), at(V[i], bot), o);
      }
    } else {
      for (let i = 0; i < n; i++) {
        const k = (i + 1) % n;
        T(ctx, c, at(V[i], yt(V[i])), at(V[k], yt(V[k])), o);
        if (lod <= 2) Q(ctx, at(V[i], yt(V[i])), at(V[k], yt(V[k])), at(V[k], bot), at(V[i], bot), o);
      }
    }
  }
  ctx.albedo(null);
}
export function collider() { return null; }
