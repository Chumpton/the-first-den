import { ARCH, mainPlanes, wingPlanes, planPoint, planeAt, roofAt } from './home-architecture-data.js';
export function builder(ctx) {
  const uvs=[];
  function face(points,normal,uv) {
    if(points.length<3)return;
    let pp=points.slice(),tt=uv?uv.slice():null;
    const a=pp[0], b=pp[1], c=pp[2];
    const n=[(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]),(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]),(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])];
    if(normal && n[0]*normal[0]+n[1]*normal[1]+n[2]*normal[2]<0){pp.reverse();if(tt)tt.reverse();}
    if(!tt){const nn=normal||n,ax=nn.map(Math.abs);tt=pp.map(p=>ax[1]>=ax[0]&&ax[1]>=ax[2]?[p[0],p[2]]:ax[0]>ax[2]?[p[2],p[1]]:[p[0],p[1]]);}
    for(let i=1;i<pp.length-1;i++){
      const ia=[0,i,i+1],v=ia.flatMap(k=>pp[k]);ctx.tri(...v);for(const k of ia)uvs.push(...tt[k]);
    }
  }
  return {ctx,face,finish:()=>({uvs})};
}
export function paint(e,texture,color='#ffffff',rough=0.8,metal=0) { e.ctx.albedo(texture);e.ctx.color(color);e.ctx.roughness(rough);e.ctx.metalness(metal);e.ctx.emissive(null); }
export function box(e,x0,y0,z0,x1,y1,z1) {
  if(x1<=x0||y1<=y0||z1<=z0)return;
  e.face([[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]],[0,0,-1]);
  e.face([[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],[0,0,1]);
  e.face([[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],[-1,0,0]);
  e.face([[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]],[1,0,0]);
  e.face([[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],[0,1,0]);
  e.face([[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],[0,-1,0]);
}
export function area(poly){let a=0;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;}
export function clip(poly,a,b,c){
  const out=[];if(!poly.length)return out;
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],fp=a*p[0]+b*p[1]+c,fq=a*q[0]+b*q[1]+c,ip=fp>=-1e-8,iq=fq>=-1e-8;
    if(ip)out.push(p);if(ip!==iq){const t=fp/(fp-fq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}
  const clean=[];for(const p of out){const q=clean[clean.length-1];if(!q||Math.hypot(p[0]-q[0],p[1]-q[1])>1e-7)clean.push(p);}
  if(clean.length>2&&Math.hypot(clean[0][0]-clean[clean.length-1][0],clean[0][1]-clean[clean.length-1][1])<1e-7)clean.pop();
  return clean.length>=3&&Math.abs(area(clean))>1e-8?clean:[];
}
export function intersect(poly,cutter){let p=poly;const cc=area(cutter)>=0?cutter:cutter.slice().reverse();for(let i=0;i<cc.length&&p.length;i++){const a=cc[i],b=cc[(i+1)%cc.length],dx=b[0]-a[0],dz=b[1]-a[1];p=clip(p,-dz,dx,dz*a[0]-dx*a[1]);}return p;}
export function subtract(poly,cutter){
  if(!cutter.length)return [poly];let p=poly;const out=[],cc=area(cutter)>=0?cutter:cutter.slice().reverse();
  for(let i=0;i<cc.length&&p.length;i++){const a=cc[i],b=cc[(i+1)%cc.length],dx=b[0]-a[0],dz=b[1]-a[1],c=dz*a[0]-dx*a[1];const outside=clip(p,dz,-dx,-c);if(outside.length)out.push(outside);p=clip(p,-dz,dx,c);}return out;
}
export function offset(poly,d){let p=[[-50,-50],[50,-50],[50,50],[-50,50]];const cc=area(poly)>=0?poly:poly.slice().reverse();for(let i=0;i<cc.length;i++){const a=cc[i],b=cc[(i+1)%cc.length],dx=b[0]-a[0],dz=b[1]-a[1];p=clip(p,-dz,dx,dz*a[0]-dx*a[1]+d*Math.hypot(dx,dz));}return p;}
export function rect(x0,z0,x1,z1){return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];}
export function inside(poly,x,z){for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];if((q[0]-p[0])*(z-p[1])-(q[1]-p[1])*(x-p[0])<-1e-7)return false;}return true;}
export function polySlab(e,poly,bottom,top,noBottom=false){
  if(!poly.length)return;const at=(y,p)=>typeof y==='function'?y(p[0],p[1]):y;
  e.face(poly.map(p=>[p[0],at(top,p),p[1]]),[0,1,0]);
  if(!noBottom)e.face(poly.map(p=>[p[0],at(bottom,p),p[1]]),[0,-1,0]);
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length];e.face([[p[0],at(bottom,p),p[1]],[q[0],at(bottom,q),q[1]],[q[0],at(top,q),q[1]],[p[0],at(top,p),p[1]]],[q[1]-p[1],0,p[0]-q[0]]);}
}
export function beam(e,a,b,w,h,bevel=0.006,reference=null){
  const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<0.0001)return;const k=d.map(v=>v/len),ref=reference||(Math.abs(k[1])>.98?[0,0,1]:[0,1,0]);
  let u=[k[1]*ref[2]-k[2]*ref[1],k[2]*ref[0]-k[0]*ref[2],k[0]*ref[1]-k[1]*ref[0]];const ul=Math.hypot(...u);u=u.map(v=>v/ul);
  const v=[u[1]*k[2]-u[2]*k[1],u[2]*k[0]-u[0]*k[2],u[0]*k[1]-u[1]*k[0]];
  const r=Math.min(bevel,w*.2,h*.2),ww=w/2,hh=h/2;
  const ring=r>0?[[-ww+r,-hh],[ww-r,-hh],[ww,-hh+r],[ww,hh-r],[ww-r,hh],[-ww+r,hh],[-ww,hh-r],[-ww,-hh+r]]:[[-ww,-hh],[ww,-hh],[ww,hh],[-ww,hh]];
  const A=ring.map(p=>a.map((n,i)=>n+u[i]*p[0]+v[i]*p[1])),B=ring.map(p=>b.map((n,i)=>n+u[i]*p[0]+v[i]*p[1]));
  e.face(A,k.map(v=>-v),ring);e.face(B,k,ring);
  let acc=0;for(let i=0;i<ring.length;i++){const j=(i+1)%ring.length,q=ring[i],s=ring[j],span=Math.hypot(s[0]-q[0],s[1]-q[1]),n=u.map((n,k)=>n*(q[0]+s[0])+v[k]*(q[1]+s[1]));
    e.face([A[i],A[j],B[j],B[i]],n,[[0,acc],[0,acc+span],[len,acc+span],[len,acc]]);acc+=span;}
}
export function runFrame(run){const dx=run.b[0]-run.a[0],dz=run.b[1]-run.a[1],L=Math.hypot(dx,dz);return {L,dx:dx/L,dz:dz/L,nx:-dz/L,nz:dx/L};}
export function wallPoint(run,s,y,n=0){const f=runFrame(run);return [run.a[0]+s*f.dx+n*f.nx,y,run.a[1]+s*f.dz+n*f.nz];}
export function wallPrism(e,run,poly,n0=-.1,n1=.1){
  if(poly.length<3)return;const f=runFrame(run);e.face(poly.map(p=>wallPoint(run,p[0],p[1],n0)),[-f.nx,0,-f.nz],poly);e.face(poly.map(p=>wallPoint(run,p[0],p[1],n1)),[f.nx,0,f.nz],poly);
  for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],ns=q[1]-p[1],ny=p[0]-q[0];e.face([wallPoint(run,p[0],p[1],n0),wallPoint(run,q[0],q[1],n0),wallPoint(run,q[0],q[1],n1),wallPoint(run,p[0],p[1],n1)],[ns*f.dx,ny,ns*f.dz]);}
}
export function wallRect(e,r,a,b,y0,y1,n0=-.1,n1=.1){if(b-a>.00001&&y1-y0>.00001)wallPrism(e,r,[[a,y0],[b,y0],[b,y1],[a,y1]],n0,n1);}
export function archTop(o,s){return o.spring+(o.top-o.spring)*Math.sqrt(Math.max(0,1-Math.pow((s-(o.a+o.b)/2)/((o.b-o.a)/2),2)));}
export function openingPoly(o,segments=32){if(!o.arch)return [[o.a,o.sill],[o.b,o.sill],[o.b,o.top],[o.a,o.top]];const p=[[o.a,o.sill],[o.b,o.sill],[o.b,o.spring]],cx=(o.a+o.b)/2,rx=(o.b-o.a)/2,ry=o.top-o.spring;for(let i=1;i<=segments;i++){const t=i*Math.PI/segments;p.push([cx+rx*Math.cos(t),o.spring+ry*Math.sin(t)]);}return p;}
export function gableCuts(run){const f=runFrame(run),planes=run.frame==='den'?mainPlanes():[[ARCH.wingPitch,0,ARCH.eave],[-ARCH.wingPitch,0,ARCH.eave+5*ARCH.wingPitch]],cuts=[0,f.L];
  const lines=planes.map(p=>[p[0]*f.dx+p[1]*f.dz,planeAt(p,run.a[0],run.a[1])]);for(let i=0;i<lines.length;i++)for(let j=i+1;j<lines.length;j++){const d=lines[i][0]-lines[j][0];if(Math.abs(d)>.00001){const t=(lines[j][1]-lines[i][1])/d;if(t>0&&t<f.L)cuts.push(t);}}return cuts.sort((a,b)=>a-b);
}
export function wallShell(e,r,segments=24){const L=runFrame(r).L,holes=[...(r.windows||[]),...(r.doors||[]).map(d=>({...d,sill:0}))].sort((a,b)=>a.a-b.a);let at=0;
  for(const o of holes){wallRect(e,r,at,o.a,0,ARCH.plasterTop);if(o.sill>0)wallRect(e,r,o.a,o.b,0,o.sill);
    if(!o.arch)wallRect(e,r,o.a,o.b,o.top,ARCH.plasterTop);
    else{const cx=(o.a+o.b)/2,rx=(o.b-o.a)/2,ry=o.top-o.spring;for(let i=0;i<segments;i++){const t0=Math.PI-i*Math.PI/segments,t1=Math.PI-(i+1)*Math.PI/segments,x0=cx+rx*Math.cos(t0),x1=cx+rx*Math.cos(t1),y0=o.spring+ry*Math.sin(t0),y1=o.spring+ry*Math.sin(t1);wallPrism(e,r,[[x0,y0],[x1,y1],[x1,ARCH.plasterTop],[x0,ARCH.plasterTop]]);}}
    at=o.b;
  }wallRect(e,r,at,L,0,ARCH.plasterTop);
  if(r.gable){const cuts=gableCuts(r);for(let i=0;i<cuts.length-1;i++){const a=cuts[i],b=cuts[i+1];if(b-a<.0001)continue;const pa=wallPoint(r,a,0),pb=wallPoint(r,b,0),ha=roofAt(r.frame,pa[0],pa[2])+.045,hb=roofAt(r.frame,pb[0],pb[2])+.045;wallPrism(e,r,[[a,3.22],[b,3.22],[b,hb],[a,ha]]);}}
}
export function roofDomain(frame){const h=ARCH.overhang;return frame==='den'?offset(ARCH.den,h):rect(-h,-h,5+h,9+h).map(p=>planPoint(p[0],p[1]));}
export function facets(frame){const planes=frame==='den'?mainPlanes():wingPlanes(),domain=roofDomain(frame);return planes.map((p,i)=>{let poly=domain;for(let j=0;j<planes.length;j++){if(i===j)continue;const q=planes[j];poly=clip(poly,q[0]-p[0],q[1]-p[1],q[2]-p[2]);}return {frame,index:i,plane:p,poly};});}
export function roofPieces(frame,index,cutChimney=true){const source=facets(frame)[index];if(!source)return [];let polys=[source.poly];const others=facets(frame==='den'?'wing':'den');
  for(const other of others){const d=source.plane,q=other.plane;const cutter=clip(other.poly,q[0]-d[0],q[1]-d[1],q[2]-d[2]);if(cutter.length)polys=polys.flatMap(p=>subtract(p,cutter));}
  if(cutChimney&&frame==='den'){const c=ARCH.chimney,cutter=rect(c.x-c.w/2+.008,c.z-c.d/2+.008,c.x+c.w/2-.008,c.z+c.d/2-.008);polys=polys.flatMap(p=>subtract(p,cutter));}
  return polys.filter(p=>p.length&&Math.abs(area(p))>.00001);
}
export function section(poly,axis,value){const points=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];if(Math.abs(a[axis]-value)<1e-6)points.push(a[1-axis]);if((a[axis]-value)*(b[axis]-value)<-1e-9){const t=(value-a[axis])/(b[axis]-a[axis]);points.push(a[1-axis]+(b[1-axis]-a[1-axis])*t);}}return points.length?[Math.min(...points),Math.max(...points)]:null;}
