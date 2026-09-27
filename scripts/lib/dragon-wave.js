// A serpent dragon's body S-wave as a looping mixer clip (yaw per spine bone in a travelling wave, a little pitch) —
// the jade skeleton's n1/head/s1..sN. w = { period, amp, grow, phase, lift, neck, head }. A mixer channel costs no tick.
import { DRAGON } from './data/dragon.js';
const R = Math.PI / 180, TAU = Math.PI * 2, KEYS = 16, NB = DRAGON.spine.bones;
function quat(yaw, pitch) { const cy = Math.cos(yaw * R / 2), sy = Math.sin(yaw * R / 2), cx = Math.cos(pitch * R / 2), sx = Math.sin(pitch * R / 2); return [cy * sx, sy * cx, -sy * sx, cy * cx]; }
const CACHE = {};
export function waveClip(w, name) {
  if (CACHE[name]) return CACHE[name];
  const times = [], per = {};
  for (let j = 0; j <= KEYS; j++) {
    times.push((j / KEYS) * w.period);
    const ph = (j % KEYS) / KEYS * TAU, pose = { n1: [-Math.sin(ph) * w.amp * 0.3, w.neck], head: [Math.sin(ph) * w.amp * 0.4, w.head] };
    for (let i = 1; i <= NB; i++) pose['s' + i] = [Math.sin(ph - i * w.phase) * w.amp * (w.grow + i / NB * 0.6), Math.sin(ph * 2 - i * w.phase) * w.lift];
    for (const b in pose) (per[b] ??= []).push(...quat(pose[b][0], pose[b][1]));
  }
  return (CACHE[name] = { name, tracks: Object.keys(per).map((bone) => ({ bone, prop: 'rotation', times, values: per[bone] })) });
}
