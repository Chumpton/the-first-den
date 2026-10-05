// The hilltop village's neighbours: ONE manager steps every villager row (tag "village-crowd"). Rigged scripted bodies
// (scripts/gen/villager.js) play anim/villager.yml clips on the "body" channel: walk while moving, the role's pose at
// rest. Roster + tuning in lib/data/village-crowd.yml. E on a villager (pressTo) rings ears.press: the nearest turns
// and says one of their own lines. Scratch lives in ctx.session (this machine's).
import C from './lib/data/village-crowd.yml'
import { play, clips } from 'builtin/anim'
import NPC from './lib/data/npc-models.yml'
const POSE = { idle: null, walk: null, talk: 'cdn/clip-talk-loop.glb', wave: 'cdn/clip-waving-single-hand-loop.glb', sit: 'cdn/clip-sit-loop.glb', sitTalk: 'cdn/clip-sitting-talking-loop.glb', garden: 'cdn/clip-pick-fruit-loop.glb' }
function modelPose(row, key) { // a model body: the gait is humanoid-locomotion's, read off velocity; a pose rides the "sit" channel over it
  const c = POSE[key.replace(/Hold$/, '')] ?? null
  row.anim.sit = c ? { clip: c, loop: /-loop\.glb$/.test(c) ? 'loop' : 'once', weight: 1, blendIn: 0.3 } : null
}
export const updateSchedule = { every: 2 }
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI
const rnd = (ctx, [a, b]) => a + ctx.random() * (b - a)
const groundY = (ctx, x, z) => ctx.place.terrain.heightAt(x, z) ?? 20.5

