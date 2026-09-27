// Wall-contact origin, XY backplate, -Z roomward. All variants share one tiny mesh.
import { mesh,paint,lathe,rod } from './den-furniture-mesh.js';
import { SCONCE } from '../lib/data/home-sconces.js';
export function geometry(ctx){
 const m=mesh(ctx),N=24;
 const rings=[[0,.91],[-.005,1],[-.018,1],[-.024,.88]].map(([z,s])=>Array.from({length:N},(_,i)=>{const a=2*Math.PI*i/N;return [Math.cos(a)*.061*s,.17+Math.sin(a)*SCONCE.height*.5*s,z];}));
 paint(m,'walnut');
 m.face(rings[0],[0,0,1]);
 for(let j=0;j<3;j++){paint(m,'walnut',j===2?'#ffedd0':'#f0dfc8');for(let i=0;i<N;i++){const k=(i+1)%N,a=2*Math.PI*(i+.5)/N;m.face([rings[j][i],rings[j][k],rings[j+1][k],rings[j+1][i]],[Math.cos(a),Math.sin(a),j===2?-1:0]);}}
 paint(m,'walnut');m.face(rings[3],[0,0,-1]);
 // Dull slot screws sit in the rubbed walnut rim.
 paint(m,'brass','#aa9874');ctx.roughness(.57);
 for(const y of [.044,.297]){rod(m,[0,y,-.023],[0,y,-.028],.009,10);paint(m,'#514737');rod(m,[-.005,y,-.029],[.005,y,-.029],.0008,4);paint(m,'brass','#aa9874');}
 // Turned wall ferrule and a bent swan-neck arm, rather than a straight peg.
 rod(m,[0,.085,-.021],[0,.085,-.035],.022,12);
 const arm=[[0,.085,-.029],[0,.085,-.052],[0,.087,-.076],[0,.099,-.098],[0,.117,-.107],[0,.142,-.107]];
 for(let i=0;i<arm.length-1;i++)rod(m,arm[i],arm[i+1],.0065,8);
 lathe(m,[[.13,.015],[.135,.021],[.143,.021],[.147,.016],[.159,.016]],12,0,-.107);
 paint(m,'#ede0bc');ctx.emissive(.11,.075,.035);ctx.roughness(.38);
 lathe(m,[[.157,.012],[.165,.019],[.183,.025],[.202,.022],[.214,.012],[.217,0]],16,0,-.107);
 // Open-bottom half shade: cream flax, a softly faceted flare and stitched hems.
 paint(m,'cream');ctx.emissive(.035,.025,.013);
 const rows=[[.162,.11,.14],[.317,.073,.089]];
 const P=20;
 function point(row,i){const a=Math.PI*i/P;return [Math.cos(a)*row[1],row[0],-.03-Math.sin(a)*row[2]];}
 for(let i=0;i<P;i++){
  const a=Math.PI*(i+.5)/P;ctx.color(i%2?'#fff9ed':'#f4ead7');
  m.face([point(rows[0],i),point(rows[0],i+1),point(rows[1],i+1),point(rows[1],i)],[Math.cos(a),.15,-Math.sin(a)]);
 }
 paint(m,'cream','#e6d5b4');ctx.emissive(.022,.015,.008);
 for(const r of rows)for(let i=0;i<P;i++)rod(m,point(r,i),point(r,i+1),.0025,5);
 for(const i of [0,P])rod(m,point(rows[0],i),point(rows[1],i),.002,5);
 // Brass shade harp is visible through the open bottom, not another emitter.
 paint(m,'brass','#b4a382');ctx.roughness(.59);
 rod(m,[-.066,.311,-.03],[0,.247,-.107],.002,6);rod(m,[0,.247,-.107],[.066,.311,-.03],.002,6);
 return m.finish();
}
export function collider(ctx){
 // Compact wall contact only, wholly above the standing capsule.
 const m=mesh(ctx);const a=[[-.061,0,0],[.061,0,0],[.061,.34,0],[-.061,.34,0]];
 m.face(a,[0,0,1]);m.face(a.map(p=>[p[0],p[1],-.024]),[0,0,-1]);
 for(let i=0;i<4;i++){const j=(i+1)%4;m.face([a[i],a[j],[a[j][0],a[j][1],-.024],[a[i][0],a[i][1],-.024]],[i===1?1:i===3?-1:0,i===0?-1:i===2?1:0,0]);}
}
