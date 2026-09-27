// A potted plant that lives on the world's clock. Its stage, when it was planted, watered and last grew are its own state, so
// they persist with the room. Watered, its soil darkens for a while; a day or so dry, it droops and wants water again; each
// watering after most of a day grows it a stage (0–4). It acts only when watered and when a timer it set comes due.
const DAY=86400,THIRST=DAY*1.1,WET=600,GROW=DAY*.75,TOP=4;
function show(ctx){
  const s=ctx.self.state,p=ctx.self.primitive.params,since=(ctx.now()-s.wateredAt)/1000;
  const thirst=since>=THIRST?1:0,wet=since<WET?1:0;
  if(p.growth!==s.growth)p.growth=s.growth;
  if(p.thirst!==thirst)p.thirst=thirst;
  if(p.wet!==wet)p.wet=wet;
  s.thirsty=thirst===1;
  if(s.timer)ctx.cancel(s.timer);
  const next=wet?WET-since:thirst?null:THIRST-since;
  s.timer=next===null?null:ctx.after(Math.max(1,next+.5),'check');
}
export function onSpawn(ctx){
  const s=ctx.self.state,now=ctx.now();
  if(s.plantedAt===undefined){s.plantedAt=now;s.wateredAt=now;s.grownAt=now;s.growth=s.growth??0;s.waterings=0;}
  ctx.on('water',(ctx)=>{
    const st=ctx.self.state,t=ctx.now();
    if((t-st.grownAt)/1000>=GROW&&st.growth<TOP){st.growth+=1;st.grownAt=t;}
    st.wateredAt=t;st.waterings=(st.waterings||0)+1;show(ctx);
  });
  show(ctx);
}
export function check(ctx){show(ctx);}
