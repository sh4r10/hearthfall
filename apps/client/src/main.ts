import { WorldView, type Overlay } from './world-view';
import {
  ACTIVITIES, CAUSES, COLONIST_STRIDE, DAY_TICKS, EVENT_DEATH, EVENT_STRIDE, HEARTH_COST, JOB_NAMES, ROLES, STAT_MAX, type Frame, type FromWorker, type Tool, type ToWorker,
} from './protocol';
import { artUrl } from './art';
import { icon } from './icons';
import SimWorker from './sim.worker.ts?worker&inline';

const TICKS_PER_SECOND = 10;
const MAP_WIDTH = 160;
const MAP_HEIGHT = 110;
const NAMES = ['Mara', 'Tobin', 'Esk', 'Juno', 'Bram', 'Ilse', 'Corin', 'Wren'];
const NEEDS: [label: string, offset: number, icon: string][] = [
  ['Warmth', 5, 'warmth'], ['Breath', 4, 'breath'], ['Energy', 6, 'energy'], ['Food', 7, 'food'], ['Mood', 8, 'mood'], ['Sleep', 9, 'sleep'],
];
const NIGHT_AT = (DAY_TICKS * 6) / 10;

interface ToolInfo { tool: Tool; key: string; label: string; icon: string; tip: string; cost?: number }
const TOOLS: ToolInfo[] = [
  { tool: 'dig', key: '1', label: 'Dig', icon: 'dig', tip: 'Mark rock, dirt or coal to be dug out. Coal goes to the stockpile.' },
  { tool: 'ladder', key: '2', label: 'Ladder', icon: 'ladder', tip: 'Lets survivors climb. Build them up walls and shafts.' },
  { tool: 'hearth', key: '3', label: 'Hearth', icon: 'hearth', tip: 'A new fire: light, warmth and safety. Burns coal and air.', cost: HEARTH_COST },
  { tool: 'mushroom', key: '4', label: 'Mushrooms', icon: 'mushroom', tip: 'Grows food, but only in the dark, away from the fire.' },
  { tool: 'diffuser', key: '5', label: 'Oxygen', icon: 'diffuser', tip: 'Puts fresh air back into a room the fire is choking.' },
  { tool: 'cancel', key: 'X', label: 'Cancel', icon: 'cancel', tip: 'Remove orders you have marked.' },
];
const OVERLAYS: { overlay: Overlay; key: string; label: string; icon: string; tip: string }[] = [
  { overlay: 'none', key: 'Esc', label: 'View', icon: 'view', tip: 'The plain view of the caves.' },
  { overlay: 'oxygen', key: 'O', label: 'Air', icon: 'oxygen', tip: 'Where the breathable air is.' },
  { overlay: 'co2', key: 'C', label: 'Smoke', icon: 'co2', tip: 'Carbon dioxide from the fire. It sinks and pools.' },
  { overlay: 'temperature', key: 'T', label: 'Heat', icon: 'heat', tip: 'Warm and cold areas.' },
];
const HINTS: Record<Tool, string> = {
  dig: '<b>Dig:</b> click rock to mark it, or shift-drag across many cells. Look for the black coal seams.',
  ladder: '<b>Ladder:</b> click open cells to build a ladder survivors can climb.',
  hearth: `<b>Hearth:</b> costs ${HEARTH_COST} coal. Light up a new part of the caves.`,
  mushroom: '<b>Mushrooms:</b> place a bed outside the light. It grows food only in the dark.',
  diffuser: '<b>Oxygen:</b> place in a room with stale air.',
  cancel: '<b>Cancel:</b> click or drag over orders to remove them.',
};

const $ = (id: string) => document.getElementById(id)!;
const canvas = $('game') as HTMLCanvasElement;
const stats = $('stats');
const clock = $('clock');
const roster = $('roster');
const hint = $('hint');
const tooltip = $('tooltip');
const world = new WorldView(canvas);
(window as unknown as { hearthfall: unknown }).hearthfall = world; // handy for debugging in the console
let worker: Worker | undefined;
const send = (msg: ToWorker) => worker?.postMessage(msg);

let tool: Tool = 'dig';

// --- Title screen ------------------------------------------------------------

const story = artUrl('story-1');
if (story) (document.querySelector('.title-art') as HTMLElement).style.backgroundImage = `url(${story})`;
$('how').onclick = () => {
  const list = $('howto');
  list.hidden = !list.hidden;
  $('how').setAttribute('aria-expanded', String(!list.hidden));
};

