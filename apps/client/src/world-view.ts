import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Building, COLONIST_STRIDE, Element, JOB_STRIDE, STAT_MAX, type Frame } from './protocol';
import { lumpGeometry, makeModel, mat } from './models';
import { glowTexture } from './textures';

export type Overlay = 'none' | 'oxygen' | 'co2' | 'temperature';

// Side-on low-poly 3D, seen from the front. The sim grid lies in the XY plane
// (sim y grows downwards, world y upwards) and z points at the camera:
//   back wall (z -0.75) -> rock lumps (around 0) -> buildings and survivors (0) -> gas haze -> markers
// Hearths are real point lights with shadows. The sim's light field darkens
// everything it does not reach, so the picture always matches the rules.

const FOV = 35;
const SHADOW_LIGHTS = 4;
const DARKEST = 0.24;

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

interface Survivor {
  model: THREE.Object3D;
  parts: Record<'legL' | 'legR' | 'armF' | 'armB' | 'head' | 'tool', THREE.Object3D>;
  from: THREE.Vector3;
  to: THREE.Vector3;
  facing: number;
  activity: number;
  warmth: number;
}

interface Marker {
  object: THREE.Object3D;
  bar: THREE.Mesh;
  seen: boolean;
}

const BUILDING_MODELS: Record<number, string> = {
  [Building.Ladder]: 'ladder',
  [Building.OxygenDiffuser]: 'diffuser',
  [Building.MushroomBed]: 'mushroom-bed',
  [Building.Hearth]: 'hearth',
};

const ELEMENT_COLOURS: Record<number, string[]> = {
  [Element.Rock]: ['#5a5b5f', '#4d4e53', '#66655f'],
  [Element.Dirt]: ['#7d5638', '#6e4a30', '#8a6242'],
  [Element.Coal]: ['#2e2c31', '#242327', '#38353a'],
};

