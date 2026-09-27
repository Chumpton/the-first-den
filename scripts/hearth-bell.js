// The temple bell of calm: E rings a soft chime, the bell swings, a ring of golden motes breathes out.
import { animate } from "builtin/tween";
const CHIME = "/cdn/moodboard-lowpoly-cozy/sfx-soft-temple-bell-chime.mp3";
const RING = `fx
pop motes burst=26..34 life=1.4..2.2 v=sdir()*(1.2..2)+up(.4) size=.05..0.09 acc=drag(1.4)+curl(.4) col=hdr(3,2.2,.8) a=0>.1:1>.7:.8>0 sz=$size r=sprite(mote,add)
pop halo burst=1 life=1.2 size=.6 sz=$size*(1>5) col=hdr(1.6,1.2,.5) a=.6>0 r=sprite(soft-disc,add)`;
export function onSpawn(ctx) {
  ctx.on("press", (ctx) => {
    const bell = (ctx.self.state.bell && ctx.getObject(ctx.self.state.bell)) || ctx.self; // a cord rings the bell it names
    const s = bell.state, now = ctx.now(); if (now < (s.next || 0)) return; s.next = now + 1600;
    s.rings = (s.rings || 0) + 1;
    const p = bell.worldFeetPosition || bell.feetPosition, c = { x: p.x, y: p.y + 0.5, z: p.z };
    ctx.emit("playSound", { clip: CHIME, position: c, volume: 0.9, maxDistance: 120 });
    ctx.emit("fx", { position: c, script: RING });
    ctx.emit("damageNumber", { position: { x: p.x, y: p.y + 1.8, z: p.z }, text: "~ a calm chime ~", color: "#ffe7a8", lifetime: 2.5 });
    try { animate(ctx, bell, { "rotation.pitch": [0, 16, -11, 6, -3, 0] }, { duration: 2.4 }); } catch (e) { ctx.emit("shake", { target: bell.id, intensity: 0.2, duration: 1 }); }
  });
}
