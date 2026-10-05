// spawn6 native template "player"
export const player = {
  behavior: ["scripts/player.js", "scripts/humanoid-locomotion.js", "scripts/home-player-feel.js", "scripts/delete-mode.js", "scripts/travel.js","scripts/alchemy-player.js", "scripts/gryphon-mount.js", "scripts/bender.js", "scripts/fox-companion.js"],
  feetPosition: { x: 0, y: 2, z: 0 },
  physics: { body: "character" },
  tags: ["player"],
};
