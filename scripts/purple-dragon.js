// Violet, the purple dragon by the wizard tower: sits breathing violet mist; E (the den's press, on her or on her reach pad)
// seats the presser in the saddle and she flies them a scenic autopilot tour of the property, then lands on her sit spot.
// E or space mid-flight = she heads home early. The flight is a pure function of the room clock (state.t0 + state.phase),
// computed on whichever machine simulates her (the rider's while ridden): no per-tick state writes beyond the transform.
import { PD } from './lib/data/purple-dragon.js';
import { restClip, flapClip, glideClip } from './lib/purple-dragon-clips.js';
import { rotate } from 'builtin/vec3';
const R2D = 180 / Math.PI, D2R = Math.PI / 180;
const BREATH = `fx
pop mist rate=flick(.25,.6)*6 on=sphere(.1) life=1.8..3 v=up(.08..0.2)+sdir()*(.1..0.25) size=.1..0.2 acc=buoy(.1)+drag(1.1) col=<.72,.5,1> a=0>.2:.45>.7:.2>0 sz=$size*(.6>2.4) rot=spin(.2) r=sprite(smoke-puff,add)
pop motes rate=3 on=sphere(.15) life=1.2..2.2 v=up(.1..0.3)+sdir()*.15 size=.02..0.05 acc=drag(1) col=hdr(1.6,.9,2.4) a=(0>.2:1>.7:.6>0)*flick(7,.4) r=sprite(mote,add)`;
const TRAIL = `fx
pop sparkle rate=?mobile:10|22 on=sphere(.3) life=.9..1.8 v=sdir()*(.1..0.4) size=.05..0.1 acc=drag(1.4) col=hdr(1.8,1,2.6)>hdr(.7,.35,1.2) a=(1>.6:.8>0)*flick(9,.4) sz=$size*(1>.3) r=sprite(mote,add)`;
const DUST = `fx
pop dust burst=40..56 on=disc(3.2) life=1.1..2 v=radial(3..6)+up(.4..1.4) size=.5..1.1 acc=drag(1.6)+buoy(.15) col=<.72,.66,.54> a=0>.1:.42>.6:.2>0 sz=$size*(.6>2.6) rot=spin(.4) r=sprite(smoke-puff,alpha)
pop leaves burst=16 on=disc(3) life=1..1.8 v=radial(2..4)+up(2..4) size=.05..0.09 spin=-6..6 acc=grav()*.5+drag(1) col=<.42,.58,.28> a=1>.7:1>0 rot=$age*$spin r=sprite(stalk,alpha)`;
const pill = (text, dim) => `<svg viewBox="0 0 ${dim ? 290 : 250} 48" width="${dim ? 0.72 : 0.62}m" billboard="full">
  <rect x="1" y="2" width="${dim ? 286 : 246}" height="44" rx="22" fill="#1d1712" fill-opacity="${dim ? 0.55 : 0.86}" stroke="#f2e6cf" stroke-opacity="${dim ? 0.2 : 0.35}" stroke-width="1.5" />
  <circle cx="24" cy="24" r="15" fill="none" stroke="#f2e6cf" stroke-opacity="${dim ? 0.35 : 1}" stroke-width="1.8" />
  <text x="24" y="31" text-anchor="middle" font-family="sans-serif" font-size="19" fill="#f2e6cf" fill-opacity="${dim ? 0.4 : 1}">E</text>
  <text x="48" y="32" font-family="serif" font-size="26" fill="#f7eedd" fill-opacity="${dim ? 0.5 : 1}">${text}</text>
</svg>`;
const PROMPT = pill('ride the dragon', false), BUSY = pill("someone's riding", true);
const wrap = (a) => ((a % 360) + 540) % 360 - 180, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
function yawOf(r) {
  if (typeof r === 'number') return r;
  if (!r) return 0;
  if (typeof r.w === 'number') return Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) * R2D;
  return r.yaw ?? 0;
}
const ground = (ctx, x, z) => Math.max(ctx.place.terrain.heightAt(x, z) ?? 0, 0);
const CLIPS = { rest: restClip, flap: flapClip, glide: glideClip };
// ── the tour, built once per machine from the data (deterministic) ──
let TOUR = null;
function tour(ctx, home) {
  const key = `${home.x},${home.z}`;
  if (TOUR && TOUR.key === key) return TOUR;
  const P = PD.route.map((p, i) => (i === 0 ? [home.x, home.y + p[1], home.z] : p)), n = P.length, raw = [];
  const cr = (a, b, c, d, u) => { const u2 = u * u, u3 = u2 * u; return a.map((_, k) => 0.5 * (2 * b[k] + (-a[k] + c[k]) * u + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * u2 + (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * u3)); };
  for (let i = 0; i < n; i++) for (let j = 0; j < 40; j++) raw.push(cr(P[(i - 1 + n) % n], P[i], P[(i + 1) % n], P[(i + 2) % n], j / 40));
  raw.push(raw[0]);
  const cum = [0]; for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][2] - raw[i - 1][2]));
  const L = cum[cum.length - 1], M = Math.ceil(L), X = [], Y = [], Z = [];
  for (let m = 0, j = 0; m <= M; m++) { const s = (m / M) * L; while (j < cum.length - 2 && cum[j + 1] < s) j++; const k = (s - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]); X.push(raw[j][0] + (raw[j + 1][0] - raw[j][0]) * k); Y.push(raw[j][1] + (raw[j + 1][1] - raw[j][1]) * k); Z.push(raw[j][2] + (raw[j + 1][2] - raw[j][2]) * k); }
  const ds = L / M, floor = X.map((x, i) => { let f = ground(ctx, x, Z[i]) + PD.minClear; for (const o of PD.obstacles) if (Math.hypot(x - o.x, Z[i] - o.z) < o.r) f = Math.max(f, o.top + PD.obstacleClear); return f; });
  for (let i = 0; i <= M; i++) Y[i] = Math.max(Y[i], floor[i]);
  for (let pass = 0; pass < 2; pass++) { for (let i = 1; i <= M; i++) Y[i] = Math.max(Y[i], Y[i - 1] - PD.maxSlope * ds); for (let i = M - 1; i >= 0; i--) Y[i] = Math.max(Y[i], Y[i + 1] - PD.maxSlope * ds); }
  for (let pass = 0; pass < 3; pass++) { const c = Y.slice(); for (let i = 0; i <= M; i++) { let a = 0; for (let k = -6; k <= 6; k++) a += c[(i + k + M) % M]; Y[i] = Math.max(a / 13, floor[i]); } }
  Y[M] = Y[0];
  const H = X.map((_, i) => { const a = (i - 2 + M) % M, b = (i + 2) % M; return Math.atan2(-(X[b] - X[a]), -(Z[b] - Z[a])) * R2D; });
  const slope = Y.map((_, i) => (Y[(i + 2) % M] - Y[(i - 2 + M) % M]) / (4 * ds));
  let base = 10, T = [];
  for (let it = 0; it < 4; it++) {
    T = [0];
    for (let i = 1; i <= M; i++) { const s = i * ds; let v = clamp(base - PD.speed.slope * slope[i], PD.speed.min, PD.speed.max); v = Math.min(v, PD.speed.end + (v - PD.speed.end) * sm(s / PD.speed.ramp), PD.speed.end + (v - PD.speed.end) * sm((L - s) / PD.speed.brake)); T.push(T[i - 1] + ds / Math.max(1, v)); }
    base *= T[M] / PD.loopSeconds;
  }
  const rollRaw = H.map((_, i) => { const a = (i - 4 + M) % M, b = (i + 4) % M, dt = Math.max(0.05, (T[b] - T[a] + (b < a ? T[M] : 0))); return clamp(wrap(H[b] - H[a]) / dt * PD.bankPerDegS, -PD.maxBank, PD.maxBank); });
  const blur = (A, r) => A.map((_, i) => { let s = 0; for (let k = -r; k <= r; k++) s += A[(i + k + M) % M]; return s / (2 * r + 1); });
  const R = blur(rollRaw, 10), PI = blur(slope.map((s) => clamp(Math.atan(s) * R2D * 1.2, -PD.maxPitch, PD.maxPitch)), 8);
  const C = slope.map((s, i) => (s > 0.03 ? 'flap' : s < -0.04 ? 'glide' : Math.floor(i / 70) % 2 ? 'glide' : 'flap'));
  for (let i = 1, run = 0; i <= M; i++) { if (C[i] === C[i - 1]) run++; else if (run < 40) { C[i] = C[i - 1]; run++; } else run = 0; }
  TOUR = { key, X, Y, Z, H, R, PI, C, T, M, L, dur: T[M] };
  return TOUR;
}
function sample(tr, t) {
  let lo = 0, hi = tr.M; t = clamp(t, 0, tr.dur);
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (tr.T[mid] <= t) lo = mid; else hi = mid; }
  const k = (t - tr.T[lo]) / Math.max(1e-6, tr.T[hi] - tr.T[lo]), l = (A) => A[lo] + (A[hi] - A[lo]) * k;
  return { x: l(tr.X), y: l(tr.Y), z: l(tr.Z), yaw: tr.H[lo] + wrap(tr.H[hi] - tr.H[lo]) * k, roll: l(tr.R), pitch: l(tr.PI), clip: tr.C[lo] };
}
const landTime = (fromY, gy) => Math.max(PD.landMin, (fromY - gy) / PD.landRate);
// where she is at room time `now`; done = touched down
function pose(ctx, now) {
  const s = ctx.self.state, h = s.home, tr = tour(ctx, h), tau = (now - s.t0) / 1000;
  const hover = (from, k, speed) => ({ x: from.x + (h.x - from.x) * sm(k), y: from.y + (h.y - from.y) * sm(k), z: from.z + (h.z - from.z) * sm(k),
    yaw: from.yaw + wrap(h.yaw - from.yaw) * sm(k * 1.4), pitch: -6 * Math.sin(Math.PI * clamp(k, 0, 1)), roll: 0, clip: 'flap', speed, done: k >= 1 });
  if (s.phase === 'tour') {
    const p0 = sample(tr, 0);
    if (tau < PD.takeoff) { const k = tau / PD.takeoff;
      return { x: h.x, y: h.y + (p0.y - h.y) * sm(k), z: h.z, yaw: h.yaw + wrap(p0.yaw - h.yaw) * sm(k), pitch: 14 * Math.sin(Math.PI * k), roll: 0, clip: 'flap', speed: 1.35 }; }
    const tl = tau - PD.takeoff;
    if (tl < tr.dur) return { ...sample(tr, tl), speed: 1 };
    const end = sample(tr, tr.dur), T = landTime(end.y, h.y);
    return hover(end, (tl - tr.dur) / T, 0.9);
  }
  if (s.phase === 'land') { const f = s.from; return hover(f, tau / landTime(f.y, h.y), 0.9); }
  if (s.phase === 'home') {
    const f = s.from, dx = h.x - f.x, dz = h.z - f.z, D = Math.hypot(dx, dz), head = Math.atan2(-dx, -dz) * R2D;
    const moved = Math.min(D, PD.homeSpeed * Math.max(0, tau - 1) * sm(tau / 3)), k = D > 0 ? moved / D : 1;
    const alt = Math.max(f.y, h.y + PD.homeAlt), y = f.y + (alt - f.y) * sm(tau / 3);
    const x = f.x + dx * k, z = f.z + dz * k, yaw = f.yaw + wrap(head - f.yaw) * sm(tau / 2.5);
    return { x, y: Math.max(y, ground(ctx, x, z) + PD.minClear), z, yaw, pitch: 6 * sm(1 - tau / 3), roll: clamp(wrap(head - yaw) * 0.35, -PD.maxBank, PD.maxBank), clip: 'flap', speed: 1.1, arrived: moved >= D - 0.01 };
  }
  return null;
}
function setClip(ctx, clip, speed = 1) {
  const m = mind(ctx);
  const live = ctx.self.anim?.body, liveName = live && typeof live === 'object' ? live.clip?.name : null;
  if (m.clip === clip && m.speed === speed && (!liveName || liveName === 'purple-' + clip)) return;
  m.clip = clip; m.speed = speed;
  ctx.self.anim.body = { clip: CLIPS[clip](), loop: 'loop', weight: 1, blendIn: clip === 'rest' ? 1.2 : 0.6, speed };
}
function mind(ctx) { const all = (ctx.session.purpleDragon ??= {}); return (all[ctx.self.id] ??= { clip: null, beat: 0 }); }
const kid = (ctx, n) => ctx.getObject(ctx.self.id + '/' + n);
function pad(ctx) { return ctx.self.state.pad ? ctx.getObject(ctx.self.state.pad + '/prompt') : null; }
function dressFor(ctx, flying) {
  const b = kid(ctx, 'breath'), t = kid(ctx, 'trail'), p = pad(ctx);
  if (b) b.fx = flying ? null : { script: BREATH };
  if (t) t.fx = flying ? { script: TRAIL } : null;
  if (p) p.vector = flying ? BUSY : PROMPT;
  ctx.self.audio = flying ? { clip: PD.sounds.wind, loop: true, gain: PD.sounds.windGain, spatial: true, maxDistance: 14 } : null;
}
function riderHere(ctx, id) { return !!id && ctx.place.players.some((p) => p.id === id); }
function goHome(ctx) {
  const s = ctx.self.state; if (!s.flying || s.phase === 'land' || s.phase === 'home') return;
  const p = pose(ctx, ctx.now()); if (!p || p.clip === 'flap' && s.phase === 'tour' && (ctx.now() - s.t0) / 1000 > PD.takeoff + tour(ctx, s.home).dur) return; // already landing
  const from = { x: p.x, y: p.y, z: p.z, yaw: p.yaw };
  s.from = from; s.t0 = ctx.now();
  s.phase = Math.hypot(from.x - s.home.x, from.z - s.home.z) < PD.homeNear ? 'land' : 'home';
}
function touchdown(ctx) {
  const s = ctx.self.state, h = s.home;
  ctx.self.feetPosition = { x: h.x, y: h.y, z: h.z }; ctx.self.rotation = { yaw: h.yaw };
  const o = rotate(h.yaw, { x: -3.2, y: 0, z: -1.2 }), dx = h.x + o.x, dz = h.z + o.z;
  s.dropAt = { x: dx, y: ctx.place.terrain.heightAt(dx, dz) ?? h.y, z: dz };
  s.rider = null; s.flying = false; s.phase = 'rest'; s.from = null;
  ctx.self.controller = null;
  setClip(ctx, 'rest'); dressFor(ctx, false);
  ctx.emit('fx', { position: { x: h.x, y: h.y + 0.1, z: h.z }, script: DUST });
}
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state;
    if (s.rider && riderHere(ctx, s.rider)) { if (s.rider === by) goHome(ctx); return; }
    if (s.flying) return;                                        // an unmanned flight finishing: wait for her to land
    if (!ctx.getObject(by)) return;
    s.rider = by; s.flying = true; s.phase = 'tour'; s.t0 = ctx.now(); s.dropAt = null;
    ctx.self.controller = by;
    dressFor(ctx, true);
    const h = s.home;
    ctx.emit('playSound', { clip: PD.sounds.roar, position: { x: h.x, y: h.y + 4, z: h.z }, volume: PD.sounds.roarGain, maxDistance: 90 });
    ctx.emit('fx', { position: { x: h.x, y: h.y + 0.1, z: h.z }, script: DUST });
  },
};
export function onSpawn(ctx) {
  const s = ctx.self.state, f = ctx.self.feetPosition;
  s.kind = PD.kind; s.seat = PD.seat; s.seatYaw = 0;
  if (!s.home) s.home = { x: f.x, y: f.y, z: f.z, yaw: yawOf(ctx.self.rotation) };
  if (!kid(ctx, 'breath')) ctx.spawn('breath', { parent: ctx.self.id, feetPosition: PD.breathAt, physics: 'none', fx: { script: BREATH } });
  if (!kid(ctx, 'trail')) ctx.spawn('trail', { parent: ctx.self.id, feetPosition: PD.trailAt, physics: 'none', fx: null });
  if (!s.phase) s.phase = 'rest';
  mind(ctx).clip = null;
  setClip(ctx, s.phase === 'rest' ? 'rest' : 'flap');
  dressFor(ctx, !!s.flying);
}
export function onControlEnd(ctx, player) { const s = ctx.self.state; if (s.rider === player.id && s.flying) goHome(ctx); }
export function onInput(ctx, input) { if (input.pressed?.interact || input.pressed?.jump) goHome(ctx); }
export function update(ctx, dt) {
  const s = ctx.self.state;
  if (!s.flying) { setClip(ctx, 'rest'); ctx.sleep(); return; }  // after a ride hands her back, this machine puts her back at rest
  if (s.rider && !riderHere(ctx, s.rider)) { s.rider = null; ctx.self.controller = null; goHome(ctx); }
  const now = ctx.now(), p = pose(ctx, now);
  if (!p) return;
  if (p.done) { touchdown(ctx); return; }
  if (p.arrived) { s.from = { x: p.x, y: p.y, z: p.z, yaw: p.yaw }; s.phase = 'land'; s.t0 = now; }
  ctx.self.feetPosition = { x: p.x, y: p.y, z: p.z };
  ctx.self.rotation = { yaw: p.yaw, pitch: p.pitch, roll: p.roll };
  setClip(ctx, p.clip, p.speed ?? 1);
  const m = mind(ctx);
  if (p.clip === 'flap' && now - m.beat > (PD.flapPeriod / (p.speed ?? 1)) * 1000) {
    m.beat = now;
    ctx.emit('playSound', { clip: PD.sounds.flap, position: { x: p.x, y: p.y + 2, z: p.z }, volume: PD.sounds.flapGain, maxDistance: 70 });
  }
}
