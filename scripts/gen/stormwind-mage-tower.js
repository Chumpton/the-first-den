// The Wizard's Sanctum: soaring arcane spire, circular citadel base, spiral buttresses, conical slate roof, and floating crystal orb.
import { TAU, lathe, box, beam, stone, flat, gold, slate, glow, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const lod = L(ctx);
  const P = ctx;

  // Base circular citadel
  stone(ctx);
  lathe(ctx, [
    [12, 0], [12, 1.2], [10.5, 1.2], [10.5, 12], [11.2, 12.8], [11.2, 14.5]
  ], lod <= 2 ? 16 : 10, 0, 0, 0);

  // Middle tower shaft
  flat(ctx, RC.stone2);
  lathe(ctx, [
    [8.0, 14], [7.2, 26], [7.8, 27.2], [7.8, 29]
  ], lod <= 2 ? 16 : 10, 0, 0, 0);

  // Upper observation gallery & battlements
  stone(ctx);
  lathe(ctx, [
    [8.8, 29], [8.8, 31], [9.4, 31.5], [9.4, 33.5]
  ], lod <= 2 ? 16 : 10, 0, 0, 0);

  // Conical royal blue slate spire
  slate(ctx);
  lathe(ctx, [
    [7.5, 33.5], [0, 44]
  ], lod <= 2 ? 16 : 10, 0, 0, 0);

  // Gold spire peak & ring
  gold(ctx);
  lathe(ctx, [
    [0.35, 43.5], [0.35, 47], [0, 48.5]
  ], 6, 0, 0, 0);

  // Floating Arcane Crystal Orb / Portal at the pinnacle
  glow(ctx, 'oklch(0.65 0.22 300)', 1.5, 0.4, 2.2); // Pulsing arcane violet/magenta
  lathe(ctx, [
    [0, 49.5], [1.2, 50.8], [0, 52.1]
  ], 8, 0, 0, 0);

  // Arcane runic windows around middle shaft
  glow(ctx, 'oklch(0.7 0.18 240)', 0.5, 1.2, 2.5); // Arcane cyan
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2;
    const wx = Math.cos(angle) * 7.5;
    const wz = Math.sin(angle) * 7.5;
    box(P, wx - 0.6, 18, wz - 0.6, wx + 0.6, 22, wz + 0.6);
  }

  // Grand Arched Portal at base
  stone(ctx);
  box(P, -3.2, 0, -11.5, 3.2, 8.5, -10.2);
  flat(ctx, RC.blueDk);
  box(P, -2.2, 0, -11.6, 2.2, 7.2, -10.8);
  gold(ctx);
  box(P, -2.4, 7.2, -11.7, 2.4, 7.8, -10.7);
}
