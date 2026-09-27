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
      const r1 = N.ridged({ x, z, frequency: 1 / 1400, octaves: 5 }) / 1.9;
      const r2 = N.ridged({ x: x + 917, z: z - 311, frequency: 1 / 330, octaves: 3 }) / 1.75;
      let h = height * mass * endX * edgeZ * (0.6 + 0.5 * r1 + 0.1 * r2);
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
    const line = 0.4 + n * 0.1 + ctx.random() * 0.06;
    const snow = SS(line, line + 0.06, f) * (SS(2.4, 1.3, slope) * 0.85 + 0.15 + (ctx.random() < f - 0.35 ? 0.4 : 0));
    if (snow > 0.5) {
      const l = 0.9 + 0.07 * snow; ctx.color(`oklch(${l.toFixed(3)} 0.012 245)`);
    } else if (f > 0.22) {
      const l = 0.43 + ctx.random() * 0.045 + snow * 0.25 + (f - 0.22) * 0.1;
      ctx.color(`oklch(${l.toFixed(3)} 0.035 ${(245 + n * 30).toFixed(0)})`);
    } else {
      const t = SS(0.02, 0.22, f); // low flanks under forest, bluing into rock
      ctx.color(`oklch(${(0.4 + t * 0.12).toFixed(3)} ${(0.045 - t * 0.017).toFixed(3)} ${(170 + t * 75).toFixed(0)})`);
    }
    const tl = 0.3 + n * 0.08, dens = SS(tl, tl - 0.09, f) * SS(1.5, 0.8, slope) * SS(-0.06, 0.02, f); // the forest climbs the flanks and stops under the rock
    if (dens > 0.35 && snow < 0.3) ctx.color(`oklch(${(0.34 + ctx.random() * 0.04).toFixed(3)} 0.055 ${(148 + n * 20).toFixed(0)})`);
    ctx.quad(x0, a, z0, x0, b, z1, x1, c, z1, x1, d, z0);
    const per = ctx.lod <= 2 ? 3 : ctx.lod === 3 ? 1 : 0;
    for (let k = 0; k < per && dens > 0.05; k++) {
      if (ctx.random() > dens * 0.9) continue;
      const s = ctx.random(), t = ctx.random(), gy = a * (1 - s) * (1 - t) + b * (1 - s) * t + c * s * t + d * s * (1 - t) - 4;
      const tx = x0 + s * dx, tz = z0 + t * dz, th = Math.max(16, dx * 0.55) * (0.65 + ctx.random() * 0.6), tr = th * 0.28, rot = ctx.random() * 6.28;
      ctx.color(`oklch(${(0.3 + ctx.random() * 0.07).toFixed(3)} ${(0.05 + ctx.random() * 0.03).toFixed(3)} ${(145 + ctx.random() * 25).toFixed(0)})`);
      const p = [0, 1, 2].map((q) => [tx + Math.cos(rot + q * 2.094) * tr, gy, tz + Math.sin(rot + q * 2.094) * tr]);
      for (let q = 0; q < 3; q++) { const A = p[q], B = p[(q + 1) % 3]; ctx.tri(A[0], A[1], A[2], tx, gy + th, tz, B[0], B[1], B[2]); ctx.tri(A[0], A[1], A[2], B[0], B[1], B[2], tx, gy + th, tz); }
    }
  }
}
export function collider() { return null; }
