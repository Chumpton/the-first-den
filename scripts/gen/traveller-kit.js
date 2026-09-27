// Road travellers' shared body kit: a low-poly person (standing or seated), a horse on the shared quadruped rig,
// saddle, spoked wheel. Feet at y 0, facing −Z. Colours come from params so every traveller is a data row.
import { build, skeleton as quadRig, tube } from './lib-quadruped.js';
import { Q, T, box } from '../lib/road-solid.js';
export { tube, box, Q, T };
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const PAL = {
  skin: 'oklch(0.78 0.07 55)', walnut: 'oklch(0.36 0.05 50)', leather: 'oklch(0.52 0.08 60)', honey: 'oklch(0.66 0.1 70)',
  linen: 'oklch(0.93 0.03 85)', linen2: 'oklch(0.88 0.035 82)', iron: 'oklch(0.3 0.01 250)', slate: 'oklch(0.38 0.02 250)', oak: 'oklch(0.62 0.08 65)', dark: 'oklch(0.22 0.03 50)',
};
// a ctx whose faces land offset by o (a seated body, a horse in the shafts)
export function shifted(ctx, o) {
  return {
    lod: ctx.lod, params: ctx.params, flat: () => ctx.flat(), smooth: () => ctx.smooth(), roughness: (v) => ctx.roughness(v), metalness: (v) => ctx.metalness(v),
    emissive: (...a) => ctx.emissive(...a), color: (...a) => ctx.color(...a), bone: (b) => ctx.bone(b),
    quad: (...p) => ctx.quad(p[0] + o[0], p[1] + o[1], p[2] + o[2], p[3] + o[0], p[4] + o[1], p[5] + o[2], p[6] + o[0], p[7] + o[1], p[8] + o[2], p[9] + o[0], p[10] + o[1], p[11] + o[2]),
    tri: (...p) => ctx.tri(p[0] + o[0], p[1] + o[1], p[2] + o[2], p[3] + o[0], p[4] + o[1], p[5] + o[2], p[6] + o[0], p[7] + o[1], p[8] + o[2]),
  };
}
export const sidesOf = (lod) => (lod <= 2 ? 8 : lod <= 3 ? 6 : 4);
export function rod(ctx, a, b, r, n = 5, caps = true) { tube(ctx, [{ c: a, rx: r, ry: r }, { c: b, rx: r, ry: r }], { sides: n, capStart: caps, capEnd: caps }); }
export function blob(ctx, c, rx, ry, rz, n = 6) {
  const lat = n >= 8 ? [-70, -35, 0, 35, 70] : n >= 6 ? [-60, 0, 60] : [-40, 40];
  const rings = lat.map((a) => { const t = (a * Math.PI) / 180; return { c: [c[0], c[1] + ry * Math.sin(t), c[2]], rx: rx * Math.cos(t), ry: rz * Math.cos(t) }; });
  tube(ctx, rings, { sides: n, dir: [0, 1, 0], capStart: true, tip: [c[0], c[1] + ry, c[2]] });
}
// a strip wrapped over a body's back: an arc a0..a1 (degrees, 90 = top) of an ellipse centred (0, cy), from z0 to z1
export function drape(ctx, cy, rx, ry, a0, a1, z0, z1, steps) {
  const P = (a, z) => { const t = (a * Math.PI) / 180; return [Math.cos(t) * rx, cy + Math.sin(t) * ry, z]; };
  for (let i = 0; i < steps; i++) { const b0 = a0 + ((a1 - a0) * i) / steps, b1 = a0 + ((a1 - a0) * (i + 1)) / steps; Q(ctx, P(b0, z0), P(b1, z0), P(b1, z1), P(b0, z1), [0, cy, (z0 + z1) / 2]); }
}
export function ribbon(ctx, a, b, h = 0.014) { ctx.quad(...a, ...b, ...add(b, [0, h, 0]), ...add(a, [0, h, 0])); }

