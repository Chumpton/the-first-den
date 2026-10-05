# Prompt: build this forest from scratch

Paste everything below the line into Savi in the new den. It tells her how to write every piece fresh. Nothing gets copied from the First Den.

---

Build me a stylized low-poly ARPG forest from scratch. Write every script yourself and don't copy files from another world. Before you start, load your geometry, heightmap-terrain, atmosphere, looks and fx skills. The target look: faceted low-poly shapes that light like soft pillows, warm amber sun, cool periwinkle shade, thin warm-dark ink outlines, painted ground, always a sunny late morning.

## 1. Sky, hour, air (place config → atmosphere)
- Realistic Hosek sky, turbidity 2.4. Time frozen at 11:00, so it's always a nice day.
- Clouds on: density 0.36, opacity 0.85, speed 4, altitude 1100, thickness 800, white.
- Linear fog from 90 to 700 m, plus height fog (base 4, falloff 45), so distant hills fade into the horizon blue.
- Wind from 225° at 2.5. Gravity −24.
- Around the spawn: a few soft god-ray shafts slanting through the canopy, slow pollen and dust motes, and an occasional drifting leaf. Keep it light, about 10 shafts and a few dozen motes, so the fx budget holds.

## 2. Lighting model (scripts/lighting.js, set as the world's lighting; TSL)
- **3-band cel steps:** take N·L × 3, floor it, then add smoothstep(0.2, 0.8) of the fractional part so each band edge is feathered, not razor-hard. Divide by 3.
- **Key light:** multiply the direct light by a pale amber SUN_TINT of (1.08, 0.98, 0.82).
- **Fill:** multiply ambient and environment light by a periwinkle SHADE_TINT of (0.78, 0.86, 1.18). Every face then reads in two colours, warm lit and cool shade, never grey.
- **Leaf detection:** `leafy = clamp((albedo.g − max(albedo.r, albedo.b)) × 6)`. Green-dominant surfaces count as plants.
- **Translucency:** `pow(max(dot(V, −L), 0), 3) × leafy × 0.45`, tinted albedo × (1.25, 1.15, 0.55). Leaves glow warm when the sun is behind them.
- **Dappling:** a noise field on world position (x×0.6, y×0.3, z×0.6), passed through smoothstep(0.35, 0.5). In shadow, upward-facing surfaces get 55 % light back where the noise is on, so sun puddles fall on the path under trees.
- **Specular:** a small Blinn term, `pow(N·H, 8 + (1−rough)×56) × (1−rough) × 0.25`.

## 3. Post look (scripts/look-den.js as atmosphere.look)
- **Grade:** exposure 1.02, saturation 1.02, contrast 1.04, temperature 0.04, haze 0.07 tinted oklch(0.86 0.04 245).
- **Contact shadows (high/ultra only):** 8 depth taps in a ring, radius 0.012 / sqrt(depth). Darken by up to 55 % where a neighbour sits nearer, fading out between 30 and 80 m. This grounds bush bases, posts and feet.
- **Ink outline in one pass, like an inverted hull on everything:** a 2 px depth-step silhouette (smoothstep 0.035–0.08 of the relative depth jump), plus normal creases at 35 % strength. Multiply the line in as warm dark brown (0.32, 0.28, 0.26), never black and never grey. Fade it out between 25 and 140 m.
- Vignette 0.10 in #302e2a, bloom strength 0.32, radius 0.85, threshold 1.0.

