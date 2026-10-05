# Style transfer: @camptons_world/the-first-den look

Give my new den the exact look of @camptons_world/the-first-den. Read its files directly (Read '@camptons_world/the-first-den/<path>') and copy them, don't approximate.

**Shader (scripts/lighting.js, set as world lighting):** soft 3-band cel lighting. Each band has a 15% feathered edge. Sun is tinted pale amber (1.08, 0.98, 0.82) and shade is periwinkle/slate (0.78, 0.86, 1.18), so every face shows two colours, lit and shade. Plants are detected by green-dominant albedo and get back-lit translucency: the sun glows warm through leaves. Small dapple puddles of sun (1.6 m noise) break through canopy shadow onto the ground.

**Post look (scripts/look-den.js, atmosphere.look):** warm grade (exposure 1.05, sat 1.02, contrast 1.04, temperature 0.04), a breath of horizon-blue haze (oklch 0.86 0.04 245), and soft 8-tap contact shadows where bushes, posts and feet meet the ground (high/ultra quality). Ink outlines work like an inverted hull on everything in one pass: 2px silhouette and crease lines in warm dark brown (0.32, 0.28, 0.26), multiplied so they darken, never gray, and fade out past ~140 m. Light vignette, bloom 0.22.

**Environment (places/main/config.yaml atmosphere):** always a nice day, time frozen at 11:00. Hosek sky, turbidity 2.4. Soft white clouds (density 0.36, altitude 1100). Linear fog 90–700 m with height fog (base 4, falloff 45) to push mountains back. Wind 2.5 from 225°. Gravity −24. Around spawn: god-ray shafts, floating pollen motes and drifting leaves.

**Floor (terrain):** heightmap from a seeded generator (scripts/forest-terrain.js). Every ground material is a stylized PAINTED texture with big soft brush clumps, never photographic: forest-floor leaf clumps, moss-grass, riverbank mud, garden mulch, mown lawn. All use stochastic anti-tiling, textureScale 5, normalStrength 0.15, a gentle macro hue/value variation and warm tints. Paths and roads are terrain marks: gravel paths with pebble edges and noise 0.35, pale limestone cobble for town, flatten marks under every site, clear-scatter so no tree ever touches a path. Teal water (oklch 0.55 0.08 175), clear, soft shore foam.

**Trees (scripts/gen/tree-kit.js + scripts/gen/forest-plant.js + valley-tree.js, scattered from the terrain config):**
- Broadleaf: a bent, tapered trunk with a lobed root flare that forks into heavy limbs. Each limb carries one of 3–5 big pillowy cloud masses with lumpy bumps, and sky shows through the gaps between them. Normals point out from each mass's centre so the canopy lights as one soft volume. Vertex-colour ramp from deep shade green at the base to sunlit lime at the top (#1f3a24 → #9cc160; a spring variant runs lighter).
- Pines: a bent trunk under asymmetrical, drooping, alternating tilted tiers.
- Saplings and shrubs use the same puffs.
- All of them have LOD levels and wind sway.

**Every other model:** wrap each geometry generator in softened() (scripts/gen/soften.js). It keeps the shapes but rebuilds the lighting normals, so leafy faces swell out from their mass centre (hedges, vines and bushes go pillowy) and flat surfaces stay crisp. Animals and creatures use smooth shading.

**Palette:** buttercream plaster #f2e6cf, walnut #4f3828, honey oak #ba8950, sage #9baf84, still teal #5dada9, slate #343c43. lowpoly-cozy family.
