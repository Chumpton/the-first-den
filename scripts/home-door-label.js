export function onSpawn(ctx){
  ctx.on('ui:use',(ctx,{by})=>{
    const hinge=ctx.self.state.hinge;
    if(hinge)ctx.emit('press',{by},{to:hinge});
  });
}
