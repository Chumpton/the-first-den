// The mandala terrace: a low dry-laid fieldstone retaining wall round the quad garden's oval, capped with flat coping,
// open at the garden's gates (w, n, e) with quoin piers, warm lantern niches and two shallow steps up at each; the
// raised grass fill inside at y = h; and the carved limestone relic pedestal at the hub. Feet = the hub centre, y 0.
// params: { rx, rz (wall centreline radii), t (thickness), h (height), gate (half opening), gates }
import { paint, obox, lathe, beam, Q, T, TAU, yawAlong } from '../lib/yard-kit.js';

const P0 = (p) => ({ rx: p.rx ?? 8.1, rz: p.rz ?? 5.55, t: p.t ?? 0.44, h: p.h ?? 0.45, gw: p.gate ?? 0.95, gates: p.gates ?? ['w', 'n', 'e'] });
const DIR = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };
const PIER = 0.5, COPE = 0.08;
const ell = (g, a, dr = 0) => [Math.cos(a) * (g.rx + dr), Math.sin(a) * (g.rz + dr)];
function inGate(g, x, z, pad = 0) {
  for (const n of g.gates) { const [dx, dz] = DIR[n]; if (dx ? (Math.sign(x) === dx && Math.abs(z) < g.gw + pad) : (Math.sign(z) === dz && Math.abs(x) < g.gw + pad)) return true; }
  return false;
}
const tone = (ctx, l, c, h, dl = 0.06, dh = 16) => `oklch(${(l + (ctx.random() - 0.5) * dl).toFixed(3)} ${c} ${(h + (ctx.random() - 0.5) * dh).toFixed(0)})`;
// a box in a gate's frame: u outward along the gate axis, v across
function gbox(ctx, d, u0, u1, v0, v1, y0, y1) {
  const [dx, dz] = d, uc = (u0 + u1) / 2, vc = (v0 + v1) / 2;
  if (dx) obox(ctx, dx * uc, y0, vc, u1 - u0, y1 - y0, v1 - v0); else obox(ctx, vc, y0, dz * uc, v1 - v0, y1 - y0, u1 - u0);
}
const axisR = (g, d, dr) => (d[0] ? g.rx : g.rz) + dr;
const ringAt = (g, d, v) => { const A = d[0] ? g.rx : g.rz, B = d[0] ? g.rz : g.rx; return A * Math.sqrt(Math.max(0, 1 - (v / B) ** 2)); };

function course(ctx, g, y0, y1, a0, lenMin, lenVar, depth, pad, colL) {
  let a = a0; const end = a0 + TAU;
  while (a < end - 0.02) {
    const len = lenMin + ctx.random() * lenVar, sp = Math.hypot(g.rx * Math.sin(a), g.rz * Math.cos(a)), da = Math.min(len / sp, end - a), m = a + da / 2;
    const [x0, z0] = ell(g, a), [x1, z1] = ell(g, a + da), [xm, zm] = ell(g, m);
    a += da;
    if (inGate(g, x0, z0, pad) || inGate(g, x1, z1, pad) || inGate(g, xm, zm, pad)) continue;
    const L = Math.hypot(x1 - x0, z1 - z0), nx = Math.cos(m) / g.rx, nz = Math.sin(m) / g.rz, nl = Math.hypot(nx, nz), j = (ctx.random() - 0.5) * 0.035;
    paint(ctx, 'stone', tone(ctx, colL, 0.02, 80), 0.93);
    obox(ctx, xm + nx / nl * j, y0, zm + nz / nl * j, L - 0.03, y1 - y0 - 0.012, depth * (0.92 + ctx.random() * 0.12), yawAlong(x1 - x0, z1 - z0) + (ctx.random() - 0.5) * 0.05);
  }
}

