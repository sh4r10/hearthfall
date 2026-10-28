import * as THREE from 'three';
import { fbm, hash2 } from './noise';

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function toTexture(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Greyscale stone detail for block faces: lumpy shading, cracks and grit.
 * Each block is tinted per instance, so one texture serves rock, dirt and coal.
 */
export function blockTexture(): THREE.Texture {
  const size = 128;
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      let s = 0.72 + (fbm(u * 6, v * 6, 4, 3) - 0.5) * 0.5;
      const crack = Math.abs(fbm(u * 4 + 9, v * 4, 3, 8) - 0.5);
      if (crack < 0.018) s *= 0.55;
      s *= 0.9 + hash2(x, y, 1) * 0.2;
      // Darken toward the edges so neighbouring blocks read as separate stones.
      const edge = Math.min(u, v, 1 - u, 1 - v);
      if (edge < 0.06) s *= 0.7 + edge * 5;
      const i = (y * size + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.min(255, s * 255);
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return toTexture(c);
}

/** Dark, rough rock for the back wall of the caves. Tiles seamlessly enough at this scale. */
export function backWallTexture(): THREE.Texture {
  const size = 256;
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const n = fbm(u * 8, v * 8, 5, 21);
      const strata = Math.sin((v * 22 + fbm(u * 3, v * 3, 2, 4) * 6) * Math.PI) * 0.06;
      const s = 0.32 + (n - 0.5) * 0.35 + strata + hash2(x, y, 9) * 0.05;
      const i = (y * size + x) * 4;
      img.data[i] = s * 150;
      img.data[i + 1] = s * 128;
      img.data[i + 2] = s * 110;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Soft round glow, used for flames and embers. */
export function glowTexture(): THREE.Texture {
  const [c, g] = canvas(64, 64);
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return toTexture(c, false);
}

/** Teardrop flame, white-hot core to orange edge. */
export function flameTexture(): THREE.Texture {
  const [c, g] = canvas(64, 128);
  const grad = g.createRadialGradient(32, 92, 2, 32, 80, 52);
  grad.addColorStop(0, '#fff6d8');
  grad.addColorStop(0.25, '#ffc24a');
  grad.addColorStop(0.6, '#ff6a1a');
  grad.addColorStop(1, 'rgba(255,60,0,0)');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(32, 4);
  g.bezierCurveTo(52, 50, 62, 80, 56, 100);
  g.bezierCurveTo(50, 122, 14, 122, 8, 100);
  g.bezierCurveTo(2, 80, 12, 50, 32, 4);
  g.fill();
  return toTexture(c);
}

/**
 * A survivor in a hooded winter coat, drawn side-on facing right.
 * Placeholder art, but in the style the real sprites should follow:
 * chunky silhouette, dark outline, muted colours with one accent.
 */
export function survivorTexture(coat: string, scarf: string): THREE.Texture {
  const [c, g] = canvas(128, 192);
  g.lineJoin = g.lineCap = 'round';
  const ink = '#16110d';
  const outline = (fill: string, draw: () => void) => {
    g.beginPath();
    draw();
    g.fillStyle = fill;
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = ink;
    g.stroke();
  };
  // Boots
  outline('#2a2018', () => { g.roundRect(40, 160, 22, 22, 6); g.roundRect(68, 160, 24, 22, 6); });
  // Coat
  outline(coat, () => {
    g.moveTo(34, 168);
    g.quadraticCurveTo(26, 110, 44, 84);
    g.lineTo(86, 84);
    g.quadraticCurveTo(104, 110, 98, 168);
    g.closePath();
  });
  // Coat seam and pocket
  g.strokeStyle = 'rgba(0,0,0,0.35)';
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(66, 92); g.lineTo(66, 166); g.stroke();
  g.strokeRect(74, 128, 14, 10);
  // Arm
  outline(coat, () => { g.roundRect(70, 96, 22, 50, 10); });
  outline('#c9a78a', () => { g.arc(82, 148, 7, 0, Math.PI * 2); });
  // Hood with fur trim
  outline(coat, () => { g.ellipse(64, 56, 38, 40, 0, 0, Math.PI * 2); });
  outline('#d8cbb4', () => { g.ellipse(72, 60, 27, 29, 0, 0, Math.PI * 2); });
  // Face
  outline('#e2bf9c', () => { g.ellipse(76, 62, 18, 20, 0, 0, Math.PI * 2); });
  g.fillStyle = ink;
  g.beginPath(); g.ellipse(84, 58, 3, 4.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(200,90,70,0.35)';
  g.beginPath(); g.arc(86, 70, 5, 0, Math.PI * 2); g.fill();
  // Scarf
  outline(scarf, () => { g.roundRect(48, 78, 46, 14, 7); g.roundRect(46, 84, 12, 30, 5); });
  return toTexture(c);
}
