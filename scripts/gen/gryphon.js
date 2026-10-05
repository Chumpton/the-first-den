// The flight gryphon: a WoW-style war gryphon, eagle fore and lion aft, wings modelled spread along ±X, −Z forward.
// Origin = the rider's feet (it rides as the player's child); the saddle's seat is at y ≈ 0.42, the paws reach y ≈ −1.15.
// Clips in anim/gryphon.yml drive the bones; scripts/gryphon.js picks hover / fly / speed / landed.
const DEF = { head: [0.86, 0.05, 80], head2: [0.74, 0.08, 72], beak: [0.82, 0.15, 88], beakTip: [0.45, 0.06, 70], eye: [0.25, 0.04, 60],
  body: [0.64, 0.09, 66], belly: [0.76, 0.07, 75], wing: [0.42, 0.07, 52], wing2: [0.55, 0.08, 60], tip: [0.3, 0.04, 50], talon: [0.25, 0.02, 60],
  leg: [0.78, 0.13, 85], leather: [0.38, 0.07, 40], cloth: [0.42, 0.13, 262], gold: [0.8, 0.13, 86], steel: [0.72, 0.02, 250] };
const ok = (a) => `oklch(${a[0]} ${a[1]} ${a[2]})`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]), norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function Q(ctx, a, b, c, d, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.quad(...a, ...d, ...c, ...b); else ctx.quad(...a, ...b, ...c, ...d); }
function T(ctx, a, b, c, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.tri(...a, ...c, ...b); else ctx.tri(...a, ...b, ...c); }
function frame(t) { let s = cross(t, [0, 1, 0]); if (len(s) < 1e-3) s = [1, 0, 0]; s = norm(s); return [s, norm(cross(s, t))]; }
let N = 10;
// P: [{ c, rx, ry, w, col }] a lofted oval tube; each segment wears the bone of its far ring
function tube(ctx, P, o = {}) {
  const n = o.n ?? N, R = [];
  for (let i = 0; i < P.length; i++) {
    const t = norm(sub(P[Math.min(P.length - 1, i + 1)].c, P[Math.max(0, i - 1)].c)), [sd, up] = frame(t), ring = [];
    for (let k = 0; k <= n; k++) { const th = (2 * Math.PI * k) / n; ring.push(add(P[i].c, add(mul(sd, Math.cos(th) * P[i].rx), mul(up, Math.sin(th) * P[i].ry)))); }
    R.push({ ring, t });
  }
  for (let i = 0; i < P.length - 1; i++) {
    ctx.bone(P[i + 1].w ?? P[i].w ?? o.w ?? 'root');
    const mid = lerp(P[i].c, P[i + 1].c, 0.5);
    for (let k = 0; k < n; k++) {
      const s = Math.sin((2 * Math.PI * (k + 0.5)) / n);
      ctx.color(ok(o.paint ? o.paint(s, i) : P[i + 1].col ?? o.col));
      const a = R[i].ring[k], b = R[i].ring[k + 1], c = R[i + 1].ring[k + 1], d = R[i + 1].ring[k];
      Q(ctx, a, b, c, d, sub(lerp(a, c, 0.5), mid));
    }
  }
  const cap = (i, dir, pt) => { ctx.bone(P[i].w ?? o.w ?? 'root'); const tip = add(P[i].c, mul(R[i].t, dir * pt));
    for (let k = 0; k < n; k++) { ctx.color(ok(o.paint ? o.paint(Math.sin((2 * Math.PI * (k + 0.5)) / n), i) : P[i].col ?? o.col)); T(ctx, R[i].ring[k], R[i].ring[k + 1], tip, mul(R[i].t, dir)); } };
  if (o.cap0 !== undefined) cap(0, -1, o.cap0);
  if (o.cap1 !== undefined) cap(P.length - 1, 1, o.cap1);
}
function cone(ctx, base, tip, r, col, n = 5) {
  const t = norm(sub(tip, base)), [sd, up] = frame(t); ctx.color(ok(col));
  for (let k = 0; k < n; k++) { const a0 = (2 * Math.PI * k) / n, a1 = (2 * Math.PI * (k + 1)) / n;
    const p0 = add(base, add(mul(sd, Math.cos(a0) * r), mul(up, Math.sin(a0) * r))), p1 = add(base, add(mul(sd, Math.cos(a1) * r), mul(up, Math.sin(a1) * r)));
    T(ctx, p0, p1, tip, sub(lerp(p0, p1, 0.5), base)); }
}
// a feather: a thin lens card with a little thickness, root → tip, its flat facing `up`
function feather(ctx, root, tip, wid, up, col, col2) {
  const t = sub(tip, root), side = norm(cross(t, up)), th = mul(norm(up), 0.012);
  const m1 = add(lerp(root, tip, 0.35), mul(side, wid)), m2 = add(lerp(root, tip, 0.35), mul(side, -wid * 0.6));
  const tp = add(tip, mul(side, wid * 0.15));
  for (const s of [1, -1]) { const o = mul(th, s);
    ctx.color(ok(col)); T(ctx, add(root, o), add(m1, o), add(m2, o), mul(up, s));
    ctx.color(ok(col2)); Q(ctx, add(m1, o), add(tp, o), add(tip, o), add(m2, o), mul(up, s)); }
}
export function skeleton() {
  return {
    root: { pivot: [0, 0.05, 0] },
    neck: { parent: 'root', pivot: [0, 0.3, -0.8] },
    head: { parent: 'neck', pivot: [0, 0.78, -1.28] },
    wingL: { parent: 'root', pivot: [-0.36, 0.34, -0.45] }, wingL2: { parent: 'wingL', pivot: [-1.45, 0.36, -0.38] },
    wingR: { parent: 'root', pivot: [0.36, 0.34, -0.45] }, wingR2: { parent: 'wingR', pivot: [1.45, 0.36, -0.38] },
    tail: { parent: 'root', pivot: [0, 0.12, 1.05] }, tail2: { parent: 'tail', pivot: [0, -0.15, 1.75] },
    legFL: { parent: 'root', pivot: [-0.24, -0.12, -0.62] }, legFR: { parent: 'root', pivot: [0.24, -0.12, -0.62] },
    legBL: { parent: 'root', pivot: [-0.27, -0.05, 0.78] }, legBR: { parent: 'root', pivot: [0.27, -0.05, 0.78] },
  };
}
export function geometry(ctx) {
  const C = { ...DEF, ...(ctx.params.palette ?? {}) }, lod = ctx.lod ?? 1;
  N = lod >= 4 ? 6 : lod >= 2 ? 8 : 12;
  ctx.smooth(); ctx.roughness(0.85);
  // ---- body: eagle chest forward, lion barrel and haunch aft
  const furCol = (s) => (s < -0.35 ? C.belly : C.body);
  tube(ctx, [
    { c: [0, 0.18, -1.0], rx: 0.2, ry: 0.22 }, { c: [0, 0.12, -0.75], rx: 0.4, ry: 0.42 }, { c: [0, 0.08, -0.3], rx: 0.46, ry: 0.44 },
    { c: [0, 0.06, 0.25], rx: 0.42, ry: 0.4 }, { c: [0, 0.1, 0.75], rx: 0.44, ry: 0.42 }, { c: [0, 0.16, 1.08], rx: 0.3, ry: 0.3 },
  ], { w: 'root', paint: (s, i) => (i <= 1 ? (s < -0.2 ? C.head : C.head2) : furCol(s)), cap1: 0.12, cap0: 0.06 });
  // chest ruff: overlapping feather tips spilling over the shoulders
  if (lod <= 3) { ctx.bone('root');
    for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3, x = Math.sin(a) * 0.42, y = 0.12 + Math.cos(a) * 0.3;
      feather(ctx, [x * 0.8, y + 0.05, -0.85], [x * 1.05, y - 0.25, -0.55], 0.09, [Math.sin(a), Math.cos(a), -0.4], C.head, C.head2); } }
  // ---- neck and head
  tube(ctx, [
    { c: [0, 0.2, -0.9], rx: 0.28, ry: 0.3, w: 'neck' }, { c: [0, 0.48, -1.12], rx: 0.22, ry: 0.24, w: 'neck' },
    { c: [0, 0.72, -1.25], rx: 0.2, ry: 0.21, w: 'head' }, { c: [0, 0.82, -1.42], rx: 0.21, ry: 0.2, w: 'head' }, { c: [0, 0.8, -1.6], rx: 0.15, ry: 0.15, w: 'head' },
  ], { paint: (s) => (s > 0.4 ? C.head2 : C.head), cap1: 0.04 });
  ctx.bone('head');
  // the hooked beak: a tapered tube that curls down at the end
  tube(ctx, [{ c: [0, 0.79, -1.6], rx: 0.11, ry: 0.1 }, { c: [0, 0.77, -1.75], rx: 0.08, ry: 0.08 }, { c: [0, 0.72, -1.86], rx: 0.05, ry: 0.05, col: C.beakTip }, { c: [0, 0.64, -1.9], rx: 0.02, ry: 0.025, col: C.beakTip }], { w: 'head', col: C.beak, n: 6, cap1: 0.03 });
  ctx.color(ok(C.beak)); T(ctx, [-0.07, 0.72, -1.6], [0.07, 0.72, -1.6], [0, 0.71, -1.78], [0, -1, 0]);
  for (const sx of [-1, 1]) { // eyes under a fierce brow, ear tufts sweeping back
    ctx.color(ok(C.eye)); ctx.emissive(null); const e = [sx * 0.15, 0.85, -1.5];
    tube(ctx, [{ c: add(e, [-sx * 0.02, 0, 0]), rx: 0.035, ry: 0.035 }, { c: add(e, [sx * 0.012, 0, 0]), rx: 0.035, ry: 0.035 }], { w: 'head', col: C.eye, n: 6, cap1: 0.01 });
    ctx.color(ok(C.head2)); T(ctx, [sx * 0.08, 0.92, -1.58], [sx * 0.2, 0.9, -1.44], [sx * 0.12, 0.96, -1.42], [0, 1, -0.3]);
    feather(ctx, [sx * 0.12, 0.9, -1.36], [sx * 0.22, 1.06, -1.05], 0.05, [sx * 0.6, 0.8, 0], C.head, C.head2);
    feather(ctx, [sx * 0.08, 0.93, -1.33], [sx * 0.16, 1.12, -1.0], 0.04, [sx * 0.5, 0.85, 0], C.head2, C.head);
  }
  // ---- wings, spread along ±X: a covert arm in the inner bone, the long primaries on the outer
  for (const sx of [-1, 1]) {
    const W1 = sx < 0 ? 'wingL' : 'wingR', W2 = sx < 0 ? 'wingL2' : 'wingR2';
    tube(ctx, [{ c: [sx * 0.3, 0.34, -0.45], rx: 0.14, ry: 0.1, w: W1 }, { c: [sx * 0.9, 0.38, -0.5], rx: 0.11, ry: 0.07, w: W1 }, { c: [sx * 1.45, 0.36, -0.4], rx: 0.08, ry: 0.05, w: W2 }, { c: [sx * 2.3, 0.33, -0.2], rx: 0.04, ry: 0.03, w: W2 }], { col: C.wing, n: 6, cap1: 0.04 });
    const up = [0, 1, 0], rows = lod >= 4 ? 4 : lod >= 2 ? 7 : 10;
    // secondaries: from the arm back toward the body's flank
    ctx.bone(W1);
    for (let i = 0; i < rows; i++) { const t = i / (rows - 1), x = sx * (0.35 + t * 1.1), z = -0.45 - Math.sin(t * Math.PI) * 0.05;
      feather(ctx, [x, 0.35, z], [x + sx * 0.08, 0.32 - t * 0.02, z + 0.95 - t * 0.15], 0.11, up, C.wing, C.wing2);
      if (lod <= 2) feather(ctx, [x, 0.37, z - 0.02], [x + sx * 0.05, 0.36, z + 0.5], 0.1, up, C.wing2, C.wing); }
    // primaries: the long fingered tips, splayed
    ctx.bone(W2);
    for (let i = 0; i < rows; i++) { const t = i / (rows - 1), x = sx * (1.45 + t * 0.85), z = -0.4 + t * 0.2, fan = (1 - t) * 0.5 + 0.15;
      feather(ctx, [x, 0.35, z], [x + sx * (0.45 + t * 0.55), 0.32, z + 0.85 * fan + 0.25], 0.1, up, C.wing2, C.tip); }
  }
  // ---- legs: eagle forelegs with yellow scaled shanks and black talons, lion hind legs with big paws
  for (const sx of [-1, 1]) {
    const F = sx < 0 ? 'legFL' : 'legFR', B = sx < 0 ? 'legBL' : 'legBR';
    tube(ctx, [{ c: [sx * 0.24, -0.05, -0.62], rx: 0.15, ry: 0.15, col: C.head }, { c: [sx * 0.25, -0.45, -0.66], rx: 0.11, ry: 0.11, col: C.head2 }, { c: [sx * 0.25, -0.62, -0.62], rx: 0.06, ry: 0.06, col: C.leg }, { c: [sx * 0.25, -1.08, -0.68], rx: 0.055, ry: 0.055, col: C.leg }], { w: F, n: 7 });
    ctx.bone(F);
    for (const [dx, dz] of [[-0.07, -0.13], [0, -0.16], [0.07, -0.13], [0, 0.1]]) {
      tube(ctx, [{ c: [sx * 0.25, -1.1, -0.68], rx: 0.03, ry: 0.03 }, { c: [sx * 0.25 + dx, -1.13, -0.68 + dz], rx: 0.025, ry: 0.025 }], { w: F, col: C.leg, n: 5 });
      cone(ctx, [sx * 0.25 + dx, -1.13, -0.68 + dz], [sx * 0.25 + dx * 1.3, -1.17, -0.68 + dz * 1.35], 0.022, C.talon, 4); }
    tube(ctx, [{ c: [sx * 0.27, 0.08, 0.78], rx: 0.22, ry: 0.28 }, { c: [sx * 0.29, -0.35, 0.92], rx: 0.15, ry: 0.15 }, { c: [sx * 0.28, -0.72, 0.8], rx: 0.09, ry: 0.09 }, { c: [sx * 0.28, -1.02, 0.86], rx: 0.08, ry: 0.08 }, { c: [sx * 0.28, -1.12, 0.78], rx: 0.11, ry: 0.06 }], { w: B, col: C.body, n: 7, cap1: 0.05 });
  }
  // ---- lion tail with a dark tuft
  tube(ctx, [{ c: [0, 0.18, 1.05], rx: 0.08, ry: 0.08, w: 'tail' }, { c: [0, 0.05, 1.45], rx: 0.06, ry: 0.06, w: 'tail' }, { c: [0, -0.12, 1.78], rx: 0.05, ry: 0.05, w: 'tail2' }, { c: [0, -0.2, 2.1], rx: 0.04, ry: 0.04, w: 'tail2' }], { col: C.body, n: 6 });
  tube(ctx, [{ c: [0, -0.2, 2.08], rx: 0.06, ry: 0.06 }, { c: [0, -0.26, 2.25], rx: 0.11, ry: 0.11 }, { c: [0, -0.32, 2.45], rx: 0.07, ry: 0.07 }], { w: 'tail2', col: C.tip, n: 6, cap1: 0.08, cap0: 0.02 });
  // ---- tack: a blue Alliance-style blanket with gold trim, a leather saddle with a high cantle, a gold-capped breastplate
  if (lod <= 3) {
    ctx.bone('root');
    const arc = (z, r, y0) => { const pts = []; for (let k = 0; k <= 8; k++) { const a = -1.25 + (k / 8) * 2.5; pts.push([Math.sin(a) * r, y0 + Math.cos(a) * r * 0.95, z]); } return pts; };
    const drape = (z0, z1, r, y, col) => { const A = arc(z0, r, y), B2 = arc(z1, r, y); ctx.color(ok(col));
      for (let k = 0; k < 8; k++) Q(ctx, A[k], A[k + 1], B2[k + 1], B2[k], [A[k][0], A[k][1] - y, 0]); };
    drape(-0.4, 0.45, 0.47, 0.04, C.cloth); drape(-0.44, -0.4, 0.475, 0.04, C.gold); drape(0.45, 0.49, 0.475, 0.04, C.gold);
    drape(-0.18, 0.22, 0.495, 0.02, C.leather);
    tube(ctx, [{ c: [0, 0.42, 0.18], rx: 0.2, ry: 0.06 }, { c: [0, 0.52, 0.26], rx: 0.18, ry: 0.06 }], { w: 'root', col: C.leather, n: 8, cap1: 0.02 }); // cantle
    tube(ctx, [{ c: [0, 0.44, -0.22], rx: 0.12, ry: 0.05 }, { c: [0, 0.54, -0.26], rx: 0.07, ry: 0.04, col: C.gold }], { w: 'root', col: C.leather, n: 8, cap1: 0.03 }); // pommel
    for (const sx of [-1, 1]) { // stirrup straps
      ctx.color(ok(C.leather)); Q(ctx, [sx * 0.47, 0.05, -0.02], [sx * 0.47, 0.05, 0.04], [sx * 0.5, -0.3, 0.04], [sx * 0.5, -0.3, -0.02], [sx, 0, 0]);
      tube(ctx, [{ c: [sx * 0.5, -0.32, -0.06], rx: 0.02, ry: 0.02 }, { c: [sx * 0.5, -0.32, 0.08], rx: 0.02, ry: 0.02 }], { w: 'root', col: C.steel, n: 5 }); }
    // breastplate over the chest, studded
    ctx.color(ok(C.steel)); ctx.metalness(0.7); ctx.roughness(0.4);
    const bp = arc(-0.92, 0.33, 0.14); for (let k = 0; k < 8; k++) Q(ctx, bp[k], bp[k + 1], [bp[k + 1][0] * 0.8, bp[k + 1][1] - 0.05, -0.98], [bp[k][0] * 0.8, bp[k][1] - 0.05, -0.98], [0, 0, -1]);
    ctx.color(ok(C.gold)); for (const k of [2, 4, 6]) cone(ctx, [bp[k][0] * 0.9, bp[k][1] - 0.02, -0.96], [bp[k][0] * 0.9, bp[k][1] - 0.02, -1.03], 0.03, C.gold, 5);
    ctx.metalness(0); ctx.roughness(0.85);
    // reins from the beak's corners back to the pommel
    ctx.bone('head'); ctx.color(ok(C.leather));
    for (const sx of [-1, 1]) Q(ctx, [sx * 0.11, 0.74, -1.62], [sx * 0.11, 0.76, -1.6], [sx * 0.15, 0.6, -1.0], [sx * 0.15, 0.58, -1.02], [sx, 0, 0]);
  }
}
