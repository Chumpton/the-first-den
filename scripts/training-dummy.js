// E on the straw training dummy: a thwack, a wobble, a number over its head and a puff of straw. Tuning in state (cooldownMs).
const STRAW = `fx
pop straw burst=16..24 life=.7..1.3 v=<%dir|1,0,0>*(1.6..3.2)+sdir()*(.6..1.4)+up(.6..1.2) size=.07..0.13 spin=-9..9 tint=oklch(.88 .10 88)..oklch(.72 .11 75) acc=grav()+drag(1.3) col=$tint a=1>.75:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)
pop dust burst=6..9 life=.5..0.9 v=sdir()*(.3..0.7) size=.18..0.3 acc=buoy(.3)+drag(1.4) col=<.9,.8,.55> a=0>.3:.28>.7:.12>0 sz=$size*(.6>1.8) r=sprite(soft-disc,add)`;
const THWACK = '/cdn/moodboard-lowpoly-cozy/sfx-straw-training-dummy-thwack.mp3';
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state, now = ctx.now(); if (now - (s.at || 0) < (s.cooldownMs ?? 250)) return; s.at = now;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition, who = ctx.getObject(by), q = who?.worldFeetPosition || who?.feetPosition;
    let dx = q ? p.x - q.x : 1, dz = q ? p.z - q.z : 0; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const dmg = 1 + Math.floor(ctx.random() * 12), crit = dmg >= 11;
    s.hits = (s.hits || 0) + 1;
    ctx.emit('playSound', { clip: THWACK, position: p, volume: 0.7, pitch: 0.85 + ctx.random() * 0.3, maxDistance: 18 });
    ctx.emit('shake', { target: ctx.self.id, intensity: crit ? 0.14 : 0.08, duration: 0.35 });
    ctx.emit('squash', { target: ctx.self.id, axis: 'y', intensity: crit ? 0.14 : 0.08, duration: 0.3 });
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.05, z: p.z }, value: dmg, crit, color: crit ? '#ffb347' : '#f2e6cf', lifetime: 1.2 });
    ctx.emit('fx', { position: { x: p.x, y: p.y + 1.15, z: p.z }, script: STRAW, params: { dir: { x: dx, y: 0.2, z: dz } } });
  },
};
