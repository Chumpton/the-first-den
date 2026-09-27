// Banner cloth in the wind, on the GPU: a wave runs from the fixed edge outward (along = x·ax + y·ay, 0 at the pole/rod, 1 at the free edge),
// its amplitude growing with distance from the fixed edge, phased by world x so two banners never march together. Vertex paint kept.
import { vec3, time, positionLocal, positionWorld, clamp } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), ax = ctx.param('ax', 0.28), ay = ctx.param('ay', 0), reach = ctx.param('reach', 0.3), speed = ctx.param('speed', 2.4), k = ctx.param('k', 4);
  m.vertexColors = true; m.roughness = 0.85; m.metalness = 0;
  const along = clamp(positionLocal.x.mul(ax).add(positionLocal.y.mul(ay)), 0, 1);
  const ph = time.mul(speed).sub(along.mul(k)).add(positionWorld.x.mul(0.37));
  const dz = ph.sin().mul(reach).add(ph.mul(2.1).add(1.3).sin().mul(reach).mul(0.25)).mul(along);
  m.positionNode = positionLocal.add(vec3(0, 0, dz));
  return m;
}
