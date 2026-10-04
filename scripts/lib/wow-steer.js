// One movement basis shared by player.js and humanoid-locomotion.js: the body's heading is the camera's
// state.heading (the WoW rig owns it), not the orbit you are looking along. Right button up: A/D turn,
// Q/E strafe. Right button down: A/D strafe. Both buttons: run forward.
// The A/D turn is stepped every tick by the body's own update (wowTurn), so a held key keeps turning
// the body even while the input itself does not change.
import CAM from './data/camera.yml'

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const clamp1 = (v) => Math.max(-1, Math.min(1, v))

export function wowHands(ctx) { return ctx.session.wowHands?.[ctx.self.id] ?? null }

function basisFrom(heading, h) {
  let mx = h.steer ? h.mx : 0
  mx = clamp1(mx + h.strafe)
  let mz = h.mz
  if (h.steer && h.orbit) mz = Math.max(mz, 1)
  return { sin: Math.sin(heading), cos: Math.cos(heading), moveX: mx, moveZ: mz, wow: true, turning: !h.steer && h.mx !== 0 }
}

export function steerBasis(ctx, input) {
  const cam = ctx.self.camera?.state, held = input.held ?? {}
  const h = { mx: input.axes.moveX ?? 0, mz: input.axes.moveZ ?? 0, strafe: input.axes.strafe ?? 0, steer: !!held.steer, orbit: !!held.orbit }
  ;(ctx.session.wowHands ??= {})[ctx.self.id] = h
  if (cam && typeof cam.heading === 'number') return basisFrom(cam.heading, h)
  return { sin: input.axes.aimYawSin, cos: input.axes.aimYawCos, moveX: h.mx, moveZ: h.mz, wow: false }
}

// read-only: the basis as it stands this tick
export function wowBasis(ctx) {
  const cam = ctx.self.camera?.state, h = wowHands(ctx)
  if (!cam || typeof cam.heading !== 'number' || !h) return null
  return basisFrom(cam.heading, h)
}

// once a tick, by player.js only: A/D with the right button up turn the heading (body and camera together)
export function wowTurn(ctx, dt) {
  const cam = ctx.self.camera, h = wowHands(ctx)
  if (!cam || typeof cam.state?.heading !== 'number' || !h) return null
  let heading = cam.state.heading
  // the camera rig turns the heading at frame rate when it can hear the keys; only when it has not, the body does
  const camTurns = ctx.now() - (cam.state.camTurnAt ?? -1e9) < 250
  if (!camTurns && !h.steer && h.mx && !ctx.self.parent) {
    heading = wrap(heading - h.mx * (CAM.keyTurn ?? 3.2) * dt)
    cam.state.heading = heading
  }
  return basisFrom(heading, h)
}
