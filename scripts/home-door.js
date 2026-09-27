import { FEEL } from './lib/data/home-feel.js';
import { labelId, labelPosition, edgeLabelPosition } from './lib/data/home-door-label.js';
// A door must never sweep a character along with its moving collider.
// If somebody occupies the shut leaf, wait until they step clear before it becomes solid.
export function syncDoorCollision(ctx,hinge=ctx.self) {
  const s=hinge.state,leaf=ctx.getObject(s.leafId); if(!leaf)return true;
  const closed=!s.open && Math.abs((s.currentYaw??s.closedYaw)-s.closedYaw)<FEEL.doorAngleTolerance;
  if(closed && leaf.physics?.body==='kinematic')return true;
  const b=closed?leaf.bounds:null,r=FEEL.doorClearance;
  const occupied=b && ctx.place.players.some(player=>{
    const p=player.worldFeetPosition || player.feetPosition;
    return p && p.x+r>b.min.x && p.x-r<b.max.x && p.z+r>b.min.z && p.z-r<b.max.z && p.y+FEEL.doorBodyHeight>b.min.y && p.y<b.max.y;
  });
  if(closed && !occupied)leaf.physics='kinematic';
  else if(leaf.physics && leaf.physics.body!=='none')leaf.physics='none';
  return !closed || !occupied;
}
// Shut, a plaque stands on each face and the leaf hides the far one; open, one plaque stands past the latch edge, where both sides read it.
function label(ctx) {
  ctx.interactPrompt(ctx.self.id,null);
  const s=ctx.self.state,verb=s.open?'Close':'Open',width=ctx.getObject(s.leafId)?.state?.width ?? 1.06;
  for(const side of [-1,1]){
    const plaque=ctx.getObject(labelId(s.leafId,side)); if(!plaque)continue;
    if(plaque.state.verb!==verb)plaque.state.verb=verb;
    const shown=!s.open || side<0, at=s.open?edgeLabelPosition(width):labelPosition(width,side), p=plaque.feetPosition;
    if(plaque.visible!==shown)plaque.visible=shown;
    if(!p || Math.abs(p.x-at.x)>1e-4 || Math.abs(p.y-at.y)>1e-4 || Math.abs(p.z-at.z)>1e-4)plaque.feetPosition=at;
  }
}
export function onSpawn(ctx) {
  const self=ctx.self, s=self.state;
  if (!(self.tags || []).includes('interactable')) self.tags=[...(self.tags || []),'interactable'];
  if (s.closedYaw === undefined) s.closedYaw=0;
  if (s.openYaw === undefined) s.openYaw=s.closedYaw+100;
  if (s.currentYaw === undefined) s.currentYaw=s.open ? s.openYaw : s.closedYaw;
  syncDoorCollision(ctx); self.rotation={yaw:s.currentYaw}; label(ctx);
  ctx.on('press',(ctx,{by})=> {
    const player=ctx.getObject(by); if(!player) return;
    const p=player.worldFeetPosition || player.feetPosition, q=ctx.self.worldFeetPosition;
    if(Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)>FEEL.interactionReach+0.4) return;
    const s=ctx.self.state;
    if(ctx.now()-(s.pressedAt || -1000)<450) return;
    s.pressedAt=ctx.now(); s.open=!s.open; syncDoorCollision(ctx); label(ctx);
    ctx.emit('playSound',{clip:s.open?FEEL.doorOpen:FEEL.doorClose,position:q,volume:0.24,maxDistance:12,mode:'restart'});
  });
}
export function update(ctx,dt) {
  const s=ctx.self.state, target=s.open?s.openYaw:s.closedYaw;
  const angle=s.currentYaw ?? target, gap=target-angle;
  if(Math.abs(gap)<FEEL.doorAngleTolerance) {
    if(angle!==target) {s.currentYaw=target;ctx.self.rotation={yaw:target};}
    if(syncDoorCollision(ctx))ctx.sleep(); else ctx.sleep(FEEL.doorRetrySeconds);
    return;
  }
  syncDoorCollision(ctx);
  s.currentYaw=angle+Math.sign(gap)*Math.min(Math.abs(gap),FEEL.doorSpeed*dt);
  ctx.self.rotation={yaw:s.currentYaw};
}
