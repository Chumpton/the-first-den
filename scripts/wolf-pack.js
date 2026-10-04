// The one manager of every den wolf (rows tagged "wild-wolf"): idle and wander by the den, aggro on a player who comes
// within reach or hits one, call the den-mates in, run you down and bite, leash home (WoW's evade) past the leash,
// burn, slow, root and knockback as the spells wrote them, die, pay XP to the killer, rise again at the den.
// The striker's spell writes the wolf's row (hp -= d, hitBy, rootUntil, slowUntil, kb, burn); this reads and answers.
// place.state.wolves is the board every HUD reads: name, level, hp, target, coarse position. Written only on change.
import { play, clips } from 'builtin/anim';
import { WOLF, DENS, SOUNDS, RULES } from './lib/data/bending.js';
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
  const now = ctx.now(), a = (s.burn && now < s.burn.until ? 1 : 0) | (now < (s.rootUntil ?? 0) ? 2 : 0) | (now < (s.slowUntil ?? 0) ? 4 : 0);
  const e = { n: s.name, l: s.lvl, e: s.boss ? 2 : s.elite ? 1 : 0, a, hp: Math.max(0, Math.round(s.hp)), max: s.max, d: s.dead ? 1 : 0, t: s.tgt || null, x: Math.round(p.x / 2) * 2, z: Math.round(p.z / 2) * 2 };
  if (force || !old || old.hp !== e.hp || old.a !== e.a || old.d !== e.d || old.t !== e.t || old.x !== e.x || old.z !== e.z) W[row.id] = e;
}
function hitPlayer(ctx, row, p, now) {
  const s = row.state, ps = p.state;
  let d = Math.round(WOLF.bite(s.lvl) * (s.elite ? WOLF.eliteBite : 1) * (0.85 + ctx.random() * 0.3));
  const pos = { x: p.feetPosition.x, y: p.feetPosition.y + 1.6, z: p.feetPosition.z };
  if ((ps.shield ?? 0) > 0) { const a = Math.min(ps.shield, d); ps.shield -= a; d -= a; if (a) ctx.emit('damageNumber', { position: pos, text: `absorb ${a}`, color: '#cfe8ff', size: 0.8 }); }
  if (d > 0) { ps.hp -= d; ctx.emit('damageNumber', { position: pos, value: d, color: '#ff4a3a' }); }
  ps.combatUntil = now + RULES.combatMs; ps.lastHitBy = s.name;
  ctx.emit('playSound', { clip: SOUNDS.bite, position: pos, volume: 0.6, pitch: s.elite ? 0.75 : 0.95 + ctx.random() * 0.15, maxDistance: 25 });
  ctx.emit('cameraPunch', { direction: { x: p.feetPosition.x - row.feetPosition.x, y: 0, z: p.feetPosition.z - row.feetPosition.z }, intensity: s.elite ? 0.5 : 0.25 }, { audience: { player: p.id } });
  ctx.emit('fx', { position: pos, script: `fx\npop spark burst=6..9 life=.2..0.35 v=sdir()*(2..4) size=.05..0.09 acc=drag(3) col=<2.4,.3,.2> a=1>0 r=sprite(ember,add,velocity,.02)` });
}
function aggro(ctx, row, rows, pid, now, call) {
  const s = row.state; if (s.dead || s.mode === 'evade') return;
  if (s.tgt !== pid) { s.tgt = pid; s.mode = 'chase'; if (call) ctx.emit('playSound', { clip: SOUNDS.growl, position: row.feetPosition, volume: 0.55, pitch: s.elite ? 0.7 : 1, maxDistance: 30 }); }
  if (!call) return;
  for (const o of rows) if (o !== row && o.state.den === s.den && !o.state.dead && !o.state.tgt && Math.hypot(o.feetPosition.x - row.feetPosition.x, o.feetPosition.z - row.feetPosition.z) < WOLF.assist) aggro(ctx, o, rows, pid, now, false);
}
function die(ctx, row, m, now) {
  const s = row.state; s.dead = true; s.deadAt = now; s.mode = 'dead'; s.tgt = null; s.burn = null;
  row.velocity = { x: 0, y: -4, z: 0 }; clip(ctx, row, m, 'die', 1, false);
  const killer = ctx.place.players.find((p) => p.id === s.hitBy), pos = { x: row.feetPosition.x, y: row.feetPosition.y + 1, z: row.feetPosition.z };
  ctx.emit('playSound', { clip: SOUNDS.die, position: pos, volume: 0.6, pitch: s.elite ? 0.7 : 1, maxDistance: 30 });
  ctx.emit('fx', { position: pos, script: `fx\npop dust burst=14..20 on=disc(.6) life=.7..1.2 v=up(.4..0.9)+sdir()*.6 size=.2..0.4 acc=buoy(.3)+drag(1.5) col=<.45,.4,.33> a=0>.35:.3>.7:.15>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)` });
  if (!killer) return;
  const xp = Math.round(WOLF.xp(s.lvl) * (s.elite ? WOLF.eliteXp : 1) * Math.max(0.2, 1 - Math.max(0, (killer.state.lvl ?? 1) - s.lvl) * 0.15));
  killer.state.xp = (killer.state.xp ?? 0) + xp; killer.state.kills = (killer.state.kills ?? 0) + 1;
  if (s.boss) killer.state.grimfang = 1;
  ctx.emit('damageNumber', { position: { x: pos.x, y: pos.y + 1.2, z: pos.z }, text: `+${xp} xp`, color: '#c98cff', size: 1.1 });
  ctx.emit('stat', { name: 'wolves slain' }, { audience: { player: killer.id } });
  if (s.boss) { ctx.emit('slowMo', { scale: 0.35, duration: 0.8 }, { audience: { player: killer.id } }); ctx.emit('shockwave', { position: pos, speed: 18, thickness: 1.5, intensity: 0.6 }); ctx.emit('milestone', { step: 2, name: 'slew Grimfang' }, { audience: { player: killer.id } }); }
}
function respawn(ctx, row, m) {
  const s = row.state; s.dead = false; s.hp = s.max; s.mode = 'idle'; s.tgt = null; s.hitBy = null; s.burn = null; s.rootUntil = 0; s.slowUntil = 0;
  row.feetPosition = { x: s.home.x, y: { terrain: 0.05 }, z: s.home.z }; row.visible = true; m.vy = -4; clip(ctx, row, m, 'idle');
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
  // what the spells wrote: a fresh hit pulls aggro (the pack comes too), burn ticks, a knock flies
  if (s.hitAt && s.hitAt !== m.hitSeen) { m.hitSeen = s.hitAt; if (s.mode !== 'evade') aggro(ctx, row, rows, s.hitBy, now, true); ctx.emit('playSound', { clip: SOUNDS.yelp, position: p, volume: 0.35, pitch: 1 + ctx.random() * 0.2, maxDistance: 22 }); }
  if (s.burn && now < s.burn.until && now >= m.nextBurn) { m.nextBurn = now + 1000; s.hp -= s.burn.dps; ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 1.3, z: p.z }, value: s.burn.dps, color: '#ffa040', size: 0.7 }); }
  else if (s.burn && now >= s.burn.until) s.burn = null;
  if (s.kb && s.kb.at !== m.kbSeen) { m.kbSeen = s.kb.at; m.kbUntil = now + 320; m.kbv = s.kb; if (s.kb.y) m.vy = s.kb.y; }
  if (now < (m.kbUntil ?? 0)) { vel(row, m, m.kbv.x, m.kbv.z, dt); return; }
  const rooted = now < (s.rootUntil ?? 0), slow = now < (s.slowUntil ?? 0) ? 0.5 : 1;
  const hd = Math.hypot(p.x - s.home.x, p.z - s.home.z);
  if (s.mode === 'evade') {
    if (hd < 2.5) { s.mode = 'idle'; s.hp = s.max; s.hitBy = null; vel(row, m, 0, 0, dt); clip(ctx, row, m, 'idle'); return; }
    const want = yawTo(s.home.x - p.x, s.home.z - p.z); face(row, m, want, 720, dt);
    const sp = WOLF.run * 1.5; vel(row, m, (s.home.x - p.x) / hd * sp, (s.home.z - p.z) / hd * sp, dt); clip(ctx, row, m, 'run', 1.3);
    if (s.hp < s.max) s.hp = s.max; return;
  }
  if (!s.tgt) { // idle: anyone close enough (and not far out-levelling us) draws the pack
    for (const pl of players) { if (pl.state?.dead || (pl.state?.lvl ?? 1) >= s.lvl + 8) continue;
      const q = pl.feetPosition; if (Math.hypot(q.x - p.x, q.z - p.z) < WOLF.aggro * (s.elite ? 1.25 : 1)) { aggro(ctx, row, rows, pl.id, now, true); clip(ctx, row, m, 'snarl'); m.busy = now + 450; break; } }
  }
  if (s.tgt) {
    const pl = players.find((x) => x.id === s.tgt);
    if (!pl || pl.state?.dead || pl.controlling || hd > WOLF.leash) { s.mode = 'evade'; s.tgt = null; return; }
    const q = pl.feetPosition, dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
    face(row, m, yawTo(dx, dz), 900, dt);
    if (now < m.busy) { vel(row, m, 0, 0, dt); return; }
    if (d > WOLF.reach) {
      const sp = rooted ? 0 : WOLF.run * slow * (s.elite ? 1.05 : 1);
      vel(row, m, dx / d * sp, dz / d * sp, dt); clip(ctx, row, m, sp ? 'run' : 'snarl', sp ? Math.max(0.6, sp / 6.2) : 1);
    } else {
      vel(row, m, 0, 0, dt);
      if (now >= m.nextBite) { m.nextBite = now + WOLF.biteEvery * 1000 * (0.9 + ctx.random() * 0.2); m.busy = now + 450; clip(ctx, row, m, 'bite', 1, false); m.clip = 'bite'; hitPlayer(ctx, row, pl, now); }
      else if (m.clip !== 'bite' || now > m.busy) clip(ctx, row, m, 'snarl');
    }
    return;
  }
  // wander by the den
  if (now >= m.roamAt) {
    m.roamAt = now + 4000 + ctx.random() * 6000;
    if (ctx.random() < 0.45) { m.goal = null; } else { const a = ctx.random() * 6.283, r = 2 + ctx.random() * 7; m.goal = { x: s.home.x + Math.cos(a) * r, z: s.home.z + Math.sin(a) * r }; }
    if (!m.goal && ctx.random() < 0.12) { clip(ctx, row, m, 'howl', 1, false); m.busy = now + 2400; ctx.emit('playSound', { clip: SOUNDS.howl, position: p, volume: 0.5, maxDistance: 120 }); }
  }
  if (now < m.busy) { vel(row, m, 0, 0, dt); return; }
  if (m.goal) {
    const dx = m.goal.x - p.x, dz = m.goal.z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.6) { m.goal = null; vel(row, m, 0, 0, dt); clip(ctx, row, m, 'idle'); return; }
    face(row, m, yawTo(dx, dz), 200, dt); vel(row, m, dx / d * WOLF.walk, dz / d * WOLF.walk, dt); clip(ctx, row, m, 'walk', 0.9); return;
  }
  vel(row, m, 0, 0, dt); clip(ctx, row, m, 'idle');
}
export function update(ctx, dt) {
  const players = ctx.place.players, now = ctx.now();
  if (!players.length) return;
  const rows = ctx.query({ tags: ['wild-wolf'], radius: 100000 });
  for (const row of rows) {
    if (!row.state?.home) continue;
    let near = 1e9; for (const pl of players) near = Math.min(near, Math.hypot(pl.feetPosition.x - row.feetPosition.x, pl.feetPosition.z - row.feetPosition.z));
    if (near > WAKE && !row.state.tgt && !row.state.dead) continue;
    step(ctx, row, rows, players, now, dt); board(ctx, row, false);
  }
}
