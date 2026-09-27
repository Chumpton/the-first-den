// The Catio — one scripted file, two parts: params.part "shell" (the enclosure, its furniture, the tunnel to the house) and
// "door" (the screen-door leaf, origin at its hinge). Local frame and layout: ./catio-layout.js. Faces wound by road-solid.
import { Q, solid, box, ngon, gem } from '../lib/road-solid.js';
import { C, roofY, SHELVES, RAMP, TREE, HAMMOCK, CUSHIONS, POTS, BOWL } from './catio-layout.js';
const XW = 2.455, ZW = 1.955;
const TX = { wood: 'cdn/texture-weathered-honey-oak-planks.png', stone: 'cdn/texture-pale-limestone-pavers.png' };
const COL = {
  timber: 'oklch(0.9 0.035 70)', oak: 'oklch(0.96 0.06 75)', stone: 'oklch(0.97 0.012 85)', joint: 'oklch(0.72 0.02 80)',
  shingle: ['oklch(0.62 0.07 48)', 'oklch(0.57 0.06 55)', 'oklch(0.66 0.07 42)'], shingleGap: 'oklch(0.3 0.03 45)',
  wire: 'oklch(0.27 0.01 250)', pane: 'oklch(0.6 0.01 240)', sisal: 'oklch(0.82 0.07 85)', sisalDark: 'oklch(0.68 0.07 75)',
  linen: 'oklch(0.93 0.025 85)', sage: 'oklch(0.72 0.06 140)', sageDeep: 'oklch(0.6 0.06 145)', terracotta: 'oklch(0.63 0.11 45)',
  soil: 'oklch(0.33 0.04 50)', leaf: 'oklch(0.6 0.11 140)', grass: 'oklch(0.72 0.15 128)', lilac: 'oklch(0.75 0.09 300)',
  water: 'oklch(0.72 0.08 200)', ceramic: 'oklch(0.8 0.05 150)', walnut: 'oklch(0.42 0.05 55)', brass: 'oklch(0.76 0.11 85)', iron: 'oklch(0.3 0.01 60)', toy: 'oklch(0.66 0.17 20)',
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return mul(a, 1 / l); };
function paint(ctx, kind, col) { ctx.albedo(kind ? TX[kind] : null); ctx.color(col); }
function beam(ctx, a, b, w, h) {
  const d = norm(sub(b, a)); let u = cross(d, [0, 1, 0]); if (Math.hypot(...u) < 1e-3) u = [1, 0, 0]; u = norm(u); const v = cross(u, d);
  const ring = (p) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => add(p, add(mul(u, (i * w) / 2), mul(v, (j * h) / 2))));
  solid(ctx, ring(a), ring(b));
}
function frustum(ctx, cx, cz, y0, y1, r0, r1, n, caps = true) {
  solid(ctx, ngon(n, r0, cx, cz).map(([x, z]) => [x, y0, z]), ngon(n, r1, cx, cz).map(([x, z]) => [x, y1, z]), caps);
}
function disc(ctx, cx, y, cz, r, n) { const p = ngon(n, r, cx, cz); for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.tri(cx, y, cz, p[j][0], y, p[j][1], p[i][0], y, p[i][1]); } }
function wire(ctx, a, b, nrm, w) { const s = mul(norm(cross(norm(sub(b, a)), nrm)), w / 2); ctx.quad(...sub(a, s), ...sub(b, s), ...add(b, s), ...add(a, s)); }
// a wire-mesh panel on a plane: P(a, y) → point, from a0..a1, y0 up to top(a) (linear); pane + a grid of thin dark wires
function meshPanel(ctx, P, nrm, a0, a1, y0, top, sp) {
  const t0 = top(a0), t1 = top(a1);
  ctx.albedo(null); ctx.color(COL.pane, 0.13); ctx.quad(...P(a0, y0), ...P(a1, y0), ...P(a1, t1), ...P(a0, t0));
  if (!sp) return;
  ctx.color(COL.wire); const off = mul(nrm, 0.004), Po = (a, y) => add(P(a, y), off);
  for (let a = Math.ceil((a0 + 0.01) / sp) * sp; a < a1 - 0.01; a += sp) wire(ctx, Po(a, y0), Po(a, top(a)), nrm, 0.007);
  for (let y = y0 + sp; y < Math.max(t0, t1) - 0.01; y += sp) {
    let lo = a0, hi = a1;
    if (t0 < y && t1 < y) continue;
    if (t0 < y || t1 < y) { const ac = a0 + ((y - t0) / (t1 - t0)) * (a1 - a0); if (t0 < y) lo = ac; else hi = ac; }
    wire(ctx, Po(lo, y), Po(hi, y), nrm, 0.007);
  }
}
// a flat (horizontal) mesh panel, x0..x1 by z0..z1 at y(z)
function meshRoof(ctx, x0, x1, z0, z1, yz, sp) {
  ctx.albedo(null); ctx.color(COL.pane, 0.13); ctx.quad(x0, yz(z0), z0, x1, yz(z0), z0, x1, yz(z1), z1, x0, yz(z1), z1);
  if (!sp) return;
  ctx.color(COL.wire); const up = [0, 1, 0];
  for (let x = Math.ceil((x0 + 0.01) / sp) * sp; x < x1; x += sp) wire(ctx, [x, yz(z0) + 0.004, z0], [x, yz(z1) + 0.004, z1], up, 0.007);
  for (let z = Math.ceil((z0 + 0.01) / sp) * sp; z < z1; z += sp) wire(ctx, [x0, yz(z) + 0.004, z], [x1, yz(z) + 0.004, z], up, 0.007);
}
const rng = (ctx) => () => ctx.random();

