import { GARDEN as G } from '../../templates/home-garden.js';
import { V, tube, leaf, face } from './home-garden-kit.js';
function grass(c,x,y,z,h){
  for(let i=0;i<7;i++){const a=i*2.39996323+c.random()*.6,l=h*(.5+c.random()*.7),r=.06+c.random()*.08,dx=Math.cos(a),dz=Math.sin(a),w=.008+c.random()*.01;c.color(G.meadowColors[i%G.meadowColors.length]);face(c,[V(x-dz*w,y,z+dx*w),V(x+dz*w,y,z-dx*w),V(x+dx*r*.55,y+l*.62,z+dz*r*.55),V(x+dx*r,y+l,z+dz*r)],V(-dz,.3,dx));}
}
function daisy(c,x,y,z,h){
  c.albedo('scripts/tex-garden-leaf.js');c.color('#698449');tube(c,[V(x,y,z),V(x+.018,y+h*.5,z-.008),V(x+.04,y+h,z-.012)],[.006,.004,.003],4);
  leaf(c,V(x+.018,y+h*.35,z),V(.8,.32,.5),.13,.025,0);
  const top=V(x+.04,y+h,z-.012),flowerSize=c.params.flowerSize??1;
  c.albedo(null);c.color('#f3ecd1');
  for(let i=0;i<9;i++){const a=i*Math.PI*2/9,dx=Math.cos(a),dz=Math.sin(a),r=.029*flowerSize;leaf(c,V(top.x+dx*r,top.y+.004,top.z+dz*r),V(dx,.10,dz),.056*flowerSize,.019*flowerSize,0);}
  c.color('#d9ad48');tube(c,[V(top.x,top.y-.004,top.z),V(top.x,top.y+.009,top.z)],[.017*flowerSize,.014*flowerSize],7);
}
function fern(c){
  c.albedo('scripts/tex-garden-leaf.js');c.roughness(.9);
  for(let i=0;i<8;i++){
    const a=i*Math.PI*2/8+.13,len=.43+c.random()*.18,dx=Math.cos(a),dz=Math.sin(a),base=V(0,c.groundY(0,0)-.025,0);
    c.color('#6c8750');tube(c,[base,V(dx*len*.36,.38,dz*len*.36),V(dx*len,.18,dz*len)],[.009,.005,.001],4);
    for(let k=1;k<10;k++){const t=k/10,reach=len*t,y=Math.sin(t*Math.PI)*.25+.12,l=.18*Math.sin(t*Math.PI)+.025;
      for(const sign of [-1,1]){c.color(G.meadowColors[(k+i)%G.meadowColors.length]);const p=V(dx*reach-dz*sign*l*.26,y,dz*reach+dx*sign*l*.26);leaf(c,p,V(-dz*sign*.8+dx*.45,-.15,dx*sign*.8+dz*.45),l,.035,sign*.2);}
    }
  }
}
export function geometry(c){
  c.flat();c.roughness(.92);
  if(c.params.kind==='fern'){fern(c);return;}
  c.albedo('scripts/tex-garden-leaf.js');
  if(c.params.kind==='seams'){
    for(let i=0;i<G.seams.length;i++){const p=G.seams[i],x=p[0]-G.rootPlan[0],z=p[1]-G.rootPlan[1];grass(c,x,-.018,z,.11);if(i%2===0)daisy(c,x+.03,-.014,z,.18);}return;
  }
  const {rx=1,rz=.5,tufts=24,flowers=8,grassHeight=.17,grassVariation=.17,flowerHeight=.22,flowerVariation=.17}=c.params;
  for(let i=0;i<tufts+flowers;i++){
    const a=c.random()*Math.PI*2,r=Math.sqrt(c.random()),x=Math.cos(a)*r*rx,z=Math.sin(a)*r*rz,y=c.groundY(x,z)-.026;
    if(i<tufts){c.albedo('scripts/tex-garden-leaf.js');grass(c,x,y,z,grassHeight+c.random()*grassVariation);}else daisy(c,x,y,z,flowerHeight+c.random()*flowerVariation);
  }
}
export function collider(){return null;}
