// Colony management controls: game speed, order priorities and the alert for
// orders that are stuck. Kept apart from main.ts so each stays readable.

import { BLOCK_NONE, BLOCK_REASONS, Building, DEFAULT_PRIORITY, JOB_BUILD, JOB_DECONSTRUCT, JOB_DIG, JOB_HAUL, JOB_REFUEL, JOB_STRIDE, MAX_PRIORITY, type Frame, type ToWorker } from './protocol';
import { icon } from './icons';
import type { WorldView } from './world-view';

const $ = (id: string) => document.getElementById(id)!;

// --- Game speed ----------------------------------------------------------------

export const SPEEDS = [0, 1, 2, 3] as const;

/** Pause and 1x, 2x, 3x in the top bar. Space pauses and resumes, shift-1 to 3 picks a speed. */
export class SpeedControl {
  speed = 1;
  private resume = 1;
  private readonly box = $('speed');

  constructor(private send: (msg: ToWorker) => void) {
    this.box.innerHTML = SPEEDS.map((s) => {
      const tip = s === 0 ? '<b>Pause</b>Stop the clock. You can still give orders. <kbd>Space</kbd>' : `<b>${s}× speed</b>${s === 1 ? 'Normal pace.' : `Time runs ${s === 2 ? 'twice' : 'three times'} as fast.`} <kbd>Shift ${s}</kbd>`;
      return `<button data-speed="${s}" data-tip="${tip}" aria-label="${s === 0 ? 'Pause' : `${s}x speed`}">${s === 0 ? icon('pause', 14) : `${s}×`}</button>`;
    }).join('');
    this.box.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((b) => (b.onclick = () => this.set(Number(b.dataset.speed))));
    this.show();
  }

  set(speed: number) {
    if (speed === this.speed) return;
    if (speed > 0) this.resume = speed;
    this.speed = speed;
    this.send({ type: 'speed', speed });
    this.show();
  }

  toggle() {
    this.set(this.speed === 0 ? this.resume : 0);
  }

  /** Space and shift-1, 2, 3. Returns true if it used the key. */
  key(e: KeyboardEvent) {
    if (e.code === 'Space') {
      this.toggle();
      return true;
    }
    const n = e.shiftKey ? ['Digit1', 'Digit2', 'Digit3'].indexOf(e.code) + 1 : 0;
    if (n > 0) this.set(n);
    return n > 0;
  }

  private show() {
    this.box.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach((b) => b.classList.toggle('active', Number(b.dataset.speed) === this.speed));
    document.body.classList.toggle('paused', this.speed === 0);
  }
}

// --- Priority brush ---------------------------------------------------------------

/** The 1 to 9 strip above the toolbar while the Priority tool is out. */
export class PriorityBrush {
  level = 7;
  private readonly strip = $('priority-strip');

  constructor() {
    this.strip.innerHTML =
      `<span class="strip-label">Priority</span>` +
      Array.from({ length: MAX_PRIORITY }, (_, k) => {
        const p = k + 1;
        const word = p === MAX_PRIORITY ? 'Urgent' : p === 1 ? 'Whenever' : p === DEFAULT_PRIORITY ? 'Normal' : '';
        return `<button data-priority="${p}" aria-label="Priority ${p}${word ? `, ${word}` : ''}" class="p${p}">${p}</button>`;
      }).join('') +
      `<span class="strip-hint">1 whenever · 5 normal · 9 urgent</span>`;
    this.strip.querySelectorAll<HTMLButtonElement>('[data-priority]').forEach((b) => (b.onclick = () => this.set(Number(b.dataset.priority))));
    this.set(this.level);
  }

  set(level: number) {
    this.level = Math.min(Math.max(level, 1), MAX_PRIORITY);
    this.strip.querySelectorAll<HTMLButtonElement>('[data-priority]').forEach((b) => b.classList.toggle('active', Number(b.dataset.priority) === this.level));
  }

  shown(on: boolean) {
    this.strip.hidden = !on;
  }
}

// --- Stuck orders --------------------------------------------------------------------

const BUILDING_WORDS: Record<number, string> = {
  [Building.Stockpile]: 'stockpile', [Building.Ladder]: 'ladder', [Building.Hearth]: 'hearth',
  [Building.MushroomBed]: 'mushroom bed', [Building.Lamp]: 'lamp', [Building.Bed]: 'bed',
};

function orderName(kind: number, building: number) {
  const thing = BUILDING_WORDS[building] ?? 'building';
  if (kind === JOB_DIG) return 'A dig';
  if (kind === JOB_BUILD) return `A ${thing}`;
  if (kind === JOB_REFUEL) return 'A hearth';
  if (kind === JOB_HAUL) return 'A pile';
  if (kind === JOB_DECONSTRUCT) return `Taking down a ${thing}`;
  return 'An order';
}

/**
 * A top-bar chip that appears when orders can't go ahead. Clicking it jumps
 * the camera to the next stuck order and says why that one is stuck.
 */
export class StuckOrders {
  private readonly chip = $('stuck');
  private next = 0;
  private focused: string | undefined;
  private stuck: { x: number; y: number; kind: number; building: number; reason: number }[] = [];

  constructor(private world: WorldView, private onJump: (x: number, y: number) => void) {
    this.chip.onclick = () => this.jump();
  }

  update(frame: Frame) {
    this.stuck = [];
    for (let k = 0; k < frame.jobs.length; k += JOB_STRIDE) {
      const reason = frame.jobs[k + 7];
      if (reason !== BLOCK_NONE) this.stuck.push({ x: frame.jobs[k], y: frame.jobs[k + 1], kind: frame.jobs[k + 2], building: frame.jobs[k + 3], reason });
    }
    if (!this.stuck.length) {
      this.chip.hidden = true;
      this.focused = undefined;
      return;
    }
    const counts = new Map<number, number>();
    for (const s of this.stuck) counts.set(s.reason, (counts.get(s.reason) ?? 0) + 1);
    const breakdown = [...counts].sort((a, b) => b[1] - a[1]);
    const n = this.stuck.length;
    const focus = this.focused ? this.stuck.find((s) => `${s.x},${s.y}` === this.focused) : undefined;
    const line = focus
      ? `${orderName(focus.kind, focus.building)} ${BLOCK_REASONS[focus.reason]}`
      : breakdown.length === 1 ? `${breakdown[0][1] === 1 ? 'It' : 'All'} ${BLOCK_REASONS[breakdown[0][0]]}` : `${breakdown[0][1]} ${BLOCK_REASONS[breakdown[0][0]]}`;
    this.chip.innerHTML = `${icon('alert', 16)}<div><b>${n} order${n === 1 ? '' : 's'} stuck</b><span>${line}</span></div>`;
    this.chip.dataset.tip = `<b>Stuck orders</b>${breakdown.map(([r, c]) => `${c} ${BLOCK_REASONS[r]}`).join('<br>')}<em>Click to look at the next one.</em>`;
    this.chip.hidden = false;
  }

  private jump() {
    if (!this.stuck.length) return;
    const s = this.stuck[this.next++ % this.stuck.length];
    this.focused = `${s.x},${s.y}`;
    const p = this.world.cellToWorld(s.x, s.y);
    this.world.view.x = p.x;
    this.world.view.y = p.y;
    this.world.flashCell(s.x, s.y);
    this.onJump(s.x, s.y);
  }
}
