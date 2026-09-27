// Each rescued horse wears this: E near it (home-player-feel's press) brings a soft nicker, a few hearts and its name
// floating over its head; the herd manager (scripts/pasture-herd.js) reads petAt to turn it toward whoever said hello.
import PASTURE from './lib/data/pasture.yml';
const HEARTS = `fx
pop hearts burst=6..9 on=disc(.25) life=1.1..1.6 v=up(.5..0.9)+sdir()*.4 size=.1..0.16 acc=buoy(.4)+drag(1.5) sz=$size*(.3>1.1:.15>1:.3>.8) col=<2.2,.8,1.1> a=0>1:.1>1:.7>0 r=sprite(soft-disc,add)`;
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
}
export const ears = {
  press: (ctx, { by }) => {
    const me = ctx.self, s = me.state, now = ctx.now();
    if (now - (s.petAt || 0) < 2000) return;
    s.petAt = now; s.petBy = by;
    const b = me.bounds, p = me.worldFeetPosition || me.feetPosition;
    const top = b ? { x: b.center.x, y: b.max.y + 0.2, z: b.center.z } : { x: p.x, y: p.y + 2.2, z: p.z };
    ctx.emit('playSound', { clip: PASTURE.sounds.nicker, position: top, volume: 0.6, pitch: s.pitch || 1, maxDistance: 18 });
    ctx.emit('fx', { position: top, script: HEARTS });
    ctx.spawn({ parent: me.id, tags: ['temp-tag'], lifetime: 6, feetPosition: { x: 0, y: 2.45, z: -0.4 }, text: { content: s.name || 'friend', size: 0.34, color: 'oklch(0.97 0.03 85)' } });
    ctx.emit('damageNumber', { position: { x: top.x, y: top.y + 0.35, z: top.z }, text: s.story || '', color: 'oklch(0.92 0.05 85)', size: 0.5, lifetime: 3 });
    ctx.emit('haptic', { kind: 'soft' }, { audience: { player: by } });
  },
};
