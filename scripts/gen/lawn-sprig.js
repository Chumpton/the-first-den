// Tiny low lawn life, 4–14 cm tall. params.kind: "tuft" (a few blades), "clover" (trefoil patch), "daisy", "buttercup", "violet", "tulip", "rose" (params.hue tints tulip/rose).
// A small clump per instance; feet at 0. No collider.
import { blob } from './critter-mesh.js';
const TAU = Math.PI * 2;
function blade(ctx, x, z, h, lean, a) { const w = 0.012, c = Math.cos(a), s = Math.sin(a), tx = x + Math.cos(a + 1.5) * lean, tz = z + Math.sin(a + 1.5) * lean;
  ctx.tri(x - c * w, 0, z - s * w, x + c * w, 0, z + s * w, tx, h, tz); ctx.tri(x + c * w, 0, z + s * w, x - c * w, 0, z - s * w, tx, h, tz); }
function flower(ctx, x, h, z, petal, center, r, n) {
  ctx.color('oklch(0.6 0.12 135)'); blade(ctx, x, z, h, 0.01, 0.3);
  ctx.color(petal); for (let i = 0; i < n; i++) { const a = i / n * TAU, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r, ox = Math.cos(a + 0.5) * r * 0.45, oz = Math.sin(a + 0.5) * r * 0.45;
    ctx.tri(x, h, z, px - ox, h + 0.004, pz - oz, px + ox, h + 0.004, pz + oz); ctx.tri(x, h, z, px + ox, h + 0.004, pz + oz, px - ox, h + 0.004, pz - oz); }
  ctx.color(center); blob(ctx, [x, h + 0.006, z], [r * 0.3, r * 0.2, r * 0.3], { seg: 5, rings: 2 });
}
export function geometry(ctx) {
  const p = ctx.params || {}, k = p.kind || 'tuft', rnd = () => ctx.random(), lo = ctx.lod >= 3;
  ctx.flat(); ctx.roughness(0.85);
  const grass = () => ctx.color(`oklch(${(0.62 + rnd() * 0.1).toFixed(3)} ${(0.1 + rnd() * 0.04).toFixed(3)} ${(125 + rnd() * 15).toFixed(0)})`);
  const nb = lo ? 3 : 7; for (let i = 0; i < nb; i++) { grass(); const a = rnd() * TAU, d = rnd() * 0.06; blade(ctx, Math.cos(a) * d, Math.sin(a) * d, 0.05 + rnd() * (k === 'tuft' ? 0.1 : 0.05), 0.02 + rnd() * 0.03, rnd() * TAU); }
  if (k === 'clover') { const n = lo ? 3 : 6; for (let i = 0; i < n; i++) { const cx = (rnd() - 0.5) * 0.14, cz = (rnd() - 0.5) * 0.14, h = 0.03 + rnd() * 0.03; ctx.color('oklch(0.58 0.12 140)');
      for (let j = 0; j < 3; j++) { const a = j / 3 * TAU + rnd(); blob(ctx, [cx + Math.cos(a) * 0.014, h, cz + Math.sin(a) * 0.014], [0.014, 0.004, 0.014], { seg: 5, rings: 2 }); } }
    if (!lo && rnd() < 0.5) flower(ctx, 0.03, 0.07, 0.02, 'oklch(0.93 0.03 340)', 'oklch(0.85 0.06 350)', 0.012, 7); }
  const n = lo ? 1 : 2 + Math.floor(rnd() * 3);
  if (k === 'daisy') for (let i = 0; i < n; i++) flower(ctx, (rnd() - 0.5) * 0.14, 0.06 + rnd() * 0.06, (rnd() - 0.5) * 0.14, 'oklch(0.97 0.01 90)', 'oklch(0.85 0.16 90)', 0.018, 8);
  if (k === 'buttercup') for (let i = 0; i < n; i++) flower(ctx, (rnd() - 0.5) * 0.14, 0.08 + rnd() * 0.06, (rnd() - 0.5) * 0.14, 'oklch(0.88 0.17 95)', 'oklch(0.8 0.15 80)', 0.014, 5);
  if (k === 'violet') for (let i = 0; i < n; i++) flower(ctx, (rnd() - 0.5) * 0.12, 0.05 + rnd() * 0.04, (rnd() - 0.5) * 0.12, 'oklch(0.6 0.16 300)', 'oklch(0.9 0.1 95)', 0.013, 5);
  if (k === 'tulip') { const hue = p.hue ?? 25, m = lo ? 1 : 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < m; i++) { const x = (rnd() - 0.5) * 0.12, z = (rnd() - 0.5) * 0.12, h = 0.1 + rnd() * 0.05, a0 = rnd() * TAU;
      ctx.color('oklch(0.58 0.11 140)'); blade(ctx, x, z, h, 0.005, a0);
      for (const s of [0, Math.PI]) { const la = a0 + s + 0.4, lx = Math.cos(la) * 0.05, lz = Math.sin(la) * 0.05; ctx.tri(x, 0, z, x + lx, h * 0.55, z + lz, x + lz * 0.35, h * 0.7, z - lx * 0.35); ctx.tri(x, 0, z, x + lz * 0.35, h * 0.7, z - lx * 0.35, x + lx, h * 0.55, z + lz); }
      ctx.color(`oklch(${(0.62 + rnd() * 0.1).toFixed(3)} 0.2 ${(hue + (rnd() - 0.5) * 16).toFixed(0)})`);
      const r = 0.018, c = 0.034;
      for (let j = 0; j < 4; j++) { const a = a0 + j / 4 * TAU, b = a + TAU / 4, px = Math.cos(a) * r, pz = Math.sin(a) * r, qx = Math.cos(b) * r, qz = Math.sin(b) * r, ox = (px + qx) * 0.75, oz = (pz + qz) * 0.75;
        ctx.tri(x, h, z, x + px, h + c * 0.4, z + pz, x + ox, h + c, z + oz); ctx.tri(x, h, z, x + ox, h + c, z + oz, x + qx, h + c * 0.4, z + qz);
        ctx.tri(x, h, z, x + ox, h + c, z + oz, x + px, h + c * 0.4, z + pz); ctx.tri(x, h, z, x + qx, h + c * 0.4, z + qz, x + ox, h + c, z + oz); } } }
  if (k === 'rose') { const hue = p.hue ?? 5; ctx.color('oklch(0.42 0.08 145)');
    for (let i = 0; i < (lo ? 2 : 5); i++) { const a = rnd() * TAU, d = 0.03 + rnd() * 0.06; blob(ctx, [Math.cos(a) * d, 0.05 + rnd() * 0.04, Math.sin(a) * d], [0.045, 0.03, 0.045], { seg: 5, rings: 2 }); }
    const m = lo ? 1 : 2 + Math.floor(rnd() * 2);
    for (let i = 0; i < m; i++) { const x = (rnd() - 0.5) * 0.12, z = (rnd() - 0.5) * 0.12, h = 0.1 + rnd() * 0.04, L = 0.5 + rnd() * 0.12;
      ctx.color(`oklch(${L.toFixed(3)} 0.19 ${(hue + (rnd() - 0.5) * 14).toFixed(0)})`); blob(ctx, [x, h, z], [0.024, 0.02, 0.024], { seg: 6, rings: 3 });
      ctx.color(`oklch(${(L - 0.12).toFixed(3)} 0.17 ${hue})`); blob(ctx, [x, h + 0.014, z], [0.012, 0.01, 0.012], { seg: 5, rings: 2 }); } }
}
export function collider() { return null; }
