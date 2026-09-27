// The one manager of the catio's cats (on the catio-site root; cats are rows tagged "catio-cat" with no update of their own):
// each rests on a perch (nap curled, loaf, sit, groom, drink), then pads along a walk link or leaps a jump link to a free
// perch. Every perch is inside the enclosure, so the cats never leave it. Numbers: scripts/lib/data/catio.yml.
import { play } from 'builtin/anim';
import CFG from './lib/data/catio.yml';
import { PERCHES, LINKS } from './gen/catio-layout.js';
const CLIP = {}, LEG = new Map();
const clip = (k) => (CLIP[k] ??= { name: 'catio-' + k, ...CFG.clips[k] });
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI;
const rnd = (ctx, r) => r[0] + (r[1] - r[0]) * ctx.random();
const pick = (ctx, a) => (a.length ? a[Math.floor(ctx.random() * a.length) % a.length] : undefined);
function frame(root) {
  const o = root.feetPosition, yaw = root.state?.yaw ?? 120, a = (yaw * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return { yaw, W: (p) => ({ x: o.x + p[0] * c + p[2] * s, y: o.y + p[1], z: o.z - p[0] * s + p[2] * c }) };
}
function anim(ctx, cat, k, speed = 1) {
  if (cat.state.anim === k && k !== 'jump') return;
  cat.state.anim = k;
  play(ctx, cat, clip(k), { channel: 'body', loop: k === 'jump' ? 'once' : true, speed, blendIn: k === 'jump' ? 0.08 : 0.3 });
}
function face(cat, F, ly) { cat.state.ly = ly; cat.rotation = { yaw: F.yaw + ly }; }
function rest(ctx, cat, F, id, mode) {
  const P = PERCHES[id], s = cat.state;
  mode = mode || pick(ctx, P.rest);
  s.perch = id; s.mode = mode; s.until = ctx.now() + rnd(ctx, CFG.rest[mode] || [3, 6]) * 1000;
  if (mode !== 'pass') face(cat, F, P.yaw != null ? P.yaw + (ctx.random() * 2 - 1) * CFG.yawJitter * 0.4 : ctx.random() * 360);
  anim(ctx, cat, mode === 'pass' ? 'walk' : mode);
}
function move(ctx, cat, F, taken) {
  const s = cat.state, here = s.perch;
  let opts = LINKS.filter((l) => l[0] === here || l[1] === here).map((l) => {
    const fwd = l[0] === here; return { to: fwd ? l[1] : l[0], kind: l[2], via: l[3] ? (fwd ? l[3] : [...l[3]].reverse()) : [] };
  }).filter((o) => !taken.includes(o.to));
  if (opts.length > 1) { const f = opts.filter((o) => o.to !== s.from); if (f.length) opts = f; }
  const o = pick(ctx, opts);
  if (!o) return false;
  const pts = [PERCHES[here].p, ...o.via, PERCHES[o.to].p];
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  const J = CFG.jump, dy = pts[pts.length - 1][1] - pts[0][1];
  const dur = o.kind === 'walk' ? Math.max(0.4, len / CFG.walkSpeed) : J.base + J.perM * len;
  s.seg = { pts, kind: o.kind, t0: ctx.now(), dur, to: o.to, len, h: o.kind === 'jump' ? J.lift + J.liftPerUp * Math.max(0, dy) + J.liftPerM * len : 0 };
  s.from = here; s.perch = null; s.mode = o.kind; LEG.delete(cat.id);
  anim(ctx, cat, o.kind, o.kind === 'jump' ? 0.6 / dur : 1);
  return true;
}
function step(ctx, cat, F) {
  const s = cat.state, g = s.seg, t = Math.min(1, (ctx.now() - g.t0) / (g.dur * 1000));
  let pos;
  if (g.kind === 'jump') {
    const a = g.pts[0], b = g.pts[g.pts.length - 1];
    pos = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + g.h * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
    if (!LEG.has(cat.id)) { LEG.set(cat.id, 0); if (Math.hypot(b[0] - a[0], b[2] - a[2]) > 0.05) face(cat, F, yawOf(b[0] - a[0], b[2] - a[2])); }
  } else {
    let d = t * g.len, i = 1;
    for (; i < g.pts.length; i++) { const a = g.pts[i - 1], b = g.pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); if (d <= l || i === g.pts.length - 1) { const k = l > 0 ? Math.min(1, d / l) : 1; pos = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; break; } d -= l; }
    if (LEG.get(cat.id) !== i) { LEG.set(cat.id, i); const a = g.pts[i - 1], b = g.pts[i]; if (Math.hypot(b[0] - a[0], b[2] - a[2]) > 0.02) face(cat, F, yawOf(b[0] - a[0], b[2] - a[2])); }
  }
  cat.feetPosition = F.W(pos);
  if (t >= 1) { s.seg = null; rest(ctx, cat, F, g.to); }
}
export function update(ctx) {
  const F = frame(ctx.self), now = ctx.now();
  const cats = []; for (const c of CFG.cats) { const o = ctx.getObject(c.id); if (o) cats.push([c, o]); }
  for (const [c, cat] of cats) {
    const s = cat.state;
    if (!s.perch && !s.seg) { cat.feetPosition = F.W(PERCHES[c.start].p); rest(ctx, cat, F, c.start, c.mode); continue; }
    if (s.seg) { step(ctx, cat, F); continue; }
    const hold = CFG.petHold * 1000;
    if (s.petAt && now - s.petAt < hold) { anim(ctx, cat, 'happy'); if (s.until < s.petAt + hold + 500) s.until = s.petAt + hold + 500; continue; }
    if (s.anim === 'happy') anim(ctx, cat, s.mode === 'pass' ? 'walk' : s.mode);
    if (now < s.until) continue;
    const taken = cats.filter(([, o]) => o !== cat).flatMap(([, o]) => [o.state.perch, o.state.seg?.to]).filter(Boolean);
    if (s.mode !== 'pass' && ctx.random() < CFG.stayChance) rest(ctx, cat, F, s.perch, pick(ctx, PERCHES[s.perch].rest.filter((m) => m !== s.mode)));
    else if (!move(ctx, cat, F, taken)) rest(ctx, cat, F, s.perch);
  }
}
