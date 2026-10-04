// WoW-shaped mob AI: IDLE/WANDER -> (aggro radius by level) -> COMBAT (threat table, pack call, flank, swing timer) -> EVADE home.
// The one manager of every den wolf (rows tagged "wild-wolf"): idle and wander by the den, aggro on a player who comes
// within reach or hits one, call the den-mates in, run you down and bite, leash home (WoW's evade) past the leash,
// burn, slow, root and knockback as the spells wrote them, die, pay XP to the killer, rise again at the den.
// The striker's spell writes the wolf's row (hp -= d, hitBy, rootUntil, slowUntil, kb, burn); this reads and answers.
// place.state.wolves is the board every HUD reads: name, level, hp, target, coarse position. Written only on change.
import { fct } from './lib/fct.js';
import { play, clips } from 'builtin/anim';
import { WOLF, DENS, SOUNDS, RULES } from './lib/data/bending.js';
import { findPath } from 'builtin/nav';
export const updateSchedule = { every: 2, near: { radius: 600 } };
const WAKE = 220, GRAV = 22;
let CL = null;
const clipOf = (ctx, n) => (CL ??= clips(ctx, 'anim/wildwolf.yml'))[n];
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
function scratch(ctx, id) { const all = (ctx.session.wolves ??= {}); return (all[id] ??= { yaw: 0, vy: -4, clip: null, busy: 0, kbSeen: 0, hitSeen: 0, nextBite: 0, nextBurn: 0, roamAt: 0 }); }
function clip(ctx, row, m, name, speed = 1, loop = true) {
  if (m.clip === name && Math.abs((m.cs ?? 1) - speed) < 0.15) return;
  const c = clipOf(ctx, name); if (!c) return;
  play(ctx, row, c, { channel: 'body', loop, speed, blendIn: name === 'die' ? 0.05 : 0.15 }); m.clip = name; m.cs = speed;
}
function face(row, m, want, rate, dt) {
  const d = wrap(want - m.yaw); if (Math.abs(d) < 1.5) return;
  const st = Math.max(-rate * dt, Math.min(rate * dt, d)); m.yaw = wrap(m.yaw + st); row.rotation = { yaw: Math.round(m.yaw) };
}
function vel(row, m, vx, vz, dt) {
  m.vy = row.grounded && m.vy <= 0 ? -4 : m.vy - GRAV * dt;
  const v = row.velocity;
  if (!v || Math.abs(v.x - vx) > 0.05 || Math.abs(v.z - vz) > 0.05 || Math.abs(v.y - m.vy) > 0.5) row.velocity = { x: vx, y: m.vy, z: vz };
}
function board(ctx, row, force) {
  const s = row.state, W = (ctx.place.state.wolves ??= {}), p = row.feetPosition, old = W[row.id];
  const now = ctx.now(), a = (s.burn && now < s.burn.until || s.ignite && now < s.ignite.until ? 1 : 0) | (s.cc && now < s.cc.until ? 8 : 0) | (now < (s.rootUntil ?? 0) ? 2 : 0) | (now < (s.slowUntil ?? 0) ? 4 : 0);
  const e = { n: s.name, l: s.lvl, e: s.boss ? 2 : s.elite ? 1 : 0, a, hp: Math.max(0, Math.round(s.hp)), max: s.max, d: s.dead ? 1 : 0, t: s.tgt || null, v: s.evading ? 1 : 0, x: Math.round(p.x / 2) * 2, z: Math.round(p.z / 2) * 2 };
  if (force || !old || old.hp !== e.hp || old.a !== e.a || old.d !== e.d || old.t !== e.t || old.v !== e.v || old.x !== e.x || old.z !== e.z) W[row.id] = e;
}
function hitPlayer(ctx, row, p, now) {
  const s = row.state, ps = p.state;
  let d = Math.round(WOLF.bite(s.lvl) * (s.elite ? WOLF.eliteBite : 1) * (0.85 + ctx.random() * 0.3));
  const pos = { x: p.feetPosition.x, y: p.feetPosition.y + 1.6, z: p.feetPosition.z };
  if ((ps.shield ?? 0) > 0) { const a = Math.min(ps.shield, d); ps.shield -= a; d -= a; if (a) fct(ctx, p.id, `Absorb ${a}`, 'miss', { to: p.id, y: 1.9 }); }
  if (d > 0) { ps.hp -= d; fct(ctx, p.id, d, 'taken', { to: p.id, y: 1.9 }); }
  ps.combatUntil = now + RULES.combatMs; ps.lastHitBy = s.name;
  ctx.emit('playSound', { clip: SOUNDS.bite, position: pos, volume: 0.6, pitch: s.elite ? 0.75 : 0.95 + ctx.random() * 0.15, maxDistance: 25 });
  ctx.emit('cameraPunch', { direction: { x: p.feetPosition.x - row.feetPosition.x, y: 0, z: p.feetPosition.z - row.feetPosition.z }, intensity: s.elite ? 0.5 : 0.25 }, { audience: { player: p.id } });
  ctx.emit('fx', { position: pos, script: `fx\npop spark burst=6..9 life=.2..0.35 v=sdir()*(2..4) size=.05..0.09 acc=drag(3) col=<2.4,.3,.2> a=1>0 r=sprite(ember,add,velocity,.02)` });
}
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function aggroRadius(mobLvl, plLvl) { return Math.max(WOLF.aggroMin, Math.min(WOLF.aggroMax, WOLF.aggroBase + (mobLvl - plLvl))); }
// enter combat on a player; a fresh pull calls same-den wolves within the social radius (seeded with 1 threat)
function aggro(ctx, row, rows, pid, now, call) {
  const s = row.state; if (s.dead || s.evading || !pid) return;
  s.threat = { ...(s.threat ?? {}), [pid]: Math.max(1, s.threat?.[pid] ?? 0) };
  if (!s.tgt) { s.tgt = pid; s.mode = 'chase'; const m = scratch(ctx, row.id); m.combatAt = now; m.trail = [{ x: row.feetPosition.x, z: row.feetPosition.z }]; m.path = null;
    if (call) ctx.emit('playSound', { clip: SOUNDS.growl, position: row.feetPosition, volume: 0.55, pitch: s.elite ? 0.7 : 1, maxDistance: 30 }); }
  if (!call) return;
  for (const o of rows) if (o !== row && o.state.den === s.den && !o.state.dead && !o.state.tgt && !o.state.evading && dist2(o.feetPosition, row.feetPosition) < WOLF.social) aggro(ctx, o, rows, pid, now, false);
}
function evade(ctx, row, m, now) {
  const s = row.state; s.mode = 'evade'; s.evading = true; s.tgt = null; s.threat = {}; s.burn = null; s.rootUntil = 0; s.slowUntil = 0;
  m.path = (m.trail ?? []).slice().reverse().concat([{ x: s.home.x, z: s.home.z }]); m.pi = 0; m.unreach = 0; m.restAt = 0; m.windAt = 0; m.fled = false;
}
function die(ctx, row, m, now) {
  const s = row.state; s.dead = true; s.deadAt = now; s.mode = 'dead'; s.tgt = null; s.burn = null; s.threat = {};
  row.velocity = { x: 0, y: -4, z: 0 }; row.physics = 'none'; clip(ctx, row, m, 'die', 1, false); // the body stops blocking at once
  const killer = ctx.place.players.find((p) => p.id === s.hitBy), pos = { x: row.feetPosition.x, y: row.feetPosition.y + 1, z: row.feetPosition.z };
  ctx.emit('playSound', { clip: SOUNDS.die, position: pos, volume: 0.6, pitch: s.elite ? 0.7 : 1, maxDistance: 30 });
  ctx.emit('fx', { position: pos, script: `fx\npop dust burst=14..20 on=disc(.6) life=.7..1.2 v=up(.4..0.9)+sdir()*.6 size=.2..0.4 acc=buoy(.3)+drag(1.5) col=<.45,.4,.33> a=0>.35:.3>.7:.15>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)` });
  ctx.spawn({ parent: row.id, feetPosition: { x: 0, y: 0.4, z: 0 }, lifetime: WOLF.corpse, audience: 'near', fx: { script: `fx\npop glint rate=7 on=disc(.5) life=.8..1.3 v=up(.3..0.6) size=.05..0.09 col=hdr(3.4,2.8,1.2) a=0>1:.3>1:.7>0 sz=$size*flick(6,.4) r=sprite(mote,add)` } });
  if (!killer) return;
  const xp = Math.round(WOLF.xp(s.lvl) * (s.elite ? WOLF.eliteXp : 1) * Math.max(0.2, 1 - Math.max(0, (killer.state.lvl ?? 1) - s.lvl) * 0.15));
  killer.state.xp = (killer.state.xp ?? 0) + xp; killer.state.kills = (killer.state.kills ?? 0) + 1;
  if (s.boss) killer.state.grimfang = 1;
  fct(ctx, row.id, `+${xp} XP`, 'xp', { to: killer.id, y: 1.8 });
  ctx.emit('stat', { name: 'wolves slain' }, { audience: { player: killer.id } });
  if (s.boss) { ctx.emit('slowMo', { scale: 0.35, duration: 0.8 }, { audience: { player: killer.id } }); ctx.emit('shockwave', { position: pos, speed: 18, thickness: 1.5, intensity: 0.6 }); ctx.emit('milestone', { step: 2, name: 'slew Grimfang' }, { audience: { player: killer.id } }); }
}
function respawn(ctx, row, m) {
  const s = row.state; s.dead = false; s.hp = s.max; s.mode = 'idle'; s.tgt = null; s.hitBy = null; s.burn = null; s.rootUntil = 0; s.slowUntil = 0; s.threat = {}; s.evading = false;
  row.physics = { body: 'character', collider: 'capsule' };
  row.feetPosition = { x: s.home.x, y: { terrain: 0.05 }, z: s.home.z }; row.visible = true; m.vy = -4; m.path = null; m.fled = false; clip(ctx, row, m, 'idle');
}
// pathing: a corridor from the engine's navigator, re-asked on a budget; stuck = no progress for a second
let pathBudget = 0;
function askPath(ctx, row, m, goal, now) {
  if (pathBudget <= 0 || now < (m.pathAt ?? 0)) return;
  pathBudget--; m.pathAt = now + WOLF.repath * 1000 * (0.8 + ctx.random() * 0.4); m.pathGoal = { x: goal.x, z: goal.z };
  const set = (r) => { if (!r) return; if (r.partial) { m.pathAt = 0; return; } m.pathOk = !!r.ok; m.path = (r.points ?? []).map((q) => ({ x: q.x, z: q.z })); m.pi = m.path.length > 1 ? 1 : 0; };
  try { const r = findPath(ctx, row.feetPosition, { x: goal.x, y: ctx.place.terrain.heightAt(goal.x, goal.z) ?? row.feetPosition.y, z: goal.z }, { radius: 0.5 }); if (r?.then) r.then(set); else set(r); } catch { m.path = null; m.pathOk = false; }
}
function steer(ctx, row, m, rows, goal, speed, now, dt, rate) {
  const p = row.feetPosition; let tx = goal.x, tz = goal.z;
  if (m.path && m.path.length) { // follow the corridor, cutting to the next corner when it is close
    while (m.pi < m.path.length - 1 && dist2(p, m.path[m.pi]) < 0.9) m.pi++;
    const w = m.path[m.pi] ?? goal; tx = w.x; tz = w.z;
  }
  let dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
  for (const o of rows) { if (o === row || o.state.dead) continue; const ox = p.x - o.feetPosition.x, oz = p.z - o.feetPosition.z, od = Math.hypot(ox, oz); // soft separation: k / d²
    if (od > 0.01 && od < WOLF.sep) { const k = Math.min(1.2, 0.35 / (od * od)); dx += ox / od * k; dz += oz / od * k; } }
  if (now < (m.sideUntil ?? 0)) { dx += m.side.x; dz += m.side.z; }
  const n = Math.hypot(dx, dz) || 1, wet = (ctx.place.terrain.heightAt(p.x, p.z) ?? 1) < -0.15 ? 0.7 : 1;
  face(row, m, yawTo(dx, dz), rate, dt); vel(row, m, dx / n * speed * wet, dz / n * speed * wet, dt);
  if (now >= (m.progAt ?? 0)) { // a second without half a metre of progress is stuck: sidestep, re-ask the path
    const moved = m.lastP ? dist2(p, m.lastP) : 9; m.lastP = { x: p.x, z: p.z }; m.progAt = now + 1000;
    if (speed > 0.5 && moved < 0.45 * Math.min(1, speed)) { m.stuck = (m.stuck ?? 0) + 1; m.pathAt = 0; const sgn = m.stuck % 2 ? 1 : -1; m.side = { x: -dz / n * sgn * 1.2, z: dx / n * sgn * 1.2 }; m.sideUntil = now + 600; }
    else m.stuck = 0;
  }
}
function pickTarget(ctx, row, players) { // threat table: hold the current target until another passes 110 % (melee) / 130 % (ranged)
  const s = row.state, T = s.threat ?? {}, p = row.feetPosition; let cur = players.find((x) => x.id === s.tgt && !x.state?.dead && !x.controlling);
  let top = null, tv = -1; for (const pl of players) { const v = T[pl.id]; if (v == null || pl.state?.dead || pl.controlling) continue; if (v > tv) { tv = v; top = pl; } }
  if (!cur) return top;
  if (top && top !== cur) { const need = (T[cur.id] ?? 0) * (dist2(top.feetPosition, p) <= WOLF.rangedAt ? WOLF.threatMelee : WOLF.threatRanged); if (tv > need) return top; }
  return cur;
}
function step(ctx, row, rows, players, now, dt) {
  const s = row.state, m = scratch(ctx, row.id), p = row.feetPosition;
  if (m.yaw === 0 && s.yaw) m.yaw = s.yaw;
  if (s.dead) {
    if (now - s.deadAt > WOLF.corpse * 1000 && row.visible !== false) row.visible = false;
    if (now - s.deadAt > WOLF.respawn * 1000) respawn(ctx, row, m);
    return;
  }
  if (s.hp <= 0) { die(ctx, row, m, now); board(ctx, row, true); return; }
  if (s.hitAt && s.hitAt !== m.hitSeen) { m.hitSeen = s.hitAt; if (!s.evading) aggro(ctx, row, rows, s.hitBy, now, true); ctx.emit('playSound', { clip: SOUNDS.yelp, position: p, volume: 0.35, pitch: 1 + ctx.random() * 0.2, maxDistance: 22 }); }
  if (s.burn && now < s.burn.until && now >= m.nextBurn) { m.nextBurn = now + 1000; s.hp -= s.burn.dps; fct(ctx, row.id, s.burn.dps, 'dot', s.hitBy ? { to: s.hitBy } : { at: p }); }
  else if (s.burn && now >= s.burn.until) s.burn = null;
  if (s.ignite && now < s.ignite.until && now >= (m.nextIgnite ?? 0)) { m.nextIgnite = now + 1000; s.hp -= s.ignite.dps; fct(ctx, row.id, s.ignite.dps, 'dot', s.hitBy ? { to: s.hitBy } : { at: p }); }
  else if (s.ignite && now >= s.ignite.until) s.ignite = null;
  if (s.cc) { // bound: it wanders in its cyclone, healing, until the bind ends or anything hurts it
    if (now >= s.cc.until) s.cc = null;
    else { s.hp = Math.min(s.max, s.hp + s.max * 0.1 * dt); m.windAt = 0;
      if (!m.ccGoal || dist2(p, m.ccGoal) < 0.5) { const a = ctx.random() * 6.283; m.ccGoal = { x: p.x + Math.cos(a) * 2.5, z: p.z + Math.sin(a) * 2.5 }; }
      steer(ctx, row, m, rows, m.ccGoal, 0.7, now, dt, 120); clip(ctx, row, m, 'walk', 0.5); return; }
  }
  if (s.kb && s.kb.at !== m.kbSeen) { m.kbSeen = s.kb.at; m.kbUntil = now + 320; m.kbv = s.kb; if (s.kb.y) m.vy = s.kb.y; }
  if (now < (m.kbUntil ?? 0)) { vel(row, m, m.kbv.x, m.kbv.z, dt); return; }
  const rooted = now < (s.rootUntil ?? 0), slow = now < (s.slowUntil ?? 0) ? 0.5 : 1, hd = dist2(p, s.home);
  // EVADE: untouchable, threat gone, 20 %/s back, home along the way it came at a run, a short rest, then pullable again
  if (s.evading) {
    if (s.hp < s.max) s.hp = Math.min(s.max, s.hp + s.max * WOLF.evadeRegen * dt);
    if (hd < 1.6 || (m.path && m.pi >= m.path.length - 1 && hd < 3)) {
      vel(row, m, 0, 0, dt); clip(ctx, row, m, 'idle');
      if (!m.restAt) m.restAt = now + WOLF.rest * 1000;
      if (now >= m.restAt) { s.evading = false; s.mode = 'idle'; s.hp = s.max; s.hitBy = null; m.restAt = 0; m.path = null; }
      return;
    }
    if (!m.path || m.stuck > 2) { m.path = null; askPath(ctx, row, m, s.home, now); }
    steer(ctx, row, m, rows, s.home, WOLF.run * WOLF.evadeSpeed, now, dt, 720); clip(ctx, row, m, 'run', 1.3); return;
  }
  // IDLE → COMBAT: aggro radius 20 m ± a metre per level of difference, clamped 5..45
  if (!s.tgt) {
    for (const pl of players) { if (pl.state?.dead || pl.controlling) continue;
      if (dist2(pl.feetPosition, p) < aggroRadius(s.lvl, pl.state?.lvl ?? 1) * (s.elite ? 1.1 : 1)) { aggro(ctx, row, rows, pl.id, now, true); clip(ctx, row, m, 'snarl'); m.busy = now + 450; break; } }
  }
  if (s.tgt) {
    const pl = pickTarget(ctx, row, players);
    if (!pl || hd > WOLF.leash) { evade(ctx, row, m, now); return; }
    if (pl.id !== s.tgt) { s.tgt = pl.id; ctx.emit('playSound', { clip: SOUNDS.growl, position: p, volume: 0.45, maxDistance: 25 }); }
    if (!m.trail?.length || dist2(p, m.trail[m.trail.length - 1]) > 2) { (m.trail ??= []).push({ x: p.x, z: p.z }); if (m.trail.length > 40) m.trail.shift(); }
    const q = pl.feetPosition, d = dist2(q, p), reach = WOLF.reach * (s.boss ? 1.4 : 1);
    // the swing: a 0.35 s wind-up, then it lands only if you are still in reach and in front of it
    if (m.windAt && now >= m.windAt) { m.windAt = 0;
      const fwd = (yawTo(q.x - p.x, q.z - p.z) - m.yaw), inCone = Math.abs(wrap(fwd)) <= WOLF.cone;
      if (d <= reach + 0.6 && inCone) hitPlayer(ctx, row, pl, now);
      else fct(ctx, pl.id, 'Miss', 'miss', { to: pl.id, y: 1.9 }); }
    // FLEE: once a life, under 20 %, it runs for the pack yelping, then turns back
    if (!s.boss && !m.fled && s.hp < s.max * WOLF.fleeAt) { m.fled = true; m.fleeUntil = now + WOLF.fleeFor * 1000; ctx.emit('playSound', { clip: SOUNDS.yelp, position: p, volume: 0.6, pitch: 1.3, maxDistance: 30 });
      for (const o of rows) if (o !== row && !o.state.dead && !o.state.tgt && dist2(o.feetPosition, p) < WOLF.fleeCry) aggro(ctx, o, rows, pl.id, now, false);
      let best = null, bd = 1e9; for (const o of rows) if (o !== row && !o.state.dead && !o.state.tgt) { const od = dist2(o.feetPosition, p); if (od < bd) { bd = od; best = o; } }
      m.fleeTo = best ? { x: best.feetPosition.x, z: best.feetPosition.z } : { x: p.x + (p.x - q.x) * 3, z: p.z + (p.z - q.z) * 3 }; m.path = null; m.pathAt = 0; }
    if (now < (m.fleeUntil ?? 0)) { askPath(ctx, row, m, m.fleeTo, now); steer(ctx, row, m, rows, m.fleeTo, rooted ? 0 : WOLF.run * 0.8 * slow, now, dt, WOLF.turn); clip(ctx, row, m, 'run', 1.1); return; }
    if (now < m.busy || m.windAt) { vel(row, m, 0, 0, dt); face(row, m, yawTo(q.x - p.x, q.z - p.z), WOLF.turn, dt); return; }
    if (d > reach) {
      // flank: wolves on the same player take slots left and right of the line in
      const mates = rows.filter((o) => o.state.tgt === pl.id && !o.state.dead).map((o) => o.id).sort(), k = mates.indexOf(row.id), off = [0, 55, -55, 110, -110, 160][k % 6] * Math.PI / 180;
      const ax = p.x - q.x, az = p.z - q.z, an = Math.hypot(ax, az) || 1, c = Math.cos(off), sn = Math.sin(off);
      const goal = d < 7 ? { x: q.x + (ax * c - az * sn) / an * (reach - 0.35), z: q.z + (ax * sn + az * c) / an * (reach - 0.35) } : { x: q.x, z: q.z };
      const moved = !m.pathGoal || dist2(m.pathGoal, goal) > 1.5;
      if (d > 4 && (moved || !m.path)) askPath(ctx, row, m, goal, now);
      if (d <= 4) m.path = null; // close in: straight at the slot, separation does the rest
      if (m.pathOk === false || m.stuck > 2) m.unreach = (m.unreach ?? 0) + dt; else m.unreach = Math.max(0, (m.unreach ?? 0) - dt * 0.5);
      if (m.unreach > WOLF.unreachable) { // it cannot reach you: a beat of hesitation, then it gives up
        if (!m.giveUpAt) m.giveUpAt = now + 1500; if (now >= m.giveUpAt) { m.giveUpAt = 0; evade(ctx, row, m, now); return; }
        vel(row, m, 0, 0, dt); clip(ctx, row, m, 'snarl'); return; }
      const sp = rooted ? 0 : WOLF.run * slow * (s.elite ? 1.05 : 1);
      steer(ctx, row, m, rows, goal, sp, now, dt, WOLF.turn); clip(ctx, row, m, sp ? 'run' : 'snarl', sp ? Math.max(0.6, sp / 6.2) : 1);
    } else {
      m.unreach = 0; m.path = null; vel(row, m, 0, 0, dt); face(row, m, yawTo(q.x - p.x, q.z - p.z), WOLF.turn, dt);
      if (now >= m.nextBite) { m.nextBite = now + WOLF.swing * 1000; m.windAt = now + WOLF.windup * 1000; clip(ctx, row, m, 'bite', 1, false); m.clip = 'bite'; m.busy = now + 500; }
      else if (now > m.busy) clip(ctx, row, m, 'snarl');
    }
    return;
  }
  // IDLE: 60 % breathe, 20 % look about, 20 % patrol a point within 5 m at 40 % pace, then pause 4–8 s
  if (now >= m.roamAt) {
    m.roamAt = now + 4000 + ctx.random() * 4000; const r = ctx.random();
    if (r < 0.6) { m.goal = null; m.look = false; }
    else if (r < 0.8) { m.goal = null; m.look = true; m.lookYaw = m.yaw + (ctx.random() < 0.5 ? -70 : 70); if (ctx.random() < 0.15) { clip(ctx, row, m, 'howl', 1, false); m.busy = now + 2400; ctx.emit('playSound', { clip: SOUNDS.howl, position: p, volume: 0.5, maxDistance: 120 }); } }
    else { const a = ctx.random() * 6.283, rr = 1.5 + ctx.random() * (WOLF.patrol - 1.5); m.goal = { x: s.home.x + Math.cos(a) * rr, z: s.home.z + Math.sin(a) * rr }; m.path = null; m.look = false; }
  }
  if (now < m.busy) { vel(row, m, 0, 0, dt); return; }
  if (m.goal) {
    if (dist2(p, m.goal) < 0.6 || m.stuck > 3) { m.goal = null; m.stuck = 0; vel(row, m, 0, 0, dt); clip(ctx, row, m, 'idle'); return; }
    steer(ctx, row, m, rows, m.goal, WOLF.run * 0.4 * 0.55, now, dt, 160); clip(ctx, row, m, 'walk', 0.8); return;
  }
  vel(row, m, 0, 0, dt); if (m.look) face(row, m, m.lookYaw, 90, dt); clip(ctx, row, m, 'idle', m.look ? 0.8 : 1);
}
export function update(ctx, dt) {
  const players = ctx.place.players, now = ctx.now();
  if (!players.length) return;
  pathBudget = 3; // path queries per update, shared by the whole pack
  const rows = ctx.query({ tags: ['wild-wolf'], radius: 100000 });
  for (const row of rows) {
    if (!row.state?.home) continue;
    let near = 1e9; for (const pl of players) near = Math.min(near, dist2(pl.feetPosition, row.feetPosition));
    if (near > WAKE && !row.state.tgt && !row.state.dead && !row.state.evading) continue;
    step(ctx, row, rows, players, now, dt); board(ctx, row, false);
  }
}
