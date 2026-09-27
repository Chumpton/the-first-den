// Explicit planting only: no terrain marks, scatter clearance, path or house edits.
// Repeated variants share the garden's crafted geometry and seeded mesh palettes.
// Row: [variant, worldX, worldZ, yawDegrees]. Each root samples its own terrain.
export const VARIANTS = {
  b1:{template:'birch',params:{height:6.7,spread:2.5},seed:11,radius:3.25},
  b2:{template:'birch',params:{height:7.25,spread:2.65},seed:29,radius:3.40},
  b3:{template:'birch',params:{height:5.65,spread:2.12},seed:43,radius:2.90},
  b4:{template:'birch',params:{height:6.15,spread:2.28},seed:67,radius:3.05},
  sap:{template:'birch',params:{height:3.75,spread:1.45},seed:43,radius:2.30},
  m:{template:'planting',params:{kind:'meadow',rx:2.2,rz:1.25,tufts:104,flowers:6,grassHeight:.22,grassVariation:.14,flowerHeight:.42,flowerVariation:.15,flowerSize:1.35},seed:21,radius:2.37},
  d:{template:'planting',params:{kind:'meadow',rx:1.45,rz:.78,tufts:72,flowers:12,grassHeight:.22,grassVariation:.14,flowerHeight:.42,flowerVariation:.15,flowerSize:1.35},seed:24,radius:1.62},
  w:{template:'planting',params:{kind:'meadow',rx:3.15,rz:1.35,tufts:142,flowers:7,grassHeight:.22,grassVariation:.14,flowerHeight:.42,flowerVariation:.15,flowerSize:1.35},seed:25,radius:3.32},
  f:{template:'planting',params:{kind:'fern'},seed:31,radius:.80},
  r:{template:'rock',params:{w:1.4,h:.43,d:.95},seed:12,radius:.76},
  s:{template:'rock',params:{w:.79,h:.28,d:.61},seed:8,radius:.43},
  R:{template:'rock',params:{w:1.95,h:.59,d:1.3},seed:15,radius:1.05}
};
export const GROUPS = {
  'rear-west':[
    ['b1',-14,14.2,23],['b3',-10.5,16.1,151],['b2',-15.3,19.3,296],['b4',-10.8,20.4,79],
    ['w',-13.2,15.1,24],['m',-15.6,18.1,132],['d',-9.5,18.6,58],['m',-11.9,22.2,18],['d',-17.2,13.5,111],
    ['f',-13.8,13.6,30],['f',-14.4,13.9,195],['f',-16,18.7,76],['f',-15.5,19.5,243],
    ['R',-15.1,15.8,43],['s',-14.2,15.3,197],['r',-11.4,21.5,79]
  ],
  'rear-middle':[
    ['b3',5.5,24.3,26],['b1',9.1,26,113],['b2',6.2,29.7,213],['b4',12.1,28.2,301],
    ['w',7.5,26,27],['m',4.5,28.5,113],['d',11.9,25.8,177],['m',10.1,30.5,12],['d',5,22.4,31],
    ['f',5.9,23.6,51],['f',5.4,23.3,177],['f',9.3,26.7,303],['f',9.8,26.1,114],
    ['R',8.4,27.1,11],['s',7.45,27.3,59],['r',12.2,30.2,170]
  ],
  'rear-east':[
    ['b4',21,12.1,63],['b1',25.4,12.8,187],['b3',23.1,16.4,317],['b2',27.1,17.8,27],
    ['m',21.5,13.9,26],['w',25.1,16.2,69],['d',28.5,16.1,144],['m',26.3,20.6,4],['d',21.1,10.4,63],
    ['f',23.4,15.8,44],['f',22.7,15.9,211],['f',26.8,17.1,101],['f',27.4,17.4,279],
    ['r',22.1,17.4,55],['s',22.75,17.1,11],['R',26.8,14.5,107]
  ],
  'rear-low':[
    ['w',-3.2,17.5,13],['d',-.4,18.5,148],['r',-4.1,17.1,82],
    ['m',1.5,29.9,117],['d',-.2,31.2,21],['w',-6.8,36.4,44],['d',-9.4,37.1,169],
    ['w',16.8,23.5,127],['d',17.8,26.1,55],['r',17.3,24.2,19],
    ['w',8,43.2,2],['m',11,44.4,54],['d',5.1,42.8,68],['R',9.8,43.1,29],
    ['m',-15.8,43.5,145],['d',-14.2,45.2,24],['m',24.1,39.8,119],['w',19.3,52.8,39]
  ],
  'north-path':[
    ['m',-18.75,-13.5,152],['d',-19.8,-15.3,49],['r',-17.2,-13,113],['f',-17.3,-14.3,33],['f',-17.8,-14.6,149],
    ['w',-10.2,-20.2,57],['d',-11.5,-22.1,9],['s',-11.1,-19.7,68],
    ['m',-23.2,-22.6,123],['d',-24.1,-24.2,42],['R',-21.5,-22.9,71],['f',-22.2,-23.4,231],['f',-21.8,-23.7,64],
    ['m',-11.9,-30.5,84],['d',-10.2,-31.9,121],['r',-12.3,-31.2,170],['f',-12,-32.3,110],['f',-11.4,-32.6,17],
    ['w',-19.4,-38.7,82],['d',-20.4,-36.3,122],['r',-18.8,-39.4,26],
    ['m',-6.4,-43.2,154],['d',-5.9,-45.1,49],['s',-6.8,-44.3,22]
  ],
  'north-view':[
    ['w',-3.1,-16.7,17],['d',-.9,-18.1,117],['r',-2.1,-17.3,92],
    ['m',4.7,-20.4,143],['d',6.5,-21.3,28],['f',5.1,-20.3,84],['f',5.5,-20.7,231],
    ['w',-1.5,-28.2,31],['d',-3.9,-29.6,143],['R',-2.2,-28.7,34],
    ['m',6.2,-35.3,82],['d',4.8,-37.4,19],['s',6.4,-34.9,116],
    ['w',-1.9,-41.8,123],['d',.9,-43.7,161]
  ],
  'north-edges':[
    ['sap',-29.2,-27.6,123],['m',-28.7,-27.1,26],['d',-27.2,-29.3,59],['R',-29.1,-28.1,144],
    ['sap',16.1,-24.3,207],['m',15.5,-24.6,171],['d',14.8,-27.4,27],['f',16.5,-24.1,58],['f',16.1,-23.7,220],['r',15.1,-25.2,56],
    ['w',24.2,-38.2,118],['d',23,-40.1,62],['r',23.9,-38.8,124],
    ['m',-30.2,-43.3,22],['d',-28.9,-45.1,122],['w',12.1,-51.3,52]
  ]
};
export const ROWS=Object.entries(GROUPS).flatMap(([group,rows])=>rows.map((r,i)=>({id:'hillside-'+group+'-'+String(i+1).padStart(2,'0'),group,variant:r[0],x:r[1],z:r[2],yaw:r[3]})));
export const SCRIPTS={birch:'scripts/gen/home-garden-birch.js',planting:'scripts/gen/home-garden-planting.js',rock:'scripts/gen/home-garden-rock.js'};
