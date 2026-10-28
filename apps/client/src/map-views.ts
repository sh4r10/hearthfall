// The map views (warmth and air) and when the player gets them. Each view
// answers one question the player has to decide on, its legend says what the
// colours mean and what they mean for the colony right now, and a view only
// shows up in the toolbar once its question starts to matter.

import type { Overlay } from './world-view';
import {
  Building, COLONIST_STRIDE, DARK_BELOW, DAY_TICKS, Element, HEARTH_BURN_TICKS, STAT_MAX, type Frame,
} from './protocol';
import { STALE_BELOW_MG } from './overlay-shader';
import { icon } from './icons';

export interface MapView { overlay: Exclude<Overlay, 'none'>; key: string; label: string; icon: string; tip: string }

export const MAP_VIEWS: MapView[] = [
  { overlay: 'warmth', key: 'W', label: 'Warmth', icon: 'heat', tip: 'Where survivors stay warm, where Shades can reach, and how far the fire will reach tonight.' },
  { overlay: 'air', key: 'O', label: 'Air', icon: 'oxygen', tip: 'Where the air is going stale. Fires and breathing use it up, and smoke sinks into low rooms.' },
];

const swatch = (cls: string, text: string) => `<li><i class="swatch ${cls}"></i><span>${text}</span></li>`;

const LEGENDS: Record<MapView['overlay'], (night: boolean) => string> = {
  warmth: (night) =>
    swatch('fire', '<b>Firelight.</b> Survivors warm up.') +
    swatch('lamp', '<b>Lamp light.</b> Shades keep out, but it is cold.') +
    swatch('dark', '<b>Dark.</b> Survivors freeze, and Shades hunt at night.') +
    (night ? '' : swatch('shrink', '<b>Goes cold tonight.</b> The fire reaches less far after dark.')) +
    swatch('coal', '<b>Coal.</b> Dig it to keep the fire going.'),
  air: () =>
    swatch('fresh', '<b>Fresh air.</b>') +
    swatch('stale', '<b>Stale.</b> Something is using it up faster than it spreads.') +
    swatch('bad', '<b>Unbreathable.</b> Survivors suffocate and fires go out.'),
};

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const list = (names: string[]) => names.length < 3 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;

export class MapViews {
  /** Which views the player has been given this run. */
  private open = new Set<MapView['overlay']>(['warmth']);
  private opened = new Set<Overlay>();
  private nudged = false;
  private fuelWarned = false;
  private legend = document.getElementById('legend')!;
  private legendFor?: string;

  constructor(
    private names: readonly string[],
    /** Puts one line in the event log. */
    private notice: (html: string, glyph: string, tone: 'info' | 'warn') => void,
  ) {}

  isOpen(o: Overlay) {
    return o === 'none' || this.open.has(o);
  }

  /** Call when the player switches view. */
  shown(o: Overlay) {
    this.opened.add(o);
    document.querySelector(`[data-overlay="${o}"]`)?.classList.remove('nudge');
  }

  update(frame: Frame, overlay: Overlay) {
    this.progress(frame);
    this.warnFuel(frame);
    this.renderLegend(frame, overlay);
  }

  private reveal(o: MapView['overlay'], tool?: string) {
    this.open.add(o);
    for (const el of [document.querySelector(`[data-overlay="${o}"]`), tool && document.querySelector(`[data-tool="${tool}"]`)]) {
      if (!(el instanceof HTMLElement)) continue;
      el.hidden = false;
      el.classList.add('reveal', 'nudge');
    }
  }

  private progress(frame: Frame) {
    // Before the first night, point at the warmth view: it shows how far the fire will reach in the dark.
    const into = frame.tick % DAY_TICKS;
    const nightAt = (DAY_TICKS * 6) / 10;
    if (!this.nudged && !frame.night && frame.tick < DAY_TICKS && nightAt - into < 400) {
      this.nudged = true;
      if (!this.opened.has('warmth')) {
        document.querySelector('[data-overlay="warmth"]')?.classList.add('nudge');
        this.notice('Night is coming, and the fire reaches less far in the dark. Press <b>W</b> to see where it will stay warm.', 'moon', 'info');
      }
    }

    // Air only matters once something is using it up: give the view (and the diffuser) then.
    if (!this.open.has('air') && this.airTrouble(frame)) {
      this.reveal('air', 'diffuser');
      this.notice('The air near the fire is going stale. The <b>Air</b> view (O) and the <b>Oxygen</b> diffuser are now open.', 'oxygen', 'warn');
    }
  }

  /** Someone short of breath, or stale air where the colony lives. */
  private airTrouble(frame: Frame) {
    for (let i = 0; i < frame.colonists.length; i += COLONIST_STRIDE) {
      if (frame.colonists[i + 3] !== 5 && frame.colonists[i + 4] < STAT_MAX * 0.9) return true;
    }
    for (let c = 0; c < frame.elements.length; c++) {
      if (frame.elements[c] === Element.Floor && frame.light[c] >= DARK_BELOW && frame.oxygen[c] < STALE_BELOW_MG) return true;
    }
    return false;
  }

