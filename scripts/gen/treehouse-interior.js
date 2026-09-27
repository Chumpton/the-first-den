// The furnishings inside a treehouse hut, one row per room. Feet on the hut floor at the trunk's centre.
// params: style "office" | "hippie", door (radians, the hut's doorway side, local angle atan2(z, x)), hutR (the hut's outer radius).
// Furniture hugs the walls: wall k sits at angle door + 60°·k (k 0 = the doorway, 2 and 4 have windows); a piece is drawn in its
// wall's frame — a = metres along the wall (left −, right + seen from inside), b = metres in from the wall face, y up.
import { solid, prism, ngon, gem } from "../lib/road-solid.js";
const OAK = "cdn/texture-weathered-honey-oak-deck-planks.png";
function frame(c) {
  const door = c.params.door ?? 0, ap = ((c.params.hutR ?? 4.2) - 0.16) * Math.cos(Math.PI / 6);
  const at = (k, a, b) => { const th = door + (k * Math.PI) / 3, ux = Math.cos(th), uz = Math.sin(th); return [ux * (ap - b) - uz * a, uz * (ap - b) + ux * a]; };
  const ob = (k, a0, a1, b0, b1, y0, y1) => { const q = [at(k, a0, b0), at(k, a1, b0), at(k, a1, b1), at(k, a0, b1)]; solid(c, q.map(([x, z]) => [x, y0, z]), q.map(([x, z]) => [x, y1, z])); };
  return { at, ob, ap };
}
const mat = (c, col, rough = 0.85, tex = null) => { c.albedo(tex); c.color(col); c.roughness(rough); c.emissive(null); };
const glow = (c, col, r, g, b) => { c.albedo(null); c.color(col); c.roughness(0.4); c.emissive(r, g, b); };
function legs(ob, k, a0, a1, b0, b1, y, w = 0.05) { for (const a of [a0, a1 - w]) for (const b of [b0, b1 - w]) ob(k, a, a + w, b, b + w, 0, y); }
function books(c, ob, k, a0, a1, b0, b1, y, seed) {
  const cols = ["oklch(0.45 0.12 25)", "oklch(0.5 0.09 150)", "oklch(0.42 0.08 250)", "oklch(0.7 0.1 85)", "oklch(0.35 0.05 50)", "oklch(0.55 0.12 320)"];
  let a = a0, i = seed;
  while (a < a1 - 0.05) { const w = 0.04 + ((i * 37) % 5) * 0.012, h = 0.22 + ((i * 53) % 4) * 0.04; if ((i * 7) % 11 === 0) { a += 0.12; i++; continue; }
    mat(c, cols[i % cols.length], 0.8); ob(k, a, Math.min(a1, a + w), b0, b0 + (b1 - b0) * (0.75 + ((i * 3) % 3) * 0.1), y, y + h); a += w + 0.006; i++; }
}
function plant(c, at, k, a, b, y, h) {
  const [x, z] = at(k, a, b);
  mat(c, "oklch(0.58 0.12 40)", 0.9); prism(c, ngon(7, 0.16, x, z), y, y + 0.28, 1.2);
  mat(c, "oklch(0.55 0.14 140)", 0.95); for (let i = 0; i < 5; i++) { const t = i * 1.26; gem(c, x + Math.cos(t) * 0.1, y + 0.3 + h * 0.4 + (i % 2) * 0.12, z + Math.sin(t) * 0.1, 0.13 + h * 0.08, h * 0.35, 0.08, 5); }
}
function office(c) {
  const { at, ob } = frame(c);
  // rug round the trunk
  mat(c, "oklch(0.52 0.08 30)", 1); prism(c, ngon(6, 2.5, 0, 0, (c.params.door ?? 0) + Math.PI / 6), 0.005, 0.02);
  mat(c, "oklch(0.78 0.05 80)", 1); prism(c, ngon(6, 2.2, 0, 0, (c.params.door ?? 0) + Math.PI / 6), 0.02, 0.028);
  mat(c, "oklch(0.45 0.07 250)", 1); prism(c, ngon(6, 1.9, 0, 0, (c.params.door ?? 0) + Math.PI / 6), 0.028, 0.034);
  // wall 3 (facing the door): the walnut desk, a green-shaded lamp, papers, a slate screen, the chair
  mat(c, "oklch(0.42 0.06 50)", 0.6, OAK); ob(3, -1.1, 1.1, 0, 0.75, 0.72, 0.78);
  legs(ob, 3, -1.08, 1.08, 0.03, 0.72, 0.72, 0.06); ob(3, 0.45, 1.05, 0.05, 0.7, 0.1, 0.72); // drawer tower
  mat(c, "oklch(0.36 0.05 50)", 0.6); for (const y of [0.3, 0.52]) ob(3, 0.5, 1.0, 0.7, 0.72, y - 0.08, y + 0.08);
  mat(c, "oklch(0.8 0.1 85)", 0.3); for (const y of [0.3, 0.52]) ob(3, 0.7, 0.8, 0.72, 0.74, y - 0.01, y + 0.01);
  mat(c, "oklch(0.25 0.01 250)", 0.4); ob(3, -0.45, 0.25, 0.08, 0.12, 0.95, 1.36); ob(3, -0.14, -0.06, 0.12, 0.22, 0.78, 0.95); ob(3, -0.3, 0.1, 0.1, 0.3, 0.78, 0.8);
  glow(c, "oklch(0.8 0.06 220)", 0.35, 0.55, 0.7); ob(3, -0.42, 0.22, 0.12, 0.125, 0.98, 1.33);
  mat(c, "oklch(0.2 0.01 250)", 0.5); ob(3, -0.35, 0.15, 0.35, 0.5, 0.78, 0.8); // keyboard
  mat(c, "oklch(0.96 0.01 90)", 0.9); ob(3, 0.35, 0.65, 0.3, 0.52, 0.78, 0.8); ob(3, 0.38, 0.66, 0.32, 0.54, 0.8, 0.81);
  mat(c, "oklch(0.7 0.1 70)", 0.5); { const [x, z] = at(3, -0.85, 0.25); prism(c, ngon(8, 0.08, x, z), 0.78, 0.82); prism(c, ngon(6, 0.015, x, z), 0.82, 1.15); }
  { const [x, z] = at(3, -0.85, 0.3); mat(c, "oklch(0.45 0.12 150)", 0.4); prism(c, ngon(8, 0.16, x, z), 1.12, 1.24, 0.5); glow(c, "oklch(0.95 0.08 90)", 2.2, 1.7, 0.8); prism(c, ngon(8, 0.1, x, z), 1.1, 1.12); }
  { const [x, z] = at(3, 0.95, 0.2); mat(c, "oklch(0.9 0.02 90)", 0.6); prism(c, ngon(8, 0.045, x, z), 0.78, 0.88); mat(c, "oklch(0.35 0.05 50)", 0.8); prism(c, ngon(8, 0.038, x, z), 0.86, 0.875); }
  // the chair: a walnut seat and back on a pedestal, pulled up to the desk
  mat(c, "oklch(0.4 0.06 50)", 0.6); { const [x, z] = at(3, -0.1, 1.05); prism(c, ngon(5, 0.3, x, z), 0.02, 0.06); prism(c, ngon(6, 0.035, x, z), 0.06, 0.44); }
  mat(c, "oklch(0.45 0.1 30)", 0.9); ob(3, -0.35, 0.15, 0.82, 1.3, 0.44, 0.52); ob(3, -0.33, 0.13, 1.3, 1.36, 0.5, 1.0);
  // walls 1 and 5: tall bookshelves full of books, a plant on top
  for (const k of [1, 5]) {
    mat(c, "oklch(0.44 0.06 55)", 0.7, OAK); ob(k, -1.2, -1.15, 0, 0.4, 0, 2.1); ob(k, 1.15, 1.2, 0, 0.4, 0, 2.1); ob(k, -1.2, 1.2, 0, 0.03, 0, 2.1);
    for (const y of [0.05, 0.55, 1.05, 1.55, 2.05]) ob(k, -1.15, 1.15, 0.03, 0.4, y, y + 0.04);
    for (const [i, y] of [0.09, 0.59, 1.09, 1.59].entries()) books(c, ob, k, -1.13, 1.13, 0.04, 0.36, y, k * 17 + i * 5);
    plant(c, at, k, 0.8, 0.2, 2.09, 0.6);
  }
  // wall 2 under its window: a low cabinet with a globe; wall 4 under its window: a reading armchair and side table
  mat(c, "oklch(0.46 0.06 55)", 0.7, OAK); ob(2, -1.0, 1.0, 0, 0.5, 0, 0.8); mat(c, "oklch(0.36 0.05 50)", 0.7); ob(2, -0.02, 0.02, 0.5, 0.51, 0.05, 0.75);
  { const [x, z] = at(2, -0.55, 0.25); mat(c, "oklch(0.7 0.1 70)", 0.4); prism(c, ngon(6, 0.06, x, z), 0.8, 0.88); mat(c, "oklch(0.6 0.1 220)", 0.6); gem(c, x, 1.02, z, 0.15, 0.15, 0.14, 8); mat(c, "oklch(0.6 0.12 140)", 0.6); gem(c, x + 0.02, 1.06, z, 0.1, 0.08, 0.05, 6); }
  plant(c, at, 2, 0.6, 0.25, 0.8, 0.5);
  mat(c, "oklch(0.55 0.1 45)", 0.95); ob(4, -1.0, 0.1, 0.05, 0.95, 0.15, 0.45); ob(4, -1.0, 0.1, 0.05, 0.28, 0.45, 1.05); ob(4, -1.0, -0.82, 0.05, 0.95, 0.45, 0.72); ob(4, -0.08, 0.1, 0.05, 0.95, 0.45, 0.72);
  mat(c, "oklch(0.35 0.04 50)", 0.7); legs(ob, 4, -0.98, 0.08, 0.1, 0.9, 0.15, 0.05);
  mat(c, "oklch(0.44 0.06 55)", 0.7, OAK); { const [x, z] = at(4, 0.8, 0.4); prism(c, ngon(8, 0.28, x, z), 0.55, 0.6); prism(c, ngon(6, 0.04, x, z), 0, 0.55); prism(c, ngon(8, 0.18, x, z), 0, 0.03); }
  { const [x, z] = at(4, 0.8, 0.4); mat(c, "oklch(0.95 0.02 90)", 0.4); prism(c, ngon(8, 0.05, x, z), 0.6, 0.7); mat(c, "oklch(0.45 0.1 30)", 0.8); ob(4, 0.6, 0.85, 0.3, 0.5, 0.6, 0.65); }
  // wall 0 beside the doorway: a coat peg board
  mat(c, "oklch(0.44 0.06 55)", 0.7, OAK); ob(0, 1.25, 1.85, 0, 0.04, 1.5, 1.62);
  mat(c, "oklch(0.3 0.02 50)", 0.8); for (const a of [1.35, 1.55, 1.75]) ob(0, a, a + 0.04, 0.04, 0.14, 1.52, 1.56);
  mat(c, "oklch(0.5 0.1 60)", 0.9); ob(0, 1.5, 1.62, 0.1, 0.18, 0.9, 1.5); // a satchel on its peg
}
function hippie(c) {
  const { at, ob } = frame(c), d = c.params.door ?? 0;
  // the rug: concentric rings in sunset colours round the trunk
  const rings = [["oklch(0.62 0.16 40)", 2.6], ["oklch(0.8 0.14 85)", 2.25], ["oklch(0.55 0.15 330)", 1.9], ["oklch(0.6 0.1 190)", 1.55], ["oklch(0.75 0.15 60)", 1.2]];
  rings.forEach(([col, r], i) => { mat(c, col, 1); prism(c, ngon(14, r), 0.005 + i * 0.004, 0.009 + i * 0.004); });
  // wall 3: a low platform bed, patchwork quilt, big pillows; the tapestry hangs above it (its own row)
  mat(c, "oklch(0.5 0.06 55)", 0.8, OAK); ob(3, -1.25, 1.25, 0, 1.6, 0, 0.22);
  mat(c, "oklch(0.93 0.02 90)", 0.9); ob(3, -1.2, 1.2, 0.03, 1.57, 0.22, 0.4);
  const quilt = ["oklch(0.6 0.16 30)", "oklch(0.78 0.14 90)", "oklch(0.55 0.13 330)", "oklch(0.62 0.1 180)", "oklch(0.7 0.14 55)", "oklch(0.5 0.12 280)", "oklch(0.72 0.12 140)"];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { mat(c, quilt[(i * 3 + j * 5) % quilt.length], 1); ob(3, -1.22 + i * 0.407, -1.22 + (i + 1) * 0.407, 0.55 + j * 0.35, 0.55 + (j + 1) * 0.35, 0.4, 0.46); }
  mat(c, "oklch(0.8 0.1 60)", 1); ob(3, -1.0, -0.15, 0.08, 0.45, 0.4, 0.62); mat(c, "oklch(0.58 0.14 330)", 1); ob(3, 0.15, 1.0, 0.08, 0.45, 0.4, 0.62);
  // string lights along the ceiling of every wall, many colours
  const bulbs = [[2.4, 0.6, 0.2], [0.6, 2.2, 0.6], [2.2, 0.5, 1.8], [0.5, 1.4, 2.4], [2.5, 1.8, 0.3]];
  for (let k = 0; k < 6; k++) for (let s = 0; s < 7; s++) { const a = -1.7 + s * 0.57, [x, z] = at(k, a, 0.08), y = 2.72 - Math.sin((s / 6) * Math.PI) * 0.18, b = bulbs[(k * 7 + s) % 5];
    glow(c, "oklch(0.9 0.1 80)", b[0], b[1], b[2]); gem(c, x, y, z, 0.045, 0.05, 0.07, 5); }
  // wall 2 under its window: two bean bags and a lava lamp on a crate
  for (const [a, col] of [[-0.7, "oklch(0.6 0.16 30)"], [0.35, "oklch(0.55 0.13 200)"]]) { const [x, z] = at(2, a, 0.6); mat(c, col, 1); gem(c, x, 0.28, z, 0.48, 0.3, 0.28, 9); gem(c, x, 0.45, z, 0.32, 0.15, 0.05, 7); }
  mat(c, "oklch(0.55 0.07 60)", 0.9, OAK); ob(2, 0.95, 1.5, 0.05, 0.55, 0, 0.45);
  { const [x, z] = at(2, 1.22, 0.3); mat(c, "oklch(0.7 0.1 70)", 0.3); prism(c, ngon(8, 0.09, x, z), 0.45, 0.58, 0.6); glow(c, "oklch(0.7 0.2 350)", 2.4, 0.4, 1.4); prism(c, ngon(8, 0.07, x, z), 0.58, 0.95, 0.5); glow(c, "oklch(0.8 0.18 60)", 2.6, 1.3, 0.2); gem(c, x, 0.72, z, 0.05, 0.05, 0.05, 6); gem(c, x, 0.86, z, 0.035, 0.03, 0.03, 6); mat(c, "oklch(0.7 0.1 70)", 0.3); prism(c, ngon(8, 0.04, x, z), 0.95, 1.0, 0.5); }
  // wall 4 under its window: a crate shelf of plants, macramé hangers from the ceiling
  mat(c, "oklch(0.55 0.07 60)", 0.9, OAK); ob(4, -1.3, 1.3, 0, 0.45, 0, 0.5); ob(4, -1.3, 1.3, 0, 0.45, 0.02, 0.06);
  for (const a of [-0.9, -0.1, 0.8]) plant(c, at, 4, a, 0.22, 0.5, 0.55 + ((a * 10) % 3) * 0.1);
  for (const a of [-1.5, 1.5]) { const [x, z] = at(4, a, 0.35); mat(c, "oklch(0.88 0.04 85)", 1); prism(c, ngon(4, 0.012, x, z), 1.6, 3.0); for (let r = 0; r < 4; r++) prism(c, ngon(6, 0.1 + r * 0.03, x, z), 1.7 + r * 0.08, 1.73 + r * 0.08); plant(c, at, 4, a, 0.35, 1.38, 0.45); }
  // wall 1: a low painted dresser with a record player, records leaning, incense
  mat(c, "oklch(0.62 0.1 190)", 0.8); ob(1, -1.1, 1.1, 0, 0.5, 0, 0.7); mat(c, "oklch(0.78 0.14 85)", 0.7); for (const y of [0.18, 0.46]) for (const a of [-0.55, 0.55]) ob(1, a - 0.45, a + 0.45, 0.5, 0.52, y - 0.1, y + 0.1);
  mat(c, "oklch(0.4 0.05 50)", 0.6, OAK); ob(1, -0.8, -0.1, 0.05, 0.45, 0.7, 0.82); mat(c, "oklch(0.15 0.01 0)", 0.3); { const [x, z] = at(1, -0.45, 0.25); prism(c, ngon(16, 0.16, x, z), 0.82, 0.835); mat(c, "oklch(0.6 0.16 30)", 0.6); prism(c, ngon(10, 0.05, x, z), 0.835, 0.84); }
  for (const [i, col] of ["oklch(0.6 0.16 330)", "oklch(0.7 0.14 140)", "oklch(0.75 0.15 60)"].entries()) { mat(c, col, 0.9); ob(1, 0.2 + i * 0.03, 0.23 + i * 0.03, 0.05, 0.35, 0.7, 1.02); }
  { const [x, z] = at(1, 0.85, 0.25); mat(c, "oklch(0.5 0.1 40)", 0.8); prism(c, ngon(6, 0.05, x, z), 0.7, 0.75); mat(c, "oklch(0.3 0.03 40)", 0.8); prism(c, ngon(4, 0.006, x, z), 0.75, 0.98); glow(c, "oklch(0.8 0.18 40)", 3, 0.8, 0.1); gem(c, x, 0.985, z, 0.01, 0.01, 0.01, 4); }
  // wall 5: floor cushions round a low round table with a tea set
  { const [x, z] = at(5, 0, 0.9); mat(c, "oklch(0.5 0.06 55)", 0.8, OAK); prism(c, ngon(12, 0.5, x, z), 0.28, 0.33); prism(c, ngon(6, 0.08, x, z), 0, 0.28);
    mat(c, "oklch(0.9 0.03 80)", 0.4); prism(c, ngon(8, 0.09, x + 0.1, z), 0.33, 0.48, 0.8); for (const t of [2.1, 3.6, 5.2]) prism(c, ngon(8, 0.04, x + Math.cos(t) * 0.28, z + Math.sin(t) * 0.28), 0.33, 0.4); }
  for (const [a, b, col] of [[-1.1, 0.5, "oklch(0.55 0.15 330)"], [1.1, 0.5, "oklch(0.78 0.14 85)"], [0, 0.15, "oklch(0.6 0.12 180)"]]) { const [x, z] = at(5, a, b + 0.3); mat(c, col, 1); prism(c, ngon(4, 0.38, x, z, d + Math.PI / 4), 0.005, 0.16, 0.85); }
  // a hanging bead curtain frame beside the door and a peace-sign wind chime by the window
  for (let i = 0; i < 9; i++) { const a = 1.2 + i * 0.07, col = quilt[i % quilt.length]; mat(c, col, 0.4); for (let s = 0; s < 10; s++) { const [x, z] = at(0, a, 0.06); gem(c, x, 2.6 - s * 0.2, z, 0.02, 0.02, 0.02, 4); } }
}
export function geometry(c) { c.flat(); if (c.params.style === "hippie") hippie(c); else office(c); }
export function collider(c) {
  const { ob } = frame(c);
  if (c.params.style === "hippie") { ob(3, -1.25, 1.25, 0, 1.6, 0, 0.45); ob(1, -1.1, 1.1, 0, 0.5, 0, 0.8); ob(4, -1.3, 1.3, 0, 0.45, 0, 0.5); ob(2, 0.95, 1.5, 0.05, 0.55, 0, 0.45); return; }
  ob(3, -1.1, 1.1, 0, 0.75, 0, 0.78); ob(1, -1.2, 1.2, 0, 0.4, 0, 2.1); ob(5, -1.2, 1.2, 0, 0.4, 0, 2.1); ob(2, -1.0, 1.0, 0, 0.5, 0, 0.8); ob(4, -1.0, 0.1, 0.05, 0.95, 0, 0.72);
}
