import { ARCH,wall,roofAt } from './home-architecture-data.js';
import { builder,paint,beam,wallPoint,runFrame,wallRect,wallPrism,gableCuts } from './home-architecture-kit.js';
function rail(e,r,a,b,y,n,w,h){beam(e,wallPoint(r,a,y,n),wallPoint(r,b,y,n),w,h,.006);}
function post(e,r,s,y0,y1,n,w,d){const f=runFrame(r);beam(e,wallPoint(r,s,y0,n),wallPoint(r,s,y1,n),w,d,.007,[-f.dz,0,f.dx]);}
function archBand(e,r,cx,spring,rx,ry,t,n0,n1,count){for(let i=0;i<count;i++){const a=i*Math.PI/count,b=(i+1)*Math.PI/count;wallPrism(e,r,[[cx+(rx-t/2)*Math.cos(a),spring+(ry-t/2)*Math.sin(a)],[cx+(rx+t/2)*Math.cos(a),spring+(ry+t/2)*Math.sin(a)],[cx+(rx+t/2)*Math.cos(b),spring+(ry+t/2)*Math.sin(b)],[cx+(rx-t/2)*Math.cos(b),spring+(ry-t/2)*Math.sin(b)]],n0,n1);}}
export function geometry(ctx){const e=builder(ctx),r=wall(ctx.params.run),L=runFrame(r).L;paint(e,ARCH.textures.walnut,'#fff7e9',.77);
 const cuts=[0,...(r.doors||[]).flatMap(d=>[d.a,d.b]),L].sort((a,b)=>a-b);
 for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1],m=(a+b)/2;if((r.doors||[]).some(d=>m>d.a&&m<d.b))continue;for(const n of [-.116,.116]){rail(e,r,a,b,.073,n,.042,.146);rail(e,r,a,b,.151,n,.048,.025);}}
 rail(e,r,-.045,L+.045,3.17,0,.244,.205);post(e,r,.018,.035,3.235,0,.165,.247);post(e,r,L-.018,.035,3.235,0,.165,.247);
 for(const o of r.windows||[]){const middle=(o.a+o.b)/2,w=o.b-o.a,spring=o.arch?o.spring:o.top;
  post(e,r,o.a-.014,o.sill-.04,spring,.0,.11,.255);post(e,r,o.b+.014,o.sill-.04,spring,0,.11,.255);
  rail(e,r,o.a-.09,o.b+.09,o.sill-.047,0,.36,.105);rail(e,r,o.a-.07,o.b+.07,o.sill-.145,.008,.265,.08);
  for(const n of [-.143,.143]){post(e,r,o.a-.047,o.sill-.075,spring,n,.034,.145);post(e,r,o.b+.047,o.sill-.075,spring,n,.034,.145);}
  if(o.arch){archBand(e,r,middle,o.spring,w/2,.81,.113,-.139,.139,32);for(const n of [-.158,.137])archBand(e,r,middle,o.spring,w/2+.032,.842,.036,n,n+.021,32);
    rail(e,r,o.a+.025,o.b-.025,o.spring-.009,0,.084,.062);
    const irx=.635,iry=.464;archBand(e,r,middle,o.spring,irx,iry,.046,-.045,.045,24);
    for(const angle of [Math.PI/4,Math.PI/2,Math.PI*3/4]){const a=wallPoint(r,middle+irx*Math.cos(angle),o.spring+iry*Math.sin(angle)),b=wallPoint(r,middle+(w/2-.065)*Math.cos(angle),o.spring+(.81-.065)*Math.sin(angle));beam(e,a,b,.038,.043,.003);}
    for(const s of [middle-irx,middle+irx])post(e,r,s,o.sill+.01,o.spring,0,.047,.06);
  }else{rail(e,r,o.a-.055,o.b+.055,o.top+.019,0,.26,.111);for(const n of [-.144,.144])rail(e,r,o.a-.06,o.b+.06,o.top+.052,n,.033,.145);
    const transom=o.top-.39;rail(e,r,o.a+.012,o.b-.012,transom,0,.076,.052);
    const split=w>2.6?[o.a+w*.25,o.a+w*.75]:[middle];for(const s of split)post(e,r,s,o.sill+.009,o.top-.009,0,.049,.069);
  }
 }
 for(const o of r.doors||[]){post(e,r,o.a-.047,.01,o.top+.036,0,.108,.28);post(e,r,o.b+.047,.01,o.top+.036,0,.108,.28);rail(e,r,o.a-.10,o.b+.10,o.top+.053,0,.29,.127);
  for(const n of [-.156,.156]){post(e,r,o.a-.064,.035,o.top+.04,n,.035,.144);post(e,r,o.b+.064,.035,o.top+.04,n,.035,.144);rail(e,r,o.a-.11,o.b+.11,o.top+.103,n,.042,.162);}
  paint(e,ARCH.textures.oak,'#fff6df',.76);rail(e,r,o.a-.015,o.b+.015,.009,0,.285,.018);paint(e,ARCH.textures.walnut,'#fff7e9',.77);
 }
 if(r.gable){const cuts=gableCuts(r);for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(b-a<.001)continue;const pa=wallPoint(r,a,0),pb=wallPoint(r,b,0),ya=roofAt(r.frame,pa[0],pa[2])-.032,yb=roofAt(r.frame,pb[0],pb[2])-.032;beam(e,wallPoint(r,a,ya),wallPoint(r,b,yb),.246,.145,.008);}
  let peak=0,at=0;for(const s of cuts){const p=wallPoint(r,s,0),h=roofAt(r.frame,p[0],p[2]);if(h>peak){peak=h;at=s;}}post(e,r,at,3.2,peak,0,.16,.19);
  for(const s of [at*.5,at+(L-at)*.5]){const p=wallPoint(r,s,0),h=roofAt(r.frame,p[0],p[2]);post(e,r,s,3.2,h,0,.10,.14);}
 }
 return e.finish();}
export function collider(){return null;}
