// A roadside rest (bench, well): E says its line and plays its sound. Words and clip live in the row's state.
export function onSpawn(ctx){
  ctx.on("press",(ctx,{by})=>{
    const s=ctx.self.state, p=ctx.self.feetPosition;
    ctx.emit("damageNumber",{position:{x:p.x,y:p.y+1.7,z:p.z},text:s.say??"A quiet moment by the road.",color:"#f2e6cf",size:0.8,lifetime:2.4});
    if(s.sound) ctx.emit("playSound",{clip:s.sound,position:p,volume:0.6,maxDistance:20});
  });
}