function seed(ctx, have) {
  for (const e of C.roster) {
    if (have.has(e.id) || ctx.getObject(e.id)) continue
    const [x, z] = e.at, f = e.face ?? [172, 90]
    ctx.spawn({
      id: e.id, tags: ['village-crowd', 'npc', 'interactable'], physics: 'character',
      ...(NPC[e.model]
        ? { model: NPC[e.model].model, layout: { minExtents: { y: NPC[e.model].h }, maxExtents: { y: NPC[e.model].h } }, behavior: ['scripts/humanoid-locomotion.js'] }
        : { primitive: { kind: 'scripted', script: 'scripts/gen/villager.js', params: e.params ?? {} } }),
      feetPosition: { x, y: groundY(ctx, x, z) + 0.05, z }, rotation: { yaw: yawOf(f[0] - x, f[1] - z) }, scale: NPC[e.model] ? 1 : e.scale ?? 1,
      visibleRange: { max: C.visibleRange }, castShadow: true,
      state: { name: e.name, role: e.role, pressTo: ctx.self.id, act: 'Talk', body: NPC[e.model] ? 'model' : 'rig' },
      children: [{ id: 'tag', feetPosition: { x: 0, y: (NPC[e.model]?.h ?? 1.8) + 0.3, z: 0 }, visibleRange: { max: 20 }, text: { content: e.name, color: e.kid ? '#ffd9a8' : '#fff1d6', size: 0.22 } }],
    })
  }
}
function clip(ctx, row, m, name, speed = 1) {
  if (m.clip === name) return
  m.clip = name
  if (row.state.body === 'model') { modelPose(row, name); return }
  play(ctx, row, { name: `villager-${name}`, ...ctx.session.villageClips[name] }, { channel: 'body', loop: true, speed, blendIn: 0.35 })
}
function face(row, m, target, dt) {
  m.yaw ??= target
  m.yaw += wrap(target - m.yaw) * Math.min(1, dt * C.turnRate)
  if (Math.abs(wrap(m.yaw - (m.sent ?? 1e9))) > 2) { m.sent = m.yaw; row.rotation = { yaw: m.yaw } }
}
function stop(row, m) { if (m.moving !== false) { m.moving = false; row.velocity = { x: 0, y: 0, z: 0 } } }
function goTo(ctx, row, m, t, speed, dt) { // true once there
  const p = row.feetPosition, dx = t[0] - p.x, dz = t[1] - p.z, d = Math.hypot(dx, dz)
  if (d < 0.5) { stop(row, m); return true }
  row.velocity = { x: (dx / d) * speed, y: -1, z: (dz / d) * speed }; m.moving = true
  face(row, m, yawOf(dx, dz), dt); clip(ctx, row, m, 'walk', speed / 1.1)
  return false
}
function stroll(ctx, row, m, e, now, dt, restClip) {
  if (m.goal) {
    if (now - (m.chk?.at ?? 0) > C.stuckSecs * 1000) { const p = row.feetPosition; if (m.chk && Math.hypot(p.x - m.chk.x, p.z - m.chk.z) < 0.25) m.goal = null; m.chk = { x: p.x, z: p.z, at: now } }
    if (m.goal && goTo(ctx, row, m, m.goal, m.speed, dt)) { m.goal = null; m.until = now + rnd(ctx, C.restSecs) * 1000 * (e.role === 'stand' ? 3 : 1) }
    return
  }
  stop(row, m); clip(ctx, row, m, restClip)
  if (e.role === 'stand') { const f = e.face ?? [172, 90], p = row.feetPosition; if (Math.hypot(p.x - e.at[0], p.z - e.at[1]) < 1) face(row, m, yawOf(f[0] - p.x, f[1] - p.z), dt) }
  if (now < (m.until ?? 0)) return
  const S = e.spots ?? [e.at]; let g = S[Math.floor(ctx.random() * S.length)]
  if (e.role === 'stand' && ctx.random() < 0.5) g = e.at
  m.goal = g; m.speed = rnd(ctx, e.kid ? C.kidSpeed : C.speed); m.chk = null
}
export function update(ctx, dt) {
  ctx.session.villageClips ??= clips(ctx, 'anim/villager.yml')
  const S = (ctx.session.villageCrowd ??= { m: {}, seedAt: 0 }), now = ctx.now()
  const found = ctx.query({ tags: ['village-crowd'] })
  if (found.length < C.roster.length && now - S.seedAt > 8000) { S.seedAt = now; seed(ctx, new Set(found.map((r) => r.id))); return }
  const byId = {}; for (const r of found) byId[r.id] = r
  for (const e of C.roster) {
    const row = byId[e.id]; if (!row) continue
    const m = (S.m[e.id] ??= {})
    if (now < (m.pressUntil ?? 0)) { stop(row, m); if (e.role !== 'sit') face(row, m, m.pressYaw, dt); clip(ctx, row, m, e.role === 'sit' ? 'sitTalk' : 'talk'); continue }
    if (m.pressUntil) { m.pressUntil = 0; m.clip = null }
    const f = e.face ?? [172, 90], p = row.feetPosition
    if (e.role === 'sit' || e.role === 'garden') {
      if (!m.home && !goTo(ctx, row, m, e.at, 1.1, dt)) continue
      m.home = true; stop(row, m); face(row, m, yawOf(f[0] - p.x, f[1] - p.z), dt)
      if (e.role === 'garden' && now > (m.idleAt ?? 0)) { m.idleAt = now + rnd(ctx, [6, 14]) * 1000; m.stand = !m.stand && ctx.random() < 0.3 }
      clip(ctx, row, m, e.role === 'sit' ? 'sit' : m.stand ? 'idle' : 'garden')
      continue
    }
    stroll(ctx, row, m, e, now, dt, 'idle')
  }
}
export const ears = {
  press: (ctx, payload) => {
    const by = payload?.by, who = by && ctx.getObject(by.id ?? by); if (!who) return
    const q = who.feetPosition
    let best = null, bd = C.reach
    for (const r of ctx.query({ tags: ['village-crowd'], center: q, radius: C.reach + 1 })) { const d = Math.hypot(r.feetPosition.x - q.x, r.feetPosition.z - q.z); if (d < bd) { bd = d; best = r } }
    if (!best) return
    const e = C.roster.find((x) => x.id === best.id); if (!e) return
    const S = (ctx.session.villageCrowd ??= { m: {}, seedAt: 0 }), m = (S.m[e.id] ??= {}), p = best.feetPosition
    m.pressUntil = ctx.now() + C.pressSecs * 1000; m.pressYaw = yawOf(q.x - p.x, q.z - p.z); m.goal = null
    let i = Math.floor(ctx.random() * e.lines.length); if (i === m.last) i = (i + 1) % e.lines.length; m.last = i
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + (NPC[e.model] ? NPC[e.model].h + 0.5 : 2.3 * (e.scale ?? 1)), z: p.z }, text: `${e.name}: ${e.lines[i]}`, color: '#ffe2a0', lifetime: 4.5, size: 0.55 })
  },
}
