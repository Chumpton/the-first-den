// A Tower Gardens bed: E plants a seed you carry, E waters it (a charge from your can), each watered stage grows on a timer,
// E on a ripe bed harvests into your basket. No update(): presses and ctx.after timers only. A greenhouse bed stays wet.
import { GARDEN as G } from './lib/data/garden.js';
const KIT = 'scripts/gen/garden-plot.js';
const POP = `fx
pop leaves burst=14..20 life=.5..0.9 v=up(1.6..2.6)+sdir()*(.6..1.2) size=.05..0.09 acc=grav()*.7+drag(1.2) col=<.45,.7,.3>..<.8,.75,.3> a=1>.8:1>0 sz=$size rot=spin(6) r=sprite(soft-disc,alpha)
pop sparkle burst=10 on=sphere(.4) life=.6..1 v=up(.4..0.9) size=.04..0.07 col=hdr(2.6,2.2,.9) a=0>.2:1>0 sz=$size r=sprite(mote,add)`;
const SPLASH = `fx
pop drops burst=16..22 on=disc(.8) life=.35..0.6 v=up(.6..1.2)+sdir()*.3 size=.03..0.05 acc=grav()*.8 col=<.7,.85,.95> a=.9>0 sz=$size r=sprite(droplet,alpha,velocity,.02)`;
const GROW = `fx
pop motes burst=8 on=disc(.9) life=.7..1.1 v=up(.5..0.9) size=.03..0.05 col=hdr(1.6,2.4,1) a=0>.3:1>0 sz=$size r=sprite(mote,add)`;
const kid = (ctx, n) => ctx.getObject(ctx.self.id + '/' + n);
const top = (ctx, dy = 0.9) => { const p = ctx.self.worldFeetPosition || ctx.self.feetPosition; return { x: p.x, y: p.y + dy, z: p.z }; };
function say(ctx, text, color, by) { ctx.emit('damageNumber', { position: top(ctx, 1.3), text, color, size: 0.9, lifetime: 1.8 }, by ? { audience: { player: by } } : undefined); }
function sfx(ctx, clip, vol = 0.6) { ctx.emit('playSound', { clip, position: top(ctx, 0.5), volume: vol, maxDistance: 22 }); }
function refresh(ctx) {
  const s = ctx.self.state, c = kid(ctx, 'crop'), w = kid(ctx, 'wet'), n = kid(ctx, 'need');
  const want = s.crop ? { item: 'crop', kind: s.crop, stage: s.stage, w: s.w, d: s.d, golden: !!s.golden } : null;
  if (c) { if (want) { c.visible = true; c.primitive = { kind: 'scripted', script: KIT, params: want }; } else c.visible = false; }
  if (w) w.visible = !!s.crop && !!s.wet;
  if (n) n.visible = !!s.crop && !s.wet && s.stage < 3;
}
function schedule(ctx) { const s = ctx.self.state, k = G.crops[s.crop]; const sec = k.grow * (s.gh ? G.greenhouseSpeed : 1);
  s.growAt = ctx.now() + sec * 1000; s.timer = ctx.after(sec, 'grow', { crop: s.crop, stage: s.stage }); }
