// Mossback, the stone golem of the den lawns: chamfered, weathered limestone blocks on a seven-bone rig, moss caps with
// tiny flowers, lichen, two soft teal eyes and a faint chest rune. Frame: feet at y 0, faces -Z, metres. params.glow = eye brightness.
import { Q, T } from '../lib/road-solid.js';
import { blob } from '../lib/yard-kit.js';
const S = 1.05, D = Math.PI / 180, TAU = Math.PI * 2;
const STONE = 'cdn/texture-weathered-pale-grey-limestone-rock.png';
const MOSS = 'cdn/texture-soft-green-moss-carpet.png';

export function skeleton() {
  const p = (x, y, z) => [x * S, y * S, z * S];
  return {
    hips: { pivot: p(0, 1.35, 0) },
    spine: { parent: 'hips', pivot: p(0, 1.55, 0.05) },
    head: { parent: 'spine', pivot: p(0, 3.4, -0.3) },
    armL: { parent: 'spine', pivot: p(-1.12, 3.3, 0) },
    armR: { parent: 'spine', pivot: p(1.12, 3.3, 0) },
    legL: { parent: 'hips', pivot: p(-0.5, 1.3, 0) },
    legR: { parent: 'hips', pivot: p(0.5, 1.3, 0) },
  };
}

function xf(v, r) {
  let [x, y, z] = v;
  if (r.roll) { const c = Math.cos(r.roll * D), s = Math.sin(r.roll * D); [x, y] = [x * c - y * s, x * s + y * c]; }
  if (r.pitch) { const c = Math.cos(r.pitch * D), s = Math.sin(r.pitch * D); [y, z] = [y * c - z * s, y * s + z * c]; }
  if (r.yaw) { const c = Math.cos(r.yaw * D), s = Math.sin(r.yaw * D); [x, z] = [x * c + z * s, -x * s + z * c]; }
  return [x, y, z];
}
const oct = (ax, az, k) => [[ax, -az + k], [ax, az - k], [ax - k, az], [-ax + k, az], [-ax, az - k], [-ax, -az + k], [-ax + k, -az], [ax - k, -az]];

