// The den's catalog: ready pieces in its own style (scripts/gen/den-catalog.js). Placing one is its row, no build. Each does one
// thing (`state.does`) and leaves one need open (`state.needs`) — the next idea to offer. A seat's `seat` param makes it sittable.
const material={pbr:true,color:'#ffffff',roughness:.65};
const tags=['furniture','den-furniture','den-catalog'];
const base={tags,material,physics:'static',castShadow:true,receiveShadow:true};
const piece=(item,params={})=>({kind:'scripted',script:'scripts/gen/den-catalog.js',seed:17,params:{item,...params}});
const blueprint=(label,icon)=>({label,category:'First Den · Catalog',icon});
const press=(role,toggle,does,needs,extra={})=>({tags:[...tags,'interactable'],behavior:'scripts/den-piece.js',state:{role,toggle,does,needs,...extra}});
export const couch={...base,primitive:piece('couch',{width:2,depth:.9,seat:.45}),blueprint:blueprint('Oak & linen couch','sofa'),state:{role:'couch',does:'E beside it sits; E again stands',needs:'a blanket for it'}};
export const armchair={...base,primitive:piece('armchair',{width:.82,depth:.86,seat:.44}),blueprint:blueprint('Reading armchair','armchair'),state:{role:'armchair',does:'E beside it sits; E again stands',needs:'a lamp to read by'}};
export const floorLamp={...base,...press('floor-lamp','lit','E switches it on and off','a little table beside it',{light:'lamp-light',lightOn:2.2}),primitive:piece('floorLamp',{lit:1}),blueprint:blueprint('Brass floor lamp','lamp'),
  children:[{id:'lamp-light',tags:['furniture'],feetPosition:{x:0,y:1.38,z:0},light:{kind:'point',color:'#ffd9a8',intensity:2.2,distance:4.5,decay:2,shadow:{enabled:false}}}]};
export const sideTable={...base,...press('side-table','open','E opens and shuts its drawer','something to keep in the drawer'),primitive:piece('sideTable',{open:0}),blueprint:blueprint('Walnut side table','table')};
export const bookshelf={...base,...press('bookshelf','out','E pulls a book out and puts it back','the empty top shelf filled with their own things'),primitive:piece('bookshelf',{out:0}),blueprint:blueprint('Walnut bookshelf','library')};
export const bed={...base,primitive:piece('bed',{width:1.6,depth:2.1,seat:.5}),blueprint:blueprint('Oak bed with a moss cover','bed'),state:{role:'bed',does:'E beside it sits on it; E again stands',needs:'a bedside lamp'}};
export const desk={...base,...press('desk','open','E opens and shuts its top drawer','a chair to sit at it'),primitive:piece('desk',{open:0}),blueprint:blueprint('Oak writing desk','pen-line')};
export const easel={...base,...press('easel','strokes','E paints the next stroke; after six, a fresh canvas','the finished painting hung on a wall',{max:6}),primitive:piece('easel',{strokes:0}),blueprint:blueprint('Painter\'s easel','palette')};
export const boardGame={...base,...press('board-game','open','E opens the box and sets out the board; E again packs it away','a friend to play with'),physics:'none',primitive:piece('boardGame',{open:0}),blueprint:blueprint('Cloth-bound board game','dice-5')};
export const recordPlayer={...base,...press('record-player','playing','E drops the needle and plays a record; E again lifts it','a shelf of records',
  {clip:'/cdn/moodboard-lowpoly-cozy/music-brushed-jazz-piano-upright-bass-instrumental-no-vocals-evening-loop.mp3',gain:.2}),physics:'none',primitive:piece('recordPlayer',{playing:0}),blueprint:blueprint('Walnut record player','disc-3')};
export const catBed={...base,...press('cat-bed','fluffed','E plumps its cushion','a cat to curl up in it'),physics:'none',primitive:piece('catBed',{fluffed:1}),blueprint:blueprint('Round cat bed','cat')};
