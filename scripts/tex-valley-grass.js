export const meta = { filter: "linear" };
export function texture(ctx) {
  const g = ctx.canvas(128, 128), tone = ctx.params.tone;
  const forest = tone === "forest", upland = tone === "upland";
  g.fillStyle = forest ? "#5e8070" : upland ? "#6e9390" : "#769862"; g.fillRect(0, 0, 128, 128);
  const washes = forest ? ["#789179", "#527566", "#7c967d", "#607d6c"] : upland ? ["#789e98", "#60847f", "#8aa79e", "#68958f"] : ["#85a56b", "#688d59", "#9bb87b", "#6e9967"];
  for (let i = 0; i < 75; i++) {
    const x = ctx.random() * 128, y = ctx.random() * 128, r = 5 + ctx.random() * 18;
    g.globalAlpha = 0.1 + ctx.random() * 0.15; g.fillStyle = washes[i % 4];
    for (let u = -1; u <= 1; u++) for (let v = -1; v <= 1; v++) {
      g.beginPath(); g.ellipse(x + u * 128, y + v * 128, r, r * 0.63, i * 0.73, 0, Math.PI * 2); g.fill();
    }
  }
  const strokes = forest ? ["#99ae83", "#769879", "#4e7063", "#86a18b"] : upland ? ["#aac0ae", "#749a92", "#5b837e", "#9ab8a6"] : ["#a9c57d", "#769951", "#507d4a", "#94b76d"];
  g.globalAlpha = 0.4;
  for (let i = 0; i < 440; i++) {
    const x = ctx.random() * 128, y = ctx.random() * 128, h = 1 + ctx.random() * 4;
    g.strokeStyle = strokes[i % 4]; g.lineWidth = 0.65 + ctx.random() * 0.8;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 1.2, y - h * 0.6, x + ctx.random() * 2 - 1, y - h); g.stroke();
  }
  g.globalAlpha = 0.3;
  for (let i = 0; i < 55; i++) { g.fillStyle = i % 4 === 0 ? "#b0b28d" : "#758c70"; g.fillRect(ctx.random() * 128, ctx.random() * 128, 1.2, 0.8); }
  g.globalAlpha = 1;
}
