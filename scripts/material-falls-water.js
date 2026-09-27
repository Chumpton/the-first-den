// Falling water on the GPU: teal glass with white streaks running down (−y) and forward (−z) through the sheet; no tick, no row.
import { vec3, time, positionLocal, clamp } from 'builtin/tsl';
import { MeshStandardNodeMaterial } from 'builtin/three';
export function material(ctx) {
  const m = new MeshStandardNodeMaterial(), speed = ctx.param('speed', 5);
  m.transparent = true; m.depthWrite = false; m.side = 2; m.roughness = 0.08; m.metalness = 0;
  const p = positionLocal, t = time.mul(speed);
  const s1 = p.y.mul(7).add(p.z.mul(3)).add(t).add(p.x.mul(5).sin().mul(1.3)).sin().mul(0.5).add(0.5);
  const s2 = p.y.mul(13).add(p.z.mul(5)).add(t.mul(1.45)).add(p.x.mul(11).add(1.7).sin().mul(0.9)).sin().mul(0.5).add(0.5);
  const foam = clamp(s1.mul(s1).mul(s1).mul(0.8).add(s2.mul(s2).mul(s2).mul(s2).mul(0.55)), 0, 1);
  m.colorNode = vec3(0.4, 0.72, 0.7).add(vec3(0.58, 0.28, 0.3).mul(foam));
  m.emissiveNode = vec3(0.22, 0.26, 0.26).mul(foam);
  m.opacityNode = foam.mul(0.35).add(0.5);
  return m;
}
