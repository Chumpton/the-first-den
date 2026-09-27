// A hidden secret (state.key → lib/data/secrets.js). E on it: its line, the finder's count, a chime and its own magic.
// The count lives in the finder's own save (player.state.secrets), so each player hunts their own set.
import SEC from './lib/data/secrets.js';
const FX = {
  petals: `fx
pop petals burst=70 life=2..3.5 on=disc(.6) v=up(3..6)+sdir()*(1.5..3) size=.05..0.09 acc=grav()*.25+drag(1.2)+curl(.6) col=<1.4,1,.2> a=1>.7:1>0 sz=$size rot=spin(4) r=sprite(soft-disc,alpha)
pop glow burst=1 life=1.2 r=light(<1,.8,.3>,40,10)`,
  fairies: `fx
pop motes burst=40 life=2.5..4 on=sphere(.4) v=up(.4..1)+sdir()*.4 size=.03..0.06 acc=vortex(2)+curl(1)+buoy(.4) col=hdr(2,1.6,3)>hdr(1.4,2.4,1.6) a=0>.1:1>.8:1>0 sz=$size*flick(6,.4) r=sprite(soft-disc,add)
pop glow burst=1 life=2 r=light(<.8,.7,1>,12,6)`,
  frogs: `fx
pop frogs burst=36 life=2.2..3 on=disc(4).c(9) v=sdir()*.5 size=.12..0.18 acc=grav() col=<.35,.7,.25> a=1 sz=$size floor=bounce(.5) rot=spin(3) r=sprite(soft-disc,alpha)`,
  fireworks: `fx
pop shells burst=4 life=1.1..1.4 on=disc(6) v=up(18..24) size=.08 acc=grav()*.6 col=hdr(3,2.4,1.4) a=1 sz=$size r=sprite(ember,add,velocity,.03)
pop sparks on=@shells*60 life=1.2..2 v=sdir()*(5..8) size=.06..0.1 hue=0..1 acc=grav()*.3+drag(1.1) col=hdr(3,1.2,.6)>hdr(1,.5,2.5) a=1>.6:1>0 sz=$size r=sprite(ember,add,velocity,.02)`,
  party: `fx
pop confetti burst=80 life=2..3 on=disc(.3) v=up(3..5)+sdir()*(1.5..2.5) size=.04..0.07 tint=<1.4,.3,.5>..<.3,1.2,1.4> acc=grav()*.3+drag(1.4)+curl(.8) col=$tint a=1>.8:1>0 sz=$size rot=spin(6) r=sprite(soft-disc,alpha)
pop disco burst=1 life=4 r=light(<1,.3,.9>,20,8)`,
  slow: `fx
pop spores burst=60 life=3..5 on=disc(.9) v=up(.3..0.8) size=.02..0.05 acc=curl(.6)+buoy(.2)+drag(.6) col=hdr(1.6,2.2,1)>hdr(2.4,1.2,2.2) a=0>.1:1>.8:1>0 sz=$size*flick(4,.5) r=sprite(soft-disc,add)`,
};
export const ears = {
  press: (ctx, { by } = {}) => {
    const d = SEC.list[ctx.self.state.key]; if (!d) return;
    const now = ctx.now(), s = ctx.self.state; if (now - (s.at || 0) < SEC.cooldownMs) return; s.at = now;
    const who = by && ctx.getObject(by.id ?? by);
    const p = ctx.self.worldFeetPosition || ctx.self.feetPosition, at = { x: p.x, y: p.y + 0.6, z: p.z };
    let head = d.name;
    if (who) {
      const found = Array.isArray(who.state.secrets) ? who.state.secrets : [];
      if (!found.includes(s.key)) { who.state.secrets = [...found, s.key]; head = `secret ${found.length + 1} of ${SEC.total} · ${d.name}`; ctx.emit('playSound', { clip: SEC.chime, volume: 0.8 }, { audience: { player: who.id } }); }
      else head = `${d.name} (found)`;
    }
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.6, z: p.z }, text: head, color: '#ffe08a', size: 1.1, lifetime: 3.5 });
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.1, z: p.z }, text: d.line, color: '#fff6e0', size: 0.7, lifetime: 5 });
    ctx.emit('playSound', { clip: d.sound, position: p, volume: 0.8, maxDistance: 40 });
    ctx.emit('squash', { target: ctx.self.id, axis: 'y', intensity: 0.15, duration: 0.35 });
    if (d.act === 'dragons') { ctx.emit('sky-dragons:launch', { count: 3 }); const m = ctx.getObject('sky-dragons'); if (m) m.state.launchReq = (m.state.launchReq ?? 0) + 1; }
    else if (d.act === 'fireworks') ctx.emit('fx', { position: { x: p.x - 10, y: p.y + 2, z: p.z + 12 }, script: FX.fireworks });
    else if (d.act === 'frogs' && who) ctx.emit('fx', { position: who.feetPosition, script: FX.frogs });
    else ctx.emit('fx', { position: at, script: FX[d.act] ?? FX.petals });
    if (d.act === 'party') { ctx.emit('screenFlash', { color: '#ff66cc', duration: 0.4, intensity: 0.25 }, { audience: { nearby: p, radius: 12 } }); ctx.emit('shockwave', { position: at, speed: 6, thickness: 0.4, intensity: 0.3 }); }
    if (d.act === 'slow' && who) ctx.emit('slowMo', { scale: 0.35, duration: 3 }, { audience: { player: who.id } });
    if (d.act === 'petals') ctx.emit('shockwave', { position: at, speed: 8, thickness: 0.5, intensity: 0.35 });
  },
};
