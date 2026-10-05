// The districts' folk: ONE manager (row "folk-crowd") seeds and steps the 20 authored characters of scripts/gen/folk.js.
// Each walks errands inside its district (market box minus fountain/stalls, or a disc round a district centre), rests
// idling or gesturing, and on E turns to the presser, waves, then talks with a floating line. Numbers: lib/data/folk.yml.
// Districts nobody is near stand still and the manager sleeps. Walk scratch lives in ctx.session (this machine's).
import { play } from 'builtin/anim'
import { clips } from 'builtin/anim'
import F from './lib/data/folk.yml'
import { heightOf as rigHeight } from './gen/folk.js'
import NPC from './lib/data/npc-models.yml'
const POSE = { idle: null, walk: null, talk: 'cdn/clip-talk-loop.glb', wave: 'cdn/clip-waving-single-hand-loop.glb', sit: 'cdn/clip-sit-loop.glb', sitTalk: 'cdn/clip-sitting-talking-loop.glb', garden: 'cdn/clip-pick-fruit-loop.glb' }
function modelPose(row, key) { // a model body: the gait is humanoid-locomotion's, read off velocity; a pose rides the "sit" channel over it
  const c = POSE[key.replace(/Hold$/, '')] ?? null
  row.anim.sit = c ? { clip: c, loop: /-loop\.glb$/.test(c) ? 'loop' : 'once', weight: 1, blendIn: 0.3 } : null
}
export const updateSchedule = { every: 3 }
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI
const rnd = (ctx, [a, b]) => a + ctx.random() * (b - a)
const HOLD = new Set(F.hold)
const byWho = Object.fromEntries(F.roster.map((e) => [e.who, e]))
const heightOf = (who) => NPC[byWho[who]?.model]?.h ?? rigHeight(who)
let CL = null

