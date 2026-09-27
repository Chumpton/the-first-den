// The den's HUD: empty unless you ride the jade dragon, then one compact line at the bottom centre.
import SEC from './lib/data/secrets.js';
function secretHint(player) {
  const f = player?.feetPosition; if (!f || player.controlling) return '';
  const found = Array.isArray(player.state?.secrets) ? player.state.secrets : [];
  for (const [k, [x, y, z]] of Object.entries(SEC.at)) {
    if (Math.hypot(f.x - x, f.z - z) > SEC.near || Math.abs(f.y - y) > 2.2) continue;
    const done = found.includes(k);
    return `<div style="position:fixed;left:50%;top:58%;transform:translateX(-50%);pointer-events:none;display:flex;align-items:center;gap:10px;padding:7px 16px 7px 8px;border-radius:999px;background:rgba(40,28,10,.72);border:1px solid rgba(255,214,120,.55);box-shadow:0 0 18px rgba(255,200,90,.45);color:#fff2cf;font-family:Georgia,serif;font-size:15px;white-space:nowrap"><span style="display:inline-flex;width:26px;height:26px;border-radius:50%;align-items:center;justify-content:center;background:#ffd46a;color:#3a2508;font-weight:700;font-family:system-ui">E</span>${done ? 'a secret you found' : 'something hidden here ✦'}</div>`;
  }
  return '';
}
function secretCount(player) {
  const n = Array.isArray(player?.state?.secrets) ? player.state.secrets.length : 0;
  return n ? `<div style="position:fixed;left:18px;bottom:18px;pointer-events:none;padding:5px 12px;border-radius:999px;background:rgba(40,28,10,.55);color:#ffe7a8;font-family:Georgia,serif;font-size:13px">✦ ${n}/${SEC.total} secrets</div>` : '';
}
export default function (ctx, player) {
  const hud = secretHint(player) + secretCount(player);
  const c = player?.controlling;
  if (player?.state?.deleteMode) return `<div style="position:fixed;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border:2px solid #ff6b5b;border-radius:50%;pointer-events:none"></div><div style="position:fixed;left:50%;top:22px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(120,24,18,.8);border:1px solid rgba(255,160,150,.5);color:#fff1ee;font-family:Georgia,serif;font-size:14px">delete mode · look at a thing · 9 removes it · 8 exits</div>`;
  if (c?.state?.kind === 'purple-dragon') {
    const back = c.state?.phase === 'home' || c.state?.phase === 'land';
    return hud + `<div style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(36,20,48,.72);border:1px solid rgba(214,190,255,.35);color:#f3eaff;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:.02em;white-space:nowrap">${back ? 'Violet is taking you home…' : 'Violet is flying you round the grounds · mouse looks · E or space: head home'}</div>`;
  }
  if (!c || c.state?.kind !== 'dragon') return hud;
  const landing = c.state?.mode === 'land';
  const line = landing ? 'landing…' : 'W fly · mouse steer · space up · shift down · E land';
  return `<div style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(29,23,18,.72);border:1px solid rgba(242,230,207,.3);color:#f7eedd;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:.02em;white-space:nowrap">${line}</div>`;
}
