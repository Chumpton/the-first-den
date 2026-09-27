// A double door on pressure pads: anyone who walks into the pad zone (inside or out) swings both leaves
// inward; the last one out lets them close. Row state: leaves [{ id, closed, open }] (world yaws), pads [ids].
import { animate } from 'builtin/tween'

const CLIP_OPEN = '/cdn/moodboard-lowpoly-cozy/sfx-wooden-cottage-door-open-soft-creak.mp3'
const CLIP_SHUT = '/cdn/moodboard-lowpoly-cozy/sfx-wooden-cottage-door-close-soft-thud.mp3'

function mine(ctx, id) {
  const s = ctx.self.state
  return (s.leaves ?? []).some((l) => l.id === id) || (s.pads ?? []).includes(id) || id === ctx.self.id
}
function walker(other) {
  const b = other?.physics?.body ?? other?.physics
  return b === 'character' || (other?.tags ?? []).includes('player')
}
function setOpen(ctx, open) {
  const s = ctx.self.state
  if (!!s.open === open) return
  s.open = open
  for (const L of s.leaves ?? []) {
    const o = ctx.getObject(L.id)
    if (o) o.rotation = { yaw: open ? L.open : L.closed }
  }
  for (const id of s.pads ?? []) {
    const p = ctx.getObject(id)
    if (p) animate(ctx, p, { 'feetPosition.y': open ? '-=0.03' : '+=0.03' }, { duration: 0.15 })
  }
  ctx.emit('playSound', { clip: open ? CLIP_OPEN : CLIP_SHUT, position: ctx.self.feetPosition, volume: 0.55, maxDistance: 25 })
}
export function onTriggerEnter(ctx, other) {
  if (!other || mine(ctx, other.id) || !walker(other)) return
  const s = ctx.self.state
  s.near = [...new Set([...(s.near ?? []), other.id])]
  setOpen(ctx, true)
}
export function onTriggerExit(ctx, other) {
  if (!other) return
  const s = ctx.self.state
  s.near = (s.near ?? []).filter((id) => id !== other.id)
  if (!s.near.length) ctx.after(0.9, 'closeIfClear')
}
export function closeIfClear(ctx) {
  const s = ctx.self.state
  s.near = (s.near ?? []).filter((id) => ctx.getObject(id))
  if (!s.near.length) setOpen(ctx, false)
}
