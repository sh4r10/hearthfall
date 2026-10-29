// Who the survivors are, and the screens for managing them as the colony
// grows, after Oxygen Not Included: a compact roster down the right edge, a
// card for each stranger who asks to join, and one Colony screen of tables
// (vitals, errands, skills) instead of a stack of big cards.

import {
  ACTIVITIES, C_COLD_AT, C_EAGER, C_EXPECT, C_KNACK, C_LEVEL, C_MEAL, C_MORALE, C_PARTS, C_PREF, C_PROGRESS, C_TRAITS, C_WHO, CAST, COLONIST_STRIDE, DAY_TICKS,
  MAX_LEVEL, MEAL_NAMES, MORALE_PARTS, PREF_HIGH, PREF_NAMES, PREF_OFF, ROLES, SKILLS, STAT_MAX, TRAITS, type Frame, type ToWorker,
} from './protocol';
import { artUrl } from './art';
import { icon } from './icons';
import { NEEDS, doing, needBar } from './inspect';

const $ = (id: string) => document.getElementById(id)!;
const NIGHT_AT = (DAY_TICKS * 6) / 10;

export const row = (f: Frame, i: number) => f.colonists.subarray(i * COLONIST_STRIDE, (i + 1) * COLONIST_STRIDE);
export const count = (f: Frame) => f.colonists.length / COLONIST_STRIDE;
export const nameOf = (c: ArrayLike<number>) => CAST[c[C_WHO]] ?? 'Someone';
/** The name of colonist `i` in the frame. */
export const nameAt = (f: Frame, i: number) => nameOf(row(f, i));
const dead = (c: ArrayLike<number>) => ACTIVITIES[c[3]] === 'Dead';

export function portrait(c: ArrayLike<number>, size: number) {
  const url = artUrl(`survivor-${c[C_WHO]}-portrait`);
  return `<span class="portrait" style="width:${size}px;height:${size}px;${url ? `background-image:url(${url})` : ''}"></span>`;
}

/** Their traits as small chips: ice blue for good, amber for bad, each with what it does. */
export function traitChips(bits: number) {
  return TRAITS.filter((t) => bits & t.bit).map((t) => `<span class="trait ${t.good ? 'good' : 'bad'}" data-tip="<b>${t.name}</b>${t.does}">${t.name}</span>`).join('');
}

/** Their temperament, rolled when they appeared, in plain words. */
export function temperament(c: ArrayLike<number>) {
  const out: string[] = [];
  if (c[C_COLD_AT] < 3600) out.push('Bold: stays out in the cold longer');
  else if (c[C_COLD_AT] > 4400) out.push('Cautious: heads for the fire early');
  if (c[C_EAGER] <= 8) out.push('Eager: quick to pick up work');
  else if (c[C_EAGER] >= 12) out.push('Unhurried: slow to pick up work');
  return out.length ? out.join('. ') + '.' : 'Even-tempered.';
}

/** One skill as a level and a thin bar towards the next, with a star on their knack. */
export function skillCell(c: ArrayLike<number>, k: number) {
  const lvl = c[C_LEVEL + k], pct = lvl >= MAX_LEVEL ? 100 : c[C_PROGRESS + k];
  const knack = c[C_KNACK] === k;
  return `<span class="skill${knack ? ' knack' : ''}" data-tip="<b>${SKILLS[k].name} ${lvl}</b>${knack ? 'Their knack: they learn it fastest and enjoy it. ' : ''}${lvl >= MAX_LEVEL ? 'Mastered.' : `${pct}% of the way to ${lvl + 1}. It grows with use.`}">` +
    `<b>${lvl}</b>${knack ? '<i class="star">★</i>' : ''}<i class="bar"><i style="width:${pct}%"></i></i></span>`;
}

