// A distant mountain range: one heightfield band, width along local X, depth along Z, the face toward local −Z
// (spawn with rotation: { lookAt: home }). Peaks are seeded massifs roughened by ridged noise; vertex colours carry
// rock → snow by height and slope; scripts/material-far-range.js adds the air in front of it. Backdrop only: no collider.
const SS = (a, b, t) => { const x = Math.min(1, Math.max(0, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
const GRID = { 1: [150, 42], 2: [112, 32], 3: [84, 24], 4: [56, 16], 5: [36, 10] };

export function geometry(ctx) {
  const { width = 4200, depth = 1600, height = 1400, peaks = 5 } = ctx.params;
  const [nx, nz] = GRID[ctx.lod] ?? GRID[3];
  const hw = width / 2, hd = depth / 2;
  const N = ctx.noise;
  // seeded massifs: where the tall summits stand
  const P = [];
  for (let i = 0; i < peaks; i++) P.push({
    u: -0.78 + 1.56 * ((i + 0.2 + ctx.random() * 0.6) / peaks),
    v: -0.35 + ctx.random() * 0.55,
    a: i === ((peaks * 0.5) | 0) ? 1 : 0.5 + ctx.random() * 0.45,
    ru: 0.1 + ctx.random() * 0.12, rv: 0.28 + ctx.random() * 0.2,
  });
  const H = [];
  for (let j = 0; j <= nz; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) {
      const u = -1 + (2 * i) / nx, v = -1 + (2 * j) / nz;
      const x = u * hw, z = v * hd;
      const endX = SS(1, 0.72, Math.abs(u)), edgeZ = SS(1, 0.55, Math.abs(v));
      let mass = 0.3 * Math.exp(-(v * v) / 0.3);
      for (const p of P) mass += p.a * Math.exp(-(((u - p.u) / p.ru) ** 2 + ((v - p.v) / p.rv) ** 2));
      mass = mass / (1 + mass * 0.35) * 1.35; // soft cap, so massifs merge into a chain
      const r1 = N.ridged({ x, z, frequency: 1 / 1100, octaves: 5 }) / 1.9;
      const r2 = N.ridged({ x: x + 917, z: z - 311, frequency: 1 / 330, octaves: 3 }) / 1.75;
      let h = height * mass * endX * edgeZ * (0.55 + 0.55 * r1 + 0.18 * r2);
      h -= 140 * (1 - endX * edgeZ); // the skirt sinks under the far haze
      row.push(Math.max(-140, h));
    }
    H.push(row);
  }
  ctx.flat();
  ctx.roughness(0.95);
  const dx = width / nx, dz = depth / nz;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x0 = -hw + i * dx, x1 = x0 + dx, z0 = -hd + j * dz, z1 = z0 + dz;
    const a = H[j][i], b = H[j + 1][i], c = H[j + 1][i + 1], d = H[j][i + 1];
    const hm = (a + b + c + d) / 4, f = hm / height;
    const slope = Math.hypot((d + c - a - b) / (2 * dx), (b + c - a - d) / (2 * dz));
    const n = N.fbm2({ x: x0 + 3000, z: z0, frequency: 1 / 420, octaves: 3 });
    const line = 0.52 + n * 0.12 + ctx.random() * 0.05;
    const snow = SS(line, line + 0.08, f) * SS(1.35, 0.85, slope);
    if (snow > 0.5) {
      const l = 0.9 + 0.07 * snow; ctx.color(`oklch(${l.toFixed(3)} 0.012 245)`);
    } else if (f > 0.22) {
      const l = 0.5 + ctx.random() * 0.07 + snow * 0.2 + (f - 0.22) * 0.12;
      ctx.color(`oklch(${l.toFixed(3)} 0.028 ${(245 + n * 30).toFixed(0)})`);
    } else {
      const t = SS(0.02, 0.22, f); // low flanks under forest, bluing into rock
      ctx.color(`oklch(${(0.4 + t * 0.12).toFixed(3)} ${(0.045 - t * 0.017).toFixed(3)} ${(170 + t * 75).toFixed(0)})`);
    }
    ctx.quad(x0, a, z0, x0, b, z1, x1, c, z1, x1, d, z0);
  }
}
export function collider() { return null; }
