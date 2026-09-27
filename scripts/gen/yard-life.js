// Courtyard life: one merged mesh per cluster. params.items = [[kind, x, z, yawDeg, dy, opts?], ...] local metres;
// kinds: bench, urn, barrow, woodshed, herbrack, apiary, meadow, wattle. Feet at y 0, each piece's front toward its local -Z.
// Parts branch on ctx.lod: <=2 every leaf and log, 3 the big forms, >=4 a few boxes.
import { paint, obox, beam, lathe, blob, TEX, TAU } from '../lib/yard-kit.js';
import { solid, T, gem } from '../lib/road-solid.js';
const C = {
  oak: 'oklch(0.93 0.04 75)', walnut: 'oklch(0.86 0.04 55)', clay: 'oklch(0.74 0.11 45)', stone: 'oklch(0.96 0.02 85)',
  teal: 'oklch(0.66 0.08 195)', sage: 'oklch(0.72 0.07 132)', leaf: 'oklch(0.58 0.11 140)', cream: 'oklch(0.94 0.035 85)',
  soil: 'oklch(0.8 0.02 60)', iron: 'oklch(0.36 0.01 250)', bark: 'oklch(0.55 0.05 55)', end: 'oklch(0.85 0.06 80)',
  roof: 'oklch(0.62 0.03 240)', twine: 'oklch(0.8 0.05 80)',
};
const BLOOM = ['oklch(0.95 0.03 95)', 'oklch(0.85 0.15 90)', 'oklch(0.66 0.14 300)', 'oklch(0.75 0.13 350)', 'oklch(0.7 0.11 255)', 'oklch(0.72 0.15 40)'];
const glow = (ctx) => { ctx.albedo(null); ctx.color('oklch(0.97 0.05 80)'); ctx.roughness(0.2); ctx.metalness(0); ctx.emissive(2.4, 1.35, 0.5); };
function frame(x, y, z, r) {
  const c = Math.cos(r), s = Math.sin(r);
  const p = (a, b, d) => [x + a * c + d * s, y + b, z - a * s + d * c];
  return {
    p, r,
    box: (ctx, cx, y0, cz, sx, sy, sz, yl = 0) => { const q = p(cx, y0, cz); obox(ctx, q[0], q[1], q[2], sx, sy, sz, r + yl); },
    beam: (ctx, a, b, w, h) => beam(ctx, p(...a), p(...b), w, h),
    lathe: (ctx, prof, n, cx, cz) => { const q = p(cx, 0, cz); lathe(ctx, prof.map(([rr, yy]) => [rr, yy + y]), n, q[0], q[2]); },
    blob: (ctx, cx, cy, cz, rx, ry, rz, n, rnd) => { const q = p(cx, cy, cz); blob(ctx, q[0], q[1], q[2], rx, ry, rz, n, rnd); },
    gem: (ctx, cx, cy, cz, rr, up, dn, n) => { const q = p(cx, cy, cz); gem(ctx, q[0], q[1], q[2], rr, up, dn, n); },
    quad: (ctx, a, b, cc, d) => ctx.quad(...p(...a), ...p(...b), ...p(...cc), ...p(...d)),
    solid: (ctx, A, B, caps) => solid(ctx, A.map((v) => p(...v)), B.map((v) => p(...v)), caps),
  };
}
function lantern(ctx, f, x, y, z, lod) { // a jar lantern standing at y: iron cap and base, glowing glass
  paint(ctx, null, C.iron, 0.5, 0.6);
  f.lathe(ctx, [[0.07, y], [0.07, y + 0.03], [0, y + 0.03]], 6, x, z);
  if (lod <= 2) { f.lathe(ctx, [[0.075, y + 0.2], [0.02, y + 0.26], [0, y + 0.27]], 6, x, z); f.beam(ctx, [x - 0.05, y + 0.26, z], [x + 0.05, y + 0.26, z], 0.012, 0.03); }
  glow(ctx); f.lathe(ctx, [[0.055, y + 0.03], [0.065, y + 0.12], [0.05, y + 0.2], [0, y + 0.2]], 6, x, z); ctx.emissive(null);
}
function pot(ctx, f, x, y, z, s, lod, rnd, bloom) {
  paint(ctx, 'stone', C.clay, 0.9);
  f.lathe(ctx, [[0.06 * s, y], [0.085 * s, y + 0.12 * s], [0.095 * s, y + 0.12 * s], [0.095 * s, y + 0.15 * s], [0.08 * s, y + 0.15 * s]], lod <= 2 ? 8 : 5, x, z);
  paint(ctx, 'leaf', C.leaf, 0.8);
  f.blob(ctx, x, y + 0.13 * s, z, 0.1 * s, 0.14 * s, 0.1 * s, lod <= 2 ? 6 : 4, rnd);
  if (bloom && lod <= 2) { paint(ctx, null, bloom, 0.7); for (let i = 0; i < 3; i++) { const a = rnd() * TAU; f.gem(ctx, x + Math.cos(a) * 0.06 * s, y + 0.25 * s, z + Math.sin(a) * 0.06 * s, 0.025, 0.02, 0.01, 4); } }
}
const B = {
  bench(ctx, f, lod, rnd, o) { // potting bench: oak top, walnut legs, slatted shelf, back upstand; pots, seed trays, watering can
    paint(ctx, 'oak', C.oak);
    f.box(ctx, 0, 0.82, 0, 1.6, 0.05, 0.6);
    f.box(ctx, 0, 0.87, 0.27, 1.6, 0.16, 0.04);
    if (lod <= 3) f.box(ctx, 0, 1.03, 0.27, 1.5, 0.03, 0.14);
    paint(ctx, 'walnut', C.walnut);
    for (const [x, z] of [[-0.74, -0.24], [0.74, -0.24], [-0.74, 0.24], [0.74, 0.24]]) f.box(ctx, x, 0, z, 0.06, 0.82, 0.06);
    if (lod <= 3) for (let i = 0; i < (lod <= 2 ? 5 : 1); i++) f.box(ctx, 0, 0.24, lod <= 2 ? -0.22 + i * 0.11 : 0, 1.48, 0.03, lod <= 2 ? 0.08 : 0.5);
    if (lod >= 4) return;
    // seed trays with sprouts
    for (const [tx, tz] of [[-0.45, -0.05], [-0.45, 0.2]].slice(0, o.trays ?? 2)) {
      paint(ctx, 'oak', C.walnut); f.box(ctx, tx, 0.87, tz, 0.5, 0.05, 0.22);
      paint(ctx, 'soil', C.soil); f.box(ctx, tx, 0.9, tz, 0.46, 0.025, 0.18);
      if (lod <= 2) { paint(ctx, null, C.sage, 0.8); for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) { const x = tx - 0.19 + i * 0.076, z = tz - 0.045 + j * 0.09; f.quad(ctx, [x - 0.025, 0.925, z], [x + 0.025, 0.925, z], [x + 0.02, 0.98, z], [x - 0.02, 0.98, z]); f.quad(ctx, [x, 0.925, z - 0.025], [x, 0.925, z + 0.025], [x, 0.98, z + 0.02], [x, 0.98, z - 0.02]); } }
    }
    // pots on the top, a stack on the shelf
    const blooms = [BLOOM[3], null, BLOOM[1], BLOOM[2]];
    for (let i = 0; i < 4; i++) pot(ctx, f, 0.08 + i * 0.19, 0.87, -0.05 + (i % 2) * 0.12, 1 + (i % 2) * 0.25, lod, rnd, blooms[i]);
    paint(ctx, 'stone', C.clay, 0.9);
    for (let i = 0; i < (lod <= 2 ? 3 : 1); i++) f.lathe(ctx, [[0.06, 0.27 + i * 0.05], [0.09, 0.39 + i * 0.05], [0.07, 0.39 + i * 0.05]], 8, 0.45, 0);
    // watering can on the shelf or ground
    const [wx, wy, wz] = o.canGround ? [0.55, 0, -0.55] : [-0.35, 0.27, 0];
    paint(ctx, null, C.teal, 0.45, 0.55);
    f.lathe(ctx, [[0.1, wy], [0.11, wy + 0.2], [0.07, wy + 0.24], [0, wy + 0.25]], lod <= 2 ? 10 : 6, wx, wz);
    f.beam(ctx, [wx - 0.08, wy + 0.06, wz], [wx - 0.28, wy + 0.26, wz], 0.03, 0.03);
    if (lod <= 2) {
      f.gem(ctx, wx - 0.29, wy + 0.27, wz, 0.035, 0.01, 0.03, 6);
      f.beam(ctx, [wx + 0.06, wy + 0.24, wz], [wx + 0.1, wy + 0.32, wz], 0.02, 0.02);
      f.beam(ctx, [wx + 0.1, wy + 0.32, wz], [wx + 0.15, wy + 0.16, wz], 0.02, 0.02);
      paint(ctx, null, C.iron, 0.6, 0.4); f.beam(ctx, [0.62, 0.95, 0.28], [0.62, 1.03, 0.28], 0.015, 0.015); f.box(ctx, 0.62, 0.9, 0.24, 0.07, 0.02, 0.1); // trowel on the upstand
    }
    if (o.lamp) lantern(ctx, f, -0.7, 1.06, 0.27, lod);
  },
  urn(ctx, f, lod, rnd) { // clay urn on a limestone plinth, a mound of flowers trailing over the lip
    paint(ctx, 'stone', C.stone);
    f.box(ctx, 0, 0, 0, 0.46, 0.12, 0.46);
    paint(ctx, 'stone', C.clay, 0.9);
    const n = lod <= 2 ? 10 : 6;
    f.lathe(ctx, lod <= 3 ? [[0.14, 0.12], [0.16, 0.18], [0.1, 0.26], [0.13, 0.31], [0.28, 0.5], [0.32, 0.64], [0.36, 0.68], [0.36, 0.73], [0.3, 0.73]] : [[0.14, 0.12], [0.32, 0.6], [0.34, 0.73], [0.3, 0.73]], n);
    paint(ctx, 'leaf', C.leaf, 0.8);
    f.blob(ctx, 0, 0.7, 0, 0.32, 0.26, 0.32, lod <= 2 ? 7 : 4, rnd);
    if (lod > 2) return;
    const col = BLOOM[Math.floor(rnd() * BLOOM.length)], col2 = BLOOM[(BLOOM.indexOf(col) + 3) % BLOOM.length];
    paint(ctx, null, col, 0.7);
    for (let i = 0; i < 9; i++) { const a = rnd() * TAU, r = rnd() * 0.22; f.gem(ctx, Math.cos(a) * r, 0.9 + (0.22 - r) * 0.4, Math.sin(a) * r, 0.04, 0.03, 0.01, 5); }
    for (let k = 0; k < 7; k++) { // trailing strands
      const a = k / 7 * TAU + rnd() * 0.4; let px = Math.cos(a) * 0.33, pz = Math.sin(a) * 0.33, py = 0.74;
      for (let s = 0; s < 4; s++) {
        const nx = Math.cos(a) * (0.37 + s * 0.035), nz = Math.sin(a) * (0.37 + s * 0.035), ny = py - 0.1 - rnd() * 0.04;
        paint(ctx, 'leaf', C.leaf, 0.8); f.beam(ctx, [px, py, pz], [nx, ny, nz], 0.012, 0.012);
        f.quad(ctx, [nx, ny, nz], [nx + 0.05 * Math.sin(a), ny + 0.02, nz - 0.05 * Math.cos(a)], [nx + 0.03 * Math.cos(a), ny - 0.04, nz + 0.03 * Math.sin(a)], [nx - 0.05 * Math.sin(a), ny + 0.02, nz + 0.05 * Math.cos(a)]);
        if (s % 2) { paint(ctx, null, col2, 0.7); f.gem(ctx, nx * 1.05, ny, nz * 1.05, 0.03, 0.02, 0.01, 4); }
        px = nx; py = ny; pz = nz;
      }
    }
  },
  barrow(ctx, f, lod, rnd) { // teal wheelbarrow heaped with soil, a trowel stuck in
    paint(ctx, null, C.teal, 0.5, 0.4);
    f.solid(ctx, [[-0.22, 0.34, -0.25], [0.22, 0.34, -0.25], [0.22, 0.34, 0.25], [-0.22, 0.34, 0.25]], [[-0.36, 0.62, -0.42], [0.36, 0.62, -0.42], [0.36, 0.62, 0.38], [-0.36, 0.62, 0.38]]);
    paint(ctx, 'soil', C.soil, 0.95);
    f.blob(ctx, 0, 0.58, -0.02, 0.33, 0.16, 0.38, lod <= 2 ? 7 : 4, rnd);
    paint(ctx, 'walnut', C.walnut);
    for (const sx of [-1, 1]) {
      f.beam(ctx, [sx * 0.16, 0.22, -0.55], [sx * 0.28, 0.5, 0.95], 0.045, 0.045);
      f.beam(ctx, [sx * 0.2, 0.36, 0.3], [sx * 0.22, 0, 0.36], 0.04, 0.04);
    }
    paint(ctx, null, C.iron, 0.6, 0.5);
    const N = lod <= 2 ? 10 : 6, W = (x) => { const a = []; for (let i = 0; i < N; i++) { const t = i / N * TAU; a.push([x, 0.2 + Math.sin(t) * 0.2, -0.58 + Math.cos(t) * 0.2]); } return a; };
    f.solid(ctx, W(-0.045), W(0.045));
    if (lod <= 2) { paint(ctx, 'walnut', C.oak); f.beam(ctx, [0.1, 0.62, 0.05], [0.16, 0.86, 0.12], 0.03, 0.03); paint(ctx, null, C.iron, 0.5, 0.6); f.box(ctx, 0.08, 0.56, 0.02, 0.07, 0.1, 0.015, 0.4); }
  },
  woodshed(ctx, f, lod, rnd) { // a lean-to over a stacked firewood cord; chopping block, axe, a lantern on the front beam
    const w = 2.6, d = 1.1, hf = 2.05, hb = 1.65;
    paint(ctx, 'walnut', C.walnut);
    for (const sx of [-1, 1]) { f.box(ctx, sx * (w / 2 - 0.06), 0, -d / 2 + 0.06, 0.1, hf, 0.1); f.box(ctx, sx * (w / 2 - 0.06), 0, d / 2 - 0.06, 0.1, hb, 0.1); }
    f.beam(ctx, [-w / 2, hf - 0.05, -d / 2 + 0.06], [w / 2, hf - 0.05, -d / 2 + 0.06], 0.1, 0.1);
    f.beam(ctx, [-w / 2, hb - 0.05, d / 2 - 0.06], [w / 2, hb - 0.05, d / 2 - 0.06], 0.1, 0.1);
    f.box(ctx, 0, 0, 0, w - 0.1, 0.1, d - 0.1); // sleeper base
    // roof: overlapping boards, eaves over front and back
    paint(ctx, 'oak', C.roof, 0.8);
    const rows = lod <= 2 ? 5 : 1, z0 = -d / 2 - 0.25, z1 = d / 2 + 0.2, y0 = hf + 0.02, y1 = hb + 0.02 - 0.1;
    for (let i = 0; i < rows; i++) {
      const a = i / rows, b = (i + 1) / rows + (rows > 1 ? 0.06 : 0);
      const za = z0 + (z1 - z0) * a, zb = z0 + (z1 - z0) * Math.min(1, b), ya = y0 + (y1 - y0) * a + 0.03 * (i % 2), yb = y0 + (y1 - y0) * Math.min(1, b) + 0.03 * (i % 2);
      f.solid(ctx, [[-w / 2 - 0.15, ya, za], [w / 2 + 0.15, ya, za], [w / 2 + 0.15, yb, zb], [-w / 2 - 0.15, yb, zb]], [[-w / 2 - 0.15, ya + 0.04, za], [w / 2 + 0.15, ya + 0.04, za], [w / 2 + 0.15, yb + 0.04, zb], [-w / 2 - 0.15, yb + 0.04, zb]]);
    }
    if (lod <= 3) { paint(ctx, 'walnut', C.walnut); for (let i = 0; i < (lod <= 2 ? 7 : 1); i++) f.box(ctx, lod <= 2 ? -w / 2 + 0.2 + i * 0.37 : 0, 0.1, d / 2 - 0.02, lod <= 2 ? 0.34 : w - 0.2, hb - 0.2, 0.03); }
    // the cord
    if (lod >= 3) { paint(ctx, 'walnut', C.bark); f.box(ctx, 0, 0.1, 0.02, w - 0.3, 1.3, 0.85); return; }
    const R = 0.075, L = 0.8, N = 6;
    for (let row = 0; row < 8; row++) {
      const y = 0.1 + R + row * R * 1.72, off = (row % 2) * R, cnt = Math.floor((w - 0.34 - off) / (2 * R));
      for (let i = 0; i < cnt; i++) {
        const x = -w / 2 + 0.2 + R + off + i * 2 * R, r = R * (0.85 + rnd() * 0.2), zj = (rnd() - 0.5) * 0.08, rot = rnd();
        const ring = (z) => { const a = []; for (let k = 0; k < N; k++) { const t = rot + k / N * TAU; a.push([x + Math.cos(t) * r, y + Math.sin(t) * r, z]); } return a; };
        const A = ring(-L / 2 + zj), Bq = ring(L / 2 + zj);
        paint(ctx, 'walnut', C.bark, 0.95); f.solid(ctx, A, Bq, false);
        paint(ctx, null, C.end, 0.9);
        const P = A.map((v) => f.p(...v)), c0 = f.p(x, y, -L / 2 + zj), o = f.p(x, y, zj);
        for (let k = 0; k < N; k++) T(ctx, P[k], P[(k + 1) % N], c0, o);
      }
    }
    // chopping block + axe, a few split pieces
    paint(ctx, 'walnut', C.bark, 0.95); f.lathe(ctx, [[0.24, 0], [0.23, 0.42], [0, 0.42]], 8, 0.55, -1.05);
    paint(ctx, null, C.end, 0.9); f.lathe(ctx, [[0.225, 0.42], [0.225, 0.425], [0, 0.425]], 8, 0.55, -1.05);
    paint(ctx, 'oak', C.oak); f.beam(ctx, [0.52, 0.43, -1.02], [0.2, 0.9, -0.9], 0.035, 0.035);
    paint(ctx, null, C.iron, 0.45, 0.7); f.box(ctx, 0.52, 0.4, -1.05, 0.16, 0.1, 0.03, 0.3);
    paint(ctx, 'walnut', C.end, 0.9); for (let i = 0; i < 3; i++) f.box(ctx, -0.1 - i * 0.2, 0, -0.95 - (i % 2) * 0.1, 0.12, 0.08, 0.35, rnd());
    paint(ctx, null, C.iron, 0.5, 0.6); f.beam(ctx, [-0.9, hf - 0.1, -d / 2 + 0.06], [-0.9, hf - 0.35, -d / 2 + 0.06], 0.012, 0.012);
    lantern(ctx, f, -0.9, hf - 0.62, -d / 2 + 0.06, lod);
  },
  herbrack(ctx, f, lod, rnd) { // A-frame drying rack, herb bundles hung head-down on twine, a basket underneath
    paint(ctx, 'walnut', C.walnut);
    const H = 1.6;
    for (const sx of [-0.95, 0.95]) { f.beam(ctx, [sx, 0, -0.38], [sx, H, 0], 0.06, 0.06); f.beam(ctx, [sx, 0, 0.38], [sx, H, 0], 0.06, 0.06); if (lod <= 2) f.beam(ctx, [sx, 0.5, -0.27], [sx, 0.5, 0.27], 0.04, 0.04); }
    paint(ctx, 'oak', C.oak); f.beam(ctx, [-1.05, H - 0.04, 0], [1.05, H - 0.04, 0], 0.06, 0.06);
    if (lod <= 3) f.beam(ctx, [-0.95, 1.1, -0.13], [0.95, 1.1, -0.13], 0.04, 0.04);
    const HERB = ['oklch(0.66 0.08 135)', 'oklch(0.64 0.11 300)', 'oklch(0.82 0.12 90)', 'oklch(0.52 0.08 150)', 'oklch(0.74 0.06 120)'];
    const cnt = lod <= 2 ? 9 : lod === 3 ? 5 : 0;
    for (let i = 0; i < cnt; i++) {
      const x = -0.8 + i * 1.6 / Math.max(1, cnt - 1), top = H - 0.07, lenT = 0.08 + rnd() * 0.1, bl = 0.26 + rnd() * 0.1, y1 = top - lenT;
      if (lod <= 2) { paint(ctx, null, C.twine, 0.9); f.beam(ctx, [x, top, 0], [x, y1, 0], 0.01, 0.01); }
      paint(ctx, 'leaf', HERB[i % HERB.length], 0.9);
      f.lathe(ctx, [[0, y1 - bl], [0.07, y1 - bl * 0.75], [0.06, y1 - 0.05], [0.025, y1], [0, y1]], 5, x, 0);
      if (lod <= 2 && i % 2) { const y2 = 1.07; paint(ctx, null, C.twine, 0.9); f.beam(ctx, [x + 0.1, 1.1, -0.13], [x + 0.1, y2 - 0.05, -0.13], 0.01, 0.01); paint(ctx, 'leaf', HERB[(i + 2) % HERB.length], 0.9); f.lathe(ctx, [[0, y2 - 0.3], [0.06, y2 - 0.22], [0.05, y2 - 0.07], [0, y2 - 0.05]], 5, x + 0.1, -0.13); }
    }
    if (lod <= 3) { paint(ctx, 'oak', C.oak, 0.9); f.lathe(ctx, [[0.18, 0], [0.26, 0.24], [0.27, 0.26], [0.22, 0.26], [0, 0.1]], lod <= 2 ? 10 : 6, 0.2, 0.05); paint(ctx, 'leaf', HERB[0], 0.9); f.blob(ctx, 0.2, 0.18, 0.05, 0.2, 0.12, 0.2, 5, rnd); }
  },
  apiary(ctx, f, lod, rnd) { // three hives on a limestone-and-oak stand, entrances to the front
    paint(ctx, 'stone', C.stone); for (const x of [-1.35, -0.45, 0.45, 1.35]) f.box(ctx, x, 0, 0, 0.22, 0.28, 0.5);
    paint(ctx, 'oak', C.walnut); for (const z of [-0.18, 0.18]) f.box(ctx, 0, 0.28, z, 3.0, 0.08, 0.1);
    const BODY = [C.cream, C.teal, C.sage];
    for (let h = 0; h < 3; h++) {
      const x = (h - 1) * 0.95;
      paint(ctx, 'oak', BODY[h], 0.8);
      f.box(ctx, x, 0.36, 0, 0.5, 0.3, 0.44); f.box(ctx, x, 0.68, 0, 0.5, 0.18, 0.44);
      if (lod <= 2) { paint(ctx, 'oak', BODY[(h + 1) % 3], 0.8); f.box(ctx, x, 0.87, 0, 0.5, 0.14, 0.44); }
      const top = lod <= 2 ? 1.01 : 0.86;
      paint(ctx, null, C.iron, 0.9); f.box(ctx, x, 0.37, -0.222, 0.3, 0.03, 0.005); // entrance slot
      paint(ctx, 'oak', C.oak); f.box(ctx, x, 0.34, -0.3, 0.4, 0.025, 0.14); // landing board
      paint(ctx, 'oak', C.roof, 0.75);
      f.box(ctx, x, top, 0, 0.58, 0.04, 0.52);
      f.solid(ctx, [[x - 0.3, top + 0.04, -0.28], [x - 0.3, top + 0.04, 0.28], [x - 0.3, top + 0.17, 0]], [[x + 0.3, top + 0.04, -0.28], [x + 0.3, top + 0.04, 0.28], [x + 0.3, top + 0.17, 0]]);
    }
  },
  meadow(ctx, f, lod, rnd, o) { // a wildflower patch: stems and heads in a disc, clear of the stand
    const R = o.r ?? 2.2, n = lod <= 2 ? (o.n ?? 90) : lod === 3 ? 18 : 0;
    for (let i = 0; i < n; i++) {
      const a = rnd() * TAU, r = Math.sqrt(rnd()) * R, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(x) < 1.65 && Math.abs(z) < 0.45) continue;
      const h = 0.25 + rnd() * 0.35;
      if (lod <= 2) { paint(ctx, null, C.leaf, 0.85); f.quad(ctx, [x - 0.012, 0, z], [x + 0.012, 0, z], [x + 0.004, h, z], [x - 0.004, h, z]); if (i % 3 === 0) f.quad(ctx, [x, 0, z], [x + 0.08, h * 0.5, z + 0.03], [x + 0.1, h * 0.55, z + 0.02], [x, 0.02, z]); }
      paint(ctx, null, BLOOM[Math.floor(rnd() * BLOOM.length)], 0.7);
      f.gem(ctx, x, h, z, lod <= 2 ? 0.035 : 0.08, 0.025, 0.012, lod <= 2 ? 5 : 4);
    }
    paint(ctx, 'leaf', C.sage, 0.9);
    for (let i = 0; i < (lod <= 2 ? 10 : 4); i++) { const a = i / (lod <= 2 ? 10 : 4) * TAU + 0.3, r = R * (0.55 + (i % 3) * 0.15); f.blob(ctx, Math.cos(a) * r, 0, Math.sin(a) * r, 0.3, 0.16, 0.3, 5, rnd); }
  },
  wattle(ctx, f, lod, rnd, o) { // low woven hazel hurdle along local X, gently bowed
    const L = o.len ?? 3.6, bow = o.bow ?? 0.25, H = 0.7, n = Math.round(L / 0.36), zAt = (x) => bow * (1 - (2 * x / L) ** 2);
    paint(ctx, 'walnut', C.bark, 0.95);
    for (let i = 0; i <= n; i++) { const x = -L / 2 + i * L / n; f.beam(ctx, [x, 0, zAt(x)], [x, H + 0.08, zAt(x)], 0.04, 0.04); }
    paint(ctx, 'walnut', C.twine, 0.95);
    if (lod >= 3) { f.box(ctx, 0, 0.1, bow * 0.6, L, H - 0.12, 0.05); return; }
    for (let r = 0; r < 6; r++) { const y = 0.12 + r * 0.095; for (let i = 0; i < n; i++) { const xa = -L / 2 + i * L / n, xb = xa + L / n, s = (i + r) % 2 ? 1 : -1; f.beam(ctx, [xa, y, zAt(xa) + s * 0.03], [xb, y + 0.01, zAt(xb) - s * 0.03], 0.035, 0.05); } }
  },
};
const HITS = { bench: [1.6, 0.9, 0.6], urn: [0.46, 0.8, 0.46], barrow: [0.72, 0.62, 1.3], herbrack: [2.0, 1.6, 0.4], apiary: [3.0, 1.1, 0.56], woodshed: [2.6, 1.9, 1.1] };
function items(ctx) { return (ctx.params && ctx.params.items) || []; }
export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod ?? 1;
  let seed = (ctx.seed ?? 7) * 9301 + 49297;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (const [kind, x, z, yaw = 0, dy = 0, o = {}] of items(ctx)) { const b = B[kind]; if (b) b(ctx, frame(x, dy, z, yaw * Math.PI / 180), lod, rnd, o); }
}
export function collider(ctx) {
  for (const [kind, x, z, yaw = 0, dy = 0, o = {}] of items(ctx)) {
    const f = frame(x, dy, z, yaw * Math.PI / 180);
    if (kind === 'wattle') f.box(ctx, 0, 0, (o.bow ?? 0.25) * 0.6, o.len ?? 3.6, 0.78, 0.12);
    else if (HITS[kind]) { const [sx, sy, sz] = HITS[kind]; f.box(ctx, 0, 0, kind === 'barrow' ? 0.1 : 0, sx, sy, sz); }
  }
}
