// Slow magic: state.spin = seconds per turn (yaw, forever), state.bob = metres of gentle rise and fall over state.bobT seconds.
import { animate } from "builtin/tween";
export function onSpawn(ctx) {
  const s = ctx.self.state ?? {};
  if (s.spin) animate(ctx, ctx.self, { "rotation.yaw": [0, 90, 180, 270, 360] }, { duration: s.spin, easing: "linear", loop: true });
  if (s.bob) animate(ctx, ctx.self, { "feetPosition.y": "+=" + s.bob }, { duration: s.bobT ?? 3, easing: "easeInOutSine", direction: "alternate", loop: true });
}
