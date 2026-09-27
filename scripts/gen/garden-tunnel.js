// A walk-through garden tunnel: iron hoops on oak footings, oak runners, climbing vines in leaf,
// hanging wisteria and white roses. Length runs along local Z; feet at ground, centred.
import { beam, paint, box, gem, Q, T } from '../lib/garden-kit.js';
const LEN = 9, HW = 1.3, LEG = 1.15, N = 7, LTOT = 2 * LEG + Math.PI * HW;
const GREENS = ['oklch(0.52 0.11 135)', 'oklch(0.6 0.12 128)', 'oklch(0.45 0.09 140)', 'oklch(0.66 0.12 122)', 'oklch(0.56 0.1 145)'];
function S(u) { // arc-length along the hoop profile → [x, y], outward normal
  if (u < LEG) return [[HW, u], [1, 0]];
  if (u < LEG + Math.PI * HW) { const a = (u - LEG) / HW; return [[HW * Math.cos(a), LEG + HW * Math.sin(a)], [Math.cos(a), Math.sin(a)]]; }
  return [[-HW, LEG - (u - LEG - Math.PI * HW)], [-1, 0]];
}
const prof = (segs) => { const P = [[HW, 0], [HW, LEG]]; for (let i = 1; i < segs; i++) { const a = i / segs * Math.PI; P.push([HW * Math.cos(a), LEG + HW * Math.sin(a)]); } P.push([-HW, LEG], [-HW, 0]); return P; };
const hz = (i) => -LEN / 2 + i * LEN / (N - 1);
function shell(ctx, segs, slices, off) {
  const P = prof(segs).map(([x, y]) => { const l = Math.hypot(x, y - LEG); return y > LEG ? [x * (HW + off) / HW, LEG + (y - LEG) * (HW + off) / HW] : [x + Math.sign(x) * off, y]; });
  for (let s = 0; s < slices; s++) {
    const z0 = -LEN / 2 + s * LEN / slices, z1 = z0 + LEN / slices, o = [0, LEG, (z0 + z1) / 2];
    for (let i = 0; i < P.length - 1; i++) Q(ctx, [P[i][0], P[i][1], z0], [P[i + 1][0], P[i + 1][1], z0], [P[i + 1][0], P[i + 1][1], z1], [P[i][0], P[i][1], z1], o);
  }
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, rnd = () => ctx.random(); ctx.flat();
  if (lod >= 5) { paint(ctx, null, GREENS[0], 0.9); shell(ctx, 3, 1, 0.1); return; }
  // hoops
  paint(ctx, null, 'oklch(0.3 0.012 250)', 0.6, 0.5);
  for (let i = 0; i < N; i++) { const P = prof(lod <= 2 ? 12 : lod <= 3 ? 6 : 4), z = hz(i); for (let k = 0; k < P.length - 1; k++) beam(ctx, [P[k][0], P[k][1], z], [P[k + 1][0], P[k + 1][1], z], lod <= 3 ? 0.05 : 0.08); }
  if (lod >= 4) { paint(ctx, null, GREENS[1], 0.9); shell(ctx, 4, 3, 0.1); return; }
  // oak footings on stone pads, oak runners
  for (let i = 0; i < N; i++) for (const sx of [-1, 1]) {
    const x = sx * HW, z = hz(i), gy = Math.min(ctx.groundY(x, z), 0);
    if (lod <= 2) { paint(ctx, 'stone', 'oklch(0.93 0.015 85)', 0.9); box(ctx, x - 0.13, gy - 0.1, z - 0.13, x + 0.13, 0.05, z + 0.13); }
    paint(ctx, 'oak', 'oklch(0.93 0.03 75)', 0.8); box(ctx, x - 0.07, gy, z - 0.07, x + 0.07, 0.5, z + 0.07);
  }
  paint(ctx, 'oak', 'oklch(0.93 0.03 75)', 0.8);
  for (const u of [0.55, LEG + HW * 0.35, LEG + HW * Math.PI * 0.3, LEG + HW * Math.PI * 0.5, LEG + HW * Math.PI * 0.7, LEG + HW * (Math.PI - 0.35), LTOT - 0.55]) {
    const [[x, y], [nx, ny]] = S(u), o = 0.045; beam(ctx, [x + nx * o, y + ny * o, -LEN / 2 - 0.08], [x + nx * o, y + ny * o, LEN / 2 + 0.08], 0.05, 0.04);
  }
  if (lod === 3) { paint(ctx, null, GREENS[2], 0.9); shell(ctx, 6, 4, 0.06); }
  // climbing stems up each leg
  if (lod <= 2) {
    paint(ctx, null, 'oklch(0.42 0.05 80)', 0.9);
    for (let i = 0; i < N; i++) for (const sx of [-1, 1]) {
      let prev = null; const z0 = hz(i);
      for (let k = 0; k <= 8; k++) {
        const u = (k / 8) * (LTOT / 2 - 0.2), uu = sx > 0 ? u : LTOT - u, [[x, y], [nx, ny]] = S(uu), w = Math.sin(k * 1.7 + i) * 0.09;
        const pnt = [x + nx * 0.06, y + ny * 0.06, z0 + 0.12 + w]; if (prev) beam(ctx, prev, pnt, 0.028); prev = pnt;
      }
    }
  }
  // leaves
  const NL = [1900, 950, 380][lod - 1], ls = [1, 1.3, 1.9][lod - 1];
  for (let n = 0; n < NL; n++) {
    let u = rnd() * LTOT; const [[x, y], [nx, ny]] = S(u);
    if (y < 0.5 && rnd() < 0.65) continue;
    const z = (rnd() - 0.5) * (LEN + 0.3), inside = rnd() < 0.22, off = inside ? -(0.03 + rnd() * 0.05) : 0.04 + rnd() * 0.15;
    const c = [x + nx * off, y + ny * off, z], tg = [-ny, nx], phi = rnd() * 6.283, cp = Math.cos(phi), sp = Math.sin(phi);
    const al = [tg[0] * sp, tg[1] * sp, cp], sd = [tg[0] * cp, tg[1] * cp, -sp], L = (0.12 + rnd() * 0.1) * ls, W = L * 0.55, lift = 0.05 * rnd();
    const nn = [nx, ny, 0], add = (a, v, k) => [a[0] + v[0] * k, a[1] + v[1] * k, a[2] + v[2] * k];
    ctx.color(GREENS[Math.floor(rnd() * GREENS.length)]); ctx.albedo(null); ctx.roughness(0.8); ctx.metalness(0);
    Q(ctx, add(c, al, -L * 0.35), add(c, sd, W), add(add(c, al, L), nn, lift), add(c, sd, -W), add(c, nn, -1));
  }
  // wisteria racemes
  const NW = [120, 60, 24][lod - 1], tiers = lod <= 1 ? 4 : 3;
  for (let n = 0; n < NW; n++) {
    const a = 0.35 + rnd() * (Math.PI - 0.7), u = LEG + a * HW, [[x, y], [nx, ny]] = S(u), inside = rnd() < 0.45 && a > 0.8 && a < Math.PI - 0.8;
    const off = inside ? -0.06 : 0.1 + rnd() * 0.06, z = (rnd() - 0.5) * LEN, bx = x + nx * off, by = y + ny * off, Lr = inside ? 0.25 + rnd() * 0.15 : 0.32 + rnd() * 0.25;
    for (let k = 0; k < tiers; k++) {
      const t = k / (tiers - 1); ctx.albedo(null); ctx.color(`oklch(${(0.55 + t * 0.25).toFixed(2)} ${(0.15 - t * 0.07).toFixed(2)} ${300 + t * 6})`); ctx.roughness(0.7);
      gem(ctx, bx + Math.sin(k + n) * 0.012, by - Lr * (k + 0.5) / tiers, z, 0.075 * (1 - t * 0.55), Lr / (tiers * 1.6), Lr / (tiers * 1.6), lod <= 1 ? 5 : 4);
    }
  }
  // white roses on the lower sides
  const NR = [100, 50, 20][lod - 1];
  for (let n = 0; n < NR; n++) {
    const side = rnd() < 0.5, u0 = 0.45 + rnd() * (LEG + 0.5), u = side ? u0 : LTOT - u0, [[x, y], [nx, ny]] = S(u), z = (rnd() - 0.5) * LEN, off = 0.14 + rnd() * 0.07;
    const c = [x + nx * off, y + ny * off, z], blush = rnd() < 0.2;
    ctx.albedo(null); ctx.color(blush ? 'oklch(0.9 0.05 10)' : 'oklch(0.97 0.012 95)'); ctx.roughness(0.7);
    gem(ctx, c[0], c[1], c[2], 0.07, 0.035, 0.05, lod <= 1 ? 6 : 5);
    if (lod <= 1) { ctx.color('oklch(0.93 0.05 90)'); gem(ctx, c[0] + nx * 0.02, c[1] + 0.02, c[2], 0.038, 0.04, 0.01, 5); }
  }
  ctx.albedo(null);
}
export function collider(ctx) {
  for (let i = 0; i < N; i++) for (const sx of [-1, 1]) { const x = sx * HW, z = hz(i); box(ctx, x - 0.09, 0, z - 0.09, x + 0.09, LEG + 0.2, z + 0.09); }
}
