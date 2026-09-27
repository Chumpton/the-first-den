import {PORTAL as P} from '../lib/data/home-portal.js';
import {V,face} from './home-garden-kit.js';
// Almost-clear sea-glass light; no blocker and no fabricated far-world picture.
export function geometry(c){
 const r=P.arch.opening/2+.03,s=P.arch.spring,z=.30;
 const poly=[V(-r,.04,z),V(r,.04,z)];
 for(let i=0;i<=32;i++){const a=i/32*Math.PI;poly.push(V(Math.cos(a)*r,s+Math.sin(a)*r,z));}
 c.flat();c.color('#71b4aa',.055);c.roughness(.3);c.metalness(0);c.emissive('#29473f');
 for(let i=1;i<poly.length-1;i++)face(c,[poly[0],poly[i],poly[i+1]],V(0,0,-1));
}
export function collider(){return null;}
