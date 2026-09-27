// The one manager of the road travellers (rows tagged "traveller", no behavior of their own). Roads are the place's
// road-<name>-<n> terrain marks chained in key order. A row's arc position is analytic: s at time `at`, moving dir*speed;
// rows within NEAR m of a player are placed each tick in their right-hand lane; far rows only get s re-based by timestamp.
import { createPath } from 'builtin/path';
import { play, stop, clips } from 'builtin/anim';
import { raycast } from 'builtin/physics';
import T from './lib/data/travellers.json';
export const updateSchedule = { every: 2, near: { radius: 1500 } };
let ROADS = null, CLIPS = null;
const r2 = (v) => Math.round(v * 100) / 100;
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI;
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
function fold(u, L, dir) { const P = 2 * L, m = ((u % P) + P) % P; return m <= L ? { s: m, dir } : { s: P - m, dir: -dir }; }
function buildRoads(ctx) {
  const marks = ctx.place.terrain && ctx.place.terrain.marks; if (!marks) return null;
  const groups = {};
  for (const key of Object.keys(marks)) {
    const m = marks[key], g = /^road-([a-z]+)-(\d+)$/.exec(key);
    if (!m || m.kind !== 'road' || !g || !Array.isArray(m.points) || m.points.length < 2) continue;
    (groups[g[1]] ??= []).push({ i: Number(g[2]), pts: m.points.map((p) => [Number(p[0]), Number(p[1])]) });
  }
  const out = {};
  for (const name of Object.keys(groups)) {
    const segs = groups[name].sort((a, b) => a.i - b.i), pts = [];
    for (const sg of segs) for (const p of sg.pts) { const l = pts[pts.length - 1]; if (!l || Math.hypot(l[0] - p[0], l[1] - p[1]) > 0.05) pts.push(p); }
    if (pts.length < 2) continue;
    const path = createPath(pts, { smooth: true, spacing: 2 }), gaps = [];
    for (let k = 0; k < segs.length - 1; k++) {
      const e = segs[k].pts[segs[k].pts.length - 1], b = segs[k + 1].pts[0], A = path.nearest(e[0], e[1]), B = path.nearest(b[0], b[1]);
      if (A && B) gaps.push([A.arcLength - 2, B.arcLength + 2]);
    }
    out[name] = { path, L: path.length, gaps };
  }
  return Object.keys(out).length ? out : null;
}
// feet height: the terrain, or across a gap between road segments (a bridge) whatever static deck is under the lane
function groundY(ctx, road, u, x, z) {
  const h = ctx.place.terrain.heightAt(x, z);
  for (const [a, b] of road.gaps) if (u > a && u < b) {
    const hit = raycast(ctx, { x, y: Math.max(h ?? 0, 0.5) + 8, z }, { x: 0, y: -1, z: 0 }, { distance: 20, bodies: 'static', physicsOnly: true });
    return hit ? hit.position.y : Math.max(h ?? 0.5, 0.5);
  }
  return h ?? 0.5;
}
function lanePoint(road, u, dir) {
  const c = road.path.at(Math.max(0, Math.min(road.L, u))), fx = c.tx * dir, fz = c.tz * dir;
  return { x: c.x - fz * T.lane, z: c.z + fx * T.lane, fx, fz };
}
function seed(ctx, have, now) {
  for (const e of T.roster) {
    if (have.has(e.id)) continue;
    const K = T.kinds[e.kind], road = ROADS[e.road]; if (!K || !road) continue;
    const s = Math.min(e.s, road.L - 1), lp = lanePoint(road, s, e.dir), y = groundY(ctx, road, s, lp.x, lp.z);
    const spec = {
      id: e.id, tags: ['traveller', e.kind], feetPosition: { x: lp.x, y, z: lp.z }, rotation: { yaw: yawOf(lp.fx, lp.fz) }, physics: 'none', scale: e.scale ?? 1,
      primitive: { kind: 'scripted', script: K.script, params: e.params ?? {} },
      state: { road: e.road, s, dir: e.dir, speed: K.speed, kind: e.kind, at: now, gaitMul: e.gaitMul ?? 1 },
    };
    if (K.audio) spec.audio = K.audio;
    ctx.spawn(spec);
  }
}
export function update(ctx) {
  ROADS ??= buildRoads(ctx); if (!ROADS) return;
  CLIPS ??= clips(ctx, 'anim/traveller.yml');
  const now = ctx.now(), S = (ctx.session.trv ??= { clip: {}, pos: {}, yaw: {}, spawnAt: 0, rebase: 0 });
  const rows = ctx.query({ tags: ['traveller'] });
  if (rows.length < T.roster.length && now - S.spawnAt > 10000) { S.spawnAt = now; seed(ctx, new Set(rows.map((r) => r.id)), now); return; }
  const players = [];
  for (const pl of ctx.place.players) { const q = pl.worldFeetPosition || pl.feetPosition; if (q) players.push(q); }
  const rebase = now - S.rebase > 2000; if (rebase) S.rebase = now;
  for (const row of rows) step(ctx, row, players, now, rebase, S);
}
function step(ctx, row, players, now, rebase, S) {
  const st = row.state, K = T.kinds[st.kind]; let road = ROADS[st.road]; if (!K || !road) return;
  const p = row.feetPosition; let dmin = Infinity, near = null;
  for (const q of players) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < dmin) { dmin = d; near = q; } }
  if (dmin > T.near) { // far: nobody sees it — its arc advances by timestamp, nothing is placed
    if (rebase && now >= st.at) { const f = fold(st.s + (st.dir * st.speed * (now - st.at)) / 1000, road.L, st.dir); st.s = r2(f.s); st.dir = f.dir; st.at = now; }
    S.clip[row.id] = null; return;
  }
  let hold = now < st.at, u = hold ? st.s : st.s + (st.dir * st.speed * (now - st.at)) / 1000;
  if (u > road.L + 60 || u < -60) { const f = fold(u, road.L, st.dir); st.s = r2(f.s); st.dir = f.dir; st.at = now; u = f.s; } // woke after a long absence
  else if (u > road.L || u < 0) { // arrival at an end
    const end = u > road.L ? road.L : 0, other = Object.keys(ROADS).find((k) => k !== st.road);
    if (end === 0 && other && ctx.random() < T.junctionTurn) { st.road = other; road = ROADS[other]; st.dir = 1; st.s = r2(-u); st.at = now; u = st.s; }
    else { st.s = end; st.dir = -st.dir; st.at = now + (T.restMin + ctx.random() * (T.restMax - T.restMin)) * 1000; u = end; hold = true; }
  }
  let face = null;
  if (K.greet && near && dmin < T.nodRadius && !hold && now > (st.nodNext ?? 0)) { st.s = r2(u); st.at = now + T.nodMs; st.nodNext = now + T.nodCooldownMs; st.greetAt = now; hold = true; }
  if (K.greet && hold && near && now - (st.greetAt ?? 0) < T.nodMs + 150) face = near;
  if (rebase && !hold) { st.s = r2(u); st.at = now; }
  const lp = lanePoint(road, u, st.dir), y = groundY(ctx, road, u, lp.x, lp.z);
  const last = S.pos[row.id];
  if (!last || Math.abs(last.x - lp.x) + Math.abs(last.z - lp.z) + Math.abs(last.y - y) > 0.004) { row.feetPosition = { x: lp.x, y, z: lp.z }; S.pos[row.id] = { x: lp.x, y, z: lp.z }; }
  const yaw = face ? yawOf(face.x - lp.x, face.z - lp.z) : yawOf(lp.fx, lp.fz);
  if (S.yaw[row.id] == null || Math.abs(wrap(yaw - S.yaw[row.id])) > 0.5) { row.rotation = { yaw }; S.yaw[row.id] = yaw; }
  const name = hold ? (face ? K.greet : K.stand) : K.gait;
  if (S.clip[row.id] !== name && CLIPS && CLIPS[name]) {
    play(ctx, row, CLIPS[name], { channel: 'gait', loop: name === K.greet ? 'once' : true, speed: hold ? 1 : (K.gaitSpeed ?? 1) * (st.gaitMul ?? 1), blendIn: 0.35 });
    if (K.wheels) { if (hold) stop(ctx, row, 'wheels'); else play(ctx, row, CLIPS[K.wheels], { channel: 'wheels', loop: true, speed: st.speed / 1.6 }); }
    S.clip[row.id] = name;
  }
}
