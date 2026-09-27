import {fx,pop,attr,range,curve,time,vec3,box,curl,drag,sphereDir,sprite,hdr} from 'builtin/fx';
export function effect(ctx){
 const amount=ctx.params.amount??1;
 const glow=time().mul(2.1).add(attr('phase')).sin().mul(.5).add(.5).pow(3).mul(.8).add(.12);
 return fx(pop('fireflies',{
   count:ctx.device.coarse?12:20,floor:'bounce',bounce:.25,lifetime:range(9,16),spawn:{on:box({halfExtents:[2.4,.65,2.4],lift:1.0})},wrap:[2.8,1.8,2.8],
   init:{v:sphereDir().mul(.14),phase:range(0,6.283),size:range(.016,.026)},
   accel:curl(.55).mul(.11).add(drag(.6)),size:attr('size').mul(glow.mul(.4).add(.8)),
   color:hdr(1.5,1.1,.31),alpha:curve([0,0],[.1,1],[.85,1],[1,0]).mul(glow).mul(amount),
   render:sprite({texture:'textures/soft-disc',blend:'add',soft:.04})
 }));
}
