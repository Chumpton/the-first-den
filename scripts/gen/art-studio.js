import { softened } from "./soften.js";
// The high-tech art studio under the cob house. One script, params.item picks the piece; every piece's origin is
// its feet on the studio floor, its front facing -Z (wall pieces: back against the wall at z = 0 … +depth).
const STEEL = "oklch(0.3 0.01 250)", ALU = "oklch(0.82 0.01 250)", WHITE = "oklch(0.97 0.005 250)", WALNUT = "oklch(0.62 0.07 55)";
const PLANK = "cdn/texture-honey-oak-floor-planks.png";
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function crs(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
// a quad / tri wound so its face looks along n
function Q(ctx, a, b, c, d, n) { const f = crs(sub(b, a), sub(c, a)); if (f[0] * n[0] + f[1] * n[1] + f[2] * n[2] >= 0) ctx.quad(...a, ...b, ...c, ...d); else ctx.quad(...d, ...c, ...b, ...a); }
function T(ctx, a, b, c, n) { const f = crs(sub(b, a), sub(c, a)); if (f[0] * n[0] + f[1] * n[1] + f[2] * n[2] >= 0) ctx.tri(...a, ...b, ...c); else ctx.tri(...c, ...b, ...a); }
function box(ctx, x0, y0, z0, x1, y1, z1) {
  Q(ctx, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0]);
  Q(ctx, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
  Q(ctx, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  Q(ctx, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]);
  Q(ctx, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]);
  Q(ctx, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
}
const cbox = (ctx, cx, y0, cz, w, h, d) => box(ctx, cx - w / 2, y0, cz - d / 2, cx + w / 2, y0 + h, cz + d / 2);
// a cylinder along Y (r at the bottom, r2 at the top)
function cyl(ctx, cx, y0, cz, r, h, n = 12, r2 = r) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2, m = (a + b) / 2;
    const p = (ang, rr, y) => [cx + Math.cos(ang) * rr, y, cz + Math.sin(ang) * rr];
    Q(ctx, p(a, r, y0), p(a, r2, y0 + h), p(b, r2, y0 + h), p(b, r, y0), [Math.cos(m), 0, Math.sin(m)]);
    T(ctx, [cx, y0 + h, cz], p(b, r2, y0 + h), p(a, r2, y0 + h), [0, 1, 0]);
    T(ctx, [cx, y0, cz], p(a, r, y0), p(b, r, y0), [0, -1, 0]);
  }
}
// a tube between two points (arms, legs, rails)
function rod(ctx, a, b, r, n = 8) {
  const d = sub(b, a), L = Math.hypot(...d); if (L < 1e-4) return;
  const f = d.map((v) => v / L); let s = crs(f, [0, 1, 0]);
  if (Math.hypot(...s) < 1e-3) s = [1, 0, 0]; const sl = Math.hypot(...s); s = s.map((v) => v / sl);
  const u = crs(f, s);
  const dir = (ang) => [s[0] * Math.cos(ang) + u[0] * Math.sin(ang), s[1] * Math.cos(ang) + u[1] * Math.sin(ang), s[2] * Math.cos(ang) + u[2] * Math.sin(ang)];
  const P = (o, ang) => { const q = dir(ang); return [o[0] + q[0] * r, o[1] + q[1] * r, o[2] + q[2] * r]; };
  for (let i = 0; i < n; i++) { const A = (i / n) * 6.2832, B = ((i + 1) / n) * 6.2832; Q(ctx, P(a, A), P(a, B), P(b, B), P(b, A), dir((A + B) / 2)); }
}
const paint = (ctx, col, rough = 0.6, metal = 0, tex = null) => { ctx.albedo(tex); ctx.color(col); ctx.roughness(rough); ctx.metalness(metal); ctx.emissive(null); };

