// The one manager of the coop flock: rows tagged "coop-bird" (children of coop-site, local feet inside the run) wander,
// peck, scratch, look about and flap; the rooster crows now and then. Positions are the rows' own feetPosition.
import H from './lib/data/homestead.yml';
export const updateSchedule = { every: 2 };
const F = H.flock, RUN = H.coop.run, DEG = 180 / Math.PI, RAD = Math.PI / 180;
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * DEG;
const rr = (ctx, a, b) => a + ctx.random() * (b - a);
function free(x, z) {
  if (x < RUN.x0 || x > RUN.x1 || z < RUN.z0 || z > RUN.z1) return false;
  for (const [ax, az, r] of H.coop.avoid) if (Math.hypot(x - ax, z - az) < r) return false;
  return true;
}
function clip(S, o, name) { if (S.clip[o.id] === name) return; S.clip[o.id] = name; o.anim.body = { clip: `anim/coop-hen.yml#${name}`, loop: name === 'flap' ? 'once' : 'loop', weight: 1 }; }
export function update(ctx, dt) {
  const S = (ctx.session.coopFlock ??= { pos: {}, clip: {}, mode: {}, cluck: 0, crow: 0 });
  const me = ctx.self, c = me.worldFeetPosition || me.feetPosition, now = ctx.now();
  let near = Infinity;
  for (const p of ctx.place.players) { const q = p.worldFeetPosition || p.feetPosition; if (q) near = Math.min(near, Math.hypot(q.x - c.x, q.z - c.z)); }
  if (near > F.wake) { ctx.sleep(3); return; }
  const rows = ctx.query({ tags: ['coop-bird'] });
  for (const o of rows) {
    const s = o.state || {}, kind = s.kind || 'hen';
    const P = (S.pos[o.id] ??= { x: o.feetPosition.x, z: o.feetPosition.z });
    const m = (S.mode[o.id] ??= { mode: 'idle', until: now + rr(ctx, 0.3, 2.5) * 1000 });
    if (m.mode === 'walk') {
      const dx = m.tx - P.x, dz = m.tz - P.z, d = Math.hypot(dx, dz);
      if (d < 0.03) { m.mode = 'rest'; m.until = now; }
      else { const st = Math.min(d, F.speed[kind] * dt); P.x += dx / d * st; P.z += dz / d * st; o.feetPosition = { x: P.x, y: F.y, z: P.z }; clip(S, o, 'walk'); continue; }
    }
    if (now < m.until) continue;
    if (m.mode === 'rest' || ctx.random() < 0.35) { // settle into a rest pose
      let r = ctx.random(), pick = F.rest[0];
      for (const row of F.rest) { if (r < row[1]) { pick = row; break; } r -= row[1]; }
      m.mode = 'pose'; m.until = now + rr(ctx, pick[2], pick[3]) * 1000; clip(S, o, pick[0]); continue;
    }
    let ok = false;
    for (let t = 0; t < 6 && !ok; t++) {
      const a = ctx.random() * Math.PI * 2, d = rr(ctx, F.step[0], F.step[1]), x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d;
      if (!free(x, z)) continue;
      let crowd = false; for (const k in S.pos) if (k !== o.id && Math.hypot(S.pos[k].x - x, S.pos[k].z - z) < F.space) crowd = true;
      if (crowd) continue;
      ok = true; m.mode = 'walk'; m.tx = x; m.tz = z; o.rotation = { yaw: yawTo(x - P.x, z - P.z) };
    }
    if (!ok) { m.mode = 'rest'; m.until = now + 400; }
  }
  if (near > F.hearWithin) return;
  const at = (P) => { const y = H.coop.yaw * RAD, cs = Math.cos(y), sn = Math.sin(y); return { x: c.x + P.x * cs + P.z * sn, y: c.y + 0.3, z: c.z - P.x * sn + P.z * cs }; };
  if (now > S.cluck) {
    S.cluck = now + rr(ctx, F.cluckEvery[0], F.cluckEvery[1]) * 1000;
    const hens = rows.filter((o) => (o.state?.kind || 'hen') === 'hen'); const o = hens[Math.floor(ctx.random() * hens.length)];
    if (o && S.pos[o.id]) ctx.emit('playSound', { clip: F.clucks[Math.floor(ctx.random() * F.clucks.length)], position: at(S.pos[o.id]), volume: 0.35, pitch: 0.9 + ctx.random() * 0.25, maxDistance: 22 });
  }
  if (now > S.crow) {
    const first = !S.crow; S.crow = now + rr(ctx, F.crowEvery[0], F.crowEvery[1]) * 1000; if (first) return;
    const o = rows.find((r) => r.state?.kind === 'rooster'); if (!o || !S.pos[o.id]) return;
    const m = S.mode[o.id]; if (m.mode === 'walk') return;
    m.mode = 'pose'; m.until = now + 2300; clip(S, o, 'crow');
    ctx.emit('playSound', { clip: F.crow, position: at(S.pos[o.id]), volume: 0.45, maxDistance: 45 });
  }
}