// a weathered block: octagonal chamfered loops, corners nudged inward at random, turned and set at (cx, cy, cz)
function rock(ctx, cx, cy, cz, sx, sy, sz, r = {}, ch = 0.2, jit = 0.35) {
  const hx = sx / 2 * S, hy = sy / 2 * S, hz = sz / 2 * S, c = Math.min(hx, hy, hz) * ch * 2;
  const J = ctx.lod >= 4 ? 0 : jit;
  const levels = [[-hy, hx - c, hz - c, c * 0.6], [-hy + c, hx, hz, c], [hy - c, hx, hz, c], [hy, hx - c, hz - c, c * 0.6]];
  const o = [cx * S, cy * S, cz * S];
  const L = levels.map(([y, ax, az, k]) => oct(ax, az, k).map(([x, z]) => {
    const f = 1 - ctx.random() * J * c / Math.max(hx, hz), g = y + (ctx.random() - 0.5) * J * c;
    const w = xf([x * f, g, z * f], r); return [o[0] + w[0], o[1] + w[1], o[2] + w[2]];
  }));
  for (let k = 0; k < 3; k++) for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; Q(ctx, L[k][i], L[k][j], L[k + 1][j], L[k + 1][i], o); }
  for (let i = 1; i < 7; i++) { T(ctx, L[0][0], L[0][i], L[0][i + 1], o); T(ctx, L[3][0], L[3][i], L[3][i + 1], o); }
}
function stone(ctx) {
  ctx.albedo(STONE); ctx.emissive(null); ctx.metalness(0); ctx.roughness(0.95);
  const l = 0.9 + ctx.random() * 0.07, ch = 0.01 + ctx.random() * 0.018, h = 68 + ctx.random() * 32;
  ctx.color(`oklch(${l.toFixed(3)} ${ch.toFixed(3)} ${h.toFixed(0)})`);
}
function moss(ctx, cx, cy, cz, rx, ry, rz) {
  ctx.albedo(MOSS); ctx.emissive(null); ctx.roughness(1);
  ctx.color(`oklch(${(0.9 + ctx.random() * 0.06).toFixed(3)} 0.06 ${(125 + ctx.random() * 20).toFixed(0)})`);
  blob(ctx, cx * S, cy * S, cz * S, rx * S, ry * S, rz * S, ctx.lod >= 3 ? 5 : 8, () => ctx.random());
}
function flower(ctx, x, y, z, petal) {
  if (ctx.lod >= 3) return;
  ctx.albedo(null); ctx.emissive(null); ctx.roughness(0.8);
  const X = x * S, Y = y * S + 0.03, Z = z * S, r = 0.055, n = 5, a0 = ctx.random() * TAU;
  ctx.color(petal);
  for (let i = 0; i < n; i++) {
    const a = a0 + i / n * TAU, b = a + 0.5, e = a - 0.5;
    ctx.tri(X, Y, Z, X + Math.cos(b) * r * 0.7, Y + 0.01, Z + Math.sin(b) * r * 0.7, X + Math.cos(a) * r, Y + 0.015, Z + Math.sin(a) * r);
    ctx.tri(X, Y, Z, X + Math.cos(a) * r, Y + 0.015, Z + Math.sin(a) * r, X + Math.cos(e) * r * 0.7, Y + 0.01, Z + Math.sin(e) * r * 0.7);
  }
  ctx.color('oklch(0.86 0.15 88)');
  ctx.tri(X - 0.015, Y + 0.02, Z, X + 0.015, Y + 0.02, Z - 0.012, X, Y + 0.02, Z + 0.018);
  ctx.color('oklch(0.55 0.1 140)');
  ctx.quad(X - 0.004, Y - 0.06, Z, X + 0.004, Y - 0.06, Z, X + 0.004, Y, Z, X - 0.004, Y, Z);
}
// a flat irregular lichen patch on a face: axis 'z' faces -Z (front), 'x' faces ±X (sign in sx)
function lichen(ctx, x, y, z, r, axis = 'z', col = 'oklch(0.82 0.08 105)') {
  if (ctx.lod >= 3) return;
  ctx.albedo(null); ctx.emissive(null); ctx.roughness(1); ctx.color(col);
  const n = 7, P = [];
  for (let i = 0; i < n; i++) { const a = i / n * TAU, q = r * (0.6 + ctx.random() * 0.5) * S; P.push(axis === 'z' ? [x * S + Math.cos(a) * q, y * S + Math.sin(a) * q, z * S] : [x * S, y * S + Math.sin(a) * q, z * S + Math.cos(a) * q]); }
  const c = [x * S, y * S, z * S];
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; ctx.tri(...c, ...a, ...b); }
}
function glow(ctx, k) { ctx.albedo(null); ctx.color('oklch(0.85 0.12 190)'); ctx.emissive(0.42 * k, 0.95 * k, 0.92 * k); ctx.roughness(0.4); }
function bar(ctx, a, b, z, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
  ctx.quad(a[0] * S + nx, a[1] * S + ny, z * S, b[0] * S + nx, b[1] * S + ny, z * S, b[0] * S - nx, b[1] * S - ny, z * S, a[0] * S - nx, a[1] * S - ny, z * S);
}