function groundY(ctx, x, z) { return ctx.place.terrain.heightAt(x, z) ?? 0.5 }
function blocked(ctx, D, x, z) {
  if (D.box) {
    const [x0, x1, z0, z1] = D.box; if (x < x0 || x > x1 || z < z0 || z > z1) return true
    const A = F.avoid[D.avoid]; if (!A) return false
    if (Math.hypot(x - A.circle[0], z - A.circle[1]) < A.circle[2]) return true
    for (const [cx, cz, w, d] of A.rects) if (Math.abs(x - cx) < w / 2 && Math.abs(z - cz) < d / 2) return true
    return false
  }
  if (Math.hypot(x - D.at[0], z - D.at[1]) > D.r) return true
  return groundY(ctx, x, z) < 0.25 // water
}
function pickGoal(ctx, D, from) {
  for (let t = 0; t < 12; t++) {
    let x, z
    if (D.box) { x = rnd(ctx, [D.box[0], D.box[1]]); z = rnd(ctx, [D.box[2], D.box[3]]) }
    else { const a = ctx.random() * Math.PI * 2, r = Math.sqrt(ctx.random()) * D.r; x = D.at[0] + Math.cos(a) * r; z = D.at[1] + Math.sin(a) * r }
    if (blocked(ctx, D, x, z)) continue
    let ok = true
    for (let k = 1; k < 8 && ok; k++) { const f = k / 8; if (blocked(ctx, D, from.x + (x - from.x) * f, from.z + (z - from.z) * f)) ok = false }
    if (ok) return [x, z]
  }
  return null
}
function clip(ctx, row, e, name) {
  const N = NPC[e.model], key = name + (!N && HOLD.has(e.who) ? 'Hold' : '')
  if (row.state.clip === key) return
  if (N) { modelPose(row, key); row.state.clip = key; return }
  CL ??= clips(ctx, F.clips)
  if (!CL[key]) return
  play(ctx, row, CL[key], { loop: true, channel: 'body', blendIn: 0.25 })
  row.state.clip = key
}
function face(row, m, target, dt) {
  const cur = m.yaw ?? row.rotation?.yaw ?? 0, d = wrap(target - cur)
  if (Math.abs(d) < 1) return
  m.yaw = cur + d * Math.min(1, F.turnRate * dt); row.rotation = { yaw: m.yaw }
}
function homeYaw(ctx, e) {
  const [x, z] = e.at
  if (e.faceAway) return yawOf(x - e.faceAway[0], z - e.faceAway[1])
  if (e.faceWater) { // the lowest ground in a ring round the dock is the lake
    let best = 0, lo = 1e9
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, h = groundY(ctx, x + Math.cos(a) * 8, z + Math.sin(a) * 8); if (h < lo) { lo = h; best = a } }
    return yawOf(Math.cos(best), Math.sin(best))
  }
  const D = F.districts[e.district]; const c = D?.at ?? [0, 100]
  return yawOf(c[0] - x, c[1] - z)
}
function seed(ctx) {
  for (const e of F.roster) {
    if (ctx.getObject(e.id)) continue
    const [x, z] = e.at, y = e.district === 'dock' ? e.y : groundY(ctx, x, z) + (e.y ?? 0) + F.spawnLift
    ctx.spawn({
      id: e.id, tags: ['folk', 'npc', 'interactable'], feetPosition: { x, y, z }, rotation: { yaw: homeYaw(ctx, e) },
      physics: 'character', ...(NPC[e.model]
        ? { model: NPC[e.model].model, layout: { minExtents: { y: NPC[e.model].h }, maxExtents: { y: NPC[e.model].h } }, behavior: ['scripts/humanoid-locomotion.js'] }
        : { primitive: { kind: 'scripted', script: 'scripts/gen/folk.js', params: { who: e.who } } }),
      visibleRange: { max: F.visibleRange },
      state: { name: e.name, who: e.who, district: e.district, pressTo: 'folk-crowd' },
      children: [{ id: 'tag', feetPosition: { x: 0, y: heightOf(e.who) + F.nameLift, z: 0 }, visibleRange: { max: F.visibleRange * 0.4 }, text: { content: e.name, color: '#fff1d6', size: F.nameSize } }],
    })
  }
}
export function update(ctx, dt) {
  const S = (ctx.session.folk ??= { m: {}, seeded: false }), now = ctx.now()
  if (!S.seeded || now - (S.seedAt ?? 0) > 10000) { S.seedAt = now; if (!S.seeded || F.roster.some((e) => !ctx.getObject(e.id))) seed(ctx); S.seeded = true }
  const players = ctx.place.players
  const awake = {}
  let any = false
  for (const [k, D] of Object.entries({ ...F.districts, fountain: { at: [0, 100] }, dock: { at: [4.3, -60] } })) {
    const c = D.at ?? [(D.box[0] + D.box[1]) / 2, (D.box[2] + D.box[3]) / 2]
    awake[k] = players.some((p) => Math.hypot(p.feetPosition.x - c[0], p.feetPosition.z - c[1]) < F.wakeRadius)
    any ||= awake[k]
  }
  for (const e of F.roster) {
    const row = ctx.getObject(e.id); if (!row) continue
    const m = (S.m[e.id] ??= { restUntil: now + rnd(ctx, F.restSecs) * 1000 })
    if (!awake[e.district]) { if (m.goal) { row.velocity = { x: 0, y: row.velocity?.y ?? 0, z: 0 }; m.goal = null } continue }
    const p = row.feetPosition, vy = row.velocity?.y ?? 0
    if (now < (m.pressUntil ?? 0)) { // answering: stand, face them, wave then talk
      row.velocity = { x: 0, y: vy, z: 0 }; face(row, m, m.pressYaw, dt)
      clip(ctx, row, e, now < m.waveUntil ? 'wave' : 'talk'); continue
    }
    const D = F.districts[e.district]
    if (!D) { if (m.pressUntil) { m.pressUntil = 0; row.rotation = { yaw: m.yaw = homeYaw(ctx, e) } } clip(ctx, row, e, 'idle'); continue } // fixed spots: bard, fisher
    if (!m.goal) {
      clip(ctx, row, e, m.gesture ? 'talk' : 'idle'); row.velocity = { x: 0, y: vy, z: 0 }
      if (now < m.restUntil) continue
      m.goal = pickGoal(ctx, D, p); m.speed = rnd(ctx, F.speed); m.chk = { x: p.x, z: p.z, at: now }
      if (!m.goal) { m.restUntil = now + 2000; continue }
    }
    const dx = m.goal[0] - p.x, dz = m.goal[1] - p.z, d = Math.hypot(dx, dz)
    const stuck = now - m.chk.at > F.stuckSecs * 1000
    if (stuck) { const moved = Math.hypot(p.x - m.chk.x, p.z - m.chk.z); m.chk = { x: p.x, z: p.z, at: now }; if (moved < F.stuckDist) m.goal = null }
    if (d < 0.6 || !m.goal) {
      m.goal = null; m.restUntil = now + rnd(ctx, F.restSecs) * 1000; m.gesture = ctx.random() < F.talkChance
      row.velocity = { x: 0, y: vy, z: 0 }; continue
    }
    row.velocity = { x: (dx / d) * m.speed, y: vy, z: (dz / d) * m.speed }
    face(row, m, yawOf(dx, dz), dt); clip(ctx, row, e, 'walk')
  }
  if (!any) ctx.sleep(3)
}
export const ears = {
  press: (ctx, payload) => {
    const by = payload?.by, who = by && ctx.getObject(by.id ?? by); if (!who) return
    const q = who.feetPosition
    let best = null, bd = F.reach
    for (const r of ctx.query({ tags: ['folk'], center: q, radius: F.reach + 1 })) {
      const d = Math.hypot(r.feetPosition.x - q.x, r.feetPosition.z - q.z); if (d < bd) { bd = d; best = r }
    }
    if (!best) return
    const e = F.roster.find((x) => x.id === best.id); if (!e) return
    const S = (ctx.session.folk ??= { m: {}, seeded: false }), m = (S.m[e.id] ??= {}), now = ctx.now(), p = best.feetPosition
    m.pressUntil = now + F.pressSecs * 1000; m.waveUntil = now + F.waveSecs * 1000
    m.pressYaw = yawOf(q.x - p.x, q.z - p.z); m.goal = null; m.restUntil = m.pressUntil + 1500
    const pool = F.lines[e.who] ?? ['Good day!']
    let i = Math.floor(ctx.random() * pool.length); if (pool[i] === m.lastLine) i = (i + 1) % pool.length
    m.lastLine = pool[i]
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + heightOf(e.who) + 0.5, z: p.z }, text: `${e.name}: ${pool[i]}`, color: '#ffe2a0', lifetime: 4, size: 0.6 })
  },
}
