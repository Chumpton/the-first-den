// The lakeshore and creek kit: one generator for merged shoreline clusters, lily fields, river and stepping stones, dock lanterns
// and the little boathouse. params.kind picks the piece; items arrive baked (terrain heights read at placement, never here), so
// every piece shares its mesh. Feet at the waterline (y 0 = water), front toward −Z, metres. Parts branch on ctx.lod.
import { paint, obox, beam, TAU } from '../lib/yard-kit.js';
import { Q, T, solid, prism, ngon } from '../lib/road-solid.js';
import { softened } from "./soften.js";

const COL = {
  stone: ['oklch(0.74 0.015 80)', 'oklch(0.68 0.018 70)', 'oklch(0.79 0.012 90)'],
  wet: ['oklch(0.56 0.012 230)', 'oklch(0.62 0.015 80)', 'oklch(0.5 0.01 250)'],
  moss: ['oklch(0.56 0.09 128)', 'oklch(0.6 0.1 120)'],
  blade: ['oklch(0.6 0.11 128)', 'oklch(0.66 0.11 118)', 'oklch(0.55 0.1 135)', 'oklch(0.72 0.09 105)'],
  straw: ['oklch(0.78 0.08 90)', 'oklch(0.72 0.09 100)'],
  head: 'oklch(0.36 0.05 48)',
  pad: ['oklch(0.55 0.11 142)', 'oklch(0.6 0.12 132)', 'oklch(0.5 0.1 150)'],
  petal: ['oklch(0.86 0.08 355)', 'oklch(0.8 0.11 358)', 'oklch(0.92 0.04 350)'],
  heart: 'oklch(0.86 0.15 92)',
  oak: 'oklch(0.95 0.03 75)', walnut: 'oklch(0.9 0.03 60)', iron: 'oklch(0.3 0.01 250)',
};
const pick = (ctx, a) => a[Math.floor(ctx.random() * a.length) % a.length];