export function geometry(ctx) {
  const g = P0(ctx.params || {}), lod = ctx.lod || 1, h = g.h, top = h - COPE + 0.02; ctx.flat();
  const N = lod <= 2 ? 64 : 24;
  // the raised grass fill inside the wall
  paint(ctx, 'moss', 'oklch(0.74 0.1 128)', 1);
  for (let i = 0; i < N; i++) { const [x0, z0] = ell(g, i / N * TAU, -g.t / 2 + 0.02), [x1, z1] = ell(g, (i + 1) / N * TAU, -g.t / 2 + 0.02); ctx.tri(0, h, 0, x1, h, z1, x0, h, z0); }
  // the dark core behind the stones, so a joint shows shadow, never grass
  paint(ctx, null, 'oklch(0.42 0.02 70)', 1);
  for (let i = 0; i < N; i++) {
    const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, [x0, z0] = ell(g, a0, g.t * 0.3), [x1, z1] = ell(g, a1, g.t * 0.3);
    if (inGate(g, x0, z0, PIER * 0.6) || inGate(g, x1, z1, PIER * 0.6)) continue;
    Q(ctx, [x0, -0.12, z0], [x1, -0.12, z1], [x1, top - 0.01, z1], [x0, top - 0.01, z0], [0, 0.2, 0]);
  }
  if (lod <= 2) {
    // three dry-laid courses of pale fieldstone, joints broken course to course, then the flat coping
    course(ctx, g, -0.14, 0.1, 0.0, 0.42, 0.3, g.t, PIER - 0.02, 0.86);
    course(ctx, g, 0.1, 0.25, 0.021, 0.34, 0.26, g.t, PIER - 0.02, 0.9);
    course(ctx, g, 0.25, h - COPE + 0.012, 0.043, 0.38, 0.3, g.t, PIER - 0.02, 0.88);
    course(ctx, g, h - COPE, top, 0.012, 0.6, 0.22, g.t + 0.09, PIER - 0.02, 0.94);
  } else {
    for (let i = 0; i < N; i++) {
      const [x0, z0] = ell(g, i / N * TAU), [x1, z1] = ell(g, (i + 1) / N * TAU);
      if (inGate(g, x0, z0, PIER - 0.02) || inGate(g, x1, z1, PIER - 0.02)) continue;
      paint(ctx, 'stone', 'oklch(0.88 0.02 80)', 0.93); obox(ctx, (x0 + x1) / 2, -0.14, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) + 0.04, top + 0.14, g.t + 0.06, yawAlong(x1 - x0, z1 - z0));
    }
  }
  // gates: a threshold flag through the wall, two shallow steps down to the lawn, a quoin pier each side with a lantern niche
  for (const gn of g.gates) {
    const d = DIR[gn], R = axisR(g, d, g.t / 2), Ri = R - g.t;
    paint(ctx, 'stone', 'oklch(0.9 0.02 82)', 0.9); gbox(ctx, d, Ri - 0.12, R + 0.02, -g.gw, g.gw, -0.1, h + 0.005);
    paint(ctx, 'stone', 'oklch(0.87 0.02 80)', 0.92); gbox(ctx, d, R, R + 0.36, -g.gw, g.gw, -0.14, h - 0.15);
    paint(ctx, 'stone', 'oklch(0.84 0.02 78)', 0.92); gbox(ctx, d, R + 0.34, R + 0.7, -g.gw, g.gw, -0.14, h - 0.3);
    if (lod <= 2) { paint(ctx, 'stone', 'oklch(0.93 0.015 84)', 0.9); gbox(ctx, d, R + 0.3, R + 0.38, -g.gw, g.gw, h - 0.15, h - 0.14); gbox(ctx, d, R + 0.66, R + 0.72, -g.gw, g.gw, h - 0.3, h - 0.29); }
    for (const s of [-1, 1]) {
      const vc = s * (g.gw + PIER / 2), uc = ringAt(g, d, vc), u0 = uc - g.t / 2 - 0.05, u1 = uc + g.t / 2 + 0.05, v0 = vc - PIER / 2, v1 = vc + PIER / 2, H = h + 0.2;
      paint(ctx, 'stone', 'oklch(0.9 0.018 82)', 0.9); gbox(ctx, d, u0, u1, v0, v1, -0.14, H);
      paint(ctx, 'stone', 'oklch(0.94 0.015 84)', 0.88); gbox(ctx, d, u0 - 0.04, u1 + 0.04, v0 - 0.04, v1 + 0.04, H, H + 0.08);
      if (lod <= 3) {
        paint(ctx, null, 'oklch(0.96 0.07 85)', 0.4); ctx.emissive('oklch(0.86 0.14 72)');
        gbox(ctx, d, u1, u1 + 0.025, vc - 0.09, vc + 0.09, 0.22, 0.38); ctx.emissive(null);
        paint(ctx, null, 'oklch(0.3 0.02 60)', 0.55, 0.7); gbox(ctx, d, u1, u1 + 0.06, vc - 0.12, vc + 0.12, 0.38, 0.41);
        if (lod <= 2) for (const k of [-0.05, 0, 0.05]) gbox(ctx, d, u1 + 0.02, u1 + 0.035, vc + k - 0.006, vc + k + 0.006, 0.22, 0.38);
      }
    }
  }
  // the carved limestone relic pedestal at the hub
  const n = lod <= 2 ? 12 : 6, y = (v) => h + v;
  paint(ctx, 'stone', 'oklch(0.9 0.02 82)', 0.88); obox(ctx, 0, h - 0.02, 0, 0.98, 0.14, 0.98, Math.PI / 4);
  paint(ctx, 'stone', 'oklch(0.93 0.017 84)', 0.86);
  lathe(ctx, [[0.44, y(0.12)], [0.44, y(0.2)], [0.36, y(0.25)], [0.33, y(0.3)], [0.2, y(0.36)], [0.19, y(0.8)], [0.24, y(0.84)], [0.3, y(0.88)], [0.42, y(0.95)], [0.44, y(1.0)], [0.3, y(1.0)], [0.3, y(0.97)], [0, y(0.97)]], n);
  if (lod <= 2) {
    paint(ctx, 'stone', 'oklch(0.96 0.015 85)', 0.84); // reeded shaft
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; beam(ctx, [Math.cos(a) * 0.195, y(0.38), Math.sin(a) * 0.195], [Math.cos(a) * 0.19, y(0.78), Math.sin(a) * 0.19], 0.035, 0.035); }
    paint(ctx, null, 'oklch(0.72 0.12 195)', 0.3); ctx.emissive(0.25, 0.9, 1.0); // a teal inlay band and the glowing dish
    lathe(ctx, [[0.245, y(0.85)], [0.255, y(0.865)], [0.245, y(0.88)]], n);
    lathe(ctx, [[0.29, y(0.975)], [0, y(0.975)]], n); ctx.emissive(null);
    paint(ctx, 'moss', 'oklch(0.7 0.1 135)', 1); obox(ctx, 0.3, h + 0.12, 0.22, 0.2, 0.05, 0.14, 0.4);
  } else { paint(ctx, null, 'oklch(0.72 0.12 195)', 0.3); ctx.emissive(0.25, 0.9, 1.0); lathe(ctx, [[0.29, y(0.975)], [0, y(0.975)]], n); ctx.emissive(null); }
  ctx.albedo(null); ctx.emissive(null);
}

