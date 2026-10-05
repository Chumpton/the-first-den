// The zip-line's landing post beside the sand pit: a clerk's desk with an open ledger, inkpot and a glowing brass lantern,
// a stool, burlap sacks (standing by the desk, draped over the bumper bale), a coil of rope by the end post, a signboard
// (its words are the child plaque's ui) and a ship's-bell post. Root sits on the pit's sand-top centre, local -Z = down the
// rope toward the lake; params.items = { desk|sign|bell|coil: { x, z, yaw, dy } } (dy = ground under it, baked at spawn).
// params.kind "bell" draws the swinging bell alone (origin = its hanger, the bell hangs below).
import { paint, obox, beam, lathe, blob, leaf, nrm } from '../lib/yard-kit.js';
import { gem, Q } from '../lib/road-solid.js';
import { softened } from "./soften.js";
const BURLAP = 'cdn/texture-coarse-burlap-sackcloth.png', IRON = 'oklch(0.3 0.015 60)', ROPE = 'oklch(0.74 0.06 75)';
const burlap = (ctx, l = 0.93) => { ctx.albedo(BURLAP); ctx.color(`oklch(${l} 0.035 75)`); ctx.roughness(1); ctx.metalness(0); ctx.emissive(null); };
function piece(ctx, it) {
  const Y = (it.yaw || 0) * Math.PI / 180, c = Math.cos(Y), s = Math.sin(Y), dy = it.dy || 0;
  const P = (x, y, z) => [it.x + x * c + z * s, dy + y, it.z - x * s + z * c];
  return { P,
    B: (x, y0, z, sx, sy, sz) => { const q = P(x, 0, z); obox(ctx, q[0], dy + y0, q[2], sx, sy, sz, Y); },
    L: (a, b, w, h = w) => beam(ctx, P(...a), P(...b), w, h),
    T: (prof, n, x, z) => { const q = P(x, 0, z); lathe(ctx, prof.map(([r, y]) => [r, y + dy]), n, q[0], q[2]); },
    G: (x, y, z, r, u, d, n) => { const q = P(x, y, z); gem(ctx, q[0], q[1], q[2], r, u, d, n); },
  };
}
function tuft(ctx, k, x, z, n, rnd) {
  ctx.albedo(null); ctx.color('oklch(0.62 0.11 132)'); ctx.roughness(0.9); ctx.metalness(0); ctx.emissive(null);
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd(), p = k.P(x, 0, z), d = nrm([Math.cos(a) * 0.65, 0.75, Math.sin(a) * 0.65]);
    leaf(ctx, p, d, [-Math.sin(a), 0, Math.cos(a)], 0.34 + rnd() * 0.14, 0.06); }
}
function desk(ctx, it, lod, rnd) {
  const k = piece(ctx, it);
  paint(ctx, 'walnut', 'oklch(0.7 0.06 55)');                     // legs, aprons, stretcher, back panel toward the pit
  for (const x of [-0.5, 0.5]) for (const z of [-0.26, 0.26]) k.B(x, 0, z, 0.06, 0.72, 0.06);
  k.B(0, 0.6, 0.27, 1.0, 0.12, 0.03); k.B(0, 0.6, -0.27, 1.0, 0.12, 0.03);
  if (lod <= 3) { k.B(0, 0.12, 0.27, 1.0, 0.44, 0.02); k.B(0, 0.1, 0, 1.0, 0.03, 0.48); }
  paint(ctx, 'oak', 'oklch(0.9 0.05 70)'); k.B(0, 0.72, 0, 1.14, 0.05, 0.64);
  if (lod <= 2) { paint(ctx, 'oak', 'oklch(0.84 0.05 65)'); k.B(0.28, 0.5, -0.02, 0.42, 0.14, 0.56);
    paint(ctx, 'brass', 'oklch(0.85 0.08 85)', 0.4, 0.8); k.G(0.28, 0.57, -0.31, 0.02, 0.012, 0.012, 4); }
  const y = 0.77;                                                  // the open ledger: red cover, two page blocks, ink lines, ribbon
  paint(ctx, null, 'oklch(0.42 0.11 28)', 0.7); k.B(-0.12, y, -0.02, 0.5, 0.018, 0.34);
  paint(ctx, null, 'oklch(0.95 0.025 88)', 0.95); k.B(-0.245, y + 0.018, -0.02, 0.235, 0.022, 0.31); k.B(0.005, y + 0.018, -0.02, 0.235, 0.022, 0.31);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.42 0.03 60)', 0.9);
    for (const cx of [-0.245, 0.005]) for (let i = 0; i < 7; i++) k.B(cx - 0.01 + (i % 3) * 0.006, y + 0.04, -0.14 + i * 0.036, 0.17 - (i % 2) * 0.04, 0.002, 0.006);
    paint(ctx, null, 'oklch(0.68 0.09 190)', 0.8); k.B(-0.11, y + 0.041, -0.03, 0.014, 0.002, 0.3);
    paint(ctx, null, IRON, 0.4, 0.3); k.T([[0.035, y - 0.025], [0.04, y - 0.005], [0.032, y + 0.02], [0.014, y + 0.025], [0.014, y + 0.04], [0, y + 0.04]], 8, 0.3, -0.17);
    paint(ctx, null, 'oklch(0.95 0.02 90)', 0.9); k.L([0.3, y + 0.02, -0.17], [0.38, y + 0.2, -0.12], 0.01); k.L([0.33, y + 0.09, -0.15], [0.38, y + 0.2, -0.12], 0.04, 0.004); }
  const lx = 0.42, lz = 0.15, ly = 0.745;                         // the brass desk lantern
  paint(ctx, 'brass', 'oklch(0.85 0.08 85)', 0.4, 0.8);
  k.T([[0.075, ly], [0.075, ly + 0.02], [0.06, ly + 0.035], [0, ly + 0.035]], 8, lx, lz);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) k.B(lx + sx * 0.05, ly + 0.035, lz + sz * 0.05, 0.014, 0.17, 0.014);
  k.T([[0.075, ly + 0.2], [0.075, ly + 0.212], [0.02, ly + 0.27], [0.012, ly + 0.3], [0, ly + 0.3]], 8, lx, lz);
  if (lod <= 2) { k.L([lx, ly + 0.3, lz - 0.035], [lx, ly + 0.36, lz - 0.035], 0.01); k.L([lx, ly + 0.3, lz + 0.035], [lx, ly + 0.36, lz + 0.035], 0.01); k.L([lx, ly + 0.36, lz - 0.04], [lx, ly + 0.36, lz + 0.04], 0.012); }
  ctx.albedo(null); ctx.color('oklch(0.95 0.08 85)'); ctx.roughness(0.3); ctx.metalness(0); ctx.emissive(2.6, 1.55, 0.5);
  k.B(lx, ly + 0.035, lz, 0.086, 0.165, 0.086); ctx.emissive(null);
  if (lod <= 3) {                                                  // the clerk's stool
    paint(ctx, 'walnut', 'oklch(0.66 0.06 55)'); for (let i = 0; i < 3; i++) { const a = i / 3 * 6.283; k.L([Math.cos(a) * 0.09, 0.43, -0.62 + Math.sin(a) * 0.09], [Math.cos(a) * 0.17, 0, -0.62 + Math.sin(a) * 0.17], 0.035); }
    paint(ctx, 'oak', 'oklch(0.88 0.05 70)'); k.T([[0.16, 0.42], [0.17, 0.45], [0.16, 0.47], [0, 0.47]], 10, 0, -0.62);
  }
  burlap(ctx);                                                     // a standing sack tied off and a slumped one at the desk's end
  k.T([[0.15, 0], [0.2, 0.08], [0.21, 0.25], [0.17, 0.4], [0.08, 0.47], [0.05, 0.5], [0.075, 0.56], [0.03, 0.6], [0, 0.6]], lod <= 2 ? 10 : 6, 0.82, 0.12);
  burlap(ctx, 0.86); { const q = k.P(0.9, 0, -0.26); blob(ctx, q[0], q[1], q[2], 0.22, 0.26, 0.2, lod <= 2 ? 8 : 5, rnd); }
  if (lod <= 2) { paint(ctx, null, ROPE, 0.95); k.T([[0.058, 0.49], [0.058, 0.52]], 8, 0.82, 0.12); tuft(ctx, k, -0.5, 0.45, 7, rnd); }
}
function bale(ctx, lod, rnd) {                                    // burlap draped over the bumper bale, two sacks on top
  burlap(ctx, 0.9); blob(ctx, 0.36, 0.63, -1.85, 0.38, 0.2, 0.22, lod <= 2 ? 8 : 5, rnd);
  burlap(ctx, 0.95); const prof = [[-1.6, 0.645], [-1.88, 0.662], [-2.1, 0.648], [-2.14, 0.56], [-2.162, 0.42], [-2.155, 0.25]];
  const nx = lod <= 2 ? 6 : 3, x0 = -0.74, x1 = -0.04, pt = (i, j) => { const hang = j >= 3 ? 0.022 * Math.sin(i * 1.9 + j) : 0;
    return [x0 + (x1 - x0) * i / nx, prof[j][1] + (j === prof.length - 1 ? ((i * 37) % 5 - 2) * 0.018 : 0), prof[j][0] - hang]; };
  for (let i = 0; i < nx; i++) for (let j = 0; j < prof.length - 1; j++) Q(ctx, pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1), [(x0 + x1) / 2, 0.3, -1.85]);
  burlap(ctx, 0.84); blob(ctx, -0.42, 0.655, -1.8, 0.24, 0.15, 0.17, lod <= 2 ? 8 : 5, rnd);
}
function coil(ctx, it, lod) {
  const k = piece(ctx, it), n = lod <= 2 ? 12 : 6; paint(ctx, null, ROPE, 0.95);
  for (const [r, y, ox, oz] of [[0.22, 0.035, 0, 0], [0.2, 0.1, 0.02, 0.012], [0.17, 0.165, -0.012, 0.02]])
    for (let i = 0; i < n; i++) { const a0 = i / n * 6.283, a1 = (i + 1) / n * 6.283;
      k.L([ox + Math.cos(a0) * r, y, oz + Math.sin(a0) * r], [ox + Math.cos(a1) * r, y, oz + Math.sin(a1) * r], 0.065); }
  k.L([-0.22, 0.035, 0], [-0.62, 0.03, 0.1], 0.06);
}
function sign(ctx, it, lod, rnd) {                                 // two posts, a framed oak board; the plaque child carries the words
  const k = piece(ctx, it);
  paint(ctx, 'walnut', 'oklch(0.66 0.06 55)');
  for (const x of [-0.66, 0.66]) { k.B(x, -0.2, 0, 0.09, 1.82, 0.09); if (lod <= 2) k.G(x, 1.62, 0, 0.075, 0.07, 0, 4); }
  k.B(0, 0.9, 0.012, 1.42, 0.05, 0.06); k.B(0, 1.47, 0.012, 1.42, 0.05, 0.06);
  paint(ctx, 'oak', 'oklch(0.86 0.05 70)'); k.B(0, 0.95, 0.012, 1.3, 0.52, 0.03);
  if (lod <= 2) { paint(ctx, null, 'oklch(0.62 0.13 42)', 0.9); k.L([-0.66, 1.52, -0.05], [0.66, 1.52, -0.05], 0.02); tuft(ctx, k, 0.8, 0.15, 6, rnd); tuft(ctx, k, -0.85, -0.05, 5, rnd); }
}
function bellPost(ctx, it, lod, rnd) {
  const k = piece(ctx, it);
  paint(ctx, 'stone', 'oklch(0.9 0.025 82)'); k.B(0, -0.2, 0, 0.34, 0.34, 0.34);
  paint(ctx, 'walnut', 'oklch(0.66 0.06 55)'); k.B(0, 0.12, 0, 0.11, 1.98, 0.11);
  k.L([-0.05, 1.95, 0], [0.5, 1.95, 0], 0.08, 0.09); k.L([0, 1.5, 0], [0.3, 1.93, 0], 0.05);
  paint(ctx, null, IRON, 0.5, 0.6); k.L([0.42, 1.91, 0], [0.42, 1.84, 0], 0.02); if (lod <= 2) k.G(0, 2.1, 0, 0.08, 0.07, 0, 4);
  if (lod <= 2) tuft(ctx, k, 0.2, -0.2, 6, rnd);
}
function bell(ctx, lod) {
  paint(ctx, 'brass', 'oklch(0.86 0.09 85)', 0.35, 0.85);
  lathe(ctx, [[0.14, -0.34], [0.135, -0.315], [0.105, -0.27], [0.09, -0.19], [0.085, -0.12], [0.065, -0.085], [0, -0.075]], lod <= 2 ? 12 : 8);
  paint(ctx, null, IRON, 0.5, 0.6); obox(ctx, 0, -0.085, 0, 0.05, 0.085, 0.025); obox(ctx, 0, -0.03, 0, 0.12, 0.03, 0.04);
  if (lod <= 2) { beam(ctx, [0, -0.09, 0], [0, -0.3, 0], 0.015); gem(ctx, 0, -0.33, 0, 0.03, 0.025, 0.025, 6);
    paint(ctx, null, ROPE, 0.95); beam(ctx, [0, -0.34, 0], [0, -0.62, 0], 0.02); gem(ctx, 0, -0.63, 0, 0.03, 0.02, 0.03, 6); }
}
export const geometry = softened(function geometry(ctx) {
  ctx.flat(); const p = ctx.params, lod = ctx.lod; let s = p.seed ?? 7; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  if (p.kind === 'bell') return bell(ctx, lod);
  const I = p.items;
  desk(ctx, I.desk, lod, rnd); bale(ctx, lod, rnd); coil(ctx, I.coil, lod); sign(ctx, I.sign, lod, rnd); bellPost(ctx, I.bell, lod, rnd);
});
export function collider(ctx) {
  const p = ctx.params; if (p.kind === 'bell') return null;
  const I = p.items, d = piece(ctx, I.desk), g = piece(ctx, I.sign), b = piece(ctx, I.bell);
  d.B(0, 0, 0, 1.14, 0.77, 0.64); d.B(0.82, 0, 0.12, 0.4, 0.55, 0.4);
  for (const x of [-0.66, 0.66]) g.B(x, 0, 0, 0.1, 1.6, 0.1); g.B(0, 0.9, 0.012, 1.42, 0.62, 0.06);
  b.B(0, -0.2, 0, 0.34, 0.34, 0.34); b.B(0, 0, 0, 0.12, 2.1, 0.12);
}
