// A mossy forest boulder: one lumpy flat-shaded stone, moss on its crown. params: { size, squash, moss }. Feet at the ground.
const STONE = ["#8d8a80", "#9c988c", "#aba699"], MOSS = ["#5f7f3c", "#6e8f44", "#7f9d4d"];
export function geometry(ctx) {
  const lod = Number(ctx.lod ?? 1), s = Number(ctx.params.size ?? 1), sq = Number(ctx.params.squash ?? 0.62), mossy = Number(ctx.params.moss ?? 0.45);
  const seg = lod >= 4 ? 5 : lod >= 3 ? 6 : 9, lat = lod >= 4 ? 3 : lod >= 3 ? 4 : 6, rows = [];
  ctx.albedo(lod <= 2 ? "cdn/texture-weathered-pale-limestone-surface.png" : null); ctx.roughness(0.95); ctx.flat();
  for (let i = 0; i <= lat; i++) {
    const v = i / lat, phi = v * Math.PI * 0.62, row = []; // stop short of the underside: it sits sunk in the ground
    for (let j = 0; j < seg; j++) {
      const th = j / seg * Math.PI * 2 + (i % 2) * Math.PI / seg, k = i === 0 ? 1 : 0.8 + ctx.random() * 0.4;
      const r = Math.sin(phi) * s * k, y = Math.cos(phi) * s * sq * k;
      row.push([Math.cos(th) * r, y - (i === lat ? s * 0.12 : 0), Math.sin(th) * r * 0.85]);
    }
    rows.push(row);
  }
  const top = [0, s * sq * 1.02, 0];
  for (let j = 0; j < seg; j++) { ctx.color(MOSS[j % 3]); ctx.tri(...top, ...rows[1][(j + 1) % seg], ...rows[1][j]); }
  for (let i = 1; i < lat; i++) for (let j = 0; j < seg; j++) {
    const a = rows[i][j], b = rows[i][(j + 1) % seg], c = rows[i + 1][(j + 1) % seg], d = rows[i + 1][j];
    ctx.color(i / lat < mossy ? MOSS[(i + j) % 3] : STONE[(i * 3 + j) % 3]);
    ctx.quad(...a, ...d, ...c, ...b);
  }
}
export function collider(ctx) { const s = Number(ctx.params.size ?? 1), sq = Number(ctx.params.squash ?? 0.62); return { kind: "box", width: s * 1.6, height: s * sq * 1.8, depth: s * 1.4 }; }