  /** One warning when a fire is about to run dry with nothing in the stockpile to refill it. */
  private warnFuel(frame: Frame) {
    if (frame.coal > 0) { this.fuelWarned = false; return; }
    if (this.fuelWarned) return;
    for (let c = 0; c < frame.buildings.length; c++) {
      if (frame.buildings[c] !== Building.Hearth) continue;
      const fuel = frame.hearthFuel[c];
      const seconds = Math.round((fuel * HEARTH_BURN_TICKS) / 10);
      if (fuel > 0 && seconds <= 45) {
        this.fuelWarned = true;
        this.notice(`A fire has about <b>${seconds} s</b> of coal left and the stockpile is empty. <b>Dig coal</b> now.`, 'coal', 'warn');
        return;
      }
    }
  }

  private renderLegend(frame: Frame, overlay: Overlay) {
    if (overlay === 'none') {
      this.legend.hidden = true;
      this.legendFor = undefined;
      return;
    }
    const view = MAP_VIEWS.find((v) => v.overlay === overlay)!;
    const key = `${overlay}:${frame.night}`;
    if (this.legendFor !== key) {
      this.legendFor = key;
      this.legend.innerHTML =
        `<header>${icon(view.icon, 16)}<b>${view.label}</b><kbd>${view.key}</kbd></header>` +
        `<ul>${LEGENDS[view.overlay](frame.night)}</ul><p class="verdict"></p>`;
    }
    this.legend.hidden = false;
    const [text, tone] = overlay === 'warmth' ? this.warmthVerdict(frame) : this.airVerdict(frame);
    const p = this.legend.querySelector('.verdict')!;
    if (p.innerHTML !== text) p.innerHTML = text;
    p.className = `verdict ${tone}`;
  }

  /** What the warmth map means right now: who is out in the cold, and what tonight takes away. */
  private warmthVerdict(f: Frame): [string, string] {
    const cold: string[] = [], losing: string[] = [];
    for (let k = 0, i = 0; i < f.colonists.length; i += COLONIST_STRIDE, k++) {
      if (f.colonists[i + 3] === 5) continue;
      const c = f.colonists[i + 1] * f.width + f.colonists[i];
      if (f.firelight[c] < DARK_BELOW) cold.push(this.names[k % this.names.length]);
      else if (!f.night && f.nightFirelight[c] < DARK_BELOW) losing.push(this.names[k % this.names.length]);
    }
    if (f.night) {
      return cold.length ? [`<b>${list(cold)}</b> ${cold.length === 1 ? 'is' : 'are'} out of the firelight.`, 'warn'] : ['Everyone is in the firelight.', ''];
    }
    let now = 0, tonight = 0, beds = 0;
    for (let c = 0; c < f.firelight.length; c++) {
      if (f.elements[c] !== Element.Floor) continue;
      if (f.firelight[c] >= DARK_BELOW) now++;
      if (f.nightFirelight[c] >= DARK_BELOW) tonight++;
      if (f.buildings[c] === Building.Bed && f.firelight[c] >= DARK_BELOW && f.nightFirelight[c] < DARK_BELOW) beds++;
    }
    const lines: string[] = [];
    if (now > 0) lines.push(`Tonight the warm area shrinks by <b>${Math.round((1 - tonight / now) * 100)}%</b>.`);
    else lines.push('<b>No fire is lit.</b> Nowhere is warm.');
    const atRisk = [losing.length ? `${list(losing)} ${losing.length === 1 ? 'is' : 'are'} standing` : '', beds ? `${plural(beds, 'bed is', 'beds are')}` : '']
      .filter(Boolean);
    if (atRisk.length) lines.push(`${atRisk.join(', and ')} where it goes cold.`);
    if (cold.length) lines.push(`<b>${list(cold)}</b> ${cold.length === 1 ? 'is' : 'are'} in the cold now.`);
    return [lines.join(' '), cold.length || atRisk.length ? 'warn' : ''];
  }

  /** What the air map means right now: who can't breathe, and whether a fire is choking. */
  private airVerdict(f: Frame): [string, string] {
    const short: string[] = [];
    for (let k = 0, i = 0; i < f.colonists.length; i += COLONIST_STRIDE, k++) {
      if (f.colonists[i + 3] === 5) continue;
      const c = f.colonists[i + 1] * f.width + f.colonists[i];
      if (f.oxygen[c] < STALE_BELOW_MG) short.push(this.names[k % this.names.length]);
    }
    let choking = 0;
    for (let c = 0; c < f.buildings.length; c++) if (f.buildings[c] === Building.Hearth && f.oxygen[c] < STALE_BELOW_MG) choking++;
    const lines: string[] = [];
    if (short.length) lines.push(`<b>${list(short)}</b> ${short.length === 1 ? 'is' : 'are'} in stale air.`);
    if (choking) lines.push(`${choking === 1 ? 'A fire is' : `${choking} fires are`} running short of air.`);
    if (!lines.length) return ['Everyone can breathe. Watch sealed rooms with a fire in them.', ''];
    lines.push('Dig an opening to fresh caves, or build an <b>Oxygen</b> diffuser.');
    return [lines.join(' '), 'warn'];
  }
}