export function collider(ctx) {
  const g = P0(ctx.params || {}), h = g.h, N = 48, o = [0, h / 2, 0];
  for (let i = 0; i < N; i++) { // the walkable top, out to the wall's outer face
    const a0 = i / N * TAU, a1 = (i + 1) / N * TAU, [x0, z0] = ell(g, a0, g.t / 2), [x1, z1] = ell(g, a1, g.t / 2);
    T(ctx, [0, h, 0], [x0, h, z0], [x1, h, z1], [0, h - 1, 0]);
    if (inGate(g, (x0 + x1) / 2, (z0 + z1) / 2, 0.15)) continue;
    Q(ctx, [x0, -0.3, z0], [x1, -0.3, z1], [x1, h, z1], [x0, h, z0], o);
  }
  for (const gn of g.gates) {
    const d = DIR[gn], R = axisR(g, d, g.t / 2);
    gbox(ctx, d, R - 0.05, R + 0.36, -g.gw, g.gw, -0.3, h - 0.15);
    gbox(ctx, d, R + 0.34, R + 0.7, -g.gw, g.gw, -0.3, h - 0.3);
    for (const s of [-1, 1]) { const vc = s * (g.gw + PIER / 2), uc = ringAt(g, d, vc); gbox(ctx, d, uc - g.t / 2 - 0.05, uc + g.t / 2 + 0.05, vc - PIER / 2, vc + PIER / 2, -0.3, h + 0.28); }
  }
  obox(ctx, 0, h, 0, 0.84, 1.0, 0.84);
}
