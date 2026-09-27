// Your own horse (Z): every tuned number scripts/horse-summon.js and scripts/steed.js read.
export const STEED = {
  action: 'horse',                                  // Z: summon / get off
  coat: 'chestnut', blanket: 'oklch(0.52 0.1 200)', pad: 'oklch(0.72 0.06 85)',
  side: 2.4,                                        // m to the player's right it appears
  seat: { x: 0, y: 1.12, z: 0.05 },                 // rider's feet, horse-local (in the saddle)
  walk: 4.2, gallop: 12, reverse: 1.6,              // m/s
  accel: 5, gallopAccel: 7, brake: 9,               // m/s²
  turn: 120, gallopTurn: 70,                        // °/s
  wallProbe: 1.8, minGround: 0.25,                  // stop at walls; never walk into the river (ground below this)
  vanishAfter: 3,                                   // s after you get off, it trots away
  hooves: '/cdn/moodboard-lowpoly-cozy/sfx-horse-hooves-canter-cobblestone-loop.mp3',
  walkHooves: '/cdn/moodboard-lowpoly-cozy/sfx-horse-hooves-walk-soft-loop.mp3',
  whistle: '/cdn/moodboard-lowpoly-cozy/sfx-sharp-two-note-whistle-call.mp3',
  snort: '/cdn/moodboard-lowpoly-cozy/sfx-horse-soft-snort-whinny.mp3',
};
