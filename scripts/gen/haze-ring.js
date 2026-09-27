// The low mist around the far ranges' feet: one open cylinder band (no caps) centred on home, standing inside the
// ranges' nearest faces so every peak rises out of it. The gradient (thick at the base, gone at the top) is
// scripts/material-haze-ring.js reading world height; this is only the card. Backdrop only: no collider.
const SEG = { 1: 128, 2: 96, 3: 72, 4: 48, 5: 32 };
export function geometry(ctx) {
  const { radius = 1850, height = 420, rows = 3 } = ctx.params;
  const n = SEG[ctx.lod] ?? 72, TAU = Math.PI * 2;
  ctx.flat();
  ctx.color("oklch(1 0 0)");
  for (let r = 0; r < rows; r++) {
    const y0 = (height * r) / rows, y1 = (height * (r + 1)) / rows;
    for (let i = 0; i < n; i++) {
      const a0 = (TAU * i) / n, a1 = (TAU * (i + 1)) / n;
      const x0 = Math.cos(a0) * radius, z0 = Math.sin(a0) * radius, x1 = Math.cos(a1) * radius, z1 = Math.sin(a1) * radius;
      ctx.quad(x0, y0, z0, x1, y0, z1, x1, y1, z1, x0, y1, z0); // faces draw both sides
    }
  }
}
export function collider() { return null; }
