// The jade dragon's every tuned number: flight, landing, the saddle, the prompt, sounds and its two body clips.
export const DRAGON = {
  id: 'jade-dragon',
  keep: { x: 2, z: 3 }, maxRange: 700,          // never farther than this from the keep (m)
  seaLevel: 0,                                    // the lake's surface; it never rests on water
  // speeds, m/s and m/s²
  cruise: 18, boost: 30, boostAfter: 1.2,         // hold W: cruise; keep holding past boostAfter s: boost
  coast: 6, accel: 8, boostAccel: 14, decel: 12,  // no key: drift down to coast; S brakes to a hover
  climb: 9, dive: 13, strafe: 7, response: 2.2,   // space / shift / a-d; response = how fast velocity meets intent (1/s)
  // steering, degrees
  turnGain: 1.8, turnRate: 80,                    // heading eases toward the rider's look, capped °/s
  pitchFollow: 0.85, maxPitch: 40, pitchEase: 2.4, climbPitch: 14,
  bankPerTurn: 0.5, strafeBank: 18, maxBank: 40, bankEase: 3,
  // ground and limits, metres above the ground under it
  minAlt: 3, maxAlt: 140, takeoffRate: 6, probeRadius: 0.8, probeLift: 1.0, probeAhead: 2.5,
  landSink: 7, landDrift: 1.4, settleRate: 3, shoreSpeed: 10, shoreHover: 6,
  // riding
  seat: { x: 0, y: 1.12, z: 0.2 },                // rider's feet, dragon-local
  seatEye: { x: 0, y: 2.2, z: 0.25 },             // first-person eye, dragon-local
  stepOff: 2.5, mountWaitMs: 3000,
  // children, dragon-local
  promptAt: { x: 0, y: 2.1, z: 0 }, promptNear: 5,
  breathAt: { x: 0, y: 1.45, z: -3.05 }, trailAt: { x: 0, y: 0.35, z: 10.6 },
  // sounds
  windLoop: '/cdn/moodboard-lowpoly-cozy/sfx-dragon-wind-rush-loop.mp3', windGain: 0.1, windBoostGain: 0.2, windRange: 45,
  rumble: '/cdn/moodboard-lowpoly-cozy/sfx-dragon-friendly-rumble.mp3', rumbleGain: 0.7,
  swoosh: '/cdn/moodboard-lowpoly-cozy/sfx-dragon-body-swoosh-boost.mp3', swooshGain: 0.45,
  // body clips (degrees): rest = coiled, head raised, a slow sway; fly = a travelling S-wave
  rest: { period: 6, coil: 24, sway: 3, wave: 0.5, neck: 38, head: -30, bob: 2.5 },
  fly:  { period: 1.7, amp: 10, grow: 0.8, wave: 0.7, lift: 2, neck: 4, head: -4, boostSpeed: 1.5 },
  // body layout shared with the geometry (m)
  spine: { bones: 12, spacing: 0.85 },
};
