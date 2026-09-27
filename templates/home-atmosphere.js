import { FEEL } from '../scripts/lib/data/home-feel.js';
export const hearthFire = {
  tags:['home-atmosphere','hearth-fire'],
  audio:{clip:FEEL.hearth,gain:0.12,loop:true,spatial:true,maxDistance:9,bus:'Ambience'},
  fx:{script:`fx
pop coals n=8 on=disc(.17) size=.05..0.09 tint=<2.8,1,.25>..<1.2,.35,.09> sz=$size*flick(.5,.12) col=$tint*flick(.8,.2) a=.9 r=sprite(soft-disc,add)
pop flame rate=flick(.4,.18)*40 on=disc(.15) life=.25..0.42 v=up(.55)+cone(20)*(.10..0.28) size=.10..0.18 acc=curl(.5)*.6+buoy(.8)+drag(1.5)
  sz=$size*(.5>.25:1>.7:.6>.05) col=hdr(3.8,2.6,1)>.35:hdr(2.8,1.2,.3)>.7:hdr(1.5,.42,.1)>hdr(.4,.1,.02) a=0>.1:1>.75:.8>0 rot=spin(.15) r=sprite(flame-wisp,add)
pop embers rate=1.3 on=disc(.12) life=.4..0.7 v=up(.65)+cone(22)*(.1..0.3) size=.012..0.023 acc=drag(1.2) sz=$size*(1>.6:.7>0) col=hdr(3.2,1.7,.5)>hdr(1,.25,.04) a=0>.1:1>.7:.4>0 r=sprite(ember,add,velocity,.015)
pop hearthlight n=1 at=point().c(.25) glo=flick(2.6,.2)*(#flame/18)~ r=light(<1,.56,.25>,$glo*2.8,6.5)`}
};
export const chimneySmoke = {
  tags:['home-atmosphere','chimney-smoke'],
  behavior:'scripts/home-chimney.js',
  state:{fireId:'home-root/furniture-hearth/furniture-hearth-fire'},
  fx:{params:{lit:1},script:`fx
pop throat rate=flick(.3,.16)*8*%lit|1 on=disc(.15).c(.16) life=2..3 v=up(.8..1.2)+wind()*.18 size=.24..0.38 acc=buoy(.22)+curl(.32)*.22+drag(.25)
  sz=$size*(.6>.3:1.3>2.5) col=<.47,.46,.43>><.62,.63,.63> a=0>.12:.23>.65:.14>0 rot=spin(.09) r=sprite(smoke-puff,alpha,full,0,.16,lit=true)
pop smoke rate=flick(.22,.22)*14*%lit|1 on=disc(.18).c(.3) life=8..11 v=up(.95..1.4)+wind()*.28 size=.36..0.62 acc=buoy(.24)+curl(.25)*.36+wind()*.10+drag(.25)
  sz=$size*(.65>.3:1.45>.7:2.7>3.7) col=<.53,.52,.48>>.4:<.66,.67,.66>><.72,.73,.74> a=0>.10:.26>.6:.18>.85:.07>0 rot=spin(.065) r=sprite(smoke-puff,alpha,full,0,.2,lit=true)`}
};
export const valleyAir = {
  tags:['home-atmosphere'],
  audio:{clip:FEEL.outdoors,gain:0.11,loop:true,spatial:true,maxDistance:75,bus:'Ambience'}
};
