// Lumenvale the capital: one family by params.kind — wall (curtain ring, towers, moat), gate (gatehouse + causeway),
// keep (mound, curtain, donjon, spires), cathedral, district (townhouse lots for an angular sector), statues.
// City-frame kinds (wall, district, statues) stand at the city centre with yaw 0. Lots are deterministic so geometry and collider agree.
import { kit, C, TEX, yawToward } from "./lumen-kit.js";
const R2 = Math.PI / 180, pol = (r, a, y = 0) => [Math.cos(a * R2) * r, y, Math.sin(a * R2) * r];
const SLATE = "cdn/texture-blue-slate-roof-shingles.png", PLASTER = "cdn/texture-warm-lime-plaster-wall.png";
const SL = "oklch(0.9 0.035 250)", GOLD = C.trim, WOOD = "oklch(0.38 0.05 50)", BLUE = "oklch(0.45 0.14 260)", WATER = "oklch(0.58 0.08 212)";
const PLAST = ["oklch(0.96 0.03 85)", "oklch(0.93 0.05 75)", "oklch(0.94 0.04 55)", "oklch(0.95 0.03 105)", "oklch(0.92 0.05 40)"];
const PAST = ["oklch(0.93 0.05 25)", "oklch(0.93 0.04 230)", "oklch(0.95 0.05 90)", "oklch(0.93 0.05 150)", "oklch(0.94 0.04 60)"];
const inR = (a, a0, a1) => ((a - a0) % 360 + 360) % 360 < ((a1 - a0) % 360 + 360) % 360;
function sector(K, r0, r1, a0, a1, y0, y1, n, sides = true) {
  for (let i = 0; i < n; i++) { const b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n, bm = (b0 + b1) / 2, rn = [Math.cos(bm * R2), 0, Math.sin(bm * R2)];
    K.q(pol(r0, b0, y1), pol(r1, b0, y1), pol(r1, b1, y1), pol(r0, b1, y1), [0, 1, 0]);
    if (sides) { K.q(pol(r1, b0, y0), pol(r1, b1, y0), pol(r1, b1, y1), pol(r1, b0, y1), rn); if (r0 > 0.01) K.q(pol(r0, b0, y0), pol(r0, b1, y0), pol(r0, b1, y1), pol(r0, b0, y1), [-rn[0], 0, -rn[2]]); } }
  if (sides && a1 - a0 < 359) for (const [a, sg] of [[a0, -1], [a1, 1]]) K.q(pol(r0, a, y0), pol(r1, a, y0), pol(r1, a, y1), pol(r0, a, y1), [-Math.sin(a * R2) * sg, 0, Math.cos(a * R2) * sg]);
}
const flat = (K, x0, y0, x1, y1, z, n = -1) => K.q([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, 0, n]);
const sideFlat = (K, x, z0, y0, z1, y1, n) => K.q([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], [n, 0, 0]);
function banner(K, x, y, z, w, h, nz = -1) { // hanging blue banner with gold chevron and rod, on a plane z facing nz
  K.tex(null).paint(BLUE, null, 0.9); K.q([x - w / 2, y - h, z], [x + w / 2, y - h, z], [x + w / 2, y, z], [x - w / 2, y, z], [0, 0, nz]);
  K.t([x - w / 2, y - h - 0.8, z], [x + w / 2, y - h - 0.8, z], [x, y - h, z], [0, 0, nz]); K.t([x - w / 2, y - h, z], [x - w / 2, y - h - 0.8, z], [x, y - h, z], [0, 0, nz]); K.t([x + w / 2, y - h - 0.8, z], [x + w / 2, y - h, z], [x, y - h, z], [0, 0, nz]);
  const z2 = z + nz * 0.02; K.paint(GOLD, null, 0.35, 0.6);
  K.q([x - w / 2, y - h * 0.55, z2], [x, y - h * 0.3, z2], [x, y - h * 0.18, z2], [x - w / 2, y - h * 0.43, z2], [0, 0, nz]); K.q([x, y - h * 0.3, z2], [x + w / 2, y - h * 0.55, z2], [x + w / 2, y - h * 0.43, z2], [x, y - h * 0.18, z2], [0, 0, nz]);
  K.box(x - w / 2 - 0.2, y - 0.1, z + nz * 0.15 - 0.08, x + w / 2 + 0.2, y + 0.1, z + nz * 0.15 + 0.08);
}
function tower(K, L, cx, cz, r, h, rh, S, n) { // round tower, parapet, slate cone, gold finial
  if (S) { K.prism(cx, cz, r, r, 0, h + 1.4, 10); return; }
  K.tex(TEX.stone).paint(C.stone); K.prism(cx, cz, r, r, 0, h, n, 0, ""); K.annulus(cx, cz, r - 0.6, r + 0.5, h, h + 1.4, n);
  if (L <= 2) { K.tex(null).paint(GOLD, null, 0.35, 0.6); K.annulus(cx, cz, r + 0.02, r + 0.12, h - 1.2, h - 0.9, n);
    K.paint(C.glass); for (let k = 0; k < 4; k++) { const a = k * 90 + 45, ca = Math.cos(a * R2), sa = Math.sin(a * R2), rr = r + 0.03;
      for (const y of [h * 0.35, h * 0.65]) K.q([cx + ca * rr - sa * 0.35, y, cz + sa * rr + ca * 0.35], [cx + ca * rr + sa * 0.35, y, cz + sa * rr - ca * 0.35], [cx + ca * rr + sa * 0.35, y + 1.8, cz + sa * rr - ca * 0.35], [cx + ca * rr - sa * 0.35, y + 1.8, cz + sa * rr + ca * 0.35], [ca, 0, sa]); } }
  K.tex(SLATE).paint(SL, null, 0.6); K.cone(cx, cz, r + 0.9, h + 1.4, h + 1.4 + rh, n);
  if (L <= 3) { K.tex(null).paint(GOLD, null, 0.3, 0.7); K.bipyr(cx, h + 1.4 + rh + 0.4, cz, 0.35, 1.6, 0.5, 4); }
}
// ---------- lots ----------
const LANE = [[-92.7, -24.8], [-92.9, -36.6], [-90, -47.8], [-83.4, -57.3], [-74, -64.3], [-63.4, -69.2], [-53.4, -73.4], [-44.4, -78.4], [-36, -84.9], [-27.3, -92.1], [-17.4, -98.4], [-6.2, -101.7], [5.3, -101], [16.2, -96.6], [25.9, -90.2], [34.7, -83.8], [43.7, -78.8], [53.6, -75.1], [64.4, -71.5], [74.9, -66.3], [83.5, -58.5], [88.8, -48.2], [90.7, -36.6], [90.3, -25], [89.6, -14.2]];
const RAD = [[175, 10, 40], [85, 7, 40], [-95, 7, 40], [-5, 7, 40], [45, 4, 56], [135, 4, 56], [-135, 4, 56], [-45, 4, 56],
  [67.5, 3, 108], [112.5, 3, 108], [157.5, 3, 108], [-157.5, 3, 108], [-112.5, 3, 108], [-67.5, 3, 108], [-22.5, 3, 108], [20, 8.5, 88]];
