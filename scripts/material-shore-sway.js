// Reeds and cattails in a breeze, drawn on the GPU: a vertex bends by how far it stands above `base` (local metres), squared,
// phased along the world so a whole bank leans together. No tick, no row; the geometry keeps its vertex paint.
import { vec3, time, positionLocal, positionWorld, clamp } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), base = ctx.param('base', 0.4), h = ctx.param('h', 1.2), reach = ctx.param('reach', 0.07), speed = ctx.param('speed', 1.1);
  m.vertexColors = true; m.roughness = 0.9; m.metalness = 0;
  const k = clamp(positionLocal.y.sub(base).div(h), 0, 1), bend = k.mul(k);
  const t = time.mul(speed).add(positionWorld.x.mul(0.45)).add(positionWorld.z.mul(0.3));
  const gust = t.sin().mul(reach).add(t.mul(2.7).add(1.3).sin().mul(reach).mul(0.3)).add(reach * 0.6);
  const side = t.mul(1.6).add(0.8).sin().mul(reach).mul(0.35);
  m.positionNode = positionLocal.add(vec3(gust.mul(bend), 0, side.mul(bend)));
  return m;
}