## 4. Ground (heightmap generator, scripts/forest-terrain.js)
- **Floor:** flat at y = 0.5, with a gentle fbm roll (frequency 1/90, 3 octaves, ±0.35 m).
- **Rivers:** two endless meandering rivers, each the zero line of a domain-warped noise. Main river: warp amplitude 60, warp frequency 1/300, frequency 1/700, half-width 0.045 in noise units. Tributary: warp amplitude 80, warp frequency 1/350, frequency 1/1100, half-width 0.03. The channel bed is at −1.7, and a sea mark at level 0 fills it.
- **Dry ground:** list SITES (x, z, radius, fade) for the spots that must stay dry and level, starting with home at radius 70 and fade 60. Rivers bend away from them.
- **Lake:** one round bowl near home, radius 26 and depth 2.6, filled by the same water at 0.
- **Materials:** pebbles below −0.2. Mud below 0.28 + noise×0.1. Above that, blend leaf-litter and moss with an fbm (frequency 1/25), moss = clamp(0.5 + n×1.6).
- **Textures:** every ground texture is a stylized PAINTED texture with big soft brush clumps, never photographic. Name them fresh:
  - `cdn/texture-terrain-stylized-painted-forest-floor-big-soft-leaf-clumps-lowpoly.png` (litter)
  - `cdn/texture-terrain-stylized-painted-moss-grass-broad-brush-clumps-lowpoly.png` (moss)
  - `cdn/texture-terrain-stylized-painted-riverbank-mud-soft-brush-lowpoly.png` (mud)
  - river pebbles for the riverbeds
  - all with stochastic anti-tiling, textureScale 5, normalStrength 0.15, roughness 0.6, macro variation (hue 0.012–0.015, scale 40–50, value 0.07–0.08), and warm tints.

## 5. The tree kit (scripts/gen/tree-kit.js), the heart of the look
Write a `mesher(ctx)` where every triangle carries its own lighting normals, returned as `{ normals }` from geometry(). The mesh stays low-poly while the lighting stays round.
- **`tube(points, radii, sides, phase, flare)`** builds a bent tube through a spine. Ring normals point straight out from the spine, so trunks light as round wood. On ring 0, `flare` adds a lobed root skirt: radius × (1 + flare × max(0, sin(5a + phase×3))²), sunk 5 cm, with normals tipped up (dir.x, 0.6, dir.z).
- **`puff(center, rx, ry, rz, segs, pivot, colorAt)`** builds a lumpy lat-long ball (lat = segs×0.7, every vertex jittered 0.9–1.08, bottom flattened to 0.75). Every normal points from the shared **pivot** (the mass centre), not the face. That's the trick: overlapping puffs light as one soft cloud. Colour each quad with colorAt(midpoint, normal).
- **`spine(base, top, bend, steps)`** gives a gentle quadratic bow (sin(tπ) × bend) in a seeded direction.
- **`ramp(hexStops, t)`** is a vertex-colour gradient.

## 6. Plants (scripts/gen/forest-plant.js, params.kind)
- **Broadleaf** (height 16–32, radius 4.4–7):
  - The trunk follows a spine to a fork at 42–50 % of the height, with base radius h×0.03×1.5 tapering to 0.85 of that. Root flare 0.9, 9 sides (5 at far LOD).
  - From the fork, **3–5 pillowy masses**. The lead mass sits at the top, size r×0.66. The others sit at radius r×0.4–0.62 around the fork, size r×0.48–0.62, at heights between the fork and the top.
  - A heavy limb tube runs from the fork into each mass. Each mass is one big puff (ry = 0.74×size) plus 4 smaller bump puffs (2 at mid LOD, 0 far). All share the mass's pivot, which sits 0.25×size below its centre.
  - Leave gaps of sky between the masses.
  - Colour ramp from crown bottom to top plus normal.y × 0.25:
    - deep forest: #1f3a24 → #34603a → #5a8c45 → #9cc160
    - spring: #2f4a22 → #4d7a32 → #78a744 → #b4d36a
  - Bark tint #6e5a48 (spring #8d7a63).
- **Sapling** (height 6–8): a thin bent trunk with 3 puffs around 66–78 % of its height. Gradient #24422a → #3d6a3c → #64944a → #a2c564.
- **Shrub** (height 1.1–1.3): 4 puffs sharing one pivot low in the bush. Gradient #21402a → #98bf5e. The berry variant is darker and gets 12 tiny red #c02a3e berries.
- **Fern** (size 0.6–0.9): 10 fronds, each 6 arched segments of paired leaflets narrowing to the tip, alternating #4a8a3a / #5c9c43. Flat shaded.
- **Reed** (height 1.4): 14 leaning blades #6f9a48 / #8aa856, with a brown cattail head #6b4a2e on every fourth.
- **Log** (length 6, radius 0.35): a 9-sided barrel with pale cut ends #c8a77a and moss lumps on top.
- **Collider:** a broadleaf gets a trunk box (h×0.06 wide, h×0.5 tall). A log gets its box. Everything else gets none.
- **LOD everywhere:** drop sides, segments and bumps at ctx.lod 3 and 4.

