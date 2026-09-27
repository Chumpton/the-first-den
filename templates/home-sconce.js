import { SCONCE } from '../scripts/lib/data/home-sconces.js';
export const sconce={tags:['home-sconce'],primitive:{kind:'scripted',script:'scripts/gen/home-sconce.js',params:{}},physics:'static',material:{pbr:true,color:'#ffffff'},castShadow:true,receiveShadow:true};
export const warmPool={tags:['home-sconce-light'],feetPosition:SCONCE.lightPosition,light:SCONCE.light};
