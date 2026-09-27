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
  for (const [y, ap, h, d, e] of [[H - 0.28, AI - 0.02, 0.05, 0.14, [2.2, 2.6, 3.0]], [0.02, AI - 0.02, 0.03, 0.05, [0.9, 2.2, 2.6]]]) {
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
        paint(ctx, "oklch(0.98 0.02 90)"); ctx.emissive(4, 3.7, 3.1); cyl(ctx, x, H - 0.53, z, 0.055, 0.012, 10);
      }
    }
  }
  ctx.emissive(null);
  // the root bench: a hexagon of walnut round the trunk, a cool light spilling under its lip
  const R0 = 1.05, R1 = 1.75, y = 0.45;
  for (let k = 0; k < 6; k++) {
    const a0 = hex(R0 * Math.cos(Math.PI / 6), k), a1 = hex(R0 * Math.cos(Math.PI / 6), k + 1), b0 = hex(R1 * Math.cos(Math.PI / 6), k), b1 = hex(R1 * Math.cos(Math.PI / 6), k + 1);
    paint(ctx, WALNUT, 0.45, 0, PLANK);
    Q(ctx, [a0[0], y, a0[1]], [a1[0], y, a1[1]], [b1[0], y, b1[1]], [b0[0], y, b0[1]], [0, 1, 0]);
    Q(ctx, [b0[0], y - 0.08, b0[1]], [b1[0], y - 0.08, b1[1]], [b1[0], y, b1[1]], [b0[0], y, b0[1]], [b0[0] + b1[0], 0, b0[1] + b1[1]]);
    paint(ctx, "oklch(0.25 0.01 250)", 0.5);
    const c0 = hex((R1 - 0.12) * Math.cos(Math.PI / 6), k), c1 = hex((R1 - 0.12) * Math.cos(Math.PI / 6), k + 1);
    Q(ctx, [c0[0], 0, c0[1]], [c1[0], 0, c1[1]], [c1[0], y - 0.08, c1[1]], [c0[0], y - 0.08, c0[1]], [c0[0] + c1[0], 0, c0[1] + c1[1]]);
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
export function geometry(ctx) {
  const p = ctx.params ?? {}, item = p.item;
  ctx.flat();
  const fn = { shell, screenwall, easel, frame, robotarm, holo, desk, shelf, lounge }[item];
  if (!fn) return;
  fn(ctx, p);
}
export function collider(ctx) {
  const item = ctx.params?.item;
  if (item === "shell") {
    // the root bench is a seat you can step onto
    const hex = (ap, k) => { const a = (60 * k) * Math.PI / 180, r = ap / Math.cos(Math.PI / 6); return [Math.cos(a) * r, Math.sin(a) * r]; };
    for (let k = 0; k < 6; k++) { const a = hex(0.9, k), b = hex(0.9, k + 1), c = hex(1.52, k + 1), d = hex(1.52, k); Q(ctx, [a[0], 0.45, a[1]], [b[0], 0.45, b[1]], [c[0], 0.45, c[1]], [d[0], 0.45, d[1]], [0, 1, 0]); Q(ctx, [d[0], 0, d[1]], [c[0], 0, c[1]], [c[0], 0.45, c[1]], [d[0], 0.45, d[1]], [c[0] + d[0], 0, c[1] + d[1]]); }
    return;
  }
  const B = { robotarm: [0.9, 0.5, 0.9, 0, 0], holo: [1.1, 0.62, 1.1, 0, 0], desk: [2.2, 0.95, 0.8, 0, 0], shelf: [3.6, 2.2, 0.5, 0, 0.25], lounge: [3.5, 0.5, 0.95, 0, 0], easel: [1.0, 1.2, 0.6, 0, 0.3] }[item];
  if (!B) return null;
  const [w, h, d, ox, oz] = B; box(ctx, ox - w / 2, 0, oz - d / 2, ox + w / 2, h, oz + d / 2);
}
