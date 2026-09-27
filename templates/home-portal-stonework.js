import { STONEWORK as S } from '../scripts/lib/data/home-portal-stonework.js';
export const stonework={
 tags:['home-portal-part','portal-stonework'],physics:'static',
 material:{pbr:true,roughness:.91},castShadow:true,receiveShadow:true,
 primitive:{kind:'scripted',script:'scripts/gen/home-portal-stonework.js',seed:601,params:{radius:S.radius,arch:S.arch}},
 state:{role:'first-portal-stonework',finished:true},
 blueprint:{label:'Hand-cut limestone arch and intimate landing',category:'First home',icon:'landmark'}
};
export const lantern={
 tags:['home-portal-part','portal-lantern'],physics:'none',
 material:{pbr:true,roughness:.7},castShadow:true,receiveShadow:true,
 primitive:{kind:'scripted',script:'scripts/gen/home-portal-stonework.js',seed:607,params:{part:'lantern'}},
 state:{role:'stone-and-aged-brass-ground-lantern'},
 blueprint:{label:'Low honey-brass landing light',category:'First home',icon:'lamp'}
};
