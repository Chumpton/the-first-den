// A glowing seed on a lilypad (walk through it: +1) or the islet's hidden seed chest (E: +5). Once per player, kept in
// player.state.gotSeeds; a taken seed winks out for everyone for a little while, then glows again for whoever hasn't found it.
import { animate } from 'builtin/tween';
import { POND, POP } from './lib/data/pond.js';
export function onSpawn(ctx) {
  const s = ctx.self.state; if (s.kind === 'pouch') return;
  animate(ctx, ctx.self, { 'rotation.yaw': [0, 90, 180, 270, 360] }, { duration: 3.2, easing: 'linear', loop: true });
  animate(ctx, ctx.self, { 'feetPosition.y': '+=0.12' }, { duration: 1.6, easing: 'easeInOutSine', direction: 'alternate', loop: true });
}
function give(ctx, pl) {
  const s = ctx.self.state, id = ctx.self.id, got = Array.isArray(pl.state.gotSeeds) ? pl.state.gotSeeds : [];
  const at = ctx.self.worldFeetPosition ?? ctx.self.feetPosition, where = { x: at.x, y: at.y + 0.9, z: at.z };
  if (got.includes(id)) { if (s.kind === 'pouch') ctx.emit('damageNumber', { position: where, text: 'already emptied', color: '#f2e6cf', size: 0.8 }); return false; }
  const n = s.amount ?? 1;
  pl.state.gotSeeds = [...got, id];
  pl.state.seeds = (pl.state.seeds ?? 0) + n;
  ctx.emit('playSound', { clip: s.kind === 'pouch' ? POND.sfx.pouch : POND.sfx.chime, position: at, volume: 0.55, pitch: 0.95 + Math.min(pl.state.seeds, 12) * 0.03, maxDistance: 16 });
  ctx.emit('fx', { position: where, script: POP });
  ctx.emit('damageNumber', { position: where, text: `+${n} seed${n > 1 ? 's' : ''}  ·  ${pl.state.seeds}`, color: '#ffd24a', size: n > 1 ? 1.2 : 0.9 });
  return true;
}
export function onTriggerEnter(ctx, other) {
  if (ctx.self.state.kind === 'pouch' || ctx.self.visible === false) return;
  const pl = ctx.place.players.find((p) => p.id === other?.id); if (!pl) return;
  if (give(ctx, pl)) { ctx.self.visible = false; ctx.after(POND.seedRespawn, 'reshow'); }
}
export function reshow(ctx) { ctx.self.visible = true; }
export const ears = {
  press: (ctx, { by }) => {
    if (ctx.self.state.kind !== 'pouch') return;
    const pl = ctx.place.players.find((p) => p.id === by); if (pl) give(ctx, pl);
  },
};
