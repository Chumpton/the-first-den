// The town square's crowd: ONE manager steps every townsperson row (tag "town-crowd", behavior humanoid-locomotion only).
// Roles from lib/data/town-crowd.yml: walk (errands between goals, detouring round the fountain), tag (kids circling the
// fountain; "it" chases, a touch swaps), chat (pairs/threes facing their group's centre), sit (fountain rim), vendor, busker.
// Poses ride the body's "sit" channel so the locomotion script stands its gait down while they play; walking and
// running are its gait, read off the velocity this manager writes. Scratch lives in ctx.session (this machine's).
import C from './lib/data/town-crowd.yml'
export const updateSchedule = { every: 2 }
const TAU = Math.PI * 2
const wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180
const yawOf = (dx, dz) => (Math.atan2(-dx, -dz) * 180) / Math.PI
const rnd = (ctx, [a, b]) => a + ctx.random() * (b - a)
const pick = (ctx, arr) => arr[Math.floor(ctx.random() * arr.length)]
const F = C.fountain

function home(e) {
  if (e.role === 'tag') { const a = (e.angle * Math.PI) / 180; return [F.x + Math.cos(a) * C.tag.r, F.z + Math.sin(a) * C.tag.r] }
  if (e.role === 'sit') { const a = (e.angle * Math.PI) / 180; return [F.x + Math.cos(a) * F.sitR, F.z + Math.sin(a) * F.sitR] }
  if (e.role === 'chat') { const g = C.groups[e.group], a = (e.slot * Math.PI) / 180; return [g.at[0] + Math.cos(a) * g.r, g.at[1] + Math.sin(a) * g.r] }
  return e.at
}
function homeYaw(e, h) {
  if (e.role === 'sit') return yawOf(F.x - h[0], F.z - h[1]) + 180 // back to the water
  if (e.role === 'chat') { const g = C.groups[e.group]; return yawOf(g.at[0] - h[0], g.at[1] - h[1]) }
  if (e.face) return yawOf(e.face[0] - h[0], e.face[1] - h[1])
  return yawOf(F.x - h[0], F.z - h[1])
}
function seed(ctx, have) {
  for (const e of C.roster) {
    if (have.has(e.id) || ctx.getObject(e.id)) continue
    const M = C.models[e.model], h = home(e), y = (ctx.place.terrain.heightAt(h[0], h[1]) ?? 0.5) + 0.25
    const spec = {
      id: e.id, tags: ['town-crowd', 'npc', 'interactable'], behavior: ['scripts/humanoid-locomotion.js'],
      feetPosition: { x: h[0], y, z: h[1] }, rotation: { yaw: homeYaw(e, h) }, scale: e.scale ?? 1,
      physics: 'character', model: M.model, visibleRange: { max: C.visibleRange },
      state: { name: e.name ?? null, role: e.role, kid: !!e.kid, turnTo: 'none', pressTo: 'town-crowd' },
    }
    if (M.layout) spec.layout = M.layout
    if (e.audio) spec.audio = C.audio[e.audio]
    if (e.name) spec.children = [{ id: 'tag', feetPosition: { x: 0, y: 2.15, z: 0 }, text: { content: e.name, color: e.kid ? '#ffd9a8' : '#fff1d6', size: 0.22 } }]
    ctx.spawn(spec)
  }
}

// ---- body helpers ------------------------------------------------------------------------------------------------
function face(row, m, target, dt) {
  m.yaw ??= target
  m.yaw += wrap(target - m.yaw) * Math.min(1, dt * C.turnRate)
  if (Math.abs(wrap(m.yaw - (m.sent ?? 1e9))) > 2) { m.sent = m.yaw; row.rotation = { yaw: m.yaw } }
}
function stop(row, m) {
  if (m.moving !== false) { m.moving = false; row.velocity = { x: 0, y: row.velocity?.y ?? 0, z: 0 } }
}
function move(row, m, dx, dz, speed, dt) {
  const d = Math.hypot(dx, dz) || 1, vx = (dx / d) * speed, vz = (dz / d) * speed
  row.velocity = { x: vx, y: row.velocity?.y ?? 0, z: vz }
  m.moving = true
  face(row, m, yawOf(vx, vz), dt)
}
function pose(row, m, clip) {
  clip = clip ?? null
  if (m.clip === clip) return
  m.clip = clip
  row.anim.sit = clip ? { clip, loop: /-loop\.glb$/.test(clip) ? 'loop' : 'once', weight: 1, blendIn: 0.3 } : null
}
// walk to a spot, then hold its heading; true once there
function settle(ctx, row, m, spot, yaw, dt) {
  const p = row.feetPosition, dx = spot[0] - p.x, dz = spot[1] - p.z
  if (Math.hypot(dx, dz) > 0.45 && !m.settled) { pose(row, m, null); move(row, m, dx, dz, 1.3, dt); return false }
  m.settled = true
  stop(row, m); face(row, m, yaw, dt)
  return true
}
function cycle(ctx, row, m, R, now) {
  if (now < (m.next ?? 0)) return
  m.next = now + rnd(ctx, R.secs) * 1000
  pose(row, m, pick(ctx, R.clips))
}

