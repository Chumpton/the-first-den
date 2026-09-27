// A rider on a saddled horse: the horse on the shared quadruped rig, the rider seated on its back (rides the root bone).
import { horse, horseRig, human, saddle, shifted } from './traveller-kit.js';
export function skeleton() { return horseRig([0, 0, 0]); }
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod ?? 1;
  horse(ctx, p.coat, [0, 0, 0]);
  saddle(ctx, p.blanket, lod);
  human(shifted(ctx, [0, 1.6 - 0.92, -0.1]), { ...p, seated: true, straddle: 0.31, stirrups: true, bones: { root: 'root', legL: 'root', legR: 'root', armL: 'root', armR: 'root', head: 'root' } });
  if (lod <= 3) { ctx.bone('root'); ctx.color('oklch(0.3 0.04 50)'); for (const s of [-1, 1]) ctx.quad(s * 0.16, 1.69, -0.45, s * 0.06, 1.66, -1.3, s * 0.06, 1.675, -1.3, s * 0.16, 1.705, -0.45); }
  ctx.bone(null);
}
export function collider() { return null; }
