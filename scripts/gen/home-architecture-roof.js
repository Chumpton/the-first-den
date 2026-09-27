import { ARCH,mainPlanes,wingPlanes,planeAt } from './home-architecture-data.js';
import { builder,paint,roofPieces,polySlab,clip,area } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx),frame=ctx.params.frame||'den',index=ctx.params.facet||0,p=(frame==='den'?mainPlanes():wingPlanes())[index],polys=roofPieces(frame,index);
 paint(e,ARCH.textures.deck,'#ffffff',.89);for(const poly of polys)polySlab(e,poly,(x,z)=>planeAt(p,x,z),(x,z)=>planeAt(p,x,z)+ARCH.roofDeck);
 const slope=Math.hypot(p[0],p[1]),d=[p[0]/slope,p[1]/slope],u=[-d[1],d[0]],step=ARCH.roofCourse,width=ARCH.shingleWidth;
 paint(e,ARCH.textures.shingles,'#ffffff',.91);
 for(const poly of polys){const ss=poly.map(v=>v[0]*d[0]+v[1]*d[1]),ts=poly.map(v=>v[0]*u[0]+v[1]*u[1]);const s0=Math.floor(Math.min(...ss)/step),s1=Math.ceil(Math.max(...ss)/step),tMin=Math.min(...ts),tMax=Math.max(...ts);
  for(let row=s0;row<s1;row++){const low=row*step,high=low+step+.018,shift=(row%2)*width*.5;
   for(let col=Math.floor((tMin-shift)/width);col<=Math.ceil((tMax-shift)/width);col++){const l=col*width+shift+.004,r=l+width-.008;let tile=clip(poly,d[0],d[1],-low);tile=clip(tile,-d[0],-d[1],high);tile=clip(tile,u[0],u[1],-l);tile=clip(tile,-u[0],-u[1],r);if(!tile.length||Math.abs(area(tile))<.00006)continue;
    const shade=.918+ctx.random()*.075;ctx.color(shade,shade*.997,shade*.985);const lift=ARCH.roofTile+(ctx.random()-.5)*.003,top=(x,z)=>planeAt(p,x,z)+lift+.022*(1-(x*d[0]+z*d[1]-low)/(step+.018));polySlab(e,tile,(x,z)=>top(x,z)-.017,top,true);
   }
  }
 }return e.finish();}
export function collider(ctx){const e=builder(ctx),frame=ctx.params.frame||'den',index=ctx.params.facet||0,p=(frame==='den'?mainPlanes():wingPlanes())[index];for(const poly of roofPieces(frame,index))polySlab(e,poly,(x,z)=>planeAt(p,x,z),(x,z)=>planeAt(p,x,z)+ARCH.roofTile);}
