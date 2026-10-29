import { WorldView, type Overlay } from './world-view';
import {
  heldUpBy, BUILD_COST, Building, CAUSES, COLONIST_STRIDE, COLONY_JOBS, DAWN_TICKS, DAY_TICKS, DUSK_AT, NIGHT_AT, phaseOf, EVENT_ARRIVAL, EVENT_COLLAPSE, EVENT_DEATH, EVENT_RESEARCH, EVENT_SMOKE, EVENT_SHADE_ATTACK, EVENT_STRANGER, EVENT_STRIDE, EVENT_TURNED_AWAY,
  COKE_FUEL, Element, GRATE_BURN_TICKS, HEARTH_BURN_TICKS, C_WHO, GRATE_IRON, isSolid, JOB_UPGRADE, JOB_STRIDE, HEARTH_COST, knows, RARE_COST, TECHS, type Frame, type FromWorker, type Tool, type ToWorker,
} from './protocol';
import { artUrl } from './art';
import { icon } from './icons';
import { MAP_VIEWS, MapViews } from './map-views';
import { PriorityBrush, SpeedControl, StuckOrders } from './management';
import { Inspector } from './inspect';
import { ColonyScreen, Roster, StrangerCard, nameAt, nameOf, portrait } from './people';
import { ResearchPanel } from './research';
import { Goals } from './goals';
import { BUILDING_NAMES, judge, lightFrom, line, nightRadius, refusal, type Spot } from './placement';
import SimWorker from './sim.worker.ts?worker&inline';

const TICKS_PER_SECOND = 10;
const MAP_WIDTH = 160;
const MAP_HEIGHT = 110;

/** `tech` hides a tool until that Tech is known. */
interface ToolInfo { tool: Tool; key: string; label: string; icon: string; tip: string; building?: number; tech?: number }
const TOOLS: ToolInfo[] = [
  { tool: 'dig', key: '1', label: 'Dig', icon: 'dig', tip: 'Mark rock, dirt or coal to be dug out. Coal goes to the stockpile.' },
  { tool: 'ladder', key: '2', label: 'Ladder', icon: 'ladder', tip: 'Lets survivors climb. Build them up walls and shafts.', building: Building.Ladder },
  { tool: 'hearth', key: '3', label: 'Hearth', icon: 'hearth', tip: 'A new fire: light, warmth and safety. Burns coal.', building: Building.Hearth },
  { tool: 'mushroom', key: '4', label: 'Mushrooms', icon: 'mushroom', tip: 'Grows food away from the fire. Lamp light is fine, so light the farm to keep Shades out.', building: Building.MushroomBed },
  { tool: 'lamp', key: '6', label: 'Lamp', icon: 'lamp', tip: 'A small light that keeps Shades away. No warmth, so survivors still cool down slowly.', building: Building.Lamp },
  { tool: 'vent', key: '5', label: 'Vent', icon: 'vent', tip: 'A bored hole with a bellows. Clears the smoke in its cell; put it where smoke pools, under the ceiling above the fire.', building: Building.Vent },
  { tool: 'bed', key: '7', label: 'Bed', icon: 'bed', tip: 'Survivors sleep better in a bed, best if it is lit.', building: Building.Bed },
  { tool: 'stockpile', key: '8', label: 'Stockpile', icon: 'stockpile', tip: 'Where dug coal and stone go. Nothing counts until a survivor carries it here, so build one near where you dig.', building: Building.Stockpile },
  { tool: 'tile', key: '9', label: 'Tile', icon: 'tile', tip: 'A block of cut stone. Lay floors over gaps, bridges, ceilings and walls; dig it to take it back.', building: Building.Tile },
  { tool: 'door', key: '0', label: 'Door', icon: 'door', tip: 'Two cells tall. Survivors walk through; smoke and Shades don\'t. Close a small space off with walls and a door to make a room.', building: Building.Door },
  { tool: 'bench', key: 'B', label: 'Research', icon: 'research', tip: 'A research bench. A survivor studies here between other work; pick what to study with the Research button up top.', building: Building.ResearchBench },
  { tool: 'coke', key: 'K', label: 'Coke oven', icon: 'coke', tip: 'Bakes 3 coal into 2 coke while you have coal to spare. Coke burns twice as long with half the smoke.', building: Building.CokeOven, tech: 0 },
  { tool: 'smelter', key: 'M', label: 'Smelter', icon: 'iron', tip: 'Smelts 2 iron ore and 1 coal into iron while you have coal to spare.', building: Building.Smelter, tech: 1 },
  { tool: 'grate', key: 'G', label: 'Grate', icon: 'grate', tip: 'Fit a hearth with an iron grate: a third less coal, warmth 2 cells further, half the smoke.', tech: 2 },
  { tool: 'crystal-lamp', key: 'L', label: 'Crystal lamp', icon: 'crystal-lamp', tip: 'A lamp with a crystal lens. Light twice as far as a lamp, and no fuel.', building: Building.CrystalLamp, tech: 3 },
  { tool: 'priority', key: 'P', label: 'Priority', icon: 'priority', tip: 'Repaint how urgent orders are, from 1 to 9. Survivors take the most urgent order they can reach first.' },
  { tool: 'deconstruct', key: 'D', label: 'Remove', icon: 'deconstruct', tip: 'Have a building taken down. Survivors salvage half of what it cost, and a hearth gives back its fuel.' },
  { tool: 'cancel', key: 'X', label: 'Cancel', icon: 'cancel', tip: 'Take back orders you have marked. Right-click does this with any tool.' },
];
/** One short sentence each; the hint panel shows at most two lines. */
const HINTS: Record<Tool, string> = {
  dig: '<b>Dig:</b> click rock or shift-drag a box. Black seams are coal.',
  bench: '<b>Research bench:</b> place it in the light, then pick a study with the Research button (R).',
  coke: '<b>Coke oven:</b> bakes coal into coke while you hold over 16 coal.',
  smelter: '<b>Smelter:</b> haul ore to it; it turns ore and coal into iron.',
  grate: `<b>Grate:</b> click a hearth to fit one. Costs ${GRATE_IRON} iron.`,
  'crystal-lamp': '<b>Crystal lamp:</b> lights a long tunnel or a farm by itself.',
  tile: '<b>Tile:</b> click beside a floor or wall. Costs 1 stone; dig it to get it back.',
  door: '<b>Door:</b> wall a space off with tiles and a door to make a room.',
  stockpile: '<b>Stockpile:</b> place near your digging; haulers bring goods here.',
  ladder: '<b>Ladder:</b> click open cells, or shift-drag a line up a shaft.',
  hearth: '<b>Hearth:</b> light up a new part of the caves.',
  mushroom: '<b>Mushrooms:</b> place a bed out of the firelight; lamps keep Shades off.',
  lamp: '<b>Lamp:</b> light a tunnel so Shades keep out of it.',
  vent: '<b>Vent:</b> place where smoke pools under the ceiling.',
  bed: '<b>Bed:</b> place inside the light. Rested survivors work faster.',
  deconstruct: '<b>Remove:</b> click or shift-drag a building; half its cost comes back.',
  priority: '<b>Priority:</b> pick 1 to 9, then click orders. 9 is urgent, 1 is whenever.',
  cancel: '<b>Cancel:</b> click an order or shift-drag a box. Right-click works with any tool.',
};

