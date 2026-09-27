// The air in front of the far ranges: this material ignores scene fog (which ends at 900 m) and lays its own
// aerial perspective — thicker with distance and toward the base — over the lit vertex colours.
import { vertexColor, positionWorld, cameraPosition, distance, color, mix, saturate, float } from "builtin/tsl";
import { MeshStandardNodeMaterial } from "builtin/three";
export function material(ctx) {
  const m = new MeshStandardNodeMaterial();
  const d = distance(cameraPosition, positionWorld);
  const far = saturate(d.div(ctx.param("hazeDist", 9000))).mul(ctx.param("hazeFar", 0.5));
  const low = saturate(float(1).sub(positionWorld.y.div(ctx.param("hazeTop", 800)))).pow(2.2).mul(ctx.param("hazeLow", 0.38));
  const f = saturate(far.add(low));
  m.colorNode = vertexColor().rgb.mul(float(1).sub(f));
  m.emissiveNode = color(ctx.params.hazeColor ?? "oklch(0.84 0.045 240)").mul(f).mul(ctx.param("hazeGlow", 0.9));
  m.roughness = 0.95;
  m.metalness = 0;
  m.fog = false;
  return m;
}
