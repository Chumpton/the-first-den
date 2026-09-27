// The mandala relic: floats and turns slowly over its pedestal while someone is near (asleep otherwise); E harvests
// herbs & blooms: +1 player.state.harvest, a chime, a sparkle, 4 s per player. Tuning in state: { baseY, spin, bob, cooldown }.
const SPARK = `fx
pop spark burst=24..32 on=sphere(.25) life=.6..1.2 v=sdir()*(1.1..2.2)+up(.7) size=.04..0.08 acc=grav()*.25+drag(1.8) sz=$size*(1>.3) col=hdr(.7,2.4,2.5)>hdr(1.7,.9,2.6) a=1>.7:1>0 r=sprite(soft-disc,add)
pop bloom burst=12..16 on=sphere(.3) life=1..1.8 v=sdir()*(.6..1.2)+up(.9) size=.05..0.09 spin=-4..4 tint=oklch(.86 .13 140)..oklch(.8 .15 350) acc=grav()*.4+drag(1.5) col=$tint a=1>.7:1>0 sz=$size rot=$age*$spin r=sprite(petal,alpha)
pop flash burst=1 life=.35 size=.9 sz=$size*(.6>1.7) col=hdr(.6,1.8,2) a=.8>0 r=sprite(soft-disc,add)`;
export const updateSchedule = { every: 2 };
export function update(ctx) {
  const me = ctx.self, s = me.state, p = me.feetPosition;
  if (!ctx.place.players.some((pl) => pl.feetPosition && Math.hypot(pl.feetPosition.x - p.x, pl.feetPosition.z - p.z) < 45)) { ctx.sleep(3); return; }
  const t = ctx.now() / 1000, base = s.baseY ?? p.y;
  me.rotation = { yaw: (t * (s.spin ?? 16)) % 360 };
  me.feetPosition = { x: p.x, y: base + Math.sin(t * 1.25) * (s.bob ?? 0.07), z: p.z };
}
export const ears = {
  press: (ctx, { by }) => {
    const me = ctx.self, pl = ctx.getObject(by); if (!pl) return;
    const now = ctx.now(), wait = (me.state.cooldown ?? 4) * 1000, cd = {};
    for (const [k, v] of Object.entries(me.state.cd ?? {})) if (now - v < wait) cd[k] = v;
    if (cd[by]) return;
    cd[by] = now; me.state.cd = cd;
    pl.state.harvest = (pl.state.harvest ?? 0) + 1;
    const p = me.feetPosition, at = { x: p.x, y: p.y + 0.4, z: p.z };
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.1, z: p.z }, text: '+ herbs & blooms', color: '#9baf84', size: 1.1 });
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-crystal-harvest-chime.mp3', position: at, volume: 0.6 });
    ctx.emit('fx', { position: at, script: SPARK });
  },
};
