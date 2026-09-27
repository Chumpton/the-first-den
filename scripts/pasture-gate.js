// The pasture's field gate: E (home-player-feel's press on an "interactable") swings it open about its hinge post, again shuts it.
// Kinematic leaf, hinge at the row's feet; closes itself after gate.autoClose seconds. Tuning in scripts/lib/data/pasture.yml.
import PASTURE from './lib/data/pasture.yml';
const G = PASTURE.gate, S = PASTURE.sounds;
export function onSpawn(ctx) {
  if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  ctx.self.state.act = ctx.self.state.open ? 'Close' : 'Open';
}
function swing(ctx, open) {
  const s = ctx.self.state; if (!!s.open === open) return;
  s.open = open; s.openAt = ctx.now(); s.act = open ? 'Close' : 'Open';
  ctx.emit('playSound', { clip: open ? S.gateOpen : S.gateClose, position: ctx.self.worldFeetPosition || ctx.self.feetPosition, volume: 0.55, maxDistance: 22 });
}
export const ears = { press: (ctx) => swing(ctx, !ctx.self.state.open) };
export function update(ctx, dt) {
  const s = ctx.self.state, base = s.baseYaw ?? 0, want = s.open ? G.openYaw : 0, cur = s.yaw ?? 0;
  if (s.open && ctx.now() - (s.openAt ?? 0) > G.autoClose * 1000) swing(ctx, false);
  if (cur === want) { ctx.sleep(1); return; }
  const next = cur + Math.sign(want - cur) * Math.min(Math.abs(want - cur), G.speed * dt);
  s.yaw = next; ctx.self.rotation = { yaw: base + next };
}
