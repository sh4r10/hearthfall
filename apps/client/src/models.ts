import * as THREE from 'three';

// Every visible thing in the world comes from this registry. Models are
// built in code from simple shapes, flat shaded for a low-poly look. To
// replace one with a hand-made model or sprite later, register a different
// factory under the same name; nothing else in the game needs to change.
//
// Units: one grid cell is 1 x 1. Models stand on y = 0 and face +x.

export type ModelFactory = (variant?: number) => THREE.Object3D;

const registry = new Map<string, ModelFactory>();

export function registerModel(name: string, factory: ModelFactory) {
  registry.set(name, factory);
}

export function makeModel(name: string, variant?: number): THREE.Object3D {
  const factory = registry.get(name);
  if (!factory) throw new Error(`No model registered as "${name}"`);
  return factory(variant);
}

// Shared materials keep draw state small and colours consistent with docs/art-brief.md.
const materials = new Map<string, THREE.MeshStandardMaterial>();
export function mat(color: string | number, opts: THREE.MeshStandardMaterialParameters = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...opts });
    materials.set(key, m);
  }
  return m;
}

function mesh(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Deterministic pseudo-random in [0, 1) so variants look the same every time. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A lumpy low-poly stone: an icosahedron with its corners pushed in and out. */
export function lumpGeometry(seed: number, radius = 0.5, detail = 0) {
  const geo = new THREE.IcosahedronGeometry(radius, detail);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  // Displace shared corners consistently, keyed by their rounded position.
  const offsets = new Map<string, number>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    if (!offsets.has(key)) offsets.set(key, 0.78 + rand(seed * 31 + offsets.size) * 0.4);
    const k = offsets.get(key)!;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
  }
  geo.computeVertexNormals();
  return geo;
}

// --- Buildings -------------------------------------------------------------

registerModel('hearth', () => {
  const g = new THREE.Group();
  const stone = [mat('#6b665f'), mat('#57524c'), mat('#7a746b')];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const r = mesh(lumpGeometry(i + 3, 0.13), stone[i % 3], Math.cos(a) * 0.42, 0.09, Math.sin(a) * 0.32);
    r.rotation.set(rand(i) * 3, rand(i + 9) * 3, 0);
    g.add(r);
  }
  const wood = mat('#4a3020');
  for (const [tilt, turn] of [[0.45, 0.3], [-0.45, -0.3], [0.1, 1.4]]) {
    const log = mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.62, 6), wood, 0, 0.16, 0);
    log.rotation.set(0, turn, Math.PI / 2 + tilt);
    g.add(log);
  }
  const embers = mesh(new THREE.IcosahedronGeometry(0.16, 0), mat('#ff7a1f', { emissive: '#ff5a00', emissiveIntensity: 2.2 }), 0, 0.12, 0);
  embers.scale.y = 0.5;
  embers.castShadow = false;
  g.add(embers);
  // The animated flame: two nested cones, named so the renderer can flicker them.
  const outer = mesh(new THREE.ConeGeometry(0.2, 0.62, 6), new THREE.MeshStandardMaterial({ color: '#ff8a2a', emissive: '#ff6a00', emissiveIntensity: 2.6, flatShading: true, transparent: true, opacity: 0.9 }), 0, 0.5, 0);
  const inner = mesh(new THREE.ConeGeometry(0.11, 0.42, 5), new THREE.MeshStandardMaterial({ color: '#fff0b0', emissive: '#ffd27a', emissiveIntensity: 3.2, flatShading: true }), 0, 0.42, 0.02);
  for (const f of [outer, inner]) f.castShadow = false;
  const flame = new THREE.Group();
  flame.name = 'flame';
  flame.add(outer, inner);
  g.add(flame);
  return g;
});

registerModel('ladder', () => {
  const g = new THREE.Group();
  const wood = mat('#8a6440');
  for (const x of [-0.3, 0.3]) g.add(mesh(new THREE.BoxGeometry(0.07, 1.02, 0.07), wood, x, 0.5, 0.25));
  for (const y of [0.18, 0.5, 0.82]) {
    const rung = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.62, 5), mat('#9c744c'), 0, y, 0.25);
    rung.rotation.z = Math.PI / 2;
    g.add(rung);
  }
  return g;
});

registerModel('diffuser', () => {
  const g = new THREE.Group();
  const metal = mat('#4c7f86', { metalness: 0.4, roughness: 0.5 });
  g.add(mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.6, 8), metal, 0, 0.3, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.06, 8), mat('#2f4f54'), 0, 0.05, 0));
  g.add(mesh(new THREE.SphereGeometry(0.18, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), metal, 0, 0.6, 0));
  const gauge = mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), mat('#d8f1ee', { emissive: '#28c4c0', emissiveIntensity: 0.6 }), 0.15, 0.36, 0.22);
  gauge.rotation.x = Math.PI / 2;
  g.add(gauge);
  const bubbles = new THREE.Group();
  bubbles.name = 'bubbles';
  for (let i = 0; i < 4; i++) {
    const b = mesh(new THREE.IcosahedronGeometry(0.05 + rand(i) * 0.03, 0), mat('#c9f2ee', { emissive: '#7fe0d8', emissiveIntensity: 0.5, transparent: true, opacity: 0.8 }), (rand(i + 4) - 0.5) * 0.3, 0.8, 0);
    b.castShadow = false;
    bubbles.add(b);
  }
  g.add(bubbles);
  return g;
});

