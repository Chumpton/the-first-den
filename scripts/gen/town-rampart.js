// Town rampart: the low weathered limestone retaining wall wrapped outside the alley hedge, plus the service-yard
// dressing in the band between hedge and wall (docks, barrels, crates, hay bales, hay storage, woodpiles).
// One row, feet at world y 0 like town-alleys: x/z local to the row, every y is world height (sampled at placement).
// params: { h, t, pts: [[x, z, y, pier?], …] (one open run), items: [{ k, x, z, y, yaw, … }] }
import { TEX } from "../lib/town-kit.js";
const STONE = ["#ddd4c2", "#d2c9b5", "#c6bca7", "#d8cfbb", "#bdb39e"], MOSS = "#98a473", MORTAR = "#a89e8a";
const WOOD = "#c79a66", WOOD_D = "#8a6440", IRON = "#5a524a", HAY = "#e6c77a", HAY_D = "#c9a458", GRAIN = "#d9b98a";
const HAYTEX = "cdn/texture-golden-straw-hay-bale.png";
let XF = { x: 0, y: 0, z: 0, c: 1, s: 0 };
function frame(x, y, z, yaw) { const r = (yaw || 0) * Math.PI / 180; XF = { x, y, z, c: Math.cos(r), s: Math.sin(r) }; }
function P(lx, ly, lz) { return [XF.x + lx * XF.c + lz * XF.s, XF.y + ly, XF.z - lx * XF.s + lz * XF.c]; }
// faces: normal, t1, t2 with t1 × t2 = normal, corners (-,-)(+,-)(+,+)(-,+): CCW from outside
const FACES = [[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]];
const SG = [[-1,-1],[1,-1],[1,1],[-1,1]];
function box(ctx, cx, cy, cz, w, h, d, bottom = false) {
  const a = w / 2, b = h / 2, e = d / 2;
  for (const [n, t1, t2] of FACES) {
    if (!bottom && n[1] === -1) continue;
    const q = [];
    for (const [s1, s2] of SG) q.push(...P(cx + (n[0] + t1[0] * s1 + t2[0] * s2) * a, cy + (n[1] + t1[1] * s1 + t2[1] * s2) * b, cz + (n[2] + t1[2] * s1 + t2[2] * s2) * e));
    ctx.quad(...q);
  }
}
// a cylinder along local axis ("x" | "y" | "z"), radii per station [[offset, r], …] from its centre
function cyl(ctx, cx, cy, cz, axis, stations, seg, capA = true, capB = true, capCol = null) {
  const pt = (o, r, k) => { const a = k / seg * Math.PI * 2, u = Math.cos(a) * r, v = Math.sin(a) * r;
    return axis === "y" ? P(cx + u, cy + o, cz + v) : axis === "x" ? P(cx + o, cy + u, cz + v) : P(cx + u, cy + v, cz + o); };
  for (let i = 0; i + 1 < stations.length; i++) {
    const [o0, r0] = stations[i], [o1, r1] = stations[i + 1];
    for (let k = 0; k < seg; k++) ctx.quad(...pt(o0, r0, k), ...pt(o0, r0, k + 1), ...pt(o1, r1, k + 1), ...pt(o1, r1, k));
  }
  if (capCol) ctx.color(capCol);
  for (const [cap, st] of [[capA, stations[0]], [capB, stations[stations.length - 1]]]) {
    if (!cap) continue; const c = pt(st[0], 0, 0);
    for (let k = 0; k < seg; k++) ctx.tri(...c, ...pt(st[0], st[1], k), ...pt(st[0], st[1], k + 1));
  }
}
// ---------- the wall ----------
function wall(ctx, p, lod) {
  const H = Number(p.h ?? 0.95), T = Number(p.t ?? 0.55), pts = p.pts || [];
  ctx.albedo(TEX.ashlar); ctx.roughness(0.95); ctx.flat();
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az, ay] = pts[i], [bx, bz, by] = pts[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.01) continue;
    frame(ax, 0, az, Math.atan2(-dz, dx) * 180 / Math.PI);
    const gy = (t) => ay + (by - ay) * t, base = -0.3;
    if (lod >= 4) { ctx.color(STONE[1]); box(ctx, L / 2, (ay + by) / 2 + (H + base) / 2, 0, L, H - base, T); continue; }
    // mortar core, a hair shy of the stone faces, so the joints read as recessed
    ctx.color(MORTAR); box(ctx, L / 2, (ay + by) / 2 + (H + base) / 2, 0, L, H - base, T - 0.05);
    if (lod <= 2) {
      let y0 = base, row = 0;
      while (y0 < H - 0.05) {
        const ch = Math.min(H - y0, 0.24 + ctx.random() * 0.1);
        let x = row % 2 ? -0.35 * ctx.random() : 0;
        while (x < L) {
          const sl = Math.min(L - Math.max(0, x), (lod === 1 ? 0.45 : 0.8) + ctx.random() * 0.5), x0 = Math.max(0, x), x1 = Math.min(L, x0 + sl);
          if (x1 - x0 > 0.08) {
            const t = (x0 + x1) / 2 / L, proud = 0.02 + ctx.random() * 0.035;
            ctx.color(row === 0 && ctx.random() < 0.6 ? MOSS : STONE[Math.floor(ctx.random() * STONE.length)]);
            box(ctx, (x0 + x1) / 2, gy(t) + y0 + ch / 2, (ctx.random() - 0.5) * 0.02, x1 - x0 - 0.035, ch - 0.035, T + proud * 2);
          }
          x = x1;
        }
        y0 += ch; row++;
      }
    }
    // coping: slightly overhanging cap slabs, the top line that reads from across the meadow
    ctx.albedo(TEX.lime);
    const cl = lod <= 2 ? 1.1 : L;
    for (let x = 0; x < L - 0.01; x += cl) {
      const x1 = Math.min(L, x + cl), t = (x + x1) / 2 / L;
      ctx.color(lod <= 2 && ctx.random() < 0.25 ? "#c9c2ae" : "#e2dac8");
      box(ctx, (x + x1) / 2, gy(t) + H + 0.06, 0, x1 - x - (lod <= 2 ? 0.02 : 0), 0.12, T + 0.14);
    }
    ctx.albedo(TEX.ashlar);
  }
  // piers at the corners and the lane ends
  for (const q of pts) if (q[3]) {
    frame(q[0], 0, q[1], 0); ctx.color(STONE[2]); box(ctx, 0, q[2] + (H + 0.3 - 0.3) / 2 + 0.0, 0, 0.8, H + 0.6, 0.8);
    if (lod <= 3) { ctx.albedo(TEX.lime); ctx.color("#e2dac8"); box(ctx, 0, q[2] + H + 0.36, 0, 0.94, 0.12, 0.94); ctx.albedo(TEX.ashlar); }
  }
}
// ---------- dressing ----------
function barrel(ctx, it, lod) {
  const r = it.r ?? 0.32, h = it.h ?? 0.9, seg = lod <= 2 ? 10 : 6;
  ctx.albedo(TEX.oak); ctx.color(WOOD);
  cyl(ctx, 0, it.y, 0, "y", [[0, r * 0.86], [h * 0.5, r], [h, r * 0.86]], seg, false, true, GRAIN);
  if (lod <= 2) { ctx.albedo(null); ctx.color(IRON); ctx.metalness(0.4);
    for (const o of [0.16, h - 0.2]) cyl(ctx, 0, it.y + o, 0, "y", [[0, r * 0.95], [0.05, r * 0.97]], seg, false, false);
    ctx.metalness(0); }
}
function crate(ctx, it, lod) {
  const s = it.s ?? 0.7; ctx.albedo(TEX.oak); ctx.color(WOOD); box(ctx, 0, it.y + s / 2, 0, s, s, s);
  if (lod <= 2) { ctx.color(WOOD_D); const b = 0.07, o = s / 2;
    for (const [x, z] of [[-o, -o], [o, -o], [o, o], [-o, o]]) box(ctx, x, it.y + s / 2, z, b, s + 0.01, b);
    for (const y of [0.04, s - 0.04]) { box(ctx, 0, it.y + y, -o, s, b, b); box(ctx, 0, it.y + y, o, s, b, b); box(ctx, -o, it.y + y, 0, b, b, s); box(ctx, o, it.y + y, 0, b, b, s); } }
}
function bale(ctx, x, y, z, lod) {
  ctx.albedo(HAYTEX); ctx.color(HAY); box(ctx, x, y + 0.24, z, 1.0, 0.46, 0.52);
  if (lod <= 2) { ctx.albedo(null); ctx.color(HAY_D); for (const o of [-0.25, 0.25]) box(ctx, x + o, y + 0.24, z, 0.04, 0.48, 0.54); }
}
function bales(ctx, it, lod) { const n = it.n ?? 3; for (let i = 0; i < n; i++) bale(ctx, (i % 2) * 1.05 - 0.5, it.y + Math.floor(i / 2) * 0.46, 0, lod); }
function haystore(ctx, it, lod) {
  const L = it.len ?? 3, D = 2.1, hb = 1.7, hf = 2.3;
  ctx.albedo(TEX.oak); ctx.color(WOOD_D);
  for (const x of [-L / 2, L / 2]) { box(ctx, x, it.y + hb / 2, D / 2 - 0.1, 0.14, hb, 0.14); box(ctx, x, it.y + hf / 2, -D / 2 + 0.1, 0.14, hf, 0.14); }
  // lean-to roof: cedar shingles on a slab, high at the hedge side (−z)
  ctx.albedo(TEX.cedar); ctx.color("#b89a78");
  const y0 = it.y + hb + 0.06, y1 = it.y + hf + 0.06, zb = D / 2 + 0.35, zf = -D / 2 - 0.2, xa = -L / 2 - 0.3, xb = L / 2 + 0.3, th = 0.08;
  ctx.quad(...P(xa, y1, zf), ...P(xb, y1, zf), ...P(xb, y0, zb), ...P(xa, y0, zb));
  ctx.quad(...P(xa, y0 - th, zb), ...P(xb, y0 - th, zb), ...P(xb, y1 - th, zf), ...P(xa, y1 - th, zf));
  if (lod <= 2) { ctx.quad(...P(xa, y0 - th, zb), ...P(xa, y0, zb), ...P(xb, y0, zb), ...P(xb, y0 - th, zb)); }
  for (let i = 0; i < (lod <= 2 ? 5 : 2); i++) bale(ctx, (i % 3) * 1.02 - 1.0, it.y + Math.floor(i / 3) * 0.46, -0.25, lod);
  if (lod <= 2) { ctx.albedo(HAYTEX); ctx.color(HAY); cyl(ctx, 0.7, it.y, 0.55, "y", [[0, 0.55], [0.3, 0.45], [0.55, 0.05]], 7, false, false); }
}
function woodpile(ctx, it, lod) {
  const L = it.len ?? 2.6, r = 0.11, rows = [5, 4, 4, 3, 2];
  ctx.albedo(TEX.walnut); ctx.color("#8a6a4d");
  for (const x of [-L / 2 - 0.06, L / 2 + 0.06]) box(ctx, x, it.y + 0.55, 0, 0.1, 1.1, 0.1);
  if (lod >= 3) { ctx.color("#9a7a58"); box(ctx, 0, it.y + 0.45, 0, L, 0.9, 0.5); return; }
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j]; i++) {
    const z = (i - (rows[j] - 1) / 2) * r * 2.05, y = it.y + r + j * r * 1.75, len = L - ctx.random() * 0.15;
    ctx.albedo(TEX.walnut); ctx.color(ctx.random() < 0.5 ? "#7d5e43" : "#94714f");
    cyl(ctx, (ctx.random() - 0.5) * 0.08, y, z, "x", [[-len / 2, r], [len / 2, r]], lod === 1 ? 7 : 5, true, true, "#e3c79a");
  }
  // chopping block and a few split logs at its foot
  ctx.albedo(TEX.walnut); ctx.color("#8a6a4d"); cyl(ctx, L / 2 + 0.55, it.y, 0.3, "y", [[0, 0.24], [0.45, 0.22]], 7, false, true, "#e3c79a");
}
function dock(ctx, it, lod) {
  const L = it.len ?? 3.4, D = 2.1, h = 0.72;
  ctx.albedo(TEX.oak); ctx.color(WOOD_D);
  for (const x of [-L / 2 + 0.1, 0, L / 2 - 0.1]) for (const z of [-D / 2 + 0.1, D / 2 - 0.1]) box(ctx, x, it.y + (h - 0.3) / 2 - 0.15, z, 0.16, h + 0.3 - 0.3 + 0.3, 0.16);
  ctx.color(WOOD);
  if (lod <= 2) { const n = Math.round(D / 0.21); for (let i = 0; i < n; i++) { ctx.color(i % 3 ? WOOD : "#b98b58"); box(ctx, 0, it.y + h - 0.035, -D / 2 + (i + 0.5) * D / n, L, 0.07, D / n - 0.015); } }
  else box(ctx, 0, it.y + h - 0.035, 0, L, 0.07, D);
  ctx.color(WOOD_D); box(ctx, 0, it.y + h - 0.12, D / 2 - 0.04, L, 0.14, 0.08);
  // steps at the +x end, bollards on the open edge
  for (let s = 0; s < 3; s++) box(ctx, L / 2 + 0.2 + (2 - s) * 0.28, it.y + (s + 1) * h / 4 - 0.04, 0.35, 0.3, 0.08, 1.0);
  if (lod <= 2) for (const x of [-L / 2 + 0.2, L / 2 - 0.2]) cyl(ctx, x, it.y + h, D / 2 - 0.15, "y", [[0, 0.08], [0.35, 0.08], [0.42, 0.1]], 6, false, true);
  if (lod <= 2 && it.cargo !== false) { crate(ctx, { y: it.y + h, s: 0.6 }, lod); }
}
const ITEMS = { barrel, crate, bales, haystore, woodpile, dock };
export function geometry(ctx) {
  const lod = Number(ctx.lod ?? 1), p = ctx.params;
  wall(ctx, p, lod);
  if (lod >= 4) return;
  for (const it of p.items || []) {
    const f = ITEMS[it.k]; if (!f) continue;
    frame(it.x, 0, it.z, it.yaw || 0); f(ctx, it, lod); ctx.albedo(null);
  }
}
export function collider(ctx) {
  const p = ctx.params, H = Number(p.h ?? 0.95), T = Number(p.t ?? 0.55), pts = p.pts || [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az, ay] = pts[i], [bx, bz, by] = pts[i + 1], dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
    if (L < 0.01) continue;
    frame(ax, 0, az, Math.atan2(-dz, dx) * 180 / Math.PI);
    box(ctx, L / 2, (ay + by) / 2 + (H + 0.12 + 0.3) / 2 - 0.3, 0, L, H + 0.42, T + 0.14, true);
  }
  for (const it of p.items || []) {
    frame(it.x, 0, it.z, it.yaw || 0);
    if (it.k === "dock") box(ctx, 0, it.y + 0.36, 0, it.len ?? 3.4, 0.72, 2.1, true);
    else if (it.k === "haystore") box(ctx, 0, it.y + 0.7, 0, (it.len ?? 3) + 0.2, 1.4, 2.1, true);
    else if (it.k === "woodpile") box(ctx, 0, it.y + 0.5, 0, (it.len ?? 2.6) + 0.2, 1.0, 0.6, true);
    else if (it.k === "bales") box(ctx, 0, it.y + 0.45, 0, 2.1, 0.9, 0.55, true);
    else if (it.k === "crate") { const s = it.s ?? 0.7; box(ctx, 0, it.y + s / 2, 0, s, s, s, true); }
    else if (it.k === "barrel") box(ctx, 0, it.y + 0.45, 0, 0.62, 0.9, 0.62, true);
  }
}
