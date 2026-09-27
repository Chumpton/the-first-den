import { ring, loft, cap } from "./valley-mesh.js";
// One instanced tree system: height, spread and crown profile are data on the scatter recipe.
function trunk(ctx,h,phase) {
  ctx.albedo("scripts/tex-valley-bark.js");ctx.color("#a5a18b");ctx.roughness(0.96);ctx.smooth();
  const a=ring(0,0,0,h*0.024,h*0.021,7,phase),b=ring(h*0.018,h*0.42,-h*0.013,h*0.014,h*0.012,7,phase),c=ring(h*0.006,h*0.86,0,h*0.006,h*0.006,7,phase);
  cap(ctx,a,false);loft(ctx,a,b);loft(ctx,b,c);cap(ctx,c);
}
function crown(ctx,cx,cy,cz,r,h,phase) {
  const a=ring(cx,cy,cz,r*0.31,r*0.3,8,phase,0.09),b=ring(cx,cy+h*0.25,cz,r,r*0.85,8,phase,0.09),c=ring(cx+r*0.05,cy+h*0.66,cz-r*0.04,r*0.85,r*0.73,8,phase,0.09),d=ring(cx+r*0.13,cy+h,cz,r*0.2,r*0.19,8,phase,0.09);
  ctx.color("#749783");cap(ctx,a,false);loft(ctx,a,b);ctx.color("#91b39a");loft(ctx,b,c);ctx.color("#a1be9d");loft(ctx,c,d);cap(ctx,d);
}
export function geometry(ctx) {
  const h=Number(ctx.params.height??10),r=Number(ctx.params.radius??2.6),phase=ctx.random()*Math.PI*2;
  trunk(ctx,h,phase);ctx.albedo("scripts/tex-valley-canopy.js");ctx.roughness(0.97);ctx.flat();
  if(ctx.params.crown==="pine") {
    crown(ctx,-r*0.26,h*0.42,r*0.04,r*0.92,h*0.43,phase);
    crown(ctx,r*0.50,h*0.51,-r*0.15,r*0.72,h*0.39,phase+0.2);
    crown(ctx,r*0.12,h*0.68,r*0.1,r*0.56,h*0.32,phase+0.6);
  } else {
    const ys=[0.22,0.30,0.46,0.53,0.67,0.73,0.92,1],rs=[0.28,1,0.56,0.78,0.35,0.49,0.17,0.012];
    let prev=null;
    for(let k=0;k<ys.length;k++) {const rr=ring(h*0.012*ys[k],h*ys[k],-h*0.01*ys[k],r*rs[k],r*rs[k]*0.81,8,phase,0.11);ctx.color(k<3?"#6e9681":k<6?"#8bae91":"#a3bd98");if(prev)loft(ctx,prev,rr);else cap(ctx,rr,false);prev=rr;}
    cap(ctx,prev);
  }
}
export function collider(ctx) { const h=Number(ctx.params.height??10);return {kind:"box",width:h*0.048,height:h*0.68,depth:h*0.048}; }
