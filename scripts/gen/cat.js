// A house cat on the shared quadruped kit: short legs, round head, upright ears, a long thin tail; coats by params.coat.
import { build, skeleton as rig, spots } from './lib-quadruped.js';
const BASE = {
  L: 0.17, legX: 0.045, zf: -0.15, zb: 0.15, rFront: 0.02, rBack: 0.03, rFoot: 0.016, sock: 9,
  body: [[-0.22, 0.235, 0.035, 0.04], [-0.19, 0.245, 0.06, 0.07], [-0.08, 0.245, 0.068, 0.075], [0.06, 0.24, 0.066, 0.072], [0.16, 0.25, 0.064, 0.07], [0.21, 0.255, 0.04, 0.042], [0.235, 0.26, 0.02, 0.02]],
  neck: [[0.26, -0.18, 0.045], [0.31, -0.21, 0.042], [0.35, -0.22, 0.04]],
  head: [[-0.2, 0.35, 0.05, 0.05], [-0.25, 0.36, 0.066, 0.058], [-0.3, 0.35, 0.055, 0.048], [-0.33, 0.335, 0.028, 0.024]], nose: [-0.345, 0.335], snoutFrom: 3, eyeRing: 2, eye: 0.001,
  ears: { x: 0.028, y: 0.395, z: -0.255, tx: 0.046, ty: 0.465, tz: -0.25, w: 0.022 },
  tail: [[0.25, 0.22, 0.02], [0.24, 0.3, 0.018], [0.3, 0.38, 0.017], [0.4, 0.41, 0.015], [0.5, 0.4, 0.013]], tailEnd: [0.56, 0.37], tailTipFrom: 9,
};
const COATS = {
  ginger: { col: { top: 'oklch(0.63 0.15 52)', coat: 'oklch(0.72 0.14 60)', belly: 'oklch(0.93 0.04 80)', dark: 'oklch(0.62 0.08 20)', snout: 'oklch(0.93 0.04 80)', snoutTop: 'oklch(0.72 0.14 60)',
    throat: 'oklch(0.93 0.04 80)', earIn: 'oklch(0.75 0.08 15)', earOut: 'oklch(0.63 0.15 52)', tip: 'oklch(0.6 0.15 50)' }, iris: 'oklch(0.72 0.15 75)', nose: 'oklch(0.68 0.1 15)',
    stripes: 'oklch(0.54 0.15 45)' },
  black: { col: { top: 'oklch(0.19 0.01 280)', coat: 'oklch(0.22 0.012 280)', belly: 'oklch(0.25 0.012 280)', dark: 'oklch(0.2 0.01 280)', snout: 'oklch(0.25 0.012 280)', throat: 'oklch(0.24 0.01 280)',
    earIn: 'oklch(0.32 0.02 20)', earOut: 'oklch(0.19 0.01 280)', tip: 'oklch(0.2 0.01 280)' }, iris: 'oklch(0.78 0.17 125)', nose: 'oklch(0.2 0.01 280)' },
  calico: { col: { top: 'oklch(0.95 0.015 85)', coat: 'oklch(0.95 0.015 85)', belly: 'oklch(0.97 0.01 85)', dark: 'oklch(0.7 0.07 15)', snout: 'oklch(0.97 0.01 85)', throat: 'oklch(0.97 0.01 85)',
    earIn: 'oklch(0.78 0.07 15)', earOut: 'oklch(0.28 0.02 40)', tip: 'oklch(0.28 0.02 40)' }, iris: 'oklch(0.75 0.14 100)', nose: 'oklch(0.72 0.09 15)', tipFrom: 3,
    patches: [['oklch(0.66 0.15 55)', [[-0.12, 1.3, 1], [-0.06, 1.0, 1], [0.12, 1.5, -1], [0.16, 1.1, -1], [0.02, 0.6, 1]]], ['oklch(0.25 0.02 40)', [[0.0, 1.4, -1], [0.06, 1.1, -1], [-0.16, 1.2, -1], [0.14, 0.9, 1], [0.18, 1.35, 1]]]] },
};
const P_OF = (coat) => { const K = COATS[coat] || COATS.ginger; return { ...BASE, col: K.col, tailTipFrom: K.tipFrom ?? 9 }; };
export function skeleton() { return rig(BASE); }
export function geometry(ctx) {
  ctx.smooth();
  const coat = ctx.params.coat || 'ginger', K = COATS[coat] || COATS.ginger, P = P_OF(coat), lod = ctx.lod ?? 1;
  build(ctx, P);
  if (lod <= 2) {
    ctx.bone('root');
    if (K.stripes) { const l = []; for (let z = -0.16; z <= 0.19; z += 0.055) for (const s of [-1, 1]) { l.push([z, 1.35, s], [z + 0.02, 0.85, s]); } spots(ctx, P, l, 0.022, K.stripes); }
    if (K.patches) for (const [col, list] of K.patches) spots(ctx, P, list, 0.05, col);
    // face: slit-pupil eyes, a nose, whiskers
    ctx.bone('head');
    const [z, y, rx] = P.head[2];
    for (const s of [-1, 1]) {
      const x = s * (rx * 0.8 + 0.006), yy = y + 0.012, zz = z + 0.004, e = 0.012;
      ctx.color(K.iris); ctx.emissive(K.iris); ctx.quad(x, yy + e, zz, x, yy, zz - e * 1.1, x, yy - e, zz, x, yy, zz + e * 1.1); ctx.emissive(null);
      const xp = x + s * 0.001; ctx.color('oklch(0.12 0.01 40)'); ctx.quad(xp, yy + e * 0.85, zz, xp, yy, zz - 0.0025, xp, yy - e * 0.85, zz, xp, yy, zz + 0.0025);
      if (lod <= 1) { ctx.color('oklch(0.96 0.01 90)'); for (const dy of [-0.004, 0.004]) { const x0 = s * 0.022, x1 = s * 0.075; ctx.quad(x0, 0.33 + dy, -0.325, x1, 0.335 + dy * 3, -0.315, x1, 0.337 + dy * 3, -0.315, x0, 0.332 + dy, -0.325); } }
    }
    ctx.color(K.nose); ctx.tri(-0.01, 0.345, -0.337, 0.01, 0.345, -0.337, 0, 0.335, -0.347);
    ctx.bone(null);
  }
}
