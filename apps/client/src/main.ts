import { WorldRenderer, type Overlay } from './renderer';
import type { FromWorker, ToWorker } from './protocol';

const TICKS_PER_SECOND = 10;
const MAP_SIZE = 160;

type Tool = 'dig' | 'diffuser';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const stats = document.getElementById('stats')!;
const world = new WorldRenderer(canvas);
const worker = new Worker(new URL('./sim.worker.ts', import.meta.url), { type: 'module' });
const send = (msg: ToWorker) => worker.postMessage(msg);

let tool: Tool = 'dig';

worker.onmessage = (event: MessageEvent<FromWorker>) => {
  const frame = event.data;
  world.applyFrame(frame, TICKS_PER_SECOND);
  let alive = 0;
  for (let i = 2; i < frame.colonists.length; i += 3) if (frame.colonists[i] > 0) alive++;
  const seconds = Math.floor(frame.tick / TICKS_PER_SECOND);
  stats.textContent =
    `Colonists alive: ${alive}/${frame.colonists.length / 3}\n` +
    `Survived: ${Math.floor(seconds / 60)}m ${seconds % 60}s\n` +
    `State hash: ${frame.hash.padStart(16, '0')}` +
    (alive === 0 ? '\nThe colony has fallen.' : '');
};

const seed = Number(new URLSearchParams(location.search).get('seed') ?? Date.now() % 1_000_000);
send({ type: 'init', seed, width: MAP_SIZE, height: MAP_SIZE, ticksPerSecond: TICKS_PER_SECOND });

function selectButton(attr: string, value: string) {
  document.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((b) => b.classList.toggle('active', b.getAttribute(attr) === value));
}

function setTool(t: Tool) {
  tool = t;
  selectButton('data-tool', t);
}

function setOverlay(o: Overlay) {
  world.setOverlay(o);
  selectButton('data-overlay', o);
}

document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => (b.onclick = () => setTool(b.dataset.tool as Tool)));
document.querySelectorAll<HTMLButtonElement>('[data-overlay]').forEach((b) => (b.onclick = () => setOverlay(b.dataset.overlay as Overlay)));

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === '1') setTool('dig');
  if (key === '2') setTool('diffuser');
  const overlays: Record<string, Overlay> = { o: 'oxygen', c: 'co2', t: 'temperature', escape: 'none' };
  if (overlays[key]) setOverlay(world.overlay === overlays[key] ? 'none' : overlays[key]);
});

// Treat a short press without movement as a click, so dragging pans the camera.
let down: { x: number; y: number } | undefined;
canvas.addEventListener('pointerdown', (e) => (down = e.button === 0 ? { x: e.clientX, y: e.clientY } : undefined));
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return;
  const cell = world.pickCell(e.clientX, e.clientY);
  if (cell) send({ type: 'command', kind: tool, x: cell[0], y: cell[1] });
});

function loop() {
  world.render();
  requestAnimationFrame(loop);
}
loop();
