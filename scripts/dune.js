// Dune, the family German Shepherd (row 'dune'): walks the property loop in scripts/lib/data/dune.yml, pausing to sit or
// sniff, now and then turning back; trots over to greet a player within reach once a minute; E tosses him a treat — he
// trots to it, crunches it, wags with hearts and sits by whoever threw it. state { mode: roam|greet|treat|sit, wp, target }.
import { play, clips } from 'builtin/anim';
import { animate } from 'builtin/tween';
import { traverseCheck } from 'builtin/physics';
import { rotate } from 'builtin/vec3';
import D from './lib/data/dune.yml';
export const updateSchedule = { every: 2 };
const W = D.waypoints, N = W.length;
const HEARTS = `fx
pop hearts burst=6..9 on=disc(.2) life=1.1..1.6 v=up(.5..0.9)+sdir()*.35 size=.08..0.14 acc=buoy(.4)+drag(1.5) sz=$size*(.3>1.1:.15>1:.3>.8) col=<2.2,.7,.9> a=0>1:.1>1:.7>0 r=sprite(soft-disc,add)`;
const DUST = `fx
pop dust rate=?mobile:6|10 on=disc(.18) life=.5..0.8 v=up(.3..0.6)+sdir()*.3 size=.12..0.2 acc=buoy(.3)+drag(1.6) col=<.72,.64,.52> a=0>.22:.3>.7:.12>0 sz=$size*(.6>1.8) rot=spin(.2) r=sprite(smoke-puff,alpha)`;
let CL = null;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const posOf = (o) => o && (o.worldFeetPosition || o.feetPosition);
const playerPos = (ctx, id) => posOf(ctx.place.players.find((p) => p.id === id) || (id && ctx.getObject(id)));
function mem(ctx) { const all = (ctx.session.dune ??= {}); return (all[ctx.self.id] ??= { yaw: ctx.self.state.yaw ?? 0, vinit: false, clip: null, cs: 0, dust: false, lastP: null, lastAt: 0 }); }
function setClip(ctx, m, name, speed = 1) {
  if (m.clip === name && Math.abs(m.cs - speed) < 0.15) return;
  CL ??= clips(ctx, 'anim/dog.yml'); const c = CL && CL[name]; if (!c) return;
  play(ctx, ctx.self, c, { channel: 'body', loop: true, speed, blendIn: 0.3 }); m.clip = name; m.cs = speed;
}
function move(ctx, m, vx, vz) {
  const v = ctx.self.velocity;
  if (!m.vinit || !v || Math.abs(v.x - vx) > 0.04 || Math.abs(v.z - vz) > 0.04) { ctx.self.velocity = { x: vx, y: D.fall, z: vz }; m.vinit = true; }
}
function dust(ctx, m, on) { if (m.dust !== on) { ctx.self.fx = on ? { script: DUST } : null; m.dust = on; } }
function turn(ctx, m, want, dt) {
  const d = wrapDeg(want - m.yaw);
  if (Math.abs(d) > 1) { const st = clampN(d, -D.turnRate * dt, D.turnRate * dt); m.yaw = wrapDeg(m.yaw + st); ctx.self.rotation = { yaw: m.yaw }; return Math.abs(d - st) < 30; }
  return true;
}
function halt(ctx, m, clip) { move(ctx, m, 0, 0); dust(ctx, m, false); setClip(ctx, m, clip); }
function face(ctx, m, p, q, dt) { if (q) turn(ctx, m, yawTo(q.x - p.x, q.z - p.z), dt); }
function setTarget(s, x, z) { const t = s.target; if (!t || Math.abs(t.x - x) > 0.05 || Math.abs(t.z - z) > 0.05) s.target = { x: Math.round(x * 100) / 100, z: Math.round(z * 100) / 100 }; }
// 'moving' | 'arrived' | 'stuck'
function goTo(ctx, m, p, tx, tz, speed, reach, dt, now) {
  const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
  if (dist < reach) { m.lastP = null; return 'arrived'; }
  const aligned = turn(ctx, m, yawTo(dx, dz), dt), r = m.yaw * Math.PI / 180;
  const v = aligned ? Math.min(speed, dist * 2 + 0.4) : speed * 0.3, trot = speed > D.walk * 1.3;
  move(ctx, m, -Math.sin(r) * v, -Math.cos(r) * v);
  setClip(ctx, m, trot ? 'trot' : 'walk', Math.round(clampN(v / (trot ? D.stride.trot : D.stride.walk), 0.5, 1.8) * 10) / 10);
  dust(ctx, m, trot);
  if (!m.lastP) { m.lastP = { x: p.x, z: p.z }; m.lastAt = now; }
  else if (now - m.lastAt > D.stuck.seconds * 1000) {
    const moved = Math.hypot(p.x - m.lastP.x, p.z - m.lastP.z); m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
    if (moved < D.stuck.metres) return 'stuck';
  }
  return 'moving';
}
function clear(ctx, p, x, z) {
  const h = ctx.place.terrain.heightAt(x, z) ?? p.y;
  const r = traverseCheck(ctx, { x: p.x, y: p.y + 0.05, z: p.z }, { x, y: h + 0.05, z });
  return !r || r.traversable !== false;
}
function nextWp(ctx, s, p) {
  if (ctx.random() < D.reverseChance) s.dir = -(s.dir || 1);
  const dir = s.dir || 1; let wp = s.wp ?? 0;
  for (let i = 0; i < N; i++) { wp = (((wp + dir) % N) + N) % N; if (clear(ctx, p, W[wp][0], W[wp][1])) break; }
  s.wp = wp; setTarget(s, W[wp][0], W[wp][1]);
}
function resume(ctx, s, p) {
  const order = W.map((w, i) => [Math.hypot(w[0] - p.x, w[1] - p.z), i]).sort((a, b) => a[0] - b[0]);
  let wp = order[0][1];
  for (const [, i] of order.slice(0, 5)) if (clear(ctx, p, W[i][0], W[i][1])) { wp = i; break; }
  s.mode = 'roam'; s.wp = wp; s.phase = null; setTarget(s, W[wp][0], W[wp][1]);
}
function sound(ctx, clip, p, volume = 0.6) { ctx.emit('playSound', { clip, position: { x: p.x, y: p.y + 0.6, z: p.z }, volume, maxDistance: 22 }); }
function treat(ctx, m, s, p, now, dt) {
  const list = s.treats || [], t = list[0];
  if (s.phase === 'go' || !s.phase) {
    if (!t) { s.phase = 'come'; return; }
    s.phase = 'go'; setTarget(s, t.x, t.z);
    if (now > t.lands && !ctx.getObject(t.id)) { s.treats = list.slice(1); return; }
    const r = goTo(ctx, m, p, t.x, t.z, D.trot, D.treat.reach, dt, now);
    if (r === 'stuck') { s.treats = list.slice(1); return; }
    if (r === 'arrived') {
      if (now < t.lands) { halt(ctx, m, 'idle'); return; }
      s.phase = 'eat'; s.until = now + D.treat.eat * 1000; s.by = t.by; halt(ctx, m, 'eat'); sound(ctx, D.sounds.crunch, p, 0.7);
    }
  } else if (s.phase === 'eat') {
    halt(ctx, m, 'eat');
    if (now < s.until) return;
    if (t) { if (ctx.getObject(t.id)) ctx.destroy(t.id); s.treats = list.slice(1); }
    const top = { x: p.x, y: p.y + 1.0, z: p.z };
    ctx.emit('fx', { position: top, script: HEARTS });
    ctx.emit('damageNumber', { position: { x: top.x, y: top.y + 0.25, z: top.z }, text: D.hearts.text, color: D.hearts.color, size: 0.5, lifetime: 2.5 });
    sound(ctx, D.sounds.bark, p, 0.55);
    s.phase = 'happy'; s.until = now + D.treat.happy * 1000; halt(ctx, m, 'wag');
  } else if (s.phase === 'happy') {
    halt(ctx, m, 'wag'); face(ctx, m, p, playerPos(ctx, s.by), dt);
    if (now >= s.until) s.phase = (s.treats || []).length ? 'go' : 'come';
  } else if (s.phase === 'come') {
    const q = playerPos(ctx, s.by);
    const r = q ? goTo(ctx, m, p, q.x, q.z, D.trot, D.treat.sitBy, dt, now) : 'stuck';
    if (q) setTarget(s, q.x, q.z);
    if (r === 'arrived' || r === 'stuck') { s.mode = 'sit'; s.pose = 'sit'; s.phase = null; s.until = now + D.treat.sit * 1000; halt(ctx, m, 'sit'); }
  }
}
export function update(ctx, dt) {
  const me = ctx.self, s = me.state, p = posOf(me), now = ctx.now(), m = mem(ctx);
  if (!p) return;
  let near = null, nd = Infinity;
  for (const pl of ctx.place.players) { const q = posOf(pl); if (!q) continue; const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < nd) { nd = d; near = pl; } }
  if (nd > D.wake && !(s.treats || []).length) { halt(ctx, m, 'idle'); ctx.sleep(D.sleepSeconds); return; }
  if ((s.treats || []).length && s.mode !== 'treat') { s.mode = 'treat'; s.phase = 'go'; }
  if (s.mode === 'treat') return treat(ctx, m, s, p, now, dt);
  if (s.mode === 'sit') {
    halt(ctx, m, s.pose || 'sit');
    if (s.pose === 'sit' && s.by) face(ctx, m, p, playerPos(ctx, s.by), dt);
    if (now < (s.until ?? 0)) return;
    s.pose = null; s.by = null;
    if (s.wp == null || s.back) { s.back = false; resume(ctx, s, p); } else { s.mode = 'roam'; nextWp(ctx, s, p); }
    return;
  }
  if (s.mode === 'greet') {
    const q = playerPos(ctx, s.by);
    if (!q || now > s.until) { resume(ctx, s, p); return; }
    if (s.phase === 'go') {
      const r = goTo(ctx, m, p, q.x, q.z, D.trot, D.greet.stop, dt, now); setTarget(s, q.x, q.z);
      if (r === 'stuck') { resume(ctx, s, p); return; }
      if (r === 'arrived') { s.phase = 'wag'; s.until = now + D.greet.hold * 1000; halt(ctx, m, 'wag'); sound(ctx, D.sounds.bark, p, 0.45); }
    } else { halt(ctx, m, 'wag'); face(ctx, m, p, q, dt); }
    return;
  }
  // roam
  if (s.mode !== 'roam') { resume(ctx, s, p); return; }
  if (near && nd < D.greet.radius && now > (s.greetAt ?? 0)) { s.greetAt = now + D.greet.cooldown * 1000; s.mode = 'greet'; s.phase = 'go'; s.by = near.id; s.until = now + D.greet.giveUp * 1000; return; }
  const wp = W[(s.wp ?? 0) % N];
  if (!s.target) setTarget(s, wp[0], wp[1]);
  const r = goTo(ctx, m, p, wp[0], wp[1], D.walk, D.arrive, dt, now);
  if (r === 'stuck') { nextWp(ctx, s, p); return; }
  if (r === 'arrived') {
    if (ctx.random() < D.pause.chance) {
      const poses = D.pause.poses; s.mode = 'sit'; s.pose = poses[Math.floor(ctx.random() * poses.length)] || 'idle'; s.by = null;
      s.until = now + (D.pause.min + ctx.random() * (D.pause.max - D.pause.min)) * 1000; halt(ctx, m, s.pose);
    } else nextWp(ctx, s, p);
  }
}
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state, now = ctx.now(), list = s.treats || [];
    if (list.length >= D.treat.max || now - (s.tossAt || 0) < D.treat.cooldown * 1000) return;
    const pl = ctx.place.players.find((x) => x.id === by) || ctx.getObject(by), q = posOf(pl), me = posOf(ctx.self);
    if (!q) return;
    let f = null; try { f = rotate(pl.rotation ?? 0, { x: 0, y: 0, z: -1 }); } catch (e) { f = null; }
    let fl = f ? Math.hypot(f.x, f.z) : 0;
    if (fl < 0.2 && me) { f = { x: me.x - q.x, z: me.z - q.z }; fl = Math.hypot(f.x, f.z); }
    if (fl < 0.01) { f = { x: 0, z: -1 }; fl = 1; }
    const fx = f.x / fl, fz = f.z / fl, T = D.treat;
    const sx = q.x + fx * 0.3, sy = q.y + T.chest, sz = q.z + fz * 0.3, tx = q.x + fx * T.ahead, tz = q.z + fz * T.ahead;
    const ty = (ctx.place.terrain.heightAt(tx, tz) ?? q.y) + 0.005;
    const id = ctx.spawn({ tags: ['dune-treat'], lifetime: T.life, feetPosition: { x: sx, y: sy, z: sz }, rotation: { yaw: Math.floor(ctx.random() * 360) }, castShadow: true, primitive: { kind: 'scripted', script: 'scripts/gen/dog-treat.js' } });
    const arc = [0, 0.25, 0.5, 0.75, 1].map((u) => sy + (ty - sy) * u + 4 * T.peak * u * (1 - u));
    animate(ctx, id, { 'feetPosition.x': tx, 'feetPosition.z': tz, 'feetPosition.y': arc }, { duration: T.flight, easing: 'linear' });
    ctx.emit('playSound', { clip: D.sounds.toss, position: { x: sx, y: sy, z: sz }, volume: 0.5, maxDistance: 15 });
    ctx.emit('haptic', { kind: 'soft' }, { audience: { player: by } });
    s.tossAt = now;
    s.treats = [...list, { id, x: Math.round(tx * 100) / 100, y: Math.round(ty * 100) / 100, z: Math.round(tz * 100) / 100, by, lands: now + T.flight * 1000 }];
    if (s.mode !== 'treat') { s.mode = 'treat'; s.phase = 'go'; s.back = true; }
  },
};