// a low-poly boulder: sunk base ring, bulging mid, shouldered top; mossy upper band when asked
function rock(ctx, x, y, z, r, h, rot, n, mossy, pal, flatTop) {
  const j = () => 0.82 + ctx.random() * 0.34;
  const ring = (rr, yy, jit) => { const a = []; for (let i = 0; i < n; i++) { const t = rot + (i / n) * TAU, k = jit ? j() : 1; a.push([x + Math.cos(t) * rr * k, yy, z + Math.sin(t) * rr * k * 0.85]); } return a; };
  const A = ring(r * 0.85, y - 0.35, true), B = ring(r, y + h * (flatTop ? 0.7 : 0.45), true), C = ring(r * (flatTop ? 0.9 : 0.55), y + h, !flatTop);
  const top = [x, y + h * (flatTop ? 1 : 1.08), z], o = [x, y + h * 0.35, z];
  const stone = pick(ctx, pal);
  ctx.color(stone);
  for (let i = 0; i < n; i++) { const k = (i + 1) % n; Q(ctx, A[i], A[k], B[k], B[i], o); }
  if (mossy) ctx.color(pick(ctx, COL.moss));
  for (let i = 0; i < n; i++) { const k = (i + 1) % n; if (mossy && !flatTop && ctx.random() < 0.3) ctx.color(stone); else if (mossy) ctx.color(COL.moss[i % 2]); Q(ctx, B[i], B[k], C[k], C[i], o); }
  ctx.color(mossy ? COL.moss[0] : stone);
  for (let i = 0; i < n; i++) T(ctx, C[i], C[(i + 1) % n], top, o);
}
// one leaf: a tapered two-part ribbon leaning out from its root (faces draw both sides)
function blade(ctx, p, ang, lean, L, w, curl = 1) {
  const dx = Math.cos(ang), dz = Math.sin(ang), sx = -dz * w / 2, sz = dx * w / 2;
  const m = [p[0] + dx * lean * 0.35 * curl, p[1] + L * 0.55, p[2] + dz * lean * 0.35 * curl], tip = [p[0] + dx * lean, p[1] + L, p[2] + dz * lean];
  ctx.quad(p[0] - sx, p[1], p[2] - sz, p[0] + sx, p[1], p[2] + sz, m[0] + sx * 0.7, m[1], m[2] + sz * 0.7, m[0] - sx * 0.7, m[1], m[2] - sz * 0.7);
  ctx.tri(m[0] - sx * 0.7, m[1], m[2] - sz * 0.7, m[0] + sx * 0.7, m[1], m[2] + sz * 0.7, tip[0], tip[1], tip[2]);
}
function cattail(ctx, p, L, ang, lean, lod) {
  const tx = p[0] + Math.cos(ang) * lean, tz = p[2] + Math.sin(ang) * lean, h0 = p[1] + L * 0.72, h1 = p[1] + L * 0.9;
  ctx.color(COL.blade[2]);
  const r = 0.012, s = [[r, 0], [-r, r], [-r, -r]];
  solid(ctx, s.map(([a, b]) => [p[0] + a, p[1], p[2] + b]), s.map(([a, b]) => [p[0] + (tx - p[0]) * 0.72 + a, h0, p[2] + (tz - p[2]) * 0.72 + b]), false);
  ctx.color(COL.head);
  const n = lod <= 2 ? 5 : 3, cx = p[0] + (tx - p[0]) * 0.72, cz = p[2] + (tz - p[2]) * 0.72, cx1 = p[0] + (tx - p[0]) * 0.9, cz1 = p[2] + (tz - p[2]) * 0.9;
  solid(ctx, ngon(n, 0.034).map(([a, b]) => [cx + a, h0, cz + b]), ngon(n, 0.03).map(([a, b]) => [cx1 + a, h1, cz1 + b]));
  if (lod <= 2) { ctx.color(COL.straw[1]); ctx.tri(cx1 - 0.006, h1, cz1, cx1 + 0.006, h1, cz1, tx, p[1] + L, tz); }
}
// a clump: t 1 cattails + sword leaves, 2 tall reeds, 3 low rush tuft
function clump(ctx, t, x, y, z, s, rot, lod) {
  const p = [x, y, z], few = lod >= 3;
  if (t === 1) {
    const nb = few ? 3 : 8;
    for (let i = 0; i < nb; i++) { ctx.color(pick(ctx, COL.blade)); const a = rot + (i / nb) * TAU + ctx.random() * 0.6; blade(ctx, [x + Math.cos(a) * 0.05, y, z + Math.sin(a) * 0.05], a, (0.2 + ctx.random() * 0.35) * s, (1.0 + ctx.random() * 0.6) * s, 0.07 * s); }
    const nc = few ? 1 : 3;
    for (let i = 0; i < nc; i++) { const a = rot + i * 2.1 + ctx.random(); cattail(ctx, [x + Math.cos(a) * 0.07, y, z + Math.sin(a) * 0.07], (1.35 + ctx.random() * 0.45) * s, a, 0.08 * s, lod); }
  } else if (t === 2) {
    const nb = few ? 4 : 12;
    for (let i = 0; i < nb; i++) { ctx.color(ctx.random() < 0.25 ? pick(ctx, COL.straw) : pick(ctx, COL.blade)); const a = rot + (i / nb) * TAU + ctx.random() * 0.5; blade(ctx, [x + Math.cos(a) * 0.08, y, z + Math.sin(a) * 0.08], a, (0.15 + ctx.random() * 0.3) * s, (1.1 + ctx.random() * 0.7) * s, 0.035 * s); }
  } else {
    const nb = few ? 3 : 8;
    for (let i = 0; i < nb; i++) { ctx.color(pick(ctx, COL.blade)); const a = rot + (i / nb) * TAU + ctx.random() * 0.7; blade(ctx, p, a, (0.18 + ctx.random() * 0.2) * s, (0.4 + ctx.random() * 0.3) * s, 0.05 * s); }
  }
}
// rim cluster / reed patch: items [t, x, y, z, s, rot]; t 0 = mossy boulder (not in reed patches)
function rim(ctx, p, lod) {
  paint(ctx, null, COL.blade[0], 0.9);
  for (const [t, x, y, z, s, r] of p.items || []) {
    if (t === 0) rock(ctx, x, y, z, 0.42 * s, 0.5 * s, r, lod <= 2 ? 7 : 5, true, COL.stone);
    else if (lod <= 4 || t !== 3) clump(ctx, t, x, y, z, s, r, lod);
  }
}
// lily field: items [x, z, r, bloom, rot]; a pad is a notched disc just over the water, a bloom two rings of pink petals
function lilies(ctx, p, lod) {
  const y = p.y ?? 0.02, n = lod <= 2 ? 9 : 6;
  paint(ctx, null, COL.pad[0], 0.55);
  for (const [x, z, r, bloom, rot] of p.items || []) {
    ctx.color(pick(ctx, COL.pad));
    const gap = 0.55;
    for (let i = 0; i < n; i++) {
      const a0 = rot + gap / 2 + (i / n) * (TAU - gap), a1 = rot + gap / 2 + ((i + 1) / n) * (TAU - gap);
      ctx.tri(x, y + 0.004, z, x + Math.cos(a1) * r, y, z + Math.sin(a1) * r, x + Math.cos(a0) * r, y, z + Math.sin(a0) * r);
    }
    if (bloom && lod <= 3) {
      const bx = x + Math.cos(rot + 3) * r * 0.25, bz = z + Math.sin(rot + 3) * r * 0.25, sc = 0.9 + r * 0.4;
      const ring = (np, rr, hh, ro, col) => { for (let i = 0; i < np; i++) { const a = ro + (i / np) * TAU, w = TAU / np * 0.55; ctx.color(col); ctx.tri(bx, y + 0.02, bz, bx + Math.cos(a - w) * rr * 0.55, y + hh * 0.5, bz + Math.sin(a - w) * rr * 0.55, bx + Math.cos(a) * rr, y + hh, bz + Math.sin(a) * rr); ctx.tri(bx, y + 0.02, bz, bx + Math.cos(a) * rr, y + hh, bz + Math.sin(a) * rr, bx + Math.cos(a + w) * rr * 0.55, y + hh * 0.5, bz + Math.sin(a + w) * rr * 0.55); } };
      ring(lod <= 2 ? 7 : 5, 0.13 * sc, 0.06 * sc, rot, COL.petal[bloom % 3]);
      if (lod <= 2) ring(5, 0.08 * sc, 0.1 * sc, rot + 0.4, COL.petal[(bloom + 1) % 3]);
      ctx.color(COL.heart); solid(ctx, ngon(5, 0.025).map(([a, b]) => [bx + a, y + 0.02, bz + b]), ngon(5, 0.018).map(([a, b]) => [bx + a, y + 0.06 * sc, bz + b]));
    }
  }
}
// stones: items [x, y0, z, r, top, rot, flat]; flat = a stepping stone with a walkable top, else a rounded river stone
function stones(ctx, p, lod) {
  paint(ctx, 'stone', 'oklch(0.97 0.01 80)', 0.8);
  for (const [x, y0, z, r, top, rot, flat] of p.items || []) {
    const n = lod <= 2 ? (flat ? 8 : 7) : 5;
    rock(ctx, x, flat ? Math.min(y0, top - 0.3) : y0, z, r, top - (flat ? Math.min(y0, top - 0.3) : y0), rot, n, !flat && ctx.random() < 0.35, flat ? COL.stone : COL.wet, !!flat);
  }
  ctx.albedo(null);
}
function stonesCollider(ctx, p) {
  for (const [x, , z, r, top, rot, flat] of p.items || []) if (flat) prism(ctx, ngon(8, r * 0.95, x, z, rot), top - 0.6, top);
}
// an iron lantern with warm glass; (x,y,z) its base
function lantern(ctx, x, y, z, s, lod) {
  paint(ctx, null, COL.iron, 0.5, 0.6);
  obox(ctx, x, y, z, 0.17 * s, 0.03 * s, 0.17 * s);
  if (lod <= 2) for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, x + a * 0.07 * s, y + 0.03 * s, z + b * 0.07 * s, 0.018 * s, 0.2 * s, 0.018 * s);
  prism(ctx, ngon(4, 0.13 * s, 0, 0, Math.PI / 4).map(([a, b]) => [a, b]).map(([a, b]) => [x + a, z + b]).map(([a, b]) => [a - x, b - z]).map(([a, b]) => [a + x, b + z]), y + 0.23 * s, y + 0.24 * s);
  solid(ctx, ngon(4, 0.13 * s, x, z, Math.PI / 4).map(([a, b]) => [a, y + 0.24 * s, b]), ngon(4, 0.02 * s, x, z, Math.PI / 4).map(([a, b]) => [a, y + 0.36 * s, b]));
  if (lod <= 2) { obox(ctx, x, y + 0.36 * s, z, 0.012, 0.06 * s, 0.07 * s); }
  paint(ctx, null, 'oklch(0.93 0.07 80)', 0.2);
  ctx.emissive(2.6, 1.55, 0.6);
  obox(ctx, x, y + 0.035 * s, z, 0.115 * s, 0.19 * s, 0.115 * s);
  ctx.emissive(null);
}
// dock lanterns: pts [x, y, z, h, armYaw]: an oak post from the dock post's top, an iron arm and a hanging lantern
function dockLanterns(ctx, p, lod) {
  for (const [x, y, z, h, ay] of p.pts || []) {
    paint(ctx, 'oak', COL.oak, 0.85);
    obox(ctx, x, y, z, 0.1, h, 0.1);
    if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.8); obox(ctx, x, y + h, z, 0.14, 0.04, 0.14); }
    const ax = x + Math.cos(ay) * 0.34, az = z - Math.sin(ay) * 0.34;
    paint(ctx, null, COL.iron, 0.5, 0.6);
    beam(ctx, [x, y + h - 0.08, z], [ax, y + h - 0.08, az], 0.03, 0.03);
    if (lod <= 2) beam(ctx, [x, y + h - 0.32, z], [x + (ax - x) * 0.6, y + h - 0.08, z + (az - z) * 0.6], 0.02, 0.02);
    beam(ctx, [ax, y + h - 0.08, az], [ax, y + h - 0.2, az], 0.012, 0.012);
    lantern(ctx, ax, y + h - 0.58, az, 1, lod);
  }
}
// the boathouse: params w, d, e (eave over floor), f (floor y), open front toward −Z over the water, sod roof, lantern at the gable
function boathouse(ctx, p, lod) {
  const w = p.w ?? 3, d = p.d ?? 3.4, E = p.e ?? 2, f = p.f ?? 0.42, rise = 1.05, R = f + E + rise, ov = 0.38, hw = w / 2, hd = d / 2;
  const slopeY = (ax) => R - (ax / hw) * rise; // roof underside along |x|
  // stilts and floor
  paint(ctx, 'walnut', COL.walnut, 0.85);
  for (const sx of [-1, 1]) for (const zz of [-hd + 0.1, 0, hd - 0.1]) obox(ctx, sx * (hw - 0.08), -0.9, zz, 0.16, f + 0.9, 0.16);
  paint(ctx, 'oak', COL.oak, 0.85);
  if (lod <= 2) { for (let z = -hd; z < hd - 0.01; z += 0.2) { ctx.color(ctx.random() < 0.5 ? COL.oak : 'oklch(0.9 0.035 70)'); obox(ctx, 0, f - 0.06, z + 0.1, w, 0.06, 0.185); } }
  else obox(ctx, 0, f - 0.06, 0, w, 0.06, d);
  // frame
  paint(ctx, 'walnut', COL.walnut, 0.8);
  for (const sx of [-1, 1]) for (const zz of [-hd + 0.07, hd - 0.07]) obox(ctx, sx * (hw - 0.07), f, zz, 0.14, E, 0.14);
  for (const sx of [-1, 1]) obox(ctx, sx * (hw - 0.07), f + E - 0.14, 0, 0.16, 0.14, d);
  obox(ctx, 0, f + E - 0.14, -hd + 0.07, w, 0.16, 0.16); obox(ctx, 0, f + E - 0.14, hd - 0.07, w, 0.14, 0.14);
  if (lod <= 2) { beam(ctx, [0, f + E - 0.06, -hd + 0.07], [0, R - 0.12, -hd + 0.07], 0.12, 0.12); beam(ctx, [0, R - 0.12, -hd], [0, R - 0.12, hd], 0.14, 0.14); for (const sx of [-1, 1]) beam(ctx, [sx * (hw - 0.07), f + E - 0.5, -hd + 0.07], [sx * (hw - 0.6), f + E - 0.07, -hd + 0.07], 0.09, 0.09); }
  // board-and-batten walls: sides with a small window, the back full; boards run floor to plate
  paint(ctx, 'oak', 'oklch(0.9 0.04 70)', 0.9);
  const bw = lod <= 2 ? 0.22 : d - 0.28;
  for (const sx of [-1, 1]) for (let z = -hd + 0.14; z < hd - 0.15; z += bw) {
    const zc = z + bw / 2, x = sx * (hw - 0.03), win = lod <= 2 && Math.abs(zc - 0.2) < 0.4;
    ctx.color(ctx.random() < 0.5 ? 'oklch(0.9 0.04 70)' : 'oklch(0.86 0.045 65)');
    if (win) { obox(ctx, x, f, zc, 0.04, 0.95, bw - 0.015); obox(ctx, x, f + 1.55, zc, 0.04, E - 1.69, bw - 0.015); }
    else obox(ctx, x, f, zc, 0.04, E - 0.14, bw - 0.015);
  }
  const bb = lod <= 2 ? 0.22 : w - 0.28;
  for (let x = -hw + 0.14; x < hw - 0.15; x += bb) { const xc = x + bb / 2, top = Math.min(f + E - 0.14, slopeY(Math.abs(xc)) - 0.1); ctx.color(ctx.random() < 0.5 ? 'oklch(0.9 0.04 70)' : 'oklch(0.86 0.045 65)'); obox(ctx, xc, f, hd - 0.03, bb - 0.015, top - f, 0.04); }
  // gables: back closed, front boarded above the plate only
  for (const zz of [hd - 0.03, -hd + 0.03]) { const g0 = f + E, a = [-hw, g0, zz], b = [hw, g0, zz], c = [0, R - 0.02, zz]; ctx.color('oklch(0.86 0.045 65)'); T(ctx, a, b, c, [0, g0 + 0.3, zz + (zz > 0 ? -0.1 : 0.1)]); T(ctx, a, c, b, [0, g0 + 0.3, zz + (zz > 0 ? 0.1 : -0.1)]); }
  if (lod <= 2) {
    paint(ctx, 'walnut', COL.walnut, 0.8);
    for (const sx of [-1, 1]) { obox(ctx, sx * (hw - 0.01), f + 0.93, 0.2, 0.08, 0.06, 0.9); obox(ctx, sx * (hw - 0.01), f + 1.52, 0.2, 0.08, 0.05, 0.9); obox(ctx, sx * (hw - 0.01), f + 0.99, 0.2, 0.05, 0.53, 0.05); }
    // inside: a crate, a coil of rope, an oar against the back wall
    paint(ctx, 'oak', 'oklch(0.88 0.05 70)', 0.9); obox(ctx, 0.85, f, 1.1, 0.55, 0.45, 0.5, 0.2);
    paint(ctx, 'oak', COL.oak, 0.8); beam(ctx, [-0.9, f, 1.55], [-0.75, f + 1.7, 1.62], 0.05, 0.03); obox(ctx, -0.915, f + 0.05, 1.53, 0.16, 0.42, 0.03, -0.1);
    paint(ctx, null, 'oklch(0.78 0.06 85)', 0.95); prism(ctx, ngon(7, 0.2, 0.9, 1.15), f + 0.45, f + 0.55);
  }
  // roof: plank deck with a sod blanket and a fringe of grass
  const slopes = [-1, 1], zf = -hd - ov, zb = hd + ov * 0.7;
  for (const sx of slopes) {
    const ex = sx * (hw + ov), ey = slopeY(hw + ov);
    paint(ctx, 'walnut', 'oklch(0.84 0.04 60)', 0.85);
    solid(ctx, [[0, R, zf], [ex, ey, zf], [ex, ey, zb], [0, R, zb]], [[0, R + 0.07, zf], [ex, ey + 0.07, zf], [ex, ey + 0.07, zb], [0, R + 0.07, zb]]);
    paint(ctx, 'moss', 'oklch(0.9 0.06 125)', 0.95);
    const i = 0.06;
    solid(ctx, [[0, R + 0.07, zf + i], [ex - sx * i, ey + 0.07, zf + i], [ex - sx * i, ey + 0.07, zb - i], [0, R + 0.07, zb - i]], [[0, R + 0.2, zf + i + 0.03], [ex - sx * (i + 0.03), ey + 0.17, zf + i + 0.03], [ex - sx * (i + 0.03), ey + 0.17, zb - i - 0.03], [0, R + 0.2, zb - i - 0.03]]);
  }
  if (lod <= 2) {
    ctx.albedo(null);
    for (let k = 0; k < 26; k++) {
      const sx = k % 2 ? 1 : -1, u = ctx.random(), ax = sx * (0.05 + u * (hw + ov - 0.15)), z = zf + 0.1 + ctx.random() * (zb - zf - 0.2);
      const y = R + 0.19 - (Math.abs(ax) / hw) * rise;
      for (let b = 0; b < 3; b++) { ctx.color(pick(ctx, COL.blade)); const a = ctx.random() * TAU; blade(ctx, [ax, y, z], a, 0.08, 0.16 + ctx.random() * 0.14, 0.05); }
      if (k % 6 === 0) { ctx.color(k % 12 ? 'oklch(0.9 0.12 95)' : 'oklch(0.85 0.09 355)'); solid(ctx, ngon(5, 0.04).map(([a, b]) => [ax + a, y + 0.18, z + b]), ngon(5, 0.02).map(([a, b]) => [ax + a, y + 0.22, z + b])); }
    }
  }
  // the lantern under the front gable, on an iron bracket
  paint(ctx, null, COL.iron, 0.5, 0.6);
  beam(ctx, [0, f + E + 0.1, -hd + 0.05], [0, f + E + 0.1, -hd - 0.35], 0.03, 0.03);
  beam(ctx, [0, f + E + 0.1, -hd - 0.33], [0, f + E - 0.05, -hd - 0.33], 0.012, 0.012);
  lantern(ctx, 0, f + E - 0.45, -hd - 0.33, 1.05, lod);
  ctx.albedo(null);
}
function boathouseCollider(ctx, p) {
  const w = p.w ?? 3, d = p.d ?? 3.4, E = p.e ?? 2, f = p.f ?? 0.42, hw = w / 2, hd = d / 2;
  obox(ctx, 0, f - 0.3, 0, w, 0.3, d);
  obox(ctx, 0, f, hd - 0.05, w, E, 0.12);
  for (const sx of [-1, 1]) obox(ctx, sx * (hw - 0.06), f, 0, 0.14, E, d);
}
const B = { rim, reeds: rim, lilies, stones, lanterns: dockLanterns, boathouse };
const C = { stones: stonesCollider, boathouse: boathouseCollider };
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}; ctx.flat();
  const f = B[p.kind]; if (f) f(ctx, p, ctx.lod || 1);
  ctx.albedo(null); ctx.emissive(null);
});
export function collider(ctx) {
  const p = ctx.params || {}; const f = C[p.kind]; if (!f) return null; f(ctx, p);
}
