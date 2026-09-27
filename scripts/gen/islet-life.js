// The pond islet's small life, one family. params.kind:
//  "grounds" (default): the ancient standing stone (at params.s, local xz), pebbles round its foot and a few wildflower tufts.
//  "runes":  the stone's carved glyphs alone, authored at the stone's own origin (wear scripts/material-rune-pulse.js).
// Stone frame: origin at its buried foot, front face (−Z) flat so glyphs sit on it; a slight lean comes from shear().
import { paint, blob, TAU } from '../lib/yard-kit.js';
import { Q, T, box } from '../lib/road-solid.js';
const H = 1.72, BASE = -0.12;                                   // stone height above its foot; buried a little
const sx = (y) => 0.34 - 0.075 * y, sz = (y) => 0.24 - 0.05 * y; // tapering elliptic section
const shear = (x, y, z) => [x + 0.07 * y, y, z + 0.035 * y];
const ANG = Array.from({ length: 8 }, (_, i) => (-67.5 + 45 * i) * Math.PI / 180); // verts 7,0 bound the front face; 3,4 the back
const LEVELS = [BASE, 0.3, 0.72, 1.12, 1.46];
function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function stone(ctx, ox, oy, oz, lod) {
  const r = rng(7), n = 8, fixed = new Set([0, 7, 3, 4]);
  const at = (p) => [ox + p[0], oy + p[1], oz + p[2]];
  const rings = LEVELS.map((y, k) => ANG.map((a, i) => { const j = fixed.has(i) ? 1 : 0.86 + r() * 0.26; return at(shear(Math.cos(a) * sx(y) * j, y + (k ? (r() - 0.5) * 0.04 : 0), Math.sin(a) * sz(y) * j)); }));
  const top = ANG.map((a, i) => { const x = Math.cos(a) * sx(H) * 0.92, y = H + x * 0.55 + (r() - 0.5) * 0.05; return at(shear(x, y, Math.sin(a) * sz(H) * 0.92)); });
  rings.push(top);
  ctx.albedo('cdn/texture-weathered-pale-grey-limestone-rock.png'); ctx.roughness(0.95); ctx.metalness(0);
  for (let k = 0; k < rings.length - 1; k++) {
    ctx.color(`oklch(${(0.8 - (k === 0 ? 0.1 : 0) + (k % 2) * 0.03).toFixed(3)} 0.018 ${k ? 95 : 130})`);
    const o = at(shear(0, (LEVELS[k] + (LEVELS[k + 1] ?? H)) / 2, 0));
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; Q(ctx, rings[k][i], rings[k][j], rings[k + 1][j], rings[k + 1][i], o); }
  }
  const cap = at(shear(0.02, H + 0.06, 0)), co = at(shear(0, H - 0.3, 0));
  ctx.color('oklch(0.84 0.02 90)'); for (let i = 0; i < n; i++) T(ctx, top[i], top[(i + 1) % n], cap, co);
  if (lod <= 2) { // lichen and moss creeping down the north shoulder
    paint(ctx, 'moss', 'oklch(0.7 0.1 128)', 0.95);
    const m = at(shear(-0.12, H - 0.08, 0.06)); blob(ctx, m[0], m[1], m[2], 0.16, 0.08, 0.13, 6, r);
    const m2 = at(shear(0.1, 0.05, 0.14)); blob(ctx, m2[0], m2[1], m2[2], 0.2, 0.1, 0.12, 6, r);
    ctx.albedo(null); ctx.color('oklch(0.86 0.08 100)');
    for (let i = 0; i < 6; i++) { const y = 0.4 + r() * 1.1, a = 0.2 + r() * 2.7, R = 1.02; const p = at(shear(Math.cos(a) * sx(y) * R, y, Math.sin(a) * sz(y) * R)), s = 0.03 + r() * 0.03;
      ctx.quad(p[0] - s, p[1] - s, p[2], p[0] + s, p[1] - s, p[2], p[0] + s, p[1] + s, p[2], p[0] - s, p[1] + s, p[2]); }
  }
}
// runes: strokes in a cell (u −.5….5, v 0…1)
const GLYPHS = [
  [[[-0.3, 0], [-0.3, 1]], [[-0.3, 0.55], [0.3, 0.85]], [[-0.3, 0.3], [0.3, 0.6]]],
  [[[0, 0], [0, 1]], [[0, 0.55], [-0.35, 0.95]], [[0, 0.55], [0.35, 0.95]]],
  [[[0, 0], [-0.35, 0.5]], [[-0.35, 0.5], [0, 1]], [[0, 1], [0.35, 0.5]], [[0.35, 0.5], [0, 0]]],
  [[[0, 0], [0, 1]], [[0, 1], [-0.35, 0.7]], [[0, 1], [0.35, 0.7]]],
  [[[-0.3, 1], [0.2, 0.62]], [[0.2, 0.62], [-0.2, 0.38]], [[-0.2, 0.38], [0.3, 0]]],
  [[[0, 1], [-0.3, 0.65]], [[-0.3, 0.65], [0, 0.35]], [[0, 0.35], [0.3, 0.65]], [[0.3, 0.65], [0, 1]], [[0, 0.35], [-0.35, 0]], [[0, 0.35], [0.35, 0]]],
];
function runes(ctx, lod) {
  ctx.albedo(null); ctx.color('oklch(0.82 0.13 190)'); ctx.emissive('oklch(0.72 0.14 190)'); ctx.roughness(0.5); ctx.metalness(0);
  const CW = 0.11, CH = 0.14, SW = 0.017;
  const face = (side, order, y0) => order.forEach((g, k) => {
    const yb = y0 + k * 0.215;
    for (const [a, b] of GLYPHS[g]) {
      const P = (u, v) => { const y = yb + v * CH, x = u * CW * side; return shear(x, y, side * -(0.924 * sz(y) + 0.006)); };
      const du = (b[0] - a[0]) * CW, dv = (b[1] - a[1]) * CH, L = Math.hypot(du, dv) || 1, nu = -dv / L * SW / 2 / CW, nv = du / L * SW / 2 / CH;
      const ea = [a[0] - (du / L) * SW * 0.4 / CW, a[1] - (dv / L) * SW * 0.4 / CH], eb = [b[0] + (du / L) * SW * 0.4 / CW, b[1] + (dv / L) * SW * 0.4 / CH];
      const A = P(ea[0] + nu, ea[1] + nv), B = P(eb[0] + nu, eb[1] + nv), C = P(eb[0] - nu, eb[1] - nv), D = P(ea[0] - nu, ea[1] - nv);
      Q(ctx, A, B, C, D, shear(0, yb + CH / 2, 0));
    }
  });
  face(1, [5, 1, 2, 4, 0, 3], 0.2);
  if (lod <= 3) face(-1, [3, 2, 1, 5], 0.4);
  ctx.emissive(null);
}
function grounds(ctx, P, lod) {
  const [sxz, szz] = P.s || [-1, -0.55], sy = P.sy ?? 0.45, r = rng(11);
  stone(ctx, sxz, sy, szz, lod);
  // pebbles round the foot and a scatter by the chest
  const peb = [[sxz + 0.42, szz - 0.2, 0.12], [sxz - 0.35, szz - 0.25, 0.09], [sxz + 0.15, szz + 0.36, 0.1], [sxz - 0.2, szz + 0.3, 0.07], [0.95, -0.2, 0.08], [-0.15, -1.25, 0.1]];
  for (const [x, z, s] of peb) { paint(ctx, 'stone', `oklch(${(0.8 + r() * 0.08).toFixed(3)} 0.02 85)`, 0.9); blob(ctx, x, 0.52, z, s, s * 0.6, s * 0.85, lod <= 2 ? 6 : 4, r); }
  if (lod > 2) return;
  // wildflower tufts: cream and honey heads on thin stems
  ctx.albedo(null); ctx.roughness(0.8);
  const tufts = [[sxz + 0.5, szz + 0.2], [0.05, -0.4], [-0.55, -1.2], [1.25, -0.55], [-1.4, 0.95]];
  for (const [x, z] of tufts) for (let i = 0; i < 5; i++) {
    const a = r() * TAU, d = r() * 0.14, bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d, h = 0.14 + r() * 0.16, y0 = 0.5;
    ctx.color('oklch(0.62 0.11 135)'); ctx.quad(bx - 0.006, y0, bz, bx + 0.006, y0, bz, bx + 0.004, y0 + h, bz, bx - 0.004, y0 + h, bz);
    ctx.color(i % 2 ? 'oklch(0.95 0.035 85)' : 'oklch(0.84 0.1 75)'); const s = 0.03;
    ctx.quad(bx - s, y0 + h, bz - s, bx + s, y0 + h, bz - s, bx + s, y0 + h + 0.01, bz + s, bx - s, y0 + h + 0.01, bz + s);
  }
}
export function geometry(ctx) {
  const P = ctx.params || {}, lod = ctx.lod || 1; ctx.flat();
  if (P.kind === 'runes') return runes(ctx, lod);
  return grounds(ctx, P, lod);
}
export function collider(ctx) {
  const P = ctx.params || {};
  if (P.kind === 'runes') return null;
  const [x, z] = P.s || [-1, -0.55], y = P.sy ?? 0.45;
  box(ctx, x - 0.3, y, z - 0.22, x + 0.42, y + H, z + 0.26);
}
