// A timber-framed town house or shop: feet at ground, front (door, shop window) toward −Z, metres.
// params: w, d, floors, roof { kind: gx|gz|hip|salt, pitch°, tex, tint }, plaster, trim, base: stone|plaster,
// awning (colour) | null, sign: bakery|tavern|apothecary|tailor|cheese|smith|key|lantern|books|null, chimney [x, z] (auto when absent),
// shop: bool, eave (m, 0.75), dormers (count), vane: rooster|fish|dragon, vaneAt (−1..1 along ridge), barrels (±n: side and count), boxes: false.
import { TAU, COL, FLOWERS, paint, XF, solid, box, obox, beam, blob, prism, ngon, slab, win, timber, lantern, lathe } from '../lib/town-kit.js';
const GF = 3.3, UF = 2.8, JET = 0.4;
function dims(p) {
  const f = p.floors || 2, fl = [];
  let y = 0;
  for (let k = 0; k < f; k++) { const h = k ? UF : GF; fl.push({ y, h, zf: -p.d / 2 - (k ? JET * k : 0), hw: p.w / 2 + (k ? 0.12 * k : 0) }); y += h; }
  return { fl, H: y };
}
export function geometry(ctx) {
  const p = { w: 9, d: 9, floors: 2, plaster: 'oklch(0.96 0.045 88)', trim: 'oklch(0.62 0.08 195)', base: 'plaster', roof: { kind: 'gx', pitch: 40, tex: 'clay', tint: 'oklch(0.95 0.03 45)' }, ...ctx.params };
  const lod = ctx.lod || 1, P = ctx, { fl, H } = dims(p), bz = p.d / 2, rnd = () => ctx.random();
  // plinth + floors
  paint(ctx, 'ashlar', COL.lime, 0.9); box(P, -p.w / 2 - 0.1, -0.8, -p.d / 2 - 0.1, p.w / 2 + 0.1, 0.35, bz + 0.1);
  fl.forEach((f, k) => {
    if (k === 0 && p.base === 'stone') paint(ctx, 'ashlar', COL.lime, 0.9); else paint(ctx, 'plaster', p.plaster, 0.92);
    box(P, -f.hw, f.y + (k ? 0 : 0.35), f.zf, f.hw, f.y + f.h, bz);
    if (k && lod <= 3) { paint(ctx, 'walnut', COL.walnut, 0.85); const n = Math.round(p.w / 0.9); for (let i = 0; i <= n; i++) obox(P, -f.hw + 0.1 + i * (2 * f.hw - 0.2) / n, f.y - 0.18, fl[k - 1].zf - 0.0 + (f.zf - fl[k - 1].zf) / 2 - 0.05, 0.14, 0.18, Math.abs(f.zf - fl[k - 1].zf) + 0.22); }
  });
  // faces: front / sides / back, windows and framing
  const doorX = p.doorX ?? (p.shop ? -p.w / 2 + 1.6 : 0);
  fl.forEach((f, k) => {
    const framed = !(k === 0 && p.base === 'stone');
    const faces = [
      { F: XF(P, 0, 0, f.zf, 0), L: f.hw, front: true },
      { F: XF(P, -f.hw, 0, (f.zf + bz) / 2, Math.PI / 2), L: (bz - f.zf) / 2 },
      { F: XF(P, f.hw, 0, (f.zf + bz) / 2, -Math.PI / 2), L: (bz - f.zf) / 2 },
      { F: XF(P, 0, 0, bz, Math.PI), L: f.hw, back: true },
    ];
    for (const fc of faces) {
      if (fc.back && lod > 2) continue;
      const cuts = [], y0 = f.y + (k ? 0.95 : 1.0), wh = k ? 1.3 : 1.5;
      if (k === 0 && fc.front) {
        // door
        cuts.push([doorX, 0.7]);
        paint(ctx, 'oak', 'oklch(0.72 0.07 60)', 0.8); fc.F.quad(doorX - 0.6, 0.35, -0.04, doorX - 0.6, 2.55, -0.04, doorX + 0.6, 2.55, -0.04, doorX + 0.6, 0.35, -0.04);
        paint(ctx, 'oak', p.trim, 0.8); obox(fc.F, doorX - 0.68, 0.35, -0.07, 0.14, 2.3, 0.14); obox(fc.F, doorX + 0.68, 0.35, -0.07, 0.14, 2.3, 0.14); obox(fc.F, doorX, 2.55, -0.08, 1.6, 0.18, 0.16);
        if (lod <= 2) { paint(ctx, null, 'oklch(0.75 0.1 85)', 0.3, 0.8); obox(fc.F, doorX + 0.38, 1.3, -0.1, 0.08, 0.08, 0.08); paint(ctx, null, COL.glass, 0.15, 0, COL.glow); fc.F.quad(doorX - 0.4, 2.0, -0.05, doorX - 0.4, 2.4, -0.05, doorX + 0.4, 2.4, -0.05, doorX + 0.4, 2.0, -0.05); }
        stoop(ctx, fc.F, doorX, lod);
        // shop window or windows
        const free = [[-fc.L + 0.5, doorX - 1.0], [doorX + 1.0, fc.L - 0.5]];
        for (const [a, b] of free) {
          const span = b - a; if (span < 1.2) continue;
          if (p.shop && span > 3) { const wx = (a + b) / 2, ww = Math.min(span - 0.6, 4.2); win(ctx, fc.F, wx, 0.85, ww, 1.75, { panes: 4, frame: p.trim }); cuts.push([wx, ww / 2]); }
          else { const n = Math.max(1, Math.floor(span / 2.3)); for (let i = 0; i < n; i++) { const wx = a + (i + 0.5) * span / n; win(ctx, fc.F, wx, y0, 1.0, wh, { frame: p.trim, shutter: k === 0 ? p.trim : null, box: p.boxes !== false, flowers: FLOWERS.slice((i + (p.seed || 0)) % 4) }); cuts.push([wx, 0.5]); } }
        }
      } else {
        const span = 2 * fc.L - 1.2, n = Math.max(1, Math.floor(span / (fc.front ? 2.2 : 3.2)));
        if (lod <= 3 || fc.front) for (let i = 0; i < n; i++) {
          const wx = -fc.L + 0.6 + (i + 0.5) * span / n;
          win(ctx, fc.F, wx, y0, fc.front ? 1.05 : 0.9, wh, { frame: p.trim, box: p.boxes !== false && fc.front && (k === 1 || (i + k + (p.seed || 0)) % 2 === 0), flowers: FLOWERS.slice((k + i + (p.seed || 0)) % 4), shutter: fc.front && k === 1 ? p.trim : null });
          cuts.push([wx, 0.5]);
        }
      }
      if (framed) timber(ctx, fc.F, fc.L, f.y + (k ? 0 : 0.35), f.h - (k ? 0 : 0.35), cuts, lod);
    }
  });
  roof(ctx, p, fl, H, bz, lod);
  // awning over the shop front
  if (p.awning && lod <= 4) {
    const z0 = fl[0].zf, y1 = GF - 0.3, y2 = 2.45, ext = 1.7, x0 = -p.w / 2 + 0.3, x1 = p.w / 2 - 0.3, n = lod <= 2 ? Math.round((x1 - x0) / 0.5) : 1;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * (x1 - x0) / n, b = x0 + (i + 1) * (x1 - x0) / n;
      paint(ctx, 'linen', i % 2 ? 'oklch(0.96 0.02 85)' : p.awning, 0.95);
      slab(P, [a, y1, z0], [b, y1, z0], [b, y2, z0 - ext], [a, y2, z0 - ext], 0.04);
      if (lod <= 2) { P.quad(a, y2, z0 - ext, b, y2, z0 - ext, b, y2 - 0.3, z0 - ext, a, y2 - 0.3, z0 - ext); P.tri(a, y2 - 0.3, z0 - ext, (a + b) / 2, y2 - 0.42, z0 - ext, b, y2 - 0.3, z0 - ext); }
    }
    paint(ctx, null, COL.iron, 0.5, 0.6); for (const x of [x0, x1]) beam(P, [x, y2 + 0.8, z0], [x, y2, z0 - ext], 0.04, 0.04);
  }
  // hanging sign on a wrought-iron bracket, the shop's emblem cut as the board itself
  if (p.sign && lod <= 3) hangSign(ctx, P, p, fl, doorX, lod);
  // barrels by the door
  if (p.barrels && lod <= 3) barrels(ctx, P, p, fl[0].zf, doorX, lod);
  if (p.lamp && lod <= 3) { paint(ctx, null, COL.iron, 0.5, 0.6); const lx = doorX + (doorX < 0 ? 1.0 : -1.0); beam(P, [lx, 2.9, fl[0].zf], [lx, 2.9, fl[0].zf - 0.45], 0.04, 0.04); lantern(ctx, P, lx, 2.9, fl[0].zf - 0.45, 0.9); }
}
// ── porch stoop: a landing and one step, oak treads with walnut nosings (risers 0.175 m) ──
function stoop(ctx, F, x, lod) {
  paint(ctx, 'oak', 'oklch(0.86 0.06 65)', 0.85);
  obox(F, x, 0, -0.4, 1.8, 0.35, 0.6); obox(F, x, 0, -0.86, 1.8, 0.175, 0.32);
  if (lod <= 2) {
    paint(ctx, 'walnut', COL.walnut, 0.85);
    obox(F, x, 0.33, -0.7, 1.84, 0.04, 0.05); obox(F, x, 0.155, -1.02, 1.84, 0.04, 0.05);
    for (const s of [-1, 1]) { obox(F, x + s * 0.86, 0, -0.95, 0.1, 1.2, 0.1); beam(F, [x + s * 0.86, 1.15, -0.95], [x + s * 0.86, 1.2, -0.12], 0.07, 0.07); }
  }
}
function barrels(ctx, P, p, zf, doorX, lod) {
  const sd = Math.sign(p.barrels) || 1, n = Math.min(4, Math.abs(p.barrels)), bx = doorX + sd * 1.75;
  const spots = [[0, -0.55, 1], [0.72, -0.5, 0.88], [0.34, -1.15, 0.8], [1.2, -1.05, 0]];
  for (let i = 0; i < n; i++) {
    const [dx, dz, s] = spots[i], x = bx + sd * dx, z = zf + dz;
    if (!s) { paint(ctx, 'oak', 'oklch(0.8 0.06 65)', 0.85); obox(P, x, 0, z, 0.6, 0.55, 0.6, 0.3); continue; }
    const r = 0.36 * s, h = 0.95 * s, seg = lod <= 2 ? 10 : 6;
    paint(ctx, 'oak', 'oklch(0.78 0.07 55)', 0.85); lathe(P, [[r * 0.84, 0], [r, h * 0.3], [r * 1.02, h * 0.5], [r, h * 0.7], [r * 0.84, h], [0, h]], seg, x, 0, z);
    if (lod <= 2) { paint(ctx, null, COL.iron, 0.5, 0.6); for (const t of [0.12, 0.88]) lathe(P, [[r * (t < 0.5 ? 0.9 : 0.9) + 0.012, h * t - 0.03], [r * 0.91 + 0.012, h * t + 0.03]], seg, x, 0, z); }
  }
}
// ── emblems: flat plates in the sign's frame (u out from the wall, v up) ──
const E = (cx, cy, rx, ry, n = 10, a0 = 0, a1 = TAU) => { const out = []; const full = a1 - a0 >= TAU - 1e-6; if (!full) out.push([cx, cy]); const m = full ? n : n + 1; for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return out; };
const BAR = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };
function plate(F, pts, t, cu = 0, cv = 0, sc = 1) { solid(F, pts.map(([u, v]) => [cu + u * sc, cv + v * sc, -t / 2]), pts.map(([u, v]) => [cu + u * sc, cv + v * sc, t / 2])); }
const EMBLEMS = {
  bakery: [['oklch(0.74 0.12 68)', E(0, 0, 0.44, 0.21, 12), 0.07], ['oklch(0.6 0.12 52)', BAR([-0.24, -0.1], [-0.14, 0.12], 0.05), 0.1], ['oklch(0.6 0.12 52)', BAR([-0.04, -0.12], [0.06, 0.13], 0.05), 0.1], ['oklch(0.6 0.12 52)', BAR([0.16, -0.1], [0.26, 0.12], 0.05), 0.1]],
  apothecary: [['oklch(0.58 0.12 160)', E(0, -0.12, 0.27, 0.27, 12), 0.07], ['oklch(0.82 0.06 180)', [[-0.07, 0.1], [0.07, 0.1], [0.07, 0.3], [-0.07, 0.3]], 0.07], ['oklch(0.55 0.08 55)', [[-0.1, 0.3], [0.1, 0.3], [0.08, 0.42], [-0.08, 0.42]], 0.08], ['oklch(0.8 0.1 150)', E(-0.1, -0.06, 0.06, 0.11, 8), 0.1], ['oklch(0.8 0.12 85)', [[-0.2, -0.12], [0.2, -0.12], [0.2, -0.06], [-0.2, -0.06]], 0.09]],
  tailor: [['oklch(0.62 0.15 25)', [[-0.18, -0.25], [0.18, -0.25], [0.14, 0.2], [-0.14, 0.2]], 0.07], ['oklch(0.62 0.07 60)', [[-0.26, 0.2], [0.26, 0.2], [0.26, 0.3], [-0.26, 0.3]], 0.09], ['oklch(0.62 0.07 60)', [[-0.26, -0.35], [0.26, -0.35], [0.26, -0.25], [-0.26, -0.25]], 0.09], ['oklch(0.78 0.03 250)', BAR([-0.38, 0.38], [0.36, -0.3], 0.06), 0.12], ['oklch(0.78 0.03 250)', BAR([0.36, 0.38], [-0.36, -0.3], 0.06), 0.12], ['oklch(0.35 0.02 250)', E(-0.4, -0.36, 0.08, 0.08, 8), 0.12], ['oklch(0.35 0.02 250)', E(0.4, -0.36, 0.08, 0.08, 8), 0.12]],
  cheese: [['oklch(0.84 0.13 88)', E(0, 0, 0.38, 0.38, 14, 0.55, TAU - 0.55), 0.08], ['oklch(0.9 0.11 92)', [[0.14, 0.02], [0.52, 0.18], [0.52, -0.14]], 0.08], ['oklch(0.64 0.11 70)', E(-0.14, 0.12, 0.06, 0.06, 6), 0.11], ['oklch(0.64 0.11 70)', E(-0.06, -0.18, 0.05, 0.05, 6), 0.11], ['oklch(0.64 0.11 70)', E(-0.24, -0.06, 0.04, 0.04, 6), 0.11], ['oklch(0.62 0.13 30)', E(0, 0, 0.1, 0.1, 6, 0.55, TAU - 0.55).slice(0, 1).concat([[-0.38, 0.1], [-0.4, -0.1]]), 0.001]],
  tavern: [['oklch(0.8 0.13 80)', [[-0.22, -0.36], [0.18, -0.36], [0.16, 0.2], [-0.2, 0.2]], 0.08], ['oklch(0.98 0.01 90)', E(-0.02, 0.24, 0.25, 0.1, 10), 0.09], ['oklch(0.45 0.05 60)', BAR([0.16, 0.1], [0.34, 0.08], 0.07), 0.07], ['oklch(0.45 0.05 60)', BAR([0.34, 0.1], [0.34, -0.22], 0.07), 0.07], ['oklch(0.45 0.05 60)', BAR([0.34, -0.2], [0.16, -0.24], 0.07), 0.07], ['oklch(0.55 0.06 60)', [[-0.23, -0.26], [0.19, -0.26], [0.19, -0.2], [-0.23, -0.2]], 0.11], ['oklch(0.55 0.06 60)', [[-0.22, 0.04], [0.18, 0.04], [0.18, 0.1], [-0.22, 0.1]], 0.11]],
  smith: [['oklch(0.34 0.02 250)', [[-0.3, 0.08], [0.32, 0.08], [0.32, 0.22], [-0.3, 0.22]], 0.09], ['oklch(0.34 0.02 250)', [[-0.3, 0.22], [-0.3, 0.08], [-0.56, 0.18]], 0.09], ['oklch(0.34 0.02 250)', [[-0.12, -0.2], [0.14, -0.2], [0.1, 0.08], [-0.08, 0.08]], 0.09], ['oklch(0.34 0.02 250)', [[-0.3, -0.36], [0.32, -0.36], [0.2, -0.2], [-0.18, -0.2]], 0.09], ['oklch(0.55 0.07 60)', BAR([0.05, 0.3], [0.38, 0.52], 0.05), 0.09], ['oklch(0.45 0.02 250)', BAR([0.3, 0.6], [0.44, 0.4], 0.12), 0.1], ['oklch(0.85 0.16 70)', [[-0.1, 0.32], [-0.04, 0.44], [0.02, 0.32]], 0.1]],
  key: [['oklch(0.76 0.12 82)', E(-0.25, 0, 0.16, 0.16, 12), 0.07], ['oklch(0.76 0.12 82)', BAR([-0.12, 0], [0.4, 0], 0.08), 0.07], ['oklch(0.76 0.12 82)', [[0.24, -0.02], [0.3, -0.02], [0.3, -0.18], [0.24, -0.18]], 0.07], ['oklch(0.76 0.12 82)', [[0.34, -0.02], [0.4, -0.02], [0.4, -0.13], [0.34, -0.13]], 0.07], ['oklch(0.4 0.05 60)', E(-0.25, 0, 0.07, 0.07, 8), 0.1]],
  books: [['oklch(0.55 0.12 25)', [[-0.3, -0.3], [-0.12, -0.3], [-0.12, 0.3], [-0.3, 0.3]], 0.07], ['oklch(0.58 0.09 150)', [[-0.1, -0.3], [0.08, -0.3], [0.08, 0.26], [-0.1, 0.26]], 0.07], ['oklch(0.6 0.1 250)', [[0.1, -0.3], [0.28, -0.3], [0.36, 0.2], [0.18, 0.22]], 0.07]],
};
function hangSign(ctx, P, p, fl, doorX, lod) {
  const sx = doorX + (doorX < 0 ? -1.3 : 1.3), sy = GF + 0.9, z0 = fl[1] ? fl[1].zf : fl[0].zf, S = XF(P, sx, 0, z0, Math.PI / 2);
  paint(ctx, null, COL.iron, 0.5, 0.6);
  obox(S, 0.03, sy - 0.62, 0, 0.06, 0.78, 0.16);
  beam(S, [0, sy, 0], [1.38, sy, 0], 0.06, 0.06); beam(S, [0, sy - 0.55, 0], [0.82, sy - 0.02, 0], 0.04, 0.04);
  if (lod <= 2) {
    const n = 9; let prev = null;
    for (let i = 0; i <= n; i++) { const a = -Math.PI * 0.2 + i / n * Math.PI * 1.6, r = 0.16 - i * 0.008, q = [0.36 + Math.cos(a) * r, sy - 0.2 + Math.sin(a) * r, 0]; if (prev) beam(S, prev, q, 0.03, 0.03); prev = q; }
    beam(S, [1.38, sy, 0], [1.5, sy + 0.1, 0], 0.035, 0.035); lathe(S, [[0, 0], [0.05, 0.03], [0.05, 0.06], [0, 0.12]], 6, 1.52, sy + 0.08, 0);
  }
  if (p.sign === 'lantern') { beam(S, [1.05, sy, 0], [1.05, sy - 0.2, 0], 0.02, 0.02); lantern(ctx, S, 1.05, sy - 0.2, 0, 1.2); return; }
  for (const u of [0.38, 1.12]) beam(S, [u, sy, 0], [u, sy - 0.3, 0], 0.02, 0.02);
  paint(ctx, 'oak', 'oklch(0.8 0.06 65)', 0.8); obox(S, 0.75, sy - 0.38, 0, 0.92, 0.08, 0.07);
  for (const [col, pts, t] of EMBLEMS[p.sign] || EMBLEMS.key) { if (t < 0.01) continue; paint(ctx, null, col, 0.65); plate(S, pts, t, 0.75, sy - 0.85, 1); }
}
// ── roof geometry shared by the drawing, the chimney and the smoke rows ──
export function roofGeo(p) {
  const { fl, H } = dims(p), top = fl[fl.length - 1], r = p.roof || {}, e = p.eave ?? 0.75, bz = p.d / 2;
  const kind = ['gz', 'gx', 'hip', 'salt'].includes(r.kind) ? r.kind : 'gz';
  const tan = Math.tan((r.pitch || 40) * Math.PI / 180), x0 = -top.hw - e, x1 = top.hw + e, z0 = top.zf - e, z1 = bz + e, ye = H - e * tan, hx = top.hw, hz = (bz - top.zf) / 2;
  const g = { kind, e, tan, x0, x1, z0, z1, ye, H, hx, hz, top, bz };
  if (kind === 'gz') g.ry = ye + x1 * tan;
  else if (kind === 'hip') { g.zc = (z0 + z1) / 2; g.rise = (hz + e) * tan; g.ry = ye + g.rise; g.inset = Math.min(hz + e, (hx + e) * 0.9); g.rx0 = x0 + g.inset; g.rx1 = x1 - g.inset; }
  else { const f = kind === 'salt' ? (r.ridge ?? 0.38) : 0.5; g.rz = z0 + (z1 - z0) * f; g.ry = ye + (g.rz - z0) * tan; g.back = kind === 'salt' ? tan * 0.55 : tan; g.yb = g.ry - (z1 - g.rz) * g.back; }
  return g;
}
export function roofAt(g, x, z) {
  if (g.kind === 'gz') return g.ye + (g.x1 - Math.abs(x)) * g.tan;
  if (g.kind === 'hip') { const k = g.rise / g.inset; return Math.min(g.ry, g.ye + (z - g.z0) * g.tan, g.ye + (g.z1 - z) * g.tan, g.ye + (x - g.x0) * k, g.ye + (g.x1 - x) * k); }
  return z <= g.rz ? g.ye + (z - g.z0) * g.tan : g.ry - (z - g.rz) * g.back;
}
export function chimneySpot(p0) {
  const p = { w: 9, d: 9, floors: 2, roof: { kind: 'gx', pitch: 40 }, ...p0 }, g = roofGeo(p), sd = (p.seed || 0) % 2 ? 1 : -1;
  const [cx, cz] = p.chimney || (g.kind === 'gz' ? [sd * g.hx * 0.5, g.bz - 1.8] : [sd * (g.hx - 1.4), g.bz - 1.6]);
  let hi = -1e9; for (const a of [-0.5, 0.5]) for (const b of [-0.5, 0.5]) hi = Math.max(hi, roofAt(g, cx + a, cz + b));
  return { x: cx, z: cz, top: Math.max(hi + 1.0, g.H + 1.4), smokeY: Math.max(hi + 1.0, g.H + 1.4) + 0.55 };
}
function vane(ctx, P, x, y, z, kind, lod) {
  paint(ctx, null, COL.iron, 0.5, 0.6); beam(P, [x, y - 0.1, z], [x, y + 1.55, z], 0.05, 0.05);
  paint(ctx, 'copper', 'oklch(0.9 0.04 170)', 0.4, 0.6); lathe(P, [[0, -0.1], [0.08, -0.07], [0.1, 0], [0.08, 0.07], [0, 0.1]], 8, x, y + 0.55, z);
  if (lod <= 2) { paint(ctx, null, COL.iron, 0.5, 0.6); beam(P, [x - 0.4, y + 0.85, z], [x + 0.4, y + 0.85, z], 0.03, 0.03); beam(P, [x, y + 0.85, z - 0.4], [x, y + 0.85, z + 0.4], 0.03, 0.03); for (const [a, b] of [[0.46, 0], [-0.46, 0], [0, 0.46], [0, -0.46]]) obox(P, x + a, y + 0.8, z + b, 0.08, 0.1, 0.08); }
  const F = XF(P, x, y + 1.25, z, 0.6), s = 1.35;
  paint(ctx, null, COL.iron, 0.5, 0.6); plate(F, BAR([-0.45, 0], [0.45, 0], 0.035), 0.035, 0, 0, s); plate(F, [[0.45, 0.07], [0.62, 0], [0.45, -0.07]], 0.03, 0, 0, s); plate(F, [[-0.45, 0.02], [-0.36, 0.02], [-0.44, 0.14], [-0.53, 0.14]], 0.03, 0, 0, s); plate(F, [[-0.45, -0.02], [-0.53, -0.14], [-0.44, -0.14], [-0.36, -0.02]], 0.03, 0, 0, s);
  const gold = 'oklch(0.8 0.13 82)', G = (c, pts) => { paint(ctx, c ? 'brass' : 'copper', c || 'oklch(0.92 0.04 170)', 0.35, 0.7); plate(F, pts, 0.035, 0, 0, s); };
  if (kind === 'fish') { G(null, E(0, 0.22, 0.3, 0.11, 12)); G(null, [[-0.26, 0.22], [-0.46, 0.36], [-0.46, 0.08]]); G(null, [[-0.08, 0.3], [0.08, 0.31], [-0.14, 0.42]]); G(null, BAR([0, 0], [0, 0.14], 0.03)); }
  else if (kind === 'dragon') { const c = 'oklch(0.55 0.1 30)'; G(c, E(0, 0.2, 0.2, 0.09, 10)); G(c, [[0.12, 0.2], [0.2, 0.24], [0.3, 0.44], [0.22, 0.46]]); G(c, [[0.22, 0.42], [0.3, 0.5], [0.46, 0.44], [0.3, 0.39]]); G(c, [[-0.1, 0.25], [0.12, 0.25], [-0.05, 0.62]]); G(c, [[-0.05, 0.62], [0.12, 0.25], [0.22, 0.54]]); G(c, [[-0.18, 0.23], [-0.18, 0.16], [-0.34, 0.1], [-0.34, 0.17]]); G(c, [[-0.34, 0.17], [-0.34, 0.1], [-0.44, 0.2], [-0.42, 0.25]]); G(c, [[-0.42, 0.25], [-0.44, 0.2], [-0.54, 0.31]]); G(c, BAR([0, 0], [0, 0.14], 0.03)); }
  else { G(gold, E(0, 0.2, 0.2, 0.14, 10)); G(gold, [[-0.15, 0.25], [-0.38, 0.56], [-0.3, 0.18]]); G(gold, [[-0.15, 0.2], [-0.44, 0.38], [-0.28, 0.08]]); G(gold, [[0.08, 0.26], [0.18, 0.22], [0.24, 0.44], [0.14, 0.46]]); G(gold, E(0.2, 0.48, 0.07, 0.07, 8)); G('oklch(0.6 0.18 28)', [[0.15, 0.52], [0.22, 0.63], [0.27, 0.52]]); G(gold, [[0.26, 0.5], [0.35, 0.47], [0.26, 0.45]]); G(gold, [[-0.02, 0.08], [0.02, 0.08], [0.03, -0.02], [-0.01, -0.02]]); }
}
function dormers(ctx, p, g, cs, lod, tile) {
  const n = p.dormers ?? 1; if (!n || lod > 3) return;
  const dh = 1.3, dy = g.H + 0.1, top = g.top;
  const sides = g.kind === 'gz'
    ? [{ yaw: -Math.PI / 2, z0: -g.x1, ridge: 0, u0: top.zf + 0.4, u1: g.bz - 0.4, W: (u, z) => [-z, u] }, { yaw: Math.PI / 2, z0: -g.x1, ridge: 0, u0: -(g.bz - 0.4), u1: -(top.zf + 0.4), W: (u, z) => [z, -u] }]
    : [{ yaw: 0, z0: g.z0, ridge: g.kind === 'hip' ? g.zc : g.rz, u0: -g.hx + 0.3, u1: g.hx - 0.3, W: (u, z) => [u, z] }];
  for (const sd of sides) {
    const dz = sd.z0 + g.e + 0.3, zb = sd.z0 + (dy + dh + 0.62 - g.ye) / g.tan;
    if (zb > sd.ridge - 0.05) continue;
    const m = g.kind === 'gz' ? 1 : n;
    for (let i = 0; i < m; i++) {
      let u = sd.u0 + (i + 0.5) * (sd.u1 - sd.u0) / m, ok = false;
      for (const du of [0, 1.6, -1.6, 2.6, -2.6]) {
        const uu = u + du; if (uu - 1.05 < sd.u0 || uu + 1.05 > sd.u1) continue;
        const [wx, wz] = sd.W(uu, (dz + zb) / 2);
        if (Math.abs(wx - cs.x) < 1.6 && Math.abs(wz - cs.z) < (zb - dz) / 2 + 0.9) continue;
        const c1 = sd.W(uu - 1.05, zb), c2 = sd.W(uu + 1.05, zb);
        if (roofAt(g, c1[0], c1[1]) < dy + dh + 0.5 || roofAt(g, c2[0], c2[1]) < dy + dh + 0.5) continue;
        u = uu; ok = true; break;
      }
      if (!ok) continue;
      const F = XF(ctx, 0, 0, 0, sd.yaw);
      paint(ctx, 'plaster', p.plaster, 0.92); box(F, u - 0.8, dy, dz, u + 0.8, dy + dh, zb);
      const A = [[u - 0.8, dy + dh, dz], [u + 0.8, dy + dh, dz], [u, dy + dh + 0.5, dz]]; solid(F, A, A.map(([a, b, c]) => [a, b, c + 0.1]));
      win(ctx, XF(F, 0, 0, dz, 0), u, dy + 0.3, 0.8, 0.8, { frame: p.trim, box: lod <= 2 && (i + (p.seed || 0)) % 2 === 0, flowers: FLOWERS.slice(i % 3) });
      tile(); slab(F, [u - 1.05, dy + dh - 0.05, dz - 0.25], [u, dy + dh + 0.55, dz - 0.25], [u, dy + dh + 0.55, zb], [u - 1.05, dy + dh - 0.05, zb], 0.1); slab(F, [u, dy + dh + 0.55, dz - 0.25], [u + 1.05, dy + dh - 0.05, dz - 0.25], [u + 1.05, dy + dh - 0.05, zb], [u, dy + dh + 0.55, zb], 0.1);
      if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.85); beam(F, [u - 1.05, dy + dh - 0.12, dz - 0.27], [u, dy + dh + 0.5, dz - 0.27], 0.06, 0.16); beam(F, [u + 1.05, dy + dh - 0.12, dz - 0.27], [u, dy + dh + 0.5, dz - 0.27], 0.06, 0.16); }
    }
  }
}
function roof(ctx, p, fl, H, bz, lod) {
  const P = ctx, r = p.roof, g = roofGeo(p), { e, tan, x0, x1, z0, z1, ye, hx, hz, top } = g, t = 0.16, wallTop = H;
  const tile = () => paint(ctx, r.tex || 'clay', r.tint || 'oklch(0.95 0.03 45)', 0.85);
  const raft = (a, b) => beam(P, a, b, 0.09, 0.13), step = (a, b) => { const n = Math.max(2, Math.round((b - a) / 0.62)); const out = []; for (let i = 0; i <= n; i++) out.push(a + i * (b - a) / n); return out; };
  if (g.kind === 'gz') {
    const ry = g.ry, yS = (x) => ye + (x1 - Math.abs(x)) * tan - 0.1;
    tile();
    slab(P, [x0, ye, z0], [0, ry, z0], [0, ry, z1], [x0, ye, z1], t);
    slab(P, [0, ry, z0], [x1, ye, z0], [x1, ye, z1], [0, ry, z1], t);
    paint(ctx, 'plaster', p.plaster, 0.92);
    for (const z of [top.zf, bz - 0.2]) { const A = [[-hx, wallTop, z], [hx, wallTop, z], [0, wallTop + hx * tan, z]]; solid(P, A, A.map(([x, y, q]) => [x, y, q + 0.2])); }
    if (lod <= 2) { const F = XF(P, 0, 0, top.zf, 0); paint(ctx, 'walnut', COL.walnut, 0.85); beam(F, [-hx, wallTop, -0.05], [0, wallTop + hx * tan - 0.1, -0.05], 0.14, 0.1); beam(F, [hx, wallTop, -0.05], [0, wallTop + hx * tan - 0.1, -0.05], 0.14, 0.1); obox(F, 0, wallTop, -0.05, 0.16, hx * tan - 0.2, 0.1); win(ctx, F, 0, wallTop + 0.35, 0.7, Math.min(1.1, hx * tan * 0.45), { frame: p.trim, box: true }); paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [0, ry + 0.12, z0], [0, ry + 0.12, z1], 0.22, 0.14);
      for (const z of step(z0 + 0.3, z1 - 0.3)) for (const s of [-1, 1]) raft([s * hx, yS(hx), z], [s * (x1 - 0.03), yS(x1 - 0.03), z]); }
    if (lod <= 3) { paint(ctx, 'walnut', COL.walnut, 0.85); for (const z of [z0 - 0.03, z1 + 0.03]) { beam(P, [x0, ye - 0.09, z], [0, ry - 0.09, z], 0.07, 0.24); beam(P, [0, ry - 0.09, z], [x1, ye - 0.09, z], 0.07, 0.24); } }
  } else if (g.kind === 'gx' || g.kind === 'salt') {
    const { rz, ry, yb } = g, dz1 = z1 - rz;
    tile();
    slab(P, [x0, ye, z0], [x1, ye, z0], [x1, ry, rz], [x0, ry, rz], t);
    slab(P, [x0, ry, rz], [x1, ry, rz], [x1, yb, z1], [x0, yb, z1], t);
    paint(ctx, 'plaster', p.plaster, 0.92);
    const wz0 = top.zf, wz1 = bz, wry = ry - 0.05, wyb = Math.max(wallTop, yb + (z1 - wz1) * (ry - yb) / dz1);
    for (const x of [-hx, hx - 0.2]) { const A = [[x, wallTop, wz0], [x, wry, rz], [x, wyb, wz1], [x, wallTop, wz1]]; solid(P, A, A.map(([a, b, c]) => [a + 0.2, b, c])); }
    if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [x0, ry + 0.12, rz], [x1, ry + 0.12, rz], 0.14, 0.22);
      for (const x of step(x0 + 0.35, x1 - 0.35)) { raft([x, roofAt(g, x, top.zf) - 0.1, top.zf], [x, roofAt(g, x, z0 + 0.03) - 0.1, z0 + 0.03]); raft([x, roofAt(g, x, bz) - 0.1, bz], [x, roofAt(g, x, z1 - 0.03) - 0.1, z1 - 0.03]); } }
    if (lod <= 3) { paint(ctx, 'walnut', COL.walnut, 0.85); for (const x of [x0 - 0.03, x1 + 0.03]) { beam(P, [x, ye - 0.09, z0], [x, ry - 0.09, rz], 0.07, 0.24); beam(P, [x, ry - 0.09, rz], [x, yb - 0.09, z1], 0.07, 0.24); } }
  } else { // hip
    const { ry, rx0, rx1, zc } = g, yl = ye;
    tile();
    slab(P, [x0, yl, z0], [x1, yl, z0], [rx1, ry, zc], [rx0, ry, zc], t);
    slab(P, [rx0, ry, zc], [rx1, ry, zc], [x1, yl, z1], [x0, yl, z1], t);
    for (const [xa, xr] of [[x0, rx0], [x1, rx1]]) { const A = [[xa, yl, z0], [xr, ry, zc], [xa, yl, z1]]; solid(P, A, A.map(([a, b, c]) => [a, b + t, c])); }
    paint(ctx, 'plaster', p.plaster, 0.92); box(P, -hx, wallTop - 0.01, top.zf, hx, wallTop + g.rise * 0.5, bz);
    if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [rx0, ry + 0.12, zc], [rx1, ry + 0.12, zc], 0.2, 0.14);
      for (const x of step(x0 + 0.6, x1 - 0.6)) { raft([x, roofAt(g, x, top.zf) - 0.1, top.zf], [x, roofAt(g, x, z0 + 0.03) - 0.1, z0 + 0.03]); raft([x, roofAt(g, x, bz) - 0.1, bz], [x, roofAt(g, x, z1 - 0.03) - 0.1, z1 - 0.03]); }
      for (const z of step(z0 + 0.6, z1 - 0.6)) for (const s of [-1, 1]) raft([s * hx, roofAt(g, s * hx, z) - 0.1, z], [s * (x1 - 0.03), roofAt(g, s * (x1 - 0.03), z) - 0.1, z]); }
  }
  const cs = chimneySpot(p);
  dormers(ctx, p, g, cs, lod, tile);
  if (lod <= 4) { // stone chimney: coursed stack, a string band, a cap and clay pots
    const { x: cx, z: cz, top: ct } = cs, w = 0.5;
    paint(ctx, 'ashlar', ['oklch(0.9 0.03 60)', 'oklch(0.86 0.03 40)', 'oklch(0.92 0.02 90)'][(p.seed || 0) % 3], 0.9); box(P, cx - w, wallTop - 1, cz - w, cx + w, ct, cz + w);
    if (lod <= 3) { box(P, cx - w - 0.08, ct - 0.55, cz - w - 0.08, cx + w + 0.08, ct - 0.4, cz + w + 0.08); box(P, cx - w - 0.12, ct, cz - w - 0.12, cx + w + 0.12, ct + 0.14, cz + w + 0.12); }
    if (lod <= 2) { paint(ctx, null, 'oklch(0.6 0.12 45)', 0.8); const two = (p.seed || 0) % 3 === 0; for (const dx of two ? [-0.2, 0.2] : [0]) lathe(P, [[0.15, 0], [0.13, 0.3], [0.16, 0.36], [0.1, 0.36], [0.1, 0]], 6, cx + dx, ct + 0.14, cz); }
  }
  if (p.vane && lod <= 3) {
    const vy = g.ry + 0.25;
    if (g.kind === 'gz') vane(ctx, P, 0, vy, top.zf + 0.6, p.vane, lod);
    else if (g.kind === 'hip') vane(ctx, P, (g.rx0 + g.rx1) / 2 + (p.vaneAt ?? 0) * (g.rx1 - g.rx0) / 2, vy, g.zc, p.vane, lod);
    else vane(ctx, P, (p.vaneAt ?? -0.5) * hx, vy, g.rz, p.vane, lod);
  }
}
export function collider(ctx) {
  const p = { w: 9, d: 9, floors: 2, ...ctx.params }, { fl, H } = dims(p), bz = p.d / 2;
  box(ctx, -p.w / 2 - 0.1, -0.5, -p.d / 2 - 0.1, p.w / 2 + 0.1, GF, bz + 0.1);
  if (fl.length > 1) { const t = fl[fl.length - 1]; box(ctx, -t.hw, GF, t.zf, t.hw, H + 1.5, bz); }
  const doorX = p.doorX ?? (p.shop ? -p.w / 2 + 1.6 : 0), fz = -p.d / 2;
  box(ctx, doorX - 0.9, -0.3, fz - 0.7, doorX + 0.9, 0.35, fz - 0.1); box(ctx, doorX - 0.9, -0.3, fz - 1.02, doorX + 0.9, 0.175, fz - 0.7);
  if (p.barrels) { const sd = Math.sign(p.barrels) || 1, x = doorX + sd * 2.2; box(ctx, x - 0.9, 0, fz - 1.6, x + 0.9, 1.0, fz - 0.1); }
}
