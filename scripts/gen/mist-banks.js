// Low mist banks over the distant river valleys: each bank is nested translucent half-ellipsoids (denser core,
// feathered edge), all banks one mesh. params.banks: [[x, z, halfLen, halfWid, height, yawDeg]] local metres.
const TAU = Math.PI * 2;
export function geometry(ctx) {
  const lod = ctx.lod || 1, banks = ctx.params.banks || [];
  const seg = lod >= 4 ? 8 : lod >= 3 ? 10 : 14, rings = lod >= 4 ? 2 : 3, shells = lod >= 4 ? 1 : lod >= 3 ? 2 : 3;
  ctx.smooth(); ctx.roughness(1); ctx.emissive("oklch(0.5 0.01 240)");
  for (const [bx, bz, L, W, Ht, yaw] of banks) {
    const cy = Math.cos(yaw * Math.PI / 180), sy = Math.sin(yaw * Math.PI / 180);
    for (let s = 0; s < shells; s++) {
      const k = 1 - s * 0.3;
      ctx.color("oklch(0.95 0.01 235)", shells === 1 ? 0.22 : 0.1);
      const pt = (ri, a) => {
        const ph = ri / rings * Math.PI / 2, r = Math.cos(ph), y = Math.sin(ph) * Ht * k - 3;
        const lx = Math.cos(a) * L * k * r, lz = Math.sin(a) * W * k * r;
        return [bx + lx * cy + lz * sy, y, bz - lx * sy + lz * cy];
      };
      for (let ri = 0; ri < rings; ri++) for (let m = 0; m < seg; m++) {
        const a0 = m / seg * TAU, a1 = (m + 1) / seg * TAU;
        if (ri === rings - 1) ctx.tri(...pt(ri, a0), ...pt(ri, a1), ...pt(rings, 0));
        else ctx.quad(...pt(ri, a0), ...pt(ri, a1), ...pt(ri + 1, a1), ...pt(ri + 1, a0));
      }
    }
  }
}
export function collider() { return null; }
