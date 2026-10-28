import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { Building, Element, type Frame } from './protocol';
import { colonistTexture } from './sprites';

export type Overlay = 'none' | 'oxygen' | 'co2' | 'temperature';

const WALL_HEIGHT: Record<number, number> = { [Element.Dirt]: 0.7, [Element.Rock]: 1.3 };
const WALL_COLOR: Record<number, THREE.Color> = {
  [Element.Dirt]: new THREE.Color('#6b4a2f'),
  [Element.Rock]: new THREE.Color('#5b5650'),
};
const GROUND_COLOR: Record<number, [number, number, number]> = {
  [Element.Floor]: [92, 74, 52],
  [Element.Dirt]: [70, 50, 34],
  [Element.Rock]: [60, 58, 55],
  [Element.Water]: [38, 74, 104],
};
const DAY_SECONDS = 120;

/** Cheap per-cell hash so tiles get stable colour variation. */
function jitter(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n) - 0.5;
}

export class WorldRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly controls: MapControls;
  overlay: Overlay = 'none';

  private width = 0;
  private height = 0;
  private ground!: THREE.Mesh;
  private groundTex!: THREE.DataTexture;
  private overlayTex!: THREE.DataTexture;
  private overlayMesh!: THREE.Mesh;
  private walls?: THREE.InstancedMesh;
  private diffusers?: THREE.InstancedMesh;
  private lastElements?: Uint8Array;
  private colonists: { sprite: THREE.Sprite; from: THREE.Vector3; to: THREE.Vector3 }[] = [];
  private frameTime = 0;
  private frameInterval = 100;
  private latest?: Frame;

  private sun = new THREE.DirectionalLight('#ffe7c2', 2.2);
  private ambient = new THREE.HemisphereLight('#a9b8d6', '#3a2a1a', 0.6);
  private fire = new THREE.PointLight('#ff9a3c', 30, 18, 1.6);
  private clock = new THREE.Clock();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    this.camera.position.set(0, 26, 22);
    this.controls = new MapControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 90;
    this.controls.maxPolarAngle = Math.PI * 0.38;

    this.scene.background = new THREE.Color('#0d0b09');
    this.scene.fog = new THREE.Fog('#0d0b09', 40, 110);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 200 });
    this.scene.add(this.sun, this.sun.target, this.ambient);
    this.fire.position.set(0, 1.2, 0);
    this.fire.castShadow = true;
    this.scene.add(this.fire);

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** World position of the centre of cell (x, y). */
  cellToWorld(x: number, y: number, out = new THREE.Vector3()): THREE.Vector3 {
    return out.set(x - this.width / 2 + 0.5, 0, y - this.height / 2 + 0.5);
  }

  worldToCell(p: THREE.Vector3): [number, number] | undefined {
    const x = Math.floor(p.x + this.width / 2);
    const y = Math.floor(p.z + this.height / 2);
    return x >= 0 && y >= 0 && x < this.width && y < this.height ? [x, y] : undefined;
  }

  pickCell(clientX: number, clientY: number): [number, number] | undefined {
    const ndc = new THREE.Vector2((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    if (!this.ground) return undefined;
    const targets: THREE.Object3D[] = [this.ground];
    if (this.walls) targets.push(this.walls);
    const hit = ray.intersectObjects(targets, false)[0];
    if (!hit) return undefined;
    // Step slightly into the surface so clicks on a wall's side pick that wall.
    return this.worldToCell(hit.point.clone().addScaledVector(ray.ray.direction, 0.05));
  }

  private setup(frame: Frame) {
    this.width = frame.width;
    this.height = frame.height;
    const n = frame.width * frame.height;

    this.groundTex = new THREE.DataTexture(new Uint8Array(n * 4), frame.width, frame.height);
    this.groundTex.colorSpace = THREE.SRGBColorSpace;
    this.groundTex.magFilter = THREE.LinearFilter;
    const geo = new THREE.PlaneGeometry(frame.width, frame.height).rotateX(-Math.PI / 2);
    this.ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: this.groundTex, roughness: 0.95 }));
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.overlayTex = new THREE.DataTexture(new Uint8Array(n * 4), frame.width, frame.height);
    this.overlayTex.magFilter = THREE.LinearFilter;
    this.overlayMesh = new THREE.Mesh(
      geo.clone().translate(0, 0.02, 0),
      new THREE.MeshBasicMaterial({ map: this.overlayTex, transparent: true, depthWrite: false }),
    );
    this.overlayMesh.renderOrder = 1;
    this.scene.add(this.overlayMesh);

    // Campfire at the starting area.
    const fireMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.8, 7),
      new THREE.MeshStandardMaterial({ color: '#ff8a2a', emissive: '#ff6a00', emissiveIntensity: 3 }),
    );
    fireMesh.position.set(0, 0.4, 0);
    this.scene.add(fireMesh);

    const tints = ['#7d4b8a', '#3f6d8f', '#8f5a3f'];
    for (let i = 0; i < frame.colonists.length / 3; i++) {
      const mat = new THREE.SpriteMaterial({ map: colonistTexture(tints[i % tints.length]), alphaTest: 0.5 });
      const sprite = new THREE.Sprite(mat);
      sprite.center.set(0.5, 0);
      sprite.scale.set(0.8, 1.6, 1);
      this.scene.add(sprite);
      this.colonists.push({ sprite, from: new THREE.Vector3(), to: new THREE.Vector3() });
    }
  }

  private rebuildWalls(elements: Uint8Array) {
    if (this.walls) {
      this.scene.remove(this.walls);
      this.walls.dispose();
    }
    let count = 0;
    for (const e of elements) if (WALL_HEIGHT[e]) count++;
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
      new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
      count,
    );
    mesh.castShadow = mesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const color = new THREE.Color();
    let k = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = elements[y * this.width + x];
        const h = WALL_HEIGHT[e];
        if (!h) continue;
        const v = jitter(x, y);
        this.cellToWorld(x, y, p);
        m.makeScale(1, h * (1 + v * 0.3), 1).setPosition(p);
        mesh.setMatrixAt(k, m);
        mesh.setColorAt(k, color.copy(WALL_COLOR[e]).offsetHSL(0, 0, v * 0.08));
        k++;
      }
    }
    this.walls = mesh;
    this.scene.add(mesh);
  }

  private rebuildDiffusers(buildings: Uint8Array) {
    if (this.diffusers) {
      this.scene.remove(this.diffusers);
      this.diffusers.dispose();
    }
    const cells: number[] = [];
    buildings.forEach((b, i) => b === Building.OxygenDiffuser && cells.push(i));
    const mesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.3, 0.38, 0.9, 10).translate(0, 0.45, 0),
      new THREE.MeshStandardMaterial({ color: '#4fb3a6', emissive: '#2ad1c0', emissiveIntensity: 0.8 }),
      cells.length,
    );
    mesh.castShadow = true;
    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    cells.forEach((i, k) => mesh.setMatrixAt(k, m.makeTranslation(this.cellToWorld(i % this.width, Math.floor(i / this.width), p))));
    this.diffusers = mesh;
    this.scene.add(mesh);
  }

  /** Texture row for cell row y: plane UV v=0 sits at +z, cell y=0 at -z. */
  private texIndex(x: number, y: number) {
    return ((this.height - 1 - y) * this.width + x) * 4;
  }

  private paintGround(elements: Uint8Array) {
    const data = this.groundTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const [r, g, b] = GROUND_COLOR[elements[y * this.width + x]];
        const v = 1 + jitter(x, y) * 0.25;
        const i = this.texIndex(x, y);
        data[i] = r * v;
        data[i + 1] = g * v;
        data[i + 2] = b * v;
        data[i + 3] = 255;
      }
    }
    this.groundTex.needsUpdate = true;
  }

  private paintOverlay(frame: Frame) {
    const data = this.overlayTex.image.data as Uint8Array;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = y * this.width + x;
        const i = this.texIndex(x, y);
        let r = 0, g = 0, b = 0, a = 0;
        if (this.overlay === 'oxygen' || this.overlay === 'co2') {
          const mass = (this.overlay === 'oxygen' ? frame.oxygen : frame.co2)[c];
          const t = Math.min(mass / 2000, 1);
          [r, g, b] = this.overlay === 'oxygen' ? [80, 170 + 85 * t, 255] : [190, 200, 90];
          a = frame.elements[c] === Element.Floor ? 40 + 170 * t : 0;
        } else if (this.overlay === 'temperature') {
          const t = Math.min(Math.max((frame.temperature[c] - 27_315) / 6_000, 0), 1); // 0 C .. 60 C
          [r, g, b, a] = [255 * t, 80, 255 * (1 - t), 150];
        }
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = a;
      }
    }
    this.overlayTex.needsUpdate = true;
  }

  setOverlay(overlay: Overlay) {
    this.overlay = overlay;
    if (this.latest) this.paintOverlay(this.latest);
  }

  applyFrame(frame: Frame, ticksPerSecond: number) {
    if (!this.latest) this.setup(frame);
    const prevBuildings = this.latest?.buildings;
    this.latest = frame;
    this.frameInterval = 1000 / ticksPerSecond;
    this.frameTime = performance.now();

    const changed = !this.lastElements || frame.elements.some((e, i) => e !== this.lastElements![i]);
    if (changed) {
      this.lastElements = frame.elements;
      this.rebuildWalls(frame.elements);
      this.paintGround(frame.elements);
    }
    if (!prevBuildings || frame.buildings.some((b, i) => b !== prevBuildings[i])) this.rebuildDiffusers(frame.buildings);
    this.paintOverlay(frame);

    this.colonists.forEach((c, i) => {
      const [x, y, breath] = [frame.colonists[i * 3], frame.colonists[i * 3 + 1], frame.colonists[i * 3 + 2]];
      c.from.copy(c.sprite.position.lengthSq() ? c.sprite.position : this.cellToWorld(x, y));
      this.cellToWorld(x, y, c.to);
      const mat = c.sprite.material as THREE.SpriteMaterial;
      mat.color.setRGB(1, 0.4 + 0.6 * (breath / 100), 0.4 + 0.6 * (breath / 100));
      if (breath === 0) c.sprite.scale.set(1.6, 0.5, 1); // fallen over
    });
  }

  render() {
    const elapsed = this.clock.getElapsedTime();

    // Day/night: the sun swings overhead and drops to near-black at night,
    // leaving the campfire as the main light, Don't Starve style.
    const phase = ((elapsed + DAY_SECONDS * 0.08) % DAY_SECONDS) / DAY_SECONDS; // start in the morning
    const daylight = Math.max(0, Math.sin(phase * Math.PI * 2));
    this.sun.position.set(Math.cos(phase * Math.PI * 2) * 40, 10 + daylight * 40, 20);
    this.sun.intensity = 0.35 + daylight * 2.1; // moonlight keeps nights readable
    this.ambient.intensity = 0.3 + daylight * 0.4;
    this.renderer.toneMappingExposure = 0.8 + daylight * 0.4;
    this.fire.intensity = 28 + Math.sin(elapsed * 13) * 3 + Math.sin(elapsed * 7.3) * 4;

    const t = Math.min((performance.now() - this.frameTime) / this.frameInterval, 1);
    for (const c of this.colonists) c.sprite.position.lerpVectors(c.from, c.to, t);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
