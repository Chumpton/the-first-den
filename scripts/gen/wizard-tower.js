// The wizard's watchtower on the east lawn: a leaning, twisting limestone tower on a walnut root collar,
// an arched oak door (west, local -Z), glowing dormers spiralling up, an observatory balcony at H,
// a crooked shingled witch-hat roof with a brass star, and a portal room on the ground floor.
// params.part: "rune" draws one orbiting rune stone instead. Origin: tower axis at ground level.
import { Q, T, solid, gem, TAU, paint, beam, obox, lathe, leaf, nrm, crs } from '../lib/yard-kit.js';

export const TOWER = { H: 17.5, R0: 3.85, R1: 2.95, RIN: 3.2, CEIL: 3.6, DRUM_R: 2.35, DRUM_H: 2.3, BAL_R: 4.0, EAVE: 3.05, HAT: 6.2, LEAN: [0.28, -0.08], DOOR_A: -Math.PI / 2, WALK_R: 3.1 };
const { H, R0, R1, RIN, CEIL, DRUM_R, DRUM_H, BAL_R, EAVE, HAT, DOOR_A } = TOWER;
const P2 = Math.PI / 2, Z0 = [0, 0];
const LIME = 'cdn/texture-weathered-pale-limestone-surface.png';
const GLOW = 'oklch(0.85 0.1 75)', TEAL = 'oklch(0.78 0.13 195)', SHINGLE = 'oklch(0.42 0.08 240)';
export const cen = (y) => { const s = Math.min(Math.max(y, 0), H) / H; return [TOWER.LEAN[0] * s * s, TOWER.LEAN[1] * s * s]; };
export const rad = (y) => { const t = Math.min(Math.max(y, 0), H) / H; return R0 + (R1 - R0) * t + 0.14 * Math.sin(Math.PI * t); };
const pol = (a, r, y, c = cen(y)) => [c[0] + Math.cos(a) * r, y, c[1] + Math.sin(a) * r];
const loop = (n, r, y, c = cen(y), rot = 0) => { const p = []; for (let i = 0; i < n; i++) p.push(pol(rot + (i / n) * TAU, r, y, c)); return p; };
const ov = (n, rx, rz, y) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; p.push([Math.cos(a) * rx, y, Math.sin(a) * rz]); } return p; };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const frame = (a, y) => { const c = cen(y), n = [Math.cos(a), 0, Math.sin(a)], t = [-Math.sin(a), 0, Math.cos(a)]; return (u, yy, r) => [c[0] + n[0] * r + t[0] * u, yy, c[1] + n[2] * r + t[2] * u]; };
const fbox = (ctx, P, u0, u1, y0, y1, r0, r1) => solid(ctx, [P(u0, y0, r0), P(u1, y0, r0), P(u1, y0, r1), P(u0, y0, r1)], [P(u0, y1, r0), P(u1, y1, r0), P(u1, y1, r1), P(u0, y1, r1)]);
const arcBlock = (ctx, a0, a1, y0, y1, ri, ro) => solid(ctx, [pol(a0, ri, y0), pol(a0, ro, y0), pol(a1, ro, y0), pol(a1, ri, y0)], [pol(a0, ri, y1), pol(a0, ro, y1), pol(a1, ro, y1), pol(a1, ri, y1)]);
const emit = (ctx, css) => ctx.emissive(css);

