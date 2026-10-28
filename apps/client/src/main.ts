import { WorldView, type Overlay } from './world-view';
import {
  ACTIVITIES, heldUpBy, BUILD_COST, Building, CAUSES, COLONIST_STRIDE, DAY_TICKS, Element, EVENT_ARRIVAL, EVENT_COLLAPSE, EVENT_DEATH, EVENT_SHADE_ATTACK, EVENT_STRIDE, JOB_REFUEL, JOB_STRIDE, HEARTH_COST, JOB_NAMES, ROLES, STAT_MAX, type Frame, type FromWorker, type Tool, type ToWorker,
} from './protocol';
import { artUrl } from './art';
import { icon } from './icons';
import { MAP_VIEWS, MapViews } from './map-views';
import { PriorityBrush, SpeedControl, StuckOrders } from './management';
import { Inspector, NEEDS, doing, needBar } from './inspect';
import SimWorker from './sim.worker.ts?worker&inline';

const TICKS_PER_SECOND = 10;
const MAP_WIDTH = 160;
const MAP_HEIGHT = 110;
const NAMES = ['Esk', 'Mara', 'Tobin', 'Ostra', 'Pim', 'Ruta', 'Juno', 'Wren']; // the cast in the art brief, in art order
const NIGHT_AT = (DAY_TICKS * 6) / 10;

interface ToolInfo { tool: Tool; key: string; label: string; icon: string; tip: string; building?: number }
const TOOLS: ToolInfo[] = [
  { tool: 'dig', key: '1', label: 'Dig', icon: 'dig', tip: 'Mark rock, dirt or coal to be dug out. Coal goes to the stockpile.' },
  { tool: 'ladder', key: '2', label: 'Ladder', icon: 'ladder', tip: 'Lets survivors climb. Build them up walls and shafts.', building: Building.Ladder },
  { tool: 'hearth', key: '3', label: 'Hearth', icon: 'hearth', tip: 'A new fire: light, warmth and safety. Burns coal.', building: Building.Hearth },
  { tool: 'mushroom', key: '4', label: 'Mushrooms', icon: 'mushroom', tip: 'Grows food away from the fire. Lamp light is fine, so light the farm to keep Shades out.', building: Building.MushroomBed },
  { tool: 'lamp', key: '6', label: 'Lamp', icon: 'lamp', tip: 'A small light that keeps Shades away. No warmth, so survivors still cool down slowly.', building: Building.Lamp },
  { tool: 'bed', key: '7', label: 'Bed', icon: 'bed', tip: 'Survivors sleep better in a bed, best if it is lit.', building: Building.Bed },
  { tool: 'priority', key: 'P', label: 'Priority', icon: 'priority', tip: 'Repaint how urgent orders are, from 1 to 9. Survivors take the most urgent order they can reach first.' },
  { tool: 'deconstruct', key: 'D', label: 'Remove', icon: 'deconstruct', tip: 'Have a building taken down. Survivors salvage half of what it cost, and a hearth gives back its fuel.' },
  { tool: 'cancel', key: 'X', label: 'Cancel', icon: 'cancel', tip: 'Take back orders you have marked. Right-click does this with any tool.' },
];
const HINTS: Record<Tool, string> = {
  dig: '<b>Dig:</b> click rock to mark it, or shift-drag a box over many cells. Black seams give coal, grey rock gives 3 stone and dirt 1. A building\'s floor can\'t be dug: remove the building first.',
  ladder: '<b>Ladder:</b> click open cells to build a ladder survivors can climb.',
  hearth: '<b>Hearth:</b> light up a new part of the caves.',
  mushroom: '<b>Mushrooms:</b> place a bed out of the firelight. Lamps don\'t bother it, and keep Shades off the farm.',
  lamp: '<b>Lamp:</b> light a tunnel so Shades keep out of it.',
  bed: '<b>Bed:</b> place inside the light. Rested survivors work faster.',
  deconstruct: '<b>Remove:</b> click a building, or shift-drag a box over several. A survivor takes each down and salvages half its cost.',
  priority: '<b>Priority:</b> pick a level with 1 to 9, then click orders or shift-drag a box over them. 9 is dropped-everything urgent, 1 is whenever. New orders start at 5.',
  cancel: '<b>Cancel:</b> click an order, or shift-drag a box over many. Right-click or right-drag cancels with any tool.',
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
const speed = new SpeedControl(send);
const brush = new PriorityBrush();
const inspector = new Inspector(NAMES, TICKS_PER_SECOND, send, () => { world.select(); hint.hidden = false; });
function inspect(x: number, y: number) {
  if (!last) return;
  inspector.open(x, y, last);
  world.select([x, y]);
  hint.hidden = true;
}
const stuck = new StuckOrders(world, inspect);

// --- Title screen ------------------------------------------------------------

/**
 * Set maps are fixed seeds: the generator is deterministic, so a seed is a
 * map, and these are ones worth coming back to. "Random" rolls a new seed
 * each run; `?seed=N` plays any seed and is shown at game over for sharing.
 */
const MAPS: { name: string; seed?: number }[] = [
  { name: 'Hearth Hollow', seed: 7 },
  { name: 'The Long Gallery', seed: 1234 },
  { name: 'Frostbite', seed: 99_999 },
  { name: 'Random seed' },
];
const mapPick = $('map') as HTMLSelectElement;
mapPick.innerHTML = MAPS.map((m, i) => `<option value="${i}">${m.name}</option>`).join('');
let seed = 0;

// The title scene, with the painted wordmark in place of the plain heading.
const story = artUrl('story-title');
if (story) (document.querySelector('.title-art') as HTMLElement).style.backgroundImage = `url(${story})`;
const wordmark = artUrl('wordmark');
if (wordmark) document.querySelector('#title h1')!.innerHTML = `<img class="wordmark" src="${wordmark}" alt="Hearthfall">`;
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
  const param = new URLSearchParams(location.search).get('seed');
  seed = param !== null ? Number(param) : MAPS[Number(mapPick.value)].seed ?? Date.now() % 1_000_000;
  send({ type: 'init', seed, width: MAP_WIDTH, height: MAP_HEIGHT, ticksPerSecond: TICKS_PER_SECOND });
}
$('play').onclick = start;
$('again').onclick = () => location.reload();
if (new URLSearchParams(location.search).has('play')) start();