export function grow(ctx, p) {
  const s = ctx.self.state; if (!s.crop || p?.crop !== s.crop || p?.stage !== s.stage || s.stage >= 3) return;
  s.stage += 1; s.growAt = null;
  if (s.stage === 3) { s.wet = false; ctx.emit('fx', { position: top(ctx, 0.6), script: POP }); sfx(ctx, G.sfx.grow, 0.5); }
  else { ctx.emit('fx', { position: top(ctx, 0.5), script: GROW }); if (s.gh) schedule(ctx); else s.wet = false; }
  refresh(ctx);
}
export function onSpawn(ctx) {
  const s = ctx.self.state; if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable'];
  const y = 0.395;
  if (!kid(ctx, 'crop')) ctx.spawn('crop', { parent: ctx.self.id, feetPosition: { x: 0, y, z: 0 }, visible: false, physics: 'none', castShadow: false, visibleRange: { max: 70 }, primitive: { kind: 'scripted', script: KIT, params: { item: 'crop', kind: 'carrot', stage: 0, w: s.w, d: s.d } } });
  if (!kid(ctx, 'wet')) ctx.spawn('wet', { parent: ctx.self.id, feetPosition: { x: 0, y: y + 0.004, z: 0 }, visible: false, physics: 'none', castShadow: false, visibleRange: { max: 60 },
    primitive: { kind: 'plane', width: s.w - 0.16, height: s.d - 0.16 }, rotation: { pitch: -90 }, material: { color: 'oklch(0.2 0.03 50)', opacity: 0.55, transparent: true, roughness: 0.3 } });
  if (!kid(ctx, 'need')) ctx.spawn('need', { parent: ctx.self.id, feetPosition: { x: 0, y: 1.25, z: 0 }, visible: false, physics: 'none', text: { content: '💧', size: 0.4 }, visibleRange: { max: 30 } });
  // a planted bed whose timer was lost to a restart picks its growing back up
  if (s.crop && s.wet && s.stage < 3 && s.growAt && ctx.now() > s.growAt) grow(ctx, { crop: s.crop, stage: s.stage });
  refresh(ctx);
}
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state, pl = ctx.getObject(by); if (!pl) return;
    const g = pl.state.garden || {}, seeds = { ...(g.seeds || {}) };
    if (!s.crop) {
      let k = g.sel && seeds[g.sel] > 0 ? g.sel : Object.keys(seeds).find((c) => seeds[c] > 0);
      if (!k) { sfx(ctx, G.sfx.nope, 0.4); say(ctx, 'grab seeds at the seed stall', '#f2e6cf', by); return; }
      seeds[k] -= 1; pl.state.garden = { ...g, seeds, sel: k };
      s.crop = k; s.stage = 0; s.wet = false; s.golden = false; s.growAt = null;
      sfx(ctx, G.sfx.dig); say(ctx, `planted ${G.crops[k].name.toLowerCase()} · now water it`, G.crops[k].color, by); refresh(ctx); return;
    }
    const K = G.crops[s.crop];
    if (s.stage >= 3) {
      const gold = ctx.random() < G.goldenChance, n = K.yield, produce = { ...(g.produce || {}) };
      produce[s.crop] = (produce[s.crop] || 0) + n;
      pl.state.garden = { ...g, produce, golden: (g.golden || 0) + (gold ? 1 : 0), total: (g.total || 0) + n };
      const at = top(ctx, 0.5);
      ctx.spawn({ feetPosition: at, lifetime: 1.4, physics: 'none', castShadow: false, scale: gold ? 1.6 : 1.3, primitive: { kind: 'scripted', script: KIT, params: { item: 'veg', kind: s.crop, golden: gold } } });
      ctx.emit('fx', { position: at, script: POP });
      sfx(ctx, gold ? G.sfx.golden : G.sfx.harvest, 0.7);
      say(ctx, gold ? `✨ a GOLDEN ${K.name.toLowerCase()}! +${n}` : `+${n} ${K.plural}`, gold ? '#ffd24a' : K.color);
      if (gold) ctx.emit('screenFlash', { color: '#ffd24a', duration: 0.3, intensity: 0.25 }, { audience: { player: by } });
      ctx.emit('stat', { name: 'crops harvested', value: n }, { audience: { player: by } });
      s.crop = null; s.stage = 0; s.wet = false; s.growAt = null; refresh(ctx); return;
    }
    if (!s.wet) {
      if ((g.can || 0) <= 0) { sfx(ctx, G.sfx.nope, 0.4); say(ctx, 'fill your watering can at the pump', '#8fd0d6', by); return; }
      pl.state.garden = { ...g, can: g.can - 1 };
      s.wet = true; schedule(ctx);
      sfx(ctx, G.sfx.water); ctx.emit('fx', { position: top(ctx, 0.9), script: SPLASH }); refresh(ctx); return;
    }
    const left = Math.max(1, Math.ceil(((s.growAt || ctx.now()) - ctx.now()) / 1000));
    say(ctx, `${K.name.toLowerCase()} growing… ${left}s`, '#b9e08f', by);
  },
};
