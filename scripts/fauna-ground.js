// The one manager of every ground animal (rows tagged "fauna-ground", no update of their own): wander around a home spot,
// follow a leader (pack, mother), stop and watch a player within `notice` m, deer bolt a few metres first, sit/nuzzle when petted.
// Rows farther than WAKE from every player sleep; at most BUDGET rows step a tick. Writes land only when something changes.
import { play, clips } from 'builtin/anim';
import SPECIES from './lib/data/fauna-ground.json';
export const updateSchedule = { every: 3, near: { radius: 1500 } };
const HOUSE = { x: 0, z: -26, r: 9.5 }, WAKE = 250, BUDGET = 40, FALL = -4;
const CACHE = {};
function clipOf(ctx, sp, name) { const c = (CACHE[sp] ??= clips(ctx, `anim/${sp}.yml`)); return c && c[name]; }
function setClip(ctx, row, name, speed = 1) {
  const s = row.state;
  if (s.clip === name && Math.abs((s.cs ?? 1) - speed) < 0.2) return;
  const clip = clipOf(ctx, s.sp, name); if (!clip) return;
  play(ctx, row, clip, { channel: 'body', loop: true, speed, blendIn: 0.3 });
  s.clip = name; s.cs = Math.round(speed * 100) / 100;
}
export function dry(ctx, x, z) {
  if (Math.hypot(x - HOUSE.x, z - HOUSE.z) < HOUSE.r) return false;
  const h = ctx.place.terrain.heightAt(x, z);
  return h != null && h > 0.15;
}
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const wrapDeg = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
const fwd = (yaw) => ({ x: -Math.sin(yaw * Math.PI / 180), z: -Math.cos(yaw * Math.PI / 180) });
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
function scratch(ctx, row) { const all = (ctx.session.fauna ??= {}); return (all[row.id] ??= { yaw: row.state.yaw ?? 0, lastP: null, lastAt: 0, vinit: false }); }
function move(row, m, vx, vz) {
  const v = row.velocity;
  if (!m.vinit || !v || Math.abs(v.x - vx) > 0.04 || Math.abs(v.z - vz) > 0.04) { row.velocity = { x: vx, y: FALL, z: vz }; m.vinit = true; }
}
function turn(row, m, want, rate, dt) {
  const d = wrapDeg(want - m.yaw);
  if (Math.abs(d) > 0.8) { const st = clampN(d, -rate * dt, rate * dt); m.yaw = wrapDeg(m.yaw + st); row.rotation = { yaw: m.yaw }; return Math.abs(d - st) < 25; }
  return true;
}
function pickTarget(ctx, s) {
  for (let i = 0; i < 8; i++) {
    const a = ctx.random() * Math.PI * 2, r = (0.3 + 0.7 * ctx.random()) * (s.range ?? 25);
    const x = s.home.x + Math.cos(a) * r, z = s.home.z + Math.sin(a) * r;
    if (dry(ctx, x, z)) return { x, z };
  }
  return { x: s.home.x, z: s.home.z };
}
function rest(ctx, row, m, S, now, ms) {
  const s = row.state; s.mode = 'idle'; s.until = now + ms; s.yaw = Math.round(m.yaw); move(row, m, 0, 0); setClip(ctx, row, S.idle, 1);
}
function step(ctx, row, rows, near, now, dt) {
  const s = row.state, S = SPECIES[s.sp]; if (!S || !s.home) return;
  const m = scratch(ctx, row), p = row.feetPosition, sc = s.scale ?? 1;
  if (s.petAt && s.petAt !== s.petSeen) {
    s.petSeen = s.petAt; s.mode = 'pet'; s.until = now + 2200; move(row, m, 0, 0);
    const by = s.petBy && ctx.getObject(s.petBy), q = by && (by.worldFeetPosition || by.feetPosition);
    if (q) { m.yaw = yawTo(q.x - p.x, q.z - p.z); row.rotation = { yaw: m.yaw }; }
    setClip(ctx, row, 'pet', 1); return;
  }
  if (s.mode === 'pet') { if (now < s.until) return; rest(ctx, row, m, S, now, 1500); }
  if (s.mode === 'flee') {
    const f = fwd(m.yaw);
    if (now < s.until && dry(ctx, p.x + f.x * 2, p.z + f.z * 2)) return;
    s.mode = 'alert'; move(row, m, 0, 0); setClip(ctx, row, 'alert', 1);
  }
  if (near.d < S.notice) {
    const q = near.p;
    if (S.startle && near.d < S.startle && now > (s.calm ?? 0)) {
      s.calm = now + 9000;
      const away = yawTo(p.x - q.x, p.z - q.z), f = fwd(away);
      if (dry(ctx, p.x + f.x * 3, p.z + f.z * 3)) {
        m.yaw = away; row.rotation = { yaw: away }; s.mode = 'flee'; s.until = now + 1300;
        move(row, m, f.x * S.run * sc, f.z * S.run * sc); setClip(ctx, row, 'walk', clampN(S.run / (S.stride * sc), 0.5, 2.4)); return;
      }
    }
    if (s.mode !== 'alert') { s.mode = 'alert'; move(row, m, 0, 0); setClip(ctx, row, 'alert', 1); }
    turn(row, m, yawTo(q.x - p.x, q.z - p.z), 160, dt); return;
  }
  if (s.mode === 'alert') { if (near.d < S.notice + 1.5) return; rest(ctx, row, m, S, now, 800 + ctx.random() * 1500); }
  if (s.mode !== 'walk') {
    if (s.mode !== 'idle') s.mode = 'idle';
    setClip(ctx, row, S.idle, 1);
    if (now < (s.until ?? 0)) return;
    const t = pickTarget(ctx, s); s.tx = Math.round(t.x * 10) / 10; s.tz = Math.round(t.z * 10) / 10; s.mode = 'walk';
    m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
  }
  let tx = s.tx, tz = s.tz, speed = S.walk * (0.55 + 0.45 * sc);
  const lead = s.follow && rows[s.follow];
  if (lead && lead.feetPosition) {
    tx = lead.feetPosition.x + (s.off?.x ?? 0); tz = lead.feetPosition.z + (s.off?.z ?? 0);
    const dl = Math.hypot(tx - p.x, tz - p.z);
    if (dl > 5) speed = S.trot * (0.6 + 0.4 * sc);
    if (dl < 1.2 && lead.state?.mode !== 'walk') { rest(ctx, row, m, S, now, 1200); return; }
  }
  const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
  if (dist < 1) { rest(ctx, row, m, S, now, (S.idleMin + ctx.random() * (S.idleMax - S.idleMin)) * 1000); return; }
  const aligned = turn(row, m, yawTo(dx, dz), 150, dt), f = fwd(m.yaw), look = 1.2 + 1.2 * sc;
  if (!dry(ctx, p.x + f.x * look, p.z + f.z * look)) { rest(ctx, row, m, S, now, 1500 + ctx.random() * 1500); return; }
  const v = aligned ? speed : speed * 0.25;
  move(row, m, f.x * v, f.z * v); setClip(ctx, row, 'walk', clampN(v / (S.stride * sc), 0.4, 2.4));
  if (now - m.lastAt > 4000) {
    if (m.lastP && Math.hypot(p.x - m.lastP.x, p.z - m.lastP.z) < 1 && !lead) { rest(ctx, row, m, S, now, 1000); return; }
    m.lastP = { x: p.x, z: p.z }; m.lastAt = now;
  }
}
export function update(ctx, dt) {
  const now = ctx.now(), st = ctx.self.state, players = [];
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (q) players.push(q); }
  const list = ctx.query({ tags: ['fauna-ground'] }), rows = {};
  for (const r of list) rows[r.id] = r;
  const n = list.length, start = n ? (ctx.session.faunaCursor ?? 0) % n : 0;
  let stepped = 0;
  for (let i = 0; i < n; i++) {
    const row = list[(start + i) % n], p = row.feetPosition;
    if (!p || !row.state?.sp) continue;
    let d = Infinity, q = null;
    for (const pp of players) { const e = Math.hypot(pp.x - p.x, pp.z - p.z); if (e < d) { d = e; q = pp; } }
    if (d > WAKE) {
      if (!row.state.zz) { row.state.zz = true; row.velocity = { x: 0, y: FALL, z: 0 }; if (row.state.mode === 'walk' || row.state.mode === 'flee') row.state.mode = 'idle'; }
      continue;
    }
    if (row.state.zz) row.state.zz = false;
    if (stepped >= BUDGET) { ctx.session.faunaCursor = (start + i) % n; break; }
    stepped++;
    step(ctx, row, rows, { d, p: q }, now, dt);
  }
  if (now - (st.stampAt ?? 0) > 2000) { st.stampAt = now; st.count = n; st.awake = stepped; }
}
