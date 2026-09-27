export const DAY={cycleMs:7200000,dayMs:5400000,nightMs:1800000,sunrise:6,sunset:18};
const mod=(n,d)=>((n%d)+d)%d;
export function epochAtHour(now,hour){
  const h=mod(hour,24);
  const elapsed=h>=DAY.sunrise&&h<DAY.sunset
    ? (h-DAY.sunrise)/(DAY.sunset-DAY.sunrise)*DAY.dayMs
    : DAY.dayMs+mod(h-DAY.sunset,24)/(24-DAY.sunset+DAY.sunrise)*DAY.nightMs;
  return now-elapsed;
}
export function dayAt(now,epoch){
  const elapsed=mod(now-epoch,DAY.cycleMs),base=epoch+Math.floor((now-epoch)/DAY.cycleMs)*DAY.cycleMs;
  const isDay=elapsed<DAY.dayMs,phase=isDay?'day':'night';
  const duration=isDay?DAY.dayMs:DAY.nightMs,startsAt=base+(isDay?0:DAY.dayMs);
  const startHour=isDay?DAY.sunrise:DAY.sunset,hours=isDay?DAY.sunset-DAY.sunrise:24-DAY.sunset+DAY.sunrise;
  const periodMs=duration*24/hours;
  return {phase,hour:mod(startHour+(now-startsAt)/duration*hours,24),nextAt:startsAt+duration,periodMs,epoch:startsAt-periodMs*startHour/24};
}
export function syncDay(ctx,force=false){
  const s=ctx.self.state,now=ctx.now();
  if(s.solarEpoch===undefined)s.solarEpoch=epochAtHour(now,ctx.place.atmosphere.timeOfDay);
  const d=dayAt(now,s.solarEpoch);
  if(!force&&s.solarPhase===d.phase&&s.solarNextAt===d.nextAt)return;
  ctx.place.atmosphere.cycle={periodMs:d.periodMs,epoch:d.epoch};
  s.solarPhase=d.phase;s.solarNextAt=d.nextAt;
  if(s.solarTimer)ctx.cancel(s.solarTimer);
  s.solarTimer=ctx.after(Math.max(.05,(d.nextAt-now)/1000),'advanceDay');
}
