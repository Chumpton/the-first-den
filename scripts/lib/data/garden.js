// Tower Gardens: every tuned number of the seed / plant / water / harvest loop. Beds are laid out by the rows below.
const S = '/cdn/moodboard-lowpoly-cozy/';
export const GARDEN = {
  centre: { x: 57, z: -26 }, hudReach: 34,
  seedsPerTake: 4, seedCap: 12, canMax: 8,
  greenhouseSpeed: 0.6,           // greenhouse stages take this share of the time, and a greenhouse bed stays wet once watered
  goldenChance: 0.06,
  crops: {
    carrot:     { name: 'Carrot',     plural: 'carrots',     grow: 14, yield: 4, color: '#f08a3c', seedCol: 'oklch(0.72 0.16 55)' },
    strawberry: { name: 'Strawberry', plural: 'strawberries', grow: 16, yield: 6, color: '#e8475a', seedCol: 'oklch(0.62 0.2 20)' },
    cabbage:    { name: 'Cabbage',    plural: 'cabbages',    grow: 18, yield: 3, color: '#9fd27a', seedCol: 'oklch(0.75 0.14 135)' },
    tomato:     { name: 'Tomato',     plural: 'tomatoes',    grow: 20, yield: 5, color: '#e0503a', seedCol: 'oklch(0.6 0.2 30)' },
    sunflower:  { name: 'Sunflower',  plural: 'sunflowers',  grow: 24, yield: 2, color: '#f5c63a', seedCol: 'oklch(0.85 0.16 90)' },
    pumpkin:    { name: 'Pumpkin',    plural: 'pumpkins',    grow: 30, yield: 2, color: '#f2862a', seedCol: 'oklch(0.7 0.17 60)' },
  },
  beds: {
    outdoor: { rows: [-26, -22, -18], xs: [47, 51.5, 56, 60.5, 65, 69.5], w: 3.0, d: 1.4 },
    greenhouse: { rows: [-34.8, -31.2], xs: [49.6, 53.8, 58, 62.2, 66.4], w: 3.4, d: 1.2 },
  },
  stall: { x: 44.5, z: -19.5, yaw: -90 },   // faces the gate (west, -X)
  pump: { x: 44.5, z: -27 },
  sfx: {
    dig: S + 'sfx-trowel-digging-soft-soil.mp3',
    water: S + 'sfx-watering-can-pour-on-soil.mp3',
    pump: S + 'sfx-old-hand-water-pump-squeak-gush.mp3',
    seeds: S + 'sfx-seed-packet-rustle-shake.mp3',
    grow: S + 'sfx-soft-magic-sprout-grow-chime.mp3',
    harvest: S + 'sfx-harvest-pluck-pop-cheerful.mp3',
    golden: S + 'sfx-treasure-get-fanfare-short-triumphant-jingle.mp3',
    nope: S + 'sfx-soft-wooden-tap-no.mp3',
  },
};
