// The player's bending: four element stances page action bar 1 (keys 1-6), X meditates, V enters the Avatar State,
// R swaps element, F cycles targets. Every spell is instant on a 1 s global cooldown (movement spells off it).
// A hit is judged here, on the caster's machine, and written to the wolf's row (scripts/wolf-pack.js answers it).
// Owns player.state: lvl xp hp chi stance tgt cds gcdAt harmony lastEl shield shieldUntil speedMul avatarUntil
// meditateUntil combatUntil dead lastSafe kills grimfang quests err toast.
import { SPELLS, BARS, ELEMENTS, STANCES, RULES, SOUNDS, QUESTS, WOLF } from './lib/data/bending.js';
import { animate } from 'builtin/tween';
import { raycast, getInputRay } from 'builtin/physics';
import { steerBasis } from './lib/wow-steer.js';
const R = RULES;
const sess = (ctx) => ((ctx.session.bend ??= {})[ctx.self.id] ??= { aim: { s: 0, c: 1 }, move: null, acc: 0, fx: {} });
const fwdOf = (b) => ({ x: -b.aim.s, z: -b.aim.c });
const add = (a, b, k = 1) => ({ x: a.x + b.x * k, y: a.y + (b.y ?? 0) * k, z: a.z + b.z * k });
const glowCol = (el) => ELEMENTS[el]?.glow ?? [2, 2, 2];
const hex = (el) => ELEMENTS[el]?.color ?? '#ffffff';

// how long each kind gathers before it lets go, and how much slower everything flies than it used to
const SLOW = 0.55;
const WIND = { bolt: 0.45, lash: 0.4, ground: 0.6, nova: 0.65, cone: 0.6, self: 0.35, dash: 0.15, jet: 0.25, launch: 0.25, blink: 0.2, channel: 0.3, avatar: 0.9 };
const GATHER = {
  air: `fx\npop swirl rate=120 on=sphere(.55) life=.3..0.45 v=attract(4)+vortex(6) size=.12..0.22 col=<1.5,1.8,2.1> a=0>.6:.3>.6:.7>0 sz=$size*(1>.4) r=sprite(smoke-puff,add)\npop core n=1 size=.25 col=<1.6,1.9,2.2> a=.7 sz=$size*(.4>1.4) r=sprite(soft-disc,add)`,
  water: `fx\npop drop rate=140 on=sphere(.5) life=.3..0.45 v=attract(5)+vortex(5) size=.05..0.09 col=<.6,1.5,2.8> a=0>1:.3>1:.7>0 r=sprite(droplet,add,velocity,.02)\npop core n=1 size=.3 col=<.5,1.3,2.6> a=.85 sz=$size*(.4>1.5) r=sprite(soft-disc,add)`,
  earth: `fx\npop grit rate=90 on=disc(.8).c(-1.1) life=.35..0.5 v=attract(5)+up(1.5) size=.05..0.1 spin=-8..8 acc=drag(1) col=<.48,.4,.3> a=1 rot=$age*$spin r=sprite(chip,alpha)\npop dust rate=30 on=disc(.7).c(-1.1) life=.4..0.6 v=up(1.2) size=.2..0.35 acc=drag(1.5) col=<.52,.45,.36> a=0>.4:.3>0 sz=$size*(.6>1.5) r=sprite(smoke-puff,alpha)`,
  fire: `fx\npop flame rate=150 on=sphere(.45) life=.2..0.35 v=attract(4)+up(.6) size=.15..0.3 col=hdr(4.4,2.2,.6)>hdr(1.6,.4,.08) a=1>0 sz=$size*(1>.4) rot=spin(.4) r=sprite(flame-wisp,add)\npop glow n=1 r=light(<1,.5,.2>,6,6)`,
  spirit: `fx\npop motes rate=120 on=sphere(.9) life=.4..0.7 v=attract(4)+vortex(4) size=.04..0.08 col=hdr(2.6,3.2,4.6) a=0>1:.3>1:.7>0 r=sprite(mote,add)\npop glow n=1 r=light(<.7,.85,1>,8,6)`,
};
export function zap(ctx, pl) { beam(ctx, pl.a, pl.b, '#e6eeff', 0.07, 1.3, 7, 0.25); }
export const maxHp = (st) => R.hp(st.lvl ?? 1), maxChi = (st) => R.chiMax(st.lvl ?? 1);

