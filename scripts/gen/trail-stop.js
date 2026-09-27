// Trail stops along the highway verges. params.kind = hitch | supplies | shelter | milestone | shrine.
// Feet at ground, front (toward the road) is −Z, metres. One merged mesh per stop, lod-gated.
import { box, prism, ngon, gem, solid } from "../lib/road-solid.js";
import { beam, lathe, blob } from "../lib/yard-kit.js";
const TX = {
  stone: "cdn/texture-pale-weathered-limestone-blocks.png", moss: "cdn/texture-soft-green-moss-cozy.png",
  oak: "cdn/texture-weathered-honey-oak-deck-planks.png", walnut: "cdn/texture-hand-joined-walnut-wood.png",
  roof: "cdn/texture-mossy-wooden-shingles-cozy.png", straw: "cdn/texture-golden-straw-bundle.png",
};
const C = {
  stone: "oklch(0.95 0.02 85)", moss: "oklch(0.9 0.08 130)", oak: "oklch(0.94 0.05 72)", walnut: "oklch(0.9 0.03 55)",
  roof: "oklch(0.93 0.04 60)", iron: "oklch(0.32 0.015 250)", linen: "oklch(0.93 0.025 85)", straw: "oklch(0.96 0.05 88)",
  water: "oklch(0.62 0.07 198)", terra: "oklch(0.64 0.11 45)", leaf: "oklch(0.62 0.1 135)", petal: "oklch(0.86 0.1 20)",
  sun: "oklch(0.9 0.13 90)", glass: "oklch(0.92 0.1 80)",
};
const P = (ctx, t, c, r = 0.85, m = 0) => { ctx.albedo(t ? TX[t] : null); ctx.color(c); ctx.roughness(r); ctx.metalness(m); ctx.emissive(null); };
const glow = (ctx) => { ctx.albedo(null); ctx.color(C.glass); ctx.roughness(0.4); ctx.metalness(0); ctx.emissive(2.4, 1.5, 0.55); };
// box turned by yaw (radians) about its own centre
function ybox(ctx, cx, y0, cz, sx, sy, sz, yaw = 0) {
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const L = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => { const x = i * sx / 2, z = j * sz / 2; return [cx + x * c + z * s, cz - x * s + z * c]; });
  solid(ctx, L.map(([x, z]) => [x, y0, z]), L.map(([x, z]) => [x, y0 + sy, z]));
}
function flowers(ctx, lod, pts) {
  if (lod > 2) return;
  for (const [x, z, h] of pts) {
    P(ctx, null, C.leaf, 0.95); blob(ctx, x, 0, z, 0.16, 0.14 * h, 0.14, 5);
    P(ctx, null, h > 1 ? C.sun : C.petal, 0.8); gem(ctx, x + 0.04, 0.15 * h, z - 0.03, 0.05, 0.03, 0.02, 4); gem(ctx, x - 0.06, 0.12 * h, z + 0.04, 0.045, 0.03, 0.02, 4);
  }
}
function postCap(ctx, x, z, h, w) { prism(ctx, ngon(4, w * 0.72, x, z, Math.PI / 4), h, h + 0.1, 0.25); }

