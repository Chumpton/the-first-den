// Compost corner: the drum child turns slowly for ever; E gives it a hearty spin, a squelch and a puff of soil.
import { animate } from 'builtin/tween';
const DRUM = () => 'compost-corner/drum';
function idle(ctx) { const d = ctx.getObject(DRUM()); if (d) animate(ctx, d, { 'rotation.pitch': [0, 90, 180, 270, 360] }, { duration: 36, easing: 'linear', loop: true }); }
export function onSpawn(ctx) { idle(ctx); }
export function resume(ctx) { idle(ctx); ctx.self.state.spinning = false; }
export const ears = {
  press: (ctx) => {
    if (ctx.self.state.spinning) return;
    const d = ctx.getObject(DRUM());
    if (!d) return;
    ctx.self.state.spinning = true;
    animate(ctx, d, { 'rotation.pitch': [0, 200, 400, 560, 680, 720] }, { duration: 2.6, easing: 'easeOutCubic' });
    const at = d.worldFeetPosition;
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-compost-tumbler-squelch-churn.mp3', position: at, volume: 0.6 });
    ctx.emit('fx', { position: { x: at.x, y: at.y + 0.4, z: at.z }, script: `fx
pop clod burst=10..14 life=.6..1 v=up(1.2..2)+sdir()*(.5..1) size=.04..0.08 spin=-6..6 acc=grav() col=<.3,.22,.14> a=1 sz=$size rot=$age*$spin floor=stick r=sprite(chip,alpha)` });
    ctx.after(2.7, 'resume');
  },
};
