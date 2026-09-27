// The dock's fishing spot: E casts a line ~8 m out (plop + ripple), 2–5 s later a splash lands a fish from
// scripts/lib/data/fish.json, counted in the catcher's player.state.fish. One line per player, 2 s between casts.
import FISH from "./lib/data/fish.json";
import { rotate } from "builtin/vec3";
const SND = "/cdn/moodboard-lowpoly-cozy/";
const RIPPLE = `fx
pop plop burst=10..14 life=.4..0.7 v=up(1.2..2.2)+sdir()*.5 size=.04..0.07 acc=grav() col=<.85,.95,1> a=.9>0 sz=$size r=sprite(droplet,alpha)
pop foam burst=12 on=disc(.35) life=1..1.8 size=.12..0.22 sz=$size*(.5>2.2) col=<.92,.97,1> a=0>.1:.55>0 r=sprite(soft-disc,alpha)`;
const splash = (gold) => `fx
pop spray burst=26..34 life=.5..0.9 v=up(2.5..4)+sdir()*1.2 size=.05..0.09 acc=grav() col=<.85,.95,1> a=1>.6:1>0 sz=$size r=sprite(droplet,alpha)
pop foam burst=18 on=disc(.6) life=1.2..2 size=.18..0.32 sz=$size*(.5>2.4) col=<.95,.98,1> a=0>.1:.6>0 r=sprite(soft-disc,alpha)
pop glint burst=${gold ? 22 : 8} on=sphere(.3) life=.6..1.1 v=up(.6..1.4)+sdir()*.5 size=.05..0.09 col=${gold ? "hdr(4,2.8,.6)" : "hdr(1.6,2,2.4)"} a=1>0 sz=$size r=sprite(mote,add)`;
const head = (p) => ({ x: p.x, y: p.y + 2.1, z: p.z });
export function onSpawn(ctx) {
  const self = ctx.self;
  if (!(self.tags || []).includes("interactable")) self.tags = [...(self.tags || []), "interactable"];
  ctx.on("press", (ctx, { by }) => cast(ctx, by));
}
function cast(ctx, by) {
  const player = ctx.getObject(by); if (!player) return;
  const s = ctx.self.state, now = ctx.now(), mine = (s.lines || {})[by];
  const pp = player.worldFeetPosition || player.feetPosition;
  if (mine && mine.out) { ctx.emit("damageNumber", { position: head(pp), text: "waiting for a bite…", color: "#cfe8ff", size: 0.5, lifetime: 0.9 }); return; }
  if (mine && now - mine.at < FISH.cooldownMs) return;
  const base = ctx.self.worldFeetPosition, off = rotate(ctx.self.rotation ?? 0, { x: (ctx.random() - 0.5) * 3, y: 0, z: -(FISH.castDistance + (ctx.random() - 0.5) * 2) });
  const point = { x: base.x + off.x, y: FISH.waterY + 0.03, z: base.z + off.z };
  s.lines = { ...(s.lines || {}), [by]: { out: true, at: now } };
  ctx.emit("playSound", { clip: SND + "sfx-fishing-line-cast-whoosh-water-plop.mp3", position: point, volume: 0.55, maxDistance: 30 });
  ctx.emit("fx", { position: point, script: RIPPLE });
  ctx.emit("damageNumber", { position: head(pp), text: "cast!", color: "#cfe8ff", size: 0.55, lifetime: 0.9 });
  ctx.after(FISH.biteMin + ctx.random() * (FISH.biteMax - FISH.biteMin), "bite", { by, point });
}
export function bite(ctx, payload) {
  const { by, point } = payload || {}; if (!by) return;
  const s = ctx.self.state;
  s.lines = { ...(s.lines || {}), [by]: { out: false, at: ctx.now() } };
  const player = ctx.getObject(by); if (!player) return;
  let roll = ctx.random() * FISH.fish.reduce((t, f) => t + f.weight, 0), fish = FISH.fish[0];
  for (const f of FISH.fish) { roll -= f.weight; if (roll <= 0) { fish = f; break; } }
  player.state.fish = (player.state.fish ?? 0) + 1;
  const pp = player.worldFeetPosition || player.feetPosition;
  ctx.emit("playSound", { clip: SND + "sfx-fish-splash-out-of-water.mp3", position: point, volume: 0.6, maxDistance: 30 });
  ctx.emit("fx", { position: point, script: splash(!!fish.rare) });
  ctx.emit("playSound", { clip: SND + (fish.rare ? "sfx-magical-sparkle-chime-rare-find.mp3" : "sfx-soft-bright-chime-reward.mp3"), position: pp, volume: 0.5, maxDistance: 16 });
  ctx.emit("damageNumber", { position: head(pp), text: `+1 ${fish.name}`, color: fish.color, size: fish.rare ? 1 : 0.75, lifetime: 1.8, crit: !!fish.rare });
  ctx.emit("uiEvent", { name: "fishCaught", payload: { fish: fish.name, rare: !!fish.rare, total: player.state.fish } }, { audience: { player: by } });
}