## 7. Evergreens (scripts/gen/valley-tree.js, params.crown fir | pine)
- **Trunk:** spine to 92 % of the height, radius h×0.03 tapering 85 %, root flare 1.1.
- **Tiers:** 5–6 skirts (3 far). The first tier starts at 17 % of the height (12 % for pine), and the radius shrinks as (1−t)^0.9 with ±12 % random.
- **Skirts:** 12 points per skirt, alternating long and short (short = 0.68 length). The long tips droop by w×0.22. Each tier tilts its own random way (6–14 %) at its own random rotation, so no two angles match.
- **Lighting:** normals swell out from a pivot below each tier, with y squashed 0.8. Add a dark underside #14281c so boughs read heavy from below.
- **Gradient:** #183424 → #2b5235 → #4a7a3f → #86a957, lighter toward the top tiers.

## 8. Painted textures in code
- **Canopy** (`scripts/tex-*-canopy.js`, 128², linear filter): a sage base #92ae92 with 180 soft wrapping polygon blotches at 35 % alpha in #759980 / #a5bb97 / #82a48d / #b1c59e / #87a78c, plus 220 tiny leaf strokes.
- **Bark** (`scripts/tex-*-bark.js`): a #8b8c78 base with 95 vertical wiggly grain strokes in #b0ae8b / #69786b / #969a80.
- Both multiply under the vertex colours.

## 9. Grass and flowers
- **Meadow tuft** (height 0.07–0.22): 3 blades, each a quad #729759 topped with a tri #9bbb70, leaning out from centre. Flat shaded, with sway on.
- **Wildflower clump:** stems in oklch(0.5 0.1 135), one leaf, star-petalled heads. Params hue / chroma / light / height / heads / petals. Use six colour families: magenta 300, butter yellow 90, blue 255, coral 25, white 95 at chroma 0.02, and rose 350.

## 10. Softened normals for everything else (scripts/gen/soften.js)
A wrapper `softened(geometryFn)`: for each green-dominant (leafy) face it rebuilds the normals to point out from that connected mass's centre, so hedges, vines and bushes go pillowy. Broad flat surfaces and anything marked smooth or flat keep their own lighting. Wrap every prop and building generator in it. Creatures use smooth shading so they sit in the same light.

## 11. Scatter layers (terrain.layers, bound to litter and moss)
| layer | density /m² | items | draw distance |
|---|---|---|---|
| canopy | 0.006 | 5 broadleaf variants (2 spring) + 2 firs, scale 0.8–1.25 | 420 m |
| ancients | 0.00045 | one giant broadleaf (h 54, r 11) + one giant fir (h 62), slope < 0.15 | 900 m |
| midstory | 0.011 | saplings h 6/8 + small pine h 8 | 200 m |
| shrubs | 0.045 | shrub + berry shrub | 90 m |
| ferns | 0.15 | two sizes | 45 m |
| ground | 2 | meadow tuft h 0.22 | 26 m |
| wildflowers | 0.6 | the 6 colours, noise patches (scale 0.07, threshold 0.55), slope < 0.35 | 60 m |
| logs | 0.001 | logs + hollow logs, slope < 0.1 | 120 m |
| reeds | 0.5, on mud | reeds, avoidWater | 70 m |

- Every layer gets heightRange [0.3, 5], random rotation, and a small colorJitter (hue 0.012–0.02).
- Paths get a clear-scatter mark plus a few metres of margin, so no tree ever touches a path.

## 12. Palette (lowpoly-cozy)
Buttercream plaster #f2e6cf, walnut #4f3828, honey oak #ba8950, sage #9baf84, still teal #5dada9, slate #343c43.

## Acceptance
Stand at spawn at 11:00. You should see:
- broadleaf crowns reading as 3–5 soft lit clouds with sky windows between them
- firs with ragged, drooping, tilted tiers
- trunks that bend and flare into the ground
- warm amber lit sides with periwinkle shade, never grey
- thin brown ink around silhouettes
- sun puddles on the path under the canopy
- painted ground, no photo grain
- leaves glowing when you look toward the sun
- god rays and motes around the spawn