function walls(ctx, sp, lod) {
  const yb = C.deck;
  const F = (a, y) => [a, y, -ZW], B = (a, y) => [a, y, ZW], L = (a, y) => [-XW, y, a], R = (a, y) => [XW, y, a];
  const topF = () => roofY(-ZW), topB = () => roofY(ZW), topS = (z) => roofY(z);
  const { x0: tx0, x1: tx1, y0: ty0, y1: ty1 } = C.tunnel, d = C.door;
  meshPanel(ctx, F, [0, 0, -1], -XW, XW, yb, topF, sp);
  meshPanel(ctx, B, [0, 0, 1], -XW, tx0 - 0.04, yb, topB, sp);
  meshPanel(ctx, B, [0, 0, 1], tx1 + 0.04, XW, yb, topB, sp);
  meshPanel(ctx, B, [0, 0, 1], tx0 - 0.04, tx1 + 0.04, yb, () => ty0 - 0.02, sp);
  meshPanel(ctx, B, [0, 0, 1], tx0 - 0.04, tx1 + 0.04, ty1 + 0.02, topB, sp);
  meshPanel(ctx, L, [-1, 0, 0], -ZW, d.z0 - 0.05, yb, topS, sp);
  meshPanel(ctx, L, [-1, 0, 0], d.z1 + 0.05, ZW, yb, topS, sp);
  meshPanel(ctx, L, [-1, 0, 0], d.z0 - 0.05, d.z1 + 0.05, d.h + 0.07, topS, sp);
  meshPanel(ctx, R, [1, 0, 0], -ZW, ZW, yb, topS, sp);
  // frame: posts, rails, plates
  paint(ctx, 'wood', COL.timber);
  const post = (x, z) => box(ctx, x - 0.045, yb, z - 0.045, x + 0.045, roofY(z) - 0.02, z + 0.045);
  for (const x of C.postsFB) { post(Math.sign(x) * Math.min(Math.abs(x), XW), -ZW); post(Math.sign(x) * Math.min(Math.abs(x), XW), ZW); }
  const inner = lod <= 3;
  for (const z of [-1.2, -0.1, 0.95]) post(-XW, z);
  post(XW, 0); if (inner) { post(XW, -1.0); post(XW, 1.0); }
  // plates
  box(ctx, -XW - 0.05, roofY(-ZW) - 0.1, -ZW - 0.04, XW + 0.05, roofY(-ZW) - 0.02, -ZW + 0.04);
  box(ctx, -XW - 0.05, roofY(ZW) - 0.1, ZW - 0.04, XW + 0.05, roofY(ZW) - 0.02, ZW + 0.04);
  for (const x of [-XW, XW]) beam(ctx, [x, roofY(-ZW) - 0.06, -ZW], [x, roofY(ZW) - 0.06, ZW], 0.08, 0.08);
  if (!inner) return;
  // bottom and mid rails (the door gap open)
  const rail = (x0, z0, x1, z1, y0, y1) => box(ctx, x0, y0, z0, x1, y1, z1);
  for (const [y0, y1] of [[yb, yb + 0.09], [0.95, 1.01]]) {
    rail(-XW, -ZW - 0.035, XW, -ZW + 0.035, y0, y1);
    rail(-XW, ZW - 0.035, XW, ZW + 0.035, y0, y1);
    rail(XW - 0.035, -ZW, XW + 0.035, ZW, y0, y1);
    rail(-XW - 0.035, -ZW, -XW + 0.035, d.z0 - 0.045, y0, y1);
    rail(-XW - 0.035, d.z1 + 0.045, -XW + 0.035, ZW, y0, y1);
  }
  // door header, threshold, the tunnel's framed opening
  box(ctx, -XW - 0.05, d.h, d.z0 - 0.05, -XW + 0.05, d.h + 0.08, d.z1 + 0.05);
  paint(ctx, 'wood', COL.oak); box(ctx, -XW - 0.06, yb, d.z0, -XW + 0.06, yb + 0.02, d.z1);
  paint(ctx, 'wood', COL.timber);
  box(ctx, tx0 - 0.06, ty0 - 0.06, ZW - 0.04, tx1 + 0.06, ty0 - 0.01, ZW + 0.04);
  box(ctx, tx0 - 0.06, ty1 + 0.01, ZW - 0.04, tx1 + 0.06, ty1 + 0.06, ZW + 0.04);
  // corner braces on the side walls
  if (lod <= 2) for (const [x, z, dz] of [[XW, -ZW, 1], [XW, ZW, -1], [-XW, ZW, -1]]) beam(ctx, [x, roofY(z) - 0.1, z + dz * 0.05], [x, roofY(z) - 0.5, z + dz * 0.45], 0.05, 0.05);
}

