import { mesh,paint,bevel,solid,beam,rod } from './den-furniture-mesh.js';
export function skeleton(){return {hour:{pivot:[0,.27,-.046]},minute:{pivot:[0,.27,-.049]},tune:{pivot:[-.205,.071,-.147]},power:{pivot:[-.115,.071,-.147]}};}
function disc(m,x,y,z,r,depth,material){paint(m,material);beam(m,[x,y,z],[x,y,z-depth],[[0,r*.97],[.15,r],[.85,r],[1,r*.97]],48);}
export function geometry(ctx){
 const m=mesh(ctx),p=ctx.params,kind=p.kind||'radio';
 if(kind==='clock'){
   // Turned walnut profile, raised brass inner fillet, recessed porcelain face.
   disc(m,0,.27,.04,.27,.08,'walnut');
   disc(m,0,.27,-.04,.236,.002,'brass');
   disc(m,0,.27,-.042,.228,.002,'#f2e6cf');
   paint(m,'brass');
   for(let i=0;i<60;i++){
     const a=i*Math.PI/30,r=i%5===0?.193:.207;
     rod(m,[Math.sin(a)*r,.27+Math.cos(a)*r,-.046],[Math.sin(a)*.218,.27+Math.cos(a)*.218,-.046],i%5===0?.002:.00085,4);
   }
   paint(m,'#27312f');ctx.bone('hour');
   m.face([[-.010,.252,-.047],[-.009,.372,-.047],[0,.400,-.047],[.009,.372,-.047],[.010,.252,-.047]],[0,0,-1]);
   ctx.bone('minute');
   m.face([[-.005,.248,-.05],[-.004,.435,-.05],[0,.458,-.05],[.004,.435,-.05],[.005,.248,-.05]],[0,0,-1]);
   ctx.bone(null);disc(m,0,.27,-.051,.012,.005,'brass');
 }else{
   paint(m,'walnut');bevel(m,0,0,0,.54,.31,.26,.02,'x');
   // Pale end-grain dovetail pins at the two hand-joined cheeks.
   paint(m,'oak');for(const x of [-.257,.257])for(const y of [.044,.10,.208,.264])bevel(m,x,y,-.116,.017,.020,.008,.002);
   paint(m,'#49372b');bevel(m,.082,.028,-.13,.314,.255,.008,.012);
   paint(m,'flax');bevel(m,.082,.037,-.136,.297,.237,.007,.012);
   paint(m,'brass');bevel(m,-.167,.201,-.131,.14,.074,.009,.005);
   paint(m,'#503b24');bevel(m,-.167,.207,-.137,.129,.060,.004,.003);
   paint(m,'#d7a85f');ctx.emissive(.22,.105,.025);
   for(let i=0;i<13;i++)solid(m,-.226+i*.0098,.246,-.141,.001,i%3===0?.012:.006,.001);
   ctx.emissive(null);
   for(const [name,x] of [['power',-.115],['tune',-.205]]){
     disc(m,x,.071,-.132,.027,.019,'brass');
     ctx.bone(name);paint(m,'#43352a');rod(m,[x,.075,-.153],[x,.090,-.153],.0015,5);ctx.bone(null);
   }
   paint(m,'#403128');for(const x of [-.21,.21])for(const z of [-.085,.085])bevel(m,x,0,z,.048,.012,.043,.005);
 }
 return m.finish();
}
export function collider(ctx){if(ctx.params.kind==='clock')return {kind:'box',width:.54,height:.54,depth:.08};return {kind:'box',width:.54,height:.31,depth:.26};}
