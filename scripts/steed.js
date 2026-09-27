// Your summoned horse: it holds your controls while you ride. W/S walk and back up, A/D turn, hold Shift to gallop,
// Z or E gets you off (it steps you onto the ground at its left and trots off after a moment). Kinematic, follows the ground,
// stops at walls and at the river's edge. Head is local -z.
import { STEED as S } from './lib/data/steed.js';
import { play, clips } from 'builtin/anim';
import { raycast } from 'builtin/physics';
const D2R = Math.PI / 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), wrap = (a) => ((a % 360) + 540) % 360 - 180;
let CL;
const clip = (ctx, name, speed = 1) => { CL ??= clips(ctx, 'anim/courier.yml'); if (CL[name]) play(ctx, ctx.self, CL[name], { channel: 'body', loop: true, speed, blendIn: 0.25 }); };
function mind(ctx) { const all = (ctx.session.steed ??= {}); const r = ctx.self.rotation; return (all[ctx.self.id] ??= { yaw: typeof r === 'number' ? r : (r?.yaw ?? 0), speed: 0, in: { x: 0, z: 0, run: false }, gait: '', sound: '' }); }
const here = (ctx, id) => !!id && ctx.place.players.some((p) => p.id === id);
function getOff(ctx) {
  const self = ctx.self, s = self.state, m = mind(ctx);
  if (!s.rider) return;
  const p = self.feetPosition, lx = -Math.cos(m.yaw * D2R), lz = Math.sin(m.yaw * D2R);   // horse's left
  const x = p.x + lx * 1.6, z = p.z + lz * 1.6;
  s.dropAt = { x, y: ctx.place.terrain.heightAt(x, z) ?? p.y, z, yaw: m.yaw };
  s.rider = null; self.controller = null; m.speed = 0; self.audio = null;
  clip(ctx, 'horse-idle');
  ctx.emit('playSound', { clip: S.snort, position: p, volume: 0.5, maxDistance: 20 });
  ctx.after(S.vanishAfter, 'vanish');
}
export function vanish(ctx) {
  if (ctx.self.state.rider) return;
  const p = ctx.self.feetPosition;
  ctx.emit('fx', { position: p, script: `fx
pop dust burst=16 on=disc(.8) life=.6..1 v=up(.6..1.2)+sdir()*.8 size=.25..0.45 acc=buoy(.3)+drag(1.4) col=<.72,.64,.52> a=0>.35:.3>.7:.15>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)` });
  const o = ctx.getObject(ctx.self.state.owner); if (o && o.state?.myHorse === ctx.self.id) o.state.myHorse = null;
  ctx.destroy(ctx.self.id);
}
export const ears = { press: (ctx, { by }) => { if (by === ctx.self.state.rider) getOff(ctx); } };
export function onSpawn(ctx) {
  const s = ctx.self.state;
  if (s.rider) ctx.self.controller = s.rider;
  clip(ctx, 'horse-idle');
  ctx.emit('playSound', { clip: S.snort, position: ctx.self.feetPosition, volume: 0.55, maxDistance: 22 });
}
export function onControlEnd(ctx, player) { if (ctx.self.state.rider === player.id) getOff(ctx); }
export function onInput(ctx, input) {
  const a = input.axes || {}, m = mind(ctx);
  m.in = { x: a.moveX || 0, z: a.moveZ || 0, run: !!input.held?.descend };
  if ((input.pressed?.[S.action] || input.pressed?.interact) && ctx.self.state.rider) getOff(ctx);
}
export function update(ctx, dt) {
  const self = ctx.self, s = self.state, m = mind(ctx), p = self.feetPosition;
  if (!p) return;
  if (s.rider && !here(ctx, s.rider)) { s.rider = null; self.controller = null; self.audio = null; ctx.after(0.5, 'vanish'); }
  const riding = !!s.rider, inp = riding ? m.in : { x: 0, z: 0, run: false };
  const run = inp.run && inp.z > 0.1;
  const target = inp.z > 0.1 ? (run ? S.gallop : S.walk) : inp.z < -0.1 ? -S.reverse : 0;
  const rate = target === 0 ? S.brake : run ? S.gallopAccel : S.accel;
  m.speed += clamp(target - m.speed, -rate * dt, rate * dt);
  const tr = run ? S.gallopTurn : S.turn;
  m.yaw = wrap(m.yaw - inp.x * tr * dt * (m.speed < -0.1 ? -1 : 1));
  const fx = -Math.sin(m.yaw * D2R), fz = -Math.cos(m.yaw * D2R), dir = m.speed >= 0 ? 1 : -1;
  let nx = p.x + fx * m.speed * dt, nz = p.z + fz * m.speed * dt;
  if (Math.abs(m.speed) > 0.05) {
    const hit = raycast(ctx, { x: p.x, y: p.y + 1.1, z: p.z }, { x: fx * dir, y: 0, z: fz * dir }, { distance: S.wallProbe, bodies: 'static', physicsOnly: true, ignoreEntities: [self.id, s.rider].filter(Boolean) });
    const g = ctx.place.terrain.heightAt(nx, nz);
    if ((hit && Math.abs(hit.normal?.y ?? 0) < 0.6) || g == null || g < S.minGround) { nx = p.x; nz = p.z; m.speed = 0; }
  }
  const gy = ctx.place.terrain.heightAt(nx, nz) ?? p.y;
  const bob = m.speed > S.walk + 1 ? Math.abs(Math.sin(ctx.now() / 1000 * 9)) * 0.08 : 0;
  self.feetPosition = { x: nx, y: gy + bob, z: nz };
  self.rotation = { yaw: m.yaw };
  const sp = Math.abs(m.speed), gait = sp < 0.3 ? 'horse-idle' : sp > S.walk + 1.5 ? 'horse-canter' : 'horse-walk';
  if (gait !== m.gait) { m.gait = gait; clip(ctx, gait, gait === 'horse-canter' ? 1.2 : Math.max(0.7, sp / S.walk)); }
  const snd = !riding || sp < 0.3 ? '' : gait === 'horse-canter' ? S.hooves : S.walkHooves;
  if (snd !== m.sound) { m.sound = snd; self.audio = snd ? { clip: snd, loop: true, gain: snd === S.hooves ? 0.35 : 0.25, spatial: true, maxDistance: 25 } : null; }
  if (!riding && sp < 0.02) ctx.sleep(0.5);
}