const $ = (id: string) => document.getElementById(id)!;
const canvas = $('game') as HTMLCanvasElement;
const stats = $('stats');
const clock = $('clock');
const hint = $('hint');
const tooltip = $('tooltip');
const world = new WorldView(canvas);
(window as unknown as { hearthfall: unknown }).hearthfall = world; // handy for debugging in the console
let worker: Worker | undefined;
const send = (msg: ToWorker) => worker?.postMessage(msg);

let tool: Tool = 'dig';
function buildingOf(t: Tool) { return TOOLS.find((x) => x.tool === t)?.building; }
/** A pan, a box for an area tool, or a line of buildings from the cell it started on. */
let drag: { x: number; y: number; vx: number; vy: number; moved: boolean; box?: Tool; line?: [number, number] } | undefined;
/** Where the pointer is over the world, for the preview. */
let pointer: { x: number; y: number } | undefined;
const speed = new SpeedControl(send);
const brush = new PriorityBrush();
const inspector = new Inspector(TICKS_PER_SECOND, send, () => { world.select(); hint.hidden = false; });
function inspect(x: number, y: number) {
  if (!last) return;
  inspector.open(x, y, last);
  world.select([x, y]);
  hint.hidden = true;
}
const stuck = new StuckOrders(world, inspect);
/** Find survivor `i`: centre the camera on them and follow them in the inspect panel. */
function pickSurvivor(i: number) {
  if (!last) return;
  const o = i * COLONIST_STRIDE;
  const p = world.cellToWorld(last.colonists[o], last.colonists[o + 1]);
  world.view.x = p.x;
  world.view.y = p.y;
  inspector.openSurvivor(i, last);
  world.select([last.colonists[o], last.colonists[o + 1]]);
  hint.hidden = true;
}
const roster = new Roster(pickSurvivor);
const strangerCard = new StrangerCard(send, TICKS_PER_SECOND);
const colony = new ColonyScreen(send, pickSurvivor);
const research = new ResearchPanel(send, () => setTool('bench'));

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
  for (const id of ['top', 'roster', 'colony-open', 'toolbar', 'hint', 'log']) $(id).hidden = false;
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

// Keep the event log below the whole top bar, even when it wraps.
const topBar = document.getElementById('top')!;
new ResizeObserver(() => document.documentElement.style.setProperty('--top-h', `${Math.ceil(topBar.getBoundingClientRect().bottom)}px`)).observe(topBar);

function stat(name: string, label: string, value: string | number, warn = false, sub = '', danger = false) {
  return `<div class="stat${danger ? ' danger' : warn ? ' warn' : ''}">${icon(name, 20)}<div><span>${label}</span><b>${value}</b>${sub ? `<small>${sub}</small>` : ''}</div></div>`;
}