export function geometry(ctx) {
  ctx.flat();
  const lod = ctx.lod, fine = lod < 3, k = ctx.params?.glow ?? 1.2;
  const cream = 'oklch(0.94 0.03 85)', pink = 'oklch(0.8 0.09 350)', sky = 'oklch(0.78 0.08 240)';

  // legs: thigh, shin, a broad foot
  for (const [side, bone] of [[-1, 'legL'], [1, 'legR']]) {
    ctx.bone(bone); const x = 0.5 * side;
    stone(ctx); rock(ctx, x, 1.0, 0.02, 0.74, 0.62, 0.74, { yaw: 6 * side });
    stone(ctx); rock(ctx, x, 0.56, 0, 0.66, 0.38, 0.68, { yaw: -4 * side });
    stone(ctx); rock(ctx, x + 0.02 * side, 0.2, -0.12, 0.88, 0.4, 1.04, {}, 0.3);
    if (fine) { stone(ctx); rock(ctx, x - 0.18 * side, 0.12, -0.66, 0.3, 0.24, 0.24, { yaw: 10 }, 0.35); stone(ctx); rock(ctx, x + 0.18 * side, 0.12, -0.64, 0.28, 0.22, 0.22, { yaw: -8 }, 0.35); }
    lichen(ctx, x + 0.375 * side, 1.02, 0.05, 0.14, 'x', 'oklch(0.72 0.12 60)');
  }
  // pelvis
  ctx.bone('hips');
  stone(ctx); rock(ctx, 0, 1.4, 0.05, 1.36, 0.5, 0.96, { yaw: 3 });
  // torso: belly, a broad chest, a hunched back hump
  ctx.bone({ hips: 0.3, spine: 0.7 });
  stone(ctx); rock(ctx, 0, 1.9, 0, 1.46, 0.7, 1.02, { yaw: -4 });
  ctx.bone('spine');
  stone(ctx); rock(ctx, 0, 2.66, -0.05, 2.0, 1.0, 1.26, { roll: 2 }, 0.16);
  stone(ctx); rock(ctx, 0, 3.24, 0.2, 1.62, 0.6, 1.06, { pitch: -14 });
  if (fine) {
    stone(ctx); rock(ctx, 0.42, 2.4, 0.64, 0.72, 0.6, 0.26, { roll: 8 });
    stone(ctx); rock(ctx, -0.5, 2.92, 0.62, 0.6, 0.5, 0.26, { roll: -6 });
    stone(ctx); rock(ctx, 0.62, 2.1, -0.46, 0.5, 0.36, 0.2, { roll: -10 });
  }
  if (lod < 5) {
    // keystone with the rune
    stone(ctx); rock(ctx, 0, 2.72, -0.69, 0.66, 0.66, 0.12, {}, 0.15, 0);
    glow(ctx, 0.55);
    const z = -0.757, W = 0.035;
    bar(ctx, [0, 2.5], [0, 2.94], z, W);
    bar(ctx, [-0.16, 2.77], [0, 2.92], z, W); bar(ctx, [0, 2.92], [0.16, 2.77], z, W);
    bar(ctx, [-0.13, 2.53], [0, 2.66], z, W); bar(ctx, [0, 2.66], [0.13, 2.53], z, W);
    lichen(ctx, -0.62, 2.95, -0.685, 0.13); lichen(ctx, 0.5, 2.3, -0.685, 0.1, 'z', 'oklch(0.74 0.11 62)'); lichen(ctx, 0.42, 1.8, -0.52, 0.11);
  }
  // hump moss with flowers
  moss(ctx, 0, 3.5, 0.28, 0.7, 0.13, 0.45);
  flower(ctx, 0.35, 3.6, 0.35, cream); flower(ctx, -0.3, 3.61, 0.2, pink);

  // head: sunk between the shoulders, a heavy brow over two teal eyes
  ctx.bone('head');
  stone(ctx); rock(ctx, 0, 3.62, -0.42, 0.72, 0.58, 0.66, { pitch: 4 });
  stone(ctx); rock(ctx, 0, 3.8, -0.7, 0.8, 0.15, 0.24, { pitch: -10 }, 0.25);
  if (fine) { stone(ctx); rock(ctx, 0, 3.37, -0.5, 0.6, 0.2, 0.5, {}, 0.25); }
  glow(ctx, k);
  for (const sx of [-0.17, 0.17]) rock(ctx, sx, 3.64, -0.745, 0.14, 0.075, 0.05, {}, 0.3, 0);
  moss(ctx, 0.02, 3.9, -0.4, 0.36, 0.12, 0.33);
  flower(ctx, 0.12, 3.99, -0.45, sky); flower(ctx, -0.14, 3.98, -0.32, cream);

  // arms: massive shoulder, upper arm, forearm, a boulder fist hanging low
  for (const [side, bone] of [[-1, 'armL'], [1, 'armR']]) {
    ctx.bone(bone); const x = side;
    stone(ctx); rock(ctx, 1.12 * x, 3.3, 0, 0.86, 0.8, 0.96, { roll: 6 * side, yaw: 5 * side });
    stone(ctx); rock(ctx, 1.2 * x, 2.55, 0.05, 0.58, 0.9, 0.6, { roll: -5 * side });
    if (fine) { stone(ctx); rock(ctx, 1.22 * x, 2.1, 0.02, 0.5, 0.26, 0.52, { yaw: 20 }, 0.35); }
    stone(ctx); rock(ctx, 1.25 * x, 1.72, -0.02, 0.66, 0.84, 0.66, { pitch: 6, roll: 3 * side });
    stone(ctx); rock(ctx, 1.28 * x, 1.0, -0.1, 0.92, 0.72, 0.88, { yaw: 12 * side }, 0.4, 0.5);
    if (fine) {
      for (let i = 0; i < 3; i++) { stone(ctx); rock(ctx, 1.28 * x + (i - 1) * 0.24, 1.18, -0.53, 0.24, 0.22, 0.14, { pitch: -10 }, 0.4); }
      lichen(ctx, 1.25 * x + 0.33 * side, 1.7, 0, 0.12, 'x');
    }
    moss(ctx, 1.12 * x, 3.68, 0.02, 0.46, 0.14, 0.5);
    flower(ctx, 1.02 * x, 3.79, -0.12, cream); flower(ctx, 1.25 * x, 3.78, 0.15, side < 0 ? pink : sky); flower(ctx, 1.15 * x, 3.8, 0.02, 'oklch(0.88 0.12 95)');
  }
}
