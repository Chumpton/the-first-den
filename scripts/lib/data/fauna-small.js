// Tuning for the small-fauna manager (scripts/fauna-small.js). A new species is a row here + a critter-<kind>.js generator + anim/critter-<kind>.yml.
const C = '/cdn/moodboard-lowpoly-cozy/';
export const FAUNA = {
  maxPerTick: 60, cullDistance: 200, maxDt: 0.25,
  home: { x: 0, z: -30 }, ring: [10, 120], house: { x: 0, z: -26, r: 9 }, lake: { x: 4, z: -76, dry: 25, swim: 16 }, dryY: 0.3,
  petMs: 2600, petCooldownMs: 700,
  heartFx: `fx
pop sparks burst=8..12 life=.6..1 v=up(1..1.6)+sdir()*(.4..0.8) size=.05..0.09 acc=drag(2)+buoy(.4) col=hdr(2.2,.7,1.1) a=1>.6:1>0 sz=$size*(1>.3) r=sprite(soft-disc,add)`,
  squirrel: { speed: 4.2, hop: [4, 12], shy: 3.5, squeak: C + 'sfx-squirrel-tiny-chirp-squeak.mp3',
    rest: [['sit', 0.4, 3, 6], ['alert', 0.3, 1.5, 3], ['idle', 0.3, 2, 5]] },
  rabbit: { speed: 2.2, hop: [3, 9], shy: 3, squeak: C + 'sfx-rabbit-soft-happy-squeak.mp3',
    rest: [['graze', 0.5, 3, 7], ['sit', 0.2, 2, 4], ['idle', 0.3, 2, 5]] },
  duck: { speed: 0.35, y: 0.02, paddle: [6, 14], dabble: 2.9, quack: C + 'sfx-mallard-duck-soft-quack.mp3', quackEvery: [16, 32] },
  bird: { swoop: 4, ground: [4, 8], air: [35, 70], flit: 1.4, perch: [6, 15], songEvery: [5, 11], songRange: 45,
    songs: [C + 'sfx-songbird-soft-chirp-trill.mp3', C + 'sfx-robin-short-sweet-song.mp3', C + 'sfx-finch-twitter-chirps.mp3'] },
  flocks: [
    { cx: 0, cz: -30, R: 26, w: 0.3, dir: 1, alt: 30, drift: 12, phase: 0, n: 6, variant: 'finch', spots: [[7, -13], [-9, -15]] },
    { cx: -10, cz: -20, R: 20, w: 0.36, dir: -1, alt: 36, drift: 10, phase: 2, n: 7, variant: 'bluebird', spots: [[-10, -38], [9, -40]] },
    { cx: 12, cz: -45, R: 22, w: 0.33, dir: 1, alt: 27, drift: 14, phase: 4, n: 5, variant: 'robin', spots: [[12, -24], [-6, -8]] },
  ],
};