// ---------- effects ----------
const TRAIL = {
  air: `fx\npop wind rate=90 on=sphere(.25) life=.25..0.45 v=sdir()*.7 size=.3..0.5 acc=drag(2) col=<1.5,1.8,2.1> a=.45>0 sz=$size*(.6>1.7) rot=spin(.6) r=sprite(smoke-puff,add)\npop core n=1 size=.55 col=<1.6,1.9,2.2> a=.6 sz=$size r=sprite(soft-disc,add)`,
  water: `fx\npop drop rate=110 on=sphere(.22) life=.3..0.55 v=sdir()*1.3 size=.06..0.12 acc=grav()*.7 col=<.6,1.5,2.8> a=1>0 r=sprite(droplet,add,velocity,.02)\npop core n=1 size=.6 col=<.5,1.3,2.6> a=.85 sz=$size r=sprite(soft-disc,add)`,
  earth: `fx\npop dust rate=50 on=sphere(.3) life=.4..0.7 v=sdir()*.5 size=.2..0.35 acc=drag(1.5) col=<.5,.42,.32> a=.45>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,alpha)\npop grit rate=40 on=sphere(.3) life=.4..0.6 v=sdir()*1.5 size=.04..0.08 acc=grav() col=<.42,.35,.27> a=1 r=sprite(chip,alpha)`,
  fire: `fx\npop flame rate=130 on=sphere(.18) life=.16..0.3 v=sdir()*.7 size=.3..0.55 col=hdr(4.4,2.2,.6)>hdr(1.6,.4,.08) a=1>0 sz=$size*(1>.3) rot=spin(.4) r=sprite(flame-wisp,add)\npop ember rate=30 on=sphere(.2) life=.3..0.6 v=sdir()*2 size=.02..0.04 acc=grav()*.3 col=hdr(5,2.5,.6) a=1>0 r=sprite(ember,add,velocity,.02)\npop glow n=1 r=light(<1,.5,.2>,8,7)`,
};
const IMPACT = {
  air: `fx\npop gust burst=16..22 life=.3..0.6 v=sdir()*(3..6) size=.4..0.7 acc=drag(3) col=<1.4,1.7,2> a=.5>0 sz=$size*(.5>1.8) rot=spin(.8) r=sprite(smoke-puff,add)\npop leaf burst=6..10 life=.6..1.1 v=sdir()*(2..4)+up(1.5) size=.06..0.1 spin=-8..8 acc=grav()*.4+drag(1.5) col=<.45,.6,.3> a=1>0 rot=$age*$spin r=sprite(leaf,alpha)`,
  water: `fx\npop splash burst=26..36 life=.35..0.7 v=<%n|0,1,0>*(1.5..3)+sdir()*(2..4) size=.05..0.11 acc=grav() col=<.6,1.5,2.8> a=1>0 r=sprite(droplet,add,velocity,.02)\npop mist burst=5..8 life=.5..0.9 v=sdir()*.8 size=.4..0.7 acc=drag(2) col=<.6,1,1.5> a=.4>0 sz=$size*(.6>1.6) r=sprite(smoke-puff,add)`,
  ice: `fx\npop shard burst=18..26 life=.4..0.8 v=sdir()*(3..6)+up(1.5) size=.06..0.14 spin=-10..10 acc=grav() col=<1.4,2,2.6> a=1>0 rot=$age*$spin floor=bounce(.3) r=sprite(shard,add)\npop frost burst=6..9 life=.6..1 v=sdir()*.7 size=.4..0.7 acc=drag(2) col=<.9,1.3,1.8> a=.45>0 sz=$size*(.6>1.7) r=sprite(smoke-puff,add)`,
  earth: `fx\npop chip burst=14..20 life=.6..1.1 v=<%n|0,1,0>*(2..4)+sdir()*(2..4) size=.07..0.15 spin=-9..9 acc=grav() col=<.48,.4,.3> a=1 rot=$age*$spin floor=bounce(.3) r=sprite(chip,alpha)\npop dust burst=8..12 life=.8..1.4 v=sdir()*1.2+up(.6) size=.4..0.8 acc=buoy(.2)+drag(1.6) col=<.52,.45,.36> a=0>.5:.2>.6:.2>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)`,
  fire: `fx\npop burst burst=22..30 life=.25..0.5 v=sdir()*(3..6) size=.35..0.6 acc=drag(3)+buoy(1.5) col=hdr(4.6,2.4,.6)>hdr(1.4,.35,.06) a=1>0 sz=$size*(1>.4) rot=spin(.5) r=sprite(flame-wisp,add)\npop ember burst=14..20 life=.5..1 v=sdir()*(3..6) size=.02..0.05 acc=grav()*.5 col=hdr(5,2.5,.6) a=1>0 r=sprite(ember,add,velocity,.02)\npop smoke on=@burst?.3 life=1..1.6 size=.3..0.5 acc=buoy(.8)+drag(1) col=<.2,.18,.17> a=0>.35:.3>0 sz=$size*(.7>2.2) r=sprite(smoke-puff,alpha)\npop flash burst=1 life=.25 r=light(<1,.55,.25>,30,10)`,
  shock: `fx\npop spark burst=26..36 life=.15..0.35 v=sdir()*(5..9) size=.02..0.04 acc=drag(2) col=hdr(3,3.6,6) a=1>0 r=sprite(ember,add,velocity,.03)\npop flash burst=1 life=.2 r=light(<.7,.8,1>,60,14)`,
  heal: `fx\npop ring burst=40 on=disc(.9) life=.8..1.3 v=up(1.5..2.6) size=.06..0.12 acc=vortex(4)+drag(.5) col=<.6,1.6,2.6> a=0>1:.2>1:.7>0 r=sprite(droplet,add)\npop glow burst=1 life=1 r=light(<.4,.8,1>,12,6)`,
  level: `fx\npop pillar burst=90 on=disc(.7) life=1..1.8 v=up(4..7) size=.06..0.12 acc=drag(.6) col=hdr(4,3.2,1.2) a=0>1:.2>1:.7>0 r=sprite(ember,add,velocity,.03)\npop motes burst=30 on=sphere(1.2) life=1.2..2 v=up(.6)+sdir()*.4 size=.05..0.09 col=hdr(4,3.4,1.6) a=0>1:.3>1:.7>0 r=sprite(mote,add)\npop glow burst=1 life=1.6 r=light(<1,.85,.4>,40,12)`,
};
function emitFx(ctx, pos, key, n) { ctx.emit('fx', { position: pos, script: IMPACT[key], params: n ? { n } : undefined }); }
function sound(ctx, clip, pos, vol = 0.6, pitch = 1) { ctx.emit('playSound', { clip, position: pos, volume: vol, pitch, maxDistance: 40 }); }
function bolt(ctx, el, from, to, t, rock) {
  const id = ctx.spawn({ feetPosition: from, lifetime: t + 0.6, audience: 'near', interpolation: null, fx: { script: TRAIL[el] },
    ...(rock ? { primitive: { kind: 'icosahedron', radius: rock, detail: 0 }, material: { color: '#7a6a55', roughness: 0.95, flatShading: true } } : {}) });
  for (const k of ['x', 'y', 'z']) animate(ctx, id, { [`feetPosition.${k}`]: to[k] }, { duration: t, easing: 'linear' });
  return id;
}
function beam(ctx, from, to, color, width, jag, segs, life) {
  let prev = from;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs, base = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, z: from.z + (to.z - from.z) * t };
    const j = i === segs ? 0 : jag, pt = { x: base.x + (ctx.random() - 0.5) * j, y: base.y + (ctx.random() - 0.5) * j + Math.sin(t * Math.PI) * (jag < 0.3 ? 1.2 : 0), z: base.z + (ctx.random() - 0.5) * j };
    const L = Math.hypot(pt.x - prev.x, pt.y - prev.y, pt.z - prev.z), mid = { x: (pt.x + prev.x) / 2, y: (pt.y + prev.y) / 2, z: (pt.z + prev.z) / 2 };
    ctx.spawn({ feetPosition: mid, pivot: 'center', lifetime: life, audience: 'near', primitive: { kind: 'box', width, height: width, depth: L + width },
      rotation: { lookAt: pt, include: ['yaw', 'pitch'] }, material: { color, emissive: color, emissiveIntensity: 5, transparent: true, opacity: 0.9 }, castShadow: false });
    prev = pt;
  }
}
function err(ctx, text) { ctx.self.state.err = { text, at: ctx.now() }; ctx.emit('playSound', { clip: SOUNDS.error, volume: 0.35 }, { audience: { player: ctx.self.id } }); }

// ---------- targets ----------
function wolfAt(ctx, id) { const w = id && ctx.getObject(id); return w && !w.state?.dead && w.state?.hp > 0 ? w : null; }
function nearestWolves(ctx, b, range) {
  const me = ctx.self.feetPosition, f = fwdOf(b);
  return ctx.query({ tags: ['wild-wolf'], center: me, radius: range }).filter((w) => !w.state?.dead && w.state?.hp > 0).map((w) => {
    const dx = w.feetPosition.x - me.x, dz = w.feetPosition.z - me.z, d = Math.hypot(dx, dz) || 0.01, dot = (dx * f.x + dz * f.z) / d;
    return { id: w.id, d, score: d * (dot > 0.5 ? 1 : dot > 0 ? 2.2 : 5) };
  }).sort((a, b) => a.score - b.score);
}
function ensureTarget(ctx, b) {
  const st = ctx.self.state; if (wolfAt(ctx, st.tgt)) return wolfAt(ctx, st.tgt);
  const n = nearestWolves(ctx, b, R.targetRange)[0]; st.tgt = n ? n.id : null; return n ? ctx.getObject(n.id) : null;
}
function cycleTarget(ctx, b) {
  const st = ctx.self.state, list = nearestWolves(ctx, b, R.targetRange);
  if (!list.length) { st.tgt = null; return; }
  const i = list.findIndex((w) => w.id === st.tgt); st.tgt = list[(i + 1) % list.length].id;
  ctx.emit('highlightSet', { target: st.tgt, color: '#ff5040', style: 'outline', duration: 0.6 }, { audience: { player: ctx.self.id } });
}

