// The wizard tower's foundation skirt: a ring plinth of big weathered limestone blocks (0.5 m) hugging the root collar, six sloped
// buttresses on the north/east/south-east flanks, ivy trails and clumps climbing the buttresses and 3 m up the wall, moss in the joints.
// Spawned at the tower's own feet and yaw, so angles are the tower's local polar frame (door at DOOR_A, left clear).
// params.gnd: 32 ground heights (local y) at angle i/32·TAU, radius 5.
import { Q, T, solid, TAU, paint, beam, blob, leaf, nrm, crs } from '../lib/yard-kit.js';
import { softened } from "./soften.js";
const LIME = 'cdn/texture-weathered-pale-limestone-surface.png';
const DOOR_A = -Math.PI / 2, H = 17.5, R0 = 3.85, R1 = 2.95;
const rad = (y) => { const t = Math.min(Math.max(y, 0), H) / H; return R0 + (R1 - R0) * t + 0.14 * Math.sin(Math.PI * t); };
const wallR = (y) => (y < 1.05 ? 4.05 + (rad(1.05) + 0.03 - 4.05) * Math.max(0, y - 0.2) / 0.85 : rad(y));
const P = (a, r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
const F = (a) => { const n = [Math.cos(a), Math.sin(a)], t = [-Math.sin(a), Math.cos(a)]; return (u, y, r) => [n[0] * r + t[0] * u, y, n[1] * r + t[1] * u]; };
const RI = 4.02, RO = 4.72, TOPY = 0.5, GAP = 0.42, sA = DOOR_A + GAP, sE = DOOR_A + TAU - GAP;
export const BUT = [-0.8, -0.23, 0.34, 0.91, 1.48, 2.05];
const WALLIVY = [2.6, 3.2, 3.72];
const TINTS = ['oklch(0.95 0.02 85)', 'oklch(0.91 0.025 78)', 'oklch(0.97 0.015 92)', 'oklch(0.93 0.02 70)'];
const LEAVES = ['oklch(0.52 0.12 138)', 'oklch(0.6 0.13 128)', 'oklch(0.45 0.1 145)'];
function stone(ctx, col) { paint(ctx, null, col, 0.93); ctx.albedo(LIME); }
function arcProf(ctx, a0, a1, prof) { solid(ctx, prof.map(([r, y]) => P(a0, r, y)), prof.map(([r, y]) => P(a1, r, y))); }
function gndAt(p, a) { const g = p.gnd; if (!g || !g.length) return 0; const f = (((a % TAU) + TAU) % TAU) / TAU * g.length, i = Math.floor(f), t = f - i; return g[i % g.length] * (1 - t) + g[(i + 1) % g.length] * t; }
function butt(ctx, a, bot, hi) {
  const B = F(a);
  stone(ctx, TINTS[1]);
  solid(ctx, [B(-0.5, bot, 3.9), B(0.5, bot, 3.9), B(0.5, bot, 6.25), B(-0.5, bot, 6.25)], [B(-0.5, 0.3, 3.9), B(0.5, 0.3, 3.9), B(0.5, 0.3, 6.25), B(-0.5, 0.3, 6.25)]);
  stone(ctx, TINTS[2]);
  solid(ctx, [B(-0.4, 0.3, 3.7), B(0.4, 0.3, 3.7), B(0.4, 0.3, 6.0), B(-0.4, 0.3, 6.0)], [B(-0.36, 1.6, 3.7), B(0.36, 1.6, 3.7), B(0.36, 0.62, 5.95), B(-0.36, 0.62, 5.95)]);
  if (hi) { stone(ctx, TINTS[0]); beam(ctx, B(0, 1.72, 3.72), B(0, 0.7, 6.06), 0.9, 0.12); }
}
const capTop = (r) => 0.62 + (1.6 - 0.62) * (5.95 - r) / 2.25 + 0.15;
function ivy(ctx, pts, fine, leaves) {
  // pts: [[x,y,z], out]; stems on fine, leaves both sides every ~0.13 m
  const st = []; for (let i = 0; i < pts.length - 1; i++) { const [a, oa] = pts[i], [b] = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.round(L / 0.13));
    for (let k = 0; k < n; k++) { const t = k / n; st.push([[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], oa, nrm([b[0] - a[0], b[1] - a[1], b[2] - a[2]])]); } }
  if (fine) { paint(ctx, null, 'oklch(0.4 0.06 60)', 0.9); for (let i = 0; i + 2 < st.length; i += 2) beam(ctx, st[i][0], st[i + 2][0], 0.03, 0.03); }
  st.forEach(([p, out, tg], i) => {
    const side = nrm(crs(tg, out)), k = fine ? 2 : 1;
    for (let s = 0; s < k; s++) { const sg = (i + s) % 2 ? 1 : -1, d = nrm([side[0] * sg * 0.8 + tg[0] * 0.45 + out[0] * 0.3, side[1] * sg * 0.8 + tg[1] * 0.45 + out[1] * 0.3, side[2] * sg * 0.8 + tg[2] * 0.45 + out[2] * 0.3]);
      const w = nrm(crs(out, d)), q = [p[0] + out[0] * 0.03, p[1] + out[1] * 0.03, p[2] + out[2] * 0.03], sz = 0.13 + ctx.random() * 0.08;
      leaves[(i + s) % 3].push([q, d, w, sz]); }
  });
}
export const geometry = softened(function geometry(ctx) {
  ctx.flat();
  const L = ctx.lod, hi = L <= 2, fine = L === 1, p = ctx.params || {};
  let gmin = 0; for (const g of p.gnd || [0]) gmin = Math.min(gmin, g); const bot = gmin - 0.25;
  // plinth
  if (hi) {
    let a = sA, i = 0;
    while (a < sE - 0.05) { const w = 0.2 + ctx.random() * 0.12, a1 = Math.min(sE, a + w), g = 0.03 / RO, tj = (ctx.random() - 0.5) * 0.04;
      stone(ctx, TINTS[i++ % 4]); arcProf(ctx, a + g, a1 - g, [[RI, bot], [RO, bot], [RO, TOPY - 0.1 + tj], [RO - 0.1, TOPY + tj], [RI, TOPY + tj]]); a = a1; }
    paint(ctx, null, 'oklch(0.7 0.02 80)', 0.95); arcProf(ctx, sA, sA + 0.001, [[RI, bot], [RO, bot], [RO, 0.3], [RI, 0.3]]);
  } else { stone(ctx, TINTS[0]); const n = 12; for (let i = 0; i < n; i++) arcProf(ctx, sA + (i / n) * (sE - sA), sA + ((i + 1) / n) * (sE - sA), [[RI, bot], [RO, bot], [RO, TOPY], [RI, TOPY]]); }
  for (const a of BUT) butt(ctx, a, bot, hi);
  if (!hi) { paint(ctx, null, LEAVES[0], 0.9); for (const a of BUT) { const c = F(a)(0, capTop(4.1) - 0.1, 4.05); blob(ctx, c[0], c[1], c[2], 0.35, 0.3, 0.35, 4); } return; }
  // moss in the joints
  paint(ctx, 'moss', 'oklch(0.92 0.06 130)', 0.95);
  for (let k = 0; k < 16; k++) { const a = sA + ((k + 0.5) / 16) * (sE - sA), c = P(a, RO - 0.12 - ctx.random() * 0.2, TOPY - 0.03); blob(ctx, c[0], c[1], c[2], 0.2, 0.07, 0.16, 4, () => ctx.random()); }
  for (const a of BUT) { const B = F(a); for (const sd of [-1, 1]) { const c = B(sd * 0.48, 0.28, 6.1); blob(ctx, c[0], c[1], c[2], 0.22, 0.08, 0.18, 4, () => ctx.random()); } }
  // ivy
  const leaves = [[], [], []];
  const clumps = [];
  BUT.forEach((a, bi) => {
    const B = F(a), n = [Math.cos(a), 0, Math.sin(a)], u0 = (ctx.random() - 0.5) * 0.4, u1 = (ctx.random() - 0.5) * 0.3, top = 2.3 + ctx.random() * 0.8, ph = ctx.random() * 6;
    const ga = gndAt(p, a), slopeN = nrm([n[0] * 0.7, 1, n[2] * 0.7]), pts = [];
    pts.push([B(u0, ga - 0.02, 6.29), n], [B(u0, 0.32, 6.29), [0, 1, 0]], [B(u0 * 0.8, 0.34, 6.07), n], [B(u0 * 0.7, capTop(6.0) - 0.05, 6.1), slopeN]);
    for (let r = 5.6; r > 3.9; r -= 0.45) pts.push([B(u0 * 0.5 + Math.sin(r * 3 + ph) * 0.12, capTop(r), r), slopeN]);
    for (let y = capTop(3.9) + 0.1; y <= top; y += 0.28) { const aa = a + (u1 + Math.sin(y * 2.5 + ph) * 0.15) / 3.9; pts.push([P(aa, wallR(y) + 0.04, y), [Math.cos(aa), 0, Math.sin(aa)]]); }
    ivy(ctx, pts, fine, leaves);
    clumps.push(B(u0, ga, 6.35), B(0, capTop(4.0), 3.95));
  });
  for (const a0 of WALLIVY) {
    const n = [Math.cos(a0), 0, Math.sin(a0)], ga = gndAt(p, a0), top = 2.6 + ctx.random() * 0.5, ph = ctx.random() * 6, pts = [];
    pts.push([P(a0, RO + 0.03, ga - 0.02), n], [P(a0, RO + 0.03, TOPY - 0.08), n], [P(a0, 4.45, TOPY + 0.02), [0, 1, 0]], [P(a0, 4.12, TOPY + 0.02), [0, 1, 0]]);
    for (let y = 0.65; y <= top; y += 0.28) { const aa = a0 + Math.sin(y * 2.2 + ph) * 0.05; pts.push([P(aa, wallR(y) + 0.04, y), [Math.cos(aa), 0, Math.sin(aa)]]); }
    ivy(ctx, pts, fine, leaves);
    clumps.push(P(a0, RO + 0.1, ga), P(a0, 4.25, TOPY));
  }
  leaves.forEach((ls, ci) => { paint(ctx, null, LEAVES[ci], 0.8); for (const [q, d, w, sz] of ls) leaf(ctx, q, d, w, sz, sz * 0.42); });
  paint(ctx, null, LEAVES[2], 0.85);
  for (const c of clumps) blob(ctx, c[0], c[1] - 0.05, c[2], 0.32 + ctx.random() * 0.12, 0.26, 0.3, 5, () => ctx.random());
});
export function collider(ctx) {
  const p = ctx.params || {}; let gmin = 0; for (const g of p.gnd || [0]) gmin = Math.min(gmin, g); const bot = gmin - 0.25, n = 14;
  for (let i = 0; i < n; i++) arcProf(ctx, sA + (i / n) * (sE - sA), sA + ((i + 1) / n) * (sE - sA), [[RI, bot], [RO, bot], [RO, TOPY], [RI, TOPY]]);
  for (const a of BUT) { const B = F(a);
    solid(ctx, [B(-0.5, bot, 3.9), B(0.5, bot, 3.9), B(0.5, bot, 6.25), B(-0.5, bot, 6.25)], [B(-0.5, 0.3, 3.9), B(0.5, 0.3, 3.9), B(0.5, 0.3, 6.25), B(-0.5, 0.3, 6.25)]);
    solid(ctx, [B(-0.4, 0.3, 3.7), B(0.4, 0.3, 3.7), B(0.4, 0.3, 6.0), B(-0.4, 0.3, 6.0)], [B(-0.36, 1.6, 3.7), B(0.36, 1.6, 3.7), B(0.36, 0.62, 5.95), B(-0.36, 0.62, 5.95)]); }
}
