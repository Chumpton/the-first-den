// The hilltop village's prop family, one script: params.item picks the piece. Feet at the ground, front −Z, metres.
// tree (with rope swing) · well · firepit (+ log benches) · garden · oven · notice · washline · flowers {beds} ·
// stones {pts} · trail {L, R, skip, rails, lamps, bench} · crags {rocks} · post (finger-post) · pine · boulder
import { TX, TAU, paint, box, cyl, sph, rock, annulus, oct, add, sub, mul, norm } from '../lib/village-mesh.js'
const WALNUT = 'oklch(0.72 0.05 55)', OAK = 'oklch(0.9 0.06 75)', BARK = 'oklch(0.62 0.05 55)', STONE = 'oklch(0.93 0.02 80)'
const GREENS = ['oklch(0.52 0.12 140)', 'oklch(0.58 0.13 135)', 'oklch(0.66 0.14 128)', 'oklch(0.74 0.14 120)']
const FLOWERS = ['oklch(0.8 0.14 20)', 'oklch(0.9 0.14 95)', 'oklch(0.78 0.1 300)', 'oklch(0.97 0.02 90)', 'oklch(0.75 0.15 45)', 'oklch(0.72 0.14 350)']
const EMBER = [2.4, 0.9, 0.25], LAMP = [2.2, 1.4, 0.55]
const pick = (ctx, a) => a[Math.floor(ctx.random() * a.length) % a.length]
const B = {
  tree(ctx, p, lod) {
    paint(ctx, TX.timber, BARK, 0.95)
    const s = lod <= 2 ? 8 : 5
    cyl(ctx, [0, 0, 0], [0.1, 1.6, 0], 0.42, 0.3, s); cyl(ctx, [0.1, 1.6, 0], [-0.1, 3.2, 0.1], 0.3, 0.2, s)
    cyl(ctx, [0, 2.4, 0], [2.6, 2.95, 0], 0.16, 0.09, s) // the swing bough
    if (lod <= 3) { cyl(ctx, [-0.05, 2.6, 0], [-1.4, 3.6, 0.8], 0.14, 0.07, 5); cyl(ctx, [0, 2.8, 0], [0.4, 3.8, -1.3], 0.13, 0.06, 5) }
    ctx.albedo(null)
    const crowns = lod >= 4 ? [[0, 4.4, 0, 3]] : [[0, 4.6, 0, 2.3], [-1.6, 4.1, 0.9, 1.7], [1.5, 4.3, -0.7, 1.7], [0.3, 4, 1.6, 1.6], [-0.6, 5.5, -0.5, 1.5], [1.9, 3.9, 0.9, 1.3]]
    for (const [x, y, z, r] of crowns) { ctx.color(pick(ctx, GREENS)); sph(ctx, x, y, z, r, r * 0.8, r, lod <= 2 ? 9 : 6, lod <= 2 ? 6 : 4, 1, 0.14) }
    // swing: two ropes, a plank seat
    paint(ctx, null, 'oklch(0.82 0.05 80)', 1)
    for (const z of [-0.32, 0.32]) cyl(ctx, [2.0, 2.86, z], [2.0, 0.56, z], 0.018, 0.018, 4, false)
    paint(ctx, TX.plank, OAK, 0.8); box(ctx, 2.0, 0.54, 0, 0.26, 0.05, 0.8)
    if (lod <= 2) { paint(ctx, null, 'oklch(0.5 0.12 140)', 1); for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; oct(ctx, Math.cos(a) * 0.62, 0.05, Math.sin(a) * 0.62, 0.14, 0.08) } }
  },
  well(ctx, p, lod) {
    const s = lod <= 2 ? 14 : 8
    paint(ctx, TX.stone, STONE, 0.95); cyl(ctx, [0, 0, 0], [0, 0.82, 0], 0.9, 0.86, s, false); cyl(ctx, [0, 0.1, 0], [0, 0.82, 0], 0.66, 0.66, s, false)
    annulus(ctx, [0, 0.82, 0], [0, 1, 0], 0.64, 0.92, s)
    paint(ctx, null, 'oklch(0.42 0.07 200)', 0.1); annulus(ctx, [0, 0.4, 0], [0, 1, 0], 0, 0.66, s)
    paint(ctx, TX.timber, WALNUT, 0.8); box(ctx, -0.82, 1.5, 0, 0.14, 1.4, 0.14); box(ctx, 0.82, 1.5, 0, 0.14, 1.4, 0.14)
    cyl(ctx, [-0.95, 1.75, 0], [0.95, 1.75, 0], 0.06, 0.06, 6)
    paint(ctx, TX.turf, 'oklch(0.94 0.06 128)', 1); box(ctx, 0, 2.38, 0.42, 2.1, 0.08, 1.05, 0, 32); box(ctx, 0, 2.38, -0.42, 2.1, 0.08, 1.05, 0, -32)
    if (lod <= 2) {
      paint(ctx, null, 'oklch(0.82 0.05 80)', 1); cyl(ctx, [0.1, 1.72, 0], [0.1, 1.28, 0], 0.015, 0.015, 4, false)
      paint(ctx, TX.plank, OAK, 0.8); cyl(ctx, [0.1, 1.0, 0], [0.1, 1.28, 0], 0.13, 0.16, 8)
      paint(ctx, null, 'oklch(0.35 0.02 60)', 0.6); cyl(ctx, [0.95, 1.75, 0], [1.05, 1.55, 0], 0.025, 0.025, 4)
    }
  },
  firepit(ctx, p, lod) {
    paint(ctx, TX.stone, STONE, 0.95)
    const n = lod <= 2 ? 11 : 7
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; sph(ctx, Math.cos(a) * 0.72, 0.08, Math.sin(a) * 0.72, 0.2, 0.16, 0.17, 6, 4, 1, 0.15) }
    ctx.albedo(null); ctx.color('oklch(0.3 0.03 40)'); ctx.emissive(...EMBER); annulus(ctx, [0, 0.05, 0], [0, 1, 0], 0, 0.55, 8); ctx.emissive(null)
    paint(ctx, TX.timber, BARK, 0.95)
    for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.4; cyl(ctx, [Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5], [0, 0.55, 0], 0.07, 0.05, 5) }
    for (const deg of p.benches ?? [20, 140, 260]) { // log benches round the fire, tangent to a 2 m ring
      const a = (deg * Math.PI) / 180, c = [Math.cos(a) * 2, 0.26, Math.sin(a) * 2], t = [-Math.sin(a) * 0.95, 0, Math.cos(a) * 0.95]
      paint(ctx, TX.timber, BARK, 0.95); cyl(ctx, sub(c, t), add(c, t), 0.24, 0.24, lod <= 2 ? 8 : 5, false)
      paint(ctx, TX.plank, 'oklch(0.9 0.07 80)', 0.9); annulus(ctx, sub(c, t), norm(mul(t, -1)), 0, 0.24, 8); annulus(ctx, add(c, t), norm(t), 0, 0.24, 8)
    }
  },
  garden(ctx, p, lod) {
    for (const x of [-1.3, 1.3]) {
      paint(ctx, TX.plank, OAK, 0.85); box(ctx, x, 0.16, 0, 1.1, 0.32, 3.4)
      paint(ctx, null, 'oklch(0.36 0.05 50)', 1); box(ctx, x, 0.33, 0, 0.94, 0.02, 3.24)
    }
    ctx.albedo(null)
    for (let i = 0; i < 6; i++) { // cabbages and lettuces
      ctx.color(i % 2 ? 'oklch(0.7 0.13 135)' : 'oklch(0.6 0.12 150)'); sph(ctx, -1.3 + (i % 2 ? 0.22 : -0.22), 0.44, -1.35 + i * 0.54, 0.2, 0.15, 0.2, lod <= 2 ? 7 : 5, 4, 1, 0.12)
    }
    for (let i = 0; i < (lod <= 2 ? 14 : 6); i++) { // carrot tops
      ctx.color('oklch(0.62 0.15 135)'); cyl(ctx, [1.1 + (i % 2) * 0.4, 0.34, -1.4 + Math.floor(i / 2) * 0.46], [1.1 + (i % 2) * 0.4, 0.62, -1.4 + Math.floor(i / 2) * 0.46], 0.07, 0, 4, false)
    }
    // bean teepee at the back and a scarecrow
    paint(ctx, TX.timber, BARK, 0.9)
    for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.6; cyl(ctx, [Math.cos(a) * 0.45, 0, 2.05 + Math.sin(a) * 0.45], [0, 1.9, 2.05], 0.025, 0.02, 4, false) }
    ctx.albedo(null); for (let i = 0; i < (lod <= 2 ? 9 : 4); i++) { ctx.color(pick(ctx, GREENS)); oct(ctx, (ctx.random() - 0.5) * 0.6, 0.5 + ctx.random() * 1.2, 2.05 + (ctx.random() - 0.5) * 0.6, 0.16, 0.14) }
    paint(ctx, TX.timber, WALNUT, 0.9); box(ctx, 0, 0.9, 1.1, 0.07, 1.8, 0.07); box(ctx, 0, 1.4, 1.1, 1.1, 0.06, 0.06)
    paint(ctx, null, 'oklch(0.72 0.14 30)', 1); box(ctx, 0, 1.3, 1.1, 0.42, 0.45, 0.18)
    paint(ctx, null, 'oklch(0.86 0.08 85)', 1); sph(ctx, 0, 1.72, 1.1, 0.16, 0.17, 0.16, 7, 5)
    paint(ctx, null, 'oklch(0.7 0.11 80)', 1); cyl(ctx, [0, 1.83, 1.1], [0, 1.85, 1.1], 0.3, 0.3, 8); cyl(ctx, [0, 1.84, 1.1], [0, 2.02, 1.1], 0.13, 0.1, 8)
    // picket fence, open at the front (−Z)
    paint(ctx, TX.plank, 'oklch(0.95 0.03 85)', 0.85)
    const W = 2.3, D = 2.7, runs = [[[-W, D], [W, D]], [[-W, -D], [-W, D]], [[W, -D], [W, D]], [[-W, -D], [-0.8, -D]], [[0.8, -D], [W, -D]]]
    for (const [a, b] of runs) {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
      for (const y of [0.3, 0.62]) box(ctx, m[0], y, m[1], L, 0.07, 0.03, yaw)
      if (lod <= 2) { const n = Math.round(L / 0.32); for (let i = 0; i <= n; i++) { const t = i / n; box(ctx, a[0] + (b[0] - a[0]) * t, 0.4, a[1] + (b[1] - a[1]) * t, 0.08, 0.8, 0.025, yaw) } }
    }
  },
  oven(ctx, p, lod) {
    paint(ctx, TX.stone, STONE, 0.95); box(ctx, 0, 0.4, 0, 1.9, 0.8, 1.8)
    paint(ctx, TX.lime, 'oklch(0.9 0.05 65)', 0.95); sph(ctx, 0, 0.8, 0.05, 0.85, 0.78, 0.85, lod <= 2 ? 12 : 7, lod <= 2 ? 5 : 3, 0.5)
    paint(ctx, TX.stone, STONE, 0.95); annulus(ctx, [0, 1.05, -0.82], [0, 0, -1], 0.28, 0.44, 10)
    ctx.albedo(null); ctx.color('oklch(0.25 0.03 40)'); ctx.emissive(...EMBER); annulus(ctx, [0, 1.05, -0.8], [0, 0, -1], 0, 0.3, 10); ctx.emissive(null)
    paint(ctx, TX.stone, STONE, 0.95); cyl(ctx, [0, 1.3, 0.45], [0, 2.1, 0.45], 0.14, 0.12, 6)
    paint(ctx, TX.plank, OAK, 0.8); box(ctx, 0, 0.82, -1.05, 1.0, 0.05, 0.35)
    paint(ctx, TX.timber, BARK, 0.95)
    for (let i = 0; i < (lod <= 2 ? 9 : 3); i++) { const r = Math.floor(i / 3), c = i % 3; cyl(ctx, [1.25 + c * 0.24 + r * 0.12, 0.13 + r * 0.22, -0.6], [1.25 + c * 0.24 + r * 0.12, 0.13 + r * 0.22, 0.6], 0.11, 0.11, 6) }
  },
  notice(ctx, p, lod) {
    paint(ctx, TX.timber, WALNUT, 0.85); box(ctx, -0.82, 1.05, 0.02, 0.12, 2.1, 0.12); box(ctx, 0.82, 1.05, 0.02, 0.12, 2.1, 0.12)
    box(ctx, 0, 1.36, 0.06, 1.74, 1.1, 0.06)
    paint(ctx, TX.turf, 'oklch(0.94 0.06 128)', 1); box(ctx, 0, 2.22, -0.14, 2.0, 0.06, 0.5, 0, -28); box(ctx, 0, 2.22, 0.26, 2.0, 0.06, 0.5, 0, 28)
  },
  washline(ctx, p, lod) {
    paint(ctx, TX.timber, WALNUT, 0.85)
    for (const x of [-3, 3]) { box(ctx, x, 1.05, 0, 0.12, 2.1, 0.12); box(ctx, x, 2.0, 0, 0.1, 0.1, 0.9) }
    const Y = (x) => 1.95 - 0.22 * (1 - (x / 3) ** 2)
    paint(ctx, null, 'oklch(0.9 0.02 80)', 1)
    for (let i = 0; i < 6; i++) { const x0 = -3 + i, x1 = x0 + 1; cyl(ctx, [x0, Y(x0), 0], [x1, Y(x1), 0], 0.012, 0.012, 3, false) }
    const hangs = [[-2.2, 0.6, 0.8, 'oklch(0.96 0.02 90)'], [-1.2, 0.5, 0.6, 'oklch(0.7 0.1 240)'], [-0.3, 0.7, 0.9, 'oklch(0.85 0.08 20)'], [0.8, 0.55, 0.55, 'oklch(0.8 0.12 95)'], [1.9, 0.9, 1.0, 'oklch(0.92 0.05 150)']]
    for (const [x, w, h, c] of hangs) {
      paint(ctx, null, c, 1); const y = Y(x)
      ctx.quad(x - w / 2, y - h, 0, x + w / 2, y - h, 0, x + w / 2, y, 0, x - w / 2, y, 0)
      if (h < 0.7 && lod <= 2) { ctx.quad(x + w / 2, y - 0.25, 0, x + w / 2 + 0.2, y - 0.3, 0, x + w / 2 + 0.2, y - 0.05, 0, x + w / 2, y, 0); ctx.quad(x - w / 2 - 0.2, y - 0.3, 0, x - w / 2, y - 0.25, 0, x - w / 2, y, 0, x - w / 2 - 0.2, y - 0.05, 0) }
      if (lod <= 2) { paint(ctx, null, 'oklch(0.7 0.06 60)', 1); box(ctx, x - w / 2 + 0.05, y, 0, 0.03, 0.08, 0.03); box(ctx, x + w / 2 - 0.05, y, 0, 0.03, 0.08, 0.03) }
    }
  },
  flowers(ctx, p, lod) {
    for (const [bx, bz, r] of p.beds ?? [[0, 0, 1]]) {
      paint(ctx, null, 'oklch(0.38 0.05 50)', 1); annulus(ctx, [bx, 0.06, bz], [0, 1, 0], 0, r, 10)
      paint(ctx, TX.stone, STONE, 0.95)
      if (lod <= 2) { const n = Math.round(r * 9); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; sph(ctx, bx + Math.cos(a) * r, 0.06, bz + Math.sin(a) * r, 0.13, 0.1, 0.11, 5, 3, 1, 0.15) } }
      ctx.albedo(null)
      const n = lod <= 2 ? Math.round(r * r * 16) : 6
      for (let i = 0; i < n; i++) {
        const a = ctx.random() * TAU, d = Math.sqrt(ctx.random()) * (r - 0.15), x = bx + Math.cos(a) * d, z = bz + Math.sin(a) * d, y = 0.2 + ctx.random() * 0.3
        ctx.color(pick(ctx, GREENS)); oct(ctx, x, 0.12, z, 0.16, 0.1)
        ctx.color(pick(ctx, FLOWERS)); oct(ctx, x, y, z, 0.08, 0.06)
      }
    }
  },
  stones(ctx, p, lod) {
    paint(ctx, TX.flags, 'oklch(0.95 0.02 85)', 0.95)
    for (const [x, y, z, s = 1] of p.pts ?? []) {
      const n = lod <= 2 ? 7 : 5, rr = [], base = 0.3 * s
      for (let i = 0; i < n; i++) rr.push(base * (0.8 + ctx.random() * 0.35))
      const top = [], bot = []
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU; top.push([x + Math.cos(a) * rr[i], y + 0.07, z + Math.sin(a) * rr[i]]); bot.push([x + Math.cos(a) * rr[i] * 1.06, y - 0.04, z + Math.sin(a) * rr[i] * 1.06]) }
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; ctx.tri(x, y + 0.08, z, ...top[j], ...top[i]); ctx.quad(...bot[j], ...bot[i], ...top[i], ...top[j]) }
    }
  },
  trail(ctx, p, lod) {
    const L = p.L ?? [], R = p.R ?? [], skip = new Set(p.skip ?? [])
    const up = (q, d) => [q[0], q[1] + d, q[2]]
    if (lod <= 3) { // log-step edging along both verges
      paint(ctx, TX.timber, BARK, 0.95)
      for (const side of [L, R]) for (let i = 0; i + 1 < side.length; i++) { if (skip.has(i) || skip.has(i + 1)) continue; cyl(ctx, up(side[i], 0.09), up(side[i + 1], 0.09), 0.11, 0.1, lod <= 2 ? 6 : 4, true) }
    }
    // rope-and-post rail on the drop side of the bends
    for (const rail of p.rails ?? []) {
      paint(ctx, TX.timber, WALNUT, 0.85)
      for (const q of rail) cyl(ctx, up(q, -0.1), up(q, 1.0), 0.07, 0.06, lod <= 2 ? 6 : 4, true)
      if (lod <= 3) {
        paint(ctx, null, 'oklch(0.8 0.06 80)', 1)
        for (let i = 0; i + 1 < rail.length; i++) {
          const a = up(rail[i], 0.9), b = up(rail[i + 1], 0.9), m = up(mul(add(a, b), 0.5), -0.18)
          cyl(ctx, a, m, 0.025, 0.025, 4, false); cyl(ctx, m, b, 0.025, 0.025, 4, false)
        }
      }
    }
    // lanterns: a walnut post, an arm, a warm lamp
    for (const q of p.lamps ?? []) {
      paint(ctx, TX.timber, WALNUT, 0.85); box(ctx, q[0], q[1] + 1.05, q[2], 0.14, 2.1, 0.14); box(ctx, q[0] + 0.25, q[1] + 2.05, q[2], 0.6, 0.08, 0.08)
      paint(ctx, null, 'oklch(0.3 0.01 60)', 0.5); box(ctx, q[0] + 0.45, q[1] + 1.85, q[2], 0.26, 0.04, 0.26); box(ctx, q[0] + 0.45, q[1] + 1.55, q[2], 0.3, 0.05, 0.3)
      ctx.albedo(null); ctx.color('oklch(0.95 0.06 80)'); ctx.emissive(...LAMP); box(ctx, q[0] + 0.45, q[1] + 1.7, q[2], 0.2, 0.26, 0.2); ctx.emissive(null)
    }
    if (p.bench) { // the lookout bench: two stumps, a slab seat, a back rail
      const [x, y, z, yaw] = p.bench, T = (u, w) => { const r = (yaw * Math.PI) / 180; return [x + u * Math.cos(r) + w * Math.sin(r), z - u * Math.sin(r) + w * Math.cos(r)] }
      paint(ctx, TX.timber, BARK, 0.95); for (const u of [-0.7, 0.7]) { const [a, b] = T(u, 0.05); cyl(ctx, [a, y - 0.1, b], [a, y + 0.4, b], 0.18, 0.17, 7) }
      paint(ctx, TX.plank, OAK, 0.8); { const [a, b] = T(0, 0.05); box(ctx, a, y + 0.45, b, 1.9, 0.09, 0.45, yaw) }
      paint(ctx, TX.timber, WALNUT, 0.85); for (const u of [-0.75, 0.75]) { const [a, b] = T(u, 0.3); box(ctx, a, y + 0.7, b, 0.08, 0.6, 0.08, yaw) }
      { const [a, b] = T(0, 0.3); box(ctx, a, y + 0.9, b, 1.8, 0.16, 0.06, yaw) }
    }
  },
  post(ctx, p, lod) {
    paint(ctx, TX.timber, WALNUT, 0.85); box(ctx, 0, 1.2, 0, 0.16, 2.4, 0.16)
    paint(ctx, TX.stone, STONE, 0.95); for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; sph(ctx, Math.cos(a) * 0.3, 0.08, Math.sin(a) * 0.3, 0.16, 0.12, 0.14, 5, 3, 1, 0.15) }
    paint(ctx, null, 'oklch(0.7 0.13 140)', 1); for (let i = 0; i < 5; i++) oct(ctx, (ctx.random() - 0.5) * 0.8, 0.15, (ctx.random() - 0.5) * 0.8, 0.14, 0.1)
    ctx.color(pick(ctx, FLOWERS)); oct(ctx, 0.25, 0.3, -0.2, 0.07, 0.06); ctx.color(pick(ctx, FLOWERS)); oct(ctx, -0.3, 0.28, 0.1, 0.07, 0.06)
  },
  crags(ctx, p, lod) {
    ctx.albedo(TX.stone); ctx.roughness(1)
    const seg = lod <= 2 ? 8 : lod <= 3 ? 6 : 5, rings = lod <= 2 ? 6 : 4
    for (const [x, y, z, s = 3, yaw = 0] of p.rocks ?? []) {
      const r = (yaw * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r), at = (u, w) => [x + u * c + w * sn, z - u * sn + w * c]
      const parts = lod >= 4 ? [[0, 0, 1, 1.3]] : [[0, 0, 1, 1.35], [0.8, 0.4, 0.6, 0.9], [-0.7, -0.3, 0.55, 0.7], [0.2, -0.8, 0.45, 0.55]]
      for (const [u, w, k, hk] of parts) { const [a, b] = at(u * s, w * s); rock(ctx, a, y + s * hk * 0.45 - s * 0.2, b, s * k * 0.9, s * k * hk * 0.8, s * k * 0.7, seg, rings, 'oklch(0.88 0.015 80)', 'oklch(0.72 0.1 130)') }
    }
  },
  pine(ctx, p, lod) {
    paint(ctx, TX.timber, BARK, 0.95); cyl(ctx, [0, 0, 0], [0, 1.4, 0], 0.22, 0.16, lod <= 2 ? 6 : 4, false)
    ctx.albedo(null); ctx.roughness(0.95)
    const tiers = lod >= 4 ? [[0.8, 7.5, 2.1]] : [[1.0, 4.2, 2.3], [2.6, 6.0, 1.75], [4.2, 7.6, 1.15]], seg = lod <= 2 ? 8 : 6
    tiers.forEach(([y0, y1, r], i) => { ctx.color(['oklch(0.42 0.08 155)', 'oklch(0.47 0.09 150)', 'oklch(0.53 0.1 145)'][i % 3]); cyl(ctx, [0, y0, 0], [0, y1, 0], r, 0, seg, true) })
  },
  boulder(ctx, p, lod) { ctx.albedo(TX.stone); ctx.roughness(1); rock(ctx, 0, 0.35, 0, 0.9, 0.7, 0.75, lod <= 2 ? 7 : 5, lod <= 2 ? 5 : 3, 'oklch(0.88 0.015 80)', 'oklch(0.7 0.11 130)') },
}
export function geometry(ctx) {
  const p = ctx.params ?? {}
  ctx.flat()
  ;(B[p.item] ?? B.boulder)(ctx, p, ctx.lod)
}
export function collider(ctx) {
  const p = ctx.params ?? {}
  switch (p.item) {
    case 'well': return { kind: 'box', width: 1.9, height: 1.0, depth: 1.9 }
    case 'oven': box(ctx, 0, 0.8, 0, 1.9, 1.6, 1.8); return
    case 'tree': cyl(ctx, [0, 0, 0], [0, 3, 0], 0.42, 0.3, 6); return
    case 'firepit': for (const deg of p.benches ?? [20, 140, 260]) { const a = (deg * Math.PI) / 180; box(ctx, Math.cos(a) * 2, 0.25, Math.sin(a) * 2, 1.9, 0.5, 0.45, 90 - deg) } return
    case 'crags': for (const [x, y, z, s = 3] of p.rocks ?? []) box(ctx, x, y + s * 0.4, z, s * 1.4, s * 1.1, s * 1.1); return
    case 'post': box(ctx, 0, 1.2, 0, 0.16, 2.4, 0.16); return
    case 'notice': box(ctx, 0, 1.05, 0.04, 1.8, 2.1, 0.16); return
    case 'garden': case 'washline': case 'flowers': case 'stones': case 'trail': case 'pine': case 'boulder': return null
  }
  return null
}
