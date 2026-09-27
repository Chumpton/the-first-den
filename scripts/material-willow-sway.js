// The weeping willow's hanging curtain in a slow breeze, on the GPU: a vertex swings by how far it hangs below `top` (local m), squared,
// phased along the world so neighbouring strands ripple rather than march. No tick, no row; the geometry keeps its vertex paint.
import { vec3, time, positionLocal, positionWorld, clamp } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), top = ctx.param('top', 4.6), drop = ctx.param('drop', 4.2), reach = ctx.param('reach', 0.16), speed = ctx.param('speed', 0.8);
  m.vertexColors = true; m.roughness = 0.8; m.metalness = 0;
  const k = clamp(positionLocal.y.mul(-1).add(top).div(drop), 0, 1), bend = k.mul(k);
  const t = time.mul(speed).add(positionWorld.x.mul(0.7)).add(positionWorld.z.mul(0.45));
  const sx = t.sin().mul(reach).add(t.mul(2.3).add(0.7).sin().mul(reach).mul(0.3));
  const sz = t.mul(1.3).add(1.9).sin().mul(reach).mul(0.55);
  m.positionNode = positionLocal.add(vec3(sx.mul(bend), 0, sz.mul(bend)));
  return m;
}