function roof(ctx, sp, lod) {
  const z0 = -ZW - 0.25, z1 = ZW + 0.2, x0 = -XW - 0.2, x1 = XW + 0.2, top = (z) => roofY(z) + 0.02;
  paint(ctx, 'wood', COL.timber);
  for (const x of [-XW, -1.25, 0, 1.25, XW]) beam(ctx, [x, top(z0) - 0.04, z0], [x, top(z1) - 0.04, z1], 0.06, 0.08);
  box(ctx, x0, top(z0) - 0.12, z0 - 0.03, x1, top(z0) + 0.0, z0);
  // front half: open to the sky through wire mesh
  meshRoof(ctx, x0, x1, z0, 0, (z) => top(z) + 0.001, sp);
  // back half: sheathing, then shingle rows low to high
  const sh = (z) => top(z) + 0.02;
  paint(ctx, 'wood', COL.timber); solid(ctx,
    [[x0, top(0), 0], [x1, top(0), 0], [x1, top(z1), z1], [x0, top(z1), z1]],
    [[x0, sh(0), 0], [x1, sh(0), 0], [x1, sh(z1), z1], [x0, sh(z1), z1]]);
  const rows = lod <= 2 ? 11 : lod === 3 ? 5 : 1, step = (z1 + 0.04) / rows;
  for (let i = 0; i < rows; i++) {
    const lo = -0.04 + i * step, hi = Math.min(z1, lo + step + 0.06), b = (z) => sh(z) + 0.004 + (i % 2) * 0.004, tl = rows > 1 ? 0.04 : 0.03, th = 0.01;
    paint(ctx, 'wood', COL.shingle[i % 3]);
    solid(ctx, [[x0 - 0.02, b(lo), lo], [x1 + 0.02, b(lo), lo], [x1 + 0.02, b(hi), hi], [x0 - 0.02, b(hi), hi]],
      [[x0 - 0.02, b(lo) + tl, lo], [x1 + 0.02, b(lo) + tl, lo], [x1 + 0.02, b(hi) + th, hi], [x0 - 0.02, b(hi) + th, hi]]);
    if (lod <= 2) { ctx.albedo(null); ctx.color(COL.shingleGap); for (let x = x0 + 0.1 + (i % 2) * 0.11; x < x1; x += 0.22) ctx.quad(x - 0.006, b(lo), lo - 0.002, x + 0.006, b(lo), lo - 0.002, x + 0.006, b(lo) + tl, lo - 0.002, x - 0.006, b(lo) + tl, lo - 0.002); }
  }
  // flashing where the shingles meet the open mesh
  if (lod <= 3) { paint(ctx, null, COL.sageDeep); box(ctx, x0 - 0.03, sh(-0.06) - 0.01, -0.07, x1 + 0.03, sh(-0.06) + 0.05, -0.03); }
}

