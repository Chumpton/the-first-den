// The bending HUD, WoW-shaped: player frame (portrait ring, health, chi, Harmony pips, level, combat swords, auras),
// target frame (+ target-of-target), stance bar paging action bar 1, the extra buttons, an XP strip, a minimap with
// den and wolf blips, the objective tracker, wolf nameplates over their heads, error line, toasts, spellbook (P), journal (L).
// Reads player.state (scripts/bender.js) and place.state.wolves (scripts/wolf-pack.js). Every button is a sendAction.
import { SPELLS, BARS, ELEMENTS, STANCES, ICONS, RULES, DENS, QUESTS, WOLF } from './lib/data/bending.js';
// one frame language: carved dark slate, a bronze rim, a display serif for names, a bold sans for numbers
// classic MMO type: Cinzel (an open Friz-Quadrata cousin) for names and keys, a bold sans for numbers; Blizzard gold #ffd100, parchment #ffffe0
const FONT = "/cdn/value.55b110958b9b614a410cf607c12b1ff2990fa3e5bd0bfacf17e5fd7dce681562.woff2";
const GRIFFIN = "/cdn/value.7e65343eb0e881a88a9aa4cae4f85d03e7579006c49e307fe30d767a8a182433.png";
const F = "font-family:'DenCinzel','Cinzel','Palatino Linotype',Georgia,serif;font-weight:700", N = "font-family:Arial,'Helvetica Neue',sans-serif;font-weight:700", GOLD = '#ffd100', PARCH = '#ffffe0', R = RULES;
// the metal bevel every frame wears: a dark inner well, a gold-bronze rim, a black outer line
const METAL = 'background:linear-gradient(180deg,#3b3b3e,#1c1c1f);border:1px solid #0a0a0a;border-radius:5px;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(0,0,0,.6),0 0 0 1px #55555a,0 4px 10px rgba(0,0,0,.6)';
const CSS = `<style>@font-face{font-family:'DenCinzel';src:url(${FONT}) format('woff2');font-weight:700;font-display:swap}
.wf-btn{position:relative;pointer-events:auto;cursor:pointer;padding:0;background:linear-gradient(#2e2e31,#141416);border:2px solid #4a4a4f;border-radius:6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 8px rgba(0,0,0,.85),0 0 0 1px #000,0 2px 4px rgba(0,0,0,.6)}
.wf-btn:hover{border-color:#f0c24a;box-shadow:inset 0 0 6px rgba(0,0,0,.8),0 0 0 1px #000,0 0 10px rgba(255,200,60,.55)}
.wf-btn:hover::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,.12)}
.wf-btn:active{transform:translateY(1px)}
.wf-corner{position:absolute;width:7px;height:7px;background:linear-gradient(135deg,#ffe9a0,#c08a20);box-shadow:0 0 0 1px #000}</style>`;
export const SLATE_OLD = 'background:linear-gradient(180deg,rgba(46,50,58,.94),rgba(20,22,27,.94));border:1px solid #b48a4c;box-shadow:inset 0 1px 0 rgba(255,235,190,.12),inset 0 0 0 1px rgba(0,0,0,.55),0 0 0 1px rgba(30,20,8,.9),0 4px 14px rgba(0,0,0,.5)';
const SH = 'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000';
const RIGHT = 'calc(var(--spawn-chrome-reservation-right-inset, 50px) + 24px)';
const icon = (ic, px, extra = '') => `<span style="display:block;width:${px}px;height:${px}px;background:url(${ICONS[ic[0]]}) ${(ic[1] % 4) * 33.333}% ${Math.floor(ic[1] / 4) * 33.333}%/400% 400%;${extra}"></span>`;
const bar = (frac, col, h, text, bg = 'rgba(0,0,0,.6)') => `<div style="position:relative;height:${h}px;background:${bg};border:1px solid rgba(0,0,0,.85);border-radius:3px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,.7)"><div style="height:100%;width:${Math.max(0, Math.min(1, frac)) * 100}%;background:${col};box-shadow:inset 0 1px 0 rgba(255,255,255,.35);transition:width .15s"></div>${text ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.max(9, h - 5)}px;color:#fff;${SH};${N}">${text}</div>` : ''}</div>`;
export function levelCol(mine, theirs) { const d = theirs - mine; return d >= 5 ? '#ff2020' : d >= 3 ? '#ff8020' : d >= -2 ? '#ffff00' : d >= -6 ? '#40c040' : '#9d9d9d'; }
export const SLATE = METAL; const ARMOR = METAL;
function aura(ic, t, col) { return `<div style="position:relative;width:22px;height:22px;border:1px solid ${col};border-radius:3px;overflow:hidden">${icon(ic, 20)}${t != null ? `<span style="position:absolute;bottom:-1px;right:1px;font-size:10px;color:#fff;${SH};${N}">${t}</span>` : ''}</div>`; }

function ring(content, px, rim, glow) { return `<div style="position:relative;z-index:2;flex:none;width:${px}px;height:${px}px;border-radius:50%;padding:4px;box-sizing:border-box;background:linear-gradient(160deg,#fff0b0,${rim === '#ff4a2a' ? '#ff4a2a' : '#e2b448'} 35%,#8a5e14 70%,#f0cc6a);box-shadow:0 0 0 1px #000,0 3px 8px rgba(0,0,0,.6)${glow ? `,0 0 16px ${glow}` : ''}"><div style="width:100%;height:100%;border-radius:50%;overflow:hidden;background:#15171b;box-shadow:inset 0 0 8px rgba(0,0,0,.9),0 0 0 1px #000">${content}</div></div>`; }
function badge(text, col, pos) { return `<div style="position:absolute;${pos};z-index:3;min-width:20px;height:20px;padding:0 3px;border-radius:10px;background:radial-gradient(#3a3f48,#15171b);border:1px solid #b48a4c;color:${col};font-size:11px;display:flex;align-items:center;justify-content:center;${N};${SH}">${text}</div>`; }
function corners() { return ['left:-5px;top:-5px', 'right:-5px;top:-5px', 'left:-5px;bottom:-5px', 'right:-5px;bottom:-5px'].map((q) => `<span class="wf-corner" style="${q};transform:rotate(45deg)"></span>`).join(''); }
function unitBars(hpF, hpT, resF, resT, resCol, w) {
  return `<div style="width:${w};display:flex;flex-direction:column;gap:2px">${bar(hpF, 'linear-gradient(#3cf03c,#0f9a0f 60%,#0a6a0a)', 18, hpT, '#1a0d0d')}${bar(resF, resCol, 13, resT, '#0b0b1a')}</div>`;
}
function playerFrame(ctx, player, st, now) {
  const hpMax = R.hp(st.lvl ?? 1), chiMax = R.chiMax(st.lvl ?? 1), hp = Math.max(0, st.hp ?? hpMax), chi = st.chi ?? chiMax;
  const combat = now < (st.combatUntil ?? 0);
  const auras = [];
  if ((st.shield ?? 0) > 0) auras.push(aura(SPELLS['air-shield'].icon, Math.round(st.shield), '#7fd3ff'));
  const portrait = player.portraitUrl ? `<img src="${player.portraitUrl}" style="width:100%;height:100%;object-fit:cover">` : icon(SPELLS.fireball.icon, 60);
  return `<div style="position:fixed;left:16px;top:14px;pointer-events:none;${F}">
    <div style="position:relative;display:flex;align-items:center">
      ${ring(portrait, 64, combat ? '#ff4a2a' : '#d9b452', combat ? 'rgba(255,40,20,.55)' : '')}
      <div style="position:absolute;left:-4px;top:44px;z-index:3;width:24px;height:24px;border-radius:50%;background:radial-gradient(#3a3a3e,#121214);border:2px solid #e2b448;box-shadow:0 0 0 1px #000;display:flex;align-items:center;justify-content:center;color:${GOLD};font-size:12px;${N};${SH}">${st.lvl ?? 1}</div>
      ${combat ? `<div style="position:absolute;left:46px;top:-6px;z-index:3;font-size:15px;filter:drop-shadow(0 0 3px #f00)">⚔️</div>` : ''}
      <div style="position:relative;margin-left:-10px;padding:5px 8px 6px 16px;${METAL};border-radius:0 3px 3px 0">${corners()}
        <div style="font-size:13px;line-height:15px;color:${GOLD};${SH};margin-bottom:3px;white-space:nowrap">${(player.displayName ?? 'You').slice(0, 18)}</div>
        ${unitBars(hp / hpMax, `${Math.round(hp)} / ${hpMax}`, chi / chiMax, `${Math.round(chi)} / ${chiMax}`, 'linear-gradient(#4a8cff,#1040c8 60%,#08257a)', 'min(170px,36vw)')}
      </div></div>
    ${auras.length ? `<div style="display:flex;gap:3px;margin:6px 0 0 66px">${auras.join('')}</div>` : ''}</div>`;
}
function targetFrame(ctx, player, st, W) {
  const t = st.tgt && W[st.tgt]; if (!t || t.d) return '';
  const max = t.max || 1, lc = levelCol(st.lvl ?? 1, t.l), tag = t.e === 2 ? 'Boss' : t.e ? 'Elite' : '';
  const lvl = t.e === 2 || t.l - (st.lvl ?? 1) >= 10 ? '<span style="font-size:12px">💀</span>' : t.l;
  const deb = []; if (t.a & 1) deb.push(aura(SPELLS.fireball.icon, null, '#ff4a2a'));
  const tt = t.t && ctx.place.players.find((p) => p.id === t.t);
  const tot = tt ? `<div style="position:absolute;left:30px;top:62px;display:flex;align-items:center;gap:5px;padding:2px 7px;${METAL};border-radius:3px;font-size:11px;color:${PARCH};${SH}">${tt.id === player.id ? 'You' : (tt.displayName ?? '').slice(0, 12)}<div style="width:60px">${bar((tt.state?.hp ?? 1) / R.hp(tt.state?.lvl ?? 1), '#1fb51f', 8)}</div></div>` : '';
  return `<div style="position:fixed;left:min(300px,46vw);top:14px;pointer-events:none;${F}">
    <div style="position:relative;display:flex;align-items:center">
      <div style="position:relative;padding:5px 16px 6px 8px;${METAL};border-radius:3px 0 0 3px${t.e ? ';border-color:#ffd100' : ''}">${corners()}
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;line-height:15px;margin-bottom:3px;${SH}"><span style="color:${t.v ? '#bbbbbb' : '#ff3a2a'};white-space:nowrap">${t.n}</span>${tag ? `<span style="color:${GOLD};font-size:10px">${tag}</span>` : ''}</div>
        ${unitBars(t.hp / max, `${t.hp} / ${max}`, 1, '', 'linear-gradient(#d84040,#7a1010)', 'min(160px,34vw)')}
      </div>
      <div style="position:relative;margin-left:-10px">${ring('<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px;background:radial-gradient(#4a4f58,#15171b)">🐺</div>', 60, t.e ? '#ffd100' : '#d9b452', t.e ? 'rgba(255,209,0,.4)' : '')}
        <div style="position:absolute;right:-4px;top:40px;z-index:3;width:24px;height:24px;border-radius:50%;background:radial-gradient(#3a3a3e,#121214);border:2px solid #e2b448;box-shadow:0 0 0 1px #000;display:flex;align-items:center;justify-content:center;color:${lc};font-size:12px;${N};${SH}">${lvl}</div></div>
      ${tot}
    </div>${deb.length ? `<div style="display:flex;gap:3px;margin-top:${tot ? 30 : 6}px">${deb.join('')}</div>` : ''}</div>`;
}
function slot(id, key, st, now, big) {
  const S = SPELLS[id]; if (!S) return '';
  const px = big ? 52 : 42, cdEnd = st.cds?.[id] ?? 0, gEnd = S.off ? 0 : st.gcdAt ?? 0, end = Math.max(cdEnd, gEnd), left = end - now;
  const total = cdEnd >= gEnd ? (S.cd ?? 0) * 1000 : R.gcd * 1000;
  const avatar = now < (st.avatarUntil ?? 0), poor = !avatar && (st.chi ?? 0) < (S.chi ?? 0), locked = S.kind === 'avatar' && (st.harmony ?? 0) < S.harmony;
  const sweep = left > 0 && total > 0 ? `<div id="cd-${id}-${end}" style="position:absolute;inset:0;background:conic-gradient(rgba(0,0,0,.7) var(--a),transparent 0);animation:cdsweep ${total}ms linear ${left - total}ms forwards"></div>${left > 1500 ? `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${big ? 20 : 16}px;${SH};${N}">${Math.ceil(left / 1000)}</div>` : ''}` : '';
  const flash = st.lastCast?.id === id && now - st.lastCast.at < 250 ? 'box-shadow:0 0 12px #ffe48a,inset 0 0 10px #fff;' : '';
  return `<button class="wf-btn" title="${S.name}: ${S.text}" onclick="sendAction('castSlot',{id:'${id}'})" style="width:${px}px;height:${px}px;overflow:hidden;${flash}">
    ${icon(S.icon, px - 4, `${poor ? 'filter:saturate(.3) brightness(.55) sepia(.4) hue-rotate(180deg);' : ''}${locked ? 'filter:grayscale(1) brightness(.5);' : ''}`)}${sweep}
    ${key ? `<span style="position:absolute;top:1px;right:3px;font-size:12px;color:#e8e8e8;${SH};${F}">${key}</span>` : ''}</button>`;
}
function bars(ctx, player, st, now) {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const kit = BARS.fire;
  const empty = (k) => `<div style="position:relative;width:42px;height:42px;box-sizing:border-box;background:linear-gradient(#2a2a2d,#111113);border:2px solid #3c3c40;border-radius:6px;box-shadow:inset 0 0 8px rgba(0,0,0,.9),0 0 0 1px #000"><span style="position:absolute;top:1px;right:3px;font-size:12px;color:#777;${SH};${F}">${k}</span></div>`;
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
  const slots = keys.map((k, i) => kit[i] ? slot(kit[i], k, st, now, false) : empty(k)).join('');
  const lvl = st.lvl ?? 1, need = R.xpNeed(lvl), xp = st.xp ?? 0;
  const ticks = Array.from({ length: 19 }, (_, i) => `<span style="position:absolute;left:${(i + 1) * 5}%;top:0;bottom:0;width:1px;background:rgba(0,0,0,.7)"></span>`).join('');
  const cap = (flip) => `<img src="${GRIFFIN}" style="flex:none;align-self:flex-end;width:124px;height:124px;margin:0 ${flip ? '0 -4px -26px' : '-26px -4px 0'};${flip ? 'transform:scaleX(-1);' : ''}filter:drop-shadow(0 2px 3px #000);pointer-events:none">`;
  return `<style>@property --a{syntax:'<angle>';inherits:false;initial-value:360deg}@keyframes cdsweep{from{--a:360deg}to{--a:0deg}}</style>
  <div style="position:fixed;left:50%;bottom:${coarse ? 140 : 0}px;transform:translateX(-50%) scale(${coarse ? 0.6 : 1});transform-origin:bottom center;pointer-events:none;display:flex;align-items:flex-end;${F}">
    ${cap(false)}
    <div style="position:relative;z-index:1">
      <div title="${xp} / ${need} xp" style="position:relative;height:11px;background:#0a0612;border:1px solid #000;box-shadow:0 0 0 1px #9a7a3c;overflow:hidden"><div style="height:100%;width:${Math.min(1, xp / need) * 100}%;background:linear-gradient(#b26cff,#6a1ab0 60%,#3e0a6e)"></div>${ticks}
        <div style="position:absolute;inset:0;text-align:center;font-size:9px;line-height:11px;color:#fff;${SH};${N}">${lvl >= R.maxLevel ? 'MAX LEVEL' : `XP ${xp} / ${need}`}</div></div>
      <div style="display:flex;gap:7px;padding:8px 10px 9px;background:linear-gradient(180deg,#38383b,#1a1a1c);border:1px solid #0a0a0a;border-bottom:0;border-radius:6px 6px 0 0;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px #55555a">${slots}</div>
    </div>
    ${cap(true)}
  </div>`;
}
// The micro menu: classic bronze buttons bottom-right, above the bags
function micro(st) {
  const b = (glyph, title, act, on) => `<button class="wf-btn" title="${title}" ${act ? `onclick="sendAction('${act}')"` : ''} style="width:26px;height:34px;background:linear-gradient(#5a4321,#2a1d0c);${on ? 'box-shadow:inset 0 0 0 1px #000,0 0 0 2px #4d3b1c,0 0 0 3px #ffd100,0 0 0 4px #000;' : ''}font-size:15px;line-height:34px;text-align:center">${glyph}</button>`;
  const bag = (glyph, big) => `<div class="wf-btn" style="width:${big ? 40 : 32}px;height:${big ? 40 : 32}px;display:flex;align-items:center;justify-content:center;font-size:${big ? 22 : 17}px;background:radial-gradient(#4a3a22,#1a1209);cursor:default">${glyph}</div>`;
  return `<div style="position:fixed;right:24px;bottom:12px;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:none;${F}">
    <div style="display:flex;gap:7px;align-items:flex-end">${bag('🎒', false)}${bag('👝', false)}${bag('💰', true)}</div>
    <div style="display:flex;gap:6px">${b('🧙', 'Character', '', false)}${b('📕', 'Spellbook (P)', 'bookToggle', st.bookOpen)}${b('📜', 'Quest Log (L)', 'journalToggle', st.journalOpen)}${b('🗺️', 'Travel (J)', 'travelMenu', st.travelOpen)}${b('⚙️', 'Game Menu', '', false)}</div></div>`;
}
// The cast bar, 1.12's CastingBarFrame: centred over the action bar, gold filling for a hard cast, green draining
// for a channel, a white spark at the edge; a finished cast flashes full and fades, a broken one turns red and says why.
// The fill is a CSS run keyed by the cast's start and end, so a pushback re-keys it and the bar jumps back.
function castBar(ctx, st, now, coarse) {
  const c = st.casting, ch = st.channeling, e = st.castEnd;
  const shell = (key, S, inner, label, time, anim = '') => `<div id="${key}" style="position:fixed;left:50%;bottom:${coarse ? 230 : 104}px;transform:translateX(-50%);display:flex;align-items:center;gap:5px;pointer-events:none;${F};${anim}">
    <div style="flex:none;border:1px solid #b48a4c;border-radius:3px;box-shadow:0 0 0 1px #000,0 2px 6px rgba(0,0,0,.6)">${icon(S.icon, 24)}</div>
    <div style="position:relative;width:min(230px,52vw);height:18px;padding:2px;${SLATE};border-radius:4px">
      <div style="position:relative;height:100%;background:rgba(0,0,0,.7);border-radius:2px;overflow:hidden">${inner}</div>
      <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:11px;color:#fff;${SH};${N}"><span>${label}</span><span style="font-weight:400;opacity:.9">${time}</span></div>
    </div></div>`;
  if (c && SPELLS[c.id]) {
    const S = SPELLS[c.id], total = Math.max(1, c.end - c.at), done = Math.min(total, Math.max(0, now - c.at));
    const fill = `<div style="height:100%;width:0;background:linear-gradient(#ffe27a,#f0a800 55%,#b06e00);box-shadow:2px 0 6px #fff6c0,inset 0 1px 0 rgba(255,255,255,.5);animation:cbfill ${total}ms linear -${done}ms forwards"></div>`;
    return shell(`cb-${c.at}-${c.end}`, S, fill, S.name, `${((c.end - c.at) / 1000).toFixed(1)}s`);
  }
  if (ch && SPELLS[ch.id]) {
    const S = SPELLS[ch.id], total = Math.max(1, ch.end - ch.at), done = Math.min(total, Math.max(0, now - ch.at));
    const fill = `<div style="height:100%;width:100%;background:linear-gradient(#9cff8a,#2ec22e 55%,#127a12);box-shadow:2px 0 6px #eaffd8,inset 0 1px 0 rgba(255,255,255,.5);animation:cbdrain ${total}ms linear -${done}ms forwards"></div>`;
    return shell(`ch-${ch.at}`, S, fill, S.name, `${ch.left ?? ''} ticks`);
  }
  if (e && SPELLS[e.id] && now - e.at < 900) {
    const S = SPELLS[e.id], ok = e.ok;
    const fill = `<div style="height:100%;width:100%;background:${ok ? 'linear-gradient(#b8ffb0,#3ad83a 55%,#178a17)' : 'linear-gradient(#ff8a7a,#d02a1a 55%,#7a0c06)'}"></div>`;
    return shell(`ce-${e.at}`, S, fill, ok ? S.name : (e.why ?? 'Interrupted'), '', `animation:bfade ${ok ? 600 : 900}ms forwards`);
  }
  return '';
}
function minimap(ctx, player, st, W) {
  const f = player.feetPosition; if (!f) return '';
  const S = 140, range = 170, k = S / 2 / range;
  const dot = (x, z, html) => { const dx = (x - f.x) * k, dz = (z - f.z) * k; if (Math.hypot(dx, dz) > S / 2 - 6) return ''; return `<div style="position:absolute;left:${S / 2 + dx}px;top:${S / 2 + dz}px;transform:translate(-50%,-50%)">${html}</div>`; };
  let h = dot(0, -3, '<span style="font-size:13px">🏠</span>');
  for (const d of Object.values(DENS)) h += dot(d.x, d.z, `<span style="font-size:11px;filter:drop-shadow(0 0 2px #000)">${d.boss ? '💀' : '🐾'}</span>`);
  for (const [id, w] of Object.entries(W)) if (!w.d) h += dot(w.x, w.z, `<span style="display:block;width:${id === st.tgt ? 8 : 6}px;height:${id === st.tgt ? 8 : 6}px;border-radius:50%;background:${w.t ? '#ff3030' : '#ffd040'};border:1px solid #000"></span>`);
  for (const p of ctx.place.players) if (p.id !== player.id && p.feetPosition) h += dot(p.feetPosition.x, p.feetPosition.z, '<span style="display:block;width:7px;height:7px;border-radius:50%;background:#4ad0ff;border:1px solid #000"></span>');
  const zone = Math.hypot(f.x, f.z + 3) < 60 ? 'The First Den' : Object.values(DENS).find((d) => Math.hypot(f.x - d.x, f.z - d.z) < 40)?.name ?? 'Whisperwood';
  const card = (t, pos) => `<div style="position:absolute;${pos};width:16px;height:16px;transform:rotate(45deg);background:linear-gradient(135deg,#fff0b0,#d9a838 50%,#7a5210);box-shadow:0 0 0 1px #000,0 2px 3px rgba(0,0,0,.6)"><div style="transform:rotate(-45deg);color:#2a1800;font-size:9px;line-height:16px;text-align:center;${N}">${t}</div></div>`;
  const pin = (g, pos) => `<div style="position:absolute;${pos};width:22px;height:22px;border-radius:50%;background:radial-gradient(#3a3a3e,#121214);border:2px solid #e2b448;box-shadow:0 0 0 1px #000;color:${GOLD};font-size:12px;line-height:18px;text-align:center;${N}">${g}</div>`;
  const d = new Date(), clock = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `<div style="position:fixed;right:16px;top:8px;width:${S + 10}px;pointer-events:none;${F}">
    <div style="margin:0 auto 5px;width:max-content;max-width:180px;padding:2px 14px;${METAL};border-radius:12px 12px 4px 4px;text-align:center;font-size:12px;color:${GOLD};${SH}">${zone}</div>
    <div style="position:relative;width:${S + 10}px;height:${S + 10}px;border-radius:50%;background:conic-gradient(from 20deg,#7a5a22,#f2d488,#6a4a18,#e0b860,#5a3e12,#f2d488,#7a5a22);box-shadow:0 0 0 2px #000,inset 0 0 0 2px #3a2a0c,0 4px 14px rgba(0,0,0,.6)">
      <div style="position:absolute;inset:7px;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 12px rgba(0,0,0,.8);background:radial-gradient(#56733f,#2c4223)">
        ${h}<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:13px solid #fff;filter:drop-shadow(0 0 2px #000)"></div></div>
      ${card('N', 'left:50%;top:-6px;margin-left:-8px')}${card('E', 'right:-6px;top:50%;margin-top:-8px')}${card('S', 'left:50%;bottom:-6px;margin-left:-8px')}${card('W', 'left:-6px;top:50%;margin-top:-8px')}
    </div>
      ${pin('🔍', 'left:4px;top:18px')}${pin('+', 'right:2px;bottom:34px')}${pin('−', 'right:18px;bottom:14px')}
      <div style="position:absolute;left:50%;bottom:-12px;transform:translateX(-50%);padding:1px 9px;${METAL};border-radius:9px;font-size:10px;color:${PARCH};${N};${SH}">${clock}</div>
    </div></div>`;
}
function tracker(st) {
  const q = st.quests ?? {}, rows = QUESTS.map((Q) => { const done = !!q[Q.id], n = Math.min(Q.need, st[Q.stat] ?? 0);
    return `<div style="margin-bottom:6px"><div style="color:${done ? '#7fdc6a' : '#ffd100'};font-size:13px">${Q.elite ? '💀 ' : ''}${Q.title}</div><div style="color:#ece4d4;font-size:11px;padding-left:8px;${N};font-weight:600">${done ? 'Complete' : `- ${Q.stat === 'kills' ? 'Wolves slain' : 'Grimfang slain'}: ${n}/${Q.need}`}</div></div>`; }).join('');
  return `<div style="position:fixed;right:${RIGHT};top:192px;width:196px;padding:7px 10px 3px;border-radius:6px;pointer-events:none;${F};${SH}"><div style="color:#e9c37a;font-size:12px;letter-spacing:.12em;border-bottom:1px solid rgba(180,138,76,.6);margin-bottom:5px">QUESTS <span style="opacity:.7;font-size:10px;letter-spacing:0">· L journal</span></div>${rows}</div>`;
}
function plates(ctx, player, st, W) {
  const f = player.feetPosition; if (!f) return '';
  let h = '';
  for (const [id, w] of Object.entries(W)) {
    if (w.d || Math.hypot(w.x - f.x, w.z - f.z) > 50) continue;
    const tg = id === st.tgt, max = w.max || 1, lc = levelCol(st.lvl ?? 1, w.l);
    h += `<div data-world-anchor="${id}" data-anchor-offset="0 ${w.e === 2 ? 2.2 : 1.55} 0" style="pointer-events:auto;cursor:pointer;width:${tg ? 132 : 112}px;transform:translate(-50%,-100%);text-align:center;${F};opacity:calc(1 - var(--anchor-depth, 0) / 60)" onclick="sendAction('targetPick',{id:'${id}'})">
      <div style="font-size:${tg ? 13 : 11}px;color:${w.v ? '#9a9a9a' : '#ff4a3a'};${SH};white-space:nowrap">${w.n}</div>
      <div style="display:flex;align-items:center;gap:3px"><span style="font-size:10px;color:${lc};text-shadow:0 0 2px #000;min-width:16px">${w.e === 2 || w.l - (st.lvl ?? 1) >= 10 ? '💀' : w.l}${w.e === 1 ? '+' : ''}</span>
      <div style="flex:1;height:${tg ? 9 : 7}px;background:rgba(0,0,0,.7);border:1px solid ${tg ? '#fff' : w.t ? '#ff4030' : '#000'};border-radius:2px;overflow:hidden${tg ? ';box-shadow:0 0 6px #fff' : ''}"><div style="height:100%;width:${(w.hp / max) * 100}%;background:${w.v ? '#7a7a7a' : '#d02a1a'}"></div></div></div></div>`;
  }
  return h;
}
function book(st) {
  if (!st.bookOpen) return '';
  const rows = BARS.fire.map((id, i) => { const S = SPELLS[id];
    return `<div style="display:flex;gap:10px;align-items:center;padding:8px;border-bottom:1px solid rgba(107,74,34,.35)"><div class="wf-btn" style="flex:none;width:42px;height:42px;overflow:hidden">${icon(S.icon, 42)}</div><div><div style="color:#3a1c00;font-size:15px">${S.name} <span style="color:#6b4a22;font-size:11px;${N}">${i + 1} · ${S.chi} mana${S.cast ? ` · ${S.cast}s cast` : ' · instant'}</span></div><div style="color:#2a1a0a;font-size:12px;${N};font-weight:400">${S.text}</div></div></div>`; }).join('');
  return `<div data-modal style="position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100vw - 2 * ${RIGHT}));max-height:80vh;overflow:auto;padding:14px 18px;background:linear-gradient(#f3e6c4,#d8c08e);border:3px solid #6b4a22;box-shadow:0 0 0 2px #000,0 10px 40px rgba(0,0,0,.6);pointer-events:auto;${F}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><div style="font-size:20px;color:#3a1c00">Spellbook</div><button onclick="sendAction('bookToggle')" style="pointer-events:auto;cursor:pointer;background:#7a1a0a;color:${GOLD};border:1px solid #000;border-radius:3px;padding:2px 9px">✕</button></div>
    ${rows}<div style="margin-top:8px;color:#6b4a22;font-size:11px;${N};font-weight:400">More spells are coming. Stand still while the bar fills: a step breaks the cast.</div></div>`;
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
  let h = CSS + minimap(ctx, player, st, W) + tracker(st) + plates(ctx, player, st, W) + micro(st);
  if (!busy) h += playerFrame(ctx, player, st, now) + targetFrame(ctx, player, st, W) + bars(ctx, player, st, now) + castBar(ctx, st, now, typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches);
  if (st.err && now - st.err.at < 1600) h += `<div id="err-${st.err.at}" style="position:fixed;left:50%;top:22%;transform:translateX(-50%);pointer-events:none;color:#ff2a2a;font-size:17px;text-shadow:0 0 3px #000,0 1px 2px #000;${F};animation:bfade 1.6s forwards">${st.err.text}</div>`;
  if (st.toast && now - st.toast.at < 3500) h += `<div id="toast-${st.toast.at}" style="position:fixed;left:50%;top:28%;transform:translateX(-50%);pointer-events:none;text-align:center;${F};animation:bfade 3.5s forwards"><div style="font-size:30px;color:#ffd100;text-shadow:0 0 10px #a06a00,0 2px 3px #000">${st.toast.text}</div><div style="font-size:14px;color:#fff3d8;text-shadow:0 1px 2px #000">${st.toast.sub ?? ''}</div></div>`;
  if (st.dead) h += `<div style="position:fixed;inset:0;pointer-events:none;background:radial-gradient(transparent 30%,rgba(60,0,0,.55));display:flex;align-items:center;justify-content:center;${F}"><div style="text-align:center"><div style="font-size:34px;color:#ff5a4a;text-shadow:0 2px 4px #000">You have fallen</div><div style="color:#fff3d8;text-shadow:0 1px 2px #000">${st.lastHitBy ? `slain by ${st.lastHitBy} · ` : ''}rising where you last stood safe…</div></div></div>`;
  h += book(st) + journal(st) + `<style>@keyframes bfade{0%,70%{opacity:1}100%{opacity:0}}@keyframes cbfill{from{width:0}to{width:100%}}@keyframes cbdrain{from{width:100%}to{width:0}}</style>`;
  return h;
}
