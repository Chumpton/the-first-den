// A wild mushroom cluster: E picks it (the den's press system rings ears.press), the presser's
// player.state.mushrooms counts it by kind, and it regrows after its kind's respawn time. No update loop.
import { MUSHROOMS as M } from './lib/data/mushrooms.js';
const pop = (c) => `fx
pop spores burst=14..20 life=.6..1.1 v=up(.5..1.1)+sdir()*(.3..0.7) size=.03..0.06 acc=buoy(.25)+drag(1.8) col=<${c.join(',')}> a=0>.1:.9>.6:.5>0 sz=$size r=sprite(soft-disc,add)
pop bits burst=6..9 life=.5..0.9 v=up(1.2..2)+sdir()*(.6..1.1) size=.04..0.08 spin=-8..8 acc=grav()*.7+drag(1) col=<.42,.5,.24>..<.62,.42,.2> a=1>.7:1>0 sz=$size rot=$age*$spin floor=stick r=sprite(stalk,alpha,velocity,.02)`;
export const ears = {
  press: (ctx, { by } = {}) => {
    const s = ctx.self, st = s.state, K = M.kinds[st.kind];
    if (st.picked || !K) return;
    st.picked = true;
    s.tags = (s.tags || []).filter((t) => t !== 'interactable');
    const p = by && ctx.getObject(by);
    if (p) { const old = p.state.mushrooms || {}; p.state.mushrooms = { ...old, [st.kind]: (old[st.kind] || 0) + 1 }; }
    const at = s.worldFeetPosition || s.feetPosition;
    ctx.emit('fx', { position: { x: at.x, y: at.y + 0.12, z: at.z }, script: pop(K.rgb) });
    ctx.emit('playSound', { clip: M.sound.pluck, position: at, volume: M.sound.volume, pitch: M.sound.pitchMin + ctx.random() * (M.sound.pitchMax - M.sound.pitchMin), maxDistance: M.sound.maxDistance });
    ctx.emit('damageNumber', { position: { x: at.x, y: at.y + M.label.rise, z: at.z }, text: `+1 ${K.name}`, color: K.css, size: M.label.size, lifetime: M.label.lifetime });
    if (K.rare && by) ctx.emit('screenFlash', { color: K.css, duration: M.flash.duration, intensity: M.flash.intensity }, { audience: { player: by } });
    ctx.after(M.hideDelay, 'vanish');
    const [a, b] = K.respawn;
    ctx.after(a + ctx.random() * (b - a), 'regrow');
  },
};
export function vanish(ctx) { ctx.self.visible = false; if (ctx.self.fx) ctx.self.fx = null; }
export function regrow(ctx) {
  const s = ctx.self, K = M.kinds[s.state.kind];
  s.state.picked = false; s.visible = true;
  if (!(s.tags || []).includes('interactable')) s.tags = [...(s.tags || []), 'interactable'];
  if (K?.mote) s.fx = { script: M.moteFx };
}
