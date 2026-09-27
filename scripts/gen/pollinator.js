// Garden pollinators. params.kind bee | butterfly | dragonfly, params.variant picks the colours. Feet at y 0, head to -Z.
// Wings are bones (wingL/wingR, plus hind wings on the dragonfly) flapped by anim/pollinator.yml.
import { blob, cone } from './critter-mesh.js';
const BF = {
  monarch: ['oklch(0.72 0.18 55)', 'oklch(0.2 0.02 50)'], blue: ['oklch(0.66 0.15 245)', 'oklch(0.25 0.04 260)'],
  white: ['oklch(0.97 0.02 95)', 'oklch(0.45 0.03 90)'], lemon: ['oklch(0.9 0.16 100)', 'oklch(0.55 0.1 90)'], pink: ['oklch(0.8 0.1 350)', 'oklch(0.4 0.08 330)'],
};
const DF = { teal: ['oklch(0.62 0.13 195)', 'oklch(0.45 0.1 200)'], red: ['oklch(0.58 0.2 28)', 'oklch(0.4 0.15 25)'], blue: ['oklch(0.55 0.16 255)', 'oklch(0.35 0.1 260)'] };
export function skeleton(ctx) {
  const k = ctx?.params?.kind;
  const s = { root: { pivot: [0, 0.02, 0] }, wingL: { parent: 'root', pivot: [-0.004, 0.028, -0.004] }, wingR: { parent: 'root', pivot: [0.004, 0.028, -0.004] } };
  if (k === 'dragonfly') { s.wingL2 = { parent: 'root', pivot: [-0.004, 0.028, 0.008] }; s.wingR2 = { parent: 'root', pivot: [0.004, 0.028, 0.008] }; }
  return s;
}
function wing(ctx, pts) { for (let i = 1; i < pts.length - 1; i++) { ctx.tri(...pts[0], ...pts[i], ...pts[i + 1]); ctx.tri(...pts[0], ...pts[i + 1], ...pts[i]); } }
export function geometry(ctx) {
  const p = ctx.params || {}, lo = ctx.lod >= 3; ctx.flat(); ctx.roughness(0.6);
  if (p.kind === 'bee') {
    ctx.bone('root');
    for (let i = 0; i < 3; i++) { ctx.color(i % 2 ? 'oklch(0.22 0.02 60)' : 'oklch(0.82 0.16 85)'); blob(ctx, [0, 0.02, 0.002 + i * 0.008], [0.011, 0.011, 0.006], { seg: lo ? 4 : 6, rings: 3 }); }
    ctx.color('oklch(0.22 0.02 60)'); blob(ctx, [0, 0.022, -0.012], [0.008, 0.008, 0.008], { seg: lo ? 4 : 5, rings: 3 });
    if (!lo) cone(ctx, [0, 0.02, 0.024], [0, 0.019, 0.03], 0.003, 3);
    ctx.color('oklch(0.97 0.01 240 / 0.6)'); ctx.opacity?.(0.55);
    ctx.bone('wingL'); wing(ctx, [[-0.004, 0.028, -0.006], [-0.026, 0.032, -0.002], [-0.024, 0.03, 0.01], [-0.004, 0.028, 0.004]]);
    ctx.bone('wingR'); wing(ctx, [[0.004, 0.028, -0.006], [0.026, 0.032, -0.002], [0.024, 0.03, 0.01], [0.004, 0.028, 0.004]]);
    return;
  }
  if (p.kind === 'dragonfly') {
    const [a, b] = DF[p.variant] ?? DF.teal; ctx.bone('root');
    ctx.color(a); blob(ctx, [0, 0.022, -0.008], [0.006, 0.006, 0.012], { seg: 5, rings: 3 });
    ctx.color(b); cone(ctx, [0, 0.022, 0.004], [0, 0.024, 0.07], 0.0035, 4);
    ctx.color('oklch(0.3 0.05 150)'); for (const x of [-1, 1]) blob(ctx, [x * 0.005, 0.024, -0.022], [0.005, 0.005, 0.005], { seg: 4, rings: 2 });
    ctx.color('oklch(0.96 0.02 220 / 0.5)'); ctx.opacity?.(0.45);
    for (const [bn, x, z] of [['wingL', -1, -0.012], ['wingR', 1, -0.012], ['wingL2', -1, 0.002], ['wingR2', 1, 0.002]]) { ctx.bone(bn);
      wing(ctx, [[x * 0.004, 0.028, z], [x * 0.03, 0.029, z - 0.004], [x * 0.052, 0.029, z + 0.001], [x * 0.03, 0.028, z + 0.008], [x * 0.004, 0.028, z + 0.004]]); }
    return;
  }
  const [a, b] = BF[p.variant] ?? BF.monarch; ctx.bone('root');
  ctx.color('oklch(0.2 0.02 60)'); cone(ctx, [0, 0.02, -0.014], [0, 0.02, 0.018], 0.003, 4);
  if (!lo) { cone(ctx, [-0.001, 0.021, -0.014], [-0.008, 0.03, -0.028], 0.0007, 3); cone(ctx, [0.001, 0.021, -0.014], [0.008, 0.03, -0.028], 0.0007, 3); }
  for (const [bn, x] of [['wingL', -1], ['wingR', 1]]) { ctx.bone(bn);
    ctx.color(a); wing(ctx, [[x * 0.003, 0.021, -0.012], [x * 0.03, 0.022, -0.03], [x * 0.042, 0.022, -0.012], [x * 0.032, 0.021, 0.004], [x * 0.003, 0.021, 0.002]]);
    ctx.color(a); wing(ctx, [[x * 0.003, 0.021, 0.002], [x * 0.026, 0.021, 0.006], [x * 0.022, 0.02, 0.026], [x * 0.004, 0.02, 0.016]]);
    if (!lo) { ctx.color(b); wing(ctx, [[x * 0.03, 0.0222, -0.03], [x * 0.042, 0.0222, -0.012], [x * 0.036, 0.0222, -0.02]]); }
  }
}
export function collider() { return null; }
