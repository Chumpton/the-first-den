import {PORTAL as P} from './lib/data/home-portal.js';
import {recount} from './home-portal-glass.js';
export function onTriggerEnter(ctx,other){
 if(!ctx.place.players.some(p=>p.id===other.id))return;
 const root=ctx.getObject(P.id);if(!root)return;
 if(ctx.self.state.kind==='passage'){
  if(root.state.link)ctx.cross(other,root.state.link);
  return;
 }
 recount(ctx,root);
 const heard=ctx.session.portalHelloBy??(ctx.session.portalHelloBy={}),now=ctx.now();
 if(now-(heard[other.id]??-P.chimeCooldownMs)<P.chimeCooldownMs)return;
 heard[other.id]=now;
 ctx.emit('playSound',{clip:P.chime,position:root.worldFeetPosition,volume:P.chimeGain,maxDistance:7,mode:'restart'},{audience:{player:other.id}});
}
export function onTriggerExit(ctx,other){
 if(ctx.self.state.kind!=='approach'||!ctx.place.players.some(p=>p.id===other.id))return;
 const root=ctx.getObject(P.id);if(!root)return;
 recount(ctx,root,other.id);
}
export function onRefuse(ctx,other,verdict){ctx.emit('toast',{message:verdict.message,duration:3},{audience:{player:other.id}});}
