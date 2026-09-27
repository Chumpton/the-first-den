// Ember: a big bronze-gold dragon lying curled on a roost ledge. Origin = ledge floor centre, head toward −Z (over the front edge),
// torso along +Z offset to +X, tail curling round the right flank and hanging down the front face. Wings modelled folded;
// the behaviour opens them by yawing wingR/wingL about the shoulder. params.colors { body: [l,c,h], … } re-paints any part.
const DEF = { body: [0.78, 0.14, 76], body2: [0.72, 0.14, 68], dorsal: [0.58, 0.12, 56], belly: [0.9, 0.08, 90], belly2: [0.83, 0.09, 80],
  membrane: [0.78, 0.12, 60], horn: [0.93, 0.03, 85], eye: [0.87, 0.17, 100], claw: [0.9, 0.03, 85], fin: [0.64, 0.14, 48] };
const ok = (a) => `oklch(${a[0]} ${a[1]} ${a[2]})`;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]), norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function Q(ctx, a, b, c, d, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.quad(...a, ...d, ...c, ...b); else ctx.quad(...a, ...b, ...c, ...d); }
function T(ctx, a, b, c, out) { const n = cross(sub(b, a), sub(c, a)); if (dot(n, out) < 0) ctx.tri(...a, ...c, ...b); else ctx.tri(...a, ...b, ...c); }
let C = DEF, N = 12;
function frame(t) { let side = cross(t, [0, 1, 0]); if (len(side) < 1e-3) side = [1, 0, 0]; side = norm(side); return [side, norm(cross(side, t))]; }
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
const P0 = (x, y, z, rx, ry, w) => ({ c: [x, y, z], rx, ry: ry ?? rx, w });
const band = (s, i) => (s < -0.45 ? ok(i % 2 ? C.belly2 : C.belly) : s > 0.8 ? ok(C.dorsal) : ok(i % 3 === 1 ? C.body2 : C.body));
const CX = 0.5; // torso centre line
// the tail path: rump → round the right flank → over the front parapet → hanging down the face to a spade
const TAIL = [P0(CX, 0.75, 2.2, 0.72, 0.62, 'root'), P0(0.95, 0.6, 2.95, 0.56, 0.5, 'tail1'), P0(1.85, 0.46, 3.35, 0.46, 0.42, 'tail1'),
  P0(2.9, 0.38, 3.12, 0.39, 0.35, 'tail2'), P0(3.6, 0.33, 2.3, 0.34, 0.3, 'tail2'), P0(3.95, 0.3, 1.0, 0.3, 0.27, 'tail2'),
  P0(4.05, 0.3, -0.5, 0.27, 0.25, 'tail3'), P0(4.1, 0.42, -2.2, 0.25, 0.23, 'tail3'), P0(4.15, 0.92, -3.6, 0.23, 0.22, 'tail3'),
  P0(4.2, 1.16, -4.3, 0.21, 0.2, 'tail4'), P0(4.2, 0.55, -4.78, 0.19, 0.18, 'tail4'), P0(4.18, -0.7, -4.86, 0.17, 0.16, 'tail4'),
  P0(4.12, -2.1, -4.8, 0.14, 0.13, 'tail5'), P0(4.05, -3.5, -4.74, 0.1, 0.1, 'tail5'), P0(4.0, -4.55, -4.7, 0.06, 0.06, 'tail5')];
