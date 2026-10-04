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
import { PD } from './lib/data/purple-dragon.js'
import { rotate } from 'builtin/vec3'
import { raycast } from 'builtin/physics'

const RAD_TO_DEG = 180 / Math.PI
const C = CAMERA
const hands = { orbit: false, steer: false, mx: 0 }
// the hands: mouse look only arrives while a button is held (pointerLock "drag")
function wowInput(ctx, input) {
  const s = ctx.self.state, lx = (input.axes?.lookX ?? 0) * C.sens, ly = (input.axes?.lookY ?? 0) * C.sens
  hands.orbit = !!input.held?.orbit; hands.steer = !!input.held?.steer; hands.mx = input.axes?.moveX ?? 0
  hands.mz = input.axes?.moveZ ?? 0
  if (s.heading == null) s.heading = s.yaw ?? 0
  const steerWas = hands.steerWas; hands.steerWas = hands.steer
  // WoW: the moment the right button goes down the body snaps to face where the camera looks; the camera never moves
  if (hands.steer && !steerWas) { s.heading = wrapRad(s.heading + (s.off ?? 0)); s.off = 0 }
  if (hands.steer) s.heading = wrapRad(s.heading - lx)
  else if (lx) s.off = wrapRad((s.off ?? 0) - lx)
  if (ly) s.pitch = Math.max(C.pitchMin, Math.min(C.pitchMax, (s.pitch ?? -0.3) - ly))
  const z = input.axes?.zoomIn ?? 0
  if (z) s.dist = Math.max(0, Math.min(C.distMax, (s.dist ?? C.distStart) - z * C.zoomStep * 2))
}
// the spring-arm: an elevated anchor, a spherical boom, a sphere cast that snaps in at once and springs back out
function wowBoom(ctx, target, dt, mounted) {
  const s = ctx.self.state, pos = target.worldFeetPosition ?? target.feetPosition
  if (s.heading == null) s.heading = s.yaw ?? 0
  if (mounted) { // on a horse or a boat the heading is the hull's; the orbit still swings by hand
    const r = target.rotation ?? 0, q = (typeof r === 'number' ? r : (r.yaw ?? 0)) * Math.PI / 180
    s.heading = wrapRad(s.heading + wrapRad(q - s.heading) * (1 - Math.exp(-5 * dt)))
  } else {
    // A/D turn, stepped here at frame rate so the swing is smooth. The keys are read from the body's own hands
    // (wow-steer records them on this machine) or, failing that, the rig's; when neither reaches here the body turns itself.
    const ph = ctx.session.wowHands?.[target.id], steer = ph ? ph.steer : hands.steer, mx = ph ? ph.mx : hands.mx
    if (!steer && mx) { s.heading = wrapRad(s.heading - mx * C.keyTurn * dt); s.camTurnAt = ctx.now() }
  }
  const moving = Math.hypot(target.velocity?.x ?? 0, target.velocity?.z ?? 0) > 0.5
  if (hands.steer) s.off = 0
  else if (!hands.orbit && (moving || mounted)) s.off = (s.off ?? 0) * Math.exp(-C.followRate * dt)
  const yaw = wrapRad(s.heading + (s.off ?? 0)), pitch = Math.max(C.pitchMin, Math.min(C.pitchMax, s.pitch ?? -0.3))
  s.yaw = yaw; s.pitch = pitch
  const k = finiteNumber(target.effectiveScale?.y, 1) * (target.parent ? 0.85 : 1) * (target.state?.kind === 'horse' ? 1.5 : 1)
  const anchor = { x: pos.x, y: pos.y + C.anchor * k, z: pos.z }
  const cp = Math.cos(pitch), back = { x: Math.sin(yaw) * cp, y: -Math.sin(pitch), z: Math.cos(yaw) * cp }
  const want = Math.max(0, s.dist ?? C.distStart) * (mounted ? 1.3 : 1)
  let d = want
  if (want > 0.05) {
    const hit = raycast(ctx, anchor, back, { distance: want + 0.3, radius: C.probe, ignoreEntities: [target.id, ...(target.parent ? [target.parent.id] : [])], physicsOnly: true })
    if (hit) d = Math.max(0.1, hit.distance - 0.2)
  }
  let a = s.actual ?? d
  a = d < a ? d : a + (d - a) * (1 - Math.exp(-C.spring * dt)) // in at once, out on a spring
  s.actual = a
  const first = a < C.firstAt
  ctx.self.hideLocalPlayer = first
  const eye = first ? { x: pos.x, y: pos.y + C.eyeHeight * k, z: pos.z } : { x: anchor.x + back.x * a, y: anchor.y + back.y * a, z: anchor.z + back.z * a }
  ctx.self.feetPosition = eye
  ctx.self.rotation = { yaw: yaw * RAD_TO_DEG, pitch: pitch * RAD_TO_DEG }
}

