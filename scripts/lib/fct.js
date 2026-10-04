// Floating combat text, WoW-style: combat scripts call fct(); the number rides a uiEvent to the players who should
// read it, and the HUD (scripts/bend-hud.js: fctPush / fctLayer) draws it pinned to the struck thing's head.
// kind: 'spell' yellow outgoing · 'dot' orange tick · 'melee' white · 'heal' green · 'taken' red incoming ·
//       'miss' grey status (Miss, Evade, Immune, Absorb) · 'resource' blue · 'xp' violet
// opts: { to: playerId } = that player alone; else { at: position } = everyone within 45 m. crit pops it big. y = metres over the feet.
export function fct(ctx, anchor, text, kind, opts = {}) {
  const audience = opts.to ? { player: opts.to } : opts.at ? { nearby: opts.at, radius: 45 } : 'all';
  ctx.emit('uiEvent', { name: 'fct', payload: { a: anchor, t: String(text), k: kind, c: !!opts.crit, y: opts.y ?? 1.45 } }, { audience });
}
