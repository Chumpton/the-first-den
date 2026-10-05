// The Great Gates of Stormwind: massive twin bastion towers, arched gatehouse, portcullis, crenellated ramparts.
import { TAU, XF, box, lathe, obox, beam, stone, flat, gold, slate, crenels, L, archWall, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const lod = L(ctx);
  const P = ctx;

  // Materials
  stone(ctx);

  // Twin Bastion Towers (West and East, at x = -8 and x = 8)
  for (const s of [-1, 1]) {
    const tx = s * 8.5;
    // Octagonal / Round Bastion Tower
    lathe(ctx, [
      [4.8, 0], [4.8, 18], [5.2, 18.5], [5.2, 21.5]
    ], lod <= 2 ? 12 : 8, tx, 0, 0);

    // Crenels on top of towers
    crenels(P, tx - 4.5, tx + 4.5, 21.5, -4.5, 4.5, 1.2, 0.8, 1.3);

    // Conical turret roof inside battlements
    slate(ctx);
    lathe(ctx, [
      [3.8, 21.5], [0, 28]
    ], lod <= 2 ? 12 : 8, tx, 0, 0);

    // Gold spire finial
    gold(ctx);
    lathe(ctx, [[0.2, 28], [0, 30.5]], 4, tx, 0, 0);

    stone(ctx);
  }

  // Central Arched Gatehouse Wall
  const ARCH = { cx: 0, w: 7.5, sill: 0, spring: 6.5, pointed: 1 };
  archWall(P, -4.5, 4.5, 0, 16.5, -3.5, 3.5, [ARCH], lod <= 2 ? 10 : 5);

  // Rampart walkway over the gate
  flat(ctx, RC.stone2);
  box(P, -4.5, 15, -4.0, 4.5, 16.5, 4.0);
  crenels(P, -4.5, 4.5, 16.5, -4.0, -3.2, 1.1, 0.8, 1.2);
  crenels(P, -4.5, 4.5, 16.5, 3.2, 4.0, 1.1, 0.8, 1.2);

  // Iron Portcullis in the archway
  flat(ctx, RC.iron);
  for (let x = -3.2; x <= 3.2; x += 0.8) {
    box(P, x - 0.08, 3.5, -0.1, x + 0.08, 11, 0.1);
  }
  for (let y = 4.5; y <= 10.5; y += 1.5) {
    box(P, -3.5, y - 0.08, -0.12, 3.5, y + 0.08, 0.12);
  }

  // Stone lion crest keystone
  gold(ctx);
  box(P, -0.8, 12.5, -3.7, 0.8, 14.5, -3.4);
}
