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
// Fishing from the rowboat (key 2): cast, wait for the bite, 2 again to hook it, then hold the catch up overhead.
const S = '/cdn/moodboard-lowpoly-cozy/';
export const FISH = {
  maxSpeed: 0.8,                     // m/s: slower than this you can cast
  castAt: { x: 0.9, z: 5.2 },         // boat-local spot the bobber lands (bow is +z)
  rodHand: { x: 0.28, y: 0.72, z: -0.62 }, rodPitch: -38, rodYaw: 8, // rod butt in the rider's lap, tilted up over the bow
  tip: { x: 0.54, y: 1.86, z: 0.9 },  // where the rod tip ends up, boat-local (the line starts here)
  castDelay: 0.55,                    // s from the swing to the splash
  wait: [2.5, 6.5],                   // s until a bite
  window: 1.4,                        // s to press 2 once the bobber dips
  present: 3.2,                       // s the catch is held overhead
  overhead: { x: 0, y: 1.72, z: -0.95 }, // boat-local, just above the seated rider's head
  catches: [
    { w: 40, kind: 'perch', name: 'a Perch', color: '#b9d77a', fish: true },
    { w: 24, kind: 'trout', name: 'a Speckled Trout', color: '#8fd0d6', fish: true },
    { w: 16, kind: 'carp', name: 'a Fat Carp', color: '#e0b36a', fish: true },
    { w: 12, kind: 'boot', name: 'an Old Boot', color: '#b8bcc0', fish: false },
    { w: 5, kind: 'koi', name: 'the Golden Koi', color: '#ffd24a', fish: true, rare: true },
  ],
  sfx: {
    cast: S + 'sfx-fishing-rod-whip-line-cast.mp3',
    plop: S + 'sfx-small-fish-plop-water-splash.mp3',
    bite: S + 'sfx-fishing-bobber-dip-bloop.mp3',
    fanfare: S + 'sfx-treasure-get-fanfare-short-triumphant-jingle.mp3',
    boot: S + 'sfx-comedic-deflated-womp-womp.mp3',
    miss: S + 'sfx-fishing-line-slack-reel-whirr.mp3',
  },
  clip: { cast: 'cdn/clip-cast.glb', present: 'cdn/clip-victory.glb' },
};
