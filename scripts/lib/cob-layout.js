// Placement helpers for the cob-house interior: a piece set against the hex wall face at normal angle θ (deg),
// its centre `d` m from the house centre along the normal and `t` m along the face; back (+Z) to the wall.
export const HOME = { x: 0, y: 0.5, z: -26 };
export const LEVEL = { B: -3.0, G: 0.4, A: 3.8, D: 7.2 };
export const HANG = { B: 0.0, G: 3.45 };
const R = Math.PI / 180;
export function wall(th, d, t, level, dy = 0) {
  const n = [Math.cos(th * R), Math.sin(th * R)], tx = [Math.sin(th * R), -Math.cos(th * R)];
  return { pos: { x: HOME.x + n[0] * d + tx[0] * t, y: HOME.y + LEVEL[level] + dy, z: HOME.z + n[1] * d + tx[1] * t }, yaw: 90 - th };
}
export function polar(th, r, level, dy = 0, yaw = 90 - th) {
  return { pos: { x: HOME.x + Math.cos(th * R) * r, y: HOME.y + (LEVEL[level] ?? 0) + dy, z: HOME.z + Math.sin(th * R) * r }, yaw };
}
export function faceYaw(from, to) { return Math.atan2(-(to.x - from.x), -(to.z - from.z)) / R; }
export function row(id, script, item, params, at, o = {}) {
  const big = o.physics === 'static';
  return ['cob-in-' + id, {
    tags: ['cob-interior', ...(o.tags || [])], feetPosition: at.pos, rotation: { yaw: at.yaw },
    primitive: { kind: 'scripted', script, params: { item, ...params }, seed: o.seed ?? 7 },
    material: { pbr: true, color: '#ffffff', roughness: 0.7 }, physics: o.physics || 'none',
    castShadow: big, receiveShadow: true, visibleRange: { max: big ? 200 : 140 },
    ...(o.behavior ? { behavior: o.behavior } : {}), ...(o.state ? { state: o.state } : {}), ...(o.children ? { children: o.children } : {}),
  }];
}
export const CF = 'scripts/gen/cob-furnish.js', CA = 'scripts/gen/castle-furnish.js', DF = 'scripts/gen/den-furniture.js';
export const WARM = (y, intensity = 24) => [{ id: 'light', feetPosition: { x: 0, y, z: 0 }, light: { kind: 'point', color: '#ffc98a', intensity, distance: 10 } }];
export const SND = (n) => `/cdn/moodboard-lowpoly-cozy/sfx-${n}.mp3`;
