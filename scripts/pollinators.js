// ONE manager steps every row tagged "pollinator": bees fly bed to bed (a few flowers, then home to the hive with pollen),
// butterflies drift between beds and rest open-winged on them, dragonflies dart and hover over the lawn.
// A sip leaves a pollen puff at the flower; a bee back at the hive drops a golden puff. Tuning: scripts/lib/data/pollinators.yml.
import P from './lib/data/pollinators.yml';
export const updateSchedule = { every: 2 };
const TAU = Math.PI * 2;
const r = (ctx, [a, b]) => a + (b - a) * ctx.random();
const POLLEN = `fx
pop dust burst=10..16 life=.5..1 v=up(.2..0.5)+sdir()*(.15..0.35) size=.02..0.04 acc=drag(2)+grav()*.08 col=hdr(1.6,1.3,.35) a=1>.6:1>0 r=sprite(soft-disc,add)`;
const HONEY = `fx
pop gold burst=18 life=.6..1.2 v=sdir()*(.3..0.7)+up(.3) size=.03..0.05 acc=drag(2) col=hdr(2,1.4,.3) a=1>0 r=sprite(mote,add)`;
let beds = null, S = {};
function flowers(ctx) {
  const rows = ctx.query({ center: { x: P.home.x, y: 0.5, z: P.home.z }, radius: 40 });
  return rows.filter((q) => /^(grounds-row|grounds-bed|grounds-round|home-garden\/flowers)/.test(q.id)).map((q) => q.worldFeetPosition || q.feetPosition);
}
function clip(o, name) { if (S[o.id]?.clip === name) return; S[o.id].clip = name; o.anim.body = { clip: `anim/pollinator.yml#${name}`, loop: 'loop', weight: 1 }; }
function leg(ctx, o, s, to, speed, mode) {
  const p = s.p, d = Math.hypot(to.x - p.x, to.y - p.y, to.z - p.z);
  s.from = { ...p }; s.to = to; s.t0 = ctx.now(); s.dur = Math.max(0.4, d / speed) * 1000; s.mode = mode;
}
function spot(ctx, b, yr) { const a = ctx.random() * TAU, rr = ctx.random() * 0.8; return { x: b.x + Math.cos(a) * rr, y: b.y + r(ctx, yr), z: b.z + Math.sin(a) * rr }; }
function lawnPoint(ctx) { const a = ctx.random() * TAU, rr = 8 + ctx.random() * (P.lawn.radius - 8), x = P.home.x + Math.cos(a) * rr, z = P.home.z + Math.sin(a) * rr; return { x, y: (ctx.place.terrain.heightAt(x, z) ?? 0.5) + r(ctx, P.dragonfly.flyY), z }; }
function next(ctx, o, s) {
  const k = s.kind, now = ctx.now();
  if (s.mode === 'sip' || s.mode === 'hover' || s.mode === 'hive') {
    if (k === 'bee') {
      if (s.mode === 'sip') { s.load = (s.load ?? 0) + 1; ctx.emit('fx', { position: s.p, script: POLLEN }); }
      if (s.mode === 'hive') { s.load = 0; s.trip = Math.round(r(ctx, P.bee.visitsPerTrip)); }
      if ((s.load ?? 0) >= (s.trip ?? 4)) return leg(ctx, o, s, { x: P.hive.x + (ctx.random() - 0.5), y: P.hive.y, z: P.hive.z + (ctx.random() - 0.5) }, r(ctx, P.bee.speed), 'tohive');
      return leg(ctx, o, s, spot(ctx, beds[Math.floor(ctx.random() * beds.length)], P.bee.sipY), r(ctx, P.bee.speed), 'fly');
    }
    if (k === 'butterfly') { if (s.mode === 'sip') ctx.emit('fx', { position: s.p, script: POLLEN }); return leg(ctx, o, s, spot(ctx, beds[Math.floor(ctx.random() * beds.length)], P.butterfly.sipY), r(ctx, P.butterfly.speed), 'fly'); }
    return leg(ctx, o, s, ctx.random() < 0.4 && beds.length ? spot(ctx, beds[Math.floor(ctx.random() * beds.length)], [1, 1.5]) : lawnPoint(ctx), r(ctx, P.dragonfly.speed), 'fly');
  }
  // arrived from a flight
  s.from = { ...s.p }; s.to = s.p; s.t0 = now;
  if (s.mode === 'tohive') { s.mode = 'hive'; s.dur = 2500; ctx.emit('fx', { position: s.p, script: HONEY }); return; }
  if (k === 'dragonfly') { s.mode = 'hover'; s.dur = r(ctx, P.dragonfly.hover) * 1000; return; }
  s.mode = 'sip'; s.dur = r(ctx, k === 'bee' ? P.bee.sip : P.butterfly.sip) * 1000;
}
export function update(ctx) {
  const near = ctx.place.players.some((pl) => Math.hypot(pl.feetPosition.x - P.home.x, pl.feetPosition.z - P.home.z) < P.wakeRadius);
  if (!near) { ctx.sleep(4); return; }
  if (!beds || !beds.length) { beds = flowers(ctx); if (!beds.length) { ctx.sleep(5); return; } }
  const now = ctx.now();
  for (const q of ctx.query({ tags: ['pollinator'], center: { x: P.home.x, y: 0.5, z: P.home.z }, radius: 80 })) {
    const o = q, s = (S[o.id] ??= { kind: o.state.kind, p: { ...o.feetPosition }, mode: 'hover', t0: now, dur: 300 + ctx.random() * 2000, from: { ...o.feetPosition }, to: { ...o.feetPosition }, seed: ctx.random() * 100 });
    let u = (now - s.t0) / s.dur;
    if (u >= 1) { next(ctx, o, s); u = 0; }
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2, t = now / 1000 + s.seed;
    const moving = s.mode === 'fly' || s.mode === 'tohive';
    const w = s.kind === 'butterfly' ? 0.25 : s.kind === 'bee' ? 0.08 : 0.03;
    const bob = moving ? Math.sin(u * Math.PI) * (s.kind === 'butterfly' ? 0.5 : 0.25) : 0;
    const p = { x: s.from.x + (s.to.x - s.from.x) * e + Math.sin(t * 2.3) * w, y: s.from.y + (s.to.y - s.from.y) * e + bob + Math.sin(t * (s.kind === 'butterfly' ? 3 : 7)) * w * 0.6, z: s.from.z + (s.to.z - s.from.z) * e + Math.cos(t * 1.9) * w };
    const dx = s.to.x - s.from.x, dz = s.to.z - s.from.z;
    s.p = p; o.feetPosition = p;
    if (moving && Math.hypot(dx, dz) > 0.05) o.rotation = { yaw: Math.atan2(-dx, -dz) * 180 / Math.PI };
    clip(o, s.kind + (moving || s.kind === 'dragonfly' || (s.kind === 'bee' && s.mode !== 'sip') ? '-fly' : '-sip'));
    if (s.kind === 'bee' && s.mode === 'sip' && !s.buzzed) { s.buzzed = true; if (ctx.random() < 0.25) ctx.emit('playSound', { clip: P.buzz, position: p, volume: 0.18, maxDistance: 7, pitch: 0.9 + ctx.random() * 0.25 }); }
    if (s.mode !== 'sip') s.buzzed = false;
  }
}
