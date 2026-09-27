// Wild mushrooms: every number the clusters, their picking and their placement use.
// kinds: name (the +1 label), css (label + HUD dot), rgb (pick-pop spores, linear 0..1), weight (placement share),
// respawn [min,max] seconds, stem/cap colours and sizes (m) for scripts/gen/wild-mushroom.js.
export const MUSHROOMS = {
  sound: { pluck: '/cdn/moodboard-lowpoly-cozy/sfx-mushroom-pluck-soft-pop.mp3', volume: 0.45, pitchMin: 0.92, pitchMax: 1.1, maxDistance: 14 },
  label: { size: 0.9, lifetime: 1.6, rise: 0.45 },
  flash: { duration: 0.28, intensity: 0.18 },
  hideDelay: 0.08,
  visibleRange: { min: 0, max: 70 },
  pad: { radius: 0.5, tint: 'oklch(0.8 0.1 128)', litter: ['oklch(0.66 0.11 60)', 'oklch(0.55 0.1 45)', 'oklch(0.74 0.12 80)'] },
  sizeScale: 1.35,
  kinds: {
    bolete:      { name: 'Bolete',           css: '#c08850', rgb: [0.75, 0.52, 0.3],  weight: 30, respawn: [120, 180], shape: 'bolete',  stem: 'oklch(0.9 0.04 85)',  cap: 'oklch(0.52 0.09 55)',  h: 0.13, r: 0.11, stemR: 0.045 },
    agaric:      { name: 'Fly Agaric',       css: '#e8503a', rgb: [0.95, 0.3, 0.2],   weight: 28, respawn: [120, 180], shape: 'dome',    stem: 'oklch(0.95 0.02 90)', cap: 'oklch(0.6 0.2 30)',    h: 0.2,  r: 0.1,  stemR: 0.022, spots: 'oklch(0.97 0.01 90)' },
    chanterelle: { name: 'Chanterelle',      css: '#f2b640', rgb: [1.0, 0.72, 0.25],  weight: 16, respawn: [150, 210], shape: 'funnel',  stem: 'oklch(0.82 0.14 80)', cap: 'oklch(0.8 0.15 78)',   h: 0.1,  r: 0.075, stemR: 0.02 },
    deceiver:    { name: 'Amethyst Deceiver', css: '#b07ae0', rgb: [0.62, 0.4, 0.9],  weight: 16, respawn: [150, 210], shape: 'flat',    stem: 'oklch(0.62 0.12 305)', cap: 'oklch(0.55 0.16 305)', h: 0.13, r: 0.055, stemR: 0.011 },
    moon:        { name: 'Moon-cap',         css: '#7cc8ff', rgb: [0.45, 0.8, 1.0],   weight: 8,  respawn: [200, 240], shape: 'dome',    stem: 'oklch(0.92 0.04 220)', cap: 'oklch(0.72 0.12 235)', h: 0.17, r: 0.085, stemR: 0.018, glow: [0.16, 0.42, 0.75], rare: true, mote: true },
  },
  // one faint mote drifting off a moon-cap cluster (no light)
  moteFx: `fx
pop mote n=2 on=disc(.3).c(.2) life=2.5..4 v=up(.04..0.1)+sdir()*.03 size=.025..0.04 acc=curl(.3)*.15+drag(.6) col=hdr(.55,1.1,1.8) a=0>.3:.6>.7:.5>0 sz=$size r=sprite(soft-disc,add)`,
  place: {
    count: 70, radius: 300, minFromSpawn: 22, seedTries: 4000,
    waterBelow: 0.3, waterProbe: 2.5, pathMargin: 2, buildingMargin: 1.5, spacing: 7,
    mossKeep: 0.95, litterKeep: 0.4, // accept chance: shaded moss floor vs open litter
    avoid: [
      { circle: [0, -27, 20] },   // home clearing
      { circle: [0, 100, 45] },   // market town
      { rect: [41, 73, -40, -12] } // garden site
    ],
  },
};
