import {PORTAL as P} from './data/home-portal.js';
export function pathSamples(){
 const p=P.route,out=[];
 for(let i=0;i<p.length-1;i++){
  const a=p[Math.max(0,i-1)],b=p[i],c=p[i+1],d=p[Math.min(p.length-1,i+2)];
  const n=Math.max(5,Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/.25));
  for(let j=0;j<n;j++){
   const t=j/n,t2=t*t,t3=t2*t;
   out.push([0,1].map(k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3)));
  }
 }
 out.push(p[p.length-1]);let length=0;
 return out.map((p,i)=>{if(i)length+=Math.hypot(p[0]-out[i-1][0],p[1]-out[i-1][1]);return {x:p[0],z:p[1],d:length};});
}
export function pathFrame(points,d){
 let i=1;while(i<points.length-1&&points[i].d<d)i++;
 const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.z-a.z),t=Math.max(0,Math.min(1,(d-a.d)/(b.d-a.d||1)));
 return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,nx:-(b.z-a.z)/length,nz:(b.x-a.x)/length};
}
