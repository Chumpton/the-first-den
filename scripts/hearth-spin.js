// Turns a windmill's sails about their hub (roll), slowly, at state.rpm.
export const updateSchedule = { every: 3 };
export function update(ctx) { const s = ctx.self.state; ctx.self.rotation = { yaw: s.yaw || 0, pitch: 0, roll: (ctx.now() / 1000 * (s.rpm || 4) * 6) % 360 }; }
