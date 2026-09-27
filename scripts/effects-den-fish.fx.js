import {fx,pop,attr,range,curve,time,noise,vec3,disc,up,sphereDir,sprite,when} from 'builtin/fx';
// Now and then a fish leaps from the lake and falls back: a silver arc, a splash, one ring on the water.
const FISH='M0 10 Q10 1 30 3 Q40 4 46 8 L56 2 L53 10 L56 18 L46 12 Q40 16 30 17 Q10 19 0 10 Z';
const RING='M50 2 A48 48 0 1 1 49.9 2 Z M50 10 A40 40 0 1 0 50.1 10 Z';
const FALL=vec3(0,-9,0);
export function effect(ctx){
  const leap=3.3,flight=2*leap/9;
  const fish=pop('fish',{
    spawn:{on:disc({radius:12}),rate:noise(time().mul(.09)).mul(.035).add(.045)},
    lifetime:flight,
    init:{v:up(leap).add(vec3(range(-.7,.7),0,range(-.7,.7))),size:range(.13,.18)},
    accel:FALL,size:attr('size'),aspect:2.6,color:vec3(.8,.86,.9),alpha:1,
    render:sprite({texture:FISH,blend:'alpha',align:'velocity',lit:true})
  });
  const drops=pop('drops',{
    spawn:when(fish.dies,{count:9}),lifetime:range(.35,.7),
    init:{v:up(range(1.1,2.3)).add(sphereDir().mul(range(.3,.8))),size:range(.03,.055)},
    accel:FALL,size:attr('size'),color:vec3(.9,.95,1),alpha:curve([0,1],[1,0]),
    render:sprite({texture:'textures/droplet',blend:'alpha',align:'velocity',stretch:.02,lit:true})
  });
  const ring=pop('ring',{
    spawn:when(fish.dies,{count:1}),lifetime:1.8,
    size:curve([0,.25],[1,1.6]),color:vec3(.93,.97,1),alpha:curve([0,.75],[1,0]),
    render:sprite({texture:RING,blend:'alpha',align:'ground'})
  });
  return fx(fish,drops,ring);
}
