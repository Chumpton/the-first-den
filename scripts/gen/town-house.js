// A timber-framed town house or shop: feet at ground, front (door, shop window) toward −Z, metres.
// params: w, d, floors, roof { kind: gx|gz|hip|salt, pitch°, tex, tint }, plaster, trim, base: stone|plaster,
// awning (colour) | null, sign: bakery|tavern|apothecary|tailor|books|null, chimney [x, z] | null, shop: bool
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
        paint(ctx, 'ashlar', COL.lime, 0.9); obox(fc.F, doorX, 0, -0.45, 1.8, 0.35, 0.9);
        // shop window or windows
        const free = [[-fc.L + 0.5, doorX - 1.0], [doorX + 1.0, fc.L - 0.5]];
        for (const [a, b] of free) {
          const span = b - a; if (span < 1.2) continue;
          if (p.shop && span > 3) { const wx = (a + b) / 2, ww = Math.min(span - 0.6, 4.2); win(ctx, fc.F, wx, 0.85, ww, 1.75, { panes: 4, frame: p.trim }); cuts.push([wx, ww / 2]); }
          else { const n = Math.max(1, Math.floor(span / 2.3)); for (let i = 0; i < n; i++) { const wx = a + (i + 0.5) * span / n; win(ctx, fc.F, wx, y0, 1.0, wh, { frame: p.trim, shutter: k === 0 ? p.trim : null }); cuts.push([wx, 0.5]); } }
        }
      } else {
        const span = 2 * fc.L - 1.2, n = Math.max(1, Math.floor(span / (fc.front ? 2.2 : 3.2)));
        if (lod <= 3 || fc.front) for (let i = 0; i < n; i++) {
          const wx = -fc.L + 0.6 + (i + 0.5) * span / n;
          win(ctx, fc.F, wx, y0, fc.front ? 1.05 : 0.9, wh, { frame: p.trim, box: fc.front && k > 0 && (i + k + (p.seed || 0)) % 2 === 0, flowers: FLOWERS.slice((k + i) % 3), shutter: fc.front && k === 1 ? p.trim : null });
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
  // hanging sign
  if (p.sign && lod <= 3) {
    const sx = doorX + (doorX < 0 ? -1.3 : 1.3), sy = GF + 0.9, z0 = fl[1] ? fl[1].zf : fl[0].zf;
    paint(ctx, null, COL.iron, 0.5, 0.6); beam(P, [sx, sy, z0], [sx, sy, z0 - 1.25], 0.06, 0.06); beam(P, [sx, sy - 0.5, z0], [sx, sy - 0.02, z0 - 0.7], 0.04, 0.04);
    for (const z of [z0 - 0.35, z0 - 1.05]) beam(P, [sx, sy, z], [sx, sy - 0.2, z], 0.02, 0.02);
    paint(ctx, 'oak', 'oklch(0.9 0.05 70)', 0.8); obox(P, sx, sy - 1.05, z0 - 0.7, 0.07, 0.85, 1.05);
    paint(ctx, 'oak', p.trim, 0.8); obox(P, sx, sy - 1.12, z0 - 0.7, 0.05, 0.99, 1.19);
    emblem(ctx, P, p.sign, sx, sy - 0.62, z0 - 0.7);
  }
  if (p.lamp && lod <= 3) { paint(ctx, null, COL.iron, 0.5, 0.6); const lx = doorX + (doorX < 0 ? 1.0 : -1.0); beam(P, [lx, 2.9, fl[0].zf], [lx, 2.9, fl[0].zf - 0.45], 0.04, 0.04); lantern(ctx, P, lx, 2.9, fl[0].zf - 0.45, 0.9); }
}
function emblem(ctx, P, kind, x, y, z) {
  const s = (c) => paint(ctx, null, c, 0.6);
  for (const side of [-1, 1]) {
    const ex = x + side * 0.06;
    if (kind === 'bakery') { s('oklch(0.72 0.12 65)'); obox(P, ex, y - 0.12, z, 0.06, 0.26, 0.62); s('oklch(0.62 0.12 55)'); for (const o of [-0.2, 0, 0.2]) obox(P, ex + side * 0.01, y + 0.02, z + o, 0.06, 0.06, 0.08); }
    else if (kind === 'tavern') { s('oklch(0.8 0.13 80)'); obox(P, ex, y - 0.3, z - 0.05, 0.06, 0.5, 0.34); s('oklch(0.98 0.01 90)'); obox(P, ex, y + 0.18, z - 0.05, 0.06, 0.12, 0.38); s('oklch(0.5 0.06 60)'); obox(P, ex, y - 0.2, z + 0.2, 0.06, 0.28, 0.08); }
    else if (kind === 'apothecary') { s('oklch(0.6 0.12 160)'); obox(P, ex, y - 0.32, z, 0.06, 0.4, 0.4); obox(P, ex, y + 0.08, z, 0.06, 0.24, 0.14); s('oklch(0.8 0.1 85)'); obox(P, ex, y + 0.3, z, 0.06, 0.06, 0.18); }
    else if (kind === 'tailor') { s('oklch(0.75 0.03 250)'); beam(P, [ex, y - 0.35, z - 0.28], [ex, y + 0.25, z + 0.18], 0.05, 0.05); beam(P, [ex, y - 0.35, z + 0.28], [ex, y + 0.25, z - 0.18], 0.05, 0.05); s('oklch(0.62 0.15 25)'); obox(P, ex, y - 0.4, z - 0.3, 0.06, 0.12, 0.12); obox(P, ex, y - 0.4, z + 0.3, 0.06, 0.12, 0.12); }
    else { s('oklch(0.55 0.12 25)'); obox(P, ex, y - 0.3, z, 0.06, 0.5, 0.55); s('oklch(0.96 0.02 90)'); obox(P, ex, y - 0.26, z, 0.07, 0.42, 0.04); }
  }
}
function roof(ctx, p, fl, H, bz, lod) {
  const P = ctx, r = p.roof, e = 0.4, top = fl[fl.length - 1], x0 = -top.hw - e, x1 = top.hw + e, z0 = top.zf - e, z1 = bz + e;
  const tan = Math.tan((r.pitch || 40) * Math.PI / 180), t = 0.16;
  const tile = () => paint(ctx, r.tex || 'clay', r.tint || 'oklch(0.95 0.03 45)', 0.85);
  const gable = (pts) => { paint(ctx, 'plaster', p.plaster, 0.92); const n = pts.length; solid(P, pts, pts.map(([x, y, z]) => [x, y, z + 0.001 + 0.18]).map((q, i) => q)); };
  const wallTop = H, cz = (top.zf + bz) / 2, hx = top.hw, hz = (bz - top.zf) / 2;
  if (r.kind === 'gz' || (r.kind !== 'gx' && r.kind !== 'hip' && r.kind !== 'salt')) {
    // ridge along z, gables to front and back
    const rise = (hx + e) * tan, ry = wallTop - e * tan + rise;
    tile();
    slab(P, [x0, wallTop - e * tan, z0], [0, ry, z0], [0, ry, z1], [x0, wallTop - e * tan, z1], t);
    slab(P, [0, ry, z0], [x1, wallTop - e * tan, z0], [x1, wallTop - e * tan, z1], [0, ry, z1], t);
    paint(ctx, 'plaster', p.plaster, 0.92);
    for (const z of [top.zf, bz - 0.2]) { const A = [[-hx, wallTop, z], [hx, wallTop, z], [0, wallTop + hx * tan, z]]; solid(P, A, A.map(([x, y, q]) => [x, y, q + 0.2])); }
    if (lod <= 2) { const F = XF(P, 0, 0, top.zf, 0); paint(ctx, 'walnut', COL.walnut, 0.85); beam(F, [-hx, wallTop, -0.05], [0, wallTop + hx * tan - 0.1, -0.05], 0.14, 0.1); beam(F, [hx, wallTop, -0.05], [0, wallTop + hx * tan - 0.1, -0.05], 0.14, 0.1); obox(F, 0, wallTop, -0.05, 0.16, hx * tan - 0.2, 0.1); win(ctx, F, 0, wallTop + 0.35, 0.7, Math.min(1.1, hx * tan * 0.45), { frame: p.trim, box: true }); paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [0, ry + 0.12, z0], [0, ry + 0.12, z1], 0.22, 0.14); }
  } else if (r.kind === 'gx' || r.kind === 'salt') {
    const rzf = r.kind === 'salt' ? (r.ridge ?? 0.38) : 0.5, rz = z0 + (z1 - z0) * rzf, dz0 = rz - z0, rise = dz0 * tan, ry = wallTop - e * tan + rise;
    const dz1 = z1 - rz, yb = ry - dz1 * (r.kind === 'salt' ? rise / dz0 * 0.55 : rise / dz0);
    tile();
    slab(P, [x0, wallTop - e * tan, z0], [x1, wallTop - e * tan, z0], [x1, ry, rz], [x0, ry, rz], t);
    slab(P, [x0, ry, rz], [x1, ry, rz], [x1, yb, z1], [x0, yb, z1], t);
    paint(ctx, 'plaster', p.plaster, 0.92);
    const wz0 = top.zf, wz1 = bz, wry = ry - 0.05, wyb = Math.max(wallTop, yb + (z1 - wz1) * (ry - yb) / dz1);
    const wyf = wallTop;
    for (const x of [-hx, hx - 0.2]) { const A = [[x, wyf, wz0], [x, wry, rz], [x, wyb, wz1], [x, wallTop, wz1]]; solid(P, A, A.map(([a, b, c]) => [a + 0.2, b, c])); }
    if (lod <= 3) { // a dormer on the front slope
      const dy = wallTop + 0.1, dz = z0 + dz0 * 0.45, dh = 1.3;
      paint(ctx, 'plaster', p.plaster, 0.92); box(P, -0.8, dy, dz, 0.8, dy + dh, rz);
      const F = XF(P, 0, 0, dz, 0); win(ctx, F, 0, dy + 0.25, 0.8, 0.85, { frame: p.trim });
      tile(); slab(P, [-1.05, dy + dh, dz - 0.2], [0, dy + dh + 0.55, dz - 0.2], [0, dy + dh + 0.55, rz], [-1.05, dy + dh, rz], 0.1); slab(P, [0, dy + dh + 0.55, dz - 0.2], [1.05, dy + dh, dz - 0.2], [1.05, dy + dh, rz], [0, dy + dh + 0.55, rz], 0.1);
    }
    if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [x0, ry + 0.12, rz], [x1, ry + 0.12, rz], 0.14, 0.22); }
  } else { // hip
    const rise = (hz + e) * tan, ry = wallTop - e * tan + rise, inset = Math.min((hz + e), (hx + e) * 0.9), rx0 = x0 + inset, rx1 = x1 - inset, zc = (z0 + z1) / 2, yl = wallTop - e * tan;
    tile();
    slab(P, [x0, yl, z0], [x1, yl, z0], [rx1, ry, zc], [rx0, ry, zc], t);
    slab(P, [rx0, ry, zc], [rx1, ry, zc], [x1, yl, z1], [x0, yl, z1], t);
    for (const [xa, xr] of [[x0, rx0], [x1, rx1]]) { const A = [[xa, yl, z0], [xr, ry, zc], [xa, yl, z1]]; solid(P, A, A.map(([a, b, c]) => [a, b + t, c])); }
    paint(ctx, 'plaster', p.plaster, 0.92); box(P, -hx, wallTop - 0.01, top.zf, hx, wallTop + rise * 0.5, bz);
    if (lod <= 2) { paint(ctx, 'walnut', COL.walnut, 0.85); beam(P, [rx0, ry + 0.12, zc], [rx1, ry + 0.12, zc], 0.2, 0.14); }
  }
  if (p.chimney && lod <= 4) {
    const [cx, czz] = p.chimney; paint(ctx, 'ashlar', 'oklch(0.9 0.03 50)', 0.9); box(P, cx - 0.45, wallTop - 1, czz - 0.45, cx + 0.45, wallTop + (r.pitch > 45 ? 5.2 : 4.0), czz + 0.45);
    if (lod <= 2) { const y = wallTop + (r.pitch > 45 ? 5.2 : 4.0); box(P, cx - 0.55, y - 0.18, czz - 0.55, cx + 0.55, y, czz + 0.55); paint(ctx, null, 'oklch(0.6 0.12 45)', 0.8); lathe(P, [[0.16, 0], [0.16, 0.35], [0.1, 0.35], [0.1, 0]], 6, cx, y, czz); }
  }
}
export function collider(ctx) {
  const p = { w: 9, d: 9, floors: 2, ...ctx.params }, { fl, H } = dims(p), bz = p.d / 2;
  box(ctx, -p.w / 2 - 0.1, -0.5, -p.d / 2 - 0.1, p.w / 2 + 0.1, GF, bz + 0.1);
  if (fl.length > 1) { const t = fl[fl.length - 1]; box(ctx, -t.hw, GF, t.zf, t.hw, H + 1.5, bz); }
}
