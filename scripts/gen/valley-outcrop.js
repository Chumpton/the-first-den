import { ring, loft, cap } from "./valley-mesh.js";
// A jointed limestone ledge, not a pile of box primitives. Each root is one reusable mesh.
function mass(ctx,cx,cz,w,d,h,phase,detail) {
  const n=detail?10:6,base=ctx.groundY(cx,cz)-0.75;
  const levels=detail?[[0,1],[0.19,1.07],[0.55,0.94],[0.83,0.78],[1,0.58]]:[[0,1],[0.62,0.96],[1,0.6]];
  let prev=null;
  for(let k=0;k<levels.length;k++) {
    const y=base+levels[k][0]*h,rx=w*0.5*levels[k][1],rz=d*0.5*levels[k][1];
    const rr=ring(cx+h*0.05*levels[k][0],y,cz+h*0.03*levels[k][0],rx,rz,n,phase,0.1);
    for(let j=0;j<rr.length;j++) rr[j][1]+=Math.sin(j*1.9+phase)*h*0.055*(k===0?0.15:1);
    if(detail)ctx.color(k<2?"#aebeb6":k<4?"#dce1d3":"#e9e8d6");
    if(prev)loft(ctx,prev,rr);else cap(ctx,rr,false);prev=rr;
  }
  cap(ctx,prev);
}
export function geometry(ctx) {
  const w=Number(ctx.params.width??14),h=Number(ctx.params.height??8),d=Number(ctx.params.depth??10),phase=ctx.random()*Math.PI;
  ctx.albedo("scripts/tex-valley-chalkrock.js");ctx.roughness(0.93);ctx.flat();
  mass(ctx,-w*0.13,0,w*0.72,d,h,phase,true);
  mass(ctx,w*0.30,d*0.12,w*0.48,d*0.66,h*0.68,phase+0.35,true);
  mass(ctx,-w*0.10,-d*0.34,w*0.49,d*0.38,h*0.36,phase+0.7,true);
}
export function collider(ctx) {
  const w=Number(ctx.params.width??14),h=Number(ctx.params.height??8),d=Number(ctx.params.depth??10);
  mass(ctx,0,0,w,d,h*0.86,0,false);
}
