import {fx,pop,attr,range,curve,time,vec3,box,curl,sprite} from 'builtin/fx';
// A few gulls cross the lake view now and then, left to right, in twos and threes; wings morph between two drawings.
const UP='M0 18 Q13 2 26 14 Q28 16 30 14 Q43 2 56 18 Q43 10 30 21 Q28 23 26 21 Q13 10 0 18 Z';
const DOWN='M0 10 Q13 22 26 17 Q28 16 30 17 Q43 22 56 10 Q43 26 30 23 Q28 24 26 23 Q13 26 0 10 Z';
export function effect(ctx){
  const amount=Math.max(0,Math.min(1,ctx.params.amount??1));
  const flap=time().mul(attr('beat')).add(attr('phase')).sin().mul(.5).add(.5);
  return fx(pop('gulls',{
    spawn:{on:box({halfExtents:[1,3.5,16]}),burst:{count:[2,3],every:[22,48]}},
    lifetime:range(46,56),
    init:{v:vec3(range(3.6,4.4),range(-.08,.08),range(-.25,.25)),phase:range(0,6.283),beat:range(3.1,3.9),size:range(.62,.82)},
    accel:curl(.03).mul(.18),
    size:attr('size'),frame:flap,color:vec3(.2,.21,.24),
    alpha:curve([0,0],[.04,1],[.96,1],[1,0]).mul(amount),
    render:sprite({textures:[UP,DOWN],blend:'alpha'})
  }));
}
