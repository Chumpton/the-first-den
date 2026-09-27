// The rune crystal over a warden tower breathes: a slow bob everyone sees, no per-tick work.
import { animate } from 'builtin/tween';
export function onSpawn(ctx) {
  animate(ctx, ctx.self, { 'feetPosition.y': '+=0.35' }, { duration: 2.6, easing: 'easeInOutSine', direction: 'alternate', loop: true });
}
