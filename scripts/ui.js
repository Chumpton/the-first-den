// The den's HUD: empty unless you ride the jade dragon, then one compact line at the bottom centre.
export default function (ctx, player) {
  const c = player?.controlling;
  if (!c || c.state?.kind !== 'dragon') return '';
  const landing = c.state?.mode === 'land';
  const line = landing ? 'landing…' : 'W fly · mouse steer · space up · shift down · E land';
  return `<div style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(29,23,18,.72);border:1px solid rgba(242,230,207,.3);color:#f7eedd;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:.02em;white-space:nowrap">${line}</div>`;
}
