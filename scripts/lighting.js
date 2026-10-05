// The den's light: soft 3-band cel steps under one warm amber sun and a cool periwinkle bounce, so every
// faceted face reads in two colours, lit and shade. Plants (green-dominant albedo) let the sun bleed through
// from behind, and inside the canopy's shadow small puddles of sun break through (dappling).
// The old physically-based model lives in this file's history (before the 2026-10-05 style pass).
import { dot, max, min, mix, normalize, pow, clamp, float, vec3, oneMinus, floor, fract, smoothstep, mx_noise_float } from "builtin/tsl";

const SUN_TINT = vec3(1.08, 0.98, 0.82);   // pale amber key
const SHADE_TINT = vec3(0.78, 0.86, 1.18); // periwinkle / slate fill
const BANDS = 3;

function cel(x) { // three soft steps: a hard read with a 15 % feathered edge between bands
  const s = x.mul(BANDS);
  return floor(s).add(smoothstep(0.2, 0.8, fract(s))).div(BANDS);
}

export function lighting(surface, lights) {
  const { albedo, normal: N, view: V, roughness, metalness, position: P } = surface;
  const leafy = clamp(albedo.y.sub(max(albedo.x, albedo.z)).mul(6), 0, 1); // how much this surface is plant
  // dapples: sun puddles that survive inside shadow, a 1.6 m noise field, hard-edged like light through leaves
  const dap = smoothstep(0.35, 0.5, mx_noise_float(vec3(P.x.mul(0.6), P.y.mul(0.3), P.z.mul(0.6))));

  const direct = lights.each((light) => {
    const L = light.direction;
    const ndl = max(dot(N, L), 0);
    const step3 = cel(ndl);
    const lit = max(light.shadow, dap.mul(0.55).mul(smoothstep(0.2, 0.6, N.y)));
    const H = normalize(V.add(L));
    const spec = pow(max(dot(N, H), 0), float(8).add(oneMinus(roughness).mul(56))).mul(oneMinus(roughness).mul(0.25));
    const diffuse = albedo.mul(oneMinus(metalness)).div(Math.PI).mul(step3).add(spec);
    // translucency: the sun behind a leaf, seen through it
    const back = pow(max(dot(V, L.negate()), 0), 3).mul(leafy).mul(0.45).mul(light.shadow.mul(0.6).add(0.4));
    const through = albedo.mul(vec3(1.25, 1.15, 0.55)).mul(back).div(Math.PI);
    return diffuse.add(through).mul(light.color).mul(SUN_TINT).mul(lit);
  });

  const f0 = mix(vec3(0.04), albedo, metalness);
  const ambient = albedo.mul(oneMinus(metalness)).add(f0).mul(lights.ambient).mul(SHADE_TINT).mul(1 / Math.PI);
  return direct.add(ambient.add(lights.environment.mul(SHADE_TINT)).mul(surface.occlusion));
}
