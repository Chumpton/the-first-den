import {DOOR_LABEL as D,DOOR_PROMPT_VECTOR} from '../scripts/lib/data/home-door-label.js';
export const handleLabel={
  tags:['home-door-label'],physics:'none',
  primitive:null,ui:null,rotation:0,
  material:{color:'#ffffff',depthTest:true,depthWrite:false},
  castShadow:false,receiveShadow:false,
  // Native per-camera distance culling: another player approaching never shows your hint.
  visibleRange:{min:0,max:D.near},
  vector:DOOR_PROMPT_VECTOR,
  behavior:'scripts/home-door-label.js',
  state:{verb:'Open'}
};
