// A horse-drawn covered caravan: oak wagon bed on four spoked wheels, linen bonnet on walnut hoops, a driver on the bench,
// one horse in the shafts. Bones: body (wagon), the horse rig (offset forward), four wheels, the driver.
import { PAL, Q, T, box, horse, horseRig, human, rod, shifted, wheel, blob, sidesOf } from './traveller-kit.js';
const HZ = -3.35, RF = 0.405, RB = 0.54, ZF = -1.15, ZB = 1.15, WX = 0.9;
export function skeleton() {
  return {
    body: { pivot: [0, 0.8, 0] },
    ...horseRig([0, 0, HZ], 'body'),
    wFL: { parent: 'body', pivot: [-WX, RF, ZF] }, wFR: { parent: 'body', pivot: [WX, RF, ZF] },
    wBL: { parent: 'body', pivot: [-WX - 0.02, RB, ZB] }, wBR: { parent: 'body', pivot: [WX + 0.02, RB, ZB] },
    driver: { parent: 'body', pivot: [0, 1.38, -1.88] },
  };
}
function bonnet(ctx, lod, linen, linen2) {
  const zs = lod <= 2 ? [-1.55, -1.35, -0.8, -0.25, 0.3, 0.85, 1.35, 1.55] : lod <= 3 ? [-1.55, -0.3, 0.9, 1.55] : [-1.55, 1.55];
  const steps = lod <= 2 ? 10 : lod <= 3 ? 7 : 4, Y0 = 1.2;
  const fl = (z) => (z <= -1.5 || z >= 1.5 ? 0.07 : 0);
  const P = (i, z, e = 0) => { const a = (Math.PI * i) / steps; return [Math.cos(a) * (0.84 + fl(z) + e), Y0 + Math.sin(a) * (1.02 + fl(z) * 0.8 + e), z]; };
  for (let j = 0; j < zs.length - 1; j++) {
    ctx.color(j % 2 ? linen2 : linen);
    for (let i = 0; i < steps; i++) Q(ctx, P(i, zs[j]), P(i + 1, zs[j]), P(i + 1, zs[j + 1]), P(i, zs[j + 1]), [0, Y0 + 0.3, (zs[j] + zs[j + 1]) / 2]);
  }
  if (lod <= 3) {
    ctx.color(PAL.walnut);
    for (const z of zs.slice(1, -1)) for (let i = 0; i < steps; i++) {
      const A = (k, dz) => { const p = P(k, z, 0.018); p[2] = z + dz; return p; };
      Q(ctx, A(i, -0.03), A(i + 1, -0.03), A(i + 1, 0.03), A(i, 0.03), [0, Y0 + 0.3, z]);
    }
  }
  // back: puckered linen closure; front: the dim inside of the wagon
  const cB = [0, Y0 + 0.35, 1.47], cF = [0, Y0 + 0.4, -1.15];
  ctx.color(linen2);
  for (let i = 0; i < steps; i++) { const a = P(i, 1.5), b = P(i + 1, 1.5); T(ctx, cB, a, b, [0, Y0 + 0.3, 1.0]); }
  ctx.color('oklch(0.26 0.03 50)');
  for (let i = 0; i < steps; i++) { const a = P(i, -1.15), b = P(i + 1, -1.15); T(ctx, cF, a, b, [0, Y0 + 0.3, -0.6]); }
}
export function geometry(ctx) {
  const p = ctx.params, lod = ctx.lod ?? 1, n = sidesOf(lod);
  ctx.flat(); ctx.roughness(0.88);
  ctx.bone('body');
  // bed, side boards, undercarriage
  ctx.color(PAL.oak); box(ctx, -0.78, 0.78, -1.75, 0.78, 0.92, 1.75);
  ctx.color(p.boards || 'oklch(0.55 0.08 60)');
  for (const s of [-1, 1]) box(ctx, Math.min(s * 0.78, s * 0.85), 0.92, -1.75, Math.max(s * 0.78, s * 0.85), 1.24, 1.75);
  box(ctx, -0.78, 0.92, 1.68, 0.78, 1.2, 1.75); box(ctx, -0.78, 0.92, -1.75, 0.78, 1.14, -1.68);
  if (lod <= 2) { ctx.color(PAL.walnut); for (const s of [-1, 1]) for (const z of [-1.2, -0.4, 0.4, 1.2]) box(ctx, Math.min(s * 0.85, s * 0.87), 0.9, z - 0.03, Math.max(s * 0.85, s * 0.87), 1.26, z + 0.03); }
  ctx.color(PAL.walnut);
  box(ctx, -0.08, 0.55, -1.55, 0.08, 0.78, 1.55);
  box(ctx, -WX + 0.02, RF - 0.05, ZF - 0.05, WX - 0.02, RF + 0.05, ZF + 0.05); box(ctx, -0.5, RF + 0.05, ZF - 0.07, 0.5, 0.78, ZF + 0.07);
  box(ctx, -WX + 0.02, RB - 0.05, ZB - 0.05, WX - 0.02, RB + 0.05, ZB + 0.05); box(ctx, -0.5, RB + 0.05, ZB - 0.07, 0.5, 0.78, ZB + 0.07);
  // bench, footboard, shafts
  ctx.color(PAL.oak); box(ctx, -0.62, 1.3, -2.05, 0.62, 1.38, -1.7);
  ctx.color(PAL.walnut); for (const s of [-1, 1]) box(ctx, s * 0.55 - 0.04, 0.92, -2.0, s * 0.55 + 0.04, 1.3, -1.92);
  ctx.color(PAL.oak); box(ctx, -0.6, 0.86, -2.4, 0.6, 0.93, -1.75);
  ctx.color(PAL.walnut); for (const s of [-1, 1]) rod(ctx, [s * 0.42, 0.86, -1.7], [s * 0.4, 1.22, HZ - 0.55], 0.035, 5);
  bonnet(ctx, lod, p.canvas || PAL.linen, p.canvas2 || PAL.linen2);
  if (lod <= 3) {
    ctx.color(PAL.iron); rod(ctx, [0.55, 2.02, -1.58], [0.55, 1.86, -1.62], 0.008, 3, false);
    ctx.color('oklch(0.72 0.1 85)'); ctx.emissive(2.6, 1.5, 0.55); box(ctx, 0.5, 1.72, -1.67, 0.6, 1.86, -1.57); ctx.emissive(null);
    ctx.color(PAL.linen2); blob(ctx, [-0.35, 1.02, 1.95], 0.2, 0.16, 0.14, n); blob(ctx, [0.15, 1.0, 1.95], 0.18, 0.14, 0.13, n);
    ctx.color(PAL.oak); box(ctx, -0.6, 0.82, 1.75, 0.6, 0.88, 2.1);
  }
  // wheels
  ctx.bone('wFL'); wheel(ctx, -WX, RF, ZF, RF, lod);
  ctx.bone('wFR'); wheel(ctx, WX, RF, ZF, RF, lod);
  ctx.bone('wBL'); wheel(ctx, -WX - 0.02, RB, ZB, RB, lod);
  ctx.bone('wBR'); wheel(ctx, WX + 0.02, RB, ZB, RB, lod);
  // horse in the shafts, the driver on the bench
  horse(ctx, p.coat, [0, 0, HZ], { harness: true });
  human(shifted(ctx, [0, 1.38 - 0.92, -1.88]), { ...p, seated: true, straddle: 0.15, bones: { root: 'driver', legL: 'driver', legR: 'driver', armL: 'driver', armR: 'driver', head: 'driver' } });
  if (lod <= 3) { ctx.bone('body'); ctx.color('oklch(0.3 0.04 50)'); for (const s of [-1, 1]) ctx.quad(s * 0.16, 1.48, -2.22, s * 0.07, 1.66, HZ - 1.3, s * 0.07, 1.675, HZ - 1.3, s * 0.16, 1.495, -2.22); }
  ctx.bone(null);
}
export function collider() { return null; }
