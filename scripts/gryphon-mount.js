// The rider's half of Wynx. Z (or a double-tap of space into flight) calls her under you: on the ground she walks and bounds
// (player.js holds you at her saddle height), aloft she hovers, flies, and after a moment of straight flight tucks her wings
// and speeds (state.flyBoost). Z again and you hop off: she stands beside you and from then on trails you (scripts/wynx.js).
// state.riding = 'gryphon' seats the body (humanoid-locomotion's ride pose).
import { GRY } from './lib/data/gryphon.js';
import { FEATHERS, DUST, setMode, yawOf } from './lib/wynx-kit.js';

const W = (ctx) => (ctx.session.gry ??= { id: null, fwd: 0 });
function findWynx(ctx) {
  const w = W(ctx), me = ctx.self;
  const had = w.id && ctx.getObject(w.id);
  if (had && had.tags?.includes('wynx')) return had;
  if (had) { ctx.destroy(w.id); w.id = null; } // a gryphon from before Wynx had a name
  const row = ctx.query({ tags: ['wynx'], radius: 5000 }).find((r) => r.state?.owner === me.id);
  w.id = row ? row.id : null;
  return row ? ctx.getObject(row.id) : null;
}

function isRobot(me) {
  if (!me) return false;
  return me.displayName === 'wunix' || me.name === 'wunix' || me.state?.displayName === 'wunix' || me.id?.includes('wunix');
}

function mount(ctx) {
  if (isRobot(ctx.self)) return;
  const me = ctx.self, w = W(ctx), p = me.feetPosition;
  let g = findWynx(ctx);
  const far = !g || Math.hypot(g.feetPosition.x - p.x, g.feetPosition.z - p.z) > 6;
  if (!g) {
    w.id = ctx.spawn({
      tags: ['gryphon', 'wynx'], scope: 'session', parent: me.id,
      feetPosition: { x: 0, y: GRY.y, z: 0 }, rotation: 0,
      primitive: { kind: 'scripted', script: 'scripts/gen/gryphon.js' },
      behavior: 'scripts/wynx.js',
      state: { owner: me.id, ridden: true },
      children: [{ id: 'tag', visible: false, feetPosition: { x: 0, y: 1.45, z: -0.7 }, visibleRange: { max: 45 },
        ui: `<div facing="player" width="1.4m" style="text-align:center;font-family:Cinzel,Georgia,serif;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,0 0 6px #000">
          <div style="font-size:150px;font-weight:700;color:#7dff6a;line-height:1">${GRY.name}</div>
          <div style="font-size:84px;color:#f2e6cf;line-height:1.2">&lt;${(me.displayName || 'your').replace(/[<>&"]/g, '')}'s gryphon&gt;</div></div>` }],
    });
    g = ctx.getObject(w.id);
  } else {
    g.parent = me.id; g.feetPosition = { x: 0, y: GRY.y, z: 0 }; g.rotation = 0; g.state.ridden = true; g.state.mode = null;
    const tag = ctx.getObject(`${w.id}/tag`); if (tag) tag.visible = false;
  }
  me.state.riding = 'gryphon'; w.fwd = 0;
  if (far) {
    ctx.emit('fx', { position: { x: p.x, y: p.y + 0.6, z: p.z }, script: FEATHERS });
    ctx.emit('playSound', { clip: GRY.sounds.summon, position: p, volume: 0.6, maxDistance: 45 });
  }
}

function dismount(ctx) {
  const me = ctx.self, w = W(ctx), g = findWynx(ctx);
  me.state.riding = null; me.state.flyBoost = false; me.state.flying = false;
  if (!g) return;
  const p = me.feetPosition, yaw = yawOf(me.rotation), r = yaw * Math.PI / 180;
  const x = p.x + Math.cos(r) * GRY.side, z = p.z - Math.sin(r) * GRY.side;
  const gy = (ctx.place.terrain.heightAt(x, z) ?? p.y) + GRY.paws;
  g.parent = null; g.feetPosition = { x, y: Math.max(gy, p.y), z }; g.rotation = { yaw };
  g.state.ridden = false; g.state.mode = null;
  setMode(ctx, g, p.y - gy > 1 ? 'hover' : 'landed');
  const tag = ctx.getObject(`${w.id}/tag`); if (tag) tag.visible = true;
  ctx.emit('fx', { position: { x, y: gy - GRY.paws, z }, script: DUST });
  ctx.emit('playSound', { clip: GRY.sounds.land, position: { x, y: gy, z }, volume: 0.5, maxDistance: 35 });
}

export function onInput(ctx, input) {
  if (isRobot(ctx.self)) return;
  if (!input.pressed?.[GRY.action]) return;
  const me = ctx.self;
  if (me.state.riding === 'gryphon') dismount(ctx);
  else if (!me.parent && !me.state.mountedOn) mount(ctx);
}

export function update(ctx, dt) {
  const me = ctx.self, w = W(ctx), s = me.state;
  if (isRobot(me)) {
    // the fox never rides: clear any old gryphon once, then rest (the body's row moves every tick and would wake us)
    if (w.foxClean) { ctx.sleep(60); return; }
    w.foxClean = true;
    if (w.id && ctx.getObject(w.id)) { ctx.destroy(w.id); w.id = null; }
    const row = ctx.query({ tags: ['wynx'], radius: 5000 }).find((r) => r.state?.owner === me.id);
    if (row && ctx.getObject(row.id)) ctx.destroy(row.id);
    if (s.riding) s.riding = null;
    ctx.sleep(60);
    return;
  }
  const riding = s.riding === 'gryphon';
  if (!riding) {
    if (s.flying && !me.parent) { mount(ctx); return; }
    ctx.sleep(0.25); return;
  }
  if (me.parent) { dismount(ctx); return; }
  const g = findWynx(ctx);
  if (!g || g.parent?.id !== me.id) { mount(ctx); return; }
  const v = me.velocity ?? { x: 0, y: 0, z: 0 }, sp = Math.hypot(v.x || 0, v.z || 0);
  if (!s.flying) {
    if (s.flyBoost) s.flyBoost = false;
    w.fwd = 0;
    setMode(ctx, g, sp > 6 ? 'run' : sp > 0.6 ? 'walk' : 'landed');
    return;
  }
  const hands = ctx.session.wowHands?.[me.id];
  const forward = (hands?.mz ?? 0) > 0.3 || (hands?.orbit && hands?.steer);
  w.fwd = forward && sp > 6 ? w.fwd + dt : 0;
  const boost = w.fwd > GRY.boostAfter;
  if (boost !== !!s.flyBoost) {
    s.flyBoost = boost;
    if (boost) ctx.emit('playSound', { clip: GRY.sounds.leave, position: me.feetPosition, volume: 0.35, maxDistance: 30 });
  }
  setMode(ctx, g, boost ? 'speed' : sp < GRY.hoverBelow ? 'hover' : 'fly');
}
