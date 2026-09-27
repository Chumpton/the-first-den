// The tackle box on the fishing pier: E casts a line off the T end; a bite comes 2.5 s later with a catch toast.
import { POND, SPLASH } from './lib/data/pond.js';
function toast(ctx, at, text, color) { ctx.emit('damageNumber', { position: { x: at.x, y: (at.y ?? 0) + 1.6, z: at.z }, text, color, size: 1.1, lifetime: 2.4 }); }
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state, now = ctx.now(), at = POND.cast;
    if ((s.busyUntil ?? 0) > now) { toast(ctx, ctx.self.worldFeetPosition, 'the line is still out…', '#f2e6cf'); return; }
    s.busyUntil = now + POND.castCooldown * 1000;
    const spot = { x: at.x + (ctx.random() - 0.5) * 1.2, y: 0.02, z: at.z + (ctx.random() - 0.5) * 1.2 };
    ctx.emit('playSound', { clip: POND.sfx.cast, position: ctx.self.worldFeetPosition, volume: 0.5, maxDistance: 20 });
    ctx.emit('fx', { position: spot, script: SPLASH });
    ctx.after(POND.bite, 'reel', { by, spot });
  },
};
export function reel(ctx, p) {
  const by = p?.by, spot = p?.spot ?? POND.cast;
  const pl = ctx.place.players.find((q) => q.id === by) ?? ctx.getObject(by);
  const total = POND.catches.reduce((a, c) => a + c.w, 0); let roll = ctx.random() * total, c = POND.catches[0];
  for (const k of POND.catches) { if ((roll -= k.w) < 0) { c = k; break; } }
  let text = c.text;
  if (pl && c.fish) { pl.state.fish = (pl.state.fish ?? 0) + 1; text += `  ·  ${pl.state.fish} caught`; }
  ctx.emit('playSound', { clip: POND.sfx.plop, position: spot, volume: 0.6, pitch: c.rare ? 1.25 : 0.95 + ctx.random() * 0.1, maxDistance: 24 });
  ctx.emit('fx', { position: spot, script: SPLASH });
  toast(ctx, spot, text, c.color);
  if (c.rare && pl) ctx.emit('screenFlash', { color: '#ffd24a', duration: 0.25, intensity: 0.25 }, { audience: { player: pl.id } });
}
