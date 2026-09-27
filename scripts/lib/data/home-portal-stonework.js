import { PORTAL } from './home-portal.js';
export const STONEWORK={
 radius:PORTAL.radius,top:0,underside:-.12,ringWidth:.15,joint:.012,bevel:.009,
 arch:{opening:PORTAL.arch.opening,spring:PORTAL.arch.spring,height:PORTAL.arch.height,depth:PORTAL.arch.depth,z:.30,outerRadius:1.4,courses:7,voussoirs:13},
 limestone:'scripts/tex-garden-limestone.js',
 colors:['#fff0cd','#f5e4be','#fff4d7','#f6e7c9','#efdab3','#fff0d1','#f6e1bc'],
 brass:'#a48243',brassDark:'#665335',moss:'#78805a',mortar:'#b6a78b',
 lights:[{id:'home-portal-lantern-left',x:-1.45,y:.10,z:-1.15},{id:'home-portal-lantern-right',x:1.45,y:.10,z:-1.15}],
 plantings:[
  {id:'home-portal-fern-left',template:'planting',x:-2.49,z:.13,seed:611,params:{kind:'fern'}},
  {id:'home-portal-fern-right',template:'planting',x:2.59,z:.92,seed:613,params:{kind:'fern'}},
  {id:'home-portal-daisies-left',template:'planting',x:-2.39,z:-1.23,seed:621,params:{kind:'meadow',rx:.32,rz:.48,tufts:9,flowers:5,grassHeight:.10,grassVariation:.07,flowerHeight:.18,flowerVariation:.08}},
  {id:'home-portal-daisies-right',template:'planting',x:2.26,z:-1.31,seed:629,params:{kind:'meadow',rx:.3,rz:.44,tufts:8,flowers:4,grassHeight:.10,grassVariation:.06,flowerHeight:.17,flowerVariation:.08}},
  {id:'home-portal-fieldstone-left',template:'rock',x:-2.18,z:.94,seed:641,params:{w:.52,h:.20,d:.37}},
  {id:'home-portal-fieldstone-right',template:'rock',x:2.32,z:.18,seed:647,params:{w:.40,h:.16,d:.32}},
  {id:'home-portal-birch-left',template:'birch',x:-3.7,z:1.8,seed:653,params:{height:4.7,spread:1.2}},
  {id:'home-portal-birch-right',template:'birch',x:3.4,z:3.0,seed:659,params:{height:5.1,spread:1.35}}
 ]
};
