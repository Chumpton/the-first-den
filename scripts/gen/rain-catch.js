// Rain catchment against the cob house's +X-facing wall. Origin = ground ~0.9 m out from the wall, local +Z = away from
// the wall, the wall plane at z -1.93, the eave fascia line at z -1.15 / y 4.3..4.75. params.kind "main" | "tap".
import { box, gem, Q } from '../lib/road-solid.js';
import { bar, pipe, cyl, lathe, paint, TX, INK } from './coop-kit.js';
const RC = { gx0: -7.45, gx1: 2.45, gy: 4.5, cz: -0.1, cr: 0.72, ch: 1.63, py: 0.42, bx: 1.4, bz: -0.15 };
function tap(ctx) {
  ctx.flat(); paint(ctx, null, INK.brass, 0.3, 0.85);
  pipe(ctx, [0, 0.08, -0.3], [0, 0.08, 0.01], 0.022, 6); pipe(ctx, [0, 0.1, 0], [0, 0, 0], 0.018, 6);
  if (ctx.lod <= 2) { pipe(ctx, [0, 0.08, -0.1], [0, 0.15, -0.1], 0.01, 5); gem(ctx, 0, 0.155, -0.1, 0.045, 0.008, 0.008, 6); }
}
function can(ctx, ox, oz) {
  const P = (x, y, z) => [ox + x, y, oz + z];
  paint(ctx, null, 'oklch(0.66 0.06 140)', 0.5, 0.4);
  cyl(ctx, ox, 0, oz, 0.12, 0.26, 10); pipe(ctx, P(0.09, 0.06, 0), P(0.33, 0.3, 0), 0.018, 6);
  paint(ctx, null, INK.brass, 0.35, 0.8); pipe(ctx, P(0.32, 0.29, 0), P(0.36, 0.33, 0), 0.04, 8);
  paint(ctx, null, 'oklch(0.66 0.06 140)', 0.5, 0.4);
  bar(ctx, P(-0.09, 0.25, 0), P(-0.05, 0.36, 0), 0.02); bar(ctx, P(-0.05, 0.36, 0), P(0.05, 0.36, 0), 0.02); bar(ctx, P(0.05, 0.36, 0), P(0.08, 0.25, 0), 0.02);
}
export function geometry(ctx) {
  if (ctx.params.kind === 'tap') return tap(ctx);
  const L = ctx.lod, n = L <= 2 ? 18 : 10; ctx.flat();
  // plinth
  paint(ctx, TX.stone, INK.white, 0.9);
  box(ctx, -0.9, -0.3, RC.cz - 0.85, 0.9, 0.34, RC.cz + 0.85); box(ctx, -0.95, 0.34, RC.cz - 0.9, 0.95, RC.py, RC.cz + 0.9);
  for (const s of [-1, 1]) box(ctx, s * RC.bx - 0.34, -0.2, RC.bz - 0.34, s * RC.bx + 0.34, 0.2, RC.bz + 0.34);
  // cistern: oak staves, iron hoops, conical lid
  const stave = (i) => paint(ctx, TX.oak, i % 2 ? INK.oak : 'oklch(0.9 0.04 70)', 0.8);
  lathe(ctx, 0, RC.cz, [[RC.cr, RC.py], [RC.cr - 0.03, RC.py + RC.ch]], n, stave);
  const top = RC.py + RC.ch;
  paint(ctx, TX.timber, INK.wood); cyl(ctx, 0, top, RC.cz, RC.cr + 0.02, 0.05, n); cyl(ctx, 0, top + 0.05, RC.cz, RC.cr + 0.01, 0.25, n, 0.12);
  paint(ctx, TX.oak, INK.oak); cyl(ctx, 0, top + 0.3, RC.cz, 0.12, 0.05, 8);
  // barrels
  for (const s of [-1, 1]) lathe(ctx, s * RC.bx, RC.bz, [[0.36, 0.2], [0.42, 0.42], [0.445, 0.7], [0.42, 0.98], [0.36, 1.2]], L <= 2 ? 14 : 8, stave);
  // gutter along the eave (copper U channel)
  paint(ctx, null, INK.copper, 0.35, 0.8);
  const g = RC.gy;
  box(ctx, RC.gx0, g - 0.13, -1.12, RC.gx1, g - 0.11, -0.92); box(ctx, RC.gx0, g - 0.13, -1.12, RC.gx1, g, -1.1); box(ctx, RC.gx0, g - 0.13, -0.94, RC.gx1, g - 0.01, -0.92);
  for (const x of [RC.gx0, RC.gx1 - 0.02]) box(ctx, x, g - 0.13, -1.12, x + 0.02, g - 0.01, -0.92);
  // downspout: outlet -> wall -> down the wall -> into the lid
  const pts = [[0, g - 0.12, -1.02], [0, 4.05, -1.8], [0, 2.75, -1.8], [0, 2.4, -0.62], [0, 2.18, -0.62]];
  for (let i = 0; i < pts.length - 1; i++) pipe(ctx, pts[i], pts[i + 1], 0.045, L <= 2 ? 8 : 5);
  // overflow pipes into the barrels
  for (const s of [-1, 1]) { pipe(ctx, [s * 0.66, 1.95, -0.12], [s * RC.bx, 1.95, -0.12], 0.035, 6); pipe(ctx, [s * RC.bx, 1.99, -0.12], [s * RC.bx, 1.18, -0.12], 0.035, 6); }
  if (L >= 4) return;
  paint(ctx, null, INK.iron, 0.5, 0.7);
  for (const y of [RC.py + 0.15, RC.py + RC.ch / 2, top - 0.15]) cyl(ctx, 0, y, RC.cz, RC.cr + 0.012 - (y - RC.py) * 0.018, 0.05, n);
  for (const s of [-1, 1]) for (const [y, r] of [[0.3, 0.405], [0.7, 0.457], [1.1, 0.4]]) cyl(ctx, s * RC.bx, y - 0.025, RC.bz, r, 0.05, L <= 2 ? 14 : 8);
  paint(ctx, TX.timber, 'oklch(0.8 0.03 60)'); for (const s of [-1, 1]) cyl(ctx, s * RC.bx, 1.2, RC.bz, 0.33, 0.012, L <= 2 ? 14 : 8);
  paint(ctx, null, INK.copper, 0.35, 0.8);
  for (const p of pts.slice(1, 4)) cyl(ctx, p[0], p[1] - 0.05, p[2], 0.058, 0.1, 8);
  for (const y of [3.5, 3.0]) bar(ctx, [0, y, -1.8], [0, y, -1.93], 0.03, 0.02);
  if (L <= 2) for (let x = RC.gx0 + 0.45; x < RC.gx1; x += 0.9) bar(ctx, [x, g + 0.005, -1.15], [x, g + 0.005, -0.92], 0.025, 0.008);
  paint(ctx, null, INK.brass, 0.3, 0.85); for (const s of [-1, 1]) pipe(ctx, [s * RC.bx, 0.35, RC.bz + 0.4], [s * RC.bx, 0.35, RC.bz + 0.52], 0.02, 6);
  // drain stone under the spigot, watering can, moss
  paint(ctx, TX.stone, INK.white, 0.9); box(ctx, -0.17, 0, 0.83, 0.17, 0.018, 1.17);
  paint(ctx, null, 'oklch(0.35 0.03 230)', 0.15); Q(ctx, [-0.1, 0.019, 0.9], [0.1, 0.019, 0.9], [0.1, 0.019, 1.1], [-0.1, 0.019, 1.1], [0, 0, 1]);
  can(ctx, 0.62, 1.12);
  if (L <= 2) { paint(ctx, null, 'oklch(0.55 0.11 135)', 0.95); for (const [x, z] of [[-0.9, 0.78], [0.93, 0.6], [-1.75, 0.2], [1.8, 0.1]]) gem(ctx, x, 0.02, z, 0.12, 0.07, 0.02, 5); }
}
export function collider(ctx) {
  if (ctx.params.kind === 'tap') return null;
  box(ctx, -0.95, 0, RC.cz - 0.9, 0.95, 2.35, RC.cz + 0.9);
  for (const s of [-1, 1]) box(ctx, s * RC.bx - 0.45, 0, RC.bz - 0.45, s * RC.bx + 0.45, 1.25, RC.bz + 0.45);
}
