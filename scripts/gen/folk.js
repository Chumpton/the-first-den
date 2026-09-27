// The district folk: twenty authored bodies, one script. params.who (a name below, or 1-20) picks one: each its own
// build, height, head, hair, hat, clothes and held prop. Feet at y 0, facing -Z, flat low-poly, lowpoly-cozy paint.
// Rig: hips > spine > chest > neck > head; chest > upperArm > lowerArm (hand + prop); hips > upperLeg > lowerLeg > foot.
// L is the body's own left (-X). Clips: scripts/lib/data/folk.yml, played by scripts/folk-crowd.js.
const TAU = Math.PI * 2, RAD = Math.PI / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function rot(v, e) {
  if (!e) return v;
  let [x, y, z] = v; const p = e[0] * RAD, w = e[1] * RAD, r = e[2] * RAD;
  let c = Math.cos(r), s = Math.sin(r); [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(p); s = Math.sin(p); [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(w); s = Math.sin(w); [x, z] = [x * c + z * s, -x * s + z * c];
  return [x, y, z];
}
let N = 8; // ring sides for this level
const C = {
  wood: 'oklch(0.55 0.08 60)', dwood: 'oklch(0.4 0.06 50)', iron: 'oklch(0.42 0.012 250)', steel: 'oklch(0.8 0.015 250)', gold: 'oklch(0.8 0.14 85)',
  white: 'oklch(0.96 0.01 90)', cream: 'oklch(0.93 0.03 90)', leather: 'oklch(0.46 0.07 50)', straw: 'oklch(0.84 0.1 88)', ink: 'oklch(0.22 0.03 40)',
  leaf: 'oklch(0.58 0.13 140)', glass: 'oklch(0.92 0.03 210)',
};
function pc(ctx, c, m = 0, a = 1) { if (a < 1) ctx.color(c, a); else ctx.color(c); ctx.metalness(m); ctx.emissive(null); }
function glow(ctx, c, r, g, b) { ctx.color(c); ctx.metalness(0); ctx.emissive(r, g, b); }
function poly(ctx, P) { for (let i = 1; i < P.length - 1; i++) ctx.tri(...P[0], ...P[i], ...P[i + 1]); }

// a tube through points [x, y, z, rx, rz?]; o: n, a (cap start), b (cap end), tip [x,y,z], loop
function tube(ctx, pts, o = {}) {
  const n = o.n || Math.min(N, 6), M = pts.length, R = [];
  for (let i = 0; i < M; i++) {
    const p = pts[i], d = norm(sub(pts[o.loop ? (i + 1) % M : Math.min(M - 1, i + 1)], pts[o.loop ? (i - 1 + M) % M : Math.max(0, i - 1)]));
    const r = Math.abs(d[1]) > 0.9 ? [0, 0, 1] : [0, 1, 0], u = norm(cross(d, r)), v = cross(u, d), ring = [];
    for (let k = 0; k < n; k++) { const t = (k / n) * TAU; ring.push(add(p, add(mul(u, Math.cos(t) * p[3]), mul(v, Math.sin(t) * (p[4] ?? p[3]))))); }
    R.push(ring);
  }
  const segs = o.loop ? M : M - 1;
  for (let i = 0; i < segs; i++) { const A = R[i], B = R[(i + 1) % M]; for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; ctx.quad(...A[k], ...B[k], ...B[k1], ...A[k1]); } }
  if (o.a) for (let k = 0; k < n; k++) ctx.tri(...pts[0].slice(0, 3), ...R[0][(k + 1) % n], ...R[0][k]);
  if (o.b) for (let k = 0; k < n; k++) ctx.tri(...pts[M - 1].slice(0, 3), ...R[M - 1][k], ...R[M - 1][(k + 1) % n]);
  if (o.tip) for (let k = 0; k < n; k++) ctx.tri(...o.tip, ...R[M - 1][k], ...R[M - 1][(k + 1) % n]);
}
// vertical rings [y, rx, rz?, x?, z?] (0 deg = front, -Z); o: n, arc [a0, a1], a/b caps, tip, rag (hem jitter), e + p (turn about p)
function vt(ctx, rings, o = {}) {
  const n = o.n || N, arc = o.arc, cnt = arc ? n + 1 : n, piv = o.p || [0, 0, 0];
  const X = (q) => (o.e ? add(piv, rot(sub(q, piv), o.e)) : q);
  const P = rings.map(([y, rx, rz = rx, x = 0, z = 0], i) => {
    const row = [], rag = o.rag && i === rings.length - 1 ? o.rag : 0;
    for (let k = 0; k < cnt; k++) {
      const t = arc ? (arc[0] + ((arc[1] - arc[0]) * k) / n) * RAD : (k / n) * TAU, j = rag ? (k % 2 ? 1 - rag : 1 + rag * 0.4) : 1;
      row.push(X([x + Math.sin(t) * rx * j, y - (rag && !(k % 2) ? rag * 0.25 : 0), z - Math.cos(t) * rz * j]));
    }
    return row;
  });
  const cen = rings.map(([y, , , x = 0, z = 0]) => X([x, y, z]));
  for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < (arc ? n : cnt); k++) { const k1 = (k + 1) % cnt; ctx.quad(...P[i][k], ...P[i][k1], ...P[i + 1][k1], ...P[i + 1][k]); }
  const last = P.length - 1;
  if (o.a) for (let k = 0; k < (arc ? n : cnt); k++) ctx.tri(...cen[0], ...P[0][k], ...P[0][(k + 1) % cnt]);
  if (o.b) for (let k = 0; k < (arc ? n : cnt); k++) ctx.tri(...cen[last], ...P[last][(k + 1) % cnt], ...P[last][k]);
  if (o.tip) { const t = X(o.tip); for (let k = 0; k < (arc ? n : cnt); k++) ctx.tri(...t, ...P[last][(k + 1) % cnt], ...P[last][k]); }
}
// ellipsoid; o: s (sides), q (bands), l0/l1 latitude range in degrees, e (turn about its centre)
function ell(ctx, c, r, o = {}) {
  const s = o.s || N, q = o.q || Math.max(2, Math.round(s / 2)), l0 = (o.l0 ?? -90) * RAD, l1 = (o.l1 ?? 90) * RAD, P = [];
  for (let i = 0; i <= q; i++) {
    const la = l0 + ((l1 - l0) * i) / q, cy = Math.sin(la), cr = Math.cos(la), row = [];
    for (let k = 0; k < s; k++) { const t = (k / s) * TAU; row.push(add(c, rot([Math.sin(t) * cr * r[0], cy * r[1], -Math.cos(t) * cr * r[2]], o.e))); }
    P.push(row);
  }
  const p0 = l0 <= -Math.PI / 2 + 1e-6, p1 = l1 >= Math.PI / 2 - 1e-6;
  for (let i = 0; i < q; i++) for (let k = 0; k < s; k++) {
    const k1 = (k + 1) % s, A = P[i][k], B = P[i][k1], Cc = P[i + 1][k1], D = P[i + 1][k];
    if (i === 0 && p0) ctx.tri(...A, ...Cc, ...D); else if (i === q - 1 && p1) ctx.tri(...A, ...B, ...Cc); else ctx.quad(...A, ...B, ...Cc, ...D);
  }
}
function obox(ctx, c, h, e) {
  const V = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) V.push(add(c, rot([sx * h[0], sy * h[1], sz * h[2]], e)));
  for (const f of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) ctx.quad(...V[f[0]], ...V[f[1]], ...V[f[2]], ...V[f[3]]);
}
// a flat outline P with thickness along off: shields, blades, fans, saws
function plate(ctx, P, off) {
  const B = P.map((p) => add(p, off));
  poly(ctx, P); poly(ctx, [...B].reverse());
  for (let i = 0; i < P.length; i++) { const j = (i + 1) % P.length; ctx.quad(...P[i], ...P[j], ...B[j], ...B[i]); }
}
// a four-point star laid on a surface at p with outward normal nr
function star(ctx, p, nr, s) {
  const u = norm(cross(nr, [0, 1, 0])), v = [0, 1, 0], q = add(p, mul(nr, 0.004)), P = [];
  for (let k = 0; k < 8; k++) { const t = (k / 8) * TAU, r = k % 2 ? s * 0.38 : s; P.push(add(q, add(mul(u, Math.cos(t) * r), mul(v, Math.sin(t) * r)))); }
  for (let k = 0; k < 8; k++) ctx.tri(...q, ...P[k], ...P[(k + 1) % 8]);
}

const DEF = {
  leg: 0.8, torso: 0.55, neck: 0.07, sw: 0.2, hx: 0.09, armR: 0.055, legR: 0.065, head: [0.15, 0.155, 0.15], hz: 0,
  waist: [0.16, 0.12], belly: [0.17, 0.13], bellyF: 0, chestR: [0.19, 0.13], neckR: 0.05, foot: 1, hand: 1, nose: 1, eye: 0.026, smile: 1,
  skin: 'oklch(0.8 0.06 60)', hair: 'oklch(0.4 0.06 50)', hairStyle: 'short', shirt: 'oklch(0.7 0.06 80)', pants: 'oklch(0.4 0.04 60)', shoe: 'oklch(0.33 0.04 50)',
};
function dims(K) {
  const f = 0.07, hip = K.leg + f, sh = hip + K.torso, nt = sh + K.neck, arm = K.arm ?? K.torso * 1.02 + 0.05;
  return { f, hip, knee: f + K.leg * 0.47, sh, chest: hip + K.torso * 0.55, nt, hc: nt + K.head[1] * 0.8, elbow: sh - 0.04 - arm * 0.47, wrist: sh - 0.04 - arm, ax: K.sw, hx: K.hx };
}
const hands = (D) => ({ r: [D.ax + 0.025, D.wrist - 0.04, 0], l: [-(D.ax + 0.025), D.wrist - 0.04, 0] });

