// a timber (or limestone) arch draped in climbing vine and blossom, a lantern under the crown.
// passage runs along local Z; posts stand at x = ±span/2. params: { span, height, depth, frame: "oak"|"stone", blossom: oklch }
// the lantern's light is a child row at y = lanternY(params) (see LANTERN_DROP)
import { paint, beam, obox, blob, leaf, gem, lathe, box, nrm, crs, TAU } from '../lib/yard-kit.js';
export const LANTERN_DROP = 0.55;
export const dims = (p = {}) => { const span = p.span ?? 2.4, height = p.height ?? 2.7, rise = Math.min(0.55, span * 0.22); return { span, height, depth: p.depth ?? 0.55, rise, spring: height - rise }; };
export const lanternY = (p) => { const d = dims(p); return d.height - LANTERN_DROP; };
const POST = 0.16;
function crown(d, t) { // point on the arch curve, t 0..1 from -x post to +x post
  const a = Math.PI * (1 - t); return [Math.cos(a) * d.span / 2, d.spring + Math.sin(a) * d.rise];
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, d = dims(p), stone = p.frame === 'stone', rnd = () => ctx.random();
  const blossom = p.blossom || 'oklch(0.9 0.07 350)';
  ctx.flat();
  const hx = d.span / 2, hz = d.depth / 2;
  // footings
  paint(ctx, 'stone', 'oklch(0.93 0.02 85)', 0.92);
  for (const sx of [-1, 1]) obox(ctx, sx * hx, 0, 0, POST + 0.18, 0.12, d.depth + 0.18);
  // posts: front and back pair per side, tied by cross rails
  paint(ctx, stone ? 'stone' : 'oak', stone ? 'oklch(0.94 0.02 85)' : 'oklch(0.93 0.04 70)', 0.8);
  const pz = lod >= 5 ? [0] : [-hz, hz], pw = lod >= 5 ? d.depth : POST;
  for (const sx of [-1, 1]) for (const z of pz) {
    obox(ctx, sx * hx, 0.1, z, POST, d.spring - 0.1, pw);
    if (lod <= 2) { const c = [sx * hx, d.spring, z]; gem(ctx, c[0], c[1], c[2], POST * 0.6, 0.05, 0.01, 4); }
  }
  if (lod <= 4) for (const sx of [-1, 1]) for (const y of [0.9, d.spring - 0.25]) obox(ctx, sx * hx, y, 0, POST * 0.7, 0.1, d.depth + 0.1);
  // crown: segmented bent beams front and back, slats across
  const segs = lod <= 2 ? 10 : lod <= 4 ? 6 : 3;
  for (const z of pz) for (let i = 0; i < segs; i++) {
    const [x0, y0] = crown(d, i / segs), [x1, y1] = crown(d, (i + 1) / segs);
    beam(ctx, [x0, y0, z], [x1, y1, z], lod >= 5 ? d.depth : POST * 0.9, 0.14);
  }
  if (lod <= 3) {
    paint(ctx, stone ? 'stone' : 'walnut', stone ? 'oklch(0.92 0.02 85)' : 'oklch(0.92 0.03 55)', 0.8);
    const ns = lod === 1 ? 9 : 5;
    for (let i = 0; i < ns; i++) { const [x, y] = crown(d, (i + 0.5) / ns); beam(ctx, [x, y + 0.08, -hz - 0.12], [x, y + 0.08, hz + 0.12], 0.07, 0.06); }
  }
  // vines: stems wind up each post pair and over the crown; leaves and blossoms along them
  const path = []; // centreline points of the vine, up the -x post, over, down the +x post
  const up = lod <= 2 ? 10 : 5;
  for (let i = 0; i <= up; i++) path.push([-hx, 0.1 + (d.spring - 0.1) * i / up]);
  for (let i = 1; i < segs; i++) path.push(crown(d, i / segs));
  for (let i = up; i >= 0; i--) path.push([hx, 0.1 + (d.spring - 0.1) * i / up * (0.55 + 0.45 * (i / up))]); // the +x side climbs less far
  const leafCol = ['oklch(0.93 0.06 135)', 'oklch(0.9 0.07 145)', 'oklch(0.95 0.05 125)'];
  if (lod <= 3) {
    const perStep = lod === 1 ? 5 : lod === 2 ? 3 : 0;
    for (const z of pz) {
      if (lod <= 2) {
        paint(ctx, null, 'oklch(0.45 0.07 90)', 0.9);
        for (let i = 0; i < path.length - 1; i++) {
          const w = (k) => [path[k][0] + Math.sin(k * 1.7 + z * 9) * 0.07, path[k][1], z + Math.cos(k * 1.7) * 0.1];
          beam(ctx, w(i), w(i + 1), 0.022, 0.022);
        }
      }
      for (let i = 0; i < path.length; i++) {
        const [x, y] = path[i];
        const onPost = Math.abs(Math.abs(x) - hx) < 0.01 && y < d.spring - 0.05;
        if (perStep === 0) { // lod 3: leaf clumps
          if (i % 2) continue;
          paint(ctx, 'leaf', leafCol[i % 3], 0.8); blob(ctx, x, y - 0.12, z, 0.2, 0.26, 0.2, 5, rnd); continue;
        }
        paint(ctx, 'leaf', leafCol[i % 3], 0.8);
        for (let k = 0; k < perStep; k++) {
          const a = rnd() * TAU, r = 0.08 + rnd() * 0.1;
          const base = [x + (onPost ? Math.cos(a) * r : (rnd() - 0.5) * 0.25), y + (rnd() - 0.5) * 0.25 - (onPost ? 0 : 0.05), z + Math.sin(a) * r];
          const out = nrm([onPost ? Math.cos(a) : (rnd() - 0.5), onPost ? 0.35 : -0.6 - rnd() * 0.4, Math.sin(a)]);
          const side = nrm(crs(out, [0, 1, 0.001]));
          leaf(ctx, base, out, side, 0.13 + rnd() * 0.06, 0.05);
        }
        if (rnd() < (onPost ? 0.35 : 0.6)) {
          paint(ctx, null, blossom, 0.7);
          const bx = x + (rnd() - 0.5) * 0.3, by = y - (onPost ? 0 : 0.12) + (rnd() - 0.5) * 0.2, bz = z + (rnd() - 0.5) * 0.3;
          gem(ctx, bx, by, bz, 0.04, 0.025, 0.02, 5);
          paint(ctx, null, 'oklch(0.9 0.14 90)', 0.7); gem(ctx, bx, by + 0.02, bz, 0.012, 0.01, 0.005, 4);
        }
        if (!onPost && lod === 1 && rnd() < 0.45) { // trailing tendril from the crown
          paint(ctx, 'leaf', leafCol[(i + 1) % 3], 0.8);
          const L = 0.25 + rnd() * 0.45;
          for (let s = 0; s < 3; s++) leaf(ctx, [x, y - 0.1 - s * L / 3, z + (rnd() - 0.5) * 0.2], [0, -1, 0], [1, 0, 0], L / 3 + 0.04, 0.045);
        }
      }
    }
  } else { // far: a leafy band over the crown
    paint(ctx, 'leaf', leafCol[0], 0.85);
    for (const sx of [-1, 0, 1]) { const [x, y] = sx ? [sx * hx, d.spring - 0.3] : [0, d.height - 0.05]; blob(ctx, x, y - 0.2, 0, 0.3, 0.4, d.depth * 0.7 + 0.15, 4); }
  }
  // lantern: chain, brass cap, warm glass
  const ly = lanternY(p);
  paint(ctx, 'brass', 'oklch(0.93 0.05 80)', 0.45, 0.7);
  if (lod <= 3) beam(ctx, [0, d.height - 0.04, 0], [0, ly + 0.2, 0], 0.015, 0.015);
  const n = lod <= 2 ? 6 : 4;
  lathe(ctx, [[0.1, ly + 0.14], [0.13, ly + 0.16], [0.02, ly + 0.26]], n);
  lathe(ctx, [[0.02, ly - 0.14], [0.1, ly - 0.12], [0.1, ly - 0.1]], n);
  if (lod <= 2) for (let i = 0; i < n; i++) { const a = i / n * TAU + Math.PI / n; beam(ctx, [Math.cos(a) * 0.1, ly - 0.1, Math.sin(a) * 0.1], [Math.cos(a) * 0.1, ly + 0.14, Math.sin(a) * 0.1], 0.014, 0.014); }
  ctx.albedo(null); ctx.color('oklch(0.97 0.05 80)'); ctx.roughness(0.2); ctx.metalness(0);
  ctx.emissive(2.4, 1.35, 0.5);
  lathe(ctx, [[0, ly - 0.1], [0.085, ly - 0.09], [0.095, ly + 0.02], [0.085, ly + 0.13], [0, ly + 0.14]], n);
  ctx.emissive(null);
}
export function collider(ctx) {
  const d = dims(ctx.params || {}), hx = d.span / 2, hz = d.depth / 2 + 0.09, w = POST / 2 + 0.09;
  for (const sx of [-1, 1]) box(ctx, sx * hx - w, 0, -hz, sx * hx + w, d.spring, hz);
}
