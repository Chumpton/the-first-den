// Rowboat tuning: every number the dock rowboat reads.
export const BOAT = {
  home: { x: 4, z: -72 },       // lake centre it keeps near
  maxRange: 44,                 // m from home
  waterY: -0.02,                // hull sits here (lake level 0)
  hull: 1.0,                    // m probe out from centre for shallows
  shallow: -0.35,               // ground higher than this = too shallow to row
  dryGround: 0.25,              // ground higher than this = dry enough to step onto
  shoreReach: 4.0,              // m it looks for a shore when you press E
  dockStep: { x: 4.3, y: 0.92, z: -60 }, // dock boards beside the mooring, where you step out
  dockReach: 4.5,
  seat: { x: 0, y: 0.24, z: -0.95 },     // rider's feet on the stern thwart, boat-local
  speed: 4.2, reverse: 1.6, accel: 2.2, drag: 1.1, turnRate: 55,
  lapLoop: '/cdn/moodboard-lowpoly-cozy/sfx-rowboat-oars-water-lapping-loop.mp3',
  bump: '/cdn/moodboard-lowpoly-cozy/sfx-wooden-rowboat-knock.mp3',
};