function wing(ctx, sx, lod) {
  const X = (dx) => CX + dx * sx, bone = sx > 0 ? 'wingR' : 'wingL';
  const S = [X(0.72), 1.6, -1.0], W = [X(1.02), 2.3, -0.05];
  const F = [[X(0.75), 1.78, 3.0], [X(1.2), 1.22, 2.65], [X(1.45), 0.95, 1.65], [X(1.38), 0.92, 0.55]], H = [X(0.95), 1.35, -0.55];
  ctx.bone(bone);
  const out = [sx, 0.6, 0], edge = [...F, H];
  ctx.color(ok(C.membrane), 0.92); ctx.emissive(ok([0.28, 0.08, 45]));
  for (let i = 0; i < edge.length - 1; i++) { const m = lerp(lerp(edge[i], edge[i + 1], 0.5), W, 0.14); T(ctx, W, edge[i], m, out); T(ctx, W, m, edge[i + 1], out); }
  T(ctx, W, H, S, out);
  ctx.emissive(null);
  const n = lod >= 3 ? 4 : 6;
  tube(ctx, [{ c: S, rx: 0.17, ry: 0.17 }, { c: W, rx: 0.12, ry: 0.12 }], { n, col: C.dorsal, w: bone, cap1: 0.06 });
  for (const f of F) tube(ctx, [{ c: W, rx: 0.07, ry: 0.07 }, { c: f, rx: 0.025, ry: 0.025 }], { n: 4, col: C.dorsal, w: bone });
  cone(ctx, W, add(W, [0.12 * sx, 0.38, -0.25]), 0.07, C.horn, 4); // wrist thumb claw
}
export function skeleton() {
  return {
    root: { pivot: [CX, 0.8, 0.4] }, chest: { parent: 'root', pivot: [CX, 0.95, -1.1] },
    neck1: { parent: 'chest', pivot: [0.45, 1.15, -1.9] }, neck2: { parent: 'neck1', pivot: [0.0, 1.35, -3.0] },
    head: { parent: 'neck2', pivot: [-0.55, 1.4, -3.65] }, jaw: { parent: 'head', pivot: [-0.64, 1.2, -3.9] },
    wingR: { parent: 'chest', pivot: [CX + 0.72, 1.6, -1.0] }, wingL: { parent: 'chest', pivot: [CX - 0.72, 1.6, -1.0] },
    tail1: { parent: 'root', pivot: [0.8, 0.7, 2.6] }, tail2: { parent: 'tail1', pivot: [2.6, 0.42, 3.25] },
    tail3: { parent: 'tail2', pivot: [4.0, 0.3, 0.2] }, tail4: { parent: 'tail3', pivot: [4.2, 1.1, -4.2] }, tail5: { parent: 'tail4', pivot: [4.15, -1.4, -4.83] },
  };
}
export function geometry(ctx) {
  C = { ...DEF, ...(ctx.params?.colors ?? {}) };
  const lod = ctx.lod ?? 1; N = [12, 12, 10, 8, 6, 5][lod] ?? 8;
  ctx.smooth(); ctx.roughness(0.42); ctx.metalness(0.15);
  // torso, lying belly-down
  tube(ctx, [P0(CX, 1.0, -2.2, 0.5, 0.5, 'chest'), P0(CX, 0.95, -1.75, 0.88, 0.8, 'chest'), P0(CX, 0.88, -1.0, 1.08, 0.86, 'chest'),
    P0(CX, 0.86, -0.1, 1.14, 0.85, { chest: 0.5, root: 0.5 }), P0(CX, 0.85, 0.8, 1.12, 0.84, 'root'), P0(CX, 0.8, 1.6, 1.0, 0.78, 'root'),
    P0(CX, 0.75, 2.25, 0.74, 0.62, 'root')], { paint: band, cap0: 0.15 });
  // tail
  tube(ctx, TAIL, { paint: band, n: Math.max(5, N - 2) });
  ctx.bone('tail5');
  { const c = [4.0, -4.55, -4.7], out = [0, 0, -1];               // the spade, flat against the wall
    const top = [4.0, -4.4, -4.72], l = [3.62, -4.95, -4.72], r = [4.38, -4.95, -4.72], tip = [4.0, -5.65, -4.72], back = [4.0, -4.9, -4.62];
    ctx.color(ok(C.fin)); T(ctx, top, l, back, [-1, 0.4, -0.5]); T(ctx, top, back, r, [1, 0.4, -0.5]); T(ctx, l, tip, back, [-1, -0.4, -0.5]); T(ctx, back, tip, r, [1, -0.4, -0.5]);
    T(ctx, top, r, tip, out); T(ctx, top, tip, l, out); void c; }
  // neck, sweeping left and forward to the head that rests over the edge
  tube(ctx, [P0(CX, 1.15, -1.75, 0.66, 0.64, 'chest'), P0(0.4, 1.24, -2.4, 0.57, 0.55, { chest: 0.4, neck1: 0.6 }), P0(0.1, 1.33, -3.0, 0.5, 0.48, 'neck1'),
    P0(-0.28, 1.38, -3.42, 0.45, 0.45, { neck1: 0.5, neck2: 0.5 }), P0(-0.55, 1.4, -3.68, 0.43, 0.46, { neck2: 0.5, head: 0.5 })], { paint: band });
  // head
  tube(ctx, [P0(-0.57, 1.44, -3.62, 0.43, 0.48, 'head'), P0(-0.65, 1.52, -4.05, 0.46, 0.45, 'head'), P0(-0.74, 1.46, -4.5, 0.38, 0.34, 'head'),
    P0(-0.82, 1.38, -4.95, 0.3, 0.25, 'head'), P0(-0.87, 1.33, -5.3, 0.22, 0.17, 'head'), P0(-0.9, 1.31, -5.46, 0.13, 0.1, 'head')],
    { paint: (s) => (s > 0.78 ? ok(C.dorsal) : s < -0.6 ? ok(C.belly2) : ok(C.body)), cap0: 0.2, cap1: 0.06 });
  // lower jaw on its own bone (the yawn)
  tube(ctx, [P0(-0.62, 1.2, -3.9, 0.33, 0.17, 'jaw'), P0(-0.75, 1.12, -4.65, 0.26, 0.12, 'jaw'), P0(-0.84, 1.1, -5.22, 0.15, 0.07, 'jaw')],
    { col: C.belly, n: Math.max(5, N - 4), cap1: 0.05 });
  ctx.bone('jaw'); ctx.color('oklch(0.45 0.12 25)');          // mouth lining, seen when it yawns
  { const a = [-0.47, 1.27, -3.95], b = [-0.8, 1.2, -5.2], c = [-0.77, 1.27, -3.95], out = [0, 1, 0]; T(ctx, a, b, c, out); }
  if (lod <= 2) for (const sx of [1, -1]) for (let k = 0; k < 4; k++) { const z = -4.25 - k * 0.24, x = -0.74 + sx * (0.22 - k * 0.025) - k * 0.02;
    ctx.bone('head'); cone(ctx, [x, 1.26, z], [x, 1.12, z - 0.02], 0.03, C.claw, 3); }
  ctx.bone('head');
  for (const sx of [1, -1]) {
    const hx = -0.66 + 0.33 * sx;
    ctx.color(ok(C.eye)); ctx.emissive(ok(C.eye));                // sleepy half-lidded amber eyes
    tube(ctx, [{ c: [hx, 1.62, -4.12], rx: 0.07, ry: 0.035 }, { c: [hx - 0.02, 1.61, -4.32], rx: 0.08, ry: 0.03 }], { col: C.eye, n: 6, w: 'head', cap0: 0.03, cap1: 0.05 });
    ctx.emissive(null);
    cone(ctx, [hx - 0.01, 1.72, -4.32], [hx + 0.08 * sx, 1.78, -3.95], 0.08, C.dorsal, 4);               // heavy brow
    tube(ctx, [P0(-0.62 + 0.24 * sx, 1.78, -3.9, 0.12), P0(-0.62 + 0.42 * sx, 2.05, -3.4, 0.09), P0(-0.62 + 0.55 * sx, 2.15, -2.85, 0.05), P0(-0.62 + 0.6 * sx, 2.05, -2.45, 0.015)],
      { col: C.horn, n: 6, w: 'head', cap1: 0.03 });                                                      // swept ivory horns
    cone(ctx, [-0.62 + 0.3 * sx, 1.45, -3.7], [-0.62 + 0.72 * sx, 1.55, -3.25], 0.07, C.horn, 4);     // cheek spur
    ctx.color('oklch(0.3 0.05 40)'); cone(ctx, [-0.9 + 0.07 * sx, 1.36, -5.4], [-0.9 + 0.07 * sx, 1.36, -5.5], 0.035, [0.3, 0.05, 40], 4); // nostril
  }
  // frill fins behind the head
  ctx.color(ok(C.fin));
  for (const sx of [1, -1]) { const b0 = [-0.6 + 0.3 * sx, 1.6, -3.45], b1 = [-0.55 + 0.25 * sx, 1.35, -3.3], tip = [-0.5 + 0.7 * sx, 1.7, -2.95]; T(ctx, b0, b1, tip, [sx, 0.3, 0]); }
  // dorsal crest along neck, back and tail
  if (lod <= 3) {
    const sp = [[-0.6, 1.88, -3.5, 0.2, 'head'], [-0.3, 1.8, -3.25, 0.22, 'neck2'], [0.05, 1.78, -2.9, 0.24, 'neck1'], [0.35, 1.76, -2.35, 0.26, 'neck1'],
      [CX, 1.72, -1.75, 0.28, 'chest'], [CX, 1.72, 0.35, 0.3, 'root'], [CX, 1.68, 1.05, 0.28, 'root'], [CX, 1.55, 1.7, 0.25, 'root'], [CX, 1.34, 2.25, 0.22, 'root']];
    for (const [x, y, z, h, w] of sp) { ctx.bone(w); cone(ctx, [x, y - 0.06, z], [x, y + h, z + 0.2], h * 0.42, C.fin, 4); }
    for (let i = 1; i < 11; i++) { const p = TAIL[i]; ctx.bone(p.w); const q = TAIL[i + 1], t = norm(sub(q.c, p.c)), [sd, up] = frame(t);
      const b = add(p.c, mul(up, p.ry * 0.9)); cone(ctx, b, add(add(b, mul(up, 0.1 + p.ry * 0.45)), mul(t, 0.12)), p.ry * 0.38, C.fin, 4); void sd; }
  }
  // forelegs folded under the chest, paws forward; hind legs tucked beside the haunches
  const ln = Math.max(5, N - 3);
  const fore = [[1, 1.4, -1.2, 1.25, 2.7], [-1, -0.45, -1.3, -0.45, 2.8]];
  for (const [sx, x0, z0, px, pz] of fore) {
    tube(ctx, [P0(CX + 0.85 * sx, 0.95, -1.5, 0.4, 0.4, 'chest'), P0(x0, 0.42, z0, 0.3, 0.3, 'chest'), P0((x0 + px) / 2, 0.24, -2.0, 0.24, 0.2, 'chest'),
      P0(px, 0.2, -pz + 0.1, 0.25, 0.14, 'chest'), P0(px, 0.18, -pz - 0.15, 0.22, 0.12, 'chest')], { paint: (s) => (s < -0.6 ? ok(C.belly) : ok(C.body)), n: ln, cap1: 0.06 });
    ctx.bone('chest'); for (const dx of [-0.13, 0, 0.13]) cone(ctx, [px + dx, 0.16, -pz - 0.2], [px + dx * 1.3, 0.03, -pz - 0.45], 0.05, C.claw, 4);
  }
  for (const sx of [1, -1]) {
    const hx = CX + 0.95 * sx;
    tube(ctx, [P0(hx, 0.95, 1.35, 0.6), P0(hx + 0.18 * sx, 0.55, 0.75, 0.48), P0(hx + 0.2 * sx, 0.24, 0.2, 0.26, 0.2), P0(hx + 0.2 * sx, 0.18, -0.25, 0.22, 0.12)],
      { n: ln, w: 'root', cap0: 0.1, cap1: 0.05 });
    ctx.bone('root'); for (const dx of [-0.12, 0, 0.12]) cone(ctx, [hx + 0.2 * sx + dx, 0.15, -0.3], [hx + 0.2 * sx + dx * 1.3, 0.03, -0.52], 0.045, C.claw, 4);
  }
  wing(ctx, 1, lod); wing(ctx, -1, lod);
}
export function collider() { return null; }
