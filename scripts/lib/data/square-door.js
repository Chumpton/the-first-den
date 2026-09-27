// The den's side door to the square: one of the house's oak doors, in the spare room's far wall. It swings open as someone
// walks up and the opening shows the square live; stepping through lands you at the square's den gate.
export const SQUARE_DOOR = {
  id: 'square-door',
  link: '@@squaresrc/the-square +main#den-door',
  // The opening along the wing's right wall (scripts/gen/home-architecture-data.js WALLS wing-right): metres from its front corner.
  wall: { a: 6.45, b: 7.55, top: 2.4 },
  hinge: 'square-door-hinge',
  glass: 'square-door/glass',
  approach: 'square-door/approach',
  approachHalf: { x: 1.5, z: 1.6 },
  calm: { color: '#000000', opacity: 0, transparent: true, depthWrite: false },
  live: { spill: 1.2, sound: 0.4 },
};