// ---- walkers -----------------------------------------------------------------------------------------------------
function blocked(x, z) {
  if (Math.hypot(x - F.x, z - F.z) < C.walk.clearR) return true
  for (const s of C.stalls) if (Math.abs(x - s.x) < s.w / 2 + 1 && Math.abs(z - s.z) < s.d / 2 + 1) return true
  for (const g of Object.values(C.groups)) if (Math.hypot(x - g.at[0], z - g.at[1]) < C.walk.spotClear) return true
  for (const e of C.roster) if (e.role === 'busker' || e.role === 'vendor') if (Math.hypot(x - e.at[0], z - e.at[1]) < C.walk.spotClear) return true
  return false
}
function planWalk(ctx, row, m, e) {
  const B = C.bounds, p = row.feetPosition
  let gx = 0, gz = 100
  for (let i = 0; i < 16; i++) { gx = B.x0 + ctx.random() * (B.x1 - B.x0); gz = B.z0 + ctx.random() * (B.z1 - B.z0); if (!blocked(gx, gz) && Math.hypot(gx - p.x, gz - p.z) > 6) break }
  // round the fountain: the segment's closest point to its centre, pushed out past avoidR
  const sx = gx - p.x, sz = gz - p.z, L2 = sx * sx + sz * sz || 1
  const t = Math.max(0, Math.min(1, ((F.x - p.x) * sx + (F.z - p.z) * sz) / L2))
  const cx = p.x + sx * t - F.x, cz = p.z + sz * t - F.z, cd = Math.hypot(cx, cz)
  m.route = [[gx, gz]]
  if (cd < F.avoidR) {
    let nx = cx, nz = cz
    if (cd < 0.3) { nx = -sz; nz = sx }
    const n = Math.hypot(nx, nz) || 1, R = F.avoidR + 1.5
    m.route.unshift([F.x + (nx / n) * R, F.z + (nz / n) * R])
  }
  m.speed = e.kid && ctx.random() < C.walk.kidRunChance ? C.walk.kidRun : rnd(ctx, e.kid ? C.walk.kidSpeed : C.walk.speed)
  m.phase = 'go'; m.chk = { x: p.x, z: p.z, at: ctx.now() }
}
function stepWalk(ctx, row, m, e, now, dt) {
  if (m.phase === 'rest') {
    stop(row, m)
    if (m.gestEnd && now >= m.gestEnd) { m.gestEnd = 0; pose(row, m, null) }
    if (now < m.until) return
    pose(row, m, null); m.gestEnd = 0
    return planWalk(ctx, row, m, e)
  }
  if (!m.route?.length) return planWalk(ctx, row, m, e)
  pose(row, m, null)
  const p = row.feetPosition
  let t = m.route[0], dx = t[0] - p.x, dz = t[1] - p.z
  if (Math.hypot(dx, dz) < 0.6) {
    m.route.shift()
    if (!m.route.length) {
      m.phase = 'rest'; m.until = now + rnd(ctx, C.walk.restSecs) * 1000; stop(row, m)
      if (ctx.random() < C.walk.gestureChance) { pose(row, m, pick(ctx, C.walk.gestures)); m.gestEnd = now + C.walk.gestureSecs * 1000 }
      return
    }
    t = m.route[0]; dx = t[0] - p.x; dz = t[1] - p.z
  }
  if (now - m.chk.at > C.walk.stuckSecs * 1000) {
    if (Math.hypot(p.x - m.chk.x, p.z - m.chk.z) < 0.3) return planWalk(ctx, row, m, e)
    m.chk = { x: p.x, z: p.z, at: now }
  }
  move(row, m, dx, dz, m.speed, dt)
}

// ---- tag -----------------------------------------------------------------------------------------------------------
function stepTag(ctx, rows, S, now, dt) {
  const T = C.tag, st = ctx.self.state, kids = rows.filter((r) => r.e.role === 'tag')
  if (!kids.length) return
  if (!kids.some((k) => k.row.id === st.tagIt)) st.tagIt = kids[0].row.id
  const dir = st.tagDir ?? 1
  const it = kids.find((k) => k.row.id === st.tagIt)
  for (const k of kids) {
    const { row, m } = k, p = row.feetPosition
    if (now < (m.pressUntil ?? 0)) continue
    pose(row, m, null)
    const ax = p.x - F.x, az = p.z - F.z, ang = Math.atan2(az, ax)
    if (k === it) {
      if (now < (st.tagFreezeUntil ?? 0)) { stop(row, m); face(row, m, yawOf(-ax, -az), dt); continue }
      let prey = null, best = 1e9
      for (const o of kids) if (o !== k) { const d = Math.hypot(o.row.feetPosition.x - p.x, o.row.feetPosition.z - p.z); if (d < best) { best = d; prey = o } }
      if (prey && best < T.tagDist) {
        st.tagIt = prey.row.id; st.tagFreezeUntil = now + T.freezeSecs * 1000
        if (ctx.random() < T.flipChance) st.tagDir = -dir
        const q = prey.row.feetPosition
        ctx.emit('damageNumber', { position: { x: q.x, y: q.y + 1.6, z: q.z }, text: T.cry, color: '#ffd27a', lifetime: 1.8, size: 0.5 })
        continue
      }
      if (prey && best < T.directDist) { const q = prey.row.feetPosition; move(row, m, q.x - p.x, q.z - p.z, T.chase, dt); continue }
      const a2 = ang + dir * T.lead
      move(row, m, F.x + Math.cos(a2) * T.r - p.x, F.z + Math.sin(a2) * T.r - p.z, T.chase, dt)
    } else {
      const ip = it.row.feetPosition, near = Math.hypot(ip.x - p.x, ip.z - p.z) < T.fleeDist
      const r = T.r + Math.sin(now / 900 + (m.ph ??= ctx.random() * TAU)) * T.wobble + (near ? T.wobble : 0)
      const a2 = ang + dir * T.lead
      move(row, m, F.x + Math.cos(a2) * r - p.x, F.z + Math.sin(a2) * r - p.z, near ? T.flee : T.run, dt)
    }
  }
}

