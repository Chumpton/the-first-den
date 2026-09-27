// The horizon ring: one closed band of low-poly ranges around the world centre, inside the fog.
// params.layer = "hills" (forested foothills, dotted with cone pines at close LODs) | "peaks" (blue-grey rock, snow caps).
// params: r0, r1 (inner/outer radius m), amp, base, gaps: [[angleDeg, coreHalfDeg, blendHalfDeg]] where the band sinks
// below ground (road corridors, city sightlines). Angle = atan2(z, x) in local metres. No collider.
const TAU = Math.PI * 2;
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
function angDiff(a, b) { let d = (a - b) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return Math.abs(d); }
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod || 1, peaks = p.layer === "peaks";
  const r0 = +(p.r0 ?? 520), r1 = +(p.r1 ?? 640), amp = +(p.amp ?? 70), base = +(p.base ?? 18);
  const gaps = p.gaps || [];
  const A = [0, 176, 128, 96, 60, 36][lod], R = [0, 7, 6, 5, 3, 2][lod];
  const N = ctx.noise, seed = +(ctx.seed ?? 1);
  const H = [], P = [];
  for (let j = 0; j <= R; j++) {
    H.push([]); P.push([]);
    const u = j / R, rr = r0 + (r1 - r0) * u;
    const prof = peaks ? Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.9) : Math.pow(Math.sin(Math.PI * u), 0.75);
    for (let i = 0; i < A; i++) {
      const th = i / A * TAU, deg = th * 180 / Math.PI, x = Math.cos(th) * rr, z = Math.sin(th) * rr;
      let g = 1;
      for (const [c, core, blend] of gaps) g = Math.min(g, sstep(core, blend, angDiff(deg, c)));
      let n;
      if (peaks) n = N.ridged({ x, z, frequency: 1 / 260, octaves: 3, seed: seed + 3 }) / 1.75 * 0.75 + (N.fbm2({ x, z, frequency: 1 / 900, octaves: 2, seed }) * 0.5 + 0.5) * 0.5;
      else n = (N.fbm2({ x, z, frequency: 1 / 170, octaves: 3, seed: seed + 7 }) * 0.5 + 0.5) * 0.8 + (N.fbm2({ x, z, frequency: 1 / 700, octaves: 2, seed }) * 0.5 + 0.5) * 0.45;
      const h = (base + amp * Math.max(0, n)) * prof;
      H[j].push(j === 0 || j === R ? -8 : h * g - 12 * (1 - g));
      P[j].push([x, z]);
    }
  }
  ctx.flat(); ctx.roughness(0.95);
  const topH = base + amp * 1.1;
  for (let j = 0; j < R; j++) for (let i = 0; i < A; i++) {
    const k = (i + 1) % A;
    const a = [P[j][i][0], H[j][i], P[j][i][1]], b = [P[j][k][0], H[j][k], P[j][k][1]];
    const c = [P[j + 1][k][0], H[j + 1][k], P[j + 1][k][1]], d = [P[j + 1][i][0], H[j + 1][i], P[j + 1][i][1]];
    const hm = (a[1] + b[1] + c[1] + d[1]) / 4, t = hm / topH, jit = ((i * 7 + j * 13) % 5) / 5;
    if (hm < -2) continue;
    if (peaks) {
      if (t > 0.66 + jit * 0.08) ctx.color("oklch(0.95 0.012 240)");
      else if (t > 0.3) ctx.color(`oklch(${0.56 + jit * 0.06} 0.03 ${245 + jit * 10})`);
      else ctx.color(`oklch(${0.46 + jit * 0.04} 0.045 185)`);
    } else ctx.color(`oklch(${0.4 + jit * 0.07 + t * 0.06} ${0.075 - t * 0.02} ${138 + jit * 12})`);
    ctx.quad(...a, ...b, ...c, ...d);
  }
  // cone pines along the foothills: close LODs only, they only have to break the silhouette
  if (!peaks && lod <= 2) {
    const count = lod === 1 ? 420 : 220;
    for (let q = 0; q < count; q++) {
      const i = Math.floor(ctx.random() * A), j = 1 + Math.floor(ctx.random() * (R - 1));
      const h0 = H[j][i]; if (h0 < 6) continue;
      const [x, z] = P[j][i], s = 7 + ctx.random() * 7, w = s * 0.32, y = h0 - 1;
      ctx.color(`oklch(${0.33 + ctx.random() * 0.06} 0.07 150)`);
      const pts = [0, 1, 2].map((m) => { const a = m / 3 * TAU + q; return [x + Math.cos(a) * w, y, z + Math.sin(a) * w]; });
      for (let m = 0; m < 3; m++) { const A1 = pts[m], B1 = pts[(m + 1) % 3]; ctx.tri(...A1, ...B1, x, y + s, z); }
    }
  }
}
export function collider() { return null; }
