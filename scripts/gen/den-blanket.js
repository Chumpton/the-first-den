import {BLANKET as D} from '../lib/data/den-blanket.js';
import {paint} from './den-furniture-mesh.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function curve(t){
 const k=Math.min(D.profile.length-2,Math.floor(t)),u=t-k,u2=u*u,u3=u2*u;
 const a=D.profile[Math.max(0,k-1)],b=D.profile[k],c=D.profile[k+1],d=D.profile[Math.min(D.profile.length-1,k+2)];
 return b.map((_,j)=>.5*(2*b[j]+(-a[j]+c[j])*u+(2*a[j]-5*b[j]+4*c[j]-d[j])*u2+(-a[j]+3*b[j]-3*c[j]+d[j])*u3));
}
export function blanketPoint(u,t,p){
 const q=curve(clamp(t,0,D.profile.length-1)),hang=clamp(-q[2]/.194,0,1),w=p.width;
 const x=u*w+.004*hang*Math.sin(u*Math.PI);
 const edge=Math.sqrt(Math.max(.004,(D.seatRadius+.005)**2-x*x))-D.seatOffsetZ;
 const ripple=D.restRipple*Math.sin((u+.5)*Math.PI)**2*(.75+.25*Math.sin(t*.55));
 const y=(p.seatY??D.seatY)+q[2]+ripple+hang*hang*(D.tipRipple*Math.cos(u*Math.PI*3+.4)+u*.012);
 const z=q[0]+q[1]*edge+hang*(D.foldRipple*Math.sin((u+.5)*Math.PI*4+.5)+.003*Math.sin(u*Math.PI*10));
 return [x,y,z];
}
const diff=(a,b)=>a.map((x,i)=>x-b[i]);
function normal(u,t,p){
 const a=diff(blanketPoint(u+.0001,t,p),blanketPoint(u-.0001,t,p));
 const b=diff(blanketPoint(u,t+.0001,p),blanketPoint(u,t-.0001,p));
 const n=[b[1]*a[2]-b[2]*a[1],b[2]*a[0]-b[0]*a[2],b[0]*a[1]-b[1]*a[0]],l=Math.hypot(...n)||1;
 return n.map(v=>v/l);
}
export function blanketGrid(p){
 const us=[-.5,-.5+D.hem/p.width];
 for(let i=1;i<D.across;i++)us.push(i/D.across-.5);
 us.push(.5-D.hem/p.width,.5);
 const count=(D.profile.length-1)*D.subdivisions,rows=[];
 let distance=0,last=null;
 for(let j=0;j<=count;j++){
  const t=j/D.subdivisions,center=blanketPoint(0,t,p);
  if(last)distance+=Math.hypot(...diff(center,last));last=center;
  rows.push(us.map(u=>{
   const at=blanketPoint(u,t,p),n=normal(u,t,p),half=D.thickness/2;
   return {at,n,top:at.map((v,k)=>v+n[k]*half),bottom:at.map((v,k)=>v-n[k]*half),uv:[(u+.5)*p.width,distance]};
  }));
 }
 return rows;
}
export function blanket(m,p){
 const rows=blanketGrid(p),cols=rows[0].length;
 m.ctx.smooth();
 function face(vertices,side){
  const n=[0,1,2].map(k=>vertices.reduce((v,a)=>v+a.n[k],0)*(side==='top'?1:-1));
  m.tri(vertices[0][side],vertices[1][side],vertices[2][side],n,vertices.slice(0,3).map(a=>a.uv));
  m.tri(vertices[0][side],vertices[2][side],vertices[3][side],n,[vertices[0].uv,vertices[2].uv,vertices[3].uv]);
 }
 for(let j=0;j<rows.length-1;j++)for(let i=0;i<cols-1;i++){
  const v=[rows[j][i],rows[j][i+1],rows[j+1][i+1],rows[j+1][i]];
  paint(m,i===0||i===cols-2?'cream':p.tone);face(v,'top');
  paint(m,'cream');face(v,'bottom');
 }
 // The selvedge joins the two faces along their normals, not a shifted copy
 // that becomes coplanar at a vertical drop. No raised rods or floating slab.
 paint(m,'cream');
 function hem(a,b,n){
  m.tri(a.top,b.top,b.bottom,n,[a.uv,b.uv,b.uv]);
  m.tri(a.top,b.bottom,a.bottom,n,[a.uv,b.uv,a.uv]);
 }
 for(let j=0;j<rows.length-1;j++){
  hem(rows[j][0],rows[j+1][0],[-1,0,0]);
  hem(rows[j][cols-1],rows[j+1][cols-1],[1,0,0]);
 }
 for(const j of [0,rows.length-1])for(let i=0;i<cols-1;i++)hem(rows[j][i],rows[j][i+1],[0,0,j?1:-1]);
 m.ctx.flat();
}
