// a planted bed: soil, stone or timber edging, flowers in deliberate drifts (tall at the back, low at the front)
// params: { shape: "rect"|"round", w, d, edge: "stone"|"timber", palette: name | { back: [[kind,color],...], front: [...] } }
// local -Z is the bed's front (the side people see); for a round bed the centre is "back"
import { paint, beam, obox, blob, leaf, prism, ngon, gem, nrm, crs, TAU } from '../lib/yard-kit.js';
import { softened } from "./soften.js";
export const PALETTES = {
  cool: { back: [['foxglove', 'oklch(0.76 0.12 350)'], ['cosmos', 'oklch(0.93 0.03 340)'], ['foxglove', 'oklch(0.94 0.02 95)']], front: [['lavender', 'oklch(0.6 0.13 295)'], ['coneflower', 'oklch(0.72 0.13 350)'], ['lavender', 'oklch(0.64 0.12 290)']] },
  warm: { back: [['cosmos', 'oklch(0.76 0.16 55)'], ['coneflower', 'oklch(0.74 0.15 50)'], ['cosmos', 'oklch(0.86 0.15 90)']], front: [['marigold', 'oklch(0.72 0.18 55)'], ['marigold', 'oklch(0.85 0.16 85)'], ['marigold', 'oklch(0.7 0.17 45)']] },
  meadow: { back: [['cosmos', 'oklch(0.62 0.2 350)'], ['foxglove', 'oklch(0.62 0.15 320)'], ['cosmos', 'oklch(0.95 0.02 90)']], front: [['coneflower', 'oklch(0.72 0.13 350)'], ['lavender', 'oklch(0.62 0.13 295)'], ['coneflower', 'oklch(0.92 0.03 90)']] },
  moon: { back: [['foxglove', 'oklch(0.95 0.02 95)'], ['cosmos', 'oklch(0.96 0.02 90)']], front: [['lavender', 'oklch(0.66 0.11 290)'], ['coneflower', 'oklch(0.93 0.03 90)']] },
};
const LEAF = 'oklch(0.93 0.05 135)', SAGE = 'oklch(0.94 0.02 165)', STEM = 'oklch(0.52 0.1 135)';
function stem(ctx, lod, a, b) { if (lod <= 2) beam(ctx, a, b, 0.014, 0.014); else ctx.quad(a[0] - 0.008, a[1], a[2], a[0] + 0.008, a[1], a[2], b[0] + 0.008, b[1], b[2], b[0] - 0.008, b[1], b[2]); }
function plant(ctx, lod, kind, col, x, z, s, rnd) {
  const heads = (n) => Math.max(1, lod === 1 ? n : lod === 2 ? Math.ceil(n * 0.6) : Math.ceil(n * 0.35));
  if (kind === 'lavender') {
    paint(ctx, 'leaf', SAGE, 0.85); blob(ctx, x, 0.06, z, 0.2 * s, 0.2 * s, 0.2 * s, lod <= 2 ? 6 : 4, rnd);
    const n = heads(9);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rnd(), r = 0.05 + rnd() * 0.1, h = (0.42 + rnd() * 0.14) * s, tx = x + Math.cos(a) * r * 1.6, tz = z + Math.sin(a) * r * 1.6;
      paint(ctx, null, STEM, 0.8); if (lod <= 2) stem(ctx, lod, [x + Math.cos(a) * r * 0.5, 0.15, z + Math.sin(a) * r * 0.5], [tx, h, tz]);
      paint(ctx, null, col, 0.7); gem(ctx, tx, h, tz, 0.024, 0.08, 0.05, 4);
    }
  } else if (kind === 'foxglove') {
    paint(ctx, 'leaf', LEAF, 0.8); blob(ctx, x, 0.06, z, 0.2 * s, 0.13 * s, 0.2 * s, lod <= 2 ? 6 : 4, rnd);
    const h = (0.95 + rnd() * 0.25) * s, lean = [(rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.08];
    paint(ctx, null, STEM, 0.8); stem(ctx, lod, [x, 0.1, z], [x + lean[0], h, z + lean[1]]);
    paint(ctx, null, col, 0.65);
    const n = heads(10), face = rnd() * TAU;
    for (let i = 0; i < n; i++) {
      const t = 0.42 + 0.55 * i / n, y = h * t, r = 0.048 * (1 - 0.55 * i / n), a = face + (i % 2 ? 0.5 : -0.5);
      gem(ctx, x + lean[0] * t + Math.cos(a) * 0.04, y, z + lean[1] * t + Math.sin(a) * 0.04, r, r * 0.7, r * 1.5, 5);
    }
  } else if (kind === 'coneflower' || kind === 'cosmos') {
    const cos = kind === 'cosmos';
    paint(ctx, 'leaf', cos ? 'oklch(0.95 0.06 130)' : LEAF, 0.8); blob(ctx, x, 0.06, z, 0.2 * s, (cos ? 0.3 : 0.24) * s, 0.2 * s, lod <= 2 ? 6 : 4, rnd);
    const n = heads(cos ? 6 : 5);
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + rnd(), r = 0.04 + rnd() * 0.12, h = ((cos ? 0.72 : 0.6) + rnd() * 0.18) * s, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r;
      paint(ctx, null, STEM, 0.8); if (lod <= 2) stem(ctx, lod, [x + Math.cos(a) * r * 0.3, 0.2, z + Math.sin(a) * r * 0.3], [cx, h, cz]);
      paint(ctx, null, col, 0.7);
      const np = lod === 1 ? 8 : lod === 2 ? 6 : 0, R = cos ? 0.075 : 0.08, dy = cos ? 0.012 : -0.035;
      if (!np) gem(ctx, cx, h, cz, R * 0.8, 0.02, 0.02, 5);
      for (let k = 0; k < np; k++) {
        const b = k / np * TAU + a;
        if (cos) ctx.quad(cx, h, cz, cx + Math.cos(b - 0.28) * R * 0.5, h + dy * 0.5, cz + Math.sin(b - 0.28) * R * 0.5, cx + Math.cos(b) * R, h + dy, cz + Math.sin(b) * R, cx + Math.cos(b + 0.28) * R * 0.5, h + dy * 0.5, cz + Math.sin(b + 0.28) * R * 0.5);
        else ctx.tri(cx, h, cz, cx + Math.cos(b - 0.16) * R, h + dy, cz + Math.sin(b - 0.16) * R, cx + Math.cos(b + 0.16) * R, h + dy, cz + Math.sin(b + 0.16) * R);
      }
      paint(ctx, null, cos ? 'oklch(0.85 0.16 90)' : 'oklch(0.48 0.11 50)', 0.8);
      gem(ctx, cx, h, cz, cos ? 0.016 : 0.028, cos ? 0.012 : 0.035, 0.01, 5);
    }
  } else { // marigold
    paint(ctx, 'leaf', 'oklch(0.9 0.05 140)', 0.8); blob(ctx, x, 0.06, z, 0.18 * s, 0.16 * s, 0.18 * s, lod <= 2 ? 6 : 4, rnd);
    paint(ctx, null, col, 0.75);
    const n = heads(6);
    for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd(), r = 0.1 * s * (0.4 + rnd() * 0.6); gem(ctx, x + Math.cos(a) * r, (0.2 + rnd() * 0.06) * s, z + Math.sin(a) * r, 0.05, 0.035, 0.02, lod <= 2 ? 6 : 4); }
  }
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, round = p.shape === 'round', w = p.w ?? 2.4, d = round ? w : (p.d ?? 0.9), R = w / 2;
  const pal = typeof p.palette === 'object' && p.palette ? p.palette : PALETTES[p.palette || 'cool'] || PALETTES.cool;
  const edge = p.edge || 'stone', rnd = () => ctx.random();
  ctx.flat();
  const soilTop = 0.07;
  paint(ctx, 'soil', 'oklch(0.92 0.02 60)', 0.97);
  if (round) prism(ctx, ngon(lod <= 3 ? 16 : 8, R - 0.05), 0, soilTop); else obox(ctx, 0, 0, 0, w - 0.08, soilTop, d - 0.08);
  // edging
  const block = (x, z, yaw, len) => { if (edge === 'stone') { paint(ctx, 'stone', `oklch(${(0.9 + rnd() * 0.07).toFixed(3)} 0.02 ${(75 + rnd() * 20).toFixed(0)})`, 0.9); obox(ctx, x, 0, z, len, 0.1 + rnd() * 0.04, 0.12, yaw + (rnd() - 0.5) * 0.12); } };
  if (lod >= 4) {
    paint(ctx, edge === 'stone' ? 'stone' : 'walnut', edge === 'stone' ? 'oklch(0.93 0.02 85)' : 'oklch(0.92 0.03 55)', 0.9);
    if (round) prism(ctx, ngon(8, R + 0.02), 0, 0.11, 1); else { obox(ctx, 0, 0, -d / 2, w, 0.12, 0.1); obox(ctx, 0, 0, d / 2, w, 0.12, 0.1); obox(ctx, -w / 2, 0, 0, 0.1, 0.12, d); obox(ctx, w / 2, 0, 0, 0.1, 0.12, d); }
  } else if (edge === 'stone') {
    if (round) { const n = Math.ceil(TAU * R / 0.25); for (let i = 0; i < n; i++) { const a = i / n * TAU; block(Math.cos(a) * R, Math.sin(a) * R, -a + Math.PI / 2, TAU * R / n * 0.9); } }
    else for (const [ax, az, bx, bz] of [[-w / 2, -d / 2, w / 2, -d / 2], [w / 2, -d / 2, w / 2, d / 2], [w / 2, d / 2, -w / 2, d / 2], [-w / 2, d / 2, -w / 2, -d / 2]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.25), yaw = Math.atan2(-(bz - az), bx - ax);
      for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; block(ax + (bx - ax) * t, az + (bz - az) * t, yaw, L / n * 0.92); }
    }
  } else {
    paint(ctx, 'walnut', 'oklch(0.92 0.03 55)', 0.8);
    if (round) { const n = Math.ceil(TAU * R / 0.11); for (let i = 0; i < n; i++) { const a = i / n * TAU; prism(ctx, ngon(6, 0.05, Math.cos(a) * R, Math.sin(a) * R), 0, 0.12 + rnd() * 0.06); } }
    else { obox(ctx, 0, 0, -d / 2, w + 0.06, 0.15, 0.06); obox(ctx, 0, 0, d / 2, w + 0.06, 0.15, 0.06); obox(ctx, -w / 2, 0, 0, 0.06, 0.15, d); obox(ctx, w / 2, 0, 0, 0.06, 0.15, d); paint(ctx, 'brass', 'oklch(0.93 0.04 80)', 0.5, 0.6); for (const sx of [-1, 1]) for (const sz of [-1, 1]) obox(ctx, sx * w / 2, 0.02, sz * d / 2, 0.08, 0.1, 0.08); }
  }
  // planting
  const zone = (list, u) => list[Math.min(list.length - 1, Math.max(0, Math.floor(u * list.length)))];
  if (lod >= 4) {
    for (const [layer, t] of [[pal.back, 0.75], [pal.front, 0.25]]) layer.forEach(([kind, col], i) => {
      const u = (i + 0.5) / layer.length;
      const x = round ? Math.cos(u * TAU) * R * (1 - t) * 0.9 : (u - 0.5) * (w - 0.3), z = round ? Math.sin(u * TAU) * R * (1 - t) * 0.9 : (t - 0.5) * (d - 0.3);
      const h = kind === 'foxglove' ? 0.9 : kind === 'cosmos' ? 0.7 : kind === 'coneflower' ? 0.6 : kind === 'lavender' ? 0.45 : 0.28;
      paint(ctx, null, col, 0.8);
      if (lod === 4) blob(ctx, x, soilTop, z, round ? R * 0.35 : (w - 0.3) / layer.length / 2, h, round ? R * 0.35 : d * 0.25, 5);
      else obox(ctx, x, soilTop, z, round ? R * 0.6 : (w - 0.3) / layer.length * 0.9, h * 0.8, round ? R * 0.6 : d * 0.35);
    });
  } else {
    const sp = 0.3, ph = rnd() * 6;
    for (let gx = -w / 2 + 0.2; gx <= w / 2 - 0.15; gx += sp) for (let gz = -d / 2 + 0.2; gz <= d / 2 - 0.15; gz += sp * 0.9) {
      const x = gx + (rnd() - 0.5) * 0.12, z = gz + (rnd() - 0.5) * 0.1;
      if (round ? Math.hypot(x, z) > R - 0.18 : false) continue;
      const t = round ? 1 - Math.hypot(x, z) / R : (z + d / 2) / d;
      const layer = t > 0.5 ? pal.back : pal.front;
      let u = round ? Math.atan2(z, x) / TAU + 0.5 : (x + w / 2) / w;
      u = Math.min(0.999, Math.max(0, u + Math.sin(z * 7 + ph) * 0.05));
      const [kind, col] = zone(layer, u);
      plant(ctx, lod, kind, col, x, z, 0.85 + rnd() * 0.3, rnd);
    }
  }
  ctx.albedo(null);
});
export function collider() { return null; }
