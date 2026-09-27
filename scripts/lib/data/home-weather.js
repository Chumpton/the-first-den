export const WEATHER={
  dayMs:1440000,cycleMs:660000,blendMs:45000,startHour:16.7,
  phases:[
    {id:'fair',label:'Fair',duration:240000,cloud:.22,opacity:.68,wind:1.7,fogNear:220,fogFar:1250,rain:0,wet:0},
    {id:'clouding',label:'Clouding over',duration:120000,cloud:.78,opacity:.88,wind:3.2,fogNear:140,fogFar:930,rain:0,wet:.02},
    {id:'rain',label:'Gentle rain',duration:210000,cloud:.88,opacity:.94,wind:4.1,fogNear:65,fogFar:610,rain:1,wet:.64},
    {id:'clearing',label:'Clearing',duration:90000,cloud:.30,opacity:.72,wind:2.2,fogNear:180,fogFar:1180,rain:0,wet:.18}
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
