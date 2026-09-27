import { ARCH,mainPlanes,wingPlanes,planeAt,planPoint } from './home-architecture-data.js';
import { builder,paint,beam,roofDomain,facets,roofPieces,inside,clip } from './home-architecture-kit.js';
function unique(v){return v.sort((a,b)=>a-b).filter((x,i,a)=>!i||x-a[i-1]>1e-6);}
export function geometry(ctx){const e=builder(ctx),frames=['den','wing'];paint(e,ARCH.textures.walnut,'#e5d1ae',.87);
 for(const frame of frames){const domain=roofDomain(frame),other=roofDomain(frame==='den'?'wing':'den'),planes=frame==='den'?mainPlanes():wingPlanes();
  for(let i=0;i<domain.length;i++){const a=domain[i],b=domain[(i+1)%domain.length],dx=b[0]-a[0],dz=b[1]-a[1],cuts=[0,1];
   for(let j=0;j<other.length;j++){const q=other[j],r=other[(j+1)%other.length],ex=r[0]-q[0],ez=r[1]-q[1],den=ex*dz-ez*dx;if(Math.abs(den)>1e-7){const t=(ez*(a[0]-q[0])-ex*(a[1]-q[1]))/den;if(t>0&&t<1)cuts.push(t);}}
   for(let j=0;j<planes.length;j++)for(let k=j+1;k<planes.length;k++){const p=planes[j],q=planes[k],den=(p[0]-q[0])*dx+(p[1]-q[1])*dz;if(Math.abs(den)>1e-7){const t=-(planeAt(p,a[0],a[1])-planeAt(q,a[0],a[1]))/den;if(t>0&&t<1)cuts.push(t);}}
   const cc=unique(cuts);for(let j=0;j<cc.length-1;j++){const t0=cc[j],t1=cc[j+1],mid=(t0+t1)/2;if(inside(other,a[0]+mid*dx,a[1]+mid*dz))continue;const A=[a[0]+t0*dx,a[1]+t0*dz],B=[a[0]+t1*dx,a[1]+t1*dz],ha=Math.min(...planes.map(p=>planeAt(p,...A))),hb=Math.min(...planes.map(p=>planeAt(p,...B)));beam(e,[A[0],ha+.012,A[1]],[B[0],hb+.012,B[1]],.123,.218,.009);beam(e,[A[0],ha+.135,A[1]],[B[0],hb+.135,B[1]],.163,.048,.006);}
  }
 }
 paint(e,ARCH.textures.shingles,'#e8dac3',.88);const seen={};
 for(const frame of frames){const planes=frame==='den'?mainPlanes():wingPlanes();for(let f=0;f<planes.length;f++){const p=planes[f];for(const poly of roofPieces(frame,f,false))for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],m=[(a[0]+b[0])/2,(a[1]+b[1])/2],h=planeAt(p,...m);if(Math.hypot(a[0]-b[0],a[1]-b[1])<.08)continue;
    if(!planes.some((q,j)=>j!==f&&Math.abs(planeAt(q,...m)-h)<.00001))continue;
    const keys=[a,b].map(v=>v.map(n=>n.toFixed(4)).join(',')).sort(),key=keys.join('|');if(seen[key])continue;seen[key]=true;beam(e,[a[0],planeAt(p,...a)+.169,a[1]],[b[0],planeAt(p,...b)+.169,b[1]],.14,.084,.023);
   }}}
 // A real low valley: two lead-copper strips lie on the opposing pitches, not a fascia across the rooms.
 paint(e,null,'#655d49',.57,.55);const main=facets('den')[1].poly;
 let lo=-.4,hi=9.4;const a=planPoint(0,lo),b=planPoint(0,hi),dx=b[0]-a[0],dz=b[1]-a[1];
 for(let i=0;i<main.length;i++){const p=main[i],q=main[(i+1)%main.length],ex=q[0]-p[0],ez=q[1]-p[1],fa=ex*(a[1]-p[1])-ez*(a[0]-p[0]),fb=ex*(b[1]-p[1])-ez*(b[0]-p[0]);if(fa<0&&fb<0){hi=lo;break;}if((fa<0)!==(fb<0)){const v=-.4+9.8*fa/(fa-fb);if(fa<0)lo=Math.max(lo,v);else hi=Math.min(hi,v);}}
 if(hi>lo){for(const side of [-1,1]){const u=side*.128,A=planPoint(0,lo),B=planPoint(0,hi),C=planPoint(u,hi),D=planPoint(u,lo),sideLift=Math.abs(u)*(side<0?ARCH.mainPitch:ARCH.wingPitch);e.face([[A[0],ARCH.eave+.154,A[1]],[B[0],ARCH.eave+.154,B[1]],[C[0],ARCH.eave+sideLift+.154,C[1]],[D[0],ARCH.eave+sideLift+.154,D[1]]],[0,1,0]);}}
 return e.finish();}
export function collider(){return null;}
