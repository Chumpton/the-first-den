import {fx,pop,attr,range,curve,vec3,disc,sphereDir,sprite,when,up} from 'builtin/fx';
// The can's pour: a shower from the rose over the pot for about a second and a half, and a few splashes on the soil.
const FALL=vec3(0,-9,0);
export function effect(){
  const drops=pop('drops',{
    spawn:{on:disc({radius:.07}),rate:70},window:[0,1.4],lifetime:range(.24,.34),
    init:{v:vec3(0,-.6,0).add(sphereDir().mul(.12)),size:range(.012,.02)},
    accel:FALL,size:attr('size'),color:vec3(.72,.84,.92),alpha:curve([0,.9],[1,.7]),
    render:sprite({texture:'textures/droplet',blend:'alpha',align:'velocity',stretch:.03,lit:true})
  });
  const splash=pop('splash',{
    spawn:when(drops.dies,{probability:.35,count:1}),lifetime:range(.12,.22),
    init:{v:up(.4).add(sphereDir().mul(.25)),size:range(.01,.018)},
    accel:FALL,size:attr('size'),color:vec3(.8,.88,.95),alpha:curve([0,.7],[1,0]),
    render:sprite({texture:'textures/soft-disc',blend:'alpha',soft:.02,lit:true})
  });
  return fx(drops,splash);
}
