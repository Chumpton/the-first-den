// Tomas the Courier's chestnut: saddled, bridled, a pillion pad behind the saddle for a passenger. params.mounted draws
// Tomas seated with reins in hand; otherwise a lead rope runs from the bridle's chin ring to params.hand (Tomas's hand,
// horse-local). The horse rides the shared quadruped rig (traveller-kit horseRig), so anim/courier.yml moves its legs.
import { horse, horseRig, human, saddle, shifted, rod, box, PAL } from './traveller-kit.js';
export function skeleton() { return horseRig([0, 0, 0]); }
export function geometry(ctx) {
  ctx.smooth();
  const p = ctx.params || {}, lod = ctx.lod ?? 1;
  horse(ctx, p.coat || 'chestnut', [0, 0, 0]);
  saddle(ctx, p.blanket, lod);
  ctx.bone('root');
  ctx.color(p.pad || 'oklch(0.42 0.06 145)'); box(ctx, -0.2, 1.5, 0.3, 0.2, 1.585, 0.72);        // pillion pad
  if (lod <= 3) { ctx.color(PAL.leather); for (const s of [-1, 1]) box(ctx, s * 0.27 - 0.1, 1.05, 0.52, s * 0.27 + 0.1, 1.38, 0.78); } // saddlebags
  if (lod <= 2) { ctx.bone('head'); ctx.color(PAL.walnut); for (const s of [-1, 1]) rod(ctx, [s * 0.075, 1.96, -0.92], [s * 0.07, 1.7, -1.24], 0.012, 4, false); ctx.color('oklch(0.72 0.1 85)'); for (const s of [-1, 1]) box(ctx, s * 0.075 - 0.012, 1.67, -1.28, s * 0.075 + 0.012, 1.71, -1.22); }
  if (p.mounted) {
    human(shifted(ctx, [0, 1.6 - 0.92, -0.1]), { ...(p.man || {}), seated: true, straddle: 0.31, stirrups: true, bones: { root: 'root', legL: 'root', legR: 'root', armL: 'root', armR: 'root', head: 'root' } });
    if (lod <= 3) { ctx.bone('root'); ctx.color('oklch(0.3 0.04 50)'); for (const s of [-1, 1]) ctx.quad(s * 0.16, 1.69, -0.45, s * 0.07, 1.66, -1.24, s * 0.07, 1.675, -1.24, s * 0.16, 1.705, -0.45); }
  } else if (p.hand) {
    // lead rope: chin ring to Tomas's hand, a gentle sag; the chin end rides the head
    const a = [0, 1.64, -1.27], h = p.hand, n = lod <= 2 ? 6 : 3;
    const at = (t) => [a[0] + (h[0] - a[0]) * t, a[1] + (h[1] - a[1]) * t - Math.sin(t * Math.PI) * 0.22, a[2] + (h[2] - a[2]) * t];
    ctx.color('oklch(0.62 0.06 75)');
    for (let i = 0; i < n; i++) { ctx.bone(i === 0 ? 'head' : null); rod(ctx, at(i / n), at((i + 1) / n), 0.013, 4, false); }
  }
  ctx.bone(null);
}
export function collider() { return null; }
