// Tall property deer fence. params.kind "run" (default): params.pts [[x,y,z]...] local ground points (the row's feet at y 0),
// a weathered post at every point and eight galvanised strands + a top rail between them, 2.5 m high.
// params.kind "gate": an open gateway params.w wide along local X (centred), two tall posts, a timber lintel with a lantern
// hook, and two wire leaves swung open outward. Every gap in the ring is a gate so roads and the maze path stay open.
import { Q, solid, box } from '../lib/road-solid.js';
const WOOD = 'cdn/texture-weathered-silver-grey-fence-timber.png';
const H = 2.5, STRANDS = [0.12, 0.4, 0.7, 1.0, 1.3, 1.6, 1.9, 2.2];
function tint(ctx, base = 0.86) { const l = base + ctx.random() * 0.08; ctx.color(`oklch(${l.toFixed(3)} 0.014 ${Math.round(55 + ctx.random() * 35)})`); }
function wire(ctx) { ctx.albedo(null); ctx.color('oklch(0.74 0.012 240)'); ctx.metalness?.(0.6); }
function post(ctx, x, y, z, r, h) {
  ctx.albedo(WOOD); tint(ctx);
  const ring = (rr, yy) => [0, 1, 2, 3, 4, 5].map((i) => { const a = i / 6 * Math.PI * 2 + 0.3; return [x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr]; });
  solid(ctx, ring(r, y - 0.4), ring(r * 0.94, y + h - 0.06), false);
  solid(ctx, ring(r * 0.94, y + h - 0.06), ring(r * 0.45, y + h));
}
// a double-sided ribbon from a to b at heights ya/yb (thickness t)
function strand(ctx, a, b, t) {
  const A0 = [a[0], a[1] - t, a[2]], A1 = [a[0], a[1] + t, a[2]], B0 = [b[0], b[1] - t, b[2]], B1 = [b[0], b[1] + t, b[2]];
  ctx.quad(...A0, ...B0, ...B1, ...A1); ctx.quad(...A0, ...A1, ...B1, ...B0);
}
function run(ctx, pts, lod) {
  for (let i = 0; i < pts.length; i++) { const [x, y, z] = pts[i]; post(ctx, x, y, z, i % 6 === 0 ? 0.11 : 0.075, H + (i % 6 === 0 ? 0.25 : 0.1)); }
  wire(ctx);
  const hs = lod <= 2 ? STRANDS : lod <= 4 ? [0.4, 1.3, 2.2] : [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    for (const h of hs) strand(ctx, [a[0], a[1] + h, a[2]], [b[0], b[1] + h, b[2]], h < 0.8 ? 0.012 : 0.009);
    if (lod <= 2) { // vertical stays: the woven deer-mesh look
      const n = 3; for (let k = 1; k <= n; k++) { const t = k / (n + 1), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, z = a[2] + (b[2] - a[2]) * t;
        const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, w = 0.008, ox = -dz / L * w, oz = dx / L * w;
        ctx.quad(x - ox, y + 0.12, z - oz, x + ox, y + 0.12, z + oz, x + ox, y + 2.2, z + oz, x - ox, y + 2.2, z - oz);
        ctx.quad(x - ox, y + 0.12, z - oz, x - ox, y + 2.2, z - oz, x + ox, y + 2.2, z + oz, x + ox, y + 0.12, z + oz); }
    }
    // top rail: a thin timber
    ctx.albedo(WOOD); tint(ctx, 0.8);
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, ox = -dz / L * 0.04, oz = dx / L * 0.04, ya = a[1] + H, yb = b[1] + H;
    solid(ctx, [[a[0] - ox, ya - 0.05, a[2] - oz], [a[0] + ox, ya - 0.05, a[2] + oz], [a[0] + ox, ya + 0.05, a[2] + oz], [a[0] - ox, ya + 0.05, a[2] - oz]],
      [[b[0] - ox, yb - 0.05, b[2] - oz], [b[0] + ox, yb - 0.05, b[2] + oz], [b[0] + ox, yb + 0.05, b[2] + oz], [b[0] - ox, yb + 0.05, b[2] - oz]]);
    wire(ctx);
  }
  ctx.albedo(null);
}
function gate(ctx, w, lod) {
  const hw = w / 2, PH = 4.3;
  for (const s of [-1, 1]) {
    ctx.albedo(WOOD); tint(ctx, 0.78); box(ctx, s * hw - 0.16, -0.4, -0.16, s * hw + 0.16, PH, 0.16);
    tint(ctx, 0.74); box(ctx, s * hw - 0.2, PH, -0.2, s * hw + 0.2, PH + 0.12, 0.2); // cap
    // brace down into the fence line
    tint(ctx, 0.8); solid(ctx, [[s * hw, 2.6, -0.06], [s * hw, 2.6, 0.06], [s * hw, 2.75, 0.06], [s * hw, 2.75, -0.06]], [[s * (hw + 1.6), 0.05, -0.06], [s * (hw + 1.6), 0.05, 0.06], [s * (hw + 1.6), 0.2, 0.06], [s * (hw + 1.6), 0.2, -0.06]]);
    // open leaf: swung out 100° to the +Z side, hinged on the post
    const lw = Math.min(hw - 0.3, 3.2), a = (s < 0 ? 1 : -1) * 0, dirx = s * Math.cos(1.75) * -1, dirz = Math.sin(1.75);
    const hx = s * (hw - 0.2), ex = hx + dirx * lw * -s * s, ez = dirz * lw;
    const P = (t, y) => [hx + (ex - hx) * t, y, 0.2 + (ez) * t];
    ctx.albedo(WOOD); tint(ctx, 0.82);
    for (const y of [0.15, 1.1, 2.05]) { const A = P(0, y), B = P(1, y); solid(ctx, [[A[0], y, A[2] - 0.04], [A[0], y, A[2] + 0.04], [A[0], y + 0.1, A[2] + 0.04], [A[0], y + 0.1, A[2] - 0.04]], [[B[0], y, B[2] - 0.04], [B[0], y, B[2] + 0.04], [B[0], y + 0.1, B[2] + 0.04], [B[0], y + 0.1, B[2] - 0.04]]); }
    const E = P(1, 0); box(ctx, E[0] - 0.05, 0.1, E[2] - 0.05, E[0] + 0.05, 2.2, E[2] + 0.05);
    if (lod <= 3) { wire(ctx); for (const y of [0.45, 0.8, 1.45, 1.8]) strand(ctx, P(0, y), P(1, y), 0.008); }
  }
  // lintel beam + a little roof board
  ctx.albedo(WOOD); tint(ctx, 0.72); box(ctx, -hw - 0.5, PH - 0.35, -0.13, hw + 0.5, PH - 0.05, 0.13);
  tint(ctx, 0.66); solid(ctx, [[-hw - 0.7, PH + 0.12, -0.45], [hw + 0.7, PH + 0.12, -0.45], [hw + 0.7, PH + 0.12, 0.45], [-hw - 0.7, PH + 0.12, 0.45]], [[-hw - 0.7, PH + 0.5, 0], [hw + 0.7, PH + 0.5, 0], [hw + 0.7, PH + 0.5, 0], [-hw - 0.7, PH + 0.5, 0]]);
  // hanging lantern hook + lamp body
  ctx.albedo(null); ctx.color('oklch(0.3 0.01 60)'); box(ctx, -0.02, PH - 0.75, -0.02, 0.02, PH - 0.35, 0.02);
  ctx.color('oklch(0.93 0.12 80)'); ctx.emissive?.('oklch(0.85 0.15 75)', 2.5); box(ctx, -0.12, PH - 1.05, -0.12, 0.12, PH - 0.75, 0.12); ctx.emissive?.(null);
  ctx.albedo(null);
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod ?? 1;
  ctx.flat(); ctx.roughness(0.9);
  if (p.kind === 'gate') gate(ctx, p.w ?? 9, lod); else run(ctx, p.pts || [], lod);
}
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'gate') { const hw = (p.w ?? 9) / 2; for (const s of [-1, 1]) box(ctx, s * hw - 0.18, -0.4, -0.18, s * hw + 0.18, 4.3, 0.18); return; }
  const pts = p.pts || [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, ox = -dz / L * 0.08, oz = dx / L * 0.08;
    solid(ctx, [[a[0] - ox, a[1] - 0.3, a[2] - oz], [a[0] + ox, a[1] - 0.3, a[2] + oz], [b[0] + ox, b[1] - 0.3, b[2] + oz], [b[0] - ox, b[1] - 0.3, b[2] - oz]],
      [[a[0] - ox, a[1] + H, a[2] - oz], [a[0] + ox, a[1] + H, a[2] + oz], [b[0] + ox, b[1] + H, b[2] + oz], [b[0] - ox, b[1] + H, b[2] - oz]]);
  }
}
