// Sage's flight path: the closed circuit in sage.yml smoothed by builtin/path, an entry/exit slide from the forest edge,
// and pose() — heading, pitch and a bank from lateral acceleration (the sky-dragons math). s = metres flown this flight.
import { createPath } from 'builtin/path';
import SAGE from './data/sage.yml';
const R = Math.PI / 180, TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let LOOP = null, C = null;
function loop() {
  if (LOOP) return LOOP;
  LOOP = createPath(SAGE.route.map(([x, a, z]) => [x, a, z]), { closed: true, smooth: true, spacing: 1 });
  C = { x: 0, z: 0 }; for (const [x, , z] of SAGE.route) { C.x += x / SAGE.route.length; C.z += z / SAGE.route.length; }
  return LOOP;
}
export const routeLength = () => loop().length;
export function at(ctx, s, total) {
  const P = loop(), L = P.length, q = P.at(((s % L) + L) % L), E = SAGE.enter;
  const f = Math.max(1 - sm(0, E.blend, s), sm(total - E.blend, total, s));
  const ox = q.x - C.x, oz = q.z - C.z, h = Math.hypot(ox, oz) || 1;
  const x = q.x + (ox / h) * E.out * f, z = q.z + (oz / h) * E.out * f;
  const g = Math.max(SAGE.seaLevel, ctx.place.terrain.heightAt(x, z) ?? 0);
  const alt = clamp((q.y ?? 5) + SAGE.bob.amp * Math.sin((s / SAGE.bob.len) * TAU), SAGE.alt[0], SAGE.alt[1]);
  return { x, y: g + alt + E.rise * f, z };
}
export function pose(ctx, s, total) {
  const dt = 0.25, e = SAGE.speed * dt, a = at(ctx, s, total), b = at(ctx, s + e, total), c = at(ctx, s - e, total);
  const dx = b.x - c.x, dy = b.y - c.y, dz = b.z - c.z, h = Math.hypot(dx, dz) || 1, ux = dx / h, uz = dz / h;
  const lat = ((b.x + c.x - 2 * a.x) * uz + (b.z + c.z - 2 * a.z) * -ux) / (dt * dt);
  const roll = clamp((Math.atan2(lat, 9.8) / R) * SAGE.bank, -SAGE.maxBank, SAGE.maxBank);
  return { pos: a, rot: { yaw: Math.atan2(-dx, -dz) / R, pitch: Math.atan2(dy, h * 2) / R, roll } };
}
