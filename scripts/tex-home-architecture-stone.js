export const meta={filter:'linear'};
export function texture(ctx){
 const g=ctx.canvas(256,256);g.fillStyle='#b9aa8d';g.fillRect(0,0,256,256);
 for(let i=0;i<175;i++){const x=ctx.random()*256,y=ctx.random()*256,r=2+ctx.random()*17;g.fillStyle=i%3?'rgba(73,69,56,.065)':'rgba(248,236,197,.1)';for(const dx of [-256,0,256])for(const dy of [-256,0,256]){g.beginPath();g.ellipse(x+dx,y+dy,r,r*.5,ctx.random()*3,0,Math.PI*2);g.fill();}}
 for(let i=0;i<350;i++){g.fillStyle=i%2?'rgba(44,47,39,.09)':'rgba(255,247,216,.18)';g.fillRect(ctx.random()*256,ctx.random()*256,ctx.random()*2+1,ctx.random()+.5);}
 for(let i=0;i<7;i++){const x=ctx.random()*256,y=ctx.random()*256;g.strokeStyle='rgba(58,58,48,.08)';g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+8,y+2);g.lineTo(x+13,y+1);g.stroke();}
}
