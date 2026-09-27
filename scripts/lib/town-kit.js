// Market-town kit: frames, paint, lathes, lofts, windows and timber framing shared by the town builders
// (town-house, town-hall, town-fountain, town-square). Every solid winds away from its interior point.
import { Q, T, solid, box, ngon, prism } from './road-solid.js';
import { obox, beam, blob } from './yard-kit.js';
export { Q, T, solid, box, ngon, prism, obox, beam, blob };
export const TAU = Math.PI * 2;
export const TEX = {
  plaster: 'cdn/texture-cream-lime-plaster.png',
  ashlar: 'cdn/texture-weathered-pale-limestone-ashlar-blocks.png',
  lime: 'cdn/texture-weathered-pale-limestone-surface.png',
  flag: 'cdn/texture-pale-limestone-flagstone.png',
  walnut: 'cdn/texture-dark-walnut-wood-grain.png',
  oak: 'cdn/texture-honey-oak-timber-planks.png',
  linen: 'cdn/texture-woven-linen-canvas.png',
  clay: 'cdn/texture-red-clay-roof-tiles.png',
  cedar: 'cdn/texture-weathered-cedar-shingles.png',
  gold: 'cdn/texture-pale-gold-roof-tiles.png',
  teal: 'cdn/texture-teal-glazed-clay-roof-tiles.png',
  slate: 'cdn/texture-blue-grey-slate-roof-tiles.png',
  leaf: 'cdn/texture-lush-green-ivy-leaves.png',
  soil: 'cdn/texture-dark-garden-soil-with-mulch.png',
  brass: 'cdn/texture-aged-brass-metal.png',
  copper: 'cdn/texture-verdigris-copper-patina.png',
};
export const COL = {
  walnut: 'oklch(0.9 0.02 60)', oak: 'oklch(0.94 0.04 75)', lime: 'oklch(0.94 0.02 82)', iron: 'oklch(0.3 0.015 60)',
  cream: 'oklch(0.95 0.03 88)', glass: 'oklch(0.36 0.03 235)', glow: 'oklch(0.48 0.08 72)', lamp: 'oklch(0.86 0.14 75)',
  leafA: 'oklch(0.62 0.1 138)', leafB: 'oklch(0.55 0.09 146)',
};
export const FLOWERS = ['oklch(0.66 0.17 15)', 'oklch(0.85 0.15 90)', 'oklch(0.72 0.14 340)', 'oklch(0.95 0.02 90)', 'oklch(0.65 0.13 45)'];
export function paint(ctx, tex, col, rough = 0.85, metal = 0, emis = null) {
  ctx.albedo(tex ? (TEX[tex] || tex) : null); ctx.color(col); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(emis);
}
export const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
export const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// a rigid frame: emits through P at an offset, pitched then yawed (radians, three.js sense); nests; winding survives
export function XF(P, ox, oy, oz, yaw = 0, pitch = 0) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const t = (a, i) => { const x = a[i], y = a[i + 1], z = a[i + 2], y1 = y * cp - z * sp, z1 = y * sp + z * cp; return [ox + x * cy + z1 * sy, oy + y1, oz - x * sy + z1 * cy]; };
  return { lod: P.lod, quad: (...a) => P.quad(...t(a, 0), ...t(a, 3), ...t(a, 6), ...t(a, 9)), tri: (...a) => P.tri(...t(a, 0), ...t(a, 3), ...t(a, 6)) };
}
// profile [[r, y], …] about Y: walk the outer surface upward, across a top inward, an inner wall downward
export function lathe(P, prof, n, cx = 0, cy = 0, cz = 0, skip = 0) {
  const pt = (r, y, a) => [cx + Math.cos(a) * r, cy + y, cz + Math.sin(a) * r];
  for (let k = 0; k < prof.length - 1; k++) {
    const [r0, y0] = prof[k], [r1, y1] = prof[k + 1];
    if (r0 < 1e-4 && r1 < 1e-4) continue;
    for (let i = 0; i < n; i++) {
      if (skip && i % skip === skip - 1) continue;
      const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
      const Ai = pt(r0, y0, a0), Aj = pt(r0, y0, a1), Bi = pt(r1, y1, a0), Bj = pt(r1, y1, a1);
      if (r0 < 1e-4) P.tri(...Ai, ...Bi, ...Bj);
      else if (r1 < 1e-4) P.tri(...Ai, ...Bi, ...Aj);
      else P.quad(...Ai, ...Bi, ...Bj, ...Aj);
    }
  }
}
// a flat disc facing −z in its frame
export function discZ(P, cx, cy, z, r, n) {
  for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; P.tri(cx, cy, z, cx + Math.cos(b) * r, cy + Math.sin(b) * r, z, cx + Math.cos(a) * r, cy + Math.sin(a) * r, z); }
}
// a body lofted along a spine in the x-y plane (width along z = r·flat)
export function loft(P, pts, radii, n = 8, flat = 0.62) {
  const rings = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const t = nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), side = [0, 0, 1], up = nrm(crs(side, t)), r = radii[i], R = [];
    for (let k = 0; k < n; k++) { const q = k / n * TAU, c = Math.cos(q) * r * flat, s = Math.sin(q) * r; R.push([p[0] + up[0] * s, p[1] + up[1] * s, p[2] + c]); }
    return R;
  });
  for (let i = 0; i < pts.length - 1; i++) {
    const o = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, (pts[i][2] + pts[i + 1][2]) / 2];
    for (let k = 0; k < n; k++) { const j = (k + 1) % n; Q(P, rings[i][k], rings[i][j], rings[i + 1][j], rings[i + 1][k], o); }
  }
}
// a sloped slab: a quad lifted by t
export function slab(P, a, b, c, d, t) { const L = [a, b, c, d]; solid(P, L, L.map((p) => [p[0], p[1] + t, p[2]])); }
// window in a face frame F (plane z = 0, outward −z): centre x, sill y0, w × h
export function win(ctx, F, x, y0, w, h, o = {}) {
  const lod = ctx.lod || 1, x0 = x - w / 2, x1 = x + w / 2, y1 = y0 + h;
  paint(ctx, null, COL.glass, 0.15, 0, o.glow ?? COL.glow);
  F.quad(x0, y0, -0.03, x0, y1, -0.03, x1, y1, -0.03, x1, y0, -0.03);
  paint(ctx, 'oak', o.frame ?? COL.cream, 0.8);
  obox(F, x0 - 0.05, y0, -0.05, 0.1, h, 0.1); obox(F, x1 + 0.05, y0, -0.05, 0.1, h, 0.1);
  obox(F, x, y1, -0.06, w + 0.3, 0.14, 0.12);
  obox(F, x, y0 - 0.1, -0.1, w + 0.3, 0.1, 0.2);
  if (lod <= 2) {
    obox(F, x, y0, -0.045, 0.05, h, 0.04); obox(F, x, y0 + h * 0.58, -0.045, w, 0.05, 0.04);
    if (o.panes) for (let k = 1; k < o.panes; k++) obox(F, x0 + k * w / o.panes, y0, -0.045, 0.035, h, 0.035);
  }
  if (o.shutter && lod <= 2) { paint(ctx, 'oak', o.shutter, 0.8); for (const s of [-1, 1]) obox(F, x + s * (w / 2 + 0.12 + w * 0.25), y0, -0.04, w * 0.48, h, 0.05); }
  if (o.box && lod <= 3) {
    paint(ctx, 'oak', o.boxCol ?? 'oklch(0.66 0.11 42)', 0.8); obox(F, x, y0 - 0.36, -0.24, w + 0.1, 0.24, 0.28);
    if (lod <= 2) {
      const rnd = () => ctx.random();
      for (let i = 0; i < 3; i++) { paint(ctx, null, i % 2 ? COL.leafA : COL.leafB, 0.9); blob(F, x0 + (i + 0.5) * w / 3, y0 - 0.14, -0.25, w / 5, 0.2, 0.15, 5, rnd); }
      for (let i = 0; i < 5; i++) { paint(ctx, null, (o.flowers || FLOWERS)[i % (o.flowers || FLOWERS).length], 0.6); blob(F, x0 + 0.08 + rnd() * (w - 0.16), y0 + 0.0 + rnd() * 0.08, -0.25 - rnd() * 0.1, 0.07, 0.07, 0.06, 4); }
    }
  }
}
// timber framing on a face: posts, sill, head, studs beside each opening, braces in the open bays
export function timber(ctx, F, L, y0, h, cuts, lod) {
  paint(ctx, 'walnut', COL.walnut, 0.85);
  obox(F, -L + 0.11, y0, -0.05, 0.22, h, 0.1); obox(F, L - 0.11, y0, -0.05, 0.22, h, 0.1);
  obox(F, 0, y0, -0.05, 2 * L, 0.2, 0.1); obox(F, 0, y0 + h - 0.2, -0.05, 2 * L, 0.2, 0.1);
  if (lod > 2) return;
  const edges = [-L + 0.22];
  for (const [x, hw] of [...cuts].sort((a, b) => a[0] - b[0])) {
    for (const s of [-1, 1]) obox(F, x + s * (hw + 0.14), y0 + 0.2, -0.05, 0.16, h - 0.4, 0.09);
    edges.push(x - hw - 0.22, x + hw + 0.22);
  }
  edges.push(L - 0.22);
  for (let i = 0; i + 1 < edges.length; i += 2) {
    const a = edges[i], b = edges[i + 1], gw = b - a;
    if (gw < 0.6) continue;
    if (gw > 2.4) { const m = (a + b) / 2; obox(F, m, y0 + 0.2, -0.05, 0.16, h - 0.4, 0.09); beam(F, [a, y0 + 0.2, -0.05], [m - 0.08, y0 + h - 0.2, -0.05], 0.09, 0.14); beam(F, [b, y0 + 0.2, -0.05], [m + 0.08, y0 + h - 0.2, -0.05], 0.09, 0.14); }
    else if ((i / 2) % 2) beam(F, [a, y0 + 0.2, -0.05], [b, y0 + h - 0.2, -0.05], 0.09, 0.14);
    else beam(F, [b, y0 + 0.2, -0.05], [a, y0 + h - 0.2, -0.05], 0.09, 0.14);
  }
}
// a hanging lantern: iron cap and a warm glass box, its top at y
export function lantern(ctx, P, x, y, z, s = 1) {
  paint(ctx, null, COL.iron, 0.5, 0.6);
  obox(P, x, y - 0.06 * s, z, 0.26 * s, 0.06 * s, 0.26 * s); prism(XF(P, x, 0, z), ngon(4, 0.19 * s, 0, 0, TAU / 8), y, y + 0.14 * s, 0.25);
  obox(P, x, y - 0.46 * s, z, 0.24 * s, 0.05 * s, 0.24 * s);
  paint(ctx, null, COL.lamp, 0.3, 0, COL.lamp); obox(P, x, y - 0.41 * s, z, 0.17 * s, 0.35 * s, 0.17 * s); ctx.emissive(null);
}
