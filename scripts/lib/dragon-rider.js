// The rider's half of the jade dragon (self-writes only): after pressing E on a dragon, sit in its saddle once it names us
// its rider; when it lets us go (landed), step off to its side onto the ground.
import { DRAGON as D } from './data/dragon.js';
function yawOf(r) {
  if (typeof r === 'number') return r;
  if (!r) return 0;
  if (typeof r.w === 'number') return Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) * 180 / Math.PI;
  return r.yaw ?? 0;
}
export function wantMount(ctx, target) { if (target?.tags?.includes('dragon') || target?.tags?.includes('mount')) ctx.self.state.mountWant = { id: target.state?.pressTo ?? target.id, at: ctx.now() }; }
// true = the dragon owns this tick of the body
export function dragonRide(ctx) {
  const me = ctx.self, s = me.state;
  if (s.mountWant) {
    const d = ctx.getObject(s.mountWant.id);
    if (d && d.state?.rider === me.id) {
      me.parent = d.id; me.feetPosition = { ...(d.state?.seat ?? D.seat) }; me.rotation = { yaw: d.state?.seatYaw ?? 0 }; me.velocity = { x: 0, y: 0, z: 0 };
      if (d.state?.thirdPerson) { s.camBeforeMount = s.camMode ?? 'first'; s.camMode = 'third'; }
      s.mountedOn = d.id; s.mountWant = null; return true;
    }
    if (!d || ctx.now() - s.mountWant.at > D.mountWaitMs) { s.mountWant = null; return false; }
    return true;
  }
  if (!s.mountedOn) return false;
  const d = ctx.getObject(s.mountedOn);
  if (d && d.state?.rider === me.id) return true;
  if (s.camBeforeMount) { s.camMode = s.camBeforeMount; s.camBeforeMount = null; }
  const drop = d?.state?.dropAt;
  if (drop) { me.parent = null; s.mountedOn = null; me.feetPosition = { x: drop.x, y: drop.y + 0.05, z: drop.z }; me.velocity = { x: 0, y: 0, z: 0 }; return true; }
  const q = d ? (d.worldFeetPosition || d.feetPosition) : (me.worldFeetPosition || me.feetPosition);
  const y = (yawOf(d?.rotation) * Math.PI) / 180, rx = Math.cos(y), rz = -Math.sin(y);
  const x = q.x + rx * D.stepOff, z = q.z + rz * D.stepOff;
  const g = ctx.place.terrain.heightAt(x, z) ?? q.y;
  me.parent = null; s.mountedOn = null;
  me.feetPosition = { x, y: Math.max(g, q.y - 0.5) + 0.05, z }; me.velocity = { x: 0, y: 0, z: 0 };
  return true;
}