function start() {
  const title = $('title');
  title.classList.add('leaving');
  setTimeout(() => (title.hidden = true), 900);
  for (const id of ['top', 'roster', 'toolbar', 'hint', 'log']) $(id).hidden = false;
  worker = new SimWorker();
  worker.onerror = (e) => console.error('sim worker failed:', e.message);
  worker.onmessage = onFrame;
  const seed = Number(new URLSearchParams(location.search).get('seed') ?? Date.now() % 1_000_000);
  send({ type: 'init', seed, width: MAP_WIDTH, height: MAP_HEIGHT, ticksPerSecond: TICKS_PER_SECOND });
}
$('play').onclick = start;
$('again').onclick = () => location.reload();
if (new URLSearchParams(location.search).has('play')) start();

// --- HUD -----------------------------------------------------------------------

function stat(name: string, label: string, value: string | number, warn = false) {
  return `<div class="stat${warn ? ' warn' : ''}">${icon(name, 20)}<div><span>${label}</span><b>${value}</b></div></div>`;
}

function needBar(label: string, value: number, name: string) {
  const pct = Math.round((value / STAT_MAX) * 100);
  const level = pct < 25 ? 'bad' : pct < 50 ? 'low' : '';
  return `<div class="need ${level}" title="${label}: ${pct}%">${icon(name, 14)}<i><b style="width:${pct}%"></b></i></div>`;
}

function renderRoster(frame: Frame) {
  const count = frame.colonists.length / COLONIST_STRIDE;
  if (roster.childElementCount !== count) {
    roster.innerHTML = Array.from({ length: count }, (_, i) => {
      const portrait = artUrl(`survivor-${i % 2}-front`);
      return `
      <article class="survivor" data-i="${i}">
        <header>
          <div class="portrait" style="${portrait ? `background-image:url(${portrait})` : ''}"></div>
          <div class="who">
            <h3>${NAMES[i % NAMES.length]}</h3>
            <select id="role-${i}" aria-label="Role for ${NAMES[i % NAMES.length]}">
              ${ROLES.map((r, k) => `<option value="${k}">${r}</option>`).join('')}
            </select>
          </div>
        </header>
        <p class="doing"></p>
        <div class="needs"></div>
      </article>`;
    }).join('');
    roster.querySelectorAll('select').forEach((sel, i) =>
      sel.addEventListener('change', () => send({ type: 'role', colonist: i, role: Number(sel.value) })));
  }
  roster.querySelectorAll<HTMLElement>('.survivor').forEach((card, i) => {
    const c = frame.colonists.subarray(i * COLONIST_STRIDE, (i + 1) * COLONIST_STRIDE);
    const activity = ACTIVITIES[c[3]];
    const sel = card.querySelector('select')!;
    if (document.activeElement !== sel) sel.value = String(c[2]);
    const dead = activity === 'Dead';
    card.classList.toggle('dead', dead);
    card.classList.toggle('struggling', !dead && NEEDS.some(([, o]) => c[o] < STAT_MAX / 4));
    const job = c[12] >= 0 ? JOB_NAMES[c[12]] : '';
    card.querySelector('.doing')!.textContent =
      dead ? (c[5] <= 0 ? 'Froze to death' : 'Suffocated')
      : activity === 'Walking' && job ? `Heading off ${job}`
      : activity === 'Working' && job ? `${job[0].toUpperCase()}${job.slice(1)}`
      : activity === 'Sleeping' ? 'Asleep'
      : activity === 'Idle' ? 'Warming up by the fire'
      : activity;
    card.querySelector('.needs')!.innerHTML = NEEDS.map(([label, o, name]) => needBar(label, c[o], name)).join('');
  });
}

// --- Event log -----------------------------------------------------------------

const log = $('log');
let lastEventTick = -1;
/** Announces new sim events (deaths so far) in the log; each line fades after a while. */
function announce(frame: Frame) {
  for (let i = 0; i < frame.events.length; i += EVENT_STRIDE) {
    const [tick, kind, who] = [frame.events[i], frame.events[i + 1], frame.events[i + 2]];
    if (tick <= lastEventTick) continue;
    lastEventTick = tick;
    if (kind !== EVENT_DEATH) continue;
    const cause = CAUSES[frame.colonists[who * COLONIST_STRIDE + 13]] ?? 'died';
    const line = document.createElement('li');
    line.className = 'panel';
    line.innerHTML = `${icon('skull', 16)}<span><b>${NAMES[who % NAMES.length]}</b> ${cause} on day ${Math.floor(tick / DAY_TICKS) + 1}.</span>`;
    log.prepend(line);
    setTimeout(() => line.classList.add('fade'), 8000);
    setTimeout(() => line.remove(), 9000);
  }
}

