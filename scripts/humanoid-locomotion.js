// Turns the humanoid avatar and blends its 3D GLB clips (Idle/Walk/Run) by movement speed, and
// sits it when it is seated. turnTo picks the heading: the body's own state.turnTo when a script
// wrote one (a world whose places differ writes it as the body changes place), else the world's
// default in lib/data/player.yml. 'movement' (the fresh world's value — the standard third person):
// keys down, the body turns toward where the keys point; keys up, it HOLDS its heading while the
// look swings (the camera orbits a still body) until the look is more than turnInPlace degrees off
// the body, then it turns in place to where the look is — whole, feet with hips, ONE turn to one heading,
// a look still moving is never chased — and holds again.
// Every turn is ONE eased, rate-capped step per tick (turnSmoothing / turnSpeed, shortest arc);
// never the velocity, which dies the moment you stop. 'walk': the same turn toward the keys, and a
// standing body keeps its heading whatever the look does — no turn in place. 'camera' (an aim game:
// the body IS the head): it snaps to the view on every input, walking too; a smoothed head reads as
// input lag. The heading comes from the raw move axes rotated into the camera basis (the same
// rotation player.js gives velocity), so physics can never bend it; the smoothed yaw lives in this
// script's own scratch (gaitOf below), never read back off the entity (wire-quantized). The engine
// turns no body: this script is the yaw's one writer. It only animates a 3D model — on a
// sprite-wearing player it does nothing. The turn is stepAngle from builtin/math; this file is its
// worked example.
import PLAYER from './lib/data/player.yml'
import { stepAngle } from 'builtin/math'

// The body's own word, else the world's default.
function turnTo(ctx) {
  return ctx.self.state.turnTo ?? PLAYER.turnTo
}

// The turn's working numbers — the smoothed yaw, its target, the turn-in-place flag, the speed the
// clips were last set to — are this machine's alone: nobody else reads them, and a value written to
// state rides the wire and the save on every tick it changes (a turning body would send a row a
// tick). ctx.session is the room-life scratch: never on the wire, gone with the room. One slot per
// body, so an NPC wearing this script has its own. state keeps what others must see (turnTo, the
// seat flags below).
function gaitOf(ctx) {
  const gaits = (ctx.session.gait ??= {})
  return (gaits[ctx.self.id] ??= {})
}

// An angle in degrees into (-180, 180].
function wrapDeg(deg) {
  let a = deg % 360
  if (a > 180) a -= 360
  else if (a <= -180) a += 360
  return a
}

// The seat's held pose. A body attached to something — a hull's seat, a mount, a chair — is seated,
// and this script (the body's one channel writer) holds this pose instead of the gait. A constant
// function of time: the mixer bakes it once, no per-frame code. Values are offsets from the
// T-pose bind. Rotations are degrees in each bone's own frame, the same on every humanoid rig; the
// hip drop is a FRACTION of the rig's hips rest height (sit.units), so the pelvis lands on the seat
// on every avatar, whatever its rig units. Feet stay at the attach point: the seat point is where
// the feet go, and the hips settle about half the body's height above it.
export function sit() {
  return {
    Hips: { position: [0, -0.5, 0] },
    Spine02: { rotation: [-8, 0, 0] },
    LeftUpLeg: { rotation: [-95, 0, 0] },
    RightUpLeg: { rotation: [-95, 0, 0] },
    LeftLeg: { rotation: [85, 0, 0] },
    RightLeg: { rotation: [85, 0, 0] },
    LeftArm: { rotation: [65, 0, 15] },
    RightArm: { rotation: [65, 0, -15] },
    LeftForeArm: { rotation: [60, 0, 30] },
    RightForeArm: { rotation: [60, 0, -30] },
  }
}
sit.units = 'hips'
sit.duration = 0.1

export function onInput(ctx, input) {
  if (ctx.self.sprite) return
  const sin = input.axes.aimYawSin
  const cos = input.axes.aimYawCos
  if (typeof sin !== 'number' || typeof cos !== 'number') return
  const moveX = input.axes.moveX ?? 0
  const moveZ = input.axes.moveZ ?? 0
  const mode = turnTo(ctx)
  const gait = gaitOf(ctx)
  const walking = moveX || moveZ
  const viewYaw = (Math.atan2(sin, cos) * 180) / Math.PI
  if ((mode === 'movement' || mode === 'walk') && walking) {
    // The move axes in the camera basis: the body faces where it walks.
    gait.targetYaw = (Math.atan2(-(cos * moveX - sin * moveZ), sin * moveX + cos * moveZ) * 180) / Math.PI
    gait.turningInPlace = false
  } else if (mode === 'movement') {
    // Standing: hold while the look is within turnInPlace of the body. Past it, ONE turn to where the look is now — the
    // target stays put while the body turns, so a look still moving is never chased — then hold again.
    if (!gait.turningInPlace) {
      const bodyYaw = gait.bodyYaw ?? ctx.self.yaw ?? viewYaw
      if (Math.abs(wrapDeg(viewYaw - bodyYaw)) > (PLAYER.turnInPlace ?? 90)) {
        gait.targetYaw = viewYaw
        gait.turningInPlace = true
      } else {
        gait.targetYaw = null
      }
    }
  } else {
    // 'walk': a standing body holds. 'camera': the view heading.
    gait.targetYaw = mode === 'walk' ? null : viewYaw
  }
}

