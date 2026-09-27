export const updateSchedule={every:{seconds:1}};
function sync(ctx){
 const h=ctx.place.atmosphere.timeOfDay;
 if(typeof h!=='number'||!Number.isFinite(h))return;
 const hour=((h%24)+24)%24, total=Math.floor(hour*60),s=ctx.self.state;
 s.hour=hour;s.sampledAt=ctx.now();s.hhmm=String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
 s.hourAngle=hour%12*30;s.minuteAngle=hour%1*360;
 ctx.self.bones.hour.roll=s.hourAngle;ctx.self.bones.minute.roll=s.minuteAngle;
}
export function onSpawn(ctx){sync(ctx);}
export function update(ctx){sync(ctx);}
