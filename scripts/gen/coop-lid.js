// The nest box's hinged lid: hinge line along X at the origin (on the coop's front wall), sloping down to +Z.
// scripts/coop-nest.js tips it open (negative pitch lifts the +Z edge) when someone takes an egg.
import { solid } from '../lib/road-solid.js';
import { bar, paint, TX, INK } from './coop-kit.js';
export function geometry(ctx) {
  const w = 0.64, A = [[-w, 0, -0.02], [w, 0, -0.02], [w, -0.24, 0.56], [-w, -0.24, 0.56]], B = A.map((p) => [p[0], p[1] + 0.045, p[2]]);
  ctx.flat(); paint(ctx, TX.shingle, INK.wood); solid(ctx, A, B);
  if (ctx.lod >= 3) return;
  paint(ctx, TX.oak, INK.oak); bar(ctx, [-w, -0.2, 0.565], [w, -0.2, 0.565], 0.04, 0.06);
  paint(ctx, null, INK.iron, 0.5, 0.7);
  for (const x of [-0.4, 0.4]) bar(ctx, [x, 0.06, -0.03], [x, 0.03, 0.16], 0.05, 0.012);
  paint(ctx, null, INK.brass, 0.35, 0.8); bar(ctx, [0, -0.2, 0.595], [0, -0.14, 0.62], 0.12, 0.025);
}
export function collider() { return null; }
