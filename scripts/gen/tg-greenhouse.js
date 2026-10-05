// Tower Gardens tunnel greenhouse: white steel hoops every 2 m over a frosted skin, brick dwarf walls, arched doors both ends,
// brick aisle along z = -33, seedling shelves on the long walls, hanging baskets, a potting bench at the east end, gutters + downpipe.
// World coordinates via origin(); feet at (58, 0.5, -33). Beds (Savi's) stand in the gravel between the shelves and the aisle.
import { origin, Q, T, box, beam, lathe, gem, leaf, paint, PAL, rnd, TAU } from "../lib/tg-kit.js";
import { softened } from "./soften.js";
const X0 = 46, X1 = 70, ZC = -33, HW = 3.5, SIDE = 1.2, RISE = 2.6, DOOR = 0.8, DOORH = 2.0, BASE = 0.5;
const BEDX = [49.6, 53.8, 58, 62.2, 66.4], BEDZ = [-34.8, -31.2];
function arch(n) { const P = [[-HW, SIDE]]; for (let i = 1; i < n; i++) { const a = Math.PI - (i / n) * Math.PI; P.push([HW * Math.cos(a), SIDE + RISE * Math.sin(a)]); } P.push([HW, SIDE]); return P; }
function topAt(A, dz) { for (let i = 0; i < A.length - 1; i++) { const [z0, y0] = A[i], [z1, y1] = A[i + 1]; if (dz >= z0 - 1e-6 && dz <= z1 + 1e-6) return y0 + (y1 - y0) * ((dz - z0) / (z1 - z0 || 1)); } return SIDE; }
const doorTop = (dz) => (Math.abs(dz) >= DOOR ? 0 : DOORH + Math.sqrt(DOOR * DOOR - dz * dz));
function endColumns(A, doorStep) {
  const zs = new Set(A.map((p) => +p[0].toFixed(4)));
  for (let z = -DOOR; z <= DOOR + 1e-6; z += doorStep) zs.add(+z.toFixed(4));
  return [...zs].sort((a, b) => a - b);
}
// the skin: long glass strips + the two end walls with the door hole; bottom = glass sill (visual) or 0 (collider)
function skin(ctx, A, doorStep, sill) {
  const G = [[-HW, sill], ...A, [HW, sill]];
  for (let i = 0; i < G.length - 1; i++) { const [za, ya] = G[i], [zb, yb] = G[i + 1]; Q(ctx, [X0, ya, ZC + za], [X1, ya, ZC + za], [X1, yb, ZC + zb], [X0, yb, ZC + zb], [58, 1.5, ZC]); }
  const zs = endColumns(A, doorStep);
  for (const X of [X0, X1]) for (let i = 0; i < zs.length - 1; i++) {
    const za = zs[i], zb = zs[i + 1], mid = (za + zb) / 2, inDoor = Math.abs(mid) < DOOR;
    const ba = inDoor ? doorTop(za) || DOORH : sill, bb = inDoor ? doorTop(zb) || DOORH : sill;
    const ta = topAt(A, za), tb = topAt(A, zb);
    if (ta - ba < 0.01 && tb - bb < 0.01) continue;
    Q(ctx, [X, ba, ZC + za], [X, bb, ZC + zb], [X, tb, ZC + zb], [X, ta, ZC + za], [58, 1.5, ZC]);
  }
}
export const geometry = softened(function geometry(ctx) {
  origin(58, 0, -33);
  const lod = ctx.lod, R = rnd(71);
  const A = arch(lod >= 4 ? 4 : lod >= 3 ? 6 : 10);
  if (lod >= 4) { // far: dwarf walls, the vault and a few hoops
    paint(ctx, PAL.brick); box(ctx, X0, 0, ZC - HW, X1, BASE, ZC + HW);
    paint(ctx, PAL.glass); skin(ctx, A, 0.8, BASE);
    if (lod === 4) { paint(ctx, PAL.white); for (let x = X0; x <= X1 + 0.01; x += 8) for (let i = 0; i < A.length - 1; i++) beam(ctx, [x, A[i][1], ZC + A[i][0]], [x, A[i + 1][1], ZC + A[i + 1][0]], 0.12, 0.12, false); }
    return;
  }
  // brick dwarf walls (door gaps at the ends) and the brick aisle
  paint(ctx, PAL.brick);
  box(ctx, X0, 0, ZC - HW, X1, BASE, ZC - HW + 0.22); box(ctx, X0, 0, ZC + HW - 0.22, X1, BASE, ZC + HW);
  for (const X of [X0, X1 - 0.22]) { box(ctx, X, 0, ZC - HW + 0.22, X + 0.22, BASE, ZC - DOOR); box(ctx, X, 0, ZC + DOOR, X + 0.22, BASE, ZC + HW - 0.22); }
  box(ctx, X0 - 0.7, 0, ZC - 0.6, X1 + 0.7, 0.04, ZC + 0.6);
  paint(ctx, PAL.stone[0]); // limestone coping on the dwarf walls
  box(ctx, X0 - 0.03, BASE, ZC - HW - 0.04, X1 + 0.03, BASE + 0.05, ZC - HW + 0.26); box(ctx, X0 - 0.03, BASE, ZC + HW - 0.26, X1 + 0.03, BASE + 0.05, ZC + HW + 0.04);
  // gravel floor everywhere inside except the aisle and the beds themselves
  if (lod <= 2) {
    paint(ctx, PAL.gravel);
    const xs = [X0 + 0.22, X1 - 0.22]; for (const bx of BEDX) xs.push(bx - 1.7, bx + 1.7); xs.sort((a, b) => a - b);
    const zs = [ZC - HW + 0.22, -35.4, -34.2, ZC - 0.6, ZC + 0.6, -31.8, -30.6, ZC + HW - 0.22];
    for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
      const mx = (xs[i] + xs[i + 1]) / 2, mz = (zs[j] + zs[j + 1]) / 2;
      if (Math.abs(mz - ZC) < 0.6) continue;
      if (BEDX.some((b) => Math.abs(mx - b) < 1.7) && BEDZ.some((b) => Math.abs(mz - b) < 0.6)) continue;
      Q(ctx, [xs[i], 0.015, zs[j]], [xs[i], 0.015, zs[j + 1]], [xs[i + 1], 0.015, zs[j + 1]], [xs[i + 1], 0.015, zs[j]], [mx, -1, mz]);
    }
    paint(ctx, PAL.oakDark); // aisle edging boards
    for (const s of [-1, 1]) box(ctx, X0 + 0.22, 0, ZC + s * 0.62 - 0.03, X1 - 0.22, 0.07, ZC + s * 0.62 + 0.03);
  }
  // the frosted skin
  paint(ctx, PAL.glass); skin(ctx, A, lod <= 2 ? 0.1 : 0.2, BASE + 0.05);
  // white steel: hoops, side rails, ridge + purlins, end mullions, door frames
  paint(ctx, PAL.white);
  const hw = lod <= 2 ? 0.075 : 0.1, full = [[-HW, BASE], ...A, [HW, BASE]];
  for (let x = X0; x <= X1 + 0.01; x += 2) for (let i = 0; i < full.length - 1; i++) beam(ctx, [x, full[i][1], ZC + full[i][0]], [x, full[i + 1][1], ZC + full[i + 1][0]], hw, hw, false);
  const ridgeIdx = lod <= 2 ? A.map((_, i) => i) : [0, Math.floor(A.length / 2), A.length - 1];
  for (const i of ridgeIdx) beam(ctx, [X0, A[i][1], ZC + A[i][0]], [X1, A[i][1], ZC + A[i][0]], 0.05, 0.05, false);
  for (const X of [X0, X1]) {
    for (const dz of [-2.5, -1.5, 1.5, 2.5]) beam(ctx, [X, BASE, ZC + dz], [X, topAt(A, dz), ZC + dz], 0.06, 0.06, false);
    for (const s of [-1, 1]) beam(ctx, [X, 0, ZC + s * DOOR], [X, DOORH, ZC + s * DOOR], 0.1, 0.1);
    const n = lod <= 2 ? 8 : 4; for (let i = 0; i < n; i++) { const a0 = Math.PI - (i / n) * Math.PI, a1 = Math.PI - ((i + 1) / n) * Math.PI; beam(ctx, [X, DOORH + DOOR * Math.sin(a0), ZC + DOOR * Math.cos(a0)], [X, DOORH + DOOR * Math.sin(a1), ZC + DOOR * Math.cos(a1)], 0.1, 0.1, false); }
    beam(ctx, [X, SIDE, ZC - HW], [X, SIDE, ZC - DOOR - 0.05], 0.06, 0.06, false); beam(ctx, [X, SIDE, ZC + DOOR + 0.05], [X, SIDE, ZC + HW], 0.06, 0.06, false);
  }
  // finials on the ridge ends
  lathe(ctx, [X0, topAt(A, 0), ZC], [[0.06, 0], [0.06, 0.1], [0.1, 0.2], [0, 0.42]], 6); lathe(ctx, [X1, topAt(A, 0), ZC], [[0.06, 0], [0.06, 0.1], [0.1, 0.2], [0, 0.42]], 6);
  // zinc gutters along both eaves + the downpipe to the water butt at the north-east corner
  paint(ctx, PAL.zinc);
  for (const s of [-1, 1]) beam(ctx, [X0 - 0.15, SIDE - 0.02, ZC + s * (HW + 0.09)], [X1 + 0.15, SIDE - 0.02, ZC + s * (HW + 0.09)], 0.13, 0.08);
  beam(ctx, [X1 + 0.1, SIDE - 0.02, ZC + HW + 0.09], [X1 + 0.1, 1.08, ZC + HW + 0.09], 0.07, 0.07);
  beam(ctx, [X1 + 0.1, 1.08, ZC + HW + 0.09], [70.95, 1.08, -29.85], 0.07, 0.07);
  beam(ctx, [70.95, 1.1, -29.85], [70.95, 0.98, -29.85], 0.07, 0.07);
  if (lod >= 3) return;
  // seedling shelves along both long walls
  for (const s of [-1, 1]) {
    const zo = ZC + s * (HW - 0.05), zi = ZC + s * (HW - 0.47);
    paint(ctx, PAL.oak);
    for (const y of [0.8, 1.15]) box(ctx, 47.1, y - 0.03, Math.min(zo, zi), 68.6, y, Math.max(zo, zi), false);
    for (let x = 47.15; x <= 68.6; x += 1.43) beam(ctx, [x, 0, zi], [x, 1.17, zi], 0.05, 0.05);
    for (const y of [0.8, 1.15]) for (let x = 47.3; x < 68.3; x += 0.52) {
      paint(ctx, PAL.tray); box(ctx, x, y, zi - s * 0.04, x + 0.4, y + 0.05, zo + s * 0.01, false);
      const kind = R();
      if (kind < 0.25) { paint(ctx, PAL.terra); for (let k = 0; k < 3; k++) lathe(ctx, [x + 0.07 + k * 0.13, y + 0.05, (zi + zo) / 2], [[0.035, 0], [0.05, 0.08], [0.055, 0.1]], 5); }
      paint(ctx, R() < 0.5 ? PAL.leaf : PAL.sage);
      for (let k = 0; k < 4; k++) for (let m = 0; m < 2; m++) gem(ctx, [x + 0.06 + k * 0.095, y + 0.09 + R() * 0.03, zi + (zo - zi) * (0.3 + m * 0.4)], 0.035, 0.035, 0.035, 3, R() * 3);
    }
  }
  // potting bench at the east end, south of the door
  paint(ctx, PAL.oak);
  box(ctx, 68.85, 0.86, -36.25, 69.65, 0.9, -34.25, false); box(ctx, 68.85, 0.3, -36.25, 69.65, 0.33, -34.25, false);
  box(ctx, 69.55, 0.9, -36.25, 69.65, 1.15, -34.25);
  for (const x of [68.9, 69.6]) for (const z of [-36.2, -34.3]) beam(ctx, [x, 0, z], [x, 0.86, z], 0.06, 0.06);
  paint(ctx, PAL.terra);
  const bp = [[69.1, -36.0, 0.9], [69.3, -35.7, 0.9], [69.1, -35.4, 0.9], [69.35, -35.1, 0.9], [69.1, -34.6, 0.9], [69.2, -35.9, 0.33], [69.2, -35.5, 0.33], [69.25, -35.1, 0.33]];
  for (const [x, z, y] of bp) lathe(ctx, [x, y, z], [[0.07, 0], [0.1, 0.14], [0.115, 0.14], [0.115, 0.17]], 7);
  for (let k = 0; k < 4; k++) lathe(ctx, [69.25, 0.33 + k * 0.05, -34.6], [[0.08, 0], [0.12, 0.15], [0.13, 0.17]], 7); // a nested stack
  paint(ctx, PAL.soil); box(ctx, 68.95, 0.9, -34.95, 69.45, 0.96, -34.35);
  paint(ctx, PAL.leaf); for (const [x, z, y] of bp) if (y > 0.5 && R() < 0.8) gem(ctx, [x, y + 0.22, z], 0.1, 0.09, 0.1, 5, R() * 3);
  paint(ctx, PAL.zinc); lathe(ctx, [69.2, 0.9, -34.0 - 0.28], [[0.09, 0], [0.1, 0.2], [0.02, 0.24]], 7); // watering can body
  // hanging baskets over the aisle edges
  for (const x of [50, 54, 58, 62, 66]) for (const s of [-1, 1]) {
    const z = ZC + s * 0.55, top = topAt(A, s * 0.55), rim = 2.5, c = [x, rim, z];
    paint(ctx, PAL.wire); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; beam(ctx, [x, top, z], [x + Math.cos(a) * 0.2, rim, z + Math.sin(a) * 0.2], 0.012, 0.012, false); }
    paint(ctx, PAL.wicker); lathe(ctx, [x, rim - 0.2, z], [[0, 0], [0.14, 0.04], [0.21, 0.13], [0.23, 0.2]], 8);
    paint(ctx, PAL.leaf); gem(ctx, [x, rim + 0.06, z], 0.24, 0.1, 0.24, 6, R());
    paint(ctx, PAL.leaf2);
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + R(), bx = x + Math.cos(a) * 0.21, bz = z + Math.sin(a) * 0.21, L = 0.25 + R() * 0.3;
      for (let m = 0; m < 3; m++) leaf(ctx, [bx + Math.cos(a) * 0.02 * m, rim - m * L / 3, bz + Math.sin(a) * 0.02 * m], [Math.cos(a) * 0.3, -1, Math.sin(a) * 0.3], L / 2.5, 0.08, [-Math.sin(a), 0, Math.cos(a)]); }
    paint(ctx, { col: ['oklch(0.72 0.16 350)', 'oklch(0.93 0.03 95)', 'oklch(0.66 0.14 300)'][(x + (s > 0 ? 1 : 0)) % 3], rough: 0.7 });
    for (let k = 0; k < 6; k++) { const a = R() * TAU, r = R() * 0.22; gem(ctx, [x + Math.cos(a) * r, rim + 0.1 + R() * 0.06, z + Math.sin(a) * r], 0.04, 0.03, 0.04, 4, R()); }
    for (let k = 0; k < 3; k++) { const a = R() * TAU; gem(ctx, [x + Math.cos(a) * 0.27, rim - 0.2 - R() * 0.25, z + Math.sin(a) * 0.27], 0.035, 0.03, 0.035, 3, R()); }
  }
});
export function collider(ctx) {
  origin(58, 0, -33);
  const A = arch(6);
  skin(ctx, A, 0.4, 0);
  box(ctx, 68.85, 0, -36.25, 69.65, 0.9, -34.25); // potting bench
}
