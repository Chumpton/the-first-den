// Rescue-pasture furnishings, one generator: params.kind shelter | trough | bales | rack | lick | sign.
// Origin at the feet, front toward −Z unless said. Weathered timber, honey oak, pale limestone, straw.
import { Q, solid, box } from '../lib/road-solid.js';
const TIMBER = 'cdn/texture-weathered-silver-grey-fence-timber.png';
const OAK = 'cdn/texture-honey-oak-barn-planks.png';
const STONE = 'cdn/texture-pale-limestone-blocks.png';
const STRAW = 'cdn/texture-golden-straw-hay.png';
const SHINGLE = 'cdn/texture-weathered-cedar-shingles.png';
const tone = (ctx, l, c, h) => ctx.color(`oklch(${(l + ctx.random() * 0.04).toFixed(3)} ${c} ${h})`);
// an oriented box: centre, half extents along unit axes u (x-ish), v (up-ish), w
function obox(ctx, c, u, v, w, hu, hv, hw) {
  const p = (a, b, d) => [c[0] + u[0] * a * hu + v[0] * b * hv + w[0] * d * hw, c[1] + u[1] * a * hu + v[1] * b * hv + w[1] * d * hw, c[2] + u[2] * a * hu + v[2] * b * hv + w[2] * d * hw];
  solid(ctx, [p(-1, -1, -1), p(1, -1, -1), p(1, -1, 1), p(-1, -1, 1)], [p(-1, 1, -1), p(1, 1, -1), p(1, 1, 1), p(-1, 1, 1)]);
}
// shelter: open front toward −Z, lean-to roof high at the front
function shelter(ctx, col) {
  const { w = 5, d = 3.8, hf = 2.7, hb = 2.05 } = ctx.params, lod = ctx.lod ?? 1, x = w / 2, z = d / 2, t = 0.08;
  const roofY = (zz) => hb + (hf - hb) * ((z - zz) / d);
  if (col) {
    box(ctx, -x, 0, z - t, x, hb, z + t); box(ctx, -x - t, 0, -z, -x + t, hf, z); box(ctx, x - t, 0, -z, x + t, hf, z);
    obox(ctx, [0, (hf + hb) / 2 + 0.12, 0], [1, 0, 0], norm([0, d, hf - hb]), norm([0, -(hf - hb), d]), x + 0.4, 0.06, Math.hypot(d, hf - hb) / 2 + 0.45);
    return;
  }
  ctx.flat(); ctx.roughness(0.95);
  // footing sill of limestone
  ctx.albedo(STONE); tone(ctx, 0.9, 0.02, 85); box(ctx, -x - 0.12, -0.2, -z - 0.05, x + 0.12, 0.14, z + 0.12);
  // posts
  ctx.albedo(TIMBER);
  const posts = [[-x, -z], [x, -z], [-x, z], [x, z], [0, -z]];
  for (const [px, pz] of lod >= 4 ? posts.slice(0, 4) : posts) { tone(ctx, 0.84, 0.012, 70); box(ctx, px - 0.09, 0.14, pz - 0.09, px + 0.09, roofY(pz), pz + 0.09); }
  // board walls: back and two sides, horizontal boards with a shadow line between
  ctx.albedo(OAK);
  const step = lod <= 2 ? 0.22 : lod === 3 ? 0.44 : 99;
  if (step > 50) { tone(ctx, 0.86, 0.03, 70); box(ctx, -x, 0.14, z - t, x, hb, z); box(ctx, -x, 0.14, -z, -x + t, hb, z); box(ctx, x - t, 0.14, -z, x, hb, z); }
  else for (let y = 0.14; y < hf - 0.05; y += step) {
    const y1 = y + step - 0.015;
    if (y1 <= hb + 0.01) { tone(ctx, 0.84, 0.035, 68); box(ctx, -x + 0.09, y, z - t, x - 0.09, Math.min(y1, hb), z - 0.005 - (Math.round(y / step) % 2) * 0.012); }
    for (const s of [-1, 1]) {
      const sx = s * x, top = Math.min(y1, roofY(-z)), topB = Math.min(y1, roofY(z));
      if (y >= top && y >= topB) continue;
      tone(ctx, 0.84, 0.035, 68);
      const zz0 = -z + 0.09, zz1 = z - 0.09, ya = Math.min(y1, roofY(zz0)), yb = Math.min(y1, roofY(zz1));
      const xi = sx - s * t, xo = sx - s * 0.005;
      solid(ctx, [[xi, y, zz0], [xo, y, zz0], [xo, y, zz1], [xi, y, zz1]], [[xi, ya, zz0], [xo, ya, zz0], [xo, yb, zz1], [xi, yb, zz1]]);
    }
  }
  // headers and rafters
  ctx.albedo(TIMBER); tone(ctx, 0.82, 0.012, 70);
  box(ctx, -x - 0.1, hf - 0.2, -z - 0.1, x + 0.1, hf, -z + 0.1); box(ctx, -x - 0.1, hb - 0.2, z - 0.1, x + 0.1, hb, z + 0.1);
  const L = Math.hypot(d + 0.9, hf - hb + (hf - hb) * 0.9 / d), u = [1, 0, 0], v = norm([0, d, hf - hb]), ww = norm([0, -(hf - hb), d]);
  if (lod <= 3) for (let i = 0; i <= 4; i++) { const rx = -x + (i * w) / 4; tone(ctx, 0.8, 0.012, 70); obox(ctx, [rx, (hf + hb) / 2 + 0.07, 0], u, v, ww, 0.05, 0.08, L / 2); }
  // shingled roof: rows of overlapping courses from the back eave up to the front
  ctx.albedo(SHINGLE);
  const rows = lod <= 2 ? 9 : lod === 3 ? 5 : 1, base = [0, (hf + hb) / 2 + 0.19, 0];
  for (let r = 0; r < rows; r++) {
    const s0 = -L / 2 + (r * L) / rows, s1 = s0 + L / rows + 0.08, sm = (s0 + s1) / 2, lift = 0.02 + (r % 2) * 0.008;
    const c = [base[0], base[1] + ww[1] * sm + v[1] * lift, base[2] + ww[2] * sm + v[2] * lift];
    tone(ctx, 0.82, 0.03, 50 + (r % 3) * 6);
    obox(ctx, c, u, v, ww, x + 0.4, 0.035, (s1 - s0) / 2);
  }
  // straw bedding inside
  if (lod <= 3) { ctx.albedo(STRAW); tone(ctx, 0.9, 0.06, 88); box(ctx, -x + 0.1, 0.14, -z + 0.4, x - 0.1, 0.19, z - 0.1); }
  ctx.albedo(null);
}
function norm(a) { const l = Math.hypot(...a) || 1; return a.map((k) => k / l); }
// trough: limestone basin with still water
function trough(ctx, col) {
  const { w = 2.2, d = 0.8, h = 0.62 } = ctx.params, x = w / 2, z = d / 2, t = 0.1;
  if (col) { box(ctx, -x, 0, -z, x, h, z); return; }
  ctx.flat(); ctx.albedo(STONE); ctx.roughness(0.9);
  tone(ctx, 0.9, 0.02, 85); box(ctx, -x, 0, -z, x, 0.14, z);
  tone(ctx, 0.92, 0.02, 85); box(ctx, -x, 0.14, -z, x, h, -z + t); box(ctx, -x, 0.14, z - t, x, h, z);
  tone(ctx, 0.9, 0.02, 85); box(ctx, -x, 0.14, -z + t, -x + t, h, z - t); box(ctx, x - t, 0.14, -z + t, x, h, z - t);
  if ((ctx.lod ?? 1) <= 2) { tone(ctx, 0.94, 0.02, 85); box(ctx, -x - 0.03, h, -z - 0.03, x + 0.03, h + 0.05, -z + t); box(ctx, -x - 0.03, h, z - t, x + 0.03, h + 0.05, z + 0.03); }
  ctx.albedo(null); ctx.color('oklch(0.62 0.09 195)', 0.82); ctx.roughness(0.08); ctx.metalness(0.1);
  ctx.quad(-x + t, h - 0.08, -z + t, -x + t, h - 0.08, z - t, x - t, h - 0.08, z - t, x - t, h - 0.08, -z + t);
  ctx.metalness(0);
}
function bale(ctx, cx, cy, cz, yaw, lod) {
  const c = Math.cos(yaw), s = Math.sin(yaw), hx = 0.5, hy = 0.22, hz = 0.25;
  ctx.albedo(STRAW); tone(ctx, 0.92, 0.07, 88);
  obox(ctx, [cx, cy + hy, cz], [c, 0, -s], [0, 1, 0], [s, 0, c], hx, hy, hz);
  if (lod <= 2) { ctx.albedo(null); ctx.color('oklch(0.55 0.08 55)'); for (const k of [-0.25, 0.25]) obox(ctx, [cx + c * k, cy + hy, cz - s * k], [c, 0, -s], [0, 1, 0], [s, 0, c], 0.015, hy + 0.006, hz + 0.006); }
}
function bales(ctx, col) {
  if (col) { box(ctx, -1.1, 0, -0.35, 1.1, 0.9, 0.35); return; }
  const lod = ctx.lod ?? 1; ctx.flat(); ctx.roughness(1);
  bale(ctx, -0.52, 0, 0, 0.04, lod); bale(ctx, 0.52, 0, 0.02, -0.05, lod); bale(ctx, 0, 0.44, 0, 0.1, lod);
  if (lod <= 3) bale(ctx, 1.25, 0, 0.55, 1.2, lod);
  ctx.albedo(null);
}
function rack(ctx, col) {
  const { w = 1.9 } = ctx.params, x = w / 2, lod = ctx.lod ?? 1;
  if (col) { box(ctx, -x - 0.1, 0, -0.45, x + 0.1, 1.55, 0.45); return; }
  ctx.flat(); ctx.roughness(0.95); ctx.albedo(TIMBER);
  for (const sx of [-x, x]) for (const sz of [-0.4, 0.4]) { tone(ctx, 0.84, 0.012, 70); box(ctx, sx - 0.06, 0, sz - 0.06, sx + 0.06, 1.5, sz + 0.06); }
  tone(ctx, 0.8, 0.012, 70); box(ctx, -x, 0.55, -0.42, x, 0.65, 0.42);
  for (const sz of [-0.42, 0.42]) { tone(ctx, 0.82, 0.012, 70); box(ctx, -x - 0.08, 1.42, sz - 0.05, x + 0.08, 1.5, sz + 0.05); }
  // slanted slats forming the V
  ctx.albedo(OAK);
  const n = lod <= 2 ? 9 : lod === 3 ? 5 : 0;
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) {
    const px = -x + 0.12 + (i * (w - 0.24)) / (n - 1); tone(ctx, 0.86, 0.035, 68);
    obox(ctx, [px, 1.03, s * 0.21], [1, 0, 0], norm([0, 0.8, s * 0.36]), norm([0, -s * 0.36, 0.8]), 0.022, 0.44, 0.022);
  }
  ctx.albedo(STRAW); tone(ctx, 0.9, 0.07, 88);
  solid(ctx, [[-x + 0.05, 0.66, -0.12], [x - 0.05, 0.66, -0.12], [x - 0.05, 0.66, 0.12], [-x + 0.05, 0.66, 0.12]], [[-x + 0.1, 1.45, -0.38], [x - 0.1, 1.45, -0.38], [x - 0.1, 1.5, 0.38], [-x + 0.1, 1.5, 0.38]]);
  if (lod <= 2) { tone(ctx, 0.93, 0.07, 90); solid(ctx, [[-x + 0.2, 1.48, -0.3], [x - 0.2, 1.48, -0.3], [x - 0.2, 1.5, 0.3], [-x + 0.2, 1.5, 0.3]], [[-x + 0.4, 1.66, -0.12], [x - 0.4, 1.66, -0.12], [x - 0.4, 1.68, 0.12], [-x + 0.4, 1.68, 0.12]]); }
  ctx.albedo(null);
}
function lick(ctx, col) {
  if (col) { box(ctx, -0.14, 0, -0.14, 0.14, 1.05, 0.14); return; }
  ctx.flat(); ctx.roughness(0.95); ctx.albedo(TIMBER); tone(ctx, 0.84, 0.012, 70);
  box(ctx, -0.09, 0, -0.09, 0.09, 0.82, 0.09);
  ctx.albedo(OAK); tone(ctx, 0.84, 0.035, 68); box(ctx, -0.16, 0.8, -0.16, 0.16, 0.86, 0.16);
  ctx.albedo(null); ctx.color('oklch(0.86 0.05 25)'); ctx.roughness(0.6);
  solid(ctx, [[-0.12, 0.86, -0.12], [0.12, 0.86, -0.12], [0.12, 0.86, 0.12], [-0.12, 0.86, 0.12]], [[-0.1, 1.02, -0.09], [0.08, 1.04, -0.1], [0.1, 1.0, 0.1], [-0.09, 1.01, 0.08]]);
  if ((ctx.lod ?? 1) <= 2) { ctx.color('oklch(0.8 0.01 60)'); box(ctx, -0.02, 0.86, -0.02, 0.02, 1.08, 0.02); }
}
// sign: a painted board hung by two ropes, top of the ropes at y 0 local — the board hangs below
function sign(ctx, col) {
  const { w = 1.7, h = 0.46 } = ctx.params;
  if (col) return;
  ctx.flat(); ctx.roughness(0.8); ctx.albedo(OAK); ctx.color('oklch(0.72 0.06 150)');
  box(ctx, -w / 2, -0.42 - h, -0.025, w / 2, -0.42, 0.025);
  ctx.color('oklch(0.93 0.03 85)');
  box(ctx, -w / 2 - 0.02, -0.44 - h, -0.03, w / 2 + 0.02, -0.4 - h, 0.03); box(ctx, -w / 2 - 0.02, -0.44, -0.03, w / 2 + 0.02, -0.4, 0.03);
  ctx.albedo(null); ctx.color('oklch(0.7 0.05 75)');
  for (const sx of [-w / 2 + 0.15, w / 2 - 0.15]) box(ctx, sx - 0.012, -0.44, -0.012, sx + 0.012, 0, 0.012);
}
const K = { shelter, trough, bales, rack, lick, sign };
export function geometry(ctx) { (K[ctx.params.kind] || bales)(ctx, false); }
export function collider(ctx) { if (ctx.params.kind === 'sign') return null; (K[ctx.params.kind] || bales)(ctx, true); }
