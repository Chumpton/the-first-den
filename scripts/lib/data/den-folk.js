// Rikki and Campton: their seats at the ground-floor table, the clips they sit with, and their chores.
// A chore stop: at [x, z] where they stand, face [x, z] what they look at, clip what they do, secs how long.
export default {
  walk: 1.35,            // m/s indoors and out
  teaSecs: [45, 90],     // seated at the table before getting up
  sitSwapSecs: [9, 16],  // how often the seated clip changes
  workSecs: [7, 13],
  choresPerOuting: [2, 3],
  folk: {
    rikki: {
      seat: [-3.05, -26.3], face: [-4, -26.3], standBy: [-2.3, -26.3],
      sit: ['cdn/clip-sitting-drawing-in-a-sketchbook-loop.glb', 'cdn/clip-sitting-drinking-tea-from-a-cup-loop.glb', 'cdn/clip-sitting-talking-female-loop.glb', 'cdn/clip-sitting-laughing-loop.glb'],
      lines: ["Oh hi! Tea's still warm.", "I'm sketching the lake from memory.", "The roses out back need water later.", "Campton draws better trees than me. Don't tell him."],
      chores: [
        { at: [-4.85, -30.9], face: [-5.01, -31.61], clip: 'cdn/clip-washing-dishes-at-a-sink-loop.glb', label: 'washing up' },
        { at: [-5.66, -28.9], face: [-6.04, -29.49], clip: 'cdn/clip-stirring-a-pot-on-a-stove-loop.glb', label: 'the kettle' },
        { at: [-8, -35.2], face: [-8, -36], clip: 'cdn/clip-watering-plants-with-a-watering-can-loop.glb', label: 'garden', outside: true },
        { at: [5, -13.2], face: [5, -11.6], clip: 'cdn/clip-kneeling-gardening-pulling-weeds-loop.glb', label: 'veg beds', outside: true },
        { at: [-5, -44.3], face: [-5, -45.5], clip: 'cdn/clip-watering-plants-with-a-watering-can-loop.glb', label: 'garden', outside: true },
      ],
      mustOutside: true,
    },
    campton: {
      seat: [-4.95, -26.3], face: [-4, -26.3], standBy: [-5.7, -26.0],
      sit: ['cdn/clip-sitting-drawing-in-a-sketchbook-loop.glb', 'cdn/clip-sitting-drinking-tea-from-a-cup-loop.glb', 'cdn/clip-sitting-talking-loop.glb', 'cdn/clip-sitting-laughing-loop.glb'],
      lines: ["Hey. Grab a cup, there's plenty.", "Drawing the treehouse bridge, one plank at a time.", "Rikki says the pasture needs a new gate.", "Home's home."],
      chores: [
        { at: [-2.5, -21.2], face: [-2.5, -20], clip: 'cdn/clip-sweeping-the-floor-with-a-broom-loop.glb', label: 'sweeping' },
        { at: [-4.72, -20.6], face: [-4.8, -19.88], clip: 'cdn/clip-reaching-to-put-a-book-on-a-shelf-loop.glb', label: 'books' },
        { at: [-5.94, -22.97], face: [-6.29, -22.37], clip: 'cdn/clip-reaching-to-put-a-book-on-a-shelf-loop.glb', label: 'pantry' },
        { at: [5.2, -29.2], face: [5.93, -29.83], clip: 'cdn/clip-wiping-a-table-with-a-cloth-loop.glb', label: 'tidying' },
        { at: [2, -24], face: [4, -24], clip: 'cdn/clip-sweeping-the-floor-with-a-broom-loop.glb', label: 'sweeping' },
      ],
    },
  },
}
