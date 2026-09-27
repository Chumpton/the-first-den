// The Catio's one layout, shared by its geometry (scripts/gen/catio.js) and its cat manager (scripts/catio-cats.js).
// Local frame: origin mid-floor at ground, x −2.5..2.5, z −2..2, +Z (the back) toward the cob house, the screen door in the −X wall.
export const C = {
  w: 5, d: 4, deck: 0.12, eaveFront: 2.3, eaveBack: 2.6,
  door: { z0: -1.15, z1: -0.15, h: 2.05, hinge: [-2.47, 0.12, -0.15], leaf: 0.98, leafH: 1.92 },
  tunnel: { x0: 0.59, x1: 1.01, y0: 1.95, y1: 2.35 },
  postsFB: [-2.45, -1.25, 0, 1.25, 2.45], postsL: [-1.95, -1.2, -0.1, 0.95, 1.95], postsR: [-1.95, 0, 1.95],
};
export const roofY = (z) => C.eaveFront + ((z + C.d / 2) * (C.eaveBack - C.eaveFront)) / C.d;
// shelves [x0, x1, topY, z0, z1]
export const SHELVES = [
  [-2.1, -1.2, 0.55, 1.6, 1.92], [-0.9, 0.1, 1.05, 1.6, 1.92], [-2.1, -1.2, 1.5, 1.6, 1.92], [1.5, 2.38, 1.45, 1.6, 1.92], [0.42, 1.18, 1.95, 1.5, 1.92],
  [-1.95, -1.1, 1.2, -1.92, -1.6], [-0.1, 0.9, 1.65, -1.92, -1.6], [2.06, 2.38, 1.85, -0.3, 0.8],
];
export const RAMP = { a: [-0.2, 0.12, 1.74], b: [-1.2, 0.55, 1.74], w: 0.26 };
export const TREE = { base: [1.85, -1.25, 0.62], postA: [1.7, -1.42, 1.7], postB: [2.05, -1.0, 1.15], t1: [1.85, 0.6, -1.22], t2: [2.05, 1.15, -0.98], t3: [1.7, 1.7, -1.42] };
export const HAMMOCK = { x0: -1.15, x1: -0.05, z: -1.72, depth: 0.36, y: 0.8, sag: 0.11 };
export const CUSHIONS = [{ at: [-1.8, 0.12, -1.55], r: 0.27, col: 'oklch(0.86 0.04 75)' }, { at: [0.55, 0.12, 1.15], r: 0.3, col: 'oklch(0.74 0.06 135)' }];
export const POTS = [{ at: [-2.12, 0.12, 0.95], kind: 'catnip' }, { at: [-2.12, 0.12, 1.32], kind: 'grass' }, { at: [2.15, 0.12, 1.2], kind: 'grass' }];
export const BOWL = [-2.12, 0.12, 0.35];
// perches the cats rest on: p = local feet, yaw = the way a cat faces there (null = any), rest = what it does there
export const PERCHES = {
  F1: { p: [-1.0, 0.12, 0.4], yaw: null, rest: ['sit', 'groom', 'loaf'] },
  F2: { p: [0.7, 0.12, -0.5], yaw: null, rest: ['sit', 'groom'] },
  C1: { p: [-1.8, 0.2, -1.55], yaw: null, rest: ['nap', 'loaf'] },
  C2: { p: [0.55, 0.2, 1.15], yaw: null, rest: ['nap', 'loaf', 'groom'] },
  BW: { p: [-1.82, 0.12, 0.35], yaw: 90, rest: ['drink'] },
  RB: { p: [0.0, 0.12, 1.74], yaw: 90, rest: ['pass'] },
  S1: { p: [-1.65, 0.55, 1.76], yaw: 0, rest: ['sit', 'loaf', 'groom'] },
  S2: { p: [-0.4, 1.05, 1.76], yaw: 0, rest: ['loaf', 'nap'] },
  S3: { p: [-1.65, 1.5, 1.76], yaw: 0, rest: ['sit', 'nap'] },
  S4: { p: [1.95, 1.45, 1.76], yaw: 0, rest: ['loaf', 'sit'] },
  TU: { p: [0.8, 1.95, 1.7], yaw: 0, rest: ['sit', 'loaf'] },
  S5: { p: [-1.5, 1.2, -1.76], yaw: 180, rest: ['sit', 'loaf'] },
  HM: { p: [-0.6, 0.71, -1.72], yaw: 90, rest: ['nap'] },
  S6: { p: [0.4, 1.65, -1.76], yaw: 180, rest: ['loaf', 'sit'] },
  T1: { p: [1.9, 0.6, -1.15], yaw: 60, rest: ['sit', 'groom'] },
  T2: { p: [2.05, 1.15, -0.95], yaw: 80, rest: ['sit', 'loaf'] },
  T3: { p: [1.7, 1.72, -1.42], yaw: 45, rest: ['nap', 'loaf'] },
  E1: { p: [2.22, 1.85, 0.25], yaw: 90, rest: ['sit', 'loaf'] },
};
// links [a, b, kind, via?] — walk pads along (through via points), jump arcs
export const LINKS = [
  ['F1', 'F2', 'walk'], ['F1', 'C1', 'walk'], ['F1', 'BW', 'walk'], ['F1', 'RB', 'walk'], ['F2', 'C2', 'walk'], ['C2', 'RB', 'walk'], ['F2', 'RB', 'walk'],
  ['RB', 'S1', 'walk', [[-1.2, 0.55, 1.74]]],
  ['F2', 'T1', 'jump'], ['F1', 'HM', 'jump'], ['F2', 'HM', 'jump'], ['C1', 'S5', 'jump'], ['S5', 'HM', 'jump'], ['S6', 'HM', 'jump'],
  ['S1', 'S3', 'jump'], ['S1', 'S2', 'jump'], ['S2', 'S3', 'jump'], ['S2', 'TU', 'jump'], ['TU', 'S4', 'jump'], ['S4', 'E1', 'jump'], ['S4', 'C2', 'jump'],
  ['E1', 'T3', 'jump'], ['T3', 'T2', 'jump'], ['T2', 'T1', 'jump'], ['T3', 'S6', 'jump'], ['T1', 'F2', 'jump'],
];
