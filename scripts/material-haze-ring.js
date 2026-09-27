// The haze band's air: a flat self-lit veil (no sun shading, no scene fog) whose opacity falls from `base`
// at the band's foot to 0 at its top, eased so the upper edge melts into the sky.
import { positionWorld, color, saturate, float } from "builtin/tsl";
import { MeshStandardNodeMaterial } from "builtin/three";
export function material(ctx) {
  const m = new MeshStandardNodeMaterial();
  const y0 = ctx.param("floor", 0), top = ctx.param("top", 340);
  const t = saturate(positionWorld.y.sub(y0).div(float(top).sub(y0)));
  m.colorNode = color("#000000");
  m.emissiveNode = color(ctx.params.hazeColor ?? "oklch(0.9 0.02 230)").mul(ctx.param("glow", 0.95));
  m.opacityNode = float(1).sub(t).pow(ctx.param("ease", 1.6)).mul(ctx.param("base", 0.55));
  m.transparent = true;
  m.depthWrite = false;
  m.roughness = 1;
  m.metalness = 0;
  m.fog = false;
  return m;
}
