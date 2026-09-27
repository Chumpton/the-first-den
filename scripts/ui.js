// The den's HUD: empty unless you ride the jade dragon, then one compact line at the bottom centre.
export default function (ctx, player) {
  const c = player?.controlling;
  if (player?.state?.deleteMode) return `<div style="position:fixed;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border:2px solid #ff6b5b;border-radius:50%;pointer-events:none"></div><div style="position:fixed;left:50%;top:22px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(120,24,18,.8);border:1px solid rgba(255,160,150,.5);color:#fff1ee;font-family:Georgia,serif;font-size:14px">delete mode · look at a thing · 9 removes it · 8 exits</div>`;
  if (!c || c.state?.kind !== 'dragon') return '';
  const landing = c.state?.mode === 'land';
  const line = landing ? 'landing…' : 'W fly · mouse steer · space up · shift down · E land';
  return `<div style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(29,23,18,.72);border:1px solid rgba(242,230,207,.3);color:#f7eedd;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:.02em;white-space:nowrap">${line}</div>`;
}
