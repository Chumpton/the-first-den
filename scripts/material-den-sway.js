// A hanging thing's breeze, drawn on the GPU: each vertex swings by how far it hangs below its top (`drop`), phased along the room so
// neighbours move as one draught. The sim pays nothing — no tick, no row; the geometry keeps its paint.
import {vec3,time,positionLocal,positionWorld,clamp} from 'builtin/tsl';
import {MeshStandardNodeMaterial} from 'builtin/three';
export function material(ctx){
  const m=new MeshStandardNodeMaterial(),drop=ctx.param('drop',1.84),reach=ctx.param('reach',.035),speed=ctx.param('speed',.9);
  m.vertexColors=true;m.roughness=.96;m.metalness=0;
  const hang=clamp(positionLocal.y.mul(-1).add(drop).div(drop),0,1),bend=hang.mul(hang);
  const t=time.mul(speed).add(positionWorld.x.mul(1.3));
  const along=t.sin().mul(reach).add(t.mul(2.3).add(1.7).sin().mul(reach).mul(.35));
  const out=t.mul(.7).add(.4).sin().mul(reach).mul(.6);
  m.positionNode=positionLocal.add(vec3(along.mul(bend),0,out.mul(bend)));
  return m;
}
