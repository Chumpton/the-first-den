import {animate} from 'builtin/tween';
// The watering can: E beside it tips it and waters the nearest plant within reach — a shower over the pot, and the plant's
// own script takes the watering (scripts/den-plant.js).
const REACH=3.2;
export function onSpawn(ctx){
  ctx.on('press',(ctx,{by})=>{
    const me=ctx.self.worldFeetPosition||ctx.self.feetPosition;
    let best=null,near=REACH;
    for(const o of ctx.query({tags:['den-plant'],radius:REACH,center:me})){
      const q=o.worldFeetPosition||o.feetPosition,d=Math.hypot(q.x-me.x,q.z-me.z);
      if(d<near){near=d;best=o;}
    }
    animate(ctx,ctx.self,{'rotation.roll':[0,-40,-40,0]},{duration:1.6});
    if(!best){ctx.self.state.last='no plant near';return;}
    const q=best.worldFeetPosition||best.feetPosition;
    ctx.emit('fx',{position:{x:q.x,y:q.y+.45,z:q.z},script:'scripts/effects-den-water.fx.js'});
    ctx.emit('water',{by},{to:best.id});
    ctx.self.state.last='watered '+best.id;
  });
}
