// A great oak carrying a treehouse: flared trunk, a hex walkway deck at params.deckY with a railing (gaps at
// params.gaps, radians, local angle atan2(z, x)), a little hex hut around the trunk with its door at params.door,
// crooked branches and a layered crown above. Feet at the trunk's base; the rope and bridge are their own rows.
import { Q, solid, prism, box, ngon, gem } from "../lib/road-solid.js";
import { softened } from "./soften.js";
const BARK = "cdn/texture-rough-oak-bark-cozy.png", OAK = "cdn/texture-weathered-honey-oak-deck-planks.png",
  SHINGLE = "cdn/texture-mossy-wooden-shingles-cozy.png", MOSS = "cdn/texture-soft-green-moss-cozy.png";
const bark = (c) => { c.albedo(BARK); c.color("oklch(0.72 0.04 60)"); c.roughness(0.95); c.emissive(null); };
const oak = (c, l = 0.88) => { c.albedo(OAK); c.color(`oklch(${l} 0.05 70)`); c.roughness(0.85); c.emissive(null); };
const leaf = (c, h) => { c.albedo(MOSS); c.color(`oklch(0.62 0.13 ${h})`); c.roughness(1); c.emissive(null); };
const P = (c) => ({ D: c.params.deckY ?? 7, R: c.params.deckR ?? 3.6, hutR: c.params.hutR ?? 2.1, gaps: c.params.gaps ?? [], door: c.params.door ?? 0, seed: c.params.seed ?? 1 });
const inGap = (a, gaps, w) => gaps.some((g) => Math.abs(Math.atan2(Math.sin(a - g), Math.cos(a - g))) < w);
function rnd(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
function trunk(c, D, lod) {
  bark(c); const n = lod <= 2 ? 10 : 7;
  prism(c, ngon(n, 1.35), -0.3, 0.6, 0.6); prism(c, ngon(n, 0.8), 0.6, D * 0.5, 0.85);
  prism(c, ngon(n, 0.68), D * 0.5, D + 3.5, 0.72); prism(c, ngon(n, 0.49), D + 3.5, D + 9.5, 0.4);
  if (lod <= 3) for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.3, x = Math.cos(a), z = Math.sin(a); // roots
    solid(c, ngon(4, 0.35, x * 0.7, z * 0.7).map(([u, v]) => [u, 0.7, v]), ngon(4, 0.12, x * 2.1, z * 2.1).map(([u, v]) => [u, -0.15, v])); }
}
function branch(c, a, y0, len, rise, r) {
  const x = Math.cos(a), z = Math.sin(a);
  solid(c, ngon(5, r, x * 0.3, z * 0.3).map(([u, v]) => [u, y0, v]), ngon(5, r * 0.45, x * len, z * len).map(([u, v]) => [u, y0 + rise, v]));
  return [x * len, y0 + rise, z * len];
}
function blob(c, x, y, z, r, h) { leaf(c, h); gem(c, x, y, z, r, r * 0.8, r * 0.55, 7); gem(c, x + r * 0.2, y + r * 0.25, z - r * 0.15, r * 0.75, r * 0.7, r * 0.3, 6); }
function crown(c, D, seed, lod) {
  const R = rnd(seed); bark(c);
  const tips = [];
  for (let i = 0; i < 6; i++) tips.push(branch(c, i * 1.05 + R() * 0.4, D + 4.9 + R() * 2.2, 3.2 + R() * 1.6, 1.8 + R() * 1.4, 0.26));
  blob(c, 0, D + 10.5, 0, 4.8, 138);
  for (const [i, t] of tips.entries()) if (lod <= 4 || i % 2 === 0) blob(c, t[0], t[1] + 0.8, t[2], 2.4 + R() * 0.8, 125 + R() * 25);
}
function deck(c, D, R, gaps, lod) {
  oak(c); prism(c, ngon(6, R, 0, 0, Math.PI / 6), D - 0.18, D, 1);
  oak(c, 0.7); prism(c, ngon(6, R + 0.08, 0, 0, Math.PI / 6), D - 0.34, D - 0.18, 1);
  bark(c); // braces down to the trunk
  for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3, x = Math.cos(a) * (R - 0.4), z = Math.sin(a) * (R - 0.4);
    solid(c, ngon(4, 0.1, x, z).map(([u, v]) => [u, D - 0.3, v]), ngon(4, 0.1, x * 0.15, z * 0.15).map(([u, v]) => [u, D - 2.6, v])); }
  oak(c, 0.8); const C = ngon(6, R - 0.1, 0, 0, Math.PI / 6);
  for (let i = 0; i < 6; i++) { const a = C[i], b = C[(i + 1) % 6];
    for (let k = 0; k < 4; k++) { const t0 = k / 4, t1 = (k + 1) / 4, mx = a[0] + (b[0] - a[0]) * (t0 + t1) / 2, mz = a[1] + (b[1] - a[1]) * (t0 + t1) / 2;
      const ang = Math.atan2(mz, mx); if (inGap(ang, gaps, 0.26)) continue;
      const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
      prism(c, ngon(4, 0.06, p0[0], p0[1]), D, D + 1.0);
      const rail = [[p0[0], p0[1]], [p1[0], p1[1]], [p1[0] * 0.98, p1[1] * 0.98], [p0[0] * 0.98, p0[1] * 0.98]];
      solid(c, rail.map(([u, v]) => [u, D + 0.9, v]), rail.map(([u, v]) => [u, D + 1.02, v]));
      if (lod <= 2) solid(c, rail.map(([u, v]) => [u, D + 0.45, v]), rail.map(([u, v]) => [u, D + 0.53, v]));
    } }
}
// the hut: a hex room round the trunk, rotated so side 0 faces params.door (the doorway), windows on sides 2 and 4
function hut(c, D, door, lod, solidOnly, r) {
  const t = 0.16, WH = 3.0, rot = door - Math.PI / 6, C = ngon(6, r, 0, 0, rot), I = ngon(6, r - t, 0, 0, rot);
  for (let i = 0; i < 6; i++) { const j = (i + 1) % 6;
    const seg = (t0, t1, y0, y1) => { const L = (A, u) => [A[i][0] + (A[j][0] - A[i][0]) * u, A[i][1] + (A[j][1] - A[i][1]) * u];
      const lp = [L(I, t0), L(I, t1), L(C, t1), L(C, t0)]; solid(c, lp.map(([u, v]) => [u, y0, v]), lp.map(([u, v]) => [u, y1, v])); };
    if (!solidOnly) oak(c, i % 2 ? 0.82 : 0.76);
    if (i === 0) { seg(0, 0.3, D, D + WH); seg(0.7, 1, D, D + WH); seg(0.3, 0.7, D + 2.4, D + WH);
      if (!solidOnly) { oak(c, 0.6); seg(0.27, 0.3, D, D + 2.45); seg(0.7, 0.73, D, D + 2.45); seg(0.27, 0.73, D + 2.4, D + 2.5); } }
    else if (!solidOnly && lod <= 3 && (i === 2 || i === 4)) { seg(0, 0.25, D, D + WH); seg(0.75, 1, D, D + WH); seg(0.25, 0.75, D, D + 1.0); seg(0.25, 0.75, D + 2.1, D + WH);
      c.albedo(null); c.color("oklch(0.88 0.04 220)"); c.roughness(0.2); c.emissive(0.25, 0.3, 0.35); seg(0.26, 0.74, D + 1.0, D + 2.1); c.emissive(null);
      oak(c, 0.55); seg(0.23, 0.77, D + 0.95, D + 1.05); seg(0.49, 0.51, D + 1.0, D + 2.1); }
    else if (solidOnly && (i === 2 || i === 4)) { seg(0, 0.25, D, D + WH); seg(0.75, 1, D, D + WH); seg(0.25, 0.75, D, D + 1.0); seg(0.25, 0.75, D + 2.1, D + WH); }
    else seg(0, 1, D, D + WH);
  }
  if (solidOnly) { prism(c, ngon(6, r + 0.5, 0, 0, rot), D + WH, D + WH + 0.2); return; }
  // ceiling boards, then the shingled cap
  oak(c, 0.7); prism(c, ngon(6, r, 0, 0, rot), D + WH - 0.08, D + WH);
  c.albedo(SHINGLE); c.color("oklch(0.8 0.06 120)"); c.roughness(0.95);
  prism(c, ngon(6, r + 0.6, 0, 0, rot), D + WH, D + WH + 1.7, 0.25);
  c.albedo(MOSS); c.color("oklch(0.75 0.12 130)"); prism(c, ngon(6, r + 0.65, 0, 0, rot), D + WH - 0.05, D + WH + 0.06, 1);
  // lanterns either side of the door
  const ap = r * Math.cos(Math.PI / 6) + 0.12, dx = Math.cos(door) * ap, dz = Math.sin(door) * ap, px = -Math.sin(door), pz = Math.cos(door);
  c.albedo(null); c.color("oklch(0.92 0.1 80)");
  for (const s of [-1.15, 1.15]) { c.emissive(2.4, 1.6, 0.6); gem(c, dx + px * s, D + 2.1, dz + pz * s, 0.12, 0.2, 0.16, 6); c.emissive(null); }
}
export const geometry = softened(function geometry(c) {
  c.flat(); const { D, R, gaps, door, seed, hutR } = P(c), lod = c.lod;
  trunk(c, D, lod); deck(c, D, R, gaps, lod); hut(c, D, door, lod, false, hutR); crown(c, D, seed, lod);
});
export function collider(c) {
  const { D, R, gaps, door, hutR } = P(c);
  prism(c, ngon(8, 0.75), -0.3, D + 4);
  prism(c, ngon(6, R, 0, 0, Math.PI / 6), D - 0.34, D);
  hut(c, D, door, 5, true, hutR);
  // railing as a low wall, with the gaps left open
  const C = ngon(6, R - 0.1, 0, 0, Math.PI / 6);
  for (let i = 0; i < 6; i++) { const a = C[i], b = C[(i + 1) % 6];
    for (let k = 0; k < 4; k++) { const t0 = k / 4, t1 = (k + 1) / 4, mx = a[0] + (b[0] - a[0]) * (t0 + t1) / 2, mz = a[1] + (b[1] - a[1]) * (t0 + t1) / 2;
      if (inGap(Math.atan2(mz, mx), gaps, 0.26)) continue;
      const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
      const rail = [[p0[0], p0[1]], [p1[0], p1[1]], [p1[0] * 0.95, p1[1] * 0.95], [p0[0] * 0.95, p0[1] * 0.95]];
      solid(c, rail.map(([u, v]) => [u, D, v]), rail.map(([u, v]) => [u, D + 1.05, v])); } }
}
