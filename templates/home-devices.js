import {RADIO_PANEL} from '../scripts/lib/radio-panel.js';
const base={tags:['home-device'],physics:'static',material:{pbr:true,color:'#ffffff',roughness:.5},castShadow:true,receiveShadow:true};
export const clock={...base,primitive:{kind:'scripted',script:'scripts/gen/home-devices.js',params:{kind:'clock'}},behavior:'scripts/home-clock.js',state:{role:'wall-clock',hhmm:'16:42'},ui:null};
export const radio={...base,tags:['home-device','interactable'],primitive:{kind:'scripted',script:'scripts/gen/home-devices.js',params:{kind:'radio'}},behavior:'scripts/home-radio.js',state:{role:'shelf-radio',powered:true,station:0},ui:RADIO_PANEL,
  fx:{params:{lit:1},script:`fx
pop dial n=1 at=point().c(.12) glo=(.8+flick(.9,.14)*.4)*%lit|1 r=light(<1,.68,.34>,$glo*.8,1.5)`}};
