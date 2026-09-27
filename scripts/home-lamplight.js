import { LAMPLIGHT,lampTargets } from './lib/data/home-lamplight.js';
// The weather controller calls this at its existing two-second cadence. Seven bounded handle reads;
// no new update loop, no global light, no sky override, no writes to player appearance.
export function syncLamplight(ctx,night,rain){
  const target=lampTargets(night,rain);
  for(const site of LAMPLIGHT.sites){
    const light=ctx.getObject(site.id);
    if(!light?.light)continue;
    const settings=LAMPLIGHT[site.kind];
    if(Math.abs(light.light.intensity-target[site.kind])>=LAMPLIGHT.writeStep)light.light.intensity=target[site.kind];
    if(light.light.distance!==settings.distance)light.light.distance=settings.distance;
    if(light.light.decay!==settings.decay)light.light.decay=settings.decay;
    if(light.state.lamplightColor!==target.color){light.light.color=target.color;light.state.lamplightColor=target.color;}
  }
}