export const WIN = []; for (let j = 0; j < 6; j++) WIN.push({ a: DOOR_A + 0.95 + j * 1.3, y: 5.0 + j * 1.95 });
const OPEN = [
  { a: DOOR_A, y0: -1, y1: 3.0, pk: 0, hw: (y) => (y < 2.1 ? 0.9 : Math.sqrt(Math.max(0, 0.81 - (y - 2.1) ** 2))) },
  { a: DOOR_A, y0: 3.65, y1: 4.55, pk: 4.1, hw: (y) => Math.sqrt(Math.max(0, 0.2025 - (y - 4.1) ** 2)) },
  ...WIN.map((w) => ({ a: w.a, y0: w.y, y1: w.y + 1.2, pk: w.y, hw: (y) => (y < w.y + 0.75 ? 0.37 : Math.max(0, 0.37 * (1 - (y - w.y - 0.75) / 0.45))) })),
];
const SHELVES = [[DOOR_A + 0.62, P2 - 0.5], [P2 + 0.5, DOOR_A + TAU - 0.62]];
const inShelf = (a) => SHELVES.some(([s, e]) => a >= s && a <= e);
const wrapNear = (x, ref) => x + Math.round((ref - x) / TAU) * TAU;
function spans(a0, a1, y0, y1, r) {
  let out = [[a0, a1]];
  for (const o of OPEN) {
    if (y1 <= o.y0 || y0 >= o.y1) continue;
    const ya = Math.max(y0, o.y0), yb = Math.min(y1, o.y1);
    const hw = Math.max(o.hw(ya), o.hw(yb), o.hw((ya + yb) / 2), o.hw(Math.min(Math.max(o.pk, ya), yb))) + 0.02;
    if (hw <= 0.03) continue;
    const c = wrapNear(o.a, (a0 + a1) / 2), h = hw / r, lo = c - h, hi = c + h, nx = [];
    for (const [s, e] of out) { if (hi <= s || lo >= e) { nx.push([s, e]); continue; } if (lo > s) nx.push([s, lo]); if (hi < e) nx.push([hi, e]); }
    out = nx;
  }
  return out.filter(([s, e]) => e - s > 0.015);
}
function block(ctx, a0, a1, y0, y1, ri, ro, ch) {
  if (!ch) return arcBlock(ctx, a0, a1, y0, y1, ri, ro);
  const rm = ro - ch, c = cen((y0 + y1) / 2), da = Math.min(ch / ro, (a1 - a0) * 0.3);
  arcBlock(ctx, a0, a1, y0, y1, ri, rm);
  solid(ctx, [pol(a0, rm, y0, c), pol(a1, rm, y0, c), pol(a1, rm, y1, c), pol(a0, rm, y1, c)], [pol(a0 + da, ro, y0 + ch, c), pol(a1 - da, ro, y0 + ch, c), pol(a1 - da, ro, y1 - ch, c), pol(a0 + da, ro, y1 - ch, c)]);
}
function torus(ctx, C, ax, h, v, rt, f0, f1, nP, nS) {
  const nz = [ax[2], 0, -ax[0]];
  const pt = (i, k) => { const f = f0 + (i / nP) * (f1 - f0), g = (k / nS) * TAU, cf = Math.cos(f), sf = Math.sin(f), cg = Math.cos(g), sg = Math.sin(g);
    return [C[0] + ax[0] * (h + rt * cg) * cf + nz[0] * rt * sg, C[1] + (v + rt * cg) * sf, C[2] + ax[2] * (h + rt * cg) * cf + nz[2] * rt * sg]; };
  for (let i = 0; i < nP; i++) { const fm = f0 + ((i + 0.5) / nP) * (f1 - f0), o = [C[0] + ax[0] * h * Math.cos(fm), C[1] + v * Math.sin(fm), C[2] + ax[2] * h * Math.cos(fm)];
    for (let k = 0; k < nS; k++) Q(ctx, pt(i, k), pt(i + 1, k), pt(i + 1, k + 1), pt(i, k + 1), o); }
  return (f, off = 0) => [C[0] + ax[0] * h * Math.cos(f) + nz[0] * off, C[1] + v * Math.sin(f), C[2] + ax[2] * h * Math.cos(f) + nz[2] * off];
}
function star(ctx, S, R, r, th) {
  const p = []; for (let i = 0; i < 10; i++) { const a = P2 + (i * Math.PI) / 5, q = i % 2 ? r : R; p.push([S[0] + Math.cos(a) * q, S[1] + Math.sin(a) * q, S[2]]); }
  const f = [S[0], S[1], S[2] - th], b = [S[0], S[1], S[2] + th];
  for (let i = 0; i < 10; i++) { const j = (i + 1) % 10; T(ctx, p[i], p[j], f, S); T(ctx, p[j], p[i], b, S); }
}
export function hatRing(s) {
  const b = cen(H), y = H + DRUM_H + s * HAT - 0.9 * s ** 6, r = Math.max(0.03, EAVE * (1 - s) ** 1.55);
  return { y, r, c: [b[0] + 0.1 * s + 0.7 * s ** 3 + 0.5 * s ** 6, b[1] + 0.35 * s ** 2.5] };
}

