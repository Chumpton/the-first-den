// All durations in seconds, measured with ffprobe on the exact served/uploaded MP3.
// Reports preserve the same generated host and exact words, paced with pitch-preserving atempo=0.67.
// Source references preserve the shared voice identity for provenance; playback uses the paced files.
export const RADIO_REPORT_SOURCES = {
  "lake-forecast": "/cdn/voice-clear-friendly-adult-woman-local-radio-host-natural-measured-delivery-saying-a-quick-lake-forecast-a-rain-front-is-crossing-the-hills-and-should-reach-us-in-about-a-minute-keep-a-coat-by-the-door-now-back-to-the-music.mp3",
  "ridge-forecast": "/cdn/voice-clear-friendly-adult-woman-local-radio-host-natural-measured-delivery-saying-from-the-lake-weather-desk-clouds-are-thickening-over-the-ridge-rain-is-due-in-about-a-minute-so-bring-anything-drying-outside-back-in-stay-cozy.mp3"
};

export const RADIO_LIBRARY = {
  "stations": [
    {
      "id": "lake",
      "name": "Lake FM",
      "frequency": "88.6",
      "songs": [
        {
          "id": "lakeside",
          "title": "Lakeside",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-fingerpicked-acoustic-guitar-and-piano-instrumental-no-vocals-lakeside-loop.mp3",
          "duration": 160.08
        },
        {
          "id": "first-light",
          "title": "First Light",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-first-light-cozy-unhurried-nylon-guitar-cello-duet-major-pentatonic-arpeggios-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 127.032
        },
        {
          "id": "birch-walk",
          "title": "Birch Walk",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-birch-walk-cozy-unhurried-felt-piano-clarinet-lyrical-three-four-waltz-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 161.832
        },
        {
          "id": "open-window",
          "title": "Open Window",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-open-window-cozy-unhurried-steel-string-fingerstyle-guitar-upright-bass-syncopated-folk-six-eight-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 176.376
        },
        {
          "id": "homeward",
          "title": "Homeward",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-homeward-cozy-unhurried-mandolin-light-acoustic-guitar-modal-folk-lilting-melody-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 113.04
        }
      ]
    },
    {
      "id": "afterglow",
      "name": "Afterglow",
      "frequency": "104.8",
      "songs": [
        {
          "id": "evening",
          "title": "Evening",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-brushed-jazz-piano-upright-bass-instrumental-no-vocals-evening-loop.mp3",
          "duration": 138.84
        },
        {
          "id": "blue-hour",
          "title": "Blue Hour",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-blue-hour-cozy-unhurried-rhodes-electric-piano-brushed-drums-bass-jazz-suspended-chords-lazy-backbeat-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 167.04
        },
        {
          "id": "lamplight",
          "title": "Lamplight",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-lamplight-cozy-unhurried-jazz-guitar-vibraphone-upright-bass-trio-gentle-swing-major-sevenths-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 117.432
        },
        {
          "id": "last-ferry",
          "title": "Last Ferry",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-last-ferry-cozy-unhurried-flugelhorn-piano-brushed-drums-jazz-ballad-spacious-descending-melody-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 135.576
        },
        {
          "id": "rain-on-glass",
          "title": "Rain on Glass",
          "ref": "/cdn/moodboard-lowpoly-cozy/music-rain-on-glass-cozy-unhurried-tenor-saxophone-piano-upright-bass-jazz-minor-nine-waltz-instrumental-no-vocals-even-dynamics-no-crescendo-loop.mp3",
          "duration": 140.184
        }
      ]
    }
  ],
  "guest": {
    "id": "just-one-more-thing",
    "title": "Just One More Thing",
    "ref": "/cdn/value.8fe946696cefc0d1159945d7b1a1c4efae3f053f993d8de61c6bceeabc369714.mp3",
    "duration": 196.128
  },
  "fuzz": {
    "ref": "/cdn/value.e315ad7197f6c2b3fcff7cdbbeb5dfb85e8d289905bc9c0b75ea500343ced4ff.mp3",
    "duration": 0.816
  },
  "reports": [
    {
      "id": "lake-forecast",
      "ref": "/cdn/value.4751f85ecd7773d5f4338e29af12306df89d17d75c66bc2f6b7a5dd5428307f0.mp3",
      "duration": 12.072,
      "text": "A quick lake forecast. A rain front is crossing the hills and should reach us in about a minute. Keep a coat by the door. Now, back to the music."
    },
    {
      "id": "ridge-forecast",
      "ref": "/cdn/value.1dc797403bccf79d5bdd611e2c1350163f97f0ecc8f3ef7305f5f09149185001.mp3",
      "duration": 13.392,
      "text": "From the lake weather desk: clouds are thickening over the ridge. Rain is due in about a minute, so bring anything drying outside back in. Stay cozy."
    }
  ]
};
