// spawn6 native template "camera": the WoW rig. The cursor stays free (click wolves, bars, bags);
// a held mouse button grabs the look: left orbits, right steers the body, both run.
export const camera = {
  behavior: ["scripts/camera.js"],
  kind: "custom",
  orientation: { source: "look" },
  pointerLock: "drag",
  fov: 72,
  clip: { near: 0.06, far: 9000 },
  state: { pitch: -0.32, yaw: 3.1416, heading: 3.1416, off: 0, dist: 7, actual: 7 },
};
