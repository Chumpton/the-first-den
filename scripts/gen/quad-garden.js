// The four-quarter kitchen garden: an oval of low limestone and wattle, a flagstone cross, a round hub with a birdbath,
// and four curved raised beds (cabbage · carrots · tomatoes · flowers). Long axis on X. Feet = the hub centre, y 0.
// params: { rx, rz, path, hub, gates: ["w","n","e"] }
import { paint, obox, beam, lathe, Q, T, TAU } from '../lib/yard-kit.js';
import { triangulate } from './home-garden-kit.js';

const P0 = (p) => ({ rx: p.rx ?? 7.4, rz: p.rz ?? 5, pw: (p.path ?? 1.2) / 2, hr: p.hub ?? 1.6, gates: p.gates ?? ['w', 'n', 'e'] });
const GATE = { w: Math.PI, e: 0, n: -Math.PI / 2, s: Math.PI / 2 }; // angle in (x, z) plane, z = -north
const BED_H = 0.34, WALL = 0.14;

function col(ctx, l, c, h, dl = 0.05, dh = 10) { return `oklch(${(l + (ctx.random() - 0.5) * dl).toFixed(3)} ${c.toFixed(3)} ${(h + (ctx.random() - 0.5) * dh).toFixed(0)})`; }
function blob(ctx, x, y, z, rx, ry, rz, n = 6) {
  const R = [[1, 0], [0.8, 0.55], [0.4, 0.92]], P = R.map(([r, h]) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * TAU; a.push([x + Math.cos(t) * rx * r, y + ry * h, z + Math.sin(t) * rz * r]); } return a; });
  const top = [x, y + ry, z], o = [x, y + ry * 0.3, z];
  for (let k = 0; k < 2; k++) for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, P[k][i], P[k][j], P[k + 1][j], P[k + 1][i], o); }
  for (let i = 0; i < n; i++) T(ctx, P[2][i], P[2][(i + 1) % n], top, o);
}
function slab(ctx, x, z, a, b, ang, y) { // a flat irregular flagstone
  const n = 7, c = [x, y, z], v = [], ca = Math.cos(ang), sa = Math.sin(ang);
  for (let i = 0; i < n; i++) { const t = i / n * TAU + ctx.random() * 0.3, k = 0.85 + ctx.random() * 0.2, lx = Math.cos(t) * a * k, lz = Math.sin(t) * b * k; v.push([x + lx * ca - lz * sa, y, z + lx * sa + lz * ca]); }
  for (let i = 0; i < n; i++) { const p = v[i], q = v[(i + 1) % n]; T(ctx, c, p, q, [x, y - 1, z]); Q(ctx, [p[0], y - 0.08, p[2]], [q[0], y - 0.08, q[2]], q, p, c.map((u, k) => k === 1 ? y - 0.04 : u)); }
}
function inside(poly, x, z) { let r = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) r = !r; } return r; }
function distEdge(poly, x, z) { let m = 1e9; for (let i = 0; i < poly.length; i++) { const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length], dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L)); m = Math.min(m, Math.hypot(ax + dx * t - x, az + dz * t - z)); } return m; }

