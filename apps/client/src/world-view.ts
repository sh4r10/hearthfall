import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Building, C_WHO, COLONIST_STRIDE, DARK_BELOW, DEFAULT_PRIORITY, Element, MUSHROOM_TICKS, JOB_BUILD, REACH, JOB_DECONSTRUCT, JOB_DIG, JOB_HAUL, JOB_REFINE, JOB_REFUEL, JOB_RESEARCH, JOB_STRIDE, isSolid, SHADE_ATTACKING, SHADE_STRIDE, STAT_MAX, Item, type Frame } from './protocol';
import { hasModel, lumpGeometry, makeModel, mat } from './models';
import { glowTexture } from './textures';
import { artUrl } from './art';
import { terrainMaterial } from './terrain-shader';
import { overlayMaterial } from './overlay-shader';
import './sprites';
import { BED_TOP, type ShadeAnim, type SurvivorAnim } from './sprites';

export type Overlay = 'none' | 'warmth';

// Side-on low-poly 3D, seen from the front. The sim grid lies in the XY plane
// (sim y grows downwards, world y upwards) and z points at the camera:
//   back wall (z -0.75) -> rock lumps (around 0) -> buildings and survivors (0) -> markers
// Hearths are real point lights with shadows. The sim's light field darkens
// everything it does not reach, so the picture always matches the rules.

