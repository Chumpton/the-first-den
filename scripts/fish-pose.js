// The item-get pose: seated, both arms thrust straight up holding the catch overhead. Degrees from the T-pose bind, per bone
// (the same convention as humanoid-locomotion.js#sit). Channel "fish" masks from the Spine so the seated legs stay put.
export function present() {
  return {
    Spine02: { rotation: [-6, 0, 0] },
    LeftArm: { rotation: [-10, 0, -72] },
    RightArm: { rotation: [-10, 0, 72] },
    LeftForeArm: { rotation: [0, 0, -12] },
    RightForeArm: { rotation: [0, 0, 12] },
    Head: { rotation: [-12, 0, 0] },
  }
}
present.duration = 0.1
