// The jade dragon: rests coiled; E (the den's press) seats the presser and hands them the reins; flies where the rider looks.
// A kinematic body moved by feetPosition/rotation writes on whichever machine simulates it (the rider's while ridden).
import { DRAGON as D } from './lib/data/dragon.js';
import { restClip, flyClip } from './lib/dragon-clips.js';
import { raycast } from 'builtin/physics';
const R2D = 180 / Math.PI, D2R = Math.PI / 180;
const BREATH = `fx
pop breath rate=flick(.3,.7)*5 on=sphere(.06) life=1.4..2.4 v=up(.12..0.3)+sdir()*(.08..0.2) size=.03..0.07 acc=buoy(.12)+drag(1.1) col=<.78,1,.86> a=0>.2:.7>.7:.35>0 sz=$size*(.6>1.5) r=sprite(mote,add)`;
const TRAIL = `fx
pop sparkle rate=?mobile:16|34 on=sphere(.18) life=.8..1.7 v=sdir()*(.15..0.5) size=.04..0.09 acc=drag(1.4) col=hdr(1.1,2.2,1.4)>hdr(.45,1.1,.7) a=(1>.6:.8>0)*flick(9,.4) sz=$size*(1>.3) r=sprite(mote,add)
pop glint rate=?mobile:3|6 on=sphere(.1) life=.4..0.8 size=.1..0.16 col=hdr(2,3,2.2) a=1>0 sz=$size*(1>.2) r=sprite(soft-disc,add)`;
const PROMPT = `<svg viewBox="0 0 250 48" width="0.62m" billboard="full">
  <rect x="1" y="2" width="246" height="44" rx="22" fill="#1d1712" fill-opacity="0.86" stroke="#f2e6cf" stroke-opacity="0.35" stroke-width="1.5" />
  <circle cx="24" cy="24" r="15" fill="none" stroke="#f2e6cf" stroke-width="1.8" />
  <text x="24" y="31" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#f2e6cf">E</text>
  <text x="48" y="32" font-family="serif" font-size="26" fill="#f7eedd">ride the dragon</text>
</svg>`;
const wrap = (a) => ((a % 360) + 540) % 360 - 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function yawOf(r) {
  if (typeof r === 'number') return r;
  if (!r) return 0;
  if (typeof r.w === 'number') return Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) * R2D;
  return r.yaw ?? 0;
}
function mind(ctx) {
  const all = (ctx.session.jadeDragon ??= {});
  return (all[ctx.self.id] ??= { yaw: yawOf(ctx.self.rotation), pitch: 0, roll: 0, v: { x: 0, y: 0, z: 0 }, speed: 0, wHeld: 0, in: {} });
}
const ground = (ctx, x, z) => ctx.place.terrain.heightAt(x, z) ?? 0;
const kid = (ctx, n) => ctx.getObject(ctx.self.id + '/' + n);
function ensureChildren(ctx) {
  const id = ctx.self.id;
  if (!kid(ctx, 'prompt')) ctx.spawn('prompt', { parent: id, feetPosition: D.promptAt, vector: PROMPT, physics: 'none', castShadow: false, material: { color: '#ffffff', depthTest: true, depthWrite: false }, visibleRange: { min: 0, max: D.promptNear } });
  if (!kid(ctx, 'breath')) ctx.spawn('breath', { parent: id, feetPosition: D.breathAt, physics: 'none', fx: { script: BREATH } });
  if (!kid(ctx, 'trail')) ctx.spawn('trail', { parent: id, feetPosition: D.trailAt, physics: 'none', fx: null });
}
function setMode(ctx, mode) {
  const s = ctx.self.state;
  if (s.mode === mode && s.clip === mode) return;
  s.mode = mode;
  const flying = mode !== 'rest';
  s.clip = mode;
  ctx.self.anim.body = { clip: flying ? flyClip() : restClip(), loop: 'loop', weight: 1, blendIn: 0.8, speed: 1 };
  ctx.self.audio = flying ? { clip: D.windLoop, loop: true, gain: D.windGain, spatial: true, maxDistance: D.windRange } : null;
  const b = kid(ctx, 'breath'), t = kid(ctx, 'trail'), p = kid(ctx, 'prompt');
  if (b) b.fx = flying ? null : { script: BREATH };
  if (t) t.fx = flying ? { script: TRAIL } : null;
  if (p) p.visible = !flying && !s.rider;
}
function riderHere(ctx, id) { return !!id && ctx.place.players.some((p) => p.id === id); }
function land(ctx) { if (ctx.self.state.mode === 'fly') setMode(ctx, 'land'); }
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state;
    if (s.rider && riderHere(ctx, s.rider)) { if (s.rider === by) land(ctx); return; }
    if (!ctx.getObject(by)) return;
    s.rider = by; s.boost = false;
    ctx.self.controller = by;
    setMode(ctx, 'fly');
    const p = ctx.self.feetPosition;
    ctx.emit('playSound', { clip: D.rumble, position: { x: p.x, y: p.y + 1, z: p.z }, volume: D.rumbleGain, maxDistance: 30 });
  },
};
export function onSpawn(ctx) {
  const s = ctx.self.state;
  s.kind = 'dragon';
  ensureChildren(ctx);
  if (!s.mode) s.mode = 'rest';
  s.clip = null; setMode(ctx, s.mode);
}
export function onControlEnd(ctx, player) {
  const s = ctx.self.state;
  if (s.rider === player.id && s.mode === 'fly') { s.rider = null; setMode(ctx, 'land'); }
}
export function onInput(ctx, input) {
  const a = input.axes || {}, h = input.held || {};
  mind(ctx).in = { x: a.moveX || 0, z: a.moveZ || 0, up: !!h.jump, down: !!h.descend, sin: a.aimYawSin, cos: a.aimYawCos, pitchN: a.aimPitchN ?? 0 };
  if (input.pressed?.interact) land(ctx);
}
function avoid(ctx, p, m, dt) {
  const sp = Math.hypot(m.v.x, m.v.y, m.v.z);
  if (sp < 0.3) return;
  const dir = { x: m.v.x / sp, y: m.v.y / sp, z: m.v.z / sp }, rider = ctx.self.state.rider;
  const hit = raycast(ctx, { x: p.x, y: p.y + D.probeLift, z: p.z }, dir, { distance: sp * dt + D.probeAhead, radius: D.probeRadius, physicsOnly: true, ignoreEntities: rider ? [rider] : [] });
  if (!hit || !hit.normal) return;
  const n = hit.normal, vn = m.v.x * n.x + m.v.y * n.y + m.v.z * n.z;
  if (vn < 0) { m.v.x -= n.x * vn; m.v.y -= n.y * vn; m.v.z -= n.z * vn; }
}
function limits(ctx, p, next, m, dt, minAlt) {
  const g = Math.max(ground(ctx, next.x, next.z), D.seaLevel), floor = g + minAlt;
  if (next.y < floor) { next.y = Math.max(g, Math.min(floor, p.y + D.takeoffRate * dt, Math.max(next.y, p.y) + D.takeoffRate * dt)); if (next.y < floor - 0.01) next.y = Math.min(floor, Math.max(next.y, p.y + D.takeoffRate * dt)); m.v.y = Math.max(m.v.y, 0); }
  if (next.y > g + D.maxAlt) { next.y = g + D.maxAlt; m.v.y = Math.min(m.v.y, 0); }
  const dx = next.x - D.keep.x, dz = next.z - D.keep.z, d = Math.hypot(dx, dz);
  if (d > D.maxRange) { next.x = D.keep.x + dx / d * D.maxRange; next.z = D.keep.z + dz / d * D.maxRange; const out = (m.v.x * dx + m.v.z * dz) / d; if (out > 0) { m.v.x -= dx / d * out; m.v.z -= dz / d * out; } }
}
function ease(cur, target, rate, dt) { return cur + (target - cur) * (1 - Math.exp(-rate * dt)); }
export function update(ctx, dt) {
  const self = ctx.self, s = self.state, m = mind(ctx), p = self.feetPosition;
  if (!p) return;
  if (s.rider && !riderHere(ctx, s.rider)) { s.rider = null; self.controller = null; if (s.mode === 'fly') setMode(ctx, 'land'); }
  if (s.mode === 'rest') {
    const g = ground(ctx, p.x, p.z), rest = Math.max(g, D.seaLevel);
    const off = Math.abs(p.y - rest) > 0.01 || Math.abs(m.pitch) > 0.2 || Math.abs(m.roll) > 0.2;
    if (!off) { const pr = kid(ctx, 'prompt'); if (pr && pr.visible === false && !s.rider) pr.visible = true; ctx.sleep(); return; }
    m.pitch = ease(m.pitch, 0, 4, dt); m.roll = ease(m.roll, 0, 4, dt);
    const y = p.y > rest ? Math.max(rest, p.y - D.settleRate * dt) : rest;
    self.feetPosition = { x: p.x, y, z: p.z }; self.rotation = { yaw: m.yaw, pitch: m.pitch, roll: m.roll };
    if (Math.abs(m.pitch) < 0.2 && Math.abs(m.roll) < 0.2) { m.pitch = 0; m.roll = 0; }
    return;
  }
  let minAlt = D.minAlt, turn = 0;
  if (s.mode === 'fly') {
    const inp = m.in || {};
    const aimed = typeof inp.sin === 'number' && typeof inp.cos === 'number' && (inp.sin || inp.cos);
    const viewYaw = aimed ? Math.atan2(inp.sin, inp.cos) * R2D : m.yaw;
    const fwdKey = inp.z > 0.1, back = inp.z < -0.1;
    m.wHeld = fwdKey ? m.wHeld + dt : 0;
    const boosting = fwdKey && m.wHeld > D.boostAfter;
    if (boosting !== !!s.boost) {
      s.boost = boosting;
      self.audio = { clip: D.windLoop, loop: true, gain: boosting ? D.windBoostGain : D.windGain, spatial: true, maxDistance: D.windRange };
      if (boosting) ctx.emit('playSound', { clip: D.swoosh, position: { x: p.x, y: p.y + 1, z: p.z }, volume: D.swooshGain, maxDistance: 30 });
    }
    const target = boosting ? D.boost : fwdKey ? D.cruise : back ? 0 : Math.min(m.speed, D.coast);
    const up = target > m.speed ? (boosting ? D.boostAccel : D.accel) : D.decel;
    m.speed += clamp(target - m.speed, -up * dt, up * dt);
    turn = clamp(wrap(viewYaw - m.yaw) * D.turnGain, -D.turnRate, D.turnRate);
    m.yaw = wrap(m.yaw + turn * dt);
    const vert = (inp.up ? D.climb : 0) - (inp.down ? D.dive : 0);
    const lookPitch = clamp((inp.pitchN || 0) * 1.2 * R2D * D.pitchFollow, -D.maxPitch, D.maxPitch);
    const targetPitch = clamp((m.speed > 4 ? lookPitch * Math.min(1, m.speed / D.cruise) : 0) + Math.sign(vert) * D.climbPitch, -D.maxPitch, D.maxPitch);
    m.pitch = ease(m.pitch, targetPitch, D.pitchEase, dt);
    const cy = Math.cos(m.yaw * D2R), sy = Math.sin(m.yaw * D2R), cp = Math.cos(m.pitch * D2R), spp = Math.sin(m.pitch * D2R);
    const lp = (m.speed > 4 ? lookPitch * Math.min(1, m.speed / D.cruise) : 0) * D2R;
    const want = { x: -sy * Math.cos(lp) * m.speed + cy * inp.x * D.strafe, y: Math.sin(lp) * m.speed + vert, z: -cy * Math.cos(lp) * m.speed - sy * inp.x * D.strafe };
    m.v.x = ease(m.v.x, want.x, D.response, dt); m.v.y = ease(m.v.y, want.y, D.response * 1.4, dt); m.v.z = ease(m.v.z, want.z, D.response, dt);
    m.roll = ease(m.roll, clamp(turn * D.bankPerTurn - inp.x * D.strafeBank, -D.maxBank, D.maxBank), D.bankEase, dt);
    void cp; void spp;
  } else { // land: glide down onto the ground under it (never onto the lake)
    const g = ground(ctx, p.x, p.z);
    m.speed = 0; m.wHeld = 0; if (s.boost) s.boost = false;
    m.pitch = ease(m.pitch, 0, 2.5, dt); m.roll = ease(m.roll, 0, 3, dt);
    if (g < D.seaLevel + 0.3) {
      const dx = D.keep.x - p.x, dz = D.keep.z - p.z, d = Math.hypot(dx, dz) || 1;
      m.yaw = wrap(m.yaw + clamp(wrap(Math.atan2(-dx, -dz) * R2D - m.yaw), -60 * dt, 60 * dt));
      m.v.x = ease(m.v.x, dx / d * D.shoreSpeed, 1.5, dt); m.v.z = ease(m.v.z, dz / d * D.shoreSpeed, 1.5, dt);
      m.v.y = ease(m.v.y, clamp(D.seaLevel + D.shoreHover - p.y, -3, 3), 2, dt);
    } else {
      m.v.x *= Math.exp(-D.landDrift * dt); m.v.z *= Math.exp(-D.landDrift * dt);
      m.v.y = -Math.min(D.landSink, (p.y - g) * 1.3 + 0.4);
      minAlt = 0;
      if (p.y - g < 0.06) {
        self.feetPosition = { x: p.x, y: g, z: p.z }; self.rotation = { yaw: m.yaw, pitch: m.pitch, roll: m.roll };
        m.v = { x: 0, y: 0, z: 0 };
        s.rider = null; self.controller = null; setMode(ctx, 'rest');
        return;
      }
    }
  }
  avoid(ctx, p, m, dt);
  const next = { x: p.x + m.v.x * dt, y: p.y + m.v.y * dt, z: p.z + m.v.z * dt };
  limits(ctx, p, next, m, dt, minAlt);
  self.feetPosition = next;
  self.rotation = { yaw: m.yaw, pitch: m.pitch, roll: m.roll };
}
