// The sunflower & corn maze layout: one seeded perfect maze, shared by the stalks (geometry) and the walls you bump (collider).
// Grid n×n cells of `cell` m, origin at the maze centre, rows run -Z (north, toward the lake) to +Z. Wall = [x0,z0,x1,z1].
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function mazeWalls({ n = 11, cell = 3, seed = 7, plaza = 1 } = {}) {
  const R = rng(seed), H = n * cell / 2, mid = Math.floor(n / 2);
  // open[r][c] = { s: wall south removed, e: wall east removed }
  const open = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ s: false, e: false })));
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[mid, mid]]; seen[mid][mid] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const nb = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !seen[a][b]);
    if (!nb.length) { stack.pop(); continue; }
    const [a, b] = nb[Math.floor(R() * nb.length)];
    if (a > r) open[r][c].s = true; else if (a < r) open[a][b].s = true; else if (b > c) open[r][c].e = true; else open[a][b].e = true;
    seen[a][b] = true; stack.push([a, b]);
  }
  const inPlaza = (r, c) => Math.abs(r - mid) <= plaza && Math.abs(c - mid) <= plaza;
  const x = (c) => -H + c * cell, z = (r) => -H + r * cell, walls = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (r < n - 1 && !open[r][c].s && !(inPlaza(r, c) && inPlaza(r + 1, c))) walls.push([x(c), z(r + 1), x(c + 1), z(r + 1)]);
    if (c < n - 1 && !open[r][c].e && !(inPlaza(r, c) && inPlaza(r, c + 1))) walls.push([x(c + 1), z(r), x(c + 1), z(r + 1)]);
  }
  // border: the gate is the middle cell of the +Z edge, facing the lake
  for (let c = 0; c < n; c++) { walls.push([x(c), -H, x(c + 1), -H]); if (c !== mid) walls.push([x(c), H, x(c + 1), H]); }
  for (let r = 0; r < n; r++) { walls.push([-H, z(r), -H, z(r + 1)]); walls.push([H, z(r), H, z(r + 1)]); }
  return { walls, H, gate: [0, H], heart: [0, 0] };
}
