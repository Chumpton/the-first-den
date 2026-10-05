import {mesh,paint,solid,bevel,lathe,beam,rod,plankedDisc} from './den-furniture-mesh.js';
import {blanket} from './den-blanket.js';
import { softened } from "./soften.js";
// A parameterized family, not room scenery baked into one mesh. Dimensions are in metres.
export const DEFAULTS={
  table:{radius:.8,height:.74,wood:'oak'},chair:{width:.55,depth:.55,height:.995,seat:.479,wood:'oak',linen:'flax'},
  shelf:{length:3.12,depth:.35,height:.28,wood:'walnut'},hearth:{height:3.2,mantelExtension:0},
  pendant:{radius:.255,drop:1.48},rug:{radiusX:1.41,radiusZ:1.495},stool:{radius:.26,height:.48,seat:.48,wood:'oak'},
  blanket:{width:.40,tone:'moss'},box:{width:.28,depth:.20,height:.078,tone:'teal'},star:{radius:.075},
  note:{width:.26,height:.19,paper:'#f3e8cf'},stake:{height:.95,wood:'oak'},
  plant:{growth:0,thirst:0,wet:0,pot:'limestone'},can:{tone:'brass'}
};
// A SEAT: an item whose params carry `seat` (the seat's height, metres) is sat on — E beside it sits, E again stands
// (scripts/home-player-feel.js). The points are where the sitter's feet go, seat-local: one per ~0.6 m of width, facing −z;
// the body's sit pose lifts the hips about half a body above the point.
export function sitPointsOf(params){
  if(!params)return [];
  const p={...(DEFAULTS[params.item]||{}),...params};
  if(typeof p.seat!=='number')return [];
  const w=p.width||p.length||.5,n=Math.max(1,Math.floor((w+.1)/.6)),y=Math.max(0,p.seat-.48);
  return Array.from({length:n},(_,i)=>({x:n===1?0:(i+.5)*w/n-w/2,y,z:.03}));
}
function table(m,p){
  const r=p.radius,h=p.height,s=h/.74;
  paint(m,p.wood);m.ctx.smooth();
  lathe(m,[[h-.07,r-.041],[h-.063,r-.015],[h-.048,r],[h-.022,r],[h-.007,r-.009],[h,r-.022]],64,0,0,{caps:false,planar:true});
  paint(m,p.wood,'#d7c3a0');lathe(m,[[h-.075,r-.043],[h-.07,r-.041]],64,0,0,{caps:true});
  m.ctx.flat();plankedDisc(m,r-.022,h,64,p.wood);
  paint(m,p.wood,'#e5ceb0');m.ctx.smooth();
  lathe(m,[[h-.177,r-.175],[h-.164,r-.156],[h-.078,r-.156],[h-.073,r-.181],[h-.16,r-.181],[h-.177,r-.175]],40,0,0,{caps:false});
  const a=r*.565;
  for(const x of [-a,a])for(const z of [-a,a]){
    paint(m,p.wood);
    lathe(m,[[0,.046],[.021*s,.051],[.046*s,.048],[.074*s,.030],[.20*s,.033],[.255*s,.027],[.278*s,.044],[.305*s,.044],[.321*s,.033],[.47*s,.036],[.51*s,.053],[.55*s,.064],[.59*s,.054],[h-.095,.049]],12,x,z);
  }
  paint(m,p.wood,'#e7d2af');
  rod(m,[-a,.245*s,-a],[a,.245*s,a],.027,10);rod(m,[-a,.245*s,a],[a,.245*s,-a],.027,10);
  m.ctx.flat();bevel(m,0,.218*s,0,.15,.058,.15,.011,'x');
  paint(m,'walnut');lathe(m,[[.274*s,.031],[.28*s,.028]],12);
  m.ctx.flat();
}
function chair(m,p){
  const w=p.width/.55,d=p.depth/.55,h=p.height/.995;
  paint(m,p.wood);m.ctx.smooth();
  for(const x of [-1,1]){
    beam(m,[x*.239*w,0,-.233*d],[x*.208*w,.419*h,-.204*d],[[0,.027],[.038,.031],[.16,.024],[.50,.023],[.72,.032],[.80,.034],[1,.030]],10);
    beam(m,[x*.234*w,0,.234*d],[x*.223*w,.988*h,.247*d],[[0,.027],[.05,.029],[.32,.025],[.42,.029],[.48,.027],[.68,.022],[.93,.025],[1,.024]],10);
    rod(m,[x*.224*w,.183*h,-.216*d],[x*.225*w,.183*h,.238*d],.013,8);
  }
  rod(m,[-.225*w,.176*h,-.215*d],[.225*w,.176*h,-.215*d],.013,8);
  rod(m,[-.228*w,.199*h,.24*d],[.228*w,.199*h,.24*d],.013,8);
  m.ctx.flat();paint(m,p.wood);
  bevel(m,0,.365*h,0,.55*w,.073*h,.55*d,.012,'x');
  bevel(m,0,.328*h,-.228*d,.44*w,.065*h,.036,.009,'x');
  for(const x of [-.23,.23])bevel(m,x*w,.328*h,0,.035,.065*h,.43*d,.007,'z');
  // Broad, softly capped splats and a shallow curved crest, rather than a solid billboard back.
  for(const x of [-.089,.089]){
    bevel(m,x*w,.52*h,.224*d,.066*w,.40*h,.033,.008,'y');
  }
  const top=[];
  for(let i=0;i<=12;i++){const x=(i/12-.5)*.5*w;top.push([x,.96*h+.035*h*(1-Math.pow(x/(.25*w),2)),.249*d-.009*Math.pow(x/(.25*w),2)]);}
  for(let i=0;i<12;i++){
    const a=top[i],b=top[i+1],c=[b[0],b[1]-.072*h,b[2]],e=[a[0],a[1]-.072*h,a[2]];
    m.face([[a[0],a[1],a[2]-.020],[b[0],b[1],b[2]-.020],[c[0],c[1],c[2]-.020],[e[0],e[1],e[2]-.020]],[0,0,-1],'x');
    m.face([[a[0],a[1],a[2]+.021],[b[0],b[1],b[2]+.021],[c[0],c[1],c[2]+.021],[e[0],e[1],e[2]+.021]],[0,0,1],'x');
    m.face([[a[0],a[1],a[2]-.020],[b[0],b[1],b[2]-.020],[b[0],b[1]+.004,b[2]],[a[0],a[1]+.004,a[2]]],[0,1,-1],'x');
    m.face([[a[0],a[1]+.004,a[2]],[b[0],b[1]+.004,b[2]],[b[0],b[1],b[2]+.021],[a[0],a[1],a[2]+.021]],[0,1,1],'x');
    m.face([[e[0],e[1],e[2]-.020],[c[0],c[1],c[2]-.020],[c[0],c[1],c[2]+.021],[e[0],e[1],e[2]+.021]],[0,-1,0],'x');
  }
  for(const i of [0,12]){const a=top[i];m.face([[a[0],a[1],a[2]-.02],[a[0],a[1],a[2]+.021],[a[0],a[1]-.072*h,a[2]+.021],[a[0],a[1]-.072*h,a[2]-.02]],[i===0?-1:1,0,0]);}
  paint(m,p.linen);m.ctx.smooth();bevel(m,0,.433*h,-.013*d,.480*w,.046*h,.447*d,.019,'z');m.ctx.flat();
  paint(m,'cream','#b4a583');
  for(const z of [-.215,.189])rod(m,[-.206*w,.458*h,z*d],[.206*w,.458*h,z*d],.0028,5);
  paint(m,'walnut');
  for(const x of [-.215,.215])rod(m,[x*w,.395*h,-.266*d],[x*w,.395*h,-.273*d],.007,8);
}
function shelf(m,p){
  paint(m,p.wood);bevel(m,0,p.height-.06,0,p.depth,.06,p.length,.008,'z');
  const ends=[-p.length/2+.22,p.length/2-.22];
  for(const z of ends){
    bevel(m,-p.depth/2+.033,0,z,.048,p.height-.045,.065,.008,'y');
    bevel(m,-.012,p.height-.088,z,p.depth-.056,.037,.067,.007,'x');
    m.ctx.smooth();rod(m,[-p.depth/2+.042,.033,z],[p.depth/2-.05,p.height-.073,z],.019,10);m.ctx.flat();
    paint(m,'oak');rod(m,[p.depth/2-.004,p.height-.027,z],[p.depth/2+.001,p.height-.027,z],.007,10);paint(m,p.wood);
  }
}
function hearth(m,p){
  paint(m,'limestone');bevel(m,0,0,.025,1.02,.145,1.15,.04,'x');
  paint(m,'soot');solid(m,-.335,.142,0,.18,.78,.94);
  for(const sign of [-1,1]){
    // Four hand-set courses. The stagger is real geometry; the recess remains an actual hole.
    for(let row=0;row<4;row++){
      const cuts=row%2?[-.43,-.19,.373]:[-.43,.057,.373];
      for(let i=0;i<2;i++){
        paint(m,'limestone',row%2?'#e9ddc5':'#fff6e3');
        const x=(cuts[i]+cuts[i+1])/2,y=.149+row*.183;
        bevel(m,x,y,sign*.401,cuts[i+1]-cuts[i]-.009,.175,.192,.012,'x');
      }
    }
  }
  paint(m,'limestone','#eee4cd');
  for(let i=0;i<3;i++)bevel(m,-.017,.86,-.329+i*.329,.802,.139,.321,.017,'z');
  // A soot-dark fireback and side returns: no front face closes the opening.
  paint(m,'soot');solid(m,-.238,.148,0,.010,.64,.606);
  solid(m,.058,.151,-.301,.58,.62,.012);solid(m,.058,.151,.301,.58,.62,.012);solid(m,.056,.768,0,.585,.038,.60);
  paint(m,'walnut');bevel(m,-.004+p.mantelExtension/2,1.003,.016,.924+p.mantelExtension,.116,1.074,.026,'z');
  for(const z of [-.397,.397])bevel(m,.178,.927,z,.24,.09,.12,.014,'x');
  // Buttercream breast, narrower above the mantel, meets the structural chimney on (.6,5.1).
  paint(m,'plaster');
  const levels=[[1.118,.78,.90],[1.35,.69,.76],[1.73,.47,.49],[p.height,.47,.49]];
  for(let j=0;j<levels.length-1;j++){
    const [y,w,d]=levels[j],[yy,ww,dd]=levels[j+1],x=-.04;
    const a=[[x-w/2,y,-d/2],[x+w/2,y,-d/2],[x+w/2,y,d/2],[x-w/2,y,d/2]],b=[[x-ww/2,yy,-dd/2],[x+ww/2,yy,-dd/2],[x+ww/2,yy,dd/2],[x-ww/2,yy,dd/2]];
    for(let k=0;k<4;k++){const l=(k+1)%4;const n=k===0?[0,0,-1]:k===1?[1,0,0]:k===2?[0,0,1]:[-1,0,0];m.face([a[k],a[l],b[l],b[k]],n);}
  }
  solid(m,-.04,p.height-.014,0,.47,.014,.49);
  paint(m,'soot');bevel(m,.19,.148,0,.35,.025,.533,.009);
  const logs=[[[.115,.226,-.252],[.174,.243,.244],.055],[[.289,.211,-.24],[.252,.217,.25],.053],[[.058,.295,-.10],[.328,.306,.15],.046]];
  for(const [a,b,r] of logs){paint(m,'char');beam(m,a,b,[[0,r*.83],[.06,r],[.48,r*.94],[.94,r*.97],[1,r*.75]],10);}
  for(let i=0;i<11;i++){
    const x=.055+m.ctx.random()*.268,z=-.23+m.ctx.random()*.46,r=.018+m.ctx.random()*.018;
    paint(m,'#813a19');m.ctx.emissive(i%3===0?1.28:.78,i%3===0?.40:.20,.027);
    lathe(m,[[.171,r*.7],[.181+r*.3,r],[.192+r*.4,r*.35]],7,x,z);
  }
  m.ctx.emissive(null);paint(m,'iron');
  for(const z of [-.244,.244]){
    rod(m,[-.048,.181,z],[.404,.181,z],.012,8);rod(m,[.372,.146,z],[.372,.347,z],.015,8);
    lathe(m,[[.332,.022],[.351,.026],[.37,.010]],10,.372,z);
  }
}
function lamp(m,p){
  const s=p.radius/.255;paint(m,'iron','#9b9280');m.ctx.smooth();
  lathe(m,[[.094,.253*s],[.104,.255*s],[.119,.242*s],[.15,.213*s],[.215,.153*s],[.268,.095*s],[.286,.060*s],[.302,.047*s]],40,0,0,{caps:false});
  paint(m,'brass','#f4e6c5');
  lathe(m,[[.297,.039*s],[.278,.053*s],[.258,.09*s],[.205,.148*s],[.139,.208*s],[.108,.241*s],[.094,.253*s]],40,0,0,{caps:false});
  lathe(m,[[.092,.250*s],[.094,.258*s],[.101,.258*s],[.105,.249*s]],40,0,0,{caps:true});
  lathe(m,[[.288,.048],[.301,.054],[.314,.054],[.32,.037],[.367,.033],[.378,.025]],20);
  paint(m,'iron');rod(m,[0,.373,0],[0,p.drop-.029,0],.0075,8);
  lathe(m,[[p.drop-.045,.022],[p.drop-.021,.067],[p.drop-.009,.077],[p.drop,.072]],24);
  // Opal bulb: emissive solid, not a sprite. The shade's real child light owns its downward pool.
  paint(m,'#fff0c8');m.ctx.emissive(1.65,1.12,.48);
  lathe(m,[[0,.011],[.011,.027],[.032,.037],[.076,.038],[.101,.027],[.119,.015]],20);
  m.ctx.emissive(null);m.ctx.flat();
}
function rug(m,p){
  const rz=p.radiusZ/p.radiusX,r=p.radiusX;paint(m,'flax');m.ctx.smooth();
  lathe(m,[[0,r-.012],[.010,r],[.019,r-.01],[.025,r-.04]],96,0,0,{zScale:rz,caps:true,planar:true});
  paint(m,'oat','#ede0bd');lathe(m,[[.0254,r-.052],[.026,r-.040],[.026,r-.027],[.022,r-.021]],96,0,0,{zScale:rz,caps:false,planar:true});
  paint(m,'flax','#ad9773');lathe(m,[[.026,r-.114],[.0265,r-.108],[.026,r-.102]],96,0,0,{zScale:rz,caps:false,planar:true});
  // A single restrained braided selvedge, not a decorative medallion.
  for(let i=0;i<96;i++){
    const a=(i+.1)*Math.PI*2/96,b=(i+.7)*Math.PI*2/96,ri=r-.073,ro=r-.042;
    paint(m,'oat',i%2?'#f1e2bb':'#bfb18e');
    m.face([[Math.cos(a)*ri,.027,Math.sin(a)*ri*rz],[Math.cos(a+.004)*ro,.027,Math.sin(a+.004)*ro*rz],[Math.cos(b+.004)*ro,.027,Math.sin(b+.004)*ro*rz],[Math.cos(b)*ri,.027,Math.sin(b)*ri*rz]],[0,1,0]);
  }m.ctx.flat();
}
function stool(m,p){
  const h=p.height,r=p.radius;paint(m,p.wood);m.ctx.smooth();
  lathe(m,[[h-.055,r-.025],[h-.047,r-.005],[h-.026,r],[h-.008,r-.004],[h,r-.020]],40,0,0,{caps:false,planar:true});m.ctx.flat();plankedDisc(m,r-.020,h,40,p.wood);
  paint(m,p.wood);lathe(m,[[h-.058,r-.025],[h-.055,r-.025]],32);
  const feet=[];
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3+Math.PI/2,f=[Math.cos(a)*r*.92,0,Math.sin(a)*r*.92],t=[Math.cos(a)*r*.58,h-.052,Math.sin(a)*r*.58];feet.push([f[0]*.75,.18,f[2]*.75]);
    beam(m,f,t,[[0,.025],[.055,.033],[.17,.028],[.62,.023],[.71,.035],[.80,.035],[1,.030]],10);
  }
  for(let i=0;i<3;i++)rod(m,feet[i],feet[(i+1)%3],.015,8);
}
function gameBox(m,p){
  const w=p.width,d=p.depth,h=p.height;
  paint(m,'walnut');bevel(m,0,0,0,w*.978,h*.78,d*.978,.007,'x');
  paint(m,p.tone);bevel(m,0,.008,0,w*.975,h*.69,d*.975,.006);
  paint(m,'walnut','#d6bc92');bevel(m,0,h*.72,0,w,.012,d,.004,'x');
  paint(m,p.tone);bevel(m,0,h*.72+.012,0,w,h*.28-.012,d,.007);
  // Blank cloth-bound cover with stitched edging and small brass guards, no invented crest or title.
  paint(m,'brass','#c5ae81');
  for(const z of [-d*.43,d*.43])rod(m,[-w*.43,h+.0008,z],[w*.43,h+.0008,z],.0013,5);
  for(const x of [-w*.43,w*.43])rod(m,[x,h+.0008,-d*.43],[x,h+.0008,d*.43],.0013,5);
  for(const x of [-1,1])for(const z of [-1,1]){
    bevel(m,x*(w/2-.019),h*.70,z*(d/2-.004),.029,.017,.008,.002,'x');
  }
}
function star(m,p){
  paint(m,'brass','#d6bd8c');m.ctx.smooth();lathe(m,[[0,.067],[.007,.073],[.014,.066]],20,0,0,{zScale:.51});m.ctx.flat();
  const points=[];for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?p.radius*.43:p.radius;points.push([Math.cos(a)*r,.088+Math.sin(a)*r]);}
  for(let i=0;i<10;i++){
    const a=points[i],b=points[(i+1)%10];
    m.face([[0,.088,-.014],[a[0],a[1],-.004],[b[0],b[1],-.004]],[0,0,-1]);
    m.face([[0,.088,.014],[a[0],a[1],.004],[b[0],b[1],.004]],[0,0,1]);
    m.face([[a[0],a[1],-.004],[a[0],a[1],.004],[b[0],b[1],.004],[b[0],b[1],-.004]],[(a[0]+b[0])/2,(a[1]+b[1])/2-.088,0]);
  }
}
// A card of heavy paper pinned flat, its face toward −z (the placement's ui writes the words on it); a brass pin at the top.
function note(m,p){
  const w=p.width,h=p.height,t=.0012,c=.024;
  paint(m,p.paper);
  m.face([[-w/2,0,-t/2],[w/2-c,0,-t/2],[w/2,c*.9,-t/2-.003],[w/2,h,-t/2],[-w/2,h,-t/2]],[0,0,-1]);
  m.face([[-w/2,0,t/2],[w/2-c,0,t/2],[w/2,c*.9,t/2-.003],[w/2,h,t/2],[-w/2,h,t/2]],[0,0,1]);
  paint(m,'brass','#d8bf8e');m.ctx.smooth();
  rod(m,[0,h-.022,-t/2],[0,h-.022,-t/2-.0015],.0018,6);beam(m,[0,h-.022,-t/2-.0015],[0,h-.022,-t/2-.0042],[[0,.0062],[.55,.0068],[1,.0035]],10);
  m.ctx.flat();
}
// A wooden post with a small backing board, for a note that stands outdoors (the card rides in front of the board).
function stake(m,p){
  const h=p.height;
  paint(m,p.wood);m.ctx.smooth();
  beam(m,[0,-.12,.03],[0,h+.24,.03],[[0,.021],[.95,.02],[1,.016]],10);
  m.ctx.flat();paint(m,'walnut','#e6d0ae');bevel(m,0,h-.03,.018,.31,.26,.02,.004,'x');
}
// A small potted plant: a limestone pot, soil that darkens when watered, leaves that multiply with `growth` (0–4) and droop and
// yellow with `thirst` (0–1). scripts/den-plant.js keeps the stage in the plant's own state and sets these params.
function plant(m,p){
  const g=Math.max(0,Math.min(4,p.growth|0)),t=Math.max(0,Math.min(1,p.thirst||0));
  paint(m,p.pot);m.ctx.smooth();
  lathe(m,[[0,.074],[.012,.083],[.15,.101],[.162,.112],[.185,.114],[.19,.106]],28,0,0,{caps:false});
  lathe(m,[[0,.0001],[.001,.074]],28);
  paint(m,p.pot,'#e2d6c2');lathe(m,[[.17,.1],[.19,.106]],28,0,0,{caps:false});
  m.ctx.flat();paint(m,p.wet?'#2f2219':'#4d392a');
  const soil=Array.from({length:20},(_,i)=>{const a=i*Math.PI/10;return[Math.cos(a)*.1,.172,Math.sin(a)*.1];});m.face(soil,[0,1,0]);
  const n=5+g*2,h=.16+g*.075,green=t?'#98954f':'#5d8a47',light=t?'#b2aa62':'#79a35b';
  for(let i=0;i<n;i++){
    const a=i*2.39996,len=h*(.72+.28*((i*7)%5)/4),tilt=(.42+.18*(i%3)+.62*t)*(i<3?.7:1),w=.022+.006*g;
    const base=[Math.cos(a)*.012,.17,Math.sin(a)*.012],dir=[Math.sin(tilt)*Math.cos(a),Math.cos(tilt),Math.sin(tilt)*Math.sin(a)];
    const mid=[base[0]+dir[0]*len*.55,base[1]+dir[1]*len*.55+.012,base[2]+dir[2]*len*.55];
    const tip=[base[0]+dir[0]*len,base[1]+dir[1]*len-len*.28*t,base[2]+dir[2]*len];
    const side=[-Math.sin(a)*w,0,Math.cos(a)*w],l=[mid[0]+side[0],mid[1],mid[2]+side[2]],r=[mid[0]-side[0],mid[1],mid[2]-side[2]];
    const up=[dir[0]*-.4,1,dir[2]*-.4];
    paint(m,i%2?green:light);m.face([base,l,tip,r],up);m.face([base,r,tip,l],up.map(v=>-v));
  }
}
// A small watering can: a round body, a long spout with a rose, a handle over the top. Its spout points +x.
function can(m,p){
  paint(m,p.tone,'#d9bf8c');m.ctx.smooth();
  lathe(m,[[0,.066],[.008,.071],[.105,.071],[.122,.06],[.132,.034]],24);
  beam(m,[.05,.035,0],[.19,.15,0],[[0,.012],[.85,.009],[1,.009]],10);
  beam(m,[.187,.147,0],[.2,.158,0],[[0,.011],[.5,.022],[1,.024]],12);
  beam(m,[-.06,.1,0],[-.04,.185,0],[[0,.009],[1,.009]],8);beam(m,[-.04,.185,0],[.035,.16,0],[[0,.009],[1,.009]],8);
  m.ctx.flat();
}
const BUILDERS={table,chair,shelf,hearth,pendant:lamp,rug,stool,blanket,box:gameBox,star,note,stake,plant,can};
export const geometry = softened(function geometry(ctx){
  const item=ctx.params.item||'table',p={...DEFAULTS[item],...ctx.params},m=mesh(ctx);
  ctx.flat();(BUILDERS[item]||table)(m,p);return m.finish();
});
export function collider(ctx){
  const item=ctx.params.item||'table',p={...DEFAULTS[item],...ctx.params},m=mesh(ctx);
  if(['rug','blanket','box','star','pendant','note','stake','plant','can'].includes(item))return null;
  if(item==='table'){
    lathe(m,[[p.height-.075,p.radius],[p.height,p.radius]],16);
    const a=p.radius*.565;for(const x of [-a,a])for(const z of [-a,a])solid(m,x,0,z,.114,p.height-.07,.114);
    solid(m,0,.216,0,.16,.072,.16);
  }else if(item==='chair'){
    const w=p.width/.55,d=p.depth/.55,h=p.height/.995;
    solid(m,0,.35*h,0,p.width,.13*h,p.depth);
    for(const x of [-.22,.22])for(const z of [-.222,.222])solid(m,x*w,0,z*d,.065,.39*h,.065);
    solid(m,0,.48*h,.238*d,.5*w,.515*h,.074*d);
  }else if(item==='shelf'){
    solid(m,0,p.height-.06,0,p.depth,.06,p.length);
    for(const z of [-p.length/2+.22,p.length/2-.22])solid(m,-p.depth/2+.034,0,z,.05,p.height-.05,.064);
  }else if(item==='hearth'){
    solid(m,0,0,.025,1.02,.145,1.15);solid(m,-.337,.145,0,.2,.86,.94);
    for(const z of [-.4,.4])solid(m,-.03,.145,z,.806,.86,.20);
    solid(m,-.03,.80,0,.806,.21,.94);solid(m,-.004+p.mantelExtension/2,1.003,.016,.924+p.mantelExtension,.116,1.074);
    solid(m,-.04,1.119,0,.47,p.height-1.119,.49);
  }else if(item==='stool'){
    lathe(m,[[p.height-.058,p.radius],[p.height,p.radius]],12);
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3+Math.PI/2;rod(m,[Math.cos(a)*p.radius*.92,0,Math.sin(a)*p.radius*.92],[Math.cos(a)*p.radius*.58,p.height-.053,Math.sin(a)*p.radius*.58],.033,6);}
  }
}
// Authoring only: keep the engine's move/rotate/scale tools; a finish is this family's own DOF.
export function editor(ctx,obj){
  if(ctx.authoring.hit)return;
  const p=obj.primitive?.params;if(!p)return;
  if(['table','chair','shelf','stool'].includes(p.item))ctx.authoring.handle({id:'timber',at:'action',label:'Timber',icon:'palette',menu:{items:['oak','walnut'],active:p.wood||DEFAULTS[p.item].wood,render:(_c,v)=>v==='oak'?'Honey oak':'Hand-rubbed walnut',apply:v=>{obj.primitive.params.wood=v;}}});
  if(p.item==='chair'||p.item==='box'||p.item==='blanket')ctx.authoring.handle({id:'linen',at:'action',label:'Cloth',icon:'palette',menu:{items:['flax','moss','teal','cream'],active:p.linen||p.tone||'flax',render:(_c,v)=>v,apply:v=>{if(p.item==='chair')obj.primitive.params.linen=v;else obj.primitive.params.tone=v;}}});
}
