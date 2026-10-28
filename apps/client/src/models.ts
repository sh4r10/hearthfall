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

/** The hooded head, centred on its own origin and facing +x, named 'head'. */
export function survivorHead(variant = 0) {
  const head = new THREE.Group();
  head.name = 'head';
  const hood = mesh(new THREE.IcosahedronGeometry(0.24, 1), mat(COATS[variant % COATS.length]), -0.03, 0, 0);
  const trim = mesh(new THREE.TorusGeometry(0.15, 0.045, 5, 10), mat('#d8cbb4'), 0.13, -0.01, 0);
  trim.rotation.y = Math.PI / 2;
  const face = mesh(new THREE.IcosahedronGeometry(0.15, 1), mat('#e2bf9c'), 0.1, -0.01, 0);
  const eye = mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), mat('#16110d'), 0.24, 0.02, 0.05);
  const eye2 = eye.clone();
  eye2.position.z = -0.05;
  head.add(hood, trim, face, eye, eye2);
  return head;
}

/**
 * A stocky survivor in a hooded winter coat, about 2.5 heads tall, as in the
 * art brief. Limbs are named groups pivoting at the shoulder or hip so the
 * renderer can animate them.
 */
function codeSurvivor(variant = 0) {
  const g = new THREE.Group();
  const coat = mat(COATS[variant % COATS.length]);
  const dark = mat('#2a2018');

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

  const head = survivorHead(variant);
  head.position.y = 0.82;

  const scarf = mesh(new THREE.TorusGeometry(0.15, 0.05, 5, 10), mat(SCARVES[variant % SCARVES.length]), 0, 0.66, 0);
  scarf.rotation.x = Math.PI / 2;
  const tail = mesh(new THREE.BoxGeometry(0.07, 0.2, 0.05), mat(SCARVES[variant % SCARVES.length]), -0.14, 0.56, 0.06);
  tail.rotation.z = 0.3;

  g.add(legL, legR, body, armB, armF, scarf, tail, head);
  return g;
}
registerModel('survivor', codeSurvivor);

/**
 * A bedroll on the ground, shared by the painted and code-built sleepers: a
 * low rounded blanket mound in the coat colour (0.9 x 0.32 x 0.5, centred a
 * little towards -x) and a rolled pillow at the +x end (to x = 0.475). The
 * mound is named 'blanket', has unit scale and its base on y = 0, so the
 * renderer can scale it in y for breathing; the pillow is named 'pillow'.
 */
export function bedroll(variant = 0) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.45, 0.32, 0.25);
  const blanket = mesh(geo, mat(COATS[variant % COATS.length]), -0.06, 0, 0);
  blanket.name = 'blanket';
  const pillow = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 7), mat('#d8cbb4'), 0.4, 0.075, 0);
  pillow.name = 'pillow';
  pillow.rotation.x = Math.PI / 2;
  g.add(blanket, pillow);
  return g;
}

registerModel('survivor-sleeping', (variant = 0) => {
  const g = bedroll(variant);
  const head = survivorHead(variant);
  head.scale.setScalar(0.85);
  head.position.set(0.36, 0.27, 0);
  head.rotation.z = 1.25; // face turned up, resting on the pillow
  g.add(head);
  return g;
});

/**
 * Pale ice shards over a lying body, in a group named 'frost'. `points` are
 * [x, y] spots along the top edge of the body; each gets one shard. Shards are
 * not tinted by the light field and cast no shadow.
 */
export function frost(points: [number, number][]) {
  const g = new THREE.Group();
  g.name = 'frost';
  const ice = mat('#9cc4e4', { emissive: '#5f7fa8', emissiveIntensity: 0.3 });
  points.forEach(([x, y], i) => {
    const shard = mesh(new THREE.ConeGeometry(0.035 + rand(i + 40) * 0.02, 0.08 + rand(i + 50) * 0.06, 4), ice, x, y, 0.04 + (rand(i + 60) - 0.5) * 0.08);
    shard.scale.z = 0.4;
    shard.rotation.z = (rand(i + 70) - 0.5) * 1.6;
    shard.castShadow = false;
    shard.userData.lit = false;
    g.add(shard);
  });
  return g;
}

/**
 * A survivor lying dead on their back along x, head towards +x, frosted over.
 * About 1.06 long and 0.52 tall before the renderer's survivor scale.
 */
registerModel('survivor-dead', (variant = 0) => {
  const g = new THREE.Group();
  const lay = new THREE.Group();
  lay.name = 'body';
  lay.rotation.y = Math.PI; // turns the head to +x, face still up
  const body = codeSurvivor(variant);
  body.rotation.z = Math.PI / 2; // head to -x, face up
  body.position.set(0.53, 0.25, 0);
  lay.add(body);
  g.add(lay, frost([[0.42, 0.5], [0.24, 0.47], [0.04, 0.44], [-0.12, 0.43], [-0.3, 0.36], [-0.44, 0.33]]));
  return g;
});

// --- Graves ----------------------------------------------------------------

/**
 * A grave cairn: a small pile of stones about 0.7 wide and 0.5 tall, with a
 * stick standing in it and a scrap of scarf (colour by variant) tied near its top.
 */
registerModel('cairn', (variant = 0) => {
  const g = new THREE.Group();
  const stone = [mat('#5a5b5f'), mat('#7a7873'), mat('#3d3f45')];
  // x, y, z, radius
  const stones: [number, number, number, number][] = [
    [-0.22, 0.09, 0.04, 0.13], [0.2, 0.09, 0.02, 0.14], [0, 0.1, -0.08, 0.15],
    [-0.02, 0.08, 0.12, 0.12], [-0.1, 0.24, 0, 0.12], [0.11, 0.23, 0.02, 0.11], [0.01, 0.36, 0.01, 0.09],
  ];
  stones.forEach(([x, y, z, r], i) => {
    const s = mesh(lumpGeometry(i * 5 + 17, r), stone[i % 3], x, y, z);
    s.rotation.set(rand(i + 80) * 3, rand(i + 90) * 3, 0);
    s.scale.y = 0.8;
    g.add(s);
  });
  const stick = mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.62, 5), mat('#8a6440'), -0.04, 0.31, -0.02);
  stick.name = 'stick';
  stick.rotation.z = 0.12;
  const cloth = mat(SCARVES[variant % SCARVES.length]);
  const knot = mesh(new THREE.BoxGeometry(0.07, 0.06, 0.07), cloth, -0.075, 0.54, -0.02);
  const scrap = mesh(new THREE.BoxGeometry(0.05, 0.16, 0.02), cloth, -0.01, 0.48, -0.02);
  scrap.name = 'scarf';
  scrap.rotation.z = 0.5;
  g.add(stick, knot, scrap);
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