const B = {
  hitch(ctx, lod) {
    // two walnut posts and an oak rail, iron rings with lead ropes, a water trough behind, a straw bale
    P(ctx, "walnut", C.walnut);
    for (const x of [-1.2, 1.2]) { box(ctx, x - 0.08, 0, -0.08, x + 0.08, 1.05, 0.08); postCap(ctx, x, 0, 1.05, 0.16); }
    P(ctx, "oak", C.oak); box(ctx, -1.34, 0.86, -0.06, 1.34, 0.97, 0.06);
    if (lod <= 3) box(ctx, -1.12, 0.42, -0.04, 1.12, 0.5, 0.04);
    if (lod <= 2) {
      P(ctx, null, C.iron, 0.5, 0.6);
      for (const x of [-0.55, 0.45]) { const n = 6, r = 0.07; for (let i = 0; i < n; i++) { const a = i / n * 6.283, b = (i + 1) / n * 6.283; beam(ctx, [x + Math.cos(a) * r, 0.8 + Math.sin(a) * r, -0.07], [x + Math.cos(b) * r, 0.8 + Math.sin(b) * r, -0.07], 0.018); } }
      P(ctx, null, C.linen, 0.95); beam(ctx, [-0.55, 0.73, -0.07], [-0.4, 0.3, -0.25], 0.03); beam(ctx, [-0.4, 0.3, -0.25], [-0.2, 0.02, -0.35], 0.03);
      for (const x of [-1.2, 1.2]) { P(ctx, "stone", C.stone, 0.92); prism(ctx, ngon(6, 0.16, x, 0), 0, 0.08, 0.8); }
    }
    // trough
    P(ctx, "walnut", C.walnut);
    if (lod <= 3) {
      box(ctx, -0.8, 0, 0.35, 0.8, 0.08, 0.85);
      box(ctx, -0.8, 0.08, 0.35, 0.8, 0.46, 0.41); box(ctx, -0.8, 0.08, 0.79, 0.8, 0.46, 0.85);
      box(ctx, -0.8, 0.08, 0.41, -0.74, 0.46, 0.79); box(ctx, 0.74, 0.08, 0.41, 0.8, 0.46, 0.79);
      P(ctx, null, C.iron, 0.5, 0.6); box(ctx, -0.82, 0.3, 0.33, -0.7, 0.34, 0.87); box(ctx, 0.7, 0.3, 0.33, 0.82, 0.34, 0.87);
      P(ctx, null, C.water, 0.15); ctx.quad(-0.74, 0.39, 0.41, -0.74, 0.39, 0.79, 0.74, 0.39, 0.79, 0.74, 0.39, 0.41);
    } else box(ctx, -0.8, 0, 0.35, 0.8, 0.46, 0.85);
    P(ctx, "straw", C.straw, 1); ybox(ctx, 1.85, 0, 0.35, 0.85, 0.45, 0.5, 0.25);
    if (lod <= 2) { P(ctx, null, C.iron); ybox(ctx, 1.85, 0.2, 0.35, 0.87, 0.04, 0.52, 0.25); ybox(ctx, 1.85, 0.44, 0.35, 0.4, 0.06, 0.3, -0.3); P(ctx, "straw", C.straw, 1); ybox(ctx, 1.85, 0.44, 0.35, 0.4, 0.06, 0.3, -0.3); }
    flowers(ctx, lod, [[-1.45, 0.25, 1], [1.35, -0.1, 1.3]]);
  },
  supplies(ctx, lod) {
    const crate = (cx, y0, cz, s, yaw) => {
      P(ctx, "oak", C.oak); ybox(ctx, cx, y0, cz, s * 0.96, s * 0.96, s * 0.96, yaw);
      if (lod > 2) return;
      P(ctx, "walnut", C.walnut);
      const c = Math.cos(yaw), sn = Math.sin(yaw), h = s / 2 - 0.03;
      for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const x = i * h, z = j * h; ybox(ctx, cx + x * c + z * sn, y0, cz - x * sn + z * c, 0.07, s, 0.07, yaw); }
      for (const j of [-1, 1]) { const z = j * h; ybox(ctx, cx + z * sn, y0 + s - 0.07, cz + z * c, s, 0.07, 0.07, yaw); ybox(ctx, cx + z * sn, y0, cz + z * c, s, 0.07, 0.07, yaw); }
    };
    crate(-0.95, 0, 0.05, 0.72, 0.06); crate(-0.18, 0, 0.1, 0.72, -0.1); crate(-0.6, 0.72, 0.1, 0.6, 0.22);
    if (lod <= 3) crate(-0.3, 0, 0.82, 0.62, 0.35);
    // barrel with hoops and a lid
    const n = lod <= 2 ? 12 : 6;
    P(ctx, "oak", C.oak); lathe(ctx, [[0.29, 0], [0.34, 0.22], [0.36, 0.45], [0.34, 0.68], [0.29, 0.9]], n, 0.8, 0.05);
    if (lod <= 2) { P(ctx, null, C.iron, 0.5, 0.6); for (const [y, r] of [[0.08, 0.305], [0.32, 0.355], [0.58, 0.355], [0.82, 0.305]]) lathe(ctx, [[r, y], [r, y + 0.05]], n, 0.8, 0.05);
      P(ctx, "walnut", C.walnut); lathe(ctx, [[0.27, 0.9], [0.27, 0.93]], n, 0.8, 0.05); }
    // linen sacks
    P(ctx, null, C.linen, 0.95); blob(ctx, 0.35, 0, -0.45, 0.26, 0.42, 0.22, lod <= 2 ? 7 : 5);
    if (lod <= 2) { blob(ctx, 0.75, 0, -0.5, 0.22, 0.34, 0.2, 6); P(ctx, null, C.iron); gem(ctx, 0.35, 0.44, -0.45, 0.06, 0.05, 0.03, 4); }
    flowers(ctx, lod, [[-1.45, 0.55, 1], [1.3, 0.45, 1.3]]);
  },
  shelter(ctx, lod) {
    // flagstone pad, four walnut posts, a shingled gable shade roof, an oak bench against the back
    P(ctx, "stone", C.stone, 0.92); box(ctx, -1.75, 0, -1, 1.75, 0.12, 1);
    const X = 1.45, Z = 0.72, H = 2.15;
    P(ctx, "walnut", C.walnut);
    for (const x of [-X, X]) for (const z of [-Z, Z]) box(ctx, x - 0.07, 0.12, z - 0.07, x + 0.07, H, z + 0.07);
    for (const x of [-X, X]) box(ctx, x - 0.06, H, -1.05, x + 0.06, H + 0.14, 1.05);
    P(ctx, "oak", C.oak);
    for (const z of [-Z, Z]) box(ctx, -1.7, H - 0.12, z - 0.06, 1.7, H, z + 0.06);
    box(ctx, -1.95, 2.8, -0.06, 1.95, 2.9, 0.06);
    if (lod <= 2) for (const x of [-X, X]) for (const s of [-1, 1]) beam(ctx, [x, H - 0.55, s * Z], [x, H - 0.05, s * (Z - 0.45)], 0.07);
    // roof slopes: eave (z ±1.2, y 2.18) to ridge (z 0, y 2.9)
    P(ctx, "roof", C.roof, 0.9);
    for (const s of [-1, 1]) {
      const e = 1.22 * s, A = [[-1.95, 2.18, e], [1.95, 2.18, e], [1.95, 2.9, 0], [-1.95, 2.9, 0]];
      solid(ctx, A, A.map(([x, y, z]) => [x, y + 0.09, z]));
      if (lod <= 2) { P(ctx, "walnut", C.walnut); box(ctx, -1.97, 2.12, e - 0.05, 1.97, 2.24, e + 0.05); P(ctx, "roof", C.roof, 0.9); }
    }
    P(ctx, "roof", C.roof, 0.9); box(ctx, -2, 2.93, -0.1, 2, 3.02, 0.1);
    // bench
    P(ctx, "oak", C.oak); box(ctx, -1.2, 0.46, 0.12, 1.2, 0.52, 0.55);
    if (lod <= 3) { box(ctx, -1.25, 0.72, 0.6, 1.25, 0.84, 0.65); box(ctx, -1.25, 0.94, 0.62, 1.25, 1.04, 0.67); }
    P(ctx, "walnut", C.walnut);
    for (const x of [-1.05, 1.05]) { box(ctx, x - 0.05, 0.12, 0.16, x + 0.05, 0.46, 0.24); box(ctx, x - 0.05, 0.12, 0.47, x + 0.05, 1.04, 0.56); }
    if (lod <= 2) {
      P(ctx, null, C.terra, 0.9); lathe(ctx, [[0.14, 0.12], [0.2, 0.42], [0.22, 0.44]], 8, 1.52, -0.75);
      P(ctx, null, C.leaf, 0.95); blob(ctx, 1.52, 0.42, -0.75, 0.24, 0.3, 0.24, 6);
      P(ctx, null, C.petal, 0.8); gem(ctx, 1.46, 0.7, -0.8, 0.06, 0.04, 0.03, 4); gem(ctx, 1.6, 0.66, -0.7, 0.05, 0.04, 0.03, 4);
      P(ctx, null, C.linen, 0.95); ctx.quad(-0.3, 2.06, -0.72, 0.3, 2.06, -0.72, 0.3, 1.72, -0.72, -0.3, 1.72, -0.72);
    }
  },
  milestone(ctx, lod) {
    // carved limestone marker: its front face is flush with the plinth front (z −0.16), where the ui panel sits
    P(ctx, "stone", C.stone, 0.92);
    box(ctx, -0.46, 0, -0.16, 0.46, 0.16, 0.36);
    const f = [[-0.35, 0.16], [0.35, 0.16], [0.35, 0.95], [0.26, 1.1], [0.1, 1.17], [-0.1, 1.17], [-0.26, 1.1], [-0.35, 0.95]];
    const shape = lod <= 3 ? f : [f[0], f[1], f[2], f[4], f[5], f[7]];
    solid(ctx, shape.map(([x, y]) => [x, y, -0.16]), shape.map(([x, y]) => [x, y, 0.16]));
    if (lod <= 3) {
      P(ctx, "moss", C.moss, 1); blob(ctx, 0.12, 1.08, 0.06, 0.22, 0.1, 0.12, 5); blob(ctx, -0.3, 0.14, 0.26, 0.2, 0.08, 0.12, 5);
    }
    flowers(ctx, lod, [[-0.6, 0.12, 1], [0.58, 0.2, 1.3], [0.4, 0.5, 1]]);
  },
  shrine(ctx, lod) {
    // stepped limestone base, walnut post, a gabled oak shrine box with a lit candle, a lantern on an arm
    P(ctx, "stone", C.stone, 0.92);
    box(ctx, -0.55, 0, -0.4, 0.55, 0.14, 0.4);
    if (lod <= 3) box(ctx, -0.4, 0.14, -0.28, 0.4, 0.26, 0.28);
    P(ctx, "walnut", C.walnut); box(ctx, -0.1, 0.26, -0.1, 0.1, 1.35, 0.1);
    P(ctx, "oak", C.oak);
    box(ctx, -0.34, 1.35, -0.26, 0.34, 1.4, 0.26);
    box(ctx, -0.32, 1.4, -0.22, -0.26, 1.85, 0.24); box(ctx, 0.26, 1.4, -0.22, 0.32, 1.85, 0.24); box(ctx, -0.32, 1.4, 0.18, 0.32, 1.85, 0.24);
    P(ctx, "walnut", C.walnut); box(ctx, -0.34, 1.85, -0.26, 0.34, 1.9, 0.26);
    P(ctx, "roof", C.roof, 0.9);
    for (const s of [-1, 1]) { const A = [[s * 0.44, 1.86, -0.34], [s * 0.44, 1.86, 0.34], [0, 2.14, 0.34], [0, 2.14, -0.34]]; solid(ctx, A, A.map(([x, y, z]) => [x, y + 0.06, z])); }
    // candle and a small stone figure inside
    P(ctx, null, C.linen, 0.8); box(ctx, 0.1, 1.4, -0.08, 0.16, 1.52, -0.02);
    P(ctx, "stone", C.stone); if (lod <= 2) { lathe(ctx, [[0.07, 1.4], [0.06, 1.55], [0.04, 1.62], [0, 1.7]], 6, -0.08, 0); }
    glow(ctx); gem(ctx, 0.13, 1.54, -0.05, 0.025, 0.06, 0.01, 4);
    // lantern arm and lantern
    P(ctx, null, C.iron, 0.5, 0.6);
    beam(ctx, [0.1, 1.2, 0], [0.62, 1.2, 0], 0.05); if (lod <= 2) beam(ctx, [0.1, 0.95, 0], [0.45, 1.2, 0], 0.035);
    beam(ctx, [0.58, 1.2, 0], [0.58, 1.1, 0], 0.02);
    prism(ctx, ngon(4, 0.12, 0.58, 0, Math.PI / 4), 1.04, 1.1, 0.4);
    prism(ctx, ngon(4, 0.1, 0.58, 0, Math.PI / 4), 0.8, 0.84);
    glow(ctx); prism(ctx, ngon(4, 0.08, 0.58, 0, Math.PI / 4), 0.84, 1.04);
    if (lod <= 2) { P(ctx, null, C.iron, 0.5, 0.6); for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) box(ctx, 0.58 + x * 0.06 - 0.01, 0.84, z * 0.06 - 0.01, 0.58 + x * 0.06 + 0.01, 1.04, z * 0.06 + 0.01); }
    // offerings
    if (lod <= 2) { P(ctx, null, C.terra, 0.9); lathe(ctx, [[0.06, 0.26], [0.09, 0.4], [0.1, 0.41]], 6, -0.25, -0.15); P(ctx, "stone", C.stone); gem(ctx, 0.25, 0.28, -0.18, 0.06, 0.05, 0.02, 5); }
    flowers(ctx, lod, [[-0.35, -0.2, 1.3], [0.4, 0.3, 1], [-0.62, 0.15, 1]]);
  },
  lamps(ctx, lod) {
    // a run of tall oak lampposts, local points in params.posts [[x,y,z]], arm toward −Z (the road), basket + lantern
    for (const [x, y, z] of ctx.params.posts || [[0, 0, 0]]) {
      P(ctx, "stone", C.stone, 0.92); box(ctx, x - 0.2, y, z - 0.2, x + 0.2, y + 0.2, z + 0.2);
      P(ctx, "walnut", C.walnut); box(ctx, x - 0.08, y + 0.2, z - 0.08, x + 0.08, y + 3.4, z + 0.08); postCap(ctx, x, z, y + 3.4, 0.16);
      beam(ctx, [x, y + 3.15, z], [x, y + 3.15, z - 0.8], 0.07);
      if (lod <= 2) beam(ctx, [x, y + 2.7, z - 0.05], [x, y + 3.12, z - 0.5], 0.05);
      P(ctx, null, C.iron, 0.5, 0.6); beam(ctx, [x, y + 3.12, z - 0.7], [x, y + 2.9, z - 0.7], 0.02);
      prism(ctx, ngon(4, 0.13, x, z - 0.7, Math.PI / 4), y + 2.84, y + 2.9, 0.4);
      glow(ctx); prism(ctx, ngon(4, 0.09, x, z - 0.7, Math.PI / 4), y + 2.6, y + 2.84);
      if (lod <= 3) { P(ctx, null, C.iron, 0.5, 0.6); prism(ctx, ngon(4, 0.11, x, z - 0.7, Math.PI / 4), y + 2.56, y + 2.6); }
      if (lod <= 3) { // flower basket hung from the post side
        P(ctx, "straw", C.straw, 1); lathe(ctx, [[0.08, y + 2.05], [0.2, y + 2.2], [0.24, y + 2.3]], lod <= 2 ? 8 : 5, x + 0.3, z);
        P(ctx, null, C.leaf, 0.95); blob(ctx, x + 0.3, y + 2.26, z, 0.26, 0.2, 0.26, 5);
        if (lod <= 2) { P(ctx, null, C.petal, 0.8); gem(ctx, x + 0.2, y + 2.44, z - 0.12, 0.06, 0.04, 0.03, 4); gem(ctx, x + 0.42, y + 2.42, z + 0.05, 0.06, 0.04, 0.03, 4);
          P(ctx, null, C.sun, 0.8); gem(ctx, x + 0.3, y + 2.47, z + 0.14, 0.05, 0.04, 0.03, 4);
          P(ctx, null, C.iron); beam(ctx, [x + 0.08, y + 2.7, z], [x + 0.3, y + 2.3, z], 0.015); } }
    }
  },
};
export function geometry(ctx) { ctx.flat(); (B[ctx.params.kind] || B.milestone)(ctx, ctx.lod); ctx.emissive(null); }
export function collider(ctx) {
  const k = ctx.params.kind;
  if (k === "hitch") { box(ctx, -1.3, 0, -0.1, 1.3, 1.1, 0.1); box(ctx, -0.8, 0, 0.35, 0.8, 0.46, 0.85); box(ctx, 1.4, 0, 0.1, 2.3, 0.45, 0.6); return; }
  if (k === "supplies") { box(ctx, -1.35, 0, -0.35, 1.15, 0.9, 0.45); box(ctx, -1.0, 0.9, -0.25, -0.2, 1.32, 0.4); return; }
  if (k === "shelter") { box(ctx, -1.75, 0, -1, 1.75, 0.12, 1); for (const x of [-1.45, 1.45]) for (const z of [-0.72, 0.72]) box(ctx, x - 0.07, 0.12, z - 0.07, x + 0.07, 2.15, z + 0.07); box(ctx, -1.2, 0.12, 0.12, 1.2, 0.52, 0.55); return; }
  if (k === "shrine") { box(ctx, -0.55, 0, -0.4, 0.55, 0.26, 0.4); box(ctx, -0.34, 0.26, -0.26, 0.34, 2.1, 0.26); return; }
  if (k === "lamps") { for (const [x, y, z] of ctx.params.posts || [[0, 0, 0]]) box(ctx, x - 0.2, y, z - 0.2, x + 0.2, y + 3.4, z + 0.2); return; }
  box(ctx, -0.46, 0, -0.16, 0.46, 1.17, 0.36);
}
