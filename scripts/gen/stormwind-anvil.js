// The Great Anvil of Stormwind Dwarven District: giant stone forge hearth, roaring coals, massive iron anvil.
import { box, lathe, flat, stone, glow, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const lod = L(ctx);
  const P = [0, 0, 0];

  // Circular Stone Hearth Base
  stone(ctx, 'oklch(0.5 0.02 50)');
  lathe(ctx, [[3.6, 0], [3.6, 0.8], [3.2, 0.8], [3.2, 1.2]], lod <= 2 ? 14 : 8, 0, 0, 0);

  // Burning charcoal forge bed
  glow(ctx, 'oklch(0.7 0.22 45)', 2.2, 0.7, 0.1);
  lathe(ctx, [[2.8, 0.9], [0, 1.15]], 10, 0, 0, 0);

  // Massive Oak Block in center
  flat(ctx, RC.wood);
  box(P, -1.2, 0.8, -1.2, 1.2, 2.2, 1.2);

  // Giant Iron Anvil
  flat(ctx, RC.iron);
  // Anvil base
  box(P, -1.4, 2.2, -0.9, 1.4, 2.6, 0.9);
  // Anvil waist
  box(P, -0.9, 2.6, -0.6, 0.9, 3.2, 0.6);
  // Anvil face / table
  box(P, -1.5, 3.2, -0.85, 1.2, 3.8, 0.85);
  // Anvil horn (tapering conical horn)
  lathe(ctx, [[0.6, 1.2], [0, 2.6]], 6, 0, 0, 0); // rotated in horn pos
  box(P, 1.2, 3.35, -0.55, 2.4, 3.75, 0.55);
}
