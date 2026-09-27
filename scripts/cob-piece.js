// A cob-house piece that answers E: a sound and a few warm words over it (state.say, state.sound). One script, every piece.
export function onSpawn(ctx) {
  const self = ctx.self;
  if (!(self.tags || []).includes('interactable')) self.tags = [...(self.tags || []), 'interactable'];
  ctx.on('press', (ctx, { by }) => {
    const s = ctx.self.state;
    if (ctx.now() - (s.pressedAt || -2000) < 1200) return;
    s.pressedAt = ctx.now();
    const lines = Array.isArray(s.say) ? s.say : [s.say || '…'];
    s.line = ((s.line ?? -1) + 1) % lines.length;
    const b = ctx.self.bounds, q = ctx.self.worldFeetPosition || ctx.self.feetPosition;
    const at = b ? { x: b.center.x, y: b.max.y + 0.25, z: b.center.z } : { x: q.x, y: q.y + 1.2, z: q.z };
    if (s.sound) ctx.emit('playSound', { clip: s.sound, position: at, volume: 0.35, maxDistance: 12 });
    ctx.emit('damageNumber', { position: at, text: lines[s.line], color: '#ffe2a8', size: 0.8, lifetime: 2.4 }, { audience: { player: by } });
  });
}
