import { ARCH,ROOMS } from './home-architecture-data.js';
import { builder,paint,polySlab,clip,rect,intersect,offset,inside } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx),poly=ROOMS[ctx.params.room||'den'];paint(e,ARCH.textures.oak,'#806039',.86);polySlab(e,poly,-.16,-.012);
 const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),step=ARCH.plankWidth;
 const nails=[];paint(e,ARCH.textures.oak,'#ffffff',.73);
 for(let row=0,z=minZ;z<maxZ-.001;row++,z+=step){const z1=Math.min(maxZ,z+step),start=minX-ARCH.plankLength+(row%3)*.641;
  for(let x=start;x<maxX;x+=ARCH.plankLength){const x1=x+ARCH.plankLength;let p=intersect(poly,rect(x+ARCH.plankGap/2,z+ARCH.plankGap/2,x1-ARCH.plankGap/2,z1-ARCH.plankGap/2));if(!p.length)continue;
   let top=offset(p,-.0035);if(!top.length)top=p;const shade=.929+ctx.random()*.071;ctx.color(shade,shade*.995,shade*.975);e.face(top.map(v=>[v[0],0,v[1]]),[0,1,0]);
   if(top.length===p.length){for(let k=0;k<p.length;k++){const j=(k+1)%p.length;e.face([[p[k][0],-.005,p[k][1]],[p[j][0],-.005,p[j][1]],[top[j][0],0,top[j][1]],[top[k][0],0,top[k][1]]],[p[j][1]-p[k][1],.4,p[k][0]-p[j][0]]);}}
   else polySlab(e,p,-.005,-.002,true);
   for(const a of [[x+.042,z+.051],[x1-.042,z1-.051]])if(inside(p,a[0],a[1]))nails.push(a);
  }}
 paint(e,null,'#8e6b43',.85);for(const p of nails){const r=.007;e.face([[p[0]-r,.0003,p[1]],[p[0],.0003,p[1]-r],[p[0]+r,.0003,p[1]],[p[0],.0003,p[1]+r]],[0,1,0]);}
 paint(e,null,'#55452f',.78,.15);for(const p of nails){const r=.0028;e.face([[p[0]-r,.0005,p[1]-r],[p[0]+r,.0005,p[1]-r],[p[0]+r,.0005,p[1]+r],[p[0]-r,.0005,p[1]+r]],[0,1,0]);}return e.finish();}
export function collider(ctx){const e=builder(ctx);polySlab(e,ROOMS[ctx.params.room||'den'],-.16,0);}
