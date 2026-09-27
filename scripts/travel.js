// J opens the travel list on the player's own body; a number key or a click on a row takes you there with a flash and a chime.
import { TRAVEL as T } from './lib/data/travel.js';
function go(ctx, spot) {
  const me = ctx.self, s = me.state;
  if (!spot) return;
  if (s.mountedOn) { ctx.emit('damageNumber', { position: { ...me.worldFeetPosition, y: (me.worldFeetPosition?.y ?? 0) + 2.2 }, text: 'get off your ride first', color: '#ffe2a8', lifetime: 1.6 }, { audience: { player: me.id } }); return; }
  if (ctx.now() - (s.travelAt ?? 0) < T.cooldownMs) return;
  const from = me.worldFeetPosition || me.feetPosition;
  if (s.seatedOn) s.seatedOn = null;
  if (me.parent) me.parent = null;
  const y = spot.y ?? ((ctx.place.terrain.heightAt(spot.x, spot.z) ?? 0.5) + 0.15);
  ctx.emit('playSound', { clip: T.whoosh, position: from, volume: 0.6, maxDistance: 20 });
  me.feetPosition = { x: spot.x, y, z: spot.z };
  me.velocity = { x: 0, y: 0, z: 0 };
  me.rotation = { yaw: spot.yaw ?? 0 };
  s.travelAt = ctx.now(); s.travelOpen = false;
  ctx.emit('screenFlash', { color: '#fff1cf', duration: 0.35, intensity: 0.55 }, { audience: { player: me.id } });
  ctx.emit('playSound', { clip: T.whoosh, position: { x: spot.x, y, z: spot.z }, volume: 0.7, maxDistance: 20 });
}
export function onInput(ctx, input) {
  const s = ctx.self.state, p = input.pressed || {};
  if (p.travelMenu) { s.travelOpen = !s.travelOpen; return; }
  if (p.travelGo) { go(ctx, T.spots.find((x) => x.id === input.actionData?.travelGo?.to)); return; }
  if (!s.travelOpen) return;
  if (p.travelClose) { s.travelOpen = false; return; }
  for (const spot of T.spots) if (p[spot.action]) { go(ctx, spot); return; }
}
