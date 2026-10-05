import { GRY } from './lib/data/gryphon.js'
import { steerBasis, wowTurn } from './lib/wow-steer.js'
// The player's own movement: WASD relative to the camera's aim, jump, gravity — on the
// character controller. A body is three writes: feetPosition puts it there, velocity asks the
// controller to take it there (held until the next write — it slides, steps and grounds), forces
// push until null. Numbers live in lib/data/player.yml; gravity is the PLACE's
// (places/<p>/config.yaml gravity:), so a district that declares its own pulls on you the
// moment you step in.
import PLAYER from './lib/data/player.yml'
import { ROPES } from './lib/data/ropes.js'

// The keys' intent is this machine's alone: onInput writes it, update() reads it, nobody else does —
// and a value written to state rides the wire and the save on every tick it changes (the intent turns
// with the camera, so a running player would send a row a tick). ctx.session is the room-life scratch:
// never on the wire, gone with the room. One slot per body.
function walkOf(ctx) {
  const walks = (ctx.session.walk ??= {})
  return (walks[ctx.self.id] ??= {})
}

export function onSpawn(ctx) {
  // The body arrives dressed: in the model templates/player.js names, or — when the template names none — in the
  // card's avatar (the player's own character), bare. The avatar takes the clips this game plays here (add a seat's
  // Sit, an emote's name to the list); a model the template chose is left as the template spelled it.
  const worn = ctx.self.model?.id ?? ctx.self.model // a bare id, or { id, … } when the model carries parts or an offset
  if (ctx.self.avatarUrl && typeof worn === 'string' && worn.split('?')[0] === ctx.self.avatarUrl.split('?')[0]) {
    ctx.self.model = ctx.self.avatarUrl + '?animations=Idle,Walk,Run'
  }
}

export function onInput(ctx, input) {
  const B = steerBasis(ctx, input)
  const facingSin = B.sin ?? 0
  const facingCos = B.cos ?? 1

  const moveX = B.moveX
  const moveZ = B.moveZ
  const mag = Math.hypot(moveX, moveZ)
  const nx = mag > 1 ? moveX / mag : moveX
  const nz = mag > 1 ? moveZ / mag : moveZ

  // Where the keys point, at walking speed — the INTENT update() eases the body toward every tick.
  // Written as intent, never straight into velocity: a key is a level (full or nothing) and a body
  // that jumps to 6 m/s the tick a key lands overshoots every tap; the ease makes a tap a nudge.
  const walk = walkOf(ctx)
  if (input.pressed.camView) ctx.self.state.camMode = ctx.self.state.camMode === 'third' ? 'first' : 'third'
  // Flight: a second space press inside flyTapWindow toggles it. Aloft, space rises, shift sinks.
  if (input.pressed.jump) {
    const now = ctx.now()
    if (now - (walk.lastJumpAt ?? -1e9) < PLAYER.flyTapWindow) {
      walk.flying = !walk.flying
      walk.lastJumpAt = -1e9
      ctx.self.state.flying = walk.flying
      ctx.emit('playSound', { clip: walk.flying ? '/cdn/moodboard-lowpoly-cozy/sfx-soft-magical-whoosh-lift-off.mp3' : '/cdn/moodboard-lowpoly-cozy/sfx-soft-magical-whoosh-descend.mp3', position: ctx.self.feetPosition, volume: 0.5 })
    } else walk.lastJumpAt = now
  }
  walk.climb = (input.held.jump ? 1 : 0) - (input.held.descend ? 1 : 0)
  walk.ropeUp = input.held.jump || moveZ > 0.3
  walk.ropeDown = input.held.descend || moveZ < -0.3
  const speed = walk.flying ? PLAYER.flySpeed * (ctx.self.state.flyBoost ? GRY.boost : 1) : PLAYER.walkSpeed * (ctx.self.state.speedMul || 1)
  walk.speed = speed
  walk.moveIntent = {
    x: (facingCos * nx - facingSin * nz) * speed,
    z: -(facingSin * nx + facingCos * nz) * speed,
  }

  // The jump is your y; x and z stay what the body did last tick (y reads 0 on the ground).
  if (!walk.flying && input.pressed.jump && ctx.self.grounded) {
    const v = ctx.self.velocity
    ctx.self.velocity = { x: v.x, y: PLAYER.jumpSpeed, z: v.z }
  }
}

