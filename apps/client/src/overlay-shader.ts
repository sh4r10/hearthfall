import * as THREE from 'three';
import { DARK_BELOW, START_OXYGEN_MG, SUFFOCATE_BELOW_MG } from './protocol';
import { terrainVertex } from './terrain-shader';

// The map views. Each one draws only what the sim's rules act on, as a few flat
// zones with soft edges and an ink contour, so it reads like a map rather than
// a heat haze. The plane sits just behind the sprites, so survivors and
// buildings stay sharp on top of it.
//
// Warmth: r = hearth light, g = all light, b = hearth light tonight, a = open cell.
// Air:    r = oxygen (0..AIR_SCALE mg), a = open cell.
// uMarks: r = coal, so the warmth view shows where the next fuel is.

/** Oxygen that fills the air channel; a little above a fresh cave so fresh air isn't saturated. */
export const AIR_SCALE = 3000;
/** Oxygen below which the air view calls a cell stale. */
export const STALE_BELOW_MG = 900;

export const OVERLAY_MODE = { none: 0, warmth: 1, air: 2 } as const;

const fragment = /* glsl */ `
  uniform sampler2D uField;
  uniform sampler2D uMarks;
  uniform vec2 uSize;
  uniform float uMode;
  uniform float uFade;
  uniform float uTime;
  uniform float uForecast; // 1 by day, when tonight's reach differs from now
  varying vec2 vUv;

  const float DARK = ${(DARK_BELOW / 255).toFixed(4)};
  const float SUFFOCATE = ${(SUFFOCATE_BELOW_MG / AIR_SCALE).toFixed(4)};
  const float STALE = ${(STALE_BELOW_MG / AIR_SCALE).toFixed(4)};
  const float FRESH = ${(START_OXYGEN_MG / AIR_SCALE).toFixed(4)};

  const vec3 COLD = vec3(0.035, 0.06, 0.13);
  const vec3 ICE = vec3(0.486, 0.769, 1.0);
  const vec3 EMBER = vec3(1.0, 0.55, 0.2);
  const vec3 GLOW = vec3(1.0, 0.85, 0.58);
  const vec3 AMBER = vec3(1.0, 0.706, 0.329);
  const vec3 DANGER = vec3(1.0, 0.42, 0.42);
  const vec3 ROCK = vec3(0.015, 0.02, 0.03);

  // 1 on the side of 'edge' that v exceeds, with a soft one-pixel step.
  float zone(float v, float edge) { float w = fwidth(v) * 0.75 + 0.002; return smoothstep(edge - w, edge + w, v); }
  // A crisp line about 'px' pixels wide where v crosses edge.
  float contour(float v, float edge, float px) { return 1.0 - clamp(abs(v - edge) / max(fwidth(v), 1e-4) - px * 0.5 + 0.5, 0.0, 1.0); }
  // Thin diagonal hatching in screen space, so it stays fine at any zoom, drifting slowly.
  float hatch(float period, float speed) {
    float d = abs(fract((gl_FragCoord.x + gl_FragCoord.y) / period - uTime * speed) - 0.5) * period;
    return 1.0 - smoothstep(1.0, 2.0, d);
  }
  // Screen-space dashes for a contour line, at any angle.
  float dashes() { return step(0.45, fract((gl_FragCoord.x + gl_FragCoord.y * 0.5) / 11.0 - uTime * 0.3)); }

  void main() {
    vec4 f = texture2D(uField, vUv);
    float open = smoothstep(0.3, 0.7, f.a);
    vec3 col; float a;

    if (uMode < 1.5) {
      float warm = zone(f.r, DARK);
      float lit = zone(f.g, DARK);
      float tonight = mix(warm, zone(f.b, DARK), uForecast);
      // The cold dark: Shades hunt here and survivors freeze.
      col = COLD; a = 0.66;
      // Lamp light: safe from Shades, but cold.
      col = mix(col, ICE * 0.55, lit); a = mix(a, 0.30, lit);
      // Firelight: survivors warm up. Brighter towards the fire.
      float heat = smoothstep(DARK, 0.95, f.r);
      vec3 fire = mix(EMBER, GLOW, heat * heat);
      col = mix(col, fire, warm); a = mix(a, 0.16 + 0.2 * heat, warm);
      // Warm now, cold tonight: cool hatching over the warm tint, so it reads as a warning.
      float shrinking = warm * (1.0 - tonight);
      float lines = hatch(9.0, 0.15) * shrinking;
      col = mix(col, COLD * 1.6, lines); a = mix(a, 0.62, lines);
      // Ink edges: a solid line where the warmth ends now, a dashed one where it will end tonight.
      float edge = contour(f.r, DARK, 1.8) * open;
      col = mix(col, vec3(1.0, 0.72, 0.4), edge); a = max(a, edge * 0.95);
      float night = contour(f.b, DARK, 1.8) * open * uForecast * dashes();
      col = mix(col, vec3(0.78, 0.88, 1.0), night); a = max(a, night * 0.9);
    } else {
      float o = f.r;
      float stale = 1.0 - zone(o, STALE);
      float bad = 1.0 - zone(o, SUFFOCATE);
      // Fresh air is barely tinted; it only matters where it is running out.
      float fresh = smoothstep(STALE, FRESH, o);
      col = ICE; a = 0.08 + 0.1 * fresh;
      col = mix(col, AMBER, stale); a = mix(a, 0.34, stale);
      col = mix(col, DANGER, bad); a = mix(a, 0.42 + 0.25 * hatch(8.0, 0.2), bad);
      float edge = contour(o, STALE, 1.4) * open;
      col = mix(col, AMBER, edge); a = max(a, edge * 0.9);
    }

    // Push the rock back so the open caves read. In the warmth view coal stays
    // visible as glinting seams: it is what keeps the fire going.
    float m = texture2D(uMarks, vUv).r;
    float coalMode = step(uMode, 1.5);
    float coal = smoothstep(0.35, 0.65, m) * coalMode;
    float rim = contour(m, 0.5, 1.3) * coalMode * (1.0 - open);
    vec3 solid = mix(ROCK, vec3(0.07, 0.04, 0.025), coal);
    solid = mix(solid, vec3(0.9, 0.5, 0.25), rim);
    col = mix(solid, col, open);
    a = mix(mix(mix(0.55, 0.45, coal), 0.6, rim), a, open);
    gl_FragColor = vec4(col, a * uFade);
  }
`;

export function overlayMaterial(field: THREE.Texture, marks: THREE.Texture, width: number, height: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uField: { value: field },
      uMarks: { value: marks },
      uSize: { value: new THREE.Vector2(width, height) },
      uMode: { value: OVERLAY_MODE.warmth },
      uFade: { value: 0 },
      uTime: { value: 0 },
      uForecast: { value: 0 },
    },
    vertexShader: terrainVertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
  });
}
