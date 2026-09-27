import { fx, pop, range, sphereDir, up, drag, buoyancy, curve, sprite, vec3, attr, disc } from 'builtin/fx';
// A petted animal's little cloud of hearts: pink-to-peach, rising and drifting, gone in under two seconds.
const HEART = 'M12 21 L10.6 19.7 C5.4 15 2 11.9 2 8.1 C2 5 4.4 2.6 7.5 2.6 C9.2 2.6 10.9 3.4 12 4.7 C13.1 3.4 14.8 2.6 16.5 2.6 C19.6 2.6 22 5 22 8.1 C22 11.9 18.6 15 13.4 19.7 Z';
export function effect(ctx) {
  const k = ctx.params.scale ?? 1;
  return fx(
    pop('hearts', {
      spawn: { on: disc({ r: 0.25 * k }), burst: { count: [7, 10] } }, lifetime: range(1.1, 1.7),
      init: { v: up(1).mul(range(0.5, 1)).add(sphereDir().mul(0.45)), size: range(0.11, 0.19).mul(Math.max(0.6, k)), hue: range(0, 1) },
      accel: buoyancy(0.4).add(drag(1.5)),
      size: attr('size').mul(curve([0, 0.3], [0.15, 1.15], [0.3, 1], [1, 0.8])),
      color: vec3(1, 0.4, 0.55).mix(vec3(1, 0.62, 0.42), attr('hue')),
      alpha: curve([0, 0], [0.1, 1], [0.7, 1], [1, 0]),
      render: sprite({ texture: HEART, blend: 'alpha' }),
    }),
    pop('twinkle', {
      spawn: { on: disc({ r: 0.35 * k }), burst: { count: [6, 9] } }, lifetime: range(0.5, 0.9),
      init: { v: up(0.6).add(sphereDir().mul(0.6)), size: range(0.03, 0.06) },
      accel: drag(2), size: attr('size'), color: vec3(3, 2.2, 2.4), alpha: curve([0, 1], [1, 0]),
      render: sprite({ texture: 'mote', blend: 'add' }),
    }),
  );
}
