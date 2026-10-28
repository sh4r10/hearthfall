import { WorldView, type Overlay } from './world-view';
import {
  ACTIVITIES, COLONIST_STRIDE, DAY_TICKS, HEARTH_COST, JOB_NAMES, ROLES, STAT_MAX, type Frame, type FromWorker, type Tool, type ToWorker,
} from './protocol';
import SimWorker from './sim.worker.ts?worker&inline';

const TICKS_PER_SECOND = 10;
const MAP_WIDTH = 160;
const MAP_HEIGHT = 110;
const NAMES = ['Mara', 'Tobin', 'Esk', 'Juno', 'Bram', 'Ilse', 'Corin', 'Wren'];
const NEEDS: [label: string, offset: number][] = [
  ['Warmth', 5], ['Breath', 4], ['Energy', 6], ['Food', 7], ['Mood', 8], ['Sleep', 9],
];

const canvas = document.getElementById('game') as HTMLCanvasElement;
const stats = document.getElementById('stats')!;
const banner = document.getElementById('banner')!;
const roster = document.getElementById('roster')!;
const world = new WorldView(canvas);
const worker = new SimWorker();
(window as unknown as { hearthfall: unknown }).hearthfall = world; // handy for debugging in the console
worker.onerror = (e) => console.error('sim worker failed:', e.message);
const send = (msg: ToWorker) => worker.postMessage(msg);

let tool: Tool = 'dig';

function needBar(label: string, value: number) {
  const pct = Math.round((value / STAT_MAX) * 100);
  const level = pct < 25 ? 'bad' : pct < 50 ? 'low' : '';
  return `<div class="need ${level}"><span>${label}</span><i><b style="width:${pct}%"></b></i></div>`;
}

function renderRoster(frame: Frame) {
  const count = frame.colonists.length / COLONIST_STRIDE;
  if (roster.childElementCount !== count) {
    roster.innerHTML = Array.from({ length: count }, (_, i) => `
      <article class="survivor" data-i="${i}">
        <header>
          <h3>${NAMES[i % NAMES.length]}</h3>
          <select id="role-${i}" aria-label="Role for ${NAMES[i % NAMES.length]}">
            ${ROLES.map((r, k) => `<option value="${k}">${r}</option>`).join('')}
          </select>
        </header>
        <p class="doing"></p>
        <div class="needs"></div>
      </article>`).join('');
    roster.querySelectorAll('select').forEach((sel, i) =>
      sel.addEventListener('change', () => send({ type: 'role', colonist: i, role: Number(sel.value) })));
  }
  roster.querySelectorAll<HTMLElement>('.survivor').forEach((card, i) => {
    const c = frame.colonists.subarray(i * COLONIST_STRIDE, (i + 1) * COLONIST_STRIDE);
    const activity = ACTIVITIES[c[3]];
    const sel = card.querySelector('select')!;
    if (document.activeElement !== sel) sel.value = String(c[2]);
    card.classList.toggle('dead', activity === 'Dead');
    const job = c[12] >= 0 ? JOB_NAMES[c[12]] : '';
    card.querySelector('.doing')!.textContent =
      activity === 'Dead' ? (c[5] <= 0 ? 'Froze to death' : 'Suffocated')
      : activity === 'Walking' && job ? `Heading off ${job}`
      : activity === 'Working' && job ? `${job[0].toUpperCase()}${job.slice(1)}`
      : activity;
    card.querySelector('.needs')!.innerHTML = NEEDS.map(([label, o]) => needBar(label, c[o])).join('');
  });
}

worker.onmessage = (event: MessageEvent<FromWorker>) => {
  const frame = event.data;
  world.applyFrame(frame, TICKS_PER_SECOND);
  const total = frame.colonists.length / COLONIST_STRIDE;
  let alive = 0;
  for (let i = 0; i < total; i++) if (frame.colonists[i * COLONIST_STRIDE + 3] !== 5) alive++;
  const day = Math.floor(frame.tick / DAY_TICKS) + 1;
  const into = frame.tick % DAY_TICKS;
  const nightAt = (DAY_TICKS * 6) / 10;
  const untilChange = Math.ceil(((frame.night ? DAY_TICKS : nightAt) - into) / TICKS_PER_SECOND);
  stats.innerHTML =
    `<div><span>Day</span><b>${day}</b></div>` +
    `<div><span>${frame.night ? 'Dawn in' : 'Night in'}</span><b>${untilChange}s</b></div>` +
    `<div><span>Coal</span><b class="${frame.coal < HEARTH_COST ? 'warn' : ''}">${frame.coal}</b></div>` +
    `<div><span>Food</span><b class="${frame.food < 5 ? 'warn' : ''}">${frame.food}</b></div>` +
    `<div><span>Survivors</span><b>${alive}/${total}</b></div>`;
  renderRoster(frame);
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
  if (e.target instanceof HTMLSelectElement) return;
  const key = e.key.toLowerCase();
  const tools: Record<string, Tool> = { '1': 'dig', '2': 'ladder', '3': 'hearth', '4': 'mushroom', '5': 'diffuser', x: 'cancel' };
  if (tools[key]) setTool(tools[key]);
  const overlays: Record<string, Overlay> = { o: 'oxygen', c: 'co2', t: 'temperature', escape: 'none' };
  if (overlays[key]) setOverlay(world.overlay === overlays[key] ? 'none' : overlays[key]);
});

// Drag pans, wheel zooms. A click (or a drag with shift held) places orders.
let drag: { x: number; y: number; vx: number; vy: number; moved: boolean; paint: boolean } | undefined;
const order = (e: PointerEvent) => {
  const cell = world.pickCell(e.clientX, e.clientY);
  if (cell) send({ type: 'command', tool, x: cell[0], y: cell[1] });
};
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, vx: world.view.x, vy: world.view.y, moved: false, paint: e.shiftKey };
  if (drag.paint) order(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  if (drag.paint) return order(e);
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  const u = world.unitsPerPixel();
  world.view.x = drag.vx - dx * u;
  world.view.y = drag.vy + dy * u;
});
canvas.addEventListener('pointerup', (e) => {
  if (drag && !drag.moved && !drag.paint) order(e);
  drag = undefined;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  world.view.span = Math.min(110, Math.max(10, world.view.span * Math.exp(e.deltaY * 0.001)));
}, { passive: false });

function loop() {
  world.render();
  requestAnimationFrame(loop);
}
loop();
