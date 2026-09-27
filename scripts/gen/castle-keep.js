// The castle keep: a round stone tower of five floors over the lake, a spiral stair in its heart,
// a second stair curling up the outside to the battlements. Origin = the keep's centre at the ground-floor level.
// Angles: x = cos a, z = sin a (degrees). Every number lives in scripts/lib/data/castle.js.
import { KEEP as K } from "../lib/data/castle.js";

const D = Math.PI / 180;
const P = (r, a, y) => [Math.cos(a * D) * r, y, Math.sin(a * D) * r];
function q(ctx, a, b, c, d, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
  if (cx * n[0] + cy * n[1] + cz * n[2] >= 0) ctx.quad(...a, ...b, ...c, ...d); else ctx.quad(...d, ...c, ...b, ...a);
}
const radial = (a, s = 1) => [Math.cos(a * D) * s, 0, Math.sin(a * D) * s];
const tangent = (a, s = 1) => [-Math.sin(a * D) * s, 0, Math.cos(a * D) * s];
const UP = [0, 1, 0], DOWN = [0, -1, 0];

// an annulus slab piece: top at y, thickness t
function ringSlab(ctx, r0, r1, a0, a1, y, t, sides = true) {
  const n0 = P(r0, a0, y), n1 = P(r0, a1, y), o0 = P(r1, a0, y), o1 = P(r1, a1, y), m = (a0 + a1) / 2;
  q(ctx, n0, n1, o1, o0, UP);
  if (t > 0) {
    const b = (p) => [p[0], p[1] - t, p[2]];
    q(ctx, b(n0), b(n1), b(o1), b(o0), DOWN);
    if (sides) { q(ctx, o0, o1, b(o1), b(o0), radial(m)); if (r0 > 0.01) q(ctx, n0, n1, b(n1), b(n0), radial(m, -1)); }
  }
}
// a wall piece between radii ri..ro, angles a0..a1, heights y0..y1 (faces out and in)
function wallPiece(ctx, ri, ro, a0, a1, y0, y1) {
  const m = (a0 + a1) / 2;
  q(ctx, P(ro, a0, y0), P(ro, a1, y0), P(ro, a1, y1), P(ro, a0, y1), radial(m));
  q(ctx, P(ri, a0, y0), P(ri, a1, y0), P(ri, a1, y1), P(ri, a0, y1), radial(m, -1));
}
function jamb(ctx, ri, ro, a, y0, y1, facing) {
  q(ctx, P(ri, a, y0), P(ro, a, y0), P(ro, a, y1), P(ri, a, y1), tangent(a, facing));
}

// the openings of the shell: each { a (centre deg), w (deg), y0, y1 }
export function openings() {
  const list = [];
  for (const o of K.doors) list.push({ a: o.a, w: o.w, y0: 0, y1: o.h, door: true });
  for (let f = 0; f < K.floors; f++) for (const a of K.windows[f]) list.push({ a, w: K.windowW, y0: f * K.floorH + K.sill, y1: f * K.floorH + K.sill + K.windowH });
  return list;
}
const within = (a, o) => { let d = ((a - o.a) % 360 + 540) % 360 - 180; return Math.abs(d) < o.w / 2 - 1e-6; };

