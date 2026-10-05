// The sunflower & corn maze: every wall of scripts/lib/maze.js grown as two staggered rows of late-summer corn round a dense
// leafy core, sunflowers nodding out of the rows (thick on the outer border, a few inside). Origin = maze centre at ground.
import { mazeWalls } from '../lib/maze.js';
import { box } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const TAU = Math.PI * 2;
function stalk(ctx, x, z, h, r0, lx, lz, n) {
  const ring = (y, r, t) => { const a = []; for (let i = 0; i < n; i++) { const q = (i / n) * TAU; a.push([x + lx * t + Math.cos(q) * r, y, z + lz * t + Math.sin(q) * r]); } return a; };
  const A = ring(0, r0, 0), B = ring(h, r0 * 0.4, 1);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.quad(...A[i], ...A[j], ...B[j], ...B[i]); }
}
function leaf(ctx, x, y, z, ang, len, droop) {
  const dx = Math.cos(ang), dz = Math.sin(ang), px = -dz * 0.06, pz = dx * 0.06;
  const m = [x + dx * len * 0.5, y + len * 0.18, z + dz * len * 0.5], e = [x + dx * len, y - droop, z + dz * len];
  ctx.tri(x - px, y, z - pz, x + px, y, z + pz, m[0] + px * 0.8, m[1], m[2] + pz * 0.8);
  ctx.tri(x - px, y, z - pz, m[0] + px * 0.8, m[1], m[2] + pz * 0.8, m[0] - px * 0.8, m[1], m[2] - pz * 0.8);
  ctx.tri(m[0] - px * 0.8, m[1], m[2] - pz * 0.8, m[0] + px * 0.8, m[1], m[2] + pz * 0.8, ...e);
}
function corn(ctx, x, z, lod) {
  const h = 2.5 + ctx.random() * 0.6, lx = (ctx.random() - 0.5) * 0.18, lz = (ctx.random() - 0.5) * 0.18;
  const g = 0.58 + ctx.random() * 0.08;
  ctx.color(`oklch(${g.toFixed(3)} 0.12 ${Math.round(118 + ctx.random() * 14)})`);
  stalk(ctx, x, z, h, 0.035, lx, lz, lod <= 2 ? 4 : 3);
  const leaves = lod <= 1 ? 4 : lod <= 2 ? 3 : 2;
  for (let i = 0; i < leaves; i++) {
    const t = 0.25 + (i / leaves) * 0.65, yellow = ctx.random() < 0.22;
    ctx.color(yellow ? 'oklch(0.74 0.12 95)' : `oklch(${(0.56 + ctx.random() * 0.1).toFixed(3)} 0.14 ${Math.round(125 + ctx.random() * 15)})`);
    leaf(ctx, x + lx * t, h * t, z + lz * t, ctx.random() * TAU, 0.55 + ctx.random() * 0.35, 0.25 + ctx.random() * 0.3);
  }
  if (lod <= 2) {
    ctx.color('oklch(0.8 0.12 82)'); // tassel
    const tx = x + lx, tz = z + lz;
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + ctx.random(); ctx.tri(tx, h, tz, tx + Math.cos(a) * 0.04, h + 0.02, tz + Math.sin(a) * 0.04, tx + Math.cos(a) * 0.14, h + 0.28, tz + Math.sin(a) * 0.14); }
    if (lod <= 1 && ctx.random() < 0.55) { // an ear in its husk
      ctx.color('oklch(0.78 0.1 105)');
      const y = h * 0.5, a = ctx.random() * TAU, ex = x + lx * 0.5 + Math.cos(a) * 0.05, ez = z + lz * 0.5 + Math.sin(a) * 0.05;
      const tip = [ex + Math.cos(a) * 0.12, y + 0.26, ez + Math.sin(a) * 0.12], w = 0.045;
      ctx.tri(ex - w, y, ez, ex + w, y, ez, ...tip); ctx.tri(ex, y, ez - w, ex, y, ez + w, ...tip);
    }
  }
}
function sunflower(ctx, x, z, lod, face) {
  const h = 2.7 + ctx.random() * 0.8, lx = (ctx.random() - 0.5) * 0.12, lz = (ctx.random() - 0.5) * 0.12;
  ctx.color('oklch(0.55 0.11 128)');
  stalk(ctx, x, z, h, 0.045, lx, lz, lod <= 2 ? 5 : 3);
  for (let i = 0; i < (lod <= 2 ? 3 : 1); i++) { ctx.color('oklch(0.55 0.13 132)'); leaf(ctx, x + lx * 0.5, h * (0.35 + i * 0.2), z + lz * 0.5, ctx.random() * TAU, 0.35, 0.12); }
  // head: faces `face` (radians, direction in xz), tipped a little down
  const cx = x + lx + Math.cos(face) * 0.08, cz = z + lz + Math.sin(face) * 0.08, cy = h + 0.05;
  const f = [Math.cos(face) * 0.94, -0.34, Math.sin(face) * 0.94], u = [-Math.sin(face), 0, Math.cos(face)];
  const v = [f[1] * u[2] - f[2] * u[1], f[2] * u[0] - f[0] * u[2], f[0] * u[1] - f[1] * u[0]];
  const P = (a, r, d = 0) => [cx + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r + f[0] * d, cy + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r + f[1] * d, cz + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r + f[2] * d];
  const R = 0.15 + ctx.random() * 0.05, seg = lod <= 2 ? 10 : 6, C = [cx + f[0] * 0.03, cy + f[1] * 0.03, cz + f[2] * 0.03];
  ctx.color('oklch(0.32 0.06 55)');
  for (let i = 0; i < seg; i++) ctx.tri(...C, ...P((i / seg) * TAU, R), ...P(((i + 1) / seg) * TAU, R));
  ctx.color('oklch(0.45 0.1 128)'); const B = [cx - f[0] * 0.05, cy - f[1] * 0.05, cz - f[2] * 0.05];
  for (let i = 0; i < seg; i++) ctx.tri(...B, ...P(((i + 1) / seg) * TAU, R), ...P((i / seg) * TAU, R));
  const petals = lod <= 2 ? 14 : 8;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * TAU + ctx.random() * 0.1, w = TAU / petals * 0.45;
    ctx.color(`oklch(${(0.8 + ctx.random() * 0.06).toFixed(3)} 0.17 ${Math.round(84 + ctx.random() * 10)})`);
    ctx.tri(...P(a - w, R * 0.95), ...P(a + w, R * 0.95), ...P(a, R * 2.1, -0.03));
  }
}
export const geometry = softened(function geometry(ctx) {
  const p = { n: 11, cell: 3, seed: 7, ...ctx.params }, lod = ctx.lod ?? 1, M = mazeWalls(p);
  ctx.flat(); ctx.roughness(0.9);
  // the leafy core every wall has: you never see daylight through a row
  ctx.albedo('cdn/texture-dense-green-corn-stalks-and-leaves.png'); ctx.color('oklch(0.93 0.03 125)');
  const core = lod >= 5 ? 2.7 : 2.1, t = 0.2;
  for (const [x0, z0, x1, z1] of M.walls) box(ctx, Math.min(x0, x1) - t, 0, Math.min(z0, z1) - t, Math.max(x0, x1) + t, core, Math.max(z0, z1) + t);
  if (lod >= 5) return;
  ctx.albedo(null);
  const sp = lod <= 1 ? 0.3 : lod <= 2 ? 0.42 : lod <= 3 ? 0.65 : 1.1;
  for (const [x0, z0, x1, z1] of M.walls) {
    const len = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / len, dz = (z1 - z0) / len, nx = -dz, nz = dx;
    const border = Math.abs(Math.abs(x0) - M.H) < 0.01 && Math.abs(x0 - x1) < 0.01 || Math.abs(Math.abs(z0) - M.H) < 0.01 && Math.abs(z0 - z1) < 0.01;
    for (const side of [-1, 1]) for (let s = (side > 0 ? sp / 2 : 0); s <= len; s += sp) {
      const o = side * (0.28 + ctx.random() * 0.06), j = (ctx.random() - 0.5) * sp * 0.4;
      const x = x0 + dx * (s + j) + nx * o, z = z0 + dz * (s + j) + nz * o;
      if (lod >= 4) { corn(ctx, x, z, lod); continue; }
      // sunflowers: thick along the outer face of the border, scattered inside, heads turned to the path they face
      const outerFace = border && Math.sign(x * nx + z * nz) === side;
      if (ctx.random() < (outerFace ? 0.45 : 0.07)) sunflower(ctx, x, z, lod, Math.atan2(nz * side, nx * side) + (ctx.random() - 0.5) * 0.8);
      else corn(ctx, x, z, lod);
    }
  }
});
export function collider(ctx) {
  const p = { n: 11, cell: 3, seed: 7, ...ctx.params }, M = mazeWalls(p), t = 0.4;
  for (const [x0, z0, x1, z1] of M.walls) box(ctx, Math.min(x0, x1) - t, -0.3, Math.min(z0, z1) - t, Math.max(x0, x1) + t, 3.2, Math.max(z0, z1) + t);
}
