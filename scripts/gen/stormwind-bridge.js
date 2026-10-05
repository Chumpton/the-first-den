// Stormwind Canal Bridge: stone arch bridge over the water canals, cobblestone deck, balustrades, lanterns.
import { box, lathe, flat, stone, gold, glow, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const { len = 16, w = 9 } = ctx.params || {};
  const lod = L(ctx);
  const P = [0, 0, 0];
  const hw = w / 2;
  const hl = len / 2;

  // Bridge deck (arched roadway)
  stone(ctx);
  // Main arch bridge span
  box(P, -hw, 0.4, -hl, hw, 1.8, hl);

  // Parapet balustrades along both sides
  flat(ctx, RC.stone2);
  // Left parapet
  box(P, -hw, 1.8, -hl, -hw + 0.8, 3.0, hl);
  // Right parapet
  box(P, hw - 0.8, 1.8, -hl, hw, 3.0, hl);

  // Newel posts at four corners
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const px = sx * (hw - 0.4);
      const pz = sz * (hl - 0.5);
      box(P, px - 0.6, 1.6, pz - 0.6, px + 0.6, 3.4, pz + 0.6);
      gold(ctx);
      lathe(ctx, [[0.22, 3.4], [0, 3.8]], 4, px, 0, pz);
      stone(ctx);
    }
  }

  // Water Arch Opening underneath
  flat(ctx, 'oklch(0.2 0.01 40)');
  box(P, -hw - 0.1, -1.8, -4.5, hw + 0.1, 0.6, 4.5);
}
