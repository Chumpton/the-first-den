// Deeprun Tram station entrance: massive carved granite mountain portal, dwarven iron gear cogs, and tunnel tracks to Ironforge.
import { box, lathe, flat, stone, gold, glow, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const lod = L(ctx);
  const P = [0, 0, 0];

  // Heavy Granite Portal Facade
  stone(ctx, 'oklch(0.55 0.02 60)'); // Dark granite
  // Outer pillars & header
  box(P, -10, 0, -2, -6, 15, 6);
  box(P, 6, 0, -2, 10, 15, 6);
  box(P, -10, 12, -2, 10, 17, 6);

  // Stepped pediment atop portal
  box(P, -8, 17, -1.8, 8, 19.5, 5.8);
  box(P, -5, 19.5, -1.5, 5, 21.2, 5.5);

  // Tunnel interior void (dark stone arch)
  flat(ctx, 'oklch(0.2 0.01 40)');
  box(P, -6, 0, 0, 6, 12, 16);

  // Heavy Iron Dwarven Gear Cogs flanking the arch
  flat(ctx, RC.iron);
  for (const s of [-1, 1]) {
    const gx = s * 7.5;
    // Circular gear rim
    lathe(ctx, [[1.4, -0.4], [1.4, 0.4]], 10, gx, 10.5, -2.1);
    // Gear teeth
    for (let a = 0; a < 8; a++) {
      const angle = a * Math.PI / 4;
      const tx = gx + Math.cos(angle) * 1.6;
      const ty = 10.5 + Math.sin(angle) * 1.6;
      box(P, tx - 0.25, ty - 0.25, -2.3, tx + 0.25, ty + 0.25, -1.8);
    }
  }

  // Central Gold Dwarven Crest above tunnel
  gold(ctx);
  box(P, -1.8, 13.5, -2.2, 1.8, 16, -1.9);

  // Tram Iron Tracks leading into tunnel
  flat(ctx, RC.iron);
  box(P, -2.2, 0.02, -8, -1.9, 0.25, 16); // Left rail
  box(P, 1.9, 0.02, -8, 2.2, 0.25, 16);   // Right rail
  // Wooden Sleepers
  flat(ctx, RC.wood);
  for (let z = -7; z <= 15; z += 1.6) {
    box(P, -2.8, 0, z - 0.18, 2.8, 0.12, z + 0.18);
  }

  // Glowing Industrial Torches
  glow(ctx, 'oklch(0.78 0.16 65)', 2.0, 0.9, 0.2); // Warm orange flame
  box(P, -6.5, 8.5, -2.4, -6.1, 9.5, -2.0);
  box(P, 6.1, 8.5, -2.4, 6.5, 9.5, -2.0);
}
