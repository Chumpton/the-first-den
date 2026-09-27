// The home grounds kit: one generator for the dock, the camp and the garden. params.kind picks the piece; feet at y 0,
// front toward −Z, metres. Parts branch on ctx.lod (4–5 = a handful of boxes). Shared builders: rbox, cyl, blob, disc.
const D = Math.PI / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function rot(v, yaw = 0, pitch = 0, roll = 0) {
  let [x, y, z] = v, c = Math.cos(roll * D), s = Math.sin(roll * D);
  [x, y] = [x * c - y * s, x * s + y * c];
  c = Math.cos(pitch * D); s = Math.sin(pitch * D);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(yaw * D); s = Math.sin(yaw * D);
  [x, z] = [x * c + z * s, -x * s + z * c];
  return [x, y, z];
}
let XF = null; // placement stack for sub-builders
function withXF(o, yaw, fn) { const prev = XF; XF = (v) => { const w = add(o, rot(v, yaw)); return prev ? prev(w) : w; }; fn(); XF = prev; }
const X = (v) => (XF ? XF(v) : v);
function Q(ctx, a, b, c, d) { a = X(a); b = X(b); c = X(c); d = X(d); ctx.quad(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], d[0], d[1], d[2]); }
function T(ctx, a, b, c) { a = X(a); b = X(b); c = X(c); ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }
function triOut(ctx, a, b, c, out) { dot(cross(sub(b, a), sub(c, a)), out) < 0 ? T(ctx, a, c, b) : T(ctx, a, b, c); }
function quadOut(ctx, a, b, c, d, out) { dot(cross(sub(b, a), sub(c, a)), out) < 0 ? Q(ctx, d, c, b, a) : Q(ctx, a, b, c, d); }
function obox(ctx, c, A, H, skipBottom) {
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3, k = (i + 2) % 3;
    for (const s of [1, -1]) {
      if (skipBottom && i === 1 && s === -1) continue;
      const f = (sj, sk) => add(c, add(mul(A[i], s * H[i]), add(mul(A[j], sj * H[j]), mul(A[k], sk * H[k]))));
      const p = [f(-1, -1), f(1, -1), f(1, 1), f(-1, 1)];
      if (s < 0) p.reverse();
      Q(ctx, p[0], p[1], p[2], p[3]);
    }
  }
}
function rbox(ctx, c, w, h, d, yaw = 0, pitch = 0, roll = 0, skipBottom = false) {
  obox(ctx, c, [rot([1, 0, 0], yaw, pitch, roll), rot([0, 1, 0], yaw, pitch, roll), rot([0, 0, 1], yaw, pitch, roll)], [w / 2, h / 2, d / 2], skipBottom);
}
function box(ctx, x, y0, z, w, h, d, yaw = 0) { rbox(ctx, [x, y0 + h / 2, z], w, h, d, yaw, 0, 0, true); }
function cyl(ctx, a, b, r0, r1, n = 6, caps = 1, capPaint) {
  const d = norm(sub(b, a)), up = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], p = norm(cross(up, d)), q = cross(d, p);
  const ring = (c, r) => { const o = []; for (let i = 0; i < n; i++) { const t = (i / n) * 2 * Math.PI; o.push(add(c, add(mul(p, r * Math.cos(t)), mul(q, r * Math.sin(t))))); } return o; };
  const A = ring(a, r0), B = ring(b, r1);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, A[i], A[j], B[j], B[i]); }
  if (capPaint) capPaint();
  if (caps & 1 && r1 > 0) for (let i = 0; i < n; i++) T(ctx, b, B[i], B[(i + 1) % n]);
  if (caps & 2 && r0 > 0) for (let i = 0; i < n; i++) T(ctx, a, A[(i + 1) % n], A[i]);
}
function blob(ctx, c, rx, ry, rz, n = 6, m = 4, yaw = 0) {
  const P = (j, i) => { const f = -90 + (180 * j) / m, t = (360 * i) / n + yaw; return add(c, [rx * Math.cos(f * D) * Math.cos(t * D), ry * Math.sin(f * D), rz * Math.cos(f * D) * Math.sin(t * D)]); };
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
    const a = P(j, i), b = P(j + 1, i), e = P(j + 1, i + 1), g = P(j, i + 1), out = sub(mul(add(add(a, b), add(e, g)), 0.25), c);
    if (j === 0) triOut(ctx, a, b, e, out); else if (j === m - 1) triOut(ctx, a, b, g, out); else quadOut(ctx, a, b, e, g, out);
  }
}
function disc(ctx, c, r, n = 8, skip = -1, jit = 0, rnd) {
  const v = []; for (let i = 0; i <= n; i++) { const t = (i / n) * 2 * Math.PI, rr = r * (1 + (jit && rnd ? (rnd() - 0.5) * jit : 0)); v.push(add(c, [rr * Math.cos(t), 0, rr * Math.sin(t)])); }
  v[n] = v[0];
  for (let i = 0; i < n; i++) if (i !== skip) T(ctx, c, v[i + 1], v[i]);
}
function pyramid(ctx, c, w, h) {
  const a = add(c, [0, h, 0]), k = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => add(c, [(x * w) / 2, 0, (z * w) / 2])), mid = add(c, [0, h / 3, 0]);
  for (let i = 0; i < 4; i++) { const b = k[i], e = k[(i + 1) % 4]; triOut(ctx, b, e, a, sub(mul(add(add(b, e), a), 1 / 3), mid)); }
}
// ---------- paint ----------
const TEX = {
  greywood: ["cdn/texture-silver-weathered-driftwood-planks.png", "oklch(0.97 0.012 85)", 0.9],
  wood: ["cdn/texture-honey-oak-wood-grain.png", "oklch(0.96 0.02 75)", 0.8],
  bark: ["cdn/texture-rough-brown-oak-bark.png", "oklch(0.95 0.02 60)", 0.95],
  canvas: ["cdn/texture-cream-canvas-linen-weave.png", "oklch(0.98 0.02 85)", 0.95],
  stone: ["cdn/texture-pale-weathered-limestone-rock.png", "oklch(0.95 0.01 80)", 0.9],
  soil: ["cdn/texture-dark-tilled-garden-soil.png", "oklch(0.95 0.02 60)", 1],
  wattle: ["cdn/texture-woven-hazel-wattle-fence.png", "oklch(0.97 0.02 75)", 0.95],
};
function paint(ctx, k, tint) {
  const t = TEX[k];
  if (t) { ctx.albedo(t[0]); ctx.color(tint || t[1]); ctx.roughness(t[2]); }
  else { ctx.albedo(null); ctx.color(k); ctx.roughness(tint ?? 0.8); }
  ctx.metalness(0); ctx.emissive(null);
}
function metal(ctx, c, m = 0.6, r = 0.45) { ctx.albedo(null); ctx.color(c); ctx.metalness(m); ctx.roughness(r); ctx.emissive(null); }
function glow(ctx, c, r, g, b) { ctx.albedo(null); ctx.color(c); ctx.metalness(0); ctx.roughness(0.4); ctx.emissive(r, g, b); }
const IRON = "oklch(0.33 0.012 250)", BRASS = "oklch(0.74 0.11 80)", ROPE = "oklch(0.76 0.06 80)", ENDGRAIN = "oklch(0.8 0.07 75)";
const jitColor = (ctx, L, C, H, dl = 0.06, dh = 20) => `oklch(${(L + (ctx.random() - 0.5) * dl).toFixed(3)} ${C} ${(H + (ctx.random() - 0.5) * dh).toFixed(1)})`;
// ---------- shared small builders (local feet 0, front −Z) ----------
function lanternHead(ctx, c, lod, s = 1) {
  metal(ctx, IRON);
  box(ctx, c[0], c[1], c[2], 0.17 * s, 0.03 * s, 0.17 * s);
  if (lod <= 2) for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(ctx, c[0] + x * 0.07 * s, c[1] + 0.03 * s, c[2] + z * 0.07 * s, 0.018 * s, 0.18 * s, 0.018 * s);
  pyramid(ctx, add(c, [0, 0.21 * s, 0]), 0.21 * s, 0.1 * s);
  if (lod <= 2) cyl(ctx, add(c, [0, 0.3 * s, 0]), add(c, [0, 0.35 * s, 0]), 0.02 * s, 0.02 * s, 4, 1);
  glow(ctx, "oklch(0.95 0.08 80)", 2.6, 1.45, 0.55);
  box(ctx, c[0], c[1] + 0.03 * s, c[2], 0.12 * s, 0.18 * s, 0.12 * s);
  ctx.emissive(null);
}
function bench(ctx, lod, w = 1.4) {
  paint(ctx, "wood");
  const sh = 0.45;
  if (lod >= 4) { box(ctx, 0, 0, 0, w, sh, 0.4); rbox(ctx, [0, 0.72, 0.22], w, 0.5, 0.05, 0, 10, 0); return; }
  rbox(ctx, [0, sh - 0.025, -0.09], w, 0.05, 0.17); rbox(ctx, [0, sh - 0.025, 0.1], w, 0.05, 0.17);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.12), 0, sz * 0.14, 0.07, sh - 0.05, 0.07);
    rbox(ctx, [sx * (w / 2 - 0.12), 0.7, 0.24], 0.07, 0.52, 0.06, 0, 10, 0);
  }
  if (lod <= 2) { rbox(ctx, [0, 0.72, 0.265], w - 0.1, 0.1, 0.03, 0, 10, 0); rbox(ctx, [0, 0.88, 0.295], w - 0.1, 0.1, 0.03, 0, 10, 0); rbox(ctx, [0, 0.15, 0], w - 0.24, 0.05, 0.04); }
  else rbox(ctx, [0, 0.8, 0.28], w - 0.1, 0.26, 0.03, 0, 10, 0);
}
function bucket(ctx, lod) {
  paint(ctx, "wood");
  const n = lod <= 2 ? 9 : 6;
  cyl(ctx, [0, 0, 0], [0, 0.32, 0], 0.15, 0.18, n, 0);
  paint(ctx, "oklch(0.55 0.07 210)", 0.15); disc(ctx, [0, 0.25, 0], 0.165, n);
  metal(ctx, IRON);
  if (lod <= 2) {
    cyl(ctx, [0, 0.05, 0], [0, 0.08, 0], 0.157, 0.16, n, 0); cyl(ctx, [0, 0.24, 0], [0, 0.27, 0], 0.172, 0.175, n, 0);
    let prev = [-0.18, 0.32, 0];
    for (let i = 1; i <= 5; i++) { const t = (i / 5) * Math.PI, pt = [-0.18 * Math.cos(t), 0.32 + 0.16 * Math.sin(t), 0]; cyl(ctx, prev, pt, 0.008, 0.008, 3, 0); prev = pt; }
    paint(ctx, "oklch(0.72 0.12 60)"); triOut(ctx, [0.04, 0.25, 0], [0.1, 0.36, 0.03], [0.1, 0.36, -0.03], [1, 0, 0]);
  }
}
function tackle(ctx, lod) {
  paint(ctx, "oklch(0.62 0.09 170)", 0.6);
  box(ctx, 0, 0, 0, 0.44, 0.18, 0.24);
  rbox(ctx, [0, 0.205, 0], 0.46, 0.05, 0.26);
  if (lod <= 2) { metal(ctx, BRASS, 0.8, 0.35); box(ctx, 0, 0.15, -0.125, 0.05, 0.05, 0.015); metal(ctx, IRON); cyl(ctx, [-0.08, 0.25, 0], [0.08, 0.25, 0], 0.012, 0.012, 4, 0); }
}
function rodRack(ctx, lod) {
  paint(ctx, "wood");
  for (const sx of [-1, 1]) box(ctx, sx * 0.55, 0, 0, 0.08, 1.1, 0.08);
  rbox(ctx, [0, 1.0, 0], 1.3, 0.06, 0.07); rbox(ctx, [0, 0.03, 0.18], 1.3, 0.06, 0.2);
  if (lod >= 4) return;
  const rods = lod <= 2 ? [-0.35, 0, 0.35] : [-0.2, 0.25];
  for (const x of rods) {
    const b = [x, 0.06, 0.24], dir = norm([0.03, 1, -0.24]), tip = add(b, mul(dir, 2.5));
    paint(ctx, "oklch(0.72 0.08 70)"); cyl(ctx, b, tip, 0.014, 0.006, 4, 0);
    metal(ctx, BRASS, 0.8, 0.35); const r = add(b, mul(dir, 0.35)); cyl(ctx, add(r, [-0.03, 0, 0]), add(r, [0.03, 0, 0]), 0.04, 0.04, 6, 3);
  }
}
// ---------- the dock ----------
function dock(ctx, p, lod) {
  const L = p.length ?? 10, W = p.width ?? 2.4, PL = p.platLen ?? 4, PW = p.platWidth ?? 4.8, top = p.top ?? 0.9, bed = p.bed ?? -2.6, R = p.ramp ?? 2.2, G = p.ground ?? 0.5;
  const Z1 = -L, Z2 = -(L + PL), th = 0.06, ang = Math.atan2(top - G, R) / D, sl = Math.hypot(R, top - G);
  paint(ctx, "greywood");
  const tint = () => ctx.color(jitColor(ctx, 0.93, 0.018, 75, 0.08, 40));
  if (lod <= 2) {
    for (let z = -0.12; z > Z1 + 0.05; z -= 0.235) { tint(); rbox(ctx, [0, top - th / 2 + (ctx.random() - 0.5) * 0.012, z], W, th, 0.215, (ctx.random() - 0.5) * 1.2); }
    for (let z = Z1 - 0.12; z > Z2 + 0.05; z -= 0.235) { tint(); rbox(ctx, [0, top - th / 2 + (ctx.random() - 0.5) * 0.012, z], PW, th, 0.215, (ctx.random() - 0.5) * 0.8); }
    const n = Math.round(sl / 0.235);
    for (let i = 0; i < n; i++) { tint(); const t = (i + 0.5) / n; rbox(ctx, [0, top - (top - G) * t - th / 2, t * R], W, th, sl / n - 0.02, 0, ang, 0); }
  } else {
    rbox(ctx, [0, top - th / 2, Z1 / 2], W, th, L); rbox(ctx, [0, top - th / 2, (Z1 + Z2) / 2], PW, th, PL);
    rbox(ctx, [0, (top + G) / 2 - th / 2, R / 2], W, th, sl, 0, ang, 0);
  }
  paint(ctx, "greywood", "oklch(0.86 0.02 65)");
  const posts = [];
  if (lod >= 4) posts.push([-W / 2, 0], [W / 2, 0], [-PW / 2, Z2], [PW / 2, Z2]);
  else {
    for (let z = 0; z > Z1 - 0.01; z -= 2) for (const sx of [-1, 1]) posts.push([sx * (W / 2 + 0.08), z]);
    for (let z = Z1 - PL / 2; z > Z2 - 0.01; z -= PL / 2) for (const sx of [-1, 1]) posts.push([sx * (PW / 2 + 0.08), z]);
    for (const sx of [-1, 1]) for (const [a, b] of [[Z1, -W / 2 - 0.3], [Z1, W / 2 + 0.3]]) void a, void b, void sx;
    for (const sx of [-1, 1]) for (let z = Z1; z > Z2 - 0.01; z -= PL / 2) for (const k of [-1, 1]) void k;
    for (const sx of [-1, 1]) for (const xx of [W / 2 + 0.6, PW / 2 - 0.5]) posts.push([sx * xx, Z1 - 0.08]);
    for (const sx of [-1, 1]) for (const xx of [0.9, PW / 2 - 0.5]) posts.push([sx * xx, Z2 - 0.08]);
    for (const sx of [-1, 1]) for (const zz of [Z1 - PL / 2]) posts.push([sx * 0.9, zz]);
  }
  const bollard = (x, z) => (Math.abs(z - Z2) < 0.2 && Math.abs(Math.abs(x) - (PW / 2 + 0.08)) < 0.05 ? 0.45 : Math.abs(z + 4) < 0.01 && x > 0 ? 0.35 : Math.abs(z) < 0.01 ? 0.3 : 0);
  const pn = lod <= 2 ? 7 : lod === 3 ? 5 : 4;
  for (const [x, z] of posts) { const h = bollard(x, z); ctx.color(jitColor(ctx, 0.86, 0.02, 65, 0.08, 20)); cyl(ctx, [x, bed, z], [x, top - (h ? -h : 0.07), z], 0.12, 0.11, pn, 1); }
  if (lod <= 2) posts.push([W / 2 + 0.08, -4]), cyl(ctx, [W / 2 + 0.08, bed, -4], [W / 2 + 0.08, top + 0.35, -4], 0.12, 0.11, pn, 1);
  if (lod <= 3) {
    for (const sx of [-1, 1]) rbox(ctx, [sx * (W / 2 - 0.2), top - th - 0.09, Z1 / 2], 0.1, 0.18, L);
    for (const sx of [-1, 0, 1]) rbox(ctx, [sx * (PW / 2 - 0.2), top - th - 0.09, (Z1 + Z2) / 2], 0.1, 0.18, PL);
    for (let z = 0; z > Z1 - 0.01; z -= 2) rbox(ctx, [0, top - th - 0.26, z], W + 0.3, 0.12, 0.1);
    for (let z = Z1; z > Z2 - 0.01; z -= PL / 2) rbox(ctx, [0, top - th - 0.26, z], PW + 0.3, 0.12, 0.1);
  }
  if (lod <= 2) {
    for (const sx of [-1, 1]) {
      rbox(ctx, [sx * (W / 2 + 0.02), top - th - 0.06, Z1 / 2], 0.04, 0.14, L);
      rbox(ctx, [sx * (PW / 2 + 0.02), top - th - 0.06, (Z1 + Z2) / 2], 0.04, 0.14, PL);
      rbox(ctx, [sx * (PW / 4 + W / 4 + 0.01), top - th - 0.06, Z1 - 0.02], PW / 2 - W / 2 + 0.02, 0.14, 0.04);
    }
    rbox(ctx, [0, top - th - 0.06, Z2 - 0.02], PW + 0.08, 0.14, 0.04);
  }
  if (lod >= 4) return;
  withXF([-1.3, top, Z1 - 0.75], 0, () => bench(ctx, lod, 1.5));
  withXF([1.95, top, Z1 - 0.55], 0, () => bucket(ctx, lod));
  withXF([1.35, top, Z1 - 0.5], 12, () => tackle(ctx, lod));
  withXF([-(PW / 2) + 0.28, top, Z1 - 2.6], 90, () => rodRack(ctx, lod));
  metal(ctx, IRON);
  const bx = PW / 2 + 0.08, bt = top + 0.45;
  rbox(ctx, [bx - 0.12, bt + 0.02, Z2 - 0.08], 0.28, 0.035, 0.035);
  cyl(ctx, [bx - 0.24, bt + 0.02, Z2 - 0.08], [bx - 0.24, bt - 0.1, Z2 - 0.08], 0.01, 0.01, 3, 0);
  lanternHead(ctx, [bx - 0.24, bt - 0.45, Z2 - 0.08], lod, 1.2);
  paint(ctx, ROPE);
  const a = [W / 2 + 0.08, top + 0.3, -4], m = [W / 2 + 0.55, 0.62, -3.95], b = [2.3, 0.48, -4.15];
  cyl(ctx, a, m, 0.02, 0.02, 4, 0); cyl(ctx, m, b, 0.02, 0.02, 4, 0);
  if (lod <= 2) cyl(ctx, [W / 2 + 0.08, top + 0.22, -4], [W / 2 + 0.08, top + 0.28, -4], 0.135, 0.135, 7, 0);
}
function dockCollider(ctx, p) {
  const L = p.length ?? 10, W = p.width ?? 2.4, PL = p.platLen ?? 4, PW = p.platWidth ?? 4.8, top = p.top ?? 0.9, R = p.ramp ?? 2.2, G = p.ground ?? 0.5;
  const Z1 = -L, Z2 = -(L + PL), ang = Math.atan2(top - G, R) / D, sl = Math.hypot(R, top - G);
  rbox(ctx, [0, top - 0.1, Z1 / 2], W, 0.2, L);
  rbox(ctx, [0, top - 0.1, (Z1 + Z2) / 2], PW, 0.2, PL);
  rbox(ctx, [0, (top + G) / 2 - 0.1, R / 2], W, 0.2, sl + 0.1, 0, ang, 0);
  rbox(ctx, [-1.3, top + 0.45, Z1 - 0.75], 1.5, 0.9, 0.5);
  rbox(ctx, [-(PW / 2) + 0.28, top + 0.55, Z1 - 2.6], 0.3, 1.1, 1.3);
}
// ---------- boat ----------
const HULL = [[-1.5, 0.45, -0.16, 0.36], [-0.9, 0.6, -0.22, 0.34], [-0.2, 0.64, -0.24, 0.33], [0.6, 0.56, -0.22, 0.36], [1.2, 0.34, -0.16, 0.43], [1.62, 0.03, -0.06, 0.52]];
const section = ([z, w, k, s]) => [[-w, s], [-0.96 * w, 0.06], [-0.6 * w, k * 0.8], [0, k], [0.6 * w, k * 0.8], [0.96 * w, 0.06], [w, s]].map(([x, y]) => [x, y, z]);
function boat(ctx, p, lod) {
  const S = HULL.map(section);
  paint(ctx, p.paint || "oklch(0.68 0.08 195)", 0.6);
  for (let i = 0; i < S.length - 1; i++) for (let j = 0; j < 6; j++) {
    const a = S[i][j], b = S[i + 1][j], c = S[i + 1][j + 1], d = S[i][j + 1], mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    if (j === 0 || j === 5) ctx.color(p.paint || "oklch(0.68 0.08 195)");
    quadOut(ctx, a, b, c, d, [mx, my - 0.3, 0]);
  }
  const t = S[0], tc = [0, 0.1, t[0][2]];
  paint(ctx, "wood");
  for (let j = 0; j < 6; j++) triOut(ctx, tc, t[j], t[j + 1], [0, 0, -1]);
  if (lod >= 4) return;
  paint(ctx, "oklch(0.95 0.02 90)", 0.6);
  for (let i = 0; i < S.length - 1; i++) for (const j of [0, 6]) { const a = S[i][j], b = S[i + 1][j]; cyl(ctx, a, b, 0.035, 0.035, 4, 0); }
  paint(ctx, "wood");
  rbox(ctx, [0, 0.2, -1.05], 0.95, 0.04, 0.3); rbox(ctx, [0, 0.2, 0.2], 1.15, 0.04, 0.28); rbox(ctx, [0, -0.1, -0.2], 0.55, 0.03, 2.2);
  if (lod <= 2) for (const sx of [-1, 1]) {
    const a = [sx * 0.25, 0.24, -1.3], b = [sx * 0.3, 0.26, 1.0];
    cyl(ctx, a, b, 0.025, 0.025, 4, 0); rbox(ctx, add(b, [0, 0, 0.18]), 0.12, 0.015, 0.4, 0, 0, sx * 8);
  }
  metal(ctx, IRON); if (lod <= 2) rbox(ctx, [0, 0.52, 1.5], 0.06, 0.04, 0.12);
}
function boatCollider(ctx) { rbox(ctx, [0, -0.08, -0.1], 1.0, 0.1, 2.6); for (const sx of [-1, 1]) rbox(ctx, [sx * 0.58, 0.15, -0.1], 0.08, 0.4, 2.4); }
// ---------- fishing spot ----------
function fishspot(ctx, p, lod) {
  paint(ctx, "wood");
  box(ctx, 0, 0, 0.3, 0.38, 0.3, 0.38, 8);
  paint(ctx, "oklch(0.86 0.06 85)"); rbox(ctx, [0, 0.29, 0.3], 0.34, 0.02, 0.34, 8);
  paint(ctx, "bark");
  cyl(ctx, [0, 0.2, -0.05], [0, 0.78, -0.05], 0.03, 0.025, 5, 1);
  if (lod <= 3) { cyl(ctx, [0, 0.7, -0.05], [-0.07, 0.86, -0.05], 0.02, 0.015, 4, 1); cyl(ctx, [0, 0.7, -0.05], [0.07, 0.86, -0.05], 0.02, 0.015, 4, 1); }
  const butt = [0, 0.33, 0.35], fork = [0, 0.82, -0.05], dir = norm(sub(fork, butt)), mid = add(butt, mul(dir, 1.8)), tip = add(add(butt, mul(dir, 3.2)), [0, -0.3, 0]);
  paint(ctx, "oklch(0.7 0.09 60)");
  cyl(ctx, butt, mid, 0.02, 0.012, 5, 1); cyl(ctx, mid, tip, 0.012, 0.005, 4, 1);
  metal(ctx, BRASS, 0.8, 0.35);
  const r = add(butt, mul(dir, 0.22)); cyl(ctx, add(r, [-0.035, -0.05, 0]), add(r, [0.035, -0.05, 0]), 0.05, 0.05, lod <= 2 ? 8 : 5, 3);
  const bob = [0, -0.88, (p.lineZ ?? -4.4)];
  paint(ctx, "oklch(0.92 0.02 90)", 0.5); cyl(ctx, tip, add(bob, [0, 0.08, 0]), 0.004, 0.004, 3, 0);
  if (lod <= 3) {
    paint(ctx, "oklch(0.64 0.2 28)", 0.4); blob(ctx, add(bob, [0, 0.05, 0]), 0.05, 0.05, 0.05, 6, 3);
    paint(ctx, "oklch(0.97 0.01 90)", 0.4); blob(ctx, add(bob, [0, -0.005, 0]), 0.048, 0.035, 0.048, 6, 2);
  }
}
// ---------- lake life ----------
function lilies(ctx, p, lod) {
  const n = p.count ?? 7, R = p.r ?? 1.5, rnd = () => ctx.random();
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * R, r = 0.22 + rnd() * 0.22, c = [Math.cos(a) * d, 0.015 + rnd() * 0.01, Math.sin(a) * d];
    paint(ctx, jitColor(ctx, 0.62, 0.12, 135, 0.1, 20), 0.5);
    const seg = lod <= 2 ? 9 : 6; disc(ctx, c, r, seg, Math.floor(rnd() * seg));
  }
  if (lod >= 3) return;
  for (let k = 0; k < (p.flowers ?? 2); k++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * R * 0.8, c = [Math.cos(a) * d, 0.03, Math.sin(a) * d];
    paint(ctx, rnd() < 0.6 ? "oklch(0.85 0.09 350)" : "oklch(0.97 0.02 90)", 0.6);
    for (let i = 0; i < 6; i++) { const t = (i / 6) * 6.283, u = [Math.cos(t), 0, Math.sin(t)], v = [Math.cos(t + 0.9), 0, Math.sin(t + 0.9)]; triOut(ctx, c, add(c, add(mul(u, 0.1), [0, 0.07, 0])), add(c, add(mul(v, 0.07), [0, 0.03, 0])), [0, 1, 0]); }
    paint(ctx, "oklch(0.86 0.15 95)"); blob(ctx, add(c, [0, 0.03, 0]), 0.03, 0.03, 0.03, 5, 2);
  }
}
function reeds(ctx, p, lod) {
  const n = lod <= 2 ? p.count ?? 26 : lod === 3 ? 12 : 6, R = p.r ?? 0.9, rnd = () => ctx.random();
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * R, base = [Math.cos(a) * d, 0, Math.sin(a) * d], h = (p.h ?? 1.6) * (0.75 + rnd() * 0.5), la = rnd() * 6.283, lean = [Math.cos(la) * 0.2, 0, Math.sin(la) * 0.2];
    const side = norm(cross([lean[0], 1, lean[2]], [0, 0, 1])), w = 0.035, midp = add(base, add([0, h * 0.55, 0], mul(lean, 0.3))), tip = add(base, add([0, h, 0], lean));
    const out = cross(side, [0, 1, 0]);
    paint(ctx, jitColor(ctx, 0.64, 0.11, 125, 0.1, 25), 0.7);
    quadOut(ctx, add(base, mul(side, -w)), add(base, mul(side, w)), add(midp, mul(side, w * 0.6)), add(midp, mul(side, -w * 0.6)), out);
    triOut(ctx, add(midp, mul(side, -w * 0.6)), add(midp, mul(side, w * 0.6)), tip, out);
    if (i % 5 === 0 && lod <= 3) { paint(ctx, "oklch(0.45 0.07 50)", 0.9); cyl(ctx, add(midp, [0, h * 0.2, 0]), add(midp, [lean[0] * 0.2, h * 0.34, lean[2] * 0.2]), 0.032, 0.03, 5, 3); }
  }
}
// ---------- camp ----------
function logSeat(ctx, c, yaw, len, r, lod) {
  const dir = rot([1, 0, 0], yaw), a = sub(c, mul(dir, len / 2)), b = add(c, mul(dir, len / 2));
  paint(ctx, "bark"); cyl(ctx, a, b, r, r * 0.95, lod <= 2 ? 8 : 5, 3, () => paint(ctx, ENDGRAIN));
}
function camp(ctx, p, lod) {
  const rnd = () => ctx.random();
  // fire ring
  if (lod >= 4) { paint(ctx, "stone"); cyl(ctx, [0, 0, 0], [0, 0.22, 0], 0.8, 0.7, 8, 1); }
  else {
    const n = lod <= 2 ? 10 : 7;
    for (let i = 0; i < n; i++) { const a = (i / n) * 360 + rnd() * 12; paint(ctx, "stone", jitColor(ctx, 0.93, 0.01, 80, 0.08, 20)); blob(ctx, [0.62 * Math.cos(a * D), 0.05, 0.62 * Math.sin(a * D)], 0.17 + rnd() * 0.05, 0.13 + rnd() * 0.04, 0.15 + rnd() * 0.05, 5, 3, rnd() * 60); }
    paint(ctx, "oklch(0.32 0.01 60)", 1); disc(ctx, [0, 0.015, 0], 0.52, 9);
    glow(ctx, "oklch(0.6 0.15 45)", 1.8, 0.55, 0.12); disc(ctx, [0, 0.03, 0], 0.28, 7, -1, 0.5, rnd); ctx.emissive(null);
    paint(ctx, "oklch(0.3 0.03 50)", 1);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * 6.283 + 0.3; cyl(ctx, [0.38 * Math.cos(a), 0.02, 0.38 * Math.sin(a)], [0.04 * Math.cos(a), 0.46, 0.04 * Math.sin(a)], 0.05, 0.035, 5, 1); }
  }
  // tripod and pot
  if (lod <= 3) {
    paint(ctx, "bark");
    const apex = [0, 1.62, 0];
    for (const a of [90, 210, 330]) { const b = [0.95 * Math.cos(a * D), 0, 0.95 * Math.sin(a * D)]; cyl(ctx, b, add(apex, mul(norm(sub(apex, b)), 0.12)), 0.035, 0.03, 5, 1); }
    metal(ctx, IRON); cyl(ctx, apex, [0, 1.12, 0], 0.012, 0.012, 3, 0);
    cyl(ctx, [0, 0.72, 0], [0, 1.0, 0], 0.19, 0.23, lod <= 2 ? 9 : 6, 2); cyl(ctx, [0, 0.97, 0], [0, 1.02, 0], 0.245, 0.245, lod <= 2 ? 9 : 6, 0);
    let prev = [-0.24, 1.0, 0]; for (let i = 1; i <= 4; i++) { const t = (i / 4) * Math.PI, pt = [-0.24 * Math.cos(t), 1.0 + 0.12 * Math.sin(t), 0]; cyl(ctx, prev, pt, 0.008, 0.008, 3, 0); prev = pt; }
    paint(ctx, "oklch(0.58 0.12 55)", 0.5); disc(ctx, [0, 0.95, 0], 0.21, 8);
  }
  // log seats
  for (const a of p.seats ?? [85, 175, 310]) logSeat(ctx, [2.25 * Math.cos(a * D), 0.21, 2.25 * Math.sin(a * D)], -a + 90 - 90 + (a % 2 ? 4 : -4) + 90, 1.3, 0.21, lod);
  // woodpile
  const wp = p.woodpile ?? [-3.95, -1.5, 70];
  withXF([wp[0], 0, wp[1]], wp[2], () => {
    if (lod >= 4) { paint(ctx, "bark"); box(ctx, 0, 0, 0, 1.3, 0.6, 0.5); return; }
    for (let k = 0; k < 3; k++) for (let i = 0; i < 5 - k; i++) {
      const x = (i - (4 - k) / 2) * 0.25 + (rnd() - 0.5) * 0.02, y = 0.12 + k * 0.2;
      paint(ctx, "bark", jitColor(ctx, 0.93, 0.02, 60, 0.08, 15)); cyl(ctx, [x, y, -0.26], [x, y, 0.26], 0.12, 0.115, 5, 3, () => paint(ctx, ENDGRAIN));
    }
    paint(ctx, "bark"); for (const sx of [-1, 1]) box(ctx, sx * 0.7, 0, 0, 0.06, 0.75, 0.06);
  });
  // stump + axe
  const st = p.stump ?? [-2.3, 2.75];
  withXF([st[0], 0, st[1]], 20, () => {
    paint(ctx, "bark"); cyl(ctx, [0, 0, 0], [0, 0.42, 0], 0.33, 0.3, lod <= 2 ? 8 : 6, 1, () => paint(ctx, ENDGRAIN));
    if (lod >= 4) return;
    metal(ctx, "oklch(0.62 0.01 250)", 0.7, 0.35); rbox(ctx, [0, 0.45, 0], 0.04, 0.12, 0.2, 0, 0, 0);
    paint(ctx, "oklch(0.74 0.08 70)"); cyl(ctx, [0, 0.47, 0.05], [0, 0.98, 0.5], 0.022, 0.02, 5, 1);
    if (lod <= 2) { paint(ctx, ENDGRAIN); for (let i = 0; i < 5; i++) rbox(ctx, [0.3 + rnd() * 0.4, 0.015, (rnd() - 0.5) * 0.6], 0.08, 0.02, 0.05, rnd() * 180); }
  });
  // lantern on a post
  const lp = p.post ?? [3.0, -1.2];
  withXF([lp[0], 0, lp[1]], 0, () => {
    paint(ctx, "wood"); box(ctx, 0, 0, 0, 0.1, 1.8, 0.1); rbox(ctx, [-0.2, 1.72, 0], 0.45, 0.07, 0.07);
    if (lod <= 3) { metal(ctx, IRON); cyl(ctx, [-0.36, 1.69, 0], [-0.36, 1.55, 0], 0.01, 0.01, 3, 0); lanternHead(ctx, [-0.36, 1.2, 0], lod, 1.3); }
  });
  // a tin mug and a kettle-stone
  if (lod <= 2) {
    paint(ctx, "stone"); blob(ctx, [0.9, 0.08, 1.0], 0.2, 0.1, 0.18, 6, 3);
    metal(ctx, "oklch(0.72 0.02 230)", 0.6, 0.4); cyl(ctx, [0.9, 0.17, 1.0], [0.9, 0.28, 1.0], 0.045, 0.045, 7, 2);
  }
}
function campCollider(ctx, p) {
  cyl(ctx, [0, 0, 0], [0, 0.25, 0], 0.78, 0.7, 8, 3);
  for (const a of p.seats ?? [85, 175, 310]) rbox(ctx, [2.25 * Math.cos(a * D), 0.21, 2.25 * Math.sin(a * D)], 1.3, 0.42, 0.42, -a + 90 + (a % 2 ? 4 : -4));
  const wp = p.woodpile ?? [-3.95, -1.5, 70]; rbox(ctx, [wp[0], 0.35, wp[1]], 1.45, 0.7, 0.55, wp[2]);
  const st = p.stump ?? [-2.3, 2.75]; cyl(ctx, [st[0], 0, st[1]], [st[0], 0.42, st[1]], 0.33, 0.3, 6, 3);
  const lp = p.post ?? [3.0, -1.2]; rbox(ctx, [lp[0], 0.9, lp[1]], 0.12, 1.8, 0.12);
}
// ---------- tent (A-frame, opening to −Z) ----------
function tent(ctx, p, lod) {
  const W = p.w ?? 2.3, H = p.h ?? 1.75, L = p.l ?? 2.7, zf = -L / 2, zb = L / 2, sl = Math.hypot(W / 2, H) + 0.12, ra = Math.atan2(H, W / 2) / D;
  paint(ctx, "canvas");
  rbox(ctx, [W / 4 + 0.03, H / 2 - 0.02, 0], sl, 0.03, L + 0.25, 0, 0, -ra);
  rbox(ctx, [-W / 4 - 0.03, H / 2 - 0.02, 0], sl, 0.03, L + 0.25, 0, 0, ra);
  triOut(ctx, [-W / 2, 0, zb], [W / 2, 0, zb], [0, H, zb], [0, 0, 1]);
  if (lod >= 4) return;
  // flaps tied back
  paint(ctx, "canvas", "oklch(0.95 0.03 80)");
  for (const s of [-1, 1]) {
    const a = [0, H, zf - 0.1], b = [s * W / 2, 0, zf - 0.1], c = [s * (W / 2 + 0.35), 0.05, zf + 0.55];
    triOut(ctx, a, b, c, [s, 0.3, -0.4]);
    if (lod <= 2) { paint(ctx, ROPE); cyl(ctx, [s * (W / 2 - 0.05), 0.55, zf - 0.05], [s * (W / 2 + 0.18), 0.5, zf + 0.25], 0.018, 0.018, 4, 0); paint(ctx, "canvas", "oklch(0.95 0.03 80)"); }
  }
  paint(ctx, "oklch(0.62 0.07 150)", 0.95); rbox(ctx, [0, 0.01, 0.05], W - 0.1, 0.02, L - 0.1);
  paint(ctx, "wood");
  cyl(ctx, [0, 0, zf - 0.12], [0, H + 0.12, zf - 0.12], 0.035, 0.03, 5, 1);
  cyl(ctx, [0, 0, zb + 0.08], [0, H + 0.12, zb + 0.08], 0.035, 0.03, 5, 1);
  cyl(ctx, [0, H + 0.03, zf - 0.2], [0, H + 0.03, zb + 0.15], 0.03, 0.03, 5, 3);
  if (lod <= 2) {
    paint(ctx, ROPE);
    for (const [z, dz] of [[zf - 0.12, -1.1], [zb + 0.08, 1.1]]) { cyl(ctx, [0, H + 0.1, z], [0, 0.02, z + dz], 0.012, 0.012, 3, 0); paint(ctx, "wood"); box(ctx, 0, 0, z + dz, 0.04, 0.12, 0.04); paint(ctx, ROPE); }
    for (const s of [-1, 1]) for (const z of [zf + 0.2, zb - 0.2]) { cyl(ctx, [s * (W / 2 - 0.05), 0.08, z], [s * (W / 2 + 0.45), 0.02, z], 0.01, 0.01, 3, 0); }
  }
  // bedroll + pillow + blanket
  paint(ctx, "oklch(0.62 0.1 35)", 0.95); cyl(ctx, [-0.4, 0.13, zb - 0.35], [-0.4, 0.13, zb - 0.95], 0.12, 0.12, 7, 3);
  paint(ctx, "oklch(0.68 0.09 35)", 0.95); rbox(ctx, [-0.4, 0.06, 0.05], 0.7, 0.07, 1.5);
  paint(ctx, "oklch(0.95 0.02 90)", 0.95); rbox(ctx, [-0.4, 0.13, zb - 0.45], 0.45, 0.1, 0.28);
  paint(ctx, "oklch(0.72 0.08 230)", 0.95); rbox(ctx, [-0.35, 0.11, -0.2], 0.72, 0.04, 0.7, 6);
  if (lod <= 2) { paint(ctx, "oklch(0.55 0.07 80)", 0.9); box(ctx, 0.55, 0.02, zb - 0.5, 0.35, 0.4, 0.25, -10); paint(ctx, "oklch(0.5 0.07 70)"); box(ctx, 0.55, 0.42, zb - 0.5, 0.3, 0.04, 0.22, -10); }
}
function tentCollider(ctx, p) {
  const W = p.w ?? 2.3, H = p.h ?? 1.75, L = p.l ?? 2.7, sl = Math.hypot(W / 2, H) + 0.12, ra = Math.atan2(H, W / 2) / D;
  rbox(ctx, [W / 4 + 0.03, H / 2 - 0.02, 0], sl, 0.08, L + 0.25, 0, 0, -ra);
  rbox(ctx, [-W / 4 - 0.03, H / 2 - 0.02, 0], sl, 0.08, L + 0.25, 0, 0, ra);
  rbox(ctx, [0, H / 2, L / 2 + 0.05], W * 0.6, H, 0.08);
}
// ---------- garden ----------
function vegbed(ctx, p, lod) {
  const w = p.w ?? 1.2, l = p.l ?? 3.6, h = p.h ?? 0.32, crop = p.crop ?? "cabbage", rnd = () => ctx.random(), top = h - 0.04;
  paint(ctx, "wood");
  if (lod >= 4) { box(ctx, 0, 0, 0, w, h, l); paint(ctx, "oklch(0.6 0.13 135)"); box(ctx, 0, h, 0, w - 0.2, 0.25, l - 0.2); return; }
  for (const sx of [-1, 1]) { rbox(ctx, [sx * (w / 2 - 0.03), h / 2, 0], 0.06, h, l); rbox(ctx, [0, h / 2, sx * (l / 2 - 0.03)], w - 0.12, h, 0.06); }
  if (lod <= 2) for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(ctx, sx * (w / 2 - 0.02), 0, sz * (l / 2 - 0.02), 0.09, h + 0.06, 0.09);
  paint(ctx, "soil"); rbox(ctx, [0, top - 0.01, 0], w - 0.1, 0.02, l - 0.1);
  if (crop === "cabbage") {
    for (const x of [-w / 4, w / 4]) for (let z = -l / 2 + 0.35; z < l / 2 - 0.2; z += 0.46) {
      const c = [x + (rnd() - 0.5) * 0.05, top, z + (rnd() - 0.5) * 0.05];
      if (lod <= 2) { paint(ctx, jitColor(ctx, 0.6, 0.13, 138, 0.06, 12), 0.7); blob(ctx, add(c, [0, 0.05, 0]), 0.21, 0.1, 0.21, 7, 3, rnd() * 50); }
      paint(ctx, jitColor(ctx, 0.8, 0.12, 125, 0.05, 10), 0.6); blob(ctx, add(c, [0, 0.11, 0]), 0.13, 0.12, 0.13, lod <= 2 ? 6 : 5, 3);
    }
  } else if (crop === "carrot") {
    for (const x of [-w / 3, 0, w / 3]) for (let z = -l / 2 + 0.2; z < l / 2 - 0.12; z += lod <= 2 ? 0.22 : 0.4) {
      const c = [x + (rnd() - 0.5) * 0.05, top, z];
      paint(ctx, "oklch(0.7 0.16 50)", 0.7); cyl(ctx, add(c, [0, -0.01, 0]), add(c, [0, 0.03, 0]), 0.03, 0.022, 5, 1);
      paint(ctx, jitColor(ctx, 0.66, 0.15, 140, 0.06, 10), 0.7);
      for (let i = 0; i < 3; i++) { const a = rnd() * 6.283, u = [Math.cos(a), 0, Math.sin(a)], hh = 0.2 + rnd() * 0.1; triOut(ctx, add(c, [0, 0.02, 0]), add(c, add(mul(u, 0.09), [0, hh, 0])), add(c, add(mul(rot(u, 40), 0.05), [0, hh * 0.8, 0])), rot(u, 90)); }
    }
  } else {
    for (const x of [-w / 4, w / 4]) for (let z = -l / 2 + 0.45; z < l / 2 - 0.3; z += 0.9) {
      const c = [x, top, z];
      paint(ctx, "wood"); cyl(ctx, c, add(c, [0, 1.25, 0]), 0.02, 0.016, 4, 1);
      for (const [y, r] of [[0.3, 0.2], [0.62, 0.18], [0.92, 0.13]]) { paint(ctx, jitColor(ctx, 0.56, 0.13, 140, 0.06, 12), 0.7); blob(ctx, add(c, [(rnd() - 0.5) * 0.08, y, (rnd() - 0.5) * 0.08]), r, r * 0.8, r, lod <= 2 ? 6 : 5, 3, rnd() * 60); }
      for (let i = 0; i < (lod <= 2 ? 6 : 3); i++) { const a = rnd() * 6.283, y = 0.25 + rnd() * 0.65, ripe = rnd(); paint(ctx, ripe < 0.6 ? "oklch(0.62 0.2 30)" : ripe < 0.85 ? "oklch(0.72 0.17 55)" : "oklch(0.75 0.14 125)", 0.4); blob(ctx, add(c, [Math.cos(a) * 0.17, y, Math.sin(a) * 0.17]), 0.05, 0.045, 0.05, 5, 3); }
      if (lod <= 2) { paint(ctx, ROPE); cyl(ctx, add(c, [0, 0.7, 0]), add(c, [0, 0.72, 0]), 0.03, 0.03, 4, 0); }
    }
  }
}
function vegbedCollider(ctx, p) { const w = p.w ?? 1.2, l = p.l ?? 3.6, h = p.h ?? 0.32; rbox(ctx, [0, h / 2, 0], w, h, l); }
const FLOWERS = ["oklch(0.72 0.16 350)", "oklch(0.86 0.15 95)", "oklch(0.72 0.12 300)", "oklch(0.97 0.02 90)", "oklch(0.7 0.18 40)", "oklch(0.66 0.14 270)", "oklch(0.8 0.1 20)"];
function flowerbed(ctx, p, lod) {
  const rx = p.rx ?? 1.4, rz = p.rz ?? 1, rnd = () => ctx.random(), n = lod <= 2 ? p.count ?? 30 : lod === 3 ? 14 : 6;
  paint(ctx, "soil"); blob(ctx, [0, 0, 0], rx, 0.09, rz, lod <= 2 ? 10 : 6, 2);
  if (lod <= 2) { const per = Math.round((Math.PI * (rx + rz)) / 0.34); for (let i = 0; i < per; i++) { const a = (i / per) * 360; paint(ctx, "stone", jitColor(ctx, 0.93, 0.01, 80, 0.08, 20)); rbox(ctx, [(rx + 0.08) * Math.cos(a * D), 0.05, (rz + 0.08) * Math.sin(a * D)], 0.24, 0.12, 0.14, -a + 90 + (rnd() - 0.5) * 20); } }
  const pal = p.palette ?? FLOWERS;
  for (let i = 0; i < n; i++) {
    const a = rnd() * 6.283, d = Math.sqrt(rnd()) * 0.9, base = [Math.cos(a) * d * rx, 0.05, Math.sin(a) * d * rz], h = 0.2 + rnd() * 0.35, head = add(base, [(rnd() - 0.5) * 0.06, h, (rnd() - 0.5) * 0.06]);
    paint(ctx, "oklch(0.58 0.12 140)", 0.8); if (lod <= 3) cyl(ctx, base, head, 0.01, 0.008, 3, 0);
    paint(ctx, pal[Math.floor(rnd() * pal.length)], 0.7);
    const pr = 0.05 + rnd() * 0.04, k = lod <= 2 ? 5 : 3;
    for (let j = 0; j < k; j++) { const t = (j / k) * 6.283 + a; triOut(ctx, head, add(head, [Math.cos(t - 0.45) * pr, 0.015, Math.sin(t - 0.45) * pr]), add(head, [Math.cos(t + 0.45) * pr, 0.015, Math.sin(t + 0.45) * pr]), [0, 1, 0]); }
    if (lod <= 2) { paint(ctx, "oklch(0.8 0.14 85)"); blob(ctx, add(head, [0, 0.012, 0]), 0.018, 0.015, 0.018, 4, 2); }
  }
  if (lod <= 2) for (let i = 0; i < 8; i++) {
    const a = rnd() * 6.283, c = [Math.cos(a) * rx * 0.95, 0.03, Math.sin(a) * rz * 0.95]; paint(ctx, jitColor(ctx, 0.66, 0.13, 135, 0.08, 15), 0.8);
    for (let j = 0; j < 3; j++) { const t = rnd() * 6.283, u = [Math.cos(t), 0, Math.sin(t)]; triOut(ctx, add(c, rot(u, 90, 0, 0).map((v) => v * 0.03)), add(c, mul(rot(u, 90), -0.03)), add(c, add(mul(u, 0.08), [0, 0.2 + rnd() * 0.1, 0])), u); }
  }
}
function herbspiral(ctx, p, lod) {
  const r = p.r ?? 1.5, h = p.h ?? 0.8, turns = p.turns ?? 1.6, rnd = () => ctx.random();
  paint(ctx, "soil"); cyl(ctx, [0, 0, 0], [0, h - 0.05, 0], r - 0.05, r * 0.28, lod <= 2 ? 10 : 6, 1);
  if (lod >= 4) return;
  const steps = lod <= 2 ? 34 : 18;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1), th = t * turns * 360, rho = r * (1 - 0.72 * t), top = 0.16 + t * (h - 0.1), pos = [rho * Math.cos(th * D), 0, rho * Math.sin(th * D)];
    const layers = lod <= 2 ? Math.min(3, Math.ceil(top / 0.16)) : 1;
    for (let k = 0; k < layers; k++) { const lh = top / layers; paint(ctx, "stone", jitColor(ctx, 0.93, 0.012, 75, 0.1, 25)); rbox(ctx, [pos[0], lh * (k + 0.5), pos[2]], 0.3, lh - 0.015, 0.2, -th + (rnd() - 0.5) * 16 + (k % 2) * 8); }
  }
  const herbs = [["oklch(0.6 0.08 150)", "blob"], ["oklch(0.66 0.12 130)", "blob"], ["oklch(0.62 0.12 300)", "spike"], ["oklch(0.62 0.13 140)", "spike"], ["oklch(0.7 0.07 160)", "blob"]];
  for (let i = 0; i < (lod <= 2 ? 14 : 7); i++) {
    const t = (i + 0.5) / 14, th = t * turns * 360 + 20, rho = r * (1 - 0.72 * t) - 0.22, y = 0.16 + t * (h - 0.1), c = [Math.max(0.05, rho) * Math.cos(th * D), y, Math.max(0.05, rho) * Math.sin(th * D)], [col, kind] = herbs[i % herbs.length];
    paint(ctx, col, 0.8);
    if (kind === "blob") blob(ctx, c, 0.14, 0.1, 0.14, 6, 3, rnd() * 60);
    else for (let j = 0; j < 5; j++) { const a = rnd() * 6.283, b = add(c, [Math.cos(a) * 0.06, 0, Math.sin(a) * 0.06]); cyl(ctx, b, add(b, [Math.cos(a) * 0.04, 0.22 + rnd() * 0.1, Math.sin(a) * 0.04]), 0.015, 0.008, 3, 1); }
  }
}
function fence(ctx, p, lod) {
  const pts = p.points ?? [], H = p.h ?? 0.6;
  for (let s = 0; s < pts.length - 1; s++) {
    const a = pts[s], b = pts[s + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz), yaw = Math.atan2(-dz, dx) / D, n = lod <= 3 ? Math.max(1, Math.round(len / 1.8)) : 1;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, m = [a[0] + dx * (t0 + t1) / 2, 0, a[1] + dz * (t0 + t1) / 2], bl = len / n, bow = lod <= 2 ? ((i + s) % 2 ? 1.5 : -1.5) : 0;
      paint(ctx, "wattle"); rbox(ctx, [m[0], 0.08 + H / 2, m[2]], bl - 0.03, H, 0.07, yaw + bow);
      if (lod <= 2) { paint(ctx, "bark", "oklch(0.9 0.03 60)"); cyl(ctx, [a[0] + dx * t0, H + 0.1, a[1] + dz * t0], [a[0] + dx * t1, H + 0.11, a[1] + dz * t1], 0.03, 0.03, 4, 0); }
    }
    paint(ctx, "bark");
    const sn = lod <= 2 ? n * 3 : lod === 3 ? n : 0;
    for (let i = 0; i <= sn; i++) { const t = sn ? i / sn : 0, x = a[0] + dx * t, z = a[1] + dz * t; cyl(ctx, [x, 0, z], [x, H + 0.22 + (i % 2) * 0.05, z], 0.035, 0.03, 4, 1); }
  }
  const g = p.gate;
  if (g && lod <= 3) {
    paint(ctx, "bark");
    for (const q of g) cyl(ctx, [q[0], 0, q[1]], [q[0], 1.45, q[1]], 0.055, 0.05, 5, 1);
    const c = [(g[0][0] + g[1][0]) / 2, 1.4, (g[0][1] + g[1][1]) / 2], hx = (g[1][0] - g[0][0]) / 2, hz = (g[1][1] - g[0][1]) / 2, rr = Math.hypot(hx, hz);
    let prev = [g[0][0], 1.4, g[0][1]];
    for (let i = 1; i <= 6; i++) {
      const t = (i / 6) * Math.PI, pt = [c[0] - hx * Math.cos(t), 1.4 + rr * 0.8 * Math.sin(t), c[2] - hz * Math.cos(t)];
      paint(ctx, "bark"); cyl(ctx, prev, pt, 0.035, 0.035, 4, 0);
      if (lod <= 2 && i < 6) { paint(ctx, "oklch(0.58 0.12 140)", 0.8); blob(ctx, pt, 0.12, 0.09, 0.12, 5, 3); paint(ctx, "oklch(0.75 0.15 355)", 0.6); blob(ctx, add(pt, [0.05, 0.06, 0.04]), 0.045, 0.04, 0.045, 5, 2); }
      prev = pt;
    }
  }
}
function fenceCollider(ctx, p) {
  const pts = p.points ?? [], H = p.h ?? 0.6;
  for (let s = 0; s < pts.length - 1; s++) { const a = pts[s], b = pts[s + 1], dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz); rbox(ctx, [(a[0] + b[0]) / 2, (H + 0.2) / 2, (a[1] + b[1]) / 2], len, H + 0.2, 0.12, Math.atan2(-dz, dx) / D); }
}
function birdbath(ctx, p, lod) {
  const n = lod <= 2 ? 10 : 6;
  paint(ctx, "stone");
  cyl(ctx, [0, 0, 0], [0, 0.08, 0], 0.24, 0.2, n, 1); cyl(ctx, [0, 0.08, 0], [0, 0.72, 0], 0.1, 0.08, n, 0);
  cyl(ctx, [0, 0.7, 0], [0, 0.86, 0], 0.12, 0.42, n, 0); cyl(ctx, [0, 0.86, 0], [0, 0.9, 0], 0.43, 0.43, n, 1);
  paint(ctx, "oklch(0.76 0.07 200)", 0.1); disc(ctx, [0, 0.905, 0], 0.37, n);
  if (lod >= 3) return;
  const b = [0.37, 0.97, 0.05];
  paint(ctx, "oklch(0.55 0.08 50)", 0.8); blob(ctx, b, 0.07, 0.055, 0.05, 6, 3);
  paint(ctx, "oklch(0.7 0.15 45)", 0.8); blob(ctx, add(b, [-0.035, -0.005, 0]), 0.04, 0.04, 0.04, 5, 3);
  paint(ctx, "oklch(0.52 0.07 50)", 0.8); blob(ctx, add(b, [-0.065, 0.055, 0]), 0.035, 0.035, 0.035, 5, 3);
  paint(ctx, "oklch(0.8 0.14 85)"); cyl(ctx, add(b, [-0.095, 0.055, 0]), add(b, [-0.13, 0.05, 0]), 0.012, 0, 4, 0);
  paint(ctx, "oklch(0.45 0.06 50)"); triOut(ctx, add(b, [0.05, 0.01, -0.02]), add(b, [0.05, 0.01, 0.02]), add(b, [0.14, 0.05, 0]), [0, 1, 0]);
}
function wheelbarrow(ctx, p, lod) {
  paint(ctx, "wood");
  if (lod >= 4) { box(ctx, 0, 0.3, 0, 0.6, 0.3, 0.8); return; }
  rbox(ctx, [0, 0.42, 0.05], 0.5, 0.03, 0.62);
  for (const sx of [-1, 1]) rbox(ctx, [sx * 0.3, 0.53, 0.05], 0.03, 0.24, 0.66, 0, 0, -sx * 18);
  rbox(ctx, [0, 0.53, 0.38], 0.62, 0.24, 0.03, 0, -14, 0); rbox(ctx, [0, 0.52, -0.3], 0.6, 0.26, 0.03, 0, 30, 0);
  for (const sx of [-1, 1]) { cyl(ctx, [sx * 0.2, 0.36, -0.52], [sx * 0.29, 0.52, 0.95], 0.022, 0.022, 5, 3); box(ctx, sx * 0.21, 0, 0.35, 0.04, 0.4, 0.04); }
  paint(ctx, "oklch(0.58 0.14 32)", 0.6); cyl(ctx, [-0.035, 0.2, -0.55], [0.035, 0.2, -0.55], 0.2, 0.2, lod <= 2 ? 10 : 7, 3);
  metal(ctx, IRON); cyl(ctx, [-0.2, 0.2, -0.55], [0.2, 0.2, -0.55], 0.015, 0.015, 4, 0);
  if (lod <= 2) {
    paint(ctx, "soil"); blob(ctx, [0, 0.46, 0.1], 0.24, 0.12, 0.28, 6, 3);
    paint(ctx, "oklch(0.62 0.13 138)", 0.7); blob(ctx, [0.08, 0.6, 0.02], 0.13, 0.1, 0.13, 6, 3); blob(ctx, [-0.1, 0.58, 0.2], 0.12, 0.09, 0.12, 6, 3);
    metal(ctx, "oklch(0.7 0.01 250)", 0.7, 0.35); rbox(ctx, [0.02, 0.62, 0.3], 0.06, 0.01, 0.12, 20, -30);
    paint(ctx, "wood"); cyl(ctx, [0.03, 0.66, 0.37], [0.05, 0.72, 0.47], 0.015, 0.015, 4, 1);
  }
}
function lantern(ctx, p, lod) {
  const h = p.h ?? 0.62;
  metal(ctx, IRON); box(ctx, 0, 0, 0, 0.045, h, 0.045);
  if (lod <= 2) rbox(ctx, [0, 0.015, 0], 0.12, 0.03, 0.12);
  lanternHead(ctx, [0, h, 0], lod, 0.9);
}
function stones(ctx, p, lod) {
  const pts = p.points ?? [], rnd = () => ctx.random(), n = lod <= 2 ? 7 : 5;
  for (const [x, z] of pts) {
    const r = 0.22 + rnd() * 0.1, c = [x, 0.05, z], v = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.283 + rnd() * 0.3, rr = r * (0.8 + rnd() * 0.35); v.push([x + Math.cos(a) * rr, 0.05, z + Math.sin(a) * rr]); }
    paint(ctx, "stone", jitColor(ctx, 0.93, 0.01, 80, 0.08, 20));
    for (let i = 0; i < n; i++) { const a = v[i], b = v[(i + 1) % n]; triOut(ctx, c, a, b, [0, 1, 0]); if (lod <= 3) quadOut(ctx, [a[0], -0.02, a[2]], [b[0], -0.02, b[2]], b, a, [(a[0] + b[0]) / 2 - x, 0, (a[2] + b[2]) / 2 - z]); }
  }
}
const B = { dock, boat, fishspot, lilies, reeds, camp, tent, vegbed, flowerbed, herbspiral, fence, birdbath, wheelbarrow, lantern, stones, bench: (ctx, p, lod) => bench(ctx, lod, p.w ?? 1.5) };
const C = {
  dock: dockCollider, boat: boatCollider, camp: campCollider, tent: tentCollider, vegbed: vegbedCollider, fence: fenceCollider,
  bench: (ctx, p) => rbox(ctx, [0, 0.45, 0.05], p.w ?? 1.5, 0.9, 0.5),
  birdbath: (ctx) => cyl(ctx, [0, 0, 0], [0, 0.9, 0], 0.3, 0.3, 6, 3),
  wheelbarrow: (ctx) => rbox(ctx, [0, 0.35, 0.1], 0.65, 0.7, 1.4),
  herbspiral: (ctx, p) => cyl(ctx, [0, 0, 0], [0, (p.h ?? 0.8) * 0.6, 0], p.r ?? 1.5, (p.r ?? 1.5) * 0.5, 8, 3),
  fishspot: (ctx) => rbox(ctx, [0, 0.15, 0.3], 0.4, 0.3, 0.4),
  lantern: (ctx, p) => rbox(ctx, [0, (p.h ?? 0.62) / 2, 0], 0.08, p.h ?? 0.62, 0.08),
};
export function geometry(ctx) {
  const p = ctx.params || {}; XF = null; ctx.flat();
  const f = B[p.kind]; if (f) f(ctx, p, ctx.lod || 1);
  ctx.albedo(null); ctx.emissive(null);
}
export function collider(ctx) {
  const p = ctx.params || {}; XF = null;
  const f = C[p.kind]; if (!f) return null;
  f(ctx, p);
}
