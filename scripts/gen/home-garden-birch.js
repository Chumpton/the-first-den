import { GARDEN as G } from '../../templates/home-garden.js';
import { V, tube, face } from './home-garden-kit.js';
import { add, scale, cross, normalize } from 'builtin/vec3';
// A folded pointed leaf costs two triangles, so whole sprays stay cheap.
function birchLeaf(c,center,direction,length,width,roll){
  const a=normalize(direction),b=normalize(cross(a,V(0,1,0))),n=normalize(cross(b,a));
  const w=add(scale(b,Math.cos(roll)),scale(n,Math.sin(roll))),normal=normalize(cross(w,a));
  const rib=add(center,scale(normal,width*.08)),tip=add(rib,scale(a,length*.52)),base=add(rib,scale(a,-length*.48));
  const left=add(center,scale(w,width*.5)),right=add(center,scale(w,-width*.5));
  face(c,[base,left,tip],normal);face(c,[tip,right,base],normal);
}
function trunk(h){return[V(0,-.09,0),V(.035,h*.17,-.018),V(-.028,h*.37,.04),V(.085,h*.57,.035),V(.16,h*.77,-.03),V(.23,h*.95,.08),V(.31,h,0)];}
function branchData(c,h,s){const result=[];for(let i=0;i<G.birch.branches;i++){const a=i*2.39996323+.22*c.random(),y=h*(.31+i*.071),len=s*(.69+c.random()*.28)*(1-i*.045),root=V(.02+i*.02,y,.02);result.push({a,len,root,end:V(root.x+Math.cos(a)*len,Math.min(h*.96,y+h*(.19+c.random()*.07)),root.z+Math.sin(a)*len)});}return result;}
export function geometry(c){
  const h=c.params.height??6.7,s=c.params.spread??2.5;
  c.smooth();c.albedo('scripts/tex-garden-birch.js');c.color('#f4f0e5');c.roughness(.93);
  const t=trunk(h);tube(c,t,[.155,.116,.10,.079,.048,.022,.005],8);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const p=V(Math.cos(a)*.30,c.groundY(Math.cos(a)*.30,Math.sin(a)*.30)-.012,Math.sin(a)*.30);tube(c,[p,V(Math.cos(a)*.085,.16,Math.sin(a)*.085),V(0,.34,0)],[.031,.065,.084],5);}
  const branches=branchData(c,h,s),twigs=[];
  for(let i=0;i<branches.length;i++){
    const b=branches[i],mid=V(b.root.x+(b.end.x-b.root.x)*.42,b.root.y+h*.16,b.root.z+(b.end.z-b.root.z)*.42);
    c.color('#efeee2');tube(c,[b.root,mid,b.end],[.041*(1-i*.035),.025,.007],6);
    for(let j=0;j<G.birch.twigs;j++){
      const k=.39+j*.255,a=b.a+(j-1)*.68,root=V(b.root.x+(b.end.x-b.root.x)*k,b.root.y+(b.end.y-b.root.y)*k+.08,b.root.z+(b.end.z-b.root.z)*k);
      const length=.54+c.random()*.37,end=V(root.x+Math.cos(a)*length,root.y-.12-c.random()*.25,root.z+Math.sin(a)*length),bend=V(root.x+(end.x-root.x)*.48,root.y+.10,root.z+(end.z-root.z)*.48);
      c.color('#827e61');tube(c,[root,bend,end],[.010,.007,.002],4);twigs.push({root,bend,end,a});
    }
  }
  c.flat();c.albedo('scripts/tex-garden-leaf.js');c.roughness(.87);
  for(const twig of twigs)for(let i=0;i<G.birch.leaves;i++){
    // A patchy, drooping spray around each fine twig; never a closed canopy hull.
    const t0=c.random(),phase=c.random()*Math.PI*2,r=Math.sqrt(c.random());
    const along=(t0-.5)*.90,side=Math.cos(phase)*r*.39,up=Math.sin(phase)*r*.33;
    const mx=twig.root.x+(twig.end.x-twig.root.x)*.62,mz=twig.root.z+(twig.end.z-twig.root.z)*.62;
    const p=V(mx+Math.cos(twig.a)*along-Math.sin(twig.a)*side,twig.root.y+(twig.end.y-twig.root.y)*.62+up-t0*.06,mz+Math.sin(twig.a)*along+Math.cos(twig.a)*side);
    const a=twig.a+(c.random()-.5)*3.5;
    c.color(G.leafColors[Math.floor(c.random()*G.leafColors.length)]);
    birchLeaf(c,p,V(Math.cos(a),-.55-c.random()*1.5,Math.sin(a)),.21+c.random()*.11,.11+c.random()*.055,-1.15+c.random()*2.3);
  }
  // Upright, uneven leader sprays join the crown, leaving sky between branches.
  for(let i=0;i<156;i++){
    const y=h*(.70+c.random()*.31),a=i*2.39996323,r=(h-y)*.39+.08+c.random()*.27;
    c.color(G.leafColors[i%G.leafColors.length]);
    birchLeaf(c,V(.2+Math.cos(a)*r,y,Math.sin(a)*r),V(Math.cos(a),-.55-c.random(),Math.sin(a)),.24,.13,-1.1+c.random()*2.2);
  }
}
export function collider(c){const h=c.params.height??6.7;tube(c,trunk(h).slice(0,4),[.15,.116,.1,.08],6);}
