import {syncDay} from './lib/data/home-day.js';
import {syncLamplight} from './home-lamplight.js';
import {WEATHER,weatherAt} from './lib/data/home-weather.js';
const clamp=(x)=>Math.max(0,Math.min(1,x));
const round=(x,n=1000)=>Math.round(x*n)/n;
function apply(ctx){
  syncDay(ctx);
  const s=ctx.self.state;
  if(s.epoch===undefined)s.epoch=ctx.now()-180000;
  const w=weatherAt(ctx.now(),s.epoch),a=ctx.place.atmosphere;
  a.clouds.density=round(w.cloud);a.clouds.opacity=round(w.opacity);a.clouds.speed=round(.7+w.rain*.65);
  a.wind.speed=round(w.wind);a.fog.near=round(w.fogNear,1);a.fog.far=round(w.fogFar,1);a.wet=round(w.wet);
  const rainAmount=round(w.rain,20);
  let rain=ctx.getObject('home-weather-rain');
  if(rainAmount>0){
    if(!rain){
      ctx.spawn('home-weather-rain',{tags:['weather','home-rain'],feetPosition:{x:0,y:24,z:0},audience:'all',
        fx:{script:'scripts/effects-den-rain.fx.js',params:{strength:rainAmount}},
        audio:{clip:WEATHER.rainClip,gain:WEATHER.rainGain*rainAmount,loop:true,spatial:false,bus:'Ambience'}});
      rain=ctx.getObject('home-weather-rain');
    }
    if(rain){if(rain.fx.params.strength!==rainAmount)rain.fx.params.strength=rainAmount;rain.audio.gain=round(WEATHER.rainGain*w.rain);}
  }else if(rain)ctx.destroy(rain.id);
  const hour=a.timeOfDay;
  const daylight=clamp((hour-5.5)/1.2)*clamp((19.5-hour)/1.2),night=1-daylight;
  const life=round(daylight*(1-w.rain*.85),10);
  for(const id of ['den-life-gulls','den-life-butterflies']){const o=ctx.getObject(id);if(o?.fx&&o.fx.params.amount!==life)o.fx.params.amount=life;}
  syncLamplight(ctx,night,w.rain);
  const birds=ctx.getObject('home-valley-air');
  if(birds?.audio)birds.audio.gain=round(WEATHER.dayGain*daylight*(1-w.rain*.85));
  let bed=ctx.getObject('home-weather-night');
  if(night>.01){
    if(!bed){ctx.spawn('home-weather-night',{tags:['weather','night-ambience'],feetPosition:{x:0,y:24,z:0},audience:'all',audio:{clip:WEATHER.nightClip,gain:WEATHER.nightGain*night,loop:true,spatial:false,bus:'Ambience'}});bed=ctx.getObject('home-weather-night');}
    if(bed?.audio)bed.audio.gain=round(WEATHER.nightGain*night*(1-w.rain*.55));
  }else if(bed)ctx.destroy(bed.id);
  const fireflyAmount=round(night*(1-w.rain*.38),10);
  for(let i=0;i<WEATHER.fireflySites.length;i++){
    const id='home-fireflies-'+i;let swarm=ctx.getObject(id);
    if(fireflyAmount>.02){
      if(!swarm){const [x,z]=WEATHER.fireflySites[i],y=ctx.place.terrain.heightAt(x,z);if(y!==null){ctx.spawn(id,{tags:['weather','night-fireflies'],feetPosition:{x,y:y+.1,z},fx:{script:'scripts/effects-den-fireflies.fx.js',params:{amount:fireflyAmount}},state:{site:i}});swarm=ctx.getObject(id);}}
      if(swarm&&swarm.fx.params.amount!==fireflyAmount)swarm.fx.params.amount=fireflyAmount;
    }else if(swarm)ctx.destroy(id);
  }
  s.fireflyAmount=fireflyAmount;
  ctx.place.state.weather={kind:w.kind,label:w.label,rain:rainAmount,wet:round(w.wet),nextAt:Math.round(w.nextAt)};
  s.phase=w.kind;s.rain=rainAmount;s.hour=round(hour,60);s.night=round(night);s.checkedAt=ctx.now();
}
export function onSpawn(ctx){syncDay(ctx,true);apply(ctx);}
export const updateSchedule={every:{seconds:2}};
export function update(ctx){apply(ctx);}

export function advanceDay(ctx){syncDay(ctx,true);}
