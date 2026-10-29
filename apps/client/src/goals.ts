import { Building, CISTERN_GOAL, COLONIST_STRIDE, DAY_TICKS, EVENT_SMOKE, EVENT_STRIDE, ROOM_BEDROOM, type Frame } from './protocol';
import { icon } from './icons';

type LogLine = (html: string, glyph: string, tone?: 'danger' | 'warn' | 'info') => void;

/** The five layers of the descent; each is a fifth of the rock below the start (see renderDepth in main.ts). */
const LAYER_COUNT = 5;
const STORE_KEY = 'hearthfall.goals';
const STONE_ENOUGH = 20;

/** Tools that stay off the toolbar until the colony is ready for them. */
interface Reveal {
  tools: string[];
  /** Whether the frame calls for it; `smoke` is true once the first smoke warning has been seen. */
  ready: (f: Frame, day: number, smoke: boolean) => boolean;
  /** The log line saying what the new orders are for; empty when the log already said it. */
  line: (smoke: boolean) => string;
  glyph: string;
}
const REVEALS: Reveal[] = [
  {
    tools: ['tile', 'door'], glyph: 'door', ready: (f, day) => day >= 2 || f.stone >= STONE_ENOUGH,
    line: () => 'New orders: <b>Tile</b> and <b>Door</b>, in <b>Build</b>. Wall a small space off to make a room: a bedroom, a mushroom cellar or a hearth room.',
  },
  {
    // The smoke warning already says what a vent is for.
    tools: ['vent'], glyph: 'vent', ready: (_f, day, smoke) => smoke || day >= 3,
    line: (smoke) => smoke ? '' : 'New order: <b>Vent</b>, in <b>Fire and light</b>. Fires smoke slowly; a vent clears it where it pools under the ceiling.',
  },
];

interface Goal {
  title: string;
  text: string;
  /** The tool to light up on the toolbar. */
  tool?: string;
  /** Checked against the frame each tick; `layer` is the deepest layer reached, `from` the layer when the goal began. */
  done: (f: Frame, layer: number, from: number) => boolean;
  /** A short progress readout shown in the card. */
  progress?: (f: Frame) => string;
}
const count = (f: Frame, b: number) => { let n = 0; for (let i = 0; i < f.buildings.length; i++) if (f.buildings[i] === b) n++; return n; };
const GOALS: Goal[] = [
  { title: 'Store 40 coal', tool: 'dig', text: 'Dig coal seams and haul it to the stockpile. Every fire, and every meal, runs on it.',
    done: (f) => f.coal >= 40, progress: (f) => `${f.coal} / 40 coal` },
  { title: 'Build a cistern and fill it to 40', tool: 'cistern', text: 'A <b>cistern</b> (in <b>Living</b>) holds drinking water. From day 2 haulers fill it with buckets from a pool they can reach, so dig towards one. Everyone drinks a portion a day.',
    done: (f) => count(f, Building.Cistern) > 0 && f.waterInCisterns >= CISTERN_GOAL,
    progress: (f) => count(f, Building.Cistern) > 0 ? `${f.waterInCisterns} / ${CISTERN_GOAL} water` : 'no cistern yet' },
  { title: 'Start a study', tool: 'bench', text: 'Build a <b>research bench</b> (in <b>Industry</b>) in the light, then open Research and pick something to study.',
    done: (f) => count(f, Building.ResearchBench) > 0 && (f.researching >= 0 || f.known !== 0) },
  { title: 'Wall off a bedroom', tool: 'door', text: 'Close a small space off with <b>tiles</b> and a <b>door</b>, then put a bed inside. Bedrooms give the best sleep.',
    done: (f) => f.rooms.includes(ROOM_BEDROOM) },
  { title: 'Grow food', tool: 'mushroom', text: 'Place <b>two mushroom beds</b> out of the firelight. A lamp keeps Shades off the farm.',
    done: (f) => count(f, Building.MushroomBed) >= 2, progress: (f) => `${Math.min(2, count(f, Building.MushroomBed))} / 2 beds` },
  { title: 'Reach the next layer', tool: 'ladder', text: 'Dig down and build ladders. The deeper caves hold iron, crystal and more room.',
    done: (_f, layer, from) => layer > from },
];

/**
 * Progression that unfolds: the toolbar starts small and reveals tools as the
 * colony is ready for them, and once the tutorial ends a "Next" card sets one
 * goal at a time. Everything is read from the frame; nothing here touches the sim.
 */
