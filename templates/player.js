// spawn6 native template "player"
export const player = {
  behavior: ["scripts/player.js", "scripts/humanoid-locomotion.js", "scripts/home-player-feel.js"],
  feetPosition: { x: 0, y: 2, z: 0 },
  physics: { body: "character" },
  tags: ["player"],
};
