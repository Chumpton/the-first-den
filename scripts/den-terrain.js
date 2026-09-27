import { shore } from "builtin/terrain";
import { clamp01, smoothstep } from "builtin/math";

// A few continuous fields, not a point/peak search in every terrain vertex.
// The exact house footprint and the exterior lane's graded path stay authored marks.
export const VALLEY = {
  sea: 0, floor: -25, ledge: 23.55, shoreStart: 14, approachGrade: 0.405,
  width: 225, farShore: 336,
  islandA: { x: -66, z: -203, width: 22, depth: 17, crown: 37, bed: -25 },
  islandB: { x: 86, z: -286, width: 29, depth: 20, crown: 40, bed: -25 }
};

export function heightAt(ctx) {
  const { x, z, noise, seedOffset } = ctx;
  const q = -z;
  const broad = noise.fbm2({ x, z, frequency: 1 / 216, octaves: 2, seed: seedOffset(11) });
  const grain = noise.fbm2({ x, z, frequency: 1 / 79, octaves: 2, seed: seedOffset(12) });
  const away = smoothstep(24, 115, Math.hypot(x - 4, z));
  const viewHollow = 2.9 * smoothstep(17, 28, q) * (1 - smoothstep(43, 64, q)) * Math.exp(-Math.pow(x / 67, 2));
  const south = VALLEY.ledge - VALLEY.approachGrade * Math.max(0, q - VALLEY.shoreStart)
    + broad * (3 + 7 * away) + grain * 0.85 - viewHollow
    + smoothstep(18, 180, z) * (17 + 13 * broad);

  const centre = 14 * Math.sin(q * 0.010) - 7;
  const width = VALLEY.width + 17 * Math.sin(q * 0.013 + 0.8) + broad * 10;
  const sideDistance = Math.abs(x - centre) - width;
  const bankDistance = q - (VALLEY.farShore + 23 * Math.sin(x * 0.010 + 0.3) + broad * 15);
  // Wide smooth ridge masses. Their crests, saddles and lateral lobes are deliberately offset.
  const mountainNoise = (q > 315 || sideDistance > 55)
    ? noise.fbm2({ x, z, frequency: 1 / 307, octaves: 2, seed: seedOffset(16) }) : 0;
  const relief = 1 + mountainNoise * 0.13;
  const r1 = 112 * Math.exp(-Math.pow((q - (429 + 27 * Math.sin(x * 0.005 + 0.9))) / 60, 2))
    * (0.23 + 0.56 * smoothstep(48, 196, Math.abs(x + 24)))
    * (0.86 + 0.14 * Math.cos(x * 0.010 + 1.7)) * relief;
  const r2 = 194 * Math.exp(-Math.pow((q - (554 + 35 * Math.sin(x * 0.004 - 0.9))) / 73, 2))
    * (0.78 + 0.20 * Math.sin(x * 0.008 + 0.35)) * relief;
  const r3 = 205 * Math.exp(-Math.pow((q - (624 + 37 * Math.sin(x * 0.0034 + 0.7))) / 78, 2))
    * (0.82 + 0.16 * Math.cos(x * 0.0055 - 0.8)) * relief;
  const bank = -23 + (68 + 10 * smoothstep(52, 174, Math.abs(x + 24))) * smoothstep(-16, 58, bankDistance)
    + smoothstep(28, 94, bankDistance) * Math.max(r1, r2, r3)
    + grain * 3.2 * smoothstep(2, 45, bankDistance);
  const sides = -25 + 95 * smoothstep(-25, 128, sideDistance)
    + smoothstep(85, 245, sideDistance) * (75 + 20 * mountainNoise) + grain * 2;

  // Headlands sit off-axis. The broad water and its two low islands remain the central subject.
  const east = -25 + 82 * Math.exp(-Math.pow((x - 245) / 79, 2) - Math.pow((q - 248) / 91, 2));
  const west = -25 + 73 * Math.exp(-Math.pow((x + 265) / 87, 2) - Math.pow((q - 169) / 96, 2));
  const a = VALLEY.islandA, b = VALLEY.islandB;
  const islandA = a.bed + a.crown * Math.exp(-Math.pow((x - a.x) / a.width, 2) - Math.pow((z - a.z) / a.depth, 2));
  const islandB = b.bed + b.crown * Math.exp(-Math.pow((x - b.x) / b.width, 2) - Math.pow((z - b.z) / b.depth, 2));
  const raw = Math.max(VALLEY.floor + broad * 2.7 + grain * 0.65, south, bank, sides, east, west, islandA, islandB);
  const cliff = smoothstep(106, 177, Math.abs(x)) * smoothstep(152, 285, q);
  const beach = shore(raw, VALLEY.sea);
  return beach * (1 - cliff) + raw * cliff;
}

export function materialAt(ctx) {
  const { x, z, worldHeight: y, slope, noise, seedOffset } = ctx;
  const mottling = noise.fbm2({ x, z, frequency: 1 / 37, octaves: 2, seed: seedOffset(25) });
  const groves = noise.fbm2({ x, z, frequency: 1 / 104, octaves: 2, seed: seedOffset(26) });
  const crag = smoothstep(0.14, 0.42, slope + mottling * 0.065);
  const summit = smoothstep(135 + mottling * 27, 238 + mottling * 22, y) * 0.76;
  const rock = clamp01(Math.max(crag, summit));
  const beach = (1 - smoothstep(1.1 + mottling * 1.3, 7.7 + mottling * 2.4, y)) * (1 - rock * 0.8);
  const scree = smoothstep(0.045, 0.26, slope + mottling * 0.025) * 0.3;
  const grove = smoothstep(66, 102, Math.hypot(x, z))
    * smoothstep(-0.27, 0.19, groves + mottling * 0.14)
    * (1 - smoothstep(0.18, 0.40, slope))
    * smoothstep(3, 12, y) * (1 - smoothstep(116, 172, y));
  const remote = smoothstep(354 + mottling * 29, 459 + mottling * 25, -z)
    * smoothstep(43, 96, y);
  const green = (1 - rock) * (1 - beach) * (1 - scree);
  return {
    chalkrock: rock * (1 - remote), mountain: rock * remote,
    shoreline: (1 - rock) * beach,
    gravel: (1 - rock) * (1 - beach) * scree,
    grass: green * (1 - grove) * (1 - remote),
    upland: green * (1 - grove) * remote,
    forest: green * grove
  };
}
