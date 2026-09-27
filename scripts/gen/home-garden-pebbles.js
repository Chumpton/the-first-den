import { GARDEN as G } from '../../templates/home-garden.js';
import { V, rockHull } from './home-garden-kit.js';
export function geometry(c){
  const pts=c.params.points??[[0,0],[-5.1,-.3],[-9.1,-7.8]],count=c.params.count??G.pebbleCount;
  const lengths=pts.slice(1).map((b,i)=>Math.hypot(b[0]-pts[i][0],b[1]-pts[i][1])),total=lengths.reduce((a,b)=>a+b,0);
  c.flat();c.albedo('scripts/tex-garden-limestone.js');c.roughness(.97);
  for(let i=0;i<count;i++){
    let s=c.random()*total,k=0;while(k<lengths.length-1&&s>lengths[k]){s-=lengths[k];k++;}
    const a=pts[k],b=pts[k+1],l=lengths[k],t=s/l,dx=(b[0]-a[0])/l,dz=(b[1]-a[1])/l,side=(i%2?1:-1)*(.41+c.random()*.24),x=a[0]+(b[0]-a[0])*t-dz*side,z=a[1]+(b[1]-a[1])*t+dx*side;
    const size=.04+c.random()*.10;c.color(G.stoneColors[i%G.stoneColors.length]);rockHull(c,V(x,c.groundY(x,z),z),size,.015+c.random()*.026,size*.73,5,true);
  }
}
export function collider(){return null;}
