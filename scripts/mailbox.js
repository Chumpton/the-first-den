// A mailbox that answers E: the red flag flips up, a letter from state.letters pops over it for the presser, a paper rustle.
// Its mesh is scripts/gen/house-dressing.js (item "mailbox"); the flag is params.flag, lowered again after state.flagSeconds.
export const ears = {
  press: (ctx, { by }) => {
    const s = ctx.self.state;
    if (ctx.now() - (s.pressedAt || -5000) < 1200) return;
    s.pressedAt = ctx.now();
    const letters = s.letters?.length ? s.letters : ['a letter'];
    let i = Math.floor(ctx.random() * letters.length);
    if (letters.length > 1 && i === s.last) i = (i + 1) % letters.length;
    s.last = i;
    ctx.self.primitive.params.flag = true;
    const q = ctx.self.worldFeetPosition || ctx.self.feetPosition, at = { x: q.x, y: q.y + 1.65, z: q.z };
    ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-mailbox-letter-rustle.mp3', position: at, volume: 0.55, maxDistance: 12 });
    ctx.emit('damageNumber', { position: at, text: letters[i], color: '#ffe2a8', size: 0.8, lifetime: 2.8 }, { audience: { player: by } });
    if (s.lowerAt) ctx.cancel(s.lowerAt);
    s.lowerAt = ctx.after(s.flagSeconds ?? 5, 'lower');
  },
};
export function lower(ctx) { ctx.self.state.lowerAt = null; ctx.self.primitive.params.flag = false; }
