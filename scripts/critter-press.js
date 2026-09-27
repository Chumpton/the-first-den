// A squirrel or rabbit you press (E): a heart pops, it squeaks, and it sits up to look at you (fauna-small reads state.petAt).
import { FAUNA as F } from './lib/data/fauna-small.js';
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  ctx.on('press', (ctx, { by }) => {
    const s = ctx.self.state; if (ctx.now() - (s.petAt || -1e9) < F.petCooldownMs) return;
    s.petAt = ctx.now(); s.petBy = by;
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition, at = { x: p.x, y: p.y + 0.5, z: p.z };
    ctx.emit('damageNumber', { position: at, text: '♥', color: '#ff6fa0', size: 1.2, lifetime: 1.3 });
    ctx.emit('fx', { position: at, script: F.heartFx });
    ctx.emit('playSound', { clip: F[s.kind]?.squeak ?? F.squirrel.squeak, position: p, volume: 0.35, pitch: 0.95 + ctx.random() * 0.15, maxDistance: 14 });
  });
}
