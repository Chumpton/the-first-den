import { FEEL } from './lib/data/home-feel.js';
import { HOME } from './lib/data/home.js';
import { nearestInteractable } from './lib/home-interaction.js';
import { sitPointsOf } from './gen/den-furniture.js';
function scratch(ctx) { const s=(ctx.session.homeWalk??={}); return s[ctx.self.id]??=( {distance:0,last:null} ); }
function inside(p,poly) { let hit=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++) { const a=poly[i],b=poly[j]; if((a[1]>p.z)!==(b[1]>p.z) && p.x<(b[0]-a[0])*(p.z-a[1])/(b[1]-a[1])+a[0]) hit=!hit; } return hit; }
function floorKind(ctx,p) {
  if(p.y<23.85 || p.y>24.3) {
    const ground=ctx.place.terrain.materialAt(p.x,p.z);
    const name=typeof ground==='string'?ground:(ground?.id || ground?.dominant || 'grass');
    return ['gravel','chalkrock','shoreline'].includes(name)?'stone':'grass';
  }
  const local={x:p.x+3,z:p.z+3};
  if(inside(local,HOME.den)) return 'wood';
  const dx=local.x-HOME.wingOrigin.x, dz=local.z-HOME.wingOrigin.z;
  const u=(dx-dz)*Math.SQRT1_2,v=(dx+dz)*Math.SQRT1_2;
  return u>=0&&u<=5&&v>=0&&v<=9?'wood':'stone';
}
// A seat of the furniture family (sitPointsOf) within reach is sat on; E or jump stands again in front of it. The body is its own
// writer: its parent becomes the seat and its feet the seat's point, and humanoid-locomotion holds the sit pose while it rides.
const SIT_REACH=1.6;
function worldYaw(ctx,o){let y=0,cur=o;for(let i=0;cur&&i<6;i++){y+=Number(cur.yaw)||0;const up=cur.parent;cur=up?ctx.getObject(typeof up==='string'?up:up.id):null;}return (y*Math.PI)/180;}
function nearestSeat(ctx,me){
  const p=me.worldFeetPosition||me.feetPosition;let best=null;
  for(const o of ctx.query({tags:['den-furniture'],radius:SIT_REACH+1.2,center:p})){
    const points=sitPointsOf(o.primitive?.params);if(!points.length)continue;
    const q=o.worldFeetPosition||o.feetPosition,y=worldYaw(ctx,o),c=Math.cos(y),s=Math.sin(y);
    for(const pt of points){const d=Math.hypot(q.x+pt.x*c+pt.z*s-p.x,q.z-pt.x*s+pt.z*c-p.z);if(d<=SIT_REACH&&(!best||d<best.d))best={o,pt,d};}
  }
  return best;
}
function standUp(ctx){
  const me=ctx.self,seat=ctx.getObject(me.state.seatedOn),pt=me.state.seatPoint||{x:0,z:0};
  me.state.seatedOn=null;
  if(!seat){me.parent=null;return;}
  const q=seat.worldFeetPosition||seat.feetPosition,y=worldYaw(ctx,seat),c=Math.cos(y),s=Math.sin(y),out=-.72;
  me.parent=null;
  me.feetPosition={x:q.x+pt.x*c+out*s,y:q.y+.04,z:q.z-pt.x*s+out*c};
}
export function onInput(ctx,input) {
  const me=ctx.self;
  if(me.state.seatedOn){if(input.pressed.interact||input.pressed.jump)standUp(ctx);return;}
  if(!input.pressed.interact) return;
  const nearest=nearestInteractable(ctx,me,input),seat=nearestSeat(ctx,me),p=me.worldFeetPosition||me.feetPosition;
  const q=nearest&&(nearest.worldFeetPosition||nearest.feetPosition),dNear=q?Math.hypot(q.x-p.x,q.z-p.z):Infinity;
  const touched=seat&&seat.d<=dNear?seat.o:nearest;
  if(touched)ctx.emit('haptic',{kind:'soft'},{audience:{player:me.id}});
  if(seat&&seat.d<=dNear){me.parent=seat.o.id;me.feetPosition={x:seat.pt.x,y:seat.pt.y,z:seat.pt.z};me.rotation={yaw:0};me.state.seatedOn=seat.o.id;me.state.seatPoint=seat.pt;return;}
  if(nearest) ctx.emit('press',{by:me.id},{to:nearest.id});
}
export function update(ctx,dt) {
  const state=scratch(ctx), p=ctx.self.feetPosition;
  if(ctx.self.parent) {state.last=null;return;}
  const old=state.last; state.last={x:p.x,y:p.y,z:p.z};
  if(!old) return;
  const moved=Math.hypot(p.x-old.x,p.z-old.z);
  if(!ctx.self.grounded || moved>2.5) {state.distance=0;return;}
  state.distance+=moved;
  if(state.distance>=FEEL.stepLength) {
    state.distance%=FEEL.stepLength;
    ctx.emit('playSound',{clip:FEEL.steps[floorKind(ctx,p)],position:p,volume:0.085,pitch:0.96+ctx.random()*0.08,maxDistance:8,mode:'restart'});
  }
  if(moved<0.001) ctx.sleep();
}
export function onOutOfBounds(ctx) {
  ctx.self.feetPosition={...HOME.spawn};ctx.self.velocity={x:0,y:0,z:0};return true;
}