export function finiteNumber(value, fallback) {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

const wrapRad = (a) => Math.atan2(Math.sin(a), Math.cos(a))
// Riding Violet (kind 'purple-dragon', the controlled target): the hand's swing on the chase orbit, recentring once it rests.
export function onInput(ctx, input) {
  if (ctx.self.target?.state?.kind !== PD.kind) { wowInput(ctx, input); return }
  const s = ctx.self.state, lx = input.axes?.lookX ?? 0, ly = input.axes?.lookY ?? 0
  if (lx || ly) { s.pdYawOff = (s.pdYawOff ?? 0) - lx * PD.cam.sens; s.pdPitchOff = Math.max(-0.9, Math.min(0.6, (s.pdPitchOff ?? 0) - ly * PD.cam.sens)); s.pdRest = 0 }
}
function dragonChase(ctx, target, dt) {
  const s = ctx.self.state, C = PD.cam, r = target.rotation ?? 0
  const q = typeof r === 'object' && typeof r.w === 'number' ? Math.atan2(2 * (r.x * r.z + r.w * r.y), 1 - 2 * (r.x * r.x + r.y * r.y)) : (typeof r === 'number' ? r : (r.yaw ?? 0)) * Math.PI / 180
  s.pdHead = s.pdHead == null ? q : wrapRad(s.pdHead + wrapRad(q - s.pdHead) * (1 - Math.exp(-C.headRate * dt)))
  s.pdRest = (s.pdRest ?? C.rest) + dt
  if (s.pdRest > C.rest) { const k = Math.exp(-C.recenter * dt); s.pdYawOff = (s.pdYawOff ?? 0) * k; s.pdPitchOff = (s.pdPitchOff ?? 0) * k }
  const yaw = wrapRad(s.pdHead + (s.pdYawOff ?? 0)), pitch = Math.max(-1.2, Math.min(0.35, C.pitch + (s.pdPitchOff ?? 0)))
  s.yaw = yaw; s.pitch = pitch
  const pos = target.worldFeetPosition ?? target.feetPosition, seat = rotate(r, PD.seat)
  const aim = { x: pos.x + seat.x, y: pos.y + seat.y + C.aimUp, z: pos.z + seat.z }, cp = Math.cos(pitch)
  ctx.self.feetPosition = { x: aim.x + Math.sin(yaw) * cp * C.dist, y: aim.y - Math.sin(pitch) * C.dist, z: aim.z + Math.cos(yaw) * cp * C.dist }
  ctx.self.rotation = { yaw: yaw * RAD_TO_DEG, pitch: pitch * RAD_TO_DEG }
  ctx.self.hideLocalPlayer = false
}

export function update(ctx, dt) {
  // The eye sits inside the body, so the body is not drawn for its owner (everyone else still sees it).
  const target = ctx.self.target
  if (!target) return
  if (target.state?.kind === PD.kind) { dragonChase(ctx, target, dt); return }
  if (ctx.self.state.pdHead != null) { const s = ctx.self.state; s.pdHead = null; s.pdYawOff = 0; s.pdPitchOff = 0 }
  // 7 flips player.state.camMode (scripts/player.js); third person pulls the eye back over the shoulder.
  // Riding anything that asks for it (the summoned horse, Tomas's horse, the rowboat) pulls the eye back over the shoulder too,
  // whether the camera follows the mount (it holds the controls) or the rider sitting on it.
  const mount = target.parent ?? null, k = target.state?.kind
  const riding = k === 'boat' || k === 'horse' || !!target.state?.thirdPerson || !!mount?.state?.thirdPerson || mount?.state?.kind === 'horse'
  const third = (target.state?.camMode === 'third' || riding) && k !== 'dragon'
  ctx.self.hideLocalPlayer = !third

  // Seated (the body rides a seat: its parent is the chair or the couch), the eye drops to a sitter's and the feet are read
  // in the world, since a rider's own feet are the seat's.
  const eyeHeight = finiteNumber(CAMERA.eyeHeight, 1.6) * finiteNumber(target.effectiveScale?.y, 1) * (target.parent ? 0.72 : 1) * (target.state?.kind === 'boat' ? 0.8 : target.state?.kind === 'horse' ? 1.5 : 1)
  const pos = target.worldFeetPosition ?? target.feetPosition
  // Riding the jade dragon (it is the controlled target): the eye is the saddle's, turned with the dragon.
  if (target.state?.kind === 'dragon') {
    const o = rotate(target.rotation ?? 0, DRAGON.seatEye)
    ctx.self.feetPosition = { x: pos.x + o.x, y: pos.y + o.y, z: pos.z + o.z }
  } else ctx.self.feetPosition = { x: pos.x, y: pos.y + eyeHeight, z: pos.z }

  wowBoom(ctx, target, dt, riding || k === 'dragon')
}