function tunnel(ctx, sp, lod, L) {
  const { x0, x1, y0, y1 } = C.tunnel, za = ZW, zb = ZW + L;
  paint(ctx, 'wood', COL.oak); box(ctx, x0 - 0.02, y0 - 0.05, za, x1 + 0.02, y0, zb - 0.03);
  paint(ctx, 'wood', COL.timber);
  for (const [x, y] of [[x0, y1], [x1, y1]]) box(ctx, x - 0.02, y - 0.02, za, x + 0.02, y + 0.02, zb - 0.03);
  for (const [x, y] of [[x0, y0 + 0.02], [x1, y0 + 0.02]]) box(ctx, x - 0.02, y0, za, x + 0.02, y0 + 0.04, zb - 0.03);
  if (lod <= 3) for (let z = za + 0.6; z < zb - 0.2; z += 0.6) { box(ctx, x0 - 0.025, y0, z - 0.02, x0 + 0.015, y1, z + 0.02); box(ctx, x1 - 0.015, y0, z - 0.02, x1 + 0.025, y1, z + 0.02); box(ctx, x0, y1 - 0.02, z - 0.02, x1, y1 + 0.02, z + 0.02); }
  const zs = (a) => a;
  meshPanel(ctx, (a, y) => [x0, y, a], [-1, 0, 0], za, zb - 0.03, y0, () => y1, sp);
  meshPanel(ctx, (a, y) => [x1, y, a], [1, 0, 0], za, zb - 0.03, y0, () => y1, sp);
  meshRoof(ctx, x0, x1, za, zb - 0.03, () => y1 + 0.02, sp);
  // one post and a knee brace near the catio; the house end hangs on a wall plate
  paint(ctx, 'wood', COL.timber); const pz = za + Math.min(1.0, L * 0.3), px = (x0 + x1) / 2;
  box(ctx, px - 0.045, 0, pz - 0.045, px + 0.045, y0 - 0.05, pz + 0.045);
  if (lod <= 3) { beam(ctx, [px, y0 - 0.5, pz + 0.04], [px, y0 - 0.06, pz + 0.45], 0.05, 0.05); paint(ctx, 'stone', COL.stone); box(ctx, px - 0.12, 0, pz - 0.12, px + 0.12, 0.08, pz + 0.12); }
  paint(ctx, 'wood', COL.walnut); box(ctx, x0 - 0.12, y0 - 0.12, zb - 0.04, x1 + 0.12, y1 + 0.12, zb);
  if (lod <= 3) {
    paint(ctx, null, COL.iron); beam(ctx, [x0 - 0.1, y0 - 0.1, zb - 0.02], [x0 - 0.1, y0 - 0.1, zb - 0.45], 0.03, 0.03); beam(ctx, [x1 + 0.1, y0 - 0.1, zb - 0.02], [x1 + 0.1, y0 - 0.1, zb - 0.45], 0.03, 0.03);
    // the cat flap on the house side
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, n = 8, r = 0.15, z = zb - 0.045;
    ctx.albedo(null); ctx.color(COL.walnut); const p = ngon(n, r).map(([a, b]) => [cx + a, cy + b, z]);
    ctx.color('oklch(0.28 0.03 55)'); for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.tri(cx, cy, z, ...p[i], ...p[j]); }
    ctx.color(COL.brass); box(ctx, cx - 0.12, cy + r - 0.01, z - 0.012, cx + 0.12, cy + r + 0.015, z);
  }
}

