// A lilypad you can hop on: it dips under the one who lands, bobs back up, and boings softly.
import { animate } from 'builtin/tween';
import { POND, RIPPLE } from './lib/data/pond.js';
export function onCollide(ctx, other) {
  if (!other || !ctx.place.players.some((p) => p.id === other.id)) return;
  const now = ctx.now(), seen = (ctx.session.padTouch ??= {}), key = ctx.self.id + '|' + other.id, last = seen[key] ?? 0;
  seen[key] = now;
  if (now - last < 900) return;                                   // still standing on it: no second bob
  const y = ctx.self.state.baseY ?? POND.padY, d = ctx.self.state.dip ?? POND.dip, f = ctx.self.feetPosition;
  animate(ctx, ctx.self, { 'feetPosition.y': [y, y - d, y + 0.025, y] }, { duration: 0.7, easing: 'easeOutQuad' });
  ctx.emit('playSound', { clip: POND.sfx.boing, position: f, volume: 0.35, pitch: 0.9 + ctx.random() * 0.25, maxDistance: 14 });
  ctx.emit('fx', { position: { x: f.x, y: 0.05, z: f.z }, script: RIPPLE });
}
