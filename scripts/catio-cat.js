// Every catio cat wears this: E on it (home-player-feel's press) says its name over its head and plays a purr (resting)
// or a meow (up and about); petAt on the row lets the manager (scripts/catio-cats.js) show a happy pose for a moment.
import CFG from './lib/data/catio.yml';
const HEARTS = `fx
pop hearts burst=5..7 on=disc(.12) life=1..1.5 v=up(.4..0.8)+sdir()*.3 size=.07..0.11 acc=buoy(.4)+drag(1.5) sz=$size*(.3>1.15:.15>1:.3>.8) col=<2.2,.8,1.1> a=0>1:.1>1:.7>0 r=sprite(soft-disc,add)`;
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  ctx.on('press', (ctx, { by }) => {
    const me = ctx.self, s = me.state, now = ctx.now();
    if (now - (s.petAt || 0) < 1200) return;
    s.petAt = now;
    const p = me.worldFeetPosition || me.feetPosition, top = { x: p.x, y: p.y + 0.6, z: p.z };
    const resting = !s.seg && ['nap', 'loaf', 'sit', 'groom'].includes(s.mode);
    ctx.emit('playSound', { clip: resting ? CFG.sound.purr : CFG.sound.meow, position: top, volume: 0.55, pitch: s.pitch || 1, maxDistance: 12 });
    ctx.emit('damageNumber', { position: top, text: s.name, color: 'oklch(0.92 0.1 70)', size: 0.9, lifetime: 2 });
    ctx.emit('fx', { position: top, script: HEARTS });
    ctx.emit('haptic', { kind: 'soft' }, { audience: { player: by } });
  });
}