// --- HUD -----------------------------------------------------------------------

function stat(name: string, label: string, value: string | number, warn = false) {
  return `<div class="stat${warn ? ' warn' : ''}">${icon(name, 20)}<div><span>${label}</span><b>${value}</b></div></div>`;
}

function renderRoster(frame: Frame) {
  const count = frame.colonists.length / COLONIST_STRIDE;
  if (roster.childElementCount !== count) {
    roster.innerHTML = Array.from({ length: count }, (_, i) => {
      const portrait = artUrl(`survivor-${i % 2}-portrait`);
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
    card.querySelector('.doing')!.textContent = doing(c);
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
    const name = NAMES[who % NAMES.length];
    let text: string, glyph: string;
    if (kind === EVENT_DEATH) {
      text = `<b>${name}</b> ${CAUSES[frame.colonists[who * COLONIST_STRIDE + 12]] ?? 'died'} on day ${Math.floor(tick / DAY_TICKS) + 1}.`;
      glyph = 'skull';
    } else if (kind === EVENT_SHADE_ATTACK) {
      text = `A Shade has <b>${name}</b>! Get them into the light.`;
      glyph = 'shade';
    } else if (kind === EVENT_ARRIVAL) {
      logLine(`<b>${name}</b> followed the firelight down to you.`, 'people', 'info');
      continue;
    } else if (kind === EVENT_COLLAPSE) {
      logLine(`A <b>${BUILDING_NAMES[who] ?? 'building'}</b> lost its floor and fell. What could be salvaged is back in the stockpile.`, 'deconstruct', 'warn');
      continue;
    } else continue;
    logLine(text, glyph);
  }
}

function logLine(html: string, glyph: string, tone: 'danger' | 'warn' | 'info' = 'danger') {
  const line = document.createElement('li');
  line.className = `panel ${tone}`;
  line.innerHTML = `${icon(glyph, 16)}<span>${html}</span>`;
  log.prepend(line);
  const stay = tone === 'danger' ? 8000 : 12000;
  setTimeout(() => line.classList.add('fade'), stay);
  setTimeout(() => line.remove(), stay + 1000);
}

const views = new MapViews(NAMES, logLine);
const BUILDING_NAMES: Record<number, string> = {
  [Building.Ladder]: 'ladder', [Building.Hearth]: 'hearth',
  [Building.MushroomBed]: 'mushroom bed', [Building.Lamp]: 'lamp', [Building.Bed]: 'bed',
};

// --- First-night tutorial ------------------------------------------------------

/** Each step waits for the world to show it done, and lights up the button it needs. */
const TUTORIAL: { text: string; tool?: Tool; done: (f: Frame) => boolean }[] = [
  { text: 'Your fire is all that keeps the cold out, and it burns coal. <b>Mark a coal seam to dig</b>: pick Dig and click the black rock in the cave walls.', tool: 'dig',
    done: (f) => { for (let i = 0; i < f.jobs.length; i += JOB_STRIDE) if (f.jobs[i + 2] === 0) return true; return false; } },
  { text: 'Shades come out of the dark at night. <b>Build a lamp</b> in a tunnel to keep them out of it.', tool: 'lamp',
    done: (f) => f.buildings.includes(Building.Lamp) || hasBuildJob(f, Building.Lamp) },
  { text: 'Tired survivors work slowly, and refugees only join a colony with a spare bed. <b>Build a bed</b> inside the light.', tool: 'bed',
    done: (f) => f.buildings.includes(Building.Bed) || hasBuildJob(f, Building.Bed) },
  { text: 'Keep everyone in the light and the fire fed, and <b>get through the first night</b>.',
    done: (f) => f.tick >= DAY_TICKS },
];
function hasBuildJob(f: Frame, b: number) {
  for (let i = 0; i < f.jobs.length; i += JOB_STRIDE) if (f.jobs[i + 2] === 1 && f.jobs[i + 3] === b) return true;
  return false;
}
const tutorial = $('tutorial');
const TUTORIAL_KEY = 'hearthfall.tutorial';
let step = (() => { try { return localStorage.getItem(TUTORIAL_KEY) === 'done' ? TUTORIAL.length : 0; } catch { return 0; } })();
function endTutorial() {
  step = TUTORIAL.length;
  tutorial.hidden = true;
  document.querySelectorAll('.tool.pulse').forEach((b) => b.classList.remove('pulse'));
  try { localStorage.setItem(TUTORIAL_KEY, 'done'); } catch { /* private mode */ }
}
function showStep() {
  const s = TUTORIAL[step];
  document.querySelectorAll('.tool.pulse').forEach((b) => b.classList.remove('pulse'));
  if (s.tool) document.querySelector(`[data-tool="${s.tool}"]`)?.classList.add('pulse');
  tutorial.innerHTML = `<small>First night · ${step + 1} of ${TUTORIAL.length}</small><p>${s.text}</p><button class="quiet" id="skip-tutorial">Skip</button>`;
  tutorial.hidden = false;
  $('skip-tutorial').onclick = endTutorial;
}
function tutorialStep(frame: Frame) {
  if (step >= TUTORIAL.length) return;
  if (tutorial.hidden) showStep();
  if (!TUTORIAL[step].done(frame)) return;
  step++;
  if (step >= TUTORIAL.length) {
    tutorial.innerHTML = '<small>First night</small><p><b>You made it to dawn.</b> Keep a spare bed and food ready: from day 3, refugees follow the firelight down to you. The Deep Hearth is five layers below.</p>';
    setTimeout(endTutorial, 8000);
  } else showStep();
}

// --- Depth gauge ---------------------------------------------------------------

/** The five layers of the descent, from docs/design.md; each is a fifth of the rock below the start. */
const LAYERS = ['Frost Crust', 'Coal Seams', 'Flooded Galleries', 'The Old Mine', 'The Warm Deep'];
const depthBox = $('depth');
let deepest = 0;
/** Depth is the deepest cell any survivor has stood in, in cells below the start cave. */
function renderDepth(frame: Frame) {
  const startY = Math.floor(frame.height / 2);
  for (let i = 0; i < frame.colonists.length; i += COLONIST_STRIDE) {
    if (frame.colonists[i + 3] !== 5) deepest = Math.max(deepest, frame.colonists[i + 1] - startY);
  }
  const perLayer = (frame.height - startY - 2) / LAYERS.length;
  const layer = Math.min(Math.floor(deepest / perLayer), LAYERS.length - 1);
  const toNext = layer < LAYERS.length - 1 ? Math.ceil((layer + 1) * perLayer - deepest) : 0;
  depthBox.innerHTML =
    `${icon('depth', 16)}<div class="depth-text"><b>${deepest} m down</b><span>${LAYERS[layer]}${toNext ? ` · next layer in ${toNext}` : ' · the Deep Hearth is near'}</span></div>` +
    `<div class="layers">${LAYERS.map((_, k) => `<i class="${k < layer ? 'done' : k === layer ? 'now' : ''}"></i>`).join('')}</div>`;
}

let last: Frame | undefined;
function onFrame(event: MessageEvent<FromWorker>) {
  const frame = event.data;
  last = frame;
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
    stat('stone', 'Stone', frame.stone, frame.stone < 2) +
    stat('food', 'Food', frame.food, frame.food < 5) +
    stat('people', 'Survivors', `${alive}/${total}`, alive < total);
  renderRoster(frame);
  renderDepth(frame);
  tutorialStep(frame);
  stuck.update(frame);
  inspector.update(frame);
  world.timeScale = speed.speed;
  views.update(frame, world.overlay);
  document.body.classList.toggle('night', frame.night);
  const over = $('gameover');
  if (alive === 0 && over.hidden) {
    over.hidden = false;
    over.querySelector('.summary')!.textContent = `Your colony lasted ${day} day${day === 1 ? '' : 's'} on seed ${seed}.`;
  }
}

// --- Tools ---------------------------------------------------------------------

/** The coal and stone a building costs, as a small badge on its tool. */
function costBadge(building?: number) {
  const [coal, stone] = building !== undefined ? BUILD_COST[building] ?? [0, 0] : [0, 0];
  if (!coal && !stone) return '';
  const parts = [coal ? `${icon('coal', 10)}${coal}` : '', stone ? `${icon('stone', 10)}${stone}` : ''].filter(Boolean).join('');
  const words = [coal ? `${coal} coal` : '', stone ? `${stone} stone` : ''].filter(Boolean).join(' and ');
  return `<span class="cost" title="Costs ${words}">${parts}</span>`;
}

$('tools').innerHTML = TOOLS.map((t) =>
  `<button class="tool" data-tool="${t.tool}" data-tip="<b>${t.label}</b>${t.tip}">
    <kbd>${t.key}</kbd>${costBadge(t.building)}${icon(t.icon, 22)}<span class="label">${t.label}</span></button>`).join('');
$('overlays').innerHTML = MAP_VIEWS.map((o) =>
  `<button class="tool" data-overlay="${o.overlay}" data-tip="<b>${o.label}</b>${o.tip}"${views.isOpen(o.overlay) ? '' : ' hidden'}>
    <kbd>${o.key}</kbd>${icon(o.icon, 22)}<span class="label">${o.label}</span></button>`).join('');

document.querySelectorAll<HTMLElement>('[data-tip]').forEach((el) => {
  el.addEventListener('pointerenter', () => {
    if (!el.dataset.tip) return;
    tooltip.innerHTML = el.dataset.tip;
    tooltip.hidden = false;
    const r = el.getBoundingClientRect();
    const t = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8)}px`;
    // Above the button, or below it for the top bar.
    tooltip.style.top = `${r.top - t.height - 10 < 8 ? r.bottom + 10 : r.top - t.height - 10}px`;
  });
  el.addEventListener('pointerleave', () => (tooltip.hidden = true));
});

function selectButton(attr: string, value: string) {
  document.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((b) => b.classList.toggle('active', b.getAttribute(attr) === value));
}
function setTool(t: Tool) {
  tool = t;
  selectButton('data-tool', t);
  brush.shown(t === 'priority');
  world.setShowPriorities(t === 'priority');
  hint.innerHTML = `${icon(TOOLS.find((x) => x.tool === t)!.icon, 18)}<div>${HINTS[t]}<br>Drag to look around, scroll to zoom.</div>`;
}
function setOverlay(o: Overlay) {
  if (!views.isOpen(o)) return;
  world.setOverlay(o);
  selectButton('data-overlay', o);
  views.shown(o);
}
setTool('dig');
setOverlay('none');

document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => (b.onclick = () => setTool(b.dataset.tool as Tool)));
document.querySelectorAll<HTMLButtonElement>('[data-overlay]').forEach((b) =>
  (b.onclick = () => setOverlay(world.overlay === b.dataset.overlay ? 'none' : b.dataset.overlay as Overlay)));

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLSelectElement || !worker) return;
  if (speed.key(e)) return e.preventDefault();
  const key = e.key.toLowerCase();
  // With the Priority tool out, the number keys pick the level instead of a tool.
  if (tool === 'priority' && /^[1-9]$/.test(key)) return brush.set(Number(key));
  if (key === 'escape' && inspector.cell) return inspector.close();
  const tools: Record<string, Tool> = { '1': 'dig', '2': 'ladder', '3': 'hearth', '4': 'mushroom', '6': 'lamp', '7': 'bed', d: 'deconstruct', x: 'cancel', p: 'priority' };
  if (tools[key] && !document.querySelector<HTMLElement>(`[data-tool="${tools[key]}"]`)?.hidden) setTool(tools[key]);
  const overlays: Record<string, Overlay> = { w: 'warmth', escape: 'none' };
  if (overlays[key]) setOverlay(world.overlay === overlays[key] ? 'none' : overlays[key]);
});

// Drag pans, wheel zooms. A click places an order. Shift-drag paints build
// orders along the pointer, and draws a box for dig, remove and cancel.
// Right-click and right-drag cancel with any tool.
const BOX_TOOLS: Tool[] = ['dig', 'deconstruct', 'cancel', 'priority'];
const selectBox = $('select-box');
let drag: { x: number; y: number; vx: number; vy: number; moved: boolean; paint: boolean; box?: Tool } | undefined;
/** Place an order with `t` on a cell, or for Priority, repaint the order there. */
function orderAt(t: Tool, x: number, y: number) {
  if (t === 'priority') send({ type: 'priority', x, y, priority: brush.level });
  else send({ type: 'command', tool: t, x, y });
}
const order = (e: PointerEvent) => {
  const cell = world.pickCell(e.clientX, e.clientY);
  if (cell) orderAt(tool, cell[0], cell[1]);
};
/** A plain click: order if the tool does something there, else inspect what is there. */
function click(e: PointerEvent) {
  const cell = world.pickCell(e.clientX, e.clientY);
  if (!cell || !last) return;
  const [x, y] = cell;
  const i = y * last.width + x;
  const builds = TOOLS.find((t) => t.tool === tool)?.building !== undefined;
  // Clicking an order already there with a tool that would only repeat it shows the order instead.
  const ordered = tool !== 'cancel' && tool !== 'priority' && applies('cancel', last, i);
  const orders = !ordered && (builds ? last.elements[i] === Element.Floor && last.buildings[i] === Building.None : applies(tool, last, i));
  if (orders) {
    orderAt(tool, x, y);
    if (inspector.cell?.[0] === x && inspector.cell?.[1] === y) inspector.update(last);
  } else if (inspector.has(last, x, y)) inspect(x, y);
  else if (inspector.cell) inspector.close();
}
/** Whether `t` would do anything at cell i, so a box only sends orders that apply. */
function applies(t: Tool, f: Frame, i: number) {
  const x = i % f.width, y = Math.floor(i / f.width);
  if (t === 'dig') {
    const e = f.elements[i];
    return (e === Element.Dirt || e === Element.Rock || e === Element.Coal) && heldUpBy(f, x, y) === undefined;
  }
  if (t === 'deconstruct') return f.buildings[i] !== Building.None && f.buildings[i] !== Building.Cairn;
  // Priority repaints any order, and a hearth keeps its refuel priority even between refuels.
  if (t === 'priority' && f.buildings[i] === Building.Hearth) return true;
  for (let k = 0; k < f.jobs.length; k += JOB_STRIDE) {
    if (f.jobs[k] === x && f.jobs[k + 1] === y && (t === 'priority' || f.jobs[k + 2] !== JOB_REFUEL)) return true;
  }
  return false;
}
function showBox(e: PointerEvent) {
  if (!drag) return;
  const [x0, x1] = [Math.min(drag.x, e.clientX), Math.max(drag.x, e.clientX)];
  const [y0, y1] = [Math.min(drag.y, e.clientY), Math.max(drag.y, e.clientY)];
  Object.assign(selectBox.style, { left: `${x0}px`, top: `${y0}px`, width: `${x1 - x0}px`, height: `${y1 - y0}px` });
  selectBox.className = drag.box === 'cancel' || drag.box === 'deconstruct' ? 'danger' : '';
  selectBox.hidden = false;
}
function applyBox(e: PointerEvent, t: Tool) {
  const a = world.pickCell(drag!.x, drag!.y) ?? world.pickCell(e.clientX, e.clientY);
  const b = world.pickCell(e.clientX, e.clientY) ?? a;
  if (!a || !b || !last) return;
  const f = last;
  for (let y = Math.min(a[1], b[1]); y <= Math.max(a[1], b[1]); y++) {
    for (let x = Math.min(a[0], b[0]); x <= Math.max(a[0], b[0]); x++) {
      if (applies(t, f, y * f.width + x)) orderAt(t, x, y);
    }
  }
}
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  const right = e.button === 2;
  const box = right ? 'cancel' : e.shiftKey && BOX_TOOLS.includes(tool) ? tool : undefined;
  drag = { x: e.clientX, y: e.clientY, vx: world.view.x, vy: world.view.y, moved: false, paint: e.shiftKey && !box, box };
  if (drag.paint) order(e);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return digTip(e);
  if (drag.paint) return order(e);
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  if (drag.box) return showBox(e);
  const u = world.unitsPerPixel();
  world.view.x = drag.vx - dx * u;
  world.view.y = drag.vy + dy * u;
});
/** Over a building's floor with Dig picked, say why it can't be dug. */
function digTip(e: PointerEvent) {
  const cell = tool === 'dig' && last ? world.pickCell(e.clientX, e.clientY) : undefined;
  const on = cell && last ? heldUpBy(last, cell[0], cell[1]) : undefined;
  if (on === undefined || !last) {
    if (tooltip.dataset.dig) { tooltip.hidden = true; delete tooltip.dataset.dig; }
    return;
  }
  const name = BUILDING_NAMES[last.buildings[on]] ?? 'building';
  tooltip.innerHTML = `<b>Can't dig here</b>Supports the ${name.toLowerCase()}. Remove it first.`;
  tooltip.dataset.dig = '1';
  tooltip.hidden = false;
  tooltip.style.left = `${e.clientX + 14}px`;
  tooltip.style.top = `${e.clientY + 14}px`;
}
canvas.addEventListener('pointerleave', () => { if (tooltip.dataset.dig) { tooltip.hidden = true; delete tooltip.dataset.dig; } });
canvas.addEventListener('pointerup', (e) => {
  if (drag?.box) applyBox(e, drag.box);
  else if (drag && !drag.moved && !drag.paint) click(e);
  drag = undefined;
  selectBox.hidden = true;
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
