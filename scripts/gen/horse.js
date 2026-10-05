// A rescued horse on the shared quadruped kit: long legs, arched neck, long head, mane and a flowing tail.
// params.coat: bay | chestnut | dapple | piebald (Pip the pony is the same body at scale 0.72). Feet y 0, nose −Z.
import { build, skeleton as rig, spots, tube } from './lib-quadruped.js';
export const P = {
  L: 0.86, legX: 0.15, zf: -0.5, zb: 0.52, rFront: 0.075, rBack: 0.1, rFoot: 0.036, sock: 3,
  body: [[-0.78, 1.26, 0.13, 0.15], [-0.66, 1.24, 0.22, 0.27], [-0.36, 1.2, 0.25, 0.29], [0.02, 1.18, 0.24, 0.28], [0.4, 1.22, 0.25, 0.29], [0.66, 1.25, 0.21, 0.25], [0.8, 1.26, 0.09, 0.1]],
  neck: [[1.34, -0.6, 0.17], [1.6, -0.78, 0.13], [1.84, -0.92, 0.1], [1.98, -0.98, 0.09]], neckW: 0.75,
  head: [[-0.95, 2.0, 0.085, 0.1], [-1.05, 1.95, 0.09, 0.1], [-1.25, 1.78, 0.07, 0.08], [-1.4, 1.64, 0.065, 0.07], [-1.47, 1.58, 0.06, 0.06]], nose: [-1.5, 1.56], snoutFrom: 3, eyeRing: 1, eye: 0.02,
  ears: { x: 0.045, y: 2.06, z: -0.97, tx: 0.07, ty: 2.2, tz: -0.93, w: 0.03 },
  tail: [[1.24, 0.78, 0.05], [1.2, 0.84, 0.045]], tailEnd: [1.14, 0.88], tailTipFrom: 9,
};
export const COATS = {
  bay: { top: 'oklch(0.4 0.09 42)', coat: 'oklch(0.46 0.1 45)', belly: 'oklch(0.5 0.09 50)', leg: 'oklch(0.3 0.04 40)', dark: 'oklch(0.2 0.015 40)', snout: 'oklch(0.34 0.05 40)',
    throat: 'oklch(0.44 0.09 45)', earIn: 'oklch(0.3 0.04 40)', earOut: 'oklch(0.22 0.02 40)', tip: 'oklch(0.2 0.015 40)', mane: 'oklch(0.19 0.015 40)', sock: 2 },
  chestnut: { top: 'oklch(0.54 0.13 46)', coat: 'oklch(0.58 0.13 50)', belly: 'oklch(0.63 0.11 56)', leg: 'oklch(0.55 0.12 48)', dark: 'oklch(0.34 0.03 50)', snout: 'oklch(0.5 0.09 45)',
    throat: 'oklch(0.6 0.12 52)', earIn: 'oklch(0.5 0.09 45)', earOut: 'oklch(0.52 0.12 46)', tip: 'oklch(0.8 0.08 82)', mane: 'oklch(0.82 0.08 84)', blaze: 'oklch(0.95 0.01 90)', socks: 'oklch(0.95 0.01 90)' },
  dapple: { top: 'oklch(0.66 0.012 250)', coat: 'oklch(0.72 0.01 250)', belly: 'oklch(0.84 0.008 250)', leg: 'oklch(0.5 0.012 250)', dark: 'oklch(0.28 0.01 250)', snout: 'oklch(0.45 0.01 250)',
    throat: 'oklch(0.8 0.01 250)', earIn: 'oklch(0.55 0.01 250)', earOut: 'oklch(0.6 0.012 250)', tip: 'oklch(0.9 0.006 90)', mane: 'oklch(0.9 0.006 90)', dapples: 'oklch(0.86 0.008 250)' },
  piebald: { top: 'oklch(0.22 0.01 40)', coat: 'oklch(0.24 0.012 40)', belly: 'oklch(0.94 0.01 90)', leg: 'oklch(0.94 0.01 90)', dark: 'oklch(0.3 0.02 50)', snout: 'oklch(0.9 0.012 70)',
    throat: 'oklch(0.94 0.01 90)', earIn: 'oklch(0.3 0.01 40)', earOut: 'oklch(0.22 0.01 40)', tip: 'oklch(0.94 0.01 90)', mane: 'oklch(0.94 0.01 90)', patches: 'oklch(0.95 0.01 90)', sock: 1 },
};
export function skeleton() { return rig(P); }
function strip(ctx, pts, lift, back, col) {
  ctx.color(col);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], k = (i + 1) / pts.length;
    ctx.quad(a[0], a[1], a[2], b[0], b[1], b[2], b[0], b[1] + lift * (1 - k * 0.3), b[2] + back, a[0], a[1] + lift, a[2] + back);
  }
}
export function geometry(ctx) {
  ctx.smooth();
  const C = COATS[ctx.params.coat] || COATS.bay;
  const { lod, D } = build(ctx, { ...P, col: C, sock: C.sock ?? P.sock });
  // mane: a jagged ridge standing along the crest, forelock over the brow
  if (lod <= 4) {
    ctx.bone('neck');
    const ridge = P.neck.map(([y, z, r]) => [0, y + r * 0.92, z + r * 0.35]);
    strip(ctx, lod <= 2 ? ridge : [ridge[0], ridge[ridge.length - 1]], 0.13, 0.07, C.mane);
    if (lod <= 2) {
      ctx.color(C.mane);
      for (let i = 0; i < ridge.length - 1; i++) for (const s of [-1, 1]) {
        const a = ridge[i], b = ridge[i + 1];
        ctx.tri(a[0], a[1] + 0.05, a[2] + 0.04, b[0], b[1] + 0.05, b[2] + 0.04, (a[0] + b[0]) / 2 + s * 0.09, (a[1] + b[1]) / 2 - 0.12, (a[2] + b[2]) / 2 + 0.08);
      }
    }
    ctx.bone('head');
    ctx.color(C.mane);
    ctx.tri(-0.05, 2.08, -0.97, 0.05, 2.08, -0.97, 0, 1.96, -1.09);
    ctx.tri(0.05, 2.08, -0.97, -0.05, 2.08, -0.97, 0, 2.06, -0.9);
    if (C.blaze && lod <= 3) { ctx.color(C.blaze); const hd = P.head; for (let i = 1; i < hd.length - 1; i++) { const [z0, y0, rx0, ry0] = hd[i], [z1, y1, rx1, ry1] = hd[i + 1]; ctx.quad(-0.022, y0 + ry0 * 0.2, z0 - rx0 * 0.98, 0.022, y0 + ry0 * 0.2, z0 - rx0 * 0.98, 0.018, y1 + ry1 * 0.2, z1 - rx1 * 0.99, -0.018, y1 + ry1 * 0.2, z1 - rx1 * 0.99); } }
  }
  // the flowing tail hangs from the dock on the tail bone
  if (D.tailOn) {
    ctx.bone('tail');
    const rings = [{ c: [0, 1.2, 0.84], rx: 0.055, ry: 0.06 }, { c: [0, 1.0, 0.95], rx: 0.085, ry: 0.07 }, { c: [0, 0.72, 0.99], rx: 0.1, ry: 0.07 }, { c: [0, 0.48, 0.98], rx: 0.08, ry: 0.06 }];
    tube(ctx, lod >= 4 ? [rings[0], rings[3]] : rings, { sides: lod <= 2 ? 6 : 4, tip: [0, 0.34, 0.96], paint: (ctx) => ctx.color(C.tip), paintCap: (ctx) => ctx.color(C.tip) });
  }
  ctx.bone(null);
  if (D.spots) {
    if (C.dapples) {
      const list = []; for (const side of [-1, 1]) for (let i = 0; i < 12; i++) list.push([-0.6 + i * 0.11, -0.2 + ((i * 7) % 5) * 0.28, side]);
      spots(ctx, P, list, 0.05, C.dapples);
    }
    if (C.patches) spots(ctx, P, [[-0.45, 0.3, -1], [-0.35, -0.3, -1], [0.3, 0.1, -1], [0.55, 0.9, -1], [-0.2, 0.2, 1], [0.35, -0.2, 1], [0.1, 0.9, 1]], 0.17, C.patches);
  }
}
