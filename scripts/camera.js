// A first-person camera on the declared `look` contract (templates/camera.js#camera:
// orientation.source "look"): the engine integrates the mouse at display rate with the rig's
// sensitivity / minPitch / maxPitch and owns the presented facing — read it back as ctx.self.view.
// The rig owns the EYE: every tick the camera sits at the controlled entity's eyes (scaled with the
// body) and faces where the view looks, so the camera's own row stays honest for everything that
// reads it (the audio listener, god-mode entry at the play camera). Numbers live in
// lib/data/camera.yml.
// Hiding your own body is THIS rig's decision (ctx.self.hideLocalPlayer — the rig's layer, which
// dies with the rig), never a flag on the camera def: a rewrite to an orbit rig shows the body again
// with nothing to un-set.
import CAMERA from './lib/data/camera.yml'
import { DRAGON } from './lib/data/dragon.js'
import { rotate } from 'builtin/vec3'
import { raycast } from 'builtin/physics'

const RAD_TO_DEG = 180 / Math.PI

export function finiteNumber(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

export function update(ctx, dt) {
  // The eye sits inside the body, so the body is not drawn for its owner (everyone else still sees it).
  const target = ctx.self.target
  if (!target) return
  // 7 flips player.state.camMode (scripts/player.js); third person pulls the eye back over the shoulder.
  const third = target.state?.camMode === 'third' && target.state?.kind !== 'dragon'
  ctx.self.hideLocalPlayer = !third

  // Seated (the body rides a seat: its parent is the chair or the couch), the eye drops to a sitter's and the feet are read
  // in the world, since a rider's own feet are the seat's.
  const eyeHeight = finiteNumber(CAMERA.eyeHeight, 1.6) * finiteNumber(target.effectiveScale.y, 1) * (target.parent ? 0.72 : 1)
  const pos = target.worldFeetPosition ?? target.feetPosition
  // Riding the jade dragon (it is the controlled target): the eye is the saddle's, turned with the dragon.
  if (target.state?.kind === 'dragon') {
    const o = rotate(target.rotation ?? 0, DRAGON.seatEye)
    ctx.self.feetPosition = { x: pos.x + o.x, y: pos.y + o.y, z: pos.z + o.z }
  } else ctx.self.feetPosition = { x: pos.x, y: pos.y + eyeHeight, z: pos.z }

  // The presented facing (radians) as the one rotation grammar (degrees) — undefined before the first frame.
  const view = ctx.self.view
  if (view) ctx.self.rotation = { yaw: view.yaw * RAD_TO_DEG, pitch: view.pitch * RAD_TO_DEG }
  if (third && view) {
    const head = ctx.self.feetPosition
    const rot = { yaw: view.yaw * RAD_TO_DEG, pitch: view.pitch * RAD_TO_DEG }
    const back = rotate(rot, { x: 0, y: 0, z: 1 }), side = rotate(view.yaw * RAD_TO_DEG, { x: 1, y: 0, z: 0 })
    const want = finiteNumber(CAMERA.thirdDistance, 4.2), sh = finiteNumber(CAMERA.thirdShoulder, 0.55), lift = finiteNumber(CAMERA.thirdLift, 0.35)
    const origin = { x: head.x + side.x * sh, y: head.y + lift, z: head.z + side.z * sh }
    const hit = raycast(ctx, origin, back, { distance: want + 0.3, ignoreEntities: [target.id], physicsOnly: true })
    const d = hit ? Math.max(0.4, hit.distance - 0.3) : want
    ctx.self.feetPosition = { x: origin.x + back.x * d, y: origin.y + back.y * d, z: origin.z + back.z * d }
  }
}