export function update(ctx, dt) {
  if (ctx.self.sprite) return // sprites animate via the 2D mixer, never these GLB clips

  const clips = PLAYER.clips || {}
  // Seated: attached to a hull, a mount, a chair — or a sit someone else wrote on the sit channel
  // (mixer and anim read one table, so the script remembers whether the sit is its own). The seat
  // carries the body; this script holds the sit and stands down until the seat ends (the parent
  // row changing wakes it). A sit that is not its own is theirs: never written, never cleared.
  const theirSit = ctx.self.mixer?.sit && ctx.self.state.gaitSit !== 'own'
  if (ctx.self.parent || theirSit) {
    if (!ctx.self.state.gaitSeated) {
      ctx.self.state.gaitSeated = true
      ctx.self.anim.idle = null
      ctx.self.anim.walk = null
      ctx.self.anim.run = null
      if (!theirSit) {
        ctx.self.anim.sit = { clip: clips.sit || sit, loop: 'loop', weight: 1, blendIn: 0.15 }
        ctx.self.state.gaitSit = 'own'
      }
      ctx.self.ik = { ...(ctx.self.ik ?? {}), feet: false } // grounding would plant seated feet through the seat
    }
    ctx.sleep()
    return
  }
  const gait = gaitOf(ctx)
  if (ctx.self.state.gaitSeated) {
    ctx.self.state.gaitSeated = false
    if (ctx.self.state.gaitSit === 'own') ctx.self.anim.sit = null
    ctx.self.state.gaitSit = null
    ctx.self.ik = { ...(ctx.self.ik ?? {}), feet: true }
    gait.clipSpeed = undefined // the channels were cleared for the seat: the next tick writes them whatever the speed
  }

  const mode = turnTo(ctx)
  // turnTo 'none': this script turns nothing — another script (or nobody) owns the yaw.
  if (typeof gait.targetYaw === 'number' && mode !== 'none') {
    const target = gait.targetYaw
    const from = gait.bodyYaw ?? ctx.self.yaw ?? target
    gait.bodyYaw =
      mode === 'movement' || mode === 'walk'
        ? stepAngle(from, target, dt, { smoothing: PLAYER.turnSmoothing, maxDegPerSec: PLAYER.turnSpeed })
        : target
    ctx.self.yaw = gait.bodyYaw + (PLAYER.modelYaw || 0) // modelYaw: degrees a model's forward is off its rig's
    // A turn in place ends when the body has come round to the look: it holds again until the next threshold.
    if (gait.turningInPlace && Math.abs(wrapDeg(target - gait.bodyYaw)) < 0.5) {
      gait.turningInPlace = false
      gait.targetYaw = null
    }
  }
  const targetYaw = gait.targetYaw

  const vel = ctx.self.velocity // the body's velocity: the word player.js gave it this tick, else what it did
  // The gait's numbers live in lib/data/player.yml when a world names them (a world upgraded from 5.x
  // carries its old character's clips and thresholds there); the fresh world runs on these defaults.
  const speed = typeof PLAYER.speedOverride === 'number' ? PLAYER.speedOverride : Math.hypot(vel.x || 0, vel.z || 0)
  // The speed the clips blend and play at: the body's, held still through float noise. A steady run under a
  // turning camera reads a speed that differs by one bit a tick (the hypot of a rotated vector), and a channel
  // written with a new number is a new row on the wire; a step under a millionth of a metre a second is no
  // change in the gait, so the memo stands until the speed really moves. A real change lands whole.
  if (gait.clipSpeed === undefined || Math.abs(speed - gait.clipSpeed) > 1e-6) gait.clipSpeed = speed
  const clipSpeed = gait.clipSpeed
  const walkAt = typeof PLAYER.walkThreshold === 'number' ? PLAYER.walkThreshold : 0.8
  const runAt = typeof PLAYER.runThreshold === 'number' ? PLAYER.runThreshold : 3
  const walkT = Math.min(1, Math.max(0, (clipSpeed - (walkAt - 0.2)) / 0.4))
  const runT = Math.min(1, Math.max(0, (clipSpeed - (runAt - 0.2)) / 0.4))
  const idle = 1 - walkT
  const walk = walkT * (1 - runT)
  const run = runT
  // Anim channels are addresses: assign a channel object and the mixer follows (an equal write is a compare, never a row).
  ctx.self.anim.idle = { clip: clips.idle || 'Idle', loop: 'loop', weight: Math.max(idle, 0.001), blendIn: 0.06 }
  ctx.self.anim.walk = { clip: clips.walk || 'Walk', loop: 'loop', weight: Math.max(walk, 0.001), speed: clipSpeed > 0.1 ? clipSpeed / 2.5 : 1, blendIn: 0.06 }
  ctx.self.anim.run = { clip: clips.run || 'Run', loop: 'loop', weight: Math.max(run, 0.001), speed: clipSpeed > 0.1 ? clipSpeed / 6 : 1, blendIn: 0.06 }
  // Standing, facing where it was told to: the clips hold their weights until the body moves or onInput
  // writes a new heading — either wakes this update.
  if (speed === 0 && (typeof targetYaw !== 'number' || gait.bodyYaw === targetYaw)) ctx.sleep()
}
