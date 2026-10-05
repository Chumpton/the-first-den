// Shared by the rider's script (gryphon-mount.js) and Wynx's own (wynx.js): her clip, her effects.
import { play, clips } from 'builtin/anim';
import { GRY } from './data/gryphon.js';
let CL = null;
export const FEATHERS = `fx
pop feather burst=26..34 on=sphere(1.2) life=1.2..2.2 v=sdir()*(1.5..3.5)+up(1) size=.08..0.14 spin=-5..5 acc=grav()*.25+drag(1.8)+curl(.6) col=<.95,.9,.78>..<.55,.38,.22> a=1>.7:1>0 sz=$size rot=$age*$spin r=sprite(stalk,alpha,velocity,.02)
pop gust burst=10 on=disc(1.4) life=.5..0.9 v=sdir()*(2..4) size=.6..1 acc=drag(2) col=<.9,.9,.95> a=0>.2:.3>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)`;
export const DUST = `fx
pop dust burst=22 on=disc(1.4) life=.7..1.2 v=sdir()*(1.5..3.5)+up(.4..1) size=.4..0.7 acc=buoy(.2)+drag(1.6) col=<.62,.55,.44> a=0>.35:.3>.7:.15>0 sz=$size*(.6>2.2) r=sprite(smoke-puff,alpha)`;
const STREAKS = `fx follow=player
pop streak rate=?mobile:14|30 on=box(5,3,2) life=.25..0.4 v=<0,0,9> size=.025 col=<1,1,1> a=0>.35:.4>0 r=sprite(soft-disc,add,velocity,.5)`;
// mode: hover | fly | speed | landed | walk | run (run = the walk clip, quicker)
export function setMode(ctx, g, mode) {
  if (!g || g.state.mode === mode) return;
  g.state.mode = mode;
  const c = (CL ??= clips(ctx, 'anim/gryphon.yml'))[mode === 'run' ? 'walk' : mode];
  if (c) play(ctx, g, c, { channel: 'body', loop: true, speed: mode === 'run' ? 1.9 : 1, blendIn: 0.25 });
  const air = mode === 'hover' || mode === 'fly' || mode === 'speed';
  g.audio = air ? { clip: mode === 'speed' ? GRY.sounds.rush : GRY.sounds.flap, loop: true, gain: mode === 'speed' ? 0.22 : 0.16, spatial: true, maxDistance: 30 } : null;
  g.fx = mode === 'speed' ? { script: STREAKS } : null;
}
export const yawOf = (r) => (typeof r === 'number' ? r : !r ? 0 : typeof r.w === 'number' ? Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) * 180 / Math.PI : r.yaw ?? 0);
