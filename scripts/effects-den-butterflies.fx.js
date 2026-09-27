import {fx,pop,attr,range,time,vec3,box,curl,drag,sphereDir,sprite} from 'builtin/fx';
// A handful of butterflies over the garden lawn by day; wings open and close between two drawings.
const OPEN='M30 22 Q18 2 4 6 Q0 14 12 22 Q2 30 10 38 Q20 38 30 26 Q40 38 50 38 Q58 30 48 22 Q60 14 56 6 Q42 2 30 22 Z';
const SHUT='M30 22 Q26 6 22 8 Q20 16 27 22 Q21 30 24 36 Q28 36 30 26 Q32 36 36 36 Q39 30 33 22 Q40 16 38 8 Q34 6 30 22 Z';
export function effect(ctx){
  const amount=Math.max(0,Math.min(1,ctx.params.amount??1));
  const beat=time().mul(attr('beat')).add(attr('phase')).sin().mul(.5).add(.5);
  return fx(pop('butterflies',{
    count:ctx.device.coarse?5:8,floor:'bounce',bounce:.4,
    spawn:{on:box({halfExtents:[5,.45,4],lift:.9})},wrap:[6,1.2,5],
    init:{v:sphereDir().mul(.45),phase:range(0,6.283),beat:range(7,10),size:range(.075,.1),hue:range(0,1)},
    accel:curl(.45).mul(1.2).add(drag(1.1)),
    size:attr('size'),frame:beat,
    color:vec3(1,.86,.42).mix(vec3(.96,.52,.22),attr('hue')),
    alpha:amount,
    render:sprite({textures:[OPEN,SHUT],blend:'alpha',lit:true})
  }));
}
