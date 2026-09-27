// A small fairy, about 22 cm tall: a glowing body, a head with hair, and two pairs of sheer wings on bones (anim/fairy.yml).
// params.glow (her colour), params.hair, params.dress. Feet at y 0, facing -Z.
import { blob, cone } from './critter-mesh.js';
export function skeleton() {
  return { root: { pivot: [0, 0.1, 0] }, wingL: { parent: 'root', pivot: [-0.01, 0.15, 0.015] }, wingR: { parent: 'root', pivot: [0.01, 0.15, 0.015] } };
}
function wing(ctx, pts) { for (let i = 1; i < pts.length - 1; i++) { ctx.tri(...pts[0], ...pts[i], ...pts[i + 1]); ctx.tri(...pts[0], ...pts[i + 1], ...pts[i]); } }
export function geometry(ctx) {
  const p = ctx.params || {}, g = p.glow || 'oklch(0.85 0.14 150)', lo = ctx.lod >= 3;
  ctx.flat(); ctx.roughness(0.5); ctx.bone('root');
  ctx.color(p.dress || g); ctx.emissive(g); cone(ctx, [0, 0.03, 0], [0, 0.15, 0], 0.045, lo ? 5 : 8);          // petal dress
  ctx.emissive(null); ctx.color('oklch(0.88 0.04 60)');
  blob(ctx, [0, 0.148, 0], [0.018, 0.028, 0.016], { seg: lo ? 4 : 6, rings: 3 });                                // torso
  blob(ctx, [0, 0.195, 0], [0.024, 0.026, 0.024], { seg: lo ? 5 : 7, rings: 4 });                                // head
  for (const x of [-1, 1]) { cone(ctx, [x * 0.02, 0.16, 0], [x * 0.04, 0.12, -0.012], 0.006, 3); cone(ctx, [x * 0.012, 0.04, 0], [x * 0.014, 0.0, 0.004], 0.006, 3); }
  ctx.color(p.hair || 'oklch(0.55 0.1 50)'); blob(ctx, [0, 0.205, 0.006], [0.028, 0.024, 0.027], { seg: lo ? 5 : 7, rings: 3 });
  if (!lo) { cone(ctx, [0, 0.2, 0.02], [0, 0.15, 0.04], 0.014, 4); ctx.color('oklch(0.2 0.02 60)'); for (const x of [-1, 1]) blob(ctx, [x * 0.009, 0.196, -0.022], [0.004, 0.005, 0.003], { seg: 4, rings: 2 }); }
  ctx.color(g); ctx.emissive(g); ctx.opacity?.(0.6);
  ctx.bone('wingL'); wing(ctx, [[-0.01, 0.15, 0.015], [-0.07, 0.24, 0.03], [-0.1, 0.2, 0.035], [-0.06, 0.15, 0.025]]); wing(ctx, [[-0.01, 0.14, 0.015], [-0.07, 0.12, 0.03], [-0.06, 0.08, 0.03]]);
  ctx.bone('wingR'); wing(ctx, [[0.01, 0.15, 0.015], [0.07, 0.24, 0.03], [0.1, 0.2, 0.035], [0.06, 0.15, 0.025]]); wing(ctx, [[0.01, 0.14, 0.015], [0.07, 0.12, 0.03], [0.06, 0.08, 0.03]]);
  ctx.emissive(null);
}
export function collider() { return null; }
