import { STONEWORK as S } from '../lib/data/home-portal-stonework.js';
import { V,face,prism,rect,area,triangulate,offsetPolygon,clipRect } from './home-garden-kit.js';
const TAU=Math.PI*2;
function round(r,n=48){return Array.from({length:n},(_,i)=>[Math.cos(i*TAU/n)*r,Math.sin(i*TAU/n)*r]);}
function xyPrism(c,p,front,back,b=0){
 const inset=b?offsetPolygon(p,b):p;
 const rings=b?[{p:inset,z:front},{p,z:front+b},{p,z:back-b},{p:inset,z:back}]:[{p,z:front},{p,z:back}];
 const s=area(p)>0?1:-1;
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<p.length;i++){
  const k=(i+1)%p.length,a=rings[j],b0=rings[j+1];
  face(c,[V(a.p[i][0],a.p[i][1],a.z),V(a.p[k][0],a.p[k][1],a.z),V(b0.p[k][0],b0.p[k][1],b0.z),V(b0.p[i][0],b0.p[i][1],b0.z)],V((p[k][1]-p[i][1])*s,(p[i][0]-p[k][0])*s,0));
 }
 for(const end of [0,rings.length-1])for(const t of triangulate(rings[end].p))face(c,t.map(i=>V(rings[end].p[i][0],rings[end].p[i][1],rings[end].z)),V(0,0,end===0?-1:1));
}
function sector(inner,outer,a,b,cy=0,segments=3){
 const p=[];
 for(let j=0;j<=segments;j++){const t=a+(b-a)*j/segments;p.push([Math.cos(t)*outer,cy+Math.sin(t)*outer]);}
 for(let j=segments;j>=0;j--){const t=a+(b-a)*j/segments;p.push([Math.cos(t)*inner,cy+Math.sin(t)*inner]);}
 return p;
}
function stone(c,index){c.albedo(S.limestone);c.color(S.colors[index%S.colors.length]);c.metalness(0);c.roughness(.91);c.emissive(null);}
function paving(c,r){
 c.albedo(S.limestone);c.color(S.mortar);c.roughness(.97);prism(c,round(r-.008),S.underside,-.016,.006);
 const inner=r-S.ringWidth,circle=round(inner-.012);
 // Staggered, clipped flags rather than a target of concentric rings.
 let row=0;
 for(let z=-2.16;z<inner;z+=.53,row++){
  const shift=row%2?.41:0;
  for(let x=-2.75+shift;x<inner;x+=.82){
   const p=clipRect(circle,x+.007,z+.007,x+.82-.007,z+.53-.007);
   if(p.length<3)continue;
   stone(c,Math.floor(c.random()*S.colors.length));
   const worn=p.map(v=>[v[0]+(c.random()-.5)*.009,v[1]+(c.random()-.5)*.009]);
   prism(c,worn,-.107,0,S.bevel);
  }
 }
 // One slim, individually jointed perimeter course; its outer arris is softly worn.
 for(let i=0;i<28;i++){
  const a=i*TAU/28+.003,b=(i+1)*TAU/28-.003;
  stone(c,i+3);const p=sector(inner,r,a,b,0,3);
  for(let k=0;k<4;k++){const t=a+(b-a)*k/3,rr=r-(i%4===0?.008:0);p[k]=[Math.cos(t)*rr,Math.sin(t)*rr];}
  prism(c,p,-.113,0,.008);
 }
 // Short edge seams follow real soil, never a raised dirt planter or a full dark halo.
 c.albedo(null);c.roughness(1);
 for(let i=0;i<34;i++){
  const a=.08+i*TAU/34;if(Math.sin(a)<-.6||i%3===0)continue;
  const r0=r+.012,r1=r+.037+(i%4)*.008,da=.013+(i%3)*.005;
  const p=sector(r0,r1,a-da,a+da,0,1);
  const points=p.map(v=>V(v[0],c.groundY(v[0],v[1])+.006,v[1]));
  c.color(i%3===1?S.moss:'#998c66');face(c,points,V(0,1,0));
 }
}
function arch(c,a){
 const ri=a.opening*.5,ro=a.outerRadius,f=a.z-a.depth*.5,b=a.z+a.depth*.5;
 // Deep, open jambs: seven separated courses, no wall spanning the doorway.
 for(const side of [-1,1]){
  for(let i=0;i<a.courses;i++){
   const y0=.16+i*(a.spring-.16)/a.courses+.006,y1=.16+(i+1)*(a.spring-.16)/a.courses-.006;
   const outside=ro+(i%3===0?.009:0),inside=ri;
   stone(c,i+(side>0?2:0));
   xyPrism(c,rect(side>0?inside:-outside,y0,side>0?outside:-inside,y1),f+(i%2)*.004,b,.014);
  }
  stone(c,2);xyPrism(c,rect(side>0?ri:-ro-.055,0,side>0?ro+.055:-ri,.135),f-.035,b+.035,.016);
  stone(c,0);xyPrism(c,rect(side>0?ri:-ro-.03,.135,side>0?ro+.03:-ri,.165),f-.022,b+.022,.008);
 }
 for(let i=0;i<a.voussoirs;i++){
  const gap=.0035,t0=i*Math.PI/a.voussoirs+gap,t1=(i+1)*Math.PI/a.voussoirs-gap,key=i===Math.floor(a.voussoirs/2);
  stone(c,key?2:i+1);
  xyPrism(c,sector(ri,ro,t0,t1,a.spring,4),f-(key?.047:(i%3===0?.005:0)),b+(key?.02:0),key?.014:.012);
 }
 // A hairline of weather-darkened brass is embedded on the face, outside the clear opening.
 c.albedo('scripts/tex-garden-brass.js');c.color(S.brass);c.metalness(.69);c.roughness(.56);
 const inlay=ri+.049,width=.012;
 for(const side of [-1,1])xyPrism(c,rect(side>0?inlay:-inlay-width,.18,side>0?inlay+width:-inlay,a.spring+.001),f-.003,f+.003,0);
 for(let i=0;i<39;i++)xyPrism(c,sector(inlay,inlay+width,i*Math.PI/39,(i+1)*Math.PI/39,a.spring,1),f-.003-(i>=18&&i<=20?.047:0),f+.003-(i>=18&&i<=20?.047:0));
 // Tiny stone-cut four-point star: a dark recessed seam surrounding a dull brass heart.
 const star=(r,w)=>[[0,a.spring+1.218+r],[w,a.spring+1.218+w],[r*.7,a.spring+1.218],[w,a.spring+1.218-w],[0,a.spring+1.218-r],[-w,a.spring+1.218-w],[-r*.7,a.spring+1.218],[-w,a.spring+1.218+w]];
 c.albedo(null);c.metalness(0);c.color('#8d7753');xyPrism(c,star(.091,.019),f-.0475,f-.046);
 c.color('#be9b5b');c.metalness(.35);c.roughness(.7);xyPrism(c,star(.073,.011),f-.048,f-.047);
}
function lantern(c){
 // Grounded ten-centimetre stone socket, with a small louvred honey-glass core.
 stone(c,3);prism(c,round(.14,8),-.10,-.025,.01);
 c.albedo('scripts/tex-garden-brass.js');c.color(S.brassDark);c.metalness(.68);c.roughness(.53);
 prism(c,round(.104,8),-.027,-.008,.004);
 c.albedo(null);c.color('#efd294');c.emissive(1.15,.68,.24);c.metalness(0);c.roughness(.4);
 prism(c,round(.068,8),-.006,.074,.004);c.emissive(null);
 c.albedo('scripts/tex-garden-brass.js');c.color(S.brass);c.metalness(.67);c.roughness(.48);
 for(let i=0;i<4;i++){const a=Math.PI*.25+i*Math.PI*.5,x=Math.cos(a)*.063,z=Math.sin(a)*.063;prism(c,rect(x-.006,z-.006,x+.006,z+.006),-.009,.080,.002);}
 prism(c,round(.092,8),.067,.084,.003);prism(c,round(.099,8),.088,.105,.004);prism(c,round(.036,8),.105,.119,.004);
}
export function geometry(c){c.flat();const r=c.params.radius??S.radius,a={...S.arch,...c.params.arch};if(c.params.part==='lantern'){lantern(c);return;}paving(c,r);arch(c,a);}
export function collider(c){
 if(c.params.part==='lantern')return null;
 const r=c.params.radius??S.radius,a={...S.arch,...c.params.arch},ri=a.opening/2,ro=a.outerRadius,f=a.z-a.depth/2,b=a.z+a.depth/2;
 prism(c,round(r,48),S.underside,0,0);
 for(const side of [-1,1]){
  xyPrism(c,rect(side>0?ri:-ro,0,side>0?ro:-ri,a.spring),f,b);
  xyPrism(c,rect(side>0?ri:-ro-.055,0,side>0?ro+.055:-ri,.165),f-.035,b+.035);
 }
 // Closed wedge sectors leave the actual hole open. A conservative circumscribed
 // inner polygon retains at least the authored 2m circle, even between stations.
 const steps=24,inner=ri/Math.cos(Math.PI/(2*steps));
 for(let i=0;i<steps;i++)xyPrism(c,sector(inner,ro,i*Math.PI/steps,(i+1)*Math.PI/steps,a.spring,1),f,b);
}
