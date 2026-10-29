// The inspect panel: click a hearth, a building, a survivor or a seam to see
// what it is doing and why. It reads every frame, so the numbers stay live.

import {
  ACTIVITIES, BLOCK_REASONS, DRIP_DRY, DRIP_HOLD, DRIP_REACH, DRIP_TICKS, DAY_TICKS, JOB_PUMP, PUMP_NO_TANK, PUMP_NO_WATER, PUMP_READY, PUMP_REACH, PUMP_STINT, PUMP_TANKS_FULL, Building, C_THIRST, C_TRAITS, CAUSES, DRINK_UNITS, JOB_FETCH, TANK_CAPACITY, COLONIST_STRIDE, DARK_BELOW, DEFAULT_PRIORITY, Element, HEARTH_BURN_TICKS, HEARTH_CAPACITY, JOB_NAMES, JOB_COOK, JOB_REFUEL, JOB_STRIDE, SKILLS,
  CARRY_MAX, COAL_RESERVE, COKE_KEEP, CRYSTAL_RADIUS_DAY, CRYSTAL_RADIUS_NIGHT, GRATE_BURN_TICKS, GRATE_IRON, GRATE_RADIUS, IRON_KEEP, ITEM_NAMES, Item, JOB_UPGRADE, JOB_WATER, BED_SELF_WATERING, WATER_LOW, WATER_MAX, knows, LAMP_RADIUS_DAY, LAMP_RADIUS_NIGHT, LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT, MAX_PRIORITY, MUSHROOM_TICKS, ROOM_EFFECTS, ROOM_MAX_CELLS, ROOM_NAMES, ROOM_NONE, ROLES, SMOKY, STAT_MAX, TECHS, type Frame, type ToWorker,
} from './protocol';
import { icon } from './icons';
import { moraleBlock, nameAt, skillCell, temperament, traitChips } from './people';

/** Firekeepers top a hearth up below this; must match REFUEL_BELOW in crates/sim/src/jobs.rs. */
const REFUEL_BELOW = 20;

/** What a survivor is up to, in a few words. Shared with the roster cards. */
export function doing(c: ArrayLike<number>, frame?: Frame) {
  const activity = ACTIVITIES[c[3]];
  const smoky = !!frame && frame.smoke[c[1] * frame.width + c[0]] >= SMOKY;
  const job = c[11] >= 0 ? JOB_NAMES[c[11]] ?? 'working' : '';
  return activity === 'Dead' ? (CAUSES[c[12]] ?? 'Died').replace(/^\w/, (ch) => ch.toUpperCase())
    : c[13] === Item.Water && activity === 'Walking' ? 'Carrying water to a mushroom bed'
    : c[13] === Item.StockWater && activity === 'Walking' ? 'Carrying water to the cistern'
    : activity === 'Walking' && !job && !c[13] && c[C_THIRST] < STAT_MAX * 0.4 ? 'Going for a drink'
    : c[13] && activity === 'Walking' ? `Carrying ${ITEM_NAMES[c[13]]} to the stockpile`
    : activity === 'Walking' && job ? `Heading off ${job}`
    : activity === 'Working' && job ? `${job[0].toUpperCase()}${job.slice(1)}`
    : activity === 'Sleeping' ? 'Asleep'
    : activity === 'Idle' && smoky ? 'Coughing in the smoke'
    : activity === 'Idle' ? 'Warming up by the fire'
    : activity;
}

export function needBar(label: string, value: number, name: string) {
  const pct = Math.round((value / STAT_MAX) * 100);
  const level = pct < 25 ? 'bad' : pct < 50 ? 'low' : '';
  return `<div class="need ${level}" title="${label}: ${pct}%">${icon(name, 14)}<i><b style="width:${pct}%"></b></i></div>`;
}

export const NEEDS: [label: string, offset: number, icon: string][] = [
  ['Warmth', 4, 'warmth'], ['Energy', 5, 'energy'], ['Food', 6, 'food'], ['Thirst', C_THIRST, 'thirst'], ['Mood', 7, 'mood'], ['Sleep', 8, 'sleep'],
];

const seconds = (ticks: number, tps: number) => {
  const s = Math.ceil(ticks / tps);
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
};

