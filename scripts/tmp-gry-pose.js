import { play, clips } from 'builtin/anim';
export function update(ctx) { if (ctx.self.state.on === ctx.self.state.clip) { ctx.sleep(1); return; } ctx.self.state.on = ctx.self.state.clip; play(ctx, ctx.self, clips(ctx, 'anim/gryphon.yml')[ctx.self.state.clip], { channel: 'body', loop: true }); }
