// E on a hive: "a drop of honey", a buzz, a golden drip and a few bees lifting off; the hive gives a little squash.
import H from './lib/data/homestead.yml';
const V = H.hive;
const HONEY = `fx
pop honey burst=5..8 life=.6..1 v=up(.6..1)+sdir()*.3 size=.03..0.05 acc=grav()*.6+drag(1) col=<1.3,.8,.15> a=1>.7:1>0 sz=$size r=sprite(droplet,alpha)
pop bees burst=4..6 life=1.2..2 v=up(.6..1)+sdir()*(.6..1.2) size=.03..0.04 acc=curl(2)*2+drag(1) col=<1.2,.85,.1> a=1>.8:1>0 sz=$size r=sprite(mote,alpha)`;
export const ears = {
  press: (ctx) => {
    const s = ctx.self.state, now = ctx.now(); if (now - (s.at || 0) < V.cooldownMs) return; s.at = now;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition, at = { x: p.x, y: p.y + 0.95, z: p.z };
    ctx.emit('damageNumber', { position: at, text: V.text, color: V.color, size: 1.1, lifetime: 1.6 });
    ctx.emit('playSound', { clip: V.buzz, position: p, volume: 0.5, pitch: 0.9 + ctx.random() * 0.2, maxDistance: 14 });
    ctx.emit('fx', { position: at, script: HONEY });
    ctx.emit('squash', { target: ctx.self.id, axis: 'y', intensity: 0.06, duration: 0.3 });
  },
};
