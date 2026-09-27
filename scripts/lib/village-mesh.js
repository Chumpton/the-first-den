// Hilltop village mesh kit: tiny emitters shared by hex-cottage, village-kit and villager. Faces CCW from outside.
export const TAU = Math.PI * 2
export const TX = {
  lime: 'cdn/texture-warm-limewash-plaster-interior-wall.png',
  stone: 'cdn/texture-rough-fieldstone-wall-mortared.png',
  flags: 'cdn/texture-worn-stone-flag-floor.png',
  plank: 'cdn/texture-honey-oak-floor-planks.png',
  timber: 'cdn/texture-weathered-oak-timber-grain.png',
  turf: 'cdn/texture-living-roof-grass-turf-with-clover.png',
}
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s]
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
export const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
export function yawV(v, yaw) { const r = (yaw * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c] }
function pitchV(v, p) { const r = (p * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r); return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c] }
export function paint(ctx, tex, color, rough = 0.9) { ctx.albedo(tex ?? null); ctx.color(color); ctx.roughness(rough) }
export function quadN(ctx, c, u, v) {
  const a = sub(sub(c, u), v), b = sub(add(c, u), v), d = add(sub(c, u), v), e = add(add(c, u), v)
  ctx.quad(...a, ...b, ...e, ...d)
}
// a box by centre and size, turned by pitch then yaw (degrees)
export function box(ctx, cx, cy, cz, w, h, d, yaw = 0, pitch = 0) {
  const R = (v) => yawV(pitchV(v, pitch), yaw), c = [cx, cy, cz]
  const X = R([w / 2, 0, 0]), Y = R([0, h / 2, 0]), Z = R([0, 0, d / 2])
  quadN(ctx, add(c, X), Y, Z); quadN(ctx, sub(c, X), Z, Y)
  quadN(ctx, add(c, Y), Z, X); quadN(ctx, sub(c, Y), X, Z)
  quadN(ctx, add(c, Z), X, Y); quadN(ctx, sub(c, Z), Y, X)
}
// a tapered cylinder (or cone when r1 = 0) from p0 to p1
export function cyl(ctx, p0, p1, r0, r1, seg = 8, caps = true) {
  const u = norm(sub(p1, p0)), ref = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  const e1 = norm(cross(ref, u)), e2 = cross(u, e1), A = [], B = []
  for (let j = 0; j < seg; j++) {
    const t = (j / seg) * TAU, d = add(mul(e1, Math.cos(t)), mul(e2, Math.sin(t)))
    A.push(add(p0, mul(d, r0))); B.push(add(p1, mul(d, r1)))
  }
  for (let j = 0; j < seg; j++) {
    const k = (j + 1) % seg
    if (r1 <= 0) ctx.tri(...A[j], ...A[k], ...p1)
    else ctx.quad(...A[j], ...A[k], ...B[k], ...B[j])
    if (caps) { if (r1 > 0) ctx.tri(...p1, ...B[j], ...B[k]); ctx.tri(...p0, ...A[k], ...A[j]) }
  }
}
// a lat-long ellipsoid; top = fraction of the sphere drawn from the top (1 = whole, 0.5 = upper half); jit = lumpiness
export function sph(ctx, cx, cy, cz, rx, ry, rz, seg = 8, rings = 6, top = 1, jit = 0) {
  const rows = []
  for (let i = 0; i <= rings; i++) {
    const ph = (i / rings) * Math.PI * top, row = []
    for (let j = 0; j < seg; j++) {
      const th = (j / seg) * TAU, k = jit && i > 0 && i < rings ? 1 - jit + ctx.random() * jit * 2 : 1
      row.push([cx + Math.sin(ph) * Math.cos(th) * rx * k, cy + Math.cos(ph) * ry * k, cz + Math.sin(ph) * Math.sin(th) * rz * k])
    }
    rows.push(row)
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const k = (j + 1) % seg, a = rows[i][j], b = rows[i][k], c = rows[i + 1][k], d = rows[i + 1][j]
    if (i === 0) ctx.tri(...a, ...c, ...d); else ctx.quad(...a, ...b, ...c, ...d)
  }
}
// a rock: lumpy blob whose upward faces wear moss
export function rock(ctx, cx, cy, cz, rx, ry, rz, seg, rings, stone, moss) {
  const rows = []
  for (let i = 0; i <= rings; i++) {
    const ph = (i / rings) * Math.PI, row = []
    for (let j = 0; j < seg; j++) {
      const th = (j / seg) * TAU + (i % 2) * (Math.PI / seg), k = i > 0 && i < rings ? 0.78 + ctx.random() * 0.4 : 1
      row.push([cx + Math.sin(ph) * Math.cos(th) * rx * k, cy + Math.cos(ph) * ry * k * (i > rings / 2 ? 0.55 : 1), cz + Math.sin(ph) * Math.sin(th) * rz * k])
    }
    rows.push(row)
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const k = (j + 1) % seg, a = rows[i][j], b = rows[i][k], c = rows[i + 1][k], d = rows[i + 1][j]
    const n = norm(cross(sub(c, a), sub(d, b)))
    ctx.color(-n[1] > 0.5 ? moss : stone) // rows run top→down, so this cross points inward: flip
    ctx.quad(...a, ...b, ...c, ...d)
  }
}
// a flat ring or disc facing n (horizontal-ish), centre c, in the plane of right/up
export function annulus(ctx, c, n, r0, r1, seg = 12) {
  const up = Math.abs(n[1]) > 0.9 ? [0, 0, -1] : [0, 1, 0], right = norm(cross(up, n)), u2 = cross(n, right)
  for (let j = 0; j < seg; j++) {
    const t0 = (j / seg) * TAU, t1 = ((j + 1) / seg) * TAU
    const d0 = add(mul(right, Math.cos(t0)), mul(u2, Math.sin(t0))), d1 = add(mul(right, Math.cos(t1)), mul(u2, Math.sin(t1)))
    if (r0 <= 0) ctx.tri(...c, ...add(c, mul(d0, r1)), ...add(c, mul(d1, r1)))
    else ctx.quad(...add(c, mul(d0, r0)), ...add(c, mul(d1, r0)), ...add(c, mul(d1, r1)), ...add(c, mul(d0, r1)))
  }
}
export function oct(ctx, x, y, z, r, h = r) {
  const P = [[x + r, y, z], [x, y, z + r], [x - r, y, z], [x, y, z - r]], T = [x, y + h, z], B = [x, y - h, z]
  for (let j = 0; j < 4; j++) { const a = P[j], b = P[(j + 1) % 4]; ctx.tri(...T, ...b, ...a); ctx.tri(...B, ...a, ...b) }
}
