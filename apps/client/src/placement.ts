// Where a building can go, mirrored from room_for and fits in
// crates/sim/src/jobs.rs, so the build preview can say why before the sim
// quietly refuses the order.
import { BUILD_COST, Building, CRYSTAL_RADIUS_NIGHT, DRIP_REACH, Element, isSolid, JOB_BUILD, JOB_STRIDE, LAMP_RADIUS_NIGHT, LIGHT_RADIUS_NIGHT, PUMP_REACH, RARE_COST, REACH, TANK_CAPACITY, type Frame } from './protocol';

export const BUILDING_NAMES: Record<number, string> = {
  [Building.Ladder]: 'ladder', [Building.Hearth]: 'hearth', [Building.Stockpile]: 'stockpile', [Building.MushroomBed]: 'mushroom bed',
  [Building.Lamp]: 'lamp', [Building.Bed]: 'bed', [Building.Vent]: 'vent', [Building.Cairn]: 'cairn', [Building.Tile]: 'stone tile', [Building.Door]: 'door',
  [Building.ResearchBench]: 'research bench', [Building.CokeOven]: 'coke oven', [Building.Smelter]: 'smelter', [Building.CrystalLamp]: 'crystal lamp',
  [Building.Cistern]: 'cistern', [Building.WaterBarrel]: 'water barrel', [Building.DripCatcher]: 'drip catcher', [Building.HandPump]: 'hand pump',
};

/** 'ok' places now, 'wait' places but waits for coal or stone, 'bad' is refused. */
export type Fit = 'ok' | 'wait' | 'bad';
export interface Spot { x: number; y: number; fit: Fit; reason?: string; /** A remark on a spot that is placed, such as whether it is wet. */ note?: string }

const reach = (b: number) => REACH[b] ?? 0;
const open = (f: Frame, x: number, y: number) =>
  x >= 0 && y >= 0 && x < f.width && y < f.height && f.elements[y * f.width + x] === Element.Floor;
const water = (f: Frame, x: number, y: number) =>
  x >= 0 && y >= 0 && x < f.width && y < f.height && f.elements[y * f.width + x] === Element.Water;

/** Rock that weeps: solid natural ground with water above or beside it. Mirrors Sim::wet_rock in crates/sim/src/drip.rs. */
export function wetRock(f: Frame, x: number, y: number) {
  if (x < 0 || y < 0 || x >= f.width || y >= f.height) return false;
  const e = f.elements[y * f.width + x];
  return (e === Element.Dirt || e === Element.Rock || e === Element.Coal || e === Element.Iron || e === Element.Crystal) && (water(f, x, y - 1) || water(f, x - 1, y) || water(f, x + 1, y));
}
/** Whether a drip catcher at (x, y) would drip: some rock in the DRIP_REACH rows above is wet. */
export const dripSiteWet = (f: Frame, x: number, y: number) => Array.from({ length: DRIP_REACH }, (_, d) => d + 1).some((d) => wetRock(f, x, y - d));
/** Whether a hand pump at (x, y) has a pool beside it: left or right, on its row or the one below. */
export const poolBeside = (f: Frame, x: number, y: number) => water(f, x - 1, y) || water(f, x + 1, y) || water(f, x - 1, y + 1) || water(f, x + 1, y + 1);
/** Whether a barrel or cistern stands within PUMP_REACH cells along the row, one row up or down. */
export function tankNear(f: Frame, x: number, y: number) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -PUMP_REACH; dx <= PUMP_REACH; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < f.width && ny < f.height && TANK_CAPACITY[f.buildings[ny * f.width + nx]]) return true;
    }
  }
  return false;
}
const needsFloor = (b: number) => b !== Building.Ladder && b !== Building.Vent && b !== Building.Tile;

/**
 * Why `b` can't go at (x, y), or undefined if it can. `planned` holds builds
 * placed earlier in the same drag, which count like orders already given.
 */
