// The arch's glass follows the arch's one link (`home-portal`'s state.link) and who stands before it: while the arch is linked
// and someone is on its approach, the first game shows live through the opening, its light on the landing; otherwise the calm
// sea-glass it was drawn with, so the far world is drawn only for someone at the door. Its words ask for a first game until
// there is one. Nothing runs between writes: the root's update() sleeps, and the approach's trigger (scripts/home-portal.js)
// calls showGlass on enter and exit.
const VEIL='home-portal/home-portal-veil',WORDS='home-portal/home-portal-invitation';
const SEA_GLASS={color:'#ffffff',depthWrite:false,pbr:true,transparent:true};
export function showGlass(ctx,root){
  const link=root?.state.link||'',live=link&&(root.state.near|0)>0?link:'',veil=ctx.getObject(VEIL),words=ctx.getObject(WORDS);
  if(veil&&(veil.material?.view?.link||'')!==live)veil.material=live?{view:{link:live,spill:1.5,sound:.5}}:SEA_GLASS;
  if(words&&words.visible!==!link)words.visible=!link;
}
// Who stands on the approach, from ctx.place.players; while anyone does, the root looks again every 2 s, so a player who drops
// there stops counting at the next look; with nobody there it sleeps until a trigger writes.
const APPROACH='home-portal/home-portal-approach',HALF={x:3.3,z:3.8},SPAN={below:1,above:4.5};
export function recount(ctx,root,leaving){
  const c=ctx.getObject(APPROACH)?.worldFeetPosition;let n=0;
  if(c)for(const p of ctx.place.players){if(p.id===leaving)continue;const q=p.worldFeetPosition||p.feetPosition;if(q&&Math.abs(q.x-c.x)<=HALF.x&&Math.abs(q.z-c.z)<=HALF.z&&q.y>=c.y-SPAN.below&&q.y<=c.y+SPAN.above)n++;}
  if((root.state.near|0)!==n)root.state.near=n;
  showGlass(ctx,root);return n;
}
export function update(ctx){const n=recount(ctx,ctx.self);if(n>0)ctx.sleep(2);else ctx.sleep();}
