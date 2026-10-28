import * as THREE from 'three';

// The whole cave is one quad. A per-cell material mask, sampled with linear
// filtering and cut at a noisy threshold, turns the square grid into smooth,
// organic shapes (the same idea as marching squares). The mask's gradient
// gives a bevel normal, so rock reads as rounded lumps rather than flat tiles.

export const terrainVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const terrainFragment = /* glsl */ `
  uniform sampler2D uMask;   // r = rock, g = dirt, b = coal, a = water
  uniform sampler2D uLight;  // r = hearth light
  uniform vec2 uSize;        // grid size in cells
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  vec4 mask(vec2 cell) { return texture2D(uMask, cell / uSize); }
  float solidAt(vec2 cell) { vec4 m = mask(cell); return m.r + m.g + m.b; }

  void main() {
    vec2 cell = vUv * uSize;
    vec4 m = mask(cell);
    float solid = m.r + m.g + m.b;

    // Wobble the edge so outlines look hand-drawn rather than geometric.
    float wobble = (fbm(cell * 1.7) - 0.5) * 0.28;
    float edge = 0.5 + wobble;
    float aa = fwidth(solid) * 1.2 + 0.001;
    float inside = smoothstep(edge - aa, edge + aa, solid);

    // Bevel: the mask gradient points out of the rock.
    float e = 0.6;
    vec2 grad = vec2(solidAt(cell + vec2(e, 0.0)) - solidAt(cell - vec2(e, 0.0)),
                     solidAt(cell + vec2(0.0, e)) - solidAt(cell - vec2(0.0, e)));
    vec3 n = normalize(vec3(-grad * 1.6, 0.6 + fbm(cell * 3.0) * 0.4));
    vec3 lightDir = normalize(vec3(-0.5, 0.7, 0.6));
    float lambert = clamp(dot(n, lightDir), 0.0, 1.0);

    // Materials, blended by mask weight.
    float grain = fbm(cell * 2.5);
    float fine = noise(cell * 9.0);
    vec3 rock = mix(vec3(0.36, 0.37, 0.40), vec3(0.55, 0.54, 0.52), grain) * (0.85 + fine * 0.3);
    float strata = smoothstep(0.45, 0.55, fbm(vec2(cell.x * 0.25, cell.y * 1.6)));
    vec3 dirt = mix(vec3(0.42, 0.28, 0.18), vec3(0.55, 0.38, 0.24), strata) * (0.85 + fine * 0.3);
    vec3 coal = vec3(0.11, 0.105, 0.12) * (0.8 + grain * 0.5);
    coal += vec3(0.5, 0.45, 0.35) * step(0.93, noise(cell * 6.0)) * 0.6; // glints
    float wsum = max(solid, 0.001);
    vec3 solidColor = (rock * m.r + dirt * m.g + coal * m.b) / wsum;
    solidColor *= 0.55 + lambert * 0.75;

    // Dark outline just inside the edge, like painted line art.
    float rim = smoothstep(edge - aa, edge + aa * 2.0, solid) * (1.0 - smoothstep(edge + 0.04, edge + 0.16, solid));
    solidColor *= 1.0 - rim * 0.55;

    // Back wall of the cave, darker near rock (cheap ambient occlusion).
    float near = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785;
      near += solidAt(cell + vec2(cos(a), sin(a)) * 1.4);
    }
    near /= 8.0;
    vec3 wall = mix(vec3(0.16, 0.13, 0.11), vec3(0.23, 0.19, 0.16), fbm(cell * 0.6 + 7.0));
    wall *= 0.85 + noise(cell * 4.0) * 0.2;
    wall *= 1.0 - smoothstep(0.0, 0.7, near) * 0.55;

    // Water pools in open space, with a bright surface line.
    float water = smoothstep(0.45, 0.55, m.a);
    float above = mask(cell + vec2(0.0, 0.7)).a;
    float surface = water * (1.0 - smoothstep(0.3, 0.6, above));
    vec3 waterColor = mix(vec3(0.10, 0.28, 0.40), vec3(0.20, 0.45, 0.58), noise(cell * 1.5 + uTime * 0.3));
    vec3 open = mix(wall, mix(wall, waterColor, 0.8), water) + surface * vec3(0.25, 0.4, 0.45) * (0.6 + 0.4 * sin(cell.x * 2.0 + uTime * 2.0));

    vec3 color = mix(open, solidColor, inside);

    // Firelight warms what it touches.
    float light = texture2D(uLight, vUv).r;
    color *= mix(vec3(1.0), vec3(1.35, 1.08, 0.82), light);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function terrainMaterial(mask: THREE.DataTexture, light: THREE.DataTexture, width: number, height: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMask: { value: mask },
      uLight: { value: light },
      uSize: { value: new THREE.Vector2(width, height) },
      uTime: { value: 0 },
    },
    vertexShader: terrainVertex,
    fragmentShader: terrainFragment,
  });
}
