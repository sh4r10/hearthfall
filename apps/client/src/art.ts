import * as THREE from 'three';

// Real art lives in apps/client/art/. Vite inlines what's there at build time,
// so the single-file demo carries it too. Missing files fall back to the
// code-drawn placeholders.
const files = import.meta.glob('../art/*.{png,jpg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

export function artUrl(name: string): string | undefined {
  return files[`../art/${name}.png`] ?? files[`../art/${name}.jpg`];
}

const loader = new THREE.TextureLoader();

export function artTexture(name: string, fallback: () => THREE.Texture, opts: { repeat?: boolean } = {}): THREE.Texture {
  const url = artUrl(name);
  if (!url) return fallback();
  const tex = loader.load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (opts.repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

