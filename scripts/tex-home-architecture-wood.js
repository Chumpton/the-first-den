export const meta={filter:'linear'};
export function texture(ctx){
  const g=ctx.canvas(256,256),species=ctx.params.species||'oak';
  const palette=species==='walnut'?['#72533a','#533b2c','#96724e']:species==='deck'?['#97764e','#745337','#b09669']:['#c89b60','#927041','#dfb87a'];
  g.fillStyle=palette[0];g.fillRect(0,0,256,256);
  for(let i=0;i<46;i++){const y=ctx.random()*256,w=2+ctx.random()*15;g.fillStyle=ctx.random()>.45?'rgba(255,223,170,.055)':'rgba(57,34,18,.045)';g.fillRect(0,y,256,w);}
  for(let i=0;i<126;i++){const y=ctx.random()*256,amp=.7+ctx.random()*3.4,phase=ctx.random()*6.28;
    g.beginPath();for(let x=0;x<=256;x+=8){const yy=y+Math.sin(x*.029+phase)*amp+Math.sin(x*.078+phase)*.45;if(x===0)g.moveTo(x,yy);else g.lineTo(x,yy);}g.strokeStyle=i%4===0?'rgba(255,226,167,.17)':'rgba(65,41,21,.12)';g.lineWidth=i%5===0?1:.48;g.stroke();}
  for(let k=0;k<3;k++){const x=ctx.random()*256,y=ctx.random()*256;for(let wrap=-1;wrap<=1;wrap++)for(let j=4;j>=0;j--){g.beginPath();g.ellipse(x+wrap*256,y,5+j*3.9,1.2+j*1.24,-.08,0,Math.PI*2);g.strokeStyle='rgba(58,34,15,.13)';g.lineWidth=.65;g.stroke();}}
  for(let i=0;i<150;i++){g.fillStyle=ctx.random()>.5?'rgba(254,231,184,.13)':'rgba(62,38,20,.08)';g.fillRect(ctx.random()*256,ctx.random()*256,2+ctx.random()*8,.45);}
  if(species==='deck'){for(let y=0;y<256;y+=48){g.fillStyle='rgba(38,27,18,.2)';g.fillRect(0,y,256,1);g.fillStyle='rgba(255,228,179,.1)';g.fillRect(0,y+1,256,1);}}
}
