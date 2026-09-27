import {mesh,paint,solid,bevel,lathe,beam,rod} from './den-furniture-mesh.js';
// The den's catalog pieces, in the family's own joinery and palette (den-furniture-mesh.js). Feet at y 0, front toward −z, metres.
// A piece's one pressable part reads one param (`open`, `lit`, `out`, `playing`, `fluffed`, `strokes`), set by scripts/den-piece.js.
export const DEFAULTS={
  couch:{width:2,depth:.9,seat:.45,wood:'oak',linen:'flax',pillow:'moss'},
  armchair:{width:.82,depth:.86,seat:.44,wood:'oak',linen:'oat',pillow:'teal'},
  floorLamp:{height:1.56,shade:'cream',lit:1},
  sideTable:{width:.46,depth:.46,height:.56,wood:'walnut',open:0},
  bookshelf:{width:.9,depth:.3,height:1.8,wood:'walnut',out:0},
  bed:{width:1.6,depth:2.1,seat:.5,wood:'oak',cover:'moss'},
  desk:{width:1.2,depth:.6,height:.75,wood:'oak',open:0},
  easel:{height:1.7,strokes:0},
  boardGame:{open:0,tone:'teal'},
  recordPlayer:{playing:0},
  catBed:{radius:.32,fluffed:1,tone:'oat'}
};
const feet=(m,p,W,D,inset=.09,h=.1)=>{
  paint(m,p.wood);m.ctx.smooth();
  for(const x of [-W/2+inset,W/2-inset])for(const z of [-D/2+inset,D/2-inset])lathe(m,[[0,.022],[.02,.028],[h*.7,.032],[h,.028]],10,x,z);
  m.ctx.flat();
};
function upholstered(m,p,W,D,n,arm,back,backH){
  const base=.21,S=p.seat;
  feet(m,p,W,D);
  paint(m,p.wood);bevel(m,0,.1,0,W,.11,D,.012,'x');
  paint(m,p.linen);
  for(const s of [-1,1])bevel(m,s*(W/2-arm/2),base,0,arm,.36,D,.035,'z');
  paint(m,p.wood,'#e8d3b2');
  for(const s of [-1,1])bevel(m,s*(W/2-arm/2),base+.36,0,arm+.012,.028,D+.012,.01,'z');
  paint(m,p.linen);bevel(m,0,base,D/2-back/2,W-2*arm,backH,back,.04,'x');
  const cw=(W-2*arm)/n;
  m.ctx.smooth();
  for(let i=0;i<n;i++){
    const x=-W/2+arm+cw*(i+.5);
    paint(m,p.linen,i%2?'#f3ead4':'#ffffff');
    bevel(m,x,base,-back/2,cw-.014,S-base,D-back-.02,.05,'x');
    bevel(m,x,S,D/2-back-.075,cw-.024,backH-(S-base)-.06,.15,.06,'x');
  }
  if(p.pillow){paint(m,p.pillow);bevel(m,W/2-arm-Math.min(.2,cw/2),S,D/2-back-.2,.3,.28,.11,.06,'x');}
  m.ctx.flat();
}
function couch(m,p){upholstered(m,p,p.width,p.depth,p.width>1.5?3:2,.15,.2,.62);}
function armchair(m,p){upholstered(m,p,p.width,p.depth,1,.14,.18,.74);}
// A brass pole lamp with a linen drum; lit, the bulb and the shade glow (its child light is the pool).
function floorLamp(m,p){
  const H=p.height;
  paint(m,'iron');m.ctx.smooth();lathe(m,[[0,.155],[.012,.162],[.028,.15],[.042,.06],[.05,.03]],32);
  paint(m,'brass','#f1e2bf');rod(m,[0,.05,0],[0,H-.2,0],.011,10);
  lathe(m,[[.52,.02],[.54,.024],[.56,.02]],12);lathe(m,[[H-.22,.018],[H-.2,.03],[H-.18,.018]],12);
  paint(m,'#fff0c8');if(p.lit)m.ctx.emissive(1.7,1.15,.48);
  lathe(m,[[H-.2,.012],[H-.185,.03],[H-.16,.036],[H-.135,.03],[H-.12,.012]],16);
  m.ctx.emissive(null);paint(m,p.shade,p.lit?'#fff6e2':'#efe4cd');if(p.lit)m.ctx.emissive(.34,.24,.1);
  lathe(m,[[H-.3,.22],[H-.02,.18]],40,0,0,{caps:false});
  m.ctx.emissive(null);paint(m,'brass');lathe(m,[[H-.305,.222],[H-.295,.222]],40,0,0,{caps:false});lathe(m,[[H-.025,.182],[H-.015,.182]],40,0,0,{caps:false});
  m.ctx.flat();
}
function drawer(m,p,x,y,z,w,h,d,out){
  paint(m,p.wood,'#e9d4b3');bevel(m,x,y,z-out,w,h,d,.006,'x');
  paint(m,p.wood);bevel(m,x,y-.004,z-d/2-out-.006,w+.012,h+.008,.014,.004,'x');
}
function knob(m,x,y,z){paint(m,'brass');m.ctx.smooth();beam(m,[x,y,z],[x,y,z-.022],[[0,.007],[.5,.012],[1,.009]],10);m.ctx.flat();}
function taperedLegs(m,W,D,H,inset=.035){
  m.ctx.smooth();
  for(const x of [-W/2+inset,W/2-inset])for(const z of [-D/2+inset,D/2-inset])beam(m,[x*1.02,0,z*1.02],[x,H,z],[[0,.015],[.1,.018],[1,.024]],8);
  m.ctx.flat();
}
function sideTable(m,p){
  const W=p.width,D=p.depth,H=p.height,out=p.open?.18:0;
  paint(m,p.wood);taperedLegs(m,W,D,H-.03);
  bevel(m,0,H-.13,0,W-.05,.1,D-.05,.008,'x');
  bevel(m,0,H-.032,0,W,.032,D,.008,'x');
  paint(m,p.wood,'#e3cda9');bevel(m,0,H-.122,-out,W-.1,.078,D-.1,.005,'x');
  paint(m,p.wood);bevel(m,0,H-.126,-D/2+.02-out,W-.086,.086,.014,.004,'x');
  knob(m,0,H-.083,-D/2+.012-out);
}
const SPINES=['#7a5a3b','#35605b','#8b4034','#c7ad76','#4c6a3d','#2f3f5b','#b3683e','#d9cfb8','#5a3a2c'];
function bookshelf(m,p){
  const W=p.width,D=p.depth,H=p.height,t=.024;
  paint(m,p.wood);
  for(const s of [-1,1])bevel(m,s*(W/2-t/2),0,0,t,H,D,.006,'y');
  solid(m,0,.02,D/2-.008,W-t*2,H-.04,.012);
  const levels=[.04,.44,.84,1.24];
  for(const y of levels)bevel(m,0,y,0,W-t*2,t,D-.012,.004,'x');
  bevel(m,0,H-t,0,W+.02,t,D+.02,.006,'x');
  bevel(m,0,0,-D/2+.02,W-t*2,.04,.02,.004,'x');
  // Books on the lower three shelves; the top shelf is left open for the owner's own things.
  let k=0;
  for(let r=0;r<3;r++){
    const y=levels[r]+t;let x=-W/2+t+.02;
    const lean=r===1;
    while(x<W/2-t-.05){
      const bw=.022+((k*37)%5)*.006,bh=.2+((k*53)%7)*.022;
      if(lean&&x>W/2-t-.2)break;
      const pulled=p.out&&r===1&&k%9===3?.09:0;
      paint(m,SPINES[(k*5)%SPINES.length]);
      bevel(m,x+bw/2,y,-.01-pulled,bw,bh,D-.08,.003,'y');
      x+=bw+.004;k++;
    }
    if(lean){paint(m,'brass','#d1b989');bevel(m,W/2-t-.13,y,-.01,.012,.16,.12,.002,'y');}
  }
}
function bed(m,p){
  const W=p.width,D=p.depth;
  feet(m,p,W,D,.07,.14);
  paint(m,p.wood);
  for(const s of [-1,1])bevel(m,s*(W/2-.03),.14,0,.06,.16,D,.01,'z');
  bevel(m,0,.14,-D/2+.03,W,.16,.06,.01,'x');
  bevel(m,0,.14,D/2-.035,W+.06,.95,.07,.014,'x');
  paint(m,p.wood,'#ead6b6');bevel(m,0,1.09,D/2-.035,W+.1,.04,.09,.012,'x');
  bevel(m,0,.14,-D/2+.03,W+.04,.42,.06,.012,'x');
  m.ctx.smooth();paint(m,'cream');bevel(m,0,.26,.02,W-.08,.22,D-.14,.05,'x');
  paint(m,p.cover);bevel(m,0,.44,-.28,W-.02,.07,D-.72,.035,'x');
  paint(m,'cream','#f5eedc');bevel(m,0,.46,.1,W-.04,.055,.16,.03,'x');
  for(const s of [-1,1]){paint(m,'cream','#ffffff');bevel(m,s*W/4,.47,D/2-.3,W/2-.12,.13,.34,.06,'x');}
  m.ctx.flat();
}
function desk(m,p){
  const W=p.width,D=p.depth,H=p.height,out=p.open?.22:0,px=W/2-.22;
  paint(m,p.wood);
  m.ctx.smooth();for(const z of [-D/2+.04,D/2-.04])beam(m,[-W/2+.05,0,z],[-W/2+.045,H-.03,z],[[0,.016],[.12,.02],[1,.026]],8);m.ctx.flat();
  bevel(m,-W/2+.05,.12,0,.03,.04,D-.08,.004,'z');
  bevel(m,px,0,0,.4,H-.035,D-.04,.008,'y');
  bevel(m,-.1,H-.1,D/2-.04,W-.5,.07,.02,.004,'x');
  bevel(m,0,H-.035,0,W,.035,D,.008,'x');
  drawer(m,p,px,H-.2,-.02,.34,.13,D-.12,out);knob(m,px,H-.135,-D/2+.014-out);
  paint(m,p.wood);bevel(m,px,.12,-D/2+.016,.36,.4,.014,.004,'x');knob(m,px,.4,-D/2+.004);
  paint(m,'teal');bevel(m,-.25,H,-.02,.2,.018,.15,.004,'x');
  paint(m,'#f3e8cf');bevel(m,-.25,H+.018,-.02,.19,.002,.14,.001,'x');
  paint(m,'iron');m.ctx.smooth();lathe(m,[[H,.028],[H+.04,.03],[H+.05,.016],[H+.06,.012]],14,.12,.1);m.ctx.flat();
}
const PAINT=['#35605b','#c96f5a','#d8b25a','#4c6a3d','#7fa7c9','#8b4034'];
function easel(m,p){
  const H=p.height;
  paint(m,'oak');m.ctx.smooth();
  for(const s of [-1,1])beam(m,[s*.3,0,-.14],[s*.05,H,-.03],[[0,.02],[1,.016]],8);
  beam(m,[0,0,.42],[0,H*.94,.0],[[0,.018],[1,.014]],8);
  m.ctx.flat();paint(m,'oak','#ead5b3');
  bevel(m,0,.7,-.1,.66,.03,.07,.006,'x');bevel(m,0,H-.08,-.07,.2,.04,.04,.005,'x');
  const cy=.73,ch=.52,cw=.64,cz=-.1;
  paint(m,'#f4ecd8');bevel(m,0,cy,cz,cw,ch,.022,.004,'x');
  const z=cz-.0115,n=Math.max(0,Math.min(PAINT.length,p.strokes|0));
  for(let i=0;i<n;i++){
    const u=((i*0.618)%1)*.44-.22,v=((i*0.382+.2)%1)*.3+cy+.1,len=.16+.04*(i%3),w=.035,a=.35+i*.9;
    const dx=Math.cos(a)*len/2,dy=Math.sin(a)*len/2,nx=-Math.sin(a)*w/2,ny=Math.cos(a)*w/2;
    paint(m,PAINT[i]);
    m.face([[u-dx-nx,v-dy-ny,z],[u+dx-nx*.4,v+dy-ny*.4,z],[u+dx+nx*.4,v+dy+ny*.4,z],[u-dx+nx,v-dy+ny,z]],[0,0,-1]);
  }
  paint(m,'oak','#dcc29a');bevel(m,.2,.73,-.15,.18,.008,.12,.002,'x');
  for(let i=0;i<4;i++){paint(m,PAINT[i]);m.ctx.smooth();lathe(m,[[.738,.012],[.743,.009]],8,.14+i*.035,-.15);m.ctx.flat();}
}
// A cloth-bound board game: shut, its box; open, the board laid out with its pieces and the lid set beside it.
function boardGame(m,p){
  const w=.3,d=.3,h=.07;
  if(!p.open){
    paint(m,'walnut');bevel(m,0,0,0,w*.98,h*.78,d*.98,.006,'x');
    paint(m,p.tone);bevel(m,0,h*.72,0,w,h*.28,d,.006);
    paint(m,'brass','#c5ae81');bevel(m,0,h+.0006,0,w*.5,.0012,d*.12,.0004,'x');
    return;
  }
  paint(m,p.tone);bevel(m,.36,0,-.05,w,.02,d,.004,'x');
  paint(m,'walnut');bevel(m,0,0,0,.42,.012,.42,.004,'x');
  const n=6,s=.38/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){
    paint(m,(i+j)%2?'#4a3524':'#eadfc4');
    const x=-.19+s*(i+.5),z=-.19+s*(j+.5);
    m.face([[x-s/2,.0125,z-s/2],[x+s/2,.0125,z-s/2],[x+s/2,.0125,z+s/2],[x-s/2,.0125,z+s/2]],[0,1,0]);
  }
  m.ctx.smooth();
  for(const [i,j,t] of [[0,0,'teal'],[1,5,'teal'],[4,1,'cream'],[5,4,'cream'],[2,3,'teal']]){
    paint(m,t==='teal'?'#35605b':'#f1e6cc');
    lathe(m,[[.012,.014],[.018,.016],[.04,.009],[.05,.011],[.058,.006]],10,-.19+s*(i+.5),-.19+s*(j+.5));
  }
  m.ctx.flat();paint(m,'#f4ecd8');solid(m,.26,.012,.2,.022,.022,.022);
}
function recordPlayer(m,p){
  const W=.42,D=.34;
  paint(m,'walnut');bevel(m,0,0,0,W,.1,D,.01,'x');
  paint(m,'iron','#8f8778');solid(m,0,.1,0,W-.02,.004,D-.02);
  m.ctx.smooth();paint(m,'iron');lathe(m,[[.104,.15],[.11,.152],[.112,.148]],40,-.04,0);
  paint(m,'#1b1714');lathe(m,[[.112,.147],[.114,.147]],40,-.04,0);
  paint(m,p.playing?'#c96f5a':'#d8b25a');lathe(m,[[.1142,.045],[.1146,.045]],24,-.04,0);
  paint(m,'brass');lathe(m,[[.104,.018],[.13,.02],[.14,.012]],12,.15,.11);
  const tip=p.playing?[.02,.121,-.06]:[.17,.126,-.1];
  rod(m,[.15,.135,.11],tip,.004,6);
  paint(m,'iron');bevel(m,tip[0],tip[1]-.012,tip[2],.02,.014,.035,.003,'x');
  m.ctx.flat();paint(m,'walnut','#e7cfa8');for(const x of [-.16,.16])bevel(m,x,.102,-D/2+.03,.03,.006,.03,.002,'x');
}
function catBed(m,p){
  const r=p.radius,f=p.fluffed?1:0;
  paint(m,p.tone);m.ctx.smooth();
  lathe(m,[[0,r*.97],[.05,r],[.12,r*.97],[.15,r*.86],[.13,r*.74],[.08,r*.7]],28,0,0,{caps:false});
  paint(m,'cream');lathe(m,[[.03,r*.72],[.06+.02*f,r*.62],[.08+.03*f,r*.35],[.085+.035*f,0]],28,0,0,{caps:false});
  lathe(m,[[0,r*.97],[.001,.001]],28,0,0,{caps:false});
  m.ctx.flat();
}
const BUILDERS={couch,armchair,floorLamp,sideTable,bookshelf,bed,desk,easel,boardGame,recordPlayer,catBed};
export function geometry(ctx){
  const item=ctx.params.item||'couch',p={...DEFAULTS[item],...ctx.params},m=mesh(ctx);
  ctx.flat();(BUILDERS[item]||couch)(m,p);return m.finish();
}
export function collider(ctx){
  const item=ctx.params.item||'couch',p={...DEFAULTS[item],...ctx.params},m=mesh(ctx);
  if(item==='couch'||item==='armchair'){solid(m,0,0,0,p.width,p.seat,p.depth);solid(m,0,p.seat,p.depth/2-.1,p.width,.4,.2);}
  else if(item==='bed'){solid(m,0,0,0,p.width,.5,p.depth);solid(m,0,.5,p.depth/2-.035,p.width,.6,.07);}
  else if(item==='bookshelf')solid(m,0,0,0,p.width,p.height,p.depth);
  else if(item==='sideTable'||item==='desk')solid(m,0,0,0,p.width,p.height,p.depth);
  else if(item==='floorLamp')solid(m,0,0,0,.1,p.height,.1);
  else if(item==='easel')solid(m,0,0,-.05,.62,1.25,.2);
  else return null;
}
