// Tiny solid kit for the road family: every face is wound away from an interior point, never eyeballed.
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export function Q(ctx,a,b,c,d,o){
  const n=cr(sub(b,a),sub(c,a)), m=[(a[0]+c[0])/2,(a[1]+c[1])/2,(a[2]+c[2])/2];
  if(dot(n,sub(m,o))>=0) ctx.quad(...a,...b,...c,...d); else ctx.quad(...a,...d,...c,...b);
}
export function T(ctx,a,b,c,o){
  const n=cr(sub(b,a),sub(c,a)), m=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
  if(dot(n,sub(m,o))>=0) ctx.tri(...a,...b,...c); else ctx.tri(...a,...c,...b);
}
// two convex loops of equal count (bottom, top) -> closed solid
export function solid(ctx,A,B,caps=true){
  const n=A.length, o=[0,0,0];
  for(const p of [...A,...B]){o[0]+=p[0];o[1]+=p[1];o[2]+=p[2];}
  o[0]/=2*n;o[1]/=2*n;o[2]/=2*n;
  for(let i=0;i<n;i++){const j=(i+1)%n; Q(ctx,A[i],A[j],B[j],B[i],o);}
  if(caps) for(let i=1;i<n-1;i++){T(ctx,A[0],A[i],A[i+1],o);T(ctx,B[0],B[i],B[i+1],o);}
}
// xz polygon extruded y0..y1, top scaled by s
export function prism(ctx,poly,y0,y1,s=1,caps=true){
  solid(ctx,poly.map(([x,z])=>[x,y0,z]),poly.map(([x,z])=>[x*s,y1,z*s]),caps);
}
export function box(ctx,x0,y0,z0,x1,y1,z1){prism(ctx,[[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>[x,z]),y0,y1);}
export function ngon(n,r,cx=0,cz=0,rot=0){const p=[];for(let i=0;i<n;i++){const a=rot+i/n*Math.PI*2;p.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}return p;}
// a gem: two pyramids on an n-gon
export function gem(ctx,cx,cy,cz,r,hUp,hDn,n=6){
  const ring=ngon(n,r).map(([x,z])=>[cx+x,cy,cz+z]), top=[cx,cy+hUp,cz], bot=[cx,cy-hDn,cz], o=[cx,cy,cz];
  for(let i=0;i<n;i++){const j=(i+1)%n;T(ctx,ring[i],ring[j],top,o);T(ctx,ring[j],ring[i],bot,o);}
}
