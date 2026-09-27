// The chimney follows its actual hearth. Existing smoke drifts away when the fire is out.
export const updateSchedule={every:{seconds:1}};
function sync(ctx){
  const fire=ctx.getObject(ctx.self.state.fireId);
  const lit=fire&&fire.visible!==false&&fire.state.lit!==false&&fire.fx?.script&&!fire.fx.paused?1:0;
  if(ctx.self.fx.params.lit!==lit)ctx.self.fx.params.lit=lit;
}
export function onSpawn(ctx){sync(ctx);}
export function update(ctx){sync(ctx);}
