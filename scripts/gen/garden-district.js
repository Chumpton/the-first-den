// The Garden Market district: one family by params.item; feet at the district centre (world y 0.5), local metres,
// layout from lib/data/garden-district.json. items: ground (paths, plaza, beds, hedges + gates, pond, bridge),
// fountain (tiered flower fountain + wisteria pergola ring + ring lights), stalls (the 8 pergola/canvas stalls),
// dressing (fruit trees, lemon pots, benches, rose arches, hives, glass kiosk, florist cart, string lights), pondwater.
import { TAU, COL, FLOWERS, paint, XF, solid, obox, beam, blob, prism, ngon, lathe, Q, T } from '../lib/town-kit.js';
import { gem } from '../lib/yard-kit.js';
import { raceme } from '../lib/bloom-kit.js';
import G from '../lib/data/garden-district.json';
import { softened } from "./soften.js";
const LEAF = ['oklch(0.62 0.12 138)', 'oklch(0.55 0.11 146)', 'oklch(0.68 0.13 128)'];
const ROSE = ['oklch(0.7 0.15 8)', 'oklch(0.88 0.07 45)', 'oklch(0.6 0.17 12)', 'oklch(0.82 0.1 355)'];
const BLOOM = [...FLOWERS, 'oklch(0.68 0.13 300)', 'oklch(0.7 0.12 250)'];
const BULB = 'oklch(0.97 0.08 85)', BULBE = 'oklch(1 0.13 80)';
const yawOf = (d) => Math.atan2(-d[0], -d[1]);
const leafy = (ctx, i = 0) => paint(ctx, null, LEAF[i % 3], 0.9);
const col = (ctx, c, r = 0.8) => paint(ctx, null, c, r);