// ---- faces, hair, beards ---------------------------------------------------------------------------------------
function face(ctx, K, D, L) {
  const [rx, ry, rz] = K.head, hc = D.hc, fz = K.hz;
  const S = (x, y, o = 1.015) => { const a = x / rx, b = (y - hc) / ry, t = Math.max(0, 1 - a * a - b * b); return [x, y, fz - rz * Math.sqrt(t) * o]; };
  const disc = (cx, cy, r, r2, m, o) => { const P = []; for (let k = 0; k < m; k++) { const t = (-k / m) * TAU; P.push(S(cx + Math.cos(t) * r, cy + Math.sin(t) * r2, o)); } poly(ctx, P); };
  const ex = rx * 0.36 * (K.eyeW || 1), ey = hc + ry * 0.04, er = K.eye;
  pc(ctx, C.ink); for (const s of [-1, 1]) disc(s * ex, ey, er * 0.78, er, L <= 2 ? 6 : 4);
  if (K.nose !== 0) { pc(ctx, K.skin); const nb = S(0, hc - ry * 0.12, 0.96); ell(ctx, nb, [0.026 * K.nose, 0.03 * K.nose, 0.03 * K.nose], { s: 5, q: 3 }); }
  if (L >= 3) return;
  if (L <= 1) { pc(ctx, C.white); for (const s of [-1, 1]) disc(s * ex + er * 0.28, ey + er * 0.38, er * 0.28, er * 0.28, 3, 1.03); }
  pc(ctx, K.brow || K.hair); const bt = K.browT || 0.011, lift = K.browLift ?? 0.006;
  for (const s of [-1, 1]) { const xi = s * (ex - er * 1.1), xo = s * (ex + er * 1.35), yi = ey + er * 1.9 + lift, yo = ey + er * 1.75; ctx.quad(...S(xi, yi, 1.025), ...S(xo, yo, 1.025), ...S(xo, yo + bt, 1.025), ...S(xi, yi + bt, 1.025)); }
  if (!K.mouthHid) {
    pc(ctx, 'oklch(0.45 0.12 22)'); const mw = rx * 0.27 * (K.mouthW || 1), my = hc - ry * 0.42, sm = 0.022 * K.smile;
    for (let i = 0; i < 4; i++) { const x0 = -mw + (i * mw) / 2, x1 = x0 + mw / 2, y0 = my + (x0 / mw) ** 2 * sm, y1 = my + (x1 / mw) ** 2 * sm; ctx.quad(...S(x0, y0, 1.02), ...S(x1, y1, 1.02), ...S(x1, y1 + 0.009, 1.02), ...S(x0, y0 + 0.009, 1.02)); }
  }
  if (K.blush) { pc(ctx, 'oklch(0.76 0.1 15)'); for (const s of [-1, 1]) disc(s * rx * 0.56, hc - ry * 0.26, 0.034, 0.022, 6, 1.01); }
  if (K.freckles && L <= 1) { pc(ctx, 'oklch(0.6 0.1 45)'); for (const s of [-1, 1]) for (const [dx, dy] of [[0.42, -0.14], [0.52, -0.2], [0.36, -0.22], [0.47, -0.3]]) disc(s * rx * dx, hc + ry * dy, 0.008, 0.008, 3, 1.02); }
  pc(ctx, K.skin); for (const s of [-1, 1]) ell(ctx, [s * rx * 0.97, hc - ry * 0.02, fz + rz * 0.05], [0.028, 0.045, 0.035], { s: 5, q: 3 });
}
function hair(ctx, K, D, L) {
  const st = K.hairStyle; if (!st || st === 'none') return;
  const [rx, ry, rz] = K.head, hc = D.hc, fz = K.hz; pc(ctx, K.hair);
  if (st === 'bald') { if (L <= 3) for (const s of [-1, 1]) ell(ctx, [s * rx * 0.86, hc + ry * 0.02, fz + rz * 0.38], [rx * 0.26, ry * 0.36, rz * 0.46], { s: 5, q: 3 }); return; }
  ell(ctx, [0, hc, fz], [rx * 1.07, ry * 1.06, rz * 1.07], { l0: -12, e: [36, 0, 0], s: L <= 1 ? 10 : N, q: L <= 2 ? 4 : 3 });
  if (L >= 4) return;
  if (st === 'bun') ell(ctx, [0, hc + ry * 0.72, fz + rz * 0.7], [0.075, 0.07, 0.07], { s: 6, q: 3 });
  if (st === 'long') tube(ctx, [[0, hc + ry * 0.1, fz + rz * 0.62, rx * 0.95, rz * 0.4], [0, D.sh - 0.02, fz + rz * 0.75, rx * 0.85, 0.07]], { n: 6, b: 1 });
  if (st === 'braids') for (const s of [-1, 1]) {
    tube(ctx, [[s * rx * 0.86, hc - ry * 0.15, fz + 0.02, 0.04], [s * rx * 0.95, hc - ry * 0.9, fz - 0.01, 0.035], [s * rx * 0.9, D.sh - 0.13, fz - 0.03, 0.022]], { n: 5, tip: [s * rx * 0.88, D.sh - 0.17, fz - 0.03] });
    pc(ctx, 'oklch(0.72 0.14 10)'); ell(ctx, [s * rx * 0.9, D.sh - 0.12, fz - 0.03], [0.03, 0.02, 0.03], { s: 5, q: 2 }); pc(ctx, K.hair);
  }
  if (st === 'wild') for (const [a, b, l] of [[0, 70, 0.12], [60, 40, 0.1], [120, 45, 0.11], [180, 35, 0.1], [240, 45, 0.11], [300, 40, 0.1], [90, 5, 0.09], [270, 5, 0.09]]) {
    const d = [Math.sin(a * RAD) * Math.cos(b * RAD), Math.sin(b * RAD), -Math.cos(a * RAD) * Math.cos(b * RAD)], base = [d[0] * rx * 0.9, hc + ry * 0.2 + d[1] * ry * 0.8, fz + 0.03 + d[2] * rz * 0.9];
    tube(ctx, [[...base, 0.045]], { n: 4, tip: add(base, mul(norm([d[0], d[1] + 0.3, d[2] + 0.4]), l)) });
  }
  if (st === 'messy') for (const [x, z, l] of [[-0.06, -0.08, 0.08], [0.05, -0.1, 0.07], [0.0, -0.02, 0.09], [0.08, 0.05, 0.06]]) {
    const base = [x, hc + ry * 0.85, fz + z]; tube(ctx, [[...base, 0.035]], { n: 4, tip: add(base, [x * 0.6, l, -0.05]) });
  }
}
function beard(ctx, K, D, L) {
  const [rx, ry, rz] = K.head, hc = D.hc, fz = K.hz, st = K.beard, zf = (y) => fz - rz * Math.sqrt(Math.max(0, 1 - ((y - hc) / ry) ** 2));
  pc(ctx, K.beardC || K.hair);
  if (st === 'full' || st === 'braid') ell(ctx, [0, hc - ry * 0.6, fz - rz * 0.38], [rx * 0.9, ry * (st === 'braid' ? 0.75 : 0.6), rz * 0.62], { s: N, q: L <= 2 ? 4 : 3, l1: 50 });
  if (st === 'braid' && L <= 3) tube(ctx, [[0, hc - ry * 1.15, fz - rz * 0.8, 0.05], [0, hc - ry * 1.6, fz - rz * 0.9, 0.035], [0, hc - ry * 2.0, fz - rz * 0.8, 0.02]], { n: 5, tip: [0, hc - ry * 2.2, fz - rz * 0.75] });
  if (st === 'goatee') tube(ctx, [[0, hc - ry * 0.62, zf(hc - ry * 0.62) - 0.005, 0.04, 0.025]], { n: 5, tip: [0, hc - ry * 1.05, zf(hc - ry * 0.8) - 0.02] });
  if (st === 'chops') for (const s of [-1, 1]) ell(ctx, [s * rx * 0.72, hc - ry * 0.35, fz - rz * 0.45], [rx * 0.28, ry * 0.4, rz * 0.35], { s: 6, q: 3 });
  if (L >= 4) return;
  const my = hc - ry * 0.3, mz = zf(my) - 0.012, big = st === 'walrus' ? 1.5 : st === 'thin' ? 0.55 : 1;
  if (st !== 'goatee') for (const s of [-1, 1]) ell(ctx, [s * rx * 0.2 * big, my - 0.01 * big, mz], [rx * 0.26 * big, 0.024 * big, 0.03], { s: 5, q: 2, e: [0, 0, s * (st === 'thin' ? -18 : 14)] });
}

// ---- the body ----------------------------------------------------------------------------------------------------
function body(ctx, K, D, L) {
  const sk = K.skin, mt = K.metal || 0;
  if (L >= 4) { // silhouette: a few dozen faces, the same bones
    for (const s of [-1, 1]) {
      const sd = s < 0 ? 'L' : 'R';
      ctx.bone('upperLeg' + sd); pc(ctx, K.pants, mt); tube(ctx, [[s * D.hx, D.hip, 0, K.legR * 1.1], [s * D.hx, 0.01, -0.03, K.legR]], { n: 3 });
      ctx.bone('upperArm' + sd); pc(ctx, K.sleeve || K.shirt, mt); tube(ctx, [[s * D.ax, D.sh - 0.04, 0, K.armR], [s * (D.ax + 0.03), D.wrist - 0.06, 0, K.armR * 0.8]], { n: 3 });
    }
    ctx.bone('spine'); pc(ctx, K.shirt, mt); vt(ctx, [[D.hip - 0.08, ...K.waist], [D.chest, ...K.belly], [D.sh + 0.02, K.sw * 0.7, K.chestR[1] * 0.7]], { n: 4, a: 1, b: 1 });
    ctx.bone('head'); pc(ctx, sk); ell(ctx, [0, D.hc, K.hz], K.head, { s: 5, q: 3 });
    return;
  }
  const n = N, ln = Math.min(n, 6);
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'L' : 'R', x = s * D.hx;
    ctx.bone('upperLeg' + sd); pc(ctx, K.pants, mt); tube(ctx, [[x, D.hip + 0.02, 0, K.legR * 1.2], [x, D.knee - 0.02, 0, K.legR]], { n: ln });
    ctx.bone('lowerLeg' + sd);
    const bt = K.boot ? Math.min(D.knee - 0.02, D.f + K.boot) : D.f + 0.02;
    if (bt < D.knee - 0.03) { pc(ctx, K.sock || K.pants, mt); tube(ctx, [[x, D.knee + 0.03, 0, K.legR * 0.98], [x, bt, 0, K.legR * 0.8]], { n: ln }); }
    if (K.boot) { pc(ctx, K.shoe, mt); tube(ctx, [[x, bt + 0.02, 0, K.legR * 1.08], [x, D.f + 0.01, 0, K.legR * 0.95]], { n: ln, a: 1 }); }
    ctx.bone('foot' + sd); pc(ctx, K.shoe, mt); ell(ctx, [x, 0.045, -0.04 * K.foot], [K.legR * 1.05, 0.05, 0.1 * K.foot], { s: ln, q: 3 });
  }
  ctx.bone('hips'); pc(ctx, K.hipC || K.pants, mt); ell(ctx, [0, D.hip, 0], [K.waist[0] * 1.02, 0.1, K.waist[1] * 1.02], { s: n, q: 4 });
  ctx.bone('spine'); pc(ctx, K.torsoC || K.shirt, mt);
  vt(ctx, [[D.hip - 0.02, ...K.waist], [D.hip + (D.chest - D.hip) * 0.55, K.belly[0], K.belly[1], 0, -K.bellyF], [D.chest + 0.03, K.chestR[0] * 0.97, K.chestR[1] * 0.97]], { n });
  ctx.bone('chest'); pc(ctx, K.shirt, mt);
  vt(ctx, [[D.chest, ...K.chestR], [D.sh - 0.06, K.sw * 0.92, K.chestR[1] * 0.92], [D.sh + 0.01, K.sw * 0.6, K.chestR[1] * 0.62]], { n, b: 1 });
  pc(ctx, K.sleeve || K.shirt, mt); for (const s of [-1, 1]) ell(ctx, [s * D.ax, D.sh - 0.05, 0], [K.armR * 1.3, K.armR * 1.3, K.armR * 1.3], { s: ln, q: 3 });
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'L' : 'R', x0 = s * D.ax, x1 = s * (D.ax + 0.02), x2 = s * (D.ax + 0.025);
    ctx.bone('upperArm' + sd); pc(ctx, K.sleeve || K.shirt, mt); tube(ctx, [[x0, D.sh - 0.04, 0, K.armR], [x1, D.elbow - 0.01, 0, K.armR * 0.9]], { n: ln });
    ctx.bone('lowerArm' + sd); pc(ctx, K.cuff || K.sleeve || K.shirt, mt); tube(ctx, [[x1, D.elbow + 0.03, 0, K.armR * 0.9], [x2, D.wrist, 0, K.armR * 0.75]], { n: ln });
    pc(ctx, K.glove || sk, K.glove && mt ? mt : 0); ell(ctx, [x2, D.wrist - 0.04, 0], [0.04 * K.hand, 0.05 * K.hand, 0.045 * K.hand], { s: ln, q: 3 });
  }
  ctx.bone('neck'); pc(ctx, sk); tube(ctx, [[0, D.sh - 0.03, 0, K.neckR], [0, D.nt + 0.04, 0, K.neckR * 0.95]], { n: ln });
  ctx.bone('head'); pc(ctx, sk); ell(ctx, [0, D.hc, K.hz], K.head, { s: L <= 1 ? 10 : 8, q: L <= 1 ? 7 : 5 });
  face(ctx, K, D, L);
  hair(ctx, K, D, L);
  if (K.beard) beard(ctx, K, D, L);
}
// clothes shapes shared by the parts below
const skirt = (ctx, K, D, hem, flare, o = {}) => vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.025, K.waist[1] + 0.025], [hem, K.waist[0] + flare, K.waist[1] + flare * 0.9]], o);
const torsoSheet = (ctx, K, D, arc, pad, col) => {
  pc(ctx, col);
  ctx.bone('spine'); vt(ctx, [[D.hip - 0.01, K.waist[0] + pad, K.waist[1] + pad], [D.hip + (D.chest - D.hip) * 0.55, K.belly[0] + pad, K.belly[1] + pad, 0, -K.bellyF], [D.chest + 0.03, K.chestR[0] * 0.97 + pad, K.chestR[1] * 0.97 + pad]], { arc, n: 6 });
  ctx.bone('chest'); vt(ctx, [[D.chest, K.chestR[0] + pad, K.chestR[1] + pad], [D.sh - 0.06, K.sw * 0.92 + pad, K.chestR[1] * 0.92 + pad]], { arc, n: 6 });
};
const top = (K, D) => D.hc + K.head[1];