/** Morale against expectations, with what it is made of. */
export function moraleBlock(c: ArrayLike<number>) {
  const morale = c[C_MORALE], expect = c[C_EXPECT];
  const tone = morale < expect ? 'low' : '';
  const parts = MORALE_PARTS.map((name, k) => [name, c[C_PARTS + k]] as const).filter(([, v]) => v !== 0)
    .map(([name, v]) => `<div class="row"><span>${name}${name === 'Food' ? ` (${MEAL_NAMES[c[C_MEAL]]})` : ''}</span><b class="${v < 0 ? 'neg' : 'pos'}">${v > 0 ? '+' : ''}${v}</b></div>`).join('');
  return `<div class="row morale ${tone}"><span>Morale / expects</span><b>${morale} / ${expect}</b></div>${parts}` +
    `<p class="note">Mood rises while morale meets what they expect, and sinks when it falls short. Skilled survivors expect more.</p>`;
}

// --- Roster ------------------------------------------------------------------------

/**
 * The compact roster down the right edge: one slim row per survivor with their
 * portrait, name, what they are doing, a mood bar and an alert when a need is
 * low. Clicking a row finds and inspects them. Everything else lives in the
 * Colony screen, so it stays readable at six.
 */
export class Roster {
  private readonly box = $('roster');

  constructor(private onPick: (i: number) => void) {
    this.box.addEventListener('click', (e) => {
      const r = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
      if (r) this.onPick(Number(r.dataset.i));
    });
  }

  update(f: Frame) {
    const n = count(f);
    if (this.box.childElementCount !== n) {
      this.box.innerHTML = Array.from({ length: n }, (_, i) => {
        const c = row(f, i);
        return `<button class="survivor" data-i="${i}">${portrait(c, 30)}<span class="who"><b>${nameOf(c)}</b><span class="doing"></span></span><span class="alert-dot"></span><i class="mood-bar"><i></i></i></button>`;
      }).join('');
    }
    this.box.querySelectorAll<HTMLElement>('.survivor').forEach((el, i) => {
      const c = row(f, i);
      const gone = dead(c);
      const low = NEEDS.filter(([, o]) => c[o] < STAT_MAX / 4).map(([label]) => label);
      el.classList.toggle('dead', gone);
      el.classList.toggle('struggling', !gone && low.length > 0);
      el.querySelector('.doing')!.textContent = doing(c, f);
      const mood = Math.round((c[7] / STAT_MAX) * 100);
      const bar = el.querySelector<HTMLElement>('.mood-bar > i')!;
      bar.style.width = `${gone ? 0 : mood}%`;
      bar.className = mood < 25 ? 'bad' : mood < 50 ? 'low' : '';
      el.dataset.tip = gone ? `<b>${nameOf(c)}</b>${doing(c, f)}` :
        `<b>${nameOf(c)} · ${ROLES[c[2]]}</b>Mood ${mood}%, morale ${c[C_MORALE]} against ${c[C_EXPECT]} expected.${low.length ? `<em>Low: ${low.join(', ').toLowerCase()}.</em>` : ''} Click to find them.`;
    });
  }
}

// --- Strangers ----------------------------------------------------------------------

/**
 * A card that appears when a stranger waits at the edge of the light: who they
 * are, their knack, traits, temperament and skills, and two buttons. They
 * leave at nightfall if nobody answers.
 */
export class StrangerCard {
  private readonly box = $('stranger');
  private key = '';

  constructor(private send: (msg: ToWorker) => void, private tps: number) {
    this.box.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-answer]');
      if (!b) return;
      this.send({ type: 'answer', accept: b.dataset.answer === 'yes' });
      this.box.hidden = true;
      this.key = '';
    });
  }

  update(f: Frame) {
    const c = f.stranger;
    if (!c.length) { this.box.hidden = true; this.key = ''; return; }
    const left = Math.max(0, Math.ceil((NIGHT_AT - (f.tick % DAY_TICKS)) / this.tps));
    const knack = c[C_KNACK];
    const html = `<header>${portrait(c, 52)}<div><small>At the edge of the light</small><h3>${nameOf(c)}</h3><span class="muted">Good at ${SKILLS[knack].name.toLowerCase()} · would start as ${ROLES[c[2]]}</span></div></header>` +
      `<div class="traits">${traitChips(c[C_TRAITS])}</div>` +
      `<p class="muted temper">${temperament(c)}</p>` +
      `<div class="skills">${SKILLS.map((s, k) => `<div>${icon(s.icon, 14)}<span>${s.name}</span>${skillCell(c, k)}</div>`).join('')}</div>` +
      `<p class="note">Another mouth to feed and a bed to fill, but more hands. They leave at nightfall, in <b class="left">${left}s</b>.</p>` +
      `<div class="actions"><button class="primary" data-answer="yes">Take them in</button><button class="quiet" data-answer="no">Turn away</button></div>`;
    const key = html.replace(/<b class="left">\d+s<\/b>/, '');
    if (key !== this.key) { this.key = key; this.box.innerHTML = html; }
    else this.box.querySelector('.left')!.textContent = `${left}s`;
    this.box.hidden = false;
  }
}