// quadrant q: sx, sz signs. Outline: path edge → ellipse arc → path edge → hub arc
function bedPoly(g, sx, sz, gap = 0.12) {
  const rx = g.rx - 0.45, rz = g.rz - 0.45, e = g.pw + gap, hr = g.hr + 0.35, pts = [];
  const a0 = Math.asin(Math.min(1, e / rz)), a1 = Math.acos(Math.min(1, e / rx)); // angles from +x toward z
  const hz = Math.sqrt(Math.max(0, hr * hr - e * e));
  pts.push([sx * hz, sz * e]);
  const N = 14; for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; pts.push([sx * rx * Math.cos(a), sz * rz * Math.sin(a)]); }
  pts.push([sx * e, sz * hz]);
  const b0 = Math.atan2(hz, e), b1 = Math.atan2(e, hz); for (let i = 1; i < 5; i++) { const a = b0 + (b1 - b0) * i / 5; pts.push([sx * hr * Math.cos(a), sz * hr * Math.sin(a)]); }
  return pts;
}
function shrink(poly, d) { // move each vertex inward along the averaged edge normals
  const n = poly.length, s = (() => { let a = 0; for (let i = 0; i < n; i++) { const p = poly[i], q = poly[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a > 0 ? 1 : -1; })();
  return poly.map((p, i) => {
    const a = poly[(i + n - 1) % n], b = poly[(i + 1) % n];
    const n1 = [-(p[1] - a[1]), p[0] - a[0]], n2 = [-(b[1] - p[1]), b[0] - p[0]], l1 = Math.hypot(...n1) || 1, l2 = Math.hypot(...n2) || 1;
    const nx = (n1[0] / l1 + n2[0] / l2) * s, nz = (n1[1] / l1 + n2[1] / l2) * s, l = Math.hypot(nx, nz) || 1;
    return [p[0] + nx / l * d, p[1] + nz / l * d];
  });
}
function raisedBed(ctx, poly, lod) {
  const inner = shrink(poly, WALL), cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  const n = poly.length;
  for (let i = 0; i < n; i++) { // outer face, coping, inner lip: limestone
    const a = poly[i], b = poly[(i + 1) % n], ai = inner[i], bi = inner[(i + 1) % n];
    paint(ctx, 'stone', col(ctx, 0.9, 0.018, 78, 0.06, 18), 0.9);
    Q(ctx, [a[0], -0.05, a[1]], [b[0], -0.05, b[1]], [b[0], BED_H, b[1]], [a[0], BED_H, a[1]], [cx, BED_H / 2, cz]);
    ctx.quad(a[0], BED_H, a[1], ai[0], BED_H, ai[1], bi[0], BED_H, bi[1], b[0], BED_H, b[1]);
    ctx.quad(b[0], BED_H, b[1], bi[0], BED_H, bi[1], ai[0], BED_H, ai[1], a[0], BED_H, a[1]);
  }
  paint(ctx, 'soil', 'oklch(0.72 0.07 60)', 0.97);
  for (const t of triangulate(inner)) { const [p, q, r] = t.map((k) => inner[k]); ctx.tri(p[0], BED_H - 0.06, p[1], q[0], BED_H - 0.06, q[1], r[0], BED_H - 0.06, r[1]); ctx.tri(r[0], BED_H - 0.06, r[1], q[0], BED_H - 0.06, q[1], p[0], BED_H - 0.06, p[1]); }
  if (lod <= 2) for (let i = 0; i < n; i++) { const a = inner[i], b = inner[(i + 1) % n]; paint(ctx, 'stone', 'oklch(0.78 0.02 70)'); Q(ctx, [a[0], BED_H - 0.06, a[1]], [b[0], BED_H - 0.06, b[1]], [b[0], BED_H, b[1]], [a[0], BED_H, a[1]], [a[0] * 2 - cx, BED_H, a[1] * 2 - cz]); }
  return inner;
}
// crops sown along curved rows that follow the oval
function sow(ctx, g, inner, sx, sz, step, rowGap, fn) {
  const out = [];
  for (let k = 0.3; k < 1.02; k += rowGap) {
    const rx = (g.rx - 0.45) * k, rz = (g.rz - 0.45) * k, L = Math.PI / 2 * (rx + rz) / 2, cnt = Math.max(2, Math.floor(L / step));
    for (let i = 0; i <= cnt; i++) { const a = i / cnt * Math.PI / 2, x = sx * rx * Math.cos(a), z = sz * rz * Math.sin(a); if (inside(inner, x, z) && distEdge(inner, x, z) > 0.18) out.push([x + (ctx.random() - 0.5) * 0.06, z + (ctx.random() - 0.5) * 0.06]); }
  }
  for (const [x, z] of out) fn(x, BED_H - 0.06, z);
}
const FLOWERS = ['oklch(0.72 0.17 40)', 'oklch(0.85 0.16 90)', 'oklch(0.66 0.2 20)', 'oklch(0.7 0.16 350)', 'oklch(0.68 0.13 300)', 'oklch(0.95 0.03 95)'];
function crops(ctx, kind, lod) {
  const r = () => ctx.random();
  if (kind === 'cabbage') return (x, y, z) => {
    paint(ctx, null, col(ctx, 0.58, 0.12, 140), 0.75); blob(ctx, x, y, z, 0.24, 0.12, 0.24, lod <= 2 ? 7 : 5);
    paint(ctx, null, col(ctx, 0.8, 0.12, 125), 0.6); blob(ctx, x, y + 0.06, z, 0.14, 0.16, 0.14, lod <= 2 ? 6 : 5);
  };
  if (kind === 'carrot') return (x, y, z) => {
    paint(ctx, null, 'oklch(0.7 0.16 50)', 0.7); blob(ctx, x, y - 0.01, z, 0.035, 0.04, 0.035, 4);
    paint(ctx, null, col(ctx, 0.66, 0.15, 138), 0.7);
    const n = lod <= 2 ? 4 : 2; for (let i = 0; i < n; i++) { const a = r() * TAU, h = 0.22 + r() * 0.12, ux = Math.cos(a), uz = Math.sin(a); const p = [x, y + 0.02, z], t = [x + ux * 0.1, y + h, z + uz * 0.1], s = [x - uz * 0.05 + ux * 0.04, y + h * 0.75, z + ux * 0.05 + uz * 0.04]; ctx.tri(...p, ...t, ...s); ctx.tri(...s, ...t, ...p); }
  };
  if (kind === 'tomato') return (x, y, z) => {
    paint(ctx, 'oak', 'oklch(0.6 0.06 70)'); beam(ctx, [x, y, z], [x, y + 1.25, z], 0.04);
    for (const [yy, rr] of [[0.3, 0.2], [0.62, 0.18], [0.92, 0.13]]) { paint(ctx, null, col(ctx, 0.55, 0.13, 140), 0.7); blob(ctx, x + (r() - 0.5) * 0.08, y + yy, z + (r() - 0.5) * 0.08, rr, rr * 0.8, rr, lod <= 2 ? 6 : 5); }
    const n = lod <= 2 ? 5 : 2; for (let i = 0; i < n; i++) { const a = r() * TAU, yy = 0.28 + r() * 0.6, ripe = r(); paint(ctx, null, ripe < 0.6 ? 'oklch(0.6 0.21 30)' : ripe < 0.85 ? 'oklch(0.73 0.17 58)' : 'oklch(0.75 0.14 125)', 0.35); blob(ctx, x + Math.cos(a) * 0.17, y + yy, z + Math.sin(a) * 0.17, 0.06, 0.055, 0.06, 5); }
  };
  return (x, y, z) => { // cutting flowers: zinnias, marigolds, cosmos
    const h = 0.3 + r() * 0.4;
    paint(ctx, null, col(ctx, 0.56, 0.12, 140), 0.8); blob(ctx, x, y, z, 0.14, 0.14, 0.14, 5); beam(ctx, [x, y, z], [x, y + h, z], 0.02);
    paint(ctx, null, FLOWERS[Math.floor(r() * FLOWERS.length)], 0.6); blob(ctx, x, y + h - 0.02, z, 0.09, 0.05, 0.09, lod <= 2 ? 7 : 5);
    if (lod <= 2) { paint(ctx, null, 'oklch(0.55 0.1 70)'); blob(ctx, x, y + h + 0.015, z, 0.03, 0.025, 0.03, 4); }
  };
}
function ringXZ(g, a, k) { return [Math.cos(a) * g.rx * k, Math.sin(a) * g.rz * k]; }
function gateOpen(g, a) { return g.gates.some((n) => { let d = Math.abs(a - GATE[n]); d = Math.min(d, TAU - d); return d * (g.rx + g.rz) / 2 < 0.95; }); }

export function geometry(ctx) {
  const p = ctx.params || {}, g = P0(p), lod = ctx.lod || 1; ctx.flat();
  // lawn-coloured underlay so the old ground never shows through: a soft mulch oval
  paint(ctx, 'soil', 'oklch(0.5 0.06 60)', 0.98);
  { const n = 40; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU, [x0, z0] = ringXZ(g, a, 1.0), [x1, z1] = ringXZ(g, b, 1.0); ctx.tri(0, 0.012, 0, x1, 0.012, z1, x0, 0.012, z0); } }
  // cross paths + hub: flagstones on gravel
  paint(ctx, null, 'oklch(0.66 0.03 75)', 0.98);
  for (const [dx, dz, L] of [[1, 0, g.rx], [-1, 0, g.rx], [0, 1, g.rz], [0, -1, g.rz]]) { const nx = -dz * g.pw, nz = dx * g.pw; ctx.quad(nx, 0.02, nz, -nx, 0.02, -nz, dx * L - nx, 0.02, dz * L - nz, dx * L + nx, 0.02, dz * L + nz); ctx.quad(dx * L + nx, 0.02, dz * L + nz, dx * L - nx, 0.02, dz * L - nz, -nx, 0.02, -nz, nx, 0.02, nz); }
  for (const [dx, dz, L] of [[1, 0, g.rx + 0.5], [-1, 0, g.rx + 0.5], [0, 1, g.rz + 0.2], [0, -1, g.rz + 0.5]]) {
    const ang = Math.atan2(dz, dx); for (let d = g.hr + 0.45; d < L; d += 0.62) { if (ctx.random() < 0.5) { paint(ctx, 'stone', col(ctx, 0.92, 0.015, 80, 0.07, 20), 0.92); slab(ctx, dx * d, dz * d, 0.26, g.pw * 0.85, ang, 0.06); } else for (const s of [-1, 1]) { paint(ctx, 'stone', col(ctx, 0.92, 0.015, 80, 0.07, 20), 0.92); slab(ctx, dx * d - dz * s * g.pw * 0.45, dz * d + dx * s * g.pw * 0.45, 0.25, g.pw * 0.4, ang, 0.06); } }
  }
  // hub: a ring of flags and a limestone birdbath
  { const rr = (g.hr + 0.5) / 2, n = Math.floor(TAU * rr / 0.6); for (let i = 0; i < n; i++) { const a = i / n * TAU; paint(ctx, 'stone', col(ctx, 0.9, 0.015, 78, 0.07, 20), 0.92); slab(ctx, Math.cos(a) * rr, Math.sin(a) * rr, 0.26, (g.hr - 0.5) / 2 * 0.95, a + Math.PI / 2, 0.065); } }
  paint(ctx, 'stone', 'oklch(0.88 0.02 80)', 0.9);
  lathe(ctx, [[0.42, 0], [0.4, 0.12], [0.16, 0.2], [0.13, 0.7], [0.18, 0.78], [0.55, 0.86], [0.6, 0.95], [0, 0.95]], lod <= 2 ? 12 : 8);
  paint(ctx, null, 'oklch(0.66 0.09 205)', 0.1); ctx.emissive(null); lathe(ctx, [[0.5, 0.955], [0, 0.955]], lod <= 2 ? 12 : 8);
  paint(ctx, 'moss', 'oklch(0.72 0.1 135)', 1); blob(ctx, 0.3, 0.9, 0.35, 0.18, 0.08, 0.12, 5);
  // the four beds
  const Q4 = [[1, -1, 'cabbage'], [-1, -1, 'carrot'], [-1, 1, 'tomato'], [1, 1, 'flowers']];
  for (const [sx, sz, kind] of Q4) {
    const poly = bedPoly(g, sx, sz), inner = raisedBed(ctx, poly, lod);
    const step = kind === 'tomato' ? 0.95 : kind === 'cabbage' ? 0.55 : kind === 'carrot' ? (lod <= 2 ? 0.26 : 0.45) : (lod <= 2 ? 0.32 : 0.55);
    const gap = kind === 'tomato' ? 0.34 : kind === 'cabbage' ? 0.17 : 0.12;
    if (lod <= 4) sow(ctx, g, inner, sx, sz, step, gap, crops(ctx, kind, lod));
  }
  // border: a low limestone curb and a woven wattle hedge-fence, open at the gates
  const n = Math.floor(TAU * (g.rx + g.rz) / 2 / 0.4);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU; if (gateOpen(g, a)) continue;
    const [x, z] = ringXZ(g, a, 1.0), tang = Math.atan2(-(Math.cos(a) * g.rz), -Math.sin(a) * g.rx);
    paint(ctx, 'stone', col(ctx, 0.9, 0.015, 78, 0.08, 20), 0.92); obox(ctx, x, -0.04, z, 0.36, 0.2 + ctx.random() * 0.04, 0.24, -tang);
  }
  if (lod <= 3) {
    const k = 1 + 0.32 / ((g.rx + g.rz) / 2), m = Math.floor(TAU * (g.rx + g.rz) / 2 / 1.1);
    for (let i = 0; i < m; i++) {
      const a0 = i / m * TAU, a1 = (i + 1) / m * TAU; if (gateOpen(g, a0) || gateOpen(g, a1)) continue;
      const [x0, z0] = ringXZ(g, a0, k), [x1, z1] = ringXZ(g, a1, k);
      paint(ctx, 'oak', 'oklch(0.55 0.06 65)', 0.95);
      for (const h of [0.2, 0.34, 0.48]) beam(ctx, [x0, h, z0], [x1, h + 0.01, z1], 0.05, 0.1);
      beam(ctx, [x0, 0, z0], [x0, 0.62, z0], 0.06);
      if (lod <= 2 && i % 3 === 0) { paint(ctx, null, col(ctx, 0.6, 0.13, 138), 0.8); blob(ctx, (x0 + x1) / 2, 0.45, (z0 + z1) / 2, 0.28, 0.22, 0.28, 6); paint(ctx, null, FLOWERS[i % FLOWERS.length], 0.6); blob(ctx, (x0 + x1) / 2 + 0.1, 0.6, (z0 + z1) / 2, 0.07, 0.06, 0.07, 5); }
    }
    // a bent-willow rose arch at every gate, lanterns on its posts
    for (const gn of g.gates) {
      const a = GATE[gn], [cx, cz] = ringXZ(g, a, k), tx = -Math.sin(a), tz = Math.cos(a), w = 0.9, H = 2.1;
      const L = [cx - tx * w, cz - tz * w], R = [cx + tx * w, cz + tz * w];
      paint(ctx, 'oak', 'oklch(0.5 0.06 60)', 0.95);
      beam(ctx, [L[0], 0, L[1]], [L[0], H, L[1]], 0.1); beam(ctx, [R[0], 0, R[1]], [R[0], H, R[1]], 0.1);
      let prev = [L[0], H, L[1]];
      for (let i = 1; i <= 8; i++) {
        const t = i / 8 * Math.PI, pt = [cx - tx * w * Math.cos(t), H + 0.55 * Math.sin(t), cz - tz * w * Math.cos(t)];
        paint(ctx, 'oak', 'oklch(0.5 0.06 60)', 0.95); beam(ctx, prev, pt, 0.07);
        if (i < 8) { paint(ctx, null, col(ctx, 0.56, 0.13, 140), 0.8); blob(ctx, pt[0], pt[1] - 0.05, pt[2], 0.2, 0.14, 0.2, 5); paint(ctx, null, i % 2 ? 'oklch(0.7 0.17 355)' : 'oklch(0.93 0.05 20)', 0.5); blob(ctx, pt[0] + 0.08, pt[1] + 0.06, pt[2] + 0.05, 0.06, 0.05, 0.06, 5); }
        prev = pt;
      }
      for (const [x, z] of [L, R]) { paint(ctx, null, 'oklch(0.35 0.03 60)', 0.6, 0.6); obox(ctx, x, H, z, 0.16, 0.05, 0.16); ctx.emissive('oklch(0.85 0.13 75)'); paint(ctx, null, 'oklch(0.95 0.08 85)', 0.4); ctx.emissive('oklch(0.85 0.13 75)'); obox(ctx, x, H + 0.05, z, 0.12, 0.16, 0.12); ctx.emissive(null); paint(ctx, null, 'oklch(0.35 0.03 60)', 0.6, 0.6); obox(ctx, x, H + 0.21, z, 0.18, 0.04, 0.18); }
      // climbing roses up the posts
      for (const [x, z] of [L, R]) for (let yy = 0.3; yy < H; yy += 0.45) { paint(ctx, null, col(ctx, 0.55, 0.13, 140), 0.8); blob(ctx, x + (ctx.random() - 0.5) * 0.1, yy, z + (ctx.random() - 0.5) * 0.1, 0.16, 0.14, 0.16, 5); }
    }
    // a bench at the south end, looking in over the beds toward the birdbath
    const bz = g.rz - 0.05;
    paint(ctx, 'oak', 'oklch(0.62 0.07 65)', 0.9);
    obox(ctx, 0, 0.42, bz, 1.5, 0.06, 0.42); obox(ctx, 0, 0.75, bz + 0.22, 1.5, 0.3, 0.05);
    for (const sx of [-0.65, 0.65]) { obox(ctx, sx, 0, bz - 0.15, 0.07, 0.42, 0.07); obox(ctx, sx, 0, bz + 0.18, 0.07, 0.95, 0.07); }
  }
  ctx.albedo(null); ctx.emissive(null);
}

export function collider(ctx) {
  const g = P0(ctx.params || {});
  for (const [sx, sz] of [[1, -1], [-1, -1], [-1, 1], [1, 1]]) {
    const poly = bedPoly(g, sx, sz);
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.05) continue; obox(ctx, (a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2, L + 0.1, BED_H, WALL, Math.atan2(-(b[1] - a[1]), b[0] - a[0])); }
  }
  const k = 1 + 0.32 / ((g.rx + g.rz) / 2), m = 36;
  for (let i = 0; i < m; i++) { const a0 = i / m * TAU, a1 = (i + 1) / m * TAU; if (gateOpen(g, a0) || gateOpen(g, a1)) continue; const [x0, z0] = ringXZ(g, a0, k), [x1, z1] = ringXZ(g, a1, k); obox(ctx, (x0 + x1) / 2, 0, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) + 0.05, 0.62, 0.12, Math.atan2(-(z1 - z0), x1 - x0)); }
  lathe(ctx, [[0.42, 0], [0.42, 0.95], [0, 0.95]], 8);
}
