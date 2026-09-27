// E at the alchemy bench opens the brew panel for the presser; scripts/alchemy-player.js brews, scripts/ui.js draws the panel.
export const ears = {
  press: (ctx, { by }) => {
    const p = ctx.getObject(by);
    if (!p) return;
    p.state.alchemyOpen = true;
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-glass-bottles-clink-soft.mp3', position: ctx.self.worldFeetPosition, volume: 0.5 });
  },
};
