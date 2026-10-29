// The research panel: what the colony knows, what it is studying, and what
// to study next. A button in the top bar shows progress and opens it.

import { Building, knows, TECHS, type Frame, type ToWorker } from './protocol';
import { icon } from './icons';

const $ = (id: string) => document.getElementById(id)!;

export class ResearchPanel {
  private readonly button = $('research');
  private readonly panel = $('research-panel');
  /** What the panel was last drawn from, so it only redraws on a change. */
  private drawn = '';

  constructor(private send: (msg: ToWorker) => void) {
    this.button.onclick = () => this.toggle();
  }

  toggle(open = this.panel.hidden) {
    this.panel.hidden = !open;
    this.button.classList.toggle('active', open);
    this.drawn = '';
  }

  update(f: Frame) {
    const t = f.researching;
    const bench = f.buildings.includes(Building.ResearchBench);
    const percent = (k: number) => Math.min(100, Math.floor((f.researchPoints[k] * 100) / TECHS[k].cost));
    this.button.innerHTML = `${icon('research', 18)}<div><span>Research</span><b>${
      t >= 0 ? `${TECHS[t].name} ${percent(t)}%` : TECHS.every((_, k) => knows(f, k)) ? 'All known' : bench ? 'Pick a study' : 'Build a bench'}</b></div>`;
    this.button.classList.toggle('idle', t < 0 && bench && !TECHS.every((_, k) => knows(f, k)));
    if (this.panel.hidden) return;
    const key = `${f.known}|${t}|${bench}|${t >= 0 ? percent(t) : ''}`;
    if (key === this.drawn) return;
    this.drawn = key;
    const cards = TECHS.map((tech, k) => {
      const known = knows(f, k);
      const ready = !known && (tech.needs === undefined || knows(f, tech.needs));
      const studying = t === k;
      const state = known ? '<span class="state known">Known</span>'
        : studying ? `<button class="quiet" data-tech="-1">Stop</button>`
        : ready ? `<button class="primary" data-tech="${k}">Study</button>`
        : `<span class="state">Needs ${TECHS[tech.needs!].name}</span>`;
      const meter = known ? '' : `<div class="meter"><i><b style="width:${percent(k)}%"></b></i><span>${f.researchPoints[k]} / ${tech.cost}</span></div>`;
      return `<article class="tech${known ? ' known' : ''}${studying ? ' studying' : ''}${!known && !ready ? ' locked' : ''}">
        <header>${icon(tech.icon, 22)}<b>${tech.name}</b>${state}</header>
        <p>${tech.unlocks}</p>${meter}</article>`;
    }).join('');
    const note = bench ? 'A survivor studies at the bench between other work. A Researcher studies fastest.'
      : 'Build a <b>research bench</b> (key B) inside the light first.';
    this.panel.innerHTML = `<header><b>Research</b><span>Fire and forge</span><button class="close quiet" aria-label="Close">${icon('cancel', 14)}</button></header>
      <p class="note">${note}</p>${cards}`;
    this.panel.querySelector<HTMLButtonElement>('.close')!.onclick = () => this.toggle(false);
    this.panel.querySelectorAll<HTMLButtonElement>('[data-tech]').forEach((b) => (b.onclick = () => {
      this.send({ type: 'research', tech: Number(b.dataset.tech) });
      this.drawn = '';
    }));
  }
}
