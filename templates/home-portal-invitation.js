import {PORTAL as P} from '../scripts/lib/data/home-portal.js';
const words=(fill,stroke='none',width=0)=>`<g fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" text-anchor="middle" font-family="serif"><text x="360" y="60" font-size="48">tell savi where you</text><text x="360" y="117" font-size="48">want to go first</text></g>`;
export const invitation={
 tags:['portal-invitation'],physics:'none',castShadow:false,receiveShadow:false,
 feetPosition:{x:0,y:1.7,z:-.24},
 visibleRange:{min:0,max:P.promptRange},
 material:{color:'#ffffff',depthTest:true,depthWrite:false},
 vector:`<svg viewBox="0 0 720 184" width="${P.promptWidth}m" billboard="yaw">${words('none','#243c34',4)}${words('#fff4da')}<text x="360" y="167" text-anchor="middle" font-family="sans-serif" font-size="23" fill="#fff4da" stroke="#243c34" stroke-width=".5">open chat to begin</text></svg>`,
 state:{message:P.prompt,role:'first-destination-invitation'}
};
export const glimmer={
 physics:'none',castShadow:false,receiveShadow:false,
 fx:{script:`fx
local
pop edge rate=3 on=path(js{[[-.99,.1,.28],[-.99,2.2,.28],[-.92,2.58,.28],[-.7,2.9,.28],[-.38,3.12,.28],[0,3.2,.28],[.38,3.12,.28],[.7,2.9,.28],[.92,2.58,.28],[.99,2.2,.28],[.99,.1,.28]]}) life=2.5..4.5 v=up(.025..0.085)+sdir()*.025 size=.014..0.03 acc=drag(.4) col=hdr(1.35,1.18,.68) a=0>.22:.65>.7:.5>0 sz=$size*(.3>.3:1>.2) r=sprite(mote,add)
pop inside rate=1.5 on=box(.7,1.1,.08).c(1.5) life=3..5 v=up(.035..0.08)+sdir()*.02 size=.014..0.025 acc=drag(.5) col=hdr(.55,1.05,.94) a=0>.3:.42>.75:.3>0 sz=$size r=sprite(mote,add)`}
};
