// Small line icons for the interface, drawn on a 24 x 24 grid in the
// current text colour. Swap any of them for painted icons later by name.

const paths: Record<string, string> = {
  dig: '<path d="M4 20 14 10"/><path d="M8.5 5.5c3-2 7.5-2 10 .5 2.5 2.5 2.5 7 .5 10-1-3.5-3-6-5-8s-4.5-4-5.5-2.5Z"/>',
  ladder: '<path d="M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10"/>',
  hearth: '<path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.5.8 2.5 2 2.5-.5-2.5 0-4.5 0-6.5Z"/><path d="M4 20h16M6 20l2-3h8l2 3"/>',
  mushroom: '<path d="M4 11a8 6 0 0 1 16 0Z"/><path d="M10 11v6a2 2 0 0 0 4 0v-6"/><path d="M4 20h16"/>',
  diffuser: '<rect x="7" y="9" width="10" height="11" rx="2"/><path d="M10 9V7h4v2"/><circle cx="10" cy="3.5" r="1.3"/><circle cx="14.5" cy="4.5" r="1"/>',
  cancel: '<path d="M6 6l12 12M18 6 6 18"/>',
  deconstruct: '<path d="M14 4h5l1 4-5 1Z"/><path d="M15 9 5 19a1.4 1.4 0 0 1-2-2L13 7"/><path d="M15 14l5 5M18 14l-3 3"/>',
  view: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
  oxygen: '<circle cx="9" cy="14" r="5"/><circle cx="16.5" cy="7.5" r="3"/>',
  co2: '<path d="M3 17c3-2 5 2 9 0s6-2 9 0"/><path d="M3 12c3-2 5 2 9 0s6-2 9 0"/>',
  heat: '<path d="M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z"/><path d="M12 10v6"/>',
  coal: '<path d="M4 15 8 8l5-2 6 4 1 6-5 3H8Z"/><path d="m8 8 3 5 9 0M11 13l-3 6"/>',
  food: '<path d="M5 11a7 5 0 0 1 14 0Z"/><path d="M10 11v5a2 2 0 0 0 4 0v-5"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.5A4.5 4.5 0 0 1 21 19"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"/>',
  warmth: '<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.5.8 2.5 2 2.5-.5-2.5 0-4.5 0-7Z"/>',
  breath: '<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/>',
  energy: '<path d="M13 2 5 13h6l-1 9 8-11h-6Z"/>',
  mood: '<circle cx="12" cy="12" r="9"/><path d="M8 14.5c2 2 6 2 8 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
  sleep: '<path d="M4 6h6l-6 7h6M14 12h5l-5 6h5"/>',
  lamp: '<path d="M9 3h6l1 3H8Z"/><path d="M8 6h8v8a4 4 0 0 1-8 0Z"/><path d="M12 10v3"/><path d="M10 18h4v3h-4Z"/>',
  bed: '<path d="M3 18V8"/><path d="M3 12h18v6"/><path d="M3 15h18"/><path d="M7 12V9h5a3 3 0 0 1 3 3"/>',
  shade: '<path d="M12 3c-3.5 0-6 3-6 7v6c1.5-1 2.5 1 4 0s2.5 1 4 0 2.5 1 4 0v-6c0-4-2.5-7-6-7Z"/><path d="M9.5 10h.01M14.5 10h.01"/>',
  depth: '<path d="M12 3v14"/><path d="m7 12 5 5 5-5"/><path d="M4 21h16"/>',
  stone: '<path d="M4 14 7 8l6-2 6 3 1 5-4 4H8Z"/><path d="m7 8 4 4 8-1M11 12l-3 7"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  priority: '<path d="M5 20v-5M12 20v-9M19 20V5"/>',
  alert: '<path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"/><path d="M12 10v4M12 17.5h.01"/>',
  skull: '<path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.2 4 3 5v3h8v-3c1.8-1 3-2.5 3-5a7 7 0 0 0-7-7Z"/><circle cx="9.5" cy="10.5" r="1.5"/><circle cx="14.5" cy="10.5" r="1.5"/>',
};

// Small icons get a heavier stroke so they still land on about 1.2 px on screen.
export function icon(name: string, size = 18) {
  const stroke = size <= 12 ? 2.4 : size <= 16 ? 2.1 : 1.8;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;
}