function shell(ctx, detail, collide) {
  const N = K.segments, step = 360 / N, top = K.floors * K.floorH, ops = openings();
  for (let i = 0; i < N; i++) {
    const a0 = i * step, a1 = a0 + step, m = a0 + step / 2;
    const holes = ops.filter((o) => within(m, o)).sort((x, y) => x.y0 - y.y0);
    let y = -K.footing;
    for (const h of holes) {
      if (h.y0 > y) wallPiece(ctx, K.ri, K.r, a0, a1, y, h.y0);
      // sill and lintel reveals
      if (h.y0 > 0) ringSlab(ctx, K.ri, K.r, a0, a1, h.y0, 0);
      q(ctx, P(K.ri, a0, h.y1), P(K.ri, a1, h.y1), P(K.r, a1, h.y1), P(K.r, a0, h.y1), DOWN);
      if (!collide && !h.door && detail) { ctx.color(K.glass, 0.28); ctx.albedo(null); const g = (K.ri + K.r) / 2; q(ctx, P(g, a0, h.y0), P(g, a1, h.y0), P(g, a1, h.y1), P(g, a0, h.y1), radial(m)); ctx.albedo(K.stoneTex); ctx.color(K.stone); }
      y = h.y1;
      // jambs where the neighbour is solid
      if (!ops.some((o) => o === h && within(m - step, o))) jamb(ctx, K.ri, K.r, a0, h.y0, h.y1, 1);
      if (!ops.some((o) => o === h && within(m + step, o))) jamb(ctx, K.ri, K.r, a1, h.y0, h.y1, -1);
    }
    wallPiece(ctx, K.ri, K.r, a0, a1, y, top);
    // wall top, parapet and merlons
    const gap = within(m, { a: K.outer.endA, w: K.outer.gapW });
    if (gap) { ringSlab(ctx, K.ri, K.r, a0, a1, top, 0); continue; }
    wallPiece(ctx, K.ri + 0.25, K.r, a0, a1, top, top + K.parapet);
    ringSlab(ctx, K.ri, K.ri + 0.25, a0, a1, top, 0);
    if (!collide) {
      const merlon = i % 2 === 0;
      const ph = top + K.parapet + (merlon ? K.merlon : 0);
      if (merlon) { wallPiece(ctx, K.ri + 0.25, K.r, a0, a1, top + K.parapet, ph); jamb(ctx, K.ri + 0.25, K.r, a0, top + K.parapet, ph, -1); jamb(ctx, K.ri + 0.25, K.r, a1, top + K.parapet, ph, 1); }
      ringSlab(ctx, K.ri + 0.25, K.r, a0, a1, ph, 0);
    } else ringSlab(ctx, K.ri + 0.25, K.r, a0, a1, top + K.parapet, 0);
    if (gap) continue;
  }
  // gap cheeks in the parapet where the outer stair arrives
  for (const s of [-1, 1]) { const a = K.outer.endA + s * K.outer.gapW / 2; jamb(ctx, K.ri + 0.25, K.r, a, top, top + K.parapet + (collide ? 0 : K.merlon), s); }
  // a string course band every floor, outside
  if (!collide && detail) {
    for (let f = 1; f <= K.floors; f++) {
      const y = f * K.floorH - 0.25;
      for (let i = 0; i < N; i++) { const a0 = i * step, a1 = a0 + step; if (within(a0 + step / 2, { a: K.outer.endA, w: 0 })) continue; ringSlab(ctx, K.r, K.r + 0.14, a0, a1, y + 0.22, 0.22); }
    }
  }
}