const CIRC = [[...pol(112, 130)], [...pol(112, -140)], [...pol(112, 40)], [...pol(112, -50)], [...pol(156, 170)], [...pol(156, -179)]].map((p) => [p[0], p[2], 9])
  .concat([[-5, -118, 37], [...[pol(132, 175)].map((p) => [p[0], p[2]])[0], 19], [...[pol(170, 175)].map((p) => [p[0], p[2]])[0], 14]]);
const CATH = { o: pol(106, 85), u: [Math.cos(85 * R2), Math.sin(85 * R2)] };
const BANDS = [{ r0: 72, r1: 84, out: 1, f: [3, 4] }, { r0: 92, r1: 104, out: 0, f: [3, 4] }, { r0: 112, r1: 124, out: 1, f: [3, 4] }, { r0: 132, r1: 144, out: 0, f: [3, 4] }, { r0: 151, r1: 162, out: 1, f: [3, 3] }];
function rng(s) { return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function segD(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], l = dx * dx + dz * dz || 1; let t = ((x - a[0]) * dx + (z - a[1]) * dz) / l; t = Math.max(0, Math.min(1, t)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
function blocked(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x) / R2;
  for (const [ra, hw, rs] of RAD) { if (r < rs - 2) continue; const da = Math.abs(((a - ra) % 360 + 540) % 360 - 180); if (da < 90 && r * Math.sin(da * R2) < hw) return true; }
  for (const [cx, cz, cr] of CIRC) if (Math.hypot(x - cx, z - cz) < cr) return true;
  const px = x - CATH.o[0], pz = z - CATH.o[2], al = px * CATH.u[0] + pz * CATH.u[1], lat = -px * CATH.u[1] + pz * CATH.u[0];
  if (al > -16 && al < 62 && Math.abs(lat) < 25) return true;
  for (let i = 0; i + 1 < LANE.length; i++) if (segD(x, z, LANE[i], LANE[i + 1]) < 7.5) return true;
  return false;
}
let LOTS = null;
function lots() {
  if (LOTS) return LOTS; const R = rng(90210), out = [];
  BANDS.forEach((b, bi) => { const rf = b.out ? b.r1 : b.r0, d = b.r1 - b.r0, rc = (b.r0 + b.r1) / 2; let a = -180 + bi * 3.7; const end = a + 360;
    while (a < end - 2) { const narrow = inR(a, -45, 45), w = narrow ? 5.2 + R() * 2.2 : 6.2 + R() * 3.2, da = w / rf / R2, am = a + da / 2;
      const f = b.f[0] + Math.floor(R() * (b.f[1] - b.f[0] + 1)), roof = Math.floor(R() * 3), col = Math.floor(R() * 5), chim = R() < 0.6, extra = R(); a += da;
      const ux = Math.cos(am * R2), uz = Math.sin(am * R2), cx = ux * rc, cz = uz * rc, dir = b.out ? 1 : -1; let bad = blocked(cx, cz);
      for (const s of [-1, 1]) for (const t of [-1, 1]) bad = bad || blocked(cx + ux * s * d / 2 - uz * t * w / 2, cz + uz * s * d / 2 + ux * t * w / 2);
      if (!bad) out.push({ x: cx, z: cz, a: am, w, d, f, roof, col, chim, extra, yaw: yawToward(ux * dir, uz * dir) }); } });
  return (LOTS = out);
}
function house(K, L, h, st0, S) {
  const st = st0 === "mixed" ? (h.extra < 0.5 ? "stone" : "timber") : st0;
  const w = h.w / 2 - 0.05, d = h.d, z0 = -d / 2, z1 = d / 2, G = 4.2, f = st === "canal" ? h.f + 1 : h.f, H = G + 3.3 * (f - 1), jet = st === "timber" && L <= 3 ? 0.5 : 0, zf = z0 - jet;
  if (S) { K.box(-w, 0, z0, w, H, z1, "b"); return; }
  const wallTex = () => st === "stone" ? K.tex(TEX.stone).paint(C.stone) : K.tex(PLASTER).paint((st === "canal" ? PAST : PLAST)[h.col]);
  K.tex(TEX.stone).paint(C.plinth); K.box(-w, 0, z0, w, G, z1, "bt");
  wallTex(); K.box(-w, G, zf, w, H, z1, "bt"); if (jet) K.q([-w, G, zf], [w, G, zf], [w, G, z0], [-w, G, z0], [0, -1, 0]);
  const rt = st === "canal" ? 1 : h.roof, ov = 0.35;
  let rh;
  if (rt === 0) { rh = Math.min(d * 0.42, 6.5); const zm = (zf + z1) / 2, Y = H + rh;
    K.tex(SLATE).paint(SL, null, 0.65); K.q([-w - ov, H, zf - ov], [w + ov, H, zf - ov], [w + ov, Y, zm], [-w - ov, Y, zm], [0, 1, -1]); K.q([w + ov, H, z1 + ov], [-w - ov, H, z1 + ov], [-w - ov, Y, zm], [w + ov, Y, zm], [0, 1, 1]);
    wallTex(); K.t([-w, H, zf], [-w, H, z1], [-w, Y, zm], [-1, 0, 0]); K.t([w, H, z1], [w, H, zf], [w, Y, zm], [1, 0, 0]);
    if (L === 1 && h.extra > 0.35) { const dz = zf + (zm - zf) * 0.45, dy = H + rh * 0.45; K.box(-0.8, dy - 0.6, dz - 0.9, 0.8, dy + 1.3, dz + 0.4, "bk"); K.tex(null).paint(C.glass, null, 0.2, 0.3); flat(K, -0.5, dy - 0.3, 0.5, dy + 1, dz - 0.93);
      K.tex(SLATE).paint(SL); K.q([-1, dy + 1.3, dz - 1.1], [0, dy + 2, dz - 1.1], [0, dy + 2, dz + 0.4], [-1, dy + 1.3, dz + 0.4], [-1, 1, 0]); K.q([0, dy + 2, dz - 1.1], [1, dy + 1.3, dz - 1.1], [1, dy + 1.3, dz + 0.4], [0, dy + 2, dz + 0.4], [1, 1, 0]); }
  } else if (rt === 1) { rh = Math.min(w * (st === "canal" ? 1.7 : 1.25), 7); const Y = H + rh;
    K.tex(SLATE).paint(SL, null, 0.65); K.q([-w - ov, H, z1 + ov], [-w - ov, H, zf - ov], [0, Y, zf - ov], [0, Y, z1 + ov], [-1, 1, 0]); K.q([w + ov, H, zf - ov], [w + ov, H, z1 + ov], [0, Y, z1 + ov], [0, Y, zf - ov], [1, 1, 0]);
    wallTex(); K.t([w, H, zf], [-w, H, zf], [0, Y, zf], [0, 0, -1]); K.t([-w, H, z1], [w, H, z1], [0, Y, z1], [0, 0, 1]);
    if (L <= 2) { K.tex(null).paint(C.glass, null, 0.2, 0.3); flat(K, -0.45, H + rh * 0.2, 0.45, H + rh * 0.2 + 1.3, zf - 0.04);
      if (st === "canal") { K.paint(GOLD, null, 0.3, 0.7); K.bipyr(0, Y + 0.3, zf, 0.25, 0.8, 0.3, 4); K.paint("oklch(0.97 0.01 90)"); for (const s of [-1, 1]) K.q([s * w, H, zf - 0.05], [s * w * 0.1, Y - 0.3, zf - 0.05], [s * w * 0.1, Y, zf - 0.05], [s * (w + 0.25), H, zf - 0.05], [0, 0, -1]); } }
  } else { rh = Math.min(d * 0.34, 5); const Y = H + rh, ih = Math.min(w * 0.7, d * 0.4), zm = (zf + z1) / 2;
    K.tex(SLATE).paint(SL, null, 0.65); K.q([-w - ov, H, zf - ov], [w + ov, H, zf - ov], [w - ih, Y, zm], [-w + ih, Y, zm], [0, 1, -1]); K.q([w + ov, H, z1 + ov], [-w - ov, H, z1 + ov], [-w + ih, Y, zm], [w - ih, Y, zm], [0, 1, 1]);
    K.t([-w - ov, H, z1 + ov], [-w - ov, H, zf - ov], [-w + ih, Y, zm], [-1, 1, 0]); K.t([w + ov, H, zf - ov], [w + ov, H, z1 + ov], [w - ih, Y, zm], [1, 1, 0]); }
  if (h.chim && L <= 3) { const cx = (h.extra > 0.5 ? 1 : -1) * w * 0.55; K.tex(TEX.stone).paint(C.plinth); K.box(cx - 0.45, H + rh * 0.3, z1 - 2.1, cx + 0.45, H + rh + 1.1, z1 - 1.2, "b"); }
  if (L >= 3) return;
  K.tex(null);
  const n = Math.max(1, Math.floor(2 * w / 2.3)), sp = 2 * w / n;
  if (st === "timber") { K.paint(WOOD, null, 0.9); const zt = zf - 0.03;
    for (let k = 0; k < f; k++) { const y = G + 3.3 * k; flat(K, -w, y, w, y + 0.24, zt); }
    for (let i = 0; i <= n; i++) { const x = Math.max(-w, Math.min(w - 0.24, -w + sp * i - 0.12)); flat(K, x, G, x + 0.24, H, zt); }
    if (L === 1) for (let k = 1; k < f; k++) { const y = G + 3.3 * (k - 1); for (const s of [-1, 1]) K.q([s * w, y + 0.2, zt], [s * (w - 0.25), y + 0.2, zt], [s * (w - sp * 0.3), y + 3.3, zt], [s * (w - sp * 0.3 + 0.25), y + 3.3, zt], [0, 0, -1]); } }
  for (let k = 1; k < f; k++) { const y0 = G + 3.3 * (k - 1) + 0.8, y1 = y0 + 1.75;
    for (let i = 0; i < n; i++) { const x = -w + sp * (i + 0.5);
      if (L === 1 && st !== "timber") { K.paint(st === "stone" ? GOLD : "oklch(0.97 0.01 90)", null, 0.5, st === "stone" ? 0.4 : 0); flat(K, x - 0.72, y0 - 0.22, x + 0.72, y1 + (st === "stone" ? 0.45 : 0.2), zf - 0.03); }
      K.paint(C.glass, null, 0.2, 0.3); flat(K, x - 0.52, y0, x + 0.52, y1, zf - 0.05); } }
  if (st === "stone") { K.paint(GOLD, null, 0.35, 0.6); flat(K, -w - 0.05, H - 0.3, w + 0.05, H - 0.05, zf - 0.06); flat(K, -w, G - 0.2, w, G, z0 - 0.04); }
  const shop = st0 === "timber" && h.extra > 0.3 && w > 3.2, dx = shop ? w - 1.4 : 0;
  K.paint(GOLD, null, 0.4, 0.5); flat(K, dx - 0.85, 0, dx + 0.85, 3.05, z0 - 0.03); K.paint(WOOD, null, 0.8); flat(K, dx - 0.65, 0, dx + 0.65, 2.75, z0 - 0.05);
  K.paint(C.glass, null, 0.2, 0.3);
  if (shop) { flat(K, -w + 0.7, 0.7, w - 2.6, 3, z0 - 0.05); if (L === 1) { const cols = [BLUE, GOLD], m = 5; for (let i = 0; i < m; i++) { K.paint(cols[i % 2], null, 0.9); const a = -w + 0.5 + (2 * w - 1) * i / m, b = -w + 0.5 + (2 * w - 1) * (i + 1) / m; K.q([a, 3.5, z0 - 0.05], [b, 3.5, z0 - 0.05], [b, 2.9, z0 - 1.5], [a, 2.9, z0 - 1.5], [0, 1, -1]); } } }
  else if (w > 2.6) for (const s of [-1, 1]) flat(K, s * (w * 0.55) - 0.6, 1, s * (w * 0.55) + 0.6, 3, z0 - 0.05);
}
function market(K, L, S) {
  const c = pol(132, 175), ax = [Math.cos(175 * R2), Math.sin(175 * R2)];
  for (let i = 0; i < 12; i++) { const a = i * 30 + 15, x = c[0] + Math.cos(a * R2) * 14, z = c[2] + Math.sin(a * R2) * 14;
    if (Math.abs(-(x - c[0]) * ax[1] + (z - c[2]) * ax[0]) < 8) continue;
    K.at(x, 0, z, yawToward(c[0] - x, c[2] - z));
    if (S) { K.box(-1.6, 0, -0.5, 1.6, 1, 0.5); continue; }
    K.tex(null).paint(C.wood, null, 0.8); K.box(-1.6, 0, -0.5, 1.6, 1, 0.5, "b");
    if (L >= 4) continue; for (const [px, pz] of [[-1.5, -0.6], [1.5, -0.6], [-1.5, 1.2], [1.5, 1.2]]) K.box(px - 0.06, 0, pz - 0.06, px + 0.06, pz < 0 ? 2.5 : 2.9, pz + 0.06, "b");
    for (let k = 0; k < 4; k++) { K.paint(k % 2 ? GOLD : BLUE, null, 0.9); const a0 = -1.7 + k * 0.85, a1 = a0 + 0.85; K.q([a0, 2.5, -0.9], [a1, 2.5, -0.9], [a1, 2.95, 1.3], [a0, 2.95, 1.3], [0, 1, -0.3]); }
    if (L <= 2) { K.paint(["oklch(0.7 0.18 40)", "oklch(0.75 0.16 130)", "oklch(0.8 0.15 90)"][i % 3], null, 0.8); K.box(-1.3, 1, -0.35, 1.2, 1.25, 0.3, "b"); } }
  K.at(0, 0, 0, 0); if (S || L >= 4) return;
  for (const r of [92, 112, 150]) for (const s of [-1, 1]) { const p = pol(r, 175 + s * (11 / r) / R2), x = p[0], z = p[2]; // banner poles along the processional
    K.at(x, 0, z, yawToward(-ax[1] * s, ax[0] * s) + 90); K.tex(null).paint(GOLD, null, 0.3, 0.7); K.prism(0, 0, 0.12, 0.1, 0, 9, 6); K.bipyr(0, 9.2, 0, 0.2, 0.6, 0.2, 4); banner(K, 0, 8.4, 0.2, 1.3, 4.2, -1); banner(K, 0, 8.4, 0.2, 1.3, 4.2, 1); }
  K.at(0, 0, 0, 0);
}
function canal(K, L, S) {
  const u = [Math.cos(20 * R2), Math.sin(20 * R2)], v = [-u[1], u[0]], P = (r, l, y) => [u[0] * r + v[0] * l, y, u[1] * r + v[1] * l];
  if (!S) { K.tex(null).paint(WATER, null, 0.06, 0.25); K.q(P(92, -4, 0.07), P(177, -4, 0.07), P(177, 4, 0.07), P(92, 4, 0.07), [0, 1, 0]);
    K.tex(TEX.stone).paint(C.plinth); for (const s of [-1, 1]) { const a = s * 4, b = s * 4.6; K.q(P(92, a, 0.5), P(177, a, 0.5), P(177, b, 0.5), P(92, b, 0.5), [0, 1, 0]); K.q(P(92, a, 0), P(177, a, 0), P(177, a, 0.5), P(92, a, 0.5), [-v[0] * s, 0, -v[1] * s]); }
    K.q(P(91.4, -4.6, 0.5), P(91.4, 4.6, 0.5), P(92, 4.6, 0.5), P(92, -4.6, 0.5), [0, 1, 0]); K.q(P(92, -4, 0), P(92, 4, 0), P(92, 4, 0.5), P(92, -4, 0.5), [u[0], 0, u[1]]);
    K.tex(null).paint("oklch(0.3 0.03 230)"); for (let k = 0; k < 8; k++) { const t0 = Math.PI * k / 8, t1 = Math.PI * (k + 1) / 8; K.t(P(177.4, 0, 0.1), P(177.4, Math.cos(t0) * 3.6, 0.1 + Math.sin(t0) * 3.6), P(177.4, Math.cos(t1) * 3.6, 0.1 + Math.sin(t1) * 3.6), [-u[0], 0, -u[1]]); } }
  for (const r of [128, 169]) { const n = L >= 4 ? 3 : 8, hy = (l) => 0.3 + 1.3 * (1 - (l / 7.5) ** 2);
    if (!S) K.tex(TEX.paving).paint(C.plinth);
    for (let i = 0; i < n; i++) { const l0 = -7.5 + 15 * i / n, l1 = -7.5 + 15 * (i + 1) / n, y0 = hy(l0), y1 = hy(l1);
      K.q(P(r - 3, l0, y0), P(r - 3, l1, y1), P(r + 3, l1, y1), P(r + 3, l0, y0), [0, 1, 0]);
      for (const s of [-1, 1]) { const rr = r + s * 3, ri = r + s * 2.6; K.q(P(rr, l0, y0 - 0.9), P(rr, l1, y1 - 0.9), P(rr, l1, y1 + 1), P(rr, l0, y0 + 1), [u[0] * s, 0, u[1] * s]); K.q(P(ri, l0, y0), P(ri, l1, y1), P(ri, l1, y1 + 1), P(ri, l0, y0 + 1), [-u[0] * s, 0, -u[1] * s]); K.q(P(ri, l0, y0 + 1), P(ri, l1, y1 + 1), P(rr, l1, y1 + 1), P(rr, l0, y0 + 1), [0, 1, 0]); } } }
}
const B = {
  wall(K, L, p, S) {
    const R = 180, T = 2.5, H = 12, g = 5.6, a0 = 175 + g, a1 = 175 - g + 360, seg = L >= 4 ? 8 : L >= 3 ? 4 : 2, n = Math.ceil((a1 - a0) / seg), nT = L >= 4 ? 8 : L >= 3 ? 12 : 20;
    if (!S) K.tex(TEX.stone).paint(C.stone);
    sector(K, R - T, R + T, a0, a1, 0, H, n);
    if (!S && L <= 3) { sector(K, R + T - 0.7, R + T, a0, a1, H, H + 1.2, n); sector(K, R - T, R - T + 0.5, a0, a1, H, H + 1, n);
      K.tex(TEX.stone).paint(C.plinth); for (let i = 0; i < n; i++) { const b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n, bm = (b0 + b1) / 2; K.q(pol(R + T + 1.8, b0, 0), pol(R + T + 1.8, b1, 0), pol(R + T, b1, 2.4), pol(R + T, b0, 2.4), [Math.cos(bm * R2), 0.6, Math.sin(bm * R2)]); } }
    if (!S && L <= 2) { K.tex(TEX.stone).paint(C.stone); for (let i = 0; i < n; i++) { const b0 = a0 + (a1 - a0) * i / n; sector(K, R + T - 0.7, R + T, b0, b0 + (a1 - a0) / n * 0.5, H + 1.2, H + 2.3, 1); }
      K.tex(null).paint(GOLD, null, 0.35, 0.6); sector(K, R + T, R + T + 0.08, a0, a1, 9.6, 9.9, n); }
    for (const a of [205, 235, 265, 295, 325, 355, 25, 55, 85, 115, 145]) { const c = pol(R, a); tower(K, L, c[0], c[2], 7.5, 19, 13, S, nT); K.at(0, 0, 0, 0); }
    if (S) return;
    const m = L >= 4 ? 36 : L >= 3 ? 72 : 144; K.tex(null).paint(WATER, null, 0.06, 0.25); sector(K, 186, 196, 0, 360, 0, 0.07, m, false);
    if (L <= 3) { K.tex(TEX.stone).paint(C.plinth); K.annulus(0, 0, 185.4, 186, 0, 0.5, m); K.annulus(0, 0, 196, 196.6, 0, 0.5, m); }
  },
  gate(K, L, p, S) { // local −Z is outward (west); passage along z
    if (!S) K.tex(TEX.stone).paint(C.stone);
    K.box(-13, 0, -9, -4.5, 22, 9, S ? "b" : "b"); K.box(4.5, 0, -9, 13, 22, 9, "b"); K.box(-4.5, S ? 8 : 12.5, -9, 4.5, 22, 9, S ? "" : "b");
    const nA = L >= 4 ? 4 : 10;
    if (!S) for (let k = 0; k < nA; k++) { const t0 = Math.PI * k / nA, t1 = Math.PI * (k + 1) / nA, x0 = Math.cos(t0) * 4.5, y0 = 8 + Math.sin(t0) * 4.5, x1 = Math.cos(t1) * 4.5, y1 = 8 + Math.sin(t1) * 4.5;
      for (const [z, nz] of [[-9, -1], [9, 1]]) K.q([x0, y0, z], [x1, y1, z], [x1, 12.5, z], [x0, 12.5, z], [0, 0, nz]);
      K.q([x0, y0, -9], [x1, y1, -9], [x1, y1, 9], [x0, y0, 9], [-Math.cos((t0 + t1) / 2), -Math.sin((t0 + t1) / 2), 0]); }
    for (const s of [-1, 1]) { tower(K, L, s * 17, -1, 8, 28, 17, S, L >= 4 ? 8 : L >= 3 ? 14 : 24); }
    if (!S && L <= 2) { K.tex(TEX.stone).paint(C.stone); for (let i = 0; i < 9; i++) { const x = -12.5 + i * 3; K.box(x, 22, -9, x + 1.5, 23.4, -8.2, "b"); K.box(x, 22, 8.2, x + 1.5, 23.4, 9, "b"); }
      K.tex(null).paint(GOLD, null, 0.35, 0.6); flat(K, -5.4, 12.5, 5.4, 13.2, -9.05); flat(K, -13, 19.6, 13, 20, -9.05); K.paint("oklch(0.3 0.02 250)", null, 0.5, 0.6); for (let i = 0; i < 12; i++) { const x = -4.1 + i * 0.75; flat(K, x, 11.2, x + 0.14, 12.5, -8.7); }
      banner(K, -8.7, 19.4, -9.1, 3, 9); banner(K, 8.7, 19.4, -9.1, 3, 9); banner(K, 0, 21.5, 9.1, 3.2, 6.5, 1); }
    // causeway over the moat
    const n = L >= 4 ? 3 : 8, hy = (z) => 0.25 + 1.3 * Math.sin(Math.PI * (z + 36) / 27);
    if (!S) K.tex(TEX.paving).paint(C.plinth);
    for (let i = 0; i < n; i++) { const z0 = -36 + 27 * i / n, z1 = -36 + 27 * (i + 1) / n, y0 = hy(z0), y1 = hy(z1);
      K.q([-6, y0, z0], [6, y0, z0], [6, y1, z1], [-6, y1, z1], [0, 1, 0]);
      if (!S) K.tex(TEX.stone).paint(C.stone);
      for (const s of [-1, 1]) { K.q([s * 6.6, 0, z0], [s * 6.6, 0, z1], [s * 6.6, y1 + 1.1, z1], [s * 6.6, y0 + 1.1, z0], [s, 0, 0]); K.q([s * 6, y0, z0], [s * 6, y1, z1], [s * 6, y1 + 1.1, z1], [s * 6, y0 + 1.1, z0], [-s, 0, 0]); if (!S) K.q([s * 6, y0 + 1.1, z0], [s * 6, y1 + 1.1, z1], [s * 6.6, y1 + 1.1, z1], [s * 6.6, y0 + 1.1, z0], [0, 1, 0]); }
      if (!S) K.tex(TEX.paving).paint(C.plinth); }
    if (S || L >= 4) return;
    for (const z of [-34, -22.5, -11]) for (const s of [-1, 1]) { const y = hy(z) + 1.1; K.tex(TEX.stone).paint(C.stone); K.box(s * 6.3 - 0.4, y, z - 0.4, s * 6.3 + 0.4, y + 0.8, z + 0.4, "b"); K.tex(null).paint(GOLD, null, 0.3, 0.7); K.prism(s * 6.3, z, 0.08, 0.07, y + 0.8, y + 4.2, 6); K.paint("oklch(0.95 0.08 85)", [2.2, 1.6, 0.7], 0.4); K.box(s * 6.3 - 0.25, y + 4.2, z - 0.25, s * 6.3 + 0.25, y + 4.8, z + 0.25); }
    K.tex(null).paint("oklch(0.3 0.03 230)"); for (const s of [-1, 1]) for (const zc of [-26, -17]) for (let k = 0; k < 6; k++) { const t0 = Math.PI * k / 6, t1 = Math.PI * (k + 1) / 6; K.t([s * 6.62, 0.08, zc], [s * 6.62, 0.08 + Math.sin(t0) * 1.1, zc + Math.cos(t0) * 2.6], [s * 6.62, 0.08 + Math.sin(t1) * 1.1, zc + Math.cos(t1) * 2.6], [s, 0, 0]); }
  },
  keep(K, L, p, S) {
    const MH = 6, nT = L >= 4 ? 10 : L >= 3 ? 16 : 28, tn = L >= 4 ? 8 : L >= 3 ? 12 : 18;
    if (!S) K.tex(TEX.stone).paint(C.plinth);
    K.lathe(0, 0, [[35, 0], [28, MH], [0, MH]], nT);
    K.q([-5, MH, 24], [5, MH, 24], [5, 0, 53], [-5, 0, 53], [0, 1, 0.2]);
    if (!S) K.tex(TEX.stone).paint(C.stone);
    for (const s of [-1, 1]) { const xo = s * 5.6, xi = s * 5; K.q([xo, 0, 24], [xo, 0, 53], [xo, 1, 53], [xo, MH + 1, 24], [s, 0, 0]); K.q([xi, MH, 24], [xi, 0, 53], [xi, 1, 53], [xi, MH + 1, 24], [-s, 0, 0]); if (!S) K.q([xi, MH + 1, 24], [xi, 1, 53], [xo, 1, 53], [xo, MH + 1, 24], [0, 1, 0]); }
    sector(K, 25.5, 27, 104, 436, MH, MH + 6, L >= 4 ? 12 : 30);
    if (!S && L <= 2) for (let i = 0; i < 40; i++) { const b = 104 + i * 8.3; sector(K, 26.3, 27, b, b + 4, MH + 6, MH + 7.1, 1); }
    for (const a of [100, 80]) { const c = pol(26.3, a); tower(K, L, c[0], c[2], 3.2, MH + 11, 7, S, tn); } K.at(0, 0, 0, 0);
    if (!S) K.tex(TEX.stone).paint(C.stone);
    K.box(-10, MH, -20, 10, MH + 30, -2, "b"); K.box(-8, MH, -2, 8, MH + 13, 12, "b");
    for (const [x, z] of [[-10, -20], [10, -20], [-10, -2], [10, -2]]) { if (S) { K.prism(x, z, 3.2, 3.2, MH, MH + 37, 8); continue; }
      K.tex(TEX.stone).paint(C.stone); K.prism(x, z, 3.2, 3.2, MH, MH + 36, tn, 0, ""); K.annulus(x, z, 2.8, 3.5, MH + 36, MH + 37, tn);
      K.tex(SLATE).paint(SL, null, 0.6); K.cone(x, z, 3.9, MH + 37, MH + 52, tn); if (L <= 3) { K.tex(null).paint(GOLD, null, 0.3, 0.7); K.bipyr(x, MH + 52.4, z, 0.3, 1.8, 0.4, 4); } }
    if (S) { K.prism(0, -11, 5, 5, MH + 30, MH + 41, 8); return; }
    K.tex(TEX.stone).paint(C.stone); K.prism(0, -11, 5, 5, MH + 30, MH + 40, tn, 0, ""); K.annulus(0, -11, 4.5, 5.6, MH + 40, MH + 41.3, tn);
    K.tex(SLATE).paint(SL, null, 0.6); K.cone(0, -11, 6, MH + 41.3, MH + 68, tn); K.q([-8.5, MH + 13, 12.4], [-8.5, MH + 13, -2], [0, MH + 20, -2], [0, MH + 20, 12.4], [-1, 1, 0]); K.q([8.5, MH + 13, -2], [8.5, MH + 13, 12.4], [0, MH + 20, 12.4], [0, MH + 20, -2], [1, 1, 0]);
    K.tex(TEX.stone).paint(C.stone); K.t([8, MH + 13, 12], [-8, MH + 13, 12], [0, MH + 20, 12], [0, 0, 1]);
    K.tex(null).paint(GOLD, null, 0.3, 0.7); K.bipyr(0, MH + 68.5, -11, 0.5, 2.6, 0.6, 4);
    if (L >= 3) return;
    for (let i = 0; i < 7; i++) { const x = -9.5 + i * 3; K.tex(TEX.stone).paint(C.stone); K.box(x, MH + 30, -20, x + 1.4, MH + 31.3, -19.3, "b"); K.box(x, MH + 30, -2.7, x + 1.4, MH + 31.3, -2, "b"); }
    K.tex(null).paint(C.glass, [0.35, 0.24, 0.1], 0.2, 0.3);
    for (const y of [MH + 15, MH + 21, MH + 26]) for (const x of [-6, -2, 2, 6]) { flat(K, x - 0.6, y, x + 0.6, y + 2.6, -20.03); flat(K, x - 0.6, y, x + 0.6, y + 2.6, -1.97, 1); sideFlat(K, 10.03, x - 11 - 0.6, y, x - 11 + 0.6, y + 2.6, 1); sideFlat(K, -10.03, x - 11 - 0.6, y, x - 11 + 0.6, y + 2.6, -1); }
    for (const z of [1, 4.5, 8]) { sideFlat(K, 8.03, z - 0.7, MH + 4, z + 0.7, MH + 10, 1); sideFlat(K, -8.03, z - 0.7, MH + 4, z + 0.7, MH + 10, -1); }
    K.paint(WOOD, null, 0.8); flat(K, -1.8, MH, 1.8, MH + 4.4, 12.04, 1); K.paint(GOLD, null, 0.3, 0.7); flat(K, -2.2, MH + 4.4, 2.2, MH + 4.9, 12.05, 1); flat(K, -8, MH + 12.6, 8, MH + 13, 12.05, 1);
    banner(K, -5, MH + 29, -1.9, 2.4, 7, 1); banner(K, 5, MH + 29, -1.9, 2.4, 7, 1); banner(K, 0, MH + 28, -20.1, 3, 9);
    for (const a of [100, 80]) { const c = pol(26.3, a); banner(K, c[0], MH + 9.5, c[2] + 3.3, 1.6, 4, 1); }
  },
  cathedral(K, L, p, S) { // front at z 0 faces −Z (the plaza); body runs +Z
    const tn = L >= 4 ? 6 : 8;
    if (!S) K.tex(TEX.stone).paint(C.plinth);
    K.box(-14, 0, -3, 14, 0.25, 0, "b"); K.box(-14, 0.25, -1.5, 14, 0.5, 0, "b");
    if (!S) K.tex(TEX.stone).paint(C.stone);
    K.box(-15, 0, 0, -7, 32, 9, "b"); K.box(7, 0, 0, 15, 32, 9, "b"); K.box(-7, 0, 0, 7, 24, 9, "b");
    K.box(-8, 0, 9, 8, 21, 48, "bf"); K.box(-13, 0, 9, -8, 11, 48, "b"); K.box(8, 0, 9, 13, 11, 48, "b"); K.box(-21, 0, 30, 21, 21, 40, "b");
    K.box(-5, 21, 30, 5, 38, 40, "b"); K.prism(0, 48, 8, 8, 0, 20, tn, Math.PI / 8, S ? "t" : "");
    if (S) return;
    K.t([7, 24, 0], [-7, 24, 0], [0, 31, 0], [0, 0, -1]);
    K.tex(SLATE).paint(SL, null, 0.6);
    K.q([-8.6, 21, 48], [-8.6, 21, 8.6], [0, 31, 8.6], [0, 31, 48], [-1, 1, 0]); K.q([8.6, 21, 8.6], [8.6, 21, 48], [0, 31, 48], [0, 31, 8.6], [1, 1, 0]);
    for (const s of [-1, 1]) K.q([s * 13.4, 11, 9], [s * 13.4, 11, 48], [s * 8, 14, 48], [s * 8, 14, 9], [s, 1, 0]);
    K.q([-21.4, 21, 29.6], [21.4, 21, 29.6], [21.4, 30, 35], [-21.4, 30, 35], [0, 1, -1]); K.q([21.4, 21, 40.4], [-21.4, 21, 40.4], [-21.4, 30, 35], [21.4, 30, 35], [0, 1, 1]);
    K.cone(0, 48, 8.6, 20, 28, tn, Math.PI / 8); for (const x of [-11, 11]) K.cone(x, 4.5, 4.8, 32, 56, tn, Math.PI / 8); K.cone(0, 35, 6.4, 38, 74, tn, Math.PI / 8);
    K.tex(TEX.stone).paint(C.stone); K.t([21, 21, 30], [21, 21, 40], [21, 30, 35], [1, 0, 0]); K.t([-21, 21, 40], [-21, 21, 30], [-21, 30, 35], [-1, 0, 0]);
    K.tex(null).paint(GOLD, null, 0.3, 0.7); for (const [x, z, y] of [[-11, 4.5, 56], [11, 4.5, 56], [0, 35, 74]]) K.bipyr(x, y + 0.3, z, 0.35, 2.2, 0.4, 4);
    // rose window + portal
    const nr = L >= 3 ? 8 : 16; K.paint("oklch(0.5 0.14 270)", [0.25, 0.3, 0.8], 0.2, 0.3);
    for (let i = 0; i < nr; i++) { const a0 = i * 2 * Math.PI / nr, a1 = (i + 1) * 2 * Math.PI / nr; K.t([0, 17, -0.05], [Math.cos(a1) * 4.2, 17 + Math.sin(a1) * 4.2, -0.05], [Math.cos(a0) * 4.2, 17 + Math.sin(a0) * 4.2, -0.05], [0, 0, -1]); }
    K.paint(GOLD, null, 0.3, 0.7); for (let i = 0; i < nr; i++) { const a0 = i * 2 * Math.PI / nr, a1 = (i + 1) * 2 * Math.PI / nr, P = (a, r) => [Math.cos(a) * r, 17 + Math.sin(a) * r, -0.08];
      K.q(P(a1, 4.2), P(a0, 4.2), P(a0, 4.9), P(a1, 4.9), [0, 0, -1]); if (L <= 2) K.q(P(a0, 0.5), P(a0 + 0.05, 0.5), P(a0 + 0.02, 4.2), P(a0 - 0.02, 4.2), [0, 0, -1]); }
    K.q([-3.4, 0.5, -0.06], [3.4, 0.5, -0.06], [3.4, 7.4, -0.06], [-3.4, 7.4, -0.06], [0, 0, -1]); K.t([-3.4, 7.4, -0.06], [3.4, 7.4, -0.06], [0, 11, -0.06], [0, 0, -1]);
    K.paint(WOOD, null, 0.8); K.q([-2.7, 0.5, -0.1], [2.7, 0.5, -0.1], [2.7, 7, -0.1], [-2.7, 7, -0.1], [0, 0, -1]); K.t([-2.7, 7, -0.1], [2.7, 7, -0.1], [0, 10, -0.1], [0, 0, -1]);
    if (L >= 3) return;
    K.paint(GOLD, null, 0.3, 0.7); for (const x of [-11, 11]) { flat(K, x - 4, 30.6, x + 4, 31, -0.04); flat(K, x - 1.6, 0.5, x + 1.6, 5.4, -0.04); } flat(K, -7, 23.6, 7, 24, -0.04);
    K.paint("oklch(0.45 0.12 265)", [0.18, 0.22, 0.6], 0.2, 0.3);
    for (const x of [-11, 11]) { flat(K, x - 1.2, 0.5, x + 1.2, 5, -0.07); for (const y of [12, 20]) flat(K, x - 0.8, y, x + 0.8, y + 5, -0.04); }
    for (let z = 12; z < 47; z += 5) { if (z > 27 && z < 42) continue; for (const s of [-1, 1]) { sideFlat(K, s * 8.03, z - 0.7, 14.6, z + 0.7, 19.6, s); sideFlat(K, s * 13.03, z - 0.8, 3, z + 0.8, 8.6, s); } }
    for (const s of [-1, 1]) for (const z of [11.5, 19, 26.5, 44]) { K.tex(TEX.stone).paint(C.stone); K.box(s * 14.2 - 0.6, 0, z - 0.6, s * 14.2 + 0.6, 14, z + 0.6, "b"); K.cone(s * 14.2, z, 0.7, 14, 16.5, 4, Math.PI / 4);
      K.q([s * 14.2, 13.4, z - 0.35], [s * 14.2, 13.4, z + 0.35], [s * 8, 18.4, z + 0.35], [s * 8, 18.4, z - 0.35], [s, 1, 0]); }
  },
  district(K, L, p, S) {
    for (const h of lots()) { if (!inR(h.a, p.a0, p.a1)) continue; K.at(h.x, 0, h.z, h.yaw); house(K, L, h, p.style, S); }
    K.at(0, 0, 0, 0); if (p.market) market(K, L, S); if (p.canal) canal(K, L, S);
  },
  statues(K, L, p, S) {
    const n = L >= 4 ? 6 : 12;
    for (const b of [-5, 85, 175, -95]) for (const s of [-1, 1]) { const c = pol(42, b + s * 9); K.at(c[0], 0, c[2], yawToward(c[0], c[2]));
      if (!S) K.tex(TEX.stone).paint(C.plinth); K.box(-1, 0, -1, 1, 2, 1, "b"); if (S) continue;
      K.tex(null).paint("oklch(0.97 0.01 90)", null, 0.5); K.lathe(0, 0, [[0.75, 2], [0.55, 3.3], [0.34, 4.3], [0.46, 4.65], [0.12, 4.75], [0.24, 4.95], [0.2, 5.25], [0, 5.35]], n);
      if (L <= 3) { K.paint(GOLD, null, 0.3, 0.7); K.box(-1.05, 1.7, -1.05, 1.05, 1.9, 1.05); K.shard([0.55, 3.9, -0.25], [0, 1, 0], 0.07, 1.8, 0.35, 4); K.box(0.35, 3.8, -0.45, 0.75, 3.95, -0.05); } }
    K.at(0, 0, 0, 0);
  },
};
export function geometry(ctx) { const p = ctx.params; B[p.kind]?.(kit(ctx), ctx.lod, p, false); }
export function collider(ctx) { const p = ctx.params; B[p.kind]?.(kit(ctx, true), 1, p, true); }
