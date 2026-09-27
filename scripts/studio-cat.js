// Pixel, the studio cat: pads round the floor outside the tree's bench ring, sits, grooms, loafs, and hops up onto the
// walnut bench to nap. One cat, its own update; clips are the catio's (scripts/lib/data/catio.yml). Press = catio-cat.js.
import { play } from 'builtin/anim';
import CFG from './lib/data/catio.yml';
const C = { x: 0, y: -5.6, z: -26 };           // studio floor, the tree's centre
const RING = 3.15, SEAT = 2.07, SEAT_Y = 0.45;  // outside the bench / the bench seat (apothem) / its height
const FLOOR = ['sit', 'groom', 'loaf', 'sit'], BENCH = ['nap', 'loaf', 'nap'];
const CLIP = {};
const clip = (k) => (CLIP[k] ??= { name: 'catio-' + k, ...CFG.clips[k] });
const rnd = (ctx, a, b) => a + (b - a) * ctx.random();
const pt = (r, a, y = 0) => ({ x: C.x + Math.cos(a) * r, y: C.y + y, z: C.z + Math.sin(a) * r });
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI;
function anim(ctx, k, speed = 1) {
  const s = ctx.self.state; if (s.anim === k && k !== 'jump') return; s.anim = k;
  play(ctx, ctx.self, clip(k), { channel: 'body', loop: k === 'jump' ? 'once' : true, speed, blendIn: k === 'jump' ? 0.08 : 0.3 });
}
function polar(p) { const dx = p.x - C.x, dz = p.z - C.z; return { r: Math.hypot(dx, dz), a: Math.atan2(dz, dx) }; }
// a walk that keeps outside the ring: sweep the angle, ease the radius
function walkPts(from, to) {
  const A = polar(from), B = polar(to); let da = B.a - A.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(Math.abs(da) * 4)), out = [];
  for (let i = 0; i <= n; i++) { const f = i / n, r = Math.max(RING, A.r + (B.r - A.r) * f + Math.sin(f * Math.PI) * 0.4); out.push(pt(r, A.a + da * f)); }
  return out;
}
function rest(ctx, mode) {
  const s = ctx.self.state; s.seg = null; s.mode = mode;
  s.until = ctx.now() + rnd(ctx, ...(CFG.rest[mode] || [4, 8])) * 1000 * (mode === 'nap' ? 0.8 : 1);
  if (!s.onBench) ctx.self.rotation = { yaw: ctx.random() * 360 };
  anim(ctx, mode);
}
function go(ctx, kind, pts) {
  const s = ctx.self.state; let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z);
  const dur = kind === 'walk' ? Math.max(0.5, len / (CFG.walkSpeed * 1.2)) : CFG.jump.base + CFG.jump.perM * len;
  s.seg = { kind, pts, len, t0: ctx.now(), dur, h: kind === 'jump' ? CFG.jump.lift + CFG.jump.liftPerUp * Math.max(0, pts[pts.length - 1].y - pts[0].y) : 0, leg: 0 };
  s.mode = kind; anim(ctx, kind, kind === 'jump' ? 0.6 / dur : 1);
}
function decide(ctx) {
  const s = ctx.self.state, here = ctx.self.feetPosition;
  if (s.onBench) { const P = polar(here); s.queue = null; s.onBench = false; return go(ctx, 'jump', [here, pt(RING, P.a)]); }
  if (s.queue === 'up') { const P = polar(here); s.queue = null; s.onBench = true; return go(ctx, 'jump', [here, pt(SEAT, P.a, SEAT_Y)]); }
  if (ctx.random() < 0.3) { // head for a bench face and hop up
    const a = (30 + 60 * Math.floor(ctx.random() * 6)) * Math.PI / 180; s.queue = 'up';
    return go(ctx, 'walk', walkPts(here, pt(RING, a)));
  }
  go(ctx, 'walk', walkPts(here, pt(rnd(ctx, RING + 0.2, 6.0), ctx.random() * Math.PI * 2)));
}
export const updateSchedule = { near: { radius: 40 } };
export function update(ctx) {
  const me = ctx.self, s = me.state, now = ctx.now();
  if (!s.mode) { rest(ctx, 'sit'); return; }
  if (s.petAt && now - s.petAt < (CFG.petHold || 3) * 1000 && !s.seg) { anim(ctx, 'happy'); if (s.until < s.petAt + 3500) s.until = s.petAt + 3500; return; }
  if (s.anim === 'happy' && !s.seg) anim(ctx, s.mode);
  const g = s.seg;
  if (!g) { if (now >= s.until) decide(ctx); else ctx.sleep(0.5); return; }
  const t = Math.min(1, (now - g.t0) / (g.dur * 1000)); let p;
  if (g.kind === 'jump') {
    const a = g.pts[0], b = g.pts[1];
    p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + g.h * 4 * t * (1 - t), z: a.z + (b.z - a.z) * t };
    if (!g.leg) { g.leg = 1; me.rotation = { yaw: yawOf(b.x - a.x, b.z - a.z) }; }
  } else {
    let d = t * g.len, i = 1;
    for (; i < g.pts.length; i++) { const a = g.pts[i - 1], b = g.pts[i], l = Math.hypot(b.x - a.x, b.z - a.z); if (d <= l || i === g.pts.length - 1) { const k = l > 0 ? Math.min(1, d / l) : 1; p = { x: a.x + (b.x - a.x) * k, y: a.y, z: a.z + (b.z - a.z) * k }; break; } d -= l; }
    if (g.leg !== i) { g.leg = i; const a = g.pts[i - 1], b = g.pts[i]; me.rotation = { yaw: yawOf(b.x - a.x, b.z - a.z) }; }
  }
  me.feetPosition = p;
  if (t >= 1) {
    if (s.queue === 'up') { s.seg = null; s.until = now; return; } // straight into the hop
    if (g.kind === 'jump' && s.onBench) { const P = polar(p); me.rotation = { yaw: yawOf(-Math.sin(P.a), Math.cos(P.a)) }; }
    rest(ctx, (s.onBench ? BENCH : FLOOR)[Math.floor(ctx.random() * 3)]);
  }
}
