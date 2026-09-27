// J's travel list: every place it can take you. x/z on the ground; the ground's height is read on arrival (y = a floor you land on instead).
export const TRAVEL = {
  key: 'j',
  cooldownMs: 1500,
  whoosh: '/cdn/moodboard-lowpoly-cozy/sfx-soft-magic-teleport-whoosh-chime.mp3',
  spots: [
    { id: 'home', name: 'Home', note: 'the cob house', x: 0.5, z: -13, yaw: 0, action: 'travelHome', key: '1' },
    { id: 'lumenvale', name: 'Lumenvale', note: 'east gate', x: 872, z: -232, yaw: -90, action: 'travelLumen', key: '2' },
    { id: 'hearthmere', name: 'Hearthmere', note: 'east gate', x: -803, z: -442, yaw: 60, action: 'travelHearth', key: '3' },
    { id: 'tower', name: 'Wizard Tower', note: 'and Violet', x: 25.5, z: -12, yaw: -60, action: 'travelTower', key: '4' },
    { id: 'dock', name: 'The Dock', note: 'rowboat', x: 6, z: -50, y: 0.92, yaw: 180, action: 'travelDock', key: '5' },
    { id: 'gate', name: 'Front Gate', note: 'Tomas & horse', x: 0, z: 18, yaw: 180, action: 'travelGate', key: '6' },
  ],
};