// ---------- damage ----------
function roll(ctx, S) {
  const st = ctx.self.state, now = ctx.now(), crit = ctx.random() < (S.crit ?? R.crit);
  const mul = (1 + R.dmgPerLevel * ((st.lvl ?? 1) - 1)) * (now < (st.avatarUntil ?? 0) ? R.avatarMul : 1) * (crit ? R.critMul : 1) * (0.9 + ctx.random() * 0.2);
  return { dmg: Math.round(S.dmg * mul), crit };
}
function hurt(ctx, wid, dmg, crit, S, from) {
  const w = wolfAt(ctx, wid); if (!w) return;
  const me = ctx.self, now = ctx.now(), ws = w.state, p = w.feetPosition, el = S.el, top0 = { x: p.x, y: p.y + 1.3, z: p.z };
  me.state.combatUntil = now + R.combatMs; if (!me.state.tgt) me.state.tgt = wid;
  if (ws.evading) { ctx.emit('damageNumber', { position: top0, text: 'Evade', color: '#ffffff', size: 0.9 }); return; }
  // roll 1, contact: spells only miss (never dodged or parried); +3 levels and up the miss chance climbs steeply
  const diff = (ws.lvl ?? 1) - (me.state.lvl ?? 1), miss = diff <= 2 ? R.missBase + Math.max(0, diff) * 0.01 : Math.min(0.4, 0.06 + (diff - 2) * 0.11);
  ws.threat = { ...(ws.threat ?? {}), [me.id]: Math.round((ws.threat?.[me.id] ?? 0) + Math.max(1, dmg)) };
  ws.hitBy = me.id; ws.hitAt = now + ctx.random();
  if (ctx.random() < miss) { ctx.emit('damageNumber', { position: top0, text: 'Miss', color: '#c8c8c8', size: 0.9 }); return; }
  const frozen = now < (ws.rootUntil ?? 0);
  if (frozen && S.lance) dmg *= 2;
  if (frozen && !crit && dmg > 0 && ctx.random() < R.shatter) { crit = true; dmg = Math.round(dmg * R.critMul); } // shatter
  if (frozen && !S.root && dmg > 0 && ctx.random() < R.rootBreak) ws.rootUntil = 0; // damage can crack the ice
  if (ws.cc) { ws.cc = null; if (ws.ccFx) { ctx.destroy(ws.ccFx); ws.ccFx = null; } } // any damage frees a bound wolf
  ws.hp -= dmg; // roll 2 (the crit) was rolled with the damage
  if (el === 'fire' && crit && dmg > 0) { const left = ws.ignite && now < ws.ignite.until ? ws.ignite.dps * (ws.ignite.until - now) / 1000 : 0;
    ws.ignite = { dps: Math.max(1, Math.round((left + dmg * R.ignite) / 4)), until: now + 4000 }; }
  if (S.root) { // diminishing returns: 100 / 50 / 25 % then immune, inside 18 s of the last root ending
    const n = now < (ws.drRootUntil ?? 0) ? (ws.drRootN ?? 0) + 1 : 0, k = R.drSteps[Math.min(n, 3)];
    if (k > 0) { ws.rootUntil = now + S.root * 1000 * k; ws.drRootN = n; ws.drRootUntil = ws.rootUntil + R.drWindow; }
    else ctx.emit('damageNumber', { position: { x: top0.x, y: top0.y + 0.4, z: top0.z }, text: 'Immune', color: '#ffffff', size: 0.8 });
  }
  if (S.slow) ws.slowUntil = now + S.slow * 1000;
  if (S.burn) { const base = (S.burnDur ?? 3) * 1000, left = ws.burn && now < ws.burn.until ? ws.burn.until - now : 0; // pandemic: carry up to 30 % over
    ws.burn = { dps: Math.round(S.burn * (1 + R.dmgPerLevel * ((me.state.lvl ?? 1) - 1))), until: now + base + Math.min(left, base * R.pandemic) }; }
  const kbk = S.kb ?? 0, lift = S.lift ?? 0;
  if (kbk || lift) { const dx = p.x - from.x, dz = p.z - from.z, d = Math.hypot(dx, dz) || 1; ws.kb = { x: (dx / d) * kbk, y: lift, z: (dz / d) * kbk, at: now + ctx.random() }; }
  const top = { x: p.x, y: p.y + 1.3, z: p.z };
  ctx.emit('damageNumber', { position: top, value: dmg, crit, color: '#ffe14a', size: crit ? 1.7 : 1 });
  ctx.emit('squash', { target: wid, axis: 'y', intensity: 0.25, duration: 0.18 });
  ctx.emit('flash', { target: wid, color: hex(el), duration: 0.1 });
}
export function land(ctx, pl) { // a projectile arrives
  const S = SPELLS[pl.sp], w = wolfAt(ctx, pl.wid);
  const at = w ? { x: w.feetPosition.x, y: w.feetPosition.y + 0.7, z: w.feetPosition.z } : pl.to;
  emitFx(ctx, at, S.root || S.slow ? 'ice' : S.el, pl.n);
  sound(ctx, S.root || S.slow ? SOUNDS.ice : S.beam ? SOUNDS.lightning : S.el === 'earth' ? SOUNDS.impact : SOUNDS[S.el], at, 0.55, 0.9 + ctx.random() * 0.2);
  if (pl.crit) { ctx.emit('hitstop', { duration: 0.04 }, { audience: { player: ctx.self.id } }); }
  if (w) hurt(ctx, pl.wid, pl.dmg, pl.crit, S, pl.from);
}
export function aoe(ctx, pl) { // a ground/nova hit, possibly one of several ticks
  const S = SPELLS[pl.sp], c = pl.at;
  for (const w of ctx.query({ tags: ['wild-wolf'], center: c, radius: S.radius }))
    if (!w.state?.dead) { const r = roll(ctx, S); hurt(ctx, w.id, Math.round(r.dmg / (S.ticks ?? 1) * (S.ticks ? 1 : 1)), r.crit, S, pl.from ?? c); }
  if (S.boulder && !pl.tick) { emitFx(ctx, c, 'earth'); ctx.emit('shockwave', { position: c, speed: 22, thickness: 1.4, intensity: 0.5 }); ctx.emit('screenShake', { intensity: 0.5, duration: 0.35 }, { audience: { nearby: c, radius: 40 } }); sound(ctx, SOUNDS.impact, c, 0.9, 0.7); }
  if (pl.left > 1) ctx.after(1, 'aoe', { ...pl, left: pl.left - 1, tick: true });
}

