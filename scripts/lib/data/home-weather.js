export const WEATHER={
  dayMs:1440000,cycleMs:660000,blendMs:45000,startHour:16.7,
  // always a nice day (2026-09-27, owner's ask): one fair phase, no clouding or rain
  phases:[
    {id:'fair',label:'Fair',duration:660000,cloud:.12,opacity:.62,wind:1.5,fogNear:260,fogFar:1350,rain:0,wet:0}
  ],
  rainClip:'/cdn/moodboard-lowpoly-cozy/sfx-rain-falling-on-leaves-and-distant-roof-loop.mp3',
  nightClip:'/cdn/moodboard-lowpoly-cozy/sfx-lakeside-crickets-water-rustling-birches-night-loop.mp3',
  rainGain:.11,nightGain:.075,dayGain:.12,
  fireflySites:[[-6,-7],[4,-11],[-8,-13],[8,-15],[-4,-21],[-11,-24],[5,-25],[14,-18]]
};
export function weatherAt(now,epoch){
  const elapsed=((now-epoch)%WEATHER.cycleMs+WEATHER.cycleMs)%WEATHER.cycleMs;
  let start=0,index=0;
  for(let i=0;i<WEATHER.phases.length;i++){if(elapsed<start+WEATHER.phases[i].duration){index=i;break;}start+=WEATHER.phases[i].duration;}
  const target=WEATHER.phases[index],previous=WEATHER.phases[(index+WEATHER.phases.length-1)%WEATHER.phases.length];
  const raw=Math.min(1,Math.max(0,(elapsed-start)/WEATHER.blendMs)),t=raw*raw*(3-2*raw),mix=(k)=>previous[k]+(target[k]-previous[k])*t;
  return {kind:target.id,label:target.label,phase:index,cloud:mix('cloud'),opacity:mix('opacity'),wind:mix('wind'),fogNear:mix('fogNear'),fogFar:mix('fogFar'),rain:mix('rain'),wet:mix('wet'),nextAt:now+(start+target.duration-elapsed)};
}
