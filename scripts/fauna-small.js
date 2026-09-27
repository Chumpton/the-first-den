// ONE manager for every row tagged "fauna-small": squirrels & rabbits hop the lawns, ducks paddle the lake, songbird flocks
// wheel above the canopy and swoop to the grass, singles flit between perches. Rows carry state.kind; tuning in lib/data/fauna-small.js.
import { FAUNA as F } from './lib/data/fauna-small.js';
export const updateSchedule = { every: 2 };
const TAU = Math.PI * 2, DEG = 180 / Math.PI;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * DEG;
const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
const rand = (ctx, [a, b]) => a + ctx.random() * (b - a);
function setClip(S, o, kind, name) {
  if (S.clip[o.id] === name) return; S.clip[o.id] = name;
  o.anim.body = { clip: `anim/critter-${kind}.yml#${name}`, loop: 'loop', weight: 1, blendIn: 0.2 };
}
function put(S, o, p, rot) {
  const l = S.pos[o.id];
  if (l && Math.abs(l.x - p.x) < 0.005 && Math.abs(l.y - p.y) < 0.005 && Math.abs(l.z - p.z) < 0.005) return;
  S.pos[o.id] = p; o.feetPosition = p; if (rot) o.rotation = rot;
}
function okGround(ctx, x, z) {
  if (Math.hypot(x - F.home.x, z - F.home.z) > F.ring[1] || Math.hypot(x - F.home.x, z - F.home.z) < F.ring[0]) return false;
  if (Math.hypot(x - F.house.x, z - F.house.z) < F.house.r || Math.hypot(x - F.lake.x, z - F.lake.z) < F.lake.dry) return false;
  const h = ctx.place.terrain.heightAt(x, z); return h != null && h > F.dryY;
}
function pickGround(ctx, p, range) {
  for (let k = 0; k < 8; k++) {
    const a = ctx.random() * TAU, d = rand(ctx, range), x = p.x + Math.cos(a) * d, z = p.z + Math.sin(a) * d;
    if (okGround(ctx, x, z) && okGround(ctx, (x + p.x) / 2, (z + p.z) / 2)) return { x, z };
  }
  return null;
}
function ground(ctx, S, o, now, dt, near) {
  const s = o.state, sp = F[s.kind], p = o.feetPosition;
  if (s.petAt && now - s.petAt < F.petMs) {
    const by = ctx.getObject(s.petBy), q = by && (by.worldFeetPosition || by.feetPosition);
    if (q && s.mode !== 'pet') { o.rotation = { yaw: yawTo(q.x - p.x, q.z - p.z) }; s.mode = 'pet'; s.until = now + F.petMs; }
    setClip(S, o, s.kind, 'sit'); return;
  }
  if (near && near.d < sp.shy && s.mode === 'move') {
    s.mode = s.kind === 'squirrel' ? 'alert' : 'sit'; s.until = now + rand(ctx, [1.5, 3.5]) * 1000;
    o.rotation = { yaw: yawTo(near.p.x - p.x, near.p.z - p.z) }; setClip(S, o, s.kind, s.mode); return;
  }
  if (s.mode === 'move') {
    const dx = s.tx - p.x, dz = s.tz - p.z, d = Math.hypot(dx, dz);
    if (d < 0.15) {
      let r = ctx.random(), pick = sp.rest[0];
      for (const row of sp.rest) { if (r < row[1]) { pick = row; break; } r -= row[1]; }
      s.mode = pick[0]; s.until = now + rand(ctx, [pick[2], pick[3]]) * 1000; setClip(S, o, s.kind, pick[0]); return;
    }
    const st = Math.min(d, sp.speed * dt), x = p.x + (dx / d) * st, z = p.z + (dz / d) * st;
    const h = ctx.place.terrain.heightAt(x, z);
    put(S, o, { x, y: h ?? p.y, z }, { yaw: yawTo(dx, dz) }); setClip(S, o, s.kind, 'hop'); return;
  }
  if (now > (s.until ?? 0)) {
    const t = pickGround(ctx, p, sp.hop);
    if (t) { s.tx = t.x; s.tz = t.z; s.mode = 'move'; } else s.until = now + 1000;
  } else setClip(S, o, s.kind, s.mode === 'pet' ? 'sit' : (s.mode || 'idle'));
}
function duck(ctx, S, o, now, dt) {
  const s = o.state, D = F.duck, p = o.feetPosition;
  if (s.mode === 'dabble') { if (now > s.until) { s.mode = 'paddle'; s.until = now + rand(ctx, D.paddle) * 1000; } else { setClip(S, o, 'duck', 'dabble'); return; } }
  if (s.tx == null || Math.hypot(s.tx - p.x, s.tz - p.z) < 0.3) {
    const a = ctx.random() * TAU, r = Math.sqrt(ctx.random()) * F.lake.swim; s.tx = F.lake.x + Math.cos(a) * r; s.tz = F.lake.z + Math.sin(a) * r;
  }
  if (now > (s.until ?? 0)) { if (s.until) { s.mode = 'dabble'; s.until = now + D.dabble * 1000; setClip(S, o, 'duck', 'dabble'); return; } s.until = now + rand(ctx, D.paddle) * 1000; }
  const dx = s.tx - p.x, dz = s.tz - p.z, d = Math.hypot(dx, dz) || 1, st = D.speed * dt;
  put(S, o, { x: p.x + (dx / d) * st, y: D.y, z: p.z + (dz / d) * st }, { yaw: yawTo(dx, dz) }); setClip(S, o, 'duck', 'paddle');
}
function tickFlocks(ctx, self, now) {
  const B = F.bird, fl = self.state.flocks ?? (self.state.flocks = F.flocks.map((_, i) => ({ mode: 'air', t0: now, next: now + (20 + i * 15) * 1000, spot: 0 })));
  fl.forEach((f, i) => {
    if (f.mode === 'air' && now > f.next) { f.mode = 'down'; f.t0 = now; f.spot = Math.floor(ctx.random() * F.flocks[i].spots.length); }
    else if (f.mode === 'down' && now - f.t0 > B.swoop * 1000) { f.mode = 'ground'; f.t0 = now; f.next = now + rand(ctx, B.ground) * 1000; }
    else if (f.mode === 'ground' && now > f.next) { f.mode = 'up'; f.t0 = now; }
    else if (f.mode === 'up' && now - f.t0 > B.swoop * 1000) { f.mode = 'air'; f.t0 = now; f.next = now + rand(ctx, B.air) * 1000; }
  });
  return fl;
}
function airPos(c, slot, T) {
  const th = c.dir * c.w * T + c.phase - slot * 0.2 * c.dir, cx = c.cx + c.drift * Math.sin(T * 0.031 + c.phase), cz = c.cz + c.drift * Math.cos(T * 0.027 + c.phase * 1.3);
  const R = c.R + 2.2 * Math.sin(T * 0.8 + slot * 1.9);
  return { x: cx + Math.cos(th) * R, y: c.alt + 1.6 * Math.sin(T * 0.6 + slot * 1.3) + (slot % 2) * 1.2, z: cz + Math.sin(th) * R };
}
function flockBird(ctx, S, o, fl, now) {
  const s = o.state, c = F.flocks[s.flock], f = fl[s.flock], T = now / 1000, air = airPos(c, s.slot, T);
  const sp = c.spots[f.spot], a = s.slot * 2.4, r = 0.6 + s.slot * 0.25, gx = sp[0] + Math.cos(a) * r, gz = sp[1] + Math.sin(a) * r;
  const g = { x: gx, y: ctx.place.terrain.heightAt(gx, gz) ?? 0.5, z: gz }, u = (now - f.t0) / (F.bird.swoop * 1000);
  let p, clip;
  if (f.mode === 'air') { p = air; clip = Math.sin(T * 0.45 + s.slot * 2) > 0.2 ? 'glide' : 'flap'; }
  else if (f.mode === 'down') { const e = ease(u); p = { x: air.x + (g.x - air.x) * e, y: air.y + (g.y - air.y) * e, z: air.z + (g.z - air.z) * e }; clip = u > 0.85 ? 'flap' : 'glide'; }
  else if (f.mode === 'up') { const e = ease(u); p = { x: g.x + (air.x - g.x) * e, y: g.y + (air.y - g.y) * e, z: g.z + (air.z - g.z) * e }; clip = 'flap'; }
  else { p = g; clip = 'perch'; }
  const l = S.pos[o.id], dx = l ? p.x - l.x : 0, dz = l ? p.z - l.z : 0;
  const rot = Math.hypot(dx, dz) > 0.02 ? { yaw: yawTo(dx, dz), roll: f.mode === 'air' ? -18 * c.dir : 0 } : null;
  put(S, o, p, rot); setClip(S, o, 'bird', clip);
}
function singleBird(ctx, S, o, now) {
  const s = o.state, B = F.bird, P = s.perches;
  if (s.mode === 'flit') {
    const a = P[s.from], b = P[s.i], u = (now - s.t0) / (B.flit * 1000);
    if (u >= 1) { s.mode = 'perch'; s.until = now + rand(ctx, B.perch) * 1000; put(S, o, { x: b[0], y: b[1], z: b[2] }); setClip(S, o, 'bird', 'perch'); return; }
    const e = ease(u);
    put(S, o, { x: a[0] + (b[0] - a[0]) * e, y: a[1] + (b[1] - a[1]) * e + 1.5 * Math.sin(Math.PI * u), z: a[2] + (b[2] - a[2]) * e }, { yaw: yawTo(b[0] - a[0], b[2] - a[2]) });
    setClip(S, o, 'bird', 'flap'); return;
  }
  const at = P[s.i ?? 0]; put(S, o, { x: at[0], y: at[1], z: at[2] }); setClip(S, o, 'bird', 'perch');
  if (now > (s.until ?? 0)) { if (!s.until) { s.until = now + rand(ctx, B.perch) * 1000; return; } s.from = s.i ?? 0; s.i = (s.from + 1 + Math.floor(ctx.random() * (P.length - 1))) % P.length; s.mode = 'flit'; s.t0 = now; }
}
export function update(ctx, dt) {
  const S = (ctx.session.faunaSmall ??= { clip: {}, pos: {}, last: {}, cursor: 0, nextSong: 0, nextQuack: 0 });
  const now = ctx.now(), players = ctx.place.players.map((p) => p.worldFeetPosition || p.feetPosition).filter(Boolean);
  if (!players.length) { ctx.sleep(2); return; }
  const fl = tickFlocks(ctx, ctx.self, now), rows = ctx.query({ tags: ['fauna-small'] }), n = rows.length, cap = Math.min(n, F.maxPerTick);
  const birds = [], ducks = [];
  for (let k = 0; k < cap; k++) {
    const o = rows[(S.cursor + k) % n], p = o.feetPosition, s = o.state; if (!p || !s?.kind) continue;
    let near = null; for (const q of players) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (!near || d < near.d) near = { d, p: q }; }
    const odt = Math.min(F.maxDt, (now - (S.last[o.id] ?? now - dt * 1000)) / 1000); S.last[o.id] = now;
    if (near.d > F.cullDistance) continue;
    if (s.kind === 'bird') { if (s.flock != null) flockBird(ctx, S, o, fl, now); else singleBird(ctx, S, o, now); if (near.d < F.bird.songRange) birds.push(o); }
    else if (s.kind === 'duck') { duck(ctx, S, o, now, odt); if (near.d < 40) ducks.push(o); }
    else ground(ctx, S, o, now, odt, near);
  }
  S.cursor = n ? (S.cursor + cap) % n : 0;
  if (now > S.nextSong && birds.length) {
    const b = birds[Math.floor(ctx.random() * birds.length)], songs = F.bird.songs;
    ctx.emit('playSound', { clip: songs[Math.floor(ctx.random() * songs.length)], position: b.feetPosition, volume: 0.12, pitch: 0.92 + ctx.random() * 0.2, maxDistance: 40 });
    S.nextSong = now + rand(ctx, F.bird.songEvery) * 1000;
  }
  if (now > S.nextQuack && ducks.length) {
    const d = ducks[Math.floor(ctx.random() * ducks.length)];
    ctx.emit('playSound', { clip: F.duck.quack, position: d.feetPosition, volume: 0.15, pitch: 0.9 + ctx.random() * 0.2, maxDistance: 35 });
    S.nextQuack = now + rand(ctx, F.duck.quackEvery) * 1000;
  }
}
