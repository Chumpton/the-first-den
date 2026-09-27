// The den's HUD: empty unless you ride the jade dragon, then one compact line at the bottom centre.
import SEC from './lib/data/secrets.js';
import { COURIER as CR } from './lib/data/courier.js';
import { TRAVEL as TV } from './lib/data/travel.js';
import { ALCHEMY } from './lib/data/alchemy.js';
// Tomas the Courier: the city picker by his horse, the rider's line while riding, and 'on the road' for everyone else near his post.
const CPILL = 'position:fixed;left:50%;transform:translateX(-50%);padding:8px 16px;border-radius:14px;background:rgba(40,28,14,.78);border:1px solid rgba(242,214,160,.45);color:#f7eedd;font-family:Georgia,serif;font-size:14px;white-space:nowrap';
const CBTN = 'pointer-events:auto;cursor:pointer;margin:0 4px;padding:6px 12px;border-radius:10px;border:1px solid rgba(255,220,150,.6);background:rgba(120,78,30,.85);color:#fff3d8;font-family:Georgia,serif;font-size:14px';
function courierHud(ctx, player) {
  const st = player?.state || {}, f = player?.feetPosition, road = ctx.place?.state?.courier;
  if (st.mountedOn === CR.horse) return `<div style="${CPILL};bottom:24px;pointer-events:none">Riding to ${road?.city || 'the city'} with Tomas · Space gets off <button style="${CBTN}" onclick="sendAction('${CR.cancel.action}')">Get off</button></div>`;
  if (!f) return '';
  const d = Math.hypot(f.x - CR.manHome.x, f.z - CR.manHome.z);
  if (road?.busy && d < CR.busyReach) return `<div style="${CPILL};bottom:24px;pointer-events:none">Tomas is on the road to ${road.city} · back soon</div>`;
  if (!st.courierPick || d > CR.uiReach) return '';
  const b = (a, k, label) => `<button style="${CBTN}" onclick="sendAction('${a}')">[${k}] ${label}</button>`;
  return `<div style="${CPILL};bottom:24px;pointer-events:none;text-align:center"><div style="margin-bottom:6px;color:#ffe2a8">Tomas the Courier: “Where to, traveller?”</div>${Object.values(CR.cities).map((c) => b(c.action, c.key, 'Ride to ' + c.name)).join('')}${b(CR.cancel.action, CR.cancel.key, 'Cancel')}</div>`;
}
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
function travelHud(player) {
  const st = player?.state || {};
  if (!st.travelOpen) return `<div style="position:fixed;left:18px;top:18px;pointer-events:none;padding:4px 11px;border-radius:999px;background:rgba(40,28,14,.45);color:#f7eedd;font-family:Georgia,serif;font-size:12px;opacity:.8"><b style="color:#ffe2a8">J</b> travel</div>`;
  const row = (t) => `<button onclick="sendAction('travelGo',{to:'${t.id}'})" style="pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:10px;width:100%;margin:5px 0;padding:8px 12px;border-radius:10px;border:1px solid rgba(255,220,150,.45);background:rgba(120,78,30,.72);color:#fff3d8;font-family:Georgia,serif;font-size:15px;text-align:left"><span style="display:inline-flex;width:22px;height:22px;border-radius:6px;align-items:center;justify-content:center;background:#ffd46a;color:#3a2508;font:700 13px system-ui">${t.key}</span><span style="flex:1">${t.name}</span><span style="font-size:12px;opacity:.7">${t.note}</span></button>`;
  return `<div style="position:fixed;left:24px;top:50%;transform:translateY(-50%);width:min(290px,80vw);padding:14px 14px 10px;border-radius:16px;background:rgba(40,28,14,.86);border:1px solid rgba(242,214,160,.5);box-shadow:0 8px 30px rgba(0,0,0,.35);pointer-events:auto"><div style="font-family:Georgia,serif;color:#ffe2a8;font-size:17px;margin-bottom:4px">Travel</div>${TV.spots.map(row).join('')}<div style="font-family:Georgia,serif;color:#f7eedd;opacity:.6;font-size:12px;margin-top:6px">J or Esc closes</div></div>`;
}

// Alchemy bench (scripts/alchemy-player.js): harvest + active buff chips bottom-left, a toast, and the brew panel while open.
function alchemyHud(player) {
  const st = player?.state || {}, chips = [], F = "font-family:Georgia,serif";
  if ((st.harvest ?? 0) > 0) chips.push(`<span style="color:#b9e08f">&#10047;</span> harvest ${st.harvest}`);
  if ((st.seeds ?? 0) > 0) chips.push(`<span style="color:#e6c77a">&#9679;</span> seeds ${st.seeds}`);
  if ((st.fish ?? 0) > 0) chips.push(`<span style="color:#8fd0d6">&#10148;</span> fish ${st.fish}`);
  const bf = st.buff, br = bf && ALCHEMY.recipes[bf.kind];
  if (bf && st.buffLeft > 0) { const c = bf.color ? `rgb(${bf.color.map((v) => Math.round(v * 255)).join(',')})` : br?.css; chips.push(`<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};box-shadow:0 0 6px ${c}"></span> ${bf.name} · ${st.buffLeft}s`); }
  let h = chips.length ? `<div style="position:fixed;left:18px;bottom:58px;display:flex;flex-direction:column;gap:5px;pointer-events:none">${chips.map((c) => `<div style="padding:4px 11px;border-radius:999px;background:rgba(40,28,14,.6);color:#f7eedd;${F};font-size:13px">${c}</div>`).join('')}</div>` : '';
  if (st.alchemyToast?.text) h += `<div style="position:fixed;left:50%;bottom:120px;transform:translateX(-50%);pointer-events:none;padding:7px 16px;border-radius:999px;background:rgba(40,28,14,.8);border:1px solid rgba(242,214,160,.45);color:#fff3d8;${F};font-size:14px;white-space:nowrap">${st.alchemyToast.text}</div>`;
  if (st.alchemyOpen) {
    const row = (k) => { const r = ALCHEMY.recipes[k]; return `<button onclick="sendAction('brew',{kind:'${k}'})" style="pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:9px;width:100%;margin:5px 0;padding:8px 11px;border-radius:10px;border:1px solid rgba(255,220,150,.45);background:rgba(90,62,34,.78);color:#fff3d8;${F};font-size:14px;text-align:left"><span style="width:12px;height:12px;border-radius:50%;background:${r.css};box-shadow:0 0 8px ${r.css}"></span><span style="flex:1">${r.name} <span style="opacity:.7">(${r.cost} harvest)</span></span><span style="font-size:12px;opacity:.75">${r.note}</span></button>`; };
    h += `<div style="position:fixed;left:50%;bottom:90px;transform:translateX(-50%);width:min(360px,88vw);padding:12px 12px 8px;border-radius:16px;background:rgba(40,28,14,.88);border:1px solid rgba(242,214,160,.5);box-shadow:0 8px 30px rgba(0,0,0,.35);pointer-events:auto"><div style="display:flex;justify-content:space-between;align-items:center;color:#ffe2a8;${F};font-size:16px"><span>Alchemy bench · harvest ${st.harvest ?? 0}</span><button onclick="sendAction('brew',{kind:'close'})" style="cursor:pointer;border:0;background:none;color:#f7eedd;font-size:18px">&times;</button></div>${row('swift')}${row('glow')}${row('dye')}</div>`;
  }
  return h;
}
export default function (ctx, player) {
  const hud = secretHint(player) + secretCount(player) + courierHud(ctx, player) + travelHud(player) + alchemyHud(player);
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
