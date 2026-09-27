// The nest box lid: E (home-player-feel's press) gives "+1 egg", a cluck and a puff of straw; the lid tips open and shuts.
import H from './lib/data/homestead.yml';
const N = H.nest;
const STRAW = `fx
pop straw burst=6..10 life=.6..1 v=up(.8..1.4)+sdir()*(.3..0.7) size=.05..0.09 spin=-8..8 tint=oklch(.88 .1 88)..oklch(.72 .11 75) acc=grav()*.8+drag(1.5) col=$tint a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)`;
export const ears = {
  press: (ctx) => {
    const s = ctx.self.state, now = ctx.now(); if (now - (s.at || 0) < N.cooldownMs) return;
    s.at = now; s.eggs = (s.eggs || 0) + 1;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition, at = { x: p.x, y: p.y + 0.45, z: p.z };
    ctx.emit('damageNumber', { position: at, text: N.text, color: N.color, size: 1.1, lifetime: 1.6 });
    ctx.emit('playSound', { clip: N.sound, position: p, volume: 0.55, pitch: 0.95 + ctx.random() * 0.15, maxDistance: 16 });
    ctx.emit('fx', { position: at, script: STRAW });
  },
};
export function update(ctx, dt) {
  const s = ctx.self.state, S = (ctx.session.coopLid ??= { cur: 0 }), since = ctx.now() - (s.at || -1e9), open = since < N.holdMs, target = open ? N.openPitch : 0;
  if (S.cur === target) { ctx.sleep(open ? (N.holdMs - since) / 1000 + 0.05 : undefined); return; }
  S.cur += Math.sign(target - S.cur) * Math.min(Math.abs(target - S.cur), N.speed * dt);
  ctx.self.rotation = { pitch: S.cur };
}
