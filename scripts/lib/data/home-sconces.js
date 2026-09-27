import { LAMPLIGHT } from './home-lamplight.js';
import { wing } from './home.js';
const L=Math.hypot(1.8,3.2), nx=-1.8/L,nz=-3.2/L;
// Soft, shade-diffused falloff: preserve the pool around 1.7 m while taming the near-field hotspot.
// The proxy sits clear of the lower linen hem; geometry, warm colour and room reach stay unchanged.
export const SCONCE={width:.22,height:.34,projection:.17,light:{kind:'point',color:'#eee2d3',intensity:LAMPLIGHT.sconce.day,distance:LAMPLIGHT.sconce.distance,decay:LAMPLIGHT.sconce.decay,shadow:{enabled:true}},lightPosition:{x:0,y:.145,z:-.24}};
export const SCONCE_SITES=[
 {id:'home-sconce-den-back',wall:'den-back',along:1.45,world:{x:-1.55,y:26.02,z:2.899},normal:{x:0,y:0,z:-1}},
 {id:'home-sconce-den-hip',wall:'den-hip-wall',along:L/2,world:{x:4.6+nx*.101,y:26.02,z:2.1+nz*.101},normal:{x:nx,y:0,z:nz}},
 {id:'home-sconce-board',wall:'wing-right',along:4.35,world:wing(4.899,4.35,2.02),normal:{x:-Math.SQRT1_2,y:0,z:Math.SQRT1_2}},
 {id:'home-sconce-spare',wall:'wing-right',along:5.55,world:wing(4.899,5.55,2.02),normal:{x:-Math.SQRT1_2,y:0,z:Math.SQRT1_2}}
];
