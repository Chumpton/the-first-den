// A wild wolf of the dens: the pet wolf's body (animal-wolf) in a den's coat. params: { coat }.
import { build, skeleton as rig } from './lib-quadruped.js';
import { P as BASE } from './animal-wolf.js';
const COATS = {
  moss:  { top: 'oklch(0.44 0.03 120)', coat: 'oklch(0.58 0.03 110)', leg: 'oklch(0.5 0.03 110)', snoutTop: 'oklch(0.56 0.03 110)', earOut: 'oklch(0.4 0.03 120)' },
  grey:  {},
  ash:   { top: 'oklch(0.3 0.008 250)', coat: 'oklch(0.42 0.01 250)', leg: 'oklch(0.36 0.01 250)', snoutTop: 'oklch(0.4 0.01 250)', earOut: 'oklch(0.28 0.01 250)', belly: 'oklch(0.7 0.01 250)', snout: 'oklch(0.66 0.01 250)', throat: 'oklch(0.7 0.01 250)', tip: 'oklch(0.75 0.01 250)' },
  rust:  { top: 'oklch(0.42 0.09 45)', coat: 'oklch(0.56 0.1 50)', leg: 'oklch(0.46 0.08 45)', snoutTop: 'oklch(0.55 0.1 50)', earOut: 'oklch(0.38 0.08 40)' },
  dread: { top: 'oklch(0.2 0.01 280)', coat: 'oklch(0.27 0.012 280)', leg: 'oklch(0.22 0.01 280)', snoutTop: 'oklch(0.27 0.01 280)', earOut: 'oklch(0.18 0.01 280)', belly: 'oklch(0.45 0.01 280)', snout: 'oklch(0.42 0.01 280)', throat: 'oklch(0.45 0.01 280)', tip: 'oklch(0.55 0.01 280)', earIn: 'oklch(0.35 0.04 20)' },
  grim:  { top: 'oklch(0.14 0.01 280)', coat: 'oklch(0.2 0.012 280)', leg: 'oklch(0.16 0.01 280)', snoutTop: 'oklch(0.2 0.01 280)', earOut: 'oklch(0.12 0.01 280)', belly: 'oklch(0.32 0.03 25)', snout: 'oklch(0.3 0.02 25)', throat: 'oklch(0.85 0.02 85)', tip: 'oklch(0.88 0.02 85)', earIn: 'oklch(0.4 0.12 25)', dark: 'oklch(0.1 0.01 280)' },
};
const PARAM = (coat) => ({ ...BASE, col: { ...BASE.col, ...(COATS[coat] || {}) } });
export function skeleton() { return rig(BASE); }
export function geometry(ctx) {
  const P = PARAM(ctx.params.coat || 'grey');
  build(ctx, P);
  // a scar of hackles: a ridge of darker fur tufts along the spine, thicker on the big ones
  ctx.bone('root'); ctx.color(P.col.top);
  const n = ctx.params.coat === 'grim' ? 7 : 4;
  for (let i = 0; i < n; i++) { const z = -0.42 + i * (0.6 / n), y = 0.83 - Math.abs(z + 0.2) * 0.12, h = 0.07 + (i < 2 ? 0.03 : 0);
    ctx.tri(-0.035, y - 0.02, z - 0.05, 0.035, y - 0.02, z - 0.05, 0, y + h, z + 0.04); ctx.tri(0.035, y - 0.02, z - 0.05, -0.035, y - 0.02, z - 0.05, 0, y + h, z + 0.04); }
  if (ctx.params.coat === 'grim' || ctx.params.coat === 'dread') { // ember eyes over the dark coat
    const [z, y, rx, ry] = P.head[P.eyeRing]; if (ctx.params.coat === 'grim') ctx.emissive(3, 0.5, 0.15); else ctx.emissive(2.6, 1.4, 0.3); ctx.color(ctx.params.coat === 'grim' ? '#ff4a24' : '#ffc04a');
    for (const s of [-1, 1]) { const x = s * (rx * 0.86 + 0.008), yy = y + ry * 0.3, e = 0.02; ctx.quad(x, yy + e, z, x, yy, z - e * 1.2, x, yy - e, z, x, yy, z + e * 1.2); }
    ctx.emissive(null);
  }
}
