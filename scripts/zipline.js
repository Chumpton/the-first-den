// The treehouse zip-line's trolley (row zipline-trolley, tags mount + interactable). E at the launch platform names the
// presser its rider (scripts/lib/dragon-rider.js seats them under the handle, state.seat), the trolley runs the rope
// down with gravity-like ease (slope pull minus air drag, braking over the last metres), sets the rider down in the sand
// pit (state.dropAt) with a thud and a puff of sand, then after returnDelay rolls itself back up to the A-frame.
// The rope is state.a → state.b (world) sagging ZIP.sag (data file; state.sag the fallback) at its middle; s = metres along it.
import { ZIP } from './lib/data/zipline.js';
const cache = {};
function table(st) {
  const sag = ZIP.sag ?? st.sag, k = st.a.join() + '|' + st.b.join() + '|' + sag; if (cache[k]) return cache[k];
  const N = 64, P = [], L = [0];
  for (let i = 0; i <= N; i++) { const t = i / N; P.push({ x: st.a[0] + (st.b[0] - st.a[0]) * t, y: st.a[1] + (st.b[1] - st.a[1]) * t - sag * 4 * t * (1 - t), z: st.a[2] + (st.b[2] - st.a[2]) * t });
    if (i) L.push(L[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y, P[i].z - P[i - 1].z)); }
  return (cache[k] = { P, L, total: L[N] });
}
function at(tb, s) {
  s = Math.max(0, Math.min(tb.total, s)); let i = 0; while (i < tb.L.length - 2 && tb.L[i + 1] < s) i++;
  const A = tb.P[i], B = tb.P[i + 1], seg = tb.L[i + 1] - tb.L[i] || 1, u = (s - tb.L[i]) / seg;
  return { x: A.x + (B.x - A.x) * u, y: A.y + (B.y - A.y) * u, z: A.z + (B.z - A.z) * u, sin: (B.y - A.y) / seg };
}
function put(ctx, tb, s) { const q = at(tb, s); ctx.self.feetPosition = { x: q.x, y: q.y - ZIP.hang, z: q.z }; return q; }
function land(ctx) {
  const me = ctx.self, st = me.state, d = st.drop;
  st.dropAt = d; st.rider = null; st.phase = 'landed'; st.backAt = ctx.now() + ZIP.returnDelay * 1000; st.v = 0; me.audio = null;
  if (!d) return;
  const p = { x: d.x, y: d.y + 0.1, z: d.z };
  ctx.emit('playSound', { clip: ZIP.thud, position: p, volume: 0.7, maxDistance: 25 });
  ctx.emit('fx', { position: p, script: `fx
pop dust burst=12..18 on=disc(.45) life=.6..1.1 v=up(.5..1.2)+sdir()*(.9..1.8) size=.22..0.4 acc=buoy(.2)+drag(2.2) col=<.88,.8,.62> a=0>.1:.45>.6:.2>0 sz=$size*(.6>2.1) rot=spin(.2) r=sprite(smoke-puff,alpha)
pop grit burst=14..22 on=disc(.3) life=.35..0.7 v=up(1.4..2.6)+sdir()*(.6..1.4) size=.03..0.06 acc=grav() col=<.82,.72,.52> a=1>.7:1>0 sz=$size floor=die r=sprite(grain,alpha)` });
}
export const ears = {
  press: (ctx, { by } = {}) => {
    const me = ctx.self, st = me.state;
    if (!by || (st.phase && st.phase !== 'idle')) return;
    st.rider = by; st.phase = 'ride'; st.v = ZIP.vStart; st.dropAt = null; st.s = st.s ?? ZIP.startAt;
    me.audio = { clip: ZIP.zing, gain: ZIP.zingGain, loop: true, spatial: true, maxDistance: 30 };
    ctx.emit('playSound', { clip: ZIP.release, position: me.worldFeetPosition || me.feetPosition, volume: 0.6, maxDistance: 20 });
  },
};
export function onSpawn(ctx) { const st = ctx.self.state; if (!st.phase || st.phase === 'ride') { st.phase = 'idle'; st.rider = null; st.s = ZIP.startAt; } if (st.a) put(ctx, table(st), st.s ?? ZIP.startAt); }
export function update(ctx, dt) {
  const me = ctx.self, st = me.state; if (!st.a) return ctx.sleep();
  const tb = table(st), stop = Math.min(st.sStop ?? tb.total - 2, tb.total);
  if (st.phase === 'ride') {
    if (!ctx.place.players.some((p) => p.id === st.rider)) { st.drop = st.drop; st.rider = null; st.phase = 'landed'; st.backAt = ctx.now(); me.audio = null; return; }
    const q = at(tb, st.s ?? ZIP.startAt), rem = stop - (st.s ?? 0);
    let v = (st.v ?? ZIP.vStart) + (-ZIP.g * q.sin * ZIP.grip - ZIP.drag * (st.v ?? 0) ** 2) * dt;
    v = Math.max(ZIP.landV, Math.min(ZIP.vMax, v, ZIP.landV + rem * ZIP.brakeRate + (rem > ZIP.brakeDist ? 99 : 0)));
    st.v = v; st.s = (st.s ?? ZIP.startAt) + v * dt;
    if (st.s >= stop) { st.s = stop; put(ctx, tb, stop); land(ctx); return; }
    put(ctx, tb, st.s); return;
  }
  if (st.phase === 'landed') { if (ctx.now() >= (st.backAt ?? 0)) { st.phase = 'return'; st.dropAt = null; st.v = 0; } return; }
  if (st.phase === 'return') {
    const left = (st.s ?? ZIP.startAt) - ZIP.startAt;
    st.v = Math.min(ZIP.returnSpeed, (st.v ?? 0) + 3 * dt, 0.6 + left * 1.5);
    st.s = (st.s ?? ZIP.startAt) - st.v * dt;
    if (st.s <= ZIP.startAt) { st.s = ZIP.startAt; st.phase = 'idle'; st.v = 0; put(ctx, tb, st.s);
      ctx.emit('playSound', { clip: ZIP.release, position: me.feetPosition, volume: 0.35, maxDistance: 14, pitch: 0.8 }); return; }
    put(ctx, tb, st.s); return;
  }
  ctx.sleep();
}