function deck(ctx, lod) {
  paint(ctx, 'stone', COL.stone); box(ctx, -XW - 0.1, 0, -ZW - 0.1, XW + 0.1, C.deck, ZW + 0.1);
  box(ctx, -XW - 0.5, 0, C.door.z0 - 0.05, -XW - 0.1, 0.06, C.door.z1 + 0.05);
  if (lod <= 2) { ctx.albedo(null); ctx.color(COL.joint); const y = C.deck + 0.002;
    for (let x = -XW + 0.5; x < XW; x += 0.6) ctx.quad(x - 0.008, y, ZW + 0.1, x + 0.008, y, ZW + 0.1, x + 0.008, y, -ZW - 0.1, x - 0.008, y, -ZW - 0.1);
    for (let z = -ZW + 0.5; z < ZW; z += 0.6) ctx.quad(XW + 0.1, y, z - 0.008, XW + 0.1, y, z + 0.008, -XW - 0.1, y, z + 0.008, -XW - 0.1, y, z - 0.008); }
}

function shelves(ctx, lod) {
  SHELVES.forEach(([x0, x1, top, z0, z1], i) => {
    paint(ctx, 'wood', COL.oak); box(ctx, x0, top - 0.045, z0, x1, top, z1);
    if (lod <= 2 && i % 2 === 0) { ctx.albedo(null); ctx.color(COL.sage); const y = top + 0.003; ctx.quad(x0 + 0.03, y, z1 - 0.03, x1 - 0.03, y, z1 - 0.03, x1 - 0.03, y, z0 + 0.03, x0 + 0.03, y, z0 + 0.03); }
    if (lod > 3) return;
    paint(ctx, 'wood', COL.timber);
    const y1 = top - 0.045, y0 = y1 - 0.2;
    if (z1 > 1.8 || z0 < -1.8) { const wz = z1 > 1.8 ? ZW - 0.04 : -ZW + 0.04, oz = z1 > 1.8 ? z0 + 0.04 : z1 - 0.04;
      for (const x of [x0 + 0.08, x1 - 0.08]) solid(ctx, [[x - 0.015, y1, wz], [x - 0.015, y1, oz], [x - 0.015, y0, wz]], [[x + 0.015, y1, wz], [x + 0.015, y1, oz], [x + 0.015, y0, wz]]);
    } else { const wx = XW - 0.04, ox = x0 + 0.04;
      for (const z of [z0 + 0.1, z1 - 0.1]) solid(ctx, [[wx, y1, z - 0.015], [ox, y1, z - 0.015], [wx, y0, z - 0.015]], [[wx, y1, z + 0.015], [ox, y1, z + 0.015], [wx, y0, z + 0.015]]); }
  });
  // the ramp up to the low back shelf, cleated
  const a = RAMP.a, b = RAMP.b, dn = [0, -0.02, 0];
  paint(ctx, 'wood', COL.oak); beam(ctx, add(a, dn), add(b, dn), 0.03, RAMP.w);
  if (lod <= 2) { paint(ctx, 'wood', COL.timber); for (let t = 0.12; t < 0.95; t += 0.14) { const p = add(a, mul(sub(b, a), t)); box(ctx, p[0] - 0.012, p[1] - 0.005, p[2] - RAMP.w / 2 + 0.02, p[0] + 0.012, p[1] + 0.015, p[2] + RAMP.w / 2 - 0.02); } }
}

