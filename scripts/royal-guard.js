// A royal guard: stands his post (idle), turns to whoever presses E and answers with his name and one of his lines.
// Lines come from state.lines (per guard) so a new guard is one scene row.
export function onSpawn(ctx) { ctx.self.anim.locomotion = { clip: 'Idle', loop: 'loop', weight: 1 }; }
export const ears = {
  press: (ctx, payload) => {
    const by = payload?.by, who = by && ctx.getObject(by.id ?? by), s = ctx.self.state; if (!who) return;
    const lines = s.lines ?? ['For the crown.'], i = Math.floor(ctx.random() * lines.length), p = ctx.self.feetPosition;
    ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.5, z: p.z }, text: `${s.name}: ${lines[i]}`, color: '#ffe39a', lifetime: 3.5, size: 0.4 });
  },
};
