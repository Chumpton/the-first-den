// wunix plays as a red fox: the body wears scripts/gen/animal-fox.js and this script turns it to its travel,
// picks idle / trot / gallop / leap from how it moves (anim/fox.yml), and lights a foxfire wisp when it flies.
import { play, clips } from 'builtin/anim'

const FOX = 'scripts/gen/animal-fox.js'
let foxClips = null
const isWunix = (self) => self.displayName === 'wunix' || self.name === 'wunix' || self.state?.displayName === 'wunix'

function dress(ctx) {
  if (ctx.self.model) ctx.self.model = null
  if (ctx.self.primitive?.script !== FOX) ctx.self.primitive = { kind: 'scripted', params: {}, script: FOX }
  for (const ch of ['idle', 'walk', 'run', 'spell', 'sit']) if (ctx.self.anim?.[ch]) ctx.self.anim[ch] = null
}

export function onSpawn(ctx) {
  if (!isWunix(ctx.self)) return
  dress(ctx)
  ctx.self.material = null
  ctx.self.castShadow = true
}

export function update(ctx, dt) {
  if (!isWunix(ctx.self)) return
  dress(ctx)
  const p = ctx.self.feetPosition
  if (!p) return
  const s = ctx.self.state ?? {}
  const now = ctx.now()
  const mem = (ctx.session.foxState ??= { x: p.x, z: p.z, speed: 0, yaw: null, clip: '', rate: 1, idleT: 0, phase: 0, yipAt: 0 })

  // speed from what the body actually travelled, eased so one stuttered frame never flips the gait
  const step = Math.max(dt, 1 / 120)
  const dx = p.x - mem.x, dz = p.z - mem.z, moved = Math.hypot(dx, dz)
  mem.x = p.x; mem.z = p.z
  const raw = moved > 3 ? 0 : moved / step // a teleport is no sprint
  mem.speed += (raw - mem.speed) * Math.min(1, step * 8)

  // turn toward travel, rate-limited (nose is -Z)
  if (moved > 0.01 && moved < 3) {
    const want = Math.atan2(-dx, -dz) * 180 / Math.PI
    if (mem.yaw == null) mem.yaw = want
    const diff = ((want - mem.yaw + 540) % 360) - 180
    mem.yaw += Math.sign(diff) * Math.min(Math.abs(diff), 540 * step)
    ctx.self.rotation = { yaw: mem.yaw }
  }

  const ground = ctx.place?.terrain?.heightAt ? ctx.place.terrain.heightAt(p.x, p.z) : null
  const above = ground != null ? p.y - ground : 0
  const flying = !!s.flying
  const airborne = flying || (ctx.self.grounded === false && above > 0.35)

  // foxfire when flying
  if (flying && !ctx.self.wisp) {
    ctx.self.wisp = { color: '#ff6622', shape: 'slender', burnStyle: 'pulse', size: 0.5 }
    ctx.self.light = { kind: 'point', color: '#ffaa44', intensity: 2.2, distance: 6 }
  } else if (!flying && ctx.self.wisp) { ctx.self.wisp = null; ctx.self.light = null }

  const c = (foxClips ??= clips(ctx, 'anim/fox.yml'))
  if (!c) return
  let want = 'idle', rate = 1
  if (airborne) { want = flying && mem.speed > 1 ? 'gallop' : 'leap'; rate = flying ? 0.7 : 1 }
  else if (mem.speed > 4.2) { want = 'gallop'; rate = Math.min(1.6, Math.max(0.85, mem.speed / 7)) }
  else if (mem.speed > 1.6) { want = 'trot'; rate = Math.min(1.5, Math.max(0.8, mem.speed / 3)) }
  else if (mem.speed > 0.3) { want = 'walk'; rate = Math.min(1.6, Math.max(0.7, mem.speed / 1.2)) }
  else {
    mem.idleT += step
    if (mem.idleT > 6) {
      mem.idleT = 0; mem.phase = (mem.phase + 1) % 4
      if (mem.phase === 1 && now - mem.yipAt > 15000) {
        mem.yipAt = now
        ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-cute-fox-happy-chirp-yip.mp3', position: p, volume: 0.35 })
      }
    }
    want = mem.phase === 2 ? 'sniff' : mem.phase === 3 ? 'alert' : 'idle'
  }
  if (want !== 'idle' && want !== 'sniff' && want !== 'alert') mem.idleT = 0

  if (mem.clip !== want || Math.abs(mem.rate - rate) > 0.2) {
    const clip = c[want]
    if (clip) {
      play(ctx, ctx.self, clip, { channel: 'body', loop: true, speed: rate, blendIn: 0.18 })
      mem.clip = want; mem.rate = rate
    }
  }
}
