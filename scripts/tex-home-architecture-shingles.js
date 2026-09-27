export const meta={filter:'linear'};
export function texture(ctx){
 const g=ctx.canvas(128,128);g.fillStyle='#554a3e';g.fillRect(0,0,128,128);
 for(let i=0;i<75;i++){const y=ctx.random()*128;g.strokeStyle=i%3?'rgba(26,23,21,.2)':'rgba(167,146,112,.15)';g.lineWidth=.45+ctx.random()*.7;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(35,y-1,85,y+2,128,y);g.stroke();}
 for(let i=0;i<150;i++){g.fillStyle=i%4?'rgba(10,15,16,.07)':'rgba(190,174,137,.12)';g.fillRect(ctx.random()*128,ctx.random()*128,1+ctx.random()*4,.5);}
}
