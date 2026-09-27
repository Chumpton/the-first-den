// Every ground animal wears this and nothing else: E on it (home-player-feel's press) is a pet — hearts, the species' happy
// sound, and petAt/petBy on the row, which the one manager (scripts/fauna-ground.js) reads to sit or nuzzle it for 2 s.
import SPECIES from './lib/data/fauna-ground.json';
const HEARTS = `fx
pop hearts burst=8..11 on=disc(.25*%k|1) life=1.1..1.7 v=up(.5..1)+sdir()*.45 size=.1..0.17 hue=0..1 acc=buoy(.4)+drag(1.5) sz=$size*%k|1*(.3>1.15:.15>1:.3>.8) col=<2.2,.7,1.1>*(1-$hue)+<2.2,1.2,.8>*$hue a=0>1:.1>1:.7>0 r=sprite(soft-disc,add)
pop twinkle burst=6..9 on=disc(.35*%k|1) life=.5..0.9 v=up(.6)+sdir()*.6 size=.03..0.06 acc=drag(2) sz=$size col=<3,2.2,2.4> a=1>0 r=sprite(ember,add)`;
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  ctx.on('press', (ctx, { by }) => {
    const me = ctx.self, s = me.state, now = ctx.now(), S = SPECIES[s.sp];
    if (!S || now - (s.petAt || 0) < 1500) return;
    s.petAt = now; s.petBy = by;
    const b = me.bounds, p = me.worldFeetPosition || me.feetPosition;
    const top = b ? { x: b.center.x, y: b.max.y + 0.15, z: b.center.z } : { x: p.x, y: p.y + 1, z: p.z };
    ctx.emit('fx', { position: top, script: HEARTS, params: { k: S.heart * (s.scale || 1) } });
    ctx.emit('playSound', { clip: S.sound, position: top, volume: 0.45, pitch: (s.scale || 1) < 0.8 ? 1.25 : 1, maxDistance: 14 });
    ctx.emit('haptic', { kind: 'soft' }, { audience: { player: by } });
  });
}
