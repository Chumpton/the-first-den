// A flat forest floor, endless, cut by winding rivers: each river is the zero line of a slow warped noise field,
// so they meander forever with no point list. Ground sits at 0.5 m; the water (a sea mark at 0) fills the channels.
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
export const GROUND = 0.5;
// Places the rivers bend away from (dry, level ground): home and the two far cities. r = dry radius, f = fade.
export const SITES = [
  { id: "home", x: 0, z: -30, r: 70, f: 60 },
  { id: "lumenvale", x: 1100, z: -250, r: 190, f: 80 },
  { id: "hearthmere", x: -1000, z: -500, r: 190, f: 80 },
];
// The home lake: a round bowl filled by the water level at 0.
export const LAKE = { x: 4, z: -76, r: 26, depth: 2.6 };
function riverT(ctx) {
  const { x, z, noise, seedOffset } = ctx;
  const a = noise.domainWarp2({ x: x + 900, z: z - 400, warpAmp: 60, warpFrequency: 1 / 300, frequency: 1 / 700, octaves: 2, seed: seedOffset(11) });
  const b = noise.domainWarp2({ x: x - 1300, z: z + 700, warpAmp: 80, warpFrequency: 1 / 350, frequency: 1 / 1100, octaves: 2, seed: seedOffset(12) });
  // band half-widths in noise units: the main river wider than its tributary
  return Math.min(Math.abs(a) / 0.045, Math.abs(b) / 0.03);
}
export function heightAt(ctx) {
  const { x, z, noise, seedOffset } = ctx;
  const roll = noise.fbm2({ x, z, frequency: 1 / 90, octaves: 3, seed: seedOffset(1) }) * 0.35;
  let dry = 0;
  for (const S of SITES) dry = Math.max(dry, 1 - smooth(S.r, S.r + S.f, Math.hypot(x - S.x, z - S.z)));
  const t = riverT(ctx) + dry * 10;
  const land = GROUND + roll * smooth(1.2, 2.2, t);
  const s = smooth(0.3, 1.25, t);
  const h = -1.7 * (1 - s) + land * s;
  const ld = Math.hypot(x - LAKE.x, z - LAKE.z), ls = smooth(LAKE.r * 0.45, LAKE.r * 1.05, ld);
  return Math.min(h, -LAKE.depth * (1 - ls) + h * ls);
}
export function materialAt(ctx) {
  const { x, z, noise, seedOffset, worldHeight } = ctx;
  const n = noise.fbm2({ x, z, frequency: 1 / 25, octaves: 3, seed: seedOffset(5) });
  if (worldHeight < -0.2) return { pebbles: 1 };
  if (worldHeight < 0.28 + n * 0.1) return { mud: 1 };
  // the greenbelt between the den and the market town wears moss-and-grass, not bare leaf litter
  const belt = (1 - smooth(70, 84, Math.abs(x))) * smooth(14, 22, z) * (1 - smooth(84, 96, z));
  const moss = clamp01(0.5 + n * 1.6 + belt * 0.45);
  return { litter: 1 - moss, moss };
}
