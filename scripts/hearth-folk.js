// A Hearthmere townsperson strolls its route (state.route, local metres under the town root), pauses to chat when pressed.
import FOLK from "./lib/data/hearth-folk.js";
export const updateSchedule = { every: 2 };
export function onSpawn(ctx) {
  ctx.on("press", (ctx, { by }) => {
    const s = ctx.self.state, lines = s.lines || FOLK.lines, p = ctx.self.worldFeetPosition || ctx.self.feetPosition;
    s.said = ((s.said ?? -1) + 1) % lines.length; s.pauseUntil = ctx.now() + FOLK.pauseMs;
    const who = by && ctx.getObject(by.id ?? by);
    if (who && who.feetPosition && p) { const dx = who.feetPosition.x - p.x, dz = who.feetPosition.z - p.z; ctx.self.rotation = { yaw: Math.atan2(-dx, -dz) * 180 / Math.PI }; }
    ctx.emit("damageNumber", { position: { x: p.x, y: p.y + 2.4, z: p.z }, text: `${s.name}: ${lines[s.said]}`, color: "#ffe2a0", lifetime: 3.5, size: 0.8 });
  });
}
export function update(ctx, dt) {
  const s = ctx.self.state, R = s.route; if (!R || R.length < 2) return;
  if (ctx.now() < (s.pauseUntil || 0)) return;
  const f = ctx.self.feetPosition; let i = s.i ?? 0, t = R[i];
  let dx = t[0] - f.x, dz = t[1] - f.z, d = Math.hypot(dx, dz);
  if (d < 0.4) { s.i = i = (i + 1) % R.length; t = R[i]; dx = t[0] - f.x; dz = t[1] - f.z; d = Math.hypot(dx, dz) || 1; if (ctx.random() < FOLK.lingerChance) s.pauseUntil = ctx.now() + FOLK.lingerMs; }
  const step = Math.min(d, (s.speed || FOLK.speed) * dt);
  ctx.self.feetPosition = { x: f.x + dx / d * step, y: 0, z: f.z + dz / d * step };
  ctx.self.rotation = { yaw: Math.atan2(-dx, -dz) * 180 / Math.PI };
}
