// A findable treasure chest, driven by its row's state: E opens the lid on its back hinge (eased in update), coins and sparkle
// burst out with a chime, and the finder's own save gains state.flag once (a milestone, a toast). E again closes it.
// state: { act, flag, text, foundText, milestone, step, chime, color }; its lid is the child <id>/lid (pitch opens it).
const SND = { open: '/cdn/moodboard-lowpoly-cozy/sfx-wooden-chest-creak-open.mp3', shut: '/cdn/moodboard-lowpoly-cozy/sfx-wooden-chest-lid-thump.mp3', chime: '/cdn/moodboard-lowpoly-cozy/sfx-treasure-chest-open-chime.mp3' };
const BURST = `fx
pop coins burst=22..28 life=1.4..2.2 on=disc(.15) v=up(3..4.2)+sdir()*(.6..1.4) size=.06..0.08 spin=-8..8 acc=grav()+drag(.6) col=hdr(1.9,1.4,.45) a=1>.85:1>0 sz=$size rot=$age*$spin floor=bounce(.35) r=sprite(chip,alpha)
pop sparkle burst=28 life=.8..1.6 on=sphere(.3) v=up(.6..1.4)+sdir()*(.4..1) size=.03..0.06 acc=drag(1.2)+buoy(.3) col=hdr(3,2.6,1.2)>hdr(1.2,2.4,2.6) a=1>.6:1>0 sz=$size*flick(8,.5) r=sprite(mote,add)
pop glow burst=1 life=1.1 r=light(<1,.85,.5>,12,6)`;
export const ears = {
  press: (ctx, { by } = {}) => {
    const s = ctx.self.state, now = ctx.now(); if (now - (s.at || 0) < 700) return; s.at = now;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition;
    s.open = !s.open;
    ctx.emit('playSound', { clip: s.open ? SND.open : SND.shut, position: p, volume: 0.6, maxDistance: 14 });
    if (!s.open) return;
    ctx.emit('fx', { position: { x: p.x, y: p.y + 0.4, z: p.z }, script: BURST });
    ctx.emit('playSound', { clip: s.chime || SND.chime, position: p, volume: 0.8, maxDistance: 20 });
    ctx.emit('squash', { target: ctx.self.id, axis: 'y', intensity: 0.12, duration: 0.3 });
    const who = by && ctx.getObject(by.id ?? by), flag = s.flag || 'chestFound';
    let text = s.text || 'Treasure found!';
    if (who) {
      if (!who.state[flag]) { who.state[flag] = true; ctx.emit('milestone', { step: s.step ?? 1, name: s.milestone || flag }, { audience: { player: who.id } }); }
      else text = s.foundText || text;
    }
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.2, z: p.z }, text, color: s.color || '#ffe08a', size: 1.1, lifetime: 3.5 });
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
