import { FEEL } from './data/home-feel.js';
import CAMERA from './data/camera.yml';
// E takes the interactable within reach that the camera looks at most squarely: the smallest angle between the camera's
// forward (the aim axes, the camera rig's eye over the feet) and the line from the eye to the thing's middle. Game boxes
// stand a few centimetres apart and one shelf above another, so the thing nearest the body is often not the one looked at.
// With no aim (a frame that carries none) the nearest thing to the feet is taken.
export function nearestInteractable(ctx, player, input) {
  const p=player.worldFeetPosition || player.feetPosition;
  if(!p) return null;
  const a=input?.axes || {}, sin=a.aimYawSin, cos=a.aimYawCos, pitch=(a.aimPitchN ?? 0)*1.2;
  const aimed=typeof sin==='number' && typeof cos==='number' && (sin!==0 || cos!==0);
  const eye={x:p.x, y:p.y+(CAMERA.eyeHeight ?? 1.6)*(player.effectiveScale?.y ?? 1), z:p.z};
  const f={x:-sin*Math.cos(pitch), y:Math.sin(pitch), z:-cos*Math.cos(pitch)};
  let nearest=null, best=Infinity;
  for(const o of ctx.query({tags:['interactable'],radius:FEEL.interactionReach,center:p})) {
    const q=o.worldFeetPosition || o.feetPosition;
    if(!q) continue;
    const d=Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z);
    if(d>FEEL.interactionReach+.01) continue;
    let s=d;
    if(aimed) {
      const c=o.bounds?.center || q, dx=c.x-eye.x, dy=c.y-eye.y, dz=c.z-eye.z, n=Math.hypot(dx,dy,dz) || 1;
      s=1-(dx*f.x+dy*f.y+dz*f.z)/n;
    }
    if(s<best) { nearest=o; best=s; }
  }
  return nearest;
}
