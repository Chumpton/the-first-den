// Raw-track clips for the jade dragon's spine (a looping mixer channel costs no tick).
import { DRAGON as D } from './data/dragon.js';
const R = Math.PI / 180, KEYS = 16;
function quat(yaw, pitch) { const cy = Math.cos(yaw * R / 2), sy = Math.sin(yaw * R / 2), cx = Math.cos(pitch * R / 2), sx = Math.sin(pitch * R / 2); return [cy * sx, sy * cx, -sy * sx, cy * cx]; }
function clip(name, period, poseAt) {
  const times = [], per = {};
  for (let j = 0; j <= KEYS; j++) {
    const t = (j / KEYS) * period; times.push(t);
    const pose = poseAt((j % KEYS) / KEYS * Math.PI * 2);
    for (const bone in pose) (per[bone] ??= []).push(...quat(pose[bone][0], pose[bone][1]));
  }
  return { name, tracks: Object.keys(per).map((bone) => ({ bone, prop: 'rotation', times, values: per[bone] })) };
}
export function restClip() {
  const c = D.rest;
  return clip('dragon-rest', c.period, (ph) => {
    const p = { n1: [Math.sin(ph) * 2, c.neck + Math.sin(ph) * c.bob], head: [-Math.sin(ph) * 3, c.head - Math.sin(ph + 0.6) * c.bob] };
    for (let i = 1; i <= D.spine.bones; i++) p['s' + i] = [c.coil + Math.sin(ph - i * c.wave) * c.sway, 0];
    return p;
  });
}
export function flyClip() {
  const c = D.fly;
  return clip('dragon-fly', c.period, (ph) => {
    const p = { n1: [-Math.sin(ph) * c.amp * 0.25, c.neck], head: [Math.sin(ph) * c.amp * 0.35, c.head] };
    for (let i = 1; i <= D.spine.bones; i++) p['s' + i] = [Math.sin(ph - i * c.wave) * c.amp * (c.grow + i / D.spine.bones * 0.6), Math.sin(ph * 2 - i * c.wave) * c.lift];
    return p;
  });
}
