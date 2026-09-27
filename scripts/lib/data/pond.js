// The fishing pier and the lilypad hop across the lake to the mossy islet. Every tuned number of the pond lives here.
const S = '/cdn/moodboard-lowpoly-cozy/';
export const POND = {
  pier: { id: 'fishing-pier', at: { x: 21, y: 0, z: -59.8 }, yaw: 15, length: 11, headHalf: 2.8, headDepth: 1.8 },
  cast: { x: 17.68, y: 0, z: -75.27 },             // where the line lands, 4 m off the T end
  bite: 2.5, castCooldown: 2.8,
  catches: [                                        // weight, toast, colour, counts as a fish
    { w: 40, text: 'a perch!', color: '#9baf84', fish: true },
    { w: 24, text: 'a speckled trout!', color: '#5dada9', fish: true },
    { w: 16, text: 'a fat carp!', color: '#ba8950', fish: true },
    { w: 14, text: 'an old boot', color: '#8a8f94', fish: false },
    { w: 6, text: 'a lily stem… and it wriggled away', color: '#9baf84', fish: false },
    { w: 3, text: 'a golden koi ✨', color: '#ffd24a', fish: true, rare: true },
  ],
  padY: 0.04,                                       // pad feet over the water (top of the pad ≈ 0.10)
  dip: 0.12,
  pads: [[14.33, -73.59, 0.9], [13.66, -76.64, 1.0], [12.4, -79.62, 0.96], [10.39, -81.97, 0.82], [7.77, -83.25, 0.81],
         [4.94, -83.48, 0.82], [1.84, -82.94, 0.93], [-1.02, -81.94, 0.84], [-3.98, -80.55, 0.99]],
  flowers: [2, 6],                                  // pads wearing a lotus
  seedsOn: [1, 3, 5, 7],                            // pads holding a glowing seed
  seedRespawn: 25,
  islet: { x: -7.96, y: 0, z: -78.68 },
  pouch: { local: { x: -1.15, y: 0.5, z: 0.35 }, seeds: 5 },
  sfx: {
    cast: S + 'sfx-fishing-rod-whip-line-cast.mp3',
    plop: S + 'sfx-small-fish-plop-water-splash.mp3',
    boing: S + 'sfx-soft-lilypad-boing-water.mp3',
    chime: S + 'sfx-bright-seed-pickup-chime.mp3',
    pouch: S + 'sfx-wooden-chest-creak-open-seeds-rustle.mp3',
    frogs: S + 'sfx-pond-frogs-croaking-ambience-loop.mp3',
    lap: S + 'sfx-gentle-lake-water-lapping-pier-loop.mp3',
  },
};
export const SPLASH = `fx
pop drops burst=22..30 life=.45..0.8 v=up(2.2..3.4)+sdir()*(.5..1.1) size=.04..0.08 acc=grav()*.6 col=<.82,.93,.96> a=.9>.8:.8>0 sz=$size r=sprite(droplet,alpha,velocity,.02)
pop spray burst=7 life=.6..1 v=up(.8..1.5)+sdir()*.7 size=.2..0.32 acc=drag(2)+grav()*.2 col=<.92,.97,1> a=0>.12:.45>1:0 sz=$size*(.6>1.7) rot=spin(.2) r=sprite(smoke-puff,alpha)
pop ring burst=10 on=disc(.15) life=.7..1.1 v=radial(.9..1.4) size=.08..0.12 acc=drag(1.5) col=<.9,.97,1> a=.7>0 sz=$size r=sprite(soft-disc,add)`;
export const RIPPLE = `fx
pop drip burst=6..9 on=disc(.5) life=.35..0.6 v=up(.9..1.6)+sdir()*.4 size=.03..0.05 acc=grav()*.5 col=<.8,.92,.95> a=.8>0 sz=$size r=sprite(droplet,alpha,velocity,.02)`;
export const GLINT = `fx
pop glint n=5 on=sphere(.22) life=.8..1.4 v=up(.1..0.25) size=.03..0.06 col=hdr(2.6,2.3,.8) a=0>.3:1>.7:1>0 sz=$size r=sprite(mote,add)`;
export const POP = `fx
pop burst burst=16..22 life=.4..0.7 v=sdir()*(1.2..2.2)+up(.6) size=.04..0.07 acc=drag(2.5) col=hdr(3,2.6,.9) a=1>0 sz=$size r=sprite(ember,add,velocity,.02)`;
