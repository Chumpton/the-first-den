// A wolf den: a lair of heaped boulders round a dark mouth, the earth in front scuffed bare, a gnawed bone pile,
// a fallen log the pack lies along, a few dead branches. Faces -Z (the mouth). params: { size, seed }.
const STONE = ['#7d7a71', '#8b877c', '#6f6c64', '#99948a'], MOSS = ['#56733a', '#64823f'], DIRT = ['#5a4632', '#66503a', '#4e3c2b'];
const BONE = ['#e6dcc4', '#d8ccb0'], BARK = ['#4a3726', '#5a4430'], DARK = '#15110d';
function rock(ctx, cx, cy, cz, s, sq, mossy) {
  const seg = 7, lat = 4, rows = [];
  for (let i = 0; i <= lat; i++) { const ph = (i / lat) * Math.PI * 0.7, row = [];
    for (let j = 0; j < seg; j++) { const th = (j / seg) * Math.PI * 2 + (i % 2) * 0.4, k = i === 0 ? 1 : 0.78 + ctx.random() * 0.44;
      row.push([cx + Math.cos(th) * Math.sin(ph) * s * k, cy + Math.cos(ph) * s * sq * k - (i === lat ? s * 0.2 : 0), cz + Math.sin(th) * Math.sin(ph) * s * k * 0.9]); }
    rows.push(row); }
  const top = [cx, cy + s * sq, cz];
  for (let j = 0; j < seg; j++) { ctx.color(mossy ? MOSS[j % 2] : STONE[j % 4]); ctx.tri(...top, ...rows[1][(j + 1) % seg], ...rows[1][j]); }
  for (let i = 1; i < lat; i++) for (let j = 0; j < seg; j++) {
    ctx.color(mossy && i === 1 ? MOSS[(i + j) % 2] : STONE[(i * 3 + j) % 4]);
    ctx.quad(...rows[i][j], ...rows[i + 1][j], ...rows[i + 1][(j + 1) % seg], ...rows[i][(j + 1) % seg]); }
}
function cyl(ctx, a, b, r, col, sides = 6) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), u = d.map((v) => v / L);
  let t = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const c1 = [u[1] * t[2] - u[2] * t[1], u[2] * t[0] - u[0] * t[2], u[0] * t[1] - u[1] * t[0]], n1 = Math.hypot(...c1), x = c1.map((v) => v / n1);
  const y = [u[1] * x[2] - u[2] * x[1], u[2] * x[0] - u[0] * x[2], u[0] * x[1] - u[1] * x[0]];
  const ring = (p) => Array.from({ length: sides }, (_, i) => { const th = (i / sides) * Math.PI * 2; return [0, 1, 2].map((k) => p[k] + (x[k] * Math.cos(th) + y[k] * Math.sin(th)) * r); });
  const A = ring(a), B = ring(b); ctx.color(col);
  for (let i = 0; i < sides; i++) { const j = (i + 1) % sides; ctx.quad(...A[i], ...A[j], ...B[j], ...B[i]); }
  for (let i = 1; i < sides - 1; i++) { ctx.tri(...A[0], ...A[i + 1], ...A[i]); ctx.tri(...B[0], ...B[i], ...B[i + 1]); }
}
export function geometry(ctx) {
  const S = Number(ctx.params.size ?? 1); ctx.flat(); ctx.roughness(0.95);
  // scuffed earth: a ragged bare patch, pressed low
  const N = 14, R = 6.5 * S; ctx.color(DIRT[0]);
  const edge = Array.from({ length: N }, (_, i) => { const a = (i / N) * Math.PI * 2, r = R * (0.75 + ctx.random() * 0.35); return [Math.cos(a) * r, 0.04, Math.sin(a) * r * 0.85 - 1.5 * S]; });
  for (let i = 0; i < N; i++) { ctx.color(DIRT[i % 3]); ctx.tri(0, 0.05, -1.5 * S, ...edge[(i + 1) % N], ...edge[i]); }
  // the lair: a horseshoe of boulders behind, two capstones over a dark mouth
  ctx.color(DARK); ctx.quad(-1.3 * S, 0.06, 2.2 * S, 1.3 * S, 0.06, 2.2 * S, 1.1 * S, 1.9 * S, 2.6 * S, -1.1 * S, 1.9 * S, 2.6 * S);
  const heap = [[-2.6, 0, 2.4, 1.7, 0.9], [2.6, 0, 2.3, 1.8, 0.85], [-1.7, 0, 3.6, 1.6, 1.05], [1.6, 0, 3.7, 1.7, 1], [0, 0, 4.2, 2, 0.95],
    [-1.5, 1.4, 2.8, 1.25, 0.7], [1.4, 1.35, 2.9, 1.3, 0.7], [0, 2.1, 3.2, 1.6, 0.55], [-3.6, 0, 1.2, 1.1, 0.8], [3.5, 0, 1.0, 1.0, 0.85], [-4.3, 0, 3.1, 1.3, 0.8], [4.2, 0, 3.3, 1.2, 0.9]];
  const far = Number(ctx.lod ?? 1) >= 4;
  for (const [x, y, z, s, sq] of far ? heap.slice(0, 8) : heap) rock(ctx, x * S, y * S, z * S, s * S, sq, y > 1.5);
  if (far) return;
  // the fallen log the pack lies along, a gnawed bone pile, dead branches
  cyl(ctx, [-4.6 * S, 0.32, -1.2 * S], [-1.2 * S, 0.28, -3.6 * S], 0.32 * S, BARK[0], 7);
  cyl(ctx, [-3.6 * S, 0.5, -1.9 * S], [-3.9 * S, 1.1, -1.4 * S], 0.07 * S, BARK[1], 5);
  for (let i = 0; i < 11; i++) { const a = ctx.random() * 6.28, r = 0.2 + ctx.random() * 0.9, x = 2 * S + Math.cos(a) * r, z = -1.2 * S + Math.sin(a) * r, b = ctx.random() * 6.28, l = 0.3 + ctx.random() * 0.35;
    cyl(ctx, [x, 0.06, z], [x + Math.cos(b) * l, 0.06 + ctx.random() * 0.1, z + Math.sin(b) * l], 0.035, BONE[i % 2], 5);
    if (i % 3 === 0) rock(ctx, x + Math.cos(b) * l, 0.02, z + Math.sin(b) * l, 0.07, 0.9, false); }
  // a ribcage arching out of the dirt
  for (let i = 0; i < 5; i++) { const z = -2.6 * S + i * 0.18; cyl(ctx, [0.6 * S, 0.04, z], [0.75 * S, 0.45, z], 0.025, BONE[0], 4); cyl(ctx, [0.75 * S, 0.45, z], [0.95 * S, 0.04, z], 0.025, BONE[1], 4); }
  for (let i = 0; i < 6; i++) { const x = (ctx.random() - 0.5) * 9 * S, z = (ctx.random() - 0.8) * 6 * S, b = ctx.random() * 6.28;
    cyl(ctx, [x, 0.05, z], [x + Math.cos(b) * 1.2, 0.12, z + Math.sin(b) * 1.2], 0.04, BARK[i % 2], 5); }
}
