// Valley of Heroes monument: grand stepped marble plinth, hero statue with signature weapon, and alliance crest.
import { TAU, box, lathe, beam, stone, flat, gold, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const { hero = 'turalyon' } = ctx.params || {};
  const lod = L(ctx);
  const P = ctx;

  // Stepped Plinth
  flat(ctx, RC.stone2);
  box(P, -2.4, 0, -2.4, 2.4, 0.4, 2.4);
  box(P, -2.0, 0.4, -2.0, 2.0, 0.9, 2.0);
  stone(ctx);
  box(P, -1.6, 0.9, -1.6, 1.6, 3.8, 1.6);
  flat(ctx, RC.stone2);
  box(P, -1.8, 3.8, -1.8, 1.8, 4.3, 1.8);

  // Gold trim on plinth
  gold(ctx);
  box(P, -1.65, 3.6, -1.65, 1.65, 3.8, 1.65);
  box(P, -1.65, 0.9, -1.65, 1.65, 1.1, 1.65);

  // Statue Body (Marble Hero)
  stone(ctx, 'oklch(0.92 0.015 80)');
  // Feet & Boots
  box(P, -0.6, 4.3, -0.4, -0.15, 5.0, 0.4);
  box(P, 0.15, 4.3, -0.4, 0.6, 5.0, 0.4);
  // Greaves & Legs
  box(P, -0.55, 5.0, -0.3, -0.18, 6.4, 0.3);
  box(P, 0.18, 5.0, -0.3, 0.55, 6.4, 0.3);
  // Torso / Plate Cuirass
  box(P, -0.7, 6.4, -0.45, 0.7, 8.2, 0.45);
  // Cape flowing back
  flat(ctx, RC.blue);
  box(P, -0.85, 5.2, 0.42, 0.85, 8.2, 0.65);
  stone(ctx, 'oklch(0.92 0.015 80)');

  // Shoulders (Pauldrons)
  box(P, -1.2, 7.8, -0.55, -0.65, 8.7, 0.55);
  box(P, 0.65, 7.8, -0.55, 1.2, 8.7, 0.55);
  // Head & Helmet
  lathe(ctx, [[0.38, 8.2], [0.38, 9.1], [0.1, 9.4]], lod <= 2 ? 8 : 6, 0, 0, 0);

  // Hero Weapons
  gold(ctx);
  if (hero === 'turalyon' || hero === 'danath') {
    // Greatsword held pointing down / resting on ground
    box(P, -0.12, 4.3, -0.8, 0.12, 7.5, -0.65); // Blade
    box(P, -0.6, 7.5, -0.85, 0.6, 7.7, -0.6);   // Crossguard
    box(P, -0.08, 7.7, -0.8, 0.08, 8.5, -0.65);  // Hilt & Pommel
  } else if (hero === 'khadgar') {
    // Archmage Staff (Atiesh) with glowing top
    lathe(ctx, [[0.08, 4.3], [0.08, 9.6]], 6, 0.7, 0, -0.5);
    lathe(ctx, [[0.28, 9.6], [0, 10.2]], 6, 0.7, 0, -0.5);
    flat(ctx, 'oklch(0.7 0.18 240)'); // Arcane crystal glow
    lathe(ctx, [[0.22, 10.1], [0, 10.6]], 6, 0.7, 0, -0.5);
  } else if (hero === 'alleria') {
    // Elven Longbow
    box(P, -0.85, 5.0, -0.7, -0.75, 8.8, -0.55);
  } else if (hero === 'kurdran') {
    // Stormhammer
    lathe(ctx, [[0.1, 5.5], [0.1, 7.8]], 6, 0.7, 0, -0.5);
    box(P, 0.4, 7.4, -0.75, 1.0, 8.0, -0.25);
  }
}
