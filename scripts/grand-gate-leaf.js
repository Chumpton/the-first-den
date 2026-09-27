// One wrought-iron leaf of the grand gate: swings inward as anyone walks up, eases shut once the way is clear. Hinge = the row's origin.
// ctx.session.leaf is keyed by leaf id: both leaves share one machine, each keeps its own swing.
// state: baseYaw (closed yaw), openBy (degrees added when open, sign picks the swing), cx/cz (the gate's centre).
const OPEN_AT = 13, CLOSE_AT = 16, SPEED = 95;
const CREAK = '/cdn/moodboard-lowpoly-cozy/sfx-wrought-iron-gate-swing-open-creak.mp3', THUD = '/cdn/moodboard-lowpoly-cozy/sfx-wrought-iron-gate-clang-shut.mp3';
export function update(ctx, dt) {
  const me = ctx.self, s = me.state;
  let near = Infinity;
  for (const pl of ctx.place.players) { const q = pl.feetPosition; if (q) near = Math.min(near, Math.hypot(q.x - s.cx, q.z - s.cz)); }
  const want = s.open ? near < CLOSE_AT : near < OPEN_AT;
  if (want !== !!s.open) { s.open = want; if (s.lead) ctx.emit('playSound', { clip: want ? CREAK : THUD, position: { x: s.cx, y: 1.5, z: s.cz }, volume: 0.5, maxDistance: 20 }); }
  const S = ((ctx.session.leaf ??= {})[me.id] ??= { cur: 0 }), target = s.open ? s.openBy : 0;
  if (Math.abs(S.cur - target) < 0.01) { if (near > 30) ctx.sleep(1); return; }
  S.cur += Math.sign(target - S.cur) * Math.min(Math.abs(target - S.cur), SPEED * dt);
  me.rotation = { yaw: s.baseYaw + S.cur };
}
