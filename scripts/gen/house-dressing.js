// small path dressing by the front of the den. params.item: "mailbox" | "board" | "birdbath". Front = -Z, feet at y 0.
// mailbox: params.flag (true = red flag up); board: the notice itself is a ui plate on a child row.
import { paint, obox, blob, gem, lathe, beam, box, TAU } from '../lib/yard-kit.js';
function mailbox(ctx, lod) {
  const flag = !!ctx.params.flag;
  paint(ctx, 'walnut', 'oklch(0.75 0.05 55)', 0.85);
  obox(ctx, 0, 0, 0, 0.1, 1.02, 0.1);
  obox(ctx, 0, 0.94, 0, 0.16, 0.06, 0.4);
  if (lod <= 2) beam(ctx, [0, 0.62, 0], [0, 0.94, 0.14], 0.05, 0.05);
  // the box: a teal tin with a rounded top
  paint(ctx, null, '#5dada9', 0.55, 0.2);
  obox(ctx, 0, 1.0, 0, 0.26, 0.16, 0.46);
  const n = lod <= 2 ? 8 : 4;
  for (let i = 0; i < n; i++) {
    const a0 = Math.PI * i / n, a1 = Math.PI * (i + 1) / n, p = (a, z) => [Math.cos(a) * 0.13, 1.16 + Math.sin(a) * 0.13, z];
    const A = p(a0, -0.23), B = p(a1, -0.23), C = p(a1, 0.23), D = p(a0, 0.23);
    ctx.quad(...D, ...C, ...B, ...A);
    ctx.tri(0, 1.16, -0.23, ...A, ...B); ctx.tri(0, 1.16, 0.23, ...C, ...D);
  }
  // door rim and pull
  paint(ctx, null, 'oklch(0.45 0.07 200)', 0.5, 0.3);
  obox(ctx, 0, 1.0, -0.235, 0.27, 0.02, 0.015);
  paint(ctx, 'brass', 'oklch(0.9 0.05 80)', 0.4, 0.7); obox(ctx, 0, 1.16, -0.245, 0.04, 0.03, 0.02);
  // the flag on the +x side
  paint(ctx, null, 'oklch(0.58 0.2 28)', 0.6);
  const fx = 0.145;
  if (flag) { obox(ctx, fx, 1.05, 0.08, 0.02, 0.32, 0.03); obox(ctx, fx, 1.26, 0.13, 0.02, 0.11, 0.1); }
  else { obox(ctx, fx, 1.08, 0.02, 0.02, 0.03, 0.34); obox(ctx, fx, 1.08, -0.18, 0.02, 0.1, 0.1); }
}
function board(ctx, lod) {
  paint(ctx, 'walnut', 'oklch(0.72 0.05 55)', 0.85);
  for (const s of [-1, 1]) obox(ctx, s * 0.56, 0, 0, 0.1, 1.95, 0.1);
  paint(ctx, 'oak', 'oklch(0.9 0.06 70)', 0.85);
  obox(ctx, 0, 0.85, 0.02, 1.02, 0.78, 0.05);
  paint(ctx, 'walnut', 'oklch(0.6 0.06 50)', 0.85);
  for (const [y, h] of [[0.8, 0.06], [1.62, 0.06]]) obox(ctx, 0, y, 0, 1.16, h, 0.09);
  // a little shingled roof
  paint(ctx, null, 'oklch(0.5 0.06 45)', 0.9);
  for (const s of [-1, 1]) { const z0 = s * 0.2; ctx.quad(-0.7, 1.95, 0, 0.7, 1.95, 0, 0.7, 1.82, z0, -0.7, 1.82, z0); ctx.quad(-0.7, 1.82, z0, 0.7, 1.82, z0, 0.7, 1.95, 0, -0.7, 1.95, 0); }
  if (lod <= 2) { paint(ctx, null, 'oklch(0.72 0.12 90)', 0.4, 0.6); for (const [x, y] of [[-0.44, 1.52], [0.44, 1.52], [-0.44, 0.93], [0.44, 0.93]]) gem(ctx, x, y, -0.01, 0.02, 0.01, 0.01, 4); }
}
function birdbath(ctx, lod) {
  const n = lod <= 2 ? 10 : 6;
  paint(ctx, 'stone', 'oklch(0.9 0.02 80)', 0.92);
  lathe(ctx, [[0.24, 0], [0.24, 0.08], [0.13, 0.12], [0.09, 0.3], [0.08, 0.62], [0.12, 0.7], [0.3, 0.76], [0.36, 0.84], [0.33, 0.85]], n);
  ctx.albedo(null); ctx.color('oklch(0.62 0.07 195)'); ctx.roughness(0.05); ctx.metalness(0.1);
  lathe(ctx, [[0.3, 0.82]], n);
  // a little bird on the rim, head toward the path
  ctx.metalness(0); ctx.roughness(0.8);
  const bx = 0.31, by = 0.86;
  ctx.color('oklch(0.55 0.06 55)'); blob(ctx, bx, by, 0, 0.055, 0.05, 0.075, 5);
  ctx.color('oklch(0.72 0.12 45)'); blob(ctx, bx, by + 0.015, -0.035, 0.045, 0.04, 0.04, 5);
  ctx.color('oklch(0.5 0.06 55)'); blob(ctx, bx, by + 0.07, -0.065, 0.035, 0.035, 0.035, 5);
  ctx.color('oklch(0.8 0.12 85)'); gem(ctx, bx, by + 0.08, -0.105, 0.012, 0.004, 0.004, 3);
  ctx.color('oklch(0.4 0.05 55)'); ctx.tri(bx, by + 0.04, 0.06, bx - 0.03, by + 0.06, 0.15, bx + 0.03, by + 0.06, 0.15);
  ctx.color('oklch(0.15 0 0)'); for (const s of [-1, 1]) box(ctx, bx + s * 0.03 - 0.006, by + 0.08, -0.08, bx + s * 0.03 + 0.006, by + 0.092, -0.07);
}
export function geometry(ctx) {
  const lod = ctx.lod || 1, item = ctx.params?.item; ctx.flat();
  if (item === 'mailbox') mailbox(ctx, lod); else if (item === 'board') board(ctx, lod); else birdbath(ctx, lod);
}
export function collider(ctx) {
  const item = ctx.params?.item;
  if (item === 'mailbox') return { kind: 'box', width: 0.3, height: 1.3, depth: 0.5 };
  if (item === 'board') return { kind: 'box', width: 1.2, height: 1.95, depth: 0.2 };
  return { kind: 'box', width: 0.5, height: 0.85, depth: 0.5 };
}
