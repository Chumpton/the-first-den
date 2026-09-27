// The home: a hexagonal three-storey cob house around a living tree. Origin = outside ground at the centre,
// front door in the +Z face. Levels (local y): cellar B, ground G, attic A, roof deck D. A spiral stair winds round
// the trunk from the cellar floor to the roof in one helix, 19 steps a storey.
export const HOUSE = {
  R: 9.2, T: 0.5, B: -3.0, G: 0.4, A: 3.8, D: 7.2, wallBottom: -3.25, wallTop: 5.25,
  eaveR: 10.1, eaveY: 4.75, deckR: 4.8, roofT: 0.45, hole: 1.6, rail: 1.7, trunkR: 0.35, stepR: 1.55,
  rise: 0.2, run: 0.21, treads: 17, flightW: 1.0,
  // straight flights hugging the front and back walls: bottom point, run direction, floor they start on
  flights: [
    { x: 4.62, z: 6.4, dx: -1, dz: 0, y: -3.0 },
    { x: 4.62, z: -6.4, dx: -1, dz: 0, y: 0.4 },
    { x: -1.8, z: 3.3, dx: 1, dz: 0, y: 3.8 },
  ],
  // floor openings [x0, z0, x1, z1]
  hatchG: [1.05, 5.9, 4.62, 6.9], hatchA: [1.05, -6.9, 4.62, -5.9], hatchD: [-1.8, 2.8, 1.8, 3.8],
  trunkHole: 0.42, doorW: 1.6, doorH: 2.5,
  // the roof deck opens toward the guest treehouse's bridge (local angle atan2(z, x), radians)
  deckGaps: [3.307], deckGapW: 0.3,
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
export function holesFor(k) {
  const L = [];
  if (k === 1 || k === 4) {
    L.push({ u: 0, w: H.doorW, y0: 0.3, y1: H.G + H.doorH, door: true });
    for (const u of [-2.05, 2.05]) L.push({ u, w: 0.65, y0: H.G + 1.0, y1: H.G + 2.1 });
  } else for (const u of [-1.3, 1.3]) L.push({ u, w: 0.95, y0: H.G + 0.9, y1: H.G + 2.2 });
  L.push({ u: 0, w: 0.85, y0: H.A + 0.28, y1: H.A + 0.9 });
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
// a hex slab (apothem ap, vertices on ±x) with rectangular holes; top at y
function hexX(ap, z) { return Math.max(0, (ap - Math.abs(z) * 0.5) / COS30); }
function floorSlab(ctx, y, thick, ap, holes, paintTop, paintBot, collide) {
  const zs = new Set([-ap, 0, ap]);
  for (const h of holes) { zs.add(Math.max(-ap, Math.min(ap, h[1]))); zs.add(Math.max(-ap, Math.min(ap, h[3]))); }
  const Z = [...zs].sort((a, b) => a - b);
  for (let i = 0; i < Z.length - 1; i++) {
    const z0 = Z[i], z1 = Z[i + 1], zm = (z0 + z1) / 2;
    if (z1 - z0 < 1e-4) continue;
    const cut = holes.filter((h) => zm > h[1] && zm < h[3]).map((h) => [h[0], h[2]]).sort((a, b) => a[0] - b[0]);
    let segs = [[null, null]];
    for (const [c0, c1] of cut) { const last = segs.pop(); segs.push([last[0], c0], [c1, last[1]]); }
    for (const [sa, sb] of segs) {
      const xa0 = sa ?? -hexX(ap, z0), xa1 = sa ?? -hexX(ap, z1), xb0 = sb ?? hexX(ap, z0), xb1 = sb ?? hexX(ap, z1);
      if (Math.max(xb0, xb1) - Math.min(xa0, xa1) < 1e-3) continue;
      paintTop(); Q(ctx, [xa0, y, z0], [xb0, y, z0], [xb1, y, z1], [xa1, y, z1], [0, 1, 0]);
      if (collide) continue;
      paintBot(); Q(ctx, [xa0, y - thick, z0], [xb0, y - thick, z0], [xb1, y - thick, z1], [xa1, y - thick, z1], [0, -1, 0]);
    }
  }
  if (collide) return;
  paintBot();
  for (const h of holes) { const [x0, z0, x1, z1] = h, yb = y - thick;
    Q(ctx, [x0, yb, z0], [x1, yb, z0], [x1, y, z0], [x0, y, z0], [0, 0, 1]); Q(ctx, [x0, yb, z1], [x1, yb, z1], [x1, y, z1], [x0, y, z1], [0, 0, -1]);
    Q(ctx, [x0, yb, z0], [x0, yb, z1], [x0, y, z1], [x0, y, z0], [1, 0, 0]); Q(ctx, [x1, yb, z0], [x1, yb, z1], [x1, y, z1], [x1, y, z0], [-1, 0, 0]); }
}
// a sloped or level timber between two points, square section w×h
function beam(ctx, a, b, w, h) {
  const d = sub(b, a), L = Math.hypot(...d); if (L < 1e-4) return;
  const f = [d[0] / L, d[1] / L, d[2] / L];
  let sd = crs(f, [0, 1, 0]); let sl = Math.hypot(...sd); if (sl < 1e-3) { sd = [1, 0, 0]; sl = 1; } sd = sd.map((v) => v / sl);
  const up = crs(sd, f), hw = w / 2, hh = h / 2;
  const P = (p, s, u) => [p[0] + sd[0] * s + up[0] * u, p[1] + sd[1] * s + up[1] * u, p[2] + sd[2] * s + up[2] * u];
  const A = [P(a, -hw, -hh), P(a, hw, -hh), P(a, hw, hh), P(a, -hw, hh)], B = [P(b, -hw, -hh), P(b, hw, -hh), P(b, hw, hh), P(b, -hw, hh)];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4, n = [(A[i][0] + A[j][0]) / 2 - a[0], (A[i][1] + A[j][1]) / 2 - a[1], (A[i][2] + A[j][2]) / 2 - a[2]]; Q(ctx, A[i], A[j], B[j], B[i], n); }
  Q(ctx, ...A, [-f[0], -f[1], -f[2]]); Q(ctx, ...B, f);
}
// railing on three sides of a hatch; open = which side is left open for the stair's arrival: "z0" | "x1"
function hatchRail(ctx, y, h, open, collide) {
  const [x0, z0, x1, z1] = h, o = 0.05;
  const sides = [["z0", [x0 - o, z0 - o], [x1 + o, z0 - o]], ["z1", [x0 - o, z1 + o], [x1 + o, z1 + o]], ["x0", [x0 - o, z0 - o], [x0 - o, z1 + o]], ["x1", [x1 + o, z0 - o], [x1 + o, z1 + o]]];
  for (const [id, a, b] of sides) {
    if (id === open) continue;
    if (collide) { const dx = b[0] - a[0], dz = b[1] - a[1]; Q(ctx, [a[0], y, a[1]], [b[0], y, b[1]], [b[0], y + 1.0, b[1]], [a[0], y + 1.0, a[1]], [dz, 0, -dx]); continue; }
    beam(ctx, [a[0], y + 0.95, a[1]], [b[0], y + 0.95, b[1]], 0.07, 0.06);
    beam(ctx, [a[0], y + 0.5, a[1]], [b[0], y + 0.5, b[1]], 0.04, 0.04);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 0.9));
    for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; box(ctx, x - 0.04, y, z - 0.04, x + 0.04, y + 1.0, z + 0.04); }
  }
}
// one straight flight: solid stone steps capped in oak, a handrail on each side
function flight(ctx, F, collide, paintStone, paintOak) {
  const w = H.flightW / 2, sx = -F.dz, sz = F.dx;
  const at = (along, side) => [F.x + F.dx * along + sx * side, F.z + F.dz * along + sz * side];
  for (let i = 0; i < H.treads; i++) {
    const top = F.y + (i + 1) * H.rise, a = at(i * H.run, -w), b = at((i + 1) * H.run, w);
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
    if (collide) { box(ctx, x0, F.y, z0, x1, top, z1); continue; }
    paintStone(); box(ctx, x0, F.y, z0, x1, top - 0.05, z1);
    paintOak(); const na = at(i * H.run - 0.03, -w - 0.02), nb = at((i + 1) * H.run, w + 0.02);
    box(ctx, Math.min(na[0], nb[0]), top - 0.05, Math.min(na[1], nb[1]), Math.max(na[0], nb[0]), top, Math.max(na[1], nb[1]));
  }
  if (collide) return;
  paintOak();
  const L = H.treads * H.run;
  for (const side of [-w - 0.02, w + 0.02]) {
    const b0 = at(0.1, side), b1 = at(L - 0.05, side);
    beam(ctx, [b0[0], F.y + 0.2 + 0.9, b0[1]], [b1[0], F.y + H.treads * H.rise + 0.9, b1[1]], 0.07, 0.06);
    for (const f of [0.1, 0.5, 0.9]) { const p = at(L * f, side), y = F.y + Math.ceil(H.treads * f) * H.rise; box(ctx, p[0] - 0.035, y, p[1] - 0.035, p[0] + 0.035, y + 0.9 + H.rise, p[1] + 0.035); }
  }
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
// the roof-deck railing, six sides in six bays each; a bay whose middle lies within deckGapW of a deckGaps angle is left open (a bridge lands there)
function deckRail(ctx, collide) {
  const V = (k, y) => [Math.cos(60 * k * D2R) * (H.deckR - 0.08), y, Math.sin(60 * k * D2R) * (H.deckR - 0.08)];
  const open = (x, z) => (H.deckGaps ?? []).some((g) => { const a = Math.atan2(z, x) - g; return Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < (H.deckGapW ?? 0.3); });
  for (let k = 0; k < 6; k++) {
    const th = (30 + 60 * k) * D2R, n = [Math.cos(th), 0, Math.sin(th)], t = [n[2], 0, -n[0]], a = V(k, 0), b = V(k + 1, 0), bay = H.deckR / 6;
    const P = (s) => [a[0] + (b[0] - a[0]) * s, 0, a[2] + (b[2] - a[2]) * s];
    for (let s = 0; s < 6; s++) {
      const p0 = P(s / 6), p1 = P((s + 1) / 6), m = P((s + 0.5) / 6);
      if (open(m[0], m[2])) continue;
      if (collide) { Q(ctx, [p0[0], H.D, p0[2]], [p1[0], H.D, p1[2]], [p1[0], H.D + 1.05, p1[2]], [p0[0], H.D + 1.05, p0[2]], n); continue; }
      for (const [y, h] of [[H.D + 0.98, 0.08], [H.D + 0.5, 0.05]]) obox(ctx, [m[0], y, m[2]], t, n, bay, h, 0.08);
      box(ctx, p0[0] - 0.03, H.D, p0[2] - 0.03, p0[0] + 0.03, H.D + 0.98, p0[2] + 0.03);
      box(ctx, p1[0] - 0.03, H.D, p1[2] - 0.03, p1[0] + 0.03, H.D + 0.98, p1[2] + 0.03);
    }
    if (!collide) { const p = V(k, H.D); box(ctx, p[0] - 0.06, H.D, p[2] - 0.06, p[0] + 0.06, H.D + 1.08, p[2] + 0.06); }
  }
}
// walnut baseboard on a face's inside at floor y: a profile swept along the wall, mitred at the corners, broken at
// openings that reach the floor. Drawn only (the collider never sees it).
const BASE_PROFILE = [[0, 0], [0.025, 0], [0.025, 0.11], [0.031, 0.117], [0.033, 0.127], [0.028, 0.136], [0.016, 0.141], [0, 0.143]];
function baseboard(ctx, k, fy, holes) {
  const { n, t } = faceFrame(k);
  const L = (off) => (AI - off) * TAN30;
  const cuts = holes.filter((h) => h.y0 <= fy + 0.15).map((h) => [h.u - h.w / 2, h.u + h.w / 2]).sort((a, b) => a[0] - b[0]);
  const segs = []; let a = null;
  for (const c of cuts) { segs.push([a, c[0]]); a = c[1]; }
  segs.push([a, null]);
  const P = (u, off, y) => [n[0] * (AI - off) + t[0] * u, fy + y, n[2] * (AI - off) + t[2] * u];
  for (const [ua, ub] of segs) {
    const U0 = (off) => ua == null ? -L(off) : ua, U1 = (off) => ub == null ? L(off) : ub;
    for (let i = 0; i < BASE_PROFILE.length - 1; i++) {
      const [o0, y0] = BASE_PROFILE[i], [o1, y1] = BASE_PROFILE[i + 1];
      const no = y1 - y0, ny = -(o1 - o0), m = Math.hypot(no, ny) || 1;
      Q(ctx, P(U0(o0), o0, y0), P(U1(o0), o0, y0), P(U1(o1), o1, y1), P(U0(o1), o1, y1), [-n[0] * no / m, ny / m, -n[2] * no / m]);
    }
    // end caps where the run stops at an opening
    for (const [u, s] of [[ua, -1], [ub, 1]]) {
      if (u == null) continue;
      const c = P(u, 0.012, 0.07), N = [t[0] * s, 0, t[2] * s];
      for (let i = 0; i < BASE_PROFILE.length - 1; i++) T3(ctx, c, P(u, ...BASE_PROFILE[i]), P(u, ...BASE_PROFILE[i + 1]), N);
    }
  }
}
function build(ctx, collide) {
  const lod = collide ? 1 : Number(ctx.lod ?? 1);
  const P = (tx, col, rough) => () => { if (collide) return; ctx.albedo(tx); ctx.color(col); ctx.roughness(rough); };
  const cobOut = P(TX.cob, "oklch(0.95 0.03 75)", 0.95), limeIn = P(TX.lime, "oklch(0.80 0.05 75)", 0.9), stone = P(TX.stone, "oklch(0.93 0.02 80)", 0.95);
  const plankTop = P(TX.plank, "oklch(0.95 0.03 75)", 0.75), plankIn = P(TX.plank, "oklch(0.52 0.06 55)", 0.7), beams = P(TX.timber, "oklch(0.88 0.04 65)", 0.85), flags = P(TX.flags, "oklch(0.94 0.02 80)", 0.9);
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
  if (!collide && lod < 3) {
    ctx.albedo(null); ctx.color("oklch(0.36 0.05 50)"); ctx.roughness(0.6);
    for (let k = 0; k < 6; k++) { baseboard(ctx, k, H.B, []); baseboard(ctx, k, H.G, holesFor(k)); baseboard(ctx, k, H.A, holesFor(k)); }
  }
  const th = H.trunkHole, TH = [-th, -th, th, th];
  floorSlab(ctx, H.B, 0.25, AI + 0.1, [], flags, flags, collide);
  floorSlab(ctx, H.G, 0.3, AI + 0.1, [TH, H.hatchG], plankIn, beams, collide);
  floorSlab(ctx, H.A, 0.3, AI + 0.1, [TH, H.hatchB ?? H.hatchA], plankIn, beams, collide);
  floorSlab(ctx, H.D, H.roofT, H.deckR * COS30, [TH, H.hatchD], plankTop, beams, collide);
  for (const F of H.flights) flight(ctx, F, collide, stone, beams);
  beams(); hatchRail(ctx, H.G, H.hatchG, "x0", collide); hatchRail(ctx, H.A, H.hatchA, "x0", collide); hatchRail(ctx, H.D, H.hatchD, "x1", collide);
  beams(); deckRail(ctx, collide);
  // door thresholds and the two steps up to each door — solid, so the doorway walks
  for (const k of [1, 4]) {
    const { n, t } = faceFrame(k), W = H.doorW / 2;
    beams(); obox(ctx, [n[0] * (AO + AI) / 2, 0.1, n[2] * (AO + AI) / 2], t, n, H.doorW + 0.02, H.G - 0.1, AO - AI + 0.1);
    stone(); obox(ctx, [n[0] * (AO + 0.22), 0, n[2] * (AO + 0.22)], t, n, H.doorW + 0.6, 0.27, 0.44);
    obox(ctx, [n[0] * (AO + 0.66), 0, n[2] * (AO + 0.66)], t, n, H.doorW + 0.9, 0.13, 0.44);
  }
  if (collide) portico(ctx, 1, true);
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
    wainscot(ctx, k, lod);
  }
  windows(ctx, lod, beams);
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
  // oak corner posts on every hex corner, a timber belt at the attic floor, shutters, porch hoods, lanterns
  beams();
  for (let k = 0; k < 6; k++) {
    const a = 60 * k * D2R, r = H.R - 0.05, c = [Math.cos(a) * r, 0.3, Math.sin(a) * r], n = [Math.cos(a), 0, Math.sin(a)], t = [n[2], 0, -n[0]];
    obox(ctx, c, t, n, 0.26, H.wallTop - 0.3, 0.26);
    const { n: fn, t: ft } = faceFrame(k);
    obox(ctx, [fn[0] * (AO + 0.05), H.A - 0.2, fn[2] * (AO + 0.05)], ft, fn, 2 * AO * TAN30, 0.22, 0.14);
  }
  for (const k of [1, 4]) {
    const { n, t } = faceFrame(k), y = H.G + H.doorH + 0.35;
    beams();
    if (k === 1) portico(ctx, lod, false, stone, beams); else {
    for (const sgn of [-1, 1]) beam(ctx, [n[0] * AO + t[0] * sgn * 1.05, y - 0.7, n[2] * AO + t[2] * sgn * 1.05], [n[0] * (AO + 1.1) + t[0] * sgn * 1.05, y, n[2] * (AO + 1.1) + t[2] * sgn * 1.05], 0.12, 0.12);
    const e0 = [n[0] * AO, y + 0.45, n[2] * AO], e1 = [n[0] * (AO + 1.35), y - 0.05, n[2] * (AO + 1.35)];
    const P = (e, u) => [e[0] + t[0] * u, e[1], e[2] + t[2] * u];
    Q(ctx, P(e0, -1.3), P(e0, 1.3), P(e1, 1.3), P(e1, -1.3), [0, -1, 0]);
    ctx.albedo(TX.turf); ctx.color("oklch(0.93 0.05 130)"); ctx.roughness(1);
    const up = 0.1; Q(ctx, P([e0[0], e0[1] + up, e0[2]], -1.3), P([e0[0], e0[1] + up, e0[2]], 1.3), P([e1[0], e1[1] + up, e1[2]], 1.3), P([e1[0], e1[1] + up, e1[2]], -1.3), [n[0] * 0.35, 1, n[2] * 0.35]);
    beams(); Q(ctx, P([e1[0], e1[1], e1[2]], -1.3), P(e1, 1.3), P([e1[0], e1[1] + up, e1[2]], 1.3), P([e1[0], e1[1] + up, e1[2]], -1.3), n);
    }
    // a lantern either side of the door
    for (const sgn of [-1, 1]) {
      const c = [n[0] * (AO + 0.18) + t[0] * sgn * 1.25, H.G + 1.75, n[2] * (AO + 0.18) + t[2] * sgn * 1.25];
      ctx.albedo(null); ctx.color("oklch(0.3 0.02 60)"); ctx.metalness(0.5);
      box(ctx, c[0] - 0.12, c[1] + 0.34, c[2] - 0.12, c[0] + 0.12, c[1] + 0.4, c[2] + 0.12);
      box(ctx, c[0] - 0.13, c[1] - 0.04, c[2] - 0.13, c[0] + 0.13, c[1], c[2] + 0.13);
      ctx.metalness(0); ctx.color("oklch(0.93 0.1 80)"); ctx.emissive(3.2, 2.0, 0.7);
      box(ctx, c[0] - 0.09, c[1], c[2] - 0.09, c[0] + 0.09, c[1] + 0.34, c[2] + 0.09);
      ctx.emissive(null);
    }
  }
  // stovepipe through the roof from the hearth side
  ctx.albedo(null); ctx.color("oklch(0.35 0.01 60)"); ctx.metalness(0.6); ctx.roughness(0.5);
  const sx = Math.cos(150 * D2R) * 4.1, sz = Math.sin(150 * D2R) * 4.1;
  box(ctx, sx - 0.13, 6.0, sz - 0.13, sx + 0.13, 8.4, sz + 0.13); box(ctx, sx - 0.24, 8.4, sz - 0.24, sx + 0.24, 8.5, sz + 0.24);
  ctx.metalness(0);
}
// ---- exterior dressing that reads from the path (lod <= 3) ----
const TX2 = { shingle: "cdn/texture-weathered-cedar-shingle-roof.png", mat: "cdn/texture-woven-jute-doormat-herringbone.png" };
const atF = (n, t, u, v, y) => [n[0] * v + t[0] * u, y, n[2] * v + t[2] * u];
// river-rock wainscot: two courses of proud fieldstones and a coped ledge along the foot of every face
function wainscot(ctx, k, lod) {
  const { n, t } = faceFrame(k), L = AO * TAN30 - 0.14, door = k === 1 || k === 4, gapW = H.doorW / 2 + 0.5;
  const spans = door ? [[-L, -gapW], [gapW, L]] : [[-L, L]];
  ctx.albedo(TX.stone); ctx.roughness(0.95); ctx.metalness(0);
  if (lod >= 3) {
    ctx.color("oklch(0.95 0.02 75)");
    for (const [u0, u1] of spans) obox(ctx, atF(n, t, (u0 + u1) / 2, AO + 0.035, 0), t, n, u1 - u0, 0.46, 0.07);
  } else {
    const cols = ["oklch(0.97 0.015 80)", "oklch(0.92 0.03 60)", "oklch(0.99 0.01 95)", "oklch(0.93 0.025 240)", "oklch(0.95 0.035 50)", "oklch(0.88 0.02 70)"];
    for (const [u0, u1] of spans) for (const [ry, rh, off] of [[0.03, 0.22, 0], [0.26, 0.2, 0.2]]) {
      let u = u0 + off * ctx.random();
      while (u < u1 - 0.12) {
        const w = Math.min(u1 - u, 0.32 + ctx.random() * 0.32), c = u + w / 2; u += w + 0.025;
        const h = rh * (0.78 + ctx.random() * 0.22), dd = 0.12 + ctx.random() * 0.04;
        ctx.color(cols[Math.floor(ctx.random() * cols.length)]);
        obox(ctx, atF(n, t, c, AO + 0.075 - dd / 2, ry + (rh - h) / 2), t, n, w, h, dd);
      }
    }
  }
  ctx.color("oklch(0.99 0.01 85)");
  for (const [u0, u1] of spans) {
    obox(ctx, atF(n, t, (u0 + u1) / 2, AO + 0.04, 0.46), t, n, u1 - u0, 0.06, 0.14);
    obox(ctx, atF(n, t, (u0 + u1) / 2, AO + 0.02, 0.52), t, n, u1 - u0, 0.03, 0.09);
  }
}
// windows: proud honey-oak frames, walnut lintels, dark warm glass in a deep reveal, sage shutters swung open, flower boxes
function windows(ctx, lod, beams) {
  const honey = () => { ctx.albedo(TX.timber); ctx.color("oklch(0.93 0.08 72)"); ctx.roughness(0.8); ctx.metalness(0); ctx.emissive(null); };
  const walnut = () => { ctx.albedo(TX.timber); ctx.color("oklch(0.6 0.07 50)"); ctx.roughness(0.8); ctx.metalness(0); };
  const sage = () => { ctx.albedo(TX.timber); ctx.color("#b9cca3"); ctx.roughness(0.85); ctx.metalness(0); };
  const bloom = ["#e8485f", "#f6c945", "#f4f0ea", "#c46be0", "#ff8a4c"], green = "#4f8a3c", SA = 50 * D2R;
  for (let k = 0; k < 6; k++) {
    const { n, t } = faceFrame(k), A = (u, v, y) => atF(n, t, u, v, y);
    for (const h of holesFor(k)) {
      walnut(); obox(ctx, A(h.u, AO + 0.06, h.y1), t, n, h.w + (h.door ? 0.6 : 0.5), 0.3, 0.24);
      honey();
      for (const s of [-1, 1]) obox(ctx, A(h.u + s * (h.w / 2 + 0.06), AO + 0.03, h.door ? h.y0 : h.y0 - 0.02), t, n, 0.12, h.y1 - h.y0 + 0.02, 0.15);
      if (h.door) continue;
      obox(ctx, A(h.u, AO + 0.07, h.y0 - 0.1), t, n, h.w + 0.34, 0.1, 0.26);
      if (lod < 3) { for (const s of [-1, 1]) obox(ctx, A(h.u + s * (h.w / 2 - 0.03), AO - 0.2, h.y0), t, n, 0.06, h.y1 - h.y0, 0.06); obox(ctx, A(h.u, AO - 0.2, (h.y0 + h.y1) / 2 - 0.03), t, n, h.w, 0.06, 0.06); obox(ctx, A(h.u, AO - 0.2, h.y0), t, n, 0.05, h.y1 - h.y0, 0.06); }
      ctx.albedo(null); ctx.color("oklch(0.34 0.04 62)", 0.72); ctx.roughness(0.06); ctx.metalness(0.3);
      const g0 = A(h.u - h.w / 2, AO - 0.23, 0), g1 = A(h.u + h.w / 2, AO - 0.23, 0);
      Q(ctx, [g0[0], h.y0, g0[2]], [g1[0], h.y0, g1[2]], [g1[0], h.y1, g1[2]], [g0[0], h.y1, g0[2]], n);
      ctx.metalness(0);
      if (h.y0 > H.A) continue;
      // shutters, hinged on the frame and swung out 50° from the wall
      for (const s of [-1, 1]) {
        const sw = h.w / 2 + 0.03, hinge = A(h.u + s * (h.w / 2 + 0.12), AO + 0.1, 0);
        const d = [t[0] * s * Math.cos(SA) + n[0] * Math.sin(SA), 0, t[2] * s * Math.cos(SA) + n[2] * Math.sin(SA)], pn = [d[2], 0, -d[0]];
        const out = pn[0] * n[0] + pn[2] * n[2] > 0 ? pn : [-pn[0], 0, -pn[2]], c = [hinge[0] + d[0] * sw / 2, h.y0 + 0.02, hinge[2] + d[2] * sw / 2];
        sage(); obox(ctx, c, d, out, sw, h.y1 - h.y0 - 0.04, 0.05);
        if (lod < 3) { walnut(); for (const f of [0.2, 0.8]) obox(ctx, [c[0] + out[0] * 0.035, c[1] + (h.y1 - h.y0) * f - 0.03, c[2] + out[2] * 0.035], d, out, sw - 0.06, 0.06, 0.025); obox(ctx, [c[0] + out[0] * 0.035, c[1] + 0.1, c[2] + out[2] * 0.035], d, out, 0.05, h.y1 - h.y0 - 0.24, 0.02); }
      }
      // flower box, spilling bright blooms
      walnut(); obox(ctx, A(h.u, AO + 0.2, h.y0 - 0.44), t, n, h.w + 0.16, 0.3, 0.28);
      ctx.albedo(null); ctx.roughness(0.9);
      const nb = lod < 3 ? Math.round(h.w * 8) : 3;
      for (let f = 0; f < nb; f++) { const u = h.u - h.w / 2 + (f + 0.5) * h.w / nb, c = A(u, AO + 0.2 + (f % 2 ? 0.05 : -0.03), 0); blob(ctx, c[0], h.y0 - 0.12 + (f % 2) * 0.04, c[2], 0.13, 0.12, 0.13, 4, [bloom[(f + k) % bloom.length], green]); }
      if (lod < 3) for (let f = 0; f < 3; f++) { const u = h.u + (f - 1) * h.w * 0.35, c = A(u, AO + 0.36, 0); blob(ctx, c[0], h.y0 - 0.5, c[2], 0.1, 0.16, 0.08, 4, [green, "#3f7a33"]); }
    }
  }
}
// the front portico: two rustic posts on stone pads 1.8 m out, a beam, a gabled shingle roof, a stone stoop and a mat
function portico(ctx, lod, collide, stone, beams) {
  const { n, t } = faceFrame(1), A = (u, v, y) => atF(n, t, u, v, y);
  const vp = AO + 1.8, up = 1.55, top = H.G + H.doorH + 0.45, bt = top + 0.26, ridge = bt + 0.9, ew = up + 0.5, v0 = AO + 0.02, v1 = vp + 0.42;
  if (collide) { for (const s of [-1, 1]) obox(ctx, A(s * up, vp, 0), t, n, 0.3, top, 0.3); obox(ctx, A(0, (AO + 0.88 + vp + 0.35) / 2, 0), t, n, 3.8, 0.07, vp + 0.35 - AO - 0.88); return; }
  ctx.metalness(0);
  // stoop and mat
  ctx.albedo(TX.flags); ctx.color("oklch(0.86 0.02 75)"); ctx.roughness(0.9);
  obox(ctx, A(0, (AO + 0.88 + vp + 0.35) / 2, 0), t, n, 3.8, 0.07, vp + 0.35 - AO - 0.88);
  ctx.albedo(TX2.mat); ctx.color("oklch(0.9 0.06 78)"); ctx.roughness(1);
  obox(ctx, A(0, AO + 1.25, 0.07), t, n, 1.25, 0.018, 0.72);
  ctx.albedo(null); ctx.color("oklch(0.5 0.1 35)");
  for (const s of [-1, 1]) obox(ctx, A(s * 0.54, AO + 1.25, 0.075), t, n, 0.07, 0.016, 0.66);
  // pads and posts
  stone(); ctx.color("oklch(0.8 0.02 70)");
  for (const s of [-1, 1]) { obox(ctx, A(s * up, vp, 0), t, n, 0.5, 0.2, 0.5); obox(ctx, A(s * up, vp, 0.2), t, n, 0.4, 0.06, 0.4); }
  ctx.albedo(TX.timber); ctx.color("oklch(0.66 0.07 52)"); ctx.roughness(0.85);
  for (const s of [-1, 1]) {
    obox(ctx, A(s * up, vp, 0.26), t, n, 0.26, top - 0.26, 0.26);
    if (lod < 3) { obox(ctx, A(s * up, vp, 0.26), t, n, 0.32, 0.12, 0.32); obox(ctx, A(s * up, vp, top - 0.14), t, n, 0.32, 0.14, 0.32); }
    beam(ctx, A(s * up, vp, top - 0.62), A(s * (up - 0.6), vp, top), 0.12, 0.12);
    beam(ctx, A(s * up, vp, top - 0.62), A(s * up, vp - 0.6, top), 0.12, 0.12);
    obox(ctx, A(s * up, (AO + vp) / 2 + 0.07, top), t, n, 0.2, 0.24, vp - AO + 0.14);
  }
  obox(ctx, A(0, vp, top), t, n, 2 * up + 0.7, 0.26, 0.28);
  obox(ctx, A(0, AO + 0.08, top), t, n, 2 * up + 0.4, 0.26, 0.16);
  // gable roof, ridge running out from the wall
  const R = (u, v, y) => A(u, v, y);
  for (const s of [-1, 1]) {
    const r0 = R(0, v0, ridge), r1 = R(0, v1, ridge), e0 = R(s * ew, v0, bt - 0.06), e1 = R(s * ew, v1, bt - 0.06), up3 = [0, 0.1, 0];
    const lift = (p) => [p[0], p[1] + 0.1, p[2]], nrmS = [t[0] * s * 0.7, 1, t[2] * s * 0.7];
    ctx.albedo(TX.timber); ctx.color("oklch(0.8 0.05 65)"); ctx.roughness(0.85);
    Q(ctx, r0, r1, e1, e0, [-nrmS[0], -1, -nrmS[2]]);
    Q(ctx, e0, e1, lift(e1), lift(e0), [t[0] * s, 0, t[2] * s]);
    ctx.albedo(TX2.shingle); ctx.color("oklch(0.82 0.05 50)"); ctx.roughness(0.95);
    Q(ctx, lift(r0), lift(r1), lift(e1), lift(e0), nrmS);
    if (lod < 3) for (let c = 1; c <= 3; c++) { const f = c / 4, a = [r0[0] + (e0[0] - r0[0]) * f, r0[1] + (e0[1] - r0[1]) * f + 0.12, r0[2] + (e0[2] - r0[2]) * f], b = [r1[0] + (e1[0] - r1[0]) * f, r1[1] + (e1[1] - r1[1]) * f + 0.12, r1[2] + (e1[2] - r1[2]) * f]; beam(ctx, a, b, 0.05, 0.035); }
    ctx.albedo(TX.timber); ctx.color("oklch(0.6 0.07 50)");
    beam(ctx, R(s * (ew + 0.02), v1 + 0.02, bt - 0.02), R(0, v1 + 0.02, ridge + 0.1), 0.07, 0.2);
  }
  ctx.albedo(TX.timber); ctx.color("oklch(0.6 0.07 50)"); beam(ctx, R(0, v0, ridge + 0.14), R(0, v1 + 0.05, ridge + 0.14), 0.14, 0.1);
  // gable boards
  ctx.color("oklch(0.93 0.08 72)");
  T3(ctx, R(-up - 0.35, vp + 0.15, bt), R(up + 0.35, vp + 0.15, bt), R(0, vp + 0.15, ridge - 0.05), n);
  if (lod < 3) { ctx.color("oklch(0.6 0.07 50)"); for (const u of [-0.7, 0, 0.7]) obox(ctx, R(u, vp + 0.17, bt), t, n, 0.05, (ridge - bt) * (1 - Math.abs(u) / (up + 0.35)) - 0.05, 0.02); }
}
function greenery(ctx) {
  const lod = Number(ctx.lod ?? 1); ctx.flat(); ctx.albedo(null); ctx.roughness(0.95);
  const leaf = ["#3f7a33", "#4f8a3c", "#6a9f45"], seg = lod >= 3 ? 4 : 6;
  for (let k = 0; k < 6; k++) {
    const { n, t } = faceFrame(k), L = AO * TAN30, door = k === 1 || k === 4;
    // bushes along the foot of the wall
    for (let i = 0; i < 10; i++) {
      const u = -L + 0.6 + (i / 9) * (2 * L - 1.2) + (ctx.random() - 0.5) * 0.3;
      if (door && Math.abs(u) < 1.75) continue;
      const r = 0.45 + ctx.random() * 0.3, d = AO + 0.55 + ctx.random() * 0.35;
      blob(ctx, n[0] * d + t[0] * u, r * 0.75, n[2] * d + t[2] * u, r, r * 0.85, r, seg, leaf);
      if (lod < 3 && ctx.random() < 0.55) { ctx.color(["#e8697c", "#f4d35e", "#f7f1e8", "#b784e0"][i % 4]); for (let f = 0; f < 5; f++) { const a = ctx.random() * 6.28, rr = r * 0.8; const x = n[0] * d + t[0] * u + Math.cos(a) * rr * 0.7, z = n[2] * d + t[2] * u + Math.sin(a) * rr * 0.7, y = r * 0.75 + r * 0.5; box(ctx, x - 0.05, y, z - 0.05, x + 0.05, y + 0.08, z + 0.05); } }
    }
    if (lod >= 3) continue;
    // climbing roses on a trellis beside the windows
    if (!door) for (const u of [-3.4, 3.4]) {
      ctx.color("#8a6a48"); for (let j = 0; j < 4; j++) { const uu = u - 0.3 + j * 0.2; obox(ctx, [n[0] * (AO + 0.06) + t[0] * uu, 0.1, n[2] * (AO + 0.06) + t[2] * uu], t, n, 0.03, 3.2, 0.03); }
      for (let j = 0; j < 22; j++) { const uu = u + (ctx.random() - 0.5) * 0.8, y = 0.3 + ctx.random() * 3.1, c = [n[0] * (AO + 0.12) + t[0] * uu, y, n[2] * (AO + 0.12) + t[2] * uu];
        blob(ctx, c[0], c[1], c[2], 0.16, 0.14, 0.16, 4, leaf); if (j % 3 === 0) { ctx.color("#d9485f"); box(ctx, c[0] - 0.05 + n[0] * 0.1, y, c[2] - 0.05 + n[2] * 0.1, c[0] + 0.05 + n[0] * 0.1, y + 0.08, c[2] + 0.05 + n[2] * 0.1); } }
    }
    // potted ferns flanking the steps
    if (door) for (const sgn of [-1, 1]) {
      const c = [n[0] * (AO + 0.45) + t[0] * sgn * 1.45, 0, n[2] * (AO + 0.45) + t[2] * sgn * 1.45];
      ctx.color("oklch(0.55 0.1 45)"); obox(ctx, c, t, n, 0.5, 0.45, 0.5);
      blob(ctx, c[0], 0.75, c[2], 0.38, 0.4, 0.38, seg, leaf);
    }
  }
}
// The living roof in bloom (params.part "roofbloom"): moss mounds and sedum cushions for texture, drifts of wildflowers
// in colour patches (poppy, cornflower, oxeye, buttercup, clover, lavender, coneflower), and vines trailing off the eave edge.
function roofBloom(ctx) {
  const lod = Number(ctx.lod ?? 1);
  ctx.flat(); ctx.albedo(null); ctx.roughness(0.95);
  const eAp = H.eaveR * COS30, dAp = H.deckR * COS30, dy = H.D - H.eaveY;
  const V = (r, k) => [Math.cos(60 * k * D2R) * r, Math.sin(60 * k * D2R) * r];
  const at = (k, f, g) => { // f along the face, g from eave (0) to deck (1)
    const e0 = V(H.eaveR - 0.25, k), e1 = V(H.eaveR - 0.25, k + 1), d0 = V(H.deckR + 0.35, k), d1 = V(H.deckR + 0.35, k + 1);
    const x = (e0[0] + (e1[0] - e0[0]) * f) * (1 - g) + (d0[0] + (d1[0] - d0[0]) * f) * g, z = (e0[1] + (e1[1] - e0[1]) * f) * (1 - g) + (d0[1] + (d1[1] - d0[1]) * f) * g;
    const p = Math.hypot(x, z) * Math.cos(((((Math.atan2(z, x) / D2R) % 60) + 60) % 60 - 30) * D2R);
    return [x, H.eaveY + (eAp - p) / (eAp - dAp) * dy - 0.02, z];
  };
  const F = [ // petal colour, centre colour, height, size
    ["#e0413a", "#2a1a14", 0.42, 0.09], ["#4f7fe0", "#2c3f86", 0.38, 0.07], ["#f6f2e6", "#f0c22e", 0.4, 0.08],
    ["#f2cf2e", "#d99a1c", 0.3, 0.06], ["#e59ac8", "#c2548d", 0.2, 0.06], ["#9a74d8", "#6e4aa8", 0.45, 0.05], ["#ec7d3a", "#5a2f18", 0.5, 0.1],
  ];
  if (lod >= 4) { const cols = F.map((f) => f[0]); for (let k = 0; k < 6; k++) for (let i = 0; i < 5; i++) { const [x, y, z] = at(k, 0.1 + ctx.random() * 0.8, 0.1 + ctx.random() * 0.7), r = 0.5 + ctx.random() * 0.4; ctx.color(cols[(k * 5 + i) % cols.length]); ctx.tri(x - r, y + 0.1, z, x + r * 0.5, y + 0.1, z + r * 0.87, x + r * 0.5, y + 0.1, z - r * 0.87); } return; }
  const moss = ["#5f8a3a", "#6f9a44", "#809f4c", "#8aa35a"], sedum = ["#a8b458", "#c18a6a", "#b4c070"];
  for (let k = 0; k < 6; k++) {
    // texture: low moss mounds and sedum cushions
    for (let i = 0; i < (lod <= 1 ? 26 : 14); i++) {
      const [x, y, z] = at(k, 0.05 + ctx.random() * 0.9, ctx.random() * 0.92), r = 0.25 + ctx.random() * 0.35, sd = ctx.random() < 0.3;
      blob(ctx, x, y + r * 0.12, z, r, r * 0.28, r, 5, sd ? sedum : moss);
    }
    // grass clumps
    for (let i = 0; i < (lod <= 1 ? 40 : 18); i++) {
      const [x, y, z] = at(k, ctx.random(), ctx.random() * 0.95);
      ctx.color(i % 3 ? "#6f9a48" : "#94b25a");
      for (let b = 0; b < 3; b++) { const a = ctx.random() * 6.28, h = 0.25 + ctx.random() * 0.25; ctx.tri(x - 0.04, y, z, x + 0.04, y, z, x + Math.cos(a) * 0.12, y + h, z + Math.sin(a) * 0.12); }
    }
    // flower drifts: each patch one kind, so the colour reads in swathes
    for (let d = 0; d < (lod <= 1 ? 7 : 4); d++) {
      const kind = F[Math.floor(ctx.random() * F.length)], cf = 0.1 + ctx.random() * 0.8, cg = 0.08 + ctx.random() * 0.8;
      const n = lod <= 1 ? 16 : lod <= 2 ? 9 : 5;
      for (let i = 0; i < n; i++) {
        const [x, y, z] = at(k, Math.min(0.98, Math.max(0.02, cf + (ctx.random() - 0.5) * 0.25)), Math.min(0.95, Math.max(0, cg + (ctx.random() - 0.5) * 0.3)));
        const h = kind[2] * (0.7 + ctx.random() * 0.6), s = kind[3] * (0.8 + ctx.random() * 0.4), tx = x + (ctx.random() - 0.5) * 0.06, tz = z + (ctx.random() - 0.5) * 0.06;
        ctx.color("#5b8a3a"); ctx.tri(x - 0.012, y, z, x + 0.012, y, z, tx, y + h, tz); ctx.tri(x, y, z - 0.012, x, y, z + 0.012, tx, y + h, tz);
        const top = y + h, pet = lod <= 2 ? 6 : 4;
        ctx.color(kind[0]);
        for (let q = 0; q < pet; q++) { const a = q / pet * 6.283 + ctx.random() * 0.3, w = 3.1416 / pet; ctx.tri(tx, top, tz, tx + Math.cos(a - w) * s, top + 0.01, tz + Math.sin(a - w) * s, tx + Math.cos(a + w) * s, top + 0.01, tz + Math.sin(a + w) * s); }
        if (lod <= 2) { ctx.color(kind[1]); const c = s * 0.35; box(ctx, tx - c, top + 0.005, tz - c, tx + c, top + 0.03, tz + c); }
      }
    }
    // vines trailing off the eave edge (not over the two doors)
    const door = k === 1 || k === 4, e0 = V(H.eaveR + 0.02, k), e1 = V(H.eaveR + 0.02, k + 1), nv = lod <= 1 ? 16 : 9;
    for (let i = 0; i < nv; i++) {
      const f = (i + 0.5 + (ctx.random() - 0.5) * 0.6) / nv, u = (f - 0.5) * 2 * H.eaveR * 0.5;
      if (door && Math.abs(u) < 2.2) continue;
      if (ctx.random() < 0.25) continue;
      const x = e0[0] + (e1[0] - e0[0]) * f, z = e0[1] + (e1[1] - e0[1]) * f, len = 0.5 + ctx.random() * 1.5, sway = (ctx.random() - 0.5) * 0.25;
      let y = H.eaveY + 0.05; const seg = Math.max(3, Math.round(len / 0.18));
      ctx.color("#4c6e30"); box(ctx, x - 0.015, H.eaveY - len, z - 0.015, x + 0.015, y, z + 0.015);
      for (let j = 0; j < seg; j++) {
        const yy = y - (j / seg) * len, ox = x + Math.sin(j * 0.9) * sway * (j / seg), oz = z + Math.cos(j * 0.9) * sway * (j / seg), r = 0.09 + ctx.random() * 0.06 - j / seg * 0.03;
        blob(ctx, ox, yy, oz, r, r * 0.7, r, 4, ["#3f7a33", "#4f8a3c", "#5f9a45"]);
        if (lod <= 2 && ctx.random() < 0.2) { ctx.color(ctx.random() < 0.5 ? "#b784e0" : "#f7f1e8"); box(ctx, ox - 0.04, yy - 0.06, oz - 0.04, ox + 0.04, yy, oz + 0.04); }
      }
    }
  }
}
export function geometry(ctx) { if (ctx.params?.part === "roofbloom") return roofBloom(ctx); if (ctx.params?.part === "greenery") return greenery(ctx); build(ctx, false); }
export function collider(ctx) { if (ctx.params?.part === "greenery" || ctx.params?.part === "roofbloom") return; build(ctx, true); }
