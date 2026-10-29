// Messages between the main thread and the simulation worker.

export type Tool = 'dig' | 'cancel' | 'deconstruct' | 'priority' | 'ladder' | 'hearth' | 'mushroom' | 'lamp' | 'vent' | 'bed' | 'stockpile'
  | 'bench' | 'coke' | 'smelter' | 'crystal-lamp' | 'grate';

export type ToWorker =
  | { type: 'init'; seed: number; width: number; height: number; ticksPerSecond: number }
  | { type: 'command'; tool: Tool; x: number; y: number }
  /** Order any building by its Building number, e.g. Building.Lamp or Building.Bed. */
  | { type: 'build'; building: number; x: number; y: number }
  | { type: 'role'; colonist: number; role: number }
  /** Set the priority (1 to 9) of the order on a cell. */
  | { type: 'priority'; x: number; y: number; priority: number }
  /** Ticks per second as a multiple of the normal rate; 0 pauses. */
  | { type: 'speed'; speed: number }
  /** Study a Tech at the research bench, or nothing with -1. */
  | { type: 'research'; tech: number };

export interface Frame {
  type: 'frame';
  tick: number;
  hash: string;
  width: number;
  height: number;
  coal: number;
  stone: number;
  food: number;
  /** Iron ore, iron, crystal and coke in stock. */
  ore: number;
  iron: number;
  crystal: number;
  coke: number;
  /** One bit per Tech the colony knows. */
  known: number;
  /** The Tech being studied, or -1. */
  researching: number;
  /** Study banked towards each Tech, by number. */
  researchPoints: Int32Array;
  night: boolean;
  elements: Uint8Array;
  buildings: Uint8Array;
  light: Uint8Array;
  /** Hearth light only, 0..255; a survivor warms up where it is at least DARK_BELOW. */
  firelight: Uint8Array;
  /** Where hearth light will reach tonight if the fires stay fed. */
  nightFirelight: Uint8Array;
  hearthFuel: Int32Array;
  /** How much of each hearth's fuel is coke. */
  hearthClean: Int32Array;
  /** 1 where a hearth has an iron grate. */
  hearthGrate: Uint8Array;
  /** Priority each hearth's refuel errands get, by cell. */
  refuelPriority: Uint8Array;
  /** What lies loose on each cell (an Item number, 0 for nothing) and how much; see WebSim::pile_item. */
  pileItem: Uint8Array;
  pileAmount: Int32Array;
  temperature: Int32Array;
  /** Smoke per cell, 0..=255 (SMOKE_MAX in the sim); see WebSim::smoke. */
  smoke: Uint8Array;
  /** Flat, COLONIST_STRIDE each; see WebSim::colonists in crates/sim-wasm. */
  colonists: Int32Array;
  /** Flat, JOB_STRIDE each; see WebSim::jobs. */
  jobs: Int32Array;
  /** Flat, EVENT_STRIDE each (tick, kind, colonist), last 32, oldest first; see WebSim::events. */
  events: Int32Array;
  /** Flat, SHADE_STRIDE each (x, y, state: SHADE_DRIFTING or SHADE_ATTACKING); empty by day. See WebSim::shades. */
  shades: Int32Array;
}

export type FromWorker = Frame;

export const COLONIST_STRIDE = 15;
export const JOB_STRIDE = 8;
export const EVENT_STRIDE = 3;
export const SHADE_STRIDE = 3;
/** Event kinds, matching sim::EVENT_*. */
export const EVENT_DEATH = 1;
export const EVENT_SHADE_ATTACK = 2;
/** A building fell because its floor went; the event's colonist field is the Building number. */
export const EVENT_COLLAPSE = 3;
export const EVENT_ARRIVAL = 4;
export const EVENT_SMOKE = 5;
/** A study finished; the event's colonist field is the Tech number. */
export const EVENT_RESEARCH = 6;
/** A cell is smoky from this much smoke (SMOKY / SMOKE_MAX of 255). */
export const SMOKY = 102;
/** Shade states, matching sim::SHADE_*. */
export const SHADE_DRIFTING = 0;
export const SHADE_ATTACKING = 1;
/** Colonist.cause, the 13th colonist field; must match sim::CAUSE_*. */
export const CAUSES: Record<number, string> = { 1: 'froze to death', 2: 'was taken by a Shade' };
export const STAT_MAX = 10_000;
/** Must match DAY_TICKS in crates/sim/src/lib.rs. */
export const DAY_TICKS = 1200;
/** Ticks for a mushroom bed out of the firelight to grow a ration; must match MUSHROOM_TICKS in crates/sim/src/lib.rs. */
export const MUSHROOM_TICKS = 400;
/** Light below this counts as dark; must match DARK_BELOW in crates/sim/src/lib.rs. */
export const DARK_BELOW = 40;