/**
 * How long the colony's fuel lasts at the current burn: coal and coke in stock
 * plus the fuel in lit hearths, over what the lit hearths burn per tick
 * (grated ones burn slower). Null while no fire is lit.
 */
function coalRunway(f: Frame): { ticks: number; held: number } | null {
  let held = 0, rate = 0;
  for (let c = 0; c < f.buildings.length; c++) {
    if (f.buildings[c] !== Building.Hearth || f.hearthFuel[c] <= 0) continue;
    held += f.hearthFuel[c];
    rate += 1 / (f.hearthGrate[c] ? GRATE_BURN_TICKS : HEARTH_BURN_TICKS);
  }
  if (!rate) return null;
  return { ticks: (held + f.coal + f.coke * COKE_FUEL) / rate, held };
}
const untilDawn = (tick: number) => DAY_TICKS - (tick % DAY_TICKS);
const nightsText = (ticks: number) => ticks >= DAY_TICKS * 10 ? '10+ nights' : `${(ticks / DAY_TICKS).toFixed(1)} night${Math.abs(ticks / DAY_TICKS - 1) < 0.05 ? '' : 's'}`;
/** The coal stat: stock, with how long the fuel lasts under it. */
function coalStat(f: Frame) {
  const run = coalRunway(f);
  if (!run) return stat('coal', 'Coal', f.coal, f.coal < HEARTH_COST);
  const danger = run.ticks < DAY_TICKS / 2, warn = run.ticks < untilDawn(f.tick);
  const tip = `<b>Coal</b>${f.coal} in the stockpile and ${run.held} burning in hearths: about <b>${nightsText(run.ticks)}</b> at the current burn.` +
    (warn ? `<em>Won't last until dawn. Dig a seam.</em>` : '');
  return `<div data-tip="${tip.replace(/"/g, '&quot;')}">${stat('coal', 'Coal', f.coal, warn, `≈${nightsText(run.ticks)}`, danger)}</div>`;
}

// --- Event log -----------------------------------------------------------------

const log = $('log');
let lastEventTick = -1;
/** The first dusk gets one log line. */
let duskNoted = false;
/** The day whose dusk already warned about coal, so it warns once. */
let coalWarnedDay = -1;
/** The last stranger's name, for the line when they leave. */
let strangerName = 'The stranger';
/** Announces new sim events (deaths so far) in the log; each line fades after a while. */
function announce(frame: Frame) {
  for (let i = 0; i < frame.events.length; i += EVENT_STRIDE) {
    const [tick, kind, who] = [frame.events[i], frame.events[i + 1], frame.events[i + 2]];
    if (tick <= lastEventTick) continue;
    lastEventTick = tick;
    const name = who < frame.colonists.length / COLONIST_STRIDE ? nameAt(frame, who) : '';
    let text: string, glyph: string;
    if (kind === EVENT_DEATH) {
      text = `<b>${name}</b> ${CAUSES[frame.colonists[who * COLONIST_STRIDE + 12]] ?? 'died'} on day ${Math.floor(tick / DAY_TICKS) + 1}.`;
      glyph = 'skull';
      deathBanner(frame, who, `<b>${name}</b> ${CAUSES[frame.colonists[who * COLONIST_STRIDE + 12]] ?? 'died'} on day ${Math.floor(tick / DAY_TICKS) + 1}`);
    } else if (kind === EVENT_SHADE_ATTACK) {
      text = `A Shade has <b>${name}</b>! Get them into the light.`;
      glyph = 'shade';
    } else if (kind === EVENT_SMOKE) {
      logLine('Smoke is gathering under the ceiling. Dig a flue up from the fire, or build a <b>vent</b> where it pools.', 'vent', 'warn');
      continue;
    } else if (kind === EVENT_ARRIVAL) {
      logLine(`<b>${name}</b> joins the colony.`, 'people', 'info');
      continue;
    } else if (kind === EVENT_STRANGER) {
      if (frame.stranger.length) strangerName = nameOf(frame.stranger);
      logLine(`<b>${strangerName}</b> followed the firelight down and asks to join. They leave at nightfall.`, 'people', 'info');
      continue;
    } else if (kind === EVENT_TURNED_AWAY) {
      logLine(`<b>${strangerName}</b> walked back into the dark.`, 'people', 'info');
      continue;
    } else if (kind === EVENT_RESEARCH) {
      const tech = TECHS[who];
      if (tech) logLine(`Research done: <b>${tech.name}</b>. ${tech.unlocks}`, tech.icon, 'info');
      continue;
    } else if (kind === EVENT_COLLAPSE) {
      logLine(`A <b>${BUILDING_NAMES[who] ?? 'building'}</b> lost its floor and fell. What could be salvaged is back in the stockpile.`, 'deconstruct', 'warn');
      continue;
    } else continue;
    logLine(text, glyph);
  }
}

