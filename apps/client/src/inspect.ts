// The inspect panel: click a hearth, a building, a survivor or a seam to see
// what it is doing and why. It reads every frame, so the numbers stay live.

import {
  ACTIVITIES, BLOCK_REASONS, Building, CAUSES, COLONIST_STRIDE, DARK_BELOW, DEFAULT_PRIORITY, Element, HEARTH_BURN_TICKS, HEARTH_CAPACITY, JOB_NAMES, JOB_REFUEL, JOB_STRIDE,
  CARRY_MAX, ITEM_NAMES, Item, LAMP_RADIUS_DAY, LAMP_RADIUS_NIGHT, LIGHT_RADIUS_DAY, LIGHT_RADIUS_NIGHT, MAX_PRIORITY, MUSHROOM_TICKS, ROLES, SMOKY, STAT_MAX, type Frame, type ToWorker,
} from './protocol';
import { icon } from './icons';

/** Firekeepers top a hearth up below this; must match REFUEL_BELOW in crates/sim/src/jobs.rs. */
const REFUEL_BELOW = 20;

/** What a survivor is up to, in a few words. Shared with the roster cards. */
export function doing(c: ArrayLike<number>, frame?: Frame) {
  const activity = ACTIVITIES[c[3]];
  const smoky = !!frame && frame.smoke[c[1] * frame.width + c[0]] >= SMOKY;
  const job = c[11] >= 0 ? JOB_NAMES[c[11]] : '';
  return activity === 'Dead' ? (CAUSES[c[12]] ?? 'Died').replace(/^\w/, (ch) => ch.toUpperCase())
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
  ['Warmth', 4, 'warmth'], ['Energy', 5, 'energy'], ['Food', 6, 'food'], ['Mood', 7, 'mood'], ['Sleep', 8, 'sleep'],
];