// ---------- a person: hip at y 0.92 (standing frame). Seated: the caller shifts so the hip lands on the seat.
export function human(ctx, H) {
  const lod = ctx.lod ?? 1, n = sidesOf(lod), B = H.bones || {}, bone = (k) => ctx.bone(B[k] || k);
  const skin = H.skin || PAL.skin, body = H.body || PAL.linen, accent = H.accent || PAL.honey, trousers = H.trousers || PAL.slate, boots = H.boots || PAL.walnut;
  ctx.flat(); ctx.roughness(0.9);
  for (const side of [-1, 1]) {
    bone(side < 0 ? 'legL' : 'legR');
    const x = side * 0.095;
    if (H.seated) {
      const sx = side * (H.straddle ?? 0.14), kz = -0.3;
      ctx.color(trousers);
      rod(ctx, [x, 0.93, 0.02], [sx, 0.9, kz], 0.078, n, false);
      tube(ctx, [{ c: [sx, 0.9, kz], rx: 0.066, ry: 0.066 }, { c: [sx * 1.03, 0.52, kz + 0.1], rx: 0.055, ry: 0.055 }], { sides: n, capStart: true });
      ctx.color(boots); box(ctx, sx - 0.055, 0.42, kz - 0.02, sx + 0.055, 0.54, kz + 0.2);
      if (H.stirrups && lod <= 3) { ctx.color(PAL.iron); box(ctx, sx - 0.06, 0.4, kz + 0.02, sx + 0.06, 0.425, kz + 0.16); ctx.color(PAL.walnut); box(ctx, sx - 0.012 + side * 0.07, 0.42, kz + 0.07, sx + 0.012 + side * 0.07, 0.92, kz + 0.11); }
    } else {
      ctx.color(trousers);
      tube(ctx, [{ c: [x, 0.96, 0], rx: 0.08, ry: 0.08 }, { c: [x, 0.52, 0.01], rx: 0.063, ry: 0.063 }, { c: [x, 0.1, 0], rx: 0.05, ry: 0.05 }], { sides: n, dir: [0, -1, 0] });
      ctx.color(boots); box(ctx, x - 0.056, 0, -0.14, x + 0.056, 0.13, 0.07);
    }
  }
  // torso: robe to the shins, or a tunic to the thigh
  bone('root');
  const rings = H.seated ? [[0.84, 0.22], [0.97, 0.19], [1.28, 0.215], [1.44, 0.16], [1.53, 0.07]]
    : H.robe ? [[0.18, 0.31], [0.55, 0.265], [0.98, 0.2], [1.28, 0.22], [1.44, 0.16], [1.53, 0.07]]
    : [[0.64, 0.235], [0.95, 0.19], [1.28, 0.215], [1.44, 0.16], [1.53, 0.07]];
  ctx.color(body);
  tube(ctx, rings.map(([y, r]) => ({ c: [0, y, 0], rx: r, ry: r * 0.8 })), { sides: n, dir: [0, 1, 0], capStart: true });
  ctx.color(accent);
  tube(ctx, [{ c: [0, 0.92, 0], rx: 0.214, ry: 0.172 }, { c: [0, 1.0, 0], rx: 0.21, ry: 0.168 }], { sides: n, dir: [0, 1, 0] });
  if (H.cape) {
    ctx.color(H.cape);
    const yb = H.seated ? 0.78 : 0.3, zb = H.seated ? 0.42 : 0.3;
    ctx.quad(-0.2, 1.47, 0.13, 0.2, 1.47, 0.13, 0.3, yb, zb, -0.3, yb, zb);
    if (lod <= 3) { ctx.quad(-0.2, 1.47, 0.13, -0.3, yb, zb, -0.26, yb, zb - 0.2, -0.21, 1.45, -0.02); ctx.quad(0.2, 1.47, 0.13, 0.21, 1.45, -0.02, 0.26, yb, zb - 0.2, 0.3, yb, zb); }
  }
  if (H.pack) {
    ctx.color(H.pack); box(ctx, -0.2, 0.82, 0.15, 0.2, 1.42, 0.44);
    ctx.color(PAL.walnut); box(ctx, -0.21, 1.3, 0.14, 0.21, 1.44, 0.45);
    ctx.color(PAL.linen); rod(ctx, [-0.25, 1.53, 0.3], [0.25, 1.53, 0.3], 0.09, n);
    ctx.color(PAL.walnut); box(ctx, -0.13, 1.05, -0.185, -0.08, 1.46, -0.16); box(ctx, 0.08, 1.05, -0.185, 0.13, 1.46, -0.16);
    if (lod <= 2) { ctx.color(PAL.iron); blob(ctx, [0.25, 0.98, 0.3], 0.07, 0.07, 0.07, 6); ctx.color(PAL.honey); rod(ctx, [-0.24, 0.9, 0.22], [-0.24, 1.15, 0.22], 0.05, 6); }
  }
  // head
  bone('head');
  ctx.color(skin); blob(ctx, [0, 1.63, 0], 0.1, 0.12, 0.105, n);
  if (lod <= 2) {
    ctx.color(PAL.dark);
    for (const s of [-1, 1]) { const x = s * 0.036, y = 1.655, z = -0.101, e = 0.012; ctx.quad(x - e, y, z, x, y + e, z, x + e, y, z, x, y - e, z); }
    ctx.color(skin); ctx.tri(-0.018, 1.61, -0.102, 0.018, 1.61, -0.102, 0, 1.64, -0.128); ctx.tri(0, 1.64, -0.128, 0.018, 1.61, -0.102, 0, 1.6, -0.1); ctx.tri(0, 1.64, -0.128, 0, 1.6, -0.1, -0.018, 1.61, -0.102);
  }
  if (H.hood) {
    ctx.color(H.hoodCol || body);
    tube(ctx, [{ c: [0, 1.5, 0.06], rx: 0.16, ry: 0.15 }, { c: [0, 1.64, 0.065], rx: 0.14, ry: 0.145 }, { c: [0, 1.75, 0.07], rx: 0.1, ry: 0.11 }], { sides: n, dir: [0, 1, 0], tip: [0, 1.84, 0.12] });
  } else {
    ctx.color(H.hair || PAL.walnut); blob(ctx, [0, 1.675, 0.016], 0.106, 0.09, 0.103, n);
  }
  if (H.hat) {
    ctx.color(H.hatCol || PAL.walnut);
    tube(ctx, [{ c: [0, 1.73, 0.01], rx: 0.24, ry: 0.24 }, { c: [0, 1.75, 0.01], rx: 0.24, ry: 0.24 }], { sides: n + 2, dir: [0, 1, 0], capStart: true, capEnd: true });
    tube(ctx, [{ c: [0, 1.74, 0.01], rx: 0.12, ry: 0.12 }, { c: [0, 1.87, 0.01], rx: 0.1, ry: 0.1 }], { sides: n, dir: [0, 1, 0], capEnd: true });
    if (lod <= 2) { ctx.color(accent); tube(ctx, [{ c: [0, 1.755, 0.01], rx: 0.123, ry: 0.123 }, { c: [0, 1.79, 0.01], rx: 0.118, ry: 0.118 }], { sides: n, dir: [0, 1, 0] }); }
  }
  // arms
  for (const side of [-1, 1]) {
    bone(side < 0 ? 'armL' : 'armR');
    const s = [side * 0.205, 1.42, 0], hand = H.seated ? [side * 0.16, 1.02, -0.34] : [side * 0.25, 0.88, -0.02];
    ctx.color(H.sleeve || body);
    tube(ctx, [{ c: s, rx: 0.068, ry: 0.068 }, { c: lerp3(s, hand, 0.5), rx: 0.056, ry: 0.056 }, { c: lerp3(s, hand, 0.86), rx: 0.05, ry: 0.05 }], { sides: n, capStart: true, capEnd: true });
    ctx.color(skin); blob(ctx, hand, 0.042, 0.05, 0.042, Math.min(n, 6));
    if (side > 0 && H.staff) { ctx.color(PAL.walnut); rod(ctx, [0.28, 0.03, -0.12], [0.235, 1.8, 0.06], 0.022, 5); ctx.color(PAL.honey); blob(ctx, [0.24, 1.66, 0.1], 0.05, 0.07, 0.05, 6); }
    if (side > 0 && H.stick) { ctx.color(PAL.oak); rod(ctx, [0.235, 1.0, 0.08], [0.31, 0.3, -0.5], 0.016, 4); }
  }
  ctx.bone(null);
}

