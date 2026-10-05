// Tall property deer fence. params.kind "run" (default): params.pts [[x,y,z]...] local ground points (the row's feet at y 0),
// a weathered post at every point and eight galvanised strands + a top rail between them, 2.5 m high.
// params.kind "gate": an open gateway params.w wide along local X (centred), two tall posts, a timber lintel with a lantern
// hook, and two wire leaves swung open outward. Every gap in the ring is a gate so roads and the maze path stay open.
import { Q, solid, box } from '../lib/road-solid.js';
import { softened } from "./soften.js";
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

// ---- stone style: a tall dry-laid limestone deer wall, coursed blocks, a coping slab, moss and ivy, a pier every 4th point
const LIME_TEX = 'cdn/texture-pale-limestone-flagstone.png', MOSS_TEX = 'cdn/texture-soft-green-moss-carpet.png', IVY_TEX = 'cdn/texture-lush-green-ivy-leaves.png';
const SH = 2.4, ST = 0.6;
function obb(ctx, a, b, ya, yb, h0, h1, t) { // a block along a->b (xz), bottom at ground+h0, top at ground+h1, thickness t
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * t / 2, nz = dx / L * t / 2;
  const B = [[a[0] - nx, ya + h0, a[1] - nz], [a[0] + nx, ya + h0, a[1] + nz], [b[0] + nx, yb + h0, b[1] + nz], [b[0] - nx, yb + h0, b[1] - nz]];
  const T = [[a[0] - nx, ya + h1, a[1] - nz], [a[0] + nx, ya + h1, a[1] + nz], [b[0] + nx, yb + h1, b[1] + nz], [b[0] - nx, yb + h1, b[1] - nz]];
  solid(ctx, B, T);
}
// warm pale limestone: a narrow, high tint band (a tint multiplies the texture; below L 0.9 a block goes grey-dark and the courses read as a checker)
function lime(ctx) { const l = 0.93 + ctx.random() * 0.045; ctx.albedo(LIME_TEX); ctx.color(`oklch(${l.toFixed(3)} ${(0.022 + ctx.random() * 0.012).toFixed(3)} ${Math.round(74 + ctx.random() * 14)})`); ctx.roughness(0.92); }
const MOSS = ['oklch(0.72 0.09 128)', 'oklch(0.76 0.10 122)', 'oklch(0.68 0.08 134)'];
function moss(ctx) { ctx.albedo(null); ctx.color(MOSS[Math.floor(ctx.random() * MOSS.length)]); ctx.roughness(1); }
// trailing vines spilling down from the coping on both faces: leafy strands with bloom clusters
const BLOOMS = ['oklch(0.78 0.14 350)', 'oklch(0.96 0.02 95)', 'oklch(0.66 0.15 300)', 'oklch(0.86 0.15 90)', 'oklch(0.72 0.16 25)'];
function dtri(ctx, a, b, c) { ctx.tri(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); ctx.tri(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2]); }
function vines(ctx, a, b, lod) {
  const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, tx = dx / L, tz = dz / L, nx = -tz, nz = tx;
  const bloom = BLOOMS[Math.floor(ctx.random() * BLOOMS.length)];
  for (const side of [-1, 1]) {
    for (let d = 0.3 + ctx.random() * 0.5; d < L - 0.2; d += 0.9 + ctx.random() * 1.1) {
      if (ctx.random() < 0.45) continue;
      const t = d / L, gy = a[1] + (b[1] - a[1]) * t, off = ST / 2 + 0.045;
      const bx = a[0] + dx * t + nx * off * side, bz = a[2] + dz * t + nz * off * side;
      const len = 0.6 + ctx.random() * (SH - 0.7), n = lod <= 2 ? 6 : 3;
      let px = bx, py = gy + SH + 0.04, pz = bz, sw = (ctx.random() - 0.5) * 0.3;
      for (let k = 1; k <= n; k++) {
        const y = gy + SH + 0.04 - len * k / n, w = Math.sin(k * 1.7 + sw * 9) * 0.12 + sw * k / n, x = bx + tx * w, z = bz + tz * w;
        ctx.albedo(null); ctx.color('oklch(0.56 0.08 132)'); ctx.roughness(0.9);
        dtri(ctx, [px - tx * 0.012, py, pz - tz * 0.012], [px + tx * 0.012, py, pz + tz * 0.012], [x, y, z]);
        ctx.color(`oklch(${(0.62 + ctx.random() * 0.1).toFixed(3)} 0.11 ${Math.round(124 + ctx.random() * 14)})`);
        for (const lr of [-1, 1]) { const lx = x + tx * lr * 0.13, lz = z + tz * lr * 0.13, oy = y + 0.04;
          dtri(ctx, [x, y, z], [lx + nx * side * 0.03, oy + 0.05, lz + nz * side * 0.03], [lx, oy - 0.05, lz]); }
        if (lod <= 2 && ctx.random() < 0.45) {
          ctx.color(ctx.random() < 0.8 ? bloom : BLOOMS[Math.floor(ctx.random() * BLOOMS.length)]); ctx.roughness(0.7);
          const fx = x + nx * side * 0.035, fz = z + nz * side * 0.035, fy = y + 0.02, r = 0.05 + ctx.random() * 0.03;
          for (let j = 0; j < 5; j++) { const a0 = j / 5 * Math.PI * 2, a1 = a0 + 0.55, a2 = a0 - 0.55;
            const P = (ang, rr) => [fx + tx * Math.cos(ang) * rr, fy + Math.sin(ang) * rr, fz + tz * Math.cos(ang) * rr];
            dtri(ctx, [fx, fy, fz], P(a2, r * 0.45), P(a0, r)); dtri(ctx, [fx, fy, fz], P(a0, r), P(a1, r * 0.45)); }
          ctx.color('oklch(0.85 0.15 85)'); const c = r * 0.28; dtri(ctx, [fx + nx * side * 0.006 - tx * c, fy, fz + nz * side * 0.006 - tz * c], [fx + nx * side * 0.006 + tx * c, fy - c, fz + nz * side * 0.006 + tz * c], [fx + nx * side * 0.006 + tx * c, fy + c, fz + nz * side * 0.006 + tz * c]);
        }
        px = x; py = y; pz = z;
      }
    }
  }
}
function stoneRun(ctx, pts, lod, p = {}) {
  const P = (i, t) => { const a = pts[i], b = pts[i + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[2] - a[2]);
    if (lod <= 2) {
      const rows = 5, rh = (SH - 0.14) / rows;
      for (let r = 0; r < rows; r++) {
        let t = r % 2 ? -0.35 / L : 0;
        while (t < 1) {
          const t1 = Math.min(1, t + (0.55 + ctx.random() * 0.45) / L), t0 = Math.max(0, t);
          const A = P(i, t0), B = P(i, t1), inset = ctx.random() * 0.04;
          lime(ctx); obb(ctx, [A[0], A[2]], [B[0], B[2]], A[1], B[1], r === 0 ? -0.35 : r * rh + 0.012, (r + 1) * rh - 0.012, ST - inset);
          t = t1;
        }
      }
      // mortar core so gaps read dark, not see-through
      ctx.albedo(null); ctx.color('oklch(0.76 0.025 80)'); obb(ctx, [a[0], a[2]], [b[0], b[2]], a[1], b[1], -0.3, SH - 0.14, ST - 0.08);
    } else { lime(ctx); obb(ctx, [a[0], a[2]], [b[0], b[2]], a[1], b[1], -0.35, SH - 0.14, ST); }
    // coping: a wider pale slab
    ctx.albedo(LIME_TEX); ctx.color('oklch(0.93 0.02 85)'); ctx.roughness(0.85);
    obb(ctx, [a[0], a[2]], [b[0], b[2]], a[1], b[1], SH - 0.14, SH, ST + 0.16);
    // moss on the coping: soft sage cushions a little narrower than the slab, so its pale lip still reads; a mossy foot
    if (lod <= 3) {
      const n = lod <= 2 ? Math.max(1, Math.round(L / 1.6)) : 1;
      for (let k = 0; k < n; k++) {
        if (lod <= 2 && ctx.random() < 0.3) continue;
        const c = (k + 0.5) / n, hw = (lod <= 2 ? 0.25 + ctx.random() * 0.35 : 0.3) / n, A = P(i, Math.max(0, c - hw)), B = P(i, Math.min(1, c + hw));
        moss(ctx); obb(ctx, [A[0], A[2]], [B[0], B[2]], A[1], B[1], SH, SH + 0.03 + ctx.random() * 0.03, ST - 0.02 + ctx.random() * 0.1);
      }
      if (lod <= 2) { const C = P(i, ctx.random() * 0.5), D = P(i, Math.min(1, ctx.random() * 0.4 + 0.55)); moss(ctx); obb(ctx, [C[0], C[2]], [D[0], D[2]], C[1], D[1], -0.05, 0.1 + ctx.random() * 0.1, ST + 0.12); }
    }
    // flowering vines trailing from the coping on both faces
    if (lod <= 3) vines(ctx, a, b, lod);
  }
  // piers: every 4th point and both ends, a little taller with a pyramid cap
  for (let i = 0; i < pts.length; i++) {
    if (i % 4 && i !== pts.length - 1) continue;
    if ((i === 0 && p.noStartPier) || (i === pts.length - 1 && p.noEndPier)) continue; // a shared corner: the neighbouring run stands the pier
    const [x, y, z] = pts[i], s = 0.46;
    lime(ctx); box(ctx, x - s, y - 0.35, z - s, x + s, y + SH + 0.2, z + s);
    ctx.albedo(LIME_TEX); ctx.color('oklch(0.94 0.02 85)'); box(ctx, x - s - 0.08, y + SH + 0.2, z - s - 0.08, x + s + 0.08, y + SH + 0.34, z + s + 0.08);
    solid(ctx, [[x - s, y + SH + 0.34, z - s], [x + s, y + SH + 0.34, z - s], [x + s, y + SH + 0.34, z + s], [x - s, y + SH + 0.34, z + s]], [[x - 0.06, y + SH + 0.62, z - 0.06], [x + 0.06, y + SH + 0.62, z - 0.06], [x + 0.06, y + SH + 0.62, z + 0.06], [x - 0.06, y + SH + 0.62, z + 0.06]]);
  }
  ctx.albedo(null);
}
function stonePiers(ctx, hw) {
  for (const s of [-1, 1]) {
    const x = s * (hw + 0.45);
    for (let r = 0; r < 7; r++) { lime(ctx); box(ctx, x - 0.5 + (r % 2) * 0.02, -0.4 + r * 0.62, -0.5, x + 0.5 - (r % 2) * 0.02, -0.4 + (r + 1) * 0.62 - 0.02, 0.5); }
    ctx.albedo(LIME_TEX); ctx.color('oklch(0.94 0.02 85)'); box(ctx, x - 0.62, 3.95, -0.62, x + 0.62, 4.12, 0.62);
    solid(ctx, [[x - 0.5, 4.12, -0.5], [x + 0.5, 4.12, -0.5], [x + 0.5, 4.12, 0.5], [x - 0.5, 4.12, 0.5]], [[x - 0.08, 4.5, -0.08], [x + 0.08, 4.5, -0.08], [x + 0.08, 4.5, 0.08], [x - 0.08, 4.5, 0.08]]);
    ctx.albedo(MOSS_TEX); ctx.color('oklch(0.7 0.11 132)'); box(ctx, x - 0.55, -0.05, -0.55, x + 0.55, 0.22, 0.55);
  }
  ctx.albedo(null);
}
export const geometry = softened(function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod ?? 1;
  ctx.flat(); ctx.roughness(0.9);
  if (p.kind === 'gate') { if (p.style === 'stone') stonePiers(ctx, p.w ?? 9); else gate(ctx, p.w ?? 9, lod); } else if (p.style === 'stone') stoneRun(ctx, p.pts || [], lod, p); else run(ctx, p.pts || [], lod);
});
export function collider(ctx) {
  const p = ctx.params || {};
  if (p.kind === 'gate' && p.style === 'stone') { const hw = (p.w ?? 9) / 2; for (const s of [-1, 1]) box(ctx, s * (hw + 0.45) - 0.5, -0.4, -0.5, s * (hw + 0.45) + 0.5, 4.1, 0.5); return; }
  if (p.kind === 'gate') { const hw = (p.w ?? 9) / 2; for (const s of [-1, 1]) box(ctx, s * hw - 0.18, -0.4, -0.18, s * hw + 0.18, 4.3, 0.18); return; }
  const pts = p.pts || [], th = p.style === 'stone' ? ST / 2 : 0.08, hh = p.style === 'stone' ? SH : H;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, ox = -dz / L * th, oz = dx / L * th;
    solid(ctx, [[a[0] - ox, a[1] - 0.3, a[2] - oz], [a[0] + ox, a[1] - 0.3, a[2] + oz], [b[0] + ox, b[1] - 0.3, b[2] + oz], [b[0] - ox, b[1] - 0.3, b[2] - oz]],
      [[a[0] - ox, a[1] + hh, a[2] - oz], [a[0] + ox, a[1] + hh, a[2] + oz], [b[0] + ox, b[1] + hh, b[2] + oz], [b[0] - ox, b[1] + hh, b[2] - oz]]);
  }
}
