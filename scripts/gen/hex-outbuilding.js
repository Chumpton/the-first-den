// Single-storey layered hex outbuildings behind the home. params.style = workshop | studio | glasshouse.
// Feet at ground centre, door on local -Z (the side facing the home). Plinth, walls with a door gap, and
// stacked hex roof tiers — each style its own stuff and its own crown.
import { Q, solid, prism, box, ngon, gem } from "../lib/road-solid.js";
import { softened } from "./soften.js";
const TX = {
  stone: "cdn/texture-pale-weathered-limestone-blocks.png", moss: "cdn/texture-soft-green-moss-cozy.png",
  oak: "cdn/texture-weathered-honey-oak-deck-planks.png", shingle: "cdn/texture-mossy-wooden-shingles-cozy.png",
  plaster: "cdn/texture-buttercream-lime-plaster-wall.png", slate: "cdn/texture-blue-grey-slate-roof-tiles.png",
  thatch: "cdn/texture-golden-straw-thatch-roof.png", walnut: "cdn/texture-dark-walnut-wood-grain.png",
};
const mat = (ctx, t, c, r = 0.9) => { ctx.albedo(TX[t]); ctx.color(c); ctx.roughness(r); ctx.emissive(null); };
const glass = (ctx) => { ctx.albedo(null); ctx.color("oklch(0.85 0.05 190 / 0.45)"); ctx.roughness(0.1); };
const glow = (ctx) => { ctx.albedo(null); ctx.color("oklch(0.92 0.1 80)"); ctx.emissive(2.2, 1.5, 0.6); };
const S = {
  workshop:   { R: 3.4, H: 2.7, base: ["stone", "oklch(0.9 0.02 85)"], wall: ["stone", "oklch(0.86 0.025 80)"], trim: ["walnut", "oklch(0.7 0.04 60)"], roof: ["slate", "oklch(0.72 0.03 240)"], tiers: [[1.35, 0.9, 0.62], [0.72, 0.8, 0.5], [0.4, 0.6, 0.02]] },
  studio:     { R: 3.1, H: 2.6, base: ["stone", "oklch(0.88 0.03 90)"], wall: ["plaster", "oklch(0.95 0.04 95)"], trim: ["oak", "oklch(0.85 0.06 70)"], roof: ["thatch", "oklch(0.88 0.08 85)"], tiers: [[1.4, 0.8, 0.7], [0.8, 0.7, 0.6], [0.55, 0.9, 0.02]] },
  glasshouse: { R: 3.0, H: 2.5, base: ["stone", "oklch(0.9 0.02 85)"], wall: null, trim: ["oak", "oklch(0.78 0.05 150)"], roof: null, tiers: [[1.15, 0.9, 0.62], [0.68, 0.7, 0.35], [0.36, 0.45, 0.02]] },
};
const ROT = Math.PI / 6; // a flat side faces -Z
function corners(r) { return ngon(6, r, 0, 0, ROT); }
// a wall slab along one hex side from a to b, inner radius ri, outer ro, y0..y1, spanning t0..t1 of the side
function slab(ctx, i, ri, ro, y0, y1, t0 = 0, t1 = 1) {
  const A = corners(ri), B = corners(ro), j = (i + 1) % 6;
  const L = (P, t) => [P[i][0] + (P[j][0] - P[i][0]) * t, P[i][1] + (P[j][1] - P[i][1]) * t];
  const loop = [L(A, t0), L(A, t1), L(B, t1), L(B, t0)];
  solid(ctx, loop.map(([x, z]) => [x, y0, z]), loop.map(([x, z]) => [x, y1, z]));
}
// the side whose outward normal points to -Z
function doorSide() { const c = corners(1); for (let i = 0; i < 6; i++) { const j = (i + 1) % 6; if ((c[i][1] + c[j][1]) / 2 < -0.8) return i; } return 0; }
function walls(ctx, s, lod, solidOnly) {
  const d = doorSide(), R = s.R, t = 0.28, top = 0.35 + s.H;
  const gap = 1.3 / R; const g0 = 0.5 - gap / 2, g1 = 0.5 + gap / 2;
  for (let i = 0; i < 6; i++) {
    if (s.wall || solidOnly) {
      if (!solidOnly) mat(ctx, ...s.wall);
      if (i === d) { slab(ctx, i, R - t, R, 0.35, top, 0, g0); slab(ctx, i, R - t, R, 0.35, top, g1, 1); slab(ctx, i, R - t, R, 2.55, top, g0, g1); }
      else if (!solidOnly && lod <= 3) { // a window hole: sill band, head band, piers
        slab(ctx, i, R - t, R, 0.35, 1.25); slab(ctx, i, R - t, R, 2.05, top);
        slab(ctx, i, R - t, R, 1.25, 2.05, 0, 0.32); slab(ctx, i, R - t, R, 1.25, 2.05, 0.68, 1);
        glow(ctx); slab(ctx, i, R - t * 0.6, R - t * 0.45, 1.25, 2.05, 0.32, 0.68);
        mat(ctx, ...s.trim); slab(ctx, i, R - 0.02, R + 0.1, 1.17, 1.27, 0.28, 0.72); slab(ctx, i, R - 0.02, R + 0.06, 2.03, 2.12, 0.3, 0.7);
      } else slab(ctx, i, R - t, R, 0.35, top);
    } else {
      // glasshouse: oak posts and rails, glazed panes, open door gap
      mat(ctx, ...s.trim);
      slab(ctx, i, R - 0.2, R, 0.35, 0.75, ...(i === d ? [0, g0] : [0, 1]));
      if (i === d) slab(ctx, i, R - 0.2, R, 0.35, 0.75, g1, 1);
      slab(ctx, i, R - 0.16, R, top - 0.14, top);
      if (i === d) slab(ctx, i, R - 0.16, R, 2.5, top, g0, g1);
      for (const tt of [0.5]) if (i !== d) slab(ctx, i, R - 0.14, R - 0.02, 0.75, top, tt - 0.02, tt + 0.02);
      glass(ctx);
      if (i === d) { slab(ctx, i, R - 0.1, R - 0.08, 0.75, top - 0.14, 0.04, g0); slab(ctx, i, R - 0.1, R - 0.08, 0.75, top - 0.14, g1, 0.96); }
      else slab(ctx, i, R - 0.1, R - 0.08, 0.75, top - 0.14, 0.04, 0.96);
    }
  }
  // corner posts
  if (!solidOnly) { mat(ctx, ...s.trim); for (const [x, z] of corners(R - 0.02)) prism(ctx, ngon(4, 0.17, x, z, Math.PI / 4), 0.35, top + 0.05); }
}
function roof(ctx, s, lod) {
  let y = 0.35 + s.H, r = s.R + 0.55;
  for (const [k, [rr, h, shrink]] of s.tiers.entries()) {
    const R0 = s.R * rr + (k === 0 ? 0.55 : 0.25);
    if (s.roof) mat(ctx, ...s.roof, 0.95); else glass(ctx);
    prism(ctx, corners(R0), y, y + h, shrink);
    if (!s.roof && lod <= 3) { mat(ctx, ...s.trim); for (const [x, z] of corners(R0)) { /* rafters */ solid(ctx, [[x - 0.05, y, z], [x + 0.05, y, z], [x + 0.05, y + 0.1, z], [x - 0.05, y + 0.1, z]], [[x * shrink - 0.05, y + h, z * shrink], [x * shrink + 0.05, y + h, z * shrink], [x * shrink + 0.05, y + h + 0.1, z * shrink], [x * shrink - 0.05, y + h + 0.1, z * shrink]]); } }
    if (lod <= 2 && s.roof) { mat(ctx, ...s.trim); prism(ctx, corners(R0 + 0.06), y - 0.12, y); }
    y += h * 0.82; r = R0 * shrink;
  }
  return y;
}
const STYLE = {
  workshop(ctx, s, lod, y) { // chimney and an anvil-stone at the door
    mat(ctx, "stone", "oklch(0.8 0.02 60)"); prism(ctx, ngon(4, 0.45, 1.6, 1.2, Math.PI / 4), 2.5, y + 0.8, 0.92);
    mat(ctx, "walnut", "oklch(0.35 0.02 50)"); prism(ctx, ngon(4, 0.36, 1.6, 1.2, Math.PI / 4), y + 0.8, y + 0.9);
    if (lod <= 3) { mat(ctx, "oak", "oklch(0.8 0.05 65)"); box(ctx, -2.3, 0.35, 0.2, -1.2, 1.2, 1.4); box(ctx, -2.4, 1.2, 0.1, -1.1, 1.28, 1.5); }
  },
  studio(ctx, s, lod, y) { // moss living crown and a round finial
    mat(ctx, "moss", "oklch(0.85 0.1 130)"); prism(ctx, corners(0.7), y - 0.2, y + 0.15, 0.6);
    mat(ctx, "oak", "oklch(0.85 0.06 70)"); gem(ctx, 0, y + 0.15, 0, 0.22, 0.5, 0.05, 6);
    if (lod <= 3) { mat(ctx, "oak", "oklch(0.8 0.05 65)"); box(ctx, 1.0, 0.35, 1.2, 2.2, 1.15, 1.8); mat(ctx, "plaster", "oklch(0.8 0.08 40)"); prism(ctx, ngon(8, 1.1, 0, 0), 0.35, 0.38); }
  },
  glasshouse(ctx, s, lod, y) { // copper finial and planting benches
    ctx.albedo(null); ctx.color("oklch(0.62 0.1 170)"); ctx.roughness(0.4); gem(ctx, 0, y, 0, 0.18, 0.55, 0.05, 6);
    if (lod <= 3) {
      for (const a of [1, 2, 4, 5]) { const ang = ROT + a * Math.PI / 3 + Math.PI / 6, x = Math.cos(ang) * 2.1, z = Math.sin(ang) * 2.1;
        mat(ctx, "oak", "oklch(0.8 0.05 65)"); prism(ctx, ngon(4, 0.6, x, z, ang + Math.PI / 4), 0.35, 0.95);
        mat(ctx, "moss", "oklch(0.7 0.14 140)"); for (let k = 0; k < 4; k++) gem(ctx, x + Math.cos(k * 1.7) * 0.25, 1.0, z + Math.sin(k * 1.7) * 0.25, 0.16, 0.35 + (k % 2) * 0.15, 0.05, 5);
      }
    }
  },
};
export const geometry = softened(function geometry(ctx) {
  ctx.flat();
  const st = ctx.params.style in S ? ctx.params.style : "workshop", s = S[st], lod = ctx.lod;
  mat(ctx, ...s.base); prism(ctx, corners(s.R + 0.35), -0.4, 0.2); prism(ctx, corners(s.R + 0.2), 0.2, 0.35);
  mat(ctx, "oak", "oklch(0.88 0.05 70)"); prism(ctx, corners(s.R - 0.25), 0.35, 0.37);
  // front step
  mat(ctx, ...s.base); box(ctx, -0.9, -0.2, -s.R - 1.0, 0.9, 0.18, -s.R - 0.25);
  walls(ctx, s, lod, false);
  const y = roof(ctx, s, lod);
  if (lod <= 3) { glow(ctx); gem(ctx, 0.95, 2.35, -s.R - 0.25, 0.12, 0.18, 0.14, 6); ctx.emissive(null); }
  STYLE[st](ctx, s, lod, y);
});
export function collider(ctx) {
  const st = ctx.params.style in S ? ctx.params.style : "workshop", s = S[st];
  prism(ctx, corners(s.R + 0.2), -0.4, 0.35);
  box(ctx, -0.9, -0.2, -s.R - 1.0, 0.9, 0.18, -s.R - 0.25);
  walls(ctx, s, 5, true);
  let y = 0.35 + s.H; const [rr, h, sh] = s.tiers[0]; prism(ctx, corners(s.R * rr + 0.55), y, y + h, sh);
}
