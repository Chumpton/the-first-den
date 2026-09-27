export const meta={filter:'linear'};
export function texture(ctx){
 const g=ctx.canvas(256,256);g.fillStyle='#efe2c6';g.fillRect(0,0,256,256);
 for(let i=0;i<96;i++){const x=ctx.random()*256,y=ctx.random()*256,r=5+ctx.random()*28;g.fillStyle=i%2?'rgba(195,170,124,.036)':'rgba(255,252,222,.08)';for(const dx of [-256,0,256])for(const dy of [-256,0,256]){g.beginPath();g.ellipse(x+dx,y+dy,r,r*.58,ctx.random()*.5,0,Math.PI*2);g.fill();}}
 for(let i=0;i<480;i++){g.fillStyle=i%3?'rgba(142,117,79,.042)':'rgba(255,252,233,.2)';g.fillRect(ctx.random()*256,ctx.random()*256,ctx.random()*1.4+.4,ctx.random()*.8+.3);}
 for(let i=0;i<24;i++){const x=ctx.random()*256,y=ctx.random()*256;g.strokeStyle='rgba(255,249,219,.08)';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+7,y-3,x+18,y-1);g.stroke();}
}