// ---------- the stone shaft: chamfered limestone courses, twisting a little each course, cut around every opening
function shaft(ctx, L) {
  const nC = L >= 3 ? 19 : 38, N = L >= 3 ? 12 : L === 2 ? 18 : 20, h = H / nC;
  ctx.albedo(LIME); ctx.roughness(0.92); ctx.metalness(0); ctx.emissive(null);
  for (let k = 0; k < nC; k++) {
    const y0 = k * h, y1 = y0 + h, ym = (y0 + y1) / 2, R = rad(ym), ri = y0 < CEIL ? RIN : R - 0.55;
    const rot = k * 0.0245 + ((k % 2) * Math.PI) / N;
    for (let i = 0; i < N; i++) {
      const a0 = rot + (i / N) * TAU, a1 = a0 + TAU / N, ro = R + (ctx.random() - 0.3) * 0.05;
      ctx.color(`oklch(${(0.9 + ctx.random() * 0.07).toFixed(3)} ${(0.015 + ctx.random() * 0.025).toFixed(3)} ${(65 + ctx.random() * 30).toFixed(0)})`);
      for (const [s, e] of spans(a0, a1, y0 - 0.001, y1, R)) block(ctx, s, e, y0, y1, ri, ro, L === 1 ? 0.06 : 0);
    }
  }
}
// ---------- walnut root collar and roots gripping the lawn
function roots(ctx, L) {
  paint(ctx, 'walnut', 'oklch(0.93 0.02 60)', 0.9);
  const K = L === 1 ? 24 : 12, prof = [[4.12, -0.25], [4.05, 0.2], [3.98, 0.55], [rad(1.05) + 0.03, 1.05]], sA = DOOR_A + 0.36, span = TAU - 0.72;
  const wob = []; for (let i = 0; i <= K; i++) wob.push(1 + (ctx.random() - 0.5) * 0.04);
  for (let i = 0; i < K; i++) {
    const a0 = sA + (i / K) * span, a1 = sA + ((i + 1) / K) * span;
    for (let k = 0; k < prof.length - 1; k++) { const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; Q(ctx, pol(a0, r0 * wob[i], y0, Z0), pol(a1, r0 * wob[i + 1], y0, Z0), pol(a1, r1 * wob[i + 1], y1, Z0), pol(a0, r1 * wob[i], y1, Z0), [0, (y0 + y1) / 2, 0]); }
  }
  for (const [a, sd] of [[sA, 1], [sA + span, -1]]) for (let k = 0; k < prof.length - 1; k++) { const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; Q(ctx, pol(a, r0, y0, Z0), pol(a, r1, y1, Z0), pol(a, 3.55, y1, Z0), pol(a, 3.55, y0, Z0), pol(a + sd * 0.1, 3.85, (y0 + y1) / 2, Z0)); }
  const NR = L >= 3 ? 5 : 9;
  for (let i = 0; i < NR; i++) {
    const a = DOOR_A + 0.62 + ((i + 0.5) / NR) * (TAU - 1.24) + (ctx.random() - 0.5) * 0.12, w = (ctx.random() - 0.5) * 0.14;
    const p = [pol(a, 3.95, 1.25, Z0), pol(a + w, 4.12, 0.62, Z0), pol(a + w * 1.8, 4.26, 0.16, Z0), pol(a + w * 2.4, 4.3, -0.3, Z0)];
    beam(ctx, p[0], p[1], 0.4, 0.3); beam(ctx, p[1], p[2], 0.32, 0.24); beam(ctx, p[2], p[3], 0.22, 0.16);
    if (L === 1) { const sd = w > 0 ? 1 : -1; beam(ctx, p[1], pol(a + w + sd * 0.1, 4.25, -0.2, Z0), 0.12, 0.1); }
  }
}
// ---------- arched oak door: quoins, voussoirs, two open leaves with iron straps, round window above
function door(ctx, L) {
  const P = frame(DOOR_A, 1);
  paint(ctx, null, 'oklch(0.8 0.02 80)', 0.95); ctx.albedo(LIME);
  fbox(ctx, P, -1.0, 1.0, -0.25, 0.07, 3.15, 4.3);
  ctx.color('oklch(0.95 0.02 85)');
  for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) { const w = i % 2 ? 0.3 : 0.44; fbox(ctx, P, sd * 0.9, sd * (0.9 + w), i * 0.42 + 0.07, (i + 1) * 0.42 + 0.06, 3.5, 3.99); }
  const V = (t, q, r) => P(Math.cos(t) * q, 2.1 + Math.sin(t) * q, r);
  for (let i = 0; i < 9; i++) { const t0 = (Math.PI * i) / 9 + 0.01, t1 = (Math.PI * (i + 1)) / 9 - 0.01, ro = i === 4 ? 1.45 : 1.3, ra = i === 4 ? 4.06 : 4.0;
    solid(ctx, [V(t0, 0.9, 3.5), V(t0, ro, 3.5), V(t1, ro, 3.5), V(t1, 0.9, 3.5)], [V(t0, 0.9, ra), V(t0, ro, ra), V(t1, ro, ra), V(t1, 0.9, ra)]); }
  // round window
  const rw = rad(4.1), RP = frame(DOOR_A, 4.1);
  for (let i = 0; i < 12; i++) { const t0 = (i / 12) * TAU + 0.01, t1 = ((i + 1) / 12) * TAU - 0.01, W = (t, q, r) => RP(Math.cos(t) * q, 4.1 + Math.sin(t) * q, r);
    solid(ctx, [W(t0, 0.45, rw - 0.4), W(t0, 0.62, rw - 0.4), W(t1, 0.62, rw - 0.4), W(t1, 0.45, rw - 0.4)], [W(t0, 0.45, rw + 0.08), W(t0, 0.62, rw + 0.08), W(t1, 0.62, rw + 0.08), W(t1, 0.45, rw + 0.08)]); }
  paint(ctx, null, GLOW, 0.4); emit(ctx, GLOW);
  const pc = RP(0, 4.1, rw - 0.3), inner = RP(0, 4.1, rw - 1);
  for (let i = 0; i < 12; i++) { const t0 = (i / 12) * TAU, t1 = ((i + 1) / 12) * TAU; T(ctx, pc, RP(Math.cos(t0) * 0.46, 4.1 + Math.sin(t0) * 0.46, rw - 0.3), RP(Math.cos(t1) * 0.46, 4.1 + Math.sin(t1) * 0.46, rw - 0.3), inner); }
  paint(ctx, 'oak', 'oklch(0.9 0.04 65)', 0.8);
  fbox(ctx, RP, -0.46, 0.46, 4.08, 4.12, rw - 0.32, rw - 0.25); fbox(ctx, RP, -0.02, 0.02, 3.64, 4.56, rw - 0.32, rw - 0.25);
  // two leaves swung inward
  const t = [1, 0, 0], n = [0, 0, -1], th = 1.75;
  for (const sd of [1, -1]) {
    const hg = P(-sd * 0.9, 0.08, 3.28), d = [t[0] * sd * Math.cos(th) - n[0] * Math.sin(th), 0, t[2] * sd * Math.cos(th) - n[2] * Math.sin(th)], p = [d[2], 0, -d[0]];
    const Lf = (x, y, q) => [hg[0] + d[0] * x + p[0] * q, y, hg[2] + d[2] * x + p[2] * q];
    const out = [[0, 0.08], [0.88, 0.08]]; for (let k = 0; k <= 6; k++) { const x = 0.88 * (1 - k / 6); out.push([x, 2.1 + Math.sqrt(Math.max(0, 0.7396 - (0.9 - x) ** 2))]); }
    paint(ctx, 'oak', 'oklch(0.92 0.05 65)', 0.8);
    solid(ctx, out.map(([x, y]) => Lf(x, y, -0.035)), out.map(([x, y]) => Lf(x, y, 0.035)));
    if (L <= 2) {
      paint(ctx, null, 'oklch(0.3 0.01 250)', 0.5, 0.7);
      const lb = (x0, x1, y0, y1, q0, q1) => solid(ctx, [Lf(x0, y0, q0), Lf(x1, y0, q0), Lf(x1, y0, q1), Lf(x0, y0, q1)], [Lf(x0, y1, q0), Lf(x1, y1, q0), Lf(x1, y1, q1), Lf(x0, y1, q1)]);
      for (const yy of [0.45, 1.3, 2.1]) lb(0.02, 0.8, yy, yy + 0.08, -0.05, 0.05);
      const hd = Lf(0.76, 1.1, -0.07); gem(ctx, hd[0], hd[1], hd[2], 0.05, 0.06, 0.06, 5);
    }
  }
}
// ---------- a pointed dormer: glowing pane recessed in the cut, oak mullion, stone sill, teal hood
function dormer(ctx, w, L) {
  const R = rad(w.y + 0.6), P = frame(w.a, w.y), y = w.y, rp = R - 0.3;
  paint(ctx, null, GLOW, 0.4); emit(ctx, GLOW);
  const pane = [P(-0.37, y, rp), P(0.37, y, rp), P(0.37, y + 0.75, rp), P(0, y + 1.2, rp), P(-0.37, y + 0.75, rp)], o = P(0, y + 0.5, rp - 0.6);
  for (let i = 1; i < 4; i++) T(ctx, pane[0], pane[i], pane[i + 1], o);
  paint(ctx, 'oak', 'oklch(0.9 0.04 65)', 0.8);
  fbox(ctx, P, -0.03, 0.03, y, y + 1.12, rp - 0.02, rp + 0.05);
  fbox(ctx, P, -0.37, 0.37, y + 0.52, y + 0.57, rp - 0.02, rp + 0.05);
  paint(ctx, null, 'oklch(0.9 0.02 80)', 0.9); ctx.albedo(LIME);
  fbox(ctx, P, -0.5, 0.5, y - 0.12, y, R - 0.35, R + 0.2);
  if (L <= 2) {
    fbox(ctx, P, -0.5, -0.4, y, y + 1.3, R - 0.1, R + 0.12); fbox(ctx, P, 0.4, 0.5, y, y + 1.3, R - 0.1, R + 0.12);
    T(ctx, P(-0.58, y + 1.3, R + 0.42), P(0.58, y + 1.3, R + 0.42), P(0, y + 1.78, R + 0.42), P(0, y + 1.5, R - 0.2));
    paint(ctx, null, SHINGLE, 0.8);
    for (const sd of [-1, 1]) { const q = [P(0, y + 1.85, R - 0.25), P(0, y + 1.85, R + 0.5), P(sd * 0.66, y + 1.27, R + 0.5), P(sd * 0.66, y + 1.27, R - 0.25)]; solid(ctx, q, q.map((p) => add(p, [0, 0.07, 0]))); }
  }
}
// ---------- observatory balcony: stone slab on walnut corbels, oak deck, carved railing with turned balusters
function balcony(ctx, L) {
  const cH = cen(H), top = WIN[WIN.length - 1];
  paint(ctx, null, 'oklch(0.93 0.02 80)', 0.9); ctx.albedo(LIME);
  solid(ctx, loop(28, BAL_R, H - 0.35, cH), loop(28, BAL_R, H - 0.1, cH));
  paint(ctx, 'oak', 'oklch(0.95 0.03 70)', 0.8);
  solid(ctx, loop(28, BAL_R - 0.12, H - 0.1, cH), loop(28, BAL_R - 0.12, H, cH));
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
  const NC = L >= 3 ? 8 : 16;
  for (let i = 0; i < NC; i++) { const a = (i / NC) * TAU; if (Math.abs(wrapNear(top.a, a) - a) < 0.3) continue;
    beam(ctx, pol(a, rad(15.7) - 0.1, 15.7), pol(a, BAL_R - 0.25, H - 0.4, cH), 0.24, 0.26); beam(ctx, pol(a, rad(H - 0.5) - 0.2, H - 0.48, cH), pol(a, BAL_R - 0.05, H - 0.48, cH), 0.22, 0.22); }
  const NP = 20, RR = 3.82;
  for (let i = 0; i < NP; i++) {
    const a = (i / NP) * TAU, b = ((i + 1) / NP) * TAU;
    paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
    beam(ctx, pol(a, RR, H, cH), pol(a, RR, H + 1.1, cH), 0.13);
    beam(ctx, pol(a, RR, H + 1.05, cH), pol(b, RR, H + 1.05, cH), 0.17, 0.08);
    beam(ctx, pol(a, RR, H + 0.18, cH), pol(b, RR, H + 0.18, cH), 0.1, 0.06);
    if (L === 1) {
      paint(ctx, 'oak', 'oklch(0.93 0.04 70)', 0.8);
      for (let k = 1; k <= 3; k++) { const q = pol(a + ((b - a) * k) / 4, RR, H, cH); lathe(ctx, [[0.04, H + 0.21], [0.07, H + 0.36], [0.03, H + 0.56], [0.065, H + 0.8], [0.035, H + 1.01]], 6, q[0], q[2]); }
      paint(ctx, 'brass', 'oklch(0.92 0.05 85)', 0.4, 0.6); const g = pol(a, RR, H, cH); gem(ctx, g[0], H + 1.14, g[2], 0.07, 0.1, 0.03, 4);
    }
  }
}
// ---------- observatory drum with glowing windows, and a brass telescope on the deck
function drum(ctx, L) {
  const cH = cen(H), n = 16;
  paint(ctx, null, 'oklch(0.93 0.03 85)', 0.95);
  solid(ctx, loop(n, DRUM_R, H, cH), loop(n, DRUM_R, H + DRUM_H, cH));
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
  solid(ctx, loop(n, DRUM_R + 0.05, H, cH), loop(n, DRUM_R + 0.05, H + 0.22, cH));
  solid(ctx, loop(n, DRUM_R + 0.05, H + DRUM_H - 0.2, cH), loop(n, DRUM_R + 0.05, H + DRUM_H, cH));
  if (L <= 2) for (let i = 0; i < n; i++) { const a = (i / n) * TAU; beam(ctx, pol(a, DRUM_R + 0.04, H + 0.22, cH), pol(a, DRUM_R + 0.04, H + DRUM_H - 0.2, cH), 0.1); }
  const axis = [cH[0], H + 1, cH[1]];
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, am = (a0 + a1) / 2, m = [Math.cos(am), 0, Math.sin(am)];
    const q = (t, y) => add(lerp3(pol(a0, DRUM_R, y, cH), pol(a1, DRUM_R, y, cH), t), m, 0.02);
    paint(ctx, null, GLOW, 0.4); emit(ctx, GLOW);
    Q(ctx, q(0.15, H + 0.55), q(0.85, H + 0.55), q(0.85, H + 1.85), q(0.15, H + 1.85), axis);
    if (L <= 2) { paint(ctx, 'oak', 'oklch(0.9 0.04 65)', 0.8); beam(ctx, add(q(0.5, H + 0.55), m, 0.02), add(q(0.5, H + 1.85), m, 0.02), 0.05); beam(ctx, add(q(0.1, H + 0.52), m, 0.03), add(q(0.9, H + 0.52), m, 0.03), 0.07); }
  }
  if (L === 1) {
    const a = -0.35, base = pol(a, 2.95, H, cH), head = add(base, [0, 1.2, 0]);
    paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
    for (let k = 0; k < 3; k++) { const b = (k / 3) * TAU; beam(ctx, [base[0] + Math.cos(b) * 0.35, H, base[2] + Math.sin(b) * 0.35], head, 0.04); }
    paint(ctx, 'brass', 'oklch(0.92 0.05 85)', 0.35, 0.7);
    const out = [Math.cos(a) * 0.5, 0.4, Math.sin(a) * 0.5];
    beam(ctx, add(head, out, -0.7), add(head, out, 0.9), 0.1); beam(ctx, add(head, out, 0.6), add(head, out, 1.05), 0.14);
  }
}
// ---------- crooked witch-hat roof: shingle rows over a dark underlay, walnut soffit, brass star finial
function hat(ctx, L) {
  const M = L === 1 ? 18 : L === 2 ? 12 : 8, K = L === 1 ? 22 : 14, cH = cen(H);
  const R = []; for (let j = 0; j <= M; j++) R.push(hatRing(j / M));
  paint(ctx, null, 'oklch(0.3 0.06 250)', 0.9);
  for (let j = 0; j < M; j++) { const A = R[j], B = R[j + 1], o = [(A.c[0] + B.c[0]) / 2, (A.y + B.y) / 2 - 0.05, (A.c[1] + B.c[1]) / 2];
    for (let i = 0; i < K; i++) { const a0 = (i / K) * TAU, a1 = ((i + 1) / K) * TAU; Q(ctx, pol(a0, A.r, A.y, A.c), pol(a1, A.r, A.y, A.c), pol(a1, B.r, B.y, B.c), pol(a0, B.r, B.y, B.c), o); } }
  if (L <= 2) for (let j = 0; j < M; j++) {
    const A = R[j], B = R[j + 1]; if (B.r < 0.2) break;
    const off = ((j % 2) * Math.PI) / K, o = [(A.c[0] + B.c[0]) / 2, (A.y + B.y) / 2 - 0.1, (A.c[1] + B.c[1]) / 2], lip = L === 1 ? 0.08 : 0.05;
    for (let i = 0; i < K; i++) {
      const a0 = off + (i / K) * TAU + 0.012, a1 = off + ((i + 1) / K) * TAU - 0.012;
      ctx.color(`oklch(${(0.38 + ctx.random() * 0.08).toFixed(3)} ${(0.07 + ctx.random() * 0.025).toFixed(3)} ${(232 + ctx.random() * 18).toFixed(0)})`);
      Q(ctx, pol(a0, A.r + lip, A.y - 0.06, A.c), pol(a1, A.r + lip, A.y - 0.06, A.c), pol(a1, B.r + 0.03, B.y, B.c), pol(a0, B.r + 0.03, B.y, B.c), o);
      if (L === 1) Q(ctx, pol(a0, A.r + lip, A.y - 0.06, A.c), pol(a1, A.r + lip, A.y - 0.06, A.c), pol(a1, A.r + 0.02, A.y + 0.01, A.c), pol(a0, A.r + 0.02, A.y + 0.01, A.c), o);
    }
  }
  paint(ctx, 'walnut', 'oklch(0.85 0.02 60)', 0.9);
  const ys = H + DRUM_H;
  for (let i = 0; i < K; i++) { const a0 = (i / K) * TAU, a1 = ((i + 1) / K) * TAU; Q(ctx, pol(a0, DRUM_R, ys, cH), pol(a1, DRUM_R, ys, cH), pol(a1, EAVE, ys, cH), pol(a0, EAVE, ys, cH), [cH[0], ys + 1, cH[1]]); }
  const tp = R[M], tip = [tp.c[0], tp.y, tp.c[1]];
  paint(ctx, 'brass', 'oklch(0.93 0.06 85)', 0.35, 0.75);
  beam(ctx, add(tip, [-0.05, -0.25, 0]), add(tip, [0.2, 0.65, 0]), 0.07);
  gem(ctx, tip[0] + 0.08, tip[1] + 0.25, tip[2], 0.1, 0.1, 0.1, 6);
  ctx.emissive('oklch(0.6 0.12 85)');
  star(ctx, add(tip, [0.26, 1.05, 0]), 0.44, 0.19, 0.09);
}
// ---------- the small return portal on the balcony's east side
function topPortal(ctx, L) {
  const cH = cen(H), C = pol(P2, TOWER.WALK_R, H + 1.05, cH), ax = [0, 0, 1], g = 0.8;
  paint(ctx, null, 'oklch(0.9 0.02 80)', 0.9); ctx.albedo(LIME);
  arcBlock(ctx, P2 - 0.2, P2 + 0.2, H, H + 0.04, 2.45, 3.75);
  const at = torus(ctx, C, ax, 0.62, 0.95, 0.08, -P2 + g, 3 * P2 - g, L === 1 ? 24 : 14, L === 1 ? 7 : 5);
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
  for (const f of [-P2 + g, 3 * P2 - g]) { const e = at(f), sd = Math.sign(Math.cos(f)); beam(ctx, e, [C[0], H + 0.02, C[2] + sd * 0.55], 0.12, 0.14); }
  paint(ctx, null, TEAL, 0.4); emit(ctx, TEAL);
  for (let i = 0; i < 7; i++) { const f = -P2 + g + ((i + 0.5) / 7) * (TAU - 2 * g); for (const s of [-1, 1]) { const q = at(f, s * 0.08); gem(ctx, q[0], q[1], q[2], 0.035, 0.05, 0.05, 4); } }
}
// ---------- ivy and flowering vines climbing the west-south face
function vines(ctx, L) {
  const VA = -2.35, FL = ['oklch(0.8 0.11 350)', 'oklch(0.94 0.03 90)', 'oklch(0.74 0.1 300)'];
  for (let s = 0; s < 4; s++) {
    const base = VA + (s - 1.5) * 0.2, top = 7 + s * 2.2, ph = s * 1.7, step = L === 1 ? 0.28 : 0.56;
    let prev = null;
    for (let y = 0.9; y <= top; y += step) {
      const a = base + 0.13 * Math.sin(y * 0.9 + ph), p = pol(a, rad(y) + 0.09, y), n = [Math.cos(a), 0, Math.sin(a)], t = [-Math.sin(a), 0, Math.cos(a)];
      paint(ctx, null, 'oklch(0.42 0.06 95)', 0.9);
      if (prev) beam(ctx, prev, p, 0.05);
      for (const sd of [-1, 1]) {
        const d = nrm([n[0] * 0.5 + t[0] * sd * 0.7, 0.55, n[2] * 0.5 + t[2] * sd * 0.7]), side = nrm(crs(d, n));
        ctx.color(`oklch(${(0.48 + ctx.random() * 0.12).toFixed(3)} 0.12 ${(128 + ctx.random() * 16).toFixed(0)})`);
        leaf(ctx, p, d, side, 0.24 * (0.8 + ctx.random() * 0.4), 0.09);
      }
      if ((s % 2 === 1 || y > top - 2) && ctx.random() < 0.35) { ctx.color(FL[Math.floor(ctx.random() * 3)]); const f = add(p, n, 0.08); gem(ctx, f[0], f[1], f[2], 0.07, 0.035, 0.035, 5); }
      prev = p;
    }
  }
}
// ---------- the portal room: floor, rug, plinth and ring, bookshelf ring, desk with orb, beamed ceiling, lantern
function interior(ctx, L) {
  paint(ctx, 'oak', 'oklch(0.95 0.02 75)', 0.8);
  solid(ctx, loop(24, 3.3, -0.25, Z0), loop(24, 3.3, 0.08, Z0));
  paint(ctx, null, 'oklch(0.9 0.03 85)', 1); solid(ctx, loop(28, 2.2, 0.08, Z0), loop(28, 2.2, 0.095, Z0));
  ctx.color('oklch(0.58 0.08 195)'); solid(ctx, loop(28, 2.02, 0.095, Z0), loop(28, 2.02, 0.102, Z0));
  ctx.color('oklch(0.78 0.1 80)'); solid(ctx, loop(28, 1.62, 0.102, Z0), loop(28, 1.62, 0.106, Z0));
  ctx.color('oklch(0.38 0.07 265)'); solid(ctx, loop(28, 1.5, 0.106, Z0), loop(28, 1.5, 0.11, Z0));
  // plinth + horseshoe ring (open at the floor so you walk straight through)
  paint(ctx, null, 'oklch(0.88 0.02 80)', 0.9); ctx.albedo(LIME);
  solid(ctx, ov(10, 1.35, 0.85, 0.08), ov(10, 1.35, 0.85, 0.19)); solid(ctx, ov(10, 1.15, 0.7, 0.19), ov(10, 1.08, 0.64, 0.3));
  ctx.color('oklch(0.94 0.02 85)');
  const g = 0.7, at = torus(ctx, [0, 1.45, 0], [1, 0, 0], 1.1, 1.1, 0.12, -P2 + g, 3 * P2 - g, L === 1 ? 32 : 18, L === 1 ? 8 : 6);
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.9);
  for (const sd of [-1, 1]) { const e = at(sd > 0 ? -P2 + g : 3 * P2 - g); beam(ctx, [sd * 0.88, 0.25, 0], e, 0.26, 0.3); beam(ctx, [sd * 1.05, 0.2, 0.2], e, 0.12, 0.12); beam(ctx, [sd * 1.05, 0.2, -0.2], e, 0.12, 0.12); }
  paint(ctx, 'brass', 'oklch(0.93 0.06 85)', 0.35, 0.75);
  for (const f of [-P2 + g, 3 * P2 - g]) { const e = at(f); gem(ctx, e[0], e[1], e[2], 0.17, 0.08, 0.08, 8); }
  const k = at(P2); gem(ctx, k[0], k[1] + 0.08, k[2], 0.14, 0.2, 0.08, 4);
  paint(ctx, null, TEAL, 0.4); emit(ctx, TEAL);
  for (let i = 0; i < 9; i++) { const f = -P2 + g + ((i + 0.5) / 9) * (TAU - 2 * g); for (const s of [-1, 1]) { const q = at(f, s * 0.12); gem(ctx, q[0], q[1], q[2], 0.04, 0.06, 0.06, 4); } }
  // bookshelves
  const RI = 2.82, RO = 3.18, LV = [0.06, 0.6, 1.14, 1.68, 2.22], TOP = 2.5;
  const BOOK = ['oklch(0.55 0.1 30)', 'oklch(0.5 0.07 195)', 'oklch(0.72 0.1 80)', 'oklch(0.6 0.06 135)', 'oklch(0.45 0.08 300)', 'oklch(0.86 0.03 85)', 'oklch(0.36 0.05 250)', 'oklch(0.62 0.09 55)'];
  for (const [s, e] of SHELVES) {
    const ns = Math.round((e - s) / 0.4), da = (e - s) / ns;
    for (let i = 0; i < ns; i++) {
      const a0 = s + i * da, a1 = a0 + da;
      paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.85);
      arcBlock(ctx, a0 - 0.012, a0 + 0.012, 0, TOP, RI, RO); if (i === ns - 1) arcBlock(ctx, a1 - 0.012, a1 + 0.012, 0, TOP, RI, RO);
      for (const y of LV) arcBlock(ctx, a0, a1, y, y + 0.04, RI, RO);
      arcBlock(ctx, a0 - 0.02, a1 + 0.02, TOP, TOP + 0.06, RI - 0.04, RO);
      for (let lv = 0; lv < LV.length; lv++) {
        const y = LV[lv] + 0.04;
        if (lv === 3) { if (L === 1) for (let q = 0; q < 3; q++) { const aa = a0 + da * (0.25 + q * 0.25), p = pol(aa, 3.0, y, Z0), c = ['oklch(0.7 0.14 330)', 'oklch(0.75 0.13 160)', 'oklch(0.8 0.12 90)'][q];
          paint(ctx, null, c, 0.3); emit(ctx, c.replace(/0\.\d+ 0/, '0.45 0')); lathe(ctx, [[0.001, y], [0.07, y + 0.02], [0.07, y + 0.14], [0.03, y + 0.2], [0.03, y + 0.26]], 6, p[0], p[2]); } continue; }
        if (L !== 1) { paint(ctx, null, BOOK[(i + lv) % BOOK.length], 0.85); arcBlock(ctx, a0 + 0.03, a1 - 0.03, y, y + 0.34, 2.88, 3.12); continue; }
        let a = a0 + 0.03;
        while (a < a1 - 0.04) {
          const w = (0.035 + ctx.random() * 0.05) / 3.0;
          if (ctx.random() < 0.06) { a += w * 2; continue; }
          paint(ctx, null, BOOK[Math.floor(ctx.random() * BOOK.length)], 0.85);
          arcBlock(ctx, a, Math.min(a + w, a1 - 0.03), y, y + 0.26 + ctx.random() * 0.2, 2.86 + ctx.random() * 0.04, 3.12);
          a += w + 0.003;
        }
      }
    }
  }
  // desk at the back wall with the orb
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.85);
  obox(ctx, 0, 0.74, 2.25, 1.5, 0.06, 0.72);
  for (const x of [-0.68, 0.68]) for (const z of [1.95, 2.55]) obox(ctx, x, 0.08, z, 0.07, 0.66, 0.07);
  obox(ctx, 0.35, 0.56, 2.25, 0.55, 0.16, 0.62);
  paint(ctx, 'brass', 'oklch(0.93 0.06 85)', 0.35, 0.75);
  lathe(ctx, [[0.1, 0.8], [0.06, 0.84], [0.03, 0.9], [0.075, 0.95]], 8, 0.4, 2.2);
  paint(ctx, null, 'oklch(0.82 0.1 215)', 0.2); emit(ctx, 'oklch(0.72 0.15 250)');
  const orb = []; for (let q = 0; q <= 8; q++) orb.push([Math.max(0.001, 0.14 * Math.sin((Math.PI * q) / 8)), 1.08 - 0.14 * Math.cos((Math.PI * q) / 8)]);
  lathe(ctx, orb, 10, 0.4, 2.2);
  paint(ctx, null, 'oklch(0.94 0.03 90)', 0.9);
  Q(ctx, [-0.62, 0.8, 2.1], [-0.3, 0.83, 2.1], [-0.3, 0.83, 2.38], [-0.62, 0.8, 2.38], [-0.46, 0, 2.24]);
  Q(ctx, [-0.3, 0.83, 2.1], [0.0, 0.8, 2.1], [0.0, 0.8, 2.38], [-0.3, 0.83, 2.38], [-0.15, 0, 2.24]);
  lathe(ctx, [[0.035, 0.8], [0.035, 0.98]], 6, 0.62, 2.45);
  ctx.emissive('oklch(0.85 0.15 70)'); gem(ctx, 0.62, 1.0, 2.45, 0.02, 0.06, 0.01, 4); ctx.emissive(null);
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.85);
  lathe(ctx, [[0.18, 0.08], [0.13, 0.13], [0.09, 0.48], [0.2, 0.52], [0.2, 0.58]], 8, 0.55, 1.55);
  // ceiling, beams, lantern
  paint(ctx, 'oak', 'oklch(0.93 0.03 70)', 0.85);
  solid(ctx, loop(20, 3.3, CEIL, Z0), loop(20, 3.3, CEIL + 0.12, Z0));
  paint(ctx, 'walnut', 'oklch(0.9 0.02 60)', 0.85);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + 0.2; beam(ctx, pol(a, 0.25, CEIL - 0.1, Z0), pol(a, 3.2, CEIL - 0.1, Z0), 0.16, 0.2); }
  lathe(ctx, [[0.32, CEIL - 0.28], [0.34, CEIL - 0.1], [0.3, CEIL]], 8, 0, 0);
  paint(ctx, 'brass', 'oklch(0.9 0.05 85)', 0.4, 0.7);
  beam(ctx, [-1.7, CEIL, 1.0], [-1.7, 2.75, 1.0], 0.025);
  lathe(ctx, [[0.02, 2.36], [0.14, 2.42], [0.14, 2.44], [0.09, 2.66], [0.13, 2.7], [0.02, 2.78]], 6, -1.7, 1.0);
  paint(ctx, null, GLOW, 0.4); emit(ctx, GLOW); lathe(ctx, [[0.001, 2.44], [0.1, 2.46], [0.08, 2.64], [0.001, 2.66]], 6, -1.7, 1.0);
}
function far(ctx, L) {
  const n = L === 4 ? 12 : 8, ys = L === 4 ? [0, 4.4, 8.8, 13.1, H] : [0, H], cH = cen(H);
  paint(ctx, null, 'oklch(0.9 0.02 80)', 0.9); ctx.albedo(LIME);
  for (let i = 0; i < ys.length - 1; i++) solid(ctx, loop(n, rad(ys[i]), ys[i]), loop(n, rad(ys[i + 1]), ys[i + 1]));
  solid(ctx, loop(n + 4, BAL_R, H - 0.35, cH), loop(n + 4, BAL_R, H, cH));
  paint(ctx, null, 'oklch(0.93 0.03 85)', 0.95); solid(ctx, loop(n, DRUM_R, H, cH), loop(n, DRUM_R, H + DRUM_H, cH));
  paint(ctx, null, 'oklch(0.35 0.04 50)', 0.9); fbox(ctx, frame(DOOR_A, 1), -0.9, 0.9, 0, 2.9, rad(1) - 0.02, rad(1) + 0.04);
  if (L === 4) { paint(ctx, null, GLOW, 0.4); emit(ctx, GLOW); for (const w of WIN) { const R = rad(w.y + 0.6), P = frame(w.a, w.y); fbox(ctx, P, -0.37, 0.37, w.y, w.y + 1.1, R - 0.02, R + 0.04); } }
  paint(ctx, null, SHINGLE, 0.8);
  const ss = L === 4 ? [0, 0.3, 0.6, 0.85, 1] : [0, 0.5, 1];
  for (let i = 0; i < ss.length - 1; i++) { const A = hatRing(ss[i]), B = hatRing(ss[i + 1]); solid(ctx, loop(n, A.r, A.y, A.c), loop(n, Math.max(B.r, 0.04), B.y, B.c)); }
  const tp = hatRing(1); paint(ctx, 'brass', 'oklch(0.93 0.06 85)', 0.35, 0.75); ctx.emissive('oklch(0.6 0.12 85)'); gem(ctx, tp.c[0] + 0.26, tp.y + 1.05, tp.c[1], 0.35, 0.35, 0.35, 4);
}
function rune(ctx, L) {
  paint(ctx, null, 'oklch(0.9 0.02 250)', 0.85); ctx.albedo(LIME); ctx.color('oklch(0.62 0.03 240)');
  const n = 6, r0 = 0.22, h = 0.8, ring = (r, y) => { const p = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; p.push([Math.cos(a) * r, y, Math.sin(a) * r]); } return p; };
  solid(ctx, ring(r0, 0), ring(r0 * 0.75, h));
  gem(ctx, 0, h, 0, r0 * 0.75, 0.3, 0.001, 6); gem(ctx, 0, 0, 0, r0, 0.001, 0.32, 6);
  if (L >= 4) return;
  paint(ctx, null, TEAL, 0.4); emit(ctx, 'oklch(0.8 0.15 195)');
  for (const f of [0, 2, 4]) {
    const am = ((f + 0.5) / n) * TAU, m = [Math.cos(am), 0, Math.sin(am)], t = [-Math.sin(am), 0, Math.cos(am)], ap = (y) => r0 * (1 - (0.25 * y) / h) * Math.cos(Math.PI / n) + 0.012;
    const P = (u, y) => [m[0] * ap(y) + t[0] * u, y, m[2] * ap(y) + t[2] * u];
    beam(ctx, P(0, 0.18), P(0, 0.62), 0.03, 0.01); beam(ctx, P(0, 0.5), P(0.07, 0.38), 0.03, 0.01); beam(ctx, P(0, 0.34), P(-0.07, 0.24), 0.03, 0.01);
  }
}