function sisal(ctx, cx, cz, y0, y1, lod) {
  const n = lod <= 2 ? 8 : 6, r = 0.05;
  if (lod > 2) { paint(ctx, null, COL.sisal); frustum(ctx, cx, cz, y0, y1, r, r, n); return; }
  const band = lod === 1 ? 0.045 : 0.09; ctx.albedo(null);
  let k = 0; for (let y = y0; y < y1 - 0.001; y += band, k++) { ctx.color(k % 2 ? COL.sisalDark : COL.sisal); frustum(ctx, cx, cz, y, Math.min(y1, y + band), k % 2 ? r : r + 0.004, k % 2 ? r : r + 0.004, n, false); }
  ctx.color(COL.sisal); disc(ctx, cx, y1, cz, r, n);
}
function catTree(ctx, lod) {
  const [bx, bz, bs] = TREE.base, h = bs / 2;
  paint(ctx, 'wood', COL.oak); box(ctx, bx - h, C.deck, bz - h, bx + h, C.deck + 0.05, bz + h);
  ctx.albedo(null); ctx.color(COL.sage); box(ctx, bx - h + 0.02, C.deck + 0.05, bz - h + 0.02, bx + h - 0.02, C.deck + 0.07, bz + h - 0.02);
  sisal(ctx, TREE.postA[0], TREE.postA[1], C.deck + 0.07, TREE.postA[2], lod);
  sisal(ctx, TREE.postB[0], TREE.postB[1], C.deck + 0.07, TREE.postB[2], lod);
  const plat = (p, r, carpet) => { paint(ctx, 'wood', COL.oak); frustum(ctx, p[1] === undefined ? 0 : p[0], p[2], p[1] - 0.05, p[1] - 0.015, r, r, 8); ctx.albedo(null); ctx.color(carpet); frustum(ctx, p[0], p[2], p[1] - 0.015, p[1], r - 0.01, r - 0.02, 8); };
  plat([TREE.t1[0], TREE.t1[1], TREE.t1[2]], 0.28, COL.linen);
  plat([TREE.t2[0], TREE.t2[1], TREE.t2[2]], 0.2, COL.sage);
  // the top bed: a round basket with a rim
  const [x3, y3, z3] = TREE.t3; paint(ctx, 'wood', COL.oak); frustum(ctx, x3, z3, y3 - 0.06, y3 - 0.02, 0.25, 0.25, 10);
  ctx.albedo(null); ctx.color(COL.linen); frustum(ctx, x3, z3, y3 - 0.02, y3 + 0.01, 0.22, 0.21, 10);
  if (lod <= 3) { ctx.color(COL.sageDeep); for (let i = 0; i < 10; i++) { const a0 = (i / 10) * Math.PI * 2, a1 = ((i + 1) / 10) * Math.PI * 2; beam(ctx, [x3 + Math.cos(a0) * 0.235, y3 + 0.03, z3 + Math.sin(a0) * 0.235], [x3 + Math.cos(a1) * 0.235, y3 + 0.03, z3 + Math.sin(a1) * 0.235], 0.05, 0.08); } }
  // a dangling pompom under the middle platform
  if (lod <= 2) { const [x2, y2, z2] = TREE.t2, px = x2 - 0.12, pz = z2 + 0.08; ctx.color(COL.linen); beam(ctx, [px, y2 - 0.05, pz], [px, y2 - 0.36, pz], 0.006, 0.006); ctx.color(COL.toy); gem(ctx, px, y2 - 0.39, pz, 0.035, 0.035, 0.035, 6); }
}
function hammock(ctx, lod) {
  const { x0, x1, z, depth, y, sag } = HAMMOCK, px0 = x0 - 0.06, px1 = x1 + 0.06, ph = y + 0.1;
  paint(ctx, 'wood', COL.oak);
  for (const px of [px0, px1]) { box(ctx, px - 0.025, C.deck, z - 0.025, px + 0.025, ph, z + 0.025); box(ctx, px - 0.03, C.deck, z - depth / 2 - 0.03, px + 0.03, C.deck + 0.04, z + depth / 2 + 0.03); }
  box(ctx, px0, C.deck, z - 0.02, px1, C.deck + 0.04, z + 0.02);
  const nx = lod <= 2 ? 8 : 4, pts = [];
  for (let i = 0; i <= nx; i++) { const t = i / nx, x = x0 + (x1 - x0) * t, yc = y - sag * 4 * t * (1 - t); pts.push([[x, yc + 0.04, z - depth / 2], [x, yc, z], [x, yc + 0.04, z + depth / 2]]); }
  ctx.albedo(null);
  for (let i = 0; i < nx; i++) for (let k = 0; k < 2; k++) { ctx.color(i % 2 ? COL.linen : COL.sage); ctx.quad(...pts[i][k], ...pts[i + 1][k], ...pts[i + 1][k + 1], ...pts[i][k + 1]); }
  ctx.color(COL.linen);
  for (const [xe, pe, row] of [[x0, px0, pts[0]], [x1, px1, pts[nx]]]) for (const p of [row[0], row[2]]) beam(ctx, p, [pe, ph - 0.01, z], 0.01, 0.01);
}
function cushion(ctx, at, r, col, lod) {
  const n = lod <= 2 ? 10 : 6, [cx, y, cz] = at; ctx.albedo(null); ctx.color(col);
  frustum(ctx, cx, cz, y, y + 0.06, r, r * 0.95, n, false); disc(ctx, cx, y, cz, r, n);
  const p = ngon(n, r * 0.95, cx, cz), top = y + 0.1;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.tri(cx, top, cz, p[j][0], y + 0.06, p[j][1], p[i][0], y + 0.06, p[i][1]); }
  if (lod <= 2) { ctx.color(COL.linen); gem(ctx, cx, top, cz, 0.02, 0.01, 0.005, 4); }
}
function pot(ctx, at, kind, lod, rnd) {
  const [cx, y, cz] = at; ctx.albedo(null); ctx.color(COL.terracotta);
  frustum(ctx, cx, cz, y, y + 0.2, 0.085, 0.115, 8); frustum(ctx, cx, cz, y + 0.17, y + 0.23, 0.12, 0.125, 8);
  ctx.color(COL.soil); disc(ctx, cx, y + 0.215, cz, 0.11, 8);
  if (lod > 3) return;
  const top = y + 0.215;
  if (kind === 'catnip') {
    const n = lod <= 2 ? 11 : 5;
    for (let i = 0; i < n; i++) { const a = rnd() * 6.28, r = rnd() * 0.07, hy = 0.05 + rnd() * 0.16; ctx.color(COL.leaf); gem(ctx, cx + Math.cos(a) * r, top + hy, cz + Math.sin(a) * r, 0.035 + rnd() * 0.02, 0.025, 0.02, 4); }
    ctx.color(COL.leaf); beam(ctx, [cx, top, cz], [cx, top + 0.22, cz], 0.012, 0.012);
    if (lod <= 2) { ctx.color(COL.lilac); for (let i = 0; i < 4; i++) gem(ctx, cx + (rnd() - 0.5) * 0.08, top + 0.22 + rnd() * 0.05, cz + (rnd() - 0.5) * 0.08, 0.012, 0.02, 0.01, 4); }
  } else {
    const n = lod <= 2 ? 18 : 7; ctx.color(COL.grass);
    for (let i = 0; i < n; i++) { const a = rnd() * 6.28, r = rnd() * 0.08, bx = cx + Math.cos(a) * r, bz = cz + Math.sin(a) * r, hgt = 0.2 + rnd() * 0.2, lean = 0.04 + rnd() * 0.06, w = 0.012;
      const tx = bx + Math.cos(a) * lean, tz = bz + Math.sin(a) * lean; ctx.tri(bx - Math.sin(a) * w, top, bz + Math.cos(a) * w, bx + Math.sin(a) * w, top, bz - Math.cos(a) * w, tx, top + hgt, tz); }
  }
}
function bowl(ctx, lod) {
  const [cx, y, cz] = BOWL; ctx.albedo(null); ctx.color(COL.ceramic);
  frustum(ctx, cx, cz, y, y + 0.065, 0.1, 0.13, lod <= 2 ? 12 : 8);
  ctx.color(COL.water); ctx.roughness(0.1); disc(ctx, cx, y + 0.067, cz, 0.112, lod <= 2 ? 12 : 8); ctx.roughness(0.85);
  if (lod <= 2) { ctx.color(COL.toy); gem(ctx, 0.2, C.deck + 0.04, -0.9, 0.04, 0.04, 0.04, 6); ctx.color(COL.linen); gem(ctx, -0.6, C.deck + 0.03, 0.9, 0.03, 0.03, 0.03, 5); }
}

