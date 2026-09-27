// The run gate swings open as a body walks up to it and shuts behind them (kinematic leaf, hinge = the row's origin).
import H from './lib/data/homestead.yml';
const G = H.gate, RAD = Math.PI / 180;
export function update(ctx, dt) {
  const me = ctx.self, s = me.state, p = me.worldFeetPosition || me.feetPosition, b = (s.baseYaw || 0) * RAD;
  const cx = p.x + Math.cos(b) * G.width / 2, cz = p.z - Math.sin(b) * G.width / 2;
  let near = Infinity;
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (q) near = Math.min(near, Math.hypot(q.x - cx, q.z - cz)); }
  const want = s.open ? near < G.closeAt : near < G.openAt;
  if (want !== !!s.open) { s.open = want; ctx.emit('playSound', { clip: want ? G.open : G.shut, position: { x: cx, y: p.y + 1, z: cz }, volume: 0.45, maxDistance: 16 }); }
  const S = (ctx.session.coopGate ??= { cur: 0 }), target = s.open ? G.openYaw : 0;
  if (S.cur === target) { ctx.sleep(0.2); return; }
  S.cur += Math.sign(target - S.cur) * Math.min(Math.abs(target - S.cur), G.speed * dt);
  me.rotation = { yaw: (s.baseYaw || 0) + S.cur };
}
