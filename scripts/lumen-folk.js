// A townsperson strolls its route (local points under the city root) at an easy pace, pausing to look about; E gets a greeting.
import { animate } from "builtin/tween";
export function onSpawn(ctx) {
  ctx.on("press", (ctx, { by }) => {
    const s = ctx.self.state, lines = s.lines ?? ["Peace to you, traveller."], f = ctx.self.worldFeetPosition ?? ctx.self.feetPosition;
    s.said = ((s.said ?? -1) + 1) % lines.length;
    ctx.emit("damageNumber", { position: { x: f.x, y: f.y + 2.2, z: f.z }, text: lines[s.said], color: "#bff3ee", size: 0.8, lifetime: 3.5 });
    ctx.emit("playSound", { clip: "/cdn/moodboard-lowpoly-cozy/sfx-soft-crystal-chime-greeting.mp3", position: { x: f.x, y: f.y + 1.5, z: f.z }, volume: 0.5 });
  });
  ctx.after(1 + ctx.random() * 3, "stroll");
}
export function stroll(ctx) {
  const s = ctx.self.state, r = s.route; if (!r?.length) return;
  s.i = ((s.i ?? 0) + 1) % r.length;
  const [x, z] = r[s.i], f = ctx.self.feetPosition, dx = x - f.x, dz = z - f.z, dur = Math.max(0.5, Math.hypot(dx, dz) / (s.pace ?? 1.1));
  ctx.self.rotation = { yaw: Math.atan2(-dx, -dz) * 180 / Math.PI };
  animate(ctx, ctx.self, { "feetPosition.x": x, "feetPosition.z": z }, { duration: dur, easing: "linear" });
  ctx.after(dur + 2 + ctx.random() * 4, "stroll");
}