registerModel('mushroom-bed', () => {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.92, 0.2, 0.5), mat('#5a4030'), 0, 0.1, 0));
  g.add(mesh(new THREE.BoxGeometry(0.84, 0.04, 0.42), mat('#2a1d14'), 0, 0.21, 0));
  const caps = ['#b8a1d9', '#9b83c4', '#c9b5e6', '#a68fd0'];
  for (let i = 0; i < 4; i++) {
    const x = -0.3 + i * 0.2, h = 0.12 + rand(i * 7) * 0.22, r = 0.07 + rand(i * 3) * 0.06;
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.035, h, 5), mat('#e8dccb'), x, 0.22 + h / 2, (rand(i) - 0.5) * 0.2));
    const cap = mesh(new THREE.SphereGeometry(r, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2), mat(caps[i], { emissive: caps[i], emissiveIntensity: 0.35 }), x, 0.22 + h, (rand(i) - 0.5) * 0.2);
    g.add(cap);
  }
  return g;
});

// --- Survivors -------------------------------------------------------------

const COATS = ['#6a4a3a', '#3e5566', '#56603e', '#70553a', '#5b4466'];
const SCARVES = ['#c2452f', '#d9a441', '#8a5fa8', '#4f8fb0', '#5f9e57'];

/**
 * A stocky survivor in a hooded winter coat, about 2.5 heads tall, as in the
 * art brief. Limbs are named groups pivoting at the shoulder or hip so the
 * renderer can animate them.
 */
registerModel('survivor', (variant = 0) => {
  const g = new THREE.Group();
  const coat = mat(COATS[variant % COATS.length]);
  const dark = mat('#2a2018');
  const skin = mat('#e2bf9c');

  const limb = (name: string, x: number, y: number, len: number, w: number, material: THREE.Material) => {
    const pivot = new THREE.Group();
    pivot.name = name;
    pivot.position.set(x, y, 0);
    pivot.add(mesh(new THREE.BoxGeometry(w, len, w), material, 0, -len / 2, 0));
    return pivot;
  };
  const legL = limb('legL', 0, 0.3, 0.3, 0.12, dark);
  legL.position.z = 0.07;
  const legR = limb('legR', 0, 0.3, 0.3, 0.12, dark);
  legR.position.z = -0.07;
  const body = mesh(new THREE.CylinderGeometry(0.17, 0.22, 0.36, 7), coat, 0, 0.47, 0);
  const armF = limb('armF', 0, 0.6, 0.3, 0.1, coat);
  armF.position.z = 0.2;
  armF.add(mesh(new THREE.IcosahedronGeometry(0.06, 0), mat('#7a5a3a'), 0, -0.32, 0)); // mitten
  // A pick in the front hand, shown by the renderer only while working.
  const tool = new THREE.Group();
  tool.name = 'tool';
  tool.position.y = -0.32;
  tool.add(mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.42, 5), mat('#8a6440'), 0, -0.14, 0));
  const pickHead = mesh(new THREE.TorusGeometry(0.15, 0.025, 4, 7, Math.PI * 0.8), mat('#b9b4ab', { metalness: 0.5, roughness: 0.4 }), 0, -0.4, 0);
  pickHead.rotation.z = Math.PI * 0.1;
  tool.add(pickHead);
  tool.visible = false;
  armF.add(tool);
  const armB = limb('armB', 0, 0.6, 0.3, 0.1, coat);
  armB.position.z = -0.2;

  const head = new THREE.Group();
  head.name = 'head';
  head.position.y = 0.82;
  const hood = mesh(new THREE.IcosahedronGeometry(0.24, 1), coat, -0.03, 0, 0);
  const trim = mesh(new THREE.TorusGeometry(0.15, 0.045, 5, 10), mat('#d8cbb4'), 0.13, -0.01, 0);
  trim.rotation.y = Math.PI / 2;
  const face = mesh(new THREE.IcosahedronGeometry(0.15, 1), skin, 0.1, -0.01, 0);
  const eye = mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat('#16110d'), 0.24, 0.02, 0.05);
  const eye2 = eye.clone();
  eye2.position.z = -0.05;
  head.add(hood, trim, face, eye, eye2);

  const scarf = mesh(new THREE.TorusGeometry(0.15, 0.05, 5, 10), mat(SCARVES[variant % SCARVES.length]), 0, 0.66, 0);
  scarf.rotation.x = Math.PI / 2;
  const tail = mesh(new THREE.BoxGeometry(0.07, 0.2, 0.05), mat(SCARVES[variant % SCARVES.length]), -0.14, 0.56, 0.06);
  tail.rotation.z = 0.3;

  g.add(legL, legR, body, armB, armF, scarf, tail, head);
  return g;
});

// --- Markers ---------------------------------------------------------------

registerModel('dig-marker', () => {
  const g = new THREE.Group();
  const handle = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), mat('#b07a46', { emissive: '#3a2410', emissiveIntensity: 0.6 }), 0, 0, 0);
  handle.rotation.z = -0.7;
  const head = mesh(new THREE.TorusGeometry(0.2, 0.035, 4, 8, Math.PI * 0.9), mat('#e2ddd4', { emissive: '#6a6a6a', emissiveIntensity: 0.6 }), 0.12, 0.12, 0);
  head.rotation.z = 0.25;
  g.add(handle, head);
  for (const m of [handle, head]) m.castShadow = false;
  return g;
});
