import { ARCH,wall } from './home-architecture-data.js';
import { builder,paint,wallShell } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx);paint(e,ARCH.textures.plaster,'#ffffff',.96);wallShell(e,wall(ctx.params.run),32);return e.finish();}
export function collider(ctx){const e=builder(ctx);wallShell(e,wall(ctx.params.run),12);}
