// The horse courier outside the grand gate: every number scripts/courier.js, the HUD and the player's picker read.
export const TOMAS = { body: 'oklch(0.5 0.05 65)', accent: 'oklch(0.34 0.05 50)', trousers: 'oklch(0.33 0.02 60)', boots: 'oklch(0.22 0.03 45)',
  cape: 'oklch(0.42 0.06 145)', hat: true, hatCol: 'oklch(0.3 0.04 55)', hair: 'oklch(0.6 0.015 70)', skin: 'oklch(0.66 0.07 55)' };
export const COURIER = {
  horse: 'courier-horse', man: 'courier-tomas', post: 'courier-post',
  home: { x: -8.2, z: 16.4, yaw: 0 },            // horse feet at rest, head toward the road (-z)
  manHome: { x: -8.92, z: 15.45, yaw: -30 },     // Tomas at the horse's left shoulder, turned a little to it
  seat: { x: 0, y: 1.15, z: 0.5 },               // passenger's feet, horse-local (pillion behind Tomas)
  speed: 9, walk: 2.4, accel: 2.6, lookAhead: 4, turnRate: 5,
  dismountSide: 4.5, returnDelay: 1.5, pickReach: 6, uiReach: 5, busyReach: 16,
  hooves: '/cdn/moodboard-lowpoly-cozy/sfx-horse-hooves-canter-cobblestone-loop.mp3',
  snort: '/cdn/moodboard-lowpoly-cozy/sfx-horse-soft-snort-whinny.mp3',
  greet: '/cdn/voice-tomas-courier-saying-where-to-traveller.mp3',
  cities: {
    lumenvale: { name: 'Lumenvale', road: 'east', centre: { x: 1100, z: -250 }, action: 'courierLumen', key: '1' },
    hearthmere: { name: 'Hearthmere', road: 'west', centre: { x: -1000, z: -500 }, action: 'courierHearth', key: '2' },
  },
  cancel: { action: 'courierCancel', key: '3' },
};