const seconds = (ticks: number, tps: number) => {
  const s = Math.ceil(ticks / tps);
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`;
};

const row = (label: string, value: string) => `<div class="row"><span>${label}</span><b>${value}</b></div>`;

export class Inspector {
  cell: [number, number] | undefined;
  private readonly box = document.getElementById('inspect')!;
  private key = '';

  constructor(
    private names: string[],
    private tps: number,
    private send: (msg: ToWorker) => void,
    private onClose: () => void,
  ) {
    // One listener for the priority buttons, which are redrawn every frame.
    this.box.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!b || !this.cell) return;
      if (b.dataset.close !== undefined) return this.close();
      if (b.dataset.priority) this.send({ type: 'priority', x: this.cell[0], y: this.cell[1], priority: Number(b.dataset.priority) });
    });
  }

  /** Whether there is anything at (x, y) worth a panel. */
  has(f: Frame, x: number, y: number) {
    return this.survivorAt(f, x, y) >= 0 || f.buildings[y * f.width + x] !== Building.None || f.pileItem[y * f.width + x] !== 0 || this.jobAt(f, x, y) >= 0 || f.elements[y * f.width + x] !== Element.Floor;
  }

  open(x: number, y: number, f: Frame) {
    this.cell = [x, y];
    this.key = '';
    this.update(f);
  }

  close() {
    this.cell = undefined;
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
    const [x, y] = this.cell;
    const i = y * f.width + x;
    const b = f.buildings[i];
    const who = this.survivorAt(f, x, y);
    const k = this.jobAt(f, x, y);
    let title = '', glyph = 'view', status = '', body = '';

    if (who >= 0) {
      const c = f.colonists.subarray(who * COLONIST_STRIDE, (who + 1) * COLONIST_STRIDE);
      title = this.names[who % this.names.length];
      glyph = 'people';
      status = `${ROLES[c[2]]} · ${doing(c)}${c[13] ? ` · carrying ${c[14]} ${ITEM_NAMES[c[13]]}` : ''}`;
      body = `<div class="needs">${NEEDS.map(([label, o, name]) => needBar(label, c[o], name)).join('')}</div>` +
        NEEDS.map(([label, o]) => row(label, `${Math.round((c[o] / STAT_MAX) * 100)}%`)).join('');
    } else if (b === Building.Hearth) {
      const fuel = f.hearthFuel[i];
      const lit = f.light[i] > 0 && fuel > 0;
      title = 'Hearth';
      glyph = 'hearth';
      status = lit ? 'Burning' : 'Out of coal';
      const pct = Math.round((fuel / HEARTH_CAPACITY) * 100);
      body =
        `<div class="meter ${pct < 25 ? 'bad' : pct < 50 ? 'low' : ''}"><i><b style="width:${pct}%"></b></i></div>` +
        row('Coal inside', `${fuel} of ${HEARTH_CAPACITY}`) +
        row('Burns', `1 coal every ${seconds(HEARTH_BURN_TICKS, this.tps)}`) +
        row('Goes out in', lit ? seconds(fuel * HEARTH_BURN_TICKS, this.tps) : 'now') +
        row('Warms', `${LIGHT_RADIUS_DAY} cells by day, ${LIGHT_RADIUS_NIGHT} at night`) +
        row('Stockpile', `${f.coal} coal`) +
        `<p class="note">A firekeeper tops it up once it drops below ${REFUEL_BELOW}.${f.coal === 0 ? ' <em>The stockpile is empty: dig coal.</em>' : ''}</p>` +
        this.priorityPicker(f.refuelPriority[i] || DEFAULT_PRIORITY, 'Refuel priority');
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
      status = sleeper >= 0 ? `${this.names[sleeper % this.names.length]} is asleep` : 'Free';
      body = row('Light', f.light[i] >= DARK_BELOW ? 'Lit: best sleep' : 'Dark: poor sleep') + '<p class="note">A spare bed is what lets a refugee join.</p>';
    } else if (b === Building.MushroomBed) {
      const growing = f.firelight[i] < DARK_BELOW;
      title = 'Mushroom bed'; glyph = 'mushroom';
      status = growing ? 'Growing' : 'Too close to the fire to grow';
      body = row('Grows', `1 ration every ${seconds(MUSHROOM_TICKS, this.tps)}`) + row('Light', f.light[i] >= DARK_BELOW ? 'Lamp lit: safe from Shades' : 'Dark: Shades can reach it') +
        (growing ? '' : '<p class="note"><em>Mushrooms shun firelight. Move it further from the hearth.</em></p>');
    } else if (b === Building.Stockpile) {
      const loose: Record<number, number> = {};
      for (let j = 0; j < f.pileItem.length; j++) if (f.pileItem[j]) loose[f.pileItem[j]] = (loose[f.pileItem[j]] ?? 0) + f.pileAmount[j];
      title = 'Stockpile'; glyph = 'stockpile'; status = 'Where hauled goods are kept';
      body = row('Coal in stock', String(f.coal)) + row('Stone in stock', String(f.stone)) + row('Food in stock', String(f.food)) +
        row('Still lying about', Object.keys(loose).length ? Object.entries(loose).map(([k, n]) => `${n} ${ITEM_NAMES[Number(k)]}`).join(', ') : 'nothing') +
        '<p class="note">Dug goods only count once a survivor carries them here. Haulers wait for dawn before fetching from the dark.</p>';
    } else if (f.pileItem[i] && who < 0) {
      const what = ITEM_NAMES[f.pileItem[i]];
      const waiting = f.night && f.light[i] < DARK_BELOW;
      title = `Pile of ${what}`; glyph = f.pileItem[i] === Item.Coal ? 'coal' : 'stone';
      status = !f.buildings.includes(Building.Stockpile) ? 'No stockpile to take it to' : waiting ? 'In the dark: it waits for dawn' : 'Waiting for a hauler';
      body = row('Amount', `${f.pileAmount[i]} ${what}`) + row('Trips', String(Math.ceil(f.pileAmount[i] / CARRY_MAX)));
    } else if (b === Building.Ladder) {
      title = 'Ladder'; glyph = 'ladder'; status = 'Survivors climb it';
    } else if (b === Building.Cairn) {
      let dead = -1;
      for (let s = 0; s < f.colonists.length / COLONIST_STRIDE; s++) {
        const o = s * COLONIST_STRIDE;
        if (f.colonists[o] === x && f.colonists[o + 1] === y && f.colonists[o + 3] === 5) dead = s;
      }
      title = 'Cairn'; glyph = 'skull';
      status = dead >= 0 ? `${this.names[dead % this.names.length]} ${CAUSES[f.colonists[dead * COLONIST_STRIDE + 12]] ?? 'died'} here` : 'Someone fell here';
    } else {
      const e = f.elements[i];
      const what: Record<number, [string, string, string]> = {
        [Element.Coal]: ['Coal seam', 'coal', 'Digging it gives 4 coal.'],
        [Element.Rock]: ['Rock', 'stone', 'Digging it gives 3 stone.'],
        [Element.Dirt]: ['Dirt', 'stone', 'Digging it gives 1 stone.'],
        [Element.Water]: ['Water', 'depth', 'Flows down and pools. Survivors can\'t walk through it.'],
      };
      const w = what[e];
      if (w) [title, glyph, status] = w;
      else if (k >= 0) [title, glyph] = ['Order', 'dig'];
      else return this.close();
    }

    if (k >= 0 && who < 0 && f.jobs[k + 2] !== JOB_REFUEL) {
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
