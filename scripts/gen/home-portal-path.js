import {PORTAL as P} from '../lib/data/home-portal.js';
import {pathSamples,pathFrame} from '../lib/portal-path.js';
import {V,face,area} from './home-garden-kit.js';
const COLORS=['#ded5c2','#e5dece','#d3c9b6','#e9e2d4','#d9d0bf','#dfd8c8'];
function point(c,f,u,lift){const x=f.x+f.nx*u,z=f.z+f.nz*u;return V(x,c.groundY(x,z)+lift,z);}
function stone(c,poly){
 const s=area(poly.map(p=>[p.x,p.z]))>=0?1:-1,b=P.paving.bevel;
 const mid=poly.reduce((a,p)=>({x:a.x+p.x/poly.length,z:a.z+p.z/poly.length}),{x:0,z:0});
 const top=poly.map(p=>{const d=Math.hypot(mid.x-p.x,mid.z-p.z);return V(p.x+(mid.x-p.x)*b/d,p.y,p.z+(mid.z-p.z)*b/d);});
 for(let i=0;i<poly.length;i++){
  const j=(i+1)%poly.length,a=poly[i],q=poly[j],n=V((q.z-a.z)*s,0,(a.x-q.x)*s);
  face(c,[V(a.x,a.y-P.paving.thickness,a.z),V(q.x,q.y-P.paving.thickness,q.z),V(q.x,q.y-b,q.z),V(a.x,a.y-b,a.z)],n);
  face(c,[V(a.x,a.y-b,a.z),V(q.x,q.y-b,q.z),top[j],top[i]],V(n.x,.3,n.z));
 }
 for(let i=1;i<top.length-1;i++)face(c,[top[0],top[i],top[i+1]],V(0,1,0));
}
export function geometry(c){
 const points=pathSamples(),length=points[points.length-1].d,n=Math.ceil(length/P.paving.rowLength),stride=length/n,w=P.pathWidth/2,j=P.paving.joint;
 c.flat();c.albedo('scripts/tex-garden-limestone.js');c.roughness(.94);c.metalness(0);
 for(let i=0;i<n;i++){
  if(i*stride<P.paving.rusticStart){
   if(i%2===1)continue;
   const f=pathFrame(points,i*stride+.25),across=(c.random()-.5)*.32,rx=.31+c.random()*.09,rz=.32+c.random()*.13,poly=[];
   for(let k=0;k<6;k++){const angle=k/6*Math.PI*2+.16,r=.86+c.random()*.22;
    const u=across+Math.cos(angle)*rx*r,v=Math.sin(angle)*rz*r,x=f.x+f.nx*u+f.nz*v,z=f.z+f.nz*u-f.nx*v;
    poly.push(V(x,c.groundY(x,z)+P.paving.joinLift,z));
   }
   c.color(COLORS[(i+2)%COLORS.length]);stone(c,poly);continue;
  }
  const seam=(c.random()-.5)*.28;
  const a=pathFrame(points,i*stride+j/2),b=pathFrame(points,(i+1)*stride-j/2);
  for(const [lo,hi] of [[-w+j,seam-j/2],[seam+j/2,w-j]]){
   c.color(COLORS[Math.floor(c.random()*COLORS.length)]);
   stone(c,[point(c,a,lo,P.paving.lift),point(c,a,hi,P.paving.lift),point(c,b,hi,P.paving.lift),point(c,b,lo,P.paving.lift)]);
  }
 }
}
// Smooth, continuous walking surface under the small visual mortar joints.
export function collider(c){
 const p=pathSamples();for(let i=1;i<p.length;i++){
  const a=pathFrame(p,p[i-1].d),b=pathFrame(p,p[i].d),w=P.pathWidth/2;
  face(c,[point(c,a,-w,p[i-1].d<P.paving.rusticStart?P.paving.joinLift:P.paving.lift),point(c,a,w,p[i-1].d<P.paving.rusticStart?P.paving.joinLift:P.paving.lift),point(c,b,w,p[i].d<P.paving.rusticStart?P.paving.joinLift:P.paving.lift),point(c,b,-w,p[i].d<P.paving.rusticStart?P.paving.joinLift:P.paving.lift)],V(0,1,0));
 }
}
