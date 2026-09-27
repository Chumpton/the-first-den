import { ARCH, ROOMS } from './home-architecture-data.js';
import { builder,paint,polySlab,offset,beam } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx),room=ctx.params.room||'den',poly=ROOMS[room],out=offset(poly,.115);
 paint(e,ARCH.textures.stone,'#aea491',.97);polySlab(e,out,ARCH.foundation,-.02);
 paint(e,ARCH.textures.stone,'#ffffff',.91);
 for(let k=0;k<out.length;k++){if(room==='den'&&k===1)continue;const a=out[k],b=out[(k+1)%out.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  for(let row=0;row<2;row++){let s=0;const count=Math.ceil(L/.58);for(let j=0;j<count;j++){let len=(L-s)/(count-j);if(j<count-1)len*=.83+ctx.random()*.3;len=Math.min(len,L-s);const p=s+.006,q=Math.max(p+.02,s+len-.006),shade=.935+ctx.random()*.055;ctx.color(shade,shade*.994,shade*.978);beam(e,[a[0]+ux*p,ARCH.foundation+.105+row*.209,a[1]+uz*p],[a[0]+ux*q,ARCH.foundation+.105+row*.209,a[1]+uz*q],.255,.198,.016);s+=len;}}
 }
 paint(e,ARCH.textures.stone,'#e5d9bf',.93);for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length];beam(e,[a[0],-.027,a[1]],[b[0],-.027,b[1]],.273,.062,.008);}return e.finish();}
export function collider(ctx){const e=builder(ctx);polySlab(e,offset(ROOMS[ctx.params.room||'den'],.10),ARCH.foundation,-.02);}
