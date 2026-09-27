// Player side of the alchemy bench: the brew panel's buttons (sendAction('brew', { kind })) spend harvest and set one buff.
import { ALCHEMY as A } from './lib/data/alchemy.js';
const SND = '/cdn/moodboard-lowpoly-cozy/';
const params = (c) => ({ r: c[0], g: c[1], b: c[2] });
function aura(me, b) { me.fx = { script: A.fx[b.kind], params: params(b.color) }; }
function brew(ctx, kind) {
  const r = A.recipes[kind], me = ctx.self, st = me.state;
  if (!r) return;
  const have = st.harvest ?? 0;
  if (have < r.cost) {
    st.alchemyToast = { text: A.short, at: ctx.now() };
    ctx.emit('playSound', { clip: SND + 'sfx-soft-empty-bottle-clunk.mp3', position: me.feetPosition, volume: 0.4 });
    return;
  }
  st.harvest = have - r.cost;
  const color = kind === 'dye' ? A.dyes[Math.floor(ctx.random() * A.dyes.length) % A.dyes.length] : r.color;
  const b = { kind, name: r.name, color, until: ctx.now() + r.seconds * 1000 };
  st.buff = b; st.buffLeft = r.seconds;
  st.speedMul = kind === 'swift' ? A.swiftMul : 1;
  aura(me, b);
  st.alchemyOpen = false;
  st.alchemyToast = { text: `${r.name} brewed`, at: ctx.now() };
  const bench = ctx.getObject(A.bench), bp = bench?.worldFeetPosition;
  const at = bp ? { x: bp.x, y: bp.y + 1.2, z: bp.z + 0.1 } : { ...me.feetPosition, y: me.feetPosition.y + 1.2 };
  ctx.emit('playSound', { clip: SND + 'sfx-potion-brew-bubble-pop.mp3', position: at, volume: 0.6 });
  ctx.emit('fx', { position: at, script: A.fx.sparkle, params: params(color) });
}
export function onInput(ctx, input) {
  const st = ctx.self.state;
  if (input.pressed?.brew) {
    const kind = input.actionData?.brew?.kind;
    if (kind === 'close') st.alchemyOpen = false; else brew(ctx, kind);
  }
  if (st.alchemyOpen && input.pressed?.travelClose) st.alchemyOpen = false;
}
export const updateSchedule = { every: { seconds: 0.5 } };
export function update(ctx) {
  const me = ctx.self, st = me.state, now = ctx.now(), b = st.buff;
  if (b) {
    const left = Math.max(0, Math.ceil((b.until - now) / 1000));
    if (left <= 0) { st.buff = null; st.buffLeft = 0; st.speedMul = 1; me.fx = null; }
    else { if (st.buffLeft !== left) st.buffLeft = left; if (!me.fx) aura(me, b); }
  } else if (st.speedMul && st.speedMul !== 1) st.speedMul = 1;
  if (st.alchemyToast && now - st.alchemyToast.at > 3500) st.alchemyToast = null;
  if (st.alchemyOpen) {
    const bp = ctx.getObject(A.bench)?.worldFeetPosition, p = me.feetPosition;
    if (!bp || Math.hypot(bp.x - p.x, bp.z - p.z) > A.reach) st.alchemyOpen = false;
  }
}