export function geometry(ctx) {
  const L = ctx.lod ?? 1;
  if (ctx.params?.part === 'rune') return rune(ctx, L);
  if (L >= 4) return far(ctx, L);
  shaft(ctx, L); roots(ctx, L); door(ctx, L);
  for (const w of WIN) dormer(ctx, w, L);
  balcony(ctx, L); drum(ctx, L); hat(ctx, L); topPortal(ctx, L);
  if (L <= 2) { interior(ctx, L); vines(ctx, L); }
}

export function collider(ctx) {
  if (ctx.params?.part === 'rune') return null;
  solid(ctx, loop(16, 3.35, -0.3, Z0), loop(16, 3.35, 0.08, Z0));
  fbox(ctx, frame(DOOR_A, 0), -1.0, 1.0, -0.3, 0.07, 3.3, 4.3);
  const g = Math.asin(0.9 / RIN) + 0.02, N = 18, sp = TAU - 2 * g;
  for (let i = 0; i < N; i++) { const a0 = DOOR_A + g + (i / N) * sp, a1 = DOOR_A + g + ((i + 1) / N) * sp; arcBlock(ctx, a0, a1, -0.3, CEIL + 0.15, inShelf((a0 + a1) / 2) ? 2.8 : RIN, 3.9); }
  arcBlock(ctx, DOOR_A - g, DOOR_A, 2.75, CEIL + 0.15, RIN, 3.9); arcBlock(ctx, DOOR_A, DOOR_A + g, 2.75, CEIL + 0.15, RIN, 3.9);
  solid(ctx, loop(16, 3.35, CEIL, Z0), loop(16, 3.35, CEIL + 0.15, Z0));
  const ys = [CEIL + 0.15, 7.5, 11.5, 14.5, H - 0.35];
  for (let i = 0; i < ys.length - 1; i++) solid(ctx, loop(16, rad(ys[i]), ys[i]), loop(16, rad(ys[i + 1]), ys[i + 1]));
  const cH = cen(H);
  solid(ctx, loop(24, BAL_R, H - 0.35, cH), loop(24, BAL_R, H, cH));
  for (let i = 0; i < 24; i++) arcBlock(ctx, (i / 24) * TAU, ((i + 1) / 24) * TAU, H, H + 1.1, 3.76, 3.92);
  solid(ctx, loop(16, DRUM_R, H, cH), loop(16, DRUM_R, H + DRUM_H, cH));
  const h0 = hatRing(0), h1 = hatRing(0.8); solid(ctx, loop(12, h0.r, h0.y, h0.c), loop(12, h1.r, h1.y, h1.c));
  solid(ctx, ov(10, 1.35, 0.85, 0.08), ov(10, 1.35, 0.85, 0.3));
  for (const sd of [-1, 1]) obox(ctx, sd * 0.95, 0.3, 0, 0.3, 0.6, 0.34);
  obox(ctx, 0, 0.08, 2.25, 1.5, 0.72, 0.72);
}
