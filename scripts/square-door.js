// The side door to the square: the house's oak door swings open while someone stands on its approach, the opening behind it
// shows the square live, and its passage crosses whoever steps in from the approach while it stands open. The root sleeps between writes.
import { SQUARE_DOOR as D } from './lib/data/square-door.js';
import { FEEL } from './lib/data/home-feel.js';

function swing(ctx, open) {
  const hinge = ctx.getObject(D.hinge);
  if (!hinge || !!hinge.state.open === open) return;
  hinge.state.open = open;
  ctx.emit('playSound', { clip: open ? FEEL.doorOpen : FEEL.doorClose, position: hinge.worldFeetPosition, volume: 0.24, maxDistance: 12, mode: 'restart' });
}

function showGlass(ctx, root) {
  const glass = ctx.getObject(D.glass);
  if (!glass) return;
  const live = (root.state.near | 0) > 0;
  if (glass.visible !== live) glass.visible = live;
  if ((glass.material?.view?.link || '') === (live ? D.link : '')) return;
  glass.material = live ? { view: { link: D.link, spill: D.live.spill, sound: D.live.sound } } : D.calm;
}

function recount(ctx, root, leaving) {
  const c = ctx.getObject(D.approach)?.worldFeetPosition;
  let n = 0;
  if (c) for (const p of ctx.place.players) {
    if (p.id === leaving) continue;
    const q = p.worldFeetPosition || p.feetPosition;
    if (q && Math.abs(q.x - c.x) <= D.approachHalf.x + 0.6 && Math.abs(q.z - c.z) <= D.approachHalf.z + 0.6 && Math.abs(q.y - c.y) < 3) n++;
  }
  if ((root.state.near | 0) !== n) root.state.near = n;
  swing(ctx, n > 0);
  showGlass(ctx, root);
  return n;
}

export function onTriggerEnter(ctx, other) {
  if (!ctx.place.players.some((p) => p.id === other.id)) return;
  const root = ctx.getObject(D.id);
  if (!root) return;
  if (ctx.self.state.kind === 'passage') {
    // Shut, or from behind, the doorway shows no square, so it is a plain doorway: it takes you only open and from its approach.
    const a = ctx.getObject(D.approach)?.worldFeetPosition, d = ctx.self.worldFeetPosition, v = other.velocity, q = other.worldFeetPosition;
    const out = a && d ? { x: a.x - d.x, z: a.z - d.z } : null, heading = out && v ? v.x * out.x + v.z * out.z : 0;
    const fromApproach = !out || (Math.abs(heading) > 0.1 ? heading < 0 : !q || (q.x - d.x) * out.x + (q.z - d.z) * out.z > 0);
    if ((root.state.near | 0) > 0 && fromApproach) ctx.cross(other, D.link);
    return;
  }
  recount(ctx, root);
}

export function onTriggerExit(ctx, other) {
  if (ctx.self.state.kind !== 'approach' || !ctx.place.players.some((p) => p.id === other.id)) return;
  const root = ctx.getObject(D.id);
  if (root) recount(ctx, root, other.id);
}

export function onRefuse(ctx, other, verdict) {
  ctx.emit('toast', { message: verdict.message, duration: 3 }, { audience: { player: other.id } });
}

export function update(ctx) {
  if (ctx.self.id !== D.id) return;
  if (recount(ctx, ctx.self) > 0) ctx.sleep(2);
  else ctx.sleep();
}
