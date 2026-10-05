// Walk-in garden tool shed: sage board-and-batten walls, cedar-shingled pitched roof, door (−Z face) swung open,
// a window over the potting bench, pegboard of tools, wheelbarrow, watering can, coiled hose, soil sacks, lantern.
// Feet at floor-base centre; 3 m along X, 2.5 m along Z.
import { beam, lathe, lantern, paint, prism, box, gem, Q, T, solid } from '../lib/garden-kit.js';
import { softened } from "./soften.js";
const W = 1.5, D = 1.25, F = 0.12, EV = 2.22, RG = 2.84, TH = 0.07, OH = 0.3, OX = 0.25;
const DOOR = [-0.35, 0.65], DH = 2.16, WIN = [-0.95, -0.15], WY = [1.25, 1.85];
const SAGE = 'oklch(0.94 0.03 140)', CREAM = 'oklch(0.93 0.025 90)', OAK = 'oklch(0.94 0.03 75)', IRON = 'oklch(0.32 0.01 250)', STEEL = 'oklch(0.72 0.01 240)';
const DANG = 160 * Math.PI / 180, DDIR = [Math.cos(DANG), 0, -Math.sin(DANG)], HINGE = [DOOR[0], 0, -D - 0.035];
const wallBoxes = () => [
  [-W, F, -D, DOOR[0], EV, -D + TH], [DOOR[1], F, -D, W, EV, -D + TH], [DOOR[0], DH, -D, DOOR[1], EV, -D + TH],
  [-W, F, D - TH, WIN[0], EV, D], [WIN[1], F, D - TH, W, EV, D], [WIN[0], F, D - TH, WIN[1], WY[0], D], [WIN[0], WY[1], D - TH, WIN[1], EV, D],
  [-W, F, -D + TH, -W + TH, EV, D - TH], [W - TH, F, -D + TH, W, EV, D - TH]];
