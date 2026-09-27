// A catalog piece that does one thing when pressed (templates/den-catalog.js): E beside it flips its one param (`state.toggle`) —
// a lamp's light, a drawer, the record, the board game's box, a book, the cat bed's cushion — or, where `state.max` is set (the
// easel), counts it on and back to a fresh start. A lamp's light and the record's sound follow the param; nothing runs between presses.
export function onSpawn(ctx){
  show(ctx);
  ctx.on('press',(ctx)=>{
    const s=ctx.self.state,p=ctx.self.primitive.params;
    if(s.max)p[s.toggle]=((p[s.toggle]|0)+1)%(s.max+1);
    else p[s.toggle]=p[s.toggle]?0:1;
    show(ctx);
  });
}
function show(ctx){
  const me=ctx.self,s=me.state,on=!!me.primitive.params[s.toggle];
  if(s.on!==on)s.on=on;
  if(s.light){
    const light=ctx.getObject(me.id+'/'+s.light),v=on?s.lightOn:0;
    if(light?.light&&light.light.intensity!==v)light.light.intensity=v;
  }
  if(s.clip){
    if(on&&!me.audio)me.audio={kind:'clip',clip:s.clip,gain:s.gain??.22,loop:true,spatial:true,refDistance:3,maxDistance:14,bus:'Music'};
    else if(!on&&me.audio)me.audio=null;
  }
}
