// Stylized-ARPG tree kit: every face carries its own lighting normal, so canopies light as soft pillows
// (normals pushed out from each mass's centre) and trunks as round wood, while the mesh stays low-poly.
// Usage: const m = mesher(ctx); ... m.tri / m.tube / m.puff ...; return m.done();
const TAU = Math.PI * 2;
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export function hex(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
export function ramp(stops, t) { // stops: hex[], t 0..1 → [r,g,b]
  t = Math.max(0, Math.min(0.9999, t)) * (stops.length - 1); const i = Math.floor(t), f = t - i, a = hex(stops[i]), b = hex(stops[i + 1]);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
export function mesher(ctx) {
  const N = [];
  const m = {
    tri(a, b, c, na, nb, nc) { ctx.tri(...a, ...b, ...c); N.push(...na, ...nb, ...nc); },
    quad(a, b, c, d, na, nb, nc, nd) { m.tri(a, b, c, na, nb, nc); m.tri(a, c, d, na, nc, nd); },
    // a bent tube through pts with radii; ring normals point out from the spine; flare = lobed root skirt on ring 0
    tube(pts, radii, n, phase = 0, flare = 0) {
      let prevRing = null, prevNs = null;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], d = norm(sub(pts[Math.min(i + 1, pts.length - 1)], pts[Math.max(i - 1, 0)]));
        let u = norm(cross(d, Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0])); const w = cross(d, u);
        const ring = [], ns = [];
        for (let j = 0; j < n; j++) {
          const a = j / n * TAU + phase, lobe = i === 0 && flare ? 1 + flare * Math.max(0, Math.sin(a * 5 + phase * 3)) ** 2 : 1;
          const dir = [u[0] * Math.cos(a) + w[0] * Math.sin(a), u[1] * Math.cos(a) + w[1] * Math.sin(a), u[2] * Math.cos(a) + w[2] * Math.sin(a)];
          const r = radii[i] * lobe;
          ring.push([p[0] + dir[0] * r, p[1] + dir[1] * r - (i === 0 && flare ? 0.05 : 0), p[2] + dir[2] * r]);
          ns.push(i === 0 && flare ? norm([dir[0], 0.6, dir[2]]) : dir);
        }
        if (prevRing) for (let j = 0; j < n; j++) { const k = (j + 1) % n; m.quad(prevRing[k], prevRing[j], ring[j], ring[k], prevNs[k], prevNs[j], ns[j], ns[k]); }
        prevRing = ring; prevNs = ns;
      }
    },
    // a lumpy pillow: lat-long ball, normals from `pivot` (the mass's centre) so overlapping puffs light as one cloud
    puff(c, rx, ry, rz, seg, pivot, colorAt) {
      const lat = Math.max(3, Math.round(seg * 0.7)), P = [];
      for (let i = 0; i <= lat; i++) {
        const row = [], phi = i / lat * Math.PI;
        for (let j = 0; j < seg; j++) {
          const th = j / seg * TAU + (i % 2) * Math.PI / seg, k = (i === 0 || i === lat) ? 1 : 0.9 + ctx.random() * 0.18;
          row.push([c[0] + Math.sin(phi) * Math.cos(th) * rx * k, c[1] + Math.cos(phi) * ry * (i === lat ? 0.75 : 1) * k, c[2] + Math.sin(phi) * Math.sin(th) * rz * k]);
        }
        P.push(row);
      }
      const nf = (p) => norm(sub(p, pivot));
      for (let i = 0; i < lat; i++) for (let j = 0; j < seg; j++) {
        const a = P[i][j], b = P[i][(j + 1) % seg], cc = P[i + 1][(j + 1) % seg], d = P[i + 1][j];
        const mid = [(a[0] + cc[0]) / 2, (a[1] + cc[1]) / 2, (a[2] + cc[2]) / 2];
        ctx.color(...colorAt(mid, nf(mid)));
        m.quad(a, b, cc, d, nf(a), nf(b), nf(cc), nf(d));
      }
    },
    done() { return { normals: N }; },
  };
  return m;
}
// a gently bent spine from base to top: a quadratic bend in a seeded direction, sampled in `steps`
export function spine(ctx, base, top, bend, steps) {
  const a = ctx.random() * TAU, bx = Math.cos(a) * bend, bz = Math.sin(a) * bend, pts = [];
  for (let i = 0; i <= steps; i++) { const t = i / steps, s = Math.sin(t * Math.PI) ; pts.push([base[0] + (top[0] - base[0]) * t + bx * s, base[1] + (top[1] - base[1]) * t, base[2] + (top[2] - base[2]) * t + bz * s]); }
  return pts;
}
