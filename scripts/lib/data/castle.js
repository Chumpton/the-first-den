// The castle keep that replaced the timber den (2026-09-27, owner's ask). Every castle number lives here.
// Angles are degrees about the keep's centre: x = cos a, z = sin a. 270 faces the lake (−Z).
export const KEEP = {
  center: { x: 2, y: 24, z: 3 },   // ground-floor level = HOME.floorY
  r: 7, ri: 6,                      // outer face, inner face: one-metre walls
  segments: 72,                     // 5° a segment; openings centre on 2.5 + 5k
  floors: 5, floorH: 4.2, slab: 0.3, footing: 0.6, rise: 0.19,
  sill: 1.0, windowH: 1.6, windowW: 6,
  parapet: 1.05, merlon: 0.75,
  shaft: 2.35,                      // the stairwell hole in every upper floor
  inner: { r0: 0.35, r1: 2.2, startA: 92.5, exitBefore: 22, exitAfter: 38 },
  outer: { r1: 8.45, turns: 1.75, endA: 245, startDrop: 0.45, gapW: 12 },
  doors: [
    { id: "gate", a: 272.5, w: 14, h: 2.8 },          // the great door, facing the lake and the terrace
    { id: "square", a: 322.5, w: 12, h: 2.5 },        // the side door that shows the square and crosses to it
    { id: "back", a: 97.5, w: 12, h: 2.6 }            // the back door, uphill toward the gateway arch
  ],
  windows: [
    [132.5, 227.5],
    [2.5, 62.5, 152.5, 212.5, 302.5],
    [32.5, 92.5, 182.5, 242.5, 302.5],
    [2.5, 62.5, 122.5, 182.5, 262.5],
    [22.5, 82.5, 142.5, 202.5, 262.5, 322.5]
  ],
  rooms: ["Great Hall", "Library", "Bedchamber", "Workshop", "Lookout"],
  stoneTex: "cdn/texture-weathered-pale-limestone-ashlar-blocks.png",
  stepTex: "cdn/texture-worn-grey-flagstone.png",
  floorTex: "cdn/texture-honey-oak-floor-planks.png",
  stone: "oklch(0.95 0.015 85)", stepStone: "oklch(0.93 0.01 80)", wood: "oklch(0.95 0.03 70)",
  iron: "oklch(0.32 0.01 60)", glass: "oklch(0.85 0.04 210)"
};
export const keepPoint = (r, a, y = 0) => ({ x: KEEP.center.x + Math.cos(a * Math.PI / 180) * r, y: KEEP.center.y + y, z: KEEP.center.z + Math.sin(a * Math.PI / 180) * r });