// ── ground ──────────────────────────────────────────────────────────
function stations(pts) {
  const st = [];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.85)); for (let k = 0; k < n; k++) st.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  st.push(pts[pts.length - 1]);
  const N = st.map((p, i) => { const a = st[Math.max(0, i - 1)], b = st[Math.min(st.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; return [-dz / l, dx / l]; });
  return { st, N };
}
function stone(P, c, h, sides) {
  const cx = (c[0][0] + c[2][0]) / 2, cz = (c[0][1] + c[2][1]) / 2;
  const B = c.map(([x, z]) => [x, h, z]);
  if (sides) solid(P, c.map(([x, z]) => [x, -0.03, z]), B, false);
  Q(P, B[0], B[1], B[2], B[3], [cx, -1, cz]);
}
const FLAG = ['oklch(0.9 0.03 110)', 'oklch(0.86 0.04 125)', 'oklch(0.94 0.02 90)'];
function path(ctx, P, pts, w, lod, R) {
  const { st, N } = stations(pts);
  const at = (i, t, u) => [st[i][0] + (st[i + 1][0] - st[i][0]) * t + (N[i][0] + (N[i + 1][0] - N[i][0]) * t) * u, st[i][1] + (st[i + 1][1] - st[i][1]) * t + (N[i][1] + (N[i + 1][1] - N[i][1]) * t) * u];
  if (lod >= 3) { paint(ctx, 'flag', FLAG[0], 0.9); for (let i = 0; i < st.length - 1; i++) { const a = at(i, 0, -w / 2), b = at(i, 0, w / 2), c = at(i, 1, w / 2), d = at(i, 1, -w / 2); Q(P, [a[0], 0.04, a[1]], [b[0], 0.04, b[1]], [c[0], 0.04, c[1]], [d[0], 0.04, d[1]], [st[i][0], -1, st[i][1]]); } return; }
  for (let s = 0; s < 3; s++) {
    paint(ctx, 'flag', FLAG[s], 0.9);
    for (let i = 0; i < st.length - 1; i++) {
      const cuts = i % 2 ? [-0.5, -1 / 6, 1 / 6, 0.5] : [-0.5, 0, 0.5];
      for (let k = 0; k < cuts.length - 1; k++) {
        if ((i * 7 + k * 3) % 3 !== s) continue;
        const u0 = cuts[k] * w + 0.05, u1 = cuts[k + 1] * w - 0.05, j = () => (R() - 0.5) * 0.08;
        const c = [at(i, 0.05, u0 + j()), at(i, 0.05, u1 + j()), at(i, 0.95, u1 + j()), at(i, 0.95, u0 + j())];
        stone(P, c, 0.045 + ((i * 13 + k * 5) % 4) * 0.008, lod <= 1);
      }
    }
  }
  if (lod <= 1) { col(ctx, 'oklch(0.66 0.13 132)', 0.95); for (let i = 1; i < st.length - 1; i += 2) { const sd = i % 4 === 1 ? 1 : -1, p = at(i, 0.2, sd * (w / 2 + 0.05)); blob(P, p[0], 0, p[1], 0.3, 0.09, 0.22, 4); } }
}
function plaza(ctx, P, lod, R) {
  const r0 = G.basinR + 0.1, r1 = G.plazaR;
  if (lod >= 3) { paint(ctx, 'flag', FLAG[0], 0.9); const n = lod >= 4 ? 12 : 24; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; Q(P, [Math.cos(a) * r0, 0.04, Math.sin(a) * r0], [Math.cos(b) * r0, 0.04, Math.sin(b) * r0], [Math.cos(b) * r1, 0.04, Math.sin(b) * r1], [Math.cos(a) * r1, 0.04, Math.sin(a) * r1], [0, -1, 0]); } return; }
  let ring = 0;
  for (let r = r0; r < r1 - 0.1; r += 0.8, ring++) {
    const ra = r + 0.04, rb = Math.min(r1, r + 0.76), n = Math.ceil(TAU * (ra + rb) / 2 / 1.0), off = ring * 0.37;
    for (let s = 0; s < 3; s++) {
      paint(ctx, 'flag', FLAG[s], 0.9);
      for (let i = 0; i < n; i++) {
        if ((i + ring) % 3 !== s) continue;
        const a = off + i / n * TAU + 0.025 / r, b = off + (i + 1) / n * TAU - 0.025 / r, m = (a + b) / 2;
        const c = [[Math.cos(a) * ra, Math.sin(a) * ra], [Math.cos(a) * rb, Math.sin(a) * rb], [Math.cos(m) * rb, Math.sin(m) * rb], [Math.cos(b) * rb, Math.sin(b) * rb]];
        const d = [[Math.cos(b) * ra, Math.sin(b) * ra], [Math.cos(m) * ra, Math.sin(m) * ra]];
        const h = 0.05 + ((i * 5 + ring) % 3) * 0.008;
        stone(P, [c[0], c[1], c[2], d[1]], h, lod <= 1); stone(P, [d[1], c[2], c[3], d[0]], h, lod <= 1);
      }
    }
  }
}
function bed(ctx, P, x, z, w, d, lod, R) {
  paint(ctx, 'walnut', COL.walnut, 0.85);
  obox(P, x, 0, z - d / 2 + 0.06, w, 0.28, 0.12); obox(P, x, 0, z + d / 2 - 0.06, w, 0.28, 0.12);
  obox(P, x - w / 2 + 0.06, 0, z, 0.12, 0.28, d - 0.24); obox(P, x + w / 2 - 0.06, 0, z, 0.12, 0.28, d - 0.24);
  paint(ctx, 'soil', 'oklch(0.9 0.02 60)', 0.95);
  Q(P, [x - w / 2 + 0.1, 0.24, z - d / 2 + 0.1], [x + w / 2 - 0.1, 0.24, z - d / 2 + 0.1], [x + w / 2 - 0.1, 0.24, z + d / 2 - 0.1], [x - w / 2 + 0.1, 0.24, z + d / 2 - 0.1], [x, -1, z]);
  if (lod >= 3) { leafy(ctx, 1); blob(P, x, 0.24, z, w / 2 * 0.85, 0.45, d / 2 * 0.85, 5); return; }
  const nx = Math.max(1, Math.round(w / 0.75)), nz = Math.max(1, Math.round(d / 0.75)), cells = [];
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) cells.push([x - w / 2 + (i + 0.5) * w / nx + (R() - 0.5) * 0.2, z - d / 2 + (k + 0.5) * d / nz + (R() - 0.5) * 0.2, R()]);
  for (let s = 0; s < 3; s++) { leafy(ctx, s); for (const c of cells) if (Math.floor(c[2] * 3) === s) blob(P, c[0], 0.22, c[1], 0.3, 0.3 + c[2] * 0.25, 0.3, 5); }
  for (let f = 0; f < BLOOM.length; f++) {
    col(ctx, BLOOM[f], 0.7);
    cells.forEach((c, i) => { if ((i + f) % BLOOM.length) return; const h = 0.5 + c[2] * 0.3; const n = lod <= 1 ? 4 : 2; for (let j = 0; j < n; j++) { const a = j / n * TAU + c[2] * 5; gem(P, c[0] + Math.cos(a) * 0.17, h + (j % 2) * 0.06, c[1] + Math.sin(a) * 0.17, 0.07, 0.04, 0.03, 5); } if (c[2] > 0.8) { for (let j = 0; j < 4; j++) gem(P, c[0], h + 0.15 + j * 0.12, c[1], 0.07 - j * 0.012, 0.06, 0.04, 4); } });
  }
}
// an arch over a gap: centre (x,z), across = unit dir along the span, rose-clad, emitted in root coords
function arch(ctx, P, x, z, ax, az, span, spring, rise, lod, R) {
  const bx = -az, bz = ax, pw = (u, y, v = 0) => [x + ax * u + bx * v, y, z + az * u + bz * v];
  const seg = lod <= 2 ? 10 : 5, arc = [];
  for (let i = 0; i <= seg; i++) { const t = Math.PI * i / seg; arc.push([Math.cos(t) * span / 2, spring + Math.sin(t) * rise]); }
  paint(ctx, 'oak', COL.oak, 0.8);
  for (const v of lod <= 2 ? [-0.2, 0.2] : [0]) {
    for (const u of [-span / 2, span / 2]) beam(P, pw(u, 0, v), pw(u, spring, v), 0.12);
    for (let i = 0; i < seg; i++) beam(P, pw(arc[i][0], arc[i][1], v), pw(arc[i + 1][0], arc[i + 1][1], v), 0.09);
  }
  if (lod <= 2) for (let i = 1; i < seg; i += 2) beam(P, pw(arc[i][0], arc[i][1], -0.26), pw(arc[i][0], arc[i][1], 0.26), 0.05);
  if (lod >= 4) return;
  leafy(ctx, 0);
  const clumps = [];
  for (let i = 0; i <= seg; i++) clumps.push(pw(arc[i][0], arc[i][1], 0));
  for (const u of [-span / 2, span / 2]) for (let y = 0.5; y < spring; y += lod <= 2 ? 0.55 : 1.1) clumps.push(pw(u * 1.02, y, (R() - 0.5) * 0.2));
  clumps.forEach((p, i) => { leafy(ctx, i); blob(P, p[0], p[1] - 0.2, p[2], 0.34, 0.36, 0.34, lod <= 2 ? 5 : 4, R); });
  if (lod <= 2) clumps.forEach((p, i) => { paint(ctx, null, ROSE[i % 4], 0.7); gem(P, p[0] + (R() - 0.5) * 0.3, p[1] + 0.05, p[2] + (R() > 0.5 ? 0.3 : -0.3), 0.08, 0.06, 0.05, 5); if (lod <= 1) gem(P, p[0] + (R() - 0.5) * 0.4, p[1] - 0.15, p[2] + (R() > 0.5 ? 0.32 : -0.32), 0.07, 0.05, 0.04, 5); });
}
function hedgeRuns() {
  const h = G.half, t = G.hedgeT, runs = [];
  for (const side of ['n', 's', 'e', 'w']) {
    const g = G.gates.find((q) => q.side === side), L = h + t / 2;
    const iv = g ? [[-L, g.at - G.gateW / 2 - 0.8], [g.at + G.gateW / 2 + 0.8, L]] : [[-L, L]];
    for (const [a, b] of iv) runs.push({ side, a, b });
  }
  return runs;
}
function runBox(r) { // [cx, cz, sx, sz]
  const h = G.half, t = G.hedgeT, m = (r.a + r.b) / 2, L = r.b - r.a;
  if (r.side === 'n') return [m, h, L, t]; if (r.side === 's') return [m, -h, L, t];
  if (r.side === 'e') return [h, m, t, L]; return [-h, m, t, L];
}
function gateFrame(g) { // centre on the hedge line, span axis
  const h = G.half;
  if (g.side === 'e') return { x: h, z: g.at, ax: 0, az: 1 }; if (g.side === 'w') return { x: -h, z: g.at, ax: 0, az: 1 };
  if (g.side === 'n') return { x: g.at, z: h, ax: 1, az: 0 }; return { x: g.at, z: -h, ax: 1, az: 0 };
}
function ground(ctx, lod, R) {
  const P = ctx;
  plaza(ctx, P, lod, R);
  for (const p of G.paths) path(ctx, P, p, G.pathW, lod, R);
  if (lod <= 4) for (const b of G.beds) bed(ctx, P, b[0], b[1], b[2], b[3], lod, R);
  // hedges
  for (const r of hedgeRuns()) {
    const [cx, cz, sx, sz] = runBox(r);
    paint(ctx, 'leaf', 'oklch(0.9 0.06 135)', 0.95);
    obox(P, cx, 0, cz, sx, G.hedgeH - 0.25, sz);
    obox(P, cx, G.hedgeH - 0.25, cz, sx - 0.2, 0.25, sz - 0.2);
    if (lod <= 2) {
      const along = r.side === 'n' || r.side === 's', L = r.b - r.a, n = Math.floor(L / (lod <= 1 ? 0.5 : 0.9));
      for (let f = 0; f < 4; f++) {
        paint(ctx, null, [ROSE[0], 'oklch(0.95 0.03 90)', BLOOM[5], ROSE[3]][f], 0.7);
        for (let i = f; i < n; i += 4) {
          const u = r.a + (i + 0.5) * L / n, y = 0.5 + ((i * 37) % 11) / 11 * 1.1;
          for (const sd of [-1, 1]) { const o = sd * (G.hedgeT / 2 + 0.02); const p = along ? [u, y, cz + o] : [cx + o, y, u]; gem(P, p[0], p[1], p[2], 0.07, 0.05, 0.05, 4); }
        }
      }
    }
  }
  // gates: limestone piers, lantern caps, rose arch
  for (const g of G.gates) {
    const f = gateFrame(g), off = G.gateW / 2 + 0.4;
    for (const s of [-1, 1]) {
      const px = f.x + f.ax * s * off, pz = f.z + f.az * s * off;
      paint(ctx, 'ashlar', COL.lime, 0.9); obox(P, px, 0, pz, 0.8, 2.2, 0.8); obox(P, px, 2.2, pz, 0.95, 0.12, 0.95);
      paint(ctx, null, COL.iron, 0.6, 0.4); obox(P, px, 2.32, pz, 0.3, 0.05, 0.3);
      for (const c of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) obox(P, px + c[0] * 0.12, 2.37, pz + c[1] * 0.12, 0.03, 0.38, 0.03);
      obox(P, px, 2.75, pz, 0.34, 0.06, 0.34);
      paint(ctx, null, BULB, 0.5, 0, BULBE); obox(P, px, 2.38, pz, 0.2, 0.36, 0.2);
    }
    arch(ctx, P, f.x, f.z, f.ax, f.az, G.gateW + 0.4, 2.4, 1.3, lod, R);
  }
  // pond: floor, stone rim, lily pads, reeds
  const pd = G.pond, br = G.bridge;
  paint(ctx, null, 'oklch(0.33 0.05 190)', 0.9);
  const pn = lod <= 2 ? 24 : 12;
  for (let i = 0; i < pn; i++) { const a = i / pn * TAU, b = (i + 1) / pn * TAU; T(P, [pd.x, 0.02, pd.z], [pd.x + Math.cos(a) * pd.rx, 0.02, pd.z + Math.sin(a) * pd.rz], [pd.x + Math.cos(b) * pd.rx, 0.02, pd.z + Math.sin(b) * pd.rz], [pd.x, -1, pd.z]); }
  if (lod <= 3) {
    paint(ctx, 'lime', 'oklch(0.9 0.02 90)', 0.95);
    const n = lod <= 2 ? 34 : 16;
    for (let i = 0; i < n; i++) { const a = i / n * TAU, x = pd.x + Math.cos(a) * (pd.rx + 0.2), z = pd.z + Math.sin(a) * (pd.rz + 0.2); if (Math.abs(x - br.x) < 1.3) continue; blob(P, x, -0.05, z, 0.42, 0.28, 0.36, lod <= 2 ? 5 : 4, R); }
  }
  if (lod <= 2) {
    col(ctx, 'oklch(0.6 0.13 140)', 0.8);
    const pads = [[-19.5, -11], [-18.8, -12.9], [-13.5, -10.3], [-14, -12.8], [-20.2, -10.2], [-12.8, -11.6], [-18, -9.6], [-15, -13.4]];
    pads.forEach(([x, z], i) => { const r = 0.26 + (i % 3) * 0.07, n = 8, a0 = i * 1.3; for (let k = 0; k < n - 1; k++) { const a = a0 + (k + 0.5) / n * TAU, b = a0 + (k + 1.5) / n * TAU; T(P, [x, 0.14, z], [x + Math.cos(a) * r, 0.14, z + Math.sin(a) * r], [x + Math.cos(b) * r, 0.14, z + Math.sin(b) * r], [x, -1, z]); } });
    col(ctx, 'oklch(0.86 0.09 350)', 0.7); for (const i of [0, 3, 5]) gem(P, pads[i][0] + 0.05, 0.16, pads[i][1], 0.09, 0.08, 0.02, 6);
    col(ctx, 'oklch(0.56 0.1 130)', 0.9);
    for (const [x, z] of [[-21, -12.5], [-20.7, -10], [-12, -12.8], [-12.4, -9.8]]) for (let k = 0; k < 6; k++) { const a = k * 1.05, bx = x + Math.cos(a) * 0.15, bz = z + Math.sin(a) * 0.15; T(P, [bx - 0.03, 0.05, bz], [bx + 0.03, 0.05, bz], [bx + Math.cos(a) * 0.12, 0.9 + (k % 3) * 0.2, bz + Math.sin(a) * 0.12], [x, 0.5, z + 1]); }
  }
  bridge(ctx, P, lod);
}
function bridgeY(t) { return 0.08 + G.bridge.rise * Math.sin(Math.PI * t); }
function bridge(ctx, P, lod) {
  const b = G.bridge, n = lod <= 2 ? 12 : 4, hw = b.w / 2, z = (t) => b.z0 + (b.z1 - b.z0) * t;
  paint(ctx, 'oak', COL.oak, 0.8);
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, y0 = bridgeY(t0), y1 = bridgeY(t1), g = lod <= 2 ? 0.02 : 0;
    const A = [[b.x - hw, y0 - 0.08, z(t0) - g], [b.x + hw, y0 - 0.08, z(t0) - g], [b.x + hw, y1 - 0.08, z(t1) + g], [b.x - hw, y1 - 0.08, z(t1) + g]];
    solid(P, A, A.map((p, k) => [p[0], (k < 2 ? y0 : y1), p[2]]));
  }
  paint(ctx, 'walnut', COL.walnut, 0.85);
  const m = lod <= 2 ? 4 : 2;
  for (const s of [-1, 1]) {
    for (let i = 0; i <= m; i++) { const t = i / m; obox(P, b.x + s * (hw - 0.06), bridgeY(t) - 0.1, z(t), 0.1, 0.95, 0.1); }
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; beam(P, [b.x + s * (hw - 0.06), bridgeY(t0) + 0.85, z(t0)], [b.x + s * (hw - 0.06), bridgeY(t1) + 0.85, z(t1)], 0.09, 0.07); }
  }
}
// ── fountain + wisteria ring ────────────────────────────────────────
function fountain(ctx, lod, R) {
  const P = ctx, n = lod <= 2 ? 24 : lod === 3 ? 14 : 8, W = 'oklch(0.62 0.09 200)';
  const water = (r, y) => { paint(ctx, null, W, 0.06, 0.1); lathe(P, [[r, y], [0, y]], n); };
  paint(ctx, 'ashlar', COL.lime, 0.9); lathe(P, [[3.15, 0], [3.15, 0.5], [3.25, 0.56], [3.25, 0.64], [2.8, 0.64], [2.8, 0.3]], n);
  water(2.8, 0.46);
  paint(ctx, 'lime', COL.lime, 0.85);
  lathe(P, [[0.55, 0.3], [0.55, 0.5], [0.4, 0.62], [0.32, 1.2], [0.42, 1.3], [1.25, 1.45], [1.62, 1.62], [1.62, 1.72], [1.48, 1.72], [1.45, 1.62]], n);
  water(1.46, 1.64);
  paint(ctx, 'lime', COL.lime, 0.85);
  lathe(P, [[0.25, 1.64], [0.2, 2.2], [0.3, 2.3], [0.75, 2.4], [0.9, 2.52], [0.9, 2.58], [0.8, 2.58], [0.78, 2.5]], n);
  water(0.8, 2.52);
  paint(ctx, 'lime', COL.lime, 0.85); lathe(P, [[0.14, 2.52], [0.1, 2.72], [0.24, 2.84], [0.2, 2.95]], lod <= 2 ? 10 : 6);
  if (lod <= 3) {
    const tiers = [[0.12, 2.95, 1, 0.3], [1.55, 1.72, lod <= 2 ? 10 : 5, 0.3], [0.86, 2.58, lod <= 2 ? 6 : 3, 0.22], [3.0, 0.64, lod <= 2 ? 12 : 0, 0.26]];
    tiers.forEach(([r, y, k, s], ti) => { for (let i = 0; i < k; i++) { const a = i / k * TAU + ti, x = Math.cos(a) * r, z = Math.sin(a) * r; leafy(ctx, i); blob(P, x, y - 0.05, z, s, s * 0.9, s, 5); if (ti === 1 && lod <= 1) { blob(P, x * 1.08, y - 0.4, z * 1.08, s * 0.7, 0.4, s * 0.7, 4); } paint(ctx, null, BLOOM[(i + ti) % BLOOM.length], 0.7); for (let j = 0; j < (lod <= 2 ? 3 : 1); j++) { const b = a + j * 2.1; gem(P, x + Math.cos(b) * s * 0.6, y + s * 0.8, z + Math.sin(b) * s * 0.6, 0.07, 0.05, 0.04, 5); } } });
  }
  // pergola ring
  const RR = G.pergolaR, posts = 12;
  for (let k = 0; k < posts; k++) {
    const a = (15 + k * 30) * Math.PI / 180, x = Math.cos(a) * RR, z = Math.sin(a) * RR;
    paint(ctx, 'ashlar', COL.lime, 0.9); obox(P, x, 0, z, 0.38, 0.28, 0.38);
    paint(ctx, 'oak', COL.oak, 0.8); obox(P, x, 0.28, z, 0.22, 2.6, 0.22, -a);
  }
  const rs = lod <= 3 ? 24 : 12;
  for (const r of lod <= 3 ? [6.05, 6.75] : [6.4]) for (let i = 0; i < rs; i++) { const a = i / rs * TAU, b = (i + 1) / rs * TAU; beam(P, [Math.cos(a) * r, 2.9, Math.sin(a) * r], [Math.cos(b) * r, 2.9, Math.sin(b) * r], 0.13, 0.2); }
  if (lod <= 3) for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * TAU; beam(P, [Math.cos(a) * 5.6, 3.08, Math.sin(a) * 5.6], [Math.cos(a) * 7.2, 3.08, Math.sin(a) * 7.2], 0.09, 0.12); }
  if (lod >= 4) return;
  const nl = lod <= 2 ? 24 : 12;
  for (let i = 0; i < nl; i++) { const a = i / nl * TAU; leafy(ctx, i); blob(P, Math.cos(a) * RR, 3.0, Math.sin(a) * RR, 0.95, 0.38, 0.95, lod <= 2 ? 6 : 4, R); }
  if (lod <= 2) {
    for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * TAU; for (const r of lod <= 1 ? [5.8, 6.4, 7.0] : [6.4]) raceme(ctx, [Math.cos(a) * r + (R() - 0.5) * 0.3, 2.95, Math.sin(a) * r + (R() - 0.5) * 0.3], 0.5 + R() * 0.35, 0.09, R() - 0.5, lod); }
    col(ctx, 'oklch(0.5 0.08 120)', 0.9);
    for (let k = 0; k < posts; k++) { const a = (15 + k * 30) * Math.PI / 180, x = Math.cos(a) * RR, z = Math.sin(a) * RR, pts = []; for (let i = 0; i <= 10; i++) { const t = i * 0.8; pts.push([x + Math.cos(t) * 0.15, 0.3 + i * 0.26, z + Math.sin(t) * 0.15]); } tubeish(P, pts); }
  }
  // ring lights between post tops
  if (lod <= 3) {
    const tops = []; for (let k = 0; k < posts; k++) { const a = (15 + k * 30) * Math.PI / 180; tops.push([Math.cos(a) * 6.85, 2.85, Math.sin(a) * 6.85]); }
    for (let k = 0; k < posts; k++) strand(ctx, P, [tops[k], tops[(k + 1) % posts]], 0.35, lod);
  }
}
function tubeish(P, pts) { for (let i = 0; i < pts.length - 1; i++) beam(P, pts[i], pts[i + 1], 0.05); }
function strand(ctx, P, anchors, sag, lod) {
  const bulbs = [];
  paint(ctx, null, COL.iron, 0.7);
  for (let s = 0; s < anchors.length - 1; s++) {
    const a = anchors[s], b = anchors[s + 1], L = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(2, Math.round(L / 0.6));
    let prev = a;
    for (let i = 1; i <= n; i++) { const t = i / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * sag * L / 4, a[2] + (b[2] - a[2]) * t]; if (lod <= 2) beam(P, prev, p, 0.015); if (i < n) bulbs.push(p); prev = p; }
  }
  paint(ctx, null, BULB, 0.5, 0, BULBE);
  for (const p of bulbs) gem(P, p[0], p[1] - 0.06, p[2], 0.045, 0.02, 0.07, 4);
}
// ── stalls ──────────────────────────────────────────────────────────
const PC = { apples: 'oklch(0.55 0.18 25)', carrots: 'oklch(0.7 0.17 50)', pumpkins: 'oklch(0.7 0.16 55)', cabbages: 'oklch(0.8 0.12 130)', flowers: 'oklch(0.72 0.14 340)', plants: 'oklch(0.6 0.12 140)', seeds: 'oklch(0.8 0.12 90)', honey: 'oklch(0.72 0.15 70)' };
function fill(ctx, F, kind, cx, y, cz, w, d, lod, R) {
  if (lod >= 3) { col(ctx, PC[kind]); obox(F, cx, y, cz, w * 0.9, 0.07, d * 0.9); return; }
  const step = lod <= 1 ? 1 : 1.5;
  const grid = (s) => { const g = []; const nx = Math.max(1, Math.floor(w / (s * step))), nz = Math.max(1, Math.floor(d / (s * step))); for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) g.push([cx - w / 2 + (i + 0.5) * w / nx + (R() - 0.5) * 0.02, cz - d / 2 + (k + 0.5) * d / nz + (R() - 0.5) * 0.02]); return g; };
  if (kind === 'apples') { const g = grid(0.12); for (let c = 0; c < 2; c++) { col(ctx, c ? 'oklch(0.72 0.15 110)' : PC.apples, 0.5); g.forEach(([x, z], i) => { if ((i % 4 === 0 ? 1 : 0) !== c) return; blob(F, x, y - 0.02, z, 0.058, 0.1, 0.058, 4); }); } }
  else if (kind === 'carrots') { const g = grid(0.1); col(ctx, PC.carrots, 0.7); g.forEach(([x, z], i) => { const a = i * 0.7; beam(F, [x - Math.cos(a) * 0.1, y + 0.03, z - Math.sin(a) * 0.04], [x + Math.cos(a) * 0.1, y + 0.05, z + Math.sin(a) * 0.04], 0.035); }); col(ctx, 'oklch(0.62 0.15 135)', 0.9); g.forEach(([x, z], i) => { const a = i * 0.7, p = [x + Math.cos(a) * 0.1, y + 0.05, z + Math.sin(a) * 0.04]; T(F, p, [p[0] + Math.cos(a) * 0.14 - 0.03, p[1] + 0.08, p[2]], [p[0] + Math.cos(a) * 0.14 + 0.03, p[1] + 0.1, p[2] + 0.03], [p[0], p[1] - 1, p[2]]); }); }
  else if (kind === 'pumpkins') { const g = grid(0.3); col(ctx, PC.pumpkins, 0.7); g.forEach(([x, z], i) => blob(F, x, y - 0.03, z, 0.15 + (i % 2) * 0.03, 0.17, 0.15, 6)); col(ctx, 'oklch(0.45 0.07 100)', 0.9); g.forEach(([x, z]) => obox(F, x, y + 0.13, z, 0.03, 0.07, 0.03)); }
  else if (kind === 'cabbages') { const g = grid(0.22); col(ctx, PC.cabbages, 0.8); g.forEach(([x, z]) => blob(F, x, y - 0.03, z, 0.1, 0.17, 0.1, 5)); col(ctx, 'oklch(0.62 0.12 140)', 0.85); g.forEach(([x, z]) => blob(F, x, y - 0.04, z, 0.13, 0.1, 0.13, 5)); }
  else if (kind === 'flowers') { const g = grid(0.24); paint(ctx, null, 'oklch(0.75 0.01 240)', 0.4, 0.6); g.forEach(([x, z]) => lathe(F, [[0.07, 0], [0.09, 0.18]], 6, x, y - 0.1, z)); leafy(ctx, 0); g.forEach(([x, z]) => blob(F, x, y + 0.06, z, 0.11, 0.18, 0.11, 4)); for (let f = 0; f < 4; f++) { paint(ctx, null, BLOOM[f + 1 === 4 ? 0 : f + 1] , 0.7); g.forEach(([x, z], i) => { if ((i + f) % 2) return; for (let j = 0; j < 3; j++) { const a = j * 2.1 + f; gem(F, x + Math.cos(a) * 0.06, y + 0.24 + j * 0.02, z + Math.sin(a) * 0.06, 0.045, 0.035, 0.02, 5); } }); } }
  else if (kind === 'plants') { const g = grid(0.26); paint(ctx, null, 'oklch(0.62 0.12 45)', 0.9); g.forEach(([x, z]) => lathe(F, [[0.07, 0], [0.1, 0.15], [0.11, 0.16]], 6, x, y - 0.05, z)); g.forEach(([x, z], i) => { leafy(ctx, i); blob(F, x, y + 0.1, z, 0.12, 0.22, 0.12, 5, R); }); }
  else if (kind === 'seeds') { const n = Math.floor(w / 0.12); for (let c = 0; c < 4; c++) { col(ctx, BLOOM[c], 0.8); for (let r = 0; r < 2; r++) for (let i = c; i < n; i += 4) obox(F, cx - w / 2 + (i + 0.5) * w / n, y, cz - d / 4 + r * d / 2, 0.09, 0.13, 0.02); } col(ctx, 'oklch(0.95 0.02 90)'); for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) obox(F, cx - w / 2 + (i + 0.5) * w / n, y + 0.02, cz - d / 4 + r * d / 2 - 0.012, 0.07, 0.05, 0.005); }
  else if (kind === 'honey') { const g = grid(0.13); paint(ctx, null, PC.honey, 0.15, 0, 'oklch(0.3 0.08 70)'); g.forEach(([x, z]) => prism(F, ngon(6, 0.048, x, z), y - 0.02, y + 0.1)); col(ctx, 'oklch(0.6 0.16 25)', 0.9); g.forEach(([x, z]) => obox(F, x, y + 0.1, z, 0.11, 0.025, 0.11, 0.4)); }
}
function stall(ctx, s, lod, R) {
  const F = XF(ctx, s.at[0], 0, s.at[1], yawOf(s.face)), hw = 1.5, hd = 1.2;
  const g0 = s.goods[0], g1 = s.goods[1] || g0;
  paint(ctx, 'walnut', COL.walnut, 0.85); obox(F, 0, 0, -0.9, 3.0, 0.82, 0.7);
  paint(ctx, 'oak', COL.oak, 0.8); obox(F, 0, 0.82, -0.9, 3.15, 0.06, 0.82);
  if (lod <= 4) for (const [x, z, h] of [[-hw, -hd, 2.45], [hw, -hd, 2.45], [-hw, hd, 2.8], [hw, hd, 2.8]]) obox(F, x, 0, z, 0.14, h, 0.14);
  if (lod <= 3) {
    paint(ctx, 'oak', COL.oak, 0.8); for (const x of [-0.98, 0, 0.98]) obox(F, x, 0.88, -0.9, 0.86, 0.18, 0.56);
    for (const x of [-0.8, 0.8]) obox(F, x, 0, -1.6, 0.72, 0.3, 0.46);
    [-0.98, 0, 0.98].forEach((x, i) => fill(ctx, F, i === 1 ? g1 : g0, x, 1.06, -0.9, 0.78, 0.48, lod, R));
    fill(ctx, F, g1, -0.8, 0.3, -1.6, 0.64, 0.38, lod, R); fill(ctx, F, g0, 0.8, 0.3, -1.6, 0.64, 0.38, lod, R);
  }
  if (lod <= 2) {
    paint(ctx, 'oak', COL.oak, 0.8); obox(F, 0, 0, 0.95, 2.7, 0.06, 0.42); obox(F, 0, 0.7, 0.95, 2.7, 0.05, 0.42); obox(F, -1.3, 0, 0.95, 0.06, 1.2, 0.4); obox(F, 1.3, 0, 0.95, 0.06, 1.2, 0.4);
    fill(ctx, F, g1, -0.6, 0.75, 0.95, 1.1, 0.34, lod, R); fill(ctx, F, g0, 0.6, 0.75, 0.95, 1.1, 0.34, lod, R);
    paint(ctx, null, 'oklch(0.28 0.02 150)', 0.9); obox(F, 1.72, 0, -1.3, 0.05, 0.9, 0.5, 0.3); paint(ctx, null, 'oklch(0.95 0.02 90)'); obox(F, 1.745, 0.5, -1.3, 0.01, 0.25, 0.35, 0.3);
  }
  const front = [-1.45, 2.42], back = [1.4, 2.82];
  if (s.roof === 'canvas') {
    const n = lod <= 3 ? 8 : 2;
    for (let k = 0; k < n; k++) {
      paint(ctx, 'linen', k % 2 ? COL.cream : s.col, 0.95);
      const x0 = -1.7 + k * 3.4 / n, x1 = x0 + 3.4 / n;
      F.quad(x0, front[1], front[0], x1, front[1], front[0], x1, back[1], back[0], x0, back[1], back[0]);
      if (lod <= 2) { F.quad(x0, front[1], front[0], x0, front[1] - 0.2, front[0], x1, front[1] - 0.2, front[0], x1, front[1], front[0]); F.tri(x0, front[1] - 0.2, front[0], (x0 + x1) / 2, front[1] - 0.32, front[0], x1, front[1] - 0.2, front[0]); }
    }
  } else {
    paint(ctx, 'oak', COL.oak, 0.8);
    for (const x of [-1.55, 1.55]) beam(F, [x, front[1], front[0]], [x, back[1], back[0]], 0.1, 0.14);
    if (lod <= 3) for (let i = 0; i < 5; i++) { const t = i / 4, z = front[0] + (back[0] - front[0]) * t, y = front[1] + (back[1] - front[1]) * t + 0.1; beam(F, [-1.7, y, z], [1.7, y, z], 0.08); }
    if (lod <= 3) { for (let i = 0; i < 5; i++) for (let j = 0; j < (lod <= 2 ? 4 : 2); j++) { const t = i / 4, z = front[0] + (back[0] - front[0]) * t, y = front[1] + (back[1] - front[1]) * t + 0.12, x = -1.3 + j * 2.6 / ((lod <= 2 ? 4 : 2) - 1 || 1); leafy(ctx, i + j); blob(F, x + (R() - 0.5) * 0.3, y, z, 0.5, 0.24, 0.42, lod <= 2 ? 5 : 4, R); } }
    if (lod <= 2) { leafy(ctx, 1); for (let i = 0; i < 7; i++) { const x = -1.5 + i * 0.5, L = 0.4 + R() * 0.5; F.quad(x - 0.12, front[1] + 0.1, front[0] - 0.02, x + 0.12, front[1] + 0.1, front[0] - 0.02, x + 0.05, front[1] - L, front[0] - 0.05, x - 0.05, front[1] - L, front[0] - 0.05); }
      paint(ctx, null, 'oklch(0.48 0.13 310)', 0.7); for (let i = 0; i < 6; i++) gem(F, -1.3 + i * 0.52, front[1] - 0.05, front[0] + 0.3 + (i % 2) * 0.5, 0.07, 0.05, 0.14, 5); }
  }
}
// ── dressing ────────────────────────────────────────────────────────
function tree(ctx, x, z, kind, lod, R) {
  const P = ctx;
  paint(ctx, 'cdn/texture-rough-oak-bark-cozy.png', 'oklch(0.85 0.03 60)', 0.95);
  beam(P, [x, 0, z], [x + 0.1, 1.5, z + 0.05], 0.3, 0.3);
  const limbs = [[1.1, 3.0, 0.3], [-0.9, 3.1, 0.6], [0.1, 3.3, -1.0]];
  if (lod <= 3) for (const [dx, y, dz] of limbs) beam(P, [x + 0.1, 1.45, z + 0.05], [x + dx * 0.7, y - 0.4, z + dz * 0.7], 0.14);
  const canopy = lod >= 4 ? [[0, 3.0, 0, 2.2]] : lod === 3 ? [[0.4, 2.7, 0.2, 1.8], [-0.4, 3.0, -0.3, 1.7]] : [[0.9, 2.5, 0.3, 1.4], [-0.8, 2.6, 0.5, 1.4], [0.1, 2.6, -0.9, 1.4], [0, 3.3, 0, 1.5]];
  canopy.forEach(([dx, y, dz, r], i) => { leafy(ctx, i); blob(P, x + dx, y - r * 0.55, z + dz, r, r * 1.3, r, lod <= 2 ? 7 : 5, lod <= 2 ? R : null); });
  if (lod <= 2) { col(ctx, kind === 'pear' ? 'oklch(0.82 0.14 110)' : 'oklch(0.56 0.19 25)', 0.5); const n = lod <= 1 ? 16 : 8; for (let i = 0; i < n; i++) { const a = i * 2.4, h = 1.7 + (i % 5) * 0.45, r = 1.75 + (i % 3) * 0.2; if (kind === 'pear') blob(P, x + Math.cos(a) * r, h, z + Math.sin(a) * r, 0.07, 0.16, 0.07, 4); else blob(P, x + Math.cos(a) * r, h, z + Math.sin(a) * r, 0.08, 0.14, 0.08, 4); } }
}
function lemon(ctx, x, z, lod, R) {
  const P = ctx;
  paint(ctx, null, 'oklch(0.62 0.12 45)', 0.9); lathe(P, [[0.3, 0], [0.45, 0.55], [0.5, 0.6], [0.5, 0.66], [0.42, 0.66], [0.42, 0.58]], lod <= 2 ? 10 : 6, x, 0, z);
  paint(ctx, 'soil', 'oklch(0.9 0.02 60)', 0.95); lathe(P, [[0.42, 0.58], [0, 0.58]], 6, x, 0, z);
  col(ctx, 'oklch(0.5 0.05 60)', 0.9); beam(P, [x, 0.58, z], [x, 1.2, z], 0.06);
  leafy(ctx, 2); blob(P, x, 0.95, z, 0.65, 1.05, 0.65, lod <= 2 ? 6 : 4, R);
  if (lod <= 2) { col(ctx, 'oklch(0.88 0.16 100)', 0.5); for (let i = 0; i < 9; i++) { const a = i * 2.3, h = 1.1 + (i % 3) * 0.25; blob(P, x + Math.cos(a) * 0.6, h, z + Math.sin(a) * 0.6, 0.06, 0.11, 0.06, 4); } }
}
function bench(ctx, b, lod) {
  const F = XF(ctx, b.at[0], 0, b.at[1], yawOf(b.face));
  paint(ctx, null, COL.iron, 0.6, 0.4); for (const x of [-0.7, 0.7]) { obox(F, x, 0, -0.15, 0.05, 0.45, 0.05); obox(F, x, 0, 0.18, 0.05, 0.92, 0.05); obox(F, x, 0.4, 0, 0.05, 0.04, 0.42); }
  paint(ctx, 'oak', COL.oak, 0.8); for (let i = 0; i < (lod <= 2 ? 3 : 1); i++) obox(F, 0, 0.44, -0.15 + i * 0.14 * (lod <= 2 ? 1 : 0), 1.6, 0.04, lod <= 2 ? 0.12 : 0.42);
  for (let i = 0; i < (lod <= 2 ? 2 : 1); i++) obox(F, 0, 0.6 + i * 0.2, 0.2, 1.6, 0.12, 0.03);
}
function hive(ctx, x, z, i, lod, R) {
  const P = ctx, H = ['oklch(0.96 0.02 90)', 'oklch(0.85 0.06 140)', 'oklch(0.9 0.08 95)'];
  paint(ctx, 'walnut', COL.walnut, 0.85); obox(P, x, 0, z, 0.6, 0.35, 0.5);
  for (let k = 0; k < 3; k++) { col(ctx, H[(k + i) % 3], 0.8); obox(P, x, 0.35 + k * 0.27, z, 0.52, 0.25, 0.42); }
  paint(ctx, 'cedar', 'oklch(0.95 0.02 70)', 0.9); obox(P, x, 1.16, z, 0.64, 0.08, 0.54);
  if (lod <= 2) { col(ctx, 'oklch(0.3 0.03 60)'); obox(P, x, 0.37, z - 0.211, 0.2, 0.03, 0.01); col(ctx, 'oklch(0.66 0.13 300)', 0.8); for (let k = 0; k < 6; k++) { const a = k * 1.05 + i, px = x + Math.cos(a) * 0.75, pz = z + Math.sin(a) * 0.7; for (let j = 0; j < 3; j++) gem(P, px + (j - 1) * 0.08, 0.35 + j * 0.05, pz, 0.04, 0.2, 0.04, 4); } leafy(ctx, 2); for (let k = 0; k < 6; k++) { const a = k * 1.05 + i; blob(P, x + Math.cos(a) * 0.75, 0, z + Math.sin(a) * 0.7, 0.22, 0.3, 0.22, 4); } }
}
function kiosk(ctx, x, z, lod, R) {
  const F = XF(ctx, x, 0, z, 0), n = 8, r = 1.5, rot = Math.PI / 8, c = ngon(n, r, 0, 0, rot);
  paint(ctx, 'ashlar', COL.lime, 0.9); prism(F, ngon(n, 1.68, 0, 0, rot), 0, 0.3);
  if (lod <= 3) { // inside: tiered stand of potted blooms
    paint(ctx, 'oak', COL.oak, 0.8); lathe(F, [[0.8, 0.3], [0.8, 0.65], [0.55, 0.65], [0.55, 1.0], [0.3, 1.0], [0.3, 1.35], [0, 1.35]], 8, 0, 0, 0);
    if (lod <= 2) { const pots = []; for (const [rr, y, k] of [[0.68, 0.65, 8], [0.43, 1.0, 5], [0.15, 1.35, 1]]) for (let i = 0; i < k; i++) { const a = i / k * TAU; pots.push([Math.cos(a) * rr, y, Math.sin(a) * rr]); } paint(ctx, null, 'oklch(0.62 0.12 45)', 0.9); pots.forEach((p) => lathe(F, [[0.07, 0], [0.09, 0.13]], 6, p[0], p[1], p[2])); pots.forEach((p, i) => { leafy(ctx, i); blob(F, p[0], p[1] + 0.1, p[2], 0.1, 0.15, 0.1, 4); }); pots.forEach((p, i) => { paint(ctx, null, BLOOM[i % BLOOM.length], 0.7); gem(F, p[0], p[1] + 0.26, p[2], 0.06, 0.04, 0.03, 5); }); }
  }
  paint(ctx, null, COL.iron, 0.55, 0.5);
  for (const p of c) obox(F, p[0], 0.3, p[1], 0.06, 2.0, 0.06);
  if (lod <= 2) for (const y of [0.9, 2.3]) for (let i = 0; i < n; i++) beam(F, [c[i][0], y, c[i][1]], [c[(i + 1) % n][0], y, c[(i + 1) % n][1]], 0.04);
  for (let i = 0; i < n; i++) beam(F, [c[i][0], 2.3, c[i][1]], [0, 3.25, 0], 0.05);
  paint(ctx, 'brass', 'oklch(0.9 0.06 85)', 0.35, 0.8); blob(F, 0, 3.2, 0, 0.12, 0.25, 0.12, 5);
  paint(ctx, null, 'oklch(0.93 0.04 165)', 0.05, 0); ctx.color('oklch(0.93 0.04 165)', 0.26);
  for (let i = 0; i < n; i++) { const a = c[i], b = c[(i + 1) % n]; if (i === n - 1) continue; F.quad(a[0], 0.3, a[1], b[0], 0.3, b[1], b[0], 2.3, b[1], a[0], 2.3, a[1]); }
  for (let i = 0; i < n; i++) { const a = c[i], b = c[(i + 1) % n]; F.tri(a[0], 2.3, a[1], b[0], 2.3, b[1], 0, 3.25, 0); }
}
function cart(ctx, x, z, lod, R) {
  const F = XF(ctx, x, 0, z, Math.PI / 2); // front −z faces −x: the path
  paint(ctx, 'oak', COL.oak, 0.8); obox(F, 0, 0.45, 0, 1.7, 0.5, 0.9);
  paint(ctx, 'walnut', COL.walnut, 0.85); beam(F, [0.85, 0.7, -0.3], [1.55, 0.75, -0.3], 0.05); beam(F, [0.85, 0.7, 0.3], [1.55, 0.75, 0.3], 0.05); obox(F, -0.75, 0, 0, 0.08, 0.45, 0.08);
  for (const s of [-1, 1]) { const W = XF(F, 0.2, 0.42, s * 0.5, 0, Math.PI / 2); prism(W, ngon(lod <= 2 ? 12 : 6, 0.42), -0.04, 0.04); }
  if (lod <= 3) { const spots = [[-0.55, -0.2], [0, -0.2], [0.55, -0.2], [-0.3, 0.22], [0.3, 0.22]]; paint(ctx, null, 'oklch(0.75 0.01 240)', 0.4, 0.6); spots.forEach(([a, b]) => lathe(F, [[0.12, 0], [0.15, 0.24]], 6, a, 0.95, b)); spots.forEach(([a, b], i) => { leafy(ctx, i); blob(F, a, 1.12, b, 0.17, 0.26, 0.17, 5); }); if (lod <= 2) for (let f = 0; f < spots.length; f++) { paint(ctx, null, BLOOM[f], 0.7); const [a, b] = spots[f]; for (let j = 0; j < 5; j++) { const q = j * 1.26; gem(F, a + Math.cos(q) * 0.1, 1.38 + (j % 2) * 0.05, b + Math.sin(q) * 0.1, 0.05, 0.04, 0.02, 5); } } }
  paint(ctx, null, COL.iron, 0.6, 0.4); beam(F, [-0.6, 0.95, 0.35], [-0.6, 2.4, 0.35], 0.04);
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, b = (k + 1) / 8 * TAU; paint(ctx, 'linen', k % 2 ? COL.cream : 'oklch(0.72 0.12 350)', 0.95); F.tri(-0.6, 2.6, 0.35, -0.6 + Math.cos(a) * 1.1, 2.25, 0.35 + Math.sin(a) * 1.1, -0.6 + Math.cos(b) * 1.1, 2.25, 0.35 + Math.sin(b) * 1.1); }
}
function dressing(ctx, lod, R) {
  for (const t of G.trees) tree(ctx, t.at[0], t.at[1], t.kind, lod, R);
  for (const l of G.lemons) lemon(ctx, l[0], l[1], lod, R);
  if (lod <= 3) for (const b of G.benches) bench(ctx, b, lod);
  for (const a of G.arches) { const L = Math.hypot(a.dir[0], a.dir[1]); arch(ctx, ctx, a.at[0], a.at[1], -a.dir[1] / L, a.dir[0] / L, 3.9, 2.1, 0.8, lod, R); }
  G.hives.forEach((h, i) => hive(ctx, h[0], h[1], i, lod, R));
  kiosk(ctx, G.kiosk[0], G.kiosk[1], lod, R);
  cart(ctx, G.cart[0], G.cart[1], lod, R);
  if (lod <= 3) for (const s of G.strands) strand(ctx, ctx, s, 0.3, lod);
}
function pondwater(ctx) { const p = G.pond, n = 24; for (let i = 0; i < n; i++) { const a = i / n * TAU, b = (i + 1) / n * TAU; T(ctx, [p.x, 0.12, p.z], [p.x + Math.cos(a) * (p.rx + 0.1), 0.12, p.z + Math.sin(a) * (p.rz + 0.1)], [p.x + Math.cos(b) * (p.rx + 0.1), 0.12, p.z + Math.sin(b) * (p.rz + 0.1)], [p.x, -1, p.z]); } }
export const geometry = softened(function geometry(ctx) {
  const it = ctx.params.item || 'ground', lod = ctx.lod || 1, R = () => ctx.random();
  if (it === 'ground') ground(ctx, lod, R);
  else if (it === 'fountain') fountain(ctx, lod, R);
  else if (it === 'stalls') for (const s of G.stalls) stall(ctx, s, lod, R);
  else if (it === 'dressing') dressing(ctx, lod, R);
  else if (it === 'pondwater') pondwater(ctx);
});
export function collider(ctx) {
  const it = ctx.params.item || 'ground', P = ctx;
  if (it === 'pondwater') return null;
  if (it === 'ground') {
    for (const r of hedgeRuns()) { const [cx, cz, sx, sz] = runBox(r); obox(P, cx, 0, cz, sx, G.hedgeH, sz); }
    for (const g of G.gates) { const f = gateFrame(g), off = G.gateW / 2 + 0.4; for (const s of [-1, 1]) obox(P, f.x + f.ax * s * off, 0, f.z + f.az * s * off, 0.95, 2.4, 0.95); }
    const b = G.bridge, n = 8, hw = b.w / 2, z = (t) => b.z0 + (b.z1 - b.z0) * t;
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n; Q(P, [b.x - hw, bridgeY(t0), z(t0)], [b.x + hw, bridgeY(t0), z(t0)], [b.x + hw, bridgeY(t1), z(t1)], [b.x - hw, bridgeY(t1), z(t1)], [b.x, -5, (z(t0) + z(t1)) / 2]); }
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const t0 = i / 4, t1 = (i + 1) / 4; const x = b.x + s * hw; Q(P, [x, bridgeY(t0), z(t0)], [x, bridgeY(t0) + 1, z(t0)], [x, bridgeY(t1) + 1, z(t1)], [x, bridgeY(t1), z(t1)], [b.x, 0.5, z(t0)]); }
    return;
  }
  if (it === 'fountain') { prism(P, ngon(16, 3.25), 0, 0.64); for (let k = 0; k < 12; k++) { const a = (15 + k * 30) * Math.PI / 180; obox(P, Math.cos(a) * G.pergolaR, 0, Math.sin(a) * G.pergolaR, 0.3, 2.9, 0.3); } return; }
  if (it === 'stalls') { for (const s of G.stalls) { const F = XF(P, s.at[0], 0, s.at[1], yawOf(s.face)); obox(F, 0, 0, -1.2, 3.2, 0.95, 1.4); obox(F, 0, 0, 0.95, 2.8, 1.2, 0.45); } return; }
  if (it === 'dressing') {
    for (const t of G.trees) obox(P, t.at[0], 0, t.at[1], 0.4, 2.5, 0.4);
    for (const l of G.lemons) prism(P, ngon(8, 0.5, l[0], l[1]), 0, 0.66);
    for (const b of G.benches) { const F = XF(P, b.at[0], 0, b.at[1], yawOf(b.face)); obox(F, 0, 0, 0, 1.6, 0.48, 0.5); }
    for (const h of G.hives) obox(P, h[0], 0, h[1], 0.64, 1.24, 0.54);
    prism(P, ngon(8, 1.68, G.kiosk[0], G.kiosk[1], Math.PI / 8), 0, 2.4);
    obox(P, G.cart[0], 0, G.cart[1], 0.9, 1.0, 1.7);
    for (const a of G.arches) { const L = Math.hypot(a.dir[0], a.dir[1]), ax = -a.dir[1] / L, az = a.dir[0] / L; for (const s of [-1, 1]) obox(P, a.at[0] + ax * s * 1.95, 0, a.at[1] + az * s * 1.95, 0.2, 2.2, 0.2); }
  }
}