function door(ctx, sp, lod) {
  const { leaf: w, leafH: h } = C.door, t = 0.022;
  paint(ctx, 'wood', COL.oak);
  box(ctx, -t, 0, -0.07, t, h, 0); box(ctx, -t, 0, -w, t, h, -w + 0.07);
  box(ctx, -t, 0, -w + 0.07, t, 0.18, -0.07); box(ctx, -t, 0.9, -w + 0.07, t, 0.98, -0.07); box(ctx, -t, h - 0.08, -w + 0.07, t, h, -0.07);
  if (lod <= 3) beam(ctx, [0, 0.22, -0.1], [0, 0.86, -w + 0.1], 0.03, 0.05);
  const P = (a, y) => [0, y, a];
  meshPanel(ctx, P, [1, 0, 0], -w + 0.07, -0.07, 0.18, () => 0.9, sp);
  meshPanel(ctx, P, [1, 0, 0], -w + 0.07, -0.07, 0.98, () => h - 0.08, sp);
  if (lod > 3) return;
  paint(ctx, null, COL.brass); box(ctx, -0.07, 0.96, -w + 0.035, 0.07, 1.0, -w + 0.065);
  for (const s of [-1, 1]) gem(ctx, s * 0.075, 0.98, -w + 0.05, 0.022, 0.02, 0.02, 6);
  ctx.color(COL.iron); for (const y of [0.3, h - 0.3]) box(ctx, -t - 0.004, y, -0.12, t + 0.004, y + 0.05, 0.01);
}

