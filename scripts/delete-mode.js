// Delete mode, builders only: 8 toggles it, 9 removes the placed thing under the crosshair (saved, one undo
// in History). Players, terrain and forest scatter are never targets. The picked thing glows red while aimed.
import { raycast } from 'builtin/physics'
import { rotate } from 'builtin/vec3'

function aimed(ctx) {
  const cam = ctx.self.camera
  const eye = cam?.feetPosition, rot = cam?.rotation
  if (!eye || !rot) return null
  const dir = rotate(rot, { x: 0, y: 0, z: -1 })
  const hit = raycast(ctx, eye, dir, { distance: 60, ignoreEntities: [ctx.self.id], hits: 'both' })
  if (!hit?.id || hit.world) return null
  const id = String(hit.id)
  if (id.startsWith('player') || id.includes('terrain') || id.includes('chunk')) return null
  const o = ctx.getObject(id)
  if (!o || (o.tags ?? []).includes('player')) return null
  return id
}

export function onInput(ctx, input) {
  if (!ctx.self.isEditor) return
  if (input.pressed.deleteMode) {
    ctx.self.state.deleteMode = !ctx.self.state.deleteMode
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-soft-ui-toggle-click.mp3', volume: 0.5 }, { audience: { player: ctx.self.id } })
    if (!ctx.self.state.deleteMode && ctx.session.delAim) { ctx.emit('highlightClear', { target: ctx.session.delAim }); ctx.session.delAim = null }
  }
  if (input.pressed.deleteThing && ctx.self.state.deleteMode) {
    const id = aimed(ctx)
    if (!id) return
    const at = ctx.getObject(id)?.feetPosition
    ctx.emit('highlightClear', { target: id })
    ctx.commit(`removed ${id} in delete mode`, () => ctx.destroy(id))
    ctx.session.delAim = null
    if (at) ctx.emit('fx', { position: at, script: 'fx\npop dust burst=18 life=.5..0.9 v=sdir()*(1..2.5) size=.15..0.3 acc=drag(2) col=<.8,.75,.65> a=.6>0 sz=$size*(1>2) r=sprite(smoke-puff,alpha)' })
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-soft-poof-vanish.mp3', position: at, volume: 0.6 })
  }
}

export function update(ctx) {
  if (!ctx.self.isLocal || !ctx.self.state.deleteMode) return
  const id = aimed(ctx)
  if (id === ctx.session.delAim) return
  if (ctx.session.delAim) ctx.emit('highlightClear', { target: ctx.session.delAim }, { audience: { player: ctx.self.id } })
  if (id) ctx.emit('highlightSet', { target: id, color: 'oklch(0.65 0.22 25)', style: 'outline' }, { audience: { player: ctx.self.id } })
  ctx.session.delAim = id
}
