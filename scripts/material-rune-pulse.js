// Carved runes breathing teal light on the GPU: a slow pulse, phased by world x so two stones never beat together. No tick, no row.
import { vec3, time, positionWorld } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), speed = ctx.param('speed', 1.3), lo = ctx.param('lo', 0.55), hi = ctx.param('hi', 1.6);
  m.roughness = 0.5; m.metalness = 0;
  const k = time.mul(speed).add(positionWorld.x.mul(0.3)).sin().mul(0.5).add(0.5), glow = k.mul(k).mul(hi.sub(lo)).add(lo);
  m.colorNode = vec3(0.45, 0.85, 0.82);
  m.emissiveNode = vec3(0.22, 0.78, 0.74).mul(glow);
  return m;
}
