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

/** A card showing `name`, `height` world units tall, anchored at its bottom centre. For a strip, `frames` sets the width of one frame. */
export function card(name: string, height: number, opts: { width?: number; frames?: number; additive?: boolean; lit?: boolean } = {}) {
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
    const aspect = image?.width ? image.width / (opts.frames ?? 1) / image.height : 1;
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

// Sizes follow the art's own scale: 192 px of art per grid cell (see the Codex
// art brief on the art/codex branch), divided by any scale the renderer adds.
const PX = 1 / 192;

if (has('hearth')) {
  registerModel('hearth', () => {
    const g = new THREE.Group();
    const base = card('hearth', (160 * PX) / 1.3); // the renderer draws hearths 1.3 times larger
    base.position.y = -0.03;
    base.renderOrder = 4;
    g.add(base);
    const flame = new THREE.Group();
    flame.name = 'flame';
    if (has('flame')) {
      const sprite = flipbook('flame', 8, 1.4 / 1.3, { additive: true, lit: false });
      sprite.position.set(0, 0.08, 0.02);
      sprite.renderOrder = 5;
      sprite.userData.animate = (t: number) => sprite.userData.frame(Math.floor(t * 12));
      flame.add(sprite);
    }
    g.add(flame);
    return g;
  });
}

if (has('ladder')) registerModel('ladder', () => {
  const g = new THREE.Group();
  const m = card('ladder', 1.07); // the rails stop a few pixels short of the image edges
  m.position.y = -0.035;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

if (has('mushroom-bed')) registerModel('mushroom-bed', () => {
  const g = new THREE.Group();
  const m = card('mushroom-bed', 160 * PX);
  m.position.y = -0.02;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

/** The cot's height, and where its mattress top is, for laying sleepers on it. */
const BED_HEIGHT = 1.05 / 3;
export const BED_TOP = BED_HEIGHT * 0.41 - 0.02;
if (has('bed')) registerModel('bed', () => {
  const g = new THREE.Group();
  const m = card('bed', BED_HEIGHT); // one cell wide, so beds side by side don't overlap
  m.position.y = -0.02;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

if (has('lamp')) registerModel('lamp', () => {
  const g = new THREE.Group();
  const m = card('lamp', 1.2 / 1.3); // the renderer draws lamps 1.3 times larger
  m.position.y = -0.02;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

if (has('cairn')) registerModel('cairn', () => {
  const g = new THREE.Group();
  const m = card('cairn', 160 * PX);
  m.position.y = -0.02;
  m.renderOrder = 3;
  g.add(m);
  return g;
});

// The dig marker is the painted pickaxe, centred on the cell and lit like a
// marker rather than by the cave, so orders stay readable in the dark.
if (has('pickaxe')) registerModel('dig-marker', () => {
  const g = new THREE.Group();
  const m = card('pickaxe', 0.62, { lit: false });
  m.position.y = -0.31;
  m.renderOrder = 6;
  g.add(m);
  return g;
});

/**
 * A card showing one frame of a strip of `frames` equal frames side by side,
 * `height` tall. `userData.frame(n)` shows frame n (wrapping), and
 * `userData.strip(name, frames)` swaps in another strip of the same frame size.
 */
function flipbook(name: string, frames: number, height: number, opts: { additive?: boolean; lit?: boolean } = {}) {
  const maps = new Map<string, THREE.Texture>();
  const strip = (n: string, count: number) => {
    let map = maps.get(n);
    if (!map) {
      map = texture(n).clone();
      map.repeat.set(1 / count, 1);
      map.userData.frames = count;
      maps.set(n, map);
    }
    return map;
  };
  const first = strip(name, frames);
  const mesh = card(name, height, { ...opts, frames });
  const material = mesh.material as THREE.MeshBasicMaterial;
  material.map = first;
  mesh.userData.strip = (n: string, count: number) => { material.map = strip(n, count); };
  mesh.userData.frame = (n: number) => {
    const map = material.map!;
    const count = map.userData.frames as number;
    map.offset.x = (((Math.floor(n) % count) + count) % count) / count;
  };
  return mesh;
}

/**
 * Survivors are flipbooks of painted animation strips (built from rigged
 * parts, so every frame lines up). Each strip is square 320 px frames scaled
 * to 192 px, with the feet 16/320 of a frame above the bottom edge.
 * `userData.play(anim, frame)` shows a frame of one of SURVIVOR_ANIMS; the
 * named limb groups are empty and only kept for the code-built survivor's
 * animation path.
 */
export const SURVIVOR_ANIMS = {
  idle: 4, walk: 6, dig: 4, build: 3, carry: 6, climb: 4, celebrate: 3, cold: 3, sleep: 2, eat: 3, collapse: 4, dead: 1,
} as const;
export type SurvivorAnim = keyof typeof SURVIVOR_ANIMS;
const SURVIVOR_FRAME = 1.92; // world size of a frame: a standing survivor is about 1.5 tall
const FEET = (16 / 320) * SURVIVOR_FRAME;

/** Lying down, a survivor is drawn smaller so they fit one cell, the size of a cot. */
const LYING = 0.67;

function survivorStrip(variant: number, anim: SurvivorAnim, scale = 1) {
  const v = has(`survivor-${variant % 2}-idle`) ? variant % 2 : 0;
  const book = flipbook(`survivor-${v}-${anim}`, SURVIVOR_ANIMS[anim], SURVIVOR_FRAME * scale);
  book.position.y = -FEET * scale;
  book.renderOrder = 6;
  return { book, v };
}

if (has('survivor-0-idle')) {
  registerModel('survivor', (variant = 0) => {
    const g = new THREE.Group();
    g.userData.flat = true;
    const { book, v } = survivorStrip(variant, 'idle');
    book.name = 'body';
    g.add(book);
    g.userData.play = (anim: SurvivorAnim, frame: number) => {
      book.userData.strip(`survivor-${v}-${anim}`, SURVIVOR_ANIMS[anim]);
      book.userData.frame(frame);
    };
    for (const name of ['legL', 'legR', 'armF', 'armB', 'head', 'tool']) {
      const empty = new THREE.Group();
      empty.name = name;
      g.add(empty);
    }
    return g;
  });

  /** Asleep on the ground under their coat, breathing slowly. */
  registerModel('survivor-sleeping', (variant = 0) => {
    const g = new THREE.Group();
    g.userData.flat = true;
    const { book } = survivorStrip(variant, 'sleep', LYING);
    book.userData.animate = (t: number) => book.userData.frame(t * 0.8 + variant * 0.7);
    g.add(book);
    return g;
  });

  /** Lying still on their side, frosted over. */
  registerModel('survivor-dead', (variant = 0) => {
    const g = new THREE.Group();
    g.userData.flat = true;
    const { book } = survivorStrip(variant, 'dead'); // the last collapse frame, so the same size
    book.name = 'body';
    g.add(book);
    return g;
  });
}
