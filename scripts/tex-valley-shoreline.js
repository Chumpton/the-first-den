export const meta = { filter: "linear" };
export function texture(ctx) {
  const g = ctx.canvas(128, 128);
  g.fillStyle = "#bbb59a"; g.fillRect(0, 0, 128, 128);
  const palette=["#c9c5a8","#a2ac99","#d1c7aa","#9eab9e","#b6b89f"];
  for(let i=0;i<900;i++) { g.globalAlpha=0.2+ctx.random()*0.25; g.fillStyle=palette[i%5]; g.fillRect(ctx.random()*128,ctx.random()*128,0.5+ctx.random()*2.1,0.4+ctx.random()*1.1); }
  g.globalAlpha=0.7;
  for(let i=0;i<90;i++) {
    const x=ctx.random()*128,y=ctx.random()*128,r=0.7+ctx.random()*2.9;
    for(let u=-1;u<=1;u++) for(let v=-1;v<=1;v++) {
      const a=x+u*128,b=y+v*128; g.fillStyle="#8c9c90"; g.beginPath(); g.ellipse(a,b+0.4,r,r*0.55,i,0,Math.PI*2);g.fill();
      g.fillStyle=palette[i%5];g.beginPath();g.ellipse(a,b,r*0.93,r*0.5,i,0,Math.PI*2);g.fill();
    }
  }
  g.globalAlpha=1;
}