const FOV = 35;
const SHADOW_LIGHTS = 4;
const DARKEST = 0.24;
/** With painted terrain textures the caves are drawn by one shader; without, as low-poly rock. */
const PAINTED = !!artUrl('rock');

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
      // Cold shadows, warm highlights.
      c.rgb *= mix(vec3(0.85, 0.93, 1.1), vec3(1.06, 0.98, 0.9), smoothstep(0.0, 0.5, luma));
      c.rgb = mix(c.rgb, vec3(luma) * vec3(0.8, 0.9, 1.15), uNight * 0.2);
      c.rgb *= smoothstep(1.0, 0.4, distance(vUv, vec2(0.5)));
      c.rgb += (rand(vUv * 1000.0 + uTime) - 0.5) * 0.012;
      gl_FragColor = c;
    }`,
};

/** Cheap deterministic hash in [0, 1) per cell and salt. */
function hash(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** An instanced mesh whose instances belong to grid cells, so they can be darkened by the sim's light. */
interface CellInstances {
  mesh: THREE.InstancedMesh;
  cells: Int32Array;
  base: Float32Array;
}

interface Hearth {
  cell: number;
  model: THREE.Object3D;
  flame: THREE.Object3D;
  light: THREE.PointLight;
}

/** A Shade on screen: it drifts after the sim's cell and sways on its own. */
interface ShadeView {
  model: THREE.Object3D;
  target: THREE.Vector3;
  pos: THREE.Vector3;
  attacking: boolean;
  /** 0..1 fade, so they loom in and out instead of popping. */
  fade: number;
  gone: boolean;
  facing: number;
}
const SHADE_SPEED = 3; // cells per second, a touch slower than a survivor

interface Survivor {
  model: THREE.Object3D;
  parts: Record<'legL' | 'legR' | 'armF' | 'armB' | 'head' | 'tool', THREE.Object3D>;
  /** Where the sim says they are, and where they are drawn: the drawn position chases the sim at a steady walking pace. */
  target: THREE.Vector3;
  pos: THREE.Vector3;
  facing: number;
  activity: number;
  /** The grid cell they stand in. */
  cell: number;
  /** The kind of job they hold (index into JOB_NAMES), or -1. */
  job: number;
  warmth: number;
  /** Moving more up or down than sideways: on a ladder. */
  climbing: boolean;
  /** Dropping with nothing underfoot. */
  falling: boolean;
  /** Seconds left of cheering (at dawn). */
  cheer: number;
  /** Seconds until the next puff of breath in the cold. */
  breath: number;
  /** Seconds since they last moved on screen, so the walking pose outlasts a brief pause between steps. */
  still: number;
  stride: number;
  /** Stand-ins shown instead of the model while asleep or dead, made on first use. */
  sleeper?: THREE.Object3D;
  corpse?: THREE.Object3D;
  /** Seconds since they died, for the collapse and the fade. */
  dead: number;
  index: number;
}

/** Cells per second the sim moves a walking survivor (one cell every STEP_TICKS ticks at 10 ticks/s). */
const WALK_SPEED = 5;

interface Marker {
  object: THREE.Object3D;
  /** Priority number and stuck "!" badges, shown when they say something. */
  badge?: THREE.Sprite;
  alert?: THREE.Sprite;
  flat?: boolean;
  bar: THREE.Mesh;
  seen: boolean;
}

const BUILDING_MODELS: Record<number, string> = {
  [Building.Ladder]: 'ladder',
  [Building.MushroomBed]: 'mushroom-bed',
  [Building.Hearth]: 'hearth',
  [Building.Cairn]: 'cairn',
  [Building.Lamp]: 'lamp',
  [Building.Bed]: 'bed',
  [Building.Vent]: 'vent',
  [Building.Stockpile]: 'stockpile',
  [Building.ResearchBench]: 'workbench',
  [Building.CokeOven]: 'coke-oven',
  [Building.Smelter]: 'smelter',
  [Building.CrystalLamp]: 'crystal-lamp',
  [Building.Tile]: 'tile', // only a build order, shown as a ghost block; the finished cell is Element.Tile
  [Building.Door]: 'door',
};
/** Model for each loose good. */
const PILE_MODELS: Record<number, string> = { [Item.Coal]: 'pile-coal', [Item.Stone]: 'pile-stone', [Item.Ore]: 'pile-ore', [Item.Crystal]: 'pile-crystal' };

const TILE = Element.Tile;

const ELEMENT_COLOURS: Record<number, string[]> = {
  [Element.Rock]: ['#5a5b5f', '#4d4e53', '#66655f'],
  [Element.Dirt]: ['#7d5638', '#6e4a30', '#8a6242'],
  [Element.Coal]: ['#2e2c31', '#242327', '#38353a'],
  [Element.Iron]: ['#6e3a22', '#5a5b5f', '#8a4a2c'],
  [Element.Crystal]: ['#4d4e53', '#5cc4c8', '#4d4e53'],
  [TILE]: ['#7a7e86', '#72767e', '#80848b'], // cut stone: lighter, cooler grey than rock
};

/** At most this many cells light up in a preview. */
const PREVIEW_MAX = 4096;
function previewMesh(blending: THREE.Blending, opacity: number, size = 0.94) {
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ transparent: true, opacity, blending, depthTest: false, depthWrite: false, toneMapped: false }), PREVIEW_MAX);
  mesh.setColorAt(0, new THREE.Color());
  mesh.count = 0;
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return mesh;
}

export class WorldView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 600);
  overlay: Overlay = 'none';
  /** Camera target in world units, and cells visible vertically at the play plane. */
  readonly view = { x: 0, y: 0, span: 18 };
  /** How many times normal speed the sim runs; survivors and Shades glide to match. */
  timeScale = 1;
  /** Show every order's priority, not only the ones off the default (while the Priority tool is out). */
  private showPriorities = false;

  setShowPriorities(on: boolean) {
    this.showPriorities = on;
    if (this.latest) this.updateMarkers(this.latest); // the game may be paused, with no frame coming
  }

  private composer: EffectComposer;
  private grading = new ShaderPass(GradingShader);
  private width = 0;
  private height = 0;
  private terrain = new THREE.Group();
  private instanced: CellInstances[] = [];
  private water?: THREE.Mesh;
  private foam?: THREE.Mesh;
  private waterSurface?: { ids: Int32Array; base: Float32Array };
  private foamSurface?: { ids: Int32Array; base: Float32Array };
  private buildings = new THREE.Group();
  private markerGroup = new THREE.Group();
  /** Loose piles of dug goods, by cell. */
  private piles = new Map<number, { item: number; big: boolean; model: THREE.Object3D }>();
  private pileGroup = new THREE.Group();
  /** Painted effects: one-shot bursts, and streams of falling water keyed by cell. */
  private effects = new THREE.Group();
  private bursts: { obj: THREE.Object3D; age: number; frames: number; fps: number; vx: number; vy: number }[] = [];
  private streams = new Map<number, THREE.Object3D>();
  private wasNight = false;
  private markers = new Map<string, Marker>();
  /** The build preview: ghosts, the cells they cover, and the light they would cast. */
  private previewGhosts = new THREE.Group();
  private previewSquares = previewMesh(THREE.NormalBlending, 0.22);
  private previewGlow = previewMesh(THREE.AdditiveBlending, 1, 1);
  private previewKey = '';
  private hearths: Hearth[] = [];
  private lamps: THREE.PointLight[] = [];
  private shades: ShadeView[] = [];
  private survivors: Survivor[] = [];
  private embers!: THREE.Points;
  private emberLife!: Float32Array;
  private shade!: Float32Array;
  private shadeTarget!: Float32Array;
  private lightTex!: THREE.DataTexture;
  private maskTex?: THREE.DataTexture;
  /** The second material mask: r = iron ore, g = crystal. */
  private oreTex?: THREE.DataTexture;
  private waterTex?: THREE.DataTexture;
  private terrainShader?: THREE.ShaderMaterial;
  private fieldTex!: THREE.DataTexture;
  private marksTex!: THREE.DataTexture;
  private overlayShader!: THREE.ShaderMaterial;
  private latest?: Frame;
  private lastElements?: Uint8Array;
  private lastBuildings?: Uint8Array;
  private lastGrates?: Uint8Array;
  private clock = new THREE.Clock();
  private nightAmount = 0;
  private raycaster = new THREE.Raycaster();
  private playPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private ghostMaterial = new THREE.MeshBasicMaterial({ color: '#8fb8ff', transparent: true, opacity: 0.35, depthWrite: false });
  private barMaterial = new THREE.MeshBasicMaterial({ color: '#f0a04b', depthTest: false });
  private digMaterial = new THREE.MeshBasicMaterial({ color: '#f0a04b', transparent: true, opacity: 0.22, depthWrite: false, depthTest: false });
  private removeMaterial = new THREE.MeshBasicMaterial({ color: '#ff6b6b', transparent: true, opacity: 0.2, depthWrite: false, depthTest: false });
  private readonly glowTex = glowTexture();
  private badgeTex = new Map<string, THREE.Texture>();
  private flash?: { mesh: THREE.Mesh; age: number };
  private selection = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.5, -0.5, 0), new THREE.Vector3(0.5, -0.5, 0), new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector3(-0.5, 0.5, 0)]),
    new THREE.LineBasicMaterial({ color: '#7cc4ff', transparent: true, opacity: 0.9, depthTest: false }),
  );

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = PAINTED ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = PAINTED ? 1.05 : 1.2;
    this.scene.background = new THREE.Color('#020304');
    this.scene.add(this.terrain, this.buildings, this.markerGroup, this.effects, this.previewGlow, this.previewSquares, this.previewGhosts, this.pileGroup);
    this.selection.visible = false;
    this.selection.renderOrder = 10;
    this.scene.add(this.selection);

    // A faint cold fill so shapes read in the dark; all warmth comes from fire.
    this.scene.add(new THREE.HemisphereLight('#5f7fa8', '#2a1d14', 1.8));
    const rim = new THREE.DirectionalLight('#9cc4e4', 0.35);
    rim.position.set(-4, 6, 8);
    this.scene.add(rim);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 0.65, 0.55, 0.85));
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

  /** World units per screen pixel at the play plane. */
  unitsPerPixel() {
    return this.view.span / window.innerHeight;
  }

  pickCell(clientX: number, clientY: number): [number, number] | undefined {
    if (!this.width) return undefined;
    const ndc = new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.playPlane, new THREE.Vector3());
    if (!hit) return undefined;
    const x = Math.floor(hit.x + this.width / 2);
    const y = Math.floor(-hit.y + this.height / 2);
    return x >= 0 && y >= 0 && x < this.width && y < this.height ? [x, y] : undefined;
  }

  private gridTexture() {
    const t = new THREE.DataTexture(new Uint8Array(this.width * this.height * 4), this.width, this.height);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearFilter;
    return t;
  }

  /** Data texture index for sim cell (x, y); a plane's v = 0 is its bottom edge. */
  private texIndex(x: number, y: number) {
    return ((this.height - 1 - y) * this.width + x) * 4;
  }

  private setup(frame: Frame) {
    this.width = frame.width;
    this.height = frame.height;
    const n = this.width * this.height;
    this.shade = new Float32Array(n).fill(DARKEST);
    this.shadeTarget = new Float32Array(n).fill(DARKEST);

    this.lightTex = this.gridTexture();
    if (PAINTED) {
      this.maskTex = this.gridTexture();
      this.oreTex = this.gridTexture();
      this.waterTex = this.gridTexture();
      this.waterTex.magFilter = this.waterTex.minFilter = THREE.NearestFilter;
      this.terrainShader = terrainMaterial(this.maskTex, this.oreTex, this.lightTex, this.waterTex, this.width, this.height);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), this.terrainShader);
      ground.position.z = -0.1; // just behind the sprites standing in the play plane
      this.scene.add(ground);
    }
    this.fieldTex = this.gridTexture();
    this.marksTex = this.gridTexture();
    this.overlayShader = overlayMaterial(this.fieldTex, this.marksTex, this.width, this.height);
    const map = new THREE.Mesh(new THREE.PlaneGeometry(this.width, this.height), this.overlayShader);
    map.position.z = -0.05; // over the cave, under the sprites
    map.renderOrder = 1;
    this.scene.add(map);

    const count = 160;
    const geo = new THREE.BufferGeometry();
    // Start hidden; each ember spawns at a hearth when its random delay runs out.
    const start = new Float32Array(count * 3).map((_, i) => (i % 3 === 2 ? -999 : 0));
    geo.setAttribute('position', new THREE.BufferAttribute(start, 3));
    this.emberLife = Float32Array.from({ length: count }, () => Math.random() * 3);
    this.embers = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.09, map: this.glowTex, color: '#ffb35a', transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    this.embers.frustumCulled = false;
    this.scene.add(this.embers);

    this.addSurvivors(frame);

    const first = frame.buildings.indexOf(Building.Hearth);
    if (first >= 0) {
      const p = this.cellToWorld(first % this.width, Math.floor(first / this.width));
      this.view.x = p.x;
      this.view.y = p.y + 2;
    }
  }

  // --- Terrain ---------------------------------------------------------------

  private isSolid(e: number) {
    return isSolid(e);
  }

  private addInstances(geo: THREE.BufferGeometry, material: THREE.Material, placements: { cell: number; matrix: THREE.Matrix4; colour: THREE.Color }[], castShadow: boolean) {
    if (!placements.length) return;
    const mesh = new THREE.InstancedMesh(geo, material, placements.length);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = true;
    const cells = new Int32Array(placements.length);
    const base = new Float32Array(placements.length * 3);
    placements.forEach((p, i) => {
      mesh.setMatrixAt(i, p.matrix);
      mesh.setColorAt(i, p.colour);
      cells[i] = p.cell;
      p.colour.toArray(base, i * 3);
    });
    this.terrain.add(mesh);
    this.instanced.push({ mesh, cells, base });
  }

  private rebuildTerrain(elements: Uint8Array) {
    if (this.maskTex) {
      // Painted terrain: just update the material mask the shader reads.
      const mask = this.maskTex.image.data as Uint8Array;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const e = elements[y * this.width + x], i = this.texIndex(x, y);
          mask[i] = e === Element.Rock ? 255 : 0;
          mask[i + 1] = e === Element.Dirt ? 255 : 0;
          mask[i + 2] = e === Element.Coal ? 255 : 0;
          mask[i + 3] = e === TILE ? 255 : 0; // a = built tile
          const ores = this.oreTex!.image.data as Uint8Array;
          ores[i] = e === Element.Iron ? 255 : 0;
          ores[i + 1] = e === Element.Crystal ? 255 : 0;
        }
      }
      this.maskTex.needsUpdate = true;
      this.oreTex!.needsUpdate = true;
      this.updateWater(elements);
      return;
    }
    for (const { mesh } of this.instanced) mesh.dispose();
    this.terrain.clear();
    this.instanced = [];
    const { width: w, height: h } = this;
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? Element.Rock : elements[y * w + x]);

    type Placement = { cell: number; matrix: THREE.Matrix4; colour: THREE.Color };
    const blocks: Placement[] = [], edge: Placement[] = [], inner: Placement[] = [], spikes: Placement[] = [], pebbles: Placement[] = [], gems: Placement[] = [], glow: Placement[] = [];
    const q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const place = (list: Placement[], cell: number, pos: THREE.Vector3, rot: THREE.Euler, scale: THREE.Vector3, colour: string) =>
      list.push({ cell, matrix: new THREE.Matrix4().compose(pos, q.setFromEuler(rot), scale), colour: new THREE.Color(colour) });

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = y * w + x;
        const el = elements[c];
        if (!this.isSolid(el)) continue;
        const openAbove = !this.isSolid(at(x, y - 1)), openBelow = !this.isSolid(at(x, y + 1));
        const exposed = openAbove || openBelow || !this.isSolid(at(x - 1, y)) || !this.isSolid(at(x + 1, y));
        this.cellToWorld(x, y, p);
        const palette = ELEMENT_COLOURS[el];
        if (el === TILE) {
          // Built stone: a flat squared block, no lumps, spikes, pebbles or glow.
          place(blocks, c, p.clone(), e.set(0, 0, 0), s.set(1, 1, 1), palette[Math.floor(hash(c, 1) * palette.length)]);
          continue;
        }
        let colour = palette[Math.floor(hash(c, 1) * palette.length)];
        if (exposed && el !== Element.Coal) colour = `#${new THREE.Color(colour).multiplyScalar(1.18).getHexString()}`;
        const k = 1.35 + hash(c, 2) * 0.2;
        // Big overlapping lumps read as one rock mass; nudge exposed ones back from the open side so floors stay clear.
        const lump = p.clone().setZ((hash(c, 3) - 0.5) * 0.16);
        if (openAbove) lump.y -= 0.14;
        if (openBelow) lump.y += 0.1;
        if (!this.isSolid(at(x - 1, y))) lump.x += 0.1;
        if (!this.isSolid(at(x + 1, y))) lump.x -= 0.1;
        place(exposed ? edge : inner, c, lump, e.set(hash(c, 4) * 6.3, hash(c, 5) * 6.3, hash(c, 6) * 6.3), s.set(k, k * 0.95, k), colour);

        if (openBelow && hash(c, 7) < 0.35 && el !== Element.Coal) {
          const len = 0.25 + hash(c, 8) * 0.45;
          place(spikes, c, p.clone().add(new THREE.Vector3((hash(c, 9) - 0.5) * 0.5, -0.45, (hash(c, 10) - 0.5) * 0.5)), e.set(Math.PI, hash(c, 11) * 6, 0), s.set(1, len, 1), palette[0]);
        }
        if (openAbove && hash(c, 12) < 0.3) {
          const r = 0.5 + hash(c, 13) * 0.6;
          place(pebbles, c, p.clone().add(new THREE.Vector3((hash(c, 14) - 0.5) * 0.7, 0.5, 0.15 + hash(c, 15) * 0.3)), e.set(hash(c, 16) * 6, hash(c, 17) * 6, 0), s.set(r, r * 0.7, r), palette[2]);
        }
        if (openAbove && el !== Element.Coal && hash(c, 18) < 0.06) {
          place(glow, c, p.clone().add(new THREE.Vector3((hash(c, 19) - 0.5) * 0.6, 0.52, 0.3)), e.set(0, 0, 0), s.set(1, 0.6 + hash(c, 20), 1), '#7fe0d8');
        }
        if (el === Element.Coal) {
          for (let g = 0; g < 2; g++) {
            const r = 0.7 + hash(c, 21 + g);
            place(gems, c, p.clone().add(new THREE.Vector3((hash(c, 23 + g) - 0.5) * 0.6, (hash(c, 25 + g) - 0.5) * 0.6, 0.48)), e.set(hash(c, 27 + g) * 6, hash(c, 29 + g) * 6, 0), s.set(r, r, r), '#c9a66b');
          }
        }
      }
    }

    const rock = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.95 });
    this.addInstances(new THREE.BoxGeometry(0.98, 0.98, 0.9), rock, blocks, true);
    this.addInstances(lumpGeometry(7, 0.5, 0), rock, edge, true);
    this.addInstances(lumpGeometry(11, 0.5, 0), rock, inner, false);
    this.addInstances(new THREE.ConeGeometry(0.11, 1, 5).translate(0, 0.5, 0), rock, spikes, true);
    this.addInstances(lumpGeometry(3, 0.12, 0), rock, pebbles, true);
    this.addInstances(new THREE.OctahedronGeometry(0.07), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.3, metalness: 0.6, emissive: '#6a4a1a', emissiveIntensity: 0.6 }), gems, false);
    this.addInstances(new THREE.SphereGeometry(0.06, 6, 4).translate(0, 0.06, 0), new THREE.MeshStandardMaterial({ flatShading: true, emissive: '#3fc4bc', emissiveIntensity: 1.6 }), glow, false);

    this.terrain.add(this.backWall(elements));
    this.updateWater(elements);
  }

  /** A bumpy low-poly wall behind the caves, darkened by the light texture. */
  private backWall(elements: Uint8Array) {
    const { width: w, height: h } = this;
    const geo = new THREE.PlaneGeometry(w, h, w, h);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    // Gentle rolling bumps rather than per-vertex noise, so the wall reads as stone and not as tiles.
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(x * 0.9 + y * 0.5) * Math.cos(y * 0.8 - x * 0.3) * 0.22 + (hash(i, 31) - 0.5) * 0.06);
    }
    const flat = geo.toNonIndexed();
    const fpos = flat.attributes.position as THREE.BufferAttribute;
    const colours = new Float32Array(fpos.count * 3);
    const open = new THREE.Color('#5a4634'), dark = new THREE.Color('#3e3026'), behindRock = new THREE.Color('#1c1a1c');
    const col = new THREE.Color();
    // PlaneGeometry emits two triangles (six vertices) per segment, row by row from the top.
    for (let v = 0; v < fpos.count; v++) {
      const c = Math.floor(v / 6);
      const x = fpos.getX(v), y = fpos.getY(v);
      if (this.isSolid(elements[c])) col.copy(behindRock);
      else col.lerpColors(open, dark, 0.5 + 0.5 * Math.sin(x * 0.37 + Math.cos(y * 0.29) * 2) * Math.cos(y * 0.41));
      col.toArray(colours, v * 3);
    }
    flat.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    flat.computeVertexNormals();
    const wall = new THREE.Mesh(flat, new THREE.MeshStandardMaterial({ vertexColors: true, map: this.lightTex, flatShading: true, roughness: 1 }));
    wall.position.z = -0.75;
    wall.receiveShadow = true;
    return wall;
  }

  /**
   * Water is one continuous body rather than a block per cell: a front face
   * per cell, a lit surface on top of each column, a pale foam line along the
   * surface, and a gentle wave on every surface vertex. It is darker with
   * depth and shaded by the light texture like the back wall.
   */
  /**
   * Cells are either full or empty, so a pool's surface can be a cell higher
   * in some columns than others. Returns, for every surface cell, the average
   * height of its connected surface, so pools can be drawn flat.
   */
  private surfaceLevels(elements: Uint8Array) {
    const { width: w, height: h } = this;
    const isWater = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && elements[y * w + x] === Element.Water;
    const level = new Map<number, number>();
    const parent = new Map<number, number>();
    const find = (i: number): number => {
      let r = i;
      while (parent.get(r) !== r) r = parent.get(r)!;
      parent.set(i, r);
      return r;
    };
    const isSurface = (x: number, y: number) => isWater(x, y) && !isWater(x, y - 1);
    for (let i = 0; i < elements.length; i++) if (isSurface(i % w, Math.floor(i / w))) parent.set(i, i);
    for (const i of parent.keys()) {
      const x = i % w, y = Math.floor(i / w);
      for (const ny of [y - 1, y, y + 1]) {
        const lower = Math.max(y, ny);
        if (isSurface(x + 1, ny) && isWater(x, lower) && isWater(x + 1, lower)) parent.set(find(ny * w + x + 1), find(i));
      }
    }
    const sum = new Map<number, [number, number]>();
    for (const i of parent.keys()) {
      const r = find(i), acc = sum.get(r) ?? [0, 0];
      acc[0] += Math.floor(i / w);
      acc[1]++;
      sum.set(r, acc);
    }
    for (const i of parent.keys()) {
      const [total, n] = sum.get(find(i))!;
      level.set(i, total / n);
    }
    return level;
  }

  /**
   * Painted water lives in the terrain shader: a nearest-filtered texture
   * holding, per cell, how full it is (from the bottom) and how deep it sits
   * below the pool's surface.
   */
  private paintWater(elements: Uint8Array) {
    const { width: w, height: h } = this;
    const data = this.waterTex!.image.data as Uint8Array;
    data.fill(0);
    const level = this.surfaceLevels(elements);
    const isWater = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && elements[y * w + x] === Element.Water;
    // kind: 255 = the pool's surface cell, 128 = falling stream, 0 = body.
    const set = (x: number, y: number, fill: number, depth: number, kind: number, landing = false) => {
      if (y < 0) return;
      const i = this.texIndex(x, y);
      data[i] = Math.max(data[i], Math.round(Math.min(Math.max(fill, 0), 1) * 255));
      data[i + 1] = Math.round(Math.min(Math.max(depth, 0) / 8, 1) * 255);
      data[i + 2] = kind;
      data[i + 3] = landing ? 255 : 0;
    };
    // A column of water one cell wide that runs down into a wider pool is a
    // stream above that pool's surface. Returns the pool's level, or -1.
    const streamLevel = (x: number, y: number) => {
      let y1 = y;
      while (isWater(x, y1) && !isWater(x - 1, y1) && !isWater(x + 1, y1)) y1++;
      if (y1 === y || !isWater(x, y1)) return -1;
      const xn = isWater(x - 1, y1) ? x - 1 : x + 1;
      let ty = y1;
      while (isWater(xn, ty - 1)) ty--;
      const lv = level.get(ty * w + xn) ?? ty;
      return lv > y ? lv : -1;
    };
    for (let x = 0; x < w; x++) {
      let lv = -1, streamTo = -1;
      for (let y = 0; y < h; y++) {
        const c = y * w + x;
        if (elements[c] !== Element.Water) { lv = -1; streamTo = -1; continue; }
        const sl = streamLevel(x, y);
        if (sl >= 0) {
          lv = sl;
          streamTo = Math.floor(sl);
          if (y < streamTo) set(x, y, 1, 0, 128);
          else set(x, y, y + 1 - lv, 0, 255, true);
        } else if (lv < 0) {
          lv = level.get(c) ?? y;
          // The surface sits at the pool's average level, which may be above this cell.
          const above = lv < y && elements[c - w] === Element.Floor;
          set(x, y, y + 1 - lv, 0, above ? 0 : 255);
          if (above) set(x, y - 1, y - lv, 0, 255);
        } else if (y === streamTo) set(x, y, y + 1 - lv, 0, 255, true);
        else set(x, y, 1, y - lv, 0);
      }
    }
    this.waterTex!.needsUpdate = true;
  }

  private updateWater(elements: Uint8Array) {
    if (this.waterTex) return this.paintWater(elements);
    const { width: w, height: h } = this;
    const isWater = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && elements[y * w + x] === Element.Water;
    const pos: number[] = [], uv: number[] = [], col: number[] = [], index: number[] = [];
    const foamPos: number[] = [], foamIndex: number[] = [];
    const surface: number[] = []; // vertex ids that ride the waves
    const foamSurface: number[] = [];
    const shallow = new THREE.Color('#3f8fb0'), deep = new THREE.Color('#163f58'), c = new THREE.Color();
    const FRONT = 0.42, BACK = -0.42;
    const level = this.surfaceLevels(elements);
    const depthOf = (x: number, y: number) => {
      let d = 0;
      while (isWater(x, y - d - 1)) d++;
      return d;
    };
    const vertex = (x: number, y: number, z: number, depth: number, wave: boolean, top = y) => {
      y = wave ? top : y;
      const id = pos.length / 3;
      pos.push(x - w / 2, h / 2 - y, z);
      uv.push(x / w, 1 - y / h);
      c.lerpColors(shallow, deep, Math.min(depth / 6, 1));
      col.push(c.r, c.g, c.b);
      if (wave) surface.push(id);
      return id;
    };
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!isWater(x, y)) continue;
        const top = !isWater(x, y - 1);
        // Depth below this column's drawn surface, so the colour fades smoothly across columns.
        const d = y - (level.get((y - depthOf(x, y)) * w + x) ?? y);
        // Front face, from (x, y) at the top left to (x + 1, y + 1).
        const lv = level.get(y * w + x) ?? y;
        const a = vertex(x, y, FRONT, Math.max(d, 0), top, lv), b = vertex(x + 1, y, FRONT, Math.max(d, 0), top, lv);
        const e = vertex(x, y + 1, FRONT, d + 1, false), f = vertex(x + 1, y + 1, FRONT, d + 1, false);
        index.push(a, e, b, b, e, f);
        if (!top) continue;
        // The surface, sloping back into the cave.
        const g = vertex(x, y, BACK, 0, true, lv), k = vertex(x + 1, y, BACK, 0, true, lv);
        index.push(a, b, g, b, k, g);
        // Foam line just in front of the surface edge.
        const fid = foamPos.length / 3;
        foamPos.push(x - w / 2, h / 2 - lv + 0.03, FRONT + 0.01, x + 1 - w / 2, h / 2 - lv + 0.03, FRONT + 0.01,
          x - w / 2, h / 2 - lv - 0.05, FRONT + 0.01, x + 1 - w / 2, h / 2 - lv - 0.05, FRONT + 0.01);
        foamIndex.push(fid, fid + 2, fid + 1, fid + 1, fid + 2, fid + 3);
        foamSurface.push(fid, fid + 1, fid + 2, fid + 3);
      }
    }

    if (!this.water) {
      this.water = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({
        vertexColors: true, map: this.lightTex, roughness: 0.3, metalness: 0.1, emissive: '#0a2230',
        transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: false,
      }));
      this.water.renderOrder = 1;
      this.foam = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
        color: '#bfe3f2', map: this.lightTex, transparent: true, opacity: 0.7, depthWrite: false,
      }));
      this.foam.renderOrder = 2;
      this.scene.add(this.water, this.foam);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(index);
    geo.computeVertexNormals();
    this.water.geometry.dispose();
    this.water.geometry = geo;
    const foamGeo = new THREE.BufferGeometry();
    foamGeo.setAttribute('position', new THREE.Float32BufferAttribute(foamPos, 3));
    foamGeo.setAttribute('uv', new THREE.Float32BufferAttribute(foamPos.flatMap((v, i) => (i % 3 === 0 ? [(v + w / 2) / w] : i % 3 === 1 ? [(v + h / 2) / h] : [])), 2));
    foamGeo.setIndex(foamIndex);
    this.foam!.geometry.dispose();
    this.foam!.geometry = foamGeo;
    this.waterSurface = { ids: Int32Array.from(surface), base: Float32Array.from(surface.map((id) => pos[id * 3 + 1])) };
    this.foamSurface = { ids: Int32Array.from(foamSurface), base: Float32Array.from(foamSurface.map((id) => foamPos[id * 3 + 1])) };
  }

  /** Small rolling waves on the water surface and its foam line. */
  private animateWater(t: number) {
    for (const [mesh, surf] of [[this.water, this.waterSurface], [this.foam, this.foamSurface]] as const) {
      if (!mesh || !surf) continue;
      const p = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < surf.ids.length; i++) {
        const id = surf.ids[i];
        const x = p.getX(id), z = p.getZ(id);
        p.setY(id, surf.base[i] - 0.06 + Math.sin(t * 1.8 + x * 1.1 + z * 2) * 0.035 + Math.sin(t * 2.9 - x * 0.7) * 0.02);
      }
      p.needsUpdate = true;
    }
  }

  // --- Buildings and markers -------------------------------------------------

  private rebuildBuildings(buildings: Uint8Array, grates: Uint8Array) {
    this.buildings.clear();
    for (const h of this.hearths) this.scene.remove(h.light);
    this.hearths = [];
    for (const l of this.lamps) this.scene.remove(l);
    this.lamps = [];
    const p = new THREE.Vector3();
    buildings.forEach((b, i) => {
      const name = b === Building.Hearth && grates[i] ? 'hearth-grate' : BUILDING_MODELS[b];
      if (!name) return;
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      const model = makeModel(name);
      model.position.set(p.x, p.y - 0.5, 0);
      model.userData.cell = i;
      this.buildings.add(model);
      if (b === Building.Ladder && model.userData.piece) {
        // Tile the ladder: which piece this cell is depends on the ladder cells above and below.
        const above = i >= this.width && buildings[i - this.width] === Building.Ladder;
        const below = i + this.width < buildings.length && buildings[i + this.width] === Building.Ladder;
        model.userData.piece(above && below ? 'middle' : below ? 'top' : above ? 'bottom' : 'single');
      }
      if (b === Building.Hearth) {
        model.scale.setScalar(1.3);
        const light = new THREE.PointLight('#ffa255', 15, 18, 1);
        light.position.set(p.x, p.y + 0.8, 2.2);
        if (this.hearths.length < SHADOW_LIGHTS) {
          light.castShadow = true;
          light.shadow.mapSize.set(512, 512);
          light.shadow.camera.near = 0.2;
          light.shadow.camera.far = 20;
          light.shadow.bias = -0.004;
          light.shadow.radius = 3;
        }
        this.scene.add(light);
        this.hearths.push({ cell: i, model, flame: model.getObjectByName('flame')!, light });
      } else if (b === Building.Lamp || b === Building.CrystalLamp) {
        model.scale.setScalar(1.3);
        const crystal = b === Building.CrystalLamp;
        const light = new THREE.PointLight(crystal ? '#c8ecff' : '#ffd98a', crystal ? 5 : 4, crystal ? 13 : 7, 1.2);
        light.position.set(p.x + 0.22, p.y + 0.15, 1.2);
        this.scene.add(light);
        this.lamps.push(light);
      }
    });
  }

  private ghost(building: number, tint = '#9fc3ff', opacity = 0.5) {
    const model = makeModel(BUILDING_MODELS[building]);
    const flat = tint === '#9fc3ff' ? this.ghostMaterial : new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: opacity * 0.7, depthWrite: false });
    model.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const map = (o.material as THREE.MeshBasicMaterial).map;
      // Sprites keep their picture, washed out in the tint; models become a tinted silhouette.
      o.material = map ? new THREE.MeshBasicMaterial({ map, color: tint, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }) : flat;
      o.userData.lit = false;
      o.castShadow = false;
    });
    if (building === Building.Hearth || building === Building.Lamp || building === Building.CrystalLamp) model.scale.setScalar(1.3);
    return model;
  }

  /**
   * Show where a building would go before it is ordered: a ghost of it on each
   * cell, tinted by whether it fits, over squares marking the cells it covers.
   * `cells` alone (no building) marks the cells an area tool would touch, and
   * `glow` the cells its light would reach, 0..1.
   */
  setPreview(p?: { building?: number; spots: { x: number; y: number; fit: 'ok' | 'wait' | 'bad' }[]; area?: string; glow?: Map<number, number>; warm?: boolean }) {
    const key = p ? JSON.stringify([p.building, p.spots, p.area, p.glow ? [...p.glow.keys()].length : 0, p.warm]) : '';
    if (key === this.previewKey) return;
    this.previewKey = key;
    // Ghost materials are made per preview; their pictures are shared and stay.
    this.previewGhosts.traverse((o) => { if (o instanceof THREE.Mesh && o.material !== this.ghostMaterial) (o.material as THREE.Material).dispose(); });
    this.previewGhosts.clear();
    const squares = this.previewSquares, glow = this.previewGlow;
    squares.count = glow.count = 0;
    if (!p) return;
    const m = new THREE.Matrix4(), c = new THREE.Color(), pos = new THREE.Vector3();
    const tint = { ok: '#8ff0ad', wait: '#ffd27a', bad: '#ff7a7a' };
    for (const s of p.spots) {
      const color = p.area ?? tint[s.fit];
      const r = p.building !== undefined ? REACH[p.building] ?? 0 : 0;
      for (let dx = -r; dx <= r && squares.count < PREVIEW_MAX; dx++) {
        this.cellToWorld(s.x + dx, s.y, pos);
        m.makeTranslation(pos.x, pos.y, 0.06);
        squares.setMatrixAt(squares.count, m);
        squares.setColorAt(squares.count++, c.set(color));
      }
      if (p.building === undefined) continue;
      const ghost = this.ghost(p.building, color, s.fit === 'bad' ? 0.45 : 0.62);
      this.cellToWorld(s.x, s.y, pos);
      ghost.position.set(pos.x, pos.y - 0.5, 0.02);
      ghost.traverse((o) => { if (o instanceof THREE.Mesh) { (o.material as THREE.Material).depthTest = false; o.renderOrder = 8; } });
      this.previewGhosts.add(ghost);
    }
    const open = this.latest?.elements;
    for (const [i, level] of p.glow ?? []) {
      if (glow.count >= PREVIEW_MAX) break;
      if (open && open[i] !== Element.Floor) continue; // light stops at the rock face
      this.cellToWorld(i % this.width, Math.floor(i / this.width), pos);
      m.makeTranslation(pos.x, pos.y, 0.04);
      glow.setMatrixAt(glow.count, m);
      glow.setColorAt(glow.count++, c.set(p.warm ? '#ff9a3c' : '#ffe08a').multiplyScalar(0.18 * level * level));
    }
    for (const mesh of [squares, glow]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }

  private updateMarkers(frame: Frame) {
    for (const marker of this.markers.values()) marker.seen = false;
    const p = new THREE.Vector3();
    for (let k = 0; k < frame.jobs.length; k += JOB_STRIDE) {
      const [x, y, kind, building, progress] = frame.jobs.subarray(k, k + JOB_STRIDE);
      if (kind !== JOB_DIG && kind !== JOB_BUILD && kind !== JOB_DECONSTRUCT) continue; // refuelling, hauling and cooking happen on their own
      const key = `${x},${y},${kind},${building}`;
      let marker = this.markers.get(key);
      if (!marker) {
        this.cellToWorld(x, y, p);
        const icon = kind === JOB_DIG || kind === JOB_DECONSTRUCT;
        const object = kind === JOB_BUILD ? this.ghost(building) : makeModel(kind === JOB_DIG ? 'dig-marker' : 'deconstruct-marker');
        // Icons sit just in front of the cell, not out towards the camera, or
        // the perspective view slides them off the block they mark. They draw
        // over the rock lumps without depth testing instead.
        object.position.set(p.x, icon ? p.y : p.y - 0.5, icon ? 0.1 : 0);
        if (icon) object.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          (o.material as THREE.Material).depthTest = false;
          o.renderOrder = 7;
        });
        if (icon) {
          // A faint square marks the cell itself: ember to dig, red to take down.
          // It stays square to the grid while the icon above it rocks.
          const square = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.92), kind === JOB_DIG ? this.digMaterial : this.removeMaterial);
          square.position.set(p.x, p.y, 0.05);
          this.markerGroup.add(square);
          object.userData.square = square;
        }
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.08), this.barMaterial);
        bar.position.set(p.x, p.y - 0.42, 0.12);
        bar.renderOrder = 7;
        this.markerGroup.add(object, bar);
        marker = { object, bar, seen: true, flat: !icon };
        this.markers.set(key, marker);
      }
      marker.seen = true;
      const priority = frame.jobs[k + 6], stuck = frame.jobs[k + 7] !== 0;
      const showNumber = this.showPriorities || priority !== DEFAULT_PRIORITY;
      if (showNumber && !marker.badge) {
        marker.badge = this.badge(String(priority));
        this.cellToWorld(x, y, p);
        marker.badge.position.set(p.x - 0.3, p.y + 0.3, 0.9);
        this.markerGroup.add(marker.badge);
      }
      if (marker.badge) {
        marker.badge.visible = showNumber;
        marker.badge.material.map = this.badgeTexture(String(priority));
      }
      if (stuck && !marker.alert) {
        marker.alert = this.badge('!');
        this.cellToWorld(x, y, p);
        marker.alert.position.set(p.x + 0.3, p.y + 0.3, 0.9);
        this.markerGroup.add(marker.alert);
      }
      if (marker.alert) marker.alert.visible = stuck;
      marker.bar.visible = progress > 0;
      marker.bar.scale.x = Math.max(progress, 1) / 100;
    }
    for (const [key, marker] of this.markers) {
      if (marker.seen) continue;
      this.markerGroup.remove(marker.object, marker.bar, ...(marker.object.userData.square ? [marker.object.userData.square] : []));
      for (const b of [marker.badge, marker.alert]) if (b) { this.markerGroup.remove(b); b.material.dispose(); }
      this.markers.delete(key);
    }
  }

  /** Match the pile models to the sim's loose goods: a small or a big heap per cell. */
  private updatePiles(frame: Frame) {
    const p = new THREE.Vector3();
    for (const [i, v] of this.piles) {
      if (frame.pileItem[i] !== v.item || frame.pileAmount[i] >= 8 !== v.big) {
        this.pileGroup.remove(v.model);
        this.piles.delete(i);
      }
    }
    for (let i = 0; i < frame.pileItem.length; i++) {
      const item = frame.pileItem[i];
      if (!item || this.piles.has(i)) continue;
      const big = frame.pileAmount[i] >= 8;
      const model = makeModel(PILE_MODELS[item] ?? 'pile-stone', i);
      model.scale.setScalar(big ? 1.25 : 0.85);
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      model.position.set(p.x + ((i * 37) % 7 - 3) * 0.04, p.y - 0.5, 0.25);
      this.pileGroup.add(model);
      this.piles.set(i, { item, big, model });
    }
  }

  /** Benches, ovens and smelters show their working picture while a survivor works at them. */
  private showWorking(frame: Frame) {
    const busy = new Set<number>();
    for (let k = 0; k < frame.jobs.length; k += JOB_STRIDE) {
      const kind = frame.jobs[k + 2];
      if ((kind === JOB_RESEARCH || kind === JOB_REFINE) && frame.jobs[k + 4] > 0 && frame.jobs[k + 5]) busy.add(frame.jobs[k + 1] * frame.width + frame.jobs[k]);
    }
    for (const b of this.buildings.children) {
      const on = b.getObjectByName('on');
      if (!on) continue;
      const working = busy.has(b.userData.cell);
      on.visible = working;
      const off = b.getObjectByName('off');
      if (off) off.visible = !working;
    }
  }

  /** A door swings open while a survivor is in its doorway (either of its two cells). */
  private swingDoors(frame: Frame) {
    const inDoor = new Set<number>();
    for (let s = 0; s < frame.colonists.length; s += COLONIST_STRIDE) {
      if (frame.colonists[s + 3] === 5) continue;
      const c = frame.colonists[s + 1] * this.width + frame.colonists[s];
      inDoor.add(c);
      inDoor.add(c + this.width);
    }
    for (const b of this.buildings.children) {
      if (frame.buildings[b.userData.cell] !== Building.Door) continue;
      const open = inDoor.has(b.userData.cell);
      for (const [name, show] of [['closed', !open], ['open', open]] as const) {
        const o = b.getObjectByName(name);
        if (o) o.visible = show;
      }
    }
  }

  /** Stockpiles show the colony's coal: an empty pallet, a heap, a big heap. */
  private fillStockpiles(frame: Frame) {
    const level = frame.coal >= 40 ? 'full' : frame.coal >= 10 ? 'half' : 'empty';
    for (const b of this.buildings.children) {
      if (frame.buildings[b.userData.cell] !== Building.Stockpile) continue;
      for (const state of ['empty', 'half', 'full']) {
        const o = b.getObjectByName(state);
        if (o) o.visible = state === level;
      }
    }
  }

  /** A small round badge: a priority number on slate, or an amber "!" for a stuck order. */
  private badgeTexture(label: string) {
    let tex = this.badgeTex.get(label);
    if (tex) return tex;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const alert = label === '!';
    const n = Number(label);
    g.beginPath();
    g.arc(32, 32, 28, 0, Math.PI * 2);
    g.fillStyle = alert ? '#ffb454' : 'rgba(18, 26, 36, 0.9)';
    g.fill();
    g.lineWidth = 4;
    g.strokeStyle = alert ? '#2a1c14' : n > DEFAULT_PRIORITY ? '#7cc4ff' : 'rgba(255, 255, 255, 0.35)';
    g.stroke();
    g.fillStyle = alert ? '#2a1c14' : n > DEFAULT_PRIORITY ? '#7cc4ff' : '#eef3f8';
    g.font = '800 38px Manrope, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(label, 32, 34);
    tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.badgeTex.set(label, tex);
    return tex;
  }

  private badge(label: string) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.badgeTexture(label), depthTest: false, transparent: true, toneMapped: false }));
    sprite.scale.setScalar(0.36);
    sprite.renderOrder = 11;
    return sprite;
  }

  /** Ring a cell for a moment, to show where the camera jumped to. */
  flashCell(x: number, y: number) {
    if (!this.flash) {
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 40), new THREE.MeshBasicMaterial({ color: '#ffb454', transparent: true, depthTest: false, toneMapped: false }));
      mesh.renderOrder = 12;
      this.scene.add(mesh);
      this.flash = { mesh, age: 0 };
    }
    this.cellToWorld(x, y, this.flash.mesh.position);
    this.flash.mesh.position.z = 0.95;
    this.flash.age = 0;
  }

  /** Outline the inspected cell, or hide the outline. */
  select(cell?: [number, number]) {
    this.selection.visible = !!cell;
    if (cell) {
      this.cellToWorld(cell[0], cell[1], this.selection.position);
      this.selection.position.z = 0.9;
    }
  }

  // --- Light and frames -------------------------------------------------------

  private computeShade(frame: Frame) {
    const { width: w, height: h } = this;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const c = y * w + x;
        // Solid cells pick up light from the open cells beside them.
        let l = frame.light[c];
        if (x > 0) l = Math.max(l, frame.light[c - 1]);
        if (x < w - 1) l = Math.max(l, frame.light[c + 1]);
        if (y > 0) l = Math.max(l, frame.light[c - w]);
        if (y < h - 1) l = Math.max(l, frame.light[c + w]);
        this.shadeTarget[c] = DARKEST + (1 - DARKEST) * Math.min((l / 255) * 1.6, 1);
      }
    }
  }

  private applyShade(dt: number) {
    const k = Math.min(dt * 4, 1);
    for (let c = 0; c < this.shade.length; c++) this.shade[c] += (this.shadeTarget[c] - this.shade[c]) * k;
    const colour = new THREE.Color();
    for (const { mesh, cells, base } of this.instanced) {
      for (let i = 0; i < cells.length; i++) {
        const s = this.shade[cells[i]];
        mesh.setColorAt(i, colour.setRGB(base[i * 3] * s, base[i * 3 + 1] * s, base[i * 3 + 2] * s));
      }
      mesh.instanceColor!.needsUpdate = true;
    }
    const lit = this.lightTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const i = this.texIndex(x, y);
        lit[i] = lit[i + 1] = lit[i + 2] = this.shade[y * this.width + x] * 255;
        lit[i + 3] = 255;
      }
    }
    this.lightTex.needsUpdate = true;
  }

  /** Fills the map view's field texture; see overlay-shader.ts for the channels. */
  private paintField(frame: Frame) {
    if (this.overlay === 'none') return;
    const field = this.fieldTex.image.data as Uint8Array;
    const marks = this.marksTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = y * this.width + x;
        const i = this.texIndex(x, y);
        const open = frame.elements[c] === Element.Floor;
        field[i] = frame.firelight[c];
        field[i + 1] = frame.light[c];
        field[i + 2] = frame.nightFirelight[c];
        field[i + 3] = open ? 255 : 0;
        marks[i] = frame.elements[c] === Element.Coal ? 255 : 0;
        marks[i + 1] = frame.smoke[c];
        marks[i + 2] = frame.rooms[c] * 51; // room kind, 0..4, spread over the byte
      }
    }
    this.fieldTex.needsUpdate = true;
    this.marksTex.needsUpdate = true;
    const u = this.overlayShader.uniforms;
    u.uForecast.value = frame.night ? 0 : 1;
  }

  setOverlay(overlay: Overlay) {
    this.overlay = overlay;
    if (this.latest) this.paintField(this.latest);
  }

  /** One view per sim colonist; refugees join mid-game, so this runs every frame. */
  private addSurvivors(frame: Frame) {
    for (let i = this.survivors.length; i < frame.colonists.length / COLONIST_STRIDE; i++) {
      const o = i * COLONIST_STRIDE;
      const who = frame.colonists[o + C_WHO]; // which of the cast, so the art follows the person
      const model = makeModel('survivor', who);
      model.scale.setScalar(model.userData.flat ? 1 : 1.25);
      const part = (name: string) => model.getObjectByName(name)!;
      const parts = { legL: part('legL'), legR: part('legR'), armF: part('armF'), armB: part('armB'), head: part('head'), tool: part('tool') };
      this.scene.add(model);
      const s: Survivor = { model, parts, target: new THREE.Vector3(), pos: new THREE.Vector3(), facing: 1, activity: 0, cell: 0, job: -1, warmth: STAT_MAX, climbing: false, still: 10, stride: 0, dead: 0, falling: false, cheer: 0, breath: Math.random() * 2, index: who };
      this.cellToWorld(frame.colonists[o], frame.colonists[o + 1], s.pos);
      s.pos.y -= 0.5;
      this.survivors.push(s);
    }
  }

  applyFrame(frame: Frame, _ticksPerSecond: number) {
    const first = !this.latest;
    if (first) this.setup(frame);
    else this.addSurvivors(frame);
    this.latest = frame;

    if (!this.lastElements || frame.elements.some((e, i) => e !== this.lastElements![i])) {
      if (this.lastElements) this.dugOut(this.lastElements, frame.elements);
      const solidChanged = !this.lastElements || frame.elements.some((e, i) => this.isSolid(e) !== this.isSolid(this.lastElements![i]) || (e !== this.lastElements![i] && e !== Element.Water && this.lastElements![i] !== Element.Water));
      this.lastElements = frame.elements;
      if (solidChanged) this.rebuildTerrain(frame.elements);
      else this.updateWater(frame.elements);
      this.updateStreams(frame.elements);
    }
    const gratesChanged = !this.lastGrates || frame.hearthGrate.some((g, i) => g !== this.lastGrates![i]);
    if (!this.lastBuildings || gratesChanged || frame.buildings.some((b, i) => b !== this.lastBuildings![i])) {
      if (this.lastBuildings) this.builtOrRemoved(this.lastBuildings, frame.buildings);
      this.lastBuildings = frame.buildings;
      this.lastGrates = frame.hearthGrate;
      this.rebuildBuildings(frame.buildings, frame.hearthGrate);
    }
    this.computeShade(frame);
    if (first) this.shade.set(this.shadeTarget);
    this.paintField(frame);
    this.updateMarkers(frame);
    this.updatePiles(frame);
    this.fillStockpiles(frame);
    this.showWorking(frame);
    this.swingDoors(frame);

    this.survivors.forEach((s, i) => {
      const o = i * COLONIST_STRIDE;
      const [x, y, , activity, warmth] = frame.colonists.subarray(o, o + 5);
      this.cellToWorld(x, y, s.target);
      s.target.y -= 0.5;
      if (first) s.pos.copy(s.target);
      s.activity = activity;
      // Hauling walks with the sack, like carrying coal to a hearth.
      s.job = frame.colonists[o + 13] > 0 ? JOB_REFUEL : frame.colonists[o + 11];
      // Face the work while at it.
      const jobX = frame.colonists[o + 9];
      if (activity === 2 && jobX >= 0 && jobX !== x) s.facing = Math.sign(jobX - x);
      s.cell = y * this.width + x;
      s.warmth = warmth;
    });
    this.updateShades(frame);
    // Everyone still standing cheers when the night is over.
    if (this.wasNight && !frame.night) for (const s of this.survivors) s.cheer = 2.5;
    this.wasNight = frame.night;
  }

  // --- Effects ---------------------------------------------------------------

  /** Play a painted effect once at (x, y), drifting at (vx, vy) cells a second. */
  private burst(name: string, x: number, y: number, opts: { fps?: number; vx?: number; vy?: number; flip?: boolean } = {}) {
    if (!hasModel(`fx-${name}`) || this.bursts.length > 40) return;
    const obj = makeModel(`fx-${name}`);
    obj.position.set(x, y, 0.3);
    if (opts.flip) obj.rotation.y = Math.PI;
    this.effects.add(obj);
    this.bursts.push({ obj, age: 0, frames: 4, fps: opts.fps ?? 10, vx: opts.vx ?? 0, vy: opts.vy ?? 0 });
  }

  private animateBursts(dt: number, t: number) {
    this.bursts = this.bursts.filter((b) => {
      b.age += dt;
      const frame = b.age * b.fps;
      if (frame >= b.frames) {
        this.effects.remove(b.obj);
        return false;
      }
      b.obj.userData.frame(frame);
      b.obj.position.x += b.vx * dt;
      b.obj.position.y += b.vy * dt;
      return true;
    });
    for (const s of this.streams.values()) s.userData.frame(t * 10 + s.position.x);
  }

  /** A burst of rock, dirt or coal where a cell was dug out. */
  private dugOut(before: Uint8Array, after: Uint8Array) {
    const kind: Record<number, string> = { [Element.Rock]: 'debris-rock', [Element.Dirt]: 'debris-dirt', [Element.Coal]: 'debris-coal', [Element.Iron]: 'debris-rock', [Element.Crystal]: 'debris-rock', [TILE]: 'debris-rock' };
    const p = new THREE.Vector3();
    after.forEach((e, i) => {
      if (e !== Element.Floor || !kind[before[i]]) return;
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      this.burst(kind[before[i]], p.x, p.y);
    });
  }

  /** A puff of smoke where a building went up or came down. */
  private builtOrRemoved(before: Uint8Array, after: Uint8Array) {
    const p = new THREE.Vector3();
    after.forEach((b, i) => {
      if (b === before[i] || b === Building.Cairn) return;
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      this.burst('smoke-puff', p.x, p.y - 0.15, { fps: 7, vy: 0.4 });
    });
  }

  /** Falling water: a stream on every water cell with open space below, and a splash where it lands. */
  private updateStreams(elements: Uint8Array) {
    if (!hasModel('fx-falling-water')) return;
    const w = this.width, wanted = new Map<number, string>();
    for (let i = 0; i < elements.length - w; i++) {
      if (elements[i] !== Element.Water || elements[i + w] !== Element.Floor) continue;
      wanted.set(i, 'falling-water');
      // Follow the drop to where it lands.
      let j = i + w;
      while (j + w < elements.length && elements[j + w] === Element.Floor) j += w;
      if (hasModel('fx-splash')) wanted.set(j, 'splash');
    }
    for (const [i, obj] of this.streams) {
      if (wanted.get(i) === obj.userData.kind) wanted.delete(i);
      else {
        this.effects.remove(obj);
        this.streams.delete(i);
      }
    }
    const p = new THREE.Vector3();
    for (const [i, kind] of wanted) {
      const obj = makeModel(`fx-${kind}`);
      obj.userData.kind = kind;
      this.cellToWorld(i % w, Math.floor(i / w), p);
      obj.position.set(p.x, kind === 'splash' ? p.y - 0.25 : p.y, 0.25);
      this.effects.add(obj);
      this.streams.set(i, obj);
    }
  }

  /** Match the Shade views to the sim's list; extras fade out before they are removed. */
  private updateShades(frame: Frame) {
    const n = frame.shades.length / SHADE_STRIDE;
    for (let i = 0; i < n; i++) {
      const [x, y, state] = frame.shades.subarray(i * SHADE_STRIDE, i * SHADE_STRIDE + 3);
      let v = this.shades[i];
      if (!v) {
        const model = makeModel('shade', i);
        this.scene.add(model);
        v = { model, target: new THREE.Vector3(), pos: new THREE.Vector3(), attacking: false, fade: 0, gone: false, facing: 1 };
        this.cellToWorld(x, y, v.pos);
        v.pos.y -= 0.5;
        this.shades[i] = v;
      }
      this.cellToWorld(x, y, v.target);
      v.target.y -= 0.5;
      v.attacking = state === SHADE_ATTACKING;
      v.gone = false;
    }
    for (let i = n; i < this.shades.length; i++) this.shades[i].gone = true;
  }

  private animateShades(dt: number, t: number) {
    this.shades = this.shades.filter((v, i) => {
      v.fade = THREE.MathUtils.clamp(v.fade + (v.gone ? -dt * 1.5 : dt * 0.8), 0, 1);
      if (v.gone && v.fade <= 0) {
        this.scene.remove(v.model);
        return false;
      }
      const dx = v.target.x - v.pos.x, dy = v.target.y - v.pos.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 3) v.pos.copy(v.target);
      else if (dist > 0.001) {
        const step = Math.min(dist, SHADE_SPEED * dt * (v.attacking ? 1.6 : 1));
        v.pos.x += (dx / dist) * step;
        v.pos.y += (dy / dist) * step;
      }
      const { model } = v;
      const play = model.userData.play as ((anim: ShadeAnim, frame: number) => void) | undefined;
      if (play) {
        // Painted Shade: drifts, lunges when attacking, shrinks from the light as it goes.
        if (Math.abs(dx) > 0.05) v.facing = Math.sign(dx);
        model.position.set(v.pos.x, v.pos.y + Math.sin(t * 1.7 + i) * 0.08, 0.15);
        model.rotation.set(0, v.facing > 0 ? 0 : Math.PI, 0);
        model.scale.setScalar(0.85 + v.fade * 0.15);
        if (v.gone) play('dissolve', Math.min((1 - v.fade) * 5, 4));
        else if (v.attacking) play('lunge', t * 6 + i);
        else if (dist < 0.02) play('idle', t * 3 + i);
        else play('drift', t * 4 + i);
        ((model.getObjectByName('body') as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = v.fade;
        return true;
      }
      model.position.set(v.pos.x, v.pos.y + Math.sin(t * 1.7 + i) * 0.12, 0.15);
      model.rotation.z = Math.sin(t * 1.1 + i * 2) * 0.12;
      const shiver = v.attacking ? Math.sin(t * 30) * 0.06 : 0;
      model.scale.setScalar((0.6 + v.fade * 0.4) * (1 + shiver));
      model.traverse((o) => {
        if (!(o instanceof THREE.Mesh)) return;
        const m = o.material as THREE.MeshBasicMaterial;
        if (o.name === 'eye') { m.opacity = 1; o.visible = v.fade > 0.3; return; }
        m.opacity = (o.name === 'halo' || o.name === 'rim' ? 0.35 : 0.88) * v.fade;
        if (o.name.startsWith('rag')) o.rotation.z = Math.sin(t * 4 + Number(o.name[3]) * 1.3) * 0.25;
      });
      return true;
    });
  }

  // --- Animation -------------------------------------------------------------

  /** Painted puppet: front view when standing about, side view walking and working. */
  /**
   * Move the drawn position towards the sim's cell at walking pace. The sim
   * steps a whole cell at a time, so chasing it at a constant speed turns the
   * steps into a glide. Returns true while they are visibly walking.
   */
  private glide(s: Survivor, dt: number) {
    const dx = s.target.x - s.pos.x, dy = s.target.y - s.pos.y;
    const dist = Math.hypot(dx, dy);
    s.falling = false;
    if (dist > 6) {
      s.pos.copy(s.target); // teleported (the first frame)
      s.still = 10;
      return false;
    }
    if (dist < 0.002) {
      s.still += dt;
      return s.still < 0.18 && s.activity <= 1;
    }
    const onLadder = this.lastBuildings?.[s.cell] === Building.Ladder || this.lastBuildings?.[s.cell + this.width] === Building.Ladder;
    const falling = dy < -0.3 && !onLadder;
    // Falls drop like a stone (the sim moves a cell a tick); idle pottering is
    // an amble, so it reads as slow walking rather than stop-start dashes.
    const amble = s.activity === 0 && dist < 1.05; // idle steps come every 6 ticks
    const speed = falling ? 14 : amble ? WALK_SPEED / 3 : WALK_SPEED * Math.max(1, dist);
    const step = Math.min(dist, speed * dt);
    if (falling && Math.abs(dx) > 0.01) {
      // Off a ledge: step out over the edge, then drop, never drift through the air.
      s.pos.x += Math.sign(dx) * Math.min(Math.abs(dx), 2 * WALK_SPEED * dt);
      if (Math.abs(dx) < 0.5) s.pos.y += Math.max(dy, -14 * dt);
    } else {
      s.pos.x += (dx / dist) * step;
      s.pos.y += (dy / dist) * step;
    }
    if (Math.abs(dx) > 0.05) s.facing = Math.sign(dx);
    s.climbing = onLadder && Math.abs(dy) > Math.abs(dx);
    s.falling = falling;
    s.still = 0;
    s.stride += step;
    return true;
  }

  /**
   * Asleep or dead, the standing model gives way to a bedroll or a frosted
   * body. Death plays as a short collapse, then the body lies by its cairn
   * for a while and fades. Returns true when the standing model is hidden.
   */
  private restingOrDead(s: Survivor, dt: number, t: number) {
    const { model } = s;
    const asleep = s.activity === 3, dead = s.activity === 5;
    if (!asleep && !dead) {
      s.dead = 0;
      if (s.sleeper) s.sleeper.visible = false;
      if (s.corpse) s.corpse.visible = false;
      model.visible = true;
      return false;
    }
    if (asleep) {
      if (!s.sleeper) {
        s.sleeper = makeModel('survivor-sleeping', s.index);
        if (!s.sleeper.userData.flat) s.sleeper.scale.setScalar(1.25);
        this.scene.add(s.sleeper);
      }
      s.sleeper.visible = true;
      s.sleeper.position.copy(s.pos);
      const onBed = this.lastBuildings?.[s.cell] === Building.Bed;
      s.sleeper.userData.bed?.(onBed); // flat on their back on a cot, curled up on the ground
      if (s.sleeper.userData.flat && onBed) s.sleeper.position.y += BED_TOP; // on the mattress
      s.sleeper.rotation.y = s.facing > 0 ? 0 : Math.PI;
      const blanket = s.sleeper.getObjectByName('blanket');
      if (blanket) blanket.scale.y = 1 + Math.sin(t * 1.6 + s.index) * 0.05;
      model.visible = false;
      return true;
    }
    // Dead: 0.7 s collapse on the standing model, then the body. Whatever they
    // were doing before (asleep, say), nothing else of theirs stays on screen.
    if (s.sleeper) s.sleeper.visible = false;
    s.dead += dt;
    const k = Math.min(s.dead / 0.7, 1);
    const play = model.userData.play as ((anim: SurvivorAnim, frame: number) => void) | undefined;
    if (k < 1 && play) {
      // Painted collapse: four frames, then the body.
      model.visible = true;
      model.position.copy(s.pos);
      model.rotation.set(0, s.facing > 0 ? 0 : Math.PI, 0);
      model.scale.set(1, 1, 1);
      play('collapse', k * 4);
      return true;
    }
    if (k < 1) {
      model.visible = true;
      model.position.copy(s.pos);
      model.rotation.set(0, s.facing > 0 ? 0 : Math.PI, -k * k * 0.5 * s.facing);
      const sink = k * k;
      model.scale.set(1 + sink * 0.1, 1 - sink * 0.35, 1);
      return true;
    }
    if (!s.corpse) {
      s.corpse = makeModel('survivor-dead', s.index);
      if (!s.corpse.userData.flat) s.corpse.scale.setScalar(1.25);
      this.scene.add(s.corpse);
    }
    model.visible = false;
    s.corpse.visible = true;
    s.corpse.position.copy(s.pos);
    s.corpse.rotation.y = s.facing > 0 ? 0 : Math.PI;
    // The body lies a moment, then fades and leaves only the cairn.
    const gone = Math.min(Math.max((s.dead - 1.5) / 0.8, 0), 1);
    s.corpse.traverse((o) => {
      if (o instanceof THREE.Mesh) (o.material as THREE.MeshBasicMaterial).opacity = 1 - gone;
    });
    s.corpse.visible = gone < 1;
    return true;
  }

  /** Breath puffs in the cold, and frost creeping over someone close to freezing. */
  private coldShows(s: Survivor, cold: number, dt: number) {
    const frost = s.model.getObjectByName('frost') as THREE.Mesh | undefined;
    if (frost) (frost.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp((cold - 0.55) / 0.35, 0, 1) * 0.9;
    if (cold < 0.35) return;
    s.breath -= dt;
    if (s.breath > 0) return;
    s.breath = 1.6 + Math.random();
    this.burst('breath-mist', s.pos.x + 0.22 * s.facing, s.pos.y + 1.2, { fps: 6, vx: 0.3 * s.facing, vy: 0.15, flip: s.facing < 0 });
  }

  private animateFlatSurvivor(s: Survivor, dt: number, t: number, i: number) {
    const { model, parts } = s;
    const moving = this.glide(s, dt);
    if (this.restingOrDead(s, dt, t)) return;
    model.position.copy(s.pos);
    const play = model.userData.play as ((anim: SurvivorAnim, frame: number) => void) | undefined;
    if (play) {
      // Painted animation strips. Walking frames follow distance covered, so feet don't slide.
      model.rotation.set(0, s.facing > 0 ? 0 : Math.PI, 0);
      model.scale.set(1, 1, 1);
      const cold = 1 - s.warmth / STAT_MAX;
      s.cheer = Math.max(s.cheer - dt, 0);
      this.coldShows(s, cold, dt);
      if (s.falling) play('idle', 0);
      else if (moving && s.climbing) play('climb', s.stride * 4);
      else if (moving) play(s.job === 2 ? 'carry' : 'walk', (s.stride / 1.2) * 6 + i);
      else if (s.activity === 2) play(s.job === 0 ? 'dig' : 'build', t * (s.job === 0 ? 6 : 7) + i);
      else if (s.activity === 4) play('eat', t * 2.5 + i);
      else if (s.cheer > 0 && s.activity === 0) play('celebrate', t * 5 + i);
      else if (cold > 0.4) play('cold', t * 14 + i);
      else play('idle', t * 2.5 + i * 1.3);
      return;
    }
    const front = model.getObjectByName('front')!, side = model.getObjectByName('side')!;
    const walking = moving;
    side.visible = walking || s.activity === 2;
    front.visible = !side.visible;
    model.rotation.set(0, s.facing > 0 ? 0 : Math.PI, 0);
    model.scale.set(1, 1, 1);
    side.rotation.z = 0;
    let swing = 0;
    if (walking) {
      // Legs swing with distance covered, not time, so they stop when the feet stop.
      const phase = s.stride * 7 + i * 1.7;
      swing = Math.sin(phase) * 0.45;
      model.position.y += Math.abs(Math.sin(phase)) * 0.035;
      side.rotation.z = -0.05;
    } else if (s.activity === 2) {
      // Hacking at the rock: lean in and spring back.
      const hit = Math.pow(Math.max(Math.sin(t * 7 + i), 0), 3);
      side.rotation.z = -0.05 - hit * 0.22;
      swing = 0.15;
    } else {
      const breathe = Math.sin(t * 2.2 + i) * 0.015;
      model.scale.set(1 - breathe * 0.5, 1 + breathe, 1);
      const cold = 1 - s.warmth / STAT_MAX;
      if (cold > 0.4) model.position.x += Math.sin(t * 50 + i) * 0.012 * cold;
      if (s.activity === 4) model.position.y += Math.abs(Math.sin(t * 5 + i)) * 0.03; // munching
    }
    parts.legL.rotation.z = swing;
    parts.legR.rotation.z = -swing;
  }

  private animateSurvivor(s: Survivor, dt: number, t: number, i: number) {
    const { model, parts } = s;
    if (model.userData.flat) return this.animateFlatSurvivor(s, dt, t, i);
    const moving = this.glide(s, dt);
    if (this.restingOrDead(s, dt, t)) return;
    model.position.copy(s.pos);
    const phase = s.stride * 7 + i * 1.7;
    let legSwing = 0, armF = 0.1, armB = -0.1, headTilt = 0;
    parts.tool.visible = s.activity === 2;

    {
      model.rotation.set(0, s.facing > 0 ? -0.45 : Math.PI + 0.45, 0);
      model.scale.y = 1.25;
      if (moving) {
        legSwing = Math.sin(phase) * 0.7;
        armF = -legSwing * 0.8;
        armB = legSwing * 0.8;
        model.position.y += Math.abs(Math.sin(phase)) * 0.05;
      } else if (s.activity === 2) {
        const swing = Math.sin(t * 9 + i);
        armF = 1.6 + swing * 0.9;
        armB = 1.2 + swing * 0.7;
        headTilt = -0.15 + swing * 0.05;
      } else if (s.activity === 4) {
        armF = 2.2 + Math.sin(t * 6 + i) * 0.25;
        headTilt = 0.1;
      } else {
        // Idle: breathing, and shivering when cold.
        model.scale.y = 1.25 * (1 + Math.sin(t * 2.2 + i) * 0.015);
        const cold = 1 - s.warmth / STAT_MAX;
        if (cold > 0.4) model.position.x += Math.sin(t * 50 + i) * 0.012 * cold;
        if (cold > 0.4) { armF = 0.9; armB = 0.9; } // hugging themselves
      }
    }
    parts.legL.rotation.z = legSwing;
    parts.legR.rotation.z = -legSwing;
    parts.armF.rotation.z = armF;
    parts.armB.rotation.z = armB;
    parts.head.rotation.z = headTilt;
  }

  /** Brightness of the sim's light field at a world position, smoothly interpolated. */
  private shadeAt(wx: number, wy: number) {
    const gx = Math.min(Math.max(wx + this.width / 2 - 0.5, 0), this.width - 1.001);
    const gy = Math.min(Math.max(this.height / 2 - wy - 0.5, 0), this.height - 1.001);
    const x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
    const at = (x: number, y: number) => this.shade[y * this.width + x];
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  }

  /** Tint painted sprites by the light where they stand, and run their own animations. */
  private lightSprites(t: number) {
    const p = new THREE.Vector3();
    const tint = (root: THREE.Object3D) => root.traverse((o) => {
      o.userData.animate?.(t);
      if (!(o instanceof THREE.Mesh) || !o.userData.lit) return;
      o.getWorldPosition(p);
      const s = this.shadeAt(p.x, p.y + 0.4) * (o.userData.shade ?? 1);
      const warm = THREE.MathUtils.smoothstep(s, 0.3, 1);
      (o.material as THREE.MeshBasicMaterial).color.setRGB(s * (0.8 + warm * 0.4), s * (0.9 + warm * 0.12), s * (1.1 - warm * 0.32));
    });
    tint(this.buildings);
    tint(this.effects);
    tint(this.pileGroup);
    for (const s of this.survivors) {
      tint(s.model);
      if (s.sleeper?.visible) tint(s.sleeper);
      if (s.corpse?.visible) tint(s.corpse);
    }
  }

  /** Mushroom beds show how far along their next ration is; in the firelight they don't grow. */
  private growMushrooms(frame: Frame) {
    const phase = (frame.tick % MUSHROOM_TICKS) / MUSHROOM_TICKS;
    for (const b of this.buildings.children) {
      const stage = b.userData.stage as ((n: number) => void) | undefined;
      if (stage) stage(frame.firelight[b.userData.cell] >= DARK_BELOW ? 0 : Math.min(Math.floor(phase * 3), 2));
    }
  }

  private updateEmbers(dt: number, t: number) {
    const pos = this.embers.geometry.attributes.position as THREE.BufferAttribute;
    const lit = this.hearths.filter((h) => h.flame.visible);
    for (let i = 0; i < this.emberLife.length; i++) {
      this.emberLife[i] -= dt;
      if (this.emberLife[i] <= 0) {
        if (!lit.length) {
          pos.setXYZ(i, 0, 0, -999);
          continue;
        }
        const h = lit[i % lit.length].model.position;
        pos.setXYZ(i, h.x + (Math.random() - 0.5) * 0.4, h.y + 0.6, (Math.random() - 0.5) * 0.4);
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

    if (frame) {
      this.applyShade(dt);
      for (const h of this.hearths) {
        const lit = frame.light[h.cell] > 0;
        const flicker = 1 + Math.sin(t * 11 + h.cell) * 0.08 + Math.sin(t * 17.3 + h.cell * 2) * 0.06;
        h.flame.visible = lit;
        h.flame.scale.set(flicker, 2 - flicker, flicker);
        h.light.visible = lit;
        h.light.intensity = 15 * flicker * (1 - this.nightAmount * 0.35);
      }
      this.updateEmbers(dt, t);
      this.animateWater(t);
      for (const b of this.buildings.children) {
        const bubbles = b.getObjectByName('bubbles');
        bubbles?.children.forEach((bubble, j) => { bubble.position.y = 0.7 + ((t * 0.4 + j * 0.25) % 1) * 0.5; });
      }
      for (const marker of this.markers.values()) if (!marker.flat) marker.object.rotation.z = Math.sin(t * 3) * 0.15;
      // Faster sim, faster feet: the drawn walk keeps up with the cells.
      const sdt = dt * Math.max(this.timeScale, 1);
      this.survivors.forEach((s, i) => this.animateSurvivor(s, sdt, t, i));
      this.animateBursts(dt, t);
      this.growMushrooms(frame);
      this.animateShades(sdt, t);
      if (this.flash) {
        this.flash.age += dt;
        const k = Math.min(this.flash.age / 1.6, 1);
        this.flash.mesh.scale.setScalar(1 + k * 0.6);
        (this.flash.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - k;
        this.flash.mesh.visible = k < 1;
      }
      for (const l of this.lamps) l.intensity = 4 + Math.sin(t * 9 + l.position.x) * 0.3;
      this.lightSprites(t);
      if (this.terrainShader) this.terrainShader.uniforms.uTime.value = t;
      const u = this.overlayShader.uniforms;
      u.uTime.value = t;
      u.uFade.value += ((this.overlay === 'none' ? 0 : 1) - u.uFade.value) * Math.min(dt * 10, 1);
    }

    const dist = this.view.span / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    this.camera.position.set(this.view.x, this.view.y + dist * 0.12, dist);
    this.camera.lookAt(this.view.x, this.view.y, 0);
    this.composer.render();
  }
}
