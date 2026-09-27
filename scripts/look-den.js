import { grade, vignette } from 'builtin/postfx';
export function look(ctx) {
  ctx.param('bloomStrength',0.32);ctx.param('bloomRadius',0.85);ctx.param('bloomThreshold',1.0);
  const c=grade(ctx.scene,{exposure:ctx.param('exposure',1.02),saturation:0.99,contrast:1.02,temperature:0.035});
  return vignette(c,0.10,{color:'#302e2a'});
}
