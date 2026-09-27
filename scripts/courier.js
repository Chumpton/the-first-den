// Tomas the Courier and his chestnut (rows courier-horse + courier-tomas, data scripts/lib/data/courier.js).
// Horse: E (press) offers the rider picker (player.state.courierPick); 'courierRide' {by, city} starts a ride: the horse names
// the player its rider (scripts/lib/dragon-rider.js seats them on the pillion, third person), reads the city's road mark
// AT RIDE TIME and canters it to the city gate, then sets them down facing in (state.dropAt) and trots home by teleport.
// Rider's press / Space ends early beside the road. One rider at a time; place.state.courier tells everyone it's out.
// Tomas: stands and pats the horse; hides while he rides (the horse draws him seated).
import { play, clips } from 'builtin/anim';
import { raycast } from 'builtin/physics';
import { shortestArc } from 'builtin/math';
import { COURIER as C } from './lib/data/courier.js';
let CL = null;
const clip = (ctx, row, name, loop = true, speed = 1) => { CL ??= clips(ctx, 'anim/courier.yml'); if (CL[name]) play(ctx, row, CL[name], { channel: 'body', loop: loop ? true : 'once', speed, blendIn: 0.3 }); };
const XZ = (p) => (Array.isArray(p) ? { x: p[0], z: p[1] } : { x: p.x, z: p.z });
function routeFor(ctx, city) {
  const marks = ctx.place.terrain?.marks || ctx.place.marks || {};
  let pts = (marks['road-' + city.road]?.points || []).map(XZ);
  const h = C.home;
  if (pts.length < 2) { // no road under that name: a straight line to the site's edge
    const dx = city.centre.x - h.x, dz = city.centre.z - h.z, L = Math.hypot(dx, dz), k = (L - 185) / L;
    pts = [{ x: h.x, z: 10 }, { x: h.x + dx * k, z: h.z + dz * k }];
  }
  let best = 0, bd = Infinity;
  pts.forEach((p, i) => { const d = Math.hypot(p.x - h.x, p.z - h.z); if (d < bd) { bd = d; best = i; } });
  return pts.slice(best).map((p) => [Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10]);
}
function groundY(ctx, x, z, yHint, skip) {
  const hit = raycast(ctx, { x, y: yHint + 4, z }, { x: 0, y: -1, z: 0 }, { distance: 12, physicsOnly: true, ignoreEntities: skip });
  return hit ? hit.position.y : (ctx.place.terrain.heightAt(x, z) ?? yHint);
}
function setMounted(ctx, on) { const pr = ctx.self.primitive; if (pr) ctx.self.primitive = { ...pr, params: { ...pr.params, mounted: on } }; }
function finish(ctx, drop) {
  const s = ctx.self.state;
  s.dropAt = drop; s.rider = null; s.phase = 'rest'; s.backAt = ctx.now() + C.returnDelay * 1000;
  ctx.self.audio = null; clip(ctx, ctx.self, 'horse-idle');
}
function goHome(ctx) {
  const s = ctx.self.state, h = C.home;
  s.phase = null; s.route = null; s.v = 0; s.riding = false;
  ctx.self.feetPosition = { x: h.x, y: ctx.place.terrain.heightAt(h.x, h.z) ?? 0.5, z: h.z };
  ctx.self.rotation = { yaw: h.yaw }; s.yaw = h.yaw;
  setMounted(ctx, false);
  ctx.place.state.courier = null;
  const man = ctx.getObject(C.man); if (man) { man.visible = true; man.state.back = ctx.now(); }
  clip(ctx, ctx.self, 'horse-idle');
}
function rideTick(ctx, dt) {
  const me = ctx.self, s = me.state, r = s.route || [];
  if (!ctx.place.players.some((p) => p.id === s.rider)) { finish(ctx, null); return; }
  const p = me.feetPosition;
  let i = s.i ?? 0;
  while (i < r.length - 1 && Math.hypot(r[i][0] - p.x, r[i][1] - p.z) < C.lookAhead) i++;
  s.i = i;
  const [tx, tz] = r[i], dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
  if (i >= r.length - 1 && dist < 1.5) { // the city gate: set the rider down a pace on, facing the city
    const cy = C.cities[s.cityKey] || {}, c = cy.centre || { x: tx, z: tz }, ux = c.x - tx, uz = c.z - tz, L = Math.hypot(ux, uz) || 1;
    const x = tx + (ux / L) * 3, z = tz + (uz / L) * 3;
    finish(ctx, { x, y: groundY(ctx, x, z, p.y, [me.id, s.rider]), z, yaw: Math.atan2(-ux, -uz) * 180 / Math.PI });
    ctx.emit('playSound', { clip: C.snort, position: p, volume: 0.6, maxDistance: 30 });
    return;
  }
  const want = Math.atan2(-dx, -dz) * 180 / Math.PI, yaw = s.yaw ?? 0;
  const turn = shortestArc(yaw, want);
  s.yaw = yaw + turn * Math.min(1, C.turnRate * dt);
  const slow = Math.abs(turn) > 70 ? C.walk : C.speed;
  s.v = Math.min(slow, (s.v ?? 0) + C.accel * dt); if (s.v > slow) s.v = slow;
  const a = s.yaw * Math.PI / 180, nx = p.x - Math.sin(a) * s.v * dt, nz = p.z - Math.cos(a) * s.v * dt;
  const g = groundY(ctx, nx, nz, p.y, [me.id, s.rider]);
  me.feetPosition = { x: nx, y: p.y + (g - p.y) * Math.min(1, dt * 10), z: nz };
  me.rotation = { yaw: s.yaw };
  const gait = s.v > 5 ? 'horse-canter' : 'horse-walk';
  if (gait !== s.gait) { s.gait = gait; clip(ctx, me, gait); }
}
function horseUpdate(ctx, dt) {
  const s = ctx.self.state;
  if (s.phase === 'ride') return rideTick(ctx, dt);
  if (s.phase === 'rest') { if (ctx.now() >= (s.backAt ?? 0)) goHome(ctx); return; }
  clip(ctx, ctx.self, 'horse-idle'); ctx.sleep(30);
}
function manUpdate(ctx) {
  const me = ctx.self, s = me.state, horse = ctx.getObject(C.horse);
  if (horse?.state?.riding) { if (me.visible !== false) me.visible = false; ctx.sleep(3); return; }
  if (me.visible === false) me.visible = true;
  if (s.greetAt && s.greetAt !== s.greeted) { s.greeted = s.greetAt; s.phase = 'greet'; clip(ctx, me, 'greet', false); ctx.sleep(1.7); return; }
  if (s.phase === 'stand') { s.phase = 'pat'; clip(ctx, me, 'pat', false); ctx.sleep(2.4); return; }
  s.phase = 'stand'; clip(ctx, me, 'stand'); ctx.sleep(7 + ctx.random() * 6);
}
export function update(ctx, dt) { return ctx.self.state.role === 'man' ? manUpdate(ctx) : horseUpdate(ctx, dt); }
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state;
    if (s.role === 'man') return;
    if (s.phase === 'ride' && by === s.rider) { // off early, beside the road
      const p = ctx.self.feetPosition, a = (s.yaw ?? 0) * Math.PI / 180, x = p.x + Math.cos(a) * C.dismountSide, z = p.z - Math.sin(a) * C.dismountSide;
      finish(ctx, { x, y: groundY(ctx, x, z, p.y, [ctx.self.id, by]), z, yaw: s.yaw ?? 0 });
      return;
    }
    if (s.riding) return;
    const pl = ctx.getObject(by); if (!pl) return;
    pl.state.courierPick = ctx.now();
    const man = ctx.getObject(C.man); if (man) man.state.greetAt = ctx.now();
    ctx.emit('playSound', { clip: C.greet, position: ctx.self.feetPosition, volume: 0.8, maxDistance: 18 });
  },
  courierRide: (ctx, { by, city }) => {
    const s = ctx.self.state, c = C.cities[city];
    if (!c || s.riding || !ctx.getObject(by)) return;
    const f = ctx.getObject(by).feetPosition, h = C.home;
    if (Math.hypot(f.x - h.x, f.z - h.z) > C.pickReach + 3) return;
    Object.assign(s, { riding: true, phase: 'ride', rider: by, seat: { ...C.seat }, seatYaw: 0, thirdPerson: true, dropAt: null,
      route: routeFor(ctx, c), i: 0, v: 0, yaw: h.yaw, gait: null, city: c.name, cityKey: city });
    ctx.place.state.courier = { busy: true, city: c.name, rider: by, at: ctx.now() };
    setMounted(ctx, true);
    ctx.self.audio = { clip: C.hooves, loop: true, gain: 0.45, spatial: true, maxDistance: 45 };
    ctx.emit('playSound', { clip: C.snort, position: ctx.self.feetPosition, volume: 0.7, maxDistance: 30 });
    const man = ctx.getObject(C.man); if (man) man.visible = false;
  },
};
