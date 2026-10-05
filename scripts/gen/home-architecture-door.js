import { ARCH } from './home-architecture-data.js';
import { builder,paint,beam,box } from './home-architecture-kit.js';
import { softened } from "./soften.js";
function pin(e,x,y,z,rad=.012){const p=[];for(let i=0;i<8;i++){const t=i*Math.PI/4;p.push([x+rad*Math.cos(t),y+rad*Math.sin(t),z]);}e.face(p,[0,0,z<0?-1:1]);}
export const geometry = softened(function geometry(ctx){const e=builder(ctx),w=ctx.params.width||1.06,h=ctx.params.height||2.32,lo=.035,hi=lo+h,t=.074;
 paint(e,ARCH.textures.oak,'#f5e0b9',.79);box(e,-w,lo,-t/2, 0,hi,t/2);
 const count=6;for(let i=0;i<count;i++){const a=-w+.014+i*(w-.028)/count,b=a+(w-.028)/count-.003;beam(e,[(a+b)/2,lo+.028,0],[(a+b)/2,hi-.028,0],(w-.028)/count-.004,t+.006,.004);}
 paint(e,ARCH.textures.oak,'#fff2d4',.74);for(const z of [-.061,.061]){
  beam(e,[-w+.073,lo+.021,z],[-w+.073,hi-.021,z],.137,.058,.009);beam(e,[-.073,lo+.021,z],[-.073,hi-.021,z],.137,.058,.009);
  for(const y of [lo+.092,lo+.82,hi-.092])beam(e,[-w+.075,y,z],[-.075,y,z],.058,.154,.008);
  for(const panel of [[lo+.19,lo+.714],[lo+.925,hi-.19]]){
   const y0=panel[0],y1=panel[1],x0=-w+.158,x1=-.158;for(const xx of [x0,x1])beam(e,[xx,y0,z-.009*Math.sign(z)],[xx,y1,z-.009*Math.sign(z)],.025,.031,.004);
   for(const y of [y0,y1])beam(e,[x0,y,z-.009*Math.sign(z)],[x1,y,z-.009*Math.sign(z)],.025,.031,.004);
  }
 }
 // Interior ledged-and-braced joinery, exterior recessed fields, both seated into the plank leaf.
 paint(e,ARCH.textures.oak,'#ead3a6',.80);beam(e,[-w+.14,lo+.92,.073],[-.14,hi-.17,.073],.028,.097,.004);
 paint(e,null,'#343833',.55,.68);
 // Strap hinges lie on the top and bottom rails, flush with the stile, and wrap the hinge edge to the pin.
 for(const y of [lo+.092,hi-.092]){
  for(const z of [-.101,.101]){beam(e,[.003,y,z],[-Math.min(.52,w*.55),y,z],.022,.063,.006);pin(e,-.08,y,z+Math.sign(z)*.012);pin(e,-.36,y,z+Math.sign(z)*.012);}
  box(e,0,y-.0315,-.112,.006,y+.0315,.112);
  beam(e,[.006,y-.10,0],[.006,y+.10,0],.037,.040,.009);
 }
 for(const z of [-.101,.101]){const x=-w+.215;box(e,x-.035,1.012,z-.009,x+.035,1.197,z+.009);beam(e,[x,1.14,z],[x,1.14,z+Math.sign(z)*.054],.03,.03,.006);beam(e,[x,1.14,z+Math.sign(z)*.054],[x+.132,1.14,z+Math.sign(z)*.054],.031,.031,.007);pin(e,x,1.044,z+Math.sign(z)*.012,.006);pin(e,x,1.177,z+Math.sign(z)*.012,.006);}
 return e.finish();});
export function collider(ctx){const e=builder(ctx),w=ctx.params.width||1.06,h=ctx.params.height||2.32;box(e,-w,.035,-.038,0,.035+h,.038);}