// ---------- casting ----------
function cast(ctx, b, id) {
  const S = SPELLS[id], me = ctx.self, st = me.state, now = ctx.now();
  if (!S || st.dead) return;
  if (now < (st.cds?.[id] ?? 0) - R.queueMs) return err(ctx, 'That ability isn\'t ready yet');
  // the spell queue window: a press inside the last 400 ms of the GCD (or the gather) fires on the frame the lock ends
  const lockEnd = Math.max(S.off ? 0 : st.gcdAt ?? 0, S.off ? 0 : st.windUntil ?? 0, S.off ? 0 : st.casting?.end ?? 0, st.cds?.[id] ?? 0);
  if (now < lockEnd) { if (lockEnd - now <= R.queueMs) b.queued = { id, at: lockEnd }; return; }
  const avatar = now < (st.avatarUntil ?? 0), cost = avatar ? 0 : S.chi ?? 0;
  if ((st.chi ?? 0) < cost) return err(ctx, 'Not enough chi');
  if (S.kind === 'avatar' && (st.harmony ?? 0) < S.harmony) return err(ctx, 'Needs 5 Harmony: bend different elements in turn');
  const p = me.feetPosition, f = fwdOf(b), hand = { x: p.x + f.x * 0.6, y: p.y + 1.35, z: p.z + f.z * 0.6 };
  let w = null;
  if (['bolt', 'lash', 'ground', 'bind'].includes(S.kind)) {
    w = ensureTarget(ctx, b); if (!w) return err(ctx, 'No target: get near a wolf');
    const dx = w.feetPosition.x - p.x, dz = w.feetPosition.z - p.z, d = Math.hypot(dx, dz) || 0.01;
    const hit = WOLF.hitbox * (w.state?.boss ? 1.6 : 1); // reach counts to the edge of the target's hitbox
    if (d - hit > S.range) return err(ctx, 'Out of range');
    if (d > hit + 0.5 && (dx * f.x + dz * f.z) / d < R.facingDot) return err(ctx, 'You must be facing your target');
    const eye = { x: p.x, y: p.y + 1.6, z: p.z }, mass = { x: w.feetPosition.x, y: w.feetPosition.y + 0.6, z: w.feetPosition.z };
    const L = Math.hypot(mass.x - eye.x, mass.y - eye.y, mass.z - eye.z), ray = raycast(ctx, eye, { x: (mass.x - eye.x) / L, y: (mass.y - eye.y) / L, z: (mass.z - eye.z) / L }, { distance: L, ignoreEntities: [me.id, w.id], physicsOnly: true, bodies: 'static' });
    if (ray && ray.distance < L - hit - 0.3 && !String(ray.id ?? '').startsWith('wolf-')) return err(ctx, 'Target not in line of sight');
  }
  if (st.channeling && !S.off) stopChannel(ctx, b, null); // a new spell ends the channel, as it does in WoW
  if (S.kind === 'bind' && w?.state?.boss) return err(ctx, 'Grimfang is immune');
  if (S.cast) { // a hard cast: the bar fills while you stand still; chi is paid when it completes
    if (!S.off) st.gcdAt = now + Math.max(R.gcdFloor, R.gcd / (1 + (st.haste ?? 0))) * 1000;
    if (b.castFx) ctx.destroy(b.castFx);
    b.castFx = ctx.spawn({ parent: me.id, feetPosition: { x: 0, y: 1.25, z: -0.55 }, lifetime: S.cast + 1.2, audience: 'near', fx: { script: GATHER[S.el ?? 'spirit'] ?? GATHER.spirit } });
    b.castFrom = { x: p.x, y: p.y, z: p.z };
    st.casting = { id, at: now, end: now + S.cast * 1000, wid: w?.id ?? null, pushes: 0 };
    sound(ctx, SOUNDS.shield, hand, 0.35, 0.8);
    return;
  }
  st.chi = (st.chi ?? 0) - cost; if (cost > 0) st.lastSpend = now;
  st.cds = { ...(st.cds ?? {}), [id]: now + (S.cd ?? 0) * 1000 };
  if (!S.off) st.gcdAt = now + Math.max(R.gcdFloor, R.gcd / (1 + (st.haste ?? 0))) * 1000;
  st.lastCast = { id, at: now };
  if (S.dmg && S.el) { if (S.el !== st.lastEl) st.harmony = Math.min(R.harmonyMax, (st.harmony ?? 0) + 1); st.lastEl = S.el; }
  if (S.meditateBreak !== false) st.meditateUntil = 0;
  if (S.channel) { startChannel(ctx, b, id, w); return; }
  // the build-up: the element gathers at the hands, then lets go
  const wind = WIND[S.kind] ?? 0.45, gc = glowCol(S.el ?? 'air');
  st.windId = id; st.windUntil = now + wind * 1000;
  ctx.spawn({ parent: me.id, feetPosition: { x: 0, y: 1.25, z: -0.55 }, lifetime: wind + 0.1, audience: 'near', fx: { script: GATHER[S.el ?? 'spirit'] ?? GATHER.spirit } });
  sound(ctx, SOUNDS.shield, hand, 0.3, 1.5 - wind * 0.6);
  ctx.after(wind, 'release', { id, wid: w?.id ?? null });
}
function finishCast(ctx, b) {
  const me = ctx.self, st = me.state, c = st.casting, now = ctx.now(); st.casting = null;
  if (b.castFx) { ctx.destroy(b.castFx); b.castFx = null; }
  const S = SPELLS[c.id]; if (!S) return;
  const cost = now < (st.avatarUntil ?? 0) ? 0 : S.chi ?? 0;
  if ((st.chi ?? 0) < cost) return err(ctx, 'Not enough chi');
  if (c.wid && !wolfAt(ctx, c.wid)) return;
  st.chi = (st.chi ?? 0) - cost; if (cost > 0) st.lastSpend = now;
  st.cds = { ...(st.cds ?? {}), [c.id]: now + (S.cd ?? 0) * 1000 };
  st.lastCast = { id: c.id, at: now }; st.meditateUntil = 0;
  if (S.dmg && S.el) { if (S.el !== st.lastEl) st.harmony = Math.min(R.harmonyMax, (st.harmony ?? 0) + 1); st.lastEl = S.el; }
  release(ctx, { id: c.id, wid: c.wid });
}
function cancelCast(ctx, b, why) {
  const st = ctx.self.state; st.casting = null; if (b.castFx) { ctx.destroy(b.castFx); b.castFx = null; }
  if (why) err(ctx, why);
}
function startChannel(ctx, b, id, w) {
  const S = SPELLS[id], me = ctx.self, now = ctx.now(), p = me.feetPosition, iv = (S.channel / S.ticks) * 1000;
  const at = w ? { x: w.feetPosition.x, y: w.feetPosition.y, z: w.feetPosition.z } : { x: p.x, y: p.y, z: p.z };
  b.castFrom = { x: p.x, y: p.y, z: p.z };
  if (S.kind === 'ground') {
    const vis = S.hail
      ? `fx\npop hail rate=110 on=disc(%r|8).c(9) life=.5..0.7 v=<0,-18,0>+sdir()*.6 size=.05..0.1 col=<1.6,2,2.6> a=1 floor=die r=sprite(droplet,add,velocity,.03)\npop mist rate=16 on=disc(%r|8).c(.3) life=1..1.6 v=up(.2) size=.8..1.4 acc=drag(1) col=<.7,.85,1> a=0>.25:.3>0 sz=$size*(.7>1.5) r=sprite(smoke-puff,alpha)\npop cloud rate=10 on=disc(%r|8).c(9.5) life=1.6..2.2 size=2..3 col=<.55,.62,.72> a=0>.45:.3>.45:.7>0 r=sprite(smoke-puff,alpha)`
      : `fx\npop swirl rate=140 on=disc(1.2) life=.8..1.4 v=up(2.5..4) size=.4..0.8 acc=vortex(7)+radial(-1.5)+drag(.4) col=<1.3,1.5,1.7> a=0>.45:.2>.45:.7>0 sz=$size*(.6>1.8) rot=spin(.8) r=sprite(smoke-puff,add)\npop debris rate=30 on=disc(1.5) life=1..1.6 v=up(3..5) size=.05..0.1 spin=-9..9 acc=vortex(9)+drag(.3) col=<.4,.5,.3> a=1>0 rot=$age*$spin r=sprite(leaf,alpha)`;
    b.chanFx = ctx.spawn({ feetPosition: at, lifetime: S.channel + 0.6, audience: 'near', fx: { script: vis, params: { r: S.radius } } });
    sound(ctx, S.hail ? SOUNDS.ice : SOUNDS.air, at, 0.8, 0.7);
  } else b.chanFx = ctx.spawn({ parent: me.id, feetPosition: { x: 0, y: 1.25, z: -0.55 }, lifetime: S.channel + 0.4, audience: 'near', fx: { script: GATHER[S.el] ?? GATHER.spirit } });
  me.state.channeling = { id, at: now, end: now + S.channel * 1000, wid: w?.id ?? null, pos: at, next: now + iv * 0.5, iv, left: S.ticks };
}
function stopChannel(ctx, b, why) {
  ctx.self.state.channeling = null; if (b.chanFx) { ctx.destroy(b.chanFx); b.chanFx = null; }
  if (why) err(ctx, why);
}
function channelTick(ctx, b) {
  const me = ctx.self, st = me.state, ch = st.channeling, S = SPELLS[ch.id], now = ctx.now();
  st.channeling = { ...ch, next: now + ch.iv, left: ch.left - 1 };
  if (S.kind === 'bolt') {
    const w = wolfAt(ctx, ch.wid); if (!w) { stopChannel(ctx, b, null); return; }
    const p = me.feetPosition, f = fwdOf(b), hand = { x: p.x + f.x * 0.6, y: p.y + 1.35, z: p.z + f.z * 0.6 }, to = { x: w.feetPosition.x, y: w.feetPosition.y + 0.7, z: w.feetPosition.z };
    const r = roll(ctx, S), dmg = Math.round(r.dmg / S.ticks), t = Math.max(0.2, Math.hypot(to.x - hand.x, to.z - hand.z) / (S.speed * SLOW));
    bolt(ctx, S.el, hand, to, t); sound(ctx, SOUNDS.air, hand, 0.35, 1.3 + ctx.random() * 0.2);
    ctx.after(t, 'land', { sp: ch.id, wid: w.id, dmg, crit: r.crit, from: p, to });
  } else aoe(ctx, { sp: ch.id, at: ch.pos, from: ch.pos, tick: true });
  if (ch.left - 1 <= 0) stopChannel(ctx, b, null);
}
export function release(ctx, pl) {
  const id = pl.id, S = SPELLS[id], me = ctx.self, st = me.state, now = ctx.now(), b = sess(ctx);
  if (!S || st.dead) return;
  st.windId = null;
  const p = me.feetPosition, f = fwdOf(b), hand = { x: p.x + f.x * 0.6, y: p.y + 1.35, z: p.z + f.z * 0.6 };
  const w = pl.wid ? wolfAt(ctx, pl.wid) : null;
  if (pl.wid && !w) return; // the target fell while it gathered
  const to = w && { x: w.feetPosition.x, y: w.feetPosition.y + 0.7, z: w.feetPosition.z };
  switch (S.kind) {
    case 'bolt': {
      const r = roll(ctx, S), d = Math.hypot(to.x - hand.x, to.y - hand.y, to.z - hand.z);
      if (S.beam) { beam(ctx, hand, to, '#cfe0ff', 0.09, 1.1, 7, 0.45); beam(ctx, hand, to, '#8fb4ff', 0.05, 1.6, 6, 0.35); ctx.after(0.12, 'zap', { a: hand, b: to }); land(ctx, { sp: id, wid: w.id, dmg: r.dmg, crit: r.crit, from: p, to }); break; }
      const t = Math.max(0.25, d / (S.speed * SLOW));
      bolt(ctx, S.root || S.slow ? 'water' : S.el, hand, to, t, S.rock);
      sound(ctx, S.el === 'earth' ? SOUNDS.earth : SOUNDS[S.el], hand, 0.45, 1.05 + ctx.random() * 0.15);
      ctx.after(t, 'land', { sp: id, wid: w.id, dmg: r.dmg, crit: r.crit, from: p, to, n: { x: hand.x - to.x, y: 0.4, z: hand.z - to.z } });
      break; }
    case 'lash': {
      const r = roll(ctx, S); beam(ctx, hand, to, S.el === 'fire' ? '#ff8a2a' : '#5ab8ff', 0.16, 0.15, 6, 0.55);
      sound(ctx, SOUNDS[S.el], hand, 0.5, 1.0); ctx.after(0.25, 'land', { sp: id, wid: w.id, dmg: r.dmg, crit: r.crit, from: p, to }); break; }
    case 'ground': {
      const at = { x: w.feetPosition.x, y: w.feetPosition.y, z: w.feetPosition.z };
      if (S.ticks) { // tornado
        ctx.spawn({ feetPosition: at, lifetime: S.ticks + 0.8, audience: 'near', fx: { script: `fx\npop swirl rate=140 on=disc(1.2) life=.8..1.4 v=up(2.5..4) size=.4..0.8 acc=vortex(7)+radial(-1.5)+drag(.4) col=<1.3,1.5,1.7> a=0>.45:.2>.45:.7>0 sz=$size*(.6>1.8) rot=spin(.8) r=sprite(smoke-puff,add)\npop debris rate=30 on=disc(1.5) life=1..1.6 v=up(3..5) size=.05..0.1 spin=-9..9 acc=vortex(9)+drag(.3) col=<.4,.5,.3> a=1>0 rot=$age*$spin r=sprite(leaf,alpha)` } });
        sound(ctx, SOUNDS.air, at, 0.8, 0.7); ctx.after(0.3, 'aoe', { sp: id, at, from: at, left: S.ticks });
      } else if (S.spike) {
        const sid = ctx.spawn({ feetPosition: at, lifetime: 1.6, audience: 'near', scale: { x: 1, y: 0.05, z: 1 }, primitive: { kind: 'cone', radius: 0.9, height: 3.2, radialSegments: 6 }, material: { color: '#857a68', roughness: 0.95, flatShading: true } });
        animate(ctx, sid, { 'scale.y': 1 }, { duration: 0.3, easing: 'easeOutBack' });
        emitFx(ctx, at, 'earth'); sound(ctx, SOUNDS.earth, at, 0.8, 0.9); ctx.after(0.25, 'aoe', { sp: id, at, from: { x: at.x, y: at.y, z: at.z + 0.01 } });
      } else if (S.boulder) {
        const bid = ctx.spawn({ feetPosition: { x: at.x, y: at.y + 16, z: at.z }, lifetime: 3.4, audience: 'near', interpolation: null, primitive: { kind: 'icosahedron', radius: 2.1, detail: 1 }, material: { color: '#7d7466', roughness: 0.95, flatShading: true }, fx: { script: TRAIL.earth } });
        animate(ctx, bid, { 'feetPosition.y': at.y - 0.6 }, { duration: 0.85, easing: 'easeInQuad' });
        ctx.after(0.85, 'aoe', { sp: id, at, from: p });
      }
      break; }
    case 'nova': {
      if (S.el === 'earth') { ctx.emit('shockwave', { position: p, speed: 20, thickness: 1.6, intensity: 0.6 }); ctx.emit('screenShake', { intensity: 0.45, duration: 0.4 }, { audience: { nearby: p, radius: 30 } });
        ctx.emit('fx', { position: p, script: `fx\npop dust burst=60 on=disc(1) life=.8..1.4 v=radial(9..13)+up(.5) size=.5..0.9 acc=drag(2.2) col=<.5,.43,.34> a=0>.55:.2>.5:.2>0 sz=$size*(.6>2) r=sprite(smoke-puff,alpha)\npop rock burst=30 on=disc(8) life=.6..1 v=up(3..5) size=.1..0.2 spin=-9..9 acc=grav() col=<.45,.38,.3> a=1 rot=$age*$spin floor=bounce(.2) r=sprite(chip,alpha)` }); sound(ctx, SOUNDS.impact, p, 0.9, 0.6); }
      else if (S.root) { ctx.emit('fx', { position: p, script: `fx\npop shard burst=160 on=disc(.6) life=.4..0.7 v=radial(13..16)+up(.3) size=.08..0.16 acc=drag(2.5) col=<1.5,2,2.8> a=1>0 r=sprite(chip,add)\npop frost burst=70 on=disc(1) life=.8..1.3 v=radial(8..11) size=.6..1 acc=drag(2) col=<.8,.95,1.2> a=0>.5:.2>.4:.6>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,alpha)\npop flash burst=1 life=.5 r=light(<.6,.8,1>,50,16)` }); sound(ctx, SOUNDS.ice, p, 0.9, 0.8); }
      else { ctx.emit('fx', { position: p, script: `fx\npop ring burst=220 on=disc(.8) life=.5..0.8 v=radial(12..15) size=.5..0.9 acc=drag(1.5)+buoy(1.5) col=hdr(4.6,2.2,.5)>hdr(1.4,.3,.05) a=1>0 sz=$size*(1>.5) rot=spin(.5) r=sprite(flame-wisp,add)\npop ember burst=60 on=disc(1) life=.6..1.1 v=radial(8..14)+up(2) size=.02..0.05 acc=grav()*.4 col=hdr(5,2.5,.6) a=1>0 r=sprite(ember,add,velocity,.02)\npop flash burst=1 life=.4 r=light(<1,.5,.2>,60,16)` }); sound(ctx, SOUNDS.fire, p, 0.9, 0.8); }
      aoe(ctx, { sp: id, at: p, from: p }); break; }
    case 'cone': {
      const dir = { x: f.x, y: 0.05, z: f.z };
      ctx.emit('fx', { position: hand, script: `fx\npop breath burst=180 life=.5..0.8 v=<%d|0,0,-1>*(11..16)+sdir()*(1.5..3.5) size=.4..0.8 acc=drag(1.4)+buoy(1.2) col=hdr(4.6,2.3,.5)>hdr(1.5,.35,.05) a=1>0 sz=$size*(.6>1.6) rot=spin(.5) r=sprite(flame-wisp,add)\npop smoke on=@breath?.15 life=1..1.6 size=.4..0.6 acc=buoy(.8)+drag(1) col=<.2,.18,.17> a=0>.3:.3>0 sz=$size*(.7>2.2) r=sprite(smoke-puff,alpha)\npop flash burst=1 life=.5 r=light(<1,.5,.2>,40,14)`, params: { d: dir } });
      sound(ctx, SOUNDS.fire, hand, 0.9, 0.7);
      const cosA = Math.cos((S.arc / 2) * Math.PI / 180);
      for (const t of ctx.query({ tags: ['wild-wolf'], center: p, radius: S.radius })) { if (t.state?.dead) continue;
        const dx = t.feetPosition.x - p.x, dz = t.feetPosition.z - p.z, d = Math.hypot(dx, dz) || 0.01;
        if ((dx * f.x + dz * f.z) / d >= cosA) { const r = roll(ctx, S); hurt(ctx, t.id, r.dmg, r.crit, S, p); } }
      break; }
    case 'bind': {
      const ws = w.state; ws.cc = { kind: 'bind', until: now + S.bind * 1000, at: now };
      ws.threat = { ...(ws.threat ?? {}), [me.id]: (ws.threat?.[me.id] ?? 0) + 5 };
      ws.ccFx = ctx.spawn({ parent: w.id, feetPosition: { x: 0, y: 0, z: 0 }, lifetime: S.bind, audience: 'near', fx: { script: `fx\npop wind rate=70 on=disc(.9) life=.6..1 v=up(1..1.8) size=.25..0.45 acc=vortex(8)+radial(-1)+drag(.6) col=<1.4,1.6,1.9> a=0>.35:.25>.35:.7>0 sz=$size*(.6>1.4) rot=spin(.8) r=sprite(smoke-puff,add)` } });
      sound(ctx, SOUNDS.air, to, 0.6, 1.2); emitFx(ctx, to, 'air'); break; }
    case 'self': {
      if (S.shield) { st.shield = S.shield; st.shieldUntil = now + S.dur * 1000; st.shieldKind = S.el; bubble(ctx, b, S.el, S.dur); sound(ctx, SOUNDS.shield, p, 0.6); }
      if (S.heal) { const h = Math.round(maxHp(st) * S.heal); st.hp = Math.min(maxHp(st), (st.hp ?? 0) + h); emitFx(ctx, p, 'heal'); sound(ctx, SOUNDS.heal, p, 0.6);
        ctx.emit('damageNumber', { position: add(p, { x: 0, y: 2, z: 0 }), text: `+${h}`, color: '#5cff8a', size: 1.2 });
        const foes = ctx.query({ tags: ['wild-wolf'], center: p, radius: 60 }).filter((x) => !x.state?.dead && x.state?.threat?.[me.id] != null);
        for (const x of foes) x.state.threat = { ...x.state.threat, [me.id]: Math.round(x.state.threat[me.id] + (h * R.healThreat) / foes.length) }; }
      if (S.speed) { st.speedMul = S.speed; st.speedUntil = now + S.dur * 1000; scooter(ctx, b, S.dur); sound(ctx, SOUNDS.dash, p, 0.6, 0.8); }
      break; }
    case 'dash': b.move = { kind: 'dash', until: now + 280, v: { x: f.x * S.dist / 0.28, z: f.z * S.dist / 0.28 } }; trail(ctx, 'air', 0.5); sound(ctx, SOUNDS.dash, p, 0.7); break;
    case 'jet': b.move = { kind: 'jet', until: now + S.dur * 1000, v: { x: f.x * S.fwd, y: S.up, z: f.z * S.fwd } }; trail(ctx, 'fire', S.dur + 0.2); sound(ctx, SOUNDS.fire, p, 0.8, 1.2); break;
    case 'launch': {
      me.velocity = { x: f.x * S.fwd, y: S.up, z: f.z * S.fwd }; b.move = { kind: 'launch', until: now + 900, v: { x: f.x * S.fwd, z: f.z * S.fwd } };
      const pid = ctx.spawn({ feetPosition: { x: p.x, y: p.y - 3, z: p.z }, lifetime: 2.5, audience: 'near', primitive: { kind: 'cylinder', radiusTop: 0.8, radiusBottom: 1.1, height: 3, radialSegments: 6 }, material: { color: '#857a68', roughness: 0.95, flatShading: true }, physics: 'none' });
      animate(ctx, pid, { 'feetPosition.y': p.y - 0.4 }, { duration: 0.12, easing: 'easeOutQuad' });
      emitFx(ctx, p, 'earth'); sound(ctx, SOUNDS.earth, p, 0.8, 1); break; }
    case 'blink': {
      let dist = S.dist; const hit = raycast(ctx, add(p, { x: 0, y: 1, z: 0 }), { x: f.x, y: 0, z: f.z }, { distance: S.dist, ignoreEntities: [me.id], physicsOnly: true });
      if (hit && hit.distance < dist) dist = Math.max(0, hit.distance - 0.8);
      const nx = p.x + f.x * dist, nz = p.z + f.z * dist, gh = ctx.place.terrain.heightAt(nx, nz);
      emitFx(ctx, add(p, { x: 0, y: 1, z: 0 }), 'water');
      ctx.emit('fx', { position: add(p, { x: 0, y: 1, z: 0 }), script: `fx\npop mist burst=26 on=sphere(.6) life=.6..1.1 v=sdir()*.6 size=.5..0.9 acc=drag(1.5) col=<.7,1.1,1.6> a=.55>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,add)` });
      me.feetPosition = { x: nx, y: Math.max(p.y + 0.2, (gh ?? p.y) + 0.05), z: nz };
      ctx.emit('fx', { position: { x: nx, y: p.y + 1, z: nz }, script: `fx\npop mist burst=26 on=sphere(.6) life=.6..1.1 v=sdir()*.6 size=.5..0.9 acc=drag(1.5) col=<.7,1.1,1.6> a=.55>0 sz=$size*(.6>1.8) r=sprite(smoke-puff,add)` });
      sound(ctx, SOUNDS.heal, p, 0.5, 1.4); break; }
    case 'channel': st.meditateUntil = now + S.dur * 1000; b.medAt = { x: p.x, z: p.z };
      ctx.spawn({ parent: me.id, feetPosition: { x: 0, y: 0.05, z: 0 }, lifetime: S.dur, audience: 'near', fx: { script: `fx\npop motes rate=40 on=disc(1) life=1..1.6 v=up(.5..1) size=.04..0.08 acc=vortex(2)+drag(.4) col=hdr(3.6,2.8,1.2) a=0>1:.3>1:.7>0 r=sprite(mote,add)\npop glow n=1 r=light(<1,.8,.45>,6,5)` } });
      sound(ctx, SOUNDS.heal, p, 0.5, 0.7); break;
    case 'avatar': st.harmony = 0; st.avatarUntil = now + S.dur * 1000;
      ctx.spawn({ parent: me.id, feetPosition: { x: 0, y: 0.05, z: 0 }, lifetime: S.dur, audience: 'near', fx: { script: `fx\npop aura rate=70 on=disc(.6) life=.6..1 v=up(1.5..2.5) size=.1..0.2 acc=vortex(3)+drag(.5) col=hdr(2.6,3.2,4.6) a=0>1:.2>1:.7>0 r=sprite(mote,add)\npop orb rate=12 on=sphere(1.4).c(1.1) life=.8..1.2 v=sdir()*.2 size=.25..0.4 tint=0..3 col=$tint<1?hdr(2,2.3,2.6):$tint<2?hdr(.6,1.4,3):hdr(3.2,1.4,.4) a=0>.8:.3>.8:.7>0 r=sprite(soft-disc,add)\npop glow n=1 at=point().c(1.2) r=light(<.7,.85,1>,14,9)` } });
      ctx.emit('highlightSet', { target: me.id, color: '#bfe4ff', style: 'glow', duration: S.dur });
      ctx.emit('shockwave', { position: p, speed: 25, thickness: 2, intensity: 0.8 }); ctx.emit('screenFlash', { color: '#dff0ff', duration: 0.4, intensity: 0.5 }, { audience: { player: me.id } });
      sound(ctx, SOUNDS.avatar, p, 1, 1); break;
  }
}
function trail(ctx, el, dur) { ctx.spawn({ parent: ctx.self.id, feetPosition: { x: 0, y: 0.8, z: 0 }, lifetime: dur, audience: 'near', fx: { script: TRAIL[el].replace(/pop core[^\n]*|pop glow[^\n]*/g, '').trim() } }); }
function bubble(ctx, b, el, dur) {
  if (b.fx.bubble) ctx.destroy(b.fx.bubble);
  const col = el === 'earth' ? '#b38a58' : el === 'water' ? '#4fb3ff' : '#e6f6ff';
  b.fx.bubble = ctx.spawn({ parent: ctx.self.id, feetPosition: { x: 0, y: -0.1, z: 0 }, lifetime: dur, audience: 'near', castShadow: false, primitive: { kind: 'sphere', radius: 1.15, widthSegments: 18, heightSegments: 12 },
    material: { color: col, emissive: col, emissiveIntensity: 0.9, transparent: true, opacity: el === 'earth' ? 0.32 : 0.2, depthWrite: false } });
}
function scooter(ctx, b, dur) {
  ctx.spawn({ parent: ctx.self.id, feetPosition: { x: 0, y: -0.5, z: 0 }, lifetime: dur, audience: 'near', castShadow: false, primitive: { kind: 'sphere', radius: 0.55, widthSegments: 14, heightSegments: 10 },
    material: { color: '#eaf8ff', emissive: '#cfefff', emissiveIntensity: 1.4, transparent: true, opacity: 0.45, depthWrite: false }, fx: { script: TRAIL.air.replace(/pop core[^\n]*/, '').trim() } });
}