// ---- pieces ----
// the shell dressing: LED coves round the ceiling and floor of the hex, slim track rails with spot heads,
// a ring bench round the tree's roots with a light under its lip. Origin = the house centre on the studio floor.
function shell(ctx, p) {
  const AI = p.ai ?? 7.468, H = p.h ?? 6.2, lod = ctx.lod ?? 1;
  const hex = (ap, k) => { const a = (60 * k) * Math.PI / 180, r = ap / Math.cos(Math.PI / 6); return [Math.cos(a) * r, Math.sin(a) * r]; };
  for (const [y, ap, h, d, e] of [[H - 0.28, AI - 0.02, 0.05, 0.14, [3.2, 2.4, 1.5]], [0.02, AI - 0.02, 0.03, 0.05, [0.9, 2.2, 2.6]]]) {
    for (let k = 0; k < 6; k++) {
      const a = hex(ap, k), b = hex(ap, k + 1), a2 = hex(ap - d, k), b2 = hex(ap - d, k + 1);
      paint(ctx, WHITE, 0.5); ctx.emissive(...e);
      Q(ctx, [a[0], y, a[1]], [b[0], y, b[1]], [b2[0], y, b2[1]], [a2[0], y, a2[1]], [0, -1, 0]);
      Q(ctx, [a2[0], y, a2[1]], [b2[0], y, b2[1]], [b2[0], y + h, b2[1]], [a2[0], y + h, a2[1]], [-(a2[0] + b2[0]), 0, -(a2[1] + b2[1])]);
      Q(ctx, [a[0], y + h, a[1]], [a2[0], y + h, a2[1]], [b2[0], y + h, b2[1]], [b[0], y + h, b[1]], [0, 1, 0]);
    }
  }
  ctx.emissive(null);
  // vertical fins: slim white acoustic battens on the three gallery walls (faces 2, 3, 5), floor to cove
  if (lod < 3) for (const k of [2, 3]) {
    const th = (30 + 60 * k) * Math.PI / 180, n = [Math.cos(th), Math.sin(th)], t = [n[1], -n[0]];
    for (let i = -7; i <= 7; i++) {
      const u = i * 0.52, c = [n[0] * (AI - 0.04) + t[0] * u, n[1] * (AI - 0.04) + t[1] * u];
      paint(ctx, i % 3 === 0 ? "oklch(0.88 0.01 250)" : WHITE, 0.8);
      box(ctx, c[0] - 0.035, 0.16, c[1] - 0.035, c[0] + 0.035, H - 0.4, c[1] + 0.035);
    }
  }
  // two track rails crossing the ceiling, spot heads aimed down
  for (const ang of [0, Math.PI / 3, -Math.PI / 3]) {
    const dx = Math.cos(ang), dz = Math.sin(ang), L = 5.6;
    paint(ctx, STEEL, 0.35, 0.8);
    for (const sgn of [-1, 1]) {
      const a = [dx * 1.2 * sgn, H - 0.06, dz * 1.2 * sgn], b = [dx * L * sgn, H - 0.06, dz * L * sgn];
      rod(ctx, a, b, 0.025, 6);
      for (let i = 0; i < 3; i++) {
        const f = 0.2 + i * 0.35, x = a[0] + (b[0] - a[0]) * f, z = a[2] + (b[2] - a[2]) * f;
        paint(ctx, STEEL, 0.35, 0.8); rod(ctx, [x, H - 0.06, z], [x, H - 0.3, z], 0.012, 5);
        cyl(ctx, x, H - 0.52, z, 0.07, 0.24, 10, 0.09);
        paint(ctx, "oklch(0.98 0.02 90)"); ctx.emissive(4, 3.1, 2.0); cyl(ctx, x, H - 0.53, z, 0.055, 0.012, 10);
      }
    }
  }
  ctx.emissive(null);
  // the root bench: a hexagon of walnut round the trunk, a cool light spilling under its lip
  const R0 = p.benchR0 ?? 2.05, R1 = p.benchR1 ?? 2.75, y = 0.45;
  for (let k = 0; k < 6; k++) {
    const a0 = hex(R0 * Math.cos(Math.PI / 6), k), a1 = hex(R0 * Math.cos(Math.PI / 6), k + 1), b0 = hex(R1 * Math.cos(Math.PI / 6), k), b1 = hex(R1 * Math.cos(Math.PI / 6), k + 1);
    paint(ctx, WALNUT, 0.45, 0, PLANK);
    Q(ctx, [a0[0], y, a0[1]], [a1[0], y, a1[1]], [b1[0], y, b1[1]], [b0[0], y, b0[1]], [0, 1, 0]);
    Q(ctx, [b0[0], y - 0.08, b0[1]], [b1[0], y - 0.08, b1[1]], [b1[0], y, b1[1]], [b0[0], y, b0[1]], [b0[0] + b1[0], 0, b0[1] + b1[1]]);
    paint(ctx, "oklch(0.25 0.01 250)", 0.5);
    const c0 = hex((R1 - 0.12) * Math.cos(Math.PI / 6), k), c1 = hex((R1 - 0.12) * Math.cos(Math.PI / 6), k + 1);
    Q(ctx, [c0[0], 0, c0[1]], [c1[0], 0, c1[1]], [c1[0], y - 0.08, c1[1]], [c0[0], y - 0.08, c0[1]], [c0[0] + c1[0], 0, c0[1] + c1[1]]);
    const i0 = hex((R0 + 0.06) * Math.cos(Math.PI / 6), k), i1 = hex((R0 + 0.06) * Math.cos(Math.PI / 6), k + 1);
    Q(ctx, [i0[0], 0, i0[1]], [i1[0], 0, i1[1]], [i1[0], y, i1[1]], [i0[0], y, i0[1]], [-(i0[0] + i1[0]), 0, -(i0[1] + i1[1])]);
    paint(ctx, WHITE); ctx.emissive(0.6, 2.0, 2.4);
    const e0 = hex((R1 - 0.1) * Math.cos(Math.PI / 6), k), e1 = hex((R1 - 0.1) * Math.cos(Math.PI / 6), k + 1);
    Q(ctx, [e0[0], 0.04, e0[1]], [e1[0], 0.04, e1[1]], [e1[0], 0.07, e1[1]], [e0[0], 0.07, e0[1]], [e0[0] + e1[0], 0, e0[1] + e1[1]]);
    ctx.emissive(null);
  }
  // a floor inlay: a thin brass hex ring at 3.4 m, the studio's compass
  paint(ctx, "oklch(0.78 0.1 80)", 0.3, 0.9);
  for (let k = 0; k < 6; k++) { const a = hex(3.4, k), b = hex(3.4, k + 1), a2 = hex(3.34, k), b2 = hex(3.34, k + 1); Q(ctx, [a[0], 0.004, a[1]], [a2[0], 0.004, a2[1]], [b2[0], 0.004, b2[1]], [b[0], 0.004, b[1]], [0, 1, 0]); }
}
// the video wall: 3×2 bezel-less panels, one picture across them, on a floating black frame. Back at z = 0.
function screenwall(ctx, p) {
  const W = p.w ?? 6.0, Hh = p.hgt ?? 3.0, y0 = p.y ?? 1.1, uvs = [];
  paint(ctx, "oklch(0.18 0.01 250)", 0.4, 0.5);
  box(ctx, -W / 2 - 0.08, y0 - 0.08, -0.12, W / 2 + 0.08, y0 + Hh + 0.08, 0);
  paint(ctx, WHITE, 0.2); ctx.emissive(0.9, 1.4, 2.2);
  box(ctx, -W / 2 + 0.3, y0 - 0.12, -0.05, W / 2 - 0.3, y0 - 0.1, 0); // the wash light under it
  ctx.emissive(null);
  // the seams: hair-thin dark lines between panels
  paint(ctx, "oklch(0.1 0 0)", 0.3);
  for (const x of [-W / 6, W / 6]) box(ctx, x - 0.006, y0, -0.131, x + 0.006, y0 + Hh, -0.12);
  box(ctx, -W / 2, y0 + Hh / 2 - 0.006, -0.131, W / 2, y0 + Hh / 2 + 0.006, -0.12);

}
// an easel: aluminium A-frame, a stretched canvas at a lean, a paint tray. Canvas faces -Z.
function easel(ctx, p) {
  const cw = p.cw ?? 1.3, ch = p.ch ?? 1.62, cy = p.cy ?? 0.95;
  paint(ctx, ALU, 0.35, 0.85);
  rod(ctx, [-0.45, 0, 0.1], [0, cy + ch + 0.25, 0.2], 0.022); rod(ctx, [0.45, 0, 0.1], [0, cy + ch + 0.25, 0.2], 0.022);
  rod(ctx, [0, 0, 0.9], [0, cy + ch + 0.2, 0.22], 0.02);
  paint(ctx, STEEL, 0.4, 0.8); cbox(ctx, 0, cy - 0.06, -0.02, cw + 0.2, 0.05, 0.14); // the ledge
  // paint tray on the ledge: tubes and a jar of brushes
  const cols = ["oklch(0.65 0.2 25)", "oklch(0.8 0.15 90)", "oklch(0.6 0.12 200)", "oklch(0.55 0.2 300)"];
  cols.forEach((c, i) => { paint(ctx, c, 0.4); cbox(ctx, -0.45 + i * 0.1, cy - 0.01, -0.04, 0.04, 0.03, 0.12); });
  paint(ctx, "oklch(0.9 0.02 210)", 0.1); cyl(ctx, 0.45, cy - 0.01, -0.02, 0.045, 0.1, 10);
  paint(ctx, WALNUT, 0.6); for (let i = 0; i < 4; i++) rod(ctx, [0.45 + (i - 1.5) * 0.012, cy, -0.02], [0.45 + (i - 1.5) * 0.04, cy + 0.26, -0.02 + (i % 2) * 0.03], 0.006, 4);
  // stretcher bars behind the canvas
  paint(ctx, "oklch(0.8 0.04 70)", 0.8);
  box(ctx, -cw / 2, cy, 0.02, cw / 2, cy + ch, 0.06);
}
// a framed print on the wall: thin black frame, white mat, backlit edge. Back at z = 0.
function frame(ctx, p) {
  const w = p.fw ?? 1.2, h = p.fh ?? 1.5, y0 = p.y ?? 1.4;
  paint(ctx, WHITE); ctx.emissive(1.2, 1.3, 1.5);
  box(ctx, -w / 2 - 0.04, y0 - 0.04, -0.03, w / 2 + 0.04, y0 + h + 0.04, 0); // the halo behind
  paint(ctx, "oklch(0.15 0 0)", 0.4);
  box(ctx, -w / 2 - 0.03, y0 - 0.03, -0.07, w / 2 + 0.03, y0 + h + 0.03, -0.03);
  paint(ctx, "oklch(0.98 0.005 90)", 0.9);
  box(ctx, -w / 2 + 0.01, y0 + 0.01, -0.072, w / 2 - 0.01, y0 + h - 0.01, -0.07);
}
// the robot arm on its plinth, brush to the canvas at -Z. Six joints, painted safety orange.
function robotarm(ctx, p) {
  const ORANGE = "oklch(0.7 0.17 50)";
  paint(ctx, STEEL, 0.4, 0.7); cbox(ctx, 0, 0, 0, 0.9, 0.5, 0.9);
  paint(ctx, "oklch(0.8 0.15 90)", 0.5); cbox(ctx, 0, 0.5, 0, 0.92, 0.02, 0.92);
  paint(ctx, ORANGE, 0.35, 0.2); cyl(ctx, 0, 0.52, 0, 0.3, 0.28, 16);
  const sh = [0, 1.05, 0], el = [0.15, 1.9, -0.55], wr = [0.05, 1.55, -1.25], tip = [0.02, 1.45, -1.6];
  paint(ctx, STEEL, 0.4, 0.8); cyl(ctx, 0, 0.8, 0, 0.18, 0.3, 12);
  paint(ctx, ORANGE, 0.35, 0.2); rod(ctx, [0, 0.8, 0], sh, 0.17, 12); rod(ctx, sh, el, 0.13, 12); rod(ctx, el, wr, 0.1, 12);
  paint(ctx, STEEL, 0.4, 0.8);
  for (const j of [sh, el, wr]) rod(ctx, [j[0] - 0.19, j[1], j[2]], [j[0] + 0.19, j[1], j[2]], 0.15, 12);
  rod(ctx, wr, tip, 0.05, 8);
  paint(ctx, WALNUT, 0.6); rod(ctx, tip, [0.02, 1.4, -1.9], 0.015, 6);
  paint(ctx, "oklch(0.55 0.13 200)", 0.4); rod(ctx, [0.02, 1.4, -1.9], [0.02, 1.38, -1.97], 0.02, 6);
  paint(ctx, "oklch(0.3 0.12 150)"); ctx.emissive(0.3, 3, 1); cbox(ctx, 0, 0.3, -0.455, 0.1, 0.06, 0.01); ctx.emissive(null); // status light
  paint(ctx, "oklch(0.2 0 0)", 0.8); rod(ctx, [0, 0.6, 0.3], [0.3, 0.02, 0.9], 0.03, 6); // cable
}
// the hologram plinth: a steel drum with a glowing ring, and a floating sculpture of shards above it
function holo(ctx, p) {
  paint(ctx, "oklch(0.2 0.01 250)", 0.3, 0.6); cyl(ctx, 0, 0, 0, 0.55, 0.62, 20, 0.5);
  paint(ctx, WHITE); ctx.emissive(0.5, 2.6, 3.2); cyl(ctx, 0, 0.62, 0, 0.46, 0.02, 20);
  ctx.emissive(null);
  // shards: a slow spiral of glowing panes, see-through cyan
  for (let i = 0; i < 22; i++) {
    const a = i * 0.9, r = 0.12 + (i % 5) * 0.06, y = 0.9 + i * 0.045, s = 0.1 + (i % 3) * 0.05;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, tx = -Math.sin(a) * s, tz = Math.cos(a) * s;
    ctx.albedo(null); ctx.color(i % 4 === 0 ? "oklch(0.85 0.12 330)" : "oklch(0.88 0.1 200)", 0.55); if (i % 4 === 0) ctx.emissive(2.4, 0.9, 2.4); else ctx.emissive(0.6, 2.2, 2.8);
    Q(ctx, [x - tx, y - s, z - tz], [x + tx, y - s * 0.3, z + tz], [x + tx * 0.4, y + s, z + tz * 0.4], [x - tx * 0.6, y + s * 0.4, z - tz * 0.6], [x, 0, z]); Q(ctx, [x - tx, y - s, z - tz], [x + tx, y - s * 0.3, z + tz], [x + tx * 0.4, y + s, z + tz * 0.4], [x - tx * 0.6, y + s * 0.4, z - tz * 0.6], [-x, 0, -z]);
  }
  ctx.emissive(null);
}
// the workstation: a white standing desk, two monitors, a drawing tablet, a stool. Faces -Z (the artist looks -Z).
function desk(ctx, p) {
  const W = 2.2, D = 0.8, top = 0.95, uvs = [];
  paint(ctx, WHITE, 0.4); box(ctx, -W / 2, top - 0.04, -D / 2, W / 2, top, D / 2);
  paint(ctx, STEEL, 0.35, 0.8);
  for (const x of [-W / 2 + 0.12, W / 2 - 0.12]) { cbox(ctx, x, 0, 0, 0.08, top - 0.04, 0.08); cbox(ctx, x, 0, 0, 0.08, 0.03, D * 0.9); }
  paint(ctx, "oklch(0.22 0.01 250)", 0.3); box(ctx, -0.25, top, 0.05, 0.25, top + 0.012, 0.38); // tablet
  paint(ctx, "oklch(0.5 0.15 260)"); ctx.emissive(0.4, 0.6, 1.6); box(ctx, -0.2, top + 0.012, 0.09, 0.2, top + 0.014, 0.34); ctx.emissive(null);
  paint(ctx, "oklch(0.3 0 0)"); rod(ctx, [0.32, top + 0.01, 0.2], [0.48, top + 0.01, 0.16], 0.008, 5); // stylus
  // two monitors, stands, the picture on the left one via tail
  paint(ctx, STEEL, 0.35, 0.8);
  for (const x of [-0.5, 0.52]) { cbox(ctx, x, top, -0.22, 0.25, 0.01, 0.18); cbox(ctx, x, top, -0.22, 0.05, 0.4, 0.04); }
  paint(ctx, "oklch(0.12 0 0)", 0.4); box(ctx, -1.02, top + 0.22, -0.28, 0.02, top + 0.85, -0.23); box(ctx, 0.02, top + 0.22, -0.28, 1.06, top + 0.85, -0.23);
  paint(ctx, "oklch(0.22 0.04 250)"); ctx.emissive(0.25, 0.35, 0.6); box(ctx, 0.05, top + 0.25, -0.2805, 1.03, top + 0.82, -0.28); ctx.emissive(null);
  // a mug, a plant
  paint(ctx, "oklch(0.7 0.14 40)", 0.5); cyl(ctx, 0.85, top, 0.2, 0.045, 0.1, 10);
  paint(ctx, "oklch(0.9 0.01 90)", 0.7); cyl(ctx, -0.85, top, 0.2, 0.08, 0.12, 10, 0.07);
  paint(ctx, "oklch(0.55 0.14 145)", 0.8); for (let i = 0; i < 6; i++) { const a = i; rod(ctx, [-0.85, top + 0.1, 0.2], [-0.85 + Math.cos(a) * 0.12, top + 0.3 + (i % 2) * 0.08, 0.2 + Math.sin(a) * 0.12], 0.02, 4); }
  // the stool at +Z
  paint(ctx, STEEL, 0.35, 0.8); cyl(ctx, 0, 0, 0.85, 0.22, 0.03, 12); cyl(ctx, 0, 0.03, 0.85, 0.03, 0.62, 8);
  paint(ctx, "oklch(0.25 0.02 40)", 0.6); cyl(ctx, 0, 0.65, 0.85, 0.2, 0.06, 14);
}
// the supply wall: a steel shelving run with neon paint cans, rolled paper, a 3D printer glowing on the low shelf
function shelf(ctx, p) {
  const W = p.w ?? 3.6, H = 2.2, D = 0.5;
  paint(ctx, STEEL, 0.35, 0.8);
  for (const x of [-W / 2, -W / 6, W / 6, W / 2]) cbox(ctx, x, 0, D / 2, 0.04, H, D);
  for (const y of [0.1, 0.65, 1.2, 1.75]) { paint(ctx, WHITE, 0.5); box(ctx, -W / 2, y, 0, W / 2, y + 0.03, D); }
  const cols = ["oklch(0.7 0.22 350)", "oklch(0.85 0.2 120)", "oklch(0.75 0.16 210)", "oklch(0.82 0.17 80)", "oklch(0.6 0.22 290)", "oklch(0.7 0.19 30)"];
  for (const y of [1.23, 1.78]) for (let i = 0; i < 14; i++) {
    const x = -W / 2 + 0.15 + i * (W - 0.3) / 13, c = cols[(i + (y > 1.5 ? 3 : 0)) % cols.length];
    paint(ctx, ALU, 0.3, 0.8); cyl(ctx, x, y + 0.03, 0.25, 0.075, 0.16, 10);
    paint(ctx, c, 0.4); cyl(ctx, x, y + 0.08, 0.25, 0.077, 0.07, 10);
  }
  for (let i = 0; i < 6; i++) { paint(ctx, i % 2 ? "oklch(0.96 0.01 90)" : "oklch(0.9 0.04 70)", 0.9); rod(ctx, [W / 6 + 0.1, 0.72 + i * 0.08, 0.12 + (i % 3) * 0.1], [W / 2 - 0.1, 0.72 + i * 0.08, 0.12 + (i % 3) * 0.1], 0.04, 8); }
  // the printer: a steel frame cube with a lit print bed and a half-printed vase
  const px = -W / 3; paint(ctx, "oklch(0.2 0.01 250)", 0.4, 0.6);
  for (const [dx, dz] of [[-0.25, 0.05], [0.25, 0.05], [-0.25, 0.45], [0.25, 0.45]]) cbox(ctx, px + dx, 0.13, dz, 0.03, 0.5, 0.03);
  cbox(ctx, px, 0.13, 0.25, 0.55, 0.05, 0.45); cbox(ctx, px, 0.6, 0.25, 0.55, 0.03, 0.45);
  paint(ctx, WHITE); ctx.emissive(1.8, 1.2, 0.5); cbox(ctx, px, 0.18, 0.25, 0.4, 0.005, 0.36); ctx.emissive(null);
  paint(ctx, "oklch(0.7 0.15 190)", 0.3); cyl(ctx, px, 0.185, 0.25, 0.07, 0.18, 14, 0.1);
  paint(ctx, "oklch(0.9 0.02 210)", 0.05); ctx.color("oklch(0.9 0.02 210)", 0.2); box(ctx, px - 0.27, 0.18, 0.02, px + 0.27, 0.6, 0.03);
}
// the lounge: a low modular sofa in charcoal felt, a round rug, facing -Z
function lounge(ctx, p) {
  paint(ctx, "oklch(0.93 0.03 80)", 1); cyl(ctx, 0, 0, -1.2, 1.7, 0.012, 32);
  paint(ctx, "oklch(0.65 0.12 200)", 1); cyl(ctx, 0, 0.001, -1.2, 1.35, 0.012, 32);
  paint(ctx, "oklch(0.38 0.02 250)", 0.95);
  for (const x of [-1.05, 0, 1.05]) { cbox(ctx, x, 0.05, 0, 1.0, 0.36, 0.95); cbox(ctx, x, 0.41, 0.36, 1.0, 0.45, 0.22); }
  cbox(ctx, -1.65, 0.05, 0, 0.2, 0.6, 0.95); cbox(ctx, 1.65, 0.05, 0, 0.2, 0.6, 0.95);
  paint(ctx, STEEL, 0.4, 0.8); box(ctx, -1.75, 0, -0.45, 1.75, 0.05, 0.45);
  const cush = ["oklch(0.75 0.14 60)", "oklch(0.68 0.14 330)", "oklch(0.8 0.1 150)"];
  cush.forEach((c, i) => { paint(ctx, c, 1); cbox(ctx, -1 + i * 1.0, 0.41, 0.2, 0.42, 0.38, 0.12); });
}