function floors(ctx, collide) {
  const N = K.segments, step = 360 / N;
  for (let f = 0; f <= K.floors; f++) {
    const y = f * K.floorH, r0 = f === 0 ? 0 : K.shaft;
    for (let i = 0; i < N; i++) ringSlab(ctx, r0, K.ri + (f === K.floors ? 0.001 : 0), i * step, (i + 1) * step, y, collide ? 0 : (f === 0 ? K.footing : K.slab));
  }
}
// the rail round the stairwell on every upper floor, open where the stair arrives
function wellRail(ctx, collide) {
  const N = K.segments, step = 360 / N;
  for (let f = 1; f <= K.floors; f++) {
    const y = f * K.floorH;
    for (let i = 0; i < N; i++) {
      const a0 = i * step, a1 = a0 + step, m = a0 + step / 2;
      const d = ((m - K.inner.startA) % 360 + 360) % 360;
      if (d < K.inner.exitAfter || d > 360 - K.inner.exitBefore) continue;
      if (collide) { wallPiece(ctx, K.shaft + 0.02, K.shaft + 0.12, a0, a1, y, y + 1.05); continue; }
      wallPiece(ctx, K.shaft + 0.02, K.shaft + 0.12, a0, a1, y + 0.92, y + 1.02); ringSlab(ctx, K.shaft + 0.02, K.shaft + 0.12, a0, a1, y + 1.02, 0.1, false);
      if (i % 2 === 0) wallPiece(ctx, K.shaft + 0.04, K.shaft + 0.1, a0, a0 + step * 0.25, y, y + 0.92);
    }
  }
}
// a helical stair: steps from r0..r1 starting at angle a0, height y0, climbing rise per step over dA per step
function helix(ctx, H, collide, detail) {
  const { r0, r1, a0, y0, steps, dA, rise, thick } = H;
  for (let k = 0; k < steps; k++) {
    const A0 = a0 + k * dA, A1 = A0 + dA, y = y0 + (k + 1) * rise;
    if (collide) {
      // a ramp that meets each step's nose: walkable, no ledges to catch
      const ya = y0 + k * rise + rise * 0.5, yb = ya + rise;
      q(ctx, P(r0, A0, ya), P(r0, A1, yb), P(r1, A1, yb), P(r1, A0, ya), UP);
      if (H.rail) { q(ctx, P(r1, A0, ya), P(r1, A1, yb), P(r1, A1, yb + 1.1), P(r1, A0, ya + 1.1), radial(A0 + dA / 2, -1)); }
      continue;
    }
    ringSlab(ctx, r0, r1, A0, A1, y, thick);
    q(ctx, P(r0, A0, y), P(r1, A0, y), P(r1, A0, y - thick), P(r0, A0, y - thick), tangent(A0, -1));
    q(ctx, P(r0, A1, y), P(r1, A1, y), P(r1, A1, y - thick), P(r0, A1, y - thick), tangent(A1, 1));
    if (H.rail && detail) {
      // a low stone balustrade on the open edge, stepping with the treads
      const rr = r1 - 0.14;
      wallPiece(ctx, rr, r1, A0, A1, y, y + 0.95); ringSlab(ctx, rr - 0.02, r1 + 0.02, A0, A1, y + 1.02, 0.07, true);
      q(ctx, P(rr, A1, y), P(r1, A1, y), P(r1, A1, y + 0.95), P(rr, A1, y + 0.95), tangent(A1, 1));
    }
  }
}
function column(ctx) {
  const N = 12, h = K.floors * K.floorH + 1.2, r = K.inner.r0;
  for (let i = 0; i < N; i++) { const a0 = i * 30, a1 = a0 + 30; q(ctx, P(r, a0, 0), P(r, a1, 0), P(r, a1, h), P(r, a0, h), radial(a0 + 15)); }
}
function innerStair() { const I = K.inner, per = Math.round(K.floorH / K.rise); return { r0: I.r0, r1: I.r1, a0: I.startA, y0: 0, steps: per * K.floors, dA: 360 / per, rise: K.floorH / per, thick: 0.22 }; }
function outerStair() { const O = K.outer, total = K.floors * K.floorH + K.footing * 0 + O.startDrop, n = Math.round(total / K.rise); return { r0: K.r + 0.02, r1: O.r1, a0: O.endA - O.turns * 360, y0: -O.startDrop, steps: n, dA: O.turns * 360 / n, rise: total / n, thick: 0.4, rail: true }; }

export function geometry(ctx) {
  const lod = Number(ctx.lod ?? 1), detail = lod <= 2;
  ctx.flat(); ctx.roughness(0.93);
  ctx.albedo(K.stoneTex); ctx.color(K.stone);
  if (lod >= 4) {
    // far: the drum, its battlement ring and the stair band
    const N = 16, top = K.floors * K.floorH;
    for (let i = 0; i < N; i++) { const a0 = i * 22.5, a1 = a0 + 22.5; wallPiece(ctx, K.ri, K.r, a0, a1, -K.footing, top + K.parapet + 0.4); ringSlab(ctx, K.ri, K.r, a0, a1, top + K.parapet + 0.4, 0); }
    return;
  }
  shell(ctx, detail, false);
  ctx.albedo(K.floorTex); ctx.color(K.wood);
  floors(ctx, false);
  ctx.albedo(K.stepTex); ctx.color(K.stepStone);
  helix(ctx, innerStair(), false, detail);
  helix(ctx, outerStair(), false, detail);
  column(ctx);
  ctx.albedo(null); ctx.color(K.iron); ctx.metalness(0.6); ctx.roughness(0.5);
  wellRail(ctx, false);
}
export function collider(ctx) {
  shell(ctx, false, true);
  floors(ctx, true);
  wellRail(ctx, true);
  helix(ctx, innerStair(), true);
  helix(ctx, outerStair(), true);
  column(ctx);
}
