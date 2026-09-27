// A lone road walker: pilgrim, merchant or child — one rig (legs, arms, head), the look from params.
import { human } from './traveller-kit.js';
export function skeleton() {
  return {
    root: { pivot: [0, 0.95, 0] },
    legL: { parent: 'root', pivot: [-0.095, 0.93, 0] }, legR: { parent: 'root', pivot: [0.095, 0.93, 0] },
    armL: { parent: 'root', pivot: [-0.205, 1.42, 0] }, armR: { parent: 'root', pivot: [0.205, 1.42, 0] },
    head: { parent: 'root', pivot: [0, 1.52, 0] },
  };
}
export function geometry(ctx) { human(ctx, { ...ctx.params }); }
export function collider() { return null; }