const row = (label: string, value: string) => `<div class="row"><span>${label}</span><b>${value}</b></div>`;

export class Inspector {
  cell: [number, number] | undefined;
  /** The survivor the panel follows as they move, if it was opened on one. */
  private following: number | undefined;
  private readonly box = document.getElementById('inspect')!;
  private key = '';

  constructor(
    private tps: number,
    private send: (msg: ToWorker) => void,
    private onClose: () => void,
  ) {
    // One listener for the priority buttons, which are redrawn every frame.
    this.box.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!b || !this.cell) return;
      if (b.dataset.close !== undefined) return this.close();
      if (b.dataset.grate !== undefined) this.send({ type: 'command', tool: 'grate', x: this.cell[0], y: this.cell[1] });
      if (b.dataset.priority) this.send({ type: 'priority', x: this.cell[0], y: this.cell[1], priority: Number(b.dataset.priority) });
    });
  }

  /** Whether there is anything at (x, y) worth a panel. */
  has(f: Frame, x: number, y: number) {
    return this.survivorAt(f, x, y) >= 0 || f.buildings[y * f.width + x] !== Building.None || f.pileItem[y * f.width + x] !== 0 || this.jobAt(f, x, y) >= 0 || f.elements[y * f.width + x] !== Element.Floor;
  }

  open(x: number, y: number, f: Frame) {
    this.cell = [x, y];
    const who = this.survivorAt(f, x, y);
    this.following = who >= 0 ? who : undefined;
    this.key = '';
    this.update(f);
  }

  /** Open on survivor `i` and keep following them. */
  openSurvivor(i: number, f: Frame) {
    const o = i * COLONIST_STRIDE;
    this.open(f.colonists[o], f.colonists[o + 1], f);
    this.following = i;
    this.update(f);
  }

  close() {
    this.cell = undefined;
    this.following = undefined;
    this.box.hidden = true;
    this.onClose();
  }

  private survivorAt(f: Frame, x: number, y: number) {
    let dead = -1;
    for (let i = 0; i < f.colonists.length / COLONIST_STRIDE; i++) {
      const o = i * COLONIST_STRIDE;
      if (f.colonists[o] !== x || f.colonists[o + 1] !== y) continue;
      if (f.colonists[o + 3] !== 5) return i;
      dead = i;
    }
    return f.buildings[y * f.width + x] === Building.Cairn ? -1 : dead;
  }

  private jobAt(f: Frame, x: number, y: number) {
    for (let k = 0; k < f.jobs.length; k += JOB_STRIDE) if (f.jobs[k] === x && f.jobs[k + 1] === y) return k;
    return -1;
  }

  private priorityPicker(current: number, label: string) {
    const buttons = Array.from({ length: MAX_PRIORITY }, (_, k) => k + 1)
      .map((p) => `<button data-priority="${p}" class="${p === current ? 'active' : ''}" aria-label="Priority ${p}">${p}</button>`).join('');
    return `<div class="priority-pick"><span>${label}</span><div>${buttons}</div></div>`;
  }

  update(f: Frame) {
    if (!this.cell) return;
    if (this.following !== undefined) {
      const o = this.following * COLONIST_STRIDE;
      this.cell = [f.colonists[o], f.colonists[o + 1]];
    }
    const [x, y] = this.cell;
    const i = y * f.width + x;
    const b = f.buildings[i];
    const who = this.following ?? this.survivorAt(f, x, y);
    const k = this.jobAt(f, x, y);
    let title = '', glyph = 'view', status = '', body = '';

    if (who >= 0) {
      const c = f.colonists.subarray(who * COLONIST_STRIDE, (who + 1) * COLONIST_STRIDE);
      title = nameAt(f, who);
      glyph = 'people';
      status = `${ROLES[c[2]]} · ${doing(c)}${c[13] ? ` · carrying ${c[14]} ${ITEM_NAMES[c[13]]}` : ''}`;
      body = `<div class="needs">${NEEDS.map(([label, o, name]) => needBar(label, c[o], name)).join('')}</div>` +
        `<div class="traits">${traitChips(c[C_TRAITS])}</div><p class="note">${temperament(c)}</p>` +
        `<h4>Morale</h4>${moraleBlock(c)}` +
        `<h4>Skills</h4><div class="skills">${SKILLS.map((s, k) => `<div>${icon(s.icon, 14)}<span>${s.name}</span>${skillCell(c, k)}</div>`).join('')}</div>`;
    } else if (b === Building.Hearth) {
      const fuel = f.hearthFuel[i];
      const grate = !!f.hearthGrate[i];
      const coke = Math.min(f.hearthClean[i], fuel);
      const burn = grate ? GRATE_BURN_TICKS : HEARTH_BURN_TICKS;
      const reach = grate ? GRATE_RADIUS : 0;
      const lit = f.light[i] > 0 && fuel > 0;
      const fitting = this.jobAt(f, x, y) >= 0 && f.jobs[this.jobAt(f, x, y) + 2] === JOB_UPGRADE;
      title = grate ? 'Hearth with grate' : 'Hearth';
      glyph = 'hearth';
      status = !lit ? 'Out of fuel' : coke > 0 ? 'Burning coke: half the smoke' : 'Burning coal';
      const pct = Math.round((fuel / HEARTH_CAPACITY) * 100);
      // Smoke halves for the grate and again while coke burns.
      const smoke = ['Full', 'Half', 'A quarter'][(grate ? 1 : 0) + (coke > 0 ? 1 : 0)];
      body =
        `<div class="meter ${pct < 25 ? 'bad' : pct < 50 ? 'low' : ''}"><i><b style="width:${pct}%"></b></i></div>` +
        row('Fuel inside', `${fuel} of ${HEARTH_CAPACITY}${coke ? ` (${coke} from coke)` : ''}`) +
        row('Burns', `1 fuel every ${seconds(burn, this.tps)}`) +
        row('Goes out in', lit ? seconds(fuel * burn, this.tps) : 'now') +
        row('Warms', `${LIGHT_RADIUS_DAY + reach} cells by day, ${LIGHT_RADIUS_NIGHT + reach} at night`) +
        row('Smoke', smoke) +
        row('Stockpile', `${f.coal} coal${f.coke ? `, ${f.coke} coke` : ''}`) +
        row('Cooking', f.jobs.some((_, j) => j % JOB_STRIDE === 0 && f.jobs[j] === x && f.jobs[j + 1] === y && f.jobs[j + 2] === JOB_COOK) ? 'Mushrooms on the spit' : f.food < 2 ? 'Nothing to roast' : f.coal < 25 ? 'Saving coal for the fire' : 'Enough meals for now') +
        `<p class="note">A firekeeper tops it up once it drops below ${REFUEL_BELOW}, with coke first.${f.coal === 0 && f.coke === 0 ? ' <em>The stockpile is empty: dig coal.</em>' : ''}</p>` +
        (grate || !knows(f, 2) ? '' : fitting ? `<p class="note">A builder is fitting an iron grate.</p>`
          : `<button class="quiet grate" data-grate>${icon('grate', 14)}Fit an iron grate · ${GRATE_IRON} iron${f.iron < GRATE_IRON ? ` (have ${f.iron})` : ''}</button>`) +
        this.priorityPicker(f.refuelPriority[i] || DEFAULT_PRIORITY, 'Refuel priority');
    } else if (b === Building.CrystalLamp) {
      title = 'Crystal lamp'; glyph = 'crystal-lamp'; status = 'Lit';
      body = row('Lights', `${CRYSTAL_RADIUS_DAY} cells by day, ${CRYSTAL_RADIUS_NIGHT} at night`) + '<p class="note">Keeps Shades out of a long stretch. No warmth, like any lamp.</p>';
    } else if (b === Building.ResearchBench) {
      title = 'Research bench'; glyph = 'research';
      const t = f.researching;
      status = t >= 0 ? `Studying ${TECHS[t].name}` : 'Nothing picked to study';
      body = (t >= 0 ? row('Progress', `${f.researchPoints[t]} of ${TECHS[t].cost}`) : '') +
        row('Known', TECHS.filter((_, k) => knows(f, k)).map((tt) => tt.name).join(', ') || 'nothing yet') +
        '<p class="note">Pick a study with the Research button up top, or press R. Research waits behind more urgent orders, and a Researcher studies fastest.</p>';
    } else if (b === Building.CokeOven || b === Building.Smelter) {
      const oven = b === Building.CokeOven;
      const working = k >= 0 && f.jobs[k + 5] === 1;
      title = oven ? 'Coke oven' : 'Smelter'; glyph = oven ? 'coke' : 'iron';
      const full = oven ? f.coke >= COKE_KEEP : f.iron >= IRON_KEEP;
      const short = f.coal <= COAL_RESERVE + (oven ? 2 : 0) ? `Waiting: keeping ${COAL_RESERVE} coal for the fires` : !oven && f.ore < 2 ? 'Waiting for iron ore' : '';
      status = working ? (oven ? 'Baking coke' : 'Smelting') : full ? `Idle: ${oven ? COKE_KEEP + ' coke' : IRON_KEEP + ' iron'} in stock is enough` : short || 'Waiting for a firekeeper';
      body = (oven ? row('Makes', '2 coke from 3 coal') + row('Coke in stock', String(f.coke))
        : row('Makes', '1 iron from 2 ore and 1 coal') + row('Ore in stock', String(f.ore)) + row('Iron in stock', String(f.iron))) +
        row('Coal in stock', String(f.coal)) +
        `<p class="note">Runs itself while there is coal to spare, and never takes the stockpile below ${COAL_RESERVE} coal.</p>`;
    } else if (b === Building.Lamp) {
      title = 'Lamp'; glyph = 'lamp'; status = 'Lit';
      body = row('Lights', `${LAMP_RADIUS_DAY} cells by day, ${LAMP_RADIUS_NIGHT} at night`) + '<p class="note">Keeps Shades out. Gives no warmth, so survivors still cool down slowly here.</p>';
    } else if (b === Building.Bed) {
      let sleeper = -1;
      for (let s = 0; s < f.colonists.length / COLONIST_STRIDE; s++) {
        const o = s * COLONIST_STRIDE;
        if (f.colonists[o] === x && f.colonists[o + 1] === y && f.colonists[o + 3] === 3) sleeper = s;
      }
      title = 'Bed'; glyph = 'bed';
      status = sleeper >= 0 ? `${nameAt(f, sleeper)} is asleep` : 'Free';
      body = row('Light', f.light[i] >= DARK_BELOW ? 'Lit: best sleep' : 'Dark: poor sleep') + '<p class="note">A spare bed is what lets a refugee join.</p>';
    } else if (b === Building.MushroomBed) {
      const growing = f.firelight[i] < DARK_BELOW;
      const water = f.bedWater[i] & ~BED_SELF_WATERING, selfWatering = (f.bedWater[i] & BED_SELF_WATERING) !== 0;
      title = 'Mushroom bed'; glyph = 'mushroom';
      status = growing ? (water > 0 ? 'Growing, watered' : 'Growing') : 'Too close to the fire to grow';
      body = row('Grows', `${water > 0 ? 2 : 1} ration${water > 0 ? 's' : ''} every ${seconds(MUSHROOM_TICKS, this.tps)}`) +
        row('Water', selfWatering ? 'Self-watering: a pool is close' : `${Math.round((water / WATER_MAX) * 100)}%${water < WATER_LOW ? ' (a survivor will fetch some)' : ''}`) + row('Light', f.light[i] >= DARK_BELOW ? 'Lamp lit: safe from Shades' : 'Dark: Shades can reach it') +
        (growing ? '' : '<p class="note"><em>Mushrooms shun firelight. Move it further from the hearth.</em></p>');
    } else if (b === Building.Stockpile) {
      const loose: Record<number, number> = {};
      for (let j = 0; j < f.pileItem.length; j++) if (f.pileItem[j]) loose[f.pileItem[j]] = (loose[f.pileItem[j]] ?? 0) + f.pileAmount[j];
      title = 'Stockpile'; glyph = 'stockpile'; status = 'Where hauled goods are kept';
      body = row('Coal in stock', String(f.coal)) + row('Stone in stock', String(f.stone)) + row('Food in stock', `${f.food} raw, ${f.meals} roast`) +
        row('Still lying about', Object.keys(loose).length ? Object.entries(loose).map(([k, n]) => `${n} ${ITEM_NAMES[Number(k)]}`).join(', ') : 'nothing') +
        '<p class="note">Dug goods only count once a survivor carries them here. Haulers wait for dawn before fetching from the dark.</p>';
    } else if (b === Building.WaterBarrel || b === Building.Cistern) {
      const cap = TANK_CAPACITY[b], held = f.waterStore[i];
      const barrel = b === Building.WaterBarrel;
      const pct = Math.round((held / cap) * 100);
      title = barrel ? 'Water barrel' : 'Cistern'; glyph = barrel ? 'water' : 'cistern';
      status = held === 0 ? 'Empty' : held >= cap ? 'Full' : `${pct}% full`;
      const drinks = Math.floor(f.waterStock / DRINK_UNITS);
      body = `<div class="meter ${pct < 25 ? 'bad' : pct < 50 ? 'low' : ''}"><i><b style="width:${pct}%"></b></i></div>` +
        row('Stored', `${held} of ${cap}`) +
        row('Colony stock', `${f.waterStock} of ${f.waterCapacity} (${drinks} drink${drinks === 1 ? '' : 's'})`) +
        row('Drinking', `${f.waterPerDay} a day for everyone`) +
        `<p class="note">${barrel ? 'The start cave\'s supply, enough for about three days. It cannot be moved.' : 'From day 2 a hauler fills a bucket at a pool they can reach and carries it here.'} Survivors drink ${DRINK_UNITS} units from the nearest tank.</p>`;
    } else if (b === Building.DripCatcher) {
      const dry = f.waterDevices[i] === DRIP_DRY, held = f.dripHeld[i];
      title = 'Drip catcher'; glyph = 'water';
      status = dry ? 'Dry' : 'Dripping';
      body = row('Yield', dry ? 'None' : `1 unit every ${seconds(DRIP_TICKS, this.tps)} (${Math.round((DAY_TICKS / DRIP_TICKS) * 10) / 10} a day)`) +
        (dry ? row('Why', '<em>No wet rock above.</em>') : '') +
        row('Holding', held ? `${held} of ${DRIP_HOLD} (the tanks are full)` : 'nothing: it goes to the tanks') +
        `<p class="note">Wet rock is rock touching water, within ${DRIP_REACH} cells overhead. A catcher sends what it collects to the first tank with room, and keeps up to ${DRIP_HOLD} itself while they are full.</p>`;
    } else if (b === Building.HandPump) {
      const state = f.waterDevices[i], busy = k >= 0 && f.jobs[k + 2] === JOB_PUMP && f.jobs[k + 5] === 1;
      title = 'Hand pump'; glyph = 'water';
      status = busy ? 'Being worked'
        : state === PUMP_READY ? 'Ready: waiting for a free hand'
        : state === PUMP_NO_WATER ? 'Idle: no water in the pool beside it'
        : state === PUMP_NO_TANK ? `Idle: no cistern or barrel within ${PUMP_REACH} cells`
        : state === PUMP_TANKS_FULL ? 'Idle: the tanks beside it are full' : '';
      body = row('Rate', `up to ${PUMP_STINT} units a stint, with no walking`) +
        row('Colony stock', `${f.waterStock} of ${f.waterCapacity}`) +
        '<p class="note">A hauler works it while the tanks have room and the pool has water, in the light only. It really draws the pool down.</p>';
    } else if (f.pileItem[i] && who < 0) {
      const what = ITEM_NAMES[f.pileItem[i]];
      const waiting = f.night && f.light[i] < DARK_BELOW;
      title = `Pile of ${what}`; glyph = ({ [Item.Coal]: 'coal', [Item.Ore]: 'ore', [Item.Crystal]: 'crystal' } as Record<number, string>)[f.pileItem[i]] ?? 'stone';
      status = !f.buildings.includes(Building.Stockpile) ? 'No stockpile to take it to' : waiting ? 'In the dark: it waits for dawn' : 'Waiting for a hauler';
      body = row('Amount', `${f.pileAmount[i]} ${what}`) + row('Trips', String(Math.ceil(f.pileAmount[i] / CARRY_MAX)));
    } else if (b === Building.Ladder) {
      title = 'Ladder'; glyph = 'ladder'; status = 'Survivors climb it';
    } else if (b === Building.Door || (y + 1 < f.height && f.buildings[i + f.width] === Building.Door)) {
      const base = b === Building.Door ? i : i + f.width;
      let inDoor = false;
      for (let s = 0; s < f.colonists.length; s += COLONIST_STRIDE) {
        const at = f.colonists[s + 1] * f.width + f.colonists[s];
        if ((at === base || at === base - f.width) && f.colonists[s + 3] !== 5) inDoor = true;
      }
      title = 'Door'; glyph = 'door'; status = inDoor ? 'Open: someone is in the doorway' : 'Closed';
      const sides = [base - 1, base + 1].filter((c) => c >= 0 && c < f.rooms.length).map((c) => f.rooms[c]).filter((r) => r !== ROOM_NONE);
      body = row('Lets through', 'Survivors only. Smoke and Shades stay out.') +
        row('Closes off', sides.length ? sides.map((r) => ROOM_NAMES[r]).join(' and ') : 'nothing yet') +
        (sides.length ? '' : `<p class="note">Wall off a space of up to ${ROOM_MAX_CELLS} cells on one side of it to make a room.</p>`);
    } else if (b === Building.Cairn) {
      let dead = -1;
      for (let s = 0; s < f.colonists.length / COLONIST_STRIDE; s++) {
        const o = s * COLONIST_STRIDE;
        if (f.colonists[o] === x && f.colonists[o + 1] === y && f.colonists[o + 3] === 5) dead = s;
      }
      title = 'Cairn'; glyph = 'skull';
      status = dead >= 0 ? `${nameAt(f, dead)} ${CAUSES[f.colonists[dead * COLONIST_STRIDE + 12]] ?? 'died'} here` : 'Someone fell here';
    } else {
      const e = f.elements[i];
      const what: Record<number, [string, string, string]> = {
        [Element.Coal]: ['Coal seam', 'coal', 'Digging it gives 4 coal.'],
        [Element.Rock]: ['Rock', 'stone', 'Digging it gives 3 stone.'],
        [Element.Dirt]: ['Dirt', 'stone', 'Digging it gives 1 stone.'],
        [Element.Iron]: ['Iron ore', 'ore', 'Digging it gives 2 iron ore, for a smelter.'],
        [Element.Crystal]: ['Crystal', 'crystal', 'Digging it gives 1 crystal, for a crystal lamp.'],
        [Element.Water]: ['Water', 'depth', 'Flows down and pools. Survivors can\'t walk through it, but drink at its edge, and buckets draw from it.'],
        [Element.Tile]: ['Stone tile', 'tile', 'Laid by survivors. Dig it to take it down and get the stone back.'],
      };
      const w = what[e];
      if (w) [title, glyph, status] = w;
      else if (k >= 0) [title, glyph] = ['Order', 'dig'];
      else return this.close();
    }

    const room = f.rooms[i];
    if (room !== ROOM_NONE && b !== Building.Door) {
      body += `<h4>${ROOM_NAMES[room]}</h4><p class="note">${ROOM_EFFECTS[room]}</p>`;
    }

    if (k >= 0 && who < 0 && f.jobs[k + 2] !== JOB_REFUEL && f.jobs[k + 2] !== JOB_WATER && f.jobs[k + 2] !== JOB_FETCH && f.jobs[k + 2] !== JOB_PUMP && f.jobs[k + 2] !== JOB_COOK && !(b === Building.CokeOven || b === Building.Smelter)) {
      const [kind, , progress, claimed, priority, blocked] = [f.jobs[k + 2], f.jobs[k + 3], f.jobs[k + 4], f.jobs[k + 5], f.jobs[k + 6], f.jobs[k + 7]];
      const name = JOB_NAMES[kind];
      body += `<h4>Order: ${name}</h4>` +
        row('Progress', `${progress}%`) +
        row('Status', blocked ? `<em>Stuck: ${BLOCK_REASONS[blocked]}</em>` : claimed ? 'Someone is on it' : 'Waiting for a free hand') +
        this.priorityPicker(priority, 'Priority');
    }

    const html = `<header>${icon(glyph, 18)}<b>${title}</b><button class="close" data-close aria-label="Close">${icon('cancel', 14)}</button></header>` +
      (status ? `<p class="status">${status}</p>` : '') + body;
    // Only touch the DOM when something changed, so buttons stay clickable.
    if (html !== this.key) {
      this.key = html;
      this.box.innerHTML = html;
    }
    this.box.hidden = false;
  }
}
