import * as THREE from 'three';
import { DARK_BELOW } from './protocol';
import { terrainVertex } from './terrain-shader';

// The map view. It draws only what the sim's rules act on, as a few flat
// zones with soft edges and an ink contour, so it reads like a map rather than
// a heat haze. The plane sits just behind the sprites, so survivors and
// buildings stay sharp on top of it.
//
// Warmth: r = hearth light, g = all light, b = hearth light tonight, a = open cell.
// uMarks: r = coal, so the warmth view shows where the next fuel is; g = smoke;
// b = room kind (sim ROOM_* times 51), so closed-off rooms read as rooms.

const fragment = /* glsl */ `
  uniform sampler2D uField;
  uniform sampler2D uMarks;
  uniform vec2 uSize;
  uniform float uFade;
  uniform float uTime;
  uniform float uForecast; // 1 by day, when tonight's reach differs from now
  varying vec2 vUv;

  const float DARK = ${(DARK_BELOW / 255).toFixed(4)};

  const vec3 COLD = vec3(0.035, 0.06, 0.13);
  const vec3 ICE = vec3(0.486, 0.769, 1.0);
  const vec3 EMBER = vec3(1.0, 0.55, 0.2);
  const vec3 GLOW = vec3(1.0, 0.85, 0.58);
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

    // Smoke: a grey haze with drifting hatching where it is thick enough to matter.
    float smoke = texture2D(uMarks, vUv).g;
    float haze = smoothstep(0.15, 0.6, smoke) * open;
    vec3 ASH = vec3(0.55, 0.55, 0.58);
    col = mix(col, ASH, haze * 0.75); a = mix(a, 0.7, haze);
    float wisps = hatch(7.0, -0.1) * haze * 0.5;
    col = mix(col, ASH * 1.3, wisps);
    float smokeEdge = contour(smoke, 0.4, 1.4) * open;
    col = mix(col, vec3(0.8, 0.8, 0.82), smokeEdge); a = max(a, smokeEdge * 0.9);

    // Rooms: a faint wash and an ink line around each closed-off pocket, tinted
    // by kind: warm amber for a hearth room, violet for a bedroom, teal for a cellar.
    float roomKind = texture2D(uMarks, vUv).b * 5.0;
    float room = step(0.5, roomKind) * open;
    vec3 ROOM_COL = roomKind < 1.5 ? vec3(0.85, 0.85, 0.8) : roomKind < 2.5 ? vec3(1.0, 0.7, 0.35) : roomKind < 3.5 ? vec3(0.72, 0.6, 1.0) : vec3(0.45, 0.9, 0.8);
    col = mix(col, ROOM_COL, room * 0.18);
    float roomEdge = contour(texture2D(uMarks, vUv).b, 0.1, 1.5) * open;
    col = mix(col, ROOM_COL, roomEdge); a = max(a, roomEdge * 0.9);

    // Push the rock back so the open caves read. Coal stays visible as
    // glinting seams: it is what keeps the fire going.
    float m = texture2D(uMarks, vUv).r;
    float coal = smoothstep(0.35, 0.65, m);
    float rim = contour(m, 0.5, 1.3) * (1.0 - open);
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
