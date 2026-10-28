import * as THREE from 'three';
import { artTexture, artUrl } from './art';
import { registerModel } from './models';

// Painted sprites from apps/client/art/ replace the code-built models of the
// same name whenever the image exists. Each sprite is a flat card standing in
// the play plane. Meshes marked `userData.lit` are tinted by the renderer with
// the light where they stand, so sprites darken in the dark like the terrain.
// `userData.animate(t)` is called every frame for anything that moves on its own.

const textures = new Map<string, THREE.Texture>();
function texture(name: string) {
  let t = textures.get(name);
  if (!t) {
    t = artTexture(name, () => new THREE.Texture());
    textures.set(name, t);
  }
  return t;
}

/** A card showing `name`, `height` world units tall, anchored at its bottom centre. */
export function card(name: string, height: number, opts: { width?: number; additive?: boolean; lit?: boolean } = {}) {
  const map = texture(name);
  const img = map.image as HTMLImageElement | undefined;
  // Width follows the image's aspect once it has loaded; images are inlined, so that is almost immediate.
  const geo = new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0);
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    map, transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: opts.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    toneMapped: !opts.additive,
  }));
  const fit = () => {
    const image = map.image as HTMLImageElement | undefined;
    const aspect = image?.width ? image.width / image.height : 1;
    mesh.scale.set(opts.width ?? height * aspect, height, 1);
  };
  if (img?.width) fit();
  else {
    fit();
    const check = () => (map.image as HTMLImageElement | undefined)?.width ? fit() : requestAnimationFrame(check);
    requestAnimationFrame(check);
  }
  mesh.userData.lit = opts.lit ?? true;
  return mesh;
}

const has = (...names: string[]) => names.every((n) => artUrl(n));

if (has('hearth')) {
  registerModel('hearth', () => {
    const g = new THREE.Group();
    const base = card('hearth', 0.62);
    base.position.y = -0.04;
    base.renderOrder = 4;
    g.add(base);
    const flame = new THREE.Group();
    flame.name = 'flame';
    if (has('flame')) {
      const FRAMES = 8;
      const map = texture('flame').clone();
      map.repeat.set(1 / FRAMES, 1);
      const sprite = card('flame', 0.95, { width: 0.95 * (109 / 192), additive: true, lit: false });
      (sprite.material as THREE.MeshBasicMaterial).map = map;
      sprite.position.set(0, 0.12, 0.02);
      sprite.renderOrder = 5;
      sprite.userData.animate = (t: number) => { map.offset.x = (Math.floor(t * 12) % FRAMES) / FRAMES; };
      flame.add(sprite);
    }
    g.add(flame);
    return g;
  });
}

if (has('ladder')) registerModel('ladder', () => {
  const g = new THREE.Group();
  const m = card('ladder', 1.04);
  m.position.y = -0.02;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

if (has('mushroom-bed')) registerModel('mushroom-bed', () => {
  const g = new THREE.Group();
  const m = card('mushroom-bed', 0.42);
  m.renderOrder = 3;
  g.add(m);
  return g;
});

if (has('diffuser')) registerModel('diffuser', () => {
  const g = new THREE.Group();
  const m = card('diffuser', 1.25);
  m.renderOrder = 3;
  g.add(m);
  return g;
});

/**
 * Survivors are puppets: the front view while standing about, and the side
 * view (facing +x) cut at the waist over two swinging boots while walking or
 * working. Named parts match the code-built survivor so the renderer can
 * animate either; the arms, head and tool are empty here.
 */
const WAIST = 0.765; // where the coat hem ends on the side view, from the top
const HEIGHT = 1.6;
if (has('survivor-0-front', 'survivor-0-side', 'survivor-0-leg1')) {
  registerModel('survivor', (variant = 0) => {
    const v = has(`survivor-${variant % 2}-front`) ? variant % 2 : 0;
    const g = new THREE.Group();
    g.userData.flat = true;

    const front = card(`survivor-${v}-front`, HEIGHT);
    front.name = 'front';
    front.renderOrder = 6;

    const side = new THREE.Group();
    side.name = 'side';
    const top = card(`survivor-${v}-side`, HEIGHT);
    const topMap = texture(`survivor-${v}-side`).clone();
    topMap.repeat.set(1, WAIST);
    topMap.offset.set(0, 1 - WAIST);
    (top.material as THREE.MeshBasicMaterial).map = topMap;
    top.geometry = new THREE.PlaneGeometry(1, WAIST).translate(0, WAIST / 2, 0);
    top.position.y = HEIGHT * (1 - WAIST);
    top.renderOrder = 7;
    side.add(top);
    const hip = HEIGHT * (1 - WAIST) + 0.06;
    for (const [name, x, order, tint] of [['legR', 0.02, 5, 0.7], ['legL', -0.04, 6, 1]] as const) {
      const pivot = new THREE.Group();
      pivot.name = name;
      pivot.position.set(x, hip, 0);
      const leg = card(`survivor-${v}-leg1`, hip + 0.01);
      leg.position.y = -hip - 0.01;
      leg.renderOrder = order;
      leg.userData.shade = tint; // the far leg sits in its own shadow
      pivot.add(leg);
      side.add(pivot);
    }
    side.visible = false;

    for (const name of ['armF', 'armB', 'head', 'tool']) {
      const empty = new THREE.Group();
      empty.name = name;
      g.add(empty);
    }
    g.add(front, side);
    return g;
  });
}
