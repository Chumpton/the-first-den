// Alchemy bench tuning: recipes, buff colours and the effects a brew rides. Read by scripts/alchemy-player.js and scripts/ui.js.
export const ALCHEMY = {
  bench: 'alchemy-bench',
  reach: 4.5,          // m: walking farther than this from the bench closes the panel
  swiftMul: 1.6,       // walk speed multiplier while Swift Tonic runs (scripts/player.js reads state.speedMul)
  short: 'not enough harvest — press the crystal in the mandala garden',
  recipes: {
    swift: { name: 'Swift Tonic', cost: 2, seconds: 60, note: 'run faster 60 s', color: [1, 0.8, 0.4], css: '#ffcf6a' },
    glow: { name: 'Glow Potion', cost: 2, seconds: 60, note: 'you glow 60 s', color: [0.45, 1, 0.9], css: '#6fe8d6' },
    dye: { name: 'Petal Dye', cost: 1, seconds: 300, note: 'tints your aura 5 min', color: [1, 0.45, 0.6], css: '#ff8fb0' },
  },
  dyes: [[1, 0.45, 0.6], [0.72, 0.5, 1], [1, 0.62, 0.25], [0.5, 0.75, 1], [0.6, 0.95, 0.45]],
  fx: {
    swift: `fx
pop dust rate=?mobile:6|10 on=disc(.3) life=.4..0.7 v=up(.3..0.6)+sdir()*.3 size=.1..0.18 acc=drag(1.6) col=<.85,.8,.7> a=0>.25:.3>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)
pop zip rate=8 on=sphere(.35).c(.9) life=.3..0.5 v=up(-.6..-0.2) size=.02..0.035 col=<%r|1,%g|.8,%b|.4>*3 a=1>0 sz=$size r=sprite(ember,add,velocity,.05)`,
    glow: `fx
pop motes n=18 on=sphere(.5).c(1) life=1.2..2.2 v=sdir()*.08 size=.03..0.06 acc=curl(.5)*.25+buoy(.05) col=<%r|.45,%g|1,%b|.9>*3 a=(0>.2:1>.8:1>0)*flick(1.5,.3) sz=$size r=sprite(mote,add)
pop halo n=1 at=point().c(1) life=1 size=1.5 col=<%r|.45,%g|1,%b|.9>*.5 a=.35 sz=$size*flick(.8,.1) r=sprite(soft-disc,add)`,
    dye: `fx
pop petals n=14 on=sphere(.55).c(1) life=1.5..2.5 v=sdir()*.1 size=.05..0.08 spin=-3..3 acc=curl(.4)*.3+grav()*.02 col=<%r|1,%g|.45,%b|.6> a=0>.2:.95>.8:.95>0 sz=$size rot=$age*$spin r=sprite(petal,alpha)
pop tint n=1 at=point().c(1) life=1 size=1.1 col=<%r|1,%g|.45,%b|.6>*.3 a=.25 sz=$size r=sprite(soft-disc,add)`,
    sparkle: `fx
pop spark burst=24 life=.5..1 v=sdir()*(.6..1.4)+up(.6) size=.02..0.04 acc=grav()*.3+drag(1.5) col=<%r|1,%g|1,%b|1>*4 a=1>0 sz=$size r=sprite(ember,add,velocity,.02)
pop puff burst=4 life=.8..1.2 v=up(.4)+sdir()*.1 size=.2..0.3 acc=buoy(.3)+drag(1) col=<%r|1,%g|1,%b|1> a=0>.3:.35>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)`,
  },
};