export function geometry(ctx) {
  const part = ctx.params.part || 'shell', lod = ctx.lod ?? 1, sp = lod === 1 ? 0.12 : lod === 2 ? 0.2 : 0;
  ctx.roughness(0.85);
  if (part === 'door') { door(ctx, sp, lod); return; }
  deck(ctx, lod); walls(ctx, sp, lod); roof(ctx, sp, lod); tunnel(ctx, sp, lod, ctx.params.tunLen ?? 4.5);
  if (lod >= 4) return;
  shelves(ctx, lod); catTree(ctx, lod); hammock(ctx, lod);
  for (const c of CUSHIONS) cushion(ctx, c.at, c.r, c.col, lod);
  const rnd = rng(ctx); for (const p of POTS) pot(ctx, p.at, p.kind, lod, rnd);
  bowl(ctx, lod);
}
export function collider(ctx) {
  if ((ctx.params.part || 'shell') === 'door') { box(ctx, -0.03, 0, -C.door.leaf, 0.03, C.door.leafH, 0); return; }
  const L = ctx.params.tunLen ?? 4.5, { x0: tx0, x1: tx1, y0: ty0, y1: ty1 } = C.tunnel, d = C.door, hb = roofY(ZW) + 0.05, t = 0.05;
  box(ctx, -XW - 0.1, 0, -ZW - 0.1, XW + 0.1, C.deck, ZW + 0.1);
  box(ctx, -XW, C.deck, -ZW - t, XW, roofY(-ZW), -ZW + t);
  box(ctx, -XW, C.deck, ZW - t, tx0 - 0.06, hb, ZW + t); box(ctx, tx1 + 0.06, C.deck, ZW - t, XW, hb, ZW + t);
  box(ctx, tx0 - 0.06, C.deck, ZW - t, tx1 + 0.06, ty0 - 0.01, ZW + t); box(ctx, tx0 - 0.06, ty1 + 0.01, ZW - t, tx1 + 0.06, hb, ZW + t);
  box(ctx, -XW - t, C.deck, -ZW, -XW + t, roofY(d.z0 - 0.05), d.z0 - 0.05);
  box(ctx, -XW - t, C.deck, d.z1 + 0.05, -XW + t, hb, ZW);
  box(ctx, -XW - t, d.h, d.z0 - 0.05, -XW + t, roofY(d.z1 + 0.05), d.z1 + 0.05);
  box(ctx, XW - t, C.deck, -ZW, XW + t, hb, ZW);
  const z0 = -ZW - 0.25, z1 = ZW + 0.2, r = (z) => roofY(z) + 0.02;
  solid(ctx, [[-XW - 0.2, r(z0), z0], [XW + 0.2, r(z0), z0], [XW + 0.2, r(z1), z1], [-XW - 0.2, r(z1), z1]],
    [[-XW - 0.2, r(z0) + 0.12, z0], [XW + 0.2, r(z0) + 0.12, z0], [XW + 0.2, r(z1) + 0.12, z1], [-XW - 0.2, r(z1) + 0.12, z1]]);
  box(ctx, tx0 - 0.05, ty0 - 0.05, ZW + t, tx1 + 0.05, ty1 + 0.05, ZW + L);
  const pz = ZW + Math.min(1.0, L * 0.3), px = (tx0 + tx1) / 2; box(ctx, px - 0.06, 0, pz - 0.06, px + 0.06, ty0 - 0.05, pz + 0.06);
  box(ctx, 1.55, C.deck, -1.56, 2.2, 1.75, -0.94);
}
