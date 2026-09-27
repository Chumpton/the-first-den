// The player's half of the summoned horse: Z whistles it up beside you and seats you (lib/dragon-rider does the sitting);
// Z again while on it is heard by the horse itself (it holds your controls then).
import { STEED as S } from './lib/data/steed.js';
const D2R = Math.PI / 180;
function yawOf(r) { if (typeof r === 'number') return r; if (!r) return 0; if (typeof r.w === 'number') return Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) / D2R; return r.yaw ?? 0; }
export function onInput(ctx, input) {
  if (!input.pressed?.[S.action]) return;
  const me = ctx.self, s = me.state;
  if (s.mountedOn) { if (s.mountedOn === s.myHorse) ctx.emit('press', { by: me.id, off: true }, { to: s.mountedOn }); return; }
  if (me.parent || s.mountWant) return;
  if (s.myHorse && ctx.getObject(s.myHorse)) ctx.destroy(s.myHorse);
  const p = me.feetPosition, yaw = yawOf(me.rotation);
  const rx = Math.cos(yaw * D2R), rz = -Math.sin(yaw * D2R);            // the body's right
  const x = p.x + rx * S.side, z = p.z + rz * S.side, y = ctx.place.terrain.heightAt(x, z) ?? p.y;
  const id = ctx.spawn({
    tags: ['mount', 'steed'], scope: 'session', physics: 'kinematic', feetPosition: { x, y, z }, rotation: { yaw },
    primitive: { kind: 'scripted', script: 'scripts/gen/courier-horse.js', params: { coat: S.coat, blanket: S.blanket, pad: S.pad, mounted: false } },
    behavior: 'scripts/steed.js',
    state: { owner: me.id, rider: me.id, seat: { ...S.seat }, seatYaw: 0, thirdPerson: true, kind: 'horse', noPress: true },
  });
  s.myHorse = id; s.mountWant = { id, at: ctx.now() };
  ctx.emit('playSound', { clip: S.whistle, position: p, volume: 0.6, maxDistance: 30 });
  ctx.emit('fx', { position: { x, y: y + 0.1, z }, script: `fx
pop dust burst=18 on=disc(.8) life=.6..1.1 v=up(.6..1.4)+sdir()*.8 size=.25..0.45 acc=buoy(.3)+drag(1.4) col=<.72,.64,.52> a=0>.35:.3>.7:.15>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)` });
}
