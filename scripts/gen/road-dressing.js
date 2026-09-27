// Road dressing family: kind = lamp | milestone | bench | well | signpost | arm. Feet at ground, front toward -Z.
import { Q, solid, prism, box, ngon, gem } from "../lib/road-solid.js";
const STONE="cdn/texture-pale-weathered-limestone-blocks.png", MOSS="cdn/texture-soft-green-moss-cozy.png",
  WOOD="cdn/texture-weathered-honey-oak-deck-planks.png", ROOF="cdn/texture-mossy-wooden-shingles-cozy.png";
const stone=(ctx)=>{ctx.albedo(STONE);ctx.color("oklch(0.94 0.02 85)");ctx.roughness(0.92);};
const moss=(ctx)=>{ctx.albedo(MOSS);ctx.color("oklch(0.9 0.08 130)");ctx.roughness(1);};
const wood=(ctx)=>{ctx.albedo(WOOD);ctx.color("oklch(0.9 0.05 65)");ctx.roughness(0.85);};
const glow=(ctx,hue)=>{ctx.albedo(null);ctx.color(`oklch(0.9 0.1 ${hue})`);ctx.emissive(hue>120?0.5:1.8,hue>120?1.7:1.3,hue>120?1.6:0.5);};
const B={
  lamp(ctx,lod){
    const n=lod<=3?8:4; stone(ctx);
    prism(ctx,ngon(4,0.36,0,0,Math.PI/4),0,0.25,0.85);
    prism(ctx,ngon(n,0.16,0,0,Math.PI/n),0.25,1.7,0.78);
    prism(ctx,ngon(4,0.24,0,0,Math.PI/4),1.7,1.82);
    if(lod<=2){ moss(ctx); prism(ctx,ngon(n,0.2,0,0,Math.PI/n),0.24,0.42,0.85); prism(ctx,ngon(4,0.38,0.06,0.02,Math.PI/4),0.2,0.27,0.9); }
    glow(ctx,ctx.params.hue??195); gem(ctx,0,2.06,0,0.13,0.3,0.22,lod<=3?6:4); ctx.emissive(null);
  },
  milestone(ctx,lod){
    stone(ctx);
    prism(ctx,[[-0.28,-0.12],[0.28,-0.12],[0.28,0.12],[-0.28,0.12]],0,0.72);
    prism(ctx,[[-0.28,-0.12],[0.28,-0.12],[0.28,0.12],[-0.28,0.12]],0.72,0.92,0.6);
    if(lod<=3){ moss(ctx); prism(ctx,[[-0.2,-0.1],[0.29,-0.13],[0.29,0.13],[-0.1,0.13]],0.85,0.95,0.55); prism(ctx,ngon(6,0.34),0,0.08,0.8); }
  },
  bench(ctx,lod){
    stone(ctx); for(const s of [-1,1]) box(ctx,s*0.72-0.11,0,-0.2,s*0.72+0.11,0.42,0.22);
    wood(ctx); box(ctx,-0.95,0.42,-0.24,0.95,0.5,0.24);
    if(lod<=3){ for(const s of [-1,1]) box(ctx,s*0.72-0.05,0.42,0.17,s*0.72+0.05,0.95,0.25); box(ctx,-0.95,0.68,0.19,0.95,0.9,0.25); }
    if(lod<=2){ moss(ctx); box(ctx,-0.84,0,-0.22,-0.6,0.14,0.24); }
  },
  well(ctx,lod){
    const n=lod<=2?12:lod===3?8:6, ro=0.9, ri=0.66, h=0.8; stone(ctx);
    const O=ngon(n,ro), I=ngon(n,ri);
    for(let i=0;i<n;i++){const j=(i+1)%n,[ax,az]=O[i],[bx,bz]=O[j],[cx,cz]=I[i],[dx,dz]=I[j];
      Q(ctx,[ax,0,az],[bx,0,bz],[bx,h,bz],[ax,h,az],[0,h/2,0]);
      Q(ctx,[cx,0.3,cz],[dx,0.3,dz],[dx,h,dz],[cx,h,cz],[cx*3,h/2,cz*3]);
      Q(ctx,[ax,h,az],[bx,h,bz],[dx,h,dz],[cx,h,cz],[(ax+cx)/2,0,(az+cz)/2]);}
    ctx.albedo(null); ctx.color("oklch(0.55 0.08 190)"); ctx.roughness(0.1); ctx.emissive(0.05,0.18,0.2);
    prism(ctx,I,0.3,0.45); ctx.emissive(null);
    if(lod<=4){ wood(ctx);
      for(const s of [-1,1]) box(ctx,s*0.8-0.07,h,-0.07,s*0.8+0.07,2.2,0.07);
      box(ctx,-0.95,1.95,-0.05,0.95,2.05,0.05);
      ctx.albedo(ROOF); ctx.color("oklch(0.9 0.05 40)");
      for(const s of [-1,1]) solid(ctx,[[-1.15,2.6,0],[1.15,2.6,0],[1.15,1.98,s*1.0]],[[-1.15,2.68,0],[1.15,2.68,0],[1.15,2.06,s*1.0]].map(p=>p),true);
      if(lod<=3){ wood(ctx); prism(ctx,ngon(8,0.14,0.55,0.55),h,h+0.24,1.12); }
      if(lod<=2){ moss(ctx); prism(ctx,ngon(n,ro+0.04),0,0.18,0.99); }
    }
  },
  signpost(ctx,lod){
    wood(ctx); prism(ctx,ngon(4,0.12,0,0,Math.PI/4),0,2.7,0.9);
    prism(ctx,ngon(4,0.14,0,0,Math.PI/4),2.7,2.85,0.3);
    stone(ctx); prism(ctx,ngon(6,0.35),0,0.22,0.7);
    if(lod<=2){ moss(ctx); prism(ctx,ngon(6,0.3,0.05,0),0.18,0.26,0.8); }
  },
  arm(ctx,lod){
    const L=ctx.params.len??1.3, d=ctx.params.dir??1, h=0.15;
    wood(ctx);
    const P=[[0.02,-h],[L-0.25,-h],[L,0],[L-0.25,h],[0.02,h]].map(([x,y])=>[x*d,y]);
    const A=P.map(([x,y])=>[x,y,-0.03]), Bb=P.map(([x,y])=>[x,y,0.03]);
    solid(ctx,d>0?A:A.slice().reverse(),d>0?Bb:Bb.slice().reverse());
  },
};
export function geometry(ctx){ ctx.flat(); (B[ctx.params.kind]||B.lamp)(ctx,ctx.lod); }
export function collider(ctx){
  const k=ctx.params.kind;
  if(k==="arm") return null;
  if(k==="lamp") return box(ctx,-0.3,0,-0.3,0.3,1.9,0.3);
  if(k==="milestone") return box(ctx,-0.28,0,-0.12,0.28,0.9,0.12);
  if(k==="bench") return box(ctx,-0.95,0,-0.24,0.95,0.5,0.24);
  if(k==="well") return prism(ctx,ngon(8,0.9),0,0.8);
  if(k==="signpost") return box(ctx,-0.12,0,-0.12,0.12,2.8,0.12);
}
