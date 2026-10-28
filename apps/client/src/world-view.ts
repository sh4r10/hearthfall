import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Building, COLONIST_STRIDE, Element, type Frame } from './protocol';
import { backWallTexture, blockTexture, flameTexture, glowTexture, survivorTexture } from './textures';
import { hash2 } from './noise';

export type Overlay = 'none' | 'oxygen' | 'co2' | 'temperature';

// Side-on 2.5D: the sim grid lies in the XY plane (sim y grows downwards,
// world y upwards). Solid cells are chunky blocks with depth, open cells show
// the back wall, and a darkness layer driven by the sim's light map sits in
// front of everything so only hearth-lit space is visible.
const BLOCK_DEPTH = 1.4;
const FRONT_Z = BLOCK_DEPTH / 2;
const BACK_Z = -BLOCK_DEPTH / 2;
const MAX_HEARTH_LIGHTS = 6;

const BLOCK_COLOR: Record<number, THREE.Color> = {
  [Element.Rock]: new THREE.Color('#8a8580'),
  [Element.Dirt]: new THREE.Color('#8a6142'),
  [Element.Coal]: new THREE.Color('#2b2a2c'),
};

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
      // Split toning: cold blue shadows, warm firelit highlights.
      vec3 shadow = vec3(0.85, 0.9, 1.05);
      vec3 highlight = vec3(1.08, 0.97, 0.85);
      c.rgb *= mix(shadow, highlight, smoothstep(0.0, 0.6, luma));
      // Nights are colder and a little desaturated.
      c.rgb = mix(c.rgb, vec3(luma) * vec3(0.8, 0.9, 1.15), uNight * 0.25);
      float d = distance(vUv, vec2(0.5));
      c.rgb *= smoothstep(0.85, 0.3, d);
      c.rgb += (rand(vUv * 1000.0 + uTime) - 0.5) * 0.012;
      gl_FragColor = c;
    }`,
};

interface Hearth {
  cell: number;
  group: THREE.Group;
  flame: THREE.Sprite;
  glow: THREE.Sprite;
  light?: THREE.PointLight;
}

interface Survivor {
  sprite: THREE.Sprite;
  from: THREE.Vector3;
  to: THREE.Vector3;
  facing: number;
}

export class WorldView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);
  overlay: Overlay = 'none';

  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private grading = new ShaderPass(GradingShader);
  private width = 0;
  private height = 0;
  private blocks?: THREE.InstancedMesh;
  private water?: THREE.InstancedMesh;
  private ladders?: THREE.InstancedMesh;
  private diffusers?: THREE.InstancedMesh;
  private hearths: Hearth[] = [];
  private survivors: Survivor[] = [];
  private darkTex!: THREE.DataTexture;
  private gasTex!: THREE.DataTexture;
  private embers!: THREE.Points;
  private emberLife!: Float32Array;
  private latest?: Frame;
  private lastElements?: Uint8Array;
  private lastBuildings?: Uint8Array;
  private frameTime = 0;
  private frameInterval = 100;
  private clock = new THREE.Clock();
  private nightAmount = 0;

  private readonly blockTex = blockTexture();
  private readonly glowTex = glowTexture();
  private readonly flameTex = flameTexture();

  // Camera: target point on the play plane and distance from it.
  readonly view = { x: 0, y: 0, dist: 24 };

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.scene.background = new THREE.Color('#030405');

    // A weak cool fill so lit blocks show their bevels; hearths do the real lighting.
    this.scene.add(new THREE.HemisphereLight('#7d8fb3', '#1a120c', 0.5));
    const fill = new THREE.DirectionalLight('#9fb2d9', 0.5);
    fill.position.set(-10, 20, 30);
    this.scene.add(fill);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.5, 0.8);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.grading);
    this.composer.addPass(new OutputPass());

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  cellToWorld(x: number, y: number, out = new THREE.Vector3()) {
    return out.set(x - this.width / 2 + 0.5, -(y - this.height / 2 + 0.5), 0);
  }

  pickCell(clientX: number, clientY: number): [number, number] | undefined {
    const ndc = new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), -FRONT_Z), new THREE.Vector3());
    if (!hit) return undefined;
    const x = Math.floor(hit.x + this.width / 2);
    const y = Math.floor(-hit.y + this.height / 2);
    return x >= 0 && y >= 0 && x < this.width && y < this.height ? [x, y] : undefined;
  }

  private setup(frame: Frame) {
    this.width = frame.width;
    this.height = frame.height;
    const { width: w, height: h } = frame;

    const wallTex = backWallTexture();
    wallTex.repeat.set(w / 10, h / 10);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: wallTex, roughness: 1 }));
    wall.position.z = BACK_Z;
    this.scene.add(wall);

    // Gas haze sits inside the caves, between the back wall and block fronts.
    this.gasTex = new THREE.DataTexture(new Uint8Array(w * h * 4), w, h);
    this.gasTex.magFilter = THREE.LinearFilter;
    const gas = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: this.gasTex, transparent: true, depthWrite: false }),
    );
    gas.position.z = 0;
    gas.renderOrder = 2;
    this.scene.add(gas);

    // Darkness in front of everything; linear filtering gives soft light falloff.
    this.darkTex = new THREE.DataTexture(new Uint8Array(w * h * 4), w, h);
    this.darkTex.magFilter = THREE.LinearFilter;
    const dark = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: this.darkTex, transparent: true, depthWrite: false, depthTest: false }),
    );
    dark.position.z = FRONT_Z + 0.05;
    dark.renderOrder = 5;
    this.scene.add(dark);

    // Embers drifting up from the hearths.
    const count = 160;
    const geo = new THREE.BufferGeometry();
    // Start hidden; each ember spawns at the hearth when its random delay runs out.
    const start = new Float32Array(count * 3).map((_, i) => (i % 3 === 2 ? -999 : 0));
    geo.setAttribute('position', new THREE.BufferAttribute(start, 3));
    this.emberLife = Float32Array.from({ length: count }, () => Math.random() * 3);
    this.embers = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.18, map: this.glowTex, color: '#ffb35a', transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
      }),
    );
    this.embers.renderOrder = 7;
    this.scene.add(this.embers);

    const looks: [string, string][] = [['#6a4a3a', '#c2452f'], ['#3e5566', '#d9a441'], ['#56603e', '#8a5fa8'], ['#70553a', '#4f8fb0']];
    for (let i = 0; i < frame.colonists.length / COLONIST_STRIDE; i++) {
      const [coat, scarf] = looks[i % looks.length];
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: survivorTexture(coat, scarf), alphaTest: 0.4 }));
      sprite.center.set(0.5, 0.02);
      sprite.scale.set(0.85, 1.28, 1);
      sprite.renderOrder = 3;
      this.scene.add(sprite);
      this.survivors.push({ sprite, from: new THREE.Vector3(), to: new THREE.Vector3(), facing: 1 });
    }

    // Start the camera on the first hearth.
    const first = frame.buildings.indexOf(Building.Hearth);
    if (first >= 0) {
      const p = this.cellToWorld(first % w, Math.floor(first / w));
      this.view.x = p.x;
      this.view.y = p.y;
    }
  }

  private rebuildBlocks(elements: Uint8Array) {
    for (const m of [this.blocks, this.water]) {
      if (m) {
        this.scene.remove(m);
        m.dispose();
      }
    }
    let solids = 0, wet = 0;
    for (const e of elements) {
      if (BLOCK_COLOR[e]) solids++;
      else if (e === Element.Water) wet++;
    }
    this.blocks = new THREE.InstancedMesh(
      new RoundedBoxGeometry(1, 1, BLOCK_DEPTH, 2, 0.1),
      new THREE.MeshStandardMaterial({ map: this.blockTex, roughness: 0.85 }),
      solids,
    );
    this.water = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, BLOCK_DEPTH * 0.9),
      new THREE.MeshStandardMaterial({ color: '#2f6f99', transparent: true, opacity: 0.6, roughness: 0.1, emissive: '#0b2a3d' }),
      wet,
    );
    this.water.renderOrder = 1;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const color = new THREE.Color();
    let b = 0, k = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = elements[y * this.width + x];
        this.cellToWorld(x, y, p);
        if (BLOCK_COLOR[e]) {
          const v = hash2(x, y, 2) - 0.5;
          // Small random push in and out of the wall breaks up the grid.
          p.z = v * 0.25;
          q.setFromEuler(new THREE.Euler(0, 0, Math.floor(hash2(x, y, 4) * 4) * Math.PI / 2));
          this.blocks.setMatrixAt(b, m.compose(p, q, s.set(1.001, 1.001, 1)));
          this.blocks.setColorAt(b, color.copy(BLOCK_COLOR[e]).offsetHSL(0, 0, v * 0.1));
          b++;
        } else if (e === Element.Water) {
          this.water.setMatrixAt(k++, m.makeTranslation(p));
        }
      }
    }
    this.scene.add(this.blocks, this.water);
  }

  private rebuildBuildings(buildings: Uint8Array) {
    for (const m of [this.ladders, this.diffusers]) {
      if (m) {
        this.scene.remove(m);
        m.dispose();
      }
    }
    for (const h of this.hearths) this.scene.remove(h.group);
    this.hearths = [];

    const cells = (kind: number) => {
      const out: number[] = [];
      buildings.forEach((b, i) => b === kind && out.push(i));
      return out;
    };
    const p = new THREE.Vector3();
    const m = new THREE.Matrix4();
    const at = (i: number) => this.cellToWorld(i % this.width, Math.floor(i / this.width), p);

    const ladderCells = cells(Building.Ladder);
    const rail = new THREE.BoxGeometry(0.08, 1, 0.08);
    const parts = [rail.clone().translate(-0.32, 0, 0.1), rail.clone().translate(0.32, 0, 0.1)];
    for (let r = 0; r < 3; r++) parts.push(new THREE.BoxGeometry(0.66, 0.06, 0.06).translate(0, -0.33 + r * 0.33, 0.1));
    this.ladders = new THREE.InstancedMesh(mergeGeometries(parts), new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 0.9 }), ladderCells.length);
    ladderCells.forEach((i, k) => this.ladders!.setMatrixAt(k, m.makeTranslation(at(i))));

    const diffuserCells = cells(Building.OxygenDiffuser);
    this.diffusers = new THREE.InstancedMesh(
      new RoundedBoxGeometry(0.7, 0.8, 0.7, 2, 0.12).translate(0, -0.1, 0),
      new THREE.MeshStandardMaterial({ color: '#4c7f86', emissive: '#28c4c0', emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.5 }),
      diffuserCells.length,
    );
    diffuserCells.forEach((i, k) => this.diffusers!.setMatrixAt(k, m.makeTranslation(at(i))));
    this.scene.add(this.ladders, this.diffusers);

    const stone = new THREE.MeshStandardMaterial({ color: '#5d5751', roughness: 0.9, flatShading: true });
    const wood = new THREE.MeshStandardMaterial({ color: '#4a3020', roughness: 1 });
    cells(Building.Hearth).forEach((cell, n) => {
      const group = new THREE.Group();
      group.position.copy(at(cell)).setY(p.y - 0.5);
      for (let s = 0; s < 7; s++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14 + hash2(cell, s) * 0.06), stone);
        const a = (s / 7) * Math.PI * 2;
        rock.position.set(Math.cos(a) * 0.36, 0.08, Math.sin(a) * 0.3);
        group.add(rock);
      }
      for (const tilt of [-0.5, 0.5]) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 6), wood);
        log.rotation.z = Math.PI / 2 + tilt;
        log.position.y = 0.14;
        group.add(log);
      }
      const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.flameTex, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
      flame.center.set(0.5, 0.05);
      flame.position.set(0, 0.1, 0.2);
      flame.renderOrder = 8;
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, color: '#ff8a3a', blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, opacity: 0.35 }));
      glow.position.set(0, 0.4, 0.3);
      glow.scale.set(3, 3, 1);
      glow.renderOrder = 8;
      group.add(flame, glow);
      const hearth: Hearth = { cell, group, flame, glow };
      if (n < MAX_HEARTH_LIGHTS) {
        hearth.light = new THREE.PointLight('#ff9840', 20, 16, 1.4);
        hearth.light.position.set(0, 0.7, 1.4);
        group.add(hearth.light);
      }
      this.scene.add(group);
      this.hearths.push(hearth);
    });
  }

  /** Data texture row for sim row y: a plane's v = 0 is its bottom edge. */
  private texIndex(x: number, y: number) {
    return ((this.height - 1 - y) * this.width + x) * 4;
  }

  private paintLayers(frame: Frame) {
    const dark = this.darkTex.image.data as Uint8Array;
    const gas = this.gasTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = y * this.width + x;
        const i = this.texIndex(x, y);
        // Darkness: never fully black, so you can make out what lies beyond the light.
        const l = frame.light[c] / 255;
        const a = Math.pow(1 - Math.min(l * 1.6, 1), 1.4);
        dark[i] = 2; dark[i + 1] = 3; dark[i + 2] = 8;
        dark[i + 3] = 20 + a * 190;

        const open = frame.elements[c] === Element.Floor;
        let r = 0, g = 0, b = 0, alpha = 0;
        if (open) {
          if (this.overlay === 'oxygen') {
            const t = Math.min(frame.oxygen[c] / 1500, 1);
            [r, g, b, alpha] = [70, 150 + 100 * t, 255, 30 + 170 * t];
          } else if (this.overlay === 'co2') {
            const t = Math.min(frame.co2[c] / 1500, 1);
            [r, g, b, alpha] = [190, 200, 80, 30 + 170 * t];
          } else if (this.overlay === 'temperature') {
            const t = Math.min(Math.max((frame.temperature[c] - 27_315) / 6_000, 0), 1);
            [r, g, b, alpha] = [255 * t, 70, 255 * (1 - t), 150];
          } else {
            // Always-on haze: CO2 hangs low as a sickly murk.
            const t = Math.min(frame.co2[c] / 2500, 1);
            [r, g, b, alpha] = [120, 130, 70, t * 110];
          }
        }
        gas[i] = r; gas[i + 1] = g; gas[i + 2] = b; gas[i + 3] = alpha;
      }
    }
    this.darkTex.needsUpdate = true;
    this.gasTex.needsUpdate = true;
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

    if (!this.lastElements || frame.elements.some((e, i) => e !== this.lastElements![i])) {
      this.lastElements = frame.elements;
      this.rebuildBlocks(frame.elements);
    }
    if (!this.lastBuildings || frame.buildings.some((b, i) => b !== this.lastBuildings![i])) {
      this.lastBuildings = frame.buildings;
      this.rebuildBuildings(frame.buildings);
    }
    this.paintLayers(frame);

    this.survivors.forEach((s, i) => {
      const o = i * COLONIST_STRIDE;
      const [x, y, breath, warmth] = [frame.colonists[o], frame.colonists[o + 1], frame.colonists[o + 2], frame.colonists[o + 3]];
      s.from.copy(s.sprite.position.lengthSq() ? s.sprite.position : this.cellToWorld(x, y));
      this.cellToWorld(x, y, s.to);
      s.to.y -= 0.5;
      s.to.z = 0.25;
      if (s.to.x !== s.from.x) s.facing = Math.sign(s.to.x - s.from.x);
      const mat = s.sprite.material as THREE.SpriteMaterial;
      const alive = breath > 0 && warmth > 0;
      // Frost creeps in as warmth drops.
      const cold = 1 - warmth / 100;
      mat.color.setRGB(1 - cold * 0.45, 1 - cold * 0.25, 1);
      if (!alive) {
        mat.color.setRGB(0.45, 0.5, 0.6);
        mat.rotation = Math.PI / 2;
      }
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
        pos.setXYZ(i, h.x + (Math.random() - 0.5) * 0.4, h.y + 0.3, 0.4);
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

    for (const h of this.hearths) {
      const lit = !!frame && frame.light[h.cell] > 0;
      const flicker = 1 + Math.sin(t * 11 + h.cell) * 0.08 + Math.sin(t * 17.3 + h.cell * 2) * 0.06;
      h.flame.visible = h.glow.visible = lit;
      h.flame.scale.set(0.55 * flicker, 0.95 * (2 - flicker), 1);
      if (h.light) h.light.intensity = lit ? (24 - this.nightAmount * 8) * flicker : 0;
    }
    if (frame) this.updateEmbers(dt, t);

    const k = Math.min((performance.now() - this.frameTime) / this.frameInterval, 1);
    for (const s of this.survivors) {
      s.sprite.position.lerpVectors(s.from, s.to, k);
      const moving = s.from.distanceToSquared(s.to) > 0.01 && k < 1;
      if (moving) s.sprite.position.y += Math.abs(Math.sin(k * Math.PI)) * 0.08;
      if ((s.sprite.material as THREE.SpriteMaterial).rotation === 0) s.sprite.scale.x = 0.85 * s.facing;
    }

    this.camera.position.set(this.view.x, this.view.y + this.view.dist * 0.12, this.view.dist);
    this.camera.lookAt(this.view.x, this.view.y, 0);
    this.composer.render();
  }
}
