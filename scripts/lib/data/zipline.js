// The treehouse zip-line's tuned numbers (read by scripts/zipline.js). Distances m, speeds m/s, times s.
export const ZIP = {
  sag: 1.0,                   // the rope's dip at mid-span, metres (~5% of the 21 m run): drawn rope, guide line and ride all read it
  bunting: {                  // the festoon guide line hung beside the rope (never where the pulley runs)
    side: -1, offset: 0.45, drop: 0.12,       // which side of the rope (-1 = toward the lake-path view), metres out, metres under
    spacing: 0.46, every: 6, margin: 0.9,      // a slot every 0.46 m, each 6th a lantern, kept 0.9 m off the anchors
    flag: [0.26, 0.28],                        // pennant width along the line, drop
    colors: ['oklch(0.94 0.03 85)', 'oklch(0.68 0.09 190)', 'oklch(0.62 0.13 42)'], // cream, teal, terracotta
    glow: [2.6, 1.55, 0.5],                    // lantern emissive (HDR, the bloom reads it)
  },
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
