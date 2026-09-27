// Tower Gardens stations: a seed crate (state.station 'seed', state.crop) hands you seeds and picks that crop to plant next;
// the pump (state.station 'pump') fills your watering can.
import { GARDEN as G } from './lib/data/garden.js';
const top = (ctx, dy) => { const p = ctx.self.worldFeetPosition || ctx.self.feetPosition; return { x: p.x, y: p.y + dy, z: p.z }; };
const WATER = `fx
pop gush burst=20 on=disc(.06) life=.4..0.7 v=<0,-1,0>*(.5..1)+sdir()*.25 size=.03..0.06 acc=grav() col=<.7,.85,.95> a=.9>0 sz=$size r=sprite(droplet,alpha,velocity,.02)`;
export function onSpawn(ctx) { if (!(ctx.self.tags || []).includes('interactable')) ctx.self.tags = [...(ctx.self.tags || []), 'interactable']; }
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state, pl = ctx.getObject(by); if (!pl) return;
    const g = pl.state.garden || {};
    if (s.station === 'pump') {
      pl.state.garden = { ...g, can: G.canMax };
      ctx.emit('playSound', { clip: G.sfx.pump, position: top(ctx, 1), volume: 0.6, maxDistance: 20 });
      ctx.emit('fx', { position: top(ctx, 0.95), script: WATER });
      ctx.emit('damageNumber', { position: top(ctx, 1.8), text: `watering can full · ${G.canMax} pours`, color: '#8fd0d6', size: 0.9, lifetime: 1.8 }, { audience: { player: by } });
      return;
    }
    const k = s.crop, K = G.crops[k]; if (!K) return;
    const seeds = { ...(g.seeds || {}) }, had = seeds[k] || 0;
    seeds[k] = Math.min(G.seedCap, had + G.seedsPerTake);
    pl.state.garden = { ...g, seeds, sel: k };
    ctx.emit('playSound', { clip: G.sfx.seeds, position: top(ctx, 0.5), volume: 0.55, maxDistance: 16 });
    ctx.emit('damageNumber', { position: top(ctx, 0.9), text: had >= G.seedCap ? `${K.name.toLowerCase()} seeds full (${G.seedCap})` : `+${seeds[k] - had} ${K.name.toLowerCase()} seeds`, color: K.color, size: 0.9, lifetime: 1.8 }, { audience: { player: by } });
  },
};