// ---------- horse on the shared quadruped rig
export const HORSE = {
  L: 0.9, legX: 0.14, zf: -0.5, zb: 0.52, rFront: 0.075, rBack: 0.1, rFoot: 0.05, sock: 2,
  body: [[-0.84, 1.32, 0.12, 0.14], [-0.72, 1.3, 0.22, 0.27], [-0.45, 1.27, 0.26, 0.3], [0, 1.24, 0.25, 0.29], [0.4, 1.27, 0.26, 0.3], [0.7, 1.3, 0.22, 0.26], [0.83, 1.32, 0.1, 0.12]],
  neck: [[1.34, -0.64, 0.17], [1.62, -0.82, 0.13], [1.86, -0.95, 0.1]],
  head: [[-0.9, 1.96, 0.085, 0.11], [-1.02, 1.93, 0.09, 0.11], [-1.22, 1.78, 0.07, 0.085], [-1.36, 1.68, 0.06, 0.07]], nose: [-1.41, 1.65], snoutFrom: 2, eyeRing: 1, eye: 0.02,
  ears: { x: 0.05, y: 2.04, z: -0.94, tx: 0.08, ty: 2.17, tz: -0.92, w: 0.03 },
  tail: [[1.32, 0.8, 0.06], [1.1, 0.9, 0.08], [0.82, 0.94, 0.07]], tailEnd: [0.58, 0.92], tailTipFrom: 1, neckW: 0.8,
};
export const COATS = {
  bay: { top: 'oklch(0.4 0.08 42)', coat: 'oklch(0.46 0.09 45)', belly: 'oklch(0.5 0.08 48)', dark: 'oklch(0.2 0.02 40)', snout: 'oklch(0.36 0.05 40)', throat: 'oklch(0.44 0.08 45)', earIn: 'oklch(0.33 0.05 40)', earOut: 'oklch(0.4 0.08 42)', tip: 'oklch(0.18 0.02 40)', mane: 'oklch(0.18 0.02 40)' },
  chestnut: { top: 'oklch(0.5 0.12 48)', coat: 'oklch(0.56 0.12 50)', belly: 'oklch(0.62 0.1 55)', dark: 'oklch(0.32 0.06 45)', snout: 'oklch(0.5 0.08 45)', throat: 'oklch(0.58 0.1 52)', earIn: 'oklch(0.42 0.08 45)', earOut: 'oklch(0.5 0.12 48)', tip: 'oklch(0.8 0.07 85)', mane: 'oklch(0.8 0.07 85)', leg: 'oklch(0.56 0.12 50)' },
  grey: { top: 'oklch(0.78 0.01 80)', coat: 'oklch(0.82 0.01 80)', belly: 'oklch(0.87 0.01 80)', dark: 'oklch(0.42 0.01 60)', snout: 'oklch(0.55 0.02 60)', throat: 'oklch(0.84 0.01 80)', earIn: 'oklch(0.6 0.02 60)', earOut: 'oklch(0.75 0.01 80)', tip: 'oklch(0.92 0.01 90)', mane: 'oklch(0.92 0.01 90)', leg: 'oklch(0.72 0.01 80)' },
  dun: { top: 'oklch(0.64 0.07 72)', coat: 'oklch(0.7 0.07 75)', belly: 'oklch(0.78 0.05 80)', dark: 'oklch(0.28 0.03 50)', snout: 'oklch(0.45 0.04 60)', throat: 'oklch(0.74 0.06 78)', earIn: 'oklch(0.5 0.04 60)', earOut: 'oklch(0.28 0.03 50)', tip: 'oklch(0.25 0.03 50)', mane: 'oklch(0.25 0.03 50)' },
};
export function horseRig(o = [0, 0, 0], parent) {
  const r = quadRig(HORSE);
  for (const k of Object.keys(r)) r[k] = { ...r[k], pivot: add(r[k].pivot, o) };
  if (parent) r.root.parent = parent;
  return r;
}
export function horse(ctx, coat, o = [0, 0, 0], opt = {}) {
  const c = shifted(ctx, o), col = COATS[coat] || COATS.bay, P = { ...HORSE, col }, lod = ctx.lod ?? 1;
  build(c, P);
  // mane: a low crest along the neck, forelock on the brow
  c.bone('neck'); c.color(col.mane);
  const N = P.neck;
  for (let i = 0; i < N.length - 1; i++) {
    const [y0, z0, r0] = N[i], [y1, z1, r1] = N[i + 1];
    const b0 = [0, y0 + r0 * 0.8, z0 + r0 * 0.45], b1 = [0, y1 + r1 * 0.8, z1 + r1 * 0.45], t0 = [0, y0 + r0 + 0.1, z0 + r0 * 0.7 + 0.05], t1 = [0, y1 + r1 + 0.08, z1 + r1 * 0.7 + 0.04];
    for (const s of [-1, 1]) Q(c, [s * 0.03, b0[1], b0[2]], [s * 0.03, b1[1], b1[2]], [s * 0.012, t1[1], t1[2]], [s * 0.012, t0[1], t0[2]], [0, b0[1] - 0.1, b0[2]]);
    Q(c, [-0.012, t0[1], t0[2]], [0.012, t0[1], t0[2]], [0.012, t1[1], t1[2]], [-0.012, t1[1], t1[2]], [0, b0[1], b0[2]]);
  }
  if (lod <= 3) {
    c.bone('head'); c.color(col.mane); c.tri(-0.05, 2.02, -0.96, 0.05, 2.02, -0.96, 0, 1.9, -1.08);
    // bridle: noseband and browband
    c.color(PAL.walnut);
    const h = P.head[2];
    tube(c, [{ c: [0, h[1], h[0] + 0.03], rx: h[2] * 1.14, ry: h[3] * 1.14 }, { c: [0, h[1], h[0] - 0.02], rx: h[2] * 1.1, ry: h[3] * 1.1 }], { sides: 6, dir: [0, 0, -1] });
    tube(c, [{ c: [0, 1.97, -0.9], rx: 0.1, ry: 0.12 }, { c: [0, 1.97, -0.95], rx: 0.1, ry: 0.12 }], { sides: 6, dir: [0, 0, -1] });
  }
  c.bone('root');
  if (opt.harness) {
    c.color(PAL.walnut);
    const cx = [0, 1.42, -0.7], d = [0, 0.6, -0.8], u = [1, 0, 0], v = [0, 0.8, 0.6], m = lod <= 2 ? 10 : 6, R = 0.21;
    const pt = (i) => { const a = (i / m) * Math.PI * 2; return [cx[0] + Math.cos(a) * R * 1.2, cx[1] + Math.sin(a) * R * v[1] * 1.1, cx[2] + Math.sin(a) * R * v[2]]; };
    for (let i = 0; i < m; i++) rod(c, pt(i), pt(i + 1), 0.05, 5, false);
    c.color(PAL.leather); drape(c, 1.24, 0.27, 0.31, -25, 205, -0.3, -0.2, lod <= 2 ? 10 : 6);
    if (lod <= 2) { c.color('oklch(0.72 0.1 85)'); for (const s of [-1, 1]) box(c, s * 0.26 - 0.02, 1.52, -0.72, s * 0.26 + 0.02, 1.62, -0.66); }
    void d; void u;
  }
  c.bone(null);
  return c;
}
export function saddle(ctx, blanket, lod) {
  ctx.bone('root');
  ctx.color(blanket || 'oklch(0.62 0.07 195)'); drape(ctx, 1.24, 0.275, 0.315, 22, 158, -0.4, 0.2, lod <= 2 ? 8 : 4);
  if (lod <= 2) { ctx.color(PAL.linen); drape(ctx, 1.24, 0.28, 0.32, 20, 24, -0.4, 0.2, 1); drape(ctx, 1.24, 0.28, 0.32, 156, 160, -0.4, 0.2, 1); }
  ctx.color(PAL.leather); drape(ctx, 1.24, 0.29, 0.335, 42, 138, -0.3, 0.1, lod <= 2 ? 6 : 3);
  ctx.color(PAL.walnut); box(ctx, -0.09, 1.52, -0.36, 0.09, 1.68, -0.28); box(ctx, -0.14, 1.52, 0.06, 0.14, 1.7, 0.13);
  if (lod <= 3) {
    ctx.color(PAL.honey); for (const s of [-1, 1]) box(ctx, Math.min(s * 0.25, s * 0.37), 1.12, 0.22, Math.max(s * 0.25, s * 0.37), 1.4, 0.5);
    ctx.color(PAL.linen); rod(ctx, [-0.3, 1.66, 0.25], [0.3, 1.66, 0.25], 0.075, sidesOf(lod));
  }
}
// spoked wheel in the y–z plane at (x, cy, cz); rolls about X
export function wheel(ctx, x, cy, cz, R, lod) {
  const seg = lod <= 2 ? 16 : lod <= 3 ? 10 : 6, spokes = lod <= 2 ? 8 : lod <= 3 ? 6 : 4, w = 0.045, t = 0.065;
  const P = (a, r, xx) => [xx, cy + Math.cos(a) * r, cz + Math.sin(a) * r];
  for (let k = 0; k < seg; k++) {
    const a0 = (k / seg) * Math.PI * 2, a1 = ((k + 1) / seg) * Math.PI * 2, o = P((a0 + a1) / 2, R - t / 2, x);
    ctx.color(PAL.iron); Q(ctx, P(a0, R, x - w), P(a1, R, x - w), P(a1, R, x + w), P(a0, R, x + w), o);
    ctx.color(PAL.walnut); Q(ctx, P(a0, R - t, x - w), P(a1, R - t, x - w), P(a1, R - t, x + w), P(a0, R - t, x + w), o);
    Q(ctx, P(a0, R, x - w), P(a1, R, x - w), P(a1, R - t, x - w), P(a0, R - t, x - w), o);
    Q(ctx, P(a0, R, x + w), P(a1, R, x + w), P(a1, R - t, x + w), P(a0, R - t, x + w), o);
  }
  ctx.color(PAL.oak);
  for (let i = 0; i < spokes; i++) { const a = (i / spokes) * Math.PI * 2; rod(ctx, P(a, 0.06, x), P(a, R - t + 0.01, x), 0.02, 4, false); }
  ctx.color(PAL.walnut); rod(ctx, [x - 0.09, cy, cz], [x + 0.09, cy, cz], 0.075, lod <= 2 ? 8 : 5);
}
