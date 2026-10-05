// One low-poly four-legged body kit shared by the ground animals (deer, wolf, bear, fox): feet at y 0, nose toward −Z.
// A species is a table P (proportions + palette); the rig is always root(rear hip) → legFL/FR/BL/BR, neck → head, tail.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function frame(d) { const h = Math.abs(d[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0]; const u = norm(cross(h, d)); return [u, cross(d, u)]; }
// rings: [{ c, rx, ry }] marched along the axis; faces wound outward; paint(ctx, up, segment) picks each face's colour.
export function tube(ctx, rings, o = {}) {
  const n = o.sides || 6, N = rings.length, ph = o.phase || 0, pts = [];
  for (let i = 0; i < N; i++) {
    const r = rings[i], d = o.dir || norm(sub(rings[Math.min(N - 1, i + 1)].c, rings[Math.max(0, i - 1)].c));
    const [u, v] = frame(d), ring = [];
    for (let k = 0; k < n; k++) { const t = (k / n) * Math.PI * 2 + ph; ring.push(add(r.c, add(mul(u, Math.cos(t) * r.rx), mul(v, Math.sin(t) * r.ry)))); }
    pts.push(ring);
  }
  for (let i = 0; i < N - 1; i++) for (let k = 0; k < n; k++) {
    const k1 = (k + 1) % n, mid = ((k + 0.5) / n) * Math.PI * 2 + ph;
    if (o.paint) o.paint(ctx, Math.sin(mid), i);
    ctx.quad(...pts[i][k], ...pts[i][k1], ...pts[i + 1][k1], ...pts[i + 1][k]);
  }
  if (o.capStart) { if (o.paintCap) o.paintCap(ctx, 0); const c = rings[0].c; for (let k = 0; k < n; k++) ctx.tri(...c, ...pts[0][(k + 1) % n], ...pts[0][k]); }
  if (o.tip || o.capEnd) { if (o.paintCap) o.paintCap(ctx, 1); const c = o.tip || rings[N - 1].c; for (let k = 0; k < n; k++) ctx.tri(...c, ...pts[N - 1][k], ...pts[N - 1][(k + 1) % n]); }
}
export function detail(lod) {
  return { body: lod <= 2 ? 8 : lod === 3 ? 6 : 4, leg: lod <= 2 ? 5 : lod === 3 ? 4 : 3, head: lod <= 2 ? 6 : lod === 3 ? 5 : 4, neck: lod <= 3 ? 5 : 4,
    tail: lod <= 2 ? 6 : 4, eyes: lod <= 2, ears: lod <= 3, tailOn: lod <= 4, spots: lod <= 2, tines: lod <= 2, antler: lod <= 4 };
}
const pick = (arr, lod) => (lod >= 4 && arr.length > 3 ? [arr[0], arr[Math.floor(arr.length / 2)], arr[arr.length - 1]] : arr);
export function skeleton(P) {
  const n = P.neck[0], h = P.head[0], t = P.tail[0];
  return {
    root: { pivot: [0, P.L, P.zb] },
    legFL: { parent: 'root', pivot: [-P.legX, P.L, P.zf] }, legFR: { parent: 'root', pivot: [P.legX, P.L, P.zf] },
    legBL: { parent: 'root', pivot: [-P.legX, P.L, P.zb] }, legBR: { parent: 'root', pivot: [P.legX, P.L, P.zb] },
    neck: { parent: 'root', pivot: [0, n[0], n[1]] }, head: { parent: 'neck', pivot: [0, h[1], h[0]] },
    tail: { parent: 'root', pivot: [0, t[0], t[1]] },
  };
}
function ear(ctx, P, side) {
  const E = P.ears, C = P.col, b = [side * E.x, E.y, E.z], tip = [side * E.tx, E.ty, E.tz], w = E.w;
  const f = [b[0], b[1], b[2] - w], bk = [b[0], b[1], b[2] + w * 0.7], inn = [b[0] - side * w * 0.9, b[1] - w * 0.2, b[2]];
  ctx.color(C.earIn || C.coat); ctx.tri(...f, ...inn, ...tip);
  ctx.color(C.earOut || C.top); ctx.tri(...bk, ...f, ...tip); ctx.tri(...inn, ...bk, ...tip);
}
function eye(ctx, P, side) {
  const [z, y, rx, ry] = P.head[P.eyeRing], e = P.eye, x = side * (rx * 0.86 + 0.004), yy = y + ry * 0.3;
  ctx.color('oklch(0.17 0.02 40)');
  ctx.quad(x, yy + e, z, x, yy, z - e * 1.15, x, yy - e, z, x, yy, z + e * 1.15);
  const g = e * 0.4, xg = x + side * 0.002;
  ctx.color('oklch(0.98 0.01 90)'); ctx.tri(xg, yy + e * 0.55, z - e * 0.2, xg, yy + e * 0.15, z - e * 0.55, xg, yy + e * 0.15 + g * 0.2, z - e * 0.1);
}
export function spots(ctx, P, list, size, colour) {
  ctx.color(colour);
  for (const [z, th, side] of list) {
    let a = P.body[0], b = P.body[P.body.length - 1];
    for (let i = 0; i < P.body.length - 1; i++) if (z >= P.body[i][0] && z <= P.body[i + 1][0]) { a = P.body[i]; b = P.body[i + 1]; break; }
    const t = (z - a[0]) / ((b[0] - a[0]) || 1), y = a[1] + (b[1] - a[1]) * t, rx = a[2] + (b[2] - a[2]) * t, ry = a[3] + (b[3] - a[3]) * t;
    const nrm = norm([side * Math.cos(th) / rx, Math.sin(th) / ry, 0]), p = [side * Math.cos(th) * rx * 1.04, y + Math.sin(th) * ry * 1.04, z];
    const t1 = [0, 0, size], t2 = mul(norm(cross(nrm, [0, 0, 1])), size * 0.8);
    ctx.quad(...add(p, t1), ...add(p, t2), ...sub(p, t1), ...sub(p, t2));
  }
}
export function build(ctx, P) {
  const lod = ctx.lod ?? 1, D = detail(lod), C = P.col;
  ctx.smooth(); ctx.roughness(0.92);
  // body
  ctx.bone('root');
  tube(ctx, pick(P.body, lod).map(([z, y, rx, ry]) => ({ c: [0, y, z], rx, ry })), {
    sides: D.body, dir: [0, 0, 1], capStart: true, capEnd: true,
    paint: (ctx, s) => ctx.color(s > 0.55 ? C.top : s > -0.35 ? C.coat : C.belly),
    paintCap: (ctx, e) => ctx.color(e ? C.rump || C.coat : C.throat || C.coat),
  });
  // legs
  for (const [name, x, z, back] of [['legFL', -P.legX, P.zf, 0], ['legFR', P.legX, P.zf, 0], ['legBL', -P.legX, P.zb, 1], ['legBR', P.legX, P.zb, 1]]) {
    ctx.bone(name);
    const rT = back ? P.rBack : P.rFront, rB = P.rFoot, L = P.L;
    const all = [{ c: [x, L + rT * 0.5, z + (back ? rT * 0.2 : 0)], rx: rT * 0.85, ry: rT * 1.25 }, { c: [x, L * 0.55, z + (back ? L * 0.12 : -L * 0.02)], rx: rT * 0.55, ry: rT * 0.65 },
      { c: [x, L * 0.14, z + (back ? -L * 0.01 : L * 0.02)], rx: rB, ry: rB }, { c: [x, 0.004, z - rB * 0.2], rx: rB * 1.2, ry: rB * 1.35 }];
    const rings = (lod >= 5 ? [0, 3] : lod === 4 ? [0, 2, 3] : [0, 1, 2, 3]).map((i) => ({ ...all[i], i }));
    tube(ctx, rings, { sides: D.leg, dir: [0, -1, 0], phase: Math.PI / D.leg, capEnd: true,
      paint: (ctx, s, i) => ctx.color(rings[i + 1].i >= P.sock ? C.dark : C.leg || C.coat), paintCap: (ctx) => ctx.color(C.dark) });
  }
  // neck
  ctx.bone('neck');
  const nk = lod >= 4 ? [P.neck[0], P.neck[P.neck.length - 1]] : P.neck;
  tube(ctx, nk.map(([y, z, r]) => ({ c: [0, y, z], rx: r * (P.neckW || 1), ry: r })), { sides: D.neck,
    paint: (ctx, s) => ctx.color(s > 0.4 ? C.top : s > -0.4 ? C.coat : C.throat || C.belly) });
  // head
  ctx.bone('head');
  const hd = lod >= 4 ? [P.head[0], P.head[1], P.head[P.head.length - 1]] : P.head, sf = lod >= 4 ? 2 : P.snoutFrom;
  tube(ctx, hd.map(([z, y, rx, ry]) => ({ c: [0, y, z], rx, ry })), { sides: D.head, dir: [0, 0, -1], capStart: true, tip: [0, P.nose[1], P.nose[0]],
    paint: (ctx, s, i) => ctx.color(i >= sf ? (s > 0.3 ? C.snoutTop || C.snout : C.snout) : s > 0.5 ? C.top : s > -0.4 ? C.coat : C.throat || C.belly),
    paintCap: (ctx, e) => ctx.color(e ? C.dark : C.coat) });
  if (D.eyes) { eye(ctx, P, -1); eye(ctx, P, 1); }
  if (D.ears) { ear(ctx, P, -1); ear(ctx, P, 1); }
  // tail
  if (D.tailOn) {
    ctx.bone('tail');
    const tl = lod >= 4 ? [P.tail[0], P.tail[P.tail.length - 1]] : P.tail, tf = lod >= 4 ? (P.tailTipFrom < 9 ? 1 : 9) : P.tailTipFrom;
    tube(ctx, tl.map(([y, z, r]) => ({ c: [0, y, z], rx: r, ry: r })), { sides: D.tail, tip: [0, P.tailEnd[0], P.tailEnd[1]],
      paint: (ctx, s, i) => ctx.color(i + 1 >= tf ? C.tip : s > 0 ? C.top : C.tailUnder || C.coat), paintCap: (ctx) => ctx.color(tf < 9 ? C.tip : C.tailUnder || C.coat) });
  }
  ctx.bone(null);
  return { lod, D };
}
export { tube as tubeOf };
