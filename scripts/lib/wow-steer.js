// One movement basis shared by player.js and humanoid-locomotion.js: the body's heading is the camera's
// state.heading (the WoW rig owns it), not the orbit you are looking along. Right button up: A/D turn,
// Q/E strafe. Right button down: A/D strafe. Both buttons: run forward.
export function steerBasis(ctx, input) {
  const cam = ctx.self.camera?.state, held = input.held ?? {}
  let mx = input.axes.moveX ?? 0, mz = input.axes.moveZ ?? 0
  const strafe = input.axes.strafe ?? 0
  if (cam && typeof cam.heading === 'number') {
    if (!held.steer) mx = 0
    mx = Math.max(-1, Math.min(1, mx + strafe))
    if (held.steer && held.orbit) mz = Math.max(mz, 1)
    return { sin: Math.sin(cam.heading), cos: Math.cos(cam.heading), moveX: mx, moveZ: mz, wow: true }
  }
  return { sin: input.axes.aimYawSin, cos: input.axes.aimYawCos, moveX: mx, moveZ: mz, wow: false }
}