// Mirror the enums in crates/sim/src/world.rs. Building 1 was the oxygen diffuser; the number stays unused.
export const Element = { Floor: 0, Dirt: 1, Rock: 2, Water: 3, Coal: 4, Iron: 5, Crystal: 6 } as const;
/** Whether an element is solid ground that can be dug. */
export const isSolid = (e: number) => e === Element.Dirt || e === Element.Rock || e === Element.Coal || e === Element.Iron || e === Element.Crystal;
export const Building = {
  None: 0, Vent: 1, Ladder: 2, Hearth: 3, MushroomBed: 4, Cairn: 5, Lamp: 6, Bed: 7, Stockpile: 8,
  ResearchBench: 9, CokeOven: 10, Smelter: 11, CrystalLamp: 12,
} as const;
/** Loose goods, matching sim::Item; 0 is nothing. The 14th and 15th colonist fields are what they carry and how much. */
export const Item = { Coal: 1, Stone: 2, Ore: 3, Crystal: 4 } as const;
export const ITEM_NAMES: Record<number, string> = { [Item.Coal]: 'coal', [Item.Stone]: 'stone', [Item.Ore]: 'iron ore', [Item.Crystal]: 'crystal' };
/** Most a survivor carries in one trip; must match CARRY_MAX in crates/sim/src/haul.rs. */
export const CARRY_MAX = 10;
export const ROLES = ['Digger', 'Builder', 'Firekeeper', 'Hauler', 'Researcher'] as const;
export const ACTIVITIES = ['Idle', 'Walking', 'Working', 'Sleeping', 'Eating', 'Dead'] as const;
export const JOB_NAMES = ['digging', 'building', 'refuelling a hearth', 'taking a building down', 'hauling goods', 'researching', 'refining', 'fitting a grate'] as const;
/** Job kinds, the third job field; must match JobKind::code in crates/sim/src/jobs.rs. */
export const JOB_DIG = 0, JOB_BUILD = 1, JOB_REFUEL = 2, JOB_DECONSTRUCT = 3, JOB_HAUL = 4, JOB_RESEARCH = 5, JOB_REFINE = 6, JOB_UPGRADE = 7;
/** Orders the colony raises itself, which the player can't cancel. */
export const COLONY_JOBS: number[] = [JOB_REFUEL, JOB_HAUL, JOB_RESEARCH, JOB_REFINE];
/** Order priorities, the seventh job field; must match DEFAULT_PRIORITY and MAX_PRIORITY in crates/sim/src/jobs.rs. */
export const DEFAULT_PRIORITY = 5, MAX_PRIORITY = 9;
/** Why an order is stuck, the eighth job field; must match the BLOCK_ values in crates/sim/src/orders.rs. */
export const BLOCK_NONE = 0, BLOCK_UNREACHABLE = 1, BLOCK_NO_COAL = 2, BLOCK_NO_STONE = 3, BLOCK_UNDER_BUILDING = 4, BLOCK_NO_HANDS = 5, BLOCK_NO_STOCKPILE = 6, BLOCK_NO_IRON = 7, BLOCK_NO_CRYSTAL = 8;
export const BLOCK_REASONS: Record<number, string> = {
  [BLOCK_UNREACHABLE]: "can't be reached",
  [BLOCK_NO_COAL]: 'needs more coal',
  [BLOCK_NO_STONE]: 'needs more stone',
  [BLOCK_UNDER_BUILDING]: 'is under a building nobody is taking down',
  [BLOCK_NO_HANDS]: 'has nobody free to do it',
  [BLOCK_NO_STOCKPILE]: 'has no stockpile to go to',
  [BLOCK_NO_IRON]: 'needs more iron',
  [BLOCK_NO_CRYSTAL]: 'needs more crystal',
};
/** What each building costs as [coal, stone]; must match build_cost in crates/sim/src/jobs.rs. */
export const BUILD_COST: Record<number, [number, number]> = {
  [Building.Hearth]: [8, 4],
  [Building.Lamp]: [2, 1],
  [Building.Vent]: [0, 3],
  [Building.Ladder]: [0, 1],
  [Building.MushroomBed]: [0, 2],
  [Building.Bed]: [0, 3],
  [Building.Stockpile]: [0, 2],
  [Building.ResearchBench]: [0, 4],
  [Building.CokeOven]: [0, 6],
  [Building.Smelter]: [0, 8],
  [Building.CrystalLamp]: [0, 1],
};
/** What a building costs in rarer goods as [iron, crystal]; must match rare_cost in crates/sim/src/jobs.rs. */
export const RARE_COST: Record<number, [number, number]> = { [Building.CrystalLamp]: [0, 2] };
export const HEARTH_COST = BUILD_COST[Building.Hearth][0];
/** Cells either side of its own a building's picture covers; must match reach in crates/sim/src/jobs.rs. */
export const REACH: Record<number, number> = {
  [Building.Hearth]: 1, [Building.MushroomBed]: 1, [Building.Stockpile]: 1, [Building.ResearchBench]: 1, [Building.Smelter]: 1,
};
/**
 * The cell of the building standing on (x, y), if (x, y) is its floor; ladders
 * need none. Mirrors held_up_by in crates/sim/src/jobs.rs, which refuses to
 * dig such a cell.
 */
