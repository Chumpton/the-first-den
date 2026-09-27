// Violet, the purple dragon by the wizard tower: every tuned number of her rest, her autopilot tour and the rider's chase camera.
export const PD = {
  kind: 'purple-dragon',
  // riding (dragon-local; the rider's feet sit on the saddle top)
  seat: { x: 0, y: 2.52, z: -0.35 }, stepOff: 3.4, mountWaitMs: 3000,
  // children (dragon-local)
  promptAt: { x: 0, y: 3.1, z: -3.9 }, promptNear: 7.5,
  breathAt: { x: 0, y: 4.62, z: -4.72 }, trailAt: { x: 0, y: 1.2, z: 3.2 },
  // the tour: a closed Catmull-Rom loop through these points [x, y, z] (point 0 is replaced by the hover over her sit spot)
  route: [[31.3, 24, -7.6], [44, 32, -7], [60, 34, -40.4], [42, 32, -72], [20, 36, -104.5], [-8, 34, -130], [-38, 32, -82],
    [-72, 34, -43.5], [-30, 28, -26], [0, 32, -26], [0.25, 26, 5], [18, 24, -1]],
  loopSeconds: 66,                     // time on the loop itself; takeoff + landing add ~12 s
  speed: { min: 6, max: 18, slope: 22, ramp: 30, brake: 40, end: 3.5 },
  minClear: 8,                         // never lower than ground + this on the loop
  obstacles: [                         // { x, z, r: keep-away radius, top: height to clear by obstacleClear }
    { x: 44, z: -7, r: 10, top: 18 }, { x: 60, z: -40.4, r: 10, top: 18.2 }, { x: 20, z: -104.5, r: 10, top: 18.2 },
    { x: -72, z: -43.5, r: 10, top: 18.2 }, { x: 30.5, z: -18.5, r: 9.4, top: 27.2 }, { x: 0, z: -26, r: 15, top: 14.1 }],
  obstacleClear: 9, maxSlope: 0.35,
  takeoff: 5.5, landRate: 4.5, landMin: 6,   // takeoff seconds; landing sink m/s (at least landMin seconds)
  homeSpeed: 14, homeAlt: 36, homeNear: 5,   // E / space mid-flight: fly home at homeAlt, then hover down
  bankPerDegS: 0.8, maxBank: 32, maxPitch: 16, attitudeEase: 2.5,
  flapPeriod: 1.1,
  sounds: {
    flap: '/cdn/moodboard-painterly-fantasy/sfx-dragon-wing-flap-heavy.mp3', flapGain: 0.55,
    roar: '/cdn/moodboard-painterly-fantasy/sfx-dragon-soft-roar.mp3', roarGain: 0.8,
    wind: '/cdn/moodboard-painterly-fantasy/sfx-high-altitude-wind-loop.mp3', windGain: 0.32,
  },
  cam: { dist: 11, pitch: -0.3, aimUp: 1.3, headRate: 2.2, recenter: 1.2, rest: 0.8, sens: 3 },
};
