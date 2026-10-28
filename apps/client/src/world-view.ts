import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Building, COLONIST_STRIDE, Element, JOB_STRIDE, type Frame } from './protocol';
import {
  diffuserTexture, digIconTexture, flameTexture, glowTexture, hearthTexture, ladderTexture, mushroomTexture, survivorTexture,
} from './textures';
import { terrainMaterial } from './terrain-shader';

export type Overlay = 'none' | 'oxygen' | 'co2' | 'temperature';

// Side-on 2D, ONI style. The sim grid lies in the XY plane (sim y grows
// downwards, world y upwards). Layers, back to front by z:
//   terrain quad (shader) -> gas haze -> buildings -> survivors -> darkness -> fire and embers -> job markers
const Z = { terrain: 0, gas: 0.1, building: 0.2, survivor: 0.3, dark: 0.5, fire: 0.6, marker: 0.7 };

const GradingShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uNight: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uNight;
    varying vec2 vUv;
    float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb *= mix(vec3(0.88, 0.93, 1.05), vec3(1.05, 0.98, 0.9), smoothstep(0.0, 0.6, luma));
      c.rgb = mix(c.rgb, vec3(luma) * vec3(0.8, 0.9, 1.15), uNight * 0.25);
      c.rgb *= smoothstep(0.95, 0.35, distance(vUv, vec2(0.5)));
      c.rgb += (rand(vUv * 1000.0 + uTime) - 0.5) * 0.01;
      gl_FragColor = c;
    }`,
};

interface Hearth {
  cell: number;
  group: THREE.Group;
  flame: THREE.Sprite;
  glow: THREE.Sprite;
}

interface Survivor {
  sprite: THREE.Sprite;
  from: THREE.Vector3;
  to: THREE.Vector3;
  facing: number;
}

const BUILDING_TEXTURES: Record<number, () => THREE.Texture> = {
  [Building.Ladder]: ladderTexture,
  [Building.OxygenDiffuser]: diffuserTexture,
  [Building.MushroomBed]: mushroomTexture,
};

export class WorldView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  overlay: Overlay = 'none';
  /** Camera centre in world units, and cells visible vertically. */
  readonly view = { x: 0, y: 0, span: 30 };

  private composer: EffectComposer;
  private grading = new ShaderPass(GradingShader);
  private width = 0;
  private height = 0;
  private terrain?: THREE.ShaderMaterial;
  private maskTex!: THREE.DataTexture;
  private lightTex!: THREE.DataTexture;
  private darkTex!: THREE.DataTexture;
  private gasTex!: THREE.DataTexture;
  private buildingSprites = new THREE.Group();
  private markers = new THREE.Group();
  private hearths: Hearth[] = [];
  private survivors: Survivor[] = [];
  private embers!: THREE.Points;
  private emberLife!: Float32Array;
  private latest?: Frame;
  private lastBuildings?: Uint8Array;
  private frameTime = 0;
  private frameInterval = 100;
  private clock = new THREE.Clock();
  private nightAmount = 0;

  private readonly glowTex = glowTexture();
  private readonly flameTex = flameTexture();
  private readonly hearthTex = hearthTexture();
  private readonly digTex = digIconTexture();
  private readonly buildingMaterials = new Map<number, THREE.SpriteMaterial>();
  private readonly ghostMaterials = new Map<number, THREE.SpriteMaterial>();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene.background = new THREE.Color('#030405');
    this.scene.add(this.buildingSprites, this.markers);

    for (const [kind, make] of Object.entries(BUILDING_TEXTURES)) {
      const map = make();
      this.buildingMaterials.set(Number(kind), new THREE.SpriteMaterial({ map }));
      this.ghostMaterials.set(Number(kind), new THREE.SpriteMaterial({ map, opacity: 0.45, color: '#9fc3ff', depthTest: false }));
    }
    this.ghostMaterials.set(Building.Hearth, new THREE.SpriteMaterial({ map: this.hearthTex, opacity: 0.45, color: '#9fc3ff', depthTest: false }));

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.5, 0.82));
    this.composer.addPass(this.grading);
    this.composer.addPass(new OutputPass());

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
  }

  cellToWorld(x: number, y: number, out = new THREE.Vector3()) {
    return out.set(x - this.width / 2 + 0.5, -(y - this.height / 2 + 0.5), 0);
  }

  /** World units per screen pixel at the current zoom. */
  unitsPerPixel() {
    return this.view.span / window.innerHeight;
  }

  pickCell(clientX: number, clientY: number): [number, number] | undefined {
    const u = this.unitsPerPixel();
    const wx = this.view.x + (clientX - window.innerWidth / 2) * u;
    const wy = this.view.y - (clientY - window.innerHeight / 2) * u;
    const x = Math.floor(wx + this.width / 2);
    const y = Math.floor(-wy + this.height / 2);
    return x >= 0 && y >= 0 && x < this.width && y < this.height ? [x, y] : undefined;
  }

  private dataTexture(channels: number) {
    const t = new THREE.DataTexture(new Uint8Array(this.width * this.height * 4), this.width, this.height);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearFilter;
    void channels;
    return t;
  }

  private layer(map: THREE.Texture, z: number, renderOrder: number) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.height),
      new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, depthTest: false }),
    );
    mesh.position.z = z;
    mesh.renderOrder = renderOrder;
    this.scene.add(mesh);
  }

  private setup(frame: Frame) {
    this.width = frame.width;
    this.height = frame.height;

    this.maskTex = this.dataTexture(4);
    this.lightTex = this.dataTexture(1);
    this.terrain = terrainMaterial(this.maskTex, this.lightTex, this.width, this.height);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), this.terrain);
    ground.position.z = Z.terrain;
    this.scene.add(ground);

    this.gasTex = this.dataTexture(4);
    this.layer(this.gasTex, Z.gas, 1);
    this.darkTex = this.dataTexture(4);
    this.layer(this.darkTex, Z.dark, 5);

    const count = 160;
    const geo = new THREE.BufferGeometry();
    // Start hidden; each ember spawns at a hearth when its random delay runs out.
    const start = new Float32Array(count * 3).map((_, i) => (i % 3 === 2 ? -999 : 0));
    geo.setAttribute('position', new THREE.BufferAttribute(start, 3));
    this.emberLife = Float32Array.from({ length: count }, () => Math.random() * 3);
    this.embers = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 4, sizeAttenuation: false, map: this.glowTex, color: '#ffb35a', transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    }));
    this.embers.renderOrder = 7;
    this.scene.add(this.embers);

    const looks: [string, string][] = [['#6a4a3a', '#c2452f'], ['#3e5566', '#d9a441'], ['#56603e', '#8a5fa8'], ['#70553a', '#4f8fb0']];
    for (let i = 0; i < frame.colonists.length / COLONIST_STRIDE; i++) {
      const [coat, scarf] = looks[i % looks.length];
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: survivorTexture(coat, scarf), alphaTest: 0.4, depthTest: false }));
      sprite.center.set(0.5, 0.02);
      sprite.scale.set(0.9, 1.35, 1);
      sprite.renderOrder = 4;
      this.scene.add(sprite);
      this.survivors.push({ sprite, from: new THREE.Vector3(), to: new THREE.Vector3(), facing: 1 });
    }

    const first = frame.buildings.indexOf(Building.Hearth);
    if (first >= 0) {
      const p = this.cellToWorld(first % this.width, Math.floor(first / this.width));
      this.view.x = p.x;
      this.view.y = p.y;
    }
  }

  private rebuildBuildings(buildings: Uint8Array) {
    this.buildingSprites.clear();
    for (const h of this.hearths) this.scene.remove(h.group);
    this.hearths = [];
    const p = new THREE.Vector3();
    buildings.forEach((b, i) => {
      if (b === Building.None) return;
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      if (b === Building.Hearth) {
        this.addHearth(i, p);
        return;
      }
      const s = new THREE.Sprite(this.buildingMaterials.get(b));
      s.position.set(p.x, p.y, Z.building);
      s.scale.set(b === Building.Ladder ? 1.02 : 1, b === Building.Ladder ? 1.02 : 1, 1);
      s.renderOrder = 3;
      this.buildingSprites.add(s);
    });
  }

  private addHearth(cell: number, p: THREE.Vector3) {
    const group = new THREE.Group();
    group.position.set(p.x, p.y - 0.5, 0);
    const base = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.hearthTex, depthTest: false }));
    base.center.set(0.5, 0);
    base.scale.set(1.5, 1, 1);
    base.position.z = Z.building;
    base.renderOrder = 3;
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.flameTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
    flame.center.set(0.5, 0.05);
    flame.position.set(0, 0.35, Z.fire);
    flame.renderOrder = 8;
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: '#ff8a3a', blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.45 }));
    glow.position.set(0, 0.7, Z.fire);
    glow.scale.set(5, 5, 1);
    glow.renderOrder = 8;
    group.add(base, flame, glow);
    this.scene.add(group);
    this.hearths.push({ cell, group, flame, glow });
  }

  private updateMarkers(frame: Frame) {
    this.markers.clear();
    const p = new THREE.Vector3();
    for (let k = 0; k < frame.jobs.length; k += JOB_STRIDE) {
      const [x, y, kind, building, progress, claimed] = frame.jobs.subarray(k, k + JOB_STRIDE);
      if (kind === 2) continue; // refuelling happens on its own
      this.cellToWorld(x, y, p);
      const mat = kind === 0
        ? new THREE.SpriteMaterial({ map: this.digTex, depthTest: false, opacity: claimed ? 1 : 0.7 })
        : this.ghostMaterials.get(building)!;
      const icon = new THREE.Sprite(mat);
      icon.position.set(p.x, p.y, Z.marker);
      const s = kind === 0 ? 0.6 : 1;
      icon.scale.set(building === Building.Hearth ? 1.5 : s, s, 1);
      icon.renderOrder = 9;
      this.markers.add(icon);
      if (progress > 0) {
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * progress / 100, 0.1), new THREE.MeshBasicMaterial({ color: '#f0a04b', depthTest: false }));
        bar.position.set(p.x - 0.4 + 0.4 * progress / 100, p.y - 0.42, Z.marker);
        bar.renderOrder = 9;
        this.markers.add(bar);
      }
    }
  }

  /** Data texture row for sim row y: a plane's v = 0 is its bottom edge. */
  private texIndex(x: number, y: number) {
    return ((this.height - 1 - y) * this.width + x) * 4;
  }

  private paintLayers(frame: Frame) {
    const mask = this.maskTex.image.data as Uint8Array;
    const lit = this.lightTex.image.data as Uint8Array;
    const dark = this.darkTex.image.data as Uint8Array;
    const gas = this.gasTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = y * this.width + x;
        const i = this.texIndex(x, y);
        const e = frame.elements[c];
        mask[i] = e === Element.Rock ? 255 : 0;
        mask[i + 1] = e === Element.Dirt ? 255 : 0;
        mask[i + 2] = e === Element.Coal ? 255 : 0;
        mask[i + 3] = e === Element.Water ? 255 : 0;

        const l = frame.light[c] / 255;
        lit[i] = frame.light[c];
        // Never fully black, so you can make out what lies beyond the light.
        const a = Math.pow(1 - Math.min(l * 1.6, 1), 1.4);
        dark[i] = 3; dark[i + 1] = 4; dark[i + 2] = 10; dark[i + 3] = 20 + a * 215;

        let r = 0, g = 0, b = 0, alpha = 0;
        if (e === Element.Floor) {
          if (this.overlay === 'oxygen') {
            const t = Math.min(frame.oxygen[c] / 1800, 1);
            [r, g, b, alpha] = [70, 150 + 100 * t, 255, 30 + 170 * t];
          } else if (this.overlay === 'co2') {
            const t = Math.min(frame.co2[c] / 1800, 1);
            [r, g, b, alpha] = [190, 200, 80, 30 + 170 * t];
          } else if (this.overlay === 'temperature') {
            const t = Math.min(Math.max((frame.temperature[c] - 27_315) / 6_000, 0), 1);
            [r, g, b, alpha] = [255 * t, 70, 255 * (1 - t), 150];
          } else {
            const t = Math.min(frame.co2[c] / 2500, 1);
            [r, g, b, alpha] = [120, 130, 70, t * 110]; // CO2 hangs low as a murk
          }
        }
        gas[i] = r; gas[i + 1] = g; gas[i + 2] = b; gas[i + 3] = alpha;
      }
    }
    for (const t of [this.maskTex, this.lightTex, this.darkTex, this.gasTex]) t.needsUpdate = true;
  }

  setOverlay(overlay: Overlay) {
    this.overlay = overlay;
    if (this.latest) this.paintLayers(this.latest);
  }

  applyFrame(frame: Frame, ticksPerSecond: number) {
    if (!this.latest) this.setup(frame);
    this.latest = frame;
    this.frameInterval = 1000 / ticksPerSecond;
    this.frameTime = performance.now();

    if (!this.lastBuildings || frame.buildings.some((b, i) => b !== this.lastBuildings![i])) {
      this.lastBuildings = frame.buildings;
      this.rebuildBuildings(frame.buildings);
    }
    this.paintLayers(frame);
    this.updateMarkers(frame);

    this.survivors.forEach((s, i) => {
      const o = i * COLONIST_STRIDE;
      const [x, y, , activity, , warmth] = frame.colonists.subarray(o, o + 6);
      s.from.copy(s.sprite.position.lengthSq() ? s.sprite.position : this.cellToWorld(x, y));
      this.cellToWorld(x, y, s.to);
      s.to.y -= 0.5;
      s.to.z = Z.survivor;
      if (s.to.x !== s.from.x) s.facing = Math.sign(s.to.x - s.from.x);
      const mat = s.sprite.material as THREE.SpriteMaterial;
      const cold = 1 - warmth / 10000; // frost creeps in as warmth drops
      mat.color.setRGB(1 - cold * 0.45, 1 - cold * 0.25, 1);
      mat.rotation = activity === 3 || activity === 5 ? Math.PI / 2 : 0; // lying down asleep or dead
      if (activity === 5) mat.color.setRGB(0.45, 0.5, 0.6);
    });
  }

  private updateEmbers(dt: number, t: number) {
    const pos = this.embers.geometry.attributes.position as THREE.BufferAttribute;
    const lit = this.hearths.filter((h) => this.latest && this.latest.light[h.cell] > 0);
    for (let i = 0; i < this.emberLife.length; i++) {
      this.emberLife[i] -= dt;
      if (this.emberLife[i] <= 0) {
        if (!lit.length) {
          pos.setXYZ(i, 0, 0, -999);
          continue;
        }
        const h = lit[i % lit.length].group.position;
        pos.setXYZ(i, h.x + (Math.random() - 0.5) * 0.4, h.y + 0.6, Z.fire);
        this.emberLife[i] = 1 + Math.random() * 2.5;
      } else if (pos.getZ(i) > -100) {
        pos.setXYZ(i, pos.getX(i) + Math.sin(t * 3 + i) * dt * 0.4, pos.getY(i) + dt * (0.8 + (i % 5) * 0.15), pos.getZ(i));
      }
    }
    pos.needsUpdate = true;
  }

  render() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;
    const frame = this.latest;

    this.nightAmount += ((frame?.night ? 1 : 0) - this.nightAmount) * Math.min(dt * 0.8, 1);
    (this.grading.uniforms.uTime as THREE.IUniform).value = t;
    (this.grading.uniforms.uNight as THREE.IUniform).value = this.nightAmount;
    if (this.terrain) this.terrain.uniforms.uTime.value = t;

    for (const h of this.hearths) {
      const lit = !!frame && frame.light[h.cell] > 0;
      const flicker = 1 + Math.sin(t * 11 + h.cell) * 0.08 + Math.sin(t * 17.3 + h.cell * 2) * 0.06;
      h.flame.visible = h.glow.visible = lit;
      h.flame.scale.set(0.6 * flicker, 1.05 * (2 - flicker), 1);
      h.glow.material.opacity = 0.4 * flicker * (1 - this.nightAmount * 0.3);
    }
    if (frame) this.updateEmbers(dt, t);

    const k = Math.min((performance.now() - this.frameTime) / this.frameInterval, 1);
    for (const s of this.survivors) {
      s.sprite.position.lerpVectors(s.from, s.to, k);
      if (s.from.distanceToSquared(s.to) > 0.01 && k < 1) s.sprite.position.y += Math.abs(Math.sin(k * Math.PI)) * 0.08;
      const lying = (s.sprite.material as THREE.SpriteMaterial).rotation !== 0;
      s.sprite.center.set(0.5, lying ? 0.5 : 0.02);
      s.sprite.scale.x = 0.9 * (lying ? 1 : s.facing);
      if (lying) s.sprite.position.y += 0.3;
    }

    const halfH = this.view.span / 2;
    const halfW = halfH * (window.innerWidth / window.innerHeight);
    Object.assign(this.camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
    this.camera.position.set(this.view.x, this.view.y, 5);
    this.camera.updateProjectionMatrix();
    this.composer.render();
  }
}