// ---------- hooks ----------
export function onSpawn(ctx) {
  const st = ctx.self.state;
  st.lvl ??= 1; st.xp ??= 0; st.stance ??= 'air'; st.harmony ??= 0; st.kills ??= 0;
  if (st.hp == null || st.hp <= 0 || st.dead) { st.hp = maxHp(st); st.dead = false; }
  st.chi ??= maxChi(st); st.shield = 0; st.tgt = null; st.meditateUntil = 0;
  if ((st.speedUntil ?? 0) && st.speedMul !== 1) { st.speedMul = 1; st.speedUntil = 0; }
}
const KEYS = ['cast1', 'cast2', 'cast3', 'cast4', 'cast5', 'cast6'];
export function onInput(ctx, input) {
  const b = sess(ctx), st = ctx.self.state, p = input.pressed || {};
  const B = steerBasis(ctx, input); b.aim = { s: B.sin ?? b.aim.s, c: B.cos ?? b.aim.c };
  // a quick left click (no drag) on a wolf targets it, WoW's free cursor
  if (p.orbit) b.clickAt = ctx.now();
  if (input.released?.orbit && ctx.now() - (b.clickAt ?? 0) < 260) {
    const ray = getInputRay(ctx, input);
    if (ray) { const hit = raycast(ctx, ray.origin, ray.direction, { distance: RULES.targetRange + 20, tags: ['wild-wolf'], ignoreEntities: [ctx.self.id] });
      if (hit?.id && wolfAt(ctx, hit.id)) { st.tgt = hit.id; sound(ctx, SOUNDS.shield, ctx.self.feetPosition, 0.2, 1.8); } }
  }
  if (p.bookToggle) { st.bookOpen = !st.bookOpen; st.journalOpen = false; }
  if (p.journalToggle) { st.journalOpen = !st.journalOpen; st.bookOpen = false; }
  if (p.travelClose) { st.bookOpen = false; st.journalOpen = false; st.tgt = null; }
  if (ctx.self.parent || ctx.self.controlling || st.dead || st.mountedOn || st.seatedOn) return;
  if (p.stanceNext) { st.stance = STANCES[(STANCES.indexOf(st.stance) + 1) % 4]; sound(ctx, SOUNDS.shield, ctx.self.feetPosition, 0.25, 1.6); }
  if (p.stancePick && STANCES.includes(input.actionData?.stancePick?.el)) st.stance = input.actionData.stancePick.el;
  if (p.targetNext) cycleTarget(ctx, b);
  if (p.targetPick) { const id = input.actionData?.targetPick?.id; if (wolfAt(ctx, id)) st.tgt = id; }
  if (p.castSlot && SPELLS[input.actionData?.castSlot?.id]) { cast(ctx, b, input.actionData.castSlot.id); return; }
  if (p.meditate) cast(ctx, b, 'meditate');
  if (p.avatar) cast(ctx, b, 'avatar-state');
  if (st.travelOpen || st.courierPick || st.alchemyOpen || ctx.now() - (st.travelAt ?? 0) < 400) return; // the number row belongs to those menus while they stand
  const bar = BARS[st.stance] ?? BARS.air;
  KEYS.forEach((k, i) => { if (p[k]) cast(ctx, b, bar[i]); });
}
export function update(ctx, dt) {
  const me = ctx.self, st = me.state, b = sess(ctx), now = ctx.now();
  // movement spells hold the body's velocity over player.js's ease while they run
  if (b.move) {
    if (now > b.move.until || st.dead) b.move = null;
    else { const v = me.velocity; me.velocity = b.move.kind === 'jet' ? { x: b.move.v.x, y: b.move.v.y, z: b.move.v.z } : b.move.kind === 'dash' ? { x: b.move.v.x, y: Math.max(0, v.y), z: b.move.v.z } : { x: b.move.v.x, y: v.y, z: b.move.v.z }; }
  }
  if (st.casting || st.channeling) { // standing still is the price: a step, a jump or a launch breaks it
    const f0 = b.castFrom, q = me.feetPosition, moved = !f0 || Math.hypot(q.x - f0.x, q.z - f0.z) > R.moveCancel || Math.abs(q.y - f0.y) > 0.6 || !!b.move;
    if (st.dead) { cancelCast(ctx, b, null); stopChannel(ctx, b, null); }
    else if (st.casting) { if (moved) cancelCast(ctx, b, 'Interrupted'); else if (now >= st.casting.end) finishCast(ctx, b); }
    else if (st.channeling) { if (moved) stopChannel(ctx, b, 'Interrupted'); else if (now >= st.channeling.next) channelTick(ctx, b); else if (now > st.channeling.end + 300) stopChannel(ctx, b, null); }
  }
  if (b.queued && now >= b.queued.at) { const q = b.queued; b.queued = null; if (now - q.at < 600) cast(ctx, b, q.id); }
  // death: the world holds a beat, then you are back on your feet where you last stood safe
  const hpMax = maxHp(st), chiMax = maxChi(st);
  if (st.dead) {
    me.velocity = { x: 0, y: me.velocity.y, z: 0 };
    if (now - (st.deadAt ?? 0) > R.respawnMs) {
      const s = st.lastSafe ?? { x: 0, y: 2, z: -3 }; me.feetPosition = { x: s.x, y: s.y + 0.3, z: s.z };
      st.dead = false; st.hp = hpMax; st.chi = chiMax; st.tgt = null; st.combatUntil = 0; me.vignette = 0;
      emitFx(ctx, s, 'heal'); sound(ctx, SOUNDS.heal, s, 0.6);
    }
    st.bendBusy = true; return;
  }
  if ((st.hp ?? hpMax) <= 0) {
    st.dead = true; st.deadAt = now; st.shield = 0; st.meditateUntil = 0; b.move = null; me.vignette = 0.55;
    ctx.emit('screenFlash', { color: '#5a0000', duration: 0.6, intensity: 0.6 }, { audience: { player: me.id } });
    ctx.emit('stat', { name: 'deaths to wolves' }, { audience: { player: me.id } }); return;
  }
  // a 4 Hz heartbeat for the slow numbers, so the bars move without a row a tick
  b.acc += dt; if (b.acc < 0.25) { st.bendBusy = !!b.move || !!st.casting || !!st.channeling; return; } const step = b.acc; b.acc = 0;
  const inCombat = now < (st.combatUntil ?? 0), med = now < (st.meditateUntil ?? 0);
  if (med && b.medAt && Math.hypot(me.feetPosition.x - b.medAt.x, me.feetPosition.z - b.medAt.z) > 0.4) st.meditateUntil = 0;
  let hp = st.hp ?? hpMax, chi = st.chi ?? chiMax;
  chi = Math.min(chiMax, chi + (med ? 25 : R.chiRegen * (now - (st.lastSpend ?? 0) < R.fsr ? R.fsrRegen : 1)) * step); // the five-second rule
  if (med) hp += hpMax * 0.06 * step; else if (!inCombat) hp += hpMax * R.hpRegenOut * step;
  hp = Math.min(hpMax, hp);
  if (Math.abs(hp - (st.hp ?? 0)) >= 0.5) st.hp = Math.round(hp * 10) / 10;
  if (Math.abs(chi - (st.chi ?? 0)) >= 0.5 || chi === chiMax) st.chi = chi === chiMax ? chiMax : Math.round(chi);
  if ((st.shield ?? 0) > 0 && now > (st.shieldUntil ?? 0)) st.shield = 0;
  if ((st.shield ?? 0) <= 0 && b.fx.bubble) { ctx.destroy(b.fx.bubble); b.fx.bubble = null; }
  if (st.speedUntil && now > st.speedUntil) { st.speedMul = 1; st.speedUntil = 0; }
  if (st.tgt && !wolfAt(ctx, st.tgt)) st.tgt = null;
  const vg = hp < hpMax * 0.3 ? 0.25 : 0; if (me.vignette !== vg) me.vignette = vg;
  if (!inCombat && me.grounded && (!st.lastSafe || now - (b.safeAt ?? 0) > 2000)) { b.safeAt = now; const f = me.feetPosition; st.lastSafe = { x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10, z: Math.round(f.z * 10) / 10 }; }
  // levels and quests
  const need = R.xpNeed(st.lvl ?? 1);
  if ((st.xp ?? 0) >= need && (st.lvl ?? 1) < R.maxLevel) {
    st.xp -= need; st.lvl = (st.lvl ?? 1) + 1; st.hp = maxHp(st); st.chi = maxChi(st);
    emitFx(ctx, me.feetPosition, 'level'); sound(ctx, SOUNDS.level, me.feetPosition, 0.9);
    st.toast = { text: `Level ${st.lvl}!`, sub: 'Your bending grows stronger', at: now };
    ctx.emit('milestone', { step: st.lvl, name: `level ${st.lvl}` }, { audience: { player: me.id } });
  }
  const done = st.quests ?? {};
  for (const q of QUESTS) if (!done[q.id] && (st[q.stat] ?? 0) >= q.need) {
    st.quests = { ...done, [q.id]: now }; st.xp = (st.xp ?? 0) + q.xp; st.toast = { text: `${q.title} complete`, sub: `+${q.xp} xp`, at: now };
    sound(ctx, SOUNDS.quest, me.feetPosition, 0.8); break;
  }
  st.bendBusy = !!b.move || !!b.queued || !!st.casting || !!st.channeling || hp < hpMax || chi < chiMax || (st.shield ?? 0) > 0 || !!st.speedUntil || !!st.tgt || inCombat;
}
