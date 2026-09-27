// Low-poly helpers shared by the critter family: faceted blobs, cones and flat plates. Frame: -Z forward, +Y up, metres.
const TAU = Math.PI * 2, R = Math.PI / 180;
export function blob(ctx, c, r, o = {}) {
  const seg = o.seg ?? 6, rings = o.rings ?? 4, pitch = (o.pitch ?? 0) * R, yaw = (o.yaw ?? 0) * R;
  const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw), P = [];
  for (let j = 0; j <= rings; j++) {
    const ph = (j / rings) * Math.PI, row = [];
    for (let i = 0; i < seg; i++) {
      const th = (i / seg) * TAU + (o.twist ?? 0);
      let x = r[0] * Math.sin(ph) * Math.cos(th), y = r[1] * Math.cos(ph), z = r[2] * Math.sin(ph) * Math.sin(th);
      [y, z] = [y * cp - z * sp, y * sp + z * cp];
      if (yaw) [x, z] = [x * cy + z * sy, -x * sy + z * cy];
      row.push([x + c[0], y + c[1], z + c[2]]);
    }
    P.push(row);
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const a = P[j][i], b = P[j][(i + 1) % seg], d = P[j + 1][i], e = P[j + 1][(i + 1) % seg];
    if (j === 0) ctx.tri(...a, ...e, ...d);
    else if (j === rings - 1) ctx.tri(...a, ...b, ...e);
    else ctx.quad(...a, ...b, ...e, ...d);
  }
}
export function cone(ctx, base, tip, r, seg = 4) {
  const d = [tip[0] - base[0], tip[1] - base[1], tip[2] - base[2]], L = Math.hypot(...d) || 1;
  d[0] /= L; d[1] /= L; d[2] /= L;
  const ref = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let u = [d[1] * ref[2] - d[2] * ref[1], d[2] * ref[0] - d[0] * ref[2], d[0] * ref[1] - d[1] * ref[0]];
  const ul = Math.hypot(...u); u = u.map((v) => v / ul);
  const v = [d[1] * u[2] - d[2] * u[1], d[2] * u[0] - d[0] * u[2], d[0] * u[1] - d[1] * u[0]];
  const ring = [];
  for (let i = 0; i < seg; i++) { const a = (i / seg) * TAU, c = Math.cos(a) * r, s = Math.sin(a) * r; ring.push([base[0] + u[0] * c + v[0] * s, base[1] + u[1] * c + v[1] * s, base[2] + u[2] * c + v[2] * s]); }
  for (let i = 0; i < seg; i++) { const a = ring[i], b = ring[(i + 1) % seg]; ctx.tri(...a, ...b, ...tip); ctx.tri(...b, ...a, ...base); }
}
export function plate(ctx, pts) { for (let i = 1; i < pts.length - 1; i++) ctx.tri(...pts[0], ...pts[i], ...pts[i + 1]); }