export function refusal(f: Frame, x: number, y: number, b: number, planned: { x: number; y: number; b: number }[] = []): string | undefined {
  const name = BUILDING_NAMES[b];
  const w = f.width;
  if (f.elements[y * w + x] === Element.Water) return "Can't build in water.";
  if (!open(f, x, y)) return 'Solid ground. Dig it out first.';
  if (f.buildings[y * w + x] !== Building.None) return `There is already a ${BUILDING_NAMES[f.buildings[y * w + x]] ?? 'building'} here.`;
  const r = reach(b);
  for (let dx = -r; dx <= r; dx++) {
    if (!open(f, x + dx, y)) return `No room: a ${name} is ${2 * r + 1} cells wide.`;
  }
  if (needsFloor(b)) {
    for (let dx = -r; dx <= r; dx++) {
      const below = y + 1 < f.height ? f.elements[(y + 1) * w + x + dx] : Element.Floor;
      if (below === Element.Water) return `A ${name} can't stand in water.`;
      if (!isSolid(below)) return `Needs solid floor under ${r ? 'all of it' : 'it'}.`;
    }
  }
  // A door is two cells tall: its frame fills the cell above, and nothing goes into the top of a door.
  if (y + 1 < f.height && f.buildings[(y + 1) * w + x] === Building.Door) return "That is the top of a door.";
  if (b === Building.Door) {
    if (!open(f, x, y - 1)) return 'A door is two cells tall: it needs the cell above open too.';
    if (f.buildings[(y - 1) * w + x] !== Building.None) return `A door is two cells tall, and there is a ${BUILDING_NAMES[f.buildings[(y - 1) * w + x]] ?? 'building'} above.`;
    if (planned.some((o) => o.x === x && o.y === y - 1)) return 'A door is two cells tall: the cell above is taken.';
  }
  if (b === Building.HandPump) {
    if (!poolBeside(f, x, y)) return 'A hand pump stands on the bank of a pool: it needs water right beside it.';
    if (!tankNear(f, x, y)) return `A hand pump needs a cistern or the barrel within ${PUMP_REACH} cells.`;
  }
  const crowds = (ox: number, other: number) => other !== Building.None && ox !== x && Math.abs(ox - x) <= r + reach(other);
  for (let ox = Math.max(0, x - 3); ox <= Math.min(w - 1, x + 3); ox++) {
    const other = f.buildings[y * w + ox];
    if (crowds(ox, other)) return `Too close to the ${BUILDING_NAMES[other] ?? 'building'} beside it.`;
  }
  const orders = [...planned];
  for (let k = 0; k < f.jobs.length; k += JOB_STRIDE) {
    if (f.jobs[k + 2] === JOB_BUILD) orders.push({ x: f.jobs[k], y: f.jobs[k + 1], b: f.jobs[k + 3] });
  }
  for (const o of orders) {
    if (o.y !== y) continue;
    if (o.x === x) return 'Something is already ordered here.';
    if (crowds(o.x, o.b)) return `Too close to the ${BUILDING_NAMES[o.b] ?? 'building'} ordered beside it.`;
  }
  return undefined;
}

/**
 * Judge each cell of a placement in order, as the sim would take the orders.
 * Orders the stockpile can't cover yet are still placed and wait for stock.
 */
export function judge(f: Frame, b: number, cells: [number, number][]): Spot[] {
  const [coal, stone] = BUILD_COST[b] ?? [0, 0];
  const [iron, crystal] = RARE_COST[b] ?? [0, 0];
  const planned: { x: number; y: number; b: number }[] = [];
  return cells.map(([x, y]) => {
    const reason = refusal(f, x, y, b, planned);
    if (reason) return { x, y, fit: 'bad' as Fit, reason };
    planned.push({ x, y, b });
    const n = planned.length;
    const short = [coal * n > f.coal ? `${coal * n - f.coal} more coal` : '', stone * n > f.stone ? `${stone * n - f.stone} more stone` : '',
      iron * n > f.iron ? `${iron * n - f.iron} more iron` : '', crystal * n > f.crystal ? `${crystal * n - f.crystal} more crystal` : ''].filter(Boolean).join(' and ');
    const note = b === Building.DripCatcher ? (dripSiteWet(f, x, y) ? 'Wet rock above: it will drip.' : 'Dry: no wet rock above. Needs rock touching water within 3 cells overhead.') : undefined;
    return short ? { x, y, fit: 'wait' as Fit, reason: `Waits for ${short}.`, note } : { x, y, fit: 'ok' as Fit, note };
  });
}

/** How far a light source reaches at night, or 0 if it gives none. */
export function nightRadius(b: number) {
  return b === Building.Hearth ? LIGHT_RADIUS_NIGHT : b === Building.Lamp ? LAMP_RADIUS_NIGHT : b === Building.CrystalLamp ? CRYSTAL_RADIUS_NIGHT : 0;
}

/**
 * The cells new light would reach from `sources` and how bright, 0..1, by the
 * same breadth-first spread through open cells as flood_light in the sim.
 */
export function lightFrom(f: Frame, sources: number[], radius: number): Map<number, number> {
  const w = f.width;
  const dist = new Map<number, number>();
  const queue: number[] = [];
  for (const s of sources) { dist.set(s, 0); queue.push(s); }
  const lit = new Map<number, number>();
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    const d = dist.get(i)!;
    lit.set(i, Math.max(lit.get(i) ?? 0, (radius - d) / radius));
    const x = i % w, y = Math.floor(i / w);
    if (d >= radius || !open(f, x, y)) continue;
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= f.height) continue;
      const j = ny * w + nx;
      if ((dist.get(j) ?? Infinity) > d + 1) { dist.set(j, d + 1); queue.push(j); }
    }
  }
  return lit;
}

/** Cells along a drag from a to b: a straight column or row, whichever the drag follows more. */
export function line(a: [number, number], b: [number, number]): [number, number][] {
  const out: [number, number][] = [];
  if (Math.abs(b[1] - a[1]) >= Math.abs(b[0] - a[0])) {
    const step = Math.sign(b[1] - a[1]) || 1;
    for (let y = a[1]; y !== b[1] + step; y += step) out.push([a[0], y]);
  } else {
    const step = Math.sign(b[0] - a[0]);
    for (let x = a[0]; x !== b[0] + step; x += step) out.push([x, a[1]]);
  }
  return out;
}