/** A death is never missed: a banner under the top bar stays until clicked or 20 s, and several stack. */
const deaths = $('deaths');
function deathBanner(frame: Frame, who: number, html: string) {
  const c = frame.colonists.subarray(who * COLONIST_STRIDE, (who + 1) * COLONIST_STRIDE);
  const el = document.createElement('button');
  el.className = 'panel death';
  el.innerHTML = `${artUrl(`survivor-${c[C_WHO]}-portrait`) ? portrait(c, 28) : icon('skull', 22)}<span>${html}</span>`;
  const gone = () => el.remove();
  el.onclick = gone;
  setTimeout(gone, 20_000);
  deaths.append(el);
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

const views = new MapViews(nameAt, logLine);

// --- First-night tutorial ------------------------------------------------------

/** Each step waits for the world to show it done, and lights up the button it needs. */
const TUTORIAL: { text: string; tool?: Tool; done: (f: Frame) => boolean }[] = [
  { text: 'Your fire is all that keeps the cold out, and it burns coal. <b>Mark a coal seam to dig</b>: pick Dig and click the black rock in the cave walls.', tool: 'dig',
    done: (f) => { for (let i = 0; i < f.jobs.length; i += JOB_STRIDE) if (f.jobs[i + 2] === 0) return true; return false; } },
  { text: 'Shades come out of the dark at night. <b>Build a lamp</b> in a tunnel to keep them out of it.', tool: 'lamp',
    done: (f) => f.buildings.includes(Building.Lamp) || hasBuildJob(f, Building.Lamp) },
  { text: 'Tired survivors work slowly, and strangers only ask to join a colony with a spare bed. <b>Build a bed</b> inside the light.', tool: 'bed',
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
/** Tutorial step 1: pulse the nearest coal a survivor could reach, and bring it on screen once. */
let coalPanned = false;
function guideToCoal(f: Frame) {
  const w = f.width;
  const first = f.buildings.indexOf(Building.Hearth);
  const hx = first >= 0 ? first % w : w / 2, hy = first >= 0 ? Math.floor(first / w) : Math.floor(f.height / 2);
  const marked = new Set<number>();
  for (let i = 0; i < f.jobs.length; i += JOB_STRIDE) if (f.jobs[i + 2] === 0) marked.add(f.jobs[i + 1] * w + f.jobs[i]);
  let best = -1, bestD = Infinity;
  for (let c = 0; c < f.elements.length; c++) {
    if (f.elements[c] !== Element.Coal || marked.has(c)) continue;
    const x = c % w, y = Math.floor(c / w);
    const open = (x > 0 && f.elements[c - 1] === Element.Floor) || (x < w - 1 && f.elements[c + 1] === Element.Floor) ||
      (y > 0 && f.elements[c - w] === Element.Floor) || (y < f.height - 1 && f.elements[c + w] === Element.Floor);
    const d = (x - hx) ** 2 + (y - hy) ** 2;
    if (open && d < bestD) { best = c; bestD = d; }
  }
  if (best < 0) return world.highlight();
  const cell: [number, number] = [best % w, Math.floor(best / w)];
  world.highlight(cell);
  if (!coalPanned) {
    coalPanned = true;
    if (!world.onScreen(cell[0], cell[1])) world.panTo(cell[0], cell[1]);
  }
}
function endTutorial() {
  world.highlight();
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
  if (step === 0) guideToCoal(frame);
  if (!TUTORIAL[step].done(frame)) return;
  world.highlight();
  step++;
  if (step >= TUTORIAL.length) {
    tutorial.innerHTML = '<small>First night</small><p><b>You made it to dawn.</b> Keep a spare bed and food ready: from day 3, strangers follow the firelight down and ask to join. Press <b>C</b> to see your colony. The Deep Hearth is five layers below.</p>';
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

/** Set once the last survivor is gone: the goals card and tutorial stay away. */
let over = false;
let last: Frame | undefined;
function onFrame(event: MessageEvent<FromWorker>) {
  const frame = event.data;
  last = frame;
  world.applyFrame(frame, TICKS_PER_SECOND);
  if (pointer) showPreview(); // what fits changes as survivors dig and build
  announce(frame);
  const total = frame.colonists.length / COLONIST_STRIDE;
  let alive = 0;
  for (let i = 0; i < total; i++) if (frame.colonists[i * COLONIST_STRIDE + 3] !== 5) alive++;
  const day = Math.floor(frame.tick / DAY_TICKS) + 1;
  const into = frame.tick % DAY_TICKS;
  const phase = phaseOf(frame.tick);
  const next = { day: ['Dusk', DUSK_AT], dusk: ['Night', NIGHT_AT], night: ['Dawn', DAY_TICKS], dawn: ['Day', DAWN_TICKS] }[phase] as [string, number];
  const untilChange = Math.ceil((next[1] - into) / TICKS_PER_SECOND);
  if (phase === 'dusk' && !duskNoted) {
    duskNoted = true;
    logLine('Dusk: everyone heads back to the light.', 'moon', 'info');
  }
  if (phase === 'dusk' && coalWarnedDay !== day) {
    coalWarnedDay = day;
    const run = coalRunway(frame);
    if (run && run.ticks < untilDawn(frame.tick)) logLine('Not enough coal for tonight: <b>dig a seam</b>.', 'coal', 'warn');
  }

  (clock.querySelector('.dial i') as HTMLElement).style.transform = `rotate(${(into / DAY_TICKS) * 360 + 180}deg)`;
  clock.querySelector('.clock-text')!.innerHTML =
    `<b>Day ${day}</b><span>${icon(phase === 'dusk' || phase === 'night' ? 'moon' : 'sun', 12)}${phase === 'day' ? '' : `${phase[0].toUpperCase()}${phase.slice(1)} · `}${next[0]} in ${untilChange}s</span>`;
  stats.innerHTML =
    coalStat(frame) +
    stat('stone', 'Stone', frame.stone, frame.stone < 2) +
    `<div data-tip="<b>Food</b>${frame.food} raw mushrooms and ${frame.meals} roast meals. Firekeepers roast mushrooms at a hearth when there is coal to spare, and roast meals lift morale.">${stat('food', 'Food', frame.meals ? `${frame.food}+${frame.meals}` : frame.food, frame.food + frame.meals < 5)}</div>` +
    (frame.coke ? stat('coke', 'Coke', frame.coke) : '') +
    (frame.ore || frame.iron ? stat('iron', 'Iron', frame.ore ? `${frame.iron}<small> +${frame.ore} ore</small>` : frame.iron) : '') +
    (frame.crystal ? stat('crystal', 'Crystal', frame.crystal) : '') +
    stat('people', 'Survivors', `${alive}/${total}`, alive < total);
  roster.update(frame);
  strangerCard.update(frame);
  colony.update(frame);
  renderDepth(frame);
  if (!over) {
    tutorialStep(frame);
    goals.update(frame, step >= TUTORIAL.length && tutorial.hidden);
  }
  stuck.update(frame);
  inspector.update(frame);
  research.update(frame);
  showUnlocked(frame);
  world.timeScale = speed.speed;
  views.update(frame, world.overlay);
  document.body.classList.toggle('night', frame.night);
  const overPanel = $('gameover');
  if (alive === 0 && overPanel.hidden) {
    over = true;
    tutorial.hidden = true;
    $('goals').hidden = true;
    world.highlight();
    overPanel.hidden = false;
    overPanel.querySelector('.summary')!.textContent = `Your colony lasted ${day} day${day === 1 ? '' : 's'} on seed ${seed}.`;
  }
}

// --- Tools ---------------------------------------------------------------------

/** What a building costs, as [amount, icon, word] for each good it needs. */
function costs(building?: number, t?: Tool): [number, string, string][] {
  if (t === 'grate') return [[GRATE_IRON, 'iron', 'iron']];
  if (building === undefined) return [];
  const [coal, stone] = BUILD_COST[building] ?? [0, 0];
  const [iron, crystal] = RARE_COST[building] ?? [0, 0];
  return ([[coal, 'coal', 'coal'], [stone, 'stone', 'stone'], [iron, 'iron', 'iron'], [crystal, 'crystal', 'crystal']] as [number, string, string][]).filter(([n]) => n > 0);
}
/** The goods a building costs, as a small badge on its tool. */
function costBadge(building?: number, t?: Tool) {
  const list = costs(building, t);
  if (!list.length) return '';
  const words = list.map(([n, , w]) => `${n} ${w}`).join(' and ');
  return `<span class="cost" title="Costs ${words}">${list.map(([n, i]) => `${icon(i, 10)}${n}`).join('')}</span>`;
}
/** Tools that research unlocks stay hidden until then. */
let shownKnown = -1;
function showUnlocked(f: Frame) {
  if (f.known === shownKnown) return;
  shownKnown = f.known;
  for (const t of TOOLS) {
    if (t.tech === undefined) continue;
    document.querySelector<HTMLElement>(`[data-tool="${t.tool}"]`)!.hidden = !knows(f, t.tech);
  }
}

/** Build tools sit in categories, each a toolbar button that opens a row of its tools above the bar (after Oxygen Not Included). Order here is the fixed slot order. */
const CATEGORIES: { id: string; label: string; icon: string; tools: Tool[] }[] = [
  { id: 'build', label: 'Build', icon: 'build', tools: ['ladder', 'tile', 'door', 'stockpile'] },
  { id: 'fire', label: 'Fire and light', icon: 'hearth', tools: ['hearth', 'lamp', 'crystal-lamp', 'vent', 'grate'] },
  { id: 'living', label: 'Living', icon: 'living', tools: ['bed', 'mushroom'] },
  { id: 'industry', label: 'Industry', icon: 'industry', tools: ['bench', 'coke', 'smelter'] },
];
const categoryOf = (t: Tool) => CATEGORIES.find((c) => c.tools.includes(t));
const toolInfo = (t: Tool) => TOOLS.find((x) => x.tool === t)!;
function toolButton(t: ToolInfo) {
  return `<button class="tool" data-tool="${t.tool}" data-tip="<b>${t.label}</b>${t.tip}">
    <kbd>${t.key}</kbd>${costBadge(t.building, t.tool)}${icon(t.icon, 22)}<span class="label">${t.label}</span></button>`;
}
$('tools').innerHTML = [toolButton(toolInfo('dig')),
  ...CATEGORIES.map((c) => `<button class="tool cat" data-cat="${c.id}" aria-expanded="false" data-tip="<b>${c.label}</b>${c.tools.map((t) => toolInfo(t).label).join(', ')}">${icon(c.icon, 22)}<span class="label">${c.label}</span><i class="caret"></i></button>`),
  ...(['priority', 'deconstruct', 'cancel'] as Tool[]).map((t) => toolButton(toolInfo(t)))].join('');
$('flyout').innerHTML = CATEGORIES.map((c) => `<div class="row" data-row="${c.id}" hidden>${c.tools.map((t) => toolButton(toolInfo(t))).join('')}</div>`).join('');

let openCat: string | undefined;
const catButton = (id: string) => document.querySelector<HTMLElement>(`[data-cat="${id}"]`)!;
/** Show one category's tools above the toolbar, or none. */
function openFlyout(id?: string) {
  openCat = id;
  const fly = $('flyout');
  fly.querySelectorAll<HTMLElement>('[data-row]').forEach((r) => (r.hidden = r.dataset.row !== id));
  document.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => {
    b.classList.toggle('open', b.dataset.cat === id);
    b.setAttribute('aria-expanded', String(b.dataset.cat === id));
  });
  fly.hidden = !id;
  if (id) hideTip();
  if (!id) return;
  const r = catButton(id).getBoundingClientRect();
  const w = fly.getBoundingClientRect().width;
  fly.style.left = `${Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8)}px`;
}
/** A category shows only while one of its tools does, and pulses when one of them is being pointed at. */
function syncCategories() {
  for (const c of CATEGORIES) {
    const tools = c.tools.map((t) => document.querySelector<HTMLElement>(`[data-tool="${t}"]`)!);
    const b = catButton(c.id);
    b.hidden = tools.every((x) => x.hidden);
    b.classList.toggle('sub-pulse', tools.some((x) => !x.hidden && ['pulse', 'reveal', 'goal-pulse'].some((k) => x.classList.contains(k))));
    if (b.hidden && openCat === c.id) openFlyout();
  }
}
new MutationObserver(syncCategories).observe($('flyout'), { attributes: true, subtree: true, attributeFilter: ['class', 'hidden'] });
$('overlays').innerHTML = MAP_VIEWS.map((o) =>
  `<button class="tool" data-overlay="${o.overlay}" data-tip="<b>${o.label}</b>${o.tip}"${views.isOpen(o.overlay) ? '' : ' hidden'}>
    <kbd>${o.key}</kbd>${icon(o.icon, 22)}<span class="label">${o.label}</span></button>`).join('');

// Tooltips for anything with a data-tip, including rows drawn after start.
let tipFor: HTMLElement | undefined;
function hideTip() {
  if (!tooltip.dataset.cursor) tooltip.hidden = true;
  tipFor = undefined;
}
document.addEventListener('pointerover', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
  if (el === tipFor) return;
  tipFor = el ?? undefined;
  // An open category's own tooltip would cover its flyout.
  if (el?.dataset.cat !== undefined && el.dataset.cat === openCat) {
    if (!tooltip.dataset.cursor) tooltip.hidden = true;
    return;
  }
  if (!el || !el.dataset.tip) {
    if (!tooltip.dataset.cursor) tooltip.hidden = true;
    return;
  }
  delete tooltip.dataset.cursor;
  tooltip.innerHTML = el.dataset.tip;
  tooltip.hidden = false;
  const r = el.getBoundingClientRect();
  const t = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), window.innerWidth - t.width - 8)}px`;
  // Above the element, or below it near the top of the screen.
  tooltip.style.top = `${r.top - t.height - 10 < 8 ? r.bottom + 10 : r.top - t.height - 10}px`;
  // A tool inside the flyout clears the whole flyout, not just its button.
  const fly = $('flyout');
  if (!fly.hidden && fly.contains(el)) {
    const top = fly.getBoundingClientRect().top - t.height - 8;
    tooltip.style.top = `${Math.max(8, top)}px`;
  }
});

function selectButton(attr: string, value: string) {
  document.querySelectorAll<HTMLButtonElement>(`[${attr}]`).forEach((b) => b.classList.toggle('active', b.getAttribute(attr) === value));
}
function setTool(t: Tool) {
  tool = t;
  selectButton('data-tool', t);
  const cat = categoryOf(t);
  document.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat?.id));
  openFlyout(cat?.id);
  brush.shown(t === 'priority');
  world.setShowPriorities(t === 'priority');
  hint.innerHTML = `${icon(TOOLS.find((x) => x.tool === t)!.icon, 18)}<div>${HINTS[t]}</div>`;
  showPreview();
}
function setOverlay(o: Overlay) {
  if (!views.isOpen(o)) return;
  world.setOverlay(o);
  selectButton('data-overlay', o);
  views.shown(o);
}
setTool('dig');
setOverlay('none');

// The toolbar starts small and unfolds; the Next card follows the tutorial.
const goals = new Goals($('goals'), logLine);

document.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach((b) => (b.onclick = () => setTool(b.dataset.tool as Tool)));
document.querySelectorAll<HTMLButtonElement>('[data-cat]').forEach((b) => (b.onclick = () => openFlyout(openCat === b.dataset.cat ? undefined : b.dataset.cat)));
syncCategories();
document.querySelectorAll<HTMLButtonElement>('[data-overlay]').forEach((b) =>
  (b.onclick = () => setOverlay(world.overlay === b.dataset.overlay ? 'none' : b.dataset.overlay as Overlay)));

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLSelectElement || !worker) return;
  if (speed.key(e)) return e.preventDefault();
  const key = e.key.toLowerCase();
  // With the Priority tool out, the number keys pick the level instead of a tool.
  if (tool === 'priority' && /^[1-9]$/.test(key)) return brush.set(Number(key));
  if (key === 'escape' && colony.open) return colony.toggle(false);
  if (key === 'escape' && inspector.cell) return inspector.close();
  if (key === 'escape' && openCat) return openFlyout();
  if (key === 'c') return colony.toggle();
  if (key === 'r') return research.toggle();
  const tools: Record<string, Tool> = {
    '1': 'dig', '2': 'ladder', '3': 'hearth', '4': 'mushroom', '5': 'vent', '6': 'lamp', '7': 'bed', '8': 'stockpile', '9': 'tile', '0': 'door',
    b: 'bench', k: 'coke', m: 'smelter', g: 'grate', l: 'crystal-lamp', d: 'deconstruct', x: 'cancel', p: 'priority',
  };
  if (tools[key] && !document.querySelector<HTMLElement>(`[data-tool="${tools[key]}"]`)?.hidden) setTool(tools[key]);
  const overlays: Record<string, Overlay> = { w: 'warmth', escape: 'none' };
  if (overlays[key]) setOverlay(world.overlay === overlays[key] ? 'none' : overlays[key]);
});

// Drag pans, wheel zooms. A click places an order. Shift-drag paints build
// orders along the pointer, and draws a box for dig, remove and cancel.
// Right-click and right-drag cancel with any tool.
const BOX_TOOLS: Tool[] = ['dig', 'deconstruct', 'cancel', 'priority'];
const selectBox = $('select-box');
/** Place an order with `t` on a cell, or for Priority, repaint the order there. */
function orderAt(t: Tool, x: number, y: number) {
  if (t === 'priority') send({ type: 'priority', x, y, priority: brush.level });
  else send({ type: 'command', tool: t, x, y });
}
/** A plain click: order if the tool does something there, else inspect what is there. */
function click(e: PointerEvent) {
  const cell = world.pickCell(e.clientX, e.clientY);
  if (!cell || !last) return;
  const [x, y] = cell;
  const i = y * last.width + x;
  const building = buildingOf(tool);
  // Clicking an order already there with a tool that would only repeat it shows the order instead.
  const ordered = tool !== 'cancel' && tool !== 'priority' && applies('cancel', last, i);
  const orders = !ordered && (building !== undefined ? refusal(last, x, y, building) === undefined : applies(tool, last, i));
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
    return isSolid(f.elements[i]) && heldUpBy(f, x, y) === undefined;
  }
  if (t === 'grate') {
    if (f.buildings[i] !== Building.Hearth || f.hearthGrate[i]) return false;
    for (let k = 0; k < f.jobs.length; k += JOB_STRIDE) if (f.jobs[k] === x && f.jobs[k + 1] === y && f.jobs[k + 2] === JOB_UPGRADE) return false;
    return true;
  }
  if (t === 'deconstruct') return f.buildings[i] !== Building.None && f.buildings[i] !== Building.Cairn;
  // Priority repaints any order, and a hearth keeps its refuel priority even between refuels.
  if (t === 'priority' && f.buildings[i] === Building.Hearth) return true;
  for (let k = 0; k < f.jobs.length; k += JOB_STRIDE) {
    if (f.jobs[k] === x && f.jobs[k + 1] === y && (t === 'priority' || !COLONY_JOBS.includes(f.jobs[k + 2]))) return true;
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
  if (e.shiftKey) e.preventDefault(); // or shift-drag selects the page's text
  const right = e.button === 2;
  const box = right ? 'cancel' : e.shiftKey && BOX_TOOLS.includes(tool) ? tool : undefined;
  const start = !right && e.shiftKey && buildingOf(tool) !== undefined ? world.pickCell(e.clientX, e.clientY) : undefined;
  world.stopPan();
  drag = { x: e.clientX, y: e.clientY, vx: world.view.x, vy: world.view.y, moved: false, box, line: start };
  showPreview();
});
canvas.addEventListener('pointermove', (e) => {
  pointer = { x: e.clientX, y: e.clientY };
  if (!drag || drag.line) return showPreview();
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.hypot(dx, dy) > 5) drag.moved = true;
  if (!drag.moved) return;
  if (drag.box) { showBox(e); return showPreview(); }
  hideTip();
  const u = world.unitsPerPixel();
  world.view.x = drag.vx - dx * u;
  world.view.y = drag.vy + dy * u;
});
const AREA_COLOURS: Partial<Record<Tool, string>> = { dig: '#ffb454', deconstruct: '#ff6b6b', cancel: '#ff6b6b', priority: '#7cc4ff' };
/** The cells a build line or an area box would cover, as the pointer stands now. */
function previewCells(f: Frame): [number, number][] {
  const here = pointer && world.pickCell(pointer.x, pointer.y);
  if (!here) return [];
  if (drag?.line) return line(drag.line, here);
  if (!drag?.box || !drag.moved) return [here];
  const a = world.pickCell(drag.x, drag.y) ?? here;
  const cells: [number, number][] = [];
  for (let y = Math.min(a[1], here[1]); y <= Math.max(a[1], here[1]); y++) {
    for (let x = Math.min(a[0], here[0]); x <= Math.max(a[0], here[0]) && cells.length < 20_000; x++) cells.push([x, y]);
  }
  return cells;
}
/**
 * Show what the tool would do before it does it: a ghost of each building it
 * would place, green if it fits, amber if it waits for stock, red if refused,
 * with the reason and cost by the cursor; or the cells a dig, remove, cancel or
 * priority box would touch.
 */
function showPreview() {
  const f = last;
  const panning = drag && !drag.box && !drag.line && drag.moved;
  if (!f || !pointer || panning) { world.setPreview(); return hideTip(); }
  const building = buildingOf(drag?.box ?? tool);
  const cells = previewCells(f);
  if (building === undefined) {
    const t = drag?.box ?? tool;
    const spots = cells.filter(([x, y]) => applies(t, f, y * f.width + x)).map(([x, y]): Spot => ({ x, y, fit: 'ok' }));
    world.setPreview(spots.length ? { spots, area: AREA_COLOURS[t] } : undefined);
    const held = t === 'dig' && cells.length === 1 ? heldUpBy(f, cells[0][0], cells[0][1]) : undefined;
    if (held === undefined) return hideTip();
    const name = BUILDING_NAMES[f.buildings[held]] ?? 'building';
    return showTip(`<b>Can't dig here</b><em class="bad">Supports the ${name}. Remove it first.</em>`);
  }
  if (!cells.length) { world.setPreview(); return hideTip(); }
  const spots = judge(f, building, cells);
  const placed = spots.filter((s) => s.fit !== 'bad');
  const radius = nightRadius(building);
  const glow = radius && placed.length ? lightFrom(f, placed.map((s) => s.y * f.width + s.x), radius) : undefined;
  world.setPreview({ building, spots, glow, warm: building === Building.Hearth });

  const name = BUILDING_NAMES[building] ?? 'building';
  const n = Math.max(placed.length, 1);
  const cost = costs(building).map(([k, i, w]) => `${icon(i, 12)} ${k * n} ${w}`).join(' &nbsp;') || 'Free';
  const title = cells.length > 1 ? `${placed.length} of ${cells.length} ${name}s fit` : name[0].toUpperCase() + name.slice(1);
  const light = radius ? `<span class="note">The glow is how far its ${building === Building.Hearth ? 'light and warmth reach' : 'light reaches'} at night.</span>` : '';
  const problem = spots.find((s) => s.fit === 'bad') ?? spots.find((s) => s.fit === 'wait');
  const why = problem ? `<em class="${problem.fit === 'bad' ? 'bad' : ''}">${problem.reason}</em>` : '';
  showTip(`<b>${title}</b><span class="cost">${cost}</span>${light}${why}`);
}
function showTip(html: string) {
  if (!pointer) return;
  tooltip.innerHTML = html;
  tooltip.dataset.cursor = '1';
  tooltip.hidden = false;
  const t = tooltip.getBoundingClientRect();
  tooltip.style.left = `${Math.min(pointer.x + 16, window.innerWidth - t.width - 8)}px`;
  tooltip.style.top = `${Math.min(pointer.y + 16, window.innerHeight - t.height - 8)}px`;
}
function hideTip() {
  if (tooltip.dataset.cursor) { tooltip.hidden = true; delete tooltip.dataset.cursor; }
}
canvas.addEventListener('pointerleave', () => { pointer = undefined; if (!drag) { world.setPreview(); hideTip(); } });
canvas.addEventListener('pointerup', (e) => {
  if (drag?.box) applyBox(e, drag.box);
  else if (drag?.line && last) {
    const building = buildingOf(tool)!;
    for (const s of judge(last, building, previewCells(last))) if (s.fit !== 'bad') orderAt(tool, s.x, s.y);
  } else if (drag && !drag.moved) click(e);
  drag = undefined;
  selectBox.hidden = true;
  showPreview();
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
