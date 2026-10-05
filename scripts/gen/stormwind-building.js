// Stormwind City blockout building kit: pale limestone walls, royal blue slate pitched roofs, timber trim, entrance doors, and Alliance styling.
import { box, lathe, flat, stone, slate, gold, glow, L, RC } from '../lib/royal-kit.js';

export function geometry(ctx) {
  const {
    w = 14,
    d = 12,
    h = 8.5,
    roofStyle = 'gable',
    floors = 2,
    hasPorch = false,
    color = 'limestone',
    hasChimney = true,
  } = ctx.params || {};

  const lod = L(ctx);
  const P = ctx;
  const hw = w / 2;
  const hd = d / 2;

  // Main Wall Material
  if (color === 'granite') {
    stone(ctx, 'oklch(0.6 0.02 55)'); // Dwarven District dark granite
  } else if (color === 'timber') {
    flat(ctx, 'oklch(0.5 0.06 60)');  // Old Town timber/plaster
  } else {
    stone(ctx, RC.stone);             // Classic Stormwind white limestone
  }

  // Main Building Block
  box(P, -hw, 0, -hd, hw, h, hd);

  // Plinth / Ground Skirting
  flat(ctx, RC.stone2);
  box(P, -hw - 0.2, 0, -hd - 0.2, hw + 0.2, 0.6, hd + 0.2);

  // Timber / Stone Cornice between floors
  if (floors >= 2) {
    const floorH = h / floors;
    for (let f = 1; f < floors; f++) {
      const fy = f * floorH;
      flat(ctx, RC.stone2);
      box(P, -hw - 0.15, fy - 0.15, -hd - 0.15, hw + 0.15, fy + 0.15, hd + 0.15);
    }
  }

  // Windows
  glow(ctx, 'oklch(0.75 0.14 75)', 0.5, 0.35, 0.1); // Warm interior candlelight
  const nWindowsX = Math.max(1, Math.floor(w / 4));
  const stepX = w / (nWindowsX + 1);
  for (let f = 0; f < floors; f++) {
    const wy = 1.6 + f * (h / floors);
    // Front windows (facing -Z)
    for (let i = 1; i <= nWindowsX; i++) {
      const wx = -hw + i * stepX;
      // Skip window if door is there
      if (f === 0 && Math.abs(wx) < 1.8) continue;
      box(P, wx - 0.65, wy, -hd - 0.06, wx + 0.65, wy + 1.6, -hd);
    }
  }

  // Front Entrance Door (at ground level, facing -Z)
  flat(ctx, RC.wood);
  box(P, -1.3, 0, -hd - 0.08, 1.3, 3.2, -hd);
  // Stone door frame
  flat(ctx, RC.stone2);
  box(P, -1.6, 0, -hd - 0.12, -1.3, 3.5, -hd);
  box(P, 1.3, 0, -hd - 0.12, 1.6, 3.5, -hd);
  box(P, -1.6, 3.2, -hd - 0.12, 1.6, 3.6, -hd);
  // Gold door handle / studs
  gold(ctx);
  box(P, 0.7, 1.4, -hd - 0.14, 0.9, 1.7, -hd - 0.08);

  // Roof Structure
  slate(ctx);
  const roofOverhang = 0.6;
  const rh = Math.min(8.0, Math.max(4.0, d * 0.45));

  if (roofStyle === 'gable') {
    // Gable Roof along X axis (pitching down North and South)
    const topY = h + rh;
    // North and South roof slopes
    ctx.quad(-hw - roofOverhang, h - 0.2, -hd - roofOverhang, -hw - roofOverhang, topY, 0, hw + roofOverhang, topY, 0, hw + roofOverhang, h - 0.2, -hd - roofOverhang);
    ctx.quad(hw + roofOverhang, h - 0.2, hd + roofOverhang, hw + roofOverhang, topY, 0, -hw - roofOverhang, topY, 0, -hw - roofOverhang, h - 0.2, hd + roofOverhang);

    // Gable triangular end walls
    stone(ctx);
    ctx.tri(-hw, h, -hd, -hw, topY - 0.1, 0, -hw, h, hd);
    ctx.tri(hw, h, hd, hw, topY - 0.1, 0, hw, h, -hd);

    // Gold ridge cresting
    gold(ctx);
    box(P, -hw - roofOverhang, topY, -0.15, hw + roofOverhang, topY + 0.35, 0.15);

  } else if (roofStyle === 'flat') {
    // Parapet / Flat roof with crenellations
    flat(ctx, RC.stone2);
    box(P, -hw, h, -hd, hw, h + 1.2, hd);
    // Corner merlons
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box(P, sx * hw - 0.8, h + 1.2, sz * hd - 0.8, sx * hw + 0.8, h + 2.2, sz * hd + 0.8);
      }
    }
  }

  // Stone Chimney
  if (hasChimney) {
    stone(ctx, 'oklch(0.7 0.02 60)');
    const cx = hw - 2.0;
    const cz = hd - 2.0;
    box(P, cx - 0.9, h, cz - 0.9, cx + 0.9, h + rh + 1.5, cz + 0.9);
    // Chimney pot
    flat(ctx, RC.iron);
    lathe(ctx, [[0.35, h + rh + 1.5], [0.45, h + rh + 2.2]], 6, cx, 0, cz);
  }

  // Optional Front Porch / Awning
  if (hasPorch) {
    flat(ctx, RC.wood);
    // Porch posts
    box(P, -2.5, 0, -hd - 2.2, -2.2, 3.2, -hd - 1.9);
    box(P, 2.2, 0, -hd - 2.2, 2.5, 3.2, -hd - 1.9);
    // Porch roof
    slate(ctx);
    ctx.quad(-2.8, 3.0, -hd - 2.5, -2.8, 4.0, -hd, 2.8, 4.0, -hd, 2.8, 3.0, -hd - 2.5);
  }
}
