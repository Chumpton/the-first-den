// Turns the windmill's sail child (state.sails = its id) slowly about its axle; state.degPerSec sets the pace.
export const updateSchedule = { every: 2 };
export function update(ctx) {
  const id = ctx.self.state?.sails, s = id && ctx.getObject(id);
  if (!s) { ctx.sleep(5); return; }
  const deg = (ctx.now() / 1000) * (ctx.self.state.degPerSec ?? 16);
  s.rotation = { yaw: 0, pitch: 0, roll: -(deg % 360) };
}
