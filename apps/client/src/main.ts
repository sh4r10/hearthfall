import { WorldView, type Overlay } from './world-view';
import { COLONIST_STRIDE, DAY_TICKS, type FromWorker, type Tool, type ToWorker } from './protocol';
import SimWorker from './sim.worker.ts?worker&inline';

const TICKS_PER_SECOND = 10;
const MAP_WIDTH = 160;
const MAP_HEIGHT = 110;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const stats = document.getElementById('stats')!;
const banner = document.getElementById('banner')!;
const world = new WorldView(canvas);
const worker = new SimWorker();
(window as unknown as { hearthfall: unknown }).hearthfall = world; // handy for debugging in the console
worker.onerror = (e) => console.error('sim worker failed:', e.message);
const send = (msg: ToWorker) => worker.postMessage(msg);

let tool: Tool = 'dig';

worker.onmessage = (event: MessageEvent<FromWorker>) => {
  const frame = event.data;
  world.applyFrame(frame, TICKS_PER_SECOND);
  const total = frame.colonists.length / COLONIST_STRIDE;
  let alive = 0, coldest = 100;
  for (let i = 0; i < total; i++) {
    const o = i * COLONIST_STRIDE;
    if (frame.colonists[o + 2] > 0 && frame.colonists[o + 3] > 0) {
      alive++;
      coldest = Math.min(coldest, frame.colonists[o + 3]);
    }
  }
  const day = Math.floor(frame.tick / DAY_TICKS) + 1;
  const into = frame.tick % DAY_TICKS;
  const nightAt = (DAY_TICKS * 6) / 10;
  const untilChange = Math.ceil(((frame.night ? DAY_TICKS : nightAt) - into) / TICKS_PER_SECOND);
  stats.innerHTML =
    `<div><span>Day</span><b>${day}</b></div>` +
    `<div><span>${frame.night ? 'Dawn in' : 'Night in'}</span><b>${untilChange}s</b></div>` +
    `<div><span>Fuel</span><b class="${frame.fuel < 15 ? 'warn' : ''}">${frame.fuel}</b></div>` +
    `<div><span>Survivors</span><b>${alive}/${total}</b></div>` +
    `<div><span>Coldest</span><b class="${coldest < 40 ? 'warn' : ''}">${alive ? coldest + '%' : '-'}</b></div>`;
  banner.hidden = alive > 0;
  document.body.classList.toggle('night', frame.night);
};

const seed = Number(new URLSearchParams(location.search).get('seed') ?? Date.now() % 1_000_000);
send({ type: 'init', seed, width: MAP_WIDTH, height: MAP_HEIGHT, ticksPerSecond: TICKS_PER_SECOND });

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
  const tools: Record<string, Tool> = { '1': 'dig', '2': 'ladder', '3': 'hearth', '4': 'diffuser' };
  if (tools[key]) setTool(tools[key]);
  const overlays: Record<string, Overlay> = { o: 'oxygen', c: 'co2', t: 'temperature', escape: 'none' };
  if (overlays[key]) setOverlay(world.overlay === overlays[key] ? 'none' : overlays[key]);
});

// Drag pans, wheel zooms, a click without movement uses the tool.
let drag: { x: number; y: number; vx: number; vy: number; moved: boolean } | undefined;
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, vx: world.view.x, vy: world.view.y, moved: false };
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  const unitsPerPixel = (2 * world.view.dist * Math.tan((world.camera.fov * Math.PI) / 360)) / window.innerHeight;
  world.view.x = drag.vx - dx * unitsPerPixel;
  world.view.y = drag.vy + dy * unitsPerPixel;
});
canvas.addEventListener('pointerup', (e) => {
  if (drag && !drag.moved) {
    const cell = world.pickCell(e.clientX, e.clientY);
    if (cell) send({ type: 'command', tool, x: cell[0], y: cell[1] });
  }
  drag = undefined;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  world.view.dist = Math.min(90, Math.max(10, world.view.dist * Math.exp(e.deltaY * 0.001)));
}, { passive: false });

function loop() {
  world.render();
  requestAnimationFrame(loop);
}
loop();