const gable = (ctx, x0, x1) => solid(ctx, [[x0, EV, -D], [x0, EV, D], [x0, RG, 0]], [[x1, EV, -D], [x1, EV, D], [x1, RG, 0]]);
const ye = EV - OH * (RG - EV) / D;
function slope(zs) { // ridge → eave on the zs side
  const zA = 0, yA = RG, zB = zs * (D + OH), yB = ye, dz = zB - zA, dy = yB - yA, L = Math.hypot(dz, dy);
  let ny = -dz / L, nz = dy / L; if (ny < 0) { ny = -ny; nz = -nz; }
  return { zA, yA, zB, yB, L, ny, nz, tz: dz / L, ty: dy / L };
}
function roofSlab(ctx, s, t = 0.06, x0 = -W - OX, x1 = W + OX) {
  const b = [[x0, s.yA, s.zA], [x1, s.yA, s.zA], [x1, s.yB, s.zB], [x0, s.yB, s.zB]];
  solid(ctx, b, b.map(([x, y, z]) => [x, y + s.ny * t, z + s.nz * t]));
}
function doorLeaf(ctx, lod) {
  const at = (t, y, o = 0) => { const s = [-DDIR[2], 0, DDIR[0]]; return [HINGE[0] + DDIR[0] * t + s[0] * o, y, HINGE[2] + DDIR[2] * t + s[2] * o]; };
  paint(ctx, 'sage', SAGE, 0.85); beam(ctx, at(0.02, F + 1.0), at(0.98, F + 1.0), 0.05, 1.98);
  if (lod <= 2) {
    paint(ctx, 'oak', CREAM, 0.8);
    for (const y of [F + 0.25, F + 1.0, F + 1.75]) beam(ctx, at(0.06, y, 0.035), at(0.94, y, 0.035), 0.025, 0.11);
    beam(ctx, at(0.12, F + 0.32, 0.035), at(0.88, F + 0.95, 0.035), 0.025, 0.09); beam(ctx, at(0.12, F + 1.07, 0.035), at(0.88, F + 1.68, 0.035), 0.025, 0.09);
    paint(ctx, null, IRON, 0.5, 0.6);
    for (const y of [F + 0.25, F + 1.75]) beam(ctx, at(0.0, y, 0.05), at(0.35, y, 0.05), 0.012, 0.05);
    beam(ctx, at(0.9, F + 0.95, 0.07), at(0.9, F + 1.12, 0.07), 0.025);
  }
}
function tools(ctx, lod) {
  const X = 1.37, h = (a, b, w = 0.034) => { paint(ctx, 'oak', OAK, 0.75); beam(ctx, a, b, w); }, m = (col = STEEL) => paint(ctx, null, col, 0.4, 0.7);
  paint(ctx, null, 'oklch(0.8 0.05 70)', 0.9); box(ctx, 1.4, 0.8, -1.02, W - TH, 1.96, 0.62);
  if (lod <= 1) { paint(ctx, null, 'oklch(0.45 0.03 60)', 0.9); for (let i = 0; i < 9; i++) for (let j = 0; j < 6; j++) box(ctx, 1.395, 0.88 + j * 0.2, -0.95 + i * 0.19, 1.402, 0.9 + j * 0.2, -0.93 + i * 0.19); }
  // rake
  h([X, 0.3, -0.82], [X, 1.76, -0.82]); m(IRON); beam(ctx, [X - 0.02, 1.78, -1.0], [X - 0.02, 1.78, -0.64], 0.035);
  for (let i = 0; i < 7; i++) beam(ctx, [X - 0.02, 1.78, -0.98 + i * 0.053], [X - 0.08, 1.9, -0.98 + i * 0.053], 0.012);
  // spade
  h([X, 0.56, -0.47], [X, 1.58, -0.47]); h([X, 1.58, -0.53], [X, 1.58, -0.41], 0.03); h([X, 1.58, -0.53], [X, 1.7, -0.47], 0.025); h([X, 1.58, -0.41], [X, 1.7, -0.47], 0.025);
  m(); beam(ctx, [X, 0.26, -0.47], [X, 0.56, -0.47], 0.21, 0.018);
  // hoe
  h([X, 0.24, -0.15], [X, 1.82, -0.15]); m(IRON); beam(ctx, [X - 0.16, 0.2, -0.15], [X + 0.02, 0.2, -0.15], 0.14, 0.012);
  // pitchfork
  h([X, 0.64, 0.18], [X, 1.86, 0.18]); m(IRON); beam(ctx, [X, 0.62, 0.1], [X, 0.62, 0.26], 0.03);
  for (let i = 0; i < 4; i++) beam(ctx, [X, 0.62, 0.11 + i * 0.047], [X, 0.3, 0.11 + i * 0.047], 0.014);
  // shears
  m(); beam(ctx, [X + 0.01, 1.35, 0.4], [X + 0.01, 1.66, 0.5], 0.03, 0.01); beam(ctx, [X + 0.015, 1.35, 0.5], [X + 0.015, 1.66, 0.4], 0.03, 0.01);
  paint(ctx, null, 'oklch(0.55 0.15 30)', 0.7); beam(ctx, [X + 0.01, 1.35, 0.4], [X + 0.01, 1.14, 0.36], 0.03); beam(ctx, [X + 0.015, 1.35, 0.5], [X + 0.015, 1.14, 0.54], 0.03);
  // trowel
  h([X, 1.02, 0.45], [X, 0.86, 0.45], 0.036); m(); beam(ctx, [X, 0.86, 0.45], [X, 0.62, 0.45], 0.1, 0.012);
}
function bench(ctx, lod) {
  paint(ctx, 'oak', OAK, 0.8);
  box(ctx, -1.38, 0.86, 0.7, 0.9, 0.91, D - TH); box(ctx, -1.38, 0.5, 0.74, 0.9, 0.53, D - TH - 0.02);
  for (const x of [-1.33, 0.83]) for (const z of [0.75, 1.1]) box(ctx, x, F, z, x + 0.05, 0.86, z + 0.05);
  if (lod > 2) return;
  // clay pots: three on top, a nested stack on the shelf
  const pot = (c, s = 1) => { paint(ctx, null, 'oklch(0.63 0.12 45)', 0.9); lathe(ctx, [[0, 0], [0.065 * s, 0], [0.09 * s, 0.13 * s], [0.105 * s, 0.13 * s], [0.105 * s, 0.165 * s], [0, 0.165 * s]], 8, c); };
  pot([0.55, 0.91, 0.95]); pot([0.3, 0.91, 0.88], 0.8); pot([0.72, 0.91, 1.02], 0.7);
  paint(ctx, null, 'oklch(0.35 0.04 60)', 1); lathe(ctx, [[0, 0.168], [0.095, 0.168], [0, 0.17]], 8, [0.55, 0.91, 0.95]);
  paint(ctx, null, 'oklch(0.55 0.13 135)', 0.8); for (let i = 0; i < 5; i++) gem(ctx, 0.55 + Math.cos(i * 1.3) * 0.04, 1.13, 0.95 + Math.sin(i * 1.3) * 0.04, 0.03, 0.08, 0.04, 4);
  for (let i = 0; i < 3; i++) pot([0.35, 0.53 + i * 0.05, 0.95]);
  // seed tray with sprouts
  paint(ctx, 'oak', 'oklch(0.8 0.04 60)', 0.9); box(ctx, -1.15, 0.91, 0.8, -0.55, 0.97, 1.08);
  paint(ctx, null, 'oklch(0.34 0.04 55)', 1); box(ctx, -1.13, 0.97, 0.82, -0.57, 0.975, 1.06);
  paint(ctx, null, 'oklch(0.7 0.15 130)', 0.8); for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) gem(ctx, -1.09 + i * 0.095, 0.975, 0.86 + j * 0.08, 0.02, 0.05, 0.003, 4);
  // soil sacks under the bench
  for (const [x, z, s] of [[-1.0, 0.95, 1], [-0.52, 0.93, 0.9]]) {
    paint(ctx, null, 'oklch(0.72 0.06 75)', 1);
    const r = (w, d, y) => [[x - w, y, z - d], [x + w, y, z - d], [x + w, y, z + d], [x - w, y, z + d]];
    solid(ctx, r(0.2 * s, 0.14 * s, F), r(0.17 * s, 0.11 * s, F + 0.28 * s)); solid(ctx, r(0.17 * s, 0.11 * s, F + 0.28 * s), r(0.05, 0.04, F + 0.34 * s));
    paint(ctx, null, 'oklch(0.55 0.1 145)', 1); box(ctx, x - 0.201 * s, F + 0.1 * s, z - 0.141 * s, x + 0.201 * s, F + 0.16 * s, z + 0.141 * s);
  }
}
function barrow(ctx, lod) {
  const x = -0.98, r = (w, z0, z1, y) => [[x - w, y, z0], [x + w, y, z0], [x + w, y, z1], [x - w, y, z1]];
  paint(ctx, null, 'oklch(0.58 0.09 150)', 0.5, 0.3); solid(ctx, r(0.2, -0.75, 0.0, 0.42), r(0.32, -0.95, 0.15, 0.72));
  paint(ctx, null, 'oklch(0.36 0.04 60)', 1); solid(ctx, r(0.27, -0.88, 0.1, 0.721), r(0.27, -0.88, 0.1, 0.725));
  paint(ctx, null, 'oklch(0.25 0.01 250)', 0.8);
  const wheel = (xo) => { const L = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; L.push([xo, F + 0.19 + Math.sin(a) * 0.19, -1.0 + Math.cos(a) * 0.19]); } return L; };
  solid(ctx, wheel(x - 0.04), wheel(x + 0.04));
  paint(ctx, 'oak', OAK, 0.8);
  for (const s of [-1, 1]) { beam(ctx, [x + s * 0.18, 0.4, -1.02], [x + s * 0.27, 0.64, 0.58], 0.045); beam(ctx, [x + s * 0.2, 0.44, 0.05], [x + s * 0.2, F, 0.1], 0.04); }
}
export const geometry = softened(function geometry(ctx) {
  const lod = ctx.lod || 1; ctx.flat();
  const g = Math.min(ctx.groundY(-W, -D), ctx.groundY(W, -D), ctx.groundY(W, D), ctx.groundY(-W, D), 0) - 0.1;
  const fs = slope(-1), bs = slope(1);
  if (lod >= 5) { paint(ctx, 'sage', SAGE, 0.85); box(ctx, -W, g, -D, W, EV, D); gable(ctx, -W, W); paint(ctx, 'shingle', 'oklch(0.9 0.03 50)', 0.9); roofSlab(ctx, fs); roofSlab(ctx, bs); return; }
  // floor on stone footings
  paint(ctx, 'stone', 'oklch(0.93 0.015 85)', 0.9); for (const [x, z] of [[-W, -D], [W, -D], [W, D], [-W, D], [0, -D], [0, D]]) box(ctx, x - 0.12, g, z - 0.12, x + 0.12, 0.04, z + 0.12);
  paint(ctx, 'oak', OAK, 0.85); box(ctx, -W, 0.04, -D, W, F, D);
  // walls
  paint(ctx, 'sage', SAGE, 0.85); for (const b of wallBoxes()) box(ctx, ...b); gable(ctx, -W, -W + TH); gable(ctx, W - TH, W);
  if (lod <= 2) {
    paint(ctx, 'sage', 'oklch(0.9 0.035 140)', 0.85);
    for (let x = -W + 0.2; x < W - 0.1; x += 0.3) {
      if (!(x > DOOR[0] - 0.1 && x < DOOR[1] + 0.1)) box(ctx, x - 0.025, F, -D - 0.022, x + 0.025, EV, -D);
      if (x > WIN[0] - 0.1 && x < WIN[1] + 0.1) { box(ctx, x - 0.025, F, D, x + 0.025, WY[0] - 0.06, D + 0.022); box(ctx, x - 0.025, WY[1] + 0.06, D, x + 0.025, EV, D + 0.022); }
      else box(ctx, x - 0.025, F, D, x + 0.025, EV, D + 0.022);
    }
    for (let z = -D + 0.2; z < D - 0.1; z += 0.3) { const yt = EV + (RG - EV) * (1 - Math.abs(z) / D) - 0.05; for (const sx of [-1, 1]) box(ctx, sx > 0 ? W : -W - 0.022, F, z - 0.025, sx > 0 ? W + 0.022 : -W, yt, z + 0.025); }
    // trims: corners, door casing, window casing + sill
    paint(ctx, 'oak', CREAM, 0.8);
    for (const [x, z] of [[-W, -D], [W, -D], [W, D], [-W, D]]) box(ctx, x - 0.05, F, z - 0.05, x + 0.05, EV, z + 0.05);
    box(ctx, DOOR[0] - 0.09, F, -D - 0.035, DOOR[0], DH + 0.09, -D + 0.005); box(ctx, DOOR[1], F, -D - 0.035, DOOR[1] + 0.09, DH + 0.09, -D + 0.005); box(ctx, DOOR[0] - 0.09, DH, -D - 0.035, DOOR[1] + 0.09, DH + 0.1, -D + 0.005);
    box(ctx, WIN[0] - 0.07, WY[0] - 0.07, D - 0.005, WIN[0], WY[1] + 0.07, D + 0.035); box(ctx, WIN[1], WY[0] - 0.07, D - 0.005, WIN[1] + 0.07, WY[1] + 0.07, D + 0.035);
    box(ctx, WIN[0] - 0.07, WY[1], D - 0.005, WIN[1] + 0.07, WY[1] + 0.07, D + 0.035); box(ctx, WIN[0] - 0.1, WY[0] - 0.09, D - 0.02, WIN[1] + 0.1, WY[0] - 0.03, D + 0.08);
    box(ctx, (WIN[0] + WIN[1]) / 2 - 0.02, WY[0], D - 0.04, (WIN[0] + WIN[1]) / 2 + 0.02, WY[1], D - 0.02); box(ctx, WIN[0], (WY[0] + WY[1]) / 2 - 0.02, D - 0.04, WIN[1], (WY[0] + WY[1]) / 2 + 0.02, D - 0.02);
    // bargeboards + ridge cap
    for (const sx of [-1, 1]) for (const s of [fs, bs]) beam(ctx, [sx * (W + OX), RG + 0.03, 0], [sx * (W + OX), s.yB + 0.03, s.zB], 0.04, 0.14);
  }
  paint(ctx, null, 'oklch(0.9 0.03 220)', 0.1, 0, 0.35); box(ctx, WIN[0], WY[0], D - 0.035, WIN[1], WY[1], D - 0.03);
  // roof
  paint(ctx, 'shingle', 'oklch(0.92 0.03 50)', 0.9);
  for (const s of [fs, bs]) {
    roofSlab(ctx, s, 0.05);
    if (lod <= 2) {
      const rows = Math.floor(s.L / 0.17), rnd = () => ctx.random();
      for (let r = 0; r < rows; r++) {
        const d0 = s.L - (r * 0.17 + 0.2), d1 = d0 + 0.24; // distance from ridge along the slope
        const P = (x, d, o) => [x, s.yA + s.ty * d + s.ny * o, s.zA + s.tz * d + s.nz * o];
        const cuts = lod <= 1 ? (() => { const c = [-W - OX]; let x = -W - OX + (r % 2) * 0.13; while ((x += 0.2 + rnd() * 0.1) < W + OX - 0.1) c.push(x); c.push(W + OX); return c; })() : [-W - OX, W + OX];
        for (let i = 0; i < cuts.length - 1; i++) {
          const x0 = cuts[i] + 0.006, x1 = cuts[i + 1] - 0.006, lo = 0.05 + 0.03, hi = 0.05;
          const A = [P(x0, Math.max(d0 - 0.24, 0) + 0.24, lo), P(x1, Math.max(d0 - 0.24, 0) + 0.24, lo), P(x1, Math.max(d1 - 0.48, 0), hi), P(x0, Math.max(d1 - 0.48, 0), hi)];
          solid(ctx, A, A.map(([x, y, z]) => [x, y + s.ny * 0.02, z + s.nz * 0.02]));
        }
      }
    }
  }
  paint(ctx, 'oak', 'oklch(0.7 0.04 50)', 0.9); beam(ctx, [-W - OX - 0.03, RG + 0.07, 0], [W + OX + 0.03, RG + 0.07, 0], 0.16, 0.08);
  doorLeaf(ctx, lod);
  if (lod <= 3) bench(ctx, lod);
  if (lod <= 2) {
    tools(ctx, lod); barrow(ctx, lod);
    // watering can
    const c = [0.95, F, 0.3]; paint(ctx, null, STEEL, 0.35, 0.7);
    lathe(ctx, [[0, 0], [0.12, 0], [0.12, 0.26], [0.09, 0.3], [0, 0.3]], 10, c);
    beam(ctx, [c[0] + 0.09, c[1] + 0.07, c[2]], [c[0] + 0.33, c[1] + 0.36, c[2]], 0.035); gem(ctx, c[0] + 0.35, c[1] + 0.38, c[2], 0.045, 0.02, 0.02, 6);
    beam(ctx, [c[0] - 0.1, c[1] + 0.24, c[2]], [c[0] - 0.05, c[1] + 0.42, c[2]], 0.025); beam(ctx, [c[0] - 0.05, c[1] + 0.42, c[2]], [c[0] + 0.07, c[1] + 0.34, c[2]], 0.025);
    // coiled hose on the −X wall
    paint(ctx, null, IRON, 0.5, 0.6); beam(ctx, [-W + TH, 1.62, -0.35], [-W + TH + 0.12, 1.62, -0.35], 0.04);
    paint(ctx, null, 'oklch(0.55 0.13 145)', 0.6);
    for (let k = 0; k < 3; k++) { const xo = -W + TH + 0.05 + k * 0.035, rr = 0.2 + k * 0.015; let prev = null; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, p = [xo, 1.4 + Math.sin(a) * rr, -0.35 + Math.cos(a) * rr]; if (prev) beam(ctx, prev, p, 0.035); prev = p; } }
  }
  if (lod <= 3) { paint(ctx, null, IRON, 0.6, 0.6); beam(ctx, [0, RG - 0.05, 0], [0, 2.38, 0], 0.018); lantern(ctx, [0, 1.96, 0], lod); }
  ctx.albedo(null);
});
export function collider(ctx) {
  box(ctx, -W, -0.1, -D, W, F, D);
  for (const b of wallBoxes()) box(ctx, ...b);
  gable(ctx, -W, -W + TH); gable(ctx, W - TH, W);
  roofSlab(ctx, slope(-1)); roofSlab(ctx, slope(1));
  box(ctx, -1.38, F, 0.7, 0.9, 0.91, D - TH);
  box(ctx, -1.3, F, -1.2, -0.66, 0.72, 0.6);
  const e = [HINGE[0] + DDIR[0], 0, HINGE[2] + DDIR[2]];
  beam(ctx, [HINGE[0], F + 1, HINGE[2]], [e[0], F + 1, e[2]], 0.06, 1.98);
}
