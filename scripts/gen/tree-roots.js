// Surface roots for a great tree: a bark collar that swallows the trunk's footing, buttress roots flaring out
// and arching down into the soil, moss on roots and collar, fern patches and mushroom clusters between roots.
// Feet at the trunk base centre (same frame as the tree row). params: { trunkR, roots: [[angle, reach, width]],
// ferns: [[angle, r, size]], shrooms: [[angle, r, count]] } — angles radians, atan2(z, x). No collider:
// the roots stand knee-high at the trunk, so bodies wade through rather than trip.
import { Q } from '../lib/road-solid.js';
import { lathe } from '../lib/garden-kit.js';
import { BARK, rng, mossPad, fernClump, mushroom } from '../lib/bloom-kit.js';
const bark = (c) => { c.albedo(BARK); c.color('oklch(0.72 0.04 60)'); c.roughness(0.95); c.metalness(0); c.emissive(null); };
function root(ctx, a, reach, w, r0, lod, R) {
  const N = lod <= 1 ? 8 : lod <= 3 ? 5 : 3, d = [Math.cos(a), Math.sin(a)], s = [-d[1], d[0]], bend = (R() - 0.5) * 0.7;
  const secs = [], ridge = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, r = r0 + (reach - r0) * t, lat = Math.sin(t * Math.PI) * bend;
    const H = 0.95 * (1 - t) ** 2 + 0.2 * Math.sin(Math.PI * t) * (1 - 0.3 * t) - 0.16 * t ** 3, W = w * (1 - 0.78 * t);
    const cx = d[0] * r + s[0] * lat, cz = d[1] * r + s[1] * lat;
    const P = (u, y) => [cx + s[0] * u, y, cz + s[1] * u];
    secs.push([P(-W / 2, -0.25), P(-W * 0.4, H * 0.62), P(0, H), P(W * 0.4, H * 0.62), P(W / 2, -0.25)]);
    ridge.push([cx, H, cz, W]);
  }
  bark(ctx);
  for (let i = 0; i < N; i++) { const o = [ridge[i][0], -0.3, ridge[i][2]]; for (let k = 0; k < 4; k++) Q(ctx, secs[i][k], secs[i][k + 1], secs[i + 1][k + 1], secs[i + 1][k], o); }
  return ridge;
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, p = ctx.params, R = rng(ctx.seed || 3), TR = p.trunkR ?? 1.35; ctx.flat();
  // collar: hides the prism footing and the shelf where the trunk steps in
  bark(ctx);
  const n = lod <= 2 ? 14 : 8;
  lathe(ctx, [[TR + 0.5, -0.12], [TR + 0.27, 0.3], [TR + 0.09, 0.62], [TR * 0.82, 0.86], [TR * 0.66, 1.15], [TR * 0.63, 1.45]], n, [0, 0, 0], 0.2);
  const ridges = (p.roots || []).map(([a, reach, w]) => root(ctx, a, reach, w, TR * 0.8, lod, R));
  if (lod >= 4) return;
  // moss on the roots' shoulders and in the collar's lap
  for (const rg of ridges) for (let i = 1; i < rg.length - 2; i += lod <= 2 ? 1 : 2) if (R() < 0.7) { const [x, y, z, W] = rg[i]; mossPad(ctx, x, y - 0.05, z, W * (0.35 + R() * 0.25), lod); }
  for (let i = 0; i < (lod <= 2 ? 9 : 5); i++) { const a = R() * Math.PI * 2, r = TR + 0.2 + R() * 0.2; mossPad(ctx, Math.cos(a) * r, 0.2 + R() * 0.3, Math.sin(a) * r, 0.25 + R() * 0.15, lod, 'oklch(0.7 0.12 128)'); }
  if (lod >= 3) return;
  for (const [a, r, sz] of p.ferns || []) for (let j = 0; j < 3; j++) {
    const aa = a + (j - 1) * 0.16, rr = r + (R() - 0.5) * 0.6;
    fernClump(ctx, [Math.cos(aa) * rr, 0.02, Math.sin(aa) * rr], sz * (0.8 + R() * 0.4), lod, R, `oklch(${0.56 + R() * 0.08} 0.13 ${132 + R() * 12})`);
  }
  let mi = 0;
  for (const [a, r, cnt] of p.shrooms || []) for (let j = 0; j < cnt; j++) {
    const aa = a + (R() - 0.5) * 0.25, rr = r + (R() - 0.5) * 0.35, h = 0.07 + R() * 0.1;
    mushroom(ctx, Math.cos(aa) * rr, 0, Math.sin(aa) * rr, h, h * (0.7 + R() * 0.4), lod, mi++);
  }
  ctx.albedo(null);
}
export function collider() { return null; }
