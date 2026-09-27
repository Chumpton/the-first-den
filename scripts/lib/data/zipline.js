// The treehouse zip-line's tuned numbers (read by scripts/zipline.js). Distances m, speeds m/s, times s.
export const ZIP = {
  hang: 0.95,                 // the handle bar hangs this far under the rope (the trolley row's origin is the bar)
  seat: { x: 0, y: -1.45, z: 0.15 }, // rider's feet, trolley-local
  startAt: 0.4,               // rest spot, metres along the rope from the launch A-frame
  g: 9.8, grip: 1.25, drag: 0.01, vStart: 1.8, vMax: 12,
  brakeDist: 5, brakeRate: 1.8, landV: 2,   // the last metres ease down to landV
  returnDelay: 3, returnSpeed: 5,
  zing: '/cdn/moodboard-lowpoly-cozy/sfx-zipline-rope-zing-wind-whoosh-loop.mp3', zingGain: 0.34,
  release: '/cdn/moodboard-lowpoly-cozy/sfx-zipline-pulley-clack-release.mp3',
  thud: '/cdn/moodboard-lowpoly-cozy/sfx-soft-landing-thud-in-sand.mp3',
};
