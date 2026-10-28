import * as THREE from 'three';

// Placeholder hand-drawn-style colonist sprite, drawn on a canvas so the
// scaffold needs no art files. Swap for real sprite sheets later.
export function colonistTexture(tint: string): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 128;
  const g = c.getContext('2d')!;
  g.lineWidth = 4;
  g.strokeStyle = '#1a120c';
  g.lineJoin = 'round';

  // Body
  g.fillStyle = tint;
  g.beginPath();
  g.moveTo(14, 118);
  g.quadraticCurveTo(10, 70, 32, 62);
  g.quadraticCurveTo(54, 70, 50, 118);
  g.closePath();
  g.fill();
  g.stroke();

  // Head
  g.fillStyle = '#e9d6b8';
  g.beginPath();
  g.ellipse(32, 38, 20, 24, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();

  // Eyes
  g.fillStyle = '#1a120c';
  g.beginPath();
  g.arc(25, 38, 3, 0, Math.PI * 2);
  g.arc(39, 38, 3, 0, Math.PI * 2);
  g.fill();

  // Scraggly hair
  g.beginPath();
  for (let i = 0; i < 7; i++) {
    g.moveTo(16 + i * 5, 20);
    g.lineTo(13 + i * 6, 6 + (i % 2) * 4);
  }
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
