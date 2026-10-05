// The den's film stock: warm, a breath of horizon-blue haze on the far field, and (high/ultra) soft contact
// shadows: an 8-tap depth occlusion that darkens creases where a bush, a post or a foot meets the ground.
import { grade, vignette } from 'builtin/postfx';
import { vec2, float, screenUV, smoothstep, clamp } from 'builtin/tsl';
const TAPS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
function contact(ctx) {
  const z = ctx.viewZ.negate(), r = float(0.012).div(z.max(1).sqrt()); // radius shrinks with distance
  let occ = float(0);
  TAPS.forEach(([x, y], i) => {
    const s = (i < 4 ? 1 : 0.55);
    const dz = z.sub(ctx.viewZAt(screenUV.add(vec2(x, y).mul(r).mul(s))).negate()); // >0: the neighbour is nearer
    occ = occ.add(smoothstep(0.05, 0.6, dz).mul(smoothstep(2.0, 0.6, dz)));
  });
  const fade = smoothstep(80, 30, z); // only near ground carries contact
  return float(1).sub(clamp(occ.div(TAPS.length), 0, 1).mul(0.55).mul(fade));
}
export function look(ctx) {
  ctx.param('bloomStrength', 0.32); ctx.param('bloomRadius', 0.85); ctx.param('bloomThreshold', 1.0);
  let s = ctx.scene;
  if (ctx.quality === 'high' || ctx.quality === 'ultra') s = s.mul(contact(ctx));
  const c = grade(s, { exposure: ctx.param('exposure', 1.02), saturation: 1.02, contrast: 1.04, temperature: 0.04, haze: 0.07, hazeColor: 'oklch(0.86 0.04 245)' });
  return vignette(c, 0.10, { color: '#302e2a' });
}