export function heldUpBy(f: { width: number; buildings: Uint8Array }, x: number, y: number): number | undefined {
  if (y === 0) return undefined;
  for (const dx of [-1, 0, 1]) {
    const ox = x + dx;
    if (ox < 0 || ox >= f.width) continue;
    const b = f.buildings[(y - 1) * f.width + ox];
    if (b !== Building.None && b !== Building.Ladder && Math.abs(dx) <= (REACH[b] ?? 0)) return (y - 1) * f.width + ox;
  }
  return undefined;
}
export const LAMP_COST = BUILD_COST[Building.Lamp][0];
/** Fuel a full hearth holds, and ticks each unit burns for; must match HEARTH_CAPACITY and HEARTH_BURN_TICKS. */
export const HEARTH_CAPACITY = 40;
export const HEARTH_BURN_TICKS = 40;
/** How far hearth and lamp light reach by day and by night; must match LIGHT_RADIUS_* and LAMP_RADIUS_* in crates/sim/src/lib.rs. */
export const LIGHT_RADIUS_DAY = 13, LIGHT_RADIUS_NIGHT = 8, LAMP_RADIUS_DAY = 4, LAMP_RADIUS_NIGHT = 3;
/** How far a crystal lamp's light reaches; must match CRYSTAL_RADIUS_* in crates/sim/src/lib.rs. */
export const CRYSTAL_RADIUS_DAY = 8, CRYSTAL_RADIUS_NIGHT = 6;
/** A grated hearth's light reaches this much further, and burns a unit every GRATE_BURN_TICKS; see crates/sim/src/research.rs. */
export const GRATE_RADIUS = 2, GRATE_BURN_TICKS = 60, GRATE_IRON = 3;
/** Fuel units one coke gives a hearth; refineries never take coal below COAL_RESERVE. */
export const COKE_FUEL = 2, COAL_RESERVE = 16, COKE_KEEP = 20, IRON_KEEP = 10;

/** What can be researched, in sim::Tech order; costs and prerequisites must match crates/sim/src/research.rs. */
export interface TechInfo { name: string; icon: string; cost: number; needs?: number; unlocks: string; tool: Tool }
export const TECHS: TechInfo[] = [
  { name: 'Coking', icon: 'coke', cost: 900, tool: 'coke',
    unlocks: 'The <b>coke oven</b> bakes 3 coal into 2 coke. Coke burns twice as long as coal with half the smoke, and firekeepers use it first.' },
  { name: 'Smelting', icon: 'iron', cost: 1200, tool: 'smelter',
    unlocks: 'The <b>smelter</b> turns 2 iron ore and 1 coal into iron. Ore lies below the start cave.' },
  { name: 'Hearth grate', icon: 'grate', cost: 1500, needs: 1, tool: 'grate',
    unlocks: 'Fit a hearth with an <b>iron grate</b> for 3 iron: it burns a third less coal, its warmth reaches 2 cells further and it smokes half as much.' },
  { name: 'Crystal lens', icon: 'crystal-lamp', cost: 1400, needs: 0, tool: 'crystal-lamp',
    unlocks: 'The <b>crystal lamp</b> throws light twice as far as a lamp, for 2 crystal. Crystal is found deep in hard rock.' },
];
export const knows = (f: { known: number }, tech: number) => (f.known & (1 << tech)) !== 0;
