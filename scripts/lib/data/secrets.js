// The den's hidden secrets: key → what pressing it says and does. total drives "secret N of 7".
const S = '/cdn/moodboard-lowpoly-cozy/';
export default {
  total: 7,
  cooldownMs: 6000,
  chime: S + 'sfx-secret-found-magical-harp-sparkle-chime.mp3',
  list: {
    heart:     { name: 'the heart of the maze', line: 'The giant sunflower showers you in gold.', act: 'petals', sound: S + 'sfx-warm-choir-swell-golden-shimmer.mp3' },
    nest:      { name: 'the golden egg', line: 'Something ancient answers the egg...', act: 'dragons', sound: S + 'sfx-distant-dragon-call-echoing-over-valley.mp3' },
    fairydoor: { name: 'the fairy door', line: 'A tiny voice: "thank you for knocking."', act: 'fairies', sound: S + 'sfx-tiny-fairy-bells-giggle-twinkle.mp3' },
    frog:      { name: 'the stone frog', line: 'It rains frogs. Of course it does.', act: 'frogs', sound: S + 'sfx-chorus-of-happy-frogs-croaking.mp3' },
    bottle:    { name: 'the message in a bottle', line: '"Whoever finds this: the lake remembers you. Love, R + C"', act: 'fireworks', sound: S + 'sfx-fireworks-bursting-over-lake-pops-crackle.mp3' },
    gnome:     { name: 'the cellar gnome', line: 'The gnome is throwing a party. You are invited.', act: 'party', sound: S + 'sfx-tiny-gnome-accordion-party-jingle.mp3' },
    mushrooms: { name: 'the fairy ring', line: 'Time slows. The spores glitter.', act: 'slow', sound: S + 'sfx-dreamy-slow-magic-whoosh-reverse-shimmer.mp3' },
  },
};
