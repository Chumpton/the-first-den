// Pale limestone road bridge: timber deck on low stone arches and cutwater piers, stone parapets with glowing newels,
// moss at the waterline. Origin = deck centre at road level (world y 0.5); length along Z; water sits at local -0.5.
import { Q, solid, prism, box, gem } from "../lib/road-solid.js";
const STONE="cdn/texture-pale-weathered-limestone-blocks.png", COBBLE="cdn/texture-terrain-pale-limestone-cobblestone-road.png", WOOD="cdn/texture-weathered-honey-oak-deck-planks.png", MOSS="cdn/texture-soft-green-moss-cozy.png";
function dims(ctx){
  const { length:L=30, width:W=6 } = ctx.params;
  const hw=W/2+0.4, rise=Math.min(0.55,L*0.02);
  const top=z=>0.06+rise*(1-(2*z/L)**2);
  return { L, W, hw, rise, top };
}
function sweep(ctx,zs,sec){ // sec(z) -> 4 [x,y] corners
  for(let i=0;i<zs.length-1;i++){
    const a=sec(zs[i]).map(([x,y])=>[x,y,zs[i]]), b=sec(zs[i+1]).map(([x,y])=>[x,y,zs[i+1]]);
    solid(ctx,a,b,i===0||i===zs.length-2);
  }
}
const steps=(a,b,n)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
export function geometry(ctx){
  const { L, hw, top } = dims(ctx), lod=ctx.lod;
  const nSeg = lod<=2?Math.max(8,Math.round(L/2.5)):lod===3?6:3;
  const zs=steps(-L/2,L/2,nSeg), ab=L/2-2.5;
  ctx.flat();
  // cobbled deck between the curbs, the same pale limestone as the highway
  ctx.albedo(COBBLE); ctx.color("oklch(0.97 0.01 85)"); ctx.roughness(0.85);
  sweep(ctx,zs,z=>{const t=top(z);return [[-hw+0.4,t-0.3],[hw-0.4,t-0.3],[hw-0.4,t],[-hw+0.4,t]];});
  // stone parapets (curb + wall), coping
  ctx.albedo(STONE); ctx.color("oklch(0.95 0.02 85)"); ctx.roughness(0.92);
  for(const s of [-1,1]){
    const xi=s*(hw-0.4), xo=s*hw;
    sweep(ctx,zs,z=>{const t=top(z);return [[Math.min(xi,xo),t-0.55],[Math.max(xi,xo),t-0.55],[Math.max(xi,xo),t+0.7],[Math.min(xi,xo),t+0.7]];});
    if(lod<=2){const a=Math.min(xi,xo)-0.06,b=Math.max(xi,xo)+0.06;sweep(ctx,zs,z=>{const t=top(z);return [[a,t+0.7],[b,t+0.7],[b-0.03,t+0.8],[a+0.03,t+0.8]];});}
  }
  if(lod<=4){
    // abutments sunk in the banks
    for(const s of [-1,1]) box(ctx,-hw,-2.3,Math.min(s*ab,s*L/2),hw,top(s*ab)-0.3,Math.max(s*ab,s*L/2));
    // supports: piers between the abutments
    const inner=2*ab, nSpan=Math.max(2,Math.round(inner/11));
    const sup=steps(-ab,ab,nSpan);
    for(let k=1;k<sup.length-1;k++){
      const zp=sup[k], cut=[[-hw-1,zp],[-hw,zp-0.7],[hw,zp-0.7],[hw+1,zp],[hw,zp+0.7],[-hw,zp+0.7]];
      prism(ctx,cut,-2.3,0.25);
      box(ctx,-hw,0.25,zp-0.7,hw,top(zp)-0.3,zp+0.7);
      if(lod<=3){ ctx.albedo(MOSS); ctx.color("oklch(0.9 0.08 130)");
        prism(ctx,cut.map(([x,z])=>[x*1.03,zp+(z-zp)*1.06]),-0.7,-0.2);
        ctx.albedo(STONE); ctx.color("oklch(0.95 0.02 85)"); }
    }
    // arches: spandrel sides + soffit per span
    const k = lod<=2?8:lod===3?4:2;
    for(let i=0;i<sup.length-1;i++){
      const za=sup[i]+(i===0?0:0.7), zb=sup[i+1]-(i===sup.length-2?0:0.7), zm=(za+zb)/2;
      const yC=top(zm)-0.5, yS=-0.9;
      const pts=steps(za,zb,k).map(z=>[z,yS+(yC-yS)*Math.sin(Math.PI*(z-za)/(zb-za)),top(z)-0.3]);
      for(let j=0;j<k;j++){
        const [z0,y0,t0]=pts[j],[z1,y1,t1]=pts[j+1];
        const o=[0,(y0+t0)/2,(z0+z1)/2];
        for(const s of [-1,1]) Q(ctx,[s*hw,y0,z0],[s*hw,y1,z1],[s*hw,t1,z1],[s*hw,t0,z0],o);
        Q(ctx,[-hw,y0,z0],[hw,y0,z0],[hw,y1,z1],[-hw,y1,z1],[0,Math.max(y0,y1)+1,(z0+z1)/2]);
      }
      if(lod<=2){ // moss on the arch feet
        ctx.albedo(MOSS); ctx.color("oklch(0.9 0.08 130)");
        for(const zf of [za,zb]){const d=zf===za?1:-1; box(ctx,-hw-0.04,-0.75,Math.min(zf,zf+d*0.9),hw+0.04,-0.3,Math.max(zf,zf+d*0.9));}
        ctx.albedo(STONE); ctx.color("oklch(0.95 0.02 85)");
      }
    }
  }
  // newel posts at the four corners with softly glowing crystals
  for(const sz of [-1,1]) for(const sx of [-1,1]){
    const z=sz*(L/2-0.35), x=sx*(hw-0.2), t=top(z);
    box(ctx,x-0.28,t-0.5,z-0.28,x+0.28,t+1.05,z+0.28);
    if(lod<=3){ box(ctx,x-0.33,t+1.05,z-0.33,x+0.33,t+1.14,z+0.33);
      ctx.albedo(null); ctx.color("oklch(0.9 0.1 195)"); ctx.emissive(0.5,1.7,1.6);
      gem(ctx,x,t+1.36,z,0.11,0.26,0.18,lod<=2?6:4);
      ctx.emissive(null); ctx.albedo(STONE); ctx.color("oklch(0.95 0.02 85)"); }
  }
}
export function collider(ctx){
  const { L, hw, top } = dims(ctx), n=Math.max(10,Math.round(L/2)), zs=steps(-L/2,L/2,n), wi=hw-0.4;
  for(let i=0;i<n;i++){
    const z0=zs[i],z1=zs[i+1],t0=top(z0),t1=top(z1);
    Q(ctx,[-hw,t0,z0],[hw,t0,z0],[hw,t1,z1],[-hw,t1,z1],[0,t0-1,z0]); // deck sheet, up
    for(const s of [-1,1]) Q(ctx,[s*wi,t0,z0],[s*wi,t1,z1],[s*wi,t1+1,z1],[s*wi,t0+1,z0],[s*hw,t0+0.5,z0]); // rails, inward
  }
}
