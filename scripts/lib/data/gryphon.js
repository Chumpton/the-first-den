// Wynx, the player's gryphon (scripts/gryphon-mount.js rides her, scripts/wynx.js walks her beside you, player.js flies her)
export const GRY = {
  name: 'Wynx',
  action: 'mount',      // Z: call Wynx and climb on / hop off
  y: 0.0,               // her origin under the rider's feet (local): the saddle meets the seated hips
  paws: 1.15,           // how far her talons hang under her origin: the rider's height over the ground on her back
  groundMul: 2.4,       // ground riding: × walkSpeed (≈ 9 m/s)
  hop: 7, hopFall: 22,  // space on the ground: a pounce, m/s up and m/s² down
  boostAfter: 1.2,      // seconds of straight forward flight before she tucks her wings and speeds
  boost: 2.0,           // speed flight: × flySpeed
  hoverBelow: 3,        // m/s: under this she hovers
  side: 2.4,            // metres to your right she lands when you hop off
  follow: { right: 2.2, back: 2.4, walk: 5, run: 12, flyFrom: 14, lift: 2.5, blink: 70 },  // trailing you on foot
  sounds: {
    summon: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-screech-summon.mp3',
    flap: '/cdn/moodboard-lowpoly-cozy/sfx-big-wing-flaps-loop.mp3',
    rush: '/cdn/moodboard-lowpoly-cozy/sfx-high-speed-wind-rush-loop.mp3',
    land: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-landing-thump-wings-fold.mp3',
    leave: '/cdn/moodboard-lowpoly-cozy/sfx-gryphon-takeoff-cry.mp3',
  },
};