// ---- the twenty ----------------------------------------------------------------------------------------------------
const CH = {
  smith: {
    leg: 0.66, torso: 0.6, sw: 0.27, hx: 0.12, armR: 0.078, legR: 0.085, head: [0.155, 0.15, 0.15], waist: [0.24, 0.19], belly: [0.29, 0.24], bellyF: 0.04, chestR: [0.28, 0.21], neckR: 0.078, hand: 1.25, foot: 1.1,
    skin: 'oklch(0.72 0.08 50)', cuff: 'oklch(0.72 0.08 50)', hair: 'oklch(0.42 0.11 40)', hairStyle: 'bald', shirt: 'oklch(0.66 0.04 75)', pants: 'oklch(0.36 0.04 50)', shoe: 'oklch(0.26 0.02 40)', boot: 0.22,
    beard: 'full', brow: 'oklch(0.36 0.1 40)', browT: 0.018, eye: 0.024, smile: 1.2,
    parts(ctx, K, D, L, H) {
      if (L >= 5) return;
      pc(ctx, C.leather);
      ctx.bone('hips'); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee - 0.06, K.waist[0] + 0.08, K.waist[1] + 0.1]], { arc: [-62, 62], n: 5 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.wood); tube(ctx, [[x, y + 0.06, 0, 0.018], [x, y - 0.34, 0, 0.016]], { n: 5 });
      pc(ctx, C.iron, 0.6); obox(ctx, [x, y - 0.37, -0.02], [0.045, 0.045, 0.1]);
      if (L >= 4) return;
      torsoSheet(ctx, K, D, [-50, 50], 0.014, C.leather);
      ctx.bone('chest'); for (const s of [-1, 1]) tube(ctx, [[s * K.sw * 0.5, D.sh - 0.07, -K.chestR[1] * 0.9, 0.014], [s * 0.1, D.sh + 0.02, -0.06, 0.014], [s * 0.1, D.sh + 0.02, 0.07, 0.014], [s * K.sw * 0.55, D.chest, K.chestR[1] * 1.02, 0.014]], { n: 3 });
      ctx.bone('hips'); pc(ctx, 'oklch(0.38 0.06 45)'); obox(ctx, [0.1, D.hip - 0.13, -(K.waist[1] + 0.075)], [0.06, 0.06, 0.012]);
      pc(ctx, C.iron, 0.5); obox(ctx, [0.12, D.hip - 0.05, -(K.waist[1] + 0.085)], [0.008, 0.05, 0.008]);
    },
  },
  herald: {
    leg: 1.0, torso: 0.62, sw: 0.19, hx: 0.075, armR: 0.045, legR: 0.052, head: [0.12, 0.16, 0.13], waist: [0.13, 0.1], belly: [0.14, 0.105], chestR: [0.17, 0.12], neckR: 0.045, foot: 1.35,
    skin: 'oklch(0.86 0.04 65)', hair: 'oklch(0.3 0.04 40)', shirt: 'oklch(0.46 0.14 262)', glove: 'oklch(0.95 0.01 90)', pants: 'oklch(0.55 0.17 27)', sock: 'oklch(0.94 0.02 90)', shoe: 'oklch(0.32 0.05 30)',
    beard: 'thin', eye: 0.022, smile: 0.8, browLift: 0.012,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head;
      ctx.bone('head'); pc(ctx, 'oklch(0.5 0.17 27)'); ell(ctx, [0.03, t - 0.02, 0.01], [rx * 1.5, 0.055, rz * 1.45], { e: [0, 0, -12], l0: -30, s: N, q: 3 });
      if (L >= 5) return;
      pc(ctx, C.white); tube(ctx, [[-0.06, t, -0.02, 0.03], [-0.1, t + 0.12, 0.02, 0.045], [-0.1, t + 0.22, 0.12, 0.035], [-0.06, t + 0.24, 0.24, 0.01]], { n: Math.min(N, 5) });
      ctx.bone('chest'); pc(ctx, 'oklch(0.52 0.17 27)'); vt(ctx, [[D.sh + 0.01, K.sw * 0.75, K.chestR[1] * 0.85], [D.chest - 0.14, K.sw * 1.15, K.chestR[1] * 1.7]], { arc: [95, 265], n: 6 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, 'oklch(0.92 0.04 85)'); tube(ctx, [[x - 0.12, y, -0.06, 0.026], [x + 0.1, y, -0.06, 0.026]], { n: 5, a: 1, b: 1 });
      ctx.quad(x - 0.1, y, -0.085, x + 0.08, y, -0.085, x + 0.08, y - 0.24, -0.095, x - 0.1, y - 0.24, -0.095);
      if (L >= 4) return;
      pc(ctx, 'oklch(0.55 0.2 27)'); ell(ctx, [x - 0.01, y - 0.2, -0.1], [0.02, 0.02, 0.008], { s: 5, q: 2 });
      pc(ctx, 'oklch(0.55 0.17 27)'); ctx.bone('head'); tube(ctx, [[-0.04, t, 0, 0.02], [-0.13, t + 0.08, 0.06, 0.028], [-0.16, t + 0.1, 0.18, 0.006]], { n: 4 });
      ctx.bone('chest'); pc(ctx, C.white); ell(ctx, [0, D.sh + 0.005, 0], [0.13, 0.035, 0.115], { s: N, q: 3 });
      pc(ctx, C.gold, 0.5); obox(ctx, [0, D.chest + 0.06, -K.chestR[1] - 0.005], [0.04, 0.05, 0.006], [0, 0, 45]);
      ctx.bone('spine'); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.012, K.waist[1] + 0.012], [D.hip + 0.07, K.waist[0] + 0.016, K.waist[1] + 0.016]], { n: 6 });
    },
  },
  baker: {
    leg: 0.64, torso: 0.55, sw: 0.22, hx: 0.1, armR: 0.066, legR: 0.07, head: [0.165, 0.155, 0.158], waist: [0.22, 0.18], belly: [0.26, 0.22], bellyF: 0.03, chestR: [0.25, 0.18], neckR: 0.065,
    skin: 'oklch(0.84 0.06 55)', cuff: 'oklch(0.84 0.06 55)', hair: 'oklch(0.5 0.12 45)', hairStyle: 'short', shirt: 'oklch(0.8 0.1 80)', sleeve: 'oklch(0.97 0.01 90)', pants: 'oklch(0.8 0.1 80)', sock: 'oklch(0.95 0.01 90)', shoe: 'oklch(0.38 0.06 40)',
    blush: true, smile: 1.4, eye: 0.028,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head;
      ctx.bone('head'); pc(ctx, C.white); vt(ctx, [[t - 0.07, rx * 1.0, rz * 1.0], [t + 0.12, rx * 1.03, rz * 1.03]], { n: N });
      ell(ctx, [0, t + 0.17, 0], [rx * 1.3, 0.1, rz * 1.3], { s: N, q: L <= 2 ? 4 : 2 });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, K.shirt); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.02, K.waist[1] + 0.02], [D.knee - 0.02, K.waist[0] + 0.11, K.waist[1] + 0.1], [D.knee - 0.14, K.waist[0] + 0.13, K.waist[1] + 0.12]], { n: N });
      pc(ctx, C.white); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.04, K.waist[1] + 0.04], [D.knee - 0.1, K.waist[0] + 0.15, K.waist[1] + 0.14]], { arc: [-55, 55], n: 5 });
      ctx.bone('lowerArmL'); const [x, y] = H.l, bx = x - 0.05, by = y - 0.2;
      pc(ctx, 'oklch(0.64 0.1 70)'); vt(ctx, [[by - 0.07, 0.1, 0.08, bx], [by + 0.06, 0.14, 0.11, bx]], { n: 6, a: 1 });
      tube(ctx, [[bx, by + 0.06, -0.1, 0.012], [x, y + 0.02, -0.03, 0.012], [x, y + 0.02, 0.03, 0.012], [bx, by + 0.06, 0.1, 0.012]], { n: 4 });
      pc(ctx, 'oklch(0.7 0.13 65)'); ell(ctx, [bx, by + 0.08, -0.03], [0.05, 0.04, 0.09], { e: [0, 30, 0], s: 6, q: 3 });
      if (L >= 4) return;
      ell(ctx, [bx + 0.03, by + 0.09, 0.05], [0.045, 0.035, 0.07], { e: [15, -25, 0], s: 6, q: 3 });
      pc(ctx, 'oklch(0.76 0.12 75)'); tube(ctx, [[bx - 0.04, by + 0.02, 0.02, 0.025], [bx - 0.07, by + 0.24, 0.05, 0.022]], { n: 5, a: 1, b: 1 });
      torsoSheet(ctx, K, D, [-45, 45], 0.012, C.white);
      ctx.bone('head'); pc(ctx, C.white); ell(ctx, [rx * 0.5, D.hc - K.head[1] * 0.3, -rz * 0.86], [0.025, 0.012, 0.01], { s: 4, q: 2 });
    },
  },
  witch: {
    leg: 0.7, torso: 0.5, sw: 0.17, hx: 0.08, armR: 0.045, legR: 0.05, head: [0.13, 0.145, 0.14], waist: [0.15, 0.12], belly: [0.16, 0.13], chestR: [0.17, 0.13], neckR: 0.045, hand: 0.95, nose: 0,
    skin: 'oklch(0.82 0.06 110)', hair: 'oklch(0.84 0.01 250)', hairStyle: 'long', shirt: 'oklch(0.36 0.08 300)', pants: 'oklch(0.3 0.06 300)', sock: 'oklch(0.45 0.1 150)', shoe: 'oklch(0.26 0.03 30)',
    eye: 0.022, brow: 'oklch(0.72 0.01 250)', browT: 0.014, smile: 1.2,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), fz = K.hz, [rx, ry, rz] = K.head;
      ctx.bone('head'); pc(ctx, 'oklch(0.28 0.06 300)');
      vt(ctx, [[t - 0.04, 0.32, 0.3], [t - 0.04, 0.12, 0.115]], { n: N, e: [0, 0, 8], p: [0, t, 0] });
      tube(ctx, [[0, t - 0.05, 0.01, 0.135], [0.02, t + 0.12, 0.04, 0.095], [0.07, t + 0.27, 0.1, 0.05], [0.12, t + 0.33, 0.16, 0.025]], { n: Math.min(N, 6), tip: [0.2, t + 0.33, 0.21] });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, K.shirt); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee, 0.21, 0.19], [0.04, 0.25, 0.23]], { n: N, rag: L <= 3 ? 0.12 : 0 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.dwood); tube(ctx, [[x, y + 0.5, 0, 0.016], [x, 0.2, -0.02, 0.018]], { n: 5 });
      pc(ctx, C.straw); vt(ctx, [[0.24, 0.03, 0.03, x, -0.02], [0.02, 0.11, 0.08, x, -0.02]], { n: 6, b: 0, a: 1 });
      ctx.bone('head'); pc(ctx, K.skin); tube(ctx, [[0, D.hc - 0.01, fz - rz * 0.9, 0.03], [0, D.hc - 0.05, fz - rz - 0.08, 0.01]], { n: 5, tip: [0, D.hc - 0.075, fz - rz - 0.1] });
      if (L >= 4) return;
      pc(ctx, 'oklch(0.6 0.1 130)'); ell(ctx, [0.015, D.hc - 0.035, fz - rz - 0.04], [0.009, 0.009, 0.009], { s: 4, q: 2 });
      ctx.bone('head'); pc(ctx, 'oklch(0.62 0.15 55)'); vt(ctx, [[t - 0.035, 0.137, 0.132], [t + 0.0, 0.125, 0.12]], { n: N, e: [0, 0, 8], p: [0, t, 0] });
      ctx.bone('chest'); pc(ctx, 'oklch(0.42 0.07 150)'); vt(ctx, [[D.sh + 0.02, K.neckR + 0.04, K.neckR + 0.035], [D.sh - 0.05, K.sw + 0.03, K.chestR[1] + 0.04], [D.chest - 0.03, K.sw + 0.05, K.chestR[1] + 0.06]], { n: N, rag: 0.1 });
      pc(ctx, C.straw); ctx.bone('lowerArmR'); vt(ctx, [[0.25, 0.034, 0.034, x, -0.02], [0.27, 0.034, 0.034, x, -0.02]], { n: 5 });
    },
  },
  apprentice: {
    leg: 0.58, torso: 0.44, sw: 0.16, hx: 0.075, armR: 0.05, legR: 0.055, head: [0.16, 0.155, 0.155], waist: [0.15, 0.12], belly: [0.16, 0.13], chestR: [0.18, 0.13], neckR: 0.05, arm: 0.5,
    skin: 'oklch(0.87 0.05 60)', hair: 'oklch(0.56 0.1 60)', hairStyle: 'messy', shirt: 'oklch(0.42 0.15 272)', pants: 'oklch(0.42 0.15 272)', shoe: 'oklch(0.4 0.06 50)',
    freckles: true, eye: 0.031, smile: 1.4, browLift: 0.014,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), blue = 'oklch(0.4 0.15 272)';
      ctx.bone('head'); pc(ctx, blue); vt(ctx, [[t - 0.05, 0.3, 0.3], [t - 0.05, 0.155, 0.155]], { n: N });
      tube(ctx, [[0, t - 0.06, 0.01, 0.165], [0, t + 0.14, 0.05, 0.11], [0, t + 0.3, 0.12, 0.06], [0, t + 0.34, 0.25, 0.03]], { n: Math.min(N, 6), tip: [0, t + 0.26, 0.34] });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, blue); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee, 0.24, 0.21], [0.01, 0.34, 0.3]], { n: N });
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'lowerArmL' : 'lowerArmR'); tube(ctx, [[s * (D.ax + 0.02), D.elbow + 0.02, 0, 0.06], [s * (D.ax + 0.03), D.wrist - 0.05, 0, 0.115]], { n: Math.min(N, 6) }); }
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.wood); tube(ctx, [[x, 0.02, -0.03, 0.018], [x, y + 0.7, -0.03, 0.016]], { n: 5 });
      glow(ctx, 'oklch(0.85 0.1 230)', 0.7, 1.5, 2.6); ell(ctx, [x, y + 0.78, -0.03], [0.065, 0.065, 0.065], { s: 6, q: 4 });
      if (L >= 4) return;
      pc(ctx, C.dwood); for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU; tube(ctx, [[x + Math.cos(a) * 0.02, y + 0.7, -0.03 + Math.sin(a) * 0.02, 0.01], [x + Math.cos(a) * 0.07, y + 0.8, -0.03 + Math.sin(a) * 0.07, 0.006]], { n: 3 }); }
      glow(ctx, C.gold, 1.6, 1.3, 0.4);
      ctx.bone('hips'); for (let i = 0; i < 9; i++) { const a = (i * 137.5 + 20) * RAD, f = 0.15 + ((i * 0.37) % 0.8), yy = D.knee - f * (D.knee - 0.05), r = 0.24 + f * 0.1, rz = 0.21 + f * 0.09; star(ctx, [Math.sin(a) * r * 1.01, yy, -Math.cos(a) * rz * 1.01], norm([Math.sin(a), 0.2, -Math.cos(a)]), 0.035); }
      ctx.bone('head'); for (const [a, h] of [[-30, 0.06], [50, 0.16], [160, 0.1]]) { const r = 0.16 - h * 0.35; star(ctx, [Math.sin(a * RAD) * r, t - 0.02 + h, -Math.cos(a * RAD) * r + h * 0.25], norm([Math.sin(a * RAD), 0.3, -Math.cos(a * RAD)]), 0.03); }
    },
  },
  knight: {
    leg: 0.82, torso: 0.6, sw: 0.25, hx: 0.1, armR: 0.07, legR: 0.076, head: [0.145, 0.15, 0.145], waist: [0.2, 0.16], belly: [0.22, 0.17], chestR: [0.26, 0.19], neckR: 0.07, hand: 1.15, foot: 1.1, metal: 0.6,
    skin: 'oklch(0.8 0.06 55)', hairStyle: 'none', shirt: C.steel, glove: 'oklch(0.62 0.02 250)', pants: C.steel, shoe: 'oklch(0.62 0.02 250)', boot: 0.3, beard: 'mustache', hair: 'oklch(0.45 0.07 55)', eye: 0.024, smile: 1,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), fz = K.hz, [rx, ry, rz] = K.head, blue = 'oklch(0.48 0.15 258)';
      ctx.bone('head'); pc(ctx, C.steel, 0.7); ell(ctx, [0, D.hc + 0.015, fz], [rx * 1.14, ry * 1.1, rz * 1.14], { l0: -8, s: N, q: L <= 2 ? 4 : 3 });
      if (L >= 5) return;
      pc(ctx, blue); tube(ctx, [[0, t - 0.01, fz - 0.1, 0.02], [0, t + 0.08, fz - 0.01, 0.045], [0, t + 0.06, fz + 0.12, 0.04], [0, t - 0.06, fz + 0.22, 0.015]], { n: 5 });
      ctx.bone('hips'); pc(ctx, blue); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee + 0.02, K.waist[0] + 0.06, K.waist[1] + 0.06]], { arc: [-42, 42], n: 3 });
      vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee + 0.02, K.waist[0] + 0.06, K.waist[1] + 0.06]], { arc: [138, 222], n: 3 });
      ctx.bone('lowerArmL'); const [x] = H.l, yc = (D.elbow + D.wrist) / 2, sx = x - 0.075;
      plate(ctx, [[sx, yc + 0.2, -0.2], [sx, yc + 0.2, 0.2], [sx, yc, 0.2], [sx, yc - 0.36, 0], [sx, yc, -0.2]], [0.03, 0, 0]);
      torsoSheet(ctx, K, D, [-52, 52], 0.01, blue);
      if (L >= 4) return;
      ctx.bone('lowerArmL'); pc(ctx, C.gold, 0.6); ell(ctx, [sx - 0.01, yc - 0.02, 0], [0.03, 0.05, 0.05], { s: 6, q: 3 });
      ctx.bone('chest'); plate(ctx, [[0, D.chest + 0.14, -K.chestR[1] - 0.02], [0.06, D.chest + 0.05, -K.chestR[1] - 0.02], [0, D.chest - 0.06, -K.chestR[1] - 0.02], [-0.06, D.chest + 0.05, -K.chestR[1] - 0.02]], [0, 0, 0.008]);
      ctx.bone('head'); pc(ctx, C.gold, 0.6); vt(ctx, [[D.hc + 0.02, rx * 1.15, rz * 1.15], [D.hc + 0.05, rx * 1.15, rz * 1.15]], { n: N });
      pc(ctx, C.steel, 0.7); obox(ctx, [0, D.hc + 0.035, fz - rz * 1.13], [0.012, 0.055, 0.012]);
      for (const s of [-1, 1]) obox(ctx, [s * rx * 1.03, D.hc - 0.05, fz - rz * 0.3], [0.014, 0.07, 0.07]);
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'upperArmL' : 'upperArmR'); ell(ctx, [s * (D.ax + 0.01), D.sh - 0.04, 0], [0.11, 0.1, 0.12], { l0: -10, s: 6, q: 3 }); }
      ctx.bone('hips'); pc(ctx, C.leather); tube(ctx, [[-0.2, D.hip - 0.05, -0.08, 0.025], [-0.25, D.hip - 0.72, 0.14, 0.02]], { n: 4, b: 1 });
      pc(ctx, C.gold, 0.6); obox(ctx, [-0.195, D.hip - 0.03, -0.09], [0.012, 0.012, 0.07], [18, 0, 0]); obox(ctx, [-0.19, D.hip + 0.04, -0.11], [0.012, 0.05, 0.012], [18, 0, 0]);
    },
  },
  merchant: {
    leg: 0.6, torso: 0.58, sw: 0.24, hx: 0.11, armR: 0.07, legR: 0.08, head: [0.16, 0.14, 0.155], waist: [0.26, 0.22], belly: [0.33, 0.29], bellyF: 0.06, chestR: [0.28, 0.22], neckR: 0.075,
    skin: 'oklch(0.83 0.06 45)', glove: 'oklch(0.83 0.06 45)', hair: 'oklch(0.46 0.07 60)', shirt: 'oklch(0.42 0.14 15)', pants: 'oklch(0.32 0.03 60)', shoe: 'oklch(0.26 0.03 40)',
    beard: 'chops', blush: true, smile: 1.5, eye: 0.024, mouthW: 1.2,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head, vel = K.shirt;
      ctx.bone('head'); pc(ctx, vel); vt(ctx, [[t - 0.07, rx * 0.95, rz * 0.95], [t + 0.05, rx * 0.93, rz * 0.93]], { n: N, b: 1 });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, vel); skirt(ctx, K, D, D.knee - 0.05, 0.1, { arc: [16, 344], n: N });
      ctx.bone('chest'); pc(ctx, 'oklch(0.9 0.04 80)'); ell(ctx, [0, D.sh, 0], [0.2, 0.055, 0.17], { s: N, q: 3 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, 'oklch(0.6 0.12 75)'); ell(ctx, [x, y - 0.1, -0.01], [0.07, 0.08, 0.07], { s: 6, q: 4 });
      tube(ctx, [[x, y - 0.03, -0.01, 0.025]], { n: 5, tip: [x, y + 0.02, -0.01] });
      if (L >= 4) return;
      ctx.bone('head'); pc(ctx, C.gold, 0.5); vt(ctx, [[t - 0.06, rx * 0.97, rz * 0.97], [t - 0.035, rx * 0.97, rz * 0.97]], { n: N });
      pc(ctx, 'oklch(0.55 0.15 150)'); tube(ctx, [[rx * 0.7, t, -0.04, 0.015], [rx * 1.0, t + 0.12, 0.05, 0.02], [rx * 0.9, t + 0.16, 0.14, 0.004]], { n: 4 });
      ctx.bone('spine'); pc(ctx, C.gold, 0.6); const yb = D.hip + (D.chest - D.hip) * 0.55;
      for (const dy of [-0.08, 0, 0.08]) ell(ctx, [0, yb + dy, -(K.belly[1] + K.bellyF) + Math.abs(dy) * 0.3], [0.018, 0.018, 0.012], { s: 5, q: 2 });
      ctx.bone('chest'); tube(ctx, [[-0.14, D.sh - 0.05, -K.chestR[1] * 0.85, 0.008], [-0.05, D.chest + 0.02, -K.chestR[1] - 0.01, 0.008], [0.06, D.chest + 0.01, -K.chestR[1] - 0.01, 0.008], [0.15, D.sh - 0.05, -K.chestR[1] * 0.85, 0.008]], { n: 3 });
      ctx.bone('lowerArmR'); for (const [dx, dz] of [[0.02, -0.07], [-0.02, -0.06]]) ell(ctx, [x + dx, y - 0.02, dz], [0.018, 0.005, 0.018], { s: 6, q: 2 });
    },
  },
  beekeeper: {
    leg: 0.78, torso: 0.55, sw: 0.21, hx: 0.09, armR: 0.066, legR: 0.07, head: [0.15, 0.15, 0.15], waist: [0.19, 0.15], belly: [0.2, 0.15], chestR: [0.21, 0.15],
    skin: 'oklch(0.76 0.07 55)', hair: 'oklch(0.3 0.05 40)', shirt: 'oklch(0.94 0.03 95)', glove: 'oklch(0.8 0.12 85)', pants: 'oklch(0.94 0.03 95)', shoe: 'oklch(0.36 0.05 50)', boot: 0.25, eye: 0.026, smile: 1.3,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head;
      ctx.bone('head'); pc(ctx, C.white); vt(ctx, [[t - 0.05, 0.3, 0.3], [t - 0.05, rx * 1.05, rz * 1.05], [t + 0.08, rx * 0.95, rz * 0.95]], { n: N, b: 1 });
      if (L >= 5) return;
      pc(ctx, 'oklch(0.3 0.02 90)', 0, 0.38); vt(ctx, [[t - 0.052, 0.29, 0.29], [D.nt + 0.01, 0.2, 0.19]], { n: N });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, 'oklch(0.66 0.12 55)', 0.6); vt(ctx, [[y - 0.26, 0.055, 0.055, x, -0.02], [y - 0.07, 0.055, 0.055, x, -0.02]], { n: 6, a: 1 });
      vt(ctx, [[y - 0.07, 0.057, 0.057, x, -0.02]], { n: 6, tip: [x, y - 0.0, -0.05] });
      pc(ctx, C.leather); obox(ctx, [x + 0.075, y - 0.16, -0.02], [0.012, 0.07, 0.05]);
      if (L >= 4) return;
      pc(ctx, 'oklch(0.66 0.12 55)', 0.6); tube(ctx, [[x, y - 0.01, -0.05, 0.015], [x, y + 0.03, -0.1, 0.01]], { n: 4 });
      ctx.bone('spine'); pc(ctx, C.leather); vt(ctx, [[D.hip + 0.0, K.waist[0] + 0.01, K.waist[1] + 0.01], [D.hip + 0.05, K.waist[0] + 0.012, K.waist[1] + 0.012]], { n: 6 });
      ctx.bone('head'); pc(ctx, 'oklch(0.82 0.16 85)'); ell(ctx, [0.12, t + 0.02, -0.1], [0.012, 0.01, 0.016], { s: 4, q: 2 });
      pc(ctx, C.ink); obox(ctx, [0.12, t + 0.02, -0.1], [0.013, 0.004, 0.004]);
    },
  },
  flowergirl: {
    leg: 0.6, torso: 0.42, sw: 0.16, hx: 0.07, armR: 0.045, legR: 0.05, head: [0.15, 0.15, 0.145], waist: [0.13, 0.1], belly: [0.14, 0.11], chestR: [0.16, 0.12], neckR: 0.045, arm: 0.46,
    skin: 'oklch(0.86 0.05 60)', cuff: 'oklch(0.86 0.05 60)', pants: 'oklch(0.86 0.05 60)', hair: 'oklch(0.56 0.13 45)', hairStyle: 'braids', shirt: 'oklch(0.95 0.02 90)', sock: 'oklch(0.95 0.01 90)', shoe: 'oklch(0.52 0.13 30)',
    eye: 0.03, smile: 1.4, blush: true, freckles: true,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, cy = D.hc + ry * 0.55, BL = ['oklch(0.8 0.14 10)', 'oklch(0.92 0.13 95)', 'oklch(0.7 0.12 280)', 'oklch(0.96 0.02 90)'];
      ctx.bone('head'); const ring = []; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; ring.push([Math.sin(a) * rx * 0.9, cy, -Math.cos(a) * rz * 0.9 + 0.01, 0.022]); }
      if (L >= 5) return;
      pc(ctx, C.leaf); tube(ctx, ring, { n: 3, loop: true });
      for (let k = 0; k < 8; k++) { pc(ctx, BL[k % 4]); ell(ctx, [ring[k][0] * 1.08, cy + 0.02, ring[k][2] * 1.08], [0.032, 0.026, 0.032], { s: 5, q: 2 }); }
      ctx.bone('hips'); pc(ctx, 'oklch(0.72 0.13 5)'); skirt(ctx, K, D, D.knee - 0.08, 0.13, { n: N });
      ctx.bone('lowerArmL'); const [x, y] = H.l, bx = x - 0.04, by = y - 0.17; pc(ctx, 'oklch(0.56 0.08 60)'); vt(ctx, [[by - 0.1, 0.085, 0.085, bx], [by + 0.07, 0.105, 0.105, bx]], { n: 6, a: 1 });
      if (L >= 4) return;
      pc(ctx, C.iron, 0.4); tube(ctx, [[bx - 0.1, by + 0.06, 0, 0.007], [x, y + 0.02, 0, 0.007], [bx + 0.1, by + 0.06, 0, 0.007]], { n: 3 });
      for (let k = 0; k < 5; k++) { const a = k * 1.3, px = bx + Math.cos(a) * 0.05, pz = Math.sin(a) * 0.05, hy = by + 0.18 + (k % 3) * 0.04; pc(ctx, C.leaf); tube(ctx, [[px, by + 0.04, pz, 0.006], [px * 1.0 + Math.cos(a) * 0.03, hy, pz + Math.sin(a) * 0.03, 0.006]], { n: 3 }); pc(ctx, BL[k % 4]); ell(ctx, [px + Math.cos(a) * 0.03, hy + 0.02, pz + Math.sin(a) * 0.03], [0.035, 0.028, 0.035], { s: 5, q: 2 }); }
      ctx.bone('hips'); pc(ctx, 'oklch(0.62 0.1 145)'); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.04, K.waist[1] + 0.04], [D.knee - 0.02, K.waist[0] + 0.14, K.waist[1] + 0.13]], { arc: [-50, 50], n: 4 });
      torsoSheet(ctx, K, D, [0, 360], 0.008, 'oklch(0.68 0.13 5)');
    },
  },
  fisher: {
    leg: 0.74, torso: 0.56, sw: 0.22, hx: 0.095, armR: 0.066, legR: 0.075, head: [0.15, 0.15, 0.15], waist: [0.2, 0.16], belly: [0.22, 0.17], chestR: [0.23, 0.16],
    skin: 'oklch(0.72 0.08 50)', hairStyle: 'none', shirt: 'oklch(0.84 0.15 92)', pants: 'oklch(0.4 0.04 240)', shoe: 'oklch(0.44 0.08 150)', boot: 0.42,
    beard: 'full', beardC: 'oklch(0.86 0.01 250)', brow: 'oklch(0.82 0.01 250)', browT: 0.016, eye: 0.022, smile: 1.1,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz, yel = K.shirt;
      ctx.bone('head'); pc(ctx, yel); ell(ctx, [0, D.hc + 0.02, fz + 0.01], [rx * 1.1, ry * 1.05, rz * 1.12], { l0: 5, s: N, q: 3 });
      if (L >= 5) return;
      vt(ctx, [[D.hc + 0.03, rx * 1.1, rz * 1.12, 0, fz + 0.01], [D.hc - 0.03, rx * 1.55, rz * 1.9, 0, fz + 0.07]], { n: N });
      ctx.bone('hips'); skirt(ctx, K, D, D.knee + 0.08, 0.09, { n: N });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.dwood); tube(ctx, [[x, y - 0.12, 0.12, 0.018], [x, y, 0, 0.016], [x + 0.05, y + 0.8, -0.6, 0.01], [x + 0.08, y + 1.35, -1.1, 0.005]], { n: 4 });
      if (L >= 4) return;
      pc(ctx, 'oklch(0.9 0.01 250)'); tube(ctx, [[x + 0.08, y + 1.35, -1.1, 0.003], [x + 0.08, -0.6, -1.15, 0.003]], { n: 3 });
      pc(ctx, C.iron, 0.6); ell(ctx, [x + 0.04, y - 0.03, 0.05], [0.02, 0.035, 0.035], { s: 6, q: 3 });
      ctx.bone('head'); pc(ctx, C.dwood); tube(ctx, [[0.04, D.hc - ry * 0.45, fz - rz * 0.88, 0.009], [0.1, D.hc - ry * 0.55, fz - rz - 0.06, 0.009]], { n: 4 }); ell(ctx, [0.11, D.hc - ry * 0.5, fz - rz - 0.07], [0.018, 0.02, 0.018], { s: 5, q: 2 });
      ctx.bone('chest'); pc(ctx, 'oklch(0.6 0.12 85)'); for (const dy of [0.05, -0.05]) ell(ctx, [0, D.chest + dy, -K.chestR[1] - 0.004], [0.014, 0.014, 0.008], { s: 4, q: 2 });
    },
  },
  bard: {
    leg: 0.84, torso: 0.54, sw: 0.19, hx: 0.08, armR: 0.05, legR: 0.058, head: [0.14, 0.155, 0.145], waist: [0.15, 0.12], belly: [0.155, 0.12], chestR: [0.19, 0.13],
    skin: 'oklch(0.78 0.07 60)', hair: 'oklch(0.36 0.07 45)', hairStyle: 'long', shirt: 'oklch(0.56 0.13 150)', sleeve: 'oklch(0.6 0.16 30)', cuff: 'oklch(0.56 0.13 150)', pants: 'oklch(0.46 0.08 60)', shoe: 'oklch(0.38 0.06 50)', boot: 0.35,
    beard: 'goatee', smile: 1.5, eye: 0.025, browLift: 0.012,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head, wood = 'oklch(0.68 0.11 65)', z0 = -(K.chestR[1] + 0.07);
      ctx.bone('head'); pc(ctx, 'oklch(0.42 0.1 150)'); ell(ctx, [0.02, t - 0.035, 0.01], [rx * 1.12, 0.075, rz * 1.18], { l0: 0, e: [0, 0, 8], s: N, q: 3 });
      if (L >= 5) return;
      pc(ctx, 'oklch(0.58 0.2 28)'); tube(ctx, [[0.08, t - 0.01, 0.0, 0.015], [0.12, t + 0.11, 0.08, 0.025], [0.1, t + 0.2, 0.22, 0.012], [0.06, t + 0.2, 0.32, 0.003]], { n: 4 });
      ctx.bone('chest'); pc(ctx, wood); ell(ctx, [0.05, D.chest - 0.1, z0], [0.14, 0.17, 0.055], { e: [0, 0, 35], s: N, q: 4 });
      pc(ctx, 'oklch(0.45 0.07 55)'); tube(ctx, [[-0.03, D.chest + 0.0, z0 - 0.01, 0.024], [-0.2, D.sh + 0.02, z0 - 0.01, 0.02]], { n: 4 });
      if (L >= 4) return;
      obox(ctx, [-0.23, D.sh + 0.06, z0], [0.025, 0.05, 0.015], [0, 0, 35]);
      pc(ctx, C.ink); ell(ctx, [0.03, D.chest - 0.07, z0 - 0.052], [0.035, 0.035, 0.006], { s: 6, q: 2 });
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'upperArmL' : 'upperArmR'); pc(ctx, 'oklch(0.82 0.13 85)'); ell(ctx, [s * (D.ax + 0.01), D.sh - 0.1, 0], [0.075, 0.09, 0.075], { s: 6, q: 3 }); }
      ctx.bone('spine'); pc(ctx, C.leather); vt(ctx, [[D.hip + 0.01, K.waist[0] + 0.012, K.waist[1] + 0.012], [D.hip + 0.05, K.waist[0] + 0.014, K.waist[1] + 0.014]], { n: 6 });
      ctx.bone('hips'); obox(ctx, [0.12, D.hip - 0.06, -0.1], [0.04, 0.05, 0.025]);
    },
  },
  gardener: {
    leg: 0.72, torso: 0.52, sw: 0.2, hx: 0.085, armR: 0.052, legR: 0.06, head: [0.15, 0.14, 0.15], waist: [0.17, 0.14], belly: [0.19, 0.15], bellyF: 0.02, chestR: [0.2, 0.14],
    skin: 'oklch(0.78 0.07 55)', cuff: 'oklch(0.78 0.07 55)', hair: 'oklch(0.95 0.01 90)', hairStyle: 'bald', shirt: 'oklch(0.9 0.03 90)', pants: 'oklch(0.52 0.07 70)', shoe: 'oklch(0.38 0.05 50)', boot: 0.15,
    beard: 'walrus', beardC: 'oklch(0.96 0.01 90)', brow: 'oklch(0.95 0.01 90)', browT: 0.02, eye: 0.02, smile: 1.2, mouthHid: true,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head;
      ctx.bone('head'); pc(ctx, C.straw); vt(ctx, [[t - 0.06, 0.36, 0.36], [t - 0.06, rx * 1.03, rz * 1.03], [t + 0.06, rx * 0.9, rz * 0.9]], { n: N, b: 1 });
      if (L >= 5) return;
      torsoSheet(ctx, K, D, [18, 342], 0.012, 'oklch(0.5 0.08 145)');
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, 'oklch(0.6 0.08 190)', 0.4); vt(ctx, [[y - 0.3, 0.085, 0.085, x, 0], [y - 0.12, 0.085, 0.085, x, 0]], { n: 6, a: 1, b: 1 });
      tube(ctx, [[x, y - 0.26, -0.07, 0.016], [x, y - 0.1, -0.28, 0.012]], { n: 4 });
      if (L >= 4) return;
      ell(ctx, [x, y - 0.09, -0.29], [0.03, 0.03, 0.02], { s: 5, q: 2, e: [45, 0, 0] });
      tube(ctx, [[x, y - 0.12, 0.06, 0.012], [x, y - 0.0, 0.03, 0.012], [x, y - 0.0, -0.03, 0.012], [x, y - 0.12, -0.05, 0.012]], { n: 3 });
      ctx.bone('head'); pc(ctx, 'oklch(0.5 0.1 145)'); vt(ctx, [[t - 0.05, rx * 1.035, rz * 1.035], [t - 0.02, rx * 1.0, rz * 1.0]], { n: N });
      pc(ctx, 'oklch(0.66 0.2 28)'); ell(ctx, [rx * 0.85, t - 0.02, -rz * 0.5], [0.03, 0.03, 0.03], { s: 5, q: 2 });
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'lowerLegL' : 'lowerLegR'); pc(ctx, 'oklch(0.6 0.06 70)'); tube(ctx, [[s * D.hx, D.f + 0.2, 0, K.legR * 1.1], [s * D.hx, D.f + 0.15, 0, K.legR * 1.1]], { n: 5 }); }
    },
  },
  ranger: {
    leg: 0.88, torso: 0.56, sw: 0.21, hx: 0.085, armR: 0.055, legR: 0.062, head: [0.14, 0.15, 0.145], waist: [0.16, 0.13], belly: [0.17, 0.13], chestR: [0.21, 0.14],
    skin: 'oklch(0.75 0.07 55)', hair: 'oklch(0.42 0.08 55)', shirt: 'oklch(0.52 0.07 60)', sleeve: 'oklch(0.44 0.06 140)', cuff: 'oklch(0.42 0.06 55)', glove: 'oklch(0.42 0.06 55)', pants: 'oklch(0.37 0.05 140)', shoe: 'oklch(0.4 0.06 50)', boot: 0.38,
    eye: 0.024, smile: 0.9, beard: 'thin',
    parts(ctx, K, D, L, H) {
      const t = top(K, D), fz = K.hz, [rx, ry, rz] = K.head, cloak = 'oklch(0.42 0.08 145)';
      ctx.bone('head'); pc(ctx, cloak);
      vt(ctx, [[D.hc - ry * 0.95, rx * 1.1, rz * 1.12, 0, fz + 0.02], [D.hc, rx * 1.24, rz * 1.22, 0, fz + 0.02], [D.hc + ry * 0.72, rx * 1.1, rz * 1.12, 0, fz + 0.03], [t + 0.03, rx * 0.5, rz * 0.55, 0, fz + 0.05]], { arc: [48, 312], n: N, tip: [0, t + 0.02, fz + 0.26] });
      if (L >= 5) return;
      ctx.bone('chest'); vt(ctx, [[D.sh + 0.02, K.sw * 0.72, K.chestR[1] * 0.95], [D.chest, K.sw * 1.1, K.chestR[1] * 1.5], [D.knee - 0.08, K.sw * 1.35, K.chestR[1] * 2.3]], { arc: [68, 292], n: N });
      ctx.bone('lowerArmL'); const [x, y] = H.l; pc(ctx, C.dwood);
      tube(ctx, [[x, y + 0.62, 0.06, 0.012], [x, y + 0.35, -0.07, 0.018], [x, y, -0.1, 0.022], [x, y - 0.35, -0.07, 0.018], [x, y - 0.62, 0.06, 0.012]], { n: 4 });
      if (L >= 4) return;
      pc(ctx, C.cream); tube(ctx, [[x, y + 0.62, 0.06, 0.003], [x, y - 0.62, 0.06, 0.003]], { n: 3 });
      ctx.bone('chest'); pc(ctx, C.leather); const qz = K.chestR[1] + 0.07;
      tube(ctx, [[0.13, D.chest - 0.14, qz, 0.05], [-0.09, D.sh + 0.1, qz + 0.03, 0.055]], { n: 6, a: 1 });
      for (let k = 0; k < 3; k++) { const ox = -0.1 + (k - 1) * 0.025, oy = D.sh + 0.14 + (k % 2) * 0.03; pc(ctx, C.wood); tube(ctx, [[ox + 0.02, oy - 0.08, qz + 0.03, 0.005], [ox, oy, qz + 0.035, 0.005]], { n: 3 }); pc(ctx, k === 1 ? 'oklch(0.6 0.18 28)' : C.white); tube(ctx, [[ox, oy, qz + 0.035, 0.018]], { n: 3, tip: [ox - 0.01, oy + 0.06, qz + 0.035] }); }
      ctx.bone('spine'); pc(ctx, C.leather); vt(ctx, [[D.hip + 0.01, K.waist[0] + 0.012, K.waist[1] + 0.012], [D.hip + 0.05, K.waist[0] + 0.014, K.waist[1] + 0.014]], { n: 6 });
      ctx.bone('chest'); pc(ctx, C.gold, 0.5); ell(ctx, [-0.1, D.sh - 0.02, -K.chestR[1] * 0.8], [0.022, 0.022, 0.01], { s: 5, q: 2 });
    },
  },
  cleric: {
    leg: 0.76, torso: 0.56, sw: 0.2, hx: 0.085, armR: 0.06, legR: 0.065, head: [0.155, 0.15, 0.15], waist: [0.19, 0.15], belly: [0.21, 0.16], bellyF: 0.02, chestR: [0.21, 0.15],
    skin: 'oklch(0.83 0.05 60)', hair: 'oklch(0.72 0.02 70)', shirt: 'oklch(0.97 0.01 90)', pants: 'oklch(0.97 0.01 90)', shoe: 'oklch(0.76 0.1 80)', eye: 0.024, smile: 1.3, blush: true,
    parts(ctx, K, D, L, H) {
      const t = top(K, D), [rx, , rz] = K.head, W = C.white;
      ctx.bone('head'); pc(ctx, W); vt(ctx, [[t - 0.06, rx * 0.95, rz * 0.9], [t + 0.12, rx * 0.86, rz * 0.5], [t + 0.26, rx * 0.36, rz * 0.2]], { n: N, tip: [0, t + 0.33, 0] });
      if (L >= 5) return;
      ctx.bone('hips'); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.knee, 0.25, 0.21], [0.02, 0.31, 0.27]], { n: N });
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'lowerArmL' : 'lowerArmR'); pc(ctx, W); tube(ctx, [[s * (D.ax + 0.02), D.elbow + 0.02, 0, 0.07], [s * (D.ax + 0.03), D.wrist - 0.02, 0, 0.1]], { n: Math.min(N, 6) }); }
      ctx.bone('lowerArmL'); const [x, y] = H.l; pc(ctx, 'oklch(0.45 0.15 25)'); obox(ctx, [x + 0.01, y + 0.02, -0.08], [0.03, 0.1, 0.075]);
      pc(ctx, C.gold, 0.5); ctx.bone('head'); obox(ctx, [0, t + 0.1, -rz * 0.72], [0.012, 0.07, 0.006], [-12, 0, 0]); obox(ctx, [0, t + 0.12, -rz * 0.7], [0.045, 0.012, 0.006], [-12, 0, 0]);
      if (L >= 4) return;
      vt(ctx, [[t - 0.06, rx * 0.96, rz * 0.91], [t - 0.025, rx * 0.95, rz * 0.88]], { n: N });
      ctx.bone('hips'); vt(ctx, [[0.02, 0.312, 0.272], [0.08, 0.3, 0.262]], { n: N });
      for (const a of [[-24, -12], [12, 24]]) {
        ctx.bone('hips'); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.035, K.waist[1] + 0.035], [D.knee, 0.255, 0.215], [D.knee - 0.2, 0.27, 0.23]], { arc: a, n: 1 });
        torsoSheet(ctx, K, D, a, 0.01, C.gold);
      }
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'lowerArmL' : 'lowerArmR'); pc(ctx, C.gold, 0.5); tube(ctx, [[s * (D.ax + 0.03), D.wrist - 0.015, 0, 0.102], [s * (D.ax + 0.03), D.wrist - 0.04, 0, 0.102]], { n: 6 }); }
      ctx.bone('lowerArmL'); pc(ctx, C.cream); obox(ctx, [x + 0.01, y + 0.02, -0.08], [0.033, 0.092, 0.07]);
      ctx.bone('chest'); pc(ctx, C.gold, 0.6); ell(ctx, [0, D.chest + 0.02, -K.chestR[1] - 0.02], [0.035, 0.035, 0.01], { s: 8, q: 2 });
    },
  },
  kid: {
    leg: 0.48, torso: 0.36, sw: 0.145, hx: 0.065, armR: 0.042, legR: 0.048, head: [0.155, 0.15, 0.15], waist: [0.13, 0.1], belly: [0.14, 0.11], chestR: [0.155, 0.11], neckR: 0.042, arm: 0.4, hand: 0.85, foot: 0.85,
    skin: 'oklch(0.82 0.06 55)', cuff: 'oklch(0.82 0.06 55)', hair: 'oklch(0.6 0.14 45)', hairStyle: 'messy', shirt: 'oklch(0.62 0.17 28)', torsoC: 'oklch(0.52 0.09 250)', hipC: 'oklch(0.52 0.09 250)', pants: 'oklch(0.52 0.09 250)', shoe: 'oklch(0.45 0.03 60)',
    freckles: true, eye: 0.031, smile: 1.7, mouthW: 1.2,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz, cap = 'oklch(0.46 0.08 60)';
      ctx.bone('head'); pc(ctx, cap); ell(ctx, [0, D.hc + 0.03, fz], [rx * 1.08, ry * 0.92, rz * 1.08], { l0: 5, s: N, q: 3 });
      if (L >= 5) return;
      obox(ctx, [0, D.hc + 0.05, fz + rz + 0.05], [0.08, 0.01, 0.06], [-8, 0, 0]);
      ctx.bone('chest'); pc(ctx, K.pants); vt(ctx, [[D.chest - 0.005, K.chestR[0] + 0.008, K.chestR[1] + 0.008], [D.sh - 0.08, K.sw * 0.82, K.chestR[1] * 0.98]], { arc: [-42, 42], n: 4 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, 'oklch(0.58 0.2 25)'); ell(ctx, [x, y - 0.01, -0.045], [0.045, 0.042, 0.045], { s: 6, q: 3 });
      if (L >= 4) return;
      pc(ctx, C.dwood); tube(ctx, [[x, y + 0.03, -0.045, 0.004], [x + 0.005, y + 0.055, -0.045, 0.004]], { n: 3 });
      ctx.bone('chest'); pc(ctx, K.pants); for (const s of [-1, 1]) tube(ctx, [[s * 0.08, D.sh - 0.08, -K.chestR[1] * 0.95, 0.014], [s * 0.09, D.sh + 0.0, -0.03, 0.014], [s * 0.09, D.sh + 0.0, 0.05, 0.014], [s * 0.07, D.chest, K.chestR[1] + 0.005, 0.014]], { n: 3 });
      pc(ctx, C.gold, 0.5); for (const s of [-1, 1]) ell(ctx, [s * 0.08, D.sh - 0.085, -K.chestR[1] - 0.012], [0.012, 0.012, 0.006], { s: 5, q: 2 });
      for (const [s, col] of [[-1, 'oklch(0.62 0.12 140)'], [1, 'oklch(0.7 0.13 70)']]) { ctx.bone(s < 0 ? 'upperLegL' : 'upperLegR'); pc(ctx, col); obox(ctx, [s * D.hx, D.knee + 0.07, -K.legR * 1.05], [0.032, 0.032, 0.006], [0, 0, s * 8]); }
      ctx.bone('hips'); pc(ctx, C.dwood); tube(ctx, [[0.05, D.hip - 0.08, K.waist[1] + 0.02, 0.008], [0.05, D.hip + 0.0, K.waist[1] + 0.035, 0.008], [0.02, D.hip + 0.06, K.waist[1] + 0.045, 0.007]], { n: 3 });
      tube(ctx, [[0.05, D.hip + 0.0, K.waist[1] + 0.035, 0.007], [0.08, D.hip + 0.06, K.waist[1] + 0.045, 0.007]], { n: 3 });
    },
  },
  lady: {
    leg: 0.8, torso: 0.5, sw: 0.17, hx: 0.075, armR: 0.045, legR: 0.05, head: [0.14, 0.15, 0.14], waist: [0.12, 0.1], belly: [0.13, 0.1], chestR: [0.17, 0.12], neckR: 0.042,
    skin: 'oklch(0.88 0.04 60)', hair: 'oklch(0.79 0.11 80)', hairStyle: 'bun', shirt: 'oklch(0.72 0.1 340)', cuff: 'oklch(0.96 0.01 90)', glove: 'oklch(0.96 0.01 90)', pants: 'oklch(0.72 0.1 340)', shoe: 'oklch(0.72 0.1 340)',
    eye: 0.026, smile: 1.1, blush: true, browLift: 0.01,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, gown = K.shirt;
      ctx.bone('head'); pc(ctx, C.gold, 0.6); vt(ctx, [[D.hc + ry * 0.62, rx * 0.93, rz * 0.93], [D.hc + ry * 0.7, rx * 0.9, rz * 0.9]], { arc: [-80, 80], n: Math.min(N, 6) });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, gown); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.02, K.waist[1] + 0.02], [D.hip - 0.14, 0.27, 0.25], [0.45, 0.44, 0.41], [0.12, 0.53, 0.5], [0.01, 0.56, 0.53]], { n: Math.max(N, 6) + 2 });
      for (const s of [-1, 1]) { ctx.bone(s < 0 ? 'upperArmL' : 'upperArmR'); pc(ctx, 'oklch(0.8 0.08 340)'); ell(ctx, [s * (D.ax + 0.01), D.sh - 0.07, 0], [0.075, 0.085, 0.075], { s: 6, q: 3 }); }
      ctx.bone('lowerArmR'); const [x, y] = H.r, P = []; for (let k = 0; k <= 6; k++) { const a = (20 + (k / 6) * 140) * RAD; P.push([x + Math.cos(a) * 0.17, y + 0.02 + Math.sin(a) * 0.17, -0.07]); }
      pc(ctx, 'oklch(0.85 0.06 300)'); plate(ctx, [[x, y + 0.02, -0.07], ...P], [0, 0, 0.005]);
      if (L >= 4) return;
      ctx.bone('head'); pc(ctx, C.gold, 0.6); for (const a of [-40, 0, 40]) { const aa = a * RAD, px = Math.sin(aa) * rx * 0.92, pz = -Math.cos(aa) * rz * 0.92, h = a ? 0.05 : 0.08; tube(ctx, [[px, D.hc + ry * 0.68, pz, 0.018, 0.01]], { n: 4, tip: [px, D.hc + ry * 0.68 + h, pz - 0.01] }); }
      glow(ctx, 'oklch(0.7 0.2 350)', 1.4, 0.3, 0.8); ell(ctx, [0, D.hc + ry * 0.75, -rz * 0.94], [0.018, 0.022, 0.012], { s: 5, q: 2 });
      ctx.bone('hips'); pc(ctx, C.white); vt(ctx, [[0.01, 0.565, 0.535], [0.06, 0.56, 0.53]], { n: Math.max(N, 6) + 2, rag: 0.03 });
      pc(ctx, 'oklch(0.86 0.06 340)'); vt(ctx, [[D.hip + 0.02, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.hip - 0.14, 0.28, 0.26], [0.45, 0.45, 0.42], [0.12, 0.54, 0.51], [0.01, 0.57, 0.54]], { arc: [-22, 22], n: 2 });
      ctx.bone('chest'); pc(ctx, C.white); for (let k = 0; k < 7; k++) { const a = (-60 + k * 20) * RAD; ell(ctx, [Math.sin(a) * (K.neckR + 0.02), D.sh + 0.0 - Math.cos(a * 1.2) * 0.03, -Math.cos(a) * (K.neckR + 0.03)], [0.012, 0.012, 0.012], { s: 4, q: 2 }); }
    },
  },
  alchemist: {
    leg: 0.78, torso: 0.55, sw: 0.2, hx: 0.085, armR: 0.052, legR: 0.06, head: [0.145, 0.16, 0.15], waist: [0.16, 0.13], belly: [0.17, 0.13], chestR: [0.2, 0.14],
    skin: 'oklch(0.8 0.05 60)', hair: 'oklch(0.95 0.01 250)', hairStyle: 'wild', shirt: 'oklch(0.5 0.1 300)', sleeve: 'oklch(0.86 0.03 180)', pants: 'oklch(0.4 0.05 60)', shoe: 'oklch(0.3 0.03 40)',
    eye: 0.026, smile: 1.3, brow: 'oklch(0.93 0.01 250)', browT: 0.016, browLift: 0.016,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz, coat = K.sleeve;
      ctx.bone('head'); pc(ctx, C.leather); vt(ctx, [[D.hc + ry * 0.36, rx * 1.05, rz * 1.05, 0, fz], [D.hc + ry * 0.48, rx * 1.04, rz * 1.04, 0, fz]], { n: N });
      if (L >= 5) return;
      pc(ctx, 'oklch(0.7 0.12 75)', 0.6); for (const s of [-1, 1]) tube(ctx, [[s * rx * 0.38, D.hc + ry * 0.5, fz - rz * 0.78, 0.045], [s * rx * 0.38, D.hc + ry * 0.56, fz - rz * 0.98, 0.045]], { n: 6 });
      ctx.bone('hips'); pc(ctx, coat); skirt(ctx, K, D, D.knee - 0.08, 0.1, { arc: [22, 338], n: N });
      torsoSheet(ctx, K, D, [24, 336], 0.014, coat);
      ctx.bone('lowerArmR'); const [x, y] = H.r, bz = -0.07; pc(ctx, C.glass, 0, 0.4); ell(ctx, [x, y + 0.06, bz], [0.07, 0.07, 0.07], { s: 7, q: 4 });
      tube(ctx, [[x, y + 0.11, bz, 0.02], [x, y + 0.2, bz, 0.018]], { n: 5 });
      glow(ctx, 'oklch(0.82 0.2 145)', 0.4, 1.7, 0.5); ell(ctx, [x, y + 0.045, bz], [0.056, 0.05, 0.056], { s: 6, q: 3, l1: 30 });
      if (L >= 4) return;
      ctx.bone('head'); glow(ctx, 'oklch(0.8 0.08 200)', 0.3, 0.5, 0.55); for (const s of [-1, 1]) ell(ctx, [s * rx * 0.38, D.hc + ry * 0.56, fz - rz * 0.985], [0.036, 0.036, 0.006], { s: 6, q: 2 });
      ctx.bone('lowerArmR'); pc(ctx, C.dwood); obox(ctx, [x, y + 0.215, bz], [0.016, 0.014, 0.016]);
      glow(ctx, 'oklch(0.85 0.18 145)', 0.4, 1.4, 0.5); for (const [dx, dy] of [[0.01, 0.25], [-0.012, 0.29], [0.004, 0.33]]) ell(ctx, [x + dx, y + dy, bz], [0.01, 0.01, 0.01], { s: 4, q: 2 });
      ctx.bone('hips'); const VC = ['oklch(0.7 0.2 25)', 'oklch(0.75 0.15 250)', 'oklch(0.85 0.17 95)', 'oklch(0.7 0.18 320)'];
      pc(ctx, C.leather); vt(ctx, [[D.hip - 0.02, K.waist[0] + 0.03, K.waist[1] + 0.03], [D.hip + 0.02, K.waist[0] + 0.03, K.waist[1] + 0.03]], { n: 6 });
      for (let k = 0; k < 4; k++) { const a = (-50 + k * 33) * RAD, px = Math.sin(a) * (K.waist[0] + 0.045), pz = -Math.cos(a) * (K.waist[1] + 0.045); glow(ctx, VC[k], 0.3, 0.3, 0.3); tube(ctx, [[px, D.hip - 0.07, pz, 0.014], [px, D.hip + 0.0, pz, 0.014]], { n: 4, a: 1 }); }
    },
  },
  tinkerer: {
    leg: 0.38, torso: 0.46, sw: 0.22, hx: 0.1, armR: 0.066, legR: 0.078, head: [0.17, 0.165, 0.17], waist: [0.22, 0.18], belly: [0.25, 0.2], bellyF: 0.03, chestR: [0.25, 0.18], neckR: 0.07, arm: 0.47, hand: 1.15, foot: 1.1, nose: 1.7,
    skin: 'oklch(0.76 0.08 45)', hair: 'oklch(0.56 0.14 45)', hairStyle: 'none', shirt: 'oklch(0.56 0.08 240)', glove: 'oklch(0.44 0.06 55)', pants: 'oklch(0.42 0.05 60)', shoe: 'oklch(0.28 0.03 40)', boot: 0.15,
    beard: 'braid', brow: 'oklch(0.5 0.13 45)', browT: 0.02, eye: 0.027, blush: true, smile: 1.4, mouthHid: true,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz, bz = K.chestR[1] + 0.13;
      ctx.bone('head'); pc(ctx, 'oklch(0.48 0.07 55)'); ell(ctx, [0, D.hc + 0.03, fz], [rx * 1.08, ry * 0.95, rz * 1.08], { l0: 5, s: N, q: 3 });
      if (L >= 5) return;
      ctx.bone('chest'); pc(ctx, 'oklch(0.62 0.06 80)'); obox(ctx, [0, D.chest + 0.03, bz], [0.2, 0.24, 0.12]);
      pc(ctx, 'oklch(0.52 0.14 28)'); tube(ctx, [[-0.22, D.chest + 0.33, bz, 0.06], [0.22, D.chest + 0.33, bz, 0.06]], { n: 6, a: 1, b: 1 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.steel, 0.7); tube(ctx, [[x, y + 0.03, 0, 0.012], [x, y - 0.22, -0.02, 0.012]], { n: 4 });
      obox(ctx, [x, y - 0.25, -0.02], [0.012, 0.03, 0.035]);
      if (L >= 4) return;
      ctx.bone('head'); pc(ctx, 'oklch(0.7 0.12 75)', 0.6); for (const s of [-1, 1]) tube(ctx, [[s * rx * 0.36, D.hc + ry * 0.62, fz - rz * 0.72, 0.042], [s * rx * 0.36, D.hc + ry * 0.66, fz - rz * 0.9, 0.042]], { n: 6, b: 1 });
      ctx.bone('chest'); pc(ctx, C.steel, 0.7); tube(ctx, [[0.14, D.chest + 0.2, bz, 0.012], [0.2, D.chest + 0.46, bz - 0.02, 0.012]], { n: 4 });
      tube(ctx, [[0.2, D.chest + 0.46, bz - 0.02, 0.03]], { n: 6, tip: [0.21, D.chest + 0.5, bz - 0.02] });
      pc(ctx, C.iron, 0.6); tube(ctx, [[-0.12, D.chest + 0.2, bz + 0.03, 0.022], [-0.18, D.chest + 0.5, bz + 0.03, 0.022]], { n: 5, b: 1 });
      pc(ctx, 'oklch(0.72 0.12 75)', 0.6); const gc = [0.215, D.chest - 0.02, bz], G = [];
      for (let k = 0; k < 16; k++) { const a = (k / 16) * TAU, r = k % 2 ? 0.075 : 0.095; G.push([gc[0], gc[1] + Math.cos(a) * r, gc[2] + Math.sin(a) * r]); }
      plate(ctx, G, [0.02, 0, 0]);
      pc(ctx, C.steel, 0.5); plate(ctx, [[-0.02, D.chest + 0.2, bz + 0.1], [0.08, D.chest + 0.2, bz + 0.1], [0.06, D.chest + 0.45, bz + 0.1], [-0.02, D.chest + 0.4, bz + 0.1]], [0, 0, 0.006]);
      ctx.bone('spine'); pc(ctx, C.leather); vt(ctx, [[D.hip - 0.01, K.waist[0] + 0.02, K.waist[1] + 0.02], [D.hip + 0.04, K.waist[0] + 0.025, K.waist[1] + 0.025]], { n: 6 });
      pc(ctx, C.gold, 0.6); obox(ctx, [0, D.hip + 0.015, -K.waist[1] - 0.03], [0.035, 0.03, 0.008]);
    },
  },
  shepherdess: {
    leg: 0.78, torso: 0.5, sw: 0.175, hx: 0.075, armR: 0.047, legR: 0.054, head: [0.145, 0.15, 0.14], waist: [0.135, 0.11], belly: [0.145, 0.115], chestR: [0.175, 0.125],
    skin: 'oklch(0.84 0.05 60)', cuff: 'oklch(0.84 0.05 60)', hair: 'oklch(0.86 0.1 90)', hairStyle: 'long', shirt: 'oklch(0.95 0.02 90)', torsoC: 'oklch(0.6 0.1 245)', pants: 'oklch(0.6 0.1 245)', shoe: 'oklch(0.42 0.06 50)',
    eye: 0.026, smile: 1.3, blush: true,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz;
      ctx.bone('head'); pc(ctx, 'oklch(0.92 0.04 240)'); ell(ctx, [0, D.hc + 0.01, fz + 0.02], [rx * 1.14, ry * 1.1, rz * 1.12], { l0: -18, e: [42, 0, 0], s: N, q: 3 });
      if (L >= 5) return;
      ctx.bone('hips'); pc(ctx, K.pants); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.025, K.waist[1] + 0.025], [D.knee, 0.22, 0.19], [0.05, 0.27, 0.24]], { n: N });
      ctx.bone('chest'); pc(ctx, 'oklch(0.56 0.15 28)'); vt(ctx, [[D.sh + 0.02, K.neckR + 0.05, K.neckR + 0.045], [D.sh - 0.06, K.sw + 0.045, K.chestR[1] + 0.05], [D.chest - 0.02, K.sw + 0.07, K.chestR[1] + 0.08]], { n: N, rag: L <= 3 ? 0.08 : 0 });
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.wood);
      tube(ctx, [[x, 0.02, -0.02, 0.016], [x, y + 0.85, -0.02, 0.015], [x, y + 0.93, -0.07, 0.014], [x, y + 0.93, -0.15, 0.013], [x, y + 0.86, -0.2, 0.012], [x, y + 0.78, -0.19, 0.011]], { n: 4 });
      if (L >= 4) return;
      ctx.bone('hips'); pc(ctx, C.white); vt(ctx, [[D.hip + 0.03, K.waist[0] + 0.04, K.waist[1] + 0.04], [D.knee - 0.05, 0.235, 0.205]], { arc: [-48, 48], n: 4 });
      ctx.bone('head'); pc(ctx, 'oklch(0.72 0.12 350)'); vt(ctx, [[D.hc + ry * 0.35, rx * 1.12, rz * 1.12, 0, fz + 0.03], [D.hc + ry * 0.45, rx * 1.1, rz * 1.1, 0, fz + 0.03]], { arc: [60, 300], n: 6, e: [42, 0, 0], p: [0, D.hc, fz] });
      ell(ctx, [0, D.hc + 0.02, fz + rz * 1.12], [0.04, 0.03, 0.02], { s: 5, q: 2 });
    },
  },
  watch: {
    leg: 0.86, torso: 0.6, sw: 0.24, hx: 0.095, armR: 0.066, legR: 0.07, head: [0.15, 0.15, 0.15], waist: [0.2, 0.16], belly: [0.22, 0.17], chestR: [0.24, 0.17],
    skin: 'oklch(0.76 0.07 55)', hair: 'oklch(0.28 0.03 40)', hairStyle: 'none', shirt: 'oklch(0.36 0.07 260)', glove: 'oklch(0.44 0.06 55)', pants: 'oklch(0.46 0.02 250)', shoe: 'oklch(0.22 0.02 40)', boot: 0.35,
    beard: 'walrus', brow: 'oklch(0.26 0.03 40)', browT: 0.017, eye: 0.024, smile: 1, mouthHid: true,
    parts(ctx, K, D, L, H) {
      const [rx, ry, rz] = K.head, fz = K.hz;
      ctx.bone('head'); pc(ctx, C.steel, 0.65); ell(ctx, [0, D.hc + 0.03, fz], [rx * 1.1, ry * 1.02, rz * 1.1], { l0: 0, s: N, q: 3 });
      vt(ctx, [[D.hc + 0.04, rx * 1.1, rz * 1.1, 0, fz], [D.hc - 0.01, rx * 1.7, rz * 1.7, 0, fz]], { n: N });
      if (L >= 5) return;
      ctx.bone('lowerArmR'); const [x, y] = H.r; pc(ctx, C.wood); tube(ctx, [[x, 0.02, 0, 0.018], [x, 2.25, 0, 0.018]], { n: 4 });
      pc(ctx, C.steel, 0.7); plate(ctx, [[x - 0.008, 2.14, -0.02], [x - 0.008, 1.96, -0.02], [x - 0.008, 1.9, -0.19], [x - 0.008, 2.2, -0.24]], [0.016, 0, 0]);
      tube(ctx, [[x, 2.25, 0, 0.022]], { n: 4, tip: [x, 2.45, 0] });
      ctx.bone('lowerArmL'); const [lx, ly] = H.l, cy = ly - 0.2; glow(ctx, 'oklch(0.9 0.12 80)', 2.6, 1.6, 0.5); ell(ctx, [lx, cy, 0], [0.045, 0.065, 0.045], { s: 6, q: 3 });
      if (L >= 4) return;
      ctx.bone('lowerArmR'); pc(ctx, C.steel, 0.7); plate(ctx, [[x - 0.008, 2.1, 0.02], [x - 0.008, 2.04, 0.02], [x - 0.008, 2.13, 0.15]], [0.016, 0, 0]);
      ctx.bone('lowerArmL'); pc(ctx, C.iron, 0.6); vt(ctx, [[cy + 0.075, 0.065, 0.065, lx], [cy + 0.12, 0.02, 0.02, lx]], { n: 6, a: 1 }); obox(ctx, [lx, cy - 0.075, 0], [0.06, 0.012, 0.06]);
      for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(ctx, [lx + dx * 0.05, cy, dz * 0.05], [0.006, 0.075, 0.006]);
      tube(ctx, [[lx, cy + 0.12, -0.02, 0.006], [lx, ly + 0.02, 0, 0.006], [lx, cy + 0.12, 0.02, 0.006]], { n: 3 });
      ctx.bone('spine'); pc(ctx, C.leather); vt(ctx, [[D.hip, K.waist[0] + 0.015, K.waist[1] + 0.015], [D.hip + 0.05, K.waist[0] + 0.017, K.waist[1] + 0.017]], { n: 6 });
      ctx.bone('chest'); pc(ctx, C.gold, 0.6); ell(ctx, [-0.1, D.chest + 0.08, -K.chestR[1] - 0.005], [0.025, 0.03, 0.008], { s: 6, q: 2 });
      pc(ctx, 'oklch(0.3 0.06 260)'); for (let i = 0; i < 3; i++) vt(ctx, [[D.chest - 0.1 + i * 0.1, K.chestR[0] + 0.004, K.chestR[1] + 0.004], [D.chest - 0.09 + i * 0.1, K.chestR[0] + 0.004, K.chestR[1] + 0.004]], { n: 8 });
    },
  },
};
export const WHO = ['smith', 'herald', 'baker', 'witch', 'apprentice', 'knight', 'merchant', 'beekeeper', 'flowergirl', 'fisher', 'bard', 'gardener', 'ranger', 'cleric', 'kid', 'lady', 'alchemist', 'tinkerer', 'shepherdess', 'watch'];
function kit(params) {
  const w = params?.who, key = typeof w === 'number' ? WHO[(w - 1 + 20) % 20] : CH[w] ? w : 'smith';
  return { ...DEF, ...CH[key] };
}
export function heightOf(who) { const K = kit({ who }), D = dims(K); return D.hc + K.head[1]; }
export function skeleton(ctx) {
  const K = kit(ctx?.params), D = dims(K), b = {
    hips: { pivot: [0, D.hip, 0] }, spine: { parent: 'hips', pivot: [0, D.hip + 0.06, 0] }, chest: { parent: 'spine', pivot: [0, D.chest, 0] },
    neck: { parent: 'chest', pivot: [0, D.sh, 0] }, head: { parent: 'neck', pivot: [0, D.nt, 0] },
  };
  for (const s of [-1, 1]) {
    const sd = s < 0 ? 'L' : 'R';
    b['upperArm' + sd] = { parent: 'chest', pivot: [s * D.ax, D.sh - 0.04, 0] };
    b['lowerArm' + sd] = { parent: 'upperArm' + sd, pivot: [s * (D.ax + 0.02), D.elbow, 0] };
    b['upperLeg' + sd] = { parent: 'hips', pivot: [s * D.hx, D.hip - 0.03, 0] };
    b['lowerLeg' + sd] = { parent: 'upperLeg' + sd, pivot: [s * D.hx, D.knee, 0] };
    b['foot' + sd] = { parent: 'lowerLeg' + sd, pivot: [s * D.hx, D.f + 0.02, 0] };
  }
  return b;
}
export function geometry(ctx) {
  const K = kit(ctx.params), D = dims(K), L = ctx.lod ?? 1;
  N = L <= 1 ? 8 : L === 2 ? 7 : L === 3 ? 6 : L === 4 ? 4 : 3;
  ctx.flat(); ctx.roughness(0.82); ctx.metalness(0);
  body(ctx, K, D, L);
  K.parts(ctx, K, D, L, hands(D));
  ctx.bone(null);
}