function onFrame(event: MessageEvent<FromWorker>) {
  const frame = event.data;
  world.applyFrame(frame, TICKS_PER_SECOND);
  announce(frame);
  const total = frame.colonists.length / COLONIST_STRIDE;
  let alive = 0;
  for (let i = 0; i < total; i++) if (frame.colonists[i * COLONIST_STRIDE + 3] !== 5) alive++;
  const day = Math.floor(frame.tick / DAY_TICKS) + 1;
  const into = frame.tick % DAY_TICKS;
  const untilChange = Math.ceil(((frame.night ? DAY_TICKS : NIGHT_AT) - into) / TICKS_PER_SECOND);

  (clock.querySelector('.dial i') as HTMLElement).style.transform = `rotate(${(into / DAY_TICKS) * 360 + 180}deg)`;
  clock.querySelector('.clock-text')!.innerHTML =
    `<b>Day ${day}</b><span>${icon(frame.night ? 'moon' : 'sun', 12)}${frame.night ? 'Dawn' : 'Night'} in ${untilChange}s</span>`;
  stats.innerHTML =
    stat('coal', 'Coal', frame.coal, frame.coal < HEARTH_COST) +
    stat('food', 'Food', frame.food, frame.food < 5) +
    stat('people', 'Survivors', `${alive}/${total}`, alive < total);
  renderRoster(frame);
  document.body.classList.toggle('night', frame.night);
  const over = $('gameover');
  if (alive === 0 && over.hidden) {
    over.hidden = false;
    over.querySelector('.summary')!.textContent = `Your colony lasted ${day} day${day === 1 ? '' : 's'}.`;
  }
}

// --- Tools ---------------------------------------------------------------------

$('tools').innerHTML = TOOLS.map((t) =>
  `<button class="tool" data-tool="${t.tool}" data-tip="<b>${t.label}</b>${t.tip}">
    <kbd>${t.key}</kbd>${t.cost ? `<span class="cost" title="Costs ${t.cost} coal">${icon('coal', 10)}${t.cost}</span>` : ''}${icon(t.icon, 22)}<span class="label">${t.label}</span></button>`).join('');
$('overlays').innerHTML = OVERLAYS.map((o) =>
  `<button class="tool" data-overlay="${o.overlay}" data-tip="<b>${o.label}</b>${o.tip}">
    <kbd>${o.key}</kbd>${icon(o.icon, 22)}<span class="label">${o.label}</span></button>`).join('');

document.querySelectorAll<HTMLElement>('[data-tip]').forEach((el) => {
  el.addEventListener('pointerenter', () => {
    tooltip.innerHTML = el.dataset.tip!;
    tooltip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8)}px`;
    tooltip.style.top = `${r.top - t.height - 10}px`;
  });
  el.addEventListener('pointerleave', () => (tooltip.hidden = true));
});

function selectButton(attr: string, value: string) {
  document.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((b) => b.classList.toggle('active', b.getAttribute(attr) === value));
}
function setTool(t: Tool) {
  tool = t;
  selectButton('data-tool', t);
  hint.innerHTML = `${icon(TOOLS.find((x) => x.tool === t)!.icon, 18)}<div>${HINTS[t]}<br>Drag to look around, scroll to zoom.</div>`;
}
function setOverlay(o: Overlay) {
  world.setOverlay(o);
  selectButton('data-overlay', o);
}
setTool('dig');
setOverlay('none');

document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => (b.onclick = () => setTool(b.dataset.tool as Tool)));
document.querySelectorAll<HTMLButtonElement>('[data-overlay]').forEach((b) => (b.onclick = () => setOverlay(b.dataset.overlay as Overlay)));

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLSelectElement || !worker) return;
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
  world.view.span = Math.min(110, Math.max(8, world.view.span * Math.exp(e.deltaY * 0.001)));
}, { passive: false });

function loop() {
  world.render();
  requestAnimationFrame(loop);
}
loop();
