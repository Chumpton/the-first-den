import {RADIO_LIBRARY} from './radio-library.js';
export const DEVICES = {
  clock: { diameter:.54, depth:.08, sampleSeconds:1 },
  radio: { width:.54,height:.31,depth:.26,reach:3,debounceMs:350,volume:.24,refDistance:8,maxDistance:22,migrationFade:.25,audioMode:'spatial-speaker-v1' },
  stations:RADIO_LIBRARY.stations,
  fuzz:RADIO_LIBRARY.fuzz,
  reports:RADIO_LIBRARY.reports,
  guest:RADIO_LIBRARY.guest,
  click:'/cdn/moodboard-lowpoly-cozy/sfx-small-radio-brass-knob-mechanical-click.mp3'
};

// One placed voice for songs, tuning and bulletins, all through the actual radio.
export function radioAudio(powered,station=0,song=0){
  if(!powered)return null;
  const r=DEVICES.radio,s=DEVICES.stations[station]||DEVICES.stations[0];
  const track=s.songs[song]||s.songs[0];
  return {kind:'clip',clip:track.ref,gain:r.volume,loop:false,spatial:true,refDistance:r.refDistance,maxDistance:r.maxDistance,bus:'Music'};
}
