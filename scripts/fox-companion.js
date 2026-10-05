// wunix plays as a red fox: the body wears scripts/gen/animal-fox.js and this script turns it to its travel,
// picks idle / trot / gallop / leap from how it moves (anim/fox.yml), and lights a foxfire wisp when it flies.
import { play, clips } from 'builtin/anim'
import { FEATHERS } from './lib/wynx-kit.js'

const FOX = 'scripts/gen/animal-fox.js'
const OWL = 'scripts/gen/owl.js'
let foxClips = null, owlClips = null
const isWunix = (self) => self.displayName === 'wunix' || self.name === 'wunix' || self.state?.displayName === 'wunix'

function dress(ctx, form = FOX) {
  if (ctx.self.model) ctx.self.model = null
  if (ctx.self.primitive?.script !== form) ctx.self.primitive = { kind: 'scripted', params: {}, script: form }
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

  // in the air she is an owl: a burst of feathers and a soft hoot each way
  const form = flying ? OWL : FOX
  if (ctx.self.primitive?.script !== form) {
    dress(ctx, form)
    mem.clip = ''
    const at = { x: p.x, y: p.y + 0.5, z: p.z }
    ctx.emit('fx', { position: at, script: FEATHERS })
    ctx.emit('playSound', { clip: flying ? '/cdn/moodboard-lowpoly-cozy/sfx-owl-soft-hoot-magic-transform.mp3' : '/cdn/moodboard-lowpoly-cozy/sfx-cute-fox-happy-chirp-yip.mp3', position: at, volume: 0.5, maxDistance: 40 })
  } else dress(ctx, form)
  if (ctx.self.wisp) { ctx.self.wisp = null; ctx.self.light = null }

  if (flying) {
    const oc = (owlClips ??= clips(ctx, 'anim/owl.yml'))
    const vy = ctx.self.velocity?.y ?? 0
    const owl = mem.speed < 2 ? 'hover' : (vy < -1.5 || (mem.speed > 9 && Math.sin(now / 2600) > 0.35)) ? 'glide' : 'fly'
    const orate = owl === 'fly' ? Math.min(1.4, 0.85 + mem.speed / 40) : 1
    if (oc && (mem.clip !== owl || Math.abs(mem.rate - orate) > 0.2)) { play(ctx, ctx.self, oc[owl], { channel: 'body', loop: true, speed: orate, blendIn: 0.3 }); mem.clip = owl; mem.rate = orate }
    return
  }

  const c = (foxClips ??= clips(ctx, 'anim/fox.yml'))
  if (!c) return
  let want = 'idle', rate = 1
  if (airborne) { want = 'leap'; rate = 1 }
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
