import { HOME } from '../lib/data/home.js';
export const ARCH = {
  floorY: HOME.floorY, foundation: -0.45, wall: 0.2, eave: 3.25, plasterTop: 3.28,
  mainPitch: 0.5, wingPitch: 0.64, overhang: 0.42, roofDeck: 0.09, roofTile: 0.125,
  plankWidth: 0.245, plankLength: 1.92, plankGap: 0.003, roofCourse: 0.255, shingleWidth: 0.455,
  den: HOME.den, wingOrigin: HOME.wingOrigin, wingYaw: HOME.wingYaw,
  chimney: { x:0.6, z:5.1, w:0.88, d:1.0, bottom:3.18, top:5.78, cap:6.06 },
  textures: {
    oak:'scripts/tex-home-architecture-wood.js?species=oak',
    walnut:'scripts/tex-home-architecture-wood.js?species=walnut',
    deck:'scripts/tex-home-architecture-wood.js?species=deck',
    plaster:'scripts/tex-home-architecture-plaster.js',
    stone:'scripts/tex-home-architecture-stone.js',
    shingles:'scripts/tex-home-architecture-shingles.js'
  }
};
export const ROOMS = {
  den: HOME.den,
  board: [[0,0],[5,0],[5,5],[0,5]],
  spare: [[0,5],[5,5],[5,9],[0,9]],
  wing: [[0,0],[5,0],[5,9],[0,9]]
};
export const WALLS = [
  { id:'den-front', frame:'den', a:[0,0], b:[5,0], inside:1, gable:true,
    windows:[{a:0.35,b:2.65,sill:0.85,top:2.85,spring:2.04,arch:true}],
    doors:[{a:HOME.frontDoor.x0,b:HOME.frontDoor.x1,top:HOME.frontDoor.height,kind:'front'}] },
  { id:'den-left', frame:'den', a:[0,0], b:[0,6], inside:-1, windows:[],doors:[] },
  { id:'den-back', frame:'den', a:[0,6], b:[6,6], inside:-1,
    windows:[{a:2.05,b:4.2,sill:0.9,top:2.55}],doors:[] },
  { id:'den-hip-wall', frame:'den', a:[6,6], b:[9.2,4.2],inside:-1,windows:[],doors:[] },
  { id:'wing-shared', frame:'wing', a:[0,0],b:[0,9],inside:-1,windows:[],
    doors:[{a:HOME.boardOpening.v0,b:HOME.boardOpening.v1,top:HOME.boardOpening.height,kind:'board'},
           {a:HOME.spareDoor.v0,b:HOME.spareDoor.v1,top:HOME.spareDoor.height,kind:'spare'}] },
  { id:'wing-front', frame:'wing', a:[0,0],b:[5,0],inside:1,gable:true,
    windows:[{a:0.7,b:4.3,sill:0.82,top:2.67}],doors:[] },
  { id:'wing-right', frame:'wing', a:[5,0],b:[5,9],inside:1,
    windows:[{a:0.75,b:3.6,sill:0.85,top:2.65}],doors:[{a:6.45,b:7.55,top:2.4,kind:'square'}] },
  { id:'wing-rear', frame:'wing', a:[0,9],b:[5,9],inside:-1,gable:true,
    windows:[{a:0.75,b:4.3,sill:0.86,top:2.64}],doors:[] },
  { id:'wing-partition', frame:'wing', a:[0,5],b:[5,5],inside:1,gable:true,windows:[],doors:[] }
];
export function wall(id) { return WALLS.find(r=>r.id===id) || WALLS[0]; }
export function planPoint(u,v) { const c=Math.SQRT1_2; return [ARCH.wingOrigin.x+(u+v)*c,ARCH.wingOrigin.z+(v-u)*c]; }
export function wingPoint(x,z) { const c=Math.SQRT1_2,dx=x-ARCH.wingOrigin.x,dz=z-ARCH.wingOrigin.z; return [(dx-dz)*c,(dx+dz)*c]; }
export function mainPlanes() { const c=Math.SQRT1_2, h=ARCH.eave, p=ARCH.mainPitch,L=Math.hypot(1.8,3.2); return [[p,0,h],[-p*c,p*c,h+5*p*c],[-p*1.8/L,-p*3.2/L,h+30*p/L],[0,-p,h+6*p]]; }
export function wingPlanes() { const c=Math.SQRT1_2,p=ARCH.wingPitch,h=ARCH.eave; return [[p*c,-p*c,h-5*p*c],[-p*c,p*c,h+p*(5+5*c)]]; }
export function planeAt(p,x,z) { return p[0]*x+p[1]*z+p[2]; }
export function roofAt(frame,x,z) { if(frame==='wing') return ARCH.eave+ARCH.wingPitch*Math.min(x,5-x); return Math.min(...mainPlanes().map(p=>planeAt(p,x,z))); }
export const DOORS = {
  front:{ id:'home-front-door', hinge:'home-front-door-hinge', frame:'den', at:[3.06,0,-0.045], fixedYaw:0, width:1.06, height:2.32, bottom:0.035, depth:0.074, closedYaw:180, openYaw:90, open:false, opening:1.1 },
  spare:{ id:'home-spare-door', hinge:'home-spare-door-hinge', frame:'wing', at:[0,0,6.43], fixedYaw:-90, width:1.16, height:2.32, bottom:0.035, depth:0.074, closedYaw:0, openYaw:-100, open:false, opening:1.2 }
};
