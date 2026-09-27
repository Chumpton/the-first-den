// The home: a hexagonal three-storey cob house around a living tree. Origin = outside ground at the centre,
// front door in the +Z face. Levels (local y): cellar B, ground G, attic A, roof deck D. A spiral stair winds round
// the trunk from the cellar floor to the roof in one helix, 19 steps a storey.
export const HOUSE = {
  R: 6.5, T: 0.5, B: -3.0, G: 0.4, A: 3.8, D: 7.2, wallBottom: -3.25, wallTop: 5.25,
  eaveR: 7.4, eaveY: 4.75, deckR: 3.4, roofT: 0.45, hole: 1.6, rail: 1.7, trunkR: 0.35, stepR: 1.55,
  a0: 36, stepDeg: 18, rise: 3.4 / 19, steps: 57,
};
const H = HOUSE, D2R = Math.PI / 180, COS30 = Math.cos(30 * D2R), TAN30 = Math.tan(30 * D2R);
const AO = H.R * COS30, AI = AO - H.T;
const TX = {
  cob: "cdn/texture-cob-earthen-plaster-wall-straw-flecked.png",
  lime: "cdn/texture-warm-limewash-plaster-interior-wall.png",
  stone: "cdn/texture-rough-fieldstone-wall-mortared.png",
  flags: "cdn/texture-worn-stone-flag-floor.png",
  plank: "cdn/texture-honey-oak-floor-planks.png",
  timber: "cdn/texture-weathered-oak-timber-grain.png",
  turf: "cdn/texture-living-roof-grass-turf-with-clover.png",
  bark: "scripts/tex-valley-bark.js",
  leaf: "scripts/tex-valley-canopy.js",
};
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
// a quad wound so its face looks along `n`
function Q(ctx, a, b, c, d, n) {
  const f = crs(sub(b, a), sub(c, a));
  if (f[0] * n[0] + f[1] * n[1] + f[2] * n[2] >= 0) ctx.quad(...a, ...b, ...c, ...d); else ctx.quad(...d, ...c, ...b, ...a);
}
function T3(ctx, a, b, c, n) {
  const f = crs(sub(b, a), sub(c, a));
  if (f[0] * n[0] + f[1] * n[1] + f[2] * n[2] >= 0) ctx.tri(...a, ...b, ...c); else ctx.tri(...c, ...b, ...a);
}
function box(ctx, x0, y0, z0, x1, y1, z1) {
  const p = (x, y, z) => [x, y, z];
  Q(ctx, p(x0, y1, z0), p(x1, y1, z0), p(x1, y1, z1), p(x0, y1, z1), [0, 1, 0]);
  Q(ctx, p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1), [0, -1, 0]);
  Q(ctx, p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1), [0, 0, 1]);
  Q(ctx, p(x0, y0, z0), p(x1, y0, z0), p(x1, y1, z0), p(x0, y1, z0), [0, 0, -1]);
  Q(ctx, p(x1, y0, z0), p(x1, y0, z1), p(x1, y1, z1), p(x1, y1, z0), [1, 0, 0]);
  Q(ctx, p(x0, y0, z0), p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0), [-1, 0, 0]);
}
// an oriented box along a face: centre c, tangent t, normal n, sizes (along t, y, along n)
function obox(ctx, c, t, n, w, h, d) {
  const P = (u, y, v) => [c[0] + t[0] * u + n[0] * v, c[1] + y, c[2] + t[2] * u + n[2] * v];
  const u = w / 2, v = d / 2;
  Q(ctx, P(-u, h, -v), P(u, h, -v), P(u, h, v), P(-u, h, v), [0, 1, 0]);
  Q(ctx, P(-u, 0, -v), P(u, 0, -v), P(u, 0, v), P(-u, 0, v), [0, -1, 0]);
  Q(ctx, P(-u, 0, v), P(u, 0, v), P(u, h, v), P(-u, h, v), n);
  Q(ctx, P(-u, 0, -v), P(u, 0, -v), P(u, h, -v), P(-u, h, -v), [-n[0], 0, -n[2]]);
  Q(ctx, P(u, 0, -v), P(u, 0, v), P(u, h, v), P(u, h, -v), t);
  Q(ctx, P(-u, 0, -v), P(-u, 0, v), P(-u, h, v), P(-u, h, -v), [-t[0], 0, -t[2]]);
}
function faceFrame(k) {
  const th = (30 + 60 * k) * D2R, n = [Math.cos(th), 0, Math.sin(th)];
  return { n, t: [n[2], 0, -n[0]] };
}
// openings by face (u from face centre, along t)
function holesFor(k) {
  const L = [];
  if (k === 1 || k === 4) L.push({ u: 0, w: 1.2, y0: H.G, y1: H.G + 2.3, door: true });
  else L.push({ u: 0, w: 1.1, y0: H.G + 0.95, y1: H.G + 2.25 });
  L.push({ u: 0, w: 0.7, y0: H.A + 0.3, y1: H.A + 0.9 });
  return L;
}
function wallBand(ctx, k, y0, y1, holes, paintOut, paintIn, collide) {
  const { n, t } = faceFrame(k);
  const Lo = AO * TAN30, Li = AI * TAN30;
  const OP = (u, y) => [n[0] * AO + t[0] * u, y, n[2] * AO + t[2] * u];
  const IP = (u, y) => [n[0] * AI + t[0] * u, y, n[2] * AI + t[2] * u];
  const hs = holes.filter((h) => h.y1 > y0 && h.y0 < y1);
  const cuts = [...new Set(hs.flatMap((h) => [h.u - h.w / 2, h.u + h.w / 2]))].sort((a, b) => a - b);
  const us = [null, ...cuts, null];
  const nIn = [-n[0], 0, -n[2]];
  for (let s = 0; s < us.length - 1; s++) {
    const ua = us[s], ub = us[s + 1], mid = ((ua ?? -Lo) + (ub ?? Lo)) / 2;
    const cover = hs.filter((h) => mid > h.u - h.w / 2 && mid < h.u + h.w / 2).sort((a, b) => a.y0 - b.y0);
    let spans = [], y = y0;
    for (const h of cover) { if (h.y0 > y) spans.push([y, Math.max(y0, h.y0)]); y = Math.min(y1, h.y1); }
    if (y < y1) spans.push([y, y1]);
    for (const [s0, s1] of spans) {
      const oa = ua ?? -Lo, ob = ub ?? Lo, ia = ua ?? -Li, ib = ub ?? Li;
      paintOut(); Q(ctx, OP(oa, s0), OP(ob, s0), OP(ob, s1), OP(oa, s1), n);
      paintIn(); Q(ctx, IP(ia, s0), IP(ib, s0), IP(ib, s1), IP(ia, s1), nIn);
    }
  }
  if (collide) return;
  // reveals: the cob thickness shows through every opening
  paintIn();
  for (const h of hs) {
    const a = h.u - h.w / 2, b = h.u + h.w / 2, lo = Math.max(y0, h.y0), hi = Math.min(y1, h.y1);
    Q(ctx, OP(a, lo), IP(a, lo), IP(a, hi), OP(a, hi), t);
    Q(ctx, OP(b, lo), IP(b, lo), IP(b, hi), OP(b, hi), [-t[0], 0, -t[2]]);
    if (h.y1 <= y1) Q(ctx, OP(a, hi), OP(b, hi), IP(b, hi), IP(a, hi), [0, -1, 0]);
    if (h.y0 >= y0 && !h.door) Q(ctx, OP(a, lo), OP(b, lo), IP(b, lo), IP(a, lo), [0, 1, 0]);
  }
}
function wallTop(ctx, k, y) {
  const { n, t } = faceFrame(k), Lo = AO * TAN30, Li = AI * TAN30;
  Q(ctx, [n[0] * AO - t[0] * Lo, y, n[2] * AO - t[2] * Lo], [n[0] * AO + t[0] * Lo, y, n[2] * AO + t[2] * Lo], [n[0] * AI + t[0] * Li, y, n[2] * AI + t[2] * Li], [n[0] * AI - t[0] * Li, y, n[2] * AI - t[2] * Li], [0, 1, 0]);
}
const hexR = (ap, phiDeg) => ap / Math.cos((((phiDeg % 60) + 60) % 60 - 30) * D2R);
// a hex slab (apothem ap) with a round hole (rh) at the centre; top at y
function floorRing(ctx, y, thick, rh, ap, paintTop, paintBot, collide) {
  const N = 24;
  const at = (r, phi, yy) => [Math.cos(phi * D2R) * r, yy, Math.sin(phi * D2R) * r];
  for (let j = 0; j < N; j++) {
    const p0 = j * 15, p1 = (j + 1) * 15, b0 = hexR(ap, p0), b1 = hexR(ap, p1);
    paintTop();
    if (rh > 0) Q(ctx, at(rh, p0, y), at(rh, p1, y), at(b1, p1, y), at(b0, p0, y), [0, 1, 0]);
    else T3(ctx, [0, y, 0], at(b1, p1, y), at(b0, p0, y), [0, 1, 0]);
    if (collide) continue;
    paintBot();
    if (rh > 0) {
      Q(ctx, at(rh, p0, y - thick), at(rh, p1, y - thick), at(b1, p1, y - thick), at(b0, p0, y - thick), [0, -1, 0]);
      const c = (p0 + p1) / 2 * D2R;
      Q(ctx, at(rh, p0, y - thick), at(rh, p1, y - thick), at(rh, p1, y), at(rh, p0, y), [-Math.cos(c), 0, -Math.sin(c)]);
    } else T3(ctx, [0, y - thick, 0], at(b1, p1, y - thick), at(b0, p0, y - thick), [0, -1, 0]);
  }
}
// ring railing round a floor opening, open over [gap-22°, gap+22°]
function stairRail(ctx, y, gapDeg, collide) {
  const r = H.rail, N = 24, at = (phi, yy) => [Math.cos(phi * D2R) * r, yy, Math.sin(phi * D2R) * r];
  const inGap = (phi) => { const d = ((phi - gapDeg) % 360 + 540) % 360 - 180; return Math.abs(d) < 22; };
  for (let j = 0; j < N; j++) {
    const p0 = j * 15, p1 = p0 + 15, c = (p0 + 7.5) * D2R, n = [Math.cos(c), 0, Math.sin(c)];
    if (inGap(p0) || inGap(p1)) continue;
    if (collide) { Q(ctx, at(p0, y), at(p1, y), at(p1, y + 1.0), at(p0, y + 1.0), n); continue; }
    const a = at(p0, y + 0.95), b = at(p1, y + 0.95), a2 = at(p0, y + 1.02), b2 = at(p1, y + 1.02);
    Q(ctx, a, b, b2, a2, n); Q(ctx, a, b, b2, a2, [-n[0], 0, -n[2]]);
    const m = at(p0, y + 0.5), mm = at(p1, y + 0.5), m2 = at(p0, y + 0.55), mm2 = at(p1, y + 0.55);
    Q(ctx, m, mm, mm2, m2, n);
    const p = at(p0, y), s = 0.035; box(ctx, p[0] - s, y, p[2] - s, p[0] + s, y + 1.0, p[2] + s);
  }
}
function step(ctx, i, collide) {
  const phi = H.a0 + i * H.stepDeg, pa = (phi - 10) * D2R, pb = (phi + 10) * D2R;
  const top = H.B + (i + 1) * H.rise, bot = top - (collide ? H.rise : 0.1);
  const r0 = H.trunkR - 0.05, r1 = H.stepR;
  const P = (r, a, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
  const nA = [Math.sin(pa), 0, -Math.cos(pa)], nB = [-Math.sin(pb), 0, Math.cos(pb)], nO = [Math.cos(phi * D2R), 0, Math.sin(phi * D2R)];
  Q(ctx, P(r0, pa, top), P(r1, pa, top), P(r1, pb, top), P(r0, pb, top), [0, 1, 0]);
  Q(ctx, P(r0, pa, bot), P(r1, pa, bot), P(r1, pa, top), P(r0, pa, top), nA);
  Q(ctx, P(r1, pa, bot), P(r1, pb, bot), P(r1, pb, top), P(r1, pa, top), nO);
  if (collide) return;
  Q(ctx, P(r0, pa, bot), P(r1, pa, bot), P(r1, pb, bot), P(r0, pb, bot), [0, -1, 0]);
  Q(ctx, P(r0, pb, bot), P(r1, pb, bot), P(r1, pb, top), P(r0, pb, top), nB);
}
function blob(ctx, cx, cy, cz, rx, ry, rz, seg, colors) {
  const lat = Math.max(3, seg - 2), pts = [];
  for (let i = 0; i <= lat; i++) {
    const row = [], phi = (i / lat) * Math.PI;
    for (let j = 0; j < seg; j++) {
      const th = (j / seg) * Math.PI * 2 + (i % 2) * (Math.PI / seg), k = i === 0 || i === lat ? 1 : 0.82 + ctx.random() * 0.34;
      row.push([cx + Math.sin(phi) * Math.cos(th) * rx * k, cy + Math.cos(phi) * ry * k, cz + Math.sin(phi) * Math.sin(th) * rz * k]);
    }
    pts.push(row);
  }
  for (let i = 0; i < lat; i++) {
    ctx.color(colors[Math.min(colors.length - 1, Math.floor((1 - i / lat) * colors.length * 0.999))]);
    for (let j = 0; j < seg; j++) { const a = pts[i][j], b = pts[i][(j + 1) % seg], c = pts[i + 1][(j + 1) % seg], d = pts[i + 1][j]; ctx.quad(...a, ...b, ...c, ...d); }
  }
}
function trunk(ctx, lod, collide) {
  const n = collide ? 6 : lod >= 3 ? 7 : 12, ring = (y, r) => { const p = []; for (let j = 0; j < n; j++) { const a = (j / n) * Math.PI * 2; p.push([Math.cos(a) * r * (1 + (collide ? 0 : Math.sin(a * 3 + y) * 0.06)), y, Math.sin(a) * r]); } return p; };
  const ys = collide ? [[H.B, H.trunkR], [11, H.trunkR]] : [[H.B, H.trunkR * 1.9], [H.B + 0.5, H.trunkR * 1.1], [H.G, H.trunkR], [H.A, H.trunkR * 0.95], [H.D, H.trunkR * 0.88], [9.6, H.trunkR * 0.7], [11.2, H.trunkR * 0.4]];
  for (let s = 0; s < ys.length - 1; s++) {
    const a = ring(...ys[s]), b = ring(...ys[s + 1]);
    for (let j = 0; j < n; j++) { const jj = (j + 1) % n, c = ((j + 0.5) / n) * Math.PI * 2; Q(ctx, a[j], a[jj], b[jj], b[j], [Math.cos(c), 0, Math.sin(c)]); }
  }
  if (collide) return;
  // limbs above the roof, then the crown that shades the deck
  if (lod < 4) for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.6, y0 = 9 + i * 0.45, L = 2.3;
    obox(ctx, [Math.cos(a) * L * 0.5, y0, Math.sin(a) * L * 0.5], [-Math.sin(a), 0, Math.cos(a)], [Math.cos(a), 0, Math.sin(a)], 0.16, 1.3, L);
  }
  ctx.albedo(TX.leaf); ctx.flat(); ctx.roughness(0.92);
  const seg = lod >= 4 ? 5 : lod >= 3 ? 6 : 8, pal = ["#3c6e34", "#4f8a3c", "#6a9f45", "#8fbf55"];
  blob(ctx, 0, 11.6, 0, 3.2, 2.0, 3.2, seg, pal);
  if (lod < 4) for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.3; blob(ctx, Math.cos(a) * 2.6, 10.6 + (i % 2) * 0.7, Math.sin(a) * 2.6, 1.9, 1.3, 1.9, seg, pal); }
}
function roof(ctx, lod, collide) {
  const eAp = H.eaveR * COS30, dAp = H.deckR * COS30, V = (r, k, y) => [Math.cos(60 * k * D2R) * r, y, Math.sin(60 * k * D2R) * r];
  const dy = H.D - H.eaveY, slopeN = (k) => { const th = (30 + 60 * k) * D2R, s = dy / (eAp - dAp), m = Math.hypot(1, s); return [Math.cos(th) / m, s / m, Math.sin(th) / m]; };
  for (let k = 0; k < 6; k++) {
    const n = slopeN(k);
    if (!collide) { ctx.albedo(TX.turf); ctx.color("oklch(0.93 0.05 130)"); ctx.roughness(1); }
    Q(ctx, V(H.eaveR, k, H.eaveY), V(H.eaveR, k + 1, H.eaveY), V(H.deckR, k + 1, H.D), V(H.deckR, k, H.D), n);
    if (collide) continue;
    ctx.albedo(TX.timber); ctx.color("oklch(0.9 0.03 70)"); ctx.roughness(0.85);
    Q(ctx, V(H.eaveR, k, H.eaveY - H.roofT), V(H.eaveR, k + 1, H.eaveY - H.roofT), V(H.deckR, k + 1, H.D - H.roofT), V(H.deckR, k, H.D - H.roofT), [-n[0], -n[1], -n[2]]);
    const th = (30 + 60 * k) * D2R;
    Q(ctx, V(H.eaveR, k, H.eaveY - H.roofT), V(H.eaveR, k + 1, H.eaveY - H.roofT), V(H.eaveR, k + 1, H.eaveY), V(H.eaveR, k, H.eaveY), [Math.cos(th), 0, Math.sin(th)]);
    if (lod < 3) {
      // a hip rafter on each corner, seen from the attic
      const a = V(H.R - 0.3, k, H.eaveY + (eAp - (H.R - 0.3) * COS30) / (eAp - dAp) * dy - H.roofT - 0.12), b = V(H.deckR + 0.05, k, H.D - H.roofT - 0.12);
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], dir = sub(b, a), L = Math.hypot(...dir);
      const along = [dir[0] / L, 0, dir[2] / L], side = [-along[2], 0, along[0]];
      // approximate the sloped rafter by three stepped segments
      for (let s = 0; s < 3; s++) { const f = (s + 0.5) / 3; obox(ctx, [a[0] + dir[0] * f, a[1] + dir[1] * f - 0.1, a[2] + dir[2] * f], side, along, 0.18, 0.22, L / 3 + 0.05); }
      // hip caps: thin logs along the outside hips
      ctx.albedo(TX.bark); ctx.color("#8b7a66");
      const ea = V(H.eaveR, k, H.eaveY), db = V(H.deckR, k, H.D), hd = sub(db, ea), hl = Math.hypot(...hd);
      for (let s = 0; s < 4; s++) { const f = (s + 0.5) / 4, al = [hd[0] / hl, 0, hd[2] / hl]; obox(ctx, [ea[0] + hd[0] * f, ea[1] + hd[1] * f - 0.05, ea[2] + hd[2] * f], [-al[2], 0, al[0]], al, 0.16, 0.16, hl / 4 + 0.08); }
    }
  }
  if (collide || lod >= 3) return;
  // the living roof: tufts of grass and clover flowers
  ctx.albedo(null); ctx.flat();
  for (let i = 0; i < 160; i++) {
    const k = Math.floor(ctx.random() * 6), f = ctx.random(), g = ctx.random();
    const e0 = V(H.eaveR - 0.2, k, 0), e1 = V(H.eaveR - 0.2, k + 1, 0), d0 = V(H.deckR + 0.3, k, 0), d1 = V(H.deckR + 0.3, k + 1, 0);
    const x = (e0[0] + (e1[0] - e0[0]) * f) * (1 - g) + (d0[0] + (d1[0] - d0[0]) * f) * g, z = (e0[2] + (e1[2] - e0[2]) * f) * (1 - g) + (d0[2] + (d1[2] - d0[2]) * f) * g;
    const p = Math.hypot(x, z) * Math.cos(((((Math.atan2(z, x) / D2R) % 60) + 60) % 60 - 30) * D2R);
    const y = H.eaveY + (eAp - p) / (eAp - dAp) * dy, h = 0.18 + ctx.random() * 0.22, w = 0.06;
    ctx.color(i % 7 === 0 ? "#f4e6f0" : i % 11 === 0 ? "#e8c64a" : i % 2 ? "#6f9a48" : "#86ad55");
    ctx.tri(x - w, y, z, x + w, y, z, x + (ctx.random() - 0.5) * 0.1, y + h, z);
    ctx.tri(x, y, z - w, x, y, z + w, x + (ctx.random() - 0.5) * 0.1, y + h, z);
  }
}
function deckRail(ctx, collide) {
  const V = (k, y) => [Math.cos(60 * k * D2R) * (H.deckR - 0.08), y, Math.sin(60 * k * D2R) * (H.deckR - 0.08)];
  for (let k = 0; k < 6; k++) {
    const th = (30 + 60 * k) * D2R, n = [Math.cos(th), 0, Math.sin(th)];
    if (collide) { Q(ctx, V(k, H.D), V(k + 1, H.D), V(k + 1, H.D + 1.05), V(k, H.D + 1.05), n); continue; }
    for (const [y, h] of [[H.D + 0.98, 0.08], [H.D + 0.5, 0.05]]) {
      const a = V(k, y), b = V(k + 1, y), c = [(a[0] + b[0]) / 2, y, (a[2] + b[2]) / 2], t = [n[2], 0, -n[0]];
      obox(ctx, c, t, n, H.deckR, h, 0.08);
    }
    const p = V(k, H.D); box(ctx, p[0] - 0.06, H.D, p[2] - 0.06, p[0] + 0.06, H.D + 1.08, p[2] + 0.06);
    // balusters
    for (let s = 1; s < 6; s++) { const a = V(k, 0), b = V(k + 1, 0), x = a[0] + (b[0] - a[0]) * s / 6, z = a[2] + (b[2] - a[2]) * s / 6; box(ctx, x - 0.02, H.D, z - 0.02, x + 0.02, H.D + 0.98, z + 0.02); }
  }
}
function build(ctx, collide) {
  const lod = collide ? 1 : Number(ctx.lod ?? 1);
  const P = (tx, col, rough) => () => { if (collide) return; ctx.albedo(tx); ctx.color(col); ctx.roughness(rough); };
  const cobOut = P(TX.cob, "oklch(0.95 0.03 75)", 0.95), limeIn = P(TX.lime, "oklch(0.97 0.02 85)", 0.9), stone = P(TX.stone, "oklch(0.93 0.02 80)", 0.95);
  const plankTop = P(TX.plank, "oklch(0.95 0.03 75)", 0.75), beams = P(TX.timber, "oklch(0.88 0.04 65)", 0.85), flags = P(TX.flags, "oklch(0.94 0.02 80)", 0.9);
  if (!collide) ctx.flat();
  if (lod >= 4) {
    // far: the hex drum, the roof and the crown
    cobOut();
    for (let k = 0; k < 6; k++) wallBand(ctx, k, 0, H.wallTop, [], cobOut, cobOut, true);
    roof(ctx, lod, false); ctx.albedo(TX.bark); ctx.color("#8b7a66"); trunk(ctx, lod, false);
    return;
  }
  for (let k = 0; k < 6; k++) {
    wallBand(ctx, k, H.wallBottom, 0.3, [], stone, stone, collide);
    wallBand(ctx, k, 0.3, H.wallTop, holesFor(k), cobOut, limeIn, collide);
    if (!collide) { cobOut(); wallTop(ctx, k, H.wallTop); }
  }
  floorRing(ctx, H.B, 0.25, 0, AI + 0.1, flags, flags, collide);
  floorRing(ctx, H.G, 0.3, H.hole, AI + 0.1, plankTop, beams, collide);
  floorRing(ctx, H.A, 0.3, H.hole, AI + 0.1, plankTop, beams, collide);
  floorRing(ctx, H.D, H.roofT, H.hole, H.deckR * COS30, plankTop, beams, collide);
  beams(); for (let i = 0; i < H.steps; i++) step(ctx, i, collide);
  beams(); stairRail(ctx, H.G, H.a0 + 18 * H.stepDeg, collide); stairRail(ctx, H.A, H.a0 + 37 * H.stepDeg, collide); stairRail(ctx, H.D, H.a0 + 56 * H.stepDeg, collide);
  beams(); deckRail(ctx, collide);
  roof(ctx, lod, collide);
  if (!collide) { ctx.albedo(TX.bark); ctx.color("#8b7a66"); ctx.roughness(0.95); }
  trunk(ctx, lod, collide);
  if (collide) return;
  // stone apron round the foot (hides the cut in the ground), the plinth course, door steps
  stone();
  for (let k = 0; k < 6; k++) {
    const { n, t } = faceFrame(k), Lo = AO * TAN30, o = AO + 0.9, Lx = o * TAN30;
    Q(ctx, [n[0] * AO - t[0] * Lo, 0.06, n[2] * AO - t[2] * Lo], [n[0] * AO + t[0] * Lo, 0.06, n[2] * AO + t[2] * Lo], [n[0] * o + t[0] * Lx, 0.06, n[2] * o + t[2] * Lx], [n[0] * o - t[0] * Lx, 0.06, n[2] * o - t[2] * Lx], [0, 1, 0]);
    Q(ctx, [n[0] * o - t[0] * Lx, -0.3, n[2] * o - t[2] * Lx], [n[0] * o + t[0] * Lx, -0.3, n[2] * o + t[2] * Lx], [n[0] * o + t[0] * Lx, 0.06, n[2] * o + t[2] * Lx], [n[0] * o - t[0] * Lx, 0.06, n[2] * o - t[2] * Lx], n);
    const pa = AO + 0.07, Lp = pa * TAN30;
    Q(ctx, [n[0] * pa - t[0] * Lp, 0.06, n[2] * pa - t[2] * Lp], [n[0] * pa + t[0] * Lp, 0.06, n[2] * pa + t[2] * Lp], [n[0] * pa + t[0] * Lp, 0.36, n[2] * pa + t[2] * Lp], [n[0] * pa - t[0] * Lp, 0.36, n[2] * pa - t[2] * Lp], n);
    Q(ctx, [n[0] * pa - t[0] * Lp, 0.36, n[2] * pa - t[2] * Lp], [n[0] * pa + t[0] * Lp, 0.36, n[2] * pa + t[2] * Lp], [n[0] * AO + t[0] * Lo, 0.36, n[2] * AO + t[2] * Lo], [n[0] * AO - t[0] * Lo, 0.36, n[2] * AO - t[2] * Lo], [0, 1, 0]);
    if (k === 1 || k === 4) obox(ctx, [n[0] * (AO + 0.45), 0.06, n[2] * (AO + 0.45)], t, n, 1.8, 0.16, 0.9);
  }
  // timber: lintels over every opening, door frames, window sills with flower boxes, glass
  for (let k = 0; k < 6; k++) {
    const { n, t } = faceFrame(k);
    for (const h of holesFor(k)) {
      beams();
      const c = [n[0] * (AO + 0.02), h.y1, n[2] * (AO + 0.02)];
      obox(ctx, c, t, n, h.w + 0.5, 0.24, 0.14);
      if (h.door) { for (const s of [-1, 1]) obox(ctx, [c[0] + t[0] * s * (h.w / 2 + 0.06), h.y0, c[2] + t[2] * s * (h.w / 2 + 0.06)], t, n, 0.12, h.y1 - h.y0, 0.12); continue; }
      obox(ctx, [n[0] * (AO + 0.05), h.y0 - 0.08, n[2] * (AO + 0.05)], t, n, h.w + 0.2, 0.08, 0.2);
      if (lod < 3) { for (const s of [-1, 1]) obox(ctx, [n[0] * (AO - 0.18), h.y0, n[2] * (AO - 0.18)].map((v, i) => i === 1 ? v : v + (i === 0 ? t[0] : t[2]) * s * (h.w / 2 - 0.03)), t, n, 0.06, h.y1 - h.y0, 0.07); obox(ctx, [n[0] * (AO - 0.18), (h.y0 + h.y1) / 2 - 0.03, n[2] * (AO - 0.18)], t, n, h.w, 0.06, 0.07); }
      ctx.albedo(null); ctx.color("oklch(0.88 0.03 220)", 0.28); ctx.roughness(0.05); ctx.metalness(0.1);
      const g = AO - 0.2, a = [n[0] * g + t[0] * (-h.w / 2), 0, n[2] * g + t[2] * (-h.w / 2)], b = [n[0] * g + t[0] * (h.w / 2), 0, n[2] * g + t[2] * (h.w / 2)];
      Q(ctx, [a[0], h.y0, a[2]], [b[0], h.y0, b[2]], [b[0], h.y1, b[2]], [a[0], h.y1, a[2]], n);
      ctx.metalness(0);
      if (h.y0 < H.A && lod < 3) {
        // flower box under the ground-floor windows
        beams(); obox(ctx, [n[0] * (AO + 0.22), h.y0 - 0.38, n[2] * (AO + 0.22)], t, n, h.w + 0.1, 0.28, 0.3);
        ctx.albedo(null);
        for (let f = 0; f < 9; f++) { const u = -h.w / 2 + (f + 0.5) * h.w / 9, x = n[0] * (AO + 0.22) + t[0] * u, z = n[2] * (AO + 0.22) + t[2] * u; blob(ctx, x, h.y0 - 0.05, z, 0.09, 0.08, 0.09, 4, [f % 3 === 0 ? "#d9485f" : f % 3 === 1 ? "#f2c14e" : "#b06bd6", "#4f8a3c"]); }
      }
    }
  }
  // ivy climbing the west faces
  if (lod < 3) {
    ctx.albedo(null);
    for (const k of [2, 3]) {
      const { n, t } = faceFrame(k);
      for (let i = 0; i < 70; i++) {
        const u = -2.8 + ctx.random() * 1.6 + (k === 3 ? 4 : 0) * 0, y = 0.4 + ctx.random() * ctx.random() * 4.3, c = [n[0] * (AO + 0.03) + t[0] * u, y, n[2] * (AO + 0.03) + t[2] * u], s = 0.1 + ctx.random() * 0.08;
        ctx.color(i % 3 ? "#3f7a33" : "#5c9c43");
        Q(ctx, [c[0] - t[0] * s, y - s, c[2] - t[2] * s], [c[0] + t[0] * s, y - s * 0.3, c[2] + t[2] * s], [c[0] + t[0] * s * 0.4, y + s, c[2] + t[2] * s * 0.4], [c[0] - t[0] * s * 0.6, y + s * 0.4, c[2] - t[2] * s * 0.6], n);
      }
    }
  }
  // stovepipe through the roof from the hearth side
  ctx.albedo(null); ctx.color("oklch(0.35 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.5);
  const sx = Math.cos(150 * D2R) * 4.1, sz = Math.sin(150 * D2R) * 4.1;
  box(ctx, sx - 0.13, 6.0, sz - 0.13, sx + 0.13, 8.4, sz + 0.13); box(ctx, sx - 0.24, 8.4, sz - 0.24, sx + 0.24, 8.5, sz + 0.24);
  ctx.metalness(0);
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
