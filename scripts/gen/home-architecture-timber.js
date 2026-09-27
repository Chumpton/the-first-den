import { ARCH,ROOMS,mainPlanes,roofAt } from './home-architecture-data.js';
import { builder,paint,beam,section } from './home-architecture-kit.js';
function mainRafter(e,z,w,h){const span=section(ROOMS.den,1,z);if(!span)return;const ps=mainPlanes(),cuts=[...span];for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const a=ps[i],b=ps[j];if(Math.abs(a[0]-b[0])>.00001){const x=-((a[1]-b[1])*z+a[2]-b[2])/(a[0]-b[0]);if(x>span[0]&&x<span[1])cuts.push(x);}}
 const cc=cuts.sort((a,b)=>a-b);for(let i=0;i<cc.length-1;i++){const x=cc[i],xx=cc[i+1];if(xx-x<.001)continue;beam(e,[x,roofAt('den',x,z)-h*.44,z],[xx,roofAt('den',xx,z)-h*.44,z],w,h,.007);}return {span,cuts:cc};}
export function geometry(ctx){const e=builder(ctx),frame=ctx.params.frame||'den';paint(e,ARCH.textures.walnut,'#f2e1c7',.83);
 if(frame==='den'){
  for(let z=.32;z<6;z+=.73)mainRafter(e,z,.088,.14);
  for(const z of [1.15,3.85]){const r=mainRafter(e,z,.188,.222);if(!r)continue;const [a,b]=r.span;beam(e,[a,3.19,z],[b,3.19,z],.214,.246,.009);
   let peak=0,px=0;for(const x of r.cuts){const h=roofAt('den',x,z);if(h>peak){peak=h;px=x;}}
   beam(e,[px,3.21,z],[px,peak-.06,z],.145,.158,.007);
   for(const x of [a+.08,b-.08]){const sign=x<px?1:-1;beam(e,[x,2.87,z],[x+sign*.63,3.21,z],.122,.133,.008);}
   beam(e,[px-.78,3.29,z],[px-.07,peak-.20,z],.101,.117,.006);beam(e,[px+.78,3.29,z],[px+.07,peak-.20,z],.101,.117,.006);
  }
 }else{
  for(let v=.25;v<9;v+=.715){beam(e,[0,3.186,v],[2.5,4.786,v],.086,.14,.006);beam(e,[2.5,4.786,v],[5,3.186,v],.086,.14,.006);}
  beam(e,[2.5,4.742,-.13],[2.5,4.742,9.13],.164,.209,.009);
  for(const v of [2.23,6.92]){beam(e,[0,3.19,v],[5,3.19,v],.207,.245,.008);beam(e,[0,3.16,v],[2.5,4.755,v],.175,.205,.008);beam(e,[2.5,4.755,v],[5,3.16,v],.175,.205,.008);beam(e,[2.5,3.25,v],[2.5,4.78,v],.151,.16,.007);
   for(const side of [0,1]){const x=side?5:0,dir=side?-1:1;beam(e,[x+dir*1.38,3.26,v],[2.5,4.57,v],.10,.117,.005);}}
 }
 return e.finish();}
export function collider(){return null;}