export function update(ctx, dt) {
  // Seated (attached to a hull, a mount): the seat carries the body — the legs rest.
  if (ctx.self.parent) return
  // What the body did last tick; y reads 0 on the ground.
  const v = ctx.self.velocity
  // The stride: ease the ground velocity toward the keys' intent — acceleration while the keys point
  // the way the body already moves, deceleration back to rest when none is down or the keys reverse
  // (both m/s², lib/data/player.yml). One capped step per tick, so a held key reaches walkSpeed in
  // walkSpeed / acceleration seconds and a release stops in walkSpeed / deceleration; a body stopped
  // by a wall reads 0 and pushes again from there.
  const walk = walkOf(ctx)
  // WoW turn: A/D (right button up) swing the heading every tick they are held, and the stride
  // re-aims along the new heading, so W+A runs an arc and A alone turns in place.
  const B = wowTurn(ctx, dt)
  if (B) {
    const mag = Math.hypot(B.moveX, B.moveZ), nx = mag > 1 ? B.moveX / mag : B.moveX, nz = mag > 1 ? B.moveZ / mag : B.moveZ
    const sp = walk.speed ?? PLAYER.walkSpeed
    walk.moveIntent = { x: (B.cos * nx - B.sin * nz) * sp, z: -(B.sin * nx + B.cos * nz) * sp }
  }
  const intent = walk.moveIntent ?? { x: 0, z: 0 }
  if (walk.flying) {
    // Sinking onto the ground lands you.
    // On the gryphon its talons touch first: sinking within its reach of the ground lands it.
    const gnd = ctx.self.state.riding === 'gryphon' && (walk.climb ?? 0) < 0 ? ctx.place.terrain.heightAt(ctx.self.feetPosition.x, ctx.self.feetPosition.z) : null
    const touch = gnd != null && ctx.self.feetPosition.y - gnd < GRY.paws + 0.1
    if ((ctx.self.grounded || touch) && (walk.climb ?? 0) < 0) { walk.flying = false; ctx.self.state.flying = false; ctx.self.state.flyBoost = false }
    else {
      const e = Math.min(1, PLAYER.flyEase * dt), vy = (walk.climb ?? 0) * PLAYER.flyClimb
      ctx.self.velocity = { x: v.x + (intent.x - v.x) * e, y: v.y + (vy - v.y) * e, z: v.z + (intent.z - v.z) * e }
      return
    }
  }
  // A rope: stand in reach and hold W or space to climb, S or shift to slide; at the top you step in onto the deck.
  const p = ctx.self.feetPosition
  const rope = ROPES.find((r) => Math.hypot(p.x - r.x, p.z - r.z) < 0.9 && p.y < r.top + 0.4 && p.y > r.bottom - 0.6)
  if (rope && (walk.ropeUp || (!ctx.self.grounded && p.y > rope.bottom + 0.4))) {
    const atTop = p.y > rope.top + 0.05
    const vy = walk.ropeUp ? PLAYER.ropeClimb : walk.ropeDown ? -PLAYER.ropeClimb : 0
    const pull = atTop ? 0 : 5
    ctx.self.velocity = {
      x: (rope.x - p.x) * pull + (atTop ? rope.in.x * 2.5 : 0),
      y: atTop ? Math.min(vy, 0.5) : vy,
      z: (rope.z - p.z) * pull + (atTop ? rope.in.z * 2.5 : 0),
    }
    return
  }
  const along = intent.x * v.x + intent.z * v.z > 0 || (v.x === 0 && v.z === 0 && (intent.x !== 0 || intent.z !== 0))
  const step = (along ? PLAYER.acceleration : PLAYER.deceleration) * dt
  const dx = intent.x - v.x
  const dz = intent.z - v.z
  const gap = Math.hypot(dx, dz)
  const k = gap > step ? step / gap : 1
  const vx = v.x + dx * k
  const vz = v.z + dz * k
  // Gravity is yours: the held velocity walks the body; bend its y every tick.
  ctx.self.velocity = { x: vx, y: v.y + ctx.place.gravity.y * dt, z: vz }
  // Standing on the ground with no word to walk: nothing changes until something moves the body or a key
  // is pressed — both wake this update (a row of the body written, or onInput running).
  if (ctx.self.grounded && vx === 0 && vz === 0 && intent.x === 0 && intent.z === 0 && !ctx.self.state.bendBusy && !B?.turning) ctx.sleep()
}