// ---- the tick ------------------------------------------------------------------------------------------------------
export function update(ctx, dt) {
  const S = (ctx.session.townCrowd ??= { m: {}, seedAt: 0 })
  const now = ctx.now()
  const found = ctx.query({ tags: ['town-crowd'] })
  const byId = {}; for (const r of found) byId[r.id] = r
  if (found.length < C.roster.length && now - S.seedAt > 8000) { S.seedAt = now; seed(ctx, new Set(found.map((r) => r.id))); return }
  const rows = []
  for (const e of C.roster) { const row = byId[e.id]; if (row) rows.push({ e, row, m: (S.m[e.id] ??= {}) }) }
  stepTag(ctx, rows, S, now, dt)
  for (const { e, row, m } of rows) {
    if (now < (m.pressUntil ?? 0)) { // answering a press: stand, turn to them, talk
      stop(row, m)
      if (e.role !== 'sit') face(row, m, m.pressYaw, dt)
      pose(row, m, e.role === 'sit' ? 'cdn/clip-sitting-talking-loop.glb' : 'cdn/clip-talk-loop.glb')
      m.next = 0
      continue
    }
    if (m.pressUntil) { m.pressUntil = 0; pose(row, m, null); m.settled = false }
    const h = home(e)
    switch (e.role) {
      case 'walk': stepWalk(ctx, row, m, e, now, dt); break
      case 'chat': if (settle(ctx, row, m, h, homeYaw(e, h), dt)) cycle(ctx, row, m, C.chat, now); break
      case 'sit': if (settle(ctx, row, m, h, homeYaw(e, h), dt)) cycle(ctx, row, m, C.sit, now); break
      case 'busker': if (settle(ctx, row, m, h, homeYaw(e, h), dt)) cycle(ctx, row, m, C.busker, now); break
      case 'vendor':
        if (settle(ctx, row, m, h, homeYaw(e, h), dt)) {
          cycle(ctx, row, m, C.vendor, now)
          if (now > (m.callAt ?? 0)) for (const pl of ctx.place.players) {
            const q = pl.feetPosition; if (!q || Math.hypot(q.x - h[0], q.z - h[1]) > C.vendor.callRange) continue
            m.callAt = now + C.vendor.callEverySecs * 1000
            const p = row.feetPosition
            ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.3, z: p.z }, text: `${e.name ?? 'Vendor'}: ${pick(ctx, C.vendor.calls)}`, color: '#ffe2a0', lifetime: 3.5, size: 0.6 })
            pose(row, m, 'cdn/clip-waving-single-hand-loop.glb'); m.next = now + 2500
            break
          }
        }
        break
    }
  }
}

// E on a townsperson: their pressTo sends it here; the one nearest the presser answers with a line
export const ears = {
  press: (ctx, payload) => {
    const by = payload?.by, who = by && ctx.getObject(by.id ?? by); if (!who) return
    const q = who.feetPosition
    let best = null, bd = C.reach
    for (const r of ctx.query({ tags: ['town-crowd'], center: q, radius: C.reach + 1 })) {
      const d = Math.hypot(r.feetPosition.x - q.x, r.feetPosition.z - q.z); if (d < bd) { bd = d; best = r }
    }
    if (!best) return
    const e = C.roster.find((x) => x.id === best.id); if (!e) return
    const S = (ctx.session.townCrowd ??= { m: {}, seedAt: 0 }), m = (S.m[e.id] ??= {}), now = ctx.now(), p = best.feetPosition
    m.pressUntil = now + C.pressSecs * 1000
    m.pressYaw = yawOf(q.x - p.x, q.z - p.z)
    const pool = e.kid && ctx.random() < 0.5 ? C.kidLines : C.lines
    let i = Math.floor(ctx.random() * pool.length); if (pool[i] === m.lastLine) i = (i + 1) % pool.length
    m.lastLine = pool[i]
    const h = 2.3 * (e.scale ?? 1)
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + h, z: p.z }, text: e.name ? `${e.name}: ${pool[i]}` : pool[i], color: '#ffe2a0', lifetime: 4, size: 0.6 })
  },
}
