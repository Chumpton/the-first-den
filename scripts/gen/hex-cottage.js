// A small single-storey hexagonal cob home for the hilltop village: buttercream lime plaster over a fieldstone plinth,
// walnut posts at the six corners, a round walnut door (front, −Z face) in a stone surround, round warm windows, a green
// living roof with a stone chimney. params: r (corner radius), h (wall), sx (stretch along X: a longhouse hall), hue
// (door), trim (flower box / window frames), roof (roof rise), seed-driven chimney corner and roof flowers. Origin = ground centre.
import { TX, TAU, paint, box, cyl, sph, annulus, oct, add, sub, mul, norm } from '../lib/village-mesh.js'
const PLASTER = 'oklch(0.96 0.035 88)', WALNUT = 'oklch(0.72 0.05 55)', STONE = 'oklch(0.93 0.02 80)', TURF = 'oklch(0.94 0.06 128)'
const GLOW = [1.7, 1.05, 0.45], FLOWERS = ['oklch(0.8 0.14 20)', 'oklch(0.9 0.14 95)', 'oklch(0.78 0.1 300)', 'oklch(0.97 0.02 90)', 'oklch(0.75 0.15 45)']
function shape(p) {
  const V = []
  for (let k = 0; k < 6; k++) { const a = (k * 60 * Math.PI) / 180; V.push([Math.cos(a) * p.r * p.sx, 0, Math.sin(a) * p.r]) }
  const F = []
  for (let k = 0; k < 6; k++) {
    const a = V[k], b = V[(k + 1) % 6], d = sub(b, a), len = Math.hypot(d[0], d[2])
    F.push({ a, b, mid: mul(add(a, b), 0.5), n: norm([d[2], 0, -d[0]]), len, yaw: (Math.atan2(-d[2], d[0]) * 180) / Math.PI, k })
  }
  return { V, F }
}
function P(ctx) { return { r: 3.2, h: 2.5, sx: 1, hue: 30, trim: 140, roof: 1.5, doorR: 0.85, ...ctx.params } }
export function geometry(ctx) {
  const p = P(ctx), lod = ctx.lod, { V, F } = shape(p), h = p.h
  ctx.flat()
  const at = (v, y, s = 1) => [v[0] * s, y, v[2] * s]
  // walls
  paint(ctx, TX.lime, PLASTER, 0.92)
  for (const f of F) { const a = f.a, b = f.b; ctx.quad(...at(b, 0), ...at(a, 0), ...at(a, h), ...at(b, h)) }
  // roof: eave ring, a mid ring, apex
  const over = 1 + 0.65 / p.r, ey = h - 0.12, top = h + p.roof
  const E = V.map((v) => at(v, ey, over)), M = V.map((v) => at(v, ey + p.roof * 0.72, 0.42)), A = [0, top, 0]
  paint(ctx, TX.turf, TURF, 1)
  for (let k = 0; k < 6; k++) {
    const j = (k + 1) % 6
    if (lod >= 4) ctx.tri(...E[j], ...E[k], ...A)
    else { ctx.quad(...E[j], ...E[k], ...M[k], ...M[j]); ctx.tri(...M[j], ...M[k], ...A) }
  }
  if (lod >= 4) return
  // fascia + soffit
  paint(ctx, TX.timber, WALNUT, 0.8)
  for (let k = 0; k < 6; k++) {
    const j = (k + 1) % 6, lo = (v) => [v[0], v[1] - 0.24, v[2]]
    ctx.quad(...lo(E[j]), ...lo(E[k]), ...E[k], ...E[j])
    ctx.quad(...at(V[j], ey - 0.24), ...at(V[k], ey - 0.24), ...lo(E[k]), ...lo(E[j]))
  }
  // plinth
  paint(ctx, TX.stone, STONE, 0.95)
  for (const f of F) { const s = 1.035; ctx.quad(...at(f.b, 0, s), ...at(f.a, 0, s), ...at(f.a, 0.42, s), ...at(f.b, 0.42, s)); ctx.quad(...at(f.b, 0.42, s), ...at(f.a, 0.42, s), ...at(f.a, 0.42), ...at(f.b, 0.42)) }
  // chimney at a seeded back corner
  const cv = V[[0, 1, 2, 3][Math.floor(ctx.random() * 4) % 4]], cp = mul(cv, 0.62)
  box(ctx, cp[0], top - 0.2, cp[2], 0.55, p.roof + 0.9, 0.55)
  paint(ctx, null, 'oklch(0.5 0.02 60)', 0.9); box(ctx, cp[0], top + 0.3, cp[2], 0.68, 0.1, 0.68)
  paint(ctx, null, 'oklch(0.2 0.01 60)', 1); box(ctx, cp[0], top + 0.36, cp[2], 0.34, 0.03, 0.34)
  // door (front face k = 4)
  const df = F[4], dn = df.n, dr = p.doorR, dc = add(df.mid, [0, dr + 0.08, 0])
  const out = (c, o) => add(c, mul(dn, o))
  if (lod <= 2) { paint(ctx, TX.stone, STONE, 0.95); annulus(ctx, out(dc, 0.12), dn, dr - 0.02, dr + 0.24, 14) }
  paint(ctx, TX.plank, `oklch(0.84 0.11 ${p.hue})`, 0.7); annulus(ctx, out(dc, 0.14), dn, 0, dr, lod <= 2 ? 14 : 8)
  const right = norm([-dn[2], 0, dn[0]]).map((x) => -x)
  if (lod <= 1) {
    paint(ctx, null, `oklch(0.35 0.06 ${p.hue})`, 0.8)
    for (const x of [-0.45, 0, 0.45]) { const hh = Math.sqrt(dr * dr - (x * dr) ** 2) * 0.96, c = out(add(dc, mul(right, x * dr)), 0.15); box(ctx, c[0], c[1], c[2], 0.025, hh * 2, 0.01, df.yaw) }
    paint(ctx, null, 'oklch(0.3 0.01 60)', 0.5); ctx.metalness(0.7)
    for (const y of [-0.4, 0.4]) { const c = out(add(add(dc, [0, y * dr, 0]), mul(right, -0.35 * dr)), 0.16); box(ctx, c[0], c[1], c[2], dr * 0.7, 0.06, 0.012, df.yaw) }
    paint(ctx, null, 'oklch(0.8 0.12 85)', 0.35); ctx.metalness(0.9); const kn = out(add(dc, mul(right, 0.55 * dr)), 0.18); sph(ctx, kn[0], kn[1], kn[2], 0.05, 0.05, 0.05, 6, 4)
    ctx.metalness(0)
  }
  // doorstep
  if (lod <= 2) { paint(ctx, TX.flags, STONE, 0.95); const s = out(df.mid, 0.55); box(ctx, s[0], 0.06, s[2], 1.5, 0.12, 0.7, df.yaw) }
  // round windows: every face but the door's; long faces get two
  for (const f of F) {
    if (f.k === 4) continue
    const xs = f.len > 5 ? [-0.25, 0.25] : [0], rt = norm([-f.n[2], 0, f.n[0]]).map((x) => -x)
    for (const x of xs) {
      const c = add(add(f.mid, mul(rt, x * f.len)), [0, 1.45, 0]), o = (q) => add(c, mul(f.n, q))
      ctx.albedo(null); ctx.color('oklch(0.95 0.06 80)'); ctx.emissive(...GLOW); annulus(ctx, o(0.04), f.n, 0, 0.4, lod <= 2 ? 12 : 6); ctx.emissive(null)
      if (lod <= 2) {
        paint(ctx, TX.timber, `oklch(0.8 0.07 ${p.trim})`, 0.8); annulus(ctx, o(0.06), f.n, 0.38, 0.52, 12)
        paint(ctx, null, 'oklch(0.35 0.03 60)', 0.8); const m = o(0.07); box(ctx, m[0], m[1], m[2], 0.78, 0.04, 0.02, f.yaw); box(ctx, m[0], m[1], m[2], 0.04, 0.78, 0.02, f.yaw)
        if (f.k === 3 || f.k === 5) { // flower box under the front windows
          paint(ctx, TX.plank, `oklch(0.85 0.09 ${p.trim})`, 0.8); const fb = add(o(0.16), [0, -0.66, 0]); box(ctx, fb[0], fb[1], fb[2], 0.95, 0.2, 0.24, f.yaw)
          if (lod <= 1) { ctx.albedo(null); for (let i = 0; i < 7; i++) { const q = add(add(fb, mul(rt, -0.4 + i * 0.133)), [0, 0.16 + ctx.random() * 0.06, 0]); ctx.color(i % 2 ? 'oklch(0.55 0.12 140)' : FLOWERS[Math.floor(ctx.random() * 5)]); oct(ctx, q[0], q[1], q[2], 0.08, 0.07) } }
        }
      }
    }
  }
  if (lod >= 3) return
  // walnut corner posts and wall plate
  paint(ctx, TX.timber, WALNUT, 0.8)
  for (const v of V) { const q = mul(v, 1.02); box(ctx, q[0], h / 2, q[2], 0.26, h + 0.04, 0.26, (Math.atan2(-v[2], v[0]) * 180) / Math.PI) }
  for (const f of F) { const q = add(f.mid, mul(f.n, 0.05)); box(ctx, q[0], h - 0.16, q[2], f.len, 0.2, 0.16, f.yaw) }
  // roof meadow: tufts and flowers seeded over the turf
  if (lod <= 1) {
    ctx.albedo(null)
    for (let i = 0; i < 26; i++) {
      const k = Math.floor(ctx.random() * 6), j = (k + 1) % 6, s = ctx.random(), t = 0.15 + ctx.random() * 0.7
      const e = add(mul(E[k], 1 - s), mul(E[j], s)), m = add(mul(M[k], 1 - s), mul(M[j], s)), q = add(mul(e, 1 - t), mul(m, t))
      ctx.color(i % 3 ? 'oklch(0.62 0.13 135)' : FLOWERS[i % 5]); oct(ctx, q[0], q[1] + 0.04, q[2], i % 3 ? 0.12 : 0.07, i % 3 ? 0.1 : 0.06)
    }
  }
}
export function collider(ctx) {
  const p = P(ctx), { F } = shape(p)
  for (const f of F) { const q = sub(f.mid, mul(f.n, 0.12)); box(ctx, q[0], p.h / 2, q[2], f.len + 0.1, p.h, 0.32, f.yaw) }
}
