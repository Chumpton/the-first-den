import { HOME, wing, plan } from './home.js';
import { WALLS } from '../../gen/home-architecture-data.js';
// World-ground root: children retain world X/Z and terrain-relative Y.
export const ROOT = 'home-window-garden';
export const WINDOWS = WALLS.flatMap(w => w.windows.map((o,i) => {
  const length=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);
  const tx=(w.b[0]-w.a[0])/length,tz=(w.b[1]-w.a[1])/length;
  const mid=(o.a+o.b)/2, convert=w.frame==='wing'?wing:plan;
  const p=convert(w.a[0]+tx*mid,w.a[1]+tz*mid,(o.sill+o.top)/2);
  const c=w.frame==='wing'?Math.SQRT1_2:1;
  const tangent=w.frame==='wing'?{x:(tx+tz)*c,z:(tz-tx)*c}:{x:tx,z:tz};
  return {windowId:w.id+(w.windows.length>1?'-'+(i+1):''), center:p,
    tangent, normal:{x:tangent.z*w.inside,z:-tangent.x*w.inside}, width:o.b-o.a,sill:HOME.floorY+o.sill};
}));
// Normal distance is from facade, not sill. Front terrace projects 2.4m;
// the low leaves start beyond its coping. Tangential bias makes uneven pairs.
export const SITES = [
  {windowId:'den-front',out:3.15,side:.6,tree:{out:3.3,side:-4.3,height:3.8,spread:1.05,seed:401}},
  {windowId:'den-back',out:2.05,side:-.55},
  {windowId:'wing-front',out:3.2,side:.55,tree:{out:3.25,side:5.3,height:4.3,spread:1.1,seed:419}},
  {windowId:'wing-right-1',out:2.1,side:-.55},
  {windowId:'wing-right-2',out:2.1,side:.45},
  {windowId:'wing-rear',out:2.25,side:-.5,tree:{out:2.8,side:4.9,height:3.6,spread:1.0,seed:443}}
];
export const ROWS = SITES.flatMap((site,i)=>{
  const w=WINDOWS.find(w=>w.windowId===site.windowId);
  function row(suffix,type,out,side,params,seed){return {id:'window-garden-'+site.windowId+'-'+suffix,windowId:site.windowId,
    worldX:w.center.x+w.normal.x*out+w.tangent.x*side, worldZ:w.center.z+w.normal.z*out+w.tangent.z*side,
    template:'templates/home-garden.js#'+type,params,seed,facadeDistance:out,tangentOffset:side};}
  const r=[row('stone','rock',site.out,site.side,{w:.82,h:.32,d:.64},301+i*13),
    row('fern','planting',site.out+.32,site.side-.6,{kind:'fern'},302+i*13),
    row('daisies','planting',site.out+.2,site.side+.65,{kind:'meadow',rx:.27,rz:.23,flowers:3,tufts:7,grassHeight:.25,grassVariation:.05,flowerHeight:.35,flowerVariation:.07},303+i*13)];
  if(site.tree){const t=site.tree;r.push(row('birch','birch',t.out,t.side,{height:t.height,spread:t.spread},t.seed));}
  return r;
});
