// Rikki or Campton (state.who): tea and drawing at the ground-floor table, then an outing of chores, then back.
// Phases in state: sit (seated, physics off) → go (walking a findPath route) → work (a chore clip) → … → home → sit.
// Poses ride the "sit" channel so scripts/humanoid-locomotion.js stands its gait down while they play; walking is its gait.
import { findPath } from 'builtin/nav'
import FOLK from './lib/data/den-folk.js'
const Y = 0.9 // the ground floor
const yawTo = (f, t) => Math.atan2(-(t[0] - f.x), -(t[1] - f.z)) * 180 / Math.PI
const rnd = (ctx, [a, b]) => a + ctx.random() * (b - a)
function me(ctx) { return FOLK.folk[ctx.self.state.who] }
function mem(ctx) { const m = (ctx.session.denFolk ??= {}); return (m[ctx.self.id] ??= {}) }

export function onSpawn(ctx) {
  ctx.on('press', (ctx, { by }) => {
    const s = ctx.self.state, F = me(ctx), p = ctx.self.feetPosition
    s.said = ((s.said ?? -1) + 1) % F.lines.length
    const who = by && ctx.getObject(by.id ?? by)
    if (who && s.phase !== 'sit') { ctx.self.rotation = { yaw: yawTo(p, [who.feetPosition.x, who.feetPosition.z]) }; if (s.phase === 'go') s.pauseUntil = ctx.now() + 3000 }
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.3, z: p.z }, text: `${s.name}: ${F.lines[s.said]}`, color: '#ffe2a0', lifetime: 4, size: 0.7 })
  })
  if (!ctx.self.state.phase) sitDown(ctx)
}

function sitDown(ctx) {
  const s = ctx.self.state, F = me(ctx)
  ctx.self.physics = 'none'
  ctx.self.velocity = { x: 0, y: 0, z: 0 }
  ctx.self.feetPosition = { x: F.seat[0], y: Y, z: F.seat[1] }
  ctx.self.rotation = { yaw: yawTo({ x: F.seat[0], z: F.seat[1] }, F.face) }
  s.phase = 'sit'; s.until = ctx.now() + rnd(ctx, FOLK.teaSecs) * 1000
  s.task = 'tea'
  pose(ctx, F.sit[Math.floor(ctx.random() * F.sit.length)])
  s.swapAt = ctx.now() + rnd(ctx, FOLK.sitSwapSecs) * 1000
}
function pose(ctx, clip) { ctx.self.anim.sit = clip ? { clip, loop: 'loop', weight: 1, blendIn: 0.35 } : null }

function planOuting(ctx) {
  const F = me(ctx), n = Math.round(rnd(ctx, FOLK.choresPerOuting)), pool = F.chores.map((c, i) => i)
  const pick = []
  if (F.mustOutside && ctx.random() < 0.65) { const out = pool.filter((i) => F.chores[i].outside); pick.push(out[Math.floor(ctx.random() * out.length)]) }
  while (pick.length < n) { const i = pool[Math.floor(ctx.random() * pool.length)]; if (!pick.includes(i)) pick.push(i) }
  // indoor chores first, the garden last, so the walk out is one trip
  pick.sort((a, b) => (F.chores[a].outside ? 1 : 0) - (F.chores[b].outside ? 1 : 0))
  return pick
}
function standUp(ctx) {
  const s = ctx.self.state, F = me(ctx)
  pose(ctx, null)
  ctx.self.feetPosition = { x: F.standBy[0], y: Y, z: F.standBy[1] }
  ctx.self.physics = 'character'
  s.plan = planOuting(ctx); s.step = 0
  goTo(ctx, F.chores[s.plan[0]].at, F.chores[s.plan[0]].label)
}
function goTo(ctx, at, label) {
  const s = ctx.self.state
  s.phase = 'go'; s.target = at; s.task = label
  const m = mem(ctx); m.path = null; m.stuck = 0
}
function route(ctx, at) {
  const m = mem(ctx), f = ctx.self.feetPosition
  if (m.path && m.for === at.join()) return m.path
  const r = findPath(ctx, f, { x: at[0], y: f.y, z: at[1] }, {})
  if (r?.partial) return null // ground still loading, ask next tick
  m.path = r?.points?.length ? r.points.map((p) => [p.x, p.z]) : [at]
  m.for = at.join(); m.i = 0
  return m.path
}

export function update(ctx, dt) {
  const s = ctx.self.state, F = me(ctx); if (!F) return
  const now = ctx.now()
  if (s.phase === 'sit') {
    if (now >= s.until) return standUp(ctx)
    if (now >= (s.swapAt ?? 0)) { pose(ctx, F.sit[Math.floor(ctx.random() * F.sit.length)]); s.swapAt = now + rnd(ctx, FOLK.sitSwapSecs) * 1000 }
    return ctx.sleep(Math.max(0.5, Math.min(s.until, s.swapAt) - now) / 1000)
  }
  if (s.phase === 'work') {
    if (now < s.until) return ctx.sleep((s.until - now) / 1000)
    pose(ctx, null)
    s.step = (s.step ?? 0) + 1
    if (s.step < (s.plan?.length ?? 0)) { const c = F.chores[s.plan[s.step]]; return goTo(ctx, c.at, c.label) }
    s.phase = 'home'; return goTo(ctx, F.standBy, 'back to tea'), (s.phase = 'go', s.homeBound = true)
  }
  if (s.phase === 'go') {
    if (now < (s.pauseUntil ?? 0)) { ctx.self.velocity = { x: 0, y: ctx.self.velocity.y, z: 0 }; return }
    const path = route(ctx, s.target); if (!path) return
    const m = mem(ctx), f = ctx.self.feetPosition
    let t = path[m.i] ?? s.target, dx = t[0] - f.x, dz = t[1] - f.z, d = Math.hypot(dx, dz)
    while (d < 0.35 && m.i < path.length - 1) { m.i++; t = path[m.i]; dx = t[0] - f.x; dz = t[1] - f.z; d = Math.hypot(dx, dz) }
    const last = m.i >= path.length - 1
    // stuck guard: no progress for 4 s → hop to the next point
    m.best = Math.min(m.best ?? 1e9, d); m.stuck = d < m.best + 0.01 && d >= m.best - 0.01 ? (m.stuck ?? 0) + dt : 0
    if (d < m.best - 0.05) { m.best = d; m.stuck = 0 }
    if (m.stuck > 4) { ctx.self.feetPosition = { x: t[0], y: f.y + 0.1, z: t[1] }; m.stuck = 0; m.best = 1e9; if (!last) m.i++ ; return }
    if (last && d < 0.3) {
      ctx.self.velocity = { x: 0, y: 0, z: 0 }; m.best = 1e9
      if (s.homeBound) { s.homeBound = false; return sitDown(ctx) }
      const c = F.chores[s.plan[s.step]]
      ctx.self.rotation = { yaw: yawTo(f, c.face) }
      s.phase = 'work'; s.until = now + rnd(ctx, FOLK.workSecs) * 1000
      return pose(ctx, c.clip)
    }
    const v = FOLK.walk
    ctx.self.velocity = { x: dx / d * v, y: ctx.self.velocity.y, z: dz / d * v }
    ctx.self.rotation = { yaw: Math.atan2(-dx, -dz) * 180 / Math.PI }
  }
}
