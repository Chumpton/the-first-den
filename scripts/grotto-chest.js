// The grotto's egg chest. E opens the lid on its back hinge (eased in update), a burst of confetti and sparkle, a fanfare,
// and the finder's own save (player.state.eggs) gains "grotto" once. E again closes it. Fireflies drift in the row's fx.
const SND = { open: '/cdn/moodboard-lowpoly-cozy/sfx-wooden-chest-creak-open.mp3', shut: '/cdn/moodboard-lowpoly-cozy/sfx-wooden-chest-lid-thump.mp3', fanfare: '/cdn/moodboard-lowpoly-cozy/sfx-tiny-treasure-fanfare.mp3' };
const BURST = `fx
pop confetti burst=70 life=1.8..2.8 on=disc(.2) v=up(3..4.5)+sdir()*(1..2) size=.04..0.07 tint=<1.4,.35,.6>..<.3,1.2,1.3> acc=grav()*.35+drag(1.4)+curl(.8) col=$tint a=1>.8:1>0 sz=$size rot=spin(6) r=sprite(petal,alpha)
pop sparkle burst=30 life=.8..1.6 on=sphere(.3) v=up(.6..1.4)+sdir()*(.4..1) size=.03..0.06 acc=drag(1.2)+buoy(.3) col=hdr(3,2.6,1.2)>hdr(1.2,2.4,2.6) a=1>.6:1>0 sz=$size*flick(8,.5) r=sprite(mote,add)
pop glow burst=1 life=1.2 r=light(<1,.85,.5>,14,6)`;
export const ears = {
  press: (ctx, { by } = {}) => {
    const s = ctx.self.state, now = ctx.now(); if (now - (s.at || 0) < 700) return; s.at = now;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition;
    s.open = !s.open;
    ctx.emit('playSound', { clip: s.open ? SND.open : SND.shut, position: p, volume: 0.6, maxDistance: 14 });
    if (!s.open) return;
    const at = { x: p.x, y: p.y + 0.45, z: p.z };
    ctx.emit('fx', { position: at, script: BURST });
    ctx.emit('playSound', { clip: SND.fanfare, position: p, volume: 0.8, maxDistance: 20 });
    ctx.emit('squash', { target: ctx.self.id, axis: 'y', intensity: 0.12, duration: 0.3 });
    const who = by && ctx.getObject(by.id ?? by);
    let text = 'you found the Grotto!';
    if (who) {
      const eggs = Array.isArray(who.state.eggs) ? who.state.eggs : [];
      if (!eggs.includes('grotto')) { who.state.eggs = [...eggs, 'grotto']; ctx.emit('milestone', { step: 1, name: 'grotto egg' }, { audience: { player: who.id } }); }
      else text = 'the Grotto (found)';
    }
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.2, z: p.z }, text, color: '#ffe08a', size: 1.1, lifetime: 3.5 });
  },
};
export function update(ctx, dt) {
  const s = ctx.self.state, lid = ctx.getObject(ctx.self.id + '/lid');
  if (!lid) return ctx.sleep(2);
  const target = s.open ? 105 : 0, cur = s.lidPitch ?? 0;
  if (Math.abs(target - cur) < 0.01) return ctx.sleep(5);
  const step = (s.open ? 160 : 260) * dt, next = cur + Math.sign(target - cur) * Math.min(Math.abs(target - cur), step);
  s.lidPitch = next; lid.rotation = { pitch: next };
}