// ---- dressing (lived-in lab) ----
const LEAF = ["oklch(0.52 0.13 145)", "oklch(0.62 0.15 135)", "oklch(0.45 0.11 150)"];
// a leaf: a diamond card leaning out from p along dir
function leaf(ctx, p, dir, s) { const up = [0, 1, 0], side = crs(dir, up), sl = Math.hypot(...side) || 1, sd = side.map((v) => v / sl);
  const tip = [p[0] + dir[0] * s, p[1] + dir[1] * s + s * 0.2, p[2] + dir[2] * s], m = [p[0] + dir[0] * s * 0.5, p[1] + dir[1] * s * 0.5 + s * 0.12, p[2] + dir[2] * s * 0.5];
  const a = [m[0] + sd[0] * s * 0.28, m[1], m[2] + sd[2] * s * 0.28], b = [m[0] - sd[0] * s * 0.28, m[1], m[2] - sd[2] * s * 0.28];
  ctx.tri(...p, ...a, ...tip); ctx.tri(...p, ...tip, ...b); ctx.tri(...tip, ...a, ...p); ctx.tri(...b, ...tip, ...p); }
// a braided round rug: concentric coils in alternating wool tones, a hole in the middle for what stands there
function rug(ctx, p) {
  const r0 = p.r0 ?? 0, r1 = p.r1 ?? 2.5, n = 40, cols = p.cols ?? ["oklch(0.72 0.07 60)", "oklch(0.58 0.09 45)", "oklch(0.82 0.04 85)", "oklch(0.5 0.06 150)"];
  let r = r0, i = 0;
  while (r < r1 - 0.01) { const r2 = Math.min(r1, r + 0.11), y = 0.006 + (i % 2) * 0.003; paint(ctx, cols[i % cols.length], 1);
    for (let k = 0; k < n; k++) { const a = k / n * 6.2832, b = (k + 1) / n * 6.2832; Q(ctx, [Math.cos(a) * r, y, Math.sin(a) * r], [Math.cos(b) * r, y, Math.sin(b) * r], [Math.cos(b) * r2, y, Math.sin(b) * r2], [Math.cos(a) * r2, y, Math.sin(a) * r2], [0, 1, 0]); }
    r = r2; i++; }
  paint(ctx, "oklch(0.45 0.06 45)", 1); // the bound edge
  for (let k = 0; k < n; k++) { const a = k / n * 6.2832, b = (k + 1) / n * 6.2832; Q(ctx, [Math.cos(a) * r1, 0, Math.sin(a) * r1], [Math.cos(b) * r1, 0, Math.sin(b) * r1], [Math.cos(b) * r1, 0.012, Math.sin(b) * r1], [Math.cos(a) * r1, 0.012, Math.sin(a) * r1], [Math.cos((a + b) / 2), 0, Math.sin((a + b) / 2)]); }
}
// the planter ring round the tree: walnut boxes on the hex's face centres, ferns, snake plants, a few blooms. Origin = the house centre.
function planters(ctx, p) {
  const r0 = p.r0 ?? 0.85, r1 = p.r1 ?? 1.9, Hh = p.h ?? 0.7, wall = 0.07;
  const V = (r, k, y) => { const a = 60 * k * Math.PI / 180; return [Math.cos(a) * r, y, Math.sin(a) * r]; };
  const bl = ["oklch(0.75 0.16 30)", "oklch(0.9 0.12 95)", "oklch(0.7 0.15 330)", "oklch(0.95 0.02 90)"];
  for (let k = 0; k < 6; k++) {
    const nm = [Math.cos((60 * k + 30) * Math.PI / 180), 0, Math.sin((60 * k + 30) * Math.PI / 180)];
    paint(ctx, WALNUT, 0.55, 0, PLANK);
    Q(ctx, V(r1, k, 0), V(r1, k + 1, 0), V(r1, k + 1, Hh), V(r1, k, Hh), nm); // outer face
    Q(ctx, V(r0, k, 0), V(r0, k + 1, 0), V(r0, k + 1, Hh), V(r0, k, Hh), [-nm[0], 0, -nm[2]]);
    Q(ctx, V(r1, k, Hh), V(r1, k + 1, Hh), V(r1 - wall, k + 1, Hh), V(r1 - wall, k, Hh), [0, 1, 0]); // caps
    Q(ctx, V(r0 + wall, k, Hh), V(r0 + wall, k + 1, Hh), V(r0, k + 1, Hh), V(r0, k, Hh), [0, 1, 0]);
    Q(ctx, V(r1 - wall, k, Hh), V(r1 - wall, k + 1, Hh), V(r1 - wall, k + 1, Hh - 0.08), V(r1 - wall, k, Hh - 0.08), [-nm[0], 0, -nm[2]]);
    paint(ctx, STEEL, 0.4, 0.8); { const q = V(r1 + 0.01, k, 0); cbox(ctx, q[0], 0, q[2], 0.05, Hh + 0.01, 0.05); } // steel corner straps
    paint(ctx, "oklch(0.3 0.04 50)", 1); Q(ctx, V(r0 + wall, k, Hh - 0.08), V(r0 + wall, k + 1, Hh - 0.08), V(r1 - wall, k + 1, Hh - 0.08), V(r1 - wall, k, Hh - 0.08), [0, 1, 0]);
    // planting along this side: two ferns, snake-plant blades, blooms spilling at the lip
    const mid = (f, rr) => { const a = V(rr, k, 0), b = V(rr, k + 1, 0); return [a[0] + (b[0] - a[0]) * f, Hh - 0.08, a[2] + (b[2] - a[2]) * f]; };
    const rm = (r0 + r1) / 2;
    ctx.albedo(null);
    for (const f of [0.28, 0.75]) { const o = mid(f, rm); for (let i = 0; i < 8; i++) { const aa = i / 8 * 6.28 + k, d = [Math.cos(aa) * 0.9, 0.4, Math.sin(aa) * 0.9]; ctx.color(LEAF[i % 3]); leaf(ctx, o, d, 0.4); } }
    { const o = mid(0.5, rm); ctx.color("oklch(0.5 0.1 140)"); for (let i = 0; i < 5; i++) { const aa = i * 1.3 + k, x = o[0] + Math.cos(aa) * 0.06, z = o[2] + Math.sin(aa) * 0.06, h = 0.5 + (i % 3) * 0.15; ctx.tri(x - 0.035, o[1], z, x + 0.035, o[1], z, x + Math.cos(aa) * 0.05, o[1] + h, z + Math.sin(aa) * 0.05); ctx.tri(x + 0.035, o[1], z, x - 0.035, o[1], z, x + Math.cos(aa) * 0.05, o[1] + h, z + Math.sin(aa) * 0.05); } }
    for (let i = 0; i < 4; i++) { const o = mid(0.15 + i * 0.23, r1 - 0.18); paint(ctx, bl[(i + k) % 4], 0.8); cbox(ctx, o[0], o[1] + 0.1 + (i % 2) * 0.05, o[2], 0.07, 0.05, 0.07); }
  }
}
// an industrial rubber mat: ribbed black, hazard-yellow edge
function mat(ctx, p) {
  const W = p.w ?? 2.8, D = p.d ?? 2.2;
  paint(ctx, "oklch(0.8 0.15 90)", 0.7); box(ctx, -W / 2, 0, -D / 2, W / 2, 0.012, D / 2);
  paint(ctx, "oklch(0.2 0.01 250)", 0.9); box(ctx, -W / 2 + 0.06, 0, -D / 2 + 0.06, W / 2 - 0.06, 0.016, D / 2 - 0.06);
  paint(ctx, "oklch(0.26 0.01 250)", 0.85); for (let x = -W / 2 + 0.2; x < W / 2 - 0.15; x += 0.14) box(ctx, x, 0.016, -D / 2 + 0.1, x + 0.05, 0.022, D / 2 - 0.1);
}
// a floor cable track: a low grey ramp, a yellow stripe, running len along -Z
function cable(ctx, p) {
  const L = p.len ?? 3, w = 0.16;
  paint(ctx, "oklch(0.35 0.01 250)", 0.8);
  Q(ctx, [-w / 2, 0, 0], [-w / 4, 0.03, 0], [-w / 4, 0.03, -L], [-w / 2, 0, -L], [-1, 3, 0]);
  Q(ctx, [w / 4, 0.03, 0], [w / 2, 0, 0], [w / 2, 0, -L], [w / 4, 0.03, -L], [1, 3, 0]);
  paint(ctx, "oklch(0.8 0.15 90)", 0.7); Q(ctx, [-w / 4, 0.03, 0], [w / 4, 0.03, 0], [w / 4, 0.03, -L], [-w / 4, 0.03, -L], [0, 1, 0]);
}
// a hanging pothos: a steel cord from the ceiling, a white pot, vines trailing down. Origin = the floor under it.
function pothos(ctx, p) {
  const top = p.top ?? 6.1, y = top - (p.drop ?? 1.8);
  paint(ctx, STEEL, 0.4, 0.8); rod(ctx, [0, y + 0.3, 0], [0, top, 0], 0.008, 4);
  for (let i = 0; i < 3; i++) { const a = i * 2.094; rod(ctx, [Math.cos(a) * 0.14, y + 0.22, Math.sin(a) * 0.14], [0, y + 0.55, 0], 0.005, 3); }
  paint(ctx, WHITE, 0.5); cyl(ctx, 0, y, 0, 0.11, 0.24, 10, 0.16);
  ctx.albedo(null);
  for (let v = 0; v < 7; v++) { const a = v * 0.9 + (p.seed ?? 0), L = 0.6 + ((v * 37) % 10) / 10 * 1.2, segs = Math.round(L / 0.12);
    for (let j = 0; j < segs; j++) { const f = j / segs, r = 0.14 + f * 0.1, x = Math.cos(a + f * 0.6) * r, z = Math.sin(a + f * 0.6) * r, yy = y + 0.22 - f * L;
      ctx.color(LEAF[(v + j) % 3]); leaf(ctx, [x, yy, z], [Math.cos(a + j), -0.3, Math.sin(a + j)], 0.1); } }
}
// a floating wall shelf with props. Back at z = 0, props face -Z. kind: supplies | gadgets | figures | canvases
function floatshelf(ctx, p) {
  const W = p.w ?? 1.0, y = p.y ?? 1.5, kind = p.kind ?? "supplies", D = 0.28;
  paint(ctx, WALNUT, 0.5, 0, PLANK); box(ctx, -W / 2, y - 0.04, -D, W / 2, y, 0);
  paint(ctx, "oklch(0.98 0.02 80)"); ctx.emissive(2.2, 1.7, 1.0); box(ctx, -W / 2 + 0.05, y - 0.046, -D + 0.02, W / 2 - 0.05, y - 0.04, -D + 0.05); ctx.emissive(null);
  const cols = ["oklch(0.7 0.2 25)", "oklch(0.8 0.15 90)", "oklch(0.62 0.13 220)", "oklch(0.6 0.2 300)", "oklch(0.72 0.16 150)"];
  if (kind === "supplies") { // brush jars, stacked sketchbooks, paint tubes
    paint(ctx, "oklch(0.9 0.02 210)", 0.1); cyl(ctx, -W / 2 + 0.15, y, -0.14, 0.05, 0.14, 8);
    paint(ctx, WALNUT, 0.6); for (let i = 0; i < 5; i++) rod(ctx, [-W / 2 + 0.15, y + 0.02, -0.14], [-W / 2 + 0.1 + i * 0.025, y + 0.3, -0.14 + (i % 2) * 0.04], 0.005, 3);
    for (let i = 0; i < 4; i++) { paint(ctx, cols[i], 0.8); cbox(ctx, 0.02, y + i * 0.03, -0.14, 0.3, 0.028, 0.22); }
    for (let i = 0; i < 5; i++) { paint(ctx, cols[(i + 2) % 5], 0.4); cbox(ctx, W / 2 - 0.3 + i * 0.05, y, -0.12, 0.035, 0.12, 0.035); }
  } else if (kind === "gadgets") { // a vr headset, a camera, a little speaker
    paint(ctx, "oklch(0.25 0.01 250)", 0.4); cbox(ctx, -W / 4, y, -0.14, 0.22, 0.1, 0.12); paint(ctx, "oklch(0.6 0.12 220)"); ctx.emissive(0.3, 0.8, 1.6); cbox(ctx, -W / 4, y + 0.03, -0.205, 0.18, 0.04, 0.005); ctx.emissive(null);
    paint(ctx, "oklch(0.2 0 0)", 0.5); cbox(ctx, 0.08, y, -0.14, 0.14, 0.09, 0.08); cyl(ctx, 0.08, y + 0.02, -0.18, 0.035, 0.05, 8);
    paint(ctx, "oklch(0.85 0.02 80)", 0.8); cyl(ctx, W / 2 - 0.15, y, -0.14, 0.07, 0.18, 12);
  } else if (kind === "figures") { // reference figurines: a wooden manikin, a bust, a skull
    paint(ctx, "oklch(0.78 0.07 70)", 0.7); rod(ctx, [-W / 3, y, -0.14], [-W / 3, y + 0.05, -0.14], 0.05, 6); rod(ctx, [-W / 3, y + 0.05, -0.14], [-W / 3, y + 0.2, -0.14], 0.012, 4); rod(ctx, [-W / 3, y + 0.2, -0.14], [-W / 3, y + 0.34, -0.14], 0.03, 6); cyl(ctx, -W / 3, y + 0.35, -0.14, 0.025, 0.05, 6);
    rod(ctx, [-W / 3, y + 0.31, -0.14], [-W / 3 + 0.09, y + 0.24, -0.14], 0.01, 4); rod(ctx, [-W / 3, y + 0.31, -0.14], [-W / 3 - 0.07, y + 0.4, -0.14], 0.01, 4);
    paint(ctx, "oklch(0.95 0.01 90)", 0.8); cbox(ctx, 0, y, -0.14, 0.12, 0.06, 0.12); cyl(ctx, 0, y + 0.06, -0.14, 0.05, 0.12, 8, 0.03); cyl(ctx, 0, y + 0.17, -0.14, 0.065, 0.1, 8, 0.05);
    paint(ctx, "oklch(0.9 0.03 85)", 0.7); cyl(ctx, W / 3, y, -0.14, 0.07, 0.1, 8, 0.08); paint(ctx, "oklch(0.2 0 0)"); cbox(ctx, W / 3 - 0.03, y + 0.05, -0.215, 0.025, 0.025, 0.005); cbox(ctx, W / 3 + 0.03, y + 0.05, -0.215, 0.025, 0.025, 0.005);
  } else { // canvas mockups leaning at the wall
    for (let i = 0; i < 3; i++) { const w = 0.34 - i * 0.06, h = 0.42 - i * 0.07, x = -W / 2 + 0.22 + i * 0.3;
      paint(ctx, "oklch(0.8 0.04 70)", 0.8); box(ctx, x - w / 2, y, -0.06 - i * 0.05, x + w / 2, y + h, -0.03 - i * 0.05);
      paint(ctx, cols[(i * 2) % 5], 0.9); box(ctx, x - w / 2 + 0.02, y + 0.02, -0.064 - i * 0.05, x + w / 2 - 0.02, y + h - 0.02, -0.06 - i * 0.05); }
  }
}
// a pegboard tool wall with hand tools, and hard tool cases stacked under it. Back at z = 0.
function toolrack(ctx, p) {
  const W = p.w ?? 1.4;
  paint(ctx, "oklch(0.75 0.03 70)", 0.9); box(ctx, -W / 2, 0.9, -0.03, W / 2, 2.2, 0);
  paint(ctx, "oklch(0.4 0.03 60)", 1); for (let x = -W / 2 + 0.08; x < W / 2; x += 0.1) for (let y = 0.98; y < 2.15; y += 0.1) box(ctx, x - 0.006, y - 0.006, -0.031, x + 0.006, y + 0.006, -0.03);
  const tools = [["oklch(0.7 0.17 50)", 0.3], ["oklch(0.3 0 0)", 0.22], ["oklch(0.6 0.2 25)", 0.26], ["oklch(0.55 0.13 250)", 0.34], ["oklch(0.8 0.15 90)", 0.2]];
  tools.forEach(([c, h], i) => { const x = -W / 2 + 0.2 + i * (W - 0.4) / 4; paint(ctx, ALU, 0.3, 0.9); cbox(ctx, x, 1.55, -0.05, 0.02, h, 0.015); paint(ctx, c, 0.5); cbox(ctx, x, 1.55 + h, -0.05, 0.05, 0.12, 0.03); });
  paint(ctx, "oklch(0.3 0.01 250)", 0.5); rod(ctx, [-W / 2 + 0.15, 1.2, -0.06], [W / 2 - 0.15, 1.2, -0.06], 0.012, 4);
  for (let i = 0; i < 6; i++) { paint(ctx, ["oklch(0.5 0.12 150)", "oklch(0.7 0.17 50)", "oklch(0.3 0.01 250)"][i % 3], 0.5); cbox(ctx, -W / 2 + 0.15 + i * 0.2, 1.08, -0.06, 0.03, 0.12, 0.03); }
  // cases
  const cs = [["oklch(0.7 0.17 50)", 0.6, 0.22], ["oklch(0.25 0.01 250)", 0.55, 0.26], ["oklch(0.8 0.15 90)", 0.45, 0.2]]; let y = 0;
  for (const [c, w, h] of cs) { paint(ctx, c, 0.45); cbox(ctx, -0.1, y, -0.25, w, h, 0.4); paint(ctx, ALU, 0.3, 0.9); cbox(ctx, -0.1, y + h * 0.55, -0.455, 0.12, 0.03, 0.02); y += h; }
}
// a low storage bench / bookcase to tuck under the stair: cubbies with books, bins, a cushion on top. Back at z = 0.
function bench(ctx, p) {
  const W = p.w ?? 2.4, Hh = 0.6, D = 0.42, n = Math.round(W / 0.6);
  paint(ctx, WALNUT, 0.5, 0, PLANK); box(ctx, -W / 2, Hh - 0.04, -D, W / 2, Hh, 0); box(ctx, -W / 2, 0, -D, W / 2, 0.06, 0); box(ctx, -W / 2, 0, -0.03, W / 2, Hh, 0);
  for (let i = 0; i <= n; i++) { const x = -W / 2 + i * W / n; box(ctx, x - 0.02, 0, -D, x + 0.02, Hh, 0); }
  const cols = ["oklch(0.6 0.15 25)", "oklch(0.55 0.1 250)", "oklch(0.75 0.12 90)", "oklch(0.5 0.1 150)", "oklch(0.85 0.03 80)"];
  for (let i = 0; i < n; i++) { const x0 = -W / 2 + i * W / n + 0.04, w = W / n - 0.08;
    if (i % 2) { paint(ctx, "oklch(0.8 0.04 80)", 1); cbox(ctx, x0 + w / 2, 0.06, -D / 2, w - 0.04, 0.44, D - 0.06); paint(ctx, WALNUT, 0.6); cbox(ctx, x0 + w / 2, 0.36, -D + 0.02, 0.12, 0.04, 0.02); }
    else { let x = x0 + 0.01; let j = 0; while (x < x0 + w - 0.05) { const bw = 0.035 + (j % 3) * 0.012, bh = 0.3 + ((j * 7) % 4) * 0.035; paint(ctx, cols[(i + j) % 5], 0.8); box(ctx, x, 0.06, -D + 0.04, x + bw, 0.06 + bh, -0.05); x += bw + 0.004; j++; } }
  }
  paint(ctx, "oklch(0.55 0.08 40)", 1); box(ctx, -W / 2 + 0.05, Hh, -D + 0.02, W / 2 - 0.05, Hh + 0.07, -0.02);
}
// the paint corner under the front easel: a drop cloth with folds and splatter, paint cans, a palette on a stool. Origin = the easel's feet.
function paintcorner(ctx, p) {
  paint(ctx, "oklch(0.9 0.03 85)", 1); const R = 1.4;
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.28, b = (k + 1) / 10 * 6.28, ra = R * (0.85 + (k % 3) * 0.08), rb = R * (0.85 + ((k + 1) % 3) * 0.08); ctx.tri(0, 0.008, 0.2, Math.cos(b) * rb, 0.008 + (k % 2) * 0.02, 0.2 + Math.sin(b) * rb, Math.cos(a) * ra, 0.008 + ((k + 1) % 2) * 0.02, 0.2 + Math.sin(a) * ra); }
  const sp = ["oklch(0.65 0.2 25)", "oklch(0.8 0.15 90)", "oklch(0.6 0.12 200)", "oklch(0.55 0.2 300)"];
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.3 + (i % 5) * 0.2, s = 0.04 + (i % 3) * 0.03; paint(ctx, sp[i % 4], 0.9); cbox(ctx, Math.cos(a) * r, 0.03, 0.2 + Math.sin(a) * r, s, 0.003, s * 1.3); }
  for (let i = 0; i < 4; i++) { const x = -0.9 + i * 0.22, z = 0.75 + (i % 2) * 0.18; paint(ctx, ALU, 0.3, 0.8); cyl(ctx, x, 0.02, z, 0.09, 0.18, 10); paint(ctx, sp[i], 0.5); cyl(ctx, x, 0.2, z, 0.085, 0.005, 10); }
  paint(ctx, WALNUT, 0.5); cyl(ctx, 0.85, 0, 0.55, 0.16, 0.02, 8); for (const a of [0, 2.1, 4.2]) rod(ctx, [0.85 + Math.cos(a) * 0.14, 0, 0.55 + Math.sin(a) * 0.14], [0.85 + Math.cos(a) * 0.1, 0.6, 0.55 + Math.sin(a) * 0.1], 0.015, 4);
  cyl(ctx, 0.85, 0.6, 0.55, 0.17, 0.04, 12);
  paint(ctx, "oklch(0.75 0.08 70)", 0.6); cyl(ctx, 0.85, 0.64, 0.55, 0.15, 0.012, 12);
  for (let i = 0; i < 6; i++) { const a = i; paint(ctx, sp[i % 4], 0.7); cyl(ctx, 0.85 + Math.cos(a) * 0.09, 0.652, 0.55 + Math.sin(a) * 0.09, 0.022, 0.008, 6); }
}
// a warm arc lamp: marble foot, a steel arc, a brass shade glowing. The shade hangs at -Z.
function arclamp(ctx) {
  paint(ctx, "oklch(0.93 0.01 90)", 0.2); cyl(ctx, 0, 0, 0, 0.2, 0.12, 12);
  paint(ctx, STEEL, 0.3, 0.9); let prev = [0, 0.12, 0]; for (let i = 1; i <= 8; i++) { const a = i / 8 * Math.PI * 0.62, q = [0, 0.12 + Math.sin(a) * 1.9, -(1 - Math.cos(a)) * 1.45]; rod(ctx, prev, q, 0.018, 6); prev = q; }
  paint(ctx, "oklch(0.72 0.12 80)", 0.3, 0.9); cyl(ctx, prev[0], prev[1] - 0.35, prev[2], 0.26, 0.28, 14, 0.06);
  paint(ctx, "oklch(0.98 0.05 85)"); ctx.emissive(4, 2.8, 1.4); cyl(ctx, prev[0], prev[1] - 0.34, prev[2], 0.22, 0.01, 14);
}
// neon art: a glowing brush-stroke squiggle and a heart, on a clear backer. Back at z = 0.
function neon(ctx, p) {
  const s = p.s ?? 1.6, y0 = p.y ?? 0; paint(ctx, "oklch(0.9 0.02 210)", 0.1); ctx.color("oklch(0.9 0.02 210)", 0.18); box(ctx, -s * 0.6, y0 - 0.1, -0.02, s * 0.6, y0 + s * 0.5, 0);
  const col = [["oklch(0.8 0.18 350)", [3.4, 0.7, 2.2]], ["oklch(0.85 0.14 200)", [0.5, 2.4, 3.4]], ["oklch(0.9 0.15 80)", [3.4, 2.4, 0.6]]];
  for (let l = 0; l < 3; l++) { const [c, e] = col[l]; ctx.albedo(null); ctx.color(c); ctx.emissive(...e); let prev = null;
    for (let i = 0; i <= 18; i++) { const f = i / 18, q = [(-0.5 + f) * s, y0 + s * 0.2 + Math.sin(f * 9 + l * 1.7) * s * 0.1 * (1 + l * 0.3) + l * 0.06, -0.05]; if (prev) rod(ctx, prev, q, 0.013, 4); prev = q; } }
  ctx.emissive(null);
}
// a slatted walnut partition on a steel foot: it zones the desk from the lounge
function partition(ctx, p) {
  const W = p.w ?? 1.8, Hh = 2.0; paint(ctx, STEEL, 0.35, 0.8); box(ctx, -W / 2, 0, -0.2, W / 2, 0.05, 0.2);
  paint(ctx, WALNUT, 0.5, 0, PLANK); for (let x = -W / 2 + 0.04; x < W / 2; x += 0.11) box(ctx, x - 0.03, 0.05, -0.03, x + 0.03, Hh, 0.03);
  paint(ctx, STEEL, 0.35, 0.8); box(ctx, -W / 2, Hh, -0.035, W / 2, Hh + 0.03, 0.035);
  ctx.albedo(null); ctx.color(LEAF[1]); for (let i = 0; i < 10; i++) leaf(ctx, [-W / 2 + 0.1 + i * 0.17, Hh + 0.03, 0], [0.2, -0.8, (i % 2 ? 1 : -1) * 0.4], 0.14);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params ?? {}, item = p.item;
  ctx.flat();
  const fn = { shell, screenwall, easel, frame, robotarm, holo, desk, shelf, lounge, rug, planters, mat, cable, pothos, floatshelf, toolrack, bench, paintcorner, arclamp, neon, partition }[item];
  if (!fn) return;
  fn(ctx, p);
});
export function collider(ctx) {
  const item = ctx.params?.item, p2w = () => ctx.params?.w ?? 2.4;
  if (item === "planters") { const r1 = ctx.params?.r1 ?? 1.9, H = ctx.params?.h ?? 0.7; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, b = (k + 1) * Math.PI / 3, m = a + Math.PI / 6; Q(ctx, [Math.cos(a) * r1, 0, Math.sin(a) * r1], [Math.cos(b) * r1, 0, Math.sin(b) * r1], [Math.cos(b) * r1, H, Math.sin(b) * r1], [Math.cos(a) * r1, H, Math.sin(a) * r1], [Math.cos(m), 0, Math.sin(m)]); T(ctx, [0, H, 0], [Math.cos(a) * r1, H, Math.sin(a) * r1], [Math.cos(b) * r1, H, Math.sin(b) * r1], [0, 1, 0]); } return; }
  if (item === "shell") {
    // the root bench is a seat you can step onto
    const hex = (ap, k) => { const a = (60 * k) * Math.PI / 180, r = ap / Math.cos(Math.PI / 6); return [Math.cos(a) * r, Math.sin(a) * r]; };
    for (let k = 0; k < 6; k++) { const a = hex(1.78, k), b = hex(1.78, k + 1), c = hex(2.38, k + 1), d = hex(2.38, k); Q(ctx, [a[0], 0.45, a[1]], [b[0], 0.45, b[1]], [c[0], 0.45, c[1]], [d[0], 0.45, d[1]], [0, 1, 0]); Q(ctx, [d[0], 0, d[1]], [c[0], 0, c[1]], [c[0], 0.45, c[1]], [d[0], 0.45, d[1]], [c[0] + d[0], 0, c[1] + d[1]]); }
    return;
  }
  const B = { robotarm: [0.9, 0.5, 0.9, 0, 0], holo: [1.1, 0.62, 1.1, 0, 0], desk: [2.2, 0.95, 0.8, 0, 0], shelf: [3.6, 2.2, 0.5, 0, 0.25], lounge: [3.5, 0.5, 0.95, 0, 0], easel: [1.0, 1.2, 0.6, 0, 0.3], toolrack: [0.65, 0.68, 0.42, -0.1, -0.25], bench: [p2w(), 0.6, 0.42, 0, -0.21], partition: [1.8, 2.0, 0.1, 0, 0], arclamp: [0.4, 0.12, 0.4, 0, 0] }[item];
  if (!B) return null;
  const [w, h, d, ox, oz] = B; box(ctx, ox - w / 2, 0, oz - d / 2, ox + w / 2, h, oz + d / 2);
}
