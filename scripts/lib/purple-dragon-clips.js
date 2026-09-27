// Raw-track clips for Violet's skeleton (scripts/gen/purple-dragon.js): rest (breathing, a head turn, a tail swish, wings folded),
// flap and glide. A looping mixer channel costs no tick.
const R = Math.PI / 180;
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qx = (d) => [Math.sin(d * R / 2), 0, 0, Math.cos(d * R / 2)], qy = (d) => [0, Math.sin(d * R / 2), 0, Math.cos(d * R / 2)], qz = (d) => [0, 0, Math.sin(d * R / 2), Math.cos(d * R / 2)];
const eul = (yaw = 0, pitch = 0, roll = 0) => qmul(qmul(qy(yaw), qx(pitch)), qz(roll));
// folded: pitch the membrane down, swing the leading edge back along the flank, flare it out a touch
export const foldR = (b = 0) => qmul(qz(26 + b), qmul(qy(-84), qx(68)));
export const foldL = (b = 0) => qmul(qz(-26 - b), qmul(qy(84), qx(68)));
const I = [0, 0, 0, 1];
function clip(name, period, keys, poseAt) {
  const times = [], rot = {}, scl = {};
  for (let j = 0; j <= keys; j++) {
    const t = (j / keys) * period; times.push(t);
    const pose = poseAt(((j % keys) / keys) * period, period);
    for (const b in pose) {
      if (b === 'scale') { for (const sb in pose.scale) (scl[sb] ??= []).push(...pose.scale[sb]); continue; }
      (rot[b] ??= []).push(...pose[b]);
    }
  }
  const tracks = Object.keys(rot).map((bone) => ({ bone, prop: 'rotation', times, values: rot[bone] }));
  for (const bone in scl) tracks.push({ bone, prop: 'scale', times, values: scl[bone] });
  return { name, tracks };
}
const pulse = (t, a, b, e = 1) => { const s = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }; return s((t - a) / e) * (1 - s((t - (b - e)) / e)); };
export function restClip() {
  return clip('purple-rest', 12, 48, (t) => {
    const b = 0.5 - 0.5 * Math.cos(2 * Math.PI * t / 4), turn = pulse(t, 4.4, 8.8, 1.1) , flick = pulse(t, 9.2, 11.6, 0.8);
    const sw = (i) => Math.sin(2 * Math.PI * t / 6 - i * 0.9), fl = Math.sin(2 * Math.PI * t * 0.75);
    return {
      scale: { chest: [1 + 0.02 * b, 1 + 0.03 * b, 1 + 0.015 * b] },
      chest: I, neck1: eul(14 * turn, 1.5 * Math.sin(2 * Math.PI * t / 4)), neck2: eul(9 * turn, 0), head: eul(12 * turn, -2.5 * b, 5 * turn),
      wingR: foldR(1.5 * b), wingL: foldL(1.5 * b), armR: I, armL: I, legR: I, legL: I,
      tail1: eul(3 * sw(0) + 4 * flick * fl), tail2: eul(5 * sw(1) + 7 * flick * fl), tail3: eul(8 * sw(2) + 11 * flick * fl), tail4: eul(11 * sw(3) + 15 * flick * fl),
    };
  });
}
function airBody(ph) {
  const w = (i) => Math.sin(ph - i * 0.8);
  return {
    armR: eul(0, -58), armL: eul(0, -58), legR: eul(0, -34), legL: eul(0, -34),
    tail1: eul(2 * w(0), -12), tail2: eul(-10 + 3 * w(1), -4), tail3: eul(-32 + 5 * w(2), 0), tail4: eul(-44 + 7 * w(3), 0),
  };
}
export function flapClip() {
  return clip('purple-flap', 1.1, 16, (t, T) => {
    const ph = 2 * Math.PI * t / T, a = 30 * Math.cos(ph) + 6, tw = -9 * Math.sin(ph);
    return { scale: { chest: [1, 1, 1] }, chest: eul(0, 2 * Math.sin(ph)), neck1: eul(0, -36 + 3 * Math.sin(ph + 1)), neck2: eul(0, -10), head: eul(0, 30 - 3 * Math.sin(ph + 1.4)),
      wingR: qmul(qz(a), qx(tw)), wingL: qmul(qz(-a), qx(tw)), ...airBody(ph) };
  });
}
export function glideClip() {
  return clip('purple-glide', 4, 16, (t, T) => {
    const ph = 2 * Math.PI * t / T, a = 7 + 2 * Math.sin(ph);
    return { scale: { chest: [1, 1, 1] }, chest: I, neck1: eul(1.5 * Math.sin(ph * 0.5), -38), neck2: eul(0, -10), head: eul(2 * Math.sin(ph * 0.5), 32),
      wingR: qmul(qz(a), qx(-3)), wingL: qmul(qz(-a), qx(-3)), ...airBody(ph) };
  });
}
