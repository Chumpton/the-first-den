// Short living green leaves; the distance tree field is separate from this close lawn.
export function geometry(ctx) {
  const h=Number(ctx.params.height??0.21);
  ctx.roughness(0.96);ctx.flat();
  for(let i=0;i<3;i++) {
    const a=i*Math.PI*2/3+ctx.random()*0.6,dx=Math.cos(a),dz=Math.sin(a),hh=h*(0.7+ctx.random()*0.45),w=0.018+ctx.random()*0.009;
    const x=dx*0.025,z=dz*0.025,bx=dx*hh*0.15,bz=dz*hh*0.15;
    ctx.color("#729759");ctx.sway(null);
    ctx.quad(x-dz*w,0,z+dx*w,x+dz*w,0,z-dx*w,x+bx+dz*w*0.38,hh*0.66,z+bz-dx*w*0.38,x+bx-dz*w*0.38,hh*0.66,z+bz+dx*w*0.38);
    ctx.color("#9bbb70");ctx.sway(null);
    ctx.tri(x+bx-dz*w*0.38,hh*0.66,z+bz+dx*w*0.38,x+bx+dz*w*0.38,hh*0.66,z+bz-dx*w*0.38,x+bx*2,hh,z+bz*2);
  }
}
export function collider(){return null;}
