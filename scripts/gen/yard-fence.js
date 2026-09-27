// low hand-joined fence: walnut posts with pyramid caps, oak rails pegged through, optional pickets.
// params: { segs: [[[x,z],...],...] local metres, h (0.8), style: "rail"|"picket", bay (1.8) }
import { paint, obox, beam, gem, box, TAU } from '../lib/yard-kit.js';
function bays(seg, bay) { // posts along a polyline, never farther apart than bay
  const out = [];
  for (let s = 0; s < seg.length - 1; s++) {
    const [ax, az] = seg[s], [bx, bz] = seg[s + 1], L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / bay));
    for (let i = s ? 1 : 0; i <= n; i++) out.push([ax + (bx - ax) * i / n, az + (bz - az) * i / n]);
  }
  return out;
}
export function geometry(ctx) {
  const p = ctx.params || {}, lod = ctx.lod || 1, h = p.h ?? 0.8, picket = p.style === 'picket', rnd = () => ctx.random();
  ctx.flat();
  for (const seg of p.segs || []) {
    const posts = bays(seg, p.bay ?? 1.8);
    paint(ctx, 'walnut', 'oklch(0.92 0.03 55)', 0.85);
    posts.forEach(([x, z], i) => {
      const t = (rnd() - 0.5) * 0.03, ph = h + 0.08 + (rnd() - 0.5) * 0.04;
      if (lod >= 5 && i % 2) return;
      obox(ctx, x, 0, z, 0.1, ph, 0.1, (rnd() - 0.5) * 0.15);
      if (lod <= 3) gem(ctx, x + t, ph, z, 0.075, 0.07, 0.001, 4);
    });
    paint(ctx, 'oak', 'oklch(0.93 0.04 70)', 0.8);
    const rails = lod >= 4 ? [h * 0.72] : [h * 0.35, h * 0.72];
    for (let i = 0; i < posts.length - 1; i++) {
      const [ax, az] = posts[i], [bx, bz] = posts[i + 1];
      for (const y of rails) {
        const sag = (rnd() - 0.5) * 0.03;
        beam(ctx, [ax, y + sag, az], [bx, y - sag, bz], 0.045, 0.085);
      }
      if (lod <= 2) { // pegs through the post
        paint(ctx, 'walnut', 'oklch(0.9 0.03 50)', 0.8);
        for (const y of rails) gem(ctx, ax, y + 0.02, az, 0.018, 0.03, 0.03, 4);
        paint(ctx, 'oak', 'oklch(0.93 0.04 70)', 0.8);
      }
      if (picket && lod <= 3) {
        const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 0.16), yaw = Math.atan2(-(bz - az), bx - ax);
        paint(ctx, 'oak', 'oklch(0.95 0.03 80)', 0.8);
        for (let k = 1; k < n; k++) {
          const u = k / n, x = ax + (bx - ax) * u, z = az + (bz - az) * u, ph = h - 0.05 + Math.sin(u * Math.PI) * 0.06 + (rnd() - 0.5) * 0.03;
          obox(ctx, x, 0.03, z, 0.07, ph - 0.06, 0.022, yaw + (rnd() - 0.5) * 0.05);
        }
      }
    }
  }
  ctx.albedo(null);
}
export function collider(ctx) {
  const p = ctx.params || {}, h = (p.h ?? 0.8) + 0.05;
  for (const seg of p.segs || []) for (let s = 0; s < seg.length - 1; s++) {
    const [ax, az] = seg[s], [bx, bz] = seg[s + 1];
    obox(ctx, (ax + bx) / 2, 0, (az + bz) / 2, Math.hypot(bx - ax, bz - az) + 0.1, h, 0.12, Math.atan2(-(bz - az), bx - ax));
  }
}
