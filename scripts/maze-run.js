// The maze's two triggers (state.role): "gate" starts your clock as you walk in; "heart" stops it at the giant sunflower.
export function onTriggerEnter(ctx, other) {
  if (!other || !other.userId) return;
  const now = ctx.now(), p = other.feetPosition;
  if (ctx.self.state.role === 'gate') {
    if (!other.state.mazeAt) ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2, z: p.z }, text: 'find the heart of the maze', color: '#ffe08a', size: 0.8, lifetime: 2.5 }, { audience: { player: other.id } });
    other.state.mazeAt = now; return;
  }
  const at = other.state.mazeAt; if (!at) return;
  const secs = Math.round((now - at) / 100) / 10, best = other.state.mazeBest;
  other.state.mazeAt = null;
  if (!best || secs < best) other.state.mazeBest = secs;
  const m = Math.floor(secs / 60), s = (secs % 60).toFixed(1).padStart(4, '0');
  ctx.emit('damageNumber', { position: { x: p.x, y: p.y + 2.2, z: p.z }, text: `the heart! ${m}:${s}${!best || secs < best ? ' · best' : ` · best ${best}s`}`, color: '#ffd24a', size: 1.2, lifetime: 4 });
  ctx.emit('playSound', { clip: '/cdn/moodboard-lowpoly-cozy/sfx-maze-heart-reached-bright-fanfare-bells.mp3', position: p, volume: 0.8, maxDistance: 30 });
}