export class Goals {
  private shown = new Set<Reveal>();
  private lastEvent = -1;
  private smoke = false;
  private deepestCell = 0;
  private goal = (() => { try { return localStorage.getItem(STORE_KEY) === 'done' ? GOALS.length : 0; } catch { return 0; } })();
  /** The layer the player stood in when the current goal began, for "reach the next layer". */
  private from = -1;
  private drawn = '';
  private closing = false;

  constructor(private card: HTMLElement, private log: LogLine) {
    for (const r of REVEALS) for (const t of r.tools) this.button(t).hidden = true;
  }

  private button(tool: string) { return document.querySelector<HTMLElement>(`[data-tool="${tool}"]`)!; }

  /** `settled` is true once the tutorial is out of the way. */
  update(f: Frame, settled: boolean) {
    const day = Math.floor(f.tick / DAY_TICKS) + 1;
    for (let i = 0; i < f.events.length; i += EVENT_STRIDE) {
      if (f.events[i] > this.lastEvent) {
        this.lastEvent = f.events[i];
        if (f.events[i + 1] === EVENT_SMOKE) this.smoke = true;
      }
    }
    for (const r of REVEALS) if (!this.shown.has(r) && r.ready(f, day, this.smoke)) this.reveal(r);
    const layer = this.layer(f);
    if (settled) this.next(f, layer);
  }

  private reveal(r: Reveal) {
    this.shown.add(r);
    for (const t of r.tools) {
      const b = this.button(t);
      b.hidden = false;
      b.classList.add('reveal');
      const clear = () => b.classList.remove('reveal');
      b.addEventListener('click', clear, { once: true });
      setTimeout(clear, 30_000);
    }
    const text = r.line(this.smoke);
    if (text) this.log(text, r.glyph, 'info');
  }

  /** The deepest layer any living survivor has stood in. */
  private layer(f: Frame) {
    const startY = Math.floor(f.height / 2);
    for (let i = 0; i < f.colonists.length; i += COLONIST_STRIDE) {
      if (f.colonists[i + 3] !== 5) this.deepestCell = Math.max(this.deepestCell, f.colonists[i + 1] - startY);
    }
    const perLayer = (f.height - startY - 2) / LAYER_COUNT;
    return Math.min(Math.floor(this.deepestCell / perLayer), LAYER_COUNT - 1);
  }

  private unpulse() { document.querySelectorAll('.tool.goal-pulse').forEach((b) => b.classList.remove('goal-pulse')); }

  private next(f: Frame, layer: number): void {
    if (this.closing) return;
    if (this.goal >= GOALS.length) { this.card.hidden = true; return; }
    if (this.from < 0) this.from = layer;
    const g = GOALS[this.goal];
    if (g.done(f, layer, this.from)) {
      this.log(`Goal done: <b>${g.title}</b>.`, 'mood', 'info');
      this.goal++;
      this.from = layer;
      this.drawn = '';
      if (this.goal >= GOALS.length) return this.finish();
      return this.next(f, layer);
    }
    const progress = g.progress?.(f) ?? '';
    const key = `${this.goal}|${progress}`;
    if (key === this.drawn) return;
    this.drawn = key;
    this.unpulse();
    if (g.tool) document.querySelector(`[data-tool="${g.tool}"]:not([hidden])`)?.classList.add('goal-pulse');
    this.card.innerHTML =
      `<small>Next · ${this.goal + 1} of ${GOALS.length}</small>` +
      `<p><b>${g.title}.</b> ${g.text}${progress ? ` <span class="progress">${progress}</span>` : ''}</p>` +
      '<button class="quiet" id="skip-goals">Skip</button>';
    this.card.hidden = false;
    document.getElementById('skip-goals')!.onclick = () => this.end();
  }

  private finish() {
    this.closing = true;
    this.unpulse();
    this.card.innerHTML = `<small>Next</small><p><b>The colony has taken root.</b> ${icon('depth', 14)} The Deep Hearth is still below. What you build next is up to you.</p>`;
    this.card.hidden = false;
    setTimeout(() => this.end(), 8000);
  }

  private end() {
    this.goal = GOALS.length;
    this.closing = false;
    this.card.hidden = true;
    this.unpulse();
    try { localStorage.setItem(STORE_KEY, 'done'); } catch { /* private mode */ }
  }
}
