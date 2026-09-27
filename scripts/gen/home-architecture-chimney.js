import { ARCH,roofAt } from './home-architecture-data.js';
import { builder,paint,box,beam } from './home-architecture-kit.js';
export function geometry(ctx){const e=builder(ctx),c=ARCH.chimney;paint(e,ARCH.textures.stone,'#b7ac96',.95);box(e,-.423,c.bottom,-.483,.423,c.top,.483);
 const courses=12,step=(c.top-c.bottom)/courses;paint(e,ARCH.textures.stone,'#fff7dc',.92);
 for(let row=0;row<courses;row++){const y=c.bottom+step*(row+.5),ww=.88-(row>7?(row-7)*.01:0),dd=1-(row>7?(row-7)*.01:0),shade=.92+ctx.random()*.07;ctx.color(shade,shade*.99,shade*.963);
  for(const z of [-dd/2,dd/2]){const count=row%2?2:3;for(let i=0;i<count;i++){const a=-ww/2+i*ww/count+.007,b=-ww/2+(i+1)*ww/count-.007;beam(e,[a,y,z],[b,y,z],.105,step-.009,.013);}}
  for(const x of [-ww/2,ww/2]){const count=row%2?3:2;for(let i=0;i<count;i++){const a=-dd/2+i*dd/count+.009,b=-dd/2+(i+1)*dd/count-.009;beam(e,[x,y,a],[x,y,b],.105,step-.009,.013);}}
 }
 paint(e,ARCH.textures.stone,'#d8c9a9',.90);box(e,-.51,c.top-.045,-.57,.51,c.top+.071,.57);
 paint(e,null,'#383d38',.7,.45);for(const x of [-.365,.365])for(const z of [-.405,.405])beam(e,[x,c.top+.057,z],[x,c.cap-.045,z],.029,.029,.004);
 paint(e,ARCH.textures.shingles,'#c6bba6',.86);box(e,-.535,c.cap-.047,-.598,.535,c.cap,.598);
 // Roof flashing follows the hip on all four sides of the masonry, closing the actual penetration.
 paint(e,null,'#736a52',.59,.45);const outer=[[-.59,-.65],[.59,-.65],[.59,.65],[-.59,.65]],inner=[[-.45,-.51],[.45,-.51],[.45,.51],[-.45,.51]];
 for(let i=0;i<4;i++){const j=(i+1)%4,a=outer[i],b=outer[j],d=inner[i],f=inner[j];const p=[a,b,f,d].map(v=>[v[0],roofAt('den',c.x+v[0],c.z+v[1])+.157+(v===d||v===f?.07:0),v[1]]);e.face(p,[0,1,0]);}
 return e.finish();}
export function collider(ctx){const e=builder(ctx),c=ARCH.chimney;box(e,-.44,c.bottom,-.50,.44,c.cap,.50);}
