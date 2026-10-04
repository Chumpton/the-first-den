// The bending HUD, WoW-shaped: player frame (portrait ring, health, chi, Harmony pips, level, combat swords, auras),
// target frame (+ target-of-target), stance bar paging action bar 1, the extra buttons, an XP strip, a minimap with
// den and wolf blips, the objective tracker, wolf nameplates over their heads, error line, toasts, spellbook (P), journal (L).
// Reads player.state (scripts/bender.js) and place.state.wolves (scripts/wolf-pack.js). Every button is a sendAction.
import { SPELLS, BARS, ELEMENTS, STANCES, ICONS, RULES, DENS, QUESTS, WOLF } from './lib/data/bending.js';
const F = "font-family:Georgia,'Times New Roman',serif", GOLD = '#f2c86a', R = RULES;
const RIGHT = 'calc(var(--spawn-chrome-reservation-right-inset, 50px) + 24px)';
const icon = (ic, px, extra = '') => `<span style="display:block;width:${px}px;height:${px}px;background:url(${ICONS[ic[0]]}) ${(ic[1] % 4) * 33.333}% ${Math.floor(ic[1] / 4) * 33.333}%/400% 400%;${extra}"></span>`;
const bar = (frac, col, h, text, bg = 'rgba(0,0,0,.6)') => `<div style="position:relative;height:${h}px;background:${bg};border:1px solid rgba(0,0,0,.8);border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.max(0, Math.min(1, frac)) * 100}%;background:${col};transition:width .15s"></div>${text ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${h - 4}px;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000;${F}">${text}</div>` : ''}</div>`;
export function levelCol(mine, theirs) { const d = theirs - mine; return d >= 5 ? '#ff2020' : d >= 3 ? '#ff8020' : d >= -2 ? '#ffff00' : d >= -6 ? '#40c040' : '#9d9d9d'; }
const ARMOR = 'background:linear-gradient(#3b2a19,#20160c);border:2px solid #8a6a32;box-shadow:inset 0 0 0 1px #2a1c0c,0 3px 10px rgba(0,0,0,.55)';
function aura(ic, t, col) { return `<div style="position:relative;width:22px;height:22px;border:1px solid ${col};border-radius:3px;overflow:hidden">${icon(ic, 20)}${t != null ? `<span style="position:absolute;bottom:-1px;right:1px;font-size:10px;color:#fff;text-shadow:0 0 2px #000,0 0 2px #000">${t}</span>` : ''}</div>`; }

function playerFrame(ctx, player, st, now) {
  const hpMax = R.hp(st.lvl ?? 1), chiMax = R.chiMax(st.lvl ?? 1), hp = Math.max(0, st.hp ?? hpMax), chi = st.chi ?? chiMax, el = ELEMENTS[st.stance ?? 'air'];
  const combat = now < (st.combatUntil ?? 0), avatar = now < (st.avatarUntil ?? 0);
  const pips = Array.from({ length: R.harmonyMax }, (_, i) => `<span style="width:11px;height:11px;border-radius:50%;border:1px solid #c9a24a;background:${i < (st.harmony ?? 0) ? 'radial-gradient(#fff6c8,#e0a920)' : 'rgba(0,0,0,.55)'};box-shadow:${i < (st.harmony ?? 0) ? '0 0 6px #ffd76a' : 'none'}"></span>`).join('');
  const auras = [];
  if ((st.shield ?? 0) > 0) auras.push(aura(SPELLS[st.shieldKind === 'earth' ? 'stone-armor' : st.shieldKind === 'water' ? 'octopus-form' : 'air-shield'].icon, Math.round(st.shield), '#7fd3ff'));
  if (st.speedUntil && now < st.speedUntil) auras.push(aura(SPELLS['air-scooter'].icon, Math.ceil((st.speedUntil - now) / 1000), '#7fd3ff'));
  if (avatar) auras.push(aura(SPELLS['avatar-state'].icon, Math.ceil((st.avatarUntil - now) / 1000), '#ffd76a'));
  if (now < (st.meditateUntil ?? 0)) auras.push(aura(SPELLS.meditate.icon, Math.ceil((st.meditateUntil - now) / 1000), '#ffd76a'));
  const portrait = player.portraitUrl ? `<img src="${player.portraitUrl}" style="width:100%;height:100%;object-fit:cover">` : icon(el.icon, 58);
  return `<div style="position:fixed;left:14px;top:14px;display:flex;align-items:center;pointer-events:none;${F}">
    <div style="position:relative;z-index:2;width:66px;height:66px;border-radius:50%;overflow:hidden;border:3px solid ${avatar ? '#bfe4ff' : '#c9a24a'};box-shadow:0 0 0 2px #2a1c0c,0 0 ${avatar ? 18 : 8}px ${avatar ? '#bfe4ff' : 'rgba(0,0,0,.6)'};background:#1a120a">${portrait}</div>
    <div style="position:absolute;left:46px;top:50px;z-index:3;width:24px;height:24px;border-radius:50%;background:#2a1c0c;border:2px solid #c9a24a;color:#ffe9a8;font-size:12px;display:flex;align-items:center;justify-content:center">${st.lvl ?? 1}</div>
    ${combat ? `<div style="position:absolute;left:0;top:-4px;z-index:3;font-size:16px;filter:drop-shadow(0 0 3px #f00)">⚔️</div>` : ''}
    <div style="margin-left:-14px;width:min(210px,42vw);padding:5px 8px 5px 18px;${ARMOR};border-radius:0 10px 10px 0">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#ffe9a8;margin-bottom:2px"><span>${(player.displayName ?? 'You').slice(0, 16)}</span><span style="color:${el.color}">${el.name}</span></div>
      ${bar(hp / hpMax, 'linear-gradient(#3fd03f,#178a17)', 14, `${Math.round(hp)} / ${hpMax}`)}
      <div style="height:3px"></div>${bar(chi / chiMax, 'linear-gradient(#5aa8ff,#1f5fd0)', 11, `${Math.round(chi)} / ${chiMax} chi`)}
      <div style="display:flex;gap:4px;margin-top:4px;align-items:center"><span style="font-size:10px;color:#c9a24a;margin-right:2px">HARMONY</span>${pips}</div>
    </div></div>
    ${auras.length ? `<div style="position:fixed;left:84px;top:96px;display:flex;gap:3px;pointer-events:none">${auras.join('')}</div>` : ''}`;
}
function targetFrame(ctx, player, st, W) {
  const t = st.tgt && W[st.tgt]; if (!t || t.d) return '';
  const max = t.max || 1, lc = levelCol(st.lvl ?? 1, t.l), tag = t.e === 2 ? 'Boss' : t.e ? 'Elite' : 'Beast';
  const lvl = t.e === 2 ? '<span style="font-size:15px">💀</span>' : t.l;
  const deb = []; if (t.a & 1) deb.push(aura(SPELLS['fire-blast'].icon, null, '#ff4a2a')); if (t.a & 2) deb.push(aura(SPELLS['ice-prison'].icon, null, '#ff4a2a')); if (t.a & 4) deb.push(aura(SPELLS['ice-spears'].icon, null, '#ff4a2a'));
  const tt = t.t && ctx.place.players.find((p) => p.id === t.t);
  const tot = tt ? `<div style="position:absolute;left:30px;top:78px;display:flex;align-items:center;gap:5px;padding:3px 7px;${ARMOR};border-radius:8px;font-size:11px;color:#ffe9a8"><span style="opacity:.7">▸</span>${tt.id === player.id ? 'You' : (tt.displayName ?? '').slice(0, 12)}<div style="width:60px">${bar((tt.state?.hp ?? 1) / R.hp(tt.state?.lvl ?? 1), '#2fb52f', 8)}</div></div>` : '';
  return `<div style="position:fixed;left:min(310px,48vw);top:14px;pointer-events:none;${F}">
    <div style="position:relative;display:flex;align-items:center">
      <div style="width:min(200px,38vw);padding:5px 18px 5px 8px;${ARMOR};border-radius:10px 0 0 10px${t.e ? ';border-color:#e3b64a;box-shadow:0 0 12px rgba(255,200,80,.45)' : ''}">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#ff6a5a;margin-bottom:2px"><span>${t.n}</span><span style="color:#c9a24a;font-size:10px">${tag}</span></div>
        ${bar(t.hp / max, 'linear-gradient(#3fd03f,#178a17)', 14, `${t.hp} / ${max}`)}<div style="height:3px"></div>${bar(1, 'linear-gradient(#d04040,#801a1a)', 6, '')}
      </div>
      <div style="margin-left:-12px;width:56px;height:56px;border-radius:50%;border:3px solid ${t.e ? '#e3b64a' : '#c9a24a'};background:radial-gradient(#5a4a3a,#1a120a);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 0 0 2px #2a1c0c">🐺</div>
      <div style="position:absolute;right:-4px;top:40px;width:24px;height:24px;border-radius:50%;background:#2a1c0c;border:2px solid #c9a24a;color:${lc};font-size:12px;display:flex;align-items:center;justify-content:center">${lvl}</div>
      ${tot}
    </div>${deb.length ? `<div style="display:flex;gap:3px;margin-top:${tot ? 32 : 4}px">${deb.join('')}</div>` : ''}</div>`;
}
function slot(id, key, st, now, big) {
  const S = SPELLS[id]; if (!S) return '';
  const px = big ? 56 : 46, cdEnd = st.cds?.[id] ?? 0, gEnd = S.off ? 0 : st.gcdAt ?? 0, end = Math.max(cdEnd, gEnd), left = end - now;
  const total = cdEnd >= gEnd ? (S.cd ?? 0) * 1000 : R.gcd * 1000;
  const avatar = now < (st.avatarUntil ?? 0), poor = !avatar && (st.chi ?? 0) < (S.chi ?? 0), locked = S.kind === 'avatar' && (st.harmony ?? 0) < S.harmony;
  const sweep = left > 0 && total > 0 ? `<div id="cd-${id}-${end}" style="position:absolute;inset:0;background:conic-gradient(rgba(0,0,0,.7) var(--a),transparent 0);animation:cdsweep ${total}ms linear ${left - total}ms forwards"></div>${left > 1500 ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${big ? 20 : 16}px;text-shadow:0 0 3px #000,0 0 3px #000">${Math.ceil(left / 1000)}</div>` : ''}` : '';
  const flash = st.lastCast?.id === id && now - st.lastCast.at < 250 ? 'box-shadow:0 0 12px #ffe48a,inset 0 0 10px #fff;' : '';
  return `<button title="${S.name}: ${S.text}" onclick="sendAction('castSlot',{id:'${id}'})" style="pointer-events:auto;cursor:pointer;position:relative;width:${px}px;height:${px}px;padding:0;border:2px solid ${big ? '#e3b64a' : '#6b5228'};border-radius:5px;background:#000;overflow:hidden;${flash}">
    ${icon(S.icon, px - 4, `${poor ? 'filter:saturate(.3) brightness(.55) sepia(.4) hue-rotate(180deg);' : ''}${locked ? 'filter:grayscale(1) brightness(.5);' : ''}`)}${sweep}
    ${key ? `<span style="position:absolute;top:1px;right:3px;font-size:11px;color:#fff;text-shadow:0 0 2px #000,0 0 2px #000;${F}">${key}</span>` : ''}</button>`;
}
function bars(ctx, player, st, now) {
  const stance = st.stance ?? 'air', b = BARS[stance], coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const stances = STANCES.map((e, i) => { const E = ELEMENTS[e], on = e === stance;
    return `<button title="${E.name} stance" onclick="sendAction('stancePick',{el:'${e}'})" style="pointer-events:auto;cursor:pointer;position:relative;width:34px;height:34px;padding:0;border:2px solid ${on ? E.color : '#4a3820'};border-radius:5px;background:#000;overflow:hidden;box-shadow:${on ? `0 0 10px ${E.color}` : 'none'}">${icon(E.icon, 30, on ? '' : 'filter:brightness(.6)')}</button>`; }).join('');
  const lvl = st.lvl ?? 1, need = R.xpNeed(lvl), xp = st.xp ?? 0;
  const ticks = Array.from({ length: 19 }, (_, i) => `<span style="position:absolute;left:${(i + 1) * 5}%;top:0;bottom:0;width:1px;background:rgba(0,0,0,.6)"></span>`).join('');
  const W = coarse ? 'min(96vw,560px)' : '560px';
  return `<style>@property --a{syntax:'<angle>';inherits:false;initial-value:360deg}@keyframes cdsweep{from{--a:360deg}to{--a:0deg}}</style>
  <div style="position:fixed;left:50%;bottom:${coarse ? 150 : 10}px;transform:translateX(-50%) scale(${coarse ? 0.78 : 1});transform-origin:bottom center;width:${W};pointer-events:none;${F}">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:5px">
      <div style="display:flex;gap:3px;padding:3px;${ARMOR};border-radius:8px">${stances}<span style="align-self:center;color:#c9a24a;font-size:10px;margin:0 4px">R</span></div>
      <div style="display:flex;gap:6px;align-items:flex-end">${slot('meditate', 'X', st, now, false)}${slot('avatar-state', 'V', st, now, true)}</div>
    </div>
    <div style="position:relative;display:flex;justify-content:center;gap:4px;padding:7px 46px 6px;${ARMOR};border-radius:10px 10px 4px 4px">
      <div style="position:absolute;left:-30px;bottom:-6px;font-size:56px;transform:scaleX(-1);filter:sepia(1) saturate(2.4) hue-rotate(-12deg) drop-shadow(0 2px 3px #000)">🐉</div>
      ${b.map((id, i) => slot(id, String(i + 1), st, now, false)).join('')}
      <div style="position:absolute;right:-30px;bottom:-6px;font-size:56px;filter:sepia(1) saturate(2.4) hue-rotate(-12deg) drop-shadow(0 2px 3px #000)">🐉</div>
    </div>
    <div title="${xp} / ${need} xp" style="position:relative;height:9px;margin-top:2px;background:#1a0f22;border:1px solid #000;border-radius:2px;overflow:hidden"><div style="height:100%;width:${Math.min(1, xp / need) * 100}%;background:linear-gradient(#b06ae0,#6a2aa8)"></div>${ticks}
      <div style="position:absolute;inset:0;text-align:center;font-size:8px;line-height:9px;color:#fff;text-shadow:0 0 2px #000">${lvl >= R.maxLevel ? 'max level' : `level ${lvl} · ${xp} / ${need} xp`}</div></div>
  </div>`;
}
function minimap(ctx, player, st, W) {
  const f = player.feetPosition; if (!f) return '';
  const S = 130, range = 170, k = S / 2 / range;
  const dot = (x, z, html) => { const dx = (x - f.x) * k, dz = (z - f.z) * k; if (Math.hypot(dx, dz) > S / 2 - 6) return ''; return `<div style="position:absolute;left:${S / 2 + dx}px;top:${S / 2 + dz}px;transform:translate(-50%,-50%)">${html}</div>`; };
  let h = dot(0, -3, '<span style="font-size:13px">🏠</span>');
  for (const d of Object.values(DENS)) h += dot(d.x, d.z, `<span style="font-size:11px;filter:drop-shadow(0 0 2px #000)">${d.boss ? '💀' : '🐾'}</span>`);
  for (const [id, w] of Object.entries(W)) if (!w.d) h += dot(w.x, w.z, `<span style="display:block;width:${id === st.tgt ? 8 : 6}px;height:${id === st.tgt ? 8 : 6}px;border-radius:50%;background:${w.t ? '#ff3030' : '#ffd040'};border:1px solid #000"></span>`);
  for (const p of ctx.place.players) if (p.id !== player.id && p.feetPosition) h += dot(p.feetPosition.x, p.feetPosition.z, '<span style="display:block;width:7px;height:7px;border-radius:50%;background:#4ad0ff;border:1px solid #000"></span>');
  const zone = Math.hypot(f.x, f.z + 3) < 60 ? 'The First Den' : Object.values(DENS).find((d) => Math.hypot(f.x - d.x, f.z - d.z) < 40)?.name ?? 'Whisperwood';
  return `<div style="position:fixed;right:18px;top:12px;width:${S}px;pointer-events:none;${F}">
    <div style="text-align:center;font-size:12px;color:#ffe9a8;text-shadow:0 1px 2px #000;margin-bottom:3px">${zone}</div>
    <div style="position:relative;width:${S}px;height:${S}px;border-radius:50%;overflow:hidden;border:4px solid #8a6a32;box-shadow:0 0 0 2px #2a1c0c,0 4px 12px rgba(0,0,0,.6);background:radial-gradient(#4f6b3a,#2c4223)">
      ${h}<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:13px solid #fff;filter:drop-shadow(0 0 2px #000)"></div>
      <div style="position:absolute;left:50%;top:2px;transform:translateX(-50%);font-size:10px;color:#ffe9a8;text-shadow:0 0 2px #000">N</div></div></div>`;
}
function tracker(st) {
  const q = st.quests ?? {}, rows = QUESTS.map((Q) => { const done = !!q[Q.id], n = Math.min(Q.need, st[Q.stat] ?? 0);
    return `<div style="margin-bottom:6px"><div style="color:${done ? '#7fdc6a' : '#ffd100'};font-size:13px">${Q.elite ? '💀 ' : ''}${Q.title}</div><div style="color:#e8e0d0;font-size:11px;padding-left:8px">${done ? 'Complete' : `- ${Q.stat === 'kills' ? 'Wolves slain' : 'Grimfang slain'}: ${n}/${Q.need}`}</div></div>`; }).join('');
  return `<div style="position:fixed;right:${RIGHT};top:178px;width:200px;pointer-events:none;${F};text-shadow:0 1px 2px #000"><div style="color:#ffe9a8;font-size:12px;letter-spacing:.08em;border-bottom:1px solid rgba(201,162,74,.5);margin-bottom:5px">QUESTS <span style="opacity:.6;font-size:10px">· L journal</span></div>${rows}</div>`;
}
function plates(ctx, player, st, W) {
  const f = player.feetPosition; if (!f) return '';
  let h = '';
  for (const [id, w] of Object.entries(W)) {
    if (w.d || Math.hypot(w.x - f.x, w.z - f.z) > 50) continue;
    const tg = id === st.tgt, max = w.max || 1, lc = levelCol(st.lvl ?? 1, w.l);
    h += `<div data-world-anchor="${id}" data-anchor-offset="0 ${w.e === 2 ? 2.2 : 1.55} 0" style="pointer-events:auto;cursor:pointer;width:${tg ? 132 : 112}px;transform:translate(-50%,-100%);text-align:center;${F};opacity:calc(1 - var(--anchor-depth, 0) / 60)" onclick="sendAction('targetPick',{id:'${id}'})">
      <div style="font-size:${tg ? 13 : 11}px;color:${w.t ? '#ff5040' : '#ffe14a'};text-shadow:0 0 3px #000,0 0 2px #000;white-space:nowrap">${w.n}</div>
      <div style="display:flex;align-items:center;gap:3px"><span style="font-size:10px;color:${lc};text-shadow:0 0 2px #000;min-width:16px">${w.e === 2 ? '💀' : w.l}${w.e === 1 ? '+' : ''}</span>
      <div style="flex:1;height:${tg ? 9 : 7}px;background:rgba(0,0,0,.7);border:1px solid ${tg ? '#fff' : w.t ? '#ff4030' : '#000'};border-radius:2px;overflow:hidden${tg ? ';box-shadow:0 0 6px #fff' : ''}"><div style="height:100%;width:${(w.hp / max) * 100}%;background:${w.t ? '#d02a1a' : '#c8a020'}"></div></div></div></div>`;
  }
  return h;
}
function book(st) {
  if (!st.bookOpen) return '';
  const col = (e) => { const E = ELEMENTS[e]; return `<div style="flex:1;min-width:150px"><div style="display:flex;align-items:center;gap:6px;color:${E.color};font-size:15px;margin-bottom:6px">${icon(E.icon, 22)}${E.name}bending</div>${BARS[e].map((id, i) => { const S = SPELLS[id];
    return `<div style="display:flex;gap:7px;margin-bottom:7px"><div style="flex:none;border:1px solid #6b5228;border-radius:4px">${icon(S.icon, 34)}</div><div><div style="color:#ffe9a8;font-size:13px">${S.name} <span style="color:#9c8a6a;font-size:10px">${i + 1} · ${S.chi} chi${S.cd ? ` · ${S.cd}s` : ''}${S.off ? ' · off GCD' : ''}</span></div><div style="color:#d8ccb0;font-size:11px;line-height:1.25">${S.text}</div></div></div>`; }).join('')}</div>`; };
  return `<div data-modal style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,calc(100vw - 2 * ${RIGHT}));max-height:80vh;overflow:auto;padding:16px 18px;border-radius:12px;background:linear-gradient(#e9dcc0,#cdb68c);border:3px solid #6b4a22;box-shadow:0 10px 40px rgba(0,0,0,.6);pointer-events:auto;${F}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:20px;color:#3a2410">Spellbook <span style="font-size:12px;color:#6b4a22">· every spell is instant · R swaps your element</span></div><button onclick="sendAction('bookToggle')" style="pointer-events:auto;cursor:pointer;background:#6b4a22;color:#ffe9a8;border:0;border-radius:6px;padding:4px 10px">✕</button></div>
    <div style="display:flex;flex-wrap:wrap;gap:14px;background:rgba(40,24,10,.88);padding:12px;border-radius:8px">${STANCES.map(col).join('')}</div>
    <div style="display:flex;gap:14px;margin-top:10px;color:#3a2410;font-size:12px"><div><b>X · Meditate</b>: ${SPELLS.meditate.text}</div><div><b>V · Avatar State</b>: ${SPELLS['avatar-state'].text} Harmony builds each time you bend a different element than the last.</div></div></div>`;
}
function journal(st) {
  if (!st.journalOpen) return '';
  const q = st.quests ?? {};
  const qs = QUESTS.map((Q) => `<div style="margin-bottom:12px"><div style="font-size:15px;color:${q[Q.id] ? '#3d7a2a' : '#3a2410'}">${Q.elite ? '💀 ' : ''}${Q.title}${q[Q.id] ? ' ✓' : ''}</div><div style="font-size:12px;color:#4a3420">${Q.text}</div><div style="font-size:11px;color:#6b4a22">${Math.min(Q.need, st[Q.stat] ?? 0)} / ${Q.need} · reward ${Q.xp} xp</div></div>`).join('');
  const dens = Object.values(DENS).map((d) => `<div style="display:flex;justify-content:space-between;font-size:12px;color:#3a2410;padding:3px 0;border-bottom:1px dashed rgba(107,74,34,.35)"><span>${d.boss ? '💀' : '🐾'} ${d.name} <span style="color:#6b4a22">· ${d.mob}s</span></span><span style="color:${levelCol(st.lvl ?? 1, d.levels[1])}; text-shadow:0 0 2px #000">lv ${d.levels[0]}–${d.levels[1]}${d.boss ? ` · ${d.boss.name} ${d.boss.level}` : ''}</span></div>`).join('');
  return `<div data-modal style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,calc(100vw - 2 * ${RIGHT}));max-height:80vh;overflow:auto;padding:16px 18px;border-radius:12px;background:linear-gradient(#efe2c4,#d4bd92);border:3px solid #6b4a22;box-shadow:0 10px 40px rgba(0,0,0,.6);pointer-events:auto;${F}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div style="font-size:20px;color:#3a2410">Tracker's Journal</div><button onclick="sendAction('journalToggle')" style="pointer-events:auto;cursor:pointer;background:#6b4a22;color:#ffe9a8;border:0;border-radius:6px;padding:4px 10px">✕</button></div>
    ${qs}<div style="font-size:14px;color:#3a2410;margin:8px 0 4px">Wolf dens of Whisperwood</div>${dens}
    <div style="font-size:11px;color:#6b4a22;margin-top:8px">Wolves (${WOLF.respawn}s to return) keep to their dens: lead one past ${WOLF.leash} m and it gives up and runs home.</div></div>`;
}
export function bendHud(ctx, player) {
  const st = player?.state; if (!st || st.lvl == null) return '';
  const now = ctx.now?.() ?? Date.now(), W = ctx.place.state?.wolves ?? {}, busy = !!player.controlling || !!st.mountedOn;
  let h = minimap(ctx, player, st, W) + tracker(st) + plates(ctx, player, st, W);
  if (!busy) h += playerFrame(ctx, player, st, now) + targetFrame(ctx, player, st, W) + bars(ctx, player, st, now);
  if (st.err && now - st.err.at < 1600) h += `<div id="err-${st.err.at}" style="position:fixed;left:50%;top:22%;transform:translateX(-50%);pointer-events:none;color:#ff2a2a;font-size:17px;text-shadow:0 0 3px #000,0 1px 2px #000;${F};animation:bfade 1.6s forwards">${st.err.text}</div>`;
  if (st.toast && now - st.toast.at < 3500) h += `<div id="toast-${st.toast.at}" style="position:fixed;left:50%;top:28%;transform:translateX(-50%);pointer-events:none;text-align:center;${F};animation:bfade 3.5s forwards"><div style="font-size:30px;color:#ffd100;text-shadow:0 0 10px #a06a00,0 2px 3px #000">${st.toast.text}</div><div style="font-size:14px;color:#fff3d8;text-shadow:0 1px 2px #000">${st.toast.sub ?? ''}</div></div>`;
  if (st.dead) h += `<div style="position:fixed;inset:0;pointer-events:none;background:radial-gradient(transparent 30%,rgba(60,0,0,.55));display:flex;align-items:center;justify-content:center;${F}"><div style="text-align:center"><div style="font-size:34px;color:#ff5a4a;text-shadow:0 2px 4px #000">You have fallen</div><div style="color:#fff3d8;text-shadow:0 1px 2px #000">${st.lastHitBy ? `slain by ${st.lastHitBy} · ` : ''}rising where you last stood safe…</div></div></div>`;
  h += book(st) + journal(st) + `<style>@keyframes bfade{0%,70%{opacity:1}100%{opacity:0}}</style>`;
  return h;
}
