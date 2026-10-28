import * as THREE from 'three';

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

const INK = '#16110d';

function sprite(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const [c, g] = canvas(w, h);
  g.lineJoin = g.lineCap = 'round';
  g.strokeStyle = INK;
  g.lineWidth = 5;
  draw(g);
  return toTexture(c);
}

/** One cell of ladder, 64x64, meant to tile vertically. */
export function ladderTexture() {
  return sprite(64, 64, (g) => {
    g.fillStyle = '#8a6440';
    for (const x of [12, 46]) {
      g.fillRect(x, 0, 7, 64);
      g.strokeRect(x, -4, 7, 72);
    }
    for (const y of [10, 32, 54]) {
      g.fillRect(14, y - 3, 36, 7);
      g.strokeRect(14, y - 3, 36, 7);
    }
  });
}

export function diffuserTexture() {
  return sprite(64, 64, (g) => {
    g.fillStyle = '#4c7f86';
    g.beginPath();
    g.roundRect(10, 16, 44, 44, 8);
    g.fill();
    g.stroke();
    g.fillStyle = '#9fe6de';
    g.beginPath();
    g.roundRect(20, 26, 24, 10, 4);
    g.fill();
    g.stroke();
    g.fillStyle = '#d6f5f1';
    for (const [x, y, r] of [[22, 10, 4], [34, 6, 3], [42, 12, 3]] as const) {
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  });
}

export function mushroomTexture() {
  return sprite(64, 64, (g) => {
    g.fillStyle = '#5a4030';
    g.beginPath();
    g.roundRect(4, 46, 56, 16, 5);
    g.fill();
    g.stroke();
    for (const [x, h, r, col] of [[16, 22, 11, '#b8a1d9'], [36, 30, 14, '#9b83c4'], [52, 18, 8, '#c9b5e6']] as const) {
      g.fillStyle = '#e8dccb';
      g.fillRect(x - 3, 48 - h, 6, h);
      g.strokeRect(x - 3, 48 - h, 6, h);
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x, 48 - h, r, r * 0.6, 0, Math.PI, 0);
      g.closePath();
      g.fill();
      g.stroke();
    }
  });
}

/** Ring of stones and crossed logs under the flame. */
export function hearthTexture() {
  return sprite(96, 64, (g) => {
    g.fillStyle = '#4a3020';
    g.save();
    g.translate(48, 44);
    for (const a of [-0.35, 0.35]) {
      g.save();
      g.rotate(a);
      g.beginPath();
      g.roundRect(-28, -5, 56, 10, 5);
      g.fill();
      g.stroke();
      g.restore();
    }
    g.restore();
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? '#6f6861' : '#57524d';
      g.beginPath();
      g.ellipse(10 + i * 15.2, 54, 9, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
    }
  });
}

/** Pickaxe icon for dig orders. */
export function digIconTexture() {
  return sprite(64, 64, (g) => {
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(18, 50);
    g.lineTo(42, 18);
    g.stroke();
    g.strokeStyle = '#b07a46';
    g.lineWidth = 5;
    g.stroke();
    g.strokeStyle = INK;
    g.lineWidth = 9;
    g.beginPath();
    g.arc(42, 30, 20, -2.4, -0.5);
    g.stroke();
    g.strokeStyle = '#d9d4cc';
    g.lineWidth = 5;
    g.stroke();
  });
}
