// A waystone circle in the keep: step on it and you rise (or sink) one floor, landing beside the matching circle there.
// state: { to: {x,y,z} world arrival, yaw, dir: "up"|"down", room }
const CHIME = "/cdn/moodboard-lowpoly-cozy/sfx-teleport-soft-chime-whoosh.mp3";
const last = {};
const burst = (col) => `fx
pop spark burst=26..34 on=disc(.6) life=.6..1.1 v=up(1.5..3.2)+sdir()*.4 size=.03..0.06 acc=drag(1.4)+buoy(.4) col=${col} a=1>.6:1>0 sz=$size*(1>.3) r=sprite(mote,add)
pop ring burst=1 life=.5 at=point() size=1.6 sz=$size*(.4>1.3) col=${col}*.8 a=.9>0 r=sprite(soft-disc,add)`;

export function onTriggerEnter(ctx, other) {
  if (!ctx.place.players.some((p) => p.id === other.id)) return;
  const now = ctx.now();
  if (now - (last[other.id] ?? 0) < 1200) return;
  const s = ctx.self.state, to = s.to;
  if (!to) return;
  last[other.id] = now;
  const from = ctx.self.worldFeetPosition;
  const col = s.dir === "down" ? "hdr(2.6,1.4,.4)" : "hdr(.5,2.4,2.1)";
  ctx.emit("fx", { position: { x: from.x, y: from.y + 0.1, z: from.z }, script: burst(col) });
  ctx.emit("playSound", { clip: CHIME, position: from, volume: 0.35, maxDistance: 14 });
  other.velocity = { x: 0, y: 0, z: 0 };
  other.feetPosition = { x: to.x, y: to.y + 0.05, z: to.z };
  if (typeof s.yaw === "number") other.rotation = { yaw: s.yaw };
  ctx.emit("fx", { position: { x: to.x, y: to.y + 0.1, z: to.z }, script: burst(col) });
  ctx.emit("playSound", { clip: CHIME, position: to, volume: 0.3, maxDistance: 14, pitch: s.dir === "down" ? 0.85 : 1.15 });
  ctx.emit("screenFlash", { color: s.dir === "down" ? "#ffcf8a" : "#9ff5e8", duration: 0.35, intensity: 0.35 }, { audience: { player: other.id } });
  if (s.room) ctx.emit("toast", { message: s.room, duration: 1.6 }, { audience: { player: other.id } });
}
