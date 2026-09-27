// The watchtower's portals: the ring in the portal room lifts you to the observatory balcony;
// the small ring up there (state.to = "bottom") sets you down outside the door. Points and cooldown: lib/data/wizard-tower.yml.
import CFG from './lib/data/wizard-tower.yml';
const burst = (a, b) => `fx
pop spark burst=34..44 on=sphere(.5) life=.6..1.2 v=up(1.2..3)+sdir()*(.6..1.4) size=.03..0.07 acc=drag(1.5)+buoy(.5) tint=${a}..${b} col=$tint a=1>.6:1>0 sz=$size*(1>.3) r=sprite(mote,add)
pop swirl burst=18 on=disc(.7) life=.5..0.9 v=up(2..3.5) size=.05..0.09 acc=curl(1.2)*1.5+drag(1) col=${b} a=.9>0 sz=$size r=sprite(ember,add,velocity,.03)
pop ring burst=1 life=.55 at=point() size=2.2 sz=$size*(.3>1.4) col=${a}*.7 a=.8>0 r=sprite(soft-disc,add)
pop flash burst=1 life=.4 at=point() glo=1>0 r=light(<.45,.85,1>,$glo*12,8)`;
export function onTriggerEnter(ctx, other) {
  if (!other || !ctx.place.players.some((p) => p.id === other.id)) return;
  const now = ctx.now();
  if (now - (other.state.wizardPortalAt ?? 0) < (CFG.cooldownMs ?? 2000)) return;
  const down = ctx.self.state.to === 'bottom', to = down ? CFG.bottom : CFG.top;
  if (!to) return;
  other.state.wizardPortalAt = now;
  const from = other.feetPosition, fx = burst('hdr(.4,2.4,2.2)', 'hdr(1.6,.6,2.6)');
  ctx.emit('fx', { position: { x: from.x, y: from.y + 1, z: from.z }, script: fx });
  ctx.emit('playSound', { clip: CFG.sound, position: from, volume: 0.6, maxDistance: 25, pitch: down ? 0.85 : 1 });
  other.velocity = { x: 0, y: 0, z: 0 };
  other.feetPosition = { x: to.x, y: to.y, z: to.z };
  if (typeof to.yaw === 'number') other.rotation = { yaw: to.yaw };
  ctx.emit('fx', { position: { x: to.x, y: to.y + 1, z: to.z }, script: fx });
  ctx.emit('playSound', { clip: CFG.sound, position: to, volume: 0.5, maxDistance: 25, pitch: down ? 0.8 : 1.12 });
  ctx.emit('screenFlash', { color: '#8ff0e4', duration: 0.45, intensity: 0.35 }, { audience: { player: other.id } });
}
