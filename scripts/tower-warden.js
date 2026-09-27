// A tower warden: paces the lookout ring, pauses to look out over the land, greets a player who comes within range
// (faces them, raises the staff, the staff crystal flashes, one chime per approach) and speaks a line on E.
// State: { tower: 'n'|'e'|'s'|'w', center: {x,y,z} platform centre }. Tuning: lib/data/wardens.yml.
import W from './lib/data/wardens.yml';
export const updateSchedule = { every: 2 };
const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const yawTo = (dx, dz) => Math.atan2(-dx, -dz) * 180 / Math.PI;
const roll = (ctx, [a, b]) => a + ctx.random() * (b - a);
const pos = (p) => p.worldFeetPosition || p.feetPosition;
const GREET_FX = `fx
pop spark burst=26 life=.5..1 on=sphere(.12) v=sdir()*(1..2.2) size=.03..0.06 acc=drag(2)+buoy(.4) col=hdr(.8,3,2.2)>hdr(.4,1.6,1.2) a=1>.6:1>0 sz=$size r=sprite(ember,add,velocity,.02)
pop glow burst=1 life=.7 r=light(<.4,1,.8>,8,6)`;

function base(ctx, clip, speed = 1) {
  const s = ctx.self.state, key = clip + '@' + speed;
  if (s.clip === key) return;
  s.clip = key; ctx.self.anim.base = { clip, weight: 1, loop: 'loop', speed };
}
function face(ctx, yaw) { ctx.self.rotation = { yaw }; }

function greet(ctx, player, now) {
  const s = ctx.self.state, me = pos(ctx.self), q = pos(player);
  s.mode = 'greet'; s.until = now + W.greetSecs * 1000; s.face = player.id;
  face(ctx, yawTo(q.x - me.x, q.z - me.z));
  base(ctx, 'Idle');
  ctx.self.anim.gesture = { clip: W.greetClip, weight: 4, loop: 'loop', mask: { from: 'Spine' } };
  ctx.emit('playSound', { clip: W.chime, position: me, volume: 0.8, maxDistance: 45 });
  ctx.emit('flash', { target: ctx.self.id + '/staff', color: '#8fffe0', duration: 0.8 });
  ctx.emit('fx', { position: { x: me.x, y: me.y + 2.1, z: me.z }, script: GREET_FX });
}

export function onSpawn(ctx) { ctx.self.state.clip = null; ctx.self.state.mode = 'walk'; }

export function update(ctx, dt) {
  const s = ctx.self.state, c = s.center; if (!c) return;
  const now = ctx.now(), players = ctx.place.players;
  if (!players.some((p) => pos(p) && flat(pos(p), c) < W.wakeRange)) { base(ctx, 'Idle'); ctx.sleep(W.sleepSecs); return; }
  // one greeting per approach
  const greeted = s.greeted || [], keep = [];
  let fresh = null;
  for (const p of players) {
    const q = pos(p); if (!q) continue; const d = flat(q, c);
    if (greeted.includes(p.id) && d < W.greetRange + W.greetHysteresis) keep.push(p.id);
    else if (!greeted.includes(p.id) && d < W.greetRange && !fresh) { fresh = p; keep.push(p.id); }
  }
  if (fresh || keep.length !== greeted.length) s.greeted = keep;
  if (fresh && s.mode !== 'greet') greet(ctx, fresh, now);

  const me = pos(ctx.self), R = W.patrolRadius;
  let a = Math.atan2(me.z - c.z, me.x - c.x);
  if (!Number.isFinite(a)) a = 0;
  if (s.mode === 'greet') {
    const p = players.find((q) => q.id === s.face), q = p && pos(p);
    if (q) face(ctx, yawTo(q.x - me.x, q.z - me.z));
    if (now < s.until) return;
    ctx.self.anim.gesture = null; s.mode = 'walk'; s.until = now + roll(ctx, W.pauseRange) * 1000; s.dir = ctx.random() < 0.5 ? -1 : 1;
  }
  if (s.mode === 'look') {
    const t = 1 - (s.until - now) / (s.lookMs || 1);
    face(ctx, s.lookYaw + Math.sin(t * Math.PI * 2) * W.lookSweep);
    if (now < s.until) return;
    s.mode = 'walk'; s.until = now + roll(ctx, W.pauseRange) * 1000; s.dir = ctx.random() < 0.5 ? -1 : 1;
  }
  // walk the ring
  if (!s.until || !s.dir) { s.until = now + roll(ctx, W.pauseRange) * 1000; s.dir = 1; }
  if (now >= s.until) {
    s.mode = 'look'; s.lookMs = roll(ctx, W.lookSecs) * 1000; s.until = now + s.lookMs; s.lookYaw = yawTo(Math.cos(a), Math.sin(a));
    base(ctx, 'Idle'); return;
  }
  base(ctx, 'Walk', W.walkClipSpeed);
  a += s.dir * W.speed / R * dt;
  ctx.self.feetPosition = { x: c.x + Math.cos(a) * R, y: c.y, z: c.z + Math.sin(a) * R };
  face(ctx, yawTo(-Math.sin(a) * s.dir, Math.cos(a) * s.dir));
}

export const ears = {
  press: (ctx, { by } = {}) => {
    const s = ctx.self.state, now = ctx.now();
    if (now - (s.saidAt || 0) < W.lineCooldownMs) return; s.saidAt = now;
    const me = pos(ctx.self), who = by && ctx.getObject(by.id ?? by), q = who && pos(who);
    if (q) face(ctx, yawTo(q.x - me.x, q.z - me.z));
    const line = W.lines[Math.floor(ctx.random() * W.lines.length) % W.lines.length];
    ctx.emit('damageNumber', { position: { x: me.x, y: me.y + 2.7, z: me.z }, text: `Warden ${W.names[s.tower] ?? ''}`, color: '#9fe8c8', size: 1, lifetime: 3.5 });
    ctx.emit('damageNumber', { position: { x: me.x, y: me.y + 2.3, z: me.z }, text: line, color: '#fff6e0', size: 0.75, lifetime: 5 });
    ctx.emit('flash', { target: ctx.self.id + '/staff', color: '#8fffe0', duration: 0.5 });
  },
};
