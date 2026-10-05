import { play, clips } from 'builtin/anim'

let foxClips = null

function getClips(ctx) {
  if (!foxClips) {
    foxClips = clips(ctx, 'anim/fox.yml')
  }
  return foxClips
}

export function onSpawn(ctx) {
  const isWunix = ctx.self.displayName === 'wunix' || ctx.self.name === 'wunix' || ctx.self.state?.displayName === 'wunix'
  if (!isWunix) return

  ctx.self.model = null
  ctx.self.primitive = { kind: 'scripted', params: {}, script: 'scripts/gen/animal-fox.js' }
  ctx.self.material = null
  ctx.self.castShadow = true
}

export function update(ctx, dt) {
  const isWunix = ctx.self.displayName === 'wunix' || ctx.self.name === 'wunix' || ctx.self.state?.displayName === 'wunix'
  if (!isWunix) return

  // Keep fox appearance intact
  if (ctx.self.model) ctx.self.model = null
  if (!ctx.self.primitive || ctx.self.primitive.script !== 'scripts/gen/animal-fox.js') {
    ctx.self.primitive = { kind: 'scripted', params: {}, script: 'scripts/gen/animal-fox.js' }
  }

  const p = ctx.self.feetPosition || ctx.self.worldFeetPosition
  if (!p) return

  const s = (ctx.self.state ??= {})
  const mem = (ctx.session.foxState ??= {
    lastX: p.x,
    lastY: p.y,
    lastZ: p.z,
    lastT: ctx.now(),
    currentClip: '',
    currentSpeed: 1,
    sniffTimer: 0,
    soundTimer: 0,
    idlePhase: 0,
  })

  const now = ctx.now()
  const dx = p.x - mem.lastX
  const dz = p.z - mem.lastZ
  const movedDist = Math.hypot(dx, dz)
  const moveSpeed = movedDist / realDt

  if (movedDist > 0.03) {
    const wantYaw = Math.atan2(-dx, -dz) * 180 / Math.PI
    ctx.self.rotation = { yaw: Math.round(wantYaw * 10) / 10 }
  }

  mem.lastX = p.x
  mem.lastY = p.y
  mem.lastZ = p.z
  mem.lastT = now

  // Check terrain height to know if airborne
  const terrainH = ctx.place?.terrain?.heightAt ? ctx.place.terrain.heightAt(p.x, p.z) : null
  const heightAboveGround = terrainH != null ? (p.y - terrainH) : 0
  const isAirborne = s.flying || (heightAboveGround > 1.8)

  // Floating & flying magical visual effects (celestial foxfire wisp and warm ember light)
  if (isAirborne) {
    if (!ctx.self.wisp) {
      ctx.self.wisp = { color: '#ff6622', shape: 'slender', burnStyle: 'pulse', size: 1.1 }
      ctx.self.light = { kind: 'point', color: '#ffaa44', intensity: 2.2, distance: 6 }
    }
  } else {
    if (ctx.self.wisp) {
      ctx.self.wisp = null
      ctx.self.light = null
    }
  }

  // Animation selection
  const c = getClips(ctx)
  if (!c) return

  let wantClip = 'walk'
  let animSpeed = 1.0

  if (isAirborne) {
    wantClip = 'walk'
    animSpeed = 0.95
  } else if (moveSpeed > 0.35) {
    wantClip = 'walk'
    animSpeed = Math.min(2.2, Math.max(0.8, moveSpeed * 0.45))
  } else {
    // Idle on ground: roam/sniff behavior
    mem.sniffTimer += dt
    if (mem.sniffTimer > 8.0) {
      mem.sniffTimer = 0
      mem.idlePhase = (mem.idlePhase + 1) % 4
      if (mem.idlePhase === 0 && now - mem.soundTimer > 15000) {
        mem.soundTimer = now
        ctx.emit('playSound', {
          clip: '/cdn/moodboard-lowpoly-cozy/sfx-cute-fox-happy-chirp-yip.mp3',
          position: p,
          volume: 0.35
        })
      }
    }

    if (mem.idlePhase === 2) {
      wantClip = 'alert'
      animSpeed = 1.0
    } else {
      wantClip = 'sniff'
      animSpeed = 1.0
    }
  }

  if (mem.currentClip !== wantClip || Math.abs(mem.currentSpeed - animSpeed) > 0.25) {
    const clip = c[wantClip]
    if (clip) {
      play(ctx, ctx.self, clip, { channel: 'body', loop: true, speed: animSpeed, blendIn: 0.25 })
      mem.currentClip = wantClip
      mem.currentSpeed = animSpeed
    }
  }
}
