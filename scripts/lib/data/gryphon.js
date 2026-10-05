// The flight gryphon's numbers (scripts/gryphon-mount.js, player.js flight, camera.js)
export const GRY = {
  y: 0.0,              // the gryphon's feet under the rider's feet (local): the saddle meets the seated hips
  paws: 1.15,          // how far its talons hang under its origin: the clearance that lands it
  boostAfter: 1.2,     // seconds of straight forward flight before it tucks its wings and dives forward
  boost: 2.0,          // speed flight: × flySpeed
  hoverBelow: 3,       // m/s: under this it hovers (big slow beats)
  linger: 6,           // seconds it stands landed beside you before it takes off and leaves
  side: 2.4,           // metres to the rider's right it lands
  sounds: {
    summon: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-screech-summon.mp3',
    flap: '/cdn/moodboard-lowpoly-cozy/sfx-big-wing-flaps-loop.mp3',
    rush: '/cdn/moodboard-lowpoly-cozy/sfx-high-speed-wind-rush-loop.mp3',
    land: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-landing-thump-wings-fold.mp3',
    leave: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-takeoff-cry.mp3',
  },
};