// --- Colony screen ------------------------------------------------------------------

type Tab = 'vitals' | 'errands' | 'skills';
const TABS: { tab: Tab; label: string; tip: string }[] = [
  { tab: 'vitals', label: 'Vitals', tip: 'Every need, mood and morale at a glance.' },
  { tab: 'errands', label: 'Errands', tip: 'Who does what. Survivors take the errands they are keenest on first.' },
  { tab: 'skills', label: 'Skills', tip: 'Skills, knacks, traits and temperament.' },
];

/**
 * The Colony screen (C): one table per tab, a row per survivor, so managing
 * six reads like a spreadsheet rather than six cards.
 */
export class ColonyScreen {
  private readonly box = $('colony');
  private tab: Tab = 'vitals';
  private key = '';
  private last: Frame | undefined;

  constructor(private send: (msg: ToWorker) => void, private onPick: (i: number) => void) {
    $('colony-open').onclick = () => this.toggle();
    this.box.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const b = t.closest<HTMLElement>('[data-tab],[data-pref],[data-col],[data-close],[data-pick]');
      if (!b) return;
      if (b.dataset.close !== undefined) return this.toggle(false);
      if (b.dataset.tab) { this.tab = b.dataset.tab as Tab; this.key = ''; }
      if (b.dataset.pick) this.onPick(Number(b.dataset.pick));
      if (b.dataset.pref && this.last) {
        // Click steps up, shift-click steps down, as in ONI's priority grid.
        const [i, k] = b.dataset.pref.split(',').map(Number);
        const now = row(this.last, i)[C_PREF + k];
        this.setPref(i, k, (now + ((e as MouseEvent).shiftKey ? 3 : 1)) % 4);
      }
      if (b.dataset.col && this.last) {
        // A column header sets everyone alive to one step above the lowest there.
        const k = Number(b.dataset.col);
        const alive = Array.from({ length: count(this.last) }, (_, i) => i).filter((i) => !dead(row(this.last!, i)));
        const all = alive.map((i) => row(this.last!, i)[C_PREF + k]);
        const next = all.every((p) => p === PREF_HIGH) ? PREF_OFF : Math.min(...all) + 1;
        alive.forEach((i) => this.setPref(i, k, next));
      }
      if (this.last) this.update(this.last);
    });
    this.box.addEventListener('change', (e) => {
      const sel = e.target as HTMLSelectElement;
      if (sel.dataset.role) this.send({ type: 'role', colonist: Number(sel.dataset.role), role: Number(sel.value) });
    });
  }

  private setPref(i: number, k: number, pref: number) {
    this.send({ type: 'pref', colonist: i, skill: k, pref });
    if (this.last) this.last.colonists[i * COLONIST_STRIDE + C_PREF + k] = pref; // shows at once; the sim agrees next frame
  }

  get open() {
    return !this.box.hidden;
  }

  toggle(on: boolean = this.box.hidden === true) {
    this.box.hidden = !on;
    $('colony-open').classList.toggle('active', on);
    this.key = '';
    if (on && this.last) this.update(this.last);
  }

  update(f: Frame) {
    this.last = f;
    if (this.box.hidden) return;
    const n = count(f);
    const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => Number(dead(row(f, a))) - Number(dead(row(f, b))));
    const who = (i: number) => {
      const c = row(f, i);
      return `<td class="name"><button data-pick="${i}">${portrait(c, 24)}<b>${nameOf(c)}</b></button></td>`;
    };
    let head = '', body = '';
    if (this.tab === 'vitals') {
      head = `<th>Survivor</th><th class="wide">Doing</th>${NEEDS.map(([label, , name]) => `<th>${icon(name, 14)}<span>${label}</span></th>`).join('')}<th data-tip="<b>Morale / expectations</b>Mood rises while morale meets what they expect.">Morale</th>`;
      body = order.map((i) => {
        const c = row(f, i);
        const gone = dead(c);
        return `<tr class="${gone ? 'dead' : ''}">${who(i)}<td class="wide muted">${doing(c, f)}</td>` +
          NEEDS.map(([label, o, name]) => `<td>${gone ? '' : needBar(label, c[o], name)}</td>`).join('') +
          `<td class="${c[C_MORALE] < c[C_EXPECT] ? 'warn' : ''}">${gone ? '' : `${c[C_MORALE]} / ${c[C_EXPECT]}`}</td></tr>`;
      }).join('');
    } else if (this.tab === 'errands') {
      head = `<th>Survivor</th><th>Role</th>${SKILLS.map((s, k) => `<th><button data-col="${k}" data-tip="<b>${s.name}</b>${s.errands}. Click to raise it for everyone.">${icon(s.icon, 14)}<span>${s.name}</span></button></th>`).join('')}`;
      body = order.map((i) => {
        const c = row(f, i);
        if (dead(c)) return `<tr class="dead">${who(i)}<td colspan="${SKILLS.length + 1}" class="muted">${doing(c, f)}</td></tr>`;
        const role = `<select data-role="${i}" aria-label="Role for ${nameOf(c)}">${ROLES.map((r, k) => `<option value="${k}"${k === c[2] ? ' selected' : ''}>${r}</option>`).join('')}</select>`;
        return `<tr>${who(i)}<td>${role}</td>${SKILLS.map((_, k) => {
          const p = c[C_PREF + k];
          return `<td><button class="pref p${p}" data-pref="${i},${k}" aria-label="${SKILLS[k].name}: ${PREF_NAMES[p]}">${PREF_NAMES[p]}</button></td>`;
        }).join('')}</tr>`;
      }).join('');
    } else {
      head = `<th>Survivor</th>${SKILLS.map((s) => `<th>${icon(s.icon, 14)}<span>${s.name}</span></th>`).join('')}<th class="wide">Traits</th>`;
      body = order.map((i) => {
        const c = row(f, i);
        return `<tr class="${dead(c) ? 'dead' : ''}">${who(i)}${SKILLS.map((_, k) => `<td>${skillCell(c, k)}</td>`).join('')}` +
          `<td class="wide"><div class="traits">${traitChips(c[C_TRAITS])}</div><small class="muted">${temperament(c)}</small></td></tr>`;
      }).join('');
    }
    const foot = this.tab === 'errands'
      ? 'Click a cell to make them keener, shift-click to make them less keen. <b>Off</b> means never. Survivors take the errands they are keenest on first, then the most urgent order. Specialists in the matching role work faster.'
      : this.tab === 'skills' ? 'Skills grow with use, fastest at a survivor\'s knack (★). Each level makes them faster at those errands, and a little harder to please.'
      : 'Mood drifts towards how morale measures up to what they expect. Low mood slows work, and a miserable survivor only tends the fire.';
    const html = `<header>${icon('people', 18)}<b>Colony</b><nav>${TABS.map((t) => `<button data-tab="${t.tab}" class="${t.tab === this.tab ? 'active' : ''}" data-tip="<b>${t.label}</b>${t.tip}">${t.label}</button>`).join('')}</nav>` +
      `<span class="muted">${n} of ${CAST.length}</span><button class="close" data-close aria-label="Close">${icon('cancel', 14)}</button></header>` +
      `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><p class="note">${foot}</p>`;
    // Only touch the DOM when something changed, so buttons and menus stay usable.
    if (html !== this.key && !(document.activeElement instanceof HTMLSelectElement && this.box.contains(document.activeElement))) {
      this.key = html;
      this.box.innerHTML = html;
    }
  }
}

