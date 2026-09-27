import { ring, loft, cap } from "./valley-mesh.js";
// One instanced spruce system: height, spread and silhouette are data on the scatter recipe.
// crown "fir" = tall slender spruce, "pine" = a fuller, broader spruce (names kept so every bed keeps working).
function trunk(ctx,h,phase) {
  ctx.albedo("scripts/tex-valley-bark.js");ctx.color("#8a7560");ctx.roughness(0.96);ctx.smooth();
  const a=ring(0,0,0,h*0.022,h*0.02,6,phase),b=ring(0,h*0.45,0,h*0.012,h*0.011,6,phase),c=ring(0,h*0.9,0,h*0.004,h*0.004,6,phase);
  cap(ctx,a,false);loft(ctx,a,b);loft(ctx,b,c);
}
const DARK="#2c5440",MID="#3b6a4b",TIP="#5f8f5e",SUN="#7ea56a";
export function geometry(ctx) {
  const h=Number(ctx.params.height??10),r=Number(ctx.params.radius??2.6),phase=ctx.random()*Math.PI*2;
  const full=ctx.params.crown==="pine";
  const lod=Number(ctx.lod??1), n=lod>=4?5:7;
  const tiers=lod>=4?3:lod>=3?5:(full?7:9), base=h*(full?0.14:0.18), rr=r*(full?1.05:0.82), lean=(ctx.random()-0.5)*h*0.015;
  if(lod<4) trunk(ctx,h,phase);
  ctx.albedo("scripts/tex-valley-canopy.js");ctx.roughness(0.95);ctx.flat();
  const span=h-base;
  for(let k=0;k<tiers;k++) {
    const t0=k/tiers, t1=(k+1.35)/tiers;              // tiers overlap so no trunk shows between skirts
    const yBot=base+span*t0, yTop=Math.min(h, base+span*t1);
    const w=rr*Math.pow(1-t0,0.95)*(0.9+ctx.random()*0.2);
    const p=phase+k*0.9, cx=lean*t0, cz=-lean*t0*0.6;
    const top=ring(cx,yTop,cz,w*0.1,w*0.1,n,p,0.05);
    const edge=ring(cx,yBot-w*0.12,cz,w,w*0.92,n,p,0.16);   // drooping skirt tips
    const under=ring(cx,yBot+w*0.1,cz,w*0.45,w*0.42,n,p,0.08);
    ctx.color(k===0?DARK:k<tiers*0.5?MID:TIP);
    loft(ctx,edge,top);
    if(lod<4){ctx.color(DARK);loft(ctx,under,edge);}
    if(k===tiers-1){ctx.color(SUN);cap(ctx,top);}
  }
}
export function collider(ctx) { const h=Number(ctx.params.height??10);return {kind:"box",width:h*0.045,height:h*0.68,depth:h*0.045}; }
