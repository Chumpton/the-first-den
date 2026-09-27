// Every ground animal wears this and nothing else: E on it (home-player-feel's press) is a pet — hearts, the species' happy
// sound, and petAt/petBy on the row, which the one manager (scripts/fauna-ground.js) reads to sit or nuzzle it for 2 s.
import SPECIES from './lib/data/fauna-ground.json';
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  ctx.on('press', (ctx, { by }) => {
    const me = ctx.self, s = me.state, now = ctx.now(), S = SPECIES[s.sp];
    if (!S || now - (s.petAt || 0) < 1500) return;
    s.petAt = now; s.petBy = by;
    const b = me.bounds, p = me.worldFeetPosition || me.feetPosition;
    const top = b ? { x: b.center.x, y: b.max.y + 0.15, z: b.center.z } : { x: p.x, y: p.y + 1, z: p.z };
    ctx.emit('fx', { position: top, script: 'scripts/effects-fauna-hearts.fx.js', params: { scale: S.heart * (s.scale || 1) } });
    ctx.emit('playSound', { clip: S.sound, position: top, volume: 0.45, pitch: (s.scale || 1) < 0.8 ? 1.25 : 1, maxDistance: 14 });
    ctx.emit('haptic', { kind: 'soft' }, { audience: { player: by } });
  });
}
