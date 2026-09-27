import { LAMPLIGHT } from '../scripts/lib/data/home-lamplight.js';
// Freely movable home furniture. Spawning a new variation costs parameters, not a new generator.
const material={pbr:true,color:'#ffffff',roughness:.65};
const base={tags:['furniture','den-furniture'],material,physics:'static',behavior:'scripts/gen/den-furniture.js',castShadow:true,receiveShadow:true};
const primitive=(item,params={})=>({kind:'scripted',script:'scripts/gen/den-furniture.js',seed:17,params:{item,...params}});
const blueprint=(label,icon='armchair')=>({label,category:'First Den · Furniture',icon});
export const table={...base,primitive:primitive('table',{radius:.8,height:.74,wood:'oak'}),blueprint:blueprint('Round oak game table','circle'),state:{role:'board-table',radius:.8,topHeight:.74,closedBoxOnly:true}};
export const chair={...base,primitive:primitive('chair',{width:.55,depth:.55,height:.995,wood:'oak',linen:'flax'}),blueprint:blueprint('Oak & linen chair'),state:{role:'chair',seatHeight:.479,authoredWidth:.55,authoredDepth:.55,front:'-z'}};
export const shelf={...base,primitive:primitive('shelf',{length:3.12,depth:.35,height:.28,wood:'walnut'}),blueprint:blueprint('Walnut display shelf','shelves'),state:{role:'display-shelf',capacityLength:3.12,surfaceLocalY:.28}};
export const hearth={...base,primitive:primitive('hearth',{height:3.2}),blueprint:blueprint('Small limestone hearth','flame'),state:{role:'hearth',opening:'+x',flueLocal:{x:-.04,y:3.2,z:0},fireSocketLocal:{x:.21,y:.30,z:0},fireSocketReserved:'furniture-hearth-fire',fireboxInner:{x:[-.233,.35],y:[.172,.768],z:[-.295,.295]}}};
export const pendant={...base,physics:'none',castShadow:false,primitive:primitive('pendant',{radius:.255,drop:1.48}),blueprint:blueprint('Shaded brass pendant','lamp-ceiling'),state:{role:'pendant',lightLocalY:.08},children:[{id:'warm-light',tags:['furniture','den-practical-light'],feetPosition:{x:0,y:.08,z:0},light:{kind:'point',color:'#eee2d3',intensity:LAMPLIGHT.pendant.day,distance:LAMPLIGHT.pendant.distance,decay:LAMPLIGHT.pendant.decay,shadow:{enabled:true}}}]};
export const rug={...base,physics:'none',castShadow:false,primitive:primitive('rug',{radiusX:1.41,radiusZ:1.495}),blueprint:blueprint('Plain oval woven rug','circle'),state:{role:'rug'}};
export const stool={...base,primitive:primitive('stool',{radius:.26,height:.48,wood:'oak'}),blueprint:blueprint('Humble three-leg stool','armchair'),state:{role:'stool'}};
export const blanket={...base,physics:'none',castShadow:false,primitive:primitive('blanket',{width:.40,tone:'moss'}),blueprint:blueprint('Folded moss & cream blanket','layers'),state:{role:'folded-blanket'}};
export const box={...base,physics:'none',primitive:primitive('box',{width:.28,depth:.20,height:.078,tone:'teal'}),blueprint:blueprint('Blank cloth-bound game box','package'),state:{role:'closed-game-box',blank:true,closed:true}};
export const star={...base,physics:'none',primitive:primitive('star',{radius:.075}),blueprint:blueprint('Small brass star','star'),state:{role:'modest-ornament',earned:false}};
export const note={...base,physics:'none',castShadow:false,primitive:primitive('note',{width:.26,height:.19}),
  ui:'<div face="front" width="0.23m" offset="0.0015m" lit style="font-family:Georgia,serif;font-style:italic;font-size:30px;line-height:1.2;color:#3d2b1e;text-align:center;padding-top:16px">{{ state.words }}</div>',
  state:{role:'idea-note',words:'what will you make here?'}};
export const noteStake={...base,physics:'none',castShadow:true,primitive:primitive('stake',{height:.95}),state:{role:'note-stake'}};
export const plant={...base,physics:'none',tags:['furniture','den-furniture','den-plant'],behavior:'scripts/den-plant.js',primitive:primitive('plant',{growth:0,thirst:0,wet:1,pot:'limestone'}),blueprint:blueprint('Small potted plant','sprout'),state:{role:'plant',needs:'water every day or so'}};
export const wateringCan={...base,physics:'none',castShadow:true,tags:['furniture','den-furniture','interactable'],behavior:'scripts/den-can.js',primitive:primitive('can',{tone:'brass'}),blueprint:blueprint('Brass watering can','droplet'),state:{role:'watering-can',does:'E beside it waters the nearest plant'}};
