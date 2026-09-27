import {fx,pop,attr,range,curve,vec3,box,wind,sphereDir,sprite,when,up,gravity,drag} from 'builtin/fx';
import {HOME,wing} from './lib/data/home.js';
function polygonMask(p,points,margin){
  let mask=null;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;
    const edge=p.dot(vec3(nx,0,nz)).add(-nx*a[0]-nz*a[1]+margin).step(0);
    mask=mask?mask.mul(edge):edge;
  }
  return mask;
}
export function effect(ctx){
  const strength=Math.max(0,Math.min(1,ctx.params.strength??1));
  const p=attr('p');
  const den=HOME.den.map(([x,z])=>[x+HOME.root.x,z+HOME.root.z]);
  const wingPlan=[[0,0],[5,0],[5,9],[0,9]].map(([u,v])=>{const q=wing(u,v);return[q.x,q.z];});
  const roof=polygonMask(p,den,.45).max(polygonMask(p,wingPlan,.45)).mul(p.dot(vec3(0,-1,0)).add(29.3).step(0));
  const outside=roof.neg().add(1);
  const count=ctx.quality==='low'?2600:ctx.quality==='ultra'?13000:7500;
  const drops=pop('drops',{
    count,spawn:{on:box({halfExtents:[32,1,32],lift:15})},wrap:[32,0,32],lifetime:range(2.0,2.4),
    init:{v:vec3(0,-10,0).add(wind().mul(.24)).add(sphereDir().mul(.12)),size:range(.009,.015)},
    size:attr('size'),floor:'die',collide:'die',color:vec3(.66,.75,.82),
    alpha:curve([0,0],[.12,.48],[.83,.48],[1,0]).mul(strength).mul(outside),
    render:sprite({texture:'textures/droplet',blend:'alpha',align:'velocity',stretch:.022,soft:.08,lit:true})
  });
  const splashes=pop('splashes',{
    spawn:when(drops.dies,.10),lifetime:range(.14,.24),
    init:{v:up(.65).add(sphereDir().mul(.35)),size:range(.014,.026)},
    accel:gravity().mul(.45).add(drag(3)),floor:'die',collide:'die',size:attr('size').mul(curve([0,.5],[1,1.5])),
    color:vec3(.7,.78,.84),alpha:curve([0,.28],[1,0]).mul(strength).mul(outside),
    render:sprite({texture:'textures/soft-disc',blend:'alpha',soft:.03,lit:true})
  });
  return fx({follow:'camera'},drops,splashes);
}
