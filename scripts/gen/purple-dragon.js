// Violet: a big purple dragon sitting sphinx-like, head up, front toward −Z, origin at her feet under the saddle.
// Wings are modelled spread (along ±X) and folded by the rest clip; colours come from params (any dragon can wear this body).
const DEF = { body: [0.42, 0.16, 305], belly: [0.72, 0.09, 300], belly2: [0.64, 0.1, 300], dorsal: [0.32, 0.14, 300], gold: [0.8, 0.12, 85],
  eye: [0.75, 0.2, 310], membrane: [0.55, 0.17, 312], leather: [0.64, 0.11, 65], leather2: [0.5, 0.09, 55], brass: [0.78, 0.12, 88] };
const ok = (a) => `oklch(${a[0]} ${a[1]} ${a[2]})`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]), norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function Q(ctx, a, b, c, d, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.quad(...a, ...d, ...c, ...b); else ctx.quad(...a, ...b, ...c, ...d); }
function T(ctx, a, b, c, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.tri(...a, ...c, ...b); else ctx.tri(...a, ...b, ...c); }
let C = DEF, N = 10;
function frame(t) { let side = cross(t, [0, 1, 0]); if (len(side) < 1e-3) side = [1, 0, 0]; side = norm(side); return [side, norm(cross(side, t))]; }
// P: [{ c, rx, ry, w }]; o: { n, paint(sinθ, i) → colour, cap0, cap1 }
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
      ctx.color(o.paint ? o.paint(s, i) : ok(o.col ?? C.body));
      const a = R[i].ring[k], b = R[i].ring[k + 1], c = R[i + 1].ring[k + 1], d = R[i + 1].ring[k];
      Q(ctx, a, b, c, d, sub(lerp(a, c, 0.5), mid));
    }
  }
  const cap = (i, dir, pt) => { ctx.bone(P[i].w ?? o.w ?? 'root'); const tip = add(P[i].c, mul(R[i].t, dir * pt));
    for (let k = 0; k < n; k++) { ctx.color(o.paint ? o.paint(Math.sin((2 * Math.PI * (k + 0.5)) / n), i) : ok(o.col ?? C.body)); T(ctx, R[i].ring[k], R[i].ring[k + 1], tip, mul(R[i].t, dir)); } };
  if (o.cap0 !== undefined) cap(0, -1, o.cap0);
  if (o.cap1 !== undefined) cap(P.length - 1, 1, o.cap1);
}
function cone(ctx, base, tip, r, col, n = 5) {
  const t = norm(sub(tip, base)), [sd, up] = frame(t); ctx.color(ok(col));
  for (let k = 0; k < n; k++) { const a0 = (2 * Math.PI * k) / n, a1 = (2 * Math.PI * (k + 1)) / n;
    const p0 = add(base, add(mul(sd, Math.cos(a0) * r), mul(up, Math.sin(a0) * r))), p1 = add(base, add(mul(sd, Math.cos(a1) * r), mul(up, Math.sin(a1) * r)));
    T(ctx, p0, p1, tip, sub(lerp(p0, p1, 0.5), base)); T(ctx, p0, p1, base, mul(t, -1)); }
}
const bodyPaint = (s, i) => (s < -0.5 ? ok(i % 2 ? C.belly2 : C.belly) : s > 0.85 ? ok(C.dorsal) : ok(C.body));
function wing(ctx, sx, lod) {
  const P = (x, y, z) => [x * sx, y, z], bone = sx > 0 ? 'wingR' : 'wingL';
  const S = P(1.0, 2.35, -0.9), E = P(3.1, 2.95, -0.55), W = P(4.7, 2.85, -0.15), F = [P(6.5, 2.4, 0.8), P(5.5, 2.3, 1.45), P(4.0, 2.25, 1.6), P(2.5, 2.25, 1.5)], H = P(1.05, 2.2, 1.25);
  ctx.bone(bone);
  const edge = [...F, H], up = [0, 1, 0];
  ctx.color(ok(C.membrane), 0.8); ctx.emissive(ok([0.3, 0.12, 312]));
  for (let i = 0; i < edge.length - 1; i++) { const m = lerp(lerp(edge[i], edge[i + 1], 0.5), i < 3 ? W : S, 0.16); T(ctx, W, edge[i], m, up); T(ctx, W, m, edge[i + 1], up); }
  T(ctx, W, H, S, up); T(ctx, W, S, E, up);
  ctx.emissive(null);
  const n = lod >= 3 ? 4 : 6, D = C.dorsal;
  tube(ctx, [{ c: S, rx: 0.17, ry: 0.17 }, { c: E, rx: 0.13, ry: 0.13 }, { c: W, rx: 0.1, ry: 0.1 }], { n, col: D, w: bone, cap1: 0.05 });
  for (const f of F) tube(ctx, [{ c: W, rx: 0.07, ry: 0.07 }, { c: f, rx: 0.02, ry: 0.02 }], { n: 4, col: D, w: bone });
  if (lod <= 2) cone(ctx, W, add(W, P(0.25, 0.25, -0.35)), 0.06, C.gold, 4);
}
export function skeleton() {
  return {
    root: { pivot: [0, 1.2, 0.4] }, chest: { parent: 'root', pivot: [0, 1.4, -0.8] },
    neck1: { parent: 'chest', pivot: [0, 2.1, -1.95] }, neck2: { parent: 'neck1', pivot: [0, 3.4, -2.6] }, head: { parent: 'neck2', pivot: [0, 4.75, -2.95] },
    wingR: { parent: 'chest', pivot: [1.0, 2.35, -0.9] }, wingL: { parent: 'chest', pivot: [-1.0, 2.35, -0.9] },
    armR: { parent: 'chest', pivot: [0.95, 1.45, -1.45] }, armL: { parent: 'chest', pivot: [-0.95, 1.45, -1.45] },
    legR: { parent: 'root', pivot: [1.0, 1.3, 1.0] }, legL: { parent: 'root', pivot: [-1.0, 1.3, 1.0] },
    tail1: { parent: 'root', pivot: [0, 1.05, 2.3] }, tail2: { parent: 'tail1', pivot: [0.12, 0.8, 3.4] },
    tail3: { parent: 'tail2', pivot: [0.6, 0.45, 4.4] }, tail4: { parent: 'tail3', pivot: [1.7, 0.3, 5.05] },
  };
}
export function geometry(ctx) {
  C = { ...DEF, ...(ctx.params?.colors ?? {}) };
  const lod = ctx.lod ?? 1; N = [12, 12, 10, 8, 6, 5][lod] ?? 8;
  ctx.smooth(); ctx.roughness(0.55); ctx.metalness(0.05);
  // torso
  tube(ctx, [
    { c: [0, 1.6, -2.45], rx: 0.5, ry: 0.5, w: 'chest' }, { c: [0, 1.5, -2.05], rx: 0.9, ry: 0.92, w: 'chest' }, { c: [0, 1.42, -1.35], rx: 1.1, ry: 1.05, w: 'chest' },
    { c: [0, 1.38, -0.55], rx: 1.15, ry: 1.08, w: { chest: 0.5, root: 0.5 } }, { c: [0, 1.35, 0.3], rx: 1.12, ry: 1.05, w: 'root' },
    { c: [0, 1.3, 1.1], rx: 1.05, ry: 0.98, w: 'root' }, { c: [0, 1.22, 1.8], rx: 0.88, ry: 0.82, w: 'root' }, { c: [0, 1.12, 2.25], rx: 0.62, ry: 0.6, w: 'root' }],
    { paint: bodyPaint, cap0: 0.15 });
  // tail, lying and curling off to her right
  tube(ctx, [
    { c: [0, 1.12, 2.2], rx: 0.62, ry: 0.6, w: 'root' }, { c: [0, 0.95, 2.9], rx: 0.5, ry: 0.48, w: 'tail1' }, { c: [0.12, 0.78, 3.5], rx: 0.42, ry: 0.38, w: 'tail2' },
    { c: [0.35, 0.55, 4.1], rx: 0.3, ry: 0.28, w: 'tail2' }, { c: [0.8, 0.4, 4.6], rx: 0.24, ry: 0.22, w: 'tail3' }, { c: [1.4, 0.3, 5.0], rx: 0.18, ry: 0.16, w: 'tail3' },
    { c: [2.1, 0.25, 5.2], rx: 0.13, ry: 0.11, w: 'tail4' }, { c: [2.8, 0.22, 5.05], rx: 0.08, ry: 0.07, w: 'tail4' }, { c: [3.3, 0.2, 4.7], rx: 0.05, ry: 0.04, w: 'tail4' }],
    { paint: bodyPaint, n: Math.max(5, N - 2) });
  ctx.bone('tail4'); ctx.color(ok(C.dorsal));
  { const b = [3.25, 0.2, 4.75], tip = [3.85, 0.24, 4.05], l = [3.25, 0.22, 4.25], r = [3.8, 0.18, 4.7], up = [0, 1, 0]; T(ctx, b, l, tip, up); T(ctx, b, tip, r, up); }
  // neck and head
  tube(ctx, [
    { c: [0, 1.9, -1.75], rx: 0.72, ry: 0.72, w: 'chest' }, { c: [0, 2.6, -2.2], rx: 0.62, ry: 0.62, w: { chest: 0.5, neck1: 0.5 } }, { c: [0, 3.2, -2.5], rx: 0.54, ry: 0.54, w: 'neck1' },
    { c: [0, 3.8, -2.72], rx: 0.48, ry: 0.48, w: { neck1: 0.5, neck2: 0.5 } }, { c: [0, 4.35, -2.85], rx: 0.44, ry: 0.44, w: 'neck2' }, { c: [0, 4.8, -2.9], rx: 0.42, ry: 0.46, w: { neck2: 0.5, head: 0.5 } }],
    { paint: (s, i) => (s < -0.55 ? ok(i % 2 ? C.belly2 : C.belly) : s > 0.85 ? ok(C.dorsal) : ok(C.body)) });
  tube(ctx, [
    { c: [0, 4.85, -2.8], rx: 0.44, ry: 0.5, w: 'head' }, { c: [0, 4.95, -3.25], rx: 0.46, ry: 0.46, w: 'head' }, { c: [0, 4.88, -3.7], rx: 0.38, ry: 0.35, w: 'head' },
    { c: [0, 4.76, -4.15], rx: 0.3, ry: 0.26, w: 'head' }, { c: [0, 4.68, -4.5], rx: 0.22, ry: 0.18, w: 'head' }, { c: [0, 4.64, -4.66], rx: 0.13, ry: 0.1, w: 'head' }],
    { paint: (s) => (s > 0.8 ? ok(C.dorsal) : ok(C.body)), cap0: 0.2, cap1: 0.06 });
  tube(ctx, [{ c: [0, 4.58, -3.1], rx: 0.34, ry: 0.2, w: 'head' }, { c: [0, 4.47, -3.85], rx: 0.26, ry: 0.13, w: 'head' }, { c: [0, 4.44, -4.4], rx: 0.15, ry: 0.07, w: 'head' }],
    { col: C.belly, n: Math.max(5, N - 4), cap1: 0.05 });
  ctx.bone('head');
  // eyes, glowing amethyst
  for (const sx of [1, -1]) {
    const e = [0.36 * sx, 5.04, -3.45]; ctx.color(ok(C.eye)); ctx.emissive(`oklch(0.75 0.2 310)`);
    tube(ctx, [{ c: add(e, [0, 0, 0.07]), rx: 0.07, ry: 0.06 }, { c: add(e, [0, 0, -0.07]), rx: 0.08, ry: 0.06 }], { col: C.eye, n: 6, w: 'head', cap0: 0.04, cap1: 0.05 });
    ctx.emissive(null);
    cone(ctx, [0.3 * sx, 5.2, -3.55], [0.46 * sx, 5.32, -3.1], 0.09, C.dorsal, 4);             // brow
    tube(ctx, [{ c: [0.24 * sx, 5.22, -3.05], rx: 0.12, ry: 0.12 }, { c: [0.4 * sx, 5.62, -2.55], rx: 0.08, ry: 0.08 }, { c: [0.5 * sx, 5.9, -1.95], rx: 0.02, ry: 0.02 }],
      { col: C.gold, n: 6, w: 'head', cap1: 0.04 });                                          // horn
    cone(ctx, [0.4 * sx, 4.95, -2.85], [0.8 * sx, 5.12, -2.35], 0.07, C.gold, 5);             // cheek horn
    if (lod <= 2) for (let k = 0; k < 3; k++) cone(ctx, [0.2 * sx, 4.58, -3.7 - k * 0.22], [0.2 * sx, 4.46, -3.72 - k * 0.22], 0.025, [0.95, 0.02, 90], 3); // teeth
  }
  cone(ctx, [0, 4.84, -4.2], [0, 5.08, -4.05], 0.07, C.gold, 5);
  // dorsal spines, gold-tipped
  if (lod <= 3) {
    const sp = [[4.95, -2.5, 0.28], [4.3, -2.35, 0.26], [3.7, -2.2, 0.26], [3.1, -2.0, 0.28], [2.6, -1.62, 0.3], [2.46, 0.7, 0.3], [2.36, 1.3, 0.28], [2.1, 1.9, 0.25], [1.6, 2.6, 0.22], [1.3, 3.2, 0.19], [1.1, 3.8, 0.15], [0.85, 4.4, 0.11]];
    const wOf = (z, y) => (y > 4.5 ? 'head' : y > 3.5 ? 'neck2' : y > 2.55 && z < -1.8 ? 'neck1' : z < -1 ? 'chest' : z < 2.5 ? 'root' : z < 3.8 ? 'tail1' : 'tail2');
    for (const [y, z, h] of sp) { ctx.bone(wOf(z, y)); const x = z > 3.4 ? (z - 3.4) * 0.35 : 0; cone(ctx, [x, y - 0.05, z], [x, y + h, z + 0.18], h * 0.45, C.dorsal, 4); }
  }
  // forelegs and hind legs
  for (const sx of [1, -1]) {
    const arm = sx > 0 ? 'armR' : 'armL', leg = sx > 0 ? 'legR' : 'legL', ln = Math.max(5, N - 3);
    tube(ctx, [{ c: [0.95 * sx, 1.6, -1.45], rx: 0.42, ry: 0.42 }, { c: [1.0 * sx, 0.9, -1.35], rx: 0.34, ry: 0.34 }, { c: [1.02 * sx, 0.35, -1.3], rx: 0.28, ry: 0.28 },
      { c: [0.98 * sx, 0.26, -2.0], rx: 0.24, ry: 0.22 }, { c: [0.96 * sx, 0.22, -2.65], rx: 0.24, ry: 0.18 }, { c: [0.96 * sx, 0.2, -2.95], rx: 0.22, ry: 0.13 }],
      { paint: (s) => (s < -0.6 ? ok(C.belly) : ok(C.body)), n: ln, w: arm, cap1: 0.08 });
    tube(ctx, [{ c: [0.9 * sx, 1.55, 1.3], rx: 0.62, ry: 0.62 }, { c: [1.15 * sx, 1.15, 0.9], rx: 0.6, ry: 0.6 }, { c: [1.25 * sx, 0.6, 0.35], rx: 0.4, ry: 0.4 },
      { c: [1.25 * sx, 0.36, 1.1], rx: 0.26, ry: 0.26 }, { c: [1.2 * sx, 0.24, 1.5], rx: 0.22, ry: 0.2 }], { n: ln, w: leg, cap1: 0.06 });
    tube(ctx, [{ c: [1.2 * sx, 0.2, 1.55], rx: 0.2, ry: 0.14 }, { c: [1.24 * sx, 0.18, 0.95], rx: 0.21, ry: 0.12 }, { c: [1.25 * sx, 0.16, 0.75], rx: 0.18, ry: 0.1 }], { n: ln, w: leg, cap1: 0.05 });
    ctx.bone(arm); for (const dx of [-0.14, 0, 0.14]) cone(ctx, [0.96 * sx + dx, 0.18, -3.0], [0.96 * sx + dx * 1.3, 0.03, -3.32], 0.05, C.gold, 4);
    ctx.bone(leg); for (const dx of [-0.13, 0, 0.13]) cone(ctx, [1.25 * sx + dx, 0.16, 0.72], [1.25 * sx + dx * 1.3, 0.03, 0.45], 0.05, C.gold, 4);
  }
  wing(ctx, 1, lod); wing(ctx, -1, lod);
  // saddle: blanket, honey leather seat, cantle, brass pommel, straps (root bone: the rider's frame)
  if (lod <= 3) {
    ctx.bone('root');
    const cy = (z) => 1.38 + (z + 0.55) * -0.05, rX = 1.15, rY = 1.08;
    const arc = (z, a, off) => [Math.cos(a) * (rX + off), cy(z) + Math.sin(a) * (rY + off), z];
    const sheet = (zs, a0, a1, off, col, na = 8) => {
      ctx.color(ok(col));
      for (let i = 0; i < zs.length - 1; i++) for (let k = 0; k < na; k++) {
        const aa = a0 + ((a1 - a0) * k) / na, ab = a0 + ((a1 - a0) * (k + 1)) / na;
        const p = [arc(zs[i], aa, off), arc(zs[i], ab, off), arc(zs[i + 1], ab, off), arc(zs[i + 1], aa, off)];
        Q(ctx, ...p, sub(lerp(p[0], p[2], 0.5), [0, cy(zs[i]), zs[i]]));
      }
    };
    const R = Math.PI / 180;
    sheet([-1.05, 0.35], 28 * R, 152 * R, 0.035, C.brass, 10);                       // blanket trim
    sheet([-1.0, 0.3], 30 * R, 150 * R, 0.045, C.dorsal, 10);                        // blanket
    sheet([-0.95, -0.6, -0.25, 0.15], 52 * R, 128 * R, 0.08, C.leather, 8);          // seat
    ctx.color(ok(C.leather2));
    for (const [z, h] of [[0.15, 0.26], [-0.95, 0.12]]) for (let k = 0; k < 6; k++) {    // cantle and fork rise
      const a = (52 + (76 * k) / 6) * R, b = (52 + (76 * (k + 1)) / 6) * R, p0 = arc(z, a, 0.08), p1 = arc(z, b, 0.08), lift = (x) => Math.max(0, 1 - Math.abs(x) / 0.75) * h;
      Q(ctx, p0, p1, add(p1, [0, lift(p1[0]), 0.04 * Math.sign(z)]), add(p0, [0, lift(p0[0]), 0.04 * Math.sign(z)]), [0, 0, Math.sign(z) || 1]);
    }
    tube(ctx, [{ c: [0, 2.5, -0.97], rx: 0.06, ry: 0.06 }, { c: [0, 2.82, -1.02], rx: 0.05, ry: 0.05 }], { col: C.brass, n: 6, w: 'root' });
    tube(ctx, [{ c: [0, 2.8, -1.02], rx: 0.05, ry: 0.05 }, { c: [0, 2.87, -1.02], rx: 0.11, ry: 0.11 }, { c: [0, 2.95, -1.02], rx: 0.06, ry: 0.06 }], { col: C.brass, n: 8, w: 'root', cap1: 0.02 });
    for (const sx of [1, -1]) {                                                      // girth straps and stirrups
      ctx.color(ok(C.leather2));
      for (let k = 0; k < 6; k++) { const a = (52 - k * 14) * R, b = (52 - (k + 1) * 14) * R, fa = sx > 0 ? a : Math.PI - a, fb = sx > 0 ? b : Math.PI - b;
        const p0 = arc(-0.42, fa, 0.06), p1 = arc(-0.42, fb, 0.06); Q(ctx, p0, p1, add(p1, [0, 0, 0.14]), add(p0, [0, 0, 0.14]), [sx, 0, 0]); }
      const s0 = arc(-0.35, sx > 0 ? 40 * R : Math.PI - 40 * R, 0.12), s1 = add(s0, [0.12 * sx, -0.75, 0]);
      tube(ctx, [{ c: s0, rx: 0.025, ry: 0.025 }, { c: s1, rx: 0.025, ry: 0.025 }], { col: C.leather2, n: 4, w: 'root' });
      tube(ctx, [{ c: add(s1, [0, 0, -0.12]), rx: 0.03, ry: 0.03 }, { c: add(s1, [0, 0, 0.12]), rx: 0.03, ry: 0.03 }], { col: C.brass, n: 4, w: 'root' });
    }
  }
}
export function collider() { return { kind: 'box', width: 2.7, height: 3.0, depth: 6.4 }; }
