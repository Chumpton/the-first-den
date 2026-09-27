// The picture window's curtains: a pleated linen panel hung from its top (feet at the hem, the top at `drop`), or, with `rod`, the
// brass rod they hang from. The panel's breeze is its material's (scripts/material-den-sway.js); this file draws it still.
import {mesh,paint,rod,lathe} from './den-furniture-mesh.js';
export function geometry(ctx){
  const p=ctx.params,m=mesh(ctx);
  if(p.rod){
    const w=p.width||3;
    paint(m,'brass');rod(m,[-w/2,0,0],[w/2,0,0],.014,10);
    for(const x of [-w/2,w/2])lathe(m,[[-.032,0],[-.024,.02],[0,.03],[.024,.02],[.032,0]],12,x,0);
    // Two brackets carry it `reach` back to the wall, each ending in a small plate.
    const reach=p.reach||0;
    if(reach)for(const x of [-w/2+.09,w/2-.09]){rod(m,[x,0,0],[x,0,reach],.007,8);rod(m,[x,-.035,reach-.006],[x,.035,reach-.006],.016,10);}
    return m.finish();
  }
  const w=p.width||.45,drop=p.drop||1.84,folds=p.folds||6,cols=folds*4,rows=10,depth=p.depth||.028;
  paint(m,p.tone||'#e8dcc4');m.ctx.smooth();
  // A height field z(x, y): the pleats deepen toward the gathered top and ease out at the hem.
  const at=(i,j)=>{const u=i/cols,v=j/rows;return [(u-.5)*w,drop*v,Math.sin(u*folds*Math.PI*2)*depth*(.55+.45*v)];};
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const q=[at(i,j),at(i+1,j),at(i+1,j+1),at(i,j+1)];
    m.face(q,[0,0,-1]);m.face(q.map(v=>[v[0],v[1],v[2]+.006]),[0,0,1]);
  }
  m.ctx.flat();
  return m.finish();
}
export function collider(){return null;}
