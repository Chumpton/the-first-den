// Hilltop villager: low-poly knitted folk, one rigged scripted body. Round face and rosy cheeks, a ribbed jumper,
// optional apron and scarf, a hat (none | beanie | wide | straw | bun), a staff for the elder. Feet at 0, faces −Z,
// ~1.62 m at scale 1 (a kid is the same body at scale ~0.68). params: jumper, pants, scarf, apron, hat, hatColor,
// hair, skin, staff, beard. Each part rides one bone (rigid), animated by anim/villager.yml.
import { TAU, box, cyl, sph, oct } from '../lib/village-mesh.js'
export function skeleton() {
  return {
    root: { pivot: [0, 0.74, 0] },
    spine: { parent: 'root', pivot: [0, 0.78, 0] },
    head: { parent: 'spine', pivot: [0, 1.34, 0] },
    armL: { parent: 'spine', pivot: [-0.25, 1.26, 0] },
    armR: { parent: 'spine', pivot: [0.25, 1.26, 0] },
    legL: { parent: 'root', pivot: [-0.1, 0.74, 0] },
    legR: { parent: 'root', pivot: [0.1, 0.74, 0] },
  }
}
const D = { jumper: 'oklch(0.62 0.12 30)', pants: 'oklch(0.45 0.05 250)', scarf: null, apron: null, hat: 'none', hatColor: 'oklch(0.6 0.1 60)', hair: 'oklch(0.45 0.08 50)', skin: 'oklch(0.85 0.06 55)', staff: false, beard: false }
const c = (ctx, col, r = 0.9) => { ctx.albedo(null); ctx.color(col); ctx.roughness(r) }
export function geometry(ctx) {
  const p = { ...D, ...(ctx.params ?? {}) }, L = ctx.lod, s = L <= 2 ? 10 : L <= 3 ? 7 : 5, rg = L <= 2 ? 7 : 4
  ctx.flat()
  // legs + boots
  for (const [b, x] of [['legL', -0.1], ['legR', 0.1]]) {
    ctx.bone(b); c(ctx, p.pants)
    cyl(ctx, [x, 0.76, 0], [x, 0.14, 0], 0.09, 0.075, s > 6 ? 7 : 5, false)
    c(ctx, 'oklch(0.36 0.05 50)', 0.7); box(ctx, x, 0.07, -0.04, 0.14, 0.14, 0.26)
  }
  // body: jumper barrel, ribbed hem, rounded shoulders
  ctx.bone('spine'); c(ctx, p.jumper, 1)
  cyl(ctx, [0, 0.74, 0], [0, 1.24, 0], 0.235, 0.215, s, false)
  sph(ctx, 0, 1.22, 0, 0.215, 0.1, 0.2, s, L <= 2 ? 4 : 2, 0.5)
  if (L <= 3) {
    ctx.color('oklch(from ' + p.jumper + ' calc(l - 0.07) c h)')
    cyl(ctx, [0, 0.7, 0], [0, 0.8, 0], 0.245, 0.245, s, false)
    if (L <= 2) { ctx.color('oklch(0.96 0.02 90)'); for (let i = 0; i < 3; i++) cyl(ctx, [0, 0.93 + i * 0.1, 0], [0, 0.945 + i * 0.1, 0], 0.232 - i * 0.005, 0.231 - i * 0.005, s, false) } // knitted fair-isle stripes
  }
  if (p.apron) { c(ctx, p.apron, 1); ctx.quad(-0.2, 0.46, -0.25, 0.2, 0.46, -0.25, 0.19, 1.12, -0.24, -0.19, 1.12, -0.24); if (L <= 2) { c(ctx, 'oklch(from ' + p.apron + ' calc(l - 0.1) c h)'); box(ctx, 0, 0.72, -0.262, 0.2, 0.12, 0.01) } }
  if (p.scarf) {
    c(ctx, p.scarf, 1); cyl(ctx, [0, 1.25, 0], [0, 1.35, 0], 0.15, 0.13, s, true)
    box(ctx, 0.08, 1.08, -0.2, 0.09, 0.32, 0.04, 0, -12)
    if (L <= 2) { ctx.color('oklch(0.96 0.02 90)'); box(ctx, 0.08, 1.0, -0.215, 0.092, 0.03, 0.03, 0, -12); box(ctx, 0.08, 1.12, -0.21, 0.092, 0.03, 0.03, 0, -12) }
  }
  // arms: sleeves + hands
  for (const [b, x] of [['armL', -1], ['armR', 1]]) {
    ctx.bone(b); c(ctx, p.jumper, 1)
    cyl(ctx, [0.25 * x, 1.27, 0], [0.3 * x, 0.84, -0.02], 0.075, 0.068, s > 6 ? 6 : 4, false)
    c(ctx, p.skin, 0.8); sph(ctx, 0.305 * x, 0.8, -0.02, 0.06, 0.07, 0.06, 6, 3)
    if (b === 'armR' && p.staff) { c(ctx, 'oklch(0.55 0.07 55)', 0.9); cyl(ctx, [0.31, 0.02, -0.05], [0.31, 1.6, -0.05], 0.025, 0.03, 5, true); sph(ctx, 0.31, 1.62, -0.05, 0.05, 0.06, 0.05, 6, 3) }
  }
  // head: big round face, hair, cheeks, eyes, nose, hat
  ctx.bone('head'); c(ctx, p.skin, 0.8)
  cyl(ctx, [0, 1.3, 0], [0, 1.38, 0], 0.07, 0.07, 6, false)
  sph(ctx, 0, 1.53, 0, 0.19, 0.19, 0.185, s + 2, rg)
  if (L <= 3) {
    oct(ctx, 0, 1.5, -0.19, 0.035, 0.04)
    c(ctx, 'oklch(0.25 0.03 40)', 0.4); box(ctx, -0.065, 1.56, -0.172, 0.035, 0.05, 0.02); box(ctx, 0.065, 1.56, -0.172, 0.035, 0.05, 0.02)
    c(ctx, 'oklch(0.78 0.1 20)', 1); box(ctx, -0.11, 1.49, -0.155, 0.06, 0.035, 0.02, -25); box(ctx, 0.11, 1.49, -0.155, 0.06, 0.035, 0.02, 25)
    if (L <= 2) { c(ctx, 'oklch(0.45 0.08 25)', 0.8); box(ctx, 0, 1.44, -0.178, 0.07, 0.015, 0.02) }
  }
  c(ctx, p.hair, 1)
  sph(ctx, 0, 1.56, 0.02, 0.2, 0.19, 0.2, s + 2, L <= 2 ? 5 : 3, 0.62)
  if (p.hat === 'bun') sph(ctx, 0, 1.76, 0.1, 0.09, 0.08, 0.09, 7, 4)
  if (p.beard) { c(ctx, 'oklch(0.94 0.01 90)', 1); sph(ctx, 0, 1.42, -0.1, 0.15, 0.14, 0.11, 7, 4); }
  c(ctx, p.hatColor, 1)
  if (p.hat === 'beanie') { sph(ctx, 0, 1.6, 0.01, 0.205, 0.2, 0.205, s + 2, rg, 0.55); if (L <= 3) { ctx.color('oklch(0.96 0.02 90)'); sph(ctx, 0, 1.83, 0.01, 0.06, 0.06, 0.06, 6, 3) } }
  if (p.hat === 'wide') { cyl(ctx, [0, 1.68, 0], [0, 1.7, 0], 0.4, 0.4, s + 4, true); cyl(ctx, [0, 1.69, 0], [0, 1.98, 0], 0.18, 0.08, s + 2, true); if (L <= 2) { ctx.color('oklch(0.72 0.14 30)'); cyl(ctx, [0, 1.7, 0], [0, 1.76, 0], 0.182, 0.17, s + 2, false) } }
  if (p.hat === 'straw') { cyl(ctx, [0, 1.67, 0], [0, 1.69, 0], 0.33, 0.33, s + 2, true); cyl(ctx, [0, 1.68, 0], [0, 1.82, 0], 0.17, 0.15, s + 2, true) }
}
