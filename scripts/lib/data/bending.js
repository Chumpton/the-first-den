// The bending kit, mage-shaped: hard casts (a bar you stand still for), channels (ticks while you stand), instants for the run.
// Four element stances, six spells each, two extra abilities, the wolf dens and the progression.
// Every tuned number of the combat lives here. Icons: two painted 4x4 sheets, [sheet, cell].
export const ICONS = {
  a: '/cdn/value.ca4b9e2e9e92ea138946450a12bc5fb1f25fe9ebf2b8e359447d0a5ceb2c4dec.png',
  b: '/cdn/value.574b2550b4798a285c9e16ba95100517e979dde50a1deae7cc52bac9de351899.png',
};
const SFX = (n) => `/cdn/moodboard-painterly-fantasy/sfx-${n}.mp3`;
export const SOUNDS = {
  air: SFX('airbending-gust-whoosh-blast'), water: SFX('waterbending-whip-splash'), earth: SFX('earthbending-rock-crack-heave'),
  fire: SFX('firebending-flame-burst-roar'), lightning: SFX('lightning-crack-thunder-snap'), ice: SFX('ice-shards-shatter'),
  heal: SFX('healing-water-chime-shimmer'), shield: SFX('magic-shield-hum-up'), dash: SFX('fast-wind-dash-whoosh'),
  impact: SFX('heavy-stone-impact-thud'), bite: SFX('wolf-bite-snarl-snap'), yelp: SFX('wolf-yelp-hurt'), growl: SFX('wolf-growl-aggro'),
  howl: SFX('wolf-howl-distant-forest'), die: SFX('wolf-death-whimper'), level: SFX('level-up-golden-fanfare'), error: SFX('soft-ui-error-click'),
  avatar: SFX('avatar-state-cosmic-surge-boom'), quest: SFX('quest-complete-horn-chime'),
};
export const ELEMENTS = {
  air: { name: 'Air', icon: ['b', 10], color: '#dff4ff', glow: [1.9, 2.3, 2.6] },
  water: { name: 'Water', icon: ['b', 11], color: '#4fb3ff', glow: [0.5, 1.4, 3] },
  earth: { name: 'Earth', icon: ['b', 12], color: '#b98a4e', glow: [1.6, 1.2, 0.6] },
  fire: { name: 'Fire', icon: ['b', 13], color: '#ff7a2a', glow: [3.4, 1.4, 0.3] },
};
export const STANCES = ['air', 'water', 'earth', 'fire'];
// kind: bolt (flies to the target) · lash (a whip, 14 m) · ground (lands at the target, radius) · nova (around you) · cone (in front)
//       self (shield / heal / speed) · dash · blink · launch · jet. Damage is at level 1; it grows 12 % a level.
export const SPELLS = {
  'air-blast':    { el: 'air', name: 'Air Blast', icon: ['a', 0], kind: 'bolt', dmg: 16, range: 32, cd: 0, chi: 8, kb: 7, speed: 70, text: 'A punch of wind that hurls the target back.' },
  'wind-darts':   { el: 'air', name: 'Wind Darts', icon: ['a', 1], kind: 'bolt', dmg: 60, ticks: 4, channel: 3, range: 32, cd: 0, chi: 22, speed: 80, text: 'Channel 3 s: four darts of air seek the target. Moving ends it.' },
  'tornado':      { el: 'air', name: 'Tornado', icon: ['a', 2], kind: 'ground', dmg: 54, ticks: 6, channel: 6, radius: 6, range: 30, cd: 12, chi: 30, lift: 4, text: 'Channel 6 s: a twister on the target hits everything within 6 m each second.' },
  'air-shield':   { el: 'air', name: 'Air Shield', icon: ['a', 3], kind: 'self', shield: 45, dur: 10, cd: 20, chi: 20, text: 'A sphere of wind absorbs 45 damage.' },
  'air-dash':     { el: 'air', name: 'Air Dash', icon: ['b', 4], kind: 'dash', dist: 14, cd: 6, chi: 10, off: true, text: 'Ride the wind 14 m the way you face.' },
  'cyclone-bind': { el: 'air', name: 'Cyclone Bind', icon: ['b', 0], kind: 'bind', cast: 1.5, bind: 20, range: 30, cd: 0, chi: 15, text: '1.5 s cast: wrap a wolf in a cyclone for 20 s. It wanders, healing; any damage frees it. Not on bosses.' },
  'air-scooter':  { el: 'air', name: 'Air Scooter', icon: ['b', 0], kind: 'self', speed: 2.1, dur: 8, cd: 25, chi: 15, off: true, text: 'Ride a ball of air: double speed for 8 s.' },
  'water-whip':   { el: 'water', name: 'Water Whip', icon: ['a', 4], kind: 'lash', dmg: 19, range: 15, cd: 0, chi: 8, lance: true, text: 'Instant. A lash of river water: double damage to a frozen target.' },
  'ice-spears':   { el: 'water', name: 'Ice Spears', icon: ['a', 5], kind: 'bolt', dmg: 48, cast: 2.5, range: 32, cd: 0, chi: 14, slow: 6, speed: 44, text: '2.5 s cast: a volley of ice spears that slows the target 6 s. Your bread and butter.' },
  'ice-prison':   { el: 'water', name: 'Ice Prison', icon: ['a', 6], kind: 'nova', el2: 'ice', dmg: 8, radius: 8, cd: 25, chi: 15, root: 8, off: true, text: 'Instant, off the GCD: freeze everything within 8 m for 8 s. Frozen wolves shatter: +50 % crit. Damage may free them.' },
  'healing-waters': { el: 'water', name: 'Healing Waters', icon: ['a', 7], kind: 'self', heal: 0.4, cast: 2, cd: 10, chi: 25, text: '2 s cast: restore 40 % of your health.' },
  'hailstorm':    { el: 'water', name: 'Hailstorm', icon: ['b', 1], kind: 'ground', dmg: 60, ticks: 6, channel: 6, radius: 8, range: 30, cd: 0, chi: 35, slow: 3, hail: true, text: 'Channel 6 s: hail on the target, every wolf within 8 m hit and chilled each second.' },
  'mist-step':    { el: 'water', name: 'Mist Step', icon: ['b', 7], kind: 'blink', dist: 15, cd: 8, chi: 10, off: true, text: 'Dissolve into mist and reform 15 m ahead.' },
  'octopus-form': { el: 'water', name: 'Octopus Form', icon: ['b', 1], kind: 'self', shield: 70, dur: 10, cd: 30, chi: 25, text: 'Eight water tentacles absorb 70 damage.' },
  'rock-throw':   { el: 'earth', name: 'Rock Throw', icon: ['a', 8], kind: 'bolt', dmg: 24, range: 30, cd: 0, chi: 10, kb: 3, speed: 45, rock: 0.35, text: 'Tear a stone from the ground and hurl it.' },
  'stone-spike':  { el: 'earth', name: 'Stone Spike', icon: ['a', 9], kind: 'ground', dmg: 36, radius: 2.5, range: 30, cd: 6, chi: 18, lift: 8, spike: true, text: 'A spike erupts under the target and throws it up.' },
  'earthquake':   { el: 'earth', name: 'Earthquake', icon: ['a', 10], kind: 'nova', dmg: 22, radius: 9, cd: 14, chi: 30, root: 2, text: 'Stomp: everything within 9 m is hit and stuck 2 s.' },
  'stone-armor':  { el: 'earth', name: 'Stone Armor', icon: ['a', 11], kind: 'self', shield: 85, dur: 12, cd: 30, chi: 20, text: 'Plates of rock absorb 85 damage.' },
  'earth-launch': { el: 'earth', name: 'Earth Launch', icon: ['b', 5], kind: 'launch', up: 17, fwd: 7, cd: 8, chi: 10, off: true, text: 'A pillar of stone launches you into the air.' },
  'boulder-fall': { el: 'earth', name: 'Boulder Fall', icon: ['b', 2], kind: 'ground', cast: 3, dmg: 80, radius: 6, range: 30, cd: 20, chi: 35, boulder: true, text: '3 s cast: drop a giant boulder on the target and all within 6 m.' },
  'fire-blast':   { el: 'fire', name: 'Fire Blast', icon: ['a', 12], kind: 'bolt', dmg: 30, range: 22, cd: 8, chi: 10, speed: 65, text: 'Instant: a fist of flame, weaved between casts or thrown on the run.' },
  'fireball':     { el: 'fire', name: 'Fireball', icon: ['a', 13], kind: 'bolt', dmg: 62, cast: 3, range: 32, cd: 0, chi: 16, burn: 4, burnDur: 8, speed: 40, big: true, text: '3 s cast: a heavy ball of fire, then it burns 8 s. Crits Ignite: 40 % more over 4 s.' },
  'ring-of-fire': { el: 'fire', name: 'Ring of Fire', icon: ['a', 14], kind: 'nova', dmg: 26, radius: 8, cd: 12, chi: 28, kb: 8, burn: 5, text: 'A ring of flame bursts out 8 m, throwing back and burning.' },
  'lightning':    { el: 'fire', name: 'Lightning', icon: ['a', 15], kind: 'bolt', dmg: 150, cast: 4.5, range: 34, cd: 15, chi: 40, crit: 0.3, beam: true, text: '4.5 s cast: split the energy and strike. Huge, 30 % to crit. Open with it.' },
  'fire-jet':     { el: 'fire', name: 'Fire Jet', icon: ['b', 6], kind: 'jet', dur: 1.1, fwd: 17, up: 7, cd: 10, chi: 12, off: true, text: 'Rocket forward on jets of fire.' },
  'dragon-breath': { el: 'fire', name: "Dragon's Breath", icon: ['b', 3], kind: 'cone', dmg: 30, radius: 12, arc: 70, cd: 10, chi: 25, burn: 6, text: 'Breathe fire over everything in front of you.' },
  'meditate':     { el: null, name: 'Meditate', icon: ['b', 8], kind: 'channel', dur: 4, cd: 2, chi: 0, text: 'Channel 4 s: chi 25 / s and health 6 % / s. Moving breaks it.' },
  'avatar-state': { el: null, name: 'Avatar State', icon: ['b', 9], kind: 'avatar', dur: 12, cd: 90, chi: 0, harmony: 5, text: 'Needs 5 Harmony. 12 s: double damage, spells cost no chi.' },
};
export const BARS = {
  air: ['air-blast', 'wind-darts', 'tornado', 'cyclone-bind', 'air-dash', 'air-shield'],
  water: ['ice-spears', 'water-whip', 'ice-prison', 'hailstorm', 'mist-step', 'healing-waters'],
  earth: ['rock-throw', 'stone-spike', 'earthquake', 'stone-armor', 'earth-launch', 'boulder-fall'],
  fire: ['fireball', 'fire-blast', 'dragon-breath', 'lightning', 'fire-jet', 'ring-of-fire'],
};
export const EXTRA = { meditate: 'meditate', avatar: 'avatar-state' };
export const RULES = {
  gcd: 1.5, gcdFloor: 0.75, queueMs: 400, facingDot: 0, missBase: 0.04, drWindow: 18000, drSteps: [1, 0.5, 0.25, 0], pandemic: 0.3, healThreat: 0.5, crit: 0.1, critMul: 1.75, dmgPerLevel: 0.12, maxLevel: 20,
  hp: (l) => 100 + 22 * (l - 1), chiMax: (l) => 100 + 5 * (l - 1), chiRegen: 12, fsr: 5000, fsrRegen: 0.2, shatter: 0.5, rootBreak: 0.2, ignite: 0.4, pushback: 500, pushMax: 2, moveCancel: 0.2, hpRegenOut: 0.04,
  xpNeed: (l) => 80 + 60 * l, combatMs: 5000, respawnMs: 2500, harmonyMax: 5, avatarMul: 2, targetRange: 45,
};
// Dens ring the home ~130-145 m out, where the woods thicken. Level climbs clockwise from the first den (west).
export const DENS = {
  'wolf-den-mossback':  { name: 'Mossback Den', x: -135, z: -45, levels: [1, 3], count: 3, mob: 'Mossback Wolf', coat: 'moss', yaw: 70 },
  'wolf-den-fernshade': { name: 'Fernshade Hollow', x: -30, z: -145, levels: [3, 5], count: 4, mob: 'Fernshade Prowler', coat: 'grey', yaw: 10 },
  'wolf-den-ashpine':   { name: 'Ashpine Lair', x: 70, z: -124, levels: [5, 7], count: 4, mob: 'Ashpine Stalker', coat: 'ash', yaw: -30 },
  'wolf-den-briar':     { name: 'Briarback Run', x: 125, z: -65, levels: [7, 9], count: 4, mob: 'Briarback Ravager', coat: 'rust', yaw: -80 },
  'wolf-den-hollow':    { name: 'The Dread Hollow', x: -105, z: -100, levels: [9, 11], count: 3, mob: 'Hollow Dreadfang', coat: 'dread', yaw: 45,
    boss: { name: 'Grimfang the Hollow Alpha', level: 12, coat: 'grim', scale: 1.55 } },
};
export const WOLF = {
  hp: (l) => 45 + 22 * l, hitbox: 0.6, miss: 0.05, dodge: 0.05, crit: 0.05, crush: 0.15, threatMelee: 1.1, threatRanged: 1.3, rangedAt: 9, bite: (l) => 3 + 1.8 * l, biteEvery: 1.7, reach: 2.1, aggro: 13, assist: 18, leash: 40, aggroBase: 20, aggroMin: 5, aggroMax: 45, social: 12, swing: 2.0, windup: 0.35, cone: 60, turn: 360, evadeSpeed: 1.4, evadeRegen: 0.2, rest: 1.5, unreachable: 5, fleeAt: 0.2, fleeFor: 4, fleeCry: 15, patrol: 5, repath: 0.8, sep: 1.5,
  run: 6.2, walk: 1.3, eliteHp: 3.2, eliteBite: 1.6, respawn: 40, xp: (l) => 25 + 12 * l, eliteXp: 4, corpse: 6,
};
export const QUESTS = [
  { id: 'thin', title: 'Thin the Packs', text: 'The wolves have crept close to home. Slay 10 of them.', need: 10, stat: 'kills', xp: 300 },
  { id: 'grim', title: 'Grimfang', text: 'Track the Hollow Alpha to the Dread Hollow and put him down.', need: 1, stat: 'grimfang', xp: 900, elite: true },
];
