import { GLAZING } from '../lib/data/home-glazing.js';
import { wall } from './home-architecture-data.js';
import { builder,openingPoly,wallPoint,runFrame,wallPrism } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx),r=wall(ctx.params.run),f=runFrame(r);ctx.albedo(null);ctx.color(GLAZING.color,GLAZING.opacity);ctx.roughness(GLAZING.roughness);ctx.metalness(GLAZING.metalness);for(const w of r.windows||[]){const p=openingPoly(w,40);e.face(p.map(v=>wallPoint(r,v[0],v[1],-.007)),[f.nx,0,f.nz],p);}return e.finish();}
export function collider(ctx){const e=builder(ctx),r=wall(ctx.params.run);for(const w of r.windows||[])wallPrism(e,r,openingPoly(w,16),-.015,.015);}