export class WorldView {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 600);
  overlay: Overlay = 'none';
  /** Camera target in world units, and cells visible vertically at the play plane. */
  readonly view = { x: 0, y: 0, span: 18 };

  private composer: EffectComposer;
  private grading = new ShaderPass(GradingShader);
  private width = 0;
  private height = 0;
  private terrain = new THREE.Group();
  private instanced: CellInstances[] = [];
  private water?: THREE.InstancedMesh;
  private waterCells: number[] = [];
  private buildings = new THREE.Group();
  private markerGroup = new THREE.Group();
  private markers = new Map<string, Marker>();
  private hearths: Hearth[] = [];
  private survivors: Survivor[] = [];
  private embers!: THREE.Points;
  private emberLife!: Float32Array;
  private shade!: Float32Array;
  private shadeTarget!: Float32Array;
  private lightTex!: THREE.DataTexture;
  private gasTex!: THREE.DataTexture;
  private latest?: Frame;
  private lastElements?: Uint8Array;
  private lastBuildings?: Uint8Array;
  private frameTime = 0;
  private frameInterval = 100;
  private clock = new THREE.Clock();
  private nightAmount = 0;
  private raycaster = new THREE.Raycaster();
  private playPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private ghostMaterial = new THREE.MeshBasicMaterial({ color: '#8fb8ff', transparent: true, opacity: 0.35, depthWrite: false });
  private barMaterial = new THREE.MeshBasicMaterial({ color: '#f0a04b' });
  private readonly glowTex = glowTexture();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.scene.background = new THREE.Color('#020304');
    this.scene.add(this.terrain, this.buildings, this.markerGroup);

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
    this.gasTex = this.gridTexture();
    const haze = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.height),
      new THREE.MeshBasicMaterial({ map: this.gasTex, transparent: true, depthWrite: false }),
    );
    haze.position.z = 0.55;
    haze.renderOrder = 2;
    this.scene.add(haze);

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

    for (let i = 0; i < frame.colonists.length / COLONIST_STRIDE; i++) {
      const model = makeModel('survivor', i);
      model.scale.setScalar(1.25);
      const part = (name: string) => model.getObjectByName(name)!;
      const parts = { legL: part('legL'), legR: part('legR'), armF: part('armF'), armB: part('armB'), head: part('head'), tool: part('tool') };
      this.scene.add(model);
      this.survivors.push({ model, parts, from: new THREE.Vector3(), to: new THREE.Vector3(), facing: 1, activity: 0, warmth: STAT_MAX });
    }

    const first = frame.buildings.indexOf(Building.Hearth);
    if (first >= 0) {
      const p = this.cellToWorld(first % this.width, Math.floor(first / this.width));
      this.view.x = p.x;
      this.view.y = p.y + 2;
    }
  }

  // --- Terrain ---------------------------------------------------------------

  private isSolid(e: number) {
    return e === Element.Rock || e === Element.Dirt || e === Element.Coal;
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
    for (const { mesh } of this.instanced) mesh.dispose();
    this.terrain.clear();
    this.instanced = [];
    const { width: w, height: h } = this;
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? Element.Rock : elements[y * w + x]);

    type Placement = { cell: number; matrix: THREE.Matrix4; colour: THREE.Color };
    const edge: Placement[] = [], inner: Placement[] = [], spikes: Placement[] = [], pebbles: Placement[] = [], gems: Placement[] = [], glow: Placement[] = [];
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

  private updateWater(elements: Uint8Array) {
    const cells: number[] = [];
    elements.forEach((e, i) => { if (e === Element.Water) cells.push(i); });
    if (!this.water || this.water.instanceMatrix.count < cells.length) {
      if (this.water) this.scene.remove(this.water);
      this.water = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1.1),
        new THREE.MeshStandardMaterial({ color: '#3c7896', emissive: '#0f2a3a', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.7 }),
        Math.max(64, cells.length * 2),
      );
      this.water.renderOrder = 1;
      this.scene.add(this.water);
    }
    const m = new THREE.Matrix4(), p = new THREE.Vector3();
    this.waterCells = cells;
    cells.forEach((c, i) => {
      this.cellToWorld(c % this.width, Math.floor(c / this.width), p);
      this.water!.setMatrixAt(i, m.makeTranslation(p.x, p.y, 0));
    });
    this.water.count = cells.length;
    this.water.instanceMatrix.needsUpdate = true;
  }

  // --- Buildings and markers -------------------------------------------------

  private rebuildBuildings(buildings: Uint8Array) {
    this.buildings.clear();
    for (const h of this.hearths) this.scene.remove(h.light);
    this.hearths = [];
    const p = new THREE.Vector3();
    buildings.forEach((b, i) => {
      const name = BUILDING_MODELS[b];
      if (!name) return;
      this.cellToWorld(i % this.width, Math.floor(i / this.width), p);
      const model = makeModel(name);
      model.position.set(p.x, p.y - 0.5, 0);
      this.buildings.add(model);
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
      }
    });
  }

  private ghost(building: number) {
    const model = makeModel(BUILDING_MODELS[building]);
    model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.material = this.ghostMaterial;
        o.castShadow = false;
      }
    });
    if (building === Building.Hearth) model.scale.setScalar(1.3);
    return model;
  }

  private updateMarkers(frame: Frame) {
    for (const marker of this.markers.values()) marker.seen = false;
    const p = new THREE.Vector3();
    for (let k = 0; k < frame.jobs.length; k += JOB_STRIDE) {
      const [x, y, kind, building, progress] = frame.jobs.subarray(k, k + JOB_STRIDE);
      if (kind === 2) continue; // refuelling happens on its own
      const key = `${x},${y},${kind},${building}`;
      let marker = this.markers.get(key);
      if (!marker) {
        this.cellToWorld(x, y, p);
        const object = kind === 0 ? makeModel('dig-marker') : this.ghost(building);
        object.position.set(p.x, kind === 0 ? p.y : p.y - 0.5, kind === 0 ? 0.75 : 0);
        const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.08), this.barMaterial);
        bar.position.set(p.x, p.y - 0.42, 0.8);
        this.markerGroup.add(object, bar);
        marker = { object, bar, seen: true };
        this.markers.set(key, marker);
      }
      marker.seen = true;
      marker.bar.visible = progress > 0;
      marker.bar.scale.x = Math.max(progress, 1) / 100;
    }
    for (const [key, marker] of this.markers) {
      if (marker.seen) continue;
      this.markerGroup.remove(marker.object, marker.bar);
      this.markers.delete(key);
    }
  }

  // --- Light, gas and frames -------------------------------------------------

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
    if (this.water) {
      this.waterCells.forEach((c, i) => this.water!.setColorAt(i, colour.setScalar(this.shade[c])));
      if (this.water.instanceColor) this.water.instanceColor.needsUpdate = true;
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

  private paintGas(frame: Frame) {
    const gas = this.gasTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = y * this.width + x;
        const i = this.texIndex(x, y);
        let r = 0, g = 0, b = 0, alpha = 0;
        if (frame.elements[c] === Element.Floor) {
          if (this.overlay === 'oxygen') {
            const t = Math.min(frame.oxygen[c] / 1800, 1);
            [r, g, b, alpha] = [70, 150 + 100 * t, 255, 30 + 150 * t];
          } else if (this.overlay === 'co2') {
            const t = Math.min(frame.co2[c] / 1800, 1);
            [r, g, b, alpha] = [190, 200, 80, 30 + 150 * t];
          } else if (this.overlay === 'temperature') {
            const t = Math.min(Math.max((frame.temperature[c] - 27_315) / 6_000, 0), 1);
            [r, g, b, alpha] = [255 * t, 70, 255 * (1 - t), 140];
          } else {
            const t = Math.min(frame.co2[c] / 2500, 1);
            [r, g, b, alpha] = [110, 120, 60, t * 90]; // CO2 hangs low as a murk
          }
        }
        gas[i] = r; gas[i + 1] = g; gas[i + 2] = b; gas[i + 3] = alpha;
      }
    }
    this.gasTex.needsUpdate = true;
  }

  setOverlay(overlay: Overlay) {
    this.overlay = overlay;
    if (this.latest) this.paintGas(this.latest);
  }

  applyFrame(frame: Frame, ticksPerSecond: number) {
    const first = !this.latest;
    if (first) this.setup(frame);
    this.latest = frame;
    this.frameInterval = 1000 / ticksPerSecond;
    this.frameTime = performance.now();

    if (!this.lastElements || frame.elements.some((e, i) => e !== this.lastElements![i])) {
      const solidChanged = !this.lastElements || frame.elements.some((e, i) => this.isSolid(e) !== this.isSolid(this.lastElements![i]) || (e !== this.lastElements![i] && e !== Element.Water && this.lastElements![i] !== Element.Water));
      this.lastElements = frame.elements;
      if (solidChanged) this.rebuildTerrain(frame.elements);
      else this.updateWater(frame.elements);
    }
    if (!this.lastBuildings || frame.buildings.some((b, i) => b !== this.lastBuildings![i])) {
      this.lastBuildings = frame.buildings;
      this.rebuildBuildings(frame.buildings);
    }
    this.computeShade(frame);
    if (first) this.shade.set(this.shadeTarget);
    this.paintGas(frame);
    this.updateMarkers(frame);

    this.survivors.forEach((s, i) => {
      const o = i * COLONIST_STRIDE;
      const [x, y, , activity, , warmth] = frame.colonists.subarray(o, o + 6);
      s.from.copy(first ? this.cellToWorld(x, y).setY(this.cellToWorld(x, y).y - 0.5) : s.model.position);
      this.cellToWorld(x, y, s.to);
      s.to.y -= 0.5;
      if (Math.abs(s.to.x - s.from.x) > 0.01) s.facing = Math.sign(s.to.x - s.from.x);
      s.activity = activity;
      s.warmth = warmth;
    });
  }

  // --- Animation -------------------------------------------------------------

  private animateSurvivor(s: Survivor, k: number, t: number, i: number) {
    const { model, parts } = s;
    model.position.lerpVectors(s.from, s.to, k);
    const moving = s.from.distanceToSquared(s.to) > 0.01 && k < 1;
    const lying = s.activity === 3 || s.activity === 5;
    const phase = t * 11 + i * 1.7;
    let legSwing = 0, armF = 0.1, armB = -0.1, headTilt = 0;
    parts.tool.visible = s.activity === 2;

    if (lying) {
      model.rotation.set(0, s.facing > 0 ? 0 : Math.PI, Math.PI / 2);
      model.position.y += 0.25;
      model.position.x -= 0.3 * s.facing;
      if (s.activity === 3) model.scale.y = 1.25 * (1 + Math.sin(t * 2 + i) * 0.03); // slow breathing
    } else {
      model.rotation.set(0, s.facing > 0 ? -0.45 : Math.PI + 0.45, 0);
      model.scale.y = 1.25;
      if (moving || s.activity === 1) {
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
      for (const b of this.buildings.children) {
        const bubbles = b.getObjectByName('bubbles');
        bubbles?.children.forEach((bubble, j) => { bubble.position.y = 0.7 + ((t * 0.4 + j * 0.25) % 1) * 0.5; });
      }
      for (const marker of this.markers.values()) marker.object.rotation.z = Math.sin(t * 3) * 0.15;
      const k = Math.min((performance.now() - this.frameTime) / this.frameInterval, 1);
      this.survivors.forEach((s, i) => this.animateSurvivor(s, k, t, i));
    }

    const dist = this.view.span / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    this.camera.position.set(this.view.x, this.view.y + dist * 0.12, dist);
    this.camera.lookAt(this.view.x, this.view.y, 0);
    this.composer.render();
  }
}
