import * as THREE from 'three';
import { artTexture, artUrl } from './art';

// The whole cave is one quad. A per-cell material mask, sampled with linear
// filtering and cut at a noisy threshold, turns the square grid into smooth,
// organic shapes (the same idea as marching squares). The mask's gradient
// gives a bevel normal, so rock reads as rounded lumps rather than flat tiles.
// Painted textures from apps/client/art/ fill the rock, dirt, coal, ore,
// crystal and back wall when present. Built tiles (mask alpha) are cut stone:
// squared blocks with mortar lines and a straight edge, so they read as made,
// not natural. Water is drawn separately, as its own mesh.

export const terrainVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const terrainFragment = /* glsl */ `
  uniform sampler2D uMask;   // r = rock, g = dirt, b = coal, a = built tile
  uniform sampler2D uOre;    // r = iron ore, g = crystal
  uniform sampler2D uLight;  // r = brightness from the sim's light field
  uniform sampler2D uWater;  // r = how full the cell is from its bottom, g = depth below the surface, b = surface cell (nearest filtered)
  uniform vec2 uSize;        // grid size in cells
  // Optional painted textures; the matching flag is 1.0 when one is loaded.
  uniform sampler2D uRockTex, uDirtTex, uCoalTex, uWallTex;
  uniform vec4 uHasArt;      // rock, dirt, coal, back wall
  uniform sampler2D uIronTex, uCrystalTex;
  uniform vec2 uHasOreArt;   // iron ore, crystal
  uniform sampler2D uWaterTex;
  uniform float uHasWaterArt;
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
  vec2 ores(vec2 cell) { return texture2D(uOre, cell / uSize).rg; }
  float solidAt(vec2 cell) { vec4 m = mask(cell); vec2 o = ores(cell); return m.r + m.g + m.b + m.a + o.r + o.g; }

  void main() {
    vec2 cell = vUv * uSize;
    vec4 m = mask(cell);
    vec2 o = ores(cell);
    float solid = m.r + m.g + m.b + m.a + o.r + o.g;
    // How much of this point is built tile rather than natural ground.
    float built = m.a / max(solid, 0.001);

    // Wobble the edge so outlines look hand-drawn rather than geometric; built edges stay nearly straight.
    float wobble = (fbm(cell * 1.7) - 0.5) * 0.28 * (1.0 - built * 0.8);
    float edge = 0.5 + wobble;
    float aa = fwidth(solid) * 1.2 + 0.001;
    float inside = smoothstep(edge - aa, edge + aa, solid);

    // Bevel: the mask gradient points out of the rock.
    float e = 0.6;
    vec2 grad = vec2(solidAt(cell + vec2(e, 0.0)) - solidAt(cell - vec2(e, 0.0)),
                     solidAt(cell + vec2(0.0, e)) - solidAt(cell - vec2(0.0, e)));
    // Natural ground is lumpy all over; cut stone is flat inside, bevelled only at its edge.
    vec3 n = normalize(vec3(-grad * 1.6, 0.6 + mix(fbm(cell * 3.0) * 0.4, 0.2, built)));
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
    rock = mix(rock, texture2D(uRockTex, cell / 4.0).rgb, uHasArt.x);
    dirt = mix(dirt, texture2D(uDirtTex, cell / 4.0).rgb, uHasArt.y);
    coal = mix(coal, texture2D(uCoalTex, cell / 4.0).rgb, uHasArt.z);
    // Cut stone: two courses of blocks per cell, joints staggered by half a block, dark mortar between.
    vec2 bp = cell * vec2(1.0, 2.0);
    bp.x += mod(floor(bp.y), 2.0) * 0.5;
    vec2 bf = fract(bp);
    float joint = min(min(bf.x, 1.0 - bf.x), min(bf.y, 1.0 - bf.y) * 0.5); // distance to the nearest joint, in cells
    float jaa = fwidth(joint) + 0.001;
    float mortar = 1.0 - smoothstep(0.03 - jaa, 0.03 + jaa, joint);
    vec3 tile = mix(vec3(0.45, 0.47, 0.51), vec3(0.53, 0.55, 0.59), hash(floor(bp))) * (0.96 + fine * 0.06);
    tile = mix(tile, vec3(0.13, 0.12, 0.13), mortar * 0.85);
    // Iron ore is rock veined with rust; crystal is rock studded with pale blue.
    vec3 iron = mix(rock * 0.8, vec3(0.55, 0.27, 0.15), step(0.6, noise(cell * 3.0)) * 0.8);
    vec3 crystal = mix(rock * 0.75, vec3(0.5, 0.88, 0.86), step(0.82, noise(cell * 5.0)));
    iron = mix(iron, texture2D(uIronTex, cell / 4.0).rgb, uHasOreArt.x);
    crystal = mix(crystal, texture2D(uCrystalTex, cell / 4.0).rgb, uHasOreArt.y);
    float wsum = max(solid, 0.001);
    vec3 solidColor = (rock * m.r + dirt * m.g + coal * m.b + tile * m.a + iron * o.r + crystal * o.g) / wsum;
    solidColor *= 0.55 + lambert * 0.75;

    // Dark ink outline just inside the edge, like the line art on the sprites.
    float rim = smoothstep(edge - aa, edge + aa * 2.0, solid) * (1.0 - smoothstep(edge + 0.05, edge + 0.13, solid));
    solidColor = mix(solidColor, vec3(0.10, 0.07, 0.05), rim * 0.85);

    // Back wall of the cave, darker near rock (cheap ambient occlusion).
    float near = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785;
      near += solidAt(cell + vec2(cos(a), sin(a)) * 1.4);
    }
    near /= 8.0;
    vec3 wall = mix(vec3(0.16, 0.13, 0.11), vec3(0.23, 0.19, 0.16), fbm(cell * 0.6 + 7.0));
    wall *= 0.85 + noise(cell * 4.0) * 0.2;
    wall = mix(wall, texture2D(uWallTex, cell / 8.0).rgb, uHasArt.w);
    wall *= 1.0 - smoothstep(0.0, 0.7, near) * 0.6;

    // Water: each cell knows how full it is, so the surface is a smooth
    // line at the pool's real level, with a ripple, foam and depth shading.
    vec2 wuv = vUv;
    vec4 wc = texture2D(uWater, wuv);
    float fillFrac = fract(cell.y);                       // 0 at a cell's bottom edge, 1 at its top
    float ripple = sin(cell.x * 2.6 + uTime * 1.7) * 0.03 + sin(cell.x * 5.1 - uTime * 2.6) * 0.015;
    float surfaceAt = wc.r + ripple;
    // b marks the cell holding the pool's surface; every cell below it is full.
    float topCell = wc.b;
    float water = step(0.001, wc.r) * mix(1.0, 1.0 - smoothstep(surfaceAt - 0.02, surfaceAt + 0.02, fillFrac), topCell);
    float surface = water * topCell * (1.0 - smoothstep(surfaceAt - 0.14, surfaceAt - 0.02, fillFrac));
    float depth = wc.g * 8.0 + (1.0 - fillFrac);
    vec3 shallowColor = vec3(0.22, 0.52, 0.62), deepColor = vec3(0.05, 0.16, 0.26);
    vec3 waterColor = mix(shallowColor, deepColor, smoothstep(0.0, 6.0, depth));
    waterColor *= 0.9 + 0.2 * fbm(cell * 2.0 + vec2(uTime * 0.15, -uTime * 0.1)); // caustic shimmer
    waterColor = mix(waterColor, texture2D(uWallTex, cell / 8.0).rgb * vec3(0.5, 0.8, 1.0), 0.12 * uHasArt.w * (1.0 - uHasWaterArt));
    // Painted water drifts slowly and darkens with depth like the plain colour.
    vec3 paintedWater = texture2D(uWaterTex, cell / 4.0 + vec2(uTime * 0.025, uTime * 0.01)).rgb;
    waterColor = mix(waterColor, paintedWater * mix(1.0, 0.35, smoothstep(0.0, 6.0, depth)), 0.85 * uHasWaterArt);
    vec3 open = mix(wall, waterColor, water * 0.9);
    open += surface * vec3(0.28, 0.4, 0.42) * (0.7 + 0.3 * sin(cell.x * 3.0 + uTime * 2.2));

    vec3 color = mix(open, solidColor, inside);

    // The sim's light field: dark where the fire doesn't reach, warm where it does.
    float light = pow(texture2D(uLight, vUv).r, 1.35);
    float warm = smoothstep(0.3, 1.0, light);
    color *= light * mix(vec3(0.8, 0.9, 1.1), vec3(1.3, 1.05, 0.8), warm);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function terrainMaterial(mask: THREE.DataTexture, ores: THREE.DataTexture, light: THREE.DataTexture, water: THREE.DataTexture, width: number, height: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMask: { value: mask },
      uOre: { value: ores },
      uLight: { value: light },
      uWater: { value: water },
      uSize: { value: new THREE.Vector2(width, height) },
      uTime: { value: 0 },
      ...paintedTextures(),
    },
    vertexShader: terrainVertex,
    fragmentShader: terrainFragment,
  });
}

function paintedTextures() {
  const blank = new THREE.Texture();
  const art = (name: string) => (artUrl(name) ? artTexture(name, () => blank, { repeat: true }) : null);
  const [rock, dirt, coal, wall, water, iron, crystal] = ['rock', 'dirt', 'coal', 'backwall', 'water', 'iron-ore', 'crystal'].map(art);
  return {
    uRockTex: { value: rock ?? blank },
    uDirtTex: { value: dirt ?? blank },
    uCoalTex: { value: coal ?? blank },
    uWallTex: { value: wall ?? blank },
    uHasArt: { value: new THREE.Vector4(rock ? 1 : 0, dirt ? 1 : 0, coal ? 1 : 0, wall ? 1 : 0) },
    uWaterTex: { value: water ?? blank },
    uHasWaterArt: { value: water ? 1 : 0 },
    uIronTex: { value: iron ?? blank },
    uCrystalTex: { value: crystal ?? blank },
    uHasOreArt: { value: new THREE.Vector2(iron ? 1 : 0, crystal ? 1 : 0) },
  };
}
