// The old water wheel turning on the GPU: every vertex spun about the local Z axle at `speed` rad/s (negative = rolls with the creek, west).
// No tick, no row write; flat shading re-derives the facets so the light stays true as it turns.
import { vec3, time, positionLocal } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), speed = ctx.param('speed', 0.44);
  m.vertexColors = true; m.roughness = 0.85; m.metalness = 0; m.flatShading = true;
  const a = time.mul(speed), c = a.cos(), s = a.sin(), p = positionLocal;
  m.positionNode = vec3(p.x.mul(c).sub(p.y.mul(s)), p.x.mul(s).add(p.y.mul(c)), p.z);
  return m;
}
