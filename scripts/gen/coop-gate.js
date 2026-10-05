// The run's gate leaf: hinge at the origin, leaf out along +X (1.08 m), feet at the ground. Kinematic; scripts/coop-gate.js swings it.
import { box } from '../lib/road-solid.js';
import { bar, wires, paint, TX, INK } from './coop-kit.js';
import { softened } from "./soften.js";
const W = 1.08, H = 2.0;
export const geometry = softened(function geometry(ctx) {
  const L = ctx.lod; ctx.flat();
  paint(ctx, TX.oak, INK.oak);
  box(ctx, 0, 0.06, -0.025, 0.07, H, 0.025); box(ctx, W - 0.07, 0.06, -0.025, W, H, 0.025);
  box(ctx, 0.07, H - 0.08, -0.025, W - 0.07, H, 0.025); box(ctx, 0.07, 0.06, -0.025, W - 0.07, 0.16, 0.025); box(ctx, 0.07, 0.95, -0.025, W - 0.07, 1.03, 0.025);
  if (L >= 4) return;
  bar(ctx, [0.1, 0.16, 0], [W - 0.1, 0.95, 0], 0.06, 0.045); bar(ctx, [0.1, 1.03, 0], [W - 0.1, H - 0.08, 0], 0.06, 0.045);
  if (L <= 2) { paint(ctx, null, INK.galv, 0.45, 0.6); wires(ctx, [0.07, -0.03], [W - 0.07, -0.03], 0.16, H - 0.08, L === 1 ? 0.13 : 0.26, 0.008); }
  paint(ctx, null, INK.iron, 0.5, 0.7);
  for (const y of [0.35, 1.7]) box(ctx, -0.02, y, -0.035, 0.32, y + 0.05, 0.035);
  box(ctx, W - 0.02, 0.98, -0.05, W + 0.07, 1.02, 0.05);
});
export function collider(ctx) { box(ctx, 0, 0.06, -0.04, W, H, 0.04); }
